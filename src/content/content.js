// SupriAI Content Script - Context Capture Engine
// Captures page content, highlights, and sends to background worker
// Tracks page visits, reading time, highlights, and extracts meaningful context

class ContextCapture {
  constructor() {
    this.startTime = Date.now();
    this.highlights = [];
    this.scrollDepth = 0;
    this.interactions = 0;
    this.idleTime = 0;
    this.lastActivity = Date.now();
    this.isActive = true;
    this.focusModeActive = false;
    this.timerInterval = null; // Store timer interval reference
    
    this.init();
  }

  init() {
    // Track scroll depth
    this.trackScrolling();
    
    // Track text selection/highlights
    this.trackHighlights();
    
    // Track user activity
    this.trackActivity();
    
    // Track idle time
    this.trackIdle();
    
    // Inject memory overlay
    this.injectOverlay();
    
    // Load previous context for this URL
    this.loadPreviousContext();
    
    // Send heartbeat every 30 seconds
    setInterval(() => this.sendHeartbeat(), 30000);
    
    // Listen for focus mode messages
    this.setupFocusModeListener();
  }

  setupFocusModeListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      try {
        if (message.type === 'FOCUS_MODE_ACTIVATED') {
          console.log('📨 Content script received FOCUS_MODE_ACTIVATED:', message);
          this.activateFocusMode(message.duration);
          sendResponse({ success: true, message: 'Focus mode activated on content script' });
        } else if (message.type === 'FOCUS_MODE_DEACTIVATED') {
          console.log('📨 Content script received FOCUS_MODE_DEACTIVATED');
          this.deactivateFocusMode();
          sendResponse({ success: true, message: 'Focus mode deactivated on content script' });
        }
      } catch (error) {
        console.error('❌ Error in focus mode message handler:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true;
    });
  }

  activateFocusMode(duration) {
    if (this.focusModeActive) {
      console.log('⚠️ Focus mode already active, ignoring activation request');
      return;
    }
    
    console.log('🎯 Activating focus mode with duration:', duration, 'ms');
    this.focusModeActive = true;
    
    // Clear any existing timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // Create focus mode overlay
    const focusOverlay = document.createElement('div');
    focusOverlay.id = 'supriai-focus-overlay';
    focusOverlay.className = 'supriai-focus-mode';
    
    const endTime = Date.now() + duration;
    const minutes = Math.floor(duration / 60000);
    
    focusOverlay.innerHTML = `
      <div class="focus-mode-banner">
        <div class="focus-mode-icon">🎯</div>
        <div class="focus-mode-info">
          <div class="focus-mode-title">Focus Mode Active</div>
          <div class="focus-mode-timer" data-end="${endTime}">${minutes}:00</div>
        </div>
        <button class="focus-mode-exit" title="Exit Focus Mode">×</button>
      </div>
    `;
    
    document.body.appendChild(focusOverlay);
    console.log('✅ Focus overlay created');
    
    // Add dim overlay to reduce distractions
    const dimOverlay = document.createElement('div');
    dimOverlay.id = 'supriai-dim-overlay';
    dimOverlay.className = 'supriai-dim';
    document.body.appendChild(dimOverlay);
    console.log('✅ Dim overlay created');
    
    // Apply focus styles
    document.body.classList.add('supriai-focused');
    
    // Update timer every second
    this.timerInterval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        console.log('⏱️ Timer completed');
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.deactivateFocusMode();
        this.showFocusComplete();
        // Notify background that focus session ended naturally
        chrome.runtime.sendMessage({ type: 'FOCUS_SESSION_COMPLETED' }).catch(() => {});
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        const timerEl = document.querySelector('.focus-mode-timer');
        if (timerEl) {
          timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
      }
    }, 1000);
    
    // Exit button
    const exitBtn = focusOverlay.querySelector('.focus-mode-exit');
    exitBtn.addEventListener('click', () => {
      console.log('🛑 Exit button clicked');
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.deactivateFocusMode();
      // Notify background to stop focus mode
      chrome.runtime.sendMessage({ type: 'STOP_FOCUS_MODE' }).catch(() => {});
    });
    
    // Show notification
    this.showNotification('🎯 Focus Mode Activated', `Stay focused for ${minutes} minutes`);
    console.log('✅ Focus mode activated successfully');
  }

  deactivateFocusMode() {
    if (!this.focusModeActive) {
      console.log('⚠️ Focus mode not active, ignoring deactivation request');
      return;
    }
    
    console.log('🛑 Deactivating focus mode...');
    this.focusModeActive = false;
    
    // Clear any running timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      console.log('✅ Timer cleared');
    }
    
    // Remove overlays - be more thorough
    const focusOverlay = document.getElementById('supriai-focus-overlay');
    if (focusOverlay) {
      focusOverlay.style.display = 'none'; // Hide first
      setTimeout(() => {
        focusOverlay.remove();
        console.log('✅ Focus overlay removed');
      }, 100);
    }
    
    const dimOverlay = document.getElementById('supriai-dim-overlay');
    if (dimOverlay) {
      dimOverlay.style.opacity = '0'; // Fade out
      dimOverlay.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        dimOverlay.remove();
        console.log('✅ Dim overlay removed');
      }, 300);
    }
    
    // Remove focus styles
    document.body.classList.remove('supriai-focused');
    console.log('✅ Focus styles removed');
    
    // Make sure content is interactive again
    document.body.style.pointerEvents = 'auto';
    
    console.log('✅ Focus mode deactivated successfully');
  }

  showFocusComplete() {
    this.showNotification('✅ Focus Session Complete!', 'Great work! Take a short break.');
  }

  showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'supriai-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  trackScrolling() {
    let maxScroll = 0;
    
    window.addEventListener('scroll', () => {
      this.lastActivity = Date.now();
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercentage);
      this.scrollDepth = Math.round(maxScroll);
    });
  }

  trackHighlights() {
    document.addEventListener('mouseup', () => {
      this.lastActivity = Date.now();
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 10 && text.length < 1000) {
        this.highlights.push({
          text,
          timestamp: Date.now(),
          context: this.getTextContext(selection)
        });
        
        // Save highlight immediately
        this.saveHighlight(text);
      }
    });
  }

  trackActivity() {
    ['click', 'keydown', 'mousemove'].forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now();
        if (event === 'click' || event === 'keydown') {
          this.interactions++;
        }
      });
    });
  }

  trackIdle() {
    setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivity;
      
      // If idle for more than 60 seconds, mark as inactive
      if (timeSinceActivity > 60000) {
        this.isActive = false;
      } else {
        this.isActive = true;
      }
    }, 5000);
  }

  getTextContext(selection) {
    try {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parent = container.nodeType === 3 ? container.parentNode : container;
      return parent.textContent.substring(0, 500);
    } catch (e) {
      return '';
    }
  }

  extractPageContext() {
    // Extract meaningful content from the page
    const title = document.title;
    const url = window.location.href;
    const domain = window.location.hostname;
    
    // Try to get main content
    let mainContent = '';
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '#content'
    ];
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainContent = element.innerText.substring(0, 5000);
        break;
      }
    }
    
    if (!mainContent) {
      mainContent = document.body.innerText.substring(0, 5000);
    }
    
    // Extract meta description
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    
    // Extract headings for structure
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .slice(0, 10)
      .map(h => h.innerText.trim());
    
    return {
      title,
      url,
      domain,
      content: mainContent,
      description: metaDescription,
      headings,
      timestamp: Date.now(),
      timeSpent: Math.floor((Date.now() - this.startTime) / 1000),
      scrollDepth: this.scrollDepth,
      interactions: this.interactions,
      highlights: this.highlights
    };
  }

  async sendHeartbeat() {
    // Don't send heartbeat if page is hidden or user is inactive
    if (document.hidden || !this.isActive) {
      console.log('⏸️ Skipping heartbeat (page hidden or inactive)');
      return;
    }
    
    const context = this.extractPageContext();
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'CONTEXT_UPDATE',
      data: context
    });

    // Send learning analytics data
    chrome.runtime.sendMessage({
      type: 'TRACK_LEARNING_ACTIVITY',
      data: {
        scrollDepth: this.scrollDepth / 100, // Normalize to 0-1
        timeActive: Date.now() - this.startTime,
        interactions: this.interactions,
        isActive: this.isActive
      }
    });
  }

  async saveHighlight(text) {
    chrome.runtime.sendMessage({
      type: 'SAVE_HIGHLIGHT',
      data: {
        text,
        url: window.location.href,
        title: document.title,
        timestamp: Date.now()
      }
    });
  }

  async loadPreviousContext() {
    // Ask background script for previous visits to this URL
    chrome.runtime.sendMessage({
      type: 'GET_PREVIOUS_CONTEXT',
      url: window.location.href
    }, (response) => {
      if (response && response.context) {
        this.showMemoryOverlay(response.context);
      }
    });
  }

  injectOverlay() {
    // Check if overlay already exists to prevent duplicates
    if (document.getElementById('supriai-overlay')) {
      console.log('✓ Overlay already exists, skipping injection');
      return;
    }
    
    // Create the floating memory icon
    const overlay = document.createElement('div');
    overlay.id = 'supriai-overlay';
    overlay.innerHTML = `
      <div class="supriai-icon" title="supriai Memory">
        💫
      </div>
      <div class="supriai-popup" style="display: none;">
        <div class="supriai-popup-content">
          <div class="supriai-loading">Loading memories...</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Toggle popup on click
    const icon = overlay.querySelector('.supriai-icon');
    const popup = overlay.querySelector('.supriai-popup');
    
    icon.addEventListener('click', () => {
      const isVisible = popup.style.display !== 'none';
      popup.style.display = isVisible ? 'none' : 'block';
    });
  }

  showMemoryOverlay(context) {
    const popup = document.querySelector('.supriai-popup-content');
    if (!popup) return;
    
    const { visits, lastVisit, totalTimeSpent, highlights, tags } = context;
    
    let html = '<div class="supriai-memory">';
    
    if (visits > 1) {
      html += `
        <div class="memory-header">
          <span class="memory-icon">🔮</span>
          <span class="memory-title">Memory Recall</span>
        </div>
        <div class="memory-stat">
          You've been here <strong>${visits} times</strong>
        </div>
      `;
      
      if (lastVisit) {
        const timeSince = this.formatTimeSince(lastVisit);
        html += `<div class="memory-stat">Last visit: <strong>${timeSince}</strong></div>`;
      }
      
      if (totalTimeSpent > 60) {
        const minutes = Math.floor(totalTimeSpent / 60);
        html += `<div class="memory-stat">Total time: <strong>${minutes} minutes</strong></div>`;
      }
      
      if (highlights && highlights.length > 0) {
        html += '<div class="memory-section">';
        html += '<div class="memory-section-title">Your highlights:</div>';
        highlights.slice(0, 3).forEach(h => {
          html += `<div class="memory-highlight">"${h.text.substring(0, 100)}..."</div>`;
        });
        html += '</div>';
      }
      
      if (tags && tags.length > 0) {
        html += '<div class="memory-section">';
        html += '<div class="memory-tags">';
        tags.forEach(tag => {
          html += `<span class="memory-tag">${tag}</span>`;
        });
        html += '</div></div>';
      }
    } else {
      html += `
        <div class="memory-header">
          <span class="memory-icon">✨</span>
          <span class="memory-title">First Visit</span>
        </div>
        <div class="memory-stat">
          This is your first time here. supriai is capturing context...
        </div>
      `;
    }
    
    html += '</div>';
    popup.innerHTML = html;
  }

  formatTimeSince(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ContextCapture();
  });
} else {
  new ContextCapture();
}

// Handle page unload - save final state
window.addEventListener('beforeunload', () => {
  const captureInstance = window.contextCapture || new ContextCapture();
  const finalContext = captureInstance.extractPageContext();
  
  chrome.runtime.sendMessage({
    type: 'PAGE_UNLOAD',
    data: finalContext
  });
});
