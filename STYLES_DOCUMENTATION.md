# SupriAI - Complete Styles Documentation

## 📋 Overview
This document provides a comprehensive breakdown of all styled HTML elements in the SupriAI project with reduced, calm font sizes for a peaceful user experience.

---

## 🎨 Typography System (Reduced & Calm)

### Base Typography
```css
body: 13px (reduced from default)
line-height: 1.7 (increased for calm reading)
letter-spacing: 0.01em
```

### Headings (All Reduced)
- **`<h1>`** - 1.5rem (24px) - Main page titles
- **`<h2>`** - 1.25rem (20px) - Section titles
- **`<h3>`** - 1rem (16px) - Subsection titles
- **`<h4>`** - 0.9375rem (15px) - Card titles
- **`<h5>`** - 0.875rem (14px) - Minor headings
- **`<h6>`** - 0.8125rem (13px) - Smallest headings

### Text Elements
- **`<p>`** - 0.8125rem (13px) - Paragraph text
- **`<span>`** - Inherits parent size - Inline text
- **`<label>`** - 0.8125rem (13px) - Form labels
- **`<a>`** - Inherits parent - Links with hover transition
- **`<li>`** - 0.8125rem (13px) - List items

### Code Elements
- **`<code>`** - 0.75rem (12px) - Inline code snippets
- **`<pre>`** - 0.75rem (12px) - Code blocks
- **`<blockquote>`** - 0.8125rem (13px) - Quoted text

---

## 🔘 Button Styles (All Sizes)

### Button Base
- **`<button>` / `.btn`** - 0.8125rem (13px)
  - Padding: 0.5rem 1rem
  - Border radius: var(--radius-md)
  - Letter spacing: 0.01em

### Button Variants
- **`.btn-sm`** - 0.75rem (12px) - Small buttons
  - Padding: 0.375rem 0.75rem
  
- **`.btn-lg`** - 0.875rem (14px) - Large buttons
  - Padding: 0.625rem 1.25rem

### Button Types
- **`.btn-primary`** - Primary action buttons (blue)
- **`.btn-secondary`** - Secondary buttons (neutral)
- **`.btn-accent`** - Accent buttons (purple)
- **`.btn-success`** - Success buttons (green)

---

## 📝 Form Elements (All Sizes)

### Input Fields
- **`<input>`** - 0.8125rem (13px)
  - Padding: 0.5rem 0.75rem
  - Border: 1px solid
  - Border radius: var(--radius-md)

### Text Areas
- **`<textarea>`** - 0.8125rem (13px)
  - Min height: 80px
  - Line height: 1.6
  - Vertical resize only

### Select Dropdowns
- **`<select>`** - 0.8125rem (13px)
  - Custom arrow icon
  - Padding right: 2rem

---

## 🗂️ Table Elements (All Sizes)

### Table Structure
- **`<table>`** - 0.8125rem (13px) - Base table
- **`<thead>`** - Background: var(--bg-tertiary)
- **`<th>`** - 0.6875rem (11px) - Table headers
  - Uppercase, 600 weight
  - Letter spacing: 0.05em
  - Padding: 0.75rem
- **`<td>`** - 0.8125rem (13px) - Table cells
  - Padding: 0.75rem
- **`<tr>`** - Hover effect with background transition

---

## 📦 Layout Components

### Container Elements
- **`<div>`** - Inherits, used for structure
- **`<section>`** - Inherits, semantic sections
- **`<article>`** - Inherits, content articles
- **`<aside>`** - Sidebar content
- **`<header>`** - Page/section headers
- **`<footer>`** - 0.6875rem (11px) - Footer content
- **`<main>`** - Main content area
- **`<nav>`** - Navigation containers

---

## 🎴 Card Components

### Card Structure
- **`.card`** - Base card container
  - Border: 1px solid var(--border-light)
  - Border radius: var(--radius-lg)
  - Padding: var(--space-lg)
  - Shadow: var(--shadow-sm)

### Card Header
- **`.card-header h3`** - 1rem (16px) - Card titles

### Stat Cards (Dashboard)
- **`.stat-value`** - 1.625rem (26px) - Main stat number
- **`.stat-label`** - 0.8125rem (13px) - Stat description
- **`.stat-icon`** - 42px × 42px, 1.25rem icon

### Stat Cards (Popup)
- **`.stat-value`** - 0.9375rem (15px) - Compact stat number
- **`.stat-label`** - 0.625rem (10px) - Compact stat label
- **`.stat-icon`** - 36px × 36px, 1rem icon

---

## 🎯 Navigation Elements

### Sidebar Navigation
- **`.nav-item`** - 0.8125rem (13px)
  - Padding: 0.625rem 0.75rem
  - Icon size: 1.125rem
  - Icon width: 20px

### Logo
- **`.logo h1`** 
  - Dashboard: 1.25rem (20px)
  - Popup: 1rem (16px)
- **`.logo-icon`**
  - Dashboard: 36px × 36px
  - Popup: 28px × 28px

---

## 🎨 Badge & Label Components

### Badges
- **`.badge`** - 0.75rem (12px) - Standard badge
- **`.badge-success`** - Success badge (green)
- **`.badge-warning`** - Warning badge (yellow/orange)
- **`.badge-accent`** - Accent badge (purple)

### Status Indicators
- **`.status-text`** - 0.75rem (12px)
- **`.status-dot`** - 8px circle indicator

### Tags
- **`.resource-tag`** - 0.6875rem (11px) - Resource links
- **`.recommendation-type`** - 0.625rem (10px) - Type badge
- **`.recommendation-priority`** - 0.625rem (10px) - Priority badge

---

## 📊 Specialized Components

### Engagement Meter
- **`.meter-label`** - 0.6875rem (11px)
- **`.meter-bar`** - Height: 5px
- **`.meter-value`** - 0.75rem (12px)

### Focus Indicator
- **`.focus-label`** - 0.6875rem (11px)
- **`.focus-dot`** - 8px circles

### Streak Badge
- **`.streak-count`** - 1.25rem (20px) - Main number
- **`.streak-label`** - 0.6875rem (11px)
- **`.streak-icon`** - 1.25rem

### Topic Items
- **`.topic-name`** - 0.8125rem (13px)
- **`.topic-time`** - 0.6875rem (11px)
- **`.topic-icon`** - 1rem

### Session Items
- **`.session-title`** - 0.8125rem (13px)
- **`.session-meta`** - 0.6875rem (11px)
- **`.session-time`** - 0.75rem (12px)
- **`.session-icon`** - 36px × 36px, 1rem

---

## 💡 Insights & Analytics

### Insight Items
- **`.insight-label`** - 0.6875rem (11px)
- **`.insight-value`** - 0.875rem (14px)
- **`.insight-icon`** - 36px × 36px, 1rem

### Pattern Items
- **`.pattern-content h4`** - 0.8125rem (13px)
- **`.pattern-content p`** - 0.75rem (12px)
- **`.pattern-icon`** - 32px × 32px, 0.875rem

### Chart Components
- **`.chart-header h3`** - 1rem (16px)
- **`.chart-legend`** - 0.75rem (12px)
- **`.chart-container`** - Height: 260px (standard), 340px (large)

---

## 🔍 Search & Filter

### Search Box
- **`.search-box input`** - 0.8125rem (13px)
  - Padding: 0.375rem 0.75rem 0.375rem 2.25rem
- **`.search-box i`** - Icon at 0.875rem

---

## 🎨 Recommendation Components

### Recommendation Cards
- **`.recommendation-title`**
  - Dashboard: 0.9375rem (15px)
  - Popup: 0.8125rem (13px)
- **`.recommendation-desc`**
  - Dashboard: 0.8125rem (13px)
  - Popup: 0.6875rem (11px)
- **`.recommendation-type`** - 0.625rem (10px) - Uppercase badge
- **`.recommendation-priority`** - 0.625rem (10px)

---

## ⚙️ Settings Components

### Setting Items
- **`.setting-label`** - 0.8125rem (13px) - Setting name
- **`.setting-desc`** - 0.75rem (12px) - Description

### Toggle Switch
- **`.toggle-switch`** - 48px × 24px
- **`.toggle-slider`** - Full width switch
- **`.toggle-slider:before`** - 18px circle

---

## 🎭 Header Components

### Main Header (Dashboard)
- **`.header-left h2`** - 1.375rem (22px) - Section title
- **`.header-subtitle`** - 0.8125rem (13px)

### Backend Status
- **`.backend-status`** - 0.75rem (12px)
- **`.status-indicator i`** - 0.875rem

### Time Range Selector
- **`.range-btn`** - 0.75rem (12px)
  - Padding: 0.375rem 0.75rem

### Sync Button
- **`.sync-btn`** - 0.8125rem (13px)
  - Padding: 0.375rem 0.875rem

---

## 📏 Utility Classes

### Text Sizes
- **`.text-lg`** - 0.9375rem (15px) - Large text
- **`.text-sm`** - 0.8125rem (13px) - Small text
- **`.text-xs`** - 0.6875rem (11px) - Extra small text

### Text Alignment
- **`.text-center`** - Center aligned
- **`.text-right`** - Right aligned

### Font Weights
- **`.font-medium`** - 500 weight
- **`.font-semibold`** - 600 weight
- **`.font-bold`** - 700 weight

### Text Colors
- **`.text-primary`** - Primary text color
- **`.text-secondary`** - Secondary text color
- **`.text-tertiary`** - Tertiary/muted text
- **`.text-accent`** - Accent purple color
- **`.text-success`** - Success green color
- **`.text-warning`** - Warning yellow/orange
- **`.text-error`** - Error red color

---

## 🖼️ Media Elements

### Images
- **`<img>`** - Max width: 100%, height: auto
  - Display: block

### Figures
- **`<figure>`** - Margin: var(--space-lg) 0
- **`<figcaption>`** - 0.75rem (12px), centered

---

## 📐 List Elements

### Unordered & Ordered Lists
- **`<ul>` / `<ol>`** - Padding left: 1.5rem
- **`<li>`** - 0.8125rem (13px)
  - Line height: 1.7
  - Margin bottom: 0.25rem

---

## 🎨 Special Elements

### Horizontal Rule
- **`<hr>`** - 1px solid var(--border-light)
  - Margin: var(--space-lg) 0

### Scrollbar (Custom)
- Width: 8px (6px in popup)
- Thumb: Rounded, neutral-400 color
- Track: Transparent or bg-secondary

---

## 🌈 Color Variables

### Theme Colors (Both Light & Dark)
- Primary: Blue shades (50-900)
- Accent: Purple shades (50-900)
- Success: Green shades
- Warning: Orange/Yellow shades
- Error: Red shades
- Neutral: Gray shades (50-900)

---

## 📦 Shadow System (Softened)

- **`--shadow-sm`** - 0 1px 2px rgba(0,0,0,0.03) - Minimal shadow
- **`--shadow-md`** - 0 2px 4px rgba(0,0,0,0.06) - Medium shadow
- **`--shadow-lg`** - 0 6px 12px rgba(0,0,0,0.08) - Large shadow
- **`--shadow-xl`** - 0 12px 20px rgba(0,0,0,0.08) - Extra large shadow

*All shadows reduced by 40-50% for a calmer appearance*

---

## 📏 Spacing System

- **`--space-xs`** - 0.25rem (4px)
- **`--space-sm`** - 0.5rem (8px)
- **`--space-md`** - 1rem (16px)
- **`--space-lg`** - 1.5rem (24px)
- **`--space-xl`** - 2rem (32px)
- **`--space-2xl`** - 3rem (48px)
- **`--space-3xl`** - 4rem (64px)

---

## 🔄 Border Radius System

- **`--radius-sm`** - 0.375rem (6px)
- **`--radius-md`** - 0.5rem (8px)
- **`--radius-lg`** - 0.75rem (12px)
- **`--radius-xl`** - 1rem (16px)
- **`--radius-full`** - 9999px (fully rounded)

---

## ⏱️ Transition System

- **`--transition-fast`** - 150ms - Quick interactions
- **`--transition-base`** - 200ms - Standard transitions
- **`--transition-slow`** - 300ms - Slower animations

---

## 🎯 Key Design Principles

### Calm & Unique Styling Features:

1. **Reduced Font Sizes**: All text 10-20% smaller than standard for less visual weight
2. **Increased Line Height**: 1.7 (vs 1.6) for more breathing room
3. **Softer Shadows**: 40-50% reduced opacity for subtle depth
4. **Letter Spacing**: 0.01em added for improved readability
5. **Consistent Hierarchy**: Clear size differences between heading levels
6. **Compact Components**: Reduced padding and icon sizes throughout
7. **Gentle Transitions**: Smooth 200ms base transitions
8. **Accessible Contrast**: Maintained WCAG AA standards despite smaller sizes

---

## 📱 Responsive Behavior

### Breakpoints
- **Desktop**: > 1280px - Full layout
- **Tablet**: 768px - 1280px - Adjusted grid
- **Mobile**: < 768px - Single column, reduced sidebar

### Font Scaling
All font sizes use `rem` units, scaling with root font size (13px base)

---

## 🎨 Dark Theme Adjustments

All components automatically adjust for dark theme:
- Inverted backgrounds
- Adjusted text colors (f1f5f9 → 0f172a)
- Semi-transparent accent colors
- Enhanced shadow depths
- Icon color adjustments

---

## ✅ Accessibility Features

1. **Focus Visible**: 2px solid outline on all interactive elements
2. **Color Contrast**: Minimum WCAG AA compliance
3. **Font Legibility**: Despite reduction, still readable at 13px base
4. **Touch Targets**: Minimum 32px for mobile interactions
5. **Keyboard Navigation**: All interactive elements accessible
6. **Screen Reader Support**: Semantic HTML throughout

---

## 📋 Summary

**Total Styled Elements**: 100+ unique components
**Base Font Size**: 13px (reduced)
**Heading Sizes**: 6 levels (24px → 13px)
**Button Variants**: 3 sizes, 4 types
**Color Palette**: 5 color systems with 50-900 shades each
**Component Count**: 30+ specialized UI components

---

*Last Updated: December 23, 2025*
*Version: 1.0 - Calm & Unique Styling*
