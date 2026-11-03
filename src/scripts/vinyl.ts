// Moteur du prototype Identités musicales (components/VinylStory.astro). Une seule valeur pilote tout : P, l'avancement
// (0 → 1) dans la scène épinglée. Chaque objet est une fonction de P : on avance, ça joue ; on remonte, ça rembobine.
// Le défilement fluide (scripts/story.ts) donne l'inertie : la vitesse du geste devient celle de l'animation.
import { reduced } from './motion';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const out = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initVinyl(root: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const $$ = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];
  const stage = $('.stage'), world = $('[data-world]');
  const sleeve = $('[data-sleeve]'), disc = $('[data-disc]'), ring = $<SVGSVGElement>('[data-ring]'), needle = $<SVGLineElement>('[data-needle]');
  const lens = $('[data-lens]'), lt = $('[data-lt]'), ball = $('[data-ball]');
  const bands = $$('[data-band]').map((b) => ({ b, t: b.querySelector<HTMLElement>('[data-bt]')!, d: b.querySelector<HTMLElement>('[data-bd]')!, l: b.querySelector<HTMLElement>('[data-rule]')! }));
  const pass = $$('[data-pass] figure'), keys = $$('[data-key]'), tiles = $$('[data-grid] i');
  const cols = $$('[data-t]').map((el) => ({ el, ws: [...el.querySelectorAll<HTMLElement>('.w')], n: -1 }));
  const hudL = $('[data-hudl]'), hudN = $('[data-hudn]');
  const col = (t: number) => cols.find((c) => c.el.dataset.t === String(t));
  const hud: string[] = JSON.parse(root.dataset.hud || '[]');
  const still = reduced();

  // lettres du texte que traverse la boule
  const chars: { el: HTMLElement; x: number; y: number; d: boolean }[] = [];
  const raw = lt.textContent || '';
  lt.textContent = '';
  raw.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) { lt.append(' '); return; }
    const w = document.createElement('span'); w.style.whiteSpace = 'nowrap';
    for (const c of part) { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.append(s); chars.push({ el: s, x: 0, y: 0, d: false }); }
    lt.append(w);
  });

  // positions de départ des pochettes et des tuiles (déterministes)
  const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const PX = [6, 60, 28, 0, 72, 16, 48, 0, 38, 66], PY = [0, 0, 0, 14, 0, 0, 0, 62, 0, 0];
  const scatter = tiles.map((_, i) => ({ x: (rnd(i) - 0.5) * 120, y: (rnd(i + 50) - 0.5) * 110, r: (rnd(i + 99) - 0.5) * 40 }));

  let lensBox = { l: 0, t: 0, w: 0, h: 0 };
  // lignes du texte (la boule les lit dans l'ordre, de gauche à droite)
  let lines: { y: number; x0: number; x1: number; a: number; b: number; s: number }[] = [], total = 1;
  const measure = () => {
    chars.forEach((c) => (c.el.style.transform = ''));
    const sr = stage.getBoundingClientRect();
    const prev = world.style.transform; world.style.transform = '';
    const lr = lt.getBoundingClientRect();
    lensBox = { l: lr.left - sr.left, t: lr.top - sr.top, w: lr.width, h: lr.height };
    chars.forEach((c) => { const r = c.el.getBoundingClientRect(); c.x = r.left - sr.left + r.width / 2; c.y = r.top - sr.top + r.height / 2; c.d = false; });
    lines = []; total = 0;
    chars.forEach((c, i) => {
      const L = lines[lines.length - 1];
      if (!L || Math.abs(c.y - L.y) > 4) lines.push({ y: c.y, x0: c.x, x1: c.x, a: i, b: i, s: 0 });
      else { L.x1 = c.x; L.b = i; }
    });
    lines.forEach((L) => { L.s = total; total += L.x1 - L.x0 + 40; });
    total = Math.max(1, total);
    world.style.transform = prev;
  };

  const words = (c: (typeof cols)[number], q: number) => {
    const n = Math.round(clamp(q) * c.ws.length);
    if (n !== c.n) { c.ws.forEach((w, k) => w.classList.toggle('on', k < n)); c.n = n; }
  };
  const fade = (P: number, a: number, b: number, c: number, d: number) => Math.min(out((P - a) / (b - a)), 1 - clamp((P - c) / (d - c)));
  const seg = (P: number, a: number, b: number) => clamp((P - a) / (b - a));
  const B = [0, 0.14, 0.29, 0.47, 0.62, 0.81, 0.86];
  let lastH = -1, raf = 0;

  const draw = () => {
    raf = 0;
    const r = root.getBoundingClientRect(), H = innerHeight, VW = innerWidth / 100, VH = H / 100;
    if (r.bottom < -H || r.top > H * 2) return;
    const P = still ? 0.999 : clamp(-r.top / Math.max(1, r.height - H));
    const VM = Math.min(VW, VH);
    // repère
    let h = 0; B.forEach((b, i) => { if (P >= b) h = i; });
    if (h !== lastH) { hudL.textContent = hud[h] ?? ''; hudN.textContent = String(h + 1).padStart(2, '0'); lastH = h; }

    // 1. pochette, le vinyle en sort
    const S = sleeve.offsetWidth;
    const outD = ease(seg(P, 0.03, 0.11)), away = ease(seg(P, 0.14, 0.19));
    sleeve.style.transform = `translate3d(${(9 * VW - S * 0.26 * outD - 75 * VW * away).toFixed(1)}px, ${((1 - out(seg(P, 0, 0.03))) * 40 * VH).toFixed(1)}px, 0) rotate(${(-10 * away).toFixed(2)}deg)`;
    const rot = P * 4200; // le disque tourne avec le défilement
    const big = ease(seg(P, 0.14, 0.19)), small = ease(seg(P, 0.29, 0.32));
    const D = disc.offsetWidth, ballD = 14 * VM;
    const dScale = lerp(lerp(1, 1.2, big), ballD / D, small);
    const dx = lerp(9 * VW + S * 0.62 * outD, 0, big);
    disc.style.transform = `translate3d(${dx.toFixed(1)}px, ${((1 - out(seg(P, 0, 0.03))) * 40 * VH).toFixed(1)}px, 0) scale(${dScale.toFixed(4)}) rotate(${rot.toFixed(1)}deg)`;
    disc.style.opacity = P > 0.32 ? '0' : '1';
    const c0 = col(0)!; c0.el.style.opacity = fade(P, 0.01, 0.035, 0.12, 0.14).toFixed(3); words(c0, seg(P, 0.025, 0.12));
    const c1 = col(1); if (c1) { c1.el.style.opacity = fade(P, 0.2, 0.22, 0.28, 0.3).toFixed(3); words(c1, seg(P, 0.205, 0.28)); }

    // 2. anneau : l'aiguille fait le tour, le texte s'écrit derrière elle
    const ro = fade(P, 0.17, 0.2, 0.28, 0.3);
    ring.style.opacity = ro.toFixed(3);
    if (ro > 0) {
      const a = 360 * ease(seg(P, 0.19, 0.28));
      const m = `conic-gradient(#000 0deg ${a.toFixed(2)}deg, transparent ${a.toFixed(2)}deg 360deg)`;
      ring.style.maskImage = m; (ring.style as any).webkitMaskImage = m;
      needle.setAttribute('transform', `rotate(${a.toFixed(2)} 500 500)`);
    }

    // 3. la boule traverse le texte
    const lo = fade(P, 0.3, 0.33, 0.45, 0.47);
    lens.style.opacity = lo.toFixed(3);
    const bo = P >= 0.31 && P < 0.47 ? 1 - seg(P, 0.455, 0.47) : 0;
    ball.style.opacity = String(bo);
    if (bo > 0 || chars.some((c) => c.d) || (P > 0.3 && P < 0.47)) {
      const cx = stage.offsetWidth / 2, cy = stage.offsetHeight / 2;
      // la boule suit les lignes une à une ; les lettres apparaissent une fois qu'elle les a dépassées
      const u = seg(P, 0.335, 0.45), dist = u * total;
      let li = lines.length - 1; for (let k = 0; k < lines.length; k++) if (dist < lines[k].s + lines[k].x1 - lines[k].x0 + 40) { li = k; break; }
      const L = lines[li] ?? { y: cy, x0: cx, x1: cx, s: 0, a: 0, b: -1 };
      const tx = Math.min(L.x1 + 20, L.x0 + Math.max(0, dist - L.s)), ty = L.y;
      const g = ease(seg(P, 0.31, 0.335));
      const bx = lerp(cx, P < 0.335 ? L.x0 - ballD : tx, g), by = lerp(cy, ty, g);
      ball.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`;
      const R = ballD * 1.5;
      chars.forEach((c, i) => {
        c.el.classList.toggle('on', u > 0 && (i < L.a || (i <= L.b && c.x < tx) || (u >= 1)));
        const ddx = c.x - bx, ddy = c.y - by, d = Math.hypot(ddx, ddy);
        if (bo > 0 && d < R) {
          const k = Math.pow(1 - d / R, 1.6) * R * 0.5, nx = ddx / (d || 1), ny = ddy / (d || 1);
          c.el.style.transform = `translate3d(${(nx * k).toFixed(1)}px, ${(ny * k).toFixed(1)}px, 0) rotate(${(nx * k * 0.2).toFixed(1)}deg)`;
          c.d = true;
        } else if (c.d) { c.el.style.transform = ''; c.d = false; }
      });
    }

    // 4. bandes découpées : un petit disque passe et dévoile les mots
    bands.forEach(({ b, t, d, l }, i) => {
      const o = 1 - seg(P, 0.6 + i * 0.004, 0.62 + i * 0.004);
      b.style.opacity = o.toFixed(3);
      b.style.transform = o < 1 ? `translate3d(0, ${((1 - o) * -30).toFixed(1)}px, 0)` : '';
      const draw = out(seg(P, 0.47 + i * 0.01, 0.5 + i * 0.01));
      l.style.transform = `scaleX(${draw.toFixed(4)})`;
      const bw = b.offsetWidth, dw = d.offsetWidth, u = ease(seg(P, 0.5 + i * 0.022, 0.55 + i * 0.022));
      const px = lerp(0, bw - dw, u);
      d.style.opacity = draw >= 1 && u < 1 ? '1' : '0';
      d.style.transform = `translate3d(${px.toFixed(1)}px, 0, 0)`;
      t.style.clipPath = `inset(-20% ${(100 - clamp((px + dw / 2) / bw) * 100).toFixed(2)}% -20% 0)`;
    });
    const c3 = col(3)!; c3.el.style.opacity = fade(P, 0.48, 0.5, 0.6, 0.62).toFixed(3); words(c3, seg(P, 0.49, 0.6));

    // 5. les pochettes se croisent sous les choix clés
    pass.forEach((f, i) => {
      const t0 = 0.62 + i * 0.017, du = 0.075 + (i % 3) * 0.03, u = seg(P, t0, t0 + du);
      f.style.opacity = u > 0 && u < 1 ? '1' : '0';
      if (u <= 0 || u >= 1) return;
      const w = f.offsetWidth, hh = f.offsetHeight, dir = i % 4;
      let x = PX[i] * VW, y = PY[i] * VH;
      if (dir === 0) y = lerp(H + 20, -hh - 20, u);
      else if (dir === 1) y = lerp(-hh - 20, H + 20, u);
      else if (dir === 2) x = lerp(innerWidth + 20, -w - 20, u);
      else x = lerp(-w - 20, innerWidth + 20, u);
      f.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
    keys.forEach((k, i) => {
      const a = 0.63 + i * 0.065;
      const o = fade(P, a, a + 0.012, a + 0.05, a + 0.062);
      k.style.opacity = o.toFixed(3);
      k.style.transform = `translate3d(0, ${((1 - o) * (P < a + 0.03 ? 30 : -30)).toFixed(1)}px, 0)`;
    });
    const c5 = col(5)!; c5.el.style.opacity = fade(P, 0.815, 0.83, 0.86, 0.875).toFixed(3); words(c5, seg(P, 0.82, 0.86));

    // 6. grille de toutes les pochettes, puis la scène dézoome en vignette
    tiles.forEach((tl, i) => {
      const u = out(seg(P, 0.865 + i * 0.0022, 0.905 + i * 0.0022)), s = scatter[i];
      tl.style.opacity = u > 0 ? '1' : '0';
      tl.style.transform = u >= 1 ? '' : `translate3d(${((1 - u) * s.x).toFixed(2)}vw, ${((1 - u) * s.y).toFixed(2)}vh, 0) rotate(${((1 - u) * s.r).toFixed(1)}deg) scale(${(0.6 + 0.4 * u).toFixed(3)})`;
    });
    const c6 = col(6)!; c6.el.style.opacity = out(seg(P, 0.885, 0.905)).toFixed(3); words(c6, seg(P, 0.89, 0.96));
  };

  const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { measure(); kick(); });
  ((window as any).kkReady ?? Promise.resolve()).then(() => { measure(); kick(); });
  addEventListener('load', () => { measure(); kick(); });
  measure(); kick();
}
