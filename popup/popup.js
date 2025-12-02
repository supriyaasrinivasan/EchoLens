/**
 * SupriAI - Popup Script
 * Handles popup UI interactions and data display
 */

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
        // Check for saved theme or system preference
        const savedTheme = localStorage.getItem('supriai-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }

    setupEventListeners() {
        // Theme Toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('supriai-theme', newTheme);
        });

        // Open Dashboard
        document.getElementById('openDashboard').addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
        });

        // Toggle Tracking
        document.getElementById('toggleTracking').addEventListener('click', async () => {
            this.isTracking = !this.isTracking;
            await chrome.storage.local.set({ trackingEnabled: this.isTracking });
            this.updateTrackingUI();
            
            // Notify background script using safe message sender
            try {
                await safeSendMessage({ type: 'TOGGLE_TRACKING', enabled: this.isTracking });
            } catch (error) {
                console.error('Failed to notify background script:', error);
            }
        });

        // Settings Link
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
            
            document.getElementById('todayTopics').textContent = stats.topicsCount || 0;
            document.getElementById('todayTime').textContent = formatTime(stats.totalTime || 0);
            document.getElementById('streakDays').textContent = stats.streak || 0;
        } catch (error) {
            console.error('Error loading quick stats:', error);
        }
    }

    async loadCurrentPage() {
        try {
            // Check if extension context is valid
            if (!isExtensionContextValid()) {
                throw new Error('Extension context invalidated');
            }

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab && tab.url) {
                // Get current session data from background using safe message sender
                const response = await safeSendMessage({ 
                    type: 'GET_CURRENT_SESSION',
                    tabId: tab.id 
                });

                if (response && response.session) {
                    const session = response.session;
                    document.getElementById('currentPageTitle').textContent = session.title || tab.title || 'Unknown Page';
                    document.getElementById('currentPageCategory').textContent = session.category || 'Analyzing...';
                    
                    // Update engagement meter
                    const engagement = session.engagementScore || 0;
                    document.getElementById('engagementMeter').style.width = `${engagement}%`;
                    document.getElementById('engagementValue').textContent = `${Math.round(engagement)}%`;
                    
                    // Update focus dots
                    this.updateFocusDots(session.focusLevel || 0);
                } else {
                    document.getElementById('currentPageTitle').textContent = tab.title || 'Unknown Page';
                    document.getElementById('currentPageCategory').textContent = 'Not tracked';
                }
            }
        } catch (error) {
            console.error('Error loading current page:', error);
            // Set default values on error
            document.getElementById('currentPageTitle').textContent = 'Extension Reloaded';
            document.getElementById('currentPageCategory').textContent = 'Refresh page to track';
        }
    }

    updateFocusDots(level) {
        const dots = document.querySelectorAll('.focus-dot');
        const activeDots = Math.ceil(level / 20); // 0-100 to 0-5
        
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
                <div class="recommendation-card" data-url="${rec.url || '#'}">
                    <div class="rec-icon">${recIcons[index % recIcons.length]}</div>
                    <div class="rec-content">
                        <div class="rec-title">${rec.title}</div>
                        <div class="rec-description">${rec.description}</div>
                        <span class="rec-tag">${rec.type || 'Suggested'}</span>
                    </div>
                </div>
            `).join('');

            // Add click handlers
            container.querySelectorAll('.recommendation-card').forEach(card => {
                card.addEventListener('click', () => {
                    const url = card.dataset.url;
                    if (url && url !== '#') {
                        chrome.tabs.create({ url });
                    }
                });
            });
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    }

    startRealTimeUpdates() {
        // Update current page info every 5 seconds
        setInterval(() => {
            try {
                if (isExtensionContextValid()) {
                    this.loadCurrentPage();
                }
            } catch (error) {
                console.log('Extension context invalidated, stopping updates');
            }
        }, 5000);

        // Update stats every 30 seconds
        setInterval(() => {
            try {
                if (isExtensionContextValid()) {
                    this.loadQuickStats();
                }
            } catch (error) {
                console.log('Extension context invalidated, stopping updates');
            }
        }, 30000);
    }
}

// Initialize when DOM is ready
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
