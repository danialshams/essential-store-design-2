import {NextRequest,NextResponse} from "next/server";
import type {Prisma} from "@prisma/client";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {db} from "@/lib/admin/db";
import {requireApiAdmin} from "@/lib/admin/security";
import {readSeoConfig,normalizeSeoPath} from "@/lib/seo";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const httpsUrl=z.union([z.literal(""),z.string().trim().url().refine(s=>s.startsWith("https://"),"آدرس باید با https:// شروع شود").max(2000)]);
const picture=z.union([z.literal(""),z.string().trim().max(2000).refine(s=>s.startsWith("/")&&!s.startsWith("//")||s.startsWith("https://"),"تصویر باید آدرس داخلی یا HTTPS داشته باشد")]);
const p=z.object({
 title:z.string().trim().max(135).optional(),
 description:z.string().trim().max(550).optional(),
 imageUrl:picture.optional(),
 imageAlt:z.string().trim().max(250).optional(),
 canonical:z.union([httpsUrl,z.string().startsWith("/").max(300).refine(x=>!x.startsWith("//"))]).optional(),
 noindex:z.boolean().optional(),
 noarchive:z.boolean().optional()
}).strict();
const config=z.object({
 siteUrl:httpsUrl,
 siteName:z.string().trim().max(120),
 titleSeparator:z.string().max(12),
 defaultImage:picture,
 defaultImageAlt:z.string().trim().max(250),
 language:z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/).max(12),
 indexSite:z.boolean(),
 googleVerification:z.string().trim().max(300),
 bingVerification:z.string().trim().max(300),
 twitterHandle:z.string().trim().max(100),
 companyName:z.string().trim().max(150),
 companyLogo:picture,
 socialProfiles:z.array(httpsUrl.refine(Boolean)).max(12),
 pages:z.record(z.string().max(300),p).superRefine((obj,ctx)=>{
  if(Object.keys(obj).length>1300)ctx.addIssue({code:"custom",message:"حداکثر ۱۳۰۰ آدرس قابل تنظیم است"});
  for(const k of Object.keys(obj))if(!k.startsWith("/")||k.startsWith("//")||normalizeSeoPath(k)!==k)
   ctx.addIssue({code:"custom",message:"مسیر نامعتبر: "+k});
 })
}).strict();
const schema=z.object({
 seoTitle:z.string().trim().max(120),
 seoDescription:z.string().trim().max(550),
 seoConfig:config
}).strict();
async function requireAdmin(request:NextRequest){
 const x=await requireApiAdmin(request);
 if("error" in x)return NextResponse.json({error:x.error},{status:x.status});
 return null;
}
export async function GET(request:NextRequest){
 const unauthorized=await requireAdmin(request);if(unauthorized)return unauthorized;
 const [settings,products,categories,articles,pages]=await Promise.all([
  db.storeSettings.upsert({where:{id:"main"},create:{id:"main"},update:{}}),
  db.product.findMany({select:{slug:true,name:true,coverUrl:true,status:true},orderBy:{createdAt:"desc"},take:650}),
  db.category.findMany({select:{slug:true,name:true,imageUrl:true},orderBy:{name:"asc"}}),
  db.article.findMany({select:{slug:true,title:true,coverUrl:true,status:true},orderBy:{createdAt:"desc"},take:200}),
  db.page.findMany({select:{slug:true,title:true,status:true},orderBy:{title:"asc"},take:200})
 ]);
 const items=[
  {path:"/",title:"صفحه اصلی",imageUrl:null},
  {path:"/products",title:"همه محصولات",imageUrl:null},
  {path:"/blog",title:"مقالات و آموزش",imageUrl:null},
  ...products.filter(x=>x.status==="ACTIVE").map(x=>({path:"/product/"+x.slug,title:x.name,imageUrl:x.coverUrl})),
  ...categories.map(x=>({path:"/category/"+x.slug,title:x.name,imageUrl:x.imageUrl})),
  ...articles.filter(x=>x.status==="PUBLISHED").map(x=>({path:"/blog/"+x.slug,title:x.title,imageUrl:x.coverUrl})),
  ...pages.filter(x=>x.status==="PUBLISHED").map(x=>({path:"/info/"+x.slug,title:x.title,imageUrl:null})),
  ...["about","contact","faq","terms","shipping","privacy"].map(slug=>({
    path:"/info/"+slug,title:({about:"درباره ما",contact:"تماس با ما",faq:"سؤالات متداول",terms:"قوانین",shipping:"ارسال",privacy:"حریم خصوصی"} as Record<string,string>)[slug],imageUrl:null
  }))
 ];
 return NextResponse.json({seoTitle:settings.seoTitle||"",seoDescription:settings.seoDescription||"",
  seoConfig:readSeoConfig(settings.seoConfig),storeName:settings.storeName,
  items:Array.from(new Map(items.map(x=>[x.path,x])).values())},{headers:{"Cache-Control":"no-store"}});
}
export async function PUT(request:NextRequest){
 const unauthorized=await requireAdmin(request);if(unauthorized)return unauthorized;
 const data=schema.safeParse(await request.json().catch(()=>null));
 if(!data.success)return NextResponse.json({error:data.error.issues.map(x=>x.path.join(".")+": "+x.message).join("، ")},{status:400});
 const d=data.data;
 if(d.seoConfig.indexSite&&!d.seoConfig.siteUrl)
  return NextResponse.json({error:"قبل از فعال‌کردن ایندکس، دامنه اصلی HTTPS سایت را ثبت کنید."},{status:400});
 const saved=await db.storeSettings.upsert({
  where:{id:"main"},create:{id:"main",seoTitle:d.seoTitle,seoDescription:d.seoDescription,
   seoConfig:d.seoConfig as Prisma.InputJsonValue},
  update:{seoTitle:d.seoTitle,seoDescription:d.seoDescription,seoConfig:d.seoConfig as Prisma.InputJsonValue}
 });
 await db.auditLog.create({data:{resource:"seo",resourceId:"main",operation:"UPDATE"}});
 revalidatePath("/","layout");
 return NextResponse.json({saved:true,seoTitle:saved.seoTitle,seoDescription:saved.seoDescription,
  seoConfig:readSeoConfig(saved.seoConfig)});
}
