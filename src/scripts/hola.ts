// Évitement du curseur : les lettres et les images s'écartent de la souris en vague.
// La ligne au-dessus du curseur monte, celle du dessous descend, celles à côté s'écartent un peu ; tout retombe en douceur.
// Indépendant de l'apparition lettre par lettre : chaque caractère est enveloppé une fois pour toutes dans un span .hc
// (décalage par top/left, crénage intact) ; l'apparition anime ses propres spans .ch à l'intérieur, les deux décalages s'additionnent.
// Cibles : [data-hola] ; réglages par cible : data-hola="poussée écart rayon". Ordinateur seulement ; rien si « Réduire les animations ».
import { reduced } from './motion';
const DEF = { A: 0.26, SPREAD: 0.06, SIGMA: 90 }; // poussée verticale (em), écart horizontal (em), rayon (px)
const SKIP = '.note, .bp, .vi, .door, .mono, svg';
const SOLID = '.vi, .door'; // images : bougent d'un bloc

type It = { el: HTMLElement; k: number; cx: number; cy: number; y: number; x: number };

function wrap(root: HTMLElement): HTMLElement[] {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue?.trim() && !n.parentElement?.closest(`${SKIP}, .hc`) ? 1 : 2),
  });
  const nodes: Text[] = []; while (w.nextNode()) nodes.push(w.currentNode as Text);
  for (const n of nodes) {
    const f = document.createDocumentFragment();
    for (const c of n.nodeValue!) {
      if (/\s/.test(c)) { f.appendChild(document.createTextNode(c)); continue; }
      const s = document.createElement('span'); s.className = 'hc'; s.textContent = c; f.appendChild(s);
    }
    n.replaceWith(f);
  }
  return [...root.querySelectorAll<HTMLElement>('.hc'), ...root.querySelectorAll<HTMLElement>(SOLID)];
}

export function initHola() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-hola]').forEach((el) => {
    const [a, s, r] = (el.dataset.hola || '').split(' ').map(Number);
    const A = a || DEF.A, SPREAD = s || DEF.SPREAD, SIGMA = r || DEF.SIGMA;
    const solids = new Set(el.querySelectorAll<HTMLElement>(SOLID));
    let items: It[] = wrap(el).map((e) => ({ el: e, k: solids.has(e) ? 0.6 : 1, cx: 0, cy: 0, y: 0, x: 0 }));
    let mx = -1e4, my = -1e4, raf = 0, inside = false;
    const measure = () => {
      // une autre animation a pu reconstruire le texte : on réenveloppe si besoin
      if (items.some((it) => !it.el.isConnected)) items = wrap(el).map((e) => ({ el: e, k: solids.has(e) ? 0.6 : 1, cx: 0, cy: 0, y: 0, x: 0 }));
      for (const it of items) {
        const b = it.el.getBoundingClientRect();
        // position de repos : on retire le décalage en cours
        const fs = parseFloat(getComputedStyle(it.el).fontSize) || 16;
        it.cx = b.left + b.width / 2 - it.x * fs; it.cy = b.top + b.height / 2 - it.y * fs;
      }
    };
    const loop = () => {
      let moving = false;
      for (const it of items) {
        const dx = it.cx - mx, dy = it.cy - my;
        const g = inside ? Math.exp(-(dx * dx + dy * dy * 2.2) / (2 * SIGMA * SIGMA)) : 0;
        const ty = A * g * Math.tanh(dy / 18) * it.k, tx = SPREAD * g * Math.tanh(dx / 30) * it.k;
        it.y += (ty - it.y) * 0.15; it.x += (tx - it.x) * 0.15;
        if (Math.abs(it.y) > 0.002 || Math.abs(it.x) > 0.002 || g > 0.01) moving = true;
        it.el.style.top = `${it.y.toFixed(3)}em`; it.el.style.left = `${it.x.toFixed(3)}em`;
      }
      if (!moving && !inside) { for (const it of items) { it.el.style.top = ''; it.el.style.left = ''; } raf = 0; return; }
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener('pointerenter', (e) => {
      if (reduced()) return;
      inside = true; mx = e.clientX; my = e.clientY; measure();
      if (!raf) raf = requestAnimationFrame(loop);
    });
    el.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; });
    el.addEventListener('pointerleave', () => { inside = false; });
    // l'écran glisse : on remesure au prochain passage
    addEventListener('resize', () => inside && measure());
  });
}
