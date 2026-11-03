// Défilement fluide avec inertie (souris et pavé tactile ; le tactile garde le défilement natif).
// Utilisé par les études (story.ts) et les pages en défilement libre (flow.ts).
export function smooth(still: boolean) {
  if (still || !matchMedia('(pointer: fine)').matches) return;
  let target = scrollY, cur = scrollY, run = 0;
  const max = () => document.documentElement.scrollHeight - innerHeight;
  const loop = () => {
    cur += (target - cur) * 0.1;
    if (Math.abs(target - cur) < 0.5) { cur = target; run = 0; } else run = requestAnimationFrame(loop);
    scrollTo(0, cur);
  };
  addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.defaultPrevented) return;
    e.preventDefault();
    target = Math.min(max(), Math.max(0, target + e.deltaY * (e.deltaMode === 1 ? 16 : 1)));
    if (!run) run = requestAnimationFrame(loop);
  }, { passive: false });
  // clavier, barre de défilement, ancres : on repart de la position réelle
  addEventListener('scroll', () => { if (!run && Math.abs(scrollY - cur) > 2) target = cur = scrollY; }, { passive: true });
}

