// Défilement aimanté (règle site entier) : le vrai défilement du navigateur, avec son inertie et à la vitesse du geste,
// et un calage CSS (scroll-snap obligatoire) sur l'écran le plus proche à l'arrêt. Aucun geste n'est jamais perdu ni retardé.
// Un écran plus haut que la fenêtre se lit librement à l'intérieur ; arrivé à son bord, le défilement continue vers le suivant.
// Le script ne fait plus défiler lui-même (sauf flèche, clavier, liens) : il suit la position pour l'écran courant,
// l'apparition des textes, la parallaxe, les sons et les événements screens:leave / screens:enter / screens:beyond.
import { reduced, revealScrub, settle } from './motion';

export type Screens = {
  go: (to: number) => void;
  current: () => number;
  count: number;
  el: (i: number) => HTMLElement;
};

declare global { interface Window { kkScreens?: Screens } }

const EDITABLE = 'input, textarea, select, [contenteditable], iframe';

export function initScreens(host: HTMLElement): Screens {
  // écrans affichés seulement (certains n'existent que sur téléphone, d'autres que sur ordinateur)
  const S = [...host.querySelectorAll<HTMLElement>(':scope > .scr')].filter((s) => getComputedStyle(s).display !== 'none');
  const header = document.querySelector<HTMLElement>('.site-header');
  // défilement libre (flow.ts) : la page défile d'un bloc ; ce moteur ne garde que go() (liens « Haut ↑ »), le reste est inerte
  const free = host.classList.contains('free');
  const key = `kk-scr:${location.pathname}`;
  let cur = 0;

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  // retour, rechargement, ou changement de langue (on rouvre le même écran dans l'autre langue)
  if (nav?.type === 'back_forward' || nav?.type === 'reload' || (window as any).kkSwapped) {
    try { cur = Math.min(S.length - 1, Math.max(0, Number(sessionStorage.getItem(key)) || 0)); } catch { /* */ }
  }
  if (location.hash) {
    const i = S.findIndex((s) => s.id === location.hash.slice(1));
    if (i >= 0) cur = i;
  }

  // flèche « il y a une suite » (en bas à droite) ; un clic fait passer à l'écran suivant
  const arrow = S.length > 1 ? document.createElement('button') : null;
  if (arrow) {
    arrow.type = 'button'; arrow.className = 'more-arrow mono';
    arrow.setAttribute('aria-label', document.documentElement.lang === 'fr' ? 'Écran suivant' : 'Next screen');
    arrow.innerHTML = '<span aria-hidden="true">↓</span>';
    arrow.addEventListener('click', () => go(cur + 1));
    document.body.appendChild(arrow);
  }
  const save = () => { try { sessionStorage.setItem(key, String(cur)); } catch { /* */ } };
  const emit = (name: string, detail: object) => host.dispatchEvent(new CustomEvent(name, { detail }));
  const sound = (name: string, v?: number) => dispatchEvent(new CustomEvent('kk:sound', { detail: { name, v } }));

  // positions de calage : haut de chaque écran ; le pied de page (data-peek) se cale par le bas
  let T: number[] = [], H = 0, max = 0;
  const measure = () => {
    H = host.clientHeight || innerHeight;
    max = host.scrollHeight - H;
    T = S.map((s) => Math.min(max, s.hasAttribute('data-peek') ? s.offsetTop + s.offsetHeight - H : s.offsetTop));
  };
  const nearest = (y: number) => { let k = 0; T.forEach((t, i) => { if (Math.abs(t - y) < Math.abs(T[k] - y)) k = i; }); return y >= max - 2 ? S.length - 1 : k; };

  const place = () => {
    S.forEach((s, i) => { s.classList.toggle('on', i === cur); s.classList.toggle('before', i < cur); });
    header?.classList.toggle('solid', S[cur].scrollTop > 8);
    document.documentElement.dataset.screen = String(cur);
    if (arrow) arrow.hidden = cur >= S.length - 1 || host.hasAttribute('data-no-arrow');
    // les images des écrans voisins se chargent d'avance : rien n'apparaît en retard à l'arrivée
    [cur - 1, cur + 1, cur + 2].forEach((i) => S[i]?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((im) => (im.loading = 'eager')));
  };
  S.forEach((s) => s.addEventListener('scroll', () => header?.classList.toggle('solid', s.scrollTop > 8), { passive: true }));

  // apparition des textes pilotée par le défilement (14/11, comme le suivi de progression de Locomotive) : un écran qui entre
  // par le bas s'écrit au fil de sa montée (libellés, lettres mélangées, vignettes, apartés), il est entièrement écrit une fois
  // posé ; si l'on remonte, il s'efface à l'envers, au même rythme que le geste. Un écran posé, ou sorti du cadre, est recollé tel
  // quel (crénage intact). Les écrans au-dessus du cadre restent écrits.
  const ctl = new Map<HTMLElement, { total: number; text: number; set: (t: number) => void; t?: number }>();
  let scrubY = 0;
  const scrub = (y: number) => {
    if (free || reduced()) return;
    const up = y < scrubY; scrubY = y;
    S.forEach((s) => {
      if (s.hasAttribute('data-still')) return;
      const d = s.offsetTop - y;                                  // haut de l'écran par rapport au cadre
      const p = d >= H ? 0 : d <= 0 ? 1 : 1 - d / H;              // 0 = encore sous le cadre, 1 = posé (ou au-dessus)
      let c = ctl.get(s);
      if (p <= 0.001 || p >= 0.999) { if (c) { c.set(p >= 0.999 ? c.total : 0); settle(s); ctl.delete(s); } return; }
      if (!c) { c = revealScrub(s); ctl.set(s, c); }
      // descente : l'écriture démarre au premier mouvement (libellés et première lettre tout de suite), puis suit le trajet en
      // ralentissant au début (courbe p^1,5), et finit au moment où l'écran se pose.
      // remontée : le rembobinage part dès le premier pixel, depuis les dernières lettres écrites (les finitions invisibles sont
      // sautées), et va plus vite : tout est effacé à mi-chemin.
      const t = up
        ? Math.min(c.t ?? c.text, c.text * Math.max(0, Math.min(1, (p - 0.5) / 0.48)))
        : 110 + Math.pow(p, 1.5) * (c.text - 110);
      c.t = t; c.set(t);
    });
  };

  // parallaxe : ordinateur seulement ; images (et data-par) décalées selon la distance de leur écran au cadre
  const phone = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const PAR = '.vi, .door, [data-par]';
  const parEls = S.map((s) => (phone ? [] : [...s.querySelectorAll<HTMLElement>(PAR)].map((el) => ({ el, k: Number(el.dataset.par || 80) }))));
  const parallax = (y: number) => S.forEach((_, i) => {
    const d = T[i] - y, live = Math.abs(d) < H * 1.1 && Math.abs(d) > 0.5;
    parEls[i].forEach(({ el, k }) => (el.style.translate = live ? `0 ${((d / H) * k).toFixed(2)}px` : ''));
  });

  // son de molette : un cran par huitième d'écran parcouru (pas plus d'un toutes les 28 ms), un cran mat à l'arrêt
  let cran = 0, lastTick = 0, lastY = 0, lastT = 0;
  const crank = (y: number, now: number) => {
    const k = Math.floor(y / (H / 8));
    if (k === cran) return;
    cran = k;
    if (now - lastTick < 28) return;
    lastTick = now;
    const v = Math.abs(y - lastY) / Math.max(1, now - lastT);
    sound('tick', Math.min(1, 0.45 + v * 0.25));
  };

  // suivi du défilement : écran courant (screens:leave dès qu'on change d'écran le plus proche), puis screens:enter à l'arrêt
  let raf = 0, idle = 0, settled = true;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = host.scrollTop, now = performance.now();
      const n = nearest(y);
      if (n !== cur) { emit('screens:leave', { from: cur, to: n }); cur = n; place(); }
      parallax(y); crank(y, now); scrub(y);
      lastY = y; lastT = now; settled = false;
      clearTimeout(idle);
      idle = window.setTimeout(arrive, 140); // (scrollend n'existe pas partout : on attend 140 ms de calme)
    });
  };
  const arrive = () => {
    if (settled) return;
    settled = true;
    cur = nearest(host.scrollTop); place(); save();
    sound('notch');
    emit('screens:enter', { index: cur });
  };
  host.addEventListener('scroll', onScroll, { passive: true });

  // aller à un écran (flèche, clavier, liens « Haut ↑ ») : défilement doux du navigateur, le calage fait le reste
  function go(to: number) {
    if (free) { const y = S[Math.max(0, Math.min(S.length - 1, to))].getBoundingClientRect().top + scrollY; const l = (window as any).kkLenis; if (l) l.scrollTo(y); else scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' }); return; }
    if (to >= S.length) { emit('screens:beyond', { from: cur }); return; }
    if (to < 0 || to === nearest(host.scrollTop) && Math.abs(host.scrollTop - T[to]) < 2) return;
    host.scrollTo({ top: T[to], behavior: reduced() ? 'auto' : 'smooth' });
  }

  // au-delà du dernier écran (études de cas : ouvrir le projet suivant) : un geste vers le bas alors qu'on est déjà tout en bas
  let push = 0, pushT = 0, beyondT = 0;
  const beyond = (d: number) => {
    if (free) return;
    if (cur !== S.length - 1 || host.scrollTop < max - 2 || d <= 0) { push = 0; return; }
    const now = performance.now();
    if (now - pushT > 300) push = 0;
    pushT = now; push += d;
    if (push > 140 && now - beyondT > 1200) { beyondT = now; push = 0; emit('screens:beyond', { from: cur }); }
  };
  addEventListener('wheel', (e) => { if (!(e.target as Element | null)?.closest?.('[data-own-wheel]')) beyond(e.deltaY); }, { passive: true });
  let ty = 0;
  addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => { const y = e.touches[0].clientY; beyond(ty - y); ty = y; }, { passive: true });

  // une iframe du même site (générateur) ne doit pas bloquer le défilement : sa molette fait défiler la page
  host.querySelectorAll('iframe').forEach((f) => f.addEventListener('load', () => {
    try { f.contentWindow?.addEventListener('wheel', (e) => host.scrollBy({ top: (e as WheelEvent).deltaY }), { passive: true }); } catch { /* autre origine */ }
  }));

  // clavier : un écran long se lit d'abord à l'intérieur ; sinon flèches, page et espace passent à l'écran voisin
  const canScroll = (s: HTMLElement, dir: number) =>
    getComputedStyle(s).overflowY !== 'hidden' && (dir > 0 ? s.scrollTop + s.clientHeight < s.scrollHeight - 2 : s.scrollTop > 2);
  addEventListener('keydown', (e) => {
    if (free) return; // défilement libre : le clavier fait défiler la page normalement
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as Element | null;
    if (t?.closest?.(EDITABLE) || t?.closest?.('[data-own-keys]')) return;
    let dir = 0, page = false;
    if (e.key === 'ArrowDown') dir = 1;
    else if (e.key === 'ArrowUp') dir = -1;
    else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) { dir = 1; page = true; }
    else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) { dir = -1; page = true; }
    else if (e.key === 'Home') { e.preventDefault(); go(0); return; }
    else if (e.key === 'End') { e.preventDefault(); go(S.length - 1); return; }
    if (!dir) return;
    if (e.key === ' ' && t?.closest?.('a, button')) return;
    e.preventDefault();
    const s = S[cur];
    if (canScroll(s, dir)) s.scrollBy({ top: dir * (page ? s.clientHeight * 0.85 : 64), behavior: reduced() ? 'auto' : 'smooth' });
    else if (dir > 0 && cur === S.length - 1) emit('screens:beyond', { from: cur });
    else go(cur + dir);
  });

  // liens « Haut ↑ » et ancres internes
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest?.('[data-go]') as HTMLElement | null;
    if (!a) return;
    e.preventDefault();
    go(Number(a.dataset.go));
  });

  addEventListener('pagehide', save);
  let rz = 0;
  const relayout = () => { const keep = cur; measure(); host.scrollTop = T[keep]; parallax(host.scrollTop); };
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(relayout); });
  document.fonts?.ready.then(() => { if (settled) relayout(); });

  document.documentElement.classList.add('screens');
  measure();
  host.scrollTop = T[cur];
  lastY = host.scrollTop; cran = Math.floor(lastY / (H / 8));
  place();
  scrub(host.scrollTop);
  const api: Screens = { go, current: () => cur, count: S.length, el: (i) => S[i] };
  window.kkScreens = api;
  return api;
}
