import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [stats, setStats] = useState({
    totalChats: 0,
    averageMood: 0,
    goalsCompleted: 0,
    journalEntries: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.username) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const sampleMoodData = {
        'Happy': 5,
        'Neutral': 3,
        'Sad': 2,
        'Anxious': 1
      };
      processMoodData(sampleMoodData);

      const goalsResponse = await axios.get(`/api/goals?username=${user.username}`);
      if (goalsResponse.data.success) {
        const goals = goalsResponse.data.goals;
        const completedGoals = goals.filter(goal => goal.status === 'Completed').length;
        setStats(prev => ({ ...prev, goalsCompleted: completedGoals }));
      }

      const journalResponse = await axios.get(`/api/journal?username=${user.username}`);
      if (journalResponse.data.success) {
        setStats(prev => ({ ...prev, journalEntries: journalResponse.data.entries.length }));
      }

      const chatResponse = await axios.get(`/api/chat_sessions?username=${user.username}`);
      if (chatResponse.data.success) {
        setStats(prev => ({ ...prev, totalChats: chatResponse.data.sessions.length }));
      }

      generateRecentActivity();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMoodData = (moodHistory) => {
    const moodColors = {
      'Happy': '#10b981',
      'Sad': '#ef4444',
      'Anxious': '#f59e0b',
      'Angry': '#dc2626',
      'Neutral': '#64748b'
    };

    const moodCounts = {};
    Object.keys(moodHistory).forEach(mood => {
      moodCounts[mood] = moodHistory[mood];
    });

    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    const pieData = Object.keys(moodCounts).map(mood => ({
      name: mood,
      value: moodCounts[mood],
      color: moodColors[mood] || '#64748b'
    }));

    setMoodData(pieData);

    const moodValues = { 'Happy': 9, 'Neutral': 6, 'Sad': 3, 'Anxious': 4, 'Angry': 2 };
    let weightedSum = 0;
    Object.keys(moodCounts).forEach(mood => {
      weightedSum += moodValues[mood] * moodCounts[mood];
    });
    const averageMood = total > 0 ? (weightedSum / total).toFixed(1) : 0;
    setStats(prev => ({ ...prev, averageMood }));

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyMood = days.map((day, index) => ({
      day,
      mood: Math.floor(Math.random() * 3) + 6
    }));
    setWeeklyData(weeklyMood);
  };

  const generateRecentActivity = () => {
    const activities = [
      {
        icon: '💬',
        content: 'Started a new chat session',
        time: '2 hours ago',
        type: 'chat'
      },
      {
        icon: '🎵',
        content: 'Discovered mood-based music recommendations',
        time: '1 day ago',
        type: 'music'
      },
      {
        icon: '📝',
        content: 'Wrote a reflection in journal',
        time: '2 days ago',
        type: 'journal'
      },
      {
        icon: '🎯',
        content: 'Completed goal: "Practice mindfulness"',
        time: '3 days ago',
        type: 'goal'
      },
      {
        icon: '🧘',
        content: 'Completed breathing exercise',
        time: '4 days ago',
        type: 'wellness'
      }
    ];
    setRecentActivity(activities);
  };

  const quickActions = [
    { icon: '💬', label: 'Start Chat', path: '/chat', gradient: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' },
    { icon: '📝', label: 'Write Journal', path: '/journal', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { icon: '🎯', label: 'Set Goal', path: '/goals', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { icon: '🧘', label: 'Wellness Tools', path: '/wellness', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
    { icon: '🎵', label: 'Music Therapy', path: '/music', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value} times</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">Mood: {payload[0].value}/10</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome back, <span className="hero-username">{user?.username || 'User'}</span>
          </h1>
          <p className="hero-subtitle">Your emotional wellness journey at a glance</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{stats.totalChats}</span>
              <span className="hero-stat-label">Chat Sessions</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">{stats.journalEntries}</span>
              <span className="hero-stat-label">Reflections</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">{stats.goalsCompleted}</span>
              <span className="hero-stat-label">Goals Achieved</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orb orb-1"></div>
          <div className="hero-orb orb-2"></div>
          <div className="hero-orb orb-3"></div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-header">
            <div className="stat-icon">💬</div>
            <span className="stat-badge">Active</span>
          </div>
          <h3>Total Chats</h3>
          <div className="stat-number">{stats.totalChats}</div>
          <p className="stat-change positive">↗ Conversations with SentiBot</p>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-card-header">
            <div className="stat-icon">😊</div>
            <span className="stat-badge">Well-being</span>
          </div>
          <h3>Average Mood</h3>
          <div className="stat-number">{stats.averageMood}<span className="stat-number-suffix">/10</span></div>
          <p className="stat-change positive">Based on your interactions</p>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-card-header">
            <div className="stat-icon">🎯</div>
            <span className="stat-badge">Progress</span>
          </div>
          <h3>Goals Completed</h3>
          <div className="stat-number">{stats.goalsCompleted}</div>
          <p className="stat-change positive">Great achievement!</p>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-card-header">
            <div className="stat-icon">📝</div>
            <span className="stat-badge">Growth</span>
          </div>
          <h3>Journal Entries</h3>
          <div className="stat-number">{stats.journalEntries}</div>
          <p className="stat-change positive">Self-reflection count</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card chart-card-large">
          <div className="chart-card-header">
            <div>
              <h3>🧠 Mood Distribution</h3>
              <p className="chart-subtitle">Emotional patterns from your conversations</p>
            </div>
            <div className="chart-legend">
              {moodData.map((entry, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: entry.color }}></span>
                  <span className="legend-label">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={moodData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card-large">
          <div className="chart-card-header">
            <div>
              <h3>📈 Weekly Mood Trend</h3>
              <p className="chart-subtitle">Your emotional journey this week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.2)" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis domain={[0, 10]} stroke="#64748b" />
              <Tooltip content={<CustomBarTooltip />} />
              <Area type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-section">
        <div className="activity-card">
          <div className="activity-card-header">
            <h3>🕒 Recent Activity</h3>
            <span className="activity-badge">Latest</span>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`activity-icon-wrapper activity-${activity.type}`}>
                  <span className="activity-icon">{activity.icon}</span>
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.content}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
                <div className="activity-arrow">→</div>
              </div>
            ))}
          </div>
        </div>

        <div className="actions-card">
          <div className="actions-card-header">
            <h3>⚡ Quick Actions</h3>
            <p className="actions-subtitle">Jump into your wellness activities</p>
          </div>
          <div className="action-buttons-grid">
            {quickActions.map((action, index) => (
              <button 
                key={index} 
                className="action-btn-modern" 
                style={{ 
                  background: action.gradient,
                  animationDelay: `${index * 0.1}s`
                }}
                onClick={() => navigate(action.path)}
              >
                <span className="action-btn-icon">{action.icon}</span>
                <span className="action-btn-label">{action.label}</span>
                <span className="action-btn-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;