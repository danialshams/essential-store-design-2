"use client";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
import {ShopProvider} from "@/components/ShopProvider";
import {Header} from "@/components/Header";
import {BottomNav} from "@/components/BottomNav";
import {Footer} from "@/components/Footer";
import {SiteMotion} from "@/components/SiteMotion";
import type {StoreData} from "@/lib/live-store";
/** Same deployment hosts both the visual storefront and its private /admin UI.
 * The commercial site chrome must never wrap the administration screens. */
export function StoreChrome({children,store}:{children:ReactNode;store:StoreData}){
 const pathname=usePathname()||"/";
 if(pathname.startsWith("/admin")||pathname==="/login")return <>{children}</>;
 return <ShopProvider store={store}><Header/><main id="main-content"><SiteMotion>{children}</SiteMotion></main><Footer/><BottomNav/></ShopProvider>;
}
