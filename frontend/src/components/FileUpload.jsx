import { useState, useRef } from 'react'

const FileUpload = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file) => {
    // Basic file type validation
    const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (allowedTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      onFileUpload(file)
    } else {
      alert('Please upload a text file, PDF, or Word document.')
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 
          ${isDragOver 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-purple-200 bg-purple-50/30 hover:border-purple-300 hover:bg-purple-50/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileInputChange}
        />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {/* Upload Text */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your file here
            </h3>
            <p className="text-gray-600 mb-4">
              We'll simplify it and read it aloud
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
              Choose File
            </button>
          </div>
        </div>
        
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-purple-100/50 border-2 border-purple-400 rounded-2xl flex items-center justify-center">
            <div className="text-purple-600 font-semibold">Drop file to upload</div>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 text-center mt-4">
        Supports: PDF, Word documents, and text files
      </p>
    </div>
  )
}

export default FileUpload