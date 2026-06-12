# FemMaletes 🧳

App web familiar para preparar el equipaje de los viajes sin olvidar nada. Lista compartida en tiempo real entre los móviles de la familia, generada automáticamente desde plantillas y que aprende con cada viaje. Interfaz en castellano y catalán, conmutable por dispositivo. Sin registro ni contraseñas: cada familia tiene su espacio con un código de invitación.

## Cómo está montado

- **Frontend:** esta web estática (HTML + CSS + JavaScript), servida por **GitHub Pages**. Se instala en el móvil con "Añadir a pantalla de inicio".
- **Backend:** **Supabase** (plan gratuito): base de datos Postgres + API + tiempo real. Sin servidor propio.
- **Servicio externo:** Open-Meteo para el clima (Fase 5), gratuito y sin clave.

## Organización del código

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura base y política de seguridad (CSP) |
| `css/estilos.css` | Identidad visual (la del prototipo aprobado) |
| `js/config.js` | Claves y constantes. **Solo la clave anónima**, jamás la service_role |
| `js/i18n.js` | Todos los textos visibles, en castellano y catalán |
| `js/estado.js` | Estado de la app en memoria (única fuente de verdad) |
| `js/api.js` | Toda la conversación con Supabase (único punto de acceso a datos) |
| `js/ui.js` | Pintado de pantallas (en Fase 1 pasará a carpeta `ui/`, una vista por archivo) |
| `js/app.js` | Arranque |
| `supabase/fase0-esquema-y-datos.sql` | Esquema completo de la base + catálogo precargado |

Reglas del proyecto: nada de texto visible escrito a fuego en el código (todo por `i18n.js`); todo texto de usuario se pinta con `textContent` (anti-XSS, regla nº 1); validación doble (la app avisa amablemente, la base de datos se defiende con restricciones).

## Cómo desplegar cambios

1. Editar el archivo en el repositorio (lápiz ✏️ en GitHub) o subir la versión nueva ("Add file → Upload files", sustituye al antiguo).
2. Hacer commit con un mensaje descriptivo.
3. Esperar 1-2 minutos: GitHub Pages publica solo. Refrescar la web en el móvil.

Ningún despliegue sin pasar la checklist de pruebas de la fase.

## Copia de seguridad y restauración

**Hacer copia (recomendado 1-2 veces al año, antes de temporada de viajes):**
1. Panel de Supabase → Database → Backups, o bien Table Editor → cada tabla → Export to CSV.
2. Guardar los CSV en una carpeta con fecha.

**Restaurar desde cero:**
1. Crear proyecto nuevo en Supabase.
2. Ejecutar `supabase/fase0-esquema-y-datos.sql` (y los SQL de fases posteriores) en el SQL Editor.
3. Importar los CSV de la copia (Table Editor → Import data via CSV) respetando el orden: `familias` → `miembros` → `tipos_viaje` → `actividades` → `plantillas_items` → `viajes` → `viaje_miembros` → `bultos_habituales` → `bultos` → `items`.
4. Actualizar `js/config.js` con la URL y la clave anónima del proyecto nuevo.

## Avisos operativos

- ⚠️ **Supabase gratuito pausa el proyecto tras ~1 semana sin uso.** Antes de cada viaje: entrar al panel → si dice "Paused", pulsar "Restore". Un clic y un par de minutos.
- El código de familia es la llave del espacio: se ve y se reenvía desde ajustes. Si todos los dispositivos lo pierden, se recupera desde el panel de Supabase (tabla `familias`).

## Fases

Plan completo en el documento de diseño técnico. Estado: ver `CHANGELOG.md`.
