"use client";

import Link from "next/link";
import {useLayoutEffect,useRef} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {ArrowLeft, Instagram, Mail, MapPin, Phone} from "lucide-react";
import {useShop} from "@/components/ShopProvider";

export function Footer(){
  const {store}=useShop();
  const footerRef=useRef<HTMLElement>(null);
  useLayoutEffect(()=>{
    const el=footerRef.current;
    if(!el||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    gsap.registerPlugin(ScrollTrigger);
    const context=gsap.context(()=>{
      const text=el.querySelector(".premium-footer-story");
      const cols=Array.from(el.querySelectorAll(".premium-footer-links>div"));
      const wordmark=el.querySelector(".premium-footer-wordmark");
      if(text)gsap.fromTo(Array.from(text.children),{autoAlpha:0,y:24},
        {autoAlpha:1,y:0,duration:1.05,stagger:.2,ease:"power3.out",
          scrollTrigger:{trigger:el,start:"top 89%",once:true}});
      if(cols.length)gsap.fromTo(cols,{autoAlpha:0,y:30},
        {autoAlpha:1,y:0,duration:1.1,stagger:.16,ease:"power3.out",
          scrollTrigger:{trigger:el,start:"top 85%",once:true}});
      if(wordmark)gsap.fromTo(wordmark,{autoAlpha:0,x:40},
        {autoAlpha:1,x:0,duration:1.3,ease:"power3.out",
          scrollTrigger:{trigger:wordmark,start:"top 94%",once:true}});
    },el);
    return()=>context.revert();
  },[]);
  return <footer ref={footerRef} className="premium-footer">
    <div className="premium-footer-top premium-container">
      <div className="premium-footer-story">
        <span className="premium-eyebrow">THE WAY WE SEE STYLE</span>
        <h2>سلیقه، در انتخاب‌های کوچک<br/><i>معنا پیدا می‌کند.</i></h2>
        <Link href="/info/about" className="premium-footer-discover">قصه ما را بخوانید <ArrowLeft size={18}/></Link>
      </div>
      <div className="premium-footer-links">
        <div><h3>راهنمای خرید</h3><Link href="/products">همه محصولات</Link><Link href="/cart">سبد خرید</Link><Link href="/account">حساب من</Link><Link href="/info/shipping">ارسال و مرجوعی</Link><Link href="/info/faq">سوالات متداول</Link></div>
        <div><h3>درباره فروشگاه</h3><Link href="/info/about">داستان ما</Link><Link href="/blog">ژورنال</Link><Link href="/info/contact">ارتباط با ما</Link><Link href="/info/privacy">حریم خصوصی</Link><Link href="/info/terms">قوانین و مقررات</Link></div>
        <div className="premium-footer-contact"><h3>در ارتباط باشیم</h3><span><Phone size={16}/>{store.settings.contactPhone||"شماره تماس هنوز ثبت نشده"}</span><span><Mail size={16}/>{store.settings.contactEmail||"ایمیل هنوز ثبت نشده"}</span><span><MapPin size={16}/>{store.settings.address||"آدرس از پنل مدیریت قابل تنظیم است"}</span>{store.settings.instagram&&<a href={store.settings.instagram.startsWith("https://")?store.settings.instagram:`https://instagram.com/${store.settings.instagram.replace(/^@/,"")}`} rel="noopener noreferrer" target="_blank"><Instagram size={16}/> اینستاگرام</a>}</div>
      </div>
    </div>
    <div className="premium-footer-wordmark premium-container" aria-hidden="true"><span>{store.settings.storeName}</span><small>THE EDITORIAL COLLECTION / 02</small></div>
    <div className="premium-footer-bottom premium-container">
      <span>© ۱۴۰۵ {store.settings.storeName} — تمامی حقوق محفوظ است.</span>
      <strong>ESSENTIAL — EDITION 02</strong>
      <span>ساخته‌شده با توجه به جزئیات</span>
    </div>
  </footer>
}
