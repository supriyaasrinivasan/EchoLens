import React, { useState, useEffect } from 'react';
import { User, Calendar, Sparkles, TrendingUp } from 'lucide-react';

const PersonalitySnapshots = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = () => {
    chrome.runtime.sendMessage({ type: 'GET_PERSONALITY_SNAPSHOTS', data: { limit: 20 } }, (response) => {
      if (response?.snapshots) {
        setSnapshots(response.snapshots);
        if (response.snapshots.length > 0) {
          setSelectedSnapshot(response.snapshots[0]);
        }
      }
      setLoading(false);
    });
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <User size={48} className="loading-icon" />
        <p>Loading personality snapshots...</p>
      </div>
    );
  }

  return (
    <div className="personality-container">
      <div className="personality-header">
        <div className="header-content">
          <h2>
            <User size={28} />
            Personality Snapshots
          </h2>
          <p className="header-subtitle">
            Weekly reflections of your digital identity
          </p>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No Snapshots Yet</h3>
          <p>Snapshots are generated weekly. Keep browsing and your first snapshot will appear soon!</p>
        </div>
      ) : (
        <div className="snapshots-layout">
          {/* Timeline List */}
          <div className="snapshots-timeline">
            {snapshots.map((snapshot, idx) => (
              <div
                key={snapshot.id}
                className={`snapshot-item ${selectedSnapshot?.id === snapshot.id ? 'selected' : ''}`}
                onClick={() => setSelectedSnapshot(snapshot)}
              >
                <div className="snapshot-date">
                  <Calendar size={16} />
                  {formatDateRange(snapshot.weekStart, snapshot.weekEnd)}
                </div>
                <div className="snapshot-preview">
                  <div className="snapshot-tone">{snapshot.tone}</div>
                  <div className="snapshot-topics">
                    {snapshot.topTopics.slice(0, 3).map((topic, tidx) => (
                      <span key={tidx} className="topic-bubble">{topic}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Snapshot Detail */}
          {selectedSnapshot && (
            <div className="snapshot-detail">
              <div className="detail-header">
                <h3>{formatDateRange(selectedSnapshot.weekStart, selectedSnapshot.weekEnd)}</h3>
                {selectedSnapshot.quoteOfWeek && (
                  <div className="quote-banner">
                    <Sparkles size={20} />
                    <p className="quote-text">"{selectedSnapshot.quoteOfWeek}"</p>
                  </div>
                )}
              </div>

              <div className="detail-grid">
                <div className="detail-card">
                  <div className="card-label">
                    <User size={18} />
                    Your Tone
                  </div>
                  <div className="card-value tone-value">{selectedSnapshot.tone}</div>
                </div>

                <div className="detail-card">
                  <div className="card-label">
                    <TrendingUp size={18} />
                    Reading Habits
                  </div>
                  <div className="card-value">{selectedSnapshot.readingHabits}</div>
                </div>

                <div className="detail-card stats-card">
                  <div className="card-label">Weekly Stats</div>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{selectedSnapshot.totalVisits}</span>
                      <span className="stat-label">Pages</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{Math.floor(selectedSnapshot.totalTimeSpent / 3600)}h</span>
                      <span className="stat-label">Time</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{selectedSnapshot.totalHighlights}</span>
                      <span className="stat-label">Highlights</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-label">
                  <Sparkles size={18} />
                  Emotional Themes
                </div>
                <div className="emotion-tags">
                  {selectedSnapshot.emotionalThemes.map((emotion, idx) => (
                    <span key={idx} className="emotion-tag">{emotion}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-label">
                  <TrendingUp size={18} />
                  Top Topics
                </div>
                <div className="topics-cloud">
                  {selectedSnapshot.topTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="topic-tag"
                      style={{
                        fontSize: `${1.2 - idx * 0.1}rem`,
                        opacity: 1 - idx * 0.1
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-label">Summary</div>
                <p className="snapshot-summary">{selectedSnapshot.summary}</p>
              </div>

              {selectedSnapshot.dominantInterests.length > 0 && (
                <div className="detail-section">
                  <div className="section-label">Dominant Interests</div>
                  <div className="interest-badges">
                    {selectedSnapshot.dominantInterests.map((interest, idx) => (
                      <div key={idx} className="interest-badge">
                        <span className="badge-rank">#{idx + 1}</span>
                        <span className="badge-name">{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="info-section">
        <h3>🪞 About Personality Snapshots</h3>
        <p>
          Every week, SupriAI analyzes your browsing patterns to create a personality snapshot—a reflection of your interests, 
          tone, and emotional themes. These snapshots help you understand how your digital identity evolves over time.
        </p>
        <p>
          Think of it as "Spotify Wrapped" for your browsing—but available every week, giving you continuous insight into your 
          intellectual and emotional journey.
        </p>
      </div>
    </div>
  );
};

export default PersonalitySnapshots;
