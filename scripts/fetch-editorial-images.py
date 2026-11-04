"""Import separately licensed, high-resolution Unsplash demo photography.

Each selected photograph is identified by its verified free Unsplash photo ID.
Only demo fallback assets: real merchant uploads from the admin remain authoritative.
The source manifest preserves photographer/photo attribution and usage provenance.
"""
from pathlib import Path
import io
import json
import time
import requests
from PIL import Image, ImageOps

ASSETS = [
    ("hero-main",       "8f4Gq4IoXEY", 1600, "Redd Francisco", "fashion editorial portrait"),
    ("hero-mobile",     "IDC7g-ccgv0", 1100, "Dmitry Reshetnikov", "beige trench coat"),
    ("category-clothing", "bEN4kFj4Fm8", 1200, "lena ruffinatto", "neutral fashion"),
    ("category-bags",  "jCTG4bl-gMI", 1200, "Ansuman Mishra", "brown handbag"),
    ("category-shoes", "r_9YnoTmfQI", 1200, "Jonathan Borba", "shoes and watch"),
    ("category-accessories", "cMP0tw8uZ28", 1200, "Valentina Schick", "neutral accessory flatlay"),
    ("campaign",        "MOXm5jc8I0A", 1800, "Khaled Ghareeb", "beige couture fashion"),
    ("story-portrait",  "6FRQpPxqF-o", 1400, "Artem Artemov", "fashion portrait"),
    ("story-detail",    "JAn9b51aFE4", 1000, "Amari Shutters", "handbag closeup"),
    ("chapter-form",    "_ZGvkavajjQ", 1500, "morgane leisser", "fashion study"),
    ("chapter-detail", "NrYN2sYd9sg", 1500, "Apostolos Vamvouras", "natural light portrait"),
    ("journal-style",  "888HU1GauzY", 1300, "mr lee", "editorial styling flatlay"),
    ("journal-details", "FxxokxEX4nI", 1300, "Filipp Romanovski", "fashion editorial"),
]
out = Path("public/images/editorial")
out.mkdir(parents=True, exist_ok=True)
session = requests.Session()
session.headers.update({"User-Agent":"Mozilla/5.0 (compatible; EditorialDemoBot/1.0)", "Accept": "image/avif,image/webp,image/*,*/*"})
manifest = {"license":"https://unsplash.com/license", "assets":[], "failed":[]}
for name, photo, width, photographer, subject in ASSETS:
    url=f"https://unsplash.com/photos/{photo}/download?force=true&w={width}"
    photo_page=f"https://unsplash.com/photos/{photo}"
    data=None
    error=""
    for attempt in range(3):
        try:
            response=session.get(url, timeout=(20,70))
            response.raise_for_status()
            if not response.headers.get("Content-Type","").startswith("image/"):
                raise ValueError(f"Not an image: {response.status_code} {response.url} {response.headers.get('Content-Type')}")
            data=response.content
            break
        except Exception as ex:
            error=str(ex)
            time.sleep(1.5*(attempt+1))
    if not data:
        manifest["failed"].append({"name":name,"photo":photo,"error":error})
        print("SKIPPED", name, error, flush=True)
        continue
    try:
        image=Image.open(io.BytesIO(data))
        image=ImageOps.exif_transpose(image).convert("RGB")
        if image.width > width:
            image.thumbnail((width, max(1,int(image.height*width/image.width))), Image.Resampling.LANCZOS)
        path=out/f"{name}.webp"
        image.save(path,format="WEBP",quality=86,method=6)
        manifest["assets"].append({"name":name,"file":path.as_posix(),"source":photo_page,"photographer":photographer,"subject":subject,"pixels":[image.width,image.height],"bytes":path.stat().st_size})
        print("SAVED",path,image.size,path.stat().st_size,flush=True)
    except Exception as ex:
        manifest["failed"].append({"name":name,"photo":photo,"error":str(ex)})
        print("INVALID",name,ex,flush=True)
(out/"manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
print("RESULT",len(manifest["assets"]),"photos saved;",len(manifest["failed"]),"failed")
if len(manifest["assets"]) < 9:
    raise SystemExit("Insufficient editorial photography; abort to avoid committing incomplete imagery")
