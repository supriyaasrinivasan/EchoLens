// EchoLens Background Service Worker
// Handles data storage, AI processing, and cross-extension communication

// Storage Manager Class
class StorageManager {
  constructor() {
    this.KEYS = {
      VISITS: 'echolens_visits',
      HIGHLIGHTS: 'echolens_highlights',
      INSIGHTS: 'echolens_insights',
      TAGS: 'echolens_tags',
      SETTINGS: 'echolens_settings'
    };
  }

  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  async updateVisit(context) {
    const { url, title, content, timeSpent, scrollDepth, interactions, highlights } = context;
    
    let visits = await this.get(this.KEYS.VISITS) || {};
    
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

    visits[urlKey].visits += 1;
    visits[urlKey].totalTimeSpent += timeSpent;
    visits[urlKey].lastVisit = Date.now();
    visits[urlKey].title = title;
    
    visits[urlKey].sessions.push({
      timestamp: Date.now(),
      timeSpent,
      scrollDepth,
      interactions,
      highlightCount: highlights?.length || 0
    });

    if (visits[urlKey].sessions.length > 50) {
      visits[urlKey].sessions = visits[urlKey].sessions.slice(-50);
    }

    await this.set(this.KEYS.VISITS, visits);
  }

  async getVisitHistory(url) {
    const visits = await this.get(this.KEYS.VISITS) || {};
    const urlKey = this.hashURL(url);
    return visits[urlKey] || null;
  }

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

    if (highlights[urlKey].items.length > 100) {
      highlights[urlKey].items = highlights[urlKey].items.slice(-100);
    }

    await this.set(this.KEYS.HIGHLIGHTS, highlights);
  }

  async getHighlights(url) {
    const highlights = await this.get(this.KEYS.HIGHLIGHTS) || {};
    const urlKey = this.hashURL(url);
    return highlights[urlKey]?.items || [];
  }

  async saveAIInsights(url, insights) {
    let allInsights = await this.get(this.KEYS.INSIGHTS) || {};
    const urlKey = this.hashURL(url);
    
    allInsights[urlKey] = {
      url,
      ...insights
    };

    await this.set(this.KEYS.INSIGHTS, allInsights);
  }

  async getAIInsights(url) {
    const insights = await this.get(this.KEYS.INSIGHTS) || {};
    const urlKey = this.hashURL(url);
    return insights[urlKey] || null;
  }

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

  async getMemories(filters = {}) {
    const visits = await this.get(this.KEYS.VISITS) || {};
    const highlights = await this.get(this.KEYS.HIGHLIGHTS) || {};
    const insights = await this.get(this.KEYS.INSIGHTS) || {};
    const tags = await this.get(this.KEYS.TAGS) || {};

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

    filtered.sort((a, b) => b.lastVisit - a.lastVisit);

    return filtered;
  }

  async getAllMemories() {
    return await this.getMemories();
  }

  async getStats() {
    const visits = await this.get(this.KEYS.VISITS) || {};
    const highlights = await this.get(this.KEYS.HIGHLIGHTS) || {};
    
    const totalVisits = Object.keys(visits).length;
    const totalTimeSpent = Object.values(visits).reduce((sum, v) => sum + v.totalTimeSpent, 0);
    const totalHighlights = Object.values(highlights).reduce((sum, h) => sum + h.items.length, 0);
    const totalSessions = Object.values(visits).reduce((sum, v) => sum + v.visits, 0);

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

  async cleanup() {
    console.log('Cleanup would happen here for free tier users');
  }

  hashURL(url) {
    return url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
  }

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

  async importData(data) {
    if (data.visits) await this.set(this.KEYS.VISITS, data.visits);
    if (data.highlights) await this.set(this.KEYS.HIGHLIGHTS, data.highlights);
    if (data.insights) await this.set(this.KEYS.INSIGHTS, data.insights);
    if (data.tags) await this.set(this.KEYS.TAGS, data.tags);
    if (data.settings) await this.set(this.KEYS.SETTINGS, data.settings);
  }
}

// AI Processor Class
class AIProcessor {
  constructor() {
    this.apiKey = null;
    this.provider = 'openai';
    this.loadConfig();
  }

  async loadConfig() {
    chrome.storage.local.get(['ai_api_key', 'ai_provider'], (result) => {
      this.apiKey = result.ai_api_key || null;
      this.provider = result.ai_provider || 'openai';
    });
  }

  async generateSummary(content) {
    if (!this.apiKey) {
      console.warn('No AI API key configured');
      return this.generateFallbackSummary(content);
    }

    try {
      if (this.provider === 'openai') {
        return await this.openAISummary(content);
      } else if (this.provider === 'anthropic') {
        return await this.anthropicSummary(content);
      }
    } catch (error) {
      console.error('AI summary error:', error);
      return this.generateFallbackSummary(content);
    }
  }

  async openAISummary(content) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a concise summarizer. Create a 1-2 sentence summary of the following content that captures the main topic and purpose.'
          },
          {
            role: 'user',
            content: content.substring(0, 3000)
          }
        ],
        max_tokens: 100,
        temperature: 0.5
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  async predictTags(content, title) {
    if (!this.apiKey) {
      return this.generateFallbackTags(content, title);
    }

    try {
      if (this.provider === 'openai') {
        return await this.openAITags(content, title);
      }
    } catch (error) {
      console.error('AI tagging error:', error);
      return this.generateFallbackTags(content, title);
    }
  }

  async openAITags(content, title) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate 3-5 relevant tags for this content. Return only the tags separated by commas, like: learning, ai, research'
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nContent: ${content.substring(0, 2000)}`
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const tags = data.choices[0].message.content.trim().split(',').map(t => t.trim());
    return tags.slice(0, 5);
  }

  async extractTopics(content) {
    if (!this.apiKey) {
      return this.generateFallbackTopics(content);
    }

    try {
      if (this.provider === 'openai') {
        return await this.openAITopics(content);
      }
    } catch (error) {
      console.error('AI topic extraction error:', error);
      return this.generateFallbackTopics(content);
    }
  }

  async openAITopics(content) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract 3-5 key topics or concepts from this content. Return only the topics separated by commas.'
          },
          {
            role: 'user',
            content: content.substring(0, 2000)
          }
        ],
        max_tokens: 60,
        temperature: 0.5
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim().split(',').map(t => t.trim());
  }

  generateFallbackSummary(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).join('. ').substring(0, 200) + '...';
  }

  generateFallbackTags(content, title) {
    const text = (title + ' ' + content).toLowerCase();
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    
    const words = text.split(/\W+/).filter(w => 
      w.length > 3 && 
      !commonWords.includes(w) &&
      !/^\d+$/.test(w)
    );

    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    return sorted;
  }

  generateFallbackTopics(content) {
    return this.generateFallbackTags(content, '');
  }
}

// Main Background Worker Class

class EchoLensBackground {
  constructor() {
    this.storage = new StorageManager();
    this.ai = new AIProcessor();
    this.activeSessions = new Map();
    
    this.init();
  }

  init() {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });

    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this.handleTabLoad(tabId, tab);
      }
    });

    // Listen for tab closures
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.handleTabClose(tabId);
    });

    // Set up periodic cleanup
    chrome.alarms.create('cleanup', { periodInMinutes: 60 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'cleanup') {
        this.performCleanup();
      }
    });

    console.log('🌌 EchoLens Background Service Worker initialized');
  }

  async handleMessage(message, sender, sendResponse) {
    const { type, data, url } = message;

    try {
      switch (type) {
        case 'CONTEXT_UPDATE':
          await this.handleContextUpdate(data, sender.tab);
          sendResponse({ success: true });
          break;

        case 'SAVE_HIGHLIGHT':
          await this.saveHighlight(data);
          sendResponse({ success: true });
          break;

        case 'GET_PREVIOUS_CONTEXT':
          const context = await this.getPreviousContext(url);
          sendResponse({ context });
          break;

        case 'PAGE_UNLOAD':
          await this.handlePageUnload(data, sender.tab);
          sendResponse({ success: true });
          break;

        case 'GET_MEMORIES':
          const memories = await this.getMemories(data);
          sendResponse({ memories });
          break;

        case 'SEARCH_MEMORIES':
          const results = await this.searchMemories(data.query);
          sendResponse({ results });
          break;

        case 'ADD_TAG':
          await this.addTag(data.url, data.tag);
          sendResponse({ success: true });
          break;

        case 'GET_STATS':
          const stats = await this.getStats();
          sendResponse({ stats });
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleContextUpdate(context, tab) {
    const { url, title, content, timeSpent } = context;

    // Only process if meaningful time spent (>10 seconds)
    if (timeSpent < 10) return;

    // Get or create session
    let session = this.activeSessions.get(tab.id);
    if (!session) {
      session = {
        url,
        title,
        startTime: Date.now(),
        tabId: tab.id
      };
      this.activeSessions.set(tab.id, session);
    }

    // Update session data
    session.lastUpdate = Date.now();
    session.context = context;

    // Check if we should process with AI
    if (timeSpent > 30 && !session.aiProcessed) {
      session.aiProcessed = true;
      await this.processWithAI(context);
    }

    // Save to storage
    await this.storage.updateVisit(context);
  }

  async processWithAI(context) {
    try {
      // Generate summary
      const summary = await this.ai.generateSummary(context.content);
      
      // Predict tags
      const tags = await this.ai.predictTags(context.content, context.title);
      
      // Extract key topics
      const topics = await this.ai.extractTopics(context.content);

      // Save AI insights
      await this.storage.saveAIInsights(context.url, {
        summary,
        tags,
        topics,
        timestamp: Date.now()
      });

      console.log('✨ AI processing complete for:', context.url);
    } catch (error) {
      console.error('AI processing error:', error);
    }
  }

  async handleTabLoad(tabId, tab) {
    if (!tab.url || tab.url.startsWith('chrome://')) return;

    // Check if we have previous context for this URL
    const previousContext = await this.storage.getVisitHistory(tab.url);
    
    if (previousContext && previousContext.visits > 0) {
      console.log(`🔮 Returning user to: ${tab.url} (${previousContext.visits} previous visits)`);
    }
  }

  async handleTabClose(tabId) {
    const session = this.activeSessions.get(tabId);
    if (session && session.context) {
      // Save final state
      await this.storage.updateVisit(session.context);
      this.activeSessions.delete(tabId);
    }
  }

  async handlePageUnload(context, tab) {
    await this.storage.updateVisit(context);
    this.activeSessions.delete(tab.id);
  }

  async saveHighlight(data) {
    await this.storage.saveHighlight(data);
  }

  async getPreviousContext(url) {
    const history = await this.storage.getVisitHistory(url);
    const highlights = await this.storage.getHighlights(url);
    const insights = await this.storage.getAIInsights(url);

    if (!history) return null;

    return {
      visits: history.visits || 0,
      lastVisit: history.lastVisit,
      totalTimeSpent: history.totalTimeSpent || 0,
      highlights: highlights.slice(0, 5),
      tags: insights?.tags || [],
      summary: insights?.summary
    };
  }

  async getMemories(filters = {}) {
    return await this.storage.getMemories(filters);
  }

  async searchMemories(query) {
    const allMemories = await this.storage.getAllMemories();
    
    // Simple text search across titles, content, and highlights
    const results = allMemories.filter(memory => {
      const searchText = `${memory.title} ${memory.content} ${memory.highlights?.join(' ')}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    // Sort by relevance (number of matches)
    return results.sort((a, b) => {
      const aMatches = (a.title + a.content).toLowerCase().split(query.toLowerCase()).length;
      const bMatches = (b.title + b.content).toLowerCase().split(query.toLowerCase()).length;
      return bMatches - aMatches;
    });
  }

  async addTag(url, tag) {
    await this.storage.addTag(url, tag);
  }

  async getStats() {
    return await this.storage.getStats();
  }

  async performCleanup() {
    console.log('🧹 Performing cleanup...');
    await this.storage.cleanup();
  }
}

// Initialize the background service
const echoLens = new EchoLensBackground();
