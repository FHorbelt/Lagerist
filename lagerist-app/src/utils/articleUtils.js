/**
 * Utility functions for article number processing
 */

/**
 * Removes leading zeros from an article number
 * @param {string} articleNumber - The article number to normalize
 * @returns {string} - Article number without leading zeros
 */
export const removeLeadingZeros = (articleNumber) => {
  if (!articleNumber || typeof articleNumber !== 'string') {
    return articleNumber;
  }

  // Remove all leading zeros
  const normalized = articleNumber.replace(/^0+/, '');

  // If the string was all zeros, return a single "0"
  return normalized || '0';
};

/**
 * Finds an article by exact match or by matching the last 6 digits
 * @param {string} searchNumber - The article number to search for
 * @param {Array} articles - Array of article objects with articleNumber property
 * @returns {Object|null} - Found article or null
 */
export const findArticleByNumber = (searchNumber, articles) => {
  if (!searchNumber || !articles || articles.length === 0) {
    return null;
  }

  // Normalize the search number (remove leading zeros)
  const normalizedSearch = removeLeadingZeros(searchNumber.trim());

  // First, try exact match with normalized numbers
  const exactMatch = articles.find(article => {
    const normalizedArticle = removeLeadingZeros(article.articleNumber);
    return normalizedArticle === normalizedSearch;
  });

  if (exactMatch) {
    return exactMatch;
  }

  // If no exact match and search number is at least 6 digits, try matching last 6 digits
  if (normalizedSearch.length >= 6) {
    const last6Digits = normalizedSearch.slice(-6);

    const partialMatch = articles.find(article => {
      const normalizedArticle = removeLeadingZeros(article.articleNumber);
      return normalizedArticle.endsWith(last6Digits);
    });

    return partialMatch || null;
  }

  return null;
};
