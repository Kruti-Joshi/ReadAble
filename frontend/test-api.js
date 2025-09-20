// Simple test to verify API integration
import { summarizeDocument } from './src/utils/apiService.js';

const testChunks = [
  {
    id: 'chunk_0',
    text: 'The implementation of contemporary artificial intelligence methodologies in educational environments necessitates a comprehensive understanding of the pedagogical implications and technological infrastructure requirements.',
    chunkIndex: 0,
    startPosition: 0,
    endPosition: 200,
    wordCount: 20
  }
];

async function testAPI() {
  try {
    console.log('Testing API with sample text...');
    const result = await summarizeDocument('test_doc_123', testChunks, {
      readingLevel: 'grade6',
      length: 'medium'
    });
    
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('API Test failed:', error.message);
  }
}

// Run test
testAPI();