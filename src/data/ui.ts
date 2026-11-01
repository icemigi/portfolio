// Textes d'interface, par langue.
export const languages = ['en', 'fr'] as const;
export type Lang = (typeof languages)[number];

export const ui = {
  en: {
    tagline: 'Type designer & digital creative',
    phrase: 'Type designer & digital creative — Paris & remote',
    nav: { work: 'Work', lab: 'Lab', archive: 'Archive', about: 'About' },
    home: 'kerningkastle — home',
    skip: 'Skip to content',
    services: 'Services',
    more: 'More about me',
    work: 'Work',
    meta: { year: 'Year', context: 'Context', role: 'Role', tools: 'Tools' },
    next: 'Next project',
    nextShort: 'Next',
    opening: 'Opening image',
    visual: 'Visual to come',
    contact: 'Contact',
    elsewhere: 'Elsewhere',
    cv: 'CV >_',
    top: 'Top',
    copied: 'Copied ✓',
    clickToCopy: 'click to copy',
    available: 'Roles & commissions — Paris & remote',
    scroll: 'Scroll',
    notFound: 'This page does not exist.',
    backHome: 'Back home',
    note: 'Note',
    prev: 'Previous',
    download: 'Download',
    typeHere: 'Type to try it',
    fileSoon: 'File to come',
    archiveCount: 'Archive',
    close: 'Close',
  },
  fr: {
    tagline: 'Type designer & digital creative',
    phrase: 'Type designer & digital creative — Paris & remote',
    nav: { work: 'Projets', lab: 'Lab', archive: 'Archive', about: 'À propos' },
    home: 'kerningkastle — accueil',
    skip: 'Aller au contenu',
    services: 'Services',
    more: 'En savoir plus',
    work: 'Projets',
    meta: { year: 'Année', context: 'Contexte', role: 'Rôle', tools: 'Outils' },
    next: 'Projet suivant',
    nextShort: 'Suivant',
    opening: "Image d'ouverture",
    visual: 'Visuel à venir',
    contact: 'Contact',
    elsewhere: 'Ailleurs',
    cv: 'CV >_',
    top: 'Haut',
    copied: 'Copié ✓',
    clickToCopy: 'cliquer pour copier',
    available: 'Postes & missions — Paris & remote',
    scroll: 'Défiler',
    notFound: "Cette page n'existe pas.",
    backHome: "Retour à l'accueil",
    note: 'Note',
    prev: 'Précédent',
    download: 'Télécharger',
    typeHere: 'Tapez pour essayer',
    fileSoon: 'Fichier à venir',
    archiveCount: 'Archive',
    close: 'Fermer',
  },
} as const;

export function getLangFromParam(lang?: string): Lang {
  return lang === 'fr' ? 'fr' : 'en';
}

export const pad = (x: number) => String(x).padStart(2, '0');

// Catégories (lettre → libellé)
export const tags = {
  en: { I: 'Identity', T: 'Type', G: 'Generative', W: 'Web', E: 'Editorial', P: 'Print' },
  fr: { I: 'Identité', T: 'Typographie', G: 'Génératif', W: 'Web', E: 'Édition', P: 'Print' },
} as const;
