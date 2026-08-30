import fs from'node:fs';import path from'node:path';import{selectTopThree}from'./selection-score.mjs';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),dir=path.join(root,'data'),files=fs.readdirSync(dir).filter(x=>/^\d{4}-\d{2}-\d{2}-daily-report\.json$/.test(x)).sort(),file=files.at(-1);if(!file)throw Error('DAILY_INPUT_MISSING');
const d=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8')),all=[...d.candidates,...d.missedCandidates];
if(d.missedCandidates.length<10)throw Error('WATCHLIST_MINIMUM_NOT_MET');for(const group of[d.candidates,d.missedCandidates]){const urls=group.map(x=>x.url);if(new Set(urls).size!==urls.length)throw Error('DUPLICATE_SOURCE_URL')}
for(const[i,c]of d.candidates.entries())if(!/^https:\/\//.test(c.url)||String(c.synopsis||'').length<80)throw Error(`SOURCE_RECORD_INCOMPLETE candidate:${i}`);
for(const[i,c]of d.missedCandidates.entries())if(!/^https:\/\//.test(c.url)||String(c.summary||'').length<50)throw Error(`SOURCE_RECORD_INCOMPLETE watchlist:${i}`);
if(d.pipelinePolicy?.publicationHourKst!==12||d.pipelinePolicy?.confirmedSnapshotRule!=='previous-day-11-15-19')throw Error('PUBLICATION_WINDOW_POLICY_INVALID');
if(!Array.isArray(d.watchlistSourceAudits)||d.watchlistSourceAudits.length!==d.missedCandidates.length)throw Error('WATCHLIST_AUDIT_COVERAGE_INVALID');
const normalized=s=>String(s).toLowerCase().replace(/[^가-힣a-z0-9]/g,'');for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=normalized(all[i].topic||all[i].optimizedTitle||all[i].title),b=normalized(all[j].topic||all[j].optimizedTitle||all[j].title);if(a&&a===b)throw Error(`DUPLICATE_TOPIC ${i}:${j}`)}
const currentKeys=new Set(selectTopThree(d.candidates).map(x=>x.topicKey));for(const oldFile of files.slice(-8,-1)){const old=JSON.parse(fs.readFileSync(path.join(dir,oldFile),'utf8'));for(const c of selectTopThree(old.candidates||[]))if(currentKeys.has(c.topicKey))throw Error(`REPEATED_SELECTED_TOPIC ${c.topicKey}`)}
console.log(`pipeline gates passed: ${all.length} unique candidates`);
