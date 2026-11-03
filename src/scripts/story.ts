// Moteur des études de cas en « one scroll ». Chaque élément [data-fx] est piloté par sa position dans l'écran :
// p = 0 quand il entre par le bas, 1 quand il sort par le haut. Les écrans [data-pin] sont épinglés (sticky) et
// pilotés par l'avancement q (0 → 1) à l'intérieur de leur hauteur. Une seule boucle, seulement pendant le défilement.
import { reduced } from './motion';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

export function initStory(root: HTMLElement) {
  const still = reduced();
  const phone = matchMedia('(max-width: 760px)').matches;
  const header = document.querySelector<HTMLElement>('.site-header');
  const fx = [...root.querySelectorAll<HTMLElement>('[data-fx]')].map((el) => ({ el, k: el.dataset.fx!, s: Number(el.dataset.speed || 0), i: Number(el.dataset.k || 0) }));
  const pins = [...root.querySelectorAll<HTMLElement>('[data-pin]')];
  const wordPins = pins.filter((p) => p.dataset.pin === 'words');
  const words = wordPins.map((p) => [...p.querySelectorAll<HTMLElement>('.w')]);
  let raf = 0;

  const apply = () => {
    raf = 0;
    const H = innerHeight;
    header?.classList.toggle('solid', scrollY > 8);
    if (still) return;
    for (const f of fx) {
      const r = f.el.getBoundingClientRect();
      if (r.bottom < -H * 0.5 || r.top > H * 1.5) continue;
      const p = (H - r.top) / (H + r.height); // 0 → 1
      const e = ease(p / 0.5); // arrivé à mi-course
      const side = f.i % 2 ? 1 : -1;
      let t = '';
      switch (f.k) {
        case 'par': t = `translate3d(0, ${((p - 0.5) * f.s * H).toFixed(1)}px, 0)`; break;
        case 'sides': t = `translate3d(${(side * (1 - e) * (phone ? 20 : 45)).toFixed(2)}vw, 0, 0) rotate(${(side * (1 - e) * 8).toFixed(2)}deg)`; break;
        case 'left': case 'right': { const s = f.k === 'left' ? -1 : 1; t = `translate3d(${(s * (1 - e) * 40).toFixed(2)}vw, ${((p - 0.5) * 60).toFixed(1)}px, 0) rotate(${(s * (1 - e) * 10).toFixed(2)}deg)`; break; }
        case 'rise': t = `translate3d(0, ${((1 - e) * 40).toFixed(2)}vh, 0) rotate(${((1 - e) * (f.i % 2 ? 7 : -7)).toFixed(2)}deg) scale(${(0.86 + 0.14 * e).toFixed(3)})`; break;
        case 'tilt': t = `rotateY(${((1 - e) * (f.i % 2 ? -38 : 38)).toFixed(2)}deg) rotateX(${((1 - e) * 10).toFixed(2)}deg) translate3d(0, ${((p - 0.5) * -80).toFixed(1)}px, 0)`; f.el.style.opacity = String(0.2 + 0.8 * e); break;
        case 'drift': t = `translate3d(0, ${((p - 0.5) * (f.i % 2 ? -0.35 : 0.2) * H).toFixed(1)}px, 0) rotate(${((p - 0.5) * (f.i % 2 ? -6 : 6)).toFixed(2)}deg)`; break;
        case 'zoom': t = `scale(${(1.3 - 0.3 * e).toFixed(3)})`; f.el.style.clipPath = `inset(${((1 - e) * 14).toFixed(2)}% ${((1 - e) * 22).toFixed(2)}%)`; break;
        case 'rise-soft': t = `translate3d(0, ${((1 - e) * 60).toFixed(1)}px, 0)`; f.el.style.opacity = String(e); break;
      }
      f.el.style.transform = t;
    }
    pins.forEach((pin) => {
      const r = pin.getBoundingClientRect();
      const q = clamp(-r.top / Math.max(1, r.height - H));
      if (pin.dataset.pin === 'words') {
        if (r.bottom < 0 || r.top > H) return;
        const ws = words[wordPins.indexOf(pin)];
        const n = Math.round(q * 1.25 * ws.length);
        ws.forEach((w, i) => w.classList.toggle('on', i < n));
      } else if (pin.dataset.pin === 'close') {
        // le mot arrive très espacé, se resserre au centre, tient, puis rapetisse et s'efface
        const el = pin.querySelector<HTMLElement>('.close')!;
        const a = ease(q / 0.4), b = clamp((q - 0.65) / 0.35);
        el.style.letterSpacing = `${(0.9 * (1 - a) - 0.04).toFixed(3)}em`;
        el.style.opacity = String(Math.min(a, 1 - b));
        el.style.transform = `scale(${(1 - 0.35 * b).toFixed(3)})`;
        el.style.filter = b > 0 ? `blur(${(b * 8).toFixed(1)}px)` : '';
      }
    });
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(apply); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  if (still) pins.forEach((p) => p.querySelectorAll('.w').forEach((w) => w.classList.add('on')));
  kick();

  // fin de page : continuer à faire défiler remplit l'anneau, puis ouvre le projet suivant
  const ring = root.querySelector<HTMLAnchorElement>('[data-next]');
  const arc = root.querySelector<SVGCircleElement>('[data-arc]');
  if (ring && arc) {
    let push = 0, last = 0, timer = 0;
    const set = () => { arc.style.strokeDashoffset = String(339.3 * (1 - clamp(push / 700))); };
    const open = () => { (window as any).kkLeavingNext = !still; try { if (!still) sessionStorage.setItem('kk-next', '1'); } catch { /* */ } location.href = ring.href; };
    addEventListener('wheel', (e) => {
      const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      if (!atEnd || e.deltaY <= 0) { if (e.deltaY < 0 && push) { push = 0; set(); } return; }
      const now = performance.now(); if (now - last > 400 && push === 0) { /* nouveau geste au bout de la page */ }
      last = now; push += e.deltaY; set();
      clearTimeout(timer); timer = window.setTimeout(() => { if (push < 700) { push = 0; arc.style.transition = 'stroke-dashoffset .4s'; set(); setTimeout(() => (arc.style.transition = ''), 400); } }, 600);
      if (push >= 700) open();
    }, { passive: true });
    ring.addEventListener('click', (e) => { e.preventDefault(); open(); });
    addEventListener('pageshow', (e) => { if ((e as PageTransitionEvent).persisted) { (window as any).kkLeavingNext = false; push = 0; set(); } });
  }
}
