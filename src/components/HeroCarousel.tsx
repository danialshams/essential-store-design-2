"use client";

import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowUpLeft} from "lucide-react";

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

export function titleLines(title:string){
 return title.replace(/\\n/g,"\n").split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
}

/**
 * A quiet, image-led carousel: no arrows, progress dots or pause chrome.
 * The action is deliberately OUTSIDE the changing slide subtree, so it
 * never remounts or plays an entrance animation on slide changes.
 */
export function HeroCarousel({slides}:Props){
 const [active,setActive]=useState(0);
 const [reduce,setReduce]=useState(false);
 const touchX=useRef<number|null>(null);
 useEffect(()=>{
  const mq=window.matchMedia("(prefers-reduced-motion: reduce)");
  const update=()=>setReduce(mq.matches);
  update();
  mq.addEventListener?.("change",update);
  return()=>mq.removeEventListener?.("change",update);
 },[]);
 useEffect(()=>{
  if(reduce||slides.length<2)return;
  const timer=window.setInterval(()=>{
   if(document.visibilityState==="visible")
    setActive(v=>(v+1)%slides.length);
  },INTERVAL);
  return()=>window.clearInterval(timer);
 },[reduce,slides.length]);
 const go=(number:number)=>setActive((number+slides.length)%slides.length);
 const slide=slides[active]??slides[0];
 if(!slide)return null;
 return <section className="ed-hero ed-hero-carousel ed-hero-minimal"
  aria-roledescription="carousel" aria-label="روایت تصویری مجموعه"
  aria-labelledby="ed-hero-title"
  onTouchStart={event=>{touchX.current=event.touches[0]?.clientX??null}}
  onTouchEnd={event=>{
   if(touchX.current==null)return;
   const distance=event.changedTouches[0].clientX-touchX.current;
   if(Math.abs(distance)>65)go(active+(distance>0?1:-1));
   touchX.current=null;
  }}
  onKeyDownCapture={event=>{
   if(event.key==="ArrowLeft"){event.preventDefault();go(active+1)}
   if(event.key==="ArrowRight"){event.preventDefault();go(active-1)}
  }}>
   <div className="ed-hero-visual" data-hero-image>
    <div className="ed-hero-media-shell" data-hero-media>
     {slides.map((frame,i)=>(
      <div key={frame.id} className={`ed-hero-slide ${i===active?"is-active":""}`}
       aria-hidden={i!==active}>
       <Image src={frame.image} alt={i===active?frame.alt:""} fill
        priority={i===0} loading={i===0?"eager":undefined}
        sizes="100vw" quality={86} unoptimized={frame.image.startsWith("http")}
        className={`ed-hero-photo ${frame.mobileImage&&frame.mobileImage!==frame.image?"ed-hero-desktop-photo":""}`}/>
       {frame.mobileImage&&frame.mobileImage!==frame.image&&
        <Image src={frame.mobileImage} alt="" fill sizes="100vw"
         priority={i===0} loading={i===0?"eager":undefined}
         quality={86} unoptimized={frame.mobileImage.startsWith("http")}
         className="ed-hero-photo ed-hero-mobile-photo"/>}
      </div>
     ))}
    </div>
    <div className="ed-hero-image-caption">
     <h1 id="ed-hero-title" aria-live="off">{titleLines(slide.title).map((line,i)=>
      <span key={i}>{line}</span>)}</h1>
    </div>
   </div>
   <div className="ed-hero-content" aria-label="توضیحات روایت">
    <p className="ed-hero-description" aria-live="off">{slide.description}</p>
    <Link className="ed-dark-button ed-hero-stable-action" href={slide.ctaHref}>
     کشف داستان <ArrowUpLeft size={19} strokeWidth={1.4}/>
    </Link>
    <span className="ed-hero-progress-count" dir="ltr" aria-label={`اسلاید ${active+1} از ${slides.length}`}>
     {String(active+1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}
    </span>
   </div>
 </section>;
}
