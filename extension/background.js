// Cache to store scraped data
let scrapedDataCache = {};
// Track ongoing scraping operations
let activeScrapingOperations = {};

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open the install success page when the extension is installed
    chrome.tabs.create({
      url: chrome.runtime.getURL('install-success.html')
    });
  }
});

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
        }).catch(error => {
          console.error("Error sending product info to content script:", error);
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
  console.log("Waiting for fully load");
  
  const startTime = Date.now();
  
  // Check page load status every 500ms
  while (Date.now() - startTime < timeout) {
    const isLoaded = await checkPageLoaded(tabId);
    
    if (isLoaded) {
      console.log("Page fully loaded after", (Date.now() - startTime), "ms");
      // Additional delay to ensure dynamic content is rendered
      return new Promise(resolve => setTimeout(resolve, 500));
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
  
  // Generate a unique operation ID for tracking this search
  const operationId = Date.now().toString();
  
  // Track this operation as active
  activeScrapingOperations[operationId] = {
    query: searchQuery,
    sourceTabId: sourceTabId,
    status: 'starting',
    startTime: Date.now()
  };
  
  // Notify content script that we've acknowledged the request
  try {
    await chrome.tabs.sendMessage(sourceTabId, {
      action: "SCRAPING_ACKNOWLEDGED",
      operationId: operationId
    });
  } catch (error) {
    console.error("Error acknowledging scraping request:", error);
    delete activeScrapingOperations[operationId];
    return;
  }
  
  // Apply the trimming function to the search query
  const trimmedQuery = trimProductTitle(searchQuery);
  console.log("Trimmed query for better search results:", trimmedQuery);
  
  // Check if we have cached data for this query
  const cacheKey = trimmedQuery.trim().toLowerCase();
  if (scrapedDataCache[cacheKey]) {
    console.log("Using cached data for query:", cacheKey);
    
    // Send the cached data to the content script
    try {
      await chrome.tabs.sendMessage(sourceTabId, {
        action: "ALTERNATIVES_FOUND",
        alternatives: scrapedDataCache[cacheKey],
        operationId: operationId
      });
      
      // Update operation status
      activeScrapingOperations[operationId].status = 'completed_from_cache';
      setTimeout(() => {
        delete activeScrapingOperations[operationId];
      }, 5000); // Clean up after 5 seconds
      
      return;
    } catch (error) {
      console.error("Error sending cached alternatives:", error);
      delete activeScrapingOperations[operationId];
      return;
    }
  }
  
  // Update operation status
  activeScrapingOperations[operationId].status = 'creating_tab';
  
  // Create the search URL for Leboncoin
  const searchUrl = `https://www.leboncoin.fr/recherche?text=${encodeURIComponent(trimmedQuery)}`;
  
  try {
    // Open a new pinned tab with the search URL
    const newTab = await chrome.tabs.create({
      url: searchUrl,
      pinned: true,
      active: false
    });
    
    // Update operation status
    activeScrapingOperations[operationId].status = 'tab_created';
    activeScrapingOperations[operationId].tabId = newTab.id;
    
    // Store the source tab ID and query for later reference
    const scrapingData = {
      sourceTabId: sourceTabId,
      query: trimmedQuery,
      timestamp: Date.now(),
      operationId: operationId
    };
    
    // Store the scraping data in local storage
    chrome.storage.local.set({ 
      [`scraping_${newTab.id}`]: scrapingData 
    });
    
    // Wait 1 second after creating the tab before checking for no results
    console.log("Waiting 1 seconds before checking for no results...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if tab still exists before proceeding
    try {
      await chrome.tabs.get(newTab.id);
      activeScrapingOperations[operationId].status = 'checking_results';
    } catch (error) {
      console.log(`Tab ${newTab.id} no longer exists, stopping operation`);
      activeScrapingOperations[operationId].status = 'tab_closed_prematurely';
      delete activeScrapingOperations[operationId];
      return;
    }
    
    console.log("Checking for 'no results' message...");
    const noResultsFound = await checkNoResults(newTab.id);
    
    // If 'no results' is found, terminate early
    if (noResultsFound) {
      console.log("'No results' message found, terminating search early.");
      activeScrapingOperations[operationId].status = 'no_results_found';
      
      // Send empty alternatives array to trigger "no results" UI
      try {
        await chrome.tabs.sendMessage(sourceTabId, {
          action: "ALTERNATIVES_FOUND",
          alternatives: [],
          error: "No results found",
          operationId: operationId
        });
      } catch (error) {
        console.error("Error sending no results message:", error);
      }
      
      // Safe tab removal - check if it exists first
      await safeRemoveTab(newTab.id);
      
      // Clean up operation tracking
      setTimeout(() => {
        delete activeScrapingOperations[operationId];
      }, 5000); // Clean up after 5 seconds
      
      return; // Exit early - we're done here since there are no results
    }
    
    // Notify content script that scraping has started
    activeScrapingOperations[operationId].status = 'scraping_started';
    try {
      await chrome.tabs.sendMessage(sourceTabId, {
        action: "SCRAPING_STARTED",
        operationId: operationId
      });
    } catch (error) {
      console.log(`Source tab ${sourceTabId} may no longer exist: ${error.message}`);
      // If the source tab doesn't exist anymore, no point in continuing
      activeScrapingOperations[operationId].status = 'source_tab_closed';
      await safeRemoveTab(newTab.id);
      delete activeScrapingOperations[operationId];
      return;
    }
    
    // Start scraping directly after the "no results" check
    console.log("No results check passed, waiting 500 ms before scraping...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if tab still exists before proceeding with scraping
    if (!(await tabExists(newTab.id))) {
      console.log(`Tab ${newTab.id} no longer exists, stopping operation`);
      activeScrapingOperations[operationId].status = 'tab_closed_before_scraping';
      delete activeScrapingOperations[operationId];
      return;
    }
    
    // Update operation status
    activeScrapingOperations[operationId].status = 'executing_scraper';
    
    try {
      // Execute script to scrape data from Leboncoin
      chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        function: scrapeLeboncoinData
      }).then(async results => {
        activeScrapingOperations[operationId].status = 'scraping_completed';
        
        if (results && results[0]?.result) {
          const scrapedItems = results[0].result;
          console.log("Scraped items:", scrapedItems);
          
          // Make sure we have actual items
          if (Array.isArray(scrapedItems) && scrapedItems.length > 0) {
            // Cache the results
            scrapedDataCache[cacheKey] = scrapedItems;
            activeScrapingOperations[operationId].status = 'sending_results';
            
            // Check if source tab still exists before sending message
            try {
              await chrome.tabs.get(sourceTabId);
              // Send the results to the content script
              await chrome.tabs.sendMessage(sourceTabId, {
                action: "ALTERNATIVES_FOUND",
                alternatives: scrapedItems,
                operationId: operationId
              });
              
              activeScrapingOperations[operationId].status = 'results_sent';
            } catch (error) {
              console.log(`Source tab ${sourceTabId} no longer exists: ${error.message}`);
              activeScrapingOperations[operationId].status = 'source_tab_closed_after_scraping';
            }
          } else if (scrapedItems.debug) {
            // Handle the debug case - check if source tab exists before sending message
            activeScrapingOperations[operationId].status = 'no_items_found';
            if (await tabExists(sourceTabId)) {
              await chrome.tabs.sendMessage(sourceTabId, {
                action: "ALTERNATIVES_FOUND",
                alternatives: [],
                error: "No items found",
                operationId: operationId
              });
            }
          }
          
          // Safely close the pinned tab after scraping
          await safeRemoveTab(newTab.id);
        } else {
          // Update status for empty results
          activeScrapingOperations[operationId].status = 'empty_scraping_results';
          
          // Check if source tab exists before sending message
          if (await tabExists(sourceTabId)) {
            // Send empty array to break loading state
            await chrome.tabs.sendMessage(sourceTabId, {
              action: "ALTERNATIVES_FOUND",
              alternatives: [],
              error: "No results from scraping",
              operationId: operationId
            });
          }
          await safeRemoveTab(newTab.id);
        }
        
        // Clean up operation tracking after 5 seconds
        setTimeout(() => {
          delete activeScrapingOperations[operationId];
        }, 5000);
        
      }).catch(async error => {
        console.error("Error scraping Leboncoin:", error);
        activeScrapingOperations[operationId].status = 'scraping_error';
        activeScrapingOperations[operationId].error = error.toString();
        
        // Check if source tab exists before sending error message
        if (await tabExists(sourceTabId)) {
          // Send error to content script to break loading state
          await chrome.tabs.sendMessage(sourceTabId, {
            action: "ALTERNATIVES_FOUND",
            alternatives: [],
            error: error.toString(),
            operationId: operationId
          });
        }
        await safeRemoveTab(newTab.id);
        
        // Clean up operation tracking after 5 seconds
        setTimeout(() => {
          delete activeScrapingOperations[operationId];
        }, 5000);
      });
    } catch (error) {
      console.error("Error waiting before scraping:", error);
      activeScrapingOperations[operationId].status = 'pre_scraping_error';
      activeScrapingOperations[operationId].error = error.toString();
      
      // Check if source tab exists before sending error message
      if (await tabExists(sourceTabId)) {
        // Send error to content script
        await chrome.tabs.sendMessage(sourceTabId, {
          action: "ALTERNATIVES_FOUND",
          alternatives: [],
          error: "Error waiting before scraping: " + error.toString(),
          operationId: operationId
        });
      }
      await safeRemoveTab(newTab.id);
      
      // Clean up operation tracking
      setTimeout(() => {
        delete activeScrapingOperations[operationId];
      }, 5000);
    }
    
    // Set a timeout to close the tab and send back empty results if scraping takes too long
    const timeoutId = setTimeout(async () => {
      // First check if the operation is still active
      if (!activeScrapingOperations[operationId]) {
        return; // Operation already completed
      }
      
      activeScrapingOperations[operationId].status = 'timeout';
      
      // First check if the source tab still exists
      const sourceTabExists = await tabExists(sourceTabId);
      
      // Then check if the scraping tab still exists
      if (await tabExists(newTab.id)) {
        console.log("Closing tab due to timeout");
        
        // Only send message if source tab still exists
        if (sourceTabExists) {
          await chrome.tabs.sendMessage(sourceTabId, {
            action: "ALTERNATIVES_FOUND",
            alternatives: [],
            error: "Scraping timeout",
            operationId: operationId
          });
        }
        await safeRemoveTab(newTab.id);
      }
      
      // Clean up operation tracking
      delete activeScrapingOperations[operationId];
    }, 30000); // 30 seconds timeout
    
    // Store timeout ID in the operation tracking
    activeScrapingOperations[operationId].timeoutId = timeoutId;
    
  } catch (error) {
    console.error("Error opening Leboncoin tab:", error);
    activeScrapingOperations[operationId].status = 'tab_creation_error';
    activeScrapingOperations[operationId].error = error.toString();
    
    // Check if source tab still exists before sending message
    if (await tabExists(sourceTabId)) {
      // Send error to content script to break loading state
      await chrome.tabs.sendMessage(sourceTabId, {
        action: "ALTERNATIVES_FOUND",
        alternatives: [],
        error: error.toString(),
        operationId: operationId
      });
    }
    
    // Clean up operation tracking
    setTimeout(() => {
      delete activeScrapingOperations[operationId];
    }, 5000);
  }
}

// Helper function to check if a tab exists
async function tabExists(tabId) {
  try {
    await chrome.tabs.get(tabId);
    return true;
  } catch (error) {
    console.log(`Tab ${tabId} does not exist: ${error.message}`);
    return false;
  }
}

// Helper function to safely remove a tab
async function safeRemoveTab(tabId) {
  try {
    await chrome.tabs.get(tabId);
    chrome.tabs.remove(tabId);
    console.log(`Tab ${tabId} removed successfully`);
  } catch (error) {
    console.log(`Cannot remove tab ${tabId}: ${error.message}`);
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

// New function to get active scraping operations status
function getScrapingStatus() {
  return {
    activeOperations: Object.keys(activeScrapingOperations).length,
    operations: activeScrapingOperations,
    cacheSize: Object.keys(scrapedDataCache).length
  };
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
  } else if (message.action === "CHECK_SCRAPING_STATUS") {
    // Return the current status of scraping operations
    sendResponse({
      status: getScrapingStatus()
    });
    return false; // We've responded synchronously
  } else if (message.action === "RETRY_SCRAPING") {
    // Handle retry request
    const productInfo = message.productInfo;
    
    if (productInfo && productInfo.title) {
      // Force clear any cached data for this query to ensure fresh scraping
      const trimmedQuery = trimProductTitle(productInfo.title);
      const cacheKey = trimmedQuery.trim().toLowerCase();
      
      // Remove from cache if it exists
      if (scrapedDataCache[cacheKey]) {
        delete scrapedDataCache[cacheKey];
      }
      
      // Open Leboncoin tab with the product title as search query (force new search)
      openLeboncoinTab(productInfo.title, sender.tab.id);
      
      sendResponse({
        success: true,
        message: "Retrying search for alternatives..."
      });
    } else {
      sendResponse({
        success: false,
        message: "No product information provided for retry"
      });
    }
    
    return true; // Indicates we'll respond asynchronously
  }
});

// Listen for tab removal to clean up any related operations
chrome.tabs.onRemoved.addListener((tabId) => {
  // Find any operations associated with this tab and clean them up
  Object.keys(activeScrapingOperations).forEach(opId => {
    const op = activeScrapingOperations[opId];
    if (op.tabId === tabId || op.sourceTabId === tabId) {
      // Clear any associated timeouts
      if (op.timeoutId) {
        clearTimeout(op.timeoutId);
      }
      
      // Remove the operation
      delete activeScrapingOperations[opId];
      console.log(`Cleaned up operation ${opId} because tab ${tabId} was closed`);
    }
  });
});
