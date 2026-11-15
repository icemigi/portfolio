// « Ce que j'aime » : chaque centre d'intérêt est un objet détouré qui tombe dans l'écran.
// w × h : proportions de l'image (tous les objets ont la même surface à l'écran) ;
// hull : contour de collision (enveloppe convexe du PNG, coordonnées 0–1), pour que les objets se touchent vraiment.
// Textes : écrits à partir des notes de Xavier (01/11), à relire.
// Liens : LETTERBOXD (sur le DVD), KERN_OUTDOOR (sur le sac) et SPOTIFY (lecteur dans l'écran de l'iPod, lien « embed »).
const LETTERBOXD = 'https://letterboxd.com/icemigi/';
const KERN_OUTDOOR = 'https://www.instagram.com/kern.outdoor/'; // le média outdoor (sur le sac à dos)
const SPOTIFY = 'https://open.spotify.com/embed/playlist/5pJ0LEKT6sF4oUpoI8Hkme?utm_source=generator&theme=0'; // playlist de test, à remplacer
export type Like = {
  id: string;
  src: string;
  shape: 'rect' | 'circle';
  w: number; h: number;
  hull: [number, number][];
  scale?: number;  // correction de taille : un objet fait surtout de vide (le vélo) paraît petit à surface de contour égale
  link?: string;   // lien discret sur le sous-titre (ex. Letterboxd)
  embed?: string;  // lecteur intégré dans l'objet ouvert (ex. playlist Spotify, URL « embed »)
  fr: { title: string; text: string };
  en: { title: string; text: string };
};

export const likes: Like[] = [
  { id: 'lotr', src: '/likes/lotr.webp', shape: 'rect', w: 782, h: 1200,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Le Seigneur des anneaux', text: "Un monde entier, inventé par un type qui a commencé par ses alphabets (ça me parle). Mon livre préféré, et de loin. C'est là que j'ai compris qu'une écriture peut raconter une histoire (ASAPHR vient un peu de là)." },
    en: { title: 'The Lord of the Rings', text: "A whole world, invented by a man who started with its alphabets (I can relate). My favourite book, by far. That's where I understood that a script can tell a story (ASAPHR comes partly from there)." } },
  { id: 'one-piece', src: '/likes/one-piece.webp', shape: 'rect', w: 466, h: 794,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'One Piece', text: "Un Luffy noté 10, scellé pour toujours (on regarde, on touche pas). J'adore One Piece, et je suis complétionniste : la carte, l'alternative, puis la gradée (pour la même carte)." },
    en: { title: 'One Piece', text: "A Luffy graded 10, sealed forever (look, don't touch). I love One Piece, and I'm a completionist: the card, the alt art, then the graded one (of the same card)." } },
  { id: 'the-thing', link: LETTERBOXD, src: '/likes/the-thing.webp', shape: 'rect', w: 406, h: 520,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Cinéma', text: "Je regarde de tout, au ciné comme sur le canapé, avec un faible pour ce qui fait peur (The Thing en tête). Mais si on regarde un film ensemble en Antarctique, test sanguin d'abord (et méfie-toi du chien)." },
    en: { title: 'Cinema', text: "I watch everything, at the cinema or on the couch, with a soft spot for what's scary (The Thing first). But if we watch a film together in Antarctica, blood test first (and watch out for the dog)." } },
  { id: 'backpack', link: KERN_OUTDOOR, src: '/likes/backpack.webp', shape: 'rect', w: 280, h: 520,
    hull: [[0.029,0.123],[0.114,0.062],[0.343,0.0],[0.714,0.0],[0.9,0.069],[0.957,0.208],[1.0,0.392],[0.971,0.846],[0.914,0.954],[0.743,1.0],[0.371,1.0],[0.1,0.985],[0.014,0.869],[0.0,0.531]],
    fr: { title: 'Randonnée & bivouac', text: "La montagne depuis que je sais marcher, et mes plus belles nuits, je les passe sous la tente, là-haut (le réveil est dur, la vue compense). Je prépare le diplôme d'accompagnateur en moyenne montagne (le sac est toujours prêt, au cas où)." },
    en: { title: 'Hiking & bivouac', text: "Mountains since I could walk, and my best nights are spent in a tent, up there (waking up is hard, the view makes up for it). I'm training for the mountain leader qualification (the bag is always packed, just in case)." } },
  { id: 'hold-1', src: '/likes/hold-1.webp', shape: 'rect', w: 520, h: 239,
    hull: [[0.0,0.644],[0.123,0.085],[0.169,0.034],[0.931,0.0],[0.977,0.068],[1.0,0.169],[1.0,0.305],[0.938,0.661],[0.908,0.746],[0.731,0.983],[0.662,1.0],[0.231,0.932],[0.054,0.831],[0.0,0.746]],
    fr: { title: 'Escalade', text: "Le rocher quand il fait beau, la salle quand il pleut (donc souvent la salle). Avant-bras en feu, magnésie partout, et toujours cette prise un peu trop loin (elle l'est toujours)." },
    en: { title: 'Climbing', text: "Rock when it's sunny, the gym when it rains (so, mostly the gym). Forearms on fire, chalk everywhere, and always that one hold just out of reach (it always is)." } },
  { id: 'running', src: '/likes/running.webp', shape: 'rect', w: 520, h: 246,
    hull: [[0.0,0.672],[0.046,0.295],[0.085,0.131],[0.415,0.0],[0.946,0.41],[0.977,0.443],[1.0,0.623],[0.946,0.754],[0.8,0.934],[0.662,1.0],[0.431,1.0],[0.154,0.951],[0.046,0.885],[0.0,0.82]],
    fr: { title: 'Course à pied', text: "Je fais partie de ces gens qui courent le dimanche matin (tôt, sinon ça compte pas) et qui le font savoir. Officiellement pour ma santé, en vrai pour l'iced latte en terrasse (et les kudos)." },
    en: { title: 'Running', text: "I'm one of those people who run on Sunday mornings (early, or it doesn't count) and make sure everyone knows. Officially for my health, really for the iced latte on a terrace (and the kudos)." } },
  { id: 'fixie', src: '/likes/fixie.webp', shape: 'rect', w: 1200, h: 755, scale: 1.3,
    hull: [[0.0,0.638],[0.027,0.505],[0.231,0.011],[0.385,0.011],[0.796,0.112],[0.876,0.176],[0.987,0.548],[0.997,0.729],[0.95,0.883],[0.886,0.963],[0.793,1.0],[0.194,1.0],[0.114,0.963],[0.013,0.787]],
    fr: { title: 'Pignon fixe', text: "Pignon fixe, pas de frein, et un vélo qui coûte plus cher que mon loyer (je sais). Dans les côtes je souffre en silence, aux feux rouges je fais du surplace (personne ne m'a rien demandé)." },
    en: { title: 'Fixed gear', text: "Fixed gear, no brakes, and a bike that costs more than my rent (I know). On climbs I suffer in silence, at red lights I track-stand (nobody asked)." } },
  { id: 'controller', src: '/likes/controller.webp', shape: 'rect', w: 1058, h: 734,
    hull: [[0.001,0.766],[0.047,0.466],[0.135,0.139],[0.179,0.059],[0.289,0.001],[0.708,0.001],[0.776,0.022],[0.868,0.146],[0.95,0.455],[0.99,0.67],[0.996,0.847],[0.904,0.997],[0.099,0.999],[0.023,0.924]],
    fr: { title: 'Jeu vidéo', text: "Je joue à tout ce qui fait rager : des Soulslikes, Counter-Strike, des tournois de Smash Bros entre potes (que je gagne, parfois), et du speedrun sur Sekiro (je suis mort plus de fois face à Isshin que je n'ai dit bonjour à mes voisins)." },
    en: { title: 'Video games', text: "I play anything that makes me rage: Soulslikes, Counter-Strike, Smash Bros tournaments with friends (which I sometimes win), and Sekiro speedruns (I've died to Isshin more times than I've said hello to my neighbours)." } },
  { id: 'basque', src: '/likes/basque.webp', shape: 'rect', w: 1200, h: 849,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Pays basque', text: "On peut quitter le Pays basque, mais lui ne te quitte pas (j'ai essayé). Des montagnes au bout de la route, une langue que personne d'autre ne parle, et je le rappelle à chaque repas (j'aime le piment d'Espelette)." },
    en: { title: 'Basque Country', text: "You can leave the Basque Country, but it never leaves you (I tried). Mountains at the end of the road, a language nobody else speaks, and I bring it up at every meal (I love Espelette pepper)." } },
  { id: 'ipod', embed: SPOTIFY, src: '/likes/ipod.webp', shape: 'rect', w: 219, h: 520,
    hull: [[0.0,0.008],[0.037,0.0],[0.963,0.0],[1.0,0.008],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Musique', text: "Un album, ça s'écoute en entier, dans l'ordre, au casque. Je lis ses crédits jusqu'au bout (oui, tous les noms), ceux des clips aussi, et c'est comme ça que je trouve mes prochains coups de cœur. Et oui, j'ai vraiment un iPod (il a survécu à trois téléphones)." },
    en: { title: 'Music', text: "An album is meant to be heard in full, in order, on headphones. I read its credits to the very end (yes, every name), music videos too, and that's how I find my next favourites. And yes, I really do have an iPod (it has outlived three phones)." } },
  { id: 'keyboard', link: '/lab/', src: '/likes/keyboard.webp', shape: 'rect', w: 520, h: 215,
    hull: [[0.0,0.019],[0.008,0.0],[0.985,0.0],[1.0,0.038],[1.0,0.962],[0.985,1.0],[0.015,1.0],[0.0,0.981]],
    fr: { title: 'Code', text: "J'ouvre tout pour voir comment ça marche : un logiciel, un jeu à modder, un serveur à la maison qui fait tourner mes films (il fait plus de bruit que le frigo). Et je code des petits sites pour faire rire mes potes (y'en a dans le Lab si tu veux !)." },
    en: { title: 'Code', text: "I open everything up to see how it works: software, a game to mod, a home server that runs my films (it's louder than the fridge). And I code small sites to make my friends laugh (there are some in the Lab if you want!)." } },
  { id: 'plane', src: '/likes/plane.webp', shape: 'rect', w: 1200, h: 335,
    hull: [[0.0,0.723],[0.047,0.566],[0.074,0.518],[0.104,0.494],[0.923,0.0],[0.957,0.0],[0.993,0.506],[0.99,0.518],[0.933,0.614],[0.826,0.723],[0.538,1.0],[0.074,1.0],[0.067,0.988],[0.0,0.759]],
    fr: { title: 'Voyage', text: "Assis devant un écran toute l'année, alors en voyage, je rattrape. Une voiture de location, beaucoup de route, peu de programme et peu de sommeil (je pars rarement pour me reposer). Je rentre plus fatigué qu'en partant (c'est le but)." },
    en: { title: 'Travel', text: "Sitting in front of a screen all year, so when I travel, I make up for it. A rental car, lots of road, little planning and little sleep (I rarely go away to rest). I come back more tired than when I left (that's the point)." } },
];
