
// Listen for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the page is fully loaded and the URL is from Amazon product page
  if (changeInfo.status === 'complete' && tab.url.match(/amazon\.fr.*\/dp\//)) {
    // Execute script to get product information
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: getProductInfo
    }).then(results => {
      if (results && results[0]?.result) {
        // Send message to content script with the product info
        chrome.tabs.sendMessage(tabId, {
          action: "PRODUCT_INFO",
          productInfo: results[0].result
        });
      }
    });
  }
});

// Function to extract product information
function getProductInfo() {
  // Get product title
  const productTitle = document.getElementById('productTitle')?.innerText.trim() || 
                       document.querySelector('h1.a-size-large')?.innerText.trim() || '';
  
  // Get product image
  const productImage = document.getElementById('landingImage')?.src || 
                       document.querySelector('img#main-image')?.src || 
                       document.querySelector('#imgTagWrapperId img')?.src || '';
  
  // Get product price
  const priceElement = document.querySelector('.a-price .a-offscreen') || 
                       document.querySelector('.a-price') || 
                       document.getElementById('priceblock_ourprice') || 
                       document.getElementById('priceblock_dealprice');
  
  const price = priceElement ? priceElement.innerText.trim() : '';
  
  // Get product ASIN (Amazon Standard Identification Number)
  const asinMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/) || 
                    document.body.innerHTML.match(/ASIN\s*:\s*"([A-Z0-9]{10})"/) || 
                    document.body.innerHTML.match(/\s+asin\s*=\s*["']([A-Z0-9]{10})["']/);
  
  const asin = asinMatch ? asinMatch[1] : '';

  return {
    title: productTitle,
    image: productImage,
    price: price,
    asin: asin,
    url: window.location.href
  };
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_ALTERNATIVES") {
    // Simulate fetching alternatives
    // In a real extension, this would call an API to search Leboncoin
    setTimeout(() => {
      sendResponse({
        success: true,
        alternatives: [
          {
            id: '1',
            title: message.productInfo.title + ' - Très bon état',
            price: Number(message.productInfo.price.replace(/[^0-9,]/g, '').replace(',', '.')) * 0.6 + ' €',
            image: message.productInfo.image,
            location: 'Paris',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(message.productInfo.title)
          },
          {
            id: '2',
            title: message.productInfo.title + ' - Comme neuf',
            price: Number(message.productInfo.price.replace(/[^0-9,]/g, '').replace(',', '.')) * 0.7 + ' €',
            image: message.productInfo.image,
            location: 'Lyon',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(message.productInfo.title)
          },
          {
            id: '3',
            title: message.productInfo.title + ' - Bon état',
            price: Number(message.productInfo.price.replace(/[^0-9,]/g, '').replace(',', '.')) * 0.5 + ' €',
            image: message.productInfo.image,
            location: 'Marseille',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(message.productInfo.title)
          }
        ]
      });
    }, 1000);
    
    return true; // Indicates we'll respond asynchronously
  }
});
