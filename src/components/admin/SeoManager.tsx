"use client";
import {useEffect,useMemo,useState,type FormEvent} from "react";
import Link from "next/link";
import {Search,Save,Image as ImageIcon,Globe2,ShieldCheck,AlertCircle,CheckCircle2,Link2,FileText,ExternalLink} from "lucide-react";
import {adminFetch,DEMO_MODE} from "@/lib/admin/demo-api";
import {defaultSeoConfig,type SeoConfig,type SeoPageConfig} from "@/lib/seo";

type SeoItem={path:string;title:string;imageUrl:string|null};
type Data={seoTitle:string;seoDescription:string;seoConfig:SeoConfig;storeName:string;items:SeoItem[]};
const safe=(str?:string|null)=>str||"";
function Field({label,value,onChange,placeholder="",multiline=false,hint,max=300}:{
 label:string;value:string;onChange:(x:string)=>void;placeholder?:string;multiline?:boolean;hint?:string;max?:number
}){
 return <label className="seo-field"><span>{label}</span>
 {multiline?<textarea value={value} maxLength={max} rows={3} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>:
  <input value={value} maxLength={max} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>}
 <small>{hint||""}{max>0&&<em>{value.length.toLocaleString("fa-IR")} / {max.toLocaleString("fa-IR")}</em>}</small>
 </label>;
}
export function SeoManager(){
 const [data,setData]=useState<Data|null>(null),[busy,setBusy]=useState(false),
 [loading,setLoading]=useState(true),[error,setError]=useState(""),[success,setSuccess]=useState("");
 const [tab,setTab]=useState<"general"|"pages"|"technical">("general");
 const [selected,setSelected]=useState("/"),[search,setSearch]=useState("");
 useEffect(()=>{let alive=true;
  adminFetch("/api/admin/seo").then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"خواندن سئو ناموفق بود");return d;})
   .then(d=>{if(alive)setData({...d,seoConfig:{...defaultSeoConfig,...d.seoConfig,pages:d.seoConfig?.pages||{}}})})
   .catch(e=>{if(alive)setError(e.message)}).finally(()=>{if(alive)setLoading(false)});
  return()=>{alive=false};
 },[]);
 const cfg=data?.seoConfig||defaultSeoConfig;
 const page=cfg.pages?.[selected]||{};
 const item=data?.items.find(x=>x.path===selected);
 const siteName=cfg.siteName||data?.storeName||"نام فروشگاه";
 const currentTitle=selected==="/"?(data?.seoTitle||siteName):(item?.title||selected);
 const title=page.title||currentTitle,metaDescription=page.description|| (selected==="/"?data?.seoDescription||"":"");
 const resultTitle=selected==="/"?title:title.includes(siteName)?title:title+(cfg.titleSeparator||" | ")+siteName;
 const base=cfg.siteUrl||"https://example.com";
 const canonical=page.canonical||base+selected;
 const previewUrl=canonical.startsWith("/")?base+canonical:canonical;
 const image=page.imageUrl||item?.imageUrl||cfg.defaultImage||"";
 const warnings:string[]=[];
 if(!cfg.siteUrl)warnings.push("دامنه اصلی هنوز تنظیم نشده است؛ لینک‌های کانونیکال با آدرس نمونه نمایش داده می‌شوند.");
 if(!cfg.indexSite)warnings.push("ایندکس گوگل غیرفعال است؛ برای سایت واقعی پس از تنظیم دامنه فعال کنید.");
 if(!title.trim())warnings.push("عنوان اختصاصی برای این صفحه ثبت نشده است.");
 if(title.length>65)warnings.push("عنوان طولانی است و ممکن است در جستجو کوتاه شود.");
 if(metaDescription.length<65)warnings.push("توضیح صفحه بهتر است کامل، خاص و توصیفی باشد.");
 if(metaDescription.length>165)warnings.push("توضیح ممکن است در موبایل کوتاه شود.");
 if(!image)warnings.push("تصویر اشتراک‌گذاری اجتماعی مشخص نیست.");
 if(image&&!page.imageAlt&&!cfg.defaultImageAlt)warnings.push("برای این عکس، متن جایگزین اختصاصی تعیین کنید.");
 const listed=useMemo(()=>data?.items.filter(x=>(x.title+" "+x.path).toLowerCase().includes(search.toLowerCase())).slice(0,100)||[],[data,search]);
 function changeConfig<K extends keyof SeoConfig>(key:K,value:SeoConfig[K]){
  setData(prev=>prev?{...prev,seoConfig:{...prev.seoConfig,[key]:value}}:prev);setSuccess("");
 }
 function changePage<K extends keyof SeoPageConfig>(key:K,value:SeoPageConfig[K]){
  setData(prev=>{if(!prev)return prev;
   const pages={...(prev.seoConfig.pages||{})},current={...(pages[selected]||{})};
   pages[selected]={...current,[key]:value};
   return {...prev,seoConfig:{...prev.seoConfig,pages}};
  });setSuccess("");
 }
 function changeRoot(key:"seoTitle"|"seoDescription",value:string){
  setData(prev=>prev?{...prev,[key]:value}:prev);setSuccess("");
 }
 async function save(e:FormEvent){e.preventDefault();if(!data||busy)return;
  setBusy(true);setError("");setSuccess("");
  const body={seoTitle:data.seoTitle,seoDescription:data.seoDescription,
   seoConfig:{...defaultSeoConfig,...data.seoConfig,
    socialProfiles:data.seoConfig.socialProfiles||[],
    pages:data.seoConfig.pages||{}
   }};
  try{const r=await adminFetch("/api/admin/seo",{method:"PUT",
    headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const saved=await r.json();if(!r.ok)throw Error(saved.error||"ذخیره ناموفق بود");
   setData(prev=>prev?{...prev,...saved}:prev);
   setSuccess(DEMO_MODE?"تنظیمات SEO در حالت نمایشی مرورگر ذخیره شد؛ سایت واقعی تغییر نکرد.":"تنظیمات SEO ذخیره شد و صفحات به‌صورت پویا به‌روزرسانی می‌شوند.");
  }catch(ex){setError(ex instanceof Error?ex.message:"خطا در ذخیره SEO")}finally{setBusy(false)}
 }
 if(loading)return <p className="seo-loading" role="status">در حال بارگذاری تنظیمات SEO...</p>;
 if(!data)return <p role="alert" className="seo-error">{error||"بارگذاری اطلاعات ممکن نشد."}</p>;
 return <div className="seo-studio" dir="rtl">
  <header className="seo-heading"><div><small>SEARCH & DISCOVERABILITY / SEO STUDIO</small><h1>مدیریت پیشرفته سئو</h1>
   <p>مناسب هر نوع فروشگاه و کسب‌وکار؛ تنظیمات عمومی و اختصاصی هر صفحه مستقل از نوع محصولات هستند.</p></div>
   <span className="seo-heading-icon"><Search size={27}/></span>
  </header>
  <nav className="seo-tabs" aria-label="بخش‌های سئو">
   {[{id:"general" as const,title:"هویت در گوگل",icon:Globe2},
     {id:"pages" as const,title:"سئوی صفحات و محصولات",icon:FileText},
     {id:"technical" as const,title:"سئوی فنی و شبکه‌های اجتماعی",icon:ShieldCheck}].map(t=>
    <button key={t.id} type="button" aria-pressed={tab===t.id} className={tab===t.id?"active":""}
     onClick={()=>setTab(t.id)}><t.icon size={17}/>{t.title}</button>)}
  </nav>
  <form onSubmit={save} className="seo-form">
   {tab==="general"&&<div className="seo-columns">
    <section className="seo-surface"><h2><Globe2 size={18}/> معرفی کسب‌وکار در جستجو</h2>
     <Field label="نام برند در نتایج" value={safe(cfg.siteName)} max={120} placeholder={siteName} onChange={v=>changeConfig("siteName",v)}/>
     <Field label="عنوان صفحه اصلی (SEO Title)" value={data.seoTitle} max={120} onChange={v=>changeRoot("seoTitle",v)} placeholder="مثلاً محصولات منتخب باکیفیت | نام برند"/>
     <Field label="توضیح زیر نتیجه گوگل (Meta Description)" value={data.seoDescription} max={550} multiline onChange={v=>changeRoot("seoDescription",v)} placeholder="در یک یا دو جمله دقیقاً توضیح بدهید کسب‌وکار شما چه می‌فروشد یا ارائه می‌کند."/>
     <Field label="آدرس دامنه اصلی سایت" value={safe(cfg.siteUrl)} max={2000} onChange={v=>changeConfig("siteUrl",v)} placeholder="https://example.com" hint="بدون مسیر اضافی و با HTTPS؛ هنگام تحویل به مشتری قابل تغییر است."/>
     <label className="seo-check"><input type="checkbox" checked={cfg.indexSite===true} onChange={e=>changeConfig("indexSite",e.target.checked)}/>
      <span><b>اجازه نمایش سایت در نتایج گوگل</b><small>فقط پس از تکمیل محتوای واقعی و اتصال دامنه مشتری فعال کنید.</small></span></label>
    </section>
    <section className="seo-surface"><h2><Search size={18}/> پیش‌نمایش نتیجه جستجوی گوگل</h2>
      <div className="seo-google-result"><div className="seo-favicon">S</div>
       <div className="seo-google-host"><strong>{siteName}</strong><small dir="ltr">{base.replace(/^https?:\/\//,"")}</small></div>
       <strong className="seo-blue-link">{data.seoTitle||siteName}</strong>
       <p>{data.seoDescription||"توضیح کوتاه کسب‌وکار در این قسمت ظاهر می‌شود. گوگل ممکن است توضیح را براساس جست‌وجوی کاربر تغییر دهد."}</p></div>
      <p className="seo-note">عنوان و توضیحی که اینجا می‌بینید راهنما هستند؛ گوگل حق دارد آن‌ها را در نتیجه نهایی بازنویسی کند.</p>
      <div className="seo-score"><h3>بررسی سریع</h3>
       {(data.seoTitle.length>14&&data.seoTitle.length<75?["عنوان صفحه اصلی تنظیم شده"]:["عنوان صفحه اصلی را اختصاصی و کوتاه‌تر تنظیم کنید"]).map(w=><p key={w}>{w}</p>)}
       <p>{cfg.indexSite&&cfg.siteUrl?"آماده بررسی توسط خزنده گوگل":"تا زمان اتصال دامنه و فعال‌سازی، از ایندکس جلوگیری می‌شود"}</p>
      </div>
    </section>
   </div>}
   {tab==="pages"&&<div className="seo-columns">
    <section className="seo-surface"><h2><FileText size={18}/> انتخاب صفحه برای سئوی اختصاصی</h2>
     <input className="seo-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="جستجو در نام و آدرس محصول، دسته یا مقاله"/>
     <div className="seo-pages-list" role="group" aria-label="صفحات قابل ویرایش">
      {listed.map(x=><button type="button" key={x.path} className={selected===x.path?"selected":""} aria-pressed={selected===x.path}
       onClick={()=>setSelected(x.path)}><span>{x.title}</span><small dir="ltr">{x.path}</small>{cfg.pages?.[x.path]?.title&&<CheckCircle2 size={15}/>}</button>)}
     </div>
     <Field label="مسیر سفارشی برای صفحه جدید" value={selected} max={300} onChange={v=>{if(v.startsWith("/")&&!v.startsWith("//"))setSelected(v)}} hint="برای صفحه‌ای که هنوز در فهرست نیست؛ مثلاً /info/about"/>
    </section>
    <section className="seo-surface"><h2><Search size={18}/> محتوای سئو: {item?.title||selected}</h2>
     <Field label="عنوان اختصاصی (SEO Title)" value={safe(page.title)} max={135} onChange={v=>changePage("title",v)} placeholder={currentTitle}/>
     <Field label="توضیحات اختصاصی (Meta Description)" value={safe(page.description)} max={550} multiline onChange={v=>changePage("description",v)}/>
     <Field label="آدرس کانونیکال (Canonical)" value={safe(page.canonical)} max={2000} onChange={v=>changePage("canonical",v)} placeholder={base+selected} hint="برای جلوگیری از صفحات تکراری؛ در حالت معمول خالی بماند."/>
     <Field label="عکس اشتراک‌گذاری (Open Graph)" value={safe(page.imageUrl)} max={2000} onChange={v=>changePage("imageUrl",v)} placeholder={item?.imageUrl||cfg.defaultImage||"/images/og.webp"}/>
     <Field label="متن جایگزین تصویر (Image ALT)" value={safe(page.imageAlt)} max={250} onChange={v=>changePage("imageAlt",v)} placeholder={"توصیف واقعی عکس "+(item?.title||"")}/>
     <p className="seo-note">نام فایل عکس نیز بهتر است معنادار باشد (مثل blue-leather-bag.webp). نام فایل هنگام بارگذاری تعیین می‌شود؛ این فیلد، متن ALT خود تصویر را مدیریت می‌کند.</p>
     <div className="seo-checks">
      <label className="seo-check"><input type="checkbox" checked={page.noindex===true} onChange={e=>changePage("noindex",e.target.checked)}/><span><b>عدم نمایش این صفحه در گوگل</b><small>برای صفحات موقت یا غیرقابل جست‌وجو</small></span></label>
      <label className="seo-check"><input type="checkbox" checked={page.noarchive===true} onChange={e=>changePage("noarchive",e.target.checked)}/><span><b>محدودکردن ذخیره نسخه کش</b></span></label>
     </div>
     <div className="seo-google-result compact"><small dir="ltr">{previewUrl}</small><strong className="seo-blue-link">{resultTitle}</strong>
      <p>{metaDescription||"توضیحات اختصاصی صفحه هنوز ثبت نشده است."}</p></div>
     {image&&<div className="seo-social-preview"><img src={image} alt={page.imageAlt||"پیش‌نمایش تصویر اشتراک‌گذاری"}/><div><strong>{resultTitle}</strong><small>{metaDescription}</small></div></div>}
     <div className="seo-warnings"><h3>بررسی کیفیت محتوا</h3>{warnings.length?warnings.map((w,i)=><p key={i}><AlertCircle size={14}/>{w}</p>):<p><CheckCircle2 size={14}/> مشکلی در بررسی اولیه ثبت نشده است.</p>}</div>
    </section>
   </div>}
   {tab==="technical"&&<div className="seo-columns">
    <section className="seo-surface"><h2><ShieldCheck size={18}/> سئوی فنی و معرفی سایت</h2>
     <Field label="کد تأیید Google Search Console" value={safe(cfg.googleVerification)} max={300} onChange={v=>changeConfig("googleVerification",v)} hint="فقط مقدار content از متاتگ تأیید گوگل را وارد کنید، نه کل HTML."/>
     <Field label="کد تأیید Bing Webmaster Tools" value={safe(cfg.bingVerification)} max={300} onChange={v=>changeConfig("bingVerification",v)}/>
     <Field label="زبان سایت" value={safe(cfg.language)} max={12} onChange={v=>changeConfig("language",v)} placeholder="fa-IR"/>
     <Field label="نام حقوقی/تجاری سازمان (JSON-LD)" value={safe(cfg.companyName)} max={150} onChange={v=>changeConfig("companyName",v)}/>
     <Field label="آدرس لوگوی سازمان" value={safe(cfg.companyLogo)} max={2000} onChange={v=>changeConfig("companyLogo",v)}/>
     <Field label="لینک شبکه‌های اجتماعی (هر خط یک آدرس)" value={(cfg.socialProfiles||[]).join("\n")} max={24000} multiline onChange={v=>changeConfig("socialProfiles",v.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,12))}/>
    </section>
    <section className="seo-surface"><h2><ImageIcon size={18}/> اشتراک‌گذاری و فایل‌های خزنده</h2>
     <Field label="عکس پیش‌فرض هنگام اشتراک‌گذاری (Open Graph)" value={safe(cfg.defaultImage)} max={2000} onChange={v=>changeConfig("defaultImage",v)} placeholder="/images/social-cover.webp"/>
     <Field label="ALT عکس پیش‌فرض" value={safe(cfg.defaultImageAlt)} max={250} onChange={v=>changeConfig("defaultImageAlt",v)}/>
     <Field label="آیدی X / Twitter (اختیاری)" value={safe(cfg.twitterHandle)} max={100} onChange={v=>changeConfig("twitterHandle",v)}/>
     <Field label="جداکننده عنوان‌ها" value={safe(cfg.titleSeparator)} max={12} onChange={v=>changeConfig("titleSeparator",v)}/>
     <div className="seo-technical-links"><h3>فایل‌های فنی به‌صورت خودکار ساخته می‌شوند</h3>
      <a href="/sitemap.xml" rel="noreferrer" target="_blank"><Link2 size={16}/> sitemap.xml <ExternalLink size={15}/></a>
      <a href="/robots.txt" rel="noreferrer" target="_blank"><ShieldCheck size={16}/> robots.txt <ExternalLink size={15}/></a>
      <p>سایت‌مپ، URLهای منتشرشده محصولات، دسته‌ها، مقالات و صفحات را از دیتابیس می‌گیرد. صفحات حساب، سبد خرید، مدیریت و پیش‌نمایش ایندکس نمی‌شوند.</p>
     </div>
    </section>
   </div>}
   <footer className="seo-footer">
    {error&&<p role="alert" className="seo-error">{error}</p>}
    {success&&<p role="status" className="seo-success"><CheckCircle2 size={18}/>{success}</p>}
    <button className="seo-save" type="submit" disabled={busy}><Save size={18}/>{busy?"در حال ذخیره":"ذخیره تنظیمات سئو"}</button>
    <Link href="/admin/settings">بازگشت به تنظیمات فروشگاه</Link>
   </footer>
  </form>
 </div>;
}
