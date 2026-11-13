// Défilement libre (règle site entier, décidée le 13/11) : la page défile d'un bloc, sans écrans aimantés, avec un lesté
// léger sur ordinateur (Lenis) ; les apparitions se règlent sur le défilement (GSAP ScrollTrigger).
// Une page passe en défilement libre avec <div class="screens-host free" data-screens data-no-arrow> et appelle initFlow().
//   initFlow()           lesté (ordinateur, jamais avec « réduire les animations »), fond du menu au défilement
//   scrubLetters(...)    texte qui apparaît au fil du défilement, bloc figé au centre : chaque ligne glisse vers le haut
//                        depuis derrière un cache posé sur sa ligne (lignes masquées), en suivant le défilement
//   revealLines(...)     les mêmes lignes masquées, jouées d'elles-mêmes
//   enterOnce(...)       élément qui apparaît en lignes masquées à son entrée dans l'écran (rembobiné en remontant)
//   maskIn(...)          visuel découvert au masque à son entrée (recouvert en remontant), légère parallaxe
//   contactIn()          écran contact : l'adresse s'écrit à chaque arrivée, le sceau tourne avec le défilement
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reduced, reveal } from './motion';
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

let lenis: Lenis | null = null;

export function initFlow() {
  const still = reduced();
  if (!still && matchMedia('(hover: hover) and (pointer: fine)').matches && !lenis) {
    lenis = new Lenis({ lerp: 0.11 });
    (window as any).kkLenis = lenis; // pour les liens « Haut ↑ » (screens.ts)
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // le menu prend son fond dès qu'on défile
  const head = document.querySelector('.site-header');
  const solid = () => head?.classList.toggle('solid', scrollY > 8);
  addEventListener('scroll', solid, { passive: true });
  solid();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
  return { still };
}

// ---------- texte en lignes masquées ----------
// Chaque lettre devient un span .sc ; les lettres sont regroupées par ligne. Une ligne « arrive » en glissant vers le haut
// depuis derrière un cache posé sur sa propre ligne : la lettre descend de d % et sa partie basse est rognée d'autant
// (décalage + rognage ensemble), si bien qu'elle sort de sa ligne sans jamais déborder ni passer en transparence.
type U = { el: HTMLElement; vi: boolean };
function split(box: HTMLElement): U[] {
  if (!box.dataset.split) {
    const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, { acceptNode: (t) => (t.nodeValue?.trim() && !t.parentElement?.closest('.vi') ? 1 : 2) });
    const texts: Text[] = [];
    while (walk.nextNode()) texts.push(walk.currentNode as Text);
    texts.forEach((t) => {
      const f = document.createDocumentFragment();
      for (const c of t.nodeValue!) {
        if (/[ \t\n\r\f]/.test(c)) { f.append(c); continue; } // l'espace insécable (tie.ts) reste dans le mot
        const sp = document.createElement('span'); sp.className = 'sc'; sp.textContent = c; f.append(sp);
      }
      t.replaceWith(f);
    });
    // chaque mot reste soudé (span .sw insécable) : des lettres en boîtes ne doivent jamais couper un mot en fin de ligne
    const parents = new Set<Element>();
    box.querySelectorAll('.sc').forEach((sc) => { const p = sc.parentElement!; parents.add(p.classList.contains('hc') ? p.parentElement! : p); });
    parents.forEach((par) => {
      let run: Node[] = [];
      const flush = () => { if (run.length) { const w = document.createElement('span'); w.className = 'sw'; run[0].parentNode!.insertBefore(w, run[0]); run.forEach((n) => w.appendChild(n)); } run = []; };
      [...par.childNodes].forEach((n) => {
        const el = n.nodeType === 1 ? (n as Element) : null;
        if (el && (el.classList.contains('sc') || el.classList.contains('hc'))) run.push(n);
        else if (n.nodeType === 3 && /^\u00a0+$/.test(n.nodeValue || '')) run.push(n); // espace insécable entre deux lettres : même mot
        else flush();
      });
      flush();
    });
    box.dataset.split = '1';
  }
  return [...box.querySelectorAll<HTMLElement>('.sc, .vi')].map((el) => ({ el, vi: el.classList.contains('vi') }));
}
function linesOf(units: U[]): U[][] {
  const rows = new Map<number, U[]>();
  for (const u of units) { const k = Math.round(u.el.getBoundingClientRect().top / 6); rows.set(k, [...(rows.get(k) || []), u]); }
  return [...rows.entries()].sort((x, y) => x[0] - y[0]).map((r) => r[1]);
}
// position d'une lettre : e = 0 (cachée sous sa ligne) → 1 (en place)
function pose(u: U, e: number) {
  if (u.vi) { const d = (1 - e) * 100; u.el.style.clipPath = e >= 1 ? '' : `inset(0 0 ${d}% 0)`; u.el.style.scale = e >= 1 ? '' : String(0.7 + 0.3 * e); return; }
  const d = (1 - e) * 105;
  u.el.style.translate = e >= 1 ? '' : `0 ${d.toFixed(1)}%`;
  u.el.style.clipPath = e >= 1 ? '' : `inset(-20% -5% ${d.toFixed(1)}% -5%)`;
}
const out = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// Texte écrit au fil du défilement, ligne par ligne, bloc figé au centre : le glissement de chaque ligne suit le défilement
// en continu (les lignes se chevauchent un peu, chaque lettre suit avec un infime décalage). `after(done)` : texte complet.
export function scrubLetters(box: HTMLElement, trigger: HTMLElement, pin: HTMLElement, hold = 1.2, after?: (done: boolean) => void) {
  if (reduced()) { after?.(true); return; }
  const units = split(box);
  let lines: U[][] = [];
  const measure = () => { units.forEach((u) => pose(u, 1)); lines = linesOf(units); };
  measure();
  ScrollTrigger.addEventListener('refreshInit', () => units.forEach((u) => pose(u, 1)));
  ScrollTrigger.addEventListener('refresh', measure);
  let done = false;
  const set = (p: number) => {
    const L = lines.length, span = 1.8;
    lines.forEach((line, i) => {
      const t = (p * (L - 1 + span) - i) / span;
      line.forEach((u, j) => pose(u, out(t * 1.12 - (j / Math.max(1, line.length)) * 0.12)));
    });
    const d = p > 0.98;
    if (d !== done) { done = d; after?.(d); }
  };
  set(0);
  const st = ScrollTrigger.create({ trigger, start: 'center center', end: `+=${hold * 100}%`, pin, anticipatePin: 1 });
  ScrollTrigger.create({ trigger, start: 'top 75%', end: () => st.end - innerHeight * 0.1, scrub: 0.4, onUpdate: (s) => set(s.progress) });
}

// Lignes masquées jouées d'elles-mêmes (à l'entrée dans l'écran) : les lignes montent l'une après l'autre.
export function revealLines(box: HTMLElement, delay = 0) { lineMask(box).to(1, delay); }

// Lignes masquées pilotables : to(1) les fait monter (la première d'abord), to(0) les fait redescendre sous leur cache
// (la dernière d'abord, un peu plus vite) — c'est le rembobinage quand on remonte la page.
export function lineMask(box: HTMLElement) {
  const units = split(box);
  units.forEach((u) => pose(u, 1));
  let lines = linesOf(units);
  const prog = lines.map(() => 0); // progression de chaque ligne (0 cachée → 1 en place)
  let target = 0, t0 = 0, raf = 0, from: number[] = [];
  units.forEach((u) => pose(u, 0));
  const paint = () => lines.forEach((line, i) => line.forEach((u, j) => pose(u, out(prog[i] * 1.08 - (j / Math.max(1, line.length)) * 0.08))));
  const tick = () => {
    raf = 0;
    const now = performance.now(), L = lines.length;
    const DUR = target ? 900 : 520, GAP = target ? 90 : 45;
    let busy = false;
    lines.forEach((_, i) => {
      const k = target ? i : L - 1 - i;
      const t = Math.min(1, Math.max(0, (now - t0 - k * GAP) / DUR));
      if (t < 1) busy = true;
      prog[i] = from[i] + (target - from[i]) * t;
    });
    paint();
    if (busy) raf = requestAnimationFrame(tick);
  };
  return {
    to(v: 0 | 1, delay = 0) {
      if (reduced()) { units.forEach((u) => pose(u, v)); return; }
      target = v; from = [...prog]; t0 = performance.now() + delay;
      if (!raf) raf = requestAnimationFrame(tick);
    },
    remeasure() { units.forEach((u) => pose(u, 1)); lines = linesOf(units); paint(); },
  };
}

// Élément qui apparaît à son entrée dans l'écran : ses lignes montent de derrière leur cache, l'une après l'autre ;
// en remontant au-dessus de lui, l'animation se rembobine (les lignes redescendent), et se rejoue à la redescente.
export function enterOnce(els: Iterable<HTMLElement>, start = 'top 92%') {
  if (reduced()) return;
  for (const el of els) {
    const m = lineMask(el);
    ScrollTrigger.create({ trigger: el, start, onEnter: () => m.to(1), onLeaveBack: () => m.to(0) });
  }
}

// Visuel qui se découvre au masque à son entrée (de bas en haut) et se recouvre en remontant ; légère parallaxe.
export function maskIn(els: Iterable<HTMLElement>, parallax = 50) {
  if (reduced()) return;
  let i = 0;
  for (const el of els) {
    gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.out', delay: (i++ % 6) * 0.06, scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } });
    if (parallax) gsap.fromTo(el, { y: parallax }, { y: -parallax, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
}

// Écran contact (ContactScreen) : l'adresse s'écrit comme sur le reste du site (lettre à lettre, au rythme du titre) à
// chaque arrivée ; le sceau tourne un peu avec le défilement.
export function contactIn() {
  const last = document.querySelector<HTMLElement>('.screens-host.free > .scr.last');
  if (!last || reduced()) return;
  let shown = false;
  ScrollTrigger.create({ trigger: last, start: 'top 70%', onEnter: () => { if (!shown) { shown = true; reveal(last, 0); } }, onLeaveBack: () => { shown = false; } });
  const seal = last.querySelector<HTMLElement>('.seal');
  if (seal) gsap.fromTo(seal, { rotate: -30 }, { rotate: 15, ease: 'none', scrollTrigger: { trigger: last, start: 'top bottom', end: 'bottom bottom', scrub: true } });
}
