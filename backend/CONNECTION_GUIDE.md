# Backend Connection Guide - Quick Reference

## ✅ Connection Checklist

Use this checklist to ensure proper backend connectivity:

- [ ] Python 3.7+ installed
- [ ] Backend server running (`python start_server.py`)
- [ ] Server accessible at http://localhost:5000/api/health
- [ ] Chrome extension installed and active
- [ ] No firewall blocking port 5000
- [ ] CORS enabled in backend

## 🔗 Testing Connection

### 1. Test Backend Health (PowerShell)
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" | Select-Object -Expand Content
```

### 2. Test from Browser
Open in Chrome:
```
http://localhost:5000/api/health
```

You should see JSON response with status "healthy".

### 3. Test Sync Endpoint
```powershell
$body = @{
    sessions = @()
    topics = @()
    profile = @{}
    skills = @()
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/sync" -Method POST -Body $body -ContentType "application/json" | Select-Object -Expand Content
```

## 🚨 Common Issues & Solutions

### Issue 1: "Server not running"

**Symptom:** Extension shows "Backend not available"

**Solutions:**
1. Start the server:
   ```powershell
   cd backend
   python start_server.py
   ```

2. Verify it's running:
   ```powershell
   netstat -ano | findstr :5000
   ```

3. Check for errors in console

### Issue 2: "Connection refused"

**Symptom:** Cannot reach http://localhost:5000

**Solutions:**
1. Check if port is already in use:
   ```powershell
   netstat -ano | findstr :5000
   ```

2. If in use by another process, either:
   - Kill that process: `taskkill /PID <PID> /F`
   - Change port in `backend/config.py`

3. Check Windows Firewall:
   - Allow Python through firewall
   - Allow connections on port 5000

### Issue 3: "CORS error"

**Symptom:** Browser console shows CORS policy error

**Solutions:**
1. Verify CORS is enabled in `config.py`:
   ```python
   CORS_CONFIG = {
       'origins': '*',  # Allow all origins
       'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
       'allow_headers': ['Content-Type', 'Authorization'],
   }
   ```

2. Restart the server after config changes

### Issue 4: "Module not found"

**Symptom:** Python error: `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```powershell
pip install -r requirements.txt
```

Or install individually:
```powershell
pip install flask flask-cors
```

### Issue 5: "Database locked"

**Symptom:** Error: `database is locked`

**Solutions:**
1. Close other connections to the database
2. Restart the server
3. If persists, delete `supriai.db` (will lose data)

### Issue 6: "Invalid JSON"

**Symptom:** 400 error: "Invalid JSON data"

**Solution:**
- Extension is sending malformed data
- Check browser console for JavaScript errors
- Verify extension is latest version

## 🔍 Debugging Steps

### Step 1: Verify Server Status
```powershell
# In backend directory
python test_backend.py
```

This runs comprehensive tests on all endpoints.

### Step 2: Check Logs
```powershell
# View latest logs
Get-Content backend/logs/server.log -Tail 50
```

### Step 3: Test Individual Endpoints

**Health Check:**
```powershell
curl http://localhost:5000/api/health
```

**Sync (with sample data):**
```powershell
curl -X POST http://localhost:5000/api/sync `
  -H "Content-Type: application/json" `
  -d '{"sessions":[],"topics":[],"profile":{},"skills":[]}'
```

**Analytics:**
```powershell
curl http://localhost:5000/api/analytics?range=week
```

### Step 4: Monitor Real-time
Open two terminals:

**Terminal 1 - Run server:**
```powershell
cd backend
python start_server.py
```

**Terminal 2 - Monitor logs:**
```powershell
Get-Content backend/logs/server.log -Wait
```

## 📊 Connection Flow

```
Chrome Extension
     |
     | HTTP POST to http://localhost:5000/api/sync
     ↓
Flask Server (app.py)
     |
     | Parse & Validate
     ↓
Store in Database (SQLite)
     |
     | Process data
     ↓
AI Analysis Engine
     |
     | Generate insights
     ↓
Recommendation Engine
     |
     | Create recommendations
     ↓
Return JSON Response
     |
     ↓
Chrome Extension
     |
     | Display to user
```

## 🎯 Expected Behavior

### On Extension Sync:

1. **Extension sends:**
   - Sessions data
   - Topics data
   - User profile
   - Skills data

2. **Backend receives & processes:**
   - Validates data structure
   - Stores in database
   - Runs AI analysis
   - Generates recommendations

3. **Backend responds:**
   - Success status
   - Generated insights (array)
   - Recommendations (array)
   - Processing statistics

4. **Extension receives & displays:**
   - Shows insights in dashboard
   - Displays recommendations
   - Updates analytics

### Sync Frequency:
- Automatic: Every 15 minutes (when active)
- Manual: Click sync button in dashboard
- On demand: When viewing analytics

## 🔧 Configuration Reference

### Backend Port
**File:** `backend/config.py`
```python
SERVER_CONFIG = {
    'port': 5000,  # Change this if needed
}
```

### Extension Backend URL
**File:** Extension settings (or hardcoded)
```javascript
const BACKEND_URL = 'http://localhost:5000';
```

### CORS Origins
**File:** `backend/config.py`
```python
CORS_CONFIG = {
    'origins': '*',  # Development: allow all
    # Production: 'chrome-extension://your-id'
}
```

## 📱 Extension Settings

To change backend URL in extension:

1. Open extension popup
2. Click settings (if available)
3. Set custom backend URL
4. Default: `http://localhost:5000`

## ✨ Validation Commands

Run these to validate everything is working:

```powershell
# 1. Check Python version
python --version

# 2. Navigate to backend
cd backend

# 3. Check dependencies
pip list | Select-String -Pattern "flask"

# 4. Start server
python start_server.py

# 5. In new terminal - test endpoints
python test_backend.py

# 6. Check health
Invoke-WebRequest -Uri "http://localhost:5000/api/health"
```

## 🎓 Success Indicators

You have a successful connection when:

✅ Server starts without errors  
✅ Health check returns "healthy" status  
✅ Test script shows all tests passing  
✅ Extension shows "Synced successfully"  
✅ Dashboard displays insights  
✅ Recommendations appear  
✅ No CORS errors in browser console  

## 🆘 Emergency Reset

If nothing works, perform a complete reset:

```powershell
# 1. Stop server (Ctrl+C)

# 2. Remove database
Remove-Item backend/supriai.db

# 3. Clear logs
Remove-Item backend/logs/server.log

# 4. Reinstall dependencies
pip uninstall flask flask-cors -y
pip install -r backend/requirements.txt

# 5. Restart server
python backend/start_server.py

# 6. Test
python backend/test_backend.py
```

## 📞 Getting Help

If issues persist:

1. Check `backend/logs/server.log` for detailed errors
2. Run `python test_backend.py` and note which tests fail
3. Verify all checklist items above
4. Review error messages carefully
5. Check Python and pip versions

---

**Quick Start Command:**
```powershell
cd backend; python start_server.py
```

**Quick Test Command:**
```powershell
cd backend; python test_backend.py
```

**Quick Health Check:**
```powershell
curl http://localhost:5000/api/health
```
