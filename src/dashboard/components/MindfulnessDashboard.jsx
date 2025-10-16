import React, { useState, useEffect } from 'react';
import {
  RiHeartLine,
  RiMentalHealthLine,
  RiEmotionHappyLine,
  RiEmotionNormalLine,
  RiEmotionUnhappyLine,
  RiTimerLine,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiStopCircleLine,
  RiLightbulbLine,
  RiEditLine,
  RiCalendar2Line,
  RiFireLine,
  RiSparklingLine
} from '@remixicon/react';

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

  const getMoodIcon = (mood) => {
    const icons = {
      'energized': RiSparklingLine,
      'happy': RiEmotionHappyLine,
      'calm': RiMentalHealthLine,
      'neutral': RiEmotionNormalLine,
      'tired': RiTimerLine,
      'stressed': RiEmotionUnhappyLine,
      'frustrated': RiFireLine
    };
    return icons[mood] || RiEmotionNormalLine;
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
        <div className="loading-container">
          <RiMentalHealthLine size={48} className="loading-icon" />
          <p>Loading your mindfulness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mindfulness-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2><RiMentalHealthLine size={28} /> Mindfulness Center</h2>
          <p className="subtitle">Track your mental well-being and emotional journey</p>
        </div>

        {/* Mindfulness Score */}
        <div className="mindfulness-score-card">
          <div className="score-circle" style={{ borderColor: getScoreColor(mindfulnessScore) }}>
            <RiHeartLine size={32} className="score-icon" />
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
        <h3><RiEmotionHappyLine size={20} /> How are you feeling?</h3>
        <p className="section-description">Log your current mood to track emotional patterns over time</p>
        <div className="mood-buttons">
          {['energized', 'happy', 'calm', 'neutral', 'tired', 'stressed', 'frustrated'].map(mood => {
            const MoodIcon = getMoodIcon(mood);
            return (
              <button
                key={mood}
                className="mood-btn"
                onClick={() => handleMoodLog(mood)}
                style={{ '--mood-color': getMoodColor(mood) }}
                title={mood.charAt(0).toUpperCase() + mood.slice(1)}
              >
                <div className="mood-icon-wrapper">
                  <MoodIcon size={28} />
                </div>
                <span className="mood-emoji">{getMoodEmoji(mood)}</span>
                <span className="mood-label">{mood}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood Timeline */}
      {moodTimeline.length > 0 && (
        <div className="mood-timeline-section">
          <h3><RiCalendar2Line size={20} /> Mood Timeline (Last 30 Days)</h3>
          <p className="section-description">Visualize your emotional patterns and trends</p>
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
        <h3><RiTimerLine size={20} /> Focus Mode</h3>
        <div className="focus-mode-card">
          {!focusMode ? (
            <>
              <p className="focus-description">
                <RiPlayCircleLine size={20} className="inline-icon" />
                Activate focus mode to minimize distractions and boost productivity
              </p>
              <div className="focus-duration-selector">
                <label>Session Duration:</label>
                <div className="duration-buttons">
                  {[15, 25, 45, 60].map(mins => (
                    <button
                      key={mins}
                      className={`duration-btn ${focusDuration === mins ? 'active' : ''}`}
                      onClick={() => setFocusDuration(mins)}
                    >
                      <RiTimerLine size={16} />
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
              <button className="focus-start-btn" onClick={handleStartFocus}>
                <RiPlayCircleLine size={20} />
                Start {focusDuration}-Minute Focus Session
              </button>
              <p className="focus-tip">
                💡 Focus sessions help improve your mindfulness score and productivity
              </p>
            </>
          ) : (
            <div className="focus-active">
              <div className="focus-active-icon">
                <RiTimerLine size={48} />
              </div>
              <p className="focus-active-title">Focus mode is active!</p>
              <p className="focus-active-note">
                Check the extension popup or content pages to see the timer and controls
              </p>
              <button className="focus-stop-btn">
                <RiStopCircleLine size={20} />
                End Session
              </button>
            </div>
          )}
        </div>

        {/* Recent Focus Sessions */}
        {focusSessions.length > 0 && (
          <div className="focus-history">
            <h4><RiFireLine size={18} /> Recent Sessions</h4>
            <div className="focus-sessions-list">
              {focusSessions.slice(0, 5).map((session, index) => (
                <div key={index} className="focus-session-item">
                  <span className="session-icon">
                    {session.completed ? <RiTimerLine size={24} className="completed" /> : <RiTimerLine size={24} className="incomplete" />}
                  </span>
                  <div className="session-info">
                    <span className="session-duration">
                      {formatDuration(session.duration)}
                    </span>
                    <span className="session-date">
                      {new Date(session.start_time).toLocaleDateString()} at {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {session.completed && (
                    <span className="session-badge completed">✓ Completed</span>
                  )}
                  {!session.completed && (
                    <span className="session-badge interrupted">Interrupted</span>
                  )}
                </div>
              ))}
            </div>
            {focusSessions.length > 5 && (
              <button className="view-all-sessions-btn">
                View All {focusSessions.length} Sessions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Daily Reflection Prompt */}
      {dailyPrompt && (
        <div className="reflection-section">
          <h3><RiLightbulbLine size={20} /> Daily Reflection</h3>
          <p className="section-description">Take a moment to reflect on your learning journey</p>
          <div className="reflection-card">
            <div className="reflection-prompt">
              <div className="prompt-icon">
                <RiSparklingLine size={32} />
              </div>
              <p className="prompt-text">{dailyPrompt.prompt}</p>
            </div>
            
            <textarea
              className="reflection-input"
              placeholder="Take a moment to reflect... (Your thoughts are private and stored locally)"
              value={reflectionResponse}
              onChange={(e) => setReflectionResponse(e.target.value)}
              rows={6}
            />

            <button 
              className="reflection-submit-btn"
              onClick={handleReflectionSubmit}
              disabled={!reflectionResponse.trim()}
            >
              <RiEditLine size={20} />
              Save Reflection
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {moodTimeline.length === 0 && focusSessions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><RiMentalHealthLine size={64} /></div>
          <h3>Start Your Mindfulness Journey</h3>
          <p>Log your mood and try a focus session to build healthy habits!</p>
          <div className="empty-tips">
            <h4>Ways to Improve Your Mindfulness:</h4>
            <ul>
              <li>🎯 Complete daily focus sessions</li>
              <li>😊 Track your mood regularly</li>
              <li>💭 Write daily reflections</li>
              <li>📊 Review your emotional patterns</li>
              <li>🧘 Practice mindful learning</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindfulnessDashboard;
