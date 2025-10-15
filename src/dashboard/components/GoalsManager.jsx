import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Check, X, TrendingUp, Clock, Edit2, PlayCircle, PauseCircle, AlertCircle } from 'lucide-react';

const GoalsManager = () => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    keywords: '',
    priority: 'medium',
    targetHours: 10
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('priority'); // priority, progress, recent

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

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      keywords: goal.keywords?.join(', ') || '',
      priority: goal.priority,
      targetHours: goal.targetHours
    });
    setShowAddGoal(true);
  };

  const handleUpdateGoal = async () => {
    if (!newGoal.title.trim() || !editingGoal) return;

    const goalData = {
      id: editingGoal.id,
      title: newGoal.title,
      description: newGoal.description,
      keywords: newGoal.keywords.split(',').map(k => k.trim()).filter(k => k),
      priority: newGoal.priority,
      targetHours: parseFloat(newGoal.targetHours) || 10
    };

    chrome.runtime.sendMessage({ 
      type: 'UPDATE_GOAL', 
      data: goalData 
    }, (response) => {
      if (response?.success) {
        loadGoals();
        setShowAddGoal(false);
        setEditingGoal(null);
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

  const getSortedGoals = () => {
    const sorted = [...goals];
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
      case 'progress':
        return sorted.sort((a, b) => parseFloat(b.progress) - parseFloat(a.progress));
      case 'recent':
        return sorted.sort((a, b) => b.id - a.id);
      default:
        return sorted;
    }
  };

  const getGoalStatus = (goal) => {
    const progress = parseFloat(goal.progress);
    if (progress >= 100) return { label: 'Completed', color: '#10b981', icon: '✅' };
    if (progress >= 70) return { label: 'On Track', color: '#10b981', icon: '🎯' };
    if (progress >= 40) return { label: 'In Progress', color: '#f59e0b', icon: '⏳' };
    return { label: 'Needs Attention', color: '#ef4444', icon: '⚠️' };
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
        <div className="header-actions">
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="priority">Sort by Priority</option>
            <option value="progress">Sort by Progress</option>
            <option value="recent">Sort by Recent</option>
          </select>
          <button className="add-goal-button" onClick={() => {
            setEditingGoal(null);
            setShowAddGoal(true);
          }}>
            <Plus size={20} />
            Add Goal
          </button>
        </div>
      </div>

      {/* Goal Statistics Overview */}
      {goals.length > 0 && (
        <div className="goals-stats">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{goals.filter(g => g.isActive).length}</div>
              <div className="stat-label">Active Goals</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{goals.filter(g => parseFloat(g.progress) >= 100).length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">
                {goals.length > 0 
                  ? Math.round(goals.reduce((sum, g) => sum + parseFloat(g.progress), 0) / goals.length)
                  : 0}%
              </div>
              <div className="stat-label">Avg Progress</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value">
                {goals.reduce((sum, g) => sum + parseFloat(g.actualHours), 0).toFixed(1)}h
              </div>
              <div className="stat-label">Total Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showAddGoal && (
        <div className="modal-overlay" onClick={() => {
          setShowAddGoal(false);
          setEditingGoal(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
              <button className="modal-close" onClick={() => {
                setShowAddGoal(false);
                setEditingGoal(null);
              }}>
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
              <button className="button-secondary" onClick={() => {
                setShowAddGoal(false);
                setEditingGoal(null);
              }}>
                Cancel
              </button>
              <button 
                className="button-primary" 
                onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
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
          getSortedGoals().map((goal) => {
            const status = getGoalStatus(goal);
            return (
              <div key={goal.id} className={`goal-card ${!goal.isActive ? 'inactive' : ''} ${parseFloat(goal.progress) >= 100 ? 'completed' : ''}`}>
                <div className="goal-header">
                  <div className="goal-title-row">
                    <h3 className="goal-title">{goal.title}</h3>
                    <div className="goal-badges">
                      <span 
                        className="goal-priority"
                        style={{ color: getPriorityColor(goal.priority) }}
                      >
                        {getPriorityLabel(goal.priority)}
                      </span>
                      <span 
                        className="goal-status"
                        style={{ color: status.color }}
                      >
                        {status.icon} {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="goal-actions">
                    <button
                      className="action-button"
                      onClick={() => handleEditGoal(goal)}
                      title="Edit goal"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className={`action-button ${goal.isActive ? 'active' : 'paused'}`}
                      onClick={() => handleToggleGoal(goal.id)}
                      title={goal.isActive ? 'Pause goal' : 'Activate goal'}
                    >
                      {goal.isActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Delete goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}

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
                      style={{ 
                        width: `${Math.min(100, parseFloat(goal.progress))}%`,
                        backgroundColor: status.color
                      }}
                    />
                  </div>
                  {parseFloat(goal.progress) < 100 && (
                    <div className="progress-info">
                      <Clock size={14} />
                      <span>{(goal.targetHours - goal.actualHours).toFixed(1)}h remaining</span>
                    </div>
                  )}
                </div>

                {goal.keywords && goal.keywords.length > 0 && (
                  <div className="goal-keywords">
                    <div className="keywords-label">Tracking:</div>
                    <div className="keywords-list">
                      {goal.keywords.map((keyword, idx) => (
                        <span key={idx} className="keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h3>💡 Tips for Effective Goals</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h4>Be Specific</h4>
            <p>Use targeted keywords to help SupriAI accurately track relevant pages</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⏰</div>
            <h4>Set Realistic Targets</h4>
            <p>Base target hours on your actual schedule and availability</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📊</div>
            <h4>Review Weekly</h4>
            <p>Check your progress regularly and adjust goals as needed</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔔</div>
            <h4>Mindful Nudges</h4>
            <p>SupriAI will gently remind you if you're drifting off-track</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsManager;
