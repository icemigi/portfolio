// Images de partage (public/og/*.png, 1200 × 630), dans la typo du site.
// Usage : node tools/og.mjs   (Playwright + Chromium requis)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const font = (f) => `data:font/woff2;base64,${readFileSync(`${root}/public/fonts/${f}`).toString('base64')}`;
const logo = `data:image/svg+xml;base64,${readFileSync(`${root}/public/logo-kerningkastle-dark.svg`).toString('base64')}`;
const src = readFileSync(`${root}/src/data/projects.ts`, 'utf8');
// slugs et titres, dans l'ordre du site
const projects = [...src.matchAll(/slug: '([^']+)'[\s\S]*?fr: \{\s*title: '((?:[^'\\]|\\.)*)'[\s\S]*?en: \{\s*title: '((?:[^'\\]|\\.)*)'/g)]
  .map((m) => ({ slug: m[1], fr: m[2].replace(/\\'/g, "'"), en: m[3].replace(/\\'/g, "'") }));
const tag = 'type designer + digital creative — paris & remote';
const pages = [];
for (const l of ['fr', 'en']) {
  const fr = l === 'fr';
  pages.push({ f: `${l}-home`, t: 'kerningkastle' });
  pages.push({ f: `${l}-work`, t: fr ? 'Projets' : 'Work' });
  pages.push({ f: `${l}-about`, t: fr ? 'À propos' : 'About' });
  pages.push({ f: `${l}-archive`, t: 'Archive' });
  pages.push({ f: `${l}-lab`, t: 'Lab' });
  projects.forEach((p, i) => pages.push({ f: `${l}-work-${p.slug}`, t: p[l], n: `${String(i + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}` }));
}
const html = (p) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:G;src:url(${font('Geist-Medium.woff2')});font-weight:500}
@font-face{font-family:M;src:url(${font('GeistMono-Regular.woff2')})}
*{margin:0}html,body{width:1200px;height:630px;background:#f3f3f3;color:#111}
body{position:relative;font-family:G}
img{position:absolute;left:56px;top:48px;width:52px;height:52px}
.n{position:absolute;right:56px;top:62px;font:22px M;color:#777}
h1{position:absolute;left:52px;bottom:104px;font-weight:500;font-size:${p.t.length > 16 ? 96 : 128}px;letter-spacing:-.045em;line-height:.9;white-space:nowrap}
.t{position:absolute;left:56px;bottom:52px;font:22px M}
</style><img src="${logo}"><div class="n">${p.n || ''}</div><h1>${p.t}</h1><div class="t">${tag}</div>`;
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of pages) {
  await pg.setContent(html(p)); await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `${root}/public/og/${p.f}.png` });
}
await b.close();
console.log(`${pages.length} images, ${projects.length} projets`);
