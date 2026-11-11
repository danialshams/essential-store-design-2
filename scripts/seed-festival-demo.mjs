/** Only public showroom installations: add sample festival products without touching
 * customer products, accounts, orders or payment records. Idempotent by slug.
 * This step is disabled for normal customer installations and in local CI.
 */
import {PrismaClient} from "@prisma/client";
if(process.env.TEMP_PUBLIC_ADMIN_EDIT!=="1"||!process.env.DATABASE_URL){
 console.log("[festival] live demo seeding disabled for this environment");
 process.exit(0);
}
const fixtures=[
 ["festival-demo-tailored-coat","پالتو زنانه خوش‌دوخت","clothing",3850000,5200000,16,"/images/editorial/chapter-form.webp"],
 ["festival-demo-classic-handbag","کیف دستی چرمی کلاسیک","bags",2980000,3850000,13,"/images/products/bag-main.webp"],
 ["festival-demo-white-sneakers","کتانی سفید لوکس","shoes",2150000,2750000,19,"/images/products/sneakers-main.webp"],
 ["festival-demo-linen-set","ست پوشاک لینن","clothing",2490000,3120000,17,"/images/products/shirt-beige.webp"],
 ["festival-demo-leather-tote","کیف دوشی روزمره","bags",2350000,3100000,21,"/images/products/bag-everyday.webp"],
 ["festival-demo-city-shoes","کتانی شهری اسپرت","shoes",1980000,2550000,24,"/images/products/sneakers-urban.webp"],
 ["festival-demo-classic-watch","ساعت مچی کلاسیک","accessories",3290000,4120000,15,"/images/products/watch-main.webp"],
 ["festival-demo-sunglasses","عینک آفتابی مینیمال","accessories",995000,1430000,26,"/images/products/sunglasses-main.webp"],
 ["festival-demo-evening-style","پیراهن زنانه مجلسی","clothing",2900000,3700000,12,"/images/editorial/story-portrait.webp"],
 ["festival-demo-beige-outfit","پوشاک بژ روزمره","clothing",1890000,2490000,20,"/images/products/shirt-blue.webp"],
 ["festival-demo-compact-bag","کیف دستی کوچک","bags",1590000,2180000,23,"/images/bag.webp"],
 ["festival-demo-sport-shoe","کفش اسپرت راحتی","shoes",1740000,2290000,18,"/images/sneakers.webp"]
];
const db=new PrismaClient();
try{
 const cats=await db.category.findMany({select:{id:true,slug:true}});
 const categoryBySlug=new Map(cats.map(c=>[c.slug,c.id]));
 let added=0;
 for(const [slug,name,category,price,comparePrice,inventory,coverUrl] of fixtures){
  const existing=await db.product.findUnique({where:{slug},select:{id:true}});
  if(existing)continue;
  await db.product.create({data:{slug,name,description:name+" — محصول نمونه قابل مدیریت در پنل فروشگاه",
   price,comparePrice,inventory,featured:false,status:"ACTIVE",coverUrl,
   categoryId:categoryBySlug.get(category)||null}});
  added++;
 }
 console.log("[festival] "+added+" new sample products added; "+fixtures.length+" festival demo slugs available");
}catch(error){
 console.error("[festival] Could not populate sample catalog:",error);
 process.exitCode=1;
}finally{await db.$disconnect()}
