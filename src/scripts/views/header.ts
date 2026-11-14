// Menu fixe (Header.astro). Téléphone : « (menu) » ouvre un plein écran (rubriques en grand) ; Échap ou un lien le referme.
import { onPage } from '../page';

onPage('[data-burger]', ({ signal }) => {
  const b = document.querySelector<HTMLButtonElement>('[data-burger]')!;
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const set = (o: boolean) => {
    document.documentElement.classList.toggle('menu-open', o);
    b.setAttribute('aria-expanded', String(o)); (b.querySelector('.bl') || b).textContent = o ? b.dataset.close! : b.dataset.open!; b.classList.toggle('bx', o);
    dispatchEvent(new CustomEvent('kk:sound', { detail: o ? 'pick' : 'drop' }));
    if (o) nav.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  };
  b.addEventListener('click', () => set(b.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { set(false); b.focus(); } }, { signal });
  matchMedia('(min-width: 761px)').addEventListener('change', (m) => { if (m.matches) set(false); }, { signal });
});
// le menu se referme à chaque changement de page
document.addEventListener('astro:before-swap', () => document.documentElement.classList.remove('menu-open'));
