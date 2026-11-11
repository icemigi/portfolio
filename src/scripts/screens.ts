// Défilement forcé (règle site entier) : un geste = un écran entier.
// Un écran plus haut que la fenêtre se lit librement à l'intérieur ; le saut reprend à son bord.
// Passage : glissement 480 ms, cubic-bezier(.45,0,.15,1), interruptible sans à-coup. « Réduire les animations » : passage instantané.
import { reduced, reveal, settle } from './motion';
import { wheelGesture } from './gesture';

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
  const key = `kk-scr:${location.pathname}`;
  let cur = 0, busy = false;

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (nav?.type === 'back_forward' || nav?.type === 'reload') {
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
    arrow.addEventListener('click', () => step(1));
    document.body.appendChild(arrow);
  }
  const save = () => { try { sessionStorage.setItem(key, String(cur)); } catch { /* */ } };
  const solid = () => header?.classList.toggle('solid', S[cur].scrollTop > 8);
  const place = () => {
    S.forEach((s, i) => {
      s.classList.toggle('on', i === cur);
      s.classList.toggle('before', i < cur);
    });
    solid();
    document.documentElement.dataset.screen = String(cur);
    // flèche discrète : il reste au moins un écran après celui-ci
    if (arrow) arrow.hidden = cur >= S.length - 1 || host.hasAttribute('data-no-arrow');
    // les images des écrans voisins se chargent d'avance : rien n'apparaît en retard à l'arrivée
    [cur - 1, cur + 1, cur + 2].forEach((i) => S[i]?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((im) => (im.loading = 'eager')));
  };
  const emit = (name: string, detail: object) => host.dispatchEvent(new CustomEvent(name, { detail }));
  S.forEach((s) => s.addEventListener('scroll', solid, { passive: true }));
  // le conteneur ne défile jamais lui-même : un focus (tabulation, champ) peut le faire glisser et décaler toute la bande
  host.addEventListener('scroll', () => { if (host.scrollTop || host.scrollLeft) { host.scrollTop = 0; host.scrollLeft = 0; } }, { passive: true });

  // un écran ne se lit à l'intérieur que s'il défile vraiment (overflow:hidden = débord voulu, ex. le nom de l'accueil)
  const canScroll = (s: HTMLElement, dir: number) =>
    getComputedStyle(s).overflowY !== 'hidden' && (dir > 0 ? s.scrollTop + s.clientHeight < s.scrollHeight - 2 : s.scrollTop > 2);

  // Bande continue : les écrans sont posés les uns sous les autres, une seule valeur « scroll » les fait tous défiler.
  // T[i] = valeur de scroll où l'écran i est en place. Un nouveau geste en plein passage change seulement la cible :
  // la course repart de la position et de la vitesse du moment (aucun saut, aucune animation qui se chevauche).
  let T: number[] = [], H = 0, scroll = 0, tgt = cur, raf = 0, vel = 0, lastT = 0;
  let mv: { p0: number; v0: number; t0: number; d: number } | null = null;
  const PAR = '.im img, .cov, .vi, .door, .mimg, [data-par]';
  // parallaxe : ordinateur seulement (sur téléphone, le décalage ne se voit pas et coûte une écriture par image et par élément)
  const phone = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const parEls = S.map((s) => (phone ? [] : [...s.querySelectorAll<HTMLElement>(PAR)].map((el) => ({ el, k: Number(el.dataset.par || 80) }))));
  const parOn = S.map(() => false);
  const measure = () => {
    H = host.clientHeight || innerHeight;
    let y = 0; T = [];
    S.forEach((s, i) => {
      const peek = s.hasAttribute('data-peek');
      // écran « peek » (pied de page) : calé en bas, il ne fait monter la bande que de sa propre hauteur
      T.push(peek ? y - (H - s.offsetHeight) : y);
      y += peek ? s.offsetHeight : H;
    });
  };
  const wasVis: boolean[] = [];
  const gone = new Set<HTMLElement>();
  const idle = (fn: () => void) => ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(fn, { timeout: 800 }) : setTimeout(fn, 200));
  const flush = () => idle(() => { if (busy) return; gone.forEach((s) => { if (!wasVis[S.indexOf(s)]) settle(s); }); gone.clear(); });
  const render = () => {
    S.forEach((s, i) => {
      const d = T[i] - scroll;
      const vis = d > -H - 2 && d < H + 2;
      // écran sorti du cadre : son texte animé sera recollé hors de la vue, une fois le glissement fini (aucun saut, aucun à-coup)
      if (wasVis[i] && !vis) gone.add(s);
      wasVis[i] = vis;
      s.style.transform = `translate3d(0, ${Math.round(d * 100) / 100}px, 0)`;
      s.style.visibility = vis ? '' : 'hidden';
      // parallaxe : images (et data-par) décalées selon la distance de leur écran au cadre, nulles à l'arrêt
      const live = vis && Math.abs(d) > 0.5;
      if (live) { parEls[i].forEach(({ el, k }) => (el.style.translate = `0 ${((d / H) * k).toFixed(2)}px`)); parOn[i] = true; }
      else if (parOn[i]) { parEls[i].forEach(({ el }) => (el.style.translate = '')); parOn[i] = false; }
    });
  };
  // courbe du glissement (cubic-bezier .45,0,.15,1) ; la vitesse héritée s'éteint par u(1-u)^3
  const bez = (x: number) => {
    const X = (t: number) => 3 * (1 - t) * (1 - t) * t * 0.45 + 3 * (1 - t) * t * t * 0.15 + t * t * t;
    const Y = (t: number) => 3 * (1 - t) * t * t + t * t * t;
    let lo = 0, hi = 1, t = x;
    for (let n = 0; n < 24; n++) { const v = X(t); if (Math.abs(v - x) < 1e-5) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return Y(t);
  };
  // son de molette : CRANS clics par écran parcouru, déclenchés par la position réelle de la bande (ils accélèrent et ralentissent
  // avec la course, sans minuterie à part) ; le dernier cran, plus mat, tombe à l'arrivée
  const CRANS = 8;
  let cran = 0;
  const sound = (name: string, v?: number) => dispatchEvent(new CustomEvent('kk:sound', { detail: { name, v } }));
  const crank = () => {
    const k = Math.floor(scroll / (H / CRANS));
    if (k === cran) return;
    cran = k;
    sound('tick', Math.min(1, 0.45 + Math.abs(vel) * 0.25));
  };
  const DUR = 480; // départ plus franc (courbe .45,0,.15,1) : le geste répond tout de suite, l'arrivée reste douce
  const arrive = () => {
    mv = null; busy = false; vel = 0; scroll = T[tgt]; pend = null;
    cur = tgt; place(); save();
    emit('screens:enter', { index: cur });
    flush();
  };
  const tick = (now: number) => {
    raf = 0;
    if (!mv) return;
    const u = Math.min(1, (now - mv.t0) / mv.d);
    const p1 = T[tgt];
    const prev = scroll;
    scroll = p1 + (mv.p0 - p1) * (1 - bez(u)) + mv.v0 * mv.d * u * (1 - u) ** 3;
    scroll = Math.max(T[0], Math.min(T[T.length - 1], scroll));
    if (lastT) vel = (scroll - prev) / Math.max(1, now - lastT);
    lastT = now;
    if (u >= 1) { arrive(); render(); sound('notch'); return; }
    render(); crank();
    raf = requestAnimationFrame(tick);
  };
  const revealed = new Map<HTMLElement, number>();
  let pend: HTMLElement | null = null;
  const step = (dir: number) => go((busy ? tgt : cur) + dir);
  function go(to: number) {
    const from = busy ? tgt : cur;
    if (to === from) return;
    if (to < 0) return;
    if (to >= S.length) { emit('screens:beyond', { from }); return; }
    const b = S[to], dir = to > from ? 1 : -1;
    // on arrive par le haut ou par le bas de l'écran ; un écran à débord masqué garde son cadrage (le « le » de l'accueil déborde)
    b.scrollTop = dir > 0 || getComputedStyle(b).overflowY === 'hidden' ? 0 : b.scrollHeight;
    emit('screens:leave', { from, to });
    tgt = to;
    if (reduced()) { arrive(); render(); sound('notch'); return; }
    cran = Math.floor(scroll / (H / CRANS));
    busy = true;
    b.classList.add('on');
    const now = performance.now();
    const n = Math.abs(to - from);
    mv = { p0: scroll, v0: mv ? vel : 0, t0: now, d: DUR * Math.min(1.6, 1 + 0.15 * (n - 1)) };
    lastT = now;
    if (!raf) raf = requestAnimationFrame(tick);
    // apparition des lettres : elles sont masquées tout de suite mais ne montent que dans la fin du glissement
    // (deux mouvements lourds ne se superposent pas) ; un écran simplement traversé est affiché d'un coup
    if (pend && pend !== b) { pend.getAnimations({ subtree: true }).forEach((x) => x.finish()); revealed.delete(pend); }
    pend = null;
    // le découpage du texte attend deux images : le glissement démarre d'abord, sans à-coup
    if (!b.hasAttribute('data-still') && now - (revealed.get(b) || -1e4) > 1400) {
      revealed.set(b, now); pend = b;
      const d0 = mv.d;
      requestAnimationFrame(() => requestAnimationFrame(() => { if (pend === b) reveal(b, Math.max(0, Math.round(d0 * 0.55) - 33)); }));
    }
  }

  // molette / pavé tactile : un geste = un écran (règles dans gesture.ts)
  const gesture = wheelGesture((dir) => !canScroll(busy ? S[tgt] : S[cur], dir) || busy);
  const onWheel = (e: WheelEvent) => {
    const t = e.target as Element | null;
    if (t?.closest?.('[data-own-wheel]')) return;
    if (e.ctrlKey) return; // pincement du pavé (zoom) : pas un défilement
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    // l'heure du geste, pas celle du traitement : si la page se fige un instant, l'inertie n'a pas l'air d'une pause (donc d'un nouveau geste)
    const now = e.timeStamp + ((e.view as Window | null)?.performance.timeOrigin ?? performance.timeOrigin) - performance.timeOrigin;
    const dir = gesture(now, e.deltaY);
    if (dir) step(dir);
  };
  addEventListener('wheel', onWheel, { passive: true });
  // une iframe du même site (générateur) ne doit pas bloquer le défilement : on écoute aussi sa molette
  host.querySelectorAll('iframe').forEach((f) => f.addEventListener('load', () => {
    try { f.contentWindow?.addEventListener('wheel', (e) => onWheel(e as WheelEvent), { passive: true }); } catch { /* autre origine */ }
  }));

  // clavier
  addEventListener('keydown', (e) => {
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
    if (!busy && canScroll(s, dir)) s.scrollBy({ top: dir * (page ? s.clientHeight * 0.85 : 64), behavior: reduced() ? 'auto' : 'smooth' });
    else step(dir);
  });

  // doigt : le glissement fait passer d'écran quand l'écran courant est déjà à son bord
  let y0 = 0, x0 = 0, t0 = 0, up = false, down = false;
  addEventListener('touchstart', (e) => {
    const t = e.target as Element | null;
    if (e.touches.length > 1 || t?.closest?.('[data-own-touch]')) { y0 = NaN; return; }
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; t0 = performance.now();
    down = !canScroll(S[cur], 1); up = !canScroll(S[cur], -1);
  }, { passive: true });
  // le passage part dès que le doigt a glissé de 36 px (sans attendre qu'il quitte l'écran) : plus de latence
  let fired = false;
  const swipe = (yNow: number, xNow: number) => {
    if (Number.isNaN(y0) || fired || (visualViewport?.scale ?? 1) > 1.05) return; // page zoomée : le doigt s'y déplace, il ne change pas d'écran
    const d = y0 - yNow;
    if (Math.abs(d) < 36 || performance.now() - t0 > 900) return;
    if (Math.abs(x0 - xNow) > Math.abs(d)) return; // glissement surtout horizontal : pas un changement d'écran
    if (d > 0 && (down || busy)) { fired = true; step(1); }
    if (d < 0 && (up || busy)) { fired = true; step(-1); }
  };
  addEventListener('touchstart', () => { fired = false; }, { passive: true });
  addEventListener('touchmove', (e) => swipe(e.touches[0].clientY, e.touches[0].clientX), { passive: true });
  addEventListener('touchend', (e) => swipe(e.changedTouches[0].clientY, e.changedTouches[0].clientX), { passive: true });

  // tabulation : le focus amène son écran
  host.addEventListener('focusin', (e) => {
    const i = S.findIndex((s) => s.contains(e.target as Node));
    if (i >= 0 && i !== cur && !busy) { host.scrollTop = 0; tgt = i; arrive(); render(); }
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
  // la hauteur change (barre d'adresse du téléphone qui apparaît ou disparaît) : en plein glissement, la course est remise
  // à l'échelle de la nouvelle hauteur au lieu de sauter vers une position calculée avec l'ancienne
  const relayout = () => {
    const h0 = H; measure();
    if (!busy) scroll = T[cur];
    else if (h0 && H !== h0) { const k = H / h0; scroll *= k; if (mv) { mv.p0 *= k; mv.v0 *= k; } vel *= k; }
    render();
  };
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(relayout); });
  document.fonts?.ready.then(relayout);
  measure(); scroll = T[cur]; tgt = cur; place(); render();
  document.documentElement.classList.add('screens');
  const api: Screens = { go, current: () => cur, count: S.length, el: (i) => S[i] };
  window.kkScreens = api;
  return api;
}
