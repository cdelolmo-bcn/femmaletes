/* ============================================================================
 * i18n.js — Textos de la interfaz en castellano y catalán
 * ----------------------------------------------------------------------------
 * Qué hace: diccionario de TODOS los textos visibles y funciones para
 * obtenerlos y cambiar de idioma. Ningún texto visible se escribe a fuego
 * en otros módulos: todo pasa por aquí (estándar de ingeniería).
 * Depende de: config.js (clave de almacenamiento local).
 *
 * Por qué así: la decisión 2 exige interfaz bilingüe conmutable POR
 * DISPOSITIVO; por eso el idioma se guarda en el navegador, no en la base.
 * El idioma inicial se detecta del navegador (decisión 9).
 *
 * Nota: los TEXTOS DE LOS ÍTEMS (los de las plantillas y los que escribe la
 * familia) son datos, no interfaz: van en el idioma en que estén escritos y
 * no pasan por este diccionario (decisión 2 de la especificación).
 * ============================================================================ */

import { ALMACEN } from './config.js';

/** Diccionario completo. Cada clave tiene su texto en 'es' y en 'ca'. */
const TEXTOS = {
  /* --- Genéricos --- */
  app_nombre:        { es: 'FemMaletes', ca: 'FemMaletes' },
  app_lema:          { es: 'Listas de equipaje en familia', ca: 'Llistes d\u2019equipatge en família' },
  sin_registro:      { es: 'Sin registro ni contraseñas.', ca: 'Sense registre ni contrasenyes.' },
  volver:            { es: '\u2039 Atrás', ca: '\u2039 Enrere' },
  cargando:          { es: 'Cargando…', ca: 'Carregant…' },
  guardar:           { es: 'Guardar', ca: 'Desa' },
  cancelar:          { es: 'Cancelar', ca: 'Cancel·la' },
  error_red:         { es: 'No hay conexión. Inténtalo de nuevo en un momento.',
                       ca: 'No hi ha connexió. Torna-ho a provar d\u2019aquí a un moment.' },
  error_generico:    { es: 'Algo ha fallado. Vuelve a intentarlo.',
                       ca: 'Alguna cosa ha fallat. Torna-ho a provar.' },
  config_pendiente:  { es: 'Falta configurar las claves en js/config.js (ver guía de la Fase 0).',
                       ca: 'Falta configurar les claus a js/config.js (vegeu la guia de la Fase 0).' },
  banner_sin_conexion: { es: '📡 Sin conexión: los cambios no se guardarán hasta que vuelva.',
                       ca: '📡 Sense connexió: els canvis no es desaran fins que torni.' },

  /* --- Bienvenida / crear espacio / unirse --- */
  bienvenida_intro:  { es: 'Para empezar, crea el espacio de tu familia o únete a uno existente.',
                       ca: 'Per començar, crea l\u2019espai de la teva família o uneix-te a un d\u2019existent.' },
  crear_espacio:     { es: 'Crear espacio familiar', ca: 'Crear espai familiar' },
  unirse_codigo:     { es: 'Tengo un código de invitación', ca: 'Tinc un codi d\u2019invitació' },
  crear_titulo:      { es: 'Crear espacio familiar', ca: 'Crear espai familiar' },
  crear_sub:         { es: 'El espacio guarda vuestros miembros, plantillas y viajes', ca: 'L\u2019espai guarda els vostres membres, plantilles i viatges' },
  crear_nombre:      { es: 'Nombre de la familia', ca: 'Nom de la família' },
  crear_nombre_ej:   { es: 'p. ej. Familia García', ca: 'p. ex. Família García' },
  crear_btn:         { es: 'Crear espacio', ca: 'Crea l\u2019espai' },
  crear_error_nombre:{ es: 'Escribe un nombre (hasta 60 letras).', ca: 'Escriu un nom (fins a 60 lletres).' },
  unirse_titulo:     { es: 'Unirse a un espacio', ca: 'Unir-se a un espai' },
  unirse_sub:        { es: 'Pide el código o el enlace a tu familia', ca: 'Demana el codi o l\u2019enllaç a la teva família' },
  unirse_label:      { es: 'Código de invitación', ca: 'Codi d\u2019invitació' },
  unirse_btn:        { es: 'Entrar', ca: 'Entra' },
  unirse_error:      { es: 'Ese código no corresponde a ningún espacio. Revisa que esté completo.',
                       ca: 'Aquest codi no correspon a cap espai. Revisa que estigui complet.' },
  unirse_nota:       { es: 'Si te llegó un enlace por WhatsApp, basta con abrirlo: este paso se hace solo.',
                       ca: 'Si t\u2019ha arribat un enllaç per WhatsApp, només cal obrir-lo: aquest pas es fa sol.' },

  /* --- ¿Quién eres? --- */
  quien_titulo:      { es: '¿Quién eres?', ca: 'Qui ets?' },
  quien_sub:         { es: 'Este móvil quedará asociado a ese perfil', ca: 'Aquest mòbil quedarà associat a aquest perfil' },
  quien_crear:       { es: 'Crear un miembro nuevo', ca: 'Crear un membre nou' },
  quien_nota_bebes:  { es: 'Los bebés no aparecen aquí: son miembros con maleta, pero no usuarios.',
                       ca: 'Els nadons no apareixen aquí: són membres amb maleta, però no usuaris.' },
  tipo_adulto:       { es: 'adulto', ca: 'adult' },
  tipo_nino:         { es: 'niño/a', ca: 'nen/a' },
  tipo_bebe:         { es: 'bebé', ca: 'nadó' },
  miembro_nombre:    { es: 'Nombre', ca: 'Nom' },
  miembro_tipo:      { es: 'Tipo', ca: 'Tipus' },
  miembro_error:     { es: 'Escribe un nombre (hasta 40 letras).', ca: 'Escriu un nom (fins a 40 lletres).' },

  /* --- Inicio --- */
  hola:              { es: 'Hola', ca: 'Hola' },
  viajes_en_marcha:  { es: 'Viajes en marcha', ca: 'Viatges en marxa' },
  sin_viajes:        { es: 'Aún no hay viajes. Crea el primero y la lista se generará sola con vuestras plantillas.',
                       ca: 'Encara no hi ha viatges. Crea el primer i la llista es generarà sola amb les vostres plantilles.' },
  nuevo_viaje:       { es: '+ Nuevo viaje', ca: '+ Viatge nou' },
  historico:         { es: 'Histórico', ca: 'Històric' },
  archivado:         { es: 'archivado', ca: 'arxivat' },
  reactivar:         { es: 'Reactivar', ca: 'Reactiva' },
  viajeros:          { es: 'viajeros', ca: 'viatgers' },
  dias_corto:        { es: 'días', ca: 'dies' },
  progreso_prep:     { es: 'Preparación', ca: 'Preparació' },

  /* --- Nuevo viaje --- */
  nv_titulo:         { es: 'Nuevo viaje', ca: 'Viatge nou' },
  nv_sub:            { es: 'La lista se genera sola con vuestras plantillas', ca: 'La llista es genera sola amb les vostres plantilles' },
  nv_destino:        { es: 'Destino / nombre del viaje', ca: 'Destinació / nom del viatge' },
  nv_destino_ej:     { es: 'p. ej. Escapada a Francia', ca: 'p. ex. Escapada a França' },
  nv_tipo:           { es: 'Tipo de viaje', ca: 'Tipus de viatge' },
  nv_dias:           { es: 'Días', ca: 'Dies' },
  nv_fecha:          { es: 'Salida (opcional)', ca: 'Sortida (opcional)' },
  nv_clima:          { es: 'Clima esperado (elige al menos uno)', ca: 'Clima esperat (tria\u2019n almenys un)' },
  nv_actividades:    { es: 'Actividades (opcional)', ca: 'Activitats (opcional)' },
  nv_alojamiento:    { es: 'Alojamiento', ca: 'Allotjament' },
  aloja_hotel:       { es: 'Hotel / pensión', ca: 'Hotel / pensió' },
  aloja_cocina:      { es: 'Apartamento o casa con cocina 🍳', ca: 'Apartament o casa amb cuina 🍳' },
  aloja_camping:     { es: 'Camping', ca: 'Càmping' },
  nv_ropa_cama:      { es: '¿Incluye sábanas y toallas?', ca: 'Inclou llençols i tovalloles?' },
  rc_si:             { es: 'Sí', ca: 'Sí' },
  rc_no:             { es: 'No', ca: 'No' },
  rc_nose:           { es: 'No lo sé', ca: 'No ho sé' },
  nv_ropa_cama_nota: { es: 'Con «No lo sé» se generan los ítems y una tarea de confirmar con el alojamiento.',
                       ca: 'Amb «No ho sé» es generen els ítems i una tasca de confirmar-ho amb l\u2019allotjament.' },
  nv_quien:          { es: 'Quién va', ca: 'Qui hi va' },
  nv_crear:          { es: 'Crear la lista', ca: 'Crea la llista' },
  nv_error_nombre:   { es: 'Ponle nombre al viaje (hasta 80 letras).', ca: 'Posa-li nom al viatge (fins a 80 lletres).' },
  nv_error_dias:     { es: 'Los días deben ser un número entre 1 y 365.', ca: 'Els dies han de ser un número entre 1 i 365.' },
  nv_error_clima:    { es: 'Elige al menos una condición de clima: la ropa se genera según el clima.',
                       ca: 'Tria almenys una condició de clima: la roba es genera segons el clima.' },
  nv_error_miembros: { es: 'Marca al menos a una persona.', ca: 'Marca almenys una persona.' },
  nv_creando:        { es: 'Generando la lista…', ca: 'Generant la llista…' },
  cond_calor:        { es: '☀️ Calor', ca: '☀️ Calor' },
  cond_entretiempo:  { es: '🌤️ Entretiempo', ca: '🌤️ Mitja estació' },
  cond_frio:         { es: '❄️ Frío', ca: '❄️ Fred' },
  cond_lluvia:       { es: '🌧️ Lluvia', ca: '🌧️ Pluja' },

  /* --- Lista --- */
  lista_leyenda:     { es: 'Toca la casilla: ⬜ pendiente → ✓ en la maleta → 🛒 comprar → ✕ no va',
                       ca: 'Toca la casella: ⬜ pendent → ✓ a la maleta → 🛒 comprar → ✕ no va' },
  cat_otros:         { es: '✍️ Añadido a mano', ca: '✍️ Afegit a mà' },
  anadir_ph:         { es: 'Añadir algo más…', ca: 'Afegeix alguna cosa més…' },
  anadir_btn:        { es: 'Añadir', ca: 'Afegeix' },
  chip_comprar:      { es: 'comprar', ca: 'comprar' },
  chip_ultima_hora:  { es: '❄️ última hora', ca: '❄️ última hora' },
  item_ya_no_existe: { es: 'Ese ítem ya no existe; la lista se ha actualizado.',
                       ca: 'Aquest ítem ja no existeix; la llista s\u2019ha actualitzat.' },
  guardado_fallo:    { es: 'No se ha podido guardar; el cambio se ha deshecho.',
                       ca: 'No s\u2019ha pogut desar; el canvi s\u2019ha desfet.' },
  archivar_viaje:    { es: 'Archivar este viaje', ca: 'Arxiva aquest viatge' },
  archivar_confirma: { es: '¿Archivar el viaje? Podrás reactivarlo desde el histórico.',
                       ca: 'Vols arxivar el viatge? Podràs reactivar-lo des de l\u2019històric.' },
  sin_items:         { es: 'La lista está vacía.', ca: 'La llista és buida.' },

  /* --- Ajustes --- */
  aj_titulo:         { es: 'Ajustes', ca: 'Ajustos' },
  aj_miembros:       { es: '👨‍👩‍👧‍👦 Miembros', ca: '👨‍👩‍👧‍👦 Membres' },
  aj_anadir:         { es: '+ Añadir', ca: '+ Afegeix' },
  aj_baja:           { es: 'Dar de baja', ca: 'Donar de baixa' },
  aj_baja_confirma:  { es: '¿Dar de baja a esta persona? No saldrá en viajes nuevos; su historial se conserva.',
                       ca: 'Vols donar de baixa aquesta persona? No sortirà en viatges nous; el seu historial es conserva.' },
  aj_idioma:         { es: '🌐 Idioma de este dispositivo', ca: '🌐 Idioma d\u2019aquest dispositiu' },
  idioma_es:         { es: 'Castellano', ca: 'Castellà' },
  idioma_ca:         { es: 'Català', ca: 'Català' },
  aj_invitar:        { es: '✉️ Invitar a la familia', ca: '✉️ Convidar la família' },
  aj_codigo:         { es: 'Código', ca: 'Codi' },
  aj_invitar_btn:    { es: 'Enviar invitación por WhatsApp', ca: 'Envia la invitació per WhatsApp' },
  aj_copiar:         { es: 'Copiar enlace', ca: 'Copia l\u2019enllaç' },
  aj_copiado:        { es: 'Enlace copiado.', ca: 'Enllaç copiat.' },
  aj_invitar_msj:    { es: 'Únete a nuestro espacio de FemMaletes 🧳 abriendo este enlace:',
                       ca: 'Uneix-te al nostre espai de FemMaletes 🧳 obrint aquest enllaç:' },
  aj_invitar_nota:   { es: 'Invitar es una acción aparte de compartir listas: el enlace de invitación solo se envía desde aquí.',
                       ca: 'Convidar és una acció a part de compartir llistes: l\u2019enllaç d\u2019invitació només s\u2019envia des d\u2019aquí.' },
  aj_perfil:         { es: '👤 En este dispositivo eres', ca: '👤 En aquest dispositiu ets' },
  aj_cambiar_perfil: { es: 'Cambiar de perfil', ca: 'Canvia de perfil' },
  aj_espacio:        { es: '🔑 Espacio', ca: '🔑 Espai' },
  aj_cambiar_espacio:{ es: 'Salir de este espacio en este dispositivo', ca: 'Surt d\u2019aquest espai en aquest dispositiu' },
  aj_cambiar_confirma:{ es: '¿Salir del espacio en este dispositivo? Los datos no se borran; podrás volver a entrar con el código.',
                       ca: 'Vols sortir de l\u2019espai en aquest dispositiu? Les dades no s\u2019esborren; podràs tornar a entrar amb el codi.' },

  /* --- Navegación --- */
  nav_viajes:        { es: 'Viajes', ca: 'Viatges' },
  nav_lista:         { es: 'Lista', ca: 'Llista' },
  nav_ajustes:       { es: 'Ajustes', ca: 'Ajustos' },
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
 * Si la clave no existe, devuelve la clave entre corchetes: así un texto
 * olvidado se ve enseguida en pantalla en vez de fallar en silencio.
 * @param {string} clave
 * @returns {string}
 */
export function t(clave) {
  const entrada = TEXTOS[clave];
  if (!entrada) return `[${clave}]`;
  return entrada[idiomaActual()] || entrada.es;
}
