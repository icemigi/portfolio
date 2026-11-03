// Études de cas en écrans (03/11). Le défilement forcé, l'apparition du texte et des vignettes, la parallaxe et
// l'évitement du curseur viennent des scripts communs (site.ts → screens.ts, motion.ts, hola.ts).
// Ici : (1) à chaque arrivée sur l'écran des choix clés, les visuels du projet traversent l'écran ;
// (2) un geste au-delà du dernier écran ouvre le projet suivant (titre continu).
import { reduced } from './motion';

export function initCase(host: HTMLElement) {
  const still = reduced();
  const S = [...host.querySelectorAll<HTMLElement>(':scope > .scr')];
  const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const fly = (scr: HTMLElement) => {
    if (still) return;
    const imgs = [...scr.querySelectorAll<HTMLImageElement>('.fly img')];
    const W = innerWidth, H = innerHeight;
    imgs.forEach((im, i) => {
      im.getAnimations().forEach((a) => a.cancel());
      const w = im.offsetWidth || H * 0.24, h = im.offsetHeight || w;
      const dir = i % 4, at = 0.08 + rnd(i) * 0.7;
      let a: [number, number], b: [number, number];
      if (dir === 0) { a = [W * at, H + 20]; b = [W * at, -h - 20]; }
      else if (dir === 1) { a = [W * at, -h - 20]; b = [W * at, H + 20]; }
      else if (dir === 2) { a = [W + 20, H * at]; b = [-w - 20, H * at]; }
      else { a = [-w - 20, H * at]; b = [W + 20, H * at]; }
      const dur = 2600 + (i % 3) * 900;
      im.animate([
        { transform: `translate3d(${a[0]}px, ${a[1]}px, 0)`, opacity: 1 },
        { transform: `translate3d(${b[0]}px, ${b[1]}px, 0)`, opacity: 1 },
      ], { duration: dur, delay: 250 + i * 210, easing: 'linear', fill: 'none' });
      im.style.zIndex = i % 3 === 1 ? '3' : '0'; // une sur trois passe devant le texte
    });
  };

  host.addEventListener('screens:enter', (e) => {
    const s = S[(e as CustomEvent).detail.index];
    if (s?.classList.contains('key')) fly(s);
  });

  const open = () => {
    const a = host.querySelector<HTMLAnchorElement>('[data-next]');
    if (!a) return;
    (window as any).kkLeavingNext = !still;
    try { if (!still) sessionStorage.setItem('kk-next', '1'); } catch { /* */ }
    location.href = a.href;
  };
  host.addEventListener('screens:beyond', open);
  host.querySelector('[data-next]')?.addEventListener('click', (e) => { e.preventDefault(); open(); });
  addEventListener('pageshow', (e) => { if ((e as PageTransitionEvent).persisted) (window as any).kkLeavingNext = false; });
}
