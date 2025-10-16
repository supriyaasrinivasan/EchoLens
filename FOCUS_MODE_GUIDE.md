# 🎯 Focus Mode - Educational Content Filter

## Overview
Focus Mode is a powerful feature in SupriAI that helps users maintain concentration on educational content by automatically blocking non-educational websites during active focus sessions.

## How It Works

### Starting Focus Mode
1. Navigate to **Mindfulness Center** in the dashboard
2. Select your desired focus session duration:
   - 15 minutes
   - 25 minutes (Pomodoro technique)
   - 45 minutes
   - 60 minutes
3. Click **"Start Focus Session"**
4. Focus mode activates immediately

### During Focus Mode

**✅ Allowed Content:**
- Educational institutions (`.edu` domains)
- Learning platforms:
  - Coursera, Udemy, edX
  - Khan Academy, freeCodeCamp
  - LinkedIn Learning
- Documentation sites:
  - MDN Web Docs
  - W3Schools
  - Official documentation sites
- Research platforms:
  - Wikipedia
  - arXiv
  - Google Scholar
  - ResearchGate
- Developer communities:
  - Stack Overflow
  - GitHub
  - Dev.to
- Academic journals:
  - Nature
  - Science Direct
  - JSTOR
- Educational video platforms:
  - TED Talks
  - Academic YouTube channels

**🚫 Blocked Content:**
- Social media platforms
- Entertainment websites
- Shopping sites
- News sites (unless educational)
- Gaming platforms
- Any non-educational content

### When Non-Educational Content is Accessed

Users will see a beautifully designed block page with:
- Clear explanation of why the site was blocked
- List of allowed educational domains
- Remaining focus session time
- Options to go back or close the tab
- Motivational messaging to stay focused

### Ending Focus Mode

**Automatic End:**
- Timer expires automatically
- Notification appears: "Focus Session Complete! 🎉"
- All website restrictions are lifted
- Session is saved with completion status

**Manual End:**
- Click **"End Session"** button in Mindfulness Center
- Session saves with interrupted status
- Restrictions removed immediately

## Technical Implementation

### Content Filtering Algorithm

```javascript
isEducationalContent(url) {
  // Checks URL against whitelist of educational domains
  // Returns true if educational, false if not
}
```

**Educational Keywords Detected:**
- `edu`, `academic`, `scholar`
- `course`, `tutorial`, `learn`
- `research`, `study`, `library`
- `docs`, `documentation`
- Official educational platforms

### Session Tracking

Focus sessions are tracked with:
- **Start Time**: When session began
- **Duration**: Planned session length
- **End Time**: Actual completion time
- **Completed**: `true` if 90%+ of session finished
- **Statistics**: Saved to database for analytics

### Database Schema

```sql
CREATE TABLE focus_sessions (
  id INTEGER PRIMARY KEY,
  start_time INTEGER,
  end_time INTEGER,
  duration INTEGER,
  completed BOOLEAN,
  timestamp INTEGER
);

CREATE TABLE mood_data (
  id INTEGER PRIMARY KEY,
  timestamp INTEGER,
  mood TEXT,
  sentiment TEXT,
  sentiment_score REAL,
  emotions TEXT,
  tone TEXT,
  url TEXT
);
```

## Features

### 1. Smart Blocking
- Real-time URL interception
- Instant blocking of non-educational content
- Beautiful, informative block page
- No page load for blocked sites (saves bandwidth)

### 2. Session Analytics
- Total focus time tracked
- Completion rate calculated
- Session history saved
- Progress visualization in dashboard

### 3. Mood Integration
- Log mood before/after sessions
- Track focus session impact on well-being
- Correlate productivity with emotional state

### 4. Notifications
- Session start confirmation
- Session completion celebration
- Gentle reminders for breaks

## User Experience

### Block Page Design
- **Gradient background** (purple theme)
- **Large focus icon** (animated pulse)
- **Clear messaging** about why content is blocked
- **Educational tips** for staying focused
- **Timer display** showing remaining session time
- **Action buttons** for navigation

### Dashboard Integration
- **Statistics Cards**:
  - Total focus time
  - Session completion rate
  - Average session length
  - Streak tracking
- **Recent Sessions List**:
  - Session duration
  - Completion status
  - Timestamp
  - Visual indicators (✓ or interrupted)

## API Reference

### Message Types

#### Start Focus Mode
```javascript
chrome.runtime.sendMessage({
  type: 'START_FOCUS_MODE',
  duration: 2700 // seconds (45 minutes)
})
```

**Response:**
```javascript
{
  success: true,
  session: {
    startTime: 1729152000000,
    duration: 2700,
    endTime: 1729154700000
  }
}
```

#### Stop Focus Mode
```javascript
chrome.runtime.sendMessage({
  type: 'STOP_FOCUS_MODE'
})
```

**Response:**
```javascript
{
  success: true
}
```

#### Get Focus Status
```javascript
chrome.runtime.sendMessage({
  type: 'GET_FOCUS_STATUS'
})
```

**Response:**
```javascript
{
  success: true,
  status: {
    active: true,
    startTime: 1729152000000,
    endTime: 1729154700000,
    remaining: 1200000, // milliseconds
    progress: 55 // percentage
  }
}
```

#### Get Focus Sessions
```javascript
chrome.runtime.sendMessage({
  type: 'GET_FOCUS_SESSIONS',
  days: 30
})
```

**Response:**
```javascript
{
  success: true,
  sessions: [
    {
      id: 1,
      start_time: 1729152000000,
      end_time: 1729154700000,
      duration: 2700,
      completed: true
    },
    // ... more sessions
  ]
}
```

## Customization

### Adding Custom Educational Domains

Edit `background.js` → `isEducationalContent()` method:

```javascript
const educationalDomains = [
  // ... existing domains
  'yourcustomdomain.com',
  'anotherdomain.org'
];
```

### Adjusting Completion Threshold

Currently set to 90% completion = success:

```javascript
completed: duration >= focusMode.focus_mode.duration * 0.9
```

Change `0.9` to your preferred threshold (e.g., `0.8` for 80%).

### Custom Duration Presets

Edit `MindfulnessDashboard.jsx`:

```javascript
{[15, 25, 45, 60, 90, 120].map(mins => (
  // Add 90 and 120 minute options
))}
```

## Best Practices

### For Users

1. **Start Small**: Begin with 15-minute sessions
2. **Set Clear Goals**: Know what you want to learn before starting
3. **Use Pomodoro**: Try 25-minute sessions with 5-minute breaks
4. **Track Progress**: Review your completion rate weekly
5. **Stay Consistent**: Daily sessions build better habits

### For Developers

1. **Whitelist Testing**: Test new educational domains before adding
2. **Performance**: Content blocking is lightweight (< 1ms per navigation)
3. **User Feedback**: Monitor blocked URL logs for false positives
4. **Accessibility**: Block page is fully keyboard navigable
5. **Data Privacy**: All data stored locally, never sent to servers

## Troubleshooting

### "Educational site is blocked"
**Solution**: Add the domain to `educationalDomains` array in `background.js`

### "Focus mode won't start"
**Solution**: 
1. Check browser console for errors
2. Verify permissions in `manifest.json`
3. Ensure database is initialized

### "Session doesn't end automatically"
**Solution**:
1. Check Chrome alarms permission
2. Verify alarm is created: `chrome.alarms.get('end_focus_mode')`
3. Check background service worker is active

### "Block page appears instantly"
**Solution**: This is expected behavior for maximum focus protection

## Statistics & Insights

### Tracked Metrics
- Total focus sessions
- Total focus time
- Average session length
- Completion rate
- Longest session
- Current streak
- Weekly trends

### Mindfulness Score Impact
Focus sessions contribute 30 points to overall mindfulness score:
- **Completion rate** drives the score
- **Consistency** matters more than duration
- **Quality > Quantity**

## Future Enhancements

### Planned Features
- [ ] Custom domain whitelist per user
- [ ] Category-based filtering (research, coding, design)
- [ ] Focus mode intensity levels
- [ ] Break reminders with exercises
- [ ] Team focus sessions (multiplayer productivity)
- [ ] Focus music integration
- [ ] Chrome extension sync across devices
- [ ] Advanced analytics dashboard
- [ ] Gamification (achievements, leaderboards)
- [ ] AI-powered distraction prediction

## Privacy & Data

### What's Stored Locally
- Focus session timestamps and durations
- Completion status
- No browsing history from blocked attempts
- No personal identification data

### What's NOT Stored
- Content of visited educational pages
- Search queries
- Personal information
- Login credentials

## Support

For issues or questions:
1. Check this guide first
2. Review browser console logs
3. Check GitHub issues
4. Contact support team

---

**Version**: 2.0.0  
**Last Updated**: October 16, 2025  
**Maintainer**: SupriAI Team
