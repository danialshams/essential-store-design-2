import Link from "next/link";
import Image from "next/image";
import type {Metadata} from "next";
import {loadStore} from "@/lib/live-store";
import {seoMeta,seoImageAlt} from "@/lib/seo";
export async function generateMetadata():Promise<Metadata>{
 const store=await loadStore();
 const meta=seoMeta(store,"/blog",{title:"مقالات و راهنمای خرید",description:"راهنماها و مقالات "+store.settings.storeName});
 return store.articles.length?meta:{...meta,robots:{index:false,follow:true}};
}
export default async function Blog(){const store=await loadStore();return <div className="container standard-page"><div className="page-title-group"><span>دانستنی‌های فروشگاه</span><h1>مقالات و راهنمای خرید</h1><p>مطالب منتشرشده از پنل مدیریت</p></div>{store.articles.length?<div className="product-grid">{store.articles.map(a=><Link className="product-card" key={a.slug} href={`/blog/${a.slug}`} style={{padding:16}}>{a.coverUrl&&<Image src={a.coverUrl} alt={seoImageAlt(store,"/blog/"+a.slug,a.title)} width={420} height={220} unoptimized={a.coverUrl.startsWith("http")}/>}<h2>{a.title}</h2><p>{a.summary}</p></Link>)}</div>:<p>هنوز مقاله‌ای منتشر نشده است.</p>}</div>}
