/* ============================================================================
 * ui/lista.js — La lista del viaje, por categorías (el corazón de la app)
 * ----------------------------------------------------------------------------
 * Qué hace: pinta la lista del viaje abierto agrupada por categorías, con la
 * barra de preparación, el ciclo de 4 estados al tocar la casilla, el nombre
 * de quien marcó, el añadido manual y el archivado del viaje. Las vistas por
 * persona y por bulto llegan en la Fase 2.
 * Depende de: comunes, api, datos, estado, nucleo, i18n.
 *
 * UI OPTIMISTA con marcha atrás (estándar 5.3): al tocar, el cambio se ve al
 * instante; si el guardado falla, se revierte y se avisa. Si el ítem ya no
 * existe (otro dispositivo lo quitó, decisión I13), aviso suave y la lista
 * se refresca.
 * ============================================================================ */

import { el, tagCabecera, barraProgreso, toast } from './comunes.js';
import * as api from '../api.js';
import { estado, nombreMiembro, progresoPreparacion } from '../estado.js';
import { refrescarResumen } from '../datos.js';
import { irA, repintar } from '../nucleo.js';
import { t } from '../i18n.js';

/** Orden del ciclo de estados al tocar la casilla (mismo que el prototipo). */
const CICLO = ['pendiente', 'en_maleta', 'comprar', 'no_va'];

/** Pantalla de la lista del viaje abierto. */
export function pintarLista(raiz) {
  const v = estado.viajeAbierto;
  if (!v) { irA('inicio'); return; }

  const tipo = estado.tiposViaje.find((x) => x.id === v.tipo_viaje_id);
  raiz.appendChild(tagCabecera((tipo ? tipo.icono + ' ' : '') + v.nombre, t('lista_leyenda')));

  const equipaje = estado.items.filter((i) => i.seccion === 'equipaje');
  raiz.appendChild(barraProgreso(t('progreso_prep'), progresoPreparacion(equipaje)));

  const card = el('div', 'card', '');
  if (!equipaje.length) card.appendChild(el('p', 'muted', t('sin_items')));

  // Agrupar por categoría (null → "Añadido a mano"), categorías ordenadas.
  const grupos = new Map();
  for (const item of equipaje) {
    const cat = item.categoria || t('cat_otros');
    if (!grupos.has(cat)) grupos.set(cat, []);
    grupos.get(cat).push(item);
  }
  const categorias = [...grupos.keys()].sort((a, b) => a.localeCompare(b));
  for (const cat of categorias) {
    const bloque = el('div', 'cat', '');
    bloque.appendChild(el('h3', '', cat));
    for (const item of grupos.get(cat)) bloque.appendChild(filaItem(item));
    card.appendChild(bloque);
  }

  // Añadir un ítem a mano (la pregunta de "¿guardar en plantilla?" llega en la Fase 4).
  const filaAnadir = el('div', 'fila mt', '');
  const input = el('input', 'crece', '');
  input.placeholder = t('anadir_ph');
  input.maxLength = 120;
  const btnAnadir = el('button', 'btn btn-sec btn-mini', t('anadir_btn'));
  btnAnadir.addEventListener('click', () => anadirManual(input, btnAnadir));
  input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') anadirManual(input, btnAnadir); });
  filaAnadir.appendChild(input);
  filaAnadir.appendChild(btnAnadir);
  card.appendChild(filaAnadir);
  raiz.appendChild(card);

  // Archivar el viaje (decisión I7: archivar, nunca borrar desde aquí).
  const btnArchivar = el('button', 'btn btn-sec', t('archivar_viaje'));
  btnArchivar.addEventListener('click', async () => {
    if (!confirm(t('archivar_confirma'))) return;
    btnArchivar.disabled = true;
    try {
      await api.cambiarEstadoViaje(v.id, 'archivado');
      estado.viajeAbierto = null;
      await refrescarResumen();
      irA('inicio');
    } catch (e) { toast(t(e.message)); btnArchivar.disabled = false; }
  });
  raiz.appendChild(btnArchivar);
}

/**
 * Fila de un ítem: casilla de estado + texto + chips + quién lo marcó.
 * @param {object} item
 * @returns {HTMLElement}
 */
function filaItem(item) {
  const clases = { en_maleta: 'maleta', comprar: 'comprar', no_va: 'nova' };
  const fila = el('div', 'item ' + (clases[item.estado] || ''), '');

  const iconos = { en_maleta: '✓', comprar: '🛒', no_va: '✕' };
  const check = el('button', 'check', iconos[item.estado] || '');
  check.addEventListener('click', () => ciclarEstado(item));
  fila.appendChild(check);

  const cuerpo = el('span', 'txt', item.texto + ' ');
  if (item.ultima_hora) cuerpo.appendChild(el('span', 'chip frio', t('chip_ultima_hora')));
  if (item.estado === 'comprar') cuerpo.appendChild(el('span', 'chip compra', t('chip_comprar')));
  fila.appendChild(cuerpo);

  // Quién hizo el último cambio de estado (spec 2.6).
  if (item.estado !== 'pendiente' && item.marcado_por) {
    fila.appendChild(el('span', 'quien', '✓ ' + nombreMiembro(item.marcado_por)));
  }
  return fila;
}

/**
 * Cambia el estado de un ítem al siguiente del ciclo, con UI optimista:
 * primero se pinta, luego se guarda; si falla, marcha atrás y aviso.
 * @param {object} item
 */
async function ciclarEstado(item) {
  const siguiente = CICLO[(CICLO.indexOf(item.estado) + 1) % CICLO.length];
  const previo = { estado: item.estado, marcado_por: item.marcado_por };

  item.estado = siguiente;
  item.marcado_por = estado.yo ? estado.yo.id : null;
  repintar();

  try {
    const fila = await api.actualizarItem(item.id, {
      estado: siguiente,
      marcado_por: item.marcado_por,
    });
    if (!fila) {
      // I13: otro dispositivo lo quitó mientras tanto.
      estado.items = estado.items.filter((i) => i.id !== item.id);
      toast(t('item_ya_no_existe'));
      repintar();
    }
  } catch (e) {
    Object.assign(item, previo); // marcha atrás
    repintar();
    toast(t('guardado_fallo'));
  }
}

/**
 * Inserta el ítem escrito en el campo de añadir (origen 'manual').
 * @param {HTMLInputElement} input
 * @param {HTMLButtonElement} btn
 */
async function anadirManual(input, btn) {
  const texto = input.value.trim();
  if (!texto) return;
  btn.disabled = true;
  try {
    const creado = await api.insertarItem({
      familia_id: estado.familia.id,
      viaje_id: estado.viajeAbierto.id,
      seccion: 'equipaje',
      texto,
      categoria: null,           // se agrupa bajo "Añadido a mano" al pintar
      origen: 'manual',
      estado: 'pendiente',
    });
    if (!estado.items.some((i) => i.id === creado.id)) estado.items.push(creado);
    repintar();
  } catch (e) {
    toast(t(e.message));
  } finally {
    btn.disabled = false;
  }
}
