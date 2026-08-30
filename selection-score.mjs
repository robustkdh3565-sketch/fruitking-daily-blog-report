const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export function scoreVerifiedCandidate(candidate) {
  const issue = clamp(candidate.viewVelocityPercentile, 0, 1) * 20 + clamp(candidate.viewCountPercentile, 0, 1) * 15 + clamp(candidate.engagementPercentile, 0, 1) * 10;
  const verification = (candidate.sourceBodyVerified ? 8 : 0) + (candidate.synopsisVerified ? 5 : 0) + (candidate.factOpinionSeparated ? 4 : 0) + (candidate.reactionsVerified ? 3 : 0);
  const linkage = clamp(candidate.directHealthLinkScore, 0, 10) + clamp(candidate.titleIntroMatchScore, 0, 5) + clamp(candidate.bodyReconnectScore, 0, 5);
  const search = clamp(candidate.searchSolutionScore, 0, 10);
  const evidence = clamp(candidate.officialEvidenceScore, 0, 5);
  const total = issue + verification + linkage + search + evidence;
  const hasObservedPopularity = candidate.viewsCollected === true || Number.isFinite(candidate.platformRank);
  const hasSynopsis = typeof candidate.synopsis === "string" && candidate.synopsis.trim().length >= 80;
  const eligible = candidate.ageHours >= 0 && candidate.ageHours <= 36 && hasObservedPopularity && candidate.sourceBodyVerified === true && hasSynopsis && verification >= 14 && linkage >= 15 && total >= 75 && Boolean(candidate.url) && Boolean(candidate.publishedAt);
  return { issueScore: Number(issue.toFixed(2)), verificationScore: verification, linkageScore: Number(linkage.toFixed(2)), searchScore: search, evidenceScore: evidence, totalScore: Number(total.toFixed(2)), eligible };
}

export const scoreIssueCandidate = scoreVerifiedCandidate;

export function selectTopThree(candidates) {
  return candidates.map((candidate) => ({ ...candidate, score: scoreVerifiedCandidate(candidate) }))
    .filter((candidate) => candidate.score.eligible)
    .sort((a, b) => b.score.totalScore - a.score.totalScore || b.score.issueScore - a.score.issueScore || b.viewVelocityPercentile - a.viewVelocityPercentile || a.ageHours - b.ageHours)
    .filter((candidate, index, all) => all.findIndex((item) => item.topicKey === candidate.topicKey) === index).slice(0, 3);
}
