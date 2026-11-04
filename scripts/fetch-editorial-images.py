"""Build the 13 distinct, local editorial demo images from Pexels free photo originals.

Each source below was selected from a published Pexels photo page with a visible
free-license label. Direct CDN image URLs avoid the 401/429 download-page blocker.
Provenance is kept in public/images/editorial/manifest.json. These are only
fictional storefront demo images, not representations of products for sale.
"""
from pathlib import Path
from io import BytesIO
import json
import time
import requests
from PIL import Image, ImageOps

# slug, Pexels public photo ID, photographer, semantic subject, target max width
PHOTOS = [
 ("hero-main",31845548,"rasul lotfi","cream editorial fashion portrait",1600),
 ("hero-mobile",9853293,"Ron Lach","beige fashion study",1100),
 ("category-clothing",8346027,"Ron Lach","minimal clothing rail with intentional negative space",1800),
 ("category-bags",8502477,"Mohamed Hergafi","brown leather handbag",1200),
 ("category-shoes",13560373,"Sandro Tavares","white sneakers",1200),
 ("category-accessories",2433862,"julie aagaard","leather accessory editorial",1200),
 ("campaign",8484082,"Sasha Kim","two-model beige fashion campaign",1700),
 ("story-portrait",3888214,"cottonbro studio","tailored beige blazer fashion",1300),
 ("story-detail",10340652,"Kristian Bøgh","brown leather detail macro",1000),
 ("chapter-form",10084484,"Iryna Khamulyak","neutral catwalk form",1400),
 ("chapter-detail",9853292,"Ron Lach","atelier fabric and dress details",1400),
 ("journal-style",19354531,"Berna","woman holding leather bag and book",1200),
 ("journal-details",30330369,"Jimmy Elizarraras","minimalist fashion portrait",1200),
]
out=Path("public/images/editorial")
out.mkdir(parents=True,exist_ok=True)
session=requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0","Accept":"image/jpeg,image/webp,image/*"})
manifest={"license":"https://www.pexels.com/license/","source":"Pexels free editorial demo photographs","assets":[],"failed":[]}
for name,photo_id,photographer,subject,width in PHOTOS:
    url=f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w={width}"
    page=f"https://www.pexels.com/photo/{photo_id}/"
    error=""
    content=None
    for attempt in range(3):
        try:
            response=session.get(url,timeout=(20,90))
            response.raise_for_status()
            if not response.headers.get("Content-Type","").startswith("image/"):
                raise RuntimeError("Unexpected non-image content")
            content=response.content
            break
        except Exception as exc:
            error=str(exc)
            time.sleep(1.4*(attempt+1))
    if content is None:
        manifest["failed"].append({"name":name,"source":page,"error":error})
        print("FAILED",name,error,flush=True)
        continue
    try:
        image=ImageOps.exif_transpose(Image.open(BytesIO(content))).convert("RGB")
        if image.width>width:image.thumbnail((width,3000),Image.Resampling.LANCZOS)
        if image.width<750 or image.height<600:
            raise RuntimeError(f"Source resolution too small: {image.size}")
        dest=out/f"{name}.webp"
        image.save(dest,format="WEBP",quality=87,method=6)
        if dest.stat().st_size<25000:
            raise RuntimeError(f"Unexpectedly small output {dest.stat().st_size} B")
        manifest["assets"].append({"name":name,"file":str(dest),"source":page,
            "cdnUrl":url,"photographer":photographer,"subject":subject,
            "pixels":[image.width,image.height],"bytes":dest.stat().st_size})
        print("SAVED",dest,image.size,dest.stat().st_size,flush=True)
    except Exception as exc:
        manifest["failed"].append({"name":name,"source":page,"error":str(exc)})
        print("INVALID",name,exc,flush=True)
(out/"manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("ASSET RESULT",len(manifest["assets"]),"of",len(PHOTOS))
if len(manifest["assets"])!=len(PHOTOS):
    raise SystemExit(f"Not publishing an incomplete photo set: {len(manifest['assets'])}/{len(PHOTOS)}")
