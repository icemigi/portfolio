// Chargement d'entrée : une seule fois par visite. Le cavalier se remplit de bas en haut au rythme du chargement
// (polices, page, toutes les images et vignettes, autres rubriques), le compteur suit, puis l'écran de chargement monte comme un écran du site.
// Les pages suivantes s'ouvrent sans chargement (déjà en cache, et préchargées par Astro).
import { reduced, EASE_SLIDE } from './motion';

declare global { interface Window { kkReady?: Promise<void> } }

const ld = document.querySelector<HTMLElement>('[data-ld]');
const seen = document.documentElement.classList.contains('ld-skip');

window.kkReady = new Promise<void>((resolve) => {
  if (!ld || seen) { ld?.remove(); resolve(); return; }
  const fill = ld.querySelector<HTMLElement>('[data-ld-fill]')!, num = ld.querySelector<HTMLElement>('[data-ld-n]')!;
  // tout ce dont la page a besoin, pas seulement le premier écran : polices, page, toutes les images (y compris
  // celles en chargement différé), les vignettes animées, puis les autres rubriques du site (pages en cache)
  const jobs: Promise<unknown>[] = [document.fonts.ready, new Promise((r) => (document.readyState === 'complete' ? r(0) : addEventListener('load', r, { once: true })))];
  const pic = (src: string) => new Promise((r) => { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => r(0); im.src = src; });
  document.querySelectorAll<HTMLImageElement>('img').forEach((i) => {
    if (i.loading === 'lazy') i.loading = 'eager';
    jobs.push(i.complete ? (i.decode?.().catch(() => {}) ?? Promise.resolve()) : new Promise((r) => { i.addEventListener('load', () => i.decode().catch(() => {}).then(r), { once: true }); i.addEventListener('error', r, { once: true }); }));
  });
  document.querySelectorAll<HTMLElement>('[style*="--vi"]').forEach((v) => {
    const m = /--vi:\s*url\(([^)]+)\)/.exec(v.getAttribute('style') || ''); if (m) jobs.push(pic(m[1].replace(/['"]/g, '')));
  });
  document.querySelectorAll<HTMLAnchorElement>('.site-header nav a[href], .site-header .home').forEach((a) => {
    if (a.href && a.href !== location.href) jobs.push(fetch(a.href, { priority: 'low' } as RequestInit).then((r) => r.text()).catch(() => {}));
  });
  let done = 0, shown = 0, finished = false;
  jobs.forEach((j) => j.then(() => done++));
  const t0 = performance.now(), MIN = reduced() ? 0 : 900, MAX = 12000;
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
