// Petites fonctions de texte partagées (études de cas, CV) : une seule définition pour tout le site.

// échappe le texte pour l'insérer en HTML
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// texte riche : chaque aparté {m:…} devient une petite note entre parenthèses, soudée à son mot et à la ponctuation qui
// suit (bloc insécable .glue, comme l'affiche d'À propos) : elle ne passe jamais seule à la ligne
export const rich = (t: string, cls = 'note mono mu') =>
  esc(t).replace(/(\S*)\{m:([^}]+)\}([.,;:!?…»)]*)/g, (_, w, n, p) => `<span class="glue">${w}<span class="${cls}">(${n})</span>${p}</span>`);

// première phrase d'un texte (jusqu'au premier point, ! ? ou … suivi d'une majuscule) et le reste
export const first = (t: string): [string, string] => {
  const m = t.match(/^(.+?[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ«“"(0-9])/u);
  return m ? [m[1], t.slice(m[0].length)] : [t, ''];
};
