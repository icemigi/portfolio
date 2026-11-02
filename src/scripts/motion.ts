// Mouvement validé (étape 6) : lettres et vignettes.
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// téléphone : les lettres apparaissent en fondu, sans la petite montée (invisible à cette taille, mais coûteuse : elle
// force le navigateur à recalculer la mise en page du paragraphe à chaque image)
const PHONE = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
export const EASE_SLIDE = 'cubic-bezier(.7,0,.2,1)';
export const EASE_OUT = 'cubic-bezier(.2,.7,.2,1)';

// Texte non animé : libellés Geist Mono, vignettes, menus, médias, champs.
const SKIP = '.mono, .bp, .vi, .door, .ph, header, nav, svg, canvas, iframe, input, textarea, [contenteditable], [data-still], .sr, script, style';

function textNodes(root: Element, extraSkip?: string) {
  const skip = extraSkip ? `${SKIP}, ${extraSkip}` : SKIP;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue && n.nodeValue.trim() && !n.parentElement?.closest(skip) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const out: Text[] = [];
  while (w.nextNode()) out.push(w.currentNode as Text);
  return out;
}

// Lettre par lettre : chaque lettre reste un span en ligne (crénage exact), monte de .35em.
// 10 ms d'écart, 420 ms par lettre ; sur un long texte, l'écart se resserre pour finir en ~0,7 s.
// Renvoie la fin de l'animation (ms). À la fin, le texte est rassemblé en nœuds de texte.
// Rassemblement différé : sur Safari (WebKit), un texte découpé en spans perd son crénage ; le recoller à la fin
// de l'animation ferait sauter les lettres d'un coup. On garde donc les spans tant que le texte est à l'écran,
// et on ne recolle qu'une fois l'écran sorti du cadre (settle), ou juste avant une nouvelle apparition.
const pending = new Map<Element, () => void>();
export function settle(root: Element) {
  for (const [el, fn] of pending) if (root === el || root.contains(el)) { fn(); pending.delete(el); }
}

export function letters(root: Element, delay = 300, extraSkip?: string): number {
  if (reduced()) return 0;
  settle(root);
  const nodes = textNodes(root, extraSkip);
  const total = nodes.reduce((n, t) => n + t.nodeValue!.replace(/\s/g, '').length, 0);
  if (!total) return 0;
  const step = Math.min(10, 700 / total);
  const groups: { text: string; first: ChildNode; last: ChildNode }[] = [];
  let k = 0;
  for (const n of nodes) {
    const text = n.nodeValue!;
    const f = document.createDocumentFragment();
    for (const c of text) {
      if (/\s/.test(c)) { f.appendChild(document.createTextNode(c)); continue; }
      const sp = document.createElement('span');
      sp.className = 'ch'; sp.textContent = c; sp.setAttribute('aria-hidden', 'true');
      f.appendChild(sp);
      sp.animate(PHONE ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, top: '.35em' }, { opacity: 1, top: '0em' }], { duration: PHONE ? 360 : 420, delay: delay + k++ * step, easing: EASE_OUT, fill: 'backwards' });
    }
    const first = f.firstChild!, last = f.lastChild!;
    n.replaceWith(f);
    groups.push({ text, first, last });
  }
  // le cliquetis suit les lettres : il démarre avec la première et s'arrête avec la dernière
  dispatchEvent(new CustomEvent('kk:sound', { detail: { name: 'letters', at: (delay + 40) / 1000, span: (k * step) / 1000 } }));
  const end = delay + k * step + 440;
  pending.set(root, () => {
    root.getAnimations({ subtree: true }).forEach((a) => a.finish());
    for (const { text, first, last } of groups) {
      if (!first.parentNode) continue;
      first.before(document.createTextNode(text));
      let el: ChildNode | null = first;
      while (el) { const nx: ChildNode | null = el === last ? null : el.nextSibling; el.remove(); el = nx; }
    }
  });
  return end;
}

// Libellés Geist Mono : pas de fondu (validé) — ils sont là d'emblée.
export function fadeMono(_root: Element, _delay = 300) {}

// Vignettes-images : empilées et agrandies au centre de l'écran, elles rejoignent leur place l'une après l'autre
// (900 ms, 80 ms d'écart). `frame` = l'écran qui glisse (ses coordonnées servent de repère).
// Icônes (.vi.lg, logos de la Stack) : simple éclosion rapide (380 ms, 35 ms d'écart), en même temps que les lettres.
export function vignettes(frame: Element, delay = 300): number {
  if (reduced()) return delay;
  frame.querySelectorAll<HTMLElement>('.vi.lg').forEach((v, i) => v.animate(
    [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.08)', offset: 0.7 }, { opacity: 1, transform: 'scale(1)' }],
    { duration: 380, delay: delay + 120 + i * 35, easing: EASE_OUT, fill: 'backwards' },
  ));
  const vis = [...frame.querySelectorAll<HTMLElement>('.vi:not(.lg), .door')];
  if (!vis.length) return delay;
  const cx = innerWidth / 2, cy = innerHeight / 2, fr = frame.getBoundingClientRect();
  vis.forEach((v, i) => {
    const r = v.getBoundingClientRect();
    const dx = cx - (r.left - fr.left + r.width / 2), dy = cy - (r.top - fr.top + r.height / 2);
    v.animate([
      { opacity: 0, transform: `translate(${dx}px, ${dy + 24}px) scale(1.6)` },
      { opacity: 1, transform: `translate(${dx}px, ${dy}px) scale(1.6)`, offset: 0.3 },
      { opacity: 1, transform: 'translate(0, 0) scale(1)' },
    ], { duration: 900, delay: delay + i * 80, easing: EASE_SLIDE, fill: 'backwards' });
  });
  return delay + 900 + (vis.length - 1) * 80 - 150;
}

// Apparition d'un écran : vignettes d'abord s'il y en a, puis les lettres.
export function reveal(frame: Element, delay = 300, extraSkip?: string) {
  const start = vignettes(frame, delay);
  fadeMono(frame, delay);
  const end = letters(frame, start, extraSkip);
  afterText(frame, end);
  return end;
}

// Une fois le texte écrit : les apartés entre parenthèses se tapent à la machine, caractère par caractère (Geist Mono,
// chasse fixe : rien ne bouge autour), puis le bouton « (…) + » : ses parenthèses d'abord, le mot s'écrit dedans,
// et son + fait un tour pour attirer l'œil.
const TYPE = 26; // ms par caractère
function type(el: HTMLElement, delay: number): number {
  const text = (el.dataset.txt ??= el.textContent || '');
  el.textContent = '';
  const f = document.createDocumentFragment();
  let k = 0;
  for (const c of text) {
    if (c === ' ') { f.appendChild(document.createTextNode(' ')); k++; continue; }
    const sp = document.createElement('span'); sp.textContent = c;
    sp.animate([{ opacity: 0 }, { opacity: 0, offset: 0.99 }, { opacity: 1 }], { duration: delay + k++ * TYPE, fill: 'backwards' });
    f.appendChild(sp);
  }
  el.appendChild(f);
  dispatchEvent(new CustomEvent('kk:sound', { detail: { name: 'letters', at: delay / 1000, span: (k * TYPE) / 1000 } }));
  return delay + k * TYPE;
}
function afterText(frame: Element, end: number) {
  if (reduced()) return;
  let t = end - 80;
  frame.querySelectorAll<HTMLElement>('.note').forEach((n) => { t = type(n, t) + 120; });
  frame.querySelectorAll<HTMLElement>('.more .bp, .bp.cta').forEach((b) => {
    b.animate([{ opacity: 0 }, { opacity: 0, offset: 0.99 }, { opacity: 1 }], { duration: t, fill: 'backwards' });
    const word = b.querySelector<HTMLElement>('.bl');
    const sg = b.querySelector<HTMLElement>('.sg');
    const done = word ? type(word, t + 60) : t;
    sg?.animate([{ opacity: 0, rotate: '-180deg' }, { opacity: 1, rotate: '0deg' }], { duration: 500, delay: done + 40, easing: EASE_OUT, fill: 'backwards' });
    t = done + 200;
  });
}
