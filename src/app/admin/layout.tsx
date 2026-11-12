import type {Metadata} from "next";
export const metadata:Metadata={title:"پنل مدیریت | ESSENTIAL 02",robots:{index:false,follow:false}};
import "./admin-base.css";
import "./edition-two-admin.css";
import "./seo-studio.css";
import {redirect} from "next/navigation";
import {currentAdmin,publicOpenEditorEnabled} from "@/lib/admin/security";
import {EditionTwoShell} from "@/components/admin/EditionTwoShell";
export const dynamic="force-dynamic";
export default async function Layout({children}:{children:React.ReactNode}){
 if(publicOpenEditorEnabled())return <EditionTwoShell email="ویرایش مستقیم سایت" publicAdmin>{children}</EditionTwoShell>;
 if(process.env.NEXT_PUBLIC_STUDIO_DEMO === "1")return <EditionTwoShell email="demo@studio.local">{children}</EditionTwoShell>;
 if(!process.env.DATABASE_URL)redirect("/login");
 const admin=await currentAdmin();if(!admin)redirect("/login");
 return <EditionTwoShell email={admin.email}>{children}</EditionTwoShell>;
}
