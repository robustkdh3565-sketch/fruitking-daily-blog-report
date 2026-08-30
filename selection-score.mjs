const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export function scoreIssueCandidate(candidate) {
  const issue =
    clamp(candidate.viewVelocityPercentile, 0, 1) * 25 +
    clamp(candidate.viewCountPercentile, 0, 1) * 20 +
    clamp(candidate.engagementPercentile, 0, 1) * 10 +
    clamp((candidate.crossChannelCount - 1) / 3, 0, 1) * 5;
  const conversion =
    clamp(candidate.searchIntentScore, 0, 15) +
    clamp(candidate.healthUspScore, 0, 10) +
    clamp(candidate.officialEvidenceScore, 0, 10) +
    clamp(1 - candidate.ageHours / 36, 0, 1) * 5;
  const hasObservedPopularity = candidate.viewsCollected === true || Number.isFinite(candidate.platformRank);
  const reactivated = candidate.ageHours > 36 && candidate.crossChannelCount >= 2 && candidate.viewVelocityPercentile > 0;
  const withinWindow = candidate.ageHours >= 0 && candidate.ageHours <= 36;
  const exceptionalMissingViews = candidate.viewsCollected !== true && candidate.crossChannelCount >= 2 && Number.isFinite(candidate.platformRank);
  const eligible =
    (withinWindow || reactivated) &&
    hasObservedPopularity &&
    (candidate.viewsCollected === true || exceptionalMissingViews) &&
    issue >= 35 &&
    conversion + issue >= 70 &&
    candidate.searchIntentScore >= 8 &&
    candidate.healthUspScore >= 5 &&
    Boolean(candidate.url) &&
    Boolean(candidate.publishedAt);
  return {
    issueScore: Number(issue.toFixed(2)),
    conversionScore: Number(conversion.toFixed(2)),
    totalScore: Number((issue + conversion).toFixed(2)),
    eligible,
  };
}

export function selectTopThree(candidates) {
  return candidates
    .map((candidate) => ({ ...candidate, score: scoreIssueCandidate(candidate) }))
    .filter((candidate) => candidate.score.eligible)
    .sort((a, b) =>
      b.score.totalScore - a.score.totalScore ||
      b.viewVelocityPercentile - a.viewVelocityPercentile ||
      b.viewCountPercentile - a.viewCountPercentile ||
      b.crossChannelCount - a.crossChannelCount ||
      a.ageHours - b.ageHours)
    .filter((candidate, index, all) => all.findIndex((item) => item.topicKey === candidate.topicKey) === index)
    .slice(0, 3);
}
