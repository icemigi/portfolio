import { defineConfig } from 'astro/config';

// Site statique, sans framework client. Langues : /en/ (défaut) et /fr/ ; la racine choisit selon le navigateur.
export default defineConfig({
  // adresse de mise en ligne : nom de domaine (GitHub Pages, domaine personnalisé, servi à la racine)
  site: 'https://kerningkastle.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  // navigation fluide : une page est téléchargée dès que le pointeur survole son lien (ordinateur) ou que le doigt le touche (téléphone),
  // plutôt que toutes les pages visibles d'un coup (coûteux en données sur mobile)
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
