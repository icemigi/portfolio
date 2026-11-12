// Flèche « ← Lab » pour les pièces autonomes du Lab (pages complètes hors du site).
// Rien dans un cadre (pièce intégrée à une salle du Lab : la salle a déjà sa flèche), rien si la page a la sienne (data-own-back).
(() => {
  if (window.top !== window || document.querySelector('[data-own-back]')) return;
  const lang = new URLSearchParams(location.search).get('lang') || (/^fr/i.test(document.documentElement.lang || navigator.language) ? 'fr' : 'en');
  const a = document.createElement('a');
  a.href = `/${lang}/lab/`; a.textContent = '← lab'; a.setAttribute('aria-label', lang === 'fr' ? 'Retour au Lab' : 'Back to the Lab');
  a.style.cssText = 'position:fixed;left:16px;top:14px;z-index:2147483647;padding:6px 10px;font:12px/1 "Geist Mono",ui-monospace,monospace;color:#111;background:rgba(243,243,243,.92);border-radius:3px;text-decoration:none;box-shadow:0 0 0 1px rgba(0,0,0,.08)';
  a.onmouseenter = () => (a.style.color = '#FF8716'); a.onmouseleave = () => (a.style.color = '#111');
  (document.body ? Promise.resolve() : new Promise((r) => addEventListener('DOMContentLoaded', r))).then(() => document.body.appendChild(a));
})();
