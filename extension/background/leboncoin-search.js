
// Function to open a pinned tab to Leboncoin with search query
async function openLeboncoinTab(searchQuery, sourceTabId) {
  console.log("Opening Leboncoin tab with query:", searchQuery);
  
  // Check if we have cached data for this query
  const cacheKey = searchQuery.trim().toLowerCase();
  if (globalThis.scrapedDataCache && globalThis.scrapedDataCache[cacheKey]) {
    console.log("Using cached data for query:", cacheKey);
    
    // Send the cached data to the content script
    chrome.tabs.sendMessage(sourceTabId, {
      action: "ALTERNATIVES_FOUND",
      alternatives: globalThis.scrapedDataCache[cacheKey]
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
          // Import the scrapeLeboncoinData function
          import('./scraper.js').then(({ scrapeLeboncoinData }) => {
            // Execute script to scrape data from Leboncoin
            chrome.scripting.executeScript({
              target: { tabId: newTab.id },
              func: scrapeLeboncoinData
            }).then(results => {
              if (results && results[0]?.result) {
                const scrapedItems = results[0].result;
                console.log("Scraped items:", scrapedItems);
                
                // Ensure global cache exists
                if (!globalThis.scrapedDataCache) {
                  globalThis.scrapedDataCache = {};
                }
                
                // Cache the results
                globalThis.scrapedDataCache[cacheKey] = scrapedItems;
                
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

export { openLeboncoinTab };
