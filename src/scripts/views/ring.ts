// Anneau d'images de l'accueil (Ring.astro). Un cercle de rayon R, centré sur le texte des services, tourne sur lui-même ;
// son plan est incliné (lacet YAW, tangage PITCH) et vu en perspective : chaque image reste face à nous, à l'échelle de sa
// profondeur, et passe devant le texte quand elle est du côté du spectateur (z-index 2 à 42, rangées par profondeur : la plus
// proche dessus), derrière sinon (z-index 0 ; un z-index négatif la ferait passer sous le fond de l'écran).
// La souris incline l'anneau vers elle ; on le saisit pour le lancer, puis il revient à son allure (un tour en 30 s).
// À chaque arrivée sur l'écran, l'anneau entre presque de profil, se redresse en tournant vite puis ralentit, et se déploie
// jusqu'à son rayon (léger dépassement) ; chaque image se découvre de bas en haut sous un masque, son contenu se resserrant.
// La boucle ne tourne que quand l'écran est à l'écran.
import { onPage } from '../page';
import { reduced } from '../motion';

const TURN = (2 * Math.PI) / 30000;   // allure de croisière (rad/ms)
const YAW = -0.62, PITCH = 0.2;       // inclinaison de repos (rad)
const TILT_X = 0.22, TILT_Y = 0.14;   // amplitude de l'inclinaison vers le curseur (rad)
const INTRO = 1800;                   // entrée de l'anneau (ms)
const SPIN = 1.6 * Math.PI;           // tour d'élan de l'entrée (rad), freiné jusqu'à l'arrêt
const EDGE_YAW = -1.45, EDGE_PITCH = 0.75; // presque de profil au départ (rad)
const MASK = 900, STAGGER = 70, LAG = 250; // masque des images : durée, écart, départ après l'anneau (ms)
const clamp = (e: number) => Math.max(0, Math.min(1, e));
const expo = (e: number) => (e >= 1 ? 1 : 1 - 2 ** (-10 * e));
const back = (e: number) => 1 + 2.2 * (e - 1) ** 3 + 1.2 * (e - 1) ** 2; // sortie avec léger dépassement
const quart = (e: number) => 1 - (1 - e) ** 4;

onPage('[data-ring]', (ctx) => {
  if (reduced() || matchMedia('(max-width: 760px)').matches) return;
  const ring = document.querySelector<HTMLElement>('[data-ring]')!;
  const scr = ring.closest<HTMLElement>('.scr')!, text = scr.querySelector<HTMLElement>('.bt')!;
  const cards = [...ring.querySelectorAll<HTMLElement>('.rc')], N = cards.length;
  const layer = new Int8Array(N).fill(-1); // z-index posé (évite de réécrire le style à chaque image)
  const pics = cards.map((c) => c.querySelector('img'));

  // géométrie : centre et rayon d'après le texte, largeur des images d'après le rayon, recul de la caméra
  let cx = 0, cy = 0, R = 0, w = 0, P = 0;
  const measure = () => {
    const b = ring.getBoundingClientRect(), t = text.getBoundingClientRect();
    cx = t.left - b.left + t.width / 2; cy = t.top - b.top + t.height / 2;
    R = Math.min(t.width * 0.45, b.height * 0.32); w = R * 0.5; P = R * 3.2;
    ring.style.setProperty('--rw', `${w}px`);
  };
  measure();
  ctx.observe(new ResizeObserver(measure)).observe(scr);

  let phi = 0, vel = TURN, yaw = YAW, pitch = PITCH, yawT = YAW, pitchT = PITCH;
  // souris : l'anneau penche vers elle
  scr.addEventListener('pointermove', (e) => {
    const b = ring.getBoundingClientRect();
    yawT = YAW + ((e.clientX - b.left - cx) / (b.width / 2)) * TILT_X;
    pitchT = PITCH - ((e.clientY - b.top - cy) / (b.height / 2)) * TILT_Y;
  }, { signal: ctx.signal });
  scr.addEventListener('pointerleave', () => { yawT = YAW; pitchT = PITCH; }, { signal: ctx.signal });

  // glisser : l'anneau suit l'angle du pointeur autour du centre ; au lâcher, il garde son élan puis revient à son allure
  let drag: { id: number; a: number; t: number } | null = null;
  const angle = (e: PointerEvent) => { const b = ring.getBoundingClientRect(); return Math.atan2(e.clientY - b.top - cy, e.clientX - b.left - cx); };
  for (const c of cards) {
    c.addEventListener('pointerdown', (e) => {
      drag = { id: e.pointerId, a: angle(e), t: e.timeStamp };
      c.setPointerCapture(e.pointerId); ring.classList.add('grab');
    }, { signal: ctx.signal });
    c.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const a = angle(e), da = Math.atan2(Math.sin(a - drag.a), Math.cos(a - drag.a)), dt = Math.max(1, e.timeStamp - drag.t);
      phi += da; vel = vel * 0.6 + (da / dt) * 0.4;
      drag.a = a; drag.t = e.timeStamp;
    }, { signal: ctx.signal });
    const release = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null; ring.classList.remove('grab');
      vel = Math.max(-0.006, Math.min(0.006, vel));
    };
    c.addEventListener('pointerup', release, { signal: ctx.signal });
    c.addEventListener('pointercancel', release, { signal: ctx.signal });
  }

  const shown = () => { const r = scr.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  let on = false, t0 = 0, last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(50, now - last); last = now;
    const v = shown();
    if (v && !on) t0 = now; // arrivée sur l'écran : nouvelle entrée
    on = v;
    if (v) {
      if (!drag) { vel += (TURN - vel) * (1 - Math.exp(-dt / 900)); phi += vel * dt; }
      const k = 1 - Math.exp(-dt / 250);
      yaw += (yawT - yaw) * k; pitch += (pitchT - pitch) * k;
      // entrée : élan de rotation freiné, redressement depuis le profil, rayon qui se déploie
      const g = clamp((now - t0) / INTRO), G = expo(g);
      const spin = -(1 - G) * SPIN, r = R * (0.15 + 0.85 * back(g));
      const yw = EDGE_YAW + (yaw - EDGE_YAW) * G, pt = EDGE_PITCH + (pitch - EDGE_PITCH) * G;
      const sy = Math.sin(yw), cyw = Math.cos(yw), sp = Math.sin(pt), cp = Math.cos(pt);
      for (let i = 0; i < N; i++) {
        const th = phi + spin + (2 * Math.PI * i) / N, x0 = r * Math.cos(th), y0 = r * Math.sin(th);
        const y1 = y0 * cp, z1 = y0 * sp;                       // tangage (axe horizontal)
        const x2 = x0 * cyw + z1 * sy, z2 = -x0 * sy + z1 * cyw; // lacet (axe vertical) ; z > 0 : vers le spectateur
        const s = P / (P - z2);
        // masque : l'image se découvre de bas en haut, grandit un peu, son contenu se resserre
        const e = clamp((now - t0 - LAG - i * STAGGER) / MASK), f = quart(e);
        const el = cards[i];
        el.style.transform = `translate3d(${(cx + x2 * s - w / 2).toFixed(1)}px, ${(cy + y1 * s - w / 3.2).toFixed(1)}px, 0) scale(${(s * (0.8 + 0.2 * f)).toFixed(3)})`;
        el.style.opacity = String(clamp(e * 4));
        el.style.clipPath = e < 1 ? `inset(${((1 - f) * 100).toFixed(2)}% 0 0 0)` : '';
        const pic = pics[i];
        if (pic) pic.style.scale = e < 1 ? (1.2 - 0.2 * f).toFixed(3) : '';
        const z = z2 > 0 ? 2 + Math.round((z2 / R) * 40) : 0;
        if (layer[i] !== z) { layer[i] = z; el.style.zIndex = String(z); }
      }
    }
    ctx.raf(frame);
  };
  ctx.raf(frame);
});
