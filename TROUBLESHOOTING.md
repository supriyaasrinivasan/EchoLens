# EchoLens Troubleshooting Guide

## Common Issues After Fix

### 1. Dashboard Shows Blank Screen

**Solution:**
1. Open DevTools (F12) on the dashboard page
2. Check console for errors
3. If you see "Failed to load resource":
   ```bash
   cd D:\EchoLens
   npm run build
   ```
4. Reload extension in Chrome

### 2. "Extension context invalidated" Error

**Cause:** Extension was updated while dashboard was open.

**Solution:**
1. Close all EchoLens dashboard tabs
2. Go to `chrome://extensions/`
3. Click **Reload** on EchoLens
4. Reopen dashboard

### 3. Old Cached Version Loading

**Solution:**
1. Open `chrome://extensions/`
2. Click **Details** on EchoLens
3. Scroll down and click **Clear extension data**
4. Click **Reload** extension
5. Reopen dashboard

### 4. Knowledge Map Not Showing

**Expected Behavior:** You should see the new cluster-based visualization (not the force-directed graph).

**If you see errors:**
1. Check if `react-force-graph-2d` is installed:
   ```bash
   npm install
   ```
2. Rebuild:
   ```bash
   npm run build
   ```
3. The fallback visualization should work regardless

### 5. CSP Errors in Console

**If you still see CSP errors:**

1. Check `manifest.json` has:
   ```json
   "content_security_policy": {
     "extension_pages": "script-src 'self'; object-src 'self'"
   }
   ```

2. Check `dist/dashboard.html` has:
   ```html
   <meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'self'">
   ```

3. Rebuild if missing:
   ```bash
   npm run build
   ```

### 6. Build Warnings About Bundle Size

**This is normal!** Chrome extensions can have larger bundles. The warnings are:

```
WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
Assets: 
  dashboard.js (395 KiB)
```

**Why it's OK:**
- Includes React (large but necessary)
- Includes D3 for visualizations
- Dashboard is loaded once, not on every page
- 395KB is acceptable for an extension

**To reduce (optional):**
1. Remove unused dependencies
2. Tree-shake imports
3. Use preact instead of react (smaller)

### 7. Memories Not Saving

**Check:**
1. Extension permissions are granted
2. Storage is not full:
   ```javascript
   chrome.storage.local.getBytesInUse(null, bytes => {
     console.log('Storage used:', bytes, 'bytes');
   });
   ```
3. Background script is running:
   - Go to `chrome://extensions/`
   - Click **Inspect views: service worker**

### 8. AI Insights Not Showing

**Requirements:**
- Need memories with tags
- Need at least 5 memories
- Server must be running (optional, for enhanced insights)

**Solution:**
1. Browse some websites first
2. Make sure content script is injecting
3. Check background script logs

### 9. Export/Import Not Working

**Export Issue:**
```javascript
// Check if data exists
chrome.runtime.sendMessage({type: "GET_MEMORIES"}, res => {
  console.log('Export data:', res);
});
```

**Import Issue:**
- Make sure JSON file is valid
- Check file format matches export format
- Try smaller test file first

### 10. Keyboard Shortcuts Not Working

**Shortcuts:**
- `Ctrl+K` - Search
- `1-4` - Switch views
- `Ctrl+E` - Export

**If not working:**
1. Make sure focus is on dashboard, not in an input
2. Try clicking on the dashboard background first
3. Check if another extension is conflicting

## Performance Issues

### Dashboard Slow to Load

**Optimize:**
1. Clear old memories:
   ```javascript
   // Delete memories older than 1 year
   ```
2. Reduce memory count in view (add pagination)
3. Use filters to show fewer items

### High Memory Usage

**Solutions:**
1. Close dashboard when not in use
2. Clear extension data periodically
3. Export and delete old memories

## Development Issues

### Hot Reload Not Working

The extension doesn't support hot reload. After changes:

```bash
npm run build
```

Then manually reload in `chrome://extensions/`

### Source Maps Not Loading

**Expected:** Source maps are `cheap-source-map` (not inline)

**Location:** `dist/*.map` files

**Usage:** DevTools should automatically load them

### Webpack Build Errors

**Common errors:**

1. **Module not found:**
   ```bash
   npm install
   ```

2. **Babel preset error:**
   ```bash
   npm install @babel/preset-react @babel/preset-env
   ```

3. **Plugin error:**
   ```bash
   rm -rf node_modules
   npm install
   ```

## Data Issues

### Lost Memories

**Recovery:**
1. Check if export exists
2. Check browser sync (if enabled)
3. Check `chrome.storage.local`:
   ```javascript
   chrome.storage.local.get(null, data => {
     console.log('All storage:', data);
   });
   ```

### Duplicate Memories

**Cause:** Same URL visited multiple times

**Solution:** Deduplicate by URL:
```javascript
// In background script
const uniqueMemories = memories.reduce((acc, m) => {
  if (!acc.find(x => x.url === m.url)) acc.push(m);
  return acc;
}, []);
```

## Chrome Extension Issues

### Extension Disabled

**Reasons:**
1. Extension crashed multiple times
2. Chrome update
3. Manual disable

**Solution:**
1. Re-enable in `chrome://extensions/`
2. Check console for crash reason
3. Rebuild if needed

### Service Worker Stopped

**Check:**
- `chrome://extensions/` → **Inspect views: service worker**
- Should show "Status: Active"

**If inactive:**
1. Click on service worker to activate
2. Check background script for errors

### Permissions Not Working

**Fix:**
1. Check `manifest.json` has required permissions
2. Reload extension
3. Some permissions need user interaction

## Getting Help

### Debug Mode

Enable verbose logging:

```javascript
// In background.js, add at top:
const DEBUG = true;

// Use throughout:
if (DEBUG) console.log('Debug info:', data);
```

### Report Issue

Include:
1. Chrome version
2. Extension version
3. Console errors (copy full stack trace)
4. Steps to reproduce
5. Screenshot if applicable

### Logs to Check

1. **Dashboard Console:**
   - F12 on dashboard page
   - Check for React errors

2. **Background Console:**
   - `chrome://extensions/`
   - **Inspect views: service worker**

3. **Content Script Console:**
   - F12 on any webpage
   - Should see EchoLens logs

## Prevention

### Before Updates

1. **Export data:**
   ```
   Dashboard → Export Data button
   ```

2. **Test in dev mode:**
   ```bash
   npm run dev
   ```

3. **Backup:**
   ```bash
   cp -r dist dist.backup
   ```

### Best Practices

1. Always export data weekly
2. Keep `node_modules` updated
3. Test after Chrome updates
4. Clear cache after rebuilding
5. Use version control (git)

## Success Indicators

✅ No errors in console
✅ Dashboard loads in < 2 seconds
✅ All 4 views work
✅ Search returns results
✅ Memories save correctly
✅ Export/Import works
✅ Keyboard shortcuts respond
✅ Hover effects work
✅ Links open correctly

---

**Still stuck?** Check `BUGFIX_SUMMARY.md` for technical details or `FIXES_COMPLETE.md` for setup instructions.
