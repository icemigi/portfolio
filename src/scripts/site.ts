// Point d'entrée unique du site. Le document n'est chargé qu'une fois (navigation sans rechargement, page.ts) :
//  - services globaux, installés une fois : chargement d'entrée, son, changement de langue, thème, titre d'onglet, copie de
//    l'adresse e-mail, flamme du mode nuit, mesure d'audience ;
//  - socle de chaque page, monté à chaque arrivée : liaisons typographiques, médias ASCII, boutons, apartés, évitement du
//    curseur, cartes, écrans ;
//  - scripts des pages et des composants (views/), tous inscrits ici dès le départ : une page vue pour la première fois
//    se monte au même instant que les autres, avant son premier affichage.
import './loader';
import './sound';
import './langswap';
import { soundLabel } from './sound';
import { onPage, start } from './page';
import { initScreens } from './screens';
import { reduced, resetMotion } from './motion';
import { initCards } from './card';
import { initHola } from './hola';
import { initParens } from './parens';
import { initAscii } from './ascii';
import { initTorch } from './torch';
import { initTie } from './tie';
import './views';

const root = document.documentElement;

// ---------- services globaux ----------

// Échange de page : le <html> reprend les attributs de la nouvelle page (Astro) ; l'état propre à la visite est reporté
// (JavaScript actif, chargement d'entrée déjà vu, page intégrée au Lab, thème, mode dev, type de navigation).
// Le chargement d'entrée n'appartient qu'au premier affichage du document : il est retiré des pages suivantes.
document.addEventListener('astro:before-swap', (e) => {
  const next = (e as Event & { newDocument: Document }).newDocument, nr = next.documentElement;
  ['js', 'ld-skip', 'embed'].forEach((c) => root.classList.contains(c) && nr.classList.add(c));
  for (const k of ['theme', 'dev', 'nav'] as const) if (root.dataset[k] !== undefined) nr.dataset[k] = root.dataset[k];
  next.querySelector('[data-ld]')?.remove();
});
// fin de navigation : le type de navigation (langue…) ne sert qu'à la transition ; page vue comptée (GoatCounter, sans cookie)
let firstLoad = true;
document.addEventListener('astro:page-load', () => {
  delete root.dataset.nav;
  if (firstLoad) { firstLoad = false; return; }
  (window as unknown as { goatcounter?: { count?: (o: object) => void } }).goatcounter?.count?.({ path: location.pathname + location.search, title: document.title });
});

// écrans et mode téléphone sont décidés au chargement : on recharge si la rotation franchit le seuil (sauf dans une fenêtre du Lab, qui perdrait la pièce ouverte)
if (!root.classList.contains('embed')) matchMedia('(max-width: 760px)').addEventListener('change', () => location.reload());

// Adresse e-mail : sur ordinateur, un clic la copie (« (copié) » à côté) au lieu d'ouvrir une messagerie qui n'est souvent
// pas configurée ; ⌘/Ctrl-clic et téléphone gardent le lien mailto.
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href^="mailto:"]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || !matchMedia('(hover: hover) and (pointer: fine)').matches || !navigator.clipboard) return;
  e.preventDefault();
  navigator.clipboard.writeText(a.href.slice(7)).then(() => {
    a.dataset.copied = root.lang === 'fr' ? '(copié)' : '(copied)';
    dispatchEvent(new CustomEvent('kk:sound', { detail: 'pick' }));
    clearTimeout(Number(a.dataset.ct)); a.dataset.ct = String(setTimeout(() => { delete a.dataset.copied; }, 1500));
  }, () => { location.href = a.href; });
});

// Mode nuit : le bouton lune bascule jour / nuit, le choix est mémorisé ; fondu des couleurs le temps de la bascule
const themeSync = () => document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(root.dataset.theme === 'nuit')));
document.addEventListener('click', (e) => {
  if (!(e.target as Element).closest?.('[data-theme-toggle]')) return;
  root.classList.add('theme-fade');
  if (root.dataset.theme === 'nuit') delete root.dataset.theme; else root.dataset.theme = 'nuit';
  try { localStorage.setItem('kk-theme', root.dataset.theme === 'nuit' ? 'nuit' : 'jour'); } catch { /* stockage indisponible */ }
  themeSync(); setTimeout(() => root.classList.remove('theme-fade'), 600);
});
// Mode nuit : le gantelet tient une torche (souris)
initTorch();

// Onglet quitté : son titre devient « (reviens) kerningkastle » ; au retour, il se réécrit en mélangé jusqu'au vrai titre
// (même écriture que le grand titre). Les minuteurs d'un onglet caché sont ralentis par le navigateur : on n'anime qu'au retour.
{
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&?!@#%*+=/§¶';
  let timer = 0, base = document.title;
  document.addEventListener('astro:after-swap', () => { clearTimeout(timer); base = document.title; });
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (document.hidden) { base = document.title; document.title = `(${root.lang === 'fr' ? 'reviens' : 'come back'}) kerningkastle`; return; }
    if (reduced()) { document.title = base; return; }
    const t0 = performance.now(), D = 700;
    const step = () => {
      const u = Math.min(1, (performance.now() - t0) / D), fixed = Math.floor(u * base.length);
      document.title = base.slice(0, fixed) + [...base.slice(fixed)].map((c) => (c === ' ' ? ' ' : POOL[(Math.random() * POOL.length) | 0])).join('');
      if (u < 1) timer = window.setTimeout(step, 45); else document.title = base;
    };
    step();
  });
}

// ---------- socle de chaque page (monté avant les pages, qui s'en servent) ----------
onPage(null, (ctx) => {
  ctx.cleanup(resetMotion);
  soundLabel(); themeSync();
  // petits mots liés au suivant (pas de « Le » seul en fin de ligne) : avant toute découpe du texte en lettres
  initTie();
  // médias : chargement en ASCII (trame de caractères, puis deux rendus ASCII de l'image, puis l'image)
  initAscii(ctx);
  // Boutons « (mot) + » : le signe devient un élément à part (il tourne au survol, le + devient × en fermant)
  document.querySelectorAll<HTMLElement>('.bp:not(.d)').forEach((b) => {
    const label = b.textContent || '';
    b.innerHTML = `<span class="bl"></span>${b.classList.contains('ba') ? '' : '<i class="sg" aria-hidden="true">+</i>'}`;
    b.querySelector('.bl')!.textContent = label;
    b.classList.add('d');
  });
  // Parenthèses du texte courant : isolées avant toute découpe en lettres.
  initParens();
  // Évitement du curseur : découpe faite avant toute apparition, pour que les deux animations se cumulent.
  initHola(ctx);
  // visuels [data-card] : au survol, ils s'inclinent vers le curseur comme une carte (card.ts)
  initCards(ctx);

  // Pages en écrans : écran d'ouverture choisi et préparé au montage (avant le premier affichage), puis son apparition —
  // après le chargement d'entrée au premier affichage du document ; aussitôt en navigation. Arrivée par « Projet suivant » :
  // l'étude gère elle-même son apparition ; changement de langue : la page s'ouvre telle quelle.
  const host = document.querySelector<HTMLElement>('[data-screens]');
  if (!host) { root.classList.remove('rv-pre'); return; }
  const api = initScreens(host, ctx);
  if (api.count < 2) document.querySelectorAll('[data-go="0"]').forEach((a) => a.remove());
  if (ctx.info.next) { root.classList.remove('rv-pre'); return; }
  if (ctx.first) window.kkReady!.then(() => { if (!ctx.signal.aborted) api.start(150); });
  else api.start(60);
}, -10);

start();
