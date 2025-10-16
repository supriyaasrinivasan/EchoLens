import React from 'react';
import { RiTimeLine, RiExternalLinkLine, RiPriceTag3Line, RiSparklingLine } from '@remixicon/react';

const MemoryList = ({ memories }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getDomainIcon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  if (memories.length === 0) {
    return (
      <div className="empty-list">
        <RiSparklingLine size={48} />
        <h3>No memories found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="memory-list-container">
      {memories.map((memory, idx) => (
        <div key={idx} className="memory-card" onClick={() => window.open(memory.url, '_blank')}>
          <div className="memory-card-header">
            <div className="memory-favicon">
              {getDomainIcon(memory.url) ? (
                <img src={getDomainIcon(memory.url)} alt="" />
              ) : (
                <span>🔗</span>
              )}
            </div>
            <div className="memory-card-title">
              <h3>{memory.title}</h3>
              <a href={memory.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                {new URL(memory.url).hostname}
                <RiExternalLinkLine size={14} />
              </a>
            </div>
          </div>

          {memory.insights?.summary && (
            <div className="memory-summary">
              <RiSparklingLine size={14} />
              <p>{memory.insights.summary}</p>
            </div>
          )}

          <div className="memory-card-stats">
            <div className="stat">
              <span className="stat-label">Visits</span>
              <span className="stat-value">{memory.visits}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Time Spent</span>
              <span className="stat-value">{formatTime(memory.totalTimeSpent)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Last Visit</span>
              <span className="stat-value">{formatDate(memory.lastVisit)}</span>
            </div>
          </div>

          {memory.highlights && memory.highlights.length > 0 && (
            <div className="memory-highlights">
              <div className="highlights-label">Highlights ({memory.highlights.length})</div>
              {memory.highlights.slice(0, 2).map((highlight, hidx) => (
                <div key={hidx} className="highlight-preview">
                  "{highlight.text.substring(0, 100)}..."
                </div>
              ))}
            </div>
          )}

          {memory.tags && memory.tags.length > 0 && (
            <div className="memory-tags">
              {memory.tags.map((tag, tidx) => (
                <span key={tidx} className="memory-tag">
                  <RiPriceTag3Line size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MemoryList;
