import {Suspense} from "react";
import {ProductCollection} from "@/components/ProductCollection";
import {loadStore} from "@/lib/live-store";
import {seoMeta,breadcrumbsSchema,jsonLd} from "@/lib/seo";
export async function generateMetadata(){
 const store=await loadStore();
 const m=seoMeta(store,"/products",{title:"همه محصولات",description:"مشاهده همه محصولات و دسته‌بندی‌های "+store.settings.storeName});
 return store.products.length?m:{...m,robots:{index:false,follow:true}};
}
export default async function Products(){
 const store=await loadStore();
 return <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbsSchema(store,[
  {name:"خانه",path:"/"},{name:"محصولات",path:"/products"}
 ]))}}/>
 <Suspense fallback={<div className="container page-loading">در حال نمایش محصولات...</div>}><ProductCollection/></Suspense>
 </>;
}
