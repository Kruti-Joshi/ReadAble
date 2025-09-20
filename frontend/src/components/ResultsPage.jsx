import { useState, useEffect } from 'react'
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
  const [activeTab, setActiveTab] = useState('simplified')
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false)
  const [accessibilitySettings, setAccessibilitySettings] = useState(getAccessibilitySettings())
  const [copied, setCopied] = useState(false)

  // Handler functions
  const handleCopy = async () => {
    try {
      const textToCopy = activeTab === 'original' 
        ? processedText?.original || '' 
        : processedText?.simplified || ''
      
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
      const textToDownload = activeTab === 'original' 
        ? processedText?.original || '' 
        : processedText?.simplified || ''
      
      const blob = new Blob([textToDownload], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `readable-${activeTab}-text.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download text:', err)
    }
  }

  // Apply accessibility settings when they change
  useEffect(() => {
    const theme = getThemeColors()
    document.body.style.backgroundColor = theme.bgColor
  }, [accessibilitySettings])

  // Function to render text with word highlighting and accessibility features
  const renderTextWithHighlight = (text) => {
    if (!text) return null
    
    let displayText = formatTextForDisplay(text)
    
    // Apply readability formatting
    displayText = formatTextForReadability(displayText, accessibilitySettings)
    
    // Split text preserving spaces and get word positions
    const parts = displayText.split(/(\s+)/)
    let wordCount = 0
    
    return parts.map((part, index) => {
      const isSpace = /^\s+$/.test(part)
      
      if (isSpace) {
        return <span key={index}>{part}</span>
      }
      
      // Always enable highlighting (no longer a setting)
      const isCurrentWord = wordCount === currentWordIndex
      wordCount++
      
      return (
        <span
          key={index}
          className={`transition-all duration-200 ${
            isCurrentWord ? 'bg-yellow-300 px-1 rounded-md shadow-sm font-semibold transform scale-105' : ''
          }`}
        >
          {part}
        </span>
      )
    })
  }

  const theme = getThemeColors()
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
      {/* Header */}
      <header className={`${theme.bg} border-b border-gray-200 shadow-sm`}>
        <div className={`max-w-7xl mx-auto px-6 py-4`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">R</span>
              </div>
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

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Actions and Controls */}
          <section className={`${theme.bg} rounded-lg p-6 border shadow-sm`}>
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
                  Original: {(processedText?.original || '').length} chars | 
                  Simplified: {(processedText?.simplified || '').length} chars
                </span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (processedText?.original || '').length > (processedText?.simplified || '').length 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {(processedText?.original || '').length > (processedText?.simplified || '').length ? 'Simplified' : 'Enhanced'}
                </div>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Original Text */}
            <div className={`${theme.bg} rounded-lg shadow-sm border`}>
              <div className={`px-6 py-4 border-b ${theme.border}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${theme.text}`}>Original Text</h2>
                  <div className="flex items-center space-x-2">
                    {processedText?.processingStats && (
                      <span className={`text-sm px-2 py-1 rounded ${theme.bgSecondary} ${theme.textSecondary}`}>
                        {processedText.processingStats.wordCount} words
                      </span>
                    )}
                    <span className={`text-sm px-2 py-1 rounded ${theme.bgSecondary} ${theme.textSecondary}`}>
                      Complex
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div 
                  className={`${theme.text} leading-relaxed whitespace-pre-wrap`}
                  style={{
                    fontSize: textStyles.fontSize,
                    lineHeight: textStyles.lineHeight,
                    fontFamily: textStyles.fontFamily,
                    letterSpacing: textStyles.letterSpacing
                  }}
                >
                  {activeTab === 'original' ? 
                    renderTextWithHighlight(formatTextForReadability(processedText?.original || '', accessibilitySettings)) :
                    formatTextForReadability(processedText?.original || '', accessibilitySettings)
                  }
                </div>
              </div>
            </div>

            {/* Simplified Text */}
            <div className={`${theme.bg} rounded-lg shadow-sm border`}>
              <div className={`px-6 py-4 border-b ${theme.border}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${theme.text}`}>Simplified Text</h2>
                  <div className="flex items-center space-x-2">
                    {processedText?.processingStats && (
                      <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {processedText.processingStats.totalChunks} chunks processed
                      </span>
                    )}
                    <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                      Simple
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div 
                  className={`${theme.text} leading-relaxed whitespace-pre-wrap`}
                  style={{
                    fontSize: textStyles.fontSize,
                    lineHeight: textStyles.lineHeight,
                    fontFamily: textStyles.fontFamily,
                    letterSpacing: textStyles.letterSpacing
                  }}
                >
                  {activeTab === 'simplified' ? 
                    renderTextWithHighlight(formatTextForReadability(processedText?.simplified || '', accessibilitySettings)) :
                    formatTextForReadability(processedText?.simplified || '', accessibilitySettings)
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation and Audio Controls */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Tab Navigation */}
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab('original')}
                className={`${getButtonClass()} ${
                  activeTab === 'original' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                    : 'border-2 border-blue-200'
                }`}
              >
                Original Text
              </button>
              <button 
                onClick={() => setActiveTab('simplified')}
                className={`${getButtonClass()} ${
                  activeTab === 'simplified' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                    : 'border-2 border-blue-200'
                }`}
              >
                Simplified Text
              </button>
            </div>
            
            {/* Audio Player */}
            <div className="flex-shrink-0">
              <AudioPlayer
                text={activeTab === 'original' ? processedText?.original || '' : processedText?.simplified || ''}
                onWordHighlight={setCurrentWordIndex}
                accessibilitySettings={accessibilitySettings}
              />
            </div>
          </div>

          {/* Processing Statistics */}
          {processedText?.processingStats && (
            <div className={`${theme.bg} rounded-lg p-6 border shadow-sm`}>
              <h3 className={`text-lg font-medium ${theme.text} mb-4`}>Processing Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
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
              </div>
              {processedText.processingStats.errors && processedText.processingStats.errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-red-700 font-medium text-sm">Processing Errors:</span>
                  <span className="text-red-600 ml-2 text-sm">{processedText.processingStats.errors.length} chunks had errors</span>
                </div>
              )}
            </div>
          )}
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