// CV ([lang]/cv.astro) : un terminal. À l'ouverture, la session se rejoue (le CV écrit dans la page est retapé) ; ensuite on
// tape ses commandes (help, ls, cat…). Tout s'arrête au départ de la page (attentes en cours abandonnées).
import { onPage } from '../page';
import { reduced } from '../motion';
import { navigate } from 'astro:transitions/client';
import { esc } from '../../data/text';

onPage('[data-term]', (ctx) => {
  type D = { lang: string; other: string; full: string; ui: Record<string, string>; sections: { id: string; cmd: string[]; html: string }[] };
  const root = document.querySelector<HTMLElement>('[data-term]')!;
  const d: D = JSON.parse(root.dataset.cv!);
  const out = root.querySelector<HTMLElement>('[data-out]')!;
  const form = root.querySelector<HTMLFormElement>('[data-form]')!;
  const input = root.querySelector<HTMLInputElement>('[data-in]')!;
  const PS = 'xavier@kerningkastle ~ %';
  const still = reduced();
  // attente rattachée à la page : au départ, elle ne se termine jamais (la session en cours s'arrête là)
  const wait = (ms: number) => new Promise((r) => ctx.timeout(() => r(0), still ? 0 : ms));
  let busy = false;
  const hist: string[] = []; let hi = 0;

  // une sortie arrive ligne par ligne (bloc par bloc)
  // on ne suit pas le texte jusqu'en bas : la commande reste en haut de l'écran et la réponse se lit depuis son début
  let anchor: HTMLElement | null = null;
  const follow = () => {
    const a = anchor ? anchor.offsetTop - out.offsetTop - 12 : Infinity;
    out.scrollTop = Math.min(out.scrollHeight - out.clientHeight, a);
  };
  // chaque ligne « s'écrit » (balayage de gauche à droite) ; ce qui tombe sous le bord de l'écran attend
  // d'être atteint par le défilement pour s'écrire à son tour : on lit à son rythme, rien ne file sans nous
  const write = (el: Element) => {
    el.classList.remove('t-wait');
    if (!still) el.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 260, easing: 'steps(18, end)' });
  };
  const queue: Element[] = []; let qt = 0;
  const pump = () => { const el = queue.shift(); if (el) { write(el); qt = ctx.timeout(pump, 45); } else qt = 0; };
  const io = ctx.observe(new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target); queue.push(e.target);
    if (!qt) pump();
  }), { root: out, rootMargin: '0px 0px -24px 0px' }));
  async function print(html: string, gap = 40) {
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    let held = false;
    for (const el of [...tmp.children]) {
      out.appendChild(el); follow();
      if (!held && el.getBoundingClientRect().top < out.getBoundingClientRect().bottom - 24) { write(el); await wait(gap); }
      else { held = true; el.classList.add('t-wait'); io.observe(el); }
    }
  }
  const pin = (p: HTMLElement) => { anchor = p; follow(); };
  async function typeCmd(cmd: string) {
    const p = document.createElement('p'); p.className = 't-cmd';
    p.innerHTML = `<span class="ps">${PS}</span> <span class="typing"></span>`;
    out.appendChild(p); pin(p);
    const t = p.querySelector('.typing')!;
    for (const ch of cmd) { t.textContent += ch; await wait(38 + Math.random() * 40); }
    await wait(160); t.classList.remove('typing');
    return p;
  }
  const echo = (cmd: string) => { const p = document.createElement('p'); p.className = 't-cmd'; p.innerHTML = `<span class="ps">${PS}</span> ${esc(cmd)}`; out.appendChild(p); return p; };

  const helpHtml = () => `<p class="t-h">## ${d.ui.help}</p>` + [
    ...d.sections.map((s) => [s.cmd[0], s.cmd.slice(1).join(', ')]),
    ['cv', 'cat cv.txt'], ['ls', ''], ['lang', d.ui.lang], ['clear', ''], ['exit', d.ui.back],
  ].map(([k, v]) => `<p class="t-e"><span class="t-d">${k}</span><span class="t-m">${v}</span></p>`).join('');

  async function run(raw: string, typed = false) {
    const line = raw.trim(); if (busy) return;
    busy = true;
    pin(typed ? await typeCmd(line) : echo(line));
    const [cmd0, ...args] = line.split(/\s+/); const cmd = (cmd0 || '').toLowerCase().replace(/^\.\//, '');
    const file = (args[0] || '').toLowerCase().replace(/\.txt$/, '');
    const sec = d.sections.find((s) => s.cmd.includes(cmd) || (cmd === 'cat' && s.cmd.includes(file)));
    if (!cmd) { /* ligne vide */ }
    else if (sec) await print(sec.html);
    else if (cmd === 'help' || cmd === '?' || cmd === 'man') await print(helpHtml(), 8);
    else if (cmd === 'cv' || (cmd === 'cat' && file === 'cv')) await print(d.full);
    else if (cmd === 'ls') await print(`<p class="t-p">cv.txt  ${d.sections.map((s) => `${s.cmd[0]}.txt`).join('  ')}</p>`);
    else if (cmd === 'clear') { queue.length = 0; out.innerHTML = ''; }
    else if (cmd === 'pwd') await print('<p class="t-p">/home/xavier/kerningkastle</p>');
    else if (cmd === 'date') await print(`<p class="t-p">${new Date().toString()}</p>`);
    else if (cmd === 'echo') await print(`<p class="t-p">${esc(args.join(' '))}</p>`);
    else if (cmd === 'sudo') await print(`<p class="t-p t-err">${d.ui.sudo}</p>`);
    else if (cmd === 'lang') { navigate(`/${d.other}/cv/`); return; }
    else if (cmd === 'exit' || cmd === 'quit' || cmd === 'logout') { await print(`<p class="t-p t-m">${d.ui.bye}</p>`); await wait(500); navigate(`/${d.lang}/`); return; }
    else await print(`<p class="t-p t-err">zsh: ${d.ui.unknown}: ${esc(cmd0)}</p>`);
    busy = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value; input.value = '';
    if (v.trim()) { hist.push(v); hi = hist.length; }
    run(v);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hi > 0) { e.preventDefault(); input.value = hist[--hi]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] ?? ''; }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const all = ['help', 'cv', 'ls', 'clear', 'lang', 'exit', ...d.sections.flatMap((s) => s.cmd)];
      const m = all.filter((k) => k.startsWith(input.value.toLowerCase()));
      if (m.length === 1) input.value = m[0];
      else if (m.length > 1 && input.value) print(`<p class="t-p t-m">${m.join('  ')}</p>`);
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  root.querySelectorAll<HTMLButtonElement>('[data-cmd]').forEach((b) => b.addEventListener('click', () => { run(b.dataset.cmd!, true); input.focus({ preventScroll: true }); }));
  // un clic dans le terminal (hors lien / sélection) redonne la main au clavier
  out.addEventListener('click', (e) => { if (!(e.target as Element).closest('a') && !String(getSelection())) input.focus({ preventScroll: true }); });

  // ouverture : la session se rejoue (le CV écrit dans la page est remplacé par la même chose, tapée)
  (async () => {
    if (still) { input.focus({ preventScroll: true }); return; }
    busy = true; out.innerHTML = '';
    const now = new Date();
    await print(`<p class="t-p t-m">${d.ui.boot}: ${now.toDateString()} ${now.toTimeString().slice(0, 8)} on ttys001</p>`, 0);
    await wait(380);
    busy = false; await run('cat cv.txt', true);
    await print(`<p class="t-p t-m" style="margin-top:22px">— ${d.ui.hint}</p>`, 0);
    input.focus({ preventScroll: true });
  })();
});
