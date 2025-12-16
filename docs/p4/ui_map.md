# Mapa de UI y UX

## 1. Estructura de Navegación

- **/** (Raíz): Redirección inteligente.
  - Si no autenticado -> `/auth`
  - Si autenticado -> `/dashboard`
- **/auth**: Login y Registro.
- **/dashboard**: Vista principal de la aplicación.

## 2. Detalle de Vistas

### A. Authentication View (`/auth`)

- **Layout**: Centrado simple.
- **Componentes**:
  - **Toggle**: "Iniciar Sesión" / "Registrarse".
  - **Form**: Email, Contraseña.
  - **Action Button**: "Entrar" o "Crear cuenta".
  - **Feedback**: Mensajes de error (e.g., "Credenciales inválidas").

### B. Dashboard View (`/dashboard`)

- **Header (Navbar)**

  - Logo / Título App.
  - Email de usuario (pequeño).
  - Botón "Cerrar Sesión" (Logout).

- **Task Input (Zona Superior)**

  - Input de texto grande con placeholder "Agrega una nueva tarea...".
  - Permitir agregar con tecla `Enter`.

- **Task List (Zona Central)**

  - Lista scrolleable si hay muchas tareas.
  - **Task Item**:
    - **Checkbox**: A la izquierda. Tacha el texto al marcarse.
    - **Texto**: Título de la tarea.
    - **Delete Button**: Icono de basura (visible al hacer hover - desktop, o siempre visible - mobile).

- **Footer Controls (Zona Inferior)**
  - Contador: "X tareas pendientes".
  - Filtros: [Todas] [Activas] [Completadas].

## 3. Estados de UI

- **Loading**: Spinner o esqueleto de carga al iniciar o al hacer login.
- **Empty State**: "No tienes tareas pendientes. ¡Agrega una!" (Ilustración opcional).
- **Error State**: Toast o alerta si falla conexión con Supabase.
