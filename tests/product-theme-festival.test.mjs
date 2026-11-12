import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("festival always includes available products beyond the manually pinned first item",()=>{
 const page=read("src/app/page.tsx");
 assert.match(page,/\.\.\.chosen,\.\.\.discounted\.filter/);
 assert.match(page,/inStock\.filter/);
 assert.match(page,/\.slice\(0,12\)/);
 assert.match(page,/data-festival-product-count=\{saleProducts\.length\}/);
 assert.match(page,/id="festival-products"/);
 assert.match(page,/href=\{festival\.target\.kind==="products"\?"#festival-products":targetUrl/);
});
test("product photo background is the store theme, with an image frame that never shifts ratio",()=>{
 const media=read("src/app/product-theme-polish.css");
 const card=read("src/components/ProductCard.tsx");
 const layout=read("src/app/layout.tsx");
 assert.match(layout,/product-theme-polish\.css/);
 assert.match(media,/--store-product-frame:/);
 assert.match(media,/aspect-ratio:4\/5!important/);
 assert.match(media,/background:var\(--store-product-frame\)!important/);
 assert.match(media,/focus-within/);
 assert.match(media,/@media\(hover:none\)/);
 assert.doesNotMatch(card,/onLoad=\{event=>/);
 assert.doesNotMatch(card,/naturalWidth.*naturalHeight/);
});
test("desktop/mobile QA checks eight sale products and captures an actual festival screenshot",()=>{
 const qa=read("scripts/test-admin-browser.mjs");
 const smoke=read(".github/workflows/production-smoke.yml");
 assert.match(qa,/discountedCards>=8/);
 assert.match(qa,/storefront-festival\.png/);
 assert.match(qa,/merch\.ratio>/);
 assert.match(smoke,/data-festival-product-count/);
 assert.match(smoke,/visible<8|visible < 8/);
});
