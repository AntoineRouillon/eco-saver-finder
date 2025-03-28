
// Create a formatted card from the raw HTML
function createCardFromHTML(item) {
  // Create a container for the item
  const itemElement = document.createElement('div');
  itemElement.className = 'aaf-item';
  
  // Extract basic data for display
  const parser = new DOMParser();
  const articleDoc = parser.parseFromString(item.html, 'text/html');
  const article = articleDoc.querySelector('article');
  
  // Extract title from the article
  const titleElement = article.querySelector('[data-test-id="adcard-title"]') || 
                       article.querySelector('p.text-body-1.text-on-surface') ||
                       article.querySelector('h2') ||
                       article.querySelector('p:not([data-test-id])');
  
  // Extract price from the article
  const priceElement = article.querySelector('[data-test-id="price"]') || 
                      article.querySelector('p.text-callout.text-on-surface') ||
                      article.querySelector('span.price');
  
  // Extract location from the article
  const locationElement = article.querySelector('.text-caption.text-neutral:last-child') || 
                         article.querySelector('p[aria-label*="Située à"]') ||
                         article.querySelector('p.text-caption.text-neutral:nth-child(2)');
  
  // Extract pro badge
  const isPro = article.textContent.includes('Pro');
  
  // Extract delivery option
  const hasDelivery = article.textContent.includes('Livraison possible');
  
  // Extract image from the article
  const imageElement = article.querySelector('img');
  
  // Get the data
  const title = titleElement ? titleElement.textContent.trim() : item.title;
  const price = priceElement ? priceElement.textContent.trim() : item.price;
  const location = locationElement ? locationElement.textContent.trim() : 'Unknown location';
  const image = imageElement ? imageElement.src : item.image;
  
  // Create badges HTML
  let badges = '';
  if (isPro) {
    badges += '<span class="aaf-badge-pro">Pro</span>';
  }
  if (hasDelivery) {
    badges += '<span class="aaf-badge-delivery">Livraison possible</span>';
  }
  
  // Ensure URL is absolute
  let url = item.url;
  if (url && url.startsWith('/')) {
    url = 'https://www.leboncoin.fr' + url;
  }
  
  // Build the HTML for the card
  itemElement.innerHTML = `
    <div class="aaf-item-image">
      <img src="${image}" alt="${title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
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
    <div class="aaf-item-raw-html" style="display: none;">${item.html}</div>
  `;
  
  return itemElement;
}

export { createCardFromHTML };
