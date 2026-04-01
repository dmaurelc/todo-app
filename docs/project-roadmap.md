# Project Roadmap

**Project**: ToDo App + Vecna Mode
**Version**: 1.1.0
**Last Updated**: 2026-03-10

---

## Executive Summary

The ToDo App is currently in **Phase 01 completion** with a solid modular architecture foundation. The roadmap outlines planned enhancements through **Fase 1 (Quick Wins)** focused on productivity features without breaking the existing privacy-first, local-only architecture.

**Current Status**: Phase 01 Complete ✅
**Next Milestone**: Phase 02 (Categories & Priorities)
**Target Completion**: Fase 1 by end of Q2 2026

---

## Progress Overview

### Completed Phases

#### ✅ Phase 01: Modularization (Completed 2026-03-10)
**Status**: COMPLETE
**Effort**: 2.5 hours (Red Team revised)
**Impact**: Foundation for all future development

**Achievements**:
- Reduced DashboardView.vue from 521 to 140 lines (73% reduction)
- Created 6 focused components (max 203 lines)
- Extracted 2 composables for reusable logic
- Fixed critical vuedraggable reactivity bug
- Maintained 100% feature parity
- All functional tests passing (11/11)

**Metrics**:
- Main file size: -73%
- Total components: 6
- Total composables: 4
- Code quality: Significantly improved

**Learnings**:
- Component extraction improves maintainability
- Red Team feedback prevented over-engineering
- Array cloning fixes Vue 3 + vuedraggable reactivity conflict

---

## Active Development: Fase 1 - Quick Wins

### Overview
**Timeline**: March - April 2026
**Goal**: Add high-impact productivity features
**Approach**: Parallel execution of Phases 02-05 after Phase 01 foundation

### Phase 02: Task Categories & Priorities
**Status**: 🔄 Planning Complete, Ready to Start
**Priority**: P1 (High)
**Effort**: 3 hours
**Dependencies**: Phase 01 complete ✅

**Features**:
- Add category labels to todos (Work, Personal, Shopping, etc.)
- Add priority levels (High, Medium, Low)
- Visual indicators for categories (colored badges)
- Visual indicators for priorities (flags/colors)
- Filter by category
- Sort by priority

**Technical Implementation**:
```javascript
// Todo model extension
{
  id: 1710123456789,
  title: "Task title",
  category: "work",           // NEW
  priority: "high",           // NEW
  is_complete: false,
  position: 0,
  subtasks: [...]
}
```

**Components to Create**:
- `CategoryBadge.vue` - Category indicator
- `PriorityFlag.vue` - Priority indicator
- `CategoryFilter.vue` - Filter dropdown
- `SortOptions.vue` - Sort controls

**Success Criteria**:
- Categories saved to localStorage
- Priorities persist across sessions
- Filter/sort UI works smoothly
- No breaking changes to existing todos

**Risk Assessment**: LOW
- Data migration needed for existing todos (add default category/priority)
- UI complexity increases but manageable

---

### Phase 03: Search & Filtering
**Status**: 🔄 Planning Complete
**Priority**: P1 (High)
**Effort**: 2.5 hours
**Dependencies**: Phase 02 complete

**Features**:
- Full-text search across todo titles
- Real-time search results
- Filter by completion status
- Filter by category (from Phase 02)
- Filter by priority (from Phase 02)
- Combined filters (e.g., "high priority work tasks")

**Technical Implementation**:
```javascript
// Search composable
export function useTodoSearch(todos) {
  const searchQuery = ref('');

  const filteredTodos = computed(() => {
    return todos.value.filter(todo =>
      todo.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  return { searchQuery, filteredTodos };
}
```

**Components to Create**:
- `SearchBar.vue` - Search input with icon
- `FilterPanel.vue` - Combined filter controls
- `ActiveFilters.vue` - Display active filters with remove buttons

**Success Criteria**:
- Search works in real-time (<100ms)
- Multiple filters can combine
- Filters can be cleared individually
- Empty states handled gracefully

**Risk Assessment**: LOW
- Performance concern with large lists (mitigate with debounce)
- Filter state management complexity

---

### Phase 04: Micro-interactions & Polish
**Status**: 🔄 Planning Complete
**Priority**: P2 (Medium)
**Effort**: 2 hours
**Dependencies**: Phases 02-03 complete

**Features**:
- Hover effects on todo items
- Smooth transitions for filter changes
- Animation for category/priority changes
- Swipe actions (mobile: left to delete, right to complete)
- Keyboard shortcuts (Ctrl+N for new todo, etc.)
- Better loading states
- Improved empty states with illustrations

**Technical Implementation**:
```css
/* Hover effects */
.todo-item {
  transition: all 0.2s ease;
}

.todo-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Swipe actions */
@media (hover: none) {
  .todo-item {
    touch-action: pan-x;
  }
}
```

**Components to Modify**:
- `TodoItem.vue` - Add hover/swipe interactions
- `AddTodoForm.vue` - Add keyboard shortcut hints
- Empty states - Add illustrations

**Success Criteria**:
- All interactions feel smooth (60fps)
- Keyboard shortcuts documented and working
- Mobile swipe gestures functional
- No jarring transitions

**Risk Assessment**: MEDIUM
- Performance impact from animations
- Cross-browser swipe support varies

---

### Phase 05: Performance Optimization
**Status**: 🔄 Planning Complete
**Priority**: P2 (Medium)
**Effort**: 2 hours
**Dependencies**: Phases 01-04 complete

**Features**:
- Virtual scrolling for large lists (100+ todos)
- Lazy load audio assets
- Optimize re-renders with `v-memo`
- Debounce search input
- Code splitting for better initial load
- Service Worker for offline support (PWA)

**Technical Implementation**:
```javascript
// Virtual scrolling (vue-virtual-scroller)
import { RecycleScroller } from 'vue-virtual-scroller';

// Debounced search
import { useDebounceFn } from '@vueuse/core';
const debouncedSearch = useDebounceFn((query) => {
  searchQuery.value = query;
}, 300);
```

**Performance Targets**:
- Initial load: <500ms (currently ~800ms)
- Search response: <50ms
- Filter change: <100ms
- Scroll with 1000 items: 60fps

**Success Criteria**:
- Lighthouse score >90
- No dropped frames during scroll
- Fast search with large datasets
- PWA installable

**Risk Assessment**: MEDIUM
- Virtual scrolling adds complexity
- Service Worker caching strategy needs care

---

## Future Enhancements (Beyond Fase 1)

### Potential Features (TBD Priority)

#### FR-11: Data Export/Import
**Priority**: P2 (Medium)
**Effort**: 2 hours

**Features**:
- Export todos as JSON
- Export todos as CSV
- Import from JSON/CSV
- Backup/restore functionality

**Benefits**:
- Data portability
- Cross-device migration
- Data ownership reinforcement

---

#### FR-12: PWA Support
**Priority**: P2 (Medium)
**Effort**: 3 hours

**Features**:
- Service Worker for offline mode
- App manifest for installability
- Background sync for failed operations
- Push notifications (optional)

**Benefits**:
- Works without internet
- Installable on desktop/mobile
- Native app-like experience

---

#### FR-13: Keyboard Shortcuts
**Priority**: P3 (Low)
**Effort**: 1.5 hours

**Features**:
- `Ctrl/Cmd + N`: New todo
- `Ctrl/Cmd + F`: Focus search
- `Ctrl/Cmd + /`: Show shortcuts
- `Ctrl/Cmd + D`: Toggle dark mode
- Arrow keys: Navigate todos
- Enter: Toggle selected todo
- Delete: Remove selected todo

**Benefits**:
- Power user productivity
- Reduced mouse dependence

---

#### FR-14: Due Dates & Reminders
**Priority**: P3 (Low)
**Effort**: 4 hours

**Features**:
- Add due date to todos
- Visual indicators for overdue
- Date picker UI
- Reminder notifications (if PWA enabled)

**Benefits**:
- Time-sensitive task management
- Better planning

**Concerns**:
- Notification permission UX
- Date picker complexity

---

#### FR-15: Recurring Tasks
**Priority**: P3 (Low)
**Effort**: 3 hours

**Features**:
- Set recurrence (daily, weekly, monthly)
- Auto-create next instance on completion
- Recurrence pattern UI

**Benefits**:
- Automate repetitive tasks
- Reduce manual entry

**Concerns**:
- UI complexity
- Data model changes needed

---

#### FR-16: Collaboration (Local Network)
**Priority**: P4 (Very Low)
**Effort**: 8+ hours

**Features**:
- Local network sync via WebRTC
- Share todo list with nearby devices
- Conflict resolution

**Benefits**:
- Multi-device sync without cloud
- Privacy maintained (local only)

**Concerns**:
- High complexity
- Requires both devices online
- Conflict resolution difficult

---

## Technical Debt & Improvements

### Known Issues (From Code Review)

#### Medium Priority
1. **Missing ARIA Labels** - Accessibility gap
   - **Impact**: Screen reader users have poor experience
   - **Fix**: Add ARIA labels to all interactive elements
   - **Effort**: 1 hour
   - **Target**: Phase 04

2. **Unused Export in useMetaTags** - YAGNI violation
   - **Impact**: Code bloat, confusion
   - **Fix**: Remove `watchDarkMode` function
   - **Effort**: 5 minutes
   - **Target**: Phase 01 cleanup

#### Low Priority
1. **Set Reactivity Pattern** - Potential future issues
   - **Impact**: Could break if watchers added
   - **Fix**: Document or migrate to `reactive(new Set())`
   - **Effort**: 30 minutes
   - **Target**: Phase 05

2. **Magic Numbers** - Maintainability
   - **Impact**: Hard to understand/tune values
   - **Fix**: Extract audio volumes, durations to constants
   - **Effort**: 30 minutes
   - **Target**: Phase 05

---

## Timeline & Milestones

### Q1 2026 (Completed)
- ✅ Week 1: Project setup & initial implementation
- ✅ Week 2: Vecna Mode & audio effects
- ✅ Week 3: Phase 01 modularization
- ✅ Week 4: Code review & documentation

### Q2 2026 (Planned)
- 🔄 Week 5: Phase 02 - Categories & Priorities
- 🔄 Week 6: Phase 03 - Search & Filtering
- 🔄 Week 7: Phase 04 - Micro-interactions
- 🔄 Week 8: Phase 05 - Performance Optimization
- 🔄 Week 9: Testing & bug fixes
- 🔄 Week 10: Documentation updates
- 🔄 Week 11: Fase 1 release (v1.2.0)

### Q3-Q4 2026 (Exploratory)
- 📅 Evaluate PWA support
- 📅 Consider data export/import
- 📅 Explore keyboard shortcuts
- 📅 Assess due dates feature demand

---

## Success Metrics

### v1.1.0 (Current)
- ✅ Modular architecture established
- ✅ DashboardView.vue reduced 73%
- ✅ All core features functional
- ✅ Zero critical bugs

### v1.2.0 (Fase 1 Target)
- 🎯 Categories & priorities implemented
- 🎯 Search & filtering working
- 🎯 Performance improved 50%
- 🎯 Accessibility score >90

### Long-term Targets
- 📈 User retention: 50% return within 7 days
- 📈 Average session duration: >3 minutes
- 📈 Tasks completed per user: >10/week
- 📈 PWA install rate: >20% of users

---

## Risk Management

### Technical Risks

#### 1. localStorage Quota Exceeded
**Probability**: LOW
**Impact**: HIGH
**Mitigation**:
- Add quota monitoring
- Graceful error handling
- Implement data export/import
- Consider IndexedDB migration

#### 2. Performance Degradation with Large Lists
**Probability**: MEDIUM
**Impact**: MEDIUM
**Mitigation**:
- Virtual scrolling (Phase 05)
- Debounced search
- Optimized re-renders
- Lazy loading

#### 3. Browser Compatibility Issues
**Probability**: LOW
**Impact**: MEDIUM
**Mitigation**:
- Progressive enhancement
- Test on major browsers
- Polyfills for older browsers
- Graceful degradation

### Product Risks

#### 1. Feature Creep
**Probability**: MEDIUM
**Impact**: HIGH
**Mitigation**:
- Strict adherence to roadmap
- YAGNI principle enforcement
- Regular priority reviews
- User feedback before adding features

#### 2. Loss of Privacy-First Focus
**Probability**: LOW
**Impact**: HIGH
**Mitigation**:
- No backend/cloud features
- Clear communication of local-only nature
- User-controlled data export
- Audit dependencies for tracking

---

## Resource Allocation

### Development Team
- **Current**: 1 developer (part-time)
- **Capacity**: ~10 hours/week
- **Phase Duration**: 2-3 weeks per phase

### Development Tools
- **IDE**: VS Code
- **Version Control**: Git + GitHub
- **Build Tool**: Vite
- **Testing**: Manual (future: Vitest)
- **Documentation**: Markdown

---

## Dependencies & Blockers

### External Dependencies
- Vue 3 ecosystem stability
- vuedraggable-next maintenance
- canvas-confetti updates
- Browser localStorage support

### Internal Dependencies
- Phase 02 → Phase 03 (Categories needed for filtering)
- Phase 03 → Phase 04 (Search needed for polish)
- All phases → Phase 05 (Optimization needs features)

### Potential Blockers
- None identified (all dependencies under control)

---

## Communication Plan

### Stakeholder Updates
- **Weekly**: Progress summary in commit messages
- **Per Phase**: Release notes in CHANGELOG.md
- **Per Milestone**: Update README.md with new features

### Documentation Updates
- **After Each Phase**: Update relevant docs
- **Code Changes**: Update codebase-summary.md
- **Architecture Changes**: Update system-architecture.md
- **New Features**: Update project-overview-pdr.md

---

## Open Questions

1. **Should we implement PWA support in Fase 1?** (Currently Phase 05)
   - **Pros**: Offline mode, installability
   - **Cons**: Additional complexity, caching strategy
   - **Decision**: Evaluate after Phase 05 performance metrics

2. **Is WCAG 2.1 AA compliance required?**
   - **Current**: Partial compliance
   - **Gap**: Missing ARIA labels
   - **Decision**: Add in Phase 04 if time permits

3. **Should we add data export/import before Fase 1 completion?**
   - **Pros**: Data portability, backup capability
   - **Cons**: Additional UI, not core to productivity
   - **Decision**: Postpone to post-Fase 1 unless user demand

4. **Are internationalization requirements planned?**
   - **Current**: Spanish/English mix
   - **Gap**: No i18n system
   - **Decision**: Not in scope for Fase 1, evaluate later

---

## Version Roadmap

### v1.1.0 (Current - Released 2026-03-10)
- ✅ Core todo functionality
- ✅ Vecna Mode implementation
- ✅ Drag-and-drop reordering
- ✅ Subtask system
- ✅ Phase 01 modularization

### v1.2.0 (Planned - Q2 2026)
- 🔄 Categories & priorities
- 🔄 Search & filtering
- 🔄 Micro-interactions
- 🔄 Performance optimization
- 🔄 Complete Fase 1

### v1.3.0 (Exploratory - Q3 2026)
- 📅 PWA support
- 📅 Data export/import
- 📅 Keyboard shortcuts
- 📅 Accessibility improvements

### v2.0.0 (Future - TBD)
- 📅 Due dates & reminders
- 📅 Recurring tasks
- 📅 Advanced analytics
- 📅 Collaboration features (maybe)

---

## Next Steps

### Immediate (This Week)
1. ✅ Complete Phase 01 documentation
2. ✅ Create this roadmap
3. 🔄 Begin Phase 02 planning implementation

### Short-term (Next 2 Weeks)
1. Implement categories feature
2. Implement priorities feature
3. Add category/priority filters
4. Test and refine

### Medium-term (Next Month)
1. Complete search functionality
2. Add micro-interactions
3. Optimize performance
4. Prepare for v1.2.0 release

---

**Last Updated**: 2026-03-10
**Roadmap Owner**: Development Team
**Review Frequency**: Weekly during active development
**Approval Status**: Active v1.0
