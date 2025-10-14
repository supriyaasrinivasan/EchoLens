# 🚨 EchoLens Quick Debug Reference

## 1️⃣ Is the Extension Loading?

```
chrome://extensions/ → Find EchoLens
```

**✅ Good:** Green "Enabled" status  
**❌ Bad:** Red error box → Copy error text

---

## 2️⃣ Is Background Worker Running?

```
chrome://extensions/ → EchoLens → Inspect views → service worker
```

**✅ Good:** Console shows: `🌌 EchoLens Background Service Worker initialized`  
**❌ Bad:** Console errors → Copy all red text

---

## 3️⃣ Does Popup Work?

```
Click extension icon → Right-click popup → Inspect
```

**✅ Good:** Shows stats or "No memories yet"  
**❌ Bad:** Blank, loading forever, or errors → Check Console tab

---

## 4️⃣ Does Dashboard Work?

```
Right-click extension icon → Options → Press F12
```

**✅ Good:** Shows 4 views (Map, List, Timeline, Insights)  
**❌ Bad:** Blank, errors, or broken layout → Check Console tab

---

## 5️⃣ Common Console Errors

### ❌ "TypeError: o is not a function"
**Status:** Should be FIXED now (removed dynamic imports)  
**If still seeing:** Report immediately with screenshot

### ❌ "unsafe-eval not allowed in CSP"
**Status:** Should be FIXED now (changed webpack devtool)  
**If still seeing:** Report immediately with screenshot

### ❌ "Extension context invalidated"
**Status:** NORMAL during development  
**Fix:** Reload extension (🔄 on chrome://extensions/), close/reopen popup

### ❌ "Failed to load module"
**Possible cause:** Build incomplete  
**Fix:** Run `npm run build` again

### ❌ "chrome.runtime.sendMessage error"
**Possible cause:** Background worker crashed  
**Fix:** Reload extension, check service worker console

---

## 6️⃣ Emergency Reset

```powershell
cd D:\EchoLens
Remove-Item -Recurse -Force dist
npm run build
```

Then: `chrome://extensions/` → Click 🔄 on EchoLens

---

## 7️⃣ What to Report

**Format:**
```
Component: [Popup / Dashboard / Background / Content Script]
Error: [Exact console error - copy/paste]
Screenshot: [attach image]
Steps:
1. [What you did]
2. [What happened]
3. [What you expected]
```

**Example:**
```
Component: Dashboard - Knowledge Map
Error: Uncaught ReferenceError: ForceGraph2D is not defined
Screenshot: [image showing console]
Steps:
1. Opened dashboard
2. Clicked "Knowledge Map" view
3. Expected to see graph, got blank screen
```

---

## 8️⃣ Test Data Generation

To test if tracking works:

1. Visit any website (e.g., wikipedia.org)
2. Stay for 30+ seconds
3. Scroll, click links
4. Open popup → "This Page" tab
5. Should show visit count and time

**If not working:** Check service worker console for errors

---

## 9️⃣ Quick Checks

| Component | Check | Expected |
|-----------|-------|----------|
| Build | `npm run build` | Exit code 0, 3 warnings OK |
| Dist folder | `ls dist` | manifest.json, *.js, *.html exist |
| Extension load | chrome://extensions/ | Green "Enabled" |
| Service worker | Inspect service worker | Init message shown |
| Popup | Click icon | Shows content |
| Dashboard | Right-click → Options | Opens page |

---

## 🔟 Files to Check

**If errors persist, verify these exist:**
```
D:\EchoLens\dist\
  ├── manifest.json       (must exist)
  ├── dashboard.js        (must exist, ~395KB)
  ├── popup.js            (must exist, ~169KB)
  ├── background.js       (must exist, ~25KB)
  ├── content.js          (must exist, ~9KB)
  ├── dashboard.html      (must exist)
  └── popup.html          (must exist)
```

**Check with:**
```powershell
Get-ChildItem D:\EchoLens\dist | Select-Object Name, Length
```

---

## 📞 What I Need to Fix Bugs

Please provide **ALL** of these:

1. ✅ Which component (popup/dashboard/background/content)
2. ✅ Exact error from console (copy/paste red text)
3. ✅ Screenshot of error
4. ✅ What you were doing when it broke
5. ✅ Service worker console log (if background issue)

**Without these, I'm debugging blind!** 🙏

---

## ⚡ Quick Command Reference

```powershell
# Rebuild
npm run build

# Check if build succeeded
echo $LASTEXITCODE  # Should be 0

# List dist files
ls dist

# Clean rebuild
Remove-Item -Recurse -Force dist; npm run build
```

---

## 🎯 Most Likely Issues

Based on your "still has more bugs" comment:

1. **Extension loads but dashboard blank?**
   → Check dashboard console (F12)

2. **Popup shows "Loading..." forever?**
   → Check service worker console (background crashed)

3. **Knowledge Map shows nothing?**
   → Should show fallback grid view (purple/blue boxes)

4. **Errors about missing modules?**
   → Run clean rebuild

5. **Everything works but no data?**
   → Visit websites for 30s to generate test data

---

**Read these docs for more detail:**
- `TESTING_GUIDE.md` - Full testing walkthrough
- `EXTENSION_STATUS.md` - What was fixed + current status
- `TROUBLESHOOTING.md` - Common problems

**Let me know SPECIFICALLY what's broken!** 🔧