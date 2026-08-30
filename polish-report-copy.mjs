import fs from'node:fs';import path from'node:path';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),dir=path.join(root,'reports');
const latest=fs.readdirSync(dir).filter(x=>/^\d{4}-\d{2}-\d{2}-issue-first\.html$/.test(x)).sort().at(-1);if(!latest)throw Error('REPORT_TO_POLISH_NOT_FOUND');
const file=path.join(dir,latest);let html=fs.readFileSync(file,'utf8');
const replacements=[
  [/프룻킹 데일리 블로그/g,'오늘의 건강 이슈와 블로그 원고'],
  ['FRUITKING DAILY EDITORIAL','오늘의 건강 이슈'],
  ['전일 이슈를<br>읽을 만한 건강 글로','사람들이 많이 본 이야기,<br>오늘 읽을 건강 글'],
  ['커뮤니티와 건강·방송 리서치를 함께 검토하고, 원문 사실·조회 근거·검색 의도·공식 자료·프룻킹 USP가 이어지는 후보만 자동 선정했습니다.','커뮤니티와 방송에서 반응이 컸던 이야기 중, 원문과 조회 흐름을 확인하고 건강 정보로 자연스럽게 풀 수 있는 주제를 골랐습니다.'],
  [/SELECTED (\d)/g,'오늘 원고 $1'],
  ['원문 줄거리','화제가 된 내용'],
  ['원문 URL ↗','화제가 된 원문 ↗'],
  ['확인 속도 /20','조회 증가 /20'],
  ['조회·순위 /15','조회와 순위 /15'],
  ['원문 검증 /20','원문 확인 /20'],
  ['직접 연결 /15','주제 연결 /15'],
  ['검색·근거·USP /20','검색·자료·브랜드 /20'],
  ['국내 공식 근거 3개','참고한 국내 공식 자료'],
  ['이 주제만을 위한 추천 이미지 5개','글에 넣을 이미지 5장'],
  ['검토 후 제외','이번 발행에서 제외한 주제'],
  ['후보·URL','후보와 원문'],
  ['제외 이유','이번에 고르지 않은 이유']
];
for(const[from,to]of replacements)html=html.replaceAll(from,to);fs.writeFileSync(file,html);console.log(`polished copy: ${latest}`);
