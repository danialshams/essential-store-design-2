import type {MetadataRoute} from "next";
import {loadStore} from "@/lib/live-store";
import {readSeoConfig,seoUrl,seoOrigin,seoCanIndex} from "@/lib/seo";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const store=await loadStore(),config=readSeoConfig(store.settings.seoConfig);
 if(!seoCanIndex(store,"/"))return [];
 const origin=seoOrigin(config),seen=new Set<string>();
 const items:MetadataRoute.Sitemap=[];
 function put(path:string,priority:number,frequency:"daily"|"weekly"|"monthly",lastModified?:Date){
  if(config.pages?.[path]?.noindex)return;
  const canonical=config.pages?.[path]?.canonical||path;
  const url=seoUrl(canonical,config);
  if(!url.startsWith(origin+"/")||seen.has(url))return;
  seen.add(url);
  items.push({url,changeFrequency:frequency,priority,...(lastModified?{lastModified}:{})});
 }
 put("/",1,"weekly");
 if(store.products.length)put("/products",.8,"daily");
 if(store.articles.length)put("/blog",.65,"weekly");
 for(const category of store.categories){
  if(store.products.some(product=>product.category===category.id))
   put("/category/"+category.id,.75,"weekly");
 }
 for(const product of store.products)put("/product/"+product.slug,.7,"daily");
 for(const article of store.articles){
  const date=article.updatedAt||article.createdAt;
  put("/blog/"+article.slug,.6,"monthly",date&&!Number.isNaN(Date.parse(date))?new Date(date):undefined);
 }
 const staticPages=["about","contact","faq","terms","shipping","privacy"];
 for(const slug of staticPages)put("/info/"+slug,.3,"monthly");
 for(const page of store.pages){
  if(!staticPages.includes(page.slug))put("/info/"+page.slug,.5,"monthly");
 }
 return items;
}
