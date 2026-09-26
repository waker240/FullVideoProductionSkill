#!/usr/bin/env node
/** Release-boundary scanner. Findings contain only relative file, line, and rule. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OMIT = new Set(['.git', 'node_modules']);
const BINARY = new Set(['.png','.jpg','.jpeg','.gif','.webp','.ico','.woff','.woff2','.ttf','.otf','.mp4','.mov','.webm','.mp3','.wav','.flac','.ogg','.pdf','.zip','.gz','.7z']);
const PLACEHOLDER = /^(?:|<[^>]+>|\$\{[^}]+\}|\$[A-Z_][A-Z0-9_]*|%[A-Z_][A-Z0-9_]*%|(?:YOUR|MY|EXAMPLE|TEST|DUMMY|FAKE|REPLACE|INSERT|CHANGE|PLACEHOLDER)[-_ ][A-Z0-9_-]+|replace[-_ ]?me|change[-_ ]?me|example|placeholder|none|null|undefined|false|true|test|dummy|fake|optional|not[-_]set|redacted|\.\.\.)$/i;
const VENDOR_RULES = [
  ['SECRET_PRIVATE_KEY', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/g],
  ['SECRET_OPENAI_KEY', /\bsk-(?:(?:proj|svcacct)-)?[A-Za-z0-9_-]{24,}\b/g],
  ['SECRET_ANTHROPIC_KEY', /\bsk-ant-[A-Za-z0-9_-]{24,}\b/g],
  ['SECRET_GITHUB_TOKEN', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/g],
  ['SECRET_AWS_ACCESS_KEY', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['SECRET_GOOGLE_API_KEY', /\bAIza[A-Za-z0-9_-]{35}\b/g],
  ['SECRET_SLACK_TOKEN', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g],
  ['SECRET_JWT', /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{12,}\b/g],
];

function placeholder(value) {
  return PLACEHOLDER.test(value.trim()) || /\$\{|process\.env\.|os\.environ|Deno\.env|import\.meta\.env|secrets\.[A-Z_]|env\.[A-Z_]|getenv\(|getSecret\(/i.test(value);
}
function endpointPlaceholder(value) {
  return /(?:^|[./_-])(?:example|test|your|placeholder|localhost|127\.0\.0\.1)(?:[./_:-]|$)|[<>]/i.test(value);
}
function hasPrivateAddress(line) {
  const urls=line.match(/https?:\/\/[^\s<>"'`)]+/gi)||[];
  for(const text of urls){
    if(endpointPlaceholder(text))continue;
    let host;try{host=new URL(text).hostname.toLowerCase();}catch{continue;}
    if(/^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|169\.254\.)/.test(host)||/^\[(?:f[cd][0-9a-f]{2}:|fe[89ab][0-9a-f]:)/.test(host)||/\.(?:local|internal)$/.test(host)||/\.(?:ngrok(?:-free)?\.(?:app|dev|io)|trycloudflare\.com)$/.test(host))return true;
  }
  return false;
}
function hasLocalPath(line) {
  const windows=line.match(/\b[A-Za-z]:[\\/][^\s`"'<>]+/g)||[];
  for(const value of windows){
    if(!/^[A-Za-z]:[\\/](?:path|your[-_ ]?(?:path|project)|example|temp|tmp)(?:[\\/]|$)/i.test(value))return true;
  }
  const unix=line.match(/\/(?:Users|home|Volumes|mnt)\/[^\s`"'<>]+/g)||[];
  return unix.some(value=>!/^\/(?:Users|home)\/(?:user|username|your-user|example|runner)(?:\/|$)/i.test(value)&&!/^\/mnt\/data(?:\/|$)/.test(value));
}
function contextCredential(line) {
  const expression=/\b(?:[a-z0-9]+[_-])*(?:api[_-]?key|access[_-]?token|refresh[_-]?token|auth[_-]?token|token|secret|client[_-]?secret|password|passwd|authorization|cookie|session[_-]?id)\b["']?\s*[:=]\s*(?:"([^"\r\n]*)"|'([^'\r\n]*)'|`([^`\r\n]*)`|([^\s,;#}\]]+))/gi;
  for(const match of line.matchAll(expression)){
    const quoted=match[1]!==undefined||match[2]!==undefined||match[3]!==undefined;
    let value=match[1]??match[2]??match[3]??match[4]??'';
    if(placeholder(value))continue;
    value=value.replace(/^(?:Bearer|Basic)\s+/i,'');
    if(placeholder(value))continue;
    if(quoted && value.length>=8)return true;
    if(quoted && /^[A-Za-z0-9]+$/.test(value) && value.length>=12 && /[A-Z]/.test(value) && /[a-z]/.test(value))return true;
    if(!quoted && /^[A-Za-z0-9+/=_-]{20,}$/.test(value) && /[A-Za-z]/.test(value)&&/\d/.test(value))return true;
    if(/^(?:session|sessionid|auth|token|__Secure-[^=]+)=[^;]{8,}/i.test(value))return true;
  }
  const dotenv=/^\s*(?:export\s+)?(?:[A-Z0-9_]*(?:API_KEY|ACCESS_TOKEN|REFRESH_TOKEN|AUTH_TOKEN|SECRET|PASSWORD|COOKIE))\s*=\s*([^#\r\n]+)\s*$/i.exec(line);
  if(dotenv&&!placeholder(dotenv[1].trim().replace(/^['"]|['"]$/g,'')))return true;
  for(const match of line.matchAll(/\b(?:Authorization|X-API-Key)\s*:\s*(?:(?:Bearer|Basic)\s+)?([A-Za-z0-9+/=_-]{16,})/gi))if(!placeholder(match[1]))return true;
  return false;
}
export function scanText(text,file='input') {
  const findings=[],seen=new Set();
  const add=(line,rule)=>{const id=`${line}:${rule}`;if(!seen.has(id)){seen.add(id);findings.push({file,line,rule});}};
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/);
  lines.forEach((line,index)=>{
    for(const [rule,regex]of VENDOR_RULES){regex.lastIndex=0;if(regex.test(line))add(index+1,rule);}
    if(contextCredential(line))add(index+1,'SECRET_CREDENTIAL_LITERAL');
    if(/https?:\/\/[^\s/<>"']+:[^\s@/<>"']+@/i.test(line)&&!/<[^>]+>|your[-_]|example/i.test(line))add(index+1,'SECRET_URL_CREDENTIALS');
    if(hasPrivateAddress(line))add(index+1,'PRIVATE_ENDPOINT');
    if(hasLocalPath(line))add(index+1,'LOCAL_MACHINE_PATH');
  });
  return findings;
}
export function listFiles(root) {
  const files=[],issues=[];
  function walk(dir){
    let entries;try{entries=fs.readdirSync(dir,{withFileTypes:true});}catch{issues.push({file:path.relative(root,dir).split(path.sep).join('/')||'.',line:1,rule:'UNREADABLE_DIRECTORY'});return;}
    for(const entry of entries){
      if(OMIT.has(entry.name))continue;
      const absolute=path.join(dir,entry.name),relative=path.relative(root,absolute).split(path.sep).join('/');
      if(entry.isSymbolicLink()){issues.push({file:relative,line:1,rule:'SYMLINK_IN_RELEASE'});continue;}
      if(entry.isDirectory()){walk(absolute);continue;}
      if(entry.isFile())files.push({absolute,relative});
    }
  }
  walk(path.resolve(root));return {files,issues};
}
function forbiddenFile(name) {
  const base=path.basename(name).toLowerCase();
  if(/^\.env(?:\..+)?$/.test(base)&&!/^\.env\.(?:example|sample|template)$/.test(base))return 'PRIVATE_ENV_FILE';
  if(/^cookies?(?:-(?:journal|wal|shm))?$/.test(base)||/^(?:.*[-_.])?cookies?(?:[-_.].*)?\.(?:json|txt|sqlite|db)$/.test(base)||/^(?:storage[-_]?state|browser[-_]?state)\.json$/.test(base))return 'PRIVATE_COOKIE_FILE';
  if(/^(?:id_rsa|id_ed25519|id_ecdsa)(?:\.pub)?$/.test(base)||/\.(?:p12|pfx|key|pem)$/.test(base))return 'PRIVATE_KEY_FILE';
  return null;
}
export function scanRelease(root=DEFAULT_ROOT) {
  const {files,issues}=listFiles(root),findings=[...issues];
  for(const file of files){
    const rule=forbiddenFile(file.relative);if(rule)findings.push({file:file.relative,line:1,rule});
    if(BINARY.has(path.extname(file.relative).toLowerCase()))continue;
    let buffer;try{buffer=fs.readFileSync(file.absolute);}catch{findings.push({file:file.relative,line:1,rule:'UNREADABLE_FILE'});continue;}
    let text;
    if(buffer[0]===0xff&&buffer[1]===0xfe)text=buffer.subarray(2).toString('utf16le');
    else if(buffer[0]===0xfe&&buffer[1]===0xff){const swapped=Buffer.from(buffer.subarray(2));if(swapped.length%2===0){swapped.swap16();text=swapped.toString('utf16le');}}
    else if(!buffer.subarray(0,8192).includes(0))text=buffer.toString('utf8');
    if(text!==undefined)findings.push(...scanText(text,file.relative));
  }
  return {root:path.resolve(root),checkedFiles:files.length,findings};
}
export function printFindings(result,{json=false}={}) {
  if(json){console.log(JSON.stringify({checkedFiles:result.checkedFiles,findings:result.findings},null,2));return;}
  for(const entry of result.findings)console.error(`${entry.file}:${entry.line} ${entry.rule}`);
  console.log(`Checked ${result.checkedFiles} files; ${result.findings.length} finding(s). No matched values are printed.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const args=process.argv.slice(2),rootIndex=args.indexOf('--root');
  const result=scanRelease(rootIndex>=0?args[rootIndex+1]:DEFAULT_ROOT);
  printFindings(result,{json:args.includes('--json')});process.exitCode=result.findings.length?1:0;
}
