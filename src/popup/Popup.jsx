import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Tag, Sparkles, TrendingUp, Calendar, Search } from 'lucide-react';

const Popup = () => {
  const [stats, setStats] = useState(null);
  const [recentMemories, setRecentMemories] = useState([]);
  const [currentPageContext, setCurrentPageContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
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
          <span className="header-icon">🌌</span>
          <h1>EchoLens</h1>
        </div>
        <p className="header-subtitle">Your Digital Memory</p>
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
          Open Memory Dashboard
        </button>
      </div>
    </div>
  );
};

export default Popup;
