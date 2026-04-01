# Brainstorm: ToDoApp Mejoras Showcase

**Fecha**: 2026-03-10
**Objetivo**: Portafolio/Showcase - Impresionar con visual y UX premium
**Enfoque**: Funcionalidades Core + UX/UI + Rendimiento + Código
**Timeline**: Quick Wins + Medio Plazo

---

## Estado Actual Analizado

### Stack
- Vue 3 + Vite + Tailwind v4
- LocalStorage-only (sin backend por ahora)
- Single-view architecture (DashboardView.vue ~520 líneas)
- Audio reactivo, confetti, drag&drop, subtareas

### Fortalezas
- UX temática única (Vecna mode)
- Animaciones fluidas
- Drag&drop funcional
- Subtareas con autocompletado

### Debilidades
- DashboardView.vue monolítico (>500 líneas)
- Sin testing
- Sin categorías/prioridades
- Sin filtros/búsqueda
- Sin fechas/vencimiento
- UI no responsive real
- Sin sistema de temas extensible

---

## Ideas por Categoría

### 1. FUNCIONALIDADES CORE

#### 🔥 Quick Wins (1-2 sesiones)

**1.1 Prioridades Visuales**
- Implementar niveles: Baja (🟢), Media (🟡), Alta (🔴), Urgente (🔥)
- Gradiente de colores en task card según prioridad
- Badge animado para tareas urgentes
- **Impacto**: Alto | **Complejidad**: Baja

**1.2 Categorías con Iconos**
- Categorías: Trabajo 💼, Personal 🏠, Salud 💪, Ideas 💡, Otros 📌
- Selector visual en creación de tarea
- Filtrado por categoría con animación
- Badge con icono en cada tarea
- **Impacto**: Alto | **Complejidad**: Baja

**1.3 Fechas de Vencimiento**
- DatePicker nativo (input type="date")
- Tareas vencidas en rojo
- Próximas a vencer en amarillo (<24hs)
- Badge de "Vence hoy" / "Vencida"
- **Impacto**: Medio-Alto | **Complejidad**: Baja

**1.4 Notas/Descripción Extendida**
- Collapsible textarea en cada tarea
- Markdown básico (bold, italic, lists)
- Preview vs Edit mode
- **Impacto**: Medio | **Complejidad**: Baja

**1.5 Búsqueda en Tiempo Real**
- Input de búsqueda con debounce
- Filtra por título + notas
- Highlight del texto matcheado
- **Impacto**: Alto | **Complejidad**: Baja

#### 🚀 Medio Plazo (3-5 sesiones)

**1.6 Pomodoro Timer Integrado**
- Timer 25/5 por tarea
- Progress circular animado
- Notificación audio al terminar
- Stats de pomodoros por tarea
- **Impacto**: Muy Alto (Showcase) | **Complejidad**: Media

**1.7 Vista Kanban**
- Columnas: Pendiente, En Progreso, Completado
- Drag entre columnas
- Toggle Lista/Kanban
- **Impacto**: Alto | **Complejidad**: Media

**1.8 Etiquetas (Tags) Personalizadas**
- Sistema de tags multicolor
- Autocomplete al crear
- Filtrado multiple por tags
- **Impacto**: Medio | **Complejidad**: Media

**1.9 Estadísticas Visuales**
- Chart.js o SVG nativo
- Gráfico de tareas completadas (7 días)
- Distribución por categoría
- Streak de días productivos
- **Impacto**: Alto (Showcase) | **Complejidad**: Media-Alta

**1.10 Temas Personalizables**
- Sistema de themes extensible
- 6+ presets: Nord, Dracula, Solarized, etc.
- Custom theme editor (color picker)
- Persistencia en localStorage
- **Impacto**: Alto (Showcase) | **Complejidad**: Media

---

### 2. UX/UI MEJORAS

#### 🔥 Quick Wins

**2.1 Micro-interacciones Premium**
- Hover effects mejorados
- Scale animation en checkboxes
- Ripple effect en botones (Material)
- Skeleton loading en vez de "Cargando..."
- **Impacto**: Alto | **Complejidad**: Baja

**2.2 Empty States Ilustrados**
- Lottie o SVG animado
- Mensajes contextuales ("¡Tu primera tarea te espera!")
- CTA animado
- **Impacto**: Medio | **Complejidad**: Baja

**2.3 Toast Notifications Premium**
- Progress bar en toast
- Iconos contextuales
- Stack inteligente (máximo 3)
- Action buttons (Undo delete)
- **Impacto**: Medio | **Complejidad**: Baja

**2.4 Progress Bar Animada**
- Animación de filling con gradiente
- Glow effect al 100%
- Partículas al completar todas
- **Impacto**: Medio | **Complejidad**: Baja

**2.5 Context Menu (Click Derecho)**
- Menú en tarea: Editar, Duplicar, Mover, Archivar
- Keyboard shortcuts (Ctrl+D duplicar)
- **Impacto**: Medio-Alto | **Complejidad**: Media

#### 🚀 Medio Plazo

**2.6 Responsive Mobile-First**
- Hamburger menu en mobile
- Bottom navigation bar
- Swipe gestures para completar
- Pull-to-refresh
- **Impacto**: Alto | **Complejidad**: Media-Alta

**2.7 Animaciones de Entrada/Salida**
- Vue TransitionGroup
- Stagger animations en lista
- Flip animations para drag&drop
- **Impacto**: Alto (Showcase) | **Complejidad**: Media

**2.8 Onboarding Tour**
- Intro.js o custom
- Highlights con tooltips
- Skip + Next
- Persistencia (mostrar solo 1ra vez)
- **Impacto**: Medio | **Complejidad**: Media

**2.9 Dark/Light Toggle Smooth**
- Page transition effect
- Hue rotation durante cambio
- Particles change color
- **Impacto**: Medio | **Complejidad**: Baja-Media

**2.10 Accessibility (A11y)**
- ARIA labels
- Keyboard navigation completa
- Screen reader support
- Focus visible indicators
- **Impacto**: Medio (Profesionalismo) | **Complejidad**: Media

---

### 3. RENDIMIENTO

#### 🔥 Quick Wins

**3.1 Lazy Loading Assets**
- Audio files preload opcional
- Optimizar MP3 (bitrate 64kbps)
- O cambiar a WebM/AAC
- **Impacto**: Medio | **Complejidad**: Baja

**3.2 Debounce Inputs**
- Ya hay debounce en búsqueda (implementar)
- Throttle en drag events
- **Impacto**: Medio | **Complejidad**: Baja

**3.3 CSS Optimizations**
- Tailwind purge (ya viene por defecto)
- Extract critical CSS
- CSS containment para animaciones
- **Impacto**: Medio | **Complejidad**: Baja

**3.4 Virtual Scrolling**
- Para listas >100 tareas
- Usar vue-virtual-scroller
- **Impacto**: Bajo (sino hay muchas tareas) | **Complejidad**: Media

#### 🚀 Medio Plazo

**3.5 Service Worker Caching**
- PWA capabilities
- Offline mode
- Cache-first strategy
- **Impacto**: Alto | **Complejidad**: Media

**3.6 IndexedDB vs LocalStorage**
- Migrar a IndexedDB (más robusto)
- Dexie.js wrapper
- Async operations
- **Impacto**: Medio | **Complejidad**: Media

**3.7 Code Splitting**
- Lazy load views
- Dynamic imports para componentes pesados
- **Impacto**: Medio | **Complejidad**: Baja-Media

---

### 4. ORGANIZACIÓN CÓDIGO + TESTING

#### 🔥 Quick Wins

**4.1 Modularizar DashboardView.vue**
- Extraer componentes:
  - `TodoItem.vue` (~150 líneas)
  - `SubtaskList.vue` (~80 líneas)
  - `ProgressBar.vue` (~30 líneas)
  - `AddTodoForm.vue` (~50 líneas)
  - `TodoList.vue` (~100 líneas)
- **Impacto**: Alto (Mantenibilidad) | **Complejidad**: Media

**4.2 Extract Composables**
- `useConfetti.js` (lógica confetti)
- `useAudio.js` (audio management)
- `useProgress.js` (progress bar)
- **Impacto**: Alto | **Complejidad**: Baja

**4.3 Type Safety con JSDoc**
- Agregar tipos en composables
- Autocompletado mejorado
- **Impacto**: Medio | **Complejidad**: Baja

**4.4 Constants File**
- `constants/themes.js`
- `constants/priorities.js`
- `constants/categories.js`
- **Impacto**: Medio | **Complejidad**: Baja

#### 🚀 Medio Plazo

**4.5 Unit Testing (Vitest)**
- Test composables
- Test util functions
- Cobertura >80%
- **Impacto**: Alto (Profesionalismo) | **Complejidad**: Media

**4.6 Component Testing (Vue Test Utils)**
- Test TodoItem interactions
- Test drag&drop mocking
- Test subtask toggling
- **Impacto**: Alto | **Complejidad**: Media-Alta

**4.7 E2E Testing (Playwright)**
- Critical user flows
- Cross-browser testing
- **Impacto**: Medio | **Complejidad**: Alta

**4.8 Folder Structure Estandar**
```
src/
├── components/
│   ├── todo/
│   │   ├── TodoItem.vue
│   │   ├── TodoList.vue
│   │   └── SubtaskList.vue
│   ├── ui/
│   │   ├── ProgressBar.vue
│   │   └── AddTodoForm.vue
│   └── layout/
├── composables/
├── constants/
├── utils/
├── stores/ (Pinia si crece)
└── views/
```
- **Impacto**: Alto | **Complejidad**: Media

**4.9 Linting + Formatting**
- ESLint + Prettier
- Husky pre-commit hooks
- **Impacto**: Medio | **Complejidad**: Baja

---

## Roadmap Recomendado (Showcase Impact)

### Fase 1: Quick Wins de Alto Impacto (2-3 sesiones)
1. Modularizar DashboardView.vue
2. Prioridades visuales
3. Categorías con iconos
4. Búsqueda en tiempo real
5. Micro-interacciones premium

### Fase 2: Features Showcase (3-4 sesiones)
1. Pomodoro Timer
2. Vista Kanban
3. Estadísticas visuales
4. Responsive mobile
5. Onboarding tour

### Fase 3: Testing + Profesionalización (2-3 sesiones)
1. Unit testing
2. Component testing
3. Linting + Formatting
4. Service Worker (PWA)

---

## Trade-offs Analizados

### Sí Implementar (Alto ROI)
- **Pomodoro**: Diferenciador único, showcase wow
- **Kanban**: Demuestra skills de drag&drop avanzado
- **Prioridades/Categorías**: Core de cualquier todo app
- **Modularización**: Necesario antes que crezca más

### Quizás Más Tarde (Bajo ROI para Showcase)
- **IndexedDB**: LocalStorage suficiente para demo
- **Virtual Scrolling**: Sino hay miles de tareas
- **E2E Testing**: Overkill para proyecto personal

### No Implementar (Anti-YAGNI)
- **Backend sync**: Dijiste "por ahora no"
- **Multi-user**: Out of scope
- **Recurrencia (tareas repetitivas)**: Complejidad alta, valor medio

---

## Métricas de Éxito

### Funcionalidades
- [ ] Categorías funcionando con filtros
- [ ] Prioridades con visual distintivo
- [ ] Búsqueda <100ms
- [ ] Pomodoro con audio working

### UX/UI
- [ ] Lighthouse Performance >90
- [ ] Lighthouse Accessibility >85
- [ ] Mobile usable (320px+)
- [ ] Animaciones 60fps

### Código
- [ ] Componentes <150 líneas
- [ ] Tests coverage >60%
- [ ] Sin ESLint errors
- [ ] TypeScript/JSDoc en composables

---

## Próximos Pasos

¿Quieres que cree un plan de implementación detallado para alguna fase en específico?

**Opciones**:
1. **Plan Fase 1** (Quick Wins Alto Impacto)
2. **Plan Modularización** (Arquitectura primero)
3. **Plan Pomodoro** (Feature showcase)
4. **Plan Testing Suite** (Profesionalización)

O dime qué feature te llama más la atención para hacer un deep dive.
