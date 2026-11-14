// Étude kern.outdoor (KernOutdoor.astro) : le showreel des logos, la charte, les carrousels feuilletés, la suite cochée.
// Chaque pièce ne bouge que tant que son écran est à l'écran ; tout s'arrête au départ de la page.
import { onPage } from '../page';
import { reduced } from '../motion';
import { buildReel } from '../kern-reel';
import { initCarousels } from '../kern-carousel';

onPage('[data-reel]', (ctx) => {
  const host = document.querySelector<HTMLElement>('[data-screens]');
  const scr = (k: string) => document.querySelector<HTMLElement>(`.scr[data-k="${k}"]`);
  if (host) {
    const still = reduced();
    // chaque pièce ne bouge que tant que son écran est à l'écran (au moins à moitié)
    const watch = (el: HTMLElement | null, on: () => void, off: () => void) => {
      if (!el) return;
      ctx.observe(new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off()), { root: host, threshold: 0.5 })).observe(el);
    };

    // ---- le nom : le showreel des logos, un plan court en boucle (~5,4 s), rapide et
    // sobre (courbes expo, masques, coupes franches) : recul sur la montagne → elle devient la tête du bonhomme, le corps se
    // découvre (fond orange) → il se pose sur les lettres qui montent : le cairn (fond olive) → le cairn est poussé hors du cadre,
    // le lettrage se peint (fond citron) → plongée dans le lettrage jusqu'au noir → coupe sur la montagne.
    // Transitions : double volet (un liseré d'une autre couleur de la charte, puis le fond), le logo monte avec lui et se
    // transforme quand le volet passe le centre. Le ® ne voyage pas : il se retire au masque, puis revient net une fois le logo posé.
    // Masques : des <clipPath> SVG (rectangles animés), et non clip-path CSS, que Firefox applique mal aux tracés.
    const reel = document.querySelector<HTMLElement>('[data-reel]');
    const tl = reel ? buildReel(reel, still) : null;
    ctx.cleanup(() => tl?.kill());
    watch(scr('nom'), () => {
      if (still) return;
      tl?.restart();
    }, () => tl?.pause());

    // ---- la charte : les quatre couleurs montent de bas en haut, l'une après l'autre ; les typos s'écrivent ensuite, de gauche à droite
    const sws = [...document.querySelectorAll<HTMLElement>('.charte .sw')], fonts = [...document.querySelectorAll<HTMLElement>('.charte .fonts img')];
    watch(scr('charte'), () => {
      if (still) return;
      sws.forEach((s, i) => s.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 560, delay: 60 + i * 80, easing: 'cubic-bezier(.8, 0, .1, 1)', fill: 'backwards' }));
      fonts.forEach((f, i) => f.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 520, delay: 420 + i * 120, easing: 'cubic-bezier(.8, 0, .1, 1)', fill: 'backwards' }));
    }, () => {});

    // ---- la série : chaque carrousel est feuilleté comme par quelqu'un, à son propre rythme — jamais en cadence.
    // Attente tirée au hasard (souvent 1 à 2,2 s ; parfois une lecture de 3 s ; souvent deux slides enchaînées),
    // geste de doigt (un petit tiré, puis le lâcher, vitesse et dépassement différents à chaque fois), et jamais deux
    // carrousels à moins de 0,28 s l'un de l'autre. Fin du carrousel : un temps, puis retour au début d'un long glissé.
    // Un clic fait avancer à la main (et laisse un temps de lecture avant de repartir).
    const cars = initCarousels([...document.querySelectorAll<HTMLElement>('[data-car]')], still);
    watch(scr('serie'), cars.start, cars.stop);
    ctx.cleanup(cars.stop);

    // ---- la suite : les 58 cases se cochent une à une (environ 1,4 s), en repartant de zéro à chaque arrivée
    const paths = [...document.querySelectorAll<SVGPathElement>('[data-ticks] path')];
    let anims: Animation[] = [];
    watch(scr('suite'), () => {
      anims.forEach((a) => a.cancel());
      if (still) { paths.forEach((p) => (p.style.strokeDashoffset = '0')); return; }
      anims = paths.map((p, i) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 150, delay: 250 + i * 20, easing: 'cubic-bezier(.3, 0, .2, 1)', fill: 'forwards' }));
    }, () => {});
    ctx.cleanup(() => anims.forEach((a) => a.cancel()));
  }
});
