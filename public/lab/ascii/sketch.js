// Matrice systémique (kerningkastle) — d'après « Systemic Matrix » (série INSTANCE) : une trame de caractères mono dont la
// densité suit un bruit à plusieurs octaves, enroulé en vortex ; certains caractères s'allument en aplats de deux couleurs.
// Ajouts pour le Lab : l'affiche (4:5) tient dans l'écran ; le centre du vortex suit le curseur, en douceur ; clic : nouveau
// tirage (graine, taille des cellules, force du vortex, grain, vitesse) ; palettes ; pause ; enregistrer ; mode jour / nuit.
const DENSITY = 'Ñ@#W$9876543210?!abc;:+=-,._ ';
const VOID = new Set(['6', '3', 'a', ';']);           // caractères qui s'effacent (trous dans la trame)
const PALS = [
  { fr: 'bleu / jaune', en: 'blue / yellow', a: '#0000FF', b: '#FFFF00' },
  { fr: 'orange / noir', en: 'orange / black', a: '#FF7E00', b: '#111111' },
  { fr: 'citron / olive', en: 'lime / olive', a: '#DEDE1F', b: '#353C15' },
  { fr: 'rouge / crème', en: 'red / cream', a: '#E8231A', b: '#FFF3CC' },
];
const fr = document.documentElement.lang !== 'en';
let pal = 0, paused = false;
let cell, cols, rows, margin, seed = 42;
let noiseZoom = 0.1, vortexMult = 120, microSpeed = 0.015;
let cx = 0, cy = 0, tx = 0, ty = 0, t = 0;
let ink, paper;

function fitW() { const h = Math.min(innerHeight - 112, (innerWidth - 32) * 1.25); return Math.max(200, Math.floor(h / 1.25)); }

function setup() {
  const w = fitW(), c = createCanvas(w, Math.round(w * 1.25));
  c.parent('stage');
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  textFont('Geist Mono, ui-monospace, monospace');
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  noStroke();
  frameRate(30);
  applyTheme();
  roll(true);
}

function windowResized() { const w = fitW(); resizeCanvas(w, Math.round(w * 1.25)); grid(); }

function applyTheme() {
  const n = window.kkNight !== false && document.documentElement.dataset.theme !== 'jour';
  paper = color(n ? 14 : 240, n ? 14 : 240, n ? 14 : 235); ink = color(n ? 255 : 17);
}
addEventListener('kk:theme', () => { if (typeof color === 'function') applyTheme(); });

function grid() {
  margin = Math.round(width * 0.083);
  cell = Math.max(10, Math.round(width * cellK));
  cols = Math.floor((width - margin * 2) / cell);
  rows = Math.floor((height - margin * 2) / cell);
  cx = tx = cols / 2; cy = ty = rows / 2;
}

let cellK = 35 / 2160;
// nouveau tirage : graine, taille des cellules, force du vortex, grain et vitesse (comme les touches lettres du sketch d'origine)
function roll(first) {
  seed = Math.floor(Math.random() * 100000);
  if (!first) {
    cellK = [30, 35, 40, 50, 60][Math.floor(Math.random() * 5)] / 2160;
    vortexMult = 40 + Math.random() * 110; noiseZoom = 0.06 + Math.random() * 0.08; microSpeed = 0.01 + Math.random() * 0.02;
  }
  noiseSeed(seed);
  grid();
}

function multi(x, y, z) {
  let total = 0, f = 2, a = 2, max = 0;
  for (let i = 0; i < 4; i++) { total += noise(x * f, y * f, z) * a; max += a; a *= 0.5; f *= 2; }
  return total / max;
}

function draw() {
  if (paused) return;
  t++;
  // le centre du vortex suit le curseur (dans l'affiche), sinon revient doucement au centre
  const inside = mouseX > margin && mouseX < width - margin && mouseY > margin && mouseY < height - margin;
  tx = inside ? (mouseX - margin) / cell : cols / 2; ty = inside ? (mouseY - margin) / cell : rows / 2;
  cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
  background(paper);
  const P = PALS[pal];
  const it = t * 0.008, z0 = 42 + t * 0.006, spin = t * 0.01;
  textSize(cell * 0.9);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = margin + i * cell + cell / 2, y = margin + j * cell + cell / 2;
      const bio = noise(i * noiseZoom * 0.5, j * noiseZoom * 0.5, it);
      const dx = i - cx, dy = j - cy, d = Math.sqrt(dx * dx + dy * dy), ang = Math.atan2(dy, dx);
      const macro = 0.003 / (d + 5) * vortexMult;
      const micro = (noise(i * 0.05, j * 0.05, t * microSpeed + bio * 0.5) - 0.5) * 0.6;
      const na = ang + macro + micro + spin;
      const vx = cx + Math.cos(na) * d, vy = cy + Math.sin(na) * d;
      const n = Math.pow(constrain(multi(vx * 0.03 + bio * 0.3, vy * 0.03 + bio * 0.3, z0 + bio * 0.2), 0, 1), 1.2);
      const ch = DENSITY.charAt(constrain(Math.floor(n * DENSITY.length), 0, DENSITY.length - 1));
      if (ch === '5' || ch === 'b') { fill(P.a); rect(x, y, cell, cell); fill(P.b); text(ch, x, y); }
      else if (ch === '4' || ch === 'c') { fill(P.b); rect(x, y, cell, cell); fill(P.a); text(ch, x, y); }
      else if (!VOID.has(ch) && ch !== ' ') { fill(ink); text(ch, x, y); }
    }
  }
}

function mousePressed(e) {
  if (e && e.target && e.target.tagName !== 'CANVAS') return;
  roll(false);
}

function keyPressed() {
  if (key === ' ') { document.getElementById('pause').click(); return false; }
  if (key === 's' || key === 'S') { saveCanvas('matrice-systemique', 'png'); return false; }
}

const pb = document.getElementById('pal');
const label = () => { pb.textContent = (fr ? 'couleurs : ' : 'colours: ') + PALS[pal][fr ? 'fr' : 'en']; };
pb.addEventListener('click', () => { pal = (pal + 1) % PALS.length; label(); });
document.getElementById('roll').addEventListener('click', () => roll(false));
document.getElementById('pause').addEventListener('click', (e) => { paused = !paused; e.currentTarget.setAttribute('aria-pressed', String(paused)); });
document.getElementById('save').addEventListener('click', () => saveCanvas('matrice-systemique', 'png'));
if (!fr) {
  document.querySelector('.kk-bar .hint').textContent = 'move: the vortex follows · click: new draw · space: pause';
  document.getElementById('roll').textContent = 'draw'; document.getElementById('save').textContent = 'save';
  label();
}
