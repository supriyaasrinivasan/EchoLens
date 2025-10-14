import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Check, X, TrendingUp, Clock } from 'lucide-react';

const GoalsManager = () => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    keywords: '',
    priority: 'medium',
    targetHours: 10
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    chrome.runtime.sendMessage({ type: 'GET_GOALS' }, (response) => {
      if (response?.goals) {
        setGoals(response.goals);
      }
      setLoading(false);
    });
  };

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;

    const goalData = {
      title: newGoal.title,
      description: newGoal.description,
      keywords: newGoal.keywords.split(',').map(k => k.trim()).filter(k => k),
      priority: newGoal.priority,
      targetHours: parseFloat(newGoal.targetHours) || 10
    };

    chrome.runtime.sendMessage({ 
      type: 'ADD_GOAL', 
      data: goalData 
    }, (response) => {
      if (response?.goal) {
        loadGoals();
        setShowAddGoal(false);
        setNewGoal({
          title: '',
          description: '',
          keywords: '',
          priority: 'medium',
          targetHours: 10
        });
      }
    });
  };

  const handleToggleGoal = (goalId) => {
    chrome.runtime.sendMessage({ 
      type: 'TOGGLE_GOAL', 
      data: { goalId } 
    }, () => {
      loadGoals();
    });
  };

  const handleDeleteGoal = (goalId) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      chrome.runtime.sendMessage({ 
        type: 'DELETE_GOAL', 
        data: { goalId } 
      }, () => {
        loadGoals();
      });
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#6b7280'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: '🔥 High',
      medium: '⭐ Medium',
      low: '💡 Low'
    };
    return labels[priority] || labels.medium;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Target size={48} className="loading-icon" />
        <p>Loading your goals...</p>
      </div>
    );
  }

  return (
    <div className="goals-container">
      <div className="goals-header">
        <div className="header-content">
          <h2>
            <Target size={28} />
            Goal Alignment
          </h2>
          <p className="header-subtitle">
            Set intentional goals and track your progress mindfully
          </p>
        </div>
        <button className="add-goal-button" onClick={() => setShowAddGoal(true)}>
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="modal-overlay" onClick={() => setShowAddGoal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Goal</h3>
              <button className="modal-close" onClick={() => setShowAddGoal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Goal Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Learn React"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What do you want to achieve?"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., react, javascript, hooks"
                  value={newGoal.keywords}
                  onChange={(e) => setNewGoal({...newGoal, keywords: e.target.value})}
                />
                <small>SupriAI will track pages containing these keywords</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                  >
                    <option value="high">🔥 High</option>
                    <option value="medium">⭐ Medium</option>
                    <option value="low">💡 Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={newGoal.targetHours}
                    onChange={(e) => setNewGoal({...newGoal, targetHours: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowAddGoal(false)}>
                Cancel
              </button>
              <button className="button-primary" onClick={handleAddGoal}>
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="empty-state">
            <Target size={64} />
            <h3>No Goals Yet</h3>
            <p>Create your first goal to start tracking your intentional browsing!</p>
            <button className="button-primary" onClick={() => setShowAddGoal(true)}>
              <Plus size={20} />
              Add Your First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className={`goal-card ${!goal.isActive ? 'inactive' : ''}`}>
              <div className="goal-header">
                <div className="goal-title-row">
                  <h3 className="goal-title">{goal.title}</h3>
                  <span 
                    className="goal-priority"
                    style={{ color: getPriorityColor(goal.priority) }}
                  >
                    {getPriorityLabel(goal.priority)}
                  </span>
                </div>
                <div className="goal-actions">
                  <button
                    className={`toggle-button ${goal.isActive ? 'active' : ''}`}
                    onClick={() => handleToggleGoal(goal.id)}
                    title={goal.isActive ? 'Pause goal' : 'Activate goal'}
                  >
                    {goal.isActive ? <Check size={16} /> : <X size={16} />}
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    title="Delete goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="goal-progress">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value">
                    {goal.actualHours}h / {goal.targetHours}h ({goal.progress}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${goal.isOnTrack ? 'on-track' : 'behind'}`}
                    style={{ width: `${Math.min(100, goal.progress)}%` }}
                  />
                </div>
              </div>

              {goal.isOnTrack && (
                <div className="goal-status on-track">
                  <TrendingUp size={16} />
                  On track!
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h3>💡 Tips for Effective Goals</h3>
        <ul>
          <li>Be specific with keywords to help SupriAI track relevant pages</li>
          <li>Set realistic target hours based on your schedule</li>
          <li>Review and adjust your goals weekly</li>
          <li>SupriAI will gently nudge you if you're drifting off-track</li>
        </ul>
      </div>
    </div>
  );
};

export default GoalsManager;
