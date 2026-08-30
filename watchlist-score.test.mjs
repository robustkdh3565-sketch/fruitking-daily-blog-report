import assert from'node:assert/strict';import{scoreWatchlistCandidate}from'./watchlist-score.mjs';
assert.equal(scoreWatchlistCandidate({predictionSignals:{verifiedMomentum:30,celebrityOrBroadcast:20,specificNumberOrBeforeAfter:15,immediateActionOrUrgency:10,searchExpansion:8,fruitkingConnection:5}}).total,88);
assert.equal(scoreWatchlistCandidate({predictionSignals:{verifiedMomentum:10,celebrityOrBroadcast:10,specificNumberOrBeforeAfter:5,immediateActionOrUrgency:5,searchExpansion:5,fruitkingConnection:5}}).likelyToRise,false);
console.log('watchlist scoring tests passed');
