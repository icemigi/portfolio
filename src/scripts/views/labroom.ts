// Salle du Lab (LabRoom.astro) : apparition de la pièce et de sa barre ; commandes du type modulaire et du testeur de fonte.
import { onPage } from '../page';
import { reduced } from '../motion';

onPage('.room', () => {
  // apparition : la pièce se montre en fondu (et se pose, de 2 %), la barre glisse en place juste après
  if (!reduced()) {
    const room = document.querySelector<HTMLElement>('.room'), bar = document.querySelector<HTMLElement>('.kk-bar');
    room?.animate([{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' });
    bar?.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 260, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' });
  }
  // type modulaire : enregistrer, et nom de la famille de modules affiché au clic
  const tc = document.querySelector<HTMLCanvasElement>('canvas.type-canvas[data-edit]');
  document.querySelector('[data-tsave]')?.addEventListener('click', () => tc?.dispatchEvent(new CustomEvent('type:save')));
  document.querySelector('[data-tsvg]')?.addEventListener('click', () => tc?.dispatchEvent(new CustomEvent('type:svg')));
  const wv = document.querySelector<HTMLButtonElement>('[data-twave]');
  wv?.addEventListener('click', () => tc?.dispatchEvent(new CustomEvent('type:wave')));
  tc?.addEventListener('type:wavestate', (e) => wv?.setAttribute('aria-pressed', String((e as CustomEvent).detail.on)));
  // fonte : bascule plein / contour
  const fs = document.querySelector<HTMLButtonElement>('[data-fstyle]'), tester = document.querySelector<HTMLElement>('[data-tester]');
  fs?.addEventListener('click', () => { const on = !!tester?.classList.toggle('ol'); fs.setAttribute('aria-pressed', String(on)); });
  tc?.addEventListener('type:family', (e) => { const f = document.querySelector('[data-fam]'); if (f) f.textContent = '· ' + (e as CustomEvent).detail.name; });
});
