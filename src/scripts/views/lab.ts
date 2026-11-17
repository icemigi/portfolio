// Page Lab ([lang]/lab.astro) : la liste des pièces. Ordinateur : au survol d'une ligne, un aperçu suit le curseur (amorti,
// léger roulis) et fait tourner la pièce en direct — chargée seulement après un court arrêt sur la ligne, une seule à la fois.
// L'aperçu est un écran entier réduit : la pièce y est mise en page à la taille de l'écran ; au clic, il s'étend jusqu'au plein
// écran (simple agrandissement), puis la pièce s'ouvre, identique.
import { onPage } from '../page';
import { reduced, EASE_SLIDE } from '../motion';

const K = 0.3;          // taille de l'aperçu (part de l'écran)
const DWELL = 160;      // arrêt sur une ligne avant de lancer la pièce en direct (ms)
const IDLE = 2500;      // aperçu caché depuis tant de temps : la pièce s'arrête (ms)

onPage('[data-lablist]', (ctx) => {
  const list = document.querySelector<HTMLElement>('[data-lablist]')!;
  const pv = document.querySelector<HTMLElement>('[data-lpv]');
  const img = pv?.querySelector('img');
  if (!pv || !img || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let frame: HTMLIFrameElement | null = null, liveSrc = '', dwell = 0, idle = 0, opening = false;
  const stop = () => { frame?.remove(); frame = null; liveSrc = ''; };
  const live = (src: string) => {
    if (src === liveSrc) return;
    stop();
    if (!src || reduced()) return;
    liveSrc = src;
    frame = document.createElement('iframe');
    frame.title = ''; frame.tabIndex = -1; frame.setAttribute('aria-hidden', 'true');
    frame.addEventListener('load', () => frame?.classList.add('ready'), { once: true });
    frame.src = src;
    pv.appendChild(frame);
  };
  ctx.cleanup(stop);

  // position : le coin de l'aperçu suit le curseur, décalé, sans sortir de l'écran ; léger roulis selon la vitesse
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, first = true;
  const place = () => {
    const w = innerWidth * K, h = innerHeight * K;
    const cx = Math.min(Math.max(tx + 32, 16), innerWidth - w - 16), cy = Math.min(Math.max(ty - h / 2, 16), innerHeight - h - 16);
    if (first) { x = cx; y = cy; first = false; }
    x += (cx - x) * 0.16; y += (cy - y) * 0.16;
    pv.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${((cx - x) * 0.02).toFixed(2)}deg) scale(${K})`;
    raf = Math.abs(cx - x) + Math.abs(cy - y) > 0.3 && !opening ? ctx.raf(place) : 0;
  };
  const show = (row: HTMLAnchorElement) => {
    clearTimeout(idle); clearTimeout(dwell);
    img.src = row.dataset.cover!;
    if (liveSrc !== (row.dataset.live || '')) { frame?.classList.remove('ready'); dwell = ctx.timeout(() => live(row.dataset.live || ''), DWELL); }
    pv.classList.add('on');
  };
  const hide = () => { clearTimeout(dwell); pv.classList.remove('on'); idle = ctx.timeout(stop, IDLE); };

  list.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = ctx.raf(place); });
  list.addEventListener('pointerover', (e) => { const row = (e.target as Element).closest<HTMLAnchorElement>('.row'); if (row) show(row); });
  list.addEventListener('pointerleave', () => { if (!opening) { hide(); first = true; } });

  // ouverture : l'aperçu s'étend jusqu'au plein écran, puis la pièce s'ouvre (même mise en page, rien ne saute)
  list.addEventListener('click', (e) => {
    const row = (e.target as Element).closest<HTMLAnchorElement>('.row');
    if (!row || e.metaKey || e.ctrlKey || e.shiftKey || e.button || reduced() || !pv.classList.contains('on')) return;
    e.preventDefault();
    opening = true; cancelAnimationFrame(raf); raf = 0;
    dispatchEvent(new CustomEvent('kk:sound', { detail: 'pick' }));
    pv.animate([{ transform: pv.style.transform }, { transform: 'translate(0, 0) rotate(0deg) scale(1)' }], { duration: 650, easing: EASE_SLIDE, fill: 'forwards' })
      .finished.then(() => { location.href = row.href; });
  });
  // retour depuis la pièce (page gardée en cache par le navigateur) : la liste revient telle quelle
  addEventListener('pageshow', (e) => { if (e.persisted) { opening = false; pv.getAnimations().forEach((a) => a.cancel()); pv.classList.remove('on'); first = true; } }, { signal: ctx.signal });
});
