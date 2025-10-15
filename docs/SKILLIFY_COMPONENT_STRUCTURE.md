# Skillify Component Structure & Alignment Guide

## 📐 Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        SKILLIFY DASHBOARD                        │
│  padding: 32px | max-width: 1600px | margin: 0 auto            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              STATS OVERVIEW (4-column grid)                │  │
│  │  gap: 20px | grid: repeat(auto-fit, minmax(240px, 1fr))  │  │
│  ├──────────┬──────────┬──────────┬──────────────────────────┤  │
│  │  🔥      │  ⏰      │  📚      │  🏆                       │  │
│  │ Total XP │ Learning │ Skills   │ Expert                   │  │
│  │  1,234   │  Time    │ Tracked  │ Level                    │  │
│  │          │   45h    │    12    │    3                     │  │
│  │ h:48px | padding: 24px | border-radius: 14px            │  │
│  └──────────┴──────────┴──────────┴──────────────────────────┘  │
│                        ↓ margin-bottom: 32px                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   CONTROLS BAR                             │  │
│  │  display: flex | justify: space-between | height: 48px   │  │
│  ├───────────────────────────────────┬──────────────────────┤  │
│  │ 🔍 Search | 🔽 Filter | 📊 Sort   │  ➕ Add Skill       │  │
│  │  flex: 1 | gap: 12px              │  gradient button     │  │
│  └───────────────────────────────────┴──────────────────────┘  │
│                        ↓ margin-bottom: 28px                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ADD SKILL FORM (conditional)                  │  │
│  │  padding: 24px | border: 2px solid primary | gap: 12px   │  │
│  │  ┌────────────────────┬──────────┬──────────┐            │  │
│  │  │ Input (flex: 1)    │   Add    │  Cancel  │            │  │
│  │  │ height: 48px       │  h: 48px │  h: 48px │            │  │
│  │  └────────────────────┴──────────┴──────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        ↓ margin-bottom: 28px                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    SKILLS GRID                             │  │
│  │  grid: repeat(auto-fill, minmax(360px, 1fr)) | gap: 24px │  │
│  ├─────────────────────┬─────────────────────┬───────────────┤  │
│  │  ┌─────────────┐    │  ┌─────────────┐    │ ┌──────────┐ │  │
│  │  │ 💻 Skill 1  │    │  │ 🎨 Skill 2  │    │ │📊Skill 3 │ │  │
│  │  ├─────────────┤    │  ├─────────────┤    │ ├──────────┤ │  │
│  │  │ XP│Act│Time │    │  │ XP│Act│Time │    │ │XP│Act│Tm │ │  │
│  │  ├─────────────┤    │  ├─────────────┤    │ ├──────────┤ │  │
│  │  │ Progress    │    │  │ Progress    │    │ │Progress  │ │  │
│  │  │ ▓▓▓▓▒▒▒ 67% │    │  │ ▓▓▓▒▒▒▒ 45% │    │ │▓▓▓▓▓▓93% │ │  │
│  │  └─────────────┘    │  └─────────────┘    │ └──────────┘ │  │
│  │  padding: 28px      │  border: 2px        │  h: auto    │  │
│  └─────────────────────┴─────────────────────┴───────────────┘  │
│                        ↓ margin-top: 56px                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            LEARNING PATHS SECTION                          │  │
│  │  border-top: 3px solid | padding-top: 40px               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  🎯 Recommended Learning Paths                      │  │  │
│  │  │  Curated resources based on your current progress   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────┬─────────────────┬────────────────┐  │  │
│  │  │ 💻 Programming  │ 🎨 Design       │ 🤖 AI/ML       │  │  │
│  │  │ Level: Learner  │ Level: Beginner │ Level: Inter.  │  │  │
│  │  │ ┌─────────────┐ │ ┌─────────────┐ │ ┌────────────┐ │  │
│  │  │ │Resource 1→  │ │ │Resource 1→  │ │ │Resource 1→ │ │  │
│  │  │ │Resource 2→  │ │ │Resource 2→  │ │ │Resource 2→ │ │  │
│  │  │ │Resource 3→  │ │ │Resource 3→  │ │ │Resource 3→ │ │  │
│  │  │ └─────────────┘ │ └─────────────┘ │ └────────────┘ │  │
│  │  └─────────────────┴─────────────────┴────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Skill Card Anatomy

```
┌─────────────────────────────────────────────────┐
│ [Gradient Top Bar - 4px] - Visible on hover     │ ← border-top indicator
├─────────────────────────────────────────────────┤
│  padding: 28px (all sides)                      │
│  ┌───────────────────────────────────────────┐  │
│  │ HEADER (flex: space-between)              │  │
│  │  ┌──────────────────────────┬─────────┐  │  │
│  │  │ 💻 [42px icon]           │   ⭐    │  │  │ ← favorite button
│  │  │ Programming              │ [20px]  │  │  │
│  │  │ ┌──────────────────┐     │         │  │  │
│  │  │ │ INTERMEDIATE     │     │         │  │  │ ← level badge
│  │  │ └──────────────────┘     │         │  │  │   (5px 12px padding)
│  │  └──────────────────────────┴─────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                   ↓ gap: 20px                   │
│  ┌───────────────────────────────────────────┐  │
│  │ STATS GRID (3 columns)                    │  │
│  │  border-top & border-bottom | py: 20px    │  │
│  │  ┌───────┬───────┬───────┐                │  │
│  │  │  XP   │ ACTS  │ HOURS │                │  │
│  │  │  250  │  15   │  12h  │  ← centered    │  │
│  │  └───────┴───────┴───────┘                │  │
│  └───────────────────────────────────────────┘  │
│                   ↓ gap: 20px                   │
│  ┌───────────────────────────────────────────┐  │
│  │ PROGRESS SECTION                          │  │
│  │  ┌─────────────────────┬───────────────┐  │  │
│  │  │ Level 3             │ 50 XP to next │  │  │ ← info row
│  │  └─────────────────────┴───────────────┘  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ ▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒ 12px height     │  │  │ ← progress bar
│  │  │ [Shimmer animation overlay]          │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │          67%  ← centered                  │  │
│  └───────────────────────────────────────────┘  │
│                   ↓ gap: 16px                   │
│  ┌───────────────────────────────────────────┐  │
│  │ 💡 Last active: Oct 12, 2025              │  │ ← recent activity
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Total Height: Auto (content-based)             │
│  Border: 2px solid (primary on hover/favorite)  │
│  Border Radius: 16px                            │
│  Shadow: 0 12px 32px on hover                   │
│  Transform: translateY(-6px) on hover           │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Learning Path Card Structure

```
┌───────────────────────────────────────────────┐
│ [Gradient Top Bar - 3px] - Visible on hover   │
├───────────────────────────────────────────────┤
│  padding: 28px                                │
│  ┌─────────────────────────────────────────┐  │
│  │ 💻 [32px icon] Programming              │  │ ← path header
│  │ Current Level: Learner (bold/primary)   │  │
│  └─────────────────────────────────────────┘  │
│                ↓ gap: 20px                    │
│  ┌─────────────────────────────────────────┐  │
│  │ RESOURCE 1                              │  │
│  │  ┌─────┐                                │  │
│  │  │FREE │ freeCodeCamp  ────────────→    │  │
│  │  └─────┘                                │  │
│  │  [Left accent: 3px gradient on hover]   │  │
│  │  padding: 14px 16px | gap: 14px         │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │ RESOURCE 2                              │  │
│  │  ┌────────┐                             │  │
│  │  │FREEMIUM│ Codecademy  ─────────────→  │  │
│  │  └────────┘                             │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │ RESOURCE 3                              │  │
│  │  ┌─────┐                                │  │
│  │  │PAID │ Frontend Masters  ──────────→  │  │
│  │  └─────┘                                │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Hover: translateY(-4px) + shadow            │
│  Transform: translateX(6px) on link hover    │
└───────────────────────────────────────────────┘
```

---

## 📏 Exact Measurements

### Container Widths
```css
.skills-dashboard           → max-width: 1600px
.skills-stats-overview      → width: 100%
.skills-controls            → width: 100%
.skills-grid                → width: 100%
.learning-paths-grid        → width: 100%
```

### Heights
```css
.stat-card                  → auto (min-content)
.search-box                 → 48px (exact)
.filter-group               → 48px (exact)
.sort-group                 → 48px (exact)
.add-skill-btn              → 48px (exact)
.add-skill-form input       → 48px (exact)
.add-skill-form button      → 48px (exact)
.skill-card                 → auto (content-based)
.progress-bar               → 12px (exact)
```

### Gaps & Spacing
```css
stats-overview gap          → 20px
controls gap                → 16px
search-filter-group gap     → 12px
skills-grid gap             → 24px
learning-paths gap          → 24px
skill-card internal gap     → 20px
stat-card icon-content gap  → 18px
```

### Padding
```css
.skills-dashboard           → 32px
.stat-card                  → 24px
.skill-card                 → 28px
.learning-path-card         → 28px
.search-box                 → 12px 16px
.add-skill-form             → 24px
.resource-link              → 14px 16px
```

---

## 🎯 Alignment Principles

### Horizontal Alignment
1. **Controls Row**: All elements 48px tall, aligned on baseline
2. **Card Headers**: Icons and text vertically centered
3. **Resource Links**: Platform badge, title, arrow on single line

### Vertical Alignment
1. **Stats Grid**: Equal-height columns with centered content
2. **Card Content**: Consistent 20px gaps between sections
3. **Section Breaks**: Clear borders with appropriate padding

### Grid Alignment
1. **Auto-fit**: Stats adjust to available space (240px min)
2. **Auto-fill**: Skills/paths create new columns at 360px/380px
3. **Responsive**: Single column on mobile, multi-column on desktop

---

## 🔄 State Variations

### Hover States
- **Cards**: Lift 4-6px, show top gradient bar
- **Buttons**: Lift 2-3px, enhance shadow
- **Links**: Slide right 6px, show left accent

### Focus States
- **Inputs**: Primary border + 3px ring shadow
- **Buttons**: Outline for keyboard navigation

### Loading States
- **Dashboard**: Centered spinner with pulse animation
- **Cards**: Skeleton with shimmer effect

### Empty States
- **No Skills**: Large icon (64px), CTA button
- **No Results**: Centered message, filter reset option

---

## 📱 Responsive Breakpoints

### Desktop (> 1200px)
```
Stats:  [■] [■] [■] [■]  (4 columns)
Skills: [■] [■] [■]      (3+ columns)
Paths:  [■] [■] [■]      (3+ columns)
```

### Tablet (768px - 1200px)
```
Stats:  [■] [■]          (2 columns)
Skills: [■] [■]          (2 columns)
Paths:  [■] [■]          (2 columns)
```

### Mobile (< 768px)
```
Stats:  [■]              (1 column)
Skills: [■]              (1 column)
Paths:  [■]              (1 column)
Controls: Stacked vertically
```

---

## ✅ Alignment Checklist

- [x] All interactive elements 48px minimum height
- [x] Consistent border-radius across components
- [x] Unified gap spacing (12px, 16px, 20px, 24px)
- [x] Grid columns align with container edges
- [x] Card padding consistent (24px or 28px)
- [x] Typography scale properly applied
- [x] Hover states smooth and consistent
- [x] Focus indicators visible
- [x] Mobile layout properly stacked
- [x] No misaligned text or icons
- [x] Progress bars full width
- [x] Buttons same height in rows
- [x] Stats perfectly centered
- [x] Icons consistent sizes
- [x] Shadows depth hierarchy maintained

---

**Document Version**: 1.0
**Last Updated**: October 15, 2025
**Status**: Implementation Complete ✨
