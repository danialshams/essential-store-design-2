import "./admin-base.css";
import "./edition-two-admin.css";
import {redirect} from "next/navigation";
import {currentAdmin} from "@/lib/admin/security";
import {EditionTwoShell} from "@/components/admin/EditionTwoShell";
export const dynamic="force-dynamic";
export default async function Layout({children}:{children:React.ReactNode}){
 if(process.env.NEXT_PUBLIC_STUDIO_DEMO === "1")return <EditionTwoShell email="demo@studio.local">{children}</EditionTwoShell>;
 const admin=await currentAdmin();if(!admin)redirect("/login");
 return <EditionTwoShell email={admin.email}>{children}</EditionTwoShell>;
}
