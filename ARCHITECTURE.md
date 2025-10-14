# 🌌 EchoLens - Project Architecture

Deep dive into the technical architecture of EchoLens.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Content    │  │    Popup     │  │  Dashboard   │    │
│  │   Script     │  │      UI      │  │   (Full)     │    │
│  │              │  │              │  │              │    │
│  │ • Captures   │  │ • Stats      │  │ • Map View   │    │
│  │ • Tracks     │  │ • Recent     │  │ • Timeline   │    │
│  │ • Overlays   │  │ • Current    │  │ • Search     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                               │
│                    ┌───────▼────────┐                      │
│                    │   Background   │                      │
│                    │  Service Worker│                      │
│                    │                │                      │
│                    │ • Storage Mgmt │                      │
│                    │ • AI Processor │                      │
│                    │ • Data Sync    │                      │
│                    └───────┬────────┘                      │
│                            │                               │
└────────────────────────────┼───────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Chrome Storage  │
                    │   (Local/Sync)   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Backend API    │
                    │   (Express.js)   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │    MongoDB       │
                    │   (Database)     │
                    └──────────────────┘
```

---

## 📦 Component Breakdown

### 1. Content Script (`src/content/`)

**Purpose:** Runs on every webpage, captures context

**Key Features:**
- Page visit tracking
- Reading time calculation
- Text highlight detection
- Scroll depth monitoring
- User interaction tracking
- Memory overlay injection

**Data Flow:**
```
Page Load → Context Capture → Background Worker → Storage
     ↓
User Highlights → Save → Background → Storage
     ↓
Page Revisit → Fetch Previous Context → Show Overlay
```

**Files:**
- `content.js` - Main capture logic
- `content.css` - Overlay styling

---

### 2. Background Service Worker (`src/background/`)

**Purpose:** Central data processor and coordinator

**Key Features:**
- Message routing between components
- Data persistence management
- AI processing orchestration
- Tab lifecycle management
- Periodic cleanup tasks

**Architecture:**
```javascript
BackgroundWorker
├── StorageManager (storage.js)
│   ├── Chrome Storage API
│   ├── Data indexing
│   └── Export/Import
├── AIProcessor (ai-processor.js)
│   ├── OpenAI Integration
│   ├── Anthropic Integration
│   └── Fallback processing
└── Session Management
    ├── Active sessions
    └── Tab tracking
```

**Files:**
- `background.js` - Main service worker
- `storage.js` - Storage abstraction layer
- `ai-processor.js` - AI integration

---

### 3. Popup UI (`src/popup/`)

**Purpose:** Quick access extension interface

**Layout:**
```
┌─────────────────────────┐
│   🌌 EchoLens          │
│   Your Digital Memory   │
├─────────────────────────┤
│ [Overview] [This Page]  │
├─────────────────────────┤
│  📊 Stats Grid          │
│  ┌─────┐ ┌─────┐       │
│  │ 42  │ │ 5h  │       │
│  │Sites│ │Time │       │
│  └─────┘ └─────┘       │
├─────────────────────────┤
│  📅 Recent Memories     │
│  • Memory 1             │
│  • Memory 2             │
│  • Memory 3             │
├─────────────────────────┤
│ [Open Dashboard]        │
└─────────────────────────┘
```

**Components:**
- `Popup.jsx` - Main component
- Stats overview
- Recent memories list
- Current page context

---

### 4. Dashboard (`src/dashboard/`)

**Purpose:** Full-featured memory exploration

**Views:**

#### Knowledge Map (Force Graph)
- D3.js force-directed graph
- Nodes: Memory pages
- Edges: Tag relationships
- Color-coded by recency
- Interactive exploration

#### Memory List
- Card-based grid layout
- Filtering and sorting
- Rich previews
- Tag management

#### Timeline
- Chronological view
- Grouped by date
- Session details
- Highlight previews

**Component Structure:**
```
Dashboard.jsx
├── Header (SearchBar)
├── Sidebar (StatsOverview)
└── Main Content
    ├── KnowledgeMap.jsx
    ├── MemoryList.jsx
    └── MemoryTimeline.jsx
```

---

## 💾 Data Models

### Visit/Memory Object
```javascript
{
  url: String,
  title: String,
  domain: String,
  content: String (truncated),
  
  // Visit tracking
  visits: Number,
  totalTimeSpent: Number (seconds),
  firstVisit: Timestamp,
  lastVisit: Timestamp,
  
  // Session data
  sessions: [{
    timestamp: Timestamp,
    timeSpent: Number,
    scrollDepth: Number (0-100),
    interactions: Number,
    highlightCount: Number
  }],
  
  // Highlights
  highlights: [{
    text: String,
    timestamp: Timestamp,
    context: String (surrounding text)
  }],
  
  // AI Insights
  insights: {
    summary: String (1-2 sentences),
    topics: [String],
    tags: [String],
    aiGenerated: Boolean,
    timestamp: Timestamp
  },
  
  // User data
  tags: [String],
  notes: String
}
```

### Storage Structure
```
Chrome Storage Local:
├── echolens_visits: { [urlHash]: Visit }
├── echolens_highlights: { [urlHash]: Highlights[] }
├── echolens_insights: { [urlHash]: AIInsights }
├── echolens_tags: { [urlHash]: Tags[] }
└── echolens_settings: { apiKey, provider, ... }
```

---

## 🤖 AI Integration

### Flow Diagram
```
Content Capture
     ↓
Background Worker
     ↓
Time Threshold Met (30s+)
     ↓
AI Processor
     ↓
┌────────────────────┐
│  OpenAI / Anthropic│
│  API Call          │
└────────────────────┘
     ↓
Parse Response
     ↓
Store Insights
     ↓
Update UI
```

### AI Prompts

**Summary Generation:**
```
System: You are a concise summarizer.
User: Summarize this in 1-2 sentences: [content]
```

**Tag Prediction:**
```
System: Generate 3-5 relevant tags.
User: Title: [title]\nContent: [content]
```

**Topic Extraction:**
```
System: Extract 3-5 key topics or concepts.
User: [content]
```

### Fallback Strategy
When AI unavailable:
1. **Summary:** First 2 meaningful sentences
2. **Tags:** Keyword frequency analysis
3. **Topics:** Noun phrase extraction

---

## 🔄 State Management

### Message Passing Architecture

```
Content Script          Background Worker
      │                        │
      ├── CONTEXT_UPDATE ─────>│
      │                        ├── Process
      │                        ├── Store
      │                        │
      ├── SAVE_HIGHLIGHT ─────>│
      │                        ├── Store
      │                        │
      ├── GET_PREVIOUS_CONTEXT>│
      │<─── Context Data ──────┤
      │                        │
Popup/Dashboard               │
      │                        │
      ├── GET_MEMORIES ───────>│
      │<─── Memories[] ────────┤
      │                        │
      ├── SEARCH_MEMORIES ────>│
      │<─── Results[] ─────────┤
      │                        │
      ├── GET_STATS ──────────>│
      │<─── Stats ─────────────┤
```

---

## 🎨 Styling Architecture

### Design System

**Colors:**
```css
--echo-purple: #6366f1;    /* Primary */
--echo-blue: #3b82f6;      /* Secondary */
--echo-cyan: #06b6d4;      /* Accent */
--echo-dark: #0a0e27;      /* Background */
--echo-gray: #64748b;      /* Muted */
--echo-light: #f1f5f9;     /* Text */
```

**Typography:**
```css
--font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
--font-size-xs: 11px;
--font-size-sm: 13px;
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-xl: 20px;
```

**Spacing:**
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64px

**Effects:**
```css
/* Glassmorphism */
background: rgba(15, 23, 42, 0.9);
backdrop-filter: blur(12px);

/* Glow */
box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);

/* Gradient */
background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
```

---

## 🔐 Security Considerations

### Data Privacy
- All data stored locally by default
- Optional cloud sync with user consent
- No analytics or tracking
- User controls all data

### API Keys
- Stored in Chrome storage (encrypted)
- Never sent to third parties
- User can clear anytime

### Content Access
- Minimal permissions requested
- Only accesses visible content
- No password or form data captured

---

## 📊 Performance Optimization

### Content Script
- Lazy initialization
- Debounced scroll tracking
- Throttled event handlers
- Idle time detection

### Background Worker
- Message batching
- Periodic cleanup
- Indexed data access
- Async operations

### UI Rendering
- Virtual scrolling (large lists)
- Lazy loading images
- Memoized components
- Optimized re-renders

---

## 🚀 Deployment

### Extension Build
```bash
npm run build
# Creates optimized dist/ folder
# Ready for Chrome Web Store
```

### Backend Deploy
```bash
# Option 1: PM2
pm2 start ecosystem.config.js

# Option 2: Docker
docker-compose up -d

# Option 3: Cloud (Heroku, Vercel, etc.)
# See deployment guides
```

---

## 🧪 Testing Strategy

### Unit Tests (Future)
- Storage manager
- AI processor
- Utility functions

### Integration Tests
- Message passing
- Data persistence
- UI interactions

### E2E Tests
- Extension workflow
- Dashboard navigation
- Data sync

---

## 📈 Scalability

### Current Limits
- Chrome Storage: 5MB (local), 100KB (sync)
- Solution: Backend sync for Pro users

### Future Enhancements
- IndexedDB for local storage
- Pagination for large datasets
- Background sync API
- Service worker caching

---

## 🔮 Future Roadmap

### Phase 1 (MVP) - ✅ Complete
- Core capture functionality
- Basic UI
- Local storage
- AI integration

### Phase 2 (Enhancement)
- Mobile app
- Advanced search
- Export to Notion/Obsidian
- Team workspaces

### Phase 3 (Scale)
- Browser extension (Firefox, Edge)
- API for third-party integrations
- Advanced analytics
- Collaboration features

---

## 📚 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI components |
| | Tailwind CSS | Styling |
| | D3.js | Visualizations |
| | Force Graph | Knowledge map |
| **Extension** | Chrome APIs | Browser integration |
| | Webpack | Build system |
| | Babel | JS transpilation |
| **Backend** | Node.js | Server runtime |
| | Express | API framework |
| | MongoDB | Database |
| | Mongoose | ODM |
| **AI** | OpenAI API | Text summarization |
| | Anthropic API | Alternative LLM |
| **DevOps** | Git | Version control |
| | npm | Package manager |
| | PM2 | Process manager |

---

**This is a living document. As EchoLens evolves, so does its architecture.**
