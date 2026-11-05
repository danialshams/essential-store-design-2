import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync,existsSync} from "node:fs";
const load=p=>readFileSync(p,"utf8");

test("The visual Edition 02 administrator and storefront share a Next.js repository",()=>{
 assert.ok(existsSync("src/app/admin/editorial/page.tsx"));
 assert.ok(existsSync("src/app/api/admin/edition-2/route.ts"));
 assert.ok(existsSync("src/app/api/store/bootstrap/route.ts"));
 assert.ok(existsSync("src/lib/admin/order-service.ts"));
 const chrome=load("src/components/StoreChrome.tsx");
 assert.match(chrome,/pathname\.startsWith\("\/admin"\)/);
 assert.match(chrome,/<Header\/>/);
 assert.match(chrome,/SiteMotion/);
 const css=load("src/app/admin/edition-two-admin.css");
 assert.match(css,/\.ed2-part-selector\s*\{[\s\S]*?display:grid/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 const shell=load("src/components/admin/EditionTwoShell.tsx");
 assert.match(shell,/href="\/" target="_blank"/);
 assert.doesNotMatch(shell,/studio-commerce-admin\.vercel\.app/);
});
test("Admin edit/publish is only active when authenticated; preview is explicit",()=>{
 const auth=load("src/app/admin/layout.tsx");
 assert.match(auth,/currentAdmin\(\)/);
 assert.match(auth,/NEXT_PUBLIC_STUDIO_DEMO/);
 const cms=load("src/app/api/admin/edition-2/route.ts");
 assert.match(cms,/requireApiAdmin/);
 assert.match(cms,/editorialDraft/);
 assert.match(cms,/editorialConfig/);
 const store=load("src/lib/live-store.ts");
 assert.match(store,/STORE_ADMIN_LOCAL/);
 assert.match(store,/getLocalBootstrap/);
});
