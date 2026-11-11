import Link from "next/link";
import {FrameImage} from "@/components/FrameImage";
import {ArrowLeft, ArrowUpLeft, Headphones, PackageCheck, Truck, ShieldCheck} from "lucide-react";
import {loadStore,type StoreCategory} from "@/lib/live-store";
import {ProductCard} from "@/components/ProductCard";
import type {Product} from "@/lib/catalog";
import {targetUrl} from "@/lib/edition-two-content";
import {editionTwoDefaults} from "@/lib/admin/edition-two";
import {EditorialMotion} from "@/components/EditorialMotion";
import {HeroCarousel,type EditorialSlide} from "@/components/HeroCarousel";

const editorialImages:Record<string,string>={
  clothing:"/images/editorial/category-clothing.webp",
  bags:"/images/editorial/category-bags.webp",
  shoes:"/images/editorial/category-shoes.webp",
  accessories:"/images/editorial/category-accessories.webp",
};
const fallbackEditorial={
  hero:"/images/editorial/chapter-detail.webp",
  portrait:"/images/editorial/story-portrait.webp",
  bag:"/images/editorial/story-detail.webp",
};
// Only replace legacy *demo* imagery; uploaded merchant photography is
// always authoritative. Old demo paths explain why some live sections kept
// showing low-resolution pictures despite replacing the local fallbacks.
const legacyDemoArt=new Set([
 "/images/editorial-hero.webp","/images/editorial-portrait.webp",
 "/images/editorial-bag.webp","/images/bag.webp","/images/linen-shirt.webp",
 "/images/sneakers.webp","/images/sunglasses.webp","/images/classic-watch.webp",
]);
const editorialPhoto=(url:string|null|undefined,fallback:string)=>
 url&&!legacyDemoArt.has(url)?url:fallback;
function categoryImage(category:StoreCategory){
  const fallback=editorialImages[category.id];
  // A custom image from the admin overrides the template's editorial demo photography.
  const isStock=category.image.startsWith("/images/")&&[
    "/images/linen-shirt.webp","/images/bag.webp","/images/sneakers.webp","/images/sunglasses.webp"
  ].includes(category.image);
  return isStock&&fallback?fallback:category.image||fallback||"/images/editorial/category-accessories.webp";
}
export default async function Home(){
  const store=await loadStore();
  const edition=store.settings.editorialConfig;
  const festival=edition?.festival??editionTwoDefaults.festival;
  const sections=[...(store.settings.homeSections||[])].filter(section=>section.enabled).sort((a,b)=>a.position-b.position);
  const hero=sections[0];
  const heroImage=editorialPhoto(hero?.imageUrl,fallbackEditorial.hero);
  const heroMobileImage=editorialPhoto(hero?.mobileImageUrl,(hero?.imageUrl&&!legacyDemoArt.has(hero.imageUrl))?heroImage:fallbackEditorial.hero);
  // The old 2:3 campaign portraits were heavily cropped in the new wide hero.
  // Use locally hosted landscape art for demo imagery while retaining merchant uploads.
  const heroWide=(image:string,landscape:string)=>[
   "/images/editorial/hero-main.webp","/images/editorial/hero-mobile.webp",
   "/images/editorial/story-portrait.webp","/images/editorial/campaign.webp"
  ].includes(image)?landscape:image;
  const featured=store.products.filter(p=>p.featured).slice(0,4);
  const collection=featured.length>=4?featured:store.products.slice(0,4);
  const firstBanner=store.banners[0];
  const selectedProducts=edition?.featured.productIds.length?edition.featured.productIds.map(id=>store.products.find(p=>p.id===id)).filter((p):p is Product=>Boolean(p)).slice(0,4):collection;
  const selectedCategories=edition?edition.categories.items.map(item=>({category:store.categories.find(c=>c.dbId===item.categoryId||c.id===item.categoryId),image:item.imageUrl})).filter(x=>Boolean(x.category)):store.categories.slice(0,4).map(category=>({category,image:undefined}));
  const selectedArticles=edition?.journal.articleIds.length?edition.journal.articleIds.map(id=>store.articles.find(a=>a.id===id)).filter((a):a is (typeof store.articles)[number]=>Boolean(a)):store.articles;
  const otherBanners=store.banners.slice(1,2); // One supporting banner keeps the homepage focused.
  const lookbookImage=edition?.campaign.imageUrl||editorialPhoto(firstBanner?.imageUrl,"/images/editorial/campaign.webp");
  const editorialHeading=sections[1];
  const storyImage=edition?.story.imageUrl||editorialPhoto(editorialHeading?.imageUrl,"/images/editorial/story-portrait.webp");
  const storyDetail=edition?.story.secondaryImageUrl||editorialPhoto(editorialHeading?.secondaryImageUrl,"/images/editorial/story-detail.webp");
  const storyCta=edition?targetUrl(edition.story.target,store):editorialHeading?.ctaHref?.startsWith("/")?editorialHeading.ctaHref:"/info/about";
  const heading=hero?.title||"زیبایی در سادگی\nاتفاق می‌افتد.";
  const heroCta=hero?.ctaHref?.startsWith("/")?hero.ctaHref:"/products";
  const heroSlides:EditorialSlide[]=edition?edition.hero.filter(slide=>slide.enabled).map(slide=>({
   id:slide.id,image:slide.imageUrl||fallbackEditorial.hero,mobileImage:slide.mobileImageUrl||slide.imageUrl,
   title:slide.title,description:slide.description,eyebrow:slide.eyebrow,ctaLabel:slide.ctaLabel,
   ctaHref:targetUrl(slide.target,store),hasCta:slide.target.kind!=="none",alt:slide.title
  })):[

   {id:"edition-primary",image:heroWide(heroImage,fallbackEditorial.hero),mobileImage:heroWide(heroMobileImage,fallbackEditorial.hero),title:heading,
    description:hero?.description||"انتخاب‌هایی برای کسانی که زیبایی را در جزئیات پیدا می‌کنند؛ ساده، ماندگار و به دور از تکرار.",
    eyebrow:"کالکشن منتخب فصل",ctaLabel:hero?.ctaLabel||"کشف کالکشن",ctaHref:heroCta,alt:"کمپین اصلی کالکشن ادیتوریال"},
   {id:"edition-form",image:heroWide(storyImage,"/images/editorial/story-detail.webp"),mobileImage:heroWide(storyImage,"/images/editorial/story-detail.webp"),title:editorialHeading?.title||"فرم‌های ساده.\nاثر ماندگار.",
    description:editorialHeading?.description||"آرامش در فرم و کیفیت در انتخاب؛ نگاهی تازه به استایل هر روز.",
    eyebrow:"روایت دوم / فرم و سبک",ctaLabel:editorialHeading?.ctaLabel||"کشف داستان",ctaHref:storyCta,alt:"عکاسی مد با پالت خنثی"},
   {id:"edition-details",image:heroWide(lookbookImage,"/images/editorial/category-bags.webp"),mobileImage:heroWide(lookbookImage,"/images/editorial/chapter-detail.webp"),title:firstBanner?.title||"زیبایی در\nجزئیات است.",
    description:firstBanner?.subtitle||"بافت، متریال و جزئیاتی که انتخاب‌های ماندگار را از دیگران متمایز می‌کنند.",
    eyebrow:"روایت سوم / هنر جزئیات",ctaLabel:"دیدن کالکشن",ctaHref:firstBanner?.target?targetUrl(firstBanner.target,store):firstBanner?.linkUrl?.startsWith("/")?firstBanner.linkUrl:"/category/bags",alt:"تصویر کمپین سینمایی مد"}
  ]; // Always retain all three stories; even matching merchant photos have distinct copy.


  return <EditorialMotion>
    <div className="ed-home">
      <HeroCarousel slides={heroSlides}/>

      <section className="ed-categories-section premium-container" id="ed-categories" data-scene="categories">
        <div className="ed-section-heading" data-reveal="up">
          <div><span className="premium-eyebrow">EXPLORE THE EDITION / 01</span><h2>{edition?.categories.title||<>کالکشن را <em>کشف کنید</em></>}</h2></div>
          <Link href="/products" className="ed-inline-link">تمام محصولات <ArrowUpLeft size={18}/></Link>
        </div>
        <div className="ed-categories-grid" data-editorial-grid>
          {selectedCategories.map((entry,index)=>{
            const category=entry.category!;
            const image=entry.image||categoryImage(category);
            return <Link href={`/category/${category.id}`} key={category.id} className={`ed-category-tile ed-cat-${index+1}`} data-editorial-frame>
              <span className="ed-category-image-stage" aria-hidden="true"><FrameImage src={image} alt="" fill loading="eager" decoding="async" sizes="(max-width: 760px) 50vw, 25vw" unoptimized={image.startsWith("http")} className="ed-category-photo"/></span>
              <div className="ed-category-overlay"/>
              <div className="ed-category-caption"><span>0{index+1} / CATEGORY</span><h3>{category.name}</h3></div>
              <span className="ed-category-arrow"><ArrowUpLeft size={18}/></span>
            </Link>;
          })}
        </div>
      </section>

      <section className="ed-products-section premium-container" id="ed-selected" data-scene="products">
        <div className="ed-section-heading" data-reveal="up"><div><span className="premium-eyebrow">THE SELECTED PIECES / 02</span><h2>{edition?.featured.title||<>منتخب <em>این فصل</em></>}</h2><p>{edition?.featured.description||"قطعاتی برای امروز؛ انتخاب‌هایی برای سال‌های بعد."}</p></div><Link href="/products" className="ed-inline-link">مشاهده مجموعه <ArrowUpLeft size={18}/></Link></div>
        <div className="ed-featured-grid" data-stagger>{selectedProducts.map(product=><ProductCard key={product.id} product={product}/>)}</div>
      </section>

      <section className="ed-lookbook ed-full-bleed" aria-labelledby="ed-lookbook-title" data-campaign data-scene="campaign">
        <div className="ed-lookbook-media" data-editorial-frame data-image-wipe><FrameImage src={lookbookImage} alt={firstBanner?.title||"کالکشن کیف و اکسسوری چرمی"} fill sizes="100vw" unoptimized={lookbookImage.startsWith("http")} className="ed-lookbook-photo" data-parallax/></div>
        
        <div className="ed-lookbook-copy">
          <span className="premium-eyebrow">THE ART OF DETAILS / 03</span>
          <h2 id="ed-lookbook-title">{edition?.campaign.title||firstBanner?.title||"جزئیاتی که\nتفاوت می‌سازند."}</h2>
          <p>{edition?.campaign.description||firstBanner?.subtitle||"یک اکسسوری خوب، فقط یک انتخاب نیست؛ امضای سبک شخصی شماست. طراحی‌هایی که هر روز همراهتان می‌مانند."}</p>
          {edition?.campaign.target.kind!=="none"&&<Link href={edition?targetUrl(edition.campaign.target,store):firstBanner?.target?targetUrl(firstBanner.target,store):firstBanner?.linkUrl?.startsWith("/")?firstBanner.linkUrl:"/category/bags"} className="ed-light-button">{edition?.campaign.ctaLabel||"دیدن کالکشن"} <ArrowUpLeft size={18}/></Link>}
          
        </div>
      </section>


      {festival.enabled&&<section className="ed2-seasonal-festival premium-container" aria-labelledby="ed2-festival-title" data-scene="festival">
        <div className="ed2-festival-image" data-image-wipe data-editorial-frame>
          <picture className="ed2-festival-picture"><source media="(max-width:760px)" srcSet={festival.mobileImageUrl||festival.imageUrl||"/images/editorial/campaign.webp"}/><FrameImage src={festival.imageUrl||"/images/editorial/campaign.webp"} alt={festival.title}
            fill sizes="(max-width: 760px) 100vw, 55vw" unoptimized={festival.imageUrl.startsWith("http")} className="ed2-festival-photo"/></picture>
        </div>
        <div className="ed2-festival-copy" data-reveal="up">
          <span className="premium-eyebrow">{festival.eyebrow}</span>
          <span className="ed2-festival-rule" aria-hidden="true"/>
          <h2 id="ed2-festival-title">{festival.title}</h2>
          <p>{festival.description}</p>
          {festival.target.kind!=="none"&&<Link href={targetUrl(festival.target,store)} className="ed2-festival-link">{festival.ctaLabel||"کشف انتخاب‌ها"} <ArrowUpLeft size={18}/></Link>}
          <span className="ed2-festival-caption">A MOMENT IN THE EDITION / 2026</span>
        </div>
      </section>}
      <section className="ed-editorial-story premium-container" data-scene="story">
        <div className="ed-story-collage" data-reveal="right">
          <div className="ed-story-visual" data-editorial-frame data-image-wipe><FrameImage src={storyImage} alt={editorialHeading?.title||"استایل کلاسیک و مینیمال"} fill sizes="(max-width: 760px) 100vw, 47vw" unoptimized={storyImage.startsWith("http")} className="ed-story-photo"/><span>AN EDITORIAL PERSPECTIVE</span></div>
          <div className="ed-story-inset" data-editorial-frame data-story-inset><FrameImage src={storyDetail} alt="جزئیات استایل" fill sizes="(max-width: 760px) 35vw, 17vw" unoptimized={storyDetail.startsWith("http")}/></div>
          
        </div>
        <div className="ed-story-copy" data-reveal="left"><span className="premium-eyebrow">A NOTE ON STYLE / 04</span><h2>{edition?.story.title||editorialHeading?.title||"کمتر انتخاب کن.\nبهتر انتخاب کن."}</h2><div className="ed-story-rule"/><p>{edition?.story.description||editorialHeading?.description||"برای ما، استایل یعنی ترکیب سادگی و شخصیت. انتخاب‌هایی باکیفیت که برای مد زودگذر ساخته نشده‌اند و در هر فصل همراهتان هستند."}</p>{edition?.story.target.kind!=="none"&&<Link href={storyCta} className="ed-inline-link">{edition?.story.ctaLabel||editorialHeading?.ctaLabel||"داستان این نگاه"} <ArrowUpLeft size={18}/></Link>}</div>
      </section>

      <section className="ed-chapter" data-chapter aria-label="روایت تصویری کالکشن">
        <div className="ed-chapter-scene" data-chapter-scene>
          <div className="ed-chapter-photographs">
            <div className="ed-chapter-frame" data-chapter-frame data-chapter-intro><FrameImage src={edition?.chapters[0]?.imageUrl||"/images/editorial/chapter-form.webp"} alt="فصل اول: فرم و استایل ماندگار" fill sizes="60vw" unoptimized={Boolean(edition?.chapters[0]?.imageUrl?.startsWith("http"))}/></div>
            <div className="ed-chapter-frame" data-chapter-frame><FrameImage src={edition?.chapters[1]?.imageUrl||"/images/editorial/chapter-detail.webp"} alt="فصل دوم: جزئیات و نور" fill sizes="60vw" unoptimized={Boolean(edition?.chapters[1]?.imageUrl?.startsWith("http"))}/></div>
            
          </div>
          <div className="ed-chapter-narrative">
            <span className="premium-eyebrow">AN EDITORIAL STUDY / 02</span>
            <div className="ed-chapter-words">
              <div className="ed-chapter-copy" data-chapter-copy><span>CHAPTER 01 — FORM</span><h2>{edition?.chapters[0]?.title||editorialHeading?.title||"هر انتخاب، یک روایت."}</h2><p>{edition?.chapters[0]?.description||editorialHeading?.description||"زیبایی واقعی از جنس جزئیاتی است که با دقت کنار هم قرار می‌گیرند."}</p></div>
              <div className="ed-chapter-copy" data-chapter-copy><span>CHAPTER 02 — DETAIL</span><h2>{edition?.chapters[1]?.title||firstBanner?.title||"کیفیتی که می‌ماند."}</h2><p>{edition?.chapters[1]?.description||firstBanner?.subtitle||"طرح‌های ماندگار و کیفیتی که در هر فصل همراه شماست."}</p></div>
            </div>
            <div className="ed-chapter-progress"><span data-chapter-progress/></div>
            <div className="ed-chapter-footer"><span>01</span><span>02</span></div>
          </div>
        </div>
      </section>

      <section className="ed-mobile-chapters" aria-label="دو فصل تصویری کالکشن">
        <article className="ed-mobile-chapter" data-reveal="up">
          <div className="ed-mobile-chapter-photo" data-editorial-frame data-image-wipe><FrameImage src={edition?.chapters[0]?.mobileImageUrl||edition?.chapters[0]?.imageUrl||"/images/editorial/chapter-form.webp"} alt="فصل فرم؛ استایل آرام و ماندگار" fill sizes="100vw" unoptimized={Boolean(edition?.chapters[0]?.imageUrl?.startsWith("http"))}/></div>
          <div className="ed-mobile-chapter-copy"><span className="premium-eyebrow">CHAPTER 01 / FORM</span><h2>{edition?.chapters[0]?.title||editorialHeading?.title||"هر انتخاب، یک روایت."}</h2><p>{edition?.chapters[0]?.description||editorialHeading?.description||"زیبایی واقعی از جنس جزئیاتی است که با دقت کنار هم قرار می‌گیرند."}</p></div>
        </article>
        <article className="ed-mobile-chapter" data-reveal="up">
          <div className="ed-mobile-chapter-photo" data-editorial-frame data-image-wipe><FrameImage src={edition?.chapters[1]?.mobileImageUrl||edition?.chapters[1]?.imageUrl||"/images/editorial/chapter-detail.webp"} alt="فصل جزئیات؛ نور و کیفیت" fill sizes="100vw" unoptimized={Boolean(edition?.chapters[1]?.imageUrl?.startsWith("http"))}/></div>
          <div className="ed-mobile-chapter-copy"><span className="premium-eyebrow">CHAPTER 02 / DETAIL</span><h2>{edition?.chapters[1]?.title||firstBanner?.title||"کیفیتی که می‌ماند."}</h2><p>{edition?.chapters[1]?.description||firstBanner?.subtitle||"انتخاب‌هایی که هر فصل، بخشی از سبک شخصی شما می‌مانند."}</p></div>
        </article>
      </section>

      {(edition?[]:sections.slice(2)).map((section,index)=><section className={`ed-admin-story premium-container ${index%2?"is-reversed":""} ${section.layout?`ed-layout-${section.layout}`:""}`} data-motion={section.animation||"mask"} key={section.id}>
        {section.imageUrl&&<div className="ed-admin-story-picture" data-editorial-frame data-reveal={index%2?"left":"right"} data-image-wipe><FrameImage src={section.imageUrl} alt={section.title} fill sizes="(max-width: 760px) 100vw, 45vw" unoptimized={section.imageUrl.startsWith("http")}/>
          {section.secondaryImageUrl&&<span className="ed-admin-story-detail" data-editorial-frame><FrameImage src={section.secondaryImageUrl} alt="" fill sizes="(max-width:760px) 30vw, 15vw" unoptimized={section.secondaryImageUrl.startsWith("http")}/></span>}
        </div>}
        <div className="ed-admin-story-copy" data-reveal={index%2?"right":"left"}><span className="premium-eyebrow">CURATED STORY / {String(index+5).padStart(2,"0")}</span><h2>{section.title}</h2><p>{section.description}</p><Link href={section.ctaHref?.startsWith("/")?section.ctaHref:"/products"} className="ed-inline-link">{section.ctaLabel||"کشف بیشتر"} <ArrowUpLeft size={18}/></Link></div>
      </section>)}

      {otherBanners.map((banner,index)=><section key={banner.id} className="ed-secondary-banner premium-container" data-reveal="up"><div><span className="premium-eyebrow">DISCOVER THE COLLECTION / {String(index+6).padStart(2,"0")}</span><h2>{banner.title}</h2><p>{banner.subtitle}</p><Link href={banner.target?targetUrl(banner.target,store):banner.linkUrl?.startsWith("/")?banner.linkUrl:"/products"} className="ed-dark-button">مشاهده بیشتر <ArrowUpLeft size={18}/></Link></div>{banner.imageUrl&&<div className="ed-secondary-banner-image" data-editorial-frame><FrameImage src={editorialPhoto(banner.imageUrl,"/images/editorial/campaign.webp")} alt={banner.title} fill unoptimized sizes="(max-width: 760px) 100vw, 50vw"/></div>}</section>)}

      <section className="ed-journal premium-container" data-journal data-scene="journal">
        <div className="ed-section-heading"><div><span className="premium-eyebrow">THE JOURNAL / 05</span><h2>{edition?.journal.title||<>از نگاه <em>ژورنال</em></>}</h2></div><Link href="/blog" className="ed-inline-link">ورود به ژورنال <ArrowUpLeft size={18}/></Link></div>
        <div className="ed-journal-grid" data-stagger>
          <Link href={selectedArticles[0]?`/blog/${selectedArticles[0].slug}`:"/blog"} className="ed-journal-card"><div className="ed-journal-photo" data-editorial-frame><FrameImage src={editorialPhoto(selectedArticles[0]?.coverUrl,"/images/editorial/journal-style.webp")} alt="نگاهی به هنر پوشیدن" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={Boolean(selectedArticles[0]?.coverUrl?.startsWith("http"))}/></div><div className="ed-journal-meta">THE JOURNAL — 01</div><h3>{selectedArticles[0]?.title||"هنر ساختن یک استایل ماندگار"}</h3><p>{selectedArticles[0]?.summary||"از پارچه‌ها و فرم‌ها تا ظرافت‌هایی که در نگاه اول دیده نمی‌شوند."}</p><span>ادامه مطلب <ArrowUpLeft size={17}/></span></Link>
          <Link href={selectedArticles[1]?`/blog/${selectedArticles[1].slug}`:"/info/about"} className="ed-journal-card"><div className="ed-journal-photo" data-editorial-frame><FrameImage src={editorialPhoto(selectedArticles[1]?.coverUrl,"/images/editorial/journal-details.webp")} alt="جزئیات و اکسسوری‌ها" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={Boolean(selectedArticles[1]?.coverUrl?.startsWith("http"))}/></div><div className="ed-journal-meta">THE JOURNAL — 02</div><h3>{selectedArticles[1]?.title||"چرا جزئیات، مهم‌ترین بخش استایل‌اند؟"}</h3><p>{selectedArticles[1]?.summary||"روایتی کوتاه از نقش انتخاب‌های کوچک در شخصیت یک استایل."}</p><span>بیشتر بخوانید <ArrowUpLeft size={17}/></span></Link>
        </div>
      </section>

      <section className="ed-benefits premium-container" data-reveal="up" aria-label="خدمات فروشگاه">
        {(edition?.benefits||[
          {id:"shipping",title:"روش‌های ارسال متنوع",description:"انتخاب روش ارسال هنگام ثبت سفارش",icon:"truck"},
          {id:"products",title:"جزئیات شفاف محصولات",description:"قیمت و موجودی متصل به پنل",icon:"package"},
          {id:"support",title:"پشتیبانی و همراهی",description:"اطلاعات تماس از پنل مدیریت",icon:"headphones"}
        ]).map(x=><div key={x.id}>
         {x.icon==="truck"?<Truck size={25} strokeWidth={1.35}/>:x.icon==="package"?<PackageCheck size={25} strokeWidth={1.35}/>:x.icon==="shield"?<ShieldCheck size={25} strokeWidth={1.35}/>:<Headphones size={25} strokeWidth={1.35}/>}
         <strong>{x.title}</strong><span>{x.description}</span>
        </div>)}
      </section>
      
    </div>
  </EditorialMotion>;
}
