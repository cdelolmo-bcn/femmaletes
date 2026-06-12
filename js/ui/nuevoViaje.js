/* ============================================================================
 * ui/nuevoViaje.js — Crear un viaje y generar su lista
 * ----------------------------------------------------------------------------
 * Qué hace: el formulario del flujo F3: destino, tipo, días, fecha opcional,
 * clima MANUAL (el automático llega en la Fase 5), actividades, alojamiento
 * (con la pregunta de sábanas/toallas si no es hotel) y quién va. Al crear,
 * genera la lista con generacion.js y la inserta de una vez.
 * Depende de: comunes, api, generacion, datos, estado, nucleo, i18n.
 *
 * Validación doble: aquí los mensajes amables; las restricciones de Postgres
 * re-validan todo por su cuenta (estándar 5.3).
 * ============================================================================ */

import { el, tagCabecera, botonVolver, toast } from './comunes.js';
import * as api from '../api.js';
import { generarListaDesdePlantillas } from '../generacion.js';
import { estado } from '../estado.js';
import { abrirViaje, refrescarResumen } from '../datos.js';
import { irA } from '../nucleo.js';
import { t, idiomaActual } from '../i18n.js';

const CONDICIONES = ['calor', 'entretiempo', 'frio', 'lluvia'];

/** Pantalla del formulario de nuevo viaje. */
export function pintarNuevoViaje(raiz) {
  raiz.appendChild(botonVolver('inicio'));
  raiz.appendChild(tagCabecera(t('nv_titulo'), t('nv_sub')));

  const card = el('div', 'card', '');
  const idioma = idiomaActual();
  const nombreDe = (fila) => (idioma === 'ca' ? fila.nombre_ca : fila.nombre_es);

  // Estado local del formulario (vive solo mientras la pantalla está abierta).
  const form = {
    tipoClave: estado.tiposViaje.length ? estado.tiposViaje[0].clave : null,
    condiciones: new Set(),
    actividades: new Set(),
    alojamiento: 'hotel',
    ropaCama: 'confirmar',
    miembros: new Set(estado.miembros.filter((m) => m.activo).map((m) => m.id)),
  };

  // --- Destino ---
  card.appendChild(el('label', '', t('nv_destino')));
  const inputNombre = el('input', '', '');
  inputNombre.placeholder = t('nv_destino_ej');
  inputNombre.maxLength = 80;
  card.appendChild(inputNombre);

  // --- Tipo de viaje ---
  card.appendChild(el('label', '', t('nv_tipo')));
  card.appendChild(grupoTabs(
    estado.tiposViaje.map((tv) => [tv.clave, `${tv.icono} ${nombreDe(tv)}`]),
    form.tipoClave,
    (clave) => { form.tipoClave = clave; },
    false
  ));

  // --- Días y fecha ---
  const filaDias = el('div', 'fila', '');
  const colDias = el('div', 'crece', '');
  colDias.appendChild(el('label', '', t('nv_dias')));
  const inputDias = el('input', '', '');
  inputDias.type = 'number'; inputDias.min = '1'; inputDias.max = '365'; inputDias.value = '4';
  colDias.appendChild(inputDias);
  const colFecha = el('div', 'crece', '');
  colFecha.appendChild(el('label', '', t('nv_fecha')));
  const inputFecha = el('input', '', '');
  inputFecha.type = 'date';
  colFecha.appendChild(inputFecha);
  filaDias.appendChild(colDias);
  filaDias.appendChild(colFecha);
  card.appendChild(filaDias);

  // --- Clima (manual en Fase 1; el automático llega en la Fase 5) ---
  card.appendChild(el('label', '', t('nv_clima')));
  card.appendChild(grupoTabs(
    CONDICIONES.map((c) => [c, t('cond_' + c)]),
    null,
    (clave, activado) => { activado ? form.condiciones.add(clave) : form.condiciones.delete(clave); },
    true
  ));

  // --- Actividades ---
  if (estado.actividades.length) {
    card.appendChild(el('label', '', t('nv_actividades')));
    card.appendChild(grupoTabs(
      estado.actividades.map((a) => [a.clave, `${a.icono} ${nombreDe(a)}`]),
      null,
      (clave, activado) => { activado ? form.actividades.add(clave) : form.actividades.delete(clave); },
      true
    ));
  }

  // --- Alojamiento + ropa de cama ---
  card.appendChild(el('label', '', t('nv_alojamiento')));
  const bloqueRopaCama = el('div', '', '');
  card.appendChild(grupoTabs(
    [['hotel', t('aloja_hotel')], ['cocina', t('aloja_cocina')], ['camping', t('aloja_camping')]],
    form.alojamiento,
    (clave) => {
      form.alojamiento = clave;
      bloqueRopaCama.style.display = clave === 'hotel' ? 'none' : '';
    },
    false
  ));

  bloqueRopaCama.appendChild(el('label', '', t('nv_ropa_cama')));
  bloqueRopaCama.appendChild(grupoTabs(
    [['incluida', t('rc_si')], ['llevar', t('rc_no')], ['confirmar', t('rc_nose')]],
    form.ropaCama,
    (clave) => { form.ropaCama = clave; },
    false
  ));
  bloqueRopaCama.appendChild(el('p', 'muted nota', t('nv_ropa_cama_nota')));
  bloqueRopaCama.style.display = 'none'; // alojamiento inicial: hotel
  card.appendChild(bloqueRopaCama);

  // --- Quién va ---
  card.appendChild(el('label', '', t('nv_quien')));
  for (const m of estado.miembros.filter((x) => x.activo)) {
    const fila = el('div', 'fila check-fila', '');
    const check = el('input', '', '');
    check.type = 'checkbox';
    check.checked = form.miembros.has(m.id);
    check.id = 'chk-' + m.id;
    check.addEventListener('change', () => {
      check.checked ? form.miembros.add(m.id) : form.miembros.delete(m.id);
    });
    const etiqueta = el('label', 'check-label', m.nombre);
    etiqueta.htmlFor = check.id;
    fila.appendChild(check);
    fila.appendChild(etiqueta);
    card.appendChild(fila);
  }

  raiz.appendChild(card);

  // --- Crear ---
  const btn = el('button', 'btn btn-pri', t('nv_crear'));
  btn.addEventListener('click', async () => {
    const nombre = inputNombre.value.trim();
    const dias = parseInt(inputDias.value, 10);
    if (!nombre || nombre.length > 80) { toast(t('nv_error_nombre')); return; }
    if (!Number.isInteger(dias) || dias < 1 || dias > 365) { toast(t('nv_error_dias')); return; }
    if (form.condiciones.size === 0) { toast(t('nv_error_clima')); return; }
    if (form.miembros.size === 0) { toast(t('nv_error_miembros')); return; }

    btn.disabled = true; btn.textContent = t('nv_creando');
    const tipo = estado.tiposViaje.find((x) => x.clave === form.tipoClave);
    const actividadIds = estado.actividades
      .filter((a) => form.actividades.has(a.clave)).map((a) => a.id);
    const viaje = {
      familia_id: estado.familia.id,
      nombre,
      tipo_viaje_id: tipo.id,
      fecha_salida: inputFecha.value || null,
      dias,
      alojamiento: form.alojamiento,
      condiciones: [...form.condiciones],
      actividades: actividadIds,
      ropa_cama: form.alojamiento === 'hotel' ? null : form.ropaCama,
    };
    const quienes = estado.miembros.filter((m) => form.miembros.has(m.id));
    const items = generarListaDesdePlantillas({
      viaje,
      tipoViajeClave: form.tipoClave,
      actividadesClaves: [...form.actividades],
      miembros: quienes,
      plantillas: estado.plantillas,
    });

    try {
      const creado = await api.crearViajeCompleto(viaje, [...form.miembros], items);
      await refrescarResumen();
      await abrirViaje(creado);
      irA('lista');
    } catch (e) {
      toast(t(e.message));
      btn.disabled = false; btn.textContent = t('nv_crear');
    }
  });
  raiz.appendChild(btn);
}

/**
 * Grupo de pestañas seleccionables.
 * @param {Array<[string,string]>} opciones - pares [clave, texto]
 * @param {string|null} seleccionInicial - clave marcada al inicio (modo único)
 * @param {Function} alCambiar - (clave) en modo único; (clave, activado) en múltiple
 * @param {boolean} multiple - true: varias a la vez; false: una sola
 * @returns {HTMLElement}
 */
function grupoTabs(opciones, seleccionInicial, alCambiar, multiple) {
  const grupo = el('div', 'fila envolver', '');
  for (const [clave, texto] of opciones) {
    const tab = el('button', 'tab tab-grid' + (clave === seleccionInicial ? ' sel' : ''), texto);
    tab.addEventListener('click', () => {
      if (multiple) {
        tab.classList.toggle('sel');
        alCambiar(clave, tab.classList.contains('sel'));
      } else {
        for (const otro of grupo.children) otro.classList.remove('sel');
        tab.classList.add('sel');
        alCambiar(clave);
      }
    });
    grupo.appendChild(tab);
  }
  return grupo;
}
