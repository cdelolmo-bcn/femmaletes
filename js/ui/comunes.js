/* ============================================================================
 * ui/comunes.js — Piezas de interfaz compartidas por todas las vistas
 * ----------------------------------------------------------------------------
 * Qué hace: pequeñas fábricas de elementos (la etiqueta de maleta, botones,
 * barras de progreso, avisos toast, navegación inferior) para que las vistas
 * no repitan estructura.
 * Depende de: i18n.js, estado.js, nucleo.js.
 *
 * REGLA Nº 1 DEL PROYECTO (anti-XSS): todo texto se pinta con textContent,
 * NUNCA con innerHTML. Aquí ya entran textos escritos por la familia
 * (nombres, viajes, ítems): esta regla no tiene excepciones.
 * ============================================================================ */

import { t } from '../i18n.js';
import { estado } from '../estado.js';
import { irA } from '../nucleo.js';

/**
 * Crea un elemento con clase y texto (texto siempre vía textContent).
 * @param {string} etiqueta - 'div', 'button', 'span'…
 * @param {string} clase - clases CSS (puede ser '')
 * @param {string} texto - texto plano (puede ser '')
 * @returns {HTMLElement}
 */
export function el(etiqueta, clase, texto) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  return nodo;
}

/**
 * Cabecera con forma de etiqueta de maleta (la firma visual de la app).
 * @param {string} titulo
 * @param {string} subtitulo
 * @returns {HTMLElement}
 */
export function tagCabecera(titulo, subtitulo) {
  const tag = el('div', 'tag', '');
  tag.appendChild(el('h1', '', titulo));
  if (subtitulo) tag.appendChild(el('p', '', subtitulo));
  return tag;
}

/**
 * Botón "‹ Atrás" que navega a una pantalla.
 * @param {string} pantalla - destino
 * @returns {HTMLElement}
 */
export function botonVolver(pantalla) {
  const b = el('button', 'volver', t('volver'));
  b.addEventListener('click', () => irA(pantalla));
  return b;
}

/**
 * Barra de progreso con su etiqueta y porcentaje.
 * @param {string} etiqueta
 * @param {number} pct - 0-100
 * @returns {HTMLElement}
 */
export function barraProgreso(etiqueta, pct) {
  const cont = el('div', 'bloque-barra', '');
  const lbl = el('div', 'prog-lbl', '');
  lbl.appendChild(el('span', '', etiqueta));
  lbl.appendChild(el('span', '', pct + '%'));
  cont.appendChild(lbl);
  const barra = el('div', 'barra', '');
  const relleno = el('div', '', '');
  relleno.style.width = pct + '%';
  barra.appendChild(relleno);
  cont.appendChild(barra);
  return cont;
}

/**
 * Aviso flotante temporal (toast). Para errores amables y confirmaciones.
 * @param {string} texto - ya traducido
 */
export function toast(texto) {
  const previo = document.querySelector('.toast');
  if (previo) previo.remove();
  const aviso = el('div', 'toast', texto);
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 3500);
}

/**
 * Banner fijo de "sin conexión" (estándar: indicador visible de conexión).
 * Se pinta solo si el estado de conexión es de error o el navegador está
 * sin red.
 * @returns {HTMLElement|null}
 */
export function bannerConexion() {
  if (estado.conexion !== 'error' && navigator.onLine) return null;
  return el('div', 'banner-conexion', t('banner_sin_conexion'));
}

/**
 * Navegación inferior (Viajes · Lista · Ajustes).
 * @returns {HTMLElement}
 */
export function navInferior() {
  const nav = el('div', 'nav', '');
  const botones = [
    ['inicio', '🧳', t('nav_viajes')],
    ['lista', '✅', t('nav_lista')],
    ['ajustes', '⚙️', t('nav_ajustes')],
  ];
  for (const [pantalla, icono, texto] of botones) {
    const b = el('button', estado.pantalla === pantalla ? 'sel' : '', '');
    b.appendChild(el('span', '', icono));
    b.appendChild(document.createTextNode(texto));
    b.addEventListener('click', () => {
      // La lista necesita un viaje abierto; si no lo hay, al inicio.
      if (pantalla === 'lista' && !estado.viajeAbierto) { irA('inicio'); return; }
      irA(pantalla);
    });
    nav.appendChild(b);
  }
  return nav;
}

/**
 * Píldora informativa (etiquetas pequeñas de los viajes).
 * @param {string} texto
 * @returns {HTMLElement}
 */
export function pill(texto) {
  return el('span', 'pill', texto);
}
