// Versions AVIF des images du site (17/11) : node tools/avif.mjs [--dry] [dossier…]
// Pour chaque image de public/ (webp, jpg, png), écrit un .avif à côté, depuis l'original quand il existe (SRC), sinon depuis
// l'image publiée. L'AVIF n'est gardé que s'il pèse nettement moins (GAIN) ; la liste des images qui en ont un est écrite dans
// src/data/avif.json, que av() (src/data/avif.ts) lit pour servir le bon fichier. Relancer après tout ajout d'image :
// une image déjà convertie (AVIF plus récent que sa source) n'est pas refaite.
// Hors champ : les images Open Graph (les réseaux veulent du PNG / JPG), les icônes et curseurs, les cartes de données du
// portrait 3D (portrait3d/geo, nrm : WebP sans perte, la compression déformerait le relief), les marques des fanions (stack/), et les images animées (l'AVIF de sharp n'en garderait que la
// première image).
import { readdir, stat, unlink, writeFile, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../public/', import.meta.url).pathname;
const OUT = new URL('../src/data/avif.json', import.meta.url).pathname;
const SKIP = /^(og|stack|fanions|vendor|fonts)\/|^portrait3d\/(geo|nrm)|^(cur2-|icon-|apple-touch|coin-cursor|favicon)/;
const Q = 62;      // qualité AVIF (le texte des captures reste net)
const GAIN = 0.85; // gardé seulement s'il pèse au plus 85 % de l'image publiée
// originaux en meilleure définition que l'image publiée (chemin publié → fichier source)
const EXP = '/Users/kerningkastle/Desktop/brouillon ker.outdoor/exports/';
const SRC = {
  'work/kern-outdoor/fil-apres-784.webp': EXP + 'Frame 904.png', 'work/kern-outdoor/fil-apres-1176.webp': EXP + 'Frame 904.png',
  'work/kern-outdoor/fil-entete-784.webp': EXP + 'Group 19.png', 'work/kern-outdoor/fil-entete-1176.webp': EXP + 'Group 19.png',
};

const dry = process.argv.includes('--dry');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const walk = async (d) => (await Promise.all((await readdir(d, { withFileTypes: true })).map((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]))).flat();
const exists = (p) => stat(p).then((s) => s, () => null);

const files = (await walk(ROOT)).map((f) => relative(ROOT, f))
  .filter((f) => /\.(webp|jpe?g|png)$/i.test(f) && !SKIP.test(f) && (!only.length || only.some((o) => f.startsWith(o))));
const keep = new Set(only.length ? JSON.parse(await readFile(OUT, 'utf8').catch(() => '[]')).filter((f) => !only.some((o) => f.slice(1).startsWith(o))) : []);
let before = 0, after = 0, n = 0;
for (const f of files) {
  const pub = join(ROOT, f), out = pub.replace(/\.\w+$/, '.avif'), src = SRC[f] ?? pub;
  const [ps, os] = [await stat(pub), await exists(out)];
  if (((await sharp(pub).metadata()).pages ?? 1) > 1) { if (os && !dry) await unlink(out); before += ps.size; after += ps.size; continue; } // animée
  let size = os && os.mtimeMs > (await stat(src)).mtimeMs && os.mtimeMs > ps.mtimeMs ? os.size : 0;
  if (!size) {
    const { width } = await sharp(pub).metadata(); // même largeur que l'image publiée
    const buf = await sharp(src).resize({ width, kernel: 'lanczos3', withoutEnlargement: true }).avif({ quality: Q, effort: 6, chromaSubsampling: '4:4:4' }).toBuffer();
    size = buf.length;
    if (!dry && size <= ps.size * GAIN) await writeFile(out, buf);
  }
  before += ps.size;
  if (size <= ps.size * GAIN) { keep.add('/' + f); after += size; n++; }
  else { after += ps.size; if (!dry && os) await unlink(out); }
}
console.log(`${files.length} images, ${n} en AVIF : ${(before / 1e6).toFixed(1)} Mo → ${(after / 1e6).toFixed(1)} Mo`);
if (!dry) await writeFile(OUT, JSON.stringify([...keep].sort(), null, 0).replace(/","/g, '",\n"') + '\n');
