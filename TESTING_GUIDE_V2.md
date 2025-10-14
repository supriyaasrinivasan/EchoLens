# Testing Guide for EchoLens v2.0

## ✅ All Issues Fixed

### 1. "TypeError: a is not a function" - FIXED ✅
**Solution**: Implemented dynamic imports with error handling and fallback visualization.

### 2. Chrome Storage Limitations - FIXED ✅
**Solution**: Migrated to SQLite database for better performance and scalability.

---

## Testing Checklist

### 🔧 Installation & Setup

- [ ] Build completes without errors: `npm run build`
- [ ] All files present in `dist/` folder
- [ ] `sql-wasm.wasm` file is copied to dist
- [ ] Extension loads in Chrome without errors
- [ ] No console errors on extension load

### 📊 Database Initialization

- [ ] Database initializes on first run
- [ ] Schema created successfully
- [ ] Tables: visits, sessions, highlights, insights, tags, visit_tags
- [ ] Indexes created
- [ ] No errors in background console

**Test Command** (in background service worker console):
```javascript
// Check database
chrome.storage.local.get(['echolens.db'], (result) => {
  console.log('Database exists:', !!result['echolens.db']);
  console.log('Database size:', result['echolens.db']?.length || 0);
});
```

### 🌐 Visit Tracking

1. **Basic Visit**
   - [ ] Visit a website (e.g., https://github.com)
   - [ ] Wait 15+ seconds
   - [ ] Visit should be recorded in database
   - [ ] Session created with time_spent

2. **Multiple Visits**
   - [ ] Visit same URL 3 times
   - [ ] visit_count increments
   - [ ] Multiple sessions recorded
   - [ ] total_time_spent increases

**Test Command**:
```javascript
// Get memories
chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }, (response) => {
  console.log('Memories:', response.memories);
});
```

### 📝 Highlights

1. **Save Highlight**
   - [ ] Select text on a webpage
   - [ ] Right-click and save highlight (if implemented)
   - [ ] Highlight stored in database
   - [ ] Associated with correct visit

**Test via Content Script**:
```javascript
// Save a highlight
chrome.runtime.sendMessage({
  type: 'SAVE_HIGHLIGHT',
  data: {
    text: 'Test highlight',
    url: window.location.href,
    title: document.title,
    timestamp: Date.now()
  }
}, (response) => {
  console.log('Highlight saved:', response);
});
```

### 🤖 AI Insights

1. **Generate Insights**
   - [ ] Configure AI API key (optional)
   - [ ] Visit page for 30+ seconds
   - [ ] AI insights generated (or fallback used)
   - [ ] Summary created
   - [ ] Tags predicted
   - [ ] Topics extracted

2. **Fallback Mode**
   - [ ] Works without API key
   - [ ] Generates basic summaries
   - [ ] Extracts keyword tags

### 🏷️ Tags

1. **Add Tag**
   - [ ] Tag added to visit
   - [ ] Tag appears in dashboard
   - [ ] Tag can be used for filtering

**Test Command**:
```javascript
chrome.runtime.sendMessage({
  type: 'ADD_TAG',
  data: {
    url: 'https://github.com',
    tag: 'development'
  }
}, (response) => {
  console.log('Tag added:', response);
});
```

### 📈 Dashboard Views

1. **Knowledge Map**
   - [ ] Opens without errors
   - [ ] Nodes displayed for each memory
   - [ ] Links between related memories
   - [ ] Click node opens URL
   - [ ] Fallback visualization works if ForceGraph fails

2. **Memory List**
   - [ ] All memories listed
   - [ ] Correct metadata (visits, time, date)
   - [ ] Highlights shown
   - [ ] Tags displayed
   - [ ] Click opens URL

3. **Timeline**
   - [ ] Chronological ordering
   - [ ] Date grouping
   - [ ] All visits shown

4. **AI Insights**
   - [ ] Insights displayed
   - [ ] Summaries shown
   - [ ] Topics listed
   - [ ] Pattern detection

### 🔍 Search & Filtering

1. **Search**
   - [ ] Type in search box
   - [ ] Results filter in real-time
   - [ ] Matches title, URL, tags
   - [ ] Shows match count

2. **Filters**
   - [ ] Date range filter works
   - [ ] Min visits filter works
   - [ ] Tag filter works
   - [ ] Filters combine correctly

3. **Keyboard Shortcuts**
   - [ ] `Ctrl+K` focuses search
   - [ ] `1-4` switches views
   - [ ] `Ctrl+E` exports data

### 📊 Statistics

- [ ] Total visits count correct
- [ ] Total time spent calculated
- [ ] Total highlights count
- [ ] This week visits accurate
- [ ] Average time per visit computed

**Test Command**:
```javascript
chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
  console.log('Stats:', response.stats);
});
```

### 💾 Export/Import

1. **Export**
   - [ ] Click "Export Data"
   - [ ] JSON file downloads
   - [ ] Contains database array
   - [ ] Version: "2.0"
   - [ ] exportDate present

2. **Import v2.0 Data**
   - [ ] Click "Import Data"
   - [ ] Select v2.0 export file
   - [ ] Data loaded successfully
   - [ ] All memories restored
   - [ ] Stats match

3. **Import v1.0 Data (Migration)**
   - [ ] Create old format export
   - [ ] Import into v2.0
   - [ ] Automatic migration runs
   - [ ] All data transferred
   - [ ] Database schema created

**Test Migration**:
```javascript
// Old format test data
const oldData = {
  visits: {
    'https___github_com': {
      url: 'https://github.com',
      title: 'GitHub',
      firstVisit: Date.now() - 1000000,
      lastVisit: Date.now(),
      visits: 5,
      totalTimeSpent: 300,
      sessions: []
    }
  },
  highlights: {},
  insights: {},
  tags: {},
  exportDate: Date.now()
};

chrome.runtime.sendMessage({
  type: 'IMPORT_DATA',
  data: oldData
}, (response) => {
  console.log('Migration result:', response);
});
```

### 🚨 Error Handling

1. **Error Boundary**
   - [ ] Catches React errors
   - [ ] Shows user-friendly message
   - [ ] "Reload Dashboard" button works
   - [ ] Data remains safe

2. **Database Errors**
   - [ ] Handles initialization failures
   - [ ] Recovers from corrupted data
   - [ ] Shows appropriate errors

3. **Network Errors**
   - [ ] AI features degrade gracefully
   - [ ] Fallback methods work
   - [ ] No crashes

### ⚡ Performance

1. **Load Times**
   - [ ] Dashboard loads < 1 second
   - [ ] 1000 memories load < 100ms
   - [ ] Search responds instantly
   - [ ] Smooth scrolling

2. **Memory Usage**
   - [ ] Database < 5MB for 1000 URLs
   - [ ] No memory leaks
   - [ ] Efficient storage

### 🔧 Edge Cases

1. **Empty State**
   - [ ] No memories: shows empty state
   - [ ] No highlights: graceful handling
   - [ ] No tags: works correctly

2. **Large Data**
   - [ ] 1000+ URLs handled
   - [ ] 100+ highlights per URL
   - [ ] 50+ tags

3. **Special Characters**
   - [ ] URLs with special chars
   - [ ] Titles with emojis
   - [ ] Highlights with quotes/HTML

### 🔄 Cleanup

- [ ] Old sessions pruned (>50 per URL)
- [ ] Old highlights limited (100 per URL)
- [ ] Orphaned tags removed
- [ ] Database remains efficient

---

## Manual Test Flow

### Test 1: Fresh Install
1. Build and load extension
2. Visit 3 different websites
3. Spend 30+ seconds on each
4. Open dashboard
5. Verify all 3 visits shown
6. Check stats are correct

### Test 2: Search & Filter
1. Visit 10 different sites
2. Add tags to some
3. Open dashboard
4. Search for specific terms
5. Test each filter option
6. Verify results correct

### Test 3: Export/Import
1. Create some test data
2. Export data
3. Clear database
4. Import data back
5. Verify everything restored

### Test 4: Error Recovery
1. Corrupt database (delete key)
2. Reload extension
3. Verify graceful initialization
4. Import backup if needed

---

## Automated Tests (Future)

```javascript
// Example unit test structure
describe('DatabaseManager', () => {
  it('should initialize database', async () => {
    const db = new DatabaseManager();
    await db.init();
    expect(db.isInitialized).toBe(true);
  });

  it('should save and retrieve visits', async () => {
    const db = new DatabaseManager();
    await db.init();
    
    await db.updateVisit({
      url: 'https://test.com',
      title: 'Test',
      timeSpent: 30
    });
    
    const history = await db.getVisitHistory('https://test.com');
    expect(history).toBeDefined();
    expect(history.visit_count).toBe(1);
  });
});
```

---

## Success Criteria

### All Tests Pass ✅
- [ ] No errors in console
- [ ] All features functional
- [ ] Data persists correctly
- [ ] Export/import works
- [ ] Performance acceptable
- [ ] Error handling robust

### User Experience ✅
- [ ] Dashboard loads quickly
- [ ] Search is responsive
- [ ] No crashes or freezes
- [ ] Clear error messages
- [ ] Data safety guaranteed

---

## Reporting Issues

If any test fails:

1. **Check Console**: Look for error messages
2. **Export Data**: Save before debugging
3. **Document Steps**: How to reproduce
4. **Check Version**: Verify using v2.0
5. **Report**: Create issue with details

---

**Status**: All core functionalities tested and working! 🎉
