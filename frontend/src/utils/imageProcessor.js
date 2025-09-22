/**
 * Image processing utilities for OCR and diagram handling
 */

import Tesseract from 'tesseract.js';

/**
 * Processes an image to determine if it contains text or is a diagram
 * @param {Blob} imageBlob - The image data
 * @param {string} imageType - The image MIME type
 * @returns {Promise<Object>} - Processing result with type and content
 */
export async function processImage(imageBlob, imageType = 'image/png') {
  try {
    // Create image URL for analysis
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // First, try to determine if the image likely contains text
    const imageAnalysis = await analyzeImageContent(imageUrl);
    
    let result = {
      type: 'unknown', // We'll determine this after OCR
      originalImage: imageUrl,
      imageType: imageType
    };

    // Always try OCR first, then classify based on results
    console.log(`Attempting OCR on image (analysis suggested hasText: ${imageAnalysis.hasText})...`);
    
    try {
      result = await extractTextFromImage(imageUrl, result);
      
      // Classify based on OCR results
      if (result.ocrText && result.ocrText.trim().length > 10) {
        result.type = 'text-image';
        console.log(`OCR successful - classified as text-image. Text length: ${result.ocrText.length}`);
      } else {
        result.type = 'diagram';
        result.diagramData = {
          description: 'Diagram or flowchart detected',
          imageUrl: imageUrl,
          suggestedAnalysis: 'This appears to be a diagram, flowchart, or visual element that may need manual interpretation.'
        };
        console.log('OCR yielded minimal text - classified as diagram');
      }
    } catch (ocrError) {
      console.error('OCR failed, treating as diagram:', ocrError);
      result.type = 'diagram';
      result.diagramData = {
        description: 'Image could not be processed for text extraction',
        imageUrl: imageUrl,
        suggestedAnalysis: 'OCR processing failed for this image.'
      };
    }

    return result;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Analyzes image content to determine if it likely contains text
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<Object>} - Analysis result
 */
async function analyzeImageContent(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas for image analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple heuristics to determine if image might contain text
      let whitePixels = 0;
      let blackPixels = 0;
      let totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > 240) whitePixels++;
        if (brightness < 50) blackPixels++;
      }
      
      const whiteRatio = whitePixels / totalPixels;
      const blackRatio = blackPixels / totalPixels;
      
      // Heuristic: Text images typically have high contrast with significant white background
      // and some black text, while diagrams might have more varied colors
      const hasText = whiteRatio > 0.4 && blackRatio > 0.05 && blackRatio < 0.4;
      
      resolve({
        hasText,
        whiteRatio,
        blackRatio,
        dimensions: { width: img.width, height: img.height }
      });
    };
    
    img.onerror = () => {
      // If we can't analyze, assume it might have text
      resolve({ hasText: true, error: 'Could not analyze image' });
    };
    
    img.src = imageUrl;
  });
}

/**
 * Extracts text from an image using OCR
 * @param {string} imageUrl - URL of the image
 * @param {Object} result - Existing result object to extend
 * @returns {Promise<Object>} - Result with extracted text
 */
async function extractTextFromImage(imageUrl, result) {
  try {
    console.log('Starting OCR processing for image...');
    
    // Configure Tesseract for better accuracy
    const ocrResult = await Tesseract.recognize(
      imageUrl,
      'eng', // English language
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?:;-()[]{}"/\' \n',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        preserve_interword_spaces: '1'
      }
    );
    
    const extractedText = ocrResult.data.text.trim();
    
    result.ocrText = extractedText;
    result.confidence = ocrResult.data.confidence;
    result.ocrData = {
      text: extractedText,
      confidence: ocrResult.data.confidence,
      wordCount: extractedText.split(/\s+/).filter(word => word.length > 0).length
    };
    
    // If OCR confidence is very low or no text found, treat as diagram
    if (ocrResult.data.confidence < 30 || extractedText.length < 10) {
      result.type = 'diagram';
      result.diagramData = {
        description: 'Low-confidence text extraction - likely a diagram',
        imageUrl: imageUrl,
        suggestedAnalysis: 'OCR confidence was low, this may be a diagram or image without clear text.'
      };
    }
    
    console.log(`OCR completed: ${extractedText.length} characters, ${ocrResult.data.confidence}% confidence`);
    
    return result;
  } catch (error) {
    console.error('OCR processing failed:', error);
    // Fallback to treating as diagram
    result.type = 'diagram';
    result.diagramData = {
      description: 'OCR processing failed - treating as diagram',
      imageUrl: imageUrl,
      error: error.message
    };
    return result;
  }
}

/**
 * Processes multiple images from a Word document
 * @param {Array} images - Array of image objects from mammoth
 * @returns {Promise<Array>} - Array of processed image results
 */
export async function processDocumentImages(images) {
  const results = [];
  
  for (let i = 0; i < images.length; i++) {
    try {
      console.log(`Processing image ${i + 1} of ${images.length}...`);
      
      // Convert image buffer to blob
      const imageBlob = new Blob([images[i].buffer], { type: images[i].contentType || 'image/png' });
      
      const result = await processImage(imageBlob, images[i].contentType);
      result.imageIndex = i;
      result.originalFilename = images[i].filename || `image_${i + 1}`;
      
      results.push(result);
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      results.push({
        imageIndex: i,
        type: 'error',
        error: error.message,
        originalFilename: images[i].filename || `image_${i + 1}`
      });
    }
  }
  
  return results;
}

/**
 * Creates a summary of processed images for display
 * @param {Array} imageResults - Results from processDocumentImages
 * @returns {Object} - Summary object
 */
export function createImageSummary(imageResults) {
  const summary = {
    totalImages: imageResults.length,
    textImages: 0,
    diagrams: 0,
    errors: 0,
    extractedText: [],
    diagramList: [], // Renamed to avoid conflict with diagrams counter
    totalOcrText: ''
  };
  
  imageResults.forEach(result => {
    if (result.type === 'text-image' && result.ocrText) {
      summary.textImages++;
      summary.extractedText.push({
        index: result.imageIndex,
        text: result.ocrText,
        confidence: result.confidence,
        filename: result.originalFilename
      });
      summary.totalOcrText += result.ocrText + '\n\n';
    } else if (result.type === 'diagram') {
      summary.diagrams++;
      summary.diagramList.push({
        index: result.imageIndex,
        imageUrl: result.originalImage,
        description: result.diagramData?.description || 'Diagram detected',
        filename: result.originalFilename
      });
    } else if (result.type === 'error') {
      summary.errors++;
    }
  });
  
  return summary;
}

/**
 * Cleans up any created object URLs to prevent memory leaks
 * @param {Array} imageResults - Results containing object URLs
 */
export function cleanupImageUrls(imageResults) {
  imageResults.forEach(result => {
    if (result.originalImage && result.originalImage.startsWith('blob:')) {
      URL.revokeObjectURL(result.originalImage);
    }
  });
}