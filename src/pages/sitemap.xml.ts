// Plan du site pour les moteurs de recherche : seul l'accueil anglais doit sortir dans les résultats.
// Toutes les autres pages portent un noindex (voir layouts/Base.astro).
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://kerningkastle.com');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${new URL('/en/', base).href}</loc></url>\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
