
document.addEventListener('DOMContentLoaded', function() {
  // Get the "Try now on Amazon" button
  const ctaButton = document.querySelector('.cta-button');
  
  // First check if the extension is ready
  chrome.runtime.sendMessage({
    action: "CHECK_EXTENSION_READY"
  }, response => {
    // Enable/disable button based on extension ready state
    if (response && response.ready) {
      ctaButton.classList.remove('disabled');
      ctaButton.title = "Essayer sur Amazon";
    } else {
      ctaButton.classList.add('disabled');
      ctaButton.title = "Extension en cours d'initialisation...";
    }
  });
  
  // Add click event listener
  ctaButton.addEventListener('click', function(e) {
    // Prevent default link behavior
    e.preventDefault();
    
    // Check if button is disabled
    if (ctaButton.classList.contains('disabled')) {
      return;
    }
    
    // Open a new tab with the Amazon product
    chrome.tabs.create({
      url: this.href
    });
  });
});
