/* ============================================================================
 * version.js — Versión desplegada de la app
 * ----------------------------------------------------------------------------
 * Qué hace: expone la versión visible en el pie de la app.
 * Por qué existe: en la Fase 0 la versión vivía en config.js, pero config.js
 * contiene las claves de Supabase del despliegue real y NO debe sustituirse
 * al actualizar de fase. Separando la versión aquí, cada fase sube este
 * archivo nuevo y config.js no se toca nunca más.
 * ============================================================================ */

/** Versión visible de la app, para saber qué hay desplegado. */
export const VERSION = 'Fase 1';
