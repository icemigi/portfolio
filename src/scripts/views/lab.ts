// Page Lab ([lang]/lab.astro) : galerie de pochettes en 3D (molette, glisser, clavier), entrée des pochettes à l'arrivée.
import { onPage } from '../page';
import { reduced } from '../motion';
import { wheelGesture } from '../gesture';

onPage('[data-cf]', (ctx) => {
  const root = document.querySelector<HTMLElement>('[data-cf]');
  if (root) {
    const stage = root.querySelector<HTMLElement>('[data-stage]')!;
    const cards = [...root.querySelectorAll<HTMLAnchorElement>('.cv')];
    const caps = [...root.querySelectorAll<HTMLElement>('.ci')];
    const num = root.querySelector<HTMLElement>('[data-n]')!;
    const N = cards.length;
    const still = reduced();
    let cur = Number(root.dataset.start) || 0, target = cur, raf = 0, shown = cur;
    const size = () => cards[0].offsetWidth;
    // pochettes de côté : inclinées à 32°, plus petites, de plus en plus estompées
    const place = () => {
      const S = size(), G0 = S * 0.78, G = S * 0.34, P = S * 3.2;
      cards.forEach((c, k) => {
        const d = k - cur, a = Math.abs(d), sg = Math.sign(d), near = Math.min(a, 1);
        const x = sg * (near * G0 + Math.max(a - 1, 0) * G);
        c.style.transform = `perspective(${P.toFixed(0)}px) translateX(${x.toFixed(1)}px) rotateY(${(-sg * near * 32).toFixed(2)}deg) scale(${(1 - near * 0.18).toFixed(3)})`;
        c.style.setProperty('--f', Math.min(0.85, Math.max(a - 0.4, 0) * 0.28).toFixed(3));
        c.style.zIndex = String(100 - Math.round(a * 10));
      });
      const i = Math.round(cur);
      if (i !== shown) {
        shown = i;
        cards.forEach((c, k) => { c.tabIndex = k === i ? 0 : -1; c.classList.toggle('on', k === i); });
        caps.forEach((c, k) => c.classList.toggle('on', k === i));
        num.textContent = `(${String(i + 1).padStart(2, '0')})`;
      }
    };
    const loop = () => {
      cur += (target - cur) * 0.13;
      if (Math.abs(target - cur) < 0.001) cur = target;
      place();
      raf = cur !== target ? ctx.raf(loop) : 0;
    };
    const go = (i: number) => {
      const n = Math.max(0, Math.min(N - 1, i));
      if (n === target) return;
      dispatchEvent(new CustomEvent('kk:sound', { detail: 'tick' }));
      target = n;
      if (still) { cur = target; place(); return; }
      if (!raf) raf = ctx.raf(loop);
    };
    place();
    addEventListener('resize', place, { signal: ctx.signal });

    // apparition : après le chargement d'entrée du site, les pochettes arrivent une à une, de la pochette du centre vers les bords
    // (elles montent en se redressant, léger rebond), puis la légende et le compteur. Animées sur l'image : la position en 3D
    // de la galerie (sur la pochette) n'est pas touchée.
    // changement de langue : la page s'ouvre telle quelle, sans rejouer l'entrée
    if (!still && !ctx.info.lang) {
      const imgs = cards.map((c) => c.querySelector<HTMLElement>('.art')!);
      const tail = [...root.querySelectorAll<HTMLElement>('.cap, .lab')];
      imgs.forEach((im) => (im.style.opacity = '0'));
      tail.forEach((el) => (el.style.opacity = '0'));
      const enter = () => {
        imgs.forEach((im, k) => {
          const d = Math.abs(k - cur);
          im.animate([{ opacity: 0, transform: `translateY(70px) rotate(${(k - cur) * 3}deg) scale(.94)` }, { opacity: 1, transform: 'none' }],
            { duration: 820, delay: 90 + d * 95, easing: 'cubic-bezier(.34, 1.4, .64, 1)', fill: 'backwards' });
          im.style.opacity = '';
        });
        tail.forEach((el, k) => {
          el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 420 + k * 90, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' });
          el.style.opacity = '';
        });
      };
      (window.kkReady ?? Promise.resolve()).then(() => document.fonts.ready).then(() => { if (!ctx.signal.aborted) enter(); });
    }

    // molette : comme les écrans du site, un geste = une pochette, et une molette roulée sans pause enchaîne les pochettes.
    // La galerie ne prend la molette que si son écran est en place (pas pendant que le pied de page est affiché) ;
    // au bout, le geste suivant part à l'écran suivant, mais l'inertie du geste en cours ne fait pas sauter l'écran.
    const screen = root.closest<HTMLElement>('.scr');
    const gesture = wheelGesture(() => true);
    let mine = 0;
    root.addEventListener('wheel', (e) => {
      if (screen && Math.abs(screen.getBoundingClientRect().top) > 2) return;
      // Firefox : une molette compte en lignes (deltaMode 1) ou en pages (2), pas en pixels
      const k = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? innerHeight : 1;
      const dl = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * k, now = performance.now();
      const can = dl > 0 ? target < N - 1 : target > 0;
      if (!can && now - mine > 300) return;
      e.preventDefault(); e.stopPropagation(); mine = now; // la galerie prend la molette : la page ne défile pas
      const step = gesture(now, dl);
      if (step) go(target + step);
    }, { passive: false });

    // clic : de côté = au centre ; au centre = ouvrir
    let moved = false;
    cards.forEach((c, k) => c.addEventListener('click', (e) => { if (moved || k !== target) { e.preventDefault(); if (!moved) go(k); } }));
    // clavier : flèches gauche/droite (haut/bas restent au site)
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); go(target + (e.key === 'ArrowRight' ? 1 : -1)); cards[target].focus({ preventScroll: true });
    });
    // glisser horizontalement (souris ou doigt)
    let sx = 0, s0 = 0, down = false;
    stage.addEventListener('pointerdown', (e) => { down = true; moved = false; sx = e.clientX; s0 = target; });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; stage.classList.add('drag'); }
      if (moved) go(Math.round(s0 - dx / (size() * 0.4)));
    }, { signal: ctx.signal });
    addEventListener('pointerup', () => { down = false; stage.classList.remove('drag'); ctx.timeout(() => (moved = false), 0); }, { signal: ctx.signal });
  }
});
