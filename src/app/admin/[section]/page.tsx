import {notFound} from "next/navigation";
import {modules} from "@/lib/admin/config";
import {ModuleManager} from "@/components/admin/ModuleManager";
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params;if(!modules[section])notFound();
 return <ModuleManager section={section}/>;
}
