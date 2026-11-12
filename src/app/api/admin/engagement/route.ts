import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/admin/db";
import {requireApiAdmin,publicOpenEditorEnabled} from "@/lib/admin/security";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const reply=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{"Cache-Control":"private, no-store"}});
const text=(x:unknown,n:number)=>typeof x==="string"?x.trim().slice(0,n):"";
async function check(req:NextRequest){
 const auth=await requireApiAdmin(req);
 if("error" in auth)return reply({error:auth.error},auth.status);
 return null;
}
export async function GET(req:NextRequest){
 const invalid=await check(req);if(invalid)return invalid;
 const view=req.nextUrl.searchParams.get("view");
 try{
  if(view==="reviews"){
   return reply({items:await db.review.findMany({orderBy:{createdAt:"desc"},take:100,select:{id:true,productId:true,body:true,author:true,status:true,adminReply:true,createdAt:true,product:{select:{name:true}}}})});
  }
  if(view==="faq")return reply({items:await db.faqItem.findMany({orderBy:{createdAt:"desc"},take:100})});
  if(view==="settings")return reply({item:await db.supportSettings.findUnique({where:{id:"main"}})});
  if(view==="threads"||view==="thread"){
   // A temporarily public demo editor must never disclose real visitor chats.
   if(publicOpenEditorEnabled())return reply({error:"گفتگوهای واقعی فقط برای مدیر احرازشده قابل مشاهده است."},403);
   if(view==="threads")return reply({items:await db.supportThread.findMany({orderBy:{updatedAt:"desc"},take:80,select:{id:true,visitorName:true,subject:true,status:true,updatedAt:true,_count:{select:{messages:true}}}})});
   const id=text(req.nextUrl.searchParams.get("id"),80);
   const thread=await db.supportThread.findUnique({where:{id},select:{id:true,visitorName:true,subject:true,status:true}});
   if(!thread)return reply({error:"گفتگو یافت نشد."},404);
   const messages=await db.supportMessage.findMany({where:{threadId:id},orderBy:{createdAt:"asc"},take:150,select:{id:true,role:true,body:true,createdAt:true}});
   return reply({thread,messages});
  }
  return reply({error:"بخش نامعتبر است."},400);
 }catch{return reply({error:"دریافت داده‌ها ممکن نیست."},503)}
}
export async function POST(req:NextRequest){
 const invalid=await check(req);if(invalid)return invalid;
 let data:Record<string,unknown>;
 try{data=await req.json()}catch{return reply({error:"داده نامعتبر است."},400)}
 const action=text(data.action,50),id=text(data.id,80);
 try{
  if(action==="review"){
   const status=text(data.status,20);
   if(!["PENDING","APPROVED","REJECTED"].includes(status))return reply({error:"وضعیت نامعتبر است."},422);
   await db.review.update({where:{id},data:{status:status as "PENDING"|"APPROVED"|"REJECTED"}});
   return reply({success:true});
  }
  if(action==="reviewReply"){
   const adminReply=text(data.answer,1500);
   await db.review.update({where:{id},data:{adminReply:adminReply||null}});
   return reply({success:true});
  }
  if(action==="faqReply"){
   const answer=text(data.answer,2000);
   await db.faqItem.update({where:{id},data:{answer:answer||null,published:!!answer&&data.published===true}});
   return reply({success:true});
  }
  if(action==="faqCreate"){
   const question=text(data.question,600),answer=text(data.answer,2000);
   if(question.length<8)return reply({error:"متن سؤال کوتاه است."},422);
   await db.faqItem.create({data:{question,answer:answer||null,published:!!answer}});
   return reply({success:true},201);
  }
  if(action==="settings"){
   const welcome=text(data.welcome,250),expectedResponse=text(data.expectedResponse,200),workingHours=text(data.workingHours,250);
   if(!welcome||!expectedResponse)return reply({error:"پیام خوشامدگویی و زمان پاسخ‌گویی لازم است."},422);
   await db.supportSettings.upsert({where:{id:"main"},create:{welcome,expectedResponse,workingHours,enabled:data.enabled!==false},update:{welcome,expectedResponse,workingHours,enabled:data.enabled!==false}});
   return reply({success:true});
  }
  if(action==="chatReply"||action==="chatStatus"){
   if(publicOpenEditorEnabled())return reply({error:"پاسخ به پیام مشتری نیازمند ورود مدیر است."},403);
   const thread=await db.supportThread.findUnique({where:{id}});
   if(!thread)return reply({error:"گفتگو پیدا نشد."},404);
   if(action==="chatStatus"){
    const status=text(data.status,20);
    if(!["OPEN","CLOSED"].includes(status))return reply({error:"وضعیت نامعتبر است."},422);
    await db.supportThread.update({where:{id},data:{status}});
    return reply({success:true});
   }
   const body=text(data.body,1800);
   if(!body)return reply({error:"متن پاسخ خالی است."},422);
   await db.$transaction([
    db.supportMessage.create({data:{threadId:id,role:"ADMIN",body}}),
    db.supportThread.update({where:{id},data:{status:"OPEN",updatedAt:new Date()}})
   ]);
   return reply({success:true});
  }
  return reply({error:"عملیات شناخته‌شده نیست."},400);
 }catch{return reply({error:"ذخیره‌سازی انجام نشد. دوباره تلاش کنید."},503)}
}
