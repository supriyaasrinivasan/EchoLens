# SupriAI - AI-Powered Learning Recommendation System

A Chrome browser extension that tracks your learning activities, analyzes your patterns, and provides AI-powered recommendations to enhance your learning journey.

## 🚀 Features

- **Smart Learning Tracking**: Automatically detects and categorizes educational content
- **Engagement Analysis**: Monitors your focus, scroll depth, and interaction patterns
- **AI-Powered Insights**: Generates personalized learning insights using machine learning
- **Recommendations Engine**: Suggests resources based on your learning patterns
- **Beautiful Dashboard**: Visualize your learning progress with charts and analytics
- **Skill Progression**: Track your skill development across different topics

## 📁 Project Structure

```
SupriAI/
├── manifest.json           # Chrome extension manifest
├── start-backend.bat       # Backend startup script (Windows)
├── popup/                  # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── dashboard/              # Full dashboard interface
│   ├── dashboard.html
│   ├── dashboard.css
│   └── dashboard.js
├── js/                     # Core extension scripts
│   ├── background.js       # Service worker
│   ├── content.js          # Content script for tracking
│   ├── storage.js          # IndexedDB storage manager
│   ├── classifier.js       # Content classification
│   ├── analytics.js        # Analytics engine
│   ├── recommendations.js  # Recommendations engine
│   ├── config.js           # Configuration
│   ├── utils.js            # Utility functions
│   ├── server-manager.js   # Backend connection
│   └── d3-viz.js          # D3 visualizations
├── css/                    # Stylesheets
│   ├── theme.css           # Theme variables
│   └── remixicon.css       # Icon font
├── icons/                  # Extension icons
└── backend/                # Backend server
    ├── server.js           # Node.js server
    ├── app.py              # Flask API (alternative)
    ├── ai_engine.py        # AI analysis engine
    ├── recommendation_engine.py
    ├── ai_service.py       # Python AI service wrapper
    ├── config.py           # Backend configuration
    ├── package.json        # Node.js dependencies
    └── requirements.txt    # Python dependencies
```

## 🛠️ Installation

### 1. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `SupriAI` folder


### 2. Start the Backend Server

The backend provides enhanced AI analysis and recommendations.

**Option A: Using the startup script (Recommended)**
```bash
# Windows
double-click start-backend.bat
```

**Option B: Manual startup**
```bash
cd backend

# Install dependencies
npm install
pip install -r requirements.txt

# Start server
node server.js
```

The server runs on `http://localhost:5000`

### 3. Optional: Enhanced ML Features

For advanced machine learning features, install additional Python packages:
```bash
pip install numpy scikit-learn
```

## 🎯 Usage

1. **Click the extension icon** to see quick stats and current page analysis
2. **Open the Dashboard** for detailed analytics, topics, and recommendations
3. **Browse educational content** - the extension automatically tracks and categorizes it
4. **Sync with backend** to get AI-powered insights and recommendations

## 🔧 Configuration

### Extension Settings (in Dashboard > Settings)
- **Backend URL**: Default is `http://localhost:5000`
- **Auto-sync**: Enable automatic syncing with backend
- **Tracking**: Toggle tracking on/off

### Backend Configuration (backend/config.py)
- Server port: 5000
- Database location
- AI feature toggles
- Logging settings

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/sync` | POST | Sync learning data |
| `/api/analytics` | GET | Get analytics data |
| `/api/recommendations` | GET | Get recommendations |
| `/api/patterns` | GET | Get learning patterns |
| `/api/profile` | GET/POST | User profile |
| `/api/status` | GET | Detailed status |

## 🎨 Themes

The extension supports light and dark themes. Click the moon/sun icon to toggle.

## 📊 Categories Tracked

- Programming
- Data Science
- Web Development
- Mathematics
- Science
- Language
- Business
- Design
- DevOps
- Security

## 🔒 Privacy

- All data is stored locally in your browser (IndexedDB)
- Backend sync is optional and runs on localhost
- No data is sent to external servers

## 🐛 Troubleshooting

**Extension not tracking?**
- Refresh the page after installing the extension
- Check if tracking is enabled (green dot in popup)

**Backend not connecting?**
- Ensure the backend server is running
- Check if port 5000 is available
- Look at server logs in the terminal

**Charts not displaying?**
- Wait for data to accumulate
- Try syncing with the backend

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read the contribution guidelines first.
