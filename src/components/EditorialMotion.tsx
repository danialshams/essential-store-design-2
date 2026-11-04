"use client";
import {useLayoutEffect,useRef,type ReactNode} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

/**
 * Edition 02. Trigger every scene when its OWN visual content enters the
 * viewport, not when the top of some taller parent starts entering it.
 * Mutations stay scoped and are restored on unmount.
 */
export function EditorialMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const element=root.current;
  if(!element)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
   element.dataset.motionStatus="reduced";
   return;
  }
  gsap.registerPlugin(ScrollTrigger);
  let alive=true;
  // IntersectionObserver is a safety net for fast wheel swipes, programmatic
  // jumps and mobile browsers that occasionally skip ScrollTrigger callbacks.
  const pending=new WeakMap<Element,()=>void>();
  const visibilityFallback=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      pending.get(entry.target)?.();
      visibilityFallback.unobserve(entry.target);
    }
  },{root:null,rootMargin:"0px 0px -29% 0px",threshold:0.16});
  const context=gsap.context(()=>{
   const $=gsap.utils.selector(element);
   const ease="power3.out";
   // A chapter starts only when its own content is genuinely visible.
   // The reveal itself waits for image decoding. Previously the image could
   // finish downloading AFTER its GSAP mask animation, appearing abruptly.
   const inView=(trigger:Element,tl:gsap.core.Timeline,start="top 69%")=>{
    let started=false;
    let requested=false;
    const image=(trigger instanceof HTMLImageElement?trigger:
      trigger.querySelector("img")) as HTMLImageElement|null;
    const play=()=>{
     if(started||!alive)return;
     started=true;
     tl.play();
    };
    const enter=()=>{
     if(requested)return;
     requested=true;
     if(!image||image.complete){play();return}
     image.addEventListener("load",play,{once:true});
     image.addEventListener("error",play,{once:true});
     // Decoding the actual photograph, not just fetching its resource,
     // ensures the user sees the wipe/zoom rather than a late image pop-in.
     if(typeof image.decode==="function"){
      void image.decode().then(play,()=>{
       if(image.complete)play();
      });
     }
    };
    pending.set(trigger,enter);
    visibilityFallback.observe(trigger);
    ScrollTrigger.create({
     trigger,start,once:true,invalidateOnRefresh:true,
     onEnter:enter,onEnterBack:enter
    });
   };
   const childrenOf=(el:Element|null)=>el?Array.from(el.children):[];
   const reveal=(
    trigger:Element, targets:Element[], vars:gsap.TweenVars,
    opts:{start?:string;stagger?:number;delay?:number}={}
   )=>{
    if(!targets.length)return;
    const tl=gsap.timeline({paused:true});
    tl.fromTo(targets,{autoAlpha:0,y:22,...vars},{
     autoAlpha:1,x:0,y:0,scale:1,scaleX:1,scaleY:1,
     duration:1.04,stagger:opts.stagger??.13,ease,clearProps:"transform,filter"
    },opts.delay??0);
    inView(trigger,tl,opts.start??"top 78%");
   };

   // 00 / Interlude under hero: never fire while offscreen on mobile.
   const interlude=$(".ed-quiet-strip")[0] as HTMLElement|undefined;
   if(interlude){
    const labels=Array.from(interlude.querySelectorAll("span:not(.ed-quiet-strip-line)"));
    const rule=interlude.querySelector(".ed-quiet-strip-line");
    const tl=gsap.timeline({paused:true});
    if(labels.length)tl.fromTo(labels,{y:17,autoAlpha:0},{
     y:0,autoAlpha:1,duration:1,stagger:.17,ease:"power3.out"
    },0);
    if(rule)tl.fromTo(rule,{scaleX:.12,autoAlpha:0},{
     scaleX:1,autoAlpha:1,duration:1.25,ease:"power2.out"
    },.26);
    inView(interlude,tl,"top 74%");
   }

   // 01 / Editorial chapter headings: individually masked, not a group flash.
   $(".ed-home .ed-section-heading").forEach((heading:Element)=>{
    const eyebrow=heading.querySelector(".premium-eyebrow");
    const title=heading.querySelector("h2");
    const description=heading.querySelector("p");
    const link=heading.querySelector(".ed-inline-link");
    const tl=gsap.timeline({paused:true});
    if(eyebrow)tl.fromTo(eyebrow,{y:13,autoAlpha:0},{
     y:0,autoAlpha:1,duration:.72,ease
    },0);
    if(title)tl.fromTo(title,{y:38,clipPath:"inset(0 0 100% 0)"},
     {y:0,clipPath:"inset(0 0 0 0)",duration:1.18,ease:"power3.out",clearProps:"clipPath"},.11);
    if(description)tl.fromTo(description,{autoAlpha:0,y:13},
      {autoAlpha:1,y:0,duration:.84,ease},.42);
    if(link)tl.fromTo(link,{autoAlpha:0,x:-16},
      {autoAlpha:1,x:0,duration:.86,ease},.5);
    inView(heading,tl,"top 76%");
   });

   // 02 / Category gallery: alternate vertical paper curtains and subtle
   // lens zoom. Each tall photograph waits for its own appearance.
   $("[data-editorial-grid] .ed-category-tile").forEach((card:Element,index:number)=>{
    const photo=card.querySelector(".ed-category-photo");
    const copy=card.querySelector(".ed-category-caption");
    const tl=gsap.timeline({paused:true});
    tl.fromTo(card,{
      clipPath:index%2?"inset(0 0 100% 0)":"inset(100% 0 0 0)"
    },{
      clipPath:"inset(0 0 0 0)",duration:1.28,ease:"power3.inOut",
      clearProps:"clipPath"
    },0);
    if(photo)tl.fromTo(photo,{scale:1.16,scaleX:1.07},{
      scale:1,scaleX:1,duration:1.82,ease:"power2.out",clearProps:"transform"
    },0);
    if(copy)tl.fromTo(childrenOf(copy),{autoAlpha:0,y:16},{
      autoAlpha:1,y:0,duration:.8,stagger:.1,ease
    },.58);
    inView(card,tl,"top 68%");
   });

   // 03 / Product gallery: each tile owns a timeline; offscreen rows are not
   // animated ahead of time just because the first row became visible.
   $(".ed-products-section .premium-product-card").forEach((card:Element,index:number)=>{
    const media=card.querySelector(".premium-product-media");
    const photo=media?.querySelector("img");
    const info=card.querySelector(".premium-product-info");
    const tl=gsap.timeline({paused:true});
    if(media)tl.fromTo(media,{autoAlpha:0,y:25,scaleY:.93},
      {autoAlpha:1,y:0,scaleY:1,duration:1.12,ease,clearProps:"transform"},0);
    if(photo)tl.fromTo(photo,{scale:1.09},{
      scale:1,duration:1.66,ease:"power2.out",clearProps:"transform"
    },0);
    if(info)tl.fromTo(childrenOf(info),{autoAlpha:0,y:13},{
      autoAlpha:1,y:0,duration:.74,stagger:.08,ease
    },.42);
    inView(card,tl,"top 80%");
   });

   // 04 / Full-bleed cinematic campaign: photographic stretch + soft copy.
   const campaign=$('[data-scene="campaign"]')[0] as HTMLElement|undefined;
   if(campaign){
    const media=campaign.querySelector(".ed-lookbook-media");
    const photo=campaign.querySelector(".ed-lookbook-photo");
    const copy=campaign.querySelector(".ed-lookbook-copy");
    const tl=gsap.timeline({paused:true});
    if(media)tl.fromTo(media,{clipPath:"inset(0 18% 0 0)",scaleX:1.055},{
      clipPath:"inset(0 0 0 0)",scaleX:1,duration:1.6,
      ease:"power3.inOut",clearProps:"clipPath,transform"
    },0);
    if(photo)tl.fromTo(photo,{scale:1.12},{
      scale:1,duration:2.3,ease:"power2.out",clearProps:"transform"
    },0);
    if(copy)tl.fromTo(childrenOf(copy).filter(x=>!x.classList.contains("ed-lookbook-ordinal")),{
      autoAlpha:0,x:34
    },{
      autoAlpha:1,x:0,duration:.98,stagger:.16,ease
    },.5);
    inView(campaign,tl,"top 70%");
   }

   // 05 / Brand story: portrait and inset, then text from opposite direction.
   const story=$('[data-scene="story"]')[0] as HTMLElement|undefined;
   if(story){
    const photo=story.querySelector(".ed-story-visual");
    const picture=photo?.querySelector("img");
    const detail=story.querySelector(".ed-story-inset");
    const copy=story.querySelector(".ed-story-copy");
    const imageTl=gsap.timeline({paused:true});
    if(photo)imageTl.fromTo(photo,{clipPath:"inset(0 100% 0 0)"},{
      clipPath:"inset(0 0 0 0)",duration:1.38,
      ease:"power3.inOut",clearProps:"clipPath"
    },0);
    if(picture)imageTl.fromTo(picture,{scale:1.12},{
      scale:1,duration:1.94,ease:"power2.out",clearProps:"transform"
    },0);
    const photoTrigger=photo||story;
    inView(photoTrigger,imageTl,"top 70%");
    // The inset sits LOWER than the primary portrait. Running its effect
    // in the portrait timeline made the second image appear instantly later.
    if(detail){
     const detailTl=gsap.timeline({paused:true});
     const insetImage=detail.querySelector("img");
     detailTl.fromTo(detail,{autoAlpha:0,y:62,scale:.89,scaleY:.78},{
       autoAlpha:1,y:0,scale:1,scaleY:1,duration:1.42,
       ease:"power3.out",clearProps:"transform"
     },0);
     if(insetImage)detailTl.fromTo(insetImage,{scale:1.16},{
       scale:1,duration:1.7,ease:"power2.out",clearProps:"transform"
     },0);
     inView(detail,detailTl,"top 69%");
    }
    if(copy)reveal(copy,childrenOf(copy),{x:-18,y:27},{start:"top 69%",stagger:.17});
   }

   // 06 / Two mobile chapters: images enter on their own; text only when
   // the copy itself becomes visible, not when the tall image first enters.
   $(".ed-mobile-chapter").forEach((chapter:Element,i:number)=>{
    const photo=chapter.querySelector(".ed-mobile-chapter-photo");
    const copy=chapter.querySelector(".ed-mobile-chapter-copy");
    if(photo){
      const image=photo.querySelector("img");
      const tl=gsap.timeline({paused:true});
      tl.fromTo(photo,{clipPath:i%2?"inset(0 100% 0 0)":"inset(0 0 100% 0)"},{
        clipPath:"inset(0 0 0 0)",duration:1.36,ease:"power3.inOut",
        clearProps:"clipPath"
      },0);
      if(image)tl.fromTo(image,{scale:1.13},{
        scale:1,duration:1.9,ease:"power2.out",clearProps:"transform"
      },0);
      inView(photo,tl,"top 69%");
    }
    if(copy)reveal(copy,childrenOf(copy),{y:28},{start:"top 77%",stagger:.18});
   });

   // 07 / Additional merchant-enabled stories: respect their saved style.
   $(".ed-admin-story").forEach((section:Element,i:number)=>{
    const kind=section.getAttribute("data-motion")||"mask";
    const picture=section.querySelector(".ed-admin-story-picture");
    const text=section.querySelector(".ed-admin-story-copy");
    if(picture){
      const img=picture.querySelector("img");
      const tl=gsap.timeline({paused:true});
      if(kind==="slide")tl.fromTo(picture,{autoAlpha:0,x:i%2?-65:65},{
         autoAlpha:1,x:0,duration:1.25,ease,clearProps:"transform"
      },0);
      else if(kind==="fade")tl.fromTo(picture,{autoAlpha:0,scale:1.06},{
         autoAlpha:1,scale:1,duration:1.35,ease,clearProps:"transform"
      },0);
      else tl.fromTo(picture,{clipPath:"inset(0 0 100% 0)"},{
         clipPath:"inset(0 0 0 0)",duration:1.4,ease:"power3.inOut",
         clearProps:"clipPath"
      },0);
      if(img)tl.fromTo(img,{scaleX:1.09,scaleY:.96},{
         scaleX:1,scaleY:1,duration:1.57,ease:"power3.out",clearProps:"transform"
      },0);
      inView(picture,tl,"top 70%");
      const inset=picture.querySelector(".ed-admin-story-detail");
      if(inset){
       const insetTl=gsap.timeline({paused:true});
       const insetPhoto=inset.querySelector("img");
       insetTl.fromTo(inset,{autoAlpha:0,y:53,scale:.88,scaleY:.8},{
        autoAlpha:1,y:0,scale:1,scaleY:1,duration:1.32,
        ease:"power3.out",clearProps:"transform"
       },0);
       if(insetPhoto)insetTl.fromTo(insetPhoto,{scale:1.17},{
        scale:1,duration:1.7,ease:"power2.out",clearProps:"transform"
       },0);
       inView(inset,insetTl,"top 68%");
      }
    }
    if(text)reveal(text,childrenOf(text),{y:26},{start:"top 74%",stagger:.16});
   });

   // 08 / Extra campaign banners: alternating masked image and readable copy.
   $(".ed-secondary-banner").forEach((banner:Element,i:number)=>{
    const media=banner.querySelector(".ed-secondary-banner-image");
    const text=banner.firstElementChild;
    if(media){
      const image=media.querySelector("img");
      const tl=gsap.timeline({paused:true});
      tl.fromTo(media,{clipPath:i%2?"inset(0 100% 0 0)":"inset(0 0 0 100%)"},{
        clipPath:"inset(0 0 0 0)",duration:1.3,ease:"power3.inOut",
        clearProps:"clipPath"
      },0);
      if(image)tl.fromTo(image,{scale:1.12},{scale:1,duration:1.8,ease:"power2.out",clearProps:"transform"},0);
      inView(media,tl,"top 70%");
    }
    if(text)reveal(text,childrenOf(text),{x:i%2?-18:18,y:19},{start:"top 79%"});
   });

   // 09 / Journal: two genuinely independent columns, with slight stretch.
   $(".ed-journal-card").forEach((card:Element,i:number)=>{
    const photo=card.querySelector(".ed-journal-photo");
    const image=photo?.querySelector("img");
    const tl=gsap.timeline({paused:true});
    if(photo)tl.fromTo(photo,{
      clipPath:i%2?"inset(0 0 0 100%)":"inset(0 100% 0 0)",scaleY:.97
    },{
      clipPath:"inset(0 0 0 0)",scaleY:1,duration:1.35,ease:"power3.inOut",
      clearProps:"clipPath,transform"
    },0);
    if(image)tl.fromTo(image,{scale:1.14},{
      scale:1,duration:1.95,ease:"power2.out",clearProps:"transform"
    },0);
    const copy=Array.from(card.children).filter(x=>!x.classList.contains("ed-journal-photo"));
    if(copy.length)tl.fromTo(copy,{autoAlpha:0,y:24},{
      autoAlpha:1,y:0,duration:.91,stagger:.12,ease
    },.54);
    inView(card,tl,"top 69%");
   });

   // 10 / Trust footer: each message responds to its OWN position.
   $(".ed-benefits > div").forEach((card:Element,i:number)=>{
    const tl=gsap.timeline({paused:true});
    tl.fromTo(card,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.9,ease},0);
    const icon=card.querySelector("svg");
    if(icon)tl.fromTo(icon,{scale:.7,rotate:i%2?-9:9},{
      scale:1,rotate:0,duration:1.08,ease:"back.out(1.2)",clearProps:"transform"
    },.15);
    inView(card,tl,"top 77%");
   });

   // 11 / Generic supporting elements NOT handled by a dedicated scene.
   $("[data-reveal]").forEach((node:Element)=>{
    if(node.closest("[data-scene],.ed-admin-story,.ed-secondary-banner,.ed-mobile-chapter,.ed-benefits"))return;
    const dir=node.getAttribute("data-reveal");
    reveal(node,[node],{x:dir==="left"?-25:dir==="right"?25:0,y:dir==="up"?22:0},
       {start:"top 77%"});
   });

   // Only one scroll-scrubbed sequence, deliberately isolated to desktop.
   const mm=gsap.matchMedia();
   mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)",()=>{
    const chapter=$("[data-chapter]")[0] as HTMLElement|undefined;
    if(!chapter)return;
    const images=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-frame]"));
    const copy=Array.from(chapter.querySelectorAll<HTMLElement>("[data-chapter-copy]"));
    const progress=chapter.querySelector<HTMLElement>("[data-chapter-progress]");
    if(images.length!==2||copy.length!==2||!progress)return;
    // First photograph had no entrance timeline at all. Give it an opening
    // curtain before the user's scroll starts transitioning to Act II.
    const opening=gsap.timeline({paused:true});
    opening.fromTo(images[0],{clipPath:"inset(0 100% 0 0)",scaleX:1.055},{
      clipPath:"inset(0 0 0 0)",scaleX:1,duration:1.62,
      ease:"power3.inOut",clearProps:"clipPath,transform"
    });
    const firstImage=images[0].querySelector("img");
    if(firstImage)opening.fromTo(firstImage,{scale:1.13},{
      scale:1,duration:2.0,ease:"power2.out",clearProps:"transform"
    },0);
    inView(chapter,opening,"top 69%");
    gsap.set(images[1],{opacity:1,clipPath:"inset(0 0 100% 0)"});
    gsap.set(copy[1],{autoAlpha:0,y:27});
    gsap.timeline({defaults:{ease:"none"},scrollTrigger:{
      trigger:chapter,start:"top top",end:"+=120%",pin:true,scrub:.85,
      anticipatePin:1,invalidateOnRefresh:true
    }})
    .to(images[1],{clipPath:"inset(0 0 0 0)",duration:1},0)
    .to(copy[0],{autoAlpha:0,y:-28,duration:.44},.09)
    .to(copy[1],{autoAlpha:1,y:0,duration:.56},.44)
    .fromTo(progress,{scaleX:.06},{scaleX:1,duration:1},0);
   });
  },element);
  element.dataset.motionStatus="ready";

  // Existing image dimensions are reserved by Next.js. Refresh only on
  // typography settling, orientation changes and actual browser load.
  const refresh=()=>{if(alive)ScrollTrigger.refresh()};
  void document.fonts?.ready.then(refresh).catch(()=>{});
  window.addEventListener("load",refresh,{once:true});
  window.addEventListener("orientationchange",refresh,{passive:true});
  return()=>{
   alive=false;
   visibilityFallback.disconnect();
   window.removeEventListener("load",refresh);
   window.removeEventListener("orientationchange",refresh);
   context.revert();
  };
 },[]);
 return <div ref={root} className="editorial-site" data-motion-status="initial">{children}</div>;
}
