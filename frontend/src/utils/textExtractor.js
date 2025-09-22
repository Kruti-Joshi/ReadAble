/**
 * Text extraction utilities for different file types
 */

import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist';
import { processDocumentImages, createImageSummary, cleanupImageUrls } from './imageProcessor';

// Initialize and configure PDF.js worker using local file
if (typeof window !== 'undefined') {
  // Use local worker file served from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}



/**
 * Extracts text content from a file based on its type, including images for Word documents
 * @param {File} file - The file to extract text from
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Object>} - Extracted content with text and image data
 */
export async function extractTextFromFile(file, progressCallback = null) {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      const text = await extractTextFromTextFile(file);
      return { text, images: [] };
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractContentFromDocxFile(file, progressCallback);
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const text = await extractTextFromPdfFile(file);
      return { text, images: [] };
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      throw new Error('Legacy Word document (.doc) extraction is not supported. Please save as .docx format or use text files.');
    } else {
      throw new Error('Unsupported file type. Please use text files (.txt), Word documents (.docx), or PDF files (.pdf).');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

/**
 * Extracts text from a plain text file
 * @param {File} file - Text file
 * @returns {Promise<string>} - File content as text
 */
async function extractTextFromTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read file: ' + event.target.error));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validates if a DOCX file has the correct structure
 * @param {ArrayBuffer} arrayBuffer - File buffer
 * @returns {boolean} - True if appears to be valid DOCX
 */
function isValidDocxStructure(arrayBuffer) {
  try {
    // Check for ZIP file signature (DOCX files are ZIP archives)
    const view = new Uint8Array(arrayBuffer);
    
    // ZIP file signatures
    const zipSignatures = [
      [0x50, 0x4B, 0x03, 0x04], // Standard ZIP
      [0x50, 0x4B, 0x05, 0x06], // Empty ZIP
      [0x50, 0x4B, 0x07, 0x08]  // Spanned ZIP
    ];
    
    // Check if file starts with a ZIP signature
    for (const signature of zipSignatures) {
      if (view.length >= signature.length) {
        const matches = signature.every((byte, index) => view[index] === byte);
        if (matches) return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Extracts text and processes images from a DOCX Word document
 * @param {File} file - DOCX file
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Object>} - Extracted content with text and processed images
 */
async function extractContentFromDocxFile(file, progressCallback = null) {
  return new Promise((resolve, reject) => {
    // Validate file size (reasonable limits)
    if (file.size === 0) {
      reject(new Error('The Word document appears to be empty or corrupted.'));
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      reject(new Error('Word document is too large. Please use a smaller file (under 50MB).'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        
        // Basic validation that we have data
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('The Word document appears to be empty or corrupted.');
        }
        
        // Validate DOCX structure
        if (!isValidDocxStructure(arrayBuffer)) {
          throw new Error('This does not appear to be a valid Word document (.docx). Please check the file format.');
        }
        
        if (progressCallback) progressCallback('Extracting text from Word document...', 10);
        
        // Store images for processing
        const extractedImages = [];
        
        console.log('=== MAMMOTH EXTRACTION STARTING ===');
        console.log('File name:', file.name);
        console.log('File size:', file.size, 'bytes');
        console.log('Array buffer size:', arrayBuffer.byteLength, 'bytes');
        
        // Let's also try to check the raw document structure
        try {
          // Convert to HTML to see the structure
          const structureResult = await mammoth.convertToHtml({ arrayBuffer });
          console.log('Document HTML length:', structureResult.value?.length || 0);
          console.log('Document HTML preview:', structureResult.value?.substring(0, 500) || 'No HTML content');
          
          // Check if HTML contains any img tags
          const imgMatches = structureResult.value?.match(/<img[^>]*>/g) || [];
          console.log('IMG tags found in HTML:', imgMatches.length);
          if (imgMatches.length > 0) {
            console.log('IMG tags:', imgMatches);
          }
        } catch (structureError) {
          console.log('Error checking document structure:', structureError.message);
        }
        
        // Configure mammoth to extract both text and images
        const mammothOptions = {
          convertImage: mammoth.images.imgElement(function(image) {
            console.log('=== MAMMOTH FOUND IMAGE ===');
            console.log('Image content type:', image.contentType);
            console.log('Image read method available:', typeof image.read);
            
            // Store image data for later processing
            extractedImages.push({
              buffer: image.read(),
              contentType: image.contentType,
              filename: `image_${extractedImages.length + 1}.${image.contentType?.split('/')[1] || 'png'}`
            });
            
            console.log('Added image to extraction list. Total images so far:', extractedImages.length);
            
            // Return a placeholder for the document text
            return Promise.resolve({
              src: `[IMAGE_PLACEHOLDER_${extractedImages.length}]`
            });
          })
        };
        
        // Extract text using mammoth with image handling
        // Use convertToHtml first to capture images, then extract text
        console.log('Starting mammoth.convertToHtml to capture images...');
        
        let htmlResult, textResult;
        
        try {
          // First, get HTML to extract base64 images
          htmlResult = await mammoth.convertToHtml({ arrayBuffer });
          console.log('HTML conversion complete.');
          
          // Extract base64 images from the HTML
          const imgRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g;
          let imgMatch;
          let imageIndex = 0;
          
          while ((imgMatch = imgRegex.exec(htmlResult.value)) !== null) {
            imageIndex++;
            console.log(`=== FOUND BASE64 IMAGE ${imageIndex} ===`);
            
            const imageType = imgMatch[1]; // png, jpeg, etc.
            const base64Data = imgMatch[2];
            
            console.log('Image type:', imageType);
            console.log('Base64 data length:', base64Data.length);
            
            // Convert base64 to buffer
            try {
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              extractedImages.push({
                buffer: Promise.resolve(bytes.buffer),
                contentType: `image/${imageType}`,
                filename: `image_${imageIndex}.${imageType}`
              });
              
              console.log(`Added image ${imageIndex} to extraction list. Total images so far:`, extractedImages.length);
            } catch (conversionError) {
              console.error(`Error converting image ${imageIndex}:`, conversionError);
            }
          }
          
          console.log('Image extraction from HTML complete. Total images found:', extractedImages.length);
          
          // Now extract raw text for cleaner text processing
          console.log('Starting mammoth.extractRawText for clean text...');
          textResult = await mammoth.extractRawText({ arrayBuffer });
          console.log('Text extraction complete. Final image count:', extractedImages.length);
        } catch (mammothError) {
          console.error('Mammoth processing error:', mammothError);
          // Fallback to text-only extraction
          console.log('Falling back to text-only extraction...');
          textResult = await mammoth.extractRawText({ arrayBuffer });
          htmlResult = { messages: [] };
        }
        
        // Log any warnings but don't fail
        if (htmlResult && htmlResult.messages && htmlResult.messages.length > 0) {
          console.warn('Word document HTML conversion warnings:', htmlResult.messages);
        }
        if (textResult && textResult.messages && textResult.messages.length > 0) {
          console.warn('Word document text extraction warnings:', textResult.messages);
        }
        
        if (progressCallback) progressCallback('Processing images...', 30);
        
        let documentText = (textResult && textResult.value) || '';
        let processedImages = [];
        let imageSummary = { totalImages: 0, textImages: 0, diagrams: 0, totalOcrText: '' };
        
        // Process images if any were found
        if (extractedImages.length > 0) {
          console.log(`=== PROCESSING ${extractedImages.length} IMAGES ===`);
          
          try {
            // Convert image buffers to actual buffers
            const imagePromises = extractedImages.map(async (img, index) => {
              console.log(`Processing image ${index + 1}:`, {
                contentType: img.contentType,
                filename: img.filename,
                hasBuffer: !!img.buffer
              });
              const buffer = await img.buffer;
              console.log(`Image ${index + 1} buffer resolved:`, buffer?.byteLength || 0, 'bytes');
              return {
                ...img,
                buffer: buffer
              };
            });
            
            const resolvedImages = await Promise.all(imagePromises);
            console.log('All image buffers resolved. Proceeding to OCR processing...');
            
            if (progressCallback) progressCallback('Running OCR on images...', 50);
            
            // Process images for OCR and diagram detection
            processedImages = await processDocumentImages(resolvedImages);
            imageSummary = createImageSummary(processedImages);
            
            // Add OCR text to the main document text
            if (imageSummary.totalOcrText) {
              documentText += '\n\n--- Text extracted from images ---\n\n' + imageSummary.totalOcrText;
            }
            
            // Replace image placeholders with descriptions
            processedImages.forEach((imgResult, index) => {
              const placeholder = `[IMAGE_PLACEHOLDER_${index + 1}]`;
              let replacement = '';
              
              if (imgResult.type === 'text-image' && imgResult.ocrText) {
                replacement = `[Image ${index + 1}: Contains text - "${imgResult.ocrText.substring(0, 100)}${imgResult.ocrText.length > 100 ? '...' : ''}"]`;
              } else if (imgResult.type === 'diagram') {
                replacement = `[Image ${index + 1}: Diagram or flowchart detected]`;
              } else {
                replacement = `[Image ${index + 1}: Unable to process]`;
              }
              
              documentText = documentText.replace(placeholder, replacement);
            });
            
            if (progressCallback) progressCallback('Image processing complete', 90);
            
          } catch (imageError) {
            console.error('Error processing images:', imageError);
            // Continue with text extraction even if image processing fails
            imageSummary.errors = extractedImages.length;
          }
        }
        
        // Check if we got any text
        if (!documentText || documentText.trim().length === 0) {
          throw new Error('No text content could be extracted from this Word document. The document might be empty or contain only images/tables.');
        }
        
        if (progressCallback) progressCallback('Extraction complete', 100);
        
        const finalResult = {
          text: documentText,
          images: processedImages,
          imageSummary: imageSummary,
          metadata: {
            originalImageCount: extractedImages.length,
            processedImageCount: processedImages.length,
            ocrTextLength: imageSummary.totalOcrText.length,
            documentTextLength: documentText.length
          }
        };
        
        console.log('=== FINAL EXTRACTION RESULT ===');
        console.log('Document text length:', documentText.length);
        console.log('Original images found:', extractedImages.length);
        console.log('Processed images:', processedImages.length);
        console.log('Total OCR text:', imageSummary.totalOcrText.length);
        console.log('Image summary:', imageSummary);
        console.log('=== END EXTRACTION ===');
        
        resolve(finalResult);
      } catch (error) {
        console.error('Error in Word document extraction:', error);
        
        // Clean up any created object URLs (only if extractedImages is defined)
        if (typeof cleanupImageUrls === 'function' && typeof extractedImages !== 'undefined' && extractedImages) {
          try {
            cleanupImageUrls(extractedImages);
          } catch (cleanupError) {
            console.warn('Error cleaning up image URLs:', cleanupError);
          }
        }
        
        // Provide more specific error messages based on the error
        if (error.message.includes('zip file') || error.message.includes('central directory')) {
          reject(new Error('The Word document appears to be corrupted or is not a valid .docx file. Please try saving the document again or use a different file.'));
        } else if (error.message.includes('Cannot read properties')) {
          reject(new Error('Invalid Word document format. Please ensure the file is a valid .docx document.'));
        } else if (error.message.includes('Could not find file in options')) {
          reject(new Error('Error loading document processing library. Please refresh the page and try again.'));
        } else {
          reject(new Error('Failed to extract content from Word document: ' + error.message));
        }
      }
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read Word document file: ' + (event.target?.error?.message || 'Unknown error')));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extracts text from a PDF document
 * @param {File} file - PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPdfFile(file) {
  return new Promise((resolve, reject) => {
    // Validate file size (reasonable limits)
    if (file.size === 0) {
      reject(new Error('The PDF document appears to be empty or corrupted.'));
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit for PDFs
      reject(new Error('PDF document is too large. Please use a smaller file (under 100MB).'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        
        // Basic validation that we have data
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('The PDF document appears to be empty or corrupted.');
        }
        
        // Validate PDF structure (PDF files start with %PDF)
        const view = new Uint8Array(arrayBuffer);
        const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
        const isValidPdf = pdfSignature.every((byte, index) => view[index] === byte);
        
        if (!isValidPdf) {
          throw new Error('This does not appear to be a valid PDF document. Please check the file format.');
        }

        // Load PDF document using PDF.js with minimal configuration
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
        });
        
        const pdf = await loadingTask.promise;
        console.log(`PDF loaded: ${pdf.numPages} pages`);
        
        let fullText = '';
        
        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          try {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            const pageText = textContent.items
              .map(item => item.str)
              .join(' ');
            
            fullText += pageText + '\n\n';
          } catch (pageError) {
            console.warn(`Error extracting text from page ${pageNum}:`, pageError);
            // Continue with other pages
          }
        }
        
        // Clean up the text
        fullText = fullText.trim();
        
        // Check if we got any text
        if (!fullText || fullText.length === 0) {
          throw new Error('No text content could be extracted from this PDF. The document might be image-based, password-protected, or contain only images/graphics.');
        }
        
        console.log(`PDF extraction successful: ${pdf.numPages} pages, ${fullText.length} characters`);
        
        resolve(fullText);
      } catch (error) {
        console.error('PDF extraction error:', error);
        // Provide more specific error messages based on the error
        if (error.message.includes('Invalid PDF') || error.message.includes('Invalid header')) {
          reject(new Error('Invalid or corrupted PDF file. Please ensure the file is a valid PDF document.'));
        } else if (error.message.includes('password') || error.message.includes('Password')) {
          reject(new Error('This PDF appears to be password-protected. Please use an unprotected PDF file.'));
        } else if (error.message.includes('encrypted')) {
          reject(new Error('This PDF is encrypted and cannot be processed. Please use an unencrypted PDF file.'));
        } else if (error.name === 'PasswordException') {
          reject(new Error('This PDF is password-protected and cannot be processed. Please use an unprotected PDF file.'));
        } else if (error.message.includes('worker')) {
          reject(new Error('PDF processing worker failed to load. Please check your internet connection and try again.'));
        } else {
          reject(new Error('Failed to extract text from PDF: ' + error.message));
        }
      }
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read PDF file: ' + (event.target?.error?.message || 'Unknown error')));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validates if a file type is supported for text extraction
 * @param {File} file - File to validate
 * @returns {boolean} - True if supported, false otherwise
 */
export function isFileTypeSupported(file) {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Check for text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return true;
  }
  
  // Check for DOCX files with stricter validation
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileName.endsWith('.docx')) {
    // Additional validation: file should have reasonable size
    if (file.size === 0) {
      return false; // Empty files are not valid
    }
    return true;
  }
  
  // Check for PDF files
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    // Additional validation: file should have reasonable size
    if (file.size === 0) {
      return false; // Empty files are not valid
    }
    return true;
  }
  
  return false;
}

/**
 * Gets human-readable file type description
 * @param {File} file - File to describe
 * @returns {string} - Description of file type
 */
export function getFileTypeDescription(file) {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return 'Text file';
  } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'PDF document';
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return 'Word document (DOCX)';
  } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
    return 'Word document (DOC)';
  } else {
    return 'Unknown file type';
  }
}