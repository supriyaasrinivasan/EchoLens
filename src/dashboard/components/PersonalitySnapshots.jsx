import React, { useState, useEffect } from 'react';
import { User, Calendar, Sparkles, TrendingUp, Download, Share2, BarChart } from 'lucide-react';

const PersonalitySnapshots = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // timeline or comparison

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

  const exportSnapshot = (snapshot) => {
    const data = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personality-snapshot-${new Date(snapshot.weekStart).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareSnapshot = (snapshot) => {
    const shareText = `My Weekly Vibe (${formatDateRange(snapshot.weekStart, snapshot.weekEnd)}):\n\nTone: ${snapshot.tone}\nTop Topics: ${snapshot.topTopics.slice(0, 3).join(', ')}\n\n"${snapshot.quoteOfWeek || 'Exploring and learning'}"\n\n#PersonalitySnapshot #SupriAI`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Personality Snapshot',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Snapshot copied to clipboard!');
    }
  };

  const compareSnapshots = () => {
    if (snapshots.length < 2) return null;
    
    const latest = snapshots[0];
    const previous = snapshots[1];
    
    const newTopics = latest.topTopics.filter(t => !previous.topTopics.includes(t));
    const fadedTopics = previous.topTopics.filter(t => !latest.topTopics.includes(t));
    const toneChange = latest.tone !== previous.tone;
    
    return {
      newTopics,
      fadedTopics,
      toneChange,
      latest,
      previous
    };
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
        <div className="header-actions">
          <button 
            className={`view-toggle ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            <Calendar size={16} />
            Timeline
          </button>
          <button 
            className={`view-toggle ${viewMode === 'comparison' ? 'active' : ''}`}
            onClick={() => setViewMode('comparison')}
            disabled={snapshots.length < 2}
          >
            <BarChart size={16} />
            Compare
          </button>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No Snapshots Yet</h3>
          <p>Snapshots are generated weekly. Keep browsing and your first snapshot will appear soon!</p>
          <div className="empty-info">
            <p>📸 Snapshots capture:</p>
            <ul>
              <li>Your reading tone and habits</li>
              <li>Top topics you explored</li>
              <li>Emotional themes in your content</li>
              <li>A personalized weekly quote</li>
            </ul>
          </div>
        </div>
      ) : viewMode === 'comparison' ? (
        (() => {
          const comparison = compareSnapshots();
          return comparison ? (
            <div className="comparison-view">
              <h3>Week-over-Week Changes</h3>
              <div className="comparison-grid">
                <div className="comparison-card">
                  <h4>Latest Week</h4>
                  <p className="date-range">{formatDateRange(comparison.latest.weekStart, comparison.latest.weekEnd)}</p>
                  <div className="comparison-section">
                    <span className="label">Tone:</span>
                    <span className="value">{comparison.latest.tone}</span>
                  </div>
                  <div className="comparison-section">
                    <span className="label">Pages:</span>
                    <span className="value">{comparison.latest.totalVisits}</span>
                  </div>
                  <div className="comparison-section">
                    <span className="label">Time:</span>
                    <span className="value">{Math.floor(comparison.latest.totalTimeSpent / 3600)}h</span>
                  </div>
                </div>
                
                <div className="comparison-divider">
                  <TrendingUp size={24} />
                </div>
                
                <div className="comparison-card">
                  <h4>Previous Week</h4>
                  <p className="date-range">{formatDateRange(comparison.previous.weekStart, comparison.previous.weekEnd)}</p>
                  <div className="comparison-section">
                    <span className="label">Tone:</span>
                    <span className="value">{comparison.previous.tone}</span>
                  </div>
                  <div className="comparison-section">
                    <span className="label">Pages:</span>
                    <span className="value">{comparison.previous.totalVisits}</span>
                  </div>
                  <div className="comparison-section">
                    <span className="label">Time:</span>
                    <span className="value">{Math.floor(comparison.previous.totalTimeSpent / 3600)}h</span>
                  </div>
                </div>
              </div>
              
              {(comparison.newTopics.length > 0 || comparison.fadedTopics.length > 0) && (
                <div className="interest-changes">
                  <h4>Interest Evolution</h4>
                  {comparison.newTopics.length > 0 && (
                    <div className="change-section">
                      <span className="change-label new">🌱 New Interests</span>
                      <div className="topic-tags">
                        {comparison.newTopics.map((topic, idx) => (
                          <span key={idx} className="topic-tag new">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {comparison.fadedTopics.length > 0 && (
                    <div className="change-section">
                      <span className="change-label faded">🍂 Faded Interests</span>
                      <div className="topic-tags">
                        {comparison.fadedTopics.map((topic, idx) => (
                          <span key={idx} className="topic-tag faded">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null;
        })()
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
                {idx === 0 && <div className="latest-badge">Latest</div>}
              </div>
            ))}
          </div>

          {/* Selected Snapshot Detail */}
          {selectedSnapshot && (
            <div className="snapshot-detail">
              <div className="detail-header">
                <div>
                  <h3>{formatDateRange(selectedSnapshot.weekStart, selectedSnapshot.weekEnd)}</h3>
                  {selectedSnapshot.quoteOfWeek && (
                    <div className="quote-banner">
                      <Sparkles size={20} />
                      <p className="quote-text">"{selectedSnapshot.quoteOfWeek}"</p>
                    </div>
                  )}
                </div>
                <div className="detail-actions">
                  <button 
                    className="action-button"
                    onClick={() => exportSnapshot(selectedSnapshot)}
                    title="Export Snapshot"
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => shareSnapshot(selectedSnapshot)}
                    title="Share Snapshot"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
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
                        fontSize: `${1.2 - idx * 0.05}rem`,
                        opacity: 1 - idx * 0.05
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

              {selectedSnapshot.dominantInterests && selectedSnapshot.dominantInterests.length > 0 && (
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
          intellectual and emotional journey. You can export, share, or compare snapshots to see how you've changed.
        </p>
      </div>
    </div>
  );
};

export default PersonalitySnapshots;
