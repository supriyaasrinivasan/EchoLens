import React from 'react';
import { RiSparklingLine } from '@remixicon/react';

const KnowledgeMapFallback = ({ memories }) => {
  // Group memories by tags
  const tagGroups = React.useMemo(() => {
    const groups = {};
    
    memories.forEach(memory => {
      memory.tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = [];
        }
        groups[tag].push(memory);
      });
    });
    
    return Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 20); // Top 20 tags
  }, [memories]);

  const getColorByActivity = (memory) => {
    const daysSinceVisit = (Date.now() - memory.lastVisit) / (1000 * 60 * 60 * 24);
    
    if (daysSinceVisit < 1) return '#6366f1';
    if (daysSinceVisit < 7) return '#3b82f6';
    if (daysSinceVisit < 30) return '#06b6d4';
    return '#64748b';
  };

  if (memories.length === 0) {
    return (
      <div className="empty-map">
        <div className="empty-icon">🌌</div>
        <h3>No memories to map yet</h3>
        <p>Start browsing to see your knowledge constellation</p>
      </div>
    );
  }

  return (
    <div className="knowledge-map-container">
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{background: '#6366f1'}}></div>
          <span>Recent (Today)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#3b82f6'}}></div>
          <span>This Week</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#06b6d4'}}></div>
          <span>This Month</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#64748b'}}></div>
          <span>Older</span>
        </div>
      </div>

      <div style={{
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        maxHeight: '100%',
        overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <RiSparklingLine size={32} style={{ margin: '0 auto 12px', color: '#6366f1' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Your Knowledge Clusters</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Organized by {tagGroups.length} topics • {memories.length} memories
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {tagGroups.map(([tag, tagMemories]) => (
            <div
              key={tag}
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#6366f1'
                }}>
                  #{tag}
                </h4>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#a5b4fc'
                }}>
                  {tagMemories.length}
                </span>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {tagMemories.slice(0, 3).map((memory, idx) => (
                  <div
                    key={idx}
                    onClick={() => window.open(memory.url, '_blank')}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${getColorByActivity(memory)}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      fontSize: '13px',
                      color: '#f1f5f9',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {memory.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748b',
                      marginTop: '4px'
                    }}>
                      {memory.visits} visits
                    </div>
                  </div>
                ))}
                
                {tagMemories.length > 3 && (
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    marginTop: '4px'
                  }}>
                    +{tagMemories.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeMapFallback;
