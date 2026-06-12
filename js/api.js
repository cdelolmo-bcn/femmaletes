/* ============================================================================
 * api.js — Toda la conversación con Supabase pasa por aquí
 * ----------------------------------------------------------------------------
 * Qué hace: crea el cliente de Supabase y expone funciones para hablar con la
 * base de datos. Es el ÚNICO módulo que toca Supabase: si algún día cambia
 * el backend, solo se toca este archivo.
 * Depende de: config.js y de la librería oficial supabase-js (cargada desde
 * el CDN jsdelivr; la CSP de index.html solo permite ese origen).
 *
 * En la Fase 0 solo hay una operación: ping(), para comprobar que la app
 * desplegada en GitHub Pages habla de verdad con la base de datos.
 * ============================================================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

/**
 * Indica si las claves de config.js ya se han rellenado.
 * Sirve para dar un mensaje claro ("falta configurar") en vez de un error raro.
 * @returns {boolean}
 */
export function configurada() {
  return SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20;
}

/** Cliente de Supabase. Null si aún no hay configuración. */
const supabase = configurada() ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/**
 * Comprueba la conexión con la base llamando a la función ping() del esquema.
 * Todo error de red se captura aquí y se devuelve como false: la interfaz
 * decide qué mensaje amable mostrar (estándar: nunca fallos silenciosos).
 * @returns {Promise<boolean>} true si la base respondió 'ok'
 */
export async function ping() {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.rpc('ping');
    if (error) {
      console.error('Error de Supabase en ping():', error.message);
      return false;
    }
    return data === 'ok';
  } catch (e) {
    // Sin internet, proyecto pausado, URL mal escrita… cualquier causa acaba aquí.
    console.error('Fallo de red en ping():', e);
    return false;
  }
}
