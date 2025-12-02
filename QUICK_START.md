# Quick Start Guide - SupriAI

## ✅ Verify Backend & AI Models Are Working

### Step 1: Start the Backend Server

```bash
cd backend
python app.py
```

You should see:
```
Starting SupriAI Backend Server...
Server URL: http://localhost:5000
Health Check: http://localhost:5000/api/health
```

### Step 2: Check AI Model Status

**Option A: Using Status Check Script (Recommended)**
```bash
cd backend
python check_status.py
```

This will display:
- ✅ Server status (ONLINE/OFFLINE)
- 📊 Database statistics
- 🤖 AI model mode (ML-Enhanced or Basic)
- 📚 ML library status (NumPy, Scikit-learn)
- ⚡ Feature availability
- 💡 Recommendations for setup

**Option B: Using Chrome Extension Dashboard**
1. Load the extension in Chrome
2. Click the SupriAI icon
3. Go to Dashboard → Settings
4. Click "Test Connection" button
5. View AI Model Status panel

**Option C: Using curl/API**
```bash
curl http://localhost:5000/api/status
```

### Step 3: Install ML Libraries (for Enhanced AI)

If you see "Basic mode" or ML libraries not installed:

```bash
pip install numpy scikit-learn
```

Then restart the backend server.

### Step 4: Verify ML Enhancement

Run status check again:
```bash
python check_status.py
```

You should now see:
- ✅ **Analysis Mode:** ML-Enhanced
- ✅ **NumPy:** ✓ Installed
- ✅ **Scikit-learn:** ✓ Installed
- ✅ **ML Clustering:** Enabled

## 🔍 What Each AI Mode Provides

### ML-Enhanced Mode (NumPy + Scikit-learn installed)
- ✅ TF-IDF vectorization for text analysis
- ✅ K-means clustering for topic grouping
- ✅ Latent Dirichlet Allocation (LDA)
- ✅ Cosine similarity recommendations
- ✅ Collaborative filtering
- ✅ Advanced pattern detection

### Basic Mode (No ML libraries)
- ⚠️ Keyword-based topic extraction
- ⚠️ Rule-based pattern detection
- ⚠️ Heuristic recommendations
- ⚠️ Category matching

## 🧪 Testing the Backend

Run the test suite:
```bash
cd backend
python test_backend.py
```

This tests:
- Health check endpoint
- Sync functionality
- AI analysis
- Recommendation generation
- Database operations

## ❌ Troubleshooting

### Backend shows "Offline" in extension

1. Check if server is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Verify port 5000 is available:
   ```bash
   netstat -ano | findstr :5000
   ```

3. Check firewall settings

### ML Libraries not detected

1. Verify installation:
   ```bash
   python -c "import numpy; print('NumPy OK')"
   python -c "import sklearn; print('Sklearn OK')"
   ```

2. If errors, reinstall:
   ```bash
   pip install --upgrade numpy scikit-learn
   ```

3. Restart backend server

### Extension shows "Not tracked"

1. Make sure tracking is enabled in settings
2. Visit an educational website (e.g., MDN, W3Schools, GitHub)
3. Wait 10 seconds for tracking to start
4. Refresh the popup

## 📊 Expected Behavior

### With Backend Running (ML-Enhanced):
- Real-time AI insights based on browsing
- Personalized learning recommendations
- Advanced topic clustering
- Pattern detection with ML
- Curated resources from 50+ learning sites

### With Backend Running (Basic):
- Basic topic tracking
- Rule-based recommendations
- Pattern detection using heuristics
- Curated resources from 50+ learning sites

### Without Backend:
- Local-only data storage
- Basic engagement tracking
- No AI insights
- Manual data export only

## 🎯 Next Steps

Once backend is confirmed working:

1. **Load Extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select SupriAI folder

2. **Start Browsing:**
   - Visit learning websites
   - Read documentation
   - Watch tutorials

3. **View Analytics:**
   - Click extension icon for quick stats
   - Open Dashboard for full analytics
   - Check AI insights and recommendations

4. **Sync Data:**
   - Dashboard → Click "Sync" button
   - Backend processes with AI
   - View enhanced insights

## 📝 Configuration

Edit `backend/config.py` to customize:
- Server port (default: 5000)
- AI engine settings
- Logging level
- Data retention policies

## 🔒 Privacy

- All data stored locally by default
- Backend sync is optional
- No data sent to external servers
- Full control over your data

## 📚 Documentation

- [Backend README](backend/README.md) - Detailed backend documentation
- [Backend Connectivity](BACKEND_CONNECTIVITY.md) - Connection features guide
- [API Reference](backend/README.md#api-endpoints) - API documentation

## 💬 Support

If issues persist:
1. Check `backend/logs/server.log` for errors
2. Run `python check_status.py` for diagnostics
3. Ensure Python 3.7+ is installed
4. Try with a fresh virtual environment

---

**Quick Command Reference:**

```bash
# Start backend
cd backend && python app.py

# Check status
cd backend && python check_status.py

# Run tests
cd backend && python test_backend.py

# Install ML libraries
pip install numpy scikit-learn

# View logs
cat backend/logs/server.log
```
