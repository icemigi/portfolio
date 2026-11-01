// Chargement d'entrée : une seule fois par visite. Le cavalier se remplit de bas en haut au rythme du chargement
// (polices + images du premier écran + page), le compteur suit, puis l'écran de chargement monte comme un écran du site.
// Les pages suivantes s'ouvrent sans chargement (déjà en cache, et préchargées par Astro).
import { reduced, EASE_SLIDE } from './motion';

declare global { interface Window { kkReady?: Promise<void> } }

const ld = document.querySelector<HTMLElement>('[data-ld]');
const seen = document.documentElement.classList.contains('ld-skip');

window.kkReady = new Promise<void>((resolve) => {
  if (!ld || seen) { ld?.remove(); resolve(); return; }
  const fill = ld.querySelector<HTMLElement>('[data-ld-fill]')!, num = ld.querySelector<HTMLElement>('[data-ld-n]')!;
  const first = document.querySelector('.scr.on') || document.querySelector('main') || document.body;
  const imgs = [...first.querySelectorAll<HTMLImageElement>('img')].filter((i) => i.loading !== 'lazy');
  const jobs: Promise<unknown>[] = [document.fonts.ready, new Promise((r) => (document.readyState === 'complete' ? r(0) : addEventListener('load', r, { once: true })))];
  imgs.forEach((i) => jobs.push(i.complete ? Promise.resolve() : i.decode().catch(() => {})));
  let done = 0, shown = 0, finished = false;
  jobs.forEach((j) => j.then(() => done++));
  const t0 = performance.now(), MIN = reduced() ? 0 : 900, MAX = 6000;
  const tick = (now: number) => {
    const target = Math.min(done / jobs.length, (now - t0) / MIN || 1);
    shown += (target - shown) * 0.12;
    if (target >= 1 && shown > 0.995) shown = 1;
    fill.style.clipPath = `inset(${(1 - shown) * 100}% 0 0 0)`;
    num.textContent = String(Math.round(shown * 100)).padStart(3, '0');
    if ((shown === 1 || now - t0 > MAX) && !finished) { finished = true; end(); return; }
    requestAnimationFrame(tick);
  };
  const end = () => {
    try { sessionStorage.setItem('kk-ld', '1'); } catch { /* */ }
    resolve();
    if (reduced()) { ld.remove(); return; }
    ld.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 700, delay: 120, easing: EASE_SLIDE, fill: 'forwards' }).finished.then(() => ld.remove());
  };
  requestAnimationFrame(tick);
});
