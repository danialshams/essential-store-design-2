import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../scripts/ensure-seo-schema.mjs",import.meta.url),"utf8");

test("Transient Prisma advisory-lock timeouts retry without skipping production schema migration",()=>{
 assert.match(source,/prisma","migrate",operation/);
 assert.match(source,/run\("status"\)\.ok/);
 assert.match(source,/run\("deploy"\)/);
 assert.match(source,/migrationEnv/);
 assert.match(source,/parsed\.hostname\.replace\("-pooler\.","\."\)/);
 assert.match(source,/P1002/);
 assert.match(source,/Timed out trying to acquire a postgres advisory lock/);
 assert.match(source,/const attempts=4/);
 assert.match(source,/process\.exit\(1\)/);
 assert.match(source,/await sleep\(delayMs\)/);
 assert.match(source,/DIRECT_DATABASE_URL/);
 assert.doesNotMatch(source,/process\.env\.DATABASE_URL\s*=\s*undefined|migrate reset/);
});
