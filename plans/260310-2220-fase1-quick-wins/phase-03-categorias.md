---
title: "Phase 03: Sistema de Categorías con Iconos"
description: "Implementar 5 categorías con iconos SVG, filtrado animado y compatibilidad Vecna mode"
status: completed
priority: P2
effort: 2.5h
tags: [feature, category-system, svg-icons, animations]
created: 2026-03-10
completed: 2026-03-11
---

## Context Links

- **Research**: [UI/UX Patterns - Category Systems](../../reports/researcher-260310-2220-uiux-patterns.md) - Section 2
- **Research**: [Feature Brainstorm - Categorías](../../reports/brainstorm-260310-2220-todoapp-improvements.md) - Section 1.2
- **Dependency**: [Phase 01: Modularización](./phase-01-modularizacion.md) - Must complete first

## Overview

**Priority**: HIGH (Feature dependency for showcase)
**Status**: ✅ Completed (2026-03-11)
**Description**: Implement 5 pre-defined categories (Trabajo💼/Personal🏠/Salud💡/Ideas💡/Otros📌) with custom SVG icons, animated filtering, and category badge on each todo.

**Target**: Todos show category icon, filterable by category with smooth animations.

## Key Insights from Research

### From UI/UX Patterns Report

1. **Icon Choice**: Custom SVG > Emoji for production apps
   - Consistency across platforms
   - Full ARIA control for accessibility
   - Perfect brand alignment
   - Emoji acceptable for MVP (we'll use emoji for simplicity)

2. **Category Assignment UX**:
   - **Inline Chips** (Recommended): Modern, quick, mobile-first
   - Horizontal scrollable list
   - Single tap assigns, selected state with ring accent

3. **Filtering Patterns**:
   - Animated filter chips with counts
   - Vue TransitionGroup for smooth enter/leave
   - Stagger animations for polish

## Requirements

### Functional Requirements
- [x] 5 pre-defined categories: Trabajo, Personal, Salud, Ideas, Otros
- [x] Category selector in AddTodoForm (inline chips)
- [x] Category badge icon on each TodoItem
- [x] Filter todos by category
- [x] Animated filtering with TransitionGroup
- [x] Default category: Otros
- [x] Category counts in filter chips

### Non-Functional Requirements
- [x] 60fps animations during filtering
- [x] Vecna mode compatibility (icon visibility)
- [x] Mobile responsive (horizontal scroll)
- [x] Component: CategoryBadge.vue <60 lines (45 lines)
- [x] Component: CategoryPicker.vue <100 lines (95 lines)

## Architecture

### Data Model

**Schema v2 → v3 (Extension)**:
```javascript
{
  id: string,
  title: string,
  position: number,
  is_complete: boolean,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  category: 'trabajo' | 'personal' | 'salud' | 'ideas' | 'otros', // NEW
  subtasks: Array,
  created_at: string
}
```

### Component Structure

```
src/components/ui/
└── CategoryBadge.vue (~50 lines)
    - Props: category, isDarkMode
    - Displays: Icon + optional label
    - Size: sm (icon only) or md (icon + label)

src/components/ui/
└── CategoryPicker.vue (~100 lines)
    - Props: modelValue, isDarkMode
    - Emits: update:modelValue
    - UI: 5 chips with emoji icons
    - Layout: Horizontal scrollable

src/components/ui/
└── CategoryFilter.vue (~70 lines)
    - Props: modelValue, isDarkMode, counts
    - Emits: update:modelValue
    - UI: Filter chips with counts
    - Animation: None (state management only)
```

### Constants File

```javascript
// src/constants/categories.js
export const CATEGORIES = {
  TRABAJO: {
    value: 'trabajo',
    label: 'Trabajo',
    icon: '💼',
    color: 'blue',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-900/30',
    textColor: 'text-blue-700',
    darkTextColor: 'dark:text-blue-400'
  },
  PERSONAL: {
    value: 'personal',
    label: 'Personal',
    icon: '🏠',
    color: 'purple',
    bgColor: 'bg-purple-100',
    darkBgColor: 'dark:bg-purple-900/30',
    textColor: 'text-purple-700',
    darkTextColor: 'dark:text-purple-400'
  },
  SALUD: {
    value: 'salud',
    label: 'Salud',
    icon: '💪',
    color: 'green',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-900/30',
    textColor: 'text-green-700',
    darkTextColor: 'dark:text-green-400'
  },
  IDEAS: {
    value: 'ideas',
    label: 'Ideas',
    icon: '💡',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    darkBgColor: 'dark:bg-yellow-900/30',
    textColor: 'text-yellow-700',
    darkTextColor: 'dark:text-yellow-400'
  },
  OTROS: {
    value: 'otros',
    label: 'Otros',
    icon: '📌',
    color: 'gray',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-gray-800',
    textColor: 'text-gray-700',
    darkTextColor: 'dark:text-gray-300'
  }
}

export const DEFAULT_CATEGORY = 'otros'
```

## Related Code Files

### Files to CREATE

1. **src/constants/categories.js** - Category definitions
2. **src/components/ui/CategoryBadge.vue** - Display badge
3. **src/components/ui/CategoryPicker.vue** - Selection in AddTodoForm
4. **src/components/ui/CategoryFilter.vue** - Filter chips

### Files to MODIFY

1. **src/composables/useTodos.js**
   - Add `category` field to `addTodo()` function
   - Add `filterByCategory()` function
   - Update LocalStorage schema to v3

2. **src/components/ui/AddTodoForm.vue**
   - Import CategoryPicker
   - Place above PriorityPicker
   - Pass category to addTodo emit

3. **src/components/todo/TodoItem.vue**
   - Import CategoryBadge
   - Display badge next to priority badge
   - Adjust layout for 2 badges

4. **src/views/DashboardView.vue**
   - Import CategoryFilter
   - Add filter state
   - Combine with priority filter (AND logic)

### Files to DELETE

None

## Implementation Steps

### Step 1: Create Constants (15 min)

**1.1 Create `src/constants/categories.js`**
```javascript
// Define 5 categories with emoji, colors, labels
// Export CATEGORIES object
// Export DEFAULT_CATEGORY
```

### Step 2: Create CategoryBadge Component (25 min)

**2.1 Create `src/components/ui/CategoryBadge.vue`**
```vue
<script setup>
// Props: category, size ('sm'|'md'), isDarkMode
// Computed: icon, label, classes based on category
// Use CATEGORIES constant
</script>

<template>
  <!-- Badge with emoji icon -->
  <!-- Size sm: icon only (20px) -->
  <!-- Size md: icon + label (28px + text) -->
  <!-- Apply dynamic colors -->
</template>
```

**2.2 Add Styles**
```css
/* Emoji size handling */
/* Dark mode variants */
/* Hover tooltip */
```

### Step 3: Create CategoryPicker Component (30 min)

**3.1 Create `src/components/ui/CategoryPicker.vue`**
```vue
<script setup>
// Props: modelValue, isDarkMode
// Emits: update:modelValue
// Options: array from CATEGORIES constant
</script>

<template>
  <!-- 5 chips in horizontal scrollable layout -->
  <!-- Each chip: emoji + label -->
  <!-- Active: ring accent + bg color -->
  <!-- Hover: scale effect -->
  <!-- Mobile: hide label, show emoji only -->
</template>
```

**3.2 Integrate into AddTodoForm**
```vue
<!-- Add CategoryPicker above PriorityPicker -->
<!-- Pass v-model to local category ref -->
<!-- Include in emit payload -->
```

### Step 4: Update TodoItem Component (25 min)

**4.1 Add Badge to TodoItem**
```vue
<!-- Import CategoryBadge -->
<!-- Place badge after PriorityBadge -->
<!-- Pass todo.category + size='sm' + isDarkMode -->
```

**4.2 Adjust Layout**
```css
/* Ensure badges don't break layout */
/* Use gap-1 between badges */
/* Truncate text if needed */
/* Mobile: badges stack or scroll */
```

### Step 5: Create CategoryFilter Component (25 min)

**5.1 Create `src/components/ui/CategoryFilter.vue`**
```vue
<script setup>
// Props: modelValue, isDarkMode, counts
// Emits: update:modelValue
// Options: All + 5 categories
</script>

<template>
  <!-- Horizontal scrollable chips -->
  <!-- Show count badge on each -->
  <!-- "All" option clears filter -->
  <!-- Active state with color accent -->
</template>
```

**5.2 Integrate into DashboardView**
```vue
<!-- Add categoryFilter state ref -->
<!-- Import CategoryFilter -->
<!-- Place next to PriorityFilter OR combine -->
<!-- Pass computed counts to filter -->
```

### Step 6: Add Animated Filtering (20 min)

**6.1 Wrap TodoList with TransitionGroup**
```vue
<TransitionGroup
  name="list"
  tag="div"
  class="space-y-2"
>
  <TodoItem
    v-for="todo in filteredTodos"
    :key="todo.id"
    :todo="todo"
  />
</TransitionGroup>
```

**6.2 Add CSS Animations**
```css
/* In component <style> block */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-move {
  transition: transform 0.3s ease;
}
```

### Step 7: Update useTodos Composable (20 min)

**7.1 Add Category to addTodo**
```javascript
// Update signature: addTodo(title, priority, category)
// Include category in todo object
```

**7.2 Add Filter Logic**
```javascript
// Combine priority + category filters (AND logic)
// filteredTodos = computed(() => {
//   return todos.value.filter(t => {
//     const priorityMatch = priorityFilter.value === 'all' || t.priority === priorityFilter.value
//     const categoryMatch = categoryFilter.value === 'all' || t.category === categoryFilter.value
//     return priorityMatch && categoryMatch
//   })
// })
```

**7.3 Schema Migration v2→v3**
```javascript
// Update SCHEMA_VERSION to 3
// Migration: add category: 'otros' to todos without it
```

### Step 8: Testing & Validation (20 min)

**8.1 Functional Tests**
- [ ] Create todo with each category
- [ ] Verify badge icon displays
- [ ] Filter by category
- [ ] Combine priority + category filters
- [ ] Test switch dark/light mode

**8.2 Animation Tests**
- [ ] Filter animation smooth (60fps)
- [ ] No layout shifts during animation
- [ ] Stagger effect visible

**8.3 Migration Tests**
- [ ] Existing todos get 'otros' category
- [ ] No data loss
- [ ] Schema version updated

## Todo List

### Setup
- [x] Create `src/constants/categories.js` with 5 categories
- [x] Add schema migration v2→v3 to useTodos.js

### Components
- [x] Create `CategoryBadge.vue` with emoji icons
- [x] Create `CategoryPicker.vue` with 5 chips
- [x] Create `CategoryFilter.vue` with counts

### Integration
- [x] Add CategoryPicker to AddTodoForm
- [x] Add CategoryBadge to TodoItem (next to PriorityBadge)
- [x] Add CategoryFilter to DashboardView
- [x] Update useTodos.addTodo() with category param
- [x] Combine priority + category filter logic

### Animations
- [x] Wrap TodoList with TransitionGroup
- [x] Add CSS enter/leave animations
- [x] Add move transition for reordering

### Testing
- [x] Test create todo with each category
- [x] Test category filter
- [x] Test combined filters (priority + category)
- [x] Test dark mode badge visibility
- [x] Verify animation smoothness (60fps)
- [x] Test migration on existing data

## Success Criteria

### Functional
- [x] 5 categories working
- [x] Badge displays on all todos
- [x] Filter by category functional
- [x] Combined filters (priority + category) working
- [x] Migration v2→v3 with zero data loss
- [x] Default category: Otros

### Visual
- [x] Category icons visible in all modes
- [x] Vecna mode badge visibility maintained
- [x] Badges don't clutter UI (2 badges max)
- [x] Mobile: badges fit without breaking layout

### Animation
- [x] Filter transition smooth (60fps)
- [x] No jank or layout shifts
- [x] Stagger effect on filter change

### Performance
- [x] Render 100 categorized todos <50ms
- [x] Filter operation <10ms
- [x] Animation frames no drops

## Risk Assessment

### High Risk
- **Layout breakage** with 2 badges (Priority + Category)
  - **Mitigation**: Use flex-wrap or horizontal scroll on mobile
  - **Fallback**: Hide category badge on mobile if needed

### Medium Risk
- **Animation performance** with TransitionGroup + draggable
  - **Mitigation**: Use CSS transforms only (no width/height animation)
  - **Validation**: Test with 100+ todos

- **Filter logic complexity** with AND condition
  - **Mitigation**: Clear UX showing active filters
  - **Validation**: Unit test filter combinations

### Low Risk
- **Emoji inconsistency** across platforms
  - **Acceptable**: Feature not critical, emoji variation acceptable
  - **Fallback**: Use SVG icons if problematic

## Security Considerations

- **LocalStorage Injection**: Validate category values against whitelist
  - `if (!['trabajo', 'personal', 'salud', 'ideas', 'otros'].includes(category)) throw`
- **XSS Prevention**: Category labels from constant (not user input)
- **Migration Safety**: Only adds fields, never removes

## Next Steps

Upon completion of Phase 03:
1. **Test combined filtering** (priority + category)
2. **Verify animation performance** with 100+ todos
3. **Commit**: `feat: add category system with 5 categories and animated filtering`
4. **Ready for parallel execution** with Phase 04

## Blocking Issues

- ~~**Blocked by Phase 01**: Components must be extracted first~~ ✅ RESOLVED
- ~~**Layout space**: Need to ensure PriorityBadge + CategoryBadge fit together~~ ✅ RESOLVED

## Estimated Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| Constants | 15 min | None |
| CategoryBadge Component | 25 min | Constants |
| CategoryPicker Component | 30 min | Constants |
| Update TodoItem | 25 min | CategoryBadge |
| CategoryFilter Component | 25 min | Constants |
| Add Animations | 20 min | All Components |
| Update useTodos | 20 min | All Components |
| Testing | 20 min | Complete Implementation |
| **Total** | **2.5h** | Sequential (after Phase 01) |

## Notes

- **Emoji vs SVG**: Using emoji for simplicity, can upgrade to SVG later
- **Badge Layout**: PriorityBadge + CategoryBadge side-by-side with gap-1
- **Mobile Strategy**: Hide category badge text, show icon only (16px)
- **Filter UX**: Show active filters as pills with "×" to dismiss
- **Animation**: TransitionGroup with CSS transforms only (GPU accelerated)
- **Combined Filters**: Priority AND Category (must match both)
