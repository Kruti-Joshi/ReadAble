# ReadAble - Accessible Reading Assistant

A React application that simplifies documents and provides text-to-speech functionality to make content more accessible.

## Features

- **File Upload**: Drag and drop support for PDF, Word documents, and text files
- **Text Simplification**: Converts complex text into plain language (A2 reading level)
- **Text-to-Speech**: Built-in audio player with speed and voice controls
- **No Storage**: Files never leave your session - completely private
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Heroicons (via SVG)
- **Text-to-Speech**: Web Speech API

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx     # Main landing page
│   │   ├── ResultsPage.jsx     # Results display page
│   │   ├── FileUpload.jsx      # Drag-and-drop file upload
│   │   └── AudioPlayer.jsx     # Text-to-speech controls
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles with Tailwind
├── index.html                 # HTML template
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
└── vite.config.js            # Vite configuration
```

## Component Overview

### LandingPage
- Hero section with title and description
- File upload area with drag-and-drop support
- Feature showcase (No Storage, Clear & Simple, Read Aloud)

### ResultsPage
- Side-by-side comparison of original and simplified text
- Tab navigation between original and simplified views
- Integrated audio player
- Export options (copy, download)

### FileUpload
- Drag-and-drop interface
- File type validation
- Visual feedback for drag states

### AudioPlayer
- Play/pause/stop controls
- Progress bar with seeking
- Speed control (0.5x to 2.0x)
- Voice selection
- Uses Web Speech API for text-to-speech
- Word highlighting uses soft blue borders (yellow backgrounds can be problematic for users with dyslexia)

## Customization

### Colors
The app uses a purple and blue color scheme defined in `tailwind.config.js`. You can customize the colors by modifying the theme extension.

### Text Processing
Currently uses mock data for text simplification. To integrate with a real API:

1. Update the `handleFileUpload` function in `App.jsx`
2. Add API calls to your text processing service
3. Handle loading states and error scenarios

### Speech Synthesis
The app uses the browser's built-in Web Speech API. For production use, consider:
- Adding fallbacks for unsupported browsers
- Integrating with cloud-based TTS services for better voice quality
- Adding more voice options and languages

## Browser Support

- Modern browsers with ES6+ support
- Web Speech API support required for text-to-speech functionality
- File API support required for file upload

## Next Steps

1. Install dependencies with `npm install`
2. Start the development server with `npm run dev`
3. Test the file upload and text-to-speech functionality
4. Integrate with your backend API for real text processing
5. Deploy to your preferred hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the ReadAble Hackathon 2025.