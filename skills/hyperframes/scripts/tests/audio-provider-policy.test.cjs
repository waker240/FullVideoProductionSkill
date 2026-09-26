"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {spawnSync}=require("node:child_process");
const skills=path.resolve(__dirname,"../../..");
test("public narration template needs a user's voice and carries no previous film vocabulary",()=>{
  const profile=JSON.parse(fs.readFileSync(path.join(skills,"hyperframes/templates/narration.example.json"),"utf8"));
  assert.equal(profile.voice.transport,"official-api");assert.equal(profile.voice.referenceId,null);assert.equal(profile.voice.model,null);
  assert.deepEqual(profile.ttsSubs,[]);assert.deepEqual(profile.emphasis,[]);assert.equal(profile.voice.backend,undefined);assert.equal(profile.voice.sampler,undefined);
});
test("public package has no browser session/proxy or fabricated sound library",()=>{
  for(const file of ["cookie.json","server.py",".env"])assert.equal(fs.existsSync(path.join(skills,"fish-audio-api",file)),false);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(skills,"hyperframes-media/assets/sfx/manifest.json"),"utf8")),{});
});
test("public media CLIs show help without credentials, project data, or network",()=>{
  for(const file of ["tts-fish.mjs","transcribe.cjs","genimg.cjs","audio-discover.cjs"]){
    const result=spawnSync(process.execPath,[path.join(skills,"hyperframes/scripts",file),"--help"],{encoding:"utf8",cwd:skills});
    assert.equal(result.status,0,`${file}: ${result.stderr}`);assert.match(result.stdout,/usage:/i);
  }
});
