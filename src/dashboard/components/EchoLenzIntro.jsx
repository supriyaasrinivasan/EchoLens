import React from 'react';
import { 
  RiMapPinLine, 
  RiListCheck, 
  RiCalendarLine, 
  RiSparklingLine,
  RiEyeLine,
  RiTimeLine,
  RiPriceTag3Line
} from '@remixicon/react';

const EchoLenzIntro = ({ currentView, onViewChange, memories = [] }) => {
  // Safely calculate stats with fallback values
  const stats = {
    totalMemories: Array.isArray(memories) ? memories.length : 0,
    totalVisits: Array.isArray(memories) ? memories.reduce((sum, m) => sum + (m?.visits || 0), 0) : 0,
    totalTags: Array.isArray(memories) ? new Set(memories.flatMap(m => m?.tags || [])).size : 0,
    totalTime: Array.isArray(memories) ? memories.reduce((sum, m) => sum + (m?.totalTimeSpent || 0), 0) : 0
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const views = [
    { id: 'map', icon: RiMapPinLine, label: 'Knowledge Map', description: 'Visual clusters' },
    { id: 'list', icon: RiListCheck, label: 'Memory List', description: 'Detailed cards' },
    { id: 'timeline', icon: RiCalendarLine, label: 'Timeline', description: 'Chronological' },
    { id: 'insights', icon: RiSparklingLine, label: 'AI Insights', description: 'Patterns' }
  ];

  return (
    <div className="echolenz-banner">
      <div className="echolenz-banner-icon">
        <RiEyeLine size={36} />
      </div>
      
      <div className="echolenz-banner-content">
        <h3>
          EchoLenz
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: 'var(--brand-primary)',
            background: 'rgba(99, 102, 241, 0.15)',
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            Memory Explorer
          </span>
        </h3>
        <p>
          Explore your browsing history through multiple lenses. Visualize knowledge clusters, 
          track chronological patterns, and discover AI-powered insights from your digital journey.
        </p>

        <div className="echolenz-stats-row">
          <div className="echolenz-stat-item">
            <div className="echolenz-stat-value">{stats.totalMemories}</div>
            <div className="echolenz-stat-label">Memories</div>
          </div>
          <div className="echolenz-stat-item">
            <div className="echolenz-stat-value">{stats.totalVisits}</div>
            <div className="echolenz-stat-label">Total Visits</div>
          </div>
          <div className="echolenz-stat-item">
            <div className="echolenz-stat-value">{stats.totalTags}</div>
            <div className="echolenz-stat-label">Topics</div>
          </div>
          <div className="echolenz-stat-item">
            <div className="echolenz-stat-value">{formatTime(stats.totalTime)}</div>
            <div className="echolenz-stat-label">Time Tracked</div>
          </div>
        </div>
      </div>

      <div className="echolenz-quick-actions">
        {views.map(view => (
          <button
            key={view.id}
            className={`echolenz-quick-action ${currentView === view.id ? 'active' : ''}`}
            onClick={() => onViewChange(view.id)}
            style={{
              background: currentView === view.id 
                ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' 
                : 'var(--card-bg)',
              color: currentView === view.id ? 'white' : 'var(--text-primary)',
              borderColor: currentView === view.id ? 'transparent' : 'var(--border-secondary)'
            }}
          >
            <view.icon size={16} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{view.label}</span>
              <span style={{ 
                fontSize: '10px', 
                opacity: currentView === view.id ? 0.9 : 0.6,
                fontWeight: '500'
              }}>
                {view.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EchoLenzIntro;
