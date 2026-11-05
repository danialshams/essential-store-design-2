"use client";

import Link from "next/link";
import {useLayoutEffect,useRef} from "react";
import gsap from "gsap";
import {ArrowLeft, Instagram, Mail, MapPin, Phone} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
import {targetUrl} from "@/lib/edition-two-content";

export function Footer(){
  const {store}=useShop();
  const edition=store.settings.editorialConfig;
  const footerRef=useRef<HTMLElement>(null);
  useLayoutEffect(()=>{
    const root=footerRef.current;
    if(!root||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const registered:Array<{node:Element;settle:()=>void}>=[];
    const context=gsap.context(()=>{
      const pending=new WeakMap<Element,()=>void>();
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting)pending.get(entry.target)?.();
        });
      },{rootMargin:"0px 0px -7% 0px",threshold:.08});
      const one=(item:Element,order=0,mode:"text"|"link"|"word"="text")=>{
        const rise=mode==="link"?5:mode==="word"?12:14;
        const duration=mode==="link"?.49:mode==="word"?.88:.69;
        gsap.set(item,{autoAlpha:0,y:rise});
        let played=false;
        const settle=()=>{
          if(played)return;
          played=true;
          observer.unobserve(item);
          gsap.set(item,{autoAlpha:1,y:0,clearProps:"transform"});
        };
        registered.push({node:item,settle});
        const enter=()=>{
          if(played)return;
          const bounds=item.getBoundingClientRect();
          if(bounds.top>=innerHeight*.95||bounds.bottom<=0)return;
          played=true;
          observer.unobserve(item);
          gsap.to(item,{autoAlpha:1,y:0,duration,
            delay:order*.075,ease:"power2.out",clearProps:"transform"});
        };
        pending.set(item,enter);
        observer.observe(item);
        if(item.getBoundingClientRect().top<innerHeight*.93)enter();
      };
      const story=root.querySelector(".premium-footer-story");
      if(story)Array.from(story.children).forEach((item,i)=>
        one(item,i,item.tagName==="A"?"link":"text"));
      const columns=root.querySelectorAll(".premium-footer-links>div");
      columns.forEach((column,j)=>
        Array.from(column.children).forEach((item,i)=>
          one(item,j*2+i,item.tagName==="A"?"link":"text"))
      );
      const mark=root.querySelector(".premium-footer-wordmark");
      if(mark)Array.from(mark.children).forEach((item,i)=>one(item,i,"word"));
      const bottom=root.querySelector(".premium-footer-bottom");
      if(bottom)Array.from(bottom.children).forEach((item,i)=>one(item,i,"text"));
      return()=>observer.disconnect();
    },root);
    let frame=0;
    const settlePassed=()=>{
      frame=0;
      for(const {node,settle} of registered){
        if(node.getBoundingClientRect().bottom<-innerHeight*.22)settle();
      }
    };
    const onScroll=()=>{
      if(!frame)frame=requestAnimationFrame(settlePassed);
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    frame=requestAnimationFrame(settlePassed);
    return()=>{
      if(frame)cancelAnimationFrame(frame);
      window.removeEventListener("scroll",onScroll);
      context.revert();
    };
  },[]);
  return <footer ref={footerRef} className="premium-footer">
    <div className="premium-footer-top premium-container">
      <div className="premium-footer-story">
        <span className="premium-eyebrow">{edition?.footer.eyebrow||"THE WAY WE SEE STYLE"}</span>
        <h2>{edition?.footer.title||<>سلیقه، در انتخاب‌های کوچک<br/><i>معنا پیدا می‌کند.</i></>}</h2>
        <Link href="/info/about" className="premium-footer-discover">قصه ما را بخوانید <ArrowLeft size={18}/></Link>
      </div>
      <div className="premium-footer-links">
        {edition?.footerColumns?.length?edition.footerColumns.map(column=><div key={column.id}>
          <h3>{column.title}</h3>
          {column.links.filter(link=>link.target.kind!=="none").map(link=>
           <Link key={link.id} href={targetUrl(link.target,store)}
            target={link.target.kind==="external"?"_blank":undefined}
            rel={link.target.kind==="external"?"noopener noreferrer":undefined}>{link.label}</Link>)}
        </div>):<>
        <div><h3>راهنمای خرید</h3><Link href="/products">همه محصولات</Link><Link href="/cart">سبد خرید</Link><Link href="/account">حساب من</Link><Link href="/info/shipping">ارسال و مرجوعی</Link><Link href="/info/faq">سوالات متداول</Link></div>
        <div><h3>درباره فروشگاه</h3><Link href="/info/about">داستان ما</Link><Link href="/blog">ژورنال</Link><Link href="/info/contact">ارتباط با ما</Link><Link href="/info/privacy">حریم خصوصی</Link><Link href="/info/terms">قوانین و مقررات</Link></div>
        </>}
        <div className="premium-footer-contact"><h3>در ارتباط باشیم</h3><span><Phone size={16}/>{store.settings.contactPhone||"شماره تماس هنوز ثبت نشده"}</span><span><Mail size={16}/>{store.settings.contactEmail||"ایمیل هنوز ثبت نشده"}</span><span><MapPin size={16}/>{store.settings.address||"آدرس از پنل مدیریت قابل تنظیم است"}</span>{store.settings.instagram&&<a href={store.settings.instagram.startsWith("https://")?store.settings.instagram:`https://instagram.com/${store.settings.instagram.replace(/^@/,"")}`} rel="noopener noreferrer" target="_blank"><Instagram size={16}/> اینستاگرام</a>}</div>
      </div>
    </div>
    <div className="premium-footer-wordmark premium-container" aria-hidden="true"><span>{store.settings.storeName}</span><small>THE EDITORIAL COLLECTION / 02</small></div>
    <div className="premium-footer-bottom premium-container">
      <span>© ۱۴۰۵ {store.settings.storeName} — تمامی حقوق محفوظ است.</span>
      <strong>ESSENTIAL — EDITION 02</strong>
      <span>{edition?.footer.bottomNote||"ساخته‌شده با توجه به جزئیات"}</span>
    </div>
  </footer>
}
