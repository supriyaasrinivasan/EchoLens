import React, { useState, useEffect } from 'react';
import {
  RiBookOpenLine,
  RiTimeLine,
  RiFireLine,
  RiBarChartLine,
  RiLightbulbLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiSparklingLine,
  RiTargetLine,
  RiLineChartLine,
  RiCheckLine
} from '@remixicon/react';

const LearningAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [streak, setStreak] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    try {
      // Get learning analytics
      const analyticsResponse = await chrome.runtime.sendMessage({
        type: 'GET_LEARNING_ANALYTICS',
        data: { timeRange }
      });

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.analytics);
      }

      // Get recommendations
      const recsResponse = await chrome.runtime.sendMessage({
        type: 'GET_LEARNING_RECOMMENDATIONS'
      });

      if (recsResponse.success) {
        setRecommendations(recsResponse.recommendations);
      }

      // Get insights
      const insightsResponse = await chrome.runtime.sendMessage({
        type: 'GET_LEARNING_INSIGHTS'
      });

      if (insightsResponse.success) {
        setInsights(insightsResponse.insights);
      }

      // Get streak
      const streakResponse = await chrome.runtime.sendMessage({
        type: 'GET_LEARNING_STREAK'
      });

      if (streakResponse.success) {
        setStreak(streakResponse.streak);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getEngagementColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div className="learning-analytics-loading">
        <RiSparklingLine size={48} className="loading-icon" />
        <p>Analyzing your learning journey...</p>
      </div>
    );
  }

  if (!analytics || !analytics.summary || analytics.summary.totalSessions === 0) {
    return (
      <div className="learning-empty-state">
        <RiBookOpenLine size={72} className="empty-icon" />
        <h3>Start Your AI-Powered Learning Journey</h3>
        <p>Your learning analytics will appear here once you start browsing educational content. The AI will track your progress, provide insights, and recommend personalized learning paths.</p>
        
        <div className="learning-empty-tips">
          <h4>
            <RiLightbulbLine size={18} />
            How Learning Analytics Works
          </h4>
          <ul>
            <li>
              <RiCheckLine size={16} />
              <span><strong>Auto-Detection:</strong> Visit educational sites like MDN, W3Schools, GitHub, YouTube tutorials, and the system automatically tracks your learning</span>
            </li>
            <li>
              <RiCheckLine size={16} />
              <span><strong>Engagement Scoring:</strong> AI analyzes your scroll depth, time spent, and interaction patterns to measure engagement</span>
            </li>
            <li>
              <RiCheckLine size={16} />
              <span><strong>Path Recognition:</strong> The system categorizes content into 10 learning domains (Frontend, Backend, ML/AI, etc.)</span>
            </li>
            <li>
              <RiCheckLine size={16} />
              <span><strong>Smart Insights:</strong> Get AI-powered recommendations based on your learning consistency, focus areas, and timing patterns</span>
            </li>
            <li>
              <RiCheckLine size={16} />
              <span><strong>Streak Tracking:</strong> Build daily learning habits and maintain your learning streak</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-analytics-dashboard">
      {/* Time Range Selector */}
      <div className="learning-time-range">
        <div className="time-range-selector">
          {['today', 'week', 'month', 'all'].map(range => (
            <button
              key={range}
              className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="learning-summary-grid">
        <div className="learning-summary-card">
          <div className="summary-icon-wrapper">
            <RiTimeLine size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-value">{formatTime(analytics.summary.totalTime || 0)}</div>
            <div className="summary-label">Total Learning Time</div>
          </div>
        </div>

        <div className="learning-summary-card">
          <div className="summary-icon-wrapper">
            <RiBookOpenLine size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-value">{analytics.summary.totalSessions || 0}</div>
            <div className="summary-label">Learning Sessions</div>
          </div>
        </div>

        <div className="learning-summary-card">
          <div className="summary-icon-wrapper">
            <RiBarChartLine size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-value">{Math.round(analytics.summary.avgEngagement || 0)}%</div>
            <div className="summary-label">Avg Engagement</div>
          </div>
        </div>

        <div className="learning-summary-card">
          <div className="summary-icon-wrapper">
            <RiFireLine size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-value">{streak}</div>
            <div className="summary-label">Day Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* Top Learning Paths */}
      {analytics.topCategories && analytics.topCategories.length > 0 && (
        <div className="learning-paths-section">
          <h3>
            <RiTargetLine size={20} />
            Top Learning Paths
          </h3>
          
          <div className="learning-paths-list">
            {analytics.topCategories.map((category, index) => (
              <div key={index} className="learning-path-item">
                <div className={`path-rank ${index < 3 ? 'top-rank' : ''}`}>
                  #{index + 1}
                </div>
                <div className="path-info">
                  <h4 className="path-name">{category.name || 'Unknown'}</h4>
                  <div className="path-stats">
                    <div className="path-stat">
                      <RiTimeLine size={14} />
                      <strong>{formatTime(category.time || 0)}</strong>
                    </div>
                    <div className="path-stat">
                      <RiBookOpenLine size={14} />
                      <strong>{category.sessions || 0}</strong> sessions
                    </div>
                  </div>
                </div>
                <div className="path-engagement">
                  <div className="engagement-bar">
                    <div 
                      className="engagement-fill" 
                      style={{ 
                        width: `${category.engagement || 0}%`,
                        background: getEngagementColor(category.engagement || 0)
                      }}
                    />
                  </div>
                  <div className="engagement-score" style={{ color: getEngagementColor(category.engagement || 0) }}>
                    {Math.round(category.engagement || 0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Activity Chart */}
      {analytics.dailyBreakdown && analytics.dailyBreakdown.length > 0 && (
        <div className="activity-chart-section">
          <h3>
            <RiCalendarLine size={20} />
            Daily Activity (Last 7 Days)
          </h3>
          
          <div className="activity-chart-container">
            <div className="chart-wrapper">
              {analytics.dailyBreakdown.slice(0, 7).reverse().map((day, index) => {
                const maxTime = Math.max(...analytics.dailyBreakdown.map(d => d.time || 0));
                const heightPercent = maxTime > 0 ? ((day.time || 0) / maxTime) * 100 : 0;
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className="chart-bar">
                    <div className="bar-container">
                      <div 
                        className={`bar-fill ${day.time === 0 ? 'no-data' : ''}`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        <span className="bar-value">{formatTime(day.time || 0)}</span>
                      </div>
                    </div>
                    <div className={`bar-label ${isToday ? 'today' : ''}`}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="chart-stats">
              <div className="chart-stat-item">
                <div className="chart-stat-value">
                  {analytics.dailyBreakdown[0] ? formatTime(analytics.dailyBreakdown[0].time || 0) : '0m'}
                </div>
                <div className="chart-stat-label">Today</div>
              </div>
              <div className="chart-stat-item">
                <div className="chart-stat-value">
                  {formatTime(Math.max(...analytics.dailyBreakdown.map(d => d.time || 0)))}
                </div>
                <div className="chart-stat-label">Peak Day</div>
              </div>
              <div className="chart-stat-item">
                <div className="chart-stat-value">
                  {formatTime(
                    analytics.dailyBreakdown.reduce((sum, d) => sum + (d.time || 0), 0) / 
                    analytics.dailyBreakdown.length
                  )}
                </div>
                <div className="chart-stat-label">Daily Avg</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <div className="learning-insights-section">
          <h3>
            <RiLightbulbLine size={20} />
            AI-Generated Insights
          </h3>
          
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">
                  {insight.type === 'consistency' && <RiFireLine size={20} />}
                  {insight.type === 'focus' && <RiTargetLine size={20} />}
                  {insight.type === 'timing' && <RiCalendarLine size={20} />}
                  {insight.type === 'strength' && <RiLineChartLine size={20} />}
                </div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>
            <RiSparklingLine size={20} />
            Recommended For You
          </h3>
          
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="recommendation-header">
                  <div className="recommendation-icon">
                    <RiLightbulbLine size={20} />
                  </div>
                  <h4 className="recommendation-title">{rec.title}</h4>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                {rec.reason && (
                  <div className="recommendation-reason">
                    <RiSparklingLine size={14} />
                    <p>{rec.reason}</p>
                  </div>
                )}
                {rec.topics && rec.topics.length > 0 && (
                  <div className="recommendation-topics">
                    {rec.topics.map((topic, idx) => (
                      <span key={idx} className="topic-chip">{topic}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {analytics.recentSessions && analytics.recentSessions.length > 0 && (
        <div className="recent-sessions-section">
          <h3>
            <RiCalendarLine size={20} />
            Recent Learning Sessions
          </h3>
          
          <div className="sessions-list">
            {analytics.recentSessions.slice(0, 5).map((session, index) => {
              const engagementLevel = session.engagement_level || 
                (session.engagement_score >= 80 ? 'high' : 
                 session.engagement_score >= 50 ? 'medium' : 'low');
              
              return (
                <div key={index} className="session-item">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${new URL(session.url).hostname}&sz=32`}
                    alt=""
                    className="session-favicon"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div className="session-details">
                    <h5 className="session-title">{session.title || 'Untitled'}</h5>
                    <div className="session-meta">
                      {session.category && (
                        <span className="session-category">{session.category}</span>
                      )}
                      <div className="session-info-item">
                        <RiTimeLine size={12} />
                        {formatTime(session.time_spent || 0)}
                      </div>
                      <div className="session-info-item">
                        <RiCalendarLine size={12} />
                        {new Date(session.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="session-engagement">
                    <span className={`engagement-badge ${engagementLevel}`}>
                      {engagementLevel}
                    </span>
                    <span className="session-time">
                      {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {analytics.recentSessions.length > 5 && (
            <button className="view-all-sessions">
              <span>View All Sessions</span>
              <RiArrowRightLine size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningAnalyticsDashboard;
