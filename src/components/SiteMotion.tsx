"use client";
import {useLayoutEffect,useRef,type ReactNode} from "react";
import {usePathname} from "next/navigation";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

/** Keep all client route entries anchored at the top, not stale scroll/pin coordinates. */
export function SiteMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 const previousPath=useRef<string|null>(null);
 const pathname=usePathname();

 useLayoutEffect(()=>{
  const previous=previousPath.current;
  previousPath.current=pathname;
  if(previous===null&&window.location.hash)return; // honor intentional deep links
  const html=document.documentElement;
  const prior=html.style.scrollBehavior;
  html.style.scrollBehavior="auto";
  if("scrollRestoration" in window.history)window.history.scrollRestoration="manual";
  window.scrollTo(0,0);
  const frame=requestAnimationFrame(()=>{
   window.scrollTo(0,0);
   html.style.scrollBehavior=prior;
  });
  return()=>cancelAnimationFrame(frame);
 },[pathname]);

 useLayoutEffect(()=>{
  const el=root.current;
  if(!el)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
   el.dataset.pageMotion="reduced";return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if(el.querySelector(".ed-home")){
   el.dataset.pageMotion="homepage";
   return;
  }
  let alive=true;
  const context=gsap.context(()=>{
   const $=gsap.utils.selector(el);
   const inView=(node:Element,tl:gsap.core.Timeline,start="top 78%")=>
    ScrollTrigger.create({trigger:node,start,once:true,invalidateOnRefresh:true,
      onEnter:()=>tl.play(),onEnterBack:()=>tl.play()});
   const show=(target:Element,items:Element[],from:gsap.TweenVars={},delay=0,start="top 78%")=>{
    if(!items.length)return;
    const tl=gsap.timeline({paused:true});
    tl.fromTo(items,{autoAlpha:0,y:23,...from},{
     autoAlpha:1,x:0,y:0,scale:1,duration:1.03,stagger:.13,
     ease:"power3.out",clearProps:"transform"
    },delay);
    inView(target,tl,start);
   };

   // Introductory breadcrumb and heading are above the fold, so they should
   // enter immediately after route change, never wait for the second scroll.
   const breadcrumbs=$(".breadcrumbs")[0] as Element|undefined;
   if(breadcrumbs)gsap.fromTo(breadcrumbs,{y:11,autoAlpha:0},{
    y:0,autoAlpha:1,duration:.68,ease:"power3.out"
   });
   const heading=$(".collection-heading,.page-title-group,.info-hero")[0] as Element|undefined;
   if(heading)show(heading,Array.from(heading.children),{y:30},0,"top 92%");

   // Navigation chips, filter/sidebar and search tools enter independently.
   const pills=$(".category-pills")[0] as Element|undefined;
   if(pills)show(pills,Array.from(pills.children),{x:14,y:0},0,"top 81%");
   const sidebar=$(".filter-sidebar")[0] as Element|undefined;
   if(sidebar)show(sidebar,[sidebar],{x:32,y:0},0,"top 78%");
   const results=$(".results-toolbar")[0] as Element|undefined;
   if(results)show(results,Array.from(results.children),{y:18},0,"top 77%");

   // Category and editorial product cards: each photograph triggers on its
   // own visibility, including rows below the fold and narrow mobile grids.
   const grids=$(".collection-grid,.related-section .product-grid,.favorites-grid,.standard-page>.product-grid");
   const seen=new Set<Element>();
   grids.forEach((grid:Element)=>{
    Array.from(grid.children).forEach((card:Element,index:number)=>{
     if(seen.has(card))return;
     seen.add(card);
     const photo=card.querySelector("img");
     const info=card.querySelector(".premium-product-info,.product-card-body");
     const tl=gsap.timeline({paused:true});
     tl.fromTo(card,{autoAlpha:0,y:30},{
      autoAlpha:1,y:0,duration:1.05,ease:"power3.out"
     },0);
     if(photo)tl.fromTo(photo,{scale:1.095,scaleX:1.045},{
      scale:1,scaleX:1,duration:1.52,ease:"power2.out",clearProps:"transform"
     },0);
     if(info)tl.fromTo(Array.from(info.children),{autoAlpha:0,y:14},{
      autoAlpha:1,y:0,stagger:.08,duration:.8,ease:"power3.out"
     },.34);
     inView(card,tl,"top 80%");
    });
   });

   // Detail page: never clip the whole image frame (it must always remain
   // functional). Instead unfold the photo itself with a gentle zoom-out.
   const photo=$(".product-main-photo img")[0] as Element|undefined;
   if(photo){
    const tl=gsap.timeline({paused:true});
    tl.fromTo(photo,{scale:1.075,filter:"brightness(1.06)"},{
     scale:1,filter:"brightness(1)",duration:1.65,ease:"power2.out",
     clearProps:"transform,filter"
    },0);
    inView(photo,tl,"top 88%");
   }
   const thumb=$(".gallery-thumbnails")[0] as Element|undefined;
   if(thumb)show(thumb,Array.from(thumb.children),{autoAlpha:0,y:14},0,"top 81%");
   const info=$(".product-information")[0] as Element|undefined;
   if(info){
    Array.from(info.children).forEach((part:Element)=>{
     const tl=gsap.timeline({paused:true});
     tl.fromTo(part,{autoAlpha:0,y:22},{autoAlpha:1,y:0,duration:1.05,ease:"power3.out"});
     inView(part,tl,"top 82%");
    });
   }

   // Product detail tabs and related-section titles trigger when visible.
   $ (".product-extra,.related-section .section-heading").forEach((section:Element)=>{
    show(section,Array.from(section.children),{y:20},0,"top 79%");
   });

   // Cart, checkout, account: independent layout blocks. Forms remain fully
   // interactive and never animate the user's input as the value changes.
   $(".cart-layout,.checkout-layout,.account-layout").forEach((parent:Element)=>{
    Array.from(parent.children).forEach((block:Element,i:number)=>{
     show(block,[block],{y:i%2?35:22,x:i%2?-16:16},0,"top 79%");
    });
   });
   $(".cart-line,.form-card,.checkout-summary-item,.shipping-options>label,.demo-order-card").forEach((part:Element)=>{
    if(part.closest(".cart-layout,.checkout-layout,.account-layout")){
     // Parent covers entry; nested items are interactive, avoid double
     // animations that would reorder or obscure form fields.
     return;
    }
    show(part,[part],{y:18},0,"top 80%");
   });

   // Pages with prose, shipping terms, privacy, articles and empty states:
   // each meaningful block has its own paper-reveal as it enters view.
   $(".info-card,.demo-warning,.account-panel,.empty-cart,.success-card").forEach((section:Element)=>{
    if(section.closest(".cart-layout,.checkout-layout,.account-layout"))return;
    const content=Array.from(section.children).filter(child=>
     !child.matches("button,input,select,textarea")
    );
    show(section,content.length?content:[section],{y:21},0,"top 79%");
   });
   $(".contact-items>div,.success-actions>a,.success-actions>button").forEach((part:Element,i:number)=>{
    show(part,[part],{y:15,x:i%2?-12:12},0,"top 81%");
   });
  },el);
  el.dataset.pageMotion="ready";
  const refresh=()=>{if(alive)ScrollTrigger.refresh()};
  void document.fonts?.ready.then(refresh).catch(()=>{});
  window.addEventListener("load",refresh,{once:true});
  return()=>{
   alive=false;
   window.removeEventListener("load",refresh);
   context.revert();
  };
 },[pathname]);

 return <div ref={root} className="editorial-page-shell" data-page-motion="initial">{children}</div>;
}
