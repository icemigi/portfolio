// Étude kern.outdoor (KernOutdoor.astro) : les carrousels feuilletés (la charte : écran Palette, views/case.ts).
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

  // ---- les formats : chaque carrousel est feuilleté comme par quelqu'un, à son propre rythme — jamais en cadence.
  // Attente tirée au hasard (souvent 1 à 2,2 s ; parfois une lecture de 3 s ; souvent deux slides enchaînées),
  // geste de doigt (un petit tiré, puis le lâcher, vitesse et dépassement différents à chaque fois), et jamais deux
  // carrousels à moins de 0,28 s l'un de l'autre. Fin du carrousel : un temps, puis retour au début d'un long glissé.
  // Un clic fait avancer à la main (et laisse un temps de lecture avant de repartir).
  const cars = initCarousels([...document.querySelectorAll<HTMLElement>('[data-car]')], still);
  watch(scr('serie'), cars.start, cars.stop);
  ctx.cleanup(cars.stop);
});
