"use client";
import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from "react";
import {usePathname} from "next/navigation";
import {useShop} from "@/components/ShopProvider";
import gsap from "gsap";

export function SiteMotion({children}:{children:ReactNode}){
 const pathname=usePathname();
 const {store}=useShop();
 const root=useRef<HTMLDivElement>(null);
 const priorRoute=useRef<string|null>(null);
 const [intro,setIntro]=useState<"loading"|"leaving"|"done">("loading");

 useEffect(()=>{
  let active=true;
  let exitTimer:ReturnType<typeof setTimeout>|undefined;
  document.documentElement.dataset.introState="loading";
  const delay=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
  const first=document.querySelector<HTMLImageElement>(".ed-hero-slide.is-active .ed-hero-photo");
  const image=first?.decode?.().then(()=>undefined,()=>undefined)??Promise.resolve();
  const font=document.fonts?.ready?.then(()=>undefined,()=>undefined)??Promise.resolve();
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  void Promise.all([
   delay(reduced?90:440),
   Promise.race([Promise.all([image,font]),delay(1900)])
  ]).then(()=>{
   if(!active)return;
   document.documentElement.dataset.introState="ready";
   setIntro("leaving");
   exitTimer=setTimeout(()=>{if(active)setIntro("done")},reduced?100:480);
  });
  return()=>{active=false;if(exitTimer)clearTimeout(exitTimer)};
 },[]);

 useLayoutEffect(()=>{
  priorRoute.current=pathname;
  if(window.location.hash)return;
  const html=document.documentElement;
  const previous=html.style.scrollBehavior;
  html.style.scrollBehavior="auto";
  if("scrollRestoration" in history)history.scrollRestoration="manual";
  window.scrollTo(0,0);
  const raf=requestAnimationFrame(()=>{
   window.scrollTo(0,0);
   html.style.scrollBehavior=previous;
  });
  return()=>cancelAnimationFrame(raf);
 },[pathname]);

 useLayoutEffect(()=>{
  const el=root.current;
  if(!el)return;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){
   el.dataset.pageMotion="reduced";
   return;
  }
  if(el.querySelector(".ed-home")){
   el.dataset.pageMotion="homepage";
   return;
  }

  // Accounts and checkout are utilities, not fashion chapters.
  // No full-panel masks, horizontal slides, or animated form controls.
  const functional=Boolean(el.querySelector(".account-page,.checkout-page,.cart-layout"));
  const scope=gsap.context(()=>{
   if(functional){
    const pieces=Array.from(el.querySelectorAll<HTMLElement>(
     ".page-title-group,.demo-warning,.account-menu,.account-panel,.checkout-layout,.cart-layout"
    ));
    gsap.fromTo(pieces,{opacity:.92},{
     opacity:1,duration:.46,stagger:.045,ease:"power1.out",
     overwrite:"auto"
    });
    return;
   }
   const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
     if(!entry.isIntersecting)continue;
     const callback=callbacks.get(entry.target);
     callback?.();
    }
   },{rootMargin:"0px 0px -7% 0px",threshold:.075});
   const callbacks=new WeakMap<Element,()=>void>();
   const pending=new Set<gsap.core.Timeline>();

   const stage=(trigger:Element,targets:Element[],opts:{
    from?:gsap.TweenVars;duration?:number;stagger?:number;photo?:HTMLImageElement|null;
   }={})=>{
    if(!targets.length)return;
    const from={autoAlpha:0,y:opts.photo?0:14,...opts.from};
    gsap.set(targets,from);
    const timeline=gsap.timeline({paused:true});
    timeline.to(targets,{
     autoAlpha:1,y:0,x:0,scale:1,
     duration:opts.duration??.74,stagger:opts.stagger??.09,
     ease:"power2.out",clearProps:"transform,clipPath"
    });
    pending.add(timeline);
    let decoded=!opts.photo;
    let started=false;
    let loading=false;
    const inside=()=>{
     const b=trigger.getBoundingClientRect();
     return b.bottom>0&&b.top<innerHeight*.94;
    };
    const start=()=>{
     if(started||!decoded||!inside())return;
     started=true;observer.unobserve(trigger);timeline.play();
    };
    const enter=()=>{
     if(started)return;
     if(!loading&&opts.photo){
      loading=true;
      const deadline=new Promise<void>(resolve=>setTimeout(resolve,2500));
      const finished=opts.photo.decode?.().then(()=>undefined,()=>undefined)??Promise.resolve();
      void Promise.race([finished,deadline]).then(()=>{
       decoded=true;requestAnimationFrame(start);
      });
     }else start();
    };
    callbacks.set(trigger,enter);
    observer.observe(trigger);
    if(inside())enter();
   };
   const pick=(query:string)=>Array.from(el.querySelectorAll<HTMLElement>(query));

   for(const heading of pick(".collection-heading,.page-title-group,.info-hero")){
    stage(heading,Array.from(heading.children),{stagger:.1,duration:.72});
   }
   for(const node of pick(".category-pills,.results-toolbar,.filter-sidebar,.breadcrumbs")){
    stage(node,[node],{from:{autoAlpha:0,y:9},duration:.56});
   }
   for(const card of pick(
    ".collection-grid .premium-product-card,.related-section .premium-product-card,"+
    ".favorites-grid .premium-product-card,.standard-page>.product-grid .premium-product-card"
   )){
    const media=card.querySelector<HTMLElement>(".premium-product-media");
    const image=media?.querySelector<HTMLImageElement>("img");
    if(media)stage(media,[media],{
     from:{clipPath:"inset(0 0 100% 0)"},
     duration:.96,photo:image
    });
    const details=card.querySelector<HTMLElement>(".premium-product-info");
    if(details)stage(details,Array.from(details.children),{duration:.62,stagger:.065});
   }
   const detailPhoto=el.querySelector<HTMLImageElement>(".product-main-photo img");
   if(detailPhoto)stage(detailPhoto,[detailPhoto],{
    from:{opacity:.45,scale:1.025},
    duration:1.1,photo:detailPhoto
   });
   for(const node of pick(
    ".product-information>*,.gallery-thumbnails,.product-extra,.related-section .section-heading,"+
    ".info-card,.empty-cart,.success-card,.contact-items>div"
   )){
    stage(node,[node],{from:{autoAlpha:0,y:11},duration:.69});
   }
   return()=>{observer.disconnect();pending.forEach(t=>t.kill())};
  },el);
  el.dataset.pageMotion="ready";
  return()=>{scope.revert()};
 },[pathname]);

 return <>
  {intro!=="done"&&<div className={`maison-intro ${intro==="leaving"?"is-leaving":""}`}
    role="status" aria-label="در حال آماده‌سازی صفحه">
    <span className="maison-intro-word"
     lang={/[\u0600-\u06ff]/.test(store.settings.storeName)?"fa":"en"}>
     {store.settings.storeName||"ESSENTIAL"}
    </span>
   </div>}
  <div ref={root} className="editorial-page-shell" data-page-motion="initial">{children}</div>
 </>;
}
