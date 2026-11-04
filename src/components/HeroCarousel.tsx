"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowRight,ArrowUpRight,ChevronLeft,ChevronRight,Pause,Play} from "lucide-react";

export type EditorialSlide={
 id:string;
 image:string;
 mobileImage?:string;
 title:string;
 description:string;
 eyebrow:string;
 ctaLabel:string;
 ctaHref:string;
 alt:string;
};
type Props={slides:EditorialSlide[]};
const INTERVAL=9000;
export function HeroCarousel({slides}:Props){
 const [active,setActive]=useState(0);
 const [paused,setPaused]=useState(false);
 const [reduce,setReduce]=useState(false);
 const touchX=useRef<number|null>(null);
 useEffect(()=>{
  const mq=window.matchMedia("(prefers-reduced-motion: reduce)");
  const change=()=>setReduce(mq.matches);
  change();
  mq.addEventListener?.("change",change);
  return()=>mq.removeEventListener?.("change",change);
 },[]);
 useEffect(()=>{
  if(paused||reduce||slides.length<2)return;
  const timer=window.setInterval(()=>{
   if(document.visibilityState==="visible")setActive(v=>(v+1)%slides.length);
  },INTERVAL);
  return()=>window.clearInterval(timer);
 },[paused,reduce,slides.length]);
 // Autoplay never stops just because the pointer rests on this hero.
 const go=(value:number)=>setActive((value+slides.length)%slides.length);
 const slide=slides[active]??slides[0];
 if(!slide)return null;
 return <section className="ed-hero ed-hero-carousel" aria-roledescription="carousel" aria-label="کالکشن‌های منتخب" 
   aria-labelledby="ed-hero-title"
}
   onTouchStart={event=>{touchX.current=event.touches[0]?.clientX??null}}
   onTouchEnd={event=>{if(touchX.current==null)return;const diff=event.changedTouches[0].clientX-touchX.current;if(Math.abs(diff)>65)go(active+(diff>0?1:-1));touchX.current=null}}>
  <div className="ed-hero-content">
   <div key={slide.id} className="ed-hero-copy-frame" data-active-hero-copy>
    <span className="ed-hero-eyebrow" data-hero-kicker><span/> THE EDITORIAL / {String(active+1).padStart(2,"0")}</span>
    <p className="ed-hero-intro" data-hero-kicker>{slide.eyebrow}</p>
    <h1 id="ed-hero-title">{slide.title.split("\n").filter(Boolean).map((line,i)=>
     <span key={i} className="ed-hero-line-mask"><span data-hero-line>{line}</span></span>)}</h1>
    <p className="ed-hero-description" data-hero-description>{slide.description}</p>
    <div className="ed-hero-links" data-hero-action>
     <Link className="ed-dark-button" href={slide.ctaHref}>{slide.ctaLabel}<ArrowUpRight size={18} strokeWidth={1.5}/></Link>
     <Link className="ed-text-link" href="#ed-categories">دیدن دسته‌بندی‌ها <ArrowRight size={17}/></Link>
    </div>
   </div>
   <div className="ed-hero-bottom" data-hero-action>
    <span>ESSENTIAL / EDITION 02</span><span className="ed-hero-bottom-line"/><span>{String(active+1).padStart(2,"0")} — {String(slides.length).padStart(2,"0")}</span>
   </div>
  </div>
  <div className="ed-hero-visual" data-hero-image>
   <div className="ed-hero-media-shell" data-hero-media>
    {slides.map((frame,i)=>(
     <div className={`ed-hero-slide ${i===active?"is-active":""}`} key={frame.id} aria-hidden={i!==active}>
      <Image src={frame.image} alt={i===active?frame.alt:""} fill priority={i===0} loading={i===0?"eager":undefined} quality={86}
        sizes="(max-width:760px) 100vw, 57vw" unoptimized={frame.image.startsWith("http")} className={`ed-hero-photo ${frame.mobileImage&&frame.mobileImage!==frame.image?"ed-hero-desktop-photo":""}`}/>
      {frame.mobileImage&&frame.mobileImage!==frame.image&&<Image src={frame.mobileImage} alt="" fill
        sizes="100vw" unoptimized={frame.mobileImage.startsWith("http")} className="ed-hero-photo ed-hero-mobile-photo" quality={86}/>}
     </div>
    ))}
   </div>
   <span className="ed-hero-photo-stamp">THE ESSENTIAL<br/>COLLECTION</span>
   <div className="ed-carousel-control" aria-label="کنترل اسلایدهای کالکشن">
    <button type="button" onClick={()=>go(active-1)} aria-label="اسلاید قبلی" disabled={slides.length<2}><ChevronLeft size={18} strokeWidth={1.5}/></button>
    <div className="ed-carousel-dots" role="group" aria-label="انتخاب اسلاید">
     {slides.map((frame,i)=><button type="button" key={frame.id} onClick={()=>go(i)}
       className={i===active?"active":""} aria-current={i===active?"true":undefined}
       aria-label={`اسلاید ${i+1} از ${slides.length}`}/>)}
    </div>
    <button type="button" onClick={()=>go(active+1)} aria-label="اسلاید بعدی" disabled={slides.length<2}><ChevronRight size={18} strokeWidth={1.5}/></button>
    <button type="button" className="ed-carousel-play" aria-label={paused?"ادامه پخش خودکار":"توقف پخش خودکار"} aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={15} strokeWidth={1.5}/>:<Pause size={15} strokeWidth={1.5}/>}</button>
   </div>
   <span className="ed-hero-number">0{active+1} / 0{slides.length}</span>
  </div>
 </section>;
}
