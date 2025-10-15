// EchoLens Content Script - Context Capture Engine
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
      if (message.type === 'FOCUS_MODE_ACTIVATED') {
        this.activateFocusMode(message.duration);
        sendResponse({ success: true });
      } else if (message.type === 'FOCUS_MODE_DEACTIVATED') {
        this.deactivateFocusMode();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  activateFocusMode(duration) {
    if (this.focusModeActive) return;
    
    this.focusModeActive = true;
    
    // Create focus mode overlay
    const focusOverlay = document.createElement('div');
    focusOverlay.id = 'echolens-focus-overlay';
    focusOverlay.className = 'echolens-focus-mode';
    
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
    
    // Add dim overlay to reduce distractions
    const dimOverlay = document.createElement('div');
    dimOverlay.id = 'echolens-dim-overlay';
    dimOverlay.className = 'echolens-dim';
    document.body.appendChild(dimOverlay);
    
    // Apply focus styles
    document.body.classList.add('echolens-focused');
    
    // Update timer every second
    const timerInterval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(timerInterval);
        this.deactivateFocusMode();
        this.showFocusComplete();
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
    focusOverlay.querySelector('.focus-mode-exit').addEventListener('click', () => {
      clearInterval(timerInterval);
      this.deactivateFocusMode();
      chrome.runtime.sendMessage({ type: 'DEACTIVATE_FOCUS_MODE' });
    });
    
    // Show notification
    this.showNotification('🎯 Focus Mode Activated', `Stay focused for ${minutes} minutes`);
  }

  deactivateFocusMode() {
    if (!this.focusModeActive) return;
    
    this.focusModeActive = false;
    
    // Remove overlays
    const focusOverlay = document.getElementById('echolens-focus-overlay');
    const dimOverlay = document.getElementById('echolens-dim-overlay');
    
    if (focusOverlay) focusOverlay.remove();
    if (dimOverlay) dimOverlay.remove();
    
    // Remove focus styles
    document.body.classList.remove('echolens-focused');
  }

  showFocusComplete() {
    this.showNotification('✅ Focus Session Complete!', 'Great work! Take a short break.');
  }

  showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'echolens-notification';
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
    if (!this.isActive) return;
    
    const context = this.extractPageContext();
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'CONTEXT_UPDATE',
      data: context
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
    // Create the floating memory icon
    const overlay = document.createElement('div');
    overlay.id = 'echolens-overlay';
    overlay.innerHTML = `
      <div class="echolens-icon" title="EchoLens Memory">
        💫
      </div>
      <div class="echolens-popup" style="display: none;">
        <div class="echolens-popup-content">
          <div class="echolens-loading">Loading memories...</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Toggle popup on click
    const icon = overlay.querySelector('.echolens-icon');
    const popup = overlay.querySelector('.echolens-popup');
    
    icon.addEventListener('click', () => {
      const isVisible = popup.style.display !== 'none';
      popup.style.display = isVisible ? 'none' : 'block';
    });
  }

  showMemoryOverlay(context) {
    const popup = document.querySelector('.echolens-popup-content');
    if (!popup) return;
    
    const { visits, lastVisit, totalTimeSpent, highlights, tags } = context;
    
    let html = '<div class="echolens-memory">';
    
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
          This is your first time here. EchoLens is capturing context...
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
