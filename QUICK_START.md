# 🚀 Quick Start - Test Your Fixed Extension

## ✅ Everything is Ready!

All issues have been fixed and the extension is ready to test.

## 🏃 Fast Track Testing (5 minutes)

### Step 1: Verify Build ✅
```bash
# Already done! Check dist folder has these files:
# ✓ background.js
# ✓ dashboard.js
# ✓ popup.js
# ✓ sql-wasm.wasm
# ✓ manifest.json
```

### Step 2: Load Extension in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `d:\EchoLens\dist` folder
6. ✅ Extension should load without errors

### Step 3: Quick Test (2 minutes)

#### Test 1: Dashboard Opens
1. Click the EchoLens extension icon
2. Click "Open Dashboard"
3. ✅ Should open without "TypeError: a is not a function"
4. ✅ Should show empty state with emoji

#### Test 2: Visit Tracking
1. Open a new tab
2. Visit `https://github.com`
3. Wait 15 seconds (scroll around)
4. Open Dashboard
5. ✅ Should see GitHub in your memories

#### Test 3: Database Works
1. Press F12 (open DevTools)
2. Go to Console
3. Run this:
```javascript
chrome.runtime.sendMessage({ type: 'GET_STATS' }, (res) => {
  console.log('✅ Stats:', res.stats);
});
```
4. ✅ Should see stats object with numbers

#### Test 4: Search Works
1. Visit 2-3 more websites (wait 15s each)
2. Open Dashboard
3. Press `Ctrl+K` or click search
4. Type "github"
5. ✅ Results should filter

#### Test 5: Export Works
1. In Dashboard, click "Export Data"
2. ✅ Should download a JSON file
3. Open file - should have `version: "2.0"`

## ✅ Success Indicators

You'll know it's working if:
- ✅ No error messages in console
- ✅ Dashboard loads smoothly
- ✅ Visits are tracked and displayed
- ✅ Search filters results
- ✅ Stats show correct numbers
- ✅ Export downloads file

## 🔧 If You See Issues

### Dashboard Won't Open
```javascript
// Check for errors:
// 1. Right-click extension icon → Inspect popup
// 2. Look at Console for errors
// 3. Try reloading extension
```

### No Data Showing
```javascript
// Check database:
chrome.storage.local.get(['echolens.db'], (result) => {
  console.log('DB exists:', !!result['echolens.db']);
  console.log('DB size:', result['echolens.db']?.length || 0);
});

// If no DB, wait 15+ seconds on a page first
```

### "a is not a function" Still Appears
```javascript
// This means build didn't complete
// Solution: Run build again
cd d:\EchoLens
npm run build

// Then reload extension in chrome://extensions/
```

## 🎯 All Features to Test

Quick checklist:

### Core Features:
- [ ] Visit tracking (15+ seconds per page)
- [ ] Dashboard views (Map, List, Timeline, Insights)
- [ ] Search (Ctrl+K)
- [ ] Filters (date, visits, tags)
- [ ] Stats display
- [ ] Export data (Ctrl+E)
- [ ] Import data

### Views:
- [ ] Knowledge Map (or fallback if graph fails)
- [ ] Memory List (cards with details)
- [ ] Timeline (chronological)
- [ ] AI Insights (shows summaries if available)

### Keyboard Shortcuts:
- [ ] Ctrl+K → Search
- [ ] 1 → Knowledge Map
- [ ] 2 → Memory List
- [ ] 3 → Timeline
- [ ] 4 → AI Insights
- [ ] Ctrl+E → Export

## 📊 Expected Behavior

### After visiting 5 websites:

**Stats should show:**
```
Total Visits: 5
Total Time Spent: ~75s (varies)
This Week: 5
Highlights: 0 (unless you saved some)
```

**Dashboard should show:**
- 5 memory cards in List view
- 5 nodes in Map view
- 5 entries in Timeline
- Some AI insights (if API key configured)

## 🎉 Success!

If all tests pass, you have:
1. ✅ Fixed the "TypeError: a is not a function" error
2. ✅ SQLite database working perfectly
3. ✅ All functionalities operational
4. ✅ Extension ready for daily use

## 🔍 Deep Testing

For comprehensive testing, see: `TESTING_GUIDE_V2.md`

## 📝 Notes

- **First load**: May take 1-2 seconds to initialize database
- **Minimum time**: Spend 10+ seconds per page for tracking
- **AI features**: Optional, work without API key (uses fallback)
- **Data safety**: Everything stored locally in Chrome

## 🆘 Quick Fixes

### Clear Everything and Start Fresh:
```javascript
// In DevTools Console (background service worker):
chrome.storage.local.clear(() => {
  console.log('✅ Cleared. Reload extension.');
});
```

### Rebuild Extension:
```bash
cd d:\EchoLens
npm run build
# Then reload in chrome://extensions/
```

### Check Build Output:
```bash
# Should see in dist/:
ls dist/
# ✓ All .js files
# ✓ sql-wasm.wasm (644KB)
# ✓ manifest.json
```

---

## 🎊 You're All Set!

The extension is fixed and ready to use. Enjoy your digital memory layer! 🌌

**Need help?** Check `COMPLETE_FIX_SUMMARY.md` for detailed information.
