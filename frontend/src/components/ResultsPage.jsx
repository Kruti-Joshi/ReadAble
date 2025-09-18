import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

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
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Reading level: A2
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {processedText?.original}
                </p>
              </div>
            </div>

            {/* Simplified Text */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Simplified Text</h2>
                  <span className="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded text-green-700">
                    Reading level: A2
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {processedText?.simplified}
                </p>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="mt-8">
            <AudioPlayer 
              text={activeTab === 'simplified' ? processedText?.simplified : processedText?.original}
              isSimplified={activeTab === 'simplified'}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ResultsPage