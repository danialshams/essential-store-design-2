import Link from "next/link";
import {ArrowLeft,Search} from "lucide-react";
export default function NotFound(){return <div className="container not-found"><Search size={40}/><span>۴۰۴</span><h1>این صفحه پیدا نشد</h1><p>شاید آدرس اشتباه وارد شده یا محصول حذف شده باشد.</p><Link href="/" className="button button-primary">بازگشت به خانه <ArrowLeft size={18}/></Link></div>}
