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
  // transitions entre les anciens écrans : deux grandes parenthèses arrivent des bords, se referment sur le nom de
  // la section suivante, puis s'ouvrent pour la laisser passer (piloté par la position, rembobinable)
  const trs = still ? [] : S.slice(1).map((s) => {
    const lab = s.querySelector<HTMLElement>('.lab, .lab4');
    const name = (lab?.textContent || '').trim();
    const tr = document.createElement('div');
    tr.className = 'ftr'; tr.setAttribute('aria-hidden', 'true');
    tr.innerHTML = `<div class="fst"><span class="fp l">(</span><span class="fn">${name.replace(/</g, '&lt;')}</span><span class="fp r">)</span></div>`;
    s.before(tr);
    return { tr, l: tr.querySelector<HTMLElement>('.l')!, r: tr.querySelector<HTMLElement>('.r')!, n: tr.querySelector<HTMLElement>('.fn')! };
  });
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const ease = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
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
    trs.forEach(({ tr, l, r, n }) => {
      const b = tr.getBoundingClientRect();
      if (b.bottom < -H || b.top > 2 * H) return;
      const p = clamp((H - b.top) / (b.height + H)); // 0 → 1 pendant la traversée
      const close = ease(p / 0.5), open = ease((p - 0.55) / 0.35);
      const w = n.offsetWidth / 2 + 24;
      const far = innerWidth / 2 + 60;
      const x = far - (far - w) * close + open * far * 0.9;
      l.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`;
      r.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      n.style.opacity = String(Math.min(ease((p - 0.25) / 0.2), 1 - ease((p - 0.6) / 0.25)));
      n.style.letterSpacing = `${(-0.04 + 0.5 * (1 - close)).toFixed(3)}em`;
    });
    // l'écran qui s'en va : il s'efface en montant pendant que la transition arrive
    S.forEach((s) => {
      if (s.hasAttribute('data-still') || still) return;
      const r = s.getBoundingClientRect();
      const q = clamp((H * 0.45 - r.bottom) / (H * 0.4));
      const inn = s.querySelector<HTMLElement>('.in');
      if (inn) { inn.style.opacity = q > 0 ? String(1 - q) : ''; inn.style.transform = q > 0 ? `translate3d(0, ${(-q * 60).toFixed(1)}px, 0)` : ''; }
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
