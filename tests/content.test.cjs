const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const source = fs.readFileSync(path.join(__dirname, '../scripts/content.js'), 'utf8')

// Exercise the real content script with deterministic timers and a small page fixture.
// Button clicks are recorded locally; this harness never connects to the bidding site.
function createPage({ ownPrice = 200, lowestPrice = 105 } = {}) {
  let now = 0
  let nextTimerId = 0
  const timers = new Map()
  const observers = []
  const submissions = []
  const inputEvents = []
  const inputSnapshots = []
  const input = {
    value: '',
    isConnected: true,
    focus() {},
    blur() { inputEvents.push('blur') },
    dispatchEvent(event) {
      inputEvents.push(event.type)
      inputSnapshots.push({ type: event.type, value: this.value, at: now })
    },
  }
  const submitButton = {
    isConnected: true,
    disabled: false,
    click() { submissions.push({ value: input.value, events: [...inputEvents] }) },
  }
  const bidRegion = { querySelector: (selector) => selector === 'input' ? input : submitButton }
  const ownPriceNode = { textContent: String(ownPrice) }
  const ownLabel = {
    textContent: 'Giá của bạn hiện tại',
    nextElementSibling: ownPriceNode,
    parentNode: { parentNode: bidRegion },
  }
  const lowestPriceNode = { textContent: String(lowestPrice) }
  const countdownNode = {
    querySelectorAll: () => [0, 0, 1, 0].map((number) => ({
      querySelector: () => ({ textContent: String(number) }),
    })),
  }
  const controls = {
    autoBiddingPanel: {}, // The panel already exists, so its initialization timer is a no-op.
    counterBiddingBtn: { style: {} },
    minPriceInput: { value: '' },
    countdownInput: { value: '' },
    biddingStatus: { style: {} },
  }
  const body = {}
  const context = vm.createContext({
    console: { log() {}, error() {} },
    alert(message) { throw new Error(message) },
    Event: class { constructor(type) { this.type = type } },
    KeyboardEvent: class { constructor(type) { this.type = type } },
    Node: { ELEMENT_NODE: 1 },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this) }
      observe(target) { this.targets.add(target) }
      disconnect() { this.targets.clear() }
    },
    setTimeout(callback, delay) {
      const id = ++nextTimerId
      timers.set(id, { callback, at: now + delay })
      return id
    },
    clearTimeout(id) { timers.delete(id) },
    document: {
      body,
      getElementById: (id) => controls[id] || null,
      querySelectorAll(selector) {
        if (selector === 'span') return [
          { textContent: 'Bước giá :', querySelector: () => ({ textContent: '10 VND' }) },
          ownLabel,
        ]
        if (selector === 'label.fontWeight500') return [{
          textContent: 'Giá thấp nhất hiện tại',
          nextElementSibling: { nextElementSibling: lowestPriceNode },
        }]
        if (selector === 'b') return [{ textContent: 'Thời gian còn lại:', parentElement: countdownNode }]
        return []
      },
    },
  })
  vm.runInContext(source, context)

  function notify(target, records) {
    for (const observer of [...observers]) {
      if (observer.targets.has(target)) observer.callback(records)
    }
  }

  return {
    input, inputSnapshots, submissions, controls, ownPriceNode,
    toggle() { vm.runInContext('toggleCounterBidding()', context) },
    priceChanged(price, count = 1) {
      lowestPriceNode.textContent = String(price)
      notify(lowestPriceNode, Array.from({ length: count }, (_, i) => ({
        type: i % 2 ? 'characterData' : 'childList', addedNodes: [],
      })))
    },
    advance(milliseconds) {
      const end = now + milliseconds
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= end)
          .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0]
        if (!next) break
        const [id, timer] = next
        timers.delete(id)
        now = timer.at
        timer.callback()
      }
      now = end
    },
  }
}

test('two price mutations cannot overlap typing or schedule duplicate submits', () => {
  const page = createPage({ ownPrice: 105 })
  page.toggle()
  page.ownPriceNode.textContent = '200'
  page.priceChanged(105, 2)
  page.advance(200)
  assert.equal(page.input.value, '95')
  assert.deepEqual(page.submissions.map((submission) => submission.value), ['95'])
})

test('preserves the original two phases, events, and 100 ms submit delay', () => {
  const page = createPage()
  page.toggle()
  assert.equal(page.input.value, '9')
  page.advance(49)
  assert.equal(page.input.value, '9')
  assert.equal(page.submissions.length, 0)
  page.advance(1)
  assert.equal(page.input.value, '95')
  assert.deepEqual(page.inputSnapshots.filter((event) => event.type === 'input'), [
    { type: 'input', value: '9', at: 0 },
    { type: 'input', value: '95', at: 50 },
  ])
  page.advance(49)
  assert.equal(page.submissions.length, 0)
  page.advance(1)
  assert.deepEqual(page.inputSnapshots, [
    { type: 'input', value: '9', at: 0 },
    { type: 'keydown', value: '95', at: 50 },
    { type: 'input', value: '95', at: 50 },
    { type: 'change', value: '95', at: 100 },
  ])
  assert.deepEqual(page.submissions.map((submission) => submission.value), ['95'])
})

test('initial typing stays locked across separate price updates in both phases', () => {
  const page = createPage()
  page.toggle()
  page.advance(25)
  page.priceChanged(100)
  assert.equal(page.input.value, '9')
  page.advance(50)
  page.priceChanged(85, 2)
  assert.equal(page.input.value, '95')
  page.advance(125)
  assert.deepEqual(page.submissions.map((submission) => submission.value), ['95'])
})

test('lock releases after typing without waiting for confirmation or replaying skipped updates', () => {
  const page = createPage()
  page.toggle()
  page.advance(25)
  page.priceChanged(100)
  page.advance(175)
  assert.deepEqual(page.submissions.map((submission) => submission.value), ['95'])
  // A fresh update after typing may start immediately, even without any dialogs.
  page.priceChanged(85)
  assert.equal(page.input.value, '7')
  page.advance(100)
  assert.deepEqual(page.submissions.map((submission) => submission.value), ['95', '75'])
})
