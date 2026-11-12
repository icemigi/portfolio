// Version statique du quiz pour le Lab (GitHub Pages n'exécute pas de serveur) :
// les routes /api/* du serveur Express d'origine sont rejouées ici, dans le navigateur.
// Questions : questions.json (export de quiz.db) ; classement : propre à ce navigateur (localStorage).
(() => {
  const real = window.fetch.bind(window);
  let Q = null;
  const load = () => (Q ??= real('questions.json').then((r) => r.json()).then((rows) => new Map(rows.map((q) => [q.id, q]))));
  const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
  const lev = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };
  const store = { get: (k, v) => { try { return JSON.parse(localStorage.getItem(k)) ?? v; } catch { return v; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* */ } } };
  const P = (s, v = []) => { try { return JSON.parse(s ?? JSON.stringify(v)); } catch { return v; } };

  async function question(url) {
    const p = url.searchParams, seen = P(p.get('seenIds')), diffs = P(p.get('difficulties')), themes = P(p.get('themes')), types = P(p.get('types'));
    if (!diffs.length) return json({ error: 'Aucune difficulté sélectionnée.' }, 400);
    if (!themes.length) return json({ error: 'Aucun thème sélectionné.' }, 400);
    if (!types.length) return json({ error: 'Aucun type de question sélectionné.' }, 400);
    const all = [...(await load()).values()].filter((q) => diffs.map(String).includes(String(q.difficulty)) && themes.includes(String(q.theme).toLowerCase()) && types.includes(String(q.type).toLowerCase()) && !seen.includes(q.id));
    if (!all.length) return json({ error: 'Aucune question ne correspond à vos filtres ou vous avez épuisé la base !' }, 404);
    let q;
    if (p.get('daily')) {
      // défi du jour : les questions (hors réponse libre, trop sensible à l'orthographe) dans un ordre tiré d'après la date
      let h = 2166136261; for (const c of p.get('daily')) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
      const rnd = () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const pool = [...(await load()).values()].filter((x) => x.type !== 'text' && x.difficulty <= 4).sort((a, b) => String(a.id).localeCompare(String(b.id)));
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      q = pool[(Number(p.get('n')) || 0) % pool.length];
    } else q = all[Math.floor(Math.random() * all.length)];
    return json({ id: q.id, theme: q.theme, difficulty: q.difficulty, type: q.type, question_text: q.question_text, min_val: q.min_val, min_label: q.min_label, max_val: q.max_val, max_label: q.max_label, targetValue: q.targetValue, flag_code: q.flag_code, options: q.options ? JSON.parse(q.options) : null });
  }

  async function validate(body) {
    const { questionId, userAnswer, isTimeout, isCheat } = body;
    if (!questionId) return json({ error: 'ID requis.' }, 400);
    const q = (await load()).get(questionId);
    if (!q) return json({ error: 'Question introuvable.' }, 404);
    if (isCheat || isTimeout) {
      let solution = q.correct_answer;
      if (q.type === 'slider') solution = q.targetValue;
      if (q.type === 'order') { try { solution = JSON.parse(q.correct_answer).join(' ➔ '); } catch { /* */ } }
      const feedback = isCheat ? `Tu as changé d'onglet. La bonne réponse était : ${solution}.` : `Temps écoulé. La bonne réponse était : ${solution}.`;
      return json({ isCorrect: false, feedback, scoreMultiplier: 0, targetValue: q.type === 'slider' ? q.targetValue : q.type === 'map_pin' ? q.correct_answer : undefined, tierColor: 'red' });
    }
    const ans = String(userAnswer ?? '').trim().toLowerCase();
    if (ans === '' && q.type !== 'slider') return json({ isCorrect: false, feedback: `Réponse vide ! La bonne réponse était : ${q.correct_answer}.`, scoreMultiplier: 0, tierColor: 'red' });
    if (q.type === 'map_pin') {
      const target = String(q.correct_answer || '').trim().toLowerCase(), ok = ans === target;
      return json({ isCorrect: ok, feedback: ok ? "Bien joué, c'est le bon pays !" : 'Raté ! Il fallait cliquer sur le bon pays.', scoreMultiplier: ok ? 1.2 : 0, targetValue: target, tierColor: ok ? 'green' : 'red' });
    }
    if (q.type === 'slider') {
      const target = q.targetValue, v = parseFloat(ans);
      if (isNaN(v)) return json({ isCorrect: false, feedback: `La saisie est invalide. La réponse attendue était : ${target}.`, scoreMultiplier: 0, targetValue: target, tierColor: 'red' });
      const amp = q.max_val - q.min_val, dist = Math.abs(v - target), err = amp > 0 ? dist / amp : 0;
      let ok = true, m = 1, c = 'red', f;
      if (dist === 0) { m = 2; c = 'green'; f = `Pile dans le mille ! La réponse exacte était bien ${target}.`; }
      else if (err <= 0.02) { m = 1.8; c = 'green'; f = `Tu y es presque ! La réponse exacte était ${target}.`; }
      else if (err <= 0.05) { m = 1.5; c = 'yellow'; f = `Bien joué, tu es très proche ! C'était ${target}.`; }
      else if (err <= 0.09) { m = 1; c = 'orange'; f = `C'est un peu décalé, mais je te l'accorde ! La valeur exacte était ${target}.`; }
      else { ok = false; f = `C'est trop éloigné... La bonne réponse était : ${target}.`; }
      return json({ isCorrect: ok, feedback: f, scoreMultiplier: ok ? m : 0, targetValue: target, tierColor: c });
    }
    if (q.type === 'text') {
      const t = String(q.correct_answer || '').trim().toLowerCase(), d = lev(ans, t), ok = d <= (t.length > 5 ? 2 : 1);
      return json({ isCorrect: ok, feedback: ok ? (d === 0 ? 'Excellent, c\'est la bonne réponse !' : `Validé malgré une petite faute de frappe ! La réponse était : ${q.correct_answer}.`) : `Ce n'est pas ça. La bonne réponse était : ${q.correct_answer}.`, scoreMultiplier: ok ? 1 : 0, tierColor: ok ? 'green' : 'red' });
    }
    if (q.type === 'order') {
      let exp, usr;
      try { exp = JSON.parse(q.correct_answer); usr = typeof userAnswer === 'string' ? JSON.parse(userAnswer) : userAnswer; } catch { return json({ isCorrect: false, feedback: 'Le format transmis est invalide.', scoreMultiplier: 0, tierColor: 'red' }); }
      const ok = JSON.stringify(exp) === JSON.stringify(usr);
      return json({ isCorrect: ok, feedback: ok ? "Bravo, l'ordre est parfait !" : `Ce n'est pas le bon ordre. Il fallait classer ainsi : ${Array.isArray(exp) ? exp.join(' ➔ ') : exp}.`, scoreMultiplier: ok ? 1.5 : 0, tierColor: ok ? 'green' : 'red' });
    }
    const ok = ans === String(q.correct_answer || '').trim().toLowerCase();
    return json({ isCorrect: ok, feedback: ok ? 'Bonne réponse !' : `Raté ! La bonne réponse était : ${q.correct_answer}.`, scoreMultiplier: ok ? 1 : 0, tierColor: ok ? 'green' : 'red', correct: q.correct_answer });
  }

  window.fetch = (input, init = {}) => {
    const u = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!/\/api\/(question|validate|score|leaderboard)$/.test(u.pathname)) return real(input, init);
    const route = u.pathname.split('/').pop(), body = init.body ? JSON.parse(init.body) : {};
    if (route === 'question') return question(u);
    if (route === 'validate') return validate(body);
    if (route === 'score') { const s = store.get('squiz-scores', []); s.push({ username: body.username, score: body.score, mode: body.mode || 'infini', created_at: new Date().toISOString() }); store.set('squiz-scores', s.sort((a, b) => b.score - a.score).slice(0, 50)); return json({ success: true }); }
    const mode = u.searchParams.get('mode');
    return json(store.get('squiz-scores', []).filter((s) => !mode || s.mode === mode).sort((a, b) => b.score - a.score).slice(0, 10));
  };
})();
