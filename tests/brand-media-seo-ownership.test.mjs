import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("SEO is managed exclusively in its dedicated studio, not general store settings",()=>{
 const general=read("src/components/admin/EditionTwoSettings.tsx");
 const route=read("src/app/api/admin/settings/route.ts");
 const studio=read("src/components/admin/SeoManager.tsx");
 assert.doesNotMatch(general,/label="عنوان سایت در جستجو"|label="توضیحات سایت در جستجو"|<h2>نمایش در گوگل \(سئو\)/);
 assert.doesNotMatch(route,/seoTitle:z\.|seoDescription:z\./);
 assert.match(studio,/مدیریت پیشرفته سئو/);
 assert.match(studio,/ذخیره تنظیمات سئو/);
});

test("All media frames remain covered, stable and use true-color source photography",()=>{
 const css=read("src/app/product-theme-polish.css");
 const photos=read("scripts/prepare-curated-media.mjs");
 assert.match(css,/object-fit:cover!important/);
 assert.match(css,/aspect-ratio:4\/5!important/);
 assert.match(photos,/images\.pexels\.com/);
 assert.doesNotMatch(photos,/sharp\(.+modulate|hueRotate|hueShift/);
 assert.match(read("src/app/page.tsx"),/heroArt\(slide\.imageUrl,i\)/);
 assert.match(read("scripts/curated-photo-manifest.mjs"),/hero-stage-3-mobile\.webp/);
 assert.match(css,/\.ed-hero-minimal \.ed-hero-slide \.ed-hero-mobile-photo/);
 assert.match(css,/\.ed-home \.ed-categories-grid \.ed-category-tile/);
});
