import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const html=readFileSync(new URL("../public/stock-action/index.html",import.meta.url),"utf8");
test("inline retail application is valid JavaScript module syntax",()=>{
 const match=html.match(/<script type="module">([\s\S]*?)<\/script>/);
 assert.ok(match,"expected inline module script");
 const result=spawnSync(process.execPath,["--check","--input-type=module"],{input:match[1],encoding:"utf8"});
 assert.equal(result.status,0,result.stderr);
});
test("two workspaces, QR scan, payment fields and commerce controls are on page",()=>{
 for(const id of ["role","scanCode","startScanner","stopScanner","cashTendered","transactionRef","cardLast4","createUpiQr","commerce","commerceSku","commercePhotos","approveCommerce","unpublishCommerce"]){
   assert.ok(html.includes('id="'+id+'"'),"missing "+id);
 }
 assert.match(html,/counterTabs=new Set\(\["sales","inventory","store"\]\)/);
 assert.match(html,/upload exactly three|exactly three|Select exactly three/i);
});
