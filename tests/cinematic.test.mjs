import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
test("Maison menu is accessible with keyboard focus, close/escape and mobile layout",()=>{
 const head=load("src/components/Header.tsx"),css=load("src/app/cinematic.css");
 for(const pattern of [/aria-expanded=\{menuOpen\}/,/aria-controls="maison-menu"/,/trapMenuFocus/,/menuOpen\?0:-1/,/premium-drawer-root/,/premium-drawer-editorial/,/setMenuPhoto/])assert.match(head,pattern);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/premium-drawer-layout/);
});
test("Cinematic hero and editorial imagery are driven by admin or demo fallbacks",()=>{
 const home=load("src/app/page.tsx"),data=load("src/lib/live-store.ts");
 for(const key of ["mobileImageUrl","secondaryImageUrl","ctaLabel","ctaHref","layout","animation"])assert.match(data,new RegExp(key));
 for(const key of ["ed-hero-line-mask","ed-hero-detail","ed-story-inset","ed-lookbook-detail","ed-chapter","data-image-wipe"])assert.ok(home.includes(key),key);
 assert.match(home,/hero\?\.secondaryImageUrl/);
 assert.match(home,/editorialHeading\?\.secondaryImageUrl/);
});
test("GSAP cinematic scenes are scoped, one-pass and respect reduced motion",()=>{
 const motion=load("src/components/EditorialMotion.tsx");
 for(const pattern of [/prefers-reduced-motion/,/gsap\.context/,/context\.revert/,/ScrollTrigger/,/clipPath/,/once:true/,/gsap\.matchMedia/,/pin:true/,/alive=false/])assert.match(motion,pattern);
});
test("No client components call useShop from a server-rendered boundary",()=>{
 for(const path of ["src/components/Header.tsx","src/components/Footer.tsx","src/components/ProductCard.tsx"]){const s=load(path);if(s.includes("useShop"))assert.match(s,/^"use client";/)}
});
