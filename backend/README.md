# SupriAI Backend Server

Python Flask backend with AI-powered learning analytics and recommendations.

## Features

- **AI Analysis Engine**: Topic extraction, pattern detection, user profiling
- **ML Recommendation System**: Personalized learning recommendations
- **SQLite Database**: Local data storage
- **RESTful API**: Clean API endpoints for Chrome extension
- **Health Monitoring**: Comprehensive status reporting

## Installation

### 1. Install Python Dependencies

**Basic Installation (Works without ML libraries):**
```bash
cd backend
pip install -r requirements.txt
```

**Full Installation with ML Capabilities:**
```bash
cd backend
pip install flask flask-cors numpy scikit-learn
```

### 2. Start the Server

```bash
python start_server.py
```

Or directly:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Verifying AI Models

### Method 1: Health Check API

```bash
curl http://localhost:5000/api/health
```

**Expected Response (with ML libraries):**
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
  "ai_engine": {
    "available": true,
    "ml_enabled": true,
    "mode": "ML-Enhanced",
    "capabilities": {
      "topic_extraction": true,
      "pattern_detection": true,
      "clustering": true,
      "tfidf_vectorization": true,
      "user_profiling": true
    },
    "libraries": {
      "numpy": true,
      "sklearn": true
    }
  },
  "recommendation_engine": {
    "available": true,
    "ml_enabled": true,
    "mode": "ML-Enhanced"
  }
}
```

**Expected Response (without ML libraries):**
```json
{
  "ai_engine": {
    "ml_enabled": false,
    "mode": "Basic"
  },
  "recommendation_engine": {
    "ml_enabled": false,
    "mode": "Rule-Based"
  }
}
```

### Method 2: Detailed Status API

```bash
curl http://localhost:5000/api/status
```

This returns comprehensive information including:
- Database statistics
- AI model capabilities
- ML library status
- Feature availability
- Resource count

### Method 3: Chrome Extension Dashboard

1. Open Chrome extension dashboard
2. Go to **Settings** → **Backend Connection**
3. Click **"Test Connection"** button
4. View AI Model Status panel showing:
   - Analysis Mode (ML-Enhanced or Basic)
   - NumPy status
   - Scikit-learn status
   - ML Clustering availability
   - Recommendation mode
   - Total curated resources

### Method 4: Run Test Suite

```bash
python test_backend.py
```

This will test all API endpoints and verify:
- Health check
- Sync endpoint
- AI analysis
- Recommendations
- Pattern detection

## AI Models Status

### With ML Libraries (numpy + scikit-learn)

✅ **AI Engine (ML-Enhanced)**
- TF-IDF vectorization for text analysis
- K-means clustering for topic grouping
- Latent Dirichlet Allocation (LDA) for topic modeling
- Advanced pattern detection
- Similarity-based recommendations

✅ **Recommendation Engine (ML-Enhanced)**
- Cosine similarity for content-based filtering
- Collaborative filtering
- Vector-based skill matching
- ML-powered resource ranking

### Without ML Libraries (Basic Mode)

⚠️ **AI Engine (Basic)**
- Keyword-based topic extraction
- Rule-based pattern detection
- Heuristic user profiling
- Statistical analysis

⚠️ **Recommendation Engine (Rule-Based)**
- Category matching
- Difficulty progression rules
- Time-based recommendations
- Curated resource suggestions

## Troubleshooting

### Backend Shows "Offline" in Extension

1. **Check if server is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Verify port 5000 is not in use:**
   ```bash
   netstat -ano | findstr :5000
   ```

3. **Check server logs:**
   ```bash
   cat logs/server.log
   ```

4. **CORS issues:** Ensure `flask-cors` is installed

### ML Libraries Not Detected

1. **Verify installation:**
   ```bash
   python -c "import numpy; print('NumPy:', numpy.__version__)"
   python -c "import sklearn; print('Sklearn:', sklearn.__version__)"
   ```

2. **Install if missing:**
   ```bash
   pip install numpy scikit-learn
   ```

3. **Restart backend server** after installing libraries

4. **Test again** using health check API or extension

### Database Errors

1. **Delete database and reinitialize:**
   ```bash
   rm supriai.db
   python app.py
   ```

2. **Check file permissions** on `backend/` directory

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Basic health check with AI status |
| `/api/status` | GET | Comprehensive status including ML libraries |
| `/api/sync` | POST | Sync data and get AI insights |
| `/api/analytics` | GET | Get learning analytics |
| `/api/recommendations` | GET | Get personalized recommendations |
| `/api/patterns` | GET | Get detected learning patterns |
| `/api/profile` | GET/POST | User learning profile |

## Configuration

Edit `config.py` to customize:
- Server port (default: 5000)
- CORS origins
- AI engine settings
- Logging level
- Data retention

## Performance

**With ML Libraries:**
- More accurate topic modeling
- Better pattern detection
- Smarter recommendations
- ~50-100ms analysis time

**Without ML Libraries:**
- Faster processing
- Lower memory usage
- ~20-30ms analysis time
- Good for basic tracking

## Recommended Setup

For **best AI analysis**:
```bash
pip install flask flask-cors numpy scikit-learn
```

For **basic tracking only**:
```bash
pip install flask flask-cors
```

## Development

**Enable debug mode** in `config.py`:
```python
SERVER_CONFIG = {
    'debug': True
}
```

**View logs:**
```bash
tail -f logs/server.log
```

**Run tests:**
```bash
python test_backend.py
```

## Production Deployment

1. **Disable debug mode** in config.py
2. **Set specific CORS origins** (not '*')
3. **Use production WSGI server** (gunicorn, waitress)
4. **Enable HTTPS**
5. **Set up log rotation**

Example with gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## License

Part of SupriAI Chrome Extension - Learning Analytics Platform
