// Mouvement validé (étape 6) : lettres et vignettes.
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// téléphone : les lettres apparaissent en fondu, sans la petite montée (invisible à cette taille, mais coûteuse : elle
// force le navigateur à recalculer la mise en page du paragraphe à chaque image)
const PHONE = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
export const EASE_SLIDE = 'cubic-bezier(.7,0,.2,1)';
export const EASE_OUT = 'cubic-bezier(.2,.7,.2,1)';

// Texte non animé : libellés Geist Mono, vignettes, menus, médias, champs.
const SKIP = '.mono, .bp, .vi, .door, .ph, header, nav, svg, canvas, iframe, input, textarea, [contenteditable], [data-still], .sr, script, style, .parenthesis-reveal';
const PAREN_GAP = 90; // petit silence entre deux parenthèses, une fois le texte écrit
const PAREN_FADE = 280;

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
// 28 ms d'écart (la cascade se voit), 420 ms par lettre ; sur un long texte, l'écart régulier se resserre pour finir en ~1,4 s.
// Renvoie la fin de l'animation (ms). À la fin, le texte est rassemblé en nœuds de texte.
// Rassemblement différé : sur Safari (WebKit), un texte découpé en spans perd son crénage ; le recoller à la fin
// de l'animation ferait sauter les lettres d'un coup. On garde donc les spans tant que le texte est à l'écran,
// et on ne recolle qu'une fois l'écran sorti du cadre (settle), ou juste avant une nouvelle apparition.
const pending = new Map<Element, () => void>();
export function settle(root: Element) {
  for (const [el, fn] of pending) if (root === el || root.contains(el)) { fn(); pending.delete(el); }
}

// Grand titre : une lettre en ligne ne peut pas monter par transform, et monter par « top » compte comme un décalage de mise
// en page. Ses lettres passent donc en inline-block, le crénage perdu étant mesuré puis reporté : rien ne bouge d'un pixel.
function holdKerning(chars: HTMLElement[]) {
  const before = chars.map((c) => c.getBoundingClientRect());
  chars.forEach((c) => (c.style.display = 'inline-block'));
  const after = chars.map((c) => c.getBoundingClientRect());
  const fs = parseFloat(getComputedStyle(chars[0]).fontSize);
  chars.forEach((c, i) => {
    if (!i || Math.abs(before[i].top - before[i - 1].top) > fs / 2) return; // première lettre de sa ligne
    const gap = before[i].left - before[i - 1].left - (after[i].left - after[i - 1].left);
    if (Math.abs(gap) > 0.01) c.style.marginLeft = `${(gap / fs).toFixed(4)}em`;
  });
}

// Grand titre de l'accueil : il s'écrit de gauche à droite, chaque lettre passe par des caractères tirés au hasard
// (majuscules, minuscules, chiffres, signes) de largeur voisine — le mot ne tressaute pas — puis se fixe.
// Les changements ralentissent avant l'arrêt, comme une roue qui se pose. ~1,1 s pour « kerningkastle ».
const SCR_POOL = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&?!@#%*+=/§¶<>{}[]$€'];
const SCR = { step: 55, mix: 320, fast: 40, slow: 95 };
// écritures mélangées en cours (titre, apartés) : on peut les arrêter net, chaque lettre reprenant la sienne (changement de langue)
const LIVE = new Set<() => void>();
export function stopScrambles() { [...LIVE].forEach((f) => f()); }
function scramble(chars: HTMLElement[], delay: number, R: typeof SCR = SCR): () => void {
  const fin = chars.map((sp) => sp.textContent!);
  let left = chars.length;
  const fs = parseFloat(getComputedStyle(chars[0]).fontSize);
  const cx = document.createElement('canvas').getContext('2d')!;
  cx.font = `${getComputedStyle(chars[0]).fontWeight} ${fs}px ${getComputedStyle(chars[0]).fontFamily}`;
  const wOf = new Map(SCR_POOL.map((c) => [c, cx.measureText(c).width]));
  const timers: number[] = [];
  chars.forEach((sp, i) => {
    const c = sp.textContent!, target = cx.measureText(c).width;
    const near = SCR_POOL.filter((x) => x !== c && Math.abs(wOf.get(x)! - target) <= target * 0.18);
    const pool = near.length > 2 ? near : SCR_POOL;
    // la case garde la largeur exacte de sa lettre (crénage reporté compris) pendant le mélange
    sp.style.width = `${(sp.getBoundingClientRect().width / fs).toFixed(4)}em`; sp.style.textAlign = 'center';
    const start = delay + i * R.step;
    let last = '', t = 0;
    const pick = () => { let r; do r = pool[(Math.random() * pool.length) | 0]; while (r === last && pool.length > 1); last = r; return r; };
    const tick = () => {
      if (t >= R.mix) { sp.textContent = c; sp.style.width = ''; sp.style.textAlign = ''; if (--left === 0) LIVE.delete(stop); return; } // se fixe
      sp.textContent = pick();
      const gap = R.fast + (R.slow - R.fast) * (t / R.mix) ** 2; t += gap;
      timers.push(window.setTimeout(tick, gap));
    };
    sp.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 60, delay: start, fill: 'backwards' });
    timers.push(window.setTimeout(tick, start));
  });
  // arrêt immédiat (écran quitté, nouvelle apparition, changement de langue) : chaque lettre reprend la sienne
  const stop = () => { timers.forEach(clearTimeout); chars.forEach((sp, i) => { sp.textContent = fin[i]; sp.style.width = ''; sp.style.textAlign = ''; }); LIVE.delete(stop); };
  LIVE.add(stop);
  return stop;
}

export function letters(root: Element, delay = 300, extraSkip?: string): number {
  if (reduced()) return 0;
  settle(root);
  const nodes = textNodes(root, extraSkip);
  const total = nodes.reduce((n, t) => n + t.nodeValue!.replace(/\s/g, '').length, 0);
  if (!total) return 0;
  const step = Math.min(28, 1400 / total);
  const groups: { text: string; first: ChildNode; last: ChildNode }[] = [];
  const lifted: HTMLElement[] = [], named: HTMLElement[] = [], finals: string[] = [];
  let k = 0;
  for (const n of nodes) {
    const text = n.nodeValue!;
    const isName = !!n.parentElement?.closest('.name');                 // titre de l'accueil : écriture mélangée
    const isTitle = !PHONE && isName;
    const f = document.createDocumentFragment();
    for (const c of text) {
      if (/\s/.test(c)) { f.appendChild(document.createTextNode(c)); continue; }
      const sp = document.createElement('span');
      sp.className = 'ch'; sp.textContent = c; sp.setAttribute('aria-hidden', 'true');
      f.appendChild(sp);
      if (isName) { named.push(sp); finals.push(c); k++; continue; }
      const rise = isTitle ? [{ opacity: 0, transform: 'translateY(.35em)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 0, top: '.35em' }, { opacity: 1, top: '0em' }];
      sp.dataset.d = String(delay + k * step);                 // instant d'apparition : l'aparté qui suit ce mot part de là
      sp.animate(PHONE ? [{ opacity: 0 }, { opacity: 1 }] : rise, { duration: PHONE ? 360 : 420, delay: delay + k++ * step, easing: EASE_OUT, fill: 'backwards' });
      if (isTitle) lifted.push(sp);
    }
    const first = f.firstChild!, last = f.lastChild!;
    n.replaceWith(f);
    groups.push({ text, first, last });
  }
  if (lifted.length) holdKerning(lifted);
  if (named.length) holdKerning(named);
  const stopScramble = named.length ? scramble(named, delay) : null;
  // le cliquetis suit les lettres : il démarre avec la première et s'arrête avec la dernière
  dispatchEvent(new CustomEvent('kk:sound', { detail: { name: 'letters', at: (delay + 40) / 1000, span: (k * step) / 1000 } }));
  const textEnd = delay + k * step + 440;
  // les parenthèses du texte courant viennent après le texte, une à une
  const parens = [...root.querySelectorAll<HTMLElement>('.parenthesis-reveal')];
  parens.forEach((p, i) => p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: PAREN_FADE, delay: textEnd + i * (PAREN_FADE + PAREN_GAP), easing: EASE_OUT, fill: 'backwards' }));
  const end = textEnd + parens.length * (PAREN_FADE + PAREN_GAP);
  pending.set(root, () => {
    stopScramble?.();
    named.forEach((sp, i) => (sp.textContent = finals[i]));
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

// Libellés Geist Mono et cachet : ils ouvrent la cascade, en fondu, à intervalles réguliers. Renvoie le départ des lettres (ms).
export function fadeMono(root: Element, delay = 300): number {
  if (reduced()) return delay;
  const items = [...root.querySelectorAll<HTMLElement>('.mono:not(.note):not(.bp), .seal-w')];
  if (!items.length) return delay;
  const gap = Math.min(60, 480 / items.length);
  items.forEach((el, i) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, delay: delay + i * gap, easing: EASE_OUT, fill: 'backwards' }));
  return delay + 120;
}

// Vignettes-images : empilées et agrandies au centre de l'écran, elles rejoignent leur place l'une après l'autre
// (900 ms, 80 ms d'écart). `frame` = l'écran qui glisse (ses coordonnées servent de repère).
// Icônes (.vi.lg, logos de la Stack) : simple éclosion rapide (380 ms, 35 ms d'écart), en même temps que les lettres.
export function vignettes(frame: Element, delay = 300): number {
  if (reduced()) return delay;
  frame.querySelectorAll<HTMLElement>('.vi.lg').forEach((v, i) => v.animate(
    [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }],
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
  const start = Math.max(vignettes(frame, delay), fadeMono(frame, delay));
  const end = letters(frame, start, extraSkip);
  afterText(frame, end, start);
  return end;
}

// Une fois le texte écrit : les apartés entre parenthèses s'écrivent comme le titre de l'accueil — chaque caractère passe par
// des signes au hasard avant de se fixer (Geist Mono, chasse fixe : rien ne bouge autour) ; les parenthèses, elles, sont posées
// d'emblée. Puis le bouton « (…) + » : ses parenthèses d'abord, le mot s'écrit dedans, et son + fait un tour pour attirer l'œil.
const TYPE = 26; // ms entre deux caractères
const NOTE_SCR = { step: TYPE, mix: 240, fast: 35, slow: 80 };
const NOTE_STAGGER = 220; // écart entre les départs de deux apartés
function type(el: HTMLElement, delay: number): number {
  const text = (el.dataset.txt ??= el.textContent || '');
  el.textContent = '';
  const f = document.createDocumentFragment(), mixed: HTMLElement[] = [];
  let k = 0;
  for (const c of text) {
    if (c === ' ') { f.appendChild(document.createTextNode(' ')); continue; }
    const sp = document.createElement('span'); sp.textContent = c;
    if (c === '(' || c === ')') sp.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: c === '(' ? delay : delay + k * TYPE, fill: 'backwards' });
    else { mixed.push(sp); k++; }
    f.appendChild(sp);
  }
  el.appendChild(f);
  if (mixed.length) scramble(mixed, delay + 40, NOTE_SCR);
  dispatchEvent(new CustomEvent('kk:sound', { detail: { name: 'letters', at: delay / 1000, span: (k * TYPE) / 1000 } }));
  return delay + k * TYPE + NOTE_SCR.mix;
}
function afterText(frame: Element, end: number, start = end) {
  if (reduced()) return;
  // les apartés entre parenthèses s'écrivent au fil du texte : chacun part quand la cascade atteint le mot qu'il commente
  // (sa dernière lettre vient d'apparaître) ; à défaut, après le texte, en cascade comme avant
  frame.querySelectorAll<HTMLElement>('.note').forEach((n, i) => {
    const before = [...(n.closest('.glue, p, li, h1, h2, h3') || frame).querySelectorAll<HTMLElement>('.ch[data-d]')]
      .filter((c) => c.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING).pop();
    type(n, before ? +before.dataset.d! + 90 : end - 200 + i * NOTE_STAGGER);
  });
  frame.querySelectorAll<HTMLElement>('.more .bp, .bp.cta').forEach((b) => {
    b.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: Math.max(0, end - 200), easing: EASE_OUT, fill: 'backwards' });
    b.querySelector('.sg')?.animate([{ rotate: '-90deg' }, { rotate: '0deg' }], { duration: 420, delay: Math.max(0, end - 100), easing: EASE_OUT, fill: 'backwards' });
  });
}
