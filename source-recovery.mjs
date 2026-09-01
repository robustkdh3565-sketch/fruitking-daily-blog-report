import{scoreVerifiedCandidate,selectTopThree}from'./selection-score.mjs';

export const SOURCE_ORDER=['direct','mobile-amp','official-program','official-article','search-index'];
export const SHORTFALL_REASONS=['원문 접근 실패','본문·첨부물 미확인','최신성 미달','건강 직접 연결 미달','제품 USP 연결 미달','공식 자료 부족','중복 발행 제한'];

export function classifyShortfall(c={}){
  if(c.repeatedWithinDays===true)return'중복 발행 제한';
  if(c.ageHours<0||c.ageHours>36)return'최신성 미달';
  if(c.sourceReachable===false&&!Array.isArray(c.sourceAttempts))return'원문 접근 실패';
  if(c.sourceBodyVerified!==true)return c.attachmentRequired&&!c.attachmentVerified?'본문·첨부물 미확인':'원문 접근 실패';
  if((c.directHealthLinkScore||0)+(c.titleIntroMatchScore||0)+(c.bodyReconnectScore||0)<12)return'건강 직접 연결 미달';
  if((c.fruitkingUspScore||0)<3)return'제품 USP 연결 미달';
  const evidence=c.officialEvidence||[];if((c.officialEvidenceScore||0)<5||evidence.length<3)return'공식 자료 부족';
  return scoreVerifiedCandidate(c).eligible?'상위 3개 미진입':'본문·첨부물 미확인';
}

export function recoverSource(candidate){
  if(candidate.sourceBodyVerified===true)return{...candidate,recoveryStatus:'not-needed'};
  const attempts=[...(candidate.sourceAttempts||[])].sort((a,b)=>SOURCE_ORDER.indexOf(a.type)-SOURCE_ORDER.indexOf(b.type));
  const hit=attempts.find(a=>a.reachable===true&&a.bodyVerified===true&&a.sameTopic===true&&/^https:\/\//.test(a.url||''));
  if(!hit)return{...candidate,recoveryStatus:'failed',recoveryAttempts:attempts.length};
  return{...candidate,url:hit.url,sourceBodyVerified:true,synopsisVerified:hit.synopsisVerified!==false,factOpinionSeparated:hit.factOpinionSeparated!==false,reactionsVerified:hit.reactionsVerified===true||candidate.reactionsVerified===true,recoveredFrom:candidate.url,recoveryStatus:'recovered',recoverySourceType:hit.type,recoveryAttempts:attempts.length};
}

export function rescueZeroSelection(candidates=[],recoveryCandidates=[]){
  const initial=selectTopThree(candidates);
  if(initial.length)return{candidates,selected:initial,recoveryRun:false,recovered:[]};
  const recovered=recoveryCandidates.map(recoverSource).filter(c=>c.recoveryStatus==='recovered');
  const merged=[...candidates,...recovered].filter((c,i,a)=>a.findIndex(x=>x.topicKey===c.topicKey)===i);
  return{candidates:merged,selected:selectTopThree(merged),recoveryRun:true,recovered:recovered.map(x=>x.topicKey)};
}

export function validateBroadcastAudit(c){
  if(c.sourceKind!=='broadcast')return true;
  for(const key of['broadcaster','programName','episode','broadcastDate','synopsis'])if(!c[key])throw Error(`BROADCAST_AUDIT_MISSING ${c.topicKey}.${key}`);
  if(c.viewsCollected!==true&&c.views!=null)throw Error(`BROADCAST_VIEW_ESTIMATE_FORBIDDEN ${c.topicKey}`);
  if(c.viewsCollected!==true&&!c.engagementEvidenceType)throw Error(`BROADCAST_EDITORIAL_SIGNAL_SOURCE_MISSING ${c.topicKey}`);
  return true;
}
