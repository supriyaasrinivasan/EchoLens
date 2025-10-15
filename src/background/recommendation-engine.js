/**
 * EchoLens Recommendation Engine
 * Smart recommendations that challenge thinking and avoid echo chambers
 */

class RecommendationEngine {
  constructor(dbManager, aiProcessor) {
    this.dbManager = dbManager;
    this.aiProcessor = aiProcessor;
  }

  /**
   * Initialize recommendation engine
   */
  async initialize() {
    console.log('Recommendation Engine initialized');
  }

  // ==================== Anti-Echo Chamber Recommendations ====================

  /**
   * Get diverse content recommendations
   */
  async getDiverseRecommendations(options = {}) {
    const {
      count = 5,
      includeContrarian = true,
      includeCrossDomain = true,
      includeChallenge = true
    } = options;

    const userProfile = await this.buildUserProfile();
    const recommendations = [];

    // Contrarian viewpoints
    if (includeContrarian) {
      const contrarian = await this.getContrarianRecommendations(userProfile, 2);
      recommendations.push(...contrarian);
    }

    // Cross-domain exploration
    if (includeCrossDomain) {
      const crossDomain = await this.getCrossDomainRecommendations(userProfile, 2);
      recommendations.push(...crossDomain);
    }

    // Cognitive challenge content
    if (includeChallenge) {
      const challenge = await this.getChallengeRecommendations(userProfile, 1);
      recommendations.push(...challenge);
    }

    return recommendations.slice(0, count);
  }

  /**
   * Get contrarian viewpoint recommendations
   */
  async getContrarianRecommendations(userProfile, count = 2) {
    const { topCategories, topDomains, dominantPerspective } = userProfile;

    const recommendations = [];

    // Identify dominant perspectives
    const perspectives = this.analyzePerspectives(userProfile);

    for (const perspective of perspectives.slice(0, count)) {
      recommendations.push({
        type: 'contrarian',
        title: `Alternative view: ${perspective.topic}`,
        description: `You've mostly seen ${perspective.dominant} perspectives. Explore ${perspective.alternative} viewpoints.`,
        reason: 'Challenge your assumptions',
        sources: await this.findContrarianSources(perspective),
        icon: '🔄',
        color: '#f59e0b'
      });
    }

    return recommendations;
  }

  /**
   * Get cross-domain recommendations
   */
  async getCrossDomainRecommendations(userProfile, count = 2) {
    const { topCategories, underexploredCategories } = userProfile;

    const recommendations = [];

    // Find underexplored categories
    const unexplored = underexploredCategories.slice(0, count);

    for (const category of unexplored) {
      const connection = await this.findCategoryConnection(topCategories[0], category);

      recommendations.push({
        type: 'cross-domain',
        title: `Explore ${category}`,
        description: `You're strong in ${topCategories[0]}. ${connection.insight}`,
        reason: 'Expand your knowledge boundaries',
        sources: connection.sources,
        icon: '🌐',
        color: '#3b82f6'
      });
    }

    return recommendations;
  }

  /**
   * Get cognitive challenge recommendations
   */
  async getChallengeRecommendations(userProfile, count = 1) {
    const { complexityLevel, preferredDepth } = userProfile;

    const recommendations = [];

    // Suggest more complex content
    const challengeLevel = complexityLevel === 'advanced' ? 'expert' : 'advanced';

    recommendations.push({
      type: 'challenge',
      title: `Level up to ${challengeLevel} content`,
      description: `Push your understanding with ${challengeLevel}-level resources on your favorite topics`,
      reason: 'Accelerate your growth',
      sources: await this.findChallengingSources(userProfile, challengeLevel),
      icon: '🚀',
      color: '#8b5cf6'
    });

    return recommendations;
  }

  // ==================== Diversity Metrics ====================

  /**
   * Calculate echo chamber score (0-100, lower is better)
   */
  async calculateEchoChamberScore() {
    const db = await this.dbManager.getDatabase();

    // Get browsing diversity metrics
    const result = db.exec(`
      SELECT 
        COUNT(DISTINCT domain) as unique_domains,
        COUNT(DISTINCT category) as unique_categories,
        COUNT(*) as total_pages,
        (SELECT COUNT(*) FROM browsing_history 
         WHERE domain IN (
           SELECT domain FROM browsing_history 
           GROUP BY domain 
           ORDER BY COUNT(*) DESC 
           LIMIT 3
         )) as top_domain_pages
      FROM browsing_history
      WHERE timestamp > ?
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]);

    if (!result.length || !result[0].values.length) {
      return 50; // Neutral score
    }

    const [uniqueDomains, uniqueCategories, totalPages, topDomainPages] = result[0].values[0];

    // Calculate diversity metrics
    const domainDiversity = uniqueDomains / Math.max(totalPages * 0.1, 1);
    const categoryDiversity = uniqueCategories / 10; // Normalized to max 10 categories
    const topDomainConcentration = topDomainPages / totalPages;

    // Lower score = more diverse (better)
    const echoScore = Math.round((
      (1 - domainDiversity) * 30 +
      (1 - categoryDiversity) * 30 +
      topDomainConcentration * 40
    ) * 100);

    return Math.min(Math.max(echoScore, 0), 100);
  }

  /**
   * Get diversity breakdown
   */
  async getDiversityBreakdown() {
    const echoScore = await this.calculateEchoChamberScore();
    const userProfile = await this.buildUserProfile();

    return {
      echoScore,
      rating: this.getEchoScoreRating(echoScore),
      metrics: {
        domainConcentration: userProfile.domainConcentration,
        categorySpread: userProfile.categorySpread,
        perspectiveDiversity: userProfile.perspectiveDiversity
      },
      recommendations: await this.getDiversityImprovementTips(echoScore)
    };
  }

  /**
   * Get tips to improve diversity
   */
  async getDiversityImprovementTips(echoScore) {
    const tips = [];

    if (echoScore > 70) {
      tips.push({
        icon: '⚠️',
        title: 'High Echo Chamber Risk',
        action: 'Explore 3+ different sources on topics you care about',
        impact: 'High'
      });
    }

    if (echoScore > 50) {
      tips.push({
        icon: '🌈',
        title: 'Increase Category Diversity',
        action: 'Try reading about a completely new topic this week',
        impact: 'Medium'
      });
    }

    tips.push({
      icon: '🔍',
      title: 'Seek Alternative Perspectives',
      action: 'For every article, find one with an opposing view',
      impact: 'High'
    });

    return tips;
  }

  // ==================== Smart Content Discovery ====================

  /**
   * Get personalized recommendations based on learning gaps
   */
  async getLearningGapRecommendations() {
    const userProfile = await this.buildUserProfile();
    const gaps = await this.identifyLearningGaps(userProfile);

    return gaps.map(gap => ({
      type: 'learning-gap',
      title: `Fill the gap: ${gap.topic}`,
      description: gap.explanation,
      resources: gap.resources,
      expectedBenefit: gap.benefit,
      icon: '📚',
      color: '#10b981'
    }));
  }

  /**
   * Get serendipity recommendations (unexpected but valuable)
   */
  async getSerendipityRecommendations() {
    const userProfile = await this.buildUserProfile();

    // Find interesting connections between user's interests
    const connections = await this.findInterestConnections(userProfile);

    return connections.map(conn => ({
      type: 'serendipity',
      title: `${conn.domain1} meets ${conn.domain2}`,
      description: `Discover how ${conn.domain1} and ${conn.domain2} intersect`,
      insight: conn.insight,
      sources: conn.sources,
      icon: '✨',
      color: '#ec4899'
    }));
  }

  /**
   * Get trending recommendations (with diversity filter)
   */
  async getTrendingRecommendations() {
    // In a real implementation, this would use external APIs
    // For now, return diverse trending topics
    
    return [
      {
        type: 'trending',
        title: 'AI Ethics Debate',
        description: 'Multiple perspectives on AI regulation and safety',
        sources: [
          { title: 'Pro-regulation view', url: '#' },
          { title: 'Free-market view', url: '#' },
          { title: 'Academic perspective', url: '#' }
        ],
        icon: '🔥',
        color: '#ef4444'
      }
    ];
  }

  // ==================== Helper Methods ====================

  /**
   * Build comprehensive user profile
   */
  async buildUserProfile() {
    const db = await this.dbManager.getDatabase();

    // Get category distribution
    const categories = db.exec(`
      SELECT category, COUNT(*) as count,
             SUM(time_spent) as total_time
      FROM browsing_history
      WHERE timestamp > ?
      GROUP BY category
      ORDER BY count DESC
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]);

    // Get domain distribution
    const domains = db.exec(`
      SELECT domain, COUNT(*) as count
      FROM browsing_history
      WHERE timestamp > ?
      GROUP BY domain
      ORDER BY count DESC
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]);

    // Get skills
    const skills = db.exec(`
      SELECT skill, SUM(xp_gained) as total_xp
      FROM skill_activities
      WHERE timestamp > ?
      GROUP BY skill
      ORDER BY total_xp DESC
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]);

    const categoryData = categories.length ? this.formatQueryResults(categories[0]) : [];
    const domainData = domains.length ? this.formatQueryResults(domains[0]) : [];
    const skillData = skills.length ? this.formatQueryResults(skills[0]) : [];

    // Calculate metrics
    const totalPages = categoryData.reduce((sum, c) => sum + c.count, 0);
    const topDomainCount = domainData.slice(0, 3).reduce((sum, d) => sum + d.count, 0);

    return {
      topCategories: categoryData.slice(0, 5).map(c => c.category),
      underexploredCategories: this.getAllCategories().filter(
        c => !categoryData.some(cat => cat.category === c)
      ),
      topDomains: domainData.slice(0, 10).map(d => d.domain),
      topSkills: skillData.slice(0, 5).map(s => s.skill),
      domainConcentration: totalPages > 0 ? topDomainCount / totalPages : 0,
      categorySpread: categoryData.length,
      complexityLevel: this.estimateComplexityLevel(categoryData),
      preferredDepth: this.estimatePreferredDepth(categoryData)
    };
  }

  analyzePerspectives(userProfile) {
    // Simplified perspective analysis
    const { topCategories } = userProfile;

    return topCategories.map(category => ({
      topic: category,
      dominant: 'mainstream',
      alternative: 'alternative',
      confidence: 0.7
    }));
  }

  async findContrarianSources(perspective) {
    // In real implementation, would use AI or external APIs
    return [
      {
        title: `Rethinking ${perspective.topic}`,
        url: '#',
        source: 'Alternative perspectives'
      }
    ];
  }

  async findCategoryConnection(category1, category2) {
    // AI-generated connection insight
    let insight = `${category1} and ${category2} both involve critical thinking and problem-solving.`;

    if (this.aiProcessor) {
      try {
        const prompt = `In one sentence, explain how knowledge in ${category1} can enhance understanding of ${category2}.`;
        insight = await this.aiProcessor.generateResponse(prompt, { maxTokens: 50 });
      } catch (error) {
        console.error('Failed to generate connection insight:', error);
      }
    }

    return {
      insight,
      sources: [
        { title: `${category1} for ${category2} professionals`, url: '#' },
        { title: `Cross-training: ${category1} + ${category2}`, url: '#' }
      ]
    };
  }

  async findChallengingSources(userProfile, level) {
    const { topCategories } = userProfile;

    return topCategories.slice(0, 3).map(category => ({
      title: `Advanced ${category}: ${level} topics`,
      url: '#',
      difficulty: level
    }));
  }

  async identifyLearningGaps(userProfile) {
    // Find foundational knowledge gaps
    const gaps = [];

    for (const skill of userProfile.topSkills) {
      gaps.push({
        topic: `${skill} Fundamentals`,
        explanation: `Strengthen your foundation in ${skill}`,
        resources: [
          { title: `${skill} Core Concepts`, url: '#' },
          { title: `${skill} Best Practices`, url: '#' }
        ],
        benefit: 'Build stronger expertise'
      });
    }

    return gaps.slice(0, 3);
  }

  async findInterestConnections(userProfile) {
    const { topCategories } = userProfile;
    const connections = [];

    if (topCategories.length >= 2) {
      connections.push({
        domain1: topCategories[0],
        domain2: topCategories[1],
        insight: `Discover innovative approaches combining ${topCategories[0]} and ${topCategories[1]}`,
        sources: [
          { title: `${topCategories[0]} × ${topCategories[1]}`, url: '#' }
        ]
      });
    }

    return connections;
  }

  getAllCategories() {
    return [
      'Technology',
      'Science',
      'Business',
      'Design',
      'Writing',
      'Health',
      'Education',
      'Philosophy',
      'Arts',
      'History'
    ];
  }

  estimateComplexityLevel(categoryData) {
    // Simplified - would analyze actual content
    const avgTimeSpent = categoryData.reduce((sum, c) => sum + (c.total_time || 0), 0) / categoryData.length;
    
    if (avgTimeSpent > 600) return 'advanced';
    if (avgTimeSpent > 300) return 'intermediate';
    return 'beginner';
  }

  estimatePreferredDepth(categoryData) {
    const avgTimeSpent = categoryData.reduce((sum, c) => sum + (c.total_time || 0), 0) / categoryData.length;
    
    if (avgTimeSpent > 600) return 'deep-dive';
    if (avgTimeSpent > 180) return 'moderate';
    return 'surface';
  }

  getEchoScoreRating(score) {
    if (score >= 80) return { level: 'High Risk', color: '#ef4444', emoji: '🔴' };
    if (score >= 60) return { level: 'Moderate Risk', color: '#f59e0b', emoji: '🟡' };
    if (score >= 40) return { level: 'Some Diversity', color: '#3b82f6', emoji: '🔵' };
    if (score >= 20) return { level: 'Good Diversity', color: '#10b981', emoji: '🟢' };
    return { level: 'Excellent Diversity', color: '#059669', emoji: '✅' };
  }

  formatQueryResults(queryResult) {
    const columns = queryResult.columns;
    const values = queryResult.values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }
}

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationEngine;
}
