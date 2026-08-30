const cap=(v,max)=>Math.min(max,Math.max(0,Number(v)||0));
export const WATCHLIST_WEIGHTS={verifiedMomentum:30,celebrityOrBroadcast:20,specificNumberOrBeforeAfter:15,immediateActionOrUrgency:15,searchExpansion:10,fruitkingConnection:10};
export function scoreWatchlistCandidate(c){
 const components={};for(const[k,max]of Object.entries(WATCHLIST_WEIGHTS))components[k]=cap(c.predictionSignals?.[k],max);
 const total=Object.values(components).reduce((a,b)=>a+b,0);return{components,total,likelyToRise:total>=75};
}
