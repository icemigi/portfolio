// Palettes et typos des études (écran « palette et typos », components/case/Palette.astro). colors : 4 couleurs (code, nom
// FR / EN), dans l'ordre de la grille 2 × 2 ; fonts : clés de src/data/specimens.json (tools/specimen.mjs), une par rangée.
export type Palette = { colors: [string, { fr: string; en: string }][]; fonts: string[] };

export const palettes: Record<string, Palette> = {
  'kern-outdoor': {
    colors: [
      ['#1C1C1C', { fr: 'noir', en: 'black' }], ['#353C15', { fr: 'olive', en: 'olive' }],
      ['#FFF3CC', { fr: 'crème', en: 'cream' }], ['#DEDE1F', { fr: 'citron', en: 'lime' }],
    ],
    fonts: ['instrument-serif', 'helvetica-neue'],
  },
  'sports-aventure': {
    colors: [
      ['#504D40', { fr: 'kaki', en: 'khaki' }], ['#3A382E', { fr: 'taupe', en: 'taupe' }],
      ['#1D1D1B', { fr: 'noir', en: 'black' }], ['#27251E', { fr: 'brun', en: 'brown' }],
    ],
    fonts: ['coolvetica-crammed', 'helvetica-neue-bold-roman'],
  },
};
