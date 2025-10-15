import React, { useState, useEffect } from 'react';

const ProgressAnalyticsDashboard = () => {
  const [period, setPeriod] = useState('week'); // week, month, year
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      let messageType;
      switch (period) {
        case 'week':
          messageType = 'GET_WEEKLY_ANALYTICS';
          break;
        case 'month':
          messageType = 'GET_MONTHLY_ANALYTICS';
          break;
        case 'year':
          messageType = 'GET_YEARLY_ANALYTICS';
          break;
        default:
          messageType = 'GET_WEEKLY_ANALYTICS';
      }

      const response = await chrome.runtime.sendMessage({ type: messageType });

      if (response.success) {
        setAnalytics(response.analytics);
        setInsights(response.analytics.insights || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const formatCategoryData = () => {
    if (!analytics || !analytics.categoryBreakdown) return [];
    
    const total = Object.values(analytics.categoryBreakdown).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(analytics.categoryBreakdown)
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? (count / total * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const formatSkillData = () => {
    if (!analytics || !analytics.skillGrowth) return [];
    
    return Object.entries(analytics.skillGrowth)
      .map(([skill, xp]) => ({ skill, xp }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="loader"></div>
        <p>Analyzing your progress...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Analytics Available</h3>
          <p>Start browsing to see your progress analytics!</p>
        </div>
      </div>
    );
  }

  const categoryData = formatCategoryData();
  const skillData = formatSkillData();

  return (
    <div className="analytics-dashboard">
      {/* Header with Period Selector */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>📊 Progress Analytics</h2>
          <p className="subtitle">Your learning evolution over time</p>
        </div>

        <div className="period-selector">
          <button 
            className={`period-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`period-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button 
            className={`period-btn ${period === 'year' ? 'active' : ''}`}
            onClick={() => setPeriod('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📚</div>
          <div className="metric-content">
            <span className="metric-value">{analytics.totalPages || 0}</span>
            <span className="metric-label">Pages Visited</span>
            {analytics.pagesChange !== undefined && (
              <span className={`metric-change ${analytics.pagesChange >= 0 ? 'positive' : 'negative'}`}>
                {analytics.pagesChange >= 0 ? '↑' : '↓'} {Math.abs(analytics.pagesChange)}%
              </span>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <span className="metric-value">
              {formatDuration(analytics.totalTime || 0)}
            </span>
            <span className="metric-label">Time Spent</span>
            {analytics.timeChange !== undefined && (
              <span className={`metric-change ${analytics.timeChange >= 0 ? 'positive' : 'negative'}`}>
                {analytics.timeChange >= 0 ? '↑' : '↓'} {Math.abs(analytics.timeChange)}%
              </span>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <span className="metric-value">{analytics.focusScore || 0}</span>
            <span className="metric-label">Focus Score</span>
            <span 
              className="metric-badge"
              style={{ background: getScoreColor(analytics.focusScore) }}
            >
              {getScoreLabel(analytics.focusScore)}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🌐</div>
          <div className="metric-content">
            <span className="metric-value">{analytics.uniqueDomains || 0}</span>
            <span className="metric-label">Unique Domains</span>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h3>💡 Insights</h3>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-icon">{insight.icon || '💡'}</div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="breakdown-section">
          <h3>📂 Category Breakdown</h3>
          <div className="breakdown-list">
            {categoryData.map((item, index) => (
              <div key={index} className="breakdown-item">
                <div className="breakdown-info">
                  <span className="breakdown-rank">#{index + 1}</span>
                  <span className="breakdown-label">{item.category}</span>
                  <span className="breakdown-count">{item.count} pages</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ 
                      width: `${item.percentage}%`,
                      background: `hsl(${250 - index * 30}, 70%, 60%)`
                    }}
                  ></div>
                </div>
                <span className="breakdown-percentage">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Growth */}
      {skillData.length > 0 && (
        <div className="breakdown-section">
          <h3>🚀 Skill Growth</h3>
          <div className="breakdown-list">
            {skillData.map((item, index) => (
              <div key={index} className="breakdown-item">
                <div className="breakdown-info">
                  <span className="breakdown-rank">#{index + 1}</span>
                  <span className="breakdown-label">{item.skill}</span>
                  <span className="breakdown-count">+{item.xp} XP</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill skill-fill" 
                    style={{ 
                      width: `${Math.min((item.xp / skillData[0].xp) * 100, 100)}%`,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Activity Pattern */}
      {analytics.dailyPattern && (
        <div className="pattern-section">
          <h3>📅 Daily Activity Pattern</h3>
          <div className="daily-grid">
            {Object.entries(analytics.dailyPattern).map(([day, count]) => {
              const maxCount = Math.max(...Object.values(analytics.dailyPattern));
              const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={day} className="day-item">
                  <div 
                    className="day-bar"
                    style={{ 
                      height: `${intensity}%`,
                      background: intensity > 0 ? '#6366f1' : '#e5e7eb'
                    }}
                  ></div>
                  <span className="day-label">{day.substring(0, 3)}</span>
                  <span className="day-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Peak Hours */}
      {analytics.peakHours && analytics.peakHours.length > 0 && (
        <div className="peak-hours-section">
          <h3>⏰ Peak Activity Hours</h3>
          <div className="peak-hours-list">
            {analytics.peakHours.slice(0, 3).map((hour, index) => (
              <div key={index} className="peak-hour-item">
                <span className="hour-icon">
                  {hour >= 6 && hour < 12 ? '🌅' : 
                   hour >= 12 && hour < 18 ? '☀️' : 
                   hour >= 18 && hour < 22 ? '🌆' : '🌙'}
                </span>
                <span className="hour-time">
                  {hour}:00 - {hour + 1}:00
                </span>
                <span className="hour-badge">Peak #{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressAnalyticsDashboard;
