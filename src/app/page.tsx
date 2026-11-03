import Link from "next/link";
import Image from "next/image";
import {ArrowLeft, ArrowUpLeft, Check, Headphones, PackageCheck, RotateCcw, ShoppingBag, Truck} from "lucide-react";
import {loadStore,type StoreCategory} from "@/lib/live-store";
import {ProductCard} from "@/components/ProductCard";
import {EditorialMotion} from "@/components/EditorialMotion";

const editorialImages:Record<string,string>={
  clothing:"/images/editorial-portrait.webp",
  bags:"/images/editorial-bag.webp",
  shoes:"/images/sneakers.webp",
  accessories:"/images/classic-watch.webp",
};
const fallbackEditorial={
  hero:"/images/editorial-hero.webp",
  portrait:"/images/editorial-portrait.webp",
  bag:"/images/editorial-bag.webp",
};
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
  const heroImage=hero?.imageUrl||fallbackEditorial.hero;
  const featured=store.products.filter(p=>p.featured).slice(0,4);
  const collection=featured.length>=4?featured:store.products.slice(0,4);
  const nextProducts=store.products.filter(p=>!collection.some(x=>x.id===p.id)).slice(0,4);
  const firstBanner=store.banners[0];
  const otherBanners=store.banners.slice(1);
  const lookbookImage=firstBanner?.imageUrl||fallbackEditorial.bag;
  const editorialHeading=sections[1];
  const storyImage=editorialHeading?.imageUrl||fallbackEditorial.portrait;
  const heading=hero?.title||"زیبایی در سادگی\nاتفاق می‌افتد.";
  const titleLines=heading.split(/\n/).filter(Boolean);

  return <EditorialMotion>
    <div className="ed-home">
      <section className="ed-hero" aria-labelledby="ed-hero-title">
        <div className="ed-hero-content">
          <span className="ed-hero-eyebrow" data-hero-kicker><span/> THE NEW EDITION — 2026</span>
          <p className="ed-hero-intro" data-hero-kicker>کالکشن منتخب فصل</p>
          <h1 id="ed-hero-title">{titleLines.map((line,index)=><span key={index} data-hero-line>{line}</span>)}</h1>
          <p className="ed-hero-description" data-hero-description>{hero?.description||"انتخاب‌هایی برای کسانی که زیبایی را در جزئیات پیدا می‌کنند؛ ساده، ماندگار و به دور از تکرار."}</p>
          <div className="ed-hero-links" data-hero-action>
            <Link href="/products" className="ed-dark-button">کشف کالکشن <ArrowUpLeft size={19} strokeWidth={1.5}/></Link>
            <Link href="#ed-categories" className="ed-text-link">دیدن دسته‌بندی‌ها <ArrowLeft size={17}/></Link>
          </div>
          <div className="ed-hero-bottom" data-hero-action><span>EST. 2026</span><span className="ed-hero-bottom-line"/><span>TIMELESS BY DESIGN</span></div>
        </div>
        <div className="ed-hero-visual" data-hero-image>
          <Image src={heroImage} alt="تصویر کالکشن فشن ادیتوریال" fill priority unoptimized={heroImage.startsWith("http")} sizes="(max-width: 760px) 100vw, 54vw" className="ed-hero-photo"/>
          <span className="ed-hero-photo-stamp">THE EDITORIAL<br/>COLLECTION</span>
          <span className="ed-hero-number">01 / EDITION</span>
        </div>
      </section>

      <div className="ed-quiet-strip" aria-label="شعار فروشگاه"><span>CURATED WITH INTENTION</span><span className="ed-quiet-symbol">✳</span><span>LESS, BUT BETTER</span><span className="ed-quiet-symbol">✳</span><span>MADE FOR EVERYDAY</span></div>

      <section className="ed-categories-section premium-container" id="ed-categories">
        <div className="ed-section-heading" data-reveal="up">
          <div><span className="premium-eyebrow">EXPLORE THE EDITION / 01</span><h2>دسته‌بندی‌هایی برای <em>هر سلیقه</em></h2></div>
          <Link href="/products" className="ed-inline-link">تمام محصولات <ArrowUpLeft size={18}/></Link>
        </div>
        <div className="ed-categories-grid" data-stagger>
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

      <section className="ed-products-section premium-container" id="ed-selected">
        <div className="ed-section-heading" data-reveal="up"><div><span className="premium-eyebrow">THE SELECTED PIECES / 02</span><h2>انتخاب‌های <em>این فصل</em></h2><p>چیزهایی که امروز دوستشان دارید، فردا هم دوست‌داشتنی می‌مانند.</p></div><Link href="/products" className="ed-inline-link">مشاهده مجموعه <ArrowUpLeft size={18}/></Link></div>
        <div className="ed-featured-grid" data-stagger>{collection.map(product=><ProductCard key={product.id} product={product}/>)}</div>
      </section>

      <section className="ed-lookbook premium-container" aria-labelledby="ed-lookbook-title" data-reveal="up">
        <div className="ed-lookbook-media"><Image src={lookbookImage} alt={firstBanner?.title||"کالکشن کیف و اکسسوری چرمی"} fill sizes="(max-width: 760px) 100vw, 53vw" unoptimized={lookbookImage.startsWith("http")} className="ed-lookbook-photo" data-parallax/></div>
        <div className="ed-lookbook-copy">
          <span className="premium-eyebrow">THE ART OF DETAILS / 03</span>
          <h2 id="ed-lookbook-title">{firstBanner?.title||"جزئیاتی که\nتفاوت می‌سازند."}</h2>
          <p>{firstBanner?.subtitle||"یک اکسسوری خوب، فقط یک انتخاب نیست؛ امضای سبک شخصی شماست. طراحی‌هایی که هر روز همراهتان می‌مانند."}</p>
          <Link href={firstBanner?.linkUrl?.startsWith("/")?firstBanner.linkUrl:"/category/bags"} className="ed-light-button">دیدن کالکشن <ArrowUpLeft size={18}/></Link>
          <span className="ed-lookbook-ordinal">ESSENTIAL / CHAPTER NO. 02</span>
        </div>
      </section>

      <section className="ed-editorial-story premium-container">
        <div className="ed-story-visual" data-reveal="right"><Image src={storyImage} alt={editorialHeading?.title||"استایل کلاسیک و مینیمال"} fill sizes="(max-width: 760px) 100vw, 48vw" unoptimized={storyImage.startsWith("http")} className="ed-story-photo"/><span>AN EDITORIAL PERSPECTIVE</span></div>
        <div className="ed-story-copy" data-reveal="left"><span className="premium-eyebrow">A NOTE ON STYLE / 04</span><div className="ed-story-number">02.</div><h2>{editorialHeading?.title||"کمتر انتخاب کن.\nبهتر انتخاب کن."}</h2><div className="ed-story-rule"/><p>{editorialHeading?.description||"برای ما، استایل یعنی ترکیب سادگی و شخصیت. انتخاب‌هایی باکیفیت که برای مد زودگذر ساخته نشده‌اند و در هر فصل همراهتان هستند."}</p><Link href="/info/about" className="ed-inline-link">داستان این نگاه <ArrowUpLeft size={18}/></Link></div>
      </section>

      {sections.slice(2).map((section,index)=><section className={`ed-admin-story premium-container ${index%2?"is-reversed":""}`} key={section.id}>
        {section.imageUrl&&<div className="ed-admin-story-picture" data-reveal={index%2?"left":"right"}><Image src={section.imageUrl} alt={section.title} fill sizes="(max-width: 760px) 100vw, 45vw" unoptimized={section.imageUrl.startsWith("http")}/></div>}
        <div className="ed-admin-story-copy" data-reveal={index%2?"right":"left"}><span className="premium-eyebrow">CURATED STORY / {String(index+5).padStart(2,"0")}</span><h2>{section.title}</h2><p>{section.description}</p><Link href="/products" className="ed-inline-link">کشف بیشتر <ArrowUpLeft size={18}/></Link></div>
      </section>)}

      {nextProducts.length>0&&<section className="ed-products-section ed-next-products premium-container">
        <div className="ed-section-heading" data-reveal="up"><div><span className="premium-eyebrow">JUST DISCOVERED / 05</span><h2>تازه به <em>کالکشن</em> اضافه شده</h2><p>گزینه‌های تازه برای سلیقه‌های ماندگار.</p></div><Link href="/products?sort=new" className="ed-inline-link">همه محصولات <ArrowUpLeft size={18}/></Link></div>
        <div className="ed-featured-grid" data-stagger>{nextProducts.map(product=><ProductCard key={product.id} product={product}/>)}</div>
      </section>}

      {otherBanners.map((banner,index)=><section key={banner.id} className="ed-secondary-banner premium-container" data-reveal="up"><div><span className="premium-eyebrow">DISCOVER THE COLLECTION / {String(index+6).padStart(2,"0")}</span><h2>{banner.title}</h2><p>{banner.subtitle}</p><Link href={banner.linkUrl?.startsWith("/")?banner.linkUrl:"/products"} className="ed-dark-button">مشاهده بیشتر <ArrowUpLeft size={18}/></Link></div>{banner.imageUrl&&<div className="ed-secondary-banner-image"><Image src={banner.imageUrl} alt={banner.title} fill unoptimized sizes="(max-width: 760px) 100vw, 50vw"/></div>}</section>)}

      <section className="ed-affirmation" aria-label="فلسفه برند" data-reveal="up"><span>THE EDITORIAL POINT OF VIEW</span><p>خوب پوشیدن، از <i>خوب انتخاب کردن</i> شروع می‌شود.</p><span>EST. MMXXVI — A QUIETER KIND OF LUXURY</span></section>

      <section className="ed-journal premium-container" data-reveal="up">
        <div className="ed-section-heading"><div><span className="premium-eyebrow">THE JOURNAL / 06</span><h2>کمی بیشتر از <em>یک فروشگاه</em></h2></div><Link href="/blog" className="ed-inline-link">ورود به ژورنال <ArrowUpLeft size={18}/></Link></div>
        <div className="ed-journal-grid" data-stagger>
          <Link href={store.articles[0]?`/blog/${store.articles[0].slug}`:"/blog"} className="ed-journal-card"><div className="ed-journal-photo"><Image src={store.articles[0]?.coverUrl||"/images/editorial-portrait.webp"} alt="نگاهی به هنر پوشیدن" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={Boolean(store.articles[0]?.coverUrl?.startsWith("http"))}/></div><div className="ed-journal-meta">THE JOURNAL — 01</div><h3>{store.articles[0]?.title||"هنر ساختن یک استایل ماندگار"}</h3><p>{store.articles[0]?.summary||"از پارچه‌ها و فرم‌ها تا ظرافت‌هایی که در نگاه اول دیده نمی‌شوند."}</p><span>ادامه مطلب <ArrowUpLeft size={17}/></span></Link>
          <Link href={store.articles[1]?`/blog/${store.articles[1].slug}`:"/info/about"} className="ed-journal-card"><div className="ed-journal-photo"><Image src={store.articles[1]?.coverUrl||"/images/editorial-bag.webp"} alt="جزئیات و اکسسوری‌ها" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={Boolean(store.articles[1]?.coverUrl?.startsWith("http"))}/></div><div className="ed-journal-meta">THE JOURNAL — 02</div><h3>{store.articles[1]?.title||"چرا جزئیات، مهم‌ترین بخش استایل‌اند؟"}</h3><p>{store.articles[1]?.summary||"روایتی کوتاه از نقش انتخاب‌های کوچک در شخصیت یک استایل."}</p><span>بیشتر بخوانید <ArrowUpLeft size={17}/></span></Link>
        </div>
      </section>

      <section className="ed-benefits premium-container" data-reveal="up" aria-label="خدمات فروشگاه">
        <div><Truck size={25} strokeWidth={1.35}/><strong>روش‌های ارسال متنوع</strong><span>انتخاب روش ارسال هنگام ثبت سفارش</span></div>
        <div><PackageCheck size={25} strokeWidth={1.35}/><strong>جزئیات شفاف محصولات</strong><span>قیمت و موجودی متصل به پنل</span></div>
        <div><Headphones size={25} strokeWidth={1.35}/><strong>پشتیبانی و همراهی</strong><span>اطلاعات تماس از پنل مدیریت</span></div>
        <div><RotateCcw size={25} strokeWidth={1.35}/><strong>قوانین خرید روشن</strong><span>مطابق شرایط درج‌شده در فروشگاه</span></div>
      </section>
      <div className="ed-end-note premium-container"><Check size={14}/><span>DESIGNED TO BE DIFFERENT — EDITION 02</span><ShoppingBag size={14}/></div>
    </div>
  </EditorialMotion>;
}
