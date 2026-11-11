// Mode nuit : le bout du doigt du gantelet s'enflamme. Feu de particules (canvas 2D, mélange additif) : chaque particule naît
// au bout du doigt, monte (poussée), s'élargit puis se résorbe en passant du blanc-jaune à l'orange, au rouge, puis à rien ;
// quelques braises s'échappent. Les flammes gardent l'élan du doigt : elles traînent derrière lui quand on bouge.
// La lueur éclaire la page autour du doigt ; le portrait 3D prend la flamme comme source de lumière.
// Souris seulement ; « Réduire les animations » : petite flamme fixe, sans particules.
import { reduced } from './motion';

export const FLAME = { x: 3, y: -14 }; // centre lumineux de la flamme par rapport à la pointe du curseur (px)
const TIP = { x: 3, y: 4 };             // bout du doigt du gantelet (point chaud du curseur + 1 px)

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; ember: boolean };

export function initTorch() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const root = document.documentElement, still = reduced();
  let cv: HTMLCanvasElement | null = null, ctx: CanvasRenderingContext2D | null = null, glow: HTMLElement | null = null;
  let raf = 0, mx = -500, my = -500, pmx = mx, pmy = my, inside = true, last = 0;
  const ps: P[] = [];
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; mx = e.clientX; my = e.clientY; inside = true; kick(); }, { passive: true });
  root.addEventListener('pointerleave', () => { inside = false; });
  root.addEventListener('pointerenter', () => { inside = true; kick(); });

  const resize = () => { if (!cv) return; cv.width = innerWidth; cv.height = innerHeight; };
  // couleur selon l'âge : blanc-jaune → orange → rouge → transparent
  const color = (a: number, k: number) => {
    const r = 255, g = Math.round(235 - 175 * Math.min(1, a * 1.5)), b = Math.round(170 * Math.max(0, 1 - a * 3));
    return `rgba(${r},${g},${b},${k})`;
  };
  const frame = (now: number) => {
    raf = 0;
    if (!cv || !ctx || !glow) return;
    const dt = Math.min(48, now - (last || now)) / 16.7; last = now;
    const tx = mx + TIP.x, ty = my + TIP.y, vx = mx - pmx, vy = my - pmy; pmx = mx; pmy = my;
    // naissances : flux continu, réparti tout le long du trajet du doigt depuis l'image précédente (traînée sans trous)
    if (inside && !still) {
      const sp = Math.hypot(vx, vy), n = Math.round((7 + Math.min(14, sp * .5)) * dt);
      for (let i = 0; i < n; i++) {
        const f = Math.random(), ember = Math.random() < .018;
        ps.push({ x: tx - vx * f + (Math.random() - .5) * 7, y: ty - vy * f + (Math.random() - .5) * 3,
          vx: (Math.random() - .5) * .7 + vx * .06, vy: -1.3 - Math.random() * 1.5 + vy * .04,
          life: 0, max: ember ? 45 + Math.random() * 35 : 13 + Math.random() * 14, r: ember ? 1 + Math.random() : 5 + Math.random() * 4.5, ember });
      }
    }
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life += dt;
      const a = p.life / p.max;
      if (a >= 1) { ps.splice(i, 1); continue; }
      // poussée vers le haut, ondulation (la flamme lèche l'air), freinage
      p.vy -= .07 * dt; p.vx += (Math.sin((p.y * .11) + now * .013 + p.max) * .06 + (Math.random() - .5) * .05) * dt;
      p.vx *= .96; p.vy *= .985; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.ember) {
        ctx.fillStyle = `rgba(255,${180 - a * 120 | 0},60,${(1 - a) * .9})`;
        ctx.fillRect(p.x, p.y, p.r, p.r);
        continue;
      }
      const r = p.r * (1 - a * .82);                                     // large à la base, effilée en haut
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      const k = (1 - a) ** 1.4 * (a < .08 ? a / .08 : 1) * .5;
      g.addColorStop(0, color(a, k)); g.addColorStop(1, color(a, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
    }
    if (inside && !still) {                                                  // cœur : la mèche incandescente au bout du doigt
      const fl = .85 + Math.random() * .3, g = ctx.createRadialGradient(tx, ty - 4, 0, tx, ty - 4, 7 * fl);
      g.addColorStop(0, 'rgba(255,250,225,.75)'); g.addColorStop(.6, 'rgba(255,190,90,.28)'); g.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(tx, ty - 4, 4.5 * fl, 7 * fl, 0, 0, 6.283); ctx.fill();
    }
    if (still && inside) {                                                   // flamme fixe
      const g = ctx.createRadialGradient(tx, ty - 6, 0, tx, ty - 6, 9);
      g.addColorStop(0, 'rgba(255,240,190,.9)'); g.addColorStop(.5, 'rgba(255,150,40,.5)'); g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(tx, ty - 6, 6, 10, 0, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    // la lueur vacille avec la flamme (deux sinus lents + un frémissement) et suit le centre de la flamme, un peu au-dessus du doigt
    const k = still ? 1 : .86 + .08 * Math.sin(now / 170) + .05 * Math.sin(now / 67 + 1.7) + (Math.random() - .5) * .06;
    glow.style.setProperty('--k', k.toFixed(3));
    glow.style.setProperty('--tx', `${mx + FLAME.x + Math.sin(now / 230) * 1.5}px`); glow.style.setProperty('--ty', `${my + FLAME.y + Math.sin(now / 190) * 1.2}px`);
    glow.style.opacity = inside ? '' : '0';
    if (ps.length || inside) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && cv) { last = 0; raf = requestAnimationFrame(frame); } };
  const sync = () => {
    const on = root.dataset.theme === 'nuit';
    if (on && !cv) {
      glow = document.createElement('div'); glow.className = 'torch-glow'; glow.setAttribute('aria-hidden', 'true');
      cv = document.createElement('canvas'); cv.className = 'fire'; cv.setAttribute('aria-hidden', 'true');
      ctx = cv.getContext('2d');
      document.body.append(glow, cv); resize(); addEventListener('resize', resize); pmx = mx; pmy = my; kick();
    } else if (!on && cv) {
      cancelAnimationFrame(raf); raf = 0; cv.remove(); glow!.remove(); cv = glow = null; ctx = null; ps.length = 0;
      removeEventListener('resize', resize);
    }
  };
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  sync();
}
