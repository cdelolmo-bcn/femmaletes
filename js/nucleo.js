/* ============================================================================
 * nucleo.js — Navegación y repintado
 * ----------------------------------------------------------------------------
 * Qué hace: ofrece irA(pantalla) y repintar() a todas las vistas.
 * Depende de: estado.js.
 *
 * Por qué existe: las vistas necesitan navegar y repintar, pero la función
 * que pinta vive en app.js, que a su vez importa las vistas. Para no crear
 * importaciones circulares, app.js REGISTRA aquí su función de pintado y
 * las vistas la usan a través de este módulo.
 * ============================================================================ */

import { estado } from './estado.js';

let _pintar = null;

/**
 * Registra la función global de pintado (la llama app.js una vez al arrancar).
 * @param {Function} fn
 */
export function registrarPintado(fn) {
  _pintar = fn;
}

/** Vuelve a pintar la pantalla actual. */
export function repintar() {
  if (_pintar) _pintar();
}

/**
 * Navega a una pantalla y repinta.
 * @param {string} pantalla - clave de la pantalla destino
 */
export function irA(pantalla) {
  estado.pantalla = pantalla;
  repintar();
  window.scrollTo(0, 0);
}
