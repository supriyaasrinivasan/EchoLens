# SupriAI - Backend Connectivity Setup Guide

## Quick Setup (Recommended)

### 1. Start Backend Server
```bash
cd backend
python start_server.py
```

The server will:
- Check Python version (requires 3.7+)
- Install missing dependencies automatically
- Initialize the database
- Start on `http://localhost:5000`

### 2. Verify Connection
Open in browser: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "healthy",
  "service": "SupriAI Backend",
  "database": { "status": "connected" }
}
```

### 3. Chrome Extension Auto-Connects
The extension automatically connects to `http://localhost:5000`

No configuration needed! ✅

---

## Custom Backend URL

If you're running the backend on a different port or server:

### Option 1: Extension Settings (Recommended)
1. Open SupriAI Dashboard
2. Go to Settings
3. Update "Backend URL"
4. Save

### Option 2: Configuration File
Edit `js/config.js`:
```javascript
const CONFIG = {
    BACKEND_URL: 'http://your-server:port',
    ...
};
```

---

## Backend Endpoints

All endpoints are prefixed with `/api/`

### Core Endpoints
- `GET /api/health` - Server health check
- `POST /api/sync` - Sync learning data (main endpoint)
- `GET /api/analytics?range=week` - Get analytics
- `GET /api/recommendations` - Get recommendations

See [BACKEND_API.md](BACKEND_API.md) for complete API documentation.

---

## Connection Flow

```
Chrome Extension
    ↓
Check Backend URL (default: http://localhost:5000)
    ↓
Try Connection (5 second timeout)
    ↓
    ├─→ Success: Use backend AI analysis
    └─→ Fail: Use local analysis (offline mode)
```

The extension works perfectly in **offline mode** with local AI analysis!

---

## Troubleshooting

### Backend Not Connecting

**1. Check if server is running:**
```bash
curl http://localhost:5000/api/health
```

**2. Check port availability:**
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

**3. Check firewall:**
- Allow Python through Windows Firewall
- Allow port 5000 inbound/outbound

**4. Try different port:**
Edit `backend/config.py`:
```python
SERVER_CONFIG = {
    'port': 8080,  # Change to 8080 or another available port
}
```

Then update extension config to match.

### CORS Errors

If you see CORS errors in browser console:

Edit `backend/config.py`:
```python
CORS_CONFIG = {
    'origins': '*',  # Allow all origins
    'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allow_headers': ['Content-Type', 'Authorization'],
}
```

Restart the backend server.

### Extension Shows "Backend Offline"

This is **normal** if:
- Backend server is not running
- Server URL is incorrect
- Network connection issues

The extension will automatically use **local mode** and continue working!

---

## Production Deployment

### Using Gunicorn (Recommended)
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

Build and run:
```bash
docker build -t supriai-backend .
docker run -p 5000:5000 supriai-backend
```

### Environment Variables
```bash
export SUPRIAI_PORT=5000
export SUPRIAI_HOST=0.0.0.0
export SUPRIAI_DEBUG=false
python app.py
```

---

## Testing Connection

### Manual Test
```bash
curl -X POST http://localhost:5000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"sessions":[],"topics":[]}'
```

### Extension Test
1. Open SupriAI Dashboard
2. Click "Sync with Backend" button
3. Check browser console (F12) for connection logs
4. Look for success/error messages

---

## Network Configuration

### Running on Different Machine

1. **Find your IP address:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

2. **Update backend config:**
```python
SERVER_CONFIG = {
    'host': '0.0.0.0',  # Listen on all interfaces
    'port': 5000,
}
```

3. **Update extension config:**
```javascript
BACKEND_URL: 'http://192.168.1.100:5000'  // Your IP
```

4. **Configure firewall** to allow port 5000

---

## Security Best Practices

### For Production:

1. **Use HTTPS:**
   - Set up SSL certificates
   - Use reverse proxy (nginx)

2. **Restrict CORS:**
```python
CORS_CONFIG = {
    'origins': ['chrome-extension://your-extension-id'],
}
```

3. **Add Authentication:**
   - Implement API keys
   - Use JWT tokens
   - Add rate limiting

4. **Secure Database:**
   - Use proper file permissions
   - Regular backups
   - Encryption at rest

---

## Support

- **Documentation:** See [BACKEND_API.md](BACKEND_API.md)
- **Issues:** Create issue on GitHub
- **Logs:** Check `backend/logs/server.log`

---

## Summary

✅ **Default Setup:** Backend on `localhost:5000`, extension auto-connects

✅ **Offline Mode:** Extension works without backend

✅ **Custom Setup:** Easy configuration via settings or config file

✅ **Production Ready:** Docker, Gunicorn, environment variables supported
