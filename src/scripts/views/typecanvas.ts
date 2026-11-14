// Type modulaire (TypeCanvas.astro) : lettres en modules 5 × 7 qui réagissent au curseur ; dans la salle du Lab, on tape son mot,
// on change de famille de modules, on enregistre en PNG ou SVG.
import { onPage } from '../page';
import { reduced as isReduced } from '../motion';

onPage('canvas.type-canvas', (page) => {
  // Glyphes 5 × 7 (1 = module plein)
  // Glyphes 5 × 7 (1 = module plein) : alphabet complet, chiffres et ponctuation courante
  const GLYPHS: Record<string, string[]> = {
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    J: ['00111', '00001', '00001', '00001', '00001', '10001', '01110'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    0: ['01110', '10011', '10101', '10101', '10101', '11001', '01110'],
    1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
    '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
    '.': ['00000', '00000', '00000', '00000', '00000', '00000', '00100'],
    ',': ['00000', '00000', '00000', '00000', '00100', '00100', '01000'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
    "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
    '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
    '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  };

  // x, y : place visée ; cx, cy : place dessinée (glisse vers la visée) ; v : présence du module (0 = point de trame, 1 = module)
  type Cell = { key: string; x: number; y: number; cx: number; cy: number; on: boolean; seed: number; t: number; v: number };

  function hash(n: number) {
    let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
    x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
    return x >>> 0;
  }

  function init(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const base = (canvas.dataset.text || 'KERNINGKASTLE').toUpperCase();
    let text = base, typed = false, family = -1; // family : -1 = mélange (graine), 0..3 = une seule famille de modules
    let reach = 5.5, wave = false; // portée du curseur (en modules) ; onde qui traverse les modules
    const FAMILY = ['mixte', 'cercles', 'quarts', 'diagonales', 'carrés'];
    const reduced = isReduced();

    let W = 0, H = 0, s = 0;
    let cells: Cell[] = [];
    let colors = { bg: '#fff', fg: '#000', accent: '#ff8800' };
    const pointer = { x: -9999, y: -9999, active: false };
    let visible = true;
    let running = false;
    let t0 = performance.now();

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      colors = {
        bg: cs.getPropertyValue('--bg').trim() || '#fff',
        fg: cs.getPropertyValue('--fg').trim() || '#000',
        accent: cs.getPropertyValue('--accent').trim() || '#ff8800',
      };
    }

    function layout() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Une ligne si le format est large, sinon coupure KERNING / KASTLE
      const lines = text.includes('\n') ? text.split('\n') : W / H > 2.2 || text.length < 9 ? [text] : splitText(text);
      // data-cols : force une largeur commune (aligner KERNING et KASTLE sur la même grille)
      const maxLen = Math.max(Number(canvas.dataset.cols) || 0, ...lines.map((l) => l.length));
      const align = canvas.dataset.align || 'center';
      const cols = maxLen * 6 - 1;
      const rows = lines.length * 8 - 1;
      const pad = Math.min(W, H) * (Number(canvas.dataset.cols) ? 0.02 : 0.08);
      s = Math.floor(Math.min((W - pad * 2) / cols, (H - pad * 2) / rows));
      const lineW = (l: string) => (l.length * 6 - 1) * s;
      const left = Math.round((W - cols * s) / 2);
      const oy = Math.round((H - rows * s) / 2);

      // les modules gardent leur état d'une composition à l'autre : ils glissent à leur nouvelle place, apparaissent ou s'effacent
      const prev = new Map(cells.map((c) => [c.key, c]));
      cells = [];
      let id = 0;
      lines.forEach((line, li) => {
        const ox = align === 'left' ? left : align === 'right' ? left + cols * s - lineW(line) : Math.round((W - lineW(line)) / 2);
        [...line].forEach((ch, ci) => {
          const g = GLYPHS[ch] || GLYPHS[' '];
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 5; c++) {
              const key = `${li}:${ci}:${r}:${c}`, o = prev.get(key), x = ox + (ci * 6 + c) * s, y = oy + (li * 8 + r) * s;
              cells.push({ key, x, y, cx: o ? o.cx : x, cy: o ? o.cy : y, on: g[r][c] === '1', seed: o ? o.seed : hash(++id), t: o ? o.t : 0, v: o ? o.v : reduced ? (g[r][c] === '1' ? 1 : 0) : 0 });
            }
          }
        });
      });
      readColors();
      draw();
    }

    function splitText(str: string) {
      if (str === 'KERNINGKASTLE') return ['KERNING', 'KASTLE'];
      const sp = str.indexOf(' ', Math.floor(str.length / 3)); if (sp > 0) return [str.slice(0, sp), str.slice(sp + 1)];
      const mid = Math.ceil(str.length / 2);
      return [str.slice(0, mid), str.slice(mid)];
    }

    function ghost(now: number) {
      // Point fantôme : courbe de Lissajous lente
      const k = (now - t0) / 1000;
      pointer.x = W * (0.5 + 0.38 * Math.sin(k * 0.45));
      pointer.y = H * (0.5 + 0.3 * Math.sin(k * 0.71 + 1.3));
    }

    function step(now: number) {
      if (!pointer.active && !reduced) ghost(now);
      const R = s * reach, k = now / 1000;
      let moving = false;
      for (const cell of cells) {
        // présence (apparition / effacement) et glissement vers la nouvelle place
        const v = cell.v + ((cell.on ? 1 : 0) - cell.v) * 0.16, cx = cell.cx + (cell.x - cell.cx) * 0.18, cy = cell.cy + (cell.y - cell.cy) * 0.18;
        if (Math.abs(v - cell.v) > 0.002 || Math.abs(cx - cell.cx) > 0.1 || Math.abs(cy - cell.cy) > 0.1) moving = true;
        cell.v = Math.abs(v - (cell.on ? 1 : 0)) < 0.002 ? (cell.on ? 1 : 0) : v; cell.cx = cx; cell.cy = cy;
        if (!cell.on) continue;
        const dx = cell.cx + s / 2 - pointer.x;
        const dy = cell.cy + s / 2 - pointer.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        let target = reduced && !pointer.active ? 0 : Math.max(0, 1 - d / R);
        // onde : une vague diagonale qui traverse les modules
        if (wave && !reduced) target = Math.max(target, Math.pow(0.5 + 0.5 * Math.sin(k * 2.2 - (cell.cx + cell.cy) / (s * 7)), 3));
        const next = cell.t + (target - cell.t) * 0.14;
        if (Math.abs(next - cell.t) > 0.0005) moving = true;
        cell.t = next;
      }
      return moving || wave;
    }

    function drawModule(cell: Cell) {
      const { cx: x, cy: y, t, seed, v } = cell;
      const c = ctx!;
      c.fillStyle = t > 0.55 ? colors.accent : colors.fg;
      c.save();
      c.translate(x + s / 2, y + s / 2);
      if (v < 1) c.scale(v, v);
      if (t < 0.08) { c.fillRect(-s / 2, -s / 2, s, s); c.restore(); return; }
      const rot = (seed % 4) * (Math.PI / 2);
      c.rotate(rot);
      switch (family < 0 ? (seed >>> 3) % 4 : [1, 0, 2, 3][family]) {
        case 0: { // quart de cercle
          c.beginPath();
          c.moveTo(-s / 2, -s / 2);
          c.arc(-s / 2, -s / 2, s * (1 - t * 0.25), 0, Math.PI / 2);
          c.closePath(); c.fill(); break;
        }
        case 1: { // cercle qui se resserre
          c.beginPath();
          c.arc(0, 0, (s / 2) * (1 - t * 0.55), 0, Math.PI * 2);
          c.fill(); break;
        }
        case 2: { // demi-carré diagonal
          c.beginPath();
          c.moveTo(-s / 2, -s / 2); c.lineTo(s / 2, -s / 2); c.lineTo(-s / 2, s / 2);
          c.closePath(); c.fill(); break;
        }
        default: { // carré qui pivote et rétrécit
          const k = s * (1 - t * 0.5);
          c.rotate(t * Math.PI / 4);
          c.fillRect(-k / 2, -k / 2, k, k);
        }
      }
      c.restore();
    }

    function draw() {
      const c = ctx!;
      c.fillStyle = colors.bg;
      c.fillRect(0, 0, W, H);
      // trame de points sur les cellules vides
      c.fillStyle = colors.fg;
      c.globalAlpha = 0.18;
      const dot = Math.max(1, s * 0.06);
      for (const cell of cells) if (cell.v < 0.6) c.fillRect(cell.cx + s / 2 - dot / 2, cell.cy + s / 2 - dot / 2, dot, dot);
      c.globalAlpha = 1;
      for (const cell of cells) if (cell.v > 0.02) drawModule(cell);
    }

    function loop(now: number) {
      const moving = step(now);
      draw();
      if (visible && (moving || (!pointer.active && !reduced))) page.raf(loop);
      else running = false;
    }
    function kick() {
      if (!running && visible) { running = true; page.raf(loop); }
    }

    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
      kick();
    });
    canvas.addEventListener('pointerleave', () => { pointer.active = false; t0 = performance.now(); kick(); });

    page.observe(new ResizeObserver(() => { layout(); kick(); })).observe(canvas);
    page.observe(new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) kick();
    })).observe(canvas);
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); draw(); }, { signal: page.signal });
    page.observe(new MutationObserver(() => { readColors(); draw(); })).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // clavier (salle du Lab : data-edit) : on tape son propre mot ; retour arrière efface ; Échap revient au mot de départ
    if (canvas.hasAttribute('data-edit')) {
      addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const k = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        const lines = text.split('\n'), last = lines[lines.length - 1];
        if (k === 'Escape') { text = base; typed = false; }
        else if (k === 'Backspace') { text = typed ? text.slice(0, -1) : ''; typed = true; }
        else if (k === 'Enter') { if (!typed || lines.length >= 4 || !last) return; text += '\n'; }
        else if (k.length === 1 && GLYPHS[k] && k !== ' ' || (k === ' ' && typed)) { if (typed && last.length >= 14) return; text = (typed ? text : '') + k; typed = true; }
        else return;
        e.preventDefault(); layout(); kick();
        canvas.dispatchEvent(new CustomEvent('type:change', { detail: { text } }));
      }, { signal: page.signal });
      // clic : famille de modules suivante
      canvas.addEventListener('click', () => { family = family >= 3 ? -1 : family + 1; draw(); canvas.dispatchEvent(new CustomEvent('type:family', { detail: { name: FAMILY[family + 1] } })); });
      // molette au-dessus du texte : portée du curseur (de 2 à 14 modules)
      canvas.addEventListener('wheel', (e) => { e.preventDefault(); reach = Math.max(2, Math.min(14, reach - Math.sign(e.deltaY) * 0.5)); canvas.dispatchEvent(new CustomEvent('type:family', { detail: { name: `portée ${reach.toFixed(1).replace('.0', '')}` } })); kick(); }, { passive: false });
      // onde : une vague traverse les modules, sans curseur
      canvas.addEventListener('type:wave', () => { wave = !wave; canvas.dispatchEvent(new CustomEvent('type:wavestate', { detail: { on: wave } })); kick(); });
      // SVG vectoriel : la composition telle qu'elle est à l'écran
      canvas.addEventListener('type:svg', () => {
        const f = (n: number) => +n.toFixed(2);
        let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}"><rect width="100%" height="100%" fill="${colors.bg}"/>`;
        for (const cell of cells) {
          if (cell.v < 0.05) continue;
          const { t, seed } = cell, fill = t > 0.55 ? colors.accent : colors.fg, h = s / 2;
          const tr = `translate(${f(cell.cx + h)} ${f(cell.cy + h)}) scale(${f(cell.v)})`;
          if (t < 0.08) { out += `<rect x="${f(-h)}" y="${f(-h)}" width="${f(s)}" height="${f(s)}" fill="${fill}" transform="${tr}"/>`; continue; }
          const rot = (seed % 4) * 90, g = `${tr} rotate(${rot})`;
          const kind = family < 0 ? (seed >>> 3) % 4 : [1, 0, 2, 3][family];
          if (kind === 0) { const r = s * (1 - t * 0.25); out += `<path d="M${f(-h)} ${f(-h)}h${f(r)}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(r)}z" fill="${fill}" transform="${g}"/>`; }
          else if (kind === 1) out += `<circle r="${f(h * (1 - t * 0.55))}" fill="${fill}" transform="${g}"/>`;
          else if (kind === 2) out += `<path d="M${f(-h)} ${f(-h)}H${f(h)}L${f(-h)} ${f(h)}z" fill="${fill}" transform="${g}"/>`;
          else { const q = s * (1 - t * 0.5); out += `<rect x="${f(-q / 2)}" y="${f(-q / 2)}" width="${f(q)}" height="${f(q)}" fill="${fill}" transform="${g} rotate(${f(t * 45)})"/>`; }
        }
        const a = document.createElement('a'); a.download = `type-modulaire-${(text.trim() || 'vide').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`;
        a.href = URL.createObjectURL(new Blob([out + '</svg>'], { type: 'image/svg+xml' })); a.click();
      });
      // enregistrer : la toile en PNG, mot dans le nom du fichier
      canvas.addEventListener('type:save', () => { const a = document.createElement('a'); a.download = `type-modulaire-${(text.trim() || 'vide').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`; a.href = canvas.toDataURL('image/png'); a.click(); });
    }

    layout();
    kick();
  }

  document.querySelectorAll<HTMLCanvasElement>('canvas.type-canvas').forEach(init);
});
