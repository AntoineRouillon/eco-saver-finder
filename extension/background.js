
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

// Function to search Leboncoin
function searchLeboncoin(searchTerm) {
  // Remove brand names and common words to get better results
  const cleanedTerm = searchTerm
    .replace(/amazon|basics|echo|alexa|kindle|fire|prime/gi, '')
    .replace(/\([^)]*\)/g, '')  // Remove content in parentheses
    .trim();
    
  // In a real extension, this would call Leboncoin's API
  // For demonstration, we're simulating the API response
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Generate a random number of results (0-5) for demonstration
      // In a real extension, this would come from the API response
      const productName = cleanedTerm.toLowerCase();
      
      // Simulate different results based on product name
      let alternatives = [];
      let count = 0;
      
      if (productName.includes('dot') || productName.includes('echo')) {
        // Echo Dot-like products - 3 results
        count = 3;
        alternatives = [
          {
            id: '1',
            title: 'Echo Dot (4ème génération) - Très bon état',
            price: '29,00 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Paris',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '2',
            title: 'Enceinte Echo Dot comme neuve',
            price: '25,50 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Lyon',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '3',
            title: 'Amazon Echo Dot 4 - Bon état',
            price: '32,00 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Marseille',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          }
        ];
      } else if (productName.includes('ipad') || productName.includes('tablet')) {
        // iPad/tablet - 2 results
        count = 2;
        alternatives = [
          {
            id: '1',
            title: 'iPad Pro 11 pouces - Comme neuf',
            price: '650,00 €',
            image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667594383539',
            location: 'Paris',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '2',
            title: 'iPad Air 2022 - Bon état',
            price: '450,00 €',
            image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667594383539',
            location: 'Lyon',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          }
        ];
      } else if (productName.includes('monitor') || productName.includes('écran')) {
        // Monitors - 1 result
        count = 1;
        alternatives = [
          {
            id: '1',
            title: 'Écran PC 27 pouces 144Hz - Parfait état',
            price: '180,00 €',
            image: 'https://m.media-amazon.com/images/I/71mU5rpECpL._AC_SX679_.jpg',
            location: 'Bordeaux',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          }
        ];
      } else if (productName.includes('headphone') || productName.includes('casque')) {
        // Headphones - 4 results
        count = 4;
        alternatives = [
          {
            id: '1',
            title: 'Casque Sony WH-1000XM4 - Comme neuf',
            price: '199,00 €',
            image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
            location: 'Paris',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '2',
            title: 'Casque Sony à réduction de bruit',
            price: '180,00 €',
            image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
            location: 'Lyon',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '3',
            title: 'Casque audio Sony premium',
            price: '210,00 €',
            image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
            location: 'Marseille',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '4',
            title: 'Sony WH-1000XM4 excellent état',
            price: '220,00 €',
            image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
            location: 'Toulouse',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          }
        ];
      } 
      // Return 0 alternatives for other items
      
      resolve({
        success: true,
        count: count,
        alternatives: alternatives
      });
    }, 1000);
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_ALTERNATIVES") {
    // Search for alternatives on Leboncoin
    searchLeboncoin(message.productInfo.title)
      .then(response => {
        sendResponse(response);
      });
    
    return true; // Indicates we'll respond asynchronously
  }
});
