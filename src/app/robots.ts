import type {MetadataRoute} from "next";
import {loadStore} from "@/lib/live-store";
import {readSeoConfig,seoOrigin,seoCanIndex} from "@/lib/seo";
export const dynamic="force-dynamic";
export default async function robots():Promise<MetadataRoute.Robots>{
 const store=await loadStore(),config=readSeoConfig(store.settings.seoConfig);
 const publicIndex=seoCanIndex(store,"/");
 return {
  rules:{userAgent:"*",
   ...(publicIndex?{allow:"/",disallow:[
    "/admin/","/login","/account","/cart","/checkout","/search","/api/"
   ]}:{disallow:"/"})},
  sitemap:publicIndex?seoOrigin(config)+"/sitemap.xml":undefined
 };
}
