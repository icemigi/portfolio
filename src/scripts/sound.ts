// Son (validé, palette v2) : synthétisé dans le navigateur, aucun fichier, très discret.
// Coupé par défaut ; le bouton « Son » du menu l'active (choix mémorisé). Coupé quand l'onglet est caché.
// Les autres scripts demandent un son par : dispatchEvent(new CustomEvent('kk:sound', { detail: 'pick' })).
let ctx: AudioContext | null = null, master: GainNode | null = null, NB: AudioBuffer | null = null;
let on = false;
try { on = localStorage.getItem('kk-sound') === 'on'; } catch { /* */ }

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

const S: Record<string, () => void> = {
  hover: () => noise({ f: 5200, q: 6, r: 0.03, v: 0.03 }),
  click: () => { noise({ f: 1400, q: 3, a: 0.003, r: 0.03, v: 0.018 }); tone(140, { a: 0.003, r: 0.04, v: 0.022, to: 110 }); },
  slide: () => noise({ f: 700, to: 180, q: 0.6, a: 0.3, r: 0.4, v: 0.018, type: 'lowpass' }),
  letters: () => { for (let i = 0; i < 10; i++) noise({ f: 3800 + Math.random() * 1500, q: 10, a: 0.002, r: 0.014, v: 0.016, at: 0.3 + i * 0.045 + Math.random() * 0.015 }); },
  copy: () => tone(988, { a: 0.004, r: 0.14, v: 0.018 }),
  pick: () => tone(120, { a: 0.02, r: 0.14, v: 0.03, to: 160 }),
  drop: () => tone(120, { a: 0.003, r: 0.09, v: 0.035, to: 80 }),
  ring: () => tone(220, { a: 3.3, r: 0.2, v: 0.012, to: 330 }),
};
export const play = (name: string) => { if (!on || !ctx || document.hidden) return; if (ctx.state === 'suspended') ctx.resume(); S[name]?.(); };

// bouton du menu
const btn = document.querySelector<HTMLButtonElement>('[data-sound]');
const label = () => { if (!btn) return; btn.setAttribute('aria-pressed', String(on)); btn.textContent = on ? btn.dataset.on! : btn.dataset.off!; };
label();
btn?.addEventListener('click', () => {
  on = !on; try { localStorage.setItem('kk-sound', on ? 'on' : 'off'); } catch { /* */ }
  label(); if (on) { init(); play('click'); }
});
// son déjà activé lors d'une visite précédente : le navigateur exige un geste avant de jouer
if (on) addEventListener('pointerdown', () => init(), { once: true, capture: true });
if (on) addEventListener('keydown', () => init(), { once: true, capture: true });

// micro-interactions
const TARGET = 'a, button, [role="button"], [data-copy]';
document.addEventListener('pointerover', (e) => {
  if ((e as PointerEvent).pointerType !== 'mouse') return;
  const el = (e.target as Element).closest?.(TARGET);
  const from = (e.relatedTarget as Element | null)?.closest?.(TARGET);
  if (el && el !== from) play('hover');
});
document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest?.(TARGET);
  if (!el || el.matches('[data-sound]')) return;
  if (el.matches('[data-copy]')) play('copy'); else play('click');
});
addEventListener('kk:sound', (e) => play((e as CustomEvent).detail));
document.addEventListener('visibilitychange', () => { if (!ctx) return; document.hidden ? ctx.suspend() : ctx.resume(); });
