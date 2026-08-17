# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### 🗑️ Removed

- **Modo Mundial 2026**: eliminado el modo World Cup completo (vista WorldCup, API client de RapidAPI, composable de fixtures, botón de globo en el header y sección de API key en Ajustes).
- **Infraestructura de tests vitest** (solo existía para el modo mundial) y logo `vue.svg` sin uso.

### ⚡ Improved

- **Dependencias actualizadas a latest**: vue 3.5.41, vue-router 5.2.0, vite 8.2.1, tailwindcss 4.3.3, Tauri api/cli 2.11.x y plugins de store.

### 🐛 Fixed

- La sección "Acerca de" de Ajustes ya no muestra el mensaje de fallback en web; ahora solo se renderiza dentro de la app Tauri (donde hay información nativa).

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
