import {execFileSync} from "node:child_process";
if(!process.env.DATABASE_URL){console.log("[seo] No DATABASE_URL; schema migration deferred to installation");process.exit(0)}
execFileSync("npx",["prisma","migrate","deploy"],{stdio:"inherit",timeout:120000,env:process.env});
