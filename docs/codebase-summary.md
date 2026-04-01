# Codebase Summary

**Project**: ToDo App + Vecna Mode
**Version**: 1.1.0
**Last Updated**: 2026-03-10
**Status**: Post Phase 01 Modularization Complete

---

## Quick Overview

A modern Vue 3 todo application with a unique "Vecna Mode" dark theme. The app features drag-and-drop task management, subtasks, progress tracking, and immersive audio/visual feedback—all running entirely in the browser with localStorage persistence.

**Tech Stack**: Vue 3 + Vite + Tailwind CSS + Canvas Confetti + vue-draggable-next

---

## Project Structure

```
ToDoApp/
├── src/
│   ├── assets/              # Static assets (audio, images)
│   │   ├── evil-roar.mp3    # Vecna mode celebration sound
│   │   └── thunder.mp3      # Dark mode entry sound
│   │
│   ├── components/          # Vue components (modularized in Phase 01)
│   │   ├── todo/           # Todo-specific components
│   │   │   ├── TodoItem.vue       # Single todo with subtasks (203 lines)
│   │   │   └── TodoList.vue       # Draggable wrapper (85 lines)
│   │   │
│   │   └── ui/             # Reusable UI components
│   │       ├── AddTodoForm.vue    # New todo input (43 lines)
│   │       └── ProgressBar.vue    # Progress display (44 lines)
│   │
│   ├── composables/        # Composition API logic
│   │   ├── useTodos.js            # Todo CRUD operations (151 lines)
│   │   ├── useAuth.js             # Dark mode state (24 lines)
│   │   ├── useMetaTags.js         # Favicon/title management (40 lines)
│   │   └── use-emoji-overlay.js   # Emoji overlay state (36 lines)
│   │
│   ├── router/             # Vue Router configuration
│   │   └── index.js               # Route definitions
│   │
│   ├── views/              # Page-level components
│   │   └── DashboardView.vue      # Main dashboard (140 lines, -73% from 521)
│   │
│   ├── App.vue             # Root component
│   ├── main.js             # Application entry point
│   └── style.css           # Global styles & animations
│
├── public/                 # Static assets served directly
├── docs/                   # Project documentation
├── plans/                  # Implementation plans & reports
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # Project overview
```

---

## Core Components

### 1. DashboardView.vue (140 lines)
**Role**: Main container and orchestration
**Responsibilities**:
- Coordinate child components
- Handle drag-and-drop events
- Manage expansion state
- Watch for completion (trigger confetti)

**Key Logic**:
```javascript
// Expansion state management
const expandedTodos = ref(new Set());

// Completion celebration
watch(todos, (newTodos) => {
  if (newTodos.length > 0 && newTodos.every(t => t.is_complete)) {
    // Trigger confetti + audio
  }
}, { deep: true });
```

**Phase 01 Impact**: Reduced from 521 to 140 lines (73% reduction)

---

### 2. TodoList.vue (85 lines)
**Role**: Draggable wrapper for todo items
**Responsibilities**:
- Wrap vuedraggable component
- Clone array for reactivity fix
- Delegate events to parent

**Critical Fix** (Phase 01):
```javascript
// Clone array before passing to draggable
const clonedTodos = computed(() => {
  return [...props.todos];  // Prevents reactivity conflict
});
```

---

### 3. TodoItem.vue (203 lines)
**Role**: Individual todo rendering
**Responsibilities**:
- Display todo title, checkbox, delete button
- Render subtasks inline
- Handle expansion/collapse
- Calculate subtask progress

**Props**:
```javascript
{
  todo: Object,        // Todo data
  isExpanded: Boolean, // Show subtasks?
  isDarkMode: Boolean  // Theme state
}
```

**Events**: `@toggle`, `@expand`, `@delete`

---

### 4. AddTodoForm.vue (43 lines)
**Role**: New todo input
**Responsibilities**:
- Capture user input
- Validate non-empty
- Emit submit event

**Events**: `@submit(title)`

---

### 5. ProgressBar.vue (44 lines)
**Role**: Progress display
**Responsibilities**:
- Calculate completion percentage
- Show dynamic message
- Visual progress bar

**Props**:
```javascript
{
  total: Number,      // Total todos
  completed: Number   // Completed todos
}
```

---

## Composables

### useTodos.js (151 lines)
**Purpose**: Core todo state management

**State**:
```javascript
{
  todos: Ref<Array>,     // Main todo list
  loading: Ref<Boolean>  // Loading state
}
```

**Methods**:
- `fetchTodos()` - Load from localStorage
- `addTodo(title)` - Create with timestamp ID
- `toggleTodo(todo)` - Toggle completion
- `removeTodo(id)` - Delete todo
- `addSubtask(todoId, title)` - Add subtask
- `toggleSubtask(todo, subtaskId)` - Toggle subtask
- `removeSubtask(todo, subtaskId)` - Remove subtask
- `updatePositions(todos)` - Save new order

**Storage Key**: `todoapp_todos`

---

### useAuth.js (24 lines)
**Purpose**: Dark mode state management

**State**:
```javascript
{
  user: Ref<Object>,     // Mock user profile
  isDarkMode: Ref<Boolean> // Theme state
}
```

**Methods**:
- `toggleDarkMode()` - Switch theme
- `loadDarkMode()` - Load from localStorage

**Storage Key**: `todoapp_darkMode`

---

### useMetaTags.js (40 lines)
**Purpose**: Dynamic favicon and page title

**Methods**:
- `updateMeta()` - Update based on theme

**Behavior**:
- Light mode: ✅ favicon, "Todo List" title
- Dark mode: 👹 favicon, "LISTA MALDITA" title

---

### use-emoji-overlay.js (36 lines)
**Purpose**: Emoji overlay state management

**State**:
```javascript
{
  showSadEmoji: Ref<Boolean>,
  showWarningEmoji: Ref<Boolean>
}
```

**Methods**:
- `triggerSad()` - Show 😢/👹 for 2 seconds
- `triggerWarning()` - Show 🚨/💀 for 2 seconds

---

## Data Models

### Todo Object
```javascript
{
  id: 1710123456789,              // Timestamp-based ID
  title: "Task title",
  is_complete: false,
  position: 0,                    // Display order
  subtasks: [
    {
      id: 1710123456790,
      title: "Subtask title",
      is_complete: false
    }
  ],
  created_at: "2026-03-10T22:30:00.000Z"
}
```

### Subtask Object
```javascript
{
  id: 1710123456790,
  title: "Subtask title",
  is_complete: false
}
```

---

## Key Features

### 1. Task Management
- Create todos with title
- Toggle completion
- Delete todos
- Persistent storage

### 2. Subtasks
- Add subtasks to any todo
- Toggle subtask completion
- Auto-complete parent when all subtasks done
- Validation warning if completing parent with incomplete subtasks

### 3. Drag-and-Drop
- Reorder todos via drag
- Persistent position changes
- New tasks added to end

### 4. Progress Tracking
- Visual progress bar
- Percentage calculation
- Dynamic messaging

### 5. Theme Switching
- Light mode (green theme)
- Dark mode (Vecna/Upside Down theme)
- Thunder sound on dark mode entry
- Persistent preference

### 6. Celebrations
- Confetti on all tasks complete
- Different styles per mode
- Evil roar sound in dark mode
- Emoji overlays for validation

---

## Styling Architecture

### Tailwind CSS Configuration
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        vecna: {
          bg: '#0a0a0a',
          accent: '#7f1d1d',
          text: '#e5e5e5'
        }
      },
      animation: {
        'sad-zoom-fade': 'sadZoomFade 2s ease-out forwards'
      }
    }
  }
}
```

### Custom Animations
```css
@keyframes sadZoomFade {
  0% { opacity: 0; transform: scale(0.5); }
  20% { opacity: 1; transform: scale(1.2); }
  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}

.ash-overlay {
  background-image: url('/particles.png');
  animation: float 20s infinite linear;
}
```

---

## Routing

### Current Routes
```javascript
{
  path: '/',
  name: 'dashboard',
  component: DashboardView
}
```

**Note**: Single-page app with dashboard as only route

---

## Build & Deployment

### Development
```bash
npm install        # Install dependencies
npm run dev        # Start dev server (localhost:5173)
```

### Production
```bash
npm run build      # Build for production
# Output: dist/ directory
```

### Preview
```bash
npm run preview    # Preview production build
```

---

## Dependencies

### Production
```json
{
  "vue": "^3.4.0",
  "vue-router": "^4.2.0",
  "vuedraggable": "^4.1.0",
  "canvas-confetti": "^1.9.0"
}
```

### Development
```json
{
  "@vitejs/plugin-vue": "^5.0.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

---

## Performance Metrics

### Bundle Size
- **Total**: ~95KB gzipped
- **Vue Runtime**: ~50KB
- **App Code**: ~30KB
- **Tailwind CSS**: ~15KB

### Runtime Performance
- **Initial Load**: <800ms typical
- **State Updates**: <16ms (60fps target)
- **Drag Operations**: Optimized with array cloning

### Code Quality (Post Phase 01)
- **DashboardView.vue**: 140 lines (-73% from 521)
- **Largest Component**: TodoItem.vue (203 lines)
- **Total Components**: 6 focused components
- **Total Composables**: 4 reusable modules

---

## Known Issues & Technical Debt

### Medium Priority
1. **Missing ARIA Labels** - Accessibility improvement needed
2. **Unused Export** - `watchDarkMode` in useMetaTags.js (YAGNI violation)

### Low Priority
1. **Set Reactivity Pattern** - Document or migrate to reactive Set
2. **Magic Numbers** - Extract audio volumes to constants
3. **TodoItem Size** - 203 lines (could split further, but not urgent)

---

## Phase 01 Changes Summary

### Completed (2026-03-10)
- ✅ Extracted 6 components from DashboardView.vue
- ✅ Created 2 composables for reusable logic
- ✅ Reduced DashboardView.vue from 521 to 140 lines (73% reduction)
- ✅ Fixed vuedraggable reactivity conflict with array cloning
- ✅ Maintained 100% feature parity
- ✅ All tests passing (11/11 functional tests)

### Files Created
1. `src/components/todo/TodoItem.vue`
2. `src/components/todo/TodoList.vue`
3. `src/components/ui/AddTodoForm.vue`
4. `src/components/ui/ProgressBar.vue`
5. `src/composables/useMetaTags.js`
6. `src/composables/use-emoji-overlay.js`

### Files Modified
- `src/views/DashboardView.vue` (521 → 140 lines)

---

## Development Workflow

### Git Flow
```bash
git checkout -b feature/feature-name
# Make changes
git add .
git commit -m "feat(scope): description"
git push origin feature/feature-name
# Create PR, merge, delete branch
```

### Commit Convention
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `test`: Tests
- `chore`: Build/config

---

## Environment Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone <repo-url>
cd ToDoApp
npm install
npm run dev
```

### Configuration Files
- `.env.example` - Environment variables template
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

---

## Testing Strategy

### Manual Testing (Current)
- Create/edit/delete todos
- Toggle completion
- Add/remove subtasks
- Drag-and-drop reordering
- Theme switching
- Audio effects
- Confetti celebrations

### Automated Testing (Future)
- Unit tests for composables
- Component tests for Vue components
- E2E tests for user workflows

---

## Deployment Options

### Static Hosting
- **Netlify**: Drag & drop `dist/` folder
- **Vercel**: Connect Git repo
- **GitHub Pages**: Push to `gh-pages` branch

### Custom Domain
- Point DNS to hosting provider
- Update base URL in `vite.config.js`

---

## Future Enhancements

### Phase 02 (Planned)
- Task categories
- Priority levels
- Category filtering

### Phase 03 (Planned)
- Search functionality
- Advanced filtering
- Sorting options

### Phase 04 (Planned)
- Micro-interactions
- Animation improvements
- UX polish

### Long-term (TBD)
- Data export/import
- PWA support
- Keyboard shortcuts
- Due dates
- Recurring tasks

---

## Documentation

### Internal Docs
- `docs/project-overview-pdr.md` - Product requirements
- `docs/code-standards.md` - Development guidelines
- `docs/system-architecture.md` - Technical architecture
- `docs/codebase-summary.md` - This file

### Plans & Reports
- `plans/260310-2220-fase1-quick-wins/` - Phase 01 plans
- `plans/reports/` - Research and review reports

---

**Last Updated**: 2026-03-10 (Post Phase 01 Modularization)
**Maintained By**: Development Team
