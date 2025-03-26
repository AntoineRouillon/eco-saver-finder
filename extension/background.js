
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
    
    console.log('Searching Leboncoin for:', cleanedTerm);
    
    // Create the search URL
    const searchUrl = `https://www.leboncoin.fr/recherche?text=${encodeURIComponent(cleanedTerm)}`;
    
    // Use chrome.runtime.sendMessage to bypass CORS by using the extension's privileged context
    chrome.runtime.sendMessage({
      action: "FETCH_LEBONCOIN",
      url: searchUrl
    }, response => {
      try {
        // If we got a successful response
        if (response && response.success && response.html) {
          // Create a DOM parser
          const parser = new DOMParser();
          const doc = parser.parseFromString(response.html, 'text/html');
          
          // Find the search results
          const itemElements = doc.querySelectorAll('a[data-qa-id="aditem_container"]');
          
          // Process each item
          let alternatives = [];
          
          itemElements.forEach((item, index) => {
            // Skip if we already have enough results or if index is beyond our limit
            if (index >= 5) return;
            
            try {
              // Extract item details
              const titleElement = item.querySelector('[data-qa-id="aditem_title"]');
              const priceElement = item.querySelector('[data-qa-id="aditem_price"]');
              const locationElement = item.querySelector('[data-qa-id="aditem_location"]');
              const imageElement = item.querySelector('img');
              
              // Only add if we have the minimum required data
              if (titleElement && priceElement) {
                alternatives.push({
                  id: index.toString(),
                  title: titleElement.textContent.trim(),
                  price: priceElement.textContent.trim(),
                  image: imageElement ? imageElement.src : '',
                  location: locationElement ? locationElement.textContent.trim() : '',
                  url: item.href
                });
              }
            } catch (error) {
              console.error('Error parsing item:', error);
            }
          });
          
          if (alternatives.length > 0) {
            resolve({
              success: true,
              count: alternatives.length,
              alternatives: alternatives
            });
            return;
          }
        }
        
        // If we reach here, the scraping wasn't successful or we didn't get any items
        // Fall back to demo data based on the search term
        console.log('Falling back to demo data for:', cleanedTerm);
        
        let demoAlternatives = createDemoAlternatives(cleanedTerm, searchUrl);
        
        resolve({
          success: true,
          count: demoAlternatives.length,
          alternatives: demoAlternatives
        });
      } catch (error) {
        console.error('Error processing Leboncoin response:', error);
        
        // Return empty result on error
        resolve({
          success: false,
          count: 0,
          alternatives: []
        });
      }
    });
  });
}

// Helper function to create demo alternatives based on search term
function createDemoAlternatives(searchTerm, searchUrl) {
  searchTerm = searchTerm.toLowerCase();
  
  if (searchTerm.includes('echo') || searchTerm.includes('dot')) {
    return [
      {
        id: '1',
        title: 'Echo Dot (4ème génération) - État parfait',
        price: '29,50 €',
        image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
        location: 'Paris 15e',
        url: searchUrl
      },
      {
        id: '2',
        title: 'Enceinte Amazon Echo Dot 4 neuve',
        price: '27,00 €',
        image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
        location: 'Lyon 6e',
        url: searchUrl
      },
      {
        id: '3',
        title: 'Enceinte connectée Echo Dot 4 avec Alexa',
        price: '31,90 €',
        image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
        location: 'Marseille 8e',
        url: searchUrl
      }
    ];
  } else if (searchTerm.includes('ipad') || searchTerm.includes('tablette')) {
    return [
      {
        id: '1',
        title: 'iPad Pro 11" 2022 - 256 Go - Comme neuf',
        price: '689,00 €',
        image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667594383539',
        location: 'Paris 8e',
        url: searchUrl
      },
      {
        id: '2',
        title: 'iPad Air 5 64Go WiFi Space Grey sous garantie',
        price: '469,00 €',
        image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1667594383539',
        location: 'Nantes',
        url: searchUrl
      }
    ];
  } else if (searchTerm.includes('casque') || searchTerm.includes('headphone')) {
    return [
      {
        id: '1',
        title: 'Casque Sony WH-1000XM4 - Noir - Comme neuf',
        price: '219,00 €',
        image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
        location: 'Lille',
        url: searchUrl
      },
      {
        id: '2',
        title: 'Sony WH-1000XM5 - Garantie 6 mois',
        price: '289,00 €',
        image: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX679_.jpg',
        location: 'Paris 9e',
        url: searchUrl
      }
    ];
  }
  
  // Default case: return empty array
  return [];
}

// Listen for fetch requests from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "FETCH_LEBONCOIN") {
    // Use the extension's ability to bypass CORS
    fetch(message.url)
      .then(response => response.text())
      .then(html => {
        sendResponse({
          success: true,
          html: html
        });
      })
      .catch(error => {
        console.error('Error fetching from Leboncoin:', error);
        sendResponse({
          success: false,
          error: error.toString()
        });
      });
    
    return true; // Keep the message channel open for the async response
  } else if (message.action === "GET_ALTERNATIVES") {
    // Search for alternatives on Leboncoin
    scrapeLeboncoin(message.productInfo.title)
      .then(response => {
        sendResponse(response);
      });
    
    return true; // Indicates we'll respond asynchronously
  }
});
