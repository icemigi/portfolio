// Spécimens des typos des études (17/11) : node tools/specimen.mjs
// Pour chaque spécimen de SPECIMENS, met en page le nom de la typo (une ligne par mot, dans la typo elle-même) et l'alphabet,
// depuis les fichiers de police (fontkit : approche et crénage), et écrit src/data/specimens.json, lu par Palette.astro :
//   faces : par style de police, le tracé de chaque signe utile (lettres des noms, alphabet, et le jeu de signes du mélange
//           au survol, POOL), en unités de la police, ligne de base à 0, avec sa chasse ; cap, xh : hauteurs des capitales et
//           des minuscules (Palette.astro règle la taille du titre sur l'une, de l'alphabet sur l'autre) ;
//   specimens : le nom (titre) et l'alphabet (abc), chacun avec son style (face), ses lettres posées { c, x, y } et sa boîte
//           ajustée aux tracés (w, top, h).
// Le titre et l'alphabet peuvent être de deux styles d'une même famille (ex. Helvetica Neue : titre en Bold, alphabet en Roman).
// Tracés en SVG (currentColor) plutôt qu'une police à charger : nets à toute taille, clairs la nuit, et aucune police n'est
// distribuée (licences de bureau : Helvetica Neue, Coolvetica). Les fichiers restent hors dépôt (../assets/fonts, ou le système).
import { openSync } from 'fontkit';
import { writeFileSync } from 'node:fs';

const FONTS_DIR = new URL('../../assets/fonts/', import.meta.url).pathname;
const OUT = new URL('../src/data/specimens.json', import.meta.url).pathname;
const ABC = 'abcdefghijklmnopqrstuvwxyz';
const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&?!@#%*+=/<>$'; // signes du mélange (comme le titre de l'accueil)
const HN = '/System/Library/Fonts/HelveticaNeue.ttc';
// styles de police : fichier, et style dans une collection .ttc (ps)
const FACES = {
  'instrument-serif': { file: FONTS_DIR + 'InstrumentSerif-Regular.ttf' },
  'helvetica-neue': { file: HN, ps: 'HelveticaNeue' },
  'helvetica-neue-bold': { file: HN, ps: 'HelveticaNeue-Bold' },
  'coolvetica-crammed': { file: FONTS_DIR + 'Coolvetica Rg Cram.otf' },
};
// spécimens (clés de src/data/palettes.ts) : nom affiché, lignes du titre, style du titre et de l'alphabet
const SPECIMENS = {
  'instrument-serif': { name: 'Instrument Serif', lines: ['Instrument', 'Serif'], title: 'instrument-serif', abc: 'instrument-serif' },
  'helvetica-neue': { name: 'Helvetica Neue', lines: ['Helvetica', 'Neue'], title: 'helvetica-neue', abc: 'helvetica-neue' },
  'coolvetica-crammed': { name: 'Coolvetica Crammed', lines: ['Coolvetica', 'Crammed'], title: 'coolvetica-crammed', abc: 'coolvetica-crammed' },
  'helvetica-neue-bold-roman': { name: 'Helvetica Neue Bold et Roman', lines: ['Helvetica', 'Neue'], title: 'helvetica-neue-bold', abc: 'helvetica-neue' },
};

const r1 = (s) => s.replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1));
const fonts = Object.fromEntries(Object.entries(FACES).map(([k, f]) => { const file = openSync(f.file); return [k, f.ps ? file.getFont(f.ps) : file]; }));
// lignes de texte posées : chaque lettre { c : signe, x, y } (y = ligne de base) ; interligne lh, en hauteurs de capitale (toutes
// les typos ont ainsi le même rythme, quel que soit leur corps) ; boîte ajustée aux tracés : top (au-dessus de la première
// ligne de base) et h (hauteur totale)
function set(face, lines, lh) {
  const font = fonts[face], step = font.capHeight * lh, letters = [];
  let w = 0, top = 0, bottom = 0;
  lines.forEach((text, i) => {
    const run = font.layout(text, { liga: false, clig: false, dlig: false, calt: false }), base = i * step; // une lettre = un signe (pas de ligature : chaque lettre se mélange seule)
    let x = 0;
    run.glyphs.forEach((g, k) => {
      const p = run.positions[k], ch = String.fromCodePoint(...g.codePoints);
      if (ch.trim()) letters.push({ c: ch, x: Math.round(x + p.xOffset), y: Math.round(base - p.yOffset) });
      if (i === 0) top = Math.max(top, g.bbox.maxY + p.yOffset);
      if (i === lines.length - 1) bottom = Math.max(bottom, -g.bbox.minY - p.yOffset);
      x += p.xAdvance;
    });
    w = Math.max(w, x);
  });
  return { face, letters, w: Math.ceil(w), top: Math.ceil(top), h: Math.ceil(top + (lines.length - 1) * step + bottom) };
}

const specimens = {}, used = {};
for (const [key, s] of Object.entries(SPECIMENS)) {
  specimens[key] = { name: s.name, title: set(s.title, s.lines, 1.3), abc: set(s.abc, [ABC], 1) };
  (used[s.title] ??= new Set()).add(s.lines.join('')); (used[s.abc] ??= new Set()).add(ABC);
}
const faces = {};
for (const [face, texts] of Object.entries(used)) {
  const font = fonts[face], glyphs = {};
  for (const ch of new Set([...[...texts].join(''), ...POOL])) {
    const g = font.glyphForCodePoint(ch.codePointAt(0));
    if (g.id) glyphs[ch] = { d: r1(g.path.scale(1, -1).toSVG()), a: Math.round(g.advanceWidth) }; // tracé, chasse
  }
  faces[face] = { cap: Math.round(font.capHeight), xh: Math.round(font.xHeight), glyphs };
  console.log(face, `${(JSON.stringify(faces[face]).length / 1e3).toFixed(1)} Ko`);
}
writeFileSync(OUT, JSON.stringify({ faces, specimens }) + '\n');
