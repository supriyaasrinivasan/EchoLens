/**
 * SupriAI - Background Service Worker
 * Handles browser-level data collection, tab tracking, and AI analysis coordination
 */

import { StorageManager } from './storage.js';
import { ContentClassifier } from './classifier.js';
import { AnalyticsEngine } from './analytics.js';
import { RecommendationEngine } from './recommendations.js';

class BackgroundController {
    constructor() {
        this.storage = new StorageManager();
        this.classifier = new ContentClassifier();
        this.analytics = new AnalyticsEngine();
        this.recommendations = new RecommendationEngine();
        
        // Active sessions tracking
        this.activeSessions = new Map();
        this.trackingEnabled = true;
        
        // Configuration
        this.config = {
            minSessionDuration: 5000, // 5 seconds minimum to track
            updateInterval: 10000, // Update every 10 seconds
            analysisInterval: 300000, // Run analysis every 5 minutes
            dailyAnalysisHour: 23 // Run daily analysis at 11 PM
        };

        this.init();
    }

    async init() {
        console.log('SupriAI Background Service Starting...');
        
        // Load settings
        await this.loadSettings();
        
        // Initialize storage
        await this.storage.init();
        
        // Set up event listeners
        this.setupTabListeners();
        this.setupNavigationListeners();
        this.setupMessageListeners();
        this.setupAlarms();
        
        console.log('SupriAI Background Service Ready');
    }

    async loadSettings() {
        const result = await chrome.storage.local.get(['trackingEnabled', 'config']);
        this.trackingEnabled = result.trackingEnabled !== false;
        if (result.config) {
            this.config = { ...this.config, ...result.config };
        }
    }

    // ==================== Tab Tracking ====================
    setupTabListeners() {
        // Tab activated
        chrome.tabs.onActivated.addListener(async (activeInfo) => {
            if (!this.trackingEnabled) return;
            
            try {
                const tab = await chrome.tabs.get(activeInfo.tabId);
                await this.handleTabChange(tab);
            } catch (error) {
                console.error('Error on tab activation:', error);
            }
        });

        // Tab updated (URL change, title change)
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (!this.trackingEnabled) return;
            if (changeInfo.status !== 'complete') return;
            
            await this.handleTabUpdate(tab);
        });

        // Tab removed
        chrome.tabs.onRemoved.addListener(async (tabId) => {
            await this.endSession(tabId);
        });

        // Window focus changed
        chrome.windows.onFocusChanged.addListener(async (windowId) => {
            if (!this.trackingEnabled) return;
            
            if (windowId === chrome.windows.WINDOW_ID_NONE) {
                // Browser lost focus - pause all sessions
                this.pauseAllSessions();
            } else {
                // Browser gained focus - get active tab
                try {
                    const [tab] = await chrome.tabs.query({ active: true, windowId });
                    if (tab) {
                        await this.handleTabChange(tab);
                    }
                } catch (error) {
                    console.error('Error on window focus change:', error);
                }
            }
        });
    }

    async handleTabChange(tab) {
        // End previous active session in this window
        for (const [tabId, session] of this.activeSessions.entries()) {
            if (session.windowId === tab.windowId && tabId !== tab.id) {
                await this.endSession(tabId);
            }
        }

        // Start new session
        await this.startSession(tab);
    }

    async handleTabUpdate(tab) {
        const existingSession = this.activeSessions.get(tab.id);
        
        if (existingSession && existingSession.url !== tab.url) {
            // URL changed - end old session and start new
            await this.endSession(tab.id);
            await this.startSession(tab);
        } else if (!existingSession) {
            await this.startSession(tab);
        }
    }

    async startSession(tab) {
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            return;
        }

        // Classify the content
        const classification = await this.classifier.classifyUrl(tab.url, tab.title);
        
        if (!classification.isEducational) {
            return; // Only track educational content
        }

        const session = {
            tabId: tab.id,
            windowId: tab.windowId,
            url: tab.url,
            title: tab.title || 'Unknown',
            domain: new URL(tab.url).hostname,
            startTime: Date.now(),
            lastUpdate: Date.now(),
            category: classification.category,
            topics: classification.topics,
            confidence: classification.confidence,
            engagementScore: 0,
            focusLevel: 0,
            scrollDepth: 0,
            mouseMetrics: {
                movements: 0,
                clicks: 0,
                hoverEvents: 0,
                idleTime: 0
            },
            isActive: true
        };

        this.activeSessions.set(tab.id, session);
        
        // Inject content script to start tracking
        try {
            await chrome.tabs.sendMessage(tab.id, { 
                type: 'START_TRACKING',
                sessionId: tab.id
            });
        } catch (error) {
            // Content script might not be ready yet
            console.log('Content script not ready, will track when available');
        }

        console.log(`Session started: ${session.title} [${session.category}]`);
    }

    async endSession(tabId) {
        const session = this.activeSessions.get(tabId);
        if (!session) return;

        const duration = Date.now() - session.startTime;
        
        // Only save if session was long enough
        if (duration >= this.config.minSessionDuration) {
            session.endTime = Date.now();
            session.duration = duration;
            
            // Calculate final engagement score
            session.engagementScore = this.calculateEngagement(session);
            
            // Save to storage
            await this.storage.saveSession(session);
            
            console.log(`Session ended: ${session.title} - ${Math.round(duration / 1000)}s`);
        }

        this.activeSessions.delete(tabId);
    }

    pauseAllSessions() {
        for (const session of this.activeSessions.values()) {
            session.isActive = false;
            session.mouseMetrics.idleTime += Date.now() - session.lastUpdate;
            session.lastUpdate = Date.now();
        }
    }

    calculateEngagement(session) {
        const weights = {
            duration: 0.3,
            scrollDepth: 0.25,
            mouseActivity: 0.25,
            focusTime: 0.2
        };

        // Normalize duration (max 30 minutes for 100%)
        const durationScore = Math.min(session.duration / (30 * 60 * 1000), 1) * 100;
        
        // Scroll depth is already 0-100
        const scrollScore = session.scrollDepth;
        
        // Mouse activity score
        const mouseScore = Math.min(
            (session.mouseMetrics.movements + session.mouseMetrics.clicks * 5) / 100,
            1
        ) * 100;
        
        // Focus time score (inverse of idle time ratio)
        const activeTime = session.duration - session.mouseMetrics.idleTime;
        const focusScore = (activeTime / session.duration) * 100;

        return (
            durationScore * weights.duration +
            scrollScore * weights.scrollDepth +
            mouseScore * weights.mouseActivity +
            focusScore * weights.focusTime
        );
    }

    // ==================== Navigation Tracking ====================
    setupNavigationListeners() {
        chrome.webNavigation.onCompleted.addListener(async (details) => {
            if (!this.trackingEnabled) return;
            if (details.frameId !== 0) return; // Only main frame
            
            // Track navigation patterns
            await this.storage.recordNavigation({
                url: details.url,
                timestamp: details.timeStamp,
                tabId: details.tabId
            });
        });

        // Track history for revisit patterns
        chrome.history.onVisited.addListener(async (historyItem) => {
            if (!this.trackingEnabled) return;
            
            const classification = await this.classifier.classifyUrl(historyItem.url, historyItem.title);
            if (classification.isEducational) {
                await this.storage.recordVisit({
                    url: historyItem.url,
                    title: historyItem.title,
                    visitCount: historyItem.visitCount,
                    lastVisit: historyItem.lastVisitTime,
                    category: classification.category
                });
            }
        });
    }

    // ==================== Message Handling ====================
    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async response
        });
    }

    async handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'TOGGLE_TRACKING':
                this.trackingEnabled = message.enabled;
                await chrome.storage.local.set({ trackingEnabled: message.enabled });
                sendResponse({ success: true });
                break;

            case 'GET_CURRENT_SESSION':
                const session = this.activeSessions.get(message.tabId);
                sendResponse({ session: session || null });
                break;

            case 'UPDATE_ENGAGEMENT':
                await this.updateSessionMetrics(sender.tab.id, message.metrics);
                sendResponse({ success: true });
                break;

            case 'MOUSE_METRICS':
                await this.updateMouseMetrics(sender.tab.id, message.metrics);
                sendResponse({ success: true });
                break;

            case 'SCROLL_UPDATE':
                await this.updateScrollDepth(sender.tab.id, message.depth);
                sendResponse({ success: true });
                break;

            case 'GET_ANALYTICS':
                const analytics = await this.analytics.getAnalytics(message.timeRange);
                sendResponse({ analytics });
                break;

            case 'GET_RECOMMENDATIONS':
                const recs = await this.recommendations.generate();
                sendResponse({ recommendations: recs });
                break;

            case 'SYNC_WITH_BACKEND':
                await this.syncWithPythonBackend();
                sendResponse({ success: true });
                break;

            default:
                sendResponse({ error: 'Unknown message type' });
        }
    }

    async updateSessionMetrics(tabId, metrics) {
        const session = this.activeSessions.get(tabId);
        if (session) {
            session.engagementScore = metrics.engagement || session.engagementScore;
            session.focusLevel = metrics.focusLevel || session.focusLevel;
            session.lastUpdate = Date.now();
        }
    }

    async updateMouseMetrics(tabId, metrics) {
        const session = this.activeSessions.get(tabId);
        if (session) {
            session.mouseMetrics.movements += metrics.movements || 0;
            session.mouseMetrics.clicks += metrics.clicks || 0;
            session.mouseMetrics.hoverEvents += metrics.hoverEvents || 0;
            session.mouseMetrics.idleTime += metrics.idleTime || 0;
            session.lastUpdate = Date.now();
            
            // Update focus level based on mouse activity
            session.focusLevel = this.calculateFocusLevel(session.mouseMetrics);
        }
    }

    calculateFocusLevel(mouseMetrics) {
        // Higher activity = higher focus (0-100)
        const activityScore = Math.min(
            (mouseMetrics.movements / 10 + mouseMetrics.clicks * 3) / 50,
            1
        );
        // Lower idle time = higher focus
        const activeScore = mouseMetrics.idleTime < 30000 ? 1 : 0.5;
        
        return (activityScore * 0.6 + activeScore * 0.4) * 100;
    }

    async updateScrollDepth(tabId, depth) {
        const session = this.activeSessions.get(tabId);
        if (session) {
            session.scrollDepth = Math.max(session.scrollDepth, depth);
        }
    }

    // ==================== Alarms and Scheduled Tasks ====================
    setupAlarms() {
        // Periodic analysis
        chrome.alarms.create('periodicAnalysis', {
            periodInMinutes: 5
        });

        // Daily summary
        chrome.alarms.create('dailySummary', {
            when: this.getNextDailyAlarmTime(),
            periodInMinutes: 24 * 60
        });

        chrome.alarms.onAlarm.addListener(async (alarm) => {
            switch (alarm.name) {
                case 'periodicAnalysis':
                    await this.runPeriodicAnalysis();
                    break;
                case 'dailySummary':
                    await this.generateDailySummary();
                    break;
            }
        });
    }

    getNextDailyAlarmTime() {
        const now = new Date();
        const next = new Date(now);
        next.setHours(this.config.dailyAnalysisHour, 0, 0, 0);
        if (next <= now) {
            next.setDate(next.getDate() + 1);
        }
        return next.getTime();
    }

    async runPeriodicAnalysis() {
        console.log('Running periodic analysis...');
        
        // Update all active sessions
        for (const session of this.activeSessions.values()) {
            session.engagementScore = this.calculateEngagement(session);
        }

        // Run pattern detection
        await this.analytics.detectPatterns();
        
        // Generate new recommendations
        await this.recommendations.generate();
    }

    async generateDailySummary() {
        console.log('Generating daily summary...');
        
        const summary = await this.analytics.generateDailySummary();
        await this.storage.saveDailySummary(summary);
        
        // Sync with Python backend for advanced AI analysis
        await this.syncWithPythonBackend();
    }

    // ==================== Python Backend Integration ====================
    async syncWithPythonBackend() {
        try {
            const data = await this.storage.getDataForSync();
            
            const response = await fetch('http://localhost:5000/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                
                // Store AI insights from backend
                if (result.insights) {
                    await this.storage.saveAIInsights(result.insights);
                }
                
                // Store new recommendations
                if (result.recommendations) {
                    await this.storage.saveRecommendations(result.recommendations);
                }
                
                console.log('Synced with Python backend successfully');
            }
        } catch (error) {
            console.log('Backend sync skipped (server not available):', error.message);
        }
    }
}

// Initialize the background controller
const controller = new BackgroundController();
