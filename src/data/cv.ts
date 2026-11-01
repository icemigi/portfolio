// CV en ligne (page « terminal » cachée, accessible depuis le pied de page). Source : CV PDF FR / EN.
// Règles du site : pas de nom d'employeur actuel, pas de noms d'artistes ni de labels, pas de téléphone.
import type { Lang } from './ui';
import { contact } from './about';

export type Entry = { when?: string; what: string; where?: string; items?: string[] };
export type Section = { id: string; cmd: string[]; title: string; intro?: string; entries?: Entry[]; list?: [string, string][] };
export type Cv = { name: string; role: string; meta: string; sections: Section[]; ui: Record<string, string> };

export const cv: Record<Lang, Cv> = {
  fr: {
    name: 'Xavier M. Diez',
    role: 'Designer graphique — identité · typographie · systèmes génératifs',
    meta: 'Bordeaux → Paris · remote',
    ui: {
      boot: 'Dernière connexion',
      help: 'commandes',
      unknown: 'commande introuvable',
      hint: 'tape « help » ou clique une commande',
      bye: 'déconnexion…',
      sudo: 'bien essayé.',
      back: 'retour au site',
      lang: 'english',
    },
    sections: [
      { id: 'profil', cmd: ['profil', 'profile', 'whoami'], title: 'profil',
        intro: 'Designer graphique et typographe, avec une pratique de code créatif. Fil rouge : la maîtrise des systèmes et des grilles, qu’ils soient typographiques, génératifs ou éditoriaux.' },
      { id: 'xp', cmd: ['xp', 'experience', 'experiences'], title: 'expériences', entries: [
        { when: '2020 — 2026', what: 'Designer graphique indépendant', where: 'Paris, Bordeaux & remote · 5 à 9 clients par an', items: [
          'Branding musical & scénographie (360°) : direction artistique et exécution en autonomie complète — logotypes, typographies sur mesure, pochettes CD/vinyle, univers de tournée, merchandising textile, fichiers d’exécution print (sérigraphie, héliogravure), pour des artistes de labels majors et indépendants.',
          'Création visuelle scénique : assets, boucles vidéo et contenus temps réel sous TouchDesigner pour la scène (prestations d’artistes à la Gaîté Lyrique).',
          'Identités de marque : direction artistique, logos, identités visuelles et chartes pour le commerce, la culture et l’associatif.',
          'Digital & social media : direction d’image, déclinaisons réseaux sociaux, contenus visuels et éditoriaux, intégration web (HTML/CSS/JS).',
        ] },
        { when: '2025 — auj.', what: 'Conseiller spécialisé randonnée & matériel technique', where: 'Commerce de sport · Bordeaux', items: [
          'Expertise produit et conseil technique sur l’équipement outdoor (randonnée, bivouac, textile technique).',
        ] },
        { when: '2018 — 2020', what: 'Designer web & graphique (alternance et stage)', where: 'Agence DOERS · Paris', items: [
          'Sites interactifs, déclinaisons de chartes, direction artistique, micro-interactions et assets graphiques pour des comptes dont PlayStation, Chanel, Nespresso.',
          'Direction artistique de tournage : set design et scénographie visuelle pour campagnes et shootings de marques.',
        ] },
      ] },
      { id: 'projets', cmd: ['projets', 'projects', 'rnd'], title: 'projets, r&d & autoproduction', entries: [
        { when: '2026 — en cours', what: 'ASAPHR', where: 'Type design, système d’écriture & objet', items: [
          'Système d’écriture complet à glyphes de type runique ; 60 glyphes en finalisation sous Glyphs 4.',
          'Prototypage d’un objet-livre à révélation mécanique (découpe papier, impression 3D).',
        ] },
        { when: '2026', what: 'Systemic Vexillology', where: 'Grammaire des drapeaux & outillage génératif', items: [
          'Recherche plastique et théorique sur la vexillologie et les systèmes de signes vectoriels.',
          'Interfaces web interactives et générateurs de formes en JavaScript / Canvas.',
        ] },
        { when: '2025', what: 'Algorithmic Heraldry', where: 'Direction artistique, édition & génératif', items: [
          'Manifeste théorique de 500 pages : direction artistique et mise en page intégrales.',
          'Générateur p5.js : visuels uniques indexés par clé de hash parmi des milliards de combinaisons ; grilles InDesign automatisées.',
        ] },
        { when: '2023 — auj.', what: 'Média outdoor', where: 'Direction de création & production', items: [
          'Charte visuelle, production, captation, scripting et montage vidéo court format.',
          'Audience organique de plus de 20 000 abonnés (TikTok / Instagram), projet autoproduit et non commercial.',
        ] },
      ] },
      { id: 'formation', cmd: ['formation', 'education', 'edu'], title: 'formation', entries: [
        { when: '2018 — 2021', what: 'Bachelor Web, option Front-End & UI Design', where: 'HETIC' },
        { when: '2015 — 2017', what: 'Informatique, algorithmique & développement système', where: 'École 42 · C/C++, POO, architecture logicielle, Git' },
        { what: 'Design graphique, typographie et dessin de caractères', where: 'autodidacte' },
      ] },
      { id: 'outils', cmd: ['outils', 'tools', 'stack'], title: 'outils & méthodes', list: [
        ['adobe', 'InDesign (styles complexes, GREP, gros volumes), Illustrator (pré-presse), Photoshop, After Effects, Premiere Pro'],
        ['type', 'Glyphs 4, FontForge — métriques, hinting, OTF/TTF/WOFF2'],
        ['print', 'profils ICC, imposition, BAT, tracés de découpe, façonnage'],
        ['3d / live', 'Blender, TouchDesigner — interactif, audio-réactif, caméra, LIDAR'],
        ['ui', 'Figma, responsive, ergonomie web'],
        ['code', 'HTML, CSS, JavaScript (ES6+), p5.js, Canvas 2D, Git'],
        ['ia', 'outil de production (textures, vectorisation, prototypes de scripts), jamais à la place de la direction artistique'],
        ['méthodes', 'DA modulaire, génération algorithmique de formes, grilles complexes, sémiotique visuelle'],
      ] },
      { id: 'interets', cmd: ['interets', 'interests', 'hobbies'], title: 'intérêts', list: [
        ['outdoor', 'randonnée, bivouac, escalade, course à pied'],
        ['code', 'sites et petits outils web pour expérimenter et s’amuser entre amis'],
        ['serveur', 'serveur maison ZimaOS / Docker — Jellyfin, Tailscale'],
      ] },
      { id: 'contact', cmd: ['contact', 'mail', 'email'], title: 'contact', list: [
        ['email', contact.email],
        ['instagram', '@kerningkastle'],
        ['langues', 'français, espagnol (bilingue) · anglais (C1)'],
      ] },
    ],
  },
  en: {
    name: 'Xavier M. Diez',
    role: 'Graphic designer — identity · typography · generative systems',
    meta: 'Bordeaux → Paris · remote',
    ui: {
      boot: 'Last login',
      help: 'commands',
      unknown: 'command not found',
      hint: 'type “help” or click a command',
      bye: 'logging out…',
      sudo: 'nice try.',
      back: 'back to the site',
      lang: 'français',
    },
    sections: [
      { id: 'profil', cmd: ['profile', 'profil', 'whoami'], title: 'profile',
        intro: 'Graphic designer and typographer with a creative-coding practice. Common thread: mastery of systems and grids, whether typographic, generative or editorial.' },
      { id: 'xp', cmd: ['xp', 'experience', 'experiences'], title: 'experience', entries: [
        { when: '2020 — 2026', what: 'Independent graphic designer', where: 'Paris, Bordeaux & remote · 5 to 9 clients a year', items: [
          'Music branding & scenography (360°): art direction and full solo execution — logotypes, custom typefaces, CD/vinyl sleeves, tour universes, apparel merchandise, print production files (screen printing, photogravure), for artists of major and independent labels.',
          'Stage visuals: assets, video loops and real-time content in TouchDesigner for live shows (artists’ performances at La Gaîté Lyrique).',
          'Brand identities: art direction, logos, visual identities and guidelines for retail, culture and nonprofits.',
          'Digital & social media: image direction, social adaptations, visual and editorial content, web integration (HTML/CSS/JS).',
        ] },
        { when: '2025 — now', what: 'Hiking & technical gear specialist advisor', where: 'Sports retail · Bordeaux', items: [
          'Product expertise and technical advice on outdoor equipment (hiking, bivouac, technical apparel).',
        ] },
        { when: '2018 — 2020', what: 'Web & graphic designer (work-study and internship)', where: 'DOERS agency · Paris', items: [
          'Interactive websites, brand guideline adaptations, art direction, micro-interactions and graphic assets for accounts including PlayStation, Chanel, Nespresso.',
          'Shoot art direction: set design and visual scenography for brand campaigns and shoots.',
        ] },
      ] },
      { id: 'projets', cmd: ['projects', 'projets', 'rnd'], title: 'projects, r&d & self-production', entries: [
        { when: '2026 — ongoing', what: 'ASAPHR', where: 'Type design, writing system & object', items: [
          'Complete writing system with rune-like glyphs; 60 glyphs being finalised in Glyphs 4.',
          'Prototype of a book-object with a mechanical reveal (paper cutting, 3D printing).',
        ] },
        { when: '2026', what: 'Systemic Vexillology', where: 'Flag grammar & generative tooling', items: [
          'Visual and theoretical research on vexillology and vector sign systems.',
          'Interactive web interfaces and shape generators in JavaScript / Canvas.',
        ] },
        { when: '2025', what: 'Algorithmic Heraldry', where: 'Art direction, publishing & generative', items: [
          '500-page theoretical manifesto: full art direction and layout.',
          'p5.js generator: unique visuals indexed by hash key among billions of combinations; automated InDesign grids.',
        ] },
        { when: '2023 — now', what: 'Outdoor media', where: 'Creative direction & production', items: [
          'Visual identity, production, filming, scripting and short-form editing.',
          'Organic audience of 20,000+ followers (TikTok / Instagram), self-produced and non-commercial.',
        ] },
      ] },
      { id: 'formation', cmd: ['education', 'formation', 'edu'], title: 'education', entries: [
        { when: '2018 — 2021', what: 'Bachelor’s in Web, Front-End & UI Design', where: 'HETIC' },
        { when: '2015 — 2017', what: 'Computer science, algorithms & systems development', where: 'École 42 · C/C++, OOP, software architecture, Git' },
        { what: 'Graphic design, typography and type design', where: 'self-taught' },
      ] },
      { id: 'outils', cmd: ['tools', 'outils', 'stack'], title: 'tools & methods', list: [
        ['adobe', 'InDesign (complex styles, GREP, large volumes), Illustrator (prepress), Photoshop, After Effects, Premiere Pro'],
        ['type', 'Glyphs 4, FontForge — metrics, hinting, OTF/TTF/WOFF2'],
        ['print', 'ICC profiles, imposition, proofs, die-cut paths, finishing'],
        ['3d / live', 'Blender, TouchDesigner — interactive, audio-reactive, camera, LIDAR'],
        ['ui', 'Figma, responsive, web ergonomics'],
        ['code', 'HTML, CSS, JavaScript (ES6+), p5.js, Canvas 2D, Git'],
        ['ai', 'production tool (textures, vectorisation, script prototypes), never a substitute for art direction'],
        ['methods', 'modular art direction, algorithmic form generation, complex grids, visual semiotics'],
      ] },
      { id: 'interets', cmd: ['interests', 'interets', 'hobbies'], title: 'interests', list: [
        ['outdoor', 'hiking, bivouac, climbing, running'],
        ['code', 'websites and small web tools to experiment and have fun with friends'],
        ['server', 'home server on ZimaOS / Docker — Jellyfin, Tailscale'],
      ] },
      { id: 'contact', cmd: ['contact', 'mail', 'email'], title: 'contact', list: [
        ['email', contact.email],
        ['instagram', '@kerningkastle'],
        ['languages', 'French, Spanish (bilingual) · English (C1)'],
      ] },
    ],
  },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Une section en HTML : une ligne = un bloc, pour l'affichage ligne par ligne.
export function sectionHtml(s: Section): string {
  const out: string[] = [`<p class="t-h">## ${esc(s.title)}</p>`];
  if (s.intro) out.push(`<p class="t-p">${esc(s.intro)}</p>`);
  s.entries?.forEach((e) => {
    out.push(`<p class="t-e"><span class="t-d">${esc(e.when || '')}</span><span><b>${esc(e.what)}</b>${e.where ? `<span class="t-m"> — ${esc(e.where)}</span>` : ''}</span></p>`);
    e.items?.forEach((it) => out.push(`<p class="t-i"><span class="t-d"></span><span>+ ${esc(it)}</span></p>`));
  });
  s.list?.forEach(([k, v]) => {
    const val = k === 'email' ? `<a href="mailto:${esc(v)}">${esc(v)}</a>` : k === 'instagram' ? `<a href="${contact.instagram}" target="_blank" rel="noopener">${esc(v)}</a>` : esc(v);
    out.push(`<p class="t-e"><span class="t-d">${esc(k)}</span><span>${val}</span></p>`);
  });
  return out.join('');
}

export function headHtml(c: Cv): string {
  return `<p class="t-name">${esc(c.name)}</p><p class="t-p">${esc(c.role)}</p><p class="t-p t-m">${esc(c.meta)}</p>`;
}
