import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyEmail: '',
    emergencyPhone: '',
    theme: 'Blue (Default)'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (user?.username) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const response = await axios.get('/api/profile', {
        params: { username: user.username }
      });

      if (response.data.success) {
        setProfile({
          name: user.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          emergencyEmail: response.data.emergency_email || '',
          emergencyPhone: response.data.emergency_phone || '',
          theme: response.data.theme || 'Blue (Default)'
        });
      } else {
        setProfile({
          name: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          emergencyEmail: user.emergencyEmail || '',
          emergencyPhone: user.emergencyPhone || '',
          theme: user.theme || 'Blue (Default)'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile({
        name: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyEmail: user.emergencyEmail || '',
        emergencyPhone: user.emergencyPhone || '',
        theme: user.theme || 'Blue (Default)'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.username) return;

    setSaving(true);
    try {
      const response = await axios.put('/api/profile', {
        username: user.username,
        email: profile.email,
        phone: profile.phone,
        emergency_email: profile.emergencyEmail,
        emergency_phone: profile.emergencyPhone,
        theme: profile.theme
      });

      if (response.data.success) {
        alert('Profile updated successfully! ✨');
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const exportData = () => {
    alert('Data export initiated. You will receive an email with your data shortly. 📧');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="journal-loading">
          <div className="loading-spinner-journal"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">👤</div>
          <div className="profile-hero-info">
            <h1>{profile.name || user?.username}</h1>
            <p>Manage your account settings and personal preferences</p>
          </div>
        </div>
        <div className="profile-hero-visual">
          <div className="profile-orb profile-orb-1"></div>
          <div className="profile-orb profile-orb-2"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-main">
          <div className="profile-section" style={{ animationDelay: '0.1s' }}>
            <div className="profile-section-header">
              <span className="profile-section-icon">👤</span>
              <h2>Personal Information</h2>
            </div>
            <div className="profile-form">
              <div className="profile-form-group">
                <label className="profile-label">Username</label>
                <input
                  type="text"
                  className="profile-input"
                  value={profile.name}
                  disabled
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-label">Email Address</label>
                <input
                  type="email"
                  className="profile-input"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-label">Phone Number</label>
                <input
                  type="tel"
                  className="profile-input"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="profile-section" style={{ animationDelay: '0.2s' }}>
            <div className="profile-section-header">
              <span className="profile-section-icon">🚨</span>
              <h2>Emergency Contacts</h2>
            </div>
            <div className="profile-form">
              <div className="profile-form-group">
                <label className="profile-label">Emergency Email</label>
                <input
                  type="email"
                  className="profile-input"
                  value={profile.emergencyEmail}
                  onChange={(e) => handleChange('emergencyEmail', e.target.value)}
                  placeholder="emergency@example.com"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-label">Emergency Phone</label>
                <input
                  type="tel"
                  className="profile-input"
                  value={profile.emergencyPhone}
                  onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                  placeholder="+1 (555) 987-6543"
                />
              </div>
              <p className="profile-help">
                💡 These contacts will be notified in case of a mental health crisis
              </p>
            </div>
          </div>

          <div className="profile-section" style={{ animationDelay: '0.3s' }}>
            <div className="profile-section-header">
              <span className="profile-section-icon">⚙️</span>
              <h2>Preferences</h2>
            </div>
            <div className="profile-form">
              <div className="profile-form-group">
                <label className="profile-label">Theme</label>
                <select
                  className="profile-select"
                  value={profile.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <option value="Blue (Default)">🔵 Blue (Default)</option>
                  <option value="Dark">🌙 Dark</option>
                  <option value="Light">☀️ Light</option>
                  <option value="Green">🟢 Green</option>
                </select>
              </div>
              <div className="profile-checkbox-group">
                <input
                  type="checkbox"
                  className="profile-checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <label htmlFor="notifications" className="profile-checkbox-label">
                  Enable push notifications
                </label>
              </div>
            </div>
          </div>

          <div className="profile-section" style={{ animationDelay: '0.4s' }}>
            <div className="profile-section-header">
              <span className="profile-section-icon">🔒</span>
              <h2>Data & Privacy</h2>
            </div>
            <div className="profile-data-actions">
              <button type="button" className="profile-export-btn" onClick={exportData}>
                📥 Export My Data
              </button>
              <p className="profile-help">
                Download all your chat history, journal entries, and wellness data
              </p>
            </div>
            <div className="danger-zone">
              <h3>⚠️ Danger Zone</h3>
              <p>This action is irreversible. All your data will be permanently deleted.</p>
              <button type="button" className="danger-btn">
                Delete Account
              </button>
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" className="profile-save-btn" disabled={saving}>
              {saving ? (
                <>
                  <span>⏳</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button type="button" className="profile-cancel-btn" onClick={() => window.location.reload()}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;