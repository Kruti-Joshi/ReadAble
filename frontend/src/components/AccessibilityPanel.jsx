import React, { useState, useEffect } from 'react'
import { 
  DYSLEXIA_FONTS,
  FONT_SIZES, 
  LINE_SPACING,
  LETTER_SPACING,
  getAccessibilitySettings,
  saveAccessibilitySettings,
  resetToDefaults,
  validateSettings
} from '../utils/accessibilityHelper'

const AccessibilityPanel = ({ isOpen, onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState(getAccessibilitySettings())

  useEffect(() => {
    onSettingsChange(settings)
  }, [settings, onSettingsChange])

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveAccessibilitySettings(newSettings)
  }

  const handleReset = () => {
    const defaultSettings = resetToDefaults()
    setSettings(defaultSettings)
    onSettingsChange(defaultSettings)
  }

  if (!isOpen) return null

  const recommendations = validateSettings(settings)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="bg-purple-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Text & Typography Settings</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Optimized for dyslexia and learning differences
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-purple-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-purple-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            <div className="p-6 space-y-6">
                
                {/* Font Choice */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Font Choice
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (Sans-serif fonts are most legible)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(DYSLEXIA_FONTS).map(([key, font]) => (
                      <button
                        key={key}
                        onClick={() => updateSetting('font', key)}
                        className={`p-4 text-left border-2 rounded-lg transition-all ${
                          settings.font === key
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        style={{ fontFamily: font }}
                      >
                        <div className="font-medium">{key}</div>
                        <div className="text-sm text-gray-600" style={{ fontFamily: font }}>
                          The quick brown fox jumps
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Font Size
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (16-18px minimum recommended)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(FONT_SIZES).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => updateSetting('fontSize', key)}
                        className={`p-4 text-center border-2 rounded-lg transition-all ${config.className} ${
                          settings.fontSize === key
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-medium">Aa</div>
                        <div className="text-xs text-gray-600 mt-1">{config.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Spacing */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Line Spacing
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (1.5x spacing improves readability)
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(LINE_SPACING).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => updateSetting('lineSpacing', key)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                          settings.lineSpacing === key
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        style={{ lineHeight: config.value }}
                      >
                        <div className="font-medium">{config.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          This is sample text to show how line spacing affects readability. 
                          Proper spacing makes text easier to read for people with dyslexia.
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Spacing */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Letter Spacing</h3>
                  <div className="space-y-3">
                    {Object.entries(LETTER_SPACING).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => updateSetting('letterSpacing', key)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                          settings.letterSpacing === key
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        style={{ letterSpacing: config.value }}
                      >
                        <div className="font-medium">{config.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Sample text with letter spacing
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="border-t border-gray-200 bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-800 mb-2">💡 Recommendations</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AccessibilityPanel