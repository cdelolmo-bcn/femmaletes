/* ============================================================================
 * estado.js — Estado de la aplicación en memoria
 * ----------------------------------------------------------------------------
 * Qué hace: guarda el estado vivo de la app (única fuente de verdad para la
 * interfaz). En la Fase 0 es mínimo; crecerá en fases siguientes con la
 * familia, el perfil "yo soy…", el viaje abierto, etc.
 * Depende de: nada. Lo usan: ui.js y app.js.
 *
 * Por qué así: separar el estado de la interfaz evita que cada pantalla
 * guarde sus propias copias de los datos y acaben descoordinadas.
 * ============================================================================ */

/** Estado global de la app. Se modifica solo a través de las funciones de abajo. */
export const estado = {
  /** Estado de la conexión con Supabase: 'probando' | 'ok' | 'error' | 'sin_configurar' */
  conexion: 'probando',
};

/**
 * Cambia el estado de conexión y avisa para repintar.
 * @param {'probando'|'ok'|'error'|'sin_configurar'} valor
 * @param {Function} alCambiar - función a la que avisar (normalmente, repintar la UI)
 */
export function fijarConexion(valor, alCambiar) {
  estado.conexion = valor;
  if (typeof alCambiar === 'function') alCambiar();
}
