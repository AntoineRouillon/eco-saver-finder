
document.addEventListener('DOMContentLoaded', function() {
  // Log when the popup is loaded
  console.log("[POPUP] Popup loaded and initialized");
  
  // Get the "Try now on Amazon" button
  const ctaButton = document.querySelector('.cta-button');
  
  // Check if extension is ready
  chrome.runtime.sendMessage({action: "CHECK_EXTENSION_READY"}, function(response) {
    if (response && response.ready) {
      console.log("[POPUP] Background script is ready");
    } else {
      console.log("[POPUP] Background script is not ready yet");
    }
  });
  
  // Add click event listener
  ctaButton.addEventListener('click', function(e) {
    // Prevent default link behavior
    e.preventDefault();
    
    console.log("[POPUP] CTA button clicked");
    
    // Open a new tab with the Amazon product
    chrome.tabs.create({
      url: this.href
    });
  });
});
