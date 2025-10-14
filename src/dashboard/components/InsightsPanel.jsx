import React, { useMemo } from 'react';
import { TrendingUp, Sparkles, Link as LinkIcon, Clock } from 'lucide-react';

const InsightsPanel = ({ memories }) => {
  const insights = useMemo(() => {
    if (!memories || memories.length === 0) return null;

    // Calculate trending topics
    const tagFrequency = {};
    memories.forEach(memory => {
      memory.tags?.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Find most visited memories
    const topMemories = [...memories]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // Find recently active memories
    const recentMemories = [...memories]
      .sort((a, b) => b.lastVisit - a.lastVisit)
      .slice(0, 5);

    // Calculate time-based insights
    const totalTime = memories.reduce((sum, m) => sum + (m.totalTimeSpent || 0), 0);
    const avgTime = memories.length > 0 ? totalTime / memories.length : 0;

    // Find related memories (same tags)
    const relatedClusters = {};
    memories.forEach(memory => {
      memory.tags?.forEach(tag => {
        if (!relatedClusters[tag]) {
          relatedClusters[tag] = [];
        }
        relatedClusters[tag].push(memory);
      });
    });

    const topClusters = Object.entries(relatedClusters)
      .filter(([tag, mems]) => mems.length > 1)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([tag, mems]) => ({ tag, count: mems.length }));

    return {
      topTags,
      topMemories,
      recentMemories,
      totalTime,
      avgTime,
      topClusters
    };
  }, [memories]);

  if (!insights) {
    return (
      <div className="insights-panel">
        <h3><Sparkles size={20} /> No insights yet</h3>
        <p>Start browsing to generate AI-powered insights</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="insights-panel">
      <div className="insights-header">
        <Sparkles size={24} />
        <h3>AI-Powered Insights</h3>
      </div>

      {/* Trending Topics */}
      <div className="insight-section">
        <div className="insight-title">
          <TrendingUp size={18} />
          <h4>Trending Topics</h4>
        </div>
        <div className="tag-cloud">
          {insights.topTags.map(({ tag, count }) => (
            <div key={tag} className="trending-tag" style={{ fontSize: `${12 + count * 2}px` }}>
              <span className="tag-name">{tag}</span>
              <span className="tag-badge">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Clusters */}
      {insights.topClusters.length > 0 && (
        <div className="insight-section">
          <div className="insight-title">
            <LinkIcon size={18} />
            <h4>Knowledge Clusters</h4>
          </div>
          <div className="cluster-list">
            {insights.topClusters.map(({ tag, count }) => (
              <div key={tag} className="cluster-item">
                <span className="cluster-tag">{tag}</span>
                <span className="cluster-count">{count} related memories</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Insights */}
      <div className="insight-section">
        <div className="insight-title">
          <Clock size={18} />
          <h4>Time Analysis</h4>
        </div>
        <div className="time-stats">
          <div className="time-stat">
            <span className="time-label">Total Time</span>
            <span className="time-value">{formatTime(insights.totalTime)}</span>
          </div>
          <div className="time-stat">
            <span className="time-label">Avg per Memory</span>
            <span className="time-value">{formatTime(insights.avgTime)}</span>
          </div>
        </div>
      </div>

      {/* Most Visited */}
      <div className="insight-section">
        <div className="insight-title">
          <TrendingUp size={18} />
          <h4>Most Revisited</h4>
        </div>
        <div className="top-list">
          {insights.topMemories.slice(0, 3).map((memory, idx) => (
            <div key={idx} className="top-item" onClick={() => window.open(memory.url, '_blank')}>
              <span className="top-rank">#{idx + 1}</span>
              <div className="top-info">
                <span className="top-title">{memory.title}</span>
                <span className="top-meta">{memory.visits} visits</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
