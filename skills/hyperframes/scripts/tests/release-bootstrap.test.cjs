'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const {spawnSync}=require('node:child_process');
const scripts=path.resolve(__dirname,'..');
const {inspect}=require('../doctor.cjs');
test('doctor reports missing required configuration without making network requests or printing values',()=>{
 const blank=inspect({stage:'images',env:{}});assert.equal(blank.ok,false);assert.equal(blank.networkRequests,0);
 const configured=inspect({stage:'images',env:{OPENAI_API_KEY:'test-only-value-do-not-use',OPENAI_IMAGE_MODEL:'test-model'}});
 assert.equal(configured.checks.find(c=>c.name==='OpenAI API key').status,'ready');
 assert.ok(!JSON.stringify(configured).includes('test-only-value-do-not-use'));
});
test('smoke fixture is local and refuses to overwrite an existing directory',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'video-skill-bootstrap-'));
 try{
  const destination=path.join(tmp,'space in project');
  const create=()=>spawnSync(process.execPath,[path.join(scripts,'create-smoke.cjs'),destination],{encoding:'utf8'});
  assert.equal(create().status,0);
  const index=fs.readFileSync(path.join(destination,'index.html'),'utf8');
  assert.match(index,/data-duration="2"/);assert.doesNotMatch(index,/https?:|api_key|apiKey/);
  fs.writeFileSync(path.join(destination,'keep.txt'),'user content');
  assert.equal(create().status,2);assert.equal(fs.readFileSync(path.join(destination,'keep.txt'),'utf8'),'user content');
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('runtime setup fails clearly when project dependencies have not been installed',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'video-skill-runtime-'));
 try{
  const result=spawnSync(process.execPath,[path.join(scripts,'setup-runtime.cjs')],{cwd:tmp,encoding:'utf8'});
  assert.equal(result.status,1);assert.match(result.stderr,/npm install/);assert.equal(fs.existsSync(path.join(tmp,'vendor')),false);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('doctor recognizes a project voice without exposing its identity',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'video-skill-doctor-'));
 try {
  fs.mkdirSync(path.join(tmp,'scripts'));
  fs.writeFileSync(path.join(tmp,'scripts','narration.json'),JSON.stringify({voice:{referenceId:'test-only-voice'}}));
  const report=inspect({project:tmp,stage:'tts',env:{}});
  assert.equal(report.checks.find(c=>c.name==='Fish reference voice').status,'ready');
  assert.equal(report.checks.find(c=>c.name==='Fish API key').status,'missing');
  assert.ok(!JSON.stringify(report).includes('test-only-voice'));
 } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});
