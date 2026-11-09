// CV : le portrait de la page À propos en ASCII, dans un <pre>. Le nombre de colonnes, le cadrage et la rampe de caractères
// dépendent de la largeur disponible ; le corps, l'interligne et l'approche sont calculés d'après la largeur réelle d'un caractère :
// le bloc remplit exactement sa place, sans débordement. Fond bleuté du portrait effacé : le visage se détache sur le terminal.
const SRC = '/portrait-720.webp';
const FAMILY = '"Geist Mono"';
const MEDIUM = ' .`:;-~=+*cotsxXS#%@';
const LONG = " .'`^,:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@";

type Tier = { cols: number; ramp: string; leading: number; crop: [number, number, number, number]; sharpen: number };
// plus la place manque, plus le cadrage se resserre sur le visage et plus la rampe est simple (des valeurs franches restent lisibles petites)
const tier = (w: number): Tier => {
  if (w < 360) return { cols: 62, ramp: MEDIUM, leading: 1, crop: [0.31, 0.33, 0.69, 0.62], sharpen: 0.8 };
  if (w < 520) return { cols: 74, ramp: MEDIUM, leading: 1, crop: [0.3, 0.31, 0.7, 0.63], sharpen: 0.8 };
  if (w < 760) return { cols: 100, ramp: MEDIUM, leading: 1.04, crop: [0.2, 0.08, 0.8, 0.76], sharpen: 1 };
  return { cols: 132, ramp: LONG, leading: 1.08, crop: [0.17, 0.06, 0.83, 0.86], sharpen: 0.9 };
};

let image: Promise<HTMLImageElement> | null = null;
const load = () => (image ??= new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = SRC; }));

function shades(img: HTMLImageElement, t: Tier, rows: number) {
  const [x0, y0, x1, y1] = t.crop, c = document.createElement('canvas');
  c.width = t.cols; c.height = rows;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, x0 * img.naturalWidth, y0 * img.naturalHeight, (x1 - x0) * img.naturalWidth, (y1 - y0) * img.naturalHeight, 0, 0, t.cols, rows);
  const d = g.getImageData(0, 0, t.cols, rows).data, n = t.cols * rows, L = new Float32Array(n), bg = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = d[i * 4], gr = d[i * 4 + 1], b = d[i * 4 + 2];
    L[i] = (0.2126 * r + 0.7152 * gr + 0.0722 * b) / 255;
    bg[i] = b > r + 10 && L[i] > 0.42 ? 1 : 0; // le fond du portrait est bleu clair ; la peau est chaude, l'armure neutre
  }
  // détail : renforcement local, puis étalement des valeurs sur toute la rampe
  const S = new Float32Array(n), at = (x: number, y: number) => L[Math.max(0, Math.min(rows - 1, y)) * t.cols + Math.max(0, Math.min(t.cols - 1, x))];
  for (let y = 0; y < rows; y++) for (let x = 0; x < t.cols; x++) {
    const v = at(x, y), blur = (at(x - 1, y) + at(x + 1, y) + at(x, y - 1) + at(x, y + 1)) / 4;
    S[y * t.cols + x] = v + t.sharpen * (v - blur);
  }
  // l'étalement se règle sur le centre de l'image (le visage), pas sur les reflets du casque : yeux, sourcils et moustache se détachent
  const kept: number[] = [];
  for (let y = Math.floor(rows * 0.3); y < rows * 0.72; y++) for (let x = Math.floor(t.cols * 0.3); x < t.cols * 0.7; x++) if (!bg[y * t.cols + x]) kept.push(S[y * t.cols + x]);
  kept.sort((a, b) => a - b);
  const lo = kept[Math.floor(kept.length * 0.04)] ?? 0, hi = kept[Math.floor(kept.length * 0.96)] ?? 1;
  return { S, bg, lo, span: Math.max(0.01, hi - lo) };
}

export async function paintPortrait(pre: HTMLElement) {
  const [img] = await Promise.all([load(), document.fonts.load(`100px ${FAMILY}`)]);
  const avail = pre.parentElement!.clientWidth;
  if (!avail) return;
  const room = Math.min(avail, 640), t = tier(avail);
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = `100px ${FAMILY}`;
  const adv = probe.measureText('M').width / 100; // largeur d'un caractère, en em
  const [x0, y0, x1, y1] = t.crop;
  const ratio = ((y1 - y0) * img.naturalHeight) / ((x1 - x0) * img.naturalWidth);
  const rows = Math.round((t.cols * ratio * adv) / t.leading);
  // jamais plus haut que l'écran n'en laisse : on réduit la largeur, le nombre de caractères reste le même
  const width = Math.min(room, (innerHeight * (avail < 760 ? 0.62 : 0.8) * t.cols * adv) / (rows * t.leading));
  const size = Math.floor((width / (t.cols * adv)) * 100) / 100;
  const { S, bg, lo, span } = shades(img, t, rows);
  const last = t.ramp.length - 1;
  let out = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < t.cols; x++) {
      const i = y * t.cols + x;
      out += bg[i] ? ' ' : t.ramp[Math.round(Math.max(0, Math.min(1, (S[i] - lo) / span)) ** 0.9 * last)];
    }
    if (y < rows - 1) out += '\n';
  }
  pre.style.width = `${width}px`;
  pre.style.fontSize = `${size}px`;
  pre.style.lineHeight = `${(size * t.leading).toFixed(2)}px`;
  pre.style.letterSpacing = `${(width / t.cols - size * adv).toFixed(3)}px`;
  pre.textContent = out;
}
