"use client";
import {useEffect,useRef,type ReactNode} from "react";

/** Scoped, progressive GSAP animations: no JS means content remains visible. */
export function EditorialMotion({children}:{children:ReactNode}){
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    let alive=true;
    let cleanup:(()=>void)|undefined;
    void Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([gsapModule,triggerModule])=>{
      const element=root.current;
      if(!alive || !element)return;
      const gsap=gsapModule.gsap;
      const ScrollTrigger=triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const context=gsap.context(()=>{
        const $=gsap.utils.selector(element);
        const intro=gsap.timeline({defaults:{ease:"power3.out"}});
        intro.fromTo($("[data-hero-image]"),{opacity:0,scale:1.07},{opacity:1,scale:1,duration:1.25,clearProps:"opacity,transform"})
          .fromTo($("[data-hero-kicker]"),{opacity:0,y:14},{opacity:1,y:0,duration:.55,clearProps:"opacity,transform"},"-=.94")
          .fromTo($("[data-hero-line]"),{opacity:0,y:34},{opacity:1,y:0,duration:.95,stagger:.12,clearProps:"opacity,transform"},"-=.73")
          .fromTo($("[data-hero-description]"),{opacity:0,y:15},{opacity:1,y:0,duration:.75,clearProps:"opacity,transform"},"-=.5")
          .fromTo($("[data-hero-action]"),{opacity:0,y:13},{opacity:1,y:0,duration:.55,clearProps:"opacity,transform"},"-=.55");
        $("[data-reveal]").forEach((section:Element)=>{
          const direction=section.getAttribute("data-reveal");
          const movement=direction==="right"?28:direction==="left"?-28:20;
          gsap.fromTo(section,{autoAlpha:0,x:direction==="right"||direction==="left"?movement:0,y:direction==="up"?movement:0},{
            autoAlpha:1,x:0,y:0,duration:.88,ease:"power3.out",clearProps:"all",
            scrollTrigger:{trigger:section,start:"top 88%",once:true}
          });
        });
        $("[data-stagger]").forEach((section:Element)=>{
          const cards=[...section.children];
          if(!cards.length)return;
          gsap.fromTo(cards,{autoAlpha:0,y:18},{autoAlpha:1,y:0,duration:.72,stagger:.1,ease:"power2.out",clearProps:"all",
            scrollTrigger:{trigger:section,start:"top 86%",once:true}});
        });
        if(window.matchMedia("(min-width: 900px)").matches){
          $("[data-parallax]").forEach((element:Element)=>{
            gsap.fromTo(element,{yPercent:-3},{yPercent:3,ease:"none",scrollTrigger:{trigger:element.parentElement||element,start:"top bottom",end:"bottom top",scrub:.55}});
          });
        }
      },element);
      cleanup=()=>context.revert();
    }).catch(error=>console.warn("Editorial motion unavailable; static experience remains usable",error));
    return()=>{alive=false;cleanup?.()};
  },[]);
  return <div ref={root} className="editorial-site">{children}</div>;
}
