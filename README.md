# kerningkastle — portfolio

Portfolio de kerningkastle, type designer & digital creative, Paris & remote.
Site statique en [Astro](https://astro.build), CSS natif, TypeScript, **aucun framework côté client**. Bilingue `/fr/` et `/en/`.

## Lancer

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # génère ./dist (site statique)
npm run preview   # sert ./dist
npm test          # règles du geste molette / pavé
```

Node ≥ 22.22.

## Principes

- **Défilement forcé** : la plupart des pages sont des écrans plein cadre ; un geste (molette, pavé, doigt, clavier) = un écran. Un écran plus haut que la fenêtre se lit librement à l'intérieur.
- **Mouvement** : apparition lettre par lettre, évitement du curseur sur les grands textes, curseur gantelet en CSS, parallaxe au passage des écrans, titre continu entre deux études. Tout respecte « Réduire les animations ».
- **Fluidité** : chargement d'entrée une seule fois par visite, pages préchargées au survol de leur lien (`prefetch`), images des écrans voisins chargées d'avance, images en WebP.
- **Son** : synthétisé en Web Audio, aucun fichier, actif par défaut (démarre au premier geste), coupé par le haut-parleur du menu.
- **Téléphone** : échelle d'affiche (texte proportionnel à la largeur), menu plein écran « (menu) ».
- **Accessibilité** : navigation clavier complète, focus visible, lien d'évitement, textes alternatifs, `prefers-reduced-motion`.

## Arborescence

```
src/
  data/             tout le contenu (FR/EN) : le site se modifie ici
    ui.ts           textes d'interface
    about.ts        À propos : textes d'affiche, services, stack, parcours, contact
    projects.ts     études de cas (ordre = ordre du site ; draft: true = badge « à valider »)
    media.ts        images des études (ouverture + écrans de galerie)
    archive.ts      pièces de l'archive (triées par année)
    likes.ts        « Ce que j'aime » : objets, textes, liens (Letterboxd, Spotify)
    lab.ts          pièces du Lab
  components/       Header, Footer, Affiche (texte d'affiche à vignettes), Door, ProjectRows,
                    ObjectShape, ContactScreen, LabRoom, TypeCanvas, DevMode
  layouts/Base.astro
  pages/[lang]/     index · work/ · work/[slug] · lab (bureau) · lab/[room] · archive · about · about/likes · legal
  scripts/          site (point d'entrée), screens (défilement forcé), motion (lettres, vignettes),
                    hola (évitement du curseur), gesture (molette / pavé), loader, sound
  styles/global.css système : couleurs, grille 12 colonnes, typo, écrans
public/
  fonts/            Geist et Geist Mono (OFL)
  vendor/           matter.js (MIT), physique de « Ce que j'aime »
  work/ archive/ likes/ logos/ stack/ og/   images (WebP, PNG) et images de partage
  lab/heraldry/     générateur d'Algorithmic Heraldry (servi dans le Lab)
tools/
  vignettes.py      fabrique les vignettes animées des textes d'affiche (public/vig/) à partir de l'archive
  heraldry-frames/  blasons générés qui servent à la vignette « code »
.github/workflows/  mise en ligne automatique sur GitHub Pages
```

## Modifier le contenu

- Un texte : `src/data/*.ts`, en français et en anglais.
- Une image d'étude : déposer le WebP dans `public/work/<projet>/`, puis l'ajouter dans `src/data/media.ts`.
- Une pièce d'archive : `public/archive/` (1400 px) + sa miniature `public/archive/s/` (800 px) + une ligne dans `src/data/archive.ts` (l'année trie la page, de la plus récente à la plus ancienne).
- Une vignette de texte d'affiche : `src` dans `src/data/about.ts` (vide = emplacement gris) ; `python3 tools/vignettes.py` les régénère.
- Liens de « Ce que j'aime » : constantes `LETTERBOXD` et `SPOTIFY` en haut de `src/data/likes.ts`.
- Logos clients du parcours : `public/logos/playstation.webp`, `nespresso.webp`, `chanel.webp` (carrés 256 px, gris, même surface optique).

## Mode développement

Taper `dev` n'importe où (ou `?dev` dans l'adresse) : grille 12 colonnes, ligne de base, poids de la page. `Échap` pour quitter.

## Mise en ligne

Site 100 % statique. Sur GitHub, le workflow `.github/workflows/deploy.yml` compile et publie sur GitHub Pages à chaque push sur `main` (Settings → Pages → Source : GitHub Actions). Ailleurs : `npm run build` puis déposer `dist/`. Adresse : `site` dans `astro.config.mjs`.

## Crédits

Polices [Geist](https://vercel.com/font) (SIL Open Font License) · [matter.js](https://brm.io/matter-js/) (MIT).
Textes, images, logotypes et caractères : © kerningkastle, tous droits réservés.
