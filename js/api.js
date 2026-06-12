/* ============================================================================
 * api.js — Toda la conversación con Supabase pasa por aquí
 * ----------------------------------------------------------------------------
 * Qué hace: único punto de acceso a datos. Crea el cliente de Supabase y
 * expone funciones para cada operación de la Fase 1. Si algún día cambia el
 * backend, solo se toca este archivo.
 * Depende de: config.js, estado.js (solo para anotar el estado de conexión)
 * y la librería supabase-js (CDN jsdelivr; la CSP solo permite ese origen).
 *
 * Contrato de errores: toda función lanza Error con una CLAVE de i18n como
 * mensaje ('error_red', 'error_generico'…). Las vistas capturan, traducen
 * y muestran un aviso amable. Nunca fallos silenciosos (estándar 5.3).
 *
 * REGLA TRANSVERSAL: todas las consultas filtran por familia_id. Es lo que
 * aísla a cada familia dentro del modelo de seguridad asumido (sección 3
 * del diseño técnico).
 * ============================================================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { estado } from './estado.js';

/** @returns {boolean} true si config.js ya tiene las claves rellenadas */
export function configurada() {
  return SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20;
}

/** Cliente de Supabase (null si falta configuración). */
const supabase = configurada() ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/**
 * Envoltorio común: ejecuta una operación, anota el estado de conexión y
 * traduce cualquier fallo a un Error con clave de i18n.
 * @template T
 * @param {Promise<{data:T, error:object}>} promesa - llamada de supabase-js
 * @returns {Promise<T>}
 */
async function ejecutar(promesa) {
  let respuesta;
  try {
    respuesta = await promesa;
  } catch (e) {
    // Fallo de red puro (sin internet, proyecto pausado, DNS…)
    console.error('Fallo de red:', e);
    estado.conexion = 'error';
    throw new Error('error_red');
  }
  if (respuesta.error) {
    console.error('Error de Supabase:', respuesta.error.message);
    estado.conexion = 'error';
    throw new Error('error_generico');
  }
  estado.conexion = 'ok';
  return respuesta.data;
}

/* ==========================================================================
 * Espacio familiar
 * ========================================================================== */

/**
 * Crea un espacio familiar (la base copia dentro el catálogo estándar).
 * @param {string} nombre - nombre de la familia
 * @returns {Promise<string>} código de invitación (uuid de la familia)
 */
export async function crearFamilia(nombre) {
  return ejecutar(supabase.rpc('crear_familia', { p_nombre: nombre }));
}

/**
 * Busca una familia por su código exacto (única vía de acceso a `familias`).
 * @param {string} codigo - uuid
 * @returns {Promise<{id:string, nombre:string}|null>} null si el código no existe
 */
export async function obtenerFamilia(codigo) {
  const filas = await ejecutar(supabase.rpc('obtener_familia', { p_codigo: codigo }));
  return filas && filas.length ? filas[0] : null;
}

/* ==========================================================================
 * Miembros
 * ========================================================================== */

/**
 * @param {string} familiaId
 * @returns {Promise<Array>} todos los miembros (activos e inactivos), por nombre
 */
export async function listarMiembros(familiaId) {
  return ejecutar(
    supabase.from('miembros').select('*').eq('familia_id', familiaId).order('nombre')
  );
}

/**
 * @param {string} familiaId
 * @param {string} nombre
 * @param {'adulto'|'nino'|'bebe'} tipo
 * @returns {Promise<object>} el miembro creado
 */
export async function crearMiembro(familiaId, nombre, tipo) {
  const filas = await ejecutar(
    supabase.from('miembros')
      .insert({ familia_id: familiaId, nombre, tipo })
      .select()
  );
  return filas[0];
}

/**
 * Baja lógica de un miembro (no se borra: el historial se conserva).
 * @param {string} miembroId
 */
export async function desactivarMiembro(miembroId) {
  await ejecutar(supabase.from('miembros').update({ activo: false }).eq('id', miembroId));
}

/* ==========================================================================
 * Catálogos de la familia (tipos de viaje, actividades, plantillas)
 * ========================================================================== */

/** @param {string} familiaId @returns {Promise<Array>} */
export async function listarTiposViaje(familiaId) {
  return ejecutar(
    supabase.from('tipos_viaje').select('*').eq('familia_id', familiaId).order('nombre_es')
  );
}

/** @param {string} familiaId @returns {Promise<Array>} */
export async function listarActividades(familiaId) {
  return ejecutar(
    supabase.from('actividades').select('*').eq('familia_id', familiaId).order('nombre_es')
  );
}

/** @param {string} familiaId @returns {Promise<Array>} */
export async function listarPlantillas(familiaId) {
  return ejecutar(
    supabase.from('plantillas_items').select('*').eq('familia_id', familiaId)
  );
}

/* ==========================================================================
 * Viajes
 * ========================================================================== */

/** @param {string} familiaId @returns {Promise<Array>} viajes, los más nuevos primero */
export async function listarViajes(familiaId) {
  return ejecutar(
    supabase.from('viajes').select('*').eq('familia_id', familiaId)
      .order('creado_en', { ascending: false })
  );
}

/**
 * Crea el viaje completo: viaje + quién va + lista generada. Si un paso
 * intermedio falla, deshace el viaje (el borrado en cascada limpia el resto)
 * para no dejar viajes a medias en la base.
 * @param {object} viaje - fila para la tabla `viajes` (sin id)
 * @param {Array<string>} miembroIds - ids de quienes van
 * @param {Array<object>} itemsGenerados - filas para `items` (sin viaje_id)
 * @returns {Promise<object>} el viaje creado
 */
export async function crearViajeCompleto(viaje, miembroIds, itemsGenerados) {
  const filas = await ejecutar(supabase.from('viajes').insert(viaje).select());
  const creado = filas[0];
  try {
    await ejecutar(supabase.from('viaje_miembros').insert(
      miembroIds.map((m) => ({
        viaje_id: creado.id, miembro_id: m, familia_id: viaje.familia_id,
      }))
    ));
    if (itemsGenerados.length) {
      await ejecutar(supabase.from('items').insert(
        itemsGenerados.map((i) => ({ ...i, viaje_id: creado.id, familia_id: viaje.familia_id }))
      ));
    }
    return creado;
  } catch (e) {
    // Compensación: viaje a medias fuera (mejor repetir que dejar basura).
    await supabase.from('viajes').delete().eq('id', creado.id);
    throw e;
  }
}

/**
 * Archiva o reactiva un viaje (decisión I7: los viajes no se borran).
 * @param {string} viajeId
 * @param {'activo'|'archivado'} nuevoEstado
 */
export async function cambiarEstadoViaje(viajeId, nuevoEstado) {
  await ejecutar(supabase.from('viajes').update({ estado: nuevoEstado }).eq('id', viajeId));
}

/* ==========================================================================
 * Items
 * ========================================================================== */

/** @param {string} viajeId @returns {Promise<Array>} items del viaje */
export async function listarItems(viajeId) {
  return ejecutar(
    supabase.from('items').select('*').eq('viaje_id', viajeId).order('texto')
  );
}

/**
 * Filas mínimas de items de varios viajes (para las barras de progreso del
 * inicio sin descargar las listas completas).
 * @param {Array<string>} viajeIds
 * @returns {Promise<Array<{viaje_id:string, seccion:string, estado:string, ultima_hora:boolean}>>}
 */
export async function resumenItems(viajeIds) {
  if (!viajeIds.length) return [];
  return ejecutar(
    supabase.from('items')
      .select('viaje_id, seccion, estado, ultima_hora')
      .in('viaje_id', viajeIds)
  );
}

/**
 * Inserta un ítem añadido a mano (origen 'manual').
 * @param {object} item - fila para `items`
 * @returns {Promise<object>} el ítem creado
 */
export async function insertarItem(item) {
  const filas = await ejecutar(supabase.from('items').insert(item).select());
  return filas[0];
}

/**
 * Actualiza un ítem y devuelve la fila actualizada, o null si el ítem ya no
 * existe (decisión I13: otro dispositivo pudo haberlo quitado).
 * @param {string} itemId
 * @param {object} cambios - columnas a actualizar
 * @returns {Promise<object|null>}
 */
export async function actualizarItem(itemId, cambios) {
  const filas = await ejecutar(
    supabase.from('items').update(cambios).eq('id', itemId).select()
  );
  return filas && filas.length ? filas[0] : null;
}

/* ==========================================================================
 * Tiempo real
 * ========================================================================== */

/**
 * Se suscribe a los cambios de `items` de un viaje. Cualquier cambio hecho
 * desde otro dispositivo llega aquí en 1-2 segundos.
 * @param {string} viajeId
 * @param {Function} alCambiar - recibe el aviso de Supabase
 *        ({eventType: 'INSERT'|'UPDATE'|'DELETE', new: fila, old: fila})
 * @returns {Function} función para cancelar la suscripción
 */
export function suscribirItems(viajeId, alCambiar) {
  const canal = supabase
    .channel('items-' + viajeId)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'items', filter: `viaje_id=eq.${viajeId}` },
      (aviso) => alCambiar(aviso))
    .subscribe();
  return () => { supabase.removeChannel(canal); };
}
