// « Ce que j'aime » : chaque centre d'intérêt est un objet détouré qui tombe dans l'écran.
// w × h : proportions de l'image ; cm : taille réelle (sert à garder une hiérarchie douce entre les objets) ;
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
  cm: number;
  hull: [number, number][];
  link?: string;   // lien discret sur le sous-titre (ex. Letterboxd)
  embed?: string;  // lecteur intégré dans l'objet ouvert (ex. playlist Spotify, URL « embed »)
  fr: { title: string; sub: string; text: string };
  en: { title: string; sub: string; text: string };
};

export const likes: Like[] = [
  { id: 'lotr', src: '/likes/lotr.webp', shape: 'rect', w: 338, h: 520, cm: 20,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Le Seigneur des anneaux', sub: 'Le Retour du roi', text: 'Mon œuvre de tous les temps, et sûrement ma plus grosse inspiration. Un monde entier inventé par un linguiste, avec ses langues, ses alphabets et ses cartes avant même l\'histoire. C\'est là que j\'ai compris qu\'une écriture pouvait raconter autant qu\'un récit. ASAPHR vient en partie de là.' },
    en: { title: 'The Lord of the Rings', sub: 'The Return of the King', text: 'My all-time favourite work, and probably my biggest inspiration. A whole world invented by a linguist, with its own languages, alphabets and maps before the story even starts. That\'s where I understood a script can tell as much as a plot. ASAPHR partly comes from there.' } },
  { id: 'one-piece', src: '/likes/one-piece.webp', shape: 'rect', w: 303, h: 520, cm: 13.5,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'One Piece', sub: 'La carte gradée', text: 'C\'est ma collection, tout simplement. J\'adore One Piece, et j\'ai un rapport très fort au complétionnisme : il me faut la carte, puis la version alternative, puis celle qui est gradée. Celle-ci est notée 10 et ne sort plus de sa coque (on regarde, on ne touche pas).' },
    en: { title: 'One Piece', sub: 'The graded card', text: 'It\'s my collection, simple as that. I love One Piece, and I have a very strong completionist streak: I need the card, then the alternate art, then the graded one. This one scored a 10 and never leaves its case (look, don\'t touch).' } },
  { id: 'the-thing', link: LETTERBOXD, src: '/likes/the-thing.webp', shape: 'rect', w: 406, h: 520, cm: 17,
    hull: [[0.0,0.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Films d\'horreur', sub: 'The Thing, John Carpenter', text: 'J\'adore le cinéma, tous les genres, avec un faible pour l\'horreur. The Thing reste mon modèle : un lieu fermé, une poignée de personnages, et la paranoïa qui fait le reste. Les films sont une de mes sources principales pour les affiches et le titrage ; je regarde un générique comme d\'autres regardent un tableau.' },
    en: { title: 'Horror films', sub: 'The Thing, John Carpenter', text: 'I love cinema, every genre, with a soft spot for horror. The Thing is still my reference: one closed place, a handful of characters, and paranoia does the rest. Films are one of my main sources for posters and titling; I watch opening credits the way some people look at paintings.' } },
  { id: 'backpack', link: KERN_OUTDOOR, src: '/likes/backpack.webp', shape: 'rect', w: 280, h: 520, cm: 60,
    hull: [[0.029,0.123],[0.114,0.062],[0.343,0.0],[0.714,0.0],[0.9,0.069],[0.957,0.208],[1.0,0.392],[0.971,0.846],[0.914,0.954],[0.743,1.0],[0.371,1.0],[0.1,0.985],[0.014,0.869],[0.0,0.531]],
    fr: { title: 'Randonnée', sub: 'Le sac, toujours prêt', text: 'La montagne, je la pratique depuis que je sais marcher. Je viens du Pays basque, où il suffit de lever la tête pour avoir envie d\'y aller, et j\'y ai grimpé assez de dénivelé pour pousser jusqu\'à des niveaux sérieux. Aujourd\'hui je prépare le diplôme d\'accompagnateur en moyenne montagne (AMM). Le sac est toujours à moitié prêt dans l\'entrée (on ne sait jamais). Ce que j\'en rapporte finit sur kern.outdoor, un média sur le terrain et le matériel.' },
    en: { title: 'Hiking', sub: 'The pack, always ready', text: 'I\'ve been walking up mountains for as long as I\'ve been walking. I\'m from the Basque Country, where you only need to look up to want to go, and I\'ve climbed enough elevation there to reach fairly serious levels. I\'m now training for the French mountain leader diploma (AMM). The pack is always half-packed by the door (you never know). What I bring back ends up on kern.outdoor, a media about the field and the gear.' } },
  { id: 'hold-1', src: '/likes/hold-1.webp', shape: 'rect', w: 520, h: 239, cm: 25,
    hull: [[0.0,0.644],[0.123,0.085],[0.169,0.034],[0.931,0.0],[0.977,0.068],[1.0,0.169],[1.0,0.305],[0.938,0.661],[0.908,0.746],[0.731,0.983],[0.662,1.0],[0.231,0.932],[0.054,0.831],[0.0,0.746]],
    fr: { title: 'Escalade', sub: 'La prise', text: 'L\'escalade est sans doute le sport qui me relie à la nature de la façon la plus pure : le rocher, les mains, rien d\'autre. Et j\'adore son côté puzzle. Chaque voie est une énigme qu\'on lit d\'en bas, qu\'on rate, qu\'on relit, jusqu\'au moment où le bon mouvement devient évident.' },
    en: { title: 'Climbing', sub: 'The hold', text: 'Climbing is probably the sport that connects me to nature in the purest way: the rock, your hands, nothing else. And I love the puzzle side of it. Every route is a riddle you read from below, fail, read again, until the right move suddenly becomes obvious.' } },
  { id: 'hold-2', src: '/likes/hold-2.webp', shape: 'rect', w: 520, h: 393, cm: 20,
    hull: [[0.0,0.898],[0.046,0.776],[0.123,0.612],[0.415,0.041],[0.454,0.0],[0.492,0.0],[0.538,0.051],[0.677,0.265],[0.877,0.612],[1.0,0.857],[0.985,0.929],[0.823,0.99],[0.531,1.0],[0.015,1.0]],
    fr: { title: 'Escalade', sub: 'L\'autre prise (celle qui sourit)', text: 'Celle-là a une tête. On ne sait jamais si elle se moque de vous ou si elle vous encourage.' },
    en: { title: 'Climbing', sub: 'The other hold (the smiling one)', text: 'This one has a face. You never know if it\'s laughing at you or cheering you on.' } },
  { id: 'running', src: '/likes/running.webp', shape: 'rect', w: 520, h: 246, cm: 30,
    hull: [[0.0,0.672],[0.046,0.295],[0.085,0.131],[0.415,0.0],[0.946,0.41],[0.977,0.443],[1.0,0.623],[0.946,0.754],[0.8,0.934],[0.662,1.0],[0.431,1.0],[0.154,0.951],[0.046,0.885],[0.0,0.82]],
    fr: { title: 'Course à pied', sub: 'La chaussure', text: 'Courir, c\'est ce qui me garde en forme, et surtout ce qui me vide la tête. De la musique dans les oreilles, un tracé dans la montre, et les idées se rangent toutes seules. Il n\'y a pas mieux pour démêler un projet qui coince.' },
    en: { title: 'Running', sub: 'The shoe', text: 'Running is what keeps me fit, and above all what clears my head. Music in my ears, a route on my watch, and ideas sort themselves out. Nothing beats it for untangling a project that\'s stuck.' } },
  { id: 'wheel', src: '/likes/wheel.webp', shape: 'circle', w: 520, h: 519, cm: 70,
    hull: [[0.0,0.434],[0.062,0.248],[0.262,0.054],[0.431,0.0],[0.723,0.047],[0.938,0.248],[1.0,0.434],[0.946,0.736],[0.846,0.868],[0.685,0.969],[0.431,1.0],[0.154,0.868],[0.054,0.736],[0.0,0.566]],
    fr: { title: 'Pignon fixe', sub: 'La roue', text: 'Un vélo sans roue libre : on ne s\'arrête jamais de pédaler. Exigeant, direct, sans rien de superflu (un peu comme une bonne grille).' },
    en: { title: 'Fixed gear', sub: 'The wheel', text: 'A bike with no freewheel: you never stop pedalling. Demanding, direct, nothing superfluous (a bit like a good grid).' } },
  { id: 'controller', src: '/likes/controller.webp', shape: 'rect', w: 520, h: 365, cm: 15,
    hull: [[0.008,0.681],[0.031,0.538],[0.115,0.198],[0.154,0.099],[0.223,0.022],[0.731,0.0],[0.815,0.044],[0.869,0.132],[0.938,0.374],[1.0,0.703],[1.0,0.857],[0.985,1.0],[0.054,1.0],[0.0,0.978]],
    fr: { title: 'Speedrun', sub: 'La manette', text: 'Je joue beaucoup, depuis toujours. Des après-midis entiers sur les mêmes niveaux, jusqu\'à les connaître par cœur, puis le speedrun, où l\'on cherche chaque raccourci et chaque bug pour gagner quelques secondes. C\'est sans doute là que j\'ai pris le goût de l\'optimisation (et celui des écrans de titre).' },
    en: { title: 'Speedrunning', sub: 'The controller', text: 'I play a lot, and always have. Whole afternoons on the same levels until I knew them by heart, then speedrunning, hunting every shortcut and every glitch to shave off a few seconds. That\'s probably where I picked up a taste for optimisation (and for title screens).' } },
  { id: 'psvita', src: '/likes/psvita.webp', shape: 'rect', w: 520, h: 239, cm: 18,
    hull: [[0.0,0.373],[0.062,0.102],[0.138,0.017],[0.215,0.0],[0.785,0.0],[0.862,0.017],[0.954,0.136],[1.0,0.356],[0.985,0.746],[0.923,0.915],[0.823,1.0],[0.169,1.0],[0.038,0.831],[0.0,0.627]],
    fr: { title: 'Jeu vidéo', sub: 'La PS Vita', text: 'Une console mal aimée qui méritait mieux. Belle, compacte, et pleine de jeux qu\'on ne trouve nulle part ailleurs.' },
    en: { title: 'Video games', sub: 'The PS Vita', text: 'An unloved console that deserved better. Beautiful, compact, and full of games you won\'t find anywhere else.' } },
  { id: 'ipod', embed: SPOTIFY, src: '/likes/ipod.webp', shape: 'rect', w: 219, h: 520, cm: 9,
    hull: [[0.0,0.008],[0.037,0.0],[0.963,0.0],[1.0,0.008],[1.0,1.0],[0.0,1.0]],
    fr: { title: 'Musique', sub: 'L\'iPod nano', text: 'La musique fait partie de ma vie, au point d\'en avoir fait une partie de mon métier : je dessine les identités d\'artistes. Il ne se passe pas un jour sans que j\'en écoute, et j\'adore en découvrir, en creusant d\'un album à l\'autre. Chaque projet musical commence d\'ailleurs par écouter le disque en boucle. Mettez le casque.' },
    en: { title: 'Music', sub: 'The iPod nano', text: 'Music is part of my life, to the point of making it part of my job: I design identities for artists. Not a day goes by without it, and I love discovering new music, digging from one album to the next. Every music project starts with the record on loop. Put your headphones on.' } },
  { id: 'keyboard', src: '/likes/keyboard.webp', shape: 'rect', w: 520, h: 215, cm: 31,
    hull: [[0.0,0.019],[0.008,0.0],[0.985,0.0],[1.0,0.038],[1.0,0.962],[0.985,1.0],[0.015,1.0],[0.0,0.981]],
    fr: { title: 'Code', sub: 'Le clavier', text: 'Tout ce qui touche à l\'informatique me passionne. J\'aime bidouiller : ouvrir un logiciel pour voir comment il marche, modder un jeu, monter un serveur à la maison (le mien fait tourner mes films, ma musique et mes petits outils). Je code aussi des sites juste pour m\'amuser et faire marrer mes potes, comme un quiz de culture générale ou un test qui juge votre niveau de cinéphile d\'après votre Letterboxd.' },
    en: { title: 'Code', sub: 'The keyboard', text: 'Anything to do with computers gets me going. I like to tinker: open up software to see how it works, mod a game, run a server at home (mine serves my films, my music and my little tools). I also code websites just for fun and to make my friends laugh, like a general knowledge quiz or a test that rates how much of a film buff you are from your Letterboxd.' } },
];
