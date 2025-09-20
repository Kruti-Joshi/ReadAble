/**
 * Accessibility Helper for Learning Disabilities
 * Evidence-based defaults with customization options
 * Based on dyslexia and learning disability research
 */

// Dyslexia-friendly font options (sans-serif only)
export const DYSLEXIA_FONTS = {
  'OpenDyslexic': '"OpenDyslexic", "Arial", sans-serif',
  'Arial': '"Arial", sans-serif',
  'Verdana': '"Verdana", sans-serif',
  'Tahoma': '"Tahoma", sans-serif',
  'Calibri': '"Calibri", sans-serif'
}

// Font sizes following 16-18px minimum for body text
export const FONT_SIZES = {
  'normal': { className: 'text-lg', size: '18px', name: 'Normal (18px)' }, // Default 18px
  'large': { className: 'text-xl', size: '20px', name: 'Large (20px)' },
  'xl': { className: 'text-2xl', size: '24px', name: 'Extra Large (24px)' },
  '2xl': { className: 'text-3xl', size: '30px', name: 'Very Large (30px)' }
}

// Line spacing optimized for readability (1.5x minimum)
export const LINE_SPACING = {
  'comfortable': { value: '1.5', name: 'Comfortable (1.5x)', className: 'leading-normal' }, // Default
  'relaxed': { value: '1.75', name: 'Relaxed (1.75x)', className: 'leading-relaxed' },
  'loose': { value: '2', name: 'Loose (2x)', className: 'leading-loose' }
}

// Letter spacing for improved readability
export const LETTER_SPACING = {
  'normal': { value: '0em', name: 'Normal', className: 'tracking-normal' }, // Default
  'wide': { value: '0.025em', name: 'Wide', className: 'tracking-wide' },
  'wider': { value: '0.05em', name: 'Wider', className: 'tracking-wider' }
}

// Default settings optimized for learning disabilities
export const DEFAULT_SETTINGS = {
  font: 'OpenDyslexic', // OpenDyslexic as default
  fontSize: 'normal', // 18px minimum
  lineSpacing: 'comfortable', // 1.5x spacing
  letterSpacing: 'normal', // Standard letter spacing
  // Essential features enabled by default
  highlightWhileReading: true, // Always enable highlighting
  iconsWithText: true, // Always show icons with text
  largeButtons: true // Always use large touch targets
}

// Default theme colors (fixed, not customizable)
export const DEFAULT_THEME = {
  bg: 'bg-gray-50', // Soft white background
  text: 'text-gray-900',
  textSecondary: 'text-gray-600',
  border: 'border-gray-200',
  bgSecondary: 'bg-gray-100',
  bgColor: '#FAFAFA'
}

export const getAccessibilitySettings = () => {
  const settings = {}
  
  // Load settings from localStorage or use defaults
  Object.keys(DEFAULT_SETTINGS).forEach(key => {
    const stored = localStorage.getItem(`accessibility-${key}`)
    if (stored !== null) {
      // Handle boolean values
      if (typeof DEFAULT_SETTINGS[key] === 'boolean') {
        settings[key] = stored === 'true'
      } else {
        settings[key] = stored
      }
    } else {
      settings[key] = DEFAULT_SETTINGS[key]
    }
  })
  
  return settings
}

export const saveAccessibilitySettings = (settings) => {
  Object.entries(settings).forEach(([key, value]) => {
    localStorage.setItem(`accessibility-${key}`, value.toString())
  })
}

export const resetToDefaults = () => {
  // Clear all accessibility settings from localStorage
  Object.keys(DEFAULT_SETTINGS).forEach(key => {
    localStorage.removeItem(`accessibility-${key}`)
  })
  return DEFAULT_SETTINGS
}

// Text processing for readability
export const formatTextForReadability = (text, settings = {}) => {
  if (!text) return text
  return text
}

// Apply text styling based on accessibility settings
export const getTextStyles = (settings = {}) => {
  const font = DYSLEXIA_FONTS[settings.font] || DYSLEXIA_FONTS.OpenDyslexic
  const fontSize = FONT_SIZES[settings.fontSize] || FONT_SIZES.normal
  const lineSpacing = LINE_SPACING[settings.lineSpacing] || LINE_SPACING.comfortable
  const letterSpacing = LETTER_SPACING[settings.letterSpacing] || LETTER_SPACING.normal
  
  return {
    fontFamily: font,
    fontSize: fontSize.size,
    lineHeight: lineSpacing.value,
    letterSpacing: letterSpacing.value
  }
}

// Get theme colors (now returns fixed theme)
export const getThemeColors = () => {
  return DEFAULT_THEME
}

// Check if current settings follow best practices
export const validateSettings = (settings = {}) => {
  const recommendations = []
  
  if (settings.fontSize === 'small') {
    recommendations.push('Consider using a larger font size (18px minimum recommended)')
  }
  
  return recommendations
}