// Carrousels de kern.outdoor : chacun est feuilleté comme par quelqu'un, à son propre rythme, jamais en cadence (voir les
// commentaires de KernOutdoor.astro). start() : ils démarrent (décalés) ; stop() : ils s'arrêtent. Un clic fait avancer.
export function initCarousels(els: HTMLElement[], still: boolean) {
  const cars = els.map((el, k) => ({
    el, k, track: el.querySelector<HTMLElement>('.track')!, n: el.querySelectorAll('.track img').length, at: 0, timer: 0, anim: null as Animation | null,
  }));
  type Car = typeof cars[number];
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  let lastSwipe = 0;
  const X = (i: number) => `translate3d(${-i * 100}%, 0, 0)`;
  const go = (c: Car, to: number) => {
    const from = c.at, back = to < from;
    c.at = to;
    const nx = c.track.querySelectorAll<HTMLImageElement>('img')[to + 1]; if (nx) nx.loading = 'eager'; // la slide d'après se charge d'avance
    c.anim?.cancel();
    c.track.style.transform = X(to);
    if (still) return;
    const drag = back ? 0 : rnd(1.5, 5); // le doigt tire un peu avant de lâcher (en %)
    const hold = back ? 0 : rnd(0.12, 0.26);
    c.anim = c.track.animate([
      { transform: X(from), easing: 'cubic-bezier(.3, 0, .6, 1)' },
      ...(hold ? [{ transform: `translate3d(${-from * 100 - drag}%, 0, 0)`, offset: hold, easing: `cubic-bezier(.2, .85, .25, ${rnd(1, 1.09).toFixed(3)})` }] : []),
      { transform: X(to) },
    ], { duration: back ? rnd(620, 780) : rnd(330, 500), easing: back ? 'cubic-bezier(.65, 0, .2, 1)' : 'linear' });
  };
  const wait = (c: Car) => {
    if (c.at === c.n - 1) return rnd(1500, 2500);           // dernière slide : un temps avant de revenir au début
    const r = Math.random();
    return r < 0.28 ? rnd(420, 750) : r < 0.38 ? rnd(2800, 3800) : rnd(1000, 2200);
  };
  const plan = (c: Car, delay: number) => {
    clearTimeout(c.timer);
    if (still) return;
    c.timer = window.setTimeout(() => {
      const now = performance.now();
      if (now - lastSwipe < 280) { plan(c, rnd(260, 520)); return; } // un autre vient de bouger : on laisse respirer
      lastSwipe = now;
      go(c, (c.at + 1) % c.n);
      plan(c, wait(c));
    }, delay);
  };
  cars.forEach((c) => c.el.querySelector('.vp')!.addEventListener('click', () => { lastSwipe = performance.now(); go(c, (c.at + 1) % c.n); plan(c, rnd(2500, 3500)); }));
  const start = () => cars.forEach((c) => plan(c, rnd(250, 1500)));
  const stop = () => cars.forEach((c) => clearTimeout(c.timer));
  return { start, stop };
}
