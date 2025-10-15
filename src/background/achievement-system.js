// Achievement & Gamification System for EchoLens
// Badges, streaks, challenges, and rewards

export class AchievementSystem {
  constructor(dbManager) {
    this.db = dbManager;
    this.achievements = this.initializeAchievements();
  }

  // Initialize all available achievements
  initializeAchievements() {
    return {
      // Exploration Achievements
      'first-steps': {
        id: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first browsing session with EchoLens',
        icon: '👣',
        category: 'exploration',
        criteria: { type: 'sessions', count: 1 },
        points: 10
      },
      'curious-mind': {
        id: 'curious-mind',
        name: 'Curious Mind',
        description: 'Visit 50 different pages',
        icon: '🧠',
        category: 'exploration',
        criteria: { type: 'unique_visits', count: 50 },
        points: 50
      },
      'knowledge-seeker': {
        id: 'knowledge-seeker',
        name: 'Knowledge Seeker',
        description: 'Visit 100 different pages',
        icon: '🔍',
        category: 'exploration',
        criteria: { type: 'unique_visits', count: 100 },
        points: 100
      },
      'explorer': {
        id: 'explorer',
        name: 'Explorer',
        description: 'Visit 500 different pages',
        icon: '🗺️',
        category: 'exploration',
        criteria: { type: 'unique_visits', count: 500 },
        points: 250
      },

      // AI & Learning Achievements
      'ai-explorer': {
        id: 'ai-explorer',
        name: 'AI Explorer',
        description: 'Read 10 AI-related pages',
        icon: '🤖',
        category: 'learning',
        criteria: { type: 'skill', skill: 'ai', count: 10 },
        points: 50
      },
      'mind-mapper': {
        id: 'mind-mapper',
        name: 'Mind Mapper',
        description: 'View your knowledge map 10 times',
        icon: '🗺️',
        category: 'reflection',
        criteria: { type: 'feature_usage', feature: 'knowledge_map', count: 10 },
        points: 30
      },
      'polymath': {
        id: 'polymath',
        name: 'Polymath',
        description: 'Explore 5 different skill categories',
        icon: '🎓',
        category: 'learning',
        criteria: { type: 'skill_diversity', count: 5 },
        points: 100
      },

      // Focus & Productivity Achievements
      'focus-master': {
        id: 'focus-master',
        name: 'Focus Master',
        description: 'Complete 10 focused browsing sessions',
        icon: '🎯',
        category: 'productivity',
        criteria: { type: 'focus_sessions', count: 10 },
        points: 75
      },
      'deep-diver': {
        id: 'deep-diver',
        name: 'Deep Diver',
        description: 'Spend 30+ minutes on a single page',
        icon: '🌊',
        category: 'productivity',
        criteria: { type: 'long_session', minutes: 30 },
        points: 40
      },
      'marathon-reader': {
        id: 'marathon-reader',
        name: 'Marathon Reader',
        description: 'Accumulate 10 hours of total reading time',
        icon: '📚',
        category: 'productivity',
        criteria: { type: 'total_time', hours: 10 },
        points: 100
      },

      // Streak Achievements
      'consistency-king': {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Maintain a 7-day browsing streak',
        icon: '👑',
        category: 'streaks',
        criteria: { type: 'daily_streak', days: 7 },
        points: 75
      },
      'unstoppable': {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 30-day browsing streak',
        icon: '🔥',
        category: 'streaks',
        criteria: { type: 'daily_streak', days: 30 },
        points: 200
      },
      'legend': {
        id: 'legend',
        name: 'Legend',
        description: 'Maintain a 100-day browsing streak',
        icon: '⭐',
        category: 'streaks',
        criteria: { type: 'daily_streak', days: 100 },
        points: 500
      },

      // Reflection Achievements
      'reflective-soul': {
        id: 'reflective-soul',
        name: 'Reflective Soul',
        description: 'Create 25 highlights',
        icon: '✨',
        category: 'reflection',
        criteria: { type: 'highlights', count: 25 },
        points: 50
      },
      'wisdom-collector': {
        id: 'wisdom-collector',
        name: 'Wisdom Collector',
        description: 'Create 100 highlights',
        icon: '💎',
        category: 'reflection',
        criteria: { type: 'highlights', count: 100 },
        points: 150
      },
      'tag-master': {
        id: 'tag-master',
        name: 'Tag Master',
        description: 'Create 50 custom tags',
        icon: '🏷️',
        category: 'reflection',
        criteria: { type: 'tags', count: 50 },
        points: 60
      },

      // Goal Achievements
      'goal-setter': {
        id: 'goal-setter',
        name: 'Goal Setter',
        description: 'Create your first browsing goal',
        icon: '🎯',
        category: 'goals',
        criteria: { type: 'goals_created', count: 1 },
        points: 20
      },
      'goal-achiever': {
        id: 'goal-achiever',
        name: 'Goal Achiever',
        description: 'Complete 5 browsing goals',
        icon: '🏆',
        category: 'goals',
        criteria: { type: 'goals_completed', count: 5 },
        points: 100
      },

      // Digital Twin Achievements
      'twin-curious': {
        id: 'twin-curious',
        name: 'Twin Curious',
        description: 'Ask your Digital Twin 10 questions',
        icon: '🤔',
        category: 'twin',
        criteria: { type: 'twin_questions', count: 10 },
        points: 40
      },
      'self-aware': {
        id: 'self-aware',
        name: 'Self Aware',
        description: 'Reach "High Confidence" Digital Twin maturity',
        icon: '🧘',
        category: 'twin',
        criteria: { type: 'twin_maturity', level: 'high' },
        points: 150
      },

      // Special Achievements
      'early-adopter': {
        id: 'early-adopter',
        name: 'Early Adopter',
        description: 'Join EchoLens in its first year',
        icon: '🌟',
        category: 'special',
        criteria: { type: 'join_date', before: '2026-01-01' },
        points: 100
      },
      'completionist': {
        id: 'completionist',
        name: 'Completionist',
        description: 'Unlock all achievements',
        icon: '💯',
        category: 'special',
        criteria: { type: 'all_achievements' },
        points: 1000
      }
    };
  }

  // Check and award achievements
  async checkAchievements(stats) {
    const unlockedAchievements = await this.db.getUnlockedAchievements();
    const unlockedIds = unlockedAchievements.map(a => a.achievement_id);
    const newlyUnlocked = [];

    for (const [id, achievement] of Object.entries(this.achievements)) {
      // Skip if already unlocked
      if (unlockedIds.includes(id)) continue;

      // Check if criteria met
      if (await this.checkCriteria(achievement.criteria, stats)) {
        await this.unlockAchievement(id);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  // Check if achievement criteria is met
  async checkCriteria(criteria, stats) {
    switch (criteria.type) {
      case 'sessions':
        return stats.totalSessions >= criteria.count;
      
      case 'unique_visits':
        return stats.uniquePages >= criteria.count;
      
      case 'skill':
        const skillStats = await this.db.getSkillByName(criteria.skill);
        return skillStats && skillStats.visit_count >= criteria.count;
      
      case 'skill_diversity':
        const skills = await this.db.getSkillStats();
        return skills.length >= criteria.count;
      
      case 'focus_sessions':
        const focusSessions = await this.db.getFocusSessions();
        return focusSessions.length >= criteria.count;
      
      case 'long_session':
        return stats.longestSession >= criteria.minutes * 60 * 1000;
      
      case 'total_time':
        return stats.totalTime >= criteria.hours * 60 * 60 * 1000;
      
      case 'daily_streak':
        const streak = await this.db.getCurrentStreak();
        return streak >= criteria.days;
      
      case 'highlights':
        return stats.totalHighlights >= criteria.count;
      
      case 'tags':
        return stats.totalTags >= criteria.count;
      
      case 'goals_created':
        const goals = await this.db.getGoals();
        return goals.length >= criteria.count;
      
      case 'goals_completed':
        const completedGoals = await this.db.getCompletedGoals();
        return completedGoals.length >= criteria.count;
      
      case 'twin_questions':
        const twinInteractions = await this.db.getTwinInteractions();
        return twinInteractions >= criteria.count;
      
      case 'twin_maturity':
        const twinProfile = await chrome.storage.local.get(['digital_twin_profile']);
        if (!twinProfile.digital_twin_profile) return false;
        const maturity = this.calculateTwinMaturity(twinProfile.digital_twin_profile);
        return maturity === criteria.level;
      
      case 'feature_usage':
        const usage = await this.db.getFeatureUsage(criteria.feature);
        return usage >= criteria.count;
      
      case 'join_date':
        const installDate = await this.db.getInstallDate();
        return new Date(installDate) < new Date(criteria.before);
      
      case 'all_achievements':
        const unlocked = await this.db.getUnlockedAchievements();
        return unlocked.length >= Object.keys(this.achievements).length - 1; // -1 for this achievement itself
      
      default:
        return false;
    }
  }

  // Calculate digital twin maturity level
  calculateTwinMaturity(profile) {
    if (profile.totalDataPoints < 10) return 'low';
    if (profile.totalDataPoints < 50) return 'medium';
    if (profile.totalDataPoints < 200) return 'high';
    return 'very high';
  }

  // Unlock an achievement
  async unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return;

    await this.db.saveAchievement({
      achievement_id: achievementId,
      name: achievement.name,
      icon: achievement.icon,
      points: achievement.points,
      unlocked_at: Date.now()
    });

    // Show notification
    this.showAchievementNotification(achievement);
  }

  // Show achievement notification
  showAchievementNotification(achievement) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icon128.png'),
      title: `🏆 Achievement Unlocked!`,
      message: `${achievement.icon} ${achievement.name}\n${achievement.description}`,
      priority: 2
    });
  }

  // Get all achievements with unlock status
  async getAllAchievements() {
    const unlocked = await this.db.getUnlockedAchievements();
    const unlockedIds = unlocked.map(a => a.achievement_id);

    return Object.values(this.achievements).map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
      unlockedAt: unlocked.find(u => u.achievement_id === achievement.id)?.unlocked_at
    }));
  }

  // Get achievement progress
  async getProgress() {
    const allAchievements = await this.getAllAchievements();
    const unlockedCount = allAchievements.filter(a => a.unlocked).length;
    const totalPoints = allAchievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    const categories = {};
    allAchievements.forEach(achievement => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = { total: 0, unlocked: 0 };
      }
      categories[achievement.category].total++;
      if (achievement.unlocked) {
        categories[achievement.category].unlocked++;
      }
    });

    return {
      totalAchievements: allAchievements.length,
      unlockedAchievements: unlockedCount,
      completionPercentage: Math.round((unlockedCount / allAchievements.length) * 100),
      totalPoints,
      level: this.calculateLevel(totalPoints),
      categories,
      recentUnlocks: allAchievements
        .filter(a => a.unlocked)
        .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
        .slice(0, 5)
    };
  }

  // Calculate user level based on points
  calculateLevel(points) {
    if (points < 100) return { level: 1, name: 'Novice', next: 100 };
    if (points < 300) return { level: 2, name: 'Explorer', next: 300 };
    if (points < 600) return { level: 3, name: 'Seeker', next: 600 };
    if (points < 1000) return { level: 4, name: 'Scholar', next: 1000 };
    if (points < 1500) return { level: 5, name: 'Sage', next: 1500 };
    if (points < 2500) return { level: 6, name: 'Master', next: 2500 };
    return { level: 7, name: 'Legend', next: null };
  }

  // Get current streak
  async getStreak() {
    const currentStreak = await this.db.getCurrentStreak();
    const longestStreak = await this.db.getLongestStreak();
    const lastActiveDate = await this.db.getLastActiveDate();

    return {
      current: currentStreak,
      longest: longestStreak,
      lastActive: lastActiveDate,
      isActive: this.isStreakActive(lastActiveDate)
    };
  }

  // Check if streak is active (browsed today or yesterday)
  isStreakActive(lastActiveDate) {
    const now = new Date();
    const lastActive = new Date(lastActiveDate);
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  }

  // Update daily streak
  async updateStreak() {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActiveDate = await this.db.getLastActiveDate();
    const lastActiveDay = new Date(lastActiveDate).setHours(0, 0, 0, 0);

    if (today === lastActiveDay) {
      // Already counted today
      return;
    }

    const yesterday = today - (24 * 60 * 60 * 1000);
    let currentStreak = await this.db.getCurrentStreak();

    if (lastActiveDay === yesterday) {
      // Streak continues
      currentStreak++;
    } else if (lastActiveDay < yesterday) {
      // Streak broken, restart
      currentStreak = 1;
    }

    // Update streak in database
    await this.db.updateStreak(currentStreak, today);

    // Check if this sets a new longest streak
    const longestStreak = await this.db.getLongestStreak();
    if (currentStreak > longestStreak) {
      await this.db.updateLongestStreak(currentStreak);
    }
  }

  // Get weekly challenges
  getWeeklyChallenges() {
    return [
      {
        id: 'explore-3-topics',
        name: 'Topic Explorer',
        description: 'Explore 3 new topics this week',
        icon: '🔍',
        progress: 0,
        target: 3,
        reward: 50
      },
      {
        id: 'daily-reflection',
        name: 'Daily Reflection',
        description: 'Browse and reflect 5 days this week',
        icon: '📝',
        progress: 0,
        target: 5,
        reward: 75
      },
      {
        id: 'deep-focus',
        name: 'Deep Focus',
        description: 'Complete 3 focused sessions (20+ min)',
        icon: '🎯',
        progress: 0,
        target: 3,
        reward: 60
      },
      {
        id: 'knowledge-collector',
        name: 'Knowledge Collector',
        description: 'Create 10 highlights this week',
        icon: '✨',
        progress: 0,
        target: 10,
        reward: 40
      }
    ];
  }

  // Update challenge progress
  async updateChallengeProgress(challengeId, increment = 1) {
    await this.db.updateChallengeProgress(challengeId, increment);
  }
}
