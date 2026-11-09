// Blasonnement : traduit l'écu tiré par le moteur en langue héraldique, sans rien changer à l'image.
// Le noir et le blanc sont le sable et l'argent ; l'inversion binaire est le « de l'un en l'autre ».

const T3 = 1600 / 3, W3 = 1400 / 3, SLOPE = 1600 / 1400, HALF = T3 / 2;
// La zone inversée par la partition, telle que le moteur la trace.
const IN_PATH = {
  plein: () => true,
  parti: (x) => x < 1000,
  coupe: (x, y) => y < 1000,
  tranche: (x, y) => y < 200 + (x - 300) * SLOPE,
  taille: (x, y) => y < 200 + (1700 - x) * SLOPE,
  ecartele: (x, y) => (x < 1000) === (y < 1000),
  fasce: (x, y) => !(y >= 200 + T3 && y <= 200 + 2 * T3),
  pal: (x) => !(x >= 300 + W3 && x <= 300 + 2 * W3),
  bande: (x, y) => Math.abs(y - (200 + SLOPE * (x - 300))) > HALF,
  barre: (x, y) => Math.abs(y - (200 - SLOPE * (x - 1700))) > HALF,
};
// Ces cinq noms n'ont pas de tracé propre dans le moteur : ils s'affichent comme un parti.
const drawn = (name) => (IN_PATH[name] ? name : 'parti');

const ECUS = {
  fr: { anglais: 'anglais', espagnol: 'espagnol', francais_ancien: 'français ancien', francais_moderne: 'français moderne', normand: 'normand', suisse: 'suisse' },
  en: { anglais: 'English', espagnol: 'Spanish', francais_ancien: 'Old French', francais_moderne: 'Modern French', normand: 'Norman', suisse: 'Swiss' },
};

// [nom, féminin, élision]
const CHARGES_FR = {
  leopard: ['léopard', 0, 0], key: ['clef', 1, 0], dragon: ['dragon', 0, 0], castle: ['château', 0, 0], fire: ['flamme', 1, 0],
  star: ['étoile', 1, 1], cross: ['croix', 1, 0], heart: ['cœur', 0, 0], orb: ['monde', 0, 0], hand: ['main', 1, 0], sword: ['épée', 1, 1],
};
const CHARGES_EN = {
  leopard: 'leopard', key: 'key', dragon: 'dragon', castle: 'castle', fire: 'flame', star: 'mullet', cross: 'cross', heart: 'heart', orb: 'orb', hand: 'hand', sword: 'sword',
};
const VAR_FR = { 0: 'vergetée', 90: 'fascée', 45: 'barrée', 135: 'bandée' };
const VAR_EN = { 0: 'paly', 90: 'barry', 45: 'bendy sinister', 135: 'bendy' };

// Seuls ces meubles ont un sens de marche, que le miroir inverse.
const FACING = new Set(['leopard', 'dragon']);

function fieldAt(type, x, y, dark) {
  const inside = IN_PATH[drawn(type)](x, y);
  return inside !== dark ? 'sable' : 'argent';
}

// Sur quel émail repose le meuble ? On échantillonne le cœur de sa silhouette.
function chargeTincture(m, type, dark) {
  const seen = new Set();
  const r = m.r * 0.62;
  for (let u = -1; u <= 1; u += 0.5) for (let v = -1; v <= 1; v += 0.5) seen.add(fieldAt(type, m.cx + u * r, m.cy + v * r, dark));
  if (seen.size > 1) return 'mixed';
  return [...seen][0] === 'sable' ? 'argent' : 'sable';
}

const onShield = (s) => s.x + s.offsetX + s.width > 300 && s.x + s.offsetX < 1700 && s.y + s.offsetY + s.height > 200 && s.y + s.offsetY < 1800;
const fr_t = (t) => (t === 'sable' ? 'de sable' : "d'argent");

function list(items, and) {
  if (items.length < 2) return items.join('');
  return items.slice(0, -1).join(', ') + ` ${and} ` + items[items.length - 1];
}

function positionFr(m) { return (m.cy < 1000 ? 'en chef' : 'en pointe') + (m.cx < 1000 ? ' à dextre' : ' à senestre'); }
function positionEn(m) { return (m.cx < 1000 ? 'dexter' : 'sinister') + (m.cy < 1000 ? ' chief' : ' base'); }

function chargeFr(m, type, dark) {
  const [nom, f] = CHARGES_FR[m.name];
  const e = f ? 'e' : '';
  const t = chargeTincture(m, type, dark);
  const bits = [t === 'mixed' ? "de l'un en l'autre" : fr_t(t)];
  if (m.name !== 'cross' && (m.rotation === 90 || m.rotation === 270)) bits.push('couché' + e);
  if (m.name !== 'cross' && m.rotation === 180) bits.push('renversé' + e);
  if (m.mirrored && FACING.has(m.name)) bits.push('contourné' + e);
  return { nom, f, elide: CHARGES_FR[m.name][2], suite: bits.join(' ') };
}

function fr(s, ecu, dark) {
  const type = s.showPartitions === false ? 'plein' : drawn(s.partitionName);
  const a = dark ? "d'argent" : 'de sable', b = dark ? 'de sable' : "d'argent";
  const cap = a[0].toUpperCase() + a.slice(1);
  const champ = {
    plein: cap,
    parti: `Parti ${a} et ${b}`, coupe: `Coupé ${a} et ${b}`, tranche: `Tranché ${a} et ${b}`, taille: `Taillé ${a} et ${b}`, ecartele: `Écartelé ${a} et ${b}`,
    fasce: `${a[0].toUpperCase() + a.slice(1)} à la fasce ${b}`, pal: `${a[0].toUpperCase() + a.slice(1)} au pal ${b}`,
    bande: `${a[0].toUpperCase() + a.slice(1)} à la bande ${b}`, barre: `${a[0].toUpperCase() + a.slice(1)} à la barre ${b}`,
  }[type];
  const [p, ...rest] = s.placedMeubles;
  const pc = chargeFr(p, type, dark);
  const art = pc.elide ? "à l'" : pc.f ? 'à la ' : 'au ';
  let out = `${champ}, ${art}${pc.nom} ${pc.suite} ${positionFr(p)}`;
  if (rest.length) {
    const items = rest.map((m) => { const c = chargeFr(m, type, dark); return `${positionFr(m)} d'${c.f ? 'une' : 'un'} ${c.nom} ${c.suite}`; });
    out += `, accompagné${pc.f ? 'e' : ''} ${list(items, 'et')}`;
  }
  const shapes = s.colorShapes.map((c, i) => ({ c, i })).filter(({ c }) => onShield(c));
  const pieces = shapes.map(({ c, i }) => {
    const big = i === 0;
    let n = big ? 'une fasce alésée' : 'une billette';
    if (!big && c.width > c.height) n += ' couchée';
    if (c.isPattern) n += ` ${VAR_FR[c.hatchAngle]}`;
    return n;
  });
  if (pieces.length) out += `, brochant sur le tout, de l'un en l'autre, ${list(pieces, 'et')}`;
  const devise = s.glyphsData.map((g) => g.text).join('');
  return `Écu ${ECUS.fr[ecu]}. ${out}. Devise : ${devise}.`;
}

function chargeEn(m, type, dark) {
  const t = chargeTincture(m, type, dark);
  const bits = [];
  if (m.name !== 'cross' && (m.rotation === 90 || m.rotation === 270)) bits.push('fesswise');
  if (m.name !== 'cross' && m.rotation === 180) bits.push('reversed');
  if (m.mirrored && FACING.has(m.name)) bits.push('contourny');
  bits.push(t === 'mixed' ? 'counterchanged' : t);
  return bits.join(' ');
}

function en(s, ecu, dark) {
  const type = s.showPartitions === false ? 'plein' : drawn(s.partitionName);
  const a = dark ? 'argent' : 'sable', b = dark ? 'sable' : 'argent';
  const champ = {
    plein: a[0].toUpperCase() + a.slice(1),
    parti: `Per pale ${a} and ${b}`, coupe: `Per fess ${a} and ${b}`, tranche: `Per bend ${a} and ${b}`, taille: `Per bend sinister ${a} and ${b}`, ecartele: `Quarterly ${a} and ${b}`,
    fasce: `${a[0].toUpperCase() + a.slice(1)}, a fess ${b}`, pal: `${a[0].toUpperCase() + a.slice(1)}, a pale ${b}`,
    bande: `${a[0].toUpperCase() + a.slice(1)}, a bend ${b}`, barre: `${a[0].toUpperCase() + a.slice(1)}, a bend sinister ${b}`,
  }[type];
  const art = (w) => (/^[aeiou]/.test(w) ? 'an' : 'a');
  const charges = s.placedMeubles.map((m, i) => {
    const n = CHARGES_EN[m.name];
    return `${i === 0 ? '' : 'in ' + positionEn(m) + ' '}${art(n)} ${n} ${chargeEn(m, type, dark)}${i === 0 ? ' in ' + positionEn(m) : ''}`;
  });
  let out = `${champ}, ${charges[0]}`;
  if (charges.length > 1) out += `, between ${list(charges.slice(1), 'and')}`;
  const shapes = s.colorShapes.map((c, i) => ({ c, i })).filter(({ c }) => onShield(c));
  const pieces = shapes.map(({ c, i }) => {
    const big = i === 0;
    let n = big ? 'a fess couped' : 'a billet';
    if (!big && c.width > c.height) n += ' fesswise';
    if (c.isPattern) n += ` ${VAR_EN[c.hatchAngle]}`;
    return n;
  });
  if (pieces.length) out += `, overall counterchanged ${list(pieces, 'and')}`;
  return `${ECUS.en[ecu]} shield. ${out}. Motto: ${s.glyphsData.map((g) => g.text).join('')}.`;
}

export function blazon(state, ecuName, dark = false) {
  return { fr: fr(state, ecuName, dark), en: en(state, ecuName, dark) };
}

export function describeBlazon(app) {
  const s = app.currentGenerationState;
  const ecu = Object.keys(app.ecuCache).find((n) => app.ecuCache[n] === s.pathD);
  let lang = null;
  try { lang = localStorage.getItem('kk-lang'); } catch {}
  if (lang !== 'fr' && lang !== 'en') lang = /^fr\b/i.test(navigator.language || '') ? 'fr' : 'en';
  return blazon(s, ecu, !app.isLightMode)[lang];
}
