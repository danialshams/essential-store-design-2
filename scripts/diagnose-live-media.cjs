/* A real production-browser audit, not a source-code assertion.
   Record each media frame in the first 1.1 seconds of its actual viewport entrance. */
const fs=require("node:fs");
const {chromium}=require("playwright");
(async()=>{
 const output="artifacts/"+(process.env.EDITORIAL_DIAG_LABEL||"live")+"-media";
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:"chrome",args:["--no-sandbox"]});
 const base=process.env.EDITORIAL_BASE_URL||"https://essential-store-design-2.vercel.app";
 const results={base,started:new Date().toISOString(),viewports:[]};
 for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,hasTouch:viewport.width<600,
   isMobile:viewport.width<600,reducedMotion:"no-preference"});
  const page=await context.newPage();
  const tag=viewport.width<600?"mobile":"desktop";
  const log={tag,sections:[],errors:[]};
  page.on("pageerror",err=>log.errors.push(String(err)));
  try{
   await page.goto(base,{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForFunction(()=>document.documentElement.dataset.introState==="complete",
     null,{timeout:15000});
   await page.waitForTimeout(210);
   const selectors=[
    [".ed-category-tile",4,"categories"],
    [".ed-products-section .premium-product-media",4,"products"],
    [".ed-lookbook-media",1,"campaign"],
    [".ed-story-visual",1,"storyMain"],
    [".ed-story-inset",1,"storyInset"],
    [".ed-mobile-chapter-photo",2,"chapters"],
    [".ed-admin-story-picture",2,"adminStory"],
    [".ed-secondary-banner-image",2,"banners"],
    [".ed-journal-photo",2,"journal"]
   ];
   for(const [selector,limit,name] of selectors){
    const matches=page.locator(selector);
    let count=await matches.count();
    for(let i=0;i<Math.min(limit,count);i++){
     const node=matches.nth(i);
     if(!(await node.isVisible()))continue;
     const initial=await node.evaluate(el=>{
      const box=el.getBoundingClientRect(),img=el.querySelector("img");
      return {top:box.top,bottom:box.bottom,viewport:innerHeight,photoReady:img?.complete,
        state:el.getAttribute("data-photo-reveal-state")};
     });
     // Move to a point where the image has just entered the visible viewport.
     await node.evaluate(el=>{
      const rect=el.getBoundingClientRect();
      const target=window.scrollY+rect.top-innerHeight*.87;
      window.scrollTo({top:Math.max(0,target),behavior:"instant"});
     });
     const series=[];
     for(const ms of [0,90,260,520,960]){
      if(ms)await page.waitForTimeout(ms-(series.at(-1)?.ms??0));
      const sample=await node.evaluate(el=>{
       const r=el.getBoundingClientRect(),img=el.querySelector("img"),
             cs=getComputedStyle(el),ic=img?getComputedStyle(img):null;
       return {state:el.getAttribute("data-photo-reveal-state"),
        reveal:el.getAttribute("data-reveal-state"),
        top:Math.round(r.top),bottom:Math.round(r.bottom),
        clip:cs.clipPath,opacity:cs.opacity,transform:cs.transform,
        maskClip:getComputedStyle(el.querySelector(".ed-category-image-stage")||el).clipPath,
        maskOpacity:getComputedStyle(el.querySelector(".ed-category-image-stage")||el).opacity,
        progress:el.getAttribute("data-photo-reveal-progress"),
        mode:el.getAttribute("data-cinematic-mode"),
        imgReady:img?.complete,imgWidth:img?.naturalWidth,
        imgTransform:ic?.transform,imgOpacity:ic?.opacity};
      });
      series.push({ms,...sample});
      if((name==="categories"||name==="campaign"||name==="storyMain") &&
          (ms===0||ms===260||ms===960)){
       await page.screenshot({path:`${output}/${tag}-${name}-${i+1}-${ms}.png`,
         fullPage:false,animations:"allow"});
      }
     }
     log.sections.push({selector,index:i,initial,series});
    }
   }
   results.viewports.push(log);
  }catch(e){log.fatal=String(e);results.viewports.push(log)}
  await context.close();
 }
 fs.writeFileSync(output+"/trace.json",JSON.stringify(results,null,2));
 console.log("LIVE MEDIA DIAGNOSTICS",JSON.stringify(results.viewports.map(v=>({
  tag:v.tag,fatal:v.fatal,sections:v.sections.map(s=>({
   media:s.selector,index:s.index,
   states:s.series.map(x=>x.state),
   clip:s.series.map(x=>x.clip),
   ready:s.series.map(x=>x.imgReady),
   zoom:s.series.map(x=>x.imgTransform)
  }))
 }))));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
