// Learning Analytics Module - Advanced Learning Pattern Analysis
// Comprehensive analytics for learning behavior, patterns, and insights

import { StorageManager } from './storage.js';
import { groupBy, average, getDateRange } from './utils.js';

export class LearningAnalytics {
    constructor() {
        this.storage = new StorageManager();
        
        this.analysisConfig = {
            shortTermWindow: 7, // days
            mediumTermWindow: 30,
            longTermWindow: 90,
            minSessionsForPatterns: 5,
            engagementThreshold: 60,
            masteryThreshold: 80
        };
    }

    /**
     * Comprehensive learning analytics
     * @param {Array} sessions - All learning sessions
     * @param {Array} topics - All topics
     * @param {Object} options - Analysis options
     * @returns {Object} Complete analytics report
     */
    async analyzeComprehensive(sessions, topics, options = {}) {
        const timeRange = options.timeRange || 'week';
        const filteredSessions = this.filterByTimeRange(sessions, timeRange);

        return {
            overview: this.analyzeOverview(filteredSessions),
            engagement: this.analyzeEngagement(filteredSessions),
            productivity: this.analyzeProductivity(filteredSessions),
            learningVelocity: this.analyzeLearningVelocity(filteredSessions),
            topicMastery: this.analyzeTopicMastery(topics, filteredSessions),
            behaviorPatterns: this.analyzeBehaviorPatterns(filteredSessions),
            timeDistribution: this.analyzeTimeDistribution(filteredSessions),
            focusAnalysis: this.analyzeFocus(filteredSessions),
            competencyMap: this.buildCompetencyMap(topics, filteredSessions),
            learningCurves: this.analyzeLearningCurves(filteredSessions),
            insights: this.generateInsights(filteredSessions, topics)
        };
    }

    /**
     * Analyze overall learning metrics
     */
    analyzeOverview(sessions) {
        if (sessions.length === 0) {
            return this.getEmptyOverview();
        }

        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const uniqueDates = new Set(sessions.map(s => 
            new Date(s.timestamp).toDateString()
        )).size;
        const uniqueTopics = new Set(sessions.flatMap(s => s.topics || [])).size;
        const avgEngagement = average(sessions.map(s => s.engagementScore || 0));
        const completionRate = this.calculateCompletionRate(sessions);

        return {
            totalSessions: sessions.length,
            totalTime: totalTime,
            totalHours: Math.round(totalTime / 3600000 * 10) / 10,
            uniqueDays: uniqueDates,
            uniqueTopics,
            averageEngagement: Math.round(avgEngagement),
            completionRate: Math.round(completionRate),
            avgSessionDuration: sessions.length > 0 ? totalTime / sessions.length : 0,
            dailyAverage: uniqueDates > 0 ? totalTime / uniqueDates : 0,
            consistency: this.calculateConsistency(sessions),
            trend: this.calculateOverallTrend(sessions)
        };
    }

    /**
     * Deep engagement analysis
     */
    analyzeEngagement(sessions) {
        if (sessions.length === 0) return null;

        const engagementScores = sessions.map(s => s.engagementScore || 0);
        const highEngagement = sessions.filter(s => (s.engagementScore || 0) >= 70).length;
        const mediumEngagement = sessions.filter(s => {
            const eng = s.engagementScore || 0;
            return eng >= 40 && eng < 70;
        }).length;
        const lowEngagement = sessions.filter(s => (s.engagementScore || 0) < 40).length;

        const trend = this.calculateEngagementTrend(sessions);
        const volatility = this.calculateEngagementVolatility(sessions);

        return {
            average: Math.round(average(engagementScores)),
            median: this.median(engagementScores),
            distribution: {
                high: highEngagement,
                medium: mediumEngagement,
                low: lowEngagement
            },
            percentages: {
                high: Math.round((highEngagement / sessions.length) * 100),
                medium: Math.round((mediumEngagement / sessions.length) * 100),
                low: Math.round((lowEngagement / sessions.length) * 100)
            },
            trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
            trendValue: Math.round(trend * 10) / 10,
            volatility: volatility < 15 ? 'stable' : volatility < 30 ? 'moderate' : 'high',
            volatilityValue: Math.round(volatility),
            peakTimes: this.identifyPeakEngagementTimes(sessions),
            correlations: this.analyzeEngagementCorrelations(sessions)
        };
    }

    /**
     * Productivity analysis
     */
    analyzeProductivity(sessions) {
        const timeBlocks = this.categorizeTimeBlocks(sessions);
        const productiveHours = this.calculateProductiveHours(sessions);
        const efficiency = this.calculateEfficiency(sessions);
        const focusScore = this.calculateFocusScore(sessions);

        return {
            productiveHours,
            efficiency: Math.round(efficiency),
            focusScore: Math.round(focusScore),
            timeBlocks,
            peakProductivity: this.identifyPeakProductivity(sessions),
            distractionLevel: this.calculateDistractionLevel(sessions),
            flowState: this.analyzeFlowState(sessions),
            recommendations: this.generateProductivityRecommendations(efficiency, focusScore)
        };
    }

    /**
     * Learning velocity - pace of learning
     */
    analyzeLearningVelocity(sessions) {
        const weeklyData = this.groupByWeek(sessions);
        const velocityTrend = this.calculateVelocityTrend(weeklyData);
        const topicVelocity = this.calculateTopicAcquisitionRate(sessions);

        return {
            currentVelocity: this.calculateCurrentVelocity(sessions),
            velocityTrend,
            acceleration: this.calculateAcceleration(weeklyData),
            topicAcquisitionRate: topicVelocity,
            comparisons: {
                vsLastWeek: this.compareVelocity(sessions, 7),
                vsLastMonth: this.compareVelocity(sessions, 30)
            },
            projections: this.projectFutureVelocity(weeklyData)
        };
    }

    /**
     * Topic mastery analysis
     */
    analyzeTopicMastery(topics, sessions) {
        const masteryLevels = topics.map(topic => {
            const topicSessions = sessions.filter(s => 
                (s.topics || []).includes(topic.name)
            );

            if (topicSessions.length === 0) {
                return { topic: topic.name, mastery: 0, level: 'novice' };
            }

            const totalTime = topicSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const avgEngagement = average(topicSessions.map(s => s.engagementScore || 0));
            const consistency = this.calculateConsistency(topicSessions);
            
            // Mastery calculation (0-100)
            const mastery = Math.min(100, 
                (totalTime / 3600000) * 15 + // Time factor
                avgEngagement * 0.4 + // Engagement factor
                consistency * 30 + // Consistency factor
                topicSessions.length * 2 // Session count factor
            );

            const level = this.getMasteryLevel(mastery);

            return {
                topic: topic.name,
                mastery: Math.round(mastery),
                level,
                totalTime,
                sessionCount: topicSessions.length,
                avgEngagement: Math.round(avgEngagement),
                consistency: Math.round(consistency * 100),
                lastStudied: topicSessions[topicSessions.length - 1]?.timestamp,
                progression: this.calculateProgression(topicSessions)
            };
        });

        return {
            topics: masteryLevels.sort((a, b) => b.mastery - a.mastery),
            averageMastery: Math.round(average(masteryLevels.map(t => t.mastery))),
            masteredTopics: masteryLevels.filter(t => t.mastery >= this.analysisConfig.masteryThreshold),
            inProgressTopics: masteryLevels.filter(t => t.mastery >= 30 && t.mastery < this.analysisConfig.masteryThreshold),
            beginnerTopics: masteryLevels.filter(t => t.mastery < 30),
            recommendations: this.generateMasteryRecommendations(masteryLevels)
        };
    }

    /**
     * Behavior pattern analysis
     */
    analyzeBehaviorPatterns(sessions) {
        return {
            learningStyle: this.identifyLearningStyle(sessions),
            studyHabits: this.analyzeStudyHabits(sessions),
            sessionPatterns: this.analyzeSessionPatterns(sessions),
            breakPatterns: this.analyzeBreakPatterns(sessions),
            topicSwitching: this.analyzeTopicSwitching(sessions),
            peakPerformanceTimes: this.identifyPeakTimes(sessions),
            motivationPatterns: this.analyzeMotivation(sessions),
            procrastinationIndicators: this.identifyProcrastination(sessions)
        };
    }

    /**
     * Time distribution analysis
     */
    analyzeTimeDistribution(sessions) {
        const byCategory = this.groupByCategory(sessions);
        const byHour = this.groupByHour(sessions);
        const byDayOfWeek = this.groupByDayOfWeek(sessions);
        const byTimeOfDay = this.groupByTimeOfDay(sessions);

        return {
            byCategory,
            byHour,
            byDayOfWeek,
            byTimeOfDay,
            visualizations: this.prepareTimeDistributionVisuals(sessions)
        };
    }

    /**
     * Focus analysis
     */
    analyzeFocus(sessions) {
        const focusMetrics = sessions.map(s => ({
            duration: s.duration || 0,
            engagement: s.engagementScore || 0,
            focusScore: this.calculateSessionFocusScore(s)
        }));

        return {
            averageFocus: Math.round(average(focusMetrics.map(m => m.focusScore))),
            focusDuration: this.calculateAverageFocusDuration(sessions),
            deepWorkSessions: sessions.filter(s => (s.engagementScore || 0) >= 80).length,
            distractionRate: this.calculateDistractionRate(sessions),
            focusTrend: this.calculateFocusTrend(sessions),
            recommendations: this.generateFocusRecommendations(focusMetrics)
        };
    }

    /**
     * Build competency map
     */
    buildCompetencyMap(topics, sessions) {
        const competencies = {};
        const categoryMap = {};

        topics.forEach(topic => {
            const category = topic.category || 'Other';
            if (!categoryMap[category]) {
                categoryMap[category] = [];
            }
            categoryMap[category].push(topic);
        });

        Object.entries(categoryMap).forEach(([category, categoryTopics]) => {
            const categorySessions = sessions.filter(s => s.category === category);
            const totalTime = categorySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const avgEngagement = average(categorySessions.map(s => s.engagementScore || 0));

            competencies[category] = {
                level: this.calculateCategoryLevel(totalTime, avgEngagement),
                topicsCount: categoryTopics.length,
                totalTime,
                avgEngagement: Math.round(avgEngagement),
                strength: this.assessCategoryStrength(categorySessions),
                nextSteps: this.suggestNextSteps(category, categoryTopics, categorySessions)
            };
        });

        return competencies;
    }

    /**
     * Analyze learning curves
     */
    analyzeLearningCurves(sessions) {
        const sortedSessions = [...sessions].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        const curves = {
            engagement: this.buildEngagementCurve(sortedSessions),
            efficiency: this.buildEfficiencyCurve(sortedSessions),
            complexity: this.buildComplexityCurve(sortedSessions)
        };

        return {
            curves,
            inflectionPoints: this.identifyInflectionPoints(curves),
            plateaus: this.identifyPlateaus(curves),
            growthPhases: this.identifyGrowthPhases(curves),
            predictions: this.predictFutureCurve(curves)
        };
    }

    /**
     * Generate actionable insights
     */
    generateInsights(sessions, topics) {
        const insights = [];

        // Engagement insights
        const avgEngagement = average(sessions.map(s => s.engagementScore || 0));
        if (avgEngagement > 70) {
            insights.push({
                type: 'positive',
                category: 'engagement',
                message: 'Excellent engagement levels! You\'re in the zone.',
                priority: 'low'
            });
        } else if (avgEngagement < 40) {
            insights.push({
                type: 'warning',
                category: 'engagement',
                message: 'Low engagement detected. Consider trying different learning formats.',
                priority: 'high'
            });
        }

        // Consistency insights
        const consistency = this.calculateConsistency(sessions);
        if (consistency > 0.7) {
            insights.push({
                type: 'positive',
                category: 'consistency',
                message: 'Great learning consistency! Keep up the regular practice.',
                priority: 'low'
            });
        } else if (consistency < 0.3) {
            insights.push({
                type: 'suggestion',
                category: 'consistency',
                message: 'Try to establish a regular learning schedule for better results.',
                priority: 'medium'
            });
        }

        // Time-based insights
        const bestTime = this.identifyBestLearningTime(sessions);
        if (bestTime) {
            insights.push({
                type: 'info',
                category: 'productivity',
                message: `Your peak learning time is ${bestTime}. Schedule challenging topics then.`,
                priority: 'medium'
            });
        }

        // Topic diversity insights
        const uniqueTopics = new Set(sessions.flatMap(s => s.topics || [])).size;
        if (uniqueTopics > 10) {
            insights.push({
                type: 'positive',
                category: 'diversity',
                message: `You're exploring ${uniqueTopics} different topics. Great breadth!`,
                priority: 'low'
            });
        } else if (uniqueTopics < 3) {
            insights.push({
                type: 'suggestion',
                category: 'diversity',
                message: 'Consider exploring related topics for a broader understanding.',
                priority: 'medium'
            });
        }

        // Burnout detection
        const burnoutRisk = this.assessBurnoutRisk(sessions);
        if (burnoutRisk > 0.7) {
            insights.push({
                type: 'warning',
                category: 'wellbeing',
                message: 'High burnout risk detected. Take breaks and pace yourself.',
                priority: 'high'
            });
        }

        // Mastery insights
        const masteryProgress = this.calculateAverageMasteryProgress(topics, sessions);
        if (masteryProgress > 60) {
            insights.push({
                type: 'positive',
                category: 'mastery',
                message: 'You\'re making great progress toward mastery!',
                priority: 'low'
            });
        }

        return insights.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    // ============ Helper Methods ============

    filterByTimeRange(sessions, timeRange) {
        const now = new Date();
        const cutoff = new Date();

        switch (timeRange) {
            case 'week':
                cutoff.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoff.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                cutoff.setFullYear(now.getFullYear() - 1);
                break;
            default:
                cutoff.setDate(now.getDate() - 7);
        }

        return sessions.filter(s => new Date(s.timestamp) >= cutoff);
    }

    calculateCompletionRate(sessions) {
        const completedSessions = sessions.filter(s => 
            (s.engagementScore || 0) >= this.analysisConfig.engagementThreshold
        );
        return sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0;
    }

    calculateConsistency(sessions) {
        if (sessions.length < 2) return 0;

        const sorted = [...sessions].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        const intervals = [];
        for (let i = 1; i < sorted.length; i++) {
            const days = (new Date(sorted[i].timestamp) - new Date(sorted[i-1].timestamp)) / 86400000;
            intervals.push(days);
        }

        const avgInterval = average(intervals);
        const variance = this.calculateVariance(intervals);
        
        return Math.max(0, 1 - (Math.sqrt(variance) / (avgInterval + 1)));
    }

    calculateOverallTrend(sessions) {
        if (sessions.length < 4) return 'stable';

        const half = Math.floor(sessions.length / 2);
        const firstHalf = sessions.slice(0, half);
        const secondHalf = sessions.slice(half);

        const firstAvg = average(firstHalf.map(s => s.engagementScore || 0));
        const secondAvg = average(secondHalf.map(s => s.engagementScore || 0));

        const change = secondAvg - firstAvg;
        
        if (change > 5) return 'improving';
        if (change < -5) return 'declining';
        return 'stable';
    }

    calculateEngagementTrend(sessions) {
        if (sessions.length < 2) return 0;

        const recent = sessions.slice(-5);
        const previous = sessions.slice(-10, -5);

        const recentAvg = average(recent.map(s => s.engagementScore || 0));
        const previousAvg = average(previous.map(s => s.engagementScore || 0));

        return recentAvg - previousAvg;
    }

    calculateEngagementVolatility(sessions) {
        const scores = sessions.map(s => s.engagementScore || 0);
        const variance = this.calculateVariance(scores);
        return Math.sqrt(variance);
    }

    identifyPeakEngagementTimes(sessions) {
        const hourlyEngagement = new Array(24).fill(0).map(() => ({ total: 0, count: 0 }));

        sessions.forEach(session => {
            const hour = new Date(session.timestamp).getHours();
            hourlyEngagement[hour].total += session.engagementScore || 0;
            hourlyEngagement[hour].count += 1;
        });

        return hourlyEngagement
            .map((data, hour) => ({
                hour,
                avgEngagement: data.count > 0 ? data.total / data.count : 0
            }))
            .filter(d => d.avgEngagement > 0)
            .sort((a, b) => b.avgEngagement - a.avgEngagement)
            .slice(0, 3);
    }

    analyzeEngagementCorrelations(sessions) {
        // Correlate engagement with various factors
        return {
            withTimeOfDay: this.calculateTimeCorrelation(sessions),
            withSessionLength: this.calculateLengthCorrelation(sessions),
            withTopicFamiliarity: this.calculateFamiliarityCorrelation(sessions)
        };
    }

    calculateProductiveHours(sessions) {
        const productiveTime = sessions
            .filter(s => (s.engagementScore || 0) >= 60)
            .reduce((sum, s) => sum + (s.duration || 0), 0);

        return Math.round(productiveTime / 3600000 * 10) / 10;
    }

    calculateEfficiency(sessions) {
        if (sessions.length === 0) return 0;

        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const effectiveTime = sessions
            .filter(s => (s.engagementScore || 0) >= 50)
            .reduce((sum, s) => sum + (s.duration || 0), 0);

        return totalTime > 0 ? (effectiveTime / totalTime) * 100 : 0;
    }

    calculateFocusScore(sessions) {
        const focusIndicators = sessions.map(s => {
            const duration = s.duration || 0;
            const engagement = s.engagementScore || 0;
            
            // Longer focused sessions = higher score
            const durationScore = Math.min(100, (duration / 1800000) * 100); // 30 min = 100
            return (durationScore * 0.4) + (engagement * 0.6);
        });

        return average(focusIndicators);
    }

    median(arr) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    calculateVariance(arr) {
        if (arr.length === 0) return 0;
        const avg = average(arr);
        return average(arr.map(x => Math.pow(x - avg, 2)));
    }

    getMasteryLevel(mastery) {
        if (mastery >= 80) return 'expert';
        if (mastery >= 60) return 'advanced';
        if (mastery >= 40) return 'intermediate';
        if (mastery >= 20) return 'beginner';
        return 'novice';
    }

    getEmptyOverview() {
        return {
            totalSessions: 0,
            totalTime: 0,
            totalHours: 0,
            uniqueDays: 0,
            uniqueTopics: 0,
            averageEngagement: 0,
            completionRate: 0,
            avgSessionDuration: 0,
            dailyAverage: 0,
            consistency: 0,
            trend: 'stable'
        };
    }

    // Additional helper methods would be implemented here...
    categorizeTimeBlocks(sessions) { return {}; }
    identifyPeakProductivity(sessions) { return {}; }
    calculateDistractionLevel(sessions) { return 0; }
    analyzeFlowState(sessions) { return {}; }
    generateProductivityRecommendations(efficiency, focusScore) { return []; }
    groupByWeek(sessions) { return []; }
    calculateVelocityTrend(weeklyData) { return 0; }
    calculateCurrentVelocity(sessions) { return 0; }
    calculateAcceleration(weeklyData) { return 0; }
    calculateTopicAcquisitionRate(sessions) { return 0; }
    compareVelocity(sessions, days) { return 0; }
    projectFutureVelocity(weeklyData) { return {}; }
    calculateProgression(sessions) { return 0; }
    generateMasteryRecommendations(masteryLevels) { return []; }
    identifyLearningStyle(sessions) { return 'visual'; }
    analyzeStudyHabits(sessions) { return {}; }
    analyzeSessionPatterns(sessions) { return {}; }
    analyzeBreakPatterns(sessions) { return {}; }
    analyzeTopicSwitching(sessions) { return {}; }
    identifyPeakTimes(sessions) { return []; }
    analyzeMotivation(sessions) { return {}; }
    identifyProcrastination(sessions) { return []; }
    groupByCategory(sessions) { return {}; }
    groupByHour(sessions) { return []; }
    groupByDayOfWeek(sessions) { return []; }
    groupByTimeOfDay(sessions) { return {}; }
    prepareTimeDistributionVisuals(sessions) { return {}; }
    calculateSessionFocusScore(session) { return session.engagementScore || 0; }
    calculateAverageFocusDuration(sessions) { return 0; }
    calculateDistractionRate(sessions) { return 0; }
    calculateFocusTrend(sessions) { return 0; }
    generateFocusRecommendations(metrics) { return []; }
    calculateCategoryLevel(totalTime, avgEngagement) { return 'beginner'; }
    assessCategoryStrength(sessions) { return 'moderate'; }
    suggestNextSteps(category, topics, sessions) { return []; }
    buildEngagementCurve(sessions) { return []; }
    buildEfficiencyCurve(sessions) { return []; }
    buildComplexityCurve(sessions) { return []; }
    identifyInflectionPoints(curves) { return []; }
    identifyPlateaus(curves) { return []; }
    identifyGrowthPhases(curves) { return []; }
    predictFutureCurve(curves) { return {}; }
    identifyBestLearningTime(sessions) { return '10:00 AM'; }
    assessBurnoutRisk(sessions) { return 0; }
    calculateAverageMasteryProgress(topics, sessions) { return 0; }
    calculateTimeCorrelation(sessions) { return 0; }
    calculateLengthCorrelation(sessions) { return 0; }
    calculateFamiliarityCorrelation(sessions) { return 0; }
}

export default LearningAnalytics;
