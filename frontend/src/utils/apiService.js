/**
 * API service for communicating with the ReadAble Azure Functions backend
 */

import { formatText, formatTextForSpeech } from './textFormatter.js';

const API_BASE_URL = 'http://localhost:7071/api'; // Azure Functions local development URL

/**
 * Summarizes document chunks using the ReadAble Azure Functions API
 * @param {string} docId - Document identifier
 * @param {Array<Object>} chunks - Array of document chunks
 * @param {Object} options - Summarization options (optional, kept for backward compatibility)
 * @returns {Promise<Object>} - API response with processed chunks
 */
export async function summarizeDocument(docId, chunks, options = {}) {
  // Convert our chunk format to the backend's expected format
  const requestChunks = chunks.map((chunk, index) => ({
    id: `chunk_${index}`,
    seq: index,
    start: chunk.startPosition || 0,
    end: chunk.endPosition || chunk.text.length,
    tokenEstimate: chunk.wordCount ? Math.ceil(chunk.wordCount / 0.75) : Math.ceil(chunk.text.length / 4), // Rough token estimate
    text: chunk.text
  }));

  const requestBody = {
    docId: docId,
    options: {}, // Empty options - all configuration handled by system prompt
    chunks: requestChunks
  };

  // Detailed logging for debugging
  console.log('=== API REQUEST TO BACKEND ===')
  console.log('Document ID:', docId)
  console.log('Number of chunks being sent:', requestChunks.length)
  console.log('Request body structure:', {
    docId: requestBody.docId,
    chunksCount: requestBody.chunks.length,
    totalCharacters: requestBody.chunks.reduce((sum, chunk) => sum + chunk.text.length, 0)
  })
  
  requestChunks.forEach((chunk, index) => {
    console.log(`API Chunk ${index + 1}:`, {
      id: chunk.id,
      seq: chunk.seq,
      textLength: chunk.text.length,
      tokenEstimate: chunk.tokenEstimate,
      textPreview: chunk.text.substring(0, 100) + '...'
    })
  })
  
  console.log('Full request body being sent:', JSON.stringify(requestBody, null, 2))
  console.log('=== END API REQUEST ===')

  try {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
        if (errorJson.details && errorJson.details.length > 0) {
          errorMessage += ': ' + errorJson.details.join(', ');
        }
      } catch {
        errorMessage = errorText;
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorMessage}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling summarize document API:', error);
    throw new Error(`Failed to summarize document: ${error.message}`);
  }
}

/**
 * Processes multiple text chunks through the API using the summarize endpoint
 * @param {string} docId - Document identifier  
 * @param {Array<Object>} chunks - Array of text chunks to process
 * @param {Object} options - Processing options
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} - Processing result with chunks and metadata
 */
export async function processDocumentChunks(docId, chunks, options = {}, onProgress = null) {
  try {
    // Update progress
    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        percentage: 50,
        message: 'Sending document to API...'
      });
    }

    // Process all chunks in a single API call
    const result = await summarizeDocument(docId, chunks, options);

    // Update progress
    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        percentage: 100,
        message: 'Processing complete'
      });
    }

    // Transform the response to match our expected format
    const processedChunks = result.chunks.map((chunk, index) => ({
      ...chunks[index], // Keep original chunk metadata
      processedText: formatText(chunk.simplifiedText), // Format the text properly
      originalText: formatText(chunk.originalText), // Format original text too
      speechText: formatTextForSpeech(chunk.simplifiedText), // Version optimized for TTS
      processingTime: new Date(chunk.processedAt).getTime() - new Date(result.processedAt).getTime(),
      apiResponse: chunk,
      error: chunk.error,
      processingFailed: !!chunk.error
    }));

    return {
      processedChunks,
      errors: processedChunks.filter(chunk => chunk.processingFailed).map((chunk, index) => ({
        chunkIndex: index,
        error: chunk.error,
        chunk: chunk
      })),
      totalChunks: result.summary.totalChunks,
      successfulChunks: processedChunks.filter(chunk => !chunk.processingFailed).length,
      processingStats: result.summary
    };
  } catch (error) {
    console.error('Error processing document chunks:', error);
    
    // Return fallback result with error
    const fallbackChunks = chunks.map((chunk, index) => ({
      ...chunk,
      processedText: chunk.text, // Fallback to original text
      error: error.message,
      processingFailed: true
    }));

    return {
      processedChunks: fallbackChunks,
      errors: [{
        chunkIndex: 0,
        error: error.message,
        chunk: chunks[0]
      }],
      totalChunks: chunks.length,
      successfulChunks: 0
    };
  }
}

/**
 * Health check for the API
 * @returns {Promise<Object>} - Health status
 */
export async function checkAPIHealth() {
  try {
    // Since there's no specific health endpoint, we'll try a simple request
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok || response.status === 200 || response.status === 204) {
      return { status: 'healthy', message: 'API is responding' };
    } else {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
}

/**
 * Test connection to the API with a simple request
 * @returns {Promise<boolean>} - True if connection successful
 */
export async function testConnection() {
  try {
    await checkAPIHealth();
    return true;
  } catch (error) {
    console.warn('API connection test failed:', error.message);
    return false;
  }
}

/**
 * Gets the current API configuration
 * @returns {Object} - API configuration
 */
export function getAPIConfig() {
  return {
    baseUrl: API_BASE_URL,
    endpoints: {
      summarize: `${API_BASE_URL}/summarize`
    }
  };
}