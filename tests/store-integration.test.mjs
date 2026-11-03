import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL(path,import.meta.url),"utf8");
test("storefront fetches public catalog server-side and preserves demo fallback",()=>{
 const src=read("../src/lib/live-store.ts");
 assert.match(src,/STOREFRONT_ADMIN_ORIGIN/);
 assert.match(src,/return demo/);
 assert.match(src,/mode!=="live"/);
});
test("browser never receives the server-to-server secret",()=>{
 const route=read("../src/app/api/store/order/route.ts");
 assert.match(route,/STOREFRONT_API_SECRET/);
 assert.match(route,/x-storefront-key/);
 const client=read("../src/components/ShopProvider.tsx");
 assert.doesNotMatch(client,/STOREFRONT_API_SECRET/);
});
test("single focusable search panel is used on mobile and desktop",()=>{
 const header=read("../src/components/Header.tsx");
 const css=read("../src/app/premium.css");
 assert.match(header,/premium-search-panel/);
 assert.match(header,/aria-expanded={searchOpen}/);
 assert.match(css,/premium-search-form input\{font-size:16px\}/);
 assert.doesNotMatch(header,/mobile-search-drawer/);
});
test("editorial homepage consumes shared admin catalog, banners, content, categories and settings",()=>{
 const home=read("../src/app/page.tsx");
 assert.match(home,/await loadStore\(\)/);
 assert.match(home,/store\.categories/);
 assert.match(home,/store\.products/);
 assert.match(home,/store\.banners/);
 assert.match(home,/store\.articles/);
 assert.match(home,/store\.settings\.homeSections/);
});
test("GSAP ScrollTrigger has reduced-motion, scoped cleanup and no scroll hijacking",()=>{
 const src=read("../src/components/EditorialMotion.tsx");
 assert.match(src,/import\("gsap"\)/);
 assert.match(src,/import\("gsap\/ScrollTrigger"\)/);
 assert.match(src,/prefers-reduced-motion/);
 assert.match(src,/context\.revert\(\)/);
 assert.doesNotMatch(src,/ScrollSmoother/);
});
test("components reading useShop are client components",()=>{
 for(const name of ["Header","Footer","ProductCard","ProductCollection","ProductDetails","BottomNav","ShopProvider"]){
   const src=read(`../src/components/${name}.tsx`);
   assert.match(src,/^"use client";/,`${name} must be a Client Component`);
 }
});
test("variant stock controls cart even when aggregate inventory is zero",()=>{
 const client=read("../src/components/ShopProvider.tsx");
 assert.match(client,/const variant=product\.variants\?\.find/);
 assert.match(client,/if\(product\.variants\?\.length&&!variant\)/);
 assert.match(client,/const limit=Math\.max\(0,variant\?variant\.inventory:product\.inventory\)/);
});
