import {NextRequest,NextResponse} from "next/server";
import {createHash,timingSafeEqual} from "node:crypto";
import {z} from "zod";
import {db} from "@/lib/admin/db";

export const runtime="nodejs";
const buyer=z.object({name:z.string().trim().min(2).max(150),phone:z.string().regex(/^09\d{9}$/),
 email:z.union([z.email(),z.literal("")]).optional(),province:z.string().trim().max(100).default(""),
 city:z.string().trim().max(100).default(""),address:z.string().trim().max(1000).default(""),
 postal:z.string().trim().max(20).default(""),note:z.string().trim().max(1200).default("")});
const schema=z.object({buyer,items:z.array(z.object({productId:z.string().min(1).max(150),variantId:z.string().max(150).optional(),quantity:z.number().int().min(1).max(30)})).min(1).max(40),
 shippingId:z.string().min(1).max(150),coupon:z.string().trim().max(48).optional()}).strict();
const fail=(error:string,status:number,code?:string)=>NextResponse.json(
 {error,...(code?{code}:{})},{status,headers:{"Cache-Control":"no-store"}}
);
/** These are expected client/business conflicts, not production server errors. */
class OrderConflict extends Error {
 constructor(message:string,readonly code:string){super(message);this.name="OrderConflict";}
}
const equal=(a:string,b:string)=>{const x=createHash("sha256").update(a).digest(),y=createHash("sha256").update(b).digest();return timingSafeEqual(x,y)};

/** Server-to-server only. The shared secret must never reach browser JavaScript. */
export async function processLocalOrder(req:NextRequest){
 const secrets=[process.env.STORE_API_SECRET,process.env.STORE_API_SECRET_V2,process.env.STORE_API_SECRET_V3,
  process.env.STORE_ADMIN_LOCAL==="1"?process.env.STOREFRONT_API_SECRET:undefined]
  .filter((key):key is string=>typeof key==="string" && key.length>=32);
 if(!secrets.length)return fail("Order service is not configured",503);
 const supplied=req.headers.get("x-storefront-key")||"";
 if(!secrets.some(secret=>equal(supplied,secret)))return fail("Unauthorized",401);
 if(Number(req.headers.get("content-length")||0)>30000)return fail("Request too large",413);
 const parsed=schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return fail("اطلاعات سفارش معتبر نیست.",400);
 const input=parsed.data;

 try{
  const result=await db.$transaction(async tx=>{
   const settings=await tx.storeSettings.findUnique({where:{id:"main"}});
   if(settings?.siteType==="CORPORATE")throw new OrderConflict("فروشگاه فعال نیست.","STORE_INACTIVE");
   // Prevent accidental duplicate submissions without turning pending orders into payments.
   const recent=await tx.order.findFirst({where:{customerPhone:input.buyer.phone,status:"PENDING",createdAt:{gte:new Date(Date.now()-90000)}},orderBy:{createdAt:"desc"}});
   if(recent)throw new OrderConflict("سفارش قبلی هنوز در حال بررسی است. کمی بعد دوباره اقدام کنید.","ORDER_PENDING");
   const ids=[...new Set(input.items.map(x=>x.productId))];
   const products=await tx.product.findMany({where:{id:{in:ids},status:"ACTIVE"},include:{variants:true}});
   if(products.length!==ids.length)throw new OrderConflict("یک یا چند کالا دیگر قابل سفارش نیست. سبد خرید را به‌روزرسانی کنید.","ITEM_UNAVAILABLE");
   const purchase=input.items.map(line=>{
    const product=products.find(p=>p.id===line.productId)!;
    const variant=line.variantId?product.variants.find(v=>v.id===line.variantId):undefined;
    if(line.variantId && !variant)throw new OrderConflict("رنگ یا سایز انتخاب‌شده دیگر موجود نیست. سبد خرید را بررسی کنید.","VARIANT_UNAVAILABLE");
    if(product.variants.length && !variant)throw new OrderConflict("رنگ یا سایز محصول را انتخاب کنید.","VARIANT_REQUIRED");
    if(line.quantity>(variant?.inventory??product.inventory))throw new OrderConflict(`موجودی ${product.name} کافی نیست. تعداد سفارش را کاهش دهید.`,"INSUFFICIENT_STOCK");
    const unitPrice=variant?.price??product.price;
    return {productId:product.id,title:product.name+(variant?` – ${variant.label}`:""),sku:variant?.sku??product.sku,quantity:line.quantity,unitPrice,total:unitPrice*line.quantity};
   });
   const subtotal=purchase.reduce((sum,item)=>sum+item.total,0);
   const coupon=input.coupon?await tx.coupon.findUnique({where:{code:input.coupon.toUpperCase()}}):null;
   let discount=0;
   if(input.coupon){
    if(!coupon||!coupon.enabled||(coupon.expiresAt&&coupon.expiresAt.getTime()<Date.now())||
      (coupon.usageLimit!==null&&coupon.usedCount>=coupon.usageLimit)||subtotal<coupon.minSubtotal)
      throw new OrderConflict("کد تخفیف معتبر یا قابل استفاده نیست.","COUPON_INVALID");
    discount=coupon.type==="PERCENT"?Math.floor(subtotal*Math.min(100,coupon.amount)/100):Math.min(subtotal,coupon.amount);
   }
   const shipping=await tx.shippingMethod.findUnique({where:{id:input.shippingId}});
   if(!shipping||!shipping.enabled)throw new OrderConflict("روش ارسال انتخاب‌شده معتبر نیست.","SHIPPING_UNAVAILABLE");
   const pickup=shipping.id==="demo-pickup"||shipping.title.includes("حضوری");
   if(!pickup&&(!input.buyer.province||!input.buyer.city||!input.buyer.address))throw new OrderConflict("نشانی ارسال کامل نیست.","ADDRESS_INCOMPLETE");
   const shippingCost=shipping.freeAbove!==null&&subtotal-discount>=shipping.freeAbove?0:shipping.cost;
   const total=Math.max(0,subtotal-discount+shippingCost);
   // Upsert by phone, avoiding overwrite of previously saved user contact data.
   const customer=await tx.customer.upsert({where:{phone:input.buyer.phone},
    create:{fullName:input.buyer.name,phone:input.buyer.phone,email:input.buyer.email||null},
    update:{fullName:input.buyer.name}});
   const order=await tx.order.create({data:{customerId:customer.id,customerName:input.buyer.name,customerPhone:input.buyer.phone,
     shippingAddress:{recipientName:input.buyer.name,recipientPhone:input.buyer.phone,province:input.buyer.province,
     city:input.buyer.city,street:input.buyer.address,postalCode:input.buyer.postal,email:input.buyer.email||""},
     shippingMethod:shipping.title,shippingCost,
     subtotal,discountTotal:discount,total,status:"PENDING",note:input.buyer.note,items:{create:purchase}}});
   // Coupon redemption and inventory reservation occur only after verified payment.
   await tx.auditLog.create({data:{resource:"orders",resourceId:order.id,operation:"CREATE_FROM_STOREFRONT"}});
   return {id:order.id,number:order.number,subtotal,discount,shipping:shippingCost,total,status:"PENDING"};
  });
  return NextResponse.json({order:result,paymentEnabled:false},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(error){
  if(error instanceof OrderConflict)return fail(error.message,409,error.code);
  // A real database/service failure must remain observable as a server error.
  // Do not classify deliberate invalid-product smoke tests as runtime failures.
  console.error("Public storefront order service failed",error instanceof Error?error.message:"unknown");
  return fail("خطایی در ثبت سفارش رخ داد. لطفاً دوباره تلاش کنید.",503,"ORDER_SERVICE_UNAVAILABLE");
 }
}
