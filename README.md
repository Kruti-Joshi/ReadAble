# ReadAble - Accessible Reading Assistant

> **Hackathon Project 2025** - Making documents more accessible through text simplification and audio playback

## 🌟 Overview

ReadAble is an accessible reading assistant that simplifies complex documents and provides text-to-speech functionality. Built for the ReadAble Hackathon 2025, this application helps users understand difficult texts by converting them into plain language and offering audio playback.

## ✨ Features

- **📁 File Upload**: Drag-and-drop support for PDF, Word documents, and text files
- **✏️ Text Simplification**: Converts complex text into A2 reading level plain language
- **🔊 Text-to-Speech**: Built-in audio player with speed and voice controls
- **🔒 Privacy First**: Files never leave your session - completely private
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **♿ Accessibility**: Designed with accessibility best practices

## 🚀 Live Demo

*Add your live demo link here once deployed*

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Web Speech API** - Browser-native text-to-speech

### Backend
- *To be implemented* - Text processing API

## 📁 Project Structure

```
ReadAble Hackathon 2025/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx     # Main landing page
│   │   │   ├── ResultsPage.jsx     # Results display
│   │   │   ├── FileUpload.jsx      # File upload component
│   │   │   └── AudioPlayer.jsx     # Text-to-speech controls
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── package.json
│   └── README.md
├── backend/                  # Backend API (to be implemented)
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- Modern web browser with Web Speech API support

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

✅ **Completed**
- Landing page with file upload
- Results page with text comparison
- Audio player with controls
- Responsive design
- File drag-and-drop
- Basic text-to-speech

🚧 **In Progress**
- Backend API integration
- Real text simplification
- File processing (PDF, DOCX)

🔮 **Planned**
- Multiple language support
- Reading level analysis
- Export functionality
- Voice customization
- Batch processing

## 🤝 Contributing

We welcome contributions to make ReadAble even better!

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

## 📝 Development Notes

### Text Processing
Currently uses mock data for demonstration. To integrate real text simplification:

1. Implement backend API in the `/backend` directory
2. Update `App.jsx` to call your API
3. Handle loading states and errors
4. Add file parsing for PDF/DOCX

### Browser Compatibility
- **Web Speech API**: Supported in modern browsers
- **File API**: Required for file upload functionality
- **ES6+**: Ensure target browsers support modern JavaScript

## 🐛 Known Issues

- Speech synthesis may vary between browsers
- Large files may cause performance issues
- Limited to client-side processing currently

## 📄 License

This project is part of the ReadAble Hackathon 2025. See individual files for specific licensing terms.

## 🏆 Hackathon Information

- **Event**: ReadAble Hackathon 2025
- **Theme**: Accessible Reading Technology
- **Date**: September 2025
- **Goal**: Making complex documents accessible to everyone

## 🙏 Acknowledgments

- **Heroicons** - For the beautiful icons
- **Tailwind CSS** - For the styling framework
- **Vite** - For the amazing build tool
- **React Team** - For the incredible framework

---

**Made with ❤️ for accessibility and inclusion**