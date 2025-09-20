import { useState, useRef, useEffect } from 'react'

const AudioPlayer = ({ text, speechText, isSimplified }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [voice, setVoice] = useState('Neutral')
  const speechRef = useRef(null)
  const intervalRef = useRef(null)

  // Use speechText if available, otherwise fall back to regular text
  const textToSpeak = speechText || text
  const estimatedDuration = textToSpeak ? Math.max(textToSpeak.length / 10, 3) : 30 // Rough estimate

  useEffect(() => {
    setDuration(estimatedDuration)
  }, [textToSpeak, estimatedDuration])

  const handlePlay = () => {
    if ('speechSynthesis' in window) {
      if (isPaused) {
        // Resume
        window.speechSynthesis.resume()
        setIsPaused(false)
        setIsPlaying(true)
        startTimer()
      } else {
        // Start new speech
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.rate = playbackRate
        utterance.onend = () => {
          setIsPlaying(false)
          setIsPaused(false)
          setCurrentTime(0)
          clearInterval(intervalRef.current)
        }
        
        speechRef.current = utterance
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)
        setCurrentTime(0)
        startTimer()
      }
    }
  }

  const handlePause = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      setIsPlaying(false)
      clearInterval(intervalRef.current)
    }
  }

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentTime(0)
      clearInterval(intervalRef.current)
    }
  }

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          clearInterval(intervalRef.current)
          return duration
        }
        return prev + 0.1
      })
    }, 100)
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    setCurrentTime(newTime)
    
    // For a real implementation, you'd need to restart speech from the calculated position
    if (isPlaying) {
      handleStop()
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-colors"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z"/>
          </svg>
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <div 
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-2 bg-purple-600 rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Time Display */}
        <div className="text-sm text-gray-500 min-w-[80px] text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Speed</label>
          <select 
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2.0}>2.0x</option>
          </select>
        </div>

        {/* Voice Control */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Voice</label>
          <select 
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="Neutral">Neutral</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer