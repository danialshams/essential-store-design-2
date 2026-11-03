import Link from "next/link";
import {ChevronLeft} from "lucide-react";
export function SectionHeading({title,href="/products",linkLabel="مشاهده همه محصولات"}:{title:string;href?:string;linkLabel?:string}){return <div className="section-heading"><h2>{title}</h2><Link href={href}>{linkLabel}<ChevronLeft size={17}/></Link></div>}
