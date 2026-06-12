/* ============================================================================
 * i18n.js — Textos de la interfaz en castellano y catalán
 * ----------------------------------------------------------------------------
 * Qué hace: diccionario de todos los textos visibles y funciones para
 * obtenerlos y cambiar de idioma. NINGÚN texto visible se escribe a fuego
 * en otros módulos: todo pasa por aquí (estándar de ingeniería).
 * Depende de: config.js (clave de almacenamiento local).
 *
 * Por qué así: la decisión 2 de la especificación exige interfaz bilingüe
 * conmutable POR DISPOSITIVO (la abuela en castellano, los niños en catalán).
 * Por eso el idioma se guarda en el navegador, no en la base de datos.
 * El idioma inicial se detecta del navegador (decisión 9).
 * ============================================================================ */

import { ALMACEN } from './config.js';

/** Diccionario completo. Cada clave tiene su texto en 'es' y en 'ca'. */
const TEXTOS = {
  app_nombre:        { es: 'FemMaletes', ca: 'FemMaletes' },
  app_lema:          { es: 'Listas de equipaje en familia', ca: 'Llistes d\u2019equipatge en família' },
  bienvenida_intro:  { es: 'Para empezar, crea el espacio de tu familia o únete a uno existente.',
                       ca: 'Per començar, crea l\u2019espai de la teva família o uneix-te a un d\u2019existent.' },
  crear_espacio:     { es: 'Crear espacio familiar', ca: 'Crear espai familiar' },
  unirse_codigo:     { es: 'Tengo un código de invitación', ca: 'Tinc un codi d\u2019invitació' },
  sin_registro:      { es: 'Sin registro ni contraseñas.', ca: 'Sense registre ni contrasenyes.' },
  proximamente:      { es: 'Disponible en la Fase 1. De momento estamos comprobando los cimientos.',
                       ca: 'Disponible a la Fase 1. De moment estem comprovant els fonaments.' },
  conexion_probando: { es: 'Comprobando conexión con la base de datos…',
                       ca: 'Comprovant la connexió amb la base de dades…' },
  conexion_ok:       { es: 'Conectado con la base de datos ✓', ca: 'Connectat amb la base de dades ✓' },
  conexion_error:    { es: 'Sin conexión con la base de datos. Revisa internet o que el proyecto de Supabase no esté pausado.',
                       ca: 'Sense connexió amb la base de dades. Revisa internet o que el projecte de Supabase no estigui pausat.' },
  config_pendiente:  { es: 'Falta configurar las claves en js/config.js (ver guía de la Fase 0).',
                       ca: 'Falta configurar les claus a js/config.js (vegeu la guia de la Fase 0).' },
  idioma_etiqueta:   { es: 'Idioma de este dispositivo', ca: 'Idioma d\u2019aquest dispositiu' },
  idioma_es:         { es: 'Castellano', ca: 'Castellà' },
  idioma_ca:         { es: 'Català', ca: 'Català' },
};

/** Idiomas admitidos. */
const IDIOMAS = ['es', 'ca'];

/**
 * Devuelve el idioma activo del dispositivo.
 * Prioridad: lo guardado en este navegador → idioma del navegador → 'es'.
 * @returns {'es'|'ca'}
 */
export function idiomaActual() {
  const guardado = localStorage.getItem(ALMACEN.idioma);
  if (IDIOMAS.includes(guardado)) return guardado;
  // Decisión 9: el idioma inicial se detecta del navegador del dispositivo.
  const navegador = (navigator.language || 'es').toLowerCase();
  return navegador.startsWith('ca') ? 'ca' : 'es';
}

/**
 * Cambia el idioma del dispositivo y lo recuerda para próximas visitas.
 * @param {'es'|'ca'} idioma
 */
export function cambiarIdioma(idioma) {
  if (!IDIOMAS.includes(idioma)) return; // entrada inesperada: se ignora sin romper
  localStorage.setItem(ALMACEN.idioma, idioma);
}

/**
 * Devuelve el texto de una clave en el idioma activo.
 * Si la clave no existe, devuelve la propia clave entre corchetes: así un
 * texto olvidado se ve enseguida en pantalla en vez de fallar en silencio.
 * @param {string} clave - clave del diccionario TEXTOS
 * @returns {string}
 */
export function t(clave) {
  const entrada = TEXTOS[clave];
  if (!entrada) return `[${clave}]`;
  return entrada[idiomaActual()] || entrada.es;
}
