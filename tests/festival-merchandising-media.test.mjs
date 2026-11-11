import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("homepage festival has a full eligible catalog, without fake discount percentages",()=>{
 const page=read("src/app/page.tsx");
 assert.match(page,/const inStock=store\.products\.filter\(p=>p\.inventory>0\)/);
 assert.match(page,/\.slice\(0,12\)/);
 assert.match(page,/festival\.productIds\?\.map\(id=>inStock\.find/);
 assert.match(page,/discounted\.some\(d=>d\.id===p\.id\)/);
});
test("admin can select existing or create a real saved sale product",()=>{
 const manager=read("src/components/admin/FestivalProductManager.tsx");
 const editor=read("src/components/admin/EditionTwoHomeEditor.tsx");
 const api=read("src/app/api/admin/edition-2/route.ts");
 const schema=read("src/lib/admin/edition-two-schema.ts");
 assert.match(manager,/انتخاب از محصولات موجود/);
 assert.match(manager,/افزودن محصول جدید/);
 assert.match(manager,/adminFetch\("\/api\/admin\/products"/);
 assert.match(manager,/comparePrice:original/);
 assert.match(manager,/status:"ACTIVE"/);
 assert.match(editor,/FestivalProductManager/);
 assert.match(editor,/onCreated=\{item=>setCatalog/);
 assert.match(schema,/productIds:z\.array\(z\.string\(\)\.max\(150\)\)\.max\(12\)/);
 assert.match(api,/found\.inventory<=0/);
 assert.doesNotMatch(api,/found\.comparePrice<=found\.price/);
});
test("photo images are prepared at build time, with local fallback and no letterbox contain",()=>{
 const packageJson=read("package.json");
 const script=read("scripts/prepare-curated-media.mjs");
 const photos=read("src/lib/showcase-photos.ts");
 const styles=read("src/app/visual-upgrade.css");
 assert.match(packageJson,/node scripts\/prepare-curated-media\.mjs/);
 assert.match(script,/copyFile\(join\(root,"public\/images"/);
 assert.match(script,/images\.unsplash\.com/);
 assert.match(script,/generatedShowcasePhotos/);
 assert.match(photos,/generatedShowcasePhotos\[key\]/);
 assert.match(styles,/object-fit:cover!important/);
 assert.doesNotMatch(styles,/object-fit:contain!important/);
});
