/* ============================================================================
 * app.js — Arranque de FemMaletes
 * ----------------------------------------------------------------------------
 * Qué hace: punto de entrada. Pinta la pantalla inicial y lanza la
 * comprobación de conexión con Supabase.
 * Depende de: api.js, estado.js, ui.js, config.js.
 * ============================================================================ */

import { ping, configurada } from './api.js';
import { estado, fijarConexion } from './estado.js';
import { pintarBienvenida } from './ui.js';
import { VERSION } from './config.js';

const raiz = document.getElementById('app');

/** Repinta la pantalla actual (en la Fase 0 solo existe la bienvenida). */
function repintar() {
  pintarBienvenida(raiz, repintar);
}

/** Arranque: pintar, y comprobar la conexión en segundo plano. */
async function arrancar() {
  document.getElementById('version').textContent = VERSION;
  repintar();

  if (!configurada()) {
    // Claves sin rellenar: mensaje claro en vez de un error críptico.
    fijarConexion('sin_configurar', repintar);
    return;
  }

  const ok = await ping();
  fijarConexion(ok ? 'ok' : 'error', repintar);
}

arrancar();
