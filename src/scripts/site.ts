// Comportements communs à toutes les pages.
import './loader';
import { initScreens } from './screens';
import { reveal } from './motion';
import './sound';
import { paren } from './paren';
import { initHola } from './hola';

// Email : clic = adresse copiée avec confirmation ; l'adresse reste sélectionnable.
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.('[data-copy]') as HTMLElement | null;
  if (!a) return;
  if (String(getSelection() || '').length) return;
  e.preventDefault();
  const addr = a.dataset.copy!;
  navigator.clipboard?.writeText(addr).catch(() => {});
  const label = a.querySelector<HTMLElement>('[data-label]') || a;
  if (label.dataset.busy) return;
  const old = label.textContent;
  label.dataset.busy = '1';
  label.textContent = a.dataset.copied || 'Copié ✓';
  const live = document.getElementById('live');
  if (live) live.textContent = a.dataset.copied || 'Copié';
  setTimeout(() => { label.textContent = old; delete label.dataset.busy; }, 1400);
});

// Langue : le choix est mémorisé.
document.querySelectorAll<HTMLAnchorElement>('[data-lang]').forEach((a) =>
  a.addEventListener('click', () => { try { localStorage.setItem('kk-lang', a.dataset.lang!); } catch { /* */ } }),
);

// parenthèses des textes courants en orange (avant toute découpe en lettres)
paren();

// curseur : le gantelet est posé en CSS (global.css) ; l'ancienne flèche dessinée en JS est retirée

// Boutons « (mot) + » : le signe devient un élément à part (il tourne au survol, le + devient × en fermant)
document.querySelectorAll<HTMLElement>('.bp:not(.d)').forEach((b) => {
  const label = b.textContent || '';
  b.innerHTML = `<span class="bl"></span>${b.classList.contains('ba') ? '' : '<i class="sg" aria-hidden="true">+</i>'}`;
  b.querySelector('.bl')!.textContent = label;
  b.classList.add('d');
});

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
    if (!first.hasAttribute('data-still')) window.kkReady!.then(() => reveal(first, 150));
  }
  document.dispatchEvent(new Event('kk:screens'));
}

