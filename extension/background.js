
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

// Function to scrape Leboncoin
function scrapeLeboncoin(searchTerm) {
  return new Promise((resolve) => {
    // Clean the search term to get better results
    const cleanedTerm = searchTerm
      .replace(/amazon|basics|echo|alexa|kindle|fire|prime/gi, '')
      .replace(/\([^)]*\)/g, '')  // Remove content in parentheses
      .trim();
    
    // In a real extension, this would fetch the Leboncoin search page and parse it
    // For demonstration, we're simulating the parsed results from different searches
    console.log('Searching Leboncoin for:', cleanedTerm);
    
    // Simulate network delay
    setTimeout(() => {
      // Simulate scraping results from Leboncoin
      let alternatives = [];
      let count = 0;
      
      // Dynamically generate search results based on product keywords
      if (cleanedTerm.toLowerCase().includes('echo') || cleanedTerm.toLowerCase().includes('dot')) {
        // Echo Dot scraping simulation
        count = 3;
        alternatives = [
          {
            id: '1',
            title: 'Echo Dot (4ème génération) - État parfait',
            price: '29,50 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Paris 15e',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '2',
            title: 'Enceinte Amazon Echo Dot 4 neuve',
            price: '27,00 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Lyon 6e',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '3',
            title: 'Enceinte connectée Echo Dot 4 avec Alexa',
            price: '31,90 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Marseille 8e',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          }
        ];
      } else if (cleanedTerm.toLowerCase().includes('ipad') || cleanedTerm.toLowerCase().includes('tablette')) {
        count = 4;
        alternatives = [
          {
            id: '1',
            title: 'iPad Pro 11" 2022 - 256 Go - Comme neuf',
            price: '689,00 €',
            image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667594383539',
            location: 'Paris 8e',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '2',
            title: 'iPad Air 5 64Go WiFi Space Grey sous garantie',
            price: '469,00 €',
            image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667594383539',
            location: 'Nantes',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '3',
            title: 'iPad Pro 12.9" M1 - 256 Go - Très bon état',
            price: '799,00 €',
            image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667594383539',
            location: 'Bordeaux',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '4',
            title: 'iPad 9th génération - 64 Go - Wi-Fi - Neuf scellé',
            price: '329,00 €',
            image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667594383539',
            location: 'Toulouse',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          }
        ];
      } else if (cleanedTerm.toLowerCase().includes('casque') || cleanedTerm.toLowerCase().includes('headphone')) {
        count = 2;
        alternatives = [
          {
            id: '1',
            title: 'Casque Sony WH-1000XM4 - Noir - Comme neuf',
            price: '219,00 €',
            image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
            location: 'Lille',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          },
          {
            id: '2',
            title: 'Sony WH-1000XM5 - Garantie 6 mois',
            price: '289,00 €',
            image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
            location: 'Paris 9e',
            url: 'https://www.leboncoin.fr/recherche?text=' + encodeURIComponent(cleanedTerm)
          }
        ];
      }
      // If no keyword matches or product not commonly found second-hand, return empty results
      
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
    scrapeLeboncoin(message.productInfo.title)
      .then(response => {
        sendResponse(response);
      });
    
    return true; // Indicates we'll respond asynchronously
  }
});
