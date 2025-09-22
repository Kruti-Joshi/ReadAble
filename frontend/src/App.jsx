import { useState } from 'react'
import LandingPage from './components/LandingPage'
import ResultsPage from './components/ResultsPage'
import { extractTextFromFile, isFileTypeSupported } from './utils/textExtractor'
import { chunkText, validateChunks, recombineChunks } from './utils/textChunker'
import { processDocumentChunks, testConnection } from './utils/apiService'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [processedText, setProcessedText] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(null)
  const [processingError, setProcessingError] = useState(null)

  const handleFileUpload = async (file) => {
    setUploadedFile(file)
    setIsProcessing(true)
    setProcessingProgress(null)
    setProcessingError(null)

    try {
      // Validate file type
      if (!isFileTypeSupported(file)) {
        throw new Error('File type not supported. Please use a text file (.txt), Word document (.docx), or PDF file (.pdf).')
      }

      // Test API connection first
      setProcessingProgress({ stage: 'connecting', message: 'Connecting to API...' })
      const isConnected = await testConnection()
      if (!isConnected) {
        throw new Error('Cannot connect to the ReadAble API. Please make sure the backend is running.')
      }

      // Extract text from file
      setProcessingProgress({ stage: 'extracting', message: 'Reading document...' })
      const extractionResult = await extractTextFromFile(file, (message, progress) => {
        setProcessingProgress({ 
          stage: 'extracting', 
          message: message || 'Reading document...', 
          progress: progress || 0 
        })
      })
      
      // Handle different return formats (backward compatibility)
      const originalText = typeof extractionResult === 'string' ? extractionResult : extractionResult.text
      const extractedImages = extractionResult.images || []
      const imageSummary = extractionResult.imageSummary || { totalImages: 0 }
      
      // Detailed logging for debugging
      console.log('=== FILE EXTRACTION RESULTS ===')
      console.log('Extraction result type:', typeof extractionResult)
      console.log('Original text length:', originalText?.length || 0)
      console.log('Number of images found:', extractedImages.length)
      console.log('Image summary:', imageSummary)
      
      if (extractedImages.length > 0) {
        console.log('=== DETAILED IMAGE PROCESSING ===')
        extractedImages.forEach((img, index) => {
          console.log(`Image ${index + 1}:`, {
            type: img.type,
            filename: img.originalFilename,
            ocrText: img.ocrText ? `"${img.ocrText.substring(0, 100)}..."` : 'No OCR text',
            confidence: img.confidence,
            hasError: !!img.error
          })
        })
        console.log('Total OCR text length:', imageSummary.totalOcrText?.length || 0)
        console.log('OCR text preview:', imageSummary.totalOcrText?.substring(0, 200) || 'No OCR text')
      }
      
      console.log('Final text to be chunked (length):', originalText.length)
      console.log('Final text preview:', originalText.substring(0, 300) + '...')
      console.log('=== END EXTRACTION RESULTS ===')
      
      if (!originalText || originalText.trim().length === 0) {
        throw new Error('No text could be extracted from the file.')
      }

      // Log image processing results
      if (extractedImages.length > 0) {
        console.log(`Processed ${extractedImages.length} images:`, imageSummary)
      }

      // Combine document text with OCR text from images
      let textForProcessing = originalText || ''
      if (imageSummary.totalOcrText && imageSummary.totalOcrText.trim().length > 0) {
        textForProcessing += '\n\n=== TEXT FROM IMAGES ===\n\n' + imageSummary.totalOcrText
        console.log('=== COMBINING TEXT ===')
        console.log('Original document text length:', originalText?.length || 0)
        console.log('OCR text length:', imageSummary.totalOcrText.length)
        console.log('Combined text length:', textForProcessing.length)
        console.log('OCR text being added:', imageSummary.totalOcrText.substring(0, 300) + '...')
      }

      // Chunk the combined text for processing
      setProcessingProgress({ stage: 'chunking', message: 'Preparing text for processing...' })
      const chunks = chunkText(textForProcessing)
      
      // Log chunking results
      console.log('=== TEXT CHUNKING RESULTS ===')
      console.log('Number of chunks created:', chunks.length)
      chunks.forEach((chunk, index) => {
        console.log(`Chunk ${index + 1} - Length: ${chunk.text.length}, Tokens: ${chunk.tokenCount}`)
        console.log(`Chunk ${index + 1} preview: "${chunk.text.substring(0, 150)}..."`)
      })
      console.log('=== END CHUNKING RESULTS ===')
      
      // Validate chunks
      const validation = validateChunks(chunks)
      if (!validation.isValid) {
        console.warn('Some chunks exceed token limits:', validation.oversizedChunks)
      }

      // Process chunks through API
      setProcessingProgress({ stage: 'processing', message: 'Simplifying text...', totalChunks: chunks.length })
      
      const docId = `doc_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const result = await processDocumentChunks(
        docId,
        chunks,
        {
          readingLevel: 'grade6',
          length: 'medium'
        },
        (progress) => {
          setProcessingProgress({
            stage: 'processing',
            message: progress.message || `Processing document...`,
            progress: progress.percentage,
            totalChunks: chunks.length,
            currentChunk: 1
          })
        }
      )

      // Combine processed chunks
      setProcessingProgress({ stage: 'combining', message: 'Finalizing simplified text...' })
      const combinedText = recombineChunks(result.processedChunks)

      // Set final result
      setProcessedText({
        original: combinedText.originalText,
        simplified: combinedText.displayText,
        speechText: combinedText.speechText,
        images: extractedImages,
        imageSummary: imageSummary,
        processingStats: {
          totalChunks: result.totalChunks,
          successfulChunks: result.successfulChunks,
          errors: result.errors,
          wordCount: originalText.split(/\s+/).filter(word => word.length > 0).length,
          imageCount: extractedImages.length,
          ocrTextLength: imageSummary.totalOcrText?.length || 0
        }
      })

      setCurrentPage('results')
    } catch (error) {
      console.error('Error processing file:', error)
      setProcessingError(error.message)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(null)
    }
  }

  const handleBackToLanding = () => {
    setCurrentPage('landing')
    setUploadedFile(null)
    setProcessedText(null)
    setProcessingError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' ? (
        <LandingPage 
          onFileUpload={handleFileUpload} 
          isProcessing={isProcessing}
          processingProgress={processingProgress}
          processingError={processingError}
        />
      ) : (
        <ResultsPage 
          processedText={processedText} 
          onBack={handleBackToLanding}
        />
      )}
    </div>
  )
}

export default App