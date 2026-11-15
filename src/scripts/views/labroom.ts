// Salle du Lab (LabRoom.astro) : apparition de la pièce et de sa barre ; commandes du testeur de fonte.
import { onPage } from '../page';
import { reduced } from '../motion';

onPage('.room', () => {
  // apparition : la pièce se montre en fondu (et se pose, de 2 %), la barre glisse en place juste après
  if (!reduced()) {
    const room = document.querySelector<HTMLElement>('.room'), bar = document.querySelector<HTMLElement>('.kk-bar');
    room?.animate([{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' });
    bar?.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 260, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' });
  }
  // fonte : bascule plein / contour
  const fs = document.querySelector<HTMLButtonElement>('[data-fstyle]'), tester = document.querySelector<HTMLElement>('[data-tester]');
  fs?.addEventListener('click', () => { const on = !!tester?.classList.toggle('ol'); fs.setAttribute('aria-pressed', String(on)); });
});
