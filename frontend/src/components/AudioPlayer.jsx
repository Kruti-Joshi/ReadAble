import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'

const AudioPlayer = forwardRef(({ text, speechText, isSimplified, onWordChange, onWordHighlight, accessibilitySettings = {} }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(accessibilitySettings.slowSpeech ? 0.8 : 1.0)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [availableVoices, setAvailableVoices] = useState([])
  const [voiceType, setVoiceType] = useState('female') // 'male', 'female'
  const [startFromWordIndex, setStartFromWordIndex] = useState(0) // New: track starting word
  const [pausedWordIndex, setPausedWordIndex] = useState(-1) // New: track paused word
  const [currentWordIndex, setCurrentWordIndex] = useState(-1) // Track current word being spoken
  const speechRef = useRef(null)
  const intervalRef = useRef(null)
  const currentTimeRef = useRef(0)

  // Use speechText if available, otherwise fall back to regular text
  const textToSpeak = speechText || text
  const estimatedDuration = textToSpeak ? Math.max(textToSpeak.length / 10, 3) : 30 // Rough estimate
  const words = textToSpeak ? textToSpeak.split(/\s+/).filter(word => word.length > 0) : []

  // Accessibility-aware button styling
  const getButtonSize = () => {
    if (accessibilitySettings.largeClickTargets) return { width: 'w-14 h-14', icon: 'w-7 h-7' }
    return { width: 'w-12 h-12', icon: 'w-6 h-6' }
  }

  const getControlButtonSize = () => {
    if (accessibilitySettings.largeClickTargets) return { width: 'w-12 h-12', icon: 'w-6 h-6' }
    return { width: 'w-10 h-10', icon: 'w-5 h-5' }
  }

  useEffect(() => {
    setDuration(estimatedDuration)
  }, [textToSpeak, estimatedDuration])

  // Load available voices and set up voice mapping
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
      
      // Set default voice based on current voice type
      updateVoiceSelection(voiceType, voices)
    }

    // Load voices immediately if available
    loadVoices()
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Update voice selection when voice type changes
  useEffect(() => {
    if (availableVoices.length > 0) {
      updateVoiceSelection(voiceType, availableVoices)
    }
  }, [voiceType, availableVoices])

  const updateVoiceSelection = (type, voices) => {
    let targetVoice = null
    
    switch (type) {
      case 'male':
        // Look for Microsoft Mark
        targetVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('mark') && 
          voice.name.toLowerCase().includes('microsoft')
        )
        break
      case 'female':
        // Look for Microsoft Libby
        targetVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('libby') && 
          voice.name.toLowerCase().includes('microsoft')
        )
        break
    }
    
    // Fallback to default if specific voice not found
    if (!targetVoice && voices.length > 0) {
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'))
      targetVoice = englishVoices.length > 0 ? englishVoices[0] : voices[0]
    }
    
    setSelectedVoice(targetVoice)
    
    // Log which voice is being used
    if (targetVoice) {
      console.log(`Voice selected: ${targetVoice.name} (${targetVoice.lang}) - Local: ${targetVoice.localService}`)
    } else {
      console.log('No voice selected - speech synthesis may not work')
    }
  }

  // Update playback rate when accessibility settings change
  useEffect(() => {
    setPlaybackRate(accessibilitySettings.slowSpeech ? 0.8 : 1.0)
  }, [accessibilitySettings.slowSpeech])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Function to start precise word tracking using speech boundary events
  const startWordTracking = (utterance, startWordOffset = 0) => {
    if ((!onWordChange && !onWordHighlight) || words.length === 0) return
    
    // Use the boundary event for precise word tracking
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // The charIndex tells us where the CURRENT word starts in the spoken text
        const spokenText = utterance.text
        const textUpToCurrentWord = spokenText.substring(0, event.charIndex)
        const wordsBeforeCurrent = textUpToCurrentWord.trim().split(/\s+/).filter(word => word.length > 0)
        // The current word index relative to the spoken text
        const relativeWordIndex = wordsBeforeCurrent.length
        
        // Add the starting offset to get the absolute word index in the original text
        const absoluteWordIndex = startWordOffset + relativeWordIndex
        
        console.log(`Word tracking: event.charIndex=${event.charIndex}, relative=${relativeWordIndex}, absolute=${absoluteWordIndex}, word="${words[absoluteWordIndex] || 'undefined'}"`)
        
        if (absoluteWordIndex < words.length) {
          // Update internal tracking
          setCurrentWordIndex(absoluteWordIndex)
          
          // Use both callbacks for backward compatibility
          if (onWordChange) onWordChange(absoluteWordIndex)
          if (onWordHighlight) onWordHighlight(absoluteWordIndex)
        }
      }
    }
  }

  // Remove the old global function approach
  useEffect(() => {
    // Cleanup any existing global function
    if (window.audioPlayerPlayFromWord) {
      delete window.audioPlayerPlayFromWord
    }
  }, [])

  // Function to start playing from a specific word
  const playFromWord = (wordIndex) => {
    if (!textToSpeak || words.length === 0 || wordIndex >= words.length || wordIndex < 0) return
    
    console.log(`playFromWord: Starting speech from word ${wordIndex}: "${words[wordIndex]}"`)
    console.log(`playFromWord: Current state - isPlaying: ${isPlaying}, isPaused: ${isPaused}`)
    
    // Clear any existing utterance error handlers to prevent state conflicts
    if (speechRef.current) {
      console.log('playFromWord: Clearing existing utterance handlers')
      speechRef.current.onend = null
      speechRef.current.onerror = null
      speechRef.current.onboundary = null
    }
    
    // Stop current speech first
    if ('speechSynthesis' in window) {
      console.log('playFromWord: Cancelling existing speech')
      window.speechSynthesis.cancel()
    }
    clearInterval(intervalRef.current)
    stopWordTracking()
    
    // Immediately set state to playing to prevent UI flicker
    console.log('playFromWord: Setting state to playing immediately')
    setIsPlaying(true)
    setIsPaused(false)
    
    // Small delay to ensure speech is fully cancelled before starting new speech
    setTimeout(() => {
      console.log('playFromWord: Starting new speech after delay')
      // Create text starting from the specified word
      const wordsFromIndex = words.slice(wordIndex)
      const textFromWord = wordsFromIndex.join(' ')
      
      // Reset state and set new starting position
      setStartFromWordIndex(wordIndex)
      setPausedWordIndex(-1) // Clear paused state
      setCurrentTime(0)
      currentTimeRef.current = 0
      
      // Immediately highlight the starting word
      if (onWordChange) onWordChange(wordIndex)
      if (onWordHighlight) onWordHighlight(wordIndex)
      
      // Start speech with the truncated text
      if ('speechSynthesis' in window && textFromWord.trim().length > 0) {
        const utterance = new SpeechSynthesisUtterance(textFromWord)
        utterance.rate = playbackRate
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        // Apply selected voice
        if (selectedVoice) {
          utterance.voice = selectedVoice
          console.log(`playFromWord: Using voice: ${selectedVoice.name} (${selectedVoice.lang})`)
        } else {
          console.log('playFromWord: No voice selected, using default')
        }
        
        // Set up word tracking with offset for the original text positions
        startWordTracking(utterance, wordIndex)
        
        utterance.onend = () => {
          console.log('Speech ended')
          setIsPlaying(false)
          setIsPaused(false)
          setCurrentTime(0)
          currentTimeRef.current = 0
          clearInterval(intervalRef.current)
          stopWordTracking()
          setStartFromWordIndex(0)
          setPausedWordIndex(-1)
          setCurrentWordIndex(-1) // Reset current word tracking
        }

        utterance.onerror = (event) => {
          // Ignore "interrupted" errors as they're expected when we stop speech intentionally
          if (event.error === 'interrupted') {
            console.log('Speech was intentionally interrupted (stopped by user)')
            return
          }
          
          console.error('playFromWord utterance: Speech synthesis error:', event.error)
          console.log('playFromWord utterance: speechRef.current === utterance:', speechRef.current === utterance)
          // Only reset state if this is the current utterance
          if (speechRef.current === utterance) {
            console.log('playFromWord utterance: Resetting state due to error on current utterance')
            setIsPlaying(false)
            setIsPaused(false)
            clearInterval(intervalRef.current)
            stopWordTracking()
            setStartFromWordIndex(0)
            setPausedWordIndex(-1)
            setCurrentWordIndex(-1) // Reset current word tracking
          } else {
            console.log('playFromWord utterance: Ignoring error on old utterance')
          }
        }
        
        speechRef.current = utterance
        
        // Ensure state is set to playing right before speaking
        console.log('playFromWord: Final state set to playing before speak')
        setIsPlaying(true)
        setIsPaused(false)
        
        console.log('playFromWord: Speaking new utterance')
        window.speechSynthesis.speak(utterance)
        startTimer()
      }
    }, 100) // Increased delay to 100ms for more reliable cancellation
  }

  const stopWordTracking = () => {
    // Don't reset highlighting when paused - keep the last highlighted word visible
    if (!isPaused) {
      if (onWordChange) onWordChange(-1)
      if (onWordHighlight) onWordHighlight(-1)
      setPausedWordIndex(-1)
    }
  }

  const handlePlay = () => {
    if ('speechSynthesis' in window) {
      if (isPaused) {
        // Resume
        window.speechSynthesis.resume()
        setIsPaused(false)
        setIsPlaying(true)
        startTimer()
        // Note: Can't restart word tracking on resume since we lost the utterance
      } else {
        // Start new speech
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.rate = playbackRate
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        // Apply selected voice
        if (selectedVoice) {
          utterance.voice = selectedVoice
          console.log(`handlePlay: Using voice: ${selectedVoice.name} (${selectedVoice.lang})`)
        } else {
          console.log('handlePlay: No voice selected, using default')
        }
        
        // Set up word tracking before other events
        startWordTracking(utterance, 0) // Start from word 0 when playing normally
        
        utterance.onend = () => {
          setIsPlaying(false)
          setIsPaused(false)
          setCurrentTime(0)
          currentTimeRef.current = 0 // Reset ref
          clearInterval(intervalRef.current)
          stopWordTracking()
          setCurrentWordIndex(-1) // Reset current word tracking
        }

        utterance.onerror = (event) => {
          // Ignore "interrupted" errors as they're expected when we stop speech intentionally
          if (event.error === 'interrupted') {
            console.log('Speech was intentionally interrupted (stopped by user)')
            return
          }
          
          console.error('Speech synthesis error:', event.error)
          setIsPlaying(false)
          setIsPaused(false)
          clearInterval(intervalRef.current)
          stopWordTracking()
          setCurrentWordIndex(-1) // Reset current word tracking
        }
        
        speechRef.current = utterance
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)
        setCurrentTime(0)
        currentTimeRef.current = 0 // Reset ref
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
      
      // Store the current word index when pausing so we keep it highlighted
      // Note: We don't call stopWordTracking here to maintain highlighting
    }
  }

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentTime(0)
      currentTimeRef.current = 0 // Reset ref
      clearInterval(intervalRef.current)
      stopWordTracking()
      setCurrentWordIndex(-1) // Reset current word tracking
    }
  }

  const handleSpeedChange = (newRate) => {
    setPlaybackRate(newRate)
    
    // If currently playing, restart with new speed from current word position
    if (isPlaying && !isPaused) {
      console.log(`Speed changed to ${newRate}x while playing, restarting from word ${currentWordIndex}`)
      
      // Use playFromWord to restart from current position with new speed
      const restartWordIndex = Math.max(0, currentWordIndex)
      
      // Small delay to ensure speed is updated before restarting
      setTimeout(() => {
        playFromWord(restartWordIndex)
      }, 50)
    }
  }

  const handleVoiceTypeChange = (newType) => {
    console.log(`Voice type changing from ${voiceType} to ${newType}`)
    setVoiceType(newType)
    
    // Force update voice selection with current available voices
    if (availableVoices.length > 0) {
      updateVoiceSelection(newType, availableVoices)
    }
    
    // If currently playing, restart with new voice from current word position
    if (isPlaying && !isPaused) {
      console.log(`Voice changed to ${newType} while playing, restarting from word ${currentWordIndex}`)
      
      // Use playFromWord to restart from current position with new voice
      const restartWordIndex = Math.max(0, currentWordIndex)
      
      // Small delay to ensure voice is updated before restarting
      setTimeout(() => {
        playFromWord(restartWordIndex)
      }, 100) // Increased delay for voice change
    }
  }

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev >= duration ? duration : prev + 0.1
        currentTimeRef.current = newTime // Keep ref in sync
        
        if (newTime >= duration) {
          clearInterval(intervalRef.current)
        }
        return newTime
      })
    }, 100)
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    setCurrentTime(newTime)
    currentTimeRef.current = newTime // Keep ref in sync
    
    // For seeking during speech, we need to restart from the new position
    // Since Web Speech API doesn't support seeking, we stop and let user restart
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
  const buttonSize = getButtonSize()
  const controlButtonSize = getControlButtonSize()

  // Expose functions to parent component using ref
  useImperativeHandle(ref, () => ({
    playFromWord: (wordIndex) => {
      console.log('AudioPlayer.playFromWord called with index:', wordIndex)
      playFromWord(wordIndex)
    },
    stop: () => {
      handleStop()
    },
    pause: () => {
      handlePause()
    },
    play: () => {
      handlePlay()
    }
  }), [playFromWord, handleStop, handlePause, handlePlay])

  return (
    <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className={`${buttonSize.width} bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg focus:ring-4 focus:ring-purple-300`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className={buttonSize.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className={`${buttonSize.icon} ml-1`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          className={`${controlButtonSize.width} bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 transition-colors focus:ring-4 focus:ring-gray-200`}
          title="Stop"
        >
          <svg className={controlButtonSize.icon} fill="currentColor" viewBox="0 0 24 24">
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
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300"
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
            value={voiceType}
            onChange={(e) => handleVoiceTypeChange(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
  )
})

export default AudioPlayer