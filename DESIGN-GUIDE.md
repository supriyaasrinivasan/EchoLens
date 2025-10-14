# 🎨 EchoLens - Visual Design Guide

## Color Palette

### Primary Colors
```
🟣 Echo Purple (Primary)
   Hex: #6366f1
   RGB: rgb(99, 102, 241)
   Use: Main accents, CTA buttons, active states

🔵 Echo Blue (Secondary)  
   Hex: #3b82f6
   RGB: rgb(59, 130, 246)
   Use: Links, secondary buttons, highlights

🌊 Echo Cyan (Accent)
   Hex: #06b6d4
   RGB: rgb(6, 182, 212)
   Use: Badges, tags, recent activity

⚫ Echo Dark (Background)
   Hex: #0a0e27
   RGB: rgb(10, 14, 39)
   Use: Main background, dark surfaces

⚪ Echo Light (Text)
   Hex: #f1f5f9
   RGB: rgb(241, 245, 249)
   Use: Primary text, headings

🌫️ Echo Gray (Muted)
   Hex: #64748b
   RGB: rgb(100, 116, 139)
   Use: Secondary text, disabled states
```

### Gradients
```css
/* Primary Gradient */
background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);

/* Dark Gradient */
background: linear-gradient(135deg, #0a0e27 0%, #1e293b 100%);

/* Glow Gradient */
background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;
```

### Type Scale
```
Heading 1:  28px / 700 weight
Heading 2:  24px / 700 weight
Heading 3:  20px / 600 weight
Heading 4:  18px / 600 weight
Body Large: 16px / 500 weight
Body:       14px / 400 weight
Body Small: 13px / 400 weight
Caption:    11px / 500 weight
```

---

## Spacing System

Based on 4px grid:
```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  20px
2xl: 24px
3xl: 32px
4xl: 48px
5xl: 64px
```

---

## Component Styles

### Cards
```css
background: linear-gradient(135deg, 
            rgba(99, 102, 241, 0.05) 0%, 
            rgba(59, 130, 246, 0.05) 100%);
border: 1px solid rgba(99, 102, 241, 0.2);
border-radius: 16px;
padding: 20px;
transition: all 0.3s ease;
```

### Buttons (Primary)
```css
background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
transition: all 0.3s;
```

### Input Fields
```css
background: rgba(15, 23, 42, 0.8);
border: 1px solid rgba(99, 102, 241, 0.3);
border-radius: 12px;
padding: 12px 16px;
color: #f1f5f9;
transition: all 0.2s;
```

### Glassmorphism
```css
background: rgba(15, 23, 42, 0.9);
backdrop-filter: blur(12px);
border: 1px solid rgba(99, 102, 241, 0.2);
```

---

## Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 0.4s ease-out;
```

### Slide Up
```css
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
animation: slideUp 0.4s ease-out;
```

### Pulse (Loading)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
animation: pulse 2s infinite;
```

### Hover Effects
```css
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.2);
}
```

---

## Icon System

### Using Lucide React
```jsx
import { Sparkles, Clock, Tag } from 'lucide-react';

<Sparkles size={20} color="#6366f1" />
<Clock size={16} />
<Tag size={14} />
```

### Common Icons
- 💫 Sparkles: AI features, magic
- 🌌 Stars: Memories, constellation
- 🔮 Crystal: Insights, predictions
- 📅 Calendar: Timeline, dates
- 🗺️ Map: Knowledge graph
- ⏱️ Clock: Time tracking
- 🏷️ Tag: Categories
- 🔍 Search: Find memories

---

## Layout Patterns

### Sidebar Layout
```
┌────────────────────────────────┐
│ Sidebar │    Main Content      │
│ (280px) │    (flex: 1)         │
│         │                      │
│         │                      │
│         │                      │
└────────────────────────────────┘
```

### Card Grid
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
gap: 20px;
```

### Stats Grid
```css
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 12px;
```

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

---

## Dark Mode Design

EchoLens uses a dark-first design:
- Reduces eye strain for extended use
- Matches constellation/space metaphor
- Better for content-focused reading
- Energy efficient on OLED screens

### Surface Hierarchy
```
Level 0 (Background):  #0a0e27
Level 1 (Cards):       rgba(15, 23, 42, 0.9)
Level 2 (Elevated):    rgba(30, 41, 59, 0.9)
Level 3 (Modal):       rgba(51, 65, 85, 0.95)
```

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Minimum 4.5:1 contrast ratio
- Interactive elements 3:1 ratio

### Focus States
```css
:focus {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
```

### Screen Reader Support
```html
<button aria-label="Open memory dashboard">
  <Icon />
</button>
```

---

## Design Assets Needed

### Extension Icons
- [ ] icon16.png (16×16) - Toolbar
- [ ] icon48.png (48×48) - Management
- [ ] icon128.png (128×128) - Web Store

### Chrome Web Store
- [ ] Screenshot 1 (1280×800) - Dashboard
- [ ] Screenshot 2 (1280×800) - Popup
- [ ] Screenshot 3 (1280×800) - Knowledge Map
- [ ] Screenshot 4 (1280×800) - Memory List
- [ ] Screenshot 5 (1280×800) - Timeline
- [ ] Promo Tile (440×280) - Small tile
- [ ] Marquee (1400×560) - Large banner

### Marketing
- [ ] Logo (SVG + PNG variants)
- [ ] Social media banner (1200×630)
- [ ] Demo video thumbnail
- [ ] Landing page hero image

---

## Design Tools

### Recommended
- **Figma** - UI design & prototyping
- **Adobe Illustrator** - Icons & logos
- **Canva** - Marketing materials
- **Loom** - Demo videos

### Icon Generation
```html
<!-- Quick placeholder generator -->
<canvas id="icon"></canvas>
<script>
const canvas = document.getElementById('icon');
const ctx = canvas.getContext('2d');
canvas.width = 128;
canvas.height = 128;

// Gradient
const grad = ctx.createLinearGradient(0, 0, 128, 128);
grad.addColorStop(0, '#6366f1');
grad.addColorStop(1, '#3b82f6');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, 128, 128);

// Emoji
ctx.font = 'bold 64px sans-serif';
ctx.fillStyle = 'white';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('💫', 64, 64);

// Download
canvas.toBlob(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'icon128.png';
  a.click();
});
</script>
```

---

## Design Inspiration

### Visual References
- **Constellation Maps** - Nodes & connections
- **Space Exploration** - Dark backgrounds, glowing elements
- **Memory Palaces** - Spatial organization
- **Knowledge Graphs** - Network visualizations

### Similar Projects (UI/UX)
- Notion (organization)
- Obsidian (knowledge graphs)
- Arc Browser (modern chrome)
- Linear (animations)

---

*This design guide ensures visual consistency across all EchoLens interfaces.*
