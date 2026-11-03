"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {House,LayoutGrid,ShoppingBag,UserRound} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
export function BottomNav(){
 const path=usePathname(),{count}=useShop();
 const entries=[{href:"/",title:"خانه",icon:House},{href:"/products",title:"کالکشن‌ها",icon:LayoutGrid},{href:"/cart",title:"سبد خرید",icon:ShoppingBag},{href:"/account",title:"حساب من",icon:UserRound}];
 return <nav className="premium-bottom-nav" aria-label="ناوبری موبایل">{entries.map(x=>{const Icon=x.icon;const selected=x.href==="/"?path==="/":path.startsWith(x.href)||(x.href==="/products"&&(path.startsWith("/product/")||path.startsWith("/category/")));return <Link href={x.href} key={x.href} aria-current={selected?"page":undefined} className={selected?"is-current":""}><span className="premium-bottom-icon"><Icon size={21} strokeWidth={selected?2:1.5}/>{x.href==="/cart"&&count>0&&<small>{count}</small>}</span><span>{x.title}</span></Link>})}</nav>
}
