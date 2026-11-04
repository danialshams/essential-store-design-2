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
    const pending=new WeakMap<Element,gsap.core.Timeline>();
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        pending.get(entry.target)?.play();
        observer.unobserve(entry.target);
      }
    },{rootMargin:"0px 0px -20% 0px",threshold:0.01});
    const context=gsap.context(()=>{
      const stage=(target:Element,items:Element[],from:gsap.TweenVars,start="top 77%",stagger=.14)=>{
        if(!items.length)return;
        const timeline=gsap.timeline({paused:true});
        timeline.fromTo(items,{opacity:.24,y:21,...from},{opacity:1,x:0,y:0,duration:1,
          stagger,ease:"power3.out",clearProps:"transform"});
        pending.set(target,timeline);
        observer.observe(target);
        ScrollTrigger.create({trigger:target,start,once:true,
          onEnter:()=>timeline.play(),onEnterBack:()=>timeline.play()});
      };
      const story=el.querySelector(".premium-footer-story");
      if(story)stage(story,Array.from(story.children),{y:28},"top 76%",.2);
      const cols=Array.from(el.querySelectorAll(".premium-footer-links>div"));
      cols.forEach((col,i)=>stage(col,Array.from(col.children),
        {x:i%2?-11:11,y:17},"top 78%",.12));
      const wordmark=el.querySelector(".premium-footer-wordmark");
      if(wordmark)stage(wordmark,[wordmark],{x:38},"top 80%");
      const bottom=el.querySelector(".premium-footer-bottom");
      if(bottom)stage(bottom,Array.from(bottom.children),{y:14},"top 81%",.12);
    },el);
    return()=>{observer.disconnect();context.revert()};
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
