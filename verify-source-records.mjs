import fs from'node:fs';import path from'node:path';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),dir=path.join(root,'data');
const latest=fs.readdirSync(dir).filter(x=>/^\d{4}-\d{2}-\d{2}-daily-report\.json$/.test(x)).sort().at(-1);if(!latest)throw Error('DAILY_REPORT_NOT_FOUND');
const data=JSON.parse(fs.readFileSync(path.join(dir,latest),'utf8'));if(!Array.isArray(data.researchLineage)||data.researchLineage.length<3)throw Error('RESEARCH_LINEAGE_MISSING');
for(const[i,s]of data.researchLineage.entries())if(!/^https:\/\//.test(s.url)||!s.result)throw Error(`LINEAGE_INVALID ${i}`);
for(const[i,c]of data.candidates.entries()){
 if(!/^https:\/\//.test(c.url)||!c.sourceBodyVerified||!c.synopsisVerified||String(c.synopsis).trim().length<80)throw Error(`SOURCE_VERIFICATION_INVALID ${i}`);
 if(c.velocityObserved===true&&(!Number.isFinite(c.viewVelocity)||!Array.isArray(c.snapshotRefs)||c.snapshotRefs.length<2))throw Error(`VELOCITY_LINEAGE_INVALID ${i}`);
 if(c.velocityObserved!==true&&Number(c.viewVelocityPercentile)>0)throw Error(`UNOBSERVED_VELOCITY_SCORED ${i}`);
 if(!c.optimizedTitle||!c.searchIntent||c.hashtags.length<6||c.hashtags.length>10)throw Error(`SEO_RECORD_INVALID ${i}`);
}
console.log(`latest source records passed: ${latest}`);
