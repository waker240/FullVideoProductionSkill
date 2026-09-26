#!/usr/bin/env node
'use strict';
// Read local configuration; never contact a provider or print credential values.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {createRequire} = require('node:module');
function inspect({project=process.cwd(), stage='base', env=process.env}={}) {
  const checks=[];
  const add=(name,ok,required,hint)=>checks.push({name,status:ok?'ready':required?'missing':'optional',required,hint:ok?'':hint});
  const configured=name=>typeof env[name]==='string'&&env[name].trim()!==''&&!/^(your[-_ ]|replace[-_ ]|example|<)/i.test(env[name]);
  const version=process.versions.node.split('.').map(Number);
  add('Node.js >=22.20.0',version[0]>22||(version[0]===22&&version[1]>=20),true,'Install Node.js 22.20.0 or newer.');
  for(const executable of ['git','ffmpeg','ffprobe']) {
    const result=spawnSync(executable,[executable==='git'?'--version':'-version'],{encoding:'utf8',windowsHide:true});
    add(executable,result.status===0,executable==='git'||['render','tts','transcribe'].includes(stage),`Install ${executable} and add it to PATH.`);
  }
  add('Fish API key',configured('FISH_API_KEY'),stage==='tts','Set FISH_API_KEY in the project .env or environment.');
  let projectReference=false;
  try {
    const narration=JSON.parse(fs.readFileSync(path.join(project,'scripts','narration.json'),'utf8'));
    projectReference=typeof narration.voice?.referenceId==='string'&&narration.voice.referenceId.trim()!=='';
  } catch { /* A project profile is optional; never print its contents. */ }
  add('Fish reference voice',projectReference||configured('FISH_REFERENCE_ID'),stage==='tts','Set FISH_REFERENCE_ID or narration.voice.referenceId to a voice you may use.');
  add('OpenAI API key',configured('OPENAI_API_KEY'),stage==='images'||(stage==='transcribe'&&!configured('WHISPER_API')),'Set OPENAI_API_KEY, or explicitly configure your own WHISPER_API for transcription.');
  add('Image model',configured('OPENAI_IMAGE_MODEL'),stage==='images','Set OPENAI_IMAGE_MODEL to an image model available to your account; no model is inferred from a desktop subscription.');
  add('Custom transcription endpoint',configured('WHISPER_API'),false,'Optional; the default public adapter uses the official OpenAI transcription API.');
  let gsap=false;
  try{gsap=fs.existsSync(createRequire(path.join(path.resolve(project),'package.json')).resolve('gsap/dist/gsap.min.js'));}catch{}
  add('Project GSAP runtime',gsap,stage==='render','In the generated project run npm install, then npm run setup:runtime.');
  add('Vendored GSAP runtime',fs.existsSync(path.join(project,'vendor','gsap-3.14.2.min.js')),stage==='render','Run npm run setup:runtime to prepare the local browser runtime.');
  const catalog=env.MEDIA_CATALOG?path.resolve(project,env.MEDIA_CATALOG):path.join(project,'media-catalog.json');
  add('Local media catalog',fs.existsSync(catalog),stage==='media','Create media-catalog.json from the media-use example, or pass an explicit --catalog to discovery. Supply media you may use.');
  const ngrok=spawnSync('ngrok',['version'],{encoding:'utf8',windowsHide:true});
  add('ngrok',ngrok.status===0,stage==='tunnel','Optional public review: install and authenticate ngrok yourself. Local review needs no tunnel.');
  return {stage,ok:checks.every(c=>c.status!=='missing'),checks,networkRequests:0};
}
if(require.main===module){
  const args=process.argv.slice(2);let project=process.cwd(),stage='base',json=false;
  for(let i=0;i<args.length;i++){
    if(args[i]==='--help'){console.log('Usage: node doctor.cjs [--project DIR] [--stage base|render|tts|transcribe|images|media|tunnel] [--json]\nReads only local configuration. Never sends requests or displays keys.');process.exit(0);}
    else if(args[i]==='--project'&&args[i+1])project=path.resolve(args[++i]);
    else if(args[i]==='--stage'&&args[i+1])stage=args[++i];
    else if(args[i]==='--json')json=true;
    else{console.error('Unknown or incomplete option. Use --help.');process.exit(2);}
  }
  if(!['base','render','tts','transcribe','images','media','tunnel'].includes(stage)){console.error('Unknown stage. Use --help.');process.exit(2);}
  const file=path.join(project,'.env');
  if(fs.existsSync(file)){try{process.loadEnvFile(file);}catch{console.error('Cannot parse the project .env. Its contents were not printed.');process.exit(2);}}
  const report=inspect({project,stage});
  if(json)console.log(JSON.stringify(report,null,2));
  else {console.log(`Environment check: ${stage} — ${report.ok?'ready for this stage':'configuration required'}`);for(const c of report.checks)console.log(`  ${c.status.toUpperCase()}  ${c.name}${c.hint?' — '+c.hint:''}`);console.log('No provider requests were made. Optional capabilities need their own stage check.');}
  process.exitCode=report.ok?0:2;
}
module.exports={inspect};
