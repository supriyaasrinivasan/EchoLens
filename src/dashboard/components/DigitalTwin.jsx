import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, TrendingUp, Calendar, Brain } from 'lucide-react';

const DigitalTwin = () => {
  const [twinSummary, setTwinSummary] = useState(null);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    loadTwinData();
    loadComparison();
  }, []);

  const loadTwinData = () => {
    chrome.runtime.sendMessage({ type: 'GET_TWIN_SUMMARY' }, (response) => {
      if (response?.summary) {
        setTwinSummary(response.summary);
      }
    });
  };

  const loadComparison = () => {
    chrome.runtime.sendMessage({ 
      type: 'COMPARE_INTERESTS', 
      data: { days: 90 } 
    }, (response) => {
      if (response?.comparison) {
        setComparison(response.comparison);
      }
    });
  };

  const handleAskTwin = async () => {
    if (!question.trim()) return;

    const userMessage = {
      type: 'user',
      text: question,
      timestamp: Date.now()
    };

    setConversation([...conversation, userMessage]);
    setQuestion('');
    setLoading(true);

    chrome.runtime.sendMessage({ 
      type: 'ASK_TWIN', 
      data: { question: userMessage.text } 
    }, (response) => {
      if (response?.response) {
        const twinMessage = {
          type: 'twin',
          text: response.response.answer,
          confidence: response.response.confidence,
          timestamp: response.response.timestamp
        };
        setConversation(prev => [...prev, twinMessage]);
      }
      setLoading(false);
    });
  };

  const suggestedQuestions = [
    "What topics have I been avoiding lately?",
    "What would I have thought about AI last year?",
    "What are my dominant interests?",
    "How has my curiosity evolved?",
    "What patterns do you see in my browsing?"
  ];

  const getMaturityBadge = (level) => {
    const badges = {
      'low': { emoji: '🌱', label: 'Emerging', color: '#6b7280' },
      'medium': { emoji: '🌿', label: 'Growing', color: '#10b981' },
      'high': { emoji: '🌳', label: 'Mature', color: '#8b5cf6' },
      'very high': { emoji: '🌟', label: 'Advanced', color: '#f59e0b' }
    };
    return badges[level] || badges.low;
  };

  const badge = twinSummary ? getMaturityBadge(twinSummary.maturityLevel) : null;

  return (
    <div className="digital-twin-container">
      <div className="twin-header">
        <div className="header-content">
          <h2>
            <Brain size={28} />
            Your Digital Twin
          </h2>
          <p className="header-subtitle">
            An AI reflection trained on your browsing patterns and interests
          </p>
        </div>
      </div>

      <div className="twin-grid">
        {/* Twin Profile */}
        <div className="twin-card profile-card">
          <div className="card-header">
            <Sparkles size={24} />
            <h3>Twin Profile</h3>
          </div>

          {twinSummary ? (
            <>
              <div className="maturity-badge" style={{ borderColor: badge.color }}>
                <span className="badge-emoji">{badge.emoji}</span>
                <span className="badge-label" style={{ color: badge.color }}>
                  {badge.label}
                </span>
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-label">Data Points</span>
                  <span className="stat-value">{twinSummary.totalDataPoints}</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-label">Profile Age</span>
                  <span className="stat-value">{twinSummary.profileAge} days</span>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-label">Top Interests</div>
                <div className="interest-list">
                  {twinSummary.topInterests.slice(0, 5).map((interest, idx) => (
                    <div key={idx} className="interest-item">
                      <span className="interest-name">{interest.topic}</span>
                      <span className="interest-count">{interest.count} visits</span>
                    </div>
                  ))}
                </div>
              </div>

              {twinSummary.dominantEmotions.length > 0 && (
                <div className="profile-section">
                  <div className="section-label">Dominant Emotions</div>
                  <div className="emotion-tags">
                    {twinSummary.dominantEmotions.map((emotion, idx) => (
                      <span key={idx} className="emotion-tag">{emotion}</span>
                    ))}
                  </div>
                </div>
              )}

              {twinSummary.peakBrowsingHours.length > 0 && (
                <div className="profile-section">
                  <div className="section-label">Peak Browsing Hours</div>
                  <div className="peak-hours">
                    {twinSummary.peakBrowsingHours.map((hour, idx) => (
                      <span key={idx} className="hour-badge">
                        {hour.hour}:00
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <Brain size={48} />
              <p>Your digital twin is learning about you...</p>
              <p className="empty-state-sub">Keep browsing to build your profile!</p>
            </div>
          )}
        </div>

        {/* Interest Comparison */}
        {comparison && (
          <div className="twin-card comparison-card">
            <div className="card-header">
              <TrendingUp size={24} />
              <h3>90-Day Evolution</h3>
            </div>

            {comparison.new.length > 0 && (
              <div className="comparison-section">
                <div className="section-label">🌱 New Interests</div>
                <div className="comparison-tags">
                  {comparison.new.map((topic, idx) => (
                    <span key={idx} className="topic-tag new">{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {comparison.faded.length > 0 && (
              <div className="comparison-section">
                <div className="section-label">🍂 Faded Interests</div>
                <div className="comparison-tags">
                  {comparison.faded.map((topic, idx) => (
                    <span key={idx} className="topic-tag faded">{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {comparison.continuing.length > 0 && (
              <div className="comparison-section">
                <div className="section-label">🔄 Continuing</div>
                <div className="comparison-tags">
                  {comparison.continuing.map((topic, idx) => (
                    <span key={idx} className="topic-tag continuing">{topic}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ask Your Twin */}
        <div className="twin-card chat-card">
          <div className="card-header">
            <MessageCircle size={24} />
            <h3>Ask Your Twin</h3>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {conversation.length === 0 ? (
                <div className="chat-welcome">
                  <Brain size={48} className="welcome-icon" />
                  <p>Ask your digital twin anything about your browsing history!</p>
                  
                  <div className="suggested-questions">
                    <div className="suggested-label">Try asking:</div>
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        className="suggested-question"
                        onClick={() => setQuestion(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                conversation.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.type}`}>
                    <div className="message-content">
                      {msg.text}
                    </div>
                    {msg.confidence && (
                      <div className="message-confidence">
                        Confidence: {msg.confidence}
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="chat-message twin loading">
                  <Sparkles className="loading-icon" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask your twin a question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskTwin()}
              />
              <button
                className="send-button"
                onClick={handleAskTwin}
                disabled={!question.trim() || loading}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>🧠 About Your Digital Twin</h3>
        <p>
          Your Digital Twin is an AI model trained on your unique browsing patterns, interests, and personality traits. 
          It learns from every page you visit, understanding not just what you read, but how you think and what drives your curiosity.
        </p>
        <p>
          The more you browse, the smarter your twin becomes. Eventually, it can help you understand patterns in your behavior, 
          predict your interests, and even remind you of what past-you would have thought about current topics!
        </p>
      </div>
    </div>
  );
};

export default DigitalTwin;
