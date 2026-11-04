/* Browser-level verification of rendered motion and mobile UX (CI only).
 * Captures exact screenshots; does not depend on external admin or AI APIs.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {chromium}=require("playwright");
(async()=>{
 fs.mkdirSync("artifacts",{recursive:true});
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const page=await desktop.newPage();
  await page.clock.install();
  const errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  await page.goto("http://127.0.0.1:3000/",{waitUntil:"domcontentloaded",timeout:65000});
  await page.locator(".ed-hero-slide.is-active").waitFor({timeout:20000});
  await page.waitForTimeout(1500);
  const status=await page.locator(".editorial-site").getAttribute("data-motion-status");
  assert.equal(status,"ready","GSAP motion engine failed to initialize on homepage");
  const initialSlides=await page.locator(".ed-hero-slide").count();
  assert.ok(initialSlides>=3,"Hero must have 3 editorial slides");
  // A resting pointer previously froze the interval forever. Real simulated
  // clock advancement verifies auto-change, explicit pause, and resume.
  await page.locator(".ed-hero-carousel").hover();
  const heroIndex=()=>page.locator(".ed-hero-slide").evaluateAll(els=>
    els.findIndex(el=>el.classList.contains("is-active")));
  const firstSlide=await heroIndex();
  await page.clock.fastForward(9150);
  await page.waitForTimeout(90);
  const secondSlide=await heroIndex();
  assert.notEqual(secondSlide,firstSlide,"Autoplay must advance while hovering the hero");
  await page.locator(".ed-carousel-play").click();
  await page.clock.fastForward(9150);
  await page.waitForTimeout(70);
  assert.equal(await heroIndex(),secondSlide,"Explicit pause must stop autoplay");
  await page.locator(".ed-carousel-play").click();
  const textAnimation=await page.locator(".ed-hero-copy-frame").evaluate(el=>getComputedStyle(el).animationName);
  assert.notEqual(textAnimation,"none","Hero text has no first-load animation");
  // Scroll every sequence as a real visitor would: full-page screenshots
  // taken before ScrollTrigger enters the viewport incorrectly look blank.
  const scenes=['.ed-categories-grid','#ed-selected','[data-scene="campaign"]',
    '[data-scene="story"]','.ed-chapter','[data-scene="journal"]','.ed-benefits'];
  for(const selector of scenes){
    const item=page.locator(selector).first();
    if(await item.count()){
      await item.scrollIntoViewIfNeeded({timeout:20000});
      await page.waitForTimeout(1250);
    }
  }
  await page.screenshot({path:"artifacts/edition02-home-desktop.png",fullPage:true,animations:"disabled"});
  await page.getByRole("button",{name:"اسلاید بعدی"}).click();
  await page.waitForTimeout(1600);
  const active=await page.locator(".ed-hero-slide.is-active").count();
  assert.equal(active,1,"Hero carousel has an invalid active scene");
  await page.locator(".ed-categories-grid").scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  const category=await page.locator(".ed-category-tile").first().evaluate(el=>({
   clip:getComputedStyle(el).clipPath,
   transform:getComputedStyle(el).transform
  }));
  console.log("HOME GSAP",status,"hero animation",textAnimation,"category",category);
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
  await mp.waitForTimeout(1500);
  const quiet=mp.locator(".ed-quiet-strip");
  const quietInitial=await quiet.locator("span").first().evaluate(el=>
    Number(getComputedStyle(el).opacity));
  assert.ok(quietInitial<.9,"Under-hero interlude animated before it entered the mobile viewport");
  await quiet.scrollIntoViewIfNeeded();
  await mp.waitForTimeout(1450);
  const quietVisible=await quiet.locator("span").first().evaluate(el=>
    Number(getComputedStyle(el).opacity));
  assert.ok(quietVisible>.92,"Under-hero interlude never appeared on entering viewport");
  for(const selector of ['.ed-categories-grid','#ed-selected','[data-scene="campaign"]',
   '[data-scene="story"]','.ed-mobile-chapters','[data-scene="journal"]','.ed-benefits']){
   const section=mp.locator(selector).first();
   if(await section.count()){
    await section.scrollIntoViewIfNeeded({timeout:20000});
    await mp.waitForTimeout(800);
   }
  }
  for(const copy of await mp.locator(".ed-mobile-chapter-copy").all()){
   await copy.scrollIntoViewIfNeeded();
   await mp.waitForTimeout(1450);
   const opacity=await copy.locator("h2").evaluate(el=>Number(getComputedStyle(el).opacity));
   assert.ok(opacity>.9,"Mobile chapter headline failed to animate when visible");
  }
  await mp.screenshot({path:"artifacts/edition02-home-mobile.png",fullPage:true,animations:"disabled"});
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
  await mp.screenshot({path:"artifacts/edition02-maison-mobile.png",fullPage:false,animations:"disabled"});
  assert.equal(mobileErrors.length,0,"Mobile browser errors: "+mobileErrors.join(" / "));
  console.log("PASS: real browser rendered GSAP, carousel, local high-resolution product photo, inner page and uncropped mobile menu.");
  await mobile.close();
  await desktop.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
