import {NextResponse} from "next/server";
import {loadStore} from "@/lib/live-store";
export const dynamic="force-dynamic";
export async function GET(){const store=await loadStore();return NextResponse.json({products:store.products,demo:!store.live},{headers:{"Cache-Control":"public, s-maxage=10, stale-while-revalidate=20"}})}
