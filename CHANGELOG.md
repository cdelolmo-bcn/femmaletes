# Registro de cambios — FemMaletes

## Fase 0 — Cimientos (junio 2026)

- Esquema completo de la base de datos en Supabase: 10 tablas, todas con `familia_id`.
- Restricciones de integridad en la base (CHECK, NOT NULL, claves foráneas) y triggers para campos automáticos (`marcado_en`) y límites defensivos por familia.
- RLS activado; la tabla `familias` sin posibilidad de listado (acceso solo por código exacto vía función `obtener_familia`). El catálogo estándar (familia_id NULL) queda fuera del alcance de la clave anónima.
- Funciones `crear_familia` (crea espacio + copia el catálogo estándar), `obtener_familia` y `ping`.
- Catálogo precargado: 6 tipos de viaje, 4 actividades y ~90 ítems de plantilla (general, adulto/niño/bebé con variantes por clima y umbral de días, tipos de viaje, actividades, trayecto, despensa y tareas), incluyendo el Anexo A de la especificación.
- Esqueleto de la app: módulos `config / i18n / estado / api / ui / app`, identidad visual del prototipo, sistema bilingüe es/ca con detección del idioma del navegador, CSP restrictiva e indicador de conexión con la base.
