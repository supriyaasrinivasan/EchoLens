// Skill Tracker for EchoLens
// Detects topics, tracks skill development, and suggests courses/resources

export class SkillTracker {
  constructor(aiProcessor, dbManager) {
    this.ai = aiProcessor;
    this.db = dbManager;
    this.skillDatabase = this.initializeSkillDatabase();
  }

  // Initialize skill categories and related resources
  initializeSkillDatabase() {
    return {
      programming: {
        keywords: ['code', 'programming', 'developer', 'software', 'javascript', 'python', 'react', 'node', 'api', 'git', 'typescript', 'html', 'css', 'java', 'c++', 'rust'],
        courses: [
          { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org', type: 'free' },
          { title: 'The Odin Project', url: 'https://www.theodinproject.com', type: 'free' },
          { title: 'Codecademy', url: 'https://www.codecademy.com', type: 'freemium' },
          { title: 'Frontend Masters', url: 'https://frontendmasters.com', type: 'paid' }
        ],
        relatedSkills: ['design', 'ai', 'data-science']
      },
      design: {
        keywords: ['design', 'ui', 'ux', 'figma', 'sketch', 'adobe', 'creative', 'typography', 'color', 'layout', 'prototype'],
        courses: [
          { title: 'Refactoring UI', url: 'https://refactoringui.com', type: 'paid' },
          { title: 'Daily UI Challenge', url: 'https://www.dailyui.co', type: 'free' },
          { title: 'Design Course', url: 'https://designcourse.com', type: 'free' }
        ],
        relatedSkills: ['programming', 'marketing']
      },
      ai: {
        keywords: ['ai', 'machine learning', 'neural network', 'deep learning', 'nlp', 'chatgpt', 'llm', 'artificial intelligence', 'tensorflow', 'pytorch'],
        courses: [
          { title: 'Fast.ai', url: 'https://www.fast.ai', type: 'free' },
          { title: 'DeepLearning.AI', url: 'https://www.deeplearning.ai', type: 'free' },
          { title: 'Coursera ML Specialization', url: 'https://www.coursera.org/specializations/machine-learning-introduction', type: 'freemium' }
        ],
        relatedSkills: ['programming', 'data-science', 'math']
      },
      'data-science': {
        keywords: ['data science', 'analytics', 'visualization', 'statistics', 'pandas', 'numpy', 'tableau', 'sql', 'data analysis'],
        courses: [
          { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'free' },
          { title: 'DataCamp', url: 'https://www.datacamp.com', type: 'freemium' }
        ],
        relatedSkills: ['ai', 'programming', 'business']
      },
      marketing: {
        keywords: ['marketing', 'seo', 'social media', 'content', 'copywriting', 'branding', 'advertising', 'analytics'],
        courses: [
          { title: 'HubSpot Academy', url: 'https://academy.hubspot.com', type: 'free' },
          { title: 'Google Digital Garage', url: 'https://learndigital.withgoogle.com', type: 'free' }
        ],
        relatedSkills: ['design', 'business', 'writing']
      },
      business: {
        keywords: ['business', 'startup', 'entrepreneurship', 'management', 'strategy', 'finance', 'investment', 'saas'],
        courses: [
          { title: 'Y Combinator Startup School', url: 'https://www.startupschool.org', type: 'free' },
          { title: 'Indie Hackers', url: 'https://www.indiehackers.com', type: 'free' }
        ],
        relatedSkills: ['marketing', 'finance']
      },
      writing: {
        keywords: ['writing', 'blog', 'content', 'copywriting', 'journalism', 'author', 'editor', 'storytelling'],
        courses: [
          { title: 'Purdue OWL', url: 'https://owl.purdue.edu', type: 'free' },
          { title: 'Copyblogger', url: 'https://copyblogger.com', type: 'free' }
        ],
        relatedSkills: ['marketing', 'communication']
      },
      productivity: {
        keywords: ['productivity', 'time management', 'notion', 'obsidian', 'gtd', 'workflow', 'organization'],
        courses: [
          { title: 'Getting Things Done', url: 'https://gettingthingsdone.com', type: 'paid' },
          { title: 'Notion Template Gallery', url: 'https://www.notion.so/templates', type: 'free' }
        ],
        relatedSkills: ['personal-development']
      },
      'personal-development': {
        keywords: ['self improvement', 'mindfulness', 'meditation', 'habits', 'psychology', 'mental health', 'wellness'],
        courses: [
          { title: 'Headspace', url: 'https://www.headspace.com', type: 'paid' },
          { title: 'James Clear (Atomic Habits)', url: 'https://jamesclear.com', type: 'free' }
        ],
        relatedSkills: ['productivity', 'health']
      }
    };
  }

  // Detect skills from browsing content
  async detectSkills(content, title, url, topics) {
    const detectedSkills = [];
    const text = `${title} ${content} ${topics.join(' ')}`.toLowerCase();

    // Check each skill category
    for (const [skillName, skillData] of Object.entries(this.skillDatabase)) {
      const matches = skillData.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      );

      if (matches.length > 0) {
        detectedSkills.push({
          skill: skillName,
          confidence: Math.min(matches.length / skillData.keywords.length, 1),
          matchedKeywords: matches,
          timestamp: Date.now()
        });
      }
    }

    // Save detected skills
    if (detectedSkills.length > 0) {
      await this.saveSkillActivity(url, detectedSkills);
    }

    return detectedSkills;
  }

  // Save skill activity to database
  async saveSkillActivity(url, skills) {
    for (const skill of skills) {
      await this.db.saveSkillActivity({
        url,
        skill: skill.skill,
        confidence: skill.confidence,
        keywords: skill.matchedKeywords.join(','),
        timestamp: Date.now()
      });
    }
  }

  // Get skill progress summary
  async getSkillProgress() {
    const skillStats = await this.db.getSkillStats();
    
    // Transform skill stats into the format expected by the UI
    const skills = skillStats.map(skill => ({
      skill: skill.skill,
      totalXP: this.calculateXP(skill),
      activityCount: skill.visit_count || 0,
      totalTime: skill.total_time || 0,
      lastActivity: skill.last_seen,
      firstSeen: skill.first_seen,
      level: this.calculateSkillLevel(skill),
      trend: this.calculateTrend(skill),
      relatedSkills: this.skillDatabase[skill.skill]?.relatedSkills || []
    }));

    const recommendations = await this.generateRecommendations(skillStats);

    return {
      success: true,
      skills: skills,
      recommendations,
      totalSkillsExplored: skillStats.length
    };
  }

  // Calculate XP from activity
  calculateXP(skillData) {
    const { visit_count = 0, total_time = 0 } = skillData;
    
    // XP formula: visits * 5 + (hours * 10)
    const hours = total_time / (1000 * 60 * 60);
    const xp = Math.floor((visit_count * 5) + (hours * 10));
    
    return xp;
  }

  // Calculate skill level based on activity
  calculateSkillLevel(skillData) {
    const { visit_count, total_time } = skillData;
    const hours = total_time / (1000 * 60 * 60);

    // Simple level calculation
    if (hours < 1) return { level: 'Curious', value: 1 };
    if (hours < 5) return { level: 'Exploring', value: 2 };
    if (hours < 20) return { level: 'Learning', value: 3 };
    if (hours < 50) return { level: 'Practicing', value: 4 };
    if (hours < 100) return { level: 'Skilled', value: 5 };
    return { level: 'Expert', value: 6 };
  }

  // Calculate trend (growing, stable, fading)
  calculateTrend(skillData) {
    const { last_seen } = skillData;
    const daysSinceLastSeen = (Date.now() - last_seen) / (1000 * 60 * 60 * 24);

    if (daysSinceLastSeen < 7) return '📈 Growing';
    if (daysSinceLastSeen < 30) return '➡️ Stable';
    return '📉 Fading';
  }

  // Generate course and tutorial recommendations
  async generateRecommendations(skillStats) {
    const recommendations = [];

    // Sort skills by recent activity and time spent
    const topSkills = skillStats
      .sort((a, b) => b.last_seen - a.last_seen)
      .slice(0, 5);

    for (const skill of topSkills) {
      const skillInfo = this.skillDatabase[skill.skill];
      if (!skillInfo) continue;

      const level = this.calculateSkillLevel(skill);
      const xp = this.calculateXP(skill);
      const levelInfo = this.getLevelForXP(xp);

      recommendations.push({
        skill: skill.skill,
        currentLevel: levelInfo.name,
        resources: skillInfo.courses.map(course => ({
          title: course.title,
          url: course.url,
          platform: course.type,
          type: course.type
        })),
        suggestedNext: skillInfo.relatedSkills,
        reason: this.generateRecommendationReason(skill, levelInfo)
      });
    }

    return recommendations;
  }

  // Get level info for XP amount
  getLevelForXP(xp) {
    if (xp >= 1000) return { level: 5, name: 'Expert', color: '#8b5cf6' };
    if (xp >= 500) return { level: 4, name: 'Advanced', color: '#6366f1' };
    if (xp >= 200) return { level: 3, name: 'Intermediate', color: '#3b82f6' };
    if (xp >= 50) return { level: 2, name: 'Learner', color: '#10b981' };
    return { level: 1, name: 'Beginner', color: '#6b7280' };
  }

  // Generate recommendation reasoning
  generateRecommendationReason(skillData, level) {
    const daysSinceLastSeen = (Date.now() - skillData.last_seen) / (1000 * 60 * 60 * 24);

    if (level.value <= 2) {
      return `You're just getting started with ${skillData.skill}. Here are some beginner-friendly resources.`;
    }

    if (daysSinceLastSeen > 30) {
      return `You haven't explored ${skillData.skill} in ${Math.floor(daysSinceLastSeen)} days. Refresh your knowledge with these resources.`;
    }

    if (level.value >= 4) {
      return `You're skilled in ${skillData.skill}! Consider these advanced resources or explore related topics.`;
    }

    return `You're actively learning ${skillData.skill}. Keep building your skills with these resources.`;
  }

  // Get weekly skill summary
  async getWeeklySkillSummary() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklySkills = await this.db.getSkillActivitiesSince(weekAgo);

    const skillCounts = {};
    weeklySkills.forEach(activity => {
      if (!skillCounts[activity.skill]) {
        skillCounts[activity.skill] = { count: 0, time: 0 };
      }
      skillCounts[activity.skill].count++;
      skillCounts[activity.skill].time += activity.time_spent || 0;
    });

    const topSkill = Object.entries(skillCounts)
      .sort((a, b) => b[1].time - a[1].time)[0];

    return {
      totalSkillsExplored: Object.keys(skillCounts).length,
      topSkill: topSkill ? {
        name: topSkill[0],
        count: topSkill[1].count,
        time: topSkill[1].time
      } : null,
      allSkills: Object.entries(skillCounts).map(([skill, data]) => ({
        skill,
        ...data
      }))
    };
  }

  // Generate personalized learning path
  async generateLearningPath(targetSkill) {
    const skillInfo = this.skillDatabase[targetSkill];
    if (!skillInfo) {
      return { error: 'Skill not found' };
    }

    const currentProgress = await this.db.getSkillByName(targetSkill);
    const level = currentProgress ? this.calculateSkillLevel(currentProgress) : { level: 'Beginner', value: 0 };

    return {
      skill: targetSkill,
      currentLevel: level.level,
      recommendedCourses: skillInfo.courses,
      relatedSkills: skillInfo.relatedSkills,
      milestones: [
        { hours: 1, title: 'First Steps', description: 'Get familiar with basic concepts' },
        { hours: 5, title: 'Foundation', description: 'Build core understanding' },
        { hours: 20, title: 'Competence', description: 'Apply knowledge to real projects' },
        { hours: 50, title: 'Proficiency', description: 'Master advanced techniques' },
        { hours: 100, title: 'Expertise', description: 'Teach and create original work' }
      ],
      currentProgress: currentProgress ? {
        hours: (currentProgress.total_time / (1000 * 60 * 60)).toFixed(1),
        visits: currentProgress.visit_count
      } : { hours: 0, visits: 0 }
    };
  }
}
