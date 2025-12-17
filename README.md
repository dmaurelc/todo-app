# 📝 ToDo App + Vecna Mode 👹

Una aplicación de gestión de tareas inmersiva, moderna y con un secreto oscuro. Gestiona tus pendientes diarios con estilo o entra al **Upside Down**.

## ✨ Características

### 🌟 Experiencia Core

- **Modo Invitado (Upside Down)**: Una experiencia temática oscura con efectos de partículas, sonidos ambientales de tormenta y una estética "Vecna" inspirada en Stranger Things.
- **Modo Normal (Green Theme)**: Interfaz relajante en tonos esmeralda para máxima productividad.
- **Sincronización en la Nube**: Regístrate para guardar tus tareas en la nube y acceder desde cualquier lugar (Powered by Supabase).

### 🚀 Funcionalidades Avanzadas

- **Drag & Drop**: Reordena tus tareas simplemente arrastrándolas. Las nuevas tareas se agregan inteligentemente al final de la lista.
- **Subtareas Inteligentes**:
  - Divide tareas complejas en pasos.
  - **Autocompletado**: La tarea padre se completa automáticamente al finalizar todas las subtareas.
  - **Validación**: Alerta animada (🚨/💀) si intentas completar una tarea con pasos pendientes.
- **Feedback Sensorial**:
  - **Favicon Dinámico**: Cambia según el modo (✅ vs 👹).
  - **Audio Reactivo**: Truenos al entrar al modo invitado y un _Rugido Maligno_ al completar todas las tareas en el Upside Down.
  - **Visuales**: Confetti temático (Verde vs Rojo/Negro) y partículas de ceniza flotantes.

## 🛠️ Tecnologías

- **Frontend**: Vue 3 + Vite
- **Estilos**: Tailwind CSS + Custom Animations
- **Backend/Auth**: Supabase
- **Animaciones**: Canvas Confetti, CSS Transitions
- **Drag & Drop**: Vue Draggable Next

## 🚀 Comenzar

1.  Clona el repositorio.
2.  Instala dependencias: `npm install`
3.  Configura tus variables de entorno en `.env` (Supabase URL & Key).
4.  Ejecuta el servidor de desarrollo: `npm run dev`

---

_Developed by Daniel MC_
