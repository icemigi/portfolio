// Texte courant : ce qui est entre parenthèses est isolé dans un <span class="parenthesis-reveal">, pour apparaître après le reste.
// Seuls les paragraphes du contenu sont concernés : jamais l'en-tête, le pied de page, les boutons ni les liens.
// À lancer avant toute découpe du texte en lettres.
const NOT_TEXT = 'header, footer, nav, button, a, .bp, .mono, .note, .sr, .parenthesis-reveal';
const PAREN = /\([^()]*\)/g;

export function initParens(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLParagraphElement>('main p').forEach((p) => {
    if (p.closest(NOT_TEXT)) return;
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue?.includes('(') && !n.parentElement?.closest(NOT_TEXT) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
      const text = node.nodeValue!;
      const f = document.createDocumentFragment();
      let from = 0;
      for (const m of text.matchAll(PAREN)) {
        if (m.index > from) f.append(text.slice(from, m.index));
        const span = document.createElement('span');
        span.className = 'parenthesis-reveal';
        span.textContent = m[0];
        f.append(span);
        from = m.index + m[0].length;
      }
      if (!from) continue; // parenthèse jamais refermée : on ne touche à rien
      f.append(text.slice(from));
      node.replaceWith(f);
    }
  });
}
