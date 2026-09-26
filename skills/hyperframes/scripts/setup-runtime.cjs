#!/usr/bin/env node
'use strict';
// Vendor the installed package so final renders need no CDN at frame time.
const fs=require('node:fs');const path=require('node:path');const {createRequire}=require('node:module');
const root=process.cwd();
if(process.argv.includes('--help')){console.log('Run inside a generated project after npm install: node scripts/setup-runtime.cjs');process.exit(0);}
try{
 const req=createRequire(path.join(root,'package.json'));
 const source=req.resolve('gsap/dist/gsap.min.js');
 const packageRoot=path.dirname(req.resolve('gsap/package.json'));
 const version=JSON.parse(fs.readFileSync(path.join(packageRoot,'package.json'),'utf8')).version;
 if(version!=='3.14.2')throw new Error('This scaffold uses GSAP 3.14.2. Install the pinned project dependencies first.');
 const vendor=path.join(root,'vendor');fs.mkdirSync(vendor,{recursive:true});
 fs.copyFileSync(source,path.join(vendor,'gsap-3.14.2.min.js'));
 for(const name of ['LICENSE','LICENSE.txt','LICENSE.md']){const file=path.join(packageRoot,name);if(fs.existsSync(file))fs.copyFileSync(file,path.join(vendor,'GSAP-'+name));}
 console.log('Vendored GSAP 3.14.2 into vendor/. Its original license remains applicable.');
}catch(error){console.error(error.code==='MODULE_NOT_FOUND'?'GSAP is missing. Run npm install in this project first.':error.message);process.exitCode=1;}
