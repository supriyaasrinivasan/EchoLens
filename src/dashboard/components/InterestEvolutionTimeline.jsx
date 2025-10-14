import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Zap } from 'lucide-react';

const InterestEvolutionTimeline = () => {
  const [evolution, setEvolution] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Get personality snapshots for the timeline
    chrome.runtime.sendMessage({ type: 'GET_PERSONALITY_SNAPSHOTS', data: { limit: 12 } }, (response) => {
      if (response?.snapshots) {
        setSnapshots(response.snapshots);
        if (response.snapshots.length > 0) {
          setSelectedPeriod(response.snapshots[0]);
        }
      }
    });

    // Get interest evolution data
    chrome.runtime.sendMessage({ type: 'GET_INTEREST_EVOLUTION' }, (response) => {
      if (response?.evolution) {
        setEvolution(response.evolution);
      }
      setLoading(false);
    });
  };

  const getEvolutionByPeriod = () => {
    const grouped = {};
    
    snapshots.forEach(snapshot => {
      const period = new Date(snapshot.weekStart).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!grouped[period]) {
        grouped[period] = {
          period,
          timestamp: snapshot.weekStart,
          topics: snapshot.dominantInterests || [],
          tone: snapshot.tone,
          summary: snapshot.summary
        };
      }
    });

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  };

  const detectInterestChanges = () => {
    const periods = getEvolutionByPeriod();
    const changes = [];

    for (let i = 1; i < periods.length; i++) {
      const prev = periods[i - 1];
      const curr = periods[i];

      const newTopics = curr.topics.filter(t => !prev.topics.includes(t));
      const fadedTopics = prev.topics.filter(t => !curr.topics.includes(t));

      if (newTopics.length > 0 || fadedTopics.length > 0) {
        changes.push({
          period: curr.period,
          timestamp: curr.timestamp,
          new: newTopics,
          faded: fadedTopics,
          continuing: curr.topics.filter(t => prev.topics.includes(t))
        });
      }
    }

    return changes;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Zap size={48} className="loading-icon" />
        <p>Loading your interest evolution...</p>
      </div>
    );
  }

  const periods = getEvolutionByPeriod();
  const changes = detectInterestChanges();

  return (
    <div className="evolution-container">
      <div className="evolution-header">
        <div className="header-content">
          <h2>
            <TrendingUp size={28} />
            Interest Evolution
          </h2>
          <p className="header-subtitle">
            Watch how your curiosity has evolved over time
          </p>
        </div>
      </div>

      {periods.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No Evolution Data Yet</h3>
          <p>Keep browsing and your interest evolution will appear here!</p>
        </div>
      ) : (
        <>
          {/* Visual Timeline */}
          <div className="timeline-visual">
            <div className="timeline-line" />
            
            {periods.map((period, idx) => (
              <div 
                key={idx} 
                className={`timeline-node ${selectedPeriod?.weekStart === snapshots.find(s => 
                  new Date(s.weekStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === period.period
                )?.weekStart ? 'selected' : ''}`}
                onClick={() => {
                  const snapshot = snapshots.find(s => 
                    new Date(s.weekStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === period.period
                  );
                  setSelectedPeriod(snapshot);
                }}
                style={{
                  left: `${(idx / (periods.length - 1)) * 100}%`
                }}
              >
                <div className="node-bubble">
                  {period.topics.map((topic, tidx) => (
                    <div 
                      key={tidx} 
                      className="topic-bubble"
                      style={{
                        animationDelay: `${tidx * 0.2}s`,
                        transform: `translate(${tidx * 15}px, ${tidx * -10}px)`
                      }}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
                <div className="node-label">{period.period}</div>
              </div>
            ))}
          </div>

          {/* Changes Summary */}
          <div className="changes-container">
            <h3>
              <Zap size={20} />
              Interest Shifts
            </h3>
            
            <div className="changes-grid">
              {changes.slice(0, 6).map((change, idx) => (
                <div key={idx} className="change-card">
                  <div className="change-period">{change.period}</div>
                  
                  {change.new.length > 0 && (
                    <div className="change-section new-interests">
                      <div className="change-label">🌱 New</div>
                      <div className="change-topics">
                        {change.new.map((topic, tidx) => (
                          <span key={tidx} className="topic-tag new">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {change.faded.length > 0 && (
                    <div className="change-section faded-interests">
                      <div className="change-label">🍂 Faded</div>
                      <div className="change-topics">
                        {change.faded.map((topic, tidx) => (
                          <span key={tidx} className="topic-tag faded">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {change.continuing.length > 0 && (
                    <div className="change-section continuing-interests">
                      <div className="change-label">🔄 Continuing</div>
                      <div className="change-topics">
                        {change.continuing.slice(0, 3).map((topic, tidx) => (
                          <span key={tidx} className="topic-tag continuing">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Period Detail */}
          {selectedPeriod && (
            <div className="period-detail">
              <h3>
                <Calendar size={20} />
                Week of {new Date(selectedPeriod.weekStart).toLocaleDateString()}
              </h3>
              
              <div className="detail-content">
                <div className="detail-section">
                  <div className="detail-label">Your Tone</div>
                  <div className="detail-value">{selectedPeriod.tone}</div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">Dominant Interests</div>
                  <div className="interest-tags">
                    {selectedPeriod.dominantInterests?.map((interest, idx) => (
                      <span key={idx} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">Summary</div>
                  <p className="detail-summary">{selectedPeriod.summary}</p>
                </div>

                {selectedPeriod.quoteOfWeek && (
                  <div className="detail-section quote-section">
                    <div className="detail-label">Quote of the Week</div>
                    <p className="detail-quote">"{selectedPeriod.quoteOfWeek}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterestEvolutionTimeline;
