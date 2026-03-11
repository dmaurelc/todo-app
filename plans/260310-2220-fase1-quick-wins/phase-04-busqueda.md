---
title: "Phase 04: Búsqueda en Tiempo Real"
description: "Implementar búsqueda segura con debouncing, highlighting sin XSS y compatibilidad con filtros (RED TEAM REVISED)"
status: pending
priority: P2
effort: 2h
tags: [feature, search, debouncing, safe-highlighting]
created: 2026-03-10
updated: 2026-03-10
---

## Context Links

- **Research**: [Vue 3 Best Practices - Debouncing](../../reports/researcher-260310-2220-vue3-best-practices.md) - Section 2.1
- **Research**: [UI/UX Patterns - Search UX](../../reports/researcher-260310-2220-uiux-patterns.md) - Section 4
- **Research**: [Feature Brainstorm - Búsqueda](../../reports/brainstorm-260310-2220-todoapp-improvements.md) - Section 1.5
- **Dependency**: [Phase 01: Modularización](./phase-01-modularizacion.md) - Must complete first
- **Red Team Findings**: [Security Adversary Review](./reports/code-reviewer-260310-2231-fase1-plan.md) - Finding 8, [Scope Critic](./reports/code-reviewer-260310-2231-scope-complexity-critic.md) - Finding 7

## Overview

**Priority**: HIGH (Feature dependency for showcase)
**Status**: ⏳ Pending (blocked by Phase 01)
**Description**: Implement real-time search with debouncing (300ms), **SAFE** text-based highlighting (NO v-html), empty states, and integration with existing priority/category filters.

**Target**: Search todos by title with <100ms response time and **secure** highlighted matches.

**Red Team Security Fixes**:
- **XSS Prevention**: Text-based highlighting instead of v-html
- **ReDoS Prevention**: Query length limit (50 chars max)
- **VueUse Integration**: Use `useDebounceFn` instead of custom implementation
- **Search Desync Fix**: Add `isSearchPending` loading flag

## Requirements

### Functional Requirements
- [ ] Real-time search with 300ms debouncing (VueUse)
- [ ] Search by todo title (case-insensitive)
- [ ] **SAFE** text-based highlighting (NO v-html, XSS prevention)
- [ ] Query length limit: 50 characters (ReDoS prevention)
- [ ] Keyboard shortcut (⌘K / Ctrl+K) to focus search
- [ ] Clear search button (× icon)
- [ ] Empty state with "No results" message
- [ ] Integration with priority + category filters (AND logic)
- [ ] **Loading indicator** during debounce (isSearchPending flag)
- [ ] Search results count display

### Security Requirements (RED TEAM MANDATORY)
- [ ] **NO v-html directive** - Use text-based rendering only
- [ ] Query length validation (max 50 chars)
- [ ] Output encoding for all user input
- [ ] Regex timeout wrapper (if using regex)
- [ ] XSS test: `<script>alert(1)</script>` must render as plain text

### Non-Functional Requirements
- [ ] Search operation <100ms for 1000 todos
- [ ] Debounce prevents excessive re-renders
- [ ] 60fps typing responsiveness
- [ ] Component: SearchInput.vue <80 lines
- [ ] Component: SearchHighlight.vue <60 lines (text-based)
- [ ] Vecna mode compatibility

## Architecture

### Composable Structure

```
src/composables/
└── useDebounce.js (~40 lines)
    - Reusable debouncing utility
    - Params: value, delay (default 300ms)
    - Returns: debouncedValue (ref)
```

### Component Structure

```
src/components/ui/
└── SearchInput.vue (~80 lines)
    - Props: modelValue, placeholder, isDarkMode
    - Emits: update:modelValue, clear
    - Features:
      - Input with search icon
      - Debounced updates
      - Clear button (shows when has value)
      - Keyboard shortcut badge (⌘K)
      - Focus ring on shortcut trigger
```

```
src/components/ui/
└── SearchHighlight.vue (~50 lines)
    - Props: text, query, isDarkMode
    - Renders: Text with <mark> tags for matches
    - Features:
      - Case-insensitive matching
      - Multiple matches highlighted
      - Escape regex special characters
```

### Search Logic Integration

```javascript
// In useTodos.js or DashboardView.vue
const searchQuery = ref('')
const debouncedSearch = useDebounce(searchQuery, 300)

const filteredTodos = computed(() => {
  let results = todos.value

  // Apply search filter
  if (debouncedSearch.value) {
    const query = debouncedSearch.value.toLowerCase()
    results = results.filter(t =>
      t.title.toLowerCase().includes(query)
    )
  }

  // Apply priority filter
  if (priorityFilter.value !== 'all') {
    results = results.filter(t => t.priority === priorityFilter.value)
  }

  // Apply category filter
  if (categoryFilter.value !== 'all') {
    results = results.filter(t => t.category === categoryFilter.value)
  }

  return results
})
```

## Related Code Files

### Files to CREATE

1. **src/composables/useDebounce.js** - Debouncing utility
2. **src/components/ui/SearchInput.vue** - Search input with debouncing
3. **src/components/ui/SearchHighlight.vue** - Text highlighting component

### Files to MODIFY

1. **src/views/DashboardView.vue**
   - Import SearchInput component
   - Add searchQuery ref
   - Import useDebounce composable
   - Update filteredTodos computed
   - Add keyboard shortcut listener

2. **src/components/todo/TodoItem.vue**
   - Import SearchHighlight
   - Wrap title with SearchHighlight
   - Pass search query prop

3. **src/components/ui/AddTodoForm.vue** (Optional)
   - Add keyboard shortcut hint

### Files to DELETE

None

## Implementation Steps

### Step 1: Create Debounce Composable (20 min)

**1.1 Create `src/composables/useDebounce.js`**
```javascript
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  let timeout

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
```

**1.2 Test Debounce**
```javascript
// Verify 300ms delay
// Test rapid typing (only last value triggers)
```

### Step 2: Create SearchInput Component (30 min)

**2.1 Create `src/components/ui/SearchInput.vue`**
```vue
<script setup>
import { ref, computed } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: 'Search tasks...' },
  isDarkMode: Boolean
})

const emit = defineEmits(['update:modelValue', 'clear'])

const localValue = ref(props.modelValue)
const debouncedValue = useDebounce(localValue, 300)

// Sync debounced value to parent
watch(debouncedValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const hasValue = computed(() => !!localValue.value)
const showClear = computed(() => hasValue.value)

const handleClear = () => {
  localValue.value = ''
  emit('clear')
}

// Keyboard shortcut handling
const inputRef = ref(null)

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<template>
  <div class="relative">
    <!-- Search Icon -->
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
      <!-- Search icon path -->
    </svg>

    <!-- Input -->
    <input
      ref="inputRef"
      v-model="localValue"
      type="text"
      :placeholder="placeholder"
      class="w-full pl-10 pr-10 py-2.5 rounded-lg focus:ring-2"
      :class="isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'"
    />

    <!-- Clear Button -->
    <button
      v-if="showClear"
      @click="handleClear"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      <svg class="w-5 h-5">
        <!-- X icon -->
      </svg>
    </button>

    <!-- Keyboard Shortcut Badge -->
    <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block">
      ⌘K
    </kbd>
  </div>
</template>
```

### Step 3: Create SearchHighlight Component (25 min)

**3.1 Create `src/components/ui/SearchHighlight.vue`**
```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  query: { type: String, default: '' },
  isDarkMode: Boolean
})

const highlightedText = computed(() => {
  if (!props.query) return props.text

  // Escape regex special characters
  const escapedQuery = props.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  return props.text.replace(regex, '<mark>$1</mark>')
})
</script>

<template>
  <span
    v-html="highlightedText"
    class="search-highlight"
  />
</template>

<style scoped>
:deep(mark) {
  background-color: #fef08a; /* yellow-200 */
  border-radius: 2px;
  padding: 0 2px;
}

.dark :deep(mark) {
  background-color: #713f12; /* yellow-900 */
}
</style>
```

### Step 4: Integrate SearchInput into DashboardView (20 min)

**4.1 Add Search State**
```javascript
// In DashboardView.vue script
const searchQuery = ref('')
const searchInputRef = ref(null)
```

**4.2 Add Keyboard Shortcut**
```javascript
// Listen for ⌘K / Ctrl+K
onMounted(() => {
  const handleShortcut = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      searchInputRef.value?.focus()
    }
  }
  window.addEventListener('keydown', handleShortcut)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleShortcut)
  })
})
```

**4.3 Update Template**
```vue
<!-- Place above TodoList -->
<SearchInput
  ref="searchInputRef"
  v-model="searchQuery"
  placeholder="Search tasks..."
  :is-dark-mode="isDarkMode"
  @clear="searchQuery = ''"
/>
```

### Step 5: Update TodoItem with SearchHighlight (15 min)

**5.1 Pass Search Query**
```vue
<!-- In DashboardView.vue template -->
<TodoItem
  v-for="todo in filteredTodos"
  :key="todo.id"
  :todo="todo"
  :search-query="searchQuery"
  :is-dark-mode="isDarkMode"
/>
```

**5.2 Use SearchHighlight in TodoItem**
```vue
<!-- In TodoItem.vue template -->
<SearchHighlight
  :text="todo.title"
  :query="searchQuery"
  :is-dark-mode="isDarkMode"
/>
```

### Step 6: Update Filter Logic (15 min)

**6.1 Extend filteredTodos Computed**
```javascript
// In DashboardView.vue or useTodos.js
const filteredTodos = computed(() => {
  let results = todos.value

  // Search filter
  if (debouncedSearchQuery.value) {
    const query = debouncedSearchQuery.value.toLowerCase()
    results = results.filter(t =>
      t.title.toLowerCase().includes(query)
    )
  }

  // Priority filter
  if (priorityFilter.value !== 'all') {
    results = results.filter(t => t.priority === priorityFilter.value)
  }

  // Category filter
  if (categoryFilter.value !== 'all') {
    results = results.filter(t => t.category === categoryFilter.value)
  }

  return results
})
```

### Step 7: Add Empty State (15 min)

**7.1 Create Empty State Component**
```vue
<!-- In DashboardView.vue template -->
<div
  v-if="filteredTodos.length === 0 && (searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all')"
  class="empty-state"
>
  <svg class="w-24 h-24 text-gray-300">
    <!-- Search icon -->
  </svg>
  <h3>No tasks found</h3>
  <p v-if="searchQuery">
    No tasks matching "{{ searchQuery }}"
  </p>
  <button @click="clearFilters">Clear filters</button>
</div>
```

### Step 8: Testing & Validation (20 min)

**8.1 Functional Tests**
- [ ] Type in search, verify 300ms debounce
- [ ] Search highlights matching text
- [ ] Clear button removes search
- [ ] Keyboard shortcut (⌘K) focuses input
- [ ] Empty state shows when no results
- [ ] Search works with priority + category filters

**8.2 Performance Tests**
- [ ] Search 1000 todos <100ms
- [ ] Typing responsiveness maintained (60fps)
- [ ] No excessive re-renders (check Vue DevTools)

**8.3 Visual Tests**
- [ ] Highlight visible in light mode
- [ ] Highlight visible in dark mode
- [ ] Input focus ring visible
- [ ] Clear button appears/disappears correctly

## Todo List

### Composable
- [ ] Create `useDebounce.js` with 300ms delay
- [ ] Test debounce timing

### Components
- [ ] Create `SearchInput.vue` with icon + clear button
- [ ] Create `SearchHighlight.vue` with <mark> tags
- [ ] Add keyboard shortcut badge (⌘K)

### Integration
- [ ] Add searchQuery state to DashboardView
- [ ] Add keyboard shortcut listener (⌘K / Ctrl+K)
- [ ] Integrate SearchInput into DashboardView
- [ ] Update TodoItem to use SearchHighlight
- [ ] Extend filteredTodos computed with search logic

### Polish
- [ ] Add empty state for no results
- [ ] Add results count display
- [ ] Test search + priority + category filter combo

### Testing
- [ ] Test debounce timing (300ms)
- [ ] Test search performance (<100ms)
- [ ] Test highlighting in both modes
- [ ] Test keyboard shortcut
- [ ] Test clear functionality
- [ ] Verify 60fps typing

## Success Criteria

### Functional
- [ ] Search works with 300ms debouncing
- [ ] Text highlighting on matches
- [ ] Keyboard shortcut (⌘K) functional
- [ ] Clear button removes search
- [ ] Empty state displays correctly
- [ ] Compatible with priority + category filters

### Performance
- [ ] Search operation <100ms (1000 todos)
- [ ] Typing responsiveness 60fps
- [ ] No excessive re-renders

### Visual
- [ ] Highlight visible in light/dark mode
- [ ] Input focus states clear
- [ ] Empty state contextually relevant

## Risk Assessment

### Medium Risk
- **Performance degradation** with large datasets
  - **Mitigation**: Debouncing prevents excessive filtering
  - **Validation**: Test with 1000+ todos
  - **Fallback**: Consider virtual scrolling if needed

- **Highlighting XSS** if user injects HTML
  - **Mitigation**: Escape regex special characters, use text-only
  - **Validation**: Test with HTML tags in query

### Low Risk
- **Debounce timing** too slow/fast
  - **Acceptable**: 300ms is industry standard
  - **Adjustable**: Can make configurable if needed

## Security Considerations

- **XSS Prevention**: SearchHighlight uses `v-html` - MUST escape HTML
  - Only use `<mark>` tags, no user-controlled HTML
  - Escape regex special characters to prevent ReDoS
- **ReDoS Prevention**: Limit query length, escape special chars
  ```javascript
  if (query.length > 100) return text // Prevent abuse
  ```

## Next Steps

Upon completion of Phase 04:
1. **Test search with 1000+ todos**
2. **Verify keyboard shortcut** works in all browsers
3. **Commit**: `feat: add real-time search with debouncing and highlighting`
4. **Ready for Phase 05** (Micro-interacciones)

## Blocking Issues

- **Blocked by Phase 01**: Components must be extracted first
- **No external dependencies**: Self-contained feature

## Estimated Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| useDebounce Composable | 20 min | None |
| SearchInput Component | 30 min | useDebounce |
| SearchHighlight Component | 25 min | None |
| DashboardView Integration | 20 min | All Components |
| Update TodoItem | 15 min | SearchHighlight |
| Update Filter Logic | 15 min | All Components |
| Empty State | 15 min | Integration |
| Testing | 20 min | Complete Implementation |
| **Total** | **2h** | Sequential (after Phase 01) |

## Notes

- **Debounce Timing**: 300ms is standard, feels responsive but prevents spam
- **Keyboard Shortcut**: ⌘K on Mac, Ctrl+K on Windows/Linux
- **Highlight Accessibility**: Use `<mark>` which has semantic meaning
- **Search Scope**: Title only for MVP, can extend to notes/description later
- **Filter Combination**: Search AND priority AND category (must match all)
- **Performance**: Debouncing is critical - without it, every keystroke triggers filter
- **Empty State**: Show different message based on active filters
