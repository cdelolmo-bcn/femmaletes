/* ============================================================================
 * ui/ajustes.js — Ajustes: miembros, idioma, invitar, perfil y espacio
 * ----------------------------------------------------------------------------
 * Qué hace: la pantalla de gestión (flujo F9). Miembros con alta y baja
 * lógica; idioma del dispositivo; invitación a la familia (acción separada
 * y explícita, decisión I10: las listas compartidas nunca llevarán el
 * código); cambiar de perfil; y salir del espacio (decisión I11: al cambiar
 * de espacio se re-elige "yo soy…", cosa que estado.js ya garantiza).
 * El editor de plantillas llega en la Fase 4.
 * Depende de: comunes, quien (reutiliza su formulario), api, estado, nucleo, i18n.
 * ============================================================================ */

import { el, tagCabecera, toast, pill } from './comunes.js';
import { formularioMiembro } from './quien.js';
import * as api from '../api.js';
import { estado, olvidarFamilia, olvidarPerfil } from '../estado.js';
import { irA, repintar } from '../nucleo.js';
import { t, idiomaActual, cambiarIdioma } from '../i18n.js';

const AVATAR = { adulto: '🧑', nino: '🧒', bebe: '👶' };
let mostrandoAlta = false;

/** Pantalla de ajustes. */
export function pintarAjustes(raiz) {
  raiz.appendChild(tagCabecera('⚙️ ' + t('aj_titulo'), estado.familia ? estado.familia.nombre : ''));

  raiz.appendChild(cardMiembros());
  raiz.appendChild(cardIdioma());
  raiz.appendChild(cardInvitar());
  raiz.appendChild(cardPerfilYEspacio());
}

/** Tarjeta de gestión de miembros (alta y baja lógica). */
function cardMiembros() {
  const card = el('div', 'card', '');
  card.appendChild(el('h3', 'titulo-seccion', t('aj_miembros')));

  for (const m of estado.miembros.filter((x) => x.activo)) {
    const fila = el('div', 'fila check-fila', '');
    fila.appendChild(el('span', 'crece', `${AVATAR[m.tipo] || ''} ${m.nombre}`));
    fila.appendChild(pill(t(m.tipo === 'adulto' ? 'tipo_adulto' : m.tipo === 'nino' ? 'tipo_nino' : 'tipo_bebe')));
    const baja = el('button', 'btn btn-sec btn-mini', t('aj_baja'));
    baja.addEventListener('click', async () => {
      if (!confirm(t('aj_baja_confirma'))) return;
      baja.disabled = true;
      try {
        await api.desactivarMiembro(m.id);
        m.activo = false;
        // Si el perfil de este dispositivo era esa persona, se re-elige.
        if (estado.yo && estado.yo.id === m.id) {
          olvidarPerfil();
          estado.yo = null;
          irA('quien');
          return;
        }
        repintar();
      } catch (e) { toast(t(e.message)); baja.disabled = false; }
    });
    fila.appendChild(baja);
    card.appendChild(fila);
  }

  if (!mostrandoAlta) {
    const btn = el('button', 'btn btn-sec btn-mini mt', t('aj_anadir'));
    btn.addEventListener('click', () => { mostrandoAlta = true; repintar(); });
    card.appendChild(btn);
  } else {
    card.appendChild(formularioMiembro(() => { mostrandoAlta = false; repintar(); }));
  }
  return card;
}

/** Tarjeta del idioma del dispositivo. */
function cardIdioma() {
  const card = el('div', 'card', '');
  card.appendChild(el('h3', 'titulo-seccion', t('aj_idioma')));
  const tabs = el('div', 'tabs', '');
  const activo = idiomaActual();
  for (const [codigo, clave] of [['es', 'idioma_es'], ['ca', 'idioma_ca']]) {
    const tab = el('button', 'tab' + (activo === codigo ? ' sel' : ''), t(clave));
    tab.addEventListener('click', () => { cambiarIdioma(codigo); repintar(); });
    tabs.appendChild(tab);
  }
  card.appendChild(tabs);
  return card;
}

/** Tarjeta de invitación (decisión I10: acción separada de compartir listas). */
function cardInvitar() {
  const card = el('div', 'card', '');
  card.appendChild(el('h3', 'titulo-seccion', t('aj_invitar')));

  const codigo = el('p', 'muted', t('aj_codigo') + ': ');
  codigo.appendChild(el('b', '', estado.familia.id));
  card.appendChild(codigo);

  // Enlace de invitación: la URL de la app + ?familia=código (F2).
  const enlace = `${location.origin}${location.pathname}?familia=${estado.familia.id}`;

  const btnWhats = el('button', 'btn btn-sec btn-mini', t('aj_invitar_btn'));
  btnWhats.addEventListener('click', () => {
    const texto = encodeURIComponent(`${t('aj_invitar_msj')} ${enlace}`);
    window.open('https://wa.me/?text=' + texto, '_blank', 'noopener');
  });
  card.appendChild(btnWhats);

  const btnCopiar = el('button', 'btn btn-sec btn-mini ml', t('aj_copiar'));
  btnCopiar.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(enlace);
      toast(t('aj_copiado'));
    } catch (e) {
      // Algunos navegadores antiguos no dejan copiar: se muestra para copiar a mano.
      prompt(t('aj_copiar'), enlace);
    }
  });
  card.appendChild(btnCopiar);

  card.appendChild(el('p', 'muted nota', t('aj_invitar_nota')));
  return card;
}

/** Tarjeta del perfil del dispositivo y del espacio. */
function cardPerfilYEspacio() {
  const card = el('div', 'card', '');
  card.appendChild(el('h3', 'titulo-seccion', t('aj_perfil')));
  card.appendChild(el('p', '', estado.yo ? `${AVATAR[estado.yo.tipo] || ''} ${estado.yo.nombre}` : '—'));

  const btnPerfil = el('button', 'btn btn-sec btn-mini', t('aj_cambiar_perfil'));
  btnPerfil.addEventListener('click', () => {
    olvidarPerfil();
    estado.yo = null;
    irA('quien');
  });
  card.appendChild(btnPerfil);

  card.appendChild(el('h3', 'titulo-seccion mt', t('aj_espacio')));
  const btnSalir = el('button', 'btn btn-sec btn-mini', t('aj_cambiar_espacio'));
  btnSalir.addEventListener('click', () => {
    if (!confirm(t('aj_cambiar_confirma'))) return;
    olvidarFamilia();           // borra también el perfil (I11)
    estado.familia = null;
    estado.yo = null;
    estado.viajeAbierto = null;
    irA('bienvenida');
  });
  card.appendChild(btnSalir);
  return card;
}
