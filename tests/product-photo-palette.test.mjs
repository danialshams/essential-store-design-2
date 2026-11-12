import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync,readdirSync,statSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>readFileSync(p,"utf8");
test("Actual locally retouched product photographs are published in smoky collection",()=>{
 const folder="public/images/palette-smoky-v1";
 assert.ok(existsSync(folder),"Versioned photo assets must be committed before merging");
 const files=readdirSync(folder).filter(x=>x.endsWith(".webp"));
 assert.ok(files.length>=25,"Expected coherent product images, not just CSS backgrounds");
 for(const file of files){
  const b=readFileSync(folder+"/"+file);
  assert.ok(b.length>18000,file+" was not an actual high-resolution product photo");
  assert.equal(b.toString("ascii",0,4),"RIFF");
  assert.equal(b.toString("ascii",8,12),"WEBP");
 }
 const original=readFileSync("public/images/curated/products-bag-main.webp");
 const recolored=readFileSync(folder+"/products-bag-main.webp");
 assert.notEqual(createHash("sha256").update(original).digest("hex"),createHash("sha256").update(recolored).digest("hex"),
 "The product itself must be recolored, not only its surrounding container");
});
test("Both old catalog and persisted CMS preview photos resolve to the new versioned local paths",()=>{
 const builder=read("scripts/prepare-curated-media.mjs");
 const mapper=read("src/lib/showcase-photos.ts");
 assert.match(builder,/palette-smoky-v1/);
 assert.match(builder,/photos\[target\]=finalTarget/);
 assert.match(mapper,/generatedShowcasePhotos\[key\]/);
 assert.match(mapper,/previouslyExternal/);
});
test("A product photo color pipeline exists independently of site frame colors",()=>{
 const script=read("scripts/colorgrade-product-media.py");
 assert.match(script,/public\/images\/curated/);
 assert.match(script,/Image\.fromarray\(rgb,"RGB"\)\.save/);
 assert.match(script,/mask\[\:\,\:\,None\]/);
 assert.match(script,/product_photo/);
});
