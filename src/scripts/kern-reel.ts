// Showreel des logos kern.outdoor (balisage : src/components/case/kern/KernReel.astro). Renvoie la timeline GSAP, en pause :
// à la page de la jouer quand le showreel est visible (restart) et de l'arrêter sinon (pause).
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
gsap.registerPlugin(MorphSVGPlugin);

export function buildReel(reel: HTMLElement, still: boolean): gsap.core.Timeline {
  let tl!: gsap.core.Timeline;
  const D = JSON.parse(reel.querySelector('[data-reel-d]')!.textContent || '{}');
  const svg = reel.querySelector('svg')!, NS = 'http://www.w3.org/2000/svg';
  const $ = (c: string) => reel.querySelector<SVGElement>(`.${c}`)!;
  const head = $('head'), body = $('body'), W = $('w'), reg1 = $('reg1'), reg2 = $('reg2'), bg0 = $('bg0'), bgA = $('bgA'), bg1 = $('bg1');
  const L = ['k', 'e', 'r', 'n'].map($), fig = [head, body];
  const C = { black: '#1C1C1C', orange: '#FF7E00', olive: '#353C15', lime: '#DEDE1F', cream: '#FFF8E3' };
  const M = 0.6; // durée d'un morphing (s)
  const F = { duration: 0.2, ease: 'power3.out' }; // les couleurs basculent tout de suite

  // (pas de fromTo : ses valeurs de départ, posées dès la création, se battaient avec l'état de départ à chaque reprise)
  // masques : un rectangle de découpe par élément ; ouvert = très grand, sinon ses bords suivent la boîte du tracé
  const defs = document.createElementNS(NS, 'defs'); svg.prepend(defs);
  let nid = 0;
  const mask = (el: SVGElement) => {
    const cp = document.createElementNS(NS, 'clipPath'), r = document.createElementNS(NS, 'rect');
    cp.id = `kk-reel-${nid++}`; cp.appendChild(r); defs.appendChild(cp); el.setAttribute('clip-path', `url(#${cp.id})`);
    return r;
  };
  const box = (d: string) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); svg.appendChild(p); const b = p.getBBox(); p.remove(); return b; };
  type B = { x: number; y: number; width: number; height: number };
  const BIG = { x: -5000, y: -5000, width: 11000, height: 11000 };
  const shutL = (b: B) => ({ x: b.x, y: -5000, width: 0, height: 11000 });                 // fermé, s'ouvrira depuis la gauche
  const openL = (b: B) => ({ x: b.x, y: -5000, width: b.width + 2, height: 11000 });
  const shutB = (b: B) => ({ x: -5000, y: b.y + b.height + 1, width: 11000, height: 6000 }); // fermé, s'ouvrira depuis le bas
  const openB = (b: B) => ({ x: -5000, y: b.y - 1, width: 11000, height: 6000 });
  const fullU = (b: B) => ({ x: -5000, y: -5000, width: 11000, height: b.y + b.height + 5001 }); // ouvert, se fermera vers le haut
  const shutU = (b: B) => ({ x: -5000, y: -5000, width: 11000, height: b.y + 4999 });
  const mHead = mask(head), mBody = mask(body), mW = mask(W), mR1 = mask(reg1), mR2 = mask(reg2), mL = L.map(mask);
  const bx = {
    runBody: box(D.run.body), cHead: box(D.cairn.head), cBody: box(D.cairn.body), w: box(D.word.w),
    L: (['k', 'e', 'r', 'n'] as const).map((l) => box(D.cairn[l])),
    reg: { mont: [box(D.mont.reg1), box(D.mont.reg2)], run: [box(D.run.reg1), box(D.run.reg2)], cairn: [box(D.cairn.reg1), box(D.cairn.reg2)], word: [box(D.word.reg1), box(D.word.reg2)] },
  };

  tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'expo.inOut' } });
  // double volet : le liseré (couleur d'accent) part le premier, le fond le suit à 0,035 s
  const wipe = (at: number, col: string, acc: string, d = 0.55) => {
    tl!.set(bgA, { attr: { fill: acc }, y: 1000 }, at).set(bg1, { attr: { fill: col }, y: 1000 }, at)
      .to(bgA, { y: 0, duration: d }, at).to(bg1, { y: 0, duration: d }, at + 0.035)
      .set(bg0, { attr: { fill: col } }, at + d + 0.035).set([bgA, bg1], { y: 1000 }, at + d + 0.035);
  };
  // ® : sort par le haut, revient par le bas à sa nouvelle place
  type K = 'mont' | 'run' | 'cairn' | 'word';
  const regOut = (at: number, k: K) => [mR1, mR2].forEach((m, i) => tl!.set(m, { attr: fullU(bx.reg[k][i]) }, at).to(m, { attr: shutU(bx.reg[k][i]), duration: 0.16, ease: 'power3.in' }, at));
  const regIn = (at: number, k: K, fill: string) => {
    tl!.set(reg1, { morphSVG: D[k].reg1, fill }, at - 0.01).set(reg2, { morphSVG: D[k].reg2, fill }, at - 0.01);
    [mR1, mR2].forEach((m, i) => tl!.set(m, { attr: shutB(bx.reg[k][i]) }, at - 0.01).to(m, { attr: openB(bx.reg[k][i]), duration: 0.35, ease: 'expo.out' }, at));
  };

  // état de départ (et de chaque reprise) : la montagne en gros plan, orange sur noir ; le reste masqué
  tl.set(bg0, { attr: { fill: C.black } }, 0)
    .set(head, { morphSVG: D.mont.head, fill: C.orange, y: 0, scale: 2.6, transformOrigin: '50% 60%' }, 0)
    .set(mHead, { attr: BIG }, 0)
    .set(body, { morphSVG: D.run.body, fill: C.cream, y: 0 }, 0).set(mBody, { attr: shutL(bx.runBody) }, 0)
    .set(L, { morphSVG: (i: number) => D.cairn['kern'[i]], fill: C.lime, y: 0 }, 0)
    .set(W, { scale: 1, transformOrigin: '43% 55%' }, 0).set(mW, { attr: shutL(bx.w) }, 0)
    .set([reg1, reg2], { morphSVG: D.mont.reg1, fill: C.orange }, 0);
  mL.forEach((m, i) => tl!.set(m, { attr: shutB(bx.L[i]) }, 0));
  [mR1, mR2].forEach((m, i) => tl!.set(m, { attr: shutB(bx.reg.mont[i]) }, 0));

  // recul sur la montagne, puis le ®
  tl.to(head, { scale: 1, duration: 0.7, ease: 'expo.out' }, 0);
  regIn(0.55, 'mont', C.orange);
  // la montagne devient la tête du bonhomme ; le corps se découvre depuis la gauche (fond orange, liseré crème)
  regOut(1.0, 'mont'); wipe(1.0, C.orange, C.cream);
  tl.to(head, { morphSVG: D.run.head, duration: M }, 1.15)
    .to(head, { keyframes: [{ y: -26, duration: 0.25, ease: 'power3.in' }, { y: 0, duration: 0.5, ease: 'expo.out' }] }, 1.0)
    .to(head, { fill: C.cream, ...F }, 1.2)
    .to(mBody, { attr: openL(bx.runBody), duration: 0.5, ease: 'expo.out' }, 1.4).set(mBody, { attr: BIG }, 1.9);
  regIn(1.85, 'run', C.cream);
  // il se pose sur les lettres, qui montent de leur ligne de base : le cairn (fond olive, liseré citron)
  regOut(2.3, 'run'); wipe(2.3, C.olive, C.lime);
  tl.to(head, { morphSVG: D.cairn.head, duration: M }, 2.45)
    .to(body, { morphSVG: D.cairn.body, duration: M }, 2.45)
    .to(fig, { keyframes: [{ y: -26, duration: 0.25, ease: 'power3.in' }, { y: 0, duration: 0.5, ease: 'expo.out' }] }, 2.3)
    .to(fig, { fill: C.lime, ...F }, 2.5);
  mL.forEach((m, i) => tl!.to(m, { attr: openB(bx.L[i]), duration: 0.5, ease: 'expo.out' }, 2.65 + i * 0.05));
  regIn(3.15, 'cairn', C.lime);
  // le cairn est poussé vers le haut et se masque (dans le sens du volet) ; le lettrage se peint (fond citron, liseré crème)
  regOut(3.6, 'cairn'); wipe(3.6, C.lime, C.cream);
  [[mHead, bx.cHead], [mBody, bx.cBody], ...mL.map((m, i) => [m, bx.L[i]])].forEach(([m, b], i) =>
    tl!.set(m as SVGElement, { attr: fullU(b as B) }, 3.6).to(m as SVGElement, { attr: shutU(b as B), duration: 0.32, ease: 'power3.in' }, 3.6 + i * 0.02));
  tl.to([...fig, ...L], { y: -90, duration: 0.32, ease: 'power3.in', stagger: 0.02 }, 3.6)
    .to(mW, { attr: openL(bx.w), duration: 0.55, ease: 'expo.out' }, 3.95).set(mW, { attr: BIG }, 4.5);
  regIn(4.45, 'word', C.black);
  // plongée dans le lettrage jusqu'au noir (liseré orange), puis coupe franche sur la montagne
  regOut(4.9, 'word'); wipe(4.9, C.black, C.orange, 0.42);
  tl.to(W, { scale: 12, duration: 0.5, ease: 'expo.in' }, 4.9)
    .set(mW, { attr: shutL(bx.w) }, 5.36)
    .to({}, { duration: 0.02 }, 5.38);
  if (still) tl.progress(3.4 / tl.duration()).pause(); // sans animation : le cairn, posé
  return tl;
}
