# Alcance del MVP (P4: To-Do App)

## 1. User Stories (Historias de Usuario)

### Autenticación

- **Como** usuario nuevo, **quiero** registrarme con mi email y contraseña **para** tener una cuenta privada.
- **Como** usuario registrado, **quiero** iniciar sesión **para** acceder a mis tareas guardadas.
- **Como** usuario, **quiero** cerrar sesión **para** proteger mis datos en dispositivos compartidos.

### Gestión de Tareas

- **Como** usuario, **quiero** ver mi lista de tareas pendientes **para** saber qué tengo que hacer.
- **Como** usuario, **quiero** agregar una nueva tarea rápidamente **para** no olvidarla.
- **Como** usuario, **quiero** marcar una tarea como completada **para** sentir progreso.
- **Como** usuario, **quiero** desmarcar una tarea **si** me equivoqué o necesito reabrirla.
- **Como** usuario, **quiero** eliminar una tarea definitivamente **para** limpiar mi lista.

## 2. Criterios de "Done" (Definición de Hecho)

Para considerar una funcionalidad o el MVP completo como "listo":

- [ ] **Funcional**: Cumple con todas las User Stories críticas.
- [ ] **Persistente**: Los datos se guardan en Supabase y sobreviven a recargas de página.
- [ ] **Seguro**: Las políticas RLS impiden ver/editar datos de otros usuarios.
- [ ] **Responsivo**: La UI se ve bien en Móvil (375px+) y Desktop (1280px+).
- [ ] **Desplegado**: Accesible públicamente vía URL de Vercel (HTTPS).
- [ ] **Sin Errores Críticos**: No hay crashes ni errores de consola bloqueantes en el flujo principal.

## 3. No-Scope (Fuera de Alcance v1)

Estas funcionalidades están explícitamente excluidas para esta versión:

- Recuperación de contraseña ("Forgot Password"). (Razón: reduce complejidad inicial).
- Edición de texto de tareas existentes. (Solo crear nueva y borrar vieja por ahora).
- Categorías, etiquetas o prioridades.
- Fechas de vencimiento o recordatorios.
- Modo oscuro (Dark Mode) toggleable (se usará un tema por defecto).
- Login con Google/Github (Social Auth).

## 4. Riesgos y Mitigación

| Riesgo                   | Impacto          | Mitigación                                                                       |
| :----------------------- | :--------------- | :------------------------------------------------------------------------------- |
| **Complejidad de RLS**   | Alto (Seguridad) | Usar políticas estándar probadas (`auth.uid() = user_id`) y validar manualmente. |
| **Latencia de Red**      | Medio (UX)       | Implementar "Optimistic Updates" en la UI o spinners claros.                     |
| **Límite Capa Gratuita** | Bajo             | El MVP difícilmente excederá los límites de Supabase/Vercel free tiers.          |

## 5. Métricas de Éxito (KPIs Simples)

- **Time to First Task**: Un usuario nuevo debería poder registrarse y crear su primera tarea en < 60 segundos.
- **Latencia Percibida**: Las acciones (crear/completar) deben sentirse instantáneas (< 200ms en UI).
- **Tasa de Registro Exitoso**: % de usuarios que completan el registro sin errores de validación.
