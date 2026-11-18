// Aperçus animés du Lab (18/11) : public/lab/previews/<id>.mp4 (et <id>-nuit.mp4 pour les pièces qui suivent le thème), boucles
// muettes en 960 × 600 (16:10, plein cadre : la pièce elle-même, sans le menu de sa page), jouées au survol d'une ligne de la
// page Lab (views/lab.ts) ; et leur première image <id>.webp, affichée en attendant la vidéo (même cadre : rien ne saute).
// Deux façons de filmer :
//   - pièce dessinée sur un canevas et pilotable (fonctions globales) : image par image, hasard à graine fixe (même résultat
//     à chaque lancement), cadrage dans le canevas ;
//   - parcours (formulaires, questions) : filmé en temps réel (capture d'écran du navigateur), par séquences enchaînées en
//     coupe franche, les temps morts sautés.
// Lancer, site servi sur :4321 (astro dev) : node tools/lab-previews.mjs [id…]   (Playwright + Chromium requis)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4321', OUT = new URL('../public/lab/previews/', import.meta.url).pathname;
const W = 960, H = 600, FPS = 25, CRF = 30;
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const b = await chromium.launch();

// images brutes (RVB, W × H) → vidéo H.264 en boucle + première image en WebP
async function encode(name, frames) {
  const file = `${OUT}${name}.mp4`;
  await new Promise((ok, ko) => {
    const p = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-framerate', String(FPS), '-i', '-',
      '-an', '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
    p.on('error', ko); p.on('close', (c) => (c ? ko(new Error(`ffmpeg : code ${c}`)) : ok()));
    for (const f of frames) p.stdin.write(f);
    p.stdin.end();
  });
  await sharp(frames[0], { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 82 }).toFile(`${OUT}${name}.webp`);
  console.log(file, `${frames.length} images, ${(frames.length / FPS).toFixed(1)} s`);
}

// ---------- pièces sur canevas : image par image ----------
// z : zoom dans la zone utile du canevas (marges inner retirées), centré en fx, fy ; states : états successifs (un tous les
// secs / states.length), en coupe franche ; night : la pièce en mode nuit (thème lu par back.js dans kk-theme)
async function canvasReel(name, path, { secs, z = 1, fx = 0.5, fy = 0.5, inner = 0, states, night }, setup, page$) {
  const page = await b.newPage({ viewport: { width: 1400, height: 1700 }, deviceScaleFactor: 2 });
  await page.addInitScript((n) => { let s = 7; Math.random = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; window.kkNight = n; localStorage.setItem('kk-theme', n ? 'nuit' : 'jour'); }, night);
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('#stage canvas'));
  await page.evaluate(setup);
  await page.evaluate(page$); // définit window.reel = { tick, apply }
  const grab = async () => {
    const url = await page.evaluate(() => document.querySelector('#stage canvas').toDataURL('image/png'));
    const img = sharp(Buffer.from(url.split(',')[1], 'base64'));
    const { width: cw, height: ch } = await img.metadata();
    const m = inner * cw, w = Math.round((cw - 2 * m) / z), h = Math.round((w * H) / W);
    const left = Math.round(Math.min(cw - m - w, Math.max(m, fx * cw - w / 2))), top = Math.round(Math.min(ch - h, Math.max(0, fy * ch - h / 2)));
    return img.extract({ left, top, width: w, height: h }).resize(W, H).removeAlpha().raw().toBuffer();
  };
  const L = secs * FPS, per = L / states.length, frames = [];
  for (let f = 0; f < L; f++) {
    if (f % per === 0) await page.evaluate((s) => window.reel.apply(s), states[f / per]);
    await page.evaluate(() => window.reel.tick());
    frames.push(await grab());
  }
  await page.close();
  await encode(name, frames);
}

// ---------- parcours : filmé en temps réel, par séquences ----------
// film(ms, action) : filme ms millisecondes pendant que action se déroule ; entre deux séquences, le script avance sans filmer ;
// script(frame, film, keyboard) : frame, la pièce (dans son iframe) ; keyboard, le clavier de la page
async function flowReel(name, path, script, { viewport = { width: W, height: H } } = {}) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: 1 }); // contexte neuf : rien de gardé d'une visite précédente
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  let shots = null;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    shots?.push({ t: metadata.timestamp * 1000, jpg: Buffer.from(data, 'base64') });
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  const clips = [];
  const film = async (ms, action = async () => {}) => {
    shots = [];
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: viewport.width, maxHeight: viewport.height, everyNthFrame: 1 });
    const t0 = Date.now();
    await action();
    await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    await cdp.send('Page.stopScreencast');
    clips.push({ shots, t0, ms }); shots = null;
  };
  // la pièce dans une iframe plein cadre, comme dans l'aperçu du Lab (back.js n'y pose pas son lien « ← lab »)
  await page.setContent(`<style>html,body{margin:0;overflow:hidden}iframe{border:0;width:100vw;height:100vh;display:block}</style><iframe src="${BASE}${path}"></iframe>`);
  const frame = await (await page.waitForSelector('iframe')).contentFrame();
  await frame.waitForLoadState('networkidle');
  await script(frame, film, page.keyboard);
  await ctx.close();
  // chaque séquence en images régulières : à chaque instant, la dernière capture reçue (le navigateur n'en envoie qu'au changement)
  const frames = [];
  for (const { shots: s, ms } of clips) {
    if (!s.length) continue;
    const start = s[0].t, raw = await Promise.all(s.map((x) => sharp(x.jpg).resize(W, H, { fit: 'cover' }).removeAlpha().raw().toBuffer()));
    for (let k = 0, j = 0; k < Math.round((ms / 1000) * FPS); k++) {
      const at = start + (k * 1000) / FPS;
      while (j + 1 < s.length && s[j + 1].t <= at) j++;
      frames.push(raw[j]);
    }
  }
  await encode(name, frames);
}

const want = (id) => !only.length || only.includes(id);

// Matrice : le vortex qui tourne, les quatre palettes en coupe franche (une toutes les 2 s) ; jour et nuit
if (want('ascii')) for (const night of [false, true]) {
  await canvasReel(night ? 'ascii-nuit' : 'ascii', '/lab/ascii/index.html?lang=fr', { secs: 8, z: 1.25, inner: 0.083, states: [0, 1, 3, 2], night }, () => { noLoop(); roll(false); }, () => {
    window.mouseX = width / 2; window.mouseY = height / 2;
    window.reel = { tick: () => redraw(), apply: (p) => { pal = p; } };
  });
}

// Letteroastd : l'accueil, le profil exemple, une question, un duel de cassettes, puis l'affiche finale
if (want('letteroastd')) await flowReel('letteroastd', '/lab/letteroastd/index.html?lang=fr', async (page, film, keyboard) => {
  const has = (sel) => page.locator(sel).count().then((n) => n > 0);
  // avance d'une étape (réplique : Entrée ; question : une réponse) ; rend le type de l'étape franchie
  const advance = async () => {
    const area = page.locator('#action-area');
    // la zone de réponse s'efface (opacité 0) pendant les répliques : ses anciens boutons y restent, on attend qu'elle revienne
    if ((await area.evaluate((el) => getComputedStyle(el).opacity)) !== '1') { await page.waitForTimeout(150); return ''; }
    if (await has('#action-area [data-ok]')) { await page.locator('[data-sl]').fill('7'); await area.locator('[data-ok]').click(); return 'slider'; }
    // les jaquettes bougent sans cesse (jamais « stables » pour Playwright) : clic déclenché directement
    if (await has('#action-area .vhs')) { await area.locator('.vhs').first().evaluate((el) => el.click()); return 'duel'; }
    if (await has('#action-area .btn-choice-large')) { await area.locator('.btn-choice-large').nth(1).click(); return 'choice'; }
    if (await has('#action-area .hint-text')) { await page.waitForTimeout(300); await keyboard.press('Enter'); return 'say'; }
    await page.waitForTimeout(120); return '';
  };
  await film(1800);                                                            // l'accueil
  await film(2600, () => page.locator('[data-demo]').click());                // le profil exemple : le rayon se remplit
  // l'ordre des questions est tiré au hasard : on filme la première question à choix et le premier duel, quand ils viennent
  let choice = false, duel = false;
  while (!(await page.locator('#final-stage').isVisible())) {
    const shown = (await page.locator('#action-area').evaluate((el) => getComputedStyle(el).opacity)) === '1';
    if (shown && !choice && (await has('#action-area .btn-choice-large'))) {
      choice = true;
      await film(4200, async () => { await page.waitForTimeout(1400); await page.locator('#action-area .btn-choice-large').nth(1).click(); });
    } else if (shown && !duel && (await has('#action-area .vhs'))) {
      duel = true;
      await page.waitForTimeout(1500);                                          // les jaquettes arrivent
      await film(4200, async () => { await page.waitForTimeout(1600); await page.locator('#action-area .vhs').first().evaluate((el) => el.click()); });
    } else await advance();
  }
  await page.waitForLoadState('networkidle').catch(() => {});
  await film(5000);                                                            // l'affiche
});

await b.close();
