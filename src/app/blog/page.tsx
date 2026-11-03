import Link from "next/link";
import Image from "next/image";
import type {Metadata} from "next";
import {loadStore} from "@/lib/live-store";
export const metadata:Metadata={title:"مقالات و راهنمای خرید"};
export default async function Blog(){const store=await loadStore();return <div className="container standard-page"><div className="page-title-group"><span>دانستنی‌های فروشگاه</span><h1>مقالات و راهنمای خرید</h1><p>مطالب منتشرشده از پنل مدیریت</p></div>{store.articles.length?<div className="product-grid">{store.articles.map(a=><Link className="product-card" key={a.slug} href={`/blog/${a.slug}`} style={{padding:16}}>{a.coverUrl&&<Image src={a.coverUrl} alt="" width={420} height={220} unoptimized={a.coverUrl.startsWith("http")}/>}<h2>{a.title}</h2><p>{a.summary}</p></Link>)}</div>:<p>هنوز مقاله‌ای منتشر نشده است.</p>}</div>}
