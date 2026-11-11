/** Persist curated fashion images into source control so every Vercel deployment
 * serves the SAME photographs from this app; not the prior image fallback.
 */
import {mkdir,writeFile,readFile} from "node:fs/promises";
import {existsSync} from "node:fs";
import {join,dirname} from "node:path";
import {entries} from "./curated-photo-manifest.mjs";
const q=[...entries];
let saved=0,present=0,failed=[];
async function worker(){
 while(q.length){
  const row=q.shift();if(!row)break;
  const [key,photo,fallback,width,height]=row;
  const target=join(process.cwd(),"public/images/curated/"+key.replaceAll("/","-"));
  if(existsSync(target)){present++;continue}
  try{
   const url="https://images.unsplash.com/"+photo+"?fit=crop&crop=entropy&fm=webp&w="+width+"&h="+height+"&q=84";
   const response=await fetch(url,{signal:AbortSignal.timeout(12000)});
   const type=response.headers.get("content-type")||"";
   if(!response.ok||!type.startsWith("image/"))throw Error("HTTP "+response.status+" type="+type);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length<13000||bytes.length>6*1024*1024)throw Error("Unexpected size "+bytes.length);
   // The WebP magic bytes protect against HTML CDN block responses.
   if(bytes.toString("ascii",0,4)!=="RIFF"||bytes.toString("ascii",8,12)!=="WEBP")
    throw Error("File is not WebP");
   await mkdir(dirname(target),{recursive:true});
   await writeFile(target,bytes);saved++;
  }catch(err){failed.push(key+": "+String(err?.message||err))}
 }
}
await Promise.all(Array.from({length:5},worker));
console.log("[curated-sync] "+saved+" photographed new + "+present+" existing / "+entries.length+" requested");
if(failed.length)console.log("[curated-sync] missing photos:",failed.join("; "));
if(saved+present<Math.ceil(entries.length*0.55)){
 console.error("[curated-sync] too few real refreshed photos; do not ship old stand-ins");
 process.exitCode=1;
}
