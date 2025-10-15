// Progress Analytics for EchoLens
// Weekly charts, knowledge evolution, focus hours, reflection frequency

export class ProgressAnalytics {
  constructor(dbManager) {
    this.db = dbManager;
  }

  // Get comprehensive weekly analytics
  async getWeeklyAnalytics() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const [
      weeklyVisits,
      weeklyHighlights,
      weeklySkills,
      weeklyFocusSessions,
      weeklyMood,
      timeDistribution
    ] = await Promise.all([
      this.db.getVisitsSince(weekAgo),
      this.db.getHighlightsSince(weekAgo),
      this.db.getSkillActivitiesSince(weekAgo),
      this.db.getFocusSessionsSince(weekAgo),
      this.db.getMoodDataSince(weekAgo),
      this.getTimeDistribution(weekAgo)
    ]);

    return {
      summary: {
        totalTime: this.calculateTotalTime(weeklyVisits),
        totalPages: weeklyVisits.length,
        totalHighlights: weeklyHighlights.length,
        totalFocusSessions: weeklyFocusSessions.length,
        activeDays: this.getActiveDays(weeklyVisits),
        avgSessionDuration: this.calculateAvgSessionDuration(weeklyVisits)
      },
      dailyBreakdown: this.getDailyBreakdown(weeklyVisits, weekAgo),
      skillProgress: this.analyzeSkillProgress(weeklySkills),
      focusAnalytics: this.analyzeFocusSessions(weeklyFocusSessions),
      moodTrends: this.analyzeMoodTrends(weeklyMood),
      timeDistribution,
      topCategories: this.getTopCategories(weeklyVisits),
      reflectionMetrics: {
        highlightsPerDay: weeklyHighlights.length / 7,
        peakReflectionTime: this.getPeakReflectionTime(weeklyHighlights)
      }
    };
  }

  // Get monthly analytics
  async getMonthlyAnalytics() {
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const [
      monthlyVisits,
      monthlySkills,
      monthlyGoals,
      monthlyAchievements
    ] = await Promise.all([
      this.db.getVisitsSince(monthAgo),
      this.db.getSkillActivitiesSince(monthAgo),
      this.db.getGoals(),
      this.db.getAchievementsUnlockedSince(monthAgo)
    ]);

    return {
      summary: {
        totalTime: this.calculateTotalTime(monthlyVisits),
        totalPages: monthlyVisits.length,
        uniqueSkills: new Set(monthlySkills.map(s => s.skill)).size,
        achievementsUnlocked: monthlyAchievements.length,
        goalsCompleted: monthlyGoals.filter(g => g.completed).length
      },
      weeklyComparison: this.getWeeklyComparison(monthlyVisits),
      skillEvolution: this.getSkillEvolution(monthlySkills),
      productivityTrends: this.getProductivityTrends(monthlyVisits),
      growthMetrics: {
        knowledgeGrowth: this.calculateKnowledgeGrowth(monthlyVisits, monthlySkills),
        focusImprovement: this.calculateFocusImprovement(monthlyVisits)
      }
    };
  }

  // Get yearly analytics
  async getYearlyAnalytics() {
    const yearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    
    const [
      yearlyVisits,
      yearlySkills,
      personalitySnapshots
    ] = await Promise.all([
      this.db.getVisitsSince(yearAgo),
      this.db.getSkillActivitiesSince(yearAgo),
      this.db.getPersonalitySnapshots(52) // Weekly snapshots for a year
    ]);

    return {
      summary: {
        totalTime: this.calculateTotalTime(yearlyVisits),
        totalPages: yearlyVisits.length,
        skillsMastered: yearlySkills.filter(s => s.total_time > 100 * 60 * 60 * 1000).length,
        personalityEvolution: personalitySnapshots.length
      },
      monthlyBreakdown: this.getMonthlyBreakdown(yearlyVisits),
      topSkillsOfYear: this.getTopSkills(yearlySkills, 10),
      personalityJourney: this.analyzePersonalityJourney(personalitySnapshots),
      milestones: this.identifyMilestones(yearlyVisits, yearlySkills)
    };
  }

  // Calculate total time spent
  calculateTotalTime(visits) {
    return visits.reduce((sum, visit) => sum + (visit.time_spent || 0), 0);
  }

  // Calculate average session duration
  calculateAvgSessionDuration(visits) {
    if (visits.length === 0) return 0;
    return this.calculateTotalTime(visits) / visits.length;
  }

  // Get active days count
  getActiveDays(visits) {
    const uniqueDays = new Set(
      visits.map(v => new Date(v.timestamp).toDateString())
    );
    return uniqueDays.size;
  }

  // Get daily breakdown
  getDailyBreakdown(visits, startDate) {
    const days = [];
    const now = Date.now();
    
    for (let i = 0; i < 7; i++) {
      const dayStart = now - (i * 24 * 60 * 60 * 1000);
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      const dayVisits = visits.filter(v => 
        v.timestamp >= dayStart && v.timestamp < dayEnd
      );

      days.unshift({
        date: new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        timestamp: dayStart,
        visits: dayVisits.length,
        timeSpent: this.calculateTotalTime(dayVisits),
        highlights: dayVisits.reduce((sum, v) => sum + (v.highlight_count || 0), 0)
      });
    }

    return days;
  }

  // Analyze skill progress
  analyzeSkillProgress(skillActivities) {
    const skillMap = {};
    
    skillActivities.forEach(activity => {
      if (!skillMap[activity.skill]) {
        skillMap[activity.skill] = {
          skill: activity.skill,
          count: 0,
          totalTime: 0,
          days: new Set()
        };
      }
      skillMap[activity.skill].count++;
      skillMap[activity.skill].totalTime += activity.time_spent || 0;
      skillMap[activity.skill].days.add(new Date(activity.timestamp).toDateString());
    });

    return Object.values(skillMap)
      .map(skill => ({
        ...skill,
        activeDays: skill.days.size,
        avgTimePerDay: skill.totalTime / skill.days.size
      }))
      .sort((a, b) => b.totalTime - a.totalTime);
  }

  // Analyze focus sessions
  analyzeFocusSessions(focusSessions) {
    if (focusSessions.length === 0) {
      return {
        totalSessions: 0,
        totalFocusTime: 0,
        avgDuration: 0,
        longestSession: 0,
        focusScore: 0
      };
    }

    const totalFocusTime = focusSessions.reduce((sum, session) => sum + session.duration, 0);
    const longestSession = Math.max(...focusSessions.map(s => s.duration));
    
    return {
      totalSessions: focusSessions.length,
      totalFocusTime,
      avgDuration: totalFocusTime / focusSessions.length,
      longestSession,
      focusScore: this.calculateFocusScore(focusSessions),
      dailyAverage: focusSessions.length / 7
    };
  }

  // Calculate focus score (0-100)
  calculateFocusScore(focusSessions) {
    if (focusSessions.length === 0) return 0;
    
    const avgDuration = focusSessions.reduce((sum, s) => sum + s.duration, 0) / focusSessions.length;
    const consistency = (focusSessions.length / 7) * 20; // Up to 20 points for daily consistency
    const duration = Math.min((avgDuration / (30 * 60 * 1000)) * 40, 40); // Up to 40 points for 30min avg
    const frequency = Math.min(focusSessions.length * 5, 40); // Up to 40 points for frequency
    
    return Math.round(consistency + duration + frequency);
  }

  // Analyze mood trends
  analyzeMoodTrends(moodData) {
    if (moodData.length === 0) {
      return {
        averageSentiment: 0,
        dominantMood: 'neutral',
        moodVariability: 0,
        positivePercentage: 0
      };
    }

    const avgSentiment = moodData.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / moodData.length;
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    
    moodData.forEach(mood => {
      if (mood.sentiment) {
        sentimentCounts[mood.sentiment]++;
      }
    });

    const dominantMood = Object.entries(sentimentCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      averageSentiment: avgSentiment,
      dominantMood,
      moodVariability: this.calculateVariability(moodData.map(m => m.sentiment_score || 0)),
      positivePercentage: Math.round((sentimentCounts.positive / moodData.length) * 100),
      moodDistribution: sentimentCounts
    };
  }

  // Calculate variability
  calculateVariability(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Get time distribution by hour
  async getTimeDistribution(since) {
    const visits = await this.db.getVisitsSince(since);
    const hourly = new Array(24).fill(0);
    
    visits.forEach(visit => {
      const hour = new Date(visit.timestamp).getHours();
      hourly[hour] += visit.time_spent || 0;
    });

    return hourly.map((time, hour) => ({
      hour,
      time,
      label: `${hour}:00`
    }));
  }

  // Get top categories
  getTopCategories(visits) {
    const categories = {};
    
    visits.forEach(visit => {
      const category = visit.category || 'other';
      if (!categories[category]) {
        categories[category] = { count: 0, time: 0 };
      }
      categories[category].count++;
      categories[category].time += visit.time_spent || 0;
    });

    return Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
  }

  // Get peak reflection time
  getPeakReflectionTime(highlights) {
    if (highlights.length === 0) return null;
    
    const hourly = new Array(24).fill(0);
    highlights.forEach(h => {
      const hour = new Date(h.timestamp).getHours();
      hourly[hour]++;
    });

    const peakHour = hourly.indexOf(Math.max(...hourly));
    return `${peakHour}:00 - ${peakHour + 1}:00`;
  }

  // Get weekly comparison (4 weeks)
  getWeeklyComparison(monthlyVisits) {
    const weeks = [];
    const now = Date.now();
    
    for (let i = 0; i < 4; i++) {
      const weekStart = now - ((i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = now - (i * 7 * 24 * 60 * 60 * 1000);
      const weekVisits = monthlyVisits.filter(v => 
        v.timestamp >= weekStart && v.timestamp < weekEnd
      );

      weeks.unshift({
        week: i + 1,
        visits: weekVisits.length,
        time: this.calculateTotalTime(weekVisits),
        activeDays: this.getActiveDays(weekVisits)
      });
    }

    return weeks;
  }

  // Get skill evolution over time
  getSkillEvolution(monthlySkills) {
    const weeks = {};
    const now = Date.now();
    
    for (let i = 0; i < 4; i++) {
      const weekStart = now - ((i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = now - (i * 7 * 24 * 60 * 60 * 1000);
      weeks[`week${i + 1}`] = monthlySkills.filter(s => 
        s.timestamp >= weekStart && s.timestamp < weekEnd
      );
    }

    return weeks;
  }

  // Get productivity trends
  getProductivityTrends(visits) {
    const weeks = this.getWeeklyComparison(visits);
    
    if (weeks.length < 2) return { trend: 'insufficient_data' };

    const lastWeek = weeks[weeks.length - 1];
    const prevWeek = weeks[weeks.length - 2];

    const timeChange = ((lastWeek.time - prevWeek.time) / prevWeek.time) * 100;
    const visitChange = ((lastWeek.visits - prevWeek.visits) / prevWeek.visits) * 100;

    return {
      trend: timeChange > 10 ? 'increasing' : timeChange < -10 ? 'decreasing' : 'stable',
      timeChange: Math.round(timeChange),
      visitChange: Math.round(visitChange),
      focusImprovement: timeChange > 0 && visitChange < 0 // More time on fewer pages = better focus
    };
  }

  // Calculate knowledge growth
  calculateKnowledgeGrowth(visits, skills) {
    const uniqueTopics = new Set();
    visits.forEach(visit => {
      if (visit.topics) {
        visit.topics.split(',').forEach(topic => uniqueTopics.add(topic.trim()));
      }
    });

    const uniqueSkills = new Set(skills.map(s => s.skill));

    return {
      topicsExplored: uniqueTopics.size,
      skillsLearned: uniqueSkills.size,
      depth: skills.reduce((sum, s) => sum + s.total_time, 0) / uniqueSkills.size,
      breadth: uniqueSkills.size
    };
  }

  // Calculate focus improvement
  calculateFocusImprovement(visits) {
    const weeks = this.getWeeklyComparison(visits);
    if (weeks.length < 2) return 0;

    const lastWeek = weeks[weeks.length - 1];
    const firstWeek = weeks[0];

    const lastWeekAvg = lastWeek.time / lastWeek.visits;
    const firstWeekAvg = firstWeek.time / firstWeek.visits;

    return Math.round(((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100);
  }

  // Get monthly breakdown
  getMonthlyBreakdown(yearlyVisits) {
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthVisits = yearlyVisits.filter(v => 
        v.timestamp >= monthStart.getTime() && v.timestamp < monthEnd.getTime()
      );

      months.unshift({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        visits: monthVisits.length,
        time: this.calculateTotalTime(monthVisits)
      });
    }

    return months;
  }

  // Get top skills
  getTopSkills(skillActivities, limit = 10) {
    const skillMap = {};
    
    skillActivities.forEach(activity => {
      if (!skillMap[activity.skill]) {
        skillMap[activity.skill] = { skill: activity.skill, time: 0, count: 0 };
      }
      skillMap[activity.skill].time += activity.time_spent || 0;
      skillMap[activity.skill].count++;
    });

    return Object.values(skillMap)
      .sort((a, b) => b.time - a.time)
      .slice(0, limit);
  }

  // Analyze personality journey
  analyzePersonalityJourney(snapshots) {
    if (snapshots.length < 2) return { evolution: 'insufficient_data' };

    const firstSnapshot = snapshots[0];
    const lastSnapshot = snapshots[snapshots.length - 1];

    return {
      startTone: firstSnapshot.tone,
      currentTone: lastSnapshot.tone,
      interestShift: this.compareTopics(firstSnapshot.top_topics, lastSnapshot.top_topics),
      growthMetrics: {
        timeSpentGrowth: lastSnapshot.total_time_spent - firstSnapshot.total_time_spent,
        visitGrowth: lastSnapshot.total_visits - firstSnapshot.total_visits
      }
    };
  }

  // Compare topics between snapshots
  compareTopics(oldTopics, newTopics) {
    const old = oldTopics ? oldTopics.split(',').map(t => t.trim()) : [];
    const current = newTopics ? newTopics.split(',').map(t => t.trim()) : [];
    
    const emerged = current.filter(t => !old.includes(t));
    const faded = old.filter(t => !current.includes(t));
    const persisting = current.filter(t => old.includes(t));

    return { emerged, faded, persisting };
  }

  // Identify milestones
  identifyMilestones(visits, skills) {
    const milestones = [];
    const totalTime = this.calculateTotalTime(visits);
    const totalPages = visits.length;

    // Time milestones
    const hoursMilestones = [10, 50, 100, 500, 1000];
    const hours = totalTime / (1000 * 60 * 60);
    hoursMilestones.forEach(milestone => {
      if (hours >= milestone) {
        milestones.push({
          type: 'time',
          achievement: `${milestone} hours of learning`,
          icon: '⏰'
        });
      }
    });

    // Page milestones
    const pageMilestones = [100, 500, 1000, 5000];
    pageMilestones.forEach(milestone => {
      if (totalPages >= milestone) {
        milestones.push({
          type: 'exploration',
          achievement: `${milestone} pages explored`,
          icon: '📚'
        });
      }
    });

    return milestones;
  }

  // Generate insights from analytics
  generateInsights(weeklyAnalytics, monthlyAnalytics) {
    const insights = [];

    // Focus insights
    if (weeklyAnalytics.focusAnalytics.focusScore > 75) {
      insights.push({
        type: 'positive',
        message: `Excellent focus this week! Your focus score is ${weeklyAnalytics.focusAnalytics.focusScore}/100.`,
        icon: '🎯'
      });
    }

    // Productivity trend
    if (monthlyAnalytics.productivityTrends.focusImprovement) {
      insights.push({
        type: 'positive',
        message: 'Your focus is improving! You\'re spending more time on fewer pages.',
        icon: '📈'
      });
    }

    // Mood insights
    if (weeklyAnalytics.moodTrends.positivePercentage > 70) {
      insights.push({
        type: 'positive',
        message: `Great week! ${weeklyAnalytics.moodTrends.positivePercentage}% of your browsing had positive sentiment.`,
        icon: '😊'
      });
    }

    // Skill growth
    if (monthlyAnalytics.summary.uniqueSkills > 5) {
      insights.push({
        type: 'positive',
        message: `You explored ${monthlyAnalytics.summary.uniqueSkills} different skills this month. You're a true polymath!`,
        icon: '🎓'
      });
    }

    return insights;
  }
}
