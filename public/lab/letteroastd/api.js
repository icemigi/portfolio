// Letteroastd : moteur (statique, tout dans le navigateur — rien n'est envoyé).
// LR.read(file) lit l'export .zip de Letterboxd ; LR.demo() fabrique un profil exemple ;
// LR.facts() en tire les chiffres ; LR.script() écrit le parcours (questions + répliques) ;
// LR.score() calcule les six axes et le rang ; LR.verdict() écrit les phrases de la fiche.
// Deux sortes de questions : « perso » (VO, salle ou canapé, watchlist, étranger) qui ne notent rien et colorent
// les répliques et la fiche ; « devine » (tes 5 étoiles, ta décennie, ton hérésie) qui comptent pour l'axe Lucidité.
(() => {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
  const stars = (r) => (r == null ? '' : '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : ''));
  const yearOk = (y) => /^\d{4}$/.test(String(y || ''));

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
    return rows.filter((r) => r.length > 1 || r[0]).map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ''])));
  };
  const num = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
  const film = (r) => ({ title: (r.Name || '').trim(), year: (r.Year || '').trim(), uri: r['Letterboxd URI'] || '', rating: num(r.Rating) });

  async function read(file) {
    const zip = await JSZip.loadAsync(file);
    const files = Object.values(zip.files).filter((f) => !f.dir && !/(^|\/)(deleted|orphaned)\//i.test(f.name));
    const get = async (name) => { const f = files.find((x) => x.name.toLowerCase().split('/').pop() === name); return f ? parseCSV(await f.async('string')) : []; };
    const profile = await get('profile.csv');
    const reviews = (await get('reviews.csv')).map((r) => ({ ...film(r), text: (r.Review || '').replace(/<[^>]+>/g, '').trim() })).filter((r) => r.text.length > 4);
    const diary = (await get('diary.csv')).map((r) => ({ ...film(r), rewatch: /^yes$/i.test((r.Rewatch || '').trim()), date: (r['Watched Date'] || r.Date || '').trim() }));
    const ratings = (await get('ratings.csv')).map(film).filter((f) => f.rating != null);
    const watched = (await get('watched.csv')).map(film);
    const watchlist = (await get('watchlist.csv')).map(film);
    if (!diary.length && !ratings.length && !watched.length) throw new Error('empty');
    return { username: profile[0]?.Username || '', diary, ratings, watched, watchlist, reviews };
  }

  // ---------- panthéon : une sélection de grands classiques (slugs Letterboxd) ----------
  const TOP = ['godfather','the-godfather-part-ii','12-angry-men','schindlers-list','spirited-away','harakiri','seven-samurai','parasite-2019','pulp-fiction','the-dark-knight','fight-club','forrest-gump','inception','goodfellas','the-matrix','one-flew-over-the-cuckoos-nest','se7en','interstellar','city-of-god','the-silence-of-the-lambs','it-s-a-wonderful-life','saving-private-ryan','the-green-mile','life-is-beautiful','star-wars-episode-v-the-empire-strikes-back','back-to-the-future','psycho','the-pianist','leon-the-professional','the-lion-king','gladiator','american-history-x','the-prestige','whiplash-2014','grave-of-the-fireflies','casablanca','modern-times','rear-window','untouchable','alien','apocalypse-now','memento','raiders-of-the-lost-ark','django-unchained','wall-e','the-shining','paths-of-glory','sunset-boulevard','witness-for-the-prosecution','aliens','american-beauty','spider-man-into-the-spider-verse','dr-strangelove-or-how-i-learned-to-stop-worrying-and-love-the-bomb','oldboy','inglourious-basterds','amadeus','coco-2017','toy-story','braveheart','avengers-infinity-war','good-will-hunting','once-upon-a-time-in-the-west','your-name','requiem-for-a-dream','to-kill-a-mockingbird','eternal-sunshine-of-the-spotless-mind','high-and-low','reservoir-dogs','citizen-kane','the-hunt-2012','a-clockwork-orange','taxi-driver','lawrence-of-arabia','amelie','vertigo','scarface-1983','full-metal-jacket','rashomon','l-a-confidential','the-apartment','metropolis','singin-in-the-rain'];
  const slug = (t) => (t || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[’']/g, '').replace(/&/g, 'and').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  const uriSlug = (u) => { const p = (u || '').split('/').filter(Boolean); return p[p.length - 1] || ''; };
  const inTop = (f) => { const a = slug(f.title), b = uriSlug(f.uri); return TOP.find((t) => t === a || t === b || (t.length > 6 && a.replace(/-/g, '') === t.replace(/-/g, ''))); };
  const pretty = (s) => s.replace(/-\d{4}$/, '').split('-').map((w) => (w.length > 2 || /^(i|ii)$/.test(w) ? w[0].toUpperCase() + w.slice(1) : w)).join(' ').replace(/^./, (c) => c.toUpperCase());

  // ---------- les chiffres ----------
  function facts(raw) {
    const key = (f) => (f.uri ? uriSlug(f.uri) : `${slug(f.title)}-${f.year}`);
    const seen = new Map();
    for (const f of [...raw.watched, ...raw.ratings, ...raw.diary]) if (f.title) seen.set(key(f), { ...seen.get(key(f)), ...f });
    const films = [...seen.values()];
    const rated = raw.ratings.length ? raw.ratings : raw.diary.filter((f) => f.rating != null);
    const R = rated.map((f) => f.rating);
    const avg = R.length ? R.reduce((a, b) => a + b, 0) / R.length : null;
    const five = rated.filter((f) => f.rating === 5).length;
    // décennies
    const dec = {}; for (const f of films) if (yearOk(f.year)) { const d = `${f.year.slice(0, 3)}0`; dec[d] = (dec[d] || 0) + 1; }
    const decs = Object.entries(dec).sort((a, b) => b[1] - a[1]);
    const dated = films.filter((f) => yearOk(f.year));
    const oldest = dated.sort((a, b) => a.year - b.year)[0] || null;
    // panthéon
    const top = films.filter(inTop), topSlugs = new Set(top.map(inTop));
    const heresy = rated.filter((f) => inTop(f) && f.rating <= 2.5).sort((a, b) => a.rating - b.rating)[0] || null;
    const topLoved = rated.filter((f) => inTop(f) && f.rating >= 4);
    const unseenTop = TOP.filter((t) => !topSlugs.has(t));
    // journal : revisionnages, marathons, rythme
    const rw = {}; for (const f of raw.diary) if (f.rewatch) rw[key(f)] = { f, n: (rw[key(f)]?.n || 0) + 1 };
    const rewatch = Object.values(rw).sort((a, b) => b.n - a.n)[0] || null;
    const days = {}; for (const f of raw.diary) if (/^\d{4}-\d{2}-\d{2}$/.test(f.date)) (days[f.date] = days[f.date] || []).push(f);
    const binge = Object.entries(days).sort((a, b) => b[1].length - a[1].length)[0] || null;
    const ds = Object.keys(days).sort(), last = ds.length ? new Date(ds[ds.length - 1]) : null;
    const yearAgo = last ? new Date(last.getTime() - 365 * 864e5) : null;
    const lastYear = last ? raw.diary.filter((f) => f.date && new Date(f.date) > yearAgo).length : 0;
    const perMonth = lastYear / 12;
    const now = new Date().getFullYear();
    const recent = dated.length ? dated.filter((f) => +f.year >= now - 3).length / dated.length : 0;
    // critiques
    const harsh = raw.reviews.filter((r) => r.rating != null && r.rating <= 2).sort((a, b) => a.rating - b.rating);
    const hot = harsh[0] || raw.reviews.sort((a, b) => b.text.length - a.text.length)[0] || null;
    // dispersion des notes, parts d'extrêmes, variété des décennies (entropie), longueur des critiques
    const sd = R.length > 1 ? Math.sqrt(R.reduce((a, r) => a + (r - avg) ** 2, 0) / R.length) : 0;
    const low = R.length ? R.filter((r) => r <= 2).length / R.length : 0, high = R.length ? R.filter((r) => r >= 4.5).length / R.length : 0;
    const nd = decs.reduce((a, x) => a + x[1], 0), H = nd ? -decs.reduce((a, [, c]) => a + (c / nd) * Math.log(c / nd), 0) : 0;
    const old = dated.length ? dated.filter((f) => +f.year < 1970).length / dated.length : 0;
    const revLen = raw.reviews.length ? raw.reviews.reduce((a, r) => a + r.text.length, 0) / raw.reviews.length : 0;
    // journal daté : années, jours de la semaine ; note la plus fréquente
    const dd = raw.diary.filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f.date) && f.title);
    const yc = {}; dd.forEach((f) => { const y = f.date.slice(0, 4); yc[y] = (yc[y] || 0) + 1; });
    const wd = Array(7).fill(0); dd.forEach((f) => wd[new Date(f.date + 'T12:00').getDay()]++);
    const rc = {}; R.forEach((r) => (rc[r] = (rc[r] || 0) + 1));
    return {
      years: Object.entries(yc).sort((a, b) => b[1] - a[1]), weekdays: wd, modeR: Object.entries(rc).sort((a, b) => b[1] - a[1]).map(([r, c]) => [+r, c]), dated: dd,
      sd, low, high, entropy: H / Math.log(12), old, revLen,
      username: raw.username, total: films.length, rated: rated.length, avg, five, decs, oldest, top: top.length, heresy, topLoved, unseenTop,
      rewatch, rewatches: raw.diary.filter((f) => f.rewatch).length, diary: raw.diary.length, binge: binge && binge[1].length >= 3 ? { date: binge[0], films: binge[1] } : null,
      perMonth, watchlist: raw.watchlist.length, recent, reviews: raw.reviews.length, hot,
      duels: duelPairs(rated),
      // étagère du vidéoclub : tes films (les mieux notés d'abord, puis le reste), pour les tranches de cassettes
      shelf: shuffle([...rated].sort((a, b) => b.rating - a.rating).slice(0, 40)).slice(0, 22).map((f) => ({ title: f.title, year: f.year, rating: f.rating })),
    };
  }
  function duelPairs(rated) {
    const by = {}; for (const f of rated) if (f.rating >= 3.5) (by[f.rating] = by[f.rating] || []).push(f);
    const out = [];
    for (const r of Object.keys(by).sort((a, b) => b - a)) { const m = shuffle([...by[r]]); for (let i = 0; i + 1 < m.length && out.length < 2; i += 2) if (m[i].title !== m[i + 1].title) out.push([m[i], m[i + 1]]); }
    return shuffle(out);
  }

  // ---------- le parcours ----------
  // étape : { kind: 'say' | 'choice' | 'slider' | 'duel', id, text, options?, reply?(v) } ; reply renvoie la réplique affichée après le choix
  function script(F, lang) {
    const L = (fr, en) => (lang === 'en' ? en : fr);
    const n = (v) => v.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR');
    const date = (d) => new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const S = [];
    S.push({ kind: 'say', text: L(`${n(F.total)} films. On a tout lu. Installe-toi.`, `${n(F.total)} films. We read everything. Get comfortable.`) });

    S.push({ kind: 'choice', id: 'vo', text: L('Tu lances un film étranger. Tu le regardes…', 'You start a foreign film. You watch it…'),
      options: [{ v: 'vo', label: L('En VO, évidemment', 'In the original language, obviously') }, { v: 'vf', label: L('En VF, je suis pas venu lire', 'Dubbed. I came to watch, not to read') }, { v: 'mix', label: L('Ça dépend de qui est sur le canapé', 'Depends who is on the couch') }],
      reply: (v) => ({ vo: L('Respect. Les sous-titres te remercient.', 'Respect. The subtitles thank you.'), vf: L('Noté. On ne jugera pas. Enfin, un peu.', 'Noted. No judgement. Well, a little.'), mix: L('Le diplomate du salon.', 'The living-room diplomat.') })[v] });

    if (F.rated >= 10) {
      const t = F.five, opts = shuffle([...new Set([t, Math.max(0, Math.round(t * 0.4)), Math.round(t * 2.2) + 3])]);
      S.push({ kind: 'choice', id: 'g_five', guess: t, grade: (v) => Math.max(0, 1 - Math.abs(v - t) / Math.max(t, 1)), text: L('À ton avis, combien de films as-tu notés 5 étoiles ?', 'How many films do you think you rated 5 stars?'),
        options: opts.map((x) => ({ v: x, label: n(x) })),
        reply: (v) => (v === t ? L(`Exact : ${n(t)}. Au moins, tu te connais.`, `Correct: ${n(t)}. At least you know yourself.`)
          : L(`Raté, c'est ${n(t)}. ${t > v ? 'Tu es plus généreux que tu ne le crois.' : 'Tu es plus dur que tu ne le crois.'}`, `Wrong, it's ${n(t)}. ${t > v ? "You're more generous than you think." : "You're harsher than you think."}`)) });
    }
    if (F.duels[0]) S.push(duel(F.duels[0], L));

    S.push({ kind: 'choice', id: 'place', text: L('Ton habitat naturel de cinéphile ?', 'Your natural film-watching habitat?'),
      options: [{ v: 'salle', label: L('La salle, rang du milieu', 'The cinema, middle row') }, { v: 'canape', label: L('Le canapé, plaid compris', 'The couch, blanket included') }, { v: 'tel', label: L('Le téléphone, dans le métro', 'My phone, on the train') }],
      reply: (v) => ({ salle: L('Un puriste. Le pop-corn à 9 € ne te fait pas peur.', 'A purist. Overpriced popcorn does not scare you.'), canape: L('Le cinéma, mais avec pause pipi.', 'Cinema, but with bathroom breaks.'), tel: L('Lawrence d\'Arabie sur 6 pouces. Courageux.', 'Lawrence of Arabia on six inches. Brave.') })[v] });

    if (F.decs.length >= 2) {
      const [d, c] = F.decs[0], opts = shuffle([d, ...shuffle(F.decs.slice(1).map((x) => x[0])).slice(0, 2)]), pct = Math.round((c / F.decs.reduce((a, x) => a + x[1], 0)) * 100);
      S.push({ kind: 'choice', id: 'g_dec', guess: d, grade: (v) => (v === d ? 1 : Math.abs(+v - +d) === 10 ? 0.5 : 0), text: L('La décennie que tu regardes le plus ?', 'The decade you watch the most?'),
        options: opts.map((x) => ({ v: x, label: L(`Les années ${x.slice(2)}`, `The ${x}s`) })),
        reply: (v) => (v === d ? L(`Oui : ${pct} % de tes films. `, `Yes: ${pct}% of your films. `) : L(`Non, les années ${d.slice(2)} : ${pct} % de tes films. `, `No, the ${d}s: ${pct}% of your films. `))
          + (F.oldest ? L(`Ton plus vieux film : ${F.oldest.title} (${F.oldest.year}).`, `Your oldest film: ${F.oldest.title} (${F.oldest.year}).`) : '') });
    }
    if (F.binge) S.push({ kind: 'say', text: L(`Le ${date(F.binge.date)}, tu as enchaîné ${F.binge.films.length} films. On espère qu'il y avait des chips.`, `On ${date(F.binge.date)} you watched ${F.binge.films.length} films in a row. We hope there were snacks.`) });

    if (F.heresy && F.topLoved.length >= 2) {
      const h = F.heresy, others = shuffle([...F.topLoved]).slice(0, 2), opts = shuffle([h, ...others]);
      S.push({ kind: 'choice', id: 'g_heresy', guess: h.title, text: L('Un classique du panthéon a pris ta pire note. Lequel ?', 'One all-time classic got your worst rating. Which one?'),
        options: opts.map((f) => ({ v: f.title, label: f.title })),
        reply: (v) => (v === h.title ? L(`Oui. ${stars(h.rating)} à ${h.title}. Tu assumes, c'est déjà ça.`, `Yes. ${stars(h.rating)} for ${h.title}. At least you own it.`) : L(`Non : tu as mis ${stars(h.rating)} à ${h.title}. Internet t'attend dehors.`, `No: you gave ${h.title} ${stars(h.rating)}. The internet is waiting outside.`)) });
    }
    S.push({ kind: 'slider', id: 'foreign', text: L('Sur 10 films, combien ne sont ni américains ni français ?', 'Out of 10 films, how many are neither American nor British?'),
      reply: (v) => (v >= 6 ? L('Un passeport bien tamponné.', 'A well-stamped passport.') : v >= 3 ? L('Quelques escales. Bien.', 'A few stopovers. Good.') : L('Hollywood te dit merci.', 'Hollywood thanks you.')) });

    if (F.rewatch && F.rewatch.n >= 2) S.push({ kind: 'say', text: L(`Tu as revu ${F.rewatch.f.title} ${F.rewatch.n} fois. Ça va, à la maison ?`, `You rewatched ${F.rewatch.f.title} ${F.rewatch.n} times. Everything OK at home?`) });

    if (F.watchlist) {
      const months = F.perMonth > 0 ? Math.ceil(F.watchlist / F.perMonth) : null;
      S.push({ kind: 'choice', id: 'wl', text: L(`Ta watchlist compte ${n(F.watchlist)} films. C'est…`, `Your watchlist holds ${n(F.watchlist)} films. It's…`),
        options: [{ v: 'plan', label: L('Un programme', 'A plan') }, { v: 'grave', label: L('Un cimetière', 'A graveyard') }],
        reply: (v) => (months ? L(`À ton rythme actuel, il te faut ${months} mois pour la finir. `, `At your current pace, it takes ${months} months to finish. `) : '') + (v === 'plan' ? L('Sans en rajouter un seul. Bonne chance.', 'Without adding a single one. Good luck.') : L('Repose en paix, la liste.', 'Rest in peace, list.')) });
    }
    if (F.duels[1]) S.push(duel(F.duels[1], L));
    const stars2 = (r) => stars(r) || L('½ étoile', '½ star');
    const pct = (a, b) => Math.round((a / Math.max(1, b)) * 100);
    // --- devinettes tirées du journal ---
    if (F.years.length >= 3) {
      const [y, c] = F.years[0], opts = shuffle([y, ...shuffle(F.years.slice(1).map((x) => x[0])).slice(0, 2)]);
      S.push({ kind: 'choice', id: 'g_year', guess: y, grade: (v) => (v === y ? 1 : Math.abs(+v - +y) === 1 ? 0.5 : 0), text: L('Ton année la plus chargée en films ?', 'Your busiest year for films?'),
        options: opts.map((x) => ({ v: x, label: x })), reply: (v) => (v === y ? L(`Oui, ${y} : ${n(c)} films dans ton journal.`, `Yes, ${y}: ${n(c)} films in your diary.`) : L(`Non, c'est ${y}, avec ${n(c)} films. Une année difficile ?`, `No, it's ${y}, with ${n(c)} films. A rough year?`)) });
    }
    if (F.dated.length >= 20) {
      const days = L(['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
      const top = F.weekdays.indexOf(Math.max(...F.weekdays)), opts = shuffle([top, ...shuffle([0, 1, 2, 3, 4, 5, 6].filter((d) => d !== top)).slice(0, 2)]);
      S.push({ kind: 'choice', id: 'g_day', guess: top, text: L('Le jour où tu regardes le plus de films ?', 'The day you watch the most films?'),
        options: opts.map((d) => ({ v: d, label: L(days[d][0].toUpperCase() + days[d].slice(1), days[d]) })),
        reply: (v) => L(`${v === top ? 'Bien vu' : 'Raté'} : ${pct(F.weekdays[top], F.dated.length)} % de tes films tombent un ${days[top]}.`, `${v === top ? 'Right' : 'Wrong'}: ${pct(F.weekdays[top], F.dated.length)}% of your films land on a ${days[top]}.`) });
    }
    if (F.modeR.length >= 3) {
      const [m, c] = F.modeR[0], opts = shuffle([m, ...shuffle(F.modeR.slice(1, 6).map((x) => x[0])).slice(0, 2)]);
      S.push({ kind: 'choice', id: 'g_mode', guess: m, grade: (v) => (v === m ? 1 : Math.abs(v - m) === 0.5 ? 0.5 : 0), text: L('La note que tu donnes le plus souvent ?', 'The rating you give most often?'),
        options: opts.map((r) => ({ v: r, label: stars2(r) })), reply: (v) => L(`${v === m ? 'Exact' : 'Non'} : ${stars2(m)}, ${n(c)} fois. ${m >= 4 ? 'Généreux.' : m <= 2.5 ? 'Sévère.' : 'Prudent.'}`, `${v === m ? 'Correct' : 'No'}: ${stars2(m)}, ${n(c)} times. ${m >= 4 ? 'Generous.' : m <= 2.5 ? 'Harsh.' : 'Careful.'}`) });
    }
    if (F.dated.length >= 10) {
      const d = shuffle([...F.dated]); let a = null, b = null;
      for (let i = 0; i < d.length && !a; i++) for (let j = i + 1; j < d.length; j++) if (d[i].title !== d[j].title && Math.abs(new Date(d[i].date) - new Date(d[j].date)) > 60 * 864e5) { a = d[i]; b = d[j]; break; }
      if (a) { const first = new Date(a.date) < new Date(b.date) ? a : b;
        S.push({ kind: 'choice', id: 'g_first', guess: first.title, text: L('Lequel as-tu vu en premier ?', 'Which one did you watch first?'),
          options: shuffle([a, b]).map((f) => ({ v: f.title, label: f.title })), reply: (v) => L(`${v === first.title ? 'Bonne mémoire' : 'Mémoire de poisson'}. ${a.title} : ${date(a.date)}. ${b.title} : ${date(b.date)}.`, `${v === first.title ? 'Good memory' : 'Goldfish memory'}. ${a.title}: ${date(a.date)}. ${b.title}: ${date(b.date)}.`) }); }
    }
    {
      const pool = shuffle(F.shelf.filter((f) => yearOk(f.year))), trio = [];
      for (const f of pool) if (!trio.some((t) => t.year === f.year || t.title === f.title)) { trio.push(f); if (trio.length === 3) break; }
      if (trio.length === 3) { const o = [...trio].sort((a, b) => a.year - b.year)[0];
        S.push({ kind: 'choice', id: 'g_oldest', guess: o.title, text: L('Le plus vieux des trois ?', 'The oldest of the three?'),
          options: trio.map((f) => ({ v: f.title, label: f.title })), reply: () => L(`${trio.map((f) => `${f.title} (${f.year})`).join(', ')}.`, `${trio.map((f) => `${f.title} (${f.year})`).join(', ')}.`) }); }
    }
    // --- personnalisation : ne note rien, colore les répliques et la fiche ---
    S.push({ kind: 'choice', id: 'popcorn', text: L('Pop-corn ?', 'Popcorn?'),
      options: [{ v: 'sale', label: L('Salé, évidemment', 'Salted, obviously') }, { v: 'sucre', label: L('Sucré, et je l\'assume', 'Sweet, and proud of it') }, { v: 'rien', label: L('Rien. On ne mange pas devant un film', 'Nothing. You don\'t eat during a film') }],
      reply: (v) => ({ sale: L('Le choix de la raison.', 'The sensible choice.'), sucre: L('Un dessert de deux heures.', 'A two-hour dessert.'), rien: L('Un moine du septième art.', 'A monk of cinema.') })[v] });
    S.push({ kind: 'choice', id: 'credits', text: L('Le générique de fin, tu…', 'The end credits, you…'),
      options: [{ v: 'tout', label: L('Restes jusqu\'au bout', 'Stay until the very end') }, { v: 'scene', label: L('Attends la scène cachée', 'Wait for the hidden scene') }, { v: 'coupe', label: L('Coupes dès le noir', 'Cut at the first black frame') }],
      reply: (v) => ({ tout: L('Respect pour le troisième assistant décorateur.', 'Respect for the third assistant set dresser.'), scene: L('Marvel t\'a bien dressé.', 'Marvel trained you well.'), coupe: L('Le chef opérateur pleure quelque part.', 'A cinematographer is crying somewhere.') })[v] });
    S.push({ kind: 'choice', id: 'long', text: L('Un film de 3 h 20, ce soir ?', 'A 3 h 20 film, tonight?'),
      options: [{ v: 'oui', label: L('Carrément', 'Absolutely') }, { v: 'deux', label: L('En deux soirs', 'Over two nights') }, { v: 'non', label: L('Pas sans entracte', 'Not without an intermission') }],
      reply: (v) => ({ oui: L('Tu as dû aimer The Irishman.', 'You must have loved The Irishman.'), deux: L('Le film en kit. Les cinéastes adorent.', 'The flat-pack film. Directors love it.'), non: L('Une vessie honnête.', 'An honest bladder.') })[v] });
    S.push({ kind: 'choice', id: 'spoil', text: L('Avant de lancer un film, tu lis le résumé ?', 'Before starting a film, do you read the plot?'),
      options: [{ v: 'jamais', label: L('Jamais, même pas la bande-annonce', 'Never, not even the trailer') }, { v: 'tout', label: L('Tout, je déteste les surprises', 'All of it, I hate surprises') }],
      reply: (v) => (v === 'jamais' ? L('Le spectateur idéal. Ou un menteur.', 'The ideal viewer. Or a liar.') : L('Le suspense, très peu pour toi.', 'Suspense is not your thing.')) });

    // --- ordre : l'ouverture en premier, puis un tirage différent à chaque partie (une dizaine de questions, quelques constats),
    // jamais deux étapes du même genre à la suite ; la conclusion à la fin ---
    const intro = S.shift();
    const kind = (x) => (x.kind === 'say' ? 'say' : x.kind === 'duel' ? 'duel' : /^g_/.test(x.id || '') ? 'guess' : 'perso');
    const all = shuffle(S), asks = all.filter((x) => x.kind !== 'say');
    const pick = [...asks.filter((x) => kind(x) === 'duel').slice(0, 2), ...shuffle(asks.filter((x) => kind(x) === 'guess')).slice(0, 4), ...shuffle(asks.filter((x) => kind(x) === 'perso')).slice(0, 4)];
    // les questions mélangées sans deux du même genre à la suite, puis les constats intercalés à intervalles réguliers
    let seq = shuffle(pick);
    for (let i = 1; i < seq.length; i++) if (kind(seq[i]) === kind(seq[i - 1])) { const j = seq.findIndex((x, k) => k > i && kind(x) !== kind(seq[i - 1])); if (j > 0) [seq[i], seq[j]] = [seq[j], seq[i]]; }
    const says = all.filter((x) => x.kind === 'say').slice(0, 3);
    says.forEach((x, k) => seq.splice(Math.min(seq.length, Math.round(((k + 1) * (seq.length + k)) / (says.length + 1))), 0, x));
    return [intro, ...seq, { kind: 'say', text: L('On a assez de preuves. Voici ta fiche.', 'We have enough evidence. Here is your card.') }];
  }
  function duel([a, b], L) {
    return { kind: 'duel', id: `duel_${a.title}`, films: [a, b], text: L(`Même note, ${stars(a.rating)}. Tu ne peux en garder qu'un.`, `Same rating, ${stars(a.rating)}. You can only keep one.`),
      reply: (v) => { const lost = v === a.title ? b : a; return L(`Adieu, ${lost.title}. Tu ne t'en souviendras pas.`, `Farewell, ${lost.title}. You won't remember it.`); } };
  }

  // ---------- score : six axes sur 100, chacun avec la mesure qui le fonde ----------
  // Volume : films vus (courbe qui ralentit après 100). Exigence : moyenne, part des notes basses et hautes.
  // Plume : part de films critiqués, pondérée par la longueur des critiques. Fidélité : part de revisionnages du journal.
  // Curiosité : variété des décennies (entropie), part de films d'avant 1970, et un peu de déclaratif (VO, étranger).
  // Lucidité : justesse des réponses « devine » (graduée : se tromper de peu compte à moitié).
  function score(F, A, lang) {
    const L = (fr, en) => (lang === 'en' ? en : fr);
    const n = (v, d = 0) => v.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d });
    const pc = (v) => `${Math.round(v * 100)}${L(' %', '%')}`;
    const ease = (x, k) => 100 * (1 - Math.exp(-x * k));
    const g = Object.keys(A).filter((k) => k.startsWith('g_')), ok = g.reduce((a, k) => a + (A[k].ok || 0), 0);
    const share = (a, b) => (b ? a / b : 0);
    const ax = [
      { k: 'vol', w: 0.2, name: L('Volume', 'Volume'), v: F.total < 100 ? (F.total / 100) ** 0.7 * 50 : 50 + 15 * Math.log(F.total / 100 + 1),
        stat: L(`${n(F.total)} films vus`, `${n(F.total)} films seen`),
        lines: [L('Tu découvres encore.', 'Still discovering.'), L('Un vrai rythme de croisière.', 'A steady cruising pace.'), L('Tu vis dans le noir.', 'You live in the dark.')] },
      { k: 'exi', w: 0.15, name: L('Exigence', 'Standards'), v: F.avg == null ? 50 : 50 + (3.5 - F.avg) * 38 + (F.low - F.high) * 55,
        stat: F.avg == null ? L('aucune note', 'no ratings') : L(`moyenne ${n(F.avg, 1)} ★ · ${pc(F.low)} à 2 ★ ou moins`, `average ${n(F.avg, 1)} ★ · ${pc(F.low)} at 2 ★ or less`),
        lines: [L('Tout le monde a 4 étoiles chez toi.', 'Everyone gets 4 stars from you.'), L('Juste, la plupart du temps.', 'Fair, most of the time.'), L('Les réalisateurs te craignent.', 'Directors fear you.')] },
      { k: 'ecr', w: 0.1, name: L('Plume', 'Pen'), v: ease(share(F.reviews, F.total), 8) * (0.55 + 0.45 * Math.min(1, F.revLen / 320)),
        stat: F.reviews ? L(`${n(F.reviews)} critiques · ${n(Math.round(F.revLen))} signes en moyenne`, `${n(F.reviews)} reviews · ${n(Math.round(F.revLen))} characters on average`) : L('aucune critique', 'no reviews'),
        lines: [L('Tu notes, tu n\'écris pas.', 'You rate, you don\'t write.'), L('Une critique de temps en temps.', 'A review now and then.'), L('Un critique qui s\'ignore.', 'A critic in disguise.')] },
      { k: 'fid', w: 0.1, name: L('Fidélité', 'Loyalty'), v: ease(share(F.rewatches, F.diary), 9),
        stat: F.diary ? L(`${pc(share(F.rewatches, F.diary))} de revisionnages`, `${pc(share(F.rewatches, F.diary))} rewatches`) : L('pas de journal', 'no diary'),
        lines: [L('Jamais deux fois le même.', 'Never the same film twice.'), L('Quelques vieux amis.', 'A few old friends.'), L('Tu revois plus que tu ne vois.', 'You rewatch more than you watch.')] },
      { k: 'cur', w: 0.25, name: L('Curiosité', 'Curiosity'), v: F.entropy * 62 + Math.min(1, F.old * 4) * 18 + (A.foreign?.v ?? 3) / 10 * 12 + ({ vo: 8, mix: 4, vf: 0 }[A.vo?.v] ?? 4),
        stat: L(`${F.decs.length} décennies · ${pc(F.old)} d'avant 1970`, `${F.decs.length} decades · ${pc(F.old)} pre-1970`),
        lines: [L('Tu restes en terrain connu.', 'You stay on familiar ground.'), L('Tu sors un peu des sentiers.', 'You stray off the path a bit.'), L('Un explorateur du catalogue.', 'An explorer of the catalogue.')] },
      { k: 'luc', w: 0.2, name: L('Lucidité', 'Self-awareness'), v: g.length ? (ok / g.length) * 100 : 50,
        stat: g.length ? L(`${n(ok, ok % 1 ? 1 : 0)} sur ${g.length} au jeu des devinettes`, `${n(ok, ok % 1 ? 1 : 0)} out of ${g.length} at guessing`) : L('pas de devinette', 'no guesses'),
        lines: [L('Tu ne te connais pas du tout.', 'You don\'t know yourself at all.'), L('Tu te connais à moitié.', 'You half know yourself.'), L('Aucune illusion sur toi-même.', 'No illusions about yourself.')] },
    ].map((a) => { const v = Math.round(clamp(a.v)); return { ...a, v, line: a.lines[v < 40 ? 0 : v < 70 ? 1 : 2] }; });
    const total = Math.round(ax.reduce((s, a) => s + a.v * a.w, 0));
    const ranks = [[85, L('Cinémathèque ambulante', 'Walking film archive')], [70, L('Cinéphile assumé', 'Card-carrying cinephile')], [55, L('Habitué de la séance de 22 h', 'Late-show regular')], [40, L('Spectateur du dimanche', 'Sunday-night viewer')], [25, L('Abonné aux bandes-annonces', 'Trailer enthusiast')], [0, L('Touriste du multiplexe', 'Multiplex tourist')]];
    return { total, axes: ax, rank: ranks.find(([m]) => total >= m)[1] };
  }

  // ---------- verdict : trois phrases pour la fiche ----------
  function verdict(F, A, lang) {
    const L = (fr, en) => (lang === 'en' ? en : fr);
    const out = [];
    const place = { salle: L('la salle', 'the cinema'), canape: L('le canapé', 'the couch'), tel: L('le téléphone', 'the phone') }[A.place?.v];
    if (place) out.push(L(`Habitat naturel : ${place}${A.vo?.v === 'vf' ? ', en VF' : A.vo?.v === 'vo' ? ', en VO' : ''}.`, `Natural habitat: ${place}${A.vo?.v === 'vf' ? ', dubbed' : A.vo?.v === 'vo' ? ', subtitled' : ''}.`));
    if (F.heresy) out.push(L(`Coupable d'avoir mis ${stars(F.heresy.rating)} à ${F.heresy.title}.`, `Guilty of giving ${F.heresy.title} ${stars(F.heresy.rating)}.`));
    else if (F.unseenTop.length) out.push(L(`Toujours pas vu : ${pretty(pick(F.unseenTop))}.`, `Still hasn't seen: ${pretty(pick(F.unseenTop))}.`));
    const kept = Object.values(A).filter((x) => x.kept);
    if (kept[0]) out.push(L(`A sauvé ${kept[0].kept} et sacrifié ${kept[0].lost}.`, `Saved ${kept[0].kept}, sacrificed ${kept[0].lost}.`));
    else if (A.wl) out.push(A.wl.v === 'plan' ? L(`Croit encore finir sa watchlist de ${F.watchlist} films.`, `Still believes they will finish a ${F.watchlist}-film watchlist.`) : L(`A enterré ${F.watchlist} films dans sa watchlist.`, `Buried ${F.watchlist} films in their watchlist.`));
    if (out.length < 3 && A.credits?.v === 'coupe') out.push(L('Coupe avant le générique.', 'Leaves before the credits.'));
    if (out.length < 3 && A.popcorn) out.push(({ sale: L('Pop-corn salé.', 'Salted popcorn.'), sucre: L('Pop-corn sucré, assumé.', 'Sweet popcorn, unashamed.'), rien: L('Ne mange rien devant un film.', 'Eats nothing during a film.') })[A.popcorn.v]);
    return out.slice(0, 3);
  }

  // ---------- profil exemple ----------
  function demo() {
    const T = [['The Godfather', 1972], ['Pulp Fiction', 1994], ['Parasite', 2019], ['Spirited Away', 2001], ['Seven Samurai', 1954], ['In the Mood for Love', 2000], ['Interstellar', 2014], ['Fight Club', 1999], ['The Dark Knight', 2008], ['Amélie', 2001], ['La Haine', 1995], ['Portrait of a Lady on Fire', 2019], ['Barbie', 2023], ['Oppenheimer', 2023], ['Dune: Part Two', 2024], ['Everything Everywhere All at Once', 2022], ['Whiplash', 2014], ['Inception', 2010], ['The Matrix', 1999], ['Goodfellas', 1990], ['Se7en', 1995], ['Paddington 2', 2017], ['Mad Max: Fury Road', 2015], ['Le Samouraï', 1967], ['Stalker', 1979], ['Mulholland Drive', 2001], ['Aftersun', 2022], ['Past Lives', 2023], ['Fast X', 2023], ['Cats', 2019], ['Shrek 2', 2004], ['The Room', 2003], ['Titanic', 1997], ['Jaws', 1975], ['Alien', 1979], ['Metropolis', 1927], ['Breathless', 1960], ['Perfect Days', 2023], ['Anatomy of a Fall', 2023], ['Ratatouille', 2007]];
    const R = [5, 5, 4.5, 5, 4, 4.5, 4, 2.5, 4.5, 3.5, 4.5, 5, 3, 3.5, 4.5, 4, 4.5, 2, 4, 4.5, 3.5, 5, 4.5, 4, 3.5, 4, 5, 4.5, 1, 0.5, 4, 1.5, 3, 4, 4.5, 3.5, 3.5, 4.5, 4, 4.5];
    const ratings = T.map(([t, y], i) => ({ title: t, year: String(y), uri: '', rating: R[i] }));
    const diary = []; const d0 = new Date(Date.now() - 400 * 864e5);
    for (let i = 0; i < 180; i++) { const f = ratings[i % ratings.length], d = new Date(d0.getTime() + i * 2.2 * 864e5); diary.push({ ...f, rewatch: i >= ratings.length && (f.title === 'Paddington 2' || f.title === 'Shrek 2' || i % 9 === 0), date: d.toISOString().slice(0, 10) }); }
    for (let i = 0; i < 5; i++) diary.push({ ...ratings[30 + i], rewatch: false, date: diary[120].date });
    const watched = Array.from({ length: 420 }, (_, i) => ({ title: `Film ${i}`, year: String(1950 + (i % 74)), uri: `x/film-${i}/`, rating: null })).concat(ratings);
    return { username: 'exemple', diary, ratings, watched, watchlist: Array.from({ length: 187 }, (_, i) => ({ title: `W${i}` })),
      reviews: [{ title: 'Cats', year: '2019', rating: 0.5, text: 'J\'ai vu des choses que je ne peux pas oublier.' }, { title: 'Interstellar', year: '2014', rating: 4, text: 'Le temps est relatif, la durée du film aussi.' }] };
  }

  // ---------- affiches : image principale de l'article Wikipédia du film (API ouverte, sans clé) ----------
  // Seuls le titre et l'année des films en duel sont envoyés ; rien d'autre ne quitte le navigateur.
  const posters = {};
  function poster(title, year) {
    const k = `${title}|${year}`;
    if (!posters[k]) {
      // pilicense=any : les affiches sont des images non libres, écartées par défaut
      const q = (s) => `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=3&gsrsearch=${encodeURIComponent(s)}&prop=pageimages&piprop=thumbnail&pithumbsize=500&pilicense=any`;
      const norm = (x) => slug(x).replace(/-/g, '');
      // on ne garde que l'article dont le titre est celui du film (« Paddington 2 », « Paddington 2 (film) ») : mieux vaut pas d'affiche qu'une mauvaise
      const find = (s) => fetch(q(s)).then((r) => r.json()).then((j) => {
        const pages = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index);
        const hit = pages.find((p) => p.thumbnail && norm(p.title.replace(/\s*\(.*\)$/, '')) === norm(title));
        return hit ? hit.thumbnail.source : null;
      });
      posters[k] = find(`${title} ${year} film`).then((u) => u || find(`${title} film`)).catch(() => null);
    }
    return posters[k];
  }

  // ---------- à deux : compatibilité de deux exports ----------
  // films communs (par lien Letterboxd, sinon titre + année), accord des notes, plus grands désaccords, coups de cœur partagés,
  // recommandations croisées (adoré par l'un, jamais vu par l'autre), qui est le plus sévère, le plus curieux
  function duo(A, B, lang) {
    const L = (fr, en) => (lang === 'en' ? en : fr);
    const key = (f) => (f.uri ? uriSlug(f.uri) : `${slug(f.title)}-${f.year}`);
    const seen = (raw) => { const m = new Map(); for (const f of [...raw.watched, ...raw.ratings, ...raw.diary]) if (f.title) m.set(key(f), { ...m.get(key(f)), ...f }); return m; };
    const rated = (raw) => { const m = new Map(); for (const f of (raw.ratings.length ? raw.ratings : raw.diary)) if (f.rating != null) m.set(key(f), f); return m; };
    const sa = seen(A), sb = seen(B), ra = rated(A), rb = rated(B);
    const common = [...sa.keys()].filter((k) => sb.has(k));
    const both = [...ra.keys()].filter((k) => rb.has(k)).map((k) => ({ f: ra.get(k), a: ra.get(k).rating, b: rb.get(k).rating }));
    const agree = both.length ? both.filter((x) => Math.abs(x.a - x.b) <= 0.5).length / both.length : 0;
    // corrélation des notes communes (si assez de films), mêlée à l'accord simple et à la part de films en commun
    let corr = 0;
    if (both.length >= 5) { const ma = both.reduce((s, x) => s + x.a, 0) / both.length, mb = both.reduce((s, x) => s + x.b, 0) / both.length; let n = 0, da = 0, db = 0; for (const x of both) { n += (x.a - ma) * (x.b - mb); da += (x.a - ma) ** 2; db += (x.b - mb) ** 2; } corr = da && db ? n / Math.sqrt(da * db) : 0; }
    const overlap = common.length / Math.max(1, Math.min(sa.size, sb.size));
    const comp = Math.round(clamp(agree * 45 + Math.max(0, corr) * 35 + Math.min(1, overlap * 2) * 20));
    const fights = [...both].sort((x, y) => Math.abs(y.a - y.b) - Math.abs(x.a - x.b)).filter((x) => Math.abs(x.a - x.b) >= 1.5).slice(0, 3);
    const loved = shuffle(both.filter((x) => x.a >= 4.5 && x.b >= 4.5)).slice(0, 3);
    const recoAB = shuffle([...ra.values()].filter((f) => f.rating >= 4.5 && !sb.has(key(f)))).slice(0, 3); // à montrer à B
    const recoBA = shuffle([...rb.values()].filter((f) => f.rating >= 4.5 && !sa.has(key(f)))).slice(0, 3); // à montrer à A
    const avg = (m) => { const v = [...m.values()].map((f) => f.rating); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
    const FA = facts(A), FB = facts(B);
    const na = A.username || L('toi', 'you'), nb = B.username || L('l\'autre', 'the other');
    const verdict = comp >= 75 ? L('Même canapé, même plaid.', 'Same couch, same blanket.') : comp >= 55 ? L('Compatibles, avec quelques disputes au générique.', 'Compatible, with a few fights at the credits.') : comp >= 35 ? L('Une séance sur deux ensemble.', 'Every other screening together.') : L('Séances séparées conseillées.', 'Separate screenings recommended.');
    return {
      na, nb, comp, verdict, common: common.length, both: both.length, agree: Math.round(agree * 100),
      harsher: avg(ra) != null && avg(rb) != null ? (avg(ra) < avg(rb) ? na : nb) : null, avgA: avg(ra), avgB: avg(rb),
      curious: FA.entropy === FB.entropy ? null : FA.entropy > FB.entropy ? na : nb,
      fights, loved, recoAB, recoBA, totalA: FA.total, totalB: FB.total,
    };
  }
  // deuxième profil exemple : mêmes goûts de base, quelques désaccords francs et d'autres films
  function demo2() {
    const d = demo(); const swap = { 'Inception': 5, 'Barbie': 4.5, 'Cats': 3, 'Parasite': 2.5, 'Interstellar': 5, 'Fast X': 4, 'Whiplash': 3, 'Stalker': 1.5 };
    const tweak = (f) => (swap[f.title] != null ? { ...f, rating: swap[f.title] } : f);
    const extra = [['Top Gun: Maverick', 2022, 5], ['The Grand Budapest Hotel', 2014, 4.5], ['Drive', 2011, 4.5], ['Arrival', 2016, 5]].map(([t, y, r]) => ({ title: t, year: String(y), uri: '', rating: r }));
    const gone = (f) => !['Metropolis', 'Le Samouraï', 'Breathless', 'Aftersun', 'Spirited Away', 'Portrait of a Lady on Fire'].includes(f.title);
    return { username: 'ami·e', diary: d.diary.filter(gone).map(tweak), ratings: [...d.ratings.filter(gone).map(tweak), ...extra], watched: d.watched.slice(80).filter(gone), watchlist: d.watchlist.slice(0, 40), reviews: [] };
  }

  window.LR = { read, demo, demo2, facts, script, score, verdict, stars, poster, duo };
})();
