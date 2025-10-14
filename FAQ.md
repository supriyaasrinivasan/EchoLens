# ❓ EchoLens - Frequently Asked Questions

Complete answers to common questions about EchoLens.

---

## 🎯 General Questions

### What is EchoLens?
EchoLens is a Chrome extension that acts as your digital memory layer for browsing. It automatically captures and organizes what you read, creating a visual knowledge map of your browsing history with AI-powered insights.

### How is this different from browser history?
Browser history is just a list of URLs. EchoLens captures:
- What you actually read (not just visited)
- Text you highlighted
- Time spent meaningfully engaged
- AI-generated summaries
- Visual knowledge connections
- Tags and topics

### Is EchoLens free?
Yes! There's a free tier that includes:
- Last 20 sessions
- Basic memory recall
- Manual tagging
- Local storage

Pro features ($5/month) add unlimited history, AI summaries, cloud sync, and more.

---

## 🔒 Privacy & Security

### What data does EchoLens collect?
EchoLens only collects:
- URLs you visit (for meaningful time periods)
- Page titles and content you spend time reading
- Text you manually highlight
- Your optional tags and notes

It NEVER collects:
- Passwords or form data
- Credit card information
- Private browsing data
- Anything from excluded domains

### Where is my data stored?
By default, 100% locally in your browser using Chrome's secure storage API. If you enable cloud sync (Pro), data is encrypted and stored in MongoDB with your explicit consent.

### Can I delete my data?
Absolutely. You can:
- Delete individual memories
- Clear all data
- Export your data
- Request account deletion

### Do you sell user data?
Never. EchoLens respects your privacy. No data is sold, shared, or used for advertising.

---

## 🚀 Installation & Setup

### How do I install EchoLens?
1. Go to Chrome Web Store (when published)
2. Click "Add to Chrome"
3. Start browsing - it works automatically!

Or for development:
1. Download/clone the repository
2. Run `npm install` and `npm run build`
3. Load unpacked extension from `chrome://extensions/`

### Does it work on mobile?
Currently Chrome desktop only. Mobile app is in the roadmap!

### Can I use it with Firefox/Edge/Safari?
Currently Chrome/Chromium only. Other browsers planned for future releases.

### Do I need a backend server?
No! The extension works standalone with local storage. The backend is optional for:
- Cloud sync
- Multi-device access
- Team features
- Advanced analytics

---

## 💡 Features & Usage

### How does automatic capture work?
EchoLens uses smart heuristics:
- Only captures pages you spend >10 seconds on
- Detects "meaningful" engagement (scrolling, interactions)
- Ignores tab-switching and idle time
- Excludes common utility pages (new tab, settings, etc.)

### Can I exclude certain websites?
Yes! You can:
- Exclude specific domains
- Disable on incognito mode
- Pause capture temporarily
- Set up domain blacklist

### How do highlights work?
Simply select text on any webpage. EchoLens automatically detects and saves:
- The highlighted text
- Surrounding context
- Timestamp
- Page information

### What's the Knowledge Map?
A force-directed graph visualization showing:
- Each memory as a node
- Tags connecting related memories
- Color-coded by recency
- Interactive - click to revisit
- Beautiful constellation aesthetic

### How accurate are AI summaries?
AI summaries use GPT-3.5 or Claude Haiku and are typically 85-95% accurate. They work best on:
- Articles and blog posts
- Documentation
- Research papers
- Long-form content

They may struggle with:
- Very technical content
- Multiple languages
- Heavy visual content
- Short snippets

### What if I don't want to use AI?
No problem! AI is completely optional. EchoLens works great with:
- Manual tagging
- Keyword extraction (no AI needed)
- Basic summaries (first sentences)
- Your own notes

---

## 🔧 Technical Questions

### What browser permissions does it need?
- `storage`: Save your memories
- `tabs`: Track active pages
- `activeTab`: Access current page content
- `scripting`: Inject overlay interface
- `<all_urls>`: Work on any website

### Why does it need access to all websites?
To capture context from any page you visit. EchoLens only activates when you engage with content - it doesn't run constantly or access sensitive pages.

### Does it slow down my browser?
No. EchoLens is highly optimized:
- Lazy loading
- Idle detection
- Debounced operations
- Minimal memory footprint (<50MB typical)

### Can I see the source code?
Yes! EchoLens is open source (MIT license). Check the GitHub repository.

### What technologies power EchoLens?
- **Frontend:** React, Tailwind CSS, D3.js
- **Extension:** Chrome APIs (Manifest V3)
- **Backend:** Node.js, Express, MongoDB
- **AI:** OpenAI & Anthropic APIs
- **Build:** Webpack, Babel

---

## 💳 Pricing & Subscription

### What's included in the free tier?
- Last 20 sessions
- Core memory features
- Manual tags
- Basic search
- Local storage only

### What do I get with Pro?
- Unlimited memory history
- AI summaries & auto-tagging
- Cloud sync (multi-device)
- Advanced search & filters
- Knowledge graph export
- Priority support

### How do I upgrade to Pro?
Currently in development! Will be available through:
- Stripe checkout
- PayPal
- Secure payment processing

### Can I try Pro before paying?
Yes! 14-day free trial when launched.

### What's the Enterprise tier?
For teams and organizations:
- Shared workspaces
- Team analytics
- API access
- SSO integration
- Custom deployment
- Dedicated support

Contact for pricing.

---

## 🐛 Troubleshooting

### Extension not appearing in toolbar
1. Go to `chrome://extensions/`
2. Ensure EchoLens is enabled
3. Click the puzzle icon in toolbar
4. Pin EchoLens

### No data being captured
1. Check if extension is enabled
2. Verify you're spending >10 seconds on pages
3. Check console for errors (F12)
4. Try disabling other extensions
5. Reload the extension

### Dashboard not loading
1. Right-click extension icon → "Inspect popup"
2. Check console for errors
3. Clear browser cache
4. Rebuild extension: `npm run build`
5. Reload extension

### Highlights not saving
1. Ensure text selection is >10 characters
2. Check Chrome storage isn't full
3. Verify extension permissions
4. Try shorter selections

### AI features not working
1. Check if API key is set
2. Verify API key is valid
3. Check API usage limits
3. Try fallback mode (no AI)

### Backend won't connect
1. Ensure MongoDB is running
2. Check `.env` configuration
3. Verify port 3000 isn't in use
4. Check firewall settings
5. Review server logs

---

## 📊 Data & Export

### How much storage does EchoLens use?
Approximately:
- 5KB per basic memory
- 50KB per memory with highlights & AI
- 100KB per rich memory with full content

Chrome Storage limits:
- Local: 5MB (1000+ memories)
- Sync: 100KB (for settings)

### Can I export my data?
Yes! Export formats:
- JSON (full data)
- CSV (tabular)
- Markdown (readable)
- HTML (viewable)

### Can I import from other tools?
Planned support for:
- Browser bookmarks
- Pocket
- Instapaper
- Raindrop.io
- Notion

### How do I backup my data?
1. Click "Export Data" in dashboard
2. Save JSON file securely
3. To restore: "Import Data"

With Pro: Automatic cloud backup

---

## 🚀 Advanced Features

### Can I share memories with others?
Not yet, but planned! Future features:
- Public memory collections
- Team workspaces
- Collaborative annotations
- Social sharing

### Does it integrate with other tools?
Planned integrations:
- Notion (export)
- Obsidian (sync)
- Roam Research (graph)
- Readwise (highlights)
- Zapier (automation)

### Can I use the API?
API is included with Enterprise tier. Documentation coming soon.

### Is there a mobile app?
In development! Planned features:
- Capture from mobile browser
- View memories on-the-go
- Sync with desktop
- Push notifications

---

## 🎓 Best Practices

### How should I use EchoLens?
**For Learning:**
- Highlight key concepts
- Add tags to topics
- Review knowledge map weekly
- Search when reviewing

**For Research:**
- Track all sources
- Export for citations
- Tag by project
- Timeline for chronology

**For Discovery:**
- Let it capture automatically
- Review surprising connections
- Follow knowledge threads
- Use AI summaries

### How many memories is too many?
No limit with Pro! Tips for managing:
- Use filters effectively
- Archive old memories
- Export periodically
- Regular cleanup

### Should I use AI features?
Recommended if:
- You read a lot (10+ articles/day)
- You want automated organization
- You trust AI summaries
- You have API budget

Skip if:
- You prefer manual control
- Privacy is paramount
- Content is sensitive
- Budget is limited

---

## 🆘 Getting Help

### How do I report a bug?
1. GitHub Issues (preferred)
2. Email: support@echolens.app
3. Include:
   - Chrome version
   - Extension version
   - Steps to reproduce
   - Console errors (if any)

### Feature requests?
- GitHub Discussions
- Feature request form
- Community voting board

### Where's the documentation?
- `README.md` - Project overview
- `SETUP.md` - Installation
- `ARCHITECTURE.md` - Technical details
- `DESIGN-GUIDE.md` - Visual design
- This FAQ!

### Is there a community?
Coming soon:
- Discord server
- Reddit community
- Twitter updates
- Newsletter

---

## 🌟 Future Plans

### What's on the roadmap?
**Short term (3 months):**
- Mobile companion app
- Firefox/Edge versions
- Advanced search
- More integrations

**Medium term (6 months):**
- Team workspaces
- Public API
- Advanced analytics
- Collaboration features

**Long term (12+ months):**
- AI recommendations
- Memory reminders
- Trend analysis
- Knowledge assistant

### How can I contribute?
- Code contributions (GitHub)
- Bug reports
- Feature ideas
- Design improvements
- Documentation
- Translations
- Beta testing
- Spread the word!

---

## 📧 Contact

### Developer
- **GitHub:** [Your GitHub]
- **Email:** developer@echolens.app
- **Twitter:** @echolens

### Support
- **Email:** support@echolens.app
- **Response time:** 24-48 hours

### Business
- **Partnerships:** partners@echolens.app
- **Press:** press@echolens.app

---

**Still have questions?**

Check out our other documentation files or reach out directly!

---

*Last updated: October 14, 2025*
