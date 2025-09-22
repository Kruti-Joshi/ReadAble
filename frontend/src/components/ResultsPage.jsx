import { useState, useEffect, useRef, useCallback } from 'react'
import AudioPlayer from './AudioPlayer'
import AccessibilityPanel from './AccessibilityPanel'
import { formatTextForDisplay } from '../utils/textFormatter'
import { 
  getAccessibilitySettings,
  getThemeColors,
  getTextStyles,
  formatTextForReadability
} from '../utils/accessibilityHelper'

const ResultsPage = ({ processedText, onBack }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false)
  const [accessibilitySettings, setAccessibilitySettings] = useState(getAccessibilitySettings())
  const [copied, setCopied] = useState(false)
  const wordElementsRef = useRef({})
  const audioPlayerRef = useRef(null)

  // Handler functions
  const handleCopy = async () => {
    try {
      const textToCopy = formatTextForReadability(processedText?.simplified || '', accessibilitySettings)
      
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleDownload = () => {
    try {
      const textToDownload = formatTextForReadability(processedText?.simplified || '', accessibilitySettings)
      
      const blob = new Blob([textToDownload], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `readable-simplified-text.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download text:', err)
    }
  }

  const handleWordHighlight = useCallback((wordIndex) => {
    console.log('Word highlight received:', wordIndex)
    setCurrentWordIndex(wordIndex)
  }, [])

  // Handle clicking on a word to start speech from that position
  const handleWordClick = (wordIndex) => {
    // Get the word from the current element for debugging
    const wordElement = wordElementsRef.current[wordIndex]
    const wordText = wordElement ? wordElement.textContent : 'unknown'
    
    console.log('Word clicked - Index:', wordIndex, 'Word:', wordText)
    
    // Use the ref to call the AudioPlayer's playFromWord function
    if (audioPlayerRef.current && audioPlayerRef.current.playFromWord) {
      console.log('Calling audioPlayerRef.current.playFromWord with index:', wordIndex)
      audioPlayerRef.current.playFromWord(wordIndex)
    } else {
      console.warn('AudioPlayer ref or playFromWord function not available')
      // Fallback: just highlight the word
      setCurrentWordIndex(wordIndex)
    }
  }

  // Apply accessibility settings when they change
  useEffect(() => {
    const theme = getThemeColors(accessibilitySettings)
    document.body.style.backgroundColor = theme.bgColor
  }, [accessibilitySettings])

  // Auto-scroll to current word
  useEffect(() => {
    if (currentWordIndex >= 0 && wordElementsRef.current[currentWordIndex]) {
      const element = wordElementsRef.current[currentWordIndex]
      console.log(`Scrolling to word ${currentWordIndex}:`, element.textContent)
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
    } else if (currentWordIndex >= 0) {
      console.log(`Word element ${currentWordIndex} not found yet`)
    }
  }, [currentWordIndex])

  // Function to render text with word highlighting and accessibility features
  const renderTextWithHighlight = (text) => {
    if (!text) return null
    
    let displayText = formatTextForDisplay(text)
    
    // Apply readability formatting
    displayText = formatTextForReadability(displayText, accessibilitySettings)
    
    // Clear previous word elements when re-rendering
    wordElementsRef.current = {}
    
    // Split text preserving spaces and get word positions
    const parts = displayText.split(/(\s+)/)
    let wordCount = 0
    
    console.log('Rendering text with', parts.filter(part => !/^\s+$/.test(part)).length, 'words')
    
    return parts.map((part, index) => {
      const isSpace = /^\s+$/.test(part)
      
      if (isSpace) {
        return <span key={index}>{part}</span>
      }
      
      // Always enable highlighting (no longer a setting)
      const isCurrentWord = wordCount === currentWordIndex
      const currentWordCount = wordCount
      wordCount++
      
      return (
        <span
          key={index}
          ref={(el) => {
            if (el) {
              wordElementsRef.current[currentWordCount] = el
              if (currentWordCount === 0) {
                console.log('First word element set:', el.textContent)
              }
            }
          }}
          onClick={() => handleWordClick(currentWordCount)}
          className={`transition-all duration-200 cursor-pointer hover:bg-blue-50 hover:border hover:border-blue-200 hover:rounded-sm ${
            isCurrentWord ? 'bg-blue-100 border-2 border-blue-400 px-1 rounded-md shadow-sm font-semibold transform scale-105' : 'px-0.5'
          }`}
          title={`Click to start reading from "${part}"`}
        >
          {part}
        </span>
      )
    })
  }

  const theme = getThemeColors(accessibilitySettings)
  const textStyles = getTextStyles(accessibilitySettings)

  // Button styling based on accessibility settings
  const getButtonClass = (isActive = false) => {
    // Always use large buttons for accessibility
    const baseClass = `font-medium transition-all duration-200 px-6 py-3 text-base min-h-[44px]`
    
    if (isActive) {
      return `${baseClass} bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700`
    }
    
    return `${baseClass} text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg`
  }

  return (
    <div 
      className={`min-h-screen ${theme.bg} transition-colors duration-300`}
      style={{ fontFamily: textStyles.fontFamily }}
    >
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${theme.bg} border-b border-gray-200 shadow-sm`}>
        <div className={`max-w-7xl mx-auto px-6 py-4`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/ReadableLogo.png" 
                alt="ReadAble Logo" 
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <span className={`text-xl font-semibold ${theme.text}`}>ReadAble</span>
                <p className="text-sm text-gray-600">Accessible Reading Assistant</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button 
                onClick={() => setAccessibilityPanelOpen(true)}
                className={`${getButtonClass()} flex items-center space-x-2 border-2 border-purple-200`}
                title="Accessibility Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </button>
              <button 
                onClick={onBack}
                className={getButtonClass()}
              >
                ← Back to Upload
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed header */}
      <main className="pt-20">
        {/* Fixed Audio Player positioned directly below header with no gap */}
        <div className={`fixed top-20 left-0 right-0 z-40 ${theme.bg} border-b shadow-sm`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Actions and Controls */}
            <section className="mb-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleCopy}
                    className={`${getButtonClass()} border-2 border-green-200`}
                  >
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className={`${getButtonClass()} border-2 border-blue-200`}
                  >
                    Download TXT
                  </button>
                  <button 
                    onClick={onBack}
                    className={`${getButtonClass()} border-2 border-purple-200`}
                  >
                    Upload New File
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${theme.textSecondary}`}>
                    Simplified: {formatTextForReadability(processedText?.simplified || '', accessibilitySettings).split(/\s+/).filter(word => word.length > 0).length} words
                  </span>
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Simplified Document
                  </div>
                </div>
              </div>
            </section>

            {/* Audio Player */}
            <div className="flex justify-center">
              <AudioPlayer
                ref={audioPlayerRef}
                text={formatTextForReadability(processedText?.simplified || '', accessibilitySettings)}
                onWordHighlight={handleWordHighlight}
                accessibilitySettings={accessibilitySettings}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Area - adjusted padding for fixed header and audio player */}
        <div className="pt-36 pb-8">
          <div className="max-w-4xl mx-auto px-6">
            {/* Simplified Text Content */}
            <div className={`${theme.bg} rounded-lg shadow-sm border`}>
              <div className={`px-6 py-4 border-b ${theme.border}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-semibold ${theme.text}`}>Simplified Document</h2>
                  <div className="flex items-center space-x-2">
                    {processedText?.processingStats && (
                      <span className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                        {processedText.processingStats.totalChunks} sections processed
                      </span>
                    )}
                    <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                      Easy to Read
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div 
                  className={`${theme.text} leading-relaxed whitespace-pre-wrap`}
                  style={{
                    fontSize: textStyles.fontSize,
                    lineHeight: textStyles.lineHeight,
                    fontFamily: textStyles.fontFamily,
                    letterSpacing: textStyles.letterSpacing
                  }}
                >
                  {renderTextWithHighlight(formatTextForReadability(processedText?.simplified || '', accessibilitySettings))}
                </div>
              </div>
            </div>

            {/* Processing Statistics */}
            {processedText?.processingStats && (
              <div className={`${theme.bg} rounded-lg p-6 border shadow-sm mt-8`}>
                <h3 className={`text-lg font-medium ${theme.text} mb-4`}>Processing Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                  <div className={`p-4 rounded-lg ${theme.bgSecondary}`}>
                    <span className={`${theme.text} font-medium block`}>Total Chunks:</span>
                    <span className={`${theme.textSecondary} text-lg font-semibold`}>
                      {processedText.processingStats.totalChunks}
                    </span>
                  </div>
                  <div className={`p-4 rounded-lg ${theme.bgSecondary}`}>
                    <span className={`${theme.text} font-medium block`}>Successfully Processed:</span>
                    <span className={`${theme.textSecondary} text-lg font-semibold`}>
                      {processedText.processingStats.successfulChunks}
                    </span>
                  </div>
                  <div className={`p-4 rounded-lg ${theme.bgSecondary}`}>
                    <span className={`${theme.text} font-medium block`}>Word Count:</span>
                    <span className={`${theme.textSecondary} text-lg font-semibold`}>
                      {processedText.processingStats.wordCount.toLocaleString()}
                    </span>
                  </div>
                  {processedText.processingStats.imageCount > 0 && (
                    <div className={`p-4 rounded-lg ${theme.bgSecondary}`}>
                      <span className={`${theme.text} font-medium block`}>Images Processed:</span>
                      <span className={`${theme.textSecondary} text-lg font-semibold`}>
                        {processedText.processingStats.imageCount}
                      </span>
                    </div>
                  )}
                </div>
                {processedText.processingStats.errors && processedText.processingStats.errors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-red-700 font-medium text-sm">Processing Errors:</span>
                    <span className="text-red-600 ml-2 text-sm">{processedText.processingStats.errors.length} chunks had errors</span>
                  </div>
                )}
                
                {/* Image Processing Results */}
                {processedText?.imageSummary && processedText.imageSummary.totalImages > 0 && (
                  <div className="mt-6">
                    <h4 className={`text-md font-medium ${theme.text} mb-3`}>Image Processing Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className={`p-3 rounded-lg ${theme.bgSecondary}`}>
                        <span className={`${theme.text} font-medium block`}>Text Images:</span>
                        <span className={`${theme.textSecondary} text-lg font-semibold`}>
                          {processedText.imageSummary.textImages}
                        </span>
                        <span className={`${theme.textSecondary} text-xs block`}>OCR processed</span>
                      </div>
                      <div className={`p-3 rounded-lg ${theme.bgSecondary}`}>
                        <span className={`${theme.text} font-medium block`}>Diagrams:</span>
                        <span className={`${theme.textSecondary} text-lg font-semibold`}>
                          {processedText.imageSummary.diagrams}
                        </span>
                        <span className={`${theme.textSecondary} text-xs block`}>Ready for analysis</span>
                      </div>
                      <div className={`p-3 rounded-lg ${theme.bgSecondary}`}>
                        <span className={`${theme.text} font-medium block`}>OCR Text Length:</span>
                        <span className={`${theme.textSecondary} text-lg font-semibold`}>
                          {processedText.imageSummary.totalOcrText?.length || 0}
                        </span>
                        <span className={`${theme.textSecondary} text-xs block`}>characters</span>
                      </div>
                    </div>
                    
                    {/* Detailed Image Results */}
                    {processedText.images && processedText.images.length > 0 && (
                      <div className="mt-4">
                        <details className={`${theme.bgSecondary} rounded-lg p-4`}>
                          <summary className={`${theme.text} font-medium cursor-pointer`}>
                            View Detailed Image Results ({processedText.images.length} images)
                          </summary>
                          <div className="mt-3 space-y-3">
                            {processedText.images.map((img, index) => (
                              <div key={index} className={`${theme.bg} rounded-lg p-3 border`}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <span className={`${theme.text} font-medium text-sm`}>
                                      {img.originalFilename || `Image ${index + 1}`}
                                    </span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                      img.type === 'text-image' 
                                        ? 'bg-green-100 text-green-800' 
                                        : img.type === 'diagram'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {img.type === 'text-image' ? 'Text Extracted' : 
                                       img.type === 'diagram' ? 'Diagram' : 'Error'}
                                    </span>
                                  </div>
                                  {img.originalImage && (
                                    <img 
                                      src={img.originalImage} 
                                      alt={`Processed image ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded border ml-3"
                                    />
                                  )}
                                </div>
                                {img.ocrText && (
                                  <div className="mt-2">
                                    <span className={`${theme.textSecondary} text-xs font-medium`}>Extracted Text:</span>
                                    <p className={`${theme.textSecondary} text-xs mt-1 max-w-full overflow-hidden`}>
                                      {img.ocrText.substring(0, 200)}
                                      {img.ocrText.length > 200 ? '...' : ''}
                                    </p>
                                    {img.confidence && (
                                      <span className={`text-xs ${
                                        img.confidence > 70 ? 'text-green-600' : 
                                        img.confidence > 40 ? 'text-yellow-600' : 'text-red-600'
                                      }`}>
                                        Confidence: {Math.round(img.confidence)}%
                                      </span>
                                    )}
                                  </div>
                                )}
                                {img.diagramData && (
                                  <div className="mt-2">
                                    <span className={`${theme.textSecondary} text-xs font-medium`}>Analysis:</span>
                                    <p className={`${theme.textSecondary} text-xs mt-1`}>
                                      {img.diagramData.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Accessibility Panel */}
      {accessibilityPanelOpen && (
        <AccessibilityPanel
          isOpen={accessibilityPanelOpen}
          onClose={() => setAccessibilityPanelOpen(false)}
          settings={accessibilitySettings}
          onSettingsChange={setAccessibilitySettings}
        />
      )}
    </div>
  );
};

export default ResultsPage;