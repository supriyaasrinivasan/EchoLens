

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

                if (!db.objectStoreNames.contains('topics')) {
                    const topicsStore = db.createObjectStore('topics', { 
                        keyPath: 'name' 
                    });
                    topicsStore.createIndex('totalTime', 'totalTime', { unique: false });
                    topicsStore.createIndex('category', 'category', { unique: false });
                }

                if (!db.objectStoreNames.contains('dailySummaries')) {
                    const summariesStore = db.createObjectStore('dailySummaries', { 
                        keyPath: 'date' 
                    });
                }

                if (!db.objectStoreNames.contains('navigation')) {
                    const navStore = db.createObjectStore('navigation', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    navStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('visits')) {
                    const visitsStore = db.createObjectStore('visits', { 
                        keyPath: 'url' 
                    });
                    visitsStore.createIndex('lastVisit', 'lastVisit', { unique: false });
                    visitsStore.createIndex('visitCount', 'visitCount', { unique: false });
                }

                if (!db.objectStoreNames.contains('recommendations')) {
                    const recsStore = db.createObjectStore('recommendations', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    recsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    recsStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains('aiInsights')) {
                    const insightsStore = db.createObjectStore('aiInsights', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    insightsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    insightsStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains('userProfile')) {
                    db.createObjectStore('userProfile', { keyPath: 'id' });
                }

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

    async saveSession(session) {
        const sessionData = {
            ...session,
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };

        await this.add('sessions', sessionData);
        
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

        const uniqueTopics = new Set();
        let totalTime = 0;

        todaySessions.forEach(session => {
            totalTime += session.duration || 0;
            (session.topics || []).forEach(t => uniqueTopics.add(t));
        });

        const streak = await this.calculateStreak();

        return {
            topicsCount: uniqueTopics.size,
            totalTime: totalTime,
            sessionsCount: todaySessions.length,
            streak: streak
        };
    }

    async calculateStreak() {
        // Get all sessions to build a map of active days
        const sessions = await this.getAll('sessions');
        const dailySummaries = await this.getAll('dailySummaries');
        
        // Build a set of all dates with learning activity
        const activeDays = new Set();
        
        // Add dates from sessions
        sessions.forEach(session => {
            if (session.date && session.duration > 0) {
                activeDays.add(session.date);
            }
        });
        
        // Add dates from daily summaries
        dailySummaries.forEach(summary => {
            if (summary.date && summary.totalTime > 0) {
                activeDays.add(summary.date);
            }
        });
        
        if (activeDays.size === 0) {
            return 0;
        }
        
        // Get today and yesterday in YYYY-MM-DD format
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Check if streak should start from today or yesterday
        let streak = 0;
        let currentDate = new Date(today);
        
        // If today has no activity, check if yesterday has activity
        if (!activeDays.has(todayStr)) {
            if (!activeDays.has(yesterdayStr)) {
                return 0;
            }
            // Start counting from yesterday
            currentDate = new Date(yesterday);
        }
        
        // Count consecutive days going backwards
        while (streak < 365) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            if (activeDays.has(dateStr)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

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
        topicData.progress = Math.min(100, topicData.progress + (session.duration / 600000) * 5);

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

    async getProductivityInsights() {
        const sessions = await this.getAll('sessions');
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const recentSessions = sessions.filter(s => new Date(s.timestamp) >= weekAgo);
        
        // Calculate best learning hours
        const hourlyStats = {};
        recentSessions.forEach(s => {
            const hour = new Date(s.timestamp).getHours();
            if (!hourlyStats[hour]) {
                hourlyStats[hour] = { totalTime: 0, sessions: 0, avgEngagement: 0 };
            }
            hourlyStats[hour].totalTime += s.duration || 0;
            hourlyStats[hour].sessions++;
            hourlyStats[hour].avgEngagement += s.engagementScore || 0;
        });
        
        // Find best hour
        let bestHour = null;
        let maxTime = 0;
        Object.entries(hourlyStats).forEach(([hour, stats]) => {
            stats.avgEngagement = stats.sessions > 0 ? stats.avgEngagement / stats.sessions : 0;
            if (stats.totalTime > maxTime) {
                maxTime = stats.totalTime;
                bestHour = parseInt(hour);
            }
        });
        
        // Calculate category breakdown
        const categoryStats = {};
        recentSessions.forEach(s => {
            const cat = s.category || 'General';
            if (!categoryStats[cat]) {
                categoryStats[cat] = { totalTime: 0, sessions: 0 };
            }
            categoryStats[cat].totalTime += s.duration || 0;
            categoryStats[cat].sessions++;
        });
        
        // Get top category
        const topCategory = Object.entries(categoryStats)
            .sort((a, b) => b[1].totalTime - a[1].totalTime)[0];
        
        // Calculate daily average
        const dailyTotals = {};
        recentSessions.forEach(s => {
            if (!dailyTotals[s.date]) dailyTotals[s.date] = 0;
            dailyTotals[s.date] += s.duration || 0;
        });
        const daysWithActivity = Object.keys(dailyTotals).length;
        const totalTime = Object.values(dailyTotals).reduce((a, b) => a + b, 0);
        const dailyAverage = daysWithActivity > 0 ? totalTime / daysWithActivity : 0;
        
        // Calculate consistency score (days active / 7)
        const consistencyScore = Math.round((daysWithActivity / 7) * 100);
        
        // Get streak
        const streak = await this.calculateStreak();
        
        // Get total learning days
        const allSessions = sessions;
        const allDays = new Set();
        allSessions.forEach(s => {
            if (s.date) allDays.add(s.date);
        });
        const totalDays = allDays.size;
        
        return {
            bestHour: bestHour,
            bestLearningHour: bestHour,
            bestHourFormatted: bestHour !== null ? 
                `${bestHour % 12 || 12}${bestHour < 12 ? 'AM' : 'PM'} - ${(bestHour + 1) % 12 || 12}${(bestHour + 1) < 12 ? 'AM' : 'PM'}` : 
                'Not enough data',
            topCategory: topCategory ? topCategory[0] : 'None',
            topCategoryTime: topCategory ? topCategory[1].totalTime : 0,
            dailyAverage,
            weeklyTotal: totalTime,
            sessionsThisWeek: recentSessions.length,
            consistencyScore,
            streak,
            totalDays,
            categoryBreakdown: categoryStats,
            hourlyDistribution: hourlyStats
        };
    }

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

    async saveRecommendations(recommendations) {
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

    async saveAIInsights(insights) {
        if (!insights) return;
        
        try {
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

    // Knowledge Level Tracking
    async getKnowledgeProfile() {
        const sessions = await this.getAll('sessions');
        const topics = await this.getTopTopics(50);
        
        // Calculate knowledge areas based on time spent and engagement
        const knowledgeAreas = {};
        
        sessions.forEach(session => {
            const category = session.category || 'General';
            if (!knowledgeAreas[category]) {
                knowledgeAreas[category] = {
                    category,
                    totalTime: 0,
                    sessions: 0,
                    avgEngagement: 0,
                    topics: new Set(),
                    firstSeen: session.timestamp,
                    lastSeen: session.timestamp,
                    progressScore: 0
                };
            }
            
            const area = knowledgeAreas[category];
            area.totalTime += session.duration || 0;
            area.sessions++;
            area.avgEngagement += session.engagementScore || 0;
            if (session.topics) {
                session.topics.forEach(t => area.topics.add(t));
            }
            if (session.timestamp < area.firstSeen) area.firstSeen = session.timestamp;
            if (session.timestamp > area.lastSeen) area.lastSeen = session.timestamp;
        });

        // Calculate progress scores and levels
        const results = Object.values(knowledgeAreas).map(area => {
            area.avgEngagement = area.sessions > 0 ? area.avgEngagement / area.sessions : 0;
            area.topics = area.topics.size;
            
            // Calculate progress score (0-100)
            // Based on: time spent (40%), topics covered (30%), engagement (20%), consistency (10%)
            const timeScore = Math.min(100, (area.totalTime / 3600000) * 10); // 10 hours = 100%
            const topicsScore = Math.min(100, area.topics * 10); // 10 topics = 100%
            const engagementScore = area.avgEngagement;
            const daysActive = Math.ceil((area.lastSeen - area.firstSeen) / (24 * 60 * 60 * 1000)) || 1;
            const consistencyScore = Math.min(100, (area.sessions / daysActive) * 50);
            
            area.progressScore = Math.round(
                (timeScore * 0.4) + 
                (topicsScore * 0.3) + 
                (engagementScore * 0.2) + 
                (consistencyScore * 0.1)
            );
            
            // Determine level
            if (area.progressScore >= 80) {
                area.level = 'Expert';
            } else if (area.progressScore >= 60) {
                area.level = 'Advanced';
            } else if (area.progressScore >= 40) {
                area.level = 'Intermediate';
            } else if (area.progressScore >= 20) {
                area.level = 'Beginner';
            } else {
                area.level = 'Novice';
            }
            
            return area;
        }).sort((a, b) => b.progressScore - a.progressScore);

        // Calculate overall level
        const totalProgress = results.reduce((sum, a) => sum + a.progressScore, 0);
        const avgProgress = results.length > 0 ? totalProgress / results.length : 0;
        
        let overallLevel;
        if (avgProgress >= 70) overallLevel = 'Expert';
        else if (avgProgress >= 50) overallLevel = 'Advanced';
        else if (avgProgress >= 30) overallLevel = 'Intermediate';
        else overallLevel = 'Beginner';

        return {
            overallLevel,
            averageProgress: Math.round(avgProgress),
            areas: results,
            totalCategories: results.length,
            strongestArea: results[0] || null,
            weakestArea: results[results.length - 1] || null
        };
    }

    // Get learning gaps for recommendations
    async getLearningGaps() {
        const profile = await this.getKnowledgeProfile();
        const gaps = [];

        // Identify categories with low progress but high interest (many sessions)
        profile.areas.forEach(area => {
            if (area.progressScore < 50 && area.sessions > 5) {
                gaps.push({
                    category: area.category,
                    currentLevel: area.level,
                    progressScore: area.progressScore,
                    gap: 'Need more depth - time spent vs sessions ratio is low',
                    recommendation: `Focus on longer, more focused ${area.category} sessions`
                });
            }
        });

        // Identify stale knowledge (not studied recently)
        const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        profile.areas.forEach(area => {
            if (area.lastSeen < monthAgo && area.progressScore > 20) {
                gaps.push({
                    category: area.category,
                    currentLevel: area.level,
                    progressScore: area.progressScore,
                    gap: 'Knowledge may be getting stale',
                    recommendation: `Review ${area.category} to maintain your ${area.level} level`
                });
            }
        });

        return gaps;
    }

    // Get suggested learning paths based on history
    async getSuggestedLearningPaths() {
        const profile = await this.getKnowledgeProfile();
        const paths = [];

        const categoryPaths = {
            'Programming': {
                name: 'Full Stack Developer Path',
                description: 'Master programming from basics to advanced concepts',
                steps: ['Fundamentals', 'Data Structures', 'Web Development', 'Backend', 'Databases']
            },
            'Data Science': {
                name: 'Data Science Mastery Path',
                description: 'From statistics to machine learning and beyond',
                steps: ['Statistics', 'Python/R', 'Data Analysis', 'Machine Learning', 'Deep Learning']
            },
            'Web Development': {
                name: 'Modern Web Developer Path',
                description: 'Build beautiful and functional web applications',
                steps: ['HTML/CSS', 'JavaScript', 'React/Vue', 'Node.js', 'Full Stack']
            },
            'Machine Learning': {
                name: 'AI/ML Engineer Path',
                description: 'Become an AI/ML expert',
                steps: ['Math Foundations', 'ML Basics', 'Deep Learning', 'NLP/CV', 'MLOps']
            }
        };

        profile.areas.slice(0, 3).forEach(area => {
            const pathConfig = categoryPaths[area.category];
            if (pathConfig) {
                const progressPercent = Math.min(100, area.progressScore);
                const currentStep = Math.floor((progressPercent / 100) * pathConfig.steps.length);
                
                paths.push({
                    ...pathConfig,
                    category: area.category,
                    progress: progressPercent,
                    currentStep: currentStep,
                    nextStep: pathConfig.steps[currentStep] || pathConfig.steps[pathConfig.steps.length - 1],
                    level: area.level
                });
            }
        });

        return paths;
    }
}
