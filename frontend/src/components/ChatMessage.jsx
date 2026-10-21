import React, { useState, useRef, useEffect } from 'react';

const ChatMessage = ({ message }) => {
  const [showActions, setShowActions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

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
        utterance.voice = voices[0];
      }
    };

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
            <div className="message-bubble user-bubble">
              <div className="message-text">{message.user}</div>
            </div>
            <div className="message-footer user-footer">
              <span className="message-time">{message.timestamp}</span>
              {showActions && (
                <button
                  className="message-action-btn"
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
          <div className="message-avatar">
            <span>🤖</span>
          </div>
          <div className="message-content">
            <div className="message-bubble bot-bubble">
              <div className="message-text">{message.bot}</div>
            </div>
            <div className="message-footer bot-footer">
              <span className="message-time">{message.timestamp}</span>
              {showActions && (
                <div className="message-actions-group">
                  <button
                    className="message-action-btn"
                    onClick={() => copyToClipboard(message.bot)}
                    title="Copy message"
                  >
                    📋
                  </button>
                  <button
                    className={`message-action-btn voice-action ${isSpeaking ? 'speaking' : ''}`}
                    onClick={isSpeaking ? stopSpeaking : () => speakText(message.bot)}
                    title={isSpeaking ? "Stop speaking" : "Listen to message"}
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