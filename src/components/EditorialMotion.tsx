"use client";
import {useLayoutEffect,useRef,type ReactNode} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

/**
 * Every photo, heading, caption and action has an independent intersection
 * trigger. Nothing is allowed to animate just because an ancestor is near
 * the viewport. Image reveals start only after decoding.
 */
export function EditorialMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const el=root.current;
  if(!el)return;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){
   el.dataset.motionStatus="reduced";
   return;
  }
  gsap.registerPlugin(ScrollTrigger);
  let active=true;
  let curtainFinished=document.documentElement.dataset.introState==="complete";
  const callbacks=new WeakMap<Element,()=>void>();
  const warmCallbacks=new WeakMap<Element,()=>void>();
  // Preload near-future images far enough ahead of the visible viewport,
  // but never START their GSAP entrance until the element is actually seen.
  const warmObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    warmCallbacks.get(entry.target)?.();
    warmObserver.unobserve(entry.target);
   }
  },{rootMargin:window.innerWidth<=760?"0px 0px 900px 0px":"0px 0px 640px 0px",threshold:0});
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting)callbacks.get(entry.target)?.();
   }
  },{root:null,rootMargin:"0px 0px -6% 0px",threshold:0});
  const seen=new Set<Element>();
  const animations:gsap.core.Timeline[]=[];
  const registered:Array<{node:Element;enter:()=>void;settle:()=>void}>=[];
  const visible=(node:Element)=>{
   const r=node.getBoundingClientRect();
   return r.height>0&&r.width>0&&r.bottom>0&&r.top<innerHeight*.94;
  };
  const near=(node:Element)=>{
   const r=node.getBoundingClientRect();
   return r.bottom>-(innerHeight*.1)&&r.top<innerHeight+(innerWidth<=760?900:640);
  };
  const register=(trigger:Element,tl:gsap.core.Timeline,image?:HTMLImageElement|null)=>{
   animations.push(tl);
   let loaded=!image;
   let preparing=false;
   let started=false;
   const prepare=()=>{
    if(loaded||preparing||!active)return;
    preparing=true;
    const photo=image;
    if(!photo){loaded=true;return}
    if(photo.loading==="lazy")photo.loading="eager";
    const decoded=new Promise<void>(resolve=>{
     const finish=()=>{
      if(photo.naturalWidth&&typeof photo.decode==="function")
       void photo.decode().then(()=>resolve(),()=>resolve());
      else resolve();
     };
     if(photo.complete)finish();
     else{
      photo.addEventListener("load",finish,{once:true});
      photo.addEventListener("error",()=>resolve(),{once:true});
     }
    });
    const timeout=new Promise<void>(resolve=>setTimeout(resolve,6500));
    void Promise.race([decoded,timeout]).then(()=>{
     if(!active)return;
     loaded=true;
     requestAnimationFrame(start);
    });
   };
   const settle=()=>{
    if(started||!active)return;
    started=true;
    trigger.setAttribute("data-reveal-state","passed");
    observer.unobserve(trigger);
    warmObserver.unobserve(trigger);
    tl.progress(1).pause();
   };
   const start=()=>{
    if(!active||started||!loaded||!curtainFinished||!visible(trigger))return;
    started=true;
    trigger.setAttribute("data-reveal-state","playing");
    observer.unobserve(trigger);
    tl.play();
   };
   const enter=()=>{
    if(!active||started)return;
    prepare();
    start();
   };
   trigger.setAttribute("data-reveal-state","waiting");
   warmCallbacks.set(trigger,prepare);
   callbacks.set(trigger,enter);
   registered.push({node:trigger,enter,settle});
   warmObserver.observe(trigger);
   observer.observe(trigger);
   if(near(trigger))prepare();
   if(visible(trigger))enter();
  };

  const context=gsap.context(()=>{
   const $=gsap.utils.selector(el);
   const text=(trigger:Element,node:Element,order=0)=>{
    if(seen.has(node))return;
    seen.add(node);
    gsap.set(node,{autoAlpha:0,y:16});
    const tl=gsap.timeline({paused:true});
    tl.to(node,{autoAlpha:1,y:0,duration:.69,delay:order*.055,
     ease:"power2.out",clearProps:"transform"});
    register(trigger,tl);
   };
   const action=(trigger:Element,node:Element,order=0)=>{
    if(seen.has(node))return;
    seen.add(node);
    // A button should have a short, restrained reveal, not the text's slide.
    gsap.set(node,{autoAlpha:0,scale:.975,y:0});
    const tl=gsap.timeline({paused:true});
    tl.to(node,{autoAlpha:1,scale:1,duration:.45,delay:order*.07,
     ease:"power2.out",clearProps:"transform"});
    register(trigger,tl);
   };
   const image=(frame:Element,side:"left"|"right"|"up"="up")=>{
    if(seen.has(frame))return;
    seen.add(frame);
    const img=frame.querySelector("img") as HTMLImageElement|null;
    const start=side==="left"?"inset(0 100% 0 0)":
     side==="right"?"inset(0 0 0 100%)":"inset(0 0 100% 0)";
    gsap.set(frame,{clipPath:start});
    if(img)gsap.set(img,{scale:1.035});
    const tl=gsap.timeline({paused:true});
    tl.to(frame,{clipPath:"inset(0 0 0 0)",duration:.98,
     ease:"power3.inOut",clearProps:"clipPath"},0);
    if(img)tl.to(img,{scale:1,duration:1.27,ease:"power2.out",
     clearProps:"transform"},0);
    register(frame,tl,img);
   };
   const revealChildren=(parent:Element,skip=".ed-inline-link,.ed-dark-button,.ed-light-button")=>{
    Array.from(parent.children).forEach((node,i)=>{
     const isButton=node.matches("a,button")||node.matches(skip);
     (isButton?action:text)(node,node,i);
    });
   };

   // Headings: label, title, optional description and action animate
   // independently. No parent-wide opacity that could flash everything.
   $(".ed-home .ed-section-heading").forEach((heading:Element)=>{
    const eyebrow=heading.querySelector(".premium-eyebrow");
    const title=heading.querySelector("h2");
    const description=heading.querySelector("p");
    const link=heading.querySelector(".ed-inline-link");
    if(eyebrow)text(eyebrow,eyebrow,0);
    if(title)text(title,title,1);
    if(description)text(description,description,2);
    if(link)action(link,link,1);
   });

   // Explore Edition: each actual picture unveils while it is on-screen.
   $("[data-editorial-grid] .ed-category-tile").forEach((card:Element,i:number)=>{
    image(card,i%2?"right":"up");
    const caption=card.querySelector(".ed-category-caption");
    if(caption)Array.from(caption.children).forEach((child,j)=>
     text(card,child,5+j));
    const arrow=card.querySelector(".ed-category-arrow");
    if(arrow)action(card,arrow,6);
   });

   // Selected pieces: the photograph is a proper media wipe, with a
   // shorter and separately timed data reveal underneath.
   $(".ed-products-section .premium-product-card").forEach((card:Element,i:number)=>{
    const media=card.querySelector(".premium-product-media");
    const info=card.querySelector(".premium-product-info");
    if(media)image(media,i%2?"left":"up");
    if(info)Array.from(info.children).forEach((child,j)=>
     (child.matches("a,button")?action:text)(child,child,j));
   });

   const campaign=$('[data-scene="campaign"]')[0] as Element|undefined;
   if(campaign){
    const photo=campaign.querySelector(".ed-lookbook-media");
    const copy=campaign.querySelector(".ed-lookbook-copy");
    if(photo)image(photo,"left");
    if(copy)revealChildren(copy);
   }

   const story=$('[data-scene="story"]')[0] as Element|undefined;
   if(story){
    const photo=story.querySelector(".ed-story-visual");
    const detail=story.querySelector(".ed-story-inset");
    const copy=story.querySelector(".ed-story-copy");
    if(photo)image(photo,"right");
    if(detail)image(detail,"up");
    if(copy)revealChildren(copy);
   }

   $(".ed-mobile-chapter").forEach((chapter:Element,i:number)=>{
    const photo=chapter.querySelector(".ed-mobile-chapter-photo");
    const copy=chapter.querySelector(".ed-mobile-chapter-copy");
    if(photo)image(photo,i%2?"right":"left");
    if(copy)revealChildren(copy);
   });

   $(".ed-admin-story").forEach((section:Element,i:number)=>{
    const photo=section.querySelector(".ed-admin-story-picture");
    const detail=section.querySelector(".ed-admin-story-detail");
    const copy=section.querySelector(".ed-admin-story-copy");
    if(photo)image(photo,i%2?"left":"right");
    if(detail)image(detail,"up");
    if(copy)revealChildren(copy);
   });

   $(".ed-secondary-banner").forEach((banner:Element,i:number)=>{
    const photo=banner.querySelector(".ed-secondary-banner-image");
    const copy=banner.firstElementChild;
    if(photo)image(photo,i%2?"left":"right");
    if(copy)revealChildren(copy);
   });

   $(".ed-journal-card").forEach((card:Element,i:number)=>{
    const photo=card.querySelector(".ed-journal-photo");
    if(photo)image(photo,i%2?"left":"right");
    Array.from(card.children).filter(x=>x!==photo).forEach((child,j)=>{
     (child.matches("a,button")?action:text)(child,child,j);
    });
   });

   $(".ed-benefits>div").forEach((item:Element)=>{
    Array.from(item.children).forEach((part,i)=>text(part,part,i));
   });
   $(".ed-affirmation").forEach((item:Element)=>revealChildren(item));

   // Only true supporting elements, with no duplicate animation targets.
   $("[data-reveal]").forEach((node:Element)=>{
    if(node.closest(
     "[data-scene],.ed-admin-story,.ed-secondary-banner,"+
     ".ed-mobile-chapter,.ed-benefits,.ed-categories-section"
    ))return;
    if(!seen.has(node))text(node,node,0);
   });

   // A single desktop scroll narrative remains scrub-driven. Image one
   // starts on viewport entry; the next appears with scroll, not a flash.
   const mm=gsap.matchMedia();
   mm.add("(min-width:900px) and (prefers-reduced-motion: no-preference)",()=>{
    const chapter=$("[data-chapter]")[0] as HTMLElement|undefined;
    if(!chapter)return;
    const photos=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-frame]"));
    const words=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-copy]"));
    const progress=chapter.querySelector<HTMLElement>("[data-chapter-progress]");
    if(photos.length!==2||words.length!==2||!progress)return;
    image(photos[0],"right");
    gsap.set(photos[1],{autoAlpha:1,clipPath:"inset(0 0 100% 0)"});
    gsap.set(words[1],{autoAlpha:0,y:16});
    gsap.timeline({defaults:{ease:"none"},scrollTrigger:{
     trigger:chapter,start:"top top",end:"+=110%",
     pin:true,scrub:.8,anticipatePin:1,invalidateOnRefresh:true
    }})
     .to(photos[1],{clipPath:"inset(0 0 0 0)",duration:1},0)
     .to(words[0],{autoAlpha:0,y:-16,duration:.4},.08)
     .to(words[1],{autoAlpha:1,y:0,duration:.57},.42)
     .fromTo(progress,{scaleX:.04},{scaleX:1,duration:1},0);
   });
  },el);

  el.dataset.motionStatus="ready";
  const revealAfterIntro=()=>{
   curtainFinished=true;
   requestAnimationFrame(()=>{
    if(!active)return;
    for(const {node,enter} of registered)if(visible(node))enter();
    ScrollTrigger.refresh();
   });
  };
  window.addEventListener("editorial:intro-complete",revealAfterIntro);
  if(curtainFinished)revealAfterIntro();
  let frameId=0;
  const completePassed=()=>{
   frameId=0;
   if(!active)return;
   const height=window.innerHeight;
   for(const {node,settle} of registered){
    const rect=node.getBoundingClientRect();
    if(rect.bottom < -height*.22)settle();
   }
  };
  const onScroll=()=>{
   if(frameId||!active)return;
   frameId=requestAnimationFrame(completePassed);
  };
  window.addEventListener("scroll",onScroll,{passive:true});
  frameId=requestAnimationFrame(completePassed);
  const refresh=()=>{if(active)ScrollTrigger.refresh()};
  void document.fonts?.ready.then(refresh).catch(()=>{});
  window.addEventListener("load",refresh,{once:true});
  window.addEventListener("orientationchange",refresh);
  return()=>{
   active=false;
   observer.disconnect();
   warmObserver.disconnect();
   window.removeEventListener("editorial:intro-complete",revealAfterIntro);
   window.removeEventListener("load",refresh);
   window.removeEventListener("orientationchange",refresh);
   if(frameId)cancelAnimationFrame(frameId);
   window.removeEventListener("scroll",onScroll);
   animations.forEach(tl=>tl.kill());
   context.revert();
  };
 },[]);
 return <div ref={root} className="editorial-site" data-motion-status="initial">{children}</div>;
}
