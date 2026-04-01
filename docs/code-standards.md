# Code Standards & Development Guidelines

**Project**: ToDo App + Vecna Mode
**Version**: 1.1.0
**Last Updated**: 2026-03-10

---

## Core Principles

### YAGNI (You Aren't Gonna Need It)
- Don't implement features for hypothetical future use cases
- Extract reusable logic only when genuinely reused (2+ times)
- Remove unused code immediately (e.g., `watchDarkMode` in `useMetaTags.js`)

### KISS (Keep It Simple, Stupid)
- Components should have single, clear responsibilities
- Prefer straightforward solutions over clever abstractions
- Clear code > clever code

### DRY (Don't Repeat Yourself)
- Extract duplicated logic to composables
- Use shared constants for repeated values
- Component composition > copy-paste

---

## File Structure

### Directory Layout
```
src/
├── assets/              # Static assets (images, audio, fonts)
├── components/          # Vue components
│   ├── todo/           # Todo-specific components
│   └── ui/             # Reusable UI components
├── composables/        # Composition API logic
├── router/             # Vue Router configuration
└── views/              # Page-level components
```

### File Naming Conventions

#### Vue Components
- **Format**: PascalCase (e.g., `AddTodoForm.vue`, `TodoList.vue`)
- **Multi-word**: Required for clarity (e.g., `ProgressBar.vue`, not `Progress.vue`)
- **Length**: Descriptive preferred over brief (e.g., `TodoItem.vue`, not `Item.vue`)

#### Composables
- **Format**: camelCase starting with `use` (e.g., `useTodos.js`, `useAuth.js`)
- **Pattern**: `use{FeatureName}.js`
- **Multi-word**: Use kebab-case if needed (e.g., `use-emoji-overlay.js`)

#### JavaScript/TypeScript Files
- **Format**: kebab-case (e.g., `main.js`, `router/index.js`)
- **Descriptive**: Long names are acceptable for clarity

---

## Code Organization Standards

### File Size Limits
- **Hard Limit**: 200 lines per component/composable
- **Target**: <150 lines for optimal maintainability
- **Action**: Split immediately when approaching limit

### Component Structure
```vue
<script setup>
// 1. Imports (external libraries)
// 2. Composables imports
// 3. Component imports
// 4. Props/Emits definitions
// 5. Reactive state
// 6. Computed properties
// 7. Methods/Handlers
// 8. Watchers
// 9. Lifecycle hooks
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Component-specific styles */
</style>
```

### Composable Structure
```javascript
// 1. JSDoc documentation
// 2. Imports
// 3. Local constants
// 4. State refs
// 5. Computed properties
// 6. Methods
// 7. Return object (plain refs, NOT reactive object)
```

---

## Vue 3 Best Practices

### Composition API Standards

#### Composable Return Values
```javascript
// ✅ CORRECT - Return plain object of refs
export function useTodos() {
  const todos = ref([]);
  const loading = ref(false);
  return { todos, loading };
}

// ❌ WRONG - Return reactive object
export function useTodos() {
  return reactive({
    todos: [],
    loading: false
  });
}
```

#### Watch Usage
- Use `watch` for side effects (API calls, DOM manipulation)
- Use `computed` for derived state
- Always specify `{ deep: true }` for objects/arrays when needed

#### Props Definition
```javascript
// ✅ CORRECT - Full prop definition
const props = defineProps({
  todo: {
    type: Object,
    required: true
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
});

// ❌ AVOID - Minimal prop definition
const props = defineProps(['todo', 'isDarkMode']);
```

#### Event Emission
```javascript
// ✅ CORRECT - Descriptive event names
const emit = defineEmits(['toggleTodo', 'expandTodo', 'removeTodo']);
emit('toggleTodo', todo);

// ❌ AVOID - Generic event names
const emit = defineEmits(['update']);
emit('update', { type: 'toggle', todo });
```

### Template Guidelines

#### Conditional Rendering
```vue
<!-- ✅ CORRECT - Use v-if for conditional blocks -->
<div v-if="showWarning" class="warning">
  Warning message
</div>

<!-- ✅ CORRECT - Use v-show for frequent toggles -->
<div v-show="isExpanded" class="content">
  Content
</div>
```

#### List Rendering
```vue
<!-- ✅ CORRECT - Always provide :key -->
<TodoItem
  v-for="todo in todos"
  :key="todo.id"
  :todo="todo"
/>

<!-- ❌ WRONG - No :key (Vue warning) -->
<TodoItem v-for="todo in todos" :todo="todo" />
```

#### Class Bindings
```vue
<!-- ✅ CORRECT - Conditional classes with object syntax -->
<div :class="{ 'bg-green-100': isActive, 'bg-gray-100': !isActive }">
  Content
</div>

<!-- ✅ CORRECT - Multiple class sources -->
<div
  class="base-class"
  :class="dynamicClass"
  :class="{ 'conditional': condition }"
>
  Content
</div>
```

---

## Naming Conventions

### Variables & Constants
```javascript
// ✅ CORRECT - camelCase for variables
const userTodos = ref([]);
const isLoading = computed(() => loading.value);

// ✅ CORRECT - UPPER_SNAKE_CASE for constants
const AUDIO_VOLUME = {
  THUNDER: 0.6,
  EVIL_ROAR: 0.5
};
const MAX_TODOS = 100;
```

### Functions & Methods
```javascript
// ✅ CORRECT - Verb prefixes for actions
const handleAddTodo = async (title) => { };
const toggleComplete = (todo) => { };
const fetchTodos = () => { };

// ✅ CORRECT - get/is prefix for getters/predicates
const getProgress = () => { };
const isComplete = (todo) => { };
```

### Event Handlers
```javascript
// ✅ CORRECT - on/handle prefix
const onSubmit = () => { };
const handleDragChange = () => { };
const onToggle = () => { };
```

---

## Error Handling

### Try-Catch Patterns
```javascript
// ✅ CORRECT - Always catch async errors
const addTodo = async (title) => {
  try {
    // API call or operation
  } catch (error) {
    console.error('Failed to add todo:', error);
    // User-facing error notification
  }
};

// ✅ CORRECT - Handle localStorage errors
const loadTodos = () => {
  try {
    const data = localStorage.getItem('todoapp_todos');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Failed to load todos:', error);
    return []; // Graceful fallback
  }
};
```

### User Feedback
- Always show user feedback for errors (toast, inline message)
- Log technical details to console
- Never expose stack traces to users

---

## Performance Guidelines

### Reactivity Best Practices
```javascript
// ✅ CORRECT - Use computed for derived data
const completedTodos = computed(() =>
  todos.value.filter(t => t.is_complete)
);

// ❌ AVOID - Recalculating in template
<div v-for="todo in todos.filter(t => t.is_complete)">
```

### Lazy Loading
- Load audio assets on-demand (not in initial bundle)
- Use dynamic imports for large components
- Defer non-critical functionality

### Memory Management
```javascript
// ✅ CORRECT - Cleanup timers
const timeoutRef = ref(null);
const triggerEffect = () => {
  timeoutRef.value = setTimeout(() => {
    // Effect logic
  }, 2000);
};

onUnmounted(() => {
  if (timeoutRef.value) {
    clearTimeout(timeoutRef.value);
  }
});
```

---

## Accessibility Standards

### ARIA Attributes
```vue
<!-- ✅ CORRECT - Proper ARIA labels -->
<button
  @click="toggleDarkMode"
  :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
  :aria-pressed="isDarkMode"
>
  Toggle Theme
</button>

<!-- ✅ CORRECT - Progress bar -->
<div
  role="progressbar"
  :aria-valuenow="progressPercent"
  :aria-valuemin="0"
  :aria-valuemax="100"
  :aria-label="`${completed} of ${total} tasks completed`"
>
  {{ progressPercent }}%
</div>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use `<button>` for actions (not `<div>` with click)
- Support Enter/Space for button activation
- Provide visible focus indicators

---

## Testing Standards

### Unit Testing (Future)
- Test composables in isolation
- Mock external dependencies
- Test edge cases (empty arrays, null values)

### Integration Testing (Future)
- Test component interactions
- Test user workflows (create → complete → delete)
- Test localStorage persistence

---

## Code Review Checklist

### Before Committing
- [ ] File size <200 lines (or split)
- [ ] No console.log statements (use console.error for errors)
- [ ] All props defined with types
- [ ] All events emitted with descriptive names
- [ ] Error handling on all async operations
- [ ] No unused imports or variables
- [ ] Descriptive variable/function names
- [ ] Comments for complex logic (why, not what)

### Phase 01 Specific Improvements
- [x] Component modularization complete
- [x] Composable extraction complete
- [x] DashboardView.vue reduced to 140 lines (73% reduction)
- [x] All feature parity maintained
- [x] Drag-and-drop reactivity fix applied

---

## Security Standards

### XSS Prevention
```javascript
// ✅ CORRECT - Vue auto-escapes by default
<div>{{ todo.title }}</div>

// ❌ NEVER USE - v-html with user input
<div v-html="userContent"></div>
```

### LocalStorage Safety
- Never store sensitive data (passwords, tokens)
- Validate data on retrieval
- Handle parse errors gracefully

---

## Documentation Standards

### JSDoc Comments
```javascript
/**
 * Manages todo state with localStorage persistence
 * @returns {Object} Todo state and methods
 * @returns {Ref<Array>} todos - Reactive todo list
 * @returns {Ref<boolean>} loading - Loading state
 * @returns {Function} addTodo - Add new todo
 * @returns {Function} toggleTodo - Toggle todo completion
 */
export function useTodos() {
  // Implementation
}
```

### Code Comments
- Explain **why**, not **what**
- Document non-obvious logic
- Comment edge case handling
- Keep comments concise

---

## Git Workflow

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no feature change)
- `docs`: Documentation update
- `test`: Adding/updating tests
- `chore`: Build/configuration changes

### Examples
```
feat(todos): add subtask validation warning
fix(draggable): resolve reactivity conflict with v-model
refactor(dashboard): extract components from monolithic view
docs(readme): update setup instructions
```

---

## Tooling Configuration

### ESLint (Future)
- Enable Vue 3 rules
- Enforce consistent naming
- Catch unused variables

### Prettier (Future)
- Consistent formatting
- 2-space indentation
- Single quotes for strings

### TypeScript (Future)
- Strong typing for props/emits
- Type-safe composables
- Catch errors at compile time

---

**Last Updated**: 2026-03-10 (Post Phase 01 Modularization)
**Next Review**: After Phase 02 completion
