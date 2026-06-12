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
export const SUPABASE_URL = 'https://eexhyvnlwnykwipfexvx.supabase.co/rest/v1/';

/** Clave anónima (panel → Settings → API → anon public). */
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleGh5dm5sd255a3dpcGZleHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTQ4MTEsImV4cCI6MjA5Njc5MDgxMX0.yZLtgM9iwa9rRKe3ID3VzKHwPlNw4iltyf6Y6Xk1P0c';

/** Versión visible de la app, para saber qué hay desplegado. */
export const VERSION = 'Fase 0';

/** Claves de almacenamiento local del dispositivo (no de la base de datos). */
export const ALMACEN = {
  idioma: 'femmaletes_idioma',   // 'es' | 'ca' — cada dispositivo recuerda el suyo
  familia: 'femmaletes_familia', // código del espacio familiar (Fase 1)
  perfil: 'femmaletes_perfil',   // id del miembro "yo soy…" (Fase 1)
};
