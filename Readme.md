# SupriAI 🪞

**Your AI Mirror — Track how your digital identity evolves**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/supriyaasrinivasan/EchoLens)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-orange.svg)](https://chrome.google.com/webstore)

SupriAI is an intelligent Chrome extension that combines advanced memory tracking with personality insights, transforming your browsing experience into a journey of self-awareness. It's not just about remembering what you've seen - it's about understanding who you're becoming through your digital journey.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Core Components](#-core-components)
- [API Integration](#-api-integration)
- [Use Cases](#-use-cases)
- [Development](#-development)
- [Privacy & Security](#-privacy--security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

### What is SupriAI?

SupriAI evolved from **EchoLens** to become more than just a memory tool—it's now your **digital self-awareness engine**. We leave fragments of our personality everywhere online through our searches, likes, and curiosities. SupriAI tracks how your digital identity evolves—your interests, tone, learning patterns, and emotional energy—and transforms it into a living profile that grows with you.

**Think of it as an AI mirror for your browsing habits.**

### The Philosophy

> **EchoLens remembered what you saw.**  
> **SupriAI remembers who you became because of it.**

We're not just consumers of information—we're evolving thinkers, and our browsing habits tell that story. SupriAI bridges memory, identity, and intent to create a mindful browsing experience.

---

## ✨ Key Features

### 🪞 1. Personality Reflection Engine

Generates weekly **identity snapshots** that summarize your:
- **Tone & Voice**: Analytical, reflective, optimistic, curious, etc.
- **Favorite Topics**: What you've been exploring most
- **Reading Habits**: Patterns in content consumption
- **Emotional Themes**: Underlying emotions in your browsing

**Example Output:**
> "This week, your reading leaned toward AI ethics, self-growth, and nostalgic design.  
> Your tone: analytical, reflective, mildly optimistic."

**Technical Implementation:**
- AI-powered content analysis using OpenAI GPT models
- Sentiment analysis for emotional theme detection
- Temporal aggregation of browsing patterns
- Tone classification based on content semantics

---

### 🔄 2. Interest Evolution Timeline

Visual, interactive timeline showing how your passions shift over time:

```
Machine Learning → AI Storytelling → Ethical Design → Web3 Philosophy
     (Jan)             (Feb)             (Mar)            (Apr)
```

**Features:**
- Bubble visualization with pulse animations
- Historical interest tracking
- Trend detection algorithms
- Month-over-month comparison
- Interest emergence and fade patterns

**Technical Implementation:**
- D3.js for timeline visualization
- Topic clustering and frequency analysis
- Time-series data aggregation
- Interactive hover states and drill-downs

---

### 📈 3. MindSync Dashboard

Your central hub for digital self-awareness:

#### Dashboard Components:

**Trending Interests Panel**
- Real-time topic tracking
- Rising vs. fading interests
- Category distribution charts

**Weekly Mood Summary**
- Sentiment analysis aggregation
- Emotional pattern visualization
- Mood timeline with daily granularity

**Quote of the Week**
- AI-generated personalized quotes
- Matches your current vibe and interests
- Inspirational and reflective

**Goal Alignment Tracker**
- Visual progress bars
- Time spent on goal-related content
- Achievement milestones
- Weekly alignment percentage

**Knowledge Map**
- Force-directed graph of browsing history
- Node clustering by topic similarity
- Interactive exploration of connections
- Search and filter capabilities

**Technical Implementation:**
- React-based modular component architecture
- Real-time data synchronization with background scripts
- LocalStorage and IndexedDB for persistence
- Responsive design with Tailwind CSS

---

### 🎯 4. Goal Alignment AI

Intelligent goal tracking with gentle, non-judgmental nudges:

#### How It Works:

1. **Set Intentional Goals**
   ```javascript
   Goal: "Learn React.js"
   Keywords: ["react", "jsx", "hooks", "components"]
   Target: 10 hours/month
   ```

2. **Background Monitoring**
   - Tracks content alignment with goals
   - Measures time spent on goal-related pages
   - Detects drift from objectives

3. **Smart Nudging**
   - Only nudges when appropriate (after 5+ minutes of unaligned browsing)
   - Respects cooldown periods (1 hour minimum)
   - Multiple nudge styles: gentle, encouraging, motivating, curious

**Example Nudge:**
> 🧘 **Mindful Moment**  
> "You've spent 23 minutes here. Still working on 'Learn React'?"

**Technical Implementation:**
- Keyword matching algorithms
- Time-based session tracking
- Priority-based goal weighting
- Configurable nudge frequency
- Progress calculation and visualization

---

### 🌈 5. Digital Twin AI

Your AI reflection—trained on your browsing patterns, interests, and personality:

#### What You Can Ask:

- "What would I have thought about NFTs last year?"
- "What topics have I been avoiding lately?"
- "How has my interest in AI evolved?"
- "What are my dominant emotional patterns?"
- "Am I more optimistic now than 3 months ago?"

#### How It Works:

1. **Data Collection**
   - Topics, tone, emotions, timestamps
   - Browsing patterns and peak hours
   - Content preferences and categories

2. **Profile Building**
   - Interest history aggregation
   - Tone pattern recognition
   - Emotional theme clustering
   - Behavioral pattern analysis

3. **AI Inference**
   - Uses GPT-4 for complex reasoning
   - Context-aware responses
   - Confidence scoring based on data quantity
   - Personality-matched communication style

**Technical Implementation:**
- Continuous profile updates with each visit
- Historical data retention and indexing
- GPT-4 API integration with custom prompts
- Fallback responses when API unavailable
- Confidence metrics based on data maturity

---

### 📚 6. Memory Layer (from EchoLens)

Core browsing memory capabilities:

**Knowledge Map**
- Visual network graph of visited pages
- Topic-based node clustering
- Relationship strength indicators
- Interactive navigation

**Smart Search**
- Semantic search across browsing history
- Keyword and natural language queries
- Fuzzy matching for imprecise searches
- Filter by date, topic, or sentiment

**Highlights System**
- Text selection and saving
- Organized by page and topic
- Searchable highlights database
- Export capabilities

**AI-Generated Summaries**
- Automatic page summarization
- Key point extraction
- Quick overview generation
- Summary caching for performance

**Context Awareness**
- Visit history per page
- Time spent tracking
- Related pages suggestions
- Reading progress indicators

---

## 🏗️ Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────┐
│                     Chrome Browser                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Content    │    │   Popup      │    │  Dashboard   │     │
│  │   Script     │    │   UI         │    │  (React)     │     │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘     │
│         │                                         │           │
│         └─────────────────┬───────────────────────┘           │
│                           │                                   │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │           Background Service Worker                     │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  ┌───────────────┐  ┌────────────────┐  ┌───────────┐   │  │
│  │  │ AI Processor  │  │ Personality    │  │ Digital   │   │  │
│  │  │               │  │ Engine         │  │ Twin      │   │  │
│  │  └───────────────┘  └────────────────┘  └───────────┘   │  │
│  │  ┌───────────────┐  ┌────────────────┐  ┌───────────┐   │  │
│  │  │ Goal          │  │ DB Manager     │  │ Utils     │   │  │
│  │  │ Alignment     │  │ (SQLite)       │  │           │   │  │
│  │  └───────────────┘  └────────────────┘  └───────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │          Storage Layer (Chrome Storage + SQLite)        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
               ┌────────────────────────┐
               │   External APIs        │
               │  - OpenAI GPT-3.5/4    │
               │  - (Optional) Anthropic│
               └────────────────────────┘
```

### Component Interaction Flow

1. **Content Capture**
   ```
   User Browses → Content Script → Extract Page Data → Send to Background
   ```

2. **AI Processing**
   ```
   Background Receives → AI Processor → Generate Summary/Topics/Sentiment
   ```

3. **Profile Update**
   ```
   AI Results → Personality Engine → Update Digital Twin → Store in DB
   ```

4. **Goal Checking**
   ```
   Page Data → Goal Alignment AI → Check Keywords → Generate Nudge (if needed)
   ```

5. **Dashboard Display**
   ```
   User Opens Dashboard → Query DB → Aggregate Data → Render Visualizations
   ```

---

## 💼 Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework for dashboard and popup | 18.2.0 |
| **Tailwind CSS** | Utility-first styling | 3.3.5 |
| **Lucide React** | Icon library | 0.292.0 |
| **Remix Icon** | Additional icons | 4.7.0 |
| **D3.js** | Data visualization for timeline & graphs | 7.8.5 |
| **React Force Graph 2D** | Knowledge map visualization | 1.25.4 |
| **date-fns** | Date manipulation and formatting | 2.30.0 |

### Backend & Processing

| Technology | Purpose | Version |
|------------|---------|---------|
| **Chrome Extensions API (Manifest V3)** | Browser integration | - |
| **Service Workers** | Background processing | - |
| **SQLite (sql.js)** | Local database (WASM) | 1.13.0 |
| **IndexedDB** | Additional client-side storage | - |
| **Chrome Storage API** | Extension settings & small data | - |

### AI & External Services

| Service | Purpose | Usage |
|---------|---------|-------|
| **OpenAI API** | GPT-3.5 for summaries, topics, sentiment | Primary |
| **OpenAI GPT-4** | Digital Twin complex reasoning | Premium feature |
| **Anthropic Claude** | Alternative AI provider (optional) | Optional |

### Build Tools

| Tool | Purpose | Version |
|------|---------|---------|
| **Webpack** | Module bundling | 5.89.0 |
| **Babel** | JavaScript transpilation | 7.23.0 |
| **PostCSS** | CSS processing | 8.4.31 |
| **Autoprefixer** | CSS vendor prefixes | 10.4.16 |
| **Terser** | JavaScript minification | 5.3.14 |

### Development

| Tool | Purpose | Version |
|------|---------|---------|
| **Node.js** | Runtime environment | - |
| **Express** | Optional local server | 4.18.2 |
| **Nodemon** | Development auto-reload | 3.0.1 |
| **PM2** | Process management (ecosystem.config.js) | - |

---

## 📦 Installation

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Google Chrome** (or Chromium-based browser)
- **OpenAI API Key** (optional but recommended)

### Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/supriyaasrinivasan/EchoLens.git
   cd EchoLens
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   # Production build
   npm run build

   # Development build with watch mode
   npm run dev
   ```

4. **Load in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `dist` folder from the project directory

5. **Configure API Key** (Optional)
   - Click the SupriAI extension icon
   - Go to Settings → AI Configuration
   - Enter your OpenAI API key
   - Save settings

### Optional: Run Local Server

```bash
# Start Express server for additional features
npm run server

# Development mode with auto-reload
npm run server:dev
```

---

## 📘 Usage Guide

### First-Time Setup

1. **Install & Pin Extension**
   - After loading, pin SupriAI to your Chrome toolbar
   - Click the icon to open the popup

2. **Set Up AI (Recommended)**
   - Obtain an API key from [OpenAI Platform](https://platform.openai.com/)
   - Enter it in Settings → AI Configuration
   - Choose provider: OpenAI (recommended) or Anthropic

3. **Define Your Goals** (Optional)
   - Open Dashboard → Goals tab
   - Click "Add New Goal"
   - Example:
     ```
     Title: Learn React
     Description: Master React fundamentals for web development
     Keywords: react, jsx, hooks, components, state
     Target: 10 hours this month
     Priority: High
     ```

### Daily Usage

**Passive Tracking**
- SupriAI runs automatically in the background
- Content is analyzed as you browse
- No manual intervention needed

**Active Exploration**
- Open Dashboard (click extension icon → "Open Dashboard")
- Explore visualizations:
  - Knowledge Map: See connections between topics
  - Interest Timeline: Track evolution over time
  - Personality Snapshots: Review weekly reports
  - Goal Progress: Monitor alignment

**Digital Twin Interaction**
- Navigate to Dashboard → Digital Twin tab
- Ask questions about your browsing history
- Example queries:
  - "What were my top interests last month?"
  - "How has my reading tone changed?"
  - "Am I spending more time on learning or entertainment?"

**Search Your History**
- Use the Search Bar in Dashboard
- Natural language or keywords
- Filter by date, topic, or tags

### Weekly Workflow

**Monday Morning**
- Check your Weekly Snapshot
- Review the Quote of the Week
- Set or adjust goals for the week

**Throughout the Week**
- Respond to gentle nudges when you drift
- Highlight important passages (select text → click highlight icon)
- Check trending interests to stay aware

**Sunday Evening**
- Review Goal Progress
- Explore Interest Evolution
- Reflect on your Digital Twin insights

---

## 🧩 Core Components

### Background Scripts

#### 1. **background.js**
Main service worker orchestrating all background operations.

**Responsibilities:**
- Listen for page visits and content changes
- Coordinate between components
- Handle Chrome API events
- Manage alarms for scheduled tasks

**Key Functions:**
```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Trigger content analysis
  }
});

chrome.alarms.create('weeklySnapshot', { periodInMinutes: 10080 }); // Weekly
```

#### 2. **ai-processor.js**
Handles all AI-related operations.

**Capabilities:**
- Content summarization (GPT-3.5)
- Topic extraction and tagging
- Sentiment analysis
- Emotional theme detection
- Provider switching (OpenAI/Anthropic)

**Methods:**
```javascript
async generateSummary(content)
async predictTags(content, title)
async extractTopics(content)
async analyzeSentiment(content)
```

#### 3. **personality-engine.js**
Generates personality insights and weekly snapshots.

**Capabilities:**
- Weekly snapshot generation
- Tone analysis
- Emotional theme detection
- Weekly quote generation
- Interest evolution calculation
- Trending interests detection

**Methods:**
```javascript
async generateWeeklySnapshot(weeklyData)
async analyzeTone(content)
async detectEmotionalThemes(content)
async generateWeeklyQuote(snapshot)
calculateInterestEvolution(historicalData)
detectTrendingInterests(currentWeek, previousWeeks)
```

#### 4. **digital-twin.js**
Manages the Digital Twin AI profile.

**Capabilities:**
- Profile building and updates
- Question answering (GPT-4)
- Historical comparison
- Interest prediction
- Confidence calculation

**Methods:**
```javascript
async updateTwin(data)
async askTwin(question)
getTwinSummary()
compareWithPast(periodDaysAgo)
predictFutureInterests()
```

#### 5. **goal-alignment.js**
Tracks goals and generates nudges.

**Capabilities:**
- Goal CRUD operations
- Content alignment checking
- Smart nudge generation
- Progress tracking
- Weekly insights

**Methods:**
```javascript
async addGoal(goal)
async checkAlignment(url, title, content, timeSpent)
generateNudge(currentActivity, timeSpent)
getGoalProgress()
getWeeklyInsights()
```

#### 6. **db-manager.js**
Manages SQLite database operations.

**Responsibilities:**
- Initialize sql.js WASM
- Create/migrate database schema
- CRUD operations for visits, highlights, topics
- Query optimization
- Data export/import

**Schema:**
```sql
CREATE TABLE visits (
  id INTEGER PRIMARY KEY,
  url TEXT,
  title TEXT,
  summary TEXT,
  content TEXT,
  timestamp INTEGER,
  duration INTEGER
);

CREATE TABLE topics (
  id INTEGER PRIMARY KEY,
  visit_id INTEGER,
  topic TEXT,
  confidence REAL
);

CREATE TABLE highlights (
  id INTEGER PRIMARY KEY,
  visit_id INTEGER,
  text TEXT,
  timestamp INTEGER
);

CREATE TABLE snapshots (
  id INTEGER PRIMARY KEY,
  week_start INTEGER,
  week_end INTEGER,
  data TEXT
);
```

### Frontend Components

#### Dashboard Components (React)

**MindSyncDashboard.jsx**
- Main dashboard container
- Tab navigation
- Data aggregation
- State management

**PersonalitySnapshots.jsx**
- Weekly snapshot display
- Quote of the week
- Tone visualization
- Emotional themes chart

**InterestEvolutionTimeline.jsx**
- D3.js timeline visualization
- Bubble animations
- Interactive tooltips
- Month-over-month comparison

**KnowledgeMap.jsx**
- Force-directed graph (react-force-graph-2d)
- Node clustering by topic
- Interactive zoom/pan
- Search and highlighting

**GoalsManager.jsx**
- Goal creation form
- Progress visualization
- Goal editing/deletion
- Alignment statistics

**DigitalTwin.jsx**
- Chat interface
- Question input
- Response display
- Confidence indicators

**InsightsPanel.jsx**
- Trending interests
- Weekly stats
- Mood summary
- Quick insights

**MemoryList.jsx**
- Browsing history list
- Filters and search
- Sort options
- Pagination

**SearchBar.jsx**
- Semantic search
- Autocomplete
- Filter chips
- Results preview

**StatsOverview.jsx**
- Total visits
- Time spent
- Top topics
- Activity heatmap

#### Popup Components

**Popup.jsx**
- Quick stats display
- Recent visits
- Active goals status
- Dashboard link

### Content Scripts

**content.js**
- Inject into all pages
- Extract page content (title, body text)
- Listen for text selection (highlights)
- Send data to background

**content.css**
- Styling for highlight overlays
- Tooltip styles
- Minimal visual footprint

---

## 🔌 API Integration

### OpenAI Integration

#### Configuration

```javascript
const apiKey = await chrome.storage.local.get('ai_api_key');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`
};
```

#### Models Used

**GPT-3.5-turbo** (Summaries, Topics, Sentiment)
```javascript
{
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: 'System prompt...' },
    { role: 'user', content: 'User content...' }
  ],
  max_tokens: 100,
  temperature: 0.5
}
```

**GPT-4** (Digital Twin)
```javascript
{
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are the user\'s digital twin...' },
    { role: 'user', content: question }
  ],
  max_tokens: 200,
  temperature: 0.7
}
```

#### Cost Optimization

- Caching summaries to avoid re-processing
- Content truncation before API calls
- Fallback to local processing when API unavailable
- User controls AI frequency in settings

#### Error Handling

```javascript
try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {...});
  const data = await response.json();
  return data.choices[0].message.content;
} catch (error) {
  console.error('API error:', error);
  return generateFallbackResponse(); // Local processing
}
```

---

## 💡 Use Cases

### 1. **For Students & Learners**

**Scenario:** Computer Science student learning web development

**How SupriAI Helps:**
- Tracks learning journey from HTML/CSS → JavaScript → React → Node.js
- Shows knowledge connections in the Knowledge Map
- Sets learning goals with time targets
- Reviews progress weekly
- Rediscovers forgotten resources via semantic search

**Outcome:** 
- 30% increase in focused learning time
- Better retention through visual connections
- Reduced time searching for "that article I read"

---

### 2. **For Researchers**

**Scenario:** PhD candidate researching AI ethics

**How SupriAI Helps:**
- Maps research across sub-domains (bias, fairness, transparency)
- Tracks reading patterns and citation trails
- Identifies knowledge gaps (topics browsed but not deeply explored)
- Exports highlights for literature reviews
- Digital Twin answers: "What did I learn about algorithmic fairness in March?"

**Outcome:**
- Comprehensive research map
- Faster literature review
- Serendipitous rediscovery of connections

---

### 3. **For Self-Improvement Enthusiasts**

**Scenario:** Professional seeking work-life balance and personal growth

**How SupriAI Helps:**
- Monitors emotional tone of browsing (stress indicators)
- Sets mindful browsing goals (less social media, more learning)
- Weekly snapshots reveal patterns (e.g., "You browse more negatively on Mondays")
- Gentle nudges prevent rabbit holes
- Tracks interest shifts toward healthier topics

**Outcome:**
- Increased self-awareness
- 40% reduction in aimless browsing
- Documented personal growth journey

---

### 4. **For Content Creators**

**Scenario:** Blogger looking for inspiration and tracking influences

**How SupriAI Helps:**
- Tracks inspiration sources automatically
- Interest evolution shows shifting creative focus
- Knowledge Map reveals unexpected connections
- Weekly snapshots inspire reflection posts ("My Week in Curiosity")
- Digital Twin: "What topics am I ignoring that could be interesting content?"

**Outcome:**
- Never forget inspiration sources
- Data-driven content ideas
- Authentic "behind-the-scenes" content

---

### 5. **For Career Changers**

**Scenario:** Marketing professional transitioning to UX Design

**How SupriAI Helps:**
- Sets clear learning goals (Figma, user research, prototyping)
- Tracks transition progress visually
- Interest timeline documents the journey
- Goal alignment keeps focus during the transition
- Digital Twin provides encouragement: "You've spent 52 hours on UX this month—great progress!"

**Outcome:**
- Structured, measurable transition
- Visual proof of progress for portfolio
- Maintained motivation through milestones

---

## 🛠️ Development

### Project Structure

```
SupriAI/
├── src/
│   ├── background/          # Service worker scripts
│   │   ├── background.js    # Main background script
│   │   ├── ai-processor.js  # AI operations
│   │   ├── personality-engine.js
│   │   ├── digital-twin.js
│   │   ├── goal-alignment.js
│   │   ├── db-manager.js
│   │   └── utils.js
│   ├── content/             # Content scripts
│   │   ├── content.js
│   │   └── content.css
│   ├── dashboard/           # Dashboard UI
│   │   ├── Dashboard.jsx
│   │   ├── index.jsx
│   │   ├── dashboard.html
│   │   ├── dashboard.css
│   │   └── components/      # React components
│   │       ├── MindSyncDashboard.jsx
│   │       ├── PersonalitySnapshots.jsx
│   │       ├── InterestEvolutionTimeline.jsx
│   │       ├── KnowledgeMap.jsx
│   │       ├── GoalsManager.jsx
│   │       ├── DigitalTwin.jsx
│   │       ├── InsightsPanel.jsx
│   │       ├── MemoryList.jsx
│   │       ├── SearchBar.jsx
│   │       └── StatsOverview.jsx
│   ├── popup/               # Extension popup
│   │   ├── Popup.jsx
│   │   ├── index.jsx
│   │   ├── popup.html
│   │   └── popup.css
│   └── shared/              # Shared utilities
│       └── utils.js
├── server/                  # Optional Express server
│   ├── index.js
│   └── README.md
├── Versions/                # Release history
│   ├── v_0.1/
│   ├── v_0.1.1/
│   └── v_0.2 - Working/
├── dist/                    # Build output (gitignored)
├── node_modules/            # Dependencies (gitignored)
├── manifest.json            # Extension manifest
├── package.json             # npm configuration
├── webpack.config.js        # Webpack build config
├── tailwind.config.js       # Tailwind CSS config
├── ecosystem.config.js      # PM2 process config
└── README.md                # This file
```

### Build System

**webpack.config.js** - Bundling configuration

**Entry Points:**
```javascript
entry: {
  popup: './src/popup/index.jsx',
  dashboard: './src/dashboard/index.jsx',
  content: './src/content/content.js',
  background: './src/background/background.js'
}
```

**Loaders:**
- **babel-loader**: Transpile JSX and ES6+
- **css-loader**: Process CSS imports
- **postcss-loader**: Apply Tailwind CSS
- **style-loader**: Inject styles

**Plugins:**
- **HtmlWebpackPlugin**: Generate HTML files
- **CopyPlugin**: Copy static assets and manifest
- **TerserPlugin**: Minify JavaScript (CSP-safe)

**CSP Compliance:**
- No `eval()` or `Function()` constructors
- Inline scripts avoided
- WASM allowed via `wasm-unsafe-eval`

### NPM Scripts

```json
{
  "dev": "webpack --mode development --watch",
  "build": "webpack --mode production",
  "server": "node server/index.js",
  "server:dev": "nodemon server/index.js"
}
```

### Development Workflow

1. **Make Changes**
   - Edit source files in `src/`
   - Use React DevTools for component debugging

2. **Rebuild**
   ```bash
   npm run dev  # Auto-rebuild on changes
   ```

3. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click reload button on SupriAI card
   - Or use extension auto-reloader

4. **Test**
   - Open developer tools on background page
   - Check console for errors
   - Test features in Dashboard

5. **Debug**
   - Background script: Right-click extension → "Inspect views: background page"
   - Dashboard: Right-click dashboard → "Inspect"
   - Content script: Inspect page → Console → Check content.js messages

### Adding New Features

**Example: Add a new AI insight**

1. **Update AI Processor** (`src/background/ai-processor.js`)
   ```javascript
   async generateNewInsight(content) {
     // Call OpenAI API with new prompt
   }
   ```

2. **Update Personality Engine** (`src/background/personality-engine.js`)
   ```javascript
   async integrateNewInsight(data) {
     const insight = await this.ai.generateNewInsight(data);
     // Store in profile
   }
   ```

3. **Create Dashboard Component** (`src/dashboard/components/NewInsight.jsx`)
   ```javascript
   export function NewInsight({ data }) {
     return <div>{/* Render insight */}</div>;
   }
   ```

4. **Add to Dashboard** (`src/dashboard/Dashboard.jsx`)
   ```javascript
   import { NewInsight } from './components/NewInsight';
   // Add to render
   ```

5. **Rebuild & Test**
   ```bash
   npm run build
   ```

---

## 🔒 Privacy & Security

### Data Storage

**Local-First Architecture:**
- All data stored in browser (Chrome Storage + SQLite)
- No server-side storage by default
- User has full control and ownership

**Storage Breakdown:**

| Data Type | Storage | Size Limit |
|-----------|---------|------------|
| Visits, Topics, Highlights | SQLite (sql.js WASM) | ~10MB practical limit |
| Digital Twin Profile | Chrome Storage (local) | ~5MB |
| Goals, Settings | Chrome Storage (sync) | ~100KB (syncs across devices) |
| Snapshots | SQLite | ~100KB per snapshot |

**Data Encryption:**
- Optional cloud sync (future feature) will use AES-256
- API keys stored securely in Chrome Storage
- No plaintext sensitive data in console logs

### API Privacy

**OpenAI API:**
- Your API key = your control
- Content sent to OpenAI for processing (per OpenAI privacy policy)
- No SupriAI servers in the middle
- User can disable AI features (local fallbacks available)

**Data Minimization:**
- Only necessary content sent to AI (truncated to ~3000 chars)
- No personal identifiers included
- Summaries cached to minimize API calls

### Permissions

**Required Chrome Permissions:**

```json
{
  "permissions": [
    "storage",           // Store data locally
    "tabs",              // Access tab information
    "activeTab",         // Current tab content
    "scripting",         // Inject content scripts
    "unlimitedStorage",  // SQLite database
    "alarms",            // Scheduled tasks (weekly snapshots)
    "identity"           // (Future) OAuth for cloud sync
  ],
  "host_permissions": [
    "<all_urls>"         // Access page content for analysis
  ]
}
```

**Why Each Permission:**
- `storage`: Essential for saving browsing history and settings
- `tabs`: Track URLs and page metadata
- `activeTab`: Read page content for AI analysis
- `scripting`: Inject highlight functionality
- `unlimitedStorage`: SQLite can exceed 5MB quota
- `alarms`: Trigger weekly snapshot generation
- `<all_urls>`: Content script needs access to analyze pages

### User Control

**Settings Panel:**
- Enable/disable AI processing
- Clear all data
- Export data (JSON)
- Import data
- Adjust nudge frequency
- Set data retention period

**Privacy Guarantees:**
1. **No Tracking**: No analytics, no user tracking
2. **No Ads**: Never will show ads
3. **No Data Selling**: Your data is yours alone
4. **No External Servers**: (except optional cloud sync)
5. **Open Source**: Code is transparent and auditable

---

## 🗺️ Roadmap

### Version 2.1 (Q1 2025)

- [ ] Cloud sync with end-to-end encryption
- [ ] Mobile companion app (read-only)
- [ ] Export to Notion, Obsidian, Roam Research
- [ ] Advanced filtering in Knowledge Map
- [ ] Custom AI prompts (power users)

### Version 2.2 (Q2 2025)

- [ ] Team/collaborative features (shared knowledge maps)
- [ ] API for third-party integrations
- [ ] Spaced repetition reminders for important pages
- [ ] Audio summaries (TTS for weekly snapshots)
- [ ] Dark mode improvements

### Version 3.0 (Q3 2025)

- [ ] "Spotify Wrapped" for browsing (yearly report)
- [ ] Predictive recommendations ("You might like...")
- [ ] Integration with calendar (time-boxing goals)
- [ ] Browser-agnostic (Firefox, Edge support)
- [ ] Self-hosted option for privacy enthusiasts

### Long-Term Vision

- [ ] Mobile-first version (iOS, Android)
- [ ] Integration with learning platforms (Coursera, Udemy)
- [ ] Career advisor mode (based on browsing + resume)
- [ ] Mental health insights (stress detection, wellness nudges)
- [ ] Academic citation manager integration

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **Code Contributions**
   - Bug fixes
   - New features
   - Performance improvements
   - Tests

2. **Documentation**
   - Improve README
   - Add code comments
   - Write tutorials
   - Translate to other languages

3. **Design**
   - UI/UX improvements
   - Icon design
   - Dashboard layouts

4. **Feedback**
   - Report bugs
   - Suggest features
   - Share use cases

### Contribution Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/EchoLens.git
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code style
   - Add comments
   - Test thoroughly

4. **Commit**
   ```bash
   git commit -m "feat: Add new personality insight feature"
   ```

   **Commit Message Convention:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Formatting
   - `refactor:` Code restructuring
   - `test:` Tests
   - `chore:` Maintenance

5. **Push & Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open PR on GitHub
   - Describe changes clearly
   - Reference any related issues

### Code Style

- **JavaScript/React**: 2-space indentation, semicolons
- **Naming**: camelCase for functions/variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic
- **Lint**: (Future) ESLint + Prettier

### Testing

- Manual testing in Chrome required
- Test across different screen sizes
- Check console for errors
- Verify API rate limiting

---

## 📄 License

**MIT License**

```
Copyright (c) 2025 Supriya Srinivasan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🌟 Acknowledgments

**Built with ❤️ by [Supriya Srinivasan](https://github.com/supriyaasrinivasan)**

### Inspiration

> "We are not just consumers of information—we're evolving thinkers, and our browsing habits tell that story."

This project was inspired by:
- The need for **mindful browsing** in an age of information overload
- The idea that **digital footprints reveal personal growth**
- The vision of **AI as a mirror**, not just a tool

### Special Thanks

- **OpenAI** for providing powerful AI capabilities
- **Chrome Extensions community** for excellent documentation
- **React & D3.js communities** for amazing libraries
- **Early testers** who provided invaluable feedback

### Philosophy

SupriAI is part of a larger vision: **mindful technology that enhances self-awareness**.

Instead of endlessly consuming, we can **reflect, grow, and evolve** through our digital journeys.

---

## 📧 Contact & Support

### Get in Touch

- **GitHub**: [@supriyaasrinivasan](https://github.com/supriyaasrinivasan)
- **Repository**: [EchoLens/SupriAI](https://github.com/supriyaasrinivasan/EchoLens)
- **Issues**: [Report a bug or request a feature](https://github.com/supriyaasrinivasan/EchoLens/issues)

### Support the Project

If SupriAI has helped you:
- ⭐ **Star the repository** on GitHub
- 🐦 **Share** your experience on social media
- 💡 **Contribute** features or bug fixes
- 📝 **Write** a blog post or tutorial

### Community

- **Discussions**: [GitHub Discussions](https://github.com/supriyaasrinivasan/EchoLens/discussions)
- **Changelog**: See [Versions/](Versions/) folder for release history

---

## 🚀 Getting Started

Ready to transform your browsing into a journey of self-awareness?

1. **[Install SupriAI](#-installation)**
2. **[Set up your API key](#configuration)**
3. **[Define your first goal](#first-time-setup)**
4. **Start browsing** and let SupriAI work its magic ✨

---

<div align="center">

### _"Your curiosity is your compass."_ 🧭

**SupriAI** • Your Digital Self-Awareness Engine

[⬆ Back to Top](#supriai-)

</div>
