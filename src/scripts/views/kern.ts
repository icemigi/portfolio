// Étude kern.outdoor (KernOutdoor.astro) : la charte et les carrousels feuilletés.
// Chaque pièce ne bouge que tant que son écran est à l'écran ; tout s'arrête au départ de la page.
import { onPage } from '../page';
import { reduced } from '../motion';
import { initCarousels } from '../kern-carousel';

onPage('[data-car]', (ctx) => {
  const host = document.querySelector<HTMLElement>('[data-screens]');
  if (!host) return;
  const scr = (k: string) => document.querySelector<HTMLElement>(`.scr[data-k="${k}"]`);
  const still = reduced();
  // chaque pièce ne bouge que tant que son écran est à l'écran (au moins à moitié)
  const watch = (el: HTMLElement | null, on: () => void, off: () => void) => {
    if (!el) return;
    ctx.observe(new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off()), { root: host, threshold: 0.5 })).observe(el);
  };

  // ---- la charte : les quatre couleurs montent de bas en haut, l'une après l'autre ; les typos s'écrivent ensuite, de gauche à droite
  const sws = [...document.querySelectorAll<HTMLElement>('[data-k="charte"] .sw')], fonts = [...document.querySelectorAll<HTMLElement>('[data-k="charte"] .fonts img')];
  watch(scr('charte'), () => {
    if (still) return;
    sws.forEach((s, i) => s.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 560, delay: 60 + i * 80, easing: 'cubic-bezier(.8, 0, .1, 1)', fill: 'backwards' }));
    fonts.forEach((f, i) => f.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 520, delay: 420 + i * 120, easing: 'cubic-bezier(.8, 0, .1, 1)', fill: 'backwards' }));
  }, () => {});

  // ---- les formats : chaque carrousel est feuilleté comme par quelqu'un, à son propre rythme — jamais en cadence.
  // Attente tirée au hasard (souvent 1 à 2,2 s ; parfois une lecture de 3 s ; souvent deux slides enchaînées),
  // geste de doigt (un petit tiré, puis le lâcher, vitesse et dépassement différents à chaque fois), et jamais deux
  // carrousels à moins de 0,28 s l'un de l'autre. Fin du carrousel : un temps, puis retour au début d'un long glissé.
  // Un clic fait avancer à la main (et laisse un temps de lecture avant de repartir).
  const cars = initCarousels([...document.querySelectorAll<HTMLElement>('[data-car]')], still);
  watch(scr('serie'), cars.start, cars.stop);
  ctx.cleanup(cars.stop);
});
