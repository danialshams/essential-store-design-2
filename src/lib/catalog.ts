import {showcasePhoto} from "@/lib/showcase-photos";
export type Variant={id:string;label:string;sku?:string;price?:number;inventory:number};
export type Product={
 id:string;slug:string;name:string;subtitle:string;description:string;price:number;
 comparePrice?:number;category:string;categoryLabel:string;image:string;seoImageAlt?:string;
 gallery:string[];inventory:number;featured?:boolean;newArrival?:boolean;
 variants?:Variant[];sku:string;specs:Record<string,string>;
};
export const categories=[
 {id:"clothing",name:"پوشاک",image:"/images/linen-shirt.webp",description:"پوشاک روزمره و شیک"},
 {id:"bags",name:"کیف",image:"/images/bag.webp",description:"کیف‌های ساده و کاربردی"},
 {id:"shoes",name:"کفش",image:"/images/sneakers.webp",description:"کفش‌های راحت و روزمره"},
 {id:"accessories",name:"اکسسوری",image:"/images/sunglasses.webp",description:"جزئیات خاص استایل"}
];
export const demoProducts:Product[]=([
 {id:"demo-bag",slug:"minimal-leather-bag",name:"کیف دستی چرمی زنانه",subtitle:"طراحی مینیمال و شیک",description:"کیف دستی چرمی با طراحی ساده، دوخت ظریف و فضای کافی برای لوازم روزمره. مناسب استفاده روزانه و استایل رسمی.",price:2490000,comparePrice:2790000,category:"bags",categoryLabel:"کیف",image:"/images/products/bag-main.webp",gallery:["/images/products/bag-main.webp"],inventory:18,featured:true,newArrival:true,sku:"BAG-1001",variants:[{id:"bag-brown",label:"قهوه‌ای",sku:"BAG-BR",inventory:12},{id:"bag-black",label:"مشکی",sku:"BAG-BK",inventory:6}],specs:{"جنس":"چرم مصنوعی مرغوب","رنگ":"قهوه‌ای، مشکی","کاربرد":"روزمره و رسمی","کشور تولید":"ایران"}},
 {id:"demo-sneakers",slug:"white-everyday-sneakers",name:"کفش کتانی سفید مردانه",subtitle:"راحت، سبک و مناسب استفاده روزمره",description:"کتانی سفید با طراحی کلاسیک و زیره راحت، انتخابی کاربردی برای استفاده طولانی‌مدت و استایل‌های مختلف.",price:1790000,comparePrice:2090000,category:"shoes",categoryLabel:"کفش",image:"/images/products/sneakers-main.webp",gallery:["/images/products/sneakers-main.webp"],inventory:24,featured:true,newArrival:true,sku:"SHO-1002",variants:[{id:"shoe-40",label:"سایز ۴۰",sku:"SHO-40",inventory:7},{id:"shoe-41",label:"سایز ۴۱",sku:"SHO-41",inventory:9},{id:"shoe-42",label:"سایز ۴۲",sku:"SHO-42",inventory:8}],specs:{"رنگ":"سفید","رویه":"چرم مصنوعی","نوع زیره":"سبک و انعطاف‌پذیر","کاربرد":"روزمره"}},
 {id:"demo-shirt",slug:"blue-linen-shirt",name:"پیراهن لینن مردانه",subtitle:"پارچه سبک و خنک، مناسب فصل گرم",description:"پیراهن آبی با پارچه سبک لینن و برش راحت برای یک استایل ساده و مرتب.",price:1990000,comparePrice:2350000,category:"clothing",categoryLabel:"پوشاک",image:"/images/products/shirt-blue.webp",gallery:["/images/products/shirt-blue.webp"],inventory:32,featured:true,sku:"SHI-1003",variants:[{id:"shirt-m",label:"سایز M",inventory:10},{id:"shirt-l",label:"سایز L",inventory:12},{id:"shirt-xl",label:"سایز XL",inventory:10}],specs:{"جنس":"لینن","رنگ":"آبی روشن","فرم":"آزاد","شرایط شست‌وشو":"آب سرد"}},
 {id:"demo-watch",slug:"classic-brown-watch",name:"ساعت کلاسیک مردانه",subtitle:"طراحی شیک و ماندگار",description:"ساعتی با صفحه روشن و بند چرمی قهوه‌ای برای تکمیل استایل روزمره و رسمی.",price:3490000,comparePrice:3980000,category:"accessories",categoryLabel:"اکسسوری",image:"/images/products/watch-main.webp",gallery:["/images/products/watch-main.webp"],inventory:7,featured:true,sku:"WAT-1004",specs:{"نوع بند":"چرم","رنگ بند":"قهوه‌ای","نوع نمایش":"عقربه‌ای","مناسب":"روزمره و رسمی"}},
 {id:"demo-bag-2",slug:"everyday-leather-bag",name:"کیف چرمی روزمره",subtitle:"همراه کاربردی هر روز",description:"کیف با محفظه مناسب و طراحی ساده.",price:2190000,comparePrice:2690000,category:"bags",categoryLabel:"کیف",image:"/images/products/bag-everyday.webp",gallery:["/images/products/bag-everyday.webp"],inventory:12,newArrival:true,sku:"BAG-1005",specs:{"جنس":"چرم مصنوعی","رنگ":"قهوه‌ای"}},
 {id:"demo-shoes-2",slug:"urban-sneakers",name:"کتانی شهری بژ",subtitle:"مینیمال، سبک و راحت",description:"کتانی روزمره با قالب راحت.",price:1890000,comparePrice:2290000,category:"shoes",categoryLabel:"کفش",image:"/images/products/sneakers-urban.webp",gallery:["/images/products/sneakers-urban.webp"],inventory:11,newArrival:true,sku:"SHO-1006",specs:{"رنگ":"بژ","مدل":"اسپرت"}},
 {id:"demo-shirt-2",slug:"sky-blue-linen-shirt",name:"پیراهن لینن بژ روشن",subtitle:"انتخابی ساده برای فصل گرم",description:"پیراهن لینن در طیف بژ روشن با بافت نرم.",price:1690000,comparePrice:1990000,category:"clothing",categoryLabel:"پوشاک",image:"/images/products/shirt-beige.webp",gallery:["/images/products/shirt-beige.webp"],inventory:13,sku:"SHI-1007",specs:{"رنگ":"بژ روشن","جنس":"لینن"}},
 {id:"demo-sunglasses",slug:"classic-sunglasses",name:"عینک آفتابی کلاسیک",subtitle:"طراحی ساده برای روزهای آفتابی",description:"عینک آفتابی با فریم سبک و ظاهر کلاسیک.",price:890000,comparePrice:1190000,category:"accessories",categoryLabel:"اکسسوری",image:"/images/products/sunglasses-main.webp",gallery:["/images/products/sunglasses-main.webp"],inventory:17,sku:"ACC-1008",specs:{"رنگ فریم":"قهوه‌ای","نوع":"آفتابی"}}
] as Product[]).map(p=>({...p,image:showcasePhoto(p.image),gallery:p.gallery.map(showcasePhoto)}));
export const getProductBySlug=(slug:string)=>demoProducts.find(product=>product.slug===slug);
export const getProductById=(id:string)=>demoProducts.find(product=>product.id===id);
export const findCategory=(slug:string)=>categories.find(category=>category.id===slug);
export const toman=(amount:number)=>`${Math.round(amount).toLocaleString("fa-IR")} تومان`;
export const numberFa=(value:number)=>value.toLocaleString("fa-IR");
export const shippingCost=(subtotal:number)=>subtotal>=3000000?0:85000;
export const IMAGE_FALLBACK=showcasePhoto("/images/bag.webp");

/** Optional read-only adapter for each customer's independent shared admin API. */
export async function remoteCatalog():Promise<Product[]|null>{
 const url=process.env.STOREFRONT_CATALOG_URL;
 if(!url)return null;
 try{
  const response=await fetch(url,{next:{revalidate:60},signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw Error(`Catalog unavailable: ${response.status}`);
  const data=await response.json() as {products?:Array<Record<string,unknown>>};
  if(!Array.isArray(data.products))return null;
  return data.products.map((entry):Product=>{
   const original=demoProducts.find(p=>p.slug===entry.slug);
   const cat=entry.category as {name?:string;slug?:string}|null;
   return {
    id:String(entry.id),slug:String(entry.slug),name:String(entry.name),
    subtitle:original?.subtitle||"",description:original?.description||"",
    price:Number(entry.price||0),comparePrice:entry.comparePrice==null?undefined:Number(entry.comparePrice),
    category:cat?.slug||"other",categoryLabel:cat?.name||"سایر محصولات",
    image:typeof entry.coverUrl==="string"&&entry.coverUrl?entry.coverUrl:original?.image||IMAGE_FALLBACK,
    gallery:original?.gallery||[],inventory:Number(entry.inventory||0),featured:Boolean(entry.featured),newArrival:false,
    sku:original?.sku||"",variants:Array.isArray(entry.variants)?entry.variants.map((v:Record<string,unknown>)=>({id:String(v.id),label:String(v.label),price:typeof v.price==="number"?v.price:undefined,inventory:Number(v.inventory||0)})):[],specs:original?.specs||{}
   };
  });
 }catch(error){console.error("Storefront catalog sync failed",error);return null}
}
