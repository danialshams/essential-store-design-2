import Link from "next/link";
import Image from "next/image";
import {ArrowLeft, ArrowUpLeft, Headphones, PackageCheck, RotateCcw, Truck} from "lucide-react";
import {loadStore,type StoreCategory} from "@/lib/live-store";
import {ProductCard} from "@/components/ProductCard";
import {EditorialMotion} from "@/components/EditorialMotion";
import {HeroCarousel,type EditorialSlide} from "@/components/HeroCarousel";

const editorialImages:Record<string,string>={
  clothing:"/images/editorial/category-clothing.webp",
  bags:"/images/editorial/category-bags.webp",
  shoes:"/images/editorial/category-shoes.webp",
  accessories:"/images/editorial/category-accessories.webp",
};
const fallbackEditorial={
  hero:"/images/editorial/hero-main.webp",
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
  return isStock&&fallback?fallback:category.image||fallback||"/images/editorial-bag.webp";
}
export default async function Home(){
  const store=await loadStore();
  const sections=[...(store.settings.homeSections||[])].filter(section=>section.enabled).sort((a,b)=>a.position-b.position);
  const hero=sections[0];
  const heroImage=editorialPhoto(hero?.imageUrl,fallbackEditorial.hero);
  const heroMobileImage=editorialPhoto(hero?.mobileImageUrl,(hero?.imageUrl&&!legacyDemoArt.has(hero.imageUrl))?heroImage:"/images/editorial/hero-mobile.webp");
  const featured=store.products.filter(p=>p.featured).slice(0,4);
  const collection=featured.length>=4?featured:store.products.slice(0,4);
  const nextProducts=store.products.filter(p=>!collection.some(x=>x.id===p.id)).slice(0,4);
  const firstBanner=store.banners[0];
  const otherBanners=store.banners.slice(1);
  const lookbookImage=editorialPhoto(firstBanner?.imageUrl,"/images/editorial/campaign.webp");
  const editorialHeading=sections[1];
  const storyImage=editorialPhoto(editorialHeading?.imageUrl,"/images/editorial/story-portrait.webp");
  const storyDetail=editorialPhoto(editorialHeading?.secondaryImageUrl,"/images/editorial/story-detail.webp");
  const storyCta=editorialHeading?.ctaHref?.startsWith("/")?editorialHeading.ctaHref:"/info/about";
  const heading=hero?.title||"زیبایی در سادگی\nاتفاق می‌افتد.";
  const heroCta=hero?.ctaHref?.startsWith("/")?hero.ctaHref:"/products";
  const heroSlides:EditorialSlide[]=[
   {id:"edition-primary",image:heroImage,mobileImage:heroMobileImage,title:heading,
    description:hero?.description||"انتخاب‌هایی برای کسانی که زیبایی را در جزئیات پیدا می‌کنند؛ ساده، ماندگار و به دور از تکرار.",
    eyebrow:"کالکشن منتخب فصل",ctaLabel:hero?.ctaLabel||"کشف کالکشن",ctaHref:heroCta,alt:"کمپین اصلی کالکشن ادیتوریال"},
   {id:"edition-form",image:storyImage,mobileImage:storyImage,title:editorialHeading?.title||"فرم‌های ساده.\\nاثر ماندگار.",
    description:editorialHeading?.description||"آرامش در فرم و کیفیت در انتخاب؛ نگاهی تازه به استایل هر روز.",
    eyebrow:"روایت دوم / فرم و سبک",ctaLabel:editorialHeading?.ctaLabel||"کشف داستان",ctaHref:storyCta,alt:"عکاسی مد با پالت خنثی"},
   {id:"edition-details",image:lookbookImage,mobileImage:lookbookImage,title:firstBanner?.title||"زیبایی در\\nجزئیات است.",
    description:firstBanner?.subtitle||"بافت، متریال و جزئیاتی که انتخاب‌های ماندگار را از دیگران متمایز می‌کنند.",
    eyebrow:"روایت سوم / هنر جزئیات",ctaLabel:"دیدن کالکشن",ctaHref:firstBanner?.linkUrl?.startsWith("/")?firstBanner.linkUrl:"/category/bags",alt:"تصویر کمپین سینمایی مد"}
  ].filter((slide,index,array)=>array.findIndex(x=>x.image===slide.image)===index);


  return <EditorialMotion>
    <div className="ed-home">
      <HeroCarousel slides={heroSlides}/>

      <div className="ed-quiet-strip" aria-label="هویت کالکشن"><span>ESSENTIAL — AN EDITORIAL WARDROBE</span><span className="ed-quiet-strip-line"/><span>ISSUE NO. 02 / 2026</span></div>

      <section className="ed-categories-section premium-container" id="ed-categories" data-scene="categories">
        <div className="ed-section-heading" data-reveal="up">
          <div><span className="premium-eyebrow">EXPLORE THE EDITION / 01</span><h2>کالکشن را <em>کشف کنید</em></h2></div>
          <Link href="/products" className="ed-inline-link">تمام محصولات <ArrowUpLeft size={18}/></Link>
        </div>
        <div className="ed-categories-grid" data-editorial-grid>
          {store.categories.slice(0,4).map((category,index)=>{
            const image=categoryImage(category);
            return <Link href={`/category/${category.id}`} key={category.id} className={`ed-category-tile ed-cat-${index+1}`}>
              <Image src={image} alt={category.name} fill sizes="(max-width: 760px) 50vw, 25vw" unoptimized={image.startsWith("http")} className="ed-category-photo"/>
              <div className="ed-category-overlay"/>
              <div className="ed-category-caption"><span>0{index+1} / CATEGORY</span><h3>{category.name}</h3></div>
              <span className="ed-category-arrow"><ArrowUpLeft size={18}/></span>
            </Link>;
          })}
        </div>
      </section>

      <section className="ed-products-section premium-container" id="ed-selected" data-scene="products">
        <div className="ed-section-heading" data-reveal="up"><div><span className="premium-eyebrow">THE SELECTED PIECES / 02</span><h2>منتخب <em>این فصل</em></h2><p>قطعاتی برای امروز؛ انتخاب‌هایی برای سال‌های بعد.</p></div><Link href="/products" className="ed-inline-link">مشاهده مجموعه <ArrowUpLeft size={18}/></Link></div>
        <div className="ed-featured-grid" data-stagger>{collection.map(product=><ProductCard key={product.id} product={product}/>)}</div>
      </section>

      <section className="ed-lookbook ed-full-bleed" aria-labelledby="ed-lookbook-title" data-campaign data-scene="campaign">
        <div className="ed-lookbook-media" data-image-wipe><Image src={lookbookImage} alt={firstBanner?.title||"کالکشن کیف و اکسسوری چرمی"} fill sizes="100vw" unoptimized={lookbookImage.startsWith("http")} className="ed-lookbook-photo" data-parallax/></div>
        
        <div className="ed-lookbook-copy">
          <span className="premium-eyebrow">THE ART OF DETAILS / 03</span>
          <h2 id="ed-lookbook-title">{firstBanner?.title||"جزئیاتی که\nتفاوت می‌سازند."}</h2>
          <p>{firstBanner?.subtitle||"یک اکسسوری خوب، فقط یک انتخاب نیست؛ امضای سبک شخصی شماست. طراحی‌هایی که هر روز همراهتان می‌مانند."}</p>
          <Link href={firstBanner?.linkUrl?.startsWith("/")?firstBanner.linkUrl:"/category/bags"} className="ed-light-button">دیدن کالکشن <ArrowUpLeft size={18}/></Link>
          <span className="ed-lookbook-ordinal">ESSENTIAL / CHAPTER NO. 02</span>
        </div>
      </section>

      <section className="ed-editorial-story premium-container" data-scene="story">
        <div className="ed-story-collage" data-reveal="right">
          <div className="ed-story-visual" data-image-wipe><Image src={storyImage} alt={editorialHeading?.title||"استایل کلاسیک و مینیمال"} fill sizes="(max-width: 760px) 100vw, 47vw" unoptimized={storyImage.startsWith("http")} className="ed-story-photo"/><span>AN EDITORIAL PERSPECTIVE</span></div>
          <div className="ed-story-inset"><Image src={storyDetail} alt="جزئیات استایل" fill sizes="(max-width: 760px) 35vw, 17vw" unoptimized={storyDetail.startsWith("http")}/></div>
          <span className="ed-story-edge">THE ART OF GETTING DRESSED</span>
        </div>
        <div className="ed-story-copy" data-reveal="left"><span className="premium-eyebrow">A NOTE ON STYLE / 04</span><div className="ed-story-number">02.</div><h2>{editorialHeading?.title||"کمتر انتخاب کن.\nبهتر انتخاب کن."}</h2><div className="ed-story-rule"/><p>{editorialHeading?.description||"برای ما، استایل یعنی ترکیب سادگی و شخصیت. انتخاب‌هایی باکیفیت که برای مد زودگذر ساخته نشده‌اند و در هر فصل همراهتان هستند."}</p><Link href={storyCta} className="ed-inline-link">{editorialHeading?.ctaLabel||"داستان این نگاه"} <ArrowUpLeft size={18}/></Link></div>
      </section>

      <section className="ed-chapter" data-chapter aria-label="روایت تصویری کالکشن">
        <div className="ed-chapter-scene" data-chapter-scene>
          <div className="ed-chapter-photographs">
            <div className="ed-chapter-frame" data-chapter-frame><Image src="/images/editorial/chapter-form.webp" alt="فصل اول: فرم و استایل ماندگار" fill sizes="60vw"/></div>
            <div className="ed-chapter-frame" data-chapter-frame><Image src="/images/editorial/chapter-detail.webp" alt="فصل دوم: جزئیات و نور" fill sizes="60vw"/></div>
            <span className="ed-chapter-photo-label">THE COLLECTION / IN TWO ACTS</span>
          </div>
          <div className="ed-chapter-narrative">
            <span className="premium-eyebrow">AN EDITORIAL STUDY / 02</span>
            <div className="ed-chapter-words">
              <div className="ed-chapter-copy" data-chapter-copy><span>CHAPTER 01 — FORM</span><h2>{editorialHeading?.title||"هر انتخاب، یک روایت."}</h2><p>{editorialHeading?.description||"زیبایی واقعی از جنس جزئیاتی است که با دقت کنار هم قرار می‌گیرند."}</p></div>
              <div className="ed-chapter-copy" data-chapter-copy><span>CHAPTER 02 — DETAIL</span><h2>{firstBanner?.title||"کیفیتی که می‌ماند."}</h2><p>{firstBanner?.subtitle||"طرح‌های ماندگار و کیفیتی که در هر فصل همراه شماست."}</p></div>
            </div>
            <div className="ed-chapter-progress"><span data-chapter-progress/></div>
            <div className="ed-chapter-footer"><span>01</span><span>02</span></div>
          </div>
        </div>
      </section>

      <section className="ed-mobile-chapters" aria-label="دو فصل تصویری کالکشن">
        <article className="ed-mobile-chapter" data-reveal="up">
          <div className="ed-mobile-chapter-photo" data-image-wipe><Image src="/images/editorial/chapter-form.webp" alt="فصل فرم؛ استایل آرام و ماندگار" fill sizes="100vw"/></div>
          <div className="ed-mobile-chapter-copy"><span className="premium-eyebrow">CHAPTER 01 / FORM</span><h2>{editorialHeading?.title||"هر انتخاب، یک روایت."}</h2><p>{editorialHeading?.description||"زیبایی واقعی از جنس جزئیاتی است که با دقت کنار هم قرار می‌گیرند."}</p></div>
        </article>
        <article className="ed-mobile-chapter" data-reveal="up">
          <div className="ed-mobile-chapter-photo" data-image-wipe><Image src="/images/editorial/chapter-detail.webp" alt="فصل جزئیات؛ نور و کیفیت" fill sizes="100vw"/></div>
          <div className="ed-mobile-chapter-copy"><span className="premium-eyebrow">CHAPTER 02 / DETAIL</span><h2>{firstBanner?.title||"کیفیتی که می‌ماند."}</h2><p>{firstBanner?.subtitle||"انتخاب‌هایی که هر فصل، بخشی از سبک شخصی شما می‌مانند."}</p></div>
        </article>
      </section>

      {sections.slice(2).map((section,index)=><section className={`ed-admin-story premium-container ${index%2?"is-reversed":""} ${section.layout?`ed-layout-${section.layout}`:""}`} data-motion={section.animation||"mask"} key={section.id}>
        {section.imageUrl&&<div className="ed-admin-story-picture" data-reveal={index%2?"left":"right"} data-image-wipe><Image src={section.imageUrl} alt={section.title} fill sizes="(max-width: 760px) 100vw, 45vw" unoptimized={section.imageUrl.startsWith("http")}/>
          {section.secondaryImageUrl&&<span className="ed-admin-story-detail"><Image src={section.secondaryImageUrl} alt="" fill sizes="(max-width:760px) 30vw, 15vw" unoptimized={section.secondaryImageUrl.startsWith("http")}/></span>}
        </div>}
        <div className="ed-admin-story-copy" data-reveal={index%2?"right":"left"}><span className="premium-eyebrow">CURATED STORY / {String(index+5).padStart(2,"0")}</span><h2>{section.title}</h2><p>{section.description}</p><Link href={section.ctaHref?.startsWith("/")?section.ctaHref:"/products"} className="ed-inline-link">{section.ctaLabel||"کشف بیشتر"} <ArrowUpLeft size={18}/></Link></div>
      </section>)}

      {nextProducts.length>0&&<section className="ed-products-section ed-next-products premium-container">
        <div className="ed-section-heading" data-reveal="up"><div><span className="premium-eyebrow">JUST DISCOVERED / 05</span><h2>تازه به <em>کالکشن</em> اضافه شده</h2><p>گزینه‌های تازه برای سلیقه‌های ماندگار.</p></div><Link href="/products?sort=new" className="ed-inline-link">همه محصولات <ArrowUpLeft size={18}/></Link></div>
        <div className="ed-featured-grid" data-stagger>{nextProducts.map(product=><ProductCard key={product.id} product={product}/>)}</div>
      </section>}

      {otherBanners.map((banner,index)=><section key={banner.id} className="ed-secondary-banner premium-container" data-reveal="up"><div><span className="premium-eyebrow">DISCOVER THE COLLECTION / {String(index+6).padStart(2,"0")}</span><h2>{banner.title}</h2><p>{banner.subtitle}</p><Link href={banner.linkUrl?.startsWith("/")?banner.linkUrl:"/products"} className="ed-dark-button">مشاهده بیشتر <ArrowUpLeft size={18}/></Link></div>{banner.imageUrl&&<div className="ed-secondary-banner-image"><Image src={banner.imageUrl} alt={banner.title} fill unoptimized sizes="(max-width: 760px) 100vw, 50vw"/></div>}</section>)}

      <section className="ed-affirmation" aria-label="فلسفه برند" data-reveal="up"><span>THE EDITORIAL POINT OF VIEW</span><p>زیبایی، در <i>انتخاب‌های آگاهانه</i> است.</p><span>EST. MMXXVI — A QUIETER KIND OF LUXURY</span></section>

      <section className="ed-journal premium-container" data-journal data-scene="journal">
        <div className="ed-section-heading"><div><span className="premium-eyebrow">THE JOURNAL / 06</span><h2>از نگاه <em>ژورنال</em></h2></div><Link href="/blog" className="ed-inline-link">ورود به ژورنال <ArrowUpLeft size={18}/></Link></div>
        <div className="ed-journal-grid" data-stagger>
          <Link href={store.articles[0]?`/blog/${store.articles[0].slug}`:"/blog"} className="ed-journal-card"><div className="ed-journal-photo"><Image src={store.articles[0]?.coverUrl||"/images/editorial/journal-style.webp"} alt="نگاهی به هنر پوشیدن" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={Boolean(store.articles[0]?.coverUrl?.startsWith("http"))}/></div><div className="ed-journal-meta">THE JOURNAL — 01</div><h3>{store.articles[0]?.title||"هنر ساختن یک استایل ماندگار"}</h3><p>{store.articles[0]?.summary||"از پارچه‌ها و فرم‌ها تا ظرافت‌هایی که در نگاه اول دیده نمی‌شوند."}</p><span>ادامه مطلب <ArrowUpLeft size={17}/></span></Link>
          <Link href={store.articles[1]?`/blog/${store.articles[1].slug}`:"/info/about"} className="ed-journal-card"><div className="ed-journal-photo"><Image src={store.articles[1]?.coverUrl||"/images/editorial/journal-details.webp"} alt="جزئیات و اکسسوری‌ها" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={Boolean(store.articles[1]?.coverUrl?.startsWith("http"))}/></div><div className="ed-journal-meta">THE JOURNAL — 02</div><h3>{store.articles[1]?.title||"چرا جزئیات، مهم‌ترین بخش استایل‌اند؟"}</h3><p>{store.articles[1]?.summary||"روایتی کوتاه از نقش انتخاب‌های کوچک در شخصیت یک استایل."}</p><span>بیشتر بخوانید <ArrowUpLeft size={17}/></span></Link>
        </div>
      </section>

      <section className="ed-benefits premium-container" data-reveal="up" aria-label="خدمات فروشگاه">
        <div><Truck size={25} strokeWidth={1.35}/><strong>روش‌های ارسال متنوع</strong><span>انتخاب روش ارسال هنگام ثبت سفارش</span></div>
        <div><PackageCheck size={25} strokeWidth={1.35}/><strong>جزئیات شفاف محصولات</strong><span>قیمت و موجودی متصل به پنل</span></div>
        <div><Headphones size={25} strokeWidth={1.35}/><strong>پشتیبانی و همراهی</strong><span>اطلاعات تماس از پنل مدیریت</span></div>
        <div><RotateCcw size={25} strokeWidth={1.35}/><strong>قوانین خرید روشن</strong><span>مطابق شرایط درج‌شده در فروشگاه</span></div>
      </section>
      
    </div>
  </EditorialMotion>;
}
