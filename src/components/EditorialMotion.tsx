"use client";
import {useLayoutEffect,useRef,type ReactNode} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

/**
 * Single scoped motion director. GSAP is bundled with this client component:
 * no late dynamic import, no animation-dependent content hidden before hydrate.
 * Each editorial chapter has its own visual language. No global scroll hijack.
 */
export function EditorialMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const element=root.current;
  if(!element)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced){element.dataset.motionStatus="reduced";return;}
  gsap.registerPlugin(ScrollTrigger);
  const context=gsap.context(()=>{
   const $=gsap.utils.selector(element);
   const t=(node:Element,vars:gsap.TweenVars)=>ScrollTrigger.create({trigger:node,start:"top 92%",once:true,
    onEnter:()=>gsap.to(node,vars)});
   // Headings are large editorial type, each revealed through its own masked line.
   $("[data-scene] .ed-section-heading").forEach((heading:Element)=>{
    const eyebrow=heading.querySelector(".premium-eyebrow");
    const title=heading.querySelector("h2");
    const link=heading.querySelector(".ed-inline-link");
    const tl=gsap.timeline({paused:true});
    if(eyebrow)tl.fromTo(eyebrow,{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.78,ease:"power3.out"},0);
    if(title)tl.fromTo(title,{y:42,autoAlpha:0,clipPath:"inset(0 0 100% 0)"},
      {y:0,autoAlpha:1,clipPath:"inset(0 0 0 0)",duration:1.08,ease:"power3.out",clearProps:"clipPath"},.1);
    if(link)tl.fromTo(link,{autoAlpha:0,x:-16},{autoAlpha:1,x:0,duration:.8,ease:"power2.out"},.58);
    ScrollTrigger.create({trigger:heading,start:"top 92%",once:true,onEnter:()=>tl.play()});
   });

   // I. Category mosaic: four individual vertical curtains with depth.
   const categories=$('[data-scene="categories"] [data-editorial-grid]')[0] as HTMLElement|undefined;
   if(categories){
    const cards=Array.from(categories.children) as HTMLElement[];
    const tl=gsap.timeline({paused:true});
    cards.forEach((card,i)=>{
     tl.fromTo(card,{autoAlpha:1,clipPath:i%2?"inset(0 0 100% 0)":"inset(100% 0 0 0)",y:26},
      {clipPath:"inset(0 0 0 0)",y:0,duration:1.1,ease:"power3.inOut",clearProps:"clipPath"},i*.17);
     const photo=card.querySelector(".ed-category-photo");
     if(photo)tl.fromTo(photo,{scale:1.15},{scale:1,duration:1.5,ease:"power2.out",clearProps:"transform"},i*.17);
    });
    ScrollTrigger.create({trigger:categories,start:"top 92%",once:true,onEnter:()=>tl.play()});
   }
   // II. Product shelves: staggered photograph first, typography second.
   $('[data-scene="products"] [data-stagger],.ed-next-products [data-stagger]').forEach((grid:Element)=>{
    const cards=Array.from(grid.children);
    const tl=gsap.timeline({paused:true});
    cards.forEach((card,i)=>{
     const at=i*.12;
     tl.fromTo(card,{autoAlpha:0,y:36},{autoAlpha:1,y:0,duration:.93,ease:"power3.out"},at);
     const media=card.querySelector(".premium-product-photo");
     if(media)tl.fromTo(media,{scale:1.065},{scale:1,duration:1.18,ease:"power2.out",clearProps:"transform"},at+.05);
    });
    ScrollTrigger.create({trigger:grid,start:"top 91%",once:true,onEnter:()=>tl.play()});
   });
   // III. Full-bleed fashion campaign: horizontal cinematic image reveal.
   const campaign=$('[data-scene="campaign"]')[0] as HTMLElement|undefined;
   if(campaign){
    const media=campaign.querySelector(".ed-lookbook-media");
    const photo=campaign.querySelector(".ed-lookbook-photo");
    const text=campaign.querySelector(".ed-lookbook-copy");
    const timeline=gsap.timeline({paused:true});
    if(media)timeline.fromTo(media,{clipPath:"inset(0 18% 0 0)"},{clipPath:"inset(0 0 0 0)",
       duration:1.55,ease:"power3.inOut",clearProps:"clipPath"},0);
    if(photo)timeline.fromTo(photo,{scale:1.12},{scale:1,duration:2.3,ease:"power2.out",clearProps:"transform"},0);
    if(text)timeline.fromTo(Array.from(text.children).filter(x=>!x.classList.contains("ed-lookbook-ordinal")),
      {autoAlpha:0,x:28},{autoAlpha:1,x:0,duration:.96,stagger:.18,ease:"power3.out"},.35);
    ScrollTrigger.create({trigger:campaign,start:"top 86%",once:true,onEnter:()=>timeline.play()});
   }
   // IV. Brand story: portrait first, detailed inset follows, typography
   // travels in opposite direction. No double-tweens from generic handlers.
   const story=$('[data-scene="story"]')[0] as HTMLElement|undefined;
   if(story){
    const visual=story.querySelector(".ed-story-visual");
    const inset=story.querySelector(".ed-story-inset");
    const photo=visual?.querySelector("img");
    const copy=story.querySelector(".ed-story-copy");
    const timeline=gsap.timeline({paused:true});
    if(visual)timeline.fromTo(visual,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0 0 0)",
       duration:1.28,ease:"power3.inOut",clearProps:"clipPath"},0);
    if(photo)timeline.fromTo(photo,{scale:1.1},{scale:1,duration:1.9,ease:"power2.out",clearProps:"transform"},0);
    if(inset)timeline.fromTo(inset,{autoAlpha:0,y:62,scale:.95},{autoAlpha:1,y:0,scale:1,
       duration:1.15,ease:"power3.out",clearProps:"transform"},.58);
    if(copy)timeline.fromTo(Array.from(copy.children),{autoAlpha:0,y:26},
     {autoAlpha:1,y:0,duration:.86,stagger:.14,ease:"power3.out"},.22);
    ScrollTrigger.create({trigger:story,start:"top 86%",once:true,onEnter:()=>timeline.play()});
   }
   // V. Editorial chapters on phone: one photo at a time, not a broken pin.
   $("[data-image-wipe]").forEach((node:Element)=>{
    if(node.closest('[data-scene="story"],[data-scene="campaign"]'))return;
    gsap.fromTo(node,{clipPath:"inset(0 0 100% 0)"},{clipPath:"inset(0 0 0 0)",duration:1.3,
      ease:"power3.inOut",clearProps:"clipPath",scrollTrigger:{trigger:node,start:"top 91%",once:true}});
   });
   // VI. Merchant-inserted stories: honor each section's motion style.
   $(".ed-admin-story").forEach((story:Element,i:number)=>{
    const kind=story.getAttribute("data-motion")||"mask";
    const photo=story.querySelector(".ed-admin-story-picture");
    const copy=story.querySelector(".ed-admin-story-copy");
    const timeline=gsap.timeline({paused:true});
    if(photo){
      if(kind==="mask")timeline.fromTo(photo,{clipPath:"inset(0 0 100% 0)"},{clipPath:"inset(0 0 0 0)",
        duration:1.2,ease:"power3.inOut",clearProps:"clipPath"},0);
      else timeline.fromTo(photo,{autoAlpha:0,x:kind==="slide"?(i%2?70:-70):0,scale:kind==="fade"?1.04:1},
       {autoAlpha:1,x:0,scale:1,duration:1.2,ease:"power3.out",clearProps:"transform"},0);
    }
    if(copy)timeline.fromTo(Array.from(copy.children),{autoAlpha:0,y:25},
      {autoAlpha:1,y:0,duration:.84,stagger:.13,ease:"power3.out"},.25);
    ScrollTrigger.create({trigger:story,start:"top 90%",once:true,onEnter:()=>timeline.play()});
   });
   // VII. Journal: opposite-direction photographs as magazine columns.
   const journal=$('[data-scene="journal"]')[0] as HTMLElement|undefined;
   if(journal){
    const cards=Array.from(journal.querySelectorAll(".ed-journal-card"));
    const tl=gsap.timeline({paused:true});
    cards.forEach((card,i)=>{
      tl.fromTo(card,{autoAlpha:0,x:i%2?-64:64,y:i*22},
       {autoAlpha:1,x:0,y:0,duration:1.25,ease:"power3.out"},i*.25);
      const img=card.querySelector("img");
      if(img)tl.fromTo(img,{scale:1.08},{scale:1,duration:1.9,clearProps:"transform",ease:"power2.out"},i*.25);
    });
    ScrollTrigger.create({trigger:journal,start:"top 85%",once:true,onEnter:()=>tl.play()});
   }
   // Generic supporting sections only, each different from the cinematic ones.
   $("[data-reveal]").forEach((node:Element)=>{
    if(node.closest("[data-scene],.ed-admin-story,[data-journal]"))return;
    const direction=node.getAttribute("data-reveal");
    const x=direction==="left"?-32:direction==="right"?32:0;
    const y=direction==="up"?30:0;
    gsap.fromTo(node,{autoAlpha:0,x,y},{autoAlpha:1,x:0,y:0,duration:1,
      ease:"power3.out",scrollTrigger:{trigger:node,start:"top 93%",once:true}});
   });
   // Desktop pinned two-act narrative: only scroll-scrubbed chapter.
   const mm=gsap.matchMedia();
   mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)",()=>{
    const chapter=$("[data-chapter]")[0] as HTMLElement|undefined;
    if(!chapter)return;
    const photos=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-frame]"));
    const copies=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-copy]"));
    const bar=chapter.querySelector<HTMLElement>("[data-chapter-progress]");
    if(photos.length!==2||copies.length!==2||!bar)return;
    gsap.set(photos[1],{opacity:1,clipPath:"inset(0 0 100% 0)"});
    gsap.set(copies[1],{autoAlpha:0,y:26});
    gsap.timeline({defaults:{ease:"none"},scrollTrigger:{trigger:chapter,start:"top top",end:"+=125%",
      pin:true,scrub:.8,anticipatePin:1,invalidateOnRefresh:true}})
      .to(photos[1],{clipPath:"inset(0 0 0 0)",duration:1},0)
      .to(copies[0],{autoAlpha:0,y:-34,duration:.43},.09)
      .to(copies[1],{autoAlpha:1,y:0,duration:.57},.42)
      .fromTo(bar,{scaleX:.08},{scaleX:1,duration:1},0);
   });
  },element);
  element.dataset.motionStatus="ready";
  const refresh=()=>ScrollTrigger.refresh();
  // Refresh after fonts/images have their actual heights and after viewport resize.
  document.fonts?.ready.then(refresh).catch(()=>{});
  window.addEventListener("load",refresh,{once:true});
  const onResize=()=>ScrollTrigger.refresh();
  window.addEventListener("resize",onResize,{passive:true});
  return()=>{
   window.removeEventListener("load",refresh);
   window.removeEventListener("resize",onResize);
   context.revert();
  };
 },[]);
 return <div ref={root} className="editorial-site" data-motion-status="initial">{children}</div>;
}
