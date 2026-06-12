/* ============================================================================
 * estado.js — Estado de la aplicación en memoria + memoria del dispositivo
 * ----------------------------------------------------------------------------
 * Qué hace: guarda el estado vivo de la app (única fuente de verdad para la
 * interfaz) y gestiona lo que cada dispositivo recuerda en su navegador:
 * el espacio familiar y el perfil "yo soy…" (la spec 2.0 y 2.2).
 * Depende de: config.js.
 *
 * Por qué así: separar el estado de la interfaz evita que cada pantalla
 * guarde sus propias copias de los datos y acaben descoordinadas. Lo que va
 * en localStorage es SOLO la identidad ligera del dispositivo; los datos de
 * verdad viven en Supabase.
 * ============================================================================ */

import { ALMACEN } from './config.js';

/** Estado global. Se modifica solo desde los módulos de datos y vistas. */
export const estado = {
  pantalla: 'cargando',     // pantalla visible (la gestiona nucleo.js)
  conexion: 'ok',           // 'ok' | 'error' | 'sin_configurar'
  familia: null,            // {id, nombre} del espacio vinculado
  yo: null,                 // miembro elegido en este dispositivo
  miembros: [],             // todos los miembros (activos e inactivos)
  tiposViaje: [],           // catálogo de la familia
  actividades: [],          // catálogo de la familia
  plantillas: [],           // plantillas_items de la familia
  viajes: [],               // todos los viajes (activos y archivados)
  resumenItems: [],         // filas mínimas de items de viajes activos (para las barras del inicio)
  viajeAbierto: null,       // viaje cuya lista está abierta
  items: [],                // items del viaje abierto
};

/* --------------------------------------------------------------------------
 * Memoria del dispositivo (localStorage): familia y perfil.
 * -------------------------------------------------------------------------- */

/** @returns {string|null} código del espacio guardado en este dispositivo */
export function familiaGuardada() {
  return localStorage.getItem(ALMACEN.familia);
}

/**
 * Vincula este dispositivo a un espacio. Al cambiar de espacio, el perfil
 * "yo soy…" se borra y se vuelve a elegir (decisión I11: los miembros del
 * nuevo espacio son otros).
 * @param {string} codigo - uuid de la familia
 */
export function guardarFamilia(codigo) {
  const anterior = localStorage.getItem(ALMACEN.familia);
  localStorage.setItem(ALMACEN.familia, codigo);
  if (anterior !== codigo) localStorage.removeItem(ALMACEN.perfil);
}

/** Desvincula este dispositivo del espacio (los datos siguen en la base). */
export function olvidarFamilia() {
  localStorage.removeItem(ALMACEN.familia);
  localStorage.removeItem(ALMACEN.perfil);
}

/** @returns {string|null} id del miembro "yo soy…" de este dispositivo */
export function perfilGuardado() {
  return localStorage.getItem(ALMACEN.perfil);
}

/** @param {string} miembroId - id del miembro elegido como "yo soy…" */
export function guardarPerfil(miembroId) {
  localStorage.setItem(ALMACEN.perfil, miembroId);
}

/** Borra el perfil del dispositivo (para re-elegir "yo soy…"). */
export function olvidarPerfil() {
  localStorage.removeItem(ALMACEN.perfil);
}

/* --------------------------------------------------------------------------
 * Utilidades de consulta sobre el estado.
 * -------------------------------------------------------------------------- */

/**
 * Nombre de un miembro a partir de su id (para "quién lo marcó").
 * @param {string|null} id
 * @returns {string} nombre, o cadena vacía si no se encuentra
 */
export function nombreMiembro(id) {
  const m = estado.miembros.find((x) => x.id === id);
  return m ? m.nombre : '';
}

/**
 * Progreso de preparación de un conjunto de items (decisión I2):
 * cuenta solo equipaje que sí va (excluye "no va") y que no es de última
 * hora (❄️); el porcentaje es la parte que ya está "en la maleta".
 * Vive aquí (un solo sitio) para que el inicio y la lista no dupliquen la regla.
 * @param {Array<{seccion:string, estado:string, ultima_hora:boolean}>} items
 * @returns {number} porcentaje 0-100
 */
export function progresoPreparacion(items) {
  const prep = items.filter(
    (i) => i.seccion === 'equipaje' && i.estado !== 'no_va' && !i.ultima_hora
  );
  if (prep.length === 0) return 0;
  const hechos = prep.filter((i) => i.estado === 'en_maleta').length;
  return Math.round((hechos / prep.length) * 100);
}
