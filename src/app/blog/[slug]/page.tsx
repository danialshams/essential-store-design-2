import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {loadStore} from "@/lib/live-store";
import {seoMeta,jsonLd,articleSchema,breadcrumbsSchema,seoImageAlt} from "@/lib/seo";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const store=await loadStore(),article=store.articles.find(a=>a.slug===slug);return article?seoMeta(store,"/blog/"+slug,{title:article.seoTitle||article.title,
  description:article.seoDescription||article.summary,imageUrl:article.coverUrl||undefined,
  type:"article",createdAt:article.createdAt,modifiedAt:article.updatedAt}):
  {title:"مقاله یافت نشد",robots:{index:false,follow:false}}}
export default async function Article({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const store=await loadStore(),a=store.articles.find(a=>a.slug===slug);if(!a)notFound();return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(articleSchema(store,a))}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumbsSchema(store,[{name:"خانه",path:"/"},{name:"مقالات",path:"/blog"},{name:a.title,path:"/blog/"+slug}]))}}/><div className="container standard-page info-page"><div className="breadcrumbs"><Link href="/">خانه</Link><Link href="/blog">مقالات</Link><span>{a.title}</span></div><div className="info-hero"><h1>{a.title}</h1><p>{a.summary}</p></div><article className="info-card">{a.coverUrl&&<Image src={a.coverUrl} alt={seoImageAlt(store,"/blog/"+slug,a.title)} width={900} height={440} style={{width:"100%",height:"auto",borderRadius:12,marginBottom:20}} unoptimized={a.coverUrl.startsWith("http")}/>}<div style={{whiteSpace:"pre-wrap",lineHeight:2}}>{a.body}</div></article></div></>}
