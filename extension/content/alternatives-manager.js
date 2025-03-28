
import { createCardFromHTML } from './card-creator.js';

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

// Render alternatives in the panel
function renderAlternatives(alternatives) {
  console.log("Rendering alternatives:", alternatives);
  
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;

  const loading = container.querySelector('.aaf-loading');
  const results = container.querySelector('.aaf-results');
  const resultsCount = container.querySelector('.aaf-results-count');
  const itemsContainer = container.querySelector('.aaf-items');
  const badge = container.querySelector('.aaf-badge span');

  // Check if alternatives is an array
  if (!Array.isArray(alternatives)) {
    console.error("Alternatives is not an array:", alternatives);
    
    // Display error in the UI
    if (results && loading && itemsContainer) {
      loading.style.display = 'none';
      results.style.display = 'block';
      resultsCount.textContent = "Error fetching alternatives";
      itemsContainer.innerHTML = '<div class="aaf-error">Could not retrieve alternatives. Please try again later.</div>';
    }
    
    return;
  }

  // Update the badge count
  if (badge) {
    badge.textContent = alternatives.length;
  }

  // Update the count text
  if (resultsCount) {
    resultsCount.textContent = `Found ${alternatives.length} alternatives on Leboncoin`;
  }

  // Clear previous results
  if (itemsContainer) {
    itemsContainer.innerHTML = '';

    // Add each alternative as a formatted card
    alternatives.forEach(item => {
      if (item.html) {
        const itemElement = createCardFromHTML(item);
        itemsContainer.appendChild(itemElement);
      }
    });
  }

  // Hide loading, show results
  if (loading && results) {
    loading.style.display = 'none';
    results.style.display = 'block';
  }

  // Store the alternatives in sessionStorage for persistence
  try {
    sessionStorage.setItem('aaf_alternatives', JSON.stringify(alternatives));
  } catch (error) {
    console.error("Error storing alternatives in sessionStorage:", error);
  }
}

export { requestAlternatives, renderAlternatives };
