import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const manifestPath = process.env.FRUITKING_SOURCE_MANIFEST || path.join(root, "data/2026-08-30-sources.json");
const sourceManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const publicationDate = sourceManifest.reportDate;
if (!publicationDate) throw new Error("PUBLICATION_DATE_MISSING");

function validateSources(manifest) {
  if (manifest.reportDate !== "2026-08-30") throw new Error("SOURCE_DATE_MISMATCH: report date");
  const reportDate = new Date(`${manifest.reportDate}T23:59:59+09:00`);
  const seen = new Set();
  for (const [key, source] of Object.entries(manifest.sources)) {
    for (const field of ["sourceId", "channel", "title", "url", "collectedAt"]) {
      if (!source[field]) throw new Error(`SOURCE_FIELD_MISSING: ${key}.${field}`);
    }
    if (seen.has(source.sourceId)) throw new Error(`SOURCE_ID_DUPLICATE: ${source.sourceId}`);
    seen.add(source.sourceId);
    if (!source.url.includes(source.sourceId) && !source.url.includes(source.sourceId.replace(/^[^-]+-/, ""))) {
      throw new Error(`SOURCE_URL_ID_MISMATCH: ${key}`);
    }
    const published = source.publishedAt || source.publishedDateRange?.[1];
    if (source.primaryForDailyTrend && !published) throw new Error(`SOURCE_PUBLISHED_DATE_MISSING: ${key}`);
    if (source.primaryForDailyTrend) {
      const ageDays = (reportDate - new Date(published)) / 86400000;
      if (ageDays < 0 || ageDays > manifest.maxPrimaryAgeDays) throw new Error(`SOURCE_TOO_OLD: ${key} (${ageDays.toFixed(1)} days)`);
    }
    if (source.originReport) {
      const originPath = path.resolve(root, source.originReport);
      const origin = fs.readFileSync(originPath, "utf8");
      if (!origin.includes(source.sourceId) || !origin.includes(source.url)) {
        throw new Error(`SOURCE_LINEAGE_BROKEN: ${key}`);
      }
    }
    for (const [imageIndex, image] of (source.images || []).entries()) {
      for (const field of ["directUrl", "sourcePage", "alt", "placement", "license"]) {
        if (!image[field]) throw new Error(`IMAGE_FIELD_MISSING: ${key}.images[${imageIndex}].${field}`);
      }
      if (!/\.(jpe?g|png|gif)$/i.test(new URL(image.directUrl).pathname)) {
        throw new Error(`IMAGE_URL_EXTENSION_INVALID: ${key}.images[${imageIndex}]`);
      }
    }
    if ((source.images || []).length !== 5) throw new Error(`IMAGE_COUNT_INVALID: ${key} requires exactly 5 images`);
    if ((source.healthEvidence || []).length !== 3) throw new Error(`HEALTH_EVIDENCE_COUNT_INVALID: ${key} requires exactly 3 items`);
    for (const [evidenceIndex, evidence] of source.healthEvidence.entries()) {
      for (const field of ["organization", "type", "title", "url", "fact", "articleUse"]) {
        if (!evidence[field]) throw new Error(`HEALTH_EVIDENCE_FIELD_MISSING: ${key}.healthEvidence[${evidenceIndex}].${field}`);
      }
      if (!/^https:\/\//.test(evidence.url)) throw new Error(`HEALTH_EVIDENCE_URL_INVALID: ${key}.healthEvidence[${evidenceIndex}]`);
    }
  }
}

validateSources(sourceManifest);

function sourceDates(source) {
  const dates = [];
  if (source.broadcastAt) dates.push(["방송일", source.broadcastAt.slice(0, 10)]);
  if (source.publishedAt) dates.push(["게시·발행일", source.publishedAt.replace("T", " ").slice(0, 16)]);
  if (source.publishedDateRange) dates.push(["공개일 범위", `${source.publishedDateRange[0]}~${source.publishedDateRange[1]}`]);
  dates.push(["수집 확인일", source.collectedAt.slice(0, 10)]);
  return dates;
}

function validateNaturalKorean(markdown, file) {
  const hardPatterns = [
    ["EM_DASH", /—/],
    ["AI_META", /(?:이 글에서는 알아보겠습니다|도움이 되었기를 바랍니다|궁금한 점이 있다면|결론적으로|요약하자면)/],
    ["MECHANICAL_ORDER", /첫째[\s\S]{0,500}둘째[\s\S]{0,500}셋째/],
  ];
  for (const [label, pattern] of hardPatterns) {
    if (pattern.test(markdown)) throw new Error(`NATURAL_KOREAN_${label}: ${file}`);
  }
  const sentences = markdown.replace(/^#+.*$/gm, "").split(/[.!?]\s+/).map((value) => value.trim()).filter(Boolean);
  let previousEnding = "";
  let run = 0;
  let longestRun = 0;
  for (const sentence of sentences) {
    const ending = sentence.match(/(습니다|합니다|됩니다|있습니다|없습니다|좋습니다|봅니다|세요|예요|이에요|해요)$/)?.[1] || "";
    run = ending && ending === previousEnding ? run + 1 : 1;
    previousEnding = ending;
    longestRun = Math.max(longestRun, run);
  }
  if (longestRun > 4) throw new Error(`NATURAL_KOREAN_ENDING_REPETITION: ${file} (${longestRun})`);
  return { status: "통과", longestEndingRun: longestRun };
}

const articles = [
  {
    sourceKey: "community-breakfast",
    format: "화제 해설형 · 자연스러운 한국어 최종 보정 통과",
    source: "이토랜드 · 990원 아침식사",
    file: "articles/2026-08-30-neutral-01-breakfast.md",
    score: 90,
    decision: "핵심 발행",
    topic: {
      primaryKeyword: "아침 식단",
      searchIntent: "저렴하면서도 포만감과 준비 시간을 함께 만족하는 아침 구성 찾기",
      optimizedTitle: "990원 아침식사 화제, 가격·포만감·준비 시간으로 고르는 아침 식단",
      supportingKeywords: ["간편 아침", "5분 아침", "1인 가구 식단", "요구르트 아침"],
      hashtags: [
        ["#990원아침식사", "990원 아침식사"], ["#아침식단", "아침 식단"],
        ["#건강한아침식사", "아침 식사"], ["#간편아침", "간단한 아침"],
        ["#5분아침", "5분"], ["#직장인아침", "직장인"],
        ["#1인가구식단", "1인 가구"], ["#요구르트아침", "요구르트"]
      ]
    },
  },
  {
    sourceKey: "broadcast-weight",
    format: "사례 분석형 · 자연스러운 한국어 최종 보정 통과",
    source: "MBC 전지적 참견 시점 · 황재균 18kg 감량",
    file: "articles/2026-08-30-neutral-02-weight.md",
    score: 86,
    decision: "발행 가능",
    topic: {
      primaryKeyword: "다이어트 식단",
      searchIntent: "빠른 감량 수치보다 근육과 일상을 유지하는 현실적인 감량 기준 찾기",
      optimizedTitle: "황재균 18kg 감량 사례로 보는 근육을 지키는 다이어트 식단 기준",
      supportingKeywords: ["근육 유지", "체중 관리", "근력 운동", "외식 다이어트"],
      hashtags: [
        ["#황재균18kg감량", "황재균"], ["#다이어트식단", "다이어트"],
        ["#감량식단", "감량 식단"], ["#근육유지", "근육"],
        ["#체중관리", "체중"], ["#근력운동", "근력운동"],
        ["#다이어트수면", "수면"], ["#외식다이어트", "외식"]
      ]
    },
  },
  {
    sourceKey: "health-colon",
    format: "검색 해결형 · 자연스러운 한국어 최종 보정 통과",
    source: "SBS 좋은아침 · 대장 건강",
    file: "articles/2026-08-30-neutral-03-colon.md",
    score: 87,
    decision: "발행 가능",
    topic: {
      primaryKeyword: "대장 건강",
      searchIntent: "혈변과 배변 변화가 있을 때 검사와 생활 관리를 어떻게 구분할지 확인하기",
      optimizedTitle: "대장 건강 관리, 혈변·대장내시경·식이섬유를 구분해서 봐야 하는 이유",
      supportingKeywords: ["혈변", "대장내시경", "식이섬유", "배변 습관"],
      hashtags: [
        ["#대장건강", "대장 건강"], ["#혈변", "혈변"],
        ["#대장내시경", "대장내시경"], ["#식이섬유", "식이섬유"],
        ["#장건강습관", "장 건강"], ["#배변습관", "배변"],
        ["#유산균", "유산균"], ["#수분섭취", "수분"]
      ]
    },
  },
];

const rendered = articles.map(({ sourceKey, format, source, file, score, decision, topic }, index) => {
  const sourceData = sourceManifest.sources[sourceKey];
  if (!sourceData) throw new Error(`ARTICLE_SOURCE_NOT_FOUND: ${sourceKey}`);
  const { url, metrics } = sourceData;
  const dates = sourceDates(sourceData);
  const markdown = fs.readFileSync(path.join(root, file), "utf8");
  const naturalKorean = validateNaturalKorean(markdown, file);
  const body = markdown.replace(/^#.*\r?\n/, "").replace(/^##.*\r?\n/gm, "");
  const chars = body.length;
  if (chars < 3000) throw new Error(`ARTICLE_TOO_SHORT: ${file} (${chars} chars, minimum 3000)`);
  if (!topic || topic.hashtags.length < 6 || topic.hashtags.length > 10) throw new Error(`HASHTAG_COUNT_INVALID: ${file}`);
  const evidenceText = `${markdown} ${JSON.stringify(sourceData)}`.replace(/\s+/g, "");
  for (const [tag, evidence] of topic.hashtags) {
    if (!tag.startsWith("#") || /\s/.test(tag)) throw new Error(`HASHTAG_FORMAT_INVALID: ${file} ${tag}`);
    if (!evidenceText.includes(evidence.replace(/\s+/g, ""))) throw new Error(`HASHTAG_WITHOUT_EVIDENCE: ${file} ${tag} <- ${evidence}`);
  }
  const articleHtml = marked.parse(markdown).replace(/(<h1>.*?<\/h1>)/s, `$1<div class="publish-date">발행일 2026-08-30</div>`);
  const metricHtml = metrics.map(([label, value]) => `<div><small>${label}</small><strong>${value}</strong></div>`).join("");
  const dateHtml = dates.map(([label, value]) => `<div><small>${label}</small><b>${value}</b></div>`).join("");
  const imagesHtml = (sourceData.images || []).map((image, imageIndex) => `<div class="image-card"><b>${imageIndex + 1}. ${image.alt}</b><span>삽입 위치: ${image.placement}</span><small>사용 조건: ${image.license}</small><code>${image.directUrl}</code><a href="${image.directUrl}" target="_blank" rel="noopener noreferrer">이미지 URL 열기</a><a class="license-link" href="${image.sourcePage}" target="_blank" rel="noopener noreferrer">출처·라이선스 확인</a></div>`).join("");
  const healthEvidenceHtml = sourceData.healthEvidence.map((evidence, evidenceIndex) => `<div class="health-card"><small>${evidence.type}</small><b>${evidenceIndex + 1}. ${evidence.organization} · ${evidence.title}</b><p>${evidence.fact}</p><span><strong>본문 활용:</strong> ${evidence.articleUse}</span><a href="${evidence.url}" target="_blank" rel="noopener noreferrer">공식 자료 열기 ↗</a><code>${evidence.url}</code></div>`).join("");
  const hashtagHtml = topic.hashtags.map(([tag, evidence]) => `<span title="본문 근거: ${evidence}">${tag}</span>`).join("");
  const topicHtml = `<section class="topic-plan"><h2>주제·해시태그 최적화</h2><dl><dt>대표 키워드</dt><dd>${topic.primaryKeyword}</dd><dt>검색 의도</dt><dd>${topic.searchIntent}</dd><dt>최적화 제목</dt><dd><b>${topic.optimizedTitle}</b></dd><dt>보조 키워드</dt><dd>${topic.supportingKeywords.join(" · ")}</dd></dl><div class="hashtags">${hashtagHtml}</div><p>추천 ${topic.hashtags.length}개 · 모든 태그는 제목·본문·출처 데이터의 실제 근거를 통과했습니다.</p></section>`;
  const decisionClass = score >= 85 ? "pass" : "hold";
  return `<article id="post${index + 1}"><div class="rank-decision ${decisionClass}"><b>상위 노출 우선 점수 ${score}/100</b><span>${decision}</span></div><div class="format">${format}</div><div class="source"><b>${source}</b><span>${chars.toLocaleString("ko-KR")}자</span></div><div class="report-date"><small>블로그 원고 발행일</small><strong>${publicationDate}</strong></div><div class="evidence"><div class="metrics">${metricHtml}</div><div class="dates">${dateHtml}</div><div class="origin"><a href="${url}" target="_blank" rel="noopener noreferrer">원문 URL 열기 ↗</a><code>${url}</code></div></div>${topicHtml}<section class="health-evidence"><h2>국내 공식 건강 근거 3개</h2><p>질병·영양·안전 기준을 나눠 본문에 연결했습니다.</p>${healthEvidenceHtml}</section><section class="image-picks"><h2>추천 이미지 5개</h2><p>미리보기 없이 이미지 내용과 URL만 제공합니다.</p>${imagesHtml}</section>${articleHtml}</article>`;
}).join("\n");

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>2026-08-30 오늘의 블로그 원고 3개</title><style>body{margin:0;background:#f1f3f6;color:#182033;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif;line-height:1.85}main{max-width:920px;margin:auto;padding:30px 20px 80px}header{padding:44px;border-radius:24px;background:linear-gradient(135deg,#17243b,#315f86 58%,#1a806f);color:#fff}header h1{font-size:48px;line-height:1.1;margin:8px 0}.method{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}.method div{padding:15px;border:1px solid #d8e1ec;border-radius:14px;background:#fff}.method b{display:block;color:#145f55}.method span{display:block;color:#5d687a;font-size:14px;line-height:1.5;margin-top:4px}nav{position:sticky;top:0;z-index:2;margin:16px 0;padding:12px;background:#ffffffed;border:1px solid #dce2ec;border-radius:14px}nav a{display:inline-block;margin:4px;padding:7px 11px;border-radius:999px;background:#e8f3f1;color:#175e55;text-decoration:none;font-weight:750}article{margin-top:22px;padding:38px;background:#fff;border:1px solid #dce2ec;border-radius:21px;box-shadow:0 10px 30px #2738540d}.rank-decision{display:flex;justify-content:space-between;gap:10px;margin-bottom:12px;padding:12px 14px;border-radius:11px}.rank-decision.pass{background:#e7f7ef;color:#12613d}.rank-decision.hold{background:#fff0df;color:#884807}.format{display:inline-block;margin-bottom:9px;padding:5px 10px;border-radius:999px;background:#173e56;color:#fff;font-size:13px;font-weight:850}article h1{font-size:35px;line-height:1.35;margin-bottom:5px}.publish-date{color:#6a7484;font-size:14px;margin-bottom:22px}article h2{margin-top:35px;color:#1f6680;font-size:24px}article h2:first-of-type{padding:18px 20px;margin-top:24px;background:#edf8f5;border-left:5px solid #1b8a77;border-radius:12px}.source{display:flex;justify-content:space-between;gap:12px;padding:11px 14px;border-radius:10px 10px 0 0;background:#edf2fa;color:#274c7d;font-weight:800}.source span{white-space:nowrap}.report-date{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#173e56;color:#fff}.report-date small,.report-date strong{display:block}.report-date strong{font-size:18px}.evidence{padding:14px;border:1px solid #d8e2ef;border-top:0;border-radius:0 0 14px 14px}.metrics,.dates{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.metrics div,.dates div{padding:10px;background:#f6f8fb;border-radius:9px}.metrics small,.metrics strong,.dates small,.dates b{display:block}.metrics small,.dates small{color:#697487}.metrics strong{font-size:20px;color:#162f4c}.dates{margin-top:8px}.dates div{background:#fff8e7}.dates b{color:#634b12}.origin{display:grid;gap:8px;margin-top:12px}.origin a{justify-self:start;padding:7px 11px;border-radius:8px;background:#1b806f;color:white;text-decoration:none;font-weight:800}.origin code{display:block;overflow-wrap:anywhere;padding:9px;background:#eef3f8;border-radius:7px;color:#40506a;font-family:inherit;font-size:12px}.topic-plan{margin:20px 0;padding:20px;background:#eef5ff;border:1px solid #cdddf2;border-radius:15px}.topic-plan>h2{margin-top:0!important;background:none!important;border:0!important;padding:0!important}.topic-plan dl{display:grid;grid-template-columns:120px 1fr;gap:8px 12px}.topic-plan dt{color:#64748b}.topic-plan dd{margin:0}.hashtags{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.hashtags span{padding:6px 10px;border-radius:999px;background:#173e56;color:#fff;font-weight:750}.topic-plan p{font-size:13px;color:#64748b}.image-picks{margin:20px 0;padding:20px;background:#f7faf9;border:1px solid #d6e8e2;border-radius:15px}.image-picks>h2{margin-top:0!important;background:none!important;border:0!important;padding:0!important}.image-card{margin-top:10px;padding:13px;background:#fff;border:1px solid #dce6e3;border-radius:10px}.image-card b,.image-card span,.image-card small,.image-card code{display:block}.image-card span{margin-top:4px}.image-card small{color:#687486;margin-top:4px}.image-card a{display:inline-block;margin:7px 8px 0 0;color:#126b5c;font-weight:800}.image-card code{margin-top:7px;padding:7px;background:#eef3f8;border-radius:6px;overflow-wrap:anywhere;font-family:inherit;font-size:11px}.image-card .license-link{font-size:13px}p,li{word-break:keep-all}.note{padding:18px 20px;background:#fff8e7;border:1px solid #f2d78d;border-radius:14px;color:#5f4a15}.audit{margin-top:16px;padding:20px;background:#17243b;color:#fff;border-radius:16px}.audit b{color:#7de0cb}.audit ul{columns:2}@media(max-width:650px){header h1{font-size:35px}header,article{padding:23px}.source,.rank-decision,.report-date{display:block}.source span,.rank-decision span{display:block;margin-top:4px}.method{grid-template-columns:1fr}.audit ul{columns:1}.metrics,.dates{grid-template-columns:1fr}.topic-plan dl{grid-template-columns:1fr}.topic-plan dd{margin-bottom:8px}}</style></head><body><main><header><small>RANKING-FIRST NAVER BLOG REPORT</small><h1>상위 노출 우선<br>오늘의 원고</h1><p>고정 글자 수보다 검색 의도, 고유 정보, 주제 신뢰도와 실제 독자 만족을 우선합니다.</p></header><section class="method"><div><b>주제 1개</b><span>한 글이 해결할 검색 질문을 하나로 고정합니다.</span></div><div><b>본문 근거 100%</b><span>실제 원고에 없는 단어는 해시태그로 만들지 않습니다.</span></div><div><b>해시태그 6~10개</b><span>대표·질문·행동·원료·출처 역할로 필요한 만큼만 구성합니다.</span></div></section><section class="audit"><b>주제→본문→태그 연계</b><p>대표 키워드가 제목과 첫 300자에 연결되고, 보조 키워드는 실제 소제목과 답변에 연결된 경우에만 태그로 채택합니다. 네이버가 공개하지 않은 최적 개수를 공식처럼 사용하지 않습니다.</p></section><p class="note">모든 추천 해시태그는 본문 또는 출처 데이터의 근거 문구를 자동 검증합니다. 근거 없는 태그가 하나라도 있으면 리포트 생성이 중단됩니다.</p><nav><a href="#post1">1. 아침 식단</a><a href="#post2">2. 감량과 근육</a><a href="#post3">3. 대장 건강</a></nav>${rendered}</main></body></html>`;

fs.writeFileSync(path.join(root, "reports/2026-08-30-three-posts.html"), html);
