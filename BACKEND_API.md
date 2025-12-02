# SupriAI Backend API Documentation

## Server Configuration

**Base URL:** `http://localhost:5000`

**Default Port:** 5000

**CORS:** Enabled for all origins (configured in `config.py`)

## Starting the Backend Server

### Quick Start
```bash
cd backend
python start_server.py
```

### Manual Start
```bash
cd backend
python app.py
```

### Requirements
- Python 3.7+
- Flask
- Flask-CORS
- Optional: numpy, scikit-learn (for enhanced AI features)

Install dependencies:
```bash
pip install -r requirements.txt
```

## API Endpoints

### 1. Health Check
**GET** `/api/health`

Check server status and database connectivity.

**Response:**
```json
{
  "status": "healthy",
  "service": "SupriAI Backend",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "sessions": 0,
    "topics": 0,
    "recommendations": 0
  },
  "ai_engine": "ready",
  "recommendation_engine": "ready",
  "timestamp": "2025-12-02T10:30:00"
}
```

### 2. Sync Data
**POST** `/api/sync`

Main endpoint for Chrome extension to sync learning data.

**Request Body:**
```json
{
  "sessions": [
    {
      "url": "https://example.com",
      "title": "Learning Resource",
      "domain": "example.com",
      "category": "programming",
      "topics": ["javascript", "react"],
      "duration": 300000,
      "engagementScore": 0.85,
      "scrollDepth": 75,
      "date": "2025-12-02",
      "timestamp": 1733140800000
    }
  ],
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
    "sessions_stored": 1,
    "topics_processed": 5,
    "skills_updated": 3,
    "insights_generated": 8,
    "recommendations_generated": 10
  },
  "insights": [...],
  "recommendations": [...]
}
```

### 3. Get Analytics
**GET** `/api/analytics?range=week`

Retrieve analytics data with statistics.

**Query Parameters:**
- `range`: `day`, `week`, `month`, or `year`

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
    "totalSessions": 25,
    "avgEngagement": 7.5,
    "uniqueTopics": 12,
    "uniqueDays": 5,
    "categoryBreakdown": {...}
  }
}
```

### 4. Get Recommendations
**GET** `/api/recommendations?limit=10&category=programming`

Fetch personalized recommendations.

**Query Parameters:**
- `limit`: Number of recommendations (default: 10)
- `category`: Filter by category (optional)

**Response:**
```json
{
  "success": true,
  "recommendations": [...],
  "metadata": {
    "total": 50,
    "returned": 10,
    "limit": 10,
    "category": "programming"
  }
}
```

### 5. Get User Profile
**GET** `/api/profile`

Retrieve user learning profile.

**POST** `/api/profile`

Update user profile with learning preferences.

### 6. Get Learning Patterns
**GET** `/api/patterns`

Retrieve detected learning patterns.

### 7. Analyze Content
**POST** `/api/analyze`

Analyze specific content using AI.

**Request:**
```json
{
  "url": "https://example.com",
  "title": "Article Title",
  "content": "Article content..."
}
```

### 8. Topic Modeling
**POST** `/api/topic-modeling`

Run topic modeling on provided texts.

**Request:**
```json
{
  "texts": ["text 1", "text 2", "text 3"]
}
```

## Database Schema

### Tables
- `sessions` - Learning session records
- `topics` - Tracked learning topics
- `user_profile` - User preferences and settings
- `ai_insights` - AI-generated insights
- `recommendations` - Personalized recommendations
- `learning_patterns` - Detected learning patterns
- `skills` - Skill progression tracking

## Configuration Files

### config.py
Main configuration file containing:
- Server settings (host, port, debug mode)
- Database path and settings
- CORS configuration
- AI engine settings
- Logging configuration
- API settings
- Feature flags

### Environment Variables (Optional)
You can override configuration using environment variables:
- `SUPRIAI_PORT` - Server port
- `SUPRIAI_HOST` - Server host
- `SUPRIAI_DEBUG` - Debug mode (true/false)

## Chrome Extension Connection

The Chrome extension connects to the backend server using the configured base URL.

**Extension Configuration:**
Update the backend URL in your extension's configuration if needed:
```javascript
const BACKEND_URL = 'http://localhost:5000';
```

**CORS:**
The backend is configured to accept requests from all origins. For production, update `CORS_CONFIG` in `config.py` to restrict origins.

## Error Codes

- `EMPTY_REQUEST` - No data provided in request
- `INVALID_SESSIONS` - Sessions data format is invalid
- `INVALID_JSON` - JSON parsing error
- `SYNC_ERROR` - General sync error
- `ANALYTICS_ERROR` - Analytics retrieval error
- `RECOMMENDATIONS_ERROR` - Recommendations generation error

## Testing

Test the backend server:
```bash
cd backend
python test_backend.py
```

Or use curl:
```bash
curl http://localhost:5000/api/health
```

## Logs

Server logs are stored in:
- `backend/logs/server.log`

Log rotation is configured with max size 10MB and 5 backup files.

## Production Deployment

For production deployment:
1. Set `debug: False` in `SERVER_CONFIG`
2. Configure specific CORS origins in `CORS_CONFIG`
3. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
4. Set up reverse proxy (nginx/Apache)
5. Enable HTTPS
6. Configure firewall rules

## Troubleshooting

**Port Already in Use:**
- Change the port in `config.py` or kill the process using port 5000
- On Windows: `netstat -ano | findstr :5000`

**Database Locked:**
- Ensure only one instance of the server is running
- Check file permissions on `supriai.db`

**Import Errors:**
- Install missing dependencies: `pip install -r requirements.txt`
- Verify Python version: `python --version` (requires 3.7+)

**CORS Errors:**
- Verify CORS_CONFIG in `config.py`
- Check browser console for specific CORS messages
