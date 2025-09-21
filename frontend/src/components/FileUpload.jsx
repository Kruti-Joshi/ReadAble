import { useState, useRef } from 'react'

const FileUpload = ({ onFileUpload, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    if (disabled) return
    
    const files = e.target.files
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file) => {
    // Basic file type validation
    const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (allowedTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      // Additional validation for DOCX files
      if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        if (file.size === 0) {
          alert('The Word document appears to be empty. Please select a valid document.')
          return
        }
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          alert('Word document is too large. Please use a file smaller than 50MB.')
          return
        }
      }
      
      onFileUpload(file)
    } else {
      alert('Please upload a text file (.txt) or Word document (.docx). PDF and legacy Word (.doc) files are not currently supported.')
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 
          ${disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
            : isDragOver 
              ? 'border-purple-400 bg-purple-50 cursor-pointer' 
              : 'border-purple-200 bg-purple-50/30 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer'
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
          disabled={disabled}
        />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${disabled ? 'bg-gray-100' : 'bg-purple-100'}`}>
            <svg className={`w-8 h-8 ${disabled ? 'text-gray-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {/* Upload Text */}
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {disabled ? 'Processing...' : 'Drop your file here'}
            </h3>
            <p className={`mb-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
              {disabled ? 'Please wait while we process your document' : 'We\'ll simplify it and read it aloud'}
            </p>
            <button 
              className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors ${
                disabled 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              disabled={disabled}
            >
              {disabled ? 'Processing...' : 'Choose File'}
            </button>
          </div>
        </div>
        
        {/* Drag overlay */}
        {isDragOver && !disabled && (
          <div className="absolute inset-0 bg-purple-100/50 border-2 border-purple-400 rounded-2xl flex items-center justify-center">
            <div className="text-purple-600 font-semibold">Drop file to upload</div>
          </div>
        )}
      </div>
      
      <p className={`text-sm text-center mt-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
        Supports: Text files (.txt) and Word documents (.docx)
      </p>
    </div>
  )
}

export default FileUpload