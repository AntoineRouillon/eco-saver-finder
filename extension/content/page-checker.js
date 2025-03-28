
// Check if the current URL is an Amazon product page
function isAmazonProductPage() {
  return window.location.href.match(/amazon\.fr.*\/dp\//);
}

export { isAmazonProductPage };
