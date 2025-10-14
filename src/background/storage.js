// Storage Manager for EchoLens
// Handles all Chrome Storage operations

export class StorageManager {
  constructor() {
    this.KEYS = {
      VISITS: 'echolens_visits',
      HIGHLIGHTS: 'echolens_highlights',
      INSIGHTS: 'echolens_insights',
      TAGS: 'echolens_tags',
      SETTINGS: 'echolens_settings'
    };
  }

  // Helper to get data from storage
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  }

  // Helper to set data in storage
  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  // Update visit history for a URL
  async updateVisit(context) {
    const { url, title, content, timeSpent, scrollDepth, interactions, highlights } = context;
    
    // Get existing visits
    let visits = await this.get(this.KEYS.VISITS) || {};
    
    // Get or create visit entry
    const urlKey = this.hashURL(url);
    if (!visits[urlKey]) {
      visits[urlKey] = {
        url,
        title,
        firstVisit: Date.now(),
        visits: 0,
        totalTimeSpent: 0,
        sessions: []
      };
    }

    // Update visit data
    visits[urlKey].visits += 1;
    visits[urlKey].totalTimeSpent += timeSpent;
    visits[urlKey].lastVisit = Date.now();
    visits[urlKey].title = title; // Update in case it changed
    
    // Add session
    visits[urlKey].sessions.push({
      timestamp: Date.now(),
      timeSpent,
      scrollDepth,
      interactions,
      highlightCount: highlights?.length || 0
    });

    // Keep only last 50 sessions per URL
    if (visits[urlKey].sessions.length > 50) {
      visits[urlKey].sessions = visits[urlKey].sessions.slice(-50);
    }

    await this.set(this.KEYS.VISITS, visits);
  }

  // Get visit history for a URL
  async getVisitHistory(url) {
    const visits = await this.get(this.KEYS.VISITS) || {};
    const urlKey = this.hashURL(url);
    return visits[urlKey] || null;
  }

  // Save a highlight
  async saveHighlight(data) {
    const { text, url, title, timestamp } = data;
    
    let highlights = await this.get(this.KEYS.HIGHLIGHTS) || {};
    const urlKey = this.hashURL(url);
    
    if (!highlights[urlKey]) {
      highlights[urlKey] = {
        url,
        title,
        items: []
      };
    }

    highlights[urlKey].items.push({
      text,
      timestamp
    });

    // Keep only last 100 highlights per URL
    if (highlights[urlKey].items.length > 100) {
      highlights[urlKey].items = highlights[urlKey].items.slice(-100);
    }

    await this.set(this.KEYS.HIGHLIGHTS, highlights);
  }

  // Get highlights for a URL
  async getHighlights(url) {
    const highlights = await this.get(this.KEYS.HIGHLIGHTS) || {};
    const urlKey = this.hashURL(url);
    return highlights[urlKey]?.items || [];
  }

  // Save AI-generated insights
  async saveAIInsights(url, insights) {
    let allInsights = await this.get(this.KEYS.INSIGHTS) || {};
    const urlKey = this.hashURL(url);
    
    allInsights[urlKey] = {
      url,
      ...insights
    };

    await this.set(this.KEYS.INSIGHTS, allInsights);
  }

  // Get AI insights for a URL
  async getAIInsights(url) {
    const insights = await this.get(this.KEYS.INSIGHTS) || {};
    const urlKey = this.hashURL(url);
    return insights[urlKey] || null;
  }

  // Add a tag to a URL
  async addTag(url, tag) {
    let tags = await this.get(this.KEYS.TAGS) || {};
    const urlKey = this.hashURL(url);
    
    if (!tags[urlKey]) {
      tags[urlKey] = {
        url,
        tags: []
      };
    }

    if (!tags[urlKey].tags.includes(tag)) {
      tags[urlKey].tags.push(tag);
    }

    await this.set(this.KEYS.TAGS, tags);
  }

  // Get all memories with optional filters
  async getMemories(filters = {}) {
    const visits = await this.get(this.KEYS.VISITS) || {};
    const highlights = await this.get(this.KEYS.HIGHLIGHTS) || {};
    const insights = await this.get(this.KEYS.INSIGHTS) || {};
    const tags = await this.get(this.KEYS.TAGS) || {};

    // Combine all data
    const memories = Object.keys(visits).map(urlKey => {
      const visit = visits[urlKey];
      return {
        url: visit.url,
        title: visit.title,
        visits: visit.visits,
        lastVisit: visit.lastVisit,
        firstVisit: visit.firstVisit,
        totalTimeSpent: visit.totalTimeSpent,
        highlights: highlights[urlKey]?.items || [],
        insights: insights[urlKey] || null,
        tags: tags[urlKey]?.tags || [],
        sessions: visit.sessions
      };
    });

    // Apply filters
    let filtered = memories;

    if (filters.minVisits) {
      filtered = filtered.filter(m => m.visits >= filters.minVisits);
    }

    if (filters.minTimeSpent) {
      filtered = filtered.filter(m => m.totalTimeSpent >= filters.minTimeSpent);
    }

    if (filters.tag) {
      filtered = filtered.filter(m => m.tags.includes(filters.tag));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(m => m.lastVisit >= filters.dateFrom);
    }

    // Sort by last visit
    filtered.sort((a, b) => b.lastVisit - a.lastVisit);

    return filtered;
  }

  // Get all memories (for search)
  async getAllMemories() {
    return await this.getMemories();
  }

  // Get statistics
  async getStats() {
    const visits = await this.get(this.KEYS.VISITS) || {};
    const highlights = await this.get(this.KEYS.HIGHLIGHTS) || {};
    
    const totalVisits = Object.keys(visits).length;
    const totalTimeSpent = Object.values(visits).reduce((sum, v) => sum + v.totalTimeSpent, 0);
    const totalHighlights = Object.values(highlights).reduce((sum, h) => sum + h.items.length, 0);
    const totalSessions = Object.values(visits).reduce((sum, v) => sum + v.visits, 0);

    // Calculate this week's stats
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const thisWeekVisits = Object.values(visits).filter(v => v.lastVisit >= oneWeekAgo).length;

    return {
      totalVisits,
      totalTimeSpent,
      totalHighlights,
      totalSessions,
      thisWeekVisits,
      averageTimePerVisit: totalSessions > 0 ? Math.floor(totalTimeSpent / totalSessions) : 0
    };
  }

  // Cleanup old data (for free tier)
  async cleanup() {
    // This would implement free tier limits
    // For now, just a placeholder
    console.log('Cleanup would happen here for free tier users');
  }

  // Hash URL for consistent keys
  hashURL(url) {
    // Simple hash function - in production, use a proper hash
    return url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
  }

  // Export data (for backup or sync)
  async exportData() {
    const visits = await this.get(this.KEYS.VISITS) || {};
    const highlights = await this.get(this.KEYS.HIGHLIGHTS) || {};
    const insights = await this.get(this.KEYS.INSIGHTS) || {};
    const tags = await this.get(this.KEYS.TAGS) || {};
    const settings = await this.get(this.KEYS.SETTINGS) || {};

    return {
      visits,
      highlights,
      insights,
      tags,
      settings,
      exportDate: Date.now()
    };
  }

  // Import data (for restore or sync)
  async importData(data) {
    if (data.visits) await this.set(this.KEYS.VISITS, data.visits);
    if (data.highlights) await this.set(this.KEYS.HIGHLIGHTS, data.highlights);
    if (data.insights) await this.set(this.KEYS.INSIGHTS, data.insights);
    if (data.tags) await this.set(this.KEYS.TAGS, data.tags);
    if (data.settings) await this.set(this.KEYS.SETTINGS, data.settings);
  }
}
