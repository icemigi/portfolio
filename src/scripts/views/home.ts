// Accueil ([lang]/index.astro) : le nom calé dans le premier écran, le portrait posé sur « kast », la bulle du portrait,
// le titre qui joue sous la souris, le cadre qui flotte.
import { onPage } from '../page';
import { reduced } from '../motion';

onPage('#name', (ctx) => {
  // Le nom remplit la largeur (ligne du milieu), puis on le cale verticalement pour que le bas de l'écran
  // coupe « le » au premier tiers bas de l'œil du e : on reconnaît la lettre, la coupe reste franche.
    const n = document.getElementById('name')!, hero = n.closest<HTMLElement>('.hero')!, s1 = n.closest<HTMLElement>('.scr')!;
  const place = (k = 1) => {
    const W = n.parentElement!.clientWidth;
    n.style.fontSize = '100px';
    const w = n.getBoundingClientRect().width;
    const fs = Math.floor(((100 * W) / w) * 100 * k) / 100;
    n.style.fontSize = `${fs}px`;
    // ligne de base de « le » et hauteur d'x de la fonte, mesurées
    const last = n.querySelector<HTMLElement>('[data-le]')!;
    const probe = document.createElement('i'); probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    last.appendChild(probe);
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.font = `500 ${fs}px Geist`;
    const xh = ctx.measureText('x').actualBoundingBoxAscent;
    hero.style.paddingTop = '0px';
    const base = probe.getBoundingClientRect().top - s1.getBoundingClientRect().top + s1.scrollTop;
    probe.remove();
    const H = s1.clientHeight;
    const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 56;
    // bas de l'écran = ligne de base − tiers de la hauteur d'x ; jamais sous le menu
    const ph = document.querySelector<HTMLElement>('.s1 .phrase')!;
    // téléphone : le nom occupe toute la largeur jusqu'en bas, la phrase se place toujours au-dessus de lui ;
    // sur un écran court, le nom descend un peu plus (le « le » est coupé plus bas) plutôt que de passer sous la phrase
    const phone = matchMedia('(max-width: 760px)').matches;
    const min = head + 8 + (phone ? ph.offsetHeight + 36 : 0), need = base - xh / 3;
    // écran trop court pour le nom entier sous la phrase : on réduit le nom (une fois) au lieu de le couper davantage
    if (phone && k === 1 && H - need < min) return place(Math.max(0.6, (H - min) / need));
    const pad = Math.max(min, H - need);
    hero.style.paddingTop = `${pad}px`;
    // ordinateur : la phrase reste toujours en bas, à gauche de la flèche (position CSS), quelle que soit la taille de la fenêtre
    if (phone) { ph.style.top = `${Math.round(pad - ph.offsetHeight - 24)}px`; ph.style.bottom = 'auto'; }
    else { ph.style.top = ''; ph.style.bottom = ''; }
    placePortrait(ctx, head, phone ? ph : null);
  };
  // portrait : calé sur « kast » (maquette du 11/11) — il commence au premier dixième du mot, en couvre les deux tiers,
  // et son bas tombe aux trois quarts de la hauteur du k ; jamais sous le menu (il rétrécit plutôt)
  const pt = document.getElementById('pt3d');
  const placePortrait = (ctx: CanvasRenderingContext2D, head: number, ph: HTMLElement | null) => {
    if (!pt) return;
    const AR = 1709 / 2334;
    // téléphone : en bas à droite, à cheval seulement sur « kast » et « le », avec de l'air autour
    if (ph) {
      const W = s1.clientWidth, H = s1.clientHeight, sr = s1.getBoundingClientRect();
      const ing = n.querySelector<HTMLElement>('.l2 > span')!;            // « —ing » (sa propre ligne sur téléphone)
      const pr = document.createElement('i'); pr.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      ing.appendChild(pr); const base2 = pr.getBoundingClientRect().top - sr.top; pr.remove();
      const bottom = H - 56, topMin = base2 + 10;                          // jamais au-dessus du pied de « —ing »
      const w = Math.min(W * .46, (bottom - topMin) * AR);
      pt.style.display = w < W * .26 ? 'none' : '';
      pt.style.width = `${w}px`; pt.style.left = `${W - w - W * .06}px`; pt.style.top = `${bottom - w / AR}px`;
      return;
    }
    pt.style.display = '';
    const kast = n.querySelector<HTMLElement>('.l2 > span:last-child')!;
    const probe = document.createElement('i'); probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    kast.appendChild(probe);
    const sr = s1.getBoundingClientRect(), kr = kast.getBoundingClientRect();
    const base = probe.getBoundingClientRect().top - sr.top;
    probe.remove();
    const asc = ctx.measureText('k').actualBoundingBoxAscent;
    let w = kr.width * 0.652, left = kr.left - sr.left + kr.width * 0.103;
    const bottom = base - asc * 0.262, minTop = head + 8;
    if (bottom - w / AR < minTop) { const w2 = (bottom - minTop) * AR; left += (w - w2) / 2; w = w2; }
    pt.style.width = `${w}px`; pt.style.left = `${left}px`; pt.style.top = `${bottom - w / AR}px`;
  };
  // placé tout de suite (polices préchargées), puis recalé une fois les polices prêtes ; le nom reste caché
  // tant qu'il n'est pas à sa place (aucun saut visible au chargement)
  // posé au montage (avant le premier affichage en navigation, polices déjà là) ; au premier chargement, une fois les polices
  // prêtes — le nom reste caché tant qu'il n'est pas à sa place (.s1:not(.placed))
  const settle = () => { place(); s1.classList.add('placed'); };
  if (document.fonts.status === 'loaded') settle();
  else { place(); document.fonts.ready.then(() => { if (!ctx.signal.aborted) settle(); }); }
  // bulle de message au survol du portrait : trois points pendant qu'il « écrit », puis une phrase (une nouvelle à chaque survol,
  // jamais deux fois la même de suite) ; elle part avec la souris, et chaque retour sur le portrait en écrit une nouvelle
  if (pt && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const bub = document.getElementById('bub')!, msg = bub.querySelector<HTMLElement>('.msg')!;
    // vannes écrites dans chaque langue (pas traduites mot à mot) ; ponctuation française : espace fine insécable avant ? ! et dans « »
    const LINES = document.documentElement.lang === 'fr'
      ? ['Salut\u202f! 👋', 'Non, je n\'enlève pas le casque.', 'Il fait 1\u202f000\u202f°C là-dedans…', 'Tu cherches un type designer\u202f?', 'Le crénage, c\'est ma passion.', 'Écris-moi, je réponds vite.', 'Ce heaume pèse une tonne…', 'Tu peux arrêter de me fixer\u202f?', 'Je dessine des lettres, pas des épées.', 'Oui, c\'est un vrai casque.', 'J\'ai le nez qui gratte…', 'Le Moyen Âge, c\'était mieux avant.', 'Garamond ou Helvetica\u202f? Débat.', 'Mon cheval s\'appelle Bézier.', 'Plus chevalier que chevalet.', 'Respire, c\'est qu\'un portfolio.', 'On dit «\u202ffonte\u202f», pas «\u202fpolice\u202f».', 'Pas de cookies, que des écus.', 'Nique la police… d\'écriture.']
      : ['Hi there 👋', 'No, the helmet stays on.', 'It\'s a thousand degrees in here…', 'Need a type designer?', 'Kerning keeps me up at night.', 'Email me. I\'m quick.', 'This helm weighs a ton…', 'You\'re staring. I can tell.', 'I draw letters, not swords.', 'Yes, it\'s a real helmet.', 'My nose itches. Great.', 'Dark Ages? Mostly bad lighting.', 'Serif or sans? Choose wisely.', 'My horse is called Bézier.', 'Knight by day, designer by night.', 'Relax, it\'s just a portfolio.', 'Fonts are free. Kerning isn\'t.', 'No cookies here. Only shields.', 'Down with the font police.'];
    let k = 0; try { k = +(sessionStorage.getItem('kk-bub') || 0); } catch { /* */ }
    let over = false, t1 = 0, t2 = 0;
    const place = () => {
      const s1r = s1.getBoundingClientRect(), r = pt.getBoundingClientRect();
      bub.style.left = 'auto'; bub.style.right = `${s1r.right - (r.left + r.width * .08)}px`; bub.style.top = `${r.top - s1r.top + r.height * .46}px`; // la queue arrive à hauteur de la bouche
    };
    const enter = () => {
      over = true; clearTimeout(t1); clearTimeout(t2);
      place(); bub.classList.add('typing'); msg.textContent = ''; bub.classList.add('on');
      t1 = ctx.timeout(() => {
        msg.textContent = LINES[k % LINES.length]; k++; try { sessionStorage.setItem('kk-bub', String(k)); } catch { /* */ }
        bub.classList.remove('typing'); dispatchEvent(new CustomEvent('kk:sound', { detail: 'pick' }));
      }, 750 + Math.random() * 350);
    };
    const leave = () => { over = false; clearTimeout(t1); clearTimeout(t2); bub.classList.remove('on'); };
    // le portrait laisse passer la souris (les lettres dessous réagissent) : on teste sa zone à la main
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = pt.getBoundingClientRect(), inside = e.clientX > r.left + r.width * .12 && e.clientX < r.right - r.width * .12 && e.clientY > r.top + r.height * .08 && e.clientY < r.bottom - r.height * .1;
      if (inside && !over) enter(); else if (!inside && over) leave();
    }, { passive: true, signal: ctx.signal });
    addEventListener('wheel', () => { if (over) leave(); }, { passive: true, signal: ctx.signal });
    // volte-face du portrait : une réplique selon la face qui apparaît
    const FLIPL = document.documentElement.lang === 'fr'
      ? ['Je le remets, il caille.', 'Bon, d\'accord, je l\'enlève.']
      : ['Putting it back on. Chilly.', 'Fine, I\'ll take it off.'];
    addEventListener('kk:flip', (e) => {
      const f = (e as CustomEvent).detail.face as number;
      clearTimeout(t1); clearTimeout(t2); place();
      bub.classList.remove('typing'); msg.textContent = FLIPL[f]; bub.classList.add('on');
      t2 = ctx.timeout(() => { if (!over) bub.classList.remove('on'); }, 2600);
    }, { signal: ctx.signal });
  }

  // titre qui joue (souris) : chaque lettre survolée passe par quelques signes au hasard, puis revient ; une lettre en cours
  // ne se relance pas, si bien qu'un passage rapide de la souris fait courir une vague le long du nom
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced()) {
    const POOL = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&?!@#%*+=/§¶<>{}[]$€'];
    const busy = new WeakSet<HTMLElement>();
    n.addEventListener('pointerover', (e) => {
      const el = (e.target as Element).closest?.<HTMLElement>('.hc');
      if (!el || busy.has(el) || !n.contains(el)) return;
      const c = (el.textContent || '').trim(); if ([...c].length !== 1) return;
      busy.add(el); el.classList.add('sx');
      dispatchEvent(new CustomEvent('kk:sound', { detail: 'key' }));
      let t = 0, last = '';
      const tick = () => {
        if (t >= 300) { el.classList.remove('sx'); el.removeAttribute('data-s'); ctx.timeout(() => busy.delete(el), 120); return; }
        let r; do r = POOL[(Math.random() * POOL.length) | 0]; while (r === last || r === c); last = r;
        el.dataset.s = r;
        const gap = 40 + 55 * (t / 300) ** 2; t += gap; ctx.timeout(tick, gap);
      };
      tick();
    });
  }
  // téléphone : la barre d'adresse qui se replie change la hauteur de quelques px → on ne recale que si la largeur change
  // ou si la hauteur bouge vraiment (rotation, fenêtre redimensionnée)
  let lw = innerWidth, lh = innerHeight;
  addEventListener('resize', () => { if (innerWidth === lw && Math.abs(innerHeight - lh) < 140) return; lw = innerWidth; lh = innerHeight; place(); }, { signal: ctx.signal });

  // le cadre flotte comme les objets de la page Projets (14/11) : il monte et descend à son rythme (± 7 px), la souris le
  // décale selon sa profondeur, et au survol il se soulève de 14 px en grossissant un peu. Rien avec « Réduire les animations ».
  if (pt && !reduced()) {
    const Z = 0.8, lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    let tx = 0, ty = 0, nx = 0, ny = 0, px = 0, py = 0, lift = 0, sc = 1, hov = false;
    addEventListener('pointermove', (e) => {
      tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
      const r = pt.getBoundingClientRect();
      hov = e.pointerType === 'mouse' && e.clientX > r.left + r.width * .12 && e.clientX < r.right - r.width * .12 && e.clientY > r.top + r.height * .08 && e.clientY < r.bottom - r.height * .1;
    }, { passive: true, signal: ctx.signal });
    addEventListener('pointerleave', () => { tx = ty = 0; hov = false; }, { signal: ctx.signal });
    const float = (now: number) => {
      const t = now / 1000;
      nx = lerp(nx, tx, 0.06); ny = lerp(ny, ty, 0.06);
      px = lerp(px, -nx * 28 * Z, 0.08); py = lerp(py, -ny * 20 * Z, 0.08);
      lift = lerp(lift, hov ? -14 : 0, 0.14); sc = lerp(sc, hov ? 1.05 : 1, 0.12);
      const bob = Math.sin(t * 0.8 + 1.3) * 7;
      pt.style.transform = `translate(${px.toFixed(2)}px, ${(py + bob + lift).toFixed(2)}px) scale(${sc.toFixed(4)})`;
      if (!document.hidden) ctx.raf(float); else document.addEventListener('visibilitychange', () => ctx.raf(float), { once: true, signal: ctx.signal });
    };
    ctx.raf(float);
  }
});
