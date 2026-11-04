"""Acquire 8 distinct Pexels-licensed fashion demo product photographs.
Only apply to demo fixtures in catalog.ts; real merchant photos always win.
"""
from pathlib import Path
from io import BytesIO
import requests,json,time
from PIL import Image,ImageOps
PHOTOS=[
 ("bag-main",22434775,"Muneeb Malhotra","leather handbags studio"),
 ("sneakers-main",14174467,"Luis Quintero","neutral modern sneaker product"),
 ("shirt-blue",9558723,"MART PRODUCTION","blue button-up shirt on rack"),
 ("watch-main",30838490,"Erik Mclean","minimal white-face leather watch"),
 ("bag-everyday",26316180,"Gül Işık","leather handbag editorial"),
 ("sneakers-urban",1456735,"Ray Piedra","beige lifestyle sneakers"),
 ("shirt-beige",11671275,"Marina Podrez","beige linen shirt on rack"),
 ("sunglasses-main",29538715,"Amar Preciado","tortoiseshell sunglasses on beige"),
]
output=Path("public/images/products")
output.mkdir(parents=True,exist_ok=True)
sess=requests.Session()
sess.headers.update({"User-Agent":"Mozilla/5.0","Accept":"image/jpeg,image/webp,image/*"})
manifest={"license":"https://www.pexels.com/license/","type":"visual demo only; not representations of real products","assets":[],"failed":[]}
for name,pid,creator,description in PHOTOS:
    url=f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=1600"
    fail=""
    content=None
    for attempt in range(3):
        try:
            r=sess.get(url,timeout=(15,70))
            r.raise_for_status()
            if not r.headers.get("Content-Type","").startswith("image/"): raise ValueError("Not a photograph")
            content=r.content
            break
        except Exception as err:
            fail=str(err)
            time.sleep(1.2*(attempt+1))
    if content is None:
        manifest["failed"].append({"name":name,"error":fail})
        print("FAILED",name,fail,flush=True)
        continue
    try:
        im=ImageOps.exif_transpose(Image.open(BytesIO(content))).convert("RGB")
        if im.width<800 or im.height<600: raise ValueError(f"Original too small: {im.size}")
        if im.width>1600:im.thumbnail((1600,2200),Image.Resampling.LANCZOS)
        path=output/f"{name}.webp"
        im.save(path,format="WEBP",quality=89,method=6)
        if path.stat().st_size<22000:raise ValueError(f"Unexpectedly small WebP: {path.stat().st_size}")
        manifest["assets"].append({"name":name,"file":str(path),"source":f"https://www.pexels.com/photo/{pid}/",
         "photographer":creator,"description":description,"width":im.width,"height":im.height,"bytes":path.stat().st_size})
        print("SAVED",name,im.size,path.stat().st_size,flush=True)
    except Exception as err:
        manifest["failed"].append({"name":name,"error":str(err)})
        print("INVALID",name,err,flush=True)
(output/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PRODUCT DEMO RESULT",len(manifest["assets"]),"/",len(PHOTOS),flush=True)
if len(manifest["assets"])!=len(PHOTOS):raise SystemExit("Incomplete demo product photo set")
