function counterBidding(price) {
  console.log('Counter bidding with price:', price)

  // Get the step price (Bước giá)
  const stepPriceElement = Array.from(document.querySelectorAll('span')).find(span => 
    span.textContent.includes('Bước giá :'))?.querySelector('span')
  
  if (stepPriceElement) {
    const stepPriceText = stepPriceElement.textContent
    const stepPrice = parseInt(stepPriceText.replace(/[^\d]/g, ''))
    
    console.log('Step price (Bước giá):', stepPriceText, '=', stepPrice)
    
    // Calculate counter price = current lowest price - step price
    const counterPrice = price - stepPrice
    
    console.log('Calculated counter price:', counterPrice)
    console.log('Formula: Current price (' + price + ') - Step price (' + stepPrice + ') = ' + counterPrice)
    
    // Find the input element by using "Giá của bạn hiện tại" context
    const currentPriceLabel = Array.from(document.querySelectorAll('span')).find(span => 
      span.textContent.includes('Giá của bạn hiện tại'))
    
    const inputElement = currentPriceLabel?.parentNode?.parentNode?.querySelector('input')
    
    if (inputElement) {
      // Format counter price with Vietnamese number format (999.999.999,0)
      const formattedCounterPrice = formatVietnameseNumber(counterPrice)
      inputElement.value = formattedCounterPrice
      console.log('Filled input with formatted counter price:', formattedCounterPrice, '(raw:', counterPrice + ')')

      // Trigger input events to notify Angular/React frameworks
      inputElement.dispatchEvent(new Event('input', { bubbles: true }))
      inputElement.dispatchEvent(new Event('change', { bubbles: true }))

      // Only auto-click if counter bidding is enabled
      if (isCounterBiddingEnabled) {
        // Find and click the "chào giá" button using the same context method
        const chaoGiaButton = currentPriceLabel?.parentNode?.parentNode?.querySelector('button')

        if (chaoGiaButton) {
          // Add a small delay to ensure input is processed
          setTimeout(() => {
            chaoGiaButton.click()
            console.log('Clicked chào giá button')
          }, 100)
        } else {
          console.log('Chào giá button not found!')
        }
      }
    } else {
      console.log('Input element not found!')
    }
    
    return counterPrice
  } else {
    console.log('Step price element not found!')
    return null
  }
}

// Function to perform initial price check when starting auto bidding
function performInitialPriceCheck() {
  console.log('Performing initial price check...')
  
  // Get current lowest price
  const currentPriceElement = Array.from(document.querySelectorAll('label.fontWeight500')).find((label) =>
    label.textContent.includes('Giá thấp nhất hiện tại')
  )?.nextElementSibling?.nextElementSibling

  if (!currentPriceElement) {
    console.log('Could not find lowest price element for initial check')
    return false
  }

  const priceText = currentPriceElement.textContent
  const lowestPrice = parseInt(priceText.replace(/[^\d]/g, ''))
  
  if (isNaN(lowestPrice)) {
    console.log('Could not parse lowest price for initial check')
    return false
  }

  console.log('Initial lowest price:', lowestPrice)

  // Get my current price
  const myPriceElement = Array.from(document.querySelectorAll('span')).find(
    (span) => span.textContent && span.textContent.includes('Giá của bạn hiện tại')
  )?.nextElementSibling

  let shouldCounterBid = false
  
  if (!myPriceElement) {
    console.log('Could not find my price element - assuming no bid placed yet')
    shouldCounterBid = true
  } else {
    const myPriceText = myPriceElement.textContent
    console.log('My current price text:', myPriceText)

    // Check if user has placed a bid yet (handle cases like "_ VND", empty, or placeholder text)
    const digitsOnly = myPriceText.replace(/[^\d]/g, '')

    if (!digitsOnly || digitsOnly.length === 0) {
      // User hasn't placed a bid yet
      console.log('No valid bid placed yet - should counter bid')
      shouldCounterBid = true
    } else {
      // User has a valid bid
      const myPrice = parseInt(digitsOnly)
      
      if (isNaN(myPrice)) {
        console.log('Could not parse my price - should counter bid')
        shouldCounterBid = true
      } else if (myPrice > lowestPrice) {
        console.log(`My price (${myPrice}) is higher than lowest price (${lowestPrice}) - should counter bid`)
        shouldCounterBid = true
      } else if (myPrice === lowestPrice) {
        console.log(`My price (${myPrice}) equals lowest price (${lowestPrice}) - no need to counter bid`)
        shouldCounterBid = false
      } else {
        console.log(`My price (${myPrice}) is lower than lowest price (${lowestPrice}) - this is unexpected but no counter bid needed`)
        shouldCounterBid = false
      }
    }
  }

  // Check minimum price limit before counter bidding
  if (shouldCounterBid) {
    const minPriceInput = document.getElementById('minPriceInput')
    const minPrice = minPriceInput ? parseInt(minPriceInput.value.replace(/[^\d]/g, '')) : 0

    if (minPrice > 0 && lowestPrice <= minPrice) {
      console.log(`Initial check: Lowest price ${lowestPrice} is at or below minimum limit ${minPrice} - will not counter bid`)
      shouldCounterBid = false
    }
  }

  // Perform counter bid if needed
  if (shouldCounterBid) {
    console.log('Initial price check: Counter bidding needed - performing counter bid')
    counterBidding(lowestPrice)
    return true
  } else {
    console.log('Initial price check: No counter bidding needed')
    return false
  }
}

// Global state for counter bidding
let isCounterBiddingEnabled = false
let isWaitingForCountdown = false
let priceObserver = null
let popupObserver = null
let successObserver = null
let countdownObserver = null

// Function to get countdown in seconds
function getCountdownSeconds() {
  // First find the element containing "Thời gian còn lại:"
  const timeLabels = Array.from(document.querySelectorAll('b')).find(
    (b) => b.textContent && b.textContent.includes('Thời gian còn lại:')
  )

  if (!timeLabels) {
    console.log('DEBUG: Could not find "Thời gian còn lại:" label')
    return 0
  }

  // Find the parent div container that has the time squares
  const timeContainer = timeLabels.parentElement
  if (!timeContainer) {
    console.log('DEBUG: Could not find time container')
    return 0
  }

  // Get all time-square-item elements within this container
  const timeSquares = timeContainer.querySelectorAll('.time-square')
  console.log('DEBUG: Found', timeSquares.length, 'time squares')

  if (timeSquares.length >= 4) {
    const days = parseInt(timeSquares[0].querySelector('.time-square-item')?.textContent || '0')
    const hours = parseInt(timeSquares[1].querySelector('.time-square-item')?.textContent || '0')
    const minutes = parseInt(timeSquares[2].querySelector('.time-square-item')?.textContent || '0')
    const seconds = parseInt(timeSquares[3].querySelector('.time-square-item')?.textContent || '0')

    const totalSeconds = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
    console.log(`DEBUG: Countdown - ${days}d ${hours}h ${minutes}m ${seconds}s = ${totalSeconds} total seconds`)

    return totalSeconds
  }

  console.log('DEBUG: Not enough time squares found')
  return 0
}

// Function to format numbers with commas
function formatNumberWithCommas(numberString) {
  if (!numberString || numberString.length === 0) return ''
  
  // Add commas every 3 digits from the right
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Function to format numbers in Vietnamese format (999.999.999,0)
function formatVietnameseNumber(number) {
  if (!number && number !== 0) return ''
  
  // Convert to string and handle decimal part
  const numberStr = number.toString()
  const parts = numberStr.split('.')
  
  // Format the integer part with dots as thousand separators
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  // If there's a decimal part, add it with comma as decimal separator
  if (parts.length > 1) {
    return integerPart + ',' + parts[1]
  }
  
  // For whole numbers, add ,0 at the end
  return integerPart + ',0'
}

// Function to adjust cursor position after formatting
function adjustCursorPosition(oldValue, newValue, oldPosition) {
  // Count commas before cursor in old value
  const commasBeforeOld = (oldValue.substring(0, oldPosition).match(/,/g) || []).length
  
  // Count commas before cursor in new value
  let newPosition = oldPosition
  const digitsBeforeCursor = oldValue.substring(0, oldPosition).replace(/[^\d]/g, '').length
  
  // Find position in new value that corresponds to same number of digits
  let digitCount = 0
  for (let i = 0; i < newValue.length; i++) {
    if (/\d/.test(newValue[i])) {
      digitCount++
      if (digitCount === digitsBeforeCursor) {
        newPosition = i + 1
        break
      }
    }
  }
  
  return Math.min(newPosition, newValue.length)
}

// Function to create floating control panel
function createFloatingPanel() {
  if (document.getElementById('autoBiddingPanel')) return

  // Create floating panel container
  const panel = document.createElement('div')
  panel.id = 'autoBiddingPanel'
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 280px;
    background: white;
    border: 2px solid #007bff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
  `

  // Panel title
  const title = document.createElement('div')
  title.textContent = '🤖 Điều Khiển Đấu Giá Tự Động'
  title.style.cssText = `
    font-weight: bold;
    margin-bottom: 10px;
    color: #007bff;
    text-align: center;
  `

  // Minimum price input container
  const minPriceContainer = document.createElement('div')
  minPriceContainer.style.marginBottom = '10px'

  const minPriceLabel = document.createElement('label')
  minPriceLabel.textContent = 'Giá tối thiểu có thể chấp nhận:'
  minPriceLabel.style.cssText = `
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  `

  const minPriceInput = document.createElement('input')
  minPriceInput.id = 'minPriceInput'
  minPriceInput.type = 'text'
  minPriceInput.style.cssText = `
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 10px;
  `

  // Countdown trigger input container
  const countdownContainer = document.createElement('div')
  countdownContainer.style.marginBottom = '10px'

  const countdownLabel = document.createElement('label')
  countdownLabel.textContent = 'Bắt đầu khi còn lại (giây):'
  countdownLabel.style.cssText = `
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  `

  const countdownInput = document.createElement('input')
  countdownInput.id = 'countdownInput'
  countdownInput.type = 'text'
  countdownInput.style.cssText = `
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  `

  // Start/Stop button
  const controlBtn = document.createElement('button')
  controlBtn.id = 'counterBiddingBtn'
  controlBtn.textContent = 'Bắt Đầu Đấu Giá Tự Động'
  controlBtn.style.cssText = `
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    margin-top: 10px;
  `

  // Status display
  const statusDiv = document.createElement('div')
  statusDiv.id = 'biddingStatus'
  statusDiv.style.cssText = `
    margin-top: 10px;
    padding: 8px;
    border-radius: 4px;
    text-align: center;
    font-size: 12px;
    background-color: #f8f9fa;
    color: #6c757d;
  `
  statusDiv.textContent = 'Trạng thái: Không hoạt động'

  // Assemble panel
  minPriceContainer.appendChild(minPriceLabel)
  minPriceContainer.appendChild(minPriceInput)

  countdownContainer.appendChild(countdownLabel)
  countdownContainer.appendChild(countdownInput)

  panel.appendChild(title)
  panel.appendChild(minPriceContainer)
  panel.appendChild(countdownContainer)
  panel.appendChild(controlBtn)
  panel.appendChild(statusDiv)

  // Add event listeners
  controlBtn.addEventListener('click', toggleCounterBidding)

  // Add auto-formatting for minimum price input
  minPriceInput.addEventListener('input', function (e) {
    // Get cursor position before formatting
    const cursorPosition = e.target.selectionStart
    const oldValue = e.target.value

    // Remove all non-digits
    const numbersOnly = oldValue.replace(/[^\d]/g, '')

    // Format with commas
    const formattedValue = formatNumberWithCommas(numbersOnly)

    // Update input value
    e.target.value = formattedValue

    // Restore cursor position (adjusted for new formatting)
    const newCursorPosition = adjustCursorPosition(oldValue, formattedValue, cursorPosition)
    e.target.setSelectionRange(newCursorPosition, newCursorPosition)
  })

  // Make entire panel draggable
  let isDragging = false
  let dragOffset = { x: 0, y: 0 }

  panel.style.cursor = 'move'

  panel.addEventListener('mousedown', (e) => {
    // Don't drag if clicking on input field or button
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
      return
    }

    isDragging = true
    dragOffset.x = e.clientX - panel.offsetLeft
    dragOffset.y = e.clientY - panel.offsetTop
    e.preventDefault() // Prevent text selection
  })

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      panel.style.left = e.clientX - dragOffset.x + 'px'
      panel.style.top = e.clientY - dragOffset.y + 'px'
      panel.style.right = 'auto'
    }
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
  })

  // Add to page
  document.body.appendChild(panel)
  console.log('Bảng điều khiển đấu giá tự động đã được tạo!')
}

// Function to update status display
function updateStatus(message, color = '#28a745') {
  const statusDiv = document.getElementById('biddingStatus')
  if (statusDiv) {
    statusDiv.textContent = `Trạng thái: ${message}`
    statusDiv.style.color = color
  }
}

// Function to start countdown observer
function startCountdownObserver(targetSeconds) {
  countdownObserver = new MutationObserver(() => {
    const currentSeconds = getCountdownSeconds()

    // Check if countdown is over (reached 0)
    if (currentSeconds === 0) {
      console.log('Đấu giá đã kết thúc! Dừng tất cả hoạt động.')

      // Stop all processes
      if (isWaitingForCountdown) {
        stopCountdownObserver()
      }
      if (isCounterBiddingEnabled) {
        isCounterBiddingEnabled = false
        stopObservers()
      }

      // Reset button state
      const btn = document.getElementById('counterBiddingBtn')
      if (btn) {
        btn.textContent = 'Bắt Đầu Đấu Giá Tự Động'
        btn.style.backgroundColor = '#28a745'
        btn.style.color = 'white'
      }

      updateStatus('Đấu giá đã kết thúc', '#dc3545')
      console.log('Tất cả hoạt động đấu giá đã dừng vì hết thời gian!')
      return
    }

    if (currentSeconds <= targetSeconds && currentSeconds > 0) {
      console.log(`Đếm ngược đạt ${currentSeconds}s, bắt đầu đấu giá tự động!`)

      // Stop countdown waiting
      stopCountdownObserver()

      // Start auto bidding
      isCounterBiddingEnabled = true
      const btn = document.getElementById('counterBiddingBtn')
      if (btn) {
        btn.textContent = 'Dừng Đấu Giá Tự Động'
        btn.style.backgroundColor = '#dc3545'
        btn.style.color = 'white'
      }

      const minPriceInput = document.getElementById('minPriceInput')
      const minPriceText = minPriceInput?.value || 'Chưa thiết lập'
      updateStatus(`Hoạt động (Tối thiểu: ${minPriceText})`, '#28a745')

      // Perform initial price check before starting observers
      performInitialPriceCheck()

      startObservers()
      console.log('Đấu giá tự động đã bắt đầu!')
      return
    }

    // Update status with current countdown
    if (isWaitingForCountdown) {
      if (currentSeconds > targetSeconds) {
        updateStatus(`Chờ đếm ngược: Mục tiêu ${targetSeconds}s (Hiện tại: ${currentSeconds}s - Chưa đạt)`, '#ffc107')
      } else {
        updateStatus(`Chờ đếm ngược: ${targetSeconds}s (Hiện tại: ${currentSeconds}s)`, '#ffc107')
      }
    }
  })

  // Observe the countdown area - use same method as getCountdownSeconds
  const timeLabels = Array.from(document.querySelectorAll('b')).find(
    (b) => b.textContent && b.textContent.includes('Thời gian còn lại:')
  )

  if (timeLabels) {
    const timeContainer = timeLabels.parentElement
    if (timeContainer) {
      countdownObserver.observe(timeContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      })
      console.log('Started countdown observer on container:', timeContainer)
    } else {
      console.log('Could not find time container for countdown observer')
    }
  } else {
    console.log('Could not find "Thời gian còn lại:" label for countdown observer')
  }
}

// Function to stop countdown observer
function stopCountdownObserver() {
  isWaitingForCountdown = false

  if (countdownObserver) {
    countdownObserver.disconnect()
    countdownObserver = null
  }

  console.log('Dừng chờ đếm ngược!')
}

// Function to toggle counter bidding on/off
function toggleCounterBidding() {
  const btn = document.getElementById('counterBiddingBtn')
  const minPriceInput = document.getElementById('minPriceInput')
  const countdownInput = document.getElementById('countdownInput')

  if (!isCounterBiddingEnabled && !isWaitingForCountdown) {
    // Validate minimum price input
    if (minPriceInput && minPriceInput.value.trim()) {
      const minPrice = parseInt(minPriceInput.value.replace(/[^\d]/g, ''))
      if (isNaN(minPrice) || minPrice <= 0) {
        alert('Vui lòng nhập giá tối thiểu hợp lệ (chỉ nhập số)')
        return
      }
    }

    // Check if user wants to wait for countdown
    const countdownSeconds = countdownInput?.value?.trim()
    if (countdownSeconds) {
      const targetSeconds = parseInt(countdownSeconds)
      if (isNaN(targetSeconds) || targetSeconds <= 0) {
        alert('Vui lòng nhập số giây đếm ngược hợp lệ (lớn hơn 0)')
        return
      }

      // Start waiting for countdown
      isWaitingForCountdown = true
      btn.textContent = 'Dừng Chờ Đếm Ngược'
      btn.style.backgroundColor = '#ffc107'
      btn.style.color = '#212529'

      updateStatus(`Chờ đếm ngược: ${targetSeconds}s`, '#ffc107')
      startCountdownObserver(targetSeconds)
      console.log(`Bắt đầu chờ đếm ngược: ${targetSeconds} giây`)
    } else {
      // Start counter bidding immediately
      isCounterBiddingEnabled = true
      btn.textContent = 'Dừng Đấu Giá Tự Động'
      btn.style.backgroundColor = '#dc3545'
      btn.style.color = 'white'

      const minPriceText = minPriceInput?.value || 'Chưa thiết lập'
      updateStatus(`Hoạt động (Tối thiểu: ${minPriceText})`, '#28a745')

      // Perform initial price check before starting observers
      performInitialPriceCheck()

      startObservers()
      console.log('Đấu giá tự động đã bắt đầu!')
    }
  } else {
    // Stop everything (bidding or countdown waiting)
    if (isWaitingForCountdown) {
      stopCountdownObserver()
    }

    if (isCounterBiddingEnabled) {
      isCounterBiddingEnabled = false
      stopObservers()
      console.log('Đấu giá tự động đã dừng!')
    }

    btn.textContent = 'Bắt Đầu Đấu Giá Tự Động'
    btn.style.backgroundColor = '#28a745'
    btn.style.color = 'white'

    updateStatus('Không hoạt động', '#6c757d')
  }
}

// Function to start all observers
function startObservers() {
  // Create price observer
  priceObserver = new MutationObserver((mutations) => {
    // Check if countdown is over first
    const currentSeconds = getCountdownSeconds()
    if (currentSeconds === 0) {
      console.log('Đấu giá đã kết thúc! Dừng tất cả hoạt động.')

      isCounterBiddingEnabled = false
      const btn = document.getElementById('counterBiddingBtn')
      if (btn) {
        btn.textContent = 'Bắt Đầu Đấu Giá Tự Động'
        btn.style.backgroundColor = '#28a745'
        btn.style.color = 'white'
      }

      updateStatus('Đấu giá đã kết thúc', '#dc3545')
      stopObservers()
      return
    }

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        // Get current price text
        const currentPriceElement = Array.from(document.querySelectorAll('label.fontWeight500')).find((label) =>
          label.textContent.includes('Giá thấp nhất hiện tại')
        )?.nextElementSibling?.nextElementSibling

        if (currentPriceElement) {
          const priceText = currentPriceElement.textContent
          console.log('Lowest price changed to:', priceText)

          const priceNumber = parseInt(priceText.replace(/[^\d]/g, ''))

          // Check if the new lowest price is our own bid (to prevent infinite loop)
          const myPriceElement = Array.from(document.querySelectorAll('span')).find(
            (span) => span.textContent && span.textContent.includes('Giá của bạn hiện tại')
          )?.nextElementSibling

          if (myPriceElement) {
            const myPriceText = myPriceElement.textContent
            console.log('My current price:', myPriceText)

            // Check if user has placed a bid yet (handle cases like "_ VND", empty, or placeholder text)
            const digitsOnly = myPriceText.replace(/[^\d]/g, '')

            if (digitsOnly && digitsOnly.length > 0) {
              // User has a valid bid
              const myPriceNumber = parseInt(digitsOnly)

              // If my price equals the lowest price, this means I just won the bid
              if (!isNaN(myPriceNumber) && myPriceNumber === priceNumber) {
                console.log('Lowest price matches my price - skipping counter bid to prevent loop')
                return
              }
            } else {
              // User hasn't placed a bid yet (showing "_ VND" or similar)
              console.log('User has not placed any bid yet - proceeding with counter bid')
            }
          }

          // Check minimum price limit
          const minPriceInput = document.getElementById('minPriceInput')
          const minPrice = minPriceInput ? parseInt(minPriceInput.value.replace(/[^\d]/g, '')) : 0

          if (minPrice > 0 && priceNumber <= minPrice) {
            console.log(
              `Giá ${priceNumber} đã giảm xuống hoặc thấp hơn giới hạn tối thiểu ${minPrice}. Dừng đấu giá tự động.`
            )
            updateStatus('Đã dừng: Đạt giới hạn giá', '#dc3545')

            // Stop auto bidding
            isCounterBiddingEnabled = false
            const btn = document.getElementById('counterBiddingBtn')
            if (btn) {
              btn.textContent = 'Bắt Đầu Đấu Giá Tự Động'
              btn.style.backgroundColor = '#28a745'
            }
            stopObservers()
            return
          }

          // Continue with counter bidding
          counterBidding(priceNumber)
        }
      }
    })
  })

  // Create popup observer
  popupObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check for newly added nodes that might be popup dialogs
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Look for mat-dialog-container specifically
          const dialogContainer =
            node.matches && node.matches('mat-dialog-container')
              ? node
              : node.querySelector && node.querySelector('mat-dialog-container')

          if (dialogContainer) {
            // Check if this dialog contains the confirmation text
            const hasConfirmationText =
              dialogContainer.textContent && dialogContainer.textContent.includes('Bạn có xác nhận chào giá')

            if (hasConfirmationText) {
              console.log('Confirmation dialog detected!')

              // Find the "Có" button within this dialog
              const coButton = Array.from(dialogContainer.querySelectorAll('button')).find(
                (btn) => btn.textContent.trim() === 'Có'
              )

              if (coButton) {
                // Add delay to ensure dialog is fully rendered
                setTimeout(() => {
                  coButton.click()
                  console.log('Clicked "Có" button')
                }, 100)
              } else {
                console.log('"Có" button not found in dialog')
              }
            }
          }
        }
      })
    })
  })

  // Create success observer
  successObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check for newly added nodes that might be success dialogs
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Look for mat-dialog-container specifically
          const dialogContainer =
            node.matches && node.matches('mat-dialog-container')
              ? node
              : node.querySelector && node.querySelector('mat-dialog-container')

          if (dialogContainer) {
            // Check if this dialog contains the success text
            const hasSuccessText =
              dialogContainer.textContent &&
              dialogContainer.textContent.includes('Chúc mừng bạn đã chào giá thành công')

            if (hasSuccessText) {
              console.log('Success dialog detected!')

              // Find the "Đóng" button within this dialog
              const dongButton = Array.from(dialogContainer.querySelectorAll('button')).find(
                (btn) => btn.textContent.trim() === 'Đóng'
              )

              if (dongButton) {
                console.log('Found "Đóng" button, clicking...')

                // Add delay to ensure dialog is fully rendered
                setTimeout(() => {
                  dongButton.click()
                  console.log('Clicked "Đóng" button')
                }, 100)
              } else {
                console.log('"Đóng" button not found in success dialog')
              }
            }
          }
        }
      })
    })
  })

  // Start observing with the observers
  const lowestPriceElement = Array.from(document.querySelectorAll('label.fontWeight500')).find((label) =>
    label.textContent.includes('Giá thấp nhất hiện tại')
  )?.nextElementSibling?.nextElementSibling

  if (lowestPriceElement) {
    priceObserver.observe(lowestPriceElement, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    console.log('Started monitoring lowest price element')
  }

  popupObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  successObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  console.log('All observers started!')
}

// Function to stop all observers
function stopObservers() {
  if (priceObserver) {
    priceObserver.disconnect()
    priceObserver = null
  }
  if (popupObserver) {
    popupObserver.disconnect()
    popupObserver = null
  }
  if (successObserver) {
    successObserver.disconnect()
    successObserver = null
  }

  stopCountdownObserver()

  console.log('Tất cả observers đã dừng!')
}

// Initialize the floating control panel when page loads
setTimeout(createFloatingPanel, 1000)

