/** Published content contract for the independent Edition 02 admin.
 * Drafts never arrive at the storefront; only editorialConfig is public. */
export type Destination={kind:"none"|"home"|"products"|"product"|"category"|"page"|"article"|"external";id?:string;url?:string};
export type HeroSlide={id:string;title:string;description:string;eyebrow:string;imageUrl:string;mobileImageUrl:string;ctaLabel:string;target:Destination;enabled:boolean};
export type ImageCopy={title:string;description:string;imageUrl:string;mobileImageUrl?:string;secondaryImageUrl?:string;ctaLabel:string;target:Destination};
export type FestivalContent=ImageCopy&{enabled:boolean;eyebrow:string;productIds?:string[]};
export type EditionTwoContent={
 version:2;announcement:string;sectionOrder?:string[];
 hero:HeroSlide[];
 categories:{title:string;items:Array<{categoryId:string;imageUrl?:string}>};
 featured:{title:string;description:string;productIds:string[]};
 campaign:ImageCopy;story:ImageCopy;festival?:FestivalContent;
 chapters:Array<{id:string;title:string;description:string;imageUrl:string;mobileImageUrl?:string}>;
 journal:{title:string;articleIds:string[]};
 benefits:Array<{id:string;title:string;description:string;icon:"truck"|"package"|"headphones"|"shield"}>;
 footer:{eyebrow:string;title:string;bottomNote:string};
 footerColumns?:Array<{id:string;title:string;links:Array<{id:string;label:string;target:Destination}>}>;
 navigation:Array<{id:string;label:string;target:Destination}>;
};
export type LinkData={
 products:Array<{id:string;slug:string}>;
 categories:Array<{id:string;slug?:string;dbId?:string}>;
 articles:Array<{id?:string;slug:string}>;
 pages:Array<{id?:string;slug:string}>;
};
export const isEditionTwo=(input:unknown):input is EditionTwoContent=>{
 const v=input as Partial<EditionTwoContent>|null;
 return Boolean(v&&v.version===2&&Array.isArray(v.hero)&&v.hero.length&&
 v.categories&&Array.isArray(v.categories.items)&&v.featured&&
 v.campaign&&v.story&&Array.isArray(v.chapters)&&v.journal&&
 Array.isArray(v.benefits)&&v.footer&&Array.isArray(v.navigation));
};
export function targetUrl(target:Destination|undefined,store:LinkData):string{
 if(!target)return "/products";
 switch(target.kind){
  case "home":return "/";
  case "products":return "/products";
  case "category":{const row=store.categories.find(x=>x.dbId===target.id||x.id===target.id||x.slug===target.id);
   return row?"/category/"+encodeURIComponent(row.slug||row.id):"/products";}
  case "product":{const row=store.products.find(x=>x.id===target.id);
   return row?"/product/"+encodeURIComponent(row.slug):"/products";}
  case "page":{if(target.id==="blog")return "/blog";if(target.id==="cart")return "/cart";if(target.id==="account")return "/account";const row=store.pages.find(x=>x.id===target.id||x.slug===target.id);
   return "/info/"+encodeURIComponent(row?.slug||target.id||"about");}
  case "article":{const row=store.articles.find(x=>x.id===target.id);
   return row?"/blog/"+encodeURIComponent(row.slug):"/blog";}
  case "external":return target.url?.startsWith("https://")?target.url:"/products";
  default:return "/products";
 }
}
