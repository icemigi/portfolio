// Accueil et À propos — textes de travail (rédaction définitive plus tard, même longueur).
// Dans les phrases d'affiche, {n} = vignette n° n (image WebP dans /public/, ou emplacement gris).

export type Vig = { src: string; label: { en: string; fr: string }; logo?: boolean }; // logo : image contenue (logo de logiciel), pas recadrée

// Accueil, écran 2 : la phrase des services, sans vignette.
export const homeServices = {
  fr: 'Je dessine des lettres{m:beaucoup}, des\u00a0identités\u00a0et\u00a0des\u00a0visuels, et\u00a0je\u00a0code\u00a0le\u00a0reste{m:ce site, par exemple}, pour\u00a0des\u00a0artistes, des\u00a0marques et\u00a0des\u00a0studios{m:et pour moi, le dimanche}.',
  en: 'I draw letters{m:a lot}, identities\u00a0and\u00a0visuals, and\u00a0I\u00a0code\u00a0the\u00a0rest{m:this site, for example}, for\u00a0artists, brands and\u00a0studios{m:and myself, on Sundays}.',
};
// Anneau d'images autour du texte des services (accueil) : fichiers de /public/ring/ (16/9, écrits par tools/ring.mjs
// depuis assets/roue ; .mp4 : boucles du Lab écrites par tools/lab-reel.mjs). null = emplacement à remplir (gris, numéroté).
// Autant d'emplacements que d'entrées.
export const homeRing: (string | null)[] = ['anim-simple.webp', null, 'bms.webp', 'lab-matrice.mp4', null, 'music.webp', null, 'sa.mp4', null, 'lab-lettres.mp4', 'bms2.webp', null];

// À propos — 4 écrans
export const aboutIntro = {
  fr: "Designer et directeur\u00a0artistique à\u00a0Paris{m:et à distance}. Je\u00a0passe\u00a0mes\u00a0journées devant\u00a0un\u00a0écran{m:et quelques nuits}, mais\u00a0les\u00a0bonnes\u00a0idées viennent\u00a0d'ailleurs, des choses {door} que j'aime{m:vas-y, ouvre}.",
  en: "Designer and art\u00a0director in\u00a0Paris{m:and remote}, I\u00a0spend\u00a0my\u00a0days in\u00a0front\u00a0of\u00a0a\u00a0screen{m:coffee helps}, and\u00a0the\u00a0good\u00a0ideas come\u00a0from\u00a0elsewhere: the things {door} I love{m:go on, open it}.",
};

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

// Stack : dix fanions, chacun sa forme et son motif (/public/fanions/<id>.svg, dessins d'après les maquettes de
// /assets/fanions), logo détouré dans le bas (/public/stack/mk-<id>.svg ; Procreate et TouchDesigner en PNG 512 px).
// Chaque fanion a sa longueur (tools/fanions.py écrit les dessins). Au survol : nom du logiciel, et dessous, ce à quoi il me sert.
// Ordre : suite de couleurs (vert, noirs, bleus et blanc, rouges) ; deux voisins n'ont jamais la même forme ni le même motif.
export const stack = {
  fr: "Les armes que je dégaine le plus{m:et celles que j'aiguise encore}, de quoi tenir un siège{m:ou une deadline}.",
  en: "The weapons I draw the most{m:and the ones I'm still sharpening}, enough to hold a siege{m:or a deadline}.",
};
export const stackBanners = [
  { id: 'glyphs', name: 'Glyphs', mark: 'mk-glyphs.svg', note: { fr: 'je dessine mes caractères, du croquis au fichier de fonte', en: 'I draw my typefaces, from sketch to font file' } },
  { id: 'touchdesigner', name: 'TouchDesigner', mark: 'mk-touchdesigner.png', note: { fr: 'des visuels génératifs joués en direct, pour la scène et les installations', en: 'generative visuals played live, for stage and installations' } },
  { id: 'figma', name: 'Figma', mark: 'mk-figma.svg', note: { fr: "maquettes d'interfaces et systèmes de design, avant le code", en: 'interface mockups and design systems, before the code' } },
  { id: 'photoshop', name: 'Photoshop', mark: 'mk-photoshop.svg', note: { fr: 'retouche, montages et textures pour mes images', en: 'retouching, compositing and textures for my images' } },
  { id: 'python', name: 'Python', mark: 'mk-python.svg', note: { fr: 'des scripts qui font le travail répétitif à ma place', en: 'scripts that do the repetitive work for me' } },
  { id: 'typescript', name: 'TypeScript', mark: 'mk-typescript.svg', note: { fr: 'des sites et des outils web, comme celui-ci', en: 'websites and web tools, like this one' } },
  { id: 'procreate', name: 'Procreate', mark: 'mk-procreate.png', note: { fr: 'croquis et lettrages à main levée, sur tablette', en: 'freehand sketches and lettering, on a tablet' } },
  { id: 'illustrator', name: 'Illustrator', mark: 'mk-illustrator.svg', note: { fr: 'le dessin vectoriel : logos, pictogrammes, mises en page', en: 'vector drawing: logos, pictograms, layouts' } },
  { id: 'p5js', name: 'p5.js', mark: 'mk-p5js.svg', note: { fr: 'design génératif et petites expériences visuelles en code', en: 'generative design and small visual experiments in code' } },
  { id: 'blender', name: 'Blender', mark: 'mk-blender.svg', note: { fr: 'modélisation et rendu 3D, pour les objets et les scènes', en: '3D modelling and rendering, for objects and scenes' } },
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
  fr: { about: 'À propos', services: 'Services', stack: 'Stack', path: 'Parcours', contact: 'Contact', hover: '(survole un fanion)' },
  en: { about: 'About', services: 'Services', stack: 'Stack', path: 'Background', contact: 'Contact', hover: '(hover a banner)' },
};

// Coordonnées — À COMPLÉTER (adresse et CV provisoires)
export const contact = {
  email: 'hello@kerningkastle.com',
  instagram: 'https://www.instagram.com/kerningkastle/',
  behance: 'https://www.behance.net/icemigi',
};
