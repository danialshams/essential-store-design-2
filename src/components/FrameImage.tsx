"use client";
import Image,{type ImageProps} from "next/image";
import {showcasePhoto} from "@/lib/showcase-photos";

/**
 * Derive the editorial frame from the actual delivered image, including
 * user-uploaded media. This prevents 'contain' letterboxes and 'cover'
 * cropping caused by arbitrary fixed aspect-ratio templates.
 */
export function FrameImage({onLoad,...props}:ImageProps){
 const src=typeof props.src==="string"?showcasePhoto(props.src):props.src;
 return <Image {...props} src={src} unoptimized={Boolean(props.unoptimized||(typeof src==="string"&&src.startsWith("http")))} onLoad={event=>{
  const img=event.currentTarget;
  const frame=img.closest<HTMLElement>("[data-editorial-frame]");
  if(frame&&img.naturalWidth>0&&img.naturalHeight>0){
   frame.style.setProperty("--frame-ratio",
    img.naturalWidth+" / "+img.naturalHeight);
  }
  onLoad?.(event);
 }}/>;
}
