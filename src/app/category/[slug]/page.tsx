import {notFound} from "next/navigation";
import {Suspense} from "react";
import type {Metadata} from "next";
import {loadStore} from "@/lib/live-store";
import {ProductCollection} from "@/components/ProductCollection";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const store=await loadStore();return {title:store.categories.find(c=>c.id===slug)?.name||"دسته‌بندی"}}
export default async function Category({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const store=await loadStore();if(!store.categories.some(c=>c.id===slug))notFound();return <Suspense fallback={<div className="container page-loading">در حال بارگذاری...</div>}><ProductCollection category={slug}/></Suspense>}
