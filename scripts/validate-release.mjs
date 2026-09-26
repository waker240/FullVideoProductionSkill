#!/usr/bin/env node
/** Agent Skills release validation. YAML is parsed by the pinned upstream yaml package. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseDocument} from 'yaml';
import {scanRelease,listFiles,printFindings} from './scan-secrets.mjs';

const DEFAULT_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FIELDS=new Set(['name','description','license','compatibility','metadata','allowed-tools']);
export const EXPECTED_SKILLS=['faceless-explainer','fish-audio-api','general-video','hyperframes','hyperframes-animation','hyperframes-core','hyperframes-creative','hyperframes-media','hyperframes-registry','media-use','motion-graphics','music-to-video','remotion-to-hyperframes'];
const inside=(base,target)=>target===base||target.startsWith(base+path.sep);
const lineAt=(text,index)=>text.slice(0,index).split('\n').length;
function isExactPath(target,root){
  if(!fs.existsSync(target))return false;
  // Enforce portable spelling inside the release, not the OS's ancestor names.
  // Windows temp roots can contain short aliases or differently cased segments.
  const relative=path.relative(root,target);
  if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))return false;
  let current=path.resolve(root);
  for(const segment of relative.split(path.sep).filter(Boolean)){
    try{if(!fs.readdirSync(current).includes(segment))return false;}catch{return false;}current=path.join(current,segment);
  }
  return true;
}
export function validateFrontmatter(text,{file='SKILL.md',directoryName}={}){
  const findings=[],add=(rule,line=1)=>findings.push({file,line,rule});
  const normalized=text.replace(/^\uFEFF/,'');
  const match=/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(normalized);
  if(!match){add('FRONTMATTER_MISSING');return findings;}
  const doc=parseDocument(match[1],{uniqueKeys:true,strict:true});
  if(doc.errors.length){for(const error of doc.errors)add('FRONTMATTER_YAML_PARSE',error.linePos?.[0]?.line?error.linePos[0].line+1:2);return findings;}
  let data;try{data=doc.toJS({maxAliasCount:100});}catch{add('FRONTMATTER_YAML_PARSE',2);return findings;}
  if(!data||Array.isArray(data)||typeof data!=='object'){add('FRONTMATTER_NOT_MAPPING',2);return findings;}
  for(const key of Object.keys(data))if(!FIELDS.has(key))add('FRONTMATTER_UNKNOWN_FIELD',2);
  if(typeof data.name!=='string'||!data.name.length||data.name.length>64||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name))add('FRONTMATTER_NAME',2);
  if(directoryName&&data.name!==directoryName)add('FRONTMATTER_DIRECTORY_NAME',2);
  if(typeof data.description!=='string'||!data.description.trim()||data.description.length>1024)add('FRONTMATTER_DESCRIPTION',2);
  for(const key of ['license','allowed-tools'])if(key in data&&(typeof data[key]!=='string'||!data[key].trim()))add('FRONTMATTER_OPTIONAL_STRING',2);
  if('compatibility'in data&&(typeof data.compatibility!=='string'||!data.compatibility.trim()||data.compatibility.length>500))add('FRONTMATTER_COMPATIBILITY',2);
  if('metadata'in data&&(!data.metadata||Array.isArray(data.metadata)||typeof data.metadata!=='object'||Object.values(data.metadata).some(v=>typeof v!=='string')))add('FRONTMATTER_METADATA',2);
  if(!normalized.slice(match[0].length).trim())add('SKILL_BODY_EMPTY',lineAt(normalized,match[0].length));
  return findings;
}
function markdownWithoutCode(text){
  let fenced=false,marker='';return text.split(/\r?\n/).map(line=>{
    const match=/^\s*(`{3,}|~{3,})/.exec(line);
    if(match){if(!fenced){fenced=true;marker=match[1][0];}else if(match[1][0]===marker)fenced=false;return ' '.repeat(line.length);}
    return fenced?' '.repeat(line.length):line;
  }).join('\n');
}
function ignoreTarget(target){return !target||target.startsWith('#')||/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)||/[<>{}*]/.test(target);}
export function validateMarkdown(text,{file,absolute,root,skillRoot}={}){
  const findings=[],found=new Set(),clean=markdownWithoutCode(text);
  const add=(line,rule)=>{const key=line+':'+rule;if(!found.has(key)){found.add(key);findings.push({file,line,rule});}};
  const check=(raw,index,{fromRoot=false,routedRoot}={})=>{
    let target=raw.trim().replace(/^<|>$/g,'');if(ignoreTarget(target))return;
    target=target.split(/[?#]/)[0];if(!target)return;
    try{target=decodeURIComponent(target);}catch{add(lineAt(clean,index),'RESOURCE_BAD_ENCODING');return;}
    if(path.isAbsolute(target)||/^[a-z]:[/\\]/i.test(target)){add(lineAt(clean,index),'RESOURCE_ABSOLUTE_PATH');return;}
    const candidates=routedRoot?[path.resolve(routedRoot,target)]:fromRoot&&skillRoot?[path.resolve(skillRoot,target),path.resolve(path.dirname(absolute),target)]:[path.resolve(path.dirname(absolute),target)];
    if(candidates.every(candidate=>!inside(root,candidate))){add(lineAt(clean,index),'RESOURCE_OUTSIDE_RELEASE');return;}
    const existing=candidates.find(candidate=>inside(root,candidate)&&isExactPath(candidate,root));
    if(!existing){add(lineAt(clean,index),'RESOURCE_MISSING_OR_CASE');return;}
    if(skillRoot&&!inside(path.join(root,'skills'),existing))add(lineAt(clean,index),'RESOURCE_OUTSIDE_INSTALLED_SKILLS');
  };
  const links=/!?\[[^\]\n]*\]\(\s*(<[^>\n]+>|[^\s)]+)(?:\s+["'][^\n]*?["'])?\s*\)/g;
  for(const match of clean.matchAll(links))check(match[1],match.index);
  for(const match of clean.matchAll(/^\s{0,3}\[[^\]\n]+\]:\s*(<[^>\n]+>|\S+)/gm))check(match[1],match.index);
  if(skillRoot){
    // references/ and templates/ are packaged documentation. Bare scripts/ and
    // assets/ often name future project outputs, so require an actual Markdown
    // link for those; they are not automatically treated as release files.
    for(const match of clean.matchAll(/`((?:references|templates)\/[A-Za-z0-9_./ -]+\.(?:md|mjs|cjs|js|py|ps1|sh|html|css|json|yaml|yml|txt))`/g)){
      const before=clean.slice(clean.lastIndexOf('\n',match.index)+1,match.index);
      const sentence=before.slice(Math.max(before.lastIndexOf('. '),before.lastIndexOf('。'))+1);
      const owners=[...sentence.matchAll(/`\/?([a-z0-9]+(?:-[a-z0-9]+)*)`/g)].map(x=>x[1]).filter(name=>EXPECTED_SKILLS.includes(name));
      check(match[1],match.index,{fromRoot:true,routedRoot:owners.length?path.join(root,'skills',owners.at(-1)):undefined});
    }
  }
  return findings;
}
export function validateRelease(root=DEFAULT_ROOT,{inventory=true,secrets=true}={}){
  root=path.resolve(root);const walked=listFiles(root),findings=secrets?scanRelease(root).findings:[...walked.issues];
  const skillContainer=path.join(root,'skills');
  if(fs.existsSync(path.join(root,'SKILL.md')))findings.push({file:'SKILL.md',line:1,rule:'ROOT_SKILL_SHADOWS_PACKAGE'});
  let names=[];try{names=fs.readdirSync(skillContainer,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);}catch{findings.push({file:'skills',line:1,rule:'SKILLS_DIRECTORY_MISSING'});}
  if(inventory){for(const name of EXPECTED_SKILLS)if(!names.includes(name))findings.push({file:`skills/${name}/SKILL.md`,line:1,rule:'EXPECTED_SKILL_MISSING'});for(const name of names)if(!EXPECTED_SKILLS.includes(name))findings.push({file:`skills/${name}/SKILL.md`,line:1,rule:'UNEXPECTED_SKILL'});}
  for(const name of names){const relative=`skills/${name}/SKILL.md`,absolute=path.join(skillContainer,name,'SKILL.md');if(!fs.existsSync(absolute)){findings.push({file:relative,line:1,rule:'SKILL_FILE_MISSING'});continue;}findings.push(...validateFrontmatter(fs.readFileSync(absolute,'utf8'),{file:relative,directoryName:name}));}
  for(const entry of walked.files){if(path.extname(entry.absolute).toLowerCase()!=='.md')continue;const segments=entry.relative.split('/'),skillRoot=segments[0]==='skills'&&segments.length>2?path.join(skillContainer,segments[1]):undefined;findings.push(...validateMarkdown(fs.readFileSync(entry.absolute,'utf8'),{file:entry.relative,absolute:entry.absolute,root,skillRoot}));}
  const seen=new Set(),unique=findings.filter(x=>{const key=x.file+':'+x.line+':'+x.rule;if(seen.has(key))return false;seen.add(key);return true;});
  return {checkedFiles:walked.files.length,skillCount:names.length,findings:unique};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const args=process.argv.slice(2),rootIndex=args.indexOf('--root'),result=validateRelease(rootIndex>=0?args[rootIndex+1]:DEFAULT_ROOT);
  printFindings(result,{json:args.includes('--json')});if(!args.includes('--json'))console.log(`Validated ${result.skillCount} skill directories. Install discovery is a separate check.`);process.exitCode=result.findings.length?1:0;
}
