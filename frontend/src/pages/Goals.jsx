import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        setGoals(response.data.goals.map(goal => ({
          ...goal,
          deadline: goal.timestamp ? goal.timestamp.split('T')[0] : '',
          progress: goal.status === 'Completed' ? 100 : 0
        })));
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
          await loadGoals(); // Reload goals
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
        await loadGoals(); // Reload goals
      } else {
        setError('Failed to update goal status');
      }
    } catch (err) {
      setError('Failed to update goal status');
      console.error('Error updating goal status:', err);
    }
  };

  const updateProgress = (id, progress) => {
    // For now, just update local state since backend doesn't store progress separately
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, progress: Math.min(100, Math.max(0, progress)) } : goal
    ));
  };

  const deleteGoal = async (id) => {
    try {
      const response = await axios.delete(`/api/goals/${id}`);

      if (response.data.success) {
        await loadGoals(); // Reload goals
      } else {
        setError('Failed to delete goal');
      }
    } catch (err) {
      setError('Failed to delete goal');
      console.error('Error deleting goal:', err);
    }
  };

  const filteredGoals = filter === 'All' ? goals : goals.filter(goal => goal.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#28a745';
      case 'In Progress': return '#007bff';
      case 'Not Started': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div className="goals-page">
      <div className="page-header">
        <h1>Goals</h1>
        <p>Set, track, and achieve your personal goals.</p>
      </div>

      <div className="goals-content">
        <div className="new-goal-card">
          <h3>Create New Goal</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  type="text"
                  placeholder="What do you want to achieve?"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                >
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Career">Career</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Education">Education</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe your goal in detail..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary">Create Goal</button>
          </form>
        </div>

        <div className="goals-filters">
          <div className="filter-buttons">
            {['All', 'In Progress', 'Completed', 'Not Started'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="goals-list">
          {filteredGoals.map(goal => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <div className="goal-info">
                  <h4>{goal.title}</h4>
                  <div className="goal-meta">
                    <span className="category">{goal.category}</span>
                    <span className="deadline">Due: {goal.deadline}</span>
                  </div>
                </div>
                <div className="goal-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(goal.status) }}
                  >
                    {goal.status}
                  </span>
                </div>
              </div>

              <p className="goal-description">{goal.description}</p>

              <div className="goal-progress">
                <div className="progress-header">
                  <span>Progress: {goal.progress}%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                    className="progress-input"
                  />
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="goal-actions">
                <select
                  value={goal.status}
                  onChange={(e) => updateGoalStatus(goal.id, e.target.value)}
                  className="status-select"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button
                  className="btn-danger small"
                  onClick={() => deleteGoal(goal.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Goals;