"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {Plus,PackageCheck,Loader2,Check,ExternalLink} from "lucide-react";
import {adminFetch} from "@/lib/admin/demo-api";
import {EntityChoices,MediaField} from "@/components/admin/EditionTwoControls";
import type {EdCatalog,EdEntity} from "@/lib/admin/edition-two";

/** Works with the real product API: created items are immediately selectable. */
export function FestivalProductManager({catalog,selected,onChange,onCreated,max=12}:{
 catalog:EdCatalog;selected:string[];onChange:(ids:string[])=>void;
 onCreated:(item:EdEntity)=>void;max?:number;
}){
 const [tab,setTab]=useState<"existing"|"new">("existing");
 const [name,setName]=useState("");
 const [price,setPrice]=useState("");
 const [comparePrice,setComparePrice]=useState("");
 const [inventory,setInventory]=useState("10");
 const [categoryId,setCategoryId]=useState("");
 const [coverUrl,setCoverUrl]=useState("");
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const candidates=catalog.products.filter(p=>(p.inventory??1)>0);
 const discounted=candidates.filter(p=>typeof p.price==="number"&&typeof p.comparePrice==="number"&&p.comparePrice>p.price);
 async function create(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const selling=Number(price),original=Number(comparePrice),stock=Number(inventory);
  if(!name.trim()||!Number.isFinite(selling)||selling<=0||!Number.isFinite(original)||original<=selling||!Number.isInteger(stock)||stock<=0){
   setError("نام، قیمت فروش، قیمت قبل از تخفیف بالاتر و موجودی معتبر را وارد کنید.");return;
  }
  if(selected.length>=max){setError("ظرفیت جشنواره تکمیل است؛ ابتدا یک محصول را حذف کنید.");return}
  setSaving(true);setError("");setSuccess("");
  try{
   const id=Math.random().toString(36).slice(2,8);
   const body={name:name.trim(),slug:"festival-"+Date.now().toString(36)+"-"+id,
    description:"محصول منتخب جشنواره",price:selling,comparePrice:original,
    inventory:stock,lowStockAt:3,categoryId:categoryId||null,
    coverUrl:coverUrl||null,featured:false,status:"ACTIVE",gallery:[],variants:[]};
   const response=await adminFetch("/api/admin/products",{method:"POST",
    headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const result=await response.json();
   if(!response.ok||!result.item?.id)throw Error(result.error||"محصول ایجاد نشد");
   const item:EdEntity={id:String(result.item.id),name:body.name,slug:body.slug,
    imageUrl:coverUrl,price:selling,comparePrice:original,inventory:stock};
   onCreated(item);
   onChange([...selected,item.id]);
   setName("");setPrice("");setComparePrice("");setInventory("10");setCoverUrl("");
   setTab("existing");
   setSuccess("محصول ایجاد و به جشنواره اضافه شد؛ برای نمایش در سایت، تغییرات صفحه را منتشر کنید.");
  }catch(e){setError(e instanceof Error?e.message:"خطا در ساخت محصول")}
  finally{setSaving(false)}
 }
 return <section className="festival-product-manager" aria-label="مدیریت محصولات جشنواره">
  <div className="festival-product-stats">
   <strong>محصولات جشنواره: {selected.length?selected.length.toLocaleString("fa-IR"):"انتخاب خودکار"}</strong>
   <small>{discounted.length.toLocaleString("fa-IR")} محصول با تخفیف ثبت شده • حداکثر {max.toLocaleString("fa-IR")} محصول</small>
  </div>
  <div className="festival-product-tabs" role="group" aria-label="روش افزودن محصول">
   <button type="button" className={tab==="existing"?"active":""} aria-pressed={tab==="existing"}
    onClick={()=>{setTab("existing");setError("")}}><PackageCheck size={16}/> انتخاب از محصولات موجود</button>
   <button type="button" className={tab==="new"?"active":""} aria-pressed={tab==="new"}
    onClick={()=>{setTab("new");setError("")}}><Plus size={16}/> افزودن محصول جدید</button>
  </div>
  {tab==="existing"?<>
   <EntityChoices label="انتخاب و ترتیب محصولات موجود" items={candidates} selected={selected}
    onChange={onChange} max={max}/>
   <p className="festival-product-note">محصولاتی که انتخاب می‌کنید، در ابتدای جشنواره نمایش داده می‌شوند و بقیه جایگاه‌ها به‌صورت خودکار با محصولات فعال پر می‌شوند. درصد تخفیف فقط برای محصول دارای قیمت قبل از تخفیف معتبر نمایش داده می‌شود.</p>
   <Link href="/admin/products" className="festival-product-link">ویرایش قیمت و تخفیف محصولات <ExternalLink size={15}/></Link>
  </>:<form className="festival-product-create" onSubmit={create}>
   <label>نام محصول<input required maxLength={140} value={name} placeholder="مثلاً کیف چرم قهوه‌ای" onChange={e=>setName(e.target.value)}/></label>
   <div className="festival-product-fields">
    <label>قیمت فروش (تومان)<input required type="number" min={1} value={price} onChange={e=>setPrice(e.target.value)}/></label>
    <label>قیمت قبل از تخفیف (تومان)<input required type="number" min={1} value={comparePrice} onChange={e=>setComparePrice(e.target.value)}/></label>
    <label>موجودی<input required type="number" min={1} step={1} value={inventory} onChange={e=>setInventory(e.target.value)}/></label>
    <label>دسته‌بندی<select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
     <option value="">بدون دسته‌بندی</option>{catalog.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
    </select></label>
   </div>
   <MediaField label="عکس محصول" value={coverUrl} onChange={setCoverUrl} catalog={catalog}/>
   <button type="submit" className="festival-product-create-button" disabled={saving||selected.length>=max}>
    {saving?<Loader2 size={17}/>:<Plus size={17}/>} {saving?"در حال ثبت محصول":"ثبت و افزودن به جشنواره"}
   </button>
   <p className="festival-product-note">محصول با وضعیت «منتشرشده» و قیمت تخفیفی واقعی در فهرست محصولات فروشگاه ذخیره می‌شود.</p>
  </form>}
  {error&&<p className="festival-product-error" role="alert">{error}</p>}
  {success&&<p className="festival-product-success" role="status"><Check size={16}/>{success}</p>}
 </section>
}
