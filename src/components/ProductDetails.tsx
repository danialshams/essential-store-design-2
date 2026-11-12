"use client";
import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {ShoppingCart,Heart,ShieldCheck,Truck,RotateCcw,Minus,Plus,Check,ChevronLeft,Package,Share2} from "lucide-react";
import type {Product} from "@/lib/catalog";
import {toman,numberFa} from "@/lib/catalog";
import {useShop} from "@/components/ShopProvider";
import {ProductCard} from "@/components/ProductCard";
import {ReviewBox} from "@/components/ReviewBox";

export function ProductDetails({product}:{product:Product}){
 const {store,add,isFavorite,toggleFavorite,notify}=useShop();
 const [variantId,setVariantId]=useState(product.variants?.[0]?.id||"");
 const [quantity,setQuantity]=useState(1),[tab,setTab]=useState<"description"|"specs"|"reviews">("description");
 const [imageIndex,setImageIndex]=useState(0);
 const images=product.gallery?.length?product.gallery:[product.image];
 const selected=product.variants?.find(v=>v.id===variantId);
 const price=selected?.price??product.price;
 const inventory=selected?selected.inventory:product.inventory;
 const related=store.products.filter(p=>p.category===product.category&&p.id!==product.id&&p.inventory>0).sort((a,b)=>{
  const aSpec=Object.values(a.specs||{}).filter(x=>Object.values(product.specs||{}).includes(x)).length;
  const bSpec=Object.values(b.specs||{}).filter(x=>Object.values(product.specs||{}).includes(x)).length;
  return bSpec-aSpec;
 }).slice(0,4);
 const reviews=store.reviews.filter(r=>r.productId===product.id);
 function handleAdd(){add(product,variantId||undefined,quantity)}
 async function share(){try{await navigator.clipboard.writeText(window.location.href);notify("لینک محصول کپی شد")}catch{notify("امکان کپی لینک وجود ندارد")}}
 return <div className="container product-page">
   <div className="breadcrumbs"><Link href="/">خانه</Link><ChevronLeft size={14}/><Link href="/products">محصولات</Link><ChevronLeft size={14}/><Link href={`/category/${product.category}`}>{product.categoryLabel}</Link><ChevronLeft size={14}/><span>{product.name}</span></div>
   <div className="product-detail-layout">
    <div className="product-gallery"><div className="product-main-photo"><Image src={images[imageIndex]||product.image} alt={product.name} width={900} height={760} unoptimized={(images[imageIndex]||"").startsWith("http")} priority/><button aria-label="افزودن به علاقه‌مندی‌ها" className={`gallery-favorite ${isFavorite(product.id)?"active":""}`} onClick={()=>toggleFavorite(product.id)}><Heart size={21} fill={isFavorite(product.id)?"currentColor":"none"}/></button></div>{images.length>1&&<div className="gallery-thumbnails">{images.map((x,i)=><button aria-label={`تصویر ${numberFa(i+1)}`} aria-pressed={imageIndex===i} key={i} className={imageIndex===i?"active":""} onClick={()=>setImageIndex(i)}><Image src={x} alt="" width={90} height={70} unoptimized={x.startsWith("http")}/></button>)}</div>}</div>
    <div className="product-information"><div className="detail-heading"><span className="eyebrow">{product.categoryLabel} / {store.settings.storeName}</span><h1>{product.name}</h1><p>{product.subtitle}</p><div className="detail-sku">شناسه محصول: <span dir="ltr">{product.sku}</span></div></div>
      <div className="detail-price-box">{product.comparePrice&&<del>{toman(product.comparePrice)}</del>}<strong>{toman(price)}</strong><span className={inventory>0?"availability in-stock":"availability out-stock"}>{inventory>0?<><Check size={16}/>موجود در انبار</>:"ناموجود"}</span></div>
      {product.variants&&product.variants.length>0&&<div className="variant-select"><strong>انتخاب {product.category==="shoes"||product.category==="clothing"?"سایز / مدل":"رنگ / مدل"}</strong><div className="variant-buttons">{product.variants.map(v=><button type="button" key={v.id} disabled={v.inventory<=0} aria-pressed={variantId===v.id} className={variantId===v.id?"active":""} onClick={()=>{setVariantId(v.id);setQuantity(1)}}>{v.label}</button>)}</div></div>}
      <div className="detail-purchase-controls"><div className="quantity-stepper" aria-label="تعداد محصول"><button aria-label="کم کردن تعداد" disabled={quantity<=1} onClick={()=>setQuantity(n=>Math.max(1,n-1))}><Minus size={17}/></button><output>{numberFa(quantity)}</output><button aria-label="افزایش تعداد" disabled={quantity>=inventory} onClick={()=>setQuantity(n=>Math.min(inventory,n+1))}><Plus size={17}/></button></div><button disabled={inventory<=0} className="button button-primary detail-add" onClick={handleAdd}>افزودن به سبد خرید <ShoppingCart size={19}/></button><button className="share-button" title="اشتراک‌گذاری" aria-label="کپی لینک محصول" onClick={share}><Share2 size={20}/></button></div>
      <div className="product-advantages"><div><Truck size={19}/>ارسال سریع سفارش</div><div><ShieldCheck size={19}/>ضمانت اصالت کالا</div><div><RotateCcw size={19}/>امکان درخواست مرجوعی طبق شرایط</div></div>
    </div>
   </div>
   <section className="product-extra"><div className="product-tabs" role="tablist" aria-label="اطلاعات محصول"><button role="tab" aria-selected={tab==="description"} className={tab==="description"?"active":""} onClick={()=>setTab("description")}>توضیحات محصول</button><button role="tab" aria-selected={tab==="specs"} className={tab==="specs"?"active":""} onClick={()=>setTab("specs")}>مشخصات</button><button role="tab" aria-selected={tab==="reviews"} className={tab==="reviews"?"active":""} onClick={()=>setTab("reviews")}>دیدگاه‌ها</button></div><div className="product-tab-panel" role="tabpanel">{tab==="description"?<p>{product.description}</p>:tab==="specs"?<dl className="specs-table">{Object.entries(product.specs).map(([key,val])=><div key={key}><dt>{key}</dt><dd>{val}</dd></div>)}</dl>:<div className="reviews-placeholder"><ReviewBox productId={product.id} initial={reviews}/></div>}</div></section>
   {related.length>0&&<section className="related-section"><div className="section-heading"><h2>محصولات مرتبط</h2><Link href={`/category/${product.category}`}>مشاهده همه <ChevronLeft size={17}/></Link></div><div className="product-grid">{related.map(p=><ProductCard key={p.id} product={p}/>)}</div></section>}
   <div className="mobile-product-buy"><span>{toman(price)}</span><button disabled={inventory<=0} onClick={handleAdd} className="button button-primary">افزودن به سبد <ShoppingCart size={17}/></button></div>
 </div>;
}
