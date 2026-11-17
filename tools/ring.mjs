// Images de l'anneau de l'accueil (Ring.astro) : écrit /public/ring/ depuis le dossier source ../assets/roue (hors dépôt).
// Lancer : node tools/ring.mjs
// - chaque image du dossier → <nom>.webp, 960 × 540 (16/9, recadrée au centre) ;
// - chaque sous-dossier → <nom>.webp animée en boucle : ses images, dans l'ordre de leur nom, se succèdent (HOLD ms posée,
//   WIPE ms de passage, adouci), chaque passage avec sa découpe (CUTS, à tour de rôle : balayage vers le haut, vers la droite,
//   cercle qui s'ouvre, ouverture depuis le centre). WebP animé sans perte plutôt que GIF (256 couleurs) : couleurs exactes ; chaque vue n'est
//   faite que de deux images nettes, l'encodeur ne garde que ce qui change (un fondu, qui change tous les pixels, pesait
//   1,9 Mo sans perte et laissait des traces avec perte).
// - chaque sous-dossier nommé <nom>.mp4 (photos) → même enchaînement, mais en vidéo H.264 <nom>.mp4 (un WebP animé sans perte de
//   photos pèserait plusieurs Mo) et sa première image <nom>.webp, affichée en attendant la vidéo (Ring.astro).
// Les noms de fichiers sont mis en minuscules, espaces → tirets.
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { readdirSync, mkdirSync } from 'node:fs';
import { join, parse } from 'node:path';

const SRC = new URL('../../assets/roue/', import.meta.url).pathname;
const OUT = new URL('../public/ring/', import.meta.url).pathname;
const W = 960, H = 540, Q = 82;
const HOLD = 900, WIPE = 240, STEP = 40; // ms
const CRF = 28; // qualité des vidéos (plus bas = plus net et plus lourd)
// découpes : vrai si le pixel (x, y) montre déjà l'image suivante, à l'avancement s (0 → 1)
const R0 = Math.hypot(W, H) / 2;
const CUTS = [
  (x, y, s) => y >= H * (1 - s),                                // balayage vers le haut
  (x, y, s) => x < W * s,                                       // balayage vers la droite
  (x, y, s) => Math.hypot(x - W / 2, y - H / 2) < R0 * s,       // cercle qui s'ouvre
  (x, y, s) => Math.abs(x - W / 2) < (W / 2) * s,             // ouverture depuis le centre (deux portes)
];
const IMG = /\.(png|jpe?g|webp|tiff?)$/i;
const slug = (n) => n.toLowerCase().replace(/\s+/g, '-');
// captures de site : recadrées en haut (la barre de navigation reste entière), les autres au centre
const TOP = new Set(['sa.mp4']);
const fit = (file, top = false) => sharp(file).resize(W, H, { fit: 'cover', position: top ? 'top' : 'centre' }).removeAlpha();

mkdirSync(OUT, { recursive: true });
for (const e of readdirSync(SRC, { withFileTypes: true })) {
  if (e.isFile() && IMG.test(e.name)) {
    const out = join(OUT, `${slug(parse(e.name).name)}.webp`);
    await fit(join(SRC, e.name)).webp({ quality: Q }).toFile(out);
    console.log(out);
  } else if (e.isDirectory()) {
    const dir = join(SRC, e.name);
    const files = readdirSync(dir).filter((n) => IMG.test(n)).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    const raw = await Promise.all(files.map((n) => fit(join(dir, n), TOP.has(e.name)).raw().toBuffer()));
    const frames = [], delay = [], steps = Math.round(WIPE / STEP);
    raw.forEach((a, i) => {
      const b = raw[(i + 1) % raw.length];
      frames.push(a); delay.push(HOLD);
      for (let k = 1; k < steps; k++) {
        const t = k / steps, s = t * t * (3 - 2 * t), cut = CUTS[i % CUTS.length], m = Buffer.from(a); // adouci (smoothstep)
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (cut(x, y, s)) { const p = (y * W + x) * 3; m[p] = b[p]; m[p + 1] = b[p + 1]; m[p + 2] = b[p + 2]; }
        frames.push(m); delay.push(STEP);
      }
    });
    if (e.name.endsWith('.mp4')) { // vidéo : chaque vue répétée selon sa durée (une image toutes les STEP ms)
      const out = join(OUT, slug(e.name));
      await new Promise((ok, ko) => {
        const p = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-framerate', String(1000 / STEP), '-i', '-',
          '-an', '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
        p.on('error', ko); p.on('close', (c) => (c ? ko(new Error(`ffmpeg : code ${c}`)) : ok()));
        frames.forEach((f, i) => { for (let n = Math.round(delay[i] / STEP); n > 0; n--) p.stdin.write(f); });
        p.stdin.end();
      });
      await sharp(frames[0], { raw: { width: W, height: H, channels: 3 } }).webp({ quality: Q }).toFile(out.replace(/\.mp4$/, '.webp'));
      console.log(out, `${files.length} images`);
      continue;
    }
    const png = await Promise.all(frames.map((f) => sharp(f, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer()));
    const out = join(OUT, `${slug(e.name)}.webp`);
    await sharp(png, { join: { animated: true } }).webp({ lossless: true, effort: 6, loop: 0, delay }).toFile(out);
    console.log(out, `${files.length} images, ${frames.length} vues`);
  }
}
