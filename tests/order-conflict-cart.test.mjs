import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(name)=>readFileSync(new URL("../"+name,import.meta.url),"utf8");

test("Invalid catalog items are expected 409 order conflicts, not runtime server errors",()=>{
 const service=read("src/lib/admin/order-service.ts");
 assert.match(service,/class OrderConflict extends Error/);
 assert.match(service,/new OrderConflict\("یک یا چند کالا دیگر قابل سفارش نیست/);
 assert.match(service,/if\(error instanceof OrderConflict\)return fail\(error\.message,409,error\.code\)/);
 assert.match(service,/return fail\("خطایی در ثبت سفارش رخ داد\. لطفاً دوباره تلاش کنید\.",503,"ORDER_SERVICE_UNAVAILABLE"\)/);
 assert.doesNotMatch(service,/console\.error\("Public storefront order rejected"/);
 assert.match(service,/console\.error\("Public storefront order service failed"/);
});

test("Saved cart reconciles live product IDs, sizes and current stock, but not demo fallback",()=>{
 const provider=read("src/components/ShopProvider.tsx");
 assert.match(provider,/if\(!ready\|\|!store\.live\|\|!lines\.length\)return/);
 assert.match(provider,/store\.products\.find\(item=>item\.id===line\.productId\)/);
 assert.match(provider,/product\.variants\?\.find\(item=>item\.id===line\.variantId\)/);
 assert.match(provider,/Math\.min\(available,Math\.max\(1,Math\.floor\(line\.quantity\)\)\)/);
 assert.match(provider,/سبد خرید با محصولات و موجودی جدید هماهنگ شد/);
});

test("Production smoke continues to reject invalid products instead of accepting fake orders",()=>{
 const workflow=read(".github/workflows/production-smoke.yml");
 assert.match(workflow,/\/api\/store\/order/);
 assert.match(workflow,/409/);
});
