// Petits mots liés au mot suivant (règle site entier) : jamais de « Le », « à », « de »… seul en fin de ligne.
// L'espace qui suit un mot court devient insécable : tous les mots d'une ou deux lettres, et les déterminants de trois lettres.
// En anglais, même règle (a, I, to, of, the…). Passe une fois au chargement, avant toute découpe du texte en lettres.
// Regard en arrière : on ne remplace que l'espace, sans consommer le mot ni sa limite (« à la lettre » : les deux liés en une passe).
const SHORT: Record<string, RegExp> = {
  fr: /(?<=(?:^|[\s(«“"'’])(?:\p{L}{1,2}|les|des|une|aux|ses|mes|tes|son|ton|mon|nos|vos|sur|par|pas|qui|que))[ \t]+(?=\S)/giu,
  en: /(?<=(?:^|[\s(“"'’])(?:\p{L}{1,2}|the|and|for|its|our|his|her))[ \t]+(?=\S)/giu,
};
const SKIP = 'script, style, code, pre, textarea, input, [contenteditable], svg';

export function tie(text: string, lang: string) {
  return text.replace(SHORT[lang] || SHORT.fr, '\u00a0');
}

export function initTie(root: ParentNode = document.body) {
  const lang = document.documentElement.lang?.slice(0, 2) || 'fr';
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue && /\s/.test(n.nodeValue) && !(n.parentElement?.closest(SKIP)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const nodes: Text[] = [];
  while (walk.nextNode()) nodes.push(walk.currentNode as Text);
  for (const t of nodes) { const v = tie(t.nodeValue!, lang); if (v !== t.nodeValue) t.nodeValue = v; }
}
