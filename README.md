# FemMaletes 🧳

App web familiar para preparar el equipaje de los viajes sin olvidar nada.
Una sola lista compartida por toda la familia, sincronizada en tiempo real
entre dispositivos, generada automáticamente desde plantillas que mejoran
con cada viaje. Sin registro ni contraseñas. Interfaz en castellano y catalán.

**Estado actual: Fase 1** — la lista compartida (crear espacio, miembros,
"yo soy…", crear viaje con lista generada desde plantillas, 4 estados,
tiempo real entre móviles). Plan completo de fases en el diseño técnico.

## Cómo está montado

- **Frontend:** web estática (HTML + CSS + JavaScript en módulos) servida por
  GitHub Pages. Sin frameworks ni herramientas de build: lo que hay en el
  repositorio es exactamente lo que se sirve.
- **Backend:** Supabase (plan gratuito): Postgres + API automática +
  tiempo real. Sin servidor propio.
- **Acceso:** sin login. Cada familia tiene un **espacio** cuyo código (un
  uuid imposible de adivinar) hace de llave. La app filtra siempre por
  `familia_id`. El techo de seguridad de este modelo está documentado en la
  sección 3 del diseño técnico.

## Organización del código (`app/`)

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Página única, con la política de seguridad (CSP) en su meta-etiqueta |
| `css/estilos.css` | Toda la identidad visual |
| `js/config.js` | Claves de Supabase y constantes. **No se sustituye al actualizar de fase** |
| `js/version.js` | Versión desplegada (este sí se sube en cada fase) |
| `js/i18n.js` | Todos los textos visibles, en castellano y catalán |
| `js/estado.js` | Estado en memoria + lo que recuerda el dispositivo (espacio, perfil) |
| `js/nucleo.js` | Navegación entre pantallas (evita imports circulares) |
| `js/api.js` | **Toda** la conversación con Supabase (único punto de acceso a datos) |
| `js/generacion.js` | Lógica pura de generación de listas (con pruebas: `pruebas.html`) |
| `js/datos.js` | Cargas coordinadas y suscripción de tiempo real |
| `js/ui/*.js` | Una vista por archivo (bienvenida, quién, inicio, nuevo viaje, lista, ajustes) |
| `js/app.js` | Arranque, enlace de invitación y enrutado |
| `pruebas.html` | Pruebas automáticas de la generación, se abren en el navegador |

Reglas de oro del proyecto:
1. **Anti-XSS:** todo texto de usuario se pinta con `textContent`, nunca `innerHTML`.
2. La base de datos se defiende sola: restricciones y triggers re-validan todo.
3. Ningún texto visible fuera de `i18n.js`.
4. Toda llamada de red captura errores y avisa con un mensaje útil.

## Desplegar cambios

1. Subir los archivos cambiados al repositorio (GitHub → *Add file* → *Upload files*).
2. Esperar 1-2 minutos a que GitHub Pages publique.
3. Abrir la app y comprobar la versión en el pie de página.

⚠️ `js/config.js` contiene las claves reales del proyecto: las guías de cada
fase indican siempre si hay que tocarlo (normalmente, no).

## Copia de seguridad y restauración

- **Copia:** Supabase → Database → Backups (diaria en el plan gratuito), y
  1-2 veces al año una exportación manual: SQL Editor → `select * from …`
  de cada tabla → exportar CSV. Antes de temporada de viajes, recomendado.
- **Restauración desde cero:** crear proyecto nuevo en Supabase → ejecutar
  `supabase/fase0-esquema-y-datos.sql` → ejecutar los SQL de las fases
  siguientes en orden (`fase1-tiempo-real.sql`, …) → importar los CSV si
  los hubiera → actualizar las claves en `js/config.js`.
- **Recordatorio:** el plan gratuito pausa el proyecto tras ~1 semana sin
  uso. Se reactiva desde el panel con un clic; hacerlo unos días antes de
  cada viaje.

## Recuperación de emergencia del código de familia

Si todos los dispositivos se desvincularan y nadie guardó el código (caso
I12): el administrador técnico puede verlo en Supabase → Table Editor →
tabla `familias` → columna `id`.
