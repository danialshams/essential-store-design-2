/** Build-time image pipeline: images are served by OUR domain, not a third-party CDN.
 * If a licensed photo cannot be retrieved, a verified local asset is installed
 * instead. This never modifies administrator-uploaded images.
 */
import {mkdir,copyFile,writeFile,readFile} from "node:fs/promises";
import {join,dirname} from "node:path";
const root=process.cwd();
const entries=[
 [
  "editorial/chapter-detail.webp",
  "photo-1539533018447-63fcce2678e3",
  "editorial/chapter-form.webp",
  1600
 ],
 [
  "editorial/hero-main.webp",
  "photo-1503341504253-dff4815485f1",
  "editorial/story-portrait.webp",
  1600
 ],
 [
  "editorial/hero-mobile.webp",
  "photo-1503342217505-b0a15ec3261c",
  "editorial/chapter-form.webp",
  1100
 ],
 [
  "editorial/story-detail.webp",
  "photo-1548036328-c9fa89d128fa",
  "products/bag-main.webp",
  1400
 ],
 [
  "editorial/campaign.webp",
  "photo-1551803091-e20673f15770",
  "editorial/story-portrait.webp",
  1400
 ],
 [
  "editorial/story-portrait.webp",
  "photo-1539008835657-9e8e9680c956",
  "editorial/chapter-form.webp",
  1400
 ],
 [
  "editorial/chapter-form.webp",
  "photo-1515886657613-9f3515b0c78f",
  "editorial/chapter-form.webp",
  1400
 ],
 [
  "editorial/category-clothing.webp",
  "photo-1512436991641-6745cdb1723f",
  "editorial/chapter-form.webp",
  1200
 ],
 [
  "editorial/category-bags.webp",
  "photo-1566150905458-1bf1fc113f0d",
  "products/bag-main.webp",
  1200
 ],
 [
  "editorial/category-shoes.webp",
  "photo-1600185365483-26d7a4cc7519",
  "products/sneakers-urban.webp",
  1200
 ],
 [
  "editorial/category-accessories.webp",
  "photo-1572635196237-14b3f281503f",
  "products/sunglasses-main.webp",
  1200
 ],
 [
  "editorial/journal-style.webp",
  "photo-1525507119028-ed4c629a60a3",
  "editorial/chapter-form.webp",
  1200
 ],
 [
  "editorial/journal-details.webp",
  "photo-1490481651871-ab68de25d43d",
  "products/bag-main.webp",
  1200
 ],
 [
  "hero-woman.webp",
  "photo-1539533018447-63fcce2678e3",
  "editorial/chapter-form.webp",
  1600
 ],
 [
  "hero-mobile.webp",
  "photo-1503341504253-dff4815485f1",
  "editorial/story-portrait.webp",
  1100
 ],
 [
  "bag.webp",
  "photo-1548036328-c9fa89d128fa",
  "products/bag-main.webp",
  1200
 ],
 [
  "sneakers.webp",
  "photo-1600185365483-26d7a4cc7519",
  "products/sneakers-main.webp",
  1200
 ],
 [
  "linen-shirt.webp",
  "photo-1503342217505-b0a15ec3261c",
  "products/shirt-blue.webp",
  1200
 ],
 [
  "sunglasses.webp",
  "photo-1572635196237-14b3f281503f",
  "products/sunglasses-main.webp",
  1200
 ],
 [
  "products/bag-main.webp",
  "photo-1566150905458-1bf1fc113f0d",
  "products/bag-main.webp",
  1100
 ],
 [
  "products/sneakers-main.webp",
  "photo-1460353581641-37baddab0fa2",
  "products/sneakers-main.webp",
  1100
 ],
 [
  "products/shirt-blue.webp",
  "photo-1539008835657-9e8e9680c956",
  "products/shirt-blue.webp",
  1100
 ],
 [
  "products/watch-main.webp",
  "photo-1523275335684-37898b6baf30",
  "products/watch-main.webp",
  1100
 ],
 [
  "products/bag-everyday.webp",
  "photo-1553062407-98eeb64c6a62",
  "products/bag-everyday.webp",
  1100
 ],
 [
  "products/sneakers-urban.webp",
  "photo-1549298916-b41d501d3772",
  "products/sneakers-urban.webp",
  1100
 ],
 [
  "products/shirt-beige.webp",
  "photo-1512436991641-6745cdb1723f",
  "products/shirt-beige.webp",
  1100
 ],
 [
  "products/sunglasses-main.webp",
  "photo-1511499767150-a48a237f0083",
  "products/sunglasses-main.webp",
  1000
 ]
];
const photos={};let fetched=0;let fallback=0;
const queue=[...entries];const failures=[];
async function worker(){
 while(queue.length){
  const row=queue.shift();if(!row)break;
  const [key,id,fallbackFile,width]=row;
  const target="/images/curated/"+key.replaceAll("/","-");
  const destination=join(root,"public"+target);
  await mkdir(dirname(destination),{recursive:true});
  // Guaranteed usable even when no internet is available during a build.
  await copyFile(join(root,"public/images",fallbackFile),destination);
  photos["/images/"+key]=target;
  try{
   if(process.env.CURATED_PHOTOS_OFFLINE==="1")throw Error("offline fixture mode");
   const url="https://images.unsplash.com/"+id+"?fm=webp&fit=crop&w="+width+"&q=84";
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
console.log("[photos] "+fetched+"/"+entries.length+" new editorial photos bundled; "+fallback+" local fallbacks");
if(failures.length)console.log("[photos] fallback list:",failures.join("; "));
