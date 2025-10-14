import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const MemoryTimeline = ({ memories }) => {
  // Group memories by date
  const groupedMemories = React.useMemo(() => {
    const groups = {};
    
    memories.forEach(memory => {
      const date = new Date(memory.lastVisit);
      const dateKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(memory);
    });

    // Sort by date (newest first)
    return Object.entries(groups).sort((a, b) => {
      return new Date(b[0]) - new Date(a[0]);
    });
  }, [memories]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (memories.length === 0) {
    return (
      <div className="empty-timeline">
        <Calendar size={48} />
        <h3>No memories in this timeframe</h3>
        <p>Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {groupedMemories.map(([date, dayMemories], idx) => (
        <div key={idx} className="timeline-group">
          <div className="timeline-date">
            <Calendar size={20} />
            <h3>{date}</h3>
            <span className="memory-count">{dayMemories.length} memories</span>
          </div>

          <div className="timeline-items">
            {dayMemories.map((memory, midx) => (
              <div key={midx} className="timeline-item" onClick={() => window.open(memory.url, '_blank')}>
                <div className="timeline-time">
                  <Clock size={16} />
                  {formatTime(memory.lastVisit)}
                </div>

                <div className="timeline-content">
                  <h4>{memory.title}</h4>
                  <div className="timeline-meta">
                    <span>{new URL(memory.url).hostname}</span>
                    <span>•</span>
                    <span>{memory.visits} visits</span>
                    {memory.highlights && memory.highlights.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{memory.highlights.length} highlights</span>
                      </>
                    )}
                  </div>

                  {memory.insights?.summary && (
                    <p className="timeline-summary">{memory.insights.summary}</p>
                  )}

                  {memory.tags && memory.tags.length > 0 && (
                    <div className="timeline-tags">
                      {memory.tags.map((tag, tidx) => (
                        <span key={tidx} className="timeline-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryTimeline;
