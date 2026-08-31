const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
export function scoreVerifiedCandidate(c){
  const popularity=Math.max(clamp(c.viewCountPercentile,0,1),clamp(c.platformRankPercentile,0,1));
  // 조회 증가속도는 게시물 ID가 일치하는 두 개 이상의 스냅샷으로 확인된 경우에만 점수를 준다.
  const velocityScore=c.velocityObserved===true?clamp(c.viewVelocityPercentile,0,1)*20:0;
  // 공개 댓글이 없는 방송 주제는 건강 리서치의 검증된 편집 순위를 같은 칸에서 사용한다.
  // 값의 출처는 engagementEvidenceType으로 반드시 밝혀야 하며, 둘을 더하지 않고 큰 값 하나만 쓴다.
  const engagementSignal=Math.max(clamp(c.engagementPercentile,0,1),clamp(c.topicSignalPercentile,0,1));
  const popularityScore=popularity*15,engagementScore=engagementSignal*10;
  const issue=velocityScore+popularityScore+engagementScore;
  const verification=(c.sourceBodyVerified?8:0)+(c.synopsisVerified?5:0)+(c.factOpinionSeparated?4:0)+(c.reactionsVerified?3:0);
  const linkage=clamp(c.directHealthLinkScore,0,8)+clamp(c.titleIntroMatchScore,0,4)+clamp(c.bodyReconnectScore,0,3);
  const search=clamp(c.searchSolutionScore,0,10),evidence=clamp(c.officialEvidenceScore,0,5),usp=clamp(c.fruitkingUspScore,0,5);
  const total=issue+verification+linkage+search+evidence+usp;
  const observed=c.viewsCollected===true||Number.isFinite(c.platformRank);
  const synopsis=typeof c.synopsis==='string'&&c.synopsis.trim().length>=80;
  const eligible=c.ageHours>=0&&c.ageHours<=36&&observed&&c.sourceBodyVerified===true&&synopsis&&verification>=14&&linkage>=12&&usp>=3&&total>=75&&Boolean(c.url)&&Boolean(c.publishedAt);
  return{velocityScore:+velocityScore.toFixed(2),popularityScore:+popularityScore.toFixed(2),engagementScore:+engagementScore.toFixed(2),issueScore:+issue.toFixed(2),verificationScore:verification,linkageScore:+linkage.toFixed(2),searchScore:search,evidenceScore:evidence,uspScore:usp,totalScore:+total.toFixed(2),eligible};
}
export const scoreIssueCandidate=scoreVerifiedCandidate;
export function selectTopThree(cs){return cs.map(c=>({...c,score:scoreVerifiedCandidate(c)})).filter(c=>c.score.eligible).sort((a,b)=>b.score.totalScore-a.score.totalScore||b.score.issueScore-a.score.issueScore||b.viewVelocityPercentile-a.viewVelocityPercentile||a.ageHours-b.ageHours).filter((c,i,a)=>a.findIndex(x=>x.topicKey===c.topicKey)===i).slice(0,3)}
