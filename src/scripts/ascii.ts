// Accueil : un nuage de caractères ton sur ton qui naît sous le curseur, s'étire dans son sillage et se dissipe.
// Champ de densité sur une grille de cellules mono ; chaque passage du curseur y dépose une bouffée irrégulière (bruit),
// qui monte doucement et s'éteint. Dessiné par-dessus les écrans en « multiply » : invisible sur le texte noir, à peine gris sur le fond.
import { reduced } from './motion';

export function initAscii(canvas: HTMLCanvasElement) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || reduced()) { canvas.remove(); return; }
  const ctx = canvas.getContext('2d')!;
  const CW = 11, CH = 15, RAMP = ' .·:-=+*#%@';
  let W = 0, H = 0, cols = 0, rows = 0, F = new Float32Array(0), dpr = 1;
  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    cols = Math.ceil(W / CW); rows = Math.ceil(H / CH); F = new Float32Array(cols * rows);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = `12px 'Geist Mono', monospace`; ctx.textBaseline = 'top';
  };
  size(); addEventListener('resize', size);
  const n2 = (x: number, y: number, t: number) => Math.sin(x * 0.11 + t) * Math.cos(y * 0.13 - t * 0.7) + Math.sin((x + y) * 0.07 + t * 1.3);
  let mx = -1, my = -1, px = -1, py = -1, raf = 0, t = 0;
  const deposit = (x: number, y: number, amt: number) => {
    const R = 7, cx = Math.floor(x / CW), cy = Math.floor(y / CH);
    for (let j = -R; j <= R; j++) for (let i = -R * 1.4; i <= R * 1.4; i++) {
      const c = cx + Math.round(i), r = cy + j; if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
      const d = (i * i) / (R * R * 1.9) + (j * j) / (R * R);
      if (d > 1) continue;
      const k = (1 - d) * (0.55 + 0.45 * n2(c, r, t)) * amt;
      if (k > 0) F[r * cols + c] = Math.min(1, F[r * cols + c] + k);
    }
  };
  const loop = () => {
    t += 0.03;
    if (mx >= 0) {
      const dx = mx - px, dy = my - py, steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 18));
      for (let s = 1; s <= steps; s++) deposit(px + (dx * s) / steps, py + (dy * s) / steps, 0.14);
      px = mx; py = my;
    }
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    // le nuage monte d'une cellule de temps en temps et s'éteint
    const rise = Math.random() < 0.18;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c; let v = F[i];
      if (rise && r < rows - 1) v = Math.max(v, F[i + cols] * 0.6);
      v *= 0.955; F[i] = v;
      if (v < 0.04) continue;
      alive = true;
      const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1) + (n2(c, r, t * 2) * 0.6)))] || '.';
      if (ch === ' ') continue;
      ctx.fillStyle = `rgba(17,17,17,${(0.06 + v * 0.2).toFixed(3)})`;
      ctx.fillText(ch, c * CW, r * CH);
    }
    raf = alive || mx >= 0 ? requestAnimationFrame(loop) : 0;
  };
  let idle = 0;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (mx < 0) { px = e.clientX; py = e.clientY; }
    mx = e.clientX; my = e.clientY;
    clearTimeout(idle); idle = window.setTimeout(() => { mx = -1; }, 120);
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } });
}
