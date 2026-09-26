#!/usr/bin/env node
'use strict';
// A two-second render check, not a visual-quality sample or a narrated film.
const fs=require('node:fs');const path=require('node:path');
const arg=process.argv[2];
if(!arg||arg==='--help'){console.log('Usage: node create-smoke.cjs <new-directory>\nCreates a silent two-second installation check. Does not call an AI API.');process.exit(arg?0:2);}
const destination=path.resolve(arg);
if(fs.existsSync(destination)){console.error('Destination already exists; choose a new directory. No files changed.');process.exit(2);}
fs.mkdirSync(path.join(destination,'scripts'),{recursive:true});
for(const name of ['setup-runtime.cjs','doctor.cjs'])fs.copyFileSync(path.join(__dirname,name),path.join(destination,'scripts',name));
fs.writeFileSync(path.join(destination,'package.json'),JSON.stringify({name:'video-skill-smoke',private:true,engines:{node:'>=22.20.0'},dependencies:{gsap:'3.14.2'},scripts:{'setup:runtime':'node scripts/setup-runtime.cjs','doctor':'node scripts/doctor.cjs --stage render','render':'npx --yes hyperframes@0.7.17 render --fps 30'}},null,2)+'\n');
fs.writeFileSync(path.join(destination,'hyperframes.json'),JSON.stringify({$schema:'https://hyperframes.heygen.com/schema/hyperframes.json',paths:{assets:'assets'}},null,2));
fs.writeFileSync(path.join(destination,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><script src="vendor/gsap-3.14.2.min.js"></script><style>*{box-sizing:border-box}html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:#132923;color:#f5f0e6;font-family:Arial,sans-serif}#root{position:relative;width:1280px;height:720px;padding:110px}h1{font-size:70px;margin:80px 0 35px}p{font-size:26px;color:#b9ccc1}#bar{height:12px;width:900px;background:#ef9866;transform-origin:left}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="2" data-width="1280" data-height="720"><p>FULL VIDEO PRODUCTION SKILLS</p><h1>Render check</h1><div id="bar"></div><p>2 seconds · silent · no AI API calls</p></div><script>window.__timelines=window.__timelines||{};const timeline=gsap.timeline({paused:true});timeline.fromTo('#bar',{scaleX:0},{scaleX:1,duration:1.5,ease:'power2.out'},0);timeline.to({}, {duration:0.5},1.5);window.__timelines.main=timeline;</script></body></html>`);
console.log(`Created ${destination}\nNext, in that directory: npm install; npm run setup:runtime; npm run doctor; npm run render\nThe final film scaffold is a separate command: scaffold.cjs.`);
