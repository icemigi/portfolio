// Une seule page qui défile librement (natif), sans séparation entre les sections : le texte apparaît bloc par bloc
// à mesure qu'il entre dans la fenêtre. Aucun défilement imposé, aucune interception de la molette.
// Garde l'API des pages : window.kkScreens { go, current, count, el } et les événements screens:enter / leave / beyond.
import { reduced, letters } from './motion';

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

  // ---------- position de départ de chaque section ----------
  let tops: number[] = [], H = innerHeight;
  const measure = () => { H = innerHeight; tops = S.map((s) => s.getBoundingClientRect().top + scrollY); };

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
      if (from >= 0) emit('screens:leave', { from, to: i });
      emit('screens:enter', { index: i });
    }
    header?.classList.toggle('solid', scrollY > 8);
    if (arrow) arrow.hidden = atEnd() || host.hasAttribute('data-no-arrow');
  };

  // ---------- parallaxe discrète des images (et de ce qui porte data-par) ----------
  const PAR = '.im img, .cov, .mimg, [data-par]';
  const parEls = [...host.querySelectorAll<HTMLElement>(PAR)].map((el) => ({ el, k: Number(el.dataset.par || 60) }));
  const frame = () => {
    if (reduced()) return;
    parEls.forEach(({ el, k }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -H * 0.5 || r.top > H * 1.5) return;
      const d = (r.top + r.height / 2 - H / 2) / H; // -0,5 … 0,5 autour du centre de la fenêtre
      el.style.translate = `0 ${(d * k * 0.35).toFixed(1)}px`;
    });
  };
  let raf = 0;
  const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; update(); frame(); }); };
  addEventListener('scroll', onScroll, { passive: true });

  // ---------- apparition : chaque bloc de texte monte lettre par lettre quand il entre dans la fenêtre ----------
  const BLOCK = 'h1, h2, h3, p, li, dt, dd, figcaption, .bt, .lab, .mail';
  const blocks = S.flatMap((s, i) => (i === 0 || s.hasAttribute('data-still')) ? [] : [...s.querySelectorAll<HTMLElement>(BLOCK)])
    .filter((el, _, all) => !all.some((o) => o !== el && o.contains(el))); // le bloc le plus large seulement
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const b = e.target as HTMLElement;
    // les lettres montent sans attente (les images arrivent en fondu, voir .pre) : le texte suit le défilement
    letters(b, 0); b.classList.remove('pre'); // masqué jusqu'ici : pas d'éclair avant l'apparition
  }), { rootMargin: '0px 0px -12% 0px' });
  blocks.forEach((b) => { if (!reduced()) b.classList.add('pre'); io.observe(b); });

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
