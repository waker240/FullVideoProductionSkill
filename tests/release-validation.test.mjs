import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {scanText,scanRelease} from '../scripts/scan-secrets.mjs';
import {validateFrontmatter,validateRelease} from '../scripts/validate-release.mjs';

const scanner=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../scripts/scan-secrets.mjs');
const valid='---\nname: sample-skill\ndescription: A useful workflow and when to use it.\n---\n# Steps\nDo the work.\n';
function fixture(fn){const tempParent=fs.realpathSync(os.tmpdir()),dir=fs.mkdtempSync(path.join(tempParent,'skill-release-validation-'));try{return fn(dir);}finally{const resolved=fs.realpathSync(dir);assert.ok(resolved.startsWith(tempParent+path.sep));assert.ok(path.basename(resolved).startsWith('skill-release-validation-'));fs.rmSync(resolved,{recursive:true,force:true});}}
function write(root,relative,text){const dest=path.join(root,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);}

test('parses standard YAML quoted and block scalars with metadata',()=>{
 const source='---\nname: sample-skill\ndescription: >\n  A useful workflow\n  with a clear trigger.\nlicense: MIT\ncompatibility: Node.js\nmetadata: { author: "example", version: "2", }\n---\n# Steps\nInstructions.';
 assert.deepEqual(validateFrontmatter(source,{directoryName:'sample-skill'}),[]);
});
test('rejects missing, duplicate, invalid names and non-string metadata',()=>{
 assert.ok(validateFrontmatter('# No metadata').some(x=>x.rule==='FRONTMATTER_MISSING'));
 assert.ok(validateFrontmatter(valid.replace('sample-skill','Wrong_Name'),{directoryName:'sample-skill'}).some(x=>x.rule==='FRONTMATTER_NAME'));
 assert.ok(validateFrontmatter(valid.replace('description:', 'name: duplicate\ndescription:')).some(x=>x.rule==='FRONTMATTER_YAML_PARSE'));
 assert.ok(validateFrontmatter(valid.replace('\n---\n#', '\nmetadata: { version: 2 }\n---\n#')).some(x=>x.rule==='FRONTMATTER_METADATA'));
 assert.ok(validateFrontmatter(valid.replace('A useful workflow and when to use it.','x'.repeat(1025))).some(x=>x.rule==='FRONTMATTER_DESCRIPTION'));
});
test('finds missing resources and links that leave installed skill trees',()=>fixture(root=>{
 write(root,'README.md','# Readme');write(root,'skills/sample-skill/SKILL.md',valid+'\n[exists](references/guide.md)\n[missing](references/missing.md)\n[not installed](../../README.md)\n');
 write(root,'skills/sample-skill/references/guide.md','# Guide');
 const result=validateRelease(root,{inventory:false,secrets:false});
 assert.equal(result.findings.filter(x=>x.rule==='RESOURCE_MISSING_OR_CASE').length,1);
 assert.equal(result.findings.filter(x=>x.rule==='RESOURCE_OUTSIDE_INSTALLED_SKILLS').length,1);
}));
test('detects case mismatches, inline packaged references, and root shadowing',()=>fixture(root=>{
 write(root,'SKILL.md',valid);write(root,'skills/sample-skill/SKILL.md',valid+'\n[case](references/Guide.md)\n`references/not-here.md`\n');write(root,'skills/sample-skill/references/guide.md','# Guide');
 const result=validateRelease(root,{inventory:false,secrets:false});
 assert.equal(result.findings.filter(x=>x.rule==='RESOURCE_MISSING_OR_CASE').length,2);
 assert.ok(result.findings.some(x=>x.rule==='ROOT_SKILL_SHADOWS_PACKAGE'));
}));
test('does not treat fenced example output links or web anchors as files',()=>fixture(root=>{
 write(root,'skills/sample-skill/SKILL.md',valid+'\n[web](https://example.com/docs) [anchor](#steps)\n```markdown\n[example](missing.md)\n```\n');
 assert.deepEqual(validateRelease(root,{inventory:false,secrets:false}).findings,[]);
}));
test('known credentials are detected without values in findings or CLI output',()=>fixture(root=>{
 const credential='gh'+'p_'+'aB3'.repeat(13),privateKey='-----BEGIN '+'PRIVATE KEY-----';
 write(root,'danger.txt',`access_token="${credential}"\n${privateKey}\n`);
 const findings=scanRelease(root).findings;assert.ok(findings.some(x=>x.rule==='SECRET_GITHUB_TOKEN'));assert.ok(findings.some(x=>x.rule==='SECRET_PRIVATE_KEY'));assert.ok(!JSON.stringify(findings).includes(credential));
 const result=spawnSync(process.execPath,[scanner,'--root',root,'--json'],{encoding:'utf8'});assert.equal(result.status,1);assert.ok(!result.stdout.includes(credential));assert.ok(!result.stderr.includes(credential));assert.ok(!result.stdout.includes(privateKey));
}));
test('rejects non-placeholder env secrets while allowing documented placeholders',()=>fixture(root=>{
 write(root,'.env.example','FISH_AUDIO_API_KEY=YOUR_FISH_AUDIO_API_KEY\nFISH_AUDIO_BASE_URL=http://127.0.0.1:7860\n');
 assert.deepEqual(scanRelease(root).findings,[]);
 write(root,'.env','API_KEY=\n');assert.ok(scanRelease(root).findings.some(x=>x.rule==='PRIVATE_ENV_FILE'));
 const apiCredential='AbCd91'+'mNoP28qRsT73';write(root,'.env.example','API'+'_KEY='+JSON.stringify(apiCredential)+'\n');assert.ok(scanRelease(root).findings.some(x=>x.rule==='SECRET_CREDENTIAL_LITERAL'));
 assert.ok(scanText(JSON.stringify({FISH_API_KEY:apiCredential})).some(x=>x.rule==='SECRET_CREDENTIAL_LITERAL'));
}));
test('detects private endpoints, author machine paths, cookie files and credential URLs',()=>fixture(root=>{
 const privateUrl='http://'+'192.168.'+'43.21:7860',machinePath='D:'+String.fromCharCode(92)+'PrivateWork'+String.fromCharCode(92)+'project';
 write(root,'notes.md',privateUrl+'\n'+machinePath+'\nhttps://'+'aUser'+':'+'aPassword'+'@host.invalid/path\n');write(root,'cookies.json','{}');
 const result=scanRelease(root);for(const rule of ['PRIVATE_ENDPOINT','LOCAL_MACHINE_PATH','SECRET_URL_CREDENTIALS','PRIVATE_COOKIE_FILE'])assert.ok(result.findings.some(x=>x.rule===rule),rule);
 for(const address of ['fd00::1','fc00::42','fe80::abc'])assert.ok(scanText('https://'+'['+address+']/tts').some(x=>x.rule==='PRIVATE_ENDPOINT'));
}));
test('environment lookups, loopback services and explicit fake placeholders are allowed',()=>{
 const text='api_key: YOUR_API_KEY\nauthorization: `Bearer ${token}`\nsecret: process.env.SERVICE_SECRET\nurl: http://localhost:3105/mcp\nurl: https://your-tunnel.ngrok-free.app\n';
 assert.deepEqual(scanText(text),[]);
});
test('UTF-16 text and extensionless browser cookie files cannot bypass scanning',()=>fixture(root=>{
 const value='AbCd91'+'mNoP28qRsT73',text='API'+'_KEY='+value+'\n';
 fs.writeFileSync(path.join(root,'config.ps1'),Buffer.concat([Buffer.from([0xff,0xfe]),Buffer.from(text,'utf16le')]));
 write(root,'Cookies','');
 write(root,'Cookies-journal','');
 const result=scanRelease(root);assert.ok(result.findings.some(x=>x.rule==='SECRET_CREDENTIAL_LITERAL'));assert.ok(result.findings.some(x=>x.rule==='PRIVATE_COOKIE_FILE'));assert.ok(!JSON.stringify(result.findings).includes(value));
 assert.equal(result.findings.filter(x=>x.rule==='PRIVATE_COOKIE_FILE').length,2);
}));
