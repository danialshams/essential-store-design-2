/** Licensed Unsplash editorial demo imagery. Merchant uploads are never changed. */
const images:Record<string,string>={
 "/images/editorial/chapter-detail.webp":"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/hero-main.webp":"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/hero-mobile.webp":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/story-detail.webp":"https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/campaign.webp":"https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/story-portrait.webp":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/chapter-form.webp":"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/category-clothing.webp":"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/category-bags.webp":"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/category-shoes.webp":"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/category-accessories.webp":"https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/journal-style.webp":"https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1400&q=84",
 "/images/editorial/journal-details.webp":"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=84",
 "/images/hero-woman.webp":"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=84",
 "/images/hero-mobile.webp":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=84",
 "/images/bag.webp":"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=84",
 "/images/sneakers.webp":"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1400&q=84",
 "/images/linen-shirt.webp":"https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1400&q=84",
 "/images/sunglasses.webp":"https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1400&q=84",
 "/images/products/bag-main.webp":"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=84",
 "/images/products/sneakers-main.webp":"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=84",
 "/images/products/shirt-blue.webp":"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&q=84",
 "/images/products/watch-main.webp":"https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=84",
 "/images/products/bag-everyday.webp":"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1400&q=84",
 "/images/products/sneakers-urban.webp":"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1400&q=84",
 "/images/products/shirt-beige.webp":"https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=1400&q=84",
 "/images/products/sunglasses-main.webp":"https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1400&q=84"
};
export function showcasePhoto(raw:string|null|undefined):string{
 if(!raw)return "";
 let key=raw;
 if(raw.startsWith("https://essential-store-design-")){
  try{key=new URL(raw).pathname}catch{return raw}
 }
 return images[key]||raw;
}
export const legacyTemplatePhoto=(raw:string|null|undefined):boolean=>{
 if(!raw)return false;
 const key=raw.startsWith("https://essential-store-design-")?new URL(raw).pathname:raw;
 return Object.prototype.hasOwnProperty.call(images,key);
};
