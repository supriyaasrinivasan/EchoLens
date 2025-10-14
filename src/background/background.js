// EchoLens Background Service Worker
// Handles data storage, AI processing, and cross-extension communication

import { DatabaseManager } from './db-manager.js';

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
    this.db = new DatabaseManager();
    this.ai = new AIProcessor();
    this.activeSessions = new Map();
    this.init();
  }

  async init() {
    // Initialize database
    await this.db.init();
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

        case 'EXPORT_DATA':
          const exportData = await this.exportData();
          sendResponse({ data: exportData });
          break;

        case 'IMPORT_DATA':
          await this.importData(data);
          sendResponse({ success: true });
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
    await this.db.updateVisit(context);
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
      await this.db.saveAIInsights(context.url, {
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
    const previousContext = await this.db.getVisitHistory(tab.url);
    
    if (previousContext && previousContext.visit_count > 0) {
      console.log(`🔮 Returning user to: ${tab.url} (${previousContext.visit_count} previous visits)`);
    }
  }

  async handleTabClose(tabId) {
    const session = this.activeSessions.get(tabId);
    if (session && session.context) {
      // Save final state
      await this.db.updateVisit(session.context);
      this.activeSessions.delete(tabId);
    }
  }

  async handlePageUnload(context, tab) {
    await this.db.updateVisit(context);
    this.activeSessions.delete(tab.id);
  }

  async saveHighlight(data) {
    await this.db.saveHighlight(data);
  }

  async getPreviousContext(url) {
    const history = await this.db.getVisitHistory(url);
    const highlights = await this.db.getHighlights(url);
    const insights = await this.db.getAIInsights(url);

    if (!history) return null;

    return {
      visits: history.visit_count || 0,
      lastVisit: history.last_visit,
      totalTimeSpent: history.total_time_spent || 0,
      highlights: highlights.slice(0, 5),
      tags: insights?.tags || [],
      summary: insights?.summary
    };
  }

  async getMemories(filters = {}) {
    return await this.db.getMemories(filters);
  }

  async searchMemories(query) {
    const allMemories = await this.db.getMemories();
    
    // Simple text search across titles, content, and highlights
    const results = allMemories.filter(memory => {
      const highlightTexts = memory.highlights.map(h => h.text || '').join(' ');
      const searchText = `${memory.title} ${highlightTexts}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    // Sort by relevance (number of matches)
    return results.sort((a, b) => {
      const aMatches = (a.title).toLowerCase().split(query.toLowerCase()).length;
      const bMatches = (b.title).toLowerCase().split(query.toLowerCase()).length;
      return bMatches - aMatches;
    });
  }

  async addTag(url, tag) {
    await this.db.addTag(url, tag);
  }

  async getStats() {
    return await this.db.getStats();
  }

  async exportData() {
    return await this.db.exportData();
  }

  async importData(data) {
    return await this.db.importData(data);
  }

  async performCleanup() {
    console.log('🧹 Performing cleanup...');
    await this.db.cleanup();
  }
}

// Initialize the background service
const echoLens = new EchoLensBackground();
