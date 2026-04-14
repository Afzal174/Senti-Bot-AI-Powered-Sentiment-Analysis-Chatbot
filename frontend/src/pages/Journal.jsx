import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Journal = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'Neutral' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const username = user?.username;

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/journal?username=${username}`);
      if (response.data.success) {
        // Transform backend data to frontend format
        const formattedEntries = response.data.entries.map((entry, index) => ({
          id: index + 1,
          date: entry.timestamp.split('T')[0],
          title: `Journal Entry ${index + 1}`,
          content: entry.content,
          mood: 'Neutral' // Backend doesn't store mood, so default to Neutral
        }));
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
        const response = await axios.post('http://localhost:5000/api/journal', {
          username,
          content: `${newEntry.title}\n\n${newEntry.content}`
        });

        if (response.data.success) {
          // Reload entries to show the new one
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

  return (
    <div className="journal-page">
      <div className="page-header">
        <h1>Journal</h1>
        <p>Reflect on your thoughts and emotions through writing.</p>
      </div>

      <div className="journal-content">
        <div className="new-entry-card">
          <h3>Write New Entry</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Entry Title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <select
                value={newEntry.mood}
                onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
              >
                <option value="Happy">Happy</option>
                <option value="Sad">Sad</option>
                <option value="Anxious">Anxious</option>
                <option value="Angry">Angry</option>
                <option value="Neutral">Neutral</option>
                <option value="Excited">Excited</option>
              </select>
            </div>
            <div className="form-group">
              <textarea
                placeholder="Write your thoughts here..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                rows="6"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </form>
        </div>

        <div className="entries-list">
          <h3>Journal Entries</h3>
          {entries.map(entry => (
            <div key={entry.id} className="entry-card">
              <div className="entry-header">
                <h4>{entry.title}</h4>
                <div className="entry-meta">
                  <span className="date">{entry.date}</span>
                  <span className={`mood-badge ${entry.mood.toLowerCase()}`}>{entry.mood}</span>
                </div>
              </div>
              <p className="entry-content">{entry.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journal;