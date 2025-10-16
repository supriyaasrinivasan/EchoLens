import React, { useState, useEffect } from 'react';
import {
  RiBarChartLine,
  RiLineChartLine,
  RiPieChartLine,
  RiTimeLine,
  RiBookOpenLine,
  RiTargetLine,
  RiFlashlightLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCalendarLine,
  RiGlobalLine,
  RiLightbulbLine
} from '@remixicon/react';

const ProgressAnalyticsDashboard = () => {
  const [period, setPeriod] = useState('week'); // week, month, year
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('time'); // time, pages, skills

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

  const getScoreTips = (score) => {
    if (score >= 80) return 'You\'re in the zone! Keep up the excellent focus.';
    if (score >= 60) return 'Good work! Try minimizing distractions for even better focus.';
    if (score >= 40) return 'You\'re making progress. Consider using focus mode to improve.';
    return 'Let\'s work on your focus. Try setting specific learning goals.';
  };

  const getTrendIcon = (change) => {
    if (change > 0) return <RiArrowUpLine size={18} />;
    if (change < 0) return <RiArrowDownLine size={18} />;
    return null;
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
        <div className="loading-container">
          <RiBarChartLine size={48} className="loading-icon" />
          <p>Analyzing your progress...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="empty-state">
          <div className="empty-icon"><RiLineChartLine size={64} /></div>
          <h3>No Analytics Available</h3>
          <p>Start browsing to see your progress analytics!</p>
          <div className="empty-tips">
            <h4>What You'll See Here:</h4>
            <ul>
              <li>📊 Learning time trends</li>
              <li>📚 Pages visited and categories</li>
              <li>🎯 Focus score and productivity</li>
              <li>🚀 Skill growth over time</li>
              <li>💡 Personalized insights</li>
            </ul>
          </div>
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
          <h2><RiBarChartLine size={28} /> Progress Analytics</h2>
          <p className="subtitle">Track your learning evolution and discover patterns in your growth</p>
        </div>

        <div className="period-selector">
          <button 
            className={`period-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            <RiCalendarLine size={16} />
            Week
          </button>
          <button 
            className={`period-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            <RiCalendarLine size={16} />
            Month
          </button>
          <button 
            className={`period-btn ${period === 'year' ? 'active' : ''}`}
            onClick={() => setPeriod('year')}
          >
            <RiCalendarLine size={16} />
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className={`metric-card ${selectedMetric === 'pages' ? 'selected' : ''}`} 
             onClick={() => setSelectedMetric('pages')}>
          <div className="metric-icon"><RiBookOpenLine size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{analytics.totalPages || 0}</span>
            <span className="metric-label">Pages Visited</span>
            {analytics.pagesChange !== undefined && (
              <span className={`metric-change ${analytics.pagesChange >= 0 ? 'positive' : 'negative'}`}>
                {getTrendIcon(analytics.pagesChange)}
                {Math.abs(analytics.pagesChange)}% vs last {period}
              </span>
            )}
          </div>
        </div>

        <div className={`metric-card ${selectedMetric === 'time' ? 'selected' : ''}`}
             onClick={() => setSelectedMetric('time')}>
          <div className="metric-icon"><RiTimeLine size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">
              {formatDuration(analytics.totalTime || 0)}
            </span>
            <span className="metric-label">Time Spent Learning</span>
            {analytics.timeChange !== undefined && (
              <span className={`metric-change ${analytics.timeChange >= 0 ? 'positive' : 'negative'}`}>
                {getTrendIcon(analytics.timeChange)}
                {Math.abs(analytics.timeChange)}% vs last {period}
              </span>
            )}
          </div>
        </div>

        <div className="metric-card focus-score-card">
          <div className="metric-icon"><RiTargetLine size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{analytics.focusScore || 0}</span>
            <span className="metric-label">Focus Score</span>
            <span 
              className="metric-badge"
              style={{ background: getScoreColor(analytics.focusScore) }}
            >
              {getScoreLabel(analytics.focusScore)}
            </span>
            <span className="metric-tip">{getScoreTips(analytics.focusScore)}</span>
          </div>
        </div>

        <div className={`metric-card ${selectedMetric === 'domains' ? 'selected' : ''}`}
             onClick={() => setSelectedMetric('domains')}>
          <div className="metric-icon"><RiGlobalLine size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{analytics.uniqueDomains || 0}</span>
            <span className="metric-label">Unique Domains</span>
            <span className="metric-description">Sources explored</span>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h3><RiLightbulbLine size={20} /> AI-Powered Insights</h3>
          <p className="section-description">Personalized recommendations based on your learning patterns</p>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type || 'info'}`}>
                <div className="insight-icon">{insight.icon || '💡'}</div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.message}</p>
                  {insight.action && (
                    <button className="insight-action-btn">
                      {insight.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="breakdown-section">
          <h3><RiPieChartLine size={20} /> Learning Category Breakdown</h3>
          <p className="section-description">Where you're spending your time</p>
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
          {Object.keys(analytics.categoryBreakdown).length > 5 && (
            <button className="view-all-btn">
              View All {Object.keys(analytics.categoryBreakdown).length} Categories
            </button>
          )}
        </div>
      )}

      {/* Skill Growth */}
      {skillData.length > 0 && (
        <div className="breakdown-section">
          <h3><RiArrowUpLine size={20} /> Skill Growth This {period.charAt(0).toUpperCase() + period.slice(1)}</h3>
          <p className="section-description">Your top improving skills</p>
          <div className="breakdown-list">
            {skillData.map((item, index) => (
              <div key={index} className="breakdown-item skill-item">
                <div className="breakdown-info">
                  <span className="breakdown-rank trophy-rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
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
