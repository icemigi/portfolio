// Étude de cas ([lang]/work/[slug].astro) : registre des rubriques, ajustement du texte, anneau « projet
// suivant », profondeur des images, légendes au survol, visionneuse. Les arrivées par un objet de la scène Projets et par
// « projet suivant » sont des transitions nommées (case-object, case-title) : le navigateur fait voyager l'objet ou le titre
// de sa place sur la page quittée jusqu'à sa place sur la page de garde.
import { navigate } from 'astro:transitions/client';
import { onPage } from '../page';
import { screens } from '../screens';
import { letters, reduced } from '../motion';

const CASE = /^\/(fr|en)\/work\/([^/]+)\/$/, STAGE = /^\/(fr|en)\/(work\/)?$/;
// retour vers la scène (page Projets ou accueil) : l'objet de la page de garde repart à sa place sur la scène — le nom est posé
// sur la page quittée avant le début de la transition (l'image de l'ancienne page est prise juste après la préparation)
document.addEventListener('astro:before-preparation', (e) => {
  const ev = e as Event & { to: URL };
  if (reduced() || !CASE.test(location.pathname) || !STAGE.test(ev.to.pathname)) return;
  const o = document.querySelector<HTMLElement>('[data-cobj] .shape'); if (o) o.style.viewTransitionName = 'case-object';
});
// noms de transition posés sur la page d'arrivée, le temps de l'échange (un seul élément par nom dans chaque page)
document.addEventListener('astro:before-swap', (e) => {
  const ev = e as Event & { from: URL; to: URL; info?: { next?: boolean; object?: { slug: string } }; newDocument: Document };
  if (reduced()) return;
  if (ev.info?.next) { const v = ev.newDocument.querySelector<HTMLElement>('.case-h1 .vt'); if (v) v.style.viewTransitionName = 'case-title'; }
  if (ev.info?.object) { const o = ev.newDocument.querySelector<HTMLElement>(`[data-cobj][data-slug="${ev.info.object.slug}"] .shape`); if (o) o.style.viewTransitionName = 'case-object'; }
  // retour vers la scène : l'objet du projet quitté, sur la scène d'arrivée
  if (CASE.test(ev.from.pathname) && STAGE.test(ev.to.pathname)) {
    const o = ev.newDocument.querySelector<HTMLElement>(`[data-scene] .obj a[href="${ev.from.pathname}"]`)?.closest('.obj')?.querySelector<HTMLElement>('.shape');
    if (o) o.style.viewTransitionName = 'case-object';
  }
});
// transition finie : les noms sont retirés (la page suivante pourra les reprendre)
document.addEventListener('astro:page-load', () => document.querySelectorAll<HTMLElement>('.case-h1 .vt, [data-cobj] .shape, .obj .shape').forEach((el) => (el.style.viewTransitionName = '')));

onPage('.screens-host.case', (ctx) => {
  // arrivée par « projet suivant » : la page de garde garde ses délais d'arrivée (le numéro et la fiche attendent le titre)
  document.documentElement.classList.toggle('case-next', !!ctx.info.next);
  ctx.cleanup(() => document.documentElement.classList.remove('case-next'));
  // ---------- registre des rubriques (14/11) ----------
  // Une ligne fixe en bas de l'écran, centrée : les rubriques de l'étude dans l'ordre (en bref · contexte · enjeu…),
  // comme les titres courants d'un livre. La rubrique de l'écran en cours est entre parenthèses orange ; chaque mot mène à son
  // écran. Masquée sur la page de garde et sur l'écran « projet suivant ».
  {
    const api = screens()!, host = api.host;
    const scr = [...host.querySelectorAll<HTMLElement>(':scope > .scr')];
    const name = (sc: HTMLElement) => { const l = sc.querySelector('.lab.par'); return (l?.textContent || '').split(' — ')[0].trim().toLowerCase(); };
    const rubs: { k: string; i: number }[] = [], of: number[] = [];
    scr.forEach((sc, i) => {
      if (sc.classList.contains('s1') || sc.classList.contains('nx')) { of.push(-1); return; }
      // les écrans de médias illustrent la rubrique qui les précède : ils s'y rattachent
      const k = name(sc); if (!k || sc.hasAttribute('data-media')) { of.push(Math.max(0, rubs.length - 1)); return; }
      if (!rubs.length || rubs[rubs.length - 1].k !== k) rubs.push({ k, i });
      of.push(rubs.length - 1);
    });
    if (rubs.length >= 2) {
    const nav = document.createElement('nav'); nav.className = 'reg mono'; nav.setAttribute('aria-label', document.documentElement.lang === 'fr' ? 'Rubriques' : 'Sections');
    nav.innerHTML = rubs.map((r, k) => `<a href="#" data-go="${r.i}" data-k="${k}">${r.k}</a>`).join('<span aria-hidden="true">·</span>');
    document.body.appendChild(ctx.own(nav));
    const links = [...nav.querySelectorAll<HTMLElement>('a')];
    const set = (i: number) => {
      const k = of[i] ?? -1;
      nav.classList.toggle('on', k >= 0);
      links.forEach((a, j) => a.toggleAttribute('aria-current', j === k));
    };
    set(api.current());
    host.addEventListener('screens:leave', (e) => set((e as CustomEvent).detail.to));
    host.addEventListener('screens:enter', (e) => set((e as CustomEvent).detail.index));
    }
  }

  {
    const api = screens()!;
    const host = document.querySelector<HTMLElement>('[data-screens]')!;
    const last = api.count - 1;
    const ring = document.querySelector<HTMLAnchorElement>('[data-next]')!;
    const arc = document.querySelector<SVGCircleElement>('[data-arc]')!;
    const RING = 3500;
    let fill: Animation | null = null;
    const arriving = !!ctx.info.next;

    // arrivée par « Projet suivant » : le titre a voyagé jusqu'à sa place (transition nommée) ; le reste de la page de garde
    // s'écrit derrière lui
    if (arriving) letters(api.el(0), 650, '.case-h1');

    // arrivée par la molette depuis le projet précédent : l'élan du geste qui a ouvert la page ne doit pas faire sauter
    // la page de garde. La molette est ignorée tant que ce geste dure (au moins 0,9 s, puis jusqu'à 0,25 s de calme).
    if (arriving) {
      const t0 = performance.now();
      let lastW = t0;
      host.style.overflowY = 'hidden'; // défilement natif figé tant que dure l'élan du geste qui a ouvert la page
      const onW = () => { lastW = performance.now(); };
      addEventListener('wheel', onW, { passive: true, capture: true, signal: ctx.signal });
      const check = () => {
        const now = performance.now();
        if (now - t0 > 900 && now - lastW > 250) { host.style.overflowY = ''; removeEventListener('wheel', onW, { capture: true }); return; }
        ctx.timeout(check, 60);
      };
      check();
    }

    // texte : s'il ne tient pas dans son écran (téléphone, fenêtre basse), il descend par paliers jusqu'à tenir
    const fit = () => document.querySelectorAll<HTMLElement>('[data-fit]').forEach((el) => {
      const scr = el.closest<HTMLElement>('.scr')!;
      const big = el.classList.contains('idx') ? [...el.querySelectorAll<HTMLElement>('h3')] : [el];
      if (!big.length) return;
      big.forEach((b) => { b.style.fontSize = ''; });
      const min = innerWidth <= 760 ? 13 : 15;
      const over = () => scr.scrollHeight > scr.clientHeight + 2;
      let f = parseFloat(getComputedStyle(big[0]).fontSize);
      while (over() && f > min) { f -= 1; big.forEach((b) => { b.style.fontSize = f + 'px'; }); }
    });
    const fitTitle = () => {
      const h = document.querySelector<HTMLElement>('.case-h1'), v = h?.querySelector<HTMLElement>('.vt');
      if (!h || !v) return;
      h.style.fontSize = '';
      const room = h.clientWidth, w = v.getBoundingClientRect().width;
      if (w > room) h.style.fontSize = parseFloat(getComputedStyle(h).fontSize) * room / w * 0.98 + 'px';
    };
    let ft = 0;
    const refit = () => { fitTitle(); fit(); };
    if (!arriving) refit(); else fit();
    if (document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (!ctx.signal.aborted) fit(); });
    addEventListener('resize', () => { clearTimeout(ft); ft = ctx.timeout(refit, 150); }, { signal: ctx.signal });

    // ouverture du projet suivant : le titre « projet suivant » devient le titre de la page d'arrivée (transition nommée,
    // voir plus bas) ; tout le reste s'efface autour de lui
    let leaving = false;
    const open = () => {
      if (leaving) return;
      leaving = true;
      const v = document.querySelector<HTMLElement>('.next-title .vt');
      if (v && !reduced()) v.style.viewTransitionName = 'case-title';
      navigate(ring.href, { info: { next: true } });
    };
    const stop = () => { if (fill) { fill.onfinish = null; fill.cancel(); fill = null; } };
    const start = () => {
      stop();
      if (reduced()) return; // pas d'ouverture automatique : l'anneau s'ouvre au clic
      fill = arc.animate([{ strokeDashoffset: 339.3 }, { strokeDashoffset: 0 }], { duration: RING, easing: 'linear', fill: 'forwards' });
      if (document.hidden) fill.pause();
      dispatchEvent(new CustomEvent('kk:sound', { detail: 'ring' }));
      fill.onfinish = open;
    };
    host.addEventListener('screens:enter', (e) => { if ((e as CustomEvent).detail.index === last) start(); });
    host.addEventListener('screens:leave', (e) => { if ((e as CustomEvent).detail.from === last) stop(); });
    host.addEventListener('screens:beyond', open);
    // projet précédent : geste vers le haut tout en haut de la page de garde, ou la flèche du libellé
    const prev = document.querySelector<HTMLAnchorElement>('[data-prev]');
    host.addEventListener('screens:above', () => { if (prev && !leaving) { leaving = true; navigate(prev.href); } });
    // Échap : retour à la page Projets (l'objet repart à sa place sur la scène) — sauf visionneuse ou menu ouverts
    addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented || !document.querySelector('[data-lb]')?.hasAttribute('hidden') || document.documentElement.classList.contains('menu-open')) return;
      navigate(`/${document.documentElement.lang === 'fr' ? 'fr' : 'en'}/work/`);
    }, { signal: ctx.signal });
    ring.addEventListener('click', (e) => { e.preventDefault(); open(); });
    document.addEventListener('visibilitychange', () => { if (!fill) return; document.hidden ? fill.pause() : fill.play(); }, { signal: ctx.signal });
    document.addEventListener('click', (e) => { if (!(e.target as Element).closest('[data-next]')) stop(); }, { capture: true, signal: ctx.signal });
    ctx.cleanup(stop);
    if (api.current() === last) start();

    // préchargement : les images de l'écran d'après, et la page du projet suivant à l'approche de la fin
    let pre = false;
    host.addEventListener('screens:enter', (e) => {
      const i = (e as CustomEvent).detail.index;
      api.el(i + 1)?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((m) => { m.loading = 'eager'; });
      if (!pre && i >= last - 2) { pre = true; const l = document.createElement('link'); l.rel = 'prefetch'; l.href = ring.href; document.head.appendChild(l); }
    });
    api.el(1)?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((m) => { m.loading = 'eager'; });

    // (entrée des images : pilotée par le défilement, avec le texte — voir revealScrub dans motion.ts)

    // ---------- captures très hautes (pages web entières) : un plan de showreel qui parcourt la page, en boucle ----------
    // Un seul mouvement continu, jamais arrêté : de longs ralentis (la page glisse lentement) coupés de traversées rapides, et de
    // temps en temps un petit retour en arrière ; la vitesse rejoint chaque nouvelle consigne en douceur (lissage exponentiel),
    // d'où des accélérations et freinages sans à-coup. Près du bas, à la fin d'un ralenti : la page descend jusqu'à son bas, s'y
    // tient un instant, puis un grand défilement rapide la ramène en haut (accélère puis freine), et le plan reprend. Seulement tant que l'écran est à l'écran ; immobile si « Réduire les animations ».
    if (!reduced()) document.querySelectorAll<HTMLElement>('[data-shot]').forEach((vp) => {
      const img = vp.querySelector('img')!;
      const rnd = (a: number, b: number) => a + Math.random() * (b - a);
      const TAU = 0.22; // temps de réponse de la vitesse (s)
      const io = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2); // ease-in-out (cubique)
      type Mode = 'slow' | 'fast' | 'back';
      let y = 0, v = 0, aim = 0, mode: Mode = 'fast', until = 0, last = 0, raf = 0, run = false;
      // déplacement réglé (descente jusqu'au bas, retour en haut) : de from à to, puis une attente (hold) avant la suite
      let tw: { from: number; to: number; t0: number; dur: number; hold: number } | null = null;
      const frame = (now: number) => {
        raf = 0;
        if (!run) return;
        const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
        const H = vp.clientHeight, max = Math.max(0, img.offsetHeight - H);
        if (max) {
          if (tw) {
            const p = Math.min(1, (now - tw.t0) / tw.dur);
            y = tw.from + (Math.min(tw.to, max) - tw.from) * io(p);
            if (now >= tw.t0 + tw.dur + tw.hold) {
              if (tw.to > 0) tw = { from: y, to: 0, t0: now, dur: Math.min(1700, 700 + y * 0.12), hold: 0 }; // le grand retour en haut
              else { tw = null; v = aim = 0.1 * H; mode = 'slow'; until = now + rnd(900, 1300); }
            }
          } else {
            if (now >= until) {
              const room = max - y;
              if (mode !== 'slow') { mode = 'slow'; aim = rnd(0.06, 0.13) * H; until = now + rnd(1100, 1800); }
              else if (room <= 1.6 * H) { tw = { from: y, to: max, t0: now, dur: 500 + room * 0.35, hold: rnd(700, 1000) }; v = 0; } // jusqu'au bas de la page
              else if (y > H && Math.random() < 0.22) { mode = 'back'; aim = -rnd(0.5, 0.9) * H; until = now + rnd(320, 460); } // petit retour en arrière
              else { mode = 'fast'; aim = rnd(2.4, 3.4) * H; until = now + rnd(380, 560); }
            }
            if (!tw) {
              v += (aim - v) * (1 - Math.exp(-dt / TAU));
              y = Math.min(max, Math.max(0, y + v * dt));
            }
          }
          img.style.transform = `translate3d(0, ${(-y).toFixed(1)}px, 0)`;
        }
        raf = ctx.raf(frame);
      };
      ctx.observe(new IntersectionObserver(([e]) => {
        run = e.isIntersecting; last = 0;
        if (run && tw) tw = { ...tw, from: y, t0: performance.now() }; // reprise : le déplacement repart d'où il en était
        if (run && !raf) raf = ctx.raf(frame);
      }, { root: host, threshold: 0.5 })).observe(vp.closest('.scr')!);
      ctx.cleanup(() => { run = false; });
    });

    // ---------- légende au survol : elle remplace le libellé de l'écran ----------
    document.querySelectorAll<HTMLImageElement>('img[data-cap]').forEach((im) => {
      const lab = im.closest('.in')?.querySelector<HTMLElement>('[data-caplab]');
      if (!lab) return;
      const base = lab.textContent || '';
      im.addEventListener('pointerenter', () => { const n = im.dataset.n || '', cap = im.dataset.cap || ''; lab.textContent = cap.endsWith(n) ? cap : `${cap} — ${n}`; });
      im.addEventListener('pointerleave', () => { lab.textContent = base; });
    });

    // ---------- zoom ----------
    const lb = document.querySelector<HTMLElement>('[data-lb]')!, lbImg = lb.querySelector('img')!;
    const lbc = lb.querySelector<HTMLElement>('[data-lbc]')!, lbn = lb.querySelector<HTMLElement>('[data-lbn]')!;
    const all = [...document.querySelectorAll<HTMLImageElement>('img[data-cap]')];
    let at = -1;
    const show = (i: number) => {
      at = (i + all.length) % all.length;
      const m = all[at];
      lbImg.src = m.getAttribute('data-real') || m.getAttribute('src') || ''; lbImg.width = m.width; lbImg.height = m.height;
      const cap = m.dataset.cap || '', n = m.dataset.n || '';
      lbc.textContent = cap; lbn.textContent = cap.endsWith(n) ? '' : n;
    };
    const block = (e: Event) => {
      e.stopPropagation();
      if (e.type === 'wheel') { close(); return; }
      if (e.type !== 'keydown') return;
      const k = (e as KeyboardEvent).key;
      if (k === 'Escape') close();
      else if (k === 'ArrowRight' || k === 'ArrowDown') show(at + 1);
      else if (k === 'ArrowLeft' || k === 'ArrowUp') show(at - 1);
      e.preventDefault();
    };
    const EVS = ['wheel', 'keydown', 'touchstart'] as const;
    const openLb = (m: HTMLImageElement) => {
      show(all.indexOf(m));
      lb.hidden = false;
      EVS.forEach((t) => addEventListener(t, block, { capture: true, passive: false, signal: ctx.signal }));
      if (reduced()) return;
      const a = m.getBoundingClientRect(), b = lbImg.getBoundingClientRect();
      if (b.width) lbImg.animate([{ transformOrigin: '0 0', transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})`, opacity: 0.6 }, { transformOrigin: '0 0', transform: 'none', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.7, 0, .2, 1)' });
      lb.animate([{ backgroundColor: 'transparent' }, {}], { duration: 360, easing: 'ease-out' });
      lb.querySelector('.lbc')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 380, fill: 'backwards' });
    };
    function close() {
      if (lb.hidden) return;
      EVS.forEach((t) => removeEventListener(t, block, { capture: true }));
      if (reduced()) { lb.hidden = true; return; }
      lb.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in' }).finished.then(() => { lb.hidden = true; });
    }
    all.forEach((m) => m.addEventListener('click', () => openLb(m)));
    lb.addEventListener('click', close);
  }
});
