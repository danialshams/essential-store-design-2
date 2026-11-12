import type {Metadata} from "next";
import type {StoreData} from "@/lib/live-store";

export type SeoPageConfig={
 title?:string;description?:string;imageUrl?:string;imageAlt?:string;
 canonical?:string;noindex?:boolean;noarchive?:boolean;
};
export type SeoConfig={
 siteUrl?:string;siteName?:string;titleSeparator?:string;
 defaultImage?:string;defaultImageAlt?:string;language?:string;
 indexSite?:boolean;googleVerification?:string;bingVerification?:string;
 twitterHandle?:string;socialProfiles?:string[];
 companyName?:string;companyLogo?:string;
 pages?:Record<string,SeoPageConfig>;
};
export const defaultSeoConfig:SeoConfig={
 siteUrl:"",siteName:"",titleSeparator:" | ",defaultImage:"",
 defaultImageAlt:"",language:"fa-IR",indexSite:false,
 googleVerification:"",bingVerification:"",twitterHandle:"",
 socialProfiles:[],companyName:"",companyLogo:"",pages:{}
};
function clean(value:unknown):string{return typeof value==="string"?value.trim():""}
export function normalizeSeoPath(path:string):string{
 if(!path.startsWith("/")||path.startsWith("//")||path.includes("\\"))return "/";
 return path.split(/[?#]/)[0].replace(/\/{2,}/g,"/").replace(/\/$/,"")||"/";
}
export function readSeoConfig(raw:unknown):SeoConfig{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return {...defaultSeoConfig};
 const data=raw as Record<string,unknown>;
 const pages:Record<string,SeoPageConfig>={};
 if(data.pages&&typeof data.pages==="object"&&!Array.isArray(data.pages)){
  for(const [key,value] of Object.entries(data.pages as Record<string,unknown>)){
   if(!key.startsWith("/")||key.length>300||!value||typeof value!=="object"||Array.isArray(value))continue;
   const p=value as Record<string,unknown>;
   pages[normalizeSeoPath(key)]={
    title:clean(p.title),description:clean(p.description),imageUrl:clean(p.imageUrl),
    imageAlt:clean(p.imageAlt),canonical:clean(p.canonical),
    noindex:p.noindex===true,noarchive:p.noarchive===true
   };
  }
 }
 return {...defaultSeoConfig,
  siteUrl:clean(data.siteUrl),siteName:clean(data.siteName),
  titleSeparator:clean(data.titleSeparator)||" | ",
  defaultImage:clean(data.defaultImage),defaultImageAlt:clean(data.defaultImageAlt),
  language:clean(data.language)||"fa-IR",
  indexSite:data.indexSite===true,googleVerification:clean(data.googleVerification),
  bingVerification:clean(data.bingVerification),twitterHandle:clean(data.twitterHandle),
  socialProfiles:Array.isArray(data.socialProfiles)?data.socialProfiles.filter((x):x is string=>typeof x==="string"&&x.startsWith("https://")).slice(0,12):[],
  companyName:clean(data.companyName),companyLogo:clean(data.companyLogo),pages
 };
}
export function seoOrigin(config:SeoConfig):string{
 const values=[config.siteUrl,process.env.NEXT_PUBLIC_SITE_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL?"https://"+process.env.VERCEL_PROJECT_PRODUCTION_URL:"",
  "https://essential-store-design-2.vercel.app"];
 for(const raw of values){if(!raw)continue;try{
   const u=new URL(raw);if(u.protocol==="https:"||u.hostname==="localhost"&&u.protocol==="http:")
    return u.origin;
  }catch{/* invalid URL: try next */}}
 return "https://essential-store-design-2.vercel.app";
}
export function seoUrl(value:string,config:SeoConfig):string{
 const origin=seoOrigin(config);
 if(!value)return origin+"/";
 if(value.startsWith("//")||value.startsWith("javascript:"))return origin+"/";
 if(value.startsWith("/"))return origin+normalizeSeoPath(value);
 try{const url=new URL(value);return url.protocol==="https:"?url.toString():origin+"/"}catch{return origin+"/"}
}
export function seoCanIndex(store:StoreData,pagePath:string):boolean{
 const config=readSeoConfig(store.settings.seoConfig);
 // Draft demo installations, preview deployments, private pages and unconfigured
 // customer domains must never be accidentally indexed.
 const privatePath=/^\/(?:admin|login|account|cart|checkout|search|api)(?:\/|$)/.test(pagePath);
 return store.live&&config.indexSite===true&&Boolean(config.siteUrl)&&
  process.env.VERCEL_ENV!=="preview"&&!privatePath;
}
export function seoMeta(store:StoreData,path:string,info:{
 title:string;description?:string;imageUrl?:string;imageAlt?:string;type?:"website"|"article";
 createdAt?:string;modifiedAt?:string;
}):Metadata{
 const config=readSeoConfig(store.settings.seoConfig);
 const pagePath=normalizeSeoPath(path),override=config.pages?.[pagePath]||{};
 const company=config.siteName||store.settings.storeName||"فروشگاه";
 const title=override.title||info.title||company;
 const fullTitle=pagePath==="/"?title:(title.includes(company)?title:title+(config.titleSeparator||" | ")+company);
 const description=(override.description||info.description||store.settings.description||"").trim().slice(0,550);
 const image=override.imageUrl||info.imageUrl||config.defaultImage||store.settings.logoUrl||"";
 const imageAlt=override.imageAlt||info.imageAlt||config.defaultImageAlt||title;
 const origin=seoOrigin(config),canonical=seoUrl(override.canonical||pagePath,config);
 const allowIndex=seoCanIndex(store,pagePath)&&!override.noindex;
 const imageData=image?[{url:seoUrl(image,config),alt:imageAlt}]:undefined;
 return {
  metadataBase:new URL(origin),
  title:{absolute:fullTitle},description,
  alternates:{canonical},applicationName:company,
  robots:{index:allowIndex,follow:allowIndex,noarchive:override.noarchive||false,
   googleBot:{index:allowIndex,follow:allowIndex,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
  openGraph:{type:info.type||"website",locale:(config.language||"fa-IR").replace("-","_"),
   siteName:company,url:canonical,title:fullTitle,description,images:imageData,
   ...(info.type==="article"&&info.createdAt?{publishedTime:info.createdAt,modifiedTime:info.modifiedAt}: {})},
  twitter:{card:image?"summary_large_image":"summary",title:fullTitle,description,images:image?[seoUrl(image,config)]:undefined,
   creator:config.twitterHandle||undefined},
  verification:{google:config.googleVerification||undefined,other:config.bingVerification?{"msvalidate.01":config.bingVerification}:undefined},
  other:{ "content-language":config.language||"fa-IR" }
 };
}
export function seoImageAlt(store:StoreData,path:string,fallback:string):string{
 const config=readSeoConfig(store.settings.seoConfig);
 return config.pages?.[normalizeSeoPath(path)]?.imageAlt||fallback;
}
export function jsonLd(data:unknown):string{
 return JSON.stringify(data).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026");
}
export function websiteSchema(store:StoreData){
 const config=readSeoConfig(store.settings.seoConfig);
 const origin=seoOrigin(config),name=config.siteName||store.settings.storeName;
 const social=config.socialProfiles||[];
 return {"@context":"https://schema.org","@graph":[
  {"@type":"WebSite","@id":origin+"/#website",url:origin+"/",name,
   description:store.settings.seoDescription||store.settings.description,inLanguage:config.language||"fa-IR"},
  {"@type":"Organization","@id":origin+"/#organization",name:config.companyName||name,url:origin+"/",
   ...(config.companyLogo||store.settings.logoUrl?{logo:seoUrl(config.companyLogo||store.settings.logoUrl||"",config)}:{}),
   ...(social.length?{sameAs:social}:{})
  }
 ]};
}
export function breadcrumbsSchema(store:StoreData,items:Array<{name:string;path:string}>){
 const config=readSeoConfig(store.settings.seoConfig);
 return {"@context":"https://schema.org","@type":"BreadcrumbList",
  itemListElement:items.map((item,i)=>({"@type":"ListItem",position:i+1,name:item.name,item:seoUrl(item.path,config)}))};
}
export function productSchema(store:StoreData,product:StoreData["products"][number]){
 const config=readSeoConfig(store.settings.seoConfig),path="/product/"+product.slug;
 const reviews=store.reviews.filter(r=>r.productId===product.id&&r.rating>=1&&r.rating<=5);
 return {"@context":"https://schema.org","@type":"Product",
  name:product.name,description:product.description,sku:product.sku||undefined,
  image:product.gallery.length?product.gallery.map(url=>seoUrl(url,config)):[seoUrl(product.image,config)],
  url:seoUrl(path,config),
  offers:{"@type":"Offer",url:seoUrl(path,config),priceCurrency:"IRR",price:product.price*10,
   itemCondition:"https://schema.org/NewCondition",
   availability:product.inventory>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"},
  ...(reviews.length?{aggregateRating:{"@type":"AggregateRating",ratingValue:reviews.reduce((n,r)=>n+r.rating,0)/reviews.length,
   reviewCount:reviews.length}}:{})
 };
}
export function articleSchema(store:StoreData,article:StoreData["articles"][number]){
 const config=readSeoConfig(store.settings.seoConfig);
 return {"@context":"https://schema.org","@type":"BlogPosting",headline:article.title,
  description:article.summary,inLanguage:config.language||"fa-IR",
  mainEntityOfPage:seoUrl("/blog/"+article.slug,config),
  ...(article.coverUrl?{image:seoUrl(article.coverUrl,config)}:{}),
  ...(article.createdAt?{datePublished:article.createdAt}:{})
 };
}
