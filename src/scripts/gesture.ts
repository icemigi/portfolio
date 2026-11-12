// Molette / pavé tactile : un geste = un écran.
// L'inertie du trackpad envoie encore des dizaines d'événements après le geste, et repart d'un coup quand le doigt se lève :
// on n'accepte un nouveau passage que si le flux s'est vraiment interrompu (> 260 ms), si le sens s'inverse, ou si l'amplitude
// retombe puis remonte plusieurs fois de suite (un vrai nouveau coup de doigt, pas le sursaut isolé de l'élan).
// Un vrai nouveau coup peut relancer après 200 ms (le glissement est interruptible) ; dans tous les autres cas, 440 ms minimum.
const LOCK = 440, PUSH = 200;

// Renvoie le sens du passage à faire (1, -1), ou 0 s'il n'y en a pas. canLeave : l'écran en cours est à son bord dans ce sens.
export function wheelGesture(canLeave: (dir: number) => boolean) {
  let last = 0, acc = 0, used = false, held = false, edge = false, gdir = 0, lastGo = 0, lastDir = 0, prev = 0, rise = 0, peak = 0, dip = false;
  return (now: number, deltaY: number): number => {
    const dir = Math.sign(deltaY);
    if (!dir) return 0;
    const abs = Math.abs(deltaY);
    const pause = now - last > 260;
    last = now;
    rise = abs > prev * 1.15 && abs > 12 ? rise + 1 : 0;
    prev = abs;
    peak = Math.max(peak, abs);
    if (abs < peak * 0.55) dip = true; // l'élan est retombé : une remontée franche sera un nouveau geste
    const push = used && dip && rise >= 3 && abs > 30 && now - lastGo > PUSH;
    const fresh = pause || dir !== gdir || push;
    if (fresh) { acc = 0; used = false; held = false; gdir = dir; rise = 0; peak = abs; dip = false; edge = canLeave(dir); }
    if (used || !edge) return 0;
    acc += deltaY;
    // molette à crans : deux crans rapprochés ne font pas sauter deux écrans
    if (Math.abs(acc) <= 30) return 0;
    // trop tôt après le passage précédent : le geste attend la fin du verrou au lieu d'être perdu, sauf si son élan retombe (inertie)
    if ((!push && dir === lastDir && now - lastGo < LOCK) || (held && dip)) { held = true; used = dip; return 0; }
    used = true;
    lastGo = now; lastDir = dir;
    return dir;
  };
}
