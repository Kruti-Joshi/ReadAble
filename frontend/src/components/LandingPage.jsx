import { useState } from 'react'
import FileUpload from './FileUpload'

const LandingPage = ({ onFileUpload }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ReadAble</span>
          </div>
          <nav className="flex space-x-8">
            <button className="text-gray-700 hover:text-purple-600 font-medium border-b-2 border-purple-600 pb-1">
              Landing
            </button>
            <button className="text-gray-500 hover:text-purple-600 font-medium">
              Results
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Accessible Reading Assistant
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Simplify documents and listen to them instantly.
            </p>

            {/* File Upload Area */}
            <FileUpload onFileUpload={onFileUpload} />

            <p className="text-sm text-gray-500 mt-4">
              No Sign-in. No storage. Private.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {/* No Storage */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Storage</h3>
              <p className="text-gray-600">Your files never leave the session.</p>
            </div>

            {/* Clear & Simple */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear & Simple</h3>
              <p className="text-gray-600">We rewrite in plain language.</p>
            </div>

            {/* Read Aloud */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a1 1 0 01-.707-.293l-2.828-2.828A1 1 0 005 8.172V6a1 1 0 011-1h3a1 1 0 01.707.293L12.536 8.464a5 5 0 000 7.072L9.707 18.707A1 1 0 019 19H6a1 1 0 01-1-1v-2.172a1 1 0 01.293-.707l2.828-2.828A1 1 0 019 12z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Read Aloud</h3>
              <p className="text-gray-600">Instant text-to-speech playback.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LandingPage