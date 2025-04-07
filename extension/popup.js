
document.addEventListener('DOMContentLoaded', function() {
  console.log("[POPUP] Popup initialized and DOM loaded");
  
  // Get the "Try now on Amazon" button
  const ctaButton = document.querySelector('.cta-button');
  
  if (ctaButton) {
    console.log("[POPUP] CTA button found, adding click listener");
    
    // Add click event listener
    ctaButton.addEventListener('click', function(e) {
      console.log("[POPUP] CTA button clicked");
      
      // Prevent default link behavior
      e.preventDefault();
      
      // Open a new tab with the Amazon product
      chrome.tabs.create({
        url: this.href
      });
      
      console.log("[POPUP] New Amazon tab requested");
    });
  } else {
    console.log("[POPUP] CTA button not found in the popup");
  }
});
