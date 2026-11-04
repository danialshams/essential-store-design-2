import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
const load=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
test("Maison navigation keeps accessible focus and preserves editorial photo transitions",()=>{
 const head=load("src/components/Header.tsx"),css=load("src/app/cinematic.css");
 for(const pattern of [/aria-expanded=\{menuOpen\}/,/aria-controls="maison-menu"/,/trapMenuFocus/,/premium-drawer-root/,/premium-drawer-editorial/,/showMenuPhoto/,/\.decode\(\)/])assert.match(head,pattern);
 assert.match(css,/@media\(max-width:760px\)/);
});
test("Homepage uses independent editorial art direction and all data-managed sections",()=>{
 const home=load("src/app/page.tsx");
 const data=load("src/lib/live-store.ts");
 const style=load("src/app/editorial-refinement.css");
 for(const key of ["mobileImageUrl","secondaryImageUrl","ctaLabel","ctaHref","layout","animation"])assert.match(data,new RegExp(key));
 for(const key of ["ed-hero-line-mask","ed-story-inset","ed-chapter","ed-mobile-chapters","data-image-wipe","data-editorial-grid","ed-admin-story"])assert.ok(home.includes(key),key);
 assert.match(home,/hero\?\.mobileImageUrl/);
 assert.match(home,/editorialHeading\?\.secondaryImageUrl/);
 assert.match(home,/sections\.slice\(2\)\.map/);
 assert.doesNotMatch(home,/className="ed-hero-detail"/);
 assert.doesNotMatch(home,/className="ed-lookbook-detail"/);
 assert.match(style,/--ed-paper/);
 assert.match(style,/@media\(max-width:760px\)/);
 const layout=load("src/app/layout.tsx");
 assert.match(layout,/import "\.\/editorial-refinement\.css"/);
});
test("Motion is scoped, progressive, efficient and respects mobile/reduced motion",()=>{
 const motion=load("src/components/EditorialMotion.tsx");
 for(const pattern of [/prefers-reduced-motion/,/gsap\.context/,/ctx\.revert\(\)/,/ScrollTrigger/,/clipPath/,/once:true/,/gsap\.matchMedia/,/pin:true/,/alive=false/,/data-editorial-grid/,/data-campaign/])assert.match(motion,pattern);
 assert.doesNotMatch(motion,/repeat:\s*-1/);
});
test("High-resolution local demo photographs have explicit provenance",()=>{
 const photos=["hero-main","hero-mobile","category-clothing","category-bags","category-shoes",
  "category-accessories","campaign","story-portrait","story-detail","chapter-form",
  "chapter-detail","journal-style","journal-details"];
 const importScript=load("scripts/fetch-editorial-images.py");
 for(const name of photos)assert.ok(importScript.includes(`"${name}"`),name);
 for(const name of photos){
  const file=`public/images/editorial/${name}.webp`;
  assert.ok(existsSync(file),`High-resolution editorial photo missing: ${file}`);
  const size=readFileSync(file).length;
  assert.ok(size>25000,`Editorial photo unexpectedly tiny: ${file} (${size} bytes)`);
 }
 const manifest=JSON.parse(load("public/images/editorial/manifest.json"));
 assert.equal(manifest.assets.length,photos.length);

 assert.match(importScript,/unsplash\.com\/photos/);
 assert.ok(existsSync("src/app/editorial-refinement.css"));
});
test("Client components using the shop context are client boundaries",()=>{
 for(const path of ["src/components/Header.tsx","src/components/Footer.tsx","src/components/ProductCard.tsx"]){
  const src=load(path);
  if(src.includes("useShop"))assert.match(src,/^"use client";/);
 }
});
