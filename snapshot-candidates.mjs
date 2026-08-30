import fs from 'node:fs';
import path from 'node:path';

const topicGroups = {
  directHealth: ['식단','다이어트','감량','체중','비만','마운자로','위고비','건강','통증','허리','목디스크','저림','혈변','대장','치매','뇌경색','골절','근육','과로','수면','당류','설탕','유산균','요구르트','운동','질환','검사'],
  foodRoutine: ['아침식사','아침 식사','간식','과일','채소','식사','먹는','레시피','도시락','야식','음료','커피','루틴','생활 패턴'],
  issueBridge: ['kg','칼로리','전후','변화','추천템','관리법','습관','동안','노화']
};
const hhmm = (file) => Number(file.slice(0, 2)) * 60 + Number(file.slice(2, 4));
const bucket = (hours) => hours < 6 ? '0-6' : hours < 12 ? '6-12' : hours < 24 ? '12-24' : hours < 48 ? '24-48' : '48+';
const percentile = (value, rows, field) => {
  const values = rows.map((row) => row[field]).filter(Number.isFinite).sort((a, b) => a - b);
  if (!Number.isFinite(value) || !values.length) return null;
  return values.filter((x) => x <= value).length / values.length;
};
const postKey = (url) => { try { const u = new URL(url); return decodeURIComponent(u.hostname.replace(/^www\./, '') + u.pathname + u.search); } catch { return url; } };

export function locateSnapshotFiles(snapshotRoot, date) {
  const dir = path.join(snapshotRoot, date);
  if (!fs.existsSync(dir)) throw Error(`SNAPSHOT_DATE_MISSING ${date}`);
  const files = fs.readdirSync(dir).filter((x) => /^\d{6}\.json$/.test(x));
  const picked = [660, 900, 1140].map((target) => files.map((file) => ({ file, distance: Math.abs(hhmm(file) - target) })).sort((a, b) => a.distance - b.distance)[0]).map((x) => x && x.distance <= 90 ? path.join(dir, x.file) : null);
  if (picked.some((x) => !x)) throw Error(`REQUIRED_SNAPSHOT_MISSING ${date}`);
  return picked;
}

export function extractSnapshotCandidates(files) {
  const all = files.flatMap((file) => {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return (data.items || []).map((item) => {
      const ageHours = item.publishedAt ? Math.max(0, (new Date(data.checkedAt) - new Date(item.publishedAt)) / 36e5) : null;
      return { ...item, checkedAt: data.checkedAt, sourceSnapshot: path.basename(file), ageHours, ageBucket: bucket(ageHours ?? 999), viewsPerHour: item.comparison?.measured === true && Number(item.comparison?.elapsedHours) >= 1 ? Number(item.comparison?.viewsPerHour) : null, engagement: (Number(item.comments) || 0) + (Number(item.reactions) || 0) };
    });
  });
  const byPost = new Map();
  for (const item of all) {
    const text = `${item.title || ''} ${item.topic || ''} ${item.normalizedTitle || ''}`.toLowerCase();
    const matchedGroups = Object.entries(topicGroups).filter(([, terms]) => terms.some((term) => text.includes(term.toLowerCase()))).map(([name]) => name);
    if (!matchedGroups.includes('directHealth') && !matchedGroups.includes('foodRoutine')) continue;
    const peers = all.filter((row) => row.community === item.community && row.ageBucket === item.ageBucket);
    const viewPercentile = percentile(item.views, peers, 'views');
    const engagementPercentile = percentile(item.engagement, peers, 'engagement');
    const velocityPeers = peers.filter((row) => Number.isFinite(row.viewsPerHour));
    const velocityPercentile = percentile(item.viewsPerHour, velocityPeers, 'viewsPerHour');
    const rankPercentile = Number.isFinite(item.rank) && Number.isFinite(item.candidateCount) ? Math.max(0, 1 - (item.rank - 1) / Math.max(1, item.candidateCount)) : null;
    const score = 40 * (velocityPercentile ?? 0) + 20 * Math.max(viewPercentile ?? 0, rankPercentile ?? 0) + 20 * (engagementPercentile ?? 0) + 10 * Math.min(1, matchedGroups.length / 2) + 10 * Math.max(0, 1 - (item.ageHours ?? 72) / 72);
    const row = { postId: postKey(item.url), community: item.community, title: item.title, url: item.url, publishedAt: item.publishedAt, ageHours: item.ageHours, ageBucket: item.ageBucket, views: item.views ?? null, comments: item.comments ?? null, reactions: item.reactions ?? null, rank: item.rank ?? null, viewsPerHour: item.viewsPerHour, velocityObserved: Number.isFinite(item.viewsPerHour), communityViewPercentile: viewPercentile, communityEngagementPercentile: engagementPercentile, communityVelocityPercentile: velocityPercentile, platformRankPercentile: rankPercentile, matchedGroups, sourceSnapshot: item.sourceSnapshot, checkedAt: item.checkedAt, automaticDiscoveryScore: Math.round(score * 100) / 100 };
    const old = byPost.get(row.postId);
    if (!old || row.automaticDiscoveryScore > old.automaticDiscoveryScore) byPost.set(row.postId, row);
  }
  return [...byPost.values()].sort((a, b) => b.automaticDiscoveryScore - a.automaticDiscoveryScore);
}

export function snapshotDateForReport(reportDate, effectiveFrom = '2026-08-31') {
  if (reportDate < effectiveFrom) return reportDate;
  const date = new Date(`${reportDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
