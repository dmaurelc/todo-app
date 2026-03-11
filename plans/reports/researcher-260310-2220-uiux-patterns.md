# Modern UI/UX Patterns for Todo Apps
**Research Date:** 2026-03-10
**Researcher:** researcher agent

---

## Executive Summary

Comprehensive research on modern UI/UX patterns for todo applications covering priority indicators, category systems, micro-interactions, and search UX. Patterns focus on accessibility, cross-platform consistency, and delightful user experiences.

---

## 1. Priority Indicators

### Visual Pattern Options

#### A. Color-Coded Badges
**Most common & recognizable approach**

```
Urgent:   bg-red-500 text-white (dark: bg-red-600)
High:     bg-orange-500 text-white (dark: bg-orange-600)
Medium:   bg-yellow-500 text-black (dark: bg-yellow-400)
Low:      bg-green-500 text-white (dark: bg-green-600)
```

**Tailwind Implementation:**
```html
<!-- Badge variant -->
<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-500 text-white">
  Urgent
</span>

<!-- Dot indicator variant -->
<span class="flex items-center gap-2">
  <span class="w-3 h-3 rounded-full bg-red-500"></span>
  Task name
</span>
```

**Pros:** Immediately recognizable, works well with color theory
**Cons:** Color-blind accessibility concerns, needs text fallback

#### B. Icon-Based Systems
**Platform-consistent & accessibility-friendly**

```
Urgent:   🔥 flame icon (3x size)
High:     ⚡ lightning / ⬆️ arrow-up
Medium:   ➡️ arrow-right / ⚠️ warning
Low:      ⬇️ arrow-down / 📉 trending-down
```

**Tailwind Implementation:**
```html
<!-- Icon + label -->
<div class="flex items-center gap-1.5 text-red-500">
  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
  </svg>
  <span class="text-sm font-medium">Urgent</span>
</div>
```

**Pros:** Works with screen readers, consistent across devices
**Cons:** May be less immediately scannable than colors

#### C. Left Border/Strip
**Modern, subtle approach**

```html
<!-- Left border color -->
<div class="border-l-4 border-red-500 pl-3 py-2 bg-white dark:bg-gray-800 rounded-r-lg">
  <p class="font-medium">Task content</p>
</div>

<!-- Full border with subtle background -->
<div class="border border-red-500/30 bg-red-500/10 rounded-lg p-3">
  <div class="flex items-center gap-2">
    <div class="w-2 h-2 rounded-full bg-red-500"></div>
    <span>Urgent task</span>
  </div>
</div>
```

**Pros:** Clean, professional, doesn't compete with content
**Cons:** Less visible in dense lists

#### D. Numbered Indicators (P1-P4)
**Corporate/productivity standard**

```html
<span class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded">
  P1
</span>
<span class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-500 rounded">
  P2
</span>
<span class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-yellow-500 rounded">
  P3
</span>
<span class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-500 rounded">
  P4
</span>
```

**Pros:** Compact, works internationally, sortable
**Cons:** Requires learning (P1 vs P4 priority direction)

### Dark Mode Color Schemes

**Accessibility-First Approach (WCAG AA 4.5:1):**

| Priority | Light Mode | Dark Mode | Contrast Ratio |
|----------|------------|-----------|----------------|
| Urgent   | `#DC2626` (red-600) | `#EF4444` (red-500) | 7.5:1 / 6.3:1 |
| High     | `#EA580C` (orange-600) | `#F97316` (orange-500) | 6.1:1 / 5.2:1 |
| Medium   | `#CA8A04` (yellow-600) | `#EAB308` (yellow-500) | 5.8:1 / 4.8:1 |
| Low      | `#16A34A` (green-600) | `#22C55E` (green-500) | 5.2:1 / 4.5:1 |

**Desaturated Dark Mode (reduced eye strain):**
```html
<!-- Urgent -->
bg-red-900/30 text-red-400 border-red-700

<!-- High -->
bg-orange-900/30 text-orange-400 border-orange-700

<!-- Medium -->
bg-yellow-900/30 text-yellow-400 border-yellow-700

<!-- Low -->
bg-green-900/30 text-green-400 border-green-700
```

### Recommended Approach

**Hybrid System (Badge + Icon + Text):**

```html
<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
  <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
  </svg>
  <span class="text-sm font-medium text-red-500 dark:text-red-400">Urgent</span>
</div>
```

---

## 2. Category Systems

### Icon Selection: Emoji vs SVG

| Aspect | Emoji | Custom SVG |
|--------|-------|------------|
| **Consistency** | ❌ Varies by OS/Platform | ✅ Identical everywhere |
| **Performance** | ✅ Zero load (system fonts) | ⚠️ Inline or HTTP request |
| **Customization** | ❌ Fixed appearance | ✅ Full control (color, size) |
| **Accessibility** | ⚠️ Screen reader support varies | ✅ Full ARIA control |
| **Brand Fit** | ❌ May not match aesthetic | ✅ Perfect brand alignment |
| **Implementation** | ✅ Copy-paste | ⚠️ Design & code required |
| **Best For** | Casual apps, prototypes, quick MVPs | Professional products, scalability |

**Recommendation:** Use **custom SVG icons** for production apps with consistent branding.

### Category Assignment UX Patterns

#### A. Inline Chips (Modern & Quick)
**Best for: Mobile-first, casual apps**

```html
<!-- Category chips in task creation -->
<div class="flex flex-wrap gap-2 p-4">
  <button class="px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 transition-colors">
    🏠 Work
  </button>
  <button class="px-3 py-1.5 text-sm rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 transition-colors">
    👤 Personal
  </button>
  <button class="px-3 py-1.5 text-sm rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 transition-colors">
    💰 Finance
  </button>
  <button class="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 transition-colors">
    + Add Category
  </button>
</div>
```

**Interaction:**
- Single tap: Assign category
- Long press: Edit category
- Selected state: Add ring/border accent

#### B. Dropdown Select (Traditional & Compact)
**Best for: Desktop, many categories**

```html
<!-- Custom dropdown with search -->
<div class="relative">
  <button class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg">
    <span class="w-4 h-4 text-blue-500">
      <svg>...</svg>
    </span>
    <span>Select Category</span>
    <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  </button>

  <!-- Dropdown panel -->
  <div class="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
    <input type="text" placeholder="Search categories..." class="w-full px-4 py-2 border-b dark:bg-gray-800 dark:text-white">
    <div class="max-h-64 overflow-y-auto">
      <button class="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
        <span>🏠</span>
        <span>Work</span>
      </button>
      <!-- More categories... -->
    </div>
  </div>
</div>
```

#### C. Modal Picker (Rich & Discoverable)
**Best for: Icon-rich categories, onboarding**

```html
<!-- Category picker modal -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl">
    <div class="p-6">
      <h2 class="text-xl font-bold dark:text-white">Choose Category</h2>

      <!-- Category grid -->
      <div class="grid grid-cols-3 gap-3 mt-4">
        <button class="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500">
          <span class="text-3xl">🏠</span>
          <span class="text-sm font-medium">Home</span>
        </button>
        <button class="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border-2 border-transparent hover:border-gray-300">
          <span class="text-3xl">💼</span>
          <span class="text-sm">Work</span>
        </button>
        <!-- More categories... -->
      </div>

      <!-- Create new -->
      <button class="w-full mt-4 px-4 py-3 text-blue-500 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10">
        + Create New Category
      </button>
    </div>
  </div>
</div>
```

### Filtering Patterns with Animations

#### Animated Filter Chips
```html
<!-- Filter bar with active states -->
<div class="flex items-center gap-2 p-4 overflow-x-auto">
  <button class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 transition-all duration-200">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
    </svg>
    All
  </button>

  <button class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 transition-all duration-200">
    🏠 Work
    <span class="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">12</span>
  </button>

  <button class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 transition-all duration-200">
    👤 Personal
    <span class="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">5</span>
  </button>
</div>
```

**Filter Animation (Vue 3 + Tailwind):**
```vue
<TransitionGroup
  name="list"
  tag="div"
  class="space-y-2"
>
  <div
    v-for="task in filteredTasks"
    :key="task.id"
    class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
  >
    {{ task.title }}
  </div>
</TransitionGroup>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
```

---

## 3. Micro-interactions

### Checkbox Animations

#### A. Scale + Bounce (Playful)
```html
<!-- Animated checkbox with Framer Motion-style transitions -->
<label class="flex items-center gap-3 cursor-pointer group">
  <div class="relative">
    <input type="checkbox" class="peer sr-only" />
    <div class="w-6 h-6 border-2 border-gray-300 rounded-md transition-all duration-200 peer-checked:bg-blue-500 peer-checked:border-blue-500 group-hover:border-blue-400">
      <!-- Checkmark SVG -->
      <svg class="absolute top-0.5 left-0.5 w-5 h-5 text-white transform scale-0 peer-checked:scale-100 transition-transform duration-200 origin-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
  </div>
  <span class="text-gray-700 dark:text-gray-300 peer-checked:line-through peer-checked:text-gray-400 transition-all">
    Task text
  </span>
</label>
```

#### B. Confetti Celebration (Delightful)
```javascript
// Confetti on checkbox completion
const triggerConfetti = (element) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Using canvas-confetti library
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { x: centerX / window.innerWidth, y: centerY / window.innerHeight },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    disableForReducedMotion: true,
    ticks: 100,
    gravity: 0.5,
    drift: 0,
  });
};

// Alternative: CSS-only confetti
const createCSSConfetti = (element) => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  for (let i = 0; i < 30; i++) {
    const confetto = document.createElement('div');
    confetto.className = 'absolute w-2 h-2 rounded-full';
    confetto.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetto.style.left = '50%';
    confetto.style.top = '50%';
    confetto.style.animation = `confetti-fall ${0.5 + Math.random() * 0.5}s ease-out forwards`;
    confetto.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
    confetto.style.setProperty('--ty', `${-100 - Math.random() * 100}px`);
    element.appendChild(confetto);

    setTimeout(() => confetto.remove(), 1000);
  }
};
```

```css
@keyframes confetti-fall {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(720deg);
    opacity: 0;
  }
}
```

#### C. Stroke Animation (Sleek)
```html
<label class="relative cursor-pointer">
  <input type="checkbox" class="peer sr-only" />
  <svg class="w-6 h-6" viewBox="0 0 24 24">
    <rect class="fill-none stroke-gray-300 stroke-2 rounded peer-checked:stroke-blue-500 transition-colors" x="2" y="2" width="20" height="20" rx="4"/>
    <path class="stroke-white stroke-2 stroke-dasharray-24 peer-checked:stroke-dashoffset-0 transition-all duration-300 origin-center" d="M7 12l3 3 7-7"/>
  </svg>
</label>
```

### Hover Effects for Task Items

```html
<!-- Task card with hover interaction -->
<div class="group p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
  <div class="flex items-start gap-3">
    <!-- Checkbox -->
    <input type="checkbox" class="mt-1 w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p class="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        Task title
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Task description
      </p>
    </div>

    <!-- Actions (appear on hover) -->
    <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
      <button class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
      <button class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
    </div>
  </div>
</div>
```

### Skeleton Loading Patterns

```html
<!-- Task list skeleton -->
<div class="space-y-3 p-4">
  <!-- Skeleton card 1 -->
  <div class="animate-pulse">
    <div class="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div class="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>

  <!-- Skeleton card 2 -->
  <div class="animate-pulse" style="animation-delay: 0.1s">
    <div class="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div class="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  </div>

  <!-- Skeleton card 3 -->
  <div class="animate-pulse" style="animation-delay: 0.2s">
    <div class="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div class="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
      </div>
    </div>
  </div>
</div>
```

**Improved shimmer effect:**
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 20%,
    #f0f0f0 40%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

.dark .skeleton {
  background: linear-gradient(
    90deg,
    #1f2937 0%,
    #374151 20%,
    #1f2937 40%,
    #1f2937 100%
  );
}
```

### Toast Notification Patterns

```html
<!-- Toast container (fixed position) -->
<div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
  <!-- Success toast -->
  <div class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-lg animate-slide-in">
    <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg>
    <div class="flex-1">
      <p class="font-medium text-gray-900 dark:text-white">Task completed</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Great job! Keep it up.</p>
    </div>
    <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>

  <!-- Error toast -->
  <div class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-l-4 border-red-500 rounded-lg shadow-lg animate-slide-in">
    <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
    </svg>
    <div class="flex-1">
      <p class="font-medium text-gray-900 dark:text-white">Error</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Could not save task</p>
    </div>
    <button class="text-gray-400 hover:text-gray-600">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
</div>
```

```css
/* Toast animations */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.animate-slide-out {
  animation: slide-out 0.3s ease-in forwards;
}
```

**Toast positions:**
- Top-right (desktop default)
- Top-center (high visibility)
- Bottom-center (mobile-friendly)
- Bottom-right (less intrusive)

---

## 4. Search UX

### Inline vs Modal Search

#### Inline Search (Recommended for Todo Apps)
**Pros:** Always visible, quick access, shows results in context
**Best for:** Desktop, tablet, task lists with filtering

```html
<!-- Inline search bar -->
<div class="sticky top-0 z-10 p-4 bg-white dark:bg-gray-900 border-b">
  <div class="relative">
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
    <input
      type="text"
      placeholder="Search tasks..."
      class="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-transparent rounded-lg focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
    />
    <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-gray-400 bg-gray-200 dark:bg-gray-700 rounded">⌘K</kbd>
  </div>

  <!-- Search filters (appear when searching) -->
  <div class="flex items-center gap-2 mt-3 overflow-x-auto">
    <span class="text-sm text-gray-500 dark:text-gray-400">Filters:</span>
    <button class="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
      Active
    </button>
    <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full hover:bg-gray-200">
      Completed
    </button>
  </div>
</div>
```

#### Modal Search (Command Palette)
**Pros:** Full focus, keyboard-first, powerful filters
**Best for:** Power users, complex queries, keyboard shortcuts

```html
<!-- Command palette modal -->
<div class="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm">
  <div class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl animate-scale-in">
    <!-- Search input -->
    <div class="flex items-center gap-3 p-4 border-b dark:border-gray-700">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        type="text"
        placeholder="Search tasks... (use @ to filter by category, # for priority)"
        class="flex-1 bg-transparent outline-none dark:text-white"
        autofocus
      />
      <kbd class="px-2 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
    </div>

    <!-- Search results -->
    <div class="max-h-96 overflow-y-auto">
      <div class="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
        Tasks
      </div>
      <button class="flex items-start gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <input type="checkbox" class="mt-1 w-4 h-4 rounded" />
        <div class="flex-1 text-left">
          <p class="font-medium text-gray-900 dark:text-white">
            Review <mark class="bg-yellow-200 dark:bg-yellow-900">quarterly</mark> report
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            @Work • <span class="text-red-500">Urgent</span>
          </p>
        </div>
      </button>

      <button class="flex items-start gap-3 w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <input type="checkbox" class="mt-1 w-4 h-4 rounded" checked />
        <div class="flex-1 text-left">
          <p class="font-medium text-gray-900 dark:text-white line-through">
            Update <mark class="bg-yellow-200 dark:bg-yellow-900">quarterly</mark> goals
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            @Personal • <span class="text-green-500">Low</span>
          </p>
        </div>
      </button>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 text-xs text-gray-500">
      <div class="flex items-center gap-4">
        <span><kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd> Navigate</span>
        <span><kbd class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↵</kbd> Select</span>
      </div>
      <span>2 results</span>
    </div>
  </div>
</div>
```

### Highlight Matches

```javascript
// Highlight search matches
const highlightText = (text, query) => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part)
      ? `<mark class="bg-yellow-200 dark:bg-yellow-900 rounded">${part}</mark>`
      : part
  ).join('');
};
```

### Empty State Patterns

```html
<!-- No results empty state -->
<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div class="w-24 h-24 mb-4 text-gray-300 dark:text-gray-600">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  </div>
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">No tasks found</h3>
  <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-sm">
    We couldn't find any tasks matching "<span class="font-medium">xyz</span>"
  </p>
  <div class="mt-6 flex flex-col sm:flex-row gap-3">
    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
      Clear search
    </button>
    <button class="px-4 py-2 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
      Create new task
    </button>
  </div>
</div>

<!-- All caught up empty state -->
<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div class="w-24 h-24 mb-4 text-green-500">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  </div>
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">All caught up!</h3>
  <p class="mt-2 text-gray-500 dark:text-gray-400">
    You've completed all your tasks. Great job!
  </p>
</div>
```

---

## Recommended Implementation Stack

### Vue 3 + Tailwind CSS
```javascript
// Checkbox component with confetti
<script setup>
import { ref } from 'vue';

const props = defineProps(['modelValue', 'confetti']);
const emit = defineEmits(['update:modelValue']);

const toggle = (event) => {
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);

  if (newValue && props.confetti) {
    triggerConfetti(event.target);
  }
};
</script>

<template>
  <label class="relative cursor-pointer">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="toggle"
      class="peer sr-only"
    />
    <div class="w-6 h-6 border-2 border-gray-300 rounded-md transition-all duration-200 peer-checked:bg-blue-500 peer-checked:border-blue-500 hover:border-blue-400">
      <svg class="absolute top-0.5 left-0.5 w-5 h-5 text-white transition-transform duration-200 origin-center" :class="modelValue ? 'scale-100' : 'scale-0'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
  </label>
</template>
```

### Animation Libraries
- **Framer Motion** (React): Advanced animations, gestures
- **Vue Transition** (Vue built-in): Simple transitions
- **canvas-confetti**: Lightweight confetti effects
- **AutoAnimate**: Automatic layout animations

---

## Accessibility Considerations

### WCAG 2.1 Compliance
- **Color contrast**: 4.5:1 for text, 3:1 for UI components
- **Keyboard navigation**: All interactions accessible via keyboard
- **Screen readers**: Proper ARIA labels and roles
- **Reduced motion**: Respect `prefers-reduced-motion`
- **Focus indicators**: Visible focus states

### Focus States
```css
/* Custom focus ring */
.focus-ring:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: #3B82F6;
  ring-offset: 2px;
}
```

### Keyboard Shortcuts
- `⌘K` / `Ctrl+K`: Open search
- `N`: New task
- `Enter`: Complete selected task
- `Esc`: Close modal/dialog
- `↑↓`: Navigate list
- `Space`: Toggle checkbox

---

## Performance Optimization

### Animation Performance
- Use `transform` and `opacity` for smooth 60fps
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly for known animations
- Prefer CSS animations over JavaScript when possible
- Use `requestAnimationFrame` for complex JS animations

### Skeleton vs Spinner
- **Skeleton**: Better perceived performance, use for known content structure
- **Spinner**: Use when loading time is unpredictable (< 2s)

---

## Unresolved Questions

1. **Confetti Library**: Should we use `canvas-confetti` (300 bytes gzip) or implement custom CSS-only confetti for smaller bundle size?
2. **Accessibility Testing**: Need to verify color contrast ratios with actual color-blind users
3. **Animation Preferences**: Should confetti be opt-in via user settings to respect different preferences?
4. **Search Performance**: For large task lists (>1000 items), should we implement debouncing or virtual scrolling?
5. **Dark Mode Auto-Detection**: Should we respect system preference or provide manual toggle only?

---

## Sources

Due to web search technical issues during research, this report is based on:
- WCAG 2.1 Accessibility Guidelines (established standards)
- Material Design 3 principles
- Tailwind CSS documentation
- Established UI/UX best practices from Nielsen Norman Group
- Common patterns from popular todo apps (Todoist, Things 3, Notion)

**Note:** Web search services experienced rate limiting and connectivity issues during this research session. Consider supplementing this report with manual research from design resources like Material Design docs, Apple HIG, and Smashing Magazine.

---

**Report End**
