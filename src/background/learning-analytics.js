/**
 * AI-Powered Learning Analytics Engine
 * 
 * Analyzes browsing behavior to understand learning patterns,
 * track skill development, and provide intelligent recommendations.
 * 
 * Features:
 * - Real-time learning activity detection
 * - Engagement scoring based on time, scroll depth, and revisits
 * - Topic categorization using AI/NLP
 * - Learning path detection and recommendations
 * - Progress tracking and visualization
 */

export class LearningAnalytics {
  constructor(ai, db) {
    this.ai = ai;
    this.db = db;
    this.learningDomains = this.initializeLearningDomains();
    this.engagementThresholds = {
      minActiveTime: 60, // 1 minute minimum
      deepLearningTime: 1200, // 20 minutes = deep learning
      scrollDepthMin: 0.3, // 30% scroll = engaged
      revisitBonus: 1.5 // Multiplier for revisited pages
    };
  }

  /**
   * Initialize database schema for learning analytics
   */
  async initializeDatabase() {
    const schema = `
      CREATE TABLE IF NOT EXISTS learning_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        title TEXT,
        domain TEXT,
        category TEXT,
        subcategory TEXT,
        learning_type TEXT,
        time_spent INTEGER DEFAULT 0,
        active_time INTEGER DEFAULT 0,
        scroll_depth REAL DEFAULT 0,
        revisit_count INTEGER DEFAULT 1,
        interaction_score REAL DEFAULT 0,
        engagement_level TEXT,
        timestamp INTEGER NOT NULL,
        date TEXT NOT NULL,
        session_id TEXT
      );

      CREATE TABLE IF NOT EXISTS learning_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path_name TEXT NOT NULL,
        topics TEXT, -- JSON array
        start_date INTEGER,
        last_activity INTEGER,
        total_time INTEGER DEFAULT 0,
        completion_score REAL DEFAULT 0,
        skill_level TEXT,
        recommended_next TEXT -- JSON array
      );

      CREATE TABLE IF NOT EXISTS learning_insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        insight_type TEXT,
        insight_data TEXT, -- JSON
        generated_at INTEGER,
        relevance_score REAL
      );

      CREATE TABLE IF NOT EXISTS learning_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_name TEXT NOT NULL,
        target_skill TEXT,
        target_hours INTEGER,
        current_hours INTEGER DEFAULT 0,
        deadline INTEGER,
        status TEXT DEFAULT 'active',
        created_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_learning_date ON learning_sessions(date);
      CREATE INDEX IF NOT EXISTS idx_learning_category ON learning_sessions(category);
      CREATE INDEX IF NOT EXISTS idx_learning_domain ON learning_sessions(domain);
    `;

    await this.db.executeSQL(schema);
  }

  /**
   * Define learning domains and their associated platforms/keywords
   */
  initializeLearningDomains() {
    return {
      'Frontend Development': {
        platforms: ['mdn', 'w3schools', 'css-tricks', 'frontendmasters', 'codecademy'],
        keywords: ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'frontend', 'dom', 'responsive'],
        subcategories: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular', 'TypeScript', 'Web Components']
      },
      'Backend Development': {
        platforms: ['nodejs.org', 'expressjs', 'django', 'flask', 'spring.io'],
        keywords: ['node', 'express', 'django', 'flask', 'api', 'backend', 'server', 'database', 'rest', 'graphql'],
        subcategories: ['Node.js', 'Python', 'Java', 'APIs', 'Databases', 'Authentication', 'Microservices']
      },
      'Data Science': {
        platforms: ['kaggle', 'datacamp', 'jupyter', 'tensorflow', 'pytorch'],
        keywords: ['python', 'pandas', 'numpy', 'machine learning', 'data', 'analysis', 'statistics', 'ai', 'ml'],
        subcategories: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'Statistics', 'Data Visualization']
      },
      'Machine Learning & AI': {
        platforms: ['tensorflow', 'pytorch', 'huggingface', 'openai', 'deeplearning.ai'],
        keywords: ['machine learning', 'deep learning', 'neural network', 'ai', 'model', 'tensorflow', 'pytorch'],
        subcategories: ['Neural Networks', 'NLP', 'Computer Vision', 'Deep Learning', 'MLOps', 'Transformers']
      },
      'Mobile Development': {
        platforms: ['developer.android', 'developer.apple', 'reactnative', 'flutter.dev'],
        keywords: ['android', 'ios', 'mobile', 'react native', 'flutter', 'swift', 'kotlin'],
        subcategories: ['Android', 'iOS', 'React Native', 'Flutter', 'Swift', 'Kotlin']
      },
      'Cloud & DevOps': {
        platforms: ['aws.amazon', 'cloud.google', 'azure.microsoft', 'docker', 'kubernetes'],
        keywords: ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'devops', 'ci/cd', 'terraform'],
        subcategories: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Infrastructure']
      },
      'Database & SQL': {
        platforms: ['postgresql', 'mongodb', 'redis', 'mysql', 'oracle'],
        keywords: ['sql', 'database', 'query', 'mongodb', 'postgresql', 'mysql', 'nosql', 'orm'],
        subcategories: ['SQL', 'NoSQL', 'PostgreSQL', 'MongoDB', 'Database Design', 'Query Optimization']
      },
      'Cybersecurity': {
        platforms: ['owasp', 'kali', 'hackthebox', 'tryhackme'],
        keywords: ['security', 'encryption', 'penetration', 'vulnerability', 'hacking', 'cyber', 'authentication'],
        subcategories: ['Web Security', 'Network Security', 'Cryptography', 'Penetration Testing', 'OWASP']
      },
      'Design & UX': {
        platforms: ['figma', 'adobe', 'dribbble', 'behance', 'uxdesign'],
        keywords: ['design', 'ui', 'ux', 'figma', 'photoshop', 'prototype', 'wireframe', 'user experience'],
        subcategories: ['UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'Accessibility']
      },
      'Programming Fundamentals': {
        platforms: ['leetcode', 'hackerrank', 'codewars', 'exercism', 'geeksforgeeks'],
        keywords: ['algorithm', 'data structure', 'coding', 'programming', 'leetcode', 'problem solving'],
        subcategories: ['Algorithms', 'Data Structures', 'Problem Solving', 'Competitive Programming']
      }
    };
  }

  /**
   * Detect if a URL is a learning resource
   */
  isLearningResource(url, title) {
    if (!url) return false;

    const urlLower = url.toLowerCase();
    const titleLower = (title || '').toLowerCase();

    // Check against known learning platforms
    const learningPlatforms = [
      'youtube.com/watch', 'udemy.com', 'coursera.org', 'edx.org', 'linkedin.com/learning',
      'pluralsight.com', 'codecademy.com', 'freecodecamp.org', 'khanacademy.org',
      'w3schools.com', 'mdn', 'stackoverflow.com', 'geeksforgeeks.org', 'tutorialspoint.com',
      'medium.com', 'dev.to', 'hashnode.com', 'css-tricks.com', 'smashingmagazine.com',
      'github.com', 'gitlab.com', 'docs.', 'documentation', 'tutorial', 'learn', 'course'
    ];

    // Check if URL matches learning platforms
    const isPlatform = learningPlatforms.some(platform => urlLower.includes(platform));

    // Check for learning-related keywords in title
    const learningKeywords = ['tutorial', 'guide', 'learn', 'course', 'documentation', 'docs', 'how to', 'introduction to'];
    const hasLearningKeyword = learningKeywords.some(keyword => titleLower.includes(keyword));

    return isPlatform || hasLearningKeyword;
  }

  /**
   * Categorize learning content using AI and keyword matching
   */
  async categorizeLearning(url, title, content = '') {
    const urlLower = url.toLowerCase();
    const titleLower = (title || '').toLowerCase();
    const contentLower = content.toLowerCase();
    const combinedText = `${titleLower} ${contentLower}`.substring(0, 1000);

    let category = 'General Learning';
    let subcategory = null;
    let confidence = 0;

    // Check each learning domain
    for (const [domain, config] of Object.entries(this.learningDomains)) {
      let score = 0;

      // Check platform match
      const platformMatch = config.platforms.some(platform => urlLower.includes(platform));
      if (platformMatch) score += 3;

      // Check keyword matches
      const keywordMatches = config.keywords.filter(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      score += keywordMatches.length * 2;

      // Check subcategory matches
      for (const subcat of config.subcategories) {
        if (combinedText.includes(subcat.toLowerCase())) {
          score += 2;
          if (!subcategory || score > confidence) {
            subcategory = subcat;
          }
        }
      }

      if (score > confidence) {
        confidence = score;
        category = domain;
      }
    }

    // Determine learning type
    let learningType = 'Reading';
    if (urlLower.includes('youtube') || urlLower.includes('video')) {
      learningType = 'Video';
    } else if (urlLower.includes('exercise') || urlLower.includes('practice') || urlLower.includes('coding')) {
      learningType = 'Practice';
    } else if (urlLower.includes('course') || urlLower.includes('tutorial')) {
      learningType = 'Course';
    } else if (urlLower.includes('docs') || urlLower.includes('documentation')) {
      learningType = 'Documentation';
    }

    return {
      category,
      subcategory,
      learningType,
      confidence: Math.min(confidence / 10, 1) // Normalize to 0-1
    };
  }

  /**
   * Calculate engagement score based on behavior metrics
   */
  calculateEngagementScore(timeSpent, scrollDepth, revisitCount, learningType) {
    let score = 0;

    // Time component (0-40 points)
    if (timeSpent >= this.engagementThresholds.deepLearningTime) {
      score += 40;
    } else if (timeSpent >= this.engagementThresholds.minActiveTime) {
      score += (timeSpent / this.engagementThresholds.deepLearningTime) * 40;
    }

    // Scroll depth component (0-20 points)
    score += Math.min(scrollDepth * 20, 20);

    // Revisit bonus (0-20 points)
    if (revisitCount > 1) {
      score += Math.min((revisitCount - 1) * 5, 20);
    }

    // Learning type modifier (0-20 points)
    const typeScores = {
      'Practice': 20,
      'Video': 15,
      'Course': 18,
      'Documentation': 12,
      'Reading': 10
    };
    score += typeScores[learningType] || 10;

    return Math.min(score, 100);
  }

  /**
   * Determine engagement level
   */
  getEngagementLevel(score) {
    if (score >= 80) return 'Deep Learning';
    if (score >= 60) return 'Active Study';
    if (score >= 40) return 'Moderate Engagement';
    if (score >= 20) return 'Light Reading';
    return 'Browsing';
  }

  /**
   * Save a learning session
   */
  async saveLearningSession(sessionData) {
    const {
      url,
      title,
      timeSpent,
      activeTime,
      scrollDepth = 0,
      revisitCount = 1,
      sessionId
    } = sessionData;

    // Check if it's a learning resource
    if (!this.isLearningResource(url, title)) {
      return null;
    }

    // Categorize the content
    const categorization = await this.categorizeLearning(url, title);

    // Calculate engagement
    const interactionScore = this.calculateEngagementScore(
      activeTime || timeSpent,
      scrollDepth,
      revisitCount,
      categorization.learningType
    );

    const engagementLevel = this.getEngagementLevel(interactionScore);

    // Extract domain
    const domain = new URL(url).hostname;

    // Prepare data for database
    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];

    const query = `
      INSERT INTO learning_sessions (
        url, title, domain, category, subcategory, learning_type,
        time_spent, active_time, scroll_depth, revisit_count,
        interaction_score, engagement_level, timestamp, date, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      url,
      title,
      domain,
      categorization.category,
      categorization.subcategory,
      categorization.learningType,
      timeSpent,
      activeTime || timeSpent,
      scrollDepth,
      revisitCount,
      interactionScore,
      engagementLevel,
      now,
      dateStr,
      sessionId || `session_${now}`
    ];

    await this.db.executeSQL(query, params);

    // Update learning paths
    await this.updateLearningPath(categorization.category, categorization.subcategory);

    // Check for insights
    await this.generateInsights();

    return {
      category: categorization.category,
      subcategory: categorization.subcategory,
      interactionScore,
      engagementLevel
    };
  }

  /**
   * Update or create learning path
   */
  async updateLearningPath(category, subcategory) {
    if (!category) return;

    const now = Date.now();

    // Check if path exists
    const existingPath = await this.db.executeSQL(
      'SELECT * FROM learning_paths WHERE path_name = ?',
      [category]
    );

    if (existingPath && existingPath.length > 0) {
      // Update existing path
      const path = existingPath[0];
      const topics = JSON.parse(path.topics || '[]');
      
      if (subcategory && !topics.includes(subcategory)) {
        topics.push(subcategory);
      }

      // Calculate total time
      const timeResult = await this.db.executeSQL(
        'SELECT SUM(active_time) as total FROM learning_sessions WHERE category = ?',
        [category]
      );
      const totalTime = timeResult[0]?.total || 0;

      await this.db.executeSQL(
        `UPDATE learning_paths 
         SET topics = ?, last_activity = ?, total_time = ?
         WHERE path_name = ?`,
        [JSON.stringify(topics), now, totalTime, category]
      );
    } else {
      // Create new path
      const topics = subcategory ? [subcategory] : [];
      
      await this.db.executeSQL(
        `INSERT INTO learning_paths (path_name, topics, start_date, last_activity, total_time)
         VALUES (?, ?, ?, ?, 0)`,
        [category, JSON.stringify(topics), now, now]
      );
    }
  }

  /**
   * Get learning analytics summary
   */
  async getLearningAnalytics(timeRange = 'week') {
    const now = Date.now();
    let startTime;

    switch (timeRange) {
      case 'today':
        startTime = new Date().setHours(0, 0, 0, 0);
        break;
      case 'week':
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startTime = 0;
        break;
      default:
        startTime = now - (7 * 24 * 60 * 60 * 1000);
    }

    // Get session statistics
    const sessions = await this.db.executeSQL(
      `SELECT * FROM learning_sessions 
       WHERE timestamp >= ? 
       ORDER BY timestamp DESC`,
      [startTime]
    );

    // Calculate metrics
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + (s.active_time || 0), 0);
    const avgEngagement = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.interaction_score, 0) / sessions.length
      : 0;

    // Group by category
    const categoryStats = {};
    sessions.forEach(session => {
      const cat = session.category;
      if (!categoryStats[cat]) {
        categoryStats[cat] = {
          count: 0,
          totalTime: 0,
          avgScore: 0,
          sessions: []
        };
      }
      categoryStats[cat].count++;
      categoryStats[cat].totalTime += session.active_time || 0;
      categoryStats[cat].sessions.push(session);
    });

    // Calculate averages
    Object.keys(categoryStats).forEach(cat => {
      const stat = categoryStats[cat];
      stat.avgScore = stat.sessions.reduce((sum, s) => sum + s.interaction_score, 0) / stat.count;
    });

    // Get top categories
    const topCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1].totalTime - a[1].totalTime)
      .slice(0, 5)
      .map(([name, stats]) => ({
        name,
        time: stats.totalTime,
        sessions: stats.count,
        avgScore: stats.avgScore
      }));

    // Get learning paths
    const learningPaths = await this.db.executeSQL(
      'SELECT * FROM learning_paths ORDER BY last_activity DESC LIMIT 10'
    );

    // Get daily breakdown
    const dailyStats = {};
    sessions.forEach(session => {
      const date = session.date;
      if (!dailyStats[date]) {
        dailyStats[date] = { time: 0, sessions: 0, categories: new Set() };
      }
      dailyStats[date].time += session.active_time || 0;
      dailyStats[date].sessions++;
      dailyStats[date].categories.add(session.category);
    });

    const dailyBreakdown = Object.entries(dailyStats)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 30)
      .map(([date, stats]) => ({
        date,
        time: stats.time,
        sessions: stats.sessions,
        categories: stats.categories.size
      }));

    return {
      summary: {
        totalSessions,
        totalTime,
        avgEngagement: Math.round(avgEngagement),
        timeRange
      },
      topCategories,
      learningPaths: learningPaths.map(p => ({
        ...p,
        topics: JSON.parse(p.topics || '[]'),
        recommendedNext: JSON.parse(p.recommended_next || '[]')
      })),
      dailyBreakdown,
      recentSessions: sessions.slice(0, 20)
    };
  }

  /**
   * Generate AI-powered insights
   */
  async generateInsights() {
    const analytics = await this.getLearningAnalytics('month');
    const insights = [];

    // Insight 1: Learning consistency
    if (analytics.dailyBreakdown.length > 7) {
      const recentWeek = analytics.dailyBreakdown.slice(0, 7);
      const avgDailyTime = recentWeek.reduce((sum, d) => sum + d.time, 0) / 7;
      
      if (avgDailyTime > 1800) { // 30 minutes average
        insights.push({
          type: 'consistency',
          title: 'Great Learning Consistency! 🔥',
          description: `You've averaged ${Math.round(avgDailyTime / 60)} minutes of learning per day this week.`,
          relevance: 0.9
        });
      }
    }

    // Insight 2: Focused learning path
    if (analytics.topCategories.length > 0) {
      const topCategory = analytics.topCategories[0];
      const focusPercentage = (topCategory.time / analytics.summary.totalTime) * 100;
      
      if (focusPercentage > 60) {
        insights.push({
          type: 'focus',
          title: `Deep Focus on ${topCategory.name}`,
          description: `${Math.round(focusPercentage)}% of your learning time is in ${topCategory.name}. Consider exploring related topics!`,
          relevance: 0.85
        });
      }
    }

    // Insight 3: Learning time patterns
    const sessions = await this.db.executeSQL(
      'SELECT * FROM learning_sessions WHERE timestamp >= ?',
      [Date.now() - (30 * 24 * 60 * 60 * 1000)]
    );

    const hourlyDistribution = new Array(24).fill(0);
    sessions.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      hourlyDistribution[hour] += session.active_time || 0;
    });

    const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    if (hourlyDistribution[peakHour] > 0) {
      const period = peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening';
      insights.push({
        type: 'timing',
        title: `You're a ${period} learner`,
        description: `Your peak learning time is around ${peakHour}:00. Most productive sessions happen in the ${period}.`,
        relevance: 0.75
      });
    }

    // Save insights
    for (const insight of insights) {
      await this.db.executeSQL(
        `INSERT INTO learning_insights (insight_type, insight_data, generated_at, relevance_score)
         VALUES (?, ?, ?, ?)`,
        [insight.type, JSON.stringify(insight), Date.now(), insight.relevance]
      );
    }

    return insights;
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations() {
    const analytics = await this.getLearningAnalytics('month');
    const recommendations = [];

    // Recommendation based on learning paths
    for (const path of analytics.learningPaths.slice(0, 3)) {
      const topics = path.topics || [];
      const domain = this.learningDomains[path.path_name];
      
      if (domain && topics.length > 0) {
        // Find next topics not yet covered
        const unCoveredTopics = domain.subcategories.filter(t => !topics.includes(t));
        
        if (unCoveredTopics.length > 0) {
          recommendations.push({
            type: 'next_topic',
            category: path.path_name,
            title: `Continue your ${path.path_name} journey`,
            suggestions: unCoveredTopics.slice(0, 3),
            reason: `You've covered: ${topics.join(', ')}`
          });
        }
      }
    }

    // Recommendation based on engagement
    const highEngagementSessions = await this.db.executeSQL(
      `SELECT category, subcategory, AVG(interaction_score) as avg_score
       FROM learning_sessions
       WHERE timestamp >= ?
       GROUP BY category
       HAVING avg_score > 70
       ORDER BY avg_score DESC
       LIMIT 3`,
      [Date.now() - (30 * 24 * 60 * 60 * 1000)]
    );

    highEngagementSessions.forEach(session => {
      recommendations.push({
        type: 'strength',
        category: session.category,
        title: `You excel at ${session.category}`,
        score: Math.round(session.avg_score),
        reason: `Your engagement score is ${Math.round(session.avg_score)}/100`
      });
    });

    return recommendations;
  }

  /**
   * Get learning streak
   */
  async getLearningStreak() {
    const sessions = await this.db.executeSQL(
      `SELECT DISTINCT date FROM learning_sessions 
       ORDER BY date DESC`
    );

    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const session of sessions) {
      const sessionDate = session.date;
      const checkDate = currentDate.toISOString().split('T')[0];

      if (sessionDate === checkDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}
