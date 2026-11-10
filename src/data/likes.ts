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
  link?: string;   // lien discret sur le sous-titre (ex. Letterboxd)
  embed?: string;  // lecteur intégré dans l'objet ouvert (ex. playlist Spotify, URL « embed »)
  fr: { title: string; sub: string; text: string };
  en: { title: string; sub: string; text: string };
};

export const likes: Like[] = [
  { id: 'lotr', src: '/likes/lotr.webp', shape: 'rect', w: 782, h: 1200,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Le Seigneur des anneaux', sub: 'Le livre', text: 'Mon œuvre de tous les temps, et sûrement ma plus grosse inspiration. Un monde entier inventé par un linguiste, avec ses langues, ses alphabets et ses cartes avant même l\'histoire. C\'est là que j\'ai compris qu\'une écriture pouvait raconter autant qu\'un récit. ASAPHR vient en partie de là.' },
    en: { title: 'The Lord of the Rings', sub: 'The book', text: 'My all-time favourite work, and probably my biggest inspiration. A whole world invented by a linguist, with its own languages, alphabets and maps before the story even starts. That\'s where I understood a script can tell as much as a plot. ASAPHR partly comes from there.' } },
  { id: 'one-piece', src: '/likes/one-piece.webp', shape: 'rect', w: 466, h: 794,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'One Piece', sub: 'La carte gradée', text: 'C\'est ma collection, tout simplement. J\'adore One Piece, et j\'ai un rapport très fort au complétionnisme : il me faut la carte, puis la version alternative, puis celle qui est gradée. Ce Luffy est noté 10 et ne sort plus de sa coque (on regarde, on ne touche pas).' },
    en: { title: 'One Piece', sub: 'The graded card', text: 'It\'s my collection, simple as that. I love One Piece, and I have a very strong completionist streak: I need the card, then the alternate art, then the graded one. This Luffy scored a 10 and never leaves its case (look, don\'t touch).' } },
  { id: 'the-thing', link: LETTERBOXD, src: '/likes/the-thing.webp', shape: 'rect', w: 406, h: 520,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Films d\'horreur', sub: 'The Thing, John Carpenter', text: 'Je regarde de tout, mais je reviens toujours à l\'horreur. The Thing tient en trois éléments : une base isolée, douze hommes, et plus personne à qui faire confiance. Il n\'en faut pas plus. C\'est aussi là que je vais chercher des affiches et des génériques : un bon titre de film d\'horreur fait peur avant la première image.' },
    en: { title: 'Horror films', sub: 'The Thing, John Carpenter', text: 'I watch everything, but I always come back to horror. The Thing comes down to three things: an isolated base, twelve men, and no one left to trust. Nothing more needed. It\'s also where I go looking for posters and title sequences: a good horror title scares you before the first frame.' } },
  { id: 'backpack', link: KERN_OUTDOOR, src: '/likes/backpack.webp', shape: 'rect', w: 280, h: 520,
    hull: [[0.029,0.123],[0.114,0.062],[0.343,0.0],[0.714,0.0],[0.9,0.069],[0.957,0.208],[1.0,0.392],[0.971,0.846],[0.914,0.954],[0.743,1.0],[0.371,1.0],[0.1,0.985],[0.014,0.869],[0.0,0.531]],
    fr: { title: 'Randonnée & bivouac', sub: 'Le sac, toujours prêt', text: 'La montagne, je la pratique depuis que je sais marcher. Je viens du Pays basque, où il suffit de lever la tête pour avoir envie d\'y aller. Aujourd\'hui je prépare le diplôme d\'accompagnateur en moyenne montagne (AMM), et les plus belles nuits se passent sous la tente, là-haut. Ce que j\'en rapporte finit sur kern.outdoor, un média sur le terrain et le matériel.' },
    en: { title: 'Hiking & bivouac', sub: 'The pack, always ready', text: 'I\'ve been walking up mountains for as long as I\'ve been walking. I\'m from the Basque Country, where you only need to look up to want to go. I\'m now training for the French mountain leader diploma (AMM), and the best nights are spent in a tent, up there. What I bring back ends up on kern.outdoor, a media about the field and the gear.' } },
  { id: 'hold-1', src: '/likes/hold-1.webp', shape: 'rect', w: 520, h: 239,
    hull: [[0.0,0.644],[0.123,0.085],[0.169,0.034],[0.931,0.0],[0.977,0.068],[1.0,0.169],[1.0,0.305],[0.938,0.661],[0.908,0.746],[0.731,0.983],[0.662,1.0],[0.231,0.932],[0.054,0.831],[0.0,0.746]],
    fr: { title: 'Escalade', sub: 'La prise', text: 'Le rocher, les mains, et rien entre les deux. Une voie se lit d\'en bas comme une énigme : on la tente, on tombe, on la relit, jusqu\'à ce que le bon mouvement paraisse évident. Le même plaisir qu\'une grille qui finit par tomber juste.' },
    en: { title: 'Climbing', sub: 'The hold', text: 'The rock, your hands, and nothing in between. A route reads from below like a riddle: you try, you fall, you read it again, until the right move looks obvious. The same pleasure as a grid that finally falls into place.' } },
  { id: 'running', src: '/likes/running.webp', shape: 'rect', w: 520, h: 246,
    hull: [[0.0,0.672],[0.046,0.295],[0.085,0.131],[0.415,0.0],[0.946,0.41],[0.977,0.443],[1.0,0.623],[0.946,0.754],[0.8,0.934],[0.662,1.0],[0.431,1.0],[0.154,0.951],[0.046,0.885],[0.0,0.82]],
    fr: { title: 'Course à pied', sub: 'La chaussure', text: 'Je cours pour la même raison que d\'autres méditent. Une heure, une montre, un tracé, et le projet qui coinçait le matin se débloque quelque part vers le dixième kilomètre (rarement avant).' },
    en: { title: 'Running', sub: 'The shoe', text: 'I run for the same reason others meditate. An hour, a watch, a route, and the project that was stuck in the morning comes loose somewhere around the tenth kilometre (rarely before).' } },
  { id: 'wheel', src: '/likes/wheel.webp', shape: 'circle', w: 520, h: 519,
    hull: [[0.0,0.434],[0.062,0.248],[0.262,0.054],[0.431,0.0],[0.723,0.047],[0.938,0.248],[1.0,0.434],[0.946,0.736],[0.846,0.868],[0.685,0.969],[0.431,1.0],[0.154,0.868],[0.054,0.736],[0.0,0.566]],
    fr: { title: 'Pignon fixe', sub: 'La roue', text: 'Pas de roue libre, pas de vitesses, souvent pas de frein. Le vélo réduit à ce qui compte : tant que les roues tournent, on pédale. Une contrainte qui oblige à lire chaque rue à l\'avance, et que j\'aime pour ça.' },
    en: { title: 'Fixed gear', sub: 'The wheel', text: 'No freewheel, no gears, often no brakes. The bike reduced to what matters: as long as the wheels turn, you pedal. A constraint that makes you read every street ahead, and I like it for that.' } },
  { id: 'controller', src: '/likes/controller.webp', shape: 'rect', w: 1058, h: 734,
    hull: [[0.001,0.766],[0.047,0.466],[0.135,0.139],[0.179,0.059],[0.289,0.001],[0.708,0.001],[0.776,0.022],[0.868,0.146],[0.95,0.455],[0.99,0.67],[0.996,0.847],[0.904,0.997],[0.099,0.999],[0.023,0.924]],
    fr: { title: 'Jeu vidéo', sub: 'La manette', text: 'Je joue depuis toujours, sur PC aujourd\'hui, et surtout aux Soulslikes : des jeux qui te tuent jusqu\'à ce que tu comprennes. Sekiro, je le speedrun. Je suis sûrement mort plus de fois face à Isshin que je n\'ai dit bonjour à mes voisins, mais maintenant je le bats les yeux fermés (presque).' },
    en: { title: 'Video games', sub: 'The controller', text: 'I\'ve always played, on PC these days, and mostly Soulslikes: games that kill you until you get it. Sekiro, I speedrun. I\'ve probably died to Isshin more times than I\'ve said hello to my neighbours, but now I beat him with my eyes closed (almost).' } },
  { id: 'basque', src: '/likes/basque.webp', shape: 'rect', w: 705, h: 395,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Pays basque', sub: 'Le drapeau', text: 'Je viens du Pays basque, et ça ne part pas. Une langue que personne d\'autre ne comprend, des montagnes au bout de la route et du piment d\'Espelette dans à peu près tout. On peut vivre ailleurs, on reste basque (et on le fait savoir à chaque repas).' },
    en: { title: 'Basque Country', sub: 'The flag', text: 'I\'m from the Basque Country, and it doesn\'t wear off. A language nobody else understands, mountains at the end of the road and Espelette pepper in pretty much everything. You can live elsewhere, you stay Basque (and you let everyone know at every meal).' } },
  { id: 'ipod', embed: SPOTIFY, src: '/likes/ipod.webp', shape: 'rect', w: 219, h: 520,
    hull: [[0.0,0.008],[0.037,0.0],[0.963,0.0],[1.0,0.008],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Musique', sub: 'L\'iPod nano', text: 'La musique fait partie de ma vie, au point d\'en avoir fait une partie de mon métier : je dessine les identités d\'artistes. Il ne se passe pas un jour sans que j\'en écoute, et j\'adore en découvrir, en creusant d\'un album à l\'autre. Chaque projet musical commence d\'ailleurs par écouter le disque en boucle. Mettez le casque.' },
    en: { title: 'Music', sub: 'The iPod nano', text: 'Music is part of my life, to the point of making it part of my job: I design identities for artists. Not a day goes by without it, and I love discovering new music, digging from one album to the next. Every music project starts with the record on loop. Put your headphones on.' } },
  { id: 'keyboard', link: '/lab/', src: '/likes/keyboard.webp', shape: 'rect', w: 520, h: 215,
    hull: [[0.0,0.019],[0.008,0.0],[0.985,0.0],[1.0,0.038],[1.0,0.962],[0.985,1.0],[0.015,1.0],[0.0,0.981]],
    fr: { title: 'Code', sub: 'Le clavier', text: 'J\'aime ouvrir les choses pour voir comment elles marchent : un logiciel, un jeu à modder, un serveur monté à la maison qui fait tourner mes films et ma musique. Et je code des petits sites pour faire rire mes potes, comme un quiz de culture générale ou un test qui juge votre cinéphilie d\'après votre Letterboxd. Les deux sont dans le Lab.' },
    en: { title: 'Code', sub: 'The keyboard', text: 'I like opening things up to see how they work: a piece of software, a game to mod, a home server that runs my films and music. And I code small sites to make my friends laugh, like a general-knowledge quiz or a test that judges your film culture from your Letterboxd. Both are in the Lab.' } },
  { id: 'plane', src: '/likes/plane.webp', shape: 'rect', w: 1200, h: 270,
    hull: [[0.001,0.126],[0.175,0.004],[0.192,0.004],[0.886,0.541],[0.927,0.615],[0.983,0.759],[0.999,0.841],[0.948,0.907],[0.838,0.97],[0.637,0.993],[0.432,1.0],[0.282,0.844],[0.179,0.726],[0.165,0.7]],
    fr: { title: 'Voyage', sub: 'L\'avion', text: 'Je passe mes journées assis devant un écran, alors quand je pars, je rattrape. Des road-trips denses, beaucoup de route et peu de plan, comme la Roumanie de bout en bout par la Transfăgărășan et ses lacets dans les Carpates. Je rentre plus fatigué qu\'en partant, et c\'est exactement le but (l\'avion, c\'est juste pour l\'aller).' },
    en: { title: 'Travel', sub: 'The plane', text: 'I spend my days sitting in front of a screen, so when I leave, I catch up. Dense road trips, lots of road and little plan, like Romania end to end over the Transfăgărășan and its hairpins in the Carpathians. I come back more tired than when I left, and that\'s exactly the point (the plane is just for getting there).' } },
];
