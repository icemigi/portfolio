// Lab : une salle plein écran par pièce, chacune à sa propre adresse (/xx/lab/<id>/).
// kind 'type'  : le canvas de type modulaire
// kind 'font'  : fonte libre — texte modifiable au clavier + Télécharger
// kind 'slot'  : pièce à intégrer (emplacement)
export type Room = {
  id: string;
  year: string;
  kind: 'type' | 'font' | 'slot' | 'embed';
  src?: string; // embed : page autonome (dans /public/lab/)
  file?: string; // fonte : fichier à télécharger
  en: { title: string; cat: string; note: string };
  fr: { title: string; cat: string; note: string };
};

export const rooms: Room[] = [
  {
    id: 'vexillology', year: '2026', kind: 'slot',
    fr: { title: 'Systemic Vexillology', cat: 'Générateur', note: 'Des générateurs de drapeaux. [Pièce à intégrer]' },
    en: { title: 'Systemic Vexillology', cat: 'Generator', note: 'Flag generators. [Piece to integrate]' },
  },
  {
    id: 'ascii', year: '2025', kind: 'slot',
    fr: { title: '[Nuage ASCII — nom à venir]', cat: 'Expérience', note: 'Un nuage de caractères qui se recompose au passage de la souris. [Pièce à intégrer]' },
    en: { title: '[ASCII cloud — name to come]', cat: 'Experiment', note: 'A cloud of characters that rearranges as the cursor passes. [Piece to integrate]' },
  },
  {
    id: 'modular-type', year: '2026', kind: 'type',
    fr: { title: 'Type modulaire', cat: 'Expérience type', note: 'Des lettres construites en modules qui changent de forme sous le curseur. Canvas 2D.' },
    en: { title: 'Modular type', cat: 'Type experiment', note: 'Letters built from modules that change shape under the cursor. Canvas 2D.' },
  },
  {
    id: 'gravity', year: '2026', kind: 'embed', src: '/lab/gravity/index.html',
    fr: { title: 'Lettres qui tombent', cat: 'Affiche générative', note: 'Une affiche qui se compose toute seule : chaque clic lâche une lettre, qui tombe et s\'empile dans la grille. Les lettres ont un vrai corps physique, taillé sur leur dessin. p5.js, Matter.js.' },
    en: { title: 'Falling letters', cat: 'Generative poster', note: 'A poster that composes itself: every click drops a letter, which falls and piles up in the grid. Each letter has a real physical body, cut to its shape. p5.js, Matter.js.' },
  },
  {
    id: 'free-font', year: '[Année]', kind: 'font',
    fr: { title: '[Fonte libre]', cat: 'Fonte', note: 'Fonte libre, OTF et WOFF. [Fichier et nom à venir]' },
    en: { title: '[Free typeface]', cat: 'Typeface', note: 'Free typeface, OTF and WOFF. [File and name to come]' },
  },
];
