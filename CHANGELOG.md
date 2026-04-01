# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-12-17

### ✨ Added

- **Vecna Mode (Guest)**: Tema oscuro completo "Upside Down" con partículas de ceniza roja/negra.
- **Audio Effects**:
  - `thunder.mp3`: Suena al entrar al modo invitado.
  - `evil-roar.mp3`: Suena al completar todas las tareas en modo invitado.
- **Dynamic Favicon**: El icono de la pestaña cambia dinámicamente:
  - Normal: ✅
  - Vecna: 👹
- **Particle System**: Efecto de partículas de ceniza adaptativo (Verde en normal, Rojo en Vecna).

### ⚡ Improved

- **Task Sorting**: Las nuevas tareas ahora se agregan al final de la lista en lugar del principio.
- **Toast Notifications**: Diseño limpio y sin bordes duplicados. Estilos específicos para cada tema.
- **UI/UX**: Ajustes de padding en notificaciones y centrado de textos.

### 🐛 Fixed

- Solucionado error de runtime `expandedTodos undefined`.
- Corregido conflicto de re-declaración de variables en `DashboardView`.
- Restauradas funciones `loading` y `getSession` perdidas durante refactorización.

## [0.1.0] - 2025-12-10

- Initial Release con Supabase Auth y CRUD básico.
