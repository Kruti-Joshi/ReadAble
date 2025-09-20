/**
 * Text chunking utilities for processing large documents
 * Optimized for GPT-4o-mini token limits (120,000 tokens ≈ 480,000 characters)
 */

import { formatText, formatTextForSpeech } from './textFormatter.js';

const MAX_CHUNK_SIZE = 450000; // Conservative limit to stay under 120k tokens
const MIN_CHUNK_SIZE = 100000; // Minimum chunk size to avoid too many small chunks
const OVERLAP_SIZE = 5000; // Overlap between chunks to maintain context

/**
 * Splits text into chunks suitable for GPT processing
 * @param {string} text - Text to chunk
 * @param {Object} options - Chunking options
 * @returns {Array<Object>} - Array of chunk objects with text and metadata
 */
export function chunkText(text, options = {}) {
  const {
    maxChunkSize = MAX_CHUNK_SIZE,
    minChunkSize = MIN_CHUNK_SIZE,
    overlapSize = OVERLAP_SIZE,
    preserveParagraphs = true
  } = options;

  if (!text || text.length === 0) {
    return [];
  }

  // If text is small enough, return as single chunk
  if (text.length <= maxChunkSize) {
    return [{
      text: text.trim(),
      chunkIndex: 0,
      totalChunks: 1,
      startPosition: 0,
      endPosition: text.length,
      wordCount: countWords(text)
    }];
  }

  const chunks = [];
  let currentPosition = 0;
  let chunkIndex = 0;

  while (currentPosition < text.length) {
    const remainingText = text.length - currentPosition;
    let chunkSize = Math.min(maxChunkSize, remainingText);
    
    // Find a good break point if we're not at the end
    if (currentPosition + chunkSize < text.length) {
      const breakPoint = findOptimalBreakPoint(
        text, 
        currentPosition, 
        currentPosition + chunkSize,
        preserveParagraphs
      );
      
      if (breakPoint > currentPosition + minChunkSize) {
        chunkSize = breakPoint - currentPosition;
      }
    }

    const chunkText = text.substring(currentPosition, currentPosition + chunkSize).trim();
    
    if (chunkText.length > 0) {
      chunks.push({
        id: `chunk_${chunkIndex}`, // Add unique ID for each chunk
        text: chunkText,
        chunkIndex: chunkIndex,
        totalChunks: 0, // Will be updated after all chunks are created
        startPosition: currentPosition,
        endPosition: currentPosition + chunkSize,
        wordCount: countWords(chunkText)
      });
      chunkIndex++;
    }

    // Move position forward, accounting for overlap
    const nextPosition = currentPosition + chunkSize - overlapSize;
    currentPosition = Math.max(nextPosition, currentPosition + 1); // Ensure progress
  }

  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.totalChunks = chunks.length;
  });

  return chunks;
}

/**
 * Finds an optimal break point for text chunking
 * @param {string} text - Full text
 * @param {number} start - Start position
 * @param {number} end - End position
 * @param {boolean} preserveParagraphs - Whether to prefer paragraph breaks
 * @returns {number} - Optimal break position
 */
function findOptimalBreakPoint(text, start, end, preserveParagraphs) {
  const searchText = text.substring(start, end);
  
  // Look for paragraph breaks first if preserveParagraphs is true
  if (preserveParagraphs) {
    const paragraphBreak = searchText.lastIndexOf('\n\n');
    if (paragraphBreak > searchText.length * 0.7) { // Only if it's in the last 30%
      return start + paragraphBreak + 2;
    }
  }

  // Look for sentence endings
  const sentenceEndings = ['. ', '! ', '? '];
  let bestBreak = -1;
  
  for (const ending of sentenceEndings) {
    const lastIndex = searchText.lastIndexOf(ending);
    if (lastIndex > bestBreak && lastIndex > searchText.length * 0.7) {
      bestBreak = lastIndex + ending.length;
    }
  }
  
  if (bestBreak > -1) {
    return start + bestBreak;
  }

  // Look for word boundaries
  const lastSpace = searchText.lastIndexOf(' ');
  if (lastSpace > searchText.length * 0.8) {
    return start + lastSpace + 1;
  }

  // If no good break point found, use the original end
  return end;
}

/**
 * Counts words in a text string
 * @param {string} text - Text to count words in
 * @returns {number} - Word count
 */
function countWords(text) {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  
  return text.trim().split(/\s+/).length;
}

/**
 * Estimates token count for a text string
 * Uses a rough approximation of 4 characters per token
 * @param {string} text - Text to estimate tokens for
 * @returns {number} - Estimated token count
 */
export function estimateTokenCount(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Validates if text chunks are within acceptable limits
 * @param {Array<Object>} chunks - Array of text chunks
 * @param {number} maxTokens - Maximum tokens per chunk
 * @returns {Object} - Validation result with isValid and details
 */
export function validateChunks(chunks, maxTokens = 120000) {
  const results = {
    isValid: true,
    totalChunks: chunks.length,
    oversizedChunks: [],
    maxTokensUsed: 0,
    totalTokensEstimated: 0
  };

  chunks.forEach((chunk, index) => {
    const estimatedTokens = estimateTokenCount(chunk.text);
    results.totalTokensEstimated += estimatedTokens;
    
    if (estimatedTokens > maxTokens) {
      results.isValid = false;
      results.oversizedChunks.push({
        chunkIndex: index,
        estimatedTokens,
        maxTokens
      });
    }
    
    if (estimatedTokens > results.maxTokensUsed) {
      results.maxTokensUsed = estimatedTokens;
    }
  });

  return results;
}

/**
 * Recombines processed chunks back into a single text
 * @param {Array<Object>} processedChunks - Chunks with processed text
 * @returns {Object} - Combined text with both display and speech versions
 */
export function recombineChunks(processedChunks) {
  if (!processedChunks || processedChunks.length === 0) {
    return {
      displayText: '',
      speechText: '',
      originalText: ''
    };
  }

  // Sort chunks by their original index to maintain order
  const sortedChunks = processedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  
  const displayText = sortedChunks
    .map(chunk => chunk.processedText || chunk.text)
    .join('\n\n')
    .trim();

  const speechText = sortedChunks
    .map(chunk => chunk.speechText || formatTextForSpeech(chunk.processedText || chunk.text))
    .join(' ')
    .trim();

  const originalText = sortedChunks
    .map(chunk => chunk.originalText || chunk.text)
    .join('\n\n')
    .trim();

  return {
    displayText: formatText(displayText),
    speechText: formatTextForSpeech(speechText),
    originalText: formatText(originalText)
  };
}