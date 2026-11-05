import type {Metadata,Viewport} from "next";
import {StoreChrome} from "@/components/StoreChrome";




import {loadStore} from "@/lib/live-store";
import "./globals.css";
import "./premium.css";
import "./cinematic.css";
import "./editorial-refinement.css";
import "./cinematic-finish.css";
import "./editorial-motion-polish.css";
import "./editorial-mobile-hero.css";
import "./editorial-quality-pass.css";
import "./editorial-precision.css";
export async function generateMetadata():Promise<Metadata>{const store=await loadStore();return {title:{default:store.settings.seoTitle||store.settings.storeName,template:`%s | ${store.settings.storeName}`},description:store.settings.seoDescription||store.settings.description,robots:{index:store.live,follow:store.live}};}
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#ffffff"};
export const dynamic="force-dynamic";
export default async function RootLayout({children}:{children:React.ReactNode}){const store=await loadStore();return <html lang="fa" dir="rtl"><head><link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous"/></head><body><StoreChrome store={store}>{children}</StoreChrome></body></html>}
