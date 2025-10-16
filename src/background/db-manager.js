// SQLite Database Manager for SupriAI
// Handles all database operations using sql.js

import initSqlJs from 'sql.js';

export class DatabaseManager {
  constructor() {
    this.db = null;
    this.SQL = null;
    this.dbName = 'supriai.db';
    this.isInitialized = false;
  }

  // Initialize database
  async init() {
    if (this.isInitialized) return;

    try {
      // Initialize SQL.js with proper configuration for Service Worker
      this.SQL = await initSqlJs({
        locateFile: file => chrome.runtime.getURL(file)
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

      -- Personality Snapshots table (for PersonaSync)
      CREATE TABLE IF NOT EXISTS personality_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start INTEGER NOT NULL,
        week_end INTEGER NOT NULL,
        tone TEXT,
        top_topics TEXT,
        reading_habits TEXT,
        emotional_themes TEXT,
        summary TEXT,
        total_time_spent INTEGER DEFAULT 0,
        total_visits INTEGER DEFAULT 0,
        total_highlights INTEGER DEFAULT 0,
        dominant_interests TEXT,
        quote_of_week TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      -- Interest Evolution table
      CREATE TABLE IF NOT EXISTS interest_evolution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        period TEXT NOT NULL,
        count INTEGER DEFAULT 0,
        total_time INTEGER DEFAULT 0,
        trend_score REAL DEFAULT 0,
        status TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      -- Mood Tracking table
      CREATE TABLE IF NOT EXISTS mood_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        sentiment TEXT,
        sentiment_score REAL DEFAULT 0,
        emotions TEXT,
        tone TEXT,
        url TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      -- Goals table
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        keywords TEXT,
        priority TEXT DEFAULT 'medium',
        target_hours REAL DEFAULT 0,
        actual_hours REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        last_nudge INTEGER,
        nudge_count INTEGER DEFAULT 0
      );

      -- Skills tracking
      CREATE TABLE IF NOT EXISTS skill_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        skill TEXT NOT NULL,
        confidence REAL DEFAULT 0,
        keywords TEXT,
        time_spent INTEGER DEFAULT 0,
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      -- Achievements
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        achievement_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        icon TEXT,
        points INTEGER DEFAULT 0,
        unlocked_at INTEGER NOT NULL
      );

      -- Streaks
      CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_active_date INTEGER NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      -- Focus sessions
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      -- Reflection prompts and responses
      CREATE TABLE IF NOT EXISTS reflection_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        context TEXT
      );

      CREATE TABLE IF NOT EXISTS reflection_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt_id INTEGER NOT NULL,
        response TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (prompt_id) REFERENCES reflection_prompts (id)
      );

      -- Weekly challenges
      CREATE TABLE IF NOT EXISTS weekly_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id TEXT NOT NULL,
        week_start INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        target INTEGER NOT NULL,
        completed BOOLEAN DEFAULT 0
      );

      -- Feature usage tracking
      CREATE TABLE IF NOT EXISTS feature_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_name TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0,
        last_used INTEGER NOT NULL
      );

      -- Twin interactions
      CREATE TABLE IF NOT EXISTS twin_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        confidence TEXT,
        timestamp INTEGER NOT NULL
      );

      -- Indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_visits_url_hash ON visits(url_hash);
      CREATE INDEX IF NOT EXISTS idx_visits_last_visit ON visits(last_visit);
      CREATE INDEX IF NOT EXISTS idx_sessions_visit_id ON sessions(visit_id);
      CREATE INDEX IF NOT EXISTS idx_highlights_visit_id ON highlights(visit_id);
      CREATE INDEX IF NOT EXISTS idx_insights_visit_id ON insights(visit_id);
      CREATE INDEX IF NOT EXISTS idx_visit_tags_visit_id ON visit_tags(visit_id);
      CREATE INDEX IF NOT EXISTS idx_visit_tags_tag_id ON visit_tags(tag_id);
      CREATE INDEX IF NOT EXISTS idx_personality_snapshots_week ON personality_snapshots(week_start);
      CREATE INDEX IF NOT EXISTS idx_interest_evolution_period ON interest_evolution(period);
      CREATE INDEX IF NOT EXISTS idx_mood_tracking_timestamp ON mood_tracking(timestamp);
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

  // === PersonaSync Methods ===

  // Save personality snapshot
  async savePersonalitySnapshot(snapshot) {
    this.db.run(
      `INSERT INTO personality_snapshots (
        week_start, week_end, tone, top_topics, reading_habits, 
        emotional_themes, summary, total_time_spent, total_visits, 
        total_highlights, dominant_interests, quote_of_week
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        snapshot.weekStart,
        snapshot.weekEnd,
        snapshot.tone,
        JSON.stringify(snapshot.topTopics),
        snapshot.readingHabits,
        JSON.stringify(snapshot.emotionalThemes),
        snapshot.summary,
        snapshot.totalTimeSpent,
        snapshot.totalVisits,
        snapshot.totalHighlights,
        JSON.stringify(snapshot.dominantInterests),
        snapshot.quoteOfWeek || ''
      ]
    );

    await this.saveDatabase();
  }

  // Get personality snapshots
  async getPersonalitySnapshots(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM personality_snapshots 
      ORDER BY week_start DESC 
      LIMIT ?
    `);
    stmt.bind([limit]);

    const snapshots = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      snapshots.push({
        id: row.id,
        weekStart: row.week_start,
        weekEnd: row.week_end,
        tone: row.tone,
        topTopics: JSON.parse(row.top_topics || '[]'),
        readingHabits: row.reading_habits,
        emotionalThemes: JSON.parse(row.emotional_themes || '[]'),
        summary: row.summary,
        totalTimeSpent: row.total_time_spent,
        totalVisits: row.total_visits,
        totalHighlights: row.total_highlights,
        dominantInterests: JSON.parse(row.dominant_interests || '[]'),
        quoteOfWeek: row.quote_of_week,
        createdAt: row.created_at
      });
    }
    stmt.free();

    return snapshots;
  }

  // Save interest evolution data
  async saveInterestEvolution(data) {
    for (const item of data) {
      this.db.run(
        `INSERT INTO interest_evolution (
          topic, period, count, total_time, trend_score, status
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item.topic,
          item.period,
          item.count,
          item.totalTime || 0,
          item.trendScore || 0,
          item.status || 'steady'
        ]
      );
    }

    await this.saveDatabase();
  }

  // Get interest evolution
  async getInterestEvolution() {
    const stmt = this.db.prepare(`
      SELECT * FROM interest_evolution 
      ORDER BY period DESC, count DESC
    `);

    const evolution = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      evolution.push({
        id: row.id,
        topic: row.topic,
        period: row.period,
        count: row.count,
        totalTime: row.total_time,
        trendScore: row.trend_score,
        status: row.status,
        createdAt: row.created_at
      });
    }
    stmt.free();

    return evolution;
  }

  // Save mood tracking data
  async saveMoodData(moodData) {
    this.db.run(
      `INSERT INTO mood_tracking (
        timestamp, sentiment, sentiment_score, emotions, tone, url
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        moodData.timestamp,
        moodData.sentiment,
        moodData.sentimentScore || 0,
        JSON.stringify(moodData.emotions || []),
        moodData.tone || '',
        moodData.url || ''
      ]
    );

    await this.saveDatabase();
  }

  // Get mood history
  async getMoodHistory(days = 30) {
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const stmt = this.db.prepare(`
      SELECT * FROM mood_tracking 
      WHERE timestamp >= ?
      ORDER BY timestamp DESC
    `);
    stmt.bind([startTime]);

    const moods = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      moods.push({
        id: row.id,
        timestamp: row.timestamp,
        sentiment: row.sentiment,
        sentimentScore: row.sentiment_score,
        emotions: JSON.parse(row.emotions || '[]'),
        tone: row.tone,
        url: row.url,
        createdAt: row.created_at
      });
    }
    stmt.free();

    return moods;
  }

  // Get weekly mood summary
  async getWeeklyMoodSummary() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const stmt = this.db.prepare(`
      SELECT sentiment, COUNT(*) as count, AVG(sentiment_score) as avg_score
      FROM mood_tracking 
      WHERE timestamp >= ?
      GROUP BY sentiment
    `);
    stmt.bind([weekAgo]);

    const summary = {
      positive: 0,
      negative: 0,
      neutral: 0,
      averageScore: 0,
      dominantMood: 'neutral'
    };

    let totalCount = 0;
    let totalScore = 0;

    while (stmt.step()) {
      const row = stmt.getAsObject();
      const sentiment = row.sentiment || 'neutral';
      const count = row.count || 0;
      const avgScore = row.avg_score || 0;

      summary[sentiment] = count;
      totalCount += count;
      totalScore += avgScore * count;
    }
    stmt.free();

    if (totalCount > 0) {
      summary.averageScore = totalScore / totalCount;
      summary.dominantMood = Object.entries(summary)
        .filter(([key]) => ['positive', 'negative', 'neutral'].includes(key))
        .sort((a, b) => b[1] - a[1])[0][0];
    }

    return summary;
  }

  // Get weekly data for snapshot generation
  async getWeeklyData() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const now = Date.now();

    // Get visits
    const visitsStmt = this.db.prepare(`
      SELECT * FROM visits 
      WHERE last_visit >= ? AND last_visit < ?
      ORDER BY last_visit DESC
    `);
    visitsStmt.bind([weekAgo, now]);

    const visits = [];
    while (visitsStmt.step()) {
      visits.push(visitsStmt.getAsObject());
    }
    visitsStmt.free();

    // Get highlights
    const highlightsStmt = this.db.prepare(`
      SELECT h.* FROM highlights h
      JOIN visits v ON h.visit_id = v.id
      WHERE h.timestamp >= ? AND h.timestamp < ?
    `);
    highlightsStmt.bind([weekAgo, now]);

    const highlights = [];
    while (highlightsStmt.step()) {
      highlights.push(highlightsStmt.getAsObject());
    }
    highlightsStmt.free();

    // Get all topics from insights
    const topicsStmt = this.db.prepare(`
      SELECT i.topics FROM insights i
      JOIN visits v ON i.visit_id = v.id
      WHERE v.last_visit >= ? AND v.last_visit < ?
    `);
    topicsStmt.bind([weekAgo, now]);

    const allTopics = [];
    while (topicsStmt.step()) {
      const row = topicsStmt.getAsObject();
      if (row.topics) {
        const topics = JSON.parse(row.topics);
        allTopics.push(...topics);
      }
    }
    topicsStmt.free();

    // Calculate total time spent
    const timeStmt = this.db.prepare(`
      SELECT SUM(total_time_spent) as total FROM visits
      WHERE last_visit >= ? AND last_visit < ?
    `);
    timeStmt.bind([weekAgo, now]);

    let totalTimeSpent = 0;
    if (timeStmt.step()) {
      totalTimeSpent = timeStmt.getAsObject().total || 0;
    }
    timeStmt.free();

    return {
      weekStart: weekAgo,
      weekEnd: now,
      visits,
      highlights,
      topics: allTopics,
      timeSpent: totalTimeSpent
    };
  }

  // ==================== Skill Tracking Methods ====================

  // Save skill activity
  async saveSkillActivity(skillData) {
    this.db.run(
      `INSERT INTO skill_activities (
        url, skill, confidence, keywords, time_spent, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        skillData.url || 'manual',
        skillData.skill,
        skillData.confidence || 1.0,
        skillData.keywords || '',
        skillData.time_spent || 0,
        skillData.timestamp || Date.now()
      ]
    );

    await this.saveDatabase();
  }

  // Get skill statistics
  async getSkillStats() {
    const stmt = this.db.prepare(`
      SELECT 
        skill,
        COUNT(*) as visit_count,
        SUM(time_spent) as total_time,
        AVG(confidence) as avg_confidence,
        MIN(timestamp) as first_seen,
        MAX(timestamp) as last_seen
      FROM skill_activities
      GROUP BY skill
      ORDER BY total_time DESC, visit_count DESC
    `);

    const skills = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      skills.push({
        skill: row.skill,
        visit_count: row.visit_count,
        total_time: row.total_time || 0,
        avg_confidence: row.avg_confidence || 0,
        first_seen: row.first_seen,
        last_seen: row.last_seen
      });
    }
    stmt.free();

    return skills;
  }

  // Get skill by name
  async getSkillByName(skillName) {
    const stmt = this.db.prepare(`
      SELECT 
        skill,
        COUNT(*) as visit_count,
        SUM(time_spent) as total_time,
        AVG(confidence) as avg_confidence,
        MIN(timestamp) as first_seen,
        MAX(timestamp) as last_seen
      FROM skill_activities
      WHERE skill = ?
      GROUP BY skill
    `);
    stmt.bind([skillName]);

    let skillData = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      skillData = {
        skill: row.skill,
        visit_count: row.visit_count,
        total_time: row.total_time || 0,
        avg_confidence: row.avg_confidence || 0,
        first_seen: row.first_seen,
        last_seen: row.last_seen
      };
    }
    stmt.free();

    return skillData;
  }

  // Get skill activities since a timestamp
  async getSkillActivitiesSince(timestamp) {
    const stmt = this.db.prepare(`
      SELECT * FROM skill_activities
      WHERE timestamp >= ?
      ORDER BY timestamp DESC
    `);
    stmt.bind([timestamp]);

    const activities = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      activities.push({
        id: row.id,
        url: row.url,
        skill: row.skill,
        confidence: row.confidence,
        keywords: row.keywords,
        time_spent: row.time_spent,
        timestamp: row.timestamp,
        created_at: row.created_at
      });
    }
    stmt.free();

    return activities;
  }

  // Get all unique skills
  async getAllSkills() {
    const stmt = this.db.prepare(`
      SELECT 
        skill,
        COUNT(*) as visit_count,
        SUM(time_spent) as total_time,
        MAX(timestamp) as last_activity,
        AVG(confidence) as avg_confidence
      FROM skill_activities
      GROUP BY skill
      ORDER BY total_time DESC
    `);

    const skills = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      skills.push({
        name: row.skill,
        total_time: row.total_time || 0,
        visit_count: row.visit_count || 0,
        last_activity: row.last_activity,
        confidence: row.avg_confidence || 0
      });
    }
    stmt.free();

    return skills;
  }

  // Delete skill activity
  async deleteSkillActivity(skillName) {
    this.db.run('DELETE FROM skill_activities WHERE skill = ?', [skillName]);
    await this.saveDatabase();
  }

  // Update skill time spent
  async updateSkillTimeSpent(url, skill, additionalTime) {
    this.db.run(
      `UPDATE skill_activities 
       SET time_spent = time_spent + ? 
       WHERE url = ? AND skill = ? AND timestamp = (
         SELECT MAX(timestamp) FROM skill_activities WHERE url = ? AND skill = ?
       )`,
      [additionalTime, url, skill, url, skill]
    );
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
