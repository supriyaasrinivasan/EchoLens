# 🚀 EchoLens - Setup & Installation Guide

Complete guide to set up and run EchoLens locally.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud option)
- **Google Chrome** browser
- **Git** (optional) - [Download](https://git-scm.com/)

---

## 🛠️ Installation Steps

### 1. Install Dependencies

Open PowerShell in the project directory:

```powershell
# Install all npm packages
npm install
```

This will install:
- React & React DOM
- Webpack & Babel (build tools)
- Tailwind CSS (styling)
- Express & MongoDB (backend)
- D3.js & force-graph (visualizations)
- All other dependencies

### 2. Set Up Icons

EchoLens needs icon files. For now, you can use emoji-based placeholders:

```powershell
# The extension will work without icons, but Chrome will show warnings
# Follow assets/README.md to create proper icons later
```

### 3. Build the Extension

```powershell
# Build once
npm run build

# OR watch mode for development (auto-rebuilds on changes)
npm run dev
```

This creates a `dist` folder with your compiled extension.

### 4. Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `dist` folder from your project
5. You should see **EchoLens** appear in your extensions!

---

## 🗄️ Backend Setup (Optional but Recommended)

The extension works without a backend (stores data locally), but for cloud sync and advanced features:

### 1. Configure Environment

```powershell
# Copy the example environment file
Copy-Item server\.env.example server\.env

# Edit server\.env with your settings
notepad server\.env
```

Set your MongoDB connection:
```env
MONGODB_URI=mongodb://localhost:27017/echolens
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/echolens
```

### 2. Start MongoDB

**Option A: Local MongoDB**
```powershell
# Start MongoDB service
net start MongoDB

# OR if installed via MSI, it should start automatically
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Paste in `server\.env`

### 3. Start the Backend Server

```powershell
# Development mode (auto-restarts on changes)
npm run server:dev

# OR production mode
npm run server
```

You should see:
```
🌌 EchoLens API server running on port 3000
📦 Connected to MongoDB
```

---

## ✨ Using EchoLens

### First Time Setup

1. **Click the extension icon** (💫) in Chrome toolbar
2. Browse to any website
3. EchoLens automatically captures context!

### Features to Try

- **Highlight text** on any page - it's automatically saved
- **Revisit a page** - see your memory overlay appear
- **Click the floating icon** (💫) to see past memories
- **Open the dashboard** - click "Open Memory Dashboard" in popup

### Dashboard Views

- **🗺️ Knowledge Map** - Visual constellation of your browsing
- **📚 Memory List** - Card view of all saved pages
- **📅 Timeline** - Chronological history

---

## 🔧 Development Workflow

### Making Changes

1. Edit files in `src/` folder
2. If running `npm run dev`, changes auto-rebuild
3. Go to `chrome://extensions/`
4. Click **Reload** button on EchoLens extension
5. Refresh any pages you're testing

### Project Structure

```
Lenz/
├── src/
│   ├── popup/          # Extension popup UI
│   ├── dashboard/      # Full dashboard app
│   ├── content/        # Page context capture
│   └── background/     # Data processing & storage
├── server/             # Node.js backend API
├── dist/              # Compiled extension (auto-generated)
├── manifest.json      # Extension configuration
└── webpack.config.js  # Build configuration
```

---

## 🤖 AI Features (Optional)

To enable AI summaries and tagging:

### Option 1: OpenAI

1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Store in extension settings OR in `server/.env`

### Option 2: Anthropic Claude

1. Get API key from [Anthropic](https://console.anthropic.com/)
2. Set provider to 'anthropic'

**Note:** Extension works perfectly without AI - it uses fallback text processing.

---

## 🐛 Troubleshooting

### Extension Not Loading

```powershell
# Rebuild the extension
npm run build

# Check for build errors in terminal
# Reload extension in chrome://extensions/
```

### Backend Not Connecting

```powershell
# Check if MongoDB is running
# Windows: services.msc → MongoDB
# Or check MongoDB Atlas connection string

# Verify server is running
curl http://localhost:3000/health
```

### Content Script Not Injecting

1. Check Chrome DevTools Console for errors
2. Ensure manifest.json is copied to dist/
3. Reload the extension
4. Refresh the webpage

### Build Errors

```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Clear dist and rebuild
Remove-Item -Recurse -Force dist
npm run build
```

---

## 📦 Distribution (Optional)

### Package for Chrome Web Store

```powershell
# Build production version
npm run build

# Zip the dist folder
Compress-Archive -Path dist\* -DestinationPath echolens-v1.0.0.zip
```

Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## 🌟 Next Steps

- [ ] Customize the icon (see `assets/README.md`)
- [ ] Set up your AI API key for smart features
- [ ] Configure MongoDB for cloud sync
- [ ] Explore the dashboard visualizations
- [ ] Start capturing your digital memories!

---

## 📚 Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

## 🆘 Need Help?

Check the main README.md for architecture details and contribution guidelines.

---

**Happy Memory Mapping! 🌌**

*"Your browsing becomes a timeline of self-evolution."*
