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
      lead: "Un blason est un texte. Je lui ai appris à s'écrire tout seul.",
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
      lead: "A coat of arms is a text. I taught it to write itself.",
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
      lead: "Un château, pour abriter le travail des autres.",
      sections: [
        { h: "Un château pour abriter", paras: [{ p: "Kerningkastle, c'est la recherche ; le studio, son écho en français, abrite le travail de commande. Deux lieux, une même enceinte." }] },
        { h: "Le signe plutôt que le nom", paras: [{ p: "D'autres « château » existent déjà : l'identité se distingue par la forme, des parenthèses et un ™ portés comme un style, sans changer de nom." }] },
        { h: "Un lettrage construit", paras: [{ p: "Le lettrage est en dessin : géométrique, sobre, dans la lignée du design suisse." }] },
        { h: "Ce que propose le studio", paras: [{ p: "Des directions artistiques complètes, des identités visuelles et des sites, du premier signe aux fichiers sources livrés." }] },
        { h: "En cours", paras: [{ p: "Viendront la papeterie, le deck, les devis et le site du studio." }] },
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
      lead: "A castle, to house other people's work.",
      sections: [
        { h: "A castle to shelter work", paras: [{ p: "Kerningkastle is the research; the studio, its echo in French, shelters commissioned work. Two places within the same walls." }] },
        { h: "The sign rather than the name", paras: [{ p: "Other “château” studios already exist: the identity stands out by its form, with parentheses and a ™ worn as a style, without changing the name." }] },
        { h: "Constructed lettering", paras: [{ p: "The lettering is being drawn: geometric, restrained, in the line of Swiss design." }] },
        { h: "What the studio offers", paras: [{ p: "Complete art directions, visual identities and websites, from the first sign to the delivered source files." }] },
        { h: "In progress", paras: [{ p: "Next come the stationery, the deck, the quotes and the studio's website." }] },
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
      lead: "Une pochette s'écoute avant de se dessiner.",
      sections: [
        { h: "Un collectif pour commencer", paras: [{ p: "Tout est parti d'un collectif, que je dirigeais avec ses deux fondateurs et dont j'étais le graphiste. Ses pochettes ont circulé, le bouche-à-oreille a fait le reste : d'autres artistes ont suivi." }] },
        { h: "Écouter avant de dessiner", paras: [{ p: "Chaque sortie, je l'écoute en boucle en notant des mots ; les paroles et les thèmes évoqués guident le reste, avec une référence forte trouvée en veille." }] },
        { h: "Le lettrage dessiné", paras: [{ p: "Presque toujours un titre dessiné à la main, jamais tiré d'une fonte, mêlé à une image très travaillée : une forme faite pour cette sortie et aucune autre." }] },
        { h: "Penser l'objet", paras: [{ p: "Les matières arrivent avec l'objet : la pochette se pense dans la main avant d'être une vignette, relief, découpe, papier. Puis elle se décline, du dos au merch." }] },
        { h: "Jusqu'à la scène", paras: [{ p: "L'identité se met ensuite à bouger : des visuels projetés en direct sous TouchDesigner, notamment à la Gaîté Lyrique. Plus de vingt identités, montrées ici sans noms ni titres." }] },
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
      lead: "A sleeve is heard before it is drawn.",
      sections: [
        { h: "It started with a collective", paras: [{ p: "It all began with a collective I ran with its two founders, as its designer and art director. Its sleeves got around, word of mouth did the rest: other artists followed." }] },
        { h: "Listening before drawing", paras: [{ p: "I listen to each release on repeat, noting words; the lyrics and themes guide the rest, along with one strong reference found while digging." }] },
        { h: "Drawn lettering", paras: [{ p: "Almost always a title drawn by hand, never taken from a font, blended with a carefully crafted image: a shape made for this release and no other." }] },
        { h: "Thinking in objects", paras: [{ p: "Materials come with the object: a sleeve is thought of in the hand before it becomes a thumbnail, emboss, die-cut, paper. Then it extends, from the back cover to the merch." }] },
        { h: "All the way to the stage", paras: [{ p: "Then the identity starts to move: visuals projected live with TouchDesigner, including at La Gaîté Lyrique. Over twenty identities, shown here without names or titles." }] },
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
      lead: "Une écriture qui ne se lit ni de gauche à droite, ni de haut en bas.",
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
      lead: "A script that reads neither left to right nor top to bottom.",
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
      lead: "Pour une fois, le client, c'était moi.",
      sections: [
        { h: "Partager un terrain", paras: [{ p: "La montagne depuis l'enfance, le Pays basque, la préparation du diplôme d'accompagnateur : kern.outdoor partage ce terrain depuis 2023, d'abord sans direction artistique." }] },
        { h: "Un nom à double sens", paras: [{ p: "Kern, pour le kerning des typographes et pour le cairn, ce tas de pierres qui balise un sentier. Mon métier et mon terrain dans un même mot." }] },
        { h: "Le moment d'une DA", paras: [{ p: "En février 2026, le compte grandissait : il fallait une cohérence, produire plus vite, et appliquer à moi-même ce que je fais pour les autres." }] },
        { h: "Le titre et la palette", paras: [{ p: "On reconnaît le compte à deux choses fixes : un grand titrage et une palette. Tout le reste, carrousels, vidéos face caméra et tournées en randonnée, s'y accroche." }] },
        { h: "Tout fait seul", paras: [{ p: "Écriture, tournage, montage, graphisme : un système pensé pour produire vite sans perdre la cohérence, et le conseil toujours avant le produit." }] },
      ],
    },
    en: {
      title: 'kern.outdoor',
      short: 'Art direction for an outdoor media',
      meta: { year: '2023 —', context: 'Personal project, self-produced, non-commercial', role: 'Art direction, identity, writing, filming, editing', tools: '—' },
      lead: "For once, the client was me.",
      sections: [
        { h: "Sharing a terrain", paras: [{ p: "Mountains since childhood, the Basque Country, training for the mountain-leader diploma: kern.outdoor has shared this terrain since 2023, at first without art direction." }] },
        { h: "A name with two meanings", paras: [{ p: "Kern, for the typographer's kerning and for the cairn, the pile of stones that marks a trail. My trade and my terrain in a single word." }] },
        { h: "Time for an art direction", paras: [{ p: "In February 2026 the account was growing: it needed consistency, faster production, and me applying to myself what I do for others." }] },
        { h: "The title and the palette", paras: [{ p: "The account is recognised by two fixed things: large titling and a palette. Everything else, carousels, face-camera videos and videos shot on the trail, hangs on them." }] },
        { h: "All done alone", paras: [{ p: "Writing, filming, editing, design: a system built to produce fast without losing consistency, with advice always before product." }] },
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
      lead: "Un écusson doit tenir à vingt pixels comme sur un maillot.",
      sections: [
        { h: "Une commande du club", paras: [{ p: "BMS forme des jeunes et aligne des joueurs classés en jeux de combat. Son site daté et sa boutique à part ne le montraient pas : le club est venu me chercher en 2023." }] },
        { h: "Trois sources", paras: [{ p: "Les initiales du club, l'univers des jeux (écrans de sélection, fiches de personnages, lettrages d'arcade) et les codes du sport classique : de quoi parler aux joueurs comme aux supporters." }] },
        { h: "Tenir en petit", paras: [{ p: "Une identité e-sport vit surtout en minuscule : avatar, overlay de stream, onglet. Tout a été dessiné pour rester lisible à quelques pixels." }] },
        { h: "Jusqu'au maillot", paras: [{ p: "La même grammaire passe au textile : le maillot et la boutique prolongent les fiches joueurs, construites comme des personnages." }] },
        { h: "Livré, jamais lancé", paras: [{ p: "Un seul parcours pour le site et la boutique, un système de composants en sombre comme en clair. Le club a changé de direction avant la mise en ligne." }] },
      ],
    },
    en: {
      title: 'BMS E-Sport',
      short: 'Website and store',
      meta: { year: '2023', context: 'Client commission', role: 'Art direction, UX/UI, web design', tools: 'Figma' },
      lead: "A crest has to hold at twenty pixels and on a jersey.",
      sections: [
        { h: "Commissioned by the club", paras: [{ p: "BMS trains young players and fields ranked ones in fighting games. Its dated website and separate store did not show it, so the club came to me in 2023." }] },
        { h: "Three sources", paras: [{ p: "The club's initials, the world of the games (select screens, character sheets, arcade lettering) and the codes of traditional sport: enough to speak to players and fans alike." }] },
        { h: "Holding up small", paras: [{ p: "An esports identity mostly lives tiny: avatar, stream overlay, browser tab. Everything was drawn to stay legible at a few pixels." }] },
        { h: "All the way to the jersey", paras: [{ p: "The same grammar moves onto fabric: the jersey and the store extend the player profiles, built like characters." }] },
        { h: "Delivered, never launched", paras: [{ p: "One journey for the website and the store, a component system in dark and light. The club changed direction before going live." }] },
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
      lead: "Personne ne me l'a demandé. Je l'ai fait pour un magasin que j'aimais.",
      sections: [
        { h: "Aider un magasin du coin", paras: [{ p: "Un magasin indépendant que je connais bien, une équipe que j'avais envie d'aider, et pour moi l'exercice d'une refonte complète : j'ai repris l'identité et le site de moi-même." }] },
        { h: "Observer avant de dessiner", paras: [{ p: "D'abord le magasin et ce que les clients demandent au comptoir, puis la façon dont les grandes marques outdoor parlent de terrain. L'arborescence est venue avant le design." }] },
        { h: "Une palette de terrain", paras: [{ p: "Au cœur du projet, des kakis terreux et des bruns profonds à la place d'un vert délavé. Autour, une montagne simple pour logo et des pictogrammes maison." }] },
        { h: "Donner envie de partir", paras: [{ p: "Des images plein cadre, un grand titrage, un accès direct aux catégories : chaque écran pousse au départ. L'identité gagne le magasin, de l'affichage aux sacs." }] },
        { h: "Un pitch spontané", paras: [{ p: "Présenté en boutique, le projet a plu, sans budget pour aller plus loin. Il reste une démonstration de ce que le magasin pourrait être." }] },
      ],
    },
    en: {
      title: 'Sports Aventure®',
      short: 'Unsolicited redesign',
      meta: { year: '2024', context: 'Self-initiated, pitched to the store', role: 'Art direction, identity, UX/UI', tools: 'Figma, Illustrator, Photoshop' },
      lead: "Nobody asked. I did it for a shop I loved.",
      sections: [
        { h: "Helping a local shop", paras: [{ p: "An independent shop I know well, a team I wanted to help, and for me the exercise of a full redesign: I took on the identity and the website on my own initiative." }] },
        { h: "Observing before drawing", paras: [{ p: "First the shop and what customers ask at the counter, then how the big outdoor brands talk about terrain. The site map came before the design." }] },
        { h: "A palette from the field", paras: [{ p: "At the heart of it, earthy khakis and deep browns in place of a washed-out green. Around them, a simple mountain as a logo and custom pictograms." }] },
        { h: "Making you want to leave", paras: [{ p: "Full-bleed images, large titles, direct access to categories: every screen pushes you out the door. The identity reaches the shop, from signage to bags." }] },
        { h: "An unsolicited pitch", paras: [{ p: "Presented in store, the project was well received, with no budget to go further. It remains a demonstration of what the shop could be." }] },
      ],
    },
  },
];
export const projects: Project[] = all.filter((p) => !p.hidden);
