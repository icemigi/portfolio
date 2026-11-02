// Version statique de Letteroastd pour le Lab (GitHub Pages n'exécute pas le serveur Flask d'origine).
// L'export .zip de Letterboxd est lu ici, dans le navigateur (JSZip) : rien n'est envoyé nulle part.
// Portage fidèle de scraper.run_complete_analysis, generator.generate_dynamic_path et score.calculate_cinematographic_score.
// Sans serveur, pas de récupération d'affiches (le jeu affiche alors ses cartes-titres) ni d'analyse par pseudo.
(() => {
  const real = window.fetch.bind(window);
  let DATA = null;
  const json = (b, st = 200) => Promise.resolve(new Response(JSON.stringify(b), { status: st, headers: { 'Content-Type': 'application/json' } }));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- CSV ----------
  const parseCSV = (text) => {
    const rows = []; let row = [], cur = '', q = false;
    text = text.replace(/\u0000/g, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    const head = rows.shift() || [];
    return rows.filter((r) => r.length > 1 || r[0]).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
  };
  const cleanReview = (t) => { if (!t) return 'Pas de review'; let c = t.replace(/<[^>]+>/g, '').replace(/\s*\b(\d+|no)\s+likes?\s*(yet)?\b\s*$/i, ''); return c.trim() || 'Pas de review'; };
  const stars = (v) => { if (!v || String(v).trim() === '' || String(v).toLowerCase() === 'nan') return 'Pas de note'; const s = parseFloat(v); if (isNaN(s)) return String(v); const f = Math.floor(s); return '★'.repeat(f) + (s - f >= 0.5 ? '½' : ''); };
  const cleanTitle = (t) => (t ? t.replace('Poster for ', '').replace(/\s*\(\d{4}\)/g, '').trim() : '');

  async function readExport(file) {
    const diary = [], watchlist = []; let username = null;
    const zip = await JSZip.loadAsync(file);
    const files = Object.values(zip.files).filter((f) => !f.dir);
    const read = async (suffix) => { const f = files.find((x) => x.name.toLowerCase().endsWith(suffix)); return f ? parseCSV(await f.async('string')) : null; };
    for (const r of (await read('profile.csv')) || []) if (r.Username) { username = r.Username; break; }
    const reviews = {};
    for (const r of (await read('reviews.csv')) || []) { const k = r['Letterboxd URI'] || `${r.Name}_${r.Year}`; const rv = cleanReview(r.Review); if (rv !== 'Pas de review') reviews[k] = rv; }
    for (const r of (await read('diary.csv')) || []) {
      const uri = r['Letterboxd URI'] || '', k = uri || `${r.Name}_${r.Year}`;
      diary.push({ title: r.Name || 'Inconnu', year: (r.Year || '').trim(), rating: stars(r.Rating), rewatch: (r.Rewatch || '').trim().toLowerCase() === 'yes', review: reviews[k] || 'Pas de review', uri });
    }
    if (!diary.length) for (const suf of ['ratings.csv', 'watched.csv']) for (const r of (await read(suf)) || []) diary.push({ title: r.Name || 'Inconnu', year: (r.Year || '').trim(), rating: stars(r.Rating), rewatch: false, review: 'Pas de review', uri: r['Letterboxd URI'] || '' });
    for (const r of (await read('watchlist.csv')) || []) watchlist.push(r.Name || 'Inconnu');
    return { source: 'complete_export', username: username || 'Cinéphile', total_diary_count: diary.length, diary, watchlist };
  }

  // ---------- statistiques (score.py) ----------
  const TOP = ['godfather','the-godfather-part-ii','12-angry-men','schindlers-list','spirited-away','harakiri','seven-samurai','parasite-2019','pulp-fiction','the-dark-knight','fight-club','forrest-gump','inception','goodfellas','the-matrix','one-flew-over-the-cuckoos-nest','se7en','interstellar','city-of-god','the-silence-of-the-lambs','it-s-a-wonderful-life','saving-private-ryan','the-green-mile','life-is-beautiful','star-wars-episode-v-the-empire-strikes-back','back-to-the-future','psycho','the-pianist','leon-the-professional','the-lion-king','gladiator','american-history-x','the-prestige','whiplash-2014','grave-of-the-fireflies','casablanca','modern-times','rear-window','untouchable','alien','apocalypse-now','memento','raiders-of-the-lost-ark','django-unchained','wall-e','the-shining','paths-of-glory','sunset-boulevard','witness-for-the-prosecution','aliens','american-beauty','spider-man-into-the-spider-verse','dr-strangelove-or-how-i-learned-to-stop-worrying-and-love-the-bomb','oldboy','inglourious-basterds','amadeus','coco-2017','toy-story','braveheart','avengers-infinity-war','good-will-hunting','once-upon-a-time-in-the-west','your-name','requiem-for-a-dream','to-kill-a-mockingbird','eternal-sunshine-of-the-spotless-mind','high-and-low','reservoir-dogs','citizen-kane','the-hunt-2012','a-clockwork-orange','taxi-driver','lawrence-of-arabia','amelie','vertigo','scarface-1983','full-metal-jacket','rashomon','l-a-confidential','the-apartment','metropolis','singin-in-the-rain'];
  const toF = (r) => { if (!r || r === 'Pas de note') return null; return (r.match(/★/g) || []).length + (r.includes('½') ? 0.5 : 0); };
  const slug = (t) => { if (!t) return ''; let c = t.toLowerCase().replace(/\(.*?\)/g, '').replace(/’/g, "'").replace(/&/g, 'and').replace(/[éèê]/g, 'e').replace(/à/g, 'a').replace(/[^\w\s-]/g, ''); return c.trim().replace(/\s+/g, '-'); };
  const gauss = (v, t, s, mn = 20, mx = 100) => Math.max(mn, Math.min(mx, mx * Math.exp(-0.5 * ((v - t) / s) ** 2)));
  const yearOk = (y) => /^\d{4}$/.test(String(y || ''));
  function adv(diary) {
    if (!diary.length) return {};
    const dec = {};
    for (const f of diary) if (yearOk(f.year)) { const d = `${String(f.year).slice(0, 3)}0s`; dec[d] = (dec[d] || 0) + 1; }
    const sorted = Object.fromEntries(Object.entries(dec).sort((a, b) => b[1] - a[1]));
    const rl = diary.map((f) => toF(f.rating)).filter((x) => x !== null);
    const seen = [];
    for (const f of diary) {
      const ts = slug(f.title), parts = (f.uri || '').split('/'), us = parts.length > 2 ? parts[parts.length - 2] : '';
      for (const t of TOP) { const tc = t.replace(/-/g, ''); if (t === ts || t === us || (tc.length > 3 && ts.replace(/-/g, '').includes(tc))) { if (!seen.includes(f.title)) seen.push(f.title); break; } }
    }
    return { decades: sorted, top_decade: Object.keys(sorted)[0] || 'Inconnue', avg_rating: Math.round((rl.length ? rl.reduce((a, b) => a + b, 0) / rl.length : 0) * 100) / 100, top_100_seen: seen.length, top_100_pct: Math.round((seen.length / TOP.length) * 1000) / 10, seen_top_films: seen };
  }
  function scoreOf(data, c) {
    const diary = data.diary || []; if (!diary.length) return null;
    const total = data.total_diary_count || diary.length, n = diary.length, a = adv(diary);
    const vol = total <= 0 ? 0 : total < 100 ? ((total / 100) ** 0.7) * 50 : Math.min(100, 50 + 15 * Math.log(total / 100 + 1));
    const rr = (diary.filter((f) => f.review && f.review !== 'Pas de review').length / Math.max(1, n)) * 100;
    const engV = Math.min(100, Math.max(10, rr * 1.5)), eng = gauss(rr, 35, 25, 10, 95);
    const rl = diary.map((f) => toF(f.rating)).filter((x) => x !== null);
    const sev = rl.length ? gauss(rl.reduce((x, y) => x + y, 0) / rl.length, 3.1, 0.8) : 25;
    const risq = gauss((diary.filter((f) => f.rewatch).length / Math.max(1, n)) * 100, 8, 15);
    const vntg = gauss((diary.filter((f) => yearOk(f.year) && +f.year < 2000).length / Math.max(1, n)) * 100, 35, 20, 10, 100);
    const div = Math.min(100, Math.max(10, 10 + (c.vo ? 8 : 0) + ((c.foreign_ratio ?? 3) / 10) * 15 + ((a.top_100_pct || 0) / 100) * 50));
    let s = Math.round((vol * 0.3 + eng * 0.1 + sev * 0.15 + risq * 0.15 + vntg * 0.1 + div * 0.2) * 10) / 10; s = Math.min(100, Math.max(0, s));
    const rank = s >= 88 ? 'I. LÉGENDE DU 7ᵉ ART 🏆' : s >= 76 ? 'II. ÉLITE CINÉPHILE 💎' : s >= 65 ? 'III. CINÉASTE AVISÉ ⚔️' : s >= 50 ? 'IV. SPECTATEUR ÉCLAIRÉ 🎯' : s >= 38 ? 'V. AMATEUR RÉGULIER 🥈' : s >= 25 ? 'VI. SPECTATEUR CASUAL 🥉' : s >= 15 ? 'VII. PASSEUR DE TEMPS 🍿' : 'VIII. NÉOPHYTE DU MULTIPLEXE 🎟️';
    return { score: s, rank, details: { VOL: Math.round(vol), ENG: Math.round(engV), SEV: Math.round(sev), RISQ: Math.round(risq), VNTG: Math.round(vntg), DIV: Math.round(div) }, advanced_stats: a };
  }

  // ---------- parcours de questions (generator.py) ----------
  function path(data) {
    const diary = data.diary || [], total = data.total_diary_count || diary.length;
    const intro = `Analyse de l'intégralité de tes ${total} films consignés. Traitement de ton profil...`;
    const st = [], a = adv(diary), seenTop = a.top_100_seen || 0, pct = a.top_100_pct || 0, remaining = Math.max(0, 100 - seenTop);
    const t100 = pick([
      { text: `T'as coché ${pct}% du Top 100 officiel Letterboxd (${seenTop} films).`, btn1: "Des chefs-d'œuvre incontournables", btn2: "Mouais, c'est qu'une liste parmi d'autres" },
      { text: `${pct}% du Top 100 Letterboxd au compteur. Tu valides sincèrement ces films, ou c'est un passage obligé ?`, btn1: 'Validation totale : ce sont les meilleurs', btn2: 'Beaucoup de films franchement surcotés' },
      { text: `Il te reste ${remaining} films du Top 100 à découvrir (${pct}% vus). Une priorité pour tes prochains visionnages ?`, btn1: "Va falloir que je m'y colle sérieusement", btn2: 'Je marche au coup de cœur, pas aux listes' },
    ]);
    const top100 = { stat_id: 'mandatory_top100', type: 'question_roast', ...t100 };
    const dec = {}; let valid = 0;
    for (const f of diary) if (yearOk(f.year)) { const d = `${String(f.year).slice(0, 3)}0s`; dec[d] = (dec[d] || 0) + 1; valid++; }
    if (valid) {
      const td = Object.keys(dec).reduce((x, y) => (dec[y] > dec[x] ? y : x)), p = Math.round((dec[td] / valid) * 100);
      const dm = diary.filter((f) => String(f.year || '').startsWith(td.slice(0, 3)) && f.title), o = dm.length ? pick(dm) : null, film = o ? cleanTitle(o.title) : 'tes classiques';
      st.push({ stat_id: 'decades', type: 'question_roast', text: pick([`${p}% de tes visionnages datent des années ${td}. Âge d'or du cinéma ou zone de confort ?`, `Les années ${td} représentent ${p}% de ton historique. Un choix guidé par la nostalgie ?`]), btn1: `Rien ne bat la décennie de <strong>${film}</strong>`, btn1_film: film, btn1_year: o?.year || '', btn1_uri: o?.uri || '', btn2: 'Simple habitude, pas mon époque référence' });
    }
    const low = diary.filter((f) => ['★', '½', '★½', '★★'].includes(f.rating));
    if (low.length) { const w = pick(low), ws = cleanTitle(w.title); st.push({ stat_id: 'low_ratings', type: 'question_roast', text: pick([`${low.length} films ont pris 2.5 étoiles ou moins. Exigence artistique ou choix malheureux ?`, `Tu as flingué ${low.length} films sous la barre des 2.5 étoiles. Es-tu un spectateur difficile à convaincre ?`]), btn1: ws ? `Exigence : <strong>${ws}</strong> méritait cette sanction` : 'Exigence absolue : pas de cadeau', btn1_film: ws, btn1_year: w.year || '', btn1_uri: w.uri || '', btn2: "J'ai parfois la main un peu lourde" }); }
    const rw = diary.filter((f) => f.rewatch && f.title);
    if (rw.length) { const o = pick(rw), s = cleanTitle(o.title); st.push({ stat_id: 'rewatches', type: 'question_roast', text: pick([`Fidélité aux Œuvres : ${rw.length} rewatches au compteur. Besoin de sécurité culturelle ou recherche de détails ?`, `Révision de Classiques : Tu as revu ${rw.length} films. Un plaisir de confort ou une étude approfondie ?`]), btn1: `Incontournable : <strong>${s}</strong>, ça se revoit sans fin`, btn1_film: s, btn1_year: o.year || '', btn1_uri: o.uri || '', btn2: 'Simple plaisir de revoir de bons films' }); }
    const vc = diary.filter((f) => yearOk(f.year) && +f.year < 2000).length;
    if (vc) st.push({ stat_id: 'vintage', type: 'question_roast', text: pick([`Patrimoine Cinéma : ${vc} films de ton journal datent d'avant 2000. Culture du patrimoine ou hasard ?`, `Exploration Vintage : Tu comptes ${vc} films du XXᵉ siècle. Un choix délibéré d'exploration ?`]), btn1: 'Respect et étude des classiques', btn2: 'Visionnages ponctuels au hasard' });
    const duels = [], sh = shuffle([...diary]);
    for (const ts of ['★★★★★', '★★★★½', '★★★★', '★★★½', '★★', '★']) {
      const m = shuffle(sh.filter((f) => f.rating === ts && f.title));
      for (let i = 0; i + 1 < m.length; i += 2) { const [f1, f2] = [m[i], m[i + 1]], t1 = cleanTitle(f1.title), t2 = cleanTitle(f2.title); if (t1 !== t2) duels.push({ stat_id: `duel_${t1}_${t2}`, type: 'question_duel', text: `Dilemme (${ts}) : Si tu devais effacer l'un de ces deux films de ta mémoire ?`, f1: t1, y1: f1.year, u1: f1.uri, f2: t2, y2: f2.year, u2: f2.uri }); }
    }
    const sys = [{ stat_id: 'sys_vo', type: 'question_vo', text: "Format Audio : Quelle est ta règle d'or au lancement d'un film ?" }, { stat_id: 'sys_foreign', type: 'question_foreign_slider', text: 'Diversité : Sur 10 films que tu regardes, combien viennent du cinéma étranger (hors US / France) ?' }];
    shuffle(st); shuffle(duels);
    const seq = [];
    if (st.length) seq.push(st.shift()); if (st.length) seq.push(st.shift());
    seq.push(sys[0]); if (duels.length) seq.push(duels.shift()); seq.push(top100);
    if (st.length) seq.push(st.shift()); seq.push(sys[1]); if (duels.length) seq.push(duels.shift());
    while (st.length) seq.push(st.shift());
    return [{ type: 'dialogue', text: intro }, ...seq, { type: 'dialogue', text: 'Synthèse de tes choix et de tes statistiques terminée. Génération de la fiche officielle...' }];
  }
  function analysis(data) {
    const d = data.diary, ok = (f) => f.review && f.review !== 'Pas de review' && f.review.length > 5;
    const spicy = d.filter((f) => ['★', '½', '★½', '★★'].includes(f.rating) && ok(f)), any = d.filter(ok), c = spicy.length ? pick(spicy) : any.length ? pick(any) : null;
    return { username: data.username, diary_count: data.total_diary_count, wl_count: data.watchlist.length, hot_take: c ? { title: cleanTitle(c.title), rating: c.rating || '', review: c.review } : null, script_steps: path(data) };
  }

  window.fetch = async (input, init = {}) => {
    const u = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!u.pathname.includes('/api/')) return real(input, init);
    if (u.pathname.endsWith('/api/poster')) return new Response('', { status: 404 });
    if (u.pathname.endsWith('/api/fast')) return json({ error: 'Analyse par pseudo indisponible ici : importe ton export .zip.' }, 400);
    if (u.pathname.endsWith('/api/complete')) {
      try { DATA = await readExport(init.body.get('file')); if (!DATA.diary.length) throw new Error('vide'); return json(analysis(DATA)); }
      catch { alert("Ce fichier ne ressemble pas à un export Letterboxd (.zip). Réessaie avec le fichier téléchargé depuis Settings → Data."); location.reload(); return json({}); }
    }
    if (u.pathname.endsWith('/api/calculate')) return json(scoreOf(DATA, JSON.parse(init.body || '{}')));
    return real(input, init);
  };
})();
