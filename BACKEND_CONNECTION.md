# Backend Connectivity - Quick Reference

## Default Configuration

**Backend Server:** `http://localhost:5000`

**Frontend Config:** `js/config.js`

**Backend Config:** `backend/config.py`

## How It Works

```
1. Extension loads → Reads js/config.js
2. User clicks "Sync" → Sends data to backend
3. Backend URL: CONFIG.BACKEND_URL (default: http://localhost:5000)
4. Timeout: CONFIG.SYNC_TIMEOUT (default: 5000ms)
5. If backend offline → Falls back to local analysis
```

## Connection Points

### Frontend → Backend
- **File:** `dashboard/dashboard.js`
- **Function:** `syncWithBackend()`
- **URL Source:** `CONFIG.BACKEND_URL` from `js/config.js`
- **Endpoint:** `POST /api/sync`

### Backend Configuration
- **File:** `backend/config.py`
- **Host:** `0.0.0.0` (all interfaces)
- **Port:** `5000`
- **CORS:** Enabled for all origins

## Quick Start

### 1. Start Backend
```bash
cd backend
python start_server.py
```

### 2. Verify
```bash
curl http://localhost:5000/api/health
```

### 3. Use Extension
- Extension auto-connects
- No setup needed!

## Change Backend URL

### Method 1: Config File (Permanent)
Edit `js/config.js`:
```javascript
BACKEND_URL: 'http://your-server:port'
```

### Method 2: Extension Settings (User Override)
1. Open Dashboard
2. Settings Tab
3. Update Backend URL
4. Save

## Troubleshooting

**Backend not responding?**
- Check if server is running
- Verify port 5000 is not blocked
- Check firewall settings

**CORS errors?**
- Backend already configured to allow all origins
- Check console for specific error

**Connection timeout?**
- Default is 5 seconds
- Adjust in `js/config.js`: `SYNC_TIMEOUT`

## Files to Check

1. **Frontend Config:** `js/config.js` - Backend URL and settings
2. **Backend Config:** `backend/config.py` - Server port and CORS
3. **Dashboard Code:** `dashboard/dashboard.js` - Connection logic
4. **API Docs:** `BACKEND_API.md` - Full API reference
5. **Setup Guide:** `CONNECTIVITY_GUIDE.md` - Detailed instructions

## Summary

✅ Backend URL is centralized in `js/config.js`

✅ Default: `http://localhost:5000`

✅ Extension works offline if backend unavailable

✅ No configuration needed for default setup

✅ Easy to customize for production deployment
