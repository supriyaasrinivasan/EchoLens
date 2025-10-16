# Critical Fixes to Apply - SupriAI Extension

## Priority 1: Remove Duplicate AIProcessor Class

### File: `src/background/background.js`

**Issue:** AIProcessor is both imported and redefined inline, causing the import to be ignored.

**Current (BROKEN):**
```javascript
import { AIProcessor } from './ai-processor.js';

// AI Processor Class
class AIProcessor {  // ← This redefines and shadows the import!
  constructor() {
    this.apiKey = null;
    // ... duplicate implementation
  }
  // ... lines 8-202
}
```

**Fix:** Delete lines 8-202 (the entire inline AIProcessor class definition)

The imported AIProcessor from `ai-processor.js` already has all necessary methods including:
- ✅ generateSummary()
- ✅ predictTags()
- ✅ extractTopics()
- ✅ generatePersonalityReport() ← This was the missing method concern

**No further changes needed** - the imported class is complete!

---

## Priority 2: Add Database Size Monitoring

### File: `src/background/db-manager.js`

**Location:** `saveDatabase()` method around line 81

**Add this code:**
```javascript
async saveDatabase() {
  if (!this.db) return;

  try {
    const data = this.db.export();
    const dataArray = Array.from(data);
    
    // ✨ ADD THIS: Monitor database size
    const sizeInMB = (dataArray.length / 1024 / 1024).toFixed(2);
    if (sizeInMB > 9) {
      console.warn(`⚠️ Database size: ${sizeInMB}MB - approaching 10MB limit!`);
      // Optionally trigger cleanup
      await this.cleanup();
    }
    
    await chrome.storage.local.set({ [this.dbName]: dataArray });
    console.log(`💾 Database saved (${sizeInMB}MB)`);
  } catch (error) {
    console.error('❌ Error saving database:', error);
    // Could implement retry logic here
  }
}
```

---

## Priority 3: Fix Content Script Memory Leaks

### File: `src/content/content.js`

**Issue 1:** Overlay injected multiple times on SPA navigation

**Location:** `injectOverlay()` method around line 254

**Fix:**
```javascript
injectOverlay() {
  // ✨ ADD THIS: Check if overlay already exists
  if (document.getElementById('supriai-overlay')) {
    console.log('Overlay already exists, skipping injection');
    return;
  }
  
  // Create the floating memory icon
  const overlay = document.createElement('div');
  overlay.id = 'supriai-overlay';
  // ... rest of existing code
}
```

**Issue 2:** Heartbeat runs even when tab is hidden

**Location:** `sendHeartbeat()` method around line 242

**Fix:**
```javascript
async sendHeartbeat() {
  // ✨ ADD THIS: Don't send if page is hidden or inactive
  if (document.hidden || !this.isActive) {
    console.log('Skipping heartbeat (page hidden or inactive)');
    return;
  }
  
  const context = this.extractPageContext();
  
  // Send to background script
  chrome.runtime.sendMessage({
    type: 'CONTEXT_UPDATE',
    data: context
  });
}
```

---

## Priority 4: Add Chrome Identity Error Handling

### File: `src/dashboard/Dashboard.jsx`

**Location:** Around lines 87-96

**Current:**
```javascript
if (chrome.identity && chrome.identity.getProfileUserInfo) {
  chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
    if (userInfo && userInfo.email) {
      // ... code
    }
  });
}
```

**Fix:**
```javascript
if (chrome.identity && chrome.identity.getProfileUserInfo) {
  chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
    // ✨ ADD THIS: Check for errors
    if (chrome.runtime.lastError) {
      console.warn('Could not get user info:', chrome.runtime.lastError.message);
      return;
    }
    
    if (userInfo && userInfo.email) {
      // Extract name from email (before @)
      const name = userInfo.email.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      setUsername(formattedName);
      chrome.storage.sync.set({ username: formattedName });
    }
  });
}
```

---

## Priority 5: Standardize Skill Data Format

### Files: Multiple files in background

**Issue:** Skills sometimes returned as objects, sometimes as strings

**Fix in:** `src/background/db-manager.js` around line 1147

**Ensure getAllSkills() always returns consistent format:**
```javascript
async getAllSkills() {
  const stmt = this.db.prepare(`
    SELECT 
      skill as name,
      COUNT(*) as visit_count,
      SUM(time_spent) as total_time,
      MAX(timestamp) as last_activity,
      AVG(confidence) as confidence
    FROM skill_activities
    GROUP BY skill
    ORDER BY total_time DESC
  `);

  const skills = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    // ✨ ENSURE CONSISTENT FORMAT
    skills.push({
      name: row.name,              // Always string
      total_time: row.total_time || 0,    // Always number
      visit_count: row.visit_count || 0,  // Always number
      last_activity: row.last_activity,   // Always timestamp
      confidence: row.confidence || 0     // Always number
    });
  }
  stmt.free();

  return skills;
}
```

**Update Popup to expect consistent format:**

In `src/popup/Popup.jsx` around line 142-147, simplify to:
```javascript
{skills.map((skill, idx) => {
  return (
    <div className="skill-item" key={idx}>
      <div className="skill-info">
        <div className="skill-name">{skill.name}</div>
        <div className="skill-time">{formatTime(skill.total_time)}</div>
      </div>
      <div className="skill-actions">
        <button className="btn-icon" onClick={() => openLearningPath(skill.name)} title="Open learning resources">
          <Zap size={14}/>
        </button>
        <button className="btn-icon danger" onClick={() => removeSkill(skill.name)} title="Delete skill">
          <Trash2 size={14}/>
        </button>
      </div>
    </div>
  );
})}
```

---

## Optional: Improve Error Messages

### File: `src/popup/Popup.jsx`

**Location:** Error handling in addSkill(), removeSkill(), etc.

**Current:**
```javascript
} catch (err) {
  console.error('addSkill error', err);
  alert('Error adding skill. Please try again.');
}
```

**Better:**
```javascript
} catch (err) {
  console.error('addSkill error', err);
  alert(`Failed to add skill: ${err.message || 'Unknown error'}. Please check your connection and try again.`);
}
```

---

## Testing Checklist After Fixes

After applying these fixes, test:

- [ ] Extension loads without console errors
- [ ] Visit a few pages, check content script doesn't duplicate overlays
- [ ] Open popup, verify skills display correctly with time
- [ ] Add a new skill, verify it appears immediately
- [ ] Delete a skill, verify it's removed
- [ ] Open dashboard, check all tabs work
- [ ] Leave tab open for 5+ minutes, verify heartbeat doesn't spam
- [ ] Check database size in console logs
- [ ] Test on hidden/inactive tabs
- [ ] Verify no memory leaks (check Chrome Task Manager)

---

## Build Commands

After making changes:

```bash
# Development build with watch
npm run dev

# Production build
npm run build

# Check for errors
# Open Chrome DevTools → Console for background page
# Right-click extension icon → Inspect views → background page
```

---

## Files Modified Summary

1. ✅ `src/background/background.js` - Remove lines 8-202
2. ✅ `src/background/db-manager.js` - Add size monitoring
3. ✅ `src/content/content.js` - Fix memory leaks (2 locations)
4. ✅ `src/dashboard/Dashboard.jsx` - Add error handling
5. ✅ `src/background/db-manager.js` - Standardize getAllSkills()
6. ✅ `src/popup/Popup.jsx` - Simplify skill rendering

---

## Estimated Time: 30 minutes

All fixes are straightforward additions/deletions with no complex refactoring needed.

**Ready to apply?** Let me know and I'll make these changes automatically!
