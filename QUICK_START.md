# SupriAI Quick Start Guide

## 🚀 Installation & Setup (5 Minutes)

### Step 1: Build the Extension
```powershell
cd d:\SupriAI
npm install
npm run build
```

### Step 2: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Toggle "Developer mode" ON (top-right corner)
3. Click "Load unpacked"
4. Navigate to `d:\SupriAI\dist` and select it
5. Pin the SupriAI extension to your toolbar

### Step 3: Configure AI (Optional but Recommended)
1. Click the SupriAI icon in your toolbar
2. Click "Settings" or "Open Dashboard"
3. Navigate to Settings → AI Configuration
4. Enter your OpenAI API key
5. Select provider (OpenAI recommended)
6. Save settings

### Step 4: Start Using
- Browse normally - SupriAI captures context automatically
- Set goals in the Dashboard
- Review your weekly personality snapshots
- Ask your Digital Twin questions

---

## 🖥️ Server Setup (Optional - For Cloud Sync)

### Local MongoDB Setup
```powershell
# Install MongoDB (if not installed)
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB
mongod --dbpath C:\data\db

# In a new terminal, start the SupriAI server
cd d:\SupriAI
npm run server
```

### Production Deployment
```powershell
# Using PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs supriai-api
```

---

## 🔑 Quick Commands

### Development
```powershell
# Watch mode (auto-rebuild on changes)
npm run dev

# Server with auto-reload
npm run server:dev
```

### Production Build
```powershell
# Build optimized version
npm run build
```

### Testing
```powershell
# Check if server is running
curl http://localhost:3000/health

# View server info
curl http://localhost:3000/api
```

---

## 📱 Usage Tips

### Setting Your First Goal
1. Open Dashboard (click extension icon → "Open Dashboard")
2. Go to "Goals" tab
3. Click "Add New Goal"
4. Fill in:
   - **Title**: e.g., "Learn React"
   - **Description**: What you want to achieve
   - **Keywords**: react, jsx, hooks, components
   - **Target**: 10 hours this month
5. Save and browse normally - SupriAI will track alignment

### Using Digital Twin
1. Navigate to "Digital Twin" tab in Dashboard
2. Ask questions like:
   - "What were my top interests last month?"
   - "How has my reading tone changed?"
   - "Am I spending more time on learning or entertainment?"
3. Get AI-powered insights based on your browsing

### Viewing Personality Snapshots
1. Go to "Personality" tab in Dashboard
2. View your weekly snapshot with:
   - Dominant tone
   - Top topics
   - Emotional themes
   - Quote of the week
3. Track evolution over time

---

## 🛠️ Troubleshooting

### Extension Not Loading
1. Check console: `Ctrl+Shift+J` (Windows)
2. Look for errors in the Console tab
3. Ensure `dist` folder exists and has files
4. Rebuild: `npm run build`

### Server Not Starting
1. Check MongoDB is running: `mongod --version`
2. Verify port 3000 is free: `netstat -ano | findstr :3000`
3. Check logs in `logs/` folder
4. Verify `.env` file exists with correct MongoDB URI

### Data Not Saving
1. Check Chrome storage quota
2. Open DevTools → Application → Storage
3. Clear old data if needed
4. Check background service worker console

### AI Not Working
1. Verify API key is entered correctly
2. Check OpenAI account has credits
3. Look for errors in background service worker console
4. Fallback summaries will be used if API fails

---

## 📂 File Structure Reference

```
SupriAI/
├── dist/                    # Built extension (load this in Chrome)
├── src/
│   ├── background/          # Service worker scripts
│   ├── content/             # Content scripts (injected into pages)
│   ├── dashboard/           # Main dashboard UI
│   ├── popup/               # Extension popup
│   └── shared/              # Shared utilities
├── server/                  # Optional backend server
├── manifest.json            # Extension configuration
├── package.json             # Dependencies
└── webpack.config.js        # Build configuration
```

---

## 🎯 Key Features at a Glance

| Feature | Location | What It Does |
|---------|----------|--------------|
| **Memory Layer** | Dashboard → Memories | Shows all pages visited with summaries |
| **Personality Snapshots** | Dashboard → Personality | Weekly identity insights |
| **Interest Timeline** | Dashboard → Evolution | Visual journey of interests over time |
| **Goal Tracking** | Dashboard → Goals | Set and track intentional browsing goals |
| **Digital Twin** | Dashboard → Digital Twin | AI that knows your browsing patterns |
| **Knowledge Map** | Dashboard → Knowledge Map | Visual network of pages and topics |
| **Focus Mode** | Dashboard → Settings | Distraction-free browsing sessions |
| **Highlights** | Right-click on selected text | Save important passages |

---

## 🔐 Privacy & Data

- ✅ **All data stored locally** in your browser by default
- ✅ **No tracking** - Your data never leaves your computer (unless you use server sync)
- ✅ **Open source** - Review the code anytime
- ✅ **You control AI** - Your API key, your data
- ✅ **Export anytime** - Settings → Export Data

---

## 📚 Resources

- **Full Documentation**: See `README.md`
- **Backend Fixes**: See `BACKEND_FIXES_SUMMARY.md`
- **Component Structure**: See `docs/SKILLIFY_COMPONENT_STRUCTURE.md`
- **GitHub**: [EchoLens Repository](https://github.com/supriyaasrinivasan/EchoLens)

---

## 💡 Pro Tips

1. **Set Weekly Goals on Monday** - Review them Sunday evening
2. **Check Personality Snapshots Weekly** - See how you've evolved
3. **Use Focus Mode for Deep Work** - 25-90 minute sessions
4. **Ask Your Digital Twin Monthly** - "What am I avoiding?"
5. **Export Data Regularly** - Backup your digital journey

---

## 🆘 Need Help?

1. **Check Console Logs**: Most issues show error messages
2. **Rebuild Extension**: `npm run build` fixes most issues
3. **Clear Storage**: Settings → Clear All Data (last resort)
4. **GitHub Issues**: Report bugs with console logs
5. **Discord/Community**: (Coming soon)

---

**Happy Browsing with SupriAI! 🪞✨**

_Your AI mirror for digital self-awareness_
