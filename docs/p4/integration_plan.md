# Arquitectura Conceptual (P4: To-Do App)

Este documento define la arquitectura lógica y el flujo de datos para la aplicación de tareas, integrando Vue 3 en el frontend y Supabase como backend-as-a-service.

## 1. Componentes y Vistas Principales

La aplicación se estructura en una arquitectura de **Single Page Application (SPA)** utilizando `vue-router`.

### Vistas (Views)

| Vista             | Ruta         | Descripción                                        | Componentes Clave                                            |
| :---------------- | :----------- | :------------------------------------------------- | :----------------------------------------------------------- |
| **AuthView**      | `/auth`      | Pantalla de entrada para usuarios no autenticados. | `AuthForm` (Login/Register toggle)                           |
| **DashboardView** | `/dashboard` | Pantalla principal de gestión de tareas.           | `Navbar`, `TaskInput`, `TaskList`, `TaskItem`, `TaskFilters` |

### Componentes UI (Átomos/Moléculas)

- **`AppButton`**: Botón reutilizable con variantes (primary, danger, ghost).
- **`AppInput`**: Campo de texto estilizado para formularios y nuevas tareas.
- **`TaskItem`**: Representación individual de una tarea con checkbox y botón de eliminar.
- **`LoadingSpinner`**: Feedback visual para operaciones asíncronas.

## 2. Flujo de Autenticación

Utilizamos **Supabase Auth** para manejar la sesión.

1.  **Estado Global**: Un composable `useAuth` encapsula el objeto `session` de Supabase.
2.  **Persistencia**: Supabase JS Client persiste automáticamente el token en `localStorage`.
3.  **Route Guard (`router/index.ts`)**:
    - Si el usuario navega a `/dashboard` sin sesión -> Redirigir a `/auth`.
    - Si el usuario navega a `/auth` con sesión activa -> Redirigir a `/dashboard`.
4.  **Eventos**: Escuchamos `onAuthStateChange` para detectar Login, Logout o Token Refresh y actualizar el estado reactivo inmediatamente.

## 3. Operaciones CRUD (Gestión de Datos)

La lógica de negocio reside en composables (e.g., `useTodos`), desacoplando la UI de la llamada directa a Supabase.

| Operación  | Método Supabase | Lógica                                                                                    |
| :--------- | :-------------- | :---------------------------------------------------------------------------------------- |
| **Create** | `.insert()`     | Inserta `{ title, user_id }`. El `user_id` se inyecta desde la sesión o se valida en RLS. |
| **Read**   | `.select()`     | Fetch de todas las tareas ordenadas por `created_at desc`.                                |
| **Update** | `.update()`     | Cambiar `is_complete` (toggle) o editar `title`. Filtrado por `id`.                       |
| **Delete** | `.delete()`     | Eliminar registro filtrado por `id`.                                                      |

## 4. Manejo de Estados de UI

Para garantizar una UX robusta, cada operación asíncrona debe reflejar uno de los siguientes estados:

- **Idle**: Estado inicial.
- **Loading**:
  - _Global_: Spinner a pantalla completa durante la carga inicial de la sesión.
  - _Local_: Deshabilitar inputs/botones mientras se crea o elimina una tarea (optimistic updates opcionales).
- **Empty**: Si el array de tareas está vacío, mostrar componente `EmptyState` ("No hay tareas, agrega una").
- **Error**:
  - Errores de validación (input vacío) -> Mensaje cerca del input.
  - Errores de red/servidor -> Toast notification (e.g., "Error al guardar tarea").

## 5. Consideraciones de Seguridad (RLS)

La seguridad no depende del frontend, sino de las **Row Level Security Policies** en PostgreSQL.

- **Principio de Mínimo Privilegio**: El cliente Supabase (usando `anon key`) no tiene permisos directos sobre la tabla `todos` a menos que una política RLS lo permita.
- **Política de Aislamiento**:
  - `auth.uid() = user_id`: Esta cláusula es obligatoria en políticas `SELECT`, `UPDATE` y `DELETE`.
  - Esto asegura que **Bajo ninguna circunstancia** un usuario pueda leer o modificar datos de otros, incluso si manipula las peticiones del cliente.
