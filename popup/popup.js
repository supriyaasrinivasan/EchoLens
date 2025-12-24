

import { StorageManager } from '../js/storage.js';
import { formatTime, formatDate, isExtensionContextValid, safeSendMessage } from '../js/utils.js';

class PopupController {
    constructor() {
        this.storage = new StorageManager();
        this.isTracking = true;
        this.init();
    }

    async init() {
        this.initTheme();
        await this.loadTrackingStatus();
        await this.loadQuickStats();
        await this.loadCurrentPage();
        await this.loadTopTopics();
        await this.loadRecommendations();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('supriai-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }

    setupEventListeners() {
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('supriai-theme', newTheme);
        });

        document.getElementById('openDashboard').addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
        });

        document.getElementById('toggleTracking').addEventListener('click', async () => {
            this.isTracking = !this.isTracking;
            await chrome.storage.local.set({ trackingEnabled: this.isTracking });
            this.updateTrackingUI();
            
            try {
                await safeSendMessage({ type: 'TOGGLE_TRACKING', enabled: this.isTracking });
            } catch (error) {
                console.error('Failed to notify background script:', error);
            }
        });

        document.getElementById('settingsLink').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html#settings') });
        });
    }

    async loadTrackingStatus() {
        const result = await chrome.storage.local.get(['trackingEnabled']);
        this.isTracking = result.trackingEnabled !== false;
        this.updateTrackingUI();
    }

    updateTrackingUI() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        const toggleBtn = document.getElementById('toggleTracking');

        if (this.isTracking) {
            statusDot.classList.add('active');
            statusText.textContent = 'Tracking';
            toggleBtn.innerHTML = '<i class="ri-pause-circle-line"></i> Pause Tracking';
        } else {
            statusDot.classList.remove('active');
            statusText.textContent = 'Paused';
            toggleBtn.innerHTML = '<i class="ri-play-circle-line"></i> Resume Tracking';
        }
    }

    async loadQuickStats() {
        try {
            const stats = await this.storage.getTodayStats();
            
            this.animateStatValue('todayTopics', stats.topicsCount || 0);
            this.animateStatValue('streakDays', stats.streak || 0);
            
            const timeEl = document.getElementById('todayTime');
            const formattedTime = formatTime(stats.totalTime || 0);
            if (timeEl.textContent !== formattedTime) {
                timeEl.style.transform = 'scale(1.1)';
                timeEl.textContent = formattedTime;
                setTimeout(() => {
                    timeEl.style.transform = 'scale(1)';
                }, 200);
            }
            
            // Add visual feedback for active tracking
            if (this.isTracking && stats.totalTime > 0) {
                this.pulseActiveStats();
            }
        } catch (error) {
            console.error('Error loading quick stats:', error);
        }
    }

    animateStatValue(elementId, newValue) {
        const el = document.getElementById(elementId);
        const currentValue = parseInt(el.textContent) || 0;
        
        if (currentValue !== newValue) {
            const increment = newValue > currentValue ? 1 : -1;
            let current = currentValue;
            
            const interval = setInterval(() => {
                current += increment;
                el.textContent = current;
                
                if (current === newValue) {
                    clearInterval(interval);
                    el.parentElement.parentElement.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        el.parentElement.parentElement.style.transform = 'scale(1)';
                    }, 200);
                }
            }, 50);
        }
    }

    pulseActiveStats() {
        const statsCards = document.querySelectorAll('.stat-card');
        statsCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.borderColor = 'var(--primary-400)';
                setTimeout(() => {
                    card.style.borderColor = '';
                }, 500);
            }, index * 100);
        });
    }

    async loadCurrentPage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.url) {
                this.showCurrentPageFallback('No active tab', 'Open a webpage to track');
                return;
            }

            // Check if this is a trackable page
            const isTrackable = tab.url.startsWith('http://') || tab.url.startsWith('https://');
            
            if (!isTrackable) {
                this.showCurrentPageFallback(tab.title || 'Browser Page', 'Not trackable');
                return;
            }

            // Try to get session info from background script
            if (isExtensionContextValid()) {
                try {
                    const response = await safeSendMessage({ 
                        type: 'GET_CURRENT_SESSION',
                        tabId: tab.id 
                    });

                    if (response && response.session) {
                        const session = response.session;
                        this.updatePageInfo(session, tab);
                        this.updateEngagementMeter(session);
                        this.updateFocusLevel(session);
                        this.highlightActiveSession();
                        return;
                    }
                } catch (msgError) {
                    console.log('Background script not responding:', msgError);
                }
            }

            // Fallback: Show basic tab info
            const domain = new URL(tab.url).hostname.replace('www.', '');
            document.getElementById('currentPageTitle').textContent = this.truncateText(tab.title || domain, 40);
            document.getElementById('currentPageCategory').innerHTML = `
                <i class="ri-time-line"></i> ${this.isTracking ? 'Tracking...' : 'Paused'}
            `;
            document.getElementById('engagementMeter').style.width = '0%';
            document.getElementById('engagementValue').textContent = '0%';
            this.updateFocusDots(0);
            
        } catch (error) {
            console.error('Error loading current page:', error);
            this.showCurrentPageFallback('Unable to load', 'Try refreshing');
        }
    }

    updatePageInfo(session, tab) {
        const titleEl = document.getElementById('currentPageTitle');
        const categoryEl = document.getElementById('currentPageCategory');
        
        titleEl.textContent = session.title || tab.title || 'Unknown Page';
        
        const category = session.category || 'General';
        const icon = this.getCategoryIcon(category);
        categoryEl.innerHTML = `<i class="${icon}"></i> ${category}`;
    }

    updateEngagementMeter(session) {
        const engagement = Math.min(100, Math.max(0, session.engagementScore || 0));
        const meterFill = document.getElementById('engagementMeter');
        const meterValue = document.getElementById('engagementValue');
        
        // Smooth animation
        meterFill.style.width = `${engagement}%`;
        meterValue.textContent = `${Math.round(engagement)}%`;
        
        // Update color based on engagement level
        if (engagement >= 70) {
            meterFill.style.background = 'linear-gradient(90deg, var(--success-500) 0%, var(--success-600) 100%)';
        } else if (engagement >= 40) {
            meterFill.style.background = 'linear-gradient(90deg, var(--primary-500) 0%, var(--accent-500) 100%)';
        } else {
            meterFill.style.background = 'linear-gradient(90deg, var(--warning-500) 0%, var(--warning-600) 100%)';
        }
    }

    updateFocusLevel(session) {
        const focusLevel = Math.min(100, Math.max(0, session.focusLevel || 0));
        this.updateFocusDots(focusLevel);
        
        // Update focus label with live status
        const focusLabel = document.querySelector('.focus-label');
        if (focusLabel) {
            const status = focusLevel >= 80 ? '🔥 High Focus' : 
                          focusLevel >= 50 ? '✨ Good Focus' : 
                          focusLevel >= 20 ? '💭 Fair Focus' : '😴 Low Focus';
            focusLabel.innerHTML = `<i class="ri-focus-3-line"></i> ${status}`;
        }
    }

    highlightActiveSession() {
        const sessionCard = document.querySelector('.session-card');
        if (sessionCard) {
            sessionCard.style.animation = 'pulse 2s ease-in-out';
            setTimeout(() => {
                sessionCard.style.animation = '';
            }, 2000);
        }
    }

    getCategoryIcon(category) {
        const icons = {
            'Technology': 'ri-code-line',
            'Science': 'ri-flask-line',
            'Mathematics': 'ri-calculator-line',
            'Programming': 'ri-terminal-line',
            'Design': 'ri-palette-line',
            'Business': 'ri-briefcase-line',
            'Education': 'ri-book-open-line',
            'Research': 'ri-search-line',
            'Documentation': 'ri-file-text-line',
            'General': 'ri-folder-line'
        };
        return icons[category] || 'ri-folder-line';
    }

    showCurrentPageFallback(title, category) {
        document.getElementById('currentPageTitle').textContent = title;
        document.getElementById('currentPageCategory').textContent = category;
        document.getElementById('engagementMeter').style.width = '0%';
        document.getElementById('engagementValue').textContent = '0%';
        this.updateFocusDots(0);
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    updateFocusDots(level) {
        const dots = document.querySelectorAll('.focus-dot');
        const activeDots = Math.ceil(level / 20);
        
        dots.forEach((dot, index) => {
            if (index < activeDots) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    async loadTopTopics() {
        try {
            const topics = await this.storage.getTopTopics(3);
            const container = document.getElementById('topTopicsList');
            
            if (topics.length === 0) {
                container.innerHTML = `
                    <div class="topic-item">
                        <div class="topic-info">
                            <div class="topic-icon">📖</div>
                            <div>
                                <div class="topic-name">Start Learning!</div>
                                <div class="topic-time">Browse educational content to see topics</div>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            const topicIcons = ['💻', '📊', '🔬', '📚', '🎨', '🧮', '🌐', '⚙️'];
            
            container.innerHTML = topics.map((topic, index) => `
                <div class="topic-item">
                    <div class="topic-info">
                        <div class="topic-icon">${topicIcons[index % topicIcons.length]}</div>
                        <div>
                            <div class="topic-name">${topic.name}</div>
                            <div class="topic-time">${formatTime(topic.totalTime)}</div>
                        </div>
                    </div>
                    <div class="topic-progress">
                        <div class="topic-progress-fill" style="width: ${topic.progress || 0}%"></div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading top topics:', error);
        }
    }

    async loadRecommendations() {
        try {
            const recommendations = await this.storage.getRecommendations(2);
            const container = document.getElementById('recommendationsList');
            
            if (recommendations.length === 0) {
                container.innerHTML = `
                    <div class="recommendation-card">
                        <div class="rec-icon">💡</div>
                        <div class="rec-content">
                            <div class="rec-title">Personalized Recommendations Coming</div>
                            <div class="rec-description">Keep learning! AI will generate recommendations based on your patterns.</div>
                            <span class="rec-tag">Getting Started</span>
                        </div>
                    </div>
                `;
                return;
            }

            const recIcons = ['📖', '🎥', '📝', '🔗', '💡'];
            
            container.innerHTML = recommendations.map((rec, index) => `
                <a href="${rec.url || '#'}" 
                   class="recommendation-card" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   ${!rec.url ? 'style="pointer-events: none; opacity: 0.7;"' : ''}>
                    <div class="rec-icon">${rec.icon || recIcons[index % recIcons.length]}</div>
                    <div class="rec-content">
                        <div class="rec-title">
                            ${rec.title}
                            ${rec.url ? '<i class="ri-external-link-line" style="font-size: 14px; opacity: 0.7;"></i>' : ''}
                        </div>
                        <div class="rec-description">${rec.description}</div>
                        <span class="rec-tag">${rec.type || 'Suggested'}</span>
                    </div>
                </a>
            `).join('');
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    }

    startRealTimeUpdates() {
        // Update current page analysis every 3 seconds
        this.pageUpdateInterval = setInterval(() => {
            try {
                if (isExtensionContextValid() && this.isTracking) {
                    this.loadCurrentPage();
                }
            } catch (error) {
                console.log('Extension context invalidated, stopping page updates');
                clearInterval(this.pageUpdateInterval);
            }
        }, 3000);

        // Update stats every 10 seconds
        this.statsUpdateInterval = setInterval(() => {
            try {
                if (isExtensionContextValid()) {
                    this.loadQuickStats();
                }
            } catch (error) {
                console.log('Extension context invalidated, stopping stats updates');
                clearInterval(this.statsUpdateInterval);
            }
        }, 10000);

        // Update topics every 30 seconds
        this.topicsUpdateInterval = setInterval(() => {
            try {
                if (isExtensionContextValid()) {
                    this.loadTopTopics();
                }
            } catch (error) {
                console.log('Extension context invalidated, stopping topics updates');
                clearInterval(this.topicsUpdateInterval);
            }
        }, 30000);

        // Listen for tab changes for instant updates
        if (chrome.tabs && chrome.tabs.onActivated) {
            chrome.tabs.onActivated.addListener(() => {
                setTimeout(() => this.loadCurrentPage(), 500);
            });
        }

        // Listen for tracking status changes
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.trackingEnabled) {
                this.isTracking = changes.trackingEnabled.newValue;
                this.updateTrackingUI();
                if (this.isTracking) {
                    this.loadCurrentPage();
                }
            }
        });

        // Add visual indicator for realtime updates
        this.addRealtimeIndicator();
    }

    addRealtimeIndicator() {
        const header = document.querySelector('.header');
        if (header) {
            const indicator = document.createElement('div');
            indicator.className = 'realtime-indicator';
            indicator.innerHTML = '<i class="ri-pulse-line"></i>';
            indicator.style.cssText = `
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                width: 0.5rem;
                height: 0.5rem;
                background: var(--success-500);
                border-radius: 50%;
                animation: pulse 2s infinite;
                opacity: 0.8;
            `;
            
            // Only show when tracking
            if (this.isTracking) {
                header.style.position = 'relative';
                header.appendChild(indicator);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (isExtensionContextValid()) {
            new PopupController();
        } else {
            throw new Error('Extension context invalidated');
        }
    } catch (error) {
        console.error('Failed to initialize popup:', error);
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h3>Extension Reloaded</h3>
                <p>Please refresh the extension popup or reload the extension.</p>
            </div>
        `;
    }
});
