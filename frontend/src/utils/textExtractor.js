/**
 * Text extraction utilities for different file types
 */

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
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      throw new Error('PDF extraction requires additional library. Please use text files for now.');
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      throw new Error('Word document extraction requires additional library. Please use text files for now.');
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      throw new Error('Word document extraction requires additional library. Please use text files for now.');
    } else {
      throw new Error('Unsupported file type. Please use text files (.txt).');
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
 * Validates if a file type is supported for text extraction
 * @param {File} file - File to validate
 * @returns {boolean} - True if supported, false otherwise
 */
export function isFileTypeSupported(file) {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  return (
    fileType === 'text/plain' || 
    fileName.endsWith('.txt')
  );
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