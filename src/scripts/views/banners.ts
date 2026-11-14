// Fanions de la Stack (Banners.astro, page À propos) : drapeaux en tissu (WebGL), qui se déroulent à l'arrivée de leur écran
// et flottent au vent de la souris. Contexte WebGL rendu au départ de la page.
import { onPage } from '../page';
import { reduced } from '../motion';

onPage('[data-fanions]', (ctx) => {
  type B = { x0: number; y0: number; w: number; h: number; P: Float32Array; Q: Float32Array; tex: WebGLTexture | null; sh: Float32Array };
  const C = 8, R = 22; // colonnes × rangées de points par fanion
  const root = document.querySelector<HTMLElement>('[data-fanions]');
  const still = reduced() || matchMedia('(max-width: 760px)').matches;
  const cv = root?.querySelector<HTMLCanvasElement>('canvas.gl');
  const gl = !still && cv ? cv.getContext('webgl', { premultipliedAlpha: true, antialias: true, alpha: true }) : null;
  if (root && cv && gl) {
    ctx.cleanup(() => gl.getExtension('WEBGL_lose_context')?.loseContext());
    root.classList.add('live'); // la version fixe ne s'affiche jamais : pas de double apparition
    const li = [...root.querySelectorAll<HTMLElement>('li.fn')];
    // ---------- shaders : position en px, texture du drap, éclairage par sommet (plis) ----------
    const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, `attribute vec2 p; attribute vec2 t; attribute float l; uniform vec2 u; uniform float oy; varying vec2 vt; varying float vl;
      void main(){ vt=t; vl=l; gl_Position=vec4(p.x/u.x*2.0-1.0, 1.0-(p.y+oy)/u.y*2.0, 0.0, 1.0); }`));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision mediump float; uniform sampler2D s; uniform float al; varying vec2 vt; varying float vl;
      void main(){ vec4 c=texture2D(s,vt); if(c.a<0.02) discard; vec3 col=c.rgb*(0.62+0.5*vl)+vec3(0.09)*pow(max(vl-0.55,0.0)*2.2,2.0)*c.a; gl_FragColor=vec4(col,c.a)*al; }`));
    gl.linkProgram(pr); gl.useProgram(pr);
    const aP = gl.getAttribLocation(pr, 'p'), aT = gl.getAttribLocation(pr, 't'), aL = gl.getAttribLocation(pr, 'l'), uU = gl.getUniformLocation(pr, 'u'), uA = gl.getUniformLocation(pr, 'al'), uO = gl.getUniformLocation(pr, 'oy');
    const bP = gl.createBuffer(), bT = gl.createBuffer(), bL = gl.createBuffer(), bI = gl.createBuffer();
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // indices du maillage (deux triangles par case)
    const idx: number[] = [];
    for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++) { const i = r * C + c; idx.push(i, i + 1, i + C, i + 1, i + C + 1, i + C); }
    // tampons alloués une seule fois (aucune allocation par image) ; les coordonnées de texture sont les mêmes pour tous les fanions
    const xy = new Float32Array(C * R * 2), uv = new Float32Array(C * R * 2);
    for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) uv.set([i / (C - 1), j / (R - 1)], (j * C + i) * 2);
    gl.bindBuffer(gl.ARRAY_BUFFER, bT); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW); gl.enableVertexAttribArray(aT); gl.vertexAttribPointer(aT, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bP); gl.bufferData(gl.ARRAY_BUFFER, xy.byteLength, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bL); gl.bufferData(gl.ARRAY_BUFFER, C * R * 4, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bI); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

    // ---------- texture d'un fanion : drap, ourlet, couture, logo, nom, queue d'aronde ----------
    const paint = (el: HTMLElement, w: number, h: number) => new Promise<HTMLCanvasElement>((res) => {
      const k = 2, W = Math.round(w * k), H = Math.round(h * k), c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d')!, notch = 0.15;
      const shape = (m: number) => { x.beginPath(); x.moveTo(m, m); x.lineTo(W - m, m); x.lineTo(W - m, H - m * 1.4); x.lineTo(W / 2, H * (1 - notch) - m * 0.4); x.lineTo(m, H - m * 1.4); x.closePath(); };
      shape(0); x.fillStyle = el.dataset.bg!; x.fill();
      // trame très légère (le drap n'est pas un aplat numérique)
      x.save(); shape(0); x.clip(); x.globalAlpha = .045; x.fillStyle = '#000';
      for (let i = 0; i < H; i += 3) x.fillRect(0, i, W, 1);
      x.globalAlpha = .07; x.fillRect(0, 0, W, H * 0.04); x.restore(); // ourlet
      // couture piquée
      x.save(); shape(k * 7); x.setLineDash([k * 4, k * 3]); x.lineWidth = k * 1; x.strokeStyle = el.dataset.ink!; x.globalAlpha = .45; x.stroke(); x.restore();
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        // même boîte carrée pour tous les logos (même taille optique), posée dans le bas du fanion
        const box = W * 0.6, sc = Math.min(box / img.width, box / img.height), dw = img.width * sc, dh = img.height * sc;
        const cy = H * 0.66 - box / 2;
        x.drawImage(img, (W - dw) / 2, cy - dh / 2, dw, dh);
        res(c);
      };
      img.onerror = () => res(c);
      img.src = el.dataset.mark!;
    });

    let banners: B[] = [], CW = 0, CH = 0, dpr = 1;
    let gen = 0;
    const build = async () => {
      const my = ++gen; // une reconstruction plus récente annule celle-ci
      dpr = Math.min(2, devicePixelRatio || 1);
      // toutes les mesures d'un coup, AVANT toute attente : l'écran peut glisser pendant le chargement des logos,
      // et des fanions mesurés à des instants différents se retrouvaient décalés d'une hauteur d'écran (invisibles)
      const cr = cv.getBoundingClientRect();
      const rects = li.map((el) => el.querySelector('.cloth')!.getBoundingClientRect());
      const canv = await Promise.all(li.map((el, i) => paint(el, rects[i].width, rects[i].height)));
      if (my !== gen) return;
      CW = cr.width; CH = cr.height;
      cv.width = Math.round(CW * dpr); cv.height = Math.round(CH * dpr); gl.viewport(0, 0, cv.width, cv.height);
      const next: B[] = li.map((_, k) => {
        const r = rects[k];
        const b: B = { x0: r.left - cr.left, y0: r.top - cr.top, w: r.width, h: r.height, P: new Float32Array(C * R * 3), Q: new Float32Array(C * R * 3), tex: null, sh: new Float32Array(C * R) };
        for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
          const n = j * C + i, px = b.x0 + (i / (C - 1)) * b.w, py = b.y0 + (j / (R - 1)) * b.h;
          b.P.set([px, py, 0], n * 3); b.Q.set([px, py, 0], n * 3);
        }
        b.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, b.tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canv[k]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return b;
      });
      const first = !banners.length;
      banners.forEach((b) => gl.deleteTexture(b.tex)); banners = next;
      for (let s = 0; s < 120; s++) step(); // le tissu est déjà posé quand il apparaît
      if (first) t0 = performance.now();
      kick();
    };

    // ---------- simulation ----------
    let mx = -1e4, my = -1e4, vx = 0, vy = 0, t = 0, raf = 0, on = false, t0 = 0, acc = 0, last = performance.now();
    const step = () => {
      t += 1;
      let bi = 0;
      for (const b of banners) {
        // vent léger permanent : rafales lentes et décalées d'un fanion à l'autre (jamais deux fanions en phase)
        const ph = bi++ * 1.7, gust = Math.sin(t * 0.011 + ph) * 0.6 + Math.sin(t * 0.027 + ph * 2.3) * 0.3 + Math.sin(t * 0.063 + ph * 0.7) * 0.15;
        const wz = 0.05 * (0.55 + gust), wx = 0.012 * Math.sin(t * 0.017 + ph);
        const { P, Q, w, h } = b, sx = w / (C - 1), sy = h / (R - 1);
        for (let n = C; n < C * R; n++) { // la rangée du haut reste accrochée à la hampe
          const k = n * 3, x = P[k], y = P[k + 1], z = P[k + 2];
          const row = Math.floor(n / C) / (R - 1); // le vent prend surtout le bas du tissu
          let fx = wx * row, fy = 0.22, fz = wz * row * (0.7 + 0.3 * Math.sin(t * 0.05 + (n % C) * 0.6));
          const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) { const f = (1 - Math.sqrt(d2) / 130) ** 2; fx += vx * 0.03 * f; fy += vy * 0.012 * f; fz += (Math.abs(vx) + Math.abs(vy)) * 0.022 * f * Math.sign(dx || 1); }
          P[k] = x + (x - Q[k]) * 0.982 + fx; P[k + 1] = y + (y - Q[k + 1]) * 0.982 + fy; P[k + 2] = z + (z - Q[k + 2]) * 0.982 + fz;
          Q[k] = x; Q[k + 1] = y; Q[k + 2] = z;
        }
        for (let it = 0; it < 4; it++) {
          for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
            const n = j * C + i;
            if (i < C - 1) link(P, n, n + 1, sx, j === 0);
            if (j < R - 1) link(P, n, n + C, sy, false);
            if (i < C - 1 && j < R - 1) link(P, n, n + C + 1, Math.hypot(sx, sy), false, 0.5);
          }
          for (let i = 0; i < C; i++) { const k = i * 3; P[k] = b.x0 + (i / (C - 1)) * w; P[k + 1] = b.y0; P[k + 2] = 0; }
        }
        // éclairage : normale du maillage, lumière en haut à gauche, devant
        for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
          const n = j * C + i, a = (j * C + Math.min(i + 1, C - 1)) * 3, bb = (j * C + Math.max(i - 1, 0)) * 3, c = (Math.min(j + 1, R - 1) * C + i) * 3, d = (Math.max(j - 1, 0) * C + i) * 3;
          const tx = P[a] - P[bb], ty = P[a + 1] - P[bb + 1], tz = P[a + 2] - P[bb + 2], ux = P[c] - P[d], uy = P[c + 1] - P[d + 1], uz = P[c + 2] - P[d + 2];
          let nx = ty * uz - tz * uy, ny = tz * ux - tx * uz, nz = tx * uy - ty * ux; const L = Math.hypot(nx, ny, nz) || 1; nx /= L; ny /= L; nz /= L;
          b.sh[n] = Math.max(0, -0.35 * nx - 0.45 * ny + 0.82 * Math.abs(nz));
        }
      }
      vx *= 0.82; vy *= 0.82;
    };
    function link(P: Float32Array, a: number, b: number, rest: number, _top: boolean, k = 1) {
      const A = a * 3, Bk = b * 3, dx = P[Bk] - P[A], dy = P[Bk + 1] - P[A + 1], dz = P[Bk + 2] - P[A + 2];
      const d = Math.hypot(dx, dy, dz) || 1e-6, f = ((d - rest) / d) * 0.5 * k;
      P[A] += dx * f; P[A + 1] += dy * f; P[A + 2] += dz * f; P[Bk] -= dx * f; P[Bk + 1] -= dy * f; P[Bk + 2] -= dz * f;
    }
    const draw = () => {
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform2f(uU, CW, CH);
      const now = performance.now();
      for (const [i, b] of banners.entries()) {
        // apparition sobre : fondu + léger glissement, décalé de 60 ms d'un fanion à l'autre
        const e = Math.max(0, Math.min(1, (now - t0 - i * 60) / 500)), ez = 1 - (1 - e) ** 3;
        if (e <= 0) continue;
        gl.uniform1f(uA, ez); gl.uniform1f(uO, -10 * (1 - ez));
        for (let n = 0; n < C * R; n++) { xy[n * 2] = b.P[n * 3]; xy[n * 2 + 1] = b.P[n * 3 + 1]; }
        gl.bindBuffer(gl.ARRAY_BUFFER, bP); gl.bufferSubData(gl.ARRAY_BUFFER, 0, xy); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, bL); gl.bufferSubData(gl.ARRAY_BUFFER, 0, b.sh); gl.enableVertexAttribArray(aL); gl.vertexAttribPointer(aL, 1, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, b.tex); gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      }
    };
    // visibilité vérifiée à chaque image (l'IntersectionObserver ratait les sections déplacées par le défilement écran par écran)
    const shown = () => { const r = root.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    const loop = () => {
      const v = shown();
      if (v && !on) t0 = performance.now(); // à chaque retour sur la section, nouveau fondu
      on = v;
      const now = performance.now();
      if (v && banners.length) {
        acc = Math.min(acc + (now - last), 50); // 120 pas de simulation par seconde, quel que soit l'écran
        let moved = false;
        while (acc >= 8.33) { step(); acc -= 8.33; moved = true; }
        if (moved) draw();
      }
      last = now;
      raf = ctx.raf(loop);
    };
    function kick() { if (!raf) raf = ctx.raf(loop); }
    // la souris fait du vent : sa vitesse pousse le tissu à proximité
    let lx = 0, ly = 0;
    const host = root.closest('.scr') || document;
    host.addEventListener('pointermove', (e: Event) => {
      const p = e as PointerEvent, r = cv.getBoundingClientRect();
      const x = p.clientX - r.left, y = p.clientY - r.top;
      vx = Math.max(-24, Math.min(24, x - lx)); vy = Math.max(-24, Math.min(24, y - ly)); lx = x; ly = y; mx = x; my = y;
    }, { signal: ctx.signal });
    // la boucle ne tourne que quand la section est à l'écran
    // à chaque retour sur la section, les fanions se déroulent de nouveau (comme les lettres réapparaissent)
    document.fonts.ready.then(() => { if (!ctx.signal.aborted) build(); });
    // la mise en page de la section peut bouger après coup (apparition, polices) : on reconstruit dès que la largeur change
    let rz = 0, lastW = root.clientWidth;
    ctx.observe(new ResizeObserver(() => { const w = root.clientWidth; if (Math.abs(w - lastW) < 2) return; lastW = w; clearTimeout(rz); rz = ctx.timeout(build, 150); })).observe(root);
  }
});
