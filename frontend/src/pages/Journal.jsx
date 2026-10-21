import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Journal.css';

const Journal = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'Neutral' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const username = user?.username;

  const moods = [
    { value: 'Happy', emoji: '😊', label: 'Happy' },
    { value: 'Excited', emoji: '🎉', label: 'Excited' },
    { value: 'Neutral', emoji: '😐', label: 'Neutral' },
    { value: 'Sad', emoji: '😢', label: 'Sad' },
    { value: 'Anxious', emoji: '😰', label: 'Anxious' },
    { value: 'Angry', emoji: '😤', label: 'Angry' }
  ];

  useEffect(() => {
    if (username) {
      loadJournalEntries();
    }
  }, [username]);

  const loadJournalEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/journal?username=${username}`);
      if (response.data.success) {
        const formattedEntries = response.data.entries.map((entry, index) => {
          const contentParts = entry.content.split('\n\n');
          const title = contentParts.length > 1 ? contentParts[0] : `Journal Entry ${index + 1}`;
          const content = contentParts.length > 1 ? contentParts.slice(1).join('\n\n') : entry.content;
          return {
            id: index + 1,
            date: entry.timestamp.split('T')[0],
            title,
            content,
            mood: 'Neutral'
          };
        });
        setEntries(formattedEntries);
      }
    } catch (err) {
      setError('Failed to load journal entries');
      console.error('Error loading journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newEntry.title && newEntry.content) {
      setSaving(true);
      try {
        const response = await axios.post('/api/journal', {
          username,
          content: `${newEntry.title}\n\n${newEntry.content}`
        });

        if (response.data.success) {
          await loadJournalEntries();
          setNewEntry({ title: '', content: '', mood: 'Neutral' });
        } else {
          setError('Failed to save journal entry');
        }
      } catch (err) {
        setError('Failed to save journal entry');
        console.error('Error saving journal entry:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="journal-page">
      <div className="journal-hero">
        <div className="journal-hero-content">
          <div className="journal-hero-text">
            <h1>My Journal</h1>
            <p>Capture your thoughts, track your emotions, and reflect on your journey of self-discovery</p>
          </div>
          <div className="journal-hero-visual">
            <div className="journal-orb journal-orb-1"></div>
            <div className="journal-orb journal-orb-2"></div>
            <div className="journal-book">📔</div>
          </div>
        </div>
      </div>

      <div className="journal-main">
        <div className="new-entry-card-modern">
          <div className="new-entry-header">
            <h2>✍️ New Entry</h2>
            <p>Pour your heart out</p>
          </div>
          <form onSubmit={handleSubmit} className="journal-form">
            <div className="form-group-modern">
              <label className="form-label">Entry Title</label>
              <input
                type="text"
                className="form-input-modern"
                placeholder="What's on your mind?"
                value={newEntry.title}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group-modern">
              <label className="form-label">How are you feeling?</label>
              <select
                className="form-select-modern"
                value={newEntry.mood}
                onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
              >
                {moods.map(mood => (
                  <option key={mood.value} value={mood.value}>
                    {mood.emoji} {mood.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group-modern">
              <label className="form-label">Your Thoughts</label>
              <textarea
                className="form-textarea-modern"
                placeholder="Write your reflections here... Let your thoughts flow freely."
                value={newEntry.content}
                onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="save-entry-btn" disabled={saving}>
              {saving ? (
                <>
                  <span>⏳</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Entry</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="entries-section">
          <div className="entries-header">
            <h2>📚 My Reflections</h2>
            <span className="entries-count">{entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}</span>
          </div>
          
          {loading ? (
            <div className="journal-loading">
              <div className="loading-spinner-journal"></div>
              <p>Loading your journal...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📝</span>
              <h3>No entries yet</h3>
              <p>Start your journaling journey by writing your first entry above</p>
            </div>
          ) : (
            <div className="entries-list-modern">
              {entries.map((entry, index) => {
                const moodInfo = moods.find(m => m.value === entry.mood) || moods[2];
                return (
                  <div key={entry.id} className="entry-card-modern" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="entry-card-header">
                      <div className="entry-title-section">
                        <h3>{entry.title}</h3>
                        <span className="entry-date">{formatDate(entry.date)}</span>
                      </div>
                      <span className={`entry-mood-badge ${entry.mood.toLowerCase()}`}>
                        {moodInfo.emoji} {entry.mood}
                      </span>
                    </div>
                    <p className="entry-content-modern">{entry.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;