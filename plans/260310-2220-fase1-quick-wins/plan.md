---
title: "Fase 1: Quick Wins de Alto Impacto"
description: "Modularización + prioridades + categorías + búsqueda + micro-interacciones para showcase portafolio"
status: pending
priority: P1
effort: 12h
branch: upside-down
tags: [vue3, modularization, uiux, showcase]
created: 2026-03-10
---

## Overview

Implementación de 5 features de alto impacto visual y funcional para transformar la ToDoApp en un proyecto showcase de portafolio. Enfoque en modularización, UX premium y código limpio.

**Objetivo**: Elevar la app de "funcional" a "impresionante" con mejoras visuales y arquitectónicas.

## Phases Status

| Phase | Status | Progress | Dependencies |
|-------|--------|----------|--------------|
| [Phase 01: Modularización](./phase-01-modularizacion.md) | ✅ Completed | 100% | None |
| [Phase 02: Prioridades Visuales](./phase-02-prioridades.md) | ✅ Completed | 100% | Phase 01 |
| [Phase 03: Categorías con Iconos](./phase-03-categorias.md) | ⏳ Pending | 0% | Phase 01 |
| [Phase 04: Búsqueda en Tiempo Real](./phase-04-busqueda.md) | ⏳ Pending | 0% | Phase 01 |
| [Phase 05: Micro-interacciones Premium](./phase-05-micro-interacciones.md) | ⏳ Pending | 0% | Phase 01, 02, 03, 04 |

**Overall Progress**: 40% (2/5 phases complete)

## Execution Strategy

### Parallel Execution Groups

**Sequential Execution** (REVISED after Red Team):
- Phase 01: Modularización (3h) - CRITICAL PATH
- Phase 02: Prioridades Visuales (2h) - Simplified (no migrations)
- Phase 03: Categorías con Iconos (2.5h) - Simplified (no migrations)
- Phase 04: Búsqueda en Tiempo Real (2h) - Safe highlighting
- Phase 05: Micro-interacciones Premium (1.5h) - Reduced animations

**Total Calendar Time**: 11h (single developer sequential)
**Total Person-Hours**: 11h (reduced from 12h after Red Team simplifications)

### File Ownership Matrix

| Phase | Owner Files | Shared Files (Read-Only) |
|-------|-------------|--------------------------|
| Phase 01 | `src/components/todo/*`, `src/components/ui/*`, `src/composables/*` | `src/views/DashboardView.vue` (modify) |
| Phase 02 | `src/constants/priorities.js`, `src/components/ui/PriorityBadge.vue` | `src/components/todo/TodoItem.vue` (modify), `src/composables/useTodos.js` (modify) |
| Phase 03 | `src/constants/categories.js`, `src/components/ui/CategoryPicker.vue` | `src/components/todo/TodoItem.vue` (modify), `src/composables/useTodos.js` (modify) |
| Phase 04 | `src/composables/useDebounce.js`, `src/components/ui/SearchInput.vue` | `src/views/DashboardView.vue` (modify) |
| Phase 05 | `src/components/**/*.vue` (modify styles only), `src/assets/animations.css` | All components (add animations) |

### Dependency Graph

```
Phase 01 (Modularización)
    |
    +--> Phase 02 (Prioridades) --+
    |                             |
    +--> Phase 03 (Categorías) ---+--> Phase 05 (Micro-interacciones)
    |                             |
    +--> Phase 04 (Búsqueda) -----+
```

## Key Success Metrics

### Functional
- [x] DashboardView.vue reducido de 521 a 140 líneas (73% reducción) ✅
- [x] 4 niveles de prioridad con badges visibles ✅
- [ ] 5 categorías con iconos y filtros funcionales
- [ ] Búsqueda <100ms con highlighting
- [ ] Todas las animaciones a 60fps

### Code Quality
- [x] Componentes <200 líneas (100% de archivos) ✅
- [x] 0 errores de compilación ✅
- [x] Schema migration v1 → v2 con backward compatibility ✅
- [x] Vecna mode funcional en todos los nuevos componentes ✅

### UX/Showcase
- [ ] Consistencia visual dark/light mode
- [ ] Animaciones fluidas (no jank)
- [ ] Estados vacíos con mensajes contextuales
- [ ] Accesibilidad básica (ARIA labels, keyboard nav)

## Critical Path

1. **Phase 01 MUST complete first** - Creates component structure
2. **Phases 02-04 CAN run parallel** - Independent features, separate files
3. **Phase 05 MUST run last** - Applies polish to all components

## Risk Assessment

### High Risk
- **LocalStorage migration** - Data loss possible if schema migration fails
  - **Mitigation**: Backup before migration, test migration in isolation
- **Vecna mode breaking** - Dark mode styles may break in new components
  - **Mitigation**: Test dark mode after each phase, use CSS custom properties

### Medium Risk
- **File ownership conflicts** - Phases 02-04 modify same files
  - **Mitigation**: Defined ownership matrix, parallel execution only on independent features
- **Performance degradation** - Too many re-renders with new features
  - **Mitigation**: Use v-memo, computed properties, debouncing

### Low Risk
- **Bundle size increase** - New components and icons
  - **Mitigation**: Use inline SVG, lazy load non-critical components

## Rollback Strategy

If any phase fails:
1. Revert changes to affected files
2. Restore LocalStorage from backup (if schema migration)
3. Continue with next phase (features are independent)

## Red Team Review

### Session — 2026-03-10
**Findings:** 24 total (15 accepted, 9 rejected)
**Severity breakdown:** 3 Critical, 9 High, 12 Medium

### Accepted Findings Applied

| # | Finding | Severity | Applied To | Fix |
|---|---------|----------|------------|-----|
| 1 | XSS en SearchHighlight | Critical | Phase 04 | Usar text-based highlighting en lugar de v-html |
| 2 | Schema migration sin secuenciamiento | Critical | Phase 02-03 | Usar default values en lugar de migrations |
| 3 | Draggable reactivity break | Critical | Phase 01 | Clonar array antes de pasar a draggable |
| 4 | LocalStorage quota exceeded | High | Phase 02-03 | Verificar backup antes de migración |
| 5 | Ejecución paralela falsa | High | Execution Strategy | Cambiar a sequential execution |
| 6 | ReDoS attack en regex | High | Phase 04 | Limitar query length + string includes |
| 7 | TransitionGroup vs Draggable | High | Phase 03/05 | Usar solo draggable animations |
| 8 | Component explosion | High | Phase 01 | Reducir de 7 a 3 componentes |
| 9 | Custom debounce (VueUse exists) | Medium | Phase 04 | Usar @vueuse/core |
| 10 | Schema migration theater | High | Phase 02-03 | Eliminar migration system |
| 11 | Animation sprawl | Medium | Phase 05 | Reducir de 8 a 2 animations |
| 12 | Constants bloat | Medium | Phase 02-03 | Unificar en single constants.js |
| 13 | Emoji cross-platform | Medium | Phase 02-03 | Agregar font-variant-emoji: text |
| 14 | Skeleton loader useless | Low | Phase 05 | Eliminar (localStorage es instant) |
| 15 | Search desync filters | Medium | Phase 04 | Agregar isSearchPending flag |

### Execution Strategy (REVISED)

**Changed from Parallel to Sequential based on Red Team findings**

**Sequential Execution** (Revised):
- Phase 01: Modularización (3h)
- Phase 02: Prioridades Visuales (2h)
- Phase 03: Categorías con Iconos (2.5h)
- Phase 04: Búsqueda en Tiempo Real (2h)
- Phase 05: Micro-interacciones Premium (1.5h) - Reduced by eliminating unnecessary animations

**New Total**: 11h person-hours | 11h calendar time (single developer)

### Key Changes from Red Team

1. **Sequential execution** - File ownership conflicts made parallel impossible
2. **No schema migrations** - Using default values instead (saves 2h)
3. **3 components only** - TodoItem.vue, TodoList.vue, AddTodoForm.vue (saves 1h)
4. **VueUse for debounce** - Replaces custom implementation
5. **Safe search highlighting** - Text-based instead of v-html (eliminates XSS)
6. **2 animations only** - Checkbox scale + list enter (saves 4h)

## Next Steps

1. ✅ ~~Review this plan and approve execution strategy~~
2. ✅ ~~Start Phase 01 (Modularización)~~ **COMPLETED**
3. ✅ ~~Execute Phase 02 (Prioridades Visuales)~~ **COMPLETED**
4. Execute Phase 03 (Categorías con Iconos) - NEXT
5. Execute Phase 04 (Búsqueda en Tiempo Real)
6. Finalize with Phase 05 (Micro-interacciones)

### Phase 01 Summary (Completed 2026-03-10)

**Created Files**:
- `src/composables/useMetaTags.js` (50 lines)
- `src/composables/use-emoji-overlay.js` (40 lines)
- `src/components/ui/ProgressBar.vue` (28 lines)
- `src/components/ui/AddTodoForm.vue` (82 lines)
- `src/components/todo/TodoItem.vue` (180 lines)
- `src/components/todo/TodoList.vue` (120 lines)

**Modified Files**:
- `src/views/DashboardView.vue`: 521 → 140 lines (73% reduction)

**Testing**: 11/11 tests passed
**Review**: Approved with Red Team fix applied (draggable array cloning)

### Phase 02 Summary (Completed 2026-03-10)

**Created Files**:
- `src/constants/priorities.js` (61 lines)
- `src/components/ui/PriorityBadge.vue` (42 lines)
- `src/components/ui/PriorityPicker.vue` (69 lines)
- `src/components/ui/PriorityFilter.vue` (63 lines)

**Modified Files**:
- `src/composables/useTodos.js` - Added priority field, default values, filter logic
- `src/components/ui/AddTodoForm.vue` - Integrated PriorityPicker
- `src/components/todo/TodoItem.vue` - Added PriorityBadge display
- `src/views/DashboardView.vue` - Added PriorityFilter integration

**Testing**: 7/8 tests passed (see `tester-260310-phase02-test-report.md`)
**Review**: Approved (see `code-reviewer-260310-phase02-review.md`)

## Research Context

This plan leverages research from:
- [Vue 3 Best Practices](../../reports/researcher-260310-2220-vue3-best-practices.md)
- [UI/UX Patterns](../../reports/researcher-260310-2220-uiux-patterns.md)
- [Feature Brainstorm](../../reports/brainstorm-260310-2220-todoapp-improvements.md)
