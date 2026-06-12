/* ============================================================================
 * ui/bienvenida.js — Pantallas de entrada: bienvenida, crear espacio, unirse
 * ----------------------------------------------------------------------------
 * Qué hace: el flujo F1 (primer arranque): crear un espacio familiar (la base
 * copia el catálogo estándar) o unirse con un código. El flujo F2 (enlace de
 * invitación) lo gestiona app.js al arrancar leyendo ?familia= de la URL.
 * Depende de: comunes, api, estado, nucleo, i18n.
 * ============================================================================ */

import { el, tagCabecera, botonVolver, toast } from './comunes.js';
import * as api from '../api.js';
import { estado, guardarFamilia } from '../estado.js';
import { irA } from '../nucleo.js';
import { t } from '../i18n.js';
import { cargarDatosFamilia } from '../datos.js';

/** Pantalla inicial: elegir entre crear espacio o unirse. */
export function pintarBienvenida(raiz) {
  raiz.appendChild(tagCabecera(t('app_nombre'), t('app_lema')));

  const card = el('div', 'card centrado', '');
  card.appendChild(el('div', 'icono-grande', '🧳'));
  card.appendChild(el('p', 'muted intro', t('bienvenida_intro')));
  const btnCrear = el('button', 'btn btn-pri', t('crear_espacio'));
  btnCrear.addEventListener('click', () => irA('crear_espacio'));
  const btnUnirse = el('button', 'btn btn-sec', t('unirse_codigo'));
  btnUnirse.addEventListener('click', () => irA('unirse'));
  card.appendChild(btnCrear);
  card.appendChild(btnUnirse);
  raiz.appendChild(card);

  raiz.appendChild(el('p', 'muted centrado pie', t('sin_registro')));
}

/** Pantalla de crear espacio: pide el nombre de la familia. */
export function pintarCrearEspacio(raiz) {
  raiz.appendChild(botonVolver('bienvenida'));
  raiz.appendChild(tagCabecera(t('crear_titulo'), t('crear_sub')));

  const card = el('div', 'card', '');
  card.appendChild(el('label', '', t('crear_nombre')));
  const input = el('input', '', '');
  input.placeholder = t('crear_nombre_ej');
  input.maxLength = 60;
  card.appendChild(input);

  const btn = el('button', 'btn btn-pri mt', t('crear_btn'));
  btn.addEventListener('click', async () => {
    const nombre = input.value.trim();
    // Validación en la app con mensaje amable (la base re-valida por su cuenta).
    if (!nombre || nombre.length > 60) { toast(t('crear_error_nombre')); return; }
    btn.disabled = true; btn.textContent = t('cargando');
    try {
      const codigo = await api.crearFamilia(nombre);
      guardarFamilia(codigo);
      estado.familia = { id: codigo, nombre };
      await cargarDatosFamilia();
      irA('quien'); // primer paso tras crear: elegir/crear "yo soy…" (I8)
    } catch (e) {
      toast(t(e.message));
      btn.disabled = false; btn.textContent = t('crear_btn');
    }
  });
  card.appendChild(btn);
  raiz.appendChild(card);
}

/** Pantalla de unirse: pide el código de invitación. */
export function pintarUnirse(raiz) {
  raiz.appendChild(botonVolver('bienvenida'));
  raiz.appendChild(tagCabecera(t('unirse_titulo'), t('unirse_sub')));

  const card = el('div', 'card', '');
  card.appendChild(el('label', '', t('unirse_label')));
  const input = el('input', '', '');
  input.placeholder = 'a1b2c3d4-…';
  card.appendChild(input);

  const btn = el('button', 'btn btn-pri mt', t('unirse_btn'));
  btn.addEventListener('click', async () => {
    const codigo = input.value.trim();
    btn.disabled = true; btn.textContent = t('cargando');
    try {
      const familia = codigo ? await api.obtenerFamilia(codigo) : null;
      if (!familia) {
        toast(t('unirse_error'));
        btn.disabled = false; btn.textContent = t('unirse_btn');
        return;
      }
      guardarFamilia(familia.id);
      estado.familia = familia;
      await cargarDatosFamilia();
      irA('quien');
    } catch (e) {
      toast(t(e.message));
      btn.disabled = false; btn.textContent = t('unirse_btn');
    }
  });
  card.appendChild(btn);
  raiz.appendChild(card);

  raiz.appendChild(el('p', 'muted', t('unirse_nota')));
}
