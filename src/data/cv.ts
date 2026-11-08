// CV en ligne (page « terminal » cachée, accessible depuis le pied de page). Source : CV PDF FR / EN.
// Règles du site : pas de nom d'employeur actuel, pas de noms d'artistes ni de labels, pas de téléphone.
// TODO : années et lien de téléchargement de Farquaad et Himarë.
import type { Lang } from './ui';
import { contact } from './about';

export type Entry = { when?: string; what: string; where?: string; items?: string[] };
export type Section = { id: string; cmd: string[]; title: string; intro?: string; entries?: Entry[]; list?: [string, string, string?][] };
export type Cv = { name: string; role: string; meta: string; sections: Section[]; ui: Record<string, string> };

export const cv: Record<Lang, Cv> = {
  fr: {
    name: 'Xavier M. Diez',
    role: 'Type designer & digital creative',
    meta: 'Paris · remote · à l’écoute',
    ui: {
      boot: 'Dernière connexion',
      help: 'commandes',
      unknown: 'commande introuvable',
      hint: 'tape « help » ou clique une commande',
      bye: 'déconnexion…',
      sudo: 'bien essayé.',
      back: 'retour au site',
      lang: 'en / fr',
    },
    sections: [
      { id: 'profil', cmd: ['profil', 'profile', 'whoami'], title: 'profil',
        intro: 'Designer graphique et typographe, avec un bagage de code. Je pars toujours de la lettre, et je passe au code quand la main ne suffit plus (rarement l’inverse). Fil rouge : les systèmes et les grilles, qu’ils soient typographiques, génératifs ou éditoriaux.' },
      { id: 'xp', cmd: ['xp', 'experience', 'experiences'], title: 'expériences', entries: [
        { when: '2020 — auj.', what: 'Directeur artistique freelance — (ChâteauStudio)™', where: 'Paris & remote · 5 à 9 clients par an', items: [
          'Identités musicales, seul de bout en bout, pour des artistes de rap underground, d’électro et d’hyperpop : logotypes et lettrages toujours dessinés à la main, pochettes CD et vinyle (relief et découpe réellement produits), univers de tournée, merchandising, fichiers d’exécution print (sérigraphie, héliogravure).',
          'Méthode : le projet écouté en boucle, brief et références, puis deux pistes radicalement différentes ; l’objet physique est pensé en premier.',
          'Visuels live ponctuels : boucles et contenus temps réel sous TouchDesigner, dont des prestations d’artistes à la Gaîté Lyrique.',
          'Identités de marque : direction artistique, logos, identités visuelles et chartes pour le commerce, la culture et l’associatif.',
          'Web & digital : direction artistique et UX/UI de sites, déclinaisons réseaux sociaux, intégration (HTML/CSS/JS).',
        ] },
        { when: '2025 — auj.', what: 'Conseiller spécialisé randonnée & matériel technique', where: 'Commerce de sport', items: [
          'Expertise produit et conseil technique sur l’équipement outdoor (randonnée, bivouac, textile technique).',
        ] },
        { when: '2018 — 2020', what: 'Designer web & graphique (alternance et stage)', where: 'Agence DOERS · Paris', items: [
          'Sites interactifs, déclinaisons de chartes, direction artistique, micro-interactions et assets graphiques pour des comptes dont PlayStation, Chanel, Nespresso.',
          'Direction artistique de tournage : set design et scénographie visuelle pour campagnes et shootings de marques.',
        ] },
      ] },
      { id: 'projets', cmd: ['projets', 'projects', 'rnd'], title: 'projets, r&d & autoproduction', entries: [
        { when: '2026 — en cours', what: 'ASAPHR', where: 'Type design, système d’écriture & objet', items: [
          'Écriture inventée pour comprendre ce qui fait une écriture : grammaire, sens de lecture (du centre vers l’extérieur), tracé, supports. 60 glyphes de type runique en finalisation sous Glyphs 4.',
          'Prototypage d’un objet-livre à révélation mécanique (découpe papier, impression 3D).',
        ] },
        { when: '2026', what: 'Systemic Vexillology', where: 'Grammaire des drapeaux & outillage génératif', items: [
          'Recherche plastique et théorique sur la vexillologie et les systèmes de signes vectoriels.',
          'Interfaces web interactives et générateurs de formes en JavaScript / Canvas.',
        ] },
        { when: '2025', what: 'Algorithmic Heraldry', where: 'Direction artistique, édition & génératif', items: [
          'Ouvrage théorique inédit de 500 pages : direction artistique intégrale, mise en page générée en Python.',
          'Générateur p5.js : visuels uniques indexés par clé de hash parmi des milliards de combinaisons.',
        ] },
        { what: 'Farquaad & Himarë', where: 'Fontes libres', items: [
          'Deux caractères dessinés de A à Z, diffusés gratuitement.',
        ] },
        { when: '2023 — auj.', what: 'kern.outdoor', where: 'Média outdoor · direction de création & production', items: [
          'Charte visuelle, production, captation, scripting et montage vidéo court format.',
          'Audience organique de plus de 20 000 abonnés (TikTok / Instagram), projet autoproduit et volontairement non monétisé.',
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
        ['dessin', 'Procreate, papier'],
        ['code', 'HTML, CSS, JavaScript (ES6+), p5.js, Canvas 2D, Python, Git'],
        ['ia', 'outil de production (textures, vectorisation, prototypes de scripts), jamais à la place de la direction artistique'],
        ['méthodes', 'DA modulaire, génération algorithmique de formes, grilles complexes, sémiotique visuelle'],
      ] },
      { id: 'interets', cmd: ['interets', 'interests', 'hobbies'], title: 'intérêts', list: [
        ['montagne', 'randonnée, bivouac, escalade ; préparation du diplôme d’accompagnateur en moyenne montagne (AMM)'],
        ['endurance', 'course à pied, vélo à pignon fixe'],
        ['écrans', 'jeu vidéo, speedrun, films d’horreur'],
        ['son', 'MAO'],
        ['code', 'sites et petits outils web pour expérimenter et s’amuser entre amis'],
        ['serveur', 'serveur maison ZimaOS / Docker — Jellyfin, Tailscale'],
      ] },
      { id: 'contact', cmd: ['contact', 'mail', 'email'], title: 'contact', list: [
        ['email', contact.email, `mailto:${contact.email}`],
        ['instagram', '@kerningkastle', contact.instagram],
        ['behance', 'icemigi', 'https://www.behance.net/icemigi'],
        ['tiktok', '@kern.outdoor', 'https://www.tiktok.com/@kern.outdoor'],
        ['instagram', '@kern.outdoor', 'https://www.instagram.com/kern.outdoor/'],
        ['langues', 'français, espagnol (bilingue) · anglais (C1)'],
        ['dispo', 'à l’écoute — CDI ou missions, Paris & remote'],
      ] },
    ],
  },
  en: {
    name: 'Xavier M. Diez',
    role: 'Type designer & digital creative',
    meta: 'Paris · remote · open to offers',
    ui: {
      boot: 'Last login',
      help: 'commands',
      unknown: 'command not found',
      hint: 'type “help” or click a command',
      bye: 'logging out…',
      sudo: 'nice try.',
      back: 'back to the site',
      lang: 'en / fr',
    },
    sections: [
      { id: 'profil', cmd: ['profile', 'profil', 'whoami'], title: 'profile',
        intro: 'Graphic designer and typographer with a coding background. I always start from the letter, and switch to code when the hand isn’t enough (rarely the other way round). Common thread: systems and grids, whether typographic, generative or editorial.' },
      { id: 'xp', cmd: ['xp', 'experience', 'experiences'], title: 'experience', entries: [
        { when: '2020 — now', what: 'Freelance art director — (ChâteauStudio)™', where: 'Paris & remote · 5 to 9 clients a year', items: [
          'Music identities, solo from start to finish, for underground rap, electronic and hyperpop artists: logotypes and lettering always hand-drawn, CD and vinyl sleeves (embossing and die-cuts actually produced), tour universes, merchandise, print production files (screen printing, photogravure).',
          'Method: the record on repeat, brief and references, then two radically different directions; the physical object comes first.',
          'Occasional live visuals: loops and real-time content in TouchDesigner, including artists’ shows at La Gaîté Lyrique.',
          'Brand identities: art direction, logos, visual identities and guidelines for retail, culture and nonprofits.',
          'Web & digital: website art direction and UX/UI, social adaptations, integration (HTML/CSS/JS).',
        ] },
        { when: '2025 — now', what: 'Hiking & technical gear specialist advisor', where: 'Sports retail', items: [
          'Product expertise and technical advice on outdoor equipment (hiking, bivouac, technical apparel).',
        ] },
        { when: '2018 — 2020', what: 'Web & graphic designer (work-study and internship)', where: 'DOERS agency · Paris', items: [
          'Interactive websites, brand guideline adaptations, art direction, micro-interactions and graphic assets for accounts including PlayStation, Chanel, Nespresso.',
          'Shoot art direction: set design and visual scenography for brand campaigns and shoots.',
        ] },
      ] },
      { id: 'projets', cmd: ['projects', 'projets', 'rnd'], title: 'projects, r&d & self-production', entries: [
        { when: '2026 — ongoing', what: 'ASAPHR', where: 'Type design, writing system & object', items: [
          'An invented script to understand what makes a script: grammar, reading direction (from the centre outwards), stroke, media. 60 rune-like glyphs being finalised in Glyphs 4.',
          'Prototype of a book-object with a mechanical reveal (paper cutting, 3D printing).',
        ] },
        { when: '2026', what: 'Systemic Vexillology', where: 'Flag grammar & generative tooling', items: [
          'Visual and theoretical research on vexillology and vector sign systems.',
          'Interactive web interfaces and shape generators in JavaScript / Canvas.',
        ] },
        { when: '2025', what: 'Algorithmic Heraldry', where: 'Art direction, publishing & generative', items: [
          'Unpublished 500-page theoretical book: full art direction, layout generated in Python.',
          'p5.js generator: unique visuals indexed by hash key among billions of combinations.',
        ] },
        { what: 'Farquaad & Himarë', where: 'Free fonts', items: [
          'Two typefaces drawn from A to Z, released for free.',
        ] },
        { when: '2023 — now', what: 'kern.outdoor', where: 'Outdoor media · creative direction & production', items: [
          'Visual identity, production, filming, scripting and short-form editing.',
          'Organic audience of 20,000+ followers (TikTok / Instagram), self-produced and deliberately unmonetised.',
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
        ['drawing', 'Procreate, paper'],
        ['code', 'HTML, CSS, JavaScript (ES6+), p5.js, Canvas 2D, Python, Git'],
        ['ai', 'production tool (textures, vectorisation, script prototypes), never a substitute for art direction'],
        ['methods', 'modular art direction, algorithmic form generation, complex grids, visual semiotics'],
      ] },
      { id: 'interets', cmd: ['interests', 'interets', 'hobbies'], title: 'interests', list: [
        ['mountains', 'hiking, bivouac, climbing; training for the French mountain leader diploma (AMM)'],
        ['endurance', 'running, fixed-gear cycling'],
        ['screens', 'video games, speedrunning, horror films'],
        ['sound', 'music production'],
        ['code', 'websites and small web tools to experiment and have fun with friends'],
        ['server', 'home server on ZimaOS / Docker — Jellyfin, Tailscale'],
      ] },
      { id: 'contact', cmd: ['contact', 'mail', 'email'], title: 'contact', list: [
        ['email', contact.email, `mailto:${contact.email}`],
        ['instagram', '@kerningkastle', contact.instagram],
        ['behance', 'icemigi', 'https://www.behance.net/icemigi'],
        ['tiktok', '@kern.outdoor', 'https://www.tiktok.com/@kern.outdoor'],
        ['instagram', '@kern.outdoor', 'https://www.instagram.com/kern.outdoor/'],
        ['languages', 'French, Spanish (bilingual) · English (C1)'],
        ['status', 'open to full-time roles and freelance, Paris & remote'],
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
  s.list?.forEach(([k, v, href]) => {
    const val = href ? `<a href="${esc(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(v)}</a>` : esc(v);
    out.push(`<p class="t-e"><span class="t-d">${esc(k)}</span><span>${val}</span></p>`);
  });
  return out.join('');
}

export function headHtml(c: Cv): string {
  return `<p class="t-name">${esc(c.name)}</p><p class="t-p">${esc(c.role)}</p><p class="t-p t-m">${esc(c.meta)}</p>`;
}
