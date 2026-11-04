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
  const errors=[];
  page.on("pageerror",err=>errors.push(String(err)));
  await page.goto("http://127.0.0.1:3000/",{waitUntil:"domcontentloaded",timeout:65000});
  await page.locator(".ed-hero-slide.is-active").waitFor({timeout:20000});
  await page.waitForTimeout(1500);
  const status=await page.locator(".editorial-site").getAttribute("data-motion-status");
  assert.equal(status,"ready","GSAP motion engine failed to initialize on homepage");
  const initialSlides=await page.locator(".ed-hero-slide").count();
  assert.ok(initialSlides>=3,"Hero must have 3 editorial slides");
  const textAnimation=await page.locator(".ed-hero-copy-frame").evaluate(el=>getComputedStyle(el).animationName);
  assert.notEqual(textAnimation,"none","Hero text has no first-load animation");
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
  await page.goto("http://127.0.0.1:3000/products",{waitUntil:"domcontentloaded"});
  await page.locator(".collection-heading").waitFor();
  await page.waitForTimeout(800);
  assert.equal(await page.locator(".editorial-page-shell").getAttribute("data-page-motion"),"ready");
  await page.screenshot({path:"artifacts/edition02-collection-desktop.png",fullPage:true,animations:"disabled"});
  await page.goto("http://127.0.0.1:3000/product/minimal-leather-bag",{waitUntil:"domcontentloaded"});
  await page.locator(".product-main-photo img").waitFor();
  await page.waitForTimeout(850);
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
  await mp.screenshot({path:"artifacts/edition02-home-mobile.png",fullPage:true,animations:"disabled"});
  await mp.getByRole("button",{name:"باز کردن فهرست"}).click();
  await mp.locator(".premium-drawer-root.is-open").waitFor();
  await mp.waitForTimeout(1000);
  const objectFit=await mp.locator(".premium-drawer-image-main").evaluate(img=>getComputedStyle(img).objectFit);
  assert.equal(objectFit,"contain","Mobile Maison image crop is still cutting off the portrait");
  const visible=await mp.locator(".premium-drawer-editorial").isVisible();
  assert.ok(visible,"Mobile Maison editorial is hidden");
  await mp.screenshot({path:"artifacts/edition02-maison-mobile.png",fullPage:false,animations:"disabled"});
  assert.equal(mobileErrors.length,0,"Mobile browser errors: "+mobileErrors.join(" / "));
  console.log("PASS: real browser rendered GSAP, carousel, local high-resolution product photo, inner page and uncropped mobile menu.");
  await mobile.close();
  await desktop.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
