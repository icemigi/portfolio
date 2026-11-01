// Accueil : le cavalier en ASCII, ton sur ton, posé à droite du nom (discret, visible au premier écran seulement),
// et un nuage de caractères qui naît sous le curseur, s'étire dans son sillage, monte et se dissipe.
// Le nuage est plus dense sur le cavalier : en passant la souris dessus, on le « révèle ».
// Deux toiles : le cavalier (dessiné une fois) et le nuage (animé tant qu'il vit). « Multiply » : invisible sur le texte noir.
import { reduced } from './motion';

const CW = 13, CH = 17, FONT = `14px 'Geist Mono', monospace`, RAMP = ' .·:-=+*#%@';

export function initAscii(canvas: HTMLCanvasElement) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const logo = document.createElement('canvas');
  logo.className = 'ascii ascii-logo'; logo.setAttribute('aria-hidden', 'true');
  canvas.before(logo);
  const lc = logo.getContext('2d')!, ctx = canvas.getContext('2d')!;
  let W = 0, H = 0, cols = 0, rows = 0, dpr = 1, F = new Float32Array(0), MASK = new Float32Array(0);
  const img = new Image(); img.src = '/logo-kerningkastle-dark.svg';

  const setup = (c: HTMLCanvasElement, x: CanvasRenderingContext2D) => {
    c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px';
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.font = FONT; x.textBaseline = 'top';
  };
  // masque du cavalier sur la grille : à droite, centré verticalement, ~70 % de la hauteur
  const buildMask = () => {
    MASK = new Float32Array(cols * rows);
    if (!img.complete || !img.naturalWidth) return;
    const size = Math.min(rows * 0.72, (cols * CW * 0.42) / CH) | 0; // en lignes
    const wCells = Math.round((size * CH) / CW), hCells = size;
    const ox = Math.round(cols * (innerWidth > 760 ? 0.66 : 0.5) - wCells / 2), oy = Math.round((rows - hCells) / 2);
    const o = document.createElement('canvas'); o.width = wCells; o.height = hCells;
    const g = o.getContext('2d')!; g.drawImage(img, 0, 0, wCells, hCells);
    const d = g.getImageData(0, 0, wCells, hCells).data;
    for (let j = 0; j < hCells; j++) for (let i = 0; i < wCells; i++) {
      const c = ox + i, r = oy + j; if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
      // le logo est un disque plein où le cavalier est en réserve : on dessine le cavalier (la réserve), pas le disque
      const k = (j * wCells + i) * 4; const a = d[k + 3] / 255, lum = (d[k] + d[k + 1] + d[k + 2]) / 765, ink = a * (1 - lum);
      const ux = (i + 0.5) / wCells - 0.5, uy = (j + 0.5) / hCells - 0.5, inDisc = ux * ux + uy * uy < 0.43 * 0.43;
      MASK[r * cols + c] = inDisc ? Math.max(0, 1 - ink) : 0;
    }
  };
  const drawLogo = () => {
    lc.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const m = MASK[r * cols + c]; if (m < 0.3) continue;
      lc.fillStyle = `rgba(17,17,17,${(0.06 + m * 0.1).toFixed(3)})`;
      lc.fillText(RAMP[Math.min(RAMP.length - 1, 3 + Math.round(m * 5))], c * CW, r * CH);
    }
  };
  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cols = Math.ceil(W / CW); rows = Math.ceil(H / CH); F = new Float32Array(cols * rows);
    setup(logo, lc); setup(canvas, ctx); buildMask(); drawLogo();
  };
  size(); addEventListener('resize', size);
  img.decode().then(() => document.fonts.ready).then(() => { buildMask(); drawLogo(); }).catch(() => {});
  // le cavalier n'apparaît qu'au premier écran de l'accueil
  const show = () => logo.classList.toggle('off', document.documentElement.dataset.screen !== '0');
  show(); new MutationObserver(show).observe(document.documentElement, { attributes: true, attributeFilter: ['data-screen'] });

  if (!fine || reduced()) { canvas.remove(); return; }
  const n2 = (x: number, y: number, t: number) => Math.sin(x * 0.11 + t) * Math.cos(y * 0.13 - t * 0.7) + Math.sin((x + y) * 0.07 + t * 1.3);
  let mx = -1, my = -1, px = -1, py = -1, raf = 0, t = 0;
  const deposit = (x: number, y: number, amt: number) => {
    const R = 8, cx = Math.floor(x / CW), cy = Math.floor(y / CH);
    for (let j = -R; j <= R; j++) for (let i = -R * 1.5; i <= R * 1.5; i++) {
      const c = cx + Math.round(i), r = cy + j; if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
      const d = (i * i) / (R * R * 2.2) + (j * j) / (R * R); if (d > 1) continue;
      const idx = r * cols + c;
      const k = (1 - d) * (0.55 + 0.45 * n2(c, r, t)) * amt * (1 + MASK[idx] * 1.8);
      if (k > 0) F[idx] = Math.min(1, F[idx] + k);
    }
  };
  const loop = () => {
    t += 0.03;
    if (mx >= 0) {
      const dx = mx - px, dy = my - py, steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 16));
      for (let s = 1; s <= steps; s++) deposit(px + (dx * s) / steps, py + (dy * s) / steps, 0.16);
      px = mx; py = my;
    }
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    const rise = Math.random() < 0.2;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c; let v = F[i];
      if (rise && r < rows - 1) v = Math.max(v, F[i + cols] * 0.6);
      v *= 0.958; F[i] = v;
      if (v < 0.04) continue;
      alive = true;
      const ch = RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1) + n2(c, r, t * 2) * 0.6)))];
      ctx.fillStyle = `rgba(17,17,17,${(0.07 + v * 0.26).toFixed(3)})`;
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
