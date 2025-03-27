
// Cache to store scraped data
let scrapedDataCache = {};

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
    }).catch(error => {
      console.error("Error executing script:", error);
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

// Function to open a pinned tab to Leboncoin with search query
async function openLeboncoinTab(searchQuery, sourceTabId) {
  console.log("Opening Leboncoin tab with query:", searchQuery);
  
  // Check if we have cached data for this query
  const cacheKey = searchQuery.trim().toLowerCase();
  if (scrapedDataCache[cacheKey]) {
    console.log("Using cached data for query:", cacheKey);
    
    // Send the cached data to the content script
    chrome.tabs.sendMessage(sourceTabId, {
      action: "ALTERNATIVES_FOUND",
      alternatives: scrapedDataCache[cacheKey]
    });
    
    return;
  }
  
  // Create the search URL for Leboncoin
  const searchUrl = `https://www.leboncoin.fr/recherche?text=${encodeURIComponent(searchQuery)}`;
  
  try {
    // Open a new pinned tab with the search URL
    const newTab = await chrome.tabs.create({
      url: searchUrl,
      pinned: true,
      active: false
    });
    
    // Store the source tab ID and query for later reference
    const scrapingData = {
      sourceTabId: sourceTabId,
      query: searchQuery,
      timestamp: Date.now()
    };
    
    // Store the scraping data in local storage
    chrome.storage.local.set({ 
      [`scraping_${newTab.id}`]: scrapingData 
    });
    
    // Add listener for when the tab is loaded
    const onTabLoaded = (tabId, changeInfo) => {
      if (tabId === newTab.id && changeInfo.status === 'complete') {
        // Wait for the page to fully render
        setTimeout(() => {
          // Execute script to scrape data from Leboncoin
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            function: scrapeLeboncoinData
          }).then(results => {
            if (results && results[0]?.result) {
              const scrapedItems = results[0].result;
              console.log("Scraped items:", scrapedItems);
              
              // Cache the results
              scrapedDataCache[cacheKey] = scrapedItems;
              
              // Send the results to the content script
              chrome.tabs.sendMessage(sourceTabId, {
                action: "ALTERNATIVES_FOUND",
                alternatives: scrapedItems
              });
              
              // Close the pinned tab after scraping
              chrome.tabs.remove(newTab.id);
            }
          }).catch(error => {
            console.error("Error scraping Leboncoin:", error);
            chrome.tabs.remove(newTab.id);
          });
        }, 3000); // Wait 3 seconds for the page to fully load
        
        // Remove this listener after it's been used
        chrome.tabs.onUpdated.removeListener(onTabLoaded);
      }
    };
    
    // Add the tab update listener
    chrome.tabs.onUpdated.addListener(onTabLoaded);
    
    // Set a timeout to close the tab if scraping takes too long
    setTimeout(() => {
      chrome.tabs.get(newTab.id, (tab) => {
        if (tab) {
          console.log("Closing tab due to timeout");
          chrome.tabs.remove(newTab.id);
        }
      });
    }, 20000); // 20 seconds timeout
    
  } catch (error) {
    console.error("Error opening Leboncoin tab:", error);
  }
}

// Function that will be injected into the Leboncoin page to scrape data
function scrapeLeboncoinData() {
  try {
    // Get all item cards
    const itemCards = document.querySelectorAll('[data-test-id="ad-card"]');
    
    // Map through each card to extract data
    const items = Array.from(itemCards).slice(0, 5).map(card => {
      // Extract title
      const titleElement = card.querySelector('[data-test-id="ad-title"]');
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      // Extract price
      const priceElement = card.querySelector('[data-test-id="ad-price"]');
      const price = priceElement ? priceElement.textContent.trim() : '';
      
      // Extract image
      const imageElement = card.querySelector('img');
      const image = imageElement ? imageElement.src : '';
      
      // Extract location
      const locationElement = card.querySelector('[data-test-id="ad-location"]');
      const location = locationElement ? locationElement.textContent.trim() : '';
      
      // Extract URL
      const linkElement = card.querySelector('a');
      const url = linkElement ? linkElement.href : '';
      
      return {
        id: Math.random().toString(36).substring(2, 15),
        title,
        price,
        image,
        location,
        url
      };
    }).filter(item => item.title && item.price); // Filter out items with no title or price
    
    return items;
  } catch (error) {
    console.error("Error scraping Leboncoin:", error);
    return [];
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_ALTERNATIVES") {
    // Handle the request to get alternatives
    const productInfo = message.productInfo;
    
    if (productInfo && productInfo.title) {
      // Open Leboncoin tab with the product title as search query
      openLeboncoinTab(productInfo.title, sender.tab.id);
      
      // Send an immediate response so the content script knows we received the message
      sendResponse({
        success: true,
        message: "Searching for alternatives..."
      });
    } else {
      sendResponse({
        success: false,
        message: "No product information provided"
      });
    }
    
    return true; // Indicates we'll respond asynchronously
  }
});
