
// Function that will be injected into the Leboncoin page to scrape data
function scrapeLeboncoinData() {
  try {
    console.log("Starting to scrape Leboncoin data");
    
    // Get all item articles - trying different possible selectors
    const itemArticles = document.querySelectorAll('article[data-test-id="ad"]') || 
                         document.querySelectorAll('article[data-qa-id="aditem_container"]') ||
                         document.querySelectorAll('article');
    
    console.log(`Found ${itemArticles.length} article elements`);
    
    // Map through each article to extract complete HTML
    const items = Array.from(itemArticles).slice(0, 5).map(article => {
      // Store the full HTML of the article
      const html = article.outerHTML;
      
      // Extract minimal data for list display
      // Get title
      const titleElement = article.querySelector('[data-test-id="adcard-title"]') || 
                          article.querySelector('p.text-body-1.text-on-surface') ||
                          article.querySelector('h2') ||
                          article.querySelector('p:not([data-test-id])');
      
      const title = titleElement ? titleElement.textContent.trim() : 'No title found';
      
      // Get price
      const priceElement = article.querySelector('[data-test-id="price"]') || 
                           article.querySelector('p.text-callout.text-on-surface') ||
                           article.querySelector('span.price');
      
      const price = priceElement ? priceElement.textContent.trim() : 'No price found';
      
      // Get image
      const imageElement = article.querySelector('img');
      const image = imageElement ? imageElement.src : '';
      
      // Extract URL - fix the incomplete URL issue
      const linkElement = article.querySelector('a');
      let url = linkElement ? linkElement.href : '';
      
      // If the URL is relative, make it absolute
      if (url && url.startsWith('/')) {
        url = 'https://www.leboncoin.fr' + url;
      }
      
      return {
        id: Math.random().toString(36).substring(2, 15),
        title,
        price,
        image,
        url,
        html  // Store the full HTML of the article
      };
    }).filter(item => item.title !== 'No title found'); // Filter out items with no title
    
    console.log(`Processed ${items.length} items`);
    
    // If no items were found, return debugging information
    if (items.length === 0) {
      const allArticlesHTML = Array.from(document.querySelectorAll('article')).map(a => a.outerHTML);
      
      return {
        items: [],
        debug: {
          pageHTML: document.documentElement.outerHTML.substring(0, 10000), // First 10000 chars
          articleCount: document.querySelectorAll('article').length,
          articleHTML: allArticlesHTML
        }
      };
    }
    
    return items;
  } catch (error) {
    console.error("Error scraping Leboncoin:", error);
    return {
      items: [],
      error: error.toString(),
      stack: error.stack,
      pageHTML: document.documentElement.outerHTML.substring(0, 10000) // First 10000 chars for debugging
    };
  }
}

export { scrapeLeboncoinData };
