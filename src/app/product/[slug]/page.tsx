import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {loadStore} from "@/lib/live-store";
import {ProductDetails} from "@/components/ProductDetails";
import {seoMeta,productSchema,breadcrumbsSchema,jsonLd} from "@/lib/seo";

type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const store=await loadStore();
 const product=store.products.find(p=>p.slug===slug);
 if(!product)return {title:"محصول یافت نشد",robots:{index:false,follow:false}};
 return seoMeta(store,"/product/"+slug,{title:product.name,description:product.description,
  imageUrl:product.image,imageAlt:product.seoImageAlt||product.name});
}
export default async function ProductPage({params}:Props){
 const {slug}=await params;
 const store=await loadStore(),product=store.products.find(p=>p.slug===slug);
 if(!product)notFound();
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(productSchema(store,product))}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbsSchema(store,[
   {name:"خانه",path:"/"},{name:"محصولات",path:"/products"},
   {name:product.categoryLabel,path:"/category/"+product.category},
   {name:product.name,path:"/product/"+slug}
  ]))}}/>
  <ProductDetails product={{...product,seoImageAlt:store.settings.seoConfig?.pages?.["/product/"+slug]?.imageAlt||product.name}}/>
 </>;
}
