// Plan B (03/11) : page en défilement libre au lieu des écrans forcés. Activé par data-flow sur [data-screens].
// Les écrans se suivent dans la page ; défilement fluide avec inertie ; chaque écran s'écrit (lettres, vignettes,
// apartés) quand il arrive au tiers de la fenêtre, à chaque passage ; images en parallaxe pilotée par la position.
import { reduced, reveal, settle } from './motion';
import { smooth } from './smooth';

export function initFlow(host: HTMLElement) {
  document.documentElement.classList.add('flow');
  const still = reduced();
  const S = [...host.querySelectorAll<HTMLElement>(':scope > .scr')].filter((s) => getComputedStyle(s).display !== 'none');
  const header = document.querySelector<HTMLElement>('.site-header');
  const phone = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const par = phone ? [] : S.flatMap((s) => [...s.querySelectorAll<HTMLElement>('.im img, .cov, .vi, .door, .mimg, [data-par]')].map((el) => ({ el, s, k: Number(el.dataset.par || 80) })));
  const shown = new Set<HTMLElement>();
  let raf = 0;
  const apply = () => {
    raf = 0;
    const H = innerHeight;
    header?.classList.toggle('solid', scrollY > 8);
    S.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const inView = r.top < H * 0.66 && r.bottom > H * 0.34;
      if (inView && !shown.has(s)) {
        shown.add(s);
        if (!s.hasAttribute('data-still')) { s.style.opacity = '1'; if (!still) reveal(s, i === 0 ? 150 : 40); }
      } else if (!inView && shown.has(s) && (r.top > H || r.bottom < 0)) {
        // sorti du cadre : il se réécrira au prochain passage
        shown.delete(s); settle(s); if (!s.hasAttribute('data-still') && !still) s.style.opacity = '0';
      }
    });
    if (!still) par.forEach(({ el, s, k }) => {
      const r = s.getBoundingClientRect();
      const d = r.top + r.height / 2 - H / 2;
      el.style.translate = Math.abs(d) < H * 1.5 ? `0 ${((d / H) * k * 0.6).toFixed(2)}px` : '';
    });
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(apply); };
  if (!still) S.forEach((s, i) => { if (i > 0 && !s.hasAttribute('data-still')) s.style.opacity = '0'; });
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  smooth(still);
  ((window as any).kkReady ?? Promise.resolve()).then(kick);
}
