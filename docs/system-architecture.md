# System Architecture

**Project**: ToDo App + Vecna Mode
**Version**: 1.1.0
**Last Updated**: 2026-03-10

---

## Architecture Overview

### Design Philosophy
The application follows a **client-side only** architecture with no backend dependencies. All data persistence is handled through the browser's localStorage API, making the app inherently private, fast, and simple to deploy.

### Key Architectural Decisions
1. **No Backend**: Complete client-side architecture eliminates server costs, reduces latency, and ensures privacy
2. **Component-Based**: Modular Vue 3 components with clear separation of concerns
3. **Composable Pattern**: Reusable logic via Composition API for state management
4. **Local-First**: All data stored locally with no cloud synchronization

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Vue 3 Application Layer                  │  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Views     │  │ Components  │  │ Composables │  │  │
│  │  │             │  │             │  │             │  │  │
│  │  │ Dashboard   │  │ TodoItem    │  │ useTodos    │  │  │
│  │  │ View.vue    │  │ TodoList    │  │ useAuth     │  │  │
│  │  │             │  │ AddTodoForm │  │ useMetaTags │  │  │
│  │  └─────────────┘  │ ProgressBar │  │ useEmojiOverlay │ │
│  │                   │             │  └─────────────┘  │  │
│  │                   └─────────────┘                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Data Persistence Layer                      │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         localStorage API                        │  │  │
│  │  │                                                 │  │  │
│  │  │  • todoapp_todos (JSON array)                  │  │  │
│  │  │  • todoapp_darkMode (boolean)                  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Browser APIs & External Libs               │  │
│  │                                                        │  │
│  │  • canvas-confetti (Celebration effects)             │  │
│  │  • vue-draggable-next (Drag & drop)                  │  │
│  │  • Audio API (Sound effects)                         │  │
│  │  • DOM API (Favicon manipulation)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture (Post Phase 01)

### Component Hierarchy
```
DashboardView.vue (140 lines)
├── ProgressBar.vue (44 lines)
│   └── Displays: completion percentage
│
├── AddTodoForm.vue (43 lines)
│   └── Emits: @submit(title)
│
└── TodoList.vue (85 lines)
    ├── Props: todos, expandedTodos, isDarkMode
    ├── Emits: @dragChange, @toggleTodo, @expandTodo, @removeTodo
    └── TodoItem.vue (203 lines)
        ├── Props: todo, isExpanded, isDarkMode
        ├── Emits: @toggle, @expand, @delete
        └── Subtask rendering (inline)
```

### Data Flow Pattern
```
User Interaction
       │
       ▼
Component Event Emit
       │
       ▼
Parent Handler (DashboardView)
       │
       ▼
Composable Method (useTodos)
       │
       ▼
localStorage Update
       │
       ▼
Reactive Ref Update
       │
       ▼
Component Re-render
```

### Props-Down, Events-Up Pattern
```javascript
// Parent (DashboardView.vue)
<TodoList
  :todos="todos"              // Props down
  :isDarkMode="isDarkMode"
  @toggleTodo="handleToggle"  // Events up
/>

// Child (TodoList.vue)
const props = defineProps({
  todos: Array,
  isDarkMode: Boolean
});
const emit = defineEmits(['toggleTodo']);

emit('toggleTodo', todo);
```

---

## Composable Architecture

### State Management Strategy
The app uses **Composition API composables** for state management instead of Vuex/Pinia. This simplifies the architecture while maintaining reactivity.

### Core Composables

#### 1. useTodos.js (151 lines)
**Purpose**: Core todo CRUD operations
**State**:
- `todos` (Ref<Array>) - Main todo list
- `loading` (Ref<Boolean>) - Loading state

**Methods**:
- `fetchTodos()` - Load from localStorage
- `addTodo(title)` - Create new todo
- `toggleTodo(todo)` - Toggle completion
- `removeTodo(id)` - Delete todo
- `updatePositions(todos)` - Save new order

**Data Flow**:
```
localStorage → fetchTodos() → todos ref → Components
              ↑                              ↓
              └─────── updatePositions() ←───┘
```

#### 2. useAuth.js (24 lines)
**Purpose**: Dark mode state management
**State**:
- `user` (Ref<Object>) - User profile (mock)
- `isDarkMode` (Ref<Boolean>) - Theme state

**Methods**:
- `toggleDarkMode()` - Switch theme
- `loadDarkMode()` - Load from localStorage

**Side Effects**:
- Persists theme preference to localStorage

#### 3. useMetaTags.js (40 lines)
**Purpose**: Dynamic favicon and page title
**Methods**:
- `updateMeta()` - Update based on current theme

**Behavior**:
- Light mode: ✅ emoji favicon
- Dark mode: 👹 emoji favicon
- Updates document title accordingly

#### 4. use-emoji-overlay.js (36 lines)
**Purpose**: Emoji overlay state management
**State**:
- `showSadEmoji` (Ref<Boolean>)
- `showWarningEmoji` (Ref<Boolean>)

**Methods**:
- `triggerSad()` - Show 😢/👹 for 2 seconds
- `triggerWarning()` - Show 🚨/💀 for 2 seconds

**Use Cases**:
- Sad emoji: Un-checking completed task
- Warning emoji: Completing parent with incomplete subtasks

---

## Data Persistence Architecture

### Storage Schema
```javascript
// Key: todoapp_todos
[
  {
    "id": 1710123456789,           // Timestamp-based ID
    "title": "Task title",
    "is_complete": false,
    "position": 0,                 // Display order
    "subtasks": [
      {
        "id": 1710123456790,
        "title": "Subtask title",
        "is_complete": false
      }
    ],
    "created_at": "2026-03-10T22:30:00.000Z"
  }
]

// Key: todoapp_darkMode
true  // Boolean
```

### Persistence Flow
```
┌─────────────┐
│   User      │
│  Action     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Component   │
│   Event     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Composable  │
│  Method     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ localStorage│
│   Write     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Reactive  │
│  Ref Update │
└─────────────┘
```

### Error Handling
- JSON parse errors → Return empty array
- localStorage quota → Graceful error handling
- Missing keys → Default values

---

## Rendering Architecture

### Reactive Rendering Pipeline
```
State Change (Ref)
       │
       ▼
Computed Property Update
       │
       ▼
Component Re-render
       │
       ▼
Virtual DOM Diff
       │
       ▼
Minimal DOM Update
```

### Optimizations Applied
1. **Computed Properties**: Cached derived state
2. **v-if vs v-show**: Conditional rendering based on toggle frequency
3. **Array Cloning**: Prevents vuedraggable reactivity conflicts
4. **Keyed Lists**: Efficient list rendering with `:key`

### Animation Strategy
```javascript
// CSS Transitions (GPU accelerated)
.transition-all {
  transition: all 0.3s ease;
}

// Staggered Entry (TodoList)
animation-delay: calc(index * 50ms);

// Canvas Confetti (Performance optimized)
confetti({
  particleCount: 100,
  disableForReducedMotion: true  // Accessibility
});
```

---

## Event Handling Architecture

### Event Delegation Pattern
```
TodoItem (Child)
  │
  │ emit('toggle', todo)
  ▼
TodoList (Intermediate)
  │
  │ emit('toggleTodo', todo)
  ▼
DashboardView (Parent)
  │
  │ handleToggleTodo()
  ▼
useTodos.toggleTodo()
```

### Drag-and-Drop Flow
```
User Drags Todo
       │
       ▼
vuedraggable Event
       │
       ▼
TodoList clones array
  (Reactivity fix)
       │
       ▼
Emit @dragChange
       │
       ▼
DashboardView.updatePositions()
       │
       ▼
useTodos saves to localStorage
       │
       ▼
Parent component re-renders
```

---

## Audio Architecture

### Sound System
```javascript
// Thunder Sound (Dark mode entry)
const audio = new Audio(thunderSound);
audio.volume = 0.6;
audio.play().catch(e => console.log('Audio play failed', e));

// Evil Roar Sound (All tasks complete)
const audio = new Audio(evilRoarSound);
audio.volume = 0.5;
audio.play().catch(e => console.log('Roar play failed', e));
```

### Audio Loading Strategy
- Assets imported as URLs (not bundled)
- Lazy-loaded on demand
- Graceful fallback for autoplay policies

---

## Security Architecture

### Client-Side Security
1. **XSS Prevention**: Vue auto-escapes template expressions
2. **Input Validation**: Empty title checks before submission
3. **LocalStorage Sanitization**: JSON parse/catch errors

### Data Privacy
- No server communication
- No third-party trackers
- All data remains on device
- User controls data export/deletion

---

## Performance Architecture

### Bundle Optimization
```
Initial Load:
├── Vue 3 Runtime (~50KB)
├── App Code (~30KB)
├── Tailwind CSS (~15KB)
└── Total: ~95KB (gzipped)
```

### Runtime Performance
- **Initial Render**: <800ms typical
- **State Updates**: <16ms (60fps target)
- **Drag Operations**: Optimized with array cloning
- **Confetti Effects**: Canvas-based (60fps)

### Memory Management
- Timer cleanup in emoji overlay composable
- No memory leaks (tested with Chrome DevTools)
- Reactive refs properly garbage collected

---

## Deployment Architecture

### Build Process
```
Source Code (Vite)
       │
       ▼
Development Server (npm run dev)
       │
       ▼
Production Build (npm run build)
       │
       ▼
dist/ Directory
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   └── index-[hash].css
  └── ... (assets)
```

### Deployment Options
1. **Static Hosting**: Netlify, Vercel, GitHub Pages
2. **CDN**: Cloudflare, AWS CloudFront
3. **Self-Hosted**: nginx, Apache

### No Backend Required
- No API endpoints
- No database
- No authentication server
- No build pipeline complexity

---

## Extensibility Points

### Future Architecture Enhancements

#### 1. Service Worker (PWA)
```javascript
// Potential future enhancement
Register service worker for:
- Offline mode
- Background sync
- Cache assets
```

#### 2. IndexedDB (Large Data)
```javascript
// If localStorage quota exceeded
Upgrade to IndexedDB for:
- Larger storage capacity
- Better performance
- Asynchronous operations
```

#### 3. Export/Import
```javascript
// Data portability
JSON export/import for:
- Backup/restore
- Cross-device migration
- Data ownership
```

---

## Architecture Decision Records

### ADR-001: No Backend
**Status**: Active
**Context**: Simple todo app with privacy focus
**Decision**: Client-side only with localStorage
**Consequences**:
- ✅ Zero server costs
- ✅ Complete privacy
- ✅ Simple deployment
- ❌ No cross-device sync
- ❌ Data loss if cache cleared

### ADR-002: Vue 3 Composition API
**Status**: Active
**Context**: Modern reactive state management
**Decision**: Use Composition API over Vuex
**Consequences**:
- ✅ Simpler architecture
- ✅ Better TypeScript support
- ✅ Smaller bundle size
- ❌ No devtools integration (yet)

### ADR-003: Component Modularization
**Status**: Active (Phase 01)
**Context**: DashboardView.vue at 521 lines
**Decision**: Extract to 6 components + 2 composables
**Consequences**:
- ✅ Improved maintainability
- ✅ Easier testing
- ✅ Code reusability
- ❌ More files to manage

---

## Monitoring & Observability (Future)

### Potential Enhancements
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- User analytics (privacy-focused)
- Crash reporting

---

**Last Updated**: 2026-03-10 (Post Phase 01 Modularization)
**Next Review**: After Phase 02 (Categories & Priorities)
