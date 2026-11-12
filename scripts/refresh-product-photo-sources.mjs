/** Replace a few proven mismatched source photographs with actual shirts.
 * Downloads only explicit free Unsplash editorial IDs, checks WebP magic,
 * and stores them in our own repo. All existing owner-uploaded photos are untouched.
 */
import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {entries} from "./curated-photo-manifest.mjs";
const keys=process.env.GITHUB_REPOSITORY?.endsWith("design-1")
 ?["linen-shirt.webp","products/shirt-blue.webp"]
 :["products/shirt-blue.webp"];
let fixed=0;
for(const key of keys){
 const entry=entries.find(row=>row[0]===key);
 if(!entry)throw new Error("Curated source missing "+key);
 const [name,id,_fallback,width,height]=entry;
 const dest=join(process.cwd(),"public/images/curated",name.replaceAll("/","-"));
 const u="https://images.unsplash.com/"+id+"?fm=webp&fit=crop&crop=entropy&w="+width+"&h="+height+"&q=85";
 const r=await fetch(u,{signal:AbortSignal.timeout(15000)});
 if(!r.ok||!(r.headers.get("content-type")||"").startsWith("image/"))throw new Error("Unexpected stock photo response "+name+" "+r.status);
 const bytes=Buffer.from(await r.arrayBuffer());
 if(bytes.length<18000||bytes.toString("ascii",0,4)!=="RIFF"||bytes.toString("ascii",8,12)!=="WEBP")
  throw new Error("Invalid WebP for "+name);
 await writeFile(dest,bytes);
 console.log("[shirt-photo] "+name+": "+id+" "+bytes.length+" bytes");
 fixed++;
}
if(fixed!==keys.length)throw new Error("Not all matching shirt photos were fetched");
