
import { createExtensionUI } from './content/ui-creator.js';
import { requestAlternatives, renderAlternatives } from './content/alternatives-manager.js';
import { isAmazonProductPage } from './content/page-checker.js';

// Variable to store product information
let currentProductInfo = null;

// Initialize the extension UI
function initExtension() {
  if (isAmazonProductPage()) {
    console.log("Amazon product page detected. Initializing extension...");
    const container = createExtensionUI();
    
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
    
    // Listen for toggle panel event
    document.addEventListener('toggle-panel', (event) => {
      if (event.detail.expanded && currentProductInfo) {
        requestAlternatives(currentProductInfo);
      }
    });
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
