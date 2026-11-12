/** Prisma migrations must succeed before publishing the storefront.
 * Neon pooled connections can briefly hold an advisory lock while another
 * deployment runs its migration check. Retry ONLY that transient failure.
 * Never ignore pending migrations or continue a build after a hard error.
 */
import {execFileSync} from "node:child_process";
import {setTimeout as sleep} from "node:timers/promises";

if(!process.env.DATABASE_URL){
 console.log("[seo] No DATABASE_URL; schema migration deferred to installation");
 process.exit(0);
}
const attempts=4;
for(let attempt=1;attempt<=attempts;attempt++){
 try{
  const output=execFileSync("npx",["prisma","migrate","deploy"],{
   stdio:["ignore","pipe","pipe"],encoding:"utf8",timeout:120000,
   env:{...process.env,DATABASE_URL:process.env.DIRECT_DATABASE_URL||process.env.DATABASE_URL}
  });
  if(output)process.stdout.write(output);
  console.log("[database] migration deploy succeeded");
  break;
 }catch(error){
  const output=String(error?.stdout||"")+"\n"+String(error?.stderr||"");
  // Never log env vars or raw exception objects, which may contain credentials.
  if(output)process.stderr.write(output);
  const retryable=/P1002|Timed out trying to acquire a postgres advisory lock|P1001/i.test(output);
  if(!retryable||attempt===attempts){
   console.error("[database] migration deploy failed; aborting build");
   process.exit(1);
  }
  const delayMs=attempt*3000;
  console.warn("[database] transient migration lock, retry "+(attempt+1)+"/"+attempts+" in "+(delayMs/1000)+"s");
  await sleep(delayMs);
 }
}
