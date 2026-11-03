import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {loadStore} from "@/lib/live-store";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const store=await loadStore(),article=store.articles.find(a=>a.slug===slug);return {title:article?.title||"مقاله",description:article?.summary}}
export default async function Article({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const store=await loadStore(),a=store.articles.find(a=>a.slug===slug);if(!a)notFound();return <div className="container standard-page info-page"><div className="breadcrumbs"><Link href="/">خانه</Link><Link href="/blog">مقالات</Link><span>{a.title}</span></div><div className="info-hero"><h1>{a.title}</h1><p>{a.summary}</p></div><article className="info-card">{a.coverUrl&&<Image src={a.coverUrl} alt="" width={900} height={440} style={{width:"100%",height:"auto",borderRadius:12,marginBottom:20}} unoptimized={a.coverUrl.startsWith("http")}/>}<div style={{whiteSpace:"pre-wrap",lineHeight:2}}>{a.body}</div></article></div>}
