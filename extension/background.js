
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
    console.log("Starting to scrape Leboncoin data");
    
    // Get all item articles - trying different possible selectors
    const itemArticles = document.querySelectorAll('article[data-test-id="ad"]') || 
                         document.querySelectorAll('article[data-qa-id="aditem_container"]') ||
                         document.querySelectorAll('article');
    
    console.log(`Found ${itemArticles.length} article elements`);
    
    // Store the full HTML of all articles for debugging
    const articleHTMLs = Array.from(itemArticles).slice(0, 5).map(article => article.outerHTML);
    
    // Map through each article to extract data
    const items = Array.from(itemArticles).slice(0, 5).map(article => {
      // Extract title
      const titleElement = article.querySelector('[data-test-id="adcard-title"]') || 
                          article.querySelector('p.text-body-1.text-on-surface') ||
                          article.querySelector('h2') ||
                          article.querySelector('p:not([data-test-id])');
      
      const title = titleElement ? titleElement.textContent.trim() : 'No title found';
      
      // Extract price
      const priceElement = article.querySelector('[data-test-id="price"]') || 
                           article.querySelector('p.text-callout.text-on-surface') ||
                           article.querySelector('span.price') ||
                           article.querySelector('p:contains("€")');
      
      const price = priceElement ? priceElement.textContent.trim() : 'No price found';
      
      // Extract image
      const imageElement = article.querySelector('img') || article.querySelector('picture img');
      const image = imageElement ? imageElement.src : '';
      
      // Extract location
      const locationElement = article.querySelector('.text-caption.text-neutral:last-child') || 
                              article.querySelector('p[aria-label*="Située à"]') ||
                              article.querySelector('p.text-caption.text-neutral:nth-child(2)');
      
      const location = locationElement ? locationElement.textContent.trim() : 'No location found';
      
      // Extract URL - fix the incomplete URL issue
      const linkElement = article.querySelector('a');
      let url = linkElement ? linkElement.href : '';
      
      // If the URL is relative, make it absolute
      if (url && url.startsWith('/')) {
        url = 'https://www.leboncoin.fr' + url;
      }
      
      // Check for delivery option
      const hasDelivery = !!article.querySelector('span[data-spark-component="tag"]:contains("Livraison possible")') ||
                          !!article.querySelector('*:contains("Livraison possible")');
      
      // Check if it's from a pro seller
      const isPro = !!article.querySelector('span[data-spark-component="tag"]:contains("Pro")') ||
                    !!article.querySelector('*:contains("Pro")');
      
      return {
        id: Math.random().toString(36).substring(2, 15),
        title,
        price,
        image,
        location,
        url,
        hasDelivery: hasDelivery || false,
        isPro: isPro || false,
        html: article.outerHTML // Store the full HTML for debugging
      };
    }).filter(item => item.title !== 'No title found'); // Filter out items with no title
    
    console.log(`Processed ${items.length} items`);
    
    // If no items were found, return the HTML of the articles for debugging
    if (items.length === 0) {
      return {
        items: [],
        debug: {
          articleCount: itemArticles.length,
          articleHTMLs: articleHTMLs
        }
      };
    }
    
    return items;
  } catch (error) {
    console.error("Error scraping Leboncoin:", error);
    return {
      items: [],
      error: error.toString(),
      stack: error.stack
    };
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
