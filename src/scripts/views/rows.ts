// Liste des projets (ProjectRows.astro) : l'aperçu suit le curseur avec un léger retard (une seule boucle, arrêtée dès qu'il est posé).
import { onPage } from '../page';

onPage('[data-rows]', (ctx) => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-rows]').forEach((list) => {
    const pvs = [...list.querySelectorAll<HTMLElement>('.pv')];
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, first = true;
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      pvs.forEach((p) => (p.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${((tx - x) * 0.04).toFixed(2)}deg)`));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? ctx.raf(loop) : 0;
    };
    list.addEventListener('pointermove', (e) => {
      const r = list.getBoundingClientRect();
      tx = e.clientX - r.left + 24; ty = e.clientY - r.top - 84;
      if (first) { x = tx; y = ty; first = false; }
      if (!raf) raf = ctx.raf(loop);
    });
    list.addEventListener('pointerleave', () => { first = true; });
  });
});
