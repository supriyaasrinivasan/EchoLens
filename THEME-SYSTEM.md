# SupriAI Theme System Guide

## Overview
SupriAI now features a comprehensive dual-theme system with **Dark Mode** (default) and **Light Mode**, providing a seamless and consistent user experience across all components.

## Features

### 🎨 Theme Modes
- **Dark Mode** - Default, optimized for low-light environments
- **Light Mode** - Clean, bright interface for well-lit spaces
- Smooth transitions between themes
- Persistent theme selection (saved in Chrome storage)
- System-wide consistency across Dashboard and Popup

### 🎯 Key Improvements

#### 1. **CSS Variables System**
All colors, shadows, and visual properties now use CSS custom properties defined in `src/dashboard/theme.css`:
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary` - Background colors
- `--text-primary`, `--text-secondary`, `--text-tertiary` - Text colors
- `--brand-primary`, `--brand-secondary` - Brand colors
- `--border-primary`, `--border-hover`, `--border-focus` - Border colors
- `--shadow-sm`, `--shadow-md`, `--shadow-lg` - Shadow variations
- And many more...

#### 2. **Theme Toggle**
- **Dashboard**: Theme toggle button in the top-right header
- **Popup**: Compact theme toggle icon in the header
- Instant theme switching with smooth transitions
- Theme preference synced across all extension pages

#### 3. **Proper UI Alignment**
All components have been updated with:
- Consistent spacing (padding, margins)
- Improved grid layouts
- Better responsive behavior
- Uniform border-radius and shadows
- Proper color contrast ratios

#### 4. **Components Updated**
✅ Dashboard main layout
✅ Sidebar navigation
✅ Memory cards
✅ Timeline items
✅ Knowledge map
✅ PersonaSync dashboard
✅ Popup interface
✅ Search bars and filters
✅ All form elements

## Usage

### For Users
1. **Switch Themes**: Click the sun/moon icon in the header
   - Dashboard: Top-right corner
   - Popup: Next to the title
2. Your theme preference is automatically saved
3. All extension pages will use your selected theme

### For Developers

#### Adding Theme-Aware Styles
Use CSS variables instead of hardcoded colors:

```css
/* ❌ Don't do this */
.my-component {
  background: #0a0e27;
  color: #f1f5f9;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

/* ✅ Do this */
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

#### Creating New Components
1. Use theme variables from `theme.css`
2. Test in both light and dark modes
3. Ensure proper contrast ratios (WCAG AA minimum)
4. Add smooth transitions for theme changes

#### Available CSS Variables

**Backgrounds:**
- `--bg-primary` - Main background
- `--bg-secondary` - Secondary backgrounds
- `--bg-tertiary` - Tertiary/subtle backgrounds
- `--bg-card` - Card backgrounds
- `--bg-card-hover` - Card hover states

**Text:**
- `--text-primary` - Main text
- `--text-secondary` - Secondary text
- `--text-tertiary` - Tertiary text
- `--text-muted` - Muted/disabled text
- `--text-inverse` - Inverse text (e.g., white on dark button)

**Brand:**
- `--brand-primary` - Primary brand color (#6366f1)
- `--brand-secondary` - Secondary brand color (#3b82f6)
- `--brand-gradient` - Brand gradient

**Accents:**
- `--accent-purple`, `--accent-blue`, `--accent-cyan`
- `--accent-green`, `--accent-yellow`, `--accent-red`

**Borders:**
- `--border-primary` - Standard borders
- `--border-secondary` - Subtle borders
- `--border-hover` - Hover state borders
- `--border-focus` - Focus state borders

**Shadows:**
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`

**Components:**
- `--sidebar-bg`, `--card-bg`, `--card-border`
- `--input-bg`, `--input-border`
- `--button-bg`, `--button-hover`
- `--scrollbar-track`, `--scrollbar-thumb`

## Accessibility

### Features Implemented
- ✅ Proper color contrast ratios (WCAG AA)
- ✅ Focus states with visible outlines
- ✅ High contrast mode support
- ✅ Reduced motion support
- ✅ Keyboard navigation friendly
- ✅ Screen reader compatible

### Preferences Respected
```css
/* High contrast mode */
@media (prefers-contrast: high) { ... }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) { ... }

/* Color scheme preference */
@media (prefers-color-scheme: dark) { ... }
@media (prefers-color-scheme: light) { ... }
```

## File Structure

```
src/
├── dashboard/
│   ├── theme.css              # ✨ Theme CSS variables
│   ├── dashboard.css          # Updated with theme vars
│   ├── personasync.css        # Updated with theme vars
│   └── Dashboard.jsx          # Theme toggle logic
├── popup/
│   ├── popup.css              # Updated with theme vars
│   └── Popup.jsx              # Theme toggle logic
```

## Technical Details

### Theme Storage
Themes are stored in Chrome's sync storage:
```javascript
chrome.storage.sync.set({ theme: 'light' | 'dark' });
chrome.storage.sync.get(['theme'], (result) => { ... });
```

### DOM Attribute
The theme is applied via data attribute:
```html
<html data-theme="light">
<html data-theme="dark">
```

### Transitions
Smooth transitions are defined globally:
```css
* {
  transition: background-color 0.3s ease,
              border-color 0.3s ease,
              color 0.3s ease,
              box-shadow 0.3s ease;
}
```

## Best Practices

### When Creating New Styles
1. ✅ Always use CSS variables for colors
2. ✅ Test in both themes before committing
3. ✅ Use semantic variable names (e.g., `--text-primary` not `--gray-100`)
4. ✅ Maintain consistent spacing (use `rem` or theme variables)
5. ✅ Ensure sufficient contrast ratios
6. ✅ Add hover/focus states for interactive elements

### When Adding New Features
1. Add theme variables if needed
2. Update both theme definitions in `theme.css`
3. Test theme toggle functionality
4. Verify accessibility
5. Document any new patterns

## Troubleshooting

### Theme Not Persisting
- Check Chrome storage permissions in manifest.json
- Verify `chrome.storage.sync` is available
- Clear extension storage and test again

### Colors Not Updating
- Ensure `data-theme` attribute is set on `<html>`
- Check CSS variable names for typos
- Verify CSS import order (theme.css should be first)

### Transitions Too Slow/Fast
- Adjust transition duration in `theme.css`
- Or disable specific transitions with `!important`

## Future Enhancements

Potential improvements:
- [ ] Auto-theme based on system preferences
- [ ] Custom accent color selection
- [ ] More theme variants (blue, purple, etc.)
- [ ] Theme scheduling (dark at night, light during day)
- [ ] Higher contrast mode option

## Contributing

When contributing theme-related changes:
1. Test thoroughly in both modes
2. Ensure accessibility standards
3. Update this documentation
4. Add screenshots if visual changes are significant

---

**Built with ❤️ for mindful browsing**
