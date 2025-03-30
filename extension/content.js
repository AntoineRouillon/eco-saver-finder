
// Variable to store product information
let currentProductInfo = null;
// Variable to store all alternatives for filtering
let allAlternatives = [];
// Current filter settings
let currentFilter = {
  type: 'none', // 'none', 'price-asc', 'price-desc', 'date-asc', 'date-desc'
  label: 'No filter' // Display label
};
// Store the current URL to detect page changes
let currentUrl = window.location.href;
// Object to cache alternatives by product URL
let alternativesCache = {};

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
      <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="Amazon Alternative Finder">
      <span class="aaf-toggle-text">Search on leboncoin</span>
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
          <div class="aaf-filter-controls">
            <p class="aaf-results-count">Found 0 alternatives on Leboncoin</p>
            <div class="aaf-filter-container">
              <button class="aaf-filter-button" title="Filter results">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
              <div class="aaf-filter-menu">
                <div class="aaf-filter-option aaf-active" data-filter="none">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>No filter</span>
                </div>
                <div class="aaf-filter-option" data-filter="price-asc">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Price: Low to High</span>
                </div>
                <div class="aaf-filter-option" data-filter="price-desc">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Price: High to Low</span>
                </div>
                <div class="aaf-filter-option" data-filter="date-asc">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Date: Newest First</span>
                </div>
                <div class="aaf-filter-option" data-filter="date-desc">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Date: Oldest First</span>
                </div>
              </div>
            </div>
          </div>
          <div class="aaf-items"></div>
        </div>
      </div>
      <div class="aaf-footer">
        <div class="aaf-feedback-text">Was this helpful?</div>
        <div class="aaf-feedback-buttons">
          <button class="aaf-feedback-btn aaf-yes-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 10v12"></path>
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
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
    
    // If we're expanding and have product info but no alternatives loaded yet, fetch them
    if (container.classList.contains('aaf-expanded') && currentProductInfo) {
      // Check if we have cached alternatives for this product
      if (alternativesCache[window.location.href]) {
        console.log("Using cached alternatives for:", window.location.href);
        renderAlternatives(alternativesCache[window.location.href]);
      } else {
        requestAlternatives(currentProductInfo);
      }
    }
  });
  
  closeBtn.addEventListener('click', () => {
    container.classList.remove('aaf-expanded');
  });

  // Add filter button listener
  const filterButton = container.querySelector('.aaf-filter-button');
  const filterMenu = container.querySelector('.aaf-filter-menu');
  
  filterButton.addEventListener('click', (event) => {
    event.stopPropagation();
    filterMenu.classList.toggle('aaf-show-menu');
  });
  
  // Add click event listeners to filter options
  const filterOptions = container.querySelectorAll('.aaf-filter-option');
  filterOptions.forEach(option => {
    option.addEventListener('click', () => {
      const filterType = option.getAttribute('data-filter');
      const filterLabel = option.querySelector('span:last-child').textContent;
      
      // Update filter and close menu
      if (filterType) {
        currentFilter.type = filterType;
        currentFilter.label = filterLabel;
        updateFilterUI();
        renderFilteredAlternatives();
        filterMenu.classList.remove('aaf-show-menu');
      }
    });
  });
  
  // Close filter menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.aaf-filter-container')) {
      const allFilterMenus = document.querySelectorAll('.aaf-filter-menu');
      allFilterMenus.forEach(menu => menu.classList.remove('aaf-show-menu'));
    }
  });

  return container;
}

// Update the filter button UI to reflect the current filter
function updateFilterUI() {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;
  
  const filterButton = container.querySelector('.aaf-filter-button');
  const filterOptions = container.querySelectorAll('.aaf-filter-option');
  
  // Update active state of filter button
  if (currentFilter.type === 'none') {
    filterButton.classList.remove('active');
  } else {
    filterButton.classList.add('active');
  }
  
  // Update active state in filter menu
  filterOptions.forEach(option => {
    option.classList.remove('aaf-active');
    
    const optionFilter = option.getAttribute('data-filter');
    
    if (optionFilter === currentFilter.type) {
      option.classList.add('aaf-active');
    }
  });
}

// Function to request alternatives from the background script
function requestAlternatives(productInfo) {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;
  
  const loading = container.querySelector('.aaf-loading');
  const results = container.querySelector('.aaf-results');
  
  // Show loading state
  if (loading && results) {
    loading.style.display = 'flex';
    results.style.display = 'none';
  }
  
  // Check if we have cached alternatives for this product
  if (alternativesCache[window.location.href]) {
    console.log("Using cached alternatives for:", window.location.href);
    renderAlternatives(alternativesCache[window.location.href]);
    return;
  }
  
  // Request alternatives from background script
  chrome.runtime.sendMessage({
    action: "GET_ALTERNATIVES",
    productInfo: productInfo
  }, response => {
    console.log("Got response from background script:", response);
    // The actual alternatives will come through a separate message
  });
}

// Create a card from the raw article HTML
function createCardFromRawHTML(item) {
  const itemElement = document.createElement('div');
  itemElement.className = 'aaf-item';
  
  // Parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.html, 'text/html');
  const article = doc.querySelector('article');
  
  if (!article) {
    console.error('No article element found in HTML');
    return null;
  }
  
  // Try to extract basic information for display
  // Price
  const price = extractTextContent(article, '[data-test-id="price"]') || 
                extractTextContent(article, '.text-callout.text-on-surface') || 
                'Price not available';
  
  // Title
  const title = extractTextContent(article, '[data-test-id="adcard-title"]') || 
                extractTextContent(article, '.text-body-1.text-on-surface') ||
                extractTextContent(article, 'h2') || 
                'Item title';
  
  // Location
  const location = extractTextContent(article, '.text-caption.text-neutral:last-child') || 
                  extractTextContent(article, 'p[aria-label*="Située à"]') || 
                  extractTextContent(article, '.text-caption.text-neutral') || 
                  'Location not available';
  
  // Image
  let imageUrl = '';
  const imgElement = article.querySelector('img');
  if (imgElement && imgElement.src) {
    imageUrl = imgElement.src;
  }
  
  // Check for badges
  const isPro = article.textContent.includes('Pro');
  const hasDelivery = article.textContent.includes('Livraison possible');
  
  // Create badge HTML
  let badges = '';
  if (isPro) {
    badges += '<span class="aaf-badge-pro">Pro</span>';
  }
  if (hasDelivery) {
    badges += '<span class="aaf-badge-delivery">Livraison possible</span>';
  }
  
  // Get URL (if available)
  let url = item.url || '#';
  if (url && url.startsWith('/')) {
    url = 'https://www.leboncoin.fr' + url;
  }

  // Extract date if available (for sorting)
  let dateInfo = '';
  const dateElement = article.querySelector('[data-test-id="ad-date"]') || 
                     article.querySelector('.text-caption[aria-label*="il y a"]');
  if (dateElement) {
    dateInfo = dateElement.textContent.trim();
    // Store as data attribute for sorting
    itemElement.dataset.date = dateInfo;
  }
  
  // Store numeric price for sorting
  const numericPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
  itemElement.dataset.price = isNaN(numericPrice) ? '0' : numericPrice.toString();
  
  // Build the item card HTML
  itemElement.innerHTML = `
    <div class="aaf-item-image">
      <img src="${imageUrl}" alt="${title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
      <div class="aaf-item-location">${location}</div>
    </div>
    <div class="aaf-item-content">
      <h4 class="aaf-item-title">${title}</h4>
      <div class="aaf-item-badges">${badges}</div>
      <div class="aaf-item-footer">
        <span class="aaf-item-price">${price}</span>
        <a href="${url}" target="_blank" class="aaf-item-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          View
        </a>
      </div>
    </div>
    <div class="aaf-item-raw-html" style="display: none;">
      ${item.html}
    </div>
  `;
  
  return itemElement;
}

// Helper function to extract text content from elements
function extractTextContent(parentElement, selector) {
  const element = parentElement.querySelector(selector);
  return element ? element.textContent.trim() : null;
}

// Apply current filters to alternatives and render them
function renderFilteredAlternatives() {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;
  
  const itemsContainer = container.querySelector('.aaf-items');
  if (!itemsContainer) return;
  
  // Clear the container
  itemsContainer.innerHTML = '';
  
  // Create a copy of the alternatives to sort
  const filteredAlternatives = [...allAlternatives];
  
  // Apply sorting if a filter is active
  if (currentFilter.type !== 'none') {
    filteredAlternatives.sort((a, b) => {
      const elemA = document.createElement('div');
      const elemB = document.createElement('div');
      
      // Create temporary elements to extract comparable values
      const cardA = createCardFromRawHTML({ ...a });
      const cardB = createCardFromRawHTML({ ...b });
      
      if (!cardA || !cardB) return 0;
      
      let valueA, valueB;
      let sortMultiplier = 1;
      
      if (currentFilter.type.startsWith('price')) {
        valueA = parseFloat(cardA.dataset.price) || 0;
        valueB = parseFloat(cardB.dataset.price) || 0;
        sortMultiplier = currentFilter.type === 'price-asc' ? 1 : -1;
      } else if (currentFilter.type.startsWith('date')) {
        // For date, we're using the date text which may be relative
        valueA = cardA.dataset.date || '';
        valueB = cardB.dataset.date || '';
        
        // Simple heuristic for relative date sorting (not perfect but a starting point)
        if (valueA.includes('min') && valueB.includes('h')) return currentFilter.type === 'date-asc' ? -1 : 1;
        if (valueA.includes('h') && valueB.includes('min')) return currentFilter.type === 'date-asc' ? 1 : -1;
        if (valueA.includes('h') && valueB.includes('h')) {
          const hoursA = parseInt(valueA.match(/\d+/)[0]) || 0;
          const hoursB = parseInt(valueB.match(/\d+/)[0]) || 0;
          return currentFilter.type === 'date-asc' ? hoursA - hoursB : hoursB - hoursA;
        }
        if (valueA.includes('j') && !valueB.includes('j')) return currentFilter.type === 'date-asc' ? 1 : -1;
        if (!valueA.includes('j') && valueB.includes('j')) return currentFilter.type === 'date-asc' ? -1 : 1;
        if (valueA.includes('j') && valueB.includes('j')) {
          const daysA = parseInt(valueA.match(/\d+/)[0]) || 0;
          const daysB = parseInt(valueB.match(/\d+/)[0]) || 0;
          return currentFilter.type === 'date-asc' ? daysA - daysB : daysB - daysA;
        }
        return valueA.localeCompare(valueB);
      }
      
      return (valueA - valueB) * sortMultiplier;
    });
  }
  
  // Render the sorted alternatives
  filteredAlternatives.forEach(item => {
    if (item.html) {
      const itemElement = createCardFromRawHTML(item);
      if (itemElement) {
        itemsContainer.appendChild(itemElement);
      }
    }
  });
}

// Render alternatives in the panel
function renderAlternatives(alternatives) {
  console.log("Rendering alternatives:", alternatives);
  
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;

  const loading = container.querySelector('.aaf-loading');
  const results = container.querySelector('.aaf-results');
  const resultsCount = container.querySelector('.aaf-results-count');
  const toggleText = container.querySelector('.aaf-toggle-text');
  const filterControls = container.querySelector('.aaf-filter-controls');
  const itemsContainer = container.querySelector('.aaf-items');

  // Hide loading state
  if (loading) {
    loading.style.display = 'none';
  }

  // Check if alternatives is an array and has items
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    // Display new no results UI
    if (results) {
      results.style.display = 'block';
      
      // Hide the filter controls and results count
      if (filterControls) {
        filterControls.style.display = 'none';
      }
      
      // Add the new no results UI
      if (itemsContainer) {
        itemsContainer.innerHTML = `
          <div class="aaf-no-results">
            <svg class="aaf-no-results-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.7 122.88">
              <path d="M53.62 0c14.81 0 28.21 6 37.91 15.7 9.7 9.7 15.7 23.11 15.7 37.91 0 10.83-3.21 20.91-8.74 29.35l23.2 25.29-16 14.63-22.37-24.62a53.359 53.359 0 01-29.7 8.98c-14.81 0-28.21-6-37.91-15.7C6 81.82 0 68.42 0 53.62 0 38.81 6 25.41 15.7 15.7 25.41 6 38.81 0 53.62 0zm8.01 38.91a4.747 4.747 0 016.76-.02 4.868 4.868 0 01.02 6.83l-8.17 8.29 8.18 8.3c1.85 1.88 1.82 4.92-.05 6.79-1.88 1.87-4.9 1.87-6.74-.01l-8.13-8.24-8.14 8.26a4.747 4.747 0 01-6.76.02 4.868 4.868 0 01-.02-6.83l8.17-8.3-8.18-8.3c-1.85-1.88-1.82-4.92.06-6.79 1.88-1.87 4.9-1.87 6.74.01l8.13 8.24 8.13-8.25zM87.3 19.93C78.68 11.31 66.77 5.98 53.62 5.98c-13.15 0-25.06 5.33-33.68 13.95-8.63 8.62-13.96 20.53-13.96 33.69 0 13.15 5.33 25.06 13.95 33.68 8.62 8.62 20.53 13.95 33.68 13.95 13.16 0 25.06-5.33 33.68-13.95 8.62-8.62 13.95-20.53 13.95-33.68.01-13.16-5.32-25.07-13.94-33.69z" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
            <div class="aaf-no-results-text">No alternative found</div>
          </div>
        `;
      }
    }
    
    // Reset toggle text if no results
    if (toggleText) {
      toggleText.textContent = "Search on leboncoin";
      toggleText.classList.remove('has-alternatives');
    }
    
    return;
  }

  // Show filter controls for when we have results
  if (filterControls) {
    filterControls.style.display = 'flex';
  }

  // Store all alternatives for filtering
  allAlternatives = [...alternatives];
  
  // Cache the alternatives for this product URL
  alternativesCache[window.location.href] = alternatives;
  
  // Update the toggle text with the count
  if (toggleText) {
    toggleText.textContent = `${alternatives.length} alternatives`;
    toggleText.classList.add('has-alternatives');
  }

  // Update the count text
  if (resultsCount) {
    resultsCount.textContent = `Found ${alternatives.length} alternatives on Leboncoin`;
  }

  // Apply any active filters and render
  if (currentFilter.type !== 'none') {
    renderFilteredAlternatives();
  } else {
    // If no filter is active, render normally
    if (itemsContainer) {
      itemsContainer.innerHTML = '';
  
      // Add each alternative as a card
      alternatives.forEach(item => {
        if (item.html) {
          const itemElement = createCardFromRawHTML(item);
          if (itemElement) {
            itemsContainer.appendChild(itemElement);
          }
        }
      });
    }
  }

  // Show results
  if (results) {
    results.style.display = 'block';
  }

  // Reset filter buttons to default state
  updateFilterUI();
  
  // Store the alternatives in sessionStorage for persistence
  try {
    // Store with URL key to differentiate between products
    sessionStorage.setItem(`aaf_alternatives_${window.location.pathname}`, JSON.stringify(alternatives));
    
    // Also store the entire cache
    sessionStorage.setItem('aaf_alternatives_cache', JSON.stringify(alternativesCache));
  } catch (error) {
    console.error("Error storing alternatives in sessionStorage:", error);
  }
}

// Check if the current URL is an Amazon product page
function isAmazonProductPage() {
  return window.location.href.match(/amazon\.fr.*\/dp\//);
}

// Reset the UI state when navigating to a new product
function resetUI() {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;
  
  // Reset toggle text
  const toggleText = container.querySelector('.aaf-toggle-text');
  if (toggleText) {
    toggleText.textContent = "Search on leboncoin";
    toggleText.classList.remove('has-alternatives');
  }
  
  // Reset alternatives
  allAlternatives = [];
  
  // Show loading if panel is expanded
  if (container.classList.contains('aaf-expanded')) {
    const loading = container.querySelector('.aaf-loading');
    const results = container.querySelector('.aaf-results');
    
    if (loading && results) {
      loading.style.display = 'flex';
      results.style.display = 'none';
    }
    
    // If we have cached alternatives for this URL, display them
    if (alternativesCache[window.location.href]) {
      console.log("Using cached alternatives after URL change:", window.location.href);
      renderAlternatives(alternativesCache[window.location.href]);
    }
  }
}

// Initialize the extension UI
function initExtension() {
  if (isAmazonProductPage()) {
    console.log("Amazon product page detected. Initializing extension...");
    createExtensionUI();
    
    // Try to load alternatives cache from sessionStorage
    try {
      const storedCache = sessionStorage.getItem('aaf_alternatives_cache');
      if (storedCache) {
        alternativesCache = JSON.parse(storedCache);
        console.log("Loaded alternatives cache from sessionStorage:", alternativesCache);
      }
      
      // Check if we have cached alternatives for the current URL
      if (alternativesCache[window.location.href]) {
        console.log("Found cached alternatives for current URL:", window.location.href);
        renderAlternatives(alternativesCache[window.location.href]);
      } else {
        // Try loading URL-specific alternatives from sessionStorage
        const storedAlternatives = sessionStorage.getItem(`aaf_alternatives_${window.location.pathname}`);
        if (storedAlternatives) {
          const parsedAlternatives = JSON.parse(storedAlternatives);
          console.log("Loaded alternatives from sessionStorage:", parsedAlternatives);
          renderAlternatives(parsedAlternatives);
          // Also add to the cache
          alternativesCache[window.location.href] = parsedAlternatives;
        }
      }
    } catch (error) {
      console.error("Error loading alternatives from sessionStorage:", error);
    }
    
    // Set up URL change detection
    currentUrl = window.location.href;
  }
}

// Listen for product info from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === "PRODUCT_INFO") {
    console.log("Received product info:", message.productInfo);
    
    // Store the product info
    currentProductInfo = message.productInfo;
    
    // Initialize UI if it doesn't exist
    let container = document.getElementById('amazon-alternative-finder');
    if (!container) {
      container = createExtensionUI();
    }
  } else if (message.action === "ALTERNATIVES_FOUND") {
    console.log("Received alternatives:", message.alternatives);
    
    // Render the alternatives in the UI
    renderAlternatives(message.alternatives);
    
    // Cache the alternatives for this product URL
    if (message.alternatives && message.alternatives.length > 0) {
      alternativesCache[window.location.href] = message.alternatives;
      
      // Update sessionStorage with the new cache
      try {
        sessionStorage.setItem('aaf_alternatives_cache', JSON.stringify(alternativesCache));
      } catch (error) {
        console.error("Error storing alternatives cache in sessionStorage:", error);
      }
    }
  }
});

// Initialize the extension when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

// Set up URL change detection with MutationObserver to reset badge when navigating to a new product
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to', url);
    resetUI();
  }
}).observe(document, {subtree: true, childList: true});
