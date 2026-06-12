/* ============================================================================
 * datos.js — Carga coordinada de datos en el estado
 * ----------------------------------------------------------------------------
 * Qué hace: orquesta las cargas que necesitan varias vistas (todo lo de la
 * familia al entrar, el refresco de viajes en el inicio, la apertura de un
 * viaje con su lista y su suscripción de tiempo real).
 * Depende de: api.js, estado.js, nucleo.js.
 *
 * Por qué existe: estas operaciones tocan varias partes del estado a la vez;
 * si vivieran repartidas por las vistas, acabarían duplicadas (estándar:
 * nada de lógica duplicada).
 * ============================================================================ */

import * as api from './api.js';
import { estado } from './estado.js';
import { repintar } from './nucleo.js';

/**
 * Carga en paralelo todos los datos de la familia vinculada:
 * miembros, catálogos (tipos, actividades, plantillas) y viajes.
 * @returns {Promise<void>}
 */
export async function cargarDatosFamilia() {
  const id = estado.familia.id;
  const [miembros, tipos, actividades, plantillas, viajes] = await Promise.all([
    api.listarMiembros(id),
    api.listarTiposViaje(id),
    api.listarActividades(id),
    api.listarPlantillas(id),
    api.listarViajes(id),
  ]);
  estado.miembros = miembros;
  estado.tiposViaje = tipos;
  estado.actividades = actividades;
  estado.plantillas = plantillas;
  estado.viajes = viajes;
  await refrescarResumen();
}

/**
 * Refresca los viajes y el resumen de items de los activos (para las barras
 * de progreso del inicio). Se llama al entrar en la pantalla de inicio.
 * @returns {Promise<void>}
 */
export async function refrescarResumen() {
  estado.viajes = await api.listarViajes(estado.familia.id);
  const activos = estado.viajes.filter((v) => v.estado === 'activo').map((v) => v.id);
  estado.resumenItems = await api.resumenItems(activos);
}

/* --------------------------------------------------------------------------
 * Viaje abierto + tiempo real
 * -------------------------------------------------------------------------- */

let cancelarSuscripcion = null;

/**
 * Abre un viaje: carga su lista y se suscribe a los cambios en tiempo real.
 * Los avisos de otros dispositivos actualizan el estado y repintan si la
 * lista está a la vista.
 * @param {object} viaje
 * @returns {Promise<void>}
 */
export async function abrirViaje(viaje) {
  estado.viajeAbierto = viaje;
  estado.items = await api.listarItems(viaje.id);

  if (cancelarSuscripcion) cancelarSuscripcion(); // una suscripción a la vez
  cancelarSuscripcion = api.suscribirItems(viaje.id, (aviso) => {
    aplicarAviso(aviso);
    if (estado.pantalla === 'lista') repintar();
  });
}

/**
 * Aplica al estado un aviso de tiempo real de Supabase.
 * INSERT añade (si no lo teníamos ya: el propio dispositivo recibe el eco de
 * sus inserciones), UPDATE sustituye y DELETE quita.
 * @param {{eventType:string, new:object, old:object}} aviso
 */
function aplicarAviso(aviso) {
  if (aviso.eventType === 'INSERT') {
    if (!estado.items.some((i) => i.id === aviso.new.id)) {
      estado.items.push(aviso.new);
    }
  } else if (aviso.eventType === 'UPDATE') {
    const idx = estado.items.findIndex((i) => i.id === aviso.new.id);
    if (idx >= 0) estado.items[idx] = aviso.new;
    else estado.items.push(aviso.new);
  } else if (aviso.eventType === 'DELETE' && aviso.old && aviso.old.id) {
    estado.items = estado.items.filter((i) => i.id !== aviso.old.id);
  }
}
