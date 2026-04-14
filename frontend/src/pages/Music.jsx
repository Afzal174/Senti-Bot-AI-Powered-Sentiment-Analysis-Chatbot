import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Music = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentMood, setCurrentMood] = useState('happy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="music-page">
      <div className="page-header">
        <h1>Music Recommendations</h1>
        <p>Discover music that matches your current mood and helps improve your emotional well-being.</p>
      </div>

      <div className="mood-selector">
        <h3>How are you feeling?</h3>
        <div className="mood-buttons">
          {['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'calm'].map(mood => (
            <button
              key={mood}
              className={`mood-btn ${currentMood === mood ? 'active' : ''}`}
              onClick={() => handleMoodChange(mood)}
            >
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="music-recommendations">
        <h3>Recommended for you</h3>
        {loading ? (
          <div className="loading">Finding the perfect music for your mood...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="music-grid">
            {recommendations.map(song => (
              <div key={song.id} className="music-card">
                <div className="music-image">
                  {song.album_image ? (
                    <img
                      src={song.album_image}
                      alt={`${song.name} album art`}
                      className="album-image"
                    />
                  ) : (
                    <div className="no-image">🎵</div>
                  )}
                </div>
                <div className="music-info">
                  <h4>{song.name}</h4>
                  <p>{song.artist}</p>
                  <a
                    href={song.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spotify-link"
                  >
                    Listen on Spotify
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="music-info">
        <h3>Why Music Therapy?</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>🎵 Mood Regulation</h4>
            <p>Music can help regulate emotions and reduce stress levels.</p>
          </div>
          <div className="info-card">
            <h4>🧠 Cognitive Benefits</h4>
            <p>Listening to music can improve focus, memory, and cognitive function.</p>
          </div>
          <div className="info-card">
            <h4>❤️ Emotional Healing</h4>
            <p>Music therapy is effective in treating depression, anxiety, and PTSD.</p>
          </div>
          <div className="info-card">
            <h4>😊 Endorphin Release</h4>
            <p>Music stimulates the release of endorphins, our body's natural mood lifters.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Music;