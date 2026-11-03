// Études de cas, dans l'ordre choisi le 02/11 : Heraldry, ASAPHR, (ChâteauStudio)®, Identités musicales, BMS, HOTSHOT, Sports Aventure. Même gabarit pour toutes :
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
  object: 'book' | 'rock' | 'vinyl' | 'rook' | 'controller' | 'bottle' | 'compass' | 'feather'; // objet de la page Projets
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
      lead: "Un programme qui génère des blasons à partir des règles de l'héraldique médiévale, chacun scellé par une clé unique. Une sorte de QR code médiéval.",
      sections: [
        { h: 'Contexte', paras: [{ p: 'Une recherche personnelle, sans commande ni échéance. Le point de départ est une intuition de designer d\'identité : bien avant les chartes graphiques, l\'Occident médiéval avait déjà inventé un système complet pour signer des personnes, des familles et des villes. Le blason.' }] },
        { h: 'Le problème', paras: [{ p: 'Un blason ne se transmettait pas par le dessin mais par un texte, le blasonnement, assez précis pour qu\'un héraut redessine un écu qu\'il n\'avait jamais vu. Une identité visuelle décrite comme un programme, donc. Que devient ce système si on le prend au mot, et qu\'on le donne vraiment à exécuter à une machine ?' }] },
        { h: 'La démarche', paras: [{ p: 'D\'abord lire : les traités de Neubecker, les tables de Pietrasanta qui ont fixé au XVIIᵉ siècle les hachures des couleurs pour l\'imprimerie. Ensuite traduire chaque règle en fonction : forme d\'écu, partition, meuble, devise.' }, { p: 'Une première version en couleur a été écartée. Le noir et blanc tenait mieux à l\'impression, frappait plus fort, et surtout libérait les hachures de leur sens codé : elles ne désignent plus une couleur, elles deviennent une matière.' }] },
        { h: 'Le système', paras: [{ p: 'Six formes d\'écus, quinze partitions géométriques, vingt-trois devises latines et un répertoire de meubles anciens et contemporains, découpés par des trames hachurées limitées à quatre angles. Plus de vingt mille milliards de combinaisons.' }, { p: 'Chaque blason est scellé par une clé courte qui sert de graine : la même clé redonne toujours la même image, et cette image ne peut venir que d\'elle.' }] },
        { h: 'Choix clés', paras: [{ t: 'Le noir et blanc absolu.', p: 'Pas de gris, pas de dégradé : l\'écu se lit comme un tampon, à toutes les tailles.' }, { t: 'Une clé plutôt qu\'un fichier.', p: 'On ne stocke pas l\'image, mais la manière de la fabriquer. Une sorte de QR code médiéval.' }, { t: 'Un livre qui se compose seul.', p: 'Un script Python met les 500 pages en page : les doubles-pages s\'enchaînent au hasard, avec une seule contrainte, recto et verso partagent le même fond.' }, { t: 'Une position face à l\'IA.', p: 'Un système dont chaque règle est connue et chaque image reproductible à l\'identique. Le designer ne dessine plus l\'image finale, mais reste l\'auteur de tout ce qui en sort.' }] },
        { h: 'En situation', paras: [{ p: 'Cinq cents pages, en français et en anglais, entre l\'A4 et l\'A5, en reliure suisse à dos ouvert. Le livre s\'ouvre sur un texte théorique en treize chapitres, enchaîne les blasons, des grilles de cent écus jusqu\'à l\'écu seul, et se ferme sur l\'index des clés. Un dummy imprimé a servi à régler l\'objet.' }, { p: 'Le générateur est jouable ci-dessous : entrez une clé, obtenez son blason.' }] },
        { h: 'Résultat et suite', paras: [{ p: 'Montré sur Instagram, le projet a surtout déclenché une demande inattendue : des gens qui veulent leur propre blason, et leur clé. Le livre est achevé et inédit ; l\'envoi aux éditeurs est en préparation.' }] },
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
      lead: 'A program that generates coats of arms from the rules of medieval heraldry, each one sealed by a unique key. A kind of medieval QR code.',
      sections: [
        { h: 'Context', paras: [{ p: 'A personal research project, with no brief and no deadline. It started from an identity designer\'s hunch: long before brand guidelines, medieval Europe had already invented a complete system to sign people, families and cities. Heraldry.' }] },
        { h: 'The problem', paras: [{ p: 'A coat of arms wasn\'t passed on as a drawing but as a text, the blazon, precise enough for a herald to redraw a shield he had never seen. A visual identity written as a program, in other words. What happens to that system if you take it literally, and actually hand it to a machine to run?' }] },
        { h: 'Process', paras: [{ p: 'Reading first: Neubecker\'s treatises, and the tables in which Pietrasanta fixed, in the 17th century, the hatchings that stand for colours in print. Then translating each rule into a function: shield shape, partition, charge, motto.' }, { p: 'A first colour version was dropped. Black and white held up better in print, hit harder, and above all freed the hatchings from their coded meaning: they no longer stand for a colour, they become a material.' }] },
        { h: 'The system', paras: [{ p: 'Six shield shapes, fifteen geometric partitions, twenty-three Latin mottoes and a repertoire of old and contemporary charges, cut through by hatched patterns limited to four angles. Over twenty trillion combinations.' }, { p: 'Each coat of arms is sealed by a short key that acts as a seed: the same key always gives back the same image, and that image can only come from it.' }] },
        { h: 'Key decisions', paras: [{ t: 'Absolute black and white.', p: 'No grey, no gradient: the shield reads like a stamp, at any size.' }, { t: 'A key rather than a file.', p: 'What is stored is not the image but the way to make it. A sort of medieval QR code.' }, { t: 'A book that lays itself out.', p: 'A Python script sets all 500 pages: spreads follow each other at random, with one constraint, recto and verso share the same ground.' }, { t: 'A stance on AI.', p: 'A system where every rule is known and every image can be reproduced exactly. The designer no longer draws the final image, but remains the author of everything it produces.' }] },
        { h: 'In context', paras: [{ p: 'Five hundred pages, in French and English, between A4 and A5, with a Swiss open-spine binding. The book opens on a thirteen-chapter essay, runs through the coats of arms, from grids of a hundred shields to a single shield, and closes on the index of keys. A printed dummy was used to fine-tune the object.' }, { p: 'The generator can be played below: enter a key, get its coat of arms.' }] },
        { h: 'Outcome and next', paras: [{ p: 'Shown on Instagram, the project mostly triggered an unexpected demand: people asking for their own coat of arms, and their key. The book is finished and unpublished; submission to publishers is underway.' }] },
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
      lead: "Une écriture inventée pour comprendre comment fonctionne une écriture.",
      sections: [
        { h: 'Contexte', paras: [{ p: 'Une recherche personnelle, ouverte en 2026. Après des alphabets latins et des fontes classiques, l\'envie d\'aller un cran plus loin : non plus dessiner des lettres, mais inventer l\'écriture entière, celle qui décide de ce qu\'est une lettre, et la langue qui va avec.' }] },
        { h: 'Le problème', paras: [{ p: 'Qu\'est-ce qui fait qu\'une écriture en est une ? Un support, un sens de lecture, une phonologie, une grammaire, un tracé. ASAPHR reprend chacun de ces points et le prend à contre-courant, pour voir ce qui tient encore quand on retire les habitudes.' }] },
        { h: 'La démarche', paras: [{ p: 'D\'abord regarder : les runes, les écritures inventées, celles qui ont été pensées par des linguistes avant de l\'être par des typographes. Puis dessiner à la main, longtemps, jusqu\'à ce que les signes se répondent. La langue s\'est écrite en même temps que les signes, dans un codex qui fixe tout, du support à la ponctuation. Glyphs n\'est venu qu\'après, pour fixer un système qui existait déjà sur le papier.' }] },
        { h: 'Le système', paras: [{ p: 'Le support est un disque. Tout énoncé naît au bord de sa perforation centrale, le zéro sémantique, et se déploie vers l\'extérieur le long de seize rayons, un tous les 22,5°. On lit la branche à midi, du centre vers le bord, puis on tourne le disque dans le sens des aiguilles d\'une montre pour amener la suivante.' }, { p: 'La langue tient en soixante syllabes maîtresses, quinze par quadrant : la matière, le mouvement, l\'état, la relation. Chaque glyphe s\'inscrit dans une grille de 3 × 5 unités, en trait monoline ; la rangée du haut reste vide, sauf pour les chiffres, qui portent un chapeau. Le rôle d\'un mot dépend de sa seule place sur le rayon : aucun accent, aucune déclinaison.' }, { p: 'Au bout de chaque rayon, un sceau ferme la phrase et dit deux choses à la fois : d\'où vient l\'information (carré pour le constaté, losange pour le déduit, cercle pour le rapporté) et ce qu\'on en fait (fermé pour affirmer, fendu pour douter, fléché pour ordonner).' }] },
        { h: 'Choix clés', paras: [{ t: 'Le centre comme origine.', p: 'La lecture centrifuge change tout : la page n\'a plus de haut ni de bas, et un texte devient une figure.' }, { t: 'La place plutôt que l\'accent.', p: 'La grammaire est entièrement spatiale : qui agit, sur quoi, se lit à la position sur le rayon.' }, { t: 'Dire d\'où l\'on sait.', p: 'Le sceau rend l\'origine de chaque affirmation visible au premier coup d\'œil. Une écriture qui ne permet pas de mentir sur sa source.' }, { t: 'La main d\'abord.', p: 'Les signes viennent du geste, pas de la grille ; la grille n\'arrive qu\'au moment de les rendre cohérents.' }] },
        { h: 'En situation', paras: [{ p: 'Un disque pour les textes courts ; pour les textes longs, une bande coupée sur un rayon et enroulée en hélice, chaque tour gardant la lecture radiale. À l\'écran, c\'est le défilement qui fait tourner le disque, une branche après l\'autre. Lire ASAPHR devient une manipulation autant qu\'une lecture.' }] },
        { h: 'Résultat et suite', paras: [{ p: 'Le codex est écrit et le système est fixé ; les glyphes sont en finition. Viendront l\'objet-livre à disques, et une fonte pour écrire ASAPHR au clavier.' }] },
      ],
    },
    en: {
      title: 'ASAPHR',
      short: 'Invented script',
      meta: { year: '2026 —', context: 'Personal research', role: 'Writing system, type design', tools: 'Glyphs 4' },
      lead: 'An invented script, made to understand how a script works.',
      sections: [
        { h: 'Context', paras: [{ p: 'A personal research project started in 2026. After Latin alphabets and classic typefaces, the urge to go one step further: no longer drawing letters, but inventing the whole writing system, the one that decides what a letter is, and the language that comes with it.' }] },
        { h: 'The problem', paras: [{ p: 'What makes a script a script? A medium, a reading direction, a phonology, a grammar, a stroke. ASAPHR takes each of these and turns it against the grain, to see what still holds once habits are removed.' }] },
        { h: 'Process', paras: [{ p: 'Looking first: runes, invented scripts, the ones conceived by linguists before typographers. Then drawing by hand, for a long time, until the signs answered one another. The language was written alongside the signs, in a codex that fixes everything from medium to punctuation. Glyphs only came afterwards, to set down a system that already existed on paper.' }] },
        { h: 'The system', paras: [{ p: 'The medium is a disc. Every statement is born at the edge of its central hole, the semantic zero, and unfolds outwards along sixteen spokes, one every 22.5°. You read the branch at twelve o\'clock, from the centre to the edge, then turn the disc clockwise to bring the next one up.' }, { p: 'The language rests on sixty master syllables, fifteen per quadrant: matter, motion, state, relation. Each glyph sits in a 3 × 5 grid, in a monoline stroke; the top row stays empty, except for numbers, which wear a hat. A word\'s role depends only on its position along the spoke: no accents, no inflections.' }, { p: 'At the end of each spoke, a seal closes the sentence and says two things at once: where the information comes from (square for witnessed, diamond for inferred, circle for reported) and what to do with it (closed to assert, split to doubt, arrowed to command).' }] },
        { h: 'Key decisions', paras: [{ t: 'The centre as origin.', p: 'Centrifugal reading changes everything: the page no longer has a top or a bottom, and a text becomes a figure.' }, { t: 'Position rather than accent.', p: 'The grammar is entirely spatial: who acts, on what, is read from the place on the spoke.' }, { t: 'Saying how you know.', p: 'The seal makes the source of every statement visible at a glance. A script that won\'t let you lie about your source.' }, { t: 'Hand first.', p: 'The signs come from the gesture, not the grid; the grid only arrives to make them consistent.' }] },
        { h: 'In context', paras: [{ p: 'A disc for short texts; for long ones, a strip cut along a spoke and wound into a helix, each turn keeping the radial reading. On screen, scrolling turns the disc, one branch after another. Reading ASAPHR becomes a handling as much as a reading.' }] },
        { h: 'Outcome and next', paras: [{ p: 'The codex is written and the system is set; the glyphs are being finished. Next come the disc object-book, and a font to type ASAPHR on a keyboard.' }] },
      ],
    },
  },
  // ---------------------------------------------------------------- chateau-studio
  {
    slug: 'chateau-studio',
    hidden: true, // rien n'est encore dessiné (03/11) : l'étude revient quand l'identité existe
    years: [2026],
    tags: ['I'],
    yearLabel: '2026',
    object: 'rook',
    draft: true,
    fr: {
      title: '(ChâteauStudio)®',
      short: "Identité d'un studio",
      meta: {
        year: '2026',
        context: 'Identité de studio',
        role: 'Naming, identité, typographie',
        tools: '[À compléter]',
      },
      lead: "[À valider] L'identité d'un studio de design graphique, construite comme une commande : brief, contraintes, pistes, choix.",
      sections: [
        {
          h: 'Point de départ',
          paras: [
            { p: "Un nom qui fonctionne dans deux langues : château en français, castle en anglais. [À compléter : le brief que tu te fixes — positionnement, cible, supports]." },
            { p: "Contrainte réelle : plusieurs « chateau » existent déjà en ligne, dans d'autres secteurs et d'autres pays. L'identité doit se distinguer sans changer de nom." },
          ],
        },
        {
          h: 'Ce qui a été fait',
          paras: [{ p: '[À compléter] Logotype, caractère dessiné sur mesure (si oui), système de déclinaisons : devis, factures, réseaux, site.' }],
        },
        {
          h: 'Choix clés',
          paras: [
            { t: '[À compléter]', p: 'Les pistes explorées puis écartées, et pourquoi.' },
            { t: '[À compléter]', p: 'Le choix typographique.' },
          ],
        },
        { h: 'Statut', paras: [{ p: 'En cours.' }] },
      ],
    },
    en: {
      title: '(ChâteauStudio)®',
      short: 'Studio identity',
      meta: {
        year: '2026',
        context: 'Studio identity',
        role: 'Naming, identity, type',
        tools: '[To complete]',
      },
      lead: '[To validate] The identity of a graphic design studio, approached as a real commission: brief, constraints, directions, decisions.',
      sections: [
        {
          h: 'Starting point',
          paras: [
            { p: 'A name that works in two languages: château in French, castle in English. [To complete: the brief — positioning, audience, formats].' },
            { p: 'A real constraint: several “chateau” accounts already exist online, in other sectors and countries. The identity has to stand apart without changing the name.' },
          ],
        },
        { h: 'What was made', paras: [{ p: '[To complete] Logotype, custom typeface (if any), roll-out system: quotes, invoices, social, website.' }] },
        {
          h: 'Key decisions',
          paras: [
            { t: '[To complete]', p: 'Directions explored then dropped, and why.' },
            { t: '[To complete]', p: 'The typographic choice.' },
          ],
        },
        { h: 'Status', paras: [{ p: 'In progress.' }] },
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
      lead: 'Des identités complètes pour des artistes, signés en label ou indépendants avec leur propre structure, du logotype jusqu\'au vinyle. Rap underground, électro, hyperpop.',
      sections: [
        { h: 'Contexte', paras: [{ p: 'Depuis 2020, plus d\'une vingtaine d\'identités pour des artistes de rap underground, d\'électro et d\'hyperpop, signés en label ou en indépendant avec leur propre structure. Une commande, à chaque fois, autour d\'une sortie : un single, un EP, un album.' }] },
        { h: 'Le problème', paras: [{ p: 'Traduire un son en image, et le faire vite. Une sortie laisse peu de temps, la scène est saturée de visuels, et l\'identité doit tenir partout à la fois : la pochette, le dos, le merch, la billetterie, la presse, parfois la scène.' }] },
        { h: 'La démarche', paras: [{ p: 'Tout commence par le disque, écouté en boucle. Viennent ensuite le brief et la discussion des références avec l\'artiste, puis une veille large. Je propose toujours deux pistes radicalement différentes, pour que le choix porte sur une direction et pas sur un détail.' }] },
        { h: 'Le système', paras: [{ p: 'Presque toujours un logotype ou un lettrage, dessiné à la main, jamais tiré d\'une fonte. Autour, une cover, un dos, une tracklist, puis les déclinaisons : merch, presse, réseaux, billetterie. Le tout pensé d\'abord comme un objet physique, CD ou vinyle, avant d\'être une image à l\'écran.' }] },
        { h: 'Choix clés', paras: [{ t: 'Le son au centre.', p: 'Les thèmes, les sonorités et l\'univers de l\'artiste guident le dessin ; une identité musicale ne se lit pas, elle s\'écoute aussi.' }, { t: 'Le lettrage dessiné.', p: 'Chaque titre est une forme unique, faite pour cette sortie et aucune autre.' }, { t: 'L\'objet d\'abord.', p: 'Relief, découpe, matière : la pochette se pense dans la main avant de se penser en vignette sur une plateforme.' }] },
        { h: 'En situation', paras: [{ p: 'Des pochettes réellement imprimées en relief et en découpe, du merch vendu en concert, et des visuels de scène projetés en direct, notamment à la Gaîté Lyrique, réalisés dans TouchDesigner.' }] },
        { h: 'Résultat et suite', paras: [{ p: 'Une archive d\'identités qu\'on retrouve ici sans noms ni titres : seules les formes parlent. Les commandes continuent, au rythme des sorties.' }] },
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
      lead: 'Complete identities for artists, signed to labels or independent with their own structure, from logotype to vinyl. Underground rap, electronic, hyperpop.',
      sections: [
        { h: 'Context', paras: [{ p: 'Since 2020, over twenty identities for underground rap, electronic and hyperpop artists, signed to labels or independent with their own structures. Each time a commission around a release: a single, an EP, an album.' }] },
        { h: 'The problem', paras: [{ p: 'Turning a sound into an image, and doing it fast. A release leaves little time, the scene is saturated with visuals, and the identity has to work everywhere at once: the cover, the back, the merch, ticketing, press, sometimes the stage.' }] },
        { h: 'Process', paras: [{ p: 'It always starts with the record, on repeat. Then the brief and a discussion of references with the artist, then wide-ranging research. I always present two radically different directions, so the choice is about a direction, not a detail.' }] },
        { h: 'The system', paras: [{ p: 'Almost always a logotype or lettering, drawn by hand, never taken from a font. Around it, a cover, a back, a tracklist, then the roll-outs: merch, press, social, ticketing. All of it thought of first as a physical object, CD or vinyl, before being an image on a screen.' }] },
        { h: 'Key decisions', paras: [{ t: 'Sound at the centre.', p: 'The artist\'s themes, sounds and world guide the drawing; a music identity isn\'t only read, it\'s heard.' }, { t: 'Drawn lettering.', p: 'Each title is a unique form, made for that release and no other.' }, { t: 'Object first.', p: 'Embossing, die-cuts, material: the sleeve is designed for the hand before it becomes a thumbnail on a platform.' }] },
        { h: 'In context', paras: [{ p: 'Sleeves actually printed with embossing and die-cuts, merch sold at concerts, and live stage visuals, notably at the Gaîté Lyrique, made in TouchDesigner.' }] },
        { h: 'Outcome and next', paras: [{ p: 'An archive of identities shown here without names or titles: only the forms speak. The commissions continue, at the pace of releases.' }] },
      ],
    },
  },
  // ---------------------------------------------------------------- bms-esport
  {
    slug: 'bms-esport',
    years: [2023],
    tags: ['W', 'I'],
    yearLabel: '2023',
    object: 'controller',
    draft: false,
    fr: {
      title: 'BMS E-Sport',
      short: 'Site web et boutique',
      meta: { year: '2023', context: 'Commande client', role: 'Direction artistique, UX/UI, web design', tools: 'Figma' },
      lead: "Le site d'un club e-sport de jeux de combat, pensé pour montrer son niveau et les jeunes joueurs qu'il fait grandir.",
      sections: [
        { h: 'Contexte', paras: [{ p: 'BMS Esports est un club spécialisé dans les jeux de combat en un contre un : Smash Ultimate, Dragon Ball FighterZ, Street Fighter. Le club m\'a contacté directement en 2023 pour sa présence en ligne.' }] },
        { h: 'Le problème', paras: [{ p: 'Un site daté, une boutique à part, et une image en dessous du niveau réel du club, qui compte des joueurs classés et forme les jeunes. Il fallait que le site fasse enfin le même effet qu\'un match.' }] },
        { h: 'La démarche', paras: [{ p: 'L\'arborescence et les parcours d\'abord : qui vient, pour quoi faire, en combien de clics. Puis un moodboard tiré de l\'esthétique de la compétition et des jeux de combat eux-mêmes : écrans de sélection, fiches de personnages, typographies d\'arcade. Enfin les maquettes, sur ordinateur et sur mobile.' }] },
        { h: 'Le système', paras: [{ p: 'Un design system complet : typographie, couleurs du club, composants réutilisables, des fiches joueurs aux cartes produits. Le site et la boutique partagent les mêmes briques, pour ne plus former qu\'un seul parcours.' }] },
        { h: 'Choix clés', paras: [{ t: 'Un ton plus affirmé.', p: 'Une typographie nerveuse et une mise en page franche, à l\'image de la compétition. La palette reprend les couleurs du club.' }, { t: 'Des joueurs comme des personnages.', p: 'Chaque joueur a sa fiche, construite comme un écran de sélection : statistiques, jeu, rang.' }, { t: 'Donner envie de fouiller.', p: 'Le design reste joueur et vif : chaque page invite à creuser plus loin.' }, { t: 'Un mode clair.', p: 'Ajouté à la demande du club, à côté du mode sombre, pour lire confortablement partout.' }] },
        { h: 'En situation', paras: [{ p: 'L\'accueil, les actualités, les fiches joueurs, les partenaires et la boutique, déclinés sur ordinateur et sur mobile.' }] },
        { h: 'Résultat et suite', paras: [{ p: 'Le design a été livré au club, qui a changé de direction avant le lancement : le site n\'a jamais été mis en ligne. Il reste un système complet, prêt à être développé.' }] },
      ],
    },
    en: {
      title: 'BMS E-Sport',
      short: 'Website and store',
      meta: { year: '2023', context: 'Client commission', role: 'Art direction, UX/UI, web design', tools: 'Figma' },
      lead: 'The website of an esports club focused on fighting games, built to show its level and the young players it develops.',
      sections: [
        { h: 'Context', paras: [{ p: 'BMS Esports is a club dedicated to one-on-one fighting games: Smash Ultimate, Dragon Ball FighterZ, Street Fighter. The club contacted me directly in 2023 about its online presence.' }] },
        { h: 'The problem', paras: [{ p: 'A dated website, a separate store, and an image below the club\'s real level, with ranked players and a youth programme. The site had to finally feel like a match.' }] },
        { h: 'Process', paras: [{ p: 'Site map and user journeys first: who comes, to do what, in how many clicks. Then a moodboard drawn from the aesthetics of competition and fighting games themselves: select screens, character sheets, arcade typography. Finally the mock-ups, desktop and mobile.' }] },
        { h: 'The system', paras: [{ p: 'A complete design system: typography, club colours, reusable components, from player sheets to product cards. Site and store share the same building blocks, so they form a single journey.' }] },
        { h: 'Key decisions', paras: [{ t: 'A bolder tone.', p: 'Sharp typography and a straightforward layout, in tune with competition. The palette follows the club\'s colours.' }, { t: 'Players as characters.', p: 'Each player has a sheet built like a select screen: stats, game, rank.' }, { t: 'Make people dig.', p: 'The design stays playful and lively: every page invites you to go further.' }, { t: 'A light mode.', p: 'Added at the club\'s request, alongside the dark mode, for comfortable reading anywhere.' }] },
        { h: 'In context', paras: [{ p: 'Home, news, player sheets, partners and the store, across desktop and mobile.' }] },
        { h: 'Outcome and next', paras: [{ p: 'The design was delivered to the club, which changed direction before launch: the site was never put online. What remains is a complete system, ready to be built.' }] },
      ],
    },
  },
  // ---------------------------------------------------------------- HOT
  {
    slug: 'hotshot',
    years: [2024],
    tags: ['I', 'T', 'P'],
    yearLabel: '2024',
    object: 'bottle',
    draft: true,
    fr: {
      title: 'Hotshot®',
      short: 'De la sauce piquante au restaurant',
      meta: { year: '2024', context: 'Concept de marque', role: 'Naming, identité, logotype, mascotte', tools: 'Illustrator, Procreate' },
      lead: "Une marque de sauce piquante qui grandit jusqu'au restaurant. Un concept, mené comme une vraie commande.",
      sections: [
        { h: 'Contexte', paras: [{ p: 'Un exercice personnel, mené comme une vraie commande : montrer une identité complète, du produit jusqu\'au lieu. Le point de départ est une sauce piquante ; l\'arrivée, le restaurant qui va avec.' }] },
        { h: 'Le problème', paras: [{ p: 'Une marque assez forte pour tenir sur une étiquette de bouteille comme sur une devanture, sans jamais changer de voix. Et se faire remarquer dans un rayon où toutes les sauces jouent déjà le feu, le rouge et la tête de mort.' }] },
        { h: 'La démarche', paras: [{ p: 'Le nom d\'abord : Hotshot, le jeu de mots entre le piment et le « hot shot », celui qui fait le malin. Puis la mascotte, cherchée en croquis dans Procreate, plusieurs personnages testés avant le bon, pensé dès le départ pour être décliné en poses. Le logotype et le système sont venus ensuite, dans Illustrator.' }] },
        { h: 'Le système', paras: [{ p: 'Un logotype dessiné sur mesure, une mascotte, une signature, deux rouges, et toutes les déclinaisons : bouteilles, menu, sous-verres, baguettes, papier d\'emballage, réseaux, site et devanture.' }] },
        { h: 'Choix clés', paras: [{ t: 'Un logotype en bloc.', p: 'Des lettres condensées et anguleuses, empilées en carré, avec une bouteille qui s\'invite dans le lettrage. Il tient en tampon, en étiquette comme en enseigne.' }, { t: 'Deux rouges.', p: 'Un rouge vif pour la brûlure, un bordeaux profond pour le fond. La couleur fait le travail avant même la lecture.' }, { t: 'Une mascotte rétro.', p: 'Un piment au trait épais, façon vieux cartoon, qui ajoute une dose d\'insolence au sérieux du titrage.' }, { t: 'Un ton.', p: '« Because mild is overrated. » La signature devient un titrage à part entière, sur les affiches comme sur les murs.' }] },
        { h: 'En situation', paras: [{ p: 'La bouteille, la table (menu, sous-verres, baguettes), l\'emballage, la rue (devanture, affiches) et l\'écran (réseaux, site) : la même voix d\'un bout à l\'autre.' }] },
        { h: 'Résultat et suite', paras: [{ p: 'Une identité complète, du produit au lieu, qui n\'attend plus qu\'un restaurant. Concept personnel, non commandé.' }] },
      ],
    },
    en: {
      title: 'Hotshot®',
      short: 'From hot sauce to restaurant',
      meta: { year: '2024', context: 'Brand concept', role: 'Naming, identity, logotype, mascot', tools: 'Illustrator, Procreate' },
      lead: 'A hot sauce brand that grows into a restaurant. A concept, handled like a real commission.',
      sections: [
        { h: 'Context', paras: [{ p: 'A personal exercise, run like a real commission: showing a complete identity, from product all the way to place. It starts with a hot sauce and ends with the restaurant that goes with it.' }] },
        { h: 'The problem', paras: [{ p: 'A brand strong enough to hold on a bottle label as on a shopfront, without ever changing its voice. And to stand out on a shelf where every sauce already plays fire, red and skulls.' }] },
        { h: 'Process', paras: [{ p: 'The name first: Hotshot, the pun between the chilli and the \'hot shot\', the show-off. Then the mascot, sketched in Procreate, several characters tried before the right one, designed from the start to be posed and declined. The logotype and the system came next, in Illustrator.' }] },
        { h: 'The system', paras: [{ p: 'A custom-drawn logotype, a mascot, a tagline, two reds, and every roll-out: bottles, menu, coasters, chopsticks, wrapping paper, social media, website and shopfront.' }] },
        { h: 'Key decisions', paras: [{ t: 'A block logotype.', p: 'Condensed, angular letters stacked into a square, with a bottle slipping into the lettering. It works as a stamp, a label and a sign.' }, { t: 'Two reds.', p: 'A bright red for the burn, a deep burgundy for the ground. Colour does the work before reading even starts.' }, { t: 'A retro mascot.', p: 'A thick-lined chilli, old-cartoon style, adding a dose of cheek to the seriousness of the type.' }, { t: 'A tone.', p: '\'Because mild is overrated.\' The tagline becomes a headline in its own right, on posters as on walls.' }] },
        { h: 'In context', paras: [{ p: 'The bottle, the table (menu, coasters, chopsticks), the wrapping, the street (shopfront, posters) and the screen (social, website): the same voice from end to end.' }] },
        { h: 'Outcome and next', paras: [{ p: 'A complete identity, from product to place, just waiting for a restaurant. Personal concept, not commissioned.' }] },
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
      lead: "La refonte d'un magasin d'équipement outdoor bordelais, faite sans commande, puis présentée à l'équipe.",
      sections: [
        { h: 'Contexte', paras: [{ p: 'Sports Aventure est un magasin d\'équipement outdoor à Bordeaux, spécialisé dans la randonnée. Client régulier, j\'y retrouvais dans les rayons un esprit d\'aventure que le site ne transmettait pas. J\'ai repensé l\'expérience de moi-même, sans commande.' }] },
        { h: 'Le problème', paras: [{ p: 'Un site visuellement daté, autour d\'un vert délavé, pensé comme un catalogue plutôt que comme une invitation à partir. On y trouvait difficilement une catégorie ou un produit, et rien n\'était pensé pour le mobile.' }] },
        { h: 'La démarche', paras: [{ p: 'Observer d\'abord le magasin et ses clients : ce qu\'ils cherchent, ce qu\'ils demandent au comptoir. Puis regarder comment les grandes marques outdoor parlent de terrain. L\'arborescence est venue avant le design, et les images de terrain ont été choisies avant tout le reste : c\'est elles qui donnent envie de partir.' }] },
        { h: 'Le système', paras: [{ p: 'Une identité reconstruite autour de quatre éléments : typographie, palette, images et pictogrammes. Un nouveau logo, le site complet, et son extension au print : affichage, sacs, cartes de fidélité.' }] },
        { h: 'Choix clés', paras: [{ t: 'Une palette de terrain.', p: 'Le vert délavé d\'origine laisse place à des kakis terreux et des bruns profonds, pris à la nature.' }, { t: 'Une montagne pour logo.', p: 'Une montagne stylisée, simple et forte, qui range le magasin dans la famille visuelle des grandes marques outdoor.' }, { t: 'Un site qui donne envie de partir.', p: 'Accès direct aux catégories et aux fonctions de la boutique, images plein cadre et grand titrage « Explore » : chaque écran pousse à aller plus loin, sur ordinateur comme sur téléphone.' }, { t: 'Des pictogrammes maison.', p: 'Une série d\'icônes simples pour se repérer dans l\'interface.' }] },
        { h: 'En situation', paras: [{ p: 'Le site, l\'atelier, la location, le blog, puis le magasin lui-même : affichage, sacs de caisse, cartes de fidélité.' }] },
        { h: 'Résultat et suite', paras: [{ p: 'Présenté de façon informelle en boutique : l\'équipe a aimé, sans budget pour aller plus loin. Le projet reste une démonstration de ce que le magasin pourrait être en ligne.' }] },
      ],
    },
    en: {
      title: 'Sports Aventure®',
      short: 'Unsolicited redesign',
      meta: { year: '2024', context: 'Self-initiated, pitched to the store', role: 'Art direction, identity, UX/UI', tools: 'Figma, Illustrator, Photoshop' },
      lead: 'The redesign of an outdoor gear store in Bordeaux, made without a brief, then pitched to the team.',
      sections: [
        { h: 'Context', paras: [{ p: 'Sports Aventure is an outdoor gear store in Bordeaux, specialising in hiking. As a regular customer, I found a spirit of adventure in its aisles that its website didn\'t convey. I rethought the experience on my own, without a brief.' }] },
        { h: 'The problem', paras: [{ p: 'A visually dated site built around a faded green, designed as a catalogue rather than an invitation to head out. Categories and products were hard to find, and nothing was designed for mobile.' }] },
        { h: 'Process', paras: [{ p: 'Watching the store and its customers first: what they look for, what they ask at the counter. Then looking at how the big outdoor brands talk about the field. Site structure came before design, and field imagery was chosen before anything else: that\'s what makes you want to go.' }] },
        { h: 'The system', paras: [{ p: 'An identity rebuilt around four elements: type, palette, imagery and icons. A new logo, the full website, and its extension to print: posters, bags, loyalty cards.' }] },
        { h: 'Key decisions', paras: [{ t: 'A palette from the field.', p: 'The original faded green gives way to earthy khakis and deep browns, taken from nature.' }, { t: 'A mountain for a logo.', p: 'A stylised mountain, simple and strong, placing the store in the visual family of the major outdoor brands.' }, { t: 'A site that makes you want to head out.', p: 'Direct access to categories and store features, full-bleed images and a large \'Explore\' title: every screen pushes you further, on desktop as on phone.' }, { t: 'Custom icons.', p: 'A set of simple icons to find your way through the interface.' }] },
        { h: 'In context', paras: [{ p: 'The website, the workshop, rentals, the blog, then the store itself: posters, shopping bags, loyalty cards.' }] },
        { h: 'Outcome and next', paras: [{ p: 'Presented informally in the store: the team liked it, with no budget to take it further. The project remains a demonstration of what the store could be online.' }] },
      ],
    },
  },
];
export const projects: Project[] = all.filter((p) => !p.hidden);
