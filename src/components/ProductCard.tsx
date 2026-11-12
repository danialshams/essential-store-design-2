"use client";
import Link from "next/link";
import {useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {Heart,ArrowUpLeft,ShoppingBag} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
import {toman,type Product} from "@/lib/catalog";

const palette:Record<string,string>={
 "مشکی":"#27231f","قهوه‌ای":"#816044","سفید":"#f7f5ef","کرم":"#d6c4aa",
 "بژ":"#c9ab91","آبی":"#8ca5bf","سرمه‌ای":"#2d3d54","سبز":"#6f8669",
 "قرمز":"#aa665c","صورتی":"#d4aaa2","طوسی":"#94918f","خاکستری":"#94918f",
 "طلایی":"#c3a56c","نقره‌ای":"#c2c0bd"
};
function colorOf(label:string){
 const color=Object.entries(palette).find(([name])=>label.includes(name));
 return color?.[1]||null;
}
export function ProductCard({product,compact=false}:{product:Product,compact?:boolean}){
 const router=useRouter();
 const [hover,setHover]=useState(false);
 const alternate=product.gallery?.find((image)=>image!==product.image);
 const {add,isFavorite,toggleFavorite}=useShop();
 const available=product.variants?.length?product.variants.some(v=>v.inventory>0):product.inventory>0;
 const colors=product.variants?.map(variant=>({id:variant.id,label:variant.label,color:colorOf(variant.label)})).filter(variant=>variant.color)||[];
 const isNew=Boolean(product.newArrival);
 function quickAdd(){
   if(product.variants?.length){router.push(`/product/${product.slug}`);return}
   add(product);
 }
 return <article className={`premium-product-card ${compact?"is-compact":""}`}>
  <div className="premium-product-media" onMouseEnter={()=>{if(window.matchMedia("(hover:hover)").matches)setHover(true)}} onMouseLeave={()=>setHover(false)}>
    <Link href={`/product/${product.slug}`} aria-label={`مشاهده ${product.name}`}>
      <Image src={product.image} alt={product.name} width={660} height={825} loading="lazy" sizes="(max-width: 640px) 46vw, (max-width: 1050px) 31vw, 280px" unoptimized={product.image.startsWith("http")} className="premium-product-photo"/>
      {alternate&&hover&&<Image src={alternate} alt={`${product.name}، نمای دوم`} width={660} height={825} loading="lazy" unoptimized={alternate.startsWith("http")} className="premium-product-photo premium-product-second"/>}
    </Link>
    {isNew?<span className="premium-product-label">جدید</span>:product.comparePrice&&product.comparePrice>product.price?<span className="premium-product-label">پیشنهاد ویژه</span>:null}
    <button type="button" className={`premium-product-fav ${isFavorite(product.id)?"is-active":""}`} onClick={()=>toggleFavorite(product.id)} aria-label={isFavorite(product.id)?"حذف از علاقه‌مندی‌ها":"افزودن به علاقه‌مندی‌ها"} aria-pressed={isFavorite(product.id)}><Heart size={18} strokeWidth={1.6} fill={isFavorite(product.id)?"currentColor":"none"}/></button>
    {available?<button type="button" className="premium-quick-add" onClick={quickAdd}><ShoppingBag size={17} strokeWidth={1.6}/>{product.variants?.length?"انتخاب گزینه‌ها":"افزودن به سبد"}</button>:<span className="premium-sold-out">ناموجود</span>}
  </div>
  <div className="premium-product-info">
    <span>{product.categoryLabel}</span>
    <Link href={`/product/${product.slug}`}>{product.name}<ArrowUpLeft size={16}/></Link>
    <div className="premium-product-price">{product.comparePrice&&product.comparePrice>product.price&&<del>{toman(product.comparePrice)}</del>}<strong>{toman(product.price)}</strong></div>
    {colors.length?<div className="premium-variant-dots" aria-label="رنگ‌های موجود">{colors.slice(0,5).map(v=><span title={v.label} key={v.id} style={{background:v.color||"#f6f3ef"}}/>)}</div>:product.variants?.length?<span className="premium-variants-label">{product.variants.length.toLocaleString("fa-IR")} گزینه قابل انتخاب</span>:null}
  </div>
 </article>
}
