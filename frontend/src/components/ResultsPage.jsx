import { useState } from 'react'
import AudioPlayer from './AudioPlayer'
import { formatTextForDisplay } from '../utils/textFormatter'

const ResultsPage = ({ processedText, onBack }) => {
  const [activeTab, setActiveTab] = useState('simplified')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ReadAble</span>
          </div>
          <nav className="flex space-x-8">
            <button 
              onClick={onBack}
              className="text-gray-500 hover:text-purple-600 font-medium"
            >
              Landing
            </button>
            <button className="text-gray-700 hover:text-purple-600 font-medium border-b-2 border-purple-600 pb-1">
              Results
            </button>
          </nav>
          <div className="flex space-x-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
              Copy
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
              Download TXT
            </button>
            <button className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800">
              New File
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1 max-w-md">
            <button
              onClick={() => setActiveTab('original')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'original'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setActiveTab('simplified')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'simplified'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Simplified
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Original Text */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Original Text</h2>
                  <div className="flex items-center space-x-2">
                    {processedText?.processingStats && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {processedText.processingStats.wordCount} words
                      </span>
                    )}
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Complex
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {formatTextForDisplay(processedText?.original || '')}
                </p>
              </div>
            </div>

            {/* Simplified Text */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Simplified Text</h2>
                  <div className="flex items-center space-x-2">
                    {processedText?.processingStats && (
                      <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded text-blue-700">
                        {processedText.processingStats.totalChunks} chunks processed
                      </span>
                    )}
                    <span className="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded text-green-700">
                      Simple
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {formatTextForDisplay(processedText?.simplified || '')}
                </p>
              </div>
            </div>
          </div>

          {/* Processing Statistics */}
          {processedText?.processingStats && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Processing Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Total Chunks:</span>
                  <span className="text-blue-600 ml-2">{processedText.processingStats.totalChunks}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Successfully Processed:</span>
                  <span className="text-blue-600 ml-2">{processedText.processingStats.successfulChunks}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Word Count:</span>
                  <span className="text-blue-600 ml-2">{processedText.processingStats.wordCount.toLocaleString()}</span>
                </div>
              </div>
              {processedText.processingStats.errors && processedText.processingStats.errors.length > 0 && (
                <div className="mt-3">
                  <span className="text-red-700 font-medium text-sm">Processing Errors:</span>
                  <span className="text-red-600 ml-2 text-sm">{processedText.processingStats.errors.length} chunks had errors</span>
                </div>
              )}
            </div>
          )}

          {/* Audio Player */}
          <div className="mt-8">
            <AudioPlayer 
              text={activeTab === 'simplified' 
                ? formatTextForDisplay(processedText?.simplified || '') 
                : formatTextForDisplay(processedText?.original || '')
              }
              speechText={activeTab === 'simplified' ? processedText?.speechText : null}
              isSimplified={activeTab === 'simplified'}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ResultsPage