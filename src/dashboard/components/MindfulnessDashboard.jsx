import React, { useState, useEffect } from 'react';

const MindfulnessDashboard = () => {
  const [moodTimeline, setMoodTimeline] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [dailyPrompt, setDailyPrompt] = useState(null);
  const [reflectionResponse, setReflectionResponse] = useState('');
  const [mindfulnessScore, setMindfulnessScore] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMindfulnessData();
  }, []);

  const loadMindfulnessData = async () => {
    try {
      // Load mood timeline
      const moodResponse = await chrome.runtime.sendMessage({
        type: 'GET_MOOD_TIMELINE',
        days: 30
      });

      if (moodResponse.success) {
        setMoodTimeline(moodResponse.timeline || []);
      }

      // Load recent focus sessions
      const focusResponse = await chrome.runtime.sendMessage({
        type: 'GET_FOCUS_SESSIONS',
        limit: 10
      });

      if (focusResponse.success) {
        setFocusSessions(focusResponse.sessions || []);
      }

      // Load daily prompt
      const promptResponse = await chrome.runtime.sendMessage({
        type: 'GET_DAILY_PROMPT'
      });

      if (promptResponse.success) {
        setDailyPrompt(promptResponse.prompt);
      }

      // Load mindfulness score
      const scoreResponse = await chrome.runtime.sendMessage({
        type: 'GET_MINDFULNESS_SCORE'
      });

      if (scoreResponse.success) {
        setMindfulnessScore(scoreResponse.score || 0);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load mindfulness data:', error);
      setLoading(false);
    }
  };

  const handleMoodLog = async (mood) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'LOG_MOOD',
        mood
      });

      if (response.success) {
        await loadMindfulnessData();
      }
    } catch (error) {
      console.error('Failed to log mood:', error);
    }
  };

  const handleReflectionSubmit = async () => {
    if (!reflectionResponse.trim() || !dailyPrompt) return;

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_REFLECTION',
        promptId: dailyPrompt.id,
        response: reflectionResponse
      });

      if (response.success) {
        setReflectionResponse('');
        // Show success message
        alert('Reflection saved! 🎉');
      }
    } catch (error) {
      console.error('Failed to save reflection:', error);
    }
  };

  const handleStartFocus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'START_FOCUS_MODE',
        duration: focusDuration * 60 // Convert to seconds
      });

      if (response.success) {
        setFocusMode(true);
      }
    } catch (error) {
      console.error('Failed to start focus mode:', error);
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      'energized': '⚡',
      'happy': '😊',
      'calm': '😌',
      'neutral': '😐',
      'tired': '😴',
      'stressed': '😓',
      'frustrated': '😤'
    };
    return emojis[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    const colors = {
      'energized': '#10b981',
      'happy': '#f59e0b',
      'calm': '#3b82f6',
      'neutral': '#6b7280',
      'tired': '#8b5cf6',
      'stressed': '#ef4444',
      'frustrated': '#f97316'
    };
    return colors[mood] || '#6b7280';
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="mindfulness-dashboard loading">
        <div className="loader"></div>
        <p>Loading mindfulness data...</p>
      </div>
    );
  }

  return (
    <div className="mindfulness-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>🕯️ Mindfulness Center</h2>
          <p className="subtitle">Track your mental well-being and focus</p>
        </div>

        {/* Mindfulness Score */}
        <div className="mindfulness-score-card">
          <div className="score-circle" style={{ borderColor: getScoreColor(mindfulnessScore) }}>
            <span className="score-value">{mindfulnessScore}</span>
            <span className="score-label">Score</span>
          </div>
          <div className="score-info">
            <span className="score-title">Mindfulness Score</span>
            <span className="score-description">
              Based on reflection frequency and focus sessions
            </span>
          </div>
        </div>
      </div>

      {/* Mood Logger */}
      <div className="mood-logger-section">
        <h3>😊 How are you feeling?</h3>
        <div className="mood-buttons">
          {['energized', 'happy', 'calm', 'neutral', 'tired', 'stressed', 'frustrated'].map(mood => (
            <button
              key={mood}
              className="mood-btn"
              onClick={() => handleMoodLog(mood)}
              title={mood.charAt(0).toUpperCase() + mood.slice(1)}
            >
              <span className="mood-emoji">{getMoodEmoji(mood)}</span>
              <span className="mood-label">{mood}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Timeline */}
      {moodTimeline.length > 0 && (
        <div className="mood-timeline-section">
          <h3>🌈 Mood Timeline (Last 30 Days)</h3>
          <div className="mood-timeline">
            {moodTimeline.map((entry, index) => (
              <div 
                key={index} 
                className="mood-entry"
                style={{ background: getMoodColor(entry.mood) }}
                title={`${new Date(entry.timestamp).toLocaleDateString()}: ${entry.mood}`}
              >
                <span className="mood-day">{new Date(entry.timestamp).getDate()}</span>
                <span className="mood-icon">{getMoodEmoji(entry.mood)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Mode Control */}
      <div className="focus-mode-section">
        <h3>🎯 Focus Mode</h3>
        <div className="focus-mode-card">
          {!focusMode ? (
            <>
              <p className="focus-description">
                Activate focus mode to minimize distractions and boost productivity
              </p>
              <div className="focus-duration-selector">
                <label>Duration:</label>
                <div className="duration-buttons">
                  {[15, 25, 45, 60].map(mins => (
                    <button
                      key={mins}
                      className={`duration-btn ${focusDuration === mins ? 'active' : ''}`}
                      onClick={() => setFocusDuration(mins)}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
              <button className="focus-start-btn" onClick={handleStartFocus}>
                <span className="btn-icon">🚀</span>
                Start Focus Session
              </button>
            </>
          ) : (
            <div className="focus-active">
              <div className="focus-active-icon">🎯</div>
              <p>Focus mode is active!</p>
              <p className="focus-active-note">
                Check the extension popup or content pages to see the timer
              </p>
            </div>
          )}
        </div>

        {/* Recent Focus Sessions */}
        {focusSessions.length > 0 && (
          <div className="focus-history">
            <h4>Recent Sessions</h4>
            <div className="focus-sessions-list">
              {focusSessions.slice(0, 5).map((session, index) => (
                <div key={index} className="focus-session-item">
                  <span className="session-icon">
                    {session.completed ? '✓' : '○'}
                  </span>
                  <div className="session-info">
                    <span className="session-duration">
                      {formatDuration(session.duration)}
                    </span>
                    <span className="session-date">
                      {new Date(session.start_time).toLocaleDateString()}
                    </span>
                  </div>
                  {session.completed && (
                    <span className="session-badge completed">Completed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Reflection Prompt */}
      {dailyPrompt && (
        <div className="reflection-section">
          <h3>💭 Daily Reflection</h3>
          <div className="reflection-card">
            <div className="reflection-prompt">
              <p className="prompt-text">{dailyPrompt.prompt}</p>
            </div>
            
            <textarea
              className="reflection-input"
              placeholder="Take a moment to reflect..."
              value={reflectionResponse}
              onChange={(e) => setReflectionResponse(e.target.value)}
              rows={6}
            />

            <button 
              className="reflection-submit-btn"
              onClick={handleReflectionSubmit}
              disabled={!reflectionResponse.trim()}
            >
              <span className="btn-icon">💾</span>
              Save Reflection
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {moodTimeline.length === 0 && focusSessions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🕯️</div>
          <h3>Start Your Mindfulness Journey</h3>
          <p>Log your mood and try a focus session to build healthy habits!</p>
        </div>
      )}
    </div>
  );
};

export default MindfulnessDashboard;
