# Seguridad: Row Level Security (RLS)

Este documento define el modelo de seguridad para la protección de datos de usuario en Supabase.

## 1. ¿Qué es RLS?

**Row Level Security (RLS)** es una característica nativa de PostgreSQL que restringe qué filas puede consultar o modificar un usuario en una tabla de base de datos.
A diferencia de la seguridad a nivel de aplicación (API middlewares), RLS vive junto a los datos.

## 2. ¿Por qué es necesario?

Al usar Supabase ("Backend-as-a-Service"), exponemos una API directamente a internet. Sin RLS, cualquier usuario con la clave pública (`anon key`) podría hacer `SELECT * FROM todos` y ver las tareas de **todos los usuarios**.
RLS actúa como un "firewall de datos", asegurando que cada consulta SQL incluya implícitamente un filtro de seguridad.

## 3. Políticas CRUD (Minimum Viable Policies)

Para la tabla `todos`, aplicamos una regla simple: **"Yo soy el dueño de mis datos"**.

### A. Habilitar RLS

Primero, se debe activar el candado en la tabla:

```sql
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
```

### B. Definición de Políticas

#### 1. Lectura (SELECT)

Permite ver solo las filas donde el `user_id` coincide con el ID del usuario autenticado.

```sql
CREATE POLICY "Enable read access for own todos"
ON public.todos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

#### 2. Creación (INSERT)

Permite insertar filas solo si el `user_id` de la nueva fila coincide con el ID del usuario autenticado.

```sql
CREATE POLICY "Enable insert access for own todos"
ON public.todos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

#### 3. Actualización (UPDATE)

Permite modificar filas existentes solo si pertenecen al usuario.

```sql
CREATE POLICY "Enable update access for own todos"
ON public.todos FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

#### 4. Borrado (DELETE)

Permite eliminar filas solo si pertenecen al usuario.

```sql
CREATE POLICY "Enable delete access for own todos"
ON public.todos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## 4. Validación de Seguridad

| Escenario                                             | Resultado Esperado                                       |
| :---------------------------------------------------- | :------------------------------------------------------- |
| Usuario anónimo intenta leer                          | Retorna lista vacía `[]` o Error (según config).         |
| Usuario A intenta leer ID de tarea de Usuario B       | Retorna lista vacía `[]` (como si no existiera).         |
| Usuario A intenta insertar con `user_id` de Usuario B | Error SQL: `new row violates row-level security policy`. |
