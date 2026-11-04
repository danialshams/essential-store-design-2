/* Browser-level verification of rendered motion and mobile UX (CI only).
 * Captures exact screenshots; does not depend on external admin or AI APIs.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {chromium}=require("playwright");
const {spawnSync}=require("node:child_process");
const systemChrome=spawnSync("which",["google-chrome"]).status===0;
const bringIntoRevealZone=async locator=>{
 await locator.evaluate(el=>{
  const top=window.scrollY+el.getBoundingClientRect().top-innerHeight*.67;
  window.scrollTo({top:Math.max(0,top),behavior:"instant"});
 });
};

(async()=>{
 fs.mkdirSync("artifacts",{recursive:true});
 const browser=await chromium.launch({headless:true,...(systemChrome?{channel:"chrome"}:{}),args:["--no-sandbox"]});
 try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const page=await desktop.newPage();
  await page.clock.install();
  const errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  await page.goto("http://127.0.0.1:3000/",{waitUntil:"domcontentloaded",timeout:65000});
  await page.locator(".ed-hero-slide.is-active").waitFor({timeout:20000});
  const initialCurtain=await page.evaluate(()=>({
   line:!!document.querySelector(".maison-intro-rule"),
   loader:!!document.querySelector(".maison-intro"),
   heroPlayState:getComputedStyle(document.querySelector(".ed-hero-media-shell")).animationPlayState
  }));
  assert.equal(initialCurtain.loader,true,"Loading curtain did not render");
  assert.equal(initialCurtain.line,true,"Fine loader line is missing");
  assert.equal(initialCurtain.heroPlayState,"paused",
   "Hero animation is running behind the loading curtain");
  // Clock advancement also exercises the intro's minimum duration and exit.
  await page.clock.fastForward(3500);
  await page.waitForTimeout(70);
  await page.clock.fastForward(900);
  await page.locator('html[data-intro-state="complete"]').waitFor({timeout:12000});
  await page.waitForTimeout(1120);
  const afterCurtain=await page.locator(".ed-hero-media-shell")
   .evaluate(el=>getComputedStyle(el).animationPlayState);
  assert.equal(afterCurtain,"running","Hero entrance did not resume AFTER loader exit");
  const status=await page.locator(".editorial-site").getAttribute("data-motion-status");
  assert.equal(status,"ready","GSAP motion engine failed to initialize on homepage");
  const initialSlides=await page.locator(".ed-hero-slide").count();
  assert.ok(initialSlides>=3,"Hero must have 3 editorial slides");
  // Autoplay is image-only chrome: no arrows, dots or stop button.
  const heroIndex=()=>page.locator(".ed-hero-slide").evaluateAll(els=>
    els.findIndex(el=>el.classList.contains("is-active")));
  const action=page.locator(".ed-hero-stable-action");
  await action.evaluate(node=>node.dataset.qaStable="same-node");
  assert.equal(await page.locator(".ed-carousel-control,.ed-carousel-play,.ed-carousel-dots").count(),0,
    "Old carousel controls are still rendered");
  const firstSlide=await heroIndex();
  await page.clock.fastForward(9150);
  await page.waitForTimeout(130);
  const secondSlide=await heroIndex();
  assert.notEqual(secondSlide,firstSlide,"Hero did not auto-advance");
  assert.equal(await action.evaluate(node=>node.dataset.qaStable),"same-node",
    "Discovery action remounted when the slide changed");
  assert.equal(await action.textContent()?.then(x=>x?.trim().includes("کشف داستان")),true,
    "Hero action should be a single fixed discovery label");
  // Instant search is local and shows options below the input, no submit word.
  await page.getByRole("button",{name:"جستجو",exact:true}).click();
  const searchInput=page.getByRole("combobox",{name:"جستجوی محصول"});
  await searchInput.fill("کفش");
  await page.locator(".premium-search-results .premium-search-result").first().waitFor();
  const focusOutline=await searchInput.evaluate(el=>getComputedStyle(el).outlineStyle);
  assert.equal(focusOutline,"none",
    "Search still has the generic thick focus rectangle instead of a refined underline");
  const suggestions=await page.locator(".premium-search-result").allTextContents();
  assert.ok(suggestions.some(label=>label.includes("کفش")),
    "Live search failed to list matching products immediately: "+suggestions.join(" | "));
  assert.equal(await page.locator(".premium-search-form button").count(),1,
    "Search should have only an icon close button and no submit label");
  const searchTransition=await page.locator(".premium-search-panel")
    .evaluate(el=>getComputedStyle(el).transitionDuration);
  assert.notEqual(searchTransition,"0s","Search close is abrupt, not eased");
  await page.mouse.click(22,875); // physically outside the open search dropdown
  await page.waitForTimeout(420);
  assert.equal(await page.locator(".premium-search-panel").getAttribute("aria-hidden"),"true",
    "Clicking outside did not dismiss search");
  const glass=await page.locator(".premium-header")
    .evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.match(glass,/rgba/,"Header should be gently translucent");

  const heroVisual=await page.locator(".ed-hero-media-shell").evaluate(node=>({
    animation:getComputedStyle(node).animationName
  }));
  assert.ok(heroVisual.animation!=="none","Hero image has no cinematic entrance");
    // Scroll every sequence as a real visitor would: full-page screenshots
  // taken before ScrollTrigger enters the viewport incorrectly look blank.
  const scenes=['.ed-categories-grid','#ed-selected','[data-scene="campaign"]',
    '[data-scene="story"]','.ed-chapter','[data-scene="journal"]','.ed-benefits'];
  for(const selector of scenes){
    const item=page.locator(selector).first();
    if(await item.count()){
      await bringIntoRevealZone(item);
      await page.waitForTimeout(1250);
    }
  }
  // An aggressive scroll jump must not leave passed media masked forever.
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await page.waitForTimeout(340);
  const maskedPassed=await page.evaluate(()=>{
   const selectors=[".ed-category-tile",".ed-products-section .premium-product-media",
    ".ed-lookbook-media",".ed-story-visual",".ed-journal-photo"];
   return selectors.flatMap(selector=>Array.from(document.querySelectorAll(selector)))
    .filter(el=>el.getBoundingClientRect().bottom<-innerHeight*.22&&
     /100%/.test(getComputedStyle(el).clipPath))
    .map(el=>el.className);
  });
  assert.deepEqual(maskedPassed,[],"Images remained clipped after fast scroll: "+maskedPassed.join(","));
  await page.screenshot({path:"artifacts/edition02-home-desktop.png",fullPage:true,animations:"disabled"});
  await page.clock.fastForward(9150);
  await page.waitForTimeout(100);
  const active=await page.locator(".ed-hero-slide.is-active").count();
  assert.equal(active,1,"Hero carousel has an invalid active scene");
  const firstProduct=page.locator(".ed-products-section .premium-product-card").first();
  await bringIntoRevealZone(firstProduct);
  await page.waitForTimeout(1250);
  const productFraming=await firstProduct.evaluate(card=>{
   const media=card.querySelector(".premium-product-media").getBoundingClientRect();
   const img=card.querySelector(".premium-product-photo");
   return {rendered:media.width/media.height,natural:img.naturalWidth/img.naturalHeight};
  });
  assert.ok(Math.abs(productFraming.rendered-productFraming.natural)<.09,
    "Product image has visible letterboxing from a wrong aspect ratio: "+JSON.stringify(productFraming));
  await bringIntoRevealZone(page.locator(".ed-categories-grid"));
  await page.waitForTimeout(650);
  const category=await page.locator(".ed-category-tile").first().evaluate(el=>({
   clip:getComputedStyle(el).clipPath,
   transform:getComputedStyle(el).transform
  }));
  console.log("HOME GSAP",status,"hero media animation",heroVisual.animation,"category",category);
  assert.equal(errors.length,0,"Uncaught browser errors: "+errors.join(" / "));
  // Real Next Link client navigation from the page bottom must scroll to top.
  await page.locator('.premium-footer-links a[href="/products"]').first().click();
  await page.waitForURL("**/products");
  await page.waitForTimeout(220);
  const routeScroll=await page.evaluate(()=>window.scrollY);
  assert.ok(routeScroll<80,"Client navigation retained old scroll position: "+routeScroll);
  await page.locator(".collection-heading").waitFor();
  await page.waitForTimeout(800);
  assert.equal(await page.locator(".editorial-page-shell").getAttribute("data-page-motion"),"ready");
  await page.screenshot({path:"artifacts/edition02-collection-desktop.png",fullPage:true,animations:"disabled"});
  await page.goto("http://127.0.0.1:3000/product/minimal-leather-bag",{waitUntil:"domcontentloaded"});
  await page.locator(".product-main-photo img").waitFor();
  await page.waitForFunction(()=>{
    const image=document.querySelector(".product-main-photo img");
    return image&&image.complete&&image.naturalWidth>0;
  },null,{timeout:20000});
  await page.waitForTimeout(1550);
  const galleryStyle=await page.locator(".product-main-photo").evaluate(el=>({
    clip:getComputedStyle(el).clipPath,
    visible:getComputedStyle(el).visibility,
    width:Math.round(el.getBoundingClientRect().width),
    imageWidth:el.querySelector("img")?.naturalWidth||0
  }));
  assert.ok(galleryStyle.width>300&&galleryStyle.imageWidth>400,
   "Product gallery should show an actual high-quality image: "+JSON.stringify(galleryStyle));
  assert.ok(galleryStyle.clip==="none"||galleryStyle.clip==="inset(0px)",
   "Product frame must not be clipped: "+JSON.stringify(galleryStyle));
  await page.screenshot({path:"artifacts/edition02-product-desktop.png",fullPage:true,animations:"disabled"});
  const imagePath=await page.locator(".product-main-photo img").getAttribute("src");
  assert.ok(imagePath&&imagePath.includes("bag-main.webp"),"Outdated low-res demo product photo");
  assert.equal(errors.length,0,"Uncaught browser errors: "+errors.join(" / "));
  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const mp=await mobile.newPage();
  const mobileErrors=[];
  mp.on("pageerror",err=>mobileErrors.push(String(err)));
  await mp.goto("http://127.0.0.1:3000/",{waitUntil:"domcontentloaded"});
  await mp.locator(".ed-hero-slide.is-active").waitFor();
  await mp.locator(".maison-intro").waitFor();
  await mp.waitForTimeout(660);
  await mp.screenshot({path:"artifacts/edition02-loader-mobile.png",
    fullPage:false,animations:"allow"});
  await mp.locator('html[data-intro-state="complete"]').waitFor({timeout:16000});
  await mp.waitForTimeout(540);
  // Verify each collection photograph owns its OWN GSAP mask.
  // Previously shared-trigger callback replacement meant 01/03/04 could
  // render without a wipe while the last caption animation still passed.
  const categoryCards=mp.locator(".ed-category-tile");
  assert.equal(await categoryCards.count(),4,"Expected all four collection cards");
  for(let index=0;index<4;index++){
   const card=categoryCards.nth(index);
   await bringIntoRevealZone(card);
   await mp.waitForFunction(i=>{
    const node=document.querySelectorAll(".ed-category-tile")[i];
    return node?.getAttribute("data-photo-reveal-state")==="playing";
   },index,{timeout:4400});
   const motion=await card.evaluate(el=>({
    state:el.getAttribute("data-photo-reveal-state"),
    photoWidth:el.querySelector("img")?.naturalWidth||0,
    clip:getComputedStyle(el).clipPath
   }));
   assert.equal(motion.state,"playing","Card "+(index+1)+" photo did not run GSAP");
   assert.ok(motion.photoWidth>0,"Card "+(index+1)+" image was not decoded");
   console.log("COLLECTION PHOTO REVEAL",index+1,JSON.stringify(motion));
   if(index===0||index===2||index===3){
    // Capture an actual animation frame instead of merely testing the
    // final image. Cards that simply pop in have no measurable in-between.
    await mp.waitForTimeout(140);
    const interpolated=await card.evaluate(el=>getComputedStyle(el).clipPath);
    assert.ok(interpolated.startsWith("inset("),
     "Collection "+(index+1)+" lacks a cinematic image wipe: "+interpolated);
   }
  }
  // Verify lower editorial sections also register the photo timelines,
  // independently of their captions and text reveals.
  const photoScenes=[
   ".ed-products-section .premium-product-media",
   ".ed-lookbook-media",".ed-story-visual",".ed-story-inset",
   ".ed-mobile-chapter-photo",".ed-journal-photo",
   ".ed-admin-story-picture",".ed-secondary-banner-image"
  ];
  for(const selector of photoScenes){
   const photos=mp.locator(selector);
   if(!await photos.count())continue;
   const limit=Math.min(2,await photos.count());
   for(let index=0;index<limit;index++){
    const node=photos.nth(index);
    await bringIntoRevealZone(node);
    await mp.waitForFunction(({selector,index})=>{
     const element=document.querySelectorAll(selector)[index];
     return element?.getAttribute("data-photo-reveal-state")==="playing";
    },{selector,index},{timeout:4800});
    const status=await node.evaluate(el=>({
     state:el.getAttribute("data-photo-reveal-state"),
     ready:!!el.querySelector("img")?.naturalWidth
    }));
    assert.ok(status.ready&&status.state==="playing",
     "Missing lower editorial image reveal "+selector+": "+JSON.stringify(status));
   }
  }
  await mp.evaluate(()=>window.scrollTo(0,0));
  await mp.waitForTimeout(130);
  assert.equal(await mp.locator(".ed-quiet-strip").count(),0,
    "Redundant strip under the hero must be removed");
  const mobileHero=await mp.evaluate(()=>{
    const rect=selector=>{
      const node=document.querySelector(selector);
      if(!node)return null;
      const box=node.getBoundingClientRect();
      return {top:box.top,bottom:box.bottom,height:box.height};
    };
    return {viewport:window.innerHeight,hero:rect(".ed-hero-carousel"),
      photograph:rect(".ed-hero-visual"),copy:rect(".ed-hero-content"),
      title:rect(".ed-hero-image-caption h1"),cta:rect(".ed-hero-stable-action"),
      controls:rect(".ed-hero-progress-count"),navigation:rect(".premium-bottom-nav"),
      heroText:document.querySelector(".ed-hero-image-caption h1")?.textContent||""};
  });
  assert.ok(mobileHero.hero&&mobileHero.photograph&&mobileHero.copy&&mobileHero.navigation,
    "Mobile photo/copy/navigation must all be present");
  assert.ok(mobileHero.photograph.height>=240,"Editorial mobile photograph is too small");
  assert.ok(mobileHero.copy.height<=270,
    "The mobile hero still reserves a large empty copy panel: "+JSON.stringify(mobileHero));
  assert.ok(Math.abs(mobileHero.photograph.bottom-mobileHero.copy.top)<4,
    "Photo and text must be consecutive panels, not separate scroll chapters");
  assert.ok(mobileHero.cta.bottom<=mobileHero.navigation.top+2 &&
    mobileHero.controls.bottom<=mobileHero.navigation.top+2,
    "Mobile customer cannot see photo, copy and slide controls together: "+JSON.stringify(mobileHero));
  assert.ok(!mobileHero.heroText.includes("\\n"),
    "Hero title leaked a literal backslash-n escape");
  await mp.screenshot({path:"artifacts/edition02-mobile-hero-first-fold.png",
    fullPage:false,animations:"disabled"});
  console.log("MOBILE HERO IN ONE VIEW",JSON.stringify(mobileHero));
  for(const selector of ['.ed-categories-grid','#ed-selected','[data-scene="campaign"]',
   '[data-scene="story"]','.ed-mobile-chapters','[data-scene="journal"]','.ed-benefits']){
   const section=mp.locator(selector).first();
   if(await section.count()){
    await bringIntoRevealZone(section);
    await mp.waitForTimeout(800);
   }
  }
  // The smaller inset previously finished its animation before reaching
  // the viewport. It must be visible and independently resolved afterward.
  const inset=mp.locator(".ed-story-inset");
  await bringIntoRevealZone(inset);
  await mp.waitForTimeout(1800);
  const insetState=await inset.evaluate(el=>({
    opacity:Number(getComputedStyle(el).opacity),
    width:el.getBoundingClientRect().width,
    imageWidth:el.querySelector("img")?.naturalWidth||0
  }));
  // Next/Image serves a DPR- and layout-sized srcset image. A 119px mobile
  // inset legitimately has a 136px decoded image; absolute 250px is invalid.
  assert.ok(insetState.opacity>.92&&insetState.imageWidth>=insetState.width*.9,
    "Brand-story inset failed its own on-view photo reveal: "+JSON.stringify(insetState));
  for(const copy of await mp.locator(".ed-mobile-chapter-copy").all()){
   await bringIntoRevealZone(copy);
   await mp.waitForTimeout(1450);
   const opacity=await copy.locator("h2").evaluate(el=>Number(getComputedStyle(el).opacity));
   assert.ok(opacity>.9,"Mobile chapter headline failed to animate when visible");
  }
  await mp.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  await mp.waitForTimeout(300);
  const missedFrames=await mp.evaluate(()=>Array.from(
   document.querySelectorAll(".ed-category-tile,.ed-products-section .premium-product-media,.ed-journal-photo")
  ).filter(el=>el.getBoundingClientRect().bottom<-innerHeight*.22&&
     /100%/.test(getComputedStyle(el).clipPath)).map(el=>el.className));
  assert.deepEqual(missedFrames,[],"Some mobile photographs remained hidden after scroll");
  const skippedFooter=await mp.evaluate(()=>Array.from(
   document.querySelectorAll(".premium-footer-links a,.premium-footer-contact>span")
  ).filter(el=>el.getBoundingClientRect().bottom<-innerHeight*.22&&
   Number(getComputedStyle(el).opacity)<.95).map(el=>el.textContent?.trim()));
  assert.deepEqual(skippedFooter,[],"Passed footer links stayed invisible after fast scroll: "+skippedFooter.join(","));

  await mp.screenshot({path:"artifacts/edition02-home-mobile.png",fullPage:true,animations:"disabled"});
  // The mobile search must render live result cards directly beneath the
  // input; tapping outside should close it without submitting navigation.
  await mp.evaluate(()=>window.scrollTo(0,0));
  await mp.getByRole("button",{name:"جستجو",exact:true}).click();
  await mp.getByRole("combobox",{name:"جستجوی محصول"}).fill("کفش");
  const mobileResults=mp.locator(".premium-search-result");
  await mobileResults.first().waitFor();
  assert.ok(await mobileResults.count()>=1,
    "Mobile live search did not show any product suggestions");
  await mp.screenshot({path:"artifacts/edition02-mobile-live-search.png",
    fullPage:false,animations:"disabled"});
  await mp.mouse.click(12,720);
  await mp.waitForTimeout(400);
  assert.equal(await mp.locator(".premium-search-panel").getAttribute("aria-hidden"),"true",
    "Mobile search did not close after an outside touch");
  await mp.getByRole("button",{name:"باز کردن فهرست"}).click();
  await mp.locator(".premium-drawer-root.is-open").waitFor();
  await mp.waitForTimeout(1000);
  const objectFit=await mp.locator(".premium-drawer-image-main").evaluate(img=>getComputedStyle(img).objectFit);
  assert.equal(objectFit,"contain","Mobile Maison image crop is still cutting off the portrait");
  const closeColor=await mp.locator(".premium-drawer-head button svg").evaluate(el=>
    getComputedStyle(el).color);
  const channel=closeColor.match(/\d+(?:\.\d+)?/g)?.slice(0,3).map(Number)||[];
  if(channel.length===3)assert.ok(
    channel[2]<=channel[0]*1.12 || channel[2]<=channel[1]*1.1,
    "Maison close icon has a blue accent: "+closeColor
  );
  const visible=await mp.locator(".premium-drawer-editorial").isVisible();
  assert.ok(visible,"Mobile Maison editorial is hidden");
  const closeBorder=await mp.locator(".premium-drawer-head button").evaluate(el=>getComputedStyle(el).borderTopWidth);
  assert.equal(closeBorder,"0px","Menu close control still has a border");

  await mp.screenshot({path:"artifacts/edition02-maison-mobile.png",fullPage:false,animations:"disabled"});
  const short=await browser.newContext({viewport:{width:375,height:667},
    deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const small=await short.newPage();
  await small.goto("http://127.0.0.1:3000/",{waitUntil:"domcontentloaded"});
  await small.locator(".ed-hero-carousel").waitFor();
  await small.locator('html[data-intro-state="complete"]').waitFor({timeout:16000});
  await small.waitForTimeout(320);
  const smallView=await small.evaluate(()=>{
    const nav=document.querySelector(".premium-bottom-nav").getBoundingClientRect();
    const photo=document.querySelector(".ed-hero-visual").getBoundingClientRect();
    const copy=document.querySelector(".ed-hero-content").getBoundingClientRect();
    const cta=document.querySelector(".ed-hero-stable-action").getBoundingClientRect();
    return {navTop:nav.top,photoBottom:photo.bottom,copyBottom:copy.bottom,ctaBottom:cta.bottom};
  });
  assert.ok(smallView.copyBottom-smallView.photoBottom<=242,
    "Short-phone hero has excess unused space below the photograph: "+JSON.stringify(smallView));
  assert.ok(smallView.ctaBottom<=smallView.navTop+2 &&
    smallView.copyBottom<=smallView.navTop+2,
    "Hero is longer than one viewport on short mobile screens: "+JSON.stringify(smallView));
  await small.screenshot({path:"artifacts/edition02-mobile-hero-short-phone.png",
    fullPage:false,animations:"disabled"});
  await short.close();
  assert.equal(mobileErrors.length,0,"Mobile browser errors: "+mobileErrors.join(" / "));
  console.log("PASS: cinematic section motion, independent story inset, three slides, unified mobile hero and 667px short mobile fold.");
  await mobile.close();
  await desktop.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
