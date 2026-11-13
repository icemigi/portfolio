// Visuels-cartes : tout élément [data-card] se comporte comme une carte qu'on tient.
// Au repos, il oscille doucement en 3D (environ 3°, chacun à son rythme), tant qu'il est à l'écran.
// Au survol (ordinateur), il s'incline franchement vers le curseur (jusqu'à 9°), se soulève un peu, son ombre part à
// l'opposé et un reflet de lumière suit la souris ; quand on le quitte, il retrouve son oscillation en douceur.
// Rien si « Réduire les animations ».
import { reduced } from './motion';

const MAX = 9;      // inclinaison maximale au survol (degrés)
const IDLE = 0.33;  // oscillation au repos, en part de MAX (≈ 3°)

type Card = { el: HTMLElement; tx: number; ty: number; x: number; y: number; lift: number; tl: number; ph: number; sp: number; vis: boolean; hov: boolean };

export function initCards(root: ParentNode = document) {
  if (reduced()) return;
  const cards: Card[] = [...root.querySelectorAll<HTMLElement>('[data-card]')].map((el, i) => ({
    el, tx: 0, ty: 0, x: 0, y: 0, lift: 0, tl: 0, ph: i * 1.9 + Math.random() * 2, sp: 0.35 + Math.random() * 0.2, vis: false, hov: false,
  }));
  if (!cards.length) return;
  let raf = 0;
  const loop = (now: number) => {
    const t = now / 1000;
    let any = false;
    for (const c of cards) {
      if (!c.vis && !c.hov && c.lift < 0.01) continue;
      any = true;
      if (!c.hov) { c.tx = Math.sin(t * c.sp + c.ph) * IDLE; c.ty = Math.cos(t * c.sp * 0.8 + c.ph * 1.7) * IDLE * 0.7; c.tl = 0; }
      const k = c.hov ? 0.14 : 0.06;
      c.x += (c.tx - c.x) * k; c.y += (c.ty - c.y) * k; c.lift += (c.tl - c.lift) * 0.14;
      const el = c.el;
      el.style.transform = `perspective(900px) rotateX(${(-c.y * MAX).toFixed(2)}deg) rotateY(${(c.x * MAX).toFixed(2)}deg) scale(${(1 + c.lift * 0.035).toFixed(4)})`;
      el.style.boxShadow = c.lift > 0.01 ? `${(-c.x * 18).toFixed(1)}px ${(14 + c.y * 10).toFixed(1)}px ${(36 * c.lift).toFixed(1)}px rgba(0, 0, 0, ${(0.22 * c.lift).toFixed(3)})` : '';
      el.style.setProperty('--gx', `${(50 + c.x * 50).toFixed(1)}%`); el.style.setProperty('--gy', `${(50 + c.y * 50).toFixed(1)}%`);
      el.style.setProperty('--go', (c.lift * 0.9).toFixed(3));
    }
    raf = any && !document.hidden ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  // oscillation seulement pour les cartes visibles
  const io = new IntersectionObserver((es) => { es.forEach((e) => { const c = cards.find((x) => x.el === e.target); if (c) c.vis = e.isIntersecting; }); kick(); });
  cards.forEach((c) => io.observe(c.el));
  // survol : ordinateur seulement
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  cards.forEach((c) => {
    c.el.addEventListener('pointermove', (e) => {
      const r = c.el.getBoundingClientRect();
      c.hov = true; c.tl = 1;
      c.tx = ((e.clientX - r.left) / r.width) * 2 - 1; c.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      kick();
    });
    c.el.addEventListener('pointerleave', () => { c.hov = false; kick(); });
  });
}
