/**
 * EchoLens Collaboration Module
 * Handles Shared EchoSpaces, knowledge exports, and integration with external tools
 */

class CollaborationManager {
  constructor(dbManager, aiProcessor) {
    this.dbManager = dbManager;
    this.aiProcessor = aiProcessor;
  }

  /**
   * Initialize collaboration tables in database
   */
  async initialize() {
    try {
      await this.createTables();
      console.log('Collaboration module initialized');
    } catch (error) {
      console.error('Failed to initialize collaboration module:', error);
    }
  }

  async createTables() {
    const db = await this.dbManager.getDatabase();
    
    // EchoSpaces - Shared knowledge collections
    db.run(`
      CREATE TABLE IF NOT EXISTS echo_spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT,
        is_public BOOLEAN DEFAULT 0,
        password_hash TEXT,
        created_at INTEGER NOT NULL,
        last_updated INTEGER NOT NULL
      )
    `);

    // EchoSpace members
    db.run(`
      CREATE TABLE IF NOT EXISTS space_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'viewer',
        joined_at INTEGER NOT NULL,
        UNIQUE(space_id, user_id)
      )
    `);

    // Shared items in EchoSpaces
    db.run(`
      CREATE TABLE IF NOT EXISTS space_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        space_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        item_id INTEGER NOT NULL,
        shared_by TEXT,
        shared_at INTEGER NOT NULL,
        notes TEXT
      )
    `);

    // Export history
    db.run(`
      CREATE TABLE IF NOT EXISTS export_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        export_type TEXT NOT NULL,
        destination TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        items_count INTEGER,
        created_at INTEGER NOT NULL,
        completed_at INTEGER,
        error_message TEXT
      )
    `);

    // Knowledge digests
    db.run(`
      CREATE TABLE IF NOT EXISTS knowledge_digests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        digest_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        period_start INTEGER NOT NULL,
        period_end INTEGER NOT NULL,
        summary TEXT,
        insights TEXT,
        top_domains TEXT,
        top_skills TEXT,
        created_at INTEGER NOT NULL
      )
    `);

    await this.dbManager.saveDatabase();
  }

  // ==================== EchoSpace Management ====================

  /**
   * Create a new shared EchoSpace
   */
  async createEchoSpace(config) {
    const {
      name,
      description = '',
      isPublic = false,
      password = null,
      ownerId = 'local-user'
    } = config;

    const spaceId = this.generateSpaceId();
    const now = Date.now();

    const db = await this.dbManager.getDatabase();
    
    const passwordHash = password ? await this.hashPassword(password) : null;

    db.run(
      `INSERT INTO echo_spaces (space_id, name, description, owner_id, is_public, password_hash, created_at, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [spaceId, name, description, ownerId, isPublic ? 1 : 0, passwordHash, now, now]
    );

    // Add owner as admin member
    db.run(
      `INSERT INTO space_members (space_id, user_id, role, joined_at)
       VALUES (?, ?, 'admin', ?)`,
      [spaceId, ownerId, now]
    );

    await this.dbManager.saveDatabase();

    return {
      spaceId,
      name,
      description,
      isPublic,
      createdAt: now
    };
  }

  /**
   * Get all EchoSpaces for the current user
   */
  async getMyEchoSpaces() {
    const db = await this.dbManager.getDatabase();
    
    const result = db.exec(`
      SELECT 
        s.space_id,
        s.name,
        s.description,
        s.is_public,
        s.created_at,
        s.last_updated,
        m.role,
        (SELECT COUNT(*) FROM space_items WHERE space_id = s.space_id) as items_count,
        (SELECT COUNT(*) FROM space_members WHERE space_id = s.space_id) as members_count
      FROM echo_spaces s
      LEFT JOIN space_members m ON s.space_id = m.space_id
      ORDER BY s.last_updated DESC
    `);

    if (!result.length) return [];

    return this.formatQueryResults(result[0]);
  }

  /**
   * Add item to an EchoSpace
   */
  async addToEchoSpace(spaceId, itemType, itemId, notes = '') {
    const db = await this.dbManager.getDatabase();
    const now = Date.now();

    db.run(
      `INSERT INTO space_items (space_id, item_type, item_id, shared_by, shared_at, notes)
       VALUES (?, ?, ?, 'local-user', ?, ?)`,
      [spaceId, itemType, itemId, now, notes]
    );

    // Update space last_updated
    db.run(
      `UPDATE echo_spaces SET last_updated = ? WHERE space_id = ?`,
      [now, spaceId]
    );

    await this.dbManager.saveDatabase();

    return { success: true, spaceId, itemType, itemId };
  }

  /**
   * Get items from an EchoSpace
   */
  async getEchoSpaceItems(spaceId, options = {}) {
    const { itemType = null, limit = 50, offset = 0 } = options;

    const db = await this.dbManager.getDatabase();
    
    let query = `
      SELECT * FROM space_items 
      WHERE space_id = ?
    `;
    const params = [spaceId];

    if (itemType) {
      query += ' AND item_type = ?';
      params.push(itemType);
    }

    query += ` ORDER BY shared_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = db.exec(query, params);
    if (!result.length) return [];

    return this.formatQueryResults(result[0]);
  }

  /**
   * Invite member to EchoSpace
   */
  async inviteMember(spaceId, userId, role = 'viewer') {
    const db = await this.dbManager.getDatabase();
    const now = Date.now();

    try {
      db.run(
        `INSERT INTO space_members (space_id, user_id, role, joined_at)
         VALUES (?, ?, ?, ?)`,
        [spaceId, userId, role, now]
      );

      await this.dbManager.saveDatabase();
      return { success: true, userId, role };
    } catch (error) {
      console.error('Failed to invite member:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Knowledge Digest ====================

  /**
   * Generate a shareable knowledge digest
   */
  async generateKnowledgeDigest(options = {}) {
    const {
      startDate = Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
      endDate = Date.now(),
      includeInsights = true
    } = options;

    const db = await this.dbManager.getDatabase();

    // Get browsing data for the period
    const browsingData = db.exec(`
      SELECT 
        url,
        title,
        domain,
        timestamp,
        time_spent,
        category
      FROM browsing_history
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `, [startDate, endDate]);

    if (!browsingData.length) {
      return { error: 'No data found for this period' };
    }

    const items = this.formatQueryResults(browsingData[0]);

    // Analyze data
    const topDomains = this.getTopDomains(items, 10);
    const topCategories = this.getTopCategories(items);
    
    // Get skills for this period
    const skillsData = db.exec(`
      SELECT skill, SUM(xp_gained) as total_xp
      FROM skill_activities
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY skill
      ORDER BY total_xp DESC
      LIMIT 5
    `, [startDate, endDate]);

    const topSkills = skillsData.length ? this.formatQueryResults(skillsData[0]) : [];

    // Generate AI insights if requested
    let insights = '';
    if (includeInsights && this.aiProcessor) {
      insights = await this.generateDigestInsights(items, topDomains, topSkills);
    }

    const digest = {
      digestId: this.generateDigestId(),
      title: `Knowledge Digest: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
      periodStart: startDate,
      periodEnd: endDate,
      summary: this.generateDigestSummary(items, topDomains, topCategories),
      insights,
      topDomains: JSON.stringify(topDomains),
      topSkills: JSON.stringify(topSkills),
      createdAt: Date.now(),
      stats: {
        totalPages: items.length,
        totalTime: items.reduce((sum, item) => sum + (item.time_spent || 0), 0),
        uniqueDomains: topDomains.length,
        skillsGained: topSkills.length
      }
    };

    // Save digest
    db.run(
      `INSERT INTO knowledge_digests 
       (digest_id, title, period_start, period_end, summary, insights, top_domains, top_skills, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        digest.digestId,
        digest.title,
        digest.periodStart,
        digest.periodEnd,
        digest.summary,
        digest.insights,
        digest.topDomains,
        digest.topSkills,
        digest.createdAt
      ]
    );

    await this.dbManager.saveDatabase();

    return digest;
  }

  /**
   * Get saved knowledge digests
   */
  async getSavedDigests(limit = 10) {
    const db = await this.dbManager.getDatabase();
    
    const result = db.exec(`
      SELECT * FROM knowledge_digests
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);

    if (!result.length) return [];

    return this.formatQueryResults(result[0]).map(digest => ({
      ...digest,
      topDomains: JSON.parse(digest.top_domains || '[]'),
      topSkills: JSON.parse(digest.top_skills || '[]')
    }));
  }

  // ==================== External Integrations ====================

  /**
   * Export to Notion
   */
  async exportToNotion(data, config) {
    const {
      databaseId,
      apiKey,
      itemType = 'browsing_history'
    } = config;

    try {
      const exportId = await this.recordExport('notion', 'pending', data.length);

      // Format data for Notion
      const notionPages = data.map(item => this.formatForNotion(item, itemType));

      // In a real implementation, this would use Notion API
      // For now, return formatted data
      const result = {
        exportId,
        destination: 'Notion',
        itemsCount: notionPages.length,
        data: notionPages,
        instructions: [
          '1. Copy the formatted data below',
          '2. Go to your Notion database',
          '3. Click "Import" → "CSV"',
          '4. Paste the data or use the generated CSV file'
        ]
      };

      await this.updateExportStatus(exportId, 'completed');

      return result;
    } catch (error) {
      console.error('Notion export failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Export to Obsidian
   */
  async exportToObsidian(data, config) {
    const {
      vaultPath,
      format = 'markdown',
      includeTags = true
    } = config;

    try {
      const exportId = await this.recordExport('obsidian', 'pending', data.length);

      const markdownFiles = data.map(item => ({
        filename: this.generateObsidianFilename(item),
        content: this.formatForObsidian(item, includeTags)
      }));

      await this.updateExportStatus(exportId, 'completed');

      return {
        exportId,
        destination: 'Obsidian',
        itemsCount: markdownFiles.length,
        files: markdownFiles,
        instructions: [
          '1. Download the generated markdown files',
          `2. Copy them to your Obsidian vault: ${vaultPath || '[Your Vault Path]'}`,
          '3. Files will appear in Obsidian with proper formatting and tags'
        ]
      };
    } catch (error) {
      console.error('Obsidian export failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Export to Slack
   */
  async exportToSlack(digest, config) {
    const {
      webhookUrl,
      channel,
      includeStats = true
    } = config;

    try {
      const exportId = await this.recordExport('slack', 'pending', 1);

      const slackMessage = this.formatForSlack(digest, includeStats);

      // In a real implementation, this would POST to Slack webhook
      const result = {
        exportId,
        destination: 'Slack',
        channel,
        message: slackMessage,
        instructions: [
          '1. Set up a Slack webhook in your workspace',
          '2. Copy the message below and send it to your channel',
          '3. Or use the Slack API to send automatically'
        ]
      };

      await this.updateExportStatus(exportId, 'completed');

      return result;
    } catch (error) {
      console.error('Slack export failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Export to CSV
   */
  async exportToCSV(data, columns) {
    try {
      const exportId = await this.recordExport('csv', 'pending', data.length);

      const csvContent = this.generateCSV(data, columns);

      await this.updateExportStatus(exportId, 'completed');

      return {
        exportId,
        destination: 'CSV File',
        itemsCount: data.length,
        content: csvContent,
        filename: `echolens-export-${Date.now()}.csv`
      };
    } catch (error) {
      console.error('CSV export failed:', error);
      return { error: error.message };
    }
  }

  // ==================== Helper Methods ====================

  formatForNotion(item, itemType) {
    if (itemType === 'browsing_history') {
      return {
        'Title': item.title || item.url,
        'URL': item.url,
        'Domain': item.domain,
        'Category': item.category || 'General',
        'Time Spent': `${Math.round((item.time_spent || 0) / 60)} min`,
        'Date': new Date(item.timestamp).toLocaleDateString(),
        'Tags': this.extractTags(item)
      };
    }
    return item;
  }

  formatForObsidian(item, includeTags) {
    const date = new Date(item.timestamp).toISOString().split('T')[0];
    const tags = includeTags ? this.extractTags(item) : '';
    
    return `---
title: ${item.title || 'Untitled'}
url: ${item.url}
domain: ${item.domain}
date: ${date}
category: ${item.category || 'general'}
${tags ? `tags: [${tags}]` : ''}
---

# ${item.title || 'Untitled'}

**Source:** ${item.url}
**Domain:** ${item.domain}
**Visited:** ${new Date(item.timestamp).toLocaleString()}
**Time Spent:** ${Math.round((item.time_spent || 0) / 60)} minutes

## Notes

${item.notes || 'No notes available.'}

## Highlights

${item.highlights || 'No highlights captured.'}
`;
  }

  formatForSlack(digest, includeStats) {
    const { title, summary, stats, insights } = digest;

    let message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📚 ${title}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: summary
          }
        }
      ]
    };

    if (includeStats && stats) {
      message.blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Pages:*\n${stats.totalPages}`
          },
          {
            type: 'mrkdwn',
            text: `*Total Time:*\n${Math.round(stats.totalTime / 3600)} hours`
          },
          {
            type: 'mrkdwn',
            text: `*Unique Domains:*\n${stats.uniqueDomains}`
          },
          {
            type: 'mrkdwn',
            text: `*Skills Gained:*\n${stats.skillsGained}`
          }
        ]
      });
    }

    if (insights) {
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🧠 Insights:*\n${insights}`
        }
      });
    }

    return message;
  }

  generateCSV(data, columns) {
    if (!data.length) return '';

    const headers = columns || Object.keys(data[0]);
    const rows = data.map(item => 
      headers.map(col => {
        const value = item[col];
        // Escape quotes and wrap in quotes if contains comma
        if (value === null || value === undefined) return '';
        const strValue = String(value);
        return strValue.includes(',') ? `"${strValue.replace(/"/g, '""')}"` : strValue;
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  generateObsidianFilename(item) {
    const date = new Date(item.timestamp).toISOString().split('T')[0];
    const title = (item.title || item.url)
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .substring(0, 50);
    return `${date}-${title}.md`;
  }

  extractTags(item) {
    const tags = [];
    if (item.category) tags.push(item.category);
    if (item.domain) tags.push(item.domain.replace(/\./g, '-'));
    return tags.join(', ');
  }

  getTopDomains(items, limit = 10) {
    const domainCounts = {};
    items.forEach(item => {
      if (item.domain) {
        domainCounts[item.domain] = (domainCounts[item.domain] || 0) + 1;
      }
    });

    return Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([domain, count]) => ({ domain, count }));
  }

  getTopCategories(items) {
    const categoryCounts = {};
    items.forEach(item => {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }

  generateDigestSummary(items, topDomains, topCategories) {
    const totalTime = items.reduce((sum, item) => sum + (item.time_spent || 0), 0);
    const hours = Math.round(totalTime / 3600);

    return `Explored ${items.length} pages across ${topDomains.length} domains, spending ${hours} hours learning. Top focus areas: ${topCategories.slice(0, 3).map(c => c.category).join(', ')}.`;
  }

  async generateDigestInsights(items, topDomains, topSkills) {
    if (!this.aiProcessor) return '';

    const context = `
      Analyzed ${items.length} pages visited.
      Top domains: ${topDomains.slice(0, 5).map(d => d.domain).join(', ')}
      Skills gained: ${topSkills.map(s => s.skill).join(', ')}
    `;

    try {
      const prompt = `Based on this browsing data, provide 2-3 key insights about the learning patterns:\n${context}`;
      const response = await this.aiProcessor.generateResponse(prompt, { maxTokens: 150 });
      return response;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return '';
    }
  }

  async recordExport(destination, status, itemsCount) {
    const db = await this.dbManager.getDatabase();
    const now = Date.now();

    db.run(
      `INSERT INTO export_history (export_type, destination, status, items_count, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      ['manual', destination, status, itemsCount, now]
    );

    await this.dbManager.saveDatabase();

    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  }

  async updateExportStatus(exportId, status, errorMessage = null) {
    const db = await this.dbManager.getDatabase();
    const now = Date.now();

    db.run(
      `UPDATE export_history 
       SET status = ?, completed_at = ?, error_message = ?
       WHERE id = ?`,
      [status, now, errorMessage, exportId]
    );

    await this.dbManager.saveDatabase();
  }

  async getExportHistory(limit = 20) {
    const db = await this.dbManager.getDatabase();
    
    const result = db.exec(`
      SELECT * FROM export_history
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);

    if (!result.length) return [];
    return this.formatQueryResults(result[0]);
  }

  generateSpaceId() {
    return 'space_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateDigestId() {
    return 'digest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async hashPassword(password) {
    // Simple hash for demo - in production use crypto.subtle
    return btoa(password);
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
  module.exports = CollaborationManager;
}
