# Políticas de Seguridad (RLS) - Supabase

La seguridad se maneja a nivel de base de datos utilizando Row Level Security (RLS) de PostgreSQL.

## 1. Estrategia General

- **Default**: Todo el acceso denegado (`deny all`) para roles anónimos en tablas sensibles.
- **Autenticación**: Solo usuarios autenticados pueden interactuar con la tabla `todos`.
- **Propiedad**: Un usuario solo puede ver y modificar registros donde `user_id` coincida con su `auth.uid()`.

## 2. Políticas para la tabla `todos`

Deben aplicarse después de `alter table todos enable row level security;`.

### A. Lectura (SELECT)

- **Nombre**: "Users can view their own todos"
- **Regla**: `auth.uid() = user_id`
- **SQL**:
  ```sql
  create policy "Users can view own todos"
  on public.todos for select
  using (auth.uid() = user_id);
  ```

### B. Creación (INSERT)

- **Nombre**: "Users can insert their own todos"
- **Regla**: `auth.uid() = user_id`
- **SQL**:
  ```sql
  create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);
  ```

### C. Actualización (UPDATE)

- **Nombre**: "Users can update their own todos"
- **Regla**: `auth.uid() = user_id`
- **SQL**:
  ```sql
  create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = user_id);
  ```

### D. Eliminación (DELETE)

- **Nombre**: "Users can delete their own todos"
- **Regla**: `auth.uid() = user_id`
- **SQL**:
  ```sql
  create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = user_id);
  ```

## 3. Validación

- Intentar acceder a datos de otro usuario vía API debe retornar array vacío o error.
- Intentar insertar un `user_id` distinto al propio debe fallar.
