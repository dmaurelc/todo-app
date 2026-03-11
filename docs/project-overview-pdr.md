# Project Overview & Product Development Requirements (PDR)

**Project**: ToDo App + Vecna Mode
**Version**: 1.1.0
**Last Updated**: 2026-03-10
**Status**: Active Development

---

## Executive Summary

A modern, immersive task management application with a unique dark mode theme inspired by Stranger Things. The app provides core todo functionality (create, complete, subtasks, drag-and-drop reordering) with an engaging "Vecna Mode" that transforms the UI into a dark, atmospheric experience with particle effects, ambient audio, and themed celebrations.

**Key Differentiator**: Local-only storage (no backend/cloud) ensures complete privacy while delivering a feature-rich experience typically found in cloud-based apps.

---

## Product Vision

### Core Value Proposition
- **Privacy First**: All data stored locally in browser localStorage
- **Immersive Experience**: Two distinct themes (Green Light Mode vs Vecna Dark Mode)
- **Simplicity**: No signup, no sync, just open and use
- **Engagement**: Audio/visual feedback makes task completion satisfying

### Target Users
- Individual users who want simple, private task management
- Privacy-conscious users who avoid cloud-based todo apps
- Users who appreciate gamification and thematic UI experiences

---

## Functional Requirements

### Core Features (v1.1.0 - Implemented)

#### FR-01: Task Management
- Create new tasks with title
- Mark tasks as complete/incomplete
- Delete tasks
- **Status**: ✅ Implemented

#### FR-02: Subtasks
- Add subtasks to any task
- Mark subtasks as complete/incomplete
- Auto-complete parent task when all subtasks done
- **Status**: ✅ Implemented

#### FR-03: Task Organization
- Drag-and-drop reordering of tasks
- Persistent position changes
- New tasks added to end of list
- **Status**: ✅ Implemented

#### FR-04: Visual Feedback
- Progress bar showing completion percentage
- Confetti celebration when all tasks complete
- Different confetti styles per mode (green vs red/black)
- **Status**: ✅ Implemented

#### FR-05: Theme Switching
- Light Mode (Green Theme): Calming, productivity-focused
- Dark Mode (Vecna/Upside Down): Atmospheric, particle effects
- Toggle between modes with state persistence
- **Status**: ✅ Implemented

#### FR-06: Audio Effects
- Thunder sound on entering dark mode
- Evil roar sound on completing all tasks (dark mode only)
- **Status**: ✅ Implemented

#### FR-07: Dynamic UI Elements
- Favicon changes based on mode (✅ vs 👹)
- Emoji overlays for validation warnings
- Emoji overlays for un-checking completed tasks
- **Status**: ✅ Implemented

### Planned Features (Future Phases)

#### FR-08: Task Categories (Phase 02)
- Tag tasks with categories (Work, Personal, etc.)
- Filter by category
- **Status**: 🔄 Planned

#### FR-09: Task Priorities (Phase 02)
- High/Medium/Low priority levels
- Visual indicators for priority
- **Status**: 🔄 Planned

#### FR-10: Search (Phase 04)
- Full-text search across tasks
- Filter by completion status
- **Status**: 🔄 Planned

---

## Non-Functional Requirements

### NFR-01: Performance
- **Requirement**: App loads in <2 seconds on 3G
- **Current Status**: ✅ Meets requirement (~800ms typical load)

### NFR-02: Data Persistence
- **Requirement**: Data persists across browser sessions
- **Implementation**: localStorage with JSON serialization
- **Current Status**: ✅ Implemented

### NFR-03: Cross-Browser Compatibility
- **Requirement**: Works on Chrome, Firefox, Safari, Edge
- **Current Status**: ✅ Tested on Chrome/Safari

### NFR-04: Responsive Design
- **Requirement**: Mobile-friendly layout (320px+)
- **Current Status**: ✅ Implemented with Tailwind CSS

### NFR-05: Accessibility
- **Requirement**: Keyboard navigation for all features
- **Current Status**: ⚠️ Partial (keyboard works, ARIA labels missing)
- **Target**: WCAG 2.1 AA compliance

### NFR-06: Code Quality
- **Requirement**: Components <200 lines, clear separation
- **Current Status**: ✅ Phase 01 modularization complete (max 203 lines)

### NFR-07: Bundle Size
- **Requirement**: Initial load <500KB gzipped
- **Current Status**: ✅ Meets requirement

---

## Technical Stack

### Frontend Framework
- **Vue 3** (Composition API)
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)

### Key Libraries
- **vue-draggable-next**: Drag-and-drop functionality
- **canvas-confetti**: Celebration effects
- **LocalStorage API**: Data persistence

### Architecture
- **Component-Based**: Modular Vue components
- **Composables Pattern**: Reusable logic with Composition API
- **Local-Only**: No backend, no API calls

---

## Data Model

### Todo Object Structure
```javascript
{
  id: number,              // Unique timestamp-based ID
  title: string,           // Task title
  is_complete: boolean,    // Completion status
  position: number,        // Display order
  subtasks: Array<{
    id: number,
    title: string,
    is_complete: boolean
  }>,
  created_at: string       // ISO timestamp
}
```

### Storage Schema
- **Key**: `todoapp_todos`
- **Format**: JSON array of todo objects
- **Key**: `todoapp_darkMode`
- **Format**: Boolean

---

## User Stories

### Primary User Journey
1. User opens app → sees empty state with call-to-action
2. User types first task → sees progress bar update
3. User completes task → sees confetti celebration
4. User toggles dark mode → hears thunder, sees theme change
5. User adds subtasks → sees validation when trying to complete parent
6. User drags tasks → reordering persists across sessions

### Edge Cases Handled
- Empty todo title → Blocked with validation
- Complete parent with incomplete subtasks → Warning emoji + auto-expand
- Drag to same position → No-op
- localStorage quota exceeded → Graceful error handling
- Audio autoplay blocked → Silent fail with console log

---

## Success Metrics

### v1.1.0 Release Metrics
- **Modularization**: DashboardView.vue reduced 73% (521 → 140 lines)
- **Component Count**: 6 focused components (max 203 lines)
- **Composables**: 4 reusable logic modules
- **Test Coverage**: 100% feature parity maintained

### Future Targets
- **Load Time**: <1s on 4G
- **Accessibility**: WCAG 2.1 AA compliant
- **Bundle Size**: <400KB gzipped
- **User Retention**: 50% return within 7 days (to be measured)

---

## Dependencies & Constraints

### External Dependencies
- **Internet**: Required only for initial load (CDN for assets)
- **Browser**: Must support localStorage and ES6+
- **Device**: Any device with modern browser

### Technical Constraints
- No backend API (localStorage only)
- No user authentication
- No cloud synchronization
- No offline service worker (yet)

### Business Constraints
- Single developer team
- Part-time development effort
- No commercial monetization planned

---

## Risk Assessment

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| localStorage quota exceeded | High | Low | Add quota monitoring + warning |
| Browser incompatibility | Medium | Low | Progressive enhancement approach |
| Audio autoplay policies | Low | High | Graceful degradation (silent fail) |

### Product Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Limited feature set vs competitors | Medium | Medium | Focus on privacy + niche theme appeal |
| Data loss if browser cache cleared | High | Medium | Add export/import functionality (future) |

---

## Development Roadmap

### Completed (v1.1.0)
- ✅ Phase 01: Modularization & Component Architecture
- ✅ Core todo functionality
- ✅ Vecna Mode implementation
- ✅ Drag-and-drop reordering
- ✅ Subtask system with validation

### In Progress (Fase 1 - Quick Wins)
- 🔄 Phase 02: Task Categories & Priorities
- 🔄 Phase 03: Search & Filtering
- 🔄 Phase 04: Micro-interactions & Animations
- 🔄 Phase 05: Performance Optimization

### Future Enhancements (TBD)
- Data export/import (JSON/CSV)
- Keyboard shortcuts
- PWA support (offline mode)
- Task due dates
- Recurring tasks

---

## Open Questions

1. **Should we add data export/import?** (Priority: Medium - mitigates data loss risk)
2. **Is WCAG 2.1 AA compliance a requirement?** (Current: Partial compliance)
3. **Should we implement PWA offline support?** (Would enhance local-only value prop)
4. **Are there internationalization requirements?** (Currently Spanish/English mix)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-03-10 | Clean initial commit, Vecna Mode complete |
| 0.2.0 | 2025-12-17 | Vecna Mode, Audio & Task Sorting |
| 0.1.0 | 2025-12-16 | Initial MVP |

---

**Document Owner**: Development Team
**Review Frequency**: Weekly during active development
**Approval Status**: Draft v1.0
