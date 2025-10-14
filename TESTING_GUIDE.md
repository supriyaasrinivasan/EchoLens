# EchoLens Testing Guide

## 🔍 How to Identify and Report Bugs

This guide will help you test the extension and identify any remaining issues.

---

## Step 1: Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `D:\EchoLens\dist` folder
5. Verify the extension appears with no errors

**✅ Expected:** Extension loads with green "Enabled" status  
**❌ If you see errors:** Copy the exact error message from the red error box

---

## Step 2: Check Background Service Worker

1. On `chrome://extensions/`, find EchoLens
2. Click **Inspect views** → **service worker**
3. Check the Console tab for any errors

**✅ Expected:** You should see `🌌 EchoLens Background Service Worker initialized`  
**❌ If you see errors:** Copy all red error messages from console

---

## Step 3: Test the Popup

1. Click the EchoLens icon in your browser toolbar
2. Open Chrome DevTools on the popup (right-click popup → Inspect)
3. Check Console for errors

**✅ Expected:** Popup shows stats and "Overview" tab  
**❌ Common issues to check:**
- Does the popup show "Loading your memories..."?
- Are there red errors in console?
- Does it show stats or "No memories yet"?

**Screenshot what you see and note any console errors**

---

## Step 4: Test the Dashboard

1. Right-click the EchoLens icon → Click "Options" (or "Open Memory Dashboard")
2. This opens the full dashboard page
3. Press **F12** to open DevTools
4. Check the Console tab

**✅ Expected:** Dashboard loads with these views:
- 🗺️ Knowledge Map (shows graph or fallback grid)
- 📚 Memory List
- 📅 Memory Timeline  
- ✨ AI Insights

**❌ Common issues to check:**
- Does dashboard show "Loading your memories..."?
- Does Knowledge Map show graph or fallback grid view?
- Are there errors in console about:
  - `TypeError: o is not a function` ← This should be FIXED now
  - `unsafe-eval` CSP violations ← This should be FIXED now
  - `Failed to load module` errors
  - `chrome.runtime.sendMessage` errors

**Copy ALL console errors you see**

---

## Step 5: Test Content Script

1. Visit any website (e.g., wikipedia.org, reddit.com)
2. Open DevTools (F12) and check Console
3. Look for EchoLens messages or errors

**✅ Expected:** Content script injects silently, no errors  
**❌ Check for:**
- CSP violations
- Script injection errors
- Permission errors

---

## Step 6: Test Core Features

### A. Visit Tracking
1. Visit a website and spend 30+ seconds on it
2. Open the popup → Check "This Page" tab
3. You should see visit count and time spent

**✅ Expected:** Shows "Memory Recall" with visit stats  
**❌ If broken:** Note what's missing

### B. Highlighting (if implemented)
1. Select text on any webpage
2. Right-click → Check for highlight option
3. Test if highlights save

**✅ Expected:** Highlights appear in popup "This Page"  
**❌ If broken:** Note the error

### C. Data Export/Import
1. Open Dashboard
2. Click "Export Data" in sidebar
3. Check if JSON file downloads

**✅ Expected:** File downloads with timestamp  
**❌ If broken:** Check console errors

---

## 🐛 Bug Reporting Checklist

When you say "still has more bugs", please provide:

### 1. **Which component is broken?**
- [ ] Extension won't load at all
- [ ] Background service worker errors
- [ ] Popup won't open/shows errors
- [ ] Dashboard won't load
- [ ] Knowledge Map component
- [ ] Other specific component: __________

### 2. **Exact error messages**
Copy from Chrome DevTools Console:
```
[Paste console errors here]
```

### 3. **What were you doing when it broke?**
- [ ] Just loaded the extension
- [ ] Clicked on popup
- [ ] Opened dashboard
- [ ] Switched views in dashboard
- [ ] Visited a webpage
- [ ] Other: __________

### 4. **Screenshots**
Take screenshots of:
- The error in DevTools console
- What the broken UI looks like
- The service worker console (if applicable)

---

## 🔧 Quick Self-Diagnostics

### Issue: Extension won't load
**Check:**
- Is `dist/` folder generated? (should contain manifest.json, *.js files)
- Is manifest.json valid? Check for syntax errors

**Fix:** Run `npm run build` again

---

### Issue: "Extension context invalidated"
**This is normal during development!**

**Fix:** 
1. Go to `chrome://extensions/`
2. Click the reload icon (🔄) on EchoLens
3. Close and reopen popup/dashboard

---

### Issue: Dashboard shows blank page
**Check console for:**
- React errors
- Module loading errors
- CSP violations

**Quick test:**
1. Open `D:\EchoLens\dist\dashboard.html` directly in browser
2. Check if it loads (will have different behavior but shows if React works)

---

### Issue: Popup shows "Loading..." forever
**Likely causes:**
- Background service worker not running
- Message passing broken

**Fix:**
1. Check service worker console for errors
2. Reload extension
3. Check Chrome storage permissions in manifest.json

---

## 📊 Current Status (After Latest Fixes)

### ✅ FIXED:
- TypeError "o is not a function" (removed dynamic imports)
- CSP violation "unsafe-eval" (changed webpack devtool)
- Dynamic import() blocked by CSP (changed to static require)
- Added fallback visualization for Knowledge Map

### ⚠️ NEEDS TESTING:
- All components render correctly
- Background message passing works
- Storage operations work
- AI processing (if API key configured)
- Export/Import functionality
- Search and filtering

---

## 🎯 Next Steps

1. **Follow steps 1-6 above**
2. **Note every error you encounter**
3. **Provide specific details:**
   - Component name
   - Exact error message
   - What you clicked/did
   - Screenshot if possible

4. **Share with me:**
```
Component: [e.g., Dashboard - Knowledge Map]
Error: [exact console error]
Steps to reproduce:
1. 
2. 
3. 
Screenshot: [attach]
```

This will help me fix the exact issues you're experiencing!

---

## 💡 Pro Tips

- **Always check BOTH consoles:** Popup/Dashboard console AND service worker console
- **Reload extension** after each code change (click 🔄 on chrome://extensions/)
- **Hard refresh pages** after reloading extension (Ctrl+Shift+R)
- **Check Network tab** in DevTools if seeing loading issues
- **Disable other extensions** temporarily to rule out conflicts

---

## 🆘 Emergency Reset

If everything is broken:

```powershell
# Clean rebuild
cd D:\EchoLens
Remove-Item -Recurse -Force dist
npm run build
```

Then reload extension on `chrome://extensions/`

---

**Once you've completed these tests, share:**
1. Which steps passed ✅
2. Which steps failed ❌  
3. Exact error messages from console
4. Screenshots

I'll then fix the specific issues!