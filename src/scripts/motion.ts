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
// 28 ms d'écart (la cascade se voit), 420 ms par lettre ; sur un long texte, l'écart régulier se resserre pour finir en ~1,4 s.
// Renvoie la fin de l'animation (ms). À la fin, le texte est rassemblé en nœuds de texte.
// Rassemblement différé : sur Safari (WebKit), un texte découpé en spans perd son crénage ; le recoller à la fin
// de l'animation ferait sauter les lettres d'un coup. On garde donc les spans tant que le texte est à l'écran,
// et on ne recolle qu'une fois l'écran sorti du cadre (settle), ou juste avant une nouvelle apparition.
const pending = new Map<Element, () => void>();
// animations posées par le script (apparitions) : les animations CSS (flottement, points de la bulle…) en sont exclues — elles sont
// souvent infinies, et Firefox refuse de terminer une animation infinie (erreur relevée dans Zen, 14/11)
const own = (root: Element) => root.getAnimations({ subtree: true }).filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition) && Number.isFinite(Number(a.effect?.getComputedTiming().endTime)));
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
// texte courant : seulement des lettres de même casse (pas de signes) — un frémissement au bout de la plume, pas une friture
const LOW = [...'abcdefghijklmnopqrstuvwxyz'], UP = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const SCR = { step: 70, mix: 400, fast: 48, slow: 115, overlay: false }; // 11/11 : un tiers plus lent
// écritures mélangées en cours (titre, apartés) : on peut les arrêter net, chaque lettre reprenant la sienne (changement de langue)
const LIVE = new Set<() => void>();
export function stopScrambles() { [...LIVE].forEach((f) => f()); }
// Apparition pilotée par le défilement (revealScrub, 14/11) : pendant sa préparation, les mélanges s'inscrivent ici au lieu
// de partir seuls, et aucun son n'est joué ; ensuite, chaque mélange se rend à l'instant demandé (avant ou arrière).
type Scr = { render: (t: number) => void; end: number };
let SCRUB: Scr[] | null = null;
let MUTE = false;
// Mélange de lettres : chaque lettre passe par des signes tirés au hasard (calculés d'avance), puis se fixe. render(t) affiche
// l'état à l'instant t (ms depuis le départ) : joué seul, une horloge l'appelle à chaque image ; piloté, le défilement l'appelle.
function scramble(chars: HTMLElement[], delay: number, R: typeof SCR = SCR): () => void {
  const fs = parseFloat(getComputedStyle(chars[0]).fontSize);
  const cx = document.createElement('canvas').getContext('2d')!;
  cx.font = `${getComputedStyle(chars[0]).fontWeight} ${fs}px ${getComputedStyle(chars[0]).fontFamily}`;
  const wOf = new Map(SCR_POOL.map((c) => [c, cx.measureText(c).width]));
  const plan = chars.map((sp, i) => {
    const c = sp.textContent!, target = cx.measureText(c).width;
    let pool: string[];
    if (R.overlay) {                                                     // texte courant : même casse, largeur à 12 % près, sinon rien
      const src = c !== c.toUpperCase() ? LOW : c !== c.toLowerCase() ? UP : [];
      pool = src.filter((x) => x !== c && Math.abs((wOf.get(x) ?? cx.measureText(x).width) - target) <= target * 0.12);
    } else {
      const near = SCR_POOL.filter((x) => x !== c && Math.abs(wOf.get(x)! - target) <= target * 0.18);
      pool = near.length > 2 ? near : SCR_POOL;
    }
    // titre : la case garde la largeur exacte de sa lettre (crénage reporté compris) ; texte courant (overlay) : la lettre reste
    // en place, invisible, et le signe tiré au hasard se pose par-dessus — la mise en page ne bouge jamais, aucun mot ne se coupe
    if (!R.overlay && pool.length >= 2) { sp.style.width = `${(sp.getBoundingClientRect().width / fs).toFixed(4)}em`; sp.style.textAlign = 'center'; }
    const start = sp.dataset.d ? +sp.dataset.d : delay + i * R.step;   // instant propre à la lettre s'il est connu (cascade du texte)
    const steps: { t: number; ch: string }[] = [];
    if (pool.length >= 2) {                                              // chiffre, ponctuation : la lettre apparaît telle quelle
      let last = '', t = 0;
      while (t < R.mix) { let r; do r = pool[(Math.random() * pool.length) | 0]; while (r === last && pool.length > 1); last = r; steps.push({ t: start + t, ch: r }); t += R.fast + (R.slow - R.fast) * (t / R.mix) ** 2; }
    }
    sp.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 60, delay: start, fill: 'backwards' });
    return { sp, c, start, steps, endT: start + R.mix, shown: '' };
  });
  // texte courant (overlay) : le signe de passage est un élément à part, posé au-dessus de sa lettre, dans l'écran qui la
  // contient (il défile avec elle). Un ::after dans la lettre coupait le crénage avec ses voisines (le mot s'élargissait
  // d'environ 2 %, une ligne pleine passait à la ligne et le bloc sautait) ; ici la lettre ne contient que sa lettre.
  const box = R.overlay ? (chars[0].closest<HTMLElement>('.scr') || document.body) : null;
  const marks = new Map<HTMLElement, HTMLElement>();
  const mark = (sp: HTMLElement, ch: string) => {
    let m = marks.get(sp);
    if (!m) {
      m = document.createElement('span'); m.className = 'scx'; m.setAttribute('aria-hidden', 'true');
      const cs = getComputedStyle(sp);
      m.style.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`;
      m.style.letterSpacing = cs.letterSpacing;
      const r = sp.getBoundingClientRect(), b = box!.getBoundingClientRect();
      const sx = box === document.body ? scrollX : box!.scrollLeft, sy = box === document.body ? scrollY : box!.scrollTop;
      m.style.left = `${r.left + r.width / 2 - b.left + sx}px`; m.style.top = `${r.top - b.top + sy}px`;
      box!.appendChild(m); marks.set(sp, m);
    }
    m.textContent = ch;
  };
  const unmark = (sp: HTMLElement) => { marks.get(sp)?.remove(); marks.delete(sp); };
  const render = (t: number) => {
    for (const p of plan) {
      let ch = '';
      if (p.steps.length && t >= p.start && t < p.endT) { for (const st of p.steps) { if (st.t <= t) ch = st.ch; else break; } }
      if (ch === p.shown) continue;
      p.shown = ch;
      if (!ch) { if (R.overlay) { p.sp.classList.remove('sx'); unmark(p.sp); } else { p.sp.textContent = p.c; if (t >= p.endT) { p.sp.style.width = ''; p.sp.style.textAlign = ''; } } }
      else if (R.overlay) { mark(p.sp, ch); p.sp.classList.add('sx'); }
      else p.sp.textContent = ch;
    }
  };
  const end = Math.max(...plan.map((p) => p.endT));
  if (SCRUB) { SCRUB.push({ render, end }); return () => render(Infinity); }
  // joué seul : une horloge rend l'état à chaque image ; arrêt immédiat (écran quitté, nouvelle apparition, changement de langue) :
  // chaque lettre reprend la sienne
  const t0 = performance.now();
  let raf = 0;
  const stop = () => { cancelAnimationFrame(raf); render(Infinity); LIVE.delete(stop); };
  const loop = (now: number) => { const t = now - t0; render(t); if (t < end) raf = requestAnimationFrame(loop); else { render(Infinity); LIVE.delete(stop); } };
  raf = requestAnimationFrame(loop);
  LIVE.add(stop);
  return stop;
}

export function letters(root: Element, delay = 300, extraSkip?: string): number {
  if (reduced()) return 0;
  settle(root);
  const nodes = textNodes(root, extraSkip);
  const total = nodes.reduce((n, t) => n + t.nodeValue!.replace(/\s/g, '').length, 0);
  if (!total) return 0;
  // « à propos » (data-letters-slow) : un tiers plus lent, le texte d'affiche y est long (11/11) ; ailleurs, rythme d'origine
  const slow = !!root.closest('[data-letters-slow]');
  const step = slow ? Math.min(38, 1900 / total) : Math.min(28, 1400 / total);
  const groups: { text: string; first: ChildNode; last: ChildNode }[] = [];
  const mixed: HTMLElement[] = [], named: HTMLElement[] = [];
  let k = 0;
  for (const n of nodes) {
    const text = n.nodeValue!;
    const isName = !!n.parentElement?.closest('.name, .mail');          // titre de l'accueil et grande adresse : rythme du titre
    const f = document.createDocumentFragment();
    // les lettres d'un mot restent soudées (span .sw insécable) : le signe posé par-dessus une lettre en cours de mélange
    // (::after en position absolue) ouvre sinon une coupure au milieu du mot, la ligne se recoupe un instant et le bloc saute
    let word: HTMLElement | null = null;
    for (const c of text) {
      if (/\s/.test(c)) { f.appendChild(document.createTextNode(c)); word = null; continue; }
      const sp = document.createElement('span');
      sp.className = 'ch'; sp.textContent = c; sp.setAttribute('aria-hidden', 'true');
      if (!word) { word = document.createElement('span'); word.className = 'sw'; f.appendChild(word); }
      word.appendChild(sp);
      if (isName) { named.push(sp); k++; continue; }
      // tout le texte s'écrit comme le titre : signes tirés au hasard, puis la bonne lettre, en cascade
      sp.dataset.d = String(delay + k++ * step);               // instant d'apparition (l'aparté et la vignette qui suivent en partent)
      mixed.push(sp);
    }
    const first = f.firstChild!, last = f.lastChild!;
    n.replaceWith(f);
    groups.push({ text, first, last });
  }
  if (named.length) holdKerning(named);
  // front d'écriture étroit : chaque lettre ne se mélange que ~2,5 pas de cascade (deux ou trois lettres à la fois), 2-3 changements
  const stopText = mixed.length ? scramble(mixed, delay, slow ? { step, mix: Math.max(85, step * 2.6), fast: 30, slow: 46, overlay: true } : { step, mix: Math.max(60, step * 2.5), fast: 22, slow: 34, overlay: true }) : null;
  const stopScramble = named.length ? scramble(named, delay) : null;
  // le cliquetis suit les lettres : il démarre avec la première et s'arrête avec la dernière
  if (!MUTE) dispatchEvent(new CustomEvent('kk:sound', { detail: { name: 'letters', at: (delay + 40) / 1000, span: (k * step) / 1000 } }));
  const textEnd = delay + k * step + 300;
  // les parenthèses du texte courant s'écrivent à leur place dans la cascade, comme le reste du texte
  const end = textEnd;
  pending.set(root, () => {
    stopScramble?.(); stopText?.();
    own(root).forEach((a) => a.finish());
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

// Vignettes dans la cascade : chacune éclôt quand la cascade du texte arrive jusqu'à elle (juste après la lettre qui la
// précède, sa parenthèse ouvrante), d'un petit rebond ; les icônes de la stack, de même.
function cascadeVignettes(frame: Element, start: number) {
  if (reduced()) return;
  const chars = [...frame.querySelectorAll<HTMLElement>('.ch[data-d]')];
  frame.querySelectorAll<HTMLElement>('.vi, .door').forEach((v) => {
    const before = chars.filter((c) => c.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING).pop();
    v.animate([{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 520, delay: before ? +before.dataset.d! + 70 : start, easing: 'cubic-bezier(.34, 1.4, .6, 1)', fill: 'backwards' });
  });
}

// Apparition d'un écran : libellés, puis le texte en cascade, les vignettes éclosant à leur place dans la cascade.
export function reveal(frame: Element, delay = 300, extraSkip?: string) {
  const start = fadeMono(frame, delay);
  const end = letters(frame, start, extraSkip);
  cascadeVignettes(frame, start);
  afterText(frame, end, start);
  return end;
}

// Apparition pilotée par le défilement (14/11, comme le suivi de progression de Locomotive) : la même chorégraphie que
// reveal(), préparée à l'arrêt ; set(t) la place à l'instant t (0 → total), dans un sens comme dans l'autre (rembobinage).
export function revealScrub(frame: Element) {
  const prev = SCRUB; SCRUB = []; MUTE = true;
  let end = 0;
  try { end = reveal(frame, 0); } finally { MUTE = false; }
  const scr = SCRUB!; SCRUB = prev;
  // images (études de cas) : elles se découvrent de bas en haut sous leur masque, avec une légère échelle, l'une après l'autre ;
  // pilotées comme le texte, elles se recouvrent en remontant
  const span = Math.max(700, end * 0.8);
  [...frame.querySelectorAll<HTMLElement>('img.md')].slice(0, 8).forEach((m, i) => m.animate(
    [{ clipPath: 'inset(100% 0 0 0)', scale: '1.08' }, { clipPath: 'inset(0 0 0 0)', scale: '1' }],
    { duration: span, delay: i * 90, easing: EASE_SLIDE, fill: 'backwards' },
  ));
  const anims = own(frame);
  anims.forEach((a) => a.pause());
  const total = Math.max(end, ...scr.map((x) => x.end), ...anims.map((a) => Number(a.effect?.getComputedTiming().endTime) || 0));
  const set = (t: number) => { const v = Math.max(0, Math.min(total, t)); anims.forEach((a) => { a.currentTime = v; }); scr.forEach((x) => x.render(v >= total ? Infinity : v)); };
  set(0);
  // text : instant où la dernière lettre apparaît (sans les finitions du mélange) — le rembobinage part de là
  const last = Math.max(0, ...[...frame.querySelectorAll<HTMLElement>('.ch[data-d]')].map((c) => +c.dataset.d!));
  return { total, text: Math.min(total, last ? last + 60 : end), set };
}

// Une fois le texte écrit : les apartés entre parenthèses s'écrivent comme le titre de l'accueil — chaque caractère passe par
// des signes au hasard avant de se fixer (Geist Mono, chasse fixe : rien ne bouge autour) ; les parenthèses, elles, sont posées
// d'emblée. Puis le bouton « (…) + » : ses parenthèses d'abord, le mot s'écrit dedans, et son + fait un tour pour attirer l'œil.
const TYPE = 34; // ms entre deux caractères (11/11 : 26 → 34)
// overlay (14/11) : la lettre reste en place, le signe se pose par-dessus — un signe plus large que sa lettre faisait déborder
// la ligne (aparté en Geist, pas en Mono) et le paragraphe passait un instant sur une ligne de plus
const NOTE_SCR = { step: TYPE, mix: 240, fast: 35, slow: 80, overlay: true };
const NOTE_STAGGER = 220; // écart entre les départs de deux apartés
function type(el: HTMLElement, delay: number): number {
  const text = (el.dataset.txt ??= el.textContent || '');
  el.textContent = '';
  const f = document.createDocumentFragment(), mixed: HTMLElement[] = [];
  let k = 0, word: HTMLElement | null = null; // mots soudés (.sw), comme dans letters()
  for (const c of text) {
    if (c === ' ') { f.appendChild(document.createTextNode(' ')); word = null; continue; }
    const sp = document.createElement('span'); sp.textContent = c;
    if (c === '(' || c === ')') sp.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: c === '(' ? delay : delay + k * TYPE, fill: 'backwards' });
    else { sp.className = 'ch'; mixed.push(sp); k++; } // .ch : lettre masquée pendant que son signe passe (.ch.sx)
    if (!word) { word = document.createElement('span'); word.className = 'sw'; f.appendChild(word); }
    word.appendChild(sp);
  }
  el.appendChild(f);
  if (mixed.length) scramble(mixed, delay + 40, NOTE_SCR);
  if (!MUTE) dispatchEvent(new CustomEvent('kk:sound', { detail: { name: 'letters', at: delay / 1000, span: (k * TYPE) / 1000 } }));
  return delay + k * TYPE + NOTE_SCR.mix;
}
function afterText(frame: Element, end: number, start = end) {
  if (reduced()) return;
  // les apartés entre parenthèses s'écrivent au fil du texte : chacun part quand la cascade atteint le mot qu'il commente
  // (sa dernière lettre vient d'apparaître) ; à défaut, après le texte, en cascade comme avant
  frame.querySelectorAll<HTMLElement>('.note').forEach((n, i) => {
    // dernière lettre écrite avant l'aparté, dans tout son paragraphe (derrière une vignette, son groupe de mots n'en a pas)
    const before = [...(n.closest('p, li, dd, h1, h2, h3') || frame).querySelectorAll<HTMLElement>('.ch[data-d]')]
      .filter((c) => c.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING).pop();
    type(n, before ? +before.dataset.d! + 90 : end - 200 + i * NOTE_STAGGER);
  });
  frame.querySelectorAll<HTMLElement>('.more .bp, .bp.cta').forEach((b) => {
    b.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: Math.max(0, end - 200), easing: EASE_OUT, fill: 'backwards' });
    b.querySelector('.sg')?.animate([{ rotate: '-90deg' }, { rotate: '0deg' }], { duration: 420, delay: Math.max(0, end - 100), easing: EASE_OUT, fill: 'backwards' });
  });
}
