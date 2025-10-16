import React, { useState, useEffect } from 'react';
import {
  RiTrophyLine,
  RiFireLine,
  RiStarLine,
  RiTargetLine,
  RiLockLine,
  RiCheckLine,
  RiFlashlightLine,
  RiMedalLine,
  RiAwardLine
} from '@remixicon/react';

const AchievementsDashboard = () => {
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, earned, locked
  const [sortBy, setSortBy] = useState('recent'); // recent, rarity, name

  useEffect(() => {
    loadAchievementsData();
  }, []);

  const loadAchievementsData = async () => {
    try {
      // Get achievements
      const achievementsResponse = await chrome.runtime.sendMessage({
        type: 'GET_ACHIEVEMENTS'
      });

      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.achievements || []);
      }

      // Get current streak
      const streakResponse = await chrome.runtime.sendMessage({
        type: 'GET_CURRENT_STREAK'
      });

      if (streakResponse.success) {
        setStreak(streakResponse.streak);
      }

      // Get user level
      const levelResponse = await chrome.runtime.sendMessage({
        type: 'GET_USER_LEVEL'
      });

      if (levelResponse.success) {
        setUserLevel(levelResponse.level);
      }

      // Get weekly challenges
      const challengesResponse = await chrome.runtime.sendMessage({
        type: 'GET_WEEKLY_CHALLENGES'
      });

      if (challengesResponse.success) {
        setChallenges(challengesResponse.challenges || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load achievements data:', error);
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6b7280',
      rare: '#3b82f6',
      epic: '#8b5cf6',
      legendary: '#f59e0b'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBadge = (rarity) => {
    const badges = {
      common: '⚪',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡'
    };
    return badges[rarity] || badges.common;
  };

  const getChallengeProgress = (challenge) => {
    if (!challenge.target) return 0;
    return Math.min((challenge.current / challenge.target) * 100, 100);
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getFilteredAchievements = () => {
    let filtered = achievements;
    
    // Apply filter
    if (filter === 'earned') {
      filtered = filtered.filter(a => a.earned);
    } else if (filter === 'locked') {
      filtered = filtered.filter(a => !a.earned);
    }
    
    // Apply sort
    if (sortBy === 'rarity') {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      filtered = [...filtered].sort((a, b) => 
        (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4)
      );
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'recent') {
      filtered = [...filtered].sort((a, b) => {
        if (a.earned && b.earned) return (b.earnedAt || 0) - (a.earnedAt || 0);
        if (a.earned) return -1;
        if (b.earned) return 1;
        return 0;
      });
    }
    
    return filtered;
  };

  const getAchievementStats = () => {
    const total = achievements.length;
    const earned = achievements.filter(a => a.earned).length;
    const legendary = achievements.filter(a => a.earned && a.rarity === 'legendary').length;
    const totalXP = achievements.filter(a => a.earned).reduce((sum, a) => sum + (a.xpReward || 0), 0);
    
    return { total, earned, legendary, totalXP };
  };

  if (loading) {
    return (
      <div className="achievements-dashboard loading">
        <div className="loading-container">
          <RiTrophyLine size={48} className="loading-icon" />
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  const filteredAchievements = getFilteredAchievements();
  const stats = getAchievementStats();
  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="achievements-dashboard">
      {/* Header with Level & Streak */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2><RiTrophyLine size={28} /> Achievements & Progress</h2>
          <p className="subtitle">Track your milestones, challenges, and growth journey</p>
        </div>
        
        <div className="header-stats">
          {userLevel && (
            <div className="level-badge">
              <div className="level-icon"><RiStarLine size={24} /></div>
              <div className="level-info">
                <span className="level-label">Level {userLevel.level}</span>
                <span className="level-title">{userLevel.title}</span>
                <div className="level-progress">
                  <div 
                    className="level-progress-fill" 
                    style={{ width: `${userLevel.progressToNext || 0}%` }}
                  ></div>
                </div>
                <span className="level-xp">
                  {userLevel.currentXP || 0} / {userLevel.nextLevelXP || 100} XP
                </span>
              </div>
            </div>
          )}

          {streak && streak.count > 0 && (
            <div className="streak-badge">
              <div className="streak-icon"><RiFireLine size={32} /></div>
              <div className="streak-info">
                <span className="streak-count">{streak.count}</span>
                <span className="streak-label">Day Streak</span>
                <span className="streak-subtitle">Keep it going! 🔥</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Statistics Overview */}
      <div className="achievement-stats-section">
        <h3><RiMedalLine size={20} /> Your Achievement Stats</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><RiTrophyLine size={24} /></div>
            <div className="stat-content">
              <div className="stat-value">{stats.earned}</div>
              <div className="stat-label">Achievements Unlocked</div>
              <div className="stat-subtext">out of {stats.total} total</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#f59e0b' }}>
              <RiAwardLine size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.legendary}</div>
              <div className="stat-label">Legendary Unlocked</div>
              <div className="stat-subtext">Rarest achievements</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#10b981' }}>
              <RiFlashlightLine size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalXP.toLocaleString()}</div>
              <div className="stat-label">Total XP Earned</div>
              <div className="stat-subtext">From achievements</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#8b5cf6' }}>
              <RiTargetLine size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{Math.round((stats.earned / stats.total) * 100) || 0}%</div>
              <div className="stat-label">Completion Rate</div>
              <div className="stat-subtext">Overall progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Challenges */}
      {challenges.length > 0 && (
        <div className="challenges-section">
          <h3><RiTargetLine size={20} /> Weekly Challenges</h3>
          <p className="section-description">Complete these challenges to earn bonus XP and unlock achievements faster!</p>
          <div className="challenges-grid">
            {challenges.map((challenge, index) => {
              const progress = getChallengeProgress(challenge);
              const isComplete = challenge.completed;

              return (
                <div 
                  key={index} 
                  className={`challenge-card ${isComplete ? 'completed' : ''}`}
                >
                  <div className="challenge-header">
                    <span className="challenge-icon">{challenge.icon || '🎯'}</span>
                    <div className="challenge-info">
                      <h4>{challenge.title}</h4>
                      <p>{challenge.description}</p>
                    </div>
                    {isComplete && (
                      <div className="challenge-complete-badge">
                        <RiCheckLine size={20} />
                      </div>
                    )}
                  </div>

                  <div className="challenge-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progress}%`,
                          background: isComplete 
                            ? 'linear-gradient(90deg, #10b981, #059669)' 
                            : 'linear-gradient(90deg, #6366f1, #3b82f6)'
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {challenge.current} / {challenge.target}
                    </span>
                  </div>

                  <div className="challenge-footer">
                    <div className="challenge-reward">
                      <RiFlashlightLine size={16} />
                      <span>{challenge.reward} XP</span>
                    </div>
                    {!isComplete && progress > 0 && (
                      <span className="challenge-remaining">
                        {challenge.target - challenge.current} to go!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="achievements-controls">
        <div className="filter-group">
          <label>Filter:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({achievements.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'earned' ? 'active' : ''}`}
              onClick={() => setFilter('earned')}
            >
              Unlocked ({earnedAchievements.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
              onClick={() => setFilter('locked')}
            >
              Locked ({lockedAchievements.length})
            </button>
          </div>
        </div>

        <div className="sort-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="recent">Recently Earned</option>
            <option value="rarity">Rarity</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="achievements-section">
          <h3>
            <RiAwardLine size={20} />
            {filter === 'all' ? 'All Achievements' : 
             filter === 'earned' ? 'Unlocked Achievements' : 
             'Locked Achievements'}
            <span className="achievement-count">({filteredAchievements.length})</span>
          </h3>
          <div className="achievements-grid">
            {filteredAchievements.map((achievement) => {
              const isEarned = achievement.earned;
              
              return (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${isEarned ? 'earned' : 'locked'}`}
                  style={{ 
                    borderColor: isEarned ? getRarityColor(achievement.rarity) : '#4b5563' 
                  }}
                >
                  <div className="achievement-icon-wrapper">
                    <div className="achievement-icon">
                      {isEarned ? achievement.icon : <RiLockLine size={32} />}
                    </div>
                    <span className="rarity-badge" style={{ 
                      background: isEarned ? getRarityColor(achievement.rarity) : '#6b7280' 
                    }}>
                      {getRarityBadge(achievement.rarity)} {achievement.rarity}
                    </span>
                  </div>
                  
                  <div className="achievement-content">
                    <div className="achievement-header">
                      <h4>{achievement.name}</h4>
                    </div>
                    <p className="achievement-description">{achievement.description}</p>
                    
                    {isEarned && achievement.earnedAt && (
                      <div className="achievement-earned">
                        <RiCheckLine size={16} />
                        <span className="earned-time">
                          Unlocked {formatTimeAgo(achievement.earnedAt)}
                        </span>
                      </div>
                    )}

                    {!isEarned && achievement.progress !== undefined && (
                      <div className="achievement-progress">
                        <div className="progress-bar small">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${achievement.progress}%`,
                              background: '#6366f1'
                            }}
                          ></div>
                        </div>
                        <span className="progress-percent">{achievement.progress}% Complete</span>
                      </div>
                    )}

                    {achievement.xpReward && (
                      <div className={`achievement-reward ${!isEarned ? 'locked-reward' : ''}`}>
                        <RiFlashlightLine size={14} />
                        <span>{isEarned ? 'Earned' : 'Reward'}: {achievement.xpReward} XP</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="no-results">
          <RiTrophyLine size={48} />
          <h3>No achievements found</h3>
          <p>Try adjusting your filters or complete more activities to unlock achievements!</p>
        </div>
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><RiTrophyLine size={64} /></div>
          <h3>No Achievements Yet</h3>
          <p>Start using SupriAI to unlock achievements and earn rewards!</p>
          <div className="empty-tips">
            <h4>Ways to Earn Achievements:</h4>
            <ul>
              <li>🎯 Complete daily challenges</li>
              <li>📚 Track your learning progress</li>
              <li>🔥 Maintain your streak</li>
              <li>🌟 Level up by earning XP</li>
              <li>💪 Explore new skills and topics</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsDashboard;
