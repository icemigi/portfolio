// Cycle de vie des pages (navigation sans rechargement, ClientRouter d'Astro).
// Le document n'est chargé qu'une fois : chaque page est « montée » à son arrivée et « démontée » à son départ.
//  - montage : au premier chargement, puis à chaque échange de contenu (astro:after-swap), AVANT le premier affichage de la
//    nouvelle page — les états de départ (texte à écrire, objets à faire tomber, écran ouvert) sont posés avant qu'on la voie ;
//  - démontage : juste avant l'échange (astro:before-swap) — écouteurs, boucles d'animation, minuteurs, observateurs et
//    éléments ajoutés hors de la page sont retirés : rien ne tourne ni ne s'accumule d'une page à l'autre.
// Les scripts propres à une page sont des morceaux chargés à la demande (onDemand) : au premier chargement avant le premier
// montage, en navigation pendant la préparation de la page suivante (avant l'échange) — le montage a toujours lieu avant le
// premier affichage, et chaque page ne télécharge que ses scripts.

export type Nav = {
  first: boolean;                 // premier chargement du document (sinon : arrivée par navigation)
  type: 'load' | 'push' | 'replace' | 'traverse';
  from: URL | null;               // page quittée
  info: NavInfo;                  // ce que la page quittée transmet à la suivante : navigate(url, { info }) (langue, objet…)
};
export type NavInfo = {
  lang?: { screen: number };      // changement de langue : la page s'ouvre telle quelle, au même écran, sans apparition
  object?: { slug: string; x: number; y: number; w: number; h: number; r: number }; // objet de la scène Projets qui voyage
  next?: { x: number; y: number; w: number; h: number }; // « projet suivant » : titre posé à son ancienne place
};

export type Ctx = Nav & {
  signal: AbortSignal;                                        // pour addEventListener(…, { signal }) : retiré au départ
  raf: (cb: FrameRequestCallback) => number;                  // requestAnimationFrame, annulé au départ
  timeout: (fn: () => void, ms?: number) => number;           // setTimeout, annulé au départ
  interval: (fn: () => void, ms: number) => number;           // setInterval, arrêté au départ
  observe: <T extends { disconnect: () => void }>(o: T) => T; // Intersection/Mutation/ResizeObserver, déconnecté au départ
  own: <T extends Element>(el: T) => T;                       // élément ajouté hors de la page (body…), retiré au départ
  cleanup: (fn: () => void) => void;                          // tout autre rangement
};

type Mount = { sel: string | null; fn: (ctx: Ctx) => void; order: number };
const mounts: Mount[] = [];
let current: ReturnType<typeof scope> | null = null;
let nav: Nav = { first: true, type: 'load', from: null, info: {} };

// Une page (ou un composant) s'inscrit : fn est appelée à chaque montage où le sélecteur trouve un élément (toujours si null).
// order : les montages se font par ordre croissant (le socle commun — texte, écrans — passe avant les pages, qui s'en servent).
export function onPage(sel: string | null, fn: (ctx: Ctx) => void, order = 0) {
  mounts.push({ sel, fn, order });
  mounts.sort((a, b) => a.order - b.order);
}

// Portée de nettoyage : écouteurs (signal), boucles, minuteurs, observateurs, éléments ajoutés et rangements divers, tous
// libérés par dispose(). Une par page montée ; un composant persistant (transition:persist) peut avoir la sienne, libérée
// quand il quitte vraiment le document.
export function scope(n: Nav = nav): Ctx & { dispose: () => void } {
  const ac = new AbortController(), raf = new Set<number>(), timers = new Set<number>(), intervals = new Set<number>(), done: (() => void)[] = [];
  return {
    ...n,
    signal: ac.signal,
    raf: (cb) => { if (ac.signal.aborted) return 0; const id = requestAnimationFrame((t) => { raf.delete(id); cb(t); }); raf.add(id); return id; },
    timeout: (fn, ms) => { if (ac.signal.aborted) return 0; const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    interval: (fn, ms) => { const id = window.setInterval(fn, ms); intervals.add(id); return id; },
    observe: (o) => { done.push(() => o.disconnect()); return o; },
    own: (el) => { done.push(() => el.remove()); return el; },
    cleanup: (fn) => { done.push(fn); },
    dispose: () => {
      ac.abort();
      raf.forEach(cancelAnimationFrame); timers.forEach(clearTimeout); intervals.forEach(clearInterval);
      for (const fn of done.splice(0).reverse()) { try { fn(); } catch (e) { console.error(e); } }
    },
  };
}

function mount() {
  current = scope();
  for (const m of mounts) {
    if (m.sel && !document.querySelector(m.sel)) continue;
    try { m.fn(current); } catch (e) { console.error(e); } // une page en erreur n'empêche pas les autres de monter
  }
}

function unmount() {
  if (!current) return;
  current.dispose();
  current = null;
  // animations encore en cours sur la page quittée annulées (l'interface persistante, transition:persist, garde les siennes ;
  // l'image de l'ancienne page est déjà prise, rien ne se voit). Les animations en pause sont rendues par leur créateur
  // (revealScrub → cancel, écrans) : getAnimations() ne les voit plus une fois arrivées au bout.
  for (const a of document.getAnimations()) {
    const t = (a.effect as KeyframeEffect | null)?.target;
    if (t && !t.closest('[data-astro-transition-persist]')) a.cancel();
  }
}

// Script de page chargé à la demande : load() importe un module qui s'inscrit lui-même (onPage) ; il n'est téléchargé que
// pour une page qui contient sel.
type Chunk = { sel: string; load: () => Promise<unknown>; ready?: Promise<unknown> };
const chunks: Chunk[] = [];
export function onDemand(sel: string, load: () => Promise<unknown>) { chunks.push({ sel, load }); }
const need = (doc: Document) => Promise.all(chunks.filter((c) => doc.querySelector(c.sel)).map((c) => (c.ready ??= c.load().catch((e) => { c.ready = undefined; console.error(e); }))));

// premier chargement : monté dès que les scripts de la page sont là (fin du module principal, voir site.ts)
export async function start() {
  await need(document);
  mount();
  document.addEventListener('astro:before-preparation', (e) => {
    const ev = e as Event & { from: URL; navigationType: Nav['type']; info?: NavInfo; loader: () => Promise<void>; newDocument: Document };
    nav = { first: false, type: ev.navigationType, from: ev.from, info: ev.info ?? {} };
    // la page suivante est chargée, puis ses scripts, avant l'échange
    const load = ev.loader;
    ev.loader = async () => { await load(); await need(ev.newDocument); };
  });
  document.addEventListener('astro:before-swap', unmount);
  document.addEventListener('astro:after-swap', mount);
}
