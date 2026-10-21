import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && !validateEmail(formData.email)) {
      setError('Please use a valid Gmail address (e.g., yourname@gmail.com)');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const response = await axios.post(endpoint, formData);

      if (response.data.success) {
        if (isLogin) {
          onLogin({
            username: response.data.username,
            streak: response.data.streak,
            theme: response.data.theme,
            emergencyEmail: response.data.emergency_email,
            emergencyPhone: response.data.emergency_phone
          });
        } else {
          setError('Account created successfully! Please login.');
          setIsLogin(true);
          setFormData({ username: formData.username, password: '', email: '', phone: '' });
        }
      } else {
        setError(response.data.error || 'An error occurred');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', password: '', email: '', phone: '' });
  };

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="login-orb login-orb-1"></div>
        <div className="login-orb login-orb-2"></div>
        <div className="login-orb login-orb-3"></div>
      </div>
      
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">🤖</div>
          <h1>SentiBot</h1>
          <p>Your AI Companion for Emotional Well-Being</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            🔐 Sign In
          </button>
          <button
            className={`login-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            ✨ Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-label">Username</label>
            <input
              type="text"
              name="username"
              className="login-input"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <input
              type="password"
              name="password"
              className="login-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <>
              <div className="login-form-group">
                <label className="login-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="login-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="yourname@gmail.com"
                />
              </div>

              <div className="login-form-group">
                <label className="login-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="login-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </>
          )}

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? '⏳ Please wait...' : (isLogin ? '🚀 Sign In' : '🎉 Create Account')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="login-toggle" onClick={toggleMode}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-icon">💬</span>
            <span>AI Chat Support</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">🎵</span>
            <span>Mood-Based Music</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">📝</span>
            <span>Smart Journal</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">🎯</span>
            <span>Goal Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;