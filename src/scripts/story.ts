// Moteur des études de cas en « one scroll ». Chaque élément [data-fx] est piloté par sa position dans l'écran :
// p = 0 quand il entre par le bas, 1 quand il sort par le haut. Les écrans [data-pin] sont épinglés (sticky) et
// pilotés par l'avancement q (0 → 1) à l'intérieur de leur hauteur. Une seule boucle, seulement pendant le défilement.
import { reduced, letters } from './motion';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

export function initStory(root: HTMLElement) {
  const still = reduced();
  const phone = matchMedia('(max-width: 760px)').matches;
  const header = document.querySelector<HTMLElement>('.site-header');
  const fx = [...root.querySelectorAll<HTMLElement>('[data-fx]')].map((el) => ({ el, k: el.dataset.fx!, v: el.dataset.v || 'par', side: Number(el.dataset.side || 1), s: Number(el.dataset.speed || 0), i: Number(el.dataset.k || 0) }));
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
        case 'fl': { // images des scènes, entièrement pilotées par le défilement (on remonte : ça rembobine)
          const y = (p - 0.5) * f.s * H;
          const a = ease(p / 0.42);
          if (f.v === 'slide') t = `translate3d(${(f.side * (1 - a) * 32).toFixed(2)}vw, ${(y * 0.5).toFixed(1)}px, 0)`;
          else if (f.v === 'mask') { t = `translate3d(0, ${(y * 0.6).toFixed(1)}px, 0) scale(${(1.08 - 0.08 * a).toFixed(3)})`; f.el.style.clipPath = a < 1 ? `inset(${((1 - a) * 100).toFixed(2)}% 0 0 0)` : ''; }
          else if (f.v === 'grow') t = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${(0.55 + 0.45 * a).toFixed(3)})`;
          else if (f.v === 'cross') t = `translate3d(${(f.side * (p - 0.5) * -14).toFixed(2)}vw, ${(y * 1.6).toFixed(1)}px, 0)`;
          else t = `translate3d(0, ${y.toFixed(1)}px, 0)`;
          break;
        }
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
      } else if (pin.dataset.pin === 'type') {
        // chapitre : son texte apparaît lettre par lettre (comme sur le reste du site) quand l'écran se pose, à chaque passage
        const v = pin.querySelector<HTMLElement>('.v')!;
        if (r.top <= 2 && r.bottom > H * 0.6) { if (!pin.dataset.shown) { pin.dataset.shown = '1'; v.style.opacity = '1'; letters(v, 40); } }
        else if (r.top > H * 0.5 || r.bottom < H * 0.2) { if (pin.dataset.shown) { delete pin.dataset.shown; v.style.opacity = '0'; } }
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
  steps(root, still);
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

// défilement fluide avec inertie (souris et pavé tactile ; le tactile garde le défilement natif)
function smooth(still: boolean) {
  if (still || !matchMedia('(pointer: fine)').matches) return;
  let target = scrollY, cur = scrollY, run = 0;
  const max = () => document.documentElement.scrollHeight - innerHeight;
  const loop = () => {
    cur += (target - cur) * 0.1;
    if (Math.abs(target - cur) < 0.5) { cur = target; run = 0; } else run = requestAnimationFrame(loop);
    scrollTo(0, cur);
  };
  addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.defaultPrevented) return;
    e.preventDefault();
    target = Math.min(max(), Math.max(0, target + e.deltaY * (e.deltaMode === 1 ? 16 : 1)));
    if (!run) run = requestAnimationFrame(loop);
  }, { passive: false });
  // clavier, barre de défilement, ancres : on repart de la position réelle
  addEventListener('scroll', () => { if (!run && Math.abs(scrollY - cur) > 2) target = cur = scrollY; }, { passive: true });
}

// Défilement forcé des études (règle du site : un geste = une étape). Les étapes sont des positions de défilement
// déclarées par data-step (fractions de la course de chaque section). Un geste fait glisser la page jusqu'à l'étape
// suivante en ~1 s : toutes les animations, pilotées par la position, se jouent pendant le glissement et se
// rembobinent au retour. Au bout de la page, les gestes remplissent l'anneau du projet suivant (plus haut).
function steps(root: HTMLElement, still: boolean) {
  // data-step="f[:durée ms[:l]]" : f = fraction de la course de la section ; durée = temps pour y arriver
  // (une lecture longue a le temps de se jouer) ; l = vitesse régulière (lecture), sinon départ et arrivée en douceur
  let T: { y: number; dur: number; lin: boolean }[] = [];
  const measure = () => {
    const H = innerHeight, max = document.documentElement.scrollHeight - H;
    const all: { y: number; dur: number; lin: boolean }[] = [];
    root.querySelectorAll<HTMLElement>('[data-step]').forEach((el) => {
      const top = el.getBoundingClientRect().top + scrollY, run = Math.max(0, el.offsetHeight - H);
      el.dataset.step!.split(',').forEach((e) => {
        const [f, d, l] = e.split(':');
        all.push({ y: Math.round(Math.min(max, Math.max(0, top + Number(f) * run))), dur: Number(d) || 0, lin: l === 'l' });
      });
    });
    all.push({ y: max, dur: 0, lin: false });
    all.sort((a, b) => a.y - b.y);
    T = all.filter((v, i, a) => i === 0 || v.y - a[i - 1].y > 24);
  };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  let busy = false, raf = 0, aim = -1, endAt = 0;
  const near = () => { let i = 0; T.forEach((t, k) => { if (Math.abs(t.y - scrollY) < Math.abs(T[i].y - scrollY)) i = k; }); return i; };
  const inout = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const soft = (x: number) => { const a = 0.12; return x < a ? (x * x) / (2 * a * (1 - a)) : x > 1 - a ? 1 - ((1 - x) * (1 - x)) / (2 * a * (1 - a)) : (x - a / 2) / (1 - a); };
  const run = (to: number, dur: number, lin: boolean) => {
    const y = scrollY, d = to - y, t0 = performance.now();
    busy = true; aim = to; endAt = t0 + dur; cancelAnimationFrame(raf);
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      scrollTo(0, y + d * (lin ? soft(u) : inout(u)));
      if (u < 1) raf = requestAnimationFrame(tick); else { busy = false; aim = -1; }
    };
    raf = requestAnimationFrame(tick);
  };
  const go = (dir: number) => {
    // une longue animation en cours : un geste l'accélère jusqu'à son terme ; le geste suivant passe à l'étape d'après
    if (busy && endAt - performance.now() > 520 && Math.sign(aim - scrollY) === dir) { run(aim, 420, false); return; }
    const base = busy && aim >= 0 ? aim : scrollY;
    const next = dir > 0 ? T.find((t) => t.y > base + 2) : [...T].reverse().find((t) => t.y < base - 2);
    if (!next) return;
    if (still) { scrollTo(0, next.y); return; }
    const H = innerHeight, dist = Math.abs(next.y - scrollY);
    // en avançant : la durée de l'étape (ou selon la distance) ; en revenant : un rembobinage plus vif
    const own = dir > 0 ? T.find((t) => t.y === next.y)!.dur : 0;
    const auto = Math.min(1500, Math.max(800, 650 + (dist / H) * 220));
    const dur = own ? (dir > 0 ? own : Math.min(1400, Math.max(700, own * 0.45))) : auto;
    run(next.y, dir > 0 ? dur : Math.min(1400, Math.max(700, (T[T.findIndex((t) => t.y === base)] ?? next).dur * 0.45 || auto)), dir > 0 && T.find((t) => t.y === next.y)!.lin);
  };
  const atEnd = () => scrollY >= T[T.length - 1].y - 2 && !busy;
  // détection d'un nouveau geste, comme les écrans du site : pause, changement de sens, ou reprise après l'inertie
  let last = 0, gdir = 0, used = false, armed = false, low = Infinity, lastGo = 0, acc = 0;
  addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const dir = Math.sign(e.deltaY);
    if (!dir) return;
    if (dir > 0 && atEnd()) return; // l'anneau du projet suivant prend le relais
    e.preventDefault();
    const now = performance.now(), abs = Math.abs(e.deltaY);
    const pause = now - last > 180;
    last = now;
    if (used) { low = Math.min(low, abs); if (low < 6 && abs > 24) armed = true; }
    const fresh = pause || dir !== gdir || (used && armed && now - lastGo > 450);
    if (fresh) { acc = 0; used = false; gdir = dir; }
    if (used) return;
    acc += e.deltaY;
    if (Math.abs(acc) > 30) { used = true; armed = false; low = Infinity; lastGo = now; go(dir); }
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if ((e.target as Element).closest?.('input, textarea, select, [contenteditable]')) return;
    const k = e.key;
    const dir = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey) ? 1 : k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey) ? -1 : 0;
    if (!dir) return;
    e.preventDefault(); if (!busy) go(dir);
  });
  let ty = 0;
  addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => { if (!(e.target as Element).closest?.('iframe')) e.preventDefault(); }, { passive: false });
  addEventListener('touchend', (e) => {
    const dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40 && !busy) go(Math.sign(dy));
  }, { passive: true });
  // arrivée au milieu d'une page (rechargement) : on se cale sur l'étape la plus proche
  addEventListener('load', () => { if (T.length && Math.abs(T[near()].y - scrollY) > 2) scrollTo(0, T[near()].y); });
}
