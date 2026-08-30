import assert from "node:assert/strict";
import { scoreIssueCandidate, selectTopThree } from "./selection-score.mjs";

const strong = {
  topicKey: "strong", publishedAt: "2026-08-30T09:00:00+09:00", url: "https://example.com/1",
  ageHours: 20, viewsCollected: true, platformRank: 1, viewVelocityPercentile: 0.95,
  viewCountPercentile: 0.9, engagementPercentile: 0.8, crossChannelCount: 3,
  searchIntentScore: 13, healthUspScore: 8, officialEvidenceScore: 9,
};
assert.equal(scoreIssueCandidate(strong).eligible, true);
assert.equal(scoreIssueCandidate({ ...strong, viewsCollected: false, platformRank: undefined, crossChannelCount: 1 }).eligible, false);
assert.equal(scoreIssueCandidate({ ...strong, ageHours: 60, crossChannelCount: 1 }).eligible, false);
assert.equal(selectTopThree([strong, { ...strong, topicKey: "two", viewVelocityPercentile: 0.8 }]).length, 2);
console.log("issue-first selection tests passed");
