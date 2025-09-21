/**
 * Text formatting utilities for processing API responses
 */

/**
 * Processes text to convert escape sequences to actual formatting
 * @param {string} text - Text with potential escape sequences
 * @returns {string} - Formatted text with proper line breaks and tabs
 */
export function formatText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // First decode Unicode escape sequences
    .replace(/\\u([0-9A-Fa-f]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    })
    // Convert \n to actual line breaks
    .replace(/\\n/g, '\n')
    // Convert \t to actual tabs (4 spaces for display)
    .replace(/\\t/g, '    ')
    // Convert \r\n to \n (normalize line endings)
    .replace(/\\r\\n/g, '\n')
    // Convert \r to \n
    .replace(/\\r/g, '\n')
    // Handle additional escape sequences
    .replace(/\\'/g, "'")   // escaped apostrophe
    .replace(/\\"/g, '"')   // escaped double quote
    .replace(/\\\\/g, "\\") // escaped backslash
    .replace(/\\&/g, "&")   // escaped ampersand
    // Remove excessive whitespace but preserve intentional line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Convert multiple line breaks to double
    .trim();
}

/**
 * Removes surrounding quotes from text if present
 * @param {string} text - Text that might have surrounding quotes
 * @returns {string} - Text with quotes removed
 */
export function removeQuotes(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text.trim();
  
  // Remove surrounding double quotes
  if (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length > 1) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Remove surrounding single quotes
  if (cleaned.startsWith("'") && cleaned.endsWith("'") && cleaned.length > 1) {
    cleaned = cleaned.slice(1, -1);
  }
  
  return cleaned.trim();
}

/**
 * Processes text for text-to-speech by removing formatting that doesn't read well
 * @param {string} text - Text to process for speech
 * @returns {string} - Text optimized for speech synthesis
 */
export function formatTextForSpeech(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // First remove quotes, then format for speech
  const cleaned = removeQuotes(text);

  return cleaned
    // First decode Unicode escape sequences
    .replace(/\\u([0-9A-Fa-f]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    })
    // Apply standard formatting
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '\n')
    // Handle additional escape sequences
    .replace(/\\'/g, "'")   // escaped apostrophe
    .replace(/\\"/g, '"')   // escaped double quote
    .replace(/\\\\/g, "\\") // escaped backslash
    .replace(/\\&/g, "&")   // escaped ampersand
    // Convert line breaks to brief pauses (periods for natural speech flow)
    .replace(/\n\n+/g, '. ') // Multiple line breaks become sentence breaks
    .replace(/\n/g, '. ') // Single line breaks become brief pauses
    // Clean up excessive punctuation for speech
    .replace(/\.{2,}/g, '.') // Multiple periods to single period
    .replace(/\.\s*\./g, '.') // Remove double periods
    .replace(/\s{2,}/g, ' ') // Multiple spaces to single space
    .trim();
}

/**
 * Formats text for display in HTML while preserving line breaks
 * @param {string} text - Text to format for display
 * @returns {string} - Text with proper formatting for HTML display
 */
export function formatTextForDisplay(text) {
  const cleaned = removeQuotes(text);
  const formatted = formatText(cleaned);
  
  // For React components, we'll return the formatted text
  // The component should use CSS white-space: pre-wrap to preserve formatting
  return formatted;
}

/**
 * Estimates reading time for formatted text
 * @param {string} text - Text to estimate reading time for
 * @param {number} wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns {Object} - Reading time estimation
 */
export function estimateReadingTime(text, wordsPerMinute = 200) {
  if (!text || typeof text !== 'string') {
    return { minutes: 0, seconds: 0, totalSeconds: 0, wordCount: 0 };
  }

  const formatted = formatText(text);
  const wordCount = formatted.trim().split(/\s+/).length;
  const totalSeconds = Math.ceil((wordCount / wordsPerMinute) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    minutes,
    seconds,
    totalSeconds,
    wordCount
  };
}