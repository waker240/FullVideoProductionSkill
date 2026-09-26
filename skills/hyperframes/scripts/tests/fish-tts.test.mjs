import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const skills = path.resolve(here, "../../..");
const available = ["ffmpeg", "ffprobe"].every(command=>spawnSync(command,["-version"],{stdio:"ignore"}).status===0);
function wav() {
  const b=Buffer.alloc(44+3200);b.write("RIFF");b.writeUInt32LE(b.length-8,4);b.write("WAVEfmt ",8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(8000,24);b.writeUInt32LE(16000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write("data",36);b.writeUInt32LE(3200,40);return b;
}
function fixture() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"hf fish public "));fs.mkdirSync(path.join(root,"scripts"));
  fs.copyFileSync(path.resolve(here,"../tts-fish.mjs"),path.join(root,"scripts","tts-fish.mjs"));
  fs.copyFileSync(path.join(skills,"fish-audio-api","scripts","public-media-api.cjs"),path.join(root,"scripts","public-media-api.cjs"));
  const narration=JSON.parse(fs.readFileSync(path.join(skills,"hyperframes","templates","narration.example.json"),"utf8"));
  narration.sections=[{id:"s0",paragraphs:[{tts:"First sample.",gapAfter:0.02},{tts:"Second sample."},{silence:0.08}]},{id:"s1",paragraphs:[{tts:"Another section."}]}];
  fs.writeFileSync(path.join(root,"scripts","narration.json"),JSON.stringify(narration));return {root,narration};
}
function env(values={}) {
  const result=Object.fromEntries(Object.entries(process.env).filter(([key])=>!/^(FISH_|OPENAI_|WHISPER_|HYPERFRAMES_TEST_)/.test(key)));
  return {...result,...values};
}
function run(root,args=[],values={}) {
  return new Promise(resolve=>{
    const child=spawn(process.execPath,[path.join(root,"scripts","tts-fish.mjs"),...args],{cwd:root,env:env(values),windowsHide:true,stdio:["ignore","pipe","pipe"]});
    let stdout="",stderr="";child.stdout.on("data",b=>stdout+=b);child.stderr.on("data",b=>stderr+=b);child.on("close",code=>resolve({code,stdout,stderr}));child.on("error",()=>resolve({code:-1,stdout,stderr:"spawn failed"}));
  });
}
async function mock(callback, work) {
  const requests=[];const server=http.createServer(async(req,res)=>{const chunks=[];for await(const b of req)chunks.push(b);requests.push({headers:req.headers,body:JSON.parse(Buffer.concat(chunks))});callback(req,res,requests);});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  try {await work(`http://127.0.0.1:${server.address().port}/v1/tts`,requests);}
  finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
test("a scaffolded Fish script fails before network for empty config or invalid speech scope",async()=>{
  const {root,narration}=fixture();
  try {
    const missing=await run(root);assert.notEqual(missing.code,0);assert.match(missing.stderr,/FISH_API_KEY/);
    narration.requireSpelledOutNumbers=true;narration.sections[0].paragraphs[0].tts="There are 50 items.";
    fs.writeFileSync(path.join(root,"scripts","narration.json"),JSON.stringify(narration));
    const numeric=await run(root,["--section","s0"],{FISH_API_KEY:"fake-test",FISH_REFERENCE_ID:"test-voice"});assert.notEqual(numeric.code,0);assert.match(numeric.stderr,/numeric digit/);
    const scope=await run(root,["--para","0"],{FISH_API_KEY:"fake-test",FISH_REFERENCE_ID:"test-voice"});assert.notEqual(scope.code,0);assert.match(scope.stderr,/exactly one --section/);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});
test("project .env, official payload, silence, cache reuse and paragraph-only regeneration stay local",{skip:!available},async()=>{
  const {root}=fixture();
  try {await mock((_req,res)=>{res.writeHead(200,{"Content-Type":"audio/wav"});res.end(wav());},async(url,requests)=>{
    fs.writeFileSync(path.join(root,".env"),`FISH_API_KEY=fake-local-key\nFISH_REFERENCE_ID=voice-from-project\nFISH_API_URL=${url}\nHYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK=1\n`);
    let result=await run(root,["--section","s0"]);assert.equal(result.code,0,result.stderr);assert.equal(requests.length,2);
    assert.equal(requests[0].headers.model,"s2.1-pro-free");assert.equal(requests[0].headers.authorization,"Bearer fake-local-key");assert.equal(requests[0].body.reference_id,"voice-from-project");assert.equal(requests[0].body.temperature,0.7);assert.equal(requests[0].body.top_p,0.7);assert.equal(requests[0].body.backend,undefined);
    const protectedFile=path.join(root,"assets","tts_chunks","s0","chunk-000.src.wav");const before=fs.readFileSync(protectedFile);
    result=await run(root,["--section","s0"]);assert.equal(result.code,0,result.stderr);assert.equal(requests.length,2);assert.match(result.stdout,/reuse/);
    result=await run(root,["--section","s0","--para","1","--force"]);assert.equal(result.code,0,result.stderr);assert.equal(requests.length,3);assert.deepEqual(fs.readFileSync(protectedFile),before);
    result=await run(root,["--section","s1"]);assert.equal(result.code,0,result.stderr);assert.equal(requests.length,4);
    const manifest=fs.readFileSync(path.join(root,"assets","tts_chunks","generation-manifest.json"),"utf8");assert.doesNotMatch(manifest,/fake-local-key/);assert.deepEqual(JSON.parse(manifest).sections.map(s=>s.sectionId),["s0","s1"]);
  });} finally {fs.rmSync(root,{recursive:true,force:true});}
});
test("failed Fish POST is single-attempt, redacted, and does not replace frozen output",{skip:!available},async()=>{
  const {root}=fixture();
  try {await mock((_req,res)=>{res.writeHead(500);res.end("fake-test-key private-response");},async(url,requests)=>{
    const dir=path.join(root,"assets","tts_chunks","s0");fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"chunk-000.src.wav"),"preserve");
    const result=await run(root,["--section","s0"],{FISH_API_KEY:"fake-test-key",FISH_REFERENCE_ID:"test-voice",FISH_API_URL:url,HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK:"1"});
    assert.notEqual(result.code,0);assert.equal(requests.length,1);assert.match(result.stderr,/not retried/);assert.doesNotMatch(result.stderr,/fake-test-key|private-response/);assert.equal(fs.readFileSync(path.join(dir,"chunk-000.src.wav"),"utf8"),"preserve");
  });} finally {fs.rmSync(root,{recursive:true,force:true});}
});
