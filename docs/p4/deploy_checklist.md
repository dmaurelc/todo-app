# Checklist de Despliegue (Production Readiness)

## 1. Verificaciones Previas (Local)

- [ ] **Build Check**: Ejecutar `npm run build` sin errores.
- [ ] **Lint Check**: Verificar que no haya errores críticos de linter.
- [ ] **Environment**: Asegurar que no hay credenciales hardcodeadas en el código (solo en `.env`).
- [ ] **Assets**: Verificar que favicon y logos carguen correctamente en modo preview (`npm run preview`).

## 2. Configuración en Supabase

- [ ] **RLS Activo**: Confirmar que la tabla `todos` tiene RLS habilitado.
- [ ] **Políticas**: Verificar que las 4 políticas (Select, Insert, Update, Delete) están creadas.
- [ ] **Site URL / Redirects**: En Authentication > URL Configuration, agregar la URL de producción de Vercel (e.g., `https://mi-app.vercel.app`).

## 3. Despliegue en Vercel

- [ ] **Connect Repo**: Importar repositorio desde GitHub/GitLab.
- [ ] **Framework Preset**: Seleccionar "Vite".
- [ ] **Environment Variables**: Agregar:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] **Deploy**: Ejecutar el despliegue inicial.

## 4. Validación Post-Despliegue

- [ ] **Smoke Test de Auth**: Registrar un usuario real y verificar redirección.
- [ ] **Persistencia**: Crear una tarea, recargar la página y verificar que persiste.
- [ ] **Seguridad**: Intentar logout y volver atrás en el navegador (debe redirigir).
- [ ] **Rendimiento**: Verificar carga inicial rápida (Lighthouse score aceptable).
