# ReadAble - Accessible R### 🎵 **Audio Accessibility**
- **Text-to-Speech**: Built-in browser-native speech synthesis
- **Word Synchronization**: Visual highlighting follows audio playback using gentle blue borders instead of high-contrast yellow (which can cause visual stress for some users with dyslexia)
- **Speed Control**: Adjustable reading speed for different needs
- **Voice Selection**: Multiple voice options where availableg Assistant

> **Hackathon Project 2025** - Making documents accessible for people with dyslexia and learning disabilities through evidence-based design and assistive technology

## 🌟 Overview

ReadAble is an accessibility-first reading assistant designed specifically for people with dyslexia and learning disabilities. Built for Hackathon 2025, this application combines text simplification with evidence-based accessibility features to create the most inclusive reading experience possible.

## ♿ Accessibility-First Design

ReadAble is built with comprehensive accessibility features based on dyslexia research and WCAG guidelines:

### 🎯 **Core Accessibility Features**
- **🔤 OpenDyslexic Font**: Default dyslexia-friendly typography
- **📏 Large Touch Targets**: 44px minimum button sizes for easy interaction
- **✨ Word Highlighting**: Real-time word highlighting synchronized with audio using soft blue borders (yellow backgrounds can be problematic for some people with dyslexia)
- **🎨 Optimized Colors**: Soft backgrounds that reduce eye strain
- **📖 Clear Typography**: Evidence-based font sizes and spacing

### ⚙️ **Customizable Typography Settings**
- **Font Family**: OpenDyslexic (default), Arial, Verdana, Tahoma, Calibri
- **Font Size**: 18px minimum up to 30px for better readability
- **Line Spacing**: 1.5x to 2x spacing options for improved reading flow
- **Letter Spacing**: Adjustable character spacing for visual clarity

### 🎵 **Audio Accessibility**
- **Text-to-Speech**: Built-in browser-native speech synthesis
- **Word Synchronization**: Visual highlighting follows audio playback
- **Speed Control**: Adjustable reading speed for different needs
- **Voice Selection**: Multiple voice options where available

## ✨ Features

### 📚 **Document Processing**
- **📁 File Upload**: Drag-and-drop support for PDF, Word documents, and text files
- **✏️ Text Simplification**: Converts complex text into A2 reading level plain language
- **� Privacy First**: Files never leave your session - completely private

### ♿ **Accessibility Features**
- **🎯 Evidence-Based Design**: Built following dyslexia research and accessibility guidelines
- **🔤 Dyslexia-Friendly Fonts**: OpenDyslexic as default with multiple sans-serif options
- **📏 Large Interactive Elements**: 44px minimum touch targets for easy navigation
- **🎨 Optimized Visual Design**: Soft colors and high contrast for reduced eye strain
- **✨ Dynamic Word Highlighting**: Real-time highlighting synchronized with audio playback

### 🔊 **Audio & Reading Support**
- **🎵 Text-to-Speech**: Built-in audio player with comprehensive controls
- **⚡ Adjustable Speed**: Reading speed control for different comprehension needs
- **🎤 Voice Selection**: Multiple voice options where browser supports
- **🎯 Precise Synchronization**: Word-level highlighting follows audio

### 📱 **User Experience**
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **⚙️ Customizable Settings**: Typography settings panel for personalized reading
- **🎯 Simple Interface**: Clean, distraction-free design focused on readability

## 🚀 Live Demo

*Add your live demo link here once deployed*

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and accessibility patterns
- **Vite** - Fast build tool with optimized accessibility bundling
- **Tailwind CSS** - Utility-first CSS with accessibility-focused components
- **Web Speech API** - Browser-native text-to-speech with word boundary events
- **OpenDyslexic Font** - Specialized dyslexia-friendly typography

### Backend
- *To be implemented* - Text processing API

## 📁 Project Structure

```
ReadAble Hackathon 2025/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx     # Main landing page
│   │   │   ├── ResultsPage.jsx     # Results with accessibility features
│   │   │   ├── FileUpload.jsx      # Accessible file upload component
│   │   │   ├── AudioPlayer.jsx     # Text-to-speech with word sync
│   │   │   └── AccessibilityPanel.jsx # Typography settings panel
│   │   ├── utils/
│   │   │   ├── accessibilityHelper.js  # Accessibility configuration
│   │   │   └── textFormatter.js        # Text processing utilities
│   │   ├── App.jsx                 # Main app with accessibility state
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles with accessibility
│   ├── package.json
│   └── README.md
├── backend/                  # Backend API (to be implemented)
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- Modern web browser with Web Speech API support (Chrome, Firefox, Safari, Edge)
- **OpenDyslexic font** (optional - will fallback to system fonts if not installed)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/readable-hackathon-2025.git
   cd readable-hackathon-2025
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts (Frontend)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📸 Screenshots

### Landing Page
*Features the main upload area and key benefits*

![Landing Page](Mockup%201%20-%20Landing%20page.png)

### Results Page
*Shows original vs simplified text with audio controls*

![Results Page](Mockup%202%20-%20Results.png)

## 🎯 Current Features

✅ **Completed - Accessibility Features**
- OpenDyslexic font integration
- Evidence-based typography settings
- Word-by-word highlighting with audio sync
- Large touch targets (44px minimum)
- Responsive accessibility panel
- Optimized color schemes for readability

✅ **Completed - Core Features**
- Landing page with accessible file upload
- Results page with text comparison
- Audio player with precise word highlighting
- Responsive design across all devices
- File drag-and-drop functionality
- Real-time text-to-speech

🚧 **In Progress**
- Backend API integration
- Real text simplification
- File processing (PDF, DOCX)

🔮 **Planned**
- Advanced text simplification algorithms
- Multiple language support with accessibility features
- Reading level analysis and recommendations
- Enhanced export functionality with accessible formats
- Voice customization for different needs
- Batch processing for multiple documents
- Integration with assistive technologies
- Customizable color themes for different visual needs (including research-backed cream backgrounds for dyslexia)

## 🤝 Contributing

We welcome contributions to make ReadAble even better!

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

## 📝 Development Notes

### Accessibility Implementation
The application follows WCAG 2.1 AA guidelines and incorporates research-based design for dyslexia:

- **Typography**: Evidence-based font choices with OpenDyslexic as default
- **Spacing**: Minimum 1.5x line spacing for improved readability  
- **Color Contrast**: Soft backgrounds (#FAFAFA) instead of harsh white
- **Interactive Elements**: 44px minimum touch targets for motor accessibility
- **Focus Management**: Keyboard navigation and screen reader support
- **Audio Synchronization**: Word-level highlighting using Speech Synthesis boundary events

### Text Processing
Currently uses mock data for demonstration. To integrate real text simplification:

1. Implement backend API in the `/backend` directory
2. Update `App.jsx` to call your API
3. Handle loading states and errors
4. Add file parsing for PDF/DOCX

### Browser Compatibility
- **Web Speech API**: Supported in modern browsers (Chrome, Firefox, Safari, Edge)
- **File API**: Required for file upload functionality
- **ES6+**: Ensure target browsers support modern JavaScript
- **OpenDyslexic Font**: Graceful fallback to system sans-serif fonts
- **CSS Grid/Flexbox**: Modern layout support for responsive accessibility

## 🐛 Known Issues

- Speech synthesis quality may vary between browsers and operating systems
- OpenDyslexic font requires web font loading (graceful fallback provided)
- Large files may impact performance during text processing
- Limited to client-side processing currently (no server-side text analysis)
- Audio highlighting timing may vary with different speech synthesis engines

## 📄 License

This project is part of the ReadAble Hackathon 2025. See individual files for specific licensing terms.

## 🏆 Hackathon Information

- **Event**: ReadAble Hackathon 2025
- **Theme**: Accessible Reading Technology for Learning Disabilities
- **Date**: September 2025
- **Goal**: Making complex documents accessible to people with dyslexia and learning differences
- **Focus**: Evidence-based accessibility features with user-centered design
- **Impact**: Empowering inclusive education and workplace accessibility

## 🙏 Acknowledgments

- **OpenDyslexic** - For the dyslexia-friendly font that improves readability
- **Dyslexia Research Community** - For evidence-based design guidelines
- **WCAG Contributors** - For comprehensive accessibility standards
- **Heroicons** - For the beautiful and accessible icons
- **Tailwind CSS** - For the utility-first CSS framework with accessibility features
- **Vite** - For the lightning-fast build tool
- **React Team** - For the incredible accessible component framework
- **Web Speech API Contributors** - For enabling browser-native text-to-speech

---

**Made with ❤️ for accessibility, inclusion, and learning differences**