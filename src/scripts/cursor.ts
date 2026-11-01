// Curseur du site (ordinateur seulement) : un point exact et un anneau qui le suit avec un léger retard.
// Sur un élément cliquable, l'anneau s'ouvre et le point disparaît ; au clic, l'anneau se resserre ;
// sur ce qui se saisit (objets, page Ce que j'aime), il annonce la prise. Blanc en « différence » : lisible sur clair comme sur sombre.
// Champs de texte : curseur système. « Réduire les animations » : l'anneau suit sans retard.
import { reduced } from './motion';

export function initCursor() {
  // pas de curseur maison dans une fenêtre du bureau du Lab (le curseur de la page parente s'arrête au bord)
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || document.documentElement.classList.contains('embed')) return;
  const root = document.documentElement;
  const dot = document.createElement('div'), ring = document.createElement('div');
  dot.className = 'cu-dot'; ring.className = 'cu-ring';
  dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
  document.body.append(ring, dot);
  root.classList.add('has-cursor');
  const LINK = 'a, button, [role="button"], [data-copy], label, summary, [data-go]';
  const GRAB = '[data-stage], [data-likes] .stage, .obj';
  const TEXT = 'input, textarea, [contenteditable], select';
  let x = -100, y = -100, rx = -100, ry = -100, raf = 0, shown = false;
  const loop = () => {
    const k = reduced() ? 1 : 0.2;
    rx += (x - rx) * k; ry += (y - ry) * k;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; rx = x; ry = y; root.classList.add('cu-on'); }
    const t = e.target as Element;
    root.classList.toggle('cu-link', !!t.closest?.(LINK));
    root.classList.toggle('cu-grab', !t.closest?.(LINK) && !!t.closest?.(GRAB));
    root.classList.toggle('cu-text', !!t.closest?.(TEXT));
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  addEventListener('pointerdown', () => root.classList.add('cu-down'));
  addEventListener('pointerup', () => root.classList.remove('cu-down'));
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) { shown = false; root.classList.remove('cu-on'); } });
}
