// Défilement libre (natif) avec effet de pile : chaque écran qui tient dans la fenêtre reste collé en haut
// (position: sticky) pendant que le suivant glisse par-dessus ; l'écran recouvert recule légèrement (profondeur).
// Les écrans plus hauts que la fenêtre défilent normalement. Aucun défilement imposé, aucune interception de la molette.
// Garde l'API des pages : window.kkScreens { go, current, count, el } et les événements screens:enter / leave / beyond.
import { reduced, reveal } from './motion';

export type Screens = {
  go: (to: number) => void;
  current: () => number;
  count: number;
  el: (i: number) => HTMLElement;
};

declare global { interface Window { kkScreens?: Screens } }

export function initScreens(host: HTMLElement): Screens {
  const S = [...host.querySelectorAll<HTMLElement>(':scope > .scr')];
  const header = document.querySelector<HTMLElement>('.site-header');
  const root = document.documentElement;
  const emit = (name: string, detail: object) => host.dispatchEvent(new CustomEvent(name, { detail }));
  root.classList.add('flow');

  // ---------- mesure : quels écrans s'empilent, où commence chacun ----------
  let tops: number[] = [], H = innerHeight;
  const measure = () => {
    H = innerHeight;
    S.forEach((s) => s.classList.remove('stk'));
    const y0 = scrollY;
    tops = S.map((s) => s.getBoundingClientRect().top + y0);
    S.forEach((s, i) => {
      // s'empile s'il tient dans la fenêtre (le pied de page « peek » et le dernier écran défilent normalement)
      if (!s.hasAttribute('data-peek') && s.offsetHeight <= H + 2 && i < S.length - 1) s.classList.add('stk');
      s.style.zIndex = String(i + 1);
    });
  };

  // ---------- écran courant, événements, son ----------
  let cur = -1;
  const currentAt = () => { const y = scrollY + H * 0.5; let i = 0; tops.forEach((t, k) => { if (t <= y) i = k; }); return i; };
  const arrow = S.length > 1 ? document.createElement('button') : null;
  if (arrow) {
    arrow.type = 'button'; arrow.className = 'more-arrow mono';
    arrow.setAttribute('aria-label', root.lang === 'fr' ? 'Écran suivant' : 'Next screen');
    arrow.innerHTML = '<span aria-hidden="true">↓</span>';
    arrow.addEventListener('click', () => go(Math.min(S.length - 1, cur + 1)));
    document.body.appendChild(arrow);
  }
  const atEnd = () => scrollY + H >= root.scrollHeight - 4;
  const update = () => {
    const i = currentAt();
    if (i !== cur) {
      const from = cur; cur = i;
      root.dataset.screen = String(i);
      if (from >= 0) { emit('screens:leave', { from, to: i }); dispatchEvent(new CustomEvent('kk:sound', { detail: 'slide' })); }
      emit('screens:enter', { index: i });
    }
    header?.classList.toggle('solid', scrollY > 8);
    if (arrow) arrow.hidden = atEnd() || host.hasAttribute('data-no-arrow');
  };

  // ---------- pile : l'écran recouvert recule et s'assombrit à peine ; parallaxe des images ----------
  const PAR = '.im img, .cov, .vi, .door, .mimg, [data-par]';
  const parEls = S.map((s) => [...s.querySelectorAll<HTMLElement>(PAR)].map((el) => ({ el, k: Number(el.dataset.par || 80) })));
  const frame = () => {
    if (reduced()) return;
    S.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.bottom < -H || r.top > H * 2) return;
      // recouvrement par l'écran suivant : 0 (libre) → 1 (entièrement recouvert)
      const nx = S[i + 1]?.getBoundingClientRect();
      const cov = s.classList.contains('stk') && nx ? Math.min(1, Math.max(0, 1 - nx.top / H)) : 0;
      s.style.translate = cov ? `0 ${(-cov * H * 0.12).toFixed(1)}px` : '';
      s.style.setProperty('--cov', cov.toFixed(3));
      // parallaxe : décalage proportionnel à la distance de l'écran au cadre
      const d = r.top / H;
      parEls[i].forEach(({ el, k }) => (el.style.translate = Math.abs(d) < 0.002 ? '' : `0 ${(d * k * 0.6).toFixed(1)}px`));
    });
  };
  let raf = 0;
  const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; update(); frame(); }); };
  addEventListener('scroll', onScroll, { passive: true });

  // ---------- apparition : les lettres montent quand l'écran entre vraiment dans la fenêtre (une fois) ----------
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const s = e.target as HTMLElement;
    if (s === S[0] || s.hasAttribute('data-still')) return; // le premier écran apparaît au chargement (site.ts)
    reveal(s, 60);
  }), { threshold: 0.3 });
  S.forEach((s) => io.observe(s));

  // ---------- au-delà du dernier écran : la molette ou le doigt qui insistent en bas de page ----------
  let push = 0, pushT = 0;
  addEventListener('wheel', (e) => {
    if (!atEnd() || e.deltaY <= 0) { push = 0; return; }
    const now = performance.now(); if (now - pushT > 400) push = 0; pushT = now;
    push += e.deltaY; if (push > 260) { push = -1e9; emit('screens:beyond', { from: cur }); }
  }, { passive: true });
  let ty = 0;
  addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', (e) => { if (atEnd() && ty - e.changedTouches[0].clientY > 90) emit('screens:beyond', { from: cur }); }, { passive: true });

  // ---------- navigation programmée ----------
  function go(to: number) {
    if (to < 0) return;
    if (to >= S.length) { emit('screens:beyond', { from: cur }); return; }
    scrollTo({ top: tops[to], behavior: reduced() ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest?.('[data-go]') as HTMLElement | null;
    if (!a) return;
    e.preventDefault(); go(Number(a.dataset.go));
  });

  const relayout = () => { measure(); update(); frame(); };
  let rz = 0;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(relayout); });
  document.fonts?.ready.then(relayout);
  addEventListener('load', relayout);
  relayout();
  const api: Screens = { go, current: () => Math.max(0, cur), count: S.length, el: (i) => S[i] };
  window.kkScreens = api;
  return api;
}
