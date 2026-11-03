"use client";

import Link from "next/link";
import Image from "next/image";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useRef,useState,type FormEvent,type KeyboardEvent as ReactKeyboardEvent} from "react";
import {ArrowLeft,ArrowUpLeft,Heart,Search,ShoppingBag,UserRound,X} from "lucide-react";
import {useShop} from "@/components/ShopProvider";

const fallbackPhoto="/images/editorial-portrait.webp";
export function Header(){
 const pathname=usePathname(),router=useRouter();
 const {store,count,favorites}=useShop();
 const [menuOpen,setMenuOpen]=useState(false),[searchOpen,setSearchOpen]=useState(false);
 const [query,setQuery]=useState(""),[menuPhoto,setMenuPhoto]=useState(fallbackPhoto);
 const searchRef=useRef<HTMLInputElement>(null),closeRef=useRef<HTMLButtonElement>(null),menuButton=useRef<HTMLButtonElement>(null);
 const name=store.settings.storeName||"مزون";
 const firstCategory=store.categories[0];
 const menuItems=[
  {label:"صفحه اصلی",href:"/",image:"/images/editorial-hero.webp"},
  {label:"کالکشن‌ها",href:"/products",image:"/images/editorial-portrait.webp"},
  ...store.categories.slice(0,5).map(category=>({label:category.name,href:`/category/${category.id}`,image:category.image||fallbackPhoto})),
  {label:"ژورنال",href:"/blog",image:"/images/editorial-bag.webp"},
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
 function submit(event:FormEvent){event.preventDefault();router.push(`/products${query.trim()?`?q=${encodeURIComponent(query.trim())}`:""}`);setSearchOpen(false)}
 function trapMenuFocus(event:ReactKeyboardEvent<HTMLElement>){
  if(event.key!=="Tab")return;
  const focusable=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
  const first=focusable[0],last=focusable[focusable.length-1];
  if(!first||!last)return;
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
 return <>
  <div className="premium-announcement"><span className="premium-announcement-dot"/><span>{store.live?"کالکشن‌های منتخب، با امکان سفارش از فروشگاه":"نسخه نمایشی کالکشن ادیتوریال · محصولات و قیمت‌ها نمونه هستند"}</span><span className="premium-announcement-line"/><span className="premium-announcement-en">THE EDITION / 02</span></div>
  <header className="premium-header">
   <div className="premium-header-inner premium-container">
    <div className="premium-header-right">
     <button ref={menuButton} type="button" className={`premium-icon premium-menu-trigger ${menuOpen?"is-open":""}`} aria-label="باز کردن فهرست" aria-expanded={menuOpen} aria-controls="maison-menu" onClick={()=>{setSearchOpen(false);setMenuPhoto(fallbackPhoto);setMenuOpen(true)}}><span className="premium-menu-lines" aria-hidden="true"><i/><i/></span><span className="premium-menu-word">MENU</span></button>
     <nav className="premium-navigation" aria-label="منوی اصلی"><Link className={pathname==="/"?"current":""} href="/">خانه</Link><Link href="/products">فروشگاه</Link>{firstCategory&&<Link href={`/category/${firstCategory.id}`}>{firstCategory.name}</Link>}<Link href="/blog">ژورنال</Link></nav>
    </div>
    <Link href="/" className="premium-brand" aria-label={`${name}، صفحه اصلی`}>{store.settings.logoUrl&&<Image src={store.settings.logoUrl} width={37} height={37} alt="" unoptimized className="premium-logo-img"/>}<strong>{name}</strong><span>THE EDITORIAL STORE</span></Link>
    <div className="premium-header-left">
     <button type="button" className="premium-icon" onClick={()=>setSearchOpen(v=>!v)} aria-expanded={searchOpen} aria-label="جستجو"><Search size={20} strokeWidth={1.5}/></button>
     <Link href="/account" className="premium-icon premium-user-action" aria-label="حساب کاربری"><UserRound size={20} strokeWidth={1.5}/></Link>
     <Link href="/account" className="premium-icon premium-heart-action" aria-label={`علاقه‌مندی‌ها (${favorites.length})`}><Heart size={20} strokeWidth={1.5}/></Link>
     <Link href="/cart" className="premium-icon premium-cart-action" aria-label={`سبد خرید، ${count} کالا`}><ShoppingBag size={21} strokeWidth={1.5}/>{count>0&&<span className="premium-cart-count">{count.toLocaleString("fa-IR")}</span>}</Link>
    </div>
   </div>
   <div className={`premium-search-panel ${searchOpen?"is-open":""}`} aria-hidden={!searchOpen}><form className="premium-search-form premium-container" onSubmit={submit} role="search"><Search size={20} strokeWidth={1.5}/><input ref={searchRef} aria-label="جستجوی محصول" value={query} onChange={event=>setQuery(event.target.value)} placeholder="دنبال چه چیزی می‌گردید؟" tabIndex={searchOpen?0:-1}/><button type="submit" tabIndex={searchOpen?0:-1}>جستجو <ArrowLeft size={17}/></button><button type="button" aria-label="بستن جستجو" onClick={()=>setSearchOpen(false)} tabIndex={searchOpen?0:-1}><X size={19}/></button></form></div>
  </header>
  <div id="maison-menu" className={`premium-drawer-root ${menuOpen?"is-open":""}`} aria-hidden={!menuOpen} inert={!menuOpen}>
   <button type="button" className="premium-drawer-backdrop" onClick={()=>setMenuOpen(false)} aria-label="بستن منو" tabIndex={menuOpen?0:-1}/>
   <aside className="premium-drawer" aria-label="فهرست فروشگاه" onKeyDown={trapMenuFocus}>
    <div className="premium-drawer-head"><span>THE MAISON / EDITION 02</span><button ref={closeRef} type="button" onClick={()=>setMenuOpen(false)} aria-label="بستن منو"><X size={23} strokeWidth={1.4}/><span>CLOSE</span></button></div>
    <div className="premium-drawer-layout">
     <div className="premium-drawer-text">
      <span className="premium-drawer-eyebrow">فهرست کالکشن‌ها / DISCOVER</span>
      <nav aria-label="ناوبری منوی بازشده">{menuItems.map((item,index)=><Link key={`${item.href}-${index}`} href={item.href} className={pathname===item.href?"current":""} onMouseEnter={()=>setMenuPhoto(item.image)} onFocus={()=>setMenuPhoto(item.image)} style={{animationDelay:`${Math.min(index,8)*58}ms`}}><small>{String(index+1).padStart(2,"0")}</small><span>{item.label}</span><ArrowUpLeft size={20} strokeWidth={1.3}/></Link>)}</nav>
      <div className="premium-drawer-bottom"><span>ESSENTIAL / A QUIETER KIND OF LUXURY</span><p>جزئیات، تفاوت می‌سازند.</p></div>
     </div>
     <div className="premium-drawer-editorial"><div className="premium-drawer-image"><Image key={menuPhoto} src={menuPhoto} alt="تصویر منتخب کالکشن" fill sizes="(max-width: 760px) 100vw, 43vw" unoptimized={menuPhoto.startsWith("http")}/></div><div className="premium-drawer-image-caption"><span>AN EDITORIAL PERSPECTIVE</span><span>EST. MMXXVI</span></div></div>
    </div>
   </aside>
  </div>
 </>;
}
