import {NextRequest,NextResponse} from "next/server";
import {createHash,randomBytes} from "node:crypto";
import {db} from "@/lib/admin/db";
import {publicOpenEditorEnabled} from "@/lib/admin/security";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const response=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const value=(data:unknown,max:number)=>typeof data==="string"?data.trim().slice(0,max):"";
const digest=(key:string)=>createHash("sha256").update(key).digest("hex");
// Marker t is outside hexadecimal SHA-256; it separates temporary demo chats without a database migration.
const demoDigest=(key:string)=>"t"+digest(key).slice(1);
async function verifiedThread(req:NextRequest,id:string){
 const secret=req.headers.get("x-support-token")||"";
 if(!/^[\w-]{30,100}$/.test(secret)||!id)return null;
 return db.supportThread.findFirst({where:{id,tokenHash:{in:[digest(secret),demoDigest(secret)]}}});
}
export async function GET(req:NextRequest){
 const type=req.nextUrl.searchParams.get("type");
 try{
  if(type==="settings"){
   const config=await db.supportSettings.findUnique({where:{id:"main"}});
   return response({enabled:config?.enabled??true,welcome:config?.welcome||"سلام! چطور می‌توانیم کمکتان کنیم؟",expectedResponse:config?.expectedResponse||"پشتیبان در اولین فرصت پاسخ می‌دهد.",workingHours:config?.workingHours||""});
  }
  if(type==="faq"){
   const items=await db.faqItem.findMany({where:{published:true,answer:{not:null}},orderBy:{updatedAt:"desc"},take:40,select:{id:true,question:true,answer:true}});
   return response({items});
  }
  if(type==="reviews"){
   const productId=value(req.nextUrl.searchParams.get("productId"),80);
   if(!productId)return response({error:"محصول مشخص نیست."},400);
   const items=await db.review.findMany({where:{productId,status:"APPROVED"},orderBy:{createdAt:"desc"},take:60,select:{id:true,author:true,body:true,adminReply:true,createdAt:true}});
   return response({items});
  }
  if(type==="messages"){
   const thread=await verifiedThread(req,value(req.nextUrl.searchParams.get("threadId"),80));
   if(!thread)return response({error:"گفتگو معتبر نیست."},403);
   const messages=await db.supportMessage.findMany({where:{threadId:thread.id},orderBy:{createdAt:"asc"},take:150,select:{id:true,role:true,body:true,createdAt:true}});
   return response({messages,status:thread.status});
  }
  return response({error:"درخواست نامعتبر است."},400);
 }catch{return response({error:"دریافت اطلاعات فعلاً ممکن نیست."},503)}
}
export async function POST(req:NextRequest){
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return response({error:"درخواست معتبر نیست."},400)}
 const action=value(body.action,20);
 try{
  if(action==="review"){
   const productId=value(body.productId,80),text=value(body.text,1200);
   if(text.length<5)return response({error:"لطفاً متن دیدگاه را کامل بنویسید."},422);
   const product=await db.product.findFirst({where:{id:productId,status:"ACTIVE"},select:{id:true}});
   if(!product)return response({error:"محصول یافت نشد."},404);
   const recent=await db.review.count({where:{productId,body:text,createdAt:{gte:new Date(Date.now()-24*3600000)}}});
   if(recent>0)return response({error:"این دیدگاه قبلاً ثبت شده است."},409);
   await db.review.create({data:{productId,author:"مهمان",body:text,rating:0,status:"PENDING"}});
   return response({success:true,message:"دیدگاه شما برای بررسی مدیر ثبت شد."},201);
  }
  if(action==="faq"){
   const question=value(body.question,600);
   if(question.length<8)return response({error:"سؤال را واضح‌تر بنویسید."},422);
   await db.faqItem.create({data:{question,published:false}});
   return response({success:true,message:"سؤال شما ثبت شد و پس از پاسخ مدیر نمایش داده می‌شود."},201);
  }
  if(action==="start"){
   const name=value(body.name,60),subject=value(body.subject,100);
   if(name.length<2||subject.length<2)return response({error:"نام و موضوع گفتگو را وارد کنید."},422);
   const settings=await db.supportSettings.findUnique({where:{id:"main"},select:{enabled:true}});
   if(settings?.enabled===false)return response({error:"چت در حال حاضر غیرفعال است."},403);
   const secret=randomBytes(32).toString("base64url");
   const thread=await db.supportThread.create({data:{visitorName:name,subject,tokenHash:publicOpenEditorEnabled()?demoDigest(secret):digest(secret)}});
   return response({threadId:thread.id,token:secret},201);
  }
  if(action==="message"){
   const threadId=value(body.threadId,80),message=value(body.message,1800);
   if(message.length<1)return response({error:"پیام خالی است."},422);
   const thread=await verifiedThread(req,threadId);
   if(!thread)return response({error:"گفتگو معتبر نیست."},403);
   if(thread.status==="CLOSED")return response({error:"این گفتگو بسته شده است."},409);
   const volume=await db.supportMessage.count({where:{threadId,role:"VISITOR",createdAt:{gte:new Date(Date.now()-600000)}}});
   if(volume>=25)return response({error:"لطفاً چند دقیقه بعد پیام بفرستید."},429);
   await db.$transaction([
    db.supportMessage.create({data:{threadId,role:"VISITOR",body:message}}),
    db.supportThread.update({where:{id:threadId},data:{updatedAt:new Date()}})
   ]);
   return response({success:true},201);
  }
  return response({error:"عملیات شناخته‌شده نیست."},400);
 }catch{return response({error:"ثبت درخواست فعلاً ممکن نیست."},503)}
}
