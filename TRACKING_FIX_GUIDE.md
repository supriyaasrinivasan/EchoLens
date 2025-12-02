# SupriAI Tracking Fix - Complete Guide

## Issues Fixed

### 1. ✅ Extension Context Invalidation
- Added safe message passing with timeout
- Graceful error handling for extension reloads
- Fixed "insights is not iterable" error

### 2. ✅ Tracking Not Starting
- Fixed message handlers in background script
- Added PAGE_READY and PAGE_CONTENT handlers
- Improved content script initialization
- Now tracks ALL pages (not just educational ones)

### 3. ✅ Classification Issues
- Added `classifyContent()` method
- Enhanced error handling in classifier
- Better logging for debugging

### 4. ✅ Popup Not Showing Data
- Fixed safe message passing in popup
- Added proper error handling
- Shows friendly messages on errors

---

## How to Test

### Step 1: Reload the Extension

1. Open Chrome and go to `chrome://extensions`
2. Find "SupriAI - Learning Recommendation System"
3. Click the **Reload** button (circular arrow icon)
4. Extension should reload without errors

### Step 2: Open Developer Console

1. Right-click on the SupriAI extension icon
2. Select "Inspect popup" (this opens popup's console)
3. Also press F12 on any web page to see page console
4. Look for these messages:

**In Background Console (right-click extension icon → "Inspect service worker"):**
```
SupriAI: Initializing background service worker...
SupriAI: Background service worker initialized
SupriAI Background Service Starting...
SupriAI Background Service Ready
```

**When you visit a page:**
```
✓ Session started: Python.org [Programming]
✓ Page classified: Welcome to Python.org → Programming
```

**In Page Console (F12 on any page):**
```
✓ SupriAI: Tracking started for session: <tabId>
```

### Step 3: Test on Python.org

1. Go to https://www.python.org
2. Wait 2-3 seconds for page to load
3. Open extension popup
4. You should see:
   - **Current Page Title:** "Welcome to Python.org" (or similar)
   - **Category:** "Programming" or "General Learning"
   - **Engagement:** Should start at 0% and increase
   - **Focus Level:** Dots should appear as you interact

### Step 4: Test Tracking Functionality

1. **Scroll** the page → Engagement should increase
2. **Move mouse** around → Focus dots should light up
3. **Click** links → Metrics update
4. Wait 5 seconds → Popup should auto-refresh with new data

### Step 5: Verify Console Messages

**Expected Messages (NO ERRORS):**
```
✓ SupriAI: Tracking started for session: 123
✓ Session started: Python.org [Programming]
✓ Page classified: Welcome to Python.org → Programming
```

**Should NOT See:**
```
❌ Uncaught Error: Extension context invalidated
❌ TypeError: insights is not iterable
❌ Error: Could not establish connection
```

---

## Debugging Checklist

### If Popup Shows "Not tracked":

1. **Check Background Console:**
   - Right-click extension icon → "Inspect service worker"
   - Look for: `✓ Session started:` message
   - If missing, the session isn't starting

2. **Check Page Console (F12):**
   - Look for: `✓ SupriAI: Tracking started for session:`
   - If missing, content script isn't loading

3. **Check manifest.json:**
   - Verify `content_scripts` section exists
   - Verify `js/content.js` path is correct

4. **Reload Everything:**
   - Reload extension
   - Refresh the web page
   - Close and reopen popup

### If Engagement Stays at 0%:

1. **Interact with the page:**
   - Scroll up and down
   - Move mouse around
   - Click on things
   
2. **Check content script is running:**
   - F12 on the page
   - Console tab
   - Look for SupriAI messages

3. **Check background is receiving metrics:**
   - Inspect service worker
   - Should see UPDATE_ENGAGEMENT messages

### If Focus Dots Don't Light Up:

1. **Move mouse actively on the page**
2. **Click several times**
3. **Wait 5 seconds** for update
4. **Check popup console** for errors

---

## What Should Work Now

### ✅ Automatic Tracking
- Extension automatically tracks pages when loaded
- No manual start needed
- Works on all websites (not just educational)

### ✅ Classification
- Pages are classified by category
- Topics are extracted
- Confidence scores calculated
- Shows in popup immediately

### ✅ Real-time Metrics
- Engagement updates every 5 seconds
- Focus level based on mouse activity
- Scroll depth tracked
- Time on page counted

### ✅ Error Handling
- No "Extension context invalidated" errors
- Graceful degradation on failures
- User-friendly error messages
- No console spam

---

## Key Changes Made

### 1. Background Script (`js/background.js`)
```javascript
// Added missing message handlers
case 'PAGE_READY':
case 'PAGE_CONTENT':

// Now tracks ALL pages (removed educational filter)
// Track all pages, not just educational ones (for better analytics)

// Better logging
console.log(`✓ Session started: ${session.title} [${session.category}]`);
```

### 2. Content Script (`js/content.js`)
```javascript
// Safe message passing
safeSendMessage({ type: 'PAGE_READY' }).catch(err => {
    console.log('SupriAI: Failed to notify background script:', err.message);
});

// Disconnect detection
chrome.runtime.connect({ name: 'content-script' }).onDisconnect.addListener(...)
```

### 3. Classifier (`js/classifier.js`)
```javascript
// Added method for content-based classification
async classifyContent(pageData) {
    return this.classifyWithContent(pageData.url, pageData.title, pageData);
}
```

### 4. Utilities (`js/utils.js`)
```javascript
// Added helper functions
export function isExtensionContextValid()
export function safeSendMessage(message, timeout = 5000)
```

### 5. Storage (`js/storage.js`)
```javascript
// Fixed iteration error
try {
    if (Array.isArray(insights)) {
        for (const insight of insights) { ... }
    }
} catch (error) {
    console.error('Error saving AI insights:', error);
}
```

---

## Testing Different Scenarios

### Test 1: Educational Site (Python.org)
**Expected:**
- Category: "Programming"
- Tracked: Yes
- Topics: ["Python", "Programming"]

### Test 2: Regular Website (GitHub.com)
**Expected:**
- Category: "Programming" or "General"
- Tracked: Yes
- Topics: Based on page content

### Test 3: Non-Educational Site (Reddit.com)
**Expected:**
- Category: "General" 
- Tracked: Yes (but lower engagement)
- Topics: Minimal

### Test 4: Extension Reload
**Expected:**
- No errors in console
- Message: "Extension context invalidated, tracking stopped"
- Popup shows: "Extension Reloaded - Refresh page to track"

---

## Still Having Issues?

### 1. Complete Reset:
```powershell
# In VS Code terminal
cd "C:\Users\jayan\OneDrive\Desktop\SupriAI"
# Then manually:
# 1. Go to chrome://extensions
# 2. Remove SupriAI completely
# 3. Click "Load unpacked" again
# 4. Select the SupriAI folder
# 5. Refresh all open web pages
```

### 2. Check File Paths:
- All files should be in correct locations
- manifest.json at root
- js/content.js exists
- js/background.js exists

### 3. Check Permissions:
- manifest.json has all required permissions
- Extension has access to <all_urls>

### 4. Check Console for Specific Errors:
- Background: Right-click icon → Inspect service worker
- Popup: Right-click icon → Inspect popup  
- Page: Press F12 on any webpage

---

## Success Indicators

✅ **Background Console shows:**
```
SupriAI: Initializing background service worker...
SupriAI Background Service Ready
✓ Session started: [Page Title] [Category]
```

✅ **Page Console shows:**
```
✓ SupriAI: Tracking started for session: [number]
```

✅ **Popup shows:**
```
Current Page Analysis
[Page Title]
[Category Name]
Engagement: [increasing number]%
Focus Level: [dots lighting up]
```

✅ **No errors anywhere**

---

## Quick Command Reference

```powershell
# Navigate to project
cd "C:\Users\jayan\OneDrive\Desktop\SupriAI"

# View recent changes
git status

# If needed, commit changes
git add .
git commit -m "Fix tracking and extension context issues"
git push
```

---

**Status:** All tracking issues should now be FIXED! 🎉

If tracking still doesn't work after following this guide, please check:
1. Chrome version (should be latest)
2. Extension is enabled
3. No conflicting extensions
4. Console shows the expected messages above
