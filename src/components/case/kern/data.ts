// kern.outdoor : données communes aux versions de l'étude de cas (tracés du showreel, charte, carrousels, cases de la check-list).
// logos vectoriels (exports Figma, dossier motion) : chaque tracé reçoit un nom pour être animé séparément
import montagne from './montagne.svg?raw';
import bonhomme from './bonhomme.svg?raw';
import titrage from './titrage.svg?raw';
import lettrage from './lettrage.svg?raw';

// Showreel : les quatre logos posés sur une même scène de 1000 × 1000. Les tracés sont recalculés ici (commandes absolues
// M L C H V Z des exports Figma) pour que le morphing passe d'un logo à l'autre au bon endroit.
const dsOf = (svg: string) => [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
const fit = (svg: string, tw: number, cy = 500) => {
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!.map(Number);
  const k = tw / w, ox = 500 - (w * k) / 2, oy = cy - (h * k) / 2;
  return dsOf(svg).map((d) => { let cmd = '', n = 0; return d.replace(/([MLCHVZ])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/g, (t, c) => { if (c) { cmd = c; n = 0; return c; } const y = cmd === 'V' || (cmd !== 'H' && n % 2 === 1); n++; return `${(+t * k + (y ? oy : ox)).toFixed(1)} `; }); });
};
const [mM, mR] = fit(montagne, 560);
const [bR, bC, bBody, bHead] = fit(bonhomme, 600);
const [tE, tR, tN, tK, tReg1, tReg2, tBody, tHead] = fit(titrage, 560);
const [wW, wR] = fit(lettrage, 760);
const D = {
  mont: { head: mM, reg1: mR, reg2: mR },
  run: { head: bHead, body: bBody, reg1: bR, reg2: bC },
  cairn: { head: tHead, body: tBody, k: tK, e: tE, r: tR, n: tN, reg1: tReg1, reg2: tReg2 },
  word: { w: wW, reg1: wR, reg2: wR },
};

export const kernD = D;
export type KernD = typeof D;

export function kernData(fr: boolean) {
  // charte (fichiers de la charte graphique)
  const PAL = [['#1C1C1C', fr ? 'noir' : 'black'], ['#353C15', 'olive'], ['#FFF3CC', fr ? 'crème' : 'cream'], ['#DEDE1F', fr ? 'citron' : 'lime']];
  // carrousels : dossiers post 1, 2, 3 (public/work/kern-outdoor/car/p<n>-<i>.webp, 720 × 960)
  const CAR = [
    { n: 9, t: fr ? 'prépare ton premier bivouac' : 'your first bivouac' },
    { n: 9, t: fr ? 'le guide ultime du bivouac' : 'the ultimate bivouac guide' },
    { n: 8, t: fr ? 'tu pars pas en rando sans ton tel' : 'never hike without your phone' },
  ];
  // cases de la check-list (repérées dans l'image : x, y en % de la largeur et de la hauteur, côté en % de la largeur),
  // dans l'ordre de lecture : colonne du milieu, colonne de droite, puis la popote à gauche
  const BOX: [number, number, number][] = [[34.55,10.73,2.27],[69.36,10.73,2.18],[34.55,13.42,2.27],[69.27,13.42,2.27],[34.55,16.12,2.27],[69.36,16.12,2.18],[34.55,18.82,2.27],[69.36,18.82,2.18],[34.55,21.52,2.27],[69.36,21.52,2.18],[34.55,24.21,2.27],[69.36,24.21,2.18],[34.55,26.97,2.27],[34.55,29.67,2.27],[34.55,32.37,2.27],[34.55,35.07,2.27],[69.36,35.97,2.18],[69.36,38.66,2.18],[69.36,41.36,2.18],[69.36,44.06,2.18],[34.55,46.76,2.18],[69.36,46.76,2.18],[34.55,49.45,2.27],[69.36,49.45,2.18],[34.55,52.15,2.18],[69.36,52.15,2.18],[34.55,54.85,2.27],[34.55,57.55,2.27],[34.55,60.24,2.27],[34.55,62.94,2.27],[5.64,63.84,2.18],[69.36,63.84,2.18],[34.55,65.64,2.27],[5.64,66.54,2.18],[69.36,66.54,2.18],[34.55,68.34,2.27],[5.64,69.24,2.18],[69.36,69.24,2.18],[34.55,71.03,2.27],[5.64,71.93,2.18],[69.36,71.93,2.18],[34.55,73.73,2.27],[5.64,74.63,2.18],[69.36,74.63,2.18],[69.36,77.33,2.18],[5.64,77.39,2.18],[34.55,78.03,2.27],[5.64,80.03,2.18],[69.36,80.03,2.18],[34.55,80.73,2.27],[5.64,82.79,2.18],[69.36,82.79,2.18],[34.55,83.43,2.27],[5.64,85.48,2.18],[69.36,85.48,2.18],[34.55,86.13,2.27],[5.64,88.18,2.18],[69.36,88.18,2.18]];
  const colOrder = (x: number) => (x > 30 && x < 50 ? 0 : x > 50 ? 1 : 2);
  const ticks = [...BOX].sort((a, b) => colOrder(a[0]) - colOrder(b[0]) || a[1] - b[1]);
  const LH = 1557 / 1100 * 100; // hauteur de l'image en unités de largeur (viewBox 0 0 100 LH)
  const tick = ([x, y, w]: [number, number, number]) => { const Y = (y / 100) * LH; return `M${(x + w * 0.18).toFixed(2)} ${(Y + w * 0.52).toFixed(2)}L${(x + w * 0.42).toFixed(2)} ${(Y + w * 0.8).toFixed(2)}L${(x + w * 0.9).toFixed(2)} ${(Y + w * 0.12).toFixed(2)}`; };
  return { D, PAL, CAR, ticks, tick, LH };
}
