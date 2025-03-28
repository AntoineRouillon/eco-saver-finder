import { pipeline, env } from '@huggingface/transformers';

// Configure the library to use the correct CDN for model files
env.allowLocalModels = false;
env.useBrowserCache = true;

// In-memory cache for summarized titles
const summaryCache = {};

// Initialize the summarization pipeline (lazy loading)
let summarizer = null;
const MODEL_NAME = 'Xenova/distilbart-cnn-6-6';

/**
 * Initializes the summarization model if it hasn't been loaded yet
 */
const initializeSummarizer = async () => {
  if (!summarizer) {
    console.log('Initializing summarization model...');
    try {
      summarizer = await pipeline('summarization', MODEL_NAME);
      console.log('Summarization model loaded successfully');
    } catch (error) {
      console.error('Error loading summarization model:', error);
      return null;
    }
  }
  return summarizer;
};

/**
 * Simple fallback function to extract keywords from a product title
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
 * Uses a transformer model if available, falls back to simple extraction otherwise
 */
export const summarizeTitle = async (title) => {
  // Check cache first
  if (summaryCache[title]) {
    return summaryCache[title];
  }

  try {
    // Try to use the model for summarization
    const summarizer = await initializeSummarizer();
    
    if (summarizer) {
      const result = await summarizer(title, {
        max_length: 10,
        min_length: 2,
        do_sample: false
      });
      
      const summary = result[0].summary_text.trim();
      summaryCache[title] = summary;
      return summary;
    } else {
      // Fall back to simple extraction if model initialization failed
      const simplified = simplifyTitle(title);
      summaryCache[title] = simplified;
      return simplified;
    }
  } catch (error) {
    console.error('Error summarizing title:', error);
    
    // Fall back to simple extraction on error
    const simplified = simplifyTitle(title);
    summaryCache[title] = simplified;
    return simplified;
  }
};
