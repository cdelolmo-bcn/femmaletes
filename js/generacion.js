/* ============================================================================
 * generacion.js — Generación de la lista de un viaje desde las plantillas
 * ----------------------------------------------------------------------------
 * Qué hace: la lógica más delicada de la app, en funciones PURAS (sin tocar
 * red ni pantalla): calcular cantidades a partir de fórmulas, decidir qué
 * ítems de plantilla aplican a un viaje y construir las filas de `items`.
 * Depende de: nada (a propósito: así se prueba sola, ver pruebas.html).
 *
 * Las reglas viven SOLO aquí (estándar: nada de lógica duplicada).
 *
 * Nota sobre idioma: los textos generados aquí (sábanas, toallas, la tarea de
 * confirmar) van en castellano, como el catálogo precargado: los textos de
 * los ítems son DATOS de la familia, no interfaz, y deben ser estables (no
 * pueden depender del idioma del dispositivo que creó el viaje).
 * ============================================================================ */

/**
 * Calcula una cantidad a partir de una fórmula y los días del viaje.
 * Fórmulas admitidas (spec 2.3): un número fijo ('2'), 'dias', y
 * 'dias+N', 'dias-N', 'dias*N', 'dias/N' (la división redondea hacia arriba:
 * mejor que sobre una camiseta a que falte). El resultado nunca baja de 1.
 * @param {string|null} formula
 * @param {number} dias - duración del viaje
 * @returns {number|null} cantidad, o null si no hay fórmula o no se reconoce
 */
export function calcularCantidad(formula, dias) {
  if (!formula) return null;
  const f = String(formula).replace(/\s+/g, '').toLowerCase();
  if (/^\d+$/.test(f)) return Math.max(1, parseInt(f, 10));
  if (f === 'dias') return Math.max(1, dias);
  const m = f.match(/^dias([+\-*/])(\d+)$/);
  if (!m) return null; // fórmula no reconocida: el ítem sale sin cantidad
  const n = parseInt(m[2], 10);
  let v;
  if (m[1] === '+') v = dias + n;
  else if (m[1] === '-') v = dias - n;
  else if (m[1] === '*') v = dias * n;
  else v = Math.ceil(dias / Math.max(1, n));
  return Math.max(1, Math.round(v));
}

/**
 * ¿Aplica este ítem de plantilla a este viaje?
 * Dos filtros (spec 2.3 y 2.8): la condición de clima (si el ítem tiene una,
 * el viaje debe incluirla) y el umbral de días (si el ítem tiene dias_minimos,
 * el viaje debe durar al menos eso).
 * @param {object} plantilla - fila de plantillas_items
 * @param {{dias:number, condiciones:Array<string>}} viaje
 * @returns {boolean}
 */
export function aplicaPlantilla(plantilla, viaje) {
  if (plantilla.condicion && !(viaje.condiciones || []).includes(plantilla.condicion)) {
    return false;
  }
  if (plantilla.dias_minimos && viaje.dias < plantilla.dias_minimos) {
    return false;
  }
  return true;
}

/**
 * Compone el texto visible de un ítem: "Camisetas (4)" si hay cantidad.
 * @param {string} texto
 * @param {number|null} cantidad
 * @returns {string}
 */
export function textoConCantidad(texto, cantidad) {
  return cantidad && cantidad > 1 ? `${texto} (${cantidad})` : texto;
}

/**
 * Genera las filas de `items` de un viaje nuevo a partir de las plantillas.
 *
 * Ámbitos que entran en la Fase 1 (spec 2.4): general + tipo de viaje +
 * tipo de persona por cada viajero (escalado por días y filtrado por clima)
 * + actividades elegidas + personales de cada miembro + ropa de cama según
 * la respuesta de sábanas/toallas. (Trayecto y despensa llegan en la Fase 3.)
 *
 * Duplicados: dos plantillas pueden aportar el mismo ítem (montaña y
 * senderismo traen ambas "Mochila de ataque"). Se queda una sola copia por
 * (texto, persona): nadie quiere dos mochilas en la lista.
 *
 * @param {object} p
 * @param {{dias:number, condiciones:Array<string>, alojamiento:string, ropa_cama:string|null}} p.viaje
 * @param {string} p.tipoViajeClave - clave del tipo ('playa', 'esqui'…)
 * @param {Array<string>} p.actividadesClaves - claves de actividades elegidas
 * @param {Array<{id:string, nombre:string, tipo:string}>} p.miembros - quienes van
 * @param {Array<object>} p.plantillas - plantillas_items de la familia
 * @returns {Array<object>} filas para `items` (sin viaje_id ni familia_id)
 */
export function generarListaDesdePlantillas({ viaje, tipoViajeClave, actividadesClaves, miembros, plantillas }) {
  const filas = [];
  const vistos = new Set(); // clave de deduplicado: texto normalizado + persona

  /** Añade una fila evitando duplicados por (texto, persona). */
  function anadir(plantilla, miembro) {
    const cantidad = calcularCantidad(plantilla.formula_cantidad, viaje.dias);
    const texto = textoConCantidad(plantilla.texto, cantidad);
    const claveDedupe = plantilla.texto.trim().toLowerCase() + '|' + (miembro ? miembro.id : '');
    if (vistos.has(claveDedupe)) return;
    vistos.add(claveDedupe);
    filas.push({
      seccion: 'equipaje',
      texto,
      // Para los ítems de persona, la categoría incorpora el nombre
      // ("Ropa · Pau"): así la vista por categorías de la Fase 1 ya separa
      // la maleta de cada uno sin esperar a la vista por persona (Fase 2).
      categoria: miembro
        ? `${plantilla.categoria || 'Ropa'} · ${miembro.nombre}`
        : (plantilla.categoria || null),
      miembro_id: miembro ? miembro.id : null,
      ultima_hora: !!plantilla.ultima_hora,
      origen: 'plantilla',
      estado: 'pendiente',
    });
  }

  for (const pl of plantillas) {
    if (!aplicaPlantilla(pl, viaje)) continue;

    if (pl.ambito === 'general') {
      anadir(pl, null);
    } else if (pl.ambito === 'tipo_viaje' && pl.clave === tipoViajeClave) {
      anadir(pl, null);
    } else if (pl.ambito === 'actividad' && actividadesClaves.includes(pl.clave)) {
      anadir(pl, null);
    } else if (pl.ambito === 'tipo_persona') {
      for (const m of miembros) {
        if (m.tipo === pl.clave) anadir(pl, m);
      }
    } else if (pl.ambito === 'miembro') {
      const m = miembros.find((x) => x.id === pl.clave);
      if (m) anadir(pl, m);
    }
    // 'trayecto', 'despensa' y 'tarea': Fase 3 (spec del plan de fases).
  }

  // Ropa de cama y toallas (spec 2.4): solo si el alojamiento no es hotel.
  // Sin datos de camas en la v1, se aproxima: un juego de sábanas y una
  // toalla por persona (siempre editable después).
  if (viaje.alojamiento !== 'hotel' && (viaje.ropa_cama === 'llevar' || viaje.ropa_cama === 'confirmar')) {
    const n = miembros.length;
    filas.push({
      seccion: 'equipaje',
      texto: textoConCantidad('Juegos de sábanas', n),
      categoria: 'Ropa de cama',
      miembro_id: null, ultima_hora: false, origen: 'plantilla', estado: 'pendiente',
    });
    filas.push({
      seccion: 'equipaje',
      texto: textoConCantidad('Toallas de casa', n),
      categoria: 'Ropa de cama',
      miembro_id: null, ultima_hora: false, origen: 'plantilla', estado: 'pendiente',
    });
    if (viaje.ropa_cama === 'confirmar') {
      // La tarea queda guardada ya; la sección de tareas se pinta en la Fase 3.
      filas.push({
        seccion: 'tarea',
        texto: 'Confirmar con el alojamiento si incluye sábanas y toallas',
        categoria: null, miembro_id: null, ultima_hora: false,
        origen: 'plantilla', estado: 'pendiente',
      });
    }
  }

  return filas;
}
