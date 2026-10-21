import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Goals.css';

const Goals = ({ user }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'Personal',
    deadline: ''
  });

  const [filter, setFilter] = useState('All');

  const categories = ['Personal', 'Health', 'Career', 'Wellness', 'Education', 'Finance'];

  useEffect(() => {
    if (user?.username) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/goals?username=${user.username}`);
      if (response.data.success) {
        setGoals(response.data.goals.map(goal => {
          const contentParts = goal.content ? goal.content.split('\n') : [];
          const title = contentParts[0] || goal.content || 'Untitled Goal';
          const description = contentParts[1] || '';
          const category = contentParts.find(p => p.startsWith('Category:'))?.replace('Category: ', '') || 'Personal';
          const deadline = contentParts.find(p => p.startsWith('Deadline:'))?.replace('Deadline: ', '') || '';
          return {
            ...goal,
            title,
            description,
            category,
            deadline: deadline === 'No deadline' ? '' : deadline,
            progress: goal.status === 'Completed' ? 100 : goal.status === 'In Progress' ? 50 : 0
          };
        }));
      }
    } catch (err) {
      setError('Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newGoal.title && user?.username) {
      try {
        const response = await axios.post('/api/goals', {
          username: user.username,
          content: `${newGoal.title}\n${newGoal.description || ''}\nCategory: ${newGoal.category}\nDeadline: ${newGoal.deadline || 'No deadline'}`
        });

        if (response.data.success) {
          await loadGoals();
          setNewGoal({ title: '', description: '', category: 'Personal', deadline: '' });
        } else {
          setError('Failed to save goal');
        }
      } catch (err) {
        setError('Failed to save goal');
        console.error('Error saving goal:', err);
      }
    }
  };

  const updateGoalStatus = async (id, status) => {
    try {
      const response = await axios.put(`/api/goals/${id}`, {
        status: status
      });

      if (response.data.success) {
        await loadGoals();
      } else {
        setError('Failed to update goal status');
      }
    } catch (err) {
      setError('Failed to update goal status');
      console.error('Error updating goal status:', err);
    }
  };

  const deleteGoal = async (id) => {
    try {
      const response = await axios.delete(`/api/goals/${id}`);

      if (response.data.success) {
        await loadGoals();
      } else {
        setError('Failed to delete goal');
      }
    } catch (err) {
      setError('Failed to delete goal');
      console.error('Error deleting goal:', err);
    }
  };

  const filteredGoals = filter === 'All' ? goals : goals.filter(goal => goal.status === filter);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'completed';
      case 'In Progress': return 'in-progress';
      case 'Not Started': return 'not-started';
      default: return 'not-started';
    }
  };

  const getProgress = (status) => {
    switch (status) {
      case 'Completed': return 100;
      case 'In Progress': return 50;
      case 'Not Started': return 0;
      default: return 0;
    }
  };

  return (
    <div className="goals-page">
      <div className="goals-hero">
        <div className="goals-hero-content">
          <div className="goals-hero-text">
            <h1>Goal Tracker</h1>
            <p>Turn your dreams into achievable goals and track your progress every step of the way</p>
          </div>
          <div className="goals-hero-visual">
            <div className="goals-orb goals-orb-1"></div>
            <div className="goals-orb goals-orb-2"></div>
            <div className="goals-target">🎯</div>
          </div>
        </div>
      </div>

      <div className="goals-main">
        <div className="new-goal-card-modern">
          <div className="new-goal-header">
            <h2>✨ Create New Goal</h2>
            <p>Set your next achievement</p>
          </div>
          <form onSubmit={handleSubmit} className="goals-form">
            <div className="form-group-modern">
              <label className="form-label">Goal Title</label>
              <input
                type="text"
                className="form-input-modern"
                placeholder="What do you want to achieve?"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                required
              />
            </div>
            <div className="form-row-modern">
              <div className="form-group-modern">
                <label className="form-label">Category</label>
                <select
                  className="form-select-modern"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-modern">
                <label className="form-label">Deadline</label>
                <input
                  type="date"
                  className="form-input-modern"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group-modern">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea-modern"
                placeholder="Describe your goal and why it's important..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                rows="3"
              />
            </div>
            <button type="submit" className="create-goal-btn">
              <span>🎯</span>
              <span>Create Goal</span>
            </button>
          </form>
        </div>

        <div className="goals-section">
          <div className="goals-section-header">
            <h2>🚀 My Goals</h2>
            <div className="filter-tabs">
              {['All', 'Not Started', 'In Progress', 'Completed'].map(status => (
                <button
                  key={status}
                  className={`filter-tab ${filter === status ? 'active' : ''}`}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="journal-loading">
              <div className="loading-spinner-journal"></div>
              <p>Loading your goals...</p>
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="goals-empty">
              <span className="goals-empty-icon">🎯</span>
              <h3>No goals yet</h3>
              <p>Create your first goal to start tracking your progress</p>
            </div>
          ) : (
            <div className="goals-grid">
              {filteredGoals.map((goal, index) => (
                <div key={goal.id} className="goal-card-modern" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="goal-card-header">
                    <div className="goal-title-section">
                      <h3>{goal.title}</h3>
                      <div className="goal-meta-tags">
                        <span className="goal-category-tag">{goal.category}</span>
                        {goal.deadline && <span className="goal-deadline-tag">📅 {goal.deadline}</span>}
                      </div>
                    </div>
                    <span className={`goal-status-badge ${getStatusClass(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  
                  {goal.description && (
                    <p className="goal-description-text">{goal.description}</p>
                  )}
                  
                  <div className="goal-progress-section">
                    <div className="goal-progress-header">
                      <span className="goal-progress-label">Progress</span>
                      <span className="goal-progress-value">{getProgress(goal.status)}%</span>
                    </div>
                    <div className="goal-progress-bar-container">
                      <div 
                        className="goal-progress-bar-fill" 
                        style={{ width: `${getProgress(goal.status)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="goal-actions-row">
                    <select
                      value={goal.status}
                      onChange={(e) => updateGoalStatus(goal.id, e.target.value)}
                      className="goal-status-select"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      className="goal-delete-btn"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;