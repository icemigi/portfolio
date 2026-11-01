// Études de cas, dans l'ordre par force (validé). Même gabarit pour toutes :
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

export const projects: Project[] = [
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
        {
          h: 'Point de départ',
          paras: [
            { p: "Le blason est le premier système d'identification visuelle codifié d'Occident. Il repose sur des partitions (les découpes géométriques de l'écu), une règle de contraste obligatoire et un répertoire fermé de figures appelées meubles : lion, clé, épée… Il ne se transmettait pas par le dessin mais par un texte, le blasonnement, assez précis pour qu'un héraut redessine l'écu sans l'avoir jamais vu. Une recette, en somme." },
            { p: "Le projet part de là : traduire ces règles en code. Le designer ne dessine plus l'image finale, il conçoit le système qui la produit, et reste l'auteur de chaque blason qui en sort." },
          ],
        },
        {
          h: 'Ce qui a été fait',
          paras: [
            { p: "Un générateur qui combine six formes d'écus, quinze partitions, vingt-trois devises latines et un répertoire de meubles anciens et contemporains. Le système peut produire plus de vingt mille milliards de compositions distinctes." },
            { p: "Chaque blason est identifié par une clé courte en Base36 qui sert de graine : la même clé redonne toujours la même image, et cette image ne peut venir que de cette clé. Là où un QR code stocke une donnée qu'un capteur lit, la clé stocke la recette de fabrication de l'image." },
            { p: "Tout est déterministe et vectoriel. Là où les images d'IA produisent un résultat sans montrer leurs règles, le projet défend l'inverse : un système dont chaque règle est connue et chaque image reproductible à l'identique." },
          ],
        },
        {
          h: 'Choix clés',
          paras: [
            { t: 'Noir et blanc absolu.', p: "La règle des émaux (les couleurs héraldiques) interdisait de poser deux couleurs ou deux métaux côte à côte. Elle devient ici un calcul d'inversion : chaque fois qu'une forme en recouvre une autre, la zone superposée bascule de valeur." },
            { t: 'Des hachures détournées.', p: "Au lieu du code historique, où l'orientation des lignes désigne une couleur, les trames sont limitées à quatre angles (0°, 45°, 90°, 135°). Au contact des silhouettes, elles produisent des vibrations optiques, gardées volontairement comme texture." },
            { t: 'Découper et ordonner.', p: "Les partitions sont des masques et des évidements, pas des traits posés sur un fond, si bien que la silhouette de l'écu reste toujours lisible. À l'intérieur, le premier meuble tiré devient la figure principale, chaque meuble occupe sa propre cellule de grille, et les lettres des devises, éclatées dans l'écu, gardent un écartement minimal." },
            { t: 'La clé comme élément graphique.', p: "Imprimée sous chaque écu, elle sert de signature typographique et d'identifiant d'archive : quand l'œil se perd dans les inversions, le code reste exact." },
          ],
        },
        {
          h: 'Résultat',
          paras: [
            { p: "Un livre bilingue de 500 pages, mis en page par un script Python. Un texte théorique sur le design génératif et l'héraldique ouvre l'ouvrage, suivi d'une sélection de blasons, des grilles denses de 10 × 10 jusqu'à l'écu seul en pleine page. Les doubles-pages s'enchaînent dans un ordre aléatoire, avec une seule règle : recto et verso partagent toujours le même fond. Le livre applique ainsi à sa propre mise en page la logique qu'il décrit." },
            { p: 'Le générateur est jouable plus bas : entrez une clé, obtenez son blason.' },
          ],
        },
        { h: 'Statut', paras: [{ p: "Livre achevé, en recherche d'éditeur." }] },
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
        {
          h: 'Starting point',
          paras: [
            { p: 'The coat of arms is the first codified visual identity system in the Western world. It relies on partitions (the geometric divisions of the shield), a mandatory contrast rule and a closed repertoire of figures called charges: lion, key, sword… It was not passed on as a drawing but as a text, the blazon, precise enough for a herald to redraw a shield he had never seen. A recipe, in short.' },
            { p: 'The project starts there: translating these rules into code. The designer no longer draws the final image, but designs the system that produces it, while remaining the author of every coat of arms it outputs.' },
          ],
        },
        {
          h: 'What was made',
          paras: [
            { p: 'A generator combining six shield shapes, fifteen partitions, twenty-three Latin mottoes and a repertoire of historical and contemporary charges. The system can produce over twenty trillion distinct compositions.' },
            { p: 'Each coat of arms is identified by a short Base36 key that acts as a seed: the same key always returns the same image, and that image can only come from that key. Where a QR code stores data for a sensor to read, the key stores the recipe for making the image.' },
            { p: 'Everything is deterministic and vector-based. Where AI images produce results without showing their rules, the project stands for the opposite: a system whose every rule is known and whose every image can be reproduced exactly.' },
          ],
        },
        {
          h: 'Key decisions',
          paras: [
            { t: 'Pure black and white.', p: 'The rule of tincture forbade placing two colours or two metals side by side. Here it becomes an inversion calculation: whenever a shape covers another, the overlapping area flips value.' },
            { t: 'Repurposed hatching.', p: 'Instead of the historical code, where line direction stands for a colour, patterns are limited to four angles (0°, 45°, 90°, 135°). Where they meet the silhouettes, they create optical vibration, kept on purpose as texture.' },
            { t: 'Cut, then order.', p: 'Partitions are masks and cut-outs, not lines drawn over a background, so the shield outline always stays legible. Inside, the first charge drawn becomes the main figure, each charge takes its own grid cell, and the letters of the mottoes, scattered across the shield, keep a minimum distance from each other.' },
            { t: 'The key as a graphic element.', p: 'Printed under each shield, it acts as both a typographic signature and an archive ID: when the eye gets lost in the inversions, the code stays exact.' },
          ],
        },
        {
          h: 'Outcome',
          paras: [
            { p: 'A 500-page bilingual book, laid out by a Python script. A theoretical essay on generative design and heraldry opens the book, followed by a selection of coats of arms, from dense 10 × 10 grids to a single shield on a full page. Spreads follow each other in random order, with one rule: facing pages always share the same background. The book applies to its own layout the logic it describes.' },
            { p: 'The generator is playable below: enter a key, get its coat of arms.' },
          ],
        },
        { h: 'Status', paras: [{ p: 'Book completed, seeking a publisher.' }] },
      ],
    },
  },
  // ---------------------------------------------------------------- HOT
  {
    slug: 'hotshot',
    years: [],
    tags: ['I', 'T', 'P'],
    yearLabel: '[Année]',
    object: 'bottle',
    draft: true,
    fr: {
      title: 'HOTSHOT',
      short: 'De la sauce piquante au restaurant',
      meta: { year: '[Année]', context: 'Concept de marque', role: 'Naming, identité, logotype, mascotte', tools: '[À compléter]' },
      lead: "Une marque de sauce piquante qui grandit jusqu'au restaurant. Un concept, mené comme une vraie commande.",
      sections: [
        { h: 'Point de départ', paras: [{ p: "Une sauce piquante, puis le lieu qui va avec. Il fallait une marque assez forte pour tenir sur une étiquette de bouteille comme sur une devanture, sans jamais changer de voix." }] },
        { h: 'Ce qui a été fait', paras: [{ p: "Le nom, un logotype dessiné sur mesure, une mascotte, une signature et toutes les déclinaisons : bouteilles, menu, sous-verres, baguettes, papier d'emballage, réseaux, site et devanture." }] },
        {
          h: 'Choix clés',
          paras: [
            { t: 'Un logotype en bloc.', p: "Des lettres condensées et anguleuses, empilées en carré, avec une bouteille qui s'invite dans le lettrage. Il tient en tampon, en étiquette comme en enseigne." },
            { t: 'Deux rouges.', p: "Un rouge vif pour la brûlure, un bordeaux profond pour le fond. La couleur fait le travail avant même la lecture." },
            { t: 'Une mascotte rétro.', p: "Un piment au trait épais, façon vieux cartoon, qui ajoute une dose d'insolence au sérieux du titrage." },
            { t: 'Un ton.', p: "« Because mild is overrated. » La signature devient un titrage à part entière, sur les affiches comme sur les murs." },
          ],
        },
        { h: 'Résultat', paras: [{ p: "Une identité complète, du produit au lieu : packaging, imprimés de table, signalétique, réseaux et site." }] },
        { h: 'Statut', paras: [{ p: 'Concept personnel, non commandé.' }] },
      ],
    },
    en: {
      title: 'HOTSHOT',
      short: 'From hot sauce to restaurant',
      meta: { year: '[Year]', context: 'Brand concept', role: 'Naming, identity, logotype, mascot', tools: '[To complete]' },
      lead: 'A hot sauce brand that grows into a restaurant. A concept, handled like a real commission.',
      sections: [
        { h: 'Starting point', paras: [{ p: 'A hot sauce, then the place that goes with it. The brand had to be strong enough to work on a bottle label as well as on a shopfront, without ever changing its voice.' }] },
        { h: 'What was made', paras: [{ p: 'The name, a custom-drawn logotype, a mascot, a tagline and every application: bottles, menu, coasters, chopsticks, wrapping paper, social media, website and shopfront.' }] },
        {
          h: 'Key decisions',
          paras: [
            { t: 'A block logotype.', p: 'Condensed, angular letters stacked into a square, with a bottle slipping into the lettering. It works as a stamp, a label or a sign.' },
            { t: 'Two reds.', p: 'A bright red for the burn, a deep burgundy for the background. The colour does the job before you even read.' },
            { t: 'A retro mascot.', p: 'A thick-lined chilli in the style of old cartoons, adding some cheek to the seriousness of the titling.' },
            { t: 'A tone of voice.', p: '“Because mild is overrated.” The tagline becomes titling in its own right, on posters as well as on walls.' },
          ],
        },
        { h: 'Outcome', paras: [{ p: 'A complete identity, from product to place: packaging, table print, signage, social media and website.' }] },
        { h: 'Status', paras: [{ p: 'Personal concept, not commissioned.' }] },
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
      text: [
        "Écriture construite de zéro, conçue comme outil d'analyse. Chaque composante (syntaxe, orthographe, direction, ductus, support) est isolée puis redéfinie à rebours des conventions établies.",
      ],
      blocks: [
        { k: 'Direction', v: "Lecture radiale : le texte se déploie depuis un centre vers l'extérieur, sans ligne ni colonne." },
        { k: 'Syntaxe', v: "L'ordre de la phrase est repensé selon la même logique. Quelques conventions sont conservées, dont la ponctuation." },
        { k: 'Inventaire', v: "60 glyphes de logique runique, dessinés et produits sous Glyphs 4." },
        { k: 'Usage', v: "Système sémantique complet : l'écriture se lit et s'inscrit. Phonologie en cours de définition." },
        { k: 'Objet', v: "Livre-objet à révélation mécanique, en développement." },
      ],
      sections: [],
    },
    en: {
      title: 'ASAPHR',
      short: 'Invented script',
      meta: { year: '2026 —', context: 'Personal research', role: 'Writing system, type design', tools: 'Glyphs 4' },
      lead: 'An invented script, made to understand how a script works.',
      text: [
        "A script built from scratch as a tool for analysis. Each component (syntax, spelling, direction, ductus, medium) is isolated, then redefined against established conventions.",
      ],
      blocks: [
        { k: 'Direction', v: 'Radial reading: the text unfolds from a centre outwards, with no lines or columns.' },
        { k: 'Syntax', v: 'Sentence order is rethought along the same logic. A few conventions are kept, punctuation among them.' },
        { k: 'Inventory', v: '60 glyphs with a runic logic, drawn and produced in Glyphs 4.' },
        { k: 'Use', v: 'A complete semantic system: the script can be read and written. Phonology still being defined.' },
        { k: 'Object', v: 'A book object with a mechanical reveal, in development.' },
      ],
      sections: [],
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
        {
          h: 'Point de départ',
          paras: [
            { p: "Un artiste arrive avec un projet, beaucoup de références, un budget et un calendrier. L'enjeu est de lui construire une image qui lui ressemble vraiment, et qui tienne aussi bien en vignette de streaming que sur un vinyle ou un t-shirt." },
          ],
        },
        {
          h: 'Méthode',
          paras: [
            { t: 'Démêler.', p: "Le brief et la discussion servent à trier trois choses : ce que l'artiste idolâtre, ce qu'il veut vraiment, et ce qui est faisable dans le temps et le budget." },
            { t: 'Chercher.', p: 'Une veille graphique ciblée, à partir de ce qui reste après ce tri.' },
            { t: 'Proposer.', p: "Deux pistes radicalement différentes. L'artiste choisit une direction plutôt qu'un compromis entre plusieurs variantes." },
          ],
        },
        {
          h: 'Choix clés',
          paras: [
            { t: 'Partir du son.', p: "Les thèmes du projet, ses sonorités, l'univers de l'artiste : tout le visuel en découle. Le projet tourne en boucle avant et pendant toute la création." },
            { t: 'Tout dessiné à la main.', p: "Presque chaque identité part d'un logotype, et les lettrages sont toujours dessinés sur mesure, jamais tirés d'une police existante. L'artiste a des lettres qui n'appartiennent qu'à lui." },
            { t: "Penser l'objet d'abord.", p: "Même à l'ère du streaming, le point de départ reste le CD ou le vinyle qu'on tient en main. Relief et découpe ont été produits sur plusieurs éditions : la pochette se manipule, se découvre, et ne se contente pas d'être regardée." },
            { t: 'Une seule main.', p: 'Chaque projet est mené seul de bout en bout, ce qui garde une cohérence totale entre le logo, la pochette et le merch.' },
          ],
        },
        {
          h: 'Résultat',
          paras: [
            { p: 'Logotypes et lettrages, pochettes, backcovers et tracklists, éditions CD et vinyle, merch, déclinaisons pour la presse et la billetterie. Plus rarement, des visuels pour la scène.' },
            { t: 'Une légende.', p: "Pour un projet à deux voix, un univers tiré des héros qui terrassent une bête, de saint Georges à Sigurd : une palette très douce relevée d'un rouge vif, le sang de la bête ; des gravures prises dans de vieux livres de contes scannés puis recomposées ; un titrage tracé à l'encre puis revectorisé ; un vinyle où le gaufrage prend tout son sens. Une proposition, finalement pas retenue." },
            { t: "L'ère d'Internet.", p: "Pour un album nourri de la pop culture des années 2000 et de l'anime Serial Experiments Lain : un récit visuel numérique avec des personnages modélisés en 3D, jusqu'au vinyle imprimé en risographie." },
            { t: 'Un graphique scientifique.', p: "Pour un album où chaque titre a son propre interprète, sorti en CD et en streaming : une esthétique sombre et minimale, empruntée aux graphiques scientifiques, simple et énigmatique à la fois." },
            { t: 'Un hommage.', p: "Pour un projet en duo, la nostalgie d'une saga de jeu vidéo culte, Kingdom Hearts, revisitée avec des éléments 3D." },
            { p: "Archive complète des commandes sur la page Archive." },
          ],
        },
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
        {
          h: 'Starting point',
          paras: [
            { p: 'An artist comes with a project, a lot of references, a budget and a schedule. The goal is to build an image that truly feels like them, and that works as well as a streaming thumbnail as on a vinyl sleeve or a t-shirt.' },
          ],
        },
        {
          h: 'Method',
          paras: [
            { t: 'Untangle.', p: 'The brief and the conversation sort out three things: what the artist idolises, what they actually want, and what is doable within the time and budget.' },
            { t: 'Research.', p: 'Focused visual research, based on what is left after that sorting.' },
            { t: 'Propose.', p: 'Two radically different directions. The artist picks a direction rather than a compromise between variations.' },
          ],
        },
        {
          h: 'Key decisions',
          paras: [
            { t: 'Start from the sound.', p: "The project's themes, its sonic textures, the artist's world: everything visual flows from there. The music plays on loop before and throughout the whole process." },
            { t: 'Everything drawn by hand.', p: 'Almost every identity starts with a logotype, and lettering is always custom-drawn, never taken from an existing typeface. The artist gets letters that belong to no one else.' },
            { t: 'Object first.', p: 'Even in the streaming era, the starting point is the CD or the vinyl you hold in your hands. Embossing and die-cuts were produced on several releases: the sleeve is handled and discovered, not just looked at.' },
            { t: 'One pair of hands.', p: 'Every project is carried out alone from start to finish, which keeps the logo, the sleeve and the merch fully consistent.' },
          ],
        },
        {
          h: 'Outcome',
          paras: [
            { p: 'Logotypes and lettering, front covers, back covers and tracklists, CD and vinyl editions, merch, press and ticketing assets. More rarely, visuals for the stage.' },
            { t: 'A legend.', p: 'For a two-voice project, a world drawn from heroes slaying a beast, from Saint George to Sigurd: a very soft palette lifted by a bright red, the blood of the beast; engravings taken from old scanned books of tales and recomposed; titling drawn in ink then revectorised; a vinyl where the embossing comes into its own. A proposal, not kept in the end.' },
            { t: 'The Internet age.', p: 'For an album steeped in 2000s pop culture and the anime Serial Experiments Lain: a digital visual story with characters modelled in 3D, all the way to a risograph-printed vinyl.' },
            { t: 'A scientific chart.', p: 'For an album where every track has its own performer, released on CD and streaming: a dark, minimal look borrowed from scientific charts, plain and enigmatic at once.' },
            { t: 'A tribute.', p: 'For a duo project, the nostalgia of a cult video game saga, Kingdom Hearts, revisited with 3D elements.' },
            { p: 'Full archive of commissions on the Archive page.' },
          ],
        },
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
      title: 'Sports Aventure',
      short: 'Refonte non sollicitée',
      meta: { year: '2024', context: 'Initiative personnelle, présentée au magasin', role: 'Direction artistique, identité, UX/UI', tools: '[À compléter]' },
      lead: "La refonte d'un magasin d'équipement outdoor bordelais, faite sans commande, puis présentée à l'équipe.",
      sections: [
        { h: 'Point de départ', paras: [{ p: "Client régulier de ce magasin spécialisé dans la randonnée, j'y retrouvais dans les rayons un esprit d'aventure que son site ne transmettait pas. J'ai repensé l'expérience en ligne de moi-même, puis je suis allé leur présenter le résultat." }] },
        { h: 'Ce qui a été fait', paras: [{ p: "Une identité reconstruite autour de quatre éléments (typographie, palette, images, pictogrammes), un nouveau logo, le site complet, et son extension au print : affichage, sacs, cartes de fidélité." }] },
        {
          h: 'Choix clés',
          paras: [
            { t: 'Une palette de terrain.', p: "Le vert délavé d'origine laisse place à des kakis terreux et des bruns profonds, pris à la nature." },
            { t: 'Une montagne pour logo.', p: "Une montagne stylisée, simple et forte, qui range le magasin dans la famille visuelle des grandes marques outdoor." },
            { t: 'Un site qui donne envie de partir.', p: "Accès direct aux catégories et aux fonctions de la boutique, images plein cadre et grand titrage « Explore » : chaque écran pousse à aller plus loin." },
            { t: 'Des pictogrammes maison.', p: "Une série d'icônes simples pour se repérer dans l'interface." },
          ],
        },
        { h: 'Résultat', paras: [{ p: 'Une identité cohérente en ligne comme en magasin, du site au sac de caisse.' }] },
        { h: 'Statut', paras: [{ p: 'Présenté au magasin.' }] },
      ],
    },
    en: {
      title: 'Sports Aventure',
      short: 'Unsolicited redesign',
      meta: { year: '2024', context: 'Self-initiated, pitched to the store', role: 'Art direction, identity, UX/UI', tools: '[To complete]' },
      lead: 'The redesign of an outdoor gear store in Bordeaux, made without a brief, then pitched to the team.',
      sections: [
        { h: 'Starting point', paras: [{ p: "As a regular customer of this hiking specialist, I found a spirit of adventure in its aisles that its website didn't convey. I rethought the online experience on my own, then went to show them the result." }] },
        { h: 'What was made', paras: [{ p: 'An identity rebuilt around four elements (type, palette, imagery, icons), a new logo, the full website, and its extension to print: billboards, bags, loyalty cards.' }] },
        {
          h: 'Key decisions',
          paras: [
            { t: 'A palette from the field.', p: 'The original faded green gives way to earthy khakis and deep browns, taken from nature.' },
            { t: 'A mountain for a logo.', p: 'A stylised mountain, simple and strong, placing the store in the visual family of the major outdoor brands.' },
            { t: 'A site that makes you want to head out.', p: 'Direct access to categories and store features, full-bleed images and a large “Explore” title: every screen pushes you further.' },
            { t: 'Custom icons.', p: 'A set of simple icons to find your way through the interface.' },
          ],
        },
        { h: 'Outcome', paras: [{ p: 'A consistent identity online and in store, from the website to the shopping bag.' }] },
        { h: 'Status', paras: [{ p: 'Pitched to the store.' }] },
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
        { h: 'Point de départ', paras: [{ p: "BMS Esports est un club spécialisé dans les jeux de combat en un contre un : Smash Ultimate, Dragon Ball FighterZ, Street Fighter. Il voulait renforcer sa présence en ligne et mettre en avant ce qui le distingue, la formation de jeunes talents, avec une ambition claire : devenir une référence du genre." }] },
        { h: 'Ce qui a été fait', paras: [{ p: "La direction artistique et le design complet du site, de l'arborescence aux maquettes. En parallèle, l'adaptation de la boutique en ligne, pour passer de la découverte du club au merch sans changer d'univers." }] },
        {
          h: 'Choix clés',
          paras: [
            { t: 'Un ton plus affirmé.', p: "Une typographie nerveuse et une mise en page franche, à l'image de la compétition. La palette reprend les couleurs du club." },
            { t: 'Donner envie de fouiller.', p: 'Le design reste joueur et vif : chaque page invite à creuser plus loin.' },
            { t: 'Un mode clair.', p: 'Ajouté à la demande du client, à côté du mode sombre, pour lire confortablement partout.' },
          ],
        },
        { h: 'Résultat', paras: [{ p: "Un site et une boutique qui forment un seul parcours, et une présence en ligne à la hauteur des ambitions du club." }] },
      ],
    },
    en: {
      title: 'BMS E-Sport',
      short: 'Website and store',
      meta: { year: '2023', context: 'Client commission', role: 'Art direction, UX/UI, web design', tools: 'Figma' },
      lead: 'The website of an esports club focused on fighting games, built to show its level and the young players it develops.',
      sections: [
        { h: 'Starting point', paras: [{ p: 'BMS Esports is a club dedicated to one-on-one fighting games: Smash Ultimate, Dragon Ball FighterZ, Street Fighter. It wanted a stronger online presence and to highlight what sets it apart, developing young talent, with a clear ambition: becoming a reference in the genre.' }] },
        { h: 'What was made', paras: [{ p: 'Art direction and the full design of the website, from site map to mock-ups. Alongside it, the redesign of the online store, so visitors move from discovering the club to its merch without leaving its world.' }] },
        {
          h: 'Key decisions',
          paras: [
            { t: 'A bolder tone.', p: "Sharp typography and a straightforward layout, in tune with competition. The palette follows the club's colours." },
            { t: 'Make people dig.', p: 'The design stays playful and lively: every page invites you to go further.' },
            { t: 'A light mode.', p: 'Added at the client\'s request, alongside the dark mode, for comfortable reading anywhere.' },
          ],
        },
        { h: 'Outcome', paras: [{ p: "A website and a store that form a single journey, and an online presence that matches the club's ambitions." }] },
      ],
    },
  },
];
