# Registro de cambios — FemMaletes

## Fase 1 — La lista compartida (junio 2026)

- Pantalla de bienvenida: crear espacio familiar (la base copia dentro el catálogo estándar) o unirse con código.
- Enlace de invitación `?familia=…`: al abrirlo, el dispositivo queda vinculado al espacio (flujo F2). Invitar es una acción separada en ajustes, con envío por WhatsApp y copia de enlace (decisión I10).
- Miembros: alta desde el selector "¿quién eres?" (I8) y desde ajustes; baja lógica (el historial se conserva). Los bebés no aparecen como usuarios (I9).
- Identidad ligera "yo soy…" guardada por dispositivo; al cambiar de espacio se re-elige (I11).
- Crear viaje: destino, tipo, días, fecha opcional, **clima manual** (≥1 condición), actividades, alojamiento con la pregunta de sábanas/toallas (sí / no / no lo sé, con tarea de confirmar) y quién va.
- **Generación automática de la lista** desde las plantillas: general + tipo de viaje + tipo de persona (escalada por días, con variantes por clima y umbral «a partir de X días») + actividades + personales por miembro + ropa de cama. Ítems duplicados entre plantillas se quedan en una sola copia. Con pruebas automáticas (`pruebas.html`, 36 casos).
- Lista por categorías con los 4 estados (pendiente → en la maleta → comprar → no va), nombre de quien marcó, chips de «comprar» y «❄️ última hora», barra de preparación (que excluye «no va» y ❄️, decisión I2) y añadido manual.
- **Tiempo real**: los cambios de un móvil aparecen en los demás en 1-2 segundos (publicación de Supabase sobre `items` y `viajes`).
- UI optimista con marcha atrás: si un guardado falla, el cambio se revierte y se avisa. Si el ítem ya no existe, aviso suave y la lista se refresca (I13).
- Archivar y reactivar viajes (sin borrado, decisión I7).
- La versión de la app pasa a `js/version.js` para no tocar nunca más `js/config.js` (que contiene las claves desplegadas).

## Fase 0 — Cimientos (junio 2026)

- Esquema completo de la base de datos en Supabase: 10 tablas, todas con `familia_id`.
- Restricciones de integridad en la base (CHECK, NOT NULL, claves foráneas) y triggers para campos automáticos (`marcado_en`) y límites defensivos por familia.
- RLS activado; la tabla `familias` sin posibilidad de listado (acceso solo por código exacto vía función `obtener_familia`). El catálogo estándar (familia_id NULL) queda fuera del alcance de la clave anónima.
- Funciones `crear_familia` (crea espacio + copia el catálogo estándar), `obtener_familia` y `ping`.
- Catálogo precargado: 6 tipos de viaje, 4 actividades y ~90 ítems de plantilla (general, adulto/niño/bebé con variantes por clima y umbral de días, tipos de viaje, actividades, trayecto, despensa y tareas), incluyendo el Anexo A de la especificación.
- Esqueleto de la app: módulos `config / i18n / estado / api / ui / app`, identidad visual del prototipo, sistema bilingüe es/ca con detección del idioma del navegador, CSP restrictiva e indicador de conexión con la base.
