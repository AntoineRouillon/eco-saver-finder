// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "PRODUCT_INFO") {
    // Store the product information in a global variable
    window.productInfo = message.productInfo;
    
    // Create or update the sidebar
    createOrUpdateSidebar();
  } 
  else if (message.action === "ALTERNATIVES_FOUND") {
    // Display the alternatives in the sidebar
    displayAlternatives(
      message.alternatives, 
      message.originalQuery, 
      message.summarizedQuery
    );
  }
});

// Function to create or update the sidebar
function createOrUpdateSidebar() {
  // Check if the sidebar already exists
  let sidebar = document.getElementById('amazon-alternative-sidebar');
  if (sidebar) {
    // If it exists, update its content
    updateSidebarContent(sidebar);
  } else {
    // If it doesn't exist, create it
    sidebar = createSidebar();
    document.body.appendChild(sidebar);
  }
}

// Function to create the sidebar
function createSidebar() {
  // Create the sidebar container
  const sidebar = document.createElement('div');
  sidebar.id = 'amazon-alternative-sidebar';
  sidebar.className = 'amazon-alternative-sidebar';

  // Create the header
  const sidebarHeader = document.createElement('div');
  sidebarHeader.className = 'sidebar-header';
  sidebarHeader.innerText = 'Leboncoin Alternatives';
  sidebar.appendChild(sidebarHeader);

  // Create the content area
  const sidebarContent = document.createElement('div');
  sidebarContent.id = 'amazon-alternative-content';
  sidebarContent.className = 'sidebar-content';
  sidebar.appendChild(sidebarContent);

  // Initially show a loading message
  sidebarContent.innerText = 'Loading alternatives...';

  return sidebar;
}

// Function to update the sidebar content
function updateSidebarContent(sidebar) {
  const sidebarContent = sidebar.querySelector('.sidebar-content');
  sidebarContent.innerText = 'Loading alternatives...';
}

// Function to display alternatives in the sidebar
function displayAlternatives(alternatives, originalQuery, summarizedQuery) {
  // Find the sidebar content element
  const sidebarContent = document.getElementById('amazon-alternative-content');
  if (!sidebarContent) return;
  
  // Clear the loading state
  sidebarContent.innerHTML = '';
  
  // Add search query information
  const queryInfo = document.createElement('div');
  queryInfo.className = 'query-info';
  queryInfo.innerHTML = `
    <p>Original search: "${originalQuery || window.productInfo.title}"</p>
    <p>Simplified search: "${summarizedQuery || 'N/A'}"</p>
  `;
  sidebarContent.appendChild(queryInfo);
  
  // If there are no alternatives, show a message
  if (!alternatives || alternatives.length === 0) {
    const noResultsMsg = document.createElement('div');
    noResultsMsg.className = 'no-results';
    noResultsMsg.innerText = 'No alternatives found on Leboncoin.';
    sidebarContent.appendChild(noResultsMsg);
    return;
  }
  
  // Create a list to hold the alternatives
  const alternativesList = document.createElement('ul');
  alternativesList.className = 'alternatives-list';
  sidebarContent.appendChild(alternativesList);

  // Loop through the alternatives and create list items
  alternatives.forEach(alternative => {
    const listItem = document.createElement('li');
    listItem.className = 'alternative-item';

    // Create an image element
    const image = document.createElement('img');
    image.src = alternative.image;
    image.alt = alternative.title;
    listItem.appendChild(image);

    // Create a title element
    const title = document.createElement('h3');
    title.innerText = alternative.title;
    listItem.appendChild(title);

    // Create a price element
    const price = document.createElement('p');
    price.innerText = alternative.price;
    listItem.appendChild(price);

    // Create a link to the alternative
    const link = document.createElement('a');
    link.href = alternative.url;
    link.innerText = 'View on Leboncoin';
    link.target = '_blank'; // Open in a new tab
    listItem.appendChild(link);

    alternativesList.appendChild(listItem);
  });
}

// Inject CSS to style the sidebar
function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
    #amazon-alternative-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100%;
      background-color: #f9f9f9;
      border-left: 1px solid #ccc;
      box-shadow: -3px 0px 5px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      overflow: auto;
      font-family: sans-serif;
      color: #333;
    }

    .sidebar-header {
      padding: 10px;
      text-align: center;
      font-weight: bold;
      background-color: #ddd;
      border-bottom: 1px solid #ccc;
    }

    .sidebar-content {
      padding: 10px;
    }

    .alternatives-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .alternative-item {
      border-bottom: 1px solid #eee;
      padding: 10px 0;
    }

    .alternative-item img {
      width: 100%;
      max-height: 150px;
      object-fit: contain;
      margin-bottom: 5px;
    }

    .alternative-item h3 {
      font-size: 1em;
      margin: 0;
    }

    .alternative-item p {
      font-size: 0.9em;
      margin: 5px 0;
    }

    .alternative-item a {
      color: #007bff;
      text-decoration: none;
    }

    .alternative-item a:hover {
      text-decoration: underline;
    }
    
    .query-info {
      margin-bottom: 10px;
      font-size: 0.8em;
      color: #777;
    }
    
    .no-results {
      font-style: italic;
      color: #777;
    }
  `;
  document.head.appendChild(style);
}

// Run the injection
injectCSS();
