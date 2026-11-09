// Curseur du site (ordinateur seulement) : une flèche taillée, noire à liseré clair (visible sur tous les fonds).
// Sur un élément cliquable, elle pivote et grandit un peu ; au clic, elle se resserre. Aucun retard : la pointe suit la souris exactement.
// Champs de texte et fenêtres intégrées : curseur système.
import { reduced } from './motion';

export function initCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || document.documentElement.classList.contains('embed')) return;
  const root = document.documentElement;
  const cu = document.createElement('div');
  cu.className = 'cu'; cu.setAttribute('aria-hidden', 'true');
  cu.innerHTML = '<svg viewBox="0 0 22 22" width="22" height="22"><path d="M2 2 L19 9.2 L11.2 11.2 L9.2 19 Z" fill="#111" stroke="#f3f3f3" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  document.body.append(cu);
  root.classList.add('has-cursor');
  const LINK = 'a, button, [role="button"], label, summary, [data-go], [data-stage], .obj';
  const TEXT = 'input, textarea, [contenteditable], select, iframe';
  let x = -100, y = -100, s = 1, ts = 1, r = 0, tr = 0, raf = 0;
  const loop = () => {
    const k = reduced() ? 1 : 0.25;
    s += (ts - s) * k; r += (tr - r) * k;
    cu.style.transform = `translate(${x}px, ${y}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
    raf = Math.abs(ts - s) > 0.002 || Math.abs(tr - r) > 0.05 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  let link = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY; root.classList.add('cu-on');
    const t = e.target as Element;
    link = !!t.closest?.(LINK);
    root.classList.toggle('cu-link', link);
    root.classList.toggle('cu-text', !!t.closest?.(TEXT));
    ts = link ? 1.18 : 1; tr = link ? -14 : 0; kick();
  }, { passive: true });
  addEventListener('pointerdown', () => { ts = link ? 0.95 : 0.85; kick(); });
  addEventListener('pointerup', () => { ts = link ? 1.18 : 1; kick(); });
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) root.classList.remove('cu-on'); });
}
