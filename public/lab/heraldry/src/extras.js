// Commandes visibles autour du générateur (le moteur, main.js, reste tel quel) :
// historique (← →), nouvel écu, partitions, clair, lien partageable (la clé dans l'adresse), export SVG et PNG,
// et « ton écu » : un prénom donne toujours le même blason (clé de 10 caractères tirée du prénom).
const wait = () => new Promise((r) => { const t = () => (window.app?.currentGenerationState ? r(window.app) : setTimeout(t, 50)); t(); });
const app = await wait();
const $ = (s) => document.getElementById(s);
const who = $('who');
let hist = [], at = -1, fromHist = false, label = '';

// chaque écu affiché entre dans l'historique et dans l'adresse
const gen = app.generate.bind(app);
app.generate = (num = null, key = null) => {
  gen(num, key);
  const k = app.currentSeedString;
  if (!fromHist) { hist = hist.slice(0, at + 1); if (hist[hist.length - 1] !== k) hist.push(k); at = hist.length - 1; }
  history.replaceState(null, '', '#' + k);
  who.textContent = label; label = '';
};
const show = (k) => { fromHist = true; app.generate(parseInt(k, 36), k.toLowerCase()); fromHist = false; };

// clé dans l'adresse à l'arrivée : on rouvre cet écu
const h = location.hash.slice(1).toLowerCase();
if (/^[0-9a-z]{4,12}$/.test(h)) app.generate(parseInt(h, 36), h); else { hist = [app.currentSeedString]; at = 0; history.replaceState(null, '', '#' + app.currentSeedString); }

$('t-new').onclick = (e) => { e.stopPropagation(); app.generate(); };
$('t-prev').onclick = (e) => { e.stopPropagation(); if (at > 0) show(hist[--at]); };
$('t-next').onclick = (e) => { e.stopPropagation(); if (at < hist.length - 1) show(hist[++at]); else app.generate(); };
addEventListener('keydown', (e) => {
  if (document.activeElement?.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft') $('t-prev').click(); else if (e.key === 'ArrowRight') $('t-next').click();
});
const sync = () => { $('t-part').setAttribute('aria-pressed', String(!!app.showPartitions)); $('t-light').setAttribute('aria-pressed', String(!!app.isLightMode)); document.body.classList.toggle('light-mode', !!app.isLightMode); };
const key = (k) => app.handleKey({ key: k, code: '' });
$('t-part').onclick = (e) => { e.stopPropagation(); key('p'); sync(); };
$('t-light').onclick = (e) => { e.stopPropagation(); key('l'); sync(); };
addEventListener('keyup', sync);
$('t-svg').onclick = (e) => { e.stopPropagation(); app.exportSVG(); };
$('t-link').onclick = (e) => { e.stopPropagation(); navigator.clipboard?.writeText(location.href).then(() => { $('t-link').textContent = 'copié'; setTimeout(() => ($('t-link').textContent = 'lien'), 1400); }); };
$('t-png').onclick = (e) => {
  e.stopPropagation();
  const svg = document.querySelector('#container svg'); if (!svg) return;
  const vb = svg.viewBox.baseVal, W = 2000, H = Math.round(W * vb.height / vb.width);
  const clone = svg.cloneNode(true); clone.setAttribute('width', W); clone.setAttribute('height', H);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = getComputedStyle(document.body).backgroundColor || '#000'; g.fillRect(0, 0, W, H); g.drawImage(img, 0, 0, W, H);
    const a = document.createElement('a'); a.download = `blason_${app.currentSeedString}.png`; a.href = c.toDataURL('image/png'); a.click();
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
};

// ton écu : le prénom (minuscules, sans accents) donne une clé fixe de 10 caractères
const nameIn = $('name-input');
nameIn.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key !== 'Enter') return;
  const name = nameIn.value.trim(); if (!name) return;
  const norm = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let h1 = 0x811c9dc5n, h2 = 0xcbf29ce4n;
  for (const c of norm) { const v = BigInt(c.codePointAt(0)); h1 = ((h1 ^ v) * 0x01000193n) & 0xffffffffn; h2 = ((h2 ^ v) * 0x100000001b3n) & 0xffffffffffffn; }
  const span = 36n ** 10n - 36n ** 9n, k = ((h1 << 20n) ^ h2) % span + 36n ** 9n;
  label = `l'écu de ${name}`;
  app.generate(Number(k), k.toString(36));
  nameIn.value = ''; nameIn.blur();
});
nameIn.addEventListener('click', (e) => e.stopPropagation());
sync();
