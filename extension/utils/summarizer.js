// In-memory cache for summarized titles
const summaryCache = {};

/**
 * Simple function to extract keywords from a product title
 * when the model is not available or fails
 */
const simplifyTitle = (title) => {
  // Remove common descriptive patterns and keep only the main product identifiers
  const simplifiedTitle = title
    .split(',')[0]            // Take only the first part before any comma
    .replace(/\([^)]*\)/g, '') // Remove parentheses and their contents
    .split('-')[0]            // Take only the first part before any dash
    .trim();
  
  // Get the first 3-4 words which usually contain the brand and main product type
  const words = simplifiedTitle.split(' ');
  if (words.length > 4) {
    return words.slice(0, 4).join(' ');
  }
  
  return simplifiedTitle;
};

/**
 * Summarizes a product title to create a more effective search query
 * Uses simple extraction technique
 */
export const summarizeTitle = async (title) => {
  // Check cache first
  if (summaryCache[title]) {
    return summaryCache[title];
  }

  try {
    // Use the simple extraction method
    const simplified = simplifyTitle(title);
    summaryCache[title] = simplified;
    return simplified;
  } catch (error) {
    console.error('Error summarizing title:', error);
    
    // Fall back to using the first few words
    const fallback = title.split(' ').slice(0, 3).join(' ');
    summaryCache[title] = fallback;
    return fallback;
  }
};
