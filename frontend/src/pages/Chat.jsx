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
    let sessionId = localStorage.getItem('sentibot_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now();
      localStorage.setItem('sentibot_session_id', sessionId);
    }
    setSessionId(sessionId);
    loadPreviousMessages(sessionId);
  }, []);

  const loadPreviousMessages = async (sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${sessionId}`);
      if (response.data.success && response.data.messages.length > 0) {
        const loadedMessages = response.data.messages.map((msg, index) => ({
          id: Date.now() + index,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: msg.role === 'user' ? msg.content : null,
          bot: msg.role === 'assistant' ? msg.content : null
        })).filter(msg => msg.user || msg.bot);

        setMessages(loadedMessages);
      }
    } catch (error) {
      console.log('No previous messages found for this session');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if ('speechSynthesis' in window && messages.length > 0) {
      window.speechSynthesis.cancel();
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessageId = Date.now();
    const userMessage = {
      id: userMessageId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: message,
      bot: null
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

      setMessages(prev => prev.map(msg => 
        msg.id === userMessageId 
          ? { ...msg, bot: response.data.response }
          : msg
      ));

      if (response.data.crisis_detected) {
        setCrisisAlert({
          message: "I've detected that you might be going through a difficult time. Your safety is important to me.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emergencyContacts: user?.emergencyEmail || user?.emergencyPhone
        });

        setTimeout(() => setCrisisAlert(null), 10000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageId 
          ? { ...msg, bot: 'Sorry, I encountered an error. Please try again.' }
          : msg
      ));
    } finally {
      setLoading(false);
      setTimeout(() => setIsAutoSaving(false), 2000);
    }
  };

  const newChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
    localStorage.removeItem('sentibot_session_id');
    const newSessionId = 'session_' + Date.now();
    setSessionId(newSessionId);
    localStorage.setItem('sentibot_session_id', newSessionId);
  };

  const loadChatFromHistory = (loadedMessages, sessionId, sessionName) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages(loadedMessages);
    setSessionId(sessionId);
    localStorage.setItem('sentibot_session_id', sessionId);
  };

  const clearChat = async () => {
    try {
      await axios.post(`${API_BASE_URL}/clear`, { session_id: sessionId, username: user?.username || 'anonymous' });
      newChat();
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const saveChat = async () => {
    if (!saveChatName.trim() || messages.length === 0) return;

    try {
      const customSessionId = `saved_${Date.now()}_${saveChatName.replace(/\s+/g, '_')}`;

      await axios.post(`${API_BASE_URL}/analyze`, {
        message: `[SAVED CHAT: ${saveChatName}]`,
        session_id: customSessionId,
        username: user?.username || 'anonymous'
      });

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
      <div className="chat-container-modern">
        <div className="chat-header-modern">
          <div className="chat-header-left">
            <div className="chat-bot-avatar">
              <span className="bot-avatar-icon">🤖</span>
              <span className="bot-status-dot"></span>
            </div>
            <div className="chat-header-info">
              <h2 className="chat-title-modern">
                SentiBot
                {isAutoSaving && <span className="auto-save-indicator-modern">💾 Saving...</span>}
              </h2>
              <p className="chat-subtitle">Your AI Emotional Companion • Always here to listen</p>
            </div>
          </div>
          <div className="chat-actions-modern">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="chat-action-btn"
              title="View Chat History"
            >
              <span className="action-btn-icon">📚</span>
              <span className="action-btn-text">History</span>
            </button>
            <button
              onClick={newChat}
              className="chat-action-btn chat-action-primary"
              title="Start New Chat"
            >
              <span className="action-btn-icon">➕</span>
              <span className="action-btn-text">New Chat</span>
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="chat-action-btn"
              title="Save Chat"
              disabled={messages.length === 0}
            >
              <span className="action-btn-icon">💾</span>
              <span className="action-btn-text">Save</span>
            </button>
            <button onClick={clearChat} className="chat-action-btn chat-action-danger" title="Clear Chat">
              <span className="action-btn-icon">🗑️</span>
              <span className="action-btn-text">Clear</span>
            </button>
          </div>
        </div>

        {crisisAlert && (
          <div className="crisis-alert-modern">
            <div className="crisis-alert-content-modern">
              <div className="crisis-icon-modern">🚨</div>
              <div className="crisis-message-modern">
                <h4>Crisis Alert</h4>
                <p>{crisisAlert.message}</p>
                <div className="crisis-actions-modern">
                  <button
                    onClick={() => setCrisisAlert(null)}
                    className="dismiss-crisis-btn-modern"
                  >
                    Dismiss
                  </button>
                  {crisisAlert.emergencyContacts && (
                    <span className="emergency-info-modern">Emergency contacts notified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="messages-modern">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">🤖</div>
              <h3 className="welcome-title">Welcome to SentiBot</h3>
              <p className="welcome-text">I'm here to listen, support, and chat with you. Start a conversation by typing a message below.</p>
              <div className="welcome-suggestions">
                <button className="suggestion-chip" onClick={() => sendMessage("Hello, how are you?")}>👋 Say Hello</button>
                <button className="suggestion-chip" onClick={() => sendMessage("I'm feeling anxious today")}>😰 Feeling Anxious</button>
                <button className="suggestion-chip" onClick={() => sendMessage("I need some motivation")}>💪 Need Motivation</button>
                <button className="suggestion-chip" onClick={() => sendMessage("Let's talk about my day")}>💭 Talk About My Day</button>
              </div>
            </div>
          )}
          
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {loading && (
            <div className="message bot typing">
              <div className="message-avatar">
                <span>🤖</span>
              </div>
              <div className="message-content">
                <div className="message-bubble typing-bubble">
                  <div className="typing-indicator-modern">
                    <div className="typing-dots-modern">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text-modern">SentiBot is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSendMessage={sendMessage} loading={loading} />
      </div>

      {showSaveModal && (
        <div className="modal-overlay-modern" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💾 Save Chat</h3>
              <button className="modal-close" onClick={() => setShowSaveModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={saveChatName}
                onChange={(e) => setSaveChatName(e.target.value)}
                placeholder="Enter a name for this chat..."
                className="modal-input"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowSaveModal(false)} className="modal-btn modal-btn-secondary">
                Cancel
              </button>
              <button onClick={saveChat} className="modal-btn modal-btn-primary" disabled={!saveChatName.trim()}>
                Save Chat
              </button>
            </div>
          </div>
        </div>
      )}

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