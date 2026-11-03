import type {Metadata} from "next";
import {Suspense} from "react";
import {ProductCollection} from "@/components/ProductCollection";
export const metadata:Metadata={title:"همه محصولات"};
export default function Products(){return <Suspense fallback={<div className="container page-loading">در حال نمایش محصولات...</div>}><ProductCollection/></Suspense>}
