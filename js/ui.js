/* ============================================================================
 * ui.js — Pintar las pantallas
 * ----------------------------------------------------------------------------
 * Qué hace: construye la interfaz dentro de <div id="app">. En la Fase 0 hay
 * una sola pantalla: la bienvenida con el indicador de conexión y el cambio
 * de idioma. Las pantallas reales llegarán en la Fase 1 (un archivo por
 * vista, carpeta ui/, según el estándar de organización).
 * Depende de: estado.js, i18n.js.
 *
 * REGLA Nº 1 DEL PROYECTO (anti-XSS): todo texto que pueda venir de un
 * usuario se pinta con textContent, NUNCA con innerHTML. En la Fase 0 todos
 * los textos salen del diccionario i18n (controlados por nosotros), pero la
 * estructura ya se construye con createElement/textContent para que la
 * costumbre quede instaurada desde el primer día.
 * ============================================================================ */

import { estado } from './estado.js';
import { t, idiomaActual, cambiarIdioma } from './i18n.js';

/**
 * Crea un elemento con clase y texto (texto siempre vía textContent).
 * @param {string} etiqueta - nombre de la etiqueta HTML ('div', 'button'…)
 * @param {string} clase - clases CSS separadas por espacio (puede ser '')
 * @param {string} texto - contenido de texto plano (puede ser '')
 * @returns {HTMLElement}
 */
function el(etiqueta, clase, texto) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  return nodo;
}

/**
 * Pinta la pantalla de bienvenida de la Fase 0.
 * @param {HTMLElement} raiz - contenedor donde pintar (el <div id="app">)
 * @param {Function} repintar - función para volver a pintar tras un cambio
 */
export function pintarBienvenida(raiz, repintar) {
  raiz.replaceChildren(); // vaciar sin usar innerHTML

  // Cabecera con forma de etiqueta de maleta (identidad visual del prototipo)
  const tag = el('div', 'tag', '');
  tag.appendChild(el('h1', '', t('app_nombre')));
  tag.appendChild(el('p', '', t('app_lema')));
  raiz.appendChild(tag);

  // Tarjeta central
  const card = el('div', 'card centrado', '');
  card.appendChild(el('div', 'icono-grande', '🧳'));
  card.appendChild(el('p', 'muted intro', t('bienvenida_intro')));

  // Botones de la Fase 1 (de momento, avisan de que llegan en la Fase 1)
  const btnCrear = el('button', 'btn btn-pri', t('crear_espacio'));
  btnCrear.addEventListener('click', () => alert(t('proximamente')));
  const btnUnirse = el('button', 'btn btn-sec', t('unirse_codigo'));
  btnUnirse.addEventListener('click', () => alert(t('proximamente')));
  card.appendChild(btnCrear);
  card.appendChild(btnUnirse);
  raiz.appendChild(card);

  // Indicador de conexión con la base de datos (la prueba clave de la Fase 0)
  const conex = el('div', 'card conexion ' + estado.conexion, '');
  const textosConexion = {
    probando: t('conexion_probando'),
    ok: t('conexion_ok'),
    error: t('conexion_error'),
    sin_configurar: t('config_pendiente'),
  };
  conex.appendChild(el('p', '', textosConexion[estado.conexion] || ''));
  raiz.appendChild(conex);

  // Selector de idioma del dispositivo (decisión 2: conmutable por dispositivo)
  const idioma = el('div', 'card', '');
  idioma.appendChild(el('h3', 'titulo-seccion', '🌐 ' + t('idioma_etiqueta')));
  const tabs = el('div', 'tabs', '');
  const activo = idiomaActual();
  for (const [codigo, clave] of [['es', 'idioma_es'], ['ca', 'idioma_ca']]) {
    const tab = el('button', 'tab' + (activo === codigo ? ' sel' : ''), t(clave));
    tab.addEventListener('click', () => { cambiarIdioma(codigo); repintar(); });
    tabs.appendChild(tab);
  }
  idioma.appendChild(tabs);
  raiz.appendChild(idioma);

  // Pie discreto con la frase de cierre
  raiz.appendChild(el('p', 'muted centrado pie', t('sin_registro')));
}
