"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import type {Product} from "@/lib/catalog";
import type {StoreData} from "@/lib/live-store";

export type CartLine={id:string;productId:string;variantId?:string;quantity:number};
export type DemoOrder={id:string;createdAt:string;status:"در انتظار اتصال پرداخت";customerName:string;phone:string;email?:string;province?:string;city:string;address:string;postalCode?:string;shippingMethod?:string;note?:string;items:CartLine[];subtotal:number;shipping:number;discount:number;total:number};
type ShopContextType={
 store:StoreData;
 lines:CartLine[];favorites:string[];orders:DemoOrder[];ready:boolean;count:number;notice:string;
 add:(product:Product,variantId?:string,quantity?:number)=>void;
 setQuantity:(id:string,quantity:number)=>void;
 remove:(id:string)=>void;
 clear:()=>void;
 isFavorite:(id:string)=>boolean;
 toggleFavorite:(id:string)=>void;
 checkout:(order:Omit<DemoOrder,"id"|"createdAt">,coupon?:string,shippingId?:string)=>Promise<DemoOrder>;
 notify:(message:string)=>void;
 dismiss:()=>void;
};
const ShopContext=createContext<ShopContextType|null>(null);
function readLocal<T>(key:string,fallback:T):T{
 try{const result=window.localStorage.getItem(key);return result?JSON.parse(result) as T:fallback}catch{return fallback}
}
export function ShopProvider({children,store}:{children:ReactNode;store:StoreData}){
 const [lines,setLines]=useState<CartLine[]>([]);
 const [favorites,setFavorites]=useState<string[]>([]);
 const [orders,setOrders]=useState<DemoOrder[]>([]);
 const [ready,setReady]=useState(false);
 const [notice,setNotice]=useState("");
 useEffect(()=>{setLines(readLocal("essential-cart-v1",[]));setFavorites(readLocal("essential-fav-v1",[]));setOrders(readLocal("essential-orders-v1",[]));setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("essential-cart-v1",JSON.stringify(lines))},[ready,lines]);
 useEffect(()=>{if(ready)localStorage.setItem("essential-fav-v1",JSON.stringify(favorites))},[ready,favorites]);
 useEffect(()=>{if(ready)localStorage.setItem("essential-orders-v1",JSON.stringify(orders))},[ready,orders]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),3800);return()=>clearTimeout(timer)},[notice]);
 const notify=useCallback((message:string)=>setNotice(message),[]);
 const dismiss=useCallback(()=>setNotice(""),[]);

 /** Do not silently send saved cart IDs that no longer exist in the live catalog.
  * Never clear a cart while the live store is unavailable and showing demo fallback.
  * Inventory/variant checks are repeated by the server on order submission.
  */
 useEffect(()=>{
  if(!ready||!store.live||!lines.length)return;
  let changed=false;
  const updated:CartLine[]=[];
  for(const line of lines){
   const product=store.products.find(item=>item.id===line.productId);
   const variant=product?.variants?.find(item=>item.id===line.variantId);
   if(!product||(product.variants?.length&&!variant)){
    changed=true;
    continue;
   }
   const available=Math.max(0,variant?.inventory??product.inventory);
   if(available===0){
    changed=true;
    continue;
   }
   const quantity=Math.min(available,Math.max(1,Math.floor(line.quantity)));
   const id=product.id+"|"+(line.variantId||"");
   if(quantity!==line.quantity||id!==line.id)changed=true;
   updated.push({...line,id,quantity});
  }
  if(changed){
   setLines(updated);
   notify("سبد خرید با محصولات و موجودی جدید هماهنگ شد. لطفاً آن را بررسی کنید.");
  }
 },[ready,store.live,store.products,lines,notify]);
 const add=useCallback((product:Product,variantId?:string,quantity=1)=>{
  const variant=product.variants?.find(v=>v.id===variantId);
  if(product.variants?.length&&!variant){notify("ابتدا رنگ یا سایز محصول را انتخاب کنید");return}
  const limit=Math.max(0,variant?variant.inventory:product.inventory);
  if(limit===0){notify("این محصول یا تنوع انتخاب‌شده فعلاً ناموجود است");return}
  const id=product.id+"|"+(variantId||"");
  setLines(old=>{
   const current=old.find(x=>x.id===id),updated=Math.min(limit,(current?.quantity||0)+Math.max(1,quantity));
   return current?old.map(x=>x.id===id?{...x,quantity:updated}:x):[...old,{id,productId:product.id,variantId,quantity:Math.min(limit,Math.max(1,quantity))}];
  });
  notify("محصول به سبد خرید اضافه شد");
 },[notify]);
 const setQuantity=useCallback((id:string,quantity:number)=>{
  if(quantity<=0){setLines(old=>old.filter(x=>x.id!==id));return}
  setLines(old=>old.flatMap(x=>{
   if(x.id!==id)return [x];
   const p=store.products.find(p=>p.id===x.productId),v=p?.variants?.find(v=>v.id===x.variantId);
   if(!p||(p.variants?.length&&!v))return [];
   const limit=v?v.inventory:p.inventory;
   if(limit<=0)return [];
   return [{...x,quantity:Math.min(limit,Math.max(1,quantity))}];
  }));
 },[store.products]);
 const remove=useCallback((id:string)=>setLines(old=>old.filter(x=>x.id!==id)),[]);
 const clear=useCallback(()=>setLines([]),[]);
 const toggleFavorite=useCallback((id:string)=>{setFavorites(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);},[]);
 const checkout=useCallback(async(data:Omit<DemoOrder,"id"|"createdAt">,coupon?:string,shippingId?:string)=>{
  let id="DEMO-"+Date.now().toString(36).toUpperCase();
  let total=data.total,shipping=data.shipping,discount=data.discount;
  let status:DemoOrder["status"]="در انتظار اتصال پرداخت";
  if(store.live){
   const response=await fetch("/api/store/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    buyer:{name:data.customerName,phone:data.phone,email:data.email||"",province:data.province||"",city:data.city,
     address:data.address,postal:data.postalCode||"",note:data.note||""},
    items:data.items.map(item=>({productId:item.productId,variantId:item.variantId,quantity:item.quantity})),
    shippingId,coupon:coupon?.trim()||undefined})});
   const payload=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(payload.error||"ثبت سفارش انجام نشد");
   id=String(payload.order?.number||payload.order?.id||id);
   total=Number(payload.order?.total??total);shipping=Number(payload.order?.shipping??shipping);
   discount=Number(payload.order?.discount??discount);
  }
  const order:DemoOrder={...data,id,createdAt:new Date().toISOString(),total,shipping,discount,status};
  setOrders(old=>[order,...old]);setLines([]);
  return order;
 },[store.live]);
 const value=useMemo<ShopContextType>(()=>({store,lines,favorites,orders,ready,count:lines.reduce((n,x)=>n+x.quantity,0),notice,add,setQuantity,remove,clear,isFavorite:(id:string)=>favorites.includes(id),toggleFavorite,checkout,notify,dismiss}),[store,lines,favorites,orders,ready,notice,add,setQuantity,remove,clear,toggleFavorite,checkout,notify,dismiss]);
 return <ShopContext.Provider value={value}>{children}{notice&&<div className="toast" role="status"><span className="toast-dot"/>{notice}<button aria-label="بستن اعلان" onClick={dismiss}>×</button></div>}</ShopContext.Provider>
}
export function useShop(){const state=useContext(ShopContext);if(!state)throw new Error("ShopProvider missing");return state}
