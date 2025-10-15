import React from 'react';
import { RiLineChartLine, RiTimeLine, RiSparklingLine, RiMapPinLine } from '@remixicon/react';

const StatsOverview = ({ stats }) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="stats-overview">
      <h3 className="stats-title">Your Memory Stats</h3>
      
      <div className="stat-item">
        <div className="stat-icon">
          <RiMapPinLine size={18} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.totalVisits}</div>
          <div className="stat-label">Sites Remembered</div>
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-icon">
          <RiTimeLine size={18} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{formatTime(stats.totalTimeSpent)}</div>
          <div className="stat-label">Time Tracked</div>
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-icon">
          <RiSparklingLine size={18} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.totalHighlights}</div>
          <div className="stat-label">Highlights Saved</div>
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-icon">
          <RiLineChartLine size={18} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.thisWeekVisits}</div>
          <div className="stat-label">This Week</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
