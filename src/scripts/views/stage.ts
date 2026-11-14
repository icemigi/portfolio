// Scène Projets (ProjectStage.astro, page Projets et accueil) : les objets flottent, se prennent à la main, tombent à leur
// apparition ; un clic ouvre l'étude, l'objet voyageant jusqu'à sa page de garde.
import { onPage } from '../page';
import { reduced } from '../motion';
import { navigate } from 'astro:transitions/client';

onPage('[data-projects]', (ctx) => {
  // M1 Flottement : chaque objet monte et descend à son rythme ; la souris les décale selon leur profondeur ;
  // survol = l'objet se soulève de 14 px. Les objets se prennent à la main (glisser-déposer) et restent où on les pose.
  // Un clic sans déplacement ouvre l'étude.
  const stage = document.querySelector<HTMLElement>('[data-projects]');
  // téléphone : la scène est masquée (liste à la place), on ne lance rien
  if (stage && stage.offsetParent !== null) {
    const still = reduced();
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    const O = [...stage.querySelectorAll<HTMLElement>('.obj')].map((el, i) => ({
      el, a: el.querySelector('a')!, f: el.querySelector<HTMLElement>('.float')!, z: Number(el.dataset.depth),
      ph: i * 1.7, sp: 0.55 + i * 0.09, dx: 0, dy: 0, px: 0, py: 0, lift: 0, sc: 1, hov: false, sh: 26, t0: Infinity,
    }));
    const m = { nx: 0, ny: 0, tx: 0, ty: 0 };
    stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width - 0.5; m.ty = (e.clientY - r.top) / r.height - 0.5; });
    stage.addEventListener('pointerleave', () => { m.tx = 0; m.ty = 0; });
    let drag: (typeof O)[number] | null = null, sx = 0, sy = 0, ox = 0, oy = 0, moved = false, top = 10;
    O.forEach((o) => {
      const hover = (on: boolean) => { o.hov = on; o.el.classList.toggle('hov', on); stage.classList.toggle('focus', O.some((x) => x.hov)); };
      o.a.addEventListener('pointerenter', () => hover(true));
      o.a.addEventListener('pointerleave', () => hover(false));
      o.a.addEventListener('dragstart', (e) => e.preventDefault());
      o.a.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        drag = o; moved = false; sx = e.clientX; sy = e.clientY; ox = o.dx; oy = o.dy;
        o.el.style.zIndex = String(++top); o.a.setPointerCapture(e.pointerId);
      });
      o.a.addEventListener('pointermove', (e) => {
        if (drag !== o) return;
        const ddx = e.clientX - sx, ddy = e.clientY - sy;
        if (!moved && Math.hypot(ddx, ddy) > 5) { moved = true; o.el.classList.add('drag'); dispatchEvent(new CustomEvent('kk:sound', { detail: 'pick' })); }
        if (moved) { o.dx = ox + ddx; o.dy = oy + ddy; }
      });
      const end = () => { if (drag === o) { if (moved) dispatchEvent(new CustomEvent('kk:sound', { detail: 'drop' })); drag = null; o.el.classList.remove('drag'); } };
      o.a.addEventListener('pointerup', end);
      o.a.addEventListener('pointercancel', end);
      o.a.addEventListener('click', (e) => {
        if (moved) { e.preventDefault(); moved = false; return; }
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        // voyage (14/11) : la place de l'objet est notée ; la page d'étude l'affiche au même endroit puis le pose sur sa page de garde.
        // Les autres objets et les libellés s'effacent, l'objet cliqué reste seul à l'écran le temps du changement de page.
        const shape = o.f.querySelector<HTMLElement>('.shape');
        const slug = (o.a.getAttribute('href') || '').split('/').filter(Boolean).pop();
        if (still || !slug) return;
        e.preventDefault();
        stage.classList.add('leaving'); o.el.classList.add('chosen');
        dispatchEvent(new CustomEvent('kk:sound', { detail: 'pick' }));
        // l'objet voyage jusqu'à la page de garde de l'étude (transition nommée case-object, voir views/case.ts)
        if (shape) shape.style.viewTransitionName = 'case-object';
        ctx.timeout(() => navigate(o.a.href, { info: { object: { slug } } }), 320);
      });
    });
    // retour arrière (page gardée en cache) : la scène revient entière
    addEventListener('pageshow', (e) => { if (e.persisted) { stage.classList.remove('leaving'); O.forEach((o) => o.el.classList.remove('chosen')); } }, { signal: ctx.signal });
    // apparition : après le chargement, les objets tombent un à un en se redressant, puis leurs libellés
    const go = () => {
      const t0 = performance.now() + 120;
      O.forEach((o, i) => { o.t0 = still ? -Infinity : t0 + i * 110; o.el.style.setProperty('--ld', still ? '0s' : `${(i * 110 + 520) / 1000}s`); });
      ctx.raf(() => stage.classList.add('in'));
      ctx.timeout(() => O.forEach((o) => o.el.style.removeProperty('--ld')), 2400); // le survol des libellés ne garde pas le retard
    };
    // changement de langue : la scène est déjà en place (aucune chute) ; sinon les objets restent cachés jusqu'à leur chute
    // (état de départ en CSS : .stage:not(.in))
    // retour d'une étude de cas : de même (l'objet du projet quitté revole à sa place, views/case.ts)
    if (ctx.info.lang || (ctx.from && /^\/(fr|en)\/work\/[^/]+\/$/.test(ctx.from.pathname))) { O.forEach((o) => (o.t0 = -Infinity)); stage.classList.add('in'); }
    // la scène tombe quand elle apparaît à l'écran (sur l'accueil, elle n'est pas au premier écran)
    else (window.kkReady ?? Promise.resolve()).then(() => document.fonts.ready).then(() => {
      if (ctx.signal.aborted) return;
      ctx.observe(new IntersectionObserver(([e], io) => { if (e.intersectionRatio > 0.5) { io.disconnect(); go(); } }, { threshold: [0, 0.5] })).observe(stage);
    });
    const ease = (p: number) => 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2; // sortie avec léger dépassement
    const tick = (now: number) => {
      const t = now / 1000;
      m.nx = lerp(m.nx, m.tx, 0.06); m.ny = lerp(m.ny, m.ty, 0.06);
      O.forEach((o) => {
        const held = drag === o && moved;
        const float = still ? 0 : Math.sin(t * o.sp + o.ph) * 7;
        o.px = lerp(o.px, still ? 0 : -m.nx * 28 * o.z, 0.08); o.py = lerp(o.py, still ? 0 : -m.ny * 20 * o.z, 0.08);
        o.lift = lerp(o.lift, o.hov || held ? -14 : 0, still ? 1 : 0.14);
        o.sc = lerp(o.sc, o.hov || held ? 1.05 : 1, still ? 1 : 0.12);
        const p = Math.min(1, Math.max(0, (now - o.t0) / 1100)), e = p >= 1 ? 1 : ease(p), side = o.ph % 2 > 1 ? 1 : -1;
        o.a.style.transform = `translate(${o.dx}px, ${o.dy}px)`;
        o.f.style.transform = `translate(${o.px.toFixed(2)}px, ${(o.py + float + o.lift + (1 - e) * 110).toFixed(2)}px) rotate(${((1 - e) * 14 * side).toFixed(2)}deg) scale(${(o.sc * (0.82 + 0.18 * e)).toFixed(4)})`;
        if (p < 1 || o.f.style.opacity) o.f.style.opacity = p >= 1 ? '' : String(Math.min(1, p * 3));
        // l'ombre (filtre coûteux) n'est retouchée que quand l'objet se soulève vraiment
        const sh = Math.round(26 - o.lift);
        if (sh !== o.sh) { o.sh = sh; o.f.style.setProperty('--sh', `${sh}px`); }
      });
      if (!document.hidden) ctx.raf(tick); else document.addEventListener('visibilitychange', () => ctx.raf(tick), { once: true, signal: ctx.signal });
    };
    ctx.raf(tick);
  }
});
