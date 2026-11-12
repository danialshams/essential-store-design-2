/** Build-time image pipeline: images are served by OUR domain, not a third-party CDN.
 * If a licensed photo cannot be retrieved, a verified local asset is installed
 * instead. This never modifies administrator-uploaded images.
 */
import {mkdir,copyFile,writeFile,access} from "node:fs/promises";
import {entries} from "./curated-photo-manifest.mjs";
import {join,dirname} from "node:path";
import {existsSync} from "node:fs";
const root=process.cwd();
const photos={};;let fetched=0;let fallback=0;let retained=0;
const queue=[...entries];const failures=[];
async function worker(){
 while(queue.length){
  const row=queue.shift();if(!row)break;
  const [key,id,fallbackFile,width,height]=row;
  const target="/images/curated/"+key.replaceAll("/","-");
  const destination=join(root,"public"+target);
  const paletteTarget="/images/palette-smoky-v1/"+key.replaceAll("/","-");
  const finalTarget=existsSync(join(root,"public"+paletteTarget))?paletteTarget:target;
  // Cache-busting path to the actual recolored product file, never a CSS overlay.
  photos["/images/"+key]=finalTarget;
  photos[target]=finalTarget;
  await mkdir(dirname(destination),{recursive:true});
  // Guaranteed usable even when no internet is available during a build.
  try{await access(destination);retained++;continue;}catch{/* prepare missing file */}
  await copyFile(join(root,"public/images",fallbackFile),destination);
  try{
   if(process.env.CURATED_PHOTOS_OFFLINE==="1")throw Error("offline fixture mode");
   const url="https://images.unsplash.com/"+id+"?fm=webp&fit=crop&crop=entropy&w="+width+"&h="+height+"&q=84";
   const response=await fetch(url,{signal:AbortSignal.timeout(6200)});
   if(!response.ok||!String(response.headers.get("content-type")).startsWith("image/"))throw Error("HTTP "+response.status);
   const body=Buffer.from(await response.arrayBuffer());
   if(body.length<12000||body.length>5*1024*1024)throw Error("invalid image size "+body.length);
   await writeFile(destination,body);fetched++;
  }catch(error){fallback++;failures.push(key+": "+String(error?.message||error))}
 }
}
await Promise.all(Array.from({length:5},()=>worker()));
const output="/** AUTO-GENERATED at build time; all files are local and bundled in /public. */\n"+
 "export const generatedShowcasePhotos:Record<string,string>="+JSON.stringify(photos,null,1)+";\n";
await writeFile(join(root,"src/lib/generated-showcase-photos.ts"),output);
console.log("[photos] "+(fetched+retained)+"/"+entries.length+" refreshed editorial photos (new="+fetched+", persisted="+retained+"); "+fallback+" local fallbacks");
if(failures.length)console.log("[photos] fallback list:",failures.join("; "));
