# Icon Placeholders

Place your EchoLens icons in this directory:

- `icon16.png` - 16x16px icon for browser toolbar
- `icon48.png` - 48x48px icon for extension management
- `icon128.png` - 128x128px icon for Chrome Web Store

## Design Guidelines

### Color Palette
- Primary: #6366f1 (Indigo/Purple)
- Secondary: #3b82f6 (Blue)
- Accent: #06b6d4 (Cyan)

### Icon Design
The icon should represent:
- 🌌 Constellation/stars (memory mapping)
- 💫 Echo/reflection (digital memory)
- 🔮 Lens/crystal ball (insight)

### Recommended Tools
- Figma
- Adobe Illustrator
- Inkscape (free)
- GIMP (free)

### Quick Placeholder
For development, you can use emoji-based icons:
- Use 💫 or 🌌 as placeholder
- Or generate simple gradient icons

## Creating Icons Programmatically

You can create quick placeholder icons using this HTML:

```html
<canvas id="icon" width="128" height="128"></canvas>
<script>
const canvas = document.getElementById('icon');
const ctx = canvas.getContext('2d');

// Gradient background
const gradient = ctx.createLinearGradient(0, 0, 128, 128);
gradient.addColorStop(0, '#6366f1');
gradient.addColorStop(1, '#3b82f6');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 128, 128);

// Add text
ctx.font = 'bold 64px sans-serif';
ctx.fillStyle = 'white';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('💫', 64, 64);

// Download
const link = document.createElement('a');
link.download = 'icon128.png';
link.href = canvas.toDataURL();
link.click();
</script>
```
