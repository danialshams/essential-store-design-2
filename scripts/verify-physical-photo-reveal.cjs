/* Verify pixels are actually entering the viewport over time.
 * Previous tests only checked data-photo-reveal-state="playing", but
 * GSAP clip-path string interpolation was frozen until clearProps. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {chromium}=require("playwright");
const {spawnSync}=require("node:child_process");
const chrome=spawnSync("which",["google-chrome"]).status===0;
const base=process.env.EDITORIAL_BASE_URL||"http://127.0.0.1:3000";
const out="artifacts/physical-reveals";
fs.mkdirSync(out,{recursive:true});
const reports=[];
const reading=(el)=>{
 const mask=el.querySelector(".ed-category-image-stage")||el;
 const img=mask.querySelector("img");
 const style=getComputedStyle(mask);
 return {
  mode:el.getAttribute("data-cinematic-mode"),
  state:el.getAttribute("data-photo-reveal-state"),
  progress:el.getAttribute("data-photo-reveal-progress"),
  clip:style.clipPath,
  opacity:Number(style.opacity),
  loaded:!!img?.naturalWidth,
  zoom:img?getComputedStyle(img).transform:"none",
  top:Math.round(el.getBoundingClientRect().top),
 };
};
const scaleFromMatrix=(m)=>{
 const match=m.match(/^matrix\(([-\d.]+)/);
 return match?Number(match[1]):m==="none"?1:NaN;
};
(async()=>{
 const browser=await chromium.launch({headless:true,...(chrome?{channel:"chrome"}:{}),args:["--no-sandbox"]});
 try{
  const jobs=[
   {selector:".ed-category-tile",index:0,label:"cat-01",expected:"up"},
   {selector:".ed-category-tile",index:1,label:"cat-02",expected:"fade"},
   {selector:".ed-category-tile",index:2,label:"cat-03",expected:"right"},
   {selector:".ed-category-tile",index:3,label:"cat-04",expected:"fade"},
   {selector:".ed-products-section .premium-product-media",index:0,label:"products",expected:"up"},
   {selector:".ed-lookbook-media",index:0,label:"campaign",expected:"left"},
   {selector:".ed-story-visual",index:0,label:"story",expected:"right"},
   {selector:".ed-story-inset",index:0,label:"detail",expected:"fade"},
   {selector:".ed-mobile-chapter-photo",index:0,label:"chapter",expected:"left"},
   {selector:".ed-journal-photo",index:0,label:"journal",expected:"right"},
  ];
  for(const job of jobs){
   const context=await browser.newContext({viewport:{width:390,height:844},
    deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:"no-preference"});
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",err=>errors.push(String(err)));
   try{
    await page.goto(base,{waitUntil:"domcontentloaded",timeout:60000});
    await page.waitForFunction(()=>document.documentElement.dataset.introState==="complete",
     null,{timeout:18000});
    const node=page.locator(job.selector).nth(job.index);
    await node.waitFor({state:"attached"});
    const before=await node.evaluate(reading);
    // Reveal begins when the image reaches about 70% of the viewport
    // height. This captures the start instead of testing a finished reveal.
    await node.evaluate(el=>{
     const r=el.getBoundingClientRect();
     window.scrollTo({top:Math.max(0,window.scrollY+r.top-innerHeight*.69),
      behavior:"instant"});
    });
    await page.waitForFunction(({selector,index})=>{
     return document.querySelectorAll(selector)[index]?.getAttribute("data-photo-reveal-state")==="playing";
    },job,{timeout:7000});
    await page.waitForTimeout(270);
    const during=await node.evaluate(reading);
    await page.screenshot({path:`${out}/${job.label}-during.png`,fullPage:false,animations:"allow"});
    await page.waitForTimeout(970);
    const revealed=await node.evaluate(reading);
    await page.waitForTimeout(2200);
    const zoomed=await node.evaluate(reading);
    const result={...job,before,during,revealed,zoomed,errors};
    reports.push(result);
    assert.equal(during.mode,job.expected,`${job.label}: wrong cinematic effect`);
    assert.ok(during.loaded,`${job.label}: image not decoded at entry`);
    if(job.expected==="fade"){
     assert.ok(during.opacity>.05&&during.opacity<.985,
      `${job.label}: no intermediate fade; opacity=${during.opacity}`);
     assert.ok(revealed.opacity>.96,`${job.label}: fade did not finish`);
    }else{
     const progress=Number(during.progress);
     assert.ok(progress>.015&&progress<.985,
      `${job.label}: missing intermediate clip progress ${during.progress}`);
     assert.ok(during.clip.startsWith("inset(")&&during.clip!=="inset(0px)",
      `${job.label}: clipping never changed visually ${during.clip}`);
     assert.equal(revealed.progress,"1.000",`${job.label}: wipe did not finish`);
    }
    const midZoom=scaleFromMatrix(revealed.zoom),endZoom=scaleFromMatrix(zoomed.zoom);
    assert.ok(midZoom>1.005,`${job.label}: zoom-out finished before entrance`);
    assert.ok(endZoom<=1.003,`${job.label}: slow zoom-out never completed`);
    assert.ok(errors.length===0,`${job.label}: runtime errors: ${errors.join(",")}`);
   }catch(e){
    console.error("PHYSICAL REVEAL FAILURE",job.label,String(e));
    throw e;
   }finally{await context.close()}
  }
  fs.writeFileSync(out+"/results.json",JSON.stringify(reports,null,2));
  console.log("PASS PHYSICAL GSAP REVEALS",reports.map(r=>({
   photo:r.label,mode:r.during.mode,clip:r.during.clip,opacity:r.during.opacity,
   progress:r.during.progress,zoomFrom:r.revealed.zoom,zoomTo:r.zoomed.zoom
  })));
 }finally{await browser.close()}
})().catch(err=>{
 fs.writeFileSync(out+"/results.json",JSON.stringify(reports,null,2));
 console.error(err);process.exitCode=1;
});
