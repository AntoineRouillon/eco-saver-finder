
document.addEventListener('DOMContentLoaded', function() {
  console.log("%c📱 AltMarket Popup initialized", "background: #2196F3; color: white; padding: 5px; border-radius: 3px; font-weight: bold;");
  
  // Get the "Try now on Amazon" button
  const ctaButton = document.querySelector('.cta-button');
  
  // Add click event listener
  ctaButton.addEventListener('click', function(e) {
    // Prevent default link behavior
    e.preventDefault();
    
    // Open a new tab with the Amazon product
    chrome.tabs.create({
      url: this.href
    });
  });
});
