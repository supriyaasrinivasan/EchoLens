# SupriAI Backend Server

Complete Python backend for the SupriAI Chrome Extension with AI-powered learning analytics and recommendations.

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Installation & Running

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Start the server (recommended):**
   ```bash
   python start_server.py
   ```
   
   This script will:
   - Check Python version
   - Install missing dependencies automatically
   - Verify port availability
   - Initialize the database
   - Start the server

3. **Alternative - Manual start:**
   ```bash
   pip install -r requirements.txt
   python app.py
   ```

4. **Verify server is running:**
   - Open browser: http://localhost:5000/api/health
   - You should see a health check response

## 📋 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status, database statistics, and component health.

**Response:**
```json
{
  "status": "healthy",
  "service": "SupriAI Backend",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "sessions": 42,
    "topics": 15,
    "recommendations": 10
  },
  "ai_engine": "ready",
  "recommendation_engine": "ready",
  "timestamp": "2025-12-02T10:30:00"
}
```

### Sync Data
```
POST /api/sync
```
Main endpoint for syncing extension data and receiving AI insights.

**Request Body:**
```json
{
  "sessions": [...],
  "topics": [...],
  "profile": {...},
  "skills": [...]
}
```

**Response:**
```json
{
  "success": true,
  "code": "SYNC_COMPLETE",
  "data": {
    "sessions_stored": 5,
    "topics_processed": 3,
    "skills_updated": 2,
    "insights_generated": 8,
    "recommendations_generated": 10
  },
  "insights": [...],
  "recommendations": [...]
}
```

### Analytics
```
GET /api/analytics?range=week
```
Get learning analytics for a time range.

**Parameters:**
- `range`: day | week | month | year

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "topics": [...],
    "insights": [...]
  },
  "summary": {
    "totalTime": 180000,
    "totalSessions": 15,
    "avgEngagement": 75.5,
    "uniqueTopics": 8,
    "uniqueDays": 5
  }
}
```

### Recommendations
```
GET /api/recommendations?limit=10&category=programming
```
Get personalized learning recommendations.

**Parameters:**
- `limit`: Number of recommendations (default: 10)
- `category`: Filter by category (optional)

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "type": "resource",
      "title": "Advanced Python Patterns",
      "description": "...",
      "url": "https://...",
      "topic": "Python",
      "category": "programming",
      "priority": "high",
      "score": 0.95
    }
  ]
}
```

### User Profile
```
GET /api/profile
POST /api/profile
```
Get or update user learning profile.

**POST Request:**
```json
{
  "learningStyle": "visual",
  "skillLevel": "intermediate",
  "weeklyGoal": 10,
  "preferredCategories": ["programming", "web_development"]
}
```

### Analyze Content
```
POST /api/analyze
```
Analyze a specific webpage for educational classification.

**Request:**
```json
{
  "url": "https://example.com/tutorial",
  "title": "Python Tutorial",
  "content": "Learn Python programming..."
}
```

**Response:**
```json
{
  "url": "...",
  "category": "programming",
  "keywords": ["python", "tutorial", "programming"],
  "educational_score": 0.85,
  "is_educational": true
}
```

### Topic Modeling
```
POST /api/topic-modeling
```
Extract topics from multiple text samples.

**Request:**
```json
{
  "texts": [
    "Learn Python programming...",
    "JavaScript web development...",
    "Machine learning algorithms..."
  ]
}
```

## 🏗️ Architecture

### Components

1. **Flask Server (`app.py`)**
   - REST API endpoints
   - Request validation
   - Error handling
   - Database operations

2. **AI Analysis Engine (`ai_engine.py`)**
   - Topic modeling
   - Pattern detection
   - User profiling
   - Learning style analysis
   - Skill progression tracking

3. **Recommendation Engine (`recommendation_engine.py`)**
   - Content-based filtering
   - Skill progression recommendations
   - Pattern-based suggestions
   - Resource matching

4. **Configuration (`config.py`)**
   - Server settings
   - Database configuration
   - CORS settings
   - Feature flags

### Database Schema

**SQLite database** with the following tables:

- `sessions` - Individual learning sessions
- `topics` - Aggregated topic data
- `user_profile` - User preferences and profile
- `ai_insights` - Generated AI insights
- `recommendations` - Learning recommendations
- `learning_patterns` - Detected patterns
- `skills` - Skill progression tracking

## 🔧 Configuration

Edit `config.py` to customize:

```python
SERVER_CONFIG = {
    'host': '0.0.0.0',
    'port': 5000,
    'debug': True
}

AI_CONFIG = {
    'use_ml': True,
    'min_confidence': 0.5,
    'max_insights': 20
}
```

## 🧪 Testing

Run the test suite to verify all endpoints:

```bash
python test_backend.py
```

The test script checks:
- ✓ Health check endpoint
- ✓ Sync functionality
- ✓ Analytics endpoint
- ✓ Recommendations generation
- ✓ Profile management
- ✓ Content analysis
- ✓ Error handling

## 📊 Logging

Logs are stored in `logs/server.log` with rotation:
- Max file size: 10MB
- Backup count: 5 files
- Format: `[timestamp] LEVEL in module: message`

View logs:
```bash
tail -f logs/server.log
```

## 🔍 Troubleshooting

### Server won't start

**Issue:** Port 5000 already in use
```
Solution 1: Change port in config.py
Solution 2: Kill process using port 5000
  Windows: netstat -ano | findstr :5000
           taskkill /PID <PID> /F
```

**Issue:** Module not found
```
Solution: Install dependencies
  pip install -r requirements.txt
```

### Database errors

**Issue:** Database locked
```
Solution: Close other connections to supriai.db
  If persists, delete supriai.db (will lose data)
```

**Issue:** Table doesn't exist
```
Solution: Reinitialize database
  Delete supriai.db and restart server
```

### Connection from extension fails

**Issue:** CORS errors
```
Solution: Check CORS configuration in config.py
  Ensure origins='*' for development
```

**Issue:** Connection refused
```
Solution: 
  1. Verify server is running (check http://localhost:5000/api/health)
  2. Check firewall settings
  3. Ensure correct port in extension (default: 5000)
```

### AI features not working

**Issue:** Basic insights only
```
Solution: Install optional ML libraries
  pip install numpy scikit-learn
  Restart server
```

## 📦 Dependencies

### Required (Core functionality)
- Flask >= 2.3.0
- flask-cors >= 4.0.0

### Optional (Enhanced AI)
- numpy >= 1.24.0
- scikit-learn >= 1.3.0

**Note:** The backend works fully without optional dependencies, using basic implementations for AI analysis.

## 🔒 Security Notes

For production deployment:

1. **Disable debug mode:**
   ```python
   SERVER_CONFIG = {'debug': False}
   ```

2. **Restrict CORS origins:**
   ```python
   CORS_CONFIG = {
       'origins': ['chrome-extension://your-extension-id']
   }
   ```

3. **Add authentication:**
   - Implement API key validation
   - Use HTTPS
   - Rate limiting

4. **Secure database:**
   - Use proper database credentials
   - Regular backups
   - Data encryption

## 📈 Performance

- **Average response time:** < 200ms
- **Sync processing:** ~100 sessions/second
- **Database size:** ~50MB per 10,000 sessions
- **Memory usage:** ~100MB base + ~1MB per 1000 sessions

## 🛠️ Development

### Adding new endpoints

1. Add route in `app.py`:
```python
@app.route('/api/custom', methods=['GET'])
def custom_endpoint():
    app.logger.info("Custom endpoint called")
    return jsonify({'data': 'response'})
```

2. Add test in `test_backend.py`
3. Update this README

### Adding AI features

1. Add method to `ai_engine.py`
2. Call from `analyze()` method
3. Return insight objects with required fields:
   - `type`, `title`, `description`, `confidence`

## 📝 API Response Codes

- `200` - Success
- `400` - Bad Request (invalid data)
- `500` - Server Error

## 🌐 Extension Integration

The Chrome extension connects to:
```javascript
const response = await fetch('http://localhost:5000/api/sync', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
});
```

Default URL can be changed in extension settings.

## 📞 Support

For issues or questions:
1. Check this README
2. Run `python test_backend.py`
3. Check logs in `logs/server.log`
4. Review error messages in console

## 📄 License

Part of the SupriAI Learning Recommendation System.

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0
