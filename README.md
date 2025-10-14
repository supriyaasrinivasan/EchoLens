# 🌌 EchoLens — The Web Remembers What You Forgot

> A contextual AI memory layer for your browsing — quietly tracking your journey, surfacing forgotten threads, and mapping your evolving knowledge.

## 🧠 Vision

In a world drowning in tabs and fleeting thoughts, **EchoLens** becomes your digital memory — a reflective lens that remembers where you've been, what you've seen, and who you were becoming.

## ✨ Features

### 🎯 Smart Context Capture
- Tracks meaningful browsing sessions
- AI-powered topic summarization
- Pattern detection (learning, research, inspiration)

### 🏷️ Intent Tagging
- Manual mood/goal tagging
- AI-suggested contextual tags
- Track your browsing "why"

### 🔮 Memory Replay
- Past interaction history on revisit
- Evolution of your thoughts
- Highlighted quotes and notes

### 🗺️ Knowledge Map
- Visual graph of your digital memory
- Connected ideas and topics
- Interactive exploration

### 🤖 AI Memory Summoner
- Natural language search
- "What did I read about X last month?"
- ChatGPT for your browsing history

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Development mode (auto-rebuild)
npm run dev
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

### Backend Setup

```bash
# Run the backend server
npm run server

# Development mode with auto-restart
npm run server:dev
```

## 📁 Project Structure

```
echolens/
├── src/
│   ├── popup/           # Extension popup UI
│   ├── dashboard/       # Full-page memory dashboard
│   ├── content/         # Content script (page capture)
│   ├── background/      # Background service worker
│   └── shared/          # Shared utilities & components
├── server/              # Node.js backend
├── assets/              # Icons and images
├── manifest.json        # Chrome extension manifest
└── webpack.config.js    # Build configuration
```

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS
- **Extension**: Chrome Extension APIs (Manifest V3)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI**: OpenAI/Anthropic API
- **Build**: Webpack + Babel

## 💸 Monetization

### Free Tier
- Last 20 sessions
- Core visit recall
- Basic highlights

### Pro Tier ($5/month)
- Unlimited memory
- AI summaries
- Multi-device sync
- Knowledge graph
- Custom tagging

### Enterprise ($20+/month)
- Team research memory
- Analytics dashboards
- Third-party integrations

## 🎨 Design Philosophy

**Minimalist. Timeless. Reflective.**

EchoLens embraces a dark, constellation-inspired aesthetic that feels like exploring your own mind — nodes of thought connected by threads of curiosity.

## � Project Files

This repository includes:
- **38+ source files** with complete implementation
- **9 documentation files** covering all aspects
- **Full backend API** with MongoDB integration
- **React dashboard** with 3 visualization modes
- **Chrome extension** (Manifest V3) ready to build

See `PROJECT-TREE.md` for complete file structure.

## 🎓 Learning Resources

- `QUICKSTART.md` - Get running in 5 minutes
- `SETUP.md` - Complete installation guide  
- `ARCHITECTURE.md` - Technical deep dive
- `DESIGN-GUIDE.md` - Visual design system
- `FAQ.md` - Common questions answered
- `CHECKLIST.md` - Development checklist

## �📝 License

MIT License - feel free to build upon this concept!

## 🌟 Contributing

This is a foundational implementation. Contributions welcome for:
- Enhanced AI capabilities
- Mobile sync
- Third-party integrations
- UI/UX improvements

---

*"Your browsing becomes a timeline of self-evolution."*
