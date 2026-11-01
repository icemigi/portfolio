// Comportements communs à toutes les pages.
import './loader';
import { initScreens } from './screens';
import { reveal } from './motion';
import './sound';
import { initHola } from './hola';
import { initCursor } from './cursor';

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

initCursor();

// Évitement du curseur : découpe faite avant toute apparition, pour que les deux animations se cumulent.
initHola();

// Pages en écrans
const host = document.querySelector<HTMLElement>('[data-screens]');
// ESSAI : défilement libre (natif) à la place du défilement écran par écran. ?libre l'active, ?ecrans le coupe ;
// le choix tient pendant la visite. Chaque écran apparaît quand il entre dans la fenêtre.
let libre = false;
try {
  if (/[?&]libre\b/.test(location.search)) sessionStorage.setItem('kk-libre', '1');
  if (/[?&]ecrans\b/.test(location.search)) sessionStorage.removeItem('kk-libre');
  libre = sessionStorage.getItem('kk-libre') === '1';
} catch { /* */ }
if (host && libre) {
  document.documentElement.classList.add('libre');
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    if (!(e.target as HTMLElement).hasAttribute('data-still')) window.kkReady!.then(() => reveal(e.target as HTMLElement, 80));
  }), { threshold: 0.25 });
  host.querySelectorAll<HTMLElement>(':scope > .scr').forEach((s) => io.observe(s));
} else if (host) {
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

