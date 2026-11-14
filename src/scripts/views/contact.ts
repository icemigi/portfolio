// Écran « Contact » (ContactScreen.astro) : l'adresse à toute largeur, et le cachet de cire qui scelle le message au clic.
import { onPage } from '../page';
import { reduced } from '../motion';

onPage('.last .mail', (ctx) => {
  // L'adresse remplit exactement la largeur des colonnes.
  const fit = () => document.querySelectorAll<HTMLElement>('[data-fit]').forEach((a) => {
    const W = a.parentElement!.clientWidth;
    a.style.fontSize = '100px';
    const w = a.getBoundingClientRect().width;
    a.style.fontSize = `${Math.floor(((100 * W) / w) * 100) / 100}px`;
  });
  // posée au montage (avant le premier affichage en navigation), refaite à l'arrivée des polices et au redimensionnement
  fit();
  if (document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (!ctx.signal.aborted) fit(); });
  addEventListener('resize', fit, { signal: ctx.signal });

  // Message scellé : au clic sur l'adresse, le cachet de cire se décolle de sa place, monte en arc vers le visiteur (il grandit,
  // son ombre s'étale), retombe en accélérant sur l'adresse et s'y pose : la cire s'écrase un instant, sans rebond.
  // L'adresse encaisse le choc, puis la messagerie s'ouvre.
  // « Réduire les animations » : ouverture directe.
  document.querySelectorAll<HTMLAnchorElement>('.last .mail').forEach((a) => a.addEventListener('click', (e) => {
    const seal = a.closest('.last')?.querySelector<HTMLImageElement>('.seal');
    if (!seal || reduced() || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const s = seal.getBoundingClientRect(), m = a.getBoundingClientRect();
    const size = Math.min(m.height * 1.5, s.width);
    const ex = Math.min(Math.max(e.clientX, m.left + size / 2), m.right - size / 2), ey = m.top + m.height / 2;   // là où l'on a cliqué
    const sx = s.left + s.width / 2, sy = s.top + s.height / 2, k0 = s.width / size;
    const cx = (sx + ex) / 2, cy = Math.min(sy, ey) - Math.max(120, Math.abs(ex - sx) * .35);             // sommet de l'arc
    const c = seal.cloneNode() as HTMLImageElement;
    c.removeAttribute('loading'); c.removeAttribute('srcset');
    c.style.cssText = `position:fixed;left:0;top:0;width:${size}px;height:auto;z-index:80;pointer-events:none;will-change:transform,filter`;
    document.body.appendChild(ctx.own(c));
    seal.style.opacity = '0';
    const FLY = 560, t0 = performance.now(), night = document.documentElement.dataset.theme === 'nuit';
    let hit = false;
    const smooth = (u: number) => u * u * (3 - 2 * u);
    const frame = (now: number) => {
      const t = now - t0;
      let x, y, sc, rot, sqx = 1, sqy = 1, lift;
      if (t < FLY) {
        // vol : montée douce, puis chute qui accélère vers l'adresse
        const u = t / FLY, v = u < .45 ? smooth(u / .45) * .45 : .45 + (u - .45) ** 1.6 / (.55 ** 1.6) * .55;
        const w = 1 - v;
        x = w * w * sx + 2 * w * v * cx + v * v * ex; y = w * w * sy + 2 * w * v * cy + v * v * ey;
        lift = Math.sin(Math.PI * Math.min(1, v * 1.05));                       // hauteur au-dessus de la page (0 → 1 → 0)
        sc = (k0 + (1 - k0) * smooth(Math.min(1, u * 1.6))) * (1 + .38 * lift);
        rot = -16 * Math.sin(Math.PI * u) - 6 * u + 4 * Math.sin(u * 9) * (1 - u) * .4;   // il tourne en volant, un peu de flottement
        sqy = 1 + .06 * Math.max(0, u - .7) / .3; sqx = 1 / sqy;                       // s'étire en tombant
      } else {
        if (!hit) {                                                                     // le choc
          hit = true;
          dispatchEvent(new CustomEvent('kk:sound', { detail: 'drop' }));
          a.animate([{ transform: 'none' }, { transform: 'translateY(2px) scaleY(.985)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' });
          ctx.timeout(() => { location.href = a.href; }, 220);
        }
        // il se pose : bref écrasement de la cire, qui se résorbe sans rebond
        const d = (t - FLY) / 1000, k = Math.exp(-d * 14);
        x = ex; y = ey; lift = 0; sc = 1;
        sqx = 1 + .12 * k; sqy = 1 / sqx; rot = -6;
      }
      c.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px) rotate(${rot}deg) scale(${sc * sqx}, ${sc * sqy})`;
      c.style.filter = `${night ? 'brightness(.62) saturate(.82) sepia(.1) ' : ''}drop-shadow(${4 + 10 * lift}px ${6 + 26 * lift}px ${6 + 22 * lift}px rgba(0,0,0,${(night ? .5 : .28) - .12 * lift}))`;
      if (t < FLY + 900) ctx.raf(frame);
    };
    ctx.raf(frame);
    ctx.timeout(() => {                                                                  // l'empreinte s'efface, le cachet revient
      c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: 'forwards' }).finished.then(() => c.remove());
      seal.style.opacity = '';
      seal.animate([{ opacity: 0, transform: 'translateY(-10px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }, 1900);
  }));
});
