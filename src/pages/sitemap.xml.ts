// Plan du site pour les moteurs de recherche, généré à chaque build depuis les données : il ne liste que les pages
// qui existent vraiment (projets visibles, salles du Lab ouvertes), en FR et EN, avec leurs équivalents dans l'autre langue.
// Le CV (noindex) et la 404 n'y figurent pas.
import type { APIRoute } from 'astro';
import { languages } from '../data/ui';
import { projects } from '../data/projects';
import { rooms } from '../data/lab';

const paths = [
  '', 'work/', 'about/', 'about/likes/', 'archive/', 'lab/', 'legal/',
  ...projects.map((p) => `work/${p.slug}/`),
  ...rooms.map((r) => `lab/${r.id}/`),
];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://kerningkastle.com');
  const u = (lang: string, path: string) => new URL(`/${lang}/${path}`, base).href;
  const urls = paths.flatMap((path) => languages.map((lang) => {
    const alts = languages.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${u(l, path)}"/>`).join('')
      + `<xhtml:link rel="alternate" hreflang="x-default" href="${u('en', path)}"/>`;
    return `  <url><loc>${u(lang, path)}</loc>${alts}</url>`;
  }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
