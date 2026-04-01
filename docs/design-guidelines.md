# Design Guidelines

**Project**: ToDo App + Vecna Mode
**Version**: 1.1.0
**Last Updated**: 2026-03-10

---

## Design Philosophy

### Core Principles

#### 1. Imersive Dual-Theme Experience
The app provides two distinct, fully-realized visual experiences:
- **Light Mode (Green Theme)**: Calming, productivity-focused, nature-inspired
- **Dark Mode (Vecna Theme)**: Atmospheric, mysterious, inspired by Stranger Things

#### 2. Privacy-First Design
- No account creation required
- No data leaves the device
- Clear communication about local-only storage
- User owns their data completely

#### 3. Delightful Interactions
- Celebratory confetti on task completion
- Themed audio effects
- Smooth transitions and animations
- Satisfying micro-interactions

#### 4. Simplicity Over Complexity
- Minimal learning curve
- Intuitive drag-and-drop
- Clear visual hierarchy
- No unnecessary features

---

## Visual Design System

### Color Palette

#### Light Mode (Green Theme)
```css
/* Primary Colors */
--primary-green: #10b981;      /* Emerald 500 */
--primary-light: #d1fae5;      /* Emerald 100 */
--primary-dark: #065f46;       /* Emerald 700 */

/* Neutral Colors */
--bg-color: #f9fafb;           /* Gray 50 */
--card-bg: #ffffff;            /* White */
--text-primary: #1f2937;       /* Gray 800 */
--text-secondary: #6b7280;     /* Gray 500 */
--border-color: #e5e7eb;       /* Gray 200 */

/* Semantic Colors */
--success: #10b981;            /* Green */
--warning: #f59e0b;            /* Amber */
--error: #ef4444;              /* Red */
```

#### Dark Mode (Vecna Theme)
```css
/* Primary Colors */
--vecna-bg: #0a0a0a;           /* Near black */
--vecna-accent: #7f1d1d;       /* Red 900 */
--vecna-text: #e5e5e5;         /* Gray 200 */
--vecna-muted: #737373;        /* Gray 500 */

/* Particle Effects */
--particle-color: rgba(125, 29, 29, 0.6);

/* Semantic Colors (Themed) */
--success: #ef4444;            /* Red (inverted) */
--warning: #dc2626;            /* Red 600 */
--error: #991b1b;              /* Red 800 */
```

### Typography

#### Font Hierarchy
```css
/* Headings */
.heading-xl {
  font-size: 1.5rem;     /* 24px */
  font-weight: 700;
  line-height: 1.2;
}

.heading-lg {
  font-size: 1.25rem;    /* 20px */
  font-weight: 600;
  line-height: 1.3;
}

.heading-md {
  font-size: 1rem;       /* 16px */
  font-weight: 500;
  line-height: 1.4;
}

/* Body Text */
.body-base {
  font-size: 0.875rem;   /* 14px */
  font-weight: 400;
  line-height: 1.5;
}

.body-sm {
  font-size: 0.75rem;    /* 12px */
  font-weight: 400;
  line-height: 1.4;
}

.body-xs {
  font-size: 0.625rem;   /* 10px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

#### Font Families
```css
/* Primary */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace (for code/IDs) */
font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

---

## Component Design Patterns

### 1. Cards & Containers

#### Main Card
```css
.todo-card {
  background: white;
  border-radius: 1rem;        /* 16px */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 28rem;           /* 448px */
}

.todo-card.dark {
  background: #1a1a1a;
  box-shadow: 0 10px 25px -5px rgba(125, 29, 29, 0.3);
}
```

#### Sections
```css
.section-header {
  padding: 2rem;              /* 32px */
  padding-bottom: 1rem;
  background: linear-gradient(to bottom, #f0fdf4, white);
}

.section-header.dark {
  background: linear-gradient(to bottom, #1a0a0a, #0a0a0a);
}
```

### 2. Buttons

#### Primary Button (Add Todo)
```css
.btn-primary {
  background: #10b981;
  color: white;
  padding: 0.625rem 1rem;     /* 10px 16px */
  border-radius: 0.5rem;      /* 8px */
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  background: #d1fae5;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button (Theme Toggle)
```css
.btn-secondary {
  background: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  padding: 0.375rem 0.75rem;  /* 6px 12px */
  border-radius: 0.5rem;
  font-size: 0.75rem;         /* 12px */
  font-weight: 600;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
```

#### Action Button (Checkbox, Delete)
```css
.btn-action {
  width: 1.5rem;              /* 24px */
  height: 1.5rem;
  border-radius: 0.375rem;    /* 6px */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(0, 0, 0, 0.05);
}

.btn-action.dark:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

### 3. Form Elements

#### Input Field
```css
.input-field {
  width: 100%;
  padding: 0.75rem 1rem;      /* 12px 16px */
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;        /* 14px */
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-field.dark {
  background: #1a1a1a;
  border-color: #374151;
  color: #e5e5e5;
}

.input-field.dark:focus {
  border-color: #7f1d1d;
  box-shadow: 0 0 0 3px rgba(125, 29, 29, 0.2);
}
```

### 4. Progress Bar

```css
.progress-container {
  height: 0.5rem;             /* 8px */
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 9999px;
  transition: width 0.5s ease-out;
}

.progress-fill.dark {
  background: linear-gradient(90deg, #7f1d1d, #dc2626);
}
```

### 5. Todo Items

```css
.todo-item {
  padding: 1rem;              /* 16px */
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s;
  animation: slideIn 0.3s ease-out;
}

.todo-item:hover {
  background: #f9fafb;
}

.todo-item.dark {
  border-bottom: 1px solid #1f2937;
}

.todo-item.dark:hover {
  background: #1a1a1a;
}

/* Checkbox */
.checkbox {
  width: 1.25rem;             /* 20px */
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #10b981;
  border-color: #10b981;
}

.checkbox.dark.checked {
  background: #7f1d1d;
  border-color: #7f1d1d;
}
```

---

## Animation Guidelines

### 1. Entry Animations

#### Slide In (Todo Items)
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.todo-item {
  animation: slideIn 0.3s ease-out;
}
```

#### Staggered Entry
```css
.todo-item:nth-child(1) { animation-delay: 0ms; }
.todo-item:nth-child(2) { animation-delay: 50ms; }
.todo-item:nth-child(3) { animation-delay: 100ms; }
.todo-item:nth-child(n) { animation-delay: calc((n - 1) * 50ms); }
```

### 2. Overlay Animations

#### Sad/Warning Emoji
```css
@keyframes sadZoomFade {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  20% {
    opacity: 1;
    transform: scale(1.2);
  }
  80% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

.animate-sad-zoom-fade {
  animation: sadZoomFade 2s ease-out forwards;
}
```

### 3. Theme Transition

```css
.theme-transition {
  transition: background-color 1s, color 1s, border-color 1s;
}

/* Smooth theme switch */
* {
  transition-property: background-color, color, border-color;
  transition-duration: 1000ms;
  transition-timing-function: ease;
}
```

### 4. Particle Effects

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-40px) translateX(-10px);
  }
  75% {
    transform: translateY(-20px) translateX(20px);
  }
}

.ash-overlay {
  background-image: url('/particles.png');
  animation: float 20s infinite linear;
  pointer-events: none;
}
```

---

## Spacing System

### Scale (Base: 4px)
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
```

### Usage Examples
```css
/* Tight spacing */
.button { padding: var(--spacing-3) var(--spacing-4); }

/* Comfortable spacing */
.card { padding: var(--spacing-6); }

/* Generous spacing */
.section { padding: var(--spacing-8) var(--spacing-6); }
```

---

## Responsive Design

### Breakpoints
```css
/* Mobile First */
--breakpoint-sm: 640px;    /* Small tablets */
--breakpoint-md: 768px;    /* Tablets */
--breakpoint-lg: 1024px;   /* Desktops */
--breakpoint-xl: 1280px;   /* Large desktops */
```

### Container Sizes
```css
.container {
  width: 100%;
  max-width: 28rem;        /* 448px - Main card */
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    padding: 0 2rem;
  }
}
```

### Mobile Optimizations
```css
/* Touch targets minimum 44px */
.button {
  min-height: 2.75rem;     /* 44px */
  min-width: 2.75rem;
}

/* Readable font size on mobile */
@media (max-width: 640px) {
  body {
    font-size: 16px;       /* Prevents zoom on iOS */
  }
}
```

---

## Accessibility Design

### Focus Indicators
```css
:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.dark :focus-visible {
  outline-color: #7f1d1d;
}
```

### Color Contrast
- Light mode text: 4.5:1 minimum (WCAG AA)
- Dark mode text: 7:1 minimum (WCAG AAA)
- Interactive elements: 3:1 minimum

### Screen Reader Support
```html
<!-- ARIA labels -->
<button aria-label="Toggle dark mode">Toggle Theme</button>
<div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
```

---

## Icon & Emoji Usage

### Emoji System
```javascript
// Light Mode
const EMOJI_LIGHT = {
  success: '✅',
  sad: '😢',
  warning: '🚨',
  empty: '📝',
  complete: '🎉'
};

// Dark Mode (Vecna)
const EMOJI_DARK = {
  success: '👹',
  sad: '👹',
  warning: '💀',
  empty: '👹',
  complete: '🔥'
};
```

### Favicon Mapping
```javascript
const FAVICONS = {
  light: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">✅</text></svg>',
  dark: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👹</text></svg>'
};
```

---

## Audio Design

### Sound Effects

#### Thunder Sound (Dark Mode Entry)
- **Trigger**: When user switches to dark mode
- **Duration**: ~2 seconds
- **Volume**: 0.6 (60%)
- **Purpose**: Atmospheric transition effect

#### Evil Roar Sound (All Tasks Complete)
- **Trigger**: When all todos marked complete (dark mode only)
- **Duration**: ~3 seconds
- **Volume**: 0.5 (50%)
- **Purpose**: Celebratory feedback

### Audio Loading Strategy
```javascript
// Lazy load audio files
const thunderSound = new Audio('/thunder.mp3');
const evilRoarSound = new Audio('/evil-roar.mp3');

// Handle autoplay policies
audio.play().catch(e => console.log('Audio play failed', e));
```

---

## Confetti Design

### Light Mode Celebration
```javascript
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#10b981', '#34d399', '#6ee7b7']
});
```

### Dark Mode Celebration (Vecna)
```javascript
confetti({
  particleCount: 150,
  spread: 100,
  origin: { y: 0.6 },
  colors: ['#ef4444', '#7f1d1d', '#000000', '#450a0a'],
  disableForReducedMotion: true
});
```

---

## Empty States

### Design Principles
1. **Clear Messaging**: Explain why it's empty
2. **Visual Interest**: Use emoji/icons
3. **Action Guidance**: Tell user what to do next
4. **Theme Consistent**: Match current theme

### Example
```html
<div class="empty-state">
  <div class="emoji">{{ isDarkMode ? '👹' : '📝' }}</div>
  <p class="title">No hay tareas aún.</p>
  <p class="subtitle">Empieza agregando una arriba.</p>
</div>
```

---

## Loading States

### Skeleton Loading (Future)
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Current Loading Text
```html
<div v-if="loading" class="loading">
  Cargando...
</div>
```

---

## Error States

### Visual Feedback
```css
.error-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

### Validation Messages
```html
<div class="error-message">
  <span class="icon">🚨</span>
  <span class="text">Completa todos los pasos antes.</span>
</div>
```

---

## Design Tokens

### Complete Token Reference
```css
:root {
  /* Colors */
  --color-primary: #10b981;
  --color-primary-dark: #059669;
  --color-secondary: #6b7280;
  --color-bg: #f9fafb;
  --color-card: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typography */
  --font-sans: system-ui, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
}

.dark {
  --color-primary: #7f1d1d;
  --color-primary-dark: #991b1b;
  --color-bg: #0a0a0a;
  --color-card: #1a1a1a;
  --color-text: #e5e5e5;
  --color-border: #1f2937;
}
```

---

## Future Design Enhancements

### Planned Features (Phase 02-04)
1. **Category Badges**: Color-coded category indicators
2. **Priority Flags**: Visual priority markers
3. **Search UI**: Clean search interface
4. **Filter Chips**: Toggle filters with chips
5. **Micro-interactions**: Hover effects, transitions

### Accessibility Improvements
1. **ARIA Labels**: Complete label coverage
2. **Keyboard Shortcuts**: Power user features
3. **Screen Reader**: Enhanced announcements
4. **High Contrast Mode**: Better visibility

---

**Last Updated**: 2026-03-10
**Design System Version**: 1.1.0
**Maintained By**: Development Team
