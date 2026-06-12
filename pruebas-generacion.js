/* ============================================================================
 * pruebas-generacion.js — Pruebas automáticas de la lógica de generación
 * ----------------------------------------------------------------------------
 * Qué hace: comprueba calcularCantidad, aplicaPlantilla y
 * generarListaDesdePlantillas con casos normales y retorcidos. Se ejecutan
 * abriendo pruebas.html en el navegador (no necesitan Supabase: la lógica
 * es pura a propósito).
 * Depende de: generacion.js.
 * ============================================================================ */

import {
  calcularCantidad,
  aplicaPlantilla,
  textoConCantidad,
  generarListaDesdePlantillas,
} from './js/generacion.js';

/** Resultados acumulados para pintar la tabla. */
const resultados = [];

/**
 * Comprueba una condición y la registra.
 * @param {string} nombre - qué se comprueba
 * @param {boolean} ok - resultado
 * @param {string} [detalle] - información extra si falla
 */
function prueba(nombre, ok, detalle) {
  resultados.push({ nombre, ok, detalle: detalle || '' });
}

/* --------------------------------------------------------------------------
 * 1. calcularCantidad — fórmulas de cantidades (spec 2.3)
 * -------------------------------------------------------------------------- */
prueba('Sin fórmula → sin cantidad', calcularCantidad(null, 5) === null);
prueba('Número fijo "2" → 2', calcularCantidad('2', 5) === 2);
prueba('"dias" con 4 días → 4', calcularCantidad('dias', 4) === 4);
prueba('"dias+1" con 4 días → 5', calcularCantidad('dias+1', 4) === 5);
prueba('"dias-2" con 3 días → 1 (nunca baja de 1)', calcularCantidad('dias-2', 3) === 1);
prueba('"dias*2" con 3 días → 6', calcularCantidad('dias*2', 3) === 6);
prueba('"dias/2" con 5 días → 3 (redondeo arriba)', calcularCantidad('dias/2', 5) === 3);
prueba('"dias / 2" con espacios → también funciona', calcularCantidad('dias / 2', 5) === 3);
prueba('"DIAS+1" en mayúsculas → también funciona', calcularCantidad('DIAS+1', 4) === 5);
prueba('Fórmula rara "x+y" → null (ítem sin cantidad, sin romper)', calcularCantidad('x+y', 4) === null);

/* --------------------------------------------------------------------------
 * 2. aplicaPlantilla — clima y umbral de días (spec 2.3 y 2.8)
 * -------------------------------------------------------------------------- */
const viajeFrio3dias = { dias: 3, condiciones: ['frio', 'lluvia'] };
prueba('Ítem sin condición → siempre aplica',
  aplicaPlantilla({ condicion: null, dias_minimos: null }, viajeFrio3dias) === true);
prueba('Ítem de frío en viaje de frío → aplica',
  aplicaPlantilla({ condicion: 'frio', dias_minimos: null }, viajeFrio3dias) === true);
prueba('Ítem de calor en viaje de frío → NO aplica',
  aplicaPlantilla({ condicion: 'calor', dias_minimos: null }, viajeFrio3dias) === false);
prueba('Cortaúñas (5 días mínimo) en viaje de 3 → NO aplica',
  aplicaPlantilla({ condicion: null, dias_minimos: 5 }, viajeFrio3dias) === false);
prueba('Cortaúñas (5 días mínimo) en viaje de 7 → aplica',
  aplicaPlantilla({ condicion: null, dias_minimos: 5 }, { dias: 7, condiciones: [] }) === true);

/* --------------------------------------------------------------------------
 * 3. textoConCantidad
 * -------------------------------------------------------------------------- */
prueba('"Camisetas" + 4 → "Camisetas (4)"', textoConCantidad('Camisetas', 4) === 'Camisetas (4)');
prueba('"Abrigo" + 1 → "Abrigo" (sin paréntesis)', textoConCantidad('Abrigo', 1) === 'Abrigo');
prueba('"Frontal" sin cantidad → "Frontal"', textoConCantidad('Frontal', null) === 'Frontal');

/* --------------------------------------------------------------------------
 * 4. generarListaDesdePlantillas — el conjunto
 * -------------------------------------------------------------------------- */
const plantillas = [
  { ambito: 'general',      clave: null,         texto: 'Frontal o linterna pequeña', categoria: 'General',  formula_cantidad: null,     condicion: null,    dias_minimos: null, ultima_hora: false },
  { ambito: 'general',      clave: null,         texto: 'Cortaúñas',                  categoria: 'Aseo',     formula_cantidad: null,     condicion: null,    dias_minimos: 5,    ultima_hora: false },
  { ambito: 'tipo_viaje',   clave: 'playa',      texto: 'Sombrilla',                  categoria: 'Playa',    formula_cantidad: null,     condicion: null,    dias_minimos: null, ultima_hora: false },
  { ambito: 'tipo_viaje',   clave: 'montana',    texto: 'Mochila de ataque',          categoria: 'Excursión',formula_cantidad: null,     condicion: null,    dias_minimos: null, ultima_hora: false },
  { ambito: 'actividad',    clave: 'senderismo', texto: 'Mochila de ataque',          categoria: 'Excursión',formula_cantidad: null,     condicion: null,    dias_minimos: null, ultima_hora: false },
  { ambito: 'actividad',    clave: 'senderismo', texto: 'Termo',                      categoria: 'Excursión',formula_cantidad: null,     condicion: null,    dias_minimos: null, ultima_hora: false },
  { ambito: 'tipo_persona', clave: 'adulto',     texto: 'Camisetas manga corta',      categoria: 'Ropa',     formula_cantidad: 'dias',   condicion: 'calor', dias_minimos: null, ultima_hora: false },
  { ambito: 'tipo_persona', clave: 'adulto',     texto: 'Camisetas manga larga',      categoria: 'Ropa',     formula_cantidad: 'dias',   condicion: 'frio',  dias_minimos: null, ultima_hora: false },
  { ambito: 'tipo_persona', clave: 'adulto',     texto: 'Ropa interior',              categoria: 'Ropa',     formula_cantidad: 'dias+1', condicion: null,    dias_minimos: null, ultima_hora: false },
  { ambito: 'tipo_persona', clave: 'bebe',       texto: 'Pañales',                    categoria: 'Bebé',     formula_cantidad: 'dias*6', condicion: null,    dias_minimos: null, ultima_hora: false },
  { ambito: 'miembro',      clave: 'm1',         texto: 'Navaja multiusos',           categoria: 'Personal', formula_cantidad: null,     condicion: null,    dias_minimos: null, ultima_hora: false },
  { ambito: 'trayecto',     clave: null,         texto: 'Bocadillos',                 categoria: 'Trayecto', formula_cantidad: null,     condicion: null,    dias_minimos: null, ultima_hora: true  },
];
const miembros = [
  { id: 'm1', nombre: 'Cristian', tipo: 'adulto' },
  { id: 'm2', nombre: 'Laia',     tipo: 'bebe'   },
];

// Viaje de montaña, 3 días, frío, con senderismo, apartamento sin saber si hay sábanas.
const lista = generarListaDesdePlantillas({
  viaje: { dias: 3, condiciones: ['frio'], alojamiento: 'cocina', ropa_cama: 'confirmar' },
  tipoViajeClave: 'montana',
  actividadesClaves: ['senderismo'],
  miembros,
  plantillas,
});
const textos = lista.map((i) => i.texto);

prueba('Entra el ítem general (frontal)', textos.includes('Frontal o linterna pequeña'));
prueba('NO entra el cortaúñas (viaje de 3 días, umbral 5)', !textos.includes('Cortaúñas'));
prueba('NO entra la sombrilla (es de playa, el viaje es de montaña)', !textos.includes('Sombrilla'));
prueba('Entra el termo (actividad senderismo)', textos.includes('Termo'));
prueba('Mochila de ataque UNA sola vez (montaña + senderismo, deduplicada)',
  textos.filter((x) => x === 'Mochila de ataque').length === 1);
prueba('Con frío: manga larga sí (3 uds)', textos.includes('Camisetas manga larga (3)'));
prueba('Con frío: manga corta NO', !textos.some((x) => x.startsWith('Camisetas manga corta')));
prueba('Ropa interior días+1 → (4)', textos.includes('Ropa interior (4)'));
prueba('Pañales del bebé días*6 → (18)', textos.includes('Pañales (18)'));
prueba('Personal de Cristian entra y va asignado a él',
  lista.some((i) => i.texto === 'Navaja multiusos' && i.miembro_id === 'm1'));
prueba('La categoría de persona incorpora el nombre ("Ropa · Cristian")',
  lista.some((i) => i.categoria === 'Ropa · Cristian'));
prueba('El trayecto NO se genera en la Fase 1', !textos.includes('Bocadillos'));
prueba('Ropa de cama: sábanas y toallas para 2 personas',
  textos.includes('Juegos de sábanas (2)') && textos.includes('Toallas de casa (2)'));
prueba('Ropa de cama "no lo sé" → además la tarea de confirmar',
  lista.some((i) => i.seccion === 'tarea' && i.texto.startsWith('Confirmar con el alojamiento')));
prueba('Todos los items de equipaje nacen pendientes y de plantilla',
  lista.filter((i) => i.seccion === 'equipaje').every((i) => i.estado === 'pendiente' && i.origen === 'plantilla'));

// Viaje a hotel: nada de ropa de cama.
const listaHotel = generarListaDesdePlantillas({
  viaje: { dias: 3, condiciones: ['calor'], alojamiento: 'hotel', ropa_cama: null },
  tipoViajeClave: 'playa', actividadesClaves: [], miembros, plantillas,
});
prueba('En hotel NO se generan sábanas ni toallas',
  !listaHotel.some((i) => i.categoria === 'Ropa de cama'));
prueba('Con calor: manga corta sí',
  listaHotel.some((i) => i.texto === 'Camisetas manga corta (3)'));

// Ropa de cama incluida por el alojamiento: tampoco se genera.
const listaIncluida = generarListaDesdePlantillas({
  viaje: { dias: 3, condiciones: ['calor'], alojamiento: 'cocina', ropa_cama: 'incluida' },
  tipoViajeClave: 'playa', actividadesClaves: [], miembros, plantillas,
});
prueba('Ropa de cama "incluida" → no se genera nada de cama',
  !listaIncluida.some((i) => i.categoria === 'Ropa de cama'));

/* --------------------------------------------------------------------------
 * Pintar resultados (con textContent, como todo en este proyecto)
 * -------------------------------------------------------------------------- */
const total = resultados.length;
const ok = resultados.filter((r) => r.ok).length;
const resumen = document.getElementById('resumen');
resumen.textContent = ok === total
  ? `✅ ${ok} de ${total} pruebas correctas`
  : `❌ ${total - ok} de ${total} pruebas HAN FALLADO`;
resumen.className = ok === total ? 'todo-ok' : 'hay-fallos';

const cuerpo = document.getElementById('filas');
for (const r of resultados) {
  const tr = document.createElement('tr');
  const td1 = document.createElement('td');
  td1.textContent = r.ok ? '✅' : '❌';
  const td2 = document.createElement('td');
  td2.textContent = r.nombre;
  tr.appendChild(td1);
  tr.appendChild(td2);
  cuerpo.appendChild(tr);
}
