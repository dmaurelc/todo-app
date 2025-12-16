# README: Proyecto P4 (To-Do App)

Esta guía cubre la configuración, seguridad y despliegue del MVP.

## 1. Configuración de Variables de Entorno

El proyecto requiere claves de API de Supabase para conectarse.
Renombra el archivo `.env.example` a `.env` (si no existe, créalo) y agrega:

```properties
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

> **IMPORTANTE**: Nunca compartas tu `service_role_key` en el frontend. Usa solo la `anon_key`.

## 2. Validación de Seguridad (RLS)

Antes de desplegar, verifica que Row Level Security esté funcionando:

1.  **Prueba de Anonimato**: Abre la app en modo incógnito sin loguearte. No deberías ver ninguna tarea.
2.  **Prueba de Aislamiento**:
    - Crea dos usuarios (User A y User B).
    - Loguéate con User A y crea una tarea "Tarea Secreta A".
    - Loguéate con User B. **No** debes ver "Tarea Secreta A".
3.  **Verificación en Supabase Dashboard**:
    - Ve a Table Editor > `todos`.
    - Intenta insertar una fila manualmente sin `user_id`. Debería fallar o requerir un ID válido.

## 3. Despliegue en Vercel

1.  **Nuevo Proyecto**: En Vercel Dashboard, importa tu repositorio de Git.
2.  **Framework Preset**: Vercel debería detectar "Vite" automáticamente.
3.  **Variables de Entorno**: Copia los valores de tu `.env` local a la sección "Environment Variables" en Vercel:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
4.  **Deploy**: Haz clic en "Deploy".

## 4. Troubleshooting Checklist

¿Algo no funciona? Revisa esta lista rápida:

- **Pantalla Blanca / Error de Red**:
  - [ ] ¿Están las variables de entorno configuradas en Vercel? (Un error común es olvidarlas).
  - [ ] ¿La URL de Supabase es correcta y accesible?
- **No puedo hacer Login**:
  - [ ] ¿Está habilitado el proveedor de "Email" en Supabase Auth?
  - [ ] ¿Has confirmado tu email (si la confirmación está activa)?
- **Veo tareas vacías o error al guardar**:
  - [ ] ¿Está activado RLS en la tabla?
  - [ ] ¿Existen las políticas de INSERT/SELECT?
  - [ ] Revisa la consola del navegador por errores 40x de Supabase.
