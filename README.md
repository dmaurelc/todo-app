# ✅ ToDo App - Minimalist & Premium

Una aplicación de tareas moderna, minimalista y con una estética premium, diseñada para una gestión eficiente y visual de tus tareas diarias.

## 🚀 Características Principales

- **Diseño Premium**: Interfaz ultra-limpia con tipografía moderna (DM Sans), bordes refinados y transiciones fluidas.
- **Calendario Semanal Interactivo**: Filtra tus tareas seleccionando días directamente en la barra superior.
- **Sistema de Prioridades (Rayos ⚡️)**: Clasifica la urgencia de tus tareas con iconos de rayos (1, 2 o 3 rayos).
- **Ordenación Inteligente**: Las tareas completadas pasan al final automáticamente, manteniendo el criterio de prioridad dentro de cada grupo.
- **Edición Completa**: Modifica cualquier tarea mediante botón de editar o manteniendo presionado (press & hold 500ms).
- **Categorización**: Organiza tus tareas en categorías (Trabajo, Personal, Salud, Ideas, Otros) con contadores dinámicos.
- **Gestión de Subtareas**: Crea listas de verificación dentro de cada tarea con validación de progreso automática.
- **Progreso Diario**: Barra de progreso visual que muestra el avance real de las tareas del día seleccionado.
- **Arrastrar y Soltar (Drag & Drop)**: Reorganiza tus tareas fácilmente mediante handle visible en desktop o gestos táctiles en móvil.
- **Modal Optimizado**: Interface de creación/edición con diseño responsive, botón eliminar integrado y bordes refinados.
- **Modo Oscuro/Claro**: Adaptado perfectamente para cualquier entorno visual con un solo toque.
- **Totalmente Responsivo**: Experiencia optimizada para dispositivos móviles y escritorio con adaptación inteligente de elementos.

## 🛠️ Stack Tecnológico

- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API)
- **Framework de Estilos**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Gestión de Estado**: Composables nativos de Vue
- **Herramienta de Construcción**: [Vite](https://vitejs.dev/)
- **Efectos Visuales**: [Canvas-confetti](https://github.com/catdad/canvas-confetti)
- **Notificaciones**: [Vue3-toastify](https://github.com/jerrybend/vue3-toastify)
- **Interactividad**: [Vuedraggable](https://github.com/SortableJS/Vue.Draggable)

## 📦 Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd ToDoApp
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

4. **Construir para producción**:
   ```bash
   npm run build
   ```

## 🎨 Principios de Diseño

- **Tipografía**: DM Sans con pesos Regular y Medium para una lectura limpia y moderna.
- **Iconografía**: SVGs minimalistas y personalizados para una carga rápida y escalabilidad perfecta.
- **Micro-interacciones**: Animaciones sutiles en botones, checkbox, press & hold y modales para mejorar la experiencia de usuario (UX).
- **Mobile-First**: Diseño pensado primero para móvil con expansiones responsivas en pantallas más grandes.
- **Gestos Táctiles**: Press & hold para edición rápida, swipe y drag & drop naturales en dispositivos táctiles.

## 📱 Características Específicas por Plataforma

### Desktop (sm+)
- Handle visible para drag & drop
- Botones de editar/eliminar hover en cada tarea
- Espaciado ampliado para mejor legibilidad

### Móvil
- Interfaz compacta con padding optimizado
- Press & hold (500ms) para abrir edición
- Drag & drop mediante gestos táctiles
- Botones de acción ocultos (acceso desde modal)
- Modal con borde inferior plano

---
Desarrollado con ❤️ para una productividad sin distracciones.
