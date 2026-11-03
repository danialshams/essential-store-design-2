import {test} from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("full next storefront routes exist",()=>{
 for(const path of ["src/app/page.tsx","src/app/products/page.tsx","src/app/product/[slug]/page.tsx","src/app/category/[slug]/page.tsx","src/app/cart/page.tsx","src/app/checkout/page.tsx","src/app/checkout/success/page.tsx","src/app/account/page.tsx","src/app/info/[slug]/page.tsx","src/app/api/catalog/route.ts"])
  assert.ok(existsSync(path),`missing ${path}`);
});
test("all product visual demo assets are local",()=>{
 for(const name of ["bag","sneakers","linen-shirt","classic-watch","sunglasses","editorial-hero","editorial-portrait","editorial-bag"])
  assert.ok(existsSync(`public/images/${name}.webp`));
});
test("checkout is a truthful demo with no fake real payment",()=>{
 const checkout=read("src/app/checkout/page.tsx");
 assert.match(checkout,/ثبت سفارش نمایشی/);
 assert.match(checkout,/پرداخت و ثبت سفارش روی سرور فعال نیست/);
 assert.match(checkout,/سفارش در پنل مدیریت با وضعیت در انتظار پرداخت ثبت می‌شود/);
 assert.doesNotMatch(checkout,/https:\/\/[^ ]+gateway\/verify/);
 assert.doesNotMatch(checkout,/<form className="coupon-form"/);
});
test("shared admin public catalog adapter remains read-only",()=>{
 const adapter=read("src/lib/catalog.ts");const api=read("src/app/api/catalog/route.ts");
 assert.match(adapter,/STOREFRONT_CATALOG_URL/);
 assert.match(api,/export async function GET/);
 assert.doesNotMatch(api,/export async function POST|export async function PATCH/);
});
test("mobile navigation and accessible controls present",()=>{
 const bottom=read("src/components/BottomNav.tsx"),home=read("src/app/page.tsx"),css=read("src/app/globals.css");
 assert.match(bottom,/خانه/);assert.match(bottom,/سبد خرید/);assert.match(home,/انتخاب‌های/);
 const premium=read("src/app/premium.css");
 assert.match(premium,/@media \(max-width:760px\)/);
 assert.match(premium,/\.premium-bottom-nav/);
});
