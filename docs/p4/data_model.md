# Modelo de Datos: Tabla `todos`

Este documento detalla el esquema de base de datos para la entidad principal del MVP.

## 1. Definición de Tabla

**Tabla:** `public.todos`

| Campo         | Tipo PostgreSQL | Constraints / Default                        | Descripción                                                                                                        |
| :------------ | :-------------- | :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `id`          | `uuid`          | **PK**, `default gen_random_uuid()`          | Identificador único universal de la tarea.                                                                         |
| `user_id`     | `uuid`          | **FK** `auth.users(id)`, `NOT NULL`          | Referencia al usuario propietario (de Supabase Auth). Eliminar en cascada no requerido para MVP, pero recomendado. |
| `title`       | `text`          | `NOT NULL`, `CHECK (char_length(title) > 0)` | El contenido de la tarea. No debe estar vacío.                                                                     |
| `is_complete` | `boolean`       | `default false`, `NOT NULL`                  | Estado de la tarea: pendiente (`false`) o terminada (`true`).                                                      |
| `created_at`  | `timestamptz`   | `default now()`, `NOT NULL`                  | Fecha y hora de creación con zona horaria (UTC).                                                                   |

## 2. Índices Sugeridos

Para optimizar el rendimiento de las consultas más frecuentes (filtrar por usuario y ordenar por fecha).

1.  **Index por Propietario**:

    - **Nombre**: `todos_user_id_idx`
    - **Definición**: `CREATE INDEX ON public.todos (user_id);`
    - **Motivo**: Todas las queries filtrarán por `user_id` debido a RLS.

2.  **Index para Ordenamiento**:
    - **Nombre**: `todos_user_id_created_at_idx` (Índice compuesto opcional)
    - **Definición**: `CREATE INDEX ON public.todos (user_id, created_at DESC);`
    - **Motivo**: El dashboard muestra tareas ordenadas de más reciente a más antigua para el usuario actual.

## 3. Restricciones y Validaciones (DB Level)

- **Integridad Referencial**: `todos.user_id` debe existir en `auth.users`.
- **Data Quality**: `title` no puede ser una cadena vacía ni nulo.

## 4. Ejemplos de Registros (JSON Representation)

### Ejemplo 1: Tarea pendiente recién creada

```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "user_id": "c8d4e92a-3b5f-4a1e-8c9d-1e2f3a4b5c6d",
  "title": "Comprar leche y pan",
  "is_complete": false,
  "created_at": "2023-10-27T10:00:00.123456+00:00"
}
```

### Ejemplo 2: Tarea completada antigua

```json
{
  "id": "b1ffcd88-0d1c-5ea9-cc7e-7cc0ce491b22",
  "user_id": "c8d4e92a-3b5f-4a1e-8c9d-1e2f3a4b5c6d",
  "title": "Renovar suscripción de Spotify",
  "is_complete": true,
  "created_at": "2023-10-26T15:30:00.000000+00:00"
}
```

## 5. SQL de Creación (Copy-Paste)

```sql
-- 1. Crear Tabla
create table public.todos (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null check (char_length(title) > 0),
  is_complete boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint todos_pkey primary key (id)
);

-- 2. Habilitar Seguridad
alter table public.todos enable row level security;

-- 3. Crear Índices
create index if not exists todos_user_id_idx on public.todos (user_id);
create index if not exists todos_created_at_idx on public.todos (created_at desc);
```
