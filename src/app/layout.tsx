import type {Metadata,Viewport} from "next";
import {StoreChrome} from "@/components/StoreChrome";




import {loadStore} from "@/lib/live-store";
import {seoMeta} from "@/lib/seo";
import "./globals.css";
import "./festival.css";
import "./premium.css";
import "./cinematic.css";
import "./editorial-refinement.css";
import "./cinematic-finish.css";
import "./editorial-motion-polish.css";
import "./editorial-mobile-hero.css";
import "./editorial-quality-pass.css";
import "./editorial-precision.css";
import "./visual-upgrade.css";
import "./product-theme-polish.css";
import "./engagement.css";
export async function generateMetadata():Promise<Metadata>{
 const store=await loadStore();
 const base=seoMeta(store,"/",{title:store.settings.seoTitle||store.settings.storeName,
  description:store.settings.seoDescription||store.settings.description});
 // Child routes override noindex explicitly after checking published content.
 return {...base,alternates:undefined,robots:{index:false,follow:false}};
}
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#ffffff"};
export const dynamic="force-dynamic";
export default async function RootLayout({children}:{children:React.ReactNode}){const store=await loadStore();return <html lang="fa" dir="rtl"><head><link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous"/></head><body><StoreChrome store={store}>{children}</StoreChrome></body></html>}
