// Études de cas, dans l'ordre choisi le 08/11 : Heraldry, (ChâteauStudio)™, Musique (ex-Identités musicales), ASAPHR, kern.outdoor, BMS, Sports Aventure.
// Chacune : en-tête (meta) · accroche (lead, note) · sections dans l'ordre des écrans de sa mise en page propre (src/components/case/).

type Para = { t?: string; p: string };
type Section = { r?: string; h: string; paras: Para[] }; // r : libellé de l'écran, h : gros texte, paras[0].p : la note
type Content = {
  title: string;
  short: string; // sous-titre des cartes
  meta: { year: string; context: string; role: string; tools: string };
  lead: string;
  note?: string;     // petite note sous l'accroche (écran « en bref »)
  sections: Section[];
};
export type Tag = 'I' | 'T' | 'G' | 'W' | 'E' | 'P';
export type Project = {
  hidden?: boolean;   // masqué partout tant que le projet n'existe pas encore
  wip?: boolean;      // en travaux : mention « (en travaux) » dans la liste et sur la scène
  slug: string;
  years: number[];    // [début] ou [début, fin] — vide si inconnu
  preview?: string;   // image ou vidéo (.mp4) d'aperçu au survol, dans /public/previews/
  tags: Tag[];        // I identité · T type · G génératif · W web · E édition · P print
  yearLabel: string;  // année affichée dans les listes
  object: 'book' | 'rock' | 'vinyl' | 'rook' | 'controller' | 'stick' | 'bottle' | 'compass' | 'feather' | 'backpack' | 'crest' | 'castle'; // objet de la page Projets
  generator?: string; // générateur jouable intégré à l'étude
  en: Content;
  fr: Content;
};

const all: Project[] = [
  // ---------------------------------------------------------------- algorithmic-heraldry
  // Textes du 17/11 (cadrage du jour, chiffres tirés du manuscrit : algorithmic-heraldry-manuscrit/). Recherche personnelle,
  // pour les studios de création. Mise en page propre : case/AlgorithmicHeraldry.astro ; écus et meubles : tools/heraldry-shots.mjs.
  {
    slug: 'algorithmic-heraldry',
    wip: true,
    years: [2025],
    tags: ['G', 'E'],
    yearLabel: '2025',
    object: 'book',
    generator: '/lab/heraldry/index.html',
    fr: {
      title: 'Algorithmic Heraldry',
      short: 'Générateur & livre de 500 pages',
      meta: { year: '2025', context: 'Recherche personnelle', role: 'Conception, code, dessin, édition', tools: 'p5.js, Python, Illustrator, InDesign' },
      lead: "Un générateur de blasons et un livre de 500 pages, écrits à partir des règles de l'héraldique.",
      note: "Recherche personnelle, 2025 : d'un livre de Michel Pastoureau à un système capable de plus de vingt mille milliards d'écus, tous dans les règles.",
      sections: [
        { r: "le point de départ", h: "Trop d'écus pour les dessiner à la main", paras: [{ p: "Chaque blason est une identité construite avec des règles strictes, l'équivalent médiéval d'une identité de marque. Les itérer à la main prenait trop de temps : un script s'en est chargé, à partir de formes et de figures dessinées à l'avance." }] },
        { r: "la grammaire", h: "Un vocabulaire fermé, dessiné à la main", paras: [{ p: "Six formes d'écu, neuf partitions, onze meubles redessinés sur Illustrator, vingt-trois devises latines et quatre angles de trame : assez pour plus de vingt mille milliards de compositions différentes." }] },
        { r: "le contraste", h: "Noir et blanc, sans exception", paras: [{ p: "La règle des émaux interdit de poser un métal sur un métal ou une couleur sur une couleur. Le programme la pousse jusqu'au bout : dès qu'une forme en recouvre une autre, la zone s'inverse. Les hachures reprennent celles des graveurs du XVIIe siècle." }] },
        { r: "la grille", h: "Quatre points d'ancrage", paras: [{ p: "Les meubles se posent sur quatre ancrages fixes, à 35 % et 65 % de l'écu. Le premier tiré devient la figure principale et prend plus de place ; deux cellules peuvent rester vides, pour que l'écu respire." }] },
        { r: "la clé", h: "Dix caractères pour retrouver un écu", paras: [{ p: "Chaque écu a sa clé, en base 36. On la tape, l'écu se reconstruit à l'identique ; on change un seul caractère, et c'est un autre écu. Contrairement à une image d'IA, tout repose sur des règles écrites une à une, lisibles, imprimées dans le livre." }] },
        { r: "le livre", h: "336 pages que personne n'a choisies", paras: [{ p: "Le texte est mis en page sur InDesign, les pages d'écus par un script Python : des clés tirées au hasard, compilées sans tri, puis un index qui rend à chaque écu son nom. Le code complet est imprimé en annexe. Le livre cherche aujourd'hui son éditeur." }] },
        { r: "les erreurs", h: "Corriger la règle, jamais l'image", paras: [{ p: "Le moteur n'a longtemps su produire qu'une soixantaine de millions d'écus, et 93 % gardaient un filet parasite entre deux bords. Aucune image n'a été retouchée : chaque défaut a été réglé par une règle." }] },
      ],
    },
    en: {
      title: 'Algorithmic Heraldry',
      short: 'Generator & 500-page book',
      meta: { year: '2025', context: 'Personal research', role: 'Concept, code, drawing, publishing', tools: 'p5.js, Python, Illustrator, InDesign' },
      lead: "A coat-of-arms generator and a 500-page book, written from the rules of heraldry.",
      note: "Personal research, 2025: from a book by Michel Pastoureau to a system capable of more than twenty trillion shields, all within the rules.",
      sections: [
        { r: "the starting point", h: "Too many shields to draw by hand", paras: [{ p: "Every coat of arms is an identity built with strict rules, the medieval equivalent of a brand identity. Iterating them by hand took too long, so a script took over, from shapes and figures drawn beforehand." }] },
        { r: "the grammar", h: "A closed vocabulary, drawn by hand", paras: [{ p: "Six shield shapes, nine partitions, eleven charges redrawn in Illustrator, twenty-three Latin mottos and four hatching angles: enough for more than twenty trillion different compositions." }] },
        { r: "contrast", h: "Black and white, no exceptions", paras: [{ p: "The rule of tinctures forbids metal on metal and colour on colour. The program takes it all the way: whenever one shape covers another, the area inverts. The hatching comes from seventeenth-century engravers." }] },
        { r: "the grid", h: "Four anchor points", paras: [{ p: "Charges sit on four fixed anchors, at 35% and 65% of the shield. The first one drawn becomes the main figure and takes more room; two cells can stay empty, so the shield can breathe." }] },
        { r: "the key", h: "Ten characters to find a shield", paras: [{ p: "Every shield has its key, in base 36. Type it and the shield is rebuilt identically; change a single character and it is another shield. Unlike an AI image, everything rests on rules written one by one, readable, printed in the book." }] },
        { r: "the book", h: "336 pages nobody chose", paras: [{ p: "The text is laid out in InDesign, the shield pages by a Python script: keys drawn at random, compiled without sorting, then an index that gives every shield its name back. The full code is printed as an appendix. The book is now looking for a publisher." }] },
        { r: "mistakes", h: "Fix the rule, never the image", paras: [{ p: "For a long time the engine could only produce some sixty million shields, and 93% kept a stray hairline between two edges. No image was retouched: every flaw was fixed with a rule." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- chateau-studio
  // Textes du 17/11 (cadrage du jour ; résumé dans Notion › Études de cas › ChâteauStudio) : la future micro-entreprise, identité
  // commerciale à dessiner de A à Z. Pas de concurrence de nom (faux), pas d'explication des parenthèses. Mise en page :
  // case/ChateauStudio.astro (emplacements gris jusqu'aux médias).
  {
    slug: 'chateau-studio',
    wip: true,
    years: [2026],
    tags: ['I'],
    yearLabel: '2026',
    object: 'castle',
    fr: {
      title: '(ChâteauStudio)™',
      short: "Identité d'un studio",
      meta: { year: '2026 —', context: 'Identité de studio', role: 'Naming, identité, direction artistique', tools: '—' }, // outils : à compléter quand l'identité sera dessinée
      lead: "L'identité commerciale d'un studio de design indépendant, pensée pour donner un cadre clair au travail de commande.",
      note: "En cours, 2026 : la structure qui porte les projets clients, à côté de la recherche signée Kerningkastle.",
      sections: [
        { r: "le rôle", h: "Une structure plutôt qu'un nom d'artiste", paras: [{ p: "Kerningkastle signe la recherche et le travail personnel. ChâteauStudio porte la commande : un interlocuteur identifié, distinct de la personne, sous lequel facturer, cadrer chaque projet et, si besoin, s'entourer d'autres créatifs." }] },
        { r: "le cadre", h: "Un déroulé annoncé avant le premier croquis", paras: [{ p: "Devis, étapes, livrables : chaque projet suit le même déroulé, posé dès le départ. L'identité doit faire sentir cette rigueur avant même le premier échange, là où un client attend souvent un artiste difficile à cadrer." }] },
        { r: "le nom", h: "Le château, en écho", paras: [{ p: "ChâteauStudio répond à Kerningkastle : la même image, dans une autre langue, pour une autre fonction. La recherche d'un côté, la commande de l'autre, reconnaissables comme une seule signature." }] },
        { r: "l'offre", h: "Les métiers d'une identité, sous une seule porte", paras: [{ p: "Direction artistique, identité visuelle, site, pochettes : les mêmes savoir-faire que le reste du portfolio, réunis derrière une seule adresse et un seul interlocuteur." }] },
        { r: "en cours", h: "Une identité dessinée de A à Z", paras: [{ p: "Le logo, la papeterie, les modèles de devis et de présentation et le site du studio sont en cours de dessin." }] },
      ],
    },
    en: {
      title: '(ChâteauStudio)™',
      short: 'Studio identity',
      meta: { year: '2026 —', context: 'Studio identity', role: 'Naming, identity, art direction', tools: '—' },
      lead: "The commercial identity of an independent design studio, built to give client work a clear frame.",
      note: "In progress, 2026: the structure behind client projects, alongside the research signed Kerningkastle.",
      sections: [
        { r: "the role", h: "A structure rather than an artist name", paras: [{ p: "Kerningkastle signs the research and personal work. ChâteauStudio carries the commissions: an identified point of contact, separate from the person, under which to invoice, frame each project and, when needed, bring in other creatives." }] },
        { r: "the frame", h: "A process set out before the first sketch", paras: [{ p: "Quote, stages, deliverables: every project follows the same process, set from the start. The identity has to convey that rigour before the first conversation, where clients often expect an artist who is hard to pin down." }] },
        { r: "the name", h: "The castle, as an echo", paras: [{ p: "ChâteauStudio answers Kerningkastle: the same image, in another language, for another purpose. Research on one side, commissions on the other, recognisable as a single signature." }] },
        { r: "the offer", h: "The crafts of an identity, through one door", paras: [{ p: "Art direction, visual identity, websites, record covers: the same skills as the rest of the portfolio, gathered behind one address and one point of contact." }] },
        { r: "in progress", h: "An identity drawn from scratch", paras: [{ p: "The logo, stationery, quote and presentation templates and the studio's website are being designed." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- music-identities
  // Textes du 17/11 (registre pro, cadrage du jour) : aucun nom d'artiste cité ni mis en avant (un titre visible sur une
  // pochette reste). Mise en page propre : case/MusicIdentities.astro (une identité par écran, dans l'ordre des sections).
  {
    slug: 'music-identities',
    wip: true,
    years: [2020, 2026],
    tags: ['I', 'T'],
    yearLabel: '2020–26',
    object: 'vinyl',
    fr: {
      title: 'Musique',
      short: 'Du lettrage au vinyle',
      meta: { year: 'Depuis 2020', context: "Collectif d'artistes, puis artistes indépendants", role: 'Direction artistique, identité, lettrage, print, merch', tools: 'Illustrator, Photoshop, Procreate, TouchDesigner' },
      lead: "Identités visuelles de sorties hip-hop et électro underground, de la pochette au merch.",
      note: "Paris, depuis 2020 : direction artistique visuelle d'un collectif d'une vingtaine d'artistes, puis de dizaines d'artistes indépendants venus à sa suite.",
      sections: [
        { r: "le rôle", h: "Une sortie, conçue de A à Z", paras: [{ p: "Pochettes, logos, typographies, images, réseaux sociaux, merch : chaque projet est pensé en entier. Le projet écouté en boucle et deux ou trois mots de l'artiste suffisent à fixer une direction, explorée en plusieurs pistes avant la bonne." }] },
        { r: "le lettrage", h: "Des titres dessinés, jamais composés en fonte", paras: [{ p: "Chaque titre est dessiné sur iPad ou sur Illustrator, pour porter la tonalité du projet au même titre que l'image." }] },
        { r: "200", h: "Des étoiles et leurs coordonnées", paras: [{ p: "Pour un album de douze titres et une dizaine d'invités, l'artiste voulait retrouver les relevés astronomiques : un nuage de points modélisé en 3D sur fond noir, puis une identité déclinée sous Photoshop, de la pochette au merch." }] },
        { r: "oblivion", h: "Kingdom Hearts, revu en 3D", paras: [{ p: "La forteresse est modélisée avec un artiste 3D puis stylisée, et le titre dessiné sur Illustrator dans le même registre. L'affiche a été imprimée et vendue en concert." }] },
        { r: "von", h: "Derrière un écran cathodique", paras: [{ p: "Une référence à Serial Experiments Lain : l'artiste, modélisé en 3D puis stylisé, apparaît derrière l'écran, et le titre est tracé à la main sur iPad, à même la dalle." }] },
        { r: "somebody else", h: "Une pochette tirée du clip", paras: [{ p: "Pas de budget pour une séance photo : les images viennent du clip, traitées en bichromie bleue, et le titre est dessiné." }] },
        { r: "la bête", h: "La Bête, un titre en relief", paras: [{ p: "Pour un EP à l'univers médiéval et mythologique, titre et constellations sont gaufrés : d'abord simulés sous Photoshop, puis testés sur papier. Le vinyle n'a jamais dépassé le prototype." }] },
        { r: "le temps réel", h: "L'identité se met à bouger", paras: [{ p: "Des visuels génératifs sous TouchDesigner, qui réagissent au son, prolongent l'identité en direct." }] },
        { r: "les résultats", h: "Des artistes qui reviennent, et qui montent", paras: [{ p: "Trois, quatre, cinq projets d'affilée pour les mêmes artistes, et tous les pressages vendus. Les sorties paraissent sur des labels indépendants parisiens et sont relayées jusque dans des médias rap comme Booska-P ; l'un des artistes s'est classé 12e du Top Albums France l'année suivante." }] },
      ],
    },
    en: {
      title: 'Music',
      short: 'From lettering to vinyl',
      meta: { year: 'Since 2020', context: 'Artist collective, then independent artists', role: 'Art direction, identity, lettering, print, merch', tools: 'Illustrator, Photoshop, Procreate, TouchDesigner' },
      lead: "Visual identities for underground hip-hop and electronic releases, from cover to merch.",
      note: "Paris, since 2020: visual art direction for a collective of around twenty artists, then for dozens of independent artists who followed.",
      sections: [
        { r: "the role", h: "A release, designed from A to Z", paras: [{ p: "Covers, logos, typography, images, social media, merch: every project is designed as a whole. The record on repeat and two or three words from the artist are enough to set a direction, explored through several routes before the right one." }] },
        { r: "lettering", h: "Titles drawn, never set in a font", paras: [{ p: "Each title is drawn on iPad or in Illustrator, so it carries the tone of the record as much as the image does." }] },
        { r: "200", h: "Stars and their coordinates", paras: [{ p: "For a twelve-track album with around ten guests, the artist wanted the look of star surveys: a point cloud modelled in 3D on black, then an identity rolled out in Photoshop, from cover to merch." }] },
        { r: "oblivion", h: "Kingdom Hearts, rebuilt in 3D", paras: [{ p: "The fortress is modelled with a 3D artist and then stylised, the title drawn in Illustrator in the same register. The poster was printed and sold at shows." }] },
        { r: "von", h: "Behind a CRT screen", paras: [{ p: "A nod to Serial Experiments Lain: the artist, modelled in 3D and stylised, appears behind the screen, and the title is traced by hand on iPad, right on the glass." }] },
        { r: "somebody else", h: "A cover pulled from the video", paras: [{ p: "No budget for a photo shoot: the images come from the music video, treated in blue duotone, and the title is drawn." }] },
        { r: "la bête", h: "La Bête, a title in relief", paras: [{ p: "For an EP steeped in medieval myth, the title and constellations are embossed: first simulated in Photoshop, then tested on paper. The vinyl never went past the prototype." }] },
        { r: "real time", h: "The identity starts to move", paras: [{ p: "Generative visuals in TouchDesigner, reacting to sound, extend the identity live." }] },
        { r: "results", h: "Artists who come back, and rise", paras: [{ p: "Three, four, five projects in a row for the same artists, and every pressing sold out. The releases come out on independent Paris labels and reach rap media such as Booska-P; one of the artists entered the French Top Albums at number 12 the following year." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- asaphr
  // Textes du 17/11 (cadrage du jour et codex de la langue radiale ; résumé dans Notion › Études de cas › ASAPHR). Pour les
  // agences de branding, les studios de typographie et les recruteurs DA. Ni jeu de cartes, ni livre-objet (rien de tangible).
  // Mise en page propre : case/Asaphr.astro (sections dans l'ordre des écrans).
  {
    slug: 'asaphr',
    wip: true,
    years: [2026],
    tags: ['T', 'E'],
    yearLabel: '2026',
    object: 'rock',
    fr: {
      title: 'ASAPHR',
      short: 'Écriture et langue inventées',
      meta: { year: '2026 —', context: 'Recherche personnelle', role: "Système d'écriture, langue, dessin de caractères", tools: 'Glyphs 4' },
      lead: "Une écriture et sa langue, conçues ensemble comme un système, sans ligne à suivre.",
      note: "Recherche personnelle en cours, depuis 2026 : le support, les sons, la grammaire et les signes, chacun décidé en fonction des autres.",
      sections: [
        { r: "le pari", h: "Sortir de la ligne", paras: [{ p: "Toutes nos écritures avancent sur une ligne, de gauche à droite ou de haut en bas. ASAPHR part du centre d'un disque et rayonne. Changer de support change la façon de lire, donc la forme des signes, donc la langue elle-même : chaque décision en entraîne une autre." }] },
        { r: "le support", h: "Un disque plutôt qu'une page", paras: [{ p: "On lit toujours dans le même axe, à midi, du centre vers le bord ; c'est le disque qui tourne, pas l'œil qui se déplace. Seize branches au plus, pour que les signes restent lisibles près du centre. À l'écran, le défilement remplace la main." }] },
        { r: "la langue", h: "Le son annonce le sens", paras: [{ p: "Soixante syllabes en quatre familles : matière, mouvement, état, relation. Sons durs pour les objets, glissants pour les actions, doux pour les qualités : on devine la nature d'un mot avant son sens. Ni trois consonnes de suite, ni deux voyelles : chaque syllabe reste assez courte pour tenir dans un seul signe." }] },
        { r: "la grille", h: "Une seule grille, aucune exception", paras: [{ p: "Tous les signes tiennent dans la même grille de 3 × 5, d'un trait d'épaisseur constante : des axes droits et des obliques à 45°, tenus par des courbes. La rangée du haut reste vide, réservée aux chiffres : un nombre se repère sans être lu. Les signes gardent leur taille ; seul l'espace entre les branches s'ouvre vers le bord." }] },
        { r: "la syntaxe", h: "La place fait le sens", paras: [{ p: "Ni accent ni marque de cas : le rôle d'un mot dépend de sa place sur la branche. Le premier agit, le deuxième relie, le troisième subit. Quand une phrase dépend de la précédente, sa branche commence par un connecteur, contre le centre." }] },
        { r: "le sceau", h: "Une phrase dit d'où elle sait", paras: [{ p: "Chaque branche se ferme sur un sceau. Sa forme donne la source : vu, déduit ou rapporté. Son contour donne le mode : affirmer, questionner, ordonner. Trois formes, trois contours : neuf façons de finir une phrase, lisibles d'un coup d'œil sur tout le disque." }] },
        { r: "la démarche", h: "Les règles avant les signes", paras: [{ p: "Le sens de lecture s'est trouvé à la main, sur un carnet entier de croquis. Le système a ensuite été écrit en entier : chaque glyphe est redessiné dans Glyphs jusqu'à respecter la règle, et non l'inverse." }] },
        { r: "en cours", h: "Huit signes sur soixante", paras: [{ p: "Le système est complet ; le dessin des signes avance. Restent cinquante-deux glyphes, les sceaux, quatre connecteurs et la modélisation du disque." }] },
      ],
    },
    en: {
      title: 'ASAPHR',
      short: 'Invented script and language',
      meta: { year: '2026 —', context: 'Personal research', role: 'Writing system, language, type design', tools: 'Glyphs 4' },
      lead: "A script and its language, designed together as one system, with no line to follow.",
      note: "Ongoing personal research, since 2026: the medium, the sounds, the grammar and the signs, each decided in light of the others.",
      sections: [
        { r: "the bet", h: "Leaving the line", paras: [{ p: "Every script we know moves along a line, left to right or top to bottom. ASAPHR starts at the centre of a disc and radiates out. Changing the medium changes how you read, and so the shape of the signs, and so the language itself: each decision leads to the next." }] },
        { r: "the medium", h: "A disc rather than a page", paras: [{ p: "You always read along the same axis, at twelve o'clock, from the centre out; the disc turns, the eye stays put. Sixteen branches at most, so the signs stay legible near the centre. On screen, scrolling takes the place of the hand." }] },
        { r: "the language", h: "Sound signals meaning", paras: [{ p: "Sixty syllables in four families: matter, movement, state, relation. Hard sounds for objects, gliding for actions, soft for qualities: you can tell what kind of word it is before its meaning. No three consonants in a row, no two vowels: each syllable stays short enough to fit a single sign." }] },
        { r: "the grid", h: "One grid, no exceptions", paras: [{ p: "Every sign fits the same 3 × 5 grid, drawn with a constant stroke: straight axes and 45° diagonals, held together by curves. The top row stays empty, kept for numbers: a figure stands out without being read. The signs keep their size; only the space between branches opens up towards the edge." }] },
        { r: "the syntax", h: "Position makes meaning", paras: [{ p: "No accents, no case marks: a word's role depends on its place on the branch. The first acts, the second links, the third is acted upon. When a sentence depends on the previous one, its branch opens with a connector, against the centre." }] },
        { r: "the seal", h: "A sentence says how it knows", paras: [{ p: "Each branch ends on a seal. Its shape gives the source: seen, deduced or reported. Its outline gives the mode: state, ask, command. Three shapes, three outlines: nine ways to end a sentence, readable at a glance across the whole disc." }] },
        { r: "the process", h: "Rules before signs", paras: [{ p: "The reading direction was found by hand, across a whole notebook of sketches. The system was then written out in full: each glyph is redrawn in Glyphs until it follows the rule, not the other way round." }] },
        { r: "in progress", h: "Eight signs out of sixty", paras: [{ p: "The system is complete; the drawing of the signs is under way. Still to come: fifty-two glyphs, the seals, four connectors and the modelling of the disc." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- kern-outdoor
  // Textes du 17/11 : registre pro, centré sur le projet (ni anecdote personnelle ni aparté) ; chiffres TikTok relevés le
  // 17/11/2026 (kern/data.ts). Ne jamais citer l'employeur, ni les marques qui ont demandé un partenariat.
  // Mise en page propre : components/case/KernOutdoor.astro (r : libellé de l'écran, h : gros texte, p : la note).
  {
    slug: 'kern-outdoor',
    wip: true,
    years: [2023],
    tags: ['I', 'E'],
    yearLabel: '2023 —',
    object: 'backpack',
    fr: {
      title: 'kern.outdoor',
      short: "Direction artistique d'un média outdoor",
      meta: { year: '2023 —', context: 'Projet personnel, autoproduit, indépendant', role: 'Direction artistique, ligne éditoriale, tournage, montage', tools: 'Figma, Photoshop, CapCut' },
      lead: "Direction artistique et ligne éditoriale d'un média outdoor indépendant.",
      note: "Sur TikTok et Instagram, il transmet la randonnée et le bivouac, des premiers pas aux sorties engagées.",
      sections: [
        { r: "l'identité", h: "Des couleurs franches, loin du vert sapin", paras: [{ p: "Noir, olive, crème, citron : un contraste pensé pour lire un carrousel sur téléphone, et une palette qui tranche avec les tons forestiers des comptes outdoor. De petits signes graphiques habillent vidéos et slides : le compte se reconnaît avant qu'on lise son nom." }] },
        { r: "le système", h: "Cinq formats de carrousel, chacun avec sa direction artistique", paras: [{ p: "Guides complets, matériel par thème, films et documentaires, applications, conseils de débutant : chaque format a sa couverture et ses règles. Un gabarit par format permet de publier deux à trois fois par semaine en saison, sans perdre la cohérence." }] },
        { r: "la vidéo", h: "Des vidéos tournées et montées seul", paras: [{ p: "Plans contemplatifs, face caméra, tendances : un montage rythmé, où l'humour et les références glissées servent le conseil sans le remplacer. Le même habillage relie des formats très différents." }] },
        { r: "la ligne éditoriale", h: "Aucun partenariat rémunéré", paras: [{ p: "Le matériel recommandé est choisi, jamais payé. Les demandes d'équipementiers et de grandes enseignes du sport, plus nombreuses à mesure que le compte grandit, sont toutes déclinées. Un format qui révélait des spots précis a été arrêté, pour ne pas contribuer à leur surfréquentation." }] },
      ],
    },
    en: {
      title: 'kern.outdoor',
      short: 'Art direction for an outdoor media brand',
      meta: { year: '2023 —', context: 'Personal project, self-produced, independent', role: 'Art direction, editorial line, filming, editing', tools: 'Figma, Photoshop, CapCut' },
      lead: "Art direction and editorial line for an independent outdoor media brand.",
      note: "On TikTok and Instagram, it teaches hiking and bivouacking, from first steps to committed trips.",
      sections: [
        { r: "identity", h: "Bold colours, far from forest green", paras: [{ p: "Black, olive, cream, lime: contrast built for reading a carousel on a phone, and a palette that stands out from the forest tones of outdoor accounts. Small graphic signs dress the videos and slides: the account is recognised before its name is read." }] },
        { r: "system", h: "Five carousel formats, each with its own art direction", paras: [{ p: "Complete guides, gear by theme, films and documentaries, apps, beginner tips: each format has its own cover and rules. One template per format makes two to three posts a week possible in season, without losing consistency." }] },
        { r: "video", h: "Videos shot and edited alone", paras: [{ p: "Contemplative shots, face-camera, trends: a fast-paced edit where humour and subtle references serve the advice without replacing it. The same graphic dressing ties very different formats together." }] },
        { r: "editorial line", h: "No paid partnerships", paras: [{ p: "Recommended gear is chosen, never paid for. Requests from gear makers and major sports retailers grew with the account; every one was declined. A format revealing precise locations was dropped, to avoid adding to the overcrowding of natural sites." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- bms-esport
  // Textes du 17/11 (cadrage du jour ; résumé dans Notion › Études de cas › BMS E-Sport). Pour les agences web et les recruteurs
  // UX/UI et DA. Le logo existait déjà (ne pas le revendiquer) ; jamais lancé à cause du développement côté club, pas d'un
  // changement de direction. Chiffres publics (17/11) : Esports News UK (recrutement fin 2022, joueur 10e mondial DBFZ),
  // Esports Earnings (28 772 $ de gains, 19 tournois). Écran des partenaires écarté (marques réelles en remplissage). Mise en page : case/BmsEsport.astro.
  {
    slug: 'bms-esport',
    wip: true,
    years: [2023],
    tags: ['W', 'I'],
    yearLabel: '2023',
    object: 'crest',
    fr: {
      title: 'BMS E-Sport',
      short: 'Site web et boutique',
      meta: { year: '2023', context: 'Commande client', role: 'Direction artistique, UX/UI, web design, rédaction', tools: 'Figma' },
      lead: "Le site et la boutique d'un club e-sport de jeux de combat, repensés pour lui donner la stature d'une grande structure.",
      note: "Paris, 2023 : une commande du club, des maquettes livrées et validées, du design à la rédaction.",
      sections: [
        { r: "l'ambition", h: "Un vrai niveau, une image artisanale", paras: [{ p: "Un joueur classé 10e mondial sur Dragon Ball FighterZ, le numéro un britannique de Super Smash Bros. Ultimate recruté fin 2022, près de 29 000 $ de gains en tournois : le niveau était là, l'image du club ne suivait pas. Le site devait la mettre à la hauteur des résultats." }] },
        { r: "l'identité", h: "Le registre d'une marque de sport", paras: [{ p: "Rouge et noir, titres condensés sur toute la hauteur de l'écran, joueurs photographiés en grand : le site emprunte aux marques de sport plutôt qu'aux néons du gaming. Le blason existant passe en relief, et tout tient en mode clair comme en sombre." }] },
        { r: "les fiches joueurs", h: "Chaque joueur, présenté comme un personnage", paras: [{ p: "Dans un jeu de combat, chaque personnage a sa fiche et ses statistiques. Le site reprend ce code : le pseudo en très grand, les personnages joués, et un radar de compétences (neutral, avantage, désavantage, edgeguard…). Le public reconnaît sa propre culture." }] },
        { r: "le système", h: "Un seul gabarit pour tout le site", paras: [{ p: "Un titre géant, le contenu à côté, un filet rouge : roster, actualités, partenaires et boutique suivent la même construction. Le club ajoute un joueur ou un article sans toucher à la mise en page." }] },
        { r: "la boutique", h: "Acheter sans quitter le club", paras: [{ p: "La boutique vit dans le même site, la même navigation et la même identité que le reste : le maillot se vend dans l'univers qui le rend désirable." }] },
        { r: "le ton", h: "Parler comme une structure professionnelle", paras: [{ p: "La rédaction faisait partie de la commande : présentations des joueurs, actualités, titres. Le ton a été cadré avec le club, pour garder son caractère tout en gagnant en sérieux." }] },
        { r: "le résultat", h: "Validé presque sans retouche, jamais mis en ligne", paras: [{ p: "Après les premiers écrans, le club a laissé carte blanche, et les maquettes ont été validées avec très peu d'allers-retours. Le développement, assuré de son côté, n'a pas abouti : le site n'a jamais été mis en ligne." }] },
      ],
    },
    en: {
      title: 'BMS E-Sport',
      short: 'Website and store',
      meta: { year: '2023', context: 'Client commission', role: 'Art direction, UX/UI, web design, copywriting', tools: 'Figma' },
      lead: "The website and store of a fighting-game esports club, redesigned to give it the stature of a major organisation.",
      note: "Paris, 2023: commissioned by the club, mock-ups delivered and approved, from design to copy.",
      sections: [
        { r: "the ambition", h: "Real results, a homemade image", paras: [{ p: "A player ranked 10th in the world at Dragon Ball FighterZ, the UK's number one Super Smash Bros. Ultimate player signed in late 2022, nearly $29,000 in tournament winnings: the level was there, the club's image wasn't. The website had to match its results." }] },
        { r: "identity", h: "The language of a sports brand", paras: [{ p: "Red and black, condensed titles the full height of the screen, players photographed large: the site borrows from sports brands rather than gaming neon. The existing crest is rendered in relief, and everything works in light and dark mode." }] },
        { r: "player profiles", h: "Every player, presented as a character", paras: [{ p: "In a fighting game, every character has a sheet and stats. The site uses the same code: the gamertag huge, the characters played, and a skill radar (neutral, advantage, disadvantage, edgeguard…). The audience recognises its own culture." }] },
        { r: "the system", h: "One template for the whole site", paras: [{ p: "A giant title, the content beside it, a red rule: roster, news, partners and store share the same construction. The club can add a player or an article without touching the layout." }] },
        { r: "the store", h: "Shopping without leaving the club", paras: [{ p: "The store lives in the same site, with the same navigation and identity as the rest: the jersey is sold inside the world that makes it desirable." }] },
        { r: "tone", h: "Speaking like a professional organisation", paras: [{ p: "Copywriting was part of the brief: player bios, news, titles. The tone was set with the club, keeping its character while gaining in seriousness." }] },
        { r: "the outcome", h: "Approved almost untouched, never launched", paras: [{ p: "After the first screens the club gave free rein, and the mock-ups were approved with very few rounds of changes. Development, handled on their side, never came through: the site never went live." }] },
      ],
    },
  },
  // ---------------------------------------------------------------- SA
  // Textes du 17/11 (registre pro, centré sur le projet), écrits pour la version corrigée de la maquette (menu Activités,
  // pages catégorie et produit, téléphone : à livrer). Ne pas mentionner la fermeture du magasin. Mise en page : case/SportsAventure.astro.
  {
    slug: 'sports-aventure',
    wip: true,
    years: [2024],
    tags: ['I', 'W'],
    yearLabel: '2024',
    object: 'compass',
    fr: {
      title: 'Sports Aventure®',
      short: 'Refonte non sollicitée',
      meta: { year: '2024', context: 'Initiative personnelle, présentée au magasin', role: 'Direction artistique, identité, UX/UI', tools: 'Figma, Illustrator, Photoshop' },
      lead: "Refonte de l'identité et du site d'un magasin outdoor indépendant, proposée de ma propre initiative.",
      note: "Bordeaux, 2024 : le site marchand d'une enseigne née en 1972, plus de 500 marques, repensé pour le haut de gamme puis présenté à l'équipe en boutique.",
      sections: [
        { r: "le constat", h: "Un site plus brouillon que le magasin", paras: [{ p: "Douze entrées de menu, une dizaine de blocs aux styles différents, une navigation pensée avant le téléphone : pour du matériel haut de gamme, l'expérience en ligne n'était pas à la hauteur du prix." }] },
        { r: "le positionnement", h: "Jouer dans la même catégorie que les grandes marques", paras: [{ p: "Fond sombre, kakis et bruns, images plein cadre, titrage condensé : une direction volontairement proche des marques premium que le magasin distribue. Le logo fond une montagne dans le A, et tient jusqu'aux plus petites tailles." }] },
        { r: "la structure", h: "Six entrées au lieu de douze", paras: [{ p: "Activités, Homme, Femme, Enfant, Accessoires, Marques, et la recherche. On cherche par sport : chaque activité ouvre son rayon, et un même produit peut vivre dans plusieurs." }] },
        { r: "le parcours", h: "De l'envie à l'achat, sans perdre le conseil", paras: [{ p: "La page d'accueil met en avant nouveautés et sélections, la page catégorie garde peu de filtres, la fiche produit répond aux questions du comptoir : quel modèle pour quelle sortie, quelle taille, disponible en magasin. Conseil, atelier et location restent à portée de main, sur ordinateur comme sur téléphone." }] },
        { r: "la présentation", h: "Présenté au gérant et à l'équipe, en boutique", paras: [{ p: "Une dizaine de personnes ont parcouru la maquette à l'écran et salué la démarche. Faute de budget, le projet est resté une démonstration de ce que le site aurait pu être." }] },
      ],
    },
    en: {
      title: 'Sports Aventure®',
      short: 'Unsolicited redesign',
      meta: { year: '2024', context: 'Self-initiated, pitched to the store', role: 'Art direction, identity, UX/UI', tools: 'Figma, Illustrator, Photoshop' },
      lead: "Identity and website redesign for an independent outdoor shop, proposed on my own initiative.",
      note: "Bordeaux, 2024: the online store of a retailer founded in 1972, over 500 brands, redesigned for the high end, then presented to the team in store.",
      sections: [
        { r: "the problem", h: "A website messier than the shop", paras: [{ p: "Twelve menu entries, around ten blocks in different styles, navigation designed before phones: for high-end gear, the online experience didn't match the price." }] },
        { r: "positioning", h: "Playing in the same league as the big brands", paras: [{ p: "Dark background, khakis and browns, full-bleed images, condensed titling: a direction deliberately close to the premium brands the shop carries. The logo melts a mountain into the A, and holds up at the smallest sizes." }] },
        { r: "structure", h: "Six entries instead of twelve", paras: [{ p: "Activities, Men, Women, Kids, Accessories, Brands, and search. People shop by sport: each activity opens its own aisle, and one product can live in several." }] },
        { r: "the journey", h: "From desire to purchase, without losing the advice", paras: [{ p: "The homepage puts new arrivals and selections forward, the category page keeps filters few, the product page answers the questions asked at the counter: which model for which trip, which size, in stock in store. Advice, workshop and rental stay within reach, on desktop as on phone." }] },
        { r: "the pitch", h: "Presented to the manager and the team, in store", paras: [{ p: "About ten people browsed the mock-up on screen and praised the initiative. With no budget for a redesign, the project remained a demonstration of what the website could have been." }] },
      ],
    },
  },
];
export const projects: Project[] = all.filter((p) => !p.hidden);
