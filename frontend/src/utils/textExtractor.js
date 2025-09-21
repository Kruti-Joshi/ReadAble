/**
 * Text extraction utilities for different file types
 */

import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist';

// Initialize and configure PDF.js worker using local file
if (typeof window !== 'undefined') {
  // Use local worker file served from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}



/**
 * Extracts text content from a file based on its type
 * @param {File} file - The file to extract text from
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromFile(file) {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await extractTextFromTextFile(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractTextFromDocxFile(file);
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPdfFile(file);
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
 * Extracts text from a DOCX Word document
 * @param {File} file - DOCX file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromDocxFile(file) {
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
        
        // Try to extract text using mammoth
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        // Log any warnings but don't fail
        if (result.messages && result.messages.length > 0) {
          console.warn('Word document extraction warnings:', result.messages);
        }
        
        // Check if we got any text
        if (!result.value || result.value.trim().length === 0) {
          throw new Error('No text content could be extracted from this Word document. The document might be empty or contain only images/tables.');
        }
        
        resolve(result.value);
      } catch (error) {
        // Provide more specific error messages based on the error
        if (error.message.includes('zip file') || error.message.includes('central directory')) {
          reject(new Error('The Word document appears to be corrupted or is not a valid .docx file. Please try saving the document again or use a different file.'));
        } else if (error.message.includes('Cannot read properties')) {
          reject(new Error('Invalid Word document format. Please ensure the file is a valid .docx document.'));
        } else {
          reject(new Error('Failed to extract text from Word document: ' + error.message));
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