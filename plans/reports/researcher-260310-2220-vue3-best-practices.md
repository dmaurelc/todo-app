# Vue 3 Best Practices Research Report
**Date**: 2026-03-10
**Researcher**: AI Research Agent
**Project**: ToDo App with Vecna Mode
**Context**: Modulization of large DashboardView.vue (521 lines)

---

## Executive Summary

Current `DashboardView.vue` exceeds 200-line threshold. Research confirms Vue 3 Composition API + composables pattern is optimal for splitting. Key findings: prioritize composables for logic, components for visual reuse, maintain stable props for performance.

**Sources**:
- [Vue 3 Composables Guide](https://vuejs.org/guide/reusability/composables.html)
- [Vue 3 Performance Best Practices](https://vuejs.org/guide/best-practices/performance.html)
- [Vue 3 Component Basics](https://vuejs.org/guide/essentials/component-basics.html)
- [vuedraggable Documentation](https://github.com/SortableJS/vue.draggable.next)

---

## 1. Component Modulization

### 1.1 Composables Pattern (Recommended for Business Logic)

**When to Use**: Extracting stateful logic for reuse across components

**Best Practices from Vue Docs**:

```javascript
// ✅ GOOD: Composable returns refs, destructure-friendly
export function useFeature() {
  const state = ref(null)
  const loading = ref(false)

  return { state, loading } // Plain object of refs
}

// ❌ AVOID: Returning reactive object breaks reactivity on destructure
export function useFeature() {
  return reactive({ state, loading })
}
```

**Naming Convention**: `use{FeatureName}.js` (camelCase starting with "use")

**Applying to Current Codebase**:

Current `DashboardView.vue` has extractable logic:
- `useTodoExpansion` - manage `expandedTodos` Set
- `useEmojiOverlay` - manage sad/warning emoji states
- `useConfettiEffects` - confetti + audio logic
- `useMetaTags` - favicon/title management

**Example Extraction**:

```javascript
// composables/useTodoExpansion.js
import { ref } from 'vue'

export function useTodoExpansion() {
  const expandedTodos = ref(new Set())

  const toggleExpand = (todoId) => {
    if (expandedTodos.value.has(todoId)) {
      expandedTodos.value.delete(todoId)
    } else {
      expandedTodos.value.add(todoId)
    }
  }

  const isExpanded = (todoId) => expandedTodos.value.has(todoId)

  return {
    expandedTodos,
    toggleExpand,
    isExpanded
  }
}
```

**Usage in Component**:
```vue
<script setup>
import { useTodoExpansion } from '@/composables/useTodoExpansion'

const { expandedTodos, toggleExpand } = useTodoExpansion()
</script>
```

### 1.2 Component Splitting (Recommended for Visual Reuse)

**When to Use**: Reusable UI with both logic and visual layout

**Best Practices**:

```vue
<!-- TodoItem.vue - Child component -->
<script setup>
// Define props with types (if using TS)
defineProps({
  todo: Object,
  isExpanded: Boolean
})

// Define emits
defineEmits(['toggle', 'expand', 'delete'])
</script>

<template>
  <li class="todo-item">
    <!-- UI here -->
  </li>
</template>
```

**Props Stability** (Critical for Performance):
```vue
<!-- ❌ BAD: All children re-render when activeId changes -->
<ListItem
  v-for="item in list"
  :id="item.id"
  :active-id="activeId"
/>

<!-- ✅ GOOD: Only affected children re-render -->
<ListItem
  v-for="item in list"
  :id="item.id"
  :active="item.id === activeId"
/>
```

**Communication Patterns**:
1. **Props down, events up** (standard)
2. **Provide/inject** for deep nesting (avoid prop drilling)
3. **Slots** for flexible content distribution

### 1.3 File Structure Recommendations

**Current State**:
```
src/
├── views/
│   └── DashboardView.vue (521 lines - OVER LIMIT)
├── composables/
│   ├── useAuth.js (25 lines)
│   └── useTodos.js (152 lines)
```

**Recommended Structure**:
```
src/
├── views/
│   └── DashboardView.vue (< 200 lines after extraction)
├── components/
│   ├── todo/
│   │   ├── TodoItem.vue (~150 lines)
│   │   ├── TodoSubtaskList.vue (~80 lines)
│   │   └── AddTodoInput.vue (~60 lines)
│   ├── ui/
│   │   ├── ProgressBar.vue (~40 lines)
│   │   └── EmojiOverlay.vue (~50 lines)
├── composables/
│   ├── useAuth.js
│   ├── useTodos.js
│   ├── useTodoExpansion.js (NEW)
│   ├── useEmojiOverlay.js (NEW)
│   ├── useConfettiEffects.js (NEW)
│   └── useMetaTags.js (NEW)
```

---

## 2. Performance Optimization

### 2.1 Debouncing Search Inputs

**Current Implementation**: None (no search feature yet)

**Recommended Pattern**:
```javascript
// composables/useDebounce.js
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

// Usage
const searchTerm = ref('')
const debouncedSearch = useDebounce(searchTerm)

watch(debouncedSearch, (newVal) => {
  // Expensive operation here
  filterTodos(newVal)
})
```

**Alternative**: Use VueUse library (industry standard)
```javascript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn((term) => {
  filterTodos(term)
}, 300)
```

### 2.2 v-memo for List Optimization

**When to Use**: Skip v-for updates when data unchanged

**Current Code Impact**: Large todo lists could benefit

```vue
<template>
  <!-- ✅ v-memo skips re-render if todo data unchanged -->
  <li
    v-for="todo in todos"
    :key="todo.id"
    v-memo="[todo.is_complete, todo.title, expandedTodos.has(todo.id)]"
  >
    <!-- content -->
  </li>
</template>
```

**Trade-off**: v-memo adds dependency tracking overhead. Only use for:
- Large lists (>100 items)
- Complex item rendering
- Frequent unrelated updates

### 2.3 Computed vs Watch Best Practices

**Computed** (Preferred):
- Deriving state from existing data
- Caching expensive calculations
- Template usage

```javascript
// ✅ GOOD: Computed for derived data
const completedCount = computed(() =>
  todos.value.filter(t => t.is_complete).length
)

const progressPercent = computed(() =>
  (completedCount.value / (todos.value.length || 1)) * 100
)
```

**Watch** (Use sparingly):
- Side effects (API calls, localStorage)
- Async operations
- When you need "old value"

```javascript
// ✅ GOOD: Watch for side effects
watch(isDarkMode, (val) => {
  localStorage.setItem('darkMode', val)
  updateMeta()
})
```

**Computed Stability Optimization** (Vue 3.4+):
```javascript
// ✅ GOOD: Returns same reference when unchanged
const computedObj = computed((oldValue) => {
  const newValue = { isEven: count.value % 2 === 0 }
  if (oldValue && oldValue.isEven === newValue.isEven) {
    return oldValue // Reuse previous object
  }
  return newValue
})
```

### 2.4 Virtual Scrolling for Large Lists

**Current Implementation**: Not needed for typical todo lists

**Threshold**: Consider when lists exceed 100-200 items

**Recommended Libraries**:
- `vue-virtual-scroller`
- `vue-virtual-scroll-grid`

---

## 3. LocalStorage Patterns

### 3.1 Schema Design for Categories/Priorities

**Current Schema**:
```javascript
{
  id: string,
  title: string,
  position: number,
  is_complete: boolean,
  subtasks: Array<{id, title, is_complete}>,
  created_at: string
}
```

**Recommended Enhancement**:
```javascript
{
  id: string,
  title: string,
  position: number,
  is_complete: boolean,

  // NEW FIELDS
  priority: 'low' | 'medium' | 'high', // For sorting/filtering
  category: string, // e.g., 'work', 'personal', 'shopping'
  due_date: string | null, // ISO date string
  tags: string[], // Flexible tagging system

  subtasks: Array<{
    id, title, is_complete, position
  }>,

  created_at: string,
  updated_at: string, // Track modifications
  completed_at: string | null
}
```

**Storage Structure**:
```javascript
// Separate collections for cleaner data
localStorage.setItem('todos', JSON.stringify(todos))
localStorage.setItem('categories', JSON.stringify(categories))
localStorage.setItem('app_settings', JSON.stringify(settings))
```

### 3.2 Migration Strategies

**Versioning Pattern**:
```javascript
// composables/useLocalStorage.js
const SCHEMA_VERSION = 2
const VERSION_KEY = 'schema_version'

export function useLocalStorage() {
  const migrate = () => {
    const currentVersion = localStorage.getItem(VERSION_KEY) || 1

    if (currentVersion < 2) {
      // Migration 1->2: Add priority field
      const todos = loadLocalTodos()
      const migrated = todos.map(t => ({
        ...t,
        priority: t.priority || 'medium',
        category: t.category || 'default'
      }))
      saveLocalTodos(migrated)
      localStorage.setItem(VERSION_KEY, 2)
    }
  }

  // Run on init
  onMounted(migrate)

  return { migrate }
}
```

**Rollback Strategy**:
```javascript
// Backup before migration
function backupAndMigrate() {
  const backupKey = `todos_backup_${Date.now()}`
  localStorage.setItem(backupKey, localStorage.getItem('todos'))

  try {
    migrate()
    // Clean old backups after successful migration
    cleanOldBackups()
  } catch (err) {
    // Restore from backup
    localStorage.setItem('todos', localStorage.getItem(backupKey))
    throw err
  }
}
```

### 3.3 Reactivity Wrapper

**Recommended Pattern**:
```javascript
// composables/useStorage.js
import { watchEffect } from 'vue'

export function useStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const value = ref(stored ? JSON.parse(stored) : defaultValue)

  watchEffect(() => {
    localStorage.setItem(key, JSON.stringify(value.value))
  })

  return value
}

// Usage
const todos = useStorage('todos', [])
```

---

## 4. vuedraggable Best Practices

### 4.1 Current Implementation Analysis

**Good practices already in use**:
- ✅ `item-key="id"` for unique identification
- ✅ `handle=".drag-handle"` for explicit drag zones
- ✅ `@change` event handling

**Issues identified**:
- ❌ No transition animation when reordering
- ❌ Nested draggables for subtasks could be improved

### 4.2 Sub-component Integration

**Recommended Pattern**:
```vue
<!-- TodoItem.vue -->
<template>
  <li>
    <div class="todo-header">
      <!-- Todo content -->
    </div>

    <!-- Nested draggable for subtasks -->
    <draggable
      v-model="subtasks"
      item-key="id"
      handle=".subtask-handle"
      group="subtasks"
      :animation="200"
      @change="onSubtaskDrag"
    >
      <template #item="{ element: subtask }">
        <SubtaskItem :subtask="subtask" />
      </template>
    </draggable>
  </li>
</template>
```

**Key Props for Nested Draggables**:
- `group`: Different group names prevent cross-list dragging
- `animation`: Smooth transition (200ms recommended)
- `disabled`: Conditional drag enable/disable
- `delay`: Touch devices drag delay (default: 0)

### 4.3 Performance with Large Lists

```vue
<!-- Use v-memo with draggable for optimization -->
<draggable v-model="todos" item-key="id">
  <template #item="{ element: todo }">
    <TodoItem
      v-memo="[todo.is_complete, todo.title]"
      :todo="todo"
    />
  </template>
</draggable>
```

---

## 5. Tailwind CSS v4 Dynamic Styling

**Note**: Tailwind v4 is unreleased/alpha as of research. Current recommendations based on v3.

### 5.1 Dynamic Class Binding Patterns

**Current Usage**: Inline styles for progress bars
```vue
<div :style="{ width: `${progressPercent}%` }"></div>
```

**Recommended Tailwind Patterns**:

```vue
<script setup>
import { computed } from 'vue'

const progressClasses = computed(() => [
  'h-full transition-all duration-500 ease-out',
  isDarkMode.value
    ? 'bg-red-500' // Vecna mode
    : 'bg-green-400' // Normal mode
])
</script>

<template>
  <div :class="progressClasses" :style="{ width: `${progress}%` }"></div>
</template>
```

### 5.2 CSS Custom Properties for Theme Switching

```css
/* tailwind.config.js or styles.css */
:root {
  --bg-primary: theme('colors.gray.100');
  --text-primary: theme('colors.gray.800');
}

.vecna-theme {
  --bg-primary: theme('colors.gray.900');
  --text-primary: theme('colors.gray.100');
}
```

```vue
<!-- Dynamic theme class -->
<template>
  <div :class="isDarkMode ? 'vecna-theme' : 'normal-theme'">
    <!-- Content using CSS vars -->
  </div>
</template>
```

### 5.3 Computed Classes for Complex Logic

```javascript
// composables/useTodoClasses.js
export function useTodoClasses(todo, isDarkMode) {
  const containerClasses = computed(() => [
    'group hover:bg-gray-50/80 transition-colors duration-200',
    {
      'bg-red-50/20': isDarkMode.value && todo.is_complete,
      'bg-green-50': !isDarkMode.value && todo.is_complete
    }
  ])

  const textClasses = computed(() => [
    'font-medium transition-all duration-200 truncate',
    {
      'text-gray-400 line-through': todo.is_complete,
      'text-gray-700': !todo.is_complete,
      'text-red-400': isDarkMode.value && todo.is_complete
    }
  ])

  return { containerClasses, textClasses }
}
```

---

## 6. Actionable Recommendations

### 6.1 Immediate Actions (Priority: HIGH)

1. **Extract Emoji Overlay Logic**
   - Create `useEmojiOverlay.js` composable
   - Extract emoji overlay into `EmojiOverlay.vue` component
   - **Impact**: Remove ~50 lines from DashboardView

2. **Extract Todo Item Rendering**
   - Create `TodoItem.vue` component
   - Move todo rendering logic (lines 320-504)
   - **Impact**: Remove ~180 lines from DashboardView

3. **Extract Progress Bar**
   - Create `ProgressBar.vue` component
   - Reusable for subtask progress too
   - **Impact**: Remove ~30 lines from DashboardView

### 6.2 Medium-term Actions (Priority: MEDIUM)

4. **Add Search with Debounce**
   - Implement `useDebounce.js` composable
   - Add search input with `@vueuse/core` or custom debounce
   - Use v-memo on todo list items

5. **Add Task Categories**
   - Enhance localStorage schema with `category` field
   - Implement migration function (v1 -> v2)
   - Add category filter UI

6. **Optimize vuedraggable**
   - Add `transition-group` animations
   - Implement v-memo for todo items
   - Add animation to reorder operations

### 6.3 Long-term Actions (Priority: LOW)

7. **Consider Virtual Scrolling**
   - Only if lists exceed 200 items
   - Use `vue-virtual-scroller`
   - Benchmark before/after

8. **Migrate to Tailwind v4**
   - Wait for stable release
   - Update build configuration
   - Test dynamic styling patterns

---

## 7. Code Snippets Reference

### 7.1 Composable Template

```javascript
// composables/useFeatureName.js
import { ref, computed, watch, onMounted } from 'vue'

export function useFeatureName(initialValue = null) {
  // State
  const state = ref(initialValue)
  const loading = ref(false)

  // Computed
  const derived = computed(() => /* ... */)

  // Methods
  const action = async () => {
    loading.value = true
    try {
      // ...
    } finally {
      loading.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    // Init logic
  })

  // Watchers (for side effects only)
  watch(state, (newVal) => {
    localStorage.setItem('key', JSON.stringify(newVal))
  })

  return {
    state,
    loading,
    derived,
    action
  }
}
```

### 7.2 Component Template

```vue
<!-- components/feature/FeatureItem.vue -->
<script setup>
// Props
defineProps({
  item: {
    type: Object,
    required: true
  },
  isActive: Boolean
})

// Emits
const emit = defineEmits(['toggle', 'delete'])

// Composables
const { classes } = useFeatureClasses(props.item)
</script>

<template>
  <li :class="classes.container">
    <!-- Content -->
    <button @click="emit('toggle', item.id)">
      {{ item.title }}
    </button>
  </li>
</template>
```

---

## 8. Unresolved Questions

1. **Tailwind v4 Specifics**: v4 is unreleased/alpha. Should research wait for stable release or use v3 patterns now?

2. **Virtual Scrolling Threshold**: What is the actual max todo count in production? If <100, virtualization not worth it.

3. **Subtask Dragging UX**: Should subtasks be reorderable within todos? Current implementation doesn't support this.

4. **Persistence Strategy**: LocalStorage has 5-10MB limit. Should implement IndexedDB for larger datasets?

5. **Testing Setup**: What testing framework is preferred? Vitest? Cypress? Should be decided before refactoring.

---

## 9. Conclusion

DashboardView.vue modulization is well-documented in Vue 3 ecosystem. Recommended approach:

1. **Extract composables** for business logic (expansion, emoji, confetti, meta)
2. **Create components** for visual reuse (TodoItem, ProgressBar, EmojiOverlay)
3. **Apply performance optimizations** (v-memo, computed, stable props)
4. **Enhance localStorage** with schema versioning and migrations
5. **Follow Vue 3 conventions** (camelCase composables, PascalCase components)

Estimated impact after refactoring:
- DashboardView.vue: 521 → ~150 lines (71% reduction)
- Better testability (isolated composables/components)
- Improved reusability (components can be used elsewhere)
- Enhanced maintainability (clear separation of concerns)

**Sources**:
- [Vue 3 Composables](https://vuejs.org/guide/reusability/composables.html)
- [Vue 3 Performance](https://vuejs.org/guide/best-practices/performance.html)
- [Vue 3 Components](https://vuejs.org/guide/essentials/component-basics.html)
- [vuedraggable GitHub](https://github.com/SortableJS/vue.draggable.next)
