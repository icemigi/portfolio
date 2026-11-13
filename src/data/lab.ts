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

const all: Room[] = [
  {
    id: 'vexillology', year: '2026', kind: 'embed', src: '/lab/vexillology/index.html',
    fr: { title: 'Systemic Vexillology', cat: 'Générateur', note: 'Des planches de drapeaux tirés de seize systèmes graphiques, jamais deux fois le même sur une ligne ou une colonne. Un clic relance un drapeau, ou toute la planche. p5.js.' },
    en: { title: 'Systemic Vexillology', cat: 'Generator', note: 'Boards of flags drawn from sixteen graphic systems, never the same twice in a row or column. One click re-rolls a flag, or the whole board. p5.js.' },
  },
  {
    id: 'ascii', year: '2026', kind: 'embed', src: '/lab/ascii/index.html',
    fr: { title: 'Matrice systémique', cat: 'Expérience', note: 'Une trame de caractères mono qui tourne en vortex autour du curseur ; certains caractères s\'allument en aplats de couleur. p5.js.' },
    en: { title: 'Systemic Matrix', cat: 'Experiment', note: 'A grid of mono characters spinning in a vortex around the cursor; some characters light up as flat colour blocks. p5.js.' },
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
    id: 'physarum', year: '2026', kind: 'embed', src: '/lab/physarum/index.html',
    fr: { title: 'Lettres qui poussent', cat: 'Automate cellulaire', note: 'Des lettres qui se forment comme une culture : un automate cellulaire pousse dans le contour du glyphe, puis glisse vers la lettre suivante. On peut y déposer sa propre image. p5.js.' },
    en: { title: 'Growing letters', cat: 'Cellular automaton', note: 'Letters that grow like a culture: a cellular automaton spreads inside the glyph outline, then morphs into the next letter. You can drop in your own image. p5.js.' },
  },
  {
    id: 'free-font', year: '2026', kind: 'font', file: '/fonts/himare/himare.zip',
    fr: { title: 'HIMARE', cat: 'Fonte', note: 'Une capitale de titrage horizontale, dessinée sur une grille de modules arrondis, en deux styles : plein et contour. OTF et WOFF2, à télécharger.' },
    en: { title: 'HIMARE', cat: 'Typeface', note: 'A horizontal display typeface drawn on a grid of rounded modules, in two styles: solid and outline. OTF and WOFF2, to download.' },
  },
];
// pièces vides (kind 'slot') masquées tant qu'elles ne sont pas intégrées (décision du 03/11)
export const rooms: Room[] = all.filter((r) => r.kind !== 'slot' && !(r.kind === 'font' && !r.file));

// Apps autonomes (pages complètes dans /public/lab/) : ouvertes dans une fenêtre du bureau,
// sans salle /xx/lab/<id>/. Seule source de vérité pour le bureau, la grille mobile et le compteur du menu.
export type LabApp = {
  id: string;
  year: string;
  src: string;
  w: number; // taille de la fenêtre sur le bureau
  h: number;
  en: { title: string; cat: string };
  fr: { title: string; cat: string };
};

export const labApps: LabApp[] = [
  {
    id: 'heraldry', year: '2025', src: '/lab/heraldry/index.html', w: 980, h: 640,
    fr: { title: 'Algorithmic Heraldry', cat: 'Générateur' },
    en: { title: 'Algorithmic Heraldry', cat: 'Generator' },
  },
  {
    id: 'quiz', year: '2026', src: '/lab/quiz/index.html', w: 1040, h: 700,
    fr: { title: 'Quiz-O-Matic', cat: 'Jeu' },
    en: { title: 'Quiz-O-Matic', cat: 'Game' },
  },
  {
    id: 'letteroastd', year: '2026', src: '/lab/letteroastd/index.html', w: 1000, h: 700,
    fr: { title: 'Letteroastd', cat: 'Test de cinéphilie' },
    en: { title: 'Letteroastd', cat: 'Film-buff test' },
  },
];

// nombre de pièces visibles dans le Lab (salles + apps)
export const labCount = rooms.length + labApps.length;
