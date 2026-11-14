// Chargement des médias en ASCII (07/11). Une image pas encore chargée montre une trame de caractères mono ;
// quand elle arrive, elle passe par deux rendus ASCII de plus en plus fins (caractères colorés d'après l'image),
// puis l'image réelle. Tout se fait dans la balise <img> elle-même (changement de src) : la mise en page, les
// vignettes, la parallaxe et les écrans ne voient aucune différence. Sans JavaScript : images normales.
import { reduced } from './motion';
import type { Ctx } from './page';

const RAMP = ' .,:;-=+*%#@';
const FONT = '"Geist Mono", ui-monospace, monospace';

// trame d'attente : des caractères gris clair, la même pour toutes les images (SVG léger, sans réseau)
function noise(w: number, h: number) {
  const cols = 28, rows = Math.max(6, Math.round((cols * h) / w / 1.9));
  const cw = w / cols, ch = h / rows;
  let txt = '';
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const c = RAMP[1 + ((x * 7 + y * 13 + ((x * y) % 5)) % (RAMP.length - 1))];
    txt += `<text x="${(x * cw).toFixed(1)}" y="${((y + 0.8) * ch).toFixed(1)}">${c === '%' ? '%25' : c === '#' ? '%23' : c}</text>`;
  }
  return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="monospace" font-size="${(ch * 0.9).toFixed(1)}" fill="%23b9b7b0">${txt}</svg>`;
}

// rendu ASCII de l'image chargée : chaque cellule = un caractère (densité selon la luminosité, couleur de l'image)
function render(img: HTMLImageElement, cols: number, W: number, H: number) {
  const rows = Math.max(4, Math.round((cols * H) / W / 1.9));
  const s = document.createElement('canvas');
  s.width = cols; s.height = rows;
  const sx = s.getContext('2d', { willReadFrequently: true })!;
  sx.drawImage(img, 0, 0, cols, rows);
  const px = sx.getImageData(0, 0, cols, rows).data;
  const c = document.createElement('canvas');
  const k = Math.min(1, 900 / W);
  c.width = Math.round(W * k); c.height = Math.round(H * k);
  const x = c.getContext('2d')!;
  const cw = c.width / cols, ch = c.height / rows;
  x.font = `${(ch * 1.05).toFixed(1)}px ${FONT}`;
  x.textBaseline = 'top';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const o = (j * cols + i) * 4, a = px[o + 3] / 255;
    if (a < 0.1) continue;
    const l = (0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2]) / 255;
    const ch2 = RAMP[Math.min(RAMP.length - 1, Math.round((1 - l) * (RAMP.length - 1)))];
    if (ch2 === ' ') continue;
    x.fillStyle = `rgba(${px[o]},${px[o + 1]},${px[o + 2]},${a})`;
    x.fillText(ch2, i * cw, j * ch);
  }
  return c.toDataURL('image/png');
}

// image avec srcset : le changement de src n'aurait aucun effet (srcset l'emporte). On choisit nous-mêmes la
// version adaptée à la largeur affichée, puis on retire srcset pour que la trame et les rendus ASCII s'affichent.
function pick(im: HTMLImageElement) {
  const ss = im.getAttribute('srcset');
  if (!ss) return im.currentSrc || im.src;
  const need = (im.getBoundingClientRect().width || Number(im.getAttribute('width')) || 0) * (devicePixelRatio || 1);
  const c = ss.split(',').map((x) => { const [u, w] = x.trim().split(/\s+/); return { u, w: parseInt(w, 10) || 0 }; }).sort((a, b) => a.w - b.w);
  const best = c.find((x) => x.w >= need) || c[c.length - 1];
  im.removeAttribute('srcset'); im.removeAttribute('sizes');
  return best ? new URL(best.u, location.href).href : im.src;
}

export function initAscii(ctx: Ctx, root: ParentNode = document) {
  if (reduced()) return;
  const imgs = [...root.querySelectorAll<HTMLImageElement>('main img, .screens-host img')].filter((im) =>
    !im.complete && !im.closest('[data-no-ascii], .site-header, .lg, .logo, svg') && !/\.svg($|\?)/.test(im.src)
    && Number(im.getAttribute('width') || 0) >= 160,
  );
  if (!imgs.length) return;
  // téléphone : pas de rendus ASCII (deux toiles par image, coûteux sur un petit processeur) ; un simple fondu à l'arrivée
  if (matchMedia('(max-width: 760px)').matches) {
    imgs.forEach((im) => {
      im.style.opacity = '0';
      im.style.transition = 'opacity .5s var(--out, ease-out)';
      const show = () => { im.style.opacity = ''; };
      im.addEventListener('load', show, { once: true });
      im.addEventListener('error', show, { once: true });
      if (im.complete) show();
    });
    return;
  }
  const io = ctx.observe(new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    load(e.target as HTMLImageElement);
  }), { rootMargin: '60% 0px' }));
  imgs.forEach((im) => {
    const real = pick(im);
    const W = Number(im.getAttribute('width')), H = Number(im.getAttribute('height')) || W;
    im.dataset.real = real;
    im.removeAttribute('loading');
    im.src = noise(W, H);
    io.observe(im);
  });
  function load(im: HTMLImageElement) {
    const real = im.dataset.real!;
    const W = Number(im.getAttribute('width')), H = Number(im.getAttribute('height')) || W;
    const pre = new Image();
    pre.decoding = 'async';
    pre.onload = () => {
      try {
        const a = render(pre, 34, W, H), b = render(pre, 86, W, H);
        im.src = a;
        ctx.timeout(() => { im.src = b; }, 160);
        ctx.timeout(() => { im.src = real; }, 360);
      } catch { im.src = real; } // image d'un autre domaine : pas de lecture des pixels
    };
    pre.onerror = () => { im.src = real; };
    pre.src = real;
  }
}
