import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."));
let ts;
try{ts=require("typescript")}catch{console.log("TypeScript not installed; run npm install first");process.exit(1)}
let checked=0,errors=0;
function check(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())check(p);else if(/\.tsx?$/.test(f.name)){checked++;const src=ts.createSourceFile(p,fs.readFileSync(p,"utf8"),ts.ScriptTarget.Latest,true,f.name.endsWith(".tsx")?ts.ScriptKind.TSX:ts.ScriptKind.TS);for(const d of src.parseDiagnostics){errors++;const lc=src.getLineAndCharacterOfPosition(d.start||0);console.error(`${p}:${lc.line+1}:${lc.character+1} ${ts.flattenDiagnosticMessageText(d.messageText," ")}`)}}}}
check("src");console.log(`${checked} TypeScript files checked, ${errors} syntax errors`);process.exitCode=errors?1:0;
