"use client";

import Link from "next/link";
import Image from "next/image";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useMemo,useRef,useState,type FormEvent,type KeyboardEvent as ReactKeyboardEvent} from "react";
import {ArrowLeft,ArrowUpLeft,Heart,Search,ShoppingBag,UserRound,X} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
import {toman} from "@/lib/catalog";
import {targetUrl} from "@/lib/edition-two-content";

const fallbackPhoto="/images/editorial/category-bags.webp";
const normalizeSearch=(value:string)=>value.normalize("NFKC").toLocaleLowerCase("fa")
 .replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g," ")
 .replace(/[ًٌٍَُِّْ]/g,"").replace(/\s+/g," ").trim();
const demoCategoryImages:Record<string,string>={clothing:"/images/editorial/category-clothing.webp",bags:"/images/editorial/category-bags.webp",shoes:"/images/editorial/category-shoes.webp",accessories:"/images/editorial/category-accessories.webp"};
export function Header(){
 const pathname=usePathname(),router=useRouter();
 const {store,count,favorites}=useShop();
 const [menuOpen,setMenuOpen]=useState(false),[searchOpen,setSearchOpen]=useState(false);
 const [query,setQuery]=useState(""),[menuPhoto,setMenuPhoto]=useState(fallbackPhoto);
 const [selectedSearch,setSelectedSearch]=useState(0);
 const searchRef=useRef<HTMLInputElement>(null),searchPanelRef=useRef<HTMLDivElement>(null),searchTriggerRef=useRef<HTMLButtonElement>(null),closeRef=useRef<HTMLButtonElement>(null),menuButton=useRef<HTMLButtonElement>(null);
 const requestedMenuPhoto=useRef(0);
 const name=store.settings.storeName||"مزون";
 const firstCategory=store.categories[0];
 const edition=store.settings.editorialConfig;
 const normalizedQuery=normalizeSearch(query);
 const results=useMemo(()=>{
  if(!normalizedQuery)return [];
  const terms=normalizedQuery.split(" ");
  return store.products.filter(product=>{
   const haystack=normalizeSearch([
    product.name,product.subtitle,product.categoryLabel,product.sku
   ].join(" "));
   return terms.every(term=>haystack.includes(term));
  }).slice(0,7);
 },[normalizedQuery,store.products]);
 const menuItems=edition?edition.navigation.filter(x=>x.target.kind!=="none").map(link=>({
   label:link.label,href:targetUrl(link.target,store),
   image:link.target.kind==="product"?store.products.find(p=>p.id===link.target.id)?.image||fallbackPhoto:
    link.target.kind==="category"?store.categories.find(c=>c.dbId===link.target.id||c.id===link.target.id)?.image||fallbackPhoto:fallbackPhoto
  })):[
  {label:"صفحه اصلی",href:"/",image:"/images/editorial/hero-main.webp"},
  {label:"کالکشن‌ها",href:"/products",image:"/images/editorial/category-clothing.webp"},
  ...store.categories.slice(0,5).map(category=>({label:category.name,href:`/category/${category.id}`,image:category.image?.startsWith("/images/")?(demoCategoryImages[category.id]||category.image):category.image||fallbackPhoto})),
  {label:"ژورنال",href:"/blog",image:"/images/editorial/journal-style.webp"},
  {label:"درباره ما",href:"/info/about",image:fallbackPhoto},
  {label:"ارتباط با ما",href:"/info/contact",image:fallbackPhoto}
 ];
 useEffect(()=>{setMenuOpen(false);setSearchOpen(false)},[pathname]);
 useEffect(()=>{
  const onKey=(event:globalThis.KeyboardEvent)=>{if(event.key==="Escape"){setMenuOpen(false);setSearchOpen(false)}};
  document.addEventListener("keydown",onKey);
  return()=>document.removeEventListener("keydown",onKey);
 },[]);
 useEffect(()=>{
  if(!menuOpen)return;
  const old=document.body.style.overflow;
  document.body.style.overflow="hidden";
  closeRef.current?.focus();
  return()=>{document.body.style.overflow=old;menuButton.current?.focus()};
 },[menuOpen]);
 useEffect(()=>{if(searchOpen)searchRef.current?.focus()},[searchOpen]);
 useEffect(()=>{
  if(!searchOpen)return;
  const onPointerDown=(event:PointerEvent)=>{
   const target=event.target as Node;
   if(searchPanelRef.current?.contains(target)||searchTriggerRef.current?.contains(target))return;
   setSearchOpen(false);
  };
  document.addEventListener("pointerdown",onPointerDown);
  return()=>document.removeEventListener("pointerdown",onPointerDown);
 },[searchOpen]);
 function showMenuPhoto(image:string){
  const token=++requestedMenuPhoto.current;
  // Decode the incoming photograph before swapping the visible one. Quick
  // hover changes cannot allow an older image to win the race.
  const next=new window.Image();
  next.src=image;
  if(typeof next.decode!=="function"){setMenuPhoto(image);return}
  void next.decode().then(()=>{
   if(requestedMenuPhoto.current===token)setMenuPhoto(image);
  }).catch(()=>{
   if(requestedMenuPhoto.current===token)setMenuPhoto(image);
  });
 }
 function submit(event:FormEvent){
  event.preventDefault();
  if(results.length){
   const chosen=results[Math.min(selectedSearch,results.length-1)];
   router.push("/product/"+encodeURIComponent(chosen.slug));
  }else if(normalizedQuery){
   router.push("/products?q="+encodeURIComponent(query.trim()));
  }
  setSearchOpen(false);
 }
 function searchKeyDown(event:ReactKeyboardEvent<HTMLInputElement>){
  if(event.key==="ArrowDown"&&results.length){
   event.preventDefault();setSelectedSearch(v=>(v+1)%results.length);
  }else if(event.key==="ArrowUp"&&results.length){
   event.preventDefault();setSelectedSearch(v=>(v-1+results.length)%results.length);
  }
 }
 function trapMenuFocus(event:ReactKeyboardEvent<HTMLElement>){
  if(event.key!=="Tab")return;
  const focusable=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
  const first=focusable[0],last=focusable[focusable.length-1];
  if(!first||!last)return;
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
 return <>
  <div className="premium-announcement"><span className="premium-announcement-dot"/><span>{edition?.announcement||(store.live?"کالکشن‌های منتخب، با امکان سفارش از فروشگاه":"نسخه نمایشی کالکشن ادیتوریال · محصولات و قیمت‌ها نمونه هستند")}</span><span className="premium-announcement-line"/><span className="premium-announcement-en">THE EDITION / 02</span></div>
  <header className="premium-header">
   <div className="premium-header-inner premium-container">
    <div className="premium-header-right">
     <button ref={menuButton} type="button" className={`premium-icon premium-menu-trigger ${menuOpen?"is-open":""}`} aria-label="باز کردن فهرست" aria-expanded={menuOpen} aria-controls="maison-menu" onClick={()=>{setSearchOpen(false);setMenuPhoto(fallbackPhoto);setMenuOpen(true)}}><span className="premium-menu-lines" aria-hidden="true"><i/><i/></span><span className="premium-menu-word">MENU</span></button>
     <nav className="premium-navigation" aria-label="منوی اصلی">{edition?edition.navigation.filter(x=>x.target.kind!=="none").map(link=><Link key={link.id} className={pathname===targetUrl(link.target,store)?"current":""} href={targetUrl(link.target,store)}>{link.label}</Link>):<><Link className={pathname==="/"?"current":""} href="/">خانه</Link><Link href="/products">فروشگاه</Link>{firstCategory&&<Link href={`/category/${firstCategory.id}`}>{firstCategory.name}</Link>}<Link href="/blog">ژورنال</Link></>}</nav>
    </div>
    <Link href="/" className="premium-brand" aria-label={`${name}، صفحه اصلی`}>{store.settings.logoUrl&&<Image src={store.settings.logoUrl} width={37} height={37} alt="" unoptimized className="premium-logo-img"/>}<strong lang={/[\u0600-\u06FF]/.test(name)?"fa":"en"}>{name}</strong><span>THE EDITORIAL STORE</span></Link>
    <div className="premium-header-left">
     <button ref={searchTriggerRef} type="button" className="premium-icon" onClick={()=>setSearchOpen(v=>!v)} aria-expanded={searchOpen} aria-controls="premium-search-panel" aria-label="جستجو"><Search size={20} strokeWidth={1.5}/></button>
     <Link href="/account" className="premium-icon premium-user-action" aria-label="حساب کاربری"><UserRound size={20} strokeWidth={1.5}/></Link>
     <Link href="/account" className="premium-icon premium-heart-action" aria-label={`علاقه‌مندی‌ها (${favorites.length})`}><Heart size={20} strokeWidth={1.5}/></Link>
     <Link href="/cart" className="premium-icon premium-cart-action" aria-label={`سبد خرید، ${count} کالا`}><ShoppingBag size={21} strokeWidth={1.5}/>{count>0&&<span className="premium-cart-count">{count.toLocaleString("fa-IR")}</span>}</Link>
    </div>
   </div>
   <div id="premium-search-panel" ref={searchPanelRef} className={`premium-search-panel ${searchOpen?"is-open":""}`} aria-hidden={!searchOpen} inert={!searchOpen}>
    <form className="premium-search-form premium-container" onSubmit={submit} role="search" autoComplete="off">
     <Search size={19} strokeWidth={1.4} aria-hidden="true"/>
     <input ref={searchRef} aria-label="جستجوی محصول" role="combobox" aria-autocomplete="list"
      aria-expanded={searchOpen&&Boolean(normalizedQuery)} aria-controls="premium-search-results"
      aria-activedescendant={normalizedQuery&&results.length?`premium-search-item-${selectedSearch}`:undefined}
      value={query} onChange={event=>{setQuery(event.target.value);setSelectedSearch(0)}}
      onKeyDown={searchKeyDown} placeholder="دنبال چه چیزی می‌گردید؟" tabIndex={searchOpen?0:-1}/>
     <button type="button" aria-label="بستن جستجو" onClick={()=>setSearchOpen(false)}
      tabIndex={searchOpen?0:-1}><X size={20} strokeWidth={1.4}/></button>
    </form>
    {normalizedQuery&&<div id="premium-search-results" className="premium-search-results premium-container"
      role="listbox" aria-label="نتایج لحظه‌ای محصولات" aria-live="polite">
     {results.length?results.map((product,index)=>
      <Link href={`/product/${product.slug}`} key={product.id} id={`premium-search-item-${index}`}
       role="option" aria-selected={selectedSearch===index}
       className={`premium-search-result ${selectedSearch===index?"is-selected":""}`}
       tabIndex={searchOpen?0:-1}
       onMouseEnter={()=>setSelectedSearch(index)} onClick={()=>setSearchOpen(false)}>
       <Image src={product.image} width={52} height={60} alt="" loading="lazy"
        unoptimized={product.image.startsWith("http")}/>
       <span className="premium-search-result-copy"><strong>{product.name}</strong>
        <small>{product.categoryLabel} · {toman(product.price)}</small></span>
       <ArrowUpLeft size={17} strokeWidth={1.3}/>
      </Link>
     ):<p className="premium-search-empty" role="status">محصولی با این عبارت پیدا نشد.</p>}
    </div>}
   </div>
  </header>
  <div id="maison-menu" className={`premium-drawer-root ${menuOpen?"is-open":""}`} aria-hidden={!menuOpen} inert={!menuOpen}>
   <button type="button" className="premium-drawer-backdrop" onClick={()=>setMenuOpen(false)} aria-label="بستن منو" tabIndex={menuOpen?0:-1}/>
   <aside className="premium-drawer" aria-label="فهرست فروشگاه" onKeyDown={trapMenuFocus}>
    <div className="premium-drawer-head"><span>THE MAISON / EDITION 02</span><button ref={closeRef} type="button" onClick={()=>setMenuOpen(false)} aria-label="بستن منو"><X size={23} strokeWidth={1.4}/></button></div>
    <div className="premium-drawer-layout">
     <div className="premium-drawer-text">
      <span className="premium-drawer-eyebrow">فهرست کالکشن‌ها / DISCOVER</span>
      <nav aria-label="ناوبری منوی بازشده">{menuItems.map((item,index)=><Link key={`${item.href}-${index}`} href={item.href} className={pathname===item.href?"current":""} onMouseEnter={()=>showMenuPhoto(item.image)} onFocus={()=>showMenuPhoto(item.image)} style={{animationDelay:`${Math.min(index,8)*58}ms`}}><small>{String(index+1).padStart(2,"0")}</small><span>{item.label}</span><ArrowUpLeft size={20} strokeWidth={1.3}/></Link>)}</nav>
      <div className="premium-drawer-bottom"><span>ESSENTIAL / A QUIETER KIND OF LUXURY</span><p>جزئیات، تفاوت می‌سازند.</p></div>
     </div>
     <div className="premium-drawer-editorial"><div className="premium-drawer-image"><Image key={`background-${menuPhoto}`} src={menuPhoto} alt="" aria-hidden="true" fill sizes="(max-width: 760px) 100vw, 43vw" unoptimized={menuPhoto.startsWith("http")} className="premium-drawer-image-bg"/><Image key={`foreground-${menuPhoto}`} src={menuPhoto} alt="تصویر منتخب کالکشن" fill sizes="(max-width: 760px) 100vw, 43vw" unoptimized={menuPhoto.startsWith("http")} className="premium-drawer-image-main"/></div><div className="premium-drawer-image-caption"><span>AN EDITORIAL PERSPECTIVE</span><span>EST. MMXXVI</span></div></div>
    </div>
   </aside>
  </div>
 </>;
}
