# Learning Analytics Dashboard - Visual Design Guide

## 🎨 Design System

### Color Palette

#### Brand Colors
- **Primary Purple:** `#8b5cf6` - Main brand color
- **Secondary Purple:** `#7c3aed` - Darker variant
- **Gradient:** `linear-gradient(135deg, #8b5cf6, #7c3aed)`

#### Engagement Colors
```css
High Engagement (80%+):    #10b981 (Green)
Good Engagement (60-79%):  #3b82f6 (Blue)
Medium Engagement (40-59%): #f59e0b (Orange)
Low Engagement (<40%):     #6b7280 (Gray)
```

#### Insight Type Colors
```css
Consistency: #ef4444 (Red)    - Fire icon
Focus:       #3b82f6 (Blue)   - Target icon
Timing:      #10b981 (Green)  - Calendar icon
Strength:    #8b5cf6 (Purple) - Chart icon
```

### Typography

```css
Main Heading:      28px, Bold, var(--text-primary)
Section Heading:   20px, Semi-bold, var(--text-primary)
Card Title:        16px, Semi-bold, var(--text-primary)
Body Text:         14px, Regular, var(--text-secondary)
Small Text:        12px, Regular, var(--text-tertiary)
Tiny Labels:       11px, Medium, var(--text-muted)
```

### Spacing System

```css
XS:  4px   - Icon gaps
S:   8px   - Chip padding
M:   12px  - Card internal spacing
L:   16px  - Between elements
XL:  20px  - Card padding
2XL: 24px  - Large card padding
3XL: 32px  - Section margins
```

### Border Radius

```css
Small:  6px   - Chips, badges
Medium: 10px  - Buttons
Large:  12px  - Cards
XLarge: 14px  - Major containers
Round:  50%   - Circles, avatars
Pill:   20px  - Tag chips
```

### Shadows

```css
/* Subtle */
box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);

/* Medium */
box-shadow: 0 4px 16px rgba(139, 92, 246, 0.15);

/* Strong */
box-shadow: 0 8px 24px rgba(139, 92, 246, 0.18);

/* Elevated */
box-shadow: 0 8px 32px rgba(139, 92, 246, 0.25);
```

## 📐 Layout Structure

### Dashboard Grid

```
┌─────────────────────────────────────────┐
│        Time Range Selector              │
│   [Today] [Week] [Month] [All]          │
└─────────────────────────────────────────┘

┌────────────┬────────────┬────────────┬────────────┐
│  Total     │  Sessions  │  Avg       │  Day       │
│  Time      │    Count   │  Engage    │  Streak    │
│  5h 30m    │     24     │   78%      │    7🔥     │
└────────────┴────────────┴────────────┴────────────┘

┌─────────────────────────────────────────┐
│  📊 Top Learning Paths                   │
├─────────────────────────────────────────┤
│  #1  Frontend Development               │
│       2h 30m  •  8 sessions  [████░] 85%│
│  #2  Backend APIs                       │
│       1h 45m  •  5 sessions  [███░░] 70%│
│  #3  Data Science                       │
│       1h 15m  •  4 sessions  [██░░░] 55%│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📅 Daily Activity (Last 7 Days)        │
├─────────────────────────────────────────┤
│  ████ ███ █████ ██ ████ ███ ████       │
│  Mon  Tue  Wed  Thu Fri  Sat Sun        │
│  45m  30m  1h   20m 50m  35m 55m        │
└─────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│  💡 Insights │              │              │
├──────────────┼──────────────┼──────────────┤
│ 🔥 Consistency│ 🎯 Focus    │ 📅 Timing    │
│ 7-day streak! │ Frontend 65%│ Peak: 2-4 PM │
└──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┐
│  ✨ Recommendations          │
├──────────────┬──────────────┤
│ React Hooks  │ TypeScript   │
│ Based on...  │ Next step... │
└──────────────┴──────────────┘

┌─────────────────────────────────────────┐
│  📖 Recent Learning Sessions            │
├─────────────────────────────────────────┤
│  [icon] React Documentation             │
│         Frontend • 45m • High           │
│  [icon] Node.js Guide                   │
│         Backend • 30m • Medium          │
└─────────────────────────────────────────┘
```

### Responsive Breakpoints

#### Desktop (1024px+)
- 4-column summary grid
- 3-column insights
- 2-column recommendations

#### Tablet (768-1024px)
- 2-column summary grid
- 2-column insights
- 1-2 column recommendations

#### Mobile (< 768px)
- 1-column everything
- Stacked cards
- Simplified charts

## 🎭 Component States

### Button States

```css
/* Default */
background: var(--button-bg);
border: 2px solid var(--border-secondary);

/* Hover */
background: var(--button-hover);
border-color: var(--brand-primary);
transform: translateY(-1px);

/* Active */
background: var(--brand-gradient);
color: white;
box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
```

### Card States

```css
/* Default */
border: 2px solid var(--border-secondary);

/* Hover */
border-color: var(--brand-primary);
transform: translateY(-4px);
box-shadow: 0 8px 24px rgba(139, 92, 246, 0.18);

/* Before Pseudo (Top Border) */
content: '';
height: 3px;
background: var(--brand-gradient);
opacity: 0 → 1 (on hover);
```

## ✨ Animation Details

### Loading Animation

```css
@keyframes sparkle {
  0%, 100%: opacity: 1, scale(1), rotate(0deg)
  25%:      opacity: 0.7, scale(1.1), rotate(90deg)
  50%:      opacity: 0.5, scale(1.15), rotate(180deg)
  75%:      opacity: 0.7, scale(1.1), rotate(270deg)
}
Duration: 2s
Easing: cubic-bezier(0.4, 0, 0.6, 1)
Infinite loop
```

### Engagement Bar Shimmer

```css
@keyframes shimmer {
  0%:   translateX(-100%)
  100%: translateX(100%)
}
Gradient overlay: white at 0.3 opacity
Duration: 2s
Infinite loop
```

### Hover Transitions

```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## 📊 Chart Specifications

### Bar Chart (Daily Activity)

```css
Height: 200px
Gap: 12px
Bar Width: 70% of available space
Border Radius: 6px 6px 0 0
Gradient: linear-gradient(135deg, #8b5cf6, #3b82f6)
Shadow: 0 -2px 8px rgba(139, 92, 246, 0.3)
```

### Engagement Progress Bars

```css
Height: 10px
Border Radius: 5px
Background: var(--button-bg)
Fill Animation: 0.6s cubic-bezier(0.4, 0, 0.2, 1)
```

## 🏷️ Badge Styles

### Engagement Badges

```css
/* High */
background: rgba(16, 185, 129, 0.15);
color: #10b981;

/* Medium */
background: rgba(59, 130, 246, 0.15);
color: #3b82f6;

/* Low */
background: rgba(251, 146, 60, 0.15);
color: #fb923c;

Padding: 4px 10px
Border Radius: 6px
Font Size: 11px
Font Weight: 700
Text Transform: uppercase
Letter Spacing: 0.3px
```

### Category Badges

```css
background: var(--brand-gradient);
color: white;
padding: 4px 10px;
border-radius: 6px;
font-size: 10px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
```

## 🌙 Dark Mode Adjustments

```css
/* Enhanced shadows */
.bar-fill {
  box-shadow: 0 -2px 12px rgba(139, 92, 246, 0.4);
}

.learning-summary-card:hover,
.recommendation-card:hover {
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.25);
}
```

## 🎯 Icon Usage

### Icon Sizes
- Large Icons: 72px (empty states)
- Section Icons: 24px (headings)
- Card Icons: 20px (insights)
- Inline Icons: 14-16px (stats)
- Tiny Icons: 12px (metadata)

### Icon Colors
- Brand Actions: var(--brand-primary)
- Time/Duration: #3b82f6 (Blue)
- Success/Positive: #10b981 (Green)
- Warning/Alert: #f59e0b (Orange)
- Streak/Fire: #ef4444 (Red)

## 📱 Mobile Optimizations

```css
/* Reduce padding */
.learning-summary-card {
  padding: 20px → 16px;
}

/* Stack horizontally aligned items */
.learning-summary-card {
  flex-direction: column;
  text-align: center;
}

/* Simplify charts */
.chart-wrapper {
  height: 200px → 160px;
  gap: 12px → 8px;
}

/* Full-width time selector */
.time-range-selector {
  width: 100%;
}
```

## ♿ Accessibility

### Focus States
```css
button:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

### Color Contrast Ratios
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Icons/graphics: 3:1 minimum

### Screen Reader Text
- Hidden labels for chart values
- ARIA labels on interactive elements
- Semantic HTML structure

---

**Design Language:** Modern, clean, data-focused
**Inspiration:** Notion, Linear, Stripe Dashboard
**Framework:** Custom CSS with design tokens
