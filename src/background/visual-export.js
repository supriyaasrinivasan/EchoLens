/**
 * EchoLens Visual Export System
 * Generates beautiful infographics, mind maps, and shareable visuals
 */

class VisualExportSystem {
  constructor(dbManager) {
    this.dbManager = dbManager;
  }

  /**
   * Initialize visual export system
   */
  async initialize() {
    console.log('Visual Export System initialized');
  }

  // ==================== Infographic Generation ====================

  /**
   * Generate learning journey infographic
   */
  async generateLearningInfographic(options = {}) {
    const {
      startDate = Date.now() - 30 * 24 * 60 * 60 * 1000,
      endDate = Date.now(),
      style = 'modern', // modern, minimal, colorful
      includeStats = true,
      includeSkills = true,
      includeAchievements = true
    } = options;

    const data = await this.collectInfographicData(startDate, endDate);

    return {
      type: 'learning-journey',
      style,
      data,
      template: this.getLearningJourneyTemplate(style),
      exportFormats: ['PNG', 'SVG', 'PDF'],
      socialFormats: {
        linkedin: this.generateLinkedInCard(data),
        twitter: this.generateTwitterCard(data),
        instagram: this.generateInstagramCard(data)
      }
    };
  }

  /**
   * Generate mind map visualization
   */
  async generateMindMap(options = {}) {
    const {
      centerTopic = 'My Knowledge',
      depth = 3,
      includeRelationships = true,
      layout = 'radial', // radial, tree, force
      colorScheme = 'gradient'
    } = options;

    const db = await this.dbManager.getDatabase();

    // Get browsing data grouped by category
    const categories = db.exec(`
      SELECT category, COUNT(*) as count, 
             GROUP_CONCAT(DISTINCT domain) as domains
      FROM browsing_history
      WHERE timestamp > ?
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]);

    // Get skills data
    const skills = db.exec(`
      SELECT skill, SUM(xp_gained) as total_xp
      FROM skill_activities
      WHERE timestamp > ?
      GROUP BY skill
      ORDER BY total_xp DESC
      LIMIT 8
    `, [Date.now() - 30 * 24 * 60 * 60 * 1000]);

    const mindMapData = {
      center: {
        label: centerTopic,
        type: 'root'
      },
      branches: []
    };

    // Add category branches
    if (categories.length > 0) {
      const categoryData = this.formatQueryResults(categories[0]);
      
      categoryData.forEach(cat => {
        const domains = cat.domains ? cat.domains.split(',') : [];
        
        mindMapData.branches.push({
          label: cat.category,
          type: 'category',
          weight: cat.count,
          children: domains.slice(0, 5).map(domain => ({
            label: domain,
            type: 'domain'
          }))
        });
      });
    }

    // Add skill branches
    if (skills.length > 0) {
      const skillData = this.formatQueryResults(skills[0]);
      
      skillData.forEach(skill => {
        mindMapData.branches.push({
          label: skill.skill,
          type: 'skill',
          weight: skill.total_xp,
          xp: skill.total_xp
        });
      });
    }

    return {
      type: 'mind-map',
      layout,
      colorScheme,
      data: mindMapData,
      svg: this.generateMindMapSVG(mindMapData, layout, colorScheme),
      exportFormats: ['PNG', 'SVG', 'PDF', 'Interactive HTML']
    };
  }

  /**
   * Generate memory graph visualization
   */
  async generateMemoryGraph(options = {}) {
    const {
      timeRange = 90, // days
      nodeLimit = 50,
      showConnections = true,
      clusterByCategory = true
    } = options;

    const db = await this.dbManager.getDatabase();
    const startDate = Date.now() - (timeRange * 24 * 60 * 60 * 1000);

    // Get browsing data
    const pages = db.exec(`
      SELECT url, title, domain, category, timestamp, time_spent
      FROM browsing_history
      WHERE timestamp > ?
      ORDER BY time_spent DESC
      LIMIT ?
    `, [startDate, nodeLimit]);

    if (!pages.length) {
      return { error: 'No data available for memory graph' };
    }

    const pageData = this.formatQueryResults(pages[0]);

    // Build graph structure
    const nodes = pageData.map((page, index) => ({
      id: index,
      label: page.title || page.url,
      url: page.url,
      domain: page.domain,
      category: page.category,
      timeSpent: page.time_spent,
      timestamp: page.timestamp,
      size: Math.log(page.time_spent + 1) * 3
    }));

    const edges = [];

    if (showConnections) {
      // Create edges based on shared domains or categories
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].domain === nodes[j].domain) {
            edges.push({
              source: i,
              target: j,
              type: 'same-domain',
              weight: 2
            });
          } else if (nodes[i].category === nodes[j].category) {
            edges.push({
              source: i,
              target: j,
              type: 'same-category',
              weight: 1
            });
          }
        }
      }
    }

    return {
      type: 'memory-graph',
      data: {
        nodes,
        edges
      },
      clusterByCategory,
      exportFormats: ['PNG', 'SVG', 'Interactive HTML', 'JSON']
    };
  }

  // ==================== Social Media Cards ====================

  /**
   * Generate LinkedIn-optimized card
   */
  generateLinkedInCard(data) {
    const { totalPages, totalTime, topSkills, achievements } = data;

    const hours = Math.round(totalTime / 3600);
    const topSkill = topSkills && topSkills.length > 0 ? topSkills[0].skill : 'Learning';

    return {
      dimensions: { width: 1200, height: 627 },
      template: 'linkedin',
      content: {
        headline: `🚀 ${hours} hours of focused learning this month`,
        subheadline: `Explored ${totalPages} pages across ${topSkills?.length || 0} different skills`,
        highlight: topSkill,
        stats: [
          { label: 'Pages', value: totalPages },
          { label: 'Skills', value: topSkills?.length || 0 },
          { label: 'Achievements', value: achievements || 0 }
        ],
        footer: 'Tracked with EchoLens',
        colors: {
          primary: '#0077b5',
          secondary: '#ffffff',
          accent: '#00a0dc'
        }
      },
      html: this.generateLinkedInHTML(data)
    };
  }

  /**
   * Generate Twitter-optimized card
   */
  generateTwitterCard(data) {
    const { totalPages, topSkills } = data;

    return {
      dimensions: { width: 1200, height: 675 },
      template: 'twitter',
      content: {
        headline: `📚 My Learning Stats`,
        stats: [
          `${totalPages} pages explored`,
          `${topSkills?.length || 0} skills tracked`,
          `${topSkills && topSkills[0] ? topSkills[0].skill : 'Multiple'} focus`
        ],
        hashtags: ['Learning', 'ProductivityTools', 'KnowledgeTracking'],
        footer: 'via @EchoLens',
        colors: {
          primary: '#1da1f2',
          secondary: '#ffffff',
          accent: '#14171a'
        }
      },
      html: this.generateTwitterHTML(data)
    };
  }

  /**
   * Generate Instagram-optimized card
   */
  generateInstagramCard(data) {
    return {
      dimensions: { width: 1080, height: 1080 },
      template: 'instagram',
      content: {
        headline: 'My Learning Journey',
        visualStyle: 'gradient-modern',
        data,
        colors: {
          gradient: ['#833ab4', '#fd1d1d', '#fcb045']
        }
      },
      html: this.generateInstagramHTML(data)
    };
  }

  // ==================== PDF Export ====================

  /**
   * Generate comprehensive PDF report
   */
  async generatePDFReport(options = {}) {
    const {
      title = 'EchoLens Learning Report',
      period = 'month',
      includeSections = ['overview', 'skills', 'achievements', 'analytics', 'reflection']
    } = options;

    const data = await this.collectReportData(period);

    return {
      type: 'pdf-report',
      title,
      sections: includeSections.map(section => ({
        name: section,
        content: this.generateSectionContent(section, data)
      })),
      metadata: {
        generatedAt: Date.now(),
        period,
        pageCount: includeSections.length + 2 // Cover + sections + summary
      },
      instructions: [
        'This PDF can be generated using a library like jsPDF',
        'Include charts using Chart.js or D3.js',
        'Export as base64 or blob for download'
      ]
    };
  }

  // ==================== Data Collection ====================

  async collectInfographicData(startDate, endDate) {
    const db = await this.dbManager.getDatabase();

    // Get browsing stats
    const browsingStats = db.exec(`
      SELECT 
        COUNT(*) as total_pages,
        SUM(time_spent) as total_time,
        COUNT(DISTINCT domain) as unique_domains,
        COUNT(DISTINCT category) as unique_categories
      FROM browsing_history
      WHERE timestamp BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Get top skills
    const topSkills = db.exec(`
      SELECT skill, SUM(xp_gained) as total_xp
      FROM skill_activities
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY skill
      ORDER BY total_xp DESC
      LIMIT 5
    `, [startDate, endDate]);

    // Get achievements count
    const achievements = db.exec(`
      SELECT COUNT(*) as count
      FROM achievements
      WHERE earned = 1 AND earned_at BETWEEN ? AND ?
    `, [startDate, endDate]);

    return {
      totalPages: browsingStats[0]?.values[0]?.[0] || 0,
      totalTime: browsingStats[0]?.values[0]?.[1] || 0,
      uniqueDomains: browsingStats[0]?.values[0]?.[2] || 0,
      uniqueCategories: browsingStats[0]?.values[0]?.[3] || 0,
      topSkills: topSkills.length ? this.formatQueryResults(topSkills[0]) : [],
      achievements: achievements[0]?.values[0]?.[0] || 0,
      period: {
        start: startDate,
        end: endDate
      }
    };
  }

  async collectReportData(period) {
    let startDate;
    const endDate = Date.now();

    switch (period) {
      case 'week':
        startDate = endDate - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        startDate = endDate - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'year':
        startDate = endDate - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = endDate - 30 * 24 * 60 * 60 * 1000;
    }

    return await this.collectInfographicData(startDate, endDate);
  }

  // ==================== Template Generators ====================

  getLearningJourneyTemplate(style) {
    const templates = {
      modern: {
        layout: 'grid',
        fonts: ['Inter', 'SF Pro Display'],
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          background: '#ffffff',
          text: '#1f2937'
        },
        components: ['hero-stat', 'skill-grid', 'achievement-badges', 'timeline']
      },
      minimal: {
        layout: 'vertical',
        fonts: ['Helvetica Neue', 'Arial'],
        colors: {
          primary: '#000000',
          secondary: '#666666',
          background: '#ffffff',
          text: '#333333'
        },
        components: ['simple-stats', 'skill-list', 'clean-timeline']
      },
      colorful: {
        layout: 'cards',
        fonts: ['Poppins', 'Roboto'],
        colors: {
          primary: '#ff6b6b',
          secondary: '#4ecdc4',
          accent: '#ffe66d',
          background: '#f7fff7',
          text: '#2d3142'
        },
        components: ['gradient-cards', 'animated-skills', 'achievement-grid', 'colorful-timeline']
      }
    };

    return templates[style] || templates.modern;
  }

  generateMindMapSVG(data, layout, colorScheme) {
    // SVG generation logic - simplified for demo
    const width = 1200;
    const height = 800;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Center node
    svg += `<circle cx="${width/2}" cy="${height/2}" r="50" fill="#6366f1"/>`;
    svg += `<text x="${width/2}" y="${height/2}" text-anchor="middle" fill="white" font-size="16">${data.center.label}</text>`;

    // Branches (simplified - would use actual layout algorithm)
    const angleStep = (2 * Math.PI) / data.branches.length;
    data.branches.forEach((branch, index) => {
      const angle = index * angleStep;
      const x = width/2 + Math.cos(angle) * 200;
      const y = height/2 + Math.sin(angle) * 200;

      svg += `<line x1="${width/2}" y1="${height/2}" x2="${x}" y2="${y}" stroke="#cbd5e1" stroke-width="2"/>`;
      svg += `<circle cx="${x}" cy="${y}" r="30" fill="#8b5cf6"/>`;
      svg += `<text x="${x}" y="${y}" text-anchor="middle" fill="white" font-size="12">${branch.label.substring(0, 15)}</text>`;
    });

    svg += '</svg>';

    return svg;
  }

  generateLinkedInHTML(data) {
    return `
      <div class="linkedin-card" style="width: 1200px; height: 627px; background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%); padding: 60px; color: white; font-family: Arial;">
        <h1 style="font-size: 48px; margin-bottom: 20px;">🚀 ${Math.round(data.totalTime / 3600)} Hours of Focused Learning</h1>
        <p style="font-size: 24px; opacity: 0.9;">Explored ${data.totalPages} pages across ${data.topSkills.length} different skills</p>
        <div style="display: flex; gap: 40px; margin-top: 60px;">
          <div style="text-align: center;">
            <div style="font-size: 48px; font-weight: bold;">${data.totalPages}</div>
            <div style="font-size: 18px; opacity: 0.8;">Pages</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 48px; font-weight: bold;">${data.topSkills.length}</div>
            <div style="font-size: 18px; opacity: 0.8;">Skills</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 48px; font-weight: bold;">${data.achievements}</div>
            <div style="font-size: 18px; opacity: 0.8;">Achievements</div>
          </div>
        </div>
        <div style="position: absolute; bottom: 40px; right: 60px; font-size: 18px; opacity: 0.8;">Tracked with EchoLens</div>
      </div>
    `;
  }

  generateTwitterHTML(data) {
    return `
      <div class="twitter-card" style="width: 1200px; height: 675px; background: #1da1f2; padding: 60px; color: white; font-family: Arial;">
        <h1 style="font-size: 72px; margin-bottom: 40px;">📚 My Learning Stats</h1>
        <div style="font-size: 32px; line-height: 1.6;">
          <p>✓ ${data.totalPages} pages explored</p>
          <p>✓ ${data.topSkills.length} skills tracked</p>
          <p>✓ ${data.topSkills[0]?.skill || 'Multiple areas'} focus</p>
        </div>
        <div style="position: absolute; bottom: 40px; left: 60px; font-size: 24px;">#Learning #ProductivityTools</div>
        <div style="position: absolute; bottom: 40px; right: 60px; font-size: 24px;">via @EchoLens</div>
      </div>
    `;
  }

  generateInstagramHTML(data) {
    return `
      <div class="instagram-card" style="width: 1080px; height: 1080px; background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); padding: 80px; color: white; font-family: Arial; text-align: center;">
        <h1 style="font-size: 64px; margin-bottom: 60px;">My Learning Journey</h1>
        <div style="background: rgba(255,255,255,0.2); padding: 60px; border-radius: 20px; backdrop-filter: blur(10px);">
          <div style="font-size: 96px; font-weight: bold; margin-bottom: 20px;">${data.totalPages}</div>
          <div style="font-size: 32px; margin-bottom: 60px;">Pages Explored</div>
          
          <div style="font-size: 96px; font-weight: bold; margin-bottom: 20px;">${data.topSkills.length}</div>
          <div style="font-size: 32px;">Skills Tracked</div>
        </div>
        <div style="margin-top: 60px; font-size: 28px; opacity: 0.9;">EchoLens • Knowledge Tracking</div>
      </div>
    `;
  }

  generateSectionContent(section, data) {
    const sections = {
      overview: {
        title: 'Overview',
        content: `
          Total Pages: ${data.totalPages}
          Total Time: ${Math.round(data.totalTime / 3600)} hours
          Unique Domains: ${data.uniqueDomains}
        `
      },
      skills: {
        title: 'Skills Progress',
        content: data.topSkills.map(s => `${s.skill}: ${s.total_xp} XP`).join('\n')
      },
      achievements: {
        title: 'Achievements',
        content: `${data.achievements} achievements unlocked this period`
      },
      analytics: {
        title: 'Analytics',
        content: 'Detailed charts and graphs would go here'
      },
      reflection: {
        title: 'Reflection',
        content: 'AI-generated insights about learning patterns'
      }
    };

    return sections[section] || { title: section, content: 'Content not available' };
  }

  // ==================== Helper Methods ====================

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
  module.exports = VisualExportSystem;
}
