// Vignettes animées de l'anneau de l'accueil tirées du Lab : public/ring/lab-*.mp4 en 480 × 270 (deux fois la vignette affichée
// à 1440 px), et sa première image lab-*.webp, affichée en attendant la vidéo. Plan fixe : la pièce vit seule (le vortex tourne,
// les cellules poussent) et ses changements (palette, rendu) passent en un fondu bref ; la fin se fond dans le début (boucle sans
// couture). Chaque pièce p5 est pilotée image par image (noLoop + redraw, hasard à graine fixe : même résultat à chaque
// lancement), puis encodée en H.264 (une vidéo ne code que ce qui change : bien plus léger qu'un WebP animé).
// Lancer, site servi sur :4329 (npx astro preview --port 4329) : node tools/lab-reel.mjs [nom…]   (Playwright + Chromium requis ;
// avec des noms, seulement ces vignettes, ex. lab-matrice). night : la pièce en mode nuit (fond noir), pour que la vignette
// se détache du fond clair du site.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';

const BASE = 'http://localhost:4329', OUT = new URL('../public/ring/', import.meta.url).pathname;
const W = 480, H = 270, FPS = 20, CRF = 32;
const FADE = Math.round(0.3 * FPS), LOOP = Math.round(1 * FPS); // passage bref d'un état à l'autre (net, sans coupe sèche) ; fondu de la fin dans le début

const mix = (a, b, k) => { const o = Buffer.allocUnsafe(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] + (b[i] - a[i]) * k; return o; };

const b = await chromium.launch();

// reel : secs de film, cadre fixe (zoom z autour de fx, fy, marges inner), états successifs (un tous les secs / états.length)
const only = process.argv.slice(2);
// cut : changements d'état en coupe franche et boucle sans fondu (pièces en signes, où un fondu brouille la trame)
async function reel(name, path, { secs, z, fx = 0.5, fy = 0.5, inner = 0, states, night = false, cut = false }, setup, page$) {
  if (only.length && !only.includes(name)) return;
  const page = await b.newPage({ viewport: { width: 1400, height: 1700 }, deviceScaleFactor: 2 });
  // thème de la pièce : back.js le lit dans localStorage (kk-theme), comme sur le site
  await page.addInitScript((n) => { let s = 7; Math.random = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; window.kkNight = n; localStorage.setItem('kk-theme', n ? 'nuit' : 'jour'); }, night);
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('#stage canvas'));
  await page.evaluate(setup);
  await page.evaluate(page$);                       // définit window.reel = { tick, apply, again }
  const grab = async () => {
    const url = await page.evaluate(() => document.querySelector('#stage canvas').toDataURL('image/png'));
    const img = sharp(Buffer.from(url.split(',')[1], 'base64'));
    const { width: cw, height: ch } = await img.metadata();
    const m = inner * cw, w = Math.round((cw - 2 * m) / z), h = Math.round(w * 9 / 16);
    const left = Math.round(Math.min(cw - m - w, Math.max(m, fx * cw - w / 2))), top = Math.round(Math.min(ch - h, Math.max(0, fy * ch - h / 2)));
    return img.extract({ left, top, width: w, height: h }).resize(W, H).removeAlpha().raw().toBuffer();
  };
  const L = secs * FPS, per = L / states.length, frames = [];
  await page.evaluate((s) => window.reel.apply(s), states[0]);
  const fade = cut ? 0 : FADE, loop = cut ? 0 : LOOP;
  for (let f = 0; f < L + loop; f++) {
    await page.evaluate(() => window.reel.tick());
    const i = Math.floor(f / per), k = f - i * per, from = states[i % states.length], to = states[(i + 1) % states.length];
    if (fade && k >= per - fade) {                          // fondu vers l'état suivant : la même image dans les deux états, mêlées
      const a = await grab();
      await page.evaluate((s) => { window.reel.apply(s); window.reel.again(); }, to);
      frames.push(mix(a, await grab(), (k - (per - fade) + 1) / (fade + 1)));
      await page.evaluate((s) => window.reel.apply(s), from);
    } else {
      if (k === 0 && f > 0) await page.evaluate((s) => window.reel.apply(s), from);
      frames.push(await grab());
    }
  }
  const out = frames.slice(0, L).map((fr, i) => (i < loop ? mix(frames[L + i], fr, (i + 1) / (loop + 1)) : fr));
  const file = `${OUT}${name}.mp4`;
  await new Promise((ok, ko) => {
    const p = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-framerate', String(FPS), '-i', '-',
      '-an', '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
    p.on('error', ko); p.on('close', (c) => (c ? ko(new Error(`ffmpeg : code ${c}`)) : ok()));
    for (const fr of out) p.stdin.write(fr);
    p.stdin.end();
  });
  await sharp(out[0], { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 80 }).toFile(`${OUT}${name}.webp`);
  console.log(file, `${out.length} images`);
  await page.close();
}

// Matrice : un tirage, le vortex au centre qui tourne ; les quatre palettes se succèdent (une toutes les 2 s) ; en mode nuit (fond
// noir, signes blancs) : en mode jour, son fond crème se confondait avec celui du site ; palettes en coupe franche, sans fondu
await reel('lab-matrice', '/lab/ascii/index.html?lang=fr', { secs: 8, z: 1.8, inner: 0.083, states: [0, 1, 3, 2], night: true, cut: true }, () => { noLoop(); roll(false); }, () => {
  window.mouseX = width / 2; window.mouseY = height / 2;
  window.reel = {
    tick: () => redraw(),
    apply: (p) => { pal = p; },
    again: () => { t--; redraw(); },                // même instant, autre palette
  };
});

// Lettres qui poussent : « kern » déjà poussé, sur fond noir ; les cellules vivent, le rendu passe de la trame aux lignes puis aux pixels
await reel('lab-lettres', '/lab/physarum/index.html?lang=fr', { secs: 9, z: 1, states: ['trame', 'lignes', 'pixels'] }, () => {
  noLoop(); dispatchEvent(new CustomEvent('kk:theme', { detail: { night: true } }));
  currentText = 'kern'; typedWord = true; updateMaskSource();
  for (let i = 0; i < 500; i++) redraw();
}, () => {
  window.reel = {
    tick: () => redraw(),
    apply: (r) => { RENDER = r; },
    again: () => renderToPixels(),                  // même instant, autre rendu
  };
});

await b.close();
