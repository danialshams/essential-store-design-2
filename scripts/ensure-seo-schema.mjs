/** Check schema first and migrate only when needed.
 * Neon PgBouncer pooled connections must not handle Prisma CLI migrations.
 * Prefer explicit DIRECT_DATABASE_URL, or the matching Neon direct hostname.
 * Abort build on any unresolved migration issue; never reset or drop data.
 */
import {execFileSync} from "node:child_process";
import {setTimeout as sleep} from "node:timers/promises";

if(!process.env.DATABASE_URL){
 console.log("[seo] No DATABASE_URL; schema migration deferred to installation");
 process.exit(0);
}

function directConnection(raw){
 try{
  const parsed=new URL(raw);
  if(parsed.hostname.endsWith(".neon.tech")&&parsed.hostname.includes("-pooler.")){
   parsed.hostname=parsed.hostname.replace("-pooler.",".");
   return parsed.toString();
  }
 }catch{/* Keep the provider-managed connection string unchanged. */}
 return raw;
}
const migrationEnv={
 ...process.env,
 DATABASE_URL:process.env.DIRECT_DATABASE_URL||directConnection(process.env.DATABASE_URL)
};
const run=(operation)=>{
 try{
  const stdout=execFileSync("npx",["prisma","migrate",operation],{
   stdio:["ignore","pipe","pipe"],encoding:"utf8",timeout:120000,env:migrationEnv
  });
  if(stdout)process.stdout.write(stdout);
  return {ok:true,output:stdout||""};
 }catch(error){
  const output=String(error?.stdout||"")+"\n"+String(error?.stderr||"");
  // Log Prisma diagnostics only. Never print connection strings or env values.
  if(output)process.stderr.write(output);
  return {ok:false,output};
 }
};

// A clean status proves local migration files match the database.
// Do not attempt to acquire an advisory lock for a no-op deployment.
if(run("status").ok){
 console.log("[database] migration history is current; no lock required");
 process.exit(0);
}
const attempts=4;
for(let attempt=1;attempt<=attempts;attempt++){
 const result=run("deploy");
 if(result.ok){
  if(!run("status").ok){
   console.error("[database] migration history still inconsistent after deploy");
   process.exit(1);
  }
  console.log("[database] migration deploy succeeded and was verified");
  break;
 }
 const retryable=/P1002|Timed out trying to acquire a postgres advisory lock|P1001/i.test(result.output);
 if(!retryable||attempt===attempts){
  console.error("[database] migration deploy failed; aborting build");
  process.exit(1);
 }
 const delayMs=attempt*3000;
 console.warn("[database] transient migration lock, retry "+(attempt+1)+"/"+attempts+" in "+(delayMs/1000)+"s");
 await sleep(delayMs);
}
