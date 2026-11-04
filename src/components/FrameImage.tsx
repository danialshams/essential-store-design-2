"use client";
import Image,{type ImageProps} from "next/image";

/**
 * Derive the editorial frame from the actual delivered image, including
 * user-uploaded media. This prevents 'contain' letterboxes and 'cover'
 * cropping caused by arbitrary fixed aspect-ratio templates.
 */
export function FrameImage({onLoad,...props}:ImageProps){
 return <Image {...props} onLoad={event=>{
  const img=event.currentTarget;
  const frame=img.closest<HTMLElement>("[data-editorial-frame]");
  if(frame&&img.naturalWidth>0&&img.naturalHeight>0){
   frame.style.setProperty("--frame-ratio",
    img.naturalWidth+" / "+img.naturalHeight);
  }
  onLoad?.(event);
 }}/>;
}
