// Études de cas, dans l'ordre choisi le 08/11 : Heraldry, (ChâteauStudio)™, Identités musicales, ASAPHR, kern.outdoor, BMS, Sports Aventure. Même gabarit pour toutes :
// en-tête (meta) · accroche (lead) · sections (Point de départ, Ce qui a été fait / Méthode, Choix clés, Résultat, Statut).
// `draft: true` affiche un badge « à valider » tant que le texte n'est pas validé.

type Para = { t?: string; p: string };
type Section = { r?: string; h: string; paras: Para[] }; // r : rubrique fixe de l'étude de cas (contexte, enjeu, démarche, réponse, suite)
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
      lead: "Un blason est un texte{m:depuis le XIIe siècle}. Je lui ai appris à s'écrire tout seul{m:ou presque}.",
      sections: [
        { r: "contexte", h: "Un blason est un texte", paras: [{ p: "Un traité d'héraldique, une soirée de lecture : je découvre que chaque blason se décrit en une phrase codée, le blasonnement." }] },
        { r: "enjeu", h: "Huit siècles de règles", paras: [{ p: "Si un blason est un texte, un programme peut l'écrire. Encore fallait-il qu'il respecte la loi du blason, sans produire un seul écu faux." }] },
        { r: "démarche", h: "Une soirée, des centaines d'écus", paras: [{ p: "Un premier générateur en p5.js, puis les règles apprises une à une et codées : partitions, émaux, meubles redessinés d'après les armoriaux." }] },
        { r: "réponse", h: "Le noir et blanc des graveurs", paras: [{ p: "La couleur faisait jeu vidéo{m:vraiment}. Je passe aux hachures des graveurs, qui codent déjà chaque émail en noir et blanc." }] },
        { r: "suite", h: "Le papier arrête le code", paras: [{ p: "Un script compose seul les 500 pages du livre, chaque écu scellé par sa clé. Le livre cherche aujourd'hui son éditeur." }] },
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
      lead: "A coat of arms is a text{m:since the 12th century}. I taught it to write itself{m:almost}.",
      sections: [
        { r: "context", h: "A coat of arms is a text", paras: [{ p: "A heraldry treatise, an evening of reading: I discover that every coat of arms can be described in a single coded sentence: the blazon." }] },
        { r: "challenge", h: "Eight centuries of rules", paras: [{ p: "If a coat of arms is a text, a program can write it. It still had to obey the law of heraldry, without producing a single wrong shield." }] },
        { r: "process", h: "One evening, hundreds of shields", paras: [{ p: "A first generator in p5.js, then the rules learned one by one and coded: partitions, tinctures, charges redrawn from armorials." }] },
        { r: "response", h: "The engravers' black and white", paras: [{ p: "Colour looked like a video game{m:really}. I switch to the engravers' hatching, which already codes every tincture in black and white." }] },
        { r: "what's next", h: "Paper stops the code", paras: [{ p: "A script composes the book's 500 pages on its own, each shield sealed by its key. The book is now looking for a publisher." }] },
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
      lead: "Un château{m:sans douves}, pour abriter le travail des autres.",
      sections: [
        { r: "contexte", h: "Un château pour les autres", paras: [{ p: "Kerningkastle, c'est la recherche. Il fallait un lieu pour le travail de commande : le studio, son écho en français." }] },
        { r: "enjeu", h: "Un nom déjà pris", paras: [{ p: "D'autres « château » existent déjà en ligne. Il fallait se distinguer sans changer de nom, et inspirer confiance à un client." }] },
        { r: "démarche", h: "Le signe plutôt que le nom", paras: [{ p: "Des parenthèses et un ™ portés comme un style ; un lettrage géométrique, dans la lignée du design suisse, en cours de dessin." }] },
        { r: "réponse", h: "Une offre lisible", paras: [{ p: "Des directions artistiques complètes, des identités visuelles et des sites, du premier signe aux fichiers sources livrés." }] },
        { r: "suite", h: "En cours", paras: [{ p: "Viendront la papeterie, le deck, les devis et le site du studio." }] },
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
      lead: "A castle{m:no moat}, to house other people's work.",
      sections: [
        { r: "context", h: "A castle to shelter work", paras: [{ p: "Kerningkastle is the research. Commissioned work needed a place of its own: the studio, its echo in French." }] },
        { r: "challenge", h: "A name already taken", paras: [{ p: "Other “château” studios already exist online. It had to stand out without changing its name, and earn a client's trust." }] },
        { r: "process", h: "The sign rather than the name", paras: [{ p: "Parentheses and a ™ worn as a style; geometric lettering in the line of Swiss design, being drawn." }] },
        { r: "response", h: "A clear offer", paras: [{ p: "Complete art directions, visual identities and websites, from the first sign to the delivered source files." }] },
        { r: "what's next", h: "In progress", paras: [{ p: "Next come the stationery, the deck, the quotes and the studio's website." }] },
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
      lead: "Une pochette, je l'écoute{m:en boucle} avant de la dessiner.",
      sections: [
        { r: "contexte", h: "Un collectif pour commencer", paras: [{ p: "J'étais le graphiste d'un collectif, que je dirigeais avec ses deux fondateurs. Ses pochettes ont circulé, d'autres artistes ont suivi." }] },
        { r: "enjeu", h: "Une sortie, une identité", paras: [{ p: "Des budgets underground, des sorties qui s'enchaînent : chacune devait avoir sa propre forme, de la pochette jusqu'à la scène." }] },
        { r: "démarche", h: "Écouter avant de dessiner", paras: [{ p: "J'écoute chaque sortie en boucle en notant des mots ; les paroles, les thèmes et une référence forte guident le reste." }] },
        { r: "réponse", h: "Le lettrage et l'objet", paras: [{ p: "Un titre dessiné à la main, jamais tiré d'une fonte, mêlé à une image très travaillée. Les matières arrivent avec l'objet : relief, découpe, papier." }] },
        { r: "suite", h: "Jusqu'à la scène", paras: [{ p: "L'identité se met ensuite à bouger, en visuels projetés en direct sous TouchDesigner. Plus de vingt identités, montrées ici sans noms." }] },
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
      lead: "A sleeve, I listen to it{m:on repeat} before I draw it.",
      sections: [
        { r: "context", h: "It started with a collective", paras: [{ p: "I was the designer of a collective I ran with its two founders. Its sleeves got around, and other artists followed." }] },
        { r: "challenge", h: "One release, one identity", paras: [{ p: "Underground budgets, releases in quick succession: each needed its own form, from the sleeve all the way to the stage." }] },
        { r: "process", h: "Listening before drawing", paras: [{ p: "I listen to each release on repeat, noting words; the lyrics, the themes and one strong reference guide the rest." }] },
        { r: "response", h: "Lettering and object", paras: [{ p: "A title drawn by hand, never taken from a font, blended with a carefully crafted image. Materials come with the object: emboss, die-cut, paper." }] },
        { r: "what's next", h: "All the way to the stage", paras: [{ p: "Then the identity starts to move, in visuals projected live with TouchDesigner. Over twenty identities, shown here without names." }] },
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
      lead: "Une écriture{m:et la langue qui va avec} qui ne se lit ni de gauche à droite, ni de haut en bas.",
      sections: [
        { r: "contexte", h: "Au départ, un service", paras: [{ p: "Un ami designer cherchait des signes d'alphabet pour son jeu de cartes. Le jeu ne s'est pas fait, l'idée est restée." }] },
        { r: "enjeu", h: "Casser le sens de lecture", paras: [{ p: "Nos écritures vont de gauche à droite ou de haut en bas. Je voulais une écriture qui n'ait ni l'un ni l'autre, et qui tienne quand même." }] },
        { r: "démarche", h: "Comme chez Tolkien", paras: [{ p: "Les signes et la langue s'inventent ensemble, dans des carnets entiers, à la main avant l'écran." }] },
        { r: "réponse", h: "Tout part du centre", paras: [{ p: "Soixante glyphes monolines sur une grille de 3 × 5, lus sur un disque : la place d'un signe donne son rôle, le sceau dit d'où vient l'information." }] },
        { r: "suite", h: "En cours", paras: [{ p: "Les glyphes sont en finition dans Glyphs. Viendront un livre-objet à disques et une fonte." }] },
      ],
    },
    en: {
      title: 'ASAPHR',
      short: 'Invented script',
      meta: { year: '2026 —', context: 'Personal research', role: 'Writing system, type design', tools: 'Glyphs 4' },
      lead: "A script{m:and the language that comes with it} that reads neither left to right nor top to bottom.",
      sections: [
        { r: "context", h: "It started as a favour", paras: [{ p: "A designer friend needed alphabet signs for his card game. The game never happened; the idea stayed." }] },
        { r: "challenge", h: "Breaking the reading direction", paras: [{ p: "Our scripts run left to right or top to bottom. I wanted one that does neither, and still holds together." }] },
        { r: "process", h: "Like Tolkien", paras: [{ p: "The signs and the language are invented together, in whole notebooks, by hand before the screen." }] },
        { r: "response", h: "Everything starts at the centre", paras: [{ p: "Sixty monoline glyphs on a 3 × 5 grid, read on a disc: a sign's position gives its role, the seal tells where the information comes from." }] },
        { r: "what's next", h: "In progress", paras: [{ p: "The glyphs are being finished in Glyphs. A disc-based book-object and a typeface come next." }] },
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
      lead: "Pour une fois, le client, c'était moi{m:le plus pénible de tous}.",
      sections: [
        { r: "contexte", h: "Partager un terrain", paras: [{ p: "La montagne depuis l'enfance, le Pays basque, la préparation du diplôme d'accompagnateur : kern.outdoor partage ce terrain depuis 2023." }] },
        { r: "enjeu", h: "Sortir du flux", paras: [{ p: "Des paysages interchangeables et des tests qui ressemblent à des publicités : il fallait un compte reconnaissable au premier coup d'œil, sans budget, tenu seul." }] },
        { r: "démarche", h: "Un nom à double sens", paras: [{ p: "Kern, pour le kerning des typographes et pour le cairn qui balise un sentier. En février 2026, je bâtis la DA autour de ce qui marchait déjà : le conseil." }] },
        { r: "réponse", h: "Le titre et la palette", paras: [{ p: "Un grand titrage et une palette fixes ; carrousels, vidéos face caméra et vidéos en randonnée s'y accrochent comme une même série." }] },
        { r: "suite", h: "Tout fait seul", paras: [{ p: "Écriture, tournage, montage, graphisme : un système qui produit vite sans perdre la cohérence. Pour une fois, j'appliquais à moi-même ce que je fais pour les autres." }] },
      ],
    },
    en: {
      title: 'kern.outdoor',
      short: 'Art direction for an outdoor media',
      meta: { year: '2023 —', context: 'Personal project, self-produced, non-commercial', role: 'Art direction, identity, writing, filming, editing', tools: '—' },
      lead: "For once, the client was me{m:the most demanding of all}.",
      sections: [
        { r: "context", h: "Sharing my ground", paras: [{ p: "Mountains since childhood, the Basque Country, training for the mountain-leader diploma: kern.outdoor has shared this terrain since 2023." }] },
        { r: "challenge", h: "Getting out of the feed", paras: [{ p: "Interchangeable landscapes and reviews that look like ads: the account had to be recognisable at a glance, with no budget, run alone." }] },
        { r: "process", h: "A name with two meanings", paras: [{ p: "Kern, for the typographer's kerning and for the cairn that marks a trail. In February 2026, I built the art direction around what already worked: advice." }] },
        { r: "response", h: "The title and the palette", paras: [{ p: "Bold, fixed titling and a set palette; carousels, face-camera videos and trail videos hang on them like one series." }] },
        { r: "what's next", h: "All done alone", paras: [{ p: "Writing, filming, editing, design: a system that produces fast without losing consistency. For once, I applied to myself what I do for others." }] },
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
      lead: "Un écusson doit tenir à vingt pixels{m:un avatar de stream} comme sur un maillot.",
      sections: [
        { r: "contexte", h: "Une commande du club", paras: [{ p: "BMS forme des jeunes et aligne des joueurs classés en jeux de combat. Le club m'a contacté en 2023." }] },
        { r: "enjeu", h: "Un club au-dessus de son image", paras: [{ p: "Un site daté, une boutique à part : rien ne montrait le niveau des joueurs, ni ne donnait envie d'acheter le maillot." }] },
        { r: "démarche", h: "Trois sources", paras: [{ p: "Les initiales du club, l'univers des jeux (écrans de sélection, fiches de personnages) et les codes du sport classique." }] },
        { r: "réponse", h: "Tenir à vingt pixels", paras: [{ p: "Une identité lisible en avatar de stream comme sur un maillot, un seul parcours pour le site et la boutique, des fiches joueurs construites comme des personnages." }] },
        { r: "suite", h: "Livré, jamais lancé", paras: [{ p: "Le club a changé de direction avant la mise en ligne. Il reste un système complet, prêt à être développé." }] },
      ],
    },
    en: {
      title: 'BMS E-Sport',
      short: 'Website and store',
      meta: { year: '2023', context: 'Client commission', role: 'Art direction, UX/UI, web design', tools: 'Figma' },
      lead: "A crest has to work at twenty pixels{m:a stream avatar} as well as on a jersey.",
      sections: [
        { r: "context", h: "Commissioned by the club", paras: [{ p: "BMS trains young players and fields ranked ones in fighting games. The club contacted me in 2023." }] },
        { r: "challenge", h: "A club above its image", paras: [{ p: "A dated website, a separate store: nothing showed the players' level, or made you want to buy the jersey." }] },
        { r: "process", h: "Three sources", paras: [{ p: "The club's initials, the world of the games (select screens, character sheets) and the codes of traditional sport." }] },
        { r: "response", h: "Holding up at twenty pixels", paras: [{ p: "An identity legible as a stream avatar and on a jersey, one user journey for both the website and the store, player profiles built like characters." }] },
        { r: "what's next", h: "Delivered, never launched", paras: [{ p: "The club changed direction before going live. What remains is a complete system, ready to be built." }] },
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
      lead: "Personne ne me l'a demandé{m:c'est souvent comme ça que ça commence}. Je l'ai fait pour un magasin que j'aimais.",
      sections: [
        { r: "contexte", h: "Un magasin du coin", paras: [{ p: "Un magasin outdoor indépendant de Bordeaux, que je fréquentais quand j'y habitais, et une équipe que j'avais envie d'aider." }] },
        { r: "enjeu", h: "Un site plus faible que le magasin", paras: [{ p: "En rayon, un vrai esprit d'aventure ; en ligne, un vert délavé et un catalogue. Le site ne donnait pas envie de partir." }] },
        { r: "démarche", h: "Observer avant de dessiner", paras: [{ p: "Le comptoir et ce que les clients y demandent, puis la façon dont les grandes marques outdoor parlent de terrain. L'arborescence avant le design." }] },
        { r: "réponse", h: "Une palette de terrain", paras: [{ p: "Des kakis terreux et des bruns profonds, une montagne simple pour logo, des images plein cadre : chaque écran pousse au départ." }] },
        { r: "suite", h: "Un pitch spontané", paras: [{ p: "Présenté en boutique, le projet a plu, sans budget pour aller plus loin. Il reste une démonstration de ce que le magasin pourrait être." }] },
      ],
    },
    en: {
      title: 'Sports Aventure®',
      short: 'Unsolicited redesign',
      meta: { year: '2024', context: 'Self-initiated, pitched to the store', role: 'Art direction, identity, UX/UI', tools: 'Figma, Illustrator, Photoshop' },
      lead: "Nobody asked{m:that's often how it starts}. I did it for a shop I loved.",
      sections: [
        { r: "context", h: "A local shop", paras: [{ p: "An independent outdoor shop in Bordeaux that I went to when I lived there, and a team I wanted to help." }] },
        { r: "challenge", h: "A website weaker than the shop", paras: [{ p: "In store, a real spirit of adventure; online, a washed-out green and a catalogue. The website didn't make you want to head out." }] },
        { r: "process", h: "Observing before drawing", paras: [{ p: "The counter and what customers ask there, then how the big outdoor brands talk about terrain. Site map before design." }] },
        { r: "response", h: "A palette from the field", paras: [{ p: "Earthy khakis and deep browns, a simple mountain as a logo, full-bleed images: every screen pushes you out the door." }] },
        { r: "what's next", h: "An unsolicited pitch", paras: [{ p: "Presented in store, the project was well received, with no budget to go further. It remains a demonstration of what the shop could be." }] },
      ],
    },
  },
];
export const projects: Project[] = all.filter((p) => !p.hidden);
