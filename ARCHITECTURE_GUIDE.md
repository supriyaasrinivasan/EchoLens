# SupriAI - Quick Reference & Architecture Guide

**Last Updated**: October 17, 2025  
**Audience**: Developers & Contributors

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER CHROME EXTENSION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐    │
│  │   POPUP PAGE    │  │  DASHBOARD PAGE │  │ FOCUS BLOCK  │    │
│  │ (src/popup/)    │  │  (src/dashboard/)  │  (focus-block.│   │
│  │ Stats, Skills   │  │ 15+ Views,      │  │   html)      │    │
│  │ Timers, Themes  │  │ Analytics, Mgmt │  │ Timer, Stats │    │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘    │
│           │                    │                   │             │
│           └────────┬───────────┴───────────────────┘             │
│                    │                                              │
│        chrome.runtime.sendMessage()                              │
│                    ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    BACKGROUND SERVICE WORKER (background.js)             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • Message routing & handling                              │   │
│  │ • Database operations                                     │   │
│  │ • Tab tracking & monitoring                              │   │
│  │ • Focus mode management                                  │   │
│  │ • Module coordination                                    │   │
│  └────────┬────────────────────────┬──────────────┬─────────┘   │
│           │                        │              │              │
│           ▼                        ▼              ▼              │
│  ┌────────────────┐    ┌─────────────────┐ ┌──────────────┐   │
│  │  DB Manager    │    │  AI Processor   │ │  Personality │   │
│  │  (sql.js)      │    │  (OpenAI/       │ │  Engine      │   │
│  │                │    │   Anthropic)    │ │ (Weekly      │   │
│  │  Tables:       │    │                 │ │  snapshots)  │   │
│  │  - visits      │    │ • Summarize     │ └──────────────┘   │
│  │  - sessions    │    │ • Tagging       │ ┌──────────────┐   │
│  │  - highlights  │    │ • Insights      │ │ Skill        │   │
│  │  - insights    │    │                 │ │ Tracker      │   │
│  │  - tags        │    └─────────────────┘ │ • Detect     │   │
│  │  - personality │                        │ • Courses    │   │
│  │  - goals       │    ┌─────────────────┐ └──────────────┘   │
│  │  - skills      │    │ Other Modules   │ ┌──────────────┐   │
│  │  - etc.        │    │ • Goal          │ │ Learning     │   │
│  │                │    │   Alignment     │ │ Analytics    │   │
│  │ Storage:       │    │ • Digital Twin  │ │ • Sessions   │   │
│  │ Chrome Local   │    │ • Mindfulness   │ │ • Paths      │   │
│  │                │    │ • Premium Feat. │ │ • Insights   │   │
│  └────────┬───────┘    └─────────────────┘ └──────────────┘   │
│           │                                                      │
│           └─────────────────────────────────────────────┐       │
│                                                         │       │
│  ┌───────────────────────────────────────────────────┐ │       │
│  │  CONTENT SCRIPT (content.js)                       │ │       │
│  │  • Inject on all websites                          │ │       │
│  │ • Track scroll depth, highlights, interactions     │ │       │
│  │ • Detect focus mode                                │ │       │
│  │ • Send context to background                       │ │       │
│  └───────────────────────────────────────────────────┘ │       │
│                                                         │       │
└─────────────────────────────────────────────────────────┘       │
                              │                                    │
                              │ HTTP REST Calls                    │
                              ▼                                    │
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND SERVER (Node.js/Express)               │
├─────────────────────────────────────────────────────────────────┤
│  Port: 3000                                                     │
│  • /api/auth/* - Authentication                                │
│  • /api/users/* - User management                              │
│  • /api/memories/* - Memory CRUD                               │
│  • /api/search - Full-text search                              │
│  • /api/stats - Aggregated stats                               │
│  • /api/sync - Bulk sync                                       │
│  • /health - Health check                                      │
└────────────────────┬─────────────────────────────────────────────┘
                     │ Mongoose ODM
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS (Cloud)                         │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                   │
│  • users - User accounts and settings                           │
│  • memories - Browsing history and insights                    │
│  • Remote backup of extension data                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure Reference

```
supriai/
├── src/
│   ├── popup/                           # Popup window (380x600)
│   │   ├── Popup.jsx                   # Main component (stats, skills, focus)
│   │   ├── index.jsx                   # Entry point
│   │   ├── popup.html                  # HTML template
│   │   └── popup.css                   # Tailwind + custom styles
│   │
│   ├── dashboard/                       # Full dashboard (100vw x 100vh)
│   │   ├── Dashboard.jsx               # Main container (view switching)
│   │   ├── index.jsx                   # Entry point
│   │   ├── dashboard.html              # HTML template
│   │   ├── dashboard.css               # Main styles
│   │   ├── theme.css                   # CSS variables (colors, spacing)
│   │   ├── personasync.css             # Personality feature styles
│   │   ├── learning-analytics.css      # Learning view styles
│   │   ├── mindfulness.css             # Mindfulness view styles
│   │   ├── dashboard-enhancements.css  # New features styles
│   │   │
│   │   └── components/                 # All dashboard views
│   │       ├── MindSyncDashboard.jsx         # Homepage (trending, mood)
│   │       ├── PersonalitySnapshots.jsx      # Weekly personality
│   │       ├── InterestEvolutionTimeline.jsx # Timeline visualization
│   │       ├── KnowledgeMap.jsx              # Graph visualization
│   │       ├── MemoryList.jsx                # Memory browser
│   │       ├── MemoryTimeline.jsx            # Timeline view
│   │       ├── StatsOverview.jsx             # Statistics
│   │       ├── InsightsPanel.jsx             # AI insights
│   │       ├── SearchBar.jsx                 # Search UI
│   │       ├── GoalsManager.jsx              # Goal tracking
│   │       ├── DigitalTwin.jsx               # Digital personality
│   │       ├── SkillsDashboard.jsx           # Skill management
│   │       ├── AchievementsDashboard.jsx     # Achievements
│   │       ├── ProgressAnalyticsDashboard.jsx# Progress tracking
│   │       ├── MindfulnessDashboard.jsx      # Mindfulness features
│   │       ├── LearningAnalyticsDashboard.jsx# Learning analytics
│   │       ├── EchoLenzIntro.jsx             # Welcome screen
│   │       ├── ErrorBoundary.jsx             # Error handling
│   │       └── KnowledgeMapFallback.jsx      # Fallback UI
│   │
│   ├── background/                       # Service Worker (core engine)
│   │   ├── background.js                # Main handler (1389 lines)
│   │   ├── db-manager.js                # SQLite operations (1302 lines)
│   │   ├── ai-processor.js              # AI integration (365 lines)
│   │   ├── personality-engine.js        # Personality analysis
│   │   ├── goal-alignment.js            # Goal tracking
│   │   ├── digital-twin.js              # Digital personality
│   │   ├── skill-tracker.js             # Skill detection & tracking
│   │   ├── learning-analytics.js        # Learning patterns (687 lines)
│   │   ├── mindfulness-engine.js        # Wellness features
│   │   ├── achievement-system.js        # Gamification
│   │   ├── premium-features.js          # Premium tier management
│   │   ├── progress-analytics.js        # Progress metrics
│   │   ├── recommendation-engine.js     # AI recommendations
│   │   ├── collaboration.js             # Team features
│   │   └── visual-export.js             # Export functionality
│   │
│   ├── content/                          # Content Script (injected on all sites)
│   │   ├── content.js                   # Main tracker (457 lines)
│   │   └── content.css                  # Focus mode + overlay styles
│   │
│   └── shared/
│       └── utils.js                      # Shared utilities
│
├── server/                              # Backend API
│   ├── index.js                         # Express server + routes
│   ├── README.md                        # Backend documentation
│   └── .env.example                     # Environment template
│
├── manifest.json                        # Extension manifest (v3)
├── webpack.config.js                   # Build configuration
├── tailwind.config.js                  # Tailwind customization
├── .babelrc                             # Babel transpilation
├── package.json                         # Dependencies
├── ecosystem.config.js                 # PM2 configuration
├── focus-block.html                    # Focus mode blocker page
│
├── VERIFICATION_REPORT.md               # Comprehensive verification ✅
├── CRITICAL_FIXES_REQUIRED.md          # Security fixes needed ⚠️
└── dist/                               # Build output (auto-generated)
```

---

## 🔄 Message Flow Examples

### Getting Stats from Popup

```javascript
// 1. Popup sends message
chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
  if (response?.stats) {
    setStats(response.stats);
  }
});

// 2. Background receives
case 'GET_STATS':
  const stats = await this.getStats();
  sendResponse({ stats });
  break;

// 3. Background queries DB
async getStats() {
  const stats = await this.db.getStats();
  return stats;
}

// 4. DB Manager executes SQL
async getStats() {
  const result = this.db.exec(`
    SELECT 
      COUNT(*) as totalVisits,
      SUM(total_time_spent) as totalTimeSpent,
      COUNT(DISTINCT url) as totalMemories
    FROM visits
  `);
  return result[0].values[0];
}

// 5. Response returns to popup
setStats({
  totalVisits: 450,
  totalTimeSpent: 12345,
  totalMemories: 150
});
```

### Adding a Skill from Popup

```javascript
// 1. User clicks "Add Skill"
const resp = await sendMessage({ 
  type: 'ADD_CUSTOM_SKILL', 
  data: { name: 'React' } 
});

// 2. Background receives
case 'ADD_CUSTOM_SKILL':
  const result = await this.skillTracker.addCustomSkill(data.name);
  sendResponse({ success: true, skill: result });
  break;

// 3. Skill Tracker adds to DB
async addCustomSkill(name) {
  const skill = {
    name,
    custom: true,
    created_at: Date.now()
  };
  await this.db.saveSkill(skill);
  return skill;
}

// 4. Popup refreshes skill list
await loadData();
```

### Content Script Detecting Focus Mode

```javascript
// 1. Background starts focus mode
case 'START_FOCUS_MODE':
  await this.startFocusMode(data.duration);
  // Broadcasts to all tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'FOCUS_MODE_ACTIVATED',
        duration: data.duration
      });
    });
  });
  break;

// 2. Content Script receives
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FOCUS_MODE_ACTIVATED') {
    this.activateFocusMode(message.duration);
    sendResponse({ success: true });
  }
});

// 3. Content Script shows overlay
activateFocusMode(duration) {
  const focusOverlay = document.createElement('div');
  focusOverlay.className = 'supriai-focus-mode';
  // Creates banner with timer...
  document.body.appendChild(focusOverlay);
}
```

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Production build
npm run build

# Run backend server
npm run server

# Run backend with auto-restart (development)
npm run server:dev

# Start with PM2 (production)
pm2 start ecosystem.config.js

# Load extension in Chrome
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select dist/ folder
```

---

## 📊 Database Query Examples

### Get Top 10 Memories by Visits

```javascript
const result = db.exec(`
  SELECT url, title, visit_count, total_time_spent, last_visit
  FROM visits
  WHERE visit_count > 0
  ORDER BY visit_count DESC
  LIMIT 10
`);
```

### Get Weekly Personality Snapshot

```javascript
const result = db.exec(`
  SELECT tone, top_topics, reading_habits, emotional_themes, summary
  FROM personality_snapshots
  WHERE week_start >= ? AND week_end <= ?
  ORDER BY week_end DESC
  LIMIT 1
`, [startDate, endDate]);
```

### Search Highlights by Text

```javascript
const result = db.exec(`
  SELECT h.text, h.timestamp, v.title, v.url
  FROM highlights h
  JOIN visits v ON h.visit_id = v.id
  WHERE h.text LIKE ?
  ORDER BY h.timestamp DESC
`, [`%${query}%`]);
```

### Get Skill Activity Stats

```javascript
const result = db.exec(`
  SELECT 
    skill,
    COUNT(*) as activity_count,
    SUM(time_spent) as total_time,
    AVG(xp) as avg_xp
  FROM skill_activities
  GROUP BY skill
  ORDER BY activity_count DESC
`);
```

---

## 🔑 API Endpoints Reference

### Authentication (🔐 Required for v2)
```
POST   /api/auth/register      - Create account
POST   /api/auth/login         - Login and get JWT
POST   /api/auth/refresh       - Refresh token
POST   /api/auth/logout        - Logout
```

### User Management
```
GET    /api/users/:userId      - Get profile
PUT    /api/users/:userId      - Update profile
PUT    /api/users/:userId/settings - Update settings
DELETE /api/users/:userId      - Delete account
```

### Memories
```
POST   /api/memories           - Create memory
GET    /api/memories           - List memories (paginated)
GET    /api/memories/:id       - Get specific memory
PUT    /api/memories/:id       - Update memory
DELETE /api/memories/:id       - Delete memory
```

### Search & Stats
```
GET    /api/memories/search    - Full-text search
GET    /api/stats/:userId      - Get user stats
POST   /api/sync               - Bulk sync
```

### Server Info
```
GET    /health                 - Health check
GET    /api                    - API documentation
```

---

## 🎨 CSS Variables (theme.css)

```css
/* Colors */
--brand-primary: #6366f1
--brand-secondary: #ec4899
--bg-primary: #0a0e27
--bg-secondary: #1a1f3a
--card-bg: #15192b
--text-primary: #f1f5f9
--text-secondary: #cbd5e1
--text-tertiary: #94a3b8
--border-primary: #334155
--border-secondary: #475569

/* Spacing */
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.2)
```

---

## ⚙️ Environment Variables

### Extension (.env not used in extension)
- Loaded from `chrome.storage.sync`
- Store API keys securely

### Backend (.env)
```
MONGODB_URI=mongodb://user:pass@cluster.mongodb.net/supriai
PORT=3000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
LOG_LEVEL=info
```

---

## 🧪 Testing Checklist

- [ ] Popup loads within 500ms
- [ ] Dashboard loads within 1s
- [ ] Search returns results instantly
- [ ] Skills add/delete works smoothly
- [ ] Focus mode activates correctly
- [ ] Stats update in real-time
- [ ] Theme toggles without flicker
- [ ] Data persists after browser restart
- [ ] API calls handle errors gracefully
- [ ] Database doesn't exceed size limits

---

## 🚀 Deployment Checklist

- [ ] Backend security fixes applied
- [ ] All API endpoints tested
- [ ] Database indexes optimized
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] HTTPS configured
- [ ] Monitoring setup
- [ ] Backup procedures in place
- [ ] Documentation complete
- [ ] CI/CD pipeline ready

---

## 📖 Additional Resources

- **Chrome Extension API**: https://developer.chrome.com/docs/extensions/
- **Manifest V3**: https://developer.chrome.com/docs/extensions/mv3/
- **React Documentation**: https://react.dev
- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Tailwind CSS**: https://tailwindcss.com

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: Run `npm install` and restart dev server

### Issue: Popup not loading
**Solution**: Check manifest.json permissions, verify webpack build

### Issue: Database errors
**Solution**: Check Chrome storage space, clear cache, check SQLite schema

### Issue: API calls timing out
**Solution**: Check backend server running, verify MongoDB connection

### Issue: Styles not applying
**Solution**: Check Tailwind build, verify CSS imports, clear cache

---

**Last Updated**: October 17, 2025  
**Maintainer**: GitHub Copilot  
**Version**: 2.0.0
