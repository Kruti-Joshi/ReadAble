import { useState } from 'react'
import LandingPage from './components/LandingPage'
import ResultsPage from './components/ResultsPage'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [processedText, setProcessedText] = useState(null)

  const handleFileUpload = (file) => {
    setUploadedFile(file)
    // Simulate text processing
    const originalText = "The proposed methodology leverages a multifaceted approach to enhance comprehension across heterogeneous user cohorts, synthesizing linguistic simplification with assistive auditory feedback."
    const simplifiedText = "Our tool helps many kinds of readers understand documents better. It rewrites hard sentences in plain language and can read the text aloud."
    
    setProcessedText({
      original: originalText,
      simplified: simplifiedText
    })
    setCurrentPage('results')
  }

  const handleBackToLanding = () => {
    setCurrentPage('landing')
    setUploadedFile(null)
    setProcessedText(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' ? (
        <LandingPage onFileUpload={handleFileUpload} />
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