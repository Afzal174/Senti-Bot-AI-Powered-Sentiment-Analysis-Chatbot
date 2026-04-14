import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Music from './pages/Music';
import Journal from './pages/Journal';
import Goals from './pages/Goals';
import Wellness from './pages/Wellness';
import Profile from './pages/Profile';
import './App.css';

// Global speech management
const stopAllSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('sentibot_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('sentibot_user');
      }
    }
    setLoading(false);

    // Stop speech when user leaves the application
    const handleBeforeUnload = () => {
      stopAllSpeech();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllSpeech();
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('sentibot_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sentibot_user');
  };

  if (loading) {
    return (
      <div className="app">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#007bff',
          fontSize: '1.2rem'
        }}>
          Loading SentiBot...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} onLogout={handleLogout} />

      <div className="main-content">
        <header className="header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1>SentiBot</h1>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/chat" element={<Chat user={user} />} />
            <Route path="/music" element={<Music />} />
            <Route path="/journal" element={<Journal user={user} />} />
            <Route path="/goals" element={<Goals user={user} />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/profile" element={<Profile user={user} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;