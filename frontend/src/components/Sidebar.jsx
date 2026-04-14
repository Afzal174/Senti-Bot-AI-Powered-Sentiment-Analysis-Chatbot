import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen, user, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/music', icon: '🎵', label: 'Music' },
    { path: '/journal', icon: '📝', label: 'Journal' },
    { path: '/goals', icon: '🎯', label: 'Goals' },
    { path: '/wellness', icon: '🧘', label: 'Wellness' },
    { path: '/profile', icon: '👤', label: 'Profile' }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>SentiBot</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <p className="user-name">{user?.username || 'User'}</p>
              <p className="user-status">Online</p>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;