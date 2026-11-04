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
 const carousel=load("src/components/HeroCarousel.tsx");
 assert.match(carousel,/ed-hero-image-caption/);
 assert.match(carousel,/ed-hero-stable-action/);
 assert.match(carousel,/aria-roledescription="carousel"/);
 assert.match(carousel,/INTERVAL=9000/);
 const style=load("src/app/editorial-refinement.css");
 for(const key of ["mobileImageUrl","secondaryImageUrl","ctaLabel","ctaHref","layout","animation"])assert.match(data,new RegExp(key));
 for(const key of ["HeroCarousel","ed-story-inset","ed-chapter","ed-mobile-chapters","data-image-wipe","data-editorial-grid","ed-admin-story"])assert.ok(home.includes(key),key);
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
 for(const pattern of [/prefers-reduced-motion/,/gsap\.context/,/context\.revert\(\)/,/ScrollTrigger/,/clipPath/,/once:true/,/gsap\.matchMedia/,/pin:true/,/data-motion-status/,/data-editorial-grid/,/data-scene=/])assert.match(motion,pattern);
 assert.doesNotMatch(motion,/repeat:\s*-1/);
});
test("Mobile hero is one editorial viewport with its own controls and normalized text",()=>{
 const home=load("src/app/page.tsx");
 const component=load("src/components/HeroCarousel.tsx");
 const css=load("src/app/editorial-mobile-hero.css");
 const motion=load("src/components/EditorialMotion.tsx");
 assert.doesNotMatch(home,/className="ed-quiet-strip"/);
 assert.match(component,/ed-hero-progress-count/);
 assert.doesNotMatch(component,/ed-carousel-play|ed-carousel-control|ed-carousel-dots/);
 assert.match(component,/titleLines\(slide.title\)/);
 assert.match(component,/title\.replace\(/);
 assert.match(load("src/app/editorial-precision.css"),/ed-hero-minimal/);
 assert.match(css,/height:calc\(100svh - 90px - 66px - env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/max-height:740px/);
 assert.match(motion,/\.decode\?\.\(\)/);
 assert.match(motion,/image\(detail,"up"\)/);
 assert.match(motion,/data-chapter/);
 assert.match(motion,/observer\.observe\(trigger\)/);
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

 assert.match(importScript,/pexels\.com\/photo/);
 assert.ok(existsSync("src/app/editorial-refinement.css"));
 assert.ok(existsSync("src/app/cinematic-finish.css"));
 assert.ok(existsSync("src/components/SiteMotion.tsx"));
 assert.match(load("src/app/layout.tsx"),/SiteMotion/);
});
test("Client components using the shop context are client boundaries",()=>{
 for(const path of ["src/components/Header.tsx","src/components/Footer.tsx","src/components/ProductCard.tsx"]){
  const src=load(path);
  if(src.includes("useShop"))assert.match(src,/^"use client";/);
 }
});

test("Editorial QA keeps full-image framing and reveals behind the first-load curtain",()=>{
 const header=load("src/components/Header.tsx");
 const hero=load("src/components/HeroCarousel.tsx");
 const home=load("src/app/page.tsx");
 const site=load("src/components/SiteMotion.tsx");
 const motion=load("src/components/EditorialMotion.tsx");
 const css=load("src/app/editorial-quality-pass.css");
 const layout=load("src/app/layout.tsx");
 assert.doesNotMatch(header,/<span>CLOSE<\/span>/);
 assert.doesNotMatch(hero,/ed-hero-backdrop|ed-carousel-play/);
 assert.match(home,/heroWide\(/);
 assert.match(layout,/editorial-quality-pass\.css/);
 assert.match(site,/maison-intro/);
 assert.match(site,/document\.fonts/);
 assert.match(motion,/\.decode\?\.\(\)/);
 assert.match(motion,/Promise\.race\(\[decoded,deadline\]\)/);
 assert.match(css,/\.ed-category-photo[^{}]*\{/);
 assert.match(css,/object-fit:contain!important/);
 assert.match(css,/ed-lookbook\.ed-full-bleed/);
 assert.match(load("src/app/editorial-precision.css"),/grid-template-columns:minmax\(0,1fr\) auto auto/);
 assert.match(css,/font-family:var\(--ed-farsi\)/);
 assert.match(css,/maison-write/);
});

test("Hero action is stable and the minimal editorial CTA has no carousel controls",()=>{
 const hero=load("src/components/HeroCarousel.tsx");
 const final=load("src/app/editorial-precision.css");
 assert.match(hero,/کشف داستان/);
 assert.match(hero,/ArrowUpLeft/);
 assert.match(hero,/ed-hero-progress-count/);
 assert.doesNotMatch(hero,/onClick=\{\(\)=>go\(active-1\)\}|Pause|Play/);
 assert.doesNotMatch(hero,/key=\{slide\.id\}/);
 assert.match(final,/ed-hero-stable-action/);
 assert.match(final,/ed-hero-content/);
});
test("Editorial media use exact intrinsic framing and tailored visible-only motion",()=>{
 const media=load("src/components/FrameImage.tsx");
 const product=load("src/components/ProductCard.tsx");
 const motion=load("src/components/EditorialMotion.tsx");
 const footer=load("src/components/Footer.tsx");
 const route=load("src/components/SiteMotion.tsx");
 const style=load("src/app/editorial-precision.css");
 assert.match(media,/naturalWidth/);
 assert.match(media,/--frame-ratio/);
 assert.match(product,/--actual-media-ratio/);
 assert.match(motion,/IntersectionObserver/);
 assert.match(motion,/rootMargin:"0px 0px -7% 0px"/);
 assert.match(motion,/image\(media/);
 assert.match(motion,/text\(title,title/);
 assert.match(motion,/action\(link,link/);
 assert.match(footer,/\.premium-footer-links>div/);
 assert.match(route,/const functional=/);
 assert.doesNotMatch(route,/maison-intro-kicker|maison-intro-rule|maison-intro-caption/);
 assert.match(style,/ed-brand-arrive/);
 assert.match(style,/premium-drawer-head button:hover/);
 assert.match(load("src/app/layout.tsx"),/editorial-precision\.css/);
});
