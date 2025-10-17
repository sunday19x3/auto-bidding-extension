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
      // Fill plain number without formatting
      inputElement.value = counterPrice.toString()
      console.log('Filled input with counter price:', counterPrice)
      
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

// Global state for counter bidding
let isCounterBiddingEnabled = false
let priceObserver = null
let popupObserver = null
let successObserver = null

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
  
  panel.appendChild(title)
  panel.appendChild(minPriceContainer)
  panel.appendChild(controlBtn)
  panel.appendChild(statusDiv)
  
  // Add event listeners
  controlBtn.addEventListener('click', toggleCounterBidding)
  
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
      panel.style.left = (e.clientX - dragOffset.x) + 'px'
      panel.style.top = (e.clientY - dragOffset.y) + 'px'
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

// Function to toggle counter bidding on/off
function toggleCounterBidding() {
  const btn = document.getElementById('counterBiddingBtn')
  const minPriceInput = document.getElementById('minPriceInput')
  
  if (!isCounterBiddingEnabled) {
    // Validate minimum price input
    if (minPriceInput && minPriceInput.value.trim()) {
      const minPrice = parseInt(minPriceInput.value.replace(/[^\d]/g, ''))
      if (isNaN(minPrice) || minPrice <= 0) {
        alert('Vui lòng nhập giá tối thiểu hợp lệ (chỉ nhập số)')
        return
      }
    }
    
    // Start counter bidding
    isCounterBiddingEnabled = true
    btn.textContent = 'Dừng Đấu Giá Tự Động'
    btn.style.backgroundColor = '#dc3545'
    
    const minPriceText = minPriceInput?.value || 'Chưa thiết lập'
    updateStatus(`Hoạt động (Tối thiểu: ${minPriceText})`, '#28a745')
    
    startObservers()
    console.log('Đấu giá tự động đã bắt đầu!')
    
  } else {
    // Stop counter bidding
    isCounterBiddingEnabled = false
    btn.textContent = 'Bắt Đầu Đấu Giá Tự Động'
    btn.style.backgroundColor = '#28a745'
    
    updateStatus('Không hoạt động', '#6c757d')
    
    stopObservers()
    console.log('Đấu giá tự động đã dừng!')
  }
}

// Function to start all observers
function startObservers() {
  // Create price observer
  priceObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        // Get current price text
        const currentPriceElement = Array.from(document.querySelectorAll('label.fontWeight500')).find(label => 
          label.textContent.includes('Giá thấp nhất hiện tại'))?.nextElementSibling?.nextElementSibling
        
        if (currentPriceElement) {
          const priceText = currentPriceElement.textContent
          console.log('Lowest price changed to:', priceText)
          
          const priceNumber = parseInt(priceText.replace(/[^\d]/g, ''))
          
          // Check minimum price limit
          const minPriceInput = document.getElementById('minPriceInput')
          const minPrice = minPriceInput ? parseInt(minPriceInput.value.replace(/[^\d]/g, '')) : 0
          
          if (minPrice > 0 && priceNumber <= minPrice) {
            console.log(`Giá ${priceNumber} đã giảm xuống hoặc thấp hơn giới hạn tối thiểu ${minPrice}. Dừng đấu giá tự động.`)
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
          const dialogContainer = node.matches && node.matches('mat-dialog-container') ? 
            node : node.querySelector && node.querySelector('mat-dialog-container')
          
          if (dialogContainer) {
            // Check if this dialog contains the confirmation text
            const hasConfirmationText = dialogContainer.textContent && 
              dialogContainer.textContent.includes('Bạn có xác nhận chào giá')
            
            if (hasConfirmationText) {
              console.log('Confirmation dialog detected!')
              
              // Find the "Có" button within this dialog
              const coButton = Array.from(dialogContainer.querySelectorAll('button')).find(btn => 
                btn.textContent.trim() === 'Có')
              
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
          const dialogContainer = node.matches && node.matches('mat-dialog-container') ? 
            node : node.querySelector && node.querySelector('mat-dialog-container')
          
          if (dialogContainer) {
            // Check if this dialog contains the success text
            const hasSuccessText = dialogContainer.textContent && 
              dialogContainer.textContent.includes('Chúc mừng bạn đã chào giá thành công')
            
            if (hasSuccessText) {
              console.log('Success dialog detected!')
              
              // Find the "Đóng" button within this dialog
              const dongButton = Array.from(dialogContainer.querySelectorAll('button')).find(btn => 
                btn.textContent.trim() === 'Đóng')
              
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
  const lowestPriceElement = Array.from(document.querySelectorAll('label.fontWeight500')).find(label => 
    label.textContent.includes('Giá thấp nhất hiện tại'))?.nextElementSibling?.nextElementSibling

  if (lowestPriceElement) {
    priceObserver.observe(lowestPriceElement, {
      childList: true,
      subtree: true,
      characterData: true
    })
    console.log('Started monitoring lowest price element')
  }

  popupObserver.observe(document.body, {
    childList: true,
    subtree: true
  })

  successObserver.observe(document.body, {
    childList: true,
    subtree: true
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
  console.log('All observers stopped!')
}

// Initialize the floating control panel when page loads
setTimeout(createFloatingPanel, 1000)

// Test script to change the lowest price element text
function testPriceChange(price) {
  // Find the lowest price element (same selector as your code)
  const lowestPriceElement = Array.from(document.querySelectorAll('label.fontWeight500')).find(label => 
    label.textContent.includes('Giá thấp nhất hiện tại'))?.nextElementSibling?.nextElementSibling
  
  if (lowestPriceElement) {
    console.log('Original price:', lowestPriceElement.textContent)
    
    // Change to a new price
    lowestPriceElement.textContent = price
    console.log('Changed price to:', lowestPriceElement.textContent)
  } else {
    console.log('Price element not found!')
  }
}