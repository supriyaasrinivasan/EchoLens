# SupriAI - AI-Powered Learning Recommendation Chrome Extension

An intelligent Chrome extension that monitors your browsing behavior, analyzes learning patterns, and provides personalized study recommendations using AI/ML.

## 🚀 Features

### 1. Browser-Level Data Collection
- **Tab & Navigation Tracking**: Monitors pages visited, time spent, and navigation patterns
- **Mouse & Scroll Analytics**: Tracks engagement through mouse movements, clicks, and scroll depth
- **Focus Time Detection**: Measures active reading vs idle time
- **History Integration**: Leverages Chrome History API for comprehensive data

### 2. Local Data Storage & Privacy
- **IndexedDB Storage**: All data stored locally using Chrome's IndexedDB
- **Privacy-First Design**: No data leaves your device without explicit permission
- **Secure Sync**: Optional backend sync with encryption support

### 3. AI Behavior Analysis Engine
- **Topic Modeling**: Uses TF-IDF and NMF for content categorization
- **Learning Pattern Detection**: Identifies peak learning hours, session durations
- **Engagement Scoring**: Measures content engagement and comprehension indicators
- **Skill Progression**: Tracks learning progress across topics

### 4. Smart Recommendation Generator
- **Content-Based Filtering**: Suggests based on your learning history
- **Knowledge Graph**: Maps topic relationships for optimal learning paths
- **Study Scheduling**: Recommends best times and topics based on patterns
- **Gap Analysis**: Identifies knowledge gaps and suggests filling content

### 5. Interactive Analytics Dashboard
- **Visual Charts**: Daily/weekly/monthly learning trends
- **Topic Distribution**: Pie charts and graphs of learning areas
- **Progress Tracking**: Skill development over time
- **Exportable Reports**: Download your learning analytics

## 📁 Project Structure

```
SupriAI/
├── manifest.json           # Chrome extension configuration
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup functionality
├── dashboard/
│   ├── dashboard.html     # Full analytics dashboard
│   ├── dashboard.css      # Dashboard styles
│   └── dashboard.js       # Dashboard functionality
├── js/
│   ├── background.js      # Service worker for tracking
│   ├── content.js         # Content script for page analysis
│   ├── storage.js         # IndexedDB management
│   ├── classifier.js      # Content classification
│   ├── utils.js           # Utility functions
│   ├── analytics.js       # Analytics processing
│   └── recommendations.js # Recommendation engine (client)
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── backend/
    ├── app.py             # Flask API server
    ├── ai_engine.py       # ML analysis engine
    ├── recommendation_engine.py  # ML recommendations
    └── requirements.txt   # Python dependencies
```

## 🛠️ Installation

### Chrome Extension Setup

1. **Clone or Download** this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `SupriAI` folder
6. The extension icon will appear in your toolbar

### Backend Setup (Optional - for advanced ML features)

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**:
   ```bash
   python app.py
   ```
   
   Server runs at `http://localhost:5000`

## 📊 Usage

### Quick Start
1. Click the SupriAI icon in your toolbar
2. The extension automatically starts tracking your learning sessions
3. View quick stats in the popup
4. Click "Open Dashboard" for detailed analytics

### Dashboard Features
- **Overview Tab**: Summary stats and quick insights
- **Analytics Tab**: Detailed charts and trends
- **Topics Tab**: Subject-wise breakdown
- **Recommendations Tab**: Personalized learning suggestions
- **Settings Tab**: Configure preferences and export data

### API Endpoints (Backend)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Analyze learning sessions |
| `/recommendations` | POST | Get personalized recommendations |
| `/sync` | POST | Sync local data with backend |
| `/analytics/summary` | POST | Get analytics summary |
| `/topics` | GET | List all identified topics |
| `/sessions` | GET | Get all sessions |
| `/export` | GET | Export all data as JSON |
| `/import` | POST | Import data from JSON |

## 🔧 Configuration

### Extension Settings
Access settings through the dashboard to configure:
- Tracking preferences
- Privacy settings
- Sync options
- Notification preferences

### Backend Configuration
Create a `.env` file in the backend folder:
```env
FLASK_ENV=development
DATABASE_URL=supriai.db
SECRET_KEY=your-secret-key
```

## 🔒 Privacy

- **100% Local Storage**: All data stays on your device by default
- **No External Tracking**: Extension doesn't send data to third parties
- **User Control**: Full control over data collection and storage
- **Export & Delete**: Download or delete your data anytime

## 🛡️ Permissions Explained

| Permission | Purpose |
|------------|---------|
| `tabs` | Track active tabs and navigation |
| `storage` | Store learning data locally |
| `history` | Access browsing history for analysis |
| `webNavigation` | Monitor page navigation events |
| `alarms` | Schedule periodic data processing |
| `activeTab` | Analyze current page content |

## 📈 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for visualizations
- Chrome Extension APIs (Manifest V3)
- IndexedDB for storage

### Backend
- Python 3.9+
- Flask (Web Framework)
- SQLite (Database)
- scikit-learn (ML/AI)
- NumPy, Pandas (Data Processing)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extensions Documentation
- Chart.js Library
- scikit-learn Community
- Flask Framework

---

**Made with ❤️ for Learners**
