// Commun aux pièces autonomes du Lab :
// 1. le mode jour / nuit du site (localStorage kk-theme, sinon le réglage du système), suivi en direct :
//    <html data-theme="nuit|jour">, window.kkNight, et l'événement kk:theme pour les pièces qui dessinent elles-mêmes ;
// 2. la flèche « ← lab » (pas dans un cadre : la salle du Lab a déjà la sienne ; pas si la page a la sienne, data-own-back).
(() => {
  const night = () => { try { const t = localStorage.getItem('kk-theme'); if (t) return t === 'nuit'; } catch { /* */ } return matchMedia('(prefers-color-scheme: dark)').matches; };
  let a = null;
  const paint = () => { if (!a) return; const n = window.kkNight; a.style.color = n ? '#ece5d8' : '#111'; a.style.background = n ? 'rgba(18,17,15,.92)' : 'rgba(243,243,243,.92)'; a.style.boxShadow = `0 0 0 1px ${n ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)'}`; };
  const apply = () => { const n = night(); window.kkNight = n; document.documentElement.dataset.theme = n ? 'nuit' : 'jour'; paint(); dispatchEvent(new CustomEvent('kk:theme', { detail: { night: n } })); };
  apply();
  addEventListener('storage', (e) => { if (e.key === 'kk-theme' || e.key === null) apply(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply);

  // aide de premier lancement : <html data-intro="…">, montrée une fois par pièce, effacée au premier geste
  const intro = document.documentElement.dataset.intro, ik = 'kk-intro:' + location.pathname;
  let seen = false; try { seen = localStorage.getItem(ik) === '1'; } catch { /* */ }
  if (intro && !seen) {
    const box = document.createElement('p'); box.className = 'kk-intro'; box.textContent = intro;
    const gone = () => { box.classList.add('out'); setTimeout(() => box.remove(), 600); try { localStorage.setItem(ik, '1'); } catch { /* */ } ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => removeEventListener(t, gone, true)); };
    (document.body ? Promise.resolve() : new Promise((r) => addEventListener('DOMContentLoaded', r))).then(() => { document.body.appendChild(box); setTimeout(() => ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => addEventListener(t, gone, { capture: true, passive: true })), 400); });
  }

  document.documentElement.classList.toggle('in-frame', window.top !== window);
  if (window.top !== window || document.querySelector('[data-own-back]')) return;
  const lang = new URLSearchParams(location.search).get('lang') || (/^fr/i.test(document.documentElement.lang || navigator.language) ? 'fr' : 'en');
  a = document.createElement('a');
  a.href = `/${lang}/lab/`; a.textContent = '← lab'; a.setAttribute('aria-label', lang === 'fr' ? 'Retour au Lab' : 'Back to the Lab');
  a.style.cssText = 'position:fixed;left:16px;top:14px;z-index:2147483647;padding:6px 10px;font:12px/1 "Geist Mono",ui-monospace,monospace;border-radius:3px;text-decoration:none';
  paint();
  a.onmouseenter = () => (a.style.color = '#FF8716'); a.onmouseleave = paint;
  (document.body ? Promise.resolve() : new Promise((r) => addEventListener('DOMContentLoaded', r))).then(() => document.body.appendChild(a));
})();
