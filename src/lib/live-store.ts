import {cache} from "react";
import {categories as demoCategories,demoProducts,IMAGE_FALLBACK,type Product} from "@/lib/catalog";

export type StoreCategory={id:string;name:string;description:string;image:string};
export type StoreBanner={id:string;title:string;subtitle:string;imageUrl:string|null;linkUrl:string|null};
export type StorePage={slug:string;title:string;body:string;seoTitle?:string|null;seoDescription?:string|null};
export type StoreArticle={slug:string;title:string;summary:string;body:string;coverUrl:string|null;createdAt:string};
export type StoreShipping={id:string;title:string;cost:number;freeAbove:number|null;estimatedDays?:string|null};
export type StoreReview={productId:string;author:string;rating:number;body:string;createdAt:string};
export type StoreSettings={storeName:string;description:string;logoUrl?:string|null;contactEmail?:string|null;contactPhone?:string|null;address?:string|null;instagram?:string|null;seoTitle?:string|null;seoDescription?:string|null;homeSections?:Array<{id:string;title:string;description:string;imageUrl?:string|null;mobileImageUrl?:string|null;secondaryImageUrl?:string|null;ctaLabel?:string;ctaHref?:string;layout?:"split"|"overlap"|"full";animation?:"mask"|"fade"|"slide";enabled:boolean;position:number}>};
export type StoreData={products:Product[];categories:StoreCategory[];settings:StoreSettings;banners:StoreBanner[];pages:StorePage[];articles:StoreArticle[];shipping:StoreShipping[];reviews:StoreReview[];live:boolean};
const demo:StoreData={products:demoProducts,categories:demoCategories,settings:{storeName:"ESSENTIAL",description:"انتخاب‌هایی باکیفیت برای سلیقه‌های ماندگار؛ از لباس‌های خوش‌دوخت تا اکسسوری‌های ظریف."},banners:[],pages:[],articles:[],shipping:[],reviews:[],live:false};
const cleanUrl=(url:unknown)=>typeof url==="string"&&(url.startsWith("https://")||url.startsWith("/images/"))?url:null;
const oldDemoProductImage=new Set(["/images/bag.webp","/images/editorial-bag.webp","/images/linen-shirt.webp","/images/sneakers.webp","/images/sunglasses.webp","/images/classic-watch.webp"]);
const money=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)?Math.max(0,Math.round(value)):0;
const text=(value:unknown,fallback="")=>typeof value==="string"?value:fallback;

type RemoteVariant={id:string;label:string;sku?:string|null;price?:number|null;inventory:number};
type RemoteCategory={id:string;slug:string;name:string;description:string;imageUrl:string|null};
type RemoteProduct={id:string;slug:string;name:string;description:string;sku:string|null;price:number;comparePrice:number|null;
 inventory:number;featured:boolean;coverUrl:string|null;gallery:unknown;attributes:unknown;createdAt:string;
 category?:{name:string;slug:string}|null;variants:RemoteVariant[]};
type ResponseData={mode:string;settings:StoreSettings|null;categories:RemoteCategory[];products:RemoteProduct[];banners:StoreBanner[];
 pages:StorePage[];articles:StoreArticle[];shipping:StoreShipping[];reviews:StoreReview[]};

/** Kept per request; no browser CORS, no client secret, and never rewrites demo fixtures. */
export const loadStore=cache(async():Promise<StoreData>=>{
 const origin=process.env.STOREFRONT_ADMIN_ORIGIN?.trim().replace(/\/$/,"");
 if(!origin)return demo;
 try{
  const response=await fetch(`${origin}/api/store/bootstrap`,{cache:"no-store",signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw Error(`Upstream catalog ${response.status}`);
  const data=await response.json() as ResponseData;
  if(data.mode!=="live"||!Array.isArray(data.products)||!Array.isArray(data.categories))throw Error("Invalid catalog response");
  const cats:StoreCategory[]=data.categories.map(c=>({id:c.slug,name:c.name,description:c.description||"",image:cleanUrl(c.imageUrl)||demoCategories.find(x=>x.id===c.slug)?.image||IMAGE_FALLBACK}));
  const products:Product[]=data.products.map(p=>{
   const original=demoProducts.find(x=>x.slug===p.slug);
   const imgs=Array.isArray(p.gallery)?p.gallery.map(cleanUrl).filter((x):x is string=>Boolean(x)&&!oldDemoProductImage.has(x)):[];
   const providedCover=cleanUrl(p.coverUrl);
   const cover=(providedCover&&!oldDemoProductImage.has(providedCover)?providedCover:null)||original?.image||providedCover||IMAGE_FALLBACK;
   const attrs=p.attributes && typeof p.attributes==="object" && !Array.isArray(p.attributes)?p.attributes as Record<string,unknown>:{};
   return {id:String(p.id),slug:text(p.slug),name:text(p.name),description:text(p.description),
    subtitle:original?.subtitle||"",price:money(p.price),comparePrice:p.comparePrice==null?undefined:money(p.comparePrice),
    category:p.category?.slug||"other",categoryLabel:p.category?.name||"سایر محصولات",image:cover,
    gallery:[cover,...imgs.filter(image=>image!==cover)],inventory:money(p.inventory),featured:Boolean(p.featured),
    newArrival:Date.now()-new Date(p.createdAt).getTime()<30*86400000,
    sku:text(p.sku),specs:Object.fromEntries(Object.entries(attrs).map(([key,value])=>[key,text(value)])),
    variants:Array.isArray(p.variants)?p.variants.map(v=>({id:String(v.id),label:text(v.label),sku:text(v.sku),
      price:v.price==null?undefined:money(v.price),inventory:money(v.inventory)})):[]};
  });
  return {live:true,products,categories:cats,settings:{...demo.settings,...data.settings},
   banners:Array.isArray(data.banners)?data.banners:[],pages:Array.isArray(data.pages)?data.pages:[],
   articles:Array.isArray(data.articles)?data.articles:[],shipping:Array.isArray(data.shipping)?data.shipping:[],
   reviews:Array.isArray(data.reviews)?data.reviews:[]};
 }catch(error){console.error("Live store unavailable; preserving demo catalog",error);return demo}
});
