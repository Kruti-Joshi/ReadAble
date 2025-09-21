<div align="center">
  <img src="./public/ReadableLogo.png" alt="ReadAble Logo" width="200" height="200">
</div>

# ReadAble - Accessible Reading Assistant

A comprehensive React application designed to make reading more accessible for everyone, especially users with dyslexia and reading difficulties. ReadAble simplifies documents, provides advanced text-to-speech functionality, and offers research-backed accessibility features.

## 🌟 Key Features

### 📄 **Multi-Format Document Support**
- **PDF Files**: Full PDF.js integration with local worker for secure processing
- **Word Documents**: Complete .docx support via Mammoth.js
- **Text Files**: Native text file processing
- **Drag & Drop**: Intuitive file upload with visual feedback
- **No Storage**: Files never leave your session - completely private and secure

### 🎯 **Advanced Accessibility Features**
- **6 Research-Backed Color Themes**: 
  - Light, Cream (dyslexia-friendly), Blue, Green, Dark, and High Contrast
  - All themes meet WCAG accessibility contrast standards
  - Cream backgrounds proven to reduce visual stress for dyslexic readers
- **OpenDyslexic Font**: Specialized font designed for dyslexic readers
- **Customizable Typography**: Adjustable font size, line height, letter spacing, and word spacing

### 🔊 **Enhanced Text-to-Speech**
- **Dual Voice Options**: Male and female voice selection
- **Speed Control**: 0.5x to 2.0x playback speed with precise controls
- **Word Highlighting**: Blue border highlighting (dyslexia-friendly, avoiding yellow backgrounds)
- **Progress Tracking**: Visual progress bar with click-to-seek functionality
- **Web Speech API**: High-quality browser-native speech synthesis

### ✨ **Text Processing & Cleanup**
- **Text Simplification**: Converts complex text into plain language (A2 reading level)
- **Formatted Display**: Clean, readable text presentation
- **Copy & Download**: Easy text export in multiple formats

### 🎨 **User Experience**
- **Fixed Header**: Always-accessible navigation and controls
- **Responsive Design**: Optimized for desktop and mobile devices
- **Accessibility Panel**: Comprehensive settings with live preview

## 🛠️ Tech Stack

### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **PDF.js**: Mozilla's PDF processing library for secure client-side PDF handling
- **Mammoth.js**: Microsoft Word document processing
- **Web Speech API**: Browser-native text-to-speech synthesis

### **Accessibility Technologies**
- **OpenDyslexic Font**: Specialized typeface for dyslexic readers
- **WCAG Compliant Colors**: All color themes meet accessibility contrast standards
- **Research-Based Design**: Color choices backed by dyslexia and accessibility research
- **Semantic HTML**: Proper HTML structure for screen readers

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 16 or higher
- **npm**: Package manager (comes with Node.js)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with Web Speech API support

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kruti-Joshi/ReadAble.git
   cd ReadAble
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up PDF.js worker** (for PDF support):
   ```bash
   Copy-Item "node_modules\pdfjs-dist\build\pdf.worker.min.mjs" "public\pdf.worker.min.js"
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and visit `http://localhost:5173`


## 📁 Project Structure

```
ReadAble/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx        # Main landing page with hero section
│   │   │   ├── ResultsPage.jsx        # Results display with fixed header
│   │   │   ├── FileUpload.jsx         # Drag-and-drop file upload component
│   │   │   ├── AudioPlayer.jsx        # Advanced text-to-speech controls
│   │   │   └── AccessibilityPanel.jsx # Comprehensive accessibility settings
│   │   ├── utils/
│   │   │   ├── accessibilityHelper.js # Color themes and accessibility logic
│   │   │   ├── textFormatter.js       # Text processing and quote removal
│   │   │   ├── fileProcessor.js       # Multi-format file processing
│   │   │   └── pdfProcessor.js        # PDF.js integration
│   │   ├── fonts/
│   │   │   └── OpenDyslexic/          # OpenDyslexic font files
│   │   ├── App.jsx                    # Main application component
│   │   ├── main.jsx                   # Application entry point
│   │   └── index.css                  # Global styles with Tailwind
│   ├── public/
│   │   ├── pdf.worker.min.js          # PDF.js worker for secure processing
│   │   └── index.html                 # HTML template
│   ├── package.json                   # Dependencies and scripts
│   ├── tailwind.config.js             # Tailwind configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── vite.config.js                 # Vite build configuration
│   └── README.md                      # This documentation
├── backend/                           # Azure Functions backend (if applicable)
└── .gitignore                        # Git ignore rules
```

## 🧩 Component Architecture

### **LandingPage.jsx**
- **Hero Section**: Eye-catching introduction with clear value proposition
- **Feature Showcase**: Highlights of accessibility features and benefits
- **File Upload Integration**: Seamless file upload experience
- **Responsive Design**: Mobile-first approach with desktop enhancements

### **ResultsPage.jsx**
- **Fixed Header**: Always-accessible navigation and controls
- **Dual View Layout**: Side-by-side original and simplified text comparison
- **Integrated Audio Player**: Embedded text-to-speech with word highlighting
- **Export Options**: Copy to clipboard and download functionality
- **Theme Integration**: Dynamic styling based on accessibility settings

### **AccessibilityPanel.jsx**
- **Comprehensive Settings**: All accessibility options in one place
- **Live Preview**: Real-time theme and typography adjustments
- **Research-Backed Recommendations**: AI-powered accessibility suggestions
- **Validation System**: Smart recommendations based on user choices
- **Scrollable Layout**: Properly handles dynamic content without breaking UI

### **AudioPlayer.jsx**
- **Advanced Controls**: Play, pause, stop, and seek functionality
- **Voice Selection**: Male and female voice options
- **Speed Control**: Precise playback speed adjustment (0.5x to 2.0x)
- **Word Highlighting**: Blue border highlighting for dyslexia-friendly reading
- **Progress Tracking**: Visual progress bar with click-to-seek

### **FileUpload.jsx**
- **Multi-Format Support**: PDF, Word, and text file processing
- **Drag & Drop Interface**: Intuitive file upload experience
- **Visual Feedback**: Clear upload states and error handling
- **File Validation**: Type checking and size limitations

## 🎨 Accessibility Features Deep Dive

### **Color Themes (Research-Backed)**
1. **Light Theme**: Clean white background with dark text - classic and familiar
2. **Cream Theme**: Warm off-white background - research shows reduces visual stress for dyslexic readers
3. **Blue Theme**: Soft blue background - can improve focus and reading flow
4. **Green Theme**: Gentle green background - calming and easy on the eyes
5. **Dark Theme**: Dark background with light text - excellent for low-light conditions
6. **High Contrast**: Maximum contrast for users with visual impairments

All themes meet WCAG 2.1 AA accessibility standards for color contrast.

### **Typography Customization**
- **Font Family**: OpenDyslexic (default), Arial, Georgia, Verdana
- **Font Size**: 12px to 32px with smooth slider control
- **Line Height**: 1.2 to 2.5 for comfortable reading spacing
- **Letter Spacing**: 0px to 5px to reduce character crowding
- **Word Spacing**: 0px to 10px for improved word recognition

### **Text Processing Features**
- **Clean Formatting**: Removes unnecessary formatting for cleaner reading
- **Word Highlighting**: Blue border highlighting during audio playback (avoids yellow backgrounds that can be problematic for dyslexia)

## 🔧 Technical Implementation

### **PDF Processing**
- Uses PDF.js with local worker for client-side processing
- No data leaves the user's device
- Supports complex PDF layouts and formatting

### **Word Document Processing**
- Mammoth.js integration for .docx files
- Preserves basic formatting while cleaning for accessibility
- Extracts text content while maintaining readability

### **Audio Implementation**
- Web Speech API for high-quality synthesis
- Word-by-word highlighting synchronization
- Cross-browser compatibility with fallbacks
- Memory-efficient audio processing

### **State Management**
- React hooks for component state management
- LocalStorage for accessibility preferences persistence
- Context API for global theme management
- Efficient re-rendering optimization

## 🌐 Browser Support

### **Fully Supported**
- **Chrome**: 60+ (Full Web Speech API support)
- **Firefox**: 62+ (Good speech synthesis support)
- **Safari**: 14+ (Native speech synthesis)
- **Edge**: 79+ (Chromium-based, full support)

## 📱 Usage Guide

### **Getting Started**
1. **Upload a Document**: Drag and drop or click to select PDF, Word, or text files
2. **Customize Accessibility**: Click the accessibility icon to open settings panel
3. **Choose Your Theme**: Select from 6 research-backed color themes
4. **Adjust Typography**: Fine-tune font size, spacing, and other text properties
5. **Listen to Text**: Use the audio player to hear your document read aloud
6. **Export Results**: Copy or download the processed text

### **Accessibility Tips**
- **Cream Backgrounds**: Research shows cream backgrounds reduce visual stress for dyslexic readers
- **OpenDyslexic Font**: Specially designed font improves reading for dyslexic users
- **Blue Highlighting**: Word highlighting uses blue borders instead of yellow backgrounds
- **Speed Control**: Adjust audio speed to match your comfortable listening pace
- **Dark Mode**: Excellent for reading in low-light conditions

### **File Format Support**
- **PDF Files**: Full support including complex layouts and formatting
- **Word Documents**: .docx files with text extraction and formatting preservation
- **Text Files**: Plain text with automatic formatting improvements

## 🔧 Development

### **Adding New Features**
1. **Components**: Add new React components in `src/components/`
2. **Utilities**: Add helper functions in `src/utils/`
3. **Styles**: Use Tailwind classes for consistent styling
4. **Accessibility**: Always test with screen readers and accessibility tools

### **Code Quality**
- **ESLint**: Enforces code quality and consistency
- **Prettier**: Automatic code formatting (can be configured)
- **TypeScript**: Consider migrating to TypeScript for better type safety
- **Testing**: Add unit tests with Jest and React Testing Library

### **Common Development Tasks**
```bash
# Install new dependency
npm install package-name

# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix auto-fixable vulnerabilities
npm audit fix
```

## 🤝 Contributing

We welcome contributions to make ReadAble even more accessible and useful!

### **How to Contribute**
1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper documentation
4. **Test thoroughly** across different browsers and accessibility tools
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Submit a pull request** with detailed description

### **Contribution Guidelines**
- **Accessibility First**: All features must maintain or improve accessibility
- **Research-Backed**: Prefer evidence-based design decisions
- **Cross-Browser**: Test on multiple browsers and devices
- **Documentation**: Update README and code comments
- **Performance**: Consider impact on load times and memory usage

### **Areas for Contribution**
- **Language Support**: Add internationalization features
- **Voice Options**: Integrate additional TTS engines
- **File Formats**: Support for more document types
- **Accessibility Features**: New features for specific disabilities
- **Performance**: Optimize for larger files and slower devices
- **Testing**: Add comprehensive test coverage

## 📊 Research & Evidence Base

### **Dyslexia-Friendly Design**
- **Cream Backgrounds**: Studies show reduced visual stress compared to white
- **OpenDyslexic Font**: Designed specifically for dyslexic readers
- **Blue Highlighting**: Avoids yellow backgrounds that can be problematic
- **Increased Spacing**: Letter and word spacing improvements aid reading

### **Accessibility Research**
- **WCAG Guidelines**: All color themes meet contrast requirements
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Keyboard Navigation**: Full functionality without mouse
- **Cognitive Load**: Simplified interface reduces mental processing

### **User Experience Studies**
- **Fixed Headers**: Consistent navigation improves usability
- **Audio Synchronization**: Word highlighting aids comprehension
- **Speed Control**: Variable speed accommodates different processing needs
- **Quote Removal**: Cleaner text reduces reading distractions

## 📄 License

This project is part of the **ReadAble Hackathon 2025**.

### **Open Source**
- Feel free to use, modify, and distribute
- Please maintain accessibility focus in any derivatives
- Attribution appreciated but not required
- Consider contributing improvements back to the community

### **Accessibility Commitment**
This project is committed to maintaining and improving accessibility for all users. Any modifications should preserve or enhance the accessibility features that make ReadAble special.

---

**Made with ❤️ for accessibility and inclusion**

*ReadAble - Making reading accessible for everyone*