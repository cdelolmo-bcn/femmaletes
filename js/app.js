/* ============================================================================
 * app.js — Arranque y enrutado de FemMaletes
 * ----------------------------------------------------------------------------
 * Qué hace: punto de entrada. Procesa el enlace de invitación (?familia=…),
 * restaura el espacio y el perfil guardados en el dispositivo, carga los
 * datos y pinta la pantalla que toque. También enruta entre pantallas y
 * pinta los elementos comunes (banner de conexión, navegación inferior).
 * Depende de: todos los módulos.
 * ============================================================================ */

import * as api from './api.js';
import { estado, familiaGuardada, guardarFamilia, perfilGuardado } from './estado.js';
import { registrarPintado, irA, repintar } from './nucleo.js';
import { t } from './i18n.js';
import { VERSION } from './version.js';
import { el, navInferior, bannerConexion } from './ui/comunes.js';
import { cargarDatosFamilia } from './datos.js';
import { pintarBienvenida, pintarCrearEspacio, pintarUnirse } from './ui/bienvenida.js';
import { pintarQuien } from './ui/quien.js';
import { pintarInicio } from './ui/inicio.js';
import { pintarNuevoViaje } from './ui/nuevoViaje.js';
import { pintarLista } from './ui/lista.js';
import { pintarAjustes } from './ui/ajustes.js';

const raiz = document.getElementById('app');

/** Mapa de pantallas → función que la pinta. */
const PANTALLAS = {
  bienvenida: pintarBienvenida,
  crear_espacio: pintarCrearEspacio,
  unirse: pintarUnirse,
  quien: pintarQuien,
  inicio: pintarInicio,
  nuevo_viaje: pintarNuevoViaje,
  lista: pintarLista,
  ajustes: pintarAjustes,
};

/** Pantallas que muestran la navegación inferior. */
const CON_NAV = new Set(['inicio', 'lista', 'ajustes']);

/** Pinta la pantalla actual completa (banner + contenido + navegación). */
function pintar() {
  raiz.replaceChildren();

  const banner = bannerConexion();
  if (banner) raiz.appendChild(banner);

  const pintarPantalla = PANTALLAS[estado.pantalla];
  if (pintarPantalla) pintarPantalla(raiz);
  else raiz.appendChild(el('p', 'muted centrado', t('cargando')));

  // Navegación inferior solo en las pantallas principales.
  const navPrevia = document.querySelector('.nav');
  if (navPrevia) navPrevia.remove();
  if (CON_NAV.has(estado.pantalla)) document.body.appendChild(navInferior());
}

/**
 * Si la URL trae ?familia=… (enlace de invitación, flujo F2), valida el
 * código, vincula el dispositivo y limpia la URL para que el enlace no se
 * quede pegado en marcadores o recargas.
 * @returns {Promise<boolean>} true si se procesó una invitación válida
 */
async function procesarEnlaceInvitacion() {
  const codigo = new URLSearchParams(location.search).get('familia');
  if (!codigo) return false;
  history.replaceState(null, '', location.pathname);
  try {
    const familia = await api.obtenerFamilia(codigo);
    if (!familia) return false;
    guardarFamilia(familia.id); // si era otro espacio, borra el perfil (I11)
    estado.familia = familia;
    return true;
  } catch (e) {
    return false; // sin red: se sigue con lo que hubiera guardado
  }
}

/** Arranque completo de la app. */
async function arrancar() {
  document.getElementById('version').textContent = VERSION;
  registrarPintado(pintar);

  // Repintar cuando cambia la red, para que el banner aparezca/desaparezca.
  window.addEventListener('online', repintar);
  window.addEventListener('offline', repintar);

  if (!api.configurada()) {
    estado.conexion = 'sin_configurar';
    raiz.replaceChildren(el('div', 'card conexion sin_configurar', t('config_pendiente')));
    return;
  }

  pintar(); // "Cargando…" mientras llegan los datos

  // 1. ¿Llega por enlace de invitación?
  await procesarEnlaceInvitacion();

  // 2. ¿Hay espacio guardado en el dispositivo?
  if (!estado.familia) {
    const codigo = familiaGuardada();
    if (codigo) {
      try {
        estado.familia = await api.obtenerFamilia(codigo);
      } catch (e) {
        // Sin red en el arranque: no se desvincula el dispositivo por eso.
        irA('bienvenida');
        return;
      }
    }
  }

  if (!estado.familia) { irA('bienvenida'); return; }

  // 3. Cargar todos los datos de la familia.
  try {
    await cargarDatosFamilia();
  } catch (e) {
    irA('bienvenida');
    return;
  }

  // 4. ¿Hay perfil válido en el dispositivo? (debe ser un miembro activo)
  // Nota: si el enlace de invitación era de OTRO espacio, guardarFamilia ya
  // borró el perfil (I11); si era del mismo, el perfil sigue valiendo.
  const perfilId = perfilGuardado();
  estado.yo = estado.miembros.find((m) => m.id === perfilId && m.activo) || null;

  irA(estado.yo ? 'inicio' : 'quien');
}

arrancar();
