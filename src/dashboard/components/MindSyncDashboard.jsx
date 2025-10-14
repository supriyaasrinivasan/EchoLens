import React, { useState, useEffect } from 'react';
import { TrendingUp, Heart, Sparkles, Target, Calendar } from 'lucide-react';

const MindSyncDashboard = () => {
  const [trending, setTrending] = useState([]);
  const [moodSummary, setMoodSummary] = useState(null);
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [goalInsights, setGoalInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

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
      setLoading(false);
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
      {latestSnapshot?.quoteOfWeek && (
        <div className="quote-card">
          <Sparkles size={24} className="quote-icon" />
          <p className="quote-text">"{latestSnapshot.quoteOfWeek}"</p>
          <p className="quote-label">Your Quote of the Week</p>
        </div>
      )}

      <div className="mindsync-grid">
        {/* Trending Interests */}
        <div className="mindsync-card trending-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h3>Trending Interests</h3>
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
                      {item.status === 'rising' && (
                        <span className="trend-badge rising">🔥 Rising</span>
                      )}
                    </div>
                  </div>
                  <div className="trending-bar">
                    <div 
                      className={`trending-fill ${item.status}`}
                      style={{ width: `${Math.min(100, (item.count / trending[0]?.count) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Keep browsing to see your trending interests!</p>
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
                <div className="mood-score-label">Overall Sentiment</div>
                <div className="mood-score-bar">
                  <div 
                    className="mood-score-fill"
                    style={{ 
                      width: `${((moodSummary.averageScore + 1) / 2) * 100}%`,
                      backgroundColor: getMoodColor(moodSummary.dominantMood)
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No mood data yet. Keep exploring!</p>
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
                    <span className="stat-value">{goalInsights.mostProgressedGoal.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindSyncDashboard;
