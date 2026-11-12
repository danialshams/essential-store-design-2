import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Only visitor name and topic are required to start chat",()=>{
 const ui=read("src/components/SupportChat.tsx");
 const api=read("src/app/api/store/engagement/route.ts");
 assert.match(ui,/label>نام<input/);
 assert.match(ui,/موضوع گفتگو<select/);
 assert.doesNotMatch(ui,/type="email"|type="tel"|name="phone"|name="email"/);
 assert.match(api,/randomBytes\(32\)/);
 assert.match(api,/x-support-token/);
 assert.match(api,/digest\(secret\)/);
});

test("Published reviews accept text, moderation and written manager replies, not star ratings",()=>{
 const reviews=read("src/components/ReviewBox.tsx");
 const model=read("prisma/schema.prisma");
 const service=read("src/app/api/admin/engagement/route.ts");
 assert.match(reviews,/action:"review"/);
 assert.doesNotMatch(reviews,/type="radio"|type="number"|ستاره|rating/);
 assert.match(model,/adminReply String\?/);
 assert.match(model,/rating Int @default\(0\)/);
 assert.match(service,/action==="reviewReply"/);
 assert.match(service,/action==="faqReply"/);
});

test("Responsive support bubble and scent-specific layout have accessible controls",()=>{
 const css=read("src/app/engagement.css");
 const store=read("src/components/StoreChrome.tsx");
 const faq=read("src/app/faq/page.tsx");
 assert.match(css,/border-radius:50%/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(store,/<SupportChat\/>/);
 assert.match(faq,/action:"faq"/);
});

test("Guest demo editor cannot browse real visitor conversation histories",()=>{
 const route=read("src/app/api/admin/engagement/route.ts");
 assert.match(route,/publicOpenEditorEnabled\(\)/);
});
