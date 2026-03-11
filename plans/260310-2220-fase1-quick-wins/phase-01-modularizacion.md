---
title: "Phase 01: Modularización de DashboardView.vue"
description: "Extraer 3 componentes y 2 composables para reducir DashboardView.vue de 521 a ~180 líneas (RED TEAM REVISED)"
status: pending
priority: P1
effort: 2.5h
tags: [refactoring, vue3, composition-api]
created: 2026-03-10
updated: 2026-03-10
---

## Context Links

- **Research**: [Vue 3 Best Practices](../../reports/researcher-260310-2220-vue3-best-practices.md) - Sections 1.1, 1.2, 1.3
- **Current File**: [DashboardView.vue](../../../src/views/DashboardView.vue) (521 lines - OVER LIMIT)
- **Composables Reference**: [useAuth.js](../../../src/composables/useAuth.js), [useTodos.js](../../../src/composables/useTodos.js)
- **Red Team Findings**: [Scope Critic Review](./reports/code-reviewer-260310-2231-scope-complexity-critic.md)

## Overview

**Priority**: CRITICAL (Foundation for all subsequent phases)
**Status**: ⏳ Pending
**Description**: Split monolithic DashboardView.vue into 3 focused components (reduced from 7) and 2 composables (reduced from 4) following Vue 3 Composition API best practices.

**Target**: Reduce DashboardView.vue from 521 to ~180 lines (65% reduction)

**Red Team Changes**:
- Component explosion reduced: 7 → 3 components
- Composables reduced: 4 → 2
- Draggable array clonning added for reactivity
- Effort reduced: 3h → 2.5h

## Key Insights from Research

### From Vue 3 Best Practices Report

1. **Composables Pattern**: Extract stateful logic for reuse across components
   - Naming: `use{FeatureName}.js` (camelCase starting with "use")
   - Return plain object of refs (NOT reactive object)

2. **Component Splitting**: Extract visual reuse with both logic and layout
   - Use `defineProps` and `defineEmits` for communication
   - Props stability critical for performance

3. **Current Code Analysis** (DashboardView.vue):
   - Lines 1-172: Script setup (composable extraction candidates)
   - Lines 174-520: Template (component extraction candidates)
   - Extractable logic: expansion, emoji overlay, confetti, meta tags

## Requirements

### Functional Requirements
- [ ] Extract 5 components from template section
- [ ] Extract 4 composables from script section
- [ ] Maintain ALL existing functionality (no feature loss)
- [ ] Vecna mode compatibility preserved
- [ ] Drag & drop functionality intact
- [ ] Subtask system working
- [ ] Audio/emoji effects functional

### Non-Functional Requirements
- [ ] Each component <150 lines
- [ ] Each composable <100 lines
- [ ] DashboardView.vue <150 lines after extraction
- [ ] Zero breaking changes to user experience
- [ ] TypeScript/JSDoc annotations on composables
- [ ] Maintain reactivity performance

## Architecture

### Component Structure (RED TEAM REVISED)

```
src/components/
├── todo/
│   ├── TodoItem.vue (~180 lines)
│   │   - Renders single todo with checkbox, drag handle, delete, subtasks
│   │   - Contains SubtaskList inline (no separate component)
│   │   - Emits: toggle, expand, delete
│   │   - Props: todo, isExpanded, isDarkMode
│   │
│   └── TodoList.vue (~120 lines)
│   │   - Wraps draggable with TodoItem components
│   │   - CRITICAL: Clones todos array before passing to draggable for reactivity
│   │   - Emits: dragChange (with full array), toggleTodo, expandTodo, removeTodo
│   │   - Props: todos (cloned), expandedTodos, isDarkMode
│   │
└── ui/
    └── AddTodoForm.vue (~80 lines)
        - New todo input with submit button
        - Emits: submit
        - Props: loading, placeholder
```

### Composables Structure (RED TEAM REVISED)

```
src/composables/
├── useMetaTags.js (~50 lines)
│   - Favicon and title management for dark/light modes
│   - Returns: updateMeta()
│
└── useEmojiOverlay.js (~40 lines)
    - Sad/warning emoji overlay state and timing
    - Returns: showSadEmoji, showWarningEmoji, triggerSad(), triggerWarning()
```

**Removed per Red Team** (YAGNI violations):
- `useTodoExpansion.js` - Keep in DashboardView (coordination logic)
- `useConfettiEffects.js` - Keep in DashboardView (called once on completion)
- `ProgressBar.vue` - Keep in DashboardView (used once, no reuse)
- `EmojiOverlay.vue` - Keep in DashboardView template (simpler without abstraction)
- `DashboardHeader.vue` - Keep in DashboardView (coordination logic, not reusable)
```

### Composable Structure

```
src/composables/
├── useTodoExpansion.js (~40 lines)
│   - Manages expandedTodos Set
│   - Returns: expandedTodos, toggleExpand, isExpanded
│
├── useEmojiOverlay.js (~50 lines)
│   - Manages sad/warning emoji state with timers
│   - Returns: showSadEmoji, showWarningEmoji, triggerSad, triggerWarning
│
├── useConfettiEffects.js (~60 lines)
│   - Confetti + audio logic for completion celebration
│   - Returns: triggerCompletionEffects
│
└── useMetaTags.js (~40 lines)
│   - Favicon + title management based on dark mode
│   - Returns: updateMeta
```

### Modified Files

```
src/views/DashboardView.vue
- BEFORE: 521 lines (script: 172, template: 349)
- AFTER: ~120 lines (script: 60, template: 60)
- Reduction: 401 lines (77%)
```

## Related Code Files

### Files to CREATE

**Components** (5 files):
1. `src/components/todo/TodoItem.vue` - Single todo rendering
2. `src/components/todo/TodoList.vue` - Draggable wrapper
3. `src/components/todo/SubtaskList.vue` - Subtask management
4. `src/components/ui/ProgressBar.vue` - Progress display
5. `src/components/ui/AddTodoForm.vue` - New todo input
6. `src/components/ui/EmojiOverlay.vue` - Emoji animations
7. `src/components/layout/DashboardHeader.vue` - Header section

**Composables** (4 files):
1. `src/composables/useTodoExpansion.js` - Expansion state
2. `src/composables/useEmojiOverlay.js` - Emoji overlays
3. `src/composables/useConfettiEffects.js` - Confetti + audio
4. `src/composables/useMetaTags.js` - Meta tag management

### Files to MODIFY

1. `src/views/DashboardView.vue` - Extract to components/composables

### Files to DELETE

None (refactoring only, no deletions)

## Implementation Steps

### Step 1: Create Composables (30 min)

**1.1 Extract `useTodoExpansion.js`**
```javascript
// Extract lines 66-80 from DashboardView.vue
// - expandedTodos ref
// - toggleExpand function
// - Add isExpanded helper
```

**1.2 Extract `useEmojiOverlay.js`**
```javascript
// Extract lines 27-28, 145-157
// - showSadEmoji, showWarningEmoji refs
// - triggerSadEmoji, triggerWarningEmoji functions
```

**1.3 Extract `useConfettiEffects.js`**
```javascript
// Extract lines 92-121
// - watch on todos for completion detection
// - Confetti logic (normal vs Vecna)
// - Audio playback (evil roar)
```

**1.4 Extract `useMetaTags.js`**
```javascript
// Extract lines 31-46, 49-64
// - updateMeta function
// - watch on isDarkMode
```

### Step 2: Create UI Components (45 min)

**2.1 Create `ProgressBar.vue`**
```vue
<!-- Extract lines 230-257 -->
<!-- Props: completed, total, isDarkMode -->
<!-- Computed: progressPercent -->
```

**2.2 Create `AddTodoForm.vue`**
```vue
<!-- Extract lines 259-276 -->
<!-- Props: loading, isDarkMode -->
<!-- Emits: submit -->
```

**2.3 Create `EmojiOverlay.vue`**
```vue
<!-- Extract lines 185-203 -->
<!-- Props: show, emoji (😢/👹, 🚨/💀) -->
<!-- Animation: animate-sad-zoom-fade -->
```

**2.4 Create `DashboardHeader.vue`**
```vue
<!-- Combine title, dark mode toggle, ProgressBar -->
<!-- Props: title, isDarkMode, todos, loading -->
<!-- Emits: toggleDarkMode -->
```

### Step 3: Create Todo Components (60 min)

**3.1 Create `SubtaskList.vue`**
```vue
<!-- Extract lines 440-502 -->
<!-- Props: subtasks, todoId, isDarkMode -->
<!-- Emits: toggleSubtask, removeSubtask, addSubtask -->
<!-- Include subtask input with @keydown.enter -->
```

**3.2 Create `TodoItem.vue`**
```vue
<!-- Extract lines 320-438 -->
<!-- Props: todo, isExpanded, isDarkMode -->
<!-- Emits: toggle, expand, delete -->
<!-- Include: drag handle, checkbox, text, expand btn, delete btn -->
<!-- Use SubtaskList component internally -->
```

**3.3 Create `TodoList.vue`**
```vue
<!-- Wrap draggable component -->
<!-- Props: todos, expandedTodos, isDarkMode -->
<!-- Emits: dragChange, toggleTodo, expandTodo, removeTodo -->
<!-- Render TodoItem for each todo -->
```

### Step 4: Refactor DashboardView.vue (30 min)

**4.1 Update Script Section**
```javascript
// Import all new composables
// Import all new components
// Remove extracted code
// Keep only orchestration logic
```

**4.2 Update Template Section**
```vue
<!-- Replace extracted sections with components -->
<!-- Use DashboardHeader -->
<!-- Use AddTodoForm -->
<!-- Use TodoList -->
<!-- Use EmojiOverlay -->
```

**4.3 Verify File Size**
```bash
# DashboardView.vue should be <150 lines
wc -l src/views/DashboardView.vue
```

### Step 5: Testing & Validation (15 min)

**5.1 Functional Testing**
- [ ] Create new todo
- [ ] Toggle todo completion
- [ ] Add/remove subtasks
- [ ] Drag & drop reordering
- [ ] Dark mode toggle
- [ ] Vecna mode audio
- [ ] Confetti celebration
- [ ] Emoji overlays (sad/warning)

**5.2 Visual Regression**
- [ ] Compare with original design
- [ ] Check dark mode styles
- [ ] Verify Vecna theme colors
- [ ] Test responsive layout

**5.3 Performance Check**
- [ ] No console errors
- [ ] Reactivity working (no stale state)
- [ ] Animation smoothness (60fps)

## Todo List

### Composables Creation
- [ ] Create `useTodoExpansion.js` with expansion state
- [ ] Create `useEmojiOverlay.js` with emoji timers
- [ ] Create `useConfettiEffects.js` with confetti + audio
- [ ] Create `useMetaTags.js` with favicon/title logic

### UI Components Creation
- [ ] Create `ProgressBar.vue` with progress display
- [ ] Create `AddTodoForm.vue` with input + submit
- [ ] Create `EmojiOverlay.vue` with animations
- [ ] Create `DashboardHeader.vue` combining header elements

### Todo Components Creation
- [ ] Create `SubtaskList.vue` with subtask management
- [ ] Create `TodoItem.vue` with single todo rendering
- [ ] Create `TodoList.vue` with draggable wrapper

### DashboardView Refactoring
- [ ] Update script imports and remove extracted code
- [ ] Update template with new components
- [ ] Verify file size <150 lines

### Testing
- [ ] Test all functionality (create, toggle, drag, expand)
- [ ] Test Vecna mode compatibility
- [ ] Test audio/emoji effects
- [ ] Visual regression check
- [ ] Performance validation

## Success Criteria

### File Size Metrics
- [ ] DashboardView.vue: 521 → <150 lines (≥71% reduction)
- [ ] All components: <150 lines each
- [ ] All composables: <100 lines each
- [ ] Total LOC reduction: ≥400 lines

### Functional Completeness
- [ ] 100% feature parity with original
- [ ] Zero breaking changes
- [ ] All interactions working
- [ ] Vecna mode fully functional

### Code Quality
- [ ] No console errors
- [ ] Proper TypeScript/JSDoc annotations
- [ ] Consistent naming conventions
- [ ] Clear component/composable separation

### Performance
- [ ] No reactivity degradation
- [ ] Animations at 60fps
- [ ] No memory leaks (timers cleaned up)

## Risk Assessment

### High Risk
- **Breaking existing functionality** during extraction
  - **Mitigation**: Test each component in isolation before integration
  - **Rollback**: Git revert if critical break occurs

### Medium Risk
- **Props drilling complexity** with deep component nesting
  - **Mitigation**: Use provide/inject if >3 levels deep
  - **Acceptance**: Some drilling acceptable for this size

- **Reactivity loss** if composable returns not structured correctly
  - **Mitigation**: Return plain object of refs (not reactive)
  - **Validation**: Test reactivity after each composable extraction

### Low Risk
- **Animation timing issues** with extracted emoji overlay
  - **Mitigation**: Keep timer logic in composable
  - **Fallback**: Remove timeouts if problematic

## Security Considerations

- **XSS Prevention**: Emoji overlay uses user-controlled emoji (😢/👹)
  - **Mitigation**: Only allow predefined emoji set
- **LocalStorage**: No changes to storage logic in this phase
- **Audio**: Audio files already vetted in original implementation

## Next Steps

Upon completion of Phase 01:
1. **Verify DashboardView.vue <150 lines**
2. **Run full functional test suite**
3. **Commit changes**: `refactor: modularize DashboardView into components and composables`
4. **Unblock Phases 02-04** for parallel execution
5. **Update session state** for parallel agent coordination

## Blocking Issues

None identified. This phase has no external dependencies.

## Estimated Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| Create Composables | 30 min | None |
| Create UI Components | 45 min | Composables |
| Create Todo Components | 60 min | UI Components |
| Refactor DashboardView | 30 min | All Components |
| Testing & Validation | 15 min | Complete Refactor |
| **Total** | **3h** | Sequential |

## Notes

- **Vue 3 Composition API**: All composables follow `use{Feature}` naming convention
- **Props Stability**: Critical for performance - avoid passing entire objects when single values suffice
- **Component Communication**: Props down, events up pattern only
- **Vecna Mode**: All components must respect `isDarkMode` prop for styling
