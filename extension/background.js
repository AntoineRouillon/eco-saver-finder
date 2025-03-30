
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

/**
 * Function to trim the product title to improve search results
 * Cuts the title after the first comma, colon, or dash
 */
function trimProductTitle(title) {
  if (!title) return '';
  
  // Find the first occurrence of a comma, colon, or dash
  const commaIndex = title.indexOf(',');
  const colonIndex = title.indexOf(':');
  const dashIndex = title.indexOf(' - ');
  
  let cutIndex = title.length;
  
  // Find the earliest delimiter
  if (commaIndex !== -1) {
    cutIndex = commaIndex;
  }
  
  if (colonIndex !== -1 && colonIndex < cutIndex) {
    cutIndex = colonIndex;
  }
  
  if (dashIndex !== -1 && dashIndex < cutIndex) {
    cutIndex = dashIndex;
  }
  
  // If we found a delimiter, cut the title
  if (cutIndex < title.length) {
    return title.substring(0, cutIndex).trim();
  }
  
  // If the title is still very long, cut it to a reasonable length
  if (title.length > 60) {
    const words = title.split(' ');
    let shortTitle = '';
    for (let i = 0; i < words.length; i++) {
      if ((shortTitle + ' ' + words[i]).length <= 60) {
        shortTitle += (i === 0 ? '' : ' ') + words[i];
      } else {
        break;
      }
    }
    return shortTitle;
  }
  
  return title;
}

// Function to check if the page has fully loaded
function checkPageLoaded(tabId) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        // Check if document is in 'complete' state and all resources are loaded
        return document.readyState === 'complete' && 
               typeof document.querySelectorAll === 'function';
      }
    }).then(results => {
      const isLoaded = results && results[0]?.result === true;
      resolve(isLoaded);
    }).catch(error => {
      console.error("Error checking page load status:", error);
      resolve(false);
    });
  });
}

// Function to wait until the page is fully loaded
async function waitForPageLoad(tabId, timeout = 30000) {
  console.log("Waiting for page to fully load...");
  
  const startTime = Date.now();
  
  // Check page load status every 500ms
  while (Date.now() - startTime < timeout) {
    const isLoaded = await checkPageLoaded(tabId);
    
    if (isLoaded) {
      console.log("Page fully loaded after", (Date.now() - startTime), "ms");
      // Additional delay to ensure dynamic content is rendered
      return new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Wait 500ms before checking again
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.warn("Page load timeout reached after", timeout, "ms");
  // Return a resolved promise to continue with scraping anyway
  return Promise.resolve();
}

// Function to check for "no results" message on Leboncoin using only element selectors
function checkNoResults(tabId) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        // Only use element selectors to check for "no results"
        const noResultSelectors = [
          // Main selector provided by user
          'p[data-test-id="noErrorMainMessage"]',
          // Original selectors
          '#noResultMessages',
          '.noResultMessages',
          '[data-test-id="no-result-message"]',
          // Additional selectors that might indicate no results
          '.emptyResults',
          '[data-qa-id="no-search-results"]',
          '[data-testid="no-results"]',
          '.no-result',
          '[data-qa="no-result"]',
          // Look for images that might be in "no results" messages
          'img[alt*="no result"]',
          'img[alt*="not found"]',
          'img[src*="no-result"]',
          // Check for specific empty state containers
          '.empty-state-container',
          '.zero-results'
        ];
        
        // Check each selector and log when found
        for (const selector of noResultSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            console.log(`No results detected: Found element matching selector '${selector}'`, element);
            return { found: true, selector: selector };
          }
        }
        
        // Check if there are no ad items (another way to detect no results)
        const adItems1 = document.querySelectorAll('article[data-test-id="ad"]');
        const adItems2 = document.querySelectorAll('article[data-qa-id="aditem_container"]');
        
        if (adItems1.length === 0 && adItems2.length === 0 && document.readyState === 'complete') {
          console.log('No results detected: No ad items found in the page');
          return { found: true, selector: 'no-ad-items' };
        }
        
        return { found: false };
      }
    }).then(results => {
      const result = results && results[0]?.result;
      const noResultsFound = result && result.found === true;
      
      if (noResultsFound) {
        console.log(`No results check returned: true (selector: ${result.selector})`);
      } else {
        console.log("No results check returned: false");
      }
      
      resolve(noResultsFound);
    }).catch(error => {
      console.error("Error checking for no results:", error);
      resolve(false); // If error, we assume there might be results
    });
  });
}

// Function to open a pinned tab to Leboncoin with search query
async function openLeboncoinTab(searchQuery, sourceTabId) {
  console.log("Opening Leboncoin tab with query:", searchQuery);
  
  // Apply the trimming function to the search query
  const trimmedQuery = trimProductTitle(searchQuery);
  console.log("Trimmed query for better search results:", trimmedQuery);
  
  // Check if we have cached data for this query
  const cacheKey = trimmedQuery.trim().toLowerCase();
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
  const searchUrl = `https://www.leboncoin.fr/recherche?text=${encodeURIComponent(trimmedQuery)}`;
  
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
      query: trimmedQuery,
      timestamp: Date.now()
    };
    
    // Store the scraping data in local storage
    chrome.storage.local.set({ 
      [`scraping_${newTab.id}`]: scrapingData 
    });
    
    // Add listener for when the tab is loaded
    const onTabLoaded = async (tabId, changeInfo) => {
      if (tabId === newTab.id && changeInfo.status === 'complete') {
        // Remove this listener after it's been triggered
        chrome.tabs.onUpdated.removeListener(onTabLoaded);
        
        try {
          // Wait 1.5 seconds to give the page time to render the "no results" message if it exists
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check for "no results" message
          console.log("Checking for 'no results' message...");
          const noResultsFound = await checkNoResults(newTab.id);
          
          if (noResultsFound) {
            console.log("'No results' message found, terminating search early.");
            // Send empty alternatives array to trigger "no results" UI
            chrome.tabs.sendMessage(sourceTabId, {
              action: "ALTERNATIVES_FOUND",
              alternatives: [],
              error: "No results found"
            });
            
            // Close the pinned tab immediately
            chrome.tabs.remove(newTab.id);
            return; // Exit early - we're done here since there are no results
          }
          
          console.log("No 'noResultMessages' found, continuing with scraping...");
          
          // Wait for the page to be fully loaded before scraping
          console.log("Page initial load complete, now waiting for full content to load...");
          await waitForPageLoad(newTab.id);
          
          // Execute script to scrape data from Leboncoin
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            function: scrapeLeboncoinData
          }).then(results => {
            if (results && results[0]?.result) {
              const scrapedItems = results[0].result;
              console.log("Scraped items:", scrapedItems);
              
              // Make sure we have actual items
              if (Array.isArray(scrapedItems) && scrapedItems.length > 0) {
                // Cache the results
                scrapedDataCache[cacheKey] = scrapedItems;
                
                // Send the results to the content script
                chrome.tabs.sendMessage(sourceTabId, {
                  action: "ALTERNATIVES_FOUND",
                  alternatives: scrapedItems
                });
              } else if (scrapedItems.debug) {
                // Handle the debug case - send empty alternatives to break loading state
                chrome.tabs.sendMessage(sourceTabId, {
                  action: "ALTERNATIVES_FOUND",
                  alternatives: [],
                  error: "No items found"
                });
              }
              
              // Close the pinned tab after scraping
              chrome.tabs.remove(newTab.id);
            } else {
              // Send empty array to break loading state
              chrome.tabs.sendMessage(sourceTabId, {
                action: "ALTERNATIVES_FOUND",
                alternatives: [],
                error: "No results from scraping"
              });
              chrome.tabs.remove(newTab.id);
            }
          }).catch(error => {
            console.error("Error scraping Leboncoin:", error);
            // Send error to content script to break loading state
            chrome.tabs.sendMessage(sourceTabId, {
              action: "ALTERNATIVES_FOUND",
              alternatives: [],
              error: error.toString()
            });
            chrome.tabs.remove(newTab.id);
          });
        } catch (error) {
          console.error("Error waiting for page to load:", error);
          // Send error to content script
          chrome.tabs.sendMessage(sourceTabId, {
            action: "ALTERNATIVES_FOUND",
            alternatives: [],
            error: "Error waiting for page to load: " + error.toString()
          });
          chrome.tabs.remove(newTab.id);
        }
      }
    };
    
    // Add the tab update listener
    chrome.tabs.onUpdated.addListener(onTabLoaded);
    
    // Set a timeout to close the tab and send back empty results if scraping takes too long
    setTimeout(() => {
      chrome.tabs.get(newTab.id, (tab) => {
        if (tab) {
          console.log("Closing tab due to timeout");
          // Send empty array to break loading state
          chrome.tabs.sendMessage(sourceTabId, {
            action: "ALTERNATIVES_FOUND",
            alternatives: [],
            error: "Scraping timeout"
          });
          chrome.tabs.remove(newTab.id);
        }
      });
    }, 30000); // 30 seconds timeout (increased from 20 to account for additional waiting)
    
  } catch (error) {
    console.error("Error opening Leboncoin tab:", error);
    // Send error to content script to break loading state
    chrome.tabs.sendMessage(sourceTabId, {
      action: "ALTERNATIVES_FOUND",
      alternatives: [],
      error: error.toString()
    });
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
    
    if (!itemArticles || itemArticles.length === 0) {
      // Try waiting a bit longer and check if ads are loading
      return {
        items: [],
        debug: {
          pageHTML: document.documentElement.outerHTML.substring(0, 10000),
          pageTitle: document.title,
          pageURL: window.location.href
        }
      };
    }
    
    // Map through each article to extract data
    const items = Array.from(itemArticles).map(article => {
      // Store the full HTML of the article
      const html = article.outerHTML;
      
      // Extract minimal data for list display
      // Get title
      const titleElement = article.querySelector('[data-test-id="adcard-title"]') || 
                          article.querySelector('p.text-body-1.text-on-surface') ||
                          article.querySelector('h2') ||
                          article.querySelector('p:not([data-test-id])');
      
      const title = titleElement ? titleElement.textContent.trim() : 'No title found';
      
      // Get price
      const priceElement = article.querySelector('[data-test-id="price"]') || 
                           article.querySelector('p.text-callout.text-on-surface') ||
                           article.querySelector('span.price');
      
      const price = priceElement ? priceElement.textContent.trim() : 'No price found';
      
      // Get image
      const imageElement = article.querySelector('img');
      const image = imageElement ? imageElement.src : '';
      
      // Extract URL - fix the incomplete URL issue
      const linkElement = article.querySelector('a');
      let url = linkElement ? linkElement.href : '';
      
      // If the URL is relative, make it absolute
      if (url && url.startsWith('/')) {
        url = 'https://www.leboncoin.fr' + url;
      }
      
      return {
        id: Math.random().toString(36).substring(2, 15),
        title,
        price,
        image,
        url,
        html  // Store the full HTML of the article
      };
    }).filter(item => item.title !== 'No title found'); // Filter out items with no title
    
    console.log(`Processed ${items.length} items`);
    
    // If no items were found, return debugging information
    if (items.length === 0) {
      const allArticlesHTML = Array.from(document.querySelectorAll('article')).map(a => a.outerHTML);
      
      return {
        items: [],
        debug: {
          pageHTML: document.documentElement.outerHTML.substring(0, 10000), // First 10000 chars
          articleCount: document.querySelectorAll('article').length,
          articleHTML: allArticlesHTML
        }
      };
    }
    
    return items;
  } catch (error) {
    console.error("Error scraping Leboncoin:", error);
    return {
      items: [],
      error: error.toString(),
      stack: error.stack,
      pageHTML: document.documentElement.outerHTML.substring(0, 10000) // First 10000 chars for debugging
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
