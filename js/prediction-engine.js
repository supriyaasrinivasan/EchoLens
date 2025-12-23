// Prediction Engine - AI-Powered Learning Predictions
// Provides predictive analytics for learning patterns and future recommendations

export class PredictionEngine {
    constructor() {
        this.modelConfig = {
            learningRateDecay: 0.95,
            momentumFactor: 0.9,
            predictionHorizon: 14, // days
            minDataPoints: 7,
            confidenceThreshold: 0.7
        };

        this.patterns = {
            weekly: [],
            daily: [],
            hourly: []
        };
    }

    /**
     * Generate comprehensive predictions for user's learning journey
     * @param {Object} historicalData - Past learning sessions and analytics
     * @returns {Object} Predictions with confidence scores
     */
    async generatePredictions(historicalData) {
        const { sessions, topics, dailySummaries } = historicalData;

        if (sessions.length < this.modelConfig.minDataPoints) {
            return this.getDefaultPredictions();
        }

        return {
            learningTime: this.predictLearningTime(sessions, dailySummaries),
            topicProgression: this.predictTopicProgression(topics, sessions),
            engagementTrends: this.predictEngagementTrends(sessions),
            skillMastery: this.predictSkillMastery(topics, sessions),
            burnoutRisk: this.analyzeBurnoutRisk(sessions, dailySummaries),
            optimalSchedule: this.predictOptimalSchedule(sessions),
            nextTopics: this.predictNextTopics(topics, sessions),
            performanceMetrics: this.predictPerformance(sessions)
        };
    }

    /**
     * Predict future learning time using exponential smoothing
     * @param {Array} sessions - Historical sessions
     * @param {Array} dailySummaries - Daily aggregated data
     * @returns {Object} Time predictions
     */
    predictLearningTime(sessions, dailySummaries) {
        const last30Days = this.getLast30Days(sessions);
        const timeSeriesData = this.aggregateDailyTime(last30Days);

        // Apply exponential smoothing for trend analysis
        const smoothed = this.exponentialSmoothing(timeSeriesData, 0.3);
        const trend = this.calculateTrend(smoothed);

        // Predict next 7 days
        const predictions = [];
        let lastValue = smoothed[smoothed.length - 1] || 0;

        for (let i = 1; i <= 7; i++) {
            lastValue = lastValue + trend;
            predictions.push({
                day: i,
                predictedMinutes: Math.max(0, Math.round(lastValue)),
                confidence: this.calculateConfidence(timeSeriesData, i)
            });
        }

        return {
            weeklyPrediction: predictions,
            averageDailyTime: this.average(timeSeriesData),
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            trendStrength: Math.abs(trend),
            confidence: this.average(predictions.map(p => p.confidence))
        };
    }

    /**
     * Predict topic progression and mastery timeline
     * @param {Array} topics - Current topics
     * @param {Array} sessions - Historical sessions
     * @returns {Object} Topic progression predictions
     */
    predictTopicProgression(topics, sessions) {
        const topicAnalysis = topics.map(topic => {
            const topicSessions = sessions.filter(s => 
                (s.topics || []).includes(topic.name)
            );

            if (topicSessions.length === 0) {
                return null;
            }

            const totalTime = topicSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const avgEngagement = this.average(topicSessions.map(s => s.engagementScore || 0));
            const recentTrend = this.calculateRecentTrend(topicSessions);

            // Calculate mastery score (0-100)
            const masteryScore = this.calculateMasteryScore({
                totalTime,
                sessionCount: topicSessions.length,
                avgEngagement,
                consistency: this.calculateConsistency(topicSessions)
            });

            // Predict time to mastery (assuming 80% mastery target)
            const timeToMastery = this.predictTimeToMastery(masteryScore, recentTrend);

            return {
                topic: topic.name,
                currentMastery: Math.round(masteryScore),
                predictedMasteryDate: this.addDays(new Date(), timeToMastery),
                daysToMastery: timeToMastery,
                recommendedWeeklyHours: this.calculateRecommendedHours(masteryScore, timeToMastery),
                trend: recentTrend > 0 ? 'improving' : recentTrend < 0 ? 'declining' : 'stable',
                confidence: this.calculateTopicConfidence(topicSessions)
            };
        }).filter(Boolean);

        return {
            topics: topicAnalysis.sort((a, b) => b.currentMastery - a.currentMastery),
            overallProgress: this.average(topicAnalysis.map(t => t.currentMastery)),
            fastestProgressing: topicAnalysis.sort((a, b) => b.trend.localeCompare(a.trend))[0],
            needsAttention: topicAnalysis.filter(t => t.trend === 'declining')
        };
    }

    /**
     * Predict engagement trends using linear regression
     * @param {Array} sessions - Historical sessions
     * @returns {Object} Engagement predictions
     */
    predictEngagementTrends(sessions) {
        const last30Sessions = sessions.slice(-30);
        const engagementData = last30Sessions.map((s, i) => ({
            x: i,
            y: s.engagementScore || 0
        }));

        const regression = this.linearRegression(engagementData);
        
        // Predict next 10 sessions
        const predictions = [];
        for (let i = 1; i <= 10; i++) {
            const predicted = regression.slope * (last30Sessions.length + i) + regression.intercept;
            predictions.push({
                session: i,
                predictedEngagement: Math.min(100, Math.max(0, Math.round(predicted))),
                confidence: this.calculateRegressionConfidence(regression, engagementData)
            });
        }

        return {
            predictions,
            currentTrend: regression.slope > 0 ? 'improving' : regression.slope < 0 ? 'declining' : 'stable',
            trendStrength: Math.abs(regression.slope),
            averageEngagement: this.average(engagementData.map(d => d.y)),
            rSquared: this.calculateRSquared(engagementData, regression)
        };
    }

    /**
     * Predict skill mastery using exponential growth model
     * @param {Array} topics - Current topics
     * @param {Array} sessions - Historical sessions
     * @returns {Object} Skill mastery predictions
     */
    predictSkillMastery(topics, sessions) {
        const skillCategories = this.groupByCategory(topics, sessions);
        
        const predictions = Object.entries(skillCategories).map(([category, data]) => {
            const growthRate = this.calculateGrowthRate(data.sessions);
            const currentLevel = this.calculateSkillLevel(data);
            
            // Exponential growth model: skill(t) = skill(0) * e^(growth_rate * t)
            const targetLevel = 100;
            const timeToMaster = currentLevel >= targetLevel ? 0 :
                Math.log(targetLevel / currentLevel) / (growthRate || 0.01);

            return {
                category,
                currentLevel: Math.round(currentLevel),
                growthRate: growthRate.toFixed(3),
                predictedMasteryDate: this.addDays(new Date(), Math.ceil(timeToMaster)),
                milestones: this.generateMilestones(currentLevel, targetLevel, growthRate),
                confidence: this.calculateSkillConfidence(data.sessions)
            };
        });

        return {
            skills: predictions.sort((a, b) => b.currentLevel - a.currentLevel),
            overallSkillLevel: this.average(predictions.map(p => p.currentLevel)),
            fastestGrowing: predictions.sort((a, b) => b.growthRate - a.growthRate)[0],
            recommendations: this.generateSkillRecommendations(predictions)
        };
    }

    /**
     * Analyze burnout risk using multiple indicators
     * @param {Array} sessions - Historical sessions
     * @param {Array} dailySummaries - Daily summaries
     * @returns {Object} Burnout risk analysis
     */
    analyzeBurnoutRisk(sessions, dailySummaries) {
        const last14Days = this.getLast14Days(sessions);
        
        // Calculate burnout indicators
        const indicators = {
            overwork: this.calculateOverworkScore(last14Days),
            consistency: this.calculateConsistencyScore(last14Days),
            engagement: this.calculateEngagementScore(last14Days),
            recovery: this.calculateRecoveryScore(last14Days, dailySummaries),
            variety: this.calculateVarietyScore(last14Days)
        };

        // Weighted burnout risk (0-100, higher = more risk)
        const riskScore = (
            indicators.overwork * 0.3 +
            (100 - indicators.consistency) * 0.2 +
            (100 - indicators.engagement) * 0.3 +
            (100 - indicators.recovery) * 0.1 +
            (100 - indicators.variety) * 0.1
        );

        const riskLevel = riskScore > 70 ? 'high' : riskScore > 40 ? 'moderate' : 'low';

        return {
            riskScore: Math.round(riskScore),
            riskLevel,
            indicators,
            recommendations: this.generateBurnoutRecommendations(riskScore, indicators),
            healthyPaceAdvice: this.generateHealthyPaceAdvice(indicators),
            warningSignals: this.identifyWarningSignals(indicators)
        };
    }

    /**
     * Predict optimal learning schedule using historical performance
     * @param {Array} sessions - Historical sessions
     * @returns {Object} Optimal schedule predictions
     */
    predictOptimalSchedule(sessions) {
        const hourlyPerformance = this.analyzeHourlyPerformance(sessions);
        const dailyPerformance = this.analyzeDailyPerformance(sessions);
        const sessionLengthAnalysis = this.analyzeSessionLength(sessions);

        return {
            bestHours: hourlyPerformance.slice(0, 3),
            bestDays: dailyPerformance.slice(0, 3),
            optimalSessionLength: sessionLengthAnalysis.optimal,
            recommendedBreaks: this.calculateOptimalBreaks(sessions),
            weeklySchedule: this.generateWeeklySchedule(hourlyPerformance, dailyPerformance),
            personalizedTips: this.generateScheduleTips(hourlyPerformance, dailyPerformance)
        };
    }

    /**
     * Predict next topics based on learning path
     * @param {Array} topics - Current topics
     * @param {Array} sessions - Historical sessions
     * @returns {Object} Next topic predictions
     */
    predictNextTopics(topics, sessions) {
        const recentTopics = this.getRecentTopics(sessions, 10);
        const topicGraph = this.buildTopicGraph(sessions);
        const skillGaps = this.identifySkillGaps(topics, sessions);

        return {
            immediate: this.predictImmediateTopics(recentTopics, topicGraph),
            shortTerm: this.predictShortTermTopics(topics, skillGaps),
            longTerm: this.predictLongTermTopics(topics, sessions),
            prerequisites: this.identifyPrerequisites(topics, topicGraph),
            learningPath: this.generateLearningPath(topics, topicGraph, skillGaps)
        };
    }

    /**
     * Predict overall performance metrics
     * @param {Array} sessions - Historical sessions
     * @returns {Object} Performance predictions
     */
    predictPerformance(sessions) {
        const recentSessions = sessions.slice(-20);
        const performanceMetrics = this.calculatePerformanceMetrics(recentSessions);

        return {
            currentPerformance: performanceMetrics.current,
            predictedPerformance: performanceMetrics.predicted,
            improvementRate: performanceMetrics.improvementRate,
            strengthAreas: performanceMetrics.strengths,
            weaknessAreas: performanceMetrics.weaknesses,
            actionableInsights: this.generatePerformanceInsights(performanceMetrics)
        };
    }

    // ============ Utility Functions ============

    exponentialSmoothing(data, alpha) {
        if (data.length === 0) return [];
        
        const smoothed = [data[0]];
        for (let i = 1; i < data.length; i++) {
            smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
        }
        return smoothed;
    }

    linearRegression(data) {
        const n = data.length;
        if (n === 0) return { slope: 0, intercept: 0 };

        const sumX = data.reduce((sum, d) => sum + d.x, 0);
        const sumY = data.reduce((sum, d) => sum + d.y, 0);
        const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
        const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope: slope || 0, intercept: intercept || 0 };
    }

    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const recent = data.slice(-5);
        const older = data.slice(-10, -5);
        
        const recentAvg = this.average(recent);
        const olderAvg = this.average(older);
        
        return recentAvg - olderAvg;
    }

    calculateConfidence(data, horizon) {
        const baseConfidence = 0.9;
        const decayRate = 0.1;
        const variance = this.calculateVariance(data);
        
        const confidenceLoss = decayRate * horizon + variance / 100;
        return Math.max(0.3, baseConfidence - confidenceLoss);
    }

    calculateMasteryScore(metrics) {
        const { totalTime, sessionCount, avgEngagement, consistency } = metrics;
        
        // Normalize factors (0-100)
        const timeScore = Math.min(100, (totalTime / 1000) * 100 / 3600); // 1 hour = ~17 points
        const sessionScore = Math.min(100, sessionCount * 5); // 20 sessions = 100
        const engagementScore = avgEngagement;
        const consistencyScore = consistency * 100;

        // Weighted average
        return (
            timeScore * 0.3 +
            sessionScore * 0.2 +
            engagementScore * 0.3 +
            consistencyScore * 0.2
        );
    }

    predictTimeToMastery(currentMastery, trend) {
        if (currentMastery >= 80) return 0;
        if (trend <= 0) return 90; // 90 days if no progress

        const remainingPoints = 80 - currentMastery;
        const daysNeeded = remainingPoints / (trend * 7); // trend per week
        
        return Math.ceil(Math.min(365, Math.max(7, daysNeeded)));
    }

    calculateRecommendedHours(mastery, daysToMastery) {
        if (mastery >= 80) return 1; // Maintenance
        
        const hoursPerDay = Math.max(0.5, (100 - mastery) / daysToMastery / 10);
        return Math.round(hoursPerDay * 7 * 10) / 10; // Weekly hours, 1 decimal
    }

    calculateRSquared(data, regression) {
        if (data.length === 0) return 0;

        const yMean = this.average(data.map(d => d.y));
        const ssTotal = data.reduce((sum, d) => sum + Math.pow(d.y - yMean, 2), 0);
        const ssResidual = data.reduce((sum, d) => {
            const predicted = regression.slope * d.x + regression.intercept;
            return sum + Math.pow(d.y - predicted, 2);
        }, 0);

        return 1 - (ssResidual / (ssTotal || 1));
    }

    average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }

    calculateVariance(data) {
        if (data.length === 0) return 0;
        const avg = this.average(data);
        return this.average(data.map(x => Math.pow(x - avg, 2)));
    }

    getLast30Days(sessions) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return sessions.filter(s => new Date(s.timestamp) >= cutoff);
    }

    getLast14Days(sessions) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);
        return sessions.filter(s => new Date(s.timestamp) >= cutoff);
    }

    aggregateDailyTime(sessions) {
        const dailyMap = new Map();
        
        sessions.forEach(session => {
            const date = new Date(session.timestamp).toDateString();
            const current = dailyMap.get(date) || 0;
            dailyMap.set(date, current + (session.duration || 0) / 60000); // Convert to minutes
        });

        return Array.from(dailyMap.values());
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    groupByCategory(topics, sessions) {
        const categories = {};
        
        topics.forEach(topic => {
            const category = topic.category || 'Other';
            if (!categories[category]) {
                categories[category] = { topics: [], sessions: [] };
            }
            categories[category].topics.push(topic);
        });

        sessions.forEach(session => {
            const category = session.category || 'Other';
            if (categories[category]) {
                categories[category].sessions.push(session);
            }
        });

        return categories;
    }

    calculateGrowthRate(sessions) {
        if (sessions.length < 2) return 0;
        
        const sorted = sessions.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        const early = sorted.slice(0, Math.ceil(sorted.length / 2));
        const recent = sorted.slice(Math.ceil(sorted.length / 2));

        const earlyEngagement = this.average(early.map(s => s.engagementScore || 0));
        const recentEngagement = this.average(recent.map(s => s.engagementScore || 0));

        return (recentEngagement - earlyEngagement) / (early.length || 1);
    }

    calculateSkillLevel(data) {
        const { topics, sessions } = data;
        
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgEngagement = this.average(sessions.map(s => s.engagementScore || 0));
        const topicCoverage = topics.length * 10; // 10 points per topic
        
        return Math.min(100, (totalTime / 360000) * 30 + avgEngagement * 0.5 + topicCoverage * 0.2);
    }

    generateMilestones(current, target, growthRate) {
        const milestones = [];
        const steps = [25, 50, 75, 90, 100];
        
        steps.forEach(step => {
            if (step > current) {
                const daysToReach = (step - current) / (growthRate * 7);
                milestones.push({
                    level: step,
                    daysToReach: Math.ceil(daysToReach),
                    estimatedDate: this.addDays(new Date(), Math.ceil(daysToReach))
                });
            }
        });

        return milestones;
    }

    calculateConsistency(sessions) {
        if (sessions.length < 2) return 0;
        
        const sorted = sessions.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        const intervals = [];
        for (let i = 1; i < sorted.length; i++) {
            const interval = (new Date(sorted[i].timestamp) - new Date(sorted[i-1].timestamp)) / 86400000; // days
            intervals.push(interval);
        }

        const avgInterval = this.average(intervals);
        const variance = this.calculateVariance(intervals);
        
        // Lower variance = higher consistency
        return Math.max(0, 1 - (variance / (avgInterval * avgInterval)));
    }

    getDefaultPredictions() {
        return {
            message: 'Insufficient data for predictions. Continue learning to unlock predictions!',
            minimumSessions: this.modelConfig.minDataPoints,
            currentSessions: 0
        };
    }

    analyzeHourlyPerformance(sessions) {
        const hourlyData = new Array(24).fill(0).map((_, hour) => ({
            hour,
            sessions: [],
            avgEngagement: 0,
            totalTime: 0
        }));

        sessions.forEach(session => {
            const hour = new Date(session.timestamp).getHours();
            hourlyData[hour].sessions.push(session);
            hourlyData[hour].totalTime += session.duration || 0;
        });

        hourlyData.forEach(data => {
            if (data.sessions.length > 0) {
                data.avgEngagement = this.average(data.sessions.map(s => s.engagementScore || 0));
            }
        });

        return hourlyData
            .filter(d => d.sessions.length > 0)
            .sort((a, b) => b.avgEngagement - a.avgEngagement);
    }

    analyzeDailyPerformance(sessions) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dailyData = days.map((day, index) => ({
            day,
            dayIndex: index,
            sessions: [],
            avgEngagement: 0
        }));

        sessions.forEach(session => {
            const dayIndex = new Date(session.timestamp).getDay();
            dailyData[dayIndex].sessions.push(session);
        });

        dailyData.forEach(data => {
            if (data.sessions.length > 0) {
                data.avgEngagement = this.average(data.sessions.map(s => s.engagementScore || 0));
            }
        });

        return dailyData
            .filter(d => d.sessions.length > 0)
            .sort((a, b) => b.avgEngagement - a.avgEngagement);
    }

    analyzeSessionLength(sessions) {
        const durations = sessions.map(s => (s.duration || 0) / 60000); // minutes
        const avgDuration = this.average(durations);
        
        return {
            optimal: Math.round(avgDuration),
            range: { min: Math.round(avgDuration * 0.7), max: Math.round(avgDuration * 1.3) }
        };
    }

    calculateOptimalBreaks(sessions) {
        const avgSessionLength = this.average(sessions.map(s => (s.duration || 0) / 60000));
        
        if (avgSessionLength < 30) {
            return { frequency: 'Every 25 minutes', duration: '5 minutes' };
        } else if (avgSessionLength < 60) {
            return { frequency: 'Every 45 minutes', duration: '10 minutes' };
        } else {
            return { frequency: 'Every 60 minutes', duration: '15 minutes' };
        }
    }

    // Additional helper methods for various calculations...
    calculateOverworkScore(sessions) {
        const dailyTime = this.aggregateDailyTime(sessions);
        const avgDaily = this.average(dailyTime);
        return Math.min(100, (avgDaily / 180) * 100); // 3 hours = 100 score
    }

    calculateConsistencyScore(sessions) {
        return this.calculateConsistency(sessions) * 100;
    }

    calculateEngagementScore(sessions) {
        return this.average(sessions.map(s => s.engagementScore || 0));
    }

    calculateRecoveryScore(sessions, dailySummaries) {
        // Placeholder - would analyze rest days
        return 70;
    }

    calculateVarietyScore(sessions) {
        const uniqueTopics = new Set(sessions.flatMap(s => s.topics || []));
        return Math.min(100, uniqueTopics.size * 10);
    }

    generateBurnoutRecommendations(riskScore, indicators) {
        const recommendations = [];
        
        if (indicators.overwork > 70) {
            recommendations.push('Reduce daily learning time by 20-30%');
        }
        if (indicators.engagement < 50) {
            recommendations.push('Try new learning formats or topics');
        }
        if (indicators.variety < 40) {
            recommendations.push('Explore related topics for variety');
        }
        
        return recommendations;
    }

    generateHealthyPaceAdvice(indicators) {
        return {
            idealDailyHours: Math.max(1, Math.min(3, 150 / indicators.overwork)),
            restDaysPerWeek: indicators.recovery < 50 ? 2 : 1,
            varietyTarget: Math.max(3, 5 - Math.floor(indicators.variety / 20))
        };
    }

    identifyWarningSignals(indicators) {
        const signals = [];
        
        if (indicators.engagement < 40) signals.push('Low engagement detected');
        if (indicators.overwork > 80) signals.push('Excessive learning hours');
        if (indicators.consistency < 30) signals.push('Inconsistent learning pattern');
        
        return signals;
    }

    generateWeeklySchedule(hourlyPerf, dailyPerf) {
        return dailyPerf.slice(0, 5).map(day => ({
            day: day.day,
            recommendedHours: hourlyPerf.slice(0, 2).map(h => h.hour),
            estimatedEngagement: day.avgEngagement
        }));
    }

    generateScheduleTips(hourlyPerf, dailyPerf) {
        return [
            `Your peak performance is at ${hourlyPerf[0].hour}:00`,
            `${dailyPerf[0].day} is your most productive day`,
            'Consider scheduling challenging topics during peak hours'
        ];
    }

    getRecentTopics(sessions, count) {
        return sessions
            .slice(-count)
            .flatMap(s => s.topics || [])
            .filter((t, i, arr) => arr.indexOf(t) === i);
    }

    buildTopicGraph(sessions) {
        // Build relationships between topics
        const graph = new Map();
        sessions.forEach(session => {
            const topics = session.topics || [];
            topics.forEach((topic, i) => {
                if (!graph.has(topic)) graph.set(topic, new Set());
                topics.forEach((other, j) => {
                    if (i !== j) graph.get(topic).add(other);
                });
            });
        });
        return graph;
    }

    identifySkillGaps(topics, sessions) {
        // Placeholder for skill gap analysis
        return [];
    }

    predictImmediateTopics(recentTopics, topicGraph) {
        // Recommend topics related to recent ones
        const related = new Set();
        recentTopics.forEach(topic => {
            const connections = topicGraph.get(topic) || new Set();
            connections.forEach(t => related.add(t));
        });
        return Array.from(related).slice(0, 5);
    }

    predictShortTermTopics(topics, skillGaps) {
        return topics.slice(0, 3).map(t => t.name);
    }

    predictLongTermTopics(topics, sessions) {
        return ['Advanced topics based on current learning path'];
    }

    identifyPrerequisites(topics, topicGraph) {
        return [];
    }

    generateLearningPath(topics, topicGraph, skillGaps) {
        return topics.slice(0, 5).map((t, i) => ({
            step: i + 1,
            topic: t.name,
            estimatedWeeks: Math.ceil((100 - (t.totalTime || 0) / 36000) / 4)
        }));
    }

    calculatePerformanceMetrics(sessions) {
        const current = this.average(sessions.slice(-5).map(s => s.engagementScore || 0));
        const previous = this.average(sessions.slice(-10, -5).map(s => s.engagementScore || 0));
        
        return {
            current,
            predicted: current + (current - previous),
            improvementRate: current - previous,
            strengths: ['Consistent learning'],
            weaknesses: ['Could increase variety']
        };
    }

    generatePerformanceInsights(metrics) {
        return [
            `Your performance is ${metrics.current > 70 ? 'excellent' : metrics.current > 50 ? 'good' : 'needs improvement'}`,
            `Improvement rate: ${metrics.improvementRate > 0 ? '+' : ''}${metrics.improvementRate.toFixed(1)}%`
        ];
    }

    calculateTopicConfidence(sessions) {
        return Math.min(0.95, 0.5 + (sessions.length / 20) * 0.45);
    }

    calculateRegressionConfidence(regression, data) {
        const rSquared = this.calculateRSquared(data, regression);
        return Math.max(0.3, Math.min(0.95, rSquared));
    }

    calculateSkillConfidence(sessions) {
        return Math.min(0.9, 0.4 + (sessions.length / 15) * 0.5);
    }

    calculateRecentTrend(sessions) {
        if (sessions.length < 2) return 0;
        
        const recent = sessions.slice(-5);
        const older = sessions.slice(-10, -5);
        
        const recentEng = this.average(recent.map(s => s.engagementScore || 0));
        const olderEng = this.average(older.map(s => s.engagementScore || 0));
        
        return recentEng - olderEng;
    }

    generateSkillRecommendations(predictions) {
        return predictions
            .filter(p => p.currentLevel < 70)
            .slice(0, 3)
            .map(p => `Focus on ${p.category} to reach mastery faster`);
    }
}

export default PredictionEngine;
