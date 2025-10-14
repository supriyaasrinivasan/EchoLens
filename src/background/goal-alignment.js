// Goal Alignment AI for SupriAI
// Tracks user goals and provides gentle nudges when browsing diverges

export class GoalAlignmentAI {
  constructor(aiProcessor, dbManager) {
    this.ai = aiProcessor;
    this.db = dbManager;
    this.activeGoals = [];
    this.sessionTracking = new Map();
    this.loadGoals();
  }

  // Load user's goals from storage
  async loadGoals() {
    chrome.storage.local.get(['user_goals'], (result) => {
      this.activeGoals = result.user_goals || [];
    });
  }

  // Save goals to storage
  async saveGoals() {
    await chrome.storage.local.set({ user_goals: this.activeGoals });
  }

  // Add a new goal
  async addGoal(goal) {
    const newGoal = {
      id: Date.now(),
      title: goal.title,
      description: goal.description,
      keywords: goal.keywords || [],
      priority: goal.priority || 'medium',
      createdAt: Date.now(),
      targetHours: goal.targetHours || 0,
      actualHours: 0,
      lastNudge: null,
      nudgeCount: 0,
      isActive: true
    };

    this.activeGoals.push(newGoal);
    await this.saveGoals();
    
    return newGoal;
  }

  // Update goal progress
  async updateGoalProgress(goalId, timeSpent) {
    const goal = this.activeGoals.find(g => g.id === goalId);
    if (goal) {
      goal.actualHours += timeSpent / 3600; // Convert seconds to hours
      await this.saveGoals();
    }
  }

  // Check if current browsing aligns with goals
  async checkAlignment(url, title, content, timeSpent) {
    if (this.activeGoals.length === 0) return null;

    const text = (title + ' ' + content).toLowerCase();
    const alignedGoals = [];
    const misalignedTime = timeSpent;

    // Check each goal
    for (const goal of this.activeGoals) {
      if (!goal.isActive) continue;

      const isAligned = this.isContentAlignedWithGoal(text, goal);
      
      if (isAligned) {
        alignedGoals.push(goal);
        await this.updateGoalProgress(goal.id, timeSpent);
      }
    }

    // Track session
    const sessionKey = `${Date.now()}_${url}`;
    this.sessionTracking.set(sessionKey, {
      url,
      title,
      aligned: alignedGoals.length > 0,
      goals: alignedGoals.map(g => g.id),
      timeSpent
    });

    // Check if nudge is needed
    if (alignedGoals.length === 0 && timeSpent > 300) { // 5 minutes
      return this.generateNudge(title, timeSpent);
    }

    return {
      aligned: true,
      goals: alignedGoals,
      message: alignedGoals.length > 0 
        ? `Great! This aligns with your goal: ${alignedGoals[0].title}` 
        : null
    };
  }

  // Check if content aligns with a specific goal
  isContentAlignedWithGoal(text, goal) {
    if (goal.keywords.length === 0) return false;

    // Check if any keywords appear in the content
    const matches = goal.keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );

    // Consider aligned if at least 1 keyword matches
    return matches.length > 0;
  }

  // Generate a gentle nudge
  generateNudge(currentActivity, timeSpent) {
    const topGoals = this.activeGoals
      .filter(g => g.isActive)
      .sort((a, b) => {
        // Prioritize by: priority level and progress gap
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      })
      .slice(0, 3);

    if (topGoals.length === 0) return null;

    const goal = topGoals[0];
    const minutesSpent = Math.floor(timeSpent / 60);
    
    // Don't nudge too frequently
    if (goal.lastNudge && Date.now() - goal.lastNudge < 3600000) { // 1 hour
      return null;
    }

    goal.lastNudge = Date.now();
    goal.nudgeCount++;
    this.saveGoals();

    const nudgeMessages = [
      {
        title: "Mindful Moment 🧘",
        message: `You've spent ${minutesSpent} minutes here. Still working on "${goal.title}"?`,
        tone: "gentle"
      },
      {
        title: "Goal Check-In 🎯",
        message: `Remember your goal: "${goal.title}". Want to refocus?`,
        tone: "encouraging"
      },
      {
        title: "Progress Update 📊",
        message: `Goal: "${goal.title}" — ${goal.actualHours.toFixed(1)}h / ${goal.targetHours}h. Keep it up!`,
        tone: "motivating"
      },
      {
        title: "Gentle Reminder 💡",
        message: `${minutesSpent} minutes here. Just checking: is this aligned with "${goal.title}"?`,
        tone: "curious"
      }
    ];

    const nudge = nudgeMessages[goal.nudgeCount % nudgeMessages.length];
    
    return {
      ...nudge,
      goal: goal,
      timeSpent: minutesSpent,
      showNudge: true
    };
  }

  // Get goal progress summary
  getGoalProgress() {
    return this.activeGoals.map(goal => ({
      id: goal.id,
      title: goal.title,
      progress: goal.targetHours > 0 
        ? (goal.actualHours / goal.targetHours * 100).toFixed(1)
        : 0,
      actualHours: goal.actualHours.toFixed(1),
      targetHours: goal.targetHours,
      isOnTrack: goal.actualHours >= goal.targetHours * 0.7,
      priority: goal.priority,
      isActive: goal.isActive
    }));
  }

  // Toggle goal active status
  async toggleGoal(goalId) {
    const goal = this.activeGoals.find(g => g.id === goalId);
    if (goal) {
      goal.isActive = !goal.isActive;
      await this.saveGoals();
    }
  }

  // Delete a goal
  async deleteGoal(goalId) {
    this.activeGoals = this.activeGoals.filter(g => g.id !== goalId);
    await this.saveGoals();
  }

  // Get weekly goal insights
  async getWeeklyInsights() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Calculate total aligned time
    let totalAlignedTime = 0;
    let totalTime = 0;
    
    for (const [key, session] of this.sessionTracking.entries()) {
      const timestamp = parseInt(key.split('_')[0]);
      if (timestamp > weekAgo) {
        totalTime += session.timeSpent;
        if (session.aligned) {
          totalAlignedTime += session.timeSpent;
        }
      }
    }

    const alignmentRate = totalTime > 0 
      ? (totalAlignedTime / totalTime * 100).toFixed(1)
      : 0;

    return {
      alignmentRate: parseFloat(alignmentRate),
      totalAlignedHours: (totalAlignedTime / 3600).toFixed(1),
      totalHours: (totalTime / 3600).toFixed(1),
      activeGoals: this.activeGoals.filter(g => g.isActive).length,
      mostProgressedGoal: this.getMostProgressedGoal()
    };
  }

  // Get goal with most progress this week
  getMostProgressedGoal() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const progress = this.activeGoals
      .filter(g => g.isActive && g.createdAt < weekAgo)
      .map(g => ({
        title: g.title,
        weeklyProgress: g.actualHours // Simplified - could track week-specific
      }))
      .sort((a, b) => b.weeklyProgress - a.weeklyProgress);

    return progress[0] || null;
  }

  // Get suggestions for new goals based on browsing patterns
  async suggestGoals(recentTopics, recentInterests) {
    const topicFreq = {};
    recentTopics.forEach(topic => {
      topicFreq[topic] = (topicFreq[topic] || 0) + 1;
    });

    const topTopics = Object.entries(topicFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    const suggestions = topTopics
      .filter(topic => {
        // Only suggest if not already a goal
        return !this.activeGoals.some(g => 
          g.keywords.some(kw => kw.toLowerCase().includes(topic.toLowerCase()))
        );
      })
      .map(topic => ({
        title: `Learn more about ${topic}`,
        description: `You've been exploring ${topic} recently. Set a goal to dive deeper!`,
        keywords: [topic],
        priority: 'medium',
        suggestedTargetHours: 10
      }));

    return suggestions.slice(0, 3);
  }
}
