/* ============================================================================
 * ui/inicio.js — Pantalla de inicio: viajes en marcha e histórico
 * ----------------------------------------------------------------------------
 * Qué hace: saluda, lista los viajes activos con su barra de preparación,
 * da acceso a crear un viaje nuevo y muestra el histórico de archivados con
 * la opción de reactivarlos (decisión I7: los viajes se archivan, no se
 * borran; el borrado definitivo no existe en esta pantalla).
 * Depende de: comunes, datos, estado, nucleo, i18n.
 * ============================================================================ */

import { el, tagCabecera, barraProgreso, pill, toast } from './comunes.js';
import * as api from '../api.js';
import { estado, progresoPreparacion } from '../estado.js';
import { abrirViaje, refrescarResumen } from '../datos.js';
import { irA, repintar } from '../nucleo.js';
import { t, idiomaActual } from '../i18n.js';

/** Pantalla de inicio. */
export function pintarInicio(raiz) {
  const saludo = estado.yo ? `${t('hola')}, ${estado.yo.nombre} 👋` : t('hola') + ' 👋';
  raiz.appendChild(tagCabecera(saludo, estado.familia ? estado.familia.nombre : ''));

  const activos = estado.viajes.filter((v) => v.estado === 'activo');
  const archivados = estado.viajes.filter((v) => v.estado === 'archivado');

  raiz.appendChild(el('h2', 'titulo-bloque', t('viajes_en_marcha')));
  if (!activos.length) {
    raiz.appendChild(el('p', 'muted', t('sin_viajes')));
  }
  for (const v of activos) {
    raiz.appendChild(tarjetaViaje(v));
  }

  const btnNuevo = el('button', 'btn btn-pri mt', t('nuevo_viaje'));
  btnNuevo.addEventListener('click', () => irA('nuevo_viaje'));
  raiz.appendChild(btnNuevo);

  if (archivados.length) {
    raiz.appendChild(el('h2', 'titulo-bloque mt', t('historico')));
    for (const v of archivados) {
      raiz.appendChild(tarjetaArchivado(v));
    }
  }
}

/**
 * Tarjeta de un viaje activo, con sus píldoras y su barra de preparación.
 * @param {object} v - viaje
 * @returns {HTMLElement}
 */
function tarjetaViaje(v) {
  const card = el('div', 'viaje-item', '');
  const cuerpo = el('div', 'crece', '');
  const tipo = estado.tiposViaje.find((x) => x.id === v.tipo_viaje_id);
  const icono = tipo ? tipo.icono + ' ' : '';
  cuerpo.appendChild(el('h3', '', icono + v.nombre));

  const pildoras = el('div', '', '');
  pildoras.appendChild(pill(`${v.dias} ${t('dias_corto')}`));
  if (v.fecha_salida) pildoras.appendChild(pill(formatearFecha(v.fecha_salida)));
  if (v.alojamiento === 'cocina') pildoras.appendChild(pill('🍳'));
  cuerpo.appendChild(pildoras);

  const items = estado.resumenItems.filter((i) => i.viaje_id === v.id);
  cuerpo.appendChild(barraProgreso(t('progreso_prep'), progresoPreparacion(items)));
  card.appendChild(cuerpo);
  card.appendChild(el('div', 'flecha', '›'));
  card.addEventListener('click', async () => {
    try {
      await abrirViaje(v);
      irA('lista');
    } catch (e) { toast(t(e.message)); }
  });
  return card;
}

/**
 * Tarjeta de un viaje archivado con botón de reactivar.
 * @param {object} v - viaje
 * @returns {HTMLElement}
 */
function tarjetaArchivado(v) {
  const card = el('div', 'viaje-item apagado', '');
  const cuerpo = el('div', 'crece', '');
  cuerpo.appendChild(el('h3', '', v.nombre));
  cuerpo.appendChild(pill(t('archivado')));
  card.appendChild(cuerpo);
  const btn = el('button', 'btn btn-sec btn-mini', t('reactivar'));
  btn.addEventListener('click', async (ev) => {
    ev.stopPropagation();
    btn.disabled = true;
    try {
      await api.cambiarEstadoViaje(v.id, 'activo');
      await refrescarResumen();
      repintar();
    } catch (e) { toast(t(e.message)); btn.disabled = false; }
  });
  card.appendChild(btn);
  return card;
}

/**
 * Formatea una fecha ISO (aaaa-mm-dd) al formato corto del idioma activo.
 * @param {string} iso
 * @returns {string}
 */
function formatearFecha(iso) {
  const fecha = new Date(iso + 'T00:00:00');
  const idioma = idiomaActual() === 'ca' ? 'ca-ES' : 'es-ES';
  return fecha.toLocaleDateString(idioma, { day: 'numeric', month: 'short' });
}
