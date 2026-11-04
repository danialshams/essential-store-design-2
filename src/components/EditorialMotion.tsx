"use client";
import {useEffect,useRef,type ReactNode} from "react";

/**
 * Editorial motion direction: restrained on-entry choreography, a single
 * scrubbed chapter and still-accessible content if GSAP fails to load.
 * Every animation is scoped to the homepage and fully reverted on unmount.
 */
export function EditorialMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=root.current;
  if(!element)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let alive=true;
  let teardown:()=>void=()=>{};
  void Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([module,plugin])=>{
   if(!alive||!root.current)return;
   const {gsap}=module,ScrollTrigger=plugin.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   const context=gsap.context(()=>{
    const $=gsap.utils.selector(element);
    const hero=gsap.timeline({defaults:{ease:"power3.out"}});
    // No image opacity fade: the photograph is revealed as one continuous print.
    hero.fromTo($(".ed-hero-image-mask"),{clipPath:"inset(0 0 0 100%)"},
       {clipPath:"inset(0 0 0 0)",duration:1.22,ease:"power3.inOut",clearProps:"clipPath"},0)
      .fromTo($(".ed-hero-photo"),{scale:1.055},{scale:1,duration:1.6,ease:"power2.out",clearProps:"transform"},0)
      .fromTo($("[data-hero-kicker]"),{y:12,autoAlpha:0},{y:0,autoAlpha:1,duration:.58,stagger:.09,clearProps:"all"},.22)
      .fromTo($("[data-hero-line]"),{yPercent:114},{yPercent:0,duration:.87,stagger:.13,ease:"power4.out",clearProps:"transform"},.35)
      .fromTo($("[data-hero-description]"),{y:12,autoAlpha:0},{y:0,autoAlpha:1,duration:.65,clearProps:"all"},.82)
      .fromTo($("[data-hero-action]"),{y:11,autoAlpha:0},{y:0,autoAlpha:1,duration:.58,stagger:.1,clearProps:"all"},.93);

    // Reveal content slightly before its center is reached; never wait for the
    // visitor to scroll the whole component into the viewport.
    $("[data-reveal]").forEach((item:Element)=>{
     const kind=item.getAttribute("data-reveal");
     const dx=kind==="right"?24:kind==="left"?-24:0;
     const dy=kind==="up"?18:0;
     gsap.fromTo(item,{x:dx,y:dy,autoAlpha:0},{
      x:0,y:0,autoAlpha:1,duration:.85,ease:"power3.out",clearProps:"all",
      scrollTrigger:{trigger:item,start:"top 88%",once:true,invalidateOnRefresh:true}
     });
    });
    $("[data-editorial-grid]").forEach((grid:Element)=>{
     const items=Array.from(grid.children);
     gsap.fromTo(items,{y:26,autoAlpha:0},{
      y:0,autoAlpha:1,duration:.88,stagger:.085,ease:"power3.out",clearProps:"all",
      scrollTrigger:{trigger:grid,start:"top 89%",once:true}
     });
    });
    // Product information comes with the product, not as unrelated motion.
    $("[data-stagger]").forEach((grid:Element)=>{
     if(grid.hasAttribute("data-editorial-grid"))return;
     const items=Array.from(grid.children);
     if(!items.length)return;
     gsap.fromTo(items,{y:17,autoAlpha:0},{
      y:0,autoAlpha:1,duration:.73,stagger:.075,ease:"power3.out",clearProps:"all",
      scrollTrigger:{trigger:grid,start:"top 89%",once:true}
     });
    });
    // A photograph unfolds rather than jumping to full brightness.
    $("[data-image-wipe]").forEach((media:Element)=>{
     if(media.classList.contains("ed-hero-image-mask"))return;
     gsap.fromTo(media,{clipPath:"inset(0 0 100% 0)"},{
      clipPath:"inset(0 0 0 0)",duration:1.04,ease:"power3.inOut",
      clearProps:"clipPath",scrollTrigger:{trigger:media,start:"top 91%",once:true}
     });
    });
    $("[data-campaign]").forEach((section:Element)=>{
     const copy=section.querySelector(".ed-lookbook-copy");
     const photo=section.querySelector(".ed-lookbook-photo");
     if(copy){
      gsap.fromTo(Array.from(copy.children).filter(x=>!x.classList.contains("ed-lookbook-ordinal")),
       {y:16,autoAlpha:0},{
       y:0,autoAlpha:1,duration:.78,stagger:.11,ease:"power3.out",clearProps:"all",
       scrollTrigger:{trigger:section,start:"top 78%",once:true}
      });
     }
     if(photo)gsap.fromTo(photo,{scale:1.06},{scale:1,duration:2.0,ease:"power2.out",clearProps:"transform",
      scrollTrigger:{trigger:section,start:"top 91%",once:true}});
    });
    const journal=$("[data-journal]")[0] as HTMLElement|undefined;
    if(journal){
     const cards=Array.from(journal.querySelectorAll(".ed-journal-card"));
     gsap.fromTo(cards,{y:18,autoAlpha:0},{y:0,autoAlpha:1,duration:.86,stagger:.14,ease:"power3.out",
      clearProps:"all",scrollTrigger:{trigger:journal,start:"top 86%",once:true}});
    }
    const mm=gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)",()=>{
     // Keep only one scrubbed section; expensive scroll-linked effects are not
     // stacked on every element of the homepage.
     $("[data-parallax]").forEach((item:Element)=>{
      gsap.fromTo(item,{yPercent:-1.5},{yPercent:1.5,ease:"none",
       scrollTrigger:{trigger:item.parentElement||item,start:"top bottom",end:"bottom top",scrub:.8}});
     });
     const chapter=$("[data-chapter]")[0] as HTMLElement|undefined;
     if(!chapter)return;
     const photos=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-frame]"));
     const copies=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-copy]"));
     const bar=chapter.querySelector<HTMLElement>("[data-chapter-progress]");
     if(photos.length!==2||copies.length!==2||!bar)return;
     gsap.set(photos[1],{opacity:1,clipPath:"inset(0 0 100% 0)"});
     gsap.set(copies[1],{autoAlpha:0,y:28});
     const story=gsap.timeline({defaults:{ease:"none"},scrollTrigger:{
      trigger:chapter,start:"top top",end:"+=110%",pin:true,scrub:.7,
      anticipatePin:1,invalidateOnRefresh:true
     }});
     story.to(photos[1],{clipPath:"inset(0 0 0 0)",duration:1},0)
      .to(copies[0],{autoAlpha:0,y:-20,duration:.43},.08)
      .to(copies[1],{autoAlpha:1,y:0,duration:.51},.42)
      .fromTo(bar,{scaleX:.06},{scaleX:1,duration:1},0);
    });
   },element);
   teardown=()=>context.revert();
   // The srcset and typography can change section heights after initial JS.
   const refresh=()=>{if(alive)ScrollTrigger.refresh()};
   window.addEventListener("load",refresh,{once:true});
   void document.fonts.ready.then(refresh).catch(()=>{});
   const original=teardown;
   teardown=()=>{window.removeEventListener("load",refresh);original()};
  }).catch(error=>console.warn("Editorial motion unavailable; content remains visible",error));
  return()=>{alive=false;teardown()};
 },[]);
 return <div ref={root} className="editorial-site">{children}</div>;
}
