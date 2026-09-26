"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const { spawn } = require("node:child_process");
const api = require("../scripts/public-media-api.cjs");
const { mergeSelectedWords } = require("../../hyperframes/scripts/transcribe.cjs");
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAzsAAAAASUVORK5CYII=", "base64");
function wav() {
  const b=Buffer.alloc(44+3200); b.write("RIFF");b.writeUInt32LE(b.length-8,4);b.write("WAVEfmt ",8);
  b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(8000,24);b.writeUInt32LE(16000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write("data",36);b.writeUInt32LE(3200,40);return b;
}
async function fixture(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "hf-public-media-"));
  const pattern = /^(FISH_|OPENAI_|WHISPER_|HYPERFRAMES_TEST_)/;
  const saved = Object.fromEntries(Object.entries(process.env).filter(([key]) => pattern.test(key)));
  for (const key of Object.keys(process.env)) if(pattern.test(key)) delete process.env[key];
  try { await callback(directory); }
  finally {
    for (const key of Object.keys(process.env)) if(pattern.test(key)) delete process.env[key];
    Object.assign(process.env, saved); fs.rmSync(directory,{recursive:true,force:true});
  }
}
async function server(callback, run) {
  const requests=[];
  const instance=http.createServer(async (req,res)=>{
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    requests.push({headers:req.headers,body:Buffer.concat(chunks).toString(),url:req.url});
    callback(req,res,requests);
  });
  await new Promise(resolve=>instance.listen(0,"127.0.0.1",resolve));
  try { await run(`http://127.0.0.1:${instance.address().port}`,requests); }
  finally { instance.closeAllConnections(); await new Promise(resolve=>instance.close(resolve)); }
}
function fishEnv(url) {Object.assign(process.env,{FISH_API_KEY:"fake-fish-key",FISH_REFERENCE_ID:"user-owned-test-voice",FISH_API_URL:url,HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK:"1"});}
test("empty configuration fails closed; .env fills missing values but does not override process environment",()=>fixture(async directory=>{
  assert.throws(()=>api.resolveFishConfig(),/FISH_API_KEY/);
  assert.throws(()=>api.resolveImageConfig(),/OPENAI_API_KEY/);
  assert.throws(()=>api.resolveTranscriptionConfig(),/OPENAI_API_KEY/);
  fs.writeFileSync(path.join(directory,".env"),"FISH_API_KEY=fake-file-key\nFISH_REFERENCE_ID=file-voice\nFISH_MODEL=s2.1-pro-free\n");
  process.env.FISH_REFERENCE_ID="ambient-voice";api.loadProjectEnv(directory);
  const config=api.resolveFishConfig();assert.equal(config.referenceId,"ambient-voice");assert.equal(config.apiKey,"fake-file-key");assert.equal(config.transport,"official-api");assert.equal(config.model,"s2.1-pro-free");
}));
test("Fish rejects unknown models, missing voices, embedded credentials, proxy profiles, and arbitrary endpoints",()=>fixture(async()=>{
  process.env.FISH_API_KEY="fake-key";assert.throws(()=>api.resolveFishConfig(),/FISH_REFERENCE_ID/);
  process.env.FISH_REFERENCE_ID="voice";
  assert.throws(()=>api.resolveFishConfig({fish:{model:"invented-model"}}),/Unsupported Fish model/);
  assert.throws(()=>api.resolveFishConfig({fish:{request:{nested:{accessToken:"TEST_CREDENTIAL"}}}}),/credential-like/);
  assert.throws(()=>api.resolveFishConfig({fish:{transport:"local-proxy"}}),/official-api only/);
  for (const url of ["https://example.com/tts","https://api.fish.audio/v1/tts?key=secret","http://127.0.0.1:12/tts"]) assert.throws(()=>api.resolveFishConfig({fish:{apiUrl:url}}));
  process.env.HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK="1";assert.throws(()=>api.resolveFishConfig({fish:{apiUrl:"https://example.com/tts"}}),/loopback/);
}));
test("Fish official header/body produces frozen WAV with exactly one request",()=>fixture(directory=>server((_req,res)=>{res.writeHead(200,{"Content-Type":"audio/wav"});res.end(wav());},async(url,requests)=>{
  fishEnv(`${url}/v1/tts`);const config=api.resolveFishConfig({fish:{request:{temperature:0.7,top_p:0.7}},speed:1.05});
  const output=path.join(directory,"voice.wav");await api.synthesizeOne({text:"A sample.",config,wavAbs:output});
  assert.deepEqual(fs.readFileSync(output),wav());assert.equal(requests.length,1);
  assert.equal(requests[0].headers.authorization,"Bearer fake-fish-key");assert.equal(requests[0].headers.model,"s2.1-pro-free");
  assert.deepEqual(JSON.parse(requests[0].body),{temperature:0.7,top_p:0.7,prosody:{speed:1.05},text:"A sample.",reference_id:"user-owned-test-voice",format:"wav"});
})));
test("Fish 500 and reflected credential are never retried or logged, and cannot replace existing audio",()=>fixture(directory=>server((_req,res)=>{res.writeHead(500);res.end("Authorization: Bearer fake-fish-key; private prompt");},async(url,requests)=>{
  fishEnv(`${url}/tts`);const file=path.join(directory,"voice.wav");fs.writeFileSync(file,"previous");
  await assert.rejects(api.synthesizeOne({text:"sample",config:api.resolveFishConfig(),wavAbs:file}),error=>/HTTP 500.*not retried/.test(error.message)&&!/fake-fish-key|private prompt/.test(error.message));
  assert.equal(requests.length,1);assert.equal(fs.readFileSync(file,"utf8"),"previous");
})));
test("redirects do not receive narration and malformed audio is not frozen",()=>fixture(directory=>server((_req,res,requests)=>{if(requests.length===1){res.writeHead(302,{Location:"/capture"});res.end();}else{res.writeHead(200);res.end("RIFFxxxxWAVE");}},async(url,requests)=>{
  fishEnv(`${url}/tts`);const file=path.join(directory,"voice.wav");
  await assert.rejects(api.synthesizeOne({text:"sample",config:api.resolveFishConfig(),wavAbs:file}),/not retried/);assert.equal(requests.length,1);
  await assert.rejects(api.synthesizeOne({text:"sample",config:api.resolveFishConfig(),wavAbs:file}),/invalid WAV/);assert.equal(requests.length,2);assert.equal(fs.existsSync(file),false);
})));
test("OpenAI transcription sends the word-timestamp multipart contract and normalizes language",()=>fixture(directory=>server((_req,res)=>{res.setHeader("Content-Type","application/json");res.end(JSON.stringify({text:"你好",words:[{word:"你好",start:0,end:0.2}]}));},async(url,requests)=>{
  Object.assign(process.env,{OPENAI_API_KEY:"fake-openai-key",OPENAI_TRANSCRIBE_URL:`${url}/transcribe`,HYPERFRAMES_TEST_ALLOW_OPENAI_LOOPBACK:"1"});
  const file=path.join(directory,"voice.wav");fs.writeFileSync(file,wav());const result=await api.transcribeAudio({file,language:"chinese"});
  assert.equal(result.words[0].word,"你好");assert.equal(requests.length,1);assert.equal(requests[0].headers.authorization,"Bearer fake-openai-key");
  assert.match(requests[0].body,/name="model"\r\n\r\nwhisper-1/);assert.match(requests[0].body,/name="response_format"\r\n\r\nverbose_json/);assert.match(requests[0].body,/name="timestamp_granularities\[\]"\r\n\r\nword/);assert.match(requests[0].body,/name="language"\r\n\r\nzh/);
})));
test("custom transcription never receives the OpenAI key and missing word timings fail",()=>fixture(directory=>server((_req,res)=>{res.setHeader("Content-Type","application/json");res.end(JSON.stringify({text:"untimed",words:[]}));},async(url,requests)=>{
  Object.assign(process.env,{OPENAI_API_KEY:"TEST_OPENAI_CREDENTIAL",WHISPER_API:`${url}/transcribe`});
  const file=path.join(directory,"voice.wav");fs.writeFileSync(file,wav());
  await assert.rejects(api.transcribeAudio({file}),/word timestamps/);assert.equal(requests[0].headers.authorization,undefined);assert.equal(requests.length,1);
  process.env.WHISPER_API_KEY="TEST_CUSTOM_CREDENTIAL";await assert.rejects(api.transcribeAudio({file}),/word timestamps/);assert.equal(requests[1].headers.authorization,"Bearer TEST_CUSTOM_CREDENTIAL");
  process.env.OPENAI_TRANSCRIPTION_MODEL="gpt-4o-transcribe";assert.throws(()=>api.resolveTranscriptionConfig(),/whisper-1/);
})));
test("GPT Image requires explicit model and returns validated PNG from local HTTP",()=>fixture(directory=>server((_req,res)=>{res.setHeader("Content-Type","application/json");res.end(JSON.stringify({data:[{b64_json:PNG.toString("base64")}]}));},async(url,requests)=>{
  process.env.OPENAI_API_KEY="fake-openai-key";assert.throws(()=>api.resolveImageConfig(),/OPENAI_IMAGE_MODEL/);
  Object.assign(process.env,{OPENAI_IMAGE_MODEL:"gpt-image-1",OPENAI_IMAGES_URL:`${url}/images`,HYPERFRAMES_TEST_ALLOW_OPENAI_LOOPBACK:"1"});
  const images=await api.generateImages({prompt:"test plate"});assert.deepEqual(images,[PNG]);
  assert.equal(requests.length,1);const body=JSON.parse(requests[0].body);assert.equal(body.model,"gpt-image-1");assert.equal(body.output_format,"png");assert.equal(body.response_format,undefined);
  const file=path.join(directory,"out.png");api.writeAtomic(file,images[0]);assert.deepEqual(fs.readFileSync(file),PNG);
})));
test("image errors are single attempts and withhold provider bodies",()=>fixture(()=>server((_req,res)=>{res.writeHead(429);res.end("fake-image-secret sensitive prompt");},async(url,requests)=>{
  Object.assign(process.env,{OPENAI_API_KEY:"fake-image-secret",OPENAI_IMAGE_MODEL:"gpt-image-1",OPENAI_IMAGES_URL:`${url}/images`,HYPERFRAMES_TEST_ALLOW_OPENAI_LOOPBACK:"1"});
  await assert.rejects(api.generateImages({prompt:"sample"}),error=>/HTTP 429.*not retried/.test(error.message)&&!/fake-image-secret|sensitive prompt/.test(error.message));assert.equal(requests.length,1);
})));
test("partial transcription preserves intervening unselected sections",()=>{
  const existing=[{word:"old-zero",start:0,end:1},{word:"keep-one",start:10,end:11},{word:"old-two",start:20,end:21}];
  const result=mergeSelectedWords(existing,[{word:"new-zero",start:0,end:1},{word:"new-two",start:20,end:21}],[{startSec:0,endSec:10},{startSec:20,endSec:30}]);
  assert.deepEqual(result.map(w=>w.word),["new-zero","keep-one","new-two"]);
});

test("image CLI loads project .env, saves PNG, and prevents accidental charged overwrite or path traversal",()=>fixture(directory=>server((_req,res)=>{res.setHeader("Content-Type","application/json");res.end(JSON.stringify({data:[{b64_json:PNG.toString("base64")}]}));},async(url,requests)=>{
  fs.writeFileSync(path.join(directory,".env"),`OPENAI_API_KEY=TEST_CREDENTIAL\nOPENAI_IMAGE_MODEL=gpt-image-1\nOPENAI_IMAGES_URL=${url}/images\nHYPERFRAMES_TEST_ALLOW_OPENAI_LOOPBACK=1\n`);
  fs.writeFileSync(path.join(directory,"prompt.txt"),"A sample plate.");
  const script=path.resolve(__dirname,"../../hyperframes/scripts/genimg.cjs");
  const run=(name)=>new Promise(resolve=>{
    const child=spawn(process.execPath,[script,"--out","assets","--name",name,"--prompt-file","prompt.txt"],{cwd:directory,env:process.env,stdio:["ignore","pipe","pipe"],windowsHide:true});
    let stderr="";child.stderr.on("data",data=>stderr+=data);child.on("close",code=>resolve({code,stderr}));
  });
  let result=await run("plate.png");assert.equal(result.code,0,result.stderr);assert.deepEqual(fs.readFileSync(path.join(directory,"assets","plate.png")),PNG);assert.equal(requests.length,1);
  result=await run("plate.png");assert.notEqual(result.code,0);assert.match(result.stderr,/already exists/);assert.equal(requests.length,1);
  result=await run("../escape.png");assert.notEqual(result.code,0);assert.match(result.stderr,/simple PNG filename/);assert.equal(requests.length,1);
})));
