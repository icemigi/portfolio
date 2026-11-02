// Accent : dans les textes courants (paragraphes, listes), ce qui est entre parenthèses passe en orange.
// Les libellés (Geist Mono), les boutons, le menu et les titres ne sont pas touchés.
const IN = 'p, li, dd, td, blockquote, .txt';
const SKIP = '.mono, .bp, header, nav, h1, h2, h3, .t56, script, style, svg, .ac, input, textarea, [contenteditable], .t-cmd, .ps, .lb, .lab';
const RX = /\([^()\n]{1,140}\)/g;
export function paren(root: ParentNode = document.body) {
  const w = document.createTreeWalker(root as Node, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const el = n.parentElement;
      if (!n.nodeValue || !n.nodeValue.includes('(') || !el || !el.closest(IN) || el.closest(SKIP)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = []; while (w.nextNode()) nodes.push(w.currentNode as Text);
  for (const n of nodes) {
    const s = n.nodeValue!; RX.lastIndex = 0;
    if (!RX.test(s)) continue;
    const f = document.createDocumentFragment(); let i = 0; RX.lastIndex = 0;
    for (const m of s.matchAll(RX)) {
      if (m.index! > i) f.append(s.slice(i, m.index));
      const sp = document.createElement('span'); sp.className = 'ac'; sp.textContent = m[0]; f.append(sp);
      i = m.index! + m[0].length;
    }
    if (i < s.length) f.append(s.slice(i));
    n.replaceWith(f);
  }
}
