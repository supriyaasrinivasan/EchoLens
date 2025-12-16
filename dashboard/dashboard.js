

import { StorageManager } from '../js/storage.js';
import { AnalyticsEngine } from '../js/analytics.js';
import { RecommendationEngine } from '../js/recommendations.js';
import { D3Visualizations } from '../js/d3-viz.js';
import { formatTime, formatDate, getCategoryColor, getCategoryIcon, getRelativeTime } from '../js/utils.js';
import CONFIG, { BackendConnection } from '../js/config.js';

class DashboardController {
    constructor() {
        this.storage = new StorageManager();
        this.analytics = new AnalyticsEngine();
        this.recommendations = new RecommendationEngine();
        this.d3viz = new D3Visualizations();
        this.backend = new BackendConnection();
        
        this.currentTimeRange = 'week';
        this.charts = {};
        
        // History filters state
        this.historyFilters = {
            category: '',
            date: '',
            page: 1,
            pageSize: 15,
            sortBy: 'timestamp',
            sortOrder: 'desc',
            searchQuery: ''
        };

        // AI Analysis state
        this.aiAnalysisLoading = false;
        this.aiInsights = null;

        // Export settings
        this.selectedExportRange = 'all';
        
        this.init();
    }

    async init() {
        await this.storage.ensureInitialized();
        
        this.initTheme();
        this.setupNavigation();
        this.setupEventListeners();
        this.setupBackendConnection();
        
        await this.loadDashboard();
        
        this.handleHashChange();
        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    initTheme() {
        const savedTheme = localStorage.getItem('supriai-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }

        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('supriai-theme', newTheme);
            
            this.updateChartsTheme();
        });
    }

    updateChartsTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f1f5f9' : '#1e293b';
        const gridColor = isDark ? '#334155' : '#e2e8f0';
        
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) scale.ticks.color = textColor;
                        if (scale.grid) scale.grid.color = gridColor;
                    });
                }
                if (chart.options.plugins?.legend?.labels) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                chart.update();
            }
        });
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
                
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                
                window.location.hash = section;
            });
        });
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1) || 'overview';
        this.showSection(hash);
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === hash);
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        const titles = {
            'overview': { title: 'Overview', subtitle: 'Your learning journey at a glance' },
            'analytics': { title: 'Analytics', subtitle: 'Deep dive into your learning patterns' },
            'topics': { title: 'Topics', subtitle: 'All the subjects you\'ve explored' },
            'skills': { title: 'Skills', subtitle: 'Track your skill progression' },
            'recommendations': { title: 'Recommendations', subtitle: 'AI-powered learning suggestions' },
            'history': { title: 'History', subtitle: 'Your complete learning timeline' },
            'settings': { title: 'Settings', subtitle: 'Customize your experience' }
        };
        
        const headerInfo = titles[sectionId] || { title: 'Dashboard', subtitle: '' };
        const sectionTitleEl = document.getElementById('sectionTitle');
        const headerSubtitleEl = document.getElementById('headerSubtitle');
        if (sectionTitleEl) sectionTitleEl.textContent = headerInfo.title;
        if (headerSubtitleEl) headerSubtitleEl.textContent = headerInfo.subtitle;
    }

    setupEventListeners() {
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTimeRange = btn.dataset.range;
                this.loadDashboard();
            });
        });

        document.getElementById('syncBtn').addEventListener('click', () => this.syncWithBackend());

        document.getElementById('backendToggle')?.addEventListener('change', (e) => {
            chrome.storage.local.set({ backendEnabled: e.target.checked });
            if (e.target.checked) {
                this.backend.startHealthChecks();
            } else {
                this.backend.stopHealthChecks();
            }
        });

        document.getElementById('backendUrl')?.addEventListener('change', (e) => {
            chrome.storage.local.set({ backendUrl: e.target.value });
            this.backend.baseUrl = e.target.value;
        });

        document.getElementById('testBackendBtn')?.addEventListener('click', () => this.testBackendConnection());

        document.getElementById('autoSyncToggle')?.addEventListener('change', (e) => {
            chrome.storage.local.set({ autoSync: e.target.checked });
            if (e.target.checked) {
                this.startAutoSync();
            } else {
                this.stopAutoSync();
            }
        });

        document.getElementById('trackingToggle').addEventListener('change', (e) => {
            chrome.storage.local.set({ trackingEnabled: e.target.checked });
        });

        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearData());

        document.getElementById('refreshRecs')?.addEventListener('click', () => this.loadRecommendations());

        document.getElementById('pathSelector')?.addEventListener('change', (e) => {
            this.renderSkillTree(e.target.value);
        });

        document.getElementById('topicSearch')?.addEventListener('input', (e) => {
            this.filterTopics(e.target.value);
        });

        // History filter event listeners
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.historyFilters.category = e.target.value;
            this.historyFilters.page = 1;
            this.loadHistory();
        });

        document.getElementById('dateFilter')?.addEventListener('change', (e) => {
            this.historyFilters.date = e.target.value;
            this.historyFilters.page = 1;
            this.loadHistory();
        });

        document.getElementById('clearFilters')?.addEventListener('click', () => {
            this.clearHistoryFilters();
        });

        // DataTable search listener
        document.getElementById('historySearch')?.addEventListener('input', this.debounce((e) => {
            this.historyFilters.searchQuery = e.target.value;
            this.historyFilters.page = 1;
            this.loadHistory();
        }, 300));

        // DataTable sort listeners
        document.querySelectorAll('.datatable th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const sortBy = th.dataset.sort;
                if (this.historyFilters.sortBy === sortBy) {
                    this.historyFilters.sortOrder = this.historyFilters.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.historyFilters.sortBy = sortBy;
                    this.historyFilters.sortOrder = 'desc';
                }
                this.loadHistory();
            });
        });

        // Page size selector
        document.getElementById('pageSizeSelect')?.addEventListener('change', (e) => {
            this.historyFilters.pageSize = parseInt(e.target.value);
            this.historyFilters.page = 1;
            this.loadHistory();
        });

        // Pagination navigation buttons
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.historyFilters.page > 1) {
                this.historyFilters.page--;
                this.loadHistory();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            this.historyFilters.page++;
            this.loadHistory();
        });

        // AI Analyze button
        document.getElementById('analyzeHistoryBtn')?.addEventListener('click', () => {
            this.analyzeHistoryWithAI();
        });

        // History PDF download - open modal
        document.getElementById('downloadHistoryPdf')?.addEventListener('click', () => {
            this.openExportModal();
        });

        // Export modal controls
        document.getElementById('closeExportModal')?.addEventListener('click', () => {
            this.closeExportModal();
        });

        document.getElementById('cancelExport')?.addEventListener('click', () => {
            this.closeExportModal();
        });

        // Export option buttons
        document.querySelectorAll('.export-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.export-option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedExportRange = btn.dataset.range;
                // Clear custom dates when preset is selected
                document.getElementById('exportStartDate').value = '';
                document.getElementById('exportEndDate').value = '';
            });
        });

        // Custom date inputs for export
        document.getElementById('exportStartDate')?.addEventListener('change', () => {
            document.querySelectorAll('.export-option-btn').forEach(b => b.classList.remove('active'));
            this.selectedExportRange = 'custom';
        });

        document.getElementById('exportEndDate')?.addEventListener('change', () => {
            document.querySelectorAll('.export-option-btn').forEach(b => b.classList.remove('active'));
            this.selectedExportRange = 'custom';
        });

        // Generate PDF button
        document.getElementById('generatePdf')?.addEventListener('click', () => {
            this.generatePdfReport();
        });

        // Delete history modal
        document.getElementById('deleteHistoryBtn')?.addEventListener('click', () => {
            this.openDeleteModal();
        });

        document.getElementById('closeDeleteModal')?.addEventListener('click', () => {
            this.closeDeleteModal();
        });

        // Delete by time range
        document.querySelectorAll('.delete-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const range = btn.dataset.range;
                this.deleteHistoryByRange(range);
            });
        });

        // Custom date range delete
        document.getElementById('deleteCustomRange')?.addEventListener('click', () => {
            const startDate = document.getElementById('deleteStartDate').value;
            const endDate = document.getElementById('deleteEndDate').value;
            if (startDate && endDate) {
                this.deleteHistoryByDateRange(startDate, endDate);
            }
        });

        // Select all history items
        document.getElementById('selectAllHistory')?.addEventListener('change', (e) => {
            this.toggleSelectAllHistory(e.target.checked);
        });

        // Delete selected items
        document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
            this.deleteSelectedHistory();
        });

        // Recommendation tabs
        document.querySelectorAll('.rec-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.rec-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadRecommendationsByType(tab.dataset.tab);
            });
        });
    }

    async loadDashboard() {
        try {
            let analytics;
            
            if (this.backend.isConnected && CONFIG.BACKEND_ENABLED) {
                console.log('Fetching analytics from backend...');
                const backendData = await this.backend.fetchAnalytics(this.currentTimeRange);
                if (backendData && backendData.success) {
                    analytics = this.mergeBackendAndLocalAnalytics(backendData);
                } else {
                    console.log('Backend fetch failed, using local storage');
                    analytics = await this.analytics.getAnalytics(this.currentTimeRange);
                }
            } else {
                console.log('Using local storage for analytics');
                analytics = await this.analytics.getAnalytics(this.currentTimeRange);
            }
            
            this.updateOverviewStats(analytics);
            
            this.renderTrendChart(analytics.learningTrends);
            this.renderTopicChart(analytics.topicDistribution);
            
            this.loadRecentSessions();
            this.loadQuickRecommendations();
            
            this.renderEngagementChart(analytics.engagementMetrics);
            this.renderHourlyChart(analytics.learningTrends.hourlyDistribution);
            this.renderCategoryChart(analytics.topicDistribution);
            this.renderPatterns(analytics.patterns);
            
            this.renderD3CategoryPie(analytics.topicDistribution);
            this.renderD3Timeline(analytics.learningTrends);
            
            await this.loadTopics();
            
            await this.loadSkills();
            
            await this.loadRecommendations();
            
            await this.loadHistory();
            
            // Load productivity insights (includes streak)
            await this.loadProductivityInsights();
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    mergeBackendAndLocalAnalytics(backendData) {
        const { data, summary } = backendData;
        return {
            overview: {
                totalTime: summary.totalTime || 0,
                totalSessions: summary.totalSessions || 0,
                avgEngagement: summary.avgEngagement || 0,
                uniqueTopics: summary.uniqueTopics || 0,
                uniqueDays: summary.uniqueDays || 0,
                avgSessionDuration: summary.totalSessions > 0 ? summary.totalTime / summary.totalSessions : 0,
                dailyAverage: summary.uniqueDays > 0 ? summary.totalTime / summary.uniqueDays : 0
            },
            topicDistribution: {
                byCategory: this.transformCategoryBreakdown(summary.categoryBreakdown),
                byTopic: data.topics?.slice(0, 10).map(t => ({ name: t.name, time: t.total_time })) || [],
                totalCategories: Object.keys(summary.categoryBreakdown || {}).length,
                totalTopics: data.topics?.length || 0
            },
            learningTrends: this.transformToLearningTrends(data.sessions),
            engagementMetrics: this.calculateEngagementMetrics(data.sessions),
            skillProgress: [],
            patterns: []
        };
    }

    transformCategoryBreakdown(breakdown) {
        if (!breakdown) return [];
        return Object.entries(breakdown).map(([category, stats]) => ({
            category,
            count: stats.count,
            totalTime: stats.time,
            avgEngagement: 0
        })).sort((a, b) => b.totalTime - a.totalTime);
    }

    transformToLearningTrends(sessions) {
        if (!sessions || sessions.length === 0) {
            return {
                daily: [],
                hourlyDistribution: Array(24).fill(0),
                weeklyPattern: Array(7).fill(0)
            };
        }

        const dailyMap = {};
        const hourlyDist = Array(24).fill(0);
        const weeklyPattern = Array(7).fill(0);

        sessions.forEach(session => {
            const date = session.date || new Date(session.created_at).toISOString().split('T')[0];
            if (!dailyMap[date]) {
                dailyMap[date] = { date, totalTime: 0, sessionCount: 0, avgEngagement: 0 };
            }
            dailyMap[date].totalTime += session.duration || 0;
            dailyMap[date].sessionCount += 1;
            dailyMap[date].avgEngagement += session.engagement_score || 0;

            const timestamp = session.timestamp || new Date(session.created_at).getTime();
            const hour = new Date(timestamp).getHours();
            hourlyDist[hour] += session.duration || 0;

            const day = new Date(timestamp).getDay();
            weeklyPattern[day] += session.duration || 0;
        });

        const daily = Object.values(dailyMap).map(d => ({
            ...d,
            avgEngagement: d.sessionCount > 0 ? Math.round(d.avgEngagement / d.sessionCount) : 0
        }));

        return { daily, hourlyDistribution: hourlyDist, weeklyPattern };
    }

    calculateEngagementMetrics(sessions) {
        if (!sessions || sessions.length === 0) {
            return { overall: 0, byCategory: {}, trend: [] };
        }

        const overall = sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / sessions.length;
        const byCategory = {};
        
        sessions.forEach(s => {
            const cat = s.category || 'Other';
            if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
            byCategory[cat].total += s.engagement_score || 0;
            byCategory[cat].count += 1;
        });

        Object.keys(byCategory).forEach(cat => {
            byCategory[cat] = byCategory[cat].total / byCategory[cat].count;
        });

        return { overall: Math.round(overall), byCategory, trend: [] };
    }

    updateOverviewStats(analytics) {
        const { overview } = analytics;
        
        const totalTimeEl = document.getElementById('totalTime');
        const totalTopicsEl = document.getElementById('totalTopics');
        const avgEngagementEl = document.getElementById('avgEngagement');
        const currentStreakEl = document.getElementById('currentStreak');
        
        if (totalTimeEl) totalTimeEl.textContent = formatTime(overview.totalTime);
        if (totalTopicsEl) totalTopicsEl.textContent = overview.uniqueTopics;
        if (avgEngagementEl) avgEngagementEl.textContent = `${overview.avgEngagement}%`;
        // currentStreak will be updated by loadProductivityInsights
    }

    renderTrendChart(trends) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        const labels = trends.daily.map(d => formatDate(d.date, 'short'));
        const timeData = trends.daily.map(d => Math.round(d.totalTime / 60000));
        const engagementData = trends.daily.map(d => d.avgEngagement);

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Time (minutes)',
                        data: timeData,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Engagement %',
                        data: engagementData,
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#94a3b8' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 100,
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    renderTopicChart(distribution) {
        const ctx = document.getElementById('topicChart');
        if (!ctx) return;

        if (this.charts.topic) {
            this.charts.topic.destroy();
        }

        const topTopics = distribution.byTopic.slice(0, 5);
        const labels = topTopics.map(t => t.name);
        const data = topTopics.map(t => Math.round(t.time / 60000));
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

        this.charts.topic = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: '#94a3b8',
                            padding: 12,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    renderEngagementChart(metrics) {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        if (this.charts.engagement) {
            this.charts.engagement.destroy();
        }

        this.charts.engagement = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    data: [metrics.levels.high, metrics.levels.medium, metrics.levels.low],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    renderHourlyChart(hourlyData) {
        const ctx = document.getElementById('hourlyChart');
        if (!ctx) return;

        if (this.charts.hourly) {
            this.charts.hourly.destroy();
        }

        const labels = hourlyData.map((_, i) => `${i}:00`);
        const data = hourlyData.map(h => Math.round(h.time / 60000));

        this.charts.hourly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: '#6366f1',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { 
                            color: '#94a3b8',
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    renderCategoryChart(distribution) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        if (this.charts.category) {
            this.charts.category.destroy();
        }

        const categories = distribution.byCategory;
        const labels = categories.map(c => c.category);
        const timeData = categories.map(c => Math.round(c.totalTime / 60000));
        const engagementData = categories.map(c => c.avgEngagement);

        this.charts.category = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Time (min)',
                        data: timeData,
                        backgroundColor: '#6366f1',
                        borderRadius: 4
                    },
                    {
                        label: 'Engagement',
                        data: engagementData,
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#94a3b8' }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    renderPatterns(patterns) {
        const container = document.getElementById('patternsList');
        if (!container) return;

        const patternIcons = {
            'time_preference': '⏰',
            'session_duration': '⏱️',
            'topic_sequence': '🔀',
            'revisit_pattern': '🔄'
        };

        container.innerHTML = patterns.map(pattern => `
            <div class="pattern-item">
                <span class="pattern-icon">${patternIcons[pattern.type] || '📊'}</span>
                <div class="pattern-title">${this.getPatternTitle(pattern)}</div>
                <div class="pattern-value">${this.getPatternValue(pattern)}</div>
            </div>
        `).join('');
    }

    getPatternTitle(pattern) {
        const titles = {
            'time_preference': 'Peak Learning Time',
            'session_duration': 'Session Style',
            'topic_sequence': 'Learning Flow',
            'revisit_pattern': 'Revisit Behavior'
        };
        return titles[pattern.type] || pattern.type;
    }

    getPatternValue(pattern) {
        switch (pattern.type) {
            case 'time_preference':
                return `Most active in ${pattern.value}`;
            case 'session_duration':
                return `${pattern.avgMinutes} min avg, ${pattern.preference.replace('_', ' ')}`;
            case 'topic_sequence':
                return pattern.sequences?.[0]?.sequence || 'Varied topics';
            case 'revisit_pattern':
                return `${pattern.style.replace('_', ' ')} (${pattern.avgRevisits}x avg)`;
            default:
                return JSON.stringify(pattern.value);
        }
    }

    async loadRecentSessions() {
        const sessions = await this.storage.getSessions({ limit: 5 });
        const container = document.getElementById('recentSessions');
        
        if (!container) return;

        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📚</span>
                    <p>No learning sessions yet. Start browsing educational content!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sessions.map(session => `
            <div class="session-item">
                <div class="session-icon">${getCategoryIcon(session.category)}</div>
                <div class="session-info">
                    <div class="session-title">${this.truncate(session.title, 40)}</div>
                    <div class="session-meta">${session.category || 'General'} • ${getRelativeTime(session.timestamp)}</div>
                </div>
                <div class="session-duration">${formatTime(session.duration)}</div>
            </div>
        `).join('');
    }

    async loadQuickRecommendations() {
        const recs = await this.storage.getRecommendations(3);
        const container = document.getElementById('quickRecommendations');
        
        if (!container) return;

        if (recs.length === 0) {
            container.innerHTML = `
                <div class="recommendation-item">
                    <div class="rec-icon">💡</div>
                    <div class="rec-content">
                        <div class="rec-title">Keep Learning!</div>
                        <div class="rec-description">AI recommendations will appear as you browse more.</div>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = recs.map(rec => `
            <div class="recommendation-item" ${rec.url ? `onclick="window.open('${rec.url}')"` : ''}>
                <div class="rec-icon">${rec.icon || '📖'}</div>
                <div class="rec-content">
                    <div class="rec-title">${rec.title}</div>
                    <div class="rec-description">${rec.description}</div>
                </div>
            </div>
        `).join('');
    }

    async loadTopics() {
        const topics = await this.storage.getTopTopics(20);
        const tbody = document.querySelector('#topicsTable tbody');
        
        if (!tbody) return;

        if (topics.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <span class="empty-icon">📚</span>
                        <p>No topics tracked yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = topics.map(topic => `
            <tr data-topic="${topic.name}">
                <td>
                    <span class="topic-icon">${getCategoryIcon(topic.category)}</span>
                    ${topic.name}
                </td>
                <td>${topic.category || 'General'}</td>
                <td>${formatTime(topic.totalTime)}</td>
                <td>${topic.sessionCount}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${topic.progress || 0}%"></div>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', () => this.showTopicDetails(row.dataset.topic));
        });
    }

    filterTopics(searchTerm) {
        const rows = document.querySelectorAll('#topicsTable tbody tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const topicName = row.dataset.topic?.toLowerCase() || '';
            row.style.display = topicName.includes(term) ? '' : 'none';
        });
    }

    async showTopicDetails(topicName) {
        const topics = await this.storage.getTopTopics(100);
        const topic = topics.find(t => t.name === topicName);
        
        const container = document.getElementById('topicDetails');
        if (!container || !topic) return;

        container.innerHTML = `
            <div class="topic-detail-header">
                <span class="topic-icon-large">${getCategoryIcon(topic.category)}</span>
                <h3>${topic.name}</h3>
            </div>
            <div class="topic-stats">
                <div class="topic-stat">
                    <span class="value">${formatTime(topic.totalTime)}</span>
                    <span class="label">Total Time</span>
                </div>
                <div class="topic-stat">
                    <span class="value">${topic.sessionCount}</span>
                    <span class="label">Sessions</span>
                </div>
                <div class="topic-stat">
                    <span class="value">${Math.round(topic.averageEngagement)}%</span>
                    <span class="label">Avg Engagement</span>
                </div>
            </div>
            <div class="topic-progress-detail">
                <span>Progress: ${Math.round(topic.progress)}%</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${topic.progress}%"></div>
                </div>
            </div>
            <p class="topic-last-studied">Last studied: ${getRelativeTime(topic.lastStudied)}</p>
        `;
    }

    async loadSkills() {
        const skills = await this.storage.getSkills();
        const container = document.getElementById('skillsList');
        
        if (!container) return;

        if (skills.length === 0) {
            container.innerHTML = `
                <div class="skill-card">
                    <div class="skill-icon">🎯</div>
                    <div class="skill-info">
                        <div class="skill-name">Start Building Skills</div>
                        <div class="skill-level">Continue learning to unlock skill tracking</div>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = skills.slice(0, 6).map(skill => `
            <div class="skill-card">
                <div class="skill-icon">${getCategoryIcon(skill.category)}</div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-level">Level ${skill.level} • ${skill.experience} XP</div>
                    <div class="skill-progress">
                        <div class="skill-progress-fill" style="width: ${skill.experience % 100}%"></div>
                    </div>
                </div>
            </div>
        `).join('');

        this.renderSkillTree('Programming');
    }

    renderSkillTree(category) {
        const container = document.getElementById('skillTree');
        if (!container) return;

        const skillTrees = {
            'Programming': [
                { level: 1, skills: ['Variables', 'Control Flow', 'Functions'] },
                { level: 2, skills: ['Data Structures', 'OOP', 'File I/O'] },
                { level: 3, skills: ['Algorithms', 'Design Patterns', 'Testing'] },
                { level: 4, skills: ['Concurrency', 'Databases', 'APIs'] },
                { level: 5, skills: ['System Design', 'Architecture', 'Performance'] }
            ],
            'Web Development': [
                { level: 1, skills: ['HTML Basics', 'CSS Fundamentals', 'JavaScript Intro'] },
                { level: 2, skills: ['Responsive Design', 'CSS Flexbox/Grid', 'DOM Manipulation'] },
                { level: 3, skills: ['React/Vue/Angular', 'State Management', 'API Integration'] },
                { level: 4, skills: ['Testing', 'Performance', 'PWAs'] },
                { level: 5, skills: ['Full Stack', 'DevOps', 'System Design'] }
            ],
            'Data Science': [
                { level: 1, skills: ['Python Basics', 'Statistics', 'Data Types'] },
                { level: 2, skills: ['Pandas', 'NumPy', 'Visualization'] },
                { level: 3, skills: ['ML Basics', 'Scikit-learn', 'Feature Engineering'] },
                { level: 4, skills: ['Deep Learning', 'NLP', 'Computer Vision'] },
                { level: 5, skills: ['MLOps', 'Deployment', 'Research'] }
            ]
        };

        const tree = skillTrees[category] || [];

        container.innerHTML = tree.map(level => `
            <div class="skill-level-row">
                <div class="level-badge">${level.level}</div>
                <div class="level-skills">
                    ${level.skills.map(skill => `
                        <span class="skill-tag">${skill}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    async loadRecommendations() {
        let recs = [];
        
        if (this.backend.isConnected && CONFIG.BACKEND_ENABLED) {
            try {
                console.log('Fetching recommendations from backend...');
                const backendRecs = await this.backend.fetchRecommendations(20);
                if (backendRecs && backendRecs.success && backendRecs.recommendations) {
                    recs = backendRecs.recommendations.map(r => ({
                        title: r.title,
                        description: r.description,
                        url: r.url,
                        type: r.rec_type || r.type,
                        priority: r.priority,
                        difficulty: this.inferDifficulty(r.description),
                        icon: this.getRecommendationIcon(r.rec_type || r.type),
                        score: r.score
                    }));
                    console.log(`Loaded ${recs.length} recommendations from backend`);
                }
            } catch (error) {
                console.error('Failed to fetch backend recommendations:', error);
            }
        }
        
        if (recs.length === 0) {
            console.log('Using local recommendations');
            recs = await this.recommendations.generate();
        }
        
        const container = document.getElementById('fullRecommendations');
        
        if (!container) return;

        if (recs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">💡</span>
                    <p>Keep learning to unlock personalized recommendations!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recs.map(rec => `
            <a href="${rec.url || '#'}" 
               class="recommendation-item" 
               target="_blank" 
               rel="noopener noreferrer"
               ${!rec.url ? 'style="pointer-events: none; opacity: 0.7;"' : ''}>
                <div class="rec-icon">${rec.icon || '📖'}</div>
                <div class="rec-content">
                    <div class="rec-title">
                        ${rec.title}
                        ${rec.url ? '<i class="ri-external-link-line external-link"></i>' : ''}
                    </div>
                    <div class="rec-desc">${rec.description}</div>
                    <div class="rec-meta">
                        <span class="rec-tag">${rec.type || 'Suggestion'}</span>
                        ${rec.difficulty ? `
                            <span class="rec-difficulty">
                                <i class="ri-signal-${rec.difficulty === 'beginner' ? '2' : rec.difficulty === 'intermediate' ? '3' : '4'}-line"></i>
                                ${rec.difficulty}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </a>
        `).join('');

        this.loadWeeklySummary();
        
        this.loadCuratedResources();

        // Load knowledge profile and learning paths
        this.loadKnowledgeProfile();
        this.loadLearningPaths();
    }

    async loadRecommendationsByType(type) {
        const container = document.getElementById('fullRecommendations');
        if (!container) return;

        container.innerHTML = '<div class="loading-state"><i class="ri-loader-4-line spin"></i> Loading recommendations...</div>';

        try {
            const recs = await this.recommendations.getRecommendationsByType(type);
            
            if (recs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">💡</span>
                        <p>No ${type} recommendations available yet. Keep learning!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = recs.map(rec => `
                <a href="${rec.url || '#'}" 
                   class="recommendation-item ${rec.type}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   ${!rec.url ? 'style="cursor: default;"' : ''}>
                    <div class="rec-icon">${rec.icon || '📖'}</div>
                    <div class="rec-content">
                        <div class="rec-title">
                            ${rec.title}
                            ${rec.url ? '<i class="ri-external-link-line external-link"></i>' : ''}
                        </div>
                        <div class="rec-desc">${rec.description}</div>
                        ${rec.reason ? `<div class="rec-reason"><i class="ri-information-line"></i> ${rec.reason}</div>` : ''}
                        <div class="rec-meta">
                            <span class="rec-tag ${rec.type}">${rec.type || 'Suggestion'}</span>
                            ${rec.category ? `<span class="rec-category">${rec.category}</span>` : ''}
                            ${rec.currentLevel ? `<span class="rec-level">${rec.currentLevel}</span>` : ''}
                        </div>
                    </div>
                </a>
            `).join('');
        } catch (error) {
            console.error('Error loading recommendations by type:', error);
            container.innerHTML = `
                <div class="error-state">
                    <span class="error-icon">⚠️</span>
                    <p>Failed to load recommendations. Please try again.</p>
                </div>
            `;
        }
    }

    async loadKnowledgeProfile() {
        const container = document.getElementById('knowledgeAreas');
        const levelBadge = document.getElementById('overallKnowledgeLevel');
        
        if (!container) return;

        try {
            const profile = await this.storage.getKnowledgeProfile();

            // Update overall level badge
            if (levelBadge) {
                levelBadge.textContent = profile.overallLevel;
                levelBadge.className = `knowledge-badge ${profile.overallLevel.toLowerCase()}`;
            }

            if (profile.areas.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">📊</span>
                        <p>Start learning to build your knowledge profile!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = profile.areas.map(area => {
                const levelColors = {
                    'Novice': 'var(--text-tertiary)',
                    'Beginner': 'var(--info)',
                    'Intermediate': 'var(--warning)',
                    'Advanced': 'var(--success)',
                    'Expert': 'var(--accent-primary)'
                };
                const color = levelColors[area.level] || 'var(--accent-primary)';
                
                return `
                    <div class="knowledge-area-item">
                        <div class="knowledge-area-header">
                            <span class="knowledge-area-name">
                                ${getCategoryIcon(area.category)} ${area.category}
                            </span>
                            <span class="knowledge-area-level" style="background: ${color}20; color: ${color}">
                                ${area.level}
                            </span>
                        </div>
                        <div class="knowledge-progress">
                            <div class="knowledge-progress-bar" style="width: ${area.progressScore}%; background: ${color}"></div>
                        </div>
                        <div class="knowledge-stats">
                            <span>${area.sessions} sessions</span>
                            <span>${this.formatDuration(area.totalTime)}</span>
                            <span>${area.topics} topics</span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading knowledge profile:', error);
        }
    }

    async loadLearningPaths() {
        const container = document.getElementById('learningPathsList');
        if (!container) return;

        try {
            const paths = await this.storage.getSuggestedLearningPaths();

            if (paths.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">🛤️</span>
                        <p>Complete more learning sessions to unlock personalized learning paths!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = paths.map(path => {
                const iconColors = {
                    'Programming': 'var(--accent-primary)',
                    'Data Science': 'var(--success)',
                    'Web Development': 'var(--info)',
                    'Machine Learning': 'var(--warning)'
                };
                const color = iconColors[path.category] || 'var(--accent-primary)';
                
                return `
                    <div class="learning-path-item">
                        <div class="learning-path-icon" style="background: ${color}20; color: ${color}">
                            ${getCategoryIcon(path.category)}
                        </div>
                        <div class="learning-path-content">
                            <div class="learning-path-title">${path.name}</div>
                            <div class="learning-path-desc">${path.description}</div>
                            <div class="learning-path-progress">
                                <div class="learning-path-progress-bar">
                                    <div class="learning-path-progress-fill" style="width: ${path.progress}%"></div>
                                </div>
                                <span class="learning-path-progress-text">${path.progress}%</span>
                            </div>
                            <div class="learning-path-meta">
                                <span>Next: ${path.nextStep}</span>
                                <span class="path-level">${path.level}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading learning paths:', error);
        }
    }

    inferDifficulty(description) {
        if (!description) return null;
        const lower = description.toLowerCase();
        if (lower.includes('beginner') || lower.includes('intro') || lower.includes('basic')) return 'beginner';
        if (lower.includes('advanced') || lower.includes('expert')) return 'advanced';
        if (lower.includes('intermediate')) return 'intermediate';
        return null;
    }

    getRecommendationIcon(type) {
        const icons = {
            'Tutorial': '📚',
            'Practice': '💪',
            'Course': '🎓',
            'Article': '📄',
            'Documentation': '📖',
            'Video': '🎥',
            'Project': '🚀'
        };
        return icons[type] || '💡';
    }

    async loadWeeklySummary() {
        const report = await this.analytics.generateWeeklyReport();
        const container = document.getElementById('weeklySummary');
        
        if (!container) return;

        container.innerHTML = `
            <div class="summary-content">
                <div class="summary-stat">
                    <div class="summary-value">${formatTime(report.overview.totalTime)}</div>
                    <div class="summary-label">Total Learning</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-value">${report.overview.totalSessions}</div>
                    <div class="summary-label">Sessions</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-value">${report.overview.uniqueTopics}</div>
                    <div class="summary-label">Topics</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-value">${report.overview.avgEngagement}%</div>
                    <div class="summary-label">Engagement</div>
                </div>
            </div>
        `;
    }

    async loadHistory() {
        const tableBody = document.getElementById('historyTableBody');
        const paginationContainer = document.getElementById('historyPagination');
        const pageNumbers = document.getElementById('pageNumbers');
        const datatableInfo = document.querySelector('.datatable-info');
        
        if (!tableBody) return;

        // Build filter options
        const filterOptions = {};
        
        if (this.historyFilters.category) {
            filterOptions.category = this.historyFilters.category;
        }
        
        if (this.historyFilters.date) {
            filterOptions.startDate = this.historyFilters.date;
            filterOptions.endDate = this.historyFilters.date;
        }

        // Get all sessions for filtering
        let allSessions = await this.storage.getSessions(filterOptions);
        
        // Apply search filter
        if (this.historyFilters.searchQuery) {
            const query = this.historyFilters.searchQuery.toLowerCase();
            allSessions = allSessions.filter(s => 
                s.title?.toLowerCase().includes(query) ||
                s.domain?.toLowerCase().includes(query) ||
                s.category?.toLowerCase().includes(query) ||
                (s.topics && s.topics.some(t => t.toLowerCase().includes(query)))
            );
        }
        
        // Sort sessions
        allSessions = this.sortSessions(allSessions);
        
        // Populate category filter (only on initial load)
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && !this.historyFilters.category && !this.historyFilters.date) {
            const allSessionsForCategories = await this.storage.getSessions({});
            const categories = [...new Set(allSessionsForCategories.map(s => s.category).filter(Boolean))].sort();
            const currentValue = categoryFilter.value;
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                categories.map(c => `<option value="${c}"${c === currentValue ? ' selected' : ''}>${c}</option>`).join('');
        }

        // Handle empty state
        if (allSessions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="datatable-empty">
                        <i class="ri-search-line"></i>
                        <h4>${this.historyFilters.category || this.historyFilters.date || this.historyFilters.searchQuery ? 'No matching history found' : 'No learning history yet'}</h4>
                        <p>Start browsing to track your learning journey</p>
                        ${this.historyFilters.category || this.historyFilters.date || this.historyFilters.searchQuery ? '<button class="clear-filters-btn" onclick="window.dashboardController.clearHistoryFilters()">Clear Filters</button>' : ''}
                    </td>
                </tr>
            `;
            if (datatableInfo) datatableInfo.innerHTML = 'Showing 0 entries';
            if (pageNumbers) pageNumbers.innerHTML = '';
            return;
        }

        // Calculate pagination
        const totalSessions = allSessions.length;
        const totalPages = Math.ceil(totalSessions / this.historyFilters.pageSize);
        const startIndex = (this.historyFilters.page - 1) * this.historyFilters.pageSize;
        const endIndex = Math.min(startIndex + this.historyFilters.pageSize, totalSessions);
        const paginatedSessions = allSessions.slice(startIndex, endIndex);

        // Render DataTable rows
        tableBody.innerHTML = paginatedSessions.map(session => this.renderHistoryTableRow(session)).join('');

        // Update pagination info
        if (datatableInfo) {
            datatableInfo.innerHTML = `Showing <strong>${startIndex + 1}</strong> to <strong>${endIndex}</strong> of <strong>${totalSessions}</strong> entries`;
        }

        // Render pagination numbers
        if (pageNumbers) {
            pageNumbers.innerHTML = this.renderPageNumbers(this.historyFilters.page, totalPages);
            this.setupPaginationListeners();
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn) prevBtn.disabled = this.historyFilters.page === 1;
        if (nextBtn) nextBtn.disabled = this.historyFilters.page === totalPages;

        // Update sort indicators
        this.updateSortIndicators();
        
        // Setup row event listeners
        this.setupTableRowListeners();
        
        // Reset select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllRows');
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
    }

    renderHistoryTableRow(session) {
        const engagement = session.engagement || Math.min(100, Math.round((session.duration / 300) * 100));
        const engagementClass = engagement >= 70 ? 'high' : engagement >= 40 ? 'medium' : 'low';
        const topics = session.topics || [];
        const displayTopics = topics.slice(0, 2);
        const moreTopics = topics.length > 2 ? topics.length - 2 : 0;
        
        const dateObj = new Date(session.timestamp);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        
        return `
            <tr data-session-id="${session.id}">
                <td class="col-checkbox">
                    <input type="checkbox" class="row-checkbox" data-session-id="${session.id}">
                </td>
                <td class="col-title">
                    <div class="title-cell">
                        <span class="title" title="${session.title || 'Untitled'}">${this.truncate(session.title || 'Untitled', 40)}</span>
                        <span class="url" title="${session.url || ''}">${session.domain || 'Unknown'}</span>
                    </div>
                </td>
                <td class="col-category">
                    <span class="category-badge ${(session.category || 'other').toLowerCase().replace(/\s+/g, '-')}">
                        <i class="${getCategoryIcon(session.category)}"></i>
                        ${session.category || 'Other'}
                    </span>
                </td>
                <td class="col-topics">
                    <div class="topics-cell">
                        ${displayTopics.map(t => `<span class="topic-pill">${t}</span>`).join('')}
                        ${moreTopics > 0 ? `<span class="topics-more" title="${topics.slice(2).join(', ')}">+${moreTopics}</span>` : ''}
                        ${topics.length === 0 ? '<span class="topic-pill">No topics</span>' : ''}
                    </div>
                </td>
                <td class="col-duration">
                    <div class="duration-cell">
                        <i class="ri-time-line"></i>
                        <span>${formatTime(session.duration)}</span>
                    </div>
                </td>
                <td class="col-engagement">
                    <div class="engagement-cell">
                        <div class="engagement-bar">
                            <div class="engagement-fill ${engagementClass}" style="width: ${engagement}%"></div>
                        </div>
                        <span class="engagement-value">${engagement}%</span>
                    </div>
                </td>
                <td class="col-date">
                    <div class="date-cell">
                        <span class="date">${dateStr}</span>
                        <span class="time">${timeStr}</span>
                    </div>
                </td>
                <td class="col-actions">
                    <div class="actions-cell">
                        <button class="action-btn view-btn" title="View Details" data-session-id="${session.id}">
                            <i class="ri-eye-line"></i>
                        </button>
                        <button class="action-btn delete" title="Delete" data-session-id="${session.id}">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderPageNumbers(currentPage, totalPages) {
        let html = '';
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            html += `<button class="pagination-btn" data-page="1">1</button>`;
            if (start > 2) html += '<span class="pagination-ellipsis">...</span>';
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (end < totalPages) {
            if (end < totalPages - 1) html += '<span class="pagination-ellipsis">...</span>';
            html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        return html;
    }

    sortSessions(sessions) {
        const { sortBy, sortOrder } = this.historyFilters;
        
        return sessions.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'title':
                    valueA = (a.title || '').toLowerCase();
                    valueB = (b.title || '').toLowerCase();
                    break;
                case 'category':
                    valueA = (a.category || '').toLowerCase();
                    valueB = (b.category || '').toLowerCase();
                    break;
                case 'duration':
                    valueA = a.duration || 0;
                    valueB = b.duration || 0;
                    break;
                case 'engagement':
                    valueA = a.engagement || Math.min(100, Math.round((a.duration / 300) * 100));
                    valueB = b.engagement || Math.min(100, Math.round((b.duration / 300) * 100));
                    break;
                case 'timestamp':
                default:
                    valueA = a.timestamp || 0;
                    valueB = b.timestamp || 0;
                    break;
            }
            
            if (typeof valueA === 'string') {
                return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        });
    }

    updateSortIndicators() {
        document.querySelectorAll('.datatable th.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === this.historyFilters.sortBy) {
                th.classList.add(`sort-${this.historyFilters.sortOrder}`);
            }
        });
    }

    setupTableRowListeners() {
        // Row checkbox listeners
        document.querySelectorAll('.datatable .row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const row = checkbox.closest('tr');
                if (checkbox.checked) {
                    row.classList.add('selected');
                } else {
                    row.classList.remove('selected');
                }
                this.updateDeleteSelectedButton();
            });
        });
        
        // Select all checkbox
        const selectAll = document.getElementById('selectAllRows');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                document.querySelectorAll('.datatable .row-checkbox').forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    const row = checkbox.closest('tr');
                    if (e.target.checked) {
                        row.classList.add('selected');
                    } else {
                        row.classList.remove('selected');
                    }
                });
                this.updateDeleteSelectedButton();
            });
        }
        
        // Delete buttons
        document.querySelectorAll('.datatable .action-btn.delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const sessionId = e.currentTarget.dataset.sessionId;
                if (confirm('Are you sure you want to delete this session?')) {
                    await this.storage.deleteSession(sessionId);
                    this.loadHistory();
                }
            });
        });
        
        // View buttons
        document.querySelectorAll('.datatable .action-btn.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sessionId = e.currentTarget.dataset.sessionId;
                this.viewSessionDetails(sessionId);
            });
        });
    }

    viewSessionDetails(sessionId) {
        // TODO: Implement session details modal
        console.log('View session:', sessionId);
    }

    setupPaginationListeners() {
        document.querySelectorAll('#historyPagination .pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && !e.currentTarget.disabled) {
                    this.historyFilters.page = page;
                    this.loadHistory();
                    document.getElementById('historyList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    clearHistoryFilters() {
        this.historyFilters = { 
            category: '', 
            date: '', 
            page: 1, 
            pageSize: 15,
            sortBy: 'timestamp',
            sortOrder: 'desc',
            searchQuery: ''
        };
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        const searchInput = document.getElementById('historySearch');
        if (categoryFilter) categoryFilter.value = '';
        if (dateFilter) dateFilter.value = '';
        if (searchInput) searchInput.value = '';
        this.loadHistory();
    }

    // Debounce utility
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // AI Analysis Methods
    async analyzeHistoryWithAI() {
        const analyzeBtn = document.getElementById('analyzeHistoryBtn');
        const insightsPanel = document.getElementById('historyInsightsPanel');
        
        if (!analyzeBtn || this.aiAnalysisLoading) return;
        
        try {
            // Show loading state
            this.aiAnalysisLoading = true;
            analyzeBtn.classList.add('loading');
            analyzeBtn.innerHTML = '<i class="ri-loader-4-line"></i> Analyzing...';
            
            // Get all sessions for analysis
            const sessions = await this.storage.getSessions({});
            
            if (sessions.length === 0) {
                alert('No history data to analyze. Start browsing to collect learning data.');
                return;
            }
            
            // Call AI backend for analysis
            const insights = await this.backend.analyzeHistory(sessions);
            
            if (insights && insightsPanel) {
                this.aiInsights = insights;
                this.renderAIInsights(insights);
                insightsPanel.classList.add('active');
            }
            
        } catch (error) {
            console.error('AI Analysis failed:', error);
            alert('Failed to analyze history. Please ensure the backend server is running.');
        } finally {
            this.aiAnalysisLoading = false;
            if (analyzeBtn) {
                analyzeBtn.classList.remove('loading');
                analyzeBtn.innerHTML = '<i class="ri-brain-line"></i> AI Analyze';
            }
        }
    }

    renderAIInsights(insights) {
        const insightsGrid = document.querySelector('#historyInsightsPanel .ai-insights-grid');
        if (!insightsGrid) return;
        
        const cards = [
            {
                icon: 'ri-focus-3-line',
                label: 'Focus Area',
                value: insights.focusArea || 'General Learning',
                change: insights.focusAreaChange || null
            },
            {
                icon: 'ri-time-line',
                label: 'Peak Hours',
                value: insights.peakHours || 'Not determined',
                change: null
            },
            {
                icon: 'ri-bar-chart-line',
                label: 'Learning Pattern',
                value: insights.learningPattern || 'Consistent',
                change: insights.patternTrend || null
            },
            {
                icon: 'ri-lightbulb-line',
                label: 'Recommended Next',
                value: insights.recommendedTopic || 'Keep exploring',
                change: null
            }
        ];
        
        insightsGrid.innerHTML = cards.map(card => `
            <div class="ai-insight-card">
                <div class="insight-icon">
                    <i class="${card.icon}"></i>
                </div>
                <div class="insight-label">${card.label}</div>
                <div class="insight-value">${card.value}</div>
                ${card.change ? `<div class="insight-change ${card.change.type}">${card.change.text}</div>` : ''}
            </div>
        `).join('');
    }

    // Export PDF Modal
    openExportModal() {
        const modal = document.getElementById('exportPdfModal');
        if (modal) {
            modal.classList.add('active');
            // Reset to default
            this.selectedExportRange = 'all';
            document.querySelectorAll('.export-option-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.export-option-btn[data-range="all"]')?.classList.add('active');
        }
    }

    closeExportModal() {
        const modal = document.getElementById('exportPdfModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async generatePdfReport() {
        const generateBtn = document.getElementById('generatePdf');
        const originalText = generateBtn?.innerHTML || '<i class="ri-file-pdf-line"></i> Generate PDF';
        
        try {
            // Show loading state
            if (generateBtn) {
                generateBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Generating...';
                generateBtn.disabled = true;
            }

            // Get date range based on selection
            const now = Date.now();
            let startTime = 0;
            let endTime = now;

            // Check for custom date range first
            const customStart = document.getElementById('exportStartDate')?.value;
            const customEnd = document.getElementById('exportEndDate')?.value;

            if (customStart && customEnd) {
                startTime = new Date(customStart).setHours(0, 0, 0, 0);
                endTime = new Date(customEnd).setHours(23, 59, 59, 999);
            } else {
                switch (this.selectedExportRange) {
                    case 'week':
                        startTime = now - (7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startTime = now - (30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'quarter':
                        startTime = now - (90 * 24 * 60 * 60 * 1000);
                        break;
                    case 'year':
                        startTime = now - (365 * 24 * 60 * 60 * 1000);
                        break;
                    case 'all':
                    default:
                        startTime = 0;
                        break;
                }
            }

            // Get sessions in range
            const allSessions = await this.storage.getSessions({});
            const sessions = allSessions.filter(s => s.timestamp >= startTime && s.timestamp <= endTime);

            if (sessions.length === 0) {
                alert('No history found for the selected time range.');
                if (generateBtn) {
                    generateBtn.innerHTML = originalText;
                    generateBtn.disabled = false;
                }
                return;
            }

            // Get export options
            const options = {
                includeSummary: document.getElementById('includeSummary')?.checked ?? true,
                includeCategories: document.getElementById('includeCategories')?.checked ?? true,
                includeKnowledge: document.getElementById('includeKnowledge')?.checked ?? true,
                includeSessions: document.getElementById('includeSessions')?.checked ?? true,
                includeCharts: document.getElementById('includeCharts')?.checked ?? true
            };

            // Get knowledge profile if needed
            let knowledgeProfile = null;
            if (options.includeKnowledge) {
                knowledgeProfile = await this.storage.getKnowledgeProfile();
            }

            // Generate filename with date
            const dateStr = new Date().toISOString().split('T')[0];
            const rangeText = this.selectedExportRange || 'all';
            const filename = `SupriAI_Learning_Report_${rangeText}_${dateStr}`;

            // Generate decorated PDF content
            const pdfContent = this.generateDecoratedPdfContent(sessions, options, knowledgeProfile, startTime, endTime);

            // Try html2pdf first, fallback to HTML download
            if (typeof html2pdf !== 'undefined') {
                await this.generateWithHtml2Pdf(pdfContent, filename);
            } else {
                // Fallback: Download as HTML file that can be printed to PDF
                this.downloadAsHtml(pdfContent, filename);
            }

            // Reset button state
            if (generateBtn) {
                generateBtn.innerHTML = originalText;
                generateBtn.disabled = false;
            }

            this.closeExportModal();
            this.showNotification('Report downloaded successfully!', 'success');

        } catch (error) {
            console.error('Error generating PDF:', error);
            
            // Try fallback method
            try {
                const allSessions = await this.storage.getSessions({});
                const pdfContent = this.generateDecoratedPdfContent(allSessions, {
                    includeSummary: true,
                    includeCategories: true,
                    includeKnowledge: false,
                    includeSessions: true,
                    includeCharts: false
                }, null, 0, Date.now());
                
                const dateStr = new Date().toISOString().split('T')[0];
                this.downloadAsHtml(pdfContent, `SupriAI_Report_${dateStr}`);
                
                if (generateBtn) {
                    generateBtn.innerHTML = originalText;
                    generateBtn.disabled = false;
                }
                this.closeExportModal();
                this.showNotification('Report downloaded as HTML (open and print as PDF)', 'info');
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                alert('Failed to generate report. Please try again.');
                if (generateBtn) {
                    generateBtn.innerHTML = originalText;
                    generateBtn.disabled = false;
                }
            }
        }
    }

    async generateWithHtml2Pdf(htmlContent, filename) {
        return new Promise((resolve, reject) => {
            try {
                // Create a temporary container directly in the body
                const container = document.createElement('div');
                container.id = 'pdf-export-container';
                container.style.cssText = 'position: absolute; left: 0; top: 0; width: 900px; background: white; z-index: 99999; visibility: hidden;';
                
                // Add styles and content directly
                container.innerHTML = `
                    <style>
                        #pdf-export-container * { margin: 0; padding: 0; box-sizing: border-box; }
                        #pdf-export-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }
                        #pdf-export-container .report-container { max-width: 900px; margin: 0 auto; background: white; }
                        #pdf-export-container .report-header { background: #20c997; color: white; padding: 40px; text-align: center; }
                        #pdf-export-container .report-logo { font-size: 48px; margin-bottom: 10px; }
                        #pdf-export-container .report-title { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
                        #pdf-export-container .report-subtitle { font-size: 16px; opacity: 0.9; }
                        #pdf-export-container .report-date-range { margin-top: 20px; padding: 10px 24px; background: rgba(255,255,255,0.25); border-radius: 30px; display: inline-block; font-size: 14px; }
                        #pdf-export-container .summary-section { padding: 40px; background: #f0f4f8; }
                        #pdf-export-container .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                        #pdf-export-container .summary-card { background: white; padding: 24px; border-radius: 14px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border-top: 4px solid #20c997; }
                        #pdf-export-container .summary-card:nth-child(2) { border-top-color: #51cf66; }
                        #pdf-export-container .summary-card:nth-child(3) { border-top-color: #fcc419; }
                        #pdf-export-container .summary-card:nth-child(4) { border-top-color: #74c0fc; }
                        #pdf-export-container .summary-icon { font-size: 32px; margin-bottom: 12px; }
                        #pdf-export-container .summary-value { font-size: 28px; font-weight: 700; color: #2c3e50; margin-bottom: 4px; }
                        #pdf-export-container .summary-label { font-size: 12px; color: #5a6c7d; text-transform: uppercase; letter-spacing: 1px; }
                        #pdf-export-container .section { padding: 40px; border-bottom: 1px solid #e8eef4; }
                        #pdf-export-container .section-title { font-size: 22px; font-weight: 600; color: #2c3e50; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
                        #pdf-export-container .section-title-icon { width: 40px; height: 40px; background: #20c997; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; }
                        #pdf-export-container .category-list { display: flex; flex-direction: column; gap: 12px; }
                        #pdf-export-container .category-item { display: flex; align-items: center; padding: 16px 20px; background: #f0f4f8; border-radius: 12px; }
                        #pdf-export-container .category-rank { width: 32px; height: 32px; background: #20c997; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 16px; }
                        #pdf-export-container .category-info { flex: 1; }
                        #pdf-export-container .category-name { font-weight: 600; color: #2c3e50; margin-bottom: 4px; }
                        #pdf-export-container .category-stats { font-size: 13px; color: #5a6c7d; }
                        #pdf-export-container .category-progress { width: 120px; height: 8px; background: #dce4ec; border-radius: 4px; overflow: hidden; }
                        #pdf-export-container .category-progress-bar { height: 100%; background: #20c997; border-radius: 4px; }
                        #pdf-export-container .sessions-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                        #pdf-export-container .sessions-table th { background: #20c997; color: white; padding: 14px 16px; text-align: left; font-weight: 600; }
                        #pdf-export-container .sessions-table td { padding: 12px 16px; border-bottom: 1px solid #e8eef4; }
                        #pdf-export-container .sessions-table tr:nth-child(even) { background: #f0f4f8; }
                        #pdf-export-container .session-category-badge { padding: 4px 10px; background: rgba(32,201,151,0.15); color: #0ca678; border-radius: 20px; font-size: 11px; font-weight: 500; }
                        #pdf-export-container .report-footer { padding: 30px 40px; background: #2c3e50; color: white; text-align: center; }
                        #pdf-export-container .footer-logo { font-size: 24px; margin-bottom: 8px; }
                        #pdf-export-container .footer-text { font-size: 13px; opacity: 0.8; }
                        #pdf-export-container .footer-date { margin-top: 12px; font-size: 12px; opacity: 0.6; }
                    </style>
                `;
                
                // Parse and append body content
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                const reportContainer = doc.querySelector('.report-container');
                
                if (reportContainer) {
                    container.appendChild(reportContainer.cloneNode(true));
                } else {
                    // Fallback - use entire body
                    const bodyContent = doc.body.innerHTML;
                    const div = document.createElement('div');
                    div.innerHTML = bodyContent;
                    container.appendChild(div);
                }
                
                document.body.appendChild(container);

                // Make visible for rendering
                setTimeout(() => {
                    container.style.visibility = 'visible';
                }, 100);

                // Wait for DOM to fully render
                setTimeout(async () => {
                    try {
                        const element = container.querySelector('.report-container') || container;
                        
                        console.log('PDF Element found:', !!element);
                        console.log('PDF Element innerHTML length:', element.innerHTML.length);
                        
                        if (!element || element.innerHTML.trim().length < 100) {
                            throw new Error('Report content is empty or too short');
                        }

                        const pdfOptions = {
                            margin: [10, 10, 10, 10],
                            filename: `${filename}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { 
                                scale: 2,
                                useCORS: true,
                                logging: false,
                                backgroundColor: '#ffffff',
                                width: 900,
                                windowWidth: 900
                            },
                            jsPDF: { 
                                unit: 'mm', 
                                format: 'a4', 
                                orientation: 'portrait' 
                            },
                            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                        };

                        await html2pdf().set(pdfOptions).from(element).save();
                        
                        // Cleanup
                        document.body.removeChild(container);
                        resolve();
                    } catch (err) {
                        console.error('html2pdf generation error:', err);
                        // Cleanup on error
                        if (container.parentNode) document.body.removeChild(container);
                        reject(err);
                    }
                }, 1000);
            } catch (err) {
                console.error('html2pdf setup error:', err);
                reject(err);
            }
        });
    }

    downloadAsHtml(htmlContent, filename) {
        // Create a complete HTML document with print-ready styling
        const fullHtml = htmlContent.replace('</head>', `
            <style>
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </head>`);

        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateDecoratedPdfContent(sessions, options, knowledgeProfile, startTime, endTime) {
        // Calculate stats
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const categories = [...new Set(sessions.map(s => s.category).filter(Boolean))];
        const domains = [...new Set(sessions.map(s => s.domain).filter(Boolean))];
        const avgEngagement = sessions.length > 0 
            ? Math.round(sessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / sessions.length) 
            : 0;

        // Date range text
        const dateRangeText = startTime === 0 
            ? 'All Time' 
            : `${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`;

        // Category stats
        const categoryStats = {};
        sessions.forEach(s => {
            const cat = s.category || 'General';
            if (!categoryStats[cat]) {
                categoryStats[cat] = { sessions: 0, time: 0, engagement: 0 };
            }
            categoryStats[cat].sessions++;
            categoryStats[cat].time += s.duration || 0;
            categoryStats[cat].engagement += s.engagementScore || 0;
        });

        // Sort categories by time
        const sortedCategories = Object.entries(categoryStats)
            .map(([name, stats]) => ({ 
                name, 
                ...stats, 
                avgEngagement: stats.sessions > 0 ? Math.round(stats.engagement / stats.sessions) : 0 
            }))
            .sort((a, b) => b.time - a.time);

        return `
<!DOCTYPE html>
<html>
<head>
    <title>SupriAI Learning Report - ${dateRangeText}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #fafbfc;
            color: #2c3e50;
            line-height: 1.6;
        }
        .report-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        /* Header - Friendly mint color */
        .report-header {
            background: #20c997;
            color: white;
            padding: 40px;
            text-align: center;
        }
        .report-logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .report-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .report-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        .report-date-range {
            margin-top: 20px;
            padding: 10px 24px;
            background: rgba(255,255,255,0.25);
            border-radius: 30px;
            display: inline-block;
            font-size: 14px;
        }
        
        /* Summary Cards */
        .summary-section {
            padding: 40px;
            background: #f0f4f8;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        .summary-card {
            background: white;
            padding: 24px;
            border-radius: 14px;
            text-align: center;
            box-shadow: 0 2px 12px rgba(0,0,0,0.04);
            border-top: 4px solid #20c997;
        }
        .summary-card:nth-child(2) { border-top-color: #51cf66; }
        .summary-card:nth-child(3) { border-top-color: #fcc419; }
        .summary-card:nth-child(4) { border-top-color: #74c0fc; }
        .summary-icon {
            font-size: 32px;
            margin-bottom: 12px;
        }
        .summary-value {
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 4px;
        }
        .summary-label {
            font-size: 12px;
            color: #5a6c7d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Section styles */
        .section {
            padding: 40px;
            border-bottom: 1px solid #e8eef4;
        }
        .section-title {
            font-size: 22px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .section-title-icon {
            width: 40px;
            height: 40px;
            background: #20c997;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
        }
        
        /* Category Breakdown */
        .category-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .category-item {
            display: flex;
            align-items: center;
            padding: 16px 20px;
            background: #f0f4f8;
            border-radius: 12px;
            transition: all 0.3s;
        }
        .category-rank {
            width: 32px;
            height: 32px;
            background: #20c997;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            margin-right: 16px;
        }
        .category-info {
            flex: 1;
        }
        .category-name {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
        }
        .category-stats {
            font-size: 13px;
            color: #5a6c7d;
        }
        .category-progress {
            width: 120px;
            height: 8px;
            background: #dce4ec;
            border-radius: 4px;
            overflow: hidden;
        }
        .category-progress-bar {
            height: 100%;
            background: #20c997;
            border-radius: 4px;
        }
        
        /* Knowledge Profile */
        .knowledge-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
        .knowledge-card {
            background: #f0f4f8;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #20c997;
        }
        .knowledge-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .knowledge-category {
            font-weight: 600;
            color: #2c3e50;
        }
        .knowledge-level {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .level-novice { background: #e8eef4; color: #5a6c7d; }
        .level-beginner { background: #d0ebff; color: #1c7ed6; }
        .level-intermediate { background: #fff3bf; color: #e67700; }
        .level-advanced { background: #c3fae8; color: #0ca678; }
        .level-expert { background: #e5dbff; color: #7048e8; }
        .knowledge-progress-bar {
            height: 6px;
            background: #dce4ec;
            border-radius: 3px;
            overflow: hidden;
        }
        .knowledge-progress-fill {
            height: 100%;
            background: #20c997;
            border-radius: 3px;
        }
        .knowledge-meta {
            margin-top: 8px;
            font-size: 12px;
            color: #5a6c7d;
        }
        
        /* Sessions Table */
        .sessions-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .sessions-table th {
            background: #20c997;
            color: white;
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
        }
        .sessions-table td {
            padding: 12px 16px;
            border-bottom: 1px solid #e8eef4;
        }
        .sessions-table tr:nth-child(even) {
            background: #f0f4f8;
        }
        .sessions-table tr:hover {
            background: #e8eef4;
        }
        .session-category-badge {
            padding: 4px 10px;
            background: rgba(32, 201, 151, 0.15);
            color: #0ca678;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
        }
        
        /* Footer */
        .report-footer {
            padding: 30px 40px;
            background: #2c3e50;
            color: white;
            text-align: center;
        }
        .footer-logo {
            font-size: 24px;
            margin-bottom: 8px;
        }
        .footer-text {
            font-size: 13px;
            opacity: 0.8;
        }
        .footer-date {
            margin-top: 12px;
            font-size: 12px;
            opacity: 0.6;
        }
        
        /* Print styles */
        @media print {
            body { background: white; }
            .report-container { box-shadow: none; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="report-header">
            <div class="report-logo">🧠</div>
            <div class="report-title">Learning Analytics Report</div>
            <div class="report-subtitle">Powered by SupriAI - Your Intelligent Learning Companion</div>
            <div class="report-date-range">📅 ${dateRangeText}</div>
        </div>
        
        ${options.includeSummary ? `
        <!-- Summary Section -->
        <div class="summary-section">
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-icon">📚</div>
                    <div class="summary-value">${sessions.length}</div>
                    <div class="summary-label">Learning Sessions</div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⏱️</div>
                    <div class="summary-value">${this.formatDuration(totalTime)}</div>
                    <div class="summary-label">Total Learning Time</div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🏷️</div>
                    <div class="summary-value">${categories.length}</div>
                    <div class="summary-label">Categories Explored</div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">🎯</div>
                    <div class="summary-value">${avgEngagement}%</div>
                    <div class="summary-label">Avg Engagement</div>
                </div>
            </div>
        </div>
        ` : ''}
        
        ${options.includeCategories ? `
        <!-- Category Breakdown -->
        <div class="section">
            <div class="section-title">
                <div class="section-title-icon">📊</div>
                Category Breakdown
            </div>
            <div class="category-list">
                ${sortedCategories.slice(0, 8).map((cat, i) => {
                    const maxTime = sortedCategories[0]?.time || 1;
                    const percentage = Math.round((cat.time / maxTime) * 100);
                    return `
                    <div class="category-item">
                        <div class="category-rank">${i + 1}</div>
                        <div class="category-info">
                            <div class="category-name">${cat.name}</div>
                            <div class="category-stats">${cat.sessions} sessions • ${this.formatDuration(cat.time)} • ${cat.avgEngagement}% engagement</div>
                        </div>
                        <div class="category-progress">
                            <div class="category-progress-bar" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
        ` : ''}
        
        ${options.includeKnowledge && knowledgeProfile ? `
        <!-- Knowledge Profile -->
        <div class="section">
            <div class="section-title">
                <div class="section-title-icon">🎓</div>
                Knowledge Profile (Overall: ${knowledgeProfile.overallLevel})
            </div>
            <div class="knowledge-grid">
                ${knowledgeProfile.areas.slice(0, 6).map(area => `
                    <div class="knowledge-card">
                        <div class="knowledge-header">
                            <span class="knowledge-category">${area.category}</span>
                            <span class="knowledge-level level-${area.level.toLowerCase()}">${area.level}</span>
                        </div>
                        <div class="knowledge-progress-bar">
                            <div class="knowledge-progress-fill" style="width: ${area.progressScore}%"></div>
                        </div>
                        <div class="knowledge-meta">
                            ${area.sessions} sessions • ${area.topics} topics • ${this.formatDuration(area.totalTime)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${options.includeSessions ? `
        <!-- Session History -->
        <div class="section">
            <div class="section-title">
                <div class="section-title-icon">📋</div>
                Recent Sessions ${sessions.length > 50 ? '(Top 50)' : ''}
            </div>
            <table class="sessions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${sessions.slice(0, 50).map(s => `
                        <tr>
                            <td>${new Date(s.timestamp).toLocaleDateString()}</td>
                            <td>${this.truncate(s.title || 'Untitled', 45)}</td>
                            <td><span class="session-category-badge">${s.category || 'General'}</span></td>
                            <td>${this.formatDuration(s.duration || 0)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${sessions.length > 50 ? `<p style="padding: 16px; color: #666; font-size: 13px;">Showing 50 of ${sessions.length} sessions</p>` : ''}
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="report-footer">
            <div class="footer-logo">🧠 SupriAI</div>
            <div class="footer-text">AI-Powered Learning Recommendation & Analytics System</div>
            <div class="footer-date">Report generated on ${new Date().toLocaleString()}</div>
        </div>
    </div>
</body>
</html>
        `;
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }

    // Delete History Modal
    openDeleteModal() {
        const modal = document.getElementById('deleteHistoryModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeDeleteModal() {
        const modal = document.getElementById('deleteHistoryModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async deleteHistoryByRange(range) {
        const now = Date.now();
        let cutoffTime;

        switch (range) {
            case 'hour':
                cutoffTime = now - (60 * 60 * 1000);
                break;
            case 'day':
                cutoffTime = now - (24 * 60 * 60 * 1000);
                break;
            case 'week':
                cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                cutoffTime = now - (365 * 24 * 60 * 60 * 1000);
                break;
            case 'all':
                if (!confirm('Are you sure you want to delete ALL history? This cannot be undone.')) {
                    return;
                }
                cutoffTime = 0;
                break;
            default:
                return;
        }

        try {
            const sessions = await this.storage.getSessions({});
            const toDelete = sessions.filter(s => s.timestamp >= cutoffTime);
            
            if (toDelete.length === 0) {
                alert('No sessions found in this time range.');
                return;
            }

            if (!confirm(`Delete ${toDelete.length} session(s) from the ${range === 'all' ? 'entire history' : 'last ' + range}?`)) {
                return;
            }

            for (const session of toDelete) {
                await this.storage.delete('sessions', session.id);
            }

            this.closeDeleteModal();
            await this.loadHistory();
            await this.loadDashboard();
            
            alert(`Successfully deleted ${toDelete.length} session(s).`);
        } catch (error) {
            console.error('Error deleting history:', error);
            alert('Failed to delete history. Please try again.');
        }
    }

    async deleteHistoryByDateRange(startDate, endDate) {
        try {
            const startTime = new Date(startDate).setHours(0, 0, 0, 0);
            const endTime = new Date(endDate).setHours(23, 59, 59, 999);

            const sessions = await this.storage.getSessions({});
            const toDelete = sessions.filter(s => s.timestamp >= startTime && s.timestamp <= endTime);

            if (toDelete.length === 0) {
                alert('No sessions found in this date range.');
                return;
            }

            if (!confirm(`Delete ${toDelete.length} session(s) from ${startDate} to ${endDate}?`)) {
                return;
            }

            for (const session of toDelete) {
                await this.storage.delete('sessions', session.id);
            }

            this.closeDeleteModal();
            await this.loadHistory();
            await this.loadDashboard();

            alert(`Successfully deleted ${toDelete.length} session(s).`);
        } catch (error) {
            console.error('Error deleting history:', error);
            alert('Failed to delete history. Please try again.');
        }
    }

    toggleSelectAllHistory(selected) {
        const checkboxes = document.querySelectorAll('.history-item-checkbox');
        checkboxes.forEach(cb => cb.checked = selected);
        this.updateDeleteSelectedButton();
    }

    updateDeleteSelectedButton() {
        const checkboxes = document.querySelectorAll('.history-item-checkbox:checked');
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        if (deleteBtn) {
            deleteBtn.disabled = checkboxes.length === 0;
            deleteBtn.innerHTML = checkboxes.length > 0 
                ? `<i class="ri-delete-bin-line"></i> Delete Selected (${checkboxes.length})`
                : `<i class="ri-delete-bin-line"></i> Delete Selected`;
        }
    }

    async deleteSelectedHistory() {
        const checkboxes = document.querySelectorAll('.history-item-checkbox:checked');
        const sessionIds = Array.from(checkboxes).map(cb => cb.dataset.sessionId);

        if (sessionIds.length === 0) {
            alert('No sessions selected.');
            return;
        }

        if (!confirm(`Delete ${sessionIds.length} selected session(s)?`)) {
            return;
        }

        try {
            for (const id of sessionIds) {
                await this.storage.delete('sessions', id);
            }

            document.getElementById('selectAllHistory').checked = false;
            await this.loadHistory();
            await this.loadDashboard();

            alert(`Successfully deleted ${sessionIds.length} session(s).`);
        } catch (error) {
            console.error('Error deleting sessions:', error);
            alert('Failed to delete selected sessions.');
        }
    }

    async loadProductivityInsights() {
        try {
            const insights = await this.storage.getProductivityInsights();
            
            // Update best learning time
            const bestLearningTimeEl = document.getElementById('bestLearningTime');
            if (bestLearningTimeEl) {
                bestLearningTimeEl.textContent = insights.bestHourFormatted || 'Not enough data';
            }
            
            // Update top category
            const topCategoryEl = document.getElementById('topCategoryInsight');
            if (topCategoryEl) {
                topCategoryEl.textContent = insights.topCategory || 'Learning';
            }
            
            // Update daily average
            const dailyAverageEl = document.getElementById('dailyAverageInsight');
            if (dailyAverageEl) {
                const avgMinutes = Math.round(insights.dailyAverage / 60);
                if (avgMinutes >= 60) {
                    dailyAverageEl.textContent = `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`;
                } else {
                    dailyAverageEl.textContent = `${avgMinutes} min`;
                }
            }
            
            // Update consistency (streak info)
            const consistencyEl = document.getElementById('consistencyInsight');
            if (consistencyEl) {
                const streak = insights.streak || 0;
                if (streak >= 7) {
                    consistencyEl.textContent = `🔥 ${streak} day streak!`;
                } else if (streak >= 3) {
                    consistencyEl.textContent = `${streak} days in a row`;
                } else if (streak > 0) {
                    consistencyEl.textContent = `${streak} day streak`;
                } else {
                    consistencyEl.textContent = 'Start learning today!';
                }
            }
            
            // Update sidebar streak
            const sidebarStreak = document.getElementById('sidebarStreak');
            if (sidebarStreak) {
                sidebarStreak.textContent = insights.streak || 0;
            }
            
            // Update main streak card
            const currentStreakEl = document.getElementById('currentStreak');
            if (currentStreakEl) {
                currentStreakEl.textContent = insights.streak || 0;
            }
            
        } catch (error) {
            console.error('Error loading productivity insights:', error);
        }
    }

    setupBackendConnection() {
        this.backend.addStatusListener((status) => {
            this.updateBackendStatus(status);
        });

        chrome.storage.local.get(['backendEnabled', 'backendUrl', 'autoSync'], (settings) => {
            const backendToggle = document.getElementById('backendToggle');
            const backendUrl = document.getElementById('backendUrl');
            const autoSyncToggle = document.getElementById('autoSyncToggle');

            if (backendToggle) {
                backendToggle.checked = settings.backendEnabled !== false;
            }

            if (backendUrl) {
                backendUrl.value = settings.backendUrl || CONFIG.BACKEND_URL;
                this.backend.baseUrl = backendUrl.value;
            }

            if (autoSyncToggle) {
                autoSyncToggle.checked = settings.autoSync || false;
            }

            if (settings.backendEnabled !== false) {
                this.backend.startHealthChecks();
            }

            if (settings.autoSync) {
                this.startAutoSync();
            }
        });

        document.querySelector('.backend-status')?.addEventListener('click', () => {
            window.location.hash = 'settings';
        });
    }

    updateBackendStatus(status) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        const connectionStatus = document.getElementById('connectionStatus');

        if (!statusIndicator || !statusText) return;

        statusIndicator.classList.remove('connected', 'disconnected', 'checking');
        statusText.classList.remove('connected', 'disconnected');

        if (status === 'checking') {
            statusIndicator.classList.add('checking');
            statusIndicator.innerHTML = '<i class="ri-loader-4-line"></i>';
            statusText.textContent = 'Checking...';
            statusText.classList.remove('connected', 'disconnected');
            if (connectionStatus) connectionStatus.textContent = 'Checking connection...';
        } else if (status === 'connected') {
            statusIndicator.classList.add('connected');
            statusIndicator.innerHTML = '<i class="ri-database-2-line"></i>';
            statusText.textContent = 'Backend Online';
            statusText.classList.add('connected');
            if (connectionStatus) connectionStatus.textContent = 'Connected';
        } else {
            statusIndicator.classList.add('disconnected');
            statusIndicator.innerHTML = '<i class="ri-database-2-line"></i>';
            statusText.textContent = 'Backend Offline';
            statusText.classList.add('disconnected');
            if (connectionStatus) connectionStatus.textContent = 'Disconnected';
        }
    }

    async testBackendConnection() {
        const testBtn = document.getElementById('testBackendBtn');
        if (!testBtn) return;

        const originalText = testBtn.textContent;
        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';

        try {
            const status = await this.backend.getDetailedStatus();
            
            if (status && status.status === 'operational') {
                this.showNotification('Backend connection successful!', 'success');
                
                const statusDesc = document.getElementById('connectionStatusDesc');
                if (statusDesc) {
                    statusDesc.textContent = `Connected - ${status.ai_models.mode}`;
                    statusDesc.style.color = 'var(--success)';
                }
                
                this.displayAIModelStatus(status);
            } else {
                this.showNotification('Backend is not responding. Make sure the server is running.', 'error');
                document.getElementById('aiModelStatus')?.style.setProperty('display', 'none');
            }
        } catch (error) {
            this.showNotification(`Connection failed: ${error.message}`, 'error');
            const statusDesc = document.getElementById('connectionStatusDesc');
            if (statusDesc) {
                statusDesc.textContent = 'Disconnected - Server not responding';
                statusDesc.style.color = 'var(--danger)';
            }
            document.getElementById('aiModelStatus')?.style.setProperty('display', 'none');
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = originalText;
        }
    }

    displayAIModelStatus(status) {
        const aiPanel = document.getElementById('aiModelStatus');
        if (!aiPanel || !status.ai_models) return;

        aiPanel.style.display = 'block';

        const aiMode = document.getElementById('aiMode');
        if (aiMode) {
            aiMode.textContent = status.ai_models.mode;
            aiMode.className = 'ai-status-value ' + 
                (status.ai_models.ai_engine.ml_enabled ? 'status-success' : 'status-warning');
        }

        const numpyStatus = document.getElementById('numpyStatus');
        const sklearnStatus = document.getElementById('sklearnStatus');
        const mlClusteringStatus = document.getElementById('mlClusteringStatus');
        
        if (numpyStatus) {
            numpyStatus.textContent = status.ml_libraries.numpy ? '✓ Installed' : '✗ Not Installed';
            numpyStatus.className = 'ai-status-value ' + 
                (status.ml_libraries.numpy ? 'status-success' : 'status-warning');
        }
        
        if (sklearnStatus) {
            sklearnStatus.textContent = status.ml_libraries.scikit_learn ? '✓ Installed' : '✗ Not Installed';
            sklearnStatus.className = 'ai-status-value ' + 
                (status.ml_libraries.scikit_learn ? 'status-success' : 'status-warning');
        }
        
        if (mlClusteringStatus) {
            mlClusteringStatus.textContent = status.features.ml_clustering ? 'Enabled' : 'Disabled';
            mlClusteringStatus.className = 'ai-status-value ' + 
                (status.features.ml_clustering ? 'status-success' : 'status-warning');
        }

        const recommendationMode = document.getElementById('recommendationMode');
        if (recommendationMode && status.ai_models.recommendation_engine) {
            recommendationMode.textContent = status.ai_models.recommendation_engine.mode;
            recommendationMode.className = 'ai-status-value ' + 
                (status.ai_models.recommendation_engine.ml_enabled ? 'status-success' : 'status-info');
        }

        const resourceCount = document.getElementById('resourceCount');
        if (resourceCount && status.ai_models.recommendation_engine?.resources) {
            resourceCount.textContent = `${status.ai_models.recommendation_engine.resources.total} resources`;
            resourceCount.className = 'ai-status-value status-info';
        }

        const statusNote = document.getElementById('aiStatusNote');
        if (statusNote) {
            if (!status.ml_libraries.installed) {
                statusNote.innerHTML = `
                    <i class="ri-information-line"></i>
                    For enhanced ML analysis, install: <code>pip install numpy scikit-learn</code>
                `;
                statusNote.className = 'ai-status-note warning';
            } else {
                statusNote.innerHTML = `
                    <i class="ri-check-line"></i>
                    All ML libraries installed - Full AI capabilities active
                `;
                statusNote.className = 'ai-status-note success';
            }
        }
    }

    startAutoSync() {
        this.stopAutoSync();

        this.autoSyncInterval = setInterval(() => {
            chrome.storage.local.get(['backendEnabled'], (settings) => {
                if (settings.backendEnabled !== false) {
                    this.syncWithBackend();
                }
            });
        }, 5 * 60 * 1000);

        console.log('Auto-sync started (every 5 minutes)');
    }

    stopAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
            console.log('Auto-sync stopped');
        }
    }

    async syncWithBackend() {
        const syncBtn = document.getElementById('syncBtn');
        if (!syncBtn) return;
        
        syncBtn.classList.add('syncing');
        
        try {
            const data = await this.storage.getDataForSync();
            
            console.log('Syncing data with backend...', {
                sessions: data.sessions?.length || 0,
                topics: data.topics?.length || 0
            });
            
            const result = await this.backend.syncData(data);

            if (result && result.success) {
                if (result.insights && Array.isArray(result.insights)) {
                    await this.storage.saveAIInsights(result.insights);
                }
                        
                if (result.recommendations && Array.isArray(result.recommendations)) {
                    await this.storage.saveRecommendations(result.recommendations);
                }
                
                const stats = result.data || {};
                console.log('Sync complete:', {
                    sessions: stats.sessions_stored,
                    insights: stats.insights_generated,
                    recommendations: stats.recommendations_generated
                });
                
                this.showNotification(
                    `Synced! ${stats.insights_generated || 0} insights, ${stats.recommendations_generated || 0} recommendations`,
                    'success'
                );
                await this.loadDashboard();
                return;
            } else {
                console.error('Sync failed, using local insights');
                await this.generateLocalInsights(data);
                this.showNotification('Generated local insights (backend unavailable)', 'info');
                await this.loadDashboard();
            }
            
        } catch (error) {
            console.error('Sync error:', error);
            try {
                const data = await this.storage.getDataForSync();
                await this.generateLocalInsights(data);
                this.showNotification('Sync failed. Using local data.', 'warning');
            } catch (localError) {
                console.error('Local insight generation failed:', localError);
                this.showNotification('Error generating insights', 'warning');
            }
        } finally {
            syncBtn.classList.remove('syncing');
        }
    }

    async generateLocalInsights(data) {
        const sessions = data.sessions || [];
        const topics = data.topics || [];
        
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgEngagement = sessions.length > 0 
            ? Math.round(sessions.reduce((sum, s) => sum + (s.engagement || 0), 0) / sessions.length)
            : 0;
        
        const categoryMap = {};
        sessions.forEach(s => {
            if (s.category) {
                categoryMap[s.category] = (categoryMap[s.category] || 0) + (s.duration || 0);
            }
        });
        
        const topCategory = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])[0];
        
        const insights = {
            summary: `You've spent ${Math.round(totalTime / 60000)} minutes learning across ${topics.length} topics.`,
            topCategory: topCategory ? topCategory[0] : 'General',
            avgEngagement,
            recommendations: [
                {
                    title: 'Keep up the momentum!',
                    description: `Your engagement is at ${avgEngagement}%. Try to maintain focused learning sessions.`,
                    type: 'motivation',
                    icon: '🎯'
                }
            ],
            generatedAt: Date.now(),
            source: 'local'
        };
        
        await this.storage.saveAIInsights(insights);
        return insights;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
        `;
        
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .notification-success { background: #10b981; color: white; }
                .notification-warning { background: #f59e0b; color: white; }
                .notification-info { background: #6366f1; color: white; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async exportData() {
        const data = await this.storage.getDataForSync();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `supriai-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    async clearData() {
        if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
            const databases = await indexedDB.databases();
            for (const db of databases) {
                if (db.name === 'SupriAI_DB') {
                    indexedDB.deleteDatabase(db.name);
                }
            }
            
            await chrome.storage.local.clear();
            
            alert('All data has been cleared.');
            window.location.reload();
        }
    }

    truncate(str, length) {
        if (!str) return '';
        return str.length > length ? str.substring(0, length) + '...' : str;
    }

    
    renderD3CategoryPie(distribution) {
        if (!distribution || !distribution.byCategory) return;
        
        try {
            const total = distribution.byCategory.reduce((sum, cat) => sum + cat.totalTime, 0);
            const pieData = distribution.byCategory.map(cat => ({
                category: cat.category,
                time: cat.totalTime,
                percentage: (cat.totalTime / total) * 100
            }));
            
            this.d3viz.createCategoryPieChart(pieData, 'categoryPieChart');
        } catch (error) {
            // D3 not available - Chart.js handles this visualization
        }
    }

    renderD3Timeline(trends) {
        if (!trends || !trends.daily) return;
        
        try {
            const timelineData = trends.daily.map(d => ({
                date: new Date(d.date).toISOString().split('T')[0],
                time: d.totalTime,
                sessions: d.sessions || 1
            }));
            
            this.d3viz.createTimelineChart(timelineData, 'timelineChart');
        } catch (error) {
            // D3 not available - Chart.js handles this visualization
        }
    }

    
    async loadCuratedResources() {
        const container = document.getElementById('resourcesList');
        if (!container) return;

        const topics = await this.storage.getTopTopics(3);
        const categories = [...new Set(topics.map(t => t.category || t.name))];
        
        const resources = this.recommendations.resourceDatabase;
        
        let displayResources = [];
        categories.forEach(category => {
            if (resources[category]) {
                displayResources.push(...resources[category].slice(0, 2));
            }
        });
        
        if (displayResources.length === 0 && resources['Programming']) {
            displayResources = resources['Programming'].slice(0, 5);
        }

        if (displayResources.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📚</span>
                    <p>Start learning to see curated resources!</p>
                </div>
            `;
            return;
        }

        const difficultyIcons = {
            'beginner': 'ri-seedling-line',
            'intermediate': 'ri-plant-line',
            'advanced': 'ri-trophy-line'
        };

        const typeIcons = {
            'Course': '🎓',
            'Tutorial': '📖',
            'Documentation': '📚',
            'Video': '🎥',
            'Practice': '💪',
            'Articles': '📝',
            'Interactive': '🎮',
            'Platform': '🌐',
            'Roadmap': '🗺️',
            'Research': '🔬'
        };

        container.innerHTML = displayResources.map(resource => `
            <a href="${resource.url}" 
               class="resource-item" 
               target="_blank" 
               rel="noopener noreferrer">
                <div class="resource-icon">${typeIcons[resource.type] || '📖'}</div>
                <div class="resource-content">
                    <div class="resource-title">
                        ${resource.title}
                        <i class="ri-external-link-line"></i>
                    </div>
                    <div class="resource-meta">
                        <span class="resource-type">${resource.type}</span>
                        <span class="resource-difficulty">
                            <i class="${difficultyIcons[resource.difficulty] || 'ri-bookmark-line'}"></i>
                            ${resource.difficulty}
                        </span>
                    </div>
                </div>
            </a>
        `).join('');
    }
}

// Global reference for inline event handlers
let dashboardControllerInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    dashboardControllerInstance = new DashboardController();
    window.dashboardController = dashboardControllerInstance;
});
