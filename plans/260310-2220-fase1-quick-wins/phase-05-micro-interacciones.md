---
title: "Phase 05: Micro-interacciones Premium (YAGNI REVISED)"
description: "Implementar solo 2 animaciones visibles esenciales (checkbox + list enter). Eliminar skeleton y animaciones invisibles."
status: pending
priority: P2
effort: 1.5h
tags: [ux-polish, essential-animations]
created: 2026-03-10
updated: 2026-03-10
---

## Context Links

- **Research**: [UI/UX Patterns - Micro-interactions](../../reports/researcher-260310-2220-uiux-patterns.md) - Section 3
- **Research**: [Feature Brainstorm - Micro-interacciones](../../reports/brainstorm-260310-2220-todoapp-improvements.md) - Section 2.1
- **Dependencies**: [Phases 01-04](./) - All previous phases must complete first
- **Red Team Findings**: [Scope Critic Review](./reports/code-reviewer-260310-2231-scope-complexity-critic.md) - Finding 5, Finding 8

## Overview

**Priority**: HIGH (Polish phase for showcase quality)
**Status**: ⏳ Pending (blocked by Phases 01-04)
**Description**: Apply **ESSENTIAL** UX polish with only the animations users actually notice. No skeleton loader (localStorage is instant), no invisible animations.

**Target**: Every VISIBLE interaction feels responsive and polished.

**Red Team Changes**:
- **Animation sprawl reduced**: 8 → 2 animations (saves 4h)
- **Skeleton loader ELIMINATED** - localStorage loads in <5ms
- **Only visible animations**: Checkbox scale + List enter
- **No TransitionGroup** - Conflicts with draggable
- Effort reduced: 2.5h → 1.5h

## Key Insights from Research

### From UI/UX Patterns Report (RED TEAM FILTERED)

1. **Checkbox Animations**: Scale + bounce effects (KEEP - users notice this)
   - Checkmark scales from 0 to 1 with bounce
   - Satisfaction moment on completion

2. **List Item Enter**: Fade-in animation (KEEP - perceived performance)
   - Staggered fade-in for new items
   - 200ms duration

**ELIMINATED per Red Team** (YAGNI violations):
- Skeleton loading - localStorage is instant, users never see it
- Shimmer, glow, shake - invisible at 60fps on todo list
- Button ripple - overkill for simple app
- Delete shake - unnecessary complexity
- Toast progress bar - vue3-toastify handles this

## Requirements

### Functional Requirements (RED TEAM REVISED - Minimal Viable)
- [ ] **Checkbox scale animation** (with bounce on complete)
- [ ] **List item fade-in** (staggered, 200ms duration)
- [ ] Basic hover effects (already exists, minor polish)
- [ ] Empty state illustration (SVG or emoji)

### ELIMINATED Requirements (Red Team YAGNI cuts)
- [ ] ~~Skeleton loading~~ - Useless for localStorage (<5ms load)
- [ ] ~~Button ripple effects~~ - Over-engineering
- [ ] ~~Delete shake animation~~ - Unnecessary motion
- [ ] ~~Glow effects~~ - Invisible on todo list
- [ ] ~~Toast progress bar~~ - vue3-toastify handles this

### Non-Functional Requirements
- [ ] Both animations at 60fps
- [ ] Respect `prefers-reduced-motion` media query
- [ ] Vecna mode compatibility (dark mode animations)
- [ ] Animation file: `src/assets/animations.css` (<50 lines, was 243)
- [ ] No layout shifts during animations
- [ ] No TransitionGroup (conflicts with draggable)

## Architecture (RED TEAM SIMPLIFIED)

### Animation Structure

**Only 2 Animations** (Users actually notice):

**1. Checkbox Scale + Bounce** (~30 lines CSS)
```css
@keyframes checkbox-scale {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.checkbox-checked {
  animation: checkbox-scale 0.3s ease-out;
}
```

**2. List Item Fade-In** (~20 lines CSS)
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.todo-item-enter {
  animation: fade-in-up 0.2s ease-out;
}
```

**Component Integration**:
- Add `checkbox-checked` class conditionally in TodoItem.vue
- Add `todo-item-enter` class with delay in TodoList.vue
- NO TransitionGroup wrapper (draggable conflicts)

### File Structure (REVISED)

```
src/assets/
└── animations.css (~50 lines, was 243)
    - @keyframes for 2 animations only
    - .animate-* utility classes
    - Dark mode variants
    - Reduced motion queries

src/components/
└── todo/
    └── (components updated with 2 animations)
```

## Related Code Files

### Files to CREATE

1. **src/assets/animations.css** - Only 2 animation keyframes

### Files to MODIFY

1. **src/components/todo/TodoItem.vue**
   - Add checkbox scale animation class
   - Minor hover polish (already exists)

2. **src/components/todo/TodoList.vue**
   - Add fade-in animation class with staggered delay
   - NO TransitionGroup (draggable conflicts)

### Files to DELETE (Red Team cut)

1. **~~src/components/ui/SkeletonLoader.vue~~** - Eliminated (localStorage is instant)

## Implementation Steps

### Step 1: Create Animations CSS (20min)

**1.1 Create `src/assets/animations.css`**
```css
/* Checkbox Scale + Bounce */
@keyframes checkbox-scale {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* List Item Fade-In */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Utility Classes */
.animate-checkbox-scale {
  animation: checkbox-scale 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in-up 0.2s ease-out;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .animate-checkbox-scale,
  .animate-fade-in {
    animation: none;
  }
}
```

**1.2 Import in main.js**
```javascript
import './assets/animations.css'
```

### Step 2: Add Checkbox Animation (30min)

**2.1 Update TodoItem.vue checkbox**
```vue
<template>
  <button
    @click="handleToggleTodo(todo)"
    class="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-200"
    :class="[
      todo.is_complete
        ? 'bg-green-100 border-green-400 text-green-500 animate-checkbox-scale'
        : 'border-gray-200 hover:border-indigo-300 text-transparent'
    ]"
  >
    <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
    </svg>
  </button>
</template>
```

### Step 3: Add List Fade-In Animation (40min)

**3.1 Update TodoList.vue with staggered delay**
```vue
<template>
  <draggable
    v-model="todos"
    item-key="id"
    tag="ul"
    class="divide-y divide-gray-50"
    handle=".drag-handle"
    @change="onDragChange"
    :animation="200"
  >
    <template #item="{ element: todo, index }">
      <li
        :class="['group hover:bg-gray-50/80 transition-colors duration-200', 'animate-fade-in']"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <TodoItem
          :todo="todo"
          :isExpanded="expandedTodos.has(todo.id)"
          :isDarkMode="isDarkMode"
          @toggle="$emit('toggleTodo', todo)"
          @expand="$emit('expandTodo', todo.id)"
          @delete="$emit('removeTodo', todo.id)"
        />
      </li>
    </template>
  </draggable>
</template>
```

### Step 4: Empty State Illustration (20min)

**4.1 Update empty state in DashboardView.vue**
```vue
<template>
  <div
    v-else-if="todos.length === 0"
    class="p-12 text-center flex flex-col items-center justify-center"
  >
    <div class="text-6xl mb-6">
      {{ isDarkMode ? '👹' : '📝' }}
    </div>
    <p class="text-gray-500 text-lg font-medium">
      {{ isDarkMode ? 'El Upside Down espera...' : 'No hay tareas aún.' }}
    </p>
    <p class="text-gray-400 text-sm mt-2">
      Empieza agregando una arriba.
    </p>
  </div>
</template>
```

### Step 5: Import Animations in main.js (10min)

**5.1 Add to src/main.js**
```javascript
import './assets/animations.css'
```

## Todo List

### Phase 05: Micro-interacciones Premium

- [ ] Step 1: Create animations.css (2 keyframes only)
- [ ] Step 2: Add checkbox scale animation to TodoItem
- [ ] Step 3: Add list fade-in animation to TodoList
- [ ] Step 4: Update empty state with illustration
- [ ] Step 5: Import animations in main.js
- [ ] Test: Animations respect prefers-reduced-motion
- [ ] Test: Vecna mode colors work correctly
- [ ] Test: No conflicts with draggable

## Success Criteria

### Functional
- [ ] Checkbox animates with scale + bounce on complete
- [ ] New list items fade in with staggered delay
- [ ] Empty state shows illustration (emoji or SVG)
- [ ] Animations respect `prefers-reduced-motion`

### Performance
- [ ] Both animations run at 60fps
- [ ] No layout shifts during animations
- [ ] Animation file <50 lines (vs 243 planned)

### Code Quality
- [ ] NO TransitionGroup (draggable conflicts avoided)
- [ ] NO SkeletonLoader component (eliminated)
- [ ] CSS well-organized with comments
- [ ] Vecna mode compatible

## Risk Assessment

### Low Risk
- **Animation performance**: Only 2 simple keyframes, minimal CPU impact
- **Browser compatibility**: CSS animations supported everywhere
- **Draggable conflicts**: Avoided by not using TransitionGroup

### Mitigations
- Test animations on mobile (60fps target)
- Test with reduced-motion preference
- Verify draggable still works after adding animations

## Security Considerations

- No user input in animations (XSS not applicable)
- CSS-only animations (no JS injection risk)
- Reduced motion respects accessibility preferences

## Next Steps

Upon completion:
1. All 5 phases complete
2. Run full feature test suite
3. Verify Vecna mode works end-to-end
4. Test all Red Team fixes applied
5. Deploy for showcase/portfolio review
