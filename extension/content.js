
// Variable to store product information
let currentProductInfo = null;
// Variable to store all alternatives for filtering
let allAlternatives = [];
// Current filter settings
let currentFilter = {
  type: 'none', // 'none', 'price', 'date'
  direction: 'asc' // 'asc', 'desc'
};

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
      <div class="aaf-badge">
        <span>?</span>
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
          <div class="aaf-filter-controls">
            <p class="aaf-results-count">Found 0 alternatives on Leboncoin</p>
            <div class="aaf-dropdown-container">
              <button class="aaf-dropdown-button">
                <span>Sort by</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="aaf-dropdown-menu">
                <div class="aaf-dropdown-item" data-filter="price" data-direction="asc">
                  <span>Price (Low to High)</span>
                </div>
                <div class="aaf-dropdown-item" data-filter="price" data-direction="desc">
                  <span>Price (High to Low)</span>
                </div>
                <div class="aaf-dropdown-item" data-filter="date" data-direction="asc">
                  <span>Date (Newest First)</span>
                </div>
                <div class="aaf-dropdown-item" data-filter="date" data-direction="desc">
                  <span>Date (Oldest First)</span>
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
      requestAlternatives(currentProductInfo);
    }
  });
  
  closeBtn.addEventListener('click', () => {
    container.classList.remove('aaf-expanded');
  });

  // Add dropdown toggle listener
  const dropdownButton = container.querySelector('.aaf-dropdown-button');
  const dropdownMenu = container.querySelector('.aaf-dropdown-menu');
  
  dropdownButton.addEventListener('click', () => {
    dropdownMenu.classList.toggle('aaf-show-dropdown');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.aaf-dropdown-container')) {
      const allDropdowns = document.querySelectorAll('.aaf-dropdown-menu');
      allDropdowns.forEach(dropdown => dropdown.classList.remove('aaf-show-dropdown'));
    }
  });

  // Add dropdown item listeners
  const dropdownItems = container.querySelectorAll('.aaf-dropdown-item');
  dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
      const filterType = item.getAttribute('data-filter');
      const direction = item.getAttribute('data-direction');
      
      // Update filter and close dropdown
      if (filterType && direction) {
        currentFilter.type = filterType;
        currentFilter.direction = direction;
        updateFilterUI();
        renderFilteredAlternatives();
        dropdownMenu.classList.remove('aaf-show-dropdown');
      }
    });
  });

  return container;
}

// Update the filter button UI to reflect the current filter
function updateFilterUI() {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;
  
  const dropdownButton = container.querySelector('.aaf-dropdown-button span');
  if (!dropdownButton) return;
  
  // Update dropdown button text based on current filter
  if (currentFilter.type === 'price') {
    if (currentFilter.direction === 'asc') {
      dropdownButton.textContent = 'Price: Low to High';
    } else {
      dropdownButton.textContent = 'Price: High to Low';
    }
  } else if (currentFilter.type === 'date') {
    if (currentFilter.direction === 'asc') {
      dropdownButton.textContent = 'Date: Newest First';
    } else {
      dropdownButton.textContent = 'Date: Oldest First';
    }
  } else {
    dropdownButton.textContent = 'Sort by';
  }
  
  // Update active state in dropdown menu
  const dropdownItems = container.querySelectorAll('.aaf-dropdown-item');
  dropdownItems.forEach(item => {
    item.classList.remove('aaf-active');
    
    const itemFilter = item.getAttribute('data-filter');
    const itemDirection = item.getAttribute('data-direction');
    
    if (itemFilter === currentFilter.type && itemDirection === currentFilter.direction) {
      item.classList.add('aaf-active');
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
      
      if (currentFilter.type === 'price') {
        valueA = parseFloat(cardA.dataset.price) || 0;
        valueB = parseFloat(cardB.dataset.price) || 0;
      } else if (currentFilter.type === 'date') {
        // For date, we're using the date text which may be relative
        // This is a simplification; ideally we'd parse these into actual dates
        valueA = cardA.dataset.date || '';
        valueB = cardB.dataset.date || '';
        
        // Simple heuristic for relative date sorting (not perfect but a starting point)
        if (valueA.includes('min') && valueB.includes('h')) return -1;
        if (valueA.includes('h') && valueB.includes('min')) return 1;
        if (valueA.includes('h') && valueB.includes('h')) {
          const hoursA = parseInt(valueA.match(/\d+/)[0]) || 0;
          const hoursB = parseInt(valueB.match(/\d+/)[0]) || 0;
          return hoursA - hoursB;
        }
        if (valueA.includes('j') && !valueB.includes('j')) return 1;
        if (!valueA.includes('j') && valueB.includes('j')) return -1;
        if (valueA.includes('j') && valueB.includes('j')) {
          const daysA = parseInt(valueA.match(/\d+/)[0]) || 0;
          const daysB = parseInt(valueB.match(/\d+/)[0]) || 0;
          return daysA - daysB;
        }
        return valueA.localeCompare(valueB);
      }
      
      // Apply sort direction
      const sortMultiplier = currentFilter.direction === 'asc' ? 1 : -1;
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
  const badge = container.querySelector('.aaf-badge span');

  // Hide loading state
  if (loading) {
    loading.style.display = 'none';
  }

  // Check if alternatives is an array and has items
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    // Display no results message
    if (results && resultsCount) {
      results.style.display = 'block';
      resultsCount.textContent = "No alternatives found";
      container.querySelector('.aaf-items').innerHTML = '<div class="aaf-error">No second-hand alternatives were found. Try a different product.</div>';
    }
    
    // Update the badge count
    if (badge) {
      badge.textContent = "0";
    }
    
    return;
  }

  // Store all alternatives for filtering
  allAlternatives = [...alternatives];
  
  // Update the badge count
  if (badge) {
    badge.textContent = alternatives.length;
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
    const itemsContainer = container.querySelector('.aaf-items');
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
    sessionStorage.setItem('aaf_alternatives', JSON.stringify(alternatives));
  } catch (error) {
    console.error("Error storing alternatives in sessionStorage:", error);
  }
}

// Check if the current URL is an Amazon product page
function isAmazonProductPage() {
  return window.location.href.match(/amazon\.fr.*\/dp\//);
}

// Initialize the extension UI
function initExtension() {
  if (isAmazonProductPage()) {
    console.log("Amazon product page detected. Initializing extension...");
    createExtensionUI();
    
    // Try to load alternatives from sessionStorage
    try {
      const storedAlternatives = sessionStorage.getItem('aaf_alternatives');
      if (storedAlternatives) {
        const parsedAlternatives = JSON.parse(storedAlternatives);
        console.log("Loaded alternatives from sessionStorage:", parsedAlternatives);
        renderAlternatives(parsedAlternatives);
      }
    } catch (error) {
      console.error("Error loading alternatives from sessionStorage:", error);
    }
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
  }
});

// Initialize the extension when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}
