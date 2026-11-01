// Accueil et À propos — textes de travail (rédaction définitive plus tard, même longueur).
// Dans les phrases d'affiche, {n} = vignette n° n (image dans /public/vig/, ou emplacement gris).

export type Vig = { src: string; label: { en: string; fr: string } };

// Accueil, écran 2 : 5 vignettes, chacune illustre le mot qui la précède.
export const homeServices = {
  fr: 'Je dessine {0} des lettres{m:beaucoup}, {1} des identités {2} et des images, {3} à la main ou en code{m:selon l\'humeur}, {4} pour des artistes, des marques et des studios{m:et pour moi, le dimanche}.',
  en: 'I draw {0} letters{m:a lot}, {1} identities {2} and images, {3} by hand or in code{m:depending on the mood}, {4} for artists, brands and studios{m:and myself, on Sundays}.',
};
export const homeVigs: Vig[] = [
  { src: '/vig/v4.jpg', label: { fr: 'lettre', en: 'letter' } },
  { src: '/vig/v1.jpg', label: { fr: 'identité', en: 'identity' } },
  { src: '/vig/v3.jpg', label: { fr: 'affiche', en: 'poster' } },
  { src: '/vig/v2.jpg', label: { fr: 'image', en: 'image' } },
  { src: '/vig/v0.jpg', label: { fr: 'visuel', en: 'visual' } },
];

// À propos — 4 écrans
export const aboutIntro = {
  fr: "Designer à Paris{m:et à distance}, je pars toujours de la lettre, {0} du logotype au système d'écriture complet {1}. Quand les mains ne suffisent plus{m:ou qu'elles ont la flemme}, j'écris du code {2}. Le reste vient des choses {door} que j'aime{m:ouvrez}.",
  en: "Designer in Paris{m:and remote}, I always start from the letter, {0} from a logotype to a complete writing system {1}. When hands aren't enough{m:or can't be bothered}, I write code {2}. The rest comes from the things {door} I love{m:go on, open it}.",
};
export const aboutVigs: Vig[] = [
  { src: '', label: { fr: 'logotype', en: 'logotype' } },
  { src: '', label: { fr: 'glyphes', en: 'glyphs' } },
  { src: '', label: { fr: 'code', en: 'code' } },
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

// Stack technique : les outils réellement utilisés (à corriger si besoin)
export const stack = {
  fr: [
    ['Dessin de caractères', 'Glyphs 4'],
    ['Design', 'Illustrator · Photoshop · Figma · Procreate'],
    ['Code', 'TypeScript · Astro · p5.js · Python · C/C++'],
    ['Temps réel', 'TouchDesigner'],
    ['Machines', 'Serveur maison · Docker · ZimaOS · Tailscale'],
  ],
  en: [
    ['Type design', 'Glyphs 4'],
    ['Design', 'Illustrator · Photoshop · Figma · Procreate'],
    ['Code', 'TypeScript · Astro · p5.js · Python · C/C++'],
    ['Real-time', 'TouchDesigner'],
    ['Machines', 'Home server · Docker · ZimaOS · Tailscale'],
  ],
};

// Parcours : {m:…} = note datée accrochée au mot ; {v:n} = vignette.
export const path = {
  fr: "Indépendant depuis 2020{m:2020 —}, pour des artistes {v:0} et des marques. Avant, designer chez DOERS à Paris{m:2018 — 20} pour PlayStation {l:playstation}, Nespresso {l:nespresso} et Chanel {l:chanel}. {v:1} Formé à HETIC{m:2018 — 21} et à l'École 42{m:2015 — 17}.",
  en: 'Independent since 2020{m:2020 —}, for artists {v:0} and brands. Before that, designer at DOERS in Paris{m:2018 — 20} for PlayStation {l:playstation}, Nespresso {l:nespresso} and Chanel {l:chanel}. {v:1} Trained at HETIC{m:2018 — 21} and École 42{m:2015 — 17}.',
};
export const pathVigs: Vig[] = [
  { src: '', label: { fr: 'pochette', en: 'cover' } },
  { src: '', label: { fr: 'site', en: 'website' } },
];

export const aboutLabels = {
  fr: { about: 'À propos', services: 'Services', stack: 'Stack', path: 'Parcours', contact: 'Contact — cliquer pour copier' },
  en: { about: 'About', services: 'Services', stack: 'Stack', path: 'Background', contact: 'Contact — click to copy' },
};

// Coordonnées — À COMPLÉTER (adresse et CV provisoires)
export const contact = {
  email: 'hello@kerningkastle.com', // TODO : adresse réelle
  instagram: 'https://www.instagram.com/kerningkastle/',
  cv: '/cv-xavier-m-diez.pdf', // TODO : déposer le PDF (< 1 Mo) dans /public
};
