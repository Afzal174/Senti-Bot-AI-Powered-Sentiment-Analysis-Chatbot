import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ChatHistory from '../components/ChatHistory';
import './Chat.css';

const API_BASE_URL = '/api';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveChatName, setSaveChatName] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Get or create persistent session ID
    let sessionId = localStorage.getItem('sentibot_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now();
      localStorage.setItem('sentibot_session_id', sessionId);
    }
    setSessionId(sessionId);
    // Load previous messages for this session if any
    loadPreviousMessages(sessionId);
  }, []);

  const loadPreviousMessages = async (sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${sessionId}`);
      if (response.data.success && response.data.messages.length > 0) {
        // Convert database messages to UI format
        const loadedMessages = response.data.messages.map((msg, index) => ({
          id: Date.now() + index, // Ensure unique IDs
          timestamp: new Date().toLocaleTimeString(), // Could parse from DB if needed
          user: msg.role === 'user' ? msg.content : null,
          bot: msg.role === 'assistant' ? msg.content : null
        })).filter(msg => msg.user || msg.bot);

        setMessages(loadedMessages);
      }
    } catch (error) {
      // Ignore errors when loading previous messages (session might not exist)
      console.log('No previous messages found for this session');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Stop any ongoing speech when new messages arrive
  useEffect(() => {
    if ('speechSynthesis' in window && messages.length > 0) {
      window.speechSynthesis.cancel();
    }
  }, [messages]);

  // Cleanup speech synthesis when leaving chat page
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Immediately add user message to chat
    const userMessageId = Date.now();
    const userMessage = {
      id: userMessageId,
      timestamp: new Date().toLocaleTimeString(),
      user: message,
      bot: null // Bot response will be added later
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setIsAutoSaving(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        message,
        session_id: sessionId,
        username: user?.username || 'anonymous'
      });

      // Update the message with bot response
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageId 
          ? { ...msg, bot: response.data.response }
          : msg
      ));

      // Check for crisis detection
      if (response.data.crisis_detected) {
        setCrisisAlert({
          message: "I've detected that you might be going through a difficult time. Your safety is important to me.",
          timestamp: new Date().toLocaleTimeString(),
          emergencyContacts: user?.emergency_email || user?.emergency_phone
        });

        // Auto-hide crisis alert after 10 seconds
        setTimeout(() => setCrisisAlert(null), 10000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Update the message with error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageId 
          ? { ...msg, bot: 'Sorry, I encountered an error. Please try again.' }
          : msg
      ));
    } finally {
      setLoading(false);
      // Show auto-saved briefly then hide
      setTimeout(() => setIsAutoSaving(false), 2000);
    }
  };

  const newChat = () => {
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Clear messages
    setMessages([]);
    // Clear session ID to start fresh
    localStorage.removeItem('sentibot_session_id');
    // Generate new session ID
    const newSessionId = 'session_' + Date.now();
    setSessionId(newSessionId);
    localStorage.setItem('sentibot_session_id', newSessionId);
  };

  const loadChatFromHistory = (loadedMessages, sessionId, sessionName) => {
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Load the messages
    setMessages(loadedMessages);
    // Update session ID
    setSessionId(sessionId);
    localStorage.setItem('sentibot_session_id', sessionId);
  };

  const clearChat = async () => {
    try {
      await axios.post(`${API_BASE_URL}/clear`, { session_id: sessionId, username: user?.username || 'anonymous' });
      newChat(); // Reuse the newChat logic
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  // Auto-save is handled by the backend - chats are saved automatically
  // This function is for manual saving with custom names
  const saveChat = async () => {
    if (!saveChatName.trim() || messages.length === 0) return;

    try {
      // Create a new session with custom name by saving the first message
      const customSessionId = `saved_${Date.now()}_${saveChatName.replace(/\s+/g, '_')}`;

      // Save the chat name as the first message for identification
      await axios.post(`${API_BASE_URL}/analyze`, {
        message: `[SAVED CHAT: ${saveChatName}]`,
        session_id: customSessionId,
        username: user?.username || 'anonymous'
      });

      // Save all actual conversation messages
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.user) {
          await axios.post(`${API_BASE_URL}/analyze`, {
            message: msg.user,
            session_id: customSessionId,
            username: user?.username || 'anonymous'
          });
        }
      }

      setShowSaveModal(false);
      setSaveChatName('');
      alert(`Chat "${saveChatName}" saved successfully!`);
    } catch (error) {
      console.error('Error saving chat:', error);
      alert('Failed to save chat. Please try again.');
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h2 className="chat-title">
            🤖 SentiBot Chat
            {isAutoSaving && <span className="auto-save-indicator">💾 Auto-saving...</span>}
          </h2>
          <div className="chat-actions">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="history-chat-btn"
              title="View Chat History"
            >
              📚 History
            </button>
            <button
              onClick={newChat}
              className="new-chat-btn"
              title="Start New Chat"
            >
              ➕ New Chat
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="save-chat-btn"
              title="Save Chat with Custom Name"
              disabled={messages.length === 0}
            >
              💾 Save Chat
            </button>
            <button onClick={clearChat} className="clear-chat-btn" title="Clear Chat">
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        {/* Crisis Alert */}
        {crisisAlert && (
          <div className="crisis-alert">
            <div className="crisis-alert-content">
              <div className="crisis-icon">🚨</div>
              <div className="crisis-message">
                <h4>Crisis Alert</h4>
                <p>{crisisAlert.message}</p>
                <div className="crisis-actions">
                  <button
                    onClick={() => setCrisisAlert(null)}
                    className="dismiss-crisis-btn"
                  >
                    Dismiss
                  </button>
                  <div className="emergency-info">
                    {crisisAlert.emergencyContacts && (
                      <span>Emergency contacts have been notified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="messages">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {loading && (
            <div className="message bot typing">
              <div className="message-content">
                <div className="message-text typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">SentiBot is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>


        <ChatInput onSendMessage={sendMessage} loading={loading} />
      </div>

      {/* Save Chat Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Save Chat</h3>
            <input
              type="text"
              value={saveChatName}
              onChange={(e) => setSaveChatName(e.target.value)}
              placeholder="Enter chat name..."
              className="save-chat-input"
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={() => setShowSaveModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={saveChat} className="save-btn" disabled={!saveChatName.trim()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat History Modal */}
      <ChatHistory
        user={user}
        onLoadChat={loadChatFromHistory}
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};

export default Chat;