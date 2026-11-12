import {notFound} from "next/navigation";
import {modules} from "@/lib/admin/config";
import {ModuleManager} from "@/components/admin/ModuleManager";
import {EngagementAdmin} from "@/components/admin/EngagementAdmin";
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params;if(!modules[section])notFound();
 if(section==="reviews")return <EngagementAdmin start="reviews"/>;
 return <ModuleManager section={section}/>;
}
