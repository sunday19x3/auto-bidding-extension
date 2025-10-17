// Test script to change the lowest price element text
async function testPriceChange(price) {
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: (testPrice) => {
        // Find the lowest price element (same selector as your code)
        const lowestPriceElement = Array.from(document.querySelectorAll('label.fontWeight500')).find((label) =>
          label.textContent.includes('Giá thấp nhất hiện tại')
        )?.nextElementSibling?.nextElementSibling;
        
        if (lowestPriceElement) {
          console.log('Original price:', lowestPriceElement.textContent);
          
          // Change to a new price
          lowestPriceElement.textContent = testPrice;
          console.log('Changed price to:', lowestPriceElement.textContent);
        } else {
          console.log('Price element not found!');
        }
      },
      args: [price]
    });
  } catch (error) {
    console.error('Test error:', error);
    alert('Error running test. Make sure you are on the bidding page.');
  }
}

// Test price change from input field
function testPriceChangeFromInput() {
  const inputPrice = document.getElementById('testPriceInput').value.trim();
  if (!inputPrice) {
    alert('Please enter a test price first');
    return;
  }
  testPriceChange(inputPrice);
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners to buttons
  document.getElementById('testPriceInputBtn').addEventListener('click', testPriceChangeFromInput);
  document.getElementById('testPrice350Btn').addEventListener('click', () => testPriceChange('350.000.000 VND'));
  document.getElementById('testPrice300Btn').addEventListener('click', () => testPriceChange('300.000.000 VND'));
  document.getElementById('testPrice250Btn').addEventListener('click', () => testPriceChange('250.000.000 VND'));
});