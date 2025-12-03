

import { StorageManager } from './storage.js';
import { groupBy, average, getDateRange } from './utils.js';

export class AnalyticsEngine {
    constructor() {
        this.storage = new StorageManager();
    }

    async init() {
        await this.storage.init();
    }

    
    async getAnalytics(timeRange = 'week') {
        const data = await this.storage.getAnalyticsData(timeRange);
        
        return {
            overview: this.calculateOverview(data),
            topicDistribution: this.calculateTopicDistribution(data),
            learningTrends: this.calculateLearningTrends(data),
            engagementMetrics: this.calculateEngagementMetrics(data),
            skillProgress: await this.calculateSkillProgress(),
            patterns: await this.detectPatterns(),
            timeRange: timeRange
        };
    }

    
    calculateOverview(data) {
        const { sessions } = data;
        
        const totalTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const uniqueDays = new Set(sessions.map(s => s.date)).size;
        const uniqueTopics = new Set(sessions.flatMap(s => s.topics || [])).size;
        const avgEngagement = average(sessions, 'engagementScore');
        const avgSessionDuration = sessions.length > 0 ? totalTime / sessions.length : 0;

        return {
            totalTime,
            totalSessions: sessions.length,
            uniqueDays,
            uniqueTopics,
            avgEngagement: Math.round(avgEngagement),
            avgSessionDuration,
            dailyAverage: uniqueDays > 0 ? totalTime / uniqueDays : 0
        };
    }

    
    calculateTopicDistribution(data) {
        const { sessions, topics } = data;
        
        const categoryGroups = groupBy(sessions, 'category');
        const categoryDistribution = Object.entries(categoryGroups).map(([category, items]) => ({
            category,
            count: items.length,
            totalTime: items.reduce((acc, s) => acc + (s.duration || 0), 0),
            avgEngagement: average(items, 'engagementScore')
        })).sort((a, b) => b.totalTime - a.totalTime);

        const topicTime = {};
        sessions.forEach(session => {
            (session.topics || []).forEach(topic => {
                topicTime[topic] = (topicTime[topic] || 0) + (session.duration || 0);
            });
        });

        const topicDistribution = Object.entries(topicTime)
            .map(([name, time]) => ({ name, time }))
            .sort((a, b) => b.time - a.time)
            .slice(0, 10);

        return {
            byCategory: categoryDistribution,
            byTopic: topicDistribution,
            totalCategories: categoryDistribution.length,
            totalTopics: Object.keys(topicTime).length
        };
    }

    
    calculateLearningTrends(data) {
        const { sessions, summaries } = data;
        
        const dailyGroups = groupBy(sessions, 'date');
        const dailyTrends = Object.entries(dailyGroups)
            .map(([date, items]) => ({
                date,
                totalTime: items.reduce((acc, s) => acc + (s.duration || 0), 0),
                sessions: items.length,
                avgEngagement: average(items, 'engagementScore'),
                topics: new Set(items.flatMap(s => s.topics || [])).size
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const weeklyData = this.aggregateByWeek(dailyTrends);

        const bestDay = dailyTrends.reduce((best, day) => 
            day.totalTime > (best?.totalTime || 0) ? day : best, null);

        const hourlyDistribution = this.calculateHourlyDistribution(sessions);

        return {
            daily: dailyTrends,
            weekly: weeklyData,
            bestDay,
            hourlyDistribution,
            consistency: this.calculateConsistency(dailyTrends)
        };
    }

    aggregateByWeek(dailyTrends) {
        const weeks = {};
        
        dailyTrends.forEach(day => {
            const date = new Date(day.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeks[weekKey]) {
                weeks[weekKey] = {
                    weekStart: weekKey,
                    totalTime: 0,
                    sessions: 0,
                    days: 0,
                    avgEngagement: 0
                };
            }
            
            weeks[weekKey].totalTime += day.totalTime;
            weeks[weekKey].sessions += day.sessions;
            weeks[weekKey].days++;
            weeks[weekKey].avgEngagement += day.avgEngagement;
        });

        return Object.values(weeks).map(week => ({
            ...week,
            avgEngagement: week.days > 0 ? week.avgEngagement / week.days : 0
        }));
    }

    calculateHourlyDistribution(sessions) {
        const hours = new Array(24).fill(0);
        
        sessions.forEach(session => {
            if (session.timestamp) {
                const hour = new Date(session.timestamp).getHours();
                hours[hour] += session.duration || 0;
            }
        });

        return hours.map((time, hour) => ({ hour, time }));
    }

    calculateConsistency(dailyTrends) {
        if (dailyTrends.length < 2) return 100;

        let activeDays = dailyTrends.filter(d => d.totalTime > 0).length;
        let totalDays = dailyTrends.length;

        return Math.round((activeDays / totalDays) * 100);
    }

    
    calculateEngagementMetrics(data) {
        const { sessions } = data;
        
        const engagementLevels = {
            high: sessions.filter(s => s.engagementScore >= 70).length,
            medium: sessions.filter(s => s.engagementScore >= 40 && s.engagementScore < 70).length,
            low: sessions.filter(s => s.engagementScore < 40).length
        };

        const avgScrollDepth = average(sessions, 'scrollDepth');
        const avgFocusLevel = average(sessions.map(s => s.focusLevel || 0));

        const recentSessions = sessions.slice(-10);
        const olderSessions = sessions.slice(-20, -10);
        const trend = average(recentSessions, 'engagementScore') - average(olderSessions, 'engagementScore');

        return {
            levels: engagementLevels,
            avgScrollDepth: Math.round(avgScrollDepth),
            avgFocusLevel: Math.round(avgFocusLevel),
            trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
            trendValue: Math.round(trend)
        };
    }

    
    async calculateSkillProgress() {
        const skills = await this.storage.getSkills();
        
        return skills.map(skill => ({
            name: skill.name,
            level: skill.level,
            experience: skill.experience,
            category: skill.category,
            progress: (skill.experience % 100),
            lastPracticed: skill.lastPracticed,
            milestones: skill.milestones?.length || 0
        })).sort((a, b) => b.experience - a.experience);
    }

    
    async detectPatterns() {
        const sessions = await this.storage.getSessions({ limit: 100 });
        const patterns = [];

        const morningCount = sessions.filter(s => {
            const hour = new Date(s.timestamp).getHours();
            return hour >= 6 && hour < 12;
        }).length;
        
        const afternoonCount = sessions.filter(s => {
            const hour = new Date(s.timestamp).getHours();
            return hour >= 12 && hour < 18;
        }).length;
        
        const eveningCount = sessions.filter(s => {
            const hour = new Date(s.timestamp).getHours();
            return hour >= 18 || hour < 6;
        }).length;

        const maxTime = Math.max(morningCount, afternoonCount, eveningCount);
        if (maxTime === morningCount) {
            patterns.push({ type: 'time_preference', value: 'morning', confidence: morningCount / sessions.length });
        } else if (maxTime === afternoonCount) {
            patterns.push({ type: 'time_preference', value: 'afternoon', confidence: afternoonCount / sessions.length });
        } else {
            patterns.push({ type: 'time_preference', value: 'evening', confidence: eveningCount / sessions.length });
        }

        const topicSequences = this.findTopicSequences(sessions);
        if (topicSequences.length > 0) {
            patterns.push({ type: 'topic_sequence', sequences: topicSequences.slice(0, 3) });
        }

        const avgDuration = average(sessions, 'duration');
        patterns.push({
            type: 'session_duration',
            avgMinutes: Math.round(avgDuration / 60000),
            preference: avgDuration > 1800000 ? 'deep_focus' : avgDuration > 600000 ? 'moderate' : 'quick_sessions'
        });

        const revisitPattern = await this.analyzeRevisitPattern();
        if (revisitPattern) {
            patterns.push(revisitPattern);
        }

        return patterns;
    }

    findTopicSequences(sessions) {
        const sequences = {};
        
        for (let i = 0; i < sessions.length - 1; i++) {
            const current = sessions[i].category;
            const next = sessions[i + 1].category;
            
            if (current && next) {
                const key = `${current} → ${next}`;
                sequences[key] = (sequences[key] || 0) + 1;
            }
        }

        return Object.entries(sequences)
            .map(([sequence, count]) => ({ sequence, count }))
            .sort((a, b) => b.count - a.count);
    }

    async analyzeRevisitPattern() {
        const visits = await this.storage.getFrequentVisits(20);
        
        if (visits.length === 0) return null;

        const avgRevisits = average(visits, 'visitCount');
        const mostRevisited = visits[0];

        return {
            type: 'revisit_pattern',
            avgRevisits: Math.round(avgRevisits),
            mostRevisited: mostRevisited?.title || mostRevisited?.url,
            style: avgRevisits > 5 ? 'reinforcement_learner' : 'explorer'
        };
    }

    
    async generateDailySummary() {
        const today = new Date().toISOString().split('T')[0];
        const sessions = await this.storage.getSessions({ startDate: today, endDate: today });

        const summary = {
            date: today,
            totalTime: sessions.reduce((acc, s) => acc + (s.duration || 0), 0),
            sessionsCount: sessions.length,
            topics: [...new Set(sessions.flatMap(s => s.topics || []))],
            categories: [...new Set(sessions.map(s => s.category).filter(Boolean))],
            avgEngagement: average(sessions, 'engagementScore'),
            avgScrollDepth: average(sessions, 'scrollDepth'),
            topSession: sessions.reduce((top, s) => 
                (s.engagementScore > (top?.engagementScore || 0)) ? s : top, null),
            timestamp: Date.now()
        };

        return summary;
    }

    
    async generateWeeklyReport() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const sessions = await this.storage.getSessions({
            startDate: weekAgo.toISOString().split('T')[0]
        });

        const analytics = await this.getAnalytics('week');
        const patterns = await this.detectPatterns();

        return {
            period: {
                start: weekAgo.toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
            },
            overview: analytics.overview,
            topTopics: analytics.topicDistribution.byTopic.slice(0, 5),
            topCategories: analytics.topicDistribution.byCategory.slice(0, 3),
            trends: analytics.learningTrends,
            patterns: patterns,
            insights: this.generateInsights(analytics, patterns),
            recommendations: this.generateWeeklyRecommendations(analytics, patterns)
        };
    }

    generateInsights(analytics, patterns) {
        const insights = [];

        if (analytics.learningTrends.consistency >= 80) {
            insights.push({
                type: 'positive',
                message: `Great consistency! You've been learning ${analytics.learningTrends.consistency}% of days.`,
                icon: '🔥'
            });
        } else if (analytics.learningTrends.consistency < 50) {
            insights.push({
                type: 'suggestion',
                message: 'Try to maintain a more regular learning schedule for better retention.',
                icon: '📅'
            });
        }

        if (analytics.engagementMetrics.trend === 'improving') {
            insights.push({
                type: 'positive',
                message: 'Your engagement is improving! Keep up the focused learning.',
                icon: '📈'
            });
        }

        const timePattern = patterns.find(p => p.type === 'time_preference');
        if (timePattern) {
            insights.push({
                type: 'info',
                message: `You're most productive during ${timePattern.value} hours.`,
                icon: '⏰'
            });
        }

        return insights;
    }

    generateWeeklyRecommendations(analytics, patterns) {
        const recommendations = [];

        const topTopics = analytics.topicDistribution.byTopic.slice(0, 3);
        topTopics.forEach(topic => {
            recommendations.push({
                type: 'continue',
                topic: topic.name,
                message: `Continue your ${topic.name} journey`,
                priority: 'high'
            });
        });

        const durationPattern = patterns.find(p => p.type === 'session_duration');
        if (durationPattern?.preference === 'quick_sessions') {
            recommendations.push({
                type: 'suggestion',
                message: 'Try longer study sessions for deeper understanding',
                priority: 'medium'
            });
        }

        return recommendations;
    }
}
