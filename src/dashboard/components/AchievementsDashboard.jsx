import React, { useState, useEffect } from 'react';

const AchievementsDashboard = () => {
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="achievements-dashboard loading">
        <div className="loader"></div>
        <p>Loading achievements...</p>
      </div>
    );
  }

  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="achievements-dashboard">
      {/* Header with Level & Streak */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>🏆 Achievements</h2>
          <p className="subtitle">Your milestones and progress</p>
        </div>
        
        <div className="header-stats">
          {userLevel && (
            <div className="level-badge">
              <div className="level-icon">🌟</div>
              <div className="level-info">
                <span className="level-label">Level {userLevel.level}</span>
                <span className="level-title">{userLevel.title}</span>
                <div className="level-progress">
                  <div 
                    className="level-progress-fill" 
                    style={{ width: `${userLevel.progressToNext}%` }}
                  ></div>
                </div>
                <span className="level-xp">
                  {userLevel.currentXP} / {userLevel.nextLevelXP} XP
                </span>
              </div>
            </div>
          )}

          {streak && streak.count > 0 && (
            <div className="streak-badge">
              <div className="streak-icon">🔥</div>
              <div className="streak-info">
                <span className="streak-count">{streak.count}</span>
                <span className="streak-label">Day Streak</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Challenges */}
      {challenges.length > 0 && (
        <div className="challenges-section">
          <h3>🎯 Weekly Challenges</h3>
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
                  </div>

                  <div className="challenge-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {challenge.current} / {challenge.target}
                    </span>
                  </div>

                  {isComplete && (
                    <div className="challenge-complete">
                      <span className="check-icon">✓</span>
                      <span>Completed!</span>
                    </div>
                  )}

                  <div className="challenge-reward">
                    <span className="reward-icon">💎</span>
                    <span>{challenge.reward} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="achievements-section">
          <h3>✨ Unlocked ({earnedAchievements.length})</h3>
          <div className="achievements-grid">
            {earnedAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className="achievement-card earned"
                style={{ borderColor: getRarityColor(achievement.rarity) }}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <div className="achievement-header">
                    <h4>{achievement.name}</h4>
                    <span className="rarity-badge">
                      {getRarityBadge(achievement.rarity)}
                    </span>
                  </div>
                  <p className="achievement-description">{achievement.description}</p>
                  
                  {achievement.earnedAt && (
                    <div className="achievement-earned">
                      <span className="earned-icon">🎉</span>
                      <span className="earned-time">
                        Earned {formatTimeAgo(achievement.earnedAt)}
                      </span>
                    </div>
                  )}

                  {achievement.xpReward && (
                    <div className="achievement-reward">
                      +{achievement.xpReward} XP
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="achievements-section">
          <h3>🔒 Locked ({lockedAchievements.length})</h3>
          <div className="achievements-grid">
            {lockedAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className="achievement-card locked"
              >
                <div className="achievement-icon locked-icon">🔒</div>
                <div className="achievement-content">
                  <div className="achievement-header">
                    <h4>{achievement.name}</h4>
                    <span className="rarity-badge">
                      {getRarityBadge(achievement.rarity)}
                    </span>
                  </div>
                  <p className="achievement-description">{achievement.description}</p>
                  
                  {achievement.progress !== undefined && (
                    <div className="achievement-progress">
                      <div className="progress-bar small">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${achievement.progress}%`,
                            background: getRarityColor(achievement.rarity)
                          }}
                        ></div>
                      </div>
                      <span className="progress-percent">{achievement.progress}%</span>
                    </div>
                  )}

                  {achievement.xpReward && (
                    <div className="achievement-reward locked-reward">
                      Reward: {achievement.xpReward} XP
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No Achievements Yet</h3>
          <p>Start using EchoLens to unlock achievements and earn rewards!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsDashboard;
