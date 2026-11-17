// Objets photographiés de la page Projets (ObjectShape.astro) : fichier détouré, largeur, hauteur. Les autres objets sont
// dessinés en SVG (carrés). aspect() sert à la scène (Scene.astro) pour donner à chaque objet à peu près la même surface.
export const photos: Partial<Record<string, [string, number, number]>> = {
  book: ['/work/algorithmic-heraldry/object.webp', 1000, 1315],
  rock: ['/work/asaphr/object.webp', 800, 992],
  vinyl: ['/work/music-identities/object.webp', 1200, 809],
  backpack: ['/work/kern-outdoor/object.webp', 1200, 907],
  crest: ['/work/bms-esport/object.webp', 1000, 1241],
};
export const aspect = (kind: string) => { const p = photos[kind]; return p ? p[1] / p[2] : 1; }; // largeur / hauteur
