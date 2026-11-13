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

test("Public demo chat is tagged and hidden from real customer conversation views",()=>{
 const route=read("src/app/api/admin/engagement/route.ts");
 const store=read("src/app/api/store/engagement/route.ts");
 assert.match(route,/tokenHash:\{startsWith:"t"\}/);
 assert.match(route,/findFirst\(\{where:\{id,\.\.\.demoScope\}/);
 assert.match(store,/demoDigest\(secret\)/);
 assert.match(store,/tokenHash:\{in:\[digest\(secret\),demoDigest\(secret\)\]\}/);
});

test("Chat anchors right, navigation overlays chat and mobile inputs do not trigger iOS Safari zoom",()=>{
 const css=read("src/app/engagement.css");
 assert.match(css,/\.support-root\{position:fixed;bottom:22px;right:22px;left:auto/);
 assert.match(css,/\.support-window\{position:absolute;bottom:72px;right:0;left:auto/);
 assert.match(css,/\.support-root\{right:12px;left:auto;bottom:/);
 assert.ok(css.includes(".premium-drawer-root{z-index:3200}"));
 assert.ok(css.includes("body:has(.premium-drawer-root.is-open) .support-root"));
 assert.match(css,/@media \(max-width:767px\)/);
 assert.match(css,/select\{font-size:16px!important\}/);
});
