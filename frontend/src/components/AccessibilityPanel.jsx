import React, { useState, useEffect } from 'react'
import { 
  DYSLEXIA_FONTS,
  FONT_SIZES, 
  LINE_SPACING,
  LETTER_SPACING,
  COLOR_THEMES,
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

                {/* Color Themes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Background & Text Colors
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (Choose colors that work best for you)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => updateSetting('colorTheme', key)}
                        className={`p-4 text-left border-2 rounded-lg transition-all relative overflow-hidden ${
                          settings.colorTheme === key
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                        style={{ 
                          backgroundColor: theme.bgColor,
                          color: theme.textColor,
                          borderColor: settings.colorTheme === key ? '#8B5CF6' : theme.borderColor
                        }}
                      >
                        <div className="relative z-10">
                          <div className="font-medium text-base mb-1">{theme.name}</div>
                          <div className="text-sm opacity-75 mb-2">{theme.description}</div>
                          <div className="text-xs opacity-60">
                            Sample text in this color scheme
                          </div>
                        </div>
                        {settings.colorTheme === key && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Color & Reading Tips:</div>
                        <ul className="text-xs space-y-1">
                          <li>• <strong>Cream backgrounds</strong> are research-backed for dyslexia - reduce white paper glare and visual stress</li>
                          <li>• <strong>Blue backgrounds</strong> can improve focus and reading flow</li>
                          <li>• <strong>Dark mode</strong> helps in low-light conditions</li>
                          <li>• <strong>High contrast</strong> improves text clarity for some users</li>
                          <li>• All colors meet accessibility contrast standards</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations - Moved inside scrollable area */}
                {recommendations.length > 0 && (
                  <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg mt-6">
                    <h4 className="font-medium text-yellow-800 mb-2">💡 Recommendations</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </div>

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