import React, { useState, useRef, useEffect } from 'react';

const ChatMessage = ({ message }) => {
  const [showActions, setShowActions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    // Stop any current speech
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }

    // Create new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Set voice (prefer female voices for bot)
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('susan')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else if (voices.length > 0) {
        // Fallback to first available voice
        utterance.voice = voices[0];
      }
    };

    // Voices might not be loaded yet, so try immediately and also listen for voiceschanged
    setVoice();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      speechRef.current = null;
    };
    utterance.onerror = (event) => {
      // Only log real errors, not 'interrupted' which is normal when speech is cancelled
      if (event.error !== 'interrupted') {
        console.error('Speech synthesis error:', event);
      }
      setIsSpeaking(false);
      speechRef.current = null;
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      speechRef.current = null;
    }
  };

  // Auto-speak only the latest bot message (disabled by default to prevent continuous speech)
  // Users can manually click the speaker button to hear messages
  // useEffect(() => {
  //   if (message.bot && 'speechSynthesis' in window) {
  //     // Small delay to ensure the message is rendered and user can see it
  //     const timer = setTimeout(() => {
  //       speakText(message.bot);
  //     }, 1000); // 1 second delay

  //     return () => clearTimeout(timer);
  //   }
  // }, [message.bot]);

  // Cleanup speech when component unmounts
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <React.Fragment>
      {message.user && (
        <div
          className="message user"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className="message-content">
            <div className="message-text">{message.user}</div>
            <div className="message-footer">
              <span className="message-time">{message.timestamp}</span>
              {showActions && (
                <button
                  className="message-action"
                  onClick={() => copyToClipboard(message.user)}
                  title="Copy message"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {message.bot && (
        <div
          className="message bot"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className="message-content">
            <div className="message-text">{message.bot}</div>
            <div className="message-footer">
              <span className="message-time">{message.timestamp}</span>
              {showActions && (
                <div className="message-actions">
                  <button
                    className="message-action"
                    onClick={() => copyToClipboard(message.bot)}
                    title="Copy message"
                  >
                    📋
                  </button>
                  <button
                    className="message-action voice-btn"
                    onClick={isSpeaking ? stopSpeaking : () => speakText(message.bot)}
                    title={isSpeaking ? "Stop speaking" : "Re-speak message"}
                  >
                    {isSpeaking ? '🔇' : '🔊'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default ChatMessage;