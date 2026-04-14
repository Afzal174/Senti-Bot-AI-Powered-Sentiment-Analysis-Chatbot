import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = ({ user }) => {
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
      // Load mood history (currently not implemented in backend)
      // const moodResponse = await axios.get(`http://localhost:5000/api/mood_history?username=${user.username}`);
      // if (moodResponse.data.success) {
      //   processMoodData(moodResponse.data.mood_history);
      // }

      // For now, use sample mood data
      const sampleMoodData = {
        'Happy': 5,
        'Neutral': 3,
        'Sad': 2,
        'Anxious': 1
      };
      processMoodData(sampleMoodData);

      // Load goals
      const goalsResponse = await axios.get(`http://localhost:5000/api/goals?username=${user.username}`);
      if (goalsResponse.data.success) {
        const goals = goalsResponse.data.goals;
        const completedGoals = goals.filter(goal => goal.status === 'Completed').length;
        setStats(prev => ({ ...prev, goalsCompleted: completedGoals }));
      }

      // Load journal entries
      const journalResponse = await axios.get(`http://localhost:5000/api/journal?username=${user.username}`);
      if (journalResponse.data.success) {
        setStats(prev => ({ ...prev, journalEntries: journalResponse.data.entries.length }));
      }

      // Load chat sessions
      const chatResponse = await axios.get(`http://localhost:5000/api/chat_sessions?username=${user.username}`);
      if (chatResponse.data.success) {
        setStats(prev => ({ ...prev, totalChats: chatResponse.data.sessions.length }));
      }

      // Generate recent activity
      generateRecentActivity();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMoodData = (moodHistory) => {
    // Process mood data for charts
    const moodColors = {
      'Happy': '#28a745',
      'Sad': '#dc3545',
      'Anxious': '#ffc107',
      'Angry': '#dc3545',
      'Neutral': '#6c757d'
    };

    const moodCounts = {};
    Object.keys(moodHistory).forEach(mood => {
      moodCounts[mood] = moodHistory[mood];
    });

    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    const pieData = Object.keys(moodCounts).map(mood => ({
      name: mood,
      value: moodCounts[mood],
      color: moodColors[mood] || '#6c757d'
    }));

    setMoodData(pieData);

    // Calculate average mood (simplified)
    const moodValues = { 'Happy': 8, 'Neutral': 5, 'Sad': 3, 'Anxious': 4, 'Angry': 2 };
    let weightedSum = 0;
    Object.keys(moodCounts).forEach(mood => {
      weightedSum += moodValues[mood] * moodCounts[mood];
    });
    const averageMood = total > 0 ? (weightedSum / total).toFixed(1) : 0;
    setStats(prev => ({ ...prev, averageMood }));

    // Generate weekly data (simplified - would need real time-based data)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyMood = days.map(day => ({
      day,
      mood: Math.floor(Math.random() * 5) + 5 // Random mood 5-9 for demo
    }));
    setWeeklyData(weeklyMood);
  };

  const generateRecentActivity = () => {
    // This would ideally come from a combined API endpoint
    // For now, create sample recent activity
    const activities = [
      {
        icon: '💬',
        content: 'Chat session with SentiBot',
        time: '2 hours ago'
      },
      {
        icon: '🎵',
        content: 'Discovered new music recommendations',
        time: '1 day ago'
      },
      {
        icon: '📝',
        content: 'Added journal entry',
        time: '2 days ago'
      },
      {
        icon: '🎯',
        content: 'Completed goal: "Practice mindfulness"',
        time: '3 days ago'
      }
    ];
    setRecentActivity(activities);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome to SentiBot Dashboard</h1>
        <p>Track your emotional well-being and discover insights about your mood patterns.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Chats</h3>
          <div className="stat-number">{stats.totalChats}</div>
          <p className="stat-change positive">Chat sessions</p>
        </div>
        <div className="stat-card">
          <h3>Average Mood</h3>
          <div className="stat-number">{stats.averageMood}</div>
          <p className="stat-change positive">Based on conversations</p>
        </div>
        <div className="stat-card">
          <h3>Goals Completed</h3>
          <div className="stat-number">{stats.goalsCompleted}</div>
          <p className="stat-change positive">Goals achieved</p>
        </div>
        <div className="stat-card">
          <h3>Journal Entries</h3>
          <div className="stat-number">{stats.journalEntries}</div>
          <p className="stat-change positive">Reflections written</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moodData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Weekly Mood Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="mood" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <p>{activity.content}</p>
                <span>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">Start Chat</button>
          <button className="action-btn secondary">Write Journal</button>
          <button className="action-btn secondary">Set Goal</button>
          <button className="action-btn secondary">Wellness Tools</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;