// Create and inject extension UI
function createExtensionUI() {
  // Create container for the extension
  const container = document.createElement('div');
  container.id = 'amazon-alternative-finder';
  container.className = 'aaf-container';
  document.body.appendChild(container);

  // Add initial UI (collapsed state)
  container.innerHTML = `
    <div class="aaf-toggle">
      <div class="aaf-badge" style="display: none;">
        <span>0</span>
      </div>
      <div class="aaf-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 16v-8h-8" />
          <path d="M8 8v8h8" />
        </svg>
      </div>
    </div>
    <div class="aaf-panel">
      <div class="aaf-header">
        <div>
          <div class="aaf-header-title">Amazon Alternative Finder</div>
          <div class="aaf-header-subtitle">Second-hand alternatives</div>
        </div>
        <button class="aaf-close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="aaf-content">
        <div class="aaf-loading">
          <div class="aaf-spinner"></div>
          <p>Finding alternatives...</p>
        </div>
        <div class="aaf-results" style="display: none;">
          <p class="aaf-results-count">Found 0 alternatives on Leboncoin</p>
          <div class="aaf-items"></div>
        </div>
        <div class="aaf-no-results" style="display: none;">
          <div class="aaf-no-results-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.5 14.5 3 21" />
              <path d="M9.5 14.5a5 5 0 1 1 7.1 7.1" />
              <circle cx="15.5" cy="8.5" r="5" />
              <path d="M19.31 19.31A7 7 0 0 0 21 15.5" />
            </svg>
            <p>No second-hand alternatives found</p>
            <p class="aaf-no-results-subtitle">Try again later or check other products</p>
          </div>
        </div>
      </div>
      <div class="aaf-footer">
        <div class="aaf-feedback-text">Was this helpful?</div>
        <div class="aaf-feedback-buttons">
          <button class="aaf-feedback-btn aaf-yes-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 10v12"></path>
              <path d="M15 5.88 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
            </svg>
            Yes
          </button>
          <button class="aaf-feedback-btn aaf-no-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 14V2"></path>
              <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
            </svg>
            No
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const toggle = container.querySelector('.aaf-toggle');
  const closeBtn = container.querySelector('.aaf-close-btn');
  
  toggle.addEventListener('click', () => {
    container.classList.toggle('aaf-expanded');
    
    // Only trigger search when clicking the toggle button
    if (container.classList.contains('aaf-expanded')) {
      // Get product info and trigger search
      chrome.runtime.sendMessage({ action: "GET_PRODUCT_INFO" }, (productInfo) => {
        if (productInfo) {
          console.log("User clicked toggle, getting alternatives for:", productInfo);
          
          // Check if we have cached results in session storage first
          chrome.storage.session.get(['leboncoinResults'], (result) => {
            const cachedData = result.leboncoinResults;
            
            // Reset display states
            const loading = container.querySelector('.aaf-loading');
            const results = container.querySelector('.aaf-results');
            const noResults = container.querySelector('.aaf-no-results');
            
            loading.style.display = 'flex';
            results.style.display = 'none';
            noResults.style.display = 'none';

            // If we have cached results, use them immediately
            if (cachedData && cachedData.productTitle === productInfo.title) {
              console.log('Using cached Leboncoin results');
              renderAlternatives(cachedData.alternatives || [], cachedData.count || 0);
            } else {
              console.log('Requesting alternatives from background script');
              // Request alternatives using the product info
              chrome.runtime.sendMessage({
                action: "GET_ALTERNATIVES",
                productInfo: productInfo
              }, response => {
                console.log('Received response from background:', response);
                
                if (response) {
                  // Cache the results in session storage
                  chrome.storage.session.set({
                    'leboncoinResults': {
                      productTitle: productInfo.title,
                      count: response.count || 0,
                      alternatives: response.alternatives || [],
                      timestamp: Date.now()
                    }
                  });
                  
                  renderAlternatives(response.alternatives || [], response.count || 0);
                } else {
                  // Handle case when response is undefined or null
                  renderAlternatives([], 0);
                }
              });
            }
          });
        }
      });
    }
  });
  
  closeBtn.addEventListener('click', () => {
    container.classList.remove('aaf-expanded');
  });

  return container;
}

// Render alternatives in the panel
function renderAlternatives(alternatives, count) {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;

  const loading = container.querySelector('.aaf-loading');
  const results = container.querySelector('.aaf-results');
  const noResults = container.querySelector('.aaf-no-results');
  const resultsCount = container.querySelector('.aaf-results-count');
  const itemsContainer = container.querySelector('.aaf-items');
  const badge = container.querySelector('.aaf-badge');
  const badgeCount = container.querySelector('.aaf-badge span');
  const toggle = container.querySelector('.aaf-toggle');

  // Handle no alternatives case
  if (count === 0) {
    loading.style.display = 'none';
    results.style.display = 'none';
    noResults.style.display = 'flex';
    badge.style.display = 'none';
    
    // Don't show the toggle button if no alternatives found
    toggle.style.display = 'none';
    
    // Hide the entire extension container after 3 seconds if no alternatives
    setTimeout(() => {
      container.style.display = 'none';
    }, 3000);
    
    return;
  }

  // Update the badge
  badgeCount.textContent = count;
  badge.style.display = 'flex';
  
  // Make sure toggle is visible
  toggle.style.display = 'flex';

  // Update the count text
  resultsCount.textContent = `Found ${count} alternative${count !== 1 ? 's' : ''} on Leboncoin`;

  // Clear previous results
  itemsContainer.innerHTML = '';

  // Add each alternative
  alternatives.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'aaf-item';
    itemElement.innerHTML = `
      <div class="aaf-item-image">
        <img src="${item.image}" alt="${item.title}">
        <div class="aaf-item-location">${item.location}</div>
      </div>
      <div class="aaf-item-content">
        <h4 class="aaf-item-title">${item.title}</h4>
        <div class="aaf-item-footer">
          <span class="aaf-item-price">${item.price}</span>
          <a href="${item.url}" target="_blank" class="aaf-item-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            View
          </a>
        </div>
      </div>
    `;
    itemsContainer.appendChild(itemElement);
  });

  // Hide loading and no results, show results
  loading.style.display = 'none';
  noResults.style.display = 'none';
  results.style.display = 'block';
}

// Check if we're on an Amazon product page and create the UI
function initializeOnAmazonProductPage() {
  if (window.location.href.match(/amazon\.fr.*\/dp\//)) {
    console.log("Amazon product page detected, creating UI");
    let container = document.getElementById('amazon-alternative-finder');
    if (!container) {
      createExtensionUI();
    }
  }
}

// Initialize on page load
initializeOnAmazonProductPage();

// Listen for URL changes (for single-page navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    initializeOnAmazonProductPage();
  }
}).observe(document, {subtree: true, childList: true});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // We no longer need to handle PRODUCT_INFO messages as we're not auto-displaying results
  // We only handle messages related to the Leboncoin scraping tab
});

// Add listener for Leboncoin page if this is the scraping tab
if (window.location.href.includes('leboncoin.fr/recherche')) {
  console.log('This is a Leboncoin scraping tab - content script loaded');
}
