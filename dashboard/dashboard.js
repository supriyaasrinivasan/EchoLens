/**
 * SupriAI - Dashboard Controller
 * Main dashboard JavaScript for analytics visualization
 */

import { StorageManager } from '../js/storage.js';
import { AnalyticsEngine } from '../js/analytics.js';
import { RecommendationEngine } from '../js/recommendations.js';
import { formatTime, formatDate, getCategoryColor, getCategoryIcon, getRelativeTime } from '../js/utils.js';
import CONFIG from '../js/config.js';

class DashboardController {
    constructor() {
        this.storage = new StorageManager();
        this.analytics = new AnalyticsEngine();
        this.recommendations = new RecommendationEngine();
        
        this.currentTimeRange = 'week';
        this.charts = {};
        
        this.init();
    }

    async init() {
        await this.storage.ensureInitialized();
        
        this.initTheme();
        this.setupNavigation();
        this.setupEventListeners();
        
        await this.loadDashboard();
        
        // Check URL hash for direct section navigation
        this.handleHashChange();
        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    initTheme() {
        // Check for saved theme or system preference
        const savedTheme = localStorage.getItem('supriai-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }

        // Theme toggle event listener
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('supriai-theme', newTheme);
            
            // Update charts for new theme
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
                
                // Update active state
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                
                // Update URL hash
                window.location.hash = section;
            });
        });
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1) || 'overview';
        this.showSection(hash);
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === hash);
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update header
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
        document.getElementById('sectionTitle').textContent = headerInfo.title;
        document.getElementById('headerSubtitle').textContent = headerInfo.subtitle;
    }

    setupEventListeners() {
        // Time range buttons
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTimeRange = btn.dataset.range;
                this.loadDashboard();
            });
        });

        // Sync button
        document.getElementById('syncBtn').addEventListener('click', () => this.syncWithBackend());

        // Settings
        document.getElementById('trackingToggle').addEventListener('change', (e) => {
            chrome.storage.local.set({ trackingEnabled: e.target.checked });
        });

        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearData());

        // Refresh recommendations
        document.getElementById('refreshRecs')?.addEventListener('click', () => this.loadRecommendations());

        // Path selector for skill tree
        document.getElementById('pathSelector')?.addEventListener('change', (e) => {
            this.renderSkillTree(e.target.value);
        });

        // Topic search
        document.getElementById('topicSearch')?.addEventListener('input', (e) => {
            this.filterTopics(e.target.value);
        });
    }

    async loadDashboard() {
        try {
            const analytics = await this.analytics.getAnalytics(this.currentTimeRange);
            
            // Update overview stats
            this.updateOverviewStats(analytics);
            
            // Render charts
            this.renderTrendChart(analytics.learningTrends);
            this.renderTopicChart(analytics.topicDistribution);
            
            // Load other sections
            this.loadRecentSessions();
            this.loadQuickRecommendations();
            
            // Analytics section
            this.renderEngagementChart(analytics.engagementMetrics);
            this.renderHourlyChart(analytics.learningTrends.hourlyDistribution);
            this.renderCategoryChart(analytics.topicDistribution);
            this.renderPatterns(analytics.patterns);
            
            // Topics section
            await this.loadTopics();
            
            // Skills section
            await this.loadSkills();
            
            // Recommendations section
            await this.loadRecommendations();
            
            // History section
            await this.loadHistory();
            
            // Update sidebar streak
            const stats = await this.storage.getTodayStats();
            document.getElementById('sidebarStreak').textContent = stats.streak || 0;
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    updateOverviewStats(analytics) {
        const { overview } = analytics;
        
        document.getElementById('totalTime').textContent = formatTime(overview.totalTime);
        document.getElementById('totalTopics').textContent = overview.uniqueTopics;
        document.getElementById('avgEngagement').textContent = `${overview.avgEngagement}%`;
        document.getElementById('activeDays').textContent = overview.uniqueDays;
    }

    renderTrendChart(trends) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        // Destroy existing chart
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

        // Add click handlers
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

        // Render skill tree
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
        // Generate fresh recommendations
        const recs = await this.recommendations.generate();
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
            <div class="full-rec-item" ${rec.url ? `onclick="window.open('${rec.url}')"` : ''}>
                <div class="rec-icon">${rec.icon || '📖'}</div>
                <div class="rec-content">
                    <div class="rec-title">${rec.title}</div>
                    <div class="rec-description">${rec.description}</div>
                    <span class="rec-tag">${rec.type || 'Suggestion'}</span>
                </div>
            </div>
        `).join('');

        // Load weekly summary
        this.loadWeeklySummary();
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
        const sessions = await this.storage.getSessions({ limit: 50 });
        const container = document.getElementById('historyList');
        
        if (!container) return;

        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📜</span>
                    <p>No learning history yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sessions.map(session => `
            <div class="history-item">
                <div class="history-time">${formatDate(session.timestamp, 'short')}</div>
                <div class="history-content">
                    <div class="history-title">${this.truncate(session.title, 50)}</div>
                    <div class="history-url">${session.domain} • ${session.category || 'General'}</div>
                </div>
                <div class="history-duration">${formatTime(session.duration)}</div>
            </div>
        `).join('');

        // Populate category filter
        const categories = [...new Set(sessions.map(s => s.category).filter(Boolean))];
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                categories.map(c => `<option value="${c}">${c}</option>`).join('');
        }
    }

    async syncWithBackend() {
        const syncBtn = document.getElementById('syncBtn');
        if (!syncBtn) return;
        
        syncBtn.classList.add('syncing');
        
        try {
            const data = await this.storage.getDataForSync();
            
            const settings = await chrome.storage.local.get(['backendUrl']);
            const url = settings.backendUrl || CONFIG.BACKEND_URL;
            
            // Check if backend is available first with a timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.SYNC_TIMEOUT);
            
            try {
                const response = await fetch(`${url}/api/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (response.ok) {
                    const result = await response.json();
                    
                    // Handle structured response
                    if (result.success) {
                        // Store insights
                        if (result.insights && Array.isArray(result.insights)) {
                            await this.storage.saveAIInsights(result.insights);
                        }
                        
                        // Store recommendations
                        if (result.recommendations && Array.isArray(result.recommendations)) {
                            await this.storage.saveRecommendations(result.recommendations);
                        }
                        
                        // Log sync statistics
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
                        this.loadDashboard();
                        return;
                    } else {
                        // Handle error response
                        console.error('Sync returned error:', result.error);
                        throw new Error(result.error || 'Sync failed');
                    }
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                console.log('Backend not available:', fetchError.message);
            }
            
            // Backend not available - generate local insights instead
            await this.generateLocalInsights(data);
            this.showNotification('Generated local insights (backend offline)', 'info');
            this.loadDashboard();
            
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Sync failed. Using local data.', 'warning');
        } finally {
            syncBtn.classList.remove('syncing');
        }
    }

    async generateLocalInsights(data) {
        // Generate insights locally when backend is not available
        const sessions = data.sessions || [];
        const topics = data.topics || [];
        
        // Calculate basic insights
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgEngagement = sessions.length > 0 
            ? Math.round(sessions.reduce((sum, s) => sum + (s.engagement || 0), 0) / sessions.length)
            : 0;
        
        // Get top categories
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
        `;
        
        // Add styles if not exists
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
        
        // Auto remove after 3 seconds
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
            // Clear IndexedDB
            const databases = await indexedDB.databases();
            for (const db of databases) {
                if (db.name === 'SupriAI_DB') {
                    indexedDB.deleteDatabase(db.name);
                }
            }
            
            // Clear chrome storage
            await chrome.storage.local.clear();
            
            alert('All data has been cleared.');
            window.location.reload();
        }
    }

    truncate(str, length) {
        if (!str) return '';
        return str.length > length ? str.substring(0, length) + '...' : str;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
});
