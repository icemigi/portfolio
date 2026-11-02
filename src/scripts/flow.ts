// Défilement libre (essai sur À propos) : la page défile normalement, sans saut d'écran.
// · chaque section écrit son texte quand elle entre dans le cadre (même apparition que les écrans), et le rejoue
//   si on y revient après l'avoir quittée ;
// · le libellé de section (mono, colonne 1) reste accroché en haut tant que sa section défile ;
// · parallaxe douce : vignettes et grands textes glissent un peu moins vite que la page (ordinateur seulement).
// Comparaison : ?ecrans dans l'adresse remet le défilement écran par écran.
import { reduced, reveal, settle } from './motion';

export function initFlow(host: HTMLElement) {
  document.documentElement.classList.add('flowing');
  const S = [...host.querySelectorAll<HTMLElement>(':scope > .scr')].filter((s) => getComputedStyle(s).display !== 'none');
  const header = document.querySelector<HTMLElement>('.site-header');
  const phone = matchMedia('(max-width: 760px), (pointer: coarse)').matches;

  // apparition à l'entrée dans le cadre
  const seen = new Set<HTMLElement>();
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      const s = e.target as HTMLElement;
      if (e.isIntersecting && e.intersectionRatio >= 0.25 && !seen.has(s)) {
        seen.add(s);
        if (!s.hasAttribute('data-still')) reveal(s, 60);
      } else if (!e.isIntersecting && seen.has(s)) {
        seen.delete(s); settle(s); // sortie complète : elle se rejouera au retour
      }
    }
  }, { threshold: [0, 0.25] });
  // l'observation (donc la première apparition) attend la fin du chargement d'entrée
  ((window as any).kkReady ?? Promise.resolve()).then(() => S.forEach((s) => io.observe(s)));

  // parallaxe
  const els = phone || reduced() ? [] : [...host.querySelectorAll<HTMLElement>('.vi:not(.lg), .affiche, .svc')].map((el) => ({ el, k: el.matches('.vi') ? 0.12 : 0.05 }));
  let raf = 0;
  const frame = () => {
    raf = 0;
    header?.classList.toggle('solid', scrollY > 8);
    const H = innerHeight;
    for (const { el, k } of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > H + 200) continue;
      const d = (r.top + r.height / 2 - H / 2) * k;
      el.style.translate = `0 ${(-d).toFixed(1)}px`;
    }
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  frame();

  return { count: S.length, current: () => 0, go: (i: number) => S[i]?.scrollIntoView({ behavior: 'smooth' }), el: (i: number) => S[i] };
}
