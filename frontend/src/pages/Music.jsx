import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Music.css';

const Music = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentMood, setCurrentMood] = useState('happy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const moods = [
    { key: 'happy', emoji: '😊', label: 'Happy', color: '#10b981' },
    { key: 'excited', emoji: '🎉', label: 'Excited', color: '#f59e0b' },
    { key: 'calm', emoji: '😌', label: 'Calm', color: '#06b6d4' },
    { key: 'neutral', emoji: '😐', label: 'Neutral', color: '#64748b' },
    { key: 'sad', emoji: '😢', label: 'Sad', color: '#3b82f6' },
    { key: 'anxious', emoji: '😰', label: 'Anxious', color: '#f97316' },
    { key: 'angry', emoji: '😤', label: 'Angry', color: '#ef4444' }
  ];

  useEffect(() => {
    loadRecommendations(currentMood);
  }, [currentMood]);

  const loadRecommendations = async (mood) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/music/recommend?mood=${mood}`);
      if (response.data.success) {
        setRecommendations(response.data.recommendations);
      } else {
        setError('Failed to load recommendations');
        setRecommendations([]);
      }
    } catch (err) {
      setError('Unable to connect to music service');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodChange = (mood) => {
    setCurrentMood(mood);
  };

  const getCurrentMoodInfo = () => {
    return moods.find(m => m.key === currentMood) || moods[0];
  };

  return (
    <div className="music-page">
      <div className="music-hero">
        <div className="music-hero-content">
          <div className="music-hero-text">
            <h1>Music Therapy</h1>
            <p>Discover curated playlists that match your emotions and uplift your soul through the power of music</p>
          </div>
          <div className="music-hero-visual">
            <div className="music-orb music-orb-1"></div>
            <div className="music-orb music-orb-2"></div>
            <div className="music-wave">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mood-selector-modern">
        <div className="mood-selector-header">
          <h2>How are you feeling today?</h2>
          <p>Select your mood and let us curate the perfect soundtrack for you</p>
        </div>
        <div className="mood-buttons-grid">
          {moods.map(mood => (
            <button
              key={mood.key}
              className={`mood-btn-modern ${currentMood === mood.key ? 'active' : ''}`}
              onClick={() => handleMoodChange(mood.key)}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="recommendations-section">
        <div className="recommendations-header">
          <h2>Recommended for {getCurrentMoodInfo().label}</h2>
          <span className="mood-indicator">
            {getCurrentMoodInfo().emoji} {getCurrentMoodInfo().label} Vibes
          </span>
        </div>
        
        {loading ? (
          <div className="music-loading">
            <div className="loading-spinner-music"></div>
            <p>Curating the perfect playlist for you...</p>
          </div>
        ) : error ? (
          <div className="music-error">{error}</div>
        ) : (
          <div className="music-grid-modern">
            {recommendations.map((song, index) => (
              <div key={song.id} className="music-card-modern" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="music-image-container">
                  {song.album_image ? (
                    <img
                      src={song.album_image}
                      alt={`${song.name} album art`}
                      className="music-image-modern"
                    />
                  ) : (
                    <div className="no-image-modern">🎵</div>
                  )}
                  <div className="music-image-overlay">
                    <div className="play-button">▶</div>
                  </div>
                </div>
                <div className="music-info-modern">
                  <h4 className="music-title">{song.name}</h4>
                  <p className="music-artist">{song.artist}</p>
                  <a
                    href={song.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spotify-btn"
                  >
                    <span>🎧</span>
                    <span>Listen on Spotify</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="benefits-section">
        <div className="benefits-header">
          <h2>Why Music Therapy?</h2>
          <p>The science behind music's healing power</p>
        </div>
        <div className="benefits-grid">
          <div className="benefit-card">
            <span className="benefit-icon">🎵</span>
            <h4>Mood Regulation</h4>
            <p>Music helps regulate emotions and reduce stress by activating pleasure centers in the brain</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">🧠</span>
            <h4>Cognitive Enhancement</h4>
            <p>Listening to music can improve focus, memory, and enhance cognitive performance</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">❤️</span>
            <h4>Emotional Healing</h4>
            <p>Music therapy has proven effective in treating anxiety, depression, and emotional trauma</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">✨</span>
            <h4>Endorphin Release</h4>
            <p>Favorite songs trigger dopamine release, naturally boosting your mood and energy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Music;