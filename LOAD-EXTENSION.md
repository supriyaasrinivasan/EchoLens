# How to Load EchoLens Extension in Chrome

## ⚠️ CRITICAL: Load the DIST folder, not the root folder!

### Steps to Load Extension:

1. **Open Chrome Extensions Page**
   - Navigate to: `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the **"Developer mode"** switch in the top-right corner

3. **Load the Extension**
   - Click **"Load unpacked"** button
   - Navigate to: `C:\Users\jayan\OneDrive\Desktop\Lenz\dist`
   - **IMPORTANT**: Select the **`dist`** folder, NOT the main `Lenz` folder
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "EchoLens" in your extensions list
   - Check for any error messages
   - The extension icon should appear in your Chrome toolbar

### Troubleshooting:

#### Error: "Could not load background script ''"
- **Cause**: You loaded the wrong folder (the root `Lenz` folder instead of `dist`)
- **Solution**: Remove the extension and reload using the `dist` folder

#### Error: "Manifest file is missing or unreadable"
- **Cause**: The build hasn't completed or dist folder doesn't exist
- **Solution**: Run `npm run build` again

#### After Building:
```
Lenz/
├── dist/              ← LOAD THIS FOLDER IN CHROME
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── dashboard.html
│   └── ...
├── src/               ← Source code (don't load this)
├── package.json
└── ...
```

### Quick Rebuild:
If you make changes, rebuild with:
```powershell
npm run build
```

Then click the **refresh icon** on the EchoLens extension card in `chrome://extensions/`

---

## What Each File Does:

- **manifest.json**: Extension configuration
- **background.js**: Service worker (handles data, AI processing)
- **content.js**: Runs on web pages (captures context)
- **popup.html/js**: Extension popup interface
- **dashboard.html/js**: Full dashboard view

---

## Verifying the Extension Works:

1. **Check the icon**: EchoLens icon should appear in toolbar
2. **Click the icon**: Popup should open showing "Recent Memories"
3. **Visit a website**: Extension should start tracking
4. **Check service worker**: In chrome://extensions/, click "service worker" under EchoLens to see console logs
