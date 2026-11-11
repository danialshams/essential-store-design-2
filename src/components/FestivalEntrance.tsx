"use client";
import {useEffect} from "react";
/** Keep SSR fully visible; animate only when observed on the client. */
export function FestivalEntrance(){
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>('[data-scene="festival"],.ed1-sale-festival');
  if(!root)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){
    root.classList.add("festival-motion-entered");
    observer.disconnect();
   }
  },{rootMargin:"0px 0px -10% 0px",threshold:.08});
  root.classList.add("festival-motion-ready");
  observer.observe(root);
  // Unblock if the browser never dispatches an intersection event.
  const fallback=window.setTimeout(()=>root.classList.add("festival-motion-entered"),4000);
  return()=>{observer.disconnect();window.clearTimeout(fallback);root.classList.remove("festival-motion-ready","festival-motion-entered")};
 },[]);
 return null;
}
