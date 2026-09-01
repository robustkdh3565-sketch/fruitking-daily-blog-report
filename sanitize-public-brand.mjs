import fs from'node:fs';import path from'node:path';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),targets=[path.join(root,'reports'),path.join(root,'index.html')];
const files=[];for(const t of targets){if(!fs.existsSync(t))continue;if(fs.statSync(t).isFile())files.push(t);else for(const name of fs.readdirSync(t))if(/\.(html|md)$/.test(name))files.push(path.join(t,name))}
const replacements=[[/FRUITKING DAILY EDITORIAL/gi,'DAILY EDITORIAL REPORT'],[/FRUITKING/gi,'DAILY REPORT'],[/프룻킹 데일리 블로그/g,'데일리 블로그 리포트'],[/프룻킹과의 연결/g,'식생활 연결'],[/프룻킹 USP/g,'식생활 적합성'],[/프룻킹/g,'식생활 기준']];
for(const file of files){let s=fs.readFileSync(file,'utf8');for(const[a,b]of replacements)s=s.replace(a,b);fs.writeFileSync(file,s)}
console.log(`public brand tokens sanitized: ${files.length} files checked`);
