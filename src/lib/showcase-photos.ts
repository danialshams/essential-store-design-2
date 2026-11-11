/** Media safety: all template images resolve to files bundled in /public/images/.
 * This is required for locations where Unsplash/CDN requests are blocked.
 * Merchant-uploaded images from other origins are preserved unchanged.
 */
const bundled:Record<string,string>={
 "/images/editorial/chapter-detail.webp":"/images/editorial/chapter-detail.webp",
 "/images/editorial/hero-main.webp":"/images/editorial/hero-main.webp",
 "/images/editorial/hero-mobile.webp":"/images/editorial/hero-mobile.webp",
 "/images/editorial/story-detail.webp":"/images/editorial/story-detail.webp",
 "/images/editorial/campaign.webp":"/images/editorial/campaign.webp",
 "/images/editorial/story-portrait.webp":"/images/editorial/story-portrait.webp",
 "/images/editorial/chapter-form.webp":"/images/editorial/chapter-form.webp",
 "/images/editorial/category-clothing.webp":"/images/editorial/category-clothing.webp",
 "/images/editorial/category-bags.webp":"/images/editorial/category-bags.webp",
 "/images/editorial/category-shoes.webp":"/images/editorial/category-shoes.webp",
 "/images/editorial/category-accessories.webp":"/images/editorial/category-accessories.webp",
 "/images/editorial/journal-style.webp":"/images/editorial/journal-style.webp",
 "/images/editorial/journal-details.webp":"/images/editorial/journal-details.webp",
 "/images/hero-woman.webp":"/images/hero-woman.webp",
 "/images/hero-mobile.webp":"/images/hero-mobile.webp",
 "/images/bag.webp":"/images/bag.webp",
 "/images/sneakers.webp":"/images/sneakers.webp",
 "/images/linen-shirt.webp":"/images/linen-shirt.webp",
 "/images/sunglasses.webp":"/images/sunglasses.webp",
 "/images/products/bag-main.webp":"/images/products/bag-main.webp",
 "/images/products/sneakers-main.webp":"/images/products/sneakers-main.webp",
 "/images/products/shirt-blue.webp":"/images/products/shirt-blue.webp",
 "/images/products/watch-main.webp":"/images/products/watch-main.webp",
 "/images/products/bag-everyday.webp":"/images/products/bag-everyday.webp",
 "/images/products/sneakers-urban.webp":"/images/products/sneakers-urban.webp",
 "/images/products/shirt-beige.webp":"/images/products/shirt-beige.webp",
 "/images/products/sunglasses-main.webp":"/images/products/sunglasses-main.webp"
};
const previouslyExternal:Record<string,string>={
 "photo-1539109136881-3be0616acf4b":"/images/hero-woman.webp",
 "photo-1529139574466-a303027c1d8b":"/images/hero-mobile.webp",
 "photo-1525507119028-ed4c629a60a3":"/images/editorial/journal-style.webp",
 "photo-1551232864-3f0890e580d9":"/images/editorial/campaign.webp",
 "photo-1490481651871-ab68de25d43d":"/images/editorial/journal-details.webp",
 "photo-1483985988355-763728e1935b":"/images/editorial/category-clothing.webp",
 "photo-1584917865442-de89df76afd3":"/images/products/bag-main.webp",
 "photo-1549298916-b41d501d3772":"/images/products/sneakers-main.webp",
 "photo-1511499767150-a48a237f0083":"/images/products/sunglasses-main.webp",
 "photo-1525966222134-fcfa99b8ae77":"/images/products/sneakers-urban.webp",
 "photo-1489987707025-afc232f7ea0f":"/images/linen-shirt.webp",
 "photo-1602810318383-e386cc2a3ccf":"/images/products/shirt-blue.webp",
 "photo-1524805444758-089113d48a6d":"/images/products/watch-main.webp",
 "photo-1590874103328-eac38a683ce7":"/images/products/bag-everyday.webp",
 "photo-1620799140188-3b2a02fd9a77":"/images/products/shirt-beige.webp"
};
export function showcasePhoto(raw:string|null|undefined):string{
 if(!raw)return "";
 let key=raw;
 if(raw.startsWith("https://essential-store-design-")){
  try{
   const url=new URL(raw);
   if(url.pathname.startsWith("/images/"))key=url.pathname;
  }catch{return raw}
 }
 if(raw.startsWith("https://images.unsplash.com/")){
  try{
   const url=new URL(raw);
   const known=previouslyExternal[url.pathname.slice(1)];
   if(known)return known;
  }catch{return raw}
 }
 return bundled[key]||key;
}
export const legacyTemplatePhoto=(raw:string|null|undefined):boolean=>{
 if(!raw)return false;
 return Object.prototype.hasOwnProperty.call(bundled,raw)||
   (raw.startsWith("https://images.unsplash.com/")&&Boolean(previouslyExternal[new URL(raw).pathname.slice(1)]))||
   (raw.startsWith("https://essential-store-design-")&&Object.prototype.hasOwnProperty.call(bundled,new URL(raw).pathname));
};
