#!/usr/bin/env python3
"""Make the item IN the photo match the showroom palette, without changing
merchant uploads, card backgrounds or the existing page design.

This is a selective item-color grade, not a flat tint across the whole photo:
warm leather and apparel turn cool in Edition 01; blue products turn warm neutral
in Edition 02. Shadows, texture, light and neutral whites are retained.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

parser=argparse.ArgumentParser()
parser.add_argument("--palette",choices=["cool","smoky"],required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
source=root/"public/images/curated"
output=root/("public/images/palette-cool-v1" if args.palette=="cool" else "public/images/palette-smoky-v1")
output.mkdir(parents=True,exist_ok=True)
paths=sorted(source.glob("*.webp"))
assert len(paths)>=12,f"Expected curated product photographs, found {len(paths)}"
processed=[]

for file in paths:
    # The existing matching hero campaign is kept as-is. Only the actual
    # product/editorial imagery is retouched.
    if args.palette=="cool" and file.name in {"hero-woman.webp","hero-mobile.webp"}:
        continue
    im=Image.open(file).convert("RGB")
    w,h=im.size
    orig=np.asarray(im,dtype=np.float32)
    hsv=np.asarray(im.convert("HSV"),dtype=np.float32)
    H,S,V=hsv[:,:,0],hsv[:,:,1],hsv[:,:,2]
    yy,xx=np.mgrid[0:h,0:w].astype(np.float32)
    xn=(xx/(w-1)-.5)*2
    yn=(yy/(h-1)-.5)*2
    central=np.clip(1.55-(xn/.95)**2*.36-(yn/1.12)**2*.30,.42,1.)
    mask=np.zeros((h,w),dtype=np.float32)
    new=hsv.copy()
    product_photo=("products-" in file.name or file.name in {"bag.webp","sneakers.webp","linen-shirt.webp","sunglasses.webp","classic-watch.webp"})
    if args.palette=="cool":
        # Brown/tan/orange materials become muted sky blue, dusty blue
        # or midnight slate blue, retaining the original material highlights.
        warm=(((H<38)|(H>246)) & (S>31) & (V>38))
        # Shift natural brown material without painting faces pure blue:
        # face area in editorial images is softly protected.
        skin_protection=np.ones((h,w),dtype=np.float32)
        if not product_photo:
            face=(xn>-.36)&(xn<.36)&(yn<-.24)
            skin_protection[face]=.42
        new[:,:,0]=np.where(warm,146+(H/38)*8,H)
        new[:,:,1]=np.where(warm,np.clip(76+S*.24,65,145),S)
        mask=np.where(warm,.91*central*skin_protection,mask)
        # Desaturated silver and white products keep their clean white
        # highlights with a slight cool-toned material shadow.
        neutral=(S<54)&(V>115)&(V<235)
        new[:,:,0]=np.where(neutral,147,new[:,:,0])
        new[:,:,1]=np.where(neutral,36,new[:,:,1])
        mask=np.maximum(mask,np.where(neutral,.20*central,0))
        # Very dark leather can read cold graphite / navy without
        # flattening the fabric grain and contrast.
        charcoal=(S<65)&(V>45)&(V<105)&product_photo
        new[:,:,0]=np.where(charcoal,156,new[:,:,0])
        new[:,:,1]=np.where(charcoal,72,new[:,:,1])
        mask=np.maximum(mask,np.where(charcoal,.28*central,0))
    else:
        # Remove unrelated bright blue clothing, shoes and handbags from
        # the taupe / charcoal luxury product collection.
        cool=(H>115)&(H<194)&(S>36)&(V>28)
        new[:,:,0]=np.where(cool,19+(H-115)/80*5,H)
        new[:,:,1]=np.where(cool,np.clip(65+S*.26,66,135),S)
        mask=np.where(cool,.90*central,mask)
        # Cognac leather replaces red/salmon bags in the smoky collection.
        # Shift the item material itself; never alter the UI container.
        red=(H<18)&(S>90)&(V>60)&("bag" in file.name)
        new[:,:,0]=np.where(red,18,new[:,:,0])
        new[:,:,1]=np.where(red,136,new[:,:,1])
        new[:,:,2]=np.where(red,np.clip(V*.72,0,255),new[:,:,2])
        mask=np.maximum(mask,np.where(red,.94*central,0))
        # Neutral cream materials become soft ivory rather than cold blue.
        neutral=(S<44)&(V>126)&(V<244)
        new[:,:,0]=np.where(neutral,21,new[:,:,0])
        new[:,:,1]=np.where(neutral,33,new[:,:,1])
        mask=np.maximum(mask,np.where(neutral,.18*central,0))
        # Deep colors stay charcoal; existing brown/taupe remains unmodified.
    mask=np.asarray(Image.fromarray(np.uint8(np.clip(mask,0,1)*255),"L").filter(ImageFilter.GaussianBlur(radius=max(3,int(min(w,h)*.006)))),dtype=np.float32)/255.
    tint=np.asarray(Image.fromarray(np.uint8(np.clip(new,0,255)),"HSV").convert("RGB"),dtype=np.float32)
    rgb=np.uint8(np.clip(orig*(1-mask[:,:,None])+tint*mask[:,:,None],0,255))
    out=output/file.name
    Image.fromarray(rgb,"RGB").save(out,"WEBP",quality=90,method=6)
    processed.append((file.name,out.stat().st_size))
assert len(processed)>=10,"No product photographs were retouched"
print(f"[PALETTE] {args.palette}: {len(processed)} photos changed; output={output}")
for name,size in processed:
    print(f"[PALETTE] {name} {size} bytes")
