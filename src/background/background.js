// SupriAI Background Service Worker
// Handles data storage, AI processing, personality tracking, and cross-extension communication

import { DatabaseManager } from './db-manager.js';
import { PersonalityEngine } from './personality-engine.js';
import { GoalAlignmentAI } from './goal-alignment.js';
import { DigitalTwinAI } from './digital-twin.js';
import { SkillTracker } from './skill-tracker.js';
import PremiumFeatures from './premium-features.js';

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

class SupriAIBackground {
  constructor() {
    this.db = new DatabaseManager();
    this.ai = new AIProcessor();
    this.personalityEngine = null;
    this.goalAlignment = null;
    this.digitalTwin = null;
    this.skillTracker = null;
    this.premiumFeatures = null;
    this.activeSessions = new Map();
    this.init();
  }

  async init() {
    // Initialize database
    await this.db.init();
    
    // Initialize PersonaSync modules
    this.personalityEngine = new PersonalityEngine(this.ai);
    this.goalAlignment = new GoalAlignmentAI(this.ai, this.db);
    this.digitalTwin = new DigitalTwinAI(this.ai, this.db);
    this.skillTracker = new SkillTracker(this.ai, this.db);
    this.premiumFeatures = new PremiumFeatures(this.db);
    
    // Initialize premium features
    await this.premiumFeatures.initialize();
    
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

    // Set up periodic tasks
    chrome.alarms.create('cleanup', { periodInMinutes: 60 });
    chrome.alarms.create('weeklySnapshot', { periodInMinutes: 10080 }); // Weekly
    chrome.alarms.create('moodTracking', { periodInMinutes: 30 }); // Every 30 min
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'cleanup') {
        this.performCleanup();
      } else if (alarm.name === 'weeklySnapshot') {
        this.generateWeeklySnapshot();
      } else if (alarm.name === 'moodTracking') {
        this.updateMoodTracking();
      }
    });

    console.log('✨ SupriAI Background Service Worker initialized');
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

        case 'GET_PERSONALITY_SNAPSHOTS':
          const snapshots = await this.db.getPersonalitySnapshots(data?.limit);
          sendResponse({ snapshots });
          break;

        case 'GET_INTEREST_EVOLUTION':
          const evolution = await this.db.getInterestEvolution();
          sendResponse({ evolution });
          break;

        case 'GET_MOOD_SUMMARY':
          const moodSummary = await this.db.getWeeklyMoodSummary();
          sendResponse({ moodSummary });
          break;

        case 'ADD_GOAL':
          const newGoal = await this.goalAlignment.addGoal(data);
          sendResponse({ goal: newGoal });
          break;

        case 'UPDATE_GOAL':
          await this.goalAlignment.updateGoal(data);
          sendResponse({ success: true });
          break;

        case 'GET_GOALS':
          const goals = this.goalAlignment.getGoalProgress();
          sendResponse({ goals });
          break;

        case 'TOGGLE_GOAL':
          await this.goalAlignment.toggleGoal(data.goalId);
          sendResponse({ success: true });
          break;

        case 'DELETE_GOAL':
          await this.goalAlignment.deleteGoal(data.goalId);
          sendResponse({ success: true });
          break;

        case 'GET_GOAL_INSIGHTS':
          const goalInsights = await this.goalAlignment.getWeeklyInsights();
          sendResponse({ insights: goalInsights });
          break;

        case 'ASK_TWIN':
          const twinResponse = await this.digitalTwin.askTwin(data.question);
          sendResponse({ response: twinResponse });
          break;

        case 'GET_TWIN_SUMMARY':
          const twinSummary = this.digitalTwin.getTwinSummary();
          sendResponse({ summary: twinSummary });
          break;

        case 'COMPARE_INTERESTS':
          const comparison = await this.digitalTwin.compareWithPast(data?.days || 30);
          sendResponse({ comparison });
          break;

        case 'GET_SKILL_PROGRESS':
          const skillProgress = await this.skillTracker.getSkillProgress();
          sendResponse(skillProgress);
          break;

        case 'GET_LEARNING_PATHS':
          const paths = await this.skillTracker.getSkillProgress();
          sendResponse({ 
            success: true,
            paths: paths.recommendations || [] 
          });
          break;

        case 'ADD_CUSTOM_SKILL':
          await this.db.saveSkillActivity({
            url: 'manual',
            skill: data.skill || message.skill,
            confidence: 1.0,
            keywords: '',
            timestamp: Date.now()
          });
          sendResponse({ success: true });
          break;

        case 'GET_LEARNING_PATH':
          const learningPath = await this.skillTracker.generateLearningPath(data.skill);
          sendResponse({ success: true, path: learningPath });
          break;

        case 'DELETE_SKILL':
          await this.db.deleteSkillActivity(data.skill);
          sendResponse({ success: true });
          break;

        case 'GET_ALL_SKILLS':
          const allSkills = await this.db.getAllSkills();
          sendResponse({ success: true, skills: allSkills });
          break;

        case 'GET_WEEKLY_SKILL_SUMMARY':
          const weeklySummary = await this.skillTracker.getWeeklySkillSummary();
          sendResponse({ success: true, summary: weeklySummary });
          break;

        // Premium Features
        case 'GET_SUBSCRIPTION_INFO':
          const tierInfo = await this.premiumFeatures.getCurrentTierInfo();
          sendResponse({ success: true, subscription: tierInfo });
          break;

        case 'UPGRADE_SUBSCRIPTION':
          const upgradeResult = await this.premiumFeatures.upgradeTier(data.tier, data.duration);
          sendResponse(upgradeResult);
          break;

        case 'CHECK_FEATURE_ACCESS':
          const hasAccess = await this.premiumFeatures.hasFeatureAccess(data.feature);
          sendResponse({ success: true, hasAccess });
          break;

        case 'GET_FEATURE_LIMIT':
          const limit = await this.premiumFeatures.getFeatureLimit(data.feature);
          sendResponse({ success: true, limit });
          break;

        case 'CHECK_USAGE_LIMIT':
          const withinLimit = await this.premiumFeatures.checkUsageLimit(data.feature);
          sendResponse({ success: true, withinLimit });
          break;

        case 'INCREMENT_FEATURE_USAGE':
          await this.premiumFeatures.incrementFeatureUsage(data.feature);
          sendResponse({ success: true });
          break;

        case 'CREATE_TEAM':
          const teamResult = await this.premiumFeatures.createTeam(data.teamName);
          sendResponse(teamResult);
          break;

        case 'GET_USER_TEAMS':
          const teams = await this.premiumFeatures.getUserTeams();
          sendResponse({ success: true, teams });
          break;

        case 'ADD_TEAM_MEMBER':
          const addMemberResult = await this.premiumFeatures.addTeamMember(
            data.teamId, 
            data.userId, 
            data.role
          );
          sendResponse(addMemberResult);
          break;

        case 'GET_TEAM_MEMBERS':
          const members = await this.premiumFeatures.getTeamMembers(data.teamId);
          sendResponse({ success: true, members });
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

      // PersonaSync: Analyze tone and emotions
      const tone = await this.personalityEngine.analyzeTone(context.content);
      const emotions = await this.personalityEngine.detectEmotionalThemes(context.content);
      const sentiment = await this.personalityEngine.analyzeSentiment(context.content);

      // Skillify: Detect and track skills
      await this.skillTracker.detectSkills(
        context.content,
        context.title,
        context.url,
        topics
      );

      // Save AI insights
      await this.db.saveAIInsights(context.url, {
        summary,
        tags,
        topics,
        timestamp: Date.now()
      });

      // Save mood data
      await this.db.saveMoodData({
        timestamp: Date.now(),
        sentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        emotions: emotions,
        tone: tone,
        url: context.url
      });

      // Update digital twin
      await this.digitalTwin.updateTwin({
        topics,
        tone,
        emotions,
        timestamp: Date.now(),
        timeSpent: context.timeSpent,
        category: this.categorizeContent(topics)
      });

      // Check goal alignment
      const alignment = await this.goalAlignment.checkAlignment(
        context.url,
        context.title,
        context.content,
        context.timeSpent
      );

      // If there's a nudge, send it to content script
      if (alignment?.showNudge) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'SHOW_NUDGE',
              nudge: alignment
            });
          }
        });
      }

      console.log('✨ AI processing complete for:', context.url);
    } catch (error) {
      console.error('AI processing error:', error);
    }
  }

  // Categorize content based on topics
  categorizeContent(topics) {
    const categories = {
      'tech': ['programming', 'code', 'software', 'development', 'ai', 'tech'],
      'learning': ['learn', 'education', 'tutorial', 'course', 'study'],
      'design': ['design', 'ui', 'ux', 'creative', 'art'],
      'business': ['business', 'startup', 'marketing', 'finance'],
      'entertainment': ['gaming', 'movies', 'music', 'entertainment'],
      'news': ['news', 'current', 'events', 'politics'],
      'personal': ['health', 'wellness', 'lifestyle', 'personal']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (topics.some(topic => keywords.some(kw => topic.toLowerCase().includes(kw)))) {
        return category;
      }
    }

    return 'other';
  }

  // Generate weekly personality snapshot
  async generateWeeklySnapshot() {
    try {
      console.log('📸 Generating weekly personality snapshot...');
      
      const weeklyData = await this.db.getWeeklyData();
      const snapshot = await this.personalityEngine.generateWeeklySnapshot(weeklyData);
      
      // Generate quote for the week
      const quote = await this.personalityEngine.generateWeeklyQuote(snapshot);
      snapshot.quoteOfWeek = quote;

      // Save snapshot
      await this.db.savePersonalitySnapshot(snapshot);

      // Update interest evolution
      const previousSnapshots = await this.db.getPersonalitySnapshots(10);
      const trends = this.personalityEngine.detectTrendingInterests(
        { topics: weeklyData.topics },
        previousSnapshots.map(s => ({ topics: s.topTopics }))
      );

      // Save interest evolution data
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM
      const evolutionData = trends.map(trend => ({
        topic: trend.topic,
        period: period,
        count: trend.currentCount,
        totalTime: 0,
        trendScore: trend.trendScore,
        status: trend.status
      }));

      await this.db.saveInterestEvolution(evolutionData);

      console.log('✅ Weekly snapshot generated successfully');
    } catch (error) {
      console.error('Weekly snapshot error:', error);
    }
  }

  // Update mood tracking
  async updateMoodTracking() {
    // This is called periodically to ensure mood data is up to date
    // Actual mood saving happens in processWithAI
    console.log('💭 Mood tracking update');
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
const supriAI = new SupriAIBackground();
