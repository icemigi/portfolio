// Changement de langue : au clic sur le bouton langue (l'autre langue, seule affichée), les textes de l'écran affiché (et le menu) se réécrivent sur place dans
// l'autre langue — une vague de signes tirés au hasard passe de gauche à droite et laisse derrière elle le nouveau texte,
// comme le grand titre. Puis la page de l'autre langue prend sa place sans rechargement (navigation du site), au même écran,
// sans animation ni apparition : son texte est déjà celui qu'on voit. Le texte cible vient de la page elle-même, lue bloc par
// bloc dans le même ordre ; le même document sert ensuite à la navigation (pas de second téléchargement).
import { navigate } from 'astro:transitions/client';
import { reduced, settle, stopScrambles } from './motion';
import { initParens } from './parens';
import { screens } from './screens';

const BLOCK = 'h1, h2, h3, h4, p, dt, dd, li, figcaption, label';   // blocs de texte
const INLINE = 'a, button';                                           // liens et boutons hors de tout bloc
const SKIP = '.vi, .door, svg, canvas, .sr, script, style, .p3d, img, video, iframe, .more-arrow, [data-clock]';
const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&?!@#%*+=/§¶<>';
const D = 620, W = 10, STAGGER = 35; // durée d'un bloc, largeur de la vague (caractères), décalage entre blocs

const clean = (s: string) => s.replace(/\s+/g, ' ');
// blocs de texte : les plus intérieurs (un service = son titre + sa description, chacun à part ; un lien dans un paragraphe
// appartient au paragraphe), plus les liens et boutons isolés
const keep = (el: Element) => !el.closest(SKIP) && !!clean(el.textContent || '').trim();
function blocks(scope: Element | null): Element[] {
  if (!scope) return [];
  const bl = [...scope.querySelectorAll(BLOCK)].filter((el) => keep(el) && !el.querySelector(BLOCK));
  const il = [...scope.querySelectorAll(INLINE)].filter((el) => keep(el) && !el.closest(BLOCK) && !el.parentElement?.closest(INLINE));
  return [...bl, ...il].sort((x, y) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}

type Slot = { node: Text; old: string; s0: number; s1: number };
type Job = { slots: Slot[]; target: string; delay: number };

// Morceaux d'un bloc : suites de nœuds texte d'un même élément (phrase, aparté, lien, mot en gras…), coupées par chaque
// élément ignoré (vignette, image). Les lettres découpées pour les animations (.ch, .hc, .sc, .sw, spans sans classe)
// comptent pour leur parent : la page affichée et la page fraîche ont ainsi les mêmes morceaux, dans le même ordre.
const WRAP = '.ch, .hc, .sw, span:not([class])';
function runs(block: Element): Text[][] {
  const out: Text[][] = [[]];
  let owner: Element | null = null;
  const cut = () => { if (out[out.length - 1].length) out.push([]); owner = null; };
  const visit = (n: Node) => {
    if (n.nodeType === 3) {
      let o = n.parentElement;
      while (o && o !== block && o.matches(WRAP)) o = o.parentElement;
      if (o !== owner) { cut(); owner = o; }
      out[out.length - 1].push(n as Text);
    } else if (n.nodeType === 1) {
      if ((n as Element).matches(SKIP)) { cut(); return; }
      n.childNodes.forEach(visit);
    }
  };
  block.childNodes.forEach(visit);
  return out.filter((r) => r.length);
}

// nouveau texte réparti sur des nœuds existants au prorata de leur longueur (texte cible en [a, b[)
function spread(nodes: Text[], olds: string[], a: number, b: number): Slot[] {
  const L = olds.reduce((n, x) => n + x.length, 0) || 1, k = (b - a) / L;
  let acc = 0;
  const slots = nodes.map((node, j) => { const s0 = a + Math.round(acc * k); acc += olds[j].length; return { node, old: olds[j], s0, s1: a + Math.round(acc * k) }; });
  if (slots.length) { slots[0].s0 = a; slots[slots.length - 1].s1 = b; }
  return slots;
}

function prepare(cur: Element[], next: Element[]): Job[] {
  const jobs: Job[] = [];
  cur.slice(0, next.length).forEach((el, b) => {
    const delay = Math.min(b * STAGGER, 360);
    const rc = runs(el), rn = runs(next[b]);
    const olds = rc.map((r) => r.map((n) => clean(n.nodeValue || '')));
    const tgts = rn.map((r) => clean(r.map((n) => n.nodeValue || '').join('')));
    if (clean(olds.flat().join('')).trim() === clean(tgts.join('')).trim()) return; // même texte dans les deux langues (le nom)
    if (rc.length === rn.length) {
      // même structure : chaque morceau devient son équivalent (une phrase reste une phrase, un aparté reste un aparté,
      // les vignettes ne bougent pas entre deux morceaux)
      let a = 0;
      const slots = rc.flatMap((r, i) => { const s = spread(r, olds[i], a, a + tgts[i].length); a += tgts[i].length; return s; });
      jobs.push({ slots, target: tgts.join(''), delay });
      return;
    }
    // structure différente : tout le bloc d'un seul tenant
    const target = clean(tgts.join('')).trim();
    const slots = spread(rc.flat(), olds.flat(), 0, target.length);
    if (slots.length) jobs.push({ slots, target, delay });
  });
  return jobs;
}

function run(jobs: Job[], done: () => void) {
  const t0 = performance.now();
  const frame = (now: number) => {
    let live = false;
    for (const { slots, target, delay } of jobs) {
      const u = Math.max(0, Math.min(1, (now - t0 - delay) / D));
      if (u < 1) live = true;
      const lock = Math.floor((1 - (1 - u) ** 2) * (target.length + W)) - W; // la vague entre puis traverse le bloc
      for (const s of slots) {
        const len = Math.max(s.old.length, s.s1 - s.s0);
        let out = '';
        for (let i = 0; i < len; i++) {
          const g = s.s0 + i, inNew = g < s.s1;
          if (g < lock) out += inNew ? target[g] : '';
          else if (g < lock + W) out += (inNew ? target[g] : s.old[i] ?? '') === ' ' ? ' ' : POOL[(Math.random() * POOL.length) | 0];
          else out += s.old[i] ?? '';
        }
        if (s.node.nodeValue !== out) s.node.nodeValue = out;
      }
    }
    if (live) requestAnimationFrame(frame); else done();
  };
  requestAnimationFrame(frame);
}

// document de la page cible, déjà téléchargé : la navigation l'utilise tel quel
let ready: { href: string; html: string } | null = null;
document.addEventListener('astro:before-preparation', (e) => {
  const ev = e as Event & { to: URL; loader: () => Promise<void>; newDocument: Document };
  if (!ready || ev.to.href !== ready.href) return;
  const { html } = ready; ready = null;
  ev.loader = async () => { ev.newDocument = new DOMParser().parseFromString(html, 'text/html'); };
});

// phase de capture : ce clic passe avant le routeur du site, qui l'ignore ensuite (defaultPrevented) — sinon il naviguerait
// lui-même tout de suite, sans la réécriture ni l'écran à garder
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[data-lang]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault();
  try { localStorage.setItem('kk-lang', a.dataset.lang!); } catch { /* stockage indisponible */ } // langue mémorisée (racine du site)
  const url = new URL(a.href);
  const s = screens();
  // la page cible s'ouvre au même écran, telle quelle (page.ts → info.lang), sans animation de transition (data-nav, global.css)
  const go = (html?: string) => {
    if (html) ready = { href: url.href, html };
    document.documentElement.dataset.nav = 'lang';
    navigate(url.href, { info: { lang: { screen: s?.current() ?? 0 } } });
  };
  if (reduced()) { go(); return; }
  const timeout = new Promise<null>((r) => setTimeout(() => r(null), 900));
  Promise.race([fetch(url.href).then((r) => (r.ok ? r.text() : null)).catch(() => null), timeout]).then((html) => {
    if (!html) { go(); return; }
    // une seule animation à la fois : l'apparition en cours (lettres qui montent, titre et apartés qui s'écrivent) est
    // terminée net avant la réécriture — sinon les deux écrivent dans les mêmes lettres en même temps
    stopScrambles();
    settle(document.documentElement);
    document.getAnimations().forEach((an) => { const t = (an.effect as KeyframeEffect | null)?.target as Element | null; if (t?.closest?.('.ch, .note, .parenthesis-reveal, .bp, .mono, [data-screens]')) try { an.finish(); } catch { /* animation sans fin */ } });
    const doc = new DOMParser().parseFromString(html, 'text/html');
    initParens(doc); // mêmes apartés isolés que sur la page affichée
    // même écran (même rang parmi les écrans de la page) et même menu
    const here = document.querySelectorAll('[data-screens] > .scr'), there = doc.querySelectorAll('[data-screens] > .scr');
    const scr = s?.el(s.current()), idx = scr ? [...here].indexOf(scr) : -1;
    const jobs = [
      ...prepare(blocks(document.querySelector('.site-header nav')), blocks(doc.querySelector('.site-header nav'))),
      // le bouton langue (hors du menu sur ordinateur) se réécrit avec le reste : « en » devient « fr »
      ...prepare(blocks(document.querySelector('.site-header .r')), blocks(doc.querySelector('.site-header .r'))),
      ...(idx >= 0 && there[idx] ? prepare(blocks(scr!), blocks(there[idx])) : []),
    ];
    if (!jobs.length) { go(html); return; }
    dispatchEvent(new CustomEvent('kk:sound', { detail: { name: 'letters', at: 0, span: D / 1000 } }));
    run(jobs, () => go(html));
  });
}, { capture: true });
