// Images des études (générées depuis _sources/ASSETS, WebP). cover = image d'ouverture plein cadre ;
// gal = écrans de galerie, chacun 1 ou 2 images, intercalés entre les rubriques puis à la suite.
export type Img = { src: string; w: number; h: number };
export const media: Record<string, { cover: Img; gal: Img[][] }> = {
  // pages du dummy (02/11) : texte en regard FR / EN, grilles de cent blasons, index des clés
  'algorithmic-heraldry': {
    cover: { src: '/work/algorithmic-heraldry/cover.webp', w: 2200, h: 1259 },
    gal: [
      [{ src: '/work/algorithmic-heraldry/01.webp', w: 1223, h: 1400 }, { src: '/work/algorithmic-heraldry/02.webp', w: 1223, h: 1400 }],
      [{ src: '/work/algorithmic-heraldry/03.webp', w: 1223, h: 1400 }, { src: '/work/algorithmic-heraldry/04.webp', w: 1223, h: 1400 }],
      [{ src: '/work/algorithmic-heraldry/05.webp', w: 1223, h: 1400 }, { src: '/work/algorithmic-heraldry/06.webp', w: 1223, h: 1400 }],
      [{ src: '/work/algorithmic-heraldry/07.webp', w: 1223, h: 1400 }, { src: '/work/algorithmic-heraldry/08.webp', w: 1223, h: 1400 }],
      [{ src: '/work/algorithmic-heraldry/09.webp', w: 1223, h: 1400 }],
    ],
  },

  // kern.outdoor (13/11) : couvertures de carrousels et déclinaisons du logo, tirées de Documents/kern.outdoor
  'kern-outdoor': {
    cover: { src: '/work/kern-outdoor/cover.webp', w: 1080, h: 1440 },
    gal: [
      [{ src: '/work/kern-outdoor/01.webp', w: 1000, h: 1000 }, { src: '/work/kern-outdoor/02.webp', w: 1000, h: 1000 }],
      [{ src: '/work/kern-outdoor/03.webp', w: 1080, h: 1440 }, { src: '/work/kern-outdoor/04.webp', w: 1080, h: 1440 }],
      [{ src: '/work/kern-outdoor/05.webp', w: 1080, h: 1440 }, { src: '/work/kern-outdoor/06.webp', w: 1080, h: 1440 }],
      [{ src: '/work/kern-outdoor/07.webp', w: 1000, h: 1000 }, { src: '/work/kern-outdoor/08.webp', w: 1000, h: 1000 }],
    ],
  },
  // ASAPHR (13/11) : glyphes rendus depuis Asaphr.glyphs (tracés monolines sur la grille 3 × 5)
  'asaphr': {
    cover: { src: '/work/asaphr/cover.webp', w: 2200, h: 1238 },
    gal: [
      [{ src: '/work/asaphr/01.webp', w: 1600, h: 1600 }, { src: '/work/asaphr/02.webp', w: 1600, h: 1600 }],
      [{ src: '/work/asaphr/03.webp', w: 1600, h: 1600 }, { src: '/work/asaphr/04.webp', w: 1600, h: 1600 }],
      [{ src: '/work/asaphr/05.webp', w: 1600, h: 1600 }, { src: '/work/asaphr/06.webp', w: 1600, h: 1600 }],
      [{ src: '/work/asaphr/07.webp', w: 1600, h: 1600 }],
    ],
  },
  'sports-aventure': {
    cover: { src: '/work/sports-aventure/cover.webp', w: 1728, h: 1117 },
    gal: [
      [{ src: '/work/sports-aventure/01.webp', w: 1400, h: 1983 }, { src: '/work/sports-aventure/02.webp', w: 1400, h: 700 }],
      [{ src: '/work/sports-aventure/03.webp', w: 1728, h: 1117 }],
      [{ src: '/work/sports-aventure/04.webp', w: 1400, h: 7656 }],
      [{ src: '/work/sports-aventure/05.webp', w: 1728, h: 1117 }],
      [{ src: '/work/sports-aventure/06.webp', w: 1400, h: 2803 }],
      [{ src: '/work/sports-aventure/07.webp', w: 1728, h: 1117 }],
    ],
  },
  'music-identities': {
    cover: { src: '/work/music-identities/cover.webp', w: 1600, h: 1600 },
    gal: [
      [{ src: '/work/music-identities/01.webp', w: 1400, h: 1400 }, { src: '/work/music-identities/02.webp', w: 1400, h: 1400 }],
      [{ src: '/work/music-identities/03.webp', w: 1400, h: 1400 }, { src: '/work/music-identities/04.webp', w: 1400, h: 1400 }],
      [{ src: '/work/music-identities/05.webp', w: 1400, h: 1400 }, { src: '/work/music-identities/06.webp', w: 1400, h: 1400 }],
      [{ src: '/work/music-identities/07.webp', w: 1400, h: 1400 }, { src: '/work/music-identities/08.webp', w: 1400, h: 1400 }],
      [{ src: '/work/music-identities/09.webp', w: 1400, h: 1400 }, { src: '/work/music-identities/10.webp', w: 1400, h: 1400 }],
      [{ src: '/work/music-identities/11.webp', w: 1080, h: 1080 }, { src: '/work/music-identities/12.webp', w: 1080, h: 1080 }],
      [{ src: '/work/music-identities/13.webp', w: 1400, h: 1980 }, { src: '/work/music-identities/14.webp', w: 1080, h: 1080 }],
      [{ src: '/work/music-identities/15.webp', w: 1400, h: 1400 }, { src: '/work/music-identities/16.webp', w: 1400, h: 1400 }],
      [{ src: '/work/music-identities/17.webp', w: 1400, h: 1400 }, { src: '/work/music-identities/18.webp', w: 1400, h: 1400 }],
    ],
  },
  'bms-esport': {
    cover: { src: '/work/bms-esport/cover.webp', w: 2400, h: 1560 },
    gal: [
      [{ src: '/work/bms-esport/01.webp', w: 1280, h: 832 }],
      [{ src: '/work/bms-esport/02.webp', w: 1280, h: 832 }],
      [{ src: '/work/bms-esport/03.webp', w: 1280, h: 832 }],
      [{ src: '/work/bms-esport/04.webp', w: 1280, h: 832 }, { src: '/work/bms-esport/05.webp', w: 1280, h: 832 }],
      [{ src: '/work/bms-esport/06.webp', w: 1280, h: 832 }, { src: '/work/bms-esport/07.webp', w: 1280, h: 832 }],
    ],
  },
};
