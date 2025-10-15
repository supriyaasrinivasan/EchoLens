# EchoLens Icon Creation Guide

The extension currently works without icons, but you can add custom icons for a professional look.

## Quick Fix: Use These Free Tools

### Option 1: AI Icon Generator (Recommended)
1. Go to https://www.brandmark.io/tools/ or https://favicon.io/
2. Create a simple icon with:
   - **Theme**: Purple/blue gradient (matches EchoLens theme)
   - **Symbol**: Eye, lens, or brain icon
   - **Style**: Modern, minimal
3. Download in 16x16, 48x48, and 128x128 sizes
4. Save as `icon16.png`, `icon48.png`, `icon128.png`

### Option 2: Simple Placeholder Icons
1. Go to https://placeholder.com/
2. Generate:
   - 16x16 with text "EL" (EchoLens)
   - 48x48 with text "EL"
   - 128x128 with text "EL"
3. Use purple background (#8b5cf6)
4. Save to `assets/` folder

### Option 3: Design Your Own
Use any image editor (Photoshop, GIMP, Canva, Figma):
- Create three PNG files: 16x16, 48x48, 128x128 pixels
- Use the EchoLens purple theme (#8b5cf6)
- Keep it simple and recognizable at small sizes

## Where to Place Icons

Save the PNG files to:
```
Lenz/assets/
├── icon16.png   (16x16 pixels)
├── icon48.png   (48x48 pixels)
└── icon128.png  (128x128 pixels)
```

## Enable Icons in Manifest

After adding icons, update `manifest.json` to include:

```json
{
  "icons": {
    "16": "assets/icon16.png",
    "48": "assets/icon48.png",
    "128": "assets/icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "assets/icon16.png",
      "48": "assets/icon48.png",
      "128": "assets/icon128.png"
    },
    ...
  }
}
```

Then rebuild:
```powershell
npm run build
```

And reload the extension in Chrome.

## Design Recommendations

**Color Palette:**
- Primary: #8b5cf6 (Purple)
- Secondary: #3b82f6 (Blue)
- Background: #0a0e27 (Dark blue)

**Icon Concepts:**
- 🧠 Brain with circuit patterns (AI/memory theme)
- 👁️ Eye with lens (seeing/remembering theme)
- 🔮 Crystal ball (foresight/memory theme)
- 📸 Camera lens (capturing moments theme)
- 🌌 Galaxy/constellation (EchoLens space theme)

**Keep it Simple:**
- Icons should be clear at 16x16 pixels
- Use solid colors, avoid gradients at small sizes
- High contrast for visibility
- Consistent shape across all sizes
