import {notFound} from "next/navigation";
import {Suspense} from "react";
import type {Metadata} from "next";
import {loadStore} from "@/lib/live-store";
import {ProductCollection} from "@/components/ProductCollection";
import {seoMeta,breadcrumbsSchema,jsonLd} from "@/lib/seo";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const store=await loadStore(),category=store.categories.find(c=>c.id===slug);
 if(!category)return {title:"دسته‌بندی یافت نشد",robots:{index:false,follow:false}};
 const meta=seoMeta(store,"/category/"+slug,{title:category.name,description:category.description,imageUrl:category.image});
 return store.products.some(p=>p.category===slug)?meta:{...meta,robots:{index:false,follow:true}};
}
export default async function Category({params}:Props){
 const {slug}=await params;const store=await loadStore(),category=store.categories.find(c=>c.id===slug);
 if(!category)notFound();
 return <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbsSchema(store,[
  {name:"خانه",path:"/"},{name:category.name,path:"/category/"+slug}
 ]))}}/>
 <Suspense fallback={<div className="container page-loading">در حال بارگذاری...</div>}><ProductCollection category={slug}/></Suspense>
 </>;
}
