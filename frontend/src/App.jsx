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
        throw new Error('File type not supported. Please use a text file (.txt) or Word document (.docx).')
      }

      // Test API connection first
      setProcessingProgress({ stage: 'connecting', message: 'Connecting to API...' })
      const isConnected = await testConnection()
      if (!isConnected) {
        throw new Error('Cannot connect to the ReadAble API. Please make sure the backend is running.')
      }

      // Extract text from file
      setProcessingProgress({ stage: 'extracting', message: 'Reading document...' })
      const originalText = await extractTextFromFile(file)
      
      if (!originalText || originalText.trim().length === 0) {
        throw new Error('No text could be extracted from the file.')
      }

      // Chunk the text for processing
      setProcessingProgress({ stage: 'chunking', message: 'Preparing text for processing...' })
      const chunks = chunkText(originalText)
      
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
        processingStats: {
          totalChunks: result.totalChunks,
          successfulChunks: result.successfulChunks,
          errors: result.errors,
          wordCount: originalText.split(/\s+/).filter(word => word.length > 0).length
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