// Comportements communs à toutes les pages.
import './loader';
import { initScreens } from './screens';
import { reveal, reduced } from './motion';
import './sound';
import { initHola } from './hola';
import { initParens } from './parens';
import { initAscii } from './ascii';
import './langswap';
import { initTorch } from './torch';

// médias : chargement en ASCII (trame de caractères, puis deux rendus ASCII de l'image, puis l'image)
initAscii();

// Langue : le choix est mémorisé.
document.querySelectorAll<HTMLAnchorElement>('[data-lang]').forEach((a) =>
  a.addEventListener('click', () => { try { localStorage.setItem('kk-lang', a.dataset.lang!); } catch { /* */ } }),
);

// écrans et mode téléphone sont décidés au chargement : on recharge si la rotation franchit le seuil (sauf dans une fenêtre du Lab, qui perdrait la pièce ouverte)
if (!document.documentElement.classList.contains('embed')) matchMedia('(max-width: 760px)').addEventListener('change', () => location.reload());

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
initHola();

// Pages en écrans
const host = document.querySelector<HTMLElement>('[data-screens]');
if (host) {
  const api = initScreens(host);
  if (api.count < 2) document.querySelectorAll('[data-go="0"]').forEach((a) => a.remove());
  // arrivée par « Projet suivant » : l'étude gère elle-même son apparition
  // l'apparition attend la fin du chargement d'entrée (s'il y en a un)
  // après un changement de langue, le texte vient d'être réécrit sur place : la page s'ouvre telle quelle, sans apparition
  if (!(window as any).kkArriving && !(window as any).kkSwapped) {
    const first = api.el(api.current());
    if (!first.hasAttribute('data-still')) window.kkReady!.then(() => document.fonts.ready).then(() => reveal(first, 150));
  }
  document.dispatchEvent(new Event('kk:screens'));
}


// Onglet quitté : son titre devient « (reviens) kerningkastle » ; au retour, il se réécrit en mélangé jusqu'au vrai titre
// (même écriture que le grand titre). Les minuteurs d'un onglet caché sont ralentis par le navigateur : on n'anime qu'au retour.
{
  const base = document.title, away = `(${document.documentElement.lang === 'fr' ? 'reviens' : 'come back'}) kerningkastle`;
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&?!@#%*+=/§¶';
  let timer = 0;
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (document.hidden) { document.title = away; return; }
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

// Mode nuit (essai) : le bouton lune bascule jour / nuit, le choix est mémorisé ; fondu des couleurs le temps de la bascule
document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => {
  const root = document.documentElement, sync = () => b.setAttribute('aria-pressed', String(root.dataset.theme === 'nuit'));
  sync();
  b.addEventListener('click', () => {
    root.classList.add('theme-fade');
    if (root.dataset.theme === 'nuit') delete root.dataset.theme; else root.dataset.theme = 'nuit';
    try { localStorage.setItem('kk-theme', root.dataset.theme === 'nuit' ? 'nuit' : 'jour'); } catch { /* */ }
    sync(); setTimeout(() => root.classList.remove('theme-fade'), 600);
  });
});

// Mode nuit : le gantelet tient une torche (souris)
initTorch();
