// Mindfulness & Mental Wellness Engine for EchoLens
// Mood timeline, focus mode, daily reflection prompts

export class MindfulnessEngine {
  constructor(aiProcessor, dbManager) {
    this.ai = aiProcessor;
    this.db = dbManager;
    this.focusModeActive = false;
    this.reflectionPrompts = this.initializePrompts();
  }

  // Initialize daily reflection prompts
  initializePrompts() {
    return [
      "What was the most interesting thing you learned today?",
      "How did your browsing make you feel today?",
      "What topic would you like to explore deeper tomorrow?",
      "Did you discover anything unexpected today?",
      "What connections did you notice between different topics?",
      "How does today's learning align with your goals?",
      "What surprised you most about your interests today?",
      "If you could share one thing from today's browsing, what would it be?",
      "How has your curiosity evolved this week?",
      "What patterns do you notice in your learning journey?"
    ];
  }

  // Get mood timeline
  async getMoodTimeline(days = 30) {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    const moodData = await this.db.getMoodDataSince(since);

    // Group by day
    const dailyMood = {};
    moodData.forEach(mood => {
      const day = new Date(mood.timestamp).toDateString();
      if (!dailyMood[day]) {
        dailyMood[day] = {
          date: day,
          timestamp: new Date(day).getTime(),
          sentiments: [],
          emotions: [],
          tones: []
        };
      }
      dailyMood[day].sentiments.push(mood.sentiment_score || 0);
      if (mood.emotions) {
        dailyMood[day].emotions.push(...mood.emotions.split(','));
      }
      if (mood.tone) {
        dailyMood[day].tones.push(mood.tone);
      }
    });

    // Calculate daily averages and dominant themes
    const timeline = Object.values(dailyMood).map(day => {
      const avgSentiment = day.sentiments.reduce((sum, s) => sum + s, 0) / day.sentiments.length;
      const dominantEmotion = this.getMostFrequent(day.emotions);
      const dominantTone = this.getMostFrequent(day.tones);

      return {
        date: day.date,
        timestamp: day.timestamp,
        sentiment: this.getSentimentLabel(avgSentiment),
        sentimentScore: avgSentiment,
        emotion: dominantEmotion,
        tone: dominantTone,
        color: this.getSentimentColor(avgSentiment),
        emoji: this.getSentimentEmoji(avgSentiment)
      };
    });

    return {
      timeline: timeline.sort((a, b) => a.timestamp - b.timestamp),
      summary: this.analyzeMoodSummary(timeline)
    };
  }

  // Get most frequent item in array
  getMostFrequent(arr) {
    if (arr.length === 0) return null;
    const frequency = {};
    arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
    return Object.entries(frequency).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Get sentiment label
  getSentimentLabel(score) {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  // Get sentiment color
  getSentimentColor(score) {
    if (score > 0.5) return '#4ade80'; // Green
    if (score > 0.2) return '#a3e635'; // Light green
    if (score > -0.2) return '#fbbf24'; // Yellow
    if (score > -0.5) return '#fb923c'; // Orange
    return '#f87171'; // Red
  }

  // Get sentiment emoji
  getSentimentEmoji(score) {
    if (score > 0.5) return '😊';
    if (score > 0.2) return '🙂';
    if (score > -0.2) return '😐';
    if (score > -0.5) return '😕';
    return '😔';
  }

  // Analyze mood summary
  analyzeMoodSummary(timeline) {
    if (timeline.length === 0) return null;

    const sentiments = timeline.map(t => t.sentimentScore);
    const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    
    const positivesDays = timeline.filter(t => t.sentiment === 'positive').length;
    const negativeDays = timeline.filter(t => t.sentiment === 'negative').length;
    const neutralDays = timeline.filter(t => t.sentiment === 'neutral').length;

    const trend = this.calculateMoodTrend(timeline);
    const insights = this.generateMoodInsights(timeline, avgSentiment, trend);

    return {
      averageSentiment: avgSentiment,
      positiveDays,
      negativeDays,
      neutralDays,
      positivePercentage: Math.round((positiveDays / timeline.length) * 100),
      trend,
      insights
    };
  }

  // Calculate mood trend
  calculateMoodTrend(timeline) {
    if (timeline.length < 7) return 'insufficient_data';

    const recentWeek = timeline.slice(-7);
    const previousWeek = timeline.slice(-14, -7);

    if (previousWeek.length === 0) return 'insufficient_data';

    const recentAvg = recentWeek.reduce((sum, t) => sum + t.sentimentScore, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, t) => sum + t.sentimentScore, 0) / previousWeek.length;

    const change = recentAvg - previousAvg;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  // Generate mood insights
  generateMoodInsights(timeline, avgSentiment, trend) {
    const insights = [];

    if (avgSentiment > 0.3) {
      insights.push({
        type: 'positive',
        message: 'Your overall mood has been positive! Your content choices are uplifting.',
        icon: '✨'
      });
    } else if (avgSentiment < -0.3) {
      insights.push({
        type: 'concern',
        message: 'You\'ve been browsing heavier content lately. Consider balancing with lighter topics.',
        icon: '💭'
      });
    }

    if (trend === 'improving') {
      insights.push({
        type: 'positive',
        message: 'Your mood is trending upward! Keep exploring what makes you curious.',
        icon: '📈'
      });
    } else if (trend === 'declining') {
      insights.push({
        type: 'suggestion',
        message: 'Your mood seems down this week. Try exploring topics that energize you.',
        icon: '🌱'
      });
    }

    // Check for consistency
    const recentWeek = timeline.slice(-7);
    const allPositive = recentWeek.every(t => t.sentiment === 'positive');
    if (allPositive) {
      insights.push({
        type: 'achievement',
        message: '7 days of positive browsing! You\'re cultivating great digital habits.',
        icon: '🎉'
      });
    }

    return insights;
  }

  // Get daily reflection prompt
  async getDailyPrompt() {
    const today = new Date().toDateString();
    const lastPrompt = await this.db.getLastReflectionPrompt();

    // Check if we already showed a prompt today
    if (lastPrompt && new Date(lastPrompt.timestamp).toDateString() === today) {
      return lastPrompt;
    }

    // Get today's summary
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayVisits = await this.db.getVisitsSince(todayStart);
    const todaySkills = await this.db.getSkillActivitiesSince(todayStart);

    // Select contextual prompt
    let prompt;
    if (todayVisits.length === 0) {
      prompt = "What would you like to explore today?";
    } else if (todaySkills.length > 0) {
      const topSkill = todaySkills[0].skill;
      prompt = `You've been exploring ${topSkill} today. What insights have you gained?`;
    } else {
      // Random prompt
      prompt = this.reflectionPrompts[Math.floor(Math.random() * this.reflectionPrompts.length)];
    }

    const promptData = {
      prompt,
      timestamp: Date.now(),
      context: {
        visitCount: todayVisits.length,
        skills: todaySkills.map(s => s.skill)
      }
    };

    await this.db.saveReflectionPrompt(promptData);
    return promptData;
  }

  // Save reflection response
  async saveReflectionResponse(promptId, response) {
    await this.db.saveReflectionResponse({
      prompt_id: promptId,
      response,
      timestamp: Date.now()
    });

    // Analyze response for sentiment
    const sentiment = await this.ai.analyzeSentiment(response);
    return { saved: true, sentiment };
  }

  // Focus Mode Management
  async activateFocusMode(duration = 25 * 60 * 1000) { // Default 25 min (Pomodoro)
    console.log('🎯 Activating focus mode with duration:', duration, 'ms');
    this.focusModeActive = true;
    
    const session = {
      startTime: Date.now(),
      duration,
      endTime: Date.now() + duration
    };

    await chrome.storage.local.set({ focus_mode: session });
    console.log('✅ Focus mode session saved to storage:', session);

    // Notify content scripts
    try {
      const tabs = await chrome.tabs.query({});
      console.log('📢 Notifying', tabs.length, 'tabs about focus mode');
      tabs.forEach(tab => {
        if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'FOCUS_MODE_ACTIVATED',
            duration
          }).catch(() => {}); // Ignore errors for tabs that can't receive messages
        }
      });
    } catch (error) {
      console.error('❌ Error notifying tabs:', error);
    }

    // Set alarm to end focus mode - convert milliseconds to minutes
    const durationInMinutes = duration / 60000;
    console.log('⏰ Setting alarm for', durationInMinutes, 'minutes');
    chrome.alarms.create('end_focus_mode', { delayInMinutes: durationInMinutes });

    console.log('✅ Focus mode activated successfully');
    return session;
  }

  async deactivateFocusMode() {
    this.focusModeActive = false;
    
    const focusMode = await chrome.storage.local.get(['focus_mode']);
    if (focusMode.focus_mode) {
      const duration = Date.now() - focusMode.focus_mode.startTime;
      
      // Save focus session to database
      await this.db.saveFocusSession({
        start_time: focusMode.focus_mode.startTime,
        end_time: Date.now(),
        duration,
        completed: duration >= focusMode.focus_mode.duration * 0.9 // 90% completion counts as success
      });
    }

    await chrome.storage.local.remove('focus_mode');

    // Notify content scripts
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'FOCUS_MODE_DEACTIVATED'
      }).catch(() => {});
    });

    chrome.alarms.clear('end_focus_mode');
  }

  async getFocusModeStatus() {
    const focusMode = await chrome.storage.local.get(['focus_mode']);
    if (!focusMode.focus_mode) {
      return { active: false };
    }

    const remaining = focusMode.focus_mode.endTime - Date.now();
    return {
      active: remaining > 0,
      startTime: focusMode.focus_mode.startTime,
      endTime: focusMode.focus_mode.endTime,
      remaining,
      progress: Math.round(((focusMode.focus_mode.duration - remaining) / focusMode.focus_mode.duration) * 100)
    };
  }

  // Get focus session statistics
  async getFocusStats(days = 30) {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    const sessions = await this.db.getFocusSessionsSince(since);

    const completed = sessions.filter(s => s.completed);
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      completionRate: sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0,
      totalFocusTime: totalDuration,
      avgSessionDuration: avgDuration,
      longestSession: sessions.length > 0 ? Math.max(...sessions.map(s => s.duration)) : 0,
      recentSessions: sessions.slice(-5).reverse()
    };
  }

  // Mindful browsing suggestions
  async getMindfulSuggestions() {
    const [moodTimeline, focusStats, todayVisits] = await Promise.all([
      this.getMoodTimeline(7),
      this.getFocusStats(7),
      this.db.getVisitsSince(new Date().setHours(0, 0, 0, 0))
    ]);

    const suggestions = [];

    // Focus suggestions
    if (focusStats.completionRate < 50 && focusStats.totalSessions > 2) {
      suggestions.push({
        type: 'focus',
        title: 'Improve Focus Completion',
        message: 'Try shorter focus sessions (15 min) to build the habit.',
        action: 'Start 15-min session',
        icon: '🎯'
      });
    }

    // Mood-based suggestions
    if (moodTimeline.summary?.trend === 'declining') {
      suggestions.push({
        type: 'wellness',
        title: 'Lighten Your Content',
        message: 'You\'ve been browsing heavy topics. Try exploring uplifting content.',
        action: 'Explore positive topics',
        icon: '🌈'
      });
    }

    // Break reminders
    const totalTimeToday = todayVisits.reduce((sum, v) => sum + (v.time_spent || 0), 0);
    const hours = totalTimeToday / (1000 * 60 * 60);
    if (hours > 3) {
      suggestions.push({
        type: 'break',
        title: 'Time for a Break',
        message: `You've been browsing for ${hours.toFixed(1)} hours today. Take a mindful break!`,
        action: 'Set break reminder',
        icon: '☕'
      });
    }

    return suggestions;
  }

  // Generate mindfulness report
  async getMindfulnessReport(days = 7) {
    const [moodTimeline, focusStats, reflections] = await Promise.all([
      this.getMoodTimeline(days),
      this.getFocusStats(days),
      this.db.getReflectionsSince(Date.now() - days * 24 * 60 * 60 * 1000)
    ]);

    return {
      period: `Last ${days} days`,
      mood: {
        average: moodTimeline.summary?.averageSentiment || 0,
        trend: moodTimeline.summary?.trend || 'unknown',
        positivePercentage: moodTimeline.summary?.positivePercentage || 0,
        insights: moodTimeline.summary?.insights || []
      },
      focus: {
        sessions: focusStats.totalSessions,
        completionRate: focusStats.completionRate,
        totalTime: focusStats.totalFocusTime,
        avgDuration: focusStats.avgSessionDuration
      },
      reflection: {
        totalReflections: reflections.length,
        reflectionRate: Math.round((reflections.length / days) * 100) / 100
      },
      overallScore: this.calculateMindfulnessScore(moodTimeline, focusStats, reflections),
      recommendations: await this.getMindfulSuggestions()
    };
  }

  // Calculate overall mindfulness score
  calculateMindfulnessScore(moodTimeline, focusStats, reflections) {
    let score = 0;

    // Mood score (0-40 points)
    const moodScore = ((moodTimeline.summary?.averageSentiment || 0) + 1) * 20; // -1 to 1 becomes 0 to 40
    score += moodScore;

    // Focus score (0-30 points)
    const focusScore = (focusStats.completionRate / 100) * 30;
    score += focusScore;

    // Reflection score (0-30 points)
    const reflectionScore = Math.min((reflections.length / 7) * 30, 30); // 1 per day = max
    score += reflectionScore;

    return Math.round(score);
  }
}
