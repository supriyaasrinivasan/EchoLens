import React, { useState, useEffect } from 'react';
import { TrendingUp, Heart, Sparkles, Target, Calendar, Brain, Clock, Award, Activity } from 'lucide-react';

const MindSyncDashboard = () => {
  const [trending, setTrending] = useState([]);
  const [moodSummary, setMoodSummary] = useState(null);
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [goalInsights, setGoalInsights] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadData(true);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    // Get interest evolution for trending
    chrome.runtime.sendMessage({ type: 'GET_INTEREST_EVOLUTION' }, (response) => {
      if (response?.evolution) {
        // Get current month's data
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentTrends = response.evolution
          .filter(e => e.period === currentMonth)
          .sort((a, b) => b.trendScore - a.trendScore)
          .slice(0, 8);
        setTrending(currentTrends);
      }
    });

    // Get mood summary
    chrome.runtime.sendMessage({ type: 'GET_MOOD_SUMMARY' }, (response) => {
      if (response?.moodSummary) {
        setMoodSummary(response.moodSummary);
      }
    });

    // Get latest personality snapshot
    chrome.runtime.sendMessage({ type: 'GET_PERSONALITY_SNAPSHOTS', data: { limit: 1 } }, (response) => {
      if (response?.snapshots && response.snapshots.length > 0) {
        setLatestSnapshot(response.snapshots[0]);
      }
    });

    // Get goal insights
    chrome.runtime.sendMessage({ type: 'GET_GOAL_INSIGHTS' }, (response) => {
      if (response?.insights) {
        setGoalInsights(response.insights);
      }
    });

    // Get weekly stats
    chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
      if (response?.stats) {
        setWeeklyStats(response.stats);
      }
      setLoading(false);
      setRefreshing(false);
    });
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😔'
    };
    return emojis[mood] || '🤔';
  };

  const getMoodColor = (mood) => {
    const colors = {
      positive: '#10b981',
      neutral: '#6b7280',
      negative: '#ef4444'
    };
    return colors[mood] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Sparkles size={48} className="loading-icon" />
        <p>Loading your MindSync...</p>
      </div>
    );
  }

  return (
    <div className="mindsync-container">
      {/* Header with Quote of the Week */}
      <div className="mindsync-hero">
        {latestSnapshot?.quoteOfWeek && (
          <div className="quote-card">
            <Sparkles size={24} className="quote-icon" />
            <p className="quote-text">"{latestSnapshot.quoteOfWeek}"</p>
            <p className="quote-label">Your Quote of the Week</p>
          </div>
        )}
        
        {/* Quick Stats Bar */}
        {weeklyStats && (
          <div className="quick-stats">
            <div className="stat-item">
              <Activity size={18} />
              <div className="stat-content">
                <span className="stat-value">{weeklyStats.weeklyVisits || 0}</span>
                <span className="stat-label">Pages This Week</span>
              </div>
            </div>
            <div className="stat-item">
              <Clock size={18} />
              <div className="stat-content">
                <span className="stat-value">{Math.floor((weeklyStats.weeklyTime || 0) / 3600)}h</span>
                <span className="stat-label">Time Spent</span>
              </div>
            </div>
            <div className="stat-item">
              <Brain size={18} />
              <div className="stat-content">
                <span className="stat-value">{weeklyStats.uniqueTopics || 0}</span>
                <span className="stat-label">Topics Explored</span>
              </div>
            </div>
            <div className="stat-item">
              <Award size={18} />
              <div className="stat-content">
                <span className="stat-value">{weeklyStats.highlights || 0}</span>
                <span className="stat-label">Highlights</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mindsync-grid">
        {/* Trending Interests */}
        <div className="mindsync-card trending-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h3>Trending Interests</h3>
            {refreshing && <span className="refreshing-badge">Updating...</span>}
          </div>
          <p className="card-subtitle">What's capturing your attention this month</p>
          
          <div className="trending-list">
            {trending.length > 0 ? (
              trending.map((item, idx) => (
                <div key={idx} className="trending-item">
                  <div className="trending-rank">{idx + 1}</div>
                  <div className="trending-content">
                    <div className="trending-topic">{item.topic}</div>
                    <div className="trending-stats">
                      <span>{item.count} visits</span>
                      {item.totalTime && (
                        <span> • {Math.floor(item.totalTime / 60)}m</span>
                      )}
                      {item.status === 'rising' && (
                        <span className="trend-badge rising">🔥 Rising</span>
                      )}
                      {item.status === 'steady' && (
                        <span className="trend-badge steady">📈 Steady</span>
                      )}
                    </div>
                  </div>
                  <div className="trending-bar">
                    <div 
                      className={`trending-fill ${item.status}`}
                      style={{ width: `${Math.min(100, (item.count / (trending[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <TrendingUp size={48} className="empty-icon" />
                <p>Keep browsing to see your trending interests!</p>
                <small>Trends are updated monthly based on your reading patterns</small>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Mood Summary */}
        <div className="mindsync-card mood-card">
          <div className="card-header">
            <Heart size={24} />
            <h3>Weekly Mood</h3>
          </div>
          <p className="card-subtitle">Your emotional landscape this week</p>

          {moodSummary ? (
            <>
              <div className="mood-dominant">
                <div 
                  className="mood-emoji"
                  style={{ color: getMoodColor(moodSummary.dominantMood) }}
                >
                  {getMoodEmoji(moodSummary.dominantMood)}
                </div>
                <div className="mood-label">
                  Mostly <strong>{moodSummary.dominantMood}</strong>
                </div>
              </div>

              <div className="mood-breakdown">
                <div className="mood-stat">
                  <span className="mood-stat-emoji">😊</span>
                  <span className="mood-stat-label">Positive</span>
                  <span className="mood-stat-value">{moodSummary.positive || 0}</span>
                </div>
                <div className="mood-stat">
                  <span className="mood-stat-emoji">😐</span>
                  <span className="mood-stat-label">Neutral</span>
                  <span className="mood-stat-value">{moodSummary.neutral || 0}</span>
                </div>
                <div className="mood-stat">
                  <span className="mood-stat-emoji">😔</span>
                  <span className="mood-stat-label">Negative</span>
                  <span className="mood-stat-value">{moodSummary.negative || 0}</span>
                </div>
              </div>

              <div className="mood-score">
                <div className="mood-score-label">Overall Sentiment Score</div>
                <div className="mood-score-bar">
                  <div 
                    className="mood-score-fill"
                    style={{ 
                      width: `${((moodSummary.averageScore + 1) / 2) * 100}%`,
                      backgroundColor: getMoodColor(moodSummary.dominantMood)
                    }}
                  />
                </div>
                <div className="mood-score-text">
                  {moodSummary.averageScore > 0.3 ? 'Positive' : moodSummary.averageScore < -0.3 ? 'Negative' : 'Balanced'}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Heart size={48} className="empty-icon" />
              <p>No mood data yet. Keep exploring!</p>
              <small>Your emotional themes are tracked as you browse</small>
            </div>
          )}
        </div>

        {/* Latest Snapshot Summary */}
        {latestSnapshot && (
          <div className="mindsync-card snapshot-card">
            <div className="card-header">
              <Calendar size={24} />
              <h3>This Week's Vibe</h3>
            </div>
            <p className="card-subtitle">
              {new Date(latestSnapshot.weekStart).toLocaleDateString()} - {new Date(latestSnapshot.weekEnd).toLocaleDateString()}
            </p>

            <div className="snapshot-content">
              <div className="snapshot-section">
                <div className="snapshot-label">Your Tone</div>
                <div className="snapshot-value tone-value">{latestSnapshot.tone}</div>
              </div>

              <div className="snapshot-section">
                <div className="snapshot-label">Emotional Themes</div>
                <div className="emotion-tags">
                  {latestSnapshot.emotionalThemes.map((emotion, idx) => (
                    <span key={idx} className="emotion-tag">{emotion}</span>
                  ))}
                </div>
              </div>

              <div className="snapshot-section">
                <div className="snapshot-label">Summary</div>
                <p className="snapshot-summary">{latestSnapshot.summary}</p>
              </div>

              <div className="snapshot-stats">
                <div className="snapshot-stat">
                  <span className="stat-value">{latestSnapshot.totalVisits}</span>
                  <span className="stat-label">Pages</span>
                </div>
                <div className="snapshot-stat">
                  <span className="stat-value">{Math.floor(latestSnapshot.totalTimeSpent / 3600)}h</span>
                  <span className="stat-label">Time</span>
                </div>
                <div className="snapshot-stat">
                  <span className="stat-value">{latestSnapshot.totalHighlights}</span>
                  <span className="stat-label">Highlights</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Alignment Insights */}
        {goalInsights && (
          <div className="mindsync-card goals-card">
            <div className="card-header">
              <Target size={24} />
              <h3>Goal Alignment</h3>
            </div>
            <p className="card-subtitle">How you're doing with your goals</p>

            <div className="goals-content">
              <div className="alignment-circle">
                <svg viewBox="0 0 100 100" className="alignment-svg">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - goalInsights.alignmentRate / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="alignment-percentage">
                  {goalInsights.alignmentRate}%
                </div>
              </div>

              <div className="alignment-stats">
                <div className="alignment-stat">
                  <span className="stat-label">Aligned Time</span>
                  <span className="stat-value">{goalInsights.totalAlignedHours}h / {goalInsights.totalHours}h</span>
                </div>
                <div className="alignment-stat">
                  <span className="stat-label">Active Goals</span>
                  <span className="stat-value">{goalInsights.activeGoals}</span>
                </div>
                {goalInsights.mostProgressedGoal && (
                  <div className="alignment-stat">
                    <span className="stat-label">Top Progress</span>
                    <span className="stat-value goal-highlight">{goalInsights.mostProgressedGoal.title}</span>
                  </div>
                )}
              </div>

              {goalInsights.alignmentRate < 50 && (
                <div className="alignment-suggestion">
                  <p>💡 Tip: Try focusing more on your active goals to improve alignment!</p>
                </div>
              )}
              {goalInsights.alignmentRate >= 80 && (
                <div className="alignment-celebration">
                  <p>🎉 Amazing! You're staying well-aligned with your goals!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Insights Summary */}
      <div className="insights-summary">
        <h3>
          <Brain size={20} />
          Weekly Insights
        </h3>
        <div className="insights-grid">
          {latestSnapshot && (
            <div className="insight-card">
              <div className="insight-icon">📚</div>
              <div className="insight-content">
                <h4>Reading Habits</h4>
                <p>{latestSnapshot.readingHabits || 'Developing your reading patterns'}</p>
              </div>
            </div>
          )}
          {moodSummary && (
            <div className="insight-card">
              <div className="insight-icon">💭</div>
              <div className="insight-content">
                <h4>Emotional Balance</h4>
                <p>
                  {moodSummary.averageScore > 0.3 
                    ? "You've been exploring uplifting and positive content"
                    : moodSummary.averageScore < -0.3 
                    ? "Consider balancing with some lighter topics"
                    : "You're maintaining a balanced emotional reading diet"}
                </p>
              </div>
            </div>
          )}
          {trending.length > 0 && (
            <div className="insight-card">
              <div className="insight-icon">🔥</div>
              <div className="insight-content">
                <h4>Hot Topic</h4>
                <p>"{trending[0].topic}" is your most explored interest this month</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>🧠 About MindSync</h3>
        <p>
          MindSync gives you a real-time pulse on your digital life. It tracks what's trending in your interests, 
          monitors your emotional themes, and shows how well your browsing aligns with your goals—all in one beautiful dashboard.
        </p>
        <p>
          Think of it as your personal analytics for the mind. Data refreshes automatically, so you always have 
          an up-to-date view of your intellectual and emotional journey.
        </p>
      </div>
    </div>
  );
};

export default MindSyncDashboard;
