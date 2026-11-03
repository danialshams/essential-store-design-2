"use client";

import Link from "next/link";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useRef, useState, type FormEvent} from "react";
import {ArrowLeft, Heart, Menu, Search, ShoppingBag, UserRound, X} from "lucide-react";
import {useShop} from "@/components/ShopProvider";

export function Header(){
  const pathname=usePathname();
  const router=useRouter();
  const {store,count,favorites}=useShop();
  const [menuOpen,setMenuOpen]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState("");
  const searchRef=useRef<HTMLInputElement>(null);
  const categories=store.categories;
  const name=store.settings.storeName||"مزون";
  useEffect(()=>{setMenuOpen(false);setSearchOpen(false)},[pathname]);
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){setMenuOpen(false);setSearchOpen(false)}};
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[]);
  useEffect(()=>{
    if(!menuOpen)return;
    const old=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow=old};
  },[menuOpen]);
  useEffect(()=>{
    if(searchOpen)searchRef.current?.focus();
  },[searchOpen]);
  function search(event:FormEvent){
    event.preventDefault();
    router.push(`/products${query.trim()?`?q=${encodeURIComponent(query.trim())}`:""}`);
    setSearchOpen(false);
  }
  return <>
    <div className="premium-announcement">
      <span className="premium-announcement-dot"/>
      <span>{store.live?"کالکشن‌های منتخب، با امکان سفارش از فروشگاه":"نسخه نمایشی کالکشن ادیتوریال · محصولات و قیمت‌ها نمونه هستند"}</span>
      <span className="premium-announcement-line"/>
      <span className="premium-announcement-en">THE EDITION / 02</span>
    </div>
    <header className="premium-header">
      <div className="premium-header-inner premium-container">
        <div className="premium-header-right">
          <button type="button" className="premium-icon premium-menu-trigger" aria-label="باز کردن فهرست" onClick={()=>setMenuOpen(true)}><Menu size={23} strokeWidth={1.6}/></button>
          <nav className="premium-navigation" aria-label="منوی اصلی">
            <Link className={pathname==="/"?"current":""} href="/">خانه</Link>
            <Link className={pathname.startsWith("/products")?"current":""} href="/products">فروشگاه</Link>
            {categories.slice(0,2).map(category=><Link key={category.id} href={`/category/${category.id}`}>{category.name}</Link>)}
            <Link href="/blog">ژورنال</Link>
          </nav>
        </div>
        <Link href="/" className="premium-brand" aria-label={`${name}، صفحه اصلی`}>
          {store.settings.logoUrl?<Image src={store.settings.logoUrl} width={37} height={37} alt="" unoptimized className="premium-logo-img"/>:null}
          <strong>{name}</strong>
          <span>THE EDITORIAL STORE</span>
        </Link>
        <div className="premium-header-left">
          <button type="button" className="premium-icon" onClick={()=>setSearchOpen(value=>!value)} aria-expanded={searchOpen} aria-label="جستجو"><Search size={20} strokeWidth={1.6}/></button>
          <Link href="/account" className="premium-icon premium-user-action" aria-label="حساب کاربری"><UserRound size={20} strokeWidth={1.6}/></Link>
          <Link href="/account" className="premium-icon premium-heart-action" aria-label={`علاقه‌مندی‌ها (${favorites.length})`}><Heart size={20} strokeWidth={1.6}/></Link>
          <Link href="/cart" className="premium-icon premium-cart-action" aria-label={`سبد خرید، ${count} کالا`}><ShoppingBag size={21} strokeWidth={1.65}/>{count>0&&<span className="premium-cart-count">{count.toLocaleString("fa-IR")}</span>}</Link>
        </div>
      </div>
      <div className={`premium-search-panel ${searchOpen?"is-open":""}`} aria-hidden={!searchOpen}>
        <form className="premium-search-form premium-container" onSubmit={search} role="search">
          <Search size={20} strokeWidth={1.5}/>
          <input ref={searchRef} aria-label="جستجوی محصول" value={query} onChange={event=>setQuery(event.target.value)} placeholder="دنبال چه چیزی می‌گردید؟" tabIndex={searchOpen?0:-1}/>
          <button type="submit" tabIndex={searchOpen?0:-1}>جستجو <ArrowLeft size={17}/></button>
          <button type="button" aria-label="بستن جستجو" onClick={()=>setSearchOpen(false)} tabIndex={searchOpen?0:-1}><X size={19}/></button>
        </form>
      </div>
    </header>
    <div className={`premium-drawer-root ${menuOpen?"is-open":""}`} aria-hidden={!menuOpen}>
      <button className="premium-drawer-backdrop" type="button" aria-label="بستن منو" onClick={()=>setMenuOpen(false)} tabIndex={menuOpen?0:-1}/>
      <aside className="premium-drawer" aria-label="فهرست فروشگاه" inert={!menuOpen}>
        <div className="premium-drawer-head"><span>THE EDITION</span><button type="button" aria-label="بستن منو" onClick={()=>setMenuOpen(false)}><X size={23}/></button></div>
        <div className="premium-drawer-eyebrow">فهرست فروشگاه</div>
        <nav>
          <Link href="/">صفحه اصلی <ArrowLeft size={19}/></Link>
          <Link href="/products">تمام محصولات <ArrowLeft size={19}/></Link>
          {categories.map(category=><Link key={category.id} href={`/category/${category.id}`}>{category.name}<ArrowLeft size={19}/></Link>)}
          <Link href="/blog">ژورنال و داستان‌ها <ArrowLeft size={19}/></Link>
          <Link href="/info/about">درباره ما <ArrowLeft size={19}/></Link>
          <Link href="/info/contact">ارتباط با ما <ArrowLeft size={19}/></Link>
        </nav>
        <div className="premium-drawer-bottom"><span>ESSENTIAL / COLLECTION 02</span><p>جزئیات، تفاوت می‌سازند.</p></div>
      </aside>
    </div>
  </>
}
