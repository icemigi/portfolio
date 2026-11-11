// Mise au point ASCII (11/11) : à l'entrée d'un écran de visuels, chaque image arrive en grosse grille de signes
// Geist Mono colorés par l'image ; la grille s'affine en continu (taille de cellule interpolée en échelle log),
// des signes au hasard ondulent en nappes (bruit de Perlin) puis se retirent, et l'image nette prend le relais.
// Une toile par image, posée exactement sur elle ; rien ne bouge dans la mise en page.

const RAMP = ' .·:-=+*#%@', GLY = '01/\\|<>[]{}+-=*:;!?#%&$@aeknsgt';
const CH = [...new Set(RAMP + GLY)].filter((c) => c !== ' ');
const RI = [...RAMP].map((c) => (c === ' ' ? -1 : CH.indexOf(c))), GI = [...GLY].map((c) => CH.indexOf(c));
const AS = 64;

// bruit de Perlin 3D (x, y, temps)
const perm = new Uint8Array(512);
{ const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
const fd = (t: number) => t * t * t * (t * (t * 6 - 15) + 10), lp = (a: number, b: number, t: number) => a + (b - a) * t;
const gr = (h: number, x: number, y: number, z: number) => { const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
function noise(x: number, y: number, z: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fd(x), v = fd(y), w = fd(z);
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
  return lp(lp(lp(gr(perm[AA] & 15, x, y, z), gr(perm[BA] & 15, x - 1, y, z), u), lp(gr(perm[AB] & 15, x, y - 1, z), gr(perm[BB] & 15, x - 1, y - 1, z), u), v),
    lp(lp(gr(perm[AA + 1] & 15, x, y, z - 1), gr(perm[BA + 1] & 15, x - 1, y, z - 1), u), lp(gr(perm[AB + 1] & 15, x, y - 1, z - 1), gr(perm[BB + 1] & 15, x - 1, y - 1, z - 1), u), v), w) * 0.5 + 0.5;
}

// atlas : chaque signe dessiné une fois, en blanc ; la couleur vient ensuite de l'image (composition source-in)
let atlas: HTMLCanvasElement | null = null;
function getAtlas() {
  if (atlas) return atlas;
  atlas = document.createElement('canvas'); atlas.width = AS * CH.length; atlas.height = AS;
  const a = atlas.getContext('2d')!;
  a.fillStyle = '#fff'; a.font = `${AS * 0.92}px "Geist Mono", ui-monospace, monospace`; a.textAlign = 'center'; a.textBaseline = 'middle';
  CH.forEach((c, i) => a.fillText(c, i * AS + AS / 2, AS / 2 + AS * 0.04));
  return atlas;
}

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const ready = (m: HTMLImageElement) => (m.complete && m.naturalWidth ? Promise.resolve() : new Promise<void>((r) => { m.addEventListener('load', () => r(), { once: true }); m.addEventListener('error', () => r(), { once: true }); }));

/** Joue la mise au point sur une image (déjà dans la page, à sa place). */
export async function focusIn(img: HTMLImageElement, delay = 0, T = 1250) {
  img.style.opacity = '0';
  await ready(img);
  if (!img.naturalWidth) { img.style.opacity = ''; return; }
  const W = img.clientWidth, H = img.clientHeight;
  if (W < 40 || H < 40) { img.style.opacity = ''; return; }
  const host = img.offsetParent as HTMLElement || img.parentElement!;
  const cv = document.createElement('canvas');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  cv.className = 'af';
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = `position:absolute;left:${img.offsetLeft}px;top:${img.offsetTop}px;width:${W}px;height:${H}px;pointer-events:none;`;
  host.appendChild(cv);
  const ctx = cv.getContext('2d')!;
  // l'image réduite (une valeur par cellule) : on la redessine à chaque taille de grille
  const sm = document.createElement('canvas'), sx = sm.getContext('2d', { willReadFrequently: true })!;
  const at = getAtlas();
  const S0 = Math.max(36, W / 14), S1 = Math.max(4, W / 170);
  await new Promise((r) => setTimeout(r, delay));
  const t0 = performance.now();
  let faded = false;
  return new Promise<void>((done) => {
    const frame = (now: number) => {
      const u = Math.min(1, (now - t0) / T), e = ease(u);
      const S = Math.exp(Math.log(S0) + (Math.log(S1) - Math.log(S0)) * e);
      const cols = Math.ceil(W / S), rows = Math.ceil(H / S);
      sm.width = cols; sm.height = rows;
      sx.drawImage(img, 0, 0, cols, rows);
      const px = sx.getImageData(0, 0, cols, rows).data;
      const rnd = 0.55 * Math.pow(1 - e, 1.3), tt = now / 900;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const o = (j * cols + i) * 4;
        if (px[o + 3] < 20) continue;
        const l = (0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2]) / 255;
        // densité : contraste avec le fond clair de la page (une zone claire reste aérée, une zone sombre se remplit)
        const d = Math.max(0.12, 1 - l * 0.85);
        const x = i * S, y = j * S, n = noise(x * 0.012, y * 0.012, tt);
        const gi = n < rnd ? GI[Math.floor(noise(x * 0.11, y * 0.11, tt * 2.3) * GI.length * 3) % GI.length] : RI[Math.min(RAMP.length - 1, Math.max(1, Math.round(d * (RAMP.length - 1))))];
        if (gi < 0) continue;
        ctx.drawImage(at, gi * AS, 0, AS, AS, x, y, S, S);
      }
      // couleur de chaque signe = couleur de l'image dans sa cellule
      ctx.globalCompositeOperation = 'source-in';
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sm, 0, 0, cols * S, rows * S);
      if (u > 0.82 && !faded) {
        faded = true;
        const r = Math.round(T * 0.18 + 140);
        img.style.transition = `opacity ${r}ms cubic-bezier(.215,.61,.355,1)`; img.style.opacity = '1';
        cv.style.transition = `opacity ${r}ms cubic-bezier(.215,.61,.355,1)`; cv.style.opacity = '0';
        setTimeout(() => { cv.remove(); img.style.transition = ''; img.style.opacity = ''; done(); }, r + 40);
      }
      if (u < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
