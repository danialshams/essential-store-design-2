import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const read=(path)=>readFileSync(path,"utf8");
test("all curated demo photo aliases resolve to bundled image files",()=>{
 const mappings=read("src/lib/showcase-photos.ts");
 const references=[...mappings.matchAll(/^\s*"(\/images\/[^"]+)":"(\/images\/[^"]+)"[,]?$/gm)];
 assert.ok(references.length>=12,"The bundled asset registry should cover homepage and product cards");
 const broken=references.filter(([,original,actual])=>!existsSync("public"+actual));
 assert.deepEqual(broken.map(([,original,actual])=>original+" -> "+actual),[],
  "Every photo replacement must exist in the repository before deploying");
 assert.doesNotMatch(mappings,/"\/images\/[^"]+":"https:\/\/images\.unsplash\.com/,
  "No default photo may depend on the Unsplash CDN");
 assert.match(mappings,/raw\.startsWith\("https:\/\/images\.unsplash\.com\/"\)/,
  "Previously published external demo URLs need safe local equivalents");
 assert.match(mappings,/raw\.startsWith\("https:\/\/essential-store-design-"\)/,
  "Previously published first-party absolute URLs must resolve locally");
});
test("live product and hero images always go through the safe registry",()=>{
 const catalog=read("src/lib/catalog.ts");
 const home=read("src/app/page.tsx");
 assert.match(catalog,/gallery:p\.gallery\.map\(showcasePhoto\)/);
 assert.match(home,/showcasePhoto/);
});
