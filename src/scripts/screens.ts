// Défilement forcé (règle site entier) : un geste = un écran entier.
// Un écran plus haut que la fenêtre se lit librement à l'intérieur ; le saut reprend à son bord.
// Passage : glissement 700 ms, cubic-bezier(.7,0,.2,1). « Réduire les animations » : passage instantané.
import { reduced, reveal, EASE_SLIDE } from './motion';

export type Screens = {
  go: (to: number) => void;
  current: () => number;
  count: number;
  el: (i: number) => HTMLElement;
};

declare global { interface Window { kkScreens?: Screens } }

const EDITABLE = 'input, textarea, select, [contenteditable], iframe';

export function initScreens(host: HTMLElement): Screens {
  const S = [...host.querySelectorAll<HTMLElement>(':scope > .scr')];
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
      s.getAnimations().forEach((a) => a.cancel());
      s.classList.toggle('on', i === cur);
      s.classList.toggle('before', i < cur);
      s.style.transform = '';
    });
    // écran « peek » (pied de page) : il ne monte que de sa propre hauteur, l'écran précédent recule d'autant
    if (S[cur].hasAttribute('data-peek') && cur > 0) S[cur - 1].style.transform = `translateY(${-S[cur].offsetHeight}px)`;
    solid();
    document.documentElement.dataset.screen = String(cur);
    // flèche discrète : il reste au moins un écran après celui-ci
    if (arrow) arrow.hidden = cur >= S.length - 1 || host.hasAttribute('data-no-arrow');
    // les images des écrans voisins se chargent d'avance : rien n'apparaît en retard à l'arrivée
    [cur - 1, cur + 1, cur + 2].forEach((i) => S[i]?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((im) => (im.loading = 'eager')));
  };
  const emit = (name: string, detail: object) => host.dispatchEvent(new CustomEvent(name, { detail }));
  S.forEach((s) => s.addEventListener('scroll', solid, { passive: true }));

  const canScroll = (s: HTMLElement, dir: number) =>
    dir > 0 ? s.scrollTop + s.clientHeight < s.scrollHeight - 2 : s.scrollTop > 2;

  // passage d'écran interruptible : un nouveau geste pendant un glissement termine celui-ci aussitôt et enchaîne
  // (on n'attend jamais la fin d'une animation pour continuer à défiler)
  let tgt = 0, anims: Animation[] = [], done: (() => void) | null = null, timer = 0;
  const DUR = 650;
  const settle = () => { if (!done) return; anims.forEach((x) => x.finish()); clearTimeout(timer); const f = done; done = null; f(); };
  const step = (dir: number) => go((busy ? tgt : cur) + dir);
  function go(to: number) {
    if (busy) settle();
    if (to === cur) return;
    if (to < 0) return;
    if (to >= S.length) { emit('screens:beyond', { from: cur }); return; }
    const a = S[cur], b = S[to], dir = to > cur ? 1 : -1;
    b.scrollTop = dir > 0 ? 0 : b.scrollHeight;
    emit('screens:leave', { from: cur, to });
    dispatchEvent(new CustomEvent('kk:sound', { detail: 'slide' }));
    if (!b.hasAttribute('data-still')) dispatchEvent(new CustomEvent('kk:sound', { detail: 'letters' }));
    if (reduced()) { cur = to; place(); save(); emit('screens:enter', { index: cur }); return; }
    busy = true; tgt = to;
    a.style.zIndex = '2'; b.style.zIndex = '3';
    b.classList.add('on'); b.classList.remove('before');
    const peekIn = b.hasAttribute('data-peek'), peekOut = a.hasAttribute('data-peek');
    const o = { duration: DUR, easing: EASE_SLIDE, fill: 'forwards' as FillMode };
    if (peekIn) {
      const h = b.offsetHeight;
      anims = [b.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], o), a.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-h}px)` }], o)];
    } else if (peekOut) {
      const h = a.offsetHeight;
      anims = [b.animate([{ transform: `translateY(${-h}px)` }, { transform: 'translateY(0)' }], o), a.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], o)];
    } else {
      anims = [b.animate([{ transform: `translateY(${100 * dir}%)` }, { transform: 'translateY(0)' }], o), a.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-100 * dir}%)` }], o)];
    }
    if (!b.hasAttribute('data-still')) reveal(b, 220);
    done = () => {
      a.style.zIndex = ''; b.style.zIndex = '';
      cur = to; busy = false; place(); save();
      emit('screens:enter', { index: cur });
    };
    timer = window.setTimeout(settle, DUR + 10);
  }

  // molette / pavé tactile : un geste = un écran ; l'inertie du même geste est ignorée
  let last = 0, acc = 0, used = false, edge = false, gdir = 0, lastAbs = 0, lastGo = 0;
  const onWheel = (e: WheelEvent) => {
    const t = e.target as Element | null;
    if (t?.closest?.('[data-own-wheel]')) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const now = performance.now();
    const dir = Math.sign(e.deltaY);
    if (!dir) return;
    const abs = Math.abs(e.deltaY);
    const fresh = now - last > 160 || dir !== gdir || (abs > lastAbs * 1.6 && abs >= 10 && now - lastGo > 260);
    if (fresh) { acc = 0; used = false; gdir = dir; edge = !canScroll(busy ? S[tgt] : S[cur], dir) || busy; }
    last = now; lastAbs = abs;
    if (used || !edge) return;
    acc += e.deltaY;
    if (Math.abs(acc) > 30) { used = true; lastGo = now; step(dir); }
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
  let y0 = 0, t0 = 0, up = false, down = false;
  addEventListener('touchstart', (e) => {
    const t = e.target as Element | null;
    if (t?.closest?.('[data-own-touch]')) { y0 = NaN; return; }
    y0 = e.touches[0].clientY; t0 = performance.now();
    down = !canScroll(S[cur], 1); up = !canScroll(S[cur], -1);
  }, { passive: true });
  addEventListener('touchend', (e) => {
    if (Number.isNaN(y0)) return;
    const d = y0 - e.changedTouches[0].clientY;
    if (Math.abs(d) < 50 || performance.now() - t0 > 900) return;
    if (d > 0 && (down || busy)) step(1);
    if (d < 0 && (up || busy)) step(-1);
  }, { passive: true });

  // tabulation : le focus amène son écran
  host.addEventListener('focusin', (e) => {
    const i = S.findIndex((s) => s.contains(e.target as Node));
    if (i >= 0 && i !== cur && !busy) { cur = i; place(); save(); emit('screens:enter', { index: cur }); }
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
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { if (!busy) place(); }); });
  document.fonts?.ready.then(() => { if (!busy) place(); });
  place();
  document.documentElement.classList.add('screens');
  const api: Screens = { go, current: () => cur, count: S.length, el: (i) => S[i] };
  window.kkScreens = api;
  return api;
}
