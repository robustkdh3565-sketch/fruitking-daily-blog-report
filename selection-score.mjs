const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
export function scoreVerifiedCandidate(c){
  const popularity=Math.max(clamp(c.viewCountPercentile,0,1),clamp(c.platformRankPercentile,0,1));
  const issue=clamp(c.viewVelocityPercentile,0,1)*20+popularity*15+clamp(c.engagementPercentile,0,1)*10;
  const verification=(c.sourceBodyVerified?8:0)+(c.synopsisVerified?5:0)+(c.factOpinionSeparated?4:0)+(c.reactionsVerified?3:0);
  const linkage=clamp(c.directHealthLinkScore,0,8)+clamp(c.titleIntroMatchScore,0,4)+clamp(c.bodyReconnectScore,0,3);
  const search=clamp(c.searchSolutionScore,0,10),evidence=clamp(c.officialEvidenceScore,0,5),usp=clamp(c.fruitkingUspScore,0,5);
  const total=issue+verification+linkage+search+evidence+usp;
  const observed=c.viewsCollected===true||Number.isFinite(c.platformRank);
  const synopsis=typeof c.synopsis==='string'&&c.synopsis.trim().length>=80;
  const eligible=c.ageHours>=0&&c.ageHours<=36&&observed&&c.sourceBodyVerified===true&&synopsis&&verification>=14&&linkage>=12&&usp>=3&&total>=75&&Boolean(c.url)&&Boolean(c.publishedAt);
  return{issueScore:+issue.toFixed(2),verificationScore:verification,linkageScore:+linkage.toFixed(2),searchScore:search,evidenceScore:evidence,uspScore:usp,totalScore:+total.toFixed(2),eligible};
}
export const scoreIssueCandidate=scoreVerifiedCandidate;
export function selectTopThree(cs){return cs.map(c=>({...c,score:scoreVerifiedCandidate(c)})).filter(c=>c.score.eligible).sort((a,b)=>b.score.totalScore-a.score.totalScore||b.score.issueScore-a.score.issueScore||b.viewVelocityPercentile-a.viewVelocityPercentile||a.ageHours-b.ageHours).filter((c,i,a)=>a.findIndex(x=>x.topicKey===c.topicKey)===i).slice(0,3)}
