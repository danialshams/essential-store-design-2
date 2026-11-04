"use client";
import {useLayoutEffect,useRef,type ReactNode} from "react";
import {usePathname} from "next/navigation";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

/** Site-wide luxury page reveals. Homepage has its own dedicated motion director. */
export function SiteMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 const pathname=usePathname();
 useLayoutEffect(()=>{
  const el=root.current;
  if(!el)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
   el.dataset.pageMotion="reduced";return;
  }
  gsap.registerPlugin(ScrollTrigger);
  // Avoid double-animating the editorial homepage, whose sections have their
  // own carefully choreographed GSAP timelines.
  if(el.querySelector(".ed-home")){el.dataset.pageMotion="homepage";return;}
  const context=gsap.context(()=>{
   const $=gsap.utils.selector(el);
   const first=(selector:string)=>$(selector)[0] as HTMLElement|undefined;
   const reveal=(node:Element|undefined,from:gsap.TweenVars,to:gsap.TweenVars)=>{
    if(!node)return;
    gsap.fromTo(node,from,{...to,scrollTrigger:{trigger:node,start:"top 92%",once:true}});
   };
   const breadcrumbs=first(".breadcrumbs");
   const title=first(".collection-heading, .page-title-group, .info-hero");
   // The typographic hierarchy arrives before the product imagery.
   if(breadcrumbs)gsap.fromTo(breadcrumbs,{y:10,autoAlpha:0},{y:0,autoAlpha:1,duration:.65,ease:"power2.out"});
   if(title){
    const kids=Array.from(title.children);
    gsap.fromTo(kids,{y:28,autoAlpha:0},{y:0,autoAlpha:1,duration:.9,stagger:.16,
      ease:"power3.out",delay:.12});
   }
   const pills=first(".category-pills");
   if(pills)gsap.fromTo(Array.from(pills.children),{y:12,autoAlpha:0},
     {y:0,autoAlpha:1,duration:.66,stagger:.07,delay:.28,ease:"power3.out"});
   const filter=first(".filter-sidebar");
   if(filter)reveal(filter,{autoAlpha:0,x:36},{autoAlpha:1,x:0,duration:1.12,ease:"power3.out"});
   const tools=first(".results-toolbar");
   if(tools)reveal(tools,{autoAlpha:0,y:17},{autoAlpha:1,y:0,duration:.78,ease:"power3.out"});

   // Products: display images like a printed lookbook, with a deliberate
   // photographic zoom-out rather than identical fade animations.
   $(".collection-grid, .related-section .product-grid, .favorites-grid").forEach((grid:Element)=>{
    const cards=Array.from(grid.children);
    if(!cards.length)return;
    const timeline=gsap.timeline({paused:true});
    cards.forEach((card,i)=>{
     timeline.fromTo(card,{autoAlpha:0,y:34},{autoAlpha:1,y:0,duration:.91,ease:"power3.out"},i*.09);
     const image=card.querySelector("img");
     if(image)timeline.fromTo(image,{scale:1.055},{scale:1,duration:1.18,ease:"power2.out",clearProps:"transform"},i*.09);
    });
    ScrollTrigger.create({trigger:grid,start:"top 94%",once:true,onEnter:()=>timeline.play()});
   });
   const productGallery=first(".product-gallery");
   const productInfo=first(".product-information");
   if(productGallery){
    const image=productGallery.querySelector(".product-main-photo");
    if(image)gsap.fromTo(image,{clipPath:"inset(0 100% 0 0)",scale:1.025},
     {clipPath:"inset(0 0 0 0)",scale:1,duration:1.4,ease:"power3.inOut",clearProps:"clipPath,transform"});
    const thumb=productGallery.querySelector(".gallery-thumbnails");
    if(thumb)gsap.fromTo(thumb,{y:16,autoAlpha:0},{y:0,autoAlpha:1,duration:.85,delay:.6,ease:"power3.out"});
   }
   if(productInfo){
    gsap.fromTo(Array.from(productInfo.children),{autoAlpha:0,y:22},
     {autoAlpha:1,y:0,duration:1,stagger:.14,ease:"power3.out",delay:.17});
   }
   $(".product-extra,.related-section").forEach((section:Element,i:number)=>{
    reveal(section,{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:1.05+i*.13,ease:"power3.out"});
   });
   // Checkout and account: clean section-by-section entrances, without
   // animation on input values, button state or forms once mounted.
   $(".cart-layout,.checkout-layout,.account-layout").forEach((parent:Element)=>{
    const blocks=Array.from(parent.children);
    gsap.fromTo(blocks,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:1.02,
      stagger:.15,ease:"power3.out",delay:.12});
   });
   $(".info-card,.demo-warning,.cart-items,.account-panel,.form-card").forEach((panel:Element)=>{
    if(panel.closest(".cart-layout,.checkout-layout,.account-layout"))return;
    reveal(panel,{autoAlpha:0,y:26},{autoAlpha:1,y:0,duration:1.05,ease:"power3.out"});
   });
   // Article index and article detail; do not retarget interactive content.
   $(".standard-page .product-grid").forEach((grid:Element)=>{
    if(grid.classList.contains("related-section"))return;
    gsap.fromTo(Array.from(grid.children),{autoAlpha:0,y:28},
      {autoAlpha:1,y:0,duration:.99,stagger:.14,ease:"power3.out",
       scrollTrigger:{trigger:grid,start:"top 93%",once:true}});
   });
  },el);
  el.dataset.pageMotion="ready";
  const refresh=()=>ScrollTrigger.refresh();
  void document.fonts?.ready.then(refresh).catch(()=>{});
  return()=>{context.revert()};
 },[pathname]);
 return <div ref={root} className="editorial-page-shell" data-page-motion="initial">{children}</div>;
}
