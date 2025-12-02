/**
 * SupriAI - Storage Manager
 * Handles IndexedDB operations for persistent local storage
 */

export class StorageManager {
    constructor() {
        this.dbName = 'SupriAI_DB';
        this.dbVersion = 1;
        this.db = null;
        this._initPromise = null;
    }

    async ensureInitialized() {
        if (this.db) return this.db;
        if (!this._initPromise) {
            this._initPromise = this.init();
        }
        return this._initPromise;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Sessions store - individual learning sessions
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    sessionsStore.createIndex('date', 'date', { unique: false });
                    sessionsStore.createIndex('category', 'category', { unique: false });
                    sessionsStore.createIndex('domain', 'domain', { unique: false });
                    sessionsStore.createIndex('url', 'url', { unique: false });
                }

                // Topics store - aggregated topic data
                if (!db.objectStoreNames.contains('topics')) {
                    const topicsStore = db.createObjectStore('topics', { 
                        keyPath: 'name' 
                    });
                    topicsStore.createIndex('totalTime', 'totalTime', { unique: false });
                    topicsStore.createIndex('category', 'category', { unique: false });
                }

                // Daily summaries store
                if (!db.objectStoreNames.contains('dailySummaries')) {
                    const summariesStore = db.createObjectStore('dailySummaries', { 
                        keyPath: 'date' 
                    });
                }

                // Navigation patterns store
                if (!db.objectStoreNames.contains('navigation')) {
                    const navStore = db.createObjectStore('navigation', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    navStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Visits store - for revisit pattern analysis
                if (!db.objectStoreNames.contains('visits')) {
                    const visitsStore = db.createObjectStore('visits', { 
                        keyPath: 'url' 
                    });
                    visitsStore.createIndex('lastVisit', 'lastVisit', { unique: false });
                    visitsStore.createIndex('visitCount', 'visitCount', { unique: false });
                }

                // Recommendations store
                if (!db.objectStoreNames.contains('recommendations')) {
                    const recsStore = db.createObjectStore('recommendations', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    recsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    recsStore.createIndex('type', 'type', { unique: false });
                }

                // AI Insights store
                if (!db.objectStoreNames.contains('aiInsights')) {
                    const insightsStore = db.createObjectStore('aiInsights', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    insightsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    insightsStore.createIndex('type', 'type', { unique: false });
                }

                // User profile store
                if (!db.objectStoreNames.contains('userProfile')) {
                    db.createObjectStore('userProfile', { keyPath: 'id' });
                }

                // Skill progression store
                if (!db.objectStoreNames.contains('skills')) {
                    const skillsStore = db.createObjectStore('skills', { 
                        keyPath: 'name' 
                    });
                    skillsStore.createIndex('level', 'level', { unique: false });
                    skillsStore.createIndex('category', 'category', { unique: false });
                }
            };
        });
    }

    // ==================== Session Operations ====================
    async saveSession(session) {
        const sessionData = {
            ...session,
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };

        await this.add('sessions', sessionData);
        
        // Update topic aggregates
        for (const topic of session.topics || []) {
            await this.updateTopic(topic, session);
        }

        return sessionData;
    }

    async getSessions(options = {}) {
        const { startDate, endDate, category, limit } = options;
        
        let sessions = await this.getAll('sessions');
        
        if (startDate) {
            sessions = sessions.filter(s => s.date >= startDate);
        }
        if (endDate) {
            sessions = sessions.filter(s => s.date <= endDate);
        }
        if (category) {
            sessions = sessions.filter(s => s.category === category);
        }
        
        sessions.sort((a, b) => b.timestamp - a.timestamp);
        
        if (limit) {
            sessions = sessions.slice(0, limit);
        }
        
        return sessions;
    }

    async getTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const sessions = await this.getAll('sessions');
        const todaySessions = sessions.filter(s => s.date === today);

        // Calculate stats
        const uniqueTopics = new Set();
        let totalTime = 0;

        todaySessions.forEach(session => {
            totalTime += session.duration || 0;
            (session.topics || []).forEach(t => uniqueTopics.add(t));
        });

        // Calculate streak
        const streak = await this.calculateStreak();

        return {
            topicsCount: uniqueTopics.size,
            totalTime: totalTime,
            sessionsCount: todaySessions.length,
            streak: streak
        };
    }

    async calculateStreak() {
        const summaries = await this.getAll('dailySummaries');
        summaries.sort((a, b) => new Date(b.date) - new Date(a.date));

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < summaries.length; i++) {
            const summaryDate = new Date(summaries[i].date);
            summaryDate.setHours(0, 0, 0, 0);
            
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            
            if (summaryDate.getTime() === expectedDate.getTime() && summaries[i].totalTime > 0) {
                streak++;
            } else if (i === 0 && summaryDate.getTime() < expectedDate.getTime()) {
                // Today might not have a summary yet, check yesterday
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                if (summaryDate.getTime() === yesterday.getTime()) {
                    streak++;
                }
            } else {
                break;
            }
        }

        return streak;
    }

    // ==================== Topic Operations ====================
    async updateTopic(topicName, session) {
        const existing = await this.get('topics', topicName);
        
        const topicData = existing || {
            name: topicName,
            category: session.category,
            totalTime: 0,
            sessionCount: 0,
            averageEngagement: 0,
            lastStudied: null,
            progress: 0,
            resources: []
        };

        topicData.totalTime += session.duration || 0;
        topicData.sessionCount++;
        topicData.averageEngagement = (
            (topicData.averageEngagement * (topicData.sessionCount - 1) + session.engagementScore) / 
            topicData.sessionCount
        );
        topicData.lastStudied = new Date().toISOString();
        topicData.progress = Math.min(100, topicData.progress + (session.duration / 600000) * 5); // 5% per 10 mins

        await this.put('topics', topicData);
        
        return topicData;
    }

    async getTopTopics(limit = 5) {
        const topics = await this.getAll('topics');
        return topics
            .sort((a, b) => b.totalTime - a.totalTime)
            .slice(0, limit);
    }

    async getTopicsByCategory(category) {
        const topics = await this.getAll('topics');
        return topics.filter(t => t.category === category);
    }

    // ==================== Daily Summary Operations ====================
    async saveDailySummary(summary) {
        const date = new Date().toISOString().split('T')[0];
        summary.date = date;
        await this.put('dailySummaries', summary);
        return summary;
    }

    async getDailySummaries(days = 30) {
        const summaries = await this.getAll('dailySummaries');
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        return summaries
            .filter(s => new Date(s.date) >= cutoff)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // ==================== Navigation Operations ====================
    async recordNavigation(navData) {
        await this.add('navigation', {
            ...navData,
            timestamp: Date.now()
        });
    }

    async getNavigationPatterns(limit = 100) {
        const navs = await this.getAll('navigation');
        return navs
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // ==================== Visit Operations ====================
    async recordVisit(visitData) {
        const existing = await this.get('visits', visitData.url);
        
        if (existing) {
            existing.visitCount = visitData.visitCount || (existing.visitCount + 1);
            existing.lastVisit = visitData.lastVisit || Date.now();
            await this.put('visits', existing);
        } else {
            await this.put('visits', {
                ...visitData,
                visitCount: visitData.visitCount || 1,
                lastVisit: visitData.lastVisit || Date.now()
            });
        }
    }

    async getFrequentVisits(limit = 10) {
        const visits = await this.getAll('visits');
        return visits
            .sort((a, b) => b.visitCount - a.visitCount)
            .slice(0, limit);
    }

    // ==================== Recommendations Operations ====================
    async saveRecommendations(recommendations) {
        // Clear old recommendations
        await this.clear('recommendations');
        
        for (const rec of recommendations) {
            await this.add('recommendations', {
                ...rec,
                timestamp: Date.now()
            });
        }
    }

    async getRecommendations(limit = 5) {
        const recs = await this.getAll('recommendations');
        return recs
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // ==================== AI Insights Operations ====================
    async saveAIInsights(insights) {
        // Handle different insight formats
        if (!insights) return;
        
        try {
            // If insights is an array, iterate over it
            if (Array.isArray(insights)) {
                for (const insight of insights) {
                    if (insight && typeof insight === 'object') {
                        await this.add('aiInsights', {
                            ...insight,
                            timestamp: Date.now()
                        });
                    }
                }
            } else if (typeof insights === 'object') {
                // If insights is a single object (like local insights), save it directly
                await this.add('aiInsights', {
                    ...insights,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Error saving AI insights:', error);
        }
    }

    async getAIInsights(type = null, limit = 20) {
        let insights = await this.getAll('aiInsights');
        
        if (type) {
            insights = insights.filter(i => i.type === type);
        }
        
        return insights
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // ==================== Skills Operations ====================
    async updateSkill(skillName, data) {
        const existing = await this.get('skills', skillName);
        
        const skillData = existing || {
            name: skillName,
            level: 0,
            experience: 0,
            category: data.category,
            milestones: [],
            lastPracticed: null
        };

        skillData.experience += data.experience || 0;
        skillData.level = Math.floor(skillData.experience / 100);
        skillData.lastPracticed = new Date().toISOString();
        
        if (data.milestone) {
            skillData.milestones.push({
                name: data.milestone,
                date: new Date().toISOString()
            });
        }

        await this.put('skills', skillData);
        return skillData;
    }

    async getSkills() {
        return await this.getAll('skills');
    }

    // ==================== User Profile Operations ====================
    async getUserProfile() {
        const profile = await this.get('userProfile', 'main');
        return profile || {
            id: 'main',
            interestClusters: [],
            learningStyle: null,
            preferredCategories: [],
            skillLevel: 'beginner',
            weeklyGoal: 0,
            createdAt: new Date().toISOString()
        };
    }

    async updateUserProfile(updates) {
        const profile = await this.getUserProfile();
        const updated = { ...profile, ...updates };
        await this.put('userProfile', updated);
        return updated;
    }

    // ==================== Data Export for Backend Sync ====================
    async getDataForSync() {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const sessions = await this.getSessions({
            startDate: weekAgo.toISOString().split('T')[0]
        });
        
        const topics = await this.getAll('topics');
        const profile = await this.getUserProfile();
        const skills = await this.getSkills();

        return {
            sessions: sessions.map(s => ({
                url: s.url || '',
                domain: s.domain || '',
                title: s.title || 'Unknown',
                category: s.category || 'General',
                topics: Array.isArray(s.topics) ? s.topics : [],
                duration: s.duration || 0,
                engagementScore: s.engagementScore || 0,
                scrollDepth: s.scrollDepth || 0,
                date: s.date || new Date().toISOString().split('T')[0],
                timestamp: s.timestamp || Date.now()
            })),
            topics: topics.map(t => ({
                name: t.name || 'Unknown',
                category: t.category || 'General',
                totalTime: t.totalTime || 0,
                sessionCount: t.sessionCount || 0,
                averageEngagement: t.averageEngagement || 0
            })),
            profile: {
                interestClusters: profile.interestClusters || [],
                learningStyle: profile.learningStyle || 'balanced',
                skillLevel: profile.skillLevel || 'beginner',
                preferredCategories: profile.preferredCategories || [],
                weeklyGoal: profile.weeklyGoal || 300
            },
            skills: skills.map(sk => ({
                name: sk.name || 'Unknown',
                category: sk.category || 'General',
                experience: sk.experience || 0,
                level: sk.level || 0,
                lastPracticed: sk.lastPracticed || null
            })),
            timestamp: Date.now()
        };
    }

    // ==================== Analytics Data ====================
    async getAnalyticsData(timeRange = 'week') {
        const today = new Date();
        let startDate = new Date(today);
        
        switch (timeRange) {
            case 'day':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        const sessions = await this.getSessions({
            startDate: startDate.toISOString().split('T')[0]
        });

        const topics = await this.getTopTopics(10);
        const summaries = await this.getDailySummaries(
            Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))
        );

        return {
            sessions,
            topics,
            summaries,
            timeRange
        };
    }

    // ==================== IndexedDB Helpers ====================
    async add(storeName, data) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
