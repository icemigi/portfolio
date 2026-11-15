# Fanions de la Stack (page À propos) : écrit /public/fanions/<id>.svg. Lancer : python3 tools/fanions.py
# Dessins d'après les maquettes de /assets/fanions (76 de large) ; vocabulaire du blason : queue d'aronde, ogive, pointe,
# franges, langues, pendants ; parti, bordure, besanté, écartelé, pal, fascé ondé, échiqueté.
# Chaque fanion a sa longueur : 231 + D. Seul le corps s'allonge (les logos restent sur la même ligne, à 152 du haut) ;
# la hauteur de chaque SVG est lue par Banners.astro.
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'public' / 'fanions'


def svg(L, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="76" height="{L}" viewBox="0 0 76 {L}">{body}</svg>\n'


def clip(d):
    return f'<clipPath id="c"><path d="{d}"/></clipPath>'


def bordered(d, fill, line):  # bordure intérieure de 4 (trait de 8 coupé par la forme)
    return f'{clip(d)}<path d="{d}" fill="{fill}" stroke="{line}" stroke-width="8" clip-path="url(#c)"/>'


def parti(d, L, left, right):  # deux moitiés
    return f'{clip(d)}<g clip-path="url(#c)"><rect width="38" height="{L}" fill="{left}"/><rect x="38" width="38" height="{L}" fill="{right}"/></g>'


# formes : D = rallonge du corps, L = 231 + D
def swallow(D): L = 231 + D; return f'M0 0H76V{L}L38 {192 + D}L0 {L}Z'
def ogive(D): L = 231 + D; return f'M0 0H76V{172 + D}C76 {200 + D} 58 {217 + D} 38 {L}C18 {217 + D} 0 {200 + D} 0 {172 + D}Z'
def point(D): return f'M0 0H76V{198 + D}L38 {231 + D}L0 {198 + D}Z'
def tongues(D): L = 231 + D; y = 200 + D; return f'M0 0H76V{L}L63.3 {y}L50.7 {L}L38 {y}L25.3 {L}L12.7 {y}L0 {L}Z'
def tabs(D):
    y, t = 220 + D, 196 + D
    return f'M0 0H76V{y}A11 11 0 0 1 54 {y}V{t}H49V{y}A11 11 0 0 1 27 {y}V{t}H22V{y}A11 11 0 0 1 0 {y}Z'


def glyphs(D, L): return parti(swallow(D), L, '#3f9a44', '#55b955')
def touchdesigner(D, L): return bordered(tabs(D), '#1c1c1c', '#7fb069')
def figma(D, L):  # besanté
    dots = ''.join(f'<circle cx="{x + (9.5 if r % 2 else 0)}" cy="{9 + r * 19}" r="3.2" fill="#2d2d2d"/>' for r in range(L // 19 + 1) for x in range(0, 86, 19))
    return f'{clip(tongues(D))}<g clip-path="url(#c)"><rect width="76" height="{L}" fill="#222222"/>{dots}</g>'
def photoshop(D, L):  # Group 12 au pixel : cadre #002841 de 4, six franges de 7
    fr = ''.join(f'<rect x="{x}" y="{187 + D}" width="7" height="44" fill="#002841"/>' for x in (0, 14, 28, 41, 55, 69))
    return f'<rect width="76" height="{187 + D}" fill="#002841"/><rect x="4" y="4" width="68" height="{179 + D}" fill="#041f30"/>{fr}'
def python(D, L):  # écartelé, couture
    d = ogive(D)
    return (f'{clip(d)}<g clip-path="url(#c)"><rect width="76" height="{L}" fill="#fbfaf6"/><rect x="38" width="38" height="110" fill="#d9e1ea"/>'
            f'<rect y="110" width="38" height="{L - 110}" fill="#d9e1ea"/></g>'
            f'<path d="{d}" transform="translate(6 5) scale(.842 {(L - 16) / L:.3f})" fill="none" stroke="#9fadbb" stroke-width="1.2" stroke-dasharray="4 3"/>')
def typescript(D, L): return bordered(swallow(D), '#3178c6', '#4aa8ff')
def procreate(D, L):  # pal
    return f'{clip(point(D))}<g clip-path="url(#c)"><rect width="76" height="{L}" fill="#1b1b1b"/><rect x="25" width="26" height="{L}" fill="#272727"/></g>'
def illustrator(D, L):  # fascé ondé
    waves = ''.join(f'<path d="M-4 {y}q9.5 -6 19 0t19 0t19 0t19 0t19 0v10q-9.5 -6 -19 0t-19 0t-19 0t-19 0t-19 0z" fill="#530409"/>' for y in range(14, L + 20, 26))
    return f'{clip(ogive(D))}<g clip-path="url(#c)"><rect width="76" height="{L}" fill="#410004"/>{waves}</g>'
def p5js(D, L): return parti(point(D), L, '#ff3d7f', '#ed225d')
def blender(D, L):  # échiqueté : damier blanc et gris, assez marqué pour se détacher du fond clair de la page
    sq = ''.join(f'<rect x="{x * 12.67:.2f}" y="{y * 12.67:.2f}" width="12.67" height="12.67" fill="#c9c3b6"/>' for y in range(L // 12 + 1) for x in range(6) if (x + y) % 2)
    return f'{clip(swallow(D))}<g clip-path="url(#c)"><rect width="76" height="{L}" fill="#fbfaf6"/>{sq}</g>'


# ordre de la page (suite de couleurs ; deux voisins n'ont jamais la même forme ni le même motif) et rallonge de chacun
FANIONS = [(glyphs, 0), (touchdesigner, 40), (figma, 16), (photoshop, 52), (python, 8),
           (typescript, 32), (procreate, 22), (illustrator, 46), (p5js, 4), (blender, 28)]

if __name__ == '__main__':
    for draw, D in FANIONS:
        L = 231 + D
        (OUT / f'{draw.__name__}.svg').write_text(svg(L, draw(D, L)))
        print(draw.__name__, L)
