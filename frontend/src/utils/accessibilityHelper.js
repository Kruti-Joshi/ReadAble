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

// Color themes optimized for dyslexia and visual processing differences
// All themes meet WCAG AA contrast requirements (4.5:1 minimum)
export const COLOR_THEMES = {
  'light': {
    name: 'Light & Calm',
    description: 'Soft white background with dark text - reduces eye strain',
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    bgSecondary: 'bg-gray-100',
    bgColor: '#FAFAFA',
    textColor: '#111827',
    borderColor: '#E5E7EB'
  },
  'cream': {
    name: 'Warm Cream',
    description: 'Cream background reduces harsh white glare - research shows cream/beige can help people with dyslexia read more comfortably',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    textSecondary: 'text-amber-700',
    border: 'border-amber-200',
    bgSecondary: 'bg-amber-100',
    bgColor: '#FFFBEB',
    textColor: '#78350F',
    borderColor: '#FED7AA'
  },
  'blue': {
    name: 'Cool Blue',
    description: 'Light blue background can improve focus and reduce stress',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    textSecondary: 'text-blue-700',
    border: 'border-blue-200',
    bgSecondary: 'bg-blue-100',
    bgColor: '#EFF6FF',
    textColor: '#1E3A8A',
    borderColor: '#BFDBFE'
  },
  'green': {
    name: 'Sage Green',
    description: 'Green reduces eye fatigue and creates a calming environment',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    textSecondary: 'text-emerald-700',
    border: 'border-emerald-200',
    bgSecondary: 'bg-emerald-100',
    bgColor: '#ECFDF5',
    textColor: '#064E3B',
    borderColor: '#A7F3D0'
  },
  'dark': {
    name: 'Dark Mode',
    description: 'Dark background with light text - reduces screen brightness',
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
    bgSecondary: 'bg-gray-800',
    bgColor: '#111827',
    textColor: '#F9FAFB',
    borderColor: '#374151'
  },
  'highContrast': {
    name: 'High Contrast',
    description: 'Maximum contrast for users with visual processing needs',
    bg: 'bg-white',
    text: 'text-black',
    textSecondary: 'text-gray-800',
    border: 'border-black',
    bgSecondary: 'bg-gray-50',
    bgColor: '#FFFFFF',
    textColor: '#000000',
    borderColor: '#000000'
  }
}

// Default settings optimized for learning disabilities
export const DEFAULT_SETTINGS = {
  font: 'OpenDyslexic', // OpenDyslexic as default
  fontSize: 'normal', // 18px minimum
  lineSpacing: 'comfortable', // 1.5x spacing
  letterSpacing: 'normal', // Standard letter spacing
  colorTheme: 'light', // Default light theme
  // Essential features enabled by default
  highlightWhileReading: true, // Always enable highlighting
  iconsWithText: true, // Always show icons with text
  largeButtons: true // Always use large touch targets
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
  
  // Remove surrounding quotes that might come from API responses
  let cleaned = text.trim();
  
  // Remove surrounding double quotes
  if (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length > 1) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Remove surrounding single quotes
  if (cleaned.startsWith("'") && cleaned.endsWith("'") && cleaned.length > 1) {
    cleaned = cleaned.slice(1, -1);
  }
  
  return cleaned.trim();
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

// Get theme colors based on current settings
export const getThemeColors = (settings = {}) => {
  const currentSettings = settings.colorTheme ? settings : getAccessibilitySettings()
  const themeName = currentSettings.colorTheme || 'light'
  return COLOR_THEMES[themeName] || COLOR_THEMES.light
}

// Check if current settings follow best practices
export const validateSettings = (settings = {}) => {
  const recommendations = []
  
  if (settings.fontSize === 'small') {
    recommendations.push('Consider using a larger font size (18px minimum recommended)')
  }
  
  if (settings.colorTheme === 'highContrast') {
    recommendations.push('High contrast is great for clarity - make sure it\'s comfortable for extended reading')
  }
  
  if (settings.colorTheme === 'dark') {
    recommendations.push('Dark mode can reduce eye strain, especially in low-light environments')
  }
  
  if (settings.font !== 'OpenDyslexic' && settings.font !== 'Arial') {
    recommendations.push('OpenDyslexic and Arial fonts are specifically designed for better readability')
  }
  
  if (settings.colorTheme === 'cream') {
    recommendations.push('Great choice! Research shows cream backgrounds can significantly help people with dyslexia by reducing visual stress')
  }
  
  // Always show this helpful tip about highlighting
  recommendations.push('Word highlighting uses soft blue borders instead of yellow backgrounds - yellow can cause visual stress for some people with dyslexia')
  
  return recommendations
}