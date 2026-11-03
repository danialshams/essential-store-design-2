"use client";
import {useEffect,useRef,type ReactNode} from "react";

/** Cinematic and progressively enhanced: no GSAP means all essential content remains visible. */
export function EditorialMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=root.current;
  if(!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let alive=true;
  let cleanup:(()=>void)|undefined;
  void Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([module,plugin])=>{
   if(!alive || !root.current)return;
   const gsap=module.gsap,ScrollTrigger=plugin.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   const context=gsap.context(()=>{
    const $=gsap.utils.selector(element);
    const intro=gsap.timeline({defaults:{ease:"power3.out"}});
    intro.fromTo($("[data-hero-image]"),{opacity:.76},{opacity:1,duration:.7})
      .fromTo($(".ed-hero-image-mask"),{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:1.35,ease:"expo.inOut",clearProps:"clipPath"},0)
      .fromTo($(".ed-hero-photo"),{scale:1.075},{scale:1,duration:1.7,ease:"power2.out",clearProps:"transform"},0)
      .fromTo($("[data-hero-kicker]"),{opacity:0,y:17},{opacity:1,y:0,duration:.65,stagger:.12,clearProps:"all"},.38)
      .fromTo($("[data-hero-line]"),{yPercent:115,opacity:.8},{yPercent:0,opacity:1,duration:1.05,stagger:.15,ease:"power4.out",clearProps:"all"},.45)
      .fromTo($("[data-hero-description]"),{opacity:0,y:16},{opacity:1,y:0,duration:.75,clearProps:"all"},.94)
      .fromTo($("[data-hero-action]"),{opacity:0,y:12},{opacity:1,y:0,duration:.66,stagger:.09,clearProps:"all"},1.13)
      .fromTo($("[data-hero-detail]"),{opacity:0,y:42,scale:.95},{opacity:1,y:0,scale:1,duration:.95,ease:"expo.out",clearProps:"all"},.9);

    $("[data-reveal]").forEach((section:Element)=>{
     const type=section.getAttribute("data-reveal");
     const direction=type==="right"?26:type==="left"?-26:0;
     gsap.fromTo(section,{opacity:0,x:direction,y:type==="up"?24:0},{
      opacity:1,x:0,y:0,duration:.95,ease:"power3.out",clearProps:"all",
      scrollTrigger:{trigger:section,start:"top 91%",once:true}
     });
    });
    $("[data-stagger]").forEach((section:Element)=>{
     const cards=Array.from(section.children);
     if(!cards.length)return;
     gsap.fromTo(cards,{opacity:0,y:24},{opacity:1,y:0,duration:.84,stagger:.095,ease:"power3.out",clearProps:"all",
      scrollTrigger:{trigger:section,start:"top 91%",once:true}});
    });
    $("[data-image-wipe]").forEach((media:Element)=>{
     if(media.classList.contains("ed-hero-image-mask"))return;
     if(media.closest('[data-motion="fade"]'))return;
     gsap.fromTo(media,{clipPath:"inset(0 0 100% 0)"},{clipPath:"inset(0 0 0% 0)",duration:1.12,ease:"power3.inOut",clearProps:"clipPath",
      scrollTrigger:{trigger:media,start:"top 93%",once:true}});
    });

    const mm=gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)",()=>{
     $("[data-parallax]").forEach((item:Element)=>{
      gsap.fromTo(item,{yPercent:-2.5},{yPercent:2.5,ease:"none",scrollTrigger:{trigger:item.parentElement||item,start:"top bottom",end:"bottom top",scrub:.8}});
     });
     const chapter=$("[data-chapter]")[0] as HTMLElement|undefined;
     if(!chapter)return;
     const photos=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-frame]"));
     const copies=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-copy]"));
     const bar=chapter.querySelector<HTMLElement>("[data-chapter-progress]");
     if(photos.length!==2||copies.length!==2||!bar)return;
     gsap.set([photos[1],copies[1]],{opacity:0});
     const story=gsap.timeline({defaults:{ease:"none"},scrollTrigger:{trigger:chapter,start:"top top",end:"+=115%",pin:true,scrub:.65,anticipatePin:1,invalidateOnRefresh:true}});
     story.to(photos[0],{opacity:0,duration:1},0)
      .to(photos[1],{opacity:1,duration:1},0)
      .to(copies[0],{opacity:0,y:-16,duration:.65},.05)
      .fromTo(copies[1],{opacity:0,y:17},{opacity:1,y:0,duration:.72},.3)
      .fromTo(bar,{scaleX:.08},{scaleX:1,duration:1},0);
    });
   },element);
   cleanup=()=>context.revert();
  }).catch(error=>console.warn("Cinematic motion unavailable; storefront remains accessible",error));
  return()=>{alive=false;cleanup?.()};
 },[]);
 return <div ref={root} className="editorial-site">{children}</div>;
}
