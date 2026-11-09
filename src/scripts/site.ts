// Comportements communs à toutes les pages.
import './loader';
import { initScreens } from './screens';
import { reveal } from './motion';
import './sound';
import { initHola } from './hola';
import { initParens } from './parens';
import { initAscii } from './ascii';

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
  if (!(window as any).kkArriving) {
    const first = api.el(api.current());
    if (!first.hasAttribute('data-still')) window.kkReady!.then(() => document.fonts.ready).then(() => reveal(first, 150));
  }
  document.dispatchEvent(new Event('kk:screens'));
}

