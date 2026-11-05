import {redirect} from "next/navigation";
import {publicOpenEditorEnabled} from "@/lib/admin/security";
import "../admin/admin-base.css";
import "../admin/edition-two-admin.css";
import LoginForm from "./LoginForm";

export default function Login(){
 if(publicOpenEditorEnabled())redirect("/admin");
 return <LoginForm/>;
}
