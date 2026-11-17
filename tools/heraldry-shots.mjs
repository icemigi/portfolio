// Visuels de l'étude Algorithmic Heraldry, tirés du vrai moteur (la pièce du Lab, public/lab/heraldry) : chaque clé est tapée
// dans le générateur, l'écu exporté en carré 1440 × 1440 (public/work/algorithmic-heraldry/key-<clé>.webp) ; les meubles sont
// rendus seuls, en carré, depuis leurs SVG (meuble-<nom>.webp).
// Lancer, site servi sur :4329 (npx astro preview --port 4329) : node tools/heraldry-shots.mjs   (Playwright + Chromium requis)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import sharp from 'sharp';

const OUT = new URL('../public/work/algorithmic-heraldry/', import.meta.url).pathname;
const MEUBLES = new URL('../public/lab/heraldry/assets/meubles/', import.meta.url).pathname;
// HERALDIQUE / HERALDIQUF : un seul caractère d'écart, deux écus sans rapport ; puis quatre clés tirées au hasard pur pour le livre
// (algorithmic-heraldry-manuscrit/edition/out/planche-essai-cles.txt)
const KEYS = ['heraldique', 'heraldiquf', 'azspw6usj4', '56fkro9q54', 'nya8gqwh6p', '4waohuuag1'];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:4329/lab/heraldry/index.html?lang=fr', { waitUntil: 'load' });
await p.waitForTimeout(1500);
for (const key of KEYS) {
  await p.fill('#seed-input', key);
  await p.press('#seed-input', 'Enter');
  await p.waitForFunction((k) => document.querySelector('#seed-display, .seed')?.textContent?.toLowerCase().includes(k), key);
  await p.waitForTimeout(400);
  const png = await p.locator('#container svg').screenshot();
  await sharp(png).flatten({ background: '#ffffff' }).webp({ quality: 88 }).toFile(`${OUT}key-${key}.webp`);
  console.log(`key-${key}.webp`);
}
await b.close();

// meubles : le dessin noir centré sur fond blanc, 18 % de marge
for (const name of ['dragon', 'leopard', 'castle', 'key']) {
  const art = await sharp(`${MEUBLES}${name}.svg`, { density: 300 }).resize(1000, 1000, { fit: 'inside' }).png().toBuffer();
  const { width, height } = await sharp(art).metadata();
  await sharp({ create: { width: 1440, height: 1440, channels: 3, background: '#ffffff' } })
    .composite([{ input: await sharp(art).resize(Math.round(width * 1.06), Math.round(height * 1.06)).toBuffer(), gravity: 'center' }])
    .webp({ quality: 88 }).toFile(`${OUT}meuble-${name}.webp`);
  console.log(`meuble-${name}.webp`);
}
