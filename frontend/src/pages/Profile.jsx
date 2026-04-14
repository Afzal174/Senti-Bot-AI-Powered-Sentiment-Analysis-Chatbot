import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyEmail: '',
    emergencyPhone: '',
    theme: 'Blue (Default)',
    notifications: true,
    dataExport: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.username) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      // Fetch the latest profile data from backend
      const response = await axios.get('http://localhost:5000/api/profile', {
        params: { username: user.username }
      });

      if (response.data.success) {
        setProfile({
          name: user.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          emergencyEmail: response.data.emergency_email || '',
          emergencyPhone: response.data.emergency_phone || '',
          theme: response.data.theme || 'Blue (Default)',
          notifications: true,
          dataExport: false
        });
      } else {
        // Fallback to user data from login if profile fetch fails
        setProfile({
          name: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          emergencyEmail: user.emergencyEmail || '',
          emergencyPhone: user.emergencyPhone || '',
          theme: user.theme || 'Blue (Default)',
          notifications: true,
          dataExport: false
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to user data from login
      setProfile({
        name: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyEmail: user.emergencyEmail || '',
        emergencyPhone: user.emergencyPhone || '',
        theme: user.theme || 'Blue (Default)',
        notifications: true,
        dataExport: false
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
      const response = await axios.put('http://localhost:5000/api/profile', {
        username: user.username,
        email: profile.email,
        phone: profile.phone,
        emergency_email: profile.emergencyEmail,
        emergency_phone: profile.emergencyPhone,
        theme: profile.theme
      });

      if (response.data.success) {
        alert('Profile updated successfully!');
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
    // Simulate data export
    alert('Data export initiated. You will receive an email with your data shortly.');
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-content">
          <div className="profile-card">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="profile-card">
            <h3>Emergency Contacts</h3>
            <div className="form-group">
              <label>Emergency Email</label>
              <input
                type="email"
                value={profile.emergencyEmail}
                onChange={(e) => handleChange('emergencyEmail', e.target.value)}
                placeholder="someone@example.com"
              />
            </div>
            <div className="form-group">
              <label>Emergency Phone</label>
              <input
                type="tel"
                value={profile.emergencyPhone}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <p className="help-text">
              These contacts will be used in case of mental health emergencies.
            </p>
          </div>

          <div className="profile-card">
            <h3>Preferences</h3>
            <div className="form-group">
              <label>Theme</label>
              <select
                value={profile.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <option value="Blue (Default)">Blue (Default)</option>
                <option value="Dark">Dark</option>
                <option value="Light">Light</option>
                <option value="Green">Green</option>
              </select>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={profile.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                />
                Enable notifications
              </label>
            </div>
          </div>

          <div className="profile-card">
            <h3>Data & Privacy</h3>
            <div className="data-actions">
              <button type="button" className="btn-secondary" onClick={exportData}>
                Export My Data
              </button>
              <p className="help-text">
                Download all your chat history, journal entries, and mood data.
              </p>
            </div>
            <div className="danger-zone">
              <h4>Danger Zone</h4>
              <button type="button" className="btn-danger">
                Delete Account
              </button>
              <p className="help-text">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="save-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;