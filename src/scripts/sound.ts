// Son (validé, palette v2) : synthétisé dans le navigateur, aucun fichier, très discret.
// Actif par défaut (il démarre au premier geste, règle des navigateurs) ; le bouton du menu le coupe (choix mémorisé). Coupé quand l'onglet est caché.
// Les autres scripts demandent un son par : dispatchEvent(new CustomEvent('kk:sound', { detail: 'pick' })).
let ctx: AudioContext | null = null, master: GainNode | null = null, NB: AudioBuffer | null = null;
let on = true; // actif par défaut ; « off » seulement si le visiteur l'a coupé
try { on = localStorage.getItem('kk-sound') !== 'off'; } catch { /* */ }

const init = () => {
  if (ctx) return;
  ctx = new AudioContext(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  NB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = NB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
};
const env = (g: GainNode, t: number, a: number, peak: number, r: number) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + r); };
const tone = (f: number, { type = 'sine' as OscillatorType, a = 0.002, r = 0.08, v = 0.05, to = 0, at = 0 } = {}) => {
  const c = ctx!, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + a + r);
  env(g, t, a, v, r); o.connect(g).connect(master!); o.start(t); o.stop(t + a + r + 0.05);
};
const noise = ({ f = 2000, q = 1, a = 0.005, r = 0.1, v = 0.05, to = 0, type = 'bandpass' as BiquadFilterType, at = 0 } = {}) => {
  const c = ctx!, t = c.currentTime + at, s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
  s.buffer = NB; bp.type = type; bp.Q.value = q; bp.frequency.setValueAtTime(f, t); if (to) bp.frequency.exponentialRampToValueAtTime(to, t + a + r);
  env(g, t, a, v, r); s.connect(bp).connect(g).connect(master!); s.start(t, Math.random()); s.stop(t + a + r + 0.05);
};

type Opt = { at?: number; span?: number };
const S: Record<string, (o: Opt) => void> = {
  hover: () => noise({ f: 5200, q: 6, r: 0.03, v: 0.03 }),
  click: () => { noise({ f: 1400, q: 3, a: 0.003, r: 0.03, v: 0.018 }); tone(140, { a: 0.003, r: 0.04, v: 0.022, to: 110 }); },
  slide: () => noise({ f: 700, to: 180, q: 0.6, a: 0.3, r: 0.4, v: 0.018, type: 'lowpass' }),
  // une frappe toutes les ~45 ms entre l'apparition de la première lettre et celle de la dernière
  letters: ({ at = 0, span = 0.4 }) => {
    const n = Math.max(3, Math.min(18, Math.round(span / 0.045)));
    for (let i = 0; i < n; i++) noise({ f: 3800 + Math.random() * 1500, q: 10, a: 0.002, r: 0.014, v: 0.016, at: at + (span * i) / n + Math.random() * 0.012 });
  },
  pick: () => tone(120, { a: 0.02, r: 0.14, v: 0.03, to: 160 }),
  drop: () => tone(120, { a: 0.003, r: 0.09, v: 0.035, to: 80 }),
  ring: () => tone(220, { a: 3.3, r: 0.2, v: 0.012, to: 330 }),
};
export const play = (name: string, o: Opt = {}) => { if (!on || !ctx || document.hidden) return; if (ctx.state === 'suspended') ctx.resume(); S[name]?.(o); };

// bouton du menu
const btn = document.querySelector<HTMLButtonElement>('[data-sound]');
// haut-parleur : avec ondes quand le son est actif, barré quand il est coupé ; le libellé reste lisible par les lecteurs d'écran
const ICON = (o: boolean) => `<svg viewBox="0 0 20 16" width="20" height="16" aria-hidden="true"><path d="M2 5.5h3.2L9.5 2v12L5.2 10.5H2Z" fill="currentColor"/>${o
  ? '<path d="M12.3 5.2a3.6 3.6 0 0 1 0 5.6M14.6 3a6.8 6.8 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
  : '<path d="m12.5 5.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'}</svg>`;
const label = () => { if (!btn) return; btn.setAttribute('aria-pressed', String(on)); btn.setAttribute('aria-label', on ? btn.dataset.on! : btn.dataset.off!); btn.title = btn.getAttribute('aria-label')!; btn.innerHTML = ICON(on); };
label();
btn?.addEventListener('click', () => {
  on = !on; try { localStorage.setItem('kk-sound', on ? 'on' : 'off'); } catch { /* */ }
  label(); if (on) { init(); play('click'); }
});
// son déjà activé lors d'une visite précédente : le navigateur exige un geste avant de jouer
if (on) addEventListener('pointerdown', () => init(), { once: true, capture: true });
if (on) addEventListener('keydown', () => init(), { once: true, capture: true });

// micro-interactions
const TARGET = 'a, button, [role="button"]';
document.addEventListener('pointerover', (e) => {
  if ((e as PointerEvent).pointerType !== 'mouse') return;
  const el = (e.target as Element).closest?.(TARGET);
  const from = (e.relatedTarget as Element | null)?.closest?.(TARGET);
  if (el && el !== from) play('hover');
});
document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest?.(TARGET);
  if (!el || el.matches('[data-sound]')) return;
  play('click');
});
addEventListener('kk:sound', (e) => { const d = (e as CustomEvent).detail; if (typeof d === 'string') play(d); else play(d.name, d); });
document.addEventListener('visibilitychange', () => { if (!ctx) return; document.hidden ? ctx.suspend() : ctx.resume(); });
