import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Tag, Sparkles, TrendingUp, Calendar, Search, User, Target, Heart, Sun, Moon } from 'lucide-react';

const Popup = () => {
  const [stats, setStats] = useState(null);
  const [recentMemories, setRecentMemories] = useState([]);
  const [currentPageContext, setCurrentPageContext] = useState(null);
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [moodSummary, setMoodSummary] = useState(null);
  const [goalInsights, setGoalInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    loadData();
    // Load theme from storage
    chrome.storage.sync.get(['theme'], (result) => {
      if (result.theme) {
        setTheme(result.theme);
        document.documentElement.setAttribute('data-theme', result.theme);
      }
    });
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Get stats
    chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
      if (response?.stats) {
        setStats(response.stats);
      }
    });

    // Get recent memories
    chrome.runtime.sendMessage({ 
      type: 'GET_MEMORIES',
      data: { limit: 10 }
    }, (response) => {
      if (response?.memories) {
        setRecentMemories(response.memories.slice(0, 5));
      }
    });

    // Get latest personality snapshot
    chrome.runtime.sendMessage({ type: 'GET_PERSONALITY_SNAPSHOTS', data: { limit: 1 } }, (response) => {
      if (response?.snapshots && response.snapshots.length > 0) {
        setLatestSnapshot(response.snapshots[0]);
      }
    });

    // Get mood summary
    chrome.runtime.sendMessage({ type: 'GET_MOOD_SUMMARY' }, (response) => {
      if (response?.moodSummary) {
        setMoodSummary(response.moodSummary);
      }
    });

    // Get goal insights
    chrome.runtime.sendMessage({ type: 'GET_GOAL_INSIGHTS' }, (response) => {
      if (response?.insights) {
        setGoalInsights(response.insights);
      }
    });

    // Get current page context
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.runtime.sendMessage({
          type: 'GET_PREVIOUS_CONTEXT',
          url: tabs[0].url
        }, (response) => {
          if (response?.context) {
            setCurrentPageContext(response.context);
          }
          setLoading(false);
        });
      }
    });
  };

  const openDashboard = () => {
    chrome.runtime.openOptionsPage();
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😔'
    };
    return emojis[mood] || '🤔';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    chrome.storage.sync.set({ theme: newTheme });
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading-state">
          <Sparkles className="loading-icon" />
          <p>Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="popup-header">
        <div className="header-title">
          <span className="header-icon">✨</span>
          <h1>SupriAI</h1>
        </div>
        <div className="header-right">
          <p className="header-subtitle">Your AI Mirror</p>
          <button className="theme-toggle-small" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'persona' ? 'active' : ''}`}
          onClick={() => setActiveTab('persona')}
        >
          Persona
        </button>
        <button 
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          This Page
        </button>
      </div>

      {/* Content */}
      <div className="popup-content">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <MapPin size={20} />
                  <div className="stat-value">{stats.totalVisits}</div>
                  <div className="stat-label">Sites Visited</div>
                </div>
                <div className="stat-card">
                  <Clock size={20} />
                  <div className="stat-value">{formatTime(stats.totalTimeSpent)}</div>
                  <div className="stat-label">Time Tracked</div>
                </div>
                <div className="stat-card">
                  <Sparkles size={20} />
                  <div className="stat-value">{stats.totalHighlights}</div>
                  <div className="stat-label">Highlights</div>
                </div>
                <div className="stat-card">
                  <TrendingUp size={20} />
                  <div className="stat-value">{stats.thisWeekVisits}</div>
                  <div className="stat-label">This Week</div>
                </div>
              </div>
            )}

            {/* Recent Memories */}
            <div className="section">
              <div className="section-header">
                <Calendar size={18} />
                <h3>Recent Memories</h3>
              </div>
              <div className="memory-list">
                {recentMemories.length > 0 ? (
                  recentMemories.map((memory, idx) => (
                    <div key={idx} className="memory-item" onClick={() => window.open(memory.url, '_blank')}>
                      <div className="memory-title">{memory.title}</div>
                      <div className="memory-meta">
                        <span>{formatDate(memory.lastVisit)}</span>
                        <span>•</span>
                        <span>{memory.visits} visits</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No memories yet. Start browsing!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'persona' && (
          <>
            {/* Latest Snapshot */}
            {latestSnapshot && (
              <div className="section">
                <div className="section-header">
                  <User size={18} />
                  <h3>This Week's Vibe</h3>
                </div>
                <div className="persona-card">
                  <div className="persona-tone">
                    <span className="persona-label">Tone</span>
                    <span className="persona-value">{latestSnapshot.tone}</span>
                  </div>
                  {latestSnapshot.quoteOfWeek && (
                    <div className="persona-quote">
                      <Sparkles size={14} />
                      "{latestSnapshot.quoteOfWeek}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mood Summary */}
            {moodSummary && (
              <div className="section">
                <div className="section-header">
                  <Heart size={18} />
                  <h3>Weekly Mood</h3>
                </div>
                <div className="mood-card">
                  <div className="mood-display">
                    <span className="mood-emoji">{getMoodEmoji(moodSummary.dominantMood)}</span>
                    <span className="mood-label">Mostly {moodSummary.dominantMood}</span>
                  </div>
                  <div className="mood-breakdown">
                    <span>😊 {moodSummary.positive || 0}</span>
                    <span>😐 {moodSummary.neutral || 0}</span>
                    <span>😔 {moodSummary.negative || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Goal Progress */}
            {goalInsights && goalInsights.activeGoals > 0 && (
              <div className="section">
                <div className="section-header">
                  <Target size={18} />
                  <h3>Goal Alignment</h3>
                </div>
                <div className="goals-card">
                  <div className="goal-stat">
                    <span className="goal-label">Alignment Rate</span>
                    <span className="goal-value">{goalInsights.alignmentRate}%</span>
                  </div>
                  <div className="goal-stat">
                    <span className="goal-label">Active Goals</span>
                    <span className="goal-value">{goalInsights.activeGoals}</span>
                  </div>
                </div>
              </div>
            )}

            {!latestSnapshot && !moodSummary && !goalInsights && (
              <div className="empty-state">
                <User size={32} />
                <p>Keep browsing to build your persona!</p>
                <p className="empty-state-sub">Your first snapshot will appear soon</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'current' && (
          <div className="section">
            {currentPageContext ? (
              <>
                <div className="context-card">
                  <div className="context-header">
                    <Sparkles size={20} />
                    <h3>Memory Recall</h3>
                  </div>
                  
                  <div className="context-stats">
                    <div className="context-stat">
                      <span className="context-label">Visits</span>
                      <span className="context-value">{currentPageContext.visits}</span>
                    </div>
                    <div className="context-stat">
                      <span className="context-label">Time Spent</span>
                      <span className="context-value">{formatTime(currentPageContext.totalTimeSpent)}</span>
                    </div>
                  </div>

                  {currentPageContext.lastVisit && (
                    <p className="context-info">
                      Last visit: <strong>{formatDate(currentPageContext.lastVisit)}</strong>
                    </p>
                  )}

                  {currentPageContext.summary && (
                    <div className="context-summary">
                      <div className="summary-label">AI Summary</div>
                      <p>{currentPageContext.summary}</p>
                    </div>
                  )}

                  {currentPageContext.highlights && currentPageContext.highlights.length > 0 && (
                    <div className="highlights-section">
                      <div className="highlights-label">Your Highlights</div>
                      {currentPageContext.highlights.slice(0, 3).map((highlight, idx) => (
                        <div key={idx} className="highlight-item">
                          "{highlight.text.substring(0, 100)}..."
                        </div>
                      ))}
                    </div>
                  )}

                  {currentPageContext.tags && currentPageContext.tags.length > 0 && (
                    <div className="tags-section">
                      {currentPageContext.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Sparkles size={32} />
                <p>First time here!</p>
                <p className="empty-state-sub">EchoLens is now capturing context...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="popup-footer">
        <button className="dashboard-button" onClick={openDashboard}>
          <Search size={16} />
          Open Dashboard
        </button>
      </div>
    </div>
  );
};

export default Popup;
