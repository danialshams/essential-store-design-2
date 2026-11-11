import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("festival has matching admin types, Zod persistence, API target validation and published public content",()=>{
 const types=read("src/lib/admin/edition-two.ts"),schema=read("src/lib/admin/edition-two-schema.ts");
 const publicData=read("src/lib/edition-two-content.ts"),api=read("src/app/api/admin/edition-2/route.ts");
 assert.match(types,/festival:EdFestival/);
 assert.match(types,/festival:\{enabled:true,productIds:\[\]/);
 assert.match(schema,/festival:copy\.extend\(\{enabled:z\.boolean\(\)/);
 assert.match(schema,/productIds:z\.array/);
 assert.match(schema,/sectionOrder:z\.array/);
 assert.match(publicData,/festival\?:FestivalContent/);
 assert.match(api,/config\.festival\.enabled\?\[config\.festival\.target\]/);
 assert.match(api,/editorialDraft/);
 assert.match(api,/editorialConfig/);
 assert.match(api,/config\.festival\.productIds/);
});
test("one optional festival is edited visually, independently enabled/disabled, with accessible publish notice",()=>{
 const editor=read("src/components/admin/EditionTwoHomeEditor.tsx");
 assert.match(editor,/id="festival" rank=\{sectionRank\("festival"\)\} selected=\{selected\}/);
 assert.match(editor,/selected==="festival"/);
 assert.match(editor,/v\.festival\.enabled=e\.target\.checked/);
 assert.match(editor,/festival\.mobileImageUrl/);
 assert.match(editor,/confirmation|verification/);
 assert.match(editor,/role="status"/);
 assert.match(editor,/ed2-section-arrangement-list/);
 assert.match(editor,/onDragStart/);
 assert.match(editor,/reorderSections/);
 assert.match(editor,/محصولات تخفیف‌دار جشنواره/);
 const publicHome=read("src/app/page.tsx");
 assert.match(publicHome,/festival\.enabled/);
 assert.match(publicHome,/targetUrl\(festival\.target,store\)/);
 assert.match(publicHome,/saleProducts/);
 assert.match(publicHome,/comparePrice/);
 assert.match(publicHome,/sectionOrder\.map\(id=><Fragment/);
 assert.match(read("src/app/layout.tsx"),/festival\.css/);
});
test("festival design language differs between the two independently deployed stores",()=>{
 const home=read("src/app/page.tsx"),css=read("src/app/festival.css");
 assert.match(home,/ed2-sale-festival/);
 assert.match(css,/ed2-sale-festival/);
 assert.match(css,/@media\(max-width:/);
 assert.match(css,/prefers-reduced-motion/);
});

test("sale festival shows up to eight products, matching the admin selection limit",()=>{
 const page=read("src/app/page.tsx");
 const schema=read("src/lib/admin/edition-two-schema.ts");
 const editor=read("src/components/admin/EditionTwoHomeEditor.tsx");
 assert.match(page,/discounted\)\.slice\(0,8\)/);
 assert.match(schema,/productIds:z\.array\(z\.string\(\)\.max\(150\)\)\.max\(8\)/);
 assert.match(editor,/max=\{8\}/);
});

test("visual editor festival mirrors product grid and both original/current prices",()=>{
 const editor=read("src/components/admin/EditionTwoHomeEditor.tsx");
 const styles=read("src/app/festival.css");
 assert.match(editor,/ed2-preview-sale-prices/);
 assert.match(editor,/تصاویر جشنواره از تصاویر محصولات/);
 assert.doesNotMatch(editor,/photoField\("تصویر جشنواره"/);
 assert.match(styles,/Match visual CMS preview to the published product-grid festival/);
});
