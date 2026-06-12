/* ============================================================================
 * ui/quien.js — "¿Quién eres?": la identidad ligera por dispositivo
 * ----------------------------------------------------------------------------
 * Qué hace: el selector de perfil (spec 2.2). Solo ofrece adultos y niños
 * activos (los bebés son miembros con maleta, no usuarios: I9) y permite
 * crear un miembro nuevo desde aquí (I8: cubrir el caso de unirse a un
 * espacio recién creado donde aún no existen los miembros).
 * Depende de: comunes, api, estado, nucleo, i18n.
 * ============================================================================ */

import { el, tagCabecera, toast } from './comunes.js';
import * as api from '../api.js';
import { estado, guardarPerfil } from '../estado.js';
import { irA, repintar } from '../nucleo.js';
import { t } from '../i18n.js';

/** Avatares por tipo (solo decorativos). */
const AVATAR = { adulto: '🧑', nino: '🧒', bebe: '👶' };

let mostrandoFormulario = false;

/** Pantalla del selector "yo soy…". */
export function pintarQuien(raiz) {
  raiz.appendChild(tagCabecera(t('quien_titulo'), t('quien_sub')));

  // Solo adultos y niños activos (I9).
  const elegibles = estado.miembros.filter((m) => m.activo && m.tipo !== 'bebe');
  for (const m of elegibles) {
    const b = el('button', 'perfil', '');
    b.appendChild(el('span', 'av', AVATAR[m.tipo] || '🙂'));
    const texto = el('span', '', m.nombre + ' ');
    texto.appendChild(el('span', 'muted', '· ' + t(m.tipo === 'adulto' ? 'tipo_adulto' : 'tipo_nino')));
    b.appendChild(texto);
    b.addEventListener('click', () => {
      guardarPerfil(m.id);
      estado.yo = m;
      irA('inicio');
    });
    raiz.appendChild(b);
  }

  if (!mostrandoFormulario) {
    const crear = el('button', 'perfil', '');
    crear.appendChild(el('span', 'av av-claro', '＋'));
    crear.appendChild(el('span', '', t('quien_crear')));
    crear.addEventListener('click', () => { mostrandoFormulario = true; repintar(); });
    raiz.appendChild(crear);
  } else {
    raiz.appendChild(formularioMiembro(() => { mostrandoFormulario = false; repintar(); }));
  }

  raiz.appendChild(el('p', 'muted', t('quien_nota_bebes')));
}

/**
 * Formulario de alta de miembro (lo reutiliza la pantalla de ajustes).
 * @param {Function} alTerminar - se llama al crear o cancelar
 * @returns {HTMLElement}
 */
export function formularioMiembro(alTerminar) {
  const card = el('div', 'card', '');
  card.appendChild(el('label', '', t('miembro_nombre')));
  const input = el('input', '', '');
  input.maxLength = 40;
  card.appendChild(input);

  card.appendChild(el('label', '', t('miembro_tipo')));
  const tabs = el('div', 'tabs', '');
  let tipoElegido = 'adulto';
  const opciones = [['adulto', 'tipo_adulto'], ['nino', 'tipo_nino'], ['bebe', 'tipo_bebe']];
  for (const [tipo, clave] of opciones) {
    const tab = el('button', 'tab' + (tipo === tipoElegido ? ' sel' : ''), t(clave));
    tab.addEventListener('click', () => {
      tipoElegido = tipo;
      for (const otro of tabs.children) otro.classList.remove('sel');
      tab.classList.add('sel');
    });
    tabs.appendChild(tab);
  }
  card.appendChild(tabs);

  const fila = el('div', 'fila mt', '');
  const guardar = el('button', 'btn btn-pri', t('guardar'));
  guardar.addEventListener('click', async () => {
    const nombre = input.value.trim();
    if (!nombre || nombre.length > 40) { toast(t('miembro_error')); return; }
    guardar.disabled = true;
    try {
      const nuevo = await api.crearMiembro(estado.familia.id, nombre, tipoElegido);
      estado.miembros.push(nuevo);
      estado.miembros.sort((a, b) => a.nombre.localeCompare(b.nombre));
      alTerminar();
    } catch (e) {
      toast(t(e.message));
      guardar.disabled = false;
    }
  });
  const cancelar = el('button', 'btn btn-sec', t('cancelar'));
  cancelar.addEventListener('click', alTerminar);
  fila.appendChild(guardar);
  fila.appendChild(cancelar);
  card.appendChild(fila);
  return card;
}
