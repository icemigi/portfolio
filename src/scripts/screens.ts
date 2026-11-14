// Défilement aimanté (règle site entier) : le vrai défilement du navigateur, avec son inertie et à la vitesse du geste,
// et un calage CSS (scroll-snap obligatoire) sur l'écran le plus proche à l'arrêt. Aucun geste n'est jamais perdu ni retardé.
// Un écran plus haut que la fenêtre se lit librement à l'intérieur ; arrivé à son bord, le défilement continue vers le suivant.
// Le script ne fait plus défiler lui-même (sauf flèche, clavier, liens) : il suit la position pour l'écran courant,
// l'apparition des textes, la parallaxe, les sons et les événements screens:leave / screens:enter / screens:beyond.
import { reduced, revealScrub } from './motion';

export type Screens = {
  go: (to: number) => void;
  current: () => number;
  count: number;
  el: (i: number) => HTMLElement;
  revealFirst: (delay?: number) => void;
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
  // écran d'ouverture choisi avant le premier affichage (Base.astro : langue, retour, rechargement, retour d'une étude de cas)
  const at = (window as any).kkAt;
  if (typeof at === 'number') cur = Math.min(S.length - 1, Math.max(0, at));
  else if (nav?.type === 'back_forward' || nav?.type === 'reload' || (window as any).kkSwapped) {
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
  // repère de position (« 02 / 05 ») à gauche de la flèche : des écrans aimantés ne laissent pas deviner la longueur de la page
  const pos = S.length > 1 && !free ? document.createElement('span') : null;
  const p2 = (n: number) => String(n).padStart(2, '0');
  if (pos) { pos.className = 'scr-pos mono mu'; pos.setAttribute('aria-hidden', 'true'); document.body.appendChild(pos); }
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
    if (pos) { pos.innerHTML = `<span class="ac">${p2(cur + 1)}</span> / ${p2(S.length)}`; pos.hidden = host.hasAttribute('data-no-arrow'); }
    // les images des écrans voisins se chargent d'avance : rien n'apparaît en retard à l'arrivée
    [cur - 1, cur + 1, cur + 2].forEach((i) => S[i]?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((im) => (im.loading = 'eager')));
  };
  S.forEach((s) => s.addEventListener('scroll', () => header?.classList.toggle('solid', s.scrollTop > 8), { passive: true }));

  // apparition des textes (14/11) : le défilement la déclenche, elle se joue dans le temps, avec sa vraie durée — comme une
  // timeline GSAP ou les classes « in-view » répétées de Locomotive. Un écran qui commence à entrer dans le cadre (par le bas ou par
  // le haut) joue son apparition en entier (libellés, lettres mélangées, vignettes, apartés, images), depuis là où elle en est ;
  // un écran qui commence à sortir par le bas (on remonte) la joue à l'envers, plus vite, depuis la dernière lettre écrite ; un écran
  // qui sort par le haut (on descend) reste écrit (14/11, demandé) ; sorti du cadre, il est remis
  // à zéro, prêt à rejouer. Chaque retour sur un écran rejoue donc son apparition.
  // (Relier les lettres à la position du défilement ne marche pas avec des écrans aimantés : le navigateur fait la moitié du
  // trajet en 100 ms, le début du texte apparaissait d'un bloc.)
  // Les écrans sont préparés une seule fois, à l'arrêt (texte découpé en lettres) ; ensuite on ne règle que l'instant de leur
  // apparition — découper le texte de l'écran calé en plein geste faisait recaler le navigateur (geste perdu).
  type Ctl = { total: number; text: number; set: (t: number) => void; t: number; target: number; raf: number; d?: number };
  const ctl = new Map<HTMLElement, Ctl>();
  const BACK = 2.2; // vitesse du rembobinage
  const run = (c: Ctl) => {
    if (c.raf) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last; last = now;
      if (c.target > c.t) c.t = Math.min(c.target, c.t + dt);
      else if (c.target < c.t) c.t = Math.max(c.target, (c.t > c.text ? c.text : c.t) - dt * BACK); // à l'envers : depuis la dernière lettre écrite
      c.set(c.t);
      c.raf = c.t !== c.target ? requestAnimationFrame(step) : 0;
    };
    c.raf = requestAnimationFrame(step);
  };
  const aim = (c: Ctl, target: number) => { if (c.target === target) return; c.target = target; run(c); };
  const make = (s: HTMLElement): Ctl => { const c = { ...revealScrub(s), t: 0, target: 0, raf: 0 }; ctl.set(s, c); return c; };
  const first = S[cur];                                          // l'écran ouvert : préparé par son apparition (revealFirst)
  const prepare = () => S.forEach((s) => {
    if (free || reduced() || s.hasAttribute('data-still') || ctl.has(s) || s === first) return;
    make(s);                                                      // caché (instant 0) jusqu'à son entrée dans le cadre
  });
  const scrub = (y: number) => {
    if (free || reduced()) return;
    ctl.forEach((c, s) => {
      const ad = Math.abs(s.offsetTop - y);
      const p = ad >= H ? 0 : 1 - ad / H;                         // 1 = posé, 0 = hors du cadre (dessous ou dessus)
      const coming = c.d === undefined || ad < c.d, going = c.d !== undefined && ad > c.d;
      c.d = ad;
      if (p <= 0.001) { cancelAnimationFrame(c.raf); c.raf = 0; c.target = 0; if (c.t) { c.t = 0; c.set(0); } return; } // sorti : prêt à rejouer
      if (p >= 0.999 || coming || s.offsetTop < y) aim(c, c.total); // il entre, il est posé, ou il sort par le haut (on descend) : l'apparition se joue / reste écrite
      else if (going) aim(c, 0);                                  // il sort par le bas (on remonte) : elle se rembobine
    });
  };
  // premier écran, à l'ouverture de la page : son apparition se joue après le délai demandé
  const revealFirst = (delay = 150) => {
    if (free || reduced()) return;
    const s = S[cur]; if (!s || s.hasAttribute('data-still')) return;
    const c = ctl.get(s) || make(s);
    c.d = 0;
    setTimeout(() => aim(c, c.total), delay);
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
  const api: Screens = { go, current: () => cur, count: S.length, el: (i) => S[i], revealFirst: (d) => { document.fonts.ready.then(() => { prepare(); revealFirst(d); scrub(host.scrollTop); }); } };
  // les autres écrans sont préparés dès que les polices sont prêtes (à l'arrêt), et cachés jusqu'à leur entrée
  document.fonts.ready.then(() => { prepare(); scrub(host.scrollTop); });
  window.kkScreens = api;
  return api;
}
