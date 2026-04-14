import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatHistory = ({ user, onLoadChat, isOpen, onClose }) => {
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (isOpen && user) {
      loadChatSessions();
    }
  }, [isOpen, user]);

  const loadChatSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/chat_sessions`, {
        params: { username: user?.username || 'anonymous' }
      });

      if (response.data.success) {
        setChatSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadChat = async (sessionId, sessionName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${sessionId}`);
      if (response.data.success && response.data.messages.length > 0) {
        // Convert database messages to UI format
        const loadedMessages = response.data.messages.map((msg, index) => ({
          id: Date.now() + index,
          timestamp: new Date().toLocaleTimeString(),
          user: msg.role === 'user' ? msg.content : null,
          bot: msg.role === 'assistant' ? msg.content : null
        })).filter(msg => msg.user || msg.bot);

        onLoadChat(loadedMessages, sessionId, sessionName);
        onClose();
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      alert('Failed to load chat. Please try again.');
    }
  };

  const handleDeleteChat = async (sessionId, event) => {
    event.stopPropagation(); // Prevent loading the chat

    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/chat_sessions/${sessionId}`);
      if (response.data.success) {
        // Refresh the chat sessions list
        loadChatSessions();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const formatDate = (sessionId) => {
    // Extract timestamp from session ID if it contains one
    const match = sessionId.match(/session_(\d+)/);
    if (match) {
      const timestamp = parseInt(match[1]);
      return new Date(timestamp).toLocaleDateString();
    }
    return 'Recent';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chat-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-history-header">
          <h3>💬 Chat History</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="chat-history-content">
          {loading ? (
            <div className="loading">Loading chat history...</div>
          ) : chatSessions.length === 0 ? (
            <div className="no-chats">No saved chats found</div>
          ) : (
            <div className="chat-sessions-list">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className="chat-session-item"
                  onClick={() => handleLoadChat(session.id, session.name)}
                >
                  <div className="session-info">
                    <div className="session-name">{session.name}</div>
                    <div className="session-date">{formatDate(session.id)}</div>
                  </div>
                  <div className="session-actions">
                    <button
                      className="delete-session-btn"
                      onClick={(e) => handleDeleteChat(session.id, e)}
                      title="Delete this chat"
                    >
                      🗑️
                    </button>
                    <div className="load-icon">📂</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;