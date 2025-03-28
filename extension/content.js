// Amazon Alternative Finder - Content Script

// Cache for storing search results by URL
let alternativesCache = {};

// Function to create the UI elements
function createUI() {
  // Main container
  const container = document.createElement('div');
  container.id = 'amazon-alternative-finder';
  
  // Create toggle button with text
  const toggle = document.createElement('div');
  toggle.className = 'aaf-toggle';
  
  // Add icon
  const img = document.createElement('img');
  img.src = chrome.runtime.getURL('icons/icon-white-48.png');
  img.alt = 'Find alternatives';
  toggle.appendChild(img);
  
  // Add text
  const toggleText = document.createElement('span');
  toggleText.className = 'aaf-toggle-text';
  toggleText.textContent = 'Search on leboncoin';
  toggle.appendChild(toggleText);
  
  // Add notification badge
  const badge = document.createElement('div');
  badge.className = 'aaf-badge';
  badge.innerHTML = '0';
  toggle.appendChild(badge);
  
  // Panel container
  const panel = document.createElement('div');
  panel.className = 'aaf-panel';
  
  // Add header
  const header = document.createElement('div');
  header.className = 'aaf-header';
  
  const headerTitles = document.createElement('div');
  headerTitles.innerHTML = `
    <div class="aaf-header-title">Amazon Alternative Finder</div>
    <div class="aaf-header-subtitle">Second-hand alternatives</div>
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'aaf-close-btn';
  closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  
  header.appendChild(headerTitles);
  header.appendChild(closeBtn);
  
  // Content area
  const content = document.createElement('div');
  content.className = 'aaf-content';
  
  // Panel footer
  const footer = document.createElement('div');
  footer.className = 'aaf-footer';
  footer.innerHTML = `
    <div class="aaf-feedback-text">Was this helpful?</div>
    <div class="aaf-feedback-buttons">
      <button class="aaf-feedback-btn aaf-yes-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
        Yes
      </button>
      <button class="aaf-feedback-btn aaf-no-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
        No
      </button>
    </div>
  `;
  
  // Assemble the panel
  panel.appendChild(header);
  panel.appendChild(content);
  panel.appendChild(footer);
  
  // Add toggle and panel to the container
  container.appendChild(toggle);
  container.appendChild(panel);
  
  // Add the container to the page
  document.body.appendChild(container);
  
  // Return the elements for event binding
  return {
    container,
    toggle,
    badge,
    panel,
    content,
    closeBtn
  };
}

// Function to handle toggle click
function handleToggleClick(container, panel) {
  container.classList.toggle('aaf-expanded');
}

// Function to handle close button click
function handleCloseClick(container) {
  container.classList.remove('aaf-expanded');
}

// Function to extract product information from the Amazon product page
function extractProductInfo() {
  const titleElement = document.getElementById('productTitle') || document.querySelector('span[data-test-id="product-title"]');
    const title = titleElement ? titleElement.innerText.trim() : 'Product Title Not Found';

    // Extract image URL
    let imageElement = document.getElementById('landingImage') || document.getElementById('imgBlkFront');
    let imageUrl = imageElement ? imageElement.src : '';

    if (!imageUrl && imageElement) {
        // Try to extract from srcset
        imageUrl = imageElement.srcset ? imageElement.srcset.split(',').pop().trim().split(' ')[0] : '';
    }

    if (!imageUrl) {
        // Try to find a different image element
        imageElement = document.querySelector('img[data-image-load="lazy"]');
        imageUrl = imageElement ? imageElement.src : '';
    }

    if (!imageUrl) {
        // Last resort, try to find any image in the gallery
        imageElement = document.querySelector('.a-dynamic-image');
        imageUrl = imageElement ? imageElement.src : 'Image URL Not Found';
    }

    // Extract price
    let price = 'Price Not Found';
    const priceElement = document.getElementById('priceblock_ourprice') || document.getElementById('priceblock_dealprice') || document.querySelector('.a-price .a-offscreen');
    if (priceElement) {
        price = priceElement.innerText.trim();
    } else {
      const wholePrice = document.querySelector('.a-price-whole');
      const fractionPrice = document.querySelector('.a-price-fraction');

      if (wholePrice && fractionPrice) {
        price = wholePrice.innerText.trim() + '.' + fractionPrice.innerText.trim();
      }
    }
  
  return {
    title: title,
    image: imageUrl,
    price: price
  };
}

// Function to fetch second-hand alternatives from the background script
function fetchAlternatives(productInfo, callback) {
  chrome.runtime.sendMessage({
    action: 'fetchAlternatives',
    productInfo: productInfo
  }, (response) => {
    if (response && response.alternatives) {
      alternativesCache[window.location.href] = response.alternatives;
      callback(response.alternatives);
    } else {
      console.error('Failed to fetch alternatives:', response ? response.error : 'Unknown error');
      callback([]);
    }
  });
}

// Function to render the second-hand alternatives in the panel
function renderAlternatives(alternatives, content) {
  if (!alternatives || alternatives.length === 0) {
    content.innerHTML = '<div class="aaf-error">No alternatives found.</div>';
    return;
  }

  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'aaf-items';

  alternatives.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'aaf-item';
    itemDiv.innerHTML = `
      <div class="aaf-item-image">
        <img src="${item.image}" alt="${item.title}">
        <div class="aaf-item-location">${item.location}</div>
      </div>
      <div class="aaf-item-content">
        <h3 class="aaf-item-title">${item.title}</h3>
        <div class="aaf-item-badges">
          ${item.isPro ? '<span class="aaf-badge-pro">Pro</span>' : ''}
          ${item.hasDelivery ? '<span class="aaf-badge-delivery">Livraison possible</span>' : ''}
        </div>
        <div class="aaf-item-footer">
          <span class="aaf-item-price">${item.price}</span>
          <a href="${item.url}" class="aaf-item-link" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            View
          </a>
        </div>
      </div>
    `;
    itemsContainer.appendChild(itemDiv);
  });

  content.innerHTML = '';
  content.appendChild(itemsContainer);
}

// Debounce function to limit the rate at which a function can fire.
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// Function to handle changes in the DOM
const handleDOMChange = debounce(() => {
    //console.log('DOM changed, checking for product info.');
    const productInfo = extractProductInfo();
    if (productInfo.title !== 'Product Title Not Found' && productInfo.image !== 'Image URL Not Found' && productInfo.price !== 'Price Not Found') {
        //console.log('Product info found, fetching alternatives.');
        fetchAndRenderAlternatives(productInfo);
    }
}, 500);

// Function to fetch alternatives and render them
function fetchAndRenderAlternatives(productInfo) {
    const content = document.querySelector('.aaf-content');
    if (content) {
        content.innerHTML = '<div class="aaf-loading"><div class="aaf-spinner"></div>Finding alternatives...</div>';
        fetchAlternatives(productInfo, (alternatives) => {
            renderAlternatives(alternatives, content);
            updateBadge(alternatives.length);
        });
    }
}

// Function to update the badge with the number of alternatives
function updateBadge(count) {
    const badge = document.querySelector('.aaf-badge');
    if (badge) {
        badge.textContent = count.toString();
        badge.classList.add('active');
        setTimeout(() => badge.classList.remove('active'), 3000);
    }
}

// Add listener for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateAlternatives") {
        const productInfo = extractProductInfo();
        fetchAndRenderAlternatives(productInfo);
    }
});

// Initialize the UI and attach event listeners
const { container, toggle, closeBtn, content } = createUI();

// Attach event listeners
toggle.addEventListener('click', () => handleToggleClick(container, content));
closeBtn.addEventListener('click', () => handleCloseClick(container));

// Observe changes to the DOM
const observer = new MutationObserver(handleDOMChange);
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
});

// Extract product info and fetch alternatives on initial load
const productInfo = extractProductInfo();
if (productInfo.title !== 'Product Title Not Found') {
    fetchAndRenderAlternatives(productInfo);
}
