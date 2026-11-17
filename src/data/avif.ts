// Images servies en AVIF (17/11) : tools/avif.mjs écrit un .avif à côté de chaque image quand il pèse nettement moins, et la
// liste de ces images dans avif.json. av() donne le fichier à servir pour un chemin publié ; avSet() fait de même pour un srcset.
// Pas de repli WebP : <picture> casserait le chargement ASCII (ascii.ts change le src de l'<img>) et tous les navigateurs
// actuels lisent l'AVIF (Safari 16+, Firefox 93+, Chrome 85+).
import list from './avif.json';

const has = new Set<string>(list);
export const av = (src: string) => (has.has(src) ? src.replace(/\.\w+$/, '.avif') : src);
export const avSet = (srcset?: string) => srcset?.split(/,\s*/).map((s) => { const [u, d] = s.split(/\s+/); return `${av(u)} ${d}`; }).join(', ');
