import {NextRequest,NextResponse} from "next/server";

export const runtime="nodejs";
export async function POST(request:NextRequest){
 const origin=process.env.STOREFRONT_ADMIN_ORIGIN?.trim().replace(/\/$/,"");
 const secret=process.env.STOREFRONT_API_SECRET;
 if((!origin&&process.env.STORE_ADMIN_LOCAL!=="1")||!secret||secret.length<32)return NextResponse.json({error:"اتصال سفارش‌های فروشگاه هنوز فعال نیست."},{status:503});
 const source=request.headers.get("origin");
 if(!source||new URL(source).host!==request.nextUrl.host)return NextResponse.json({error:"درخواست از مبدا نامعتبر است."},{status:403});
 const raw=await request.text();
 if(raw.length>30000)return NextResponse.json({error:"اطلاعات سفارش بیش از حد مجاز است."},{status:413});
 try{
  if(process.env.STORE_ADMIN_LOCAL==="1"){
   if(!process.env.DATABASE_URL)return NextResponse.json({error:"پایگاه داده فروشگاه هنوز متصل نیست."},{status:503});
   const {processLocalOrder}=await import("@/lib/admin/order-service");
   const internal=new NextRequest(request.url,{method:"POST",
    headers:{"Content-Type":"application/json","x-storefront-key":secret},
    body:raw});
   return await processLocalOrder(internal);
  }
  const response=await fetch(`${origin}/api/store/order`,{
   method:"POST",headers:{"Content-Type":"application/json","x-storefront-key":secret},
   body:raw,cache:"no-store",signal:AbortSignal.timeout(12000)});
  const payload=await response.json().catch(()=>({error:"پاسخی از سامانه سفارش دریافت نشد."}));
  return NextResponse.json(payload,{status:response.status,headers:{"Cache-Control":"no-store"}});
 }catch(error){console.error("Store order upstream failed",error);
  return NextResponse.json({error:"ارتباط با پنل مدیریت برقرار نیست؛ سفارشی ثبت نشده است."},{status:503});}
}
