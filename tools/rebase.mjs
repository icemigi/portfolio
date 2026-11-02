// Après `astro build` : fait vivre le site dans un sous-dossier (ex. GitHub Pages de projet → /portfolio/).
// Le code source garde des chemins à la racine ("/fr/…", "/archive/…") ; ce script les préfixe dans dist/
// (HTML, CSS, JS, XML, TXT), ainsi que les adresses absolues du site (canonical, partage, plan du site).
// Usage : node tools/rebase.mjs /portfolio
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const base = (process.argv[2] || '').replace(/\/$/, '');
if (!base || !base.startsWith('/')) { console.error('usage : node tools/rebase.mjs /sous-dossier'); process.exit(1); }
const site = 'https://icemigi.github.io';
const DIRS = ['fr', 'en', '_astro', 'archive', 'work', 'vig', 'stack', 'logos', 'likes', 'lab', 'fonts', 'og', 'vendor', 'logo-kerningkastle', 'favicon', 'sitemap', 'robots', 'apple-touch-icon', 'icon', 'site', 'cursor', 'cur'];
const top = `(?:${DIRS.join('|')})(?=[/.\\-"'\`)?#\\s]|$)`;
// "/fr/…"  '/archive/…'  `/lab/…`  `/${lang}/…`  url(/fonts/…)  (/og/…)  srcset=" /…"
const rx = new RegExp(`([\"'\`(=,\\s])/(${top}|\\$\\{)`, 'g');
const EXT = new Set(['.html', '.css', '.js', '.mjs', '.xml', '.txt', '.json', '.webmanifest']);
let files = 0;
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) return walk(p);
  if (!EXT.has(extname(p))) return;
  const s = readFileSync(p, 'utf8');
  let t = s.split(`${site}/`).join(`${site}${base}/`);
  t = t.replace(rx, (_, pre, what) => `${pre}${base}/${what}`);
  // racine nue : href="/" et la redirection de langue
  t = t.replace(/(href=["'])\/(["'])/g, `$1${base}/$2`);
  t = t.replace(/("scope":\s*")\/(")/g, `$1${base}/$2`); // manifeste de l'écran d'accueil
  if (t !== s) { writeFileSync(p, t); files++; }
});
walk('dist');
console.log(`rebase ${base} : ${files} fichiers ajustés`);
