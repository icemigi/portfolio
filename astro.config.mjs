import { defineConfig } from 'astro/config';

// Site statique, sans framework client. Langues : /en/ (défaut) et /fr/ ; la racine choisit selon le navigateur.
export default defineConfig({
  site: 'https://kerningkastle.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  // navigation fluide : les pages liées sont téléchargées dès que leur lien est visible (menu compris)
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
