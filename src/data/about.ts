// Accueil et À propos — textes de travail (rédaction définitive plus tard, même longueur).
// Dans les phrases d'affiche, {n} = vignette n° n (image dans /public/vig/, ou emplacement gris).

export type Vig = { src: string; label: { en: string; fr: string }; logo?: boolean }; // logo : image contenue (logo de logiciel), pas recadrée

// Accueil, écran 2 : 3 vignettes (lettres, identités, images), animées, uniquement des travaux montrés en entier (jamais recadrés) ; régénérées par tools/vignettes.py.
export const homeServices = {
  fr: 'Je dessine {0} des lettres{m:beaucoup}, {1} des identités {2} et des images, à la main ou en code{m:selon l\'humeur}, pour des artistes, des marques et des studios{m:et pour moi, le dimanche}.',
  en: 'I draw {0} letters{m:a lot}, {1} identities {2} and images, by hand or in code{m:depending on the mood}, for artists, brands and studios{m:and myself, on Sundays}.',
};
export const homeVigs: Vig[] = [
  { src: '', label: { fr: 'lettre', en: 'letter' } },
  { src: '', label: { fr: 'identité', en: 'identity' } },
  { src: '', label: { fr: 'image', en: 'image' } },
];

// À propos — 4 écrans
export const aboutIntro = {
  fr: "Designer à Paris{m:et à distance}, je pars toujours de la lettre, {0} du logotype au système d'écriture complet {1}. Quand les mains ne suffisent plus{m:ou qu'elles ont la flemme}, j'écris du code {2}. Le reste vient des choses {door} que j'aime{m:ouvrez}.",
  en: "Designer in Paris{m:and remote}, I always start from the letter, {0} from a logotype to a complete writing system {1}. When hands aren't enough{m:or can't be bothered}, I write code {2}. The rest comes from the things {door} I love{m:go on, open it}.",
};
export const aboutVigs: Vig[] = [
  { src: '', label: { fr: 'logotype', en: 'logotype' } },
  { src: '', label: { fr: 'glyphes', en: 'glyphs' } },
  { src: '/vig/v-matrix.webp', label: { fr: 'code', en: 'code' } }, // pluie de caractères façon Matrix (générée, gardée)
];

export const services = {
  fr: [
    ['Identité', 'Logotype · charte · déclinaisons'],
    ['Typographie', 'Caractère sur mesure · lettrage · écriture'],
    ['Web', 'Direction artistique · UX/UI · front-end'],
    ['Code créatif', 'Générateurs · édition générative · temps réel'],
  ],
  en: [
    ['Identity', 'Logotype · guidelines · roll-outs'],
    ['Type', 'Custom typeface · lettering · writing systems'],
    ['Web', 'Art direction · UX/UI · front-end'],
    ['Creative code', 'Generators · generative publishing · real-time'],
  ],
};

// Stack technique, en texte d'affiche : chaque logiciel est suivi de sa vignette-logo.
// Téléphone : icônes dans le texte ; ordinateur : fanions sous le texte (les icônes y sont masquées).
// Logos : /public/stack/<nom>.webp (icônes d'app, 160 px) ; tant qu'un fichier manque, la vignette affiche le nom.
export const stack = {
  fr: "Je dessine mes lettres dans Glyphs {0}, je compose dans Illustrator {1}, Photoshop {2} et Figma {3}, je griffonne sur Procreate {4}, je code en TypeScript {5}, p5.js {6} et Python {7}, et je joue en direct avec TouchDesigner {8}.",
  en: "I draw my letters in Glyphs {0}, lay out in Illustrator {1}, Photoshop {2} and Figma {3}, sketch in Procreate {4}, code in TypeScript {5}, p5.js {6} and Python {7}, and play live with TouchDesigner {8}.",
};
const tool = (id: string, name: string): Vig => ({ src: `/stack/${id}.webp`, label: { fr: name, en: name }, logo: true });
// fanions sous le texte : drap à la couleur du logiciel, logo vectoriel détouré (/public/stack/mk-<id>.svg ; Procreate et TouchDesigner en PNG 512 px), encre du nom et des coutures
export const stackBanners = [
  { id: 'glyphs', name: 'Glyphs', bg: '#4fae4f', ink: '#ffffff', mark: 'mk-glyphs.svg' },
  { id: 'illustrator', name: 'Illustrator', bg: '#330000', ink: '#ff9a00', mark: 'mk-illustrator.svg' },
  { id: 'photoshop', name: 'Photoshop', bg: '#001e36', ink: '#31a8ff', mark: 'mk-photoshop.svg' },
  { id: 'figma', name: 'Figma', bg: '#1e1e1e', ink: '#f3f3f3', mark: 'mk-figma.svg' },
  { id: 'procreate', name: 'Procreate', bg: '#121212', ink: '#d9a9ff', mark: 'mk-procreate.png' },
  { id: 'typescript', name: 'TypeScript', bg: '#3178c6', ink: '#ffffff', mark: 'mk-typescript.svg' },
  { id: 'p5js', name: 'p5.js', bg: '#ed225d', ink: '#ffffff', mark: 'mk-p5js.svg' },
  { id: 'python', name: 'Python', bg: '#f7f7f5', ink: '#3776ab', mark: 'mk-python.svg' },
  { id: 'touchdesigner', name: 'TouchDesigner', bg: '#161616', ink: '#8fbf6a', mark: 'mk-touchdesigner.png' },
];
export const stackVigs: Vig[] = [
  tool('glyphs', 'Glyphs'), tool('illustrator', 'Illustrator'), tool('photoshop', 'Photoshop'), tool('figma', 'Figma'), tool('procreate', 'Procreate'),
  tool('typescript', 'TypeScript'), tool('p5js', 'p5.js'), tool('python', 'Python'), tool('touchdesigner', 'TouchDesigner'),
];

// Parcours : {m:…} = note datée accrochée au mot ; {v:n} = vignette.
export const path = {
  fr: "Indépendant depuis 2020{m:2020 —}, pour des artistes {v:0} et des marques. Avant, designer chez DOERS à Paris{m:2018 — 20} pour PlayStation {l:playstation}, Nespresso {l:nespresso} et Chanel {l:chanel}. Formé à HETIC{m:2018 — 21} et à l'École 42{m:2015 — 17}.",
  en: 'Independent since 2020{m:2020 —}, for artists {v:0} and brands. Before that, designer at DOERS in Paris{m:2018 — 20} for PlayStation {l:playstation}, Nespresso {l:nespresso} and Chanel {l:chanel}. Trained at HETIC{m:2018 — 21} and École 42{m:2015 — 17}.',
};
export const pathVigs: Vig[] = [
  { src: '', label: { fr: 'pochette', en: 'cover' } },
];

export const aboutLabels = {
  fr: { about: 'À propos', services: 'Services', stack: 'Stack', path: 'Parcours', contact: 'Contact — cliquer pour copier' },
  en: { about: 'About', services: 'Services', stack: 'Stack', path: 'Background', contact: 'Contact — click to copy' },
};

// Coordonnées — À COMPLÉTER (adresse et CV provisoires)
export const contact = {
  email: 'hello@kerningkastle.com',
  instagram: 'https://www.instagram.com/kerningkastle/',
  behance: 'https://www.behance.net/icemigi',
};
