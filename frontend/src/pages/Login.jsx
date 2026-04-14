import React, { useState } from 'react';
import axios from 'axios';

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

    // Validate Gmail email for signup
    if (!isLogin && !validateEmail(formData.email)) {
      setError('Please use a valid Gmail address (e.g., yourname@gmail.com)');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);

      if (response.data.success) {
        if (isLogin) {
          // Login successful
          onLogin({
            username: response.data.username,
            streak: response.data.streak,
            theme: response.data.theme,
            emergencyEmail: response.data.emergency_email,
            emergencyPhone: response.data.emergency_phone
          });
        } else {
          // Signup successful
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
      <div className="login-container">
        <div className="login-header">
          <h1>🤖 Welcome to SentiBot</h1>
          <p>Your AI companion for emotional well-being</p>
        </div>

        <div className="login-form-container">
          <div className="login-tabs">
            <button
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className="link-btn" onClick={toggleMode}>
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">💬</span>
            <span>AI Chat Support</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎵</span>
            <span>Mood-Based Music</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📝</span>
            <span>Journal Tracking</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span>Goal Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;