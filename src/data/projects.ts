// Études de cas, dans l'ordre choisi le 08/11 : Heraldry, (ChâteauStudio)™, Identités musicales, ASAPHR, kern.outdoor, BMS, Sports Aventure. Même gabarit pour toutes :
// en-tête (meta) · accroche (lead) · sections (Point de départ, Ce qui a été fait / Méthode, Choix clés, Résultat, Statut).
// `draft: true` affiche un badge « à valider » tant que le texte n'est pas validé.

type Para = { t?: string; p: string };
type Section = { h: string; paras: Para[] };
type Content = {
  title: string;
  text?: string[];   // intro courte (1 à 2 paragraphes) ; remplace les sections s'il est présent
  blocks?: { k: string; v: string }[]; // rubriques courtes : intitulé + 1 à 2 phrases
  short: string; // sous-titre des cartes
  meta: { year: string; context: string; role: string; tools: string };
  lead: string;
  sections: Section[];
};
export type Tag = 'I' | 'T' | 'G' | 'W' | 'E' | 'P';
export type Project = {
  hidden?: boolean;   // masqué partout tant que le projet n'existe pas encore
  slug: string;
  draft: boolean;
  years: number[];    // [début] ou [début, fin] — vide si inconnu
  preview?: string;   // image ou vidéo (.mp4) d'aperçu au survol, dans /public/previews/
  tags: Tag[];        // I identité · T type · G génératif · W web · E édition · P print
  yearLabel: string;  // année affichée dans les listes
  object: 'book' | 'rock' | 'vinyl' | 'rook' | 'controller' | 'stick' | 'bottle' | 'compass' | 'feather' | 'backpack'; // objet de la page Projets
  generator?: string; // générateur jouable intégré à l'étude
  en: Content;
  fr: Content;
};

const all: Project[] = [
  // ---------------------------------------------------------------- algorithmic-heraldry
  {
    slug: 'algorithmic-heraldry',
    years: [2025],
    tags: ['G', 'E'],
    yearLabel: '2025',
    object: 'book',
    draft: false,
    generator: '/lab/heraldry/index.html',
    fr: {
      title: 'Algorithmic Heraldry',
      short: 'Générateur & livre de 500 pages',
      meta: {
        year: '2025',
        context: 'Recherche personnelle',
        role: 'Conception, code, édition',
        tools: 'p5.js, Python',
      },
      lead: "Un système qui transforme les règles du blason en code, et le livre de 500 pages qui fige ce qu'il produit.",
      sections: [
        { h: "Un blason est un texte", paras: [{ p: "Tout est parti d'un traité d'héraldique, celui de Neubecker. Un blason ne se transmettait pas par le dessin mais par une phrase assez précise pour qu'un héraut le redessine sans l'avoir vu : la première charte graphique était déjà une règle." }] },
        { h: "Une soirée, des centaines d'écus", paras: [{ p: "Un soir, j'ai traduit ces règles en code, et le programme a sorti des centaines d'écus d'un coup. Tout le reste a suivi en quelques semaines." }] },
        { h: "Suivre la loi du blason", paras: [{ p: "Des formes d'écus, des partitions, des meubles redessinés d'après des armoriaux anciens ou réduits à la géométrie, des devises tirées de vraies devises latines. Le code respecte les règles héraldiques, et chaque écu naît d'une clé qui le redonne à l'identique." }] },
        { h: "Le noir et blanc des graveurs", paras: [{ p: "En couleur, les écus faisaient décor de jeu vidéo. J'ai repris les hachures fixées par Pietrasanta au XVIIᵉ siècle pour graver les couleurs : chaque écu se lit comme un tampon." }] },
        { h: "Le papier arrête le code", paras: [{ p: "Le programme produirait sans fin ; le livre fige. Un script compose seul ses 500 pages, du texte théorique jusqu'à l'écu seul, et le livre cherche aujourd'hui son éditeur." }] },
      ],
    },
    en: {
      title: 'Algorithmic Heraldry',
      short: 'Generator & 500-page book',
      meta: {
        year: '2025',
        context: 'Personal research',
        role: 'Concept, code, editorial',
        tools: 'p5.js, Python',
      },
      lead: "A system that turns the rules of heraldry into code, and the 500-page book that sets what it produces in stone.",
      sections: [
        { h: "A coat of arms is a text", paras: [{ p: "It all started with a heraldry treatise, Neubecker's. Coats of arms were passed on not as drawings but as a sentence precise enough for a herald to redraw one he had never seen: the first brand guidelines were already a rule." }] },
        { h: "One evening, hundreds of shields", paras: [{ p: "One evening I turned those rules into code, and the program produced hundreds of shields at once. Everything else followed within a few weeks." }] },
        { h: "Following heraldic law", paras: [{ p: "Shield shapes, partitions, charges redrawn from old armorials or reduced to geometry, mottos taken from real Latin mottos. The code follows the rules of heraldry, and each shield comes from a key that gives it back identically." }] },
        { h: "The engravers' black and white", paras: [{ p: "In colour, the shields looked like video-game scenery. I went back to the hatchings Pietrasanta set in the 17th century to engrave colours: each shield reads like a stamp." }] },
        { h: "Paper stops the code", paras: [{ p: "The program could run forever; the book holds still. A script lays out its 500 pages on its own, from the theoretical essay down to the single shield, and the book is now looking for a publisher." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- chateau-studio
  {
    slug: 'chateau-studio',
    years: [2026],
    tags: ['I'],
    yearLabel: '2026',
    object: 'rook',
    draft: true,
    fr: {
      title: '(ChâteauStudio)™',
      short: "Identité d'un studio",
      meta: {
        year: '2026',
        context: 'Identité de studio',
        role: 'Naming, identité, typographie',
        tools: '—', // à compléter quand l'identité sera dessinée
      },
      lead: "L'identité de mon studio de design graphique, construite comme une commande.",
      sections: [
        { h: "Un nom, deux langues", paras: [{ p: "Château en français, castle en anglais : le studio abrite le travail de commande, à côté de kerningkastle, la recherche." }] },
        { h: "Se distinguer par le signe", paras: [{ p: "D'autres « château » existent déjà en ligne : l'identité se démarque par les parenthèses, le ™ et un lettrage dessiné, sans changer de nom." }] },
        { h: "En cours", paras: [{ p: "Le lettrage est en dessin. Viendront la papeterie, le deck, les devis et le site du studio." }] },
      ],
    },
    en: {
      title: '(ChâteauStudio)™',
      short: 'Studio identity',
      meta: {
        year: '2026',
        context: 'Studio identity',
        role: 'Naming, identity, type',
        tools: '—', // à compléter quand l'identité sera dessinée
      },
      lead: "The identity of my graphic design studio, built like a commission.",
      sections: [
        { h: "One name, two languages", paras: [{ p: "Château in French, castle in English: the studio houses the commissioned work, next to kerningkastle, the research." }] },
        { h: "Standing out through signs", paras: [{ p: "Other \"château\" names already exist online: the identity stands out through parentheses, the ™ and hand-drawn lettering, without changing the name." }] },
        { h: "In progress", paras: [{ p: "The lettering is being drawn. Stationery, a deck, quotes and the studio website will follow." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- music-identities
  {
    slug: 'music-identities',
    years: [2022, 2026],
    tags: ['I', 'T'],
    yearLabel: '2022–26',
    object: 'vinyl',
    draft: false,
    fr: {
      title: 'Identités musicales',
      short: 'Du logotype au vinyle',
      meta: {
        year: 'Depuis 2022',
        context: "Commandes d'artistes",
        role: 'Direction artistique, logotype, typographie, print',
        tools: 'Illustrator, Photoshop, Procreate',
      },
      lead: "Des identités pour des artistes de rap underground, d'électro et d'hyperpop, du lettrage dessiné jusqu'au vinyle.",
      sections: [
        { h: "Le disque d'abord", paras: [{ p: "Chaque commande part d'une sortie, un single, un EP ou un album, que j'écoute en boucle avant de dessiner quoi que ce soit." }] },
        { h: "Deux pistes, jamais une", paras: [{ p: "Après le brief et les références échangées avec l'artiste, je propose toujours deux directions radicalement différentes : le choix porte sur une idée, pas sur un détail." }] },
        { h: "Le lettrage dessiné", paras: [{ p: "Presque toujours un logotype ou un titre dessiné à la main, jamais tiré d'une fonte, fait pour cette sortie et aucune autre." }] },
        { h: "Penser l'objet", paras: [{ p: "La pochette se pense dans la main avant d'être une vignette : relief, découpe, matière. Puis tout se décline, du dos au merch, jusqu'à la scène, où mes visuels sont projetés en direct sous TouchDesigner." }] },
        { h: "Une archive sans noms", paras: [{ p: "Plus de vingt identités, montrées ici sans noms ni titres : seules les formes parlent." }] },
      ],
    },
    en: {
      title: 'Music identities',
      short: 'From logotype to vinyl',
      meta: {
        year: 'Since 2022',
        context: 'Artist commissions',
        role: 'Art direction, logotype, type, print',
        tools: 'Illustrator, Photoshop, Procreate',
      },
      lead: "Identities for underground rap, electronic and hyperpop artists, from hand-drawn lettering to vinyl.",
      sections: [
        { h: "The record first", paras: [{ p: "Each commission starts from a release, a single, an EP or an album, which I listen to on repeat before drawing anything." }] },
        { h: "Two directions, never one", paras: [{ p: "After the brief and the references shared with the artist, I always offer two radically different directions: the choice is about an idea, not a detail." }] },
        { h: "Drawn lettering", paras: [{ p: "Almost always a logotype or a title drawn by hand, never taken from a font, made for this release and no other." }] },
        { h: "Thinking in objects", paras: [{ p: "A sleeve is thought of in the hand before it becomes a thumbnail: emboss, die-cut, material. Then everything follows, from the back cover to the merch and onto the stage, where my visuals are projected live with TouchDesigner." }] },
        { h: "An archive without names", paras: [{ p: "Over twenty identities, shown here without names or titles: only the shapes speak." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- asaphr
  {
    slug: 'asaphr',
    years: [2026],
    tags: ['T', 'E'],
    yearLabel: '2026',
    object: 'rock',
    draft: false,
    fr: {
      title: 'ASAPHR',
      short: 'Écriture inventée',
      meta: { year: '2026 —', context: 'Recherche personnelle', role: "Système d'écriture, dessin de caractères", tools: 'Glyphs 4' },
      lead: "Une écriture inventée de toutes pièces : des signes, une langue et un support pensés ensemble.",
      sections: [
        { h: "Au départ, un service", paras: [{ p: "Un ami designer avait besoin de signes d'alphabet pour son jeu de cartes. Ça ne s'est pas fait, mais l'idée est restée, et je l'ai poussée jusqu'à une écriture complète." }] },
        { h: "Comme chez Tolkien", paras: [{ p: "Une écriture n'existe pas sans sa langue. J'ai dessiné les signes et écrit la langue en même temps, dans des carnets entiers, jusqu'à ce que les deux se répondent." }] },
        { h: "Tout part du centre", paras: [{ p: "Pour casser l'habitude de lire de gauche à droite et de haut en bas, le support est un disque : on lit chaque branche du centre vers le bord, puis on le tourne." }] },
        { h: "Soixante glyphes", paras: [{ p: "Soixante syllabes en trait monoline, sur une grille de 3 × 5. La place d'un mot sur le rayon suffit à dire son rôle ; au bout, un sceau dit d'où vient l'information." }] },
        { h: "En cours", paras: [{ p: "Les glyphes sont en finition. Viendront un livre-objet à disques et une fonte pour écrire ASAPHR au clavier." }] },
      ],
    },
    en: {
      title: 'ASAPHR',
      short: 'Invented script',
      meta: { year: '2026 —', context: 'Personal research', role: 'Writing system, type design', tools: 'Glyphs 4' },
      lead: "A script invented from scratch: signs, a language and a medium designed together.",
      sections: [
        { h: "It started as a favour", paras: [{ p: "A designer friend needed alphabet signs for his trading card game. It never happened, but the idea stayed with me, and I pushed it into a complete script." }] },
        { h: "As Tolkien did", paras: [{ p: "A script does not exist without its language. I drew the signs and wrote the language at the same time, filling whole notebooks, until each answered the other." }] },
        { h: "Everything starts at the centre", paras: [{ p: "To break the habit of reading left to right and top to bottom, the medium is a disc: each branch is read from the centre outwards, then the disc turns." }] },
        { h: "Sixty glyphs", paras: [{ p: "Sixty syllables in a monoline stroke, on a 3 × 5 grid. A word's place along the ray is enough to give its role; at the end, a seal tells where the information comes from." }] },
        { h: "In progress", paras: [{ p: "The glyphs are being finished. Next come a book-object made of discs and a font to type ASAPHR on a keyboard." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- kern-outdoor
  // Brouillon du 08/11, rédigé d'après la « Note de cadrage — étude de cas kern.outdoor » (v1.0, à valider).
  // Ne jamais citer ni montrer l'employeur. Chiffres à compléter avec les statistiques natives datées.
  {
    slug: 'kern-outdoor',
    years: [2023],
    tags: ['I', 'E'],
    yearLabel: '2023 —',
    object: 'backpack',
    draft: true,
    fr: {
      title: 'kern.outdoor',
      short: "Direction artistique d'un média outdoor",
      meta: { year: '2023 —', context: 'Projet personnel, autoproduit, non commercial', role: 'Direction artistique, identité, écriture, tournage, montage', tools: '—' },
      lead: "La direction artistique d'un média outdoor que je tiens seul, de l'écriture au montage.",
      sections: [
        { h: "Partager un terrain", paras: [{ p: "La montagne depuis l'enfance, le Pays basque, la préparation du diplôme d'accompagnateur : kern.outdoor partage ce terrain depuis 2023, d'abord sans direction artistique." }] },
        { h: "Sortir du flux", paras: [{ p: "Le contenu outdoor est saturé de paysages interchangeables et de tests qui ressemblent à des publicités. Je voulais un compte qu'on reconnaisse au premier coup d'œil, sans budget." }] },
        { h: "Le conseil avant le produit", paras: [{ p: "En février 2026, j'ai bâti la direction artistique autour de ce qui marchait déjà : des conseils techniques, utiles d'abord, jamais publicitaires, vérifiés comme le ferait un accompagnateur." }] },
        { h: "Un système, trois formats", paras: [{ p: "Un wordmark, une typographie et une palette fixes, des gabarits de carrousels, un habillage pour les vidéos face caméra et celles tournées en randonnée : tout se reconnaît comme une même série." }] },
        { h: "Tout fait seul", paras: [{ p: "Écriture, tournage, montage, graphisme : un système pensé pour produire vite sans perdre la cohérence." }] },
      ],
    },
    en: {
      title: 'kern.outdoor',
      short: 'Art direction for an outdoor media',
      meta: { year: '2023 —', context: 'Personal project, self-produced, non-commercial', role: 'Art direction, identity, writing, filming, editing', tools: '—' },
      lead: "The art direction of an outdoor media I run alone, from writing to editing.",
      sections: [
        { h: "Sharing a terrain", paras: [{ p: "Mountains since childhood, the Basque Country, training for the mountain leader diploma: kern.outdoor has been sharing that terrain since 2023, at first without any art direction." }] },
        { h: "Getting out of the feed", paras: [{ p: "Outdoor content is flooded with interchangeable landscapes and gear reviews that look like ads. I wanted an account you recognise at a glance, with no budget." }] },
        { h: "Advice before product", paras: [{ p: "In February 2026, I built the art direction around what already worked: technical advice, useful first, never promotional, checked the way a mountain leader would." }] },
        { h: "One system, three formats", paras: [{ p: "A wordmark, a fixed typeface and palette, carousel templates, a look for face-to-camera videos and for those shot on the trail: everything reads as one series." }] },
        { h: "All done alone", paras: [{ p: "Writing, filming, editing, graphics: a system designed to produce fast without losing consistency." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- bms-esport
  {
    slug: 'bms-esport',
    years: [2023],
    tags: ['W', 'I'],
    yearLabel: '2023',
    object: 'stick',
    draft: false,
    fr: {
      title: 'BMS E-Sport',
      short: 'Site web et boutique',
      meta: { year: '2023', context: 'Commande client', role: 'Direction artistique, UX/UI, web design', tools: 'Figma' },
      lead: "Le site et la boutique d'un club e-sport de jeux de combat, dessinés comme un écran de sélection.",
      sections: [
        { h: "Un club au-dessus de son image", paras: [{ p: "BMS est un club de jeux de combat qui forme des jeunes et aligne des joueurs classés. Son site daté et sa boutique à part ne le montraient pas ; le club m'a contacté en 2023." }] },
        { h: "Les parcours avant le dessin", paras: [{ p: "Qui vient, pour quoi faire, en combien de clics : l'arborescence a précédé le design, et réuni le site et la boutique en un seul parcours." }] },
        { h: "L'esthétique du match", paras: [{ p: "Le moodboard vient des jeux eux-mêmes : écrans de sélection, fiches de personnages, typographies d'arcade. Chaque joueur a sa fiche, construite comme un personnage." }] },
        { h: "Un système, pas des pages", paras: [{ p: "Une typographie, les couleurs du club et des composants réutilisables, des fiches joueurs aux cartes produits, en mode sombre comme en mode clair." }] },
        { h: "Livré, jamais lancé", paras: [{ p: "Le club a changé de direction avant la mise en ligne. Il reste un système complet, prêt à être développé." }] },
      ],
    },
    en: {
      title: 'BMS E-Sport',
      short: 'Website and store',
      meta: { year: '2023', context: 'Client commission', role: 'Art direction, UX/UI, web design', tools: 'Figma' },
      lead: "The website and store of a fighting-game esports club, designed like a character-select screen.",
      sections: [
        { h: "A club above its image", paras: [{ p: "BMS is a fighting-game club that trains young players and fields ranked ones. Its dated website and separate store did not show it; the club contacted me in 2023." }] },
        { h: "Journeys before visuals", paras: [{ p: "Who comes, to do what, in how many clicks: the site map came before the design, and merged the website and the store into a single journey." }] },
        { h: "The look of a match", paras: [{ p: "The moodboard comes from the games themselves: select screens, character sheets, arcade lettering. Each player gets a profile built like a character." }] },
        { h: "A system, not pages", paras: [{ p: "A typeface, the club's colours and reusable components, from player profiles to product cards, in dark mode as well as light." }] },
        { h: "Delivered, never launched", paras: [{ p: "The club changed direction before going live. What remains is a complete system, ready to be built." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- SA
  {
    slug: 'sports-aventure',
    years: [2024],
    tags: ['I', 'W'],
    yearLabel: '2024',
    object: 'compass',
    draft: true,
    fr: {
      title: 'Sports Aventure®',
      short: 'Refonte non sollicitée',
      meta: { year: '2024', context: 'Initiative personnelle, présentée au magasin', role: 'Direction artistique, identité, UX/UI', tools: 'Figma, Illustrator, Photoshop' },
      lead: "La refonte d'un magasin outdoor bordelais, faite sans commande, puis présentée à l'équipe.",
      sections: [
        { h: "Un magasin plus fort que son site", paras: [{ p: "Client régulier, je retrouvais dans les rayons un esprit d'aventure que le site, vert délavé et pensé comme un catalogue, ne transmettait pas. J'ai repris l'identité et le site de moi-même." }] },
        { h: "Observer avant de dessiner", paras: [{ p: "D'abord le magasin et ses clients, ce qu'ils demandent au comptoir ; puis la façon dont les grandes marques outdoor parlent de terrain. L'arborescence est venue avant le design." }] },
        { h: "Une palette de terrain", paras: [{ p: "Des kakis terreux et des bruns profonds à la place du vert délavé, une montagne simple pour logo, des pictogrammes maison." }] },
        { h: "Donner envie de partir", paras: [{ p: "Des images plein cadre, un grand titrage, un accès direct aux catégories : chaque écran pousse à aller plus loin. L'identité s'étend au magasin : affichage, sacs, cartes de fidélité." }] },
        { h: "Un pitch spontané", paras: [{ p: "Présenté en boutique, le projet a plu, sans budget pour aller plus loin. Il reste une démonstration de ce que le magasin pourrait être." }] },
      ],
    },
    en: {
      title: 'Sports Aventure®',
      short: 'Unsolicited redesign',
      meta: { year: '2024', context: 'Self-initiated, pitched to the store', role: 'Art direction, identity, UX/UI', tools: 'Figma, Illustrator, Photoshop' },
      lead: "The redesign of an outdoor store in Bordeaux, made without a brief, then pitched to the team.",
      sections: [
        { h: "A store stronger than its website", paras: [{ p: "As a regular customer, I found a sense of adventure in the aisles that the website, a washed-out green built like a catalogue, did not convey. I reworked the identity and the website on my own." }] },
        { h: "Watching before drawing", paras: [{ p: "First the store and its customers, what they ask at the counter; then how the big outdoor brands talk about the terrain. The site map came before the design." }] },
        { h: "A palette from the terrain", paras: [{ p: "Earthy khakis and deep browns instead of the washed-out green, a simple mountain for a logo, custom pictograms." }] },
        { h: "Making people want to go", paras: [{ p: "Full-bleed images, large titles, direct access to categories: every screen pushes further. The identity extends to the store: signage, bags, loyalty cards." }] },
        { h: "A spontaneous pitch", paras: [{ p: "Pitched in store, the project was liked, with no budget to go further. It remains a demonstration of what the store could be." }] },
      ],
    },
  },
];
export const projects: Project[] = all.filter((p) => !p.hidden);
