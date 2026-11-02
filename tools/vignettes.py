# À lancer depuis la racine du projet : python3 tools/vignettes.py (Pillow requis)
# Vignettes animées : uniquement des travaux, montrés en entier (jamais recadrés),
# posés sur la couleur de leur propre bord ; même marge pour tous.
from PIL import Image, ImageStat
import os
W,H=288,162; PAD=10
A='public/archive/'; O='public/vig/'
def edge(im):
    w,h=im.size; px=[im.getpixel((x,y)) for x in range(0,w,max(1,w//40)) for y in (0,h-1)]+[im.getpixel((x,y)) for y in range(0,h,max(1,h//40)) for x in (0,w-1)]
    return tuple(sorted(c[i] for c in px)[len(px)//2] for i in range(3))
def fit(p, bg=None, crop=None):
    im=Image.open(p).convert('RGB')
    if crop: im=im.crop(crop)
    b=bg or edge(im); im.thumbnail((W-2*PAD,H-2*PAD),Image.LANCZOS)
    out=Image.new('RGB',(W,H),b); out.paste(im,((W-im.width)//2,(H-im.height)//2)); return out
def save(fr,name,dur):
    fr[0].save(O+name+'.webp',save_all=True,append_images=fr[1:],duration=dur,loop=0,quality=84,method=6)
    fr[0].save(O+name+'.still.webp',quality=84,method=6)  # image fixe : « Réduire les animations »
a=lambda *n:[fit(A+f'{x}.webp') for x in n]
sh=lambda *i:[fit(f'tools/heraldry-frames/h{k:02d}.png',bg=(0,0,0),crop=(60,40,640,560)) for k in i]
w=lambda *p:[fit('public/work/'+x,bg=(22,22,22)) for x in p]
# accueil
save(a('05','59','14','65','66'),'h-lettres',700)
save(a('41','48','39','61','28','45'),'h-identites',700)
save(a('27','20','17','60','23','44'),'h-images',700)
fr=[]; hand=a('07','37','13'); code=sh(0,3,7)
for x,y in zip(hand,code): fr+= [x,y]
save(fr,'h-main-code',700)
save(a('55','40','63')+w('bms-esport/cover.webp','sports-aventure/cover.webp'),'h-clients',800)
# à propos
save(a('62','50','31','26','42','01'),'v-logo',700)
save(a('04','49','52','32'),'v-lettre',800)
save(sh(*range(14)),'v-code',420)
save(a('24','47','56','64','58'),'v-pochette',700)
save(w('bms-esport/cover.webp','bms-esport/02.webp','sports-aventure/cover.webp','sports-aventure/03.webp','hotshot/cover.webp'),'v-site',900)
names=['h-lettres','h-identites','h-images','h-main-code','h-clients','v-logo','v-lettre','v-code','v-pochette','v-site']
board=Image.new('RGB',(10+6*(W+10),len(names)*(H+10)+10),'white')
for r,n in enumerate(names):
    im=Image.open(O+n+'.webp')
    for f in range(min(6,im.n_frames)): im.seek(f); board.paste(im.convert('RGB'),(10+f*(W+10),10+r*(H+10)))
board.save('_to_delete/vignettes-planche.jpg',quality=82)
print({n:os.path.getsize(O+n+'.webp') for n in names})
