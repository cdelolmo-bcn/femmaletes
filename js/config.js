/* ============================================================================
 * config.js — Claves y constantes de FemMaletes
 * ----------------------------------------------------------------------------
 * Qué hace: guarda la configuración para conectar con Supabase.
 * Depende de: nada. Lo usan: api.js y app.js.
 *
 * ⚠️ IMPORTANTE — SEGURIDAD:
 * Aquí solo puede vivir la clave ANÓNIMA de Supabase (la que empieza por
 * "eyJ..." y aparece como "anon public" en el panel). Es pública por diseño.
 * La clave "service_role" NO debe pegarse aquí JAMÁS: esa clave se salta
 * todas las protecciones y solo debe existir dentro del panel de Supabase.
 * ============================================================================ */

/** URL del proyecto de Supabase (panel → Settings → API → Project URL). */
export const SUPABASE_URL = 'PEGA_AQUI_LA_URL_DE_TU_PROYECTO';

/** Clave anónima (panel → Settings → API → anon public). */
export const SUPABASE_ANON_KEY = 'PEGA_AQUI_LA_CLAVE_ANON_PUBLIC';

/** Versión visible de la app, para saber qué hay desplegado. */
export const VERSION = 'Fase 0';

/** Claves de almacenamiento local del dispositivo (no de la base de datos). */
export const ALMACEN = {
  idioma: 'femmaletes_idioma',   // 'es' | 'ca' — cada dispositivo recuerda el suyo
  familia: 'femmaletes_familia', // código del espacio familiar (Fase 1)
  perfil: 'femmaletes_perfil',   // id del miembro "yo soy…" (Fase 1)
};
