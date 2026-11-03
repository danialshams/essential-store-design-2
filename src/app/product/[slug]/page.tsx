import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {loadStore} from "@/lib/live-store";
import {ProductDetails} from "@/components/ProductDetails";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const store=await loadStore(),product=store.products.find(p=>p.slug===slug);return {title:product?.name||"محصول",description:product?.description}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const store=await loadStore(),product=store.products.find(p=>p.slug===slug);if(!product)notFound();return <ProductDetails product={product}/>}
