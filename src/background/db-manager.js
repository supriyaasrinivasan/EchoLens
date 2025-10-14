// SQLite Database Manager for EchoLens
// Handles all database operations using sql.js

import initSqlJs from 'sql.js';

export class DatabaseManager {
  constructor() {
    this.db = null;
    this.SQL = null;
    this.dbName = 'echolens.db';
    this.isInitialized = false;
  }

  // Initialize database
  async init() {
    if (this.isInitialized) return;

    try {
      // Initialize SQL.js
      this.SQL = await initSqlJs({
        locateFile: file => `dist/${file}`
      });

      // Try to load existing database from chrome storage
      const result = await chrome.storage.local.get([this.dbName]);
      
      if (result[this.dbName]) {
        // Load existing database
        const uint8Array = new Uint8Array(result[this.dbName]);
        this.db = new this.SQL.Database(uint8Array);
        console.log('✅ Loaded existing database');
      } else {
        // Create new database
        this.db = new this.SQL.Database();
        await this.createTables();
        console.log('✅ Created new database');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  // Create database tables
  async createTables() {
    const schema = `
      -- Visits table
      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        url_hash TEXT NOT NULL,
        title TEXT,
        first_visit INTEGER NOT NULL,
        last_visit INTEGER NOT NULL,
        visit_count INTEGER DEFAULT 0,
        total_time_spent INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        time_spent INTEGER DEFAULT 0,
        scroll_depth REAL DEFAULT 0,
        interactions INTEGER DEFAULT 0,
        highlight_count INTEGER DEFAULT 0,
        FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE
      );

      -- Highlights table
      CREATE TABLE IF NOT EXISTS highlights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE
      );

      -- AI Insights table
      CREATE TABLE IF NOT EXISTS insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL UNIQUE,
        summary TEXT,
        topics TEXT,
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE
      );

      -- Tags table
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      -- Visit Tags junction table
      CREATE TABLE IF NOT EXISTS visit_tags (
        visit_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (visit_id, tag_id),
        FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
      );

      -- Indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_visits_url_hash ON visits(url_hash);
      CREATE INDEX IF NOT EXISTS idx_visits_last_visit ON visits(last_visit);
      CREATE INDEX IF NOT EXISTS idx_sessions_visit_id ON sessions(visit_id);
      CREATE INDEX IF NOT EXISTS idx_highlights_visit_id ON highlights(visit_id);
      CREATE INDEX IF NOT EXISTS idx_insights_visit_id ON insights(visit_id);
      CREATE INDEX IF NOT EXISTS idx_visit_tags_visit_id ON visit_tags(visit_id);
      CREATE INDEX IF NOT EXISTS idx_visit_tags_tag_id ON visit_tags(tag_id);
    `;

    this.db.run(schema);
    await this.saveDatabase();
  }

  // Save database to chrome storage
  async saveDatabase() {
    if (!this.db) return;

    try {
      const data = this.db.export();
      await chrome.storage.local.set({ [this.dbName]: Array.from(data) });
    } catch (error) {
      console.error('❌ Error saving database:', error);
    }
  }

  // Hash URL for consistent keys
  hashURL(url) {
    return url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
  }

  // Get or create visit record
  async getOrCreateVisit(url, title) {
    const urlHash = this.hashURL(url);
    
    // Try to get existing visit
    const stmt = this.db.prepare('SELECT * FROM visits WHERE url_hash = ?');
    stmt.bind([urlHash]);
    
    let visit = null;
    if (stmt.step()) {
      visit = stmt.getAsObject();
    }
    stmt.free();

    if (!visit) {
      // Create new visit
      const now = Date.now();
      this.db.run(
        'INSERT INTO visits (url, url_hash, title, first_visit, last_visit, visit_count) VALUES (?, ?, ?, ?, ?, ?)',
        [url, urlHash, title, now, now, 0]
      );
      
      const stmt2 = this.db.prepare('SELECT * FROM visits WHERE url_hash = ?');
      stmt2.bind([urlHash]);
      if (stmt2.step()) {
        visit = stmt2.getAsObject();
      }
      stmt2.free();
    }

    return visit;
  }

  // Update visit
  async updateVisit(context) {
    const { url, title, timeSpent, scrollDepth, interactions, highlights } = context;
    
    const visit = await this.getOrCreateVisit(url, title);
    const now = Date.now();

    // Update visit record
    this.db.run(
      `UPDATE visits 
       SET last_visit = ?, 
           visit_count = visit_count + 1, 
           total_time_spent = total_time_spent + ?,
           title = ?
       WHERE id = ?`,
      [now, timeSpent || 0, title, visit.id]
    );

    // Add session record
    this.db.run(
      `INSERT INTO sessions (visit_id, timestamp, time_spent, scroll_depth, interactions, highlight_count)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [visit.id, now, timeSpent || 0, scrollDepth || 0, interactions || 0, highlights?.length || 0]
    );

    // Clean up old sessions (keep last 50)
    this.db.run(
      `DELETE FROM sessions 
       WHERE visit_id = ? 
       AND id NOT IN (
         SELECT id FROM sessions 
         WHERE visit_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 50
       )`,
      [visit.id, visit.id]
    );

    await this.saveDatabase();
    return visit;
  }

  // Get visit history
  async getVisitHistory(url) {
    const urlHash = this.hashURL(url);
    
    const stmt = this.db.prepare(`
      SELECT v.*, 
             (SELECT COUNT(*) FROM sessions WHERE visit_id = v.id) as session_count
      FROM visits v
      WHERE v.url_hash = ?
    `);
    stmt.bind([urlHash]);
    
    let visit = null;
    if (stmt.step()) {
      visit = stmt.getAsObject();
    }
    stmt.free();

    if (!visit) return null;

    // Get sessions
    const sessionsStmt = this.db.prepare(`
      SELECT * FROM sessions 
      WHERE visit_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 50
    `);
    sessionsStmt.bind([visit.id]);
    
    const sessions = [];
    while (sessionsStmt.step()) {
      sessions.push(sessionsStmt.getAsObject());
    }
    sessionsStmt.free();

    visit.sessions = sessions;
    return visit;
  }

  // Save highlight
  async saveHighlight(data) {
    const { text, url, title, timestamp } = data;
    
    const visit = await this.getOrCreateVisit(url, title);
    
    this.db.run(
      'INSERT INTO highlights (visit_id, text, timestamp) VALUES (?, ?, ?)',
      [visit.id, text, timestamp || Date.now()]
    );

    // Keep only last 100 highlights per visit
    this.db.run(
      `DELETE FROM highlights 
       WHERE visit_id = ? 
       AND id NOT IN (
         SELECT id FROM highlights 
         WHERE visit_id = ? 
         ORDER BY timestamp DESC 
         LIMIT 100
       )`,
      [visit.id, visit.id]
    );

    await this.saveDatabase();
  }

  // Get highlights
  async getHighlights(url) {
    const urlHash = this.hashURL(url);
    
    const stmt = this.db.prepare(`
      SELECT h.* 
      FROM highlights h
      JOIN visits v ON h.visit_id = v.id
      WHERE v.url_hash = ?
      ORDER BY h.timestamp DESC
      LIMIT 100
    `);
    stmt.bind([urlHash]);
    
    const highlights = [];
    while (stmt.step()) {
      highlights.push(stmt.getAsObject());
    }
    stmt.free();

    return highlights;
  }

  // Save AI insights
  async saveAIInsights(url, insights) {
    const urlHash = this.hashURL(url);
    
    const visit = await this.getOrCreateVisit(url, '');
    
    // Store tags as JSON
    const tagsJSON = JSON.stringify(insights.tags || []);
    const topicsJSON = JSON.stringify(insights.topics || []);
    
    // Upsert insights
    this.db.run(
      `INSERT INTO insights (visit_id, summary, topics, timestamp)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(visit_id) DO UPDATE SET
         summary = excluded.summary,
         topics = excluded.topics,
         timestamp = excluded.timestamp`,
      [visit.id, insights.summary || '', topicsJSON, insights.timestamp || Date.now()]
    );

    // Add tags
    if (insights.tags && insights.tags.length > 0) {
      for (const tag of insights.tags) {
        await this.addTag(url, tag);
      }
    }

    await this.saveDatabase();
  }

  // Get AI insights
  async getAIInsights(url) {
    const urlHash = this.hashURL(url);
    
    const stmt = this.db.prepare(`
      SELECT i.* 
      FROM insights i
      JOIN visits v ON i.visit_id = v.id
      WHERE v.url_hash = ?
    `);
    stmt.bind([urlHash]);
    
    let insights = null;
    if (stmt.step()) {
      insights = stmt.getAsObject();
      if (insights.topics) {
        insights.topics = JSON.parse(insights.topics);
      }
    }
    stmt.free();

    // Get tags
    if (insights) {
      insights.tags = await this.getTags(url);
    }

    return insights;
  }

  // Add tag
  async addTag(url, tagName) {
    const visit = await this.getOrCreateVisit(url, '');
    
    // Get or create tag
    let tagId = null;
    const stmt = this.db.prepare('SELECT id FROM tags WHERE name = ?');
    stmt.bind([tagName]);
    
    if (stmt.step()) {
      tagId = stmt.getAsObject().id;
    }
    stmt.free();

    if (!tagId) {
      this.db.run('INSERT INTO tags (name) VALUES (?)', [tagName]);
      const stmt2 = this.db.prepare('SELECT id FROM tags WHERE name = ?');
      stmt2.bind([tagName]);
      if (stmt2.step()) {
        tagId = stmt2.getAsObject().id;
      }
      stmt2.free();
    }

    // Link tag to visit (ignore if already exists)
    try {
      this.db.run(
        'INSERT OR IGNORE INTO visit_tags (visit_id, tag_id) VALUES (?, ?)',
        [visit.id, tagId]
      );
    } catch (error) {
      // Ignore duplicate errors
    }

    await this.saveDatabase();
  }

  // Get tags for a URL
  async getTags(url) {
    const urlHash = this.hashURL(url);
    
    const stmt = this.db.prepare(`
      SELECT t.name 
      FROM tags t
      JOIN visit_tags vt ON t.id = vt.tag_id
      JOIN visits v ON vt.visit_id = v.id
      WHERE v.url_hash = ?
    `);
    stmt.bind([urlHash]);
    
    const tags = [];
    while (stmt.step()) {
      tags.push(stmt.getAsObject().name);
    }
    stmt.free();

    return tags;
  }

  // Get all memories
  async getMemories(filters = {}) {
    let query = `
      SELECT v.*
      FROM visits v
      WHERE 1=1
    `;
    const params = [];

    if (filters.minVisits) {
      query += ' AND v.visit_count >= ?';
      params.push(filters.minVisits);
    }

    if (filters.minTimeSpent) {
      query += ' AND v.total_time_spent >= ?';
      params.push(filters.minTimeSpent);
    }

    if (filters.dateFrom) {
      query += ' AND v.last_visit >= ?';
      params.push(filters.dateFrom);
    }

    if (filters.tag) {
      query += ` AND v.id IN (
        SELECT vt.visit_id FROM visit_tags vt
        JOIN tags t ON vt.tag_id = t.id
        WHERE t.name = ?
      )`;
      params.push(filters.tag);
    }

    query += ' ORDER BY v.last_visit DESC';

    const stmt = this.db.prepare(query);
    stmt.bind(params);

    const memories = [];
    while (stmt.step()) {
      const visit = stmt.getAsObject();
      
      // Get highlights count
      const hlStmt = this.db.prepare('SELECT COUNT(*) as count FROM highlights WHERE visit_id = ?');
      hlStmt.bind([visit.id]);
      const highlightCount = hlStmt.step() ? hlStmt.getAsObject().count : 0;
      hlStmt.free();

      // Get tags
      const tags = await this.getTags(visit.url);
      
      // Get insights
      const insights = await this.getAIInsights(visit.url);

      // Get sessions
      const sessionsStmt = this.db.prepare(`
        SELECT * FROM sessions 
        WHERE visit_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 10
      `);
      sessionsStmt.bind([visit.id]);
      const sessions = [];
      while (sessionsStmt.step()) {
        sessions.push(sessionsStmt.getAsObject());
      }
      sessionsStmt.free();

      // Get highlights
      const highlights = await this.getHighlights(visit.url);

      memories.push({
        url: visit.url,
        title: visit.title,
        visits: visit.visit_count,
        lastVisit: visit.last_visit,
        firstVisit: visit.first_visit,
        totalTimeSpent: visit.total_time_spent,
        highlights: highlights,
        insights: insights,
        tags: tags,
        sessions: sessions
      });
    }
    stmt.free();

    return memories;
  }

  // Get statistics
  async getStats() {
    const stats = {
      totalVisits: 0,
      totalTimeSpent: 0,
      totalHighlights: 0,
      totalSessions: 0,
      thisWeekVisits: 0,
      averageTimePerVisit: 0
    };

    // Total visits
    let stmt = this.db.prepare('SELECT COUNT(*) as count FROM visits');
    if (stmt.step()) {
      stats.totalVisits = stmt.getAsObject().count;
    }
    stmt.free();

    // Total time spent
    stmt = this.db.prepare('SELECT SUM(total_time_spent) as total FROM visits');
    if (stmt.step()) {
      stats.totalTimeSpent = stmt.getAsObject().total || 0;
    }
    stmt.free();

    // Total highlights
    stmt = this.db.prepare('SELECT COUNT(*) as count FROM highlights');
    if (stmt.step()) {
      stats.totalHighlights = stmt.getAsObject().count;
    }
    stmt.free();

    // Total sessions
    stmt = this.db.prepare('SELECT SUM(visit_count) as total FROM visits');
    if (stmt.step()) {
      stats.totalSessions = stmt.getAsObject().total || 0;
    }
    stmt.free();

    // This week visits
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    stmt = this.db.prepare('SELECT COUNT(*) as count FROM visits WHERE last_visit >= ?');
    stmt.bind([oneWeekAgo]);
    if (stmt.step()) {
      stats.thisWeekVisits = stmt.getAsObject().count;
    }
    stmt.free();

    // Average time per visit
    if (stats.totalSessions > 0) {
      stats.averageTimePerVisit = Math.floor(stats.totalTimeSpent / stats.totalSessions);
    }

    return stats;
  }

  // Export data
  async exportData() {
    const data = this.db.export();
    return {
      database: Array.from(data),
      exportDate: Date.now(),
      version: '2.0'
    };
  }

  // Import data
  async importData(data) {
    try {
      if (data.version === '2.0' && data.database) {
        // Import SQLite database
        const uint8Array = new Uint8Array(data.database);
        this.db = new this.SQL.Database(uint8Array);
        await this.saveDatabase();
      } else if (data.visits) {
        // Migrate from old chrome.storage format
        await this.migrateFromChromeStorage(data);
      }
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }

  // Migrate from old chrome.storage format
  async migrateFromChromeStorage(data) {
    console.log('🔄 Migrating from chrome.storage...');

    // Migrate visits
    if (data.visits) {
      for (const urlKey in data.visits) {
        const oldVisit = data.visits[urlKey];
        const visit = await this.getOrCreateVisit(oldVisit.url, oldVisit.title);
        
        this.db.run(
          `UPDATE visits 
           SET first_visit = ?, last_visit = ?, visit_count = ?, total_time_spent = ?
           WHERE id = ?`,
          [
            oldVisit.firstVisit,
            oldVisit.lastVisit,
            oldVisit.visits,
            oldVisit.totalTimeSpent,
            visit.id
          ]
        );

        // Migrate sessions
        if (oldVisit.sessions) {
          for (const session of oldVisit.sessions) {
            this.db.run(
              `INSERT INTO sessions (visit_id, timestamp, time_spent, scroll_depth, interactions, highlight_count)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                visit.id,
                session.timestamp,
                session.timeSpent || 0,
                session.scrollDepth || 0,
                session.interactions || 0,
                session.highlightCount || 0
              ]
            );
          }
        }
      }
    }

    // Migrate highlights
    if (data.highlights) {
      for (const urlKey in data.highlights) {
        const oldHighlights = data.highlights[urlKey];
        const visit = await this.getOrCreateVisit(oldHighlights.url, oldHighlights.title);
        
        if (oldHighlights.items) {
          for (const item of oldHighlights.items) {
            this.db.run(
              'INSERT INTO highlights (visit_id, text, timestamp) VALUES (?, ?, ?)',
              [visit.id, item.text, item.timestamp]
            );
          }
        }
      }
    }

    // Migrate insights
    if (data.insights) {
      for (const urlKey in data.insights) {
        const oldInsight = data.insights[urlKey];
        await this.saveAIInsights(oldInsight.url, oldInsight);
      }
    }

    // Migrate tags
    if (data.tags) {
      for (const urlKey in data.tags) {
        const oldTags = data.tags[urlKey];
        if (oldTags.tags) {
          for (const tag of oldTags.tags) {
            await this.addTag(oldTags.url, tag);
          }
        }
      }
    }

    await this.saveDatabase();
    console.log('✅ Migration complete');
  }

  // Cleanup old data
  async cleanup() {
    // Remove very old sessions (older than 1 year)
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    this.db.run('DELETE FROM sessions WHERE timestamp < ?', [oneYearAgo]);
    
    // Remove orphaned tags
    this.db.run(`
      DELETE FROM tags 
      WHERE id NOT IN (SELECT DISTINCT tag_id FROM visit_tags)
    `);

    await this.saveDatabase();
  }

  // Close database
  async close() {
    if (this.db) {
      await this.saveDatabase();
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}
