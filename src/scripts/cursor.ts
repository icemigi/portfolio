// Curseur du site (ordinateur seulement), sobre : un point noir, toujours visible (liseré clair pour les fonds sombres).
// Sur un élément cliquable, le point s'ouvre en cercle léger ; au clic, il se resserre. Aucun retard : il suit la souris exactement.
// Champs de texte et fenêtres intégrées : curseur système.
import { reduced } from './motion';

export function initCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || document.documentElement.classList.contains('embed')) return;
  const root = document.documentElement;
  const cu = document.createElement('div');
  cu.className = 'cu'; cu.setAttribute('aria-hidden', 'true');
  document.body.append(cu);
  root.classList.add('has-cursor');
  const LINK = 'a, button, [role="button"], [data-copy], label, summary, [data-go], [data-stage], .obj';
  const TEXT = 'input, textarea, [contenteditable], select, iframe';
  let x = -100, y = -100, s = 0.3, ts = 0.3, raf = 0;
  const loop = () => {
    s += (ts - s) * (reduced() ? 1 : 0.25);
    cu.style.transform = `translate(${x}px, ${y}px) scale(${s.toFixed(3)})`;
    raf = Math.abs(ts - s) > 0.002 ? requestAnimationFrame(loop) : 0;
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
    ts = link ? 1 : 0.3; kick();
  }, { passive: true });
  addEventListener('pointerdown', () => { ts = link ? 0.8 : 0.22; kick(); });
  addEventListener('pointerup', () => { ts = link ? 1 : 0.3; kick(); });
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) root.classList.remove('cu-on'); });
}
