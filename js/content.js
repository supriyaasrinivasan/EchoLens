

let extensionContextValid = true;

function isExtensionContextValid() {
    if (!extensionContextValid) return false;
    
    try {
        if (!chrome || !chrome.runtime || !chrome.runtime.id) {
            extensionContextValid = false;
            return false;
        }
        return true;
    } catch (e) {
        extensionContextValid = false;
        return false;
    }
}

function safeSendMessage(message, callback) {
    if (!extensionContextValid) return;
    
    try {
        if (!chrome || !chrome.runtime || !chrome.runtime.id) {
            extensionContextValid = false;
            return;
        }
        
        chrome.runtime.sendMessage(message, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    extensionContextValid = false;
                    return;
                }
                if (callback) callback(response);
            } catch (e) {
                extensionContextValid = false;
            }
        });
    } catch (error) {
        extensionContextValid = false;
    }
}

class ContentTracker {
    constructor() {
        this.isTracking = false;
        this.sessionId = null;
        
        this.metrics = {
            mouseMovements: 0,
            clicks: 0,
            scrollDepth: 0,
            maxScrollDepth: 0,
            hoverEvents: 0,
            keyPresses: 0,
            timeOnPage: 0,
            activeTime: 0,
            idleTime: 0,
            lastActivity: Date.now(),
            focusLevel: 0
        };

        this.idleThreshold = 30000;
        this.idleTimer = null;
        this.isIdle = false;

        this.throttleDelay = 100;
        this.lastMouseMove = 0;
        this.lastScroll = 0;

        this.reportInterval = 5000;
        this.reportTimer = null;

        this.init();
    }

    init() {
        this.setupMessageListener();
        this.checkIfShouldTrack();
    }

    setupMessageListener() {
        if (!extensionContextValid) return;
        
        try {
            if (!chrome || !chrome.runtime || !chrome.runtime.onMessage) {
                extensionContextValid = false;
                return;
            }
            
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (!extensionContextValid) {
                    return false;
                }
                
                try {
                    switch (message.type) {
                        case 'START_TRACKING':
                            this.startTracking(message.sessionId);
                            sendResponse({ success: true });
                            break;
                        case 'STOP_TRACKING':
                            this.stopTracking();
                            sendResponse({ success: true });
                            break;
                        case 'GET_METRICS':
                            sendResponse({ metrics: this.metrics });
                            break;
                    }
                } catch (error) {
                    extensionContextValid = false;
                }
                return true;
            });
        } catch (error) {
            extensionContextValid = false;
        }
    }

    async checkIfShouldTrack() {
        if (!extensionContextValid) return;
        
        try {
            if (!chrome || !chrome.storage || !chrome.storage.local) {
                extensionContextValid = false;
                return;
            }
            
            const result = await chrome.storage.local.get(['trackingEnabled']);
            if (result.trackingEnabled !== false) {
                safeSendMessage({ 
                    type: 'PAGE_READY',
                    url: window.location.href,
                    title: document.title
                }).catch(err => {
                    console.log('SupriAI: Failed to notify background script:', err.message);
                });
            }
        } catch (error) {
            extensionContextValid = false;
        }
    }

    startTracking(sessionId) {
        if (this.isTracking) return;
        
        this.sessionId = sessionId;
        this.isTracking = true;
        this.metrics.lastActivity = Date.now();
        
        this.attachEventListeners();
        this.startIdleDetection();
        this.startReporting();
        
        console.log('✓ SupriAI: Tracking started for session:', sessionId);
    }

    stopTracking() {
        this.isTracking = false;
        this.detachEventListeners();
        this.stopIdleDetection();
        this.stopReporting();
        
        this.sendReport();
        
        console.log('SupriAI: Tracking stopped');
    }

    attachEventListeners() {
        this.onMouseMove = this.throttle((e) => {
            if (!extensionContextValid) return;
            this.metrics.mouseMovements++;
            this.recordActivity();
        }, this.throttleDelay);
        document.addEventListener('mousemove', this.onMouseMove);

        this.onClick = (e) => {
            if (!extensionContextValid) return;
            this.metrics.clicks++;
            this.recordActivity();
            this.analyzeClick(e);
        };
        document.addEventListener('click', this.onClick);

        this.onScroll = this.throttle(() => {
            if (!extensionContextValid) return;
            this.updateScrollDepth();
            this.recordActivity();
        }, this.throttleDelay);
        window.addEventListener('scroll', this.onScroll);

        this.onMouseOver = (e) => {
            if (!extensionContextValid) return;
            if (this.isInteractiveElement(e.target)) {
                this.metrics.hoverEvents++;
            }
        };
        document.addEventListener('mouseover', this.onMouseOver);

        this.onKeyPress = () => {
            if (!extensionContextValid) return;
            this.metrics.keyPresses++;
            this.recordActivity();
        };
        document.addEventListener('keydown', this.onKeyPress);

        this.onVisibilityChange = () => {
            if (!extensionContextValid) return;
            if (document.hidden) {
                this.isIdle = true;
            } else {
                this.recordActivity();
            }
        };
        document.addEventListener('visibilitychange', this.onVisibilityChange);

        this.onUnload = () => {
            if (!extensionContextValid) return;
            this.sendReport();
        };
        window.addEventListener('beforeunload', this.onUnload);
    }

    detachEventListeners() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('click', this.onClick);
        window.removeEventListener('scroll', this.onScroll);
        document.removeEventListener('mouseover', this.onMouseOver);
        document.removeEventListener('keydown', this.onKeyPress);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        window.removeEventListener('beforeunload', this.onUnload);
    }

    recordActivity() {
        const now = Date.now();
        const elapsed = now - this.metrics.lastActivity;
        
        if (elapsed < this.idleThreshold) {
            this.metrics.activeTime += elapsed;
        } else {
            this.metrics.idleTime += elapsed;
        }
        
        this.metrics.lastActivity = now;
        this.isIdle = false;
        this.resetIdleTimer();
    }

    updateScrollDepth() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        
        const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
        this.metrics.scrollDepth = Math.round(scrollPercentage);
        this.metrics.maxScrollDepth = Math.max(this.metrics.maxScrollDepth, this.metrics.scrollDepth);
        
        safeSendMessage({
            type: 'SCROLL_UPDATE',
            depth: this.metrics.maxScrollDepth
        });
    }

    analyzeClick(event) {
        const target = event.target;
        
        const clickData = {
            element: target.tagName,
            isLink: target.tagName === 'A',
            isButton: target.tagName === 'BUTTON' || target.type === 'button',
            isInput: ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName),
            hasText: target.textContent && target.textContent.length > 0,
            timestamp: Date.now()
        };

        if (this.isEducationalInteraction(target)) {
            clickData.isEducational = true;
        }
    }

    isInteractiveElement(element) {
        const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'VIDEO', 'AUDIO'];
        return interactiveTags.includes(element.tagName) || 
               element.onclick !== null ||
               element.getAttribute('role') === 'button';
    }

    isEducationalInteraction(element) {
        const educationalClasses = ['code', 'highlight', 'video-player', 'quiz', 'exercise', 'example'];
        const classList = element.className?.toLowerCase() || '';
        return educationalClasses.some(cls => classList.includes(cls));
    }

    startIdleDetection() {
        this.resetIdleTimer();
    }

    stopIdleDetection() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
    }

    resetIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        
        this.idleTimer = setTimeout(() => {
            this.isIdle = true;
            this.metrics.idleTime += Date.now() - this.metrics.lastActivity;
        }, this.idleThreshold);
    }

    startReporting() {
        this.reportTimer = setInterval(() => {
            if (!extensionContextValid) {
                this.stopReporting();
                this.stopTracking();
                return;
            }
            this.sendReport();
        }, this.reportInterval);
    }

    stopReporting() {
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
            this.reportTimer = null;
        }
    }

    sendReport() {
        if (!this.isTracking || !extensionContextValid) return;

        const totalTime = this.metrics.activeTime + this.metrics.idleTime;
        const engagement = totalTime > 0 
            ? (this.metrics.activeTime / totalTime) * 100 
            : 0;
        
        const focusLevel = this.calculateFocusLevel();

        safeSendMessage({
            type: 'MOUSE_METRICS',
            metrics: {
                movements: this.metrics.mouseMovements,
                clicks: this.metrics.clicks,
                hoverEvents: this.metrics.hoverEvents,
                idleTime: this.metrics.idleTime
            }
        });

        safeSendMessage({
            type: 'UPDATE_ENGAGEMENT',
            metrics: {
                engagement: engagement,
                focusLevel: focusLevel,
                scrollDepth: this.metrics.maxScrollDepth,
                activeTime: this.metrics.activeTime
            }
        });

        this.resetIntervalMetrics();
    }

    calculateFocusLevel() {
        const recentActivity = Date.now() - this.metrics.lastActivity;
        const isActive = recentActivity < this.idleThreshold;
        
        let focusScore = 0;
        
        if (this.metrics.mouseMovements > 5) focusScore += 20;
        if (this.metrics.clicks > 0) focusScore += 20;
        
        if (this.metrics.maxScrollDepth > 50) focusScore += 20;
        
        if (this.metrics.keyPresses > 0) focusScore += 20;
        
        if (isActive) focusScore += 20;
        
        return Math.min(focusScore, 100);
    }

    resetIntervalMetrics() {
        this.metrics.mouseMovements = 0;
        this.metrics.clicks = 0;
        this.metrics.hoverEvents = 0;
        this.metrics.keyPresses = 0;
    }

    throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }
}

class ContentAnalyzer {
    constructor() {
        this.init();
    }

    init() {
        if (!extensionContextValid) return;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.analyze());
        } else {
            this.analyze();
        }
    }

    analyze() {
        if (!extensionContextValid) return;
        
        const pageData = this.extractPageData();
        
        safeSendMessage({
            type: 'PAGE_CONTENT',
            data: pageData
        }).catch(err => {
            console.log('SupriAI: Failed to send page content:', err.message);
        });
    }

    extractPageData() {
        try {
            return {
                url: window.location.href,
                title: document.title || '',
                metaDescription: this.getMetaDescription(),
                keywords: this.extractKeywords(),
                headings: this.extractHeadings(),
                codeBlocks: this.countCodeBlocks(),
                videos: this.countVideos(),
                links: this.analyzeLinks(),
                wordCount: this.countWords(),
                readingTime: this.estimateReadingTime()
            };
        } catch (error) {
            console.log('SupriAI: Error extracting page data:', error.message);
            return {
                url: window.location.href,
                title: '',
                metaDescription: '',
                keywords: [],
                headings: [],
                codeBlocks: 0,
                videos: 0,
                links: { total: 0, external: 0, topDomains: [] },
                wordCount: 0,
                readingTime: 0
            };
        }
    }

    getMetaDescription() {
        try {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.getAttribute('content') || '' : '';
        } catch (error) {
            return '';
        }
    }

    extractKeywords() {
        try {
            const keywords = [];
            
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                const content = metaKeywords.getAttribute('content');
                if (content) {
                    keywords.push(...content.split(',').map(k => k.trim()));
                }
            }
            
            const headings = document.querySelectorAll('h1, h2, h3');
            headings.forEach(h => {
                if (h.textContent) {
                    const words = h.textContent.trim().toLowerCase().split(/\s+/);
                    keywords.push(...words.filter(w => w.length > 3));
                }
            });
            
            return [...new Set(keywords)].slice(0, 20);
        } catch (error) {
            return [];
        }
    }

    extractHeadings() {
        try {
            const headings = [];
            document.querySelectorAll('h1, h2, h3').forEach(h => {
                if (h.textContent) {
                    headings.push({
                        level: parseInt(h.tagName[1]),
                        text: h.textContent.trim().substring(0, 100)
                    });
                }
            });
            return headings.slice(0, 10);
        } catch (error) {
            return [];
        }
    }

    countCodeBlocks() {
        try {
            return document.querySelectorAll('pre, code, .highlight, .code-block').length;
        } catch (error) {
            return 0;
        }
    }

    countVideos() {
        try {
            return document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length;
        } catch (error) {
            return 0;
        }
    }

    analyzeLinks() {
        try {
            const links = document.querySelectorAll('a[href]');
            const domains = new Map();
            
            links.forEach(link => {
                try {
                    const url = new URL(link.href);
                    const domain = url.hostname;
                    domains.set(domain, (domains.get(domain) || 0) + 1);
                } catch (e) {}
            });
            
            return {
                total: links.length,
                external: Array.from(domains.keys()).filter(d => d !== window.location.hostname).length,
                topDomains: Array.from(domains.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([domain, count]) => ({ domain, count }))
            };
        } catch (error) {
            return { total: 0, external: 0, topDomains: [] };
        }
    }

    countWords() {
        try {
            if (!document.body) return 0;
            const text = document.body.innerText || document.body.textContent || '';
            return text.split(/\s+/).filter(w => w.length > 0).length;
        } catch (error) {
            return 0;
        }
    }

    estimateReadingTime() {
        const wordsPerMinute = 200;
        const wordCount = this.countWords();
        return Math.ceil(wordCount / wordsPerMinute);
    }
}

let tracker = null;
let analyzer = null;

try {
    if (isExtensionContextValid()) {
        tracker = new ContentTracker();
        analyzer = new ContentAnalyzer();
    }
} catch (error) {
    console.log('SupriAI: Could not initialize content tracker:', error.message);
}

if (chrome && chrome.runtime) {
    chrome.runtime.connect({ name: 'content-script' }).onDisconnect.addListener(() => {
        extensionContextValid = false;
        if (tracker) {
            try {
                tracker.stopTracking();
            } catch (e) {}
        }
        console.log('SupriAI: Extension context invalidated, tracking stopped');
    });
}
