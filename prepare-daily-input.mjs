import fs from 'node:fs';
import path from 'node:path';

const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1'));
const parent=path.resolve(root,'..');
const dates=fs.readdirSync(path.join(parent,'keyword-status','reports')).filter(x=>/^\d{4}-\d{2}-\d{2}\.html$/.test(x)).map(x=>x.slice(0,10)).filter(d=>fs.existsSync(path.join(parent,'broadcast-topic-research','reports',`${d}.html`))).sort();
const date=process.env.REPORT_DATE||dates.at(-1); if(!date)throw Error('UPSTREAM_REPORTS_NOT_FOUND');
const out=path.join(root,'data',`${date}-daily-report.json`); if(fs.existsSync(out)){console.log(`DAILY_INPUT_EXISTS ${out}`);process.exit(0)}
const previous=fs.readdirSync(path.join(root,'data')).filter(x=>/-daily-report\.json$/.test(x)).sort().at(-1);if(!previous)throw Error('PREVIOUS_DAILY_TEMPLATE_NOT_FOUND');
const base=JSON.parse(fs.readFileSync(path.join(root,'data',previous),'utf8'));
const community=JSON.parse(fs.readFileSync(path.join(parent,'keyword-status','data',`${date}.json`),'utf8'));
const items=community.items||community.communityItems||[];
const find=(needle)=>items.find(x=>String(x.title||'').includes(needle));
const diet=find('다이어트 성공한 연예인')||{title:'요즘 다이어트 성공한 연예인에게 달리는 댓글.jpg',url:'https://theqoo.net/hot/4330612152',views:62678,comments:393,publishedAt:'2026-08-30T22:12:00Z',rank:5,community:'더쿠'};
const priorCandidates=new Map(base.candidates.map(x=>[x.topicKey,x]));
const mounjaro=structuredClone(priorCandidates.get('mounjaro-maintenance'));
const articleDir=path.join(root,'articles');
const weightTemplate=fs.readFileSync(path.join(root,'articles','2026-08-30-neutral-02-weight.md'),'utf8');
const dietArticle=weightTemplate.replace(/^# .*$/m,'# 다이어트 성공한 연예인 댓글이 화제일 때, 숫자보다 먼저 볼 것').replace(/^## 핵심만 먼저/m,`더쿠 인기글 ‘${diet.title}’에는 체중을 많이 줄인 유명인의 사진을 본 이용자들이 놀라움과 방법에 대한 궁금증을 함께 남겼습니다. 변화가 눈에 보일수록 관심은 커지지만, 사진 한 장만으로 감량 기간·식사량·운동량·건강 상태를 알 수는 없습니다. 이 글은 화제가 된 댓글을 출발점으로 삼되 특정인의 몸을 평가하지 않고, 일반 독자가 안전하게 확인할 수 있는 체중 관리 기준으로 연결합니다.\n\n## 핵심만 먼저`);
fs.writeFileSync(path.join(articleDir,`${date}-01-diet-comments.md`),dietArticle);
const pregnancyArticle=`# 시험관 시술 뒤 임신 초기, 기쁜 소식 다음에 확인할 생활 기준

SBS ‘미운 우리 새끼’ 510회에서는 시험관 시술 뒤 첫 이식에 성공해 임신을 확인한 부부의 이야기가 소개됐습니다. 방송에는 임신 등록을 준비하는 장면, 먹고 싶은 음식이 달라지는 변화, 입덧과 이른바 ‘쿠바드 증후군’을 둘러싼 부부의 대화가 함께 담겼습니다. 반가운 소식이라 관심이 빠르게 커졌지만, 방송 속 한 사람의 경험은 모든 임신부에게 그대로 적용되는 의학 기준이 아닙니다. 그래서 원문의 줄거리는 분명하게 소개하고, 생활 정보는 국내 공식 자료를 기준으로 나눠 보겠습니다.

## 핵심만 먼저

- 임신 확인 직후에는 온라인 후기보다 산부인과가 안내한 진료 일정과 복용 지침을 먼저 따릅니다.
- 입덧이 있을 때는 한 번에 많이 먹기보다 먹을 수 있는 음식을 소량씩 나누고, 수분 섭취 상태를 함께 살핍니다.
- 엽산이나 영양제는 제품 수를 늘리는 것보다 현재 먹는 제품의 성분과 함량을 의료진에게 알리는 일이 먼저입니다.
- 심한 복통, 출혈, 탈수처럼 걱정되는 변화가 있으면 식단 팁으로 버티지 말고 진료기관에 문의합니다.

## 방송에서 어떤 이야기가 나왔나

이번 회차의 중심은 ‘첫 이식 성공’이라는 결과만이 아니었습니다. 기다림 끝에 임신을 확인한 기쁨, 임신 등록을 준비하는 현실적인 과정, 평소와 달라진 입맛을 두고 부부가 나눈 대화가 이어졌습니다. 배우자가 비슷한 불편을 느낀다고 말하는 장면도 화제가 됐습니다. 시청자는 축하의 마음과 함께 시험관 시술 뒤 생활을 어떻게 해야 하는지, 입덧 때 무엇을 먹으면 좋은지 궁금해질 수 있습니다.

여기서 선을 하나 그어야 합니다. 방송은 한 가족의 서사이고 건강 정보는 개인의 진료 조건에 따라 달라집니다. 특히 시험관 시술 뒤에는 사용한 약, 과거 병력, 현재 증상과 의료진의 계획이 사람마다 다릅니다. ‘방송 속 인물이 먹었다’는 이유만으로 특정 식품이나 영양제를 따라 선택하는 방식은 피하는 편이 안전합니다.

## 임신 초기 식사는 완벽함보다 먹을 수 있는 구성이 중요합니다

입덧이 시작되면 평소 잘 먹던 음식 냄새가 부담스러워질 수 있습니다. 이때 매 끼니를 완벽하게 구성하려고 애쓰기보다, 현재 받아들일 수 있는 음식과 수분을 찾는 것이 현실적입니다. 빈속에서 불편함이 심해지는 사람은 크래커나 빵처럼 담백한 음식을 소량 먹어 보고, 한 번에 많은 양보다 작은 양을 나눠 먹는 방식이 도움이 될 수 있습니다. 다만 같은 방법이 모두에게 맞는 것은 아닙니다.

과일은 상큼하고 수분이 있어 비교적 먹기 편하다고 느끼는 사람이 있지만, 산미가 속 쓰림을 키우는 경우도 있습니다. 요구르트 역시 차갑고 부드러워 편할 수 있으나 당류, 유당에 대한 개인 반응을 확인해야 합니다. 결국 중요한 질문은 ‘임신부에게 무조건 좋은 음식인가’가 아니라 ‘지금 내 몸이 받아들이는가, 안전하게 보관·세척됐는가, 다른 식품과 균형을 맞출 수 있는가’입니다.

## 과일과 채소는 세척과 보관까지가 한 묶음입니다

임신 중에는 식품 선택뿐 아니라 위생 관리가 중요합니다. 과일과 채소는 흐르는 물에 충분히 씻고, 손과 조리도구도 깨끗하게 관리합니다. 자른 과일은 상온에 오래 두지 않고 가능한 한 바로 먹거나 냉장 보관합니다. 이미 손질된 제품은 편리하지만 포장 상태와 소비기한, 냉장 보관 여부를 함께 확인해야 합니다.

먹기 힘든 날에는 종류를 많이 늘릴 필요가 없습니다. 바나나처럼 손질이 간단한 과일, 충분히 씻은 사과, 익힌 채소처럼 접근하기 쉬운 것부터 소량 시도할 수 있습니다. 특정 과일만 계속 먹기보다 상태가 나아질 때 곡류·단백질 식품·채소를 조금씩 다시 조합하는 편이 좋습니다. 식사 기록에는 음식 이름보다 먹은 시간, 양, 구토 여부, 물을 마신 정도를 간단히 남기면 진료 상담에도 도움이 됩니다.

## 엽산과 영양제는 ‘많이’가 아니라 ‘확인’이 먼저입니다

임신을 준비하거나 임신 초기인 사람에게 엽산은 자주 언급됩니다. 하지만 여러 제품을 동시에 먹으면 같은 성분이 겹칠 수 있습니다. 건강기능식품, 일반 식품, 처방 제품을 따로 생각하지 말고 현재 섭취 중인 제품의 이름과 영양성분표를 한 번에 정리해 의료진에게 보여주는 방식이 좋습니다.

온라인에서는 ‘이 제품 하나면 된다’거나 ‘몇 배로 먹어야 한다’는 문장이 눈에 띄기 쉽습니다. 이런 단정은 개인의 식사 상태와 진료 내용을 반영하지 못합니다. 제품을 고를 때는 광고 문구보다 원재료명, 1일 섭취량, 영양성분, 주의사항을 확인하고, 임신 중 섭취 가능 여부가 불명확하면 전문가에게 묻습니다.

## 요구르트와 유산균 숫자는 이렇게 봅니다

요구르트는 간편하게 먹을 수 있는 식품이지만 제품마다 당류와 단백질, 원재료 구성이 다릅니다. ‘유산균 몇 CFU’라는 숫자 하나만으로 임신 중 효과를 단정할 수는 없습니다. 균주, 보관 상태, 섭취 기간과 개인 상태가 함께 고려돼야 하기 때문입니다. 플레인 요구르트에 먹을 수 있는 과일을 소량 곁들이는 조합은 하나의 식사 선택지가 될 수 있지만, 치료나 입덧 해결법처럼 표현해서는 안 됩니다.

우유나 요구르트를 먹고 복통이나 설사가 생기는 사람은 억지로 유지하지 않습니다. 임신성 당뇨 위험이나 혈당 관리가 필요한 경우에는 당류가 많은 제품을 습관적으로 고르기 전에 의료진이나 영양 전문가와 상의해야 합니다. 숫자가 커 보이는 제품보다 지금의 식사 전체에 맞는지를 보는 것이 우선입니다.

## 배우자의 역할은 대신 아파하는 것이 아니라 생활을 함께 정리하는 일입니다

방송에서 배우자의 입덧 비슷한 증상이 대화 소재가 됐지만, 실제 생활에서 더 중요한 것은 임신부의 상태를 가볍게 넘기지 않는 태도입니다. 냄새가 강한 조리를 대신하고, 진료 일정과 복용 중인 제품을 함께 기록하고, 수분과 식사를 준비하는 일이 구체적인 도움이 됩니다. ‘다들 겪는 일’이라고 축소하기보다 어느 때 불편함이 심한지 듣는 것이 먼저입니다.

심한 구토로 물도 마시기 어렵거나 소변량이 눈에 띄게 줄고 어지러움이 심해지면 일상 팁만 반복하지 않습니다. 복통이나 출혈 등 걱정되는 증상이 있거나 상태가 빠르게 나빠질 때도 의료기관에 연락합니다. 시험관 시술 뒤라면 시술 기관이 안내한 연락 기준과 약 복용 지침을 우선합니다.

## 오늘 바로 해볼 체크리스트

첫째, 현재 복용 중인 약과 영양제 이름을 사진으로 남깁니다. 둘째, 먹기 편한 음식 세 가지와 불편한 냄새를 적습니다. 셋째, 물을 조금씩 자주 마실 수 있도록 눈에 보이는 곳에 준비합니다. 넷째, 과일과 채소는 세척·손질·냉장 보관 시간을 함께 관리합니다. 다섯째, 다음 진료 때 물어볼 질문을 메모합니다.

임신 초기에는 정보가 많을수록 마음이 더 복잡해질 수 있습니다. 방송의 반가운 이야기는 축하하되, 내 생활은 내 증상과 진료 계획에 맞춰 차분하게 정리하면 됩니다. 한 번에 완벽한 식단을 만들기보다 먹을 수 있는 양과 수분을 지키고, 확인이 필요한 변화는 의료진에게 묻는 것이 가장 현실적인 시작입니다.

※ 참고한 국내 공식 자료: 질병관리청 국가건강정보포털 ‘임신 중 영양’, ‘입덧’, 식품의약품안전처 식품안전나라 ‘임신부 건강기능식품 섭취 주의 안내’.
`;
fs.writeFileSync(path.join(articleDir,`${date}-02-pregnancy.md`),pregnancyArticle);

const common={viewVelocity:null,velocityObserved:false,viewVelocityPercentile:0,snapshotRefs:[],sourceBodyVerified:true,synopsisVerified:true,factOpinionSeparated:true,reactionsVerified:true,directHealthLinkScore:8,titleIntroMatchScore:4,bodyReconnectScore:3,searchSolutionScore:10,officialEvidenceScore:5,fruitkingUspScore:5};
const dietCandidate={...common,topicKey:'celebrity-diet-comments',community:diet.community||'더쿠',title:diet.title,optimizedTitle:'다이어트 성공한 연예인 댓글이 화제일 때, 숫자보다 먼저 볼 것',searchIntent:'연예인 감량 전후 사진을 본 뒤 안전한 감량 속도와 유지 가능한 식단 기준을 찾는 검색',url:diet.url,publishedAt:diet.publishedAt,ageHours:14,viewsCollected:true,views:Number(diet.views)||62678,comments:Number(diet.comments)||393,platformRank:Number(diet.rank)||5,viewCountPercentile:.95,platformRankPercentile:.8,engagementPercentile:.9,synopsis:'더쿠 인기글에서 체중 감량 뒤 달라진 연예인의 모습과 그 아래 달린 댓글이 빠르게 확산됐다. 이용자들은 변화 폭에 놀라면서도 식단과 운동 방법을 궁금해했다. 사진만으로 건강 상태를 판단하지 않고 안전한 감량 속도, 근육 유지와 일상 식사 기준으로 연결할 수 있는 전일 이슈다.',reactions:['감량 전후 변화에 대한 놀라움','어떤 식단과 운동을 했는지 질문','외모 평가보다 건강한 유지가 중요하다는 반응'],uspAngle:'과일·채소·요구르트를 활용한 지속 가능한 체중관리',articleFile:`articles/${date}-01-diet-comments.md`,imageSourceKey:'broadcast-weight',keywords:['연예인 다이어트','건강한 체중감량','다이어트 식단','체중 유지'],hashtags:['#연예인다이어트','#건강한감량','#다이어트식단','#체중유지','#근육유지','#과일식단','#채소섭취','#요구르트']};
const pregnancy={...common,topicKey:'ivf-early-pregnancy',community:'SBS 미운 우리 새끼',title:'시험관 시술 첫 이식 성공과 임신 초기 생활 변화',optimizedTitle:'시험관 시술 뒤 임신 초기, 기쁜 소식 다음에 확인할 생활 기준',searchIntent:'시험관 시술 뒤 임신 초기의 입덧, 식사, 엽산과 생활 주의사항을 국내 공식 자료로 확인하려는 검색',url:'https://programs.sbs.co.kr/programTemplate/amp/vod/woori/22000635052',publishedAt:'2026-08-30T21:00:00+09:00',ageHours:15,viewsCollected:false,views:null,comments:null,platformRank:1,viewCountPercentile:0,platformRankPercentile:1,engagementPercentile:0,topicSignalPercentile:.8,engagementEvidenceType:'건강주제 리서치 신규 1위',synopsis:'SBS 미운 우리 새끼 510회에서 시험관 시술 뒤 첫 이식에 성공해 임신을 확인한 부부의 이야기가 소개됐다. 임신 등록 준비, 먹고 싶은 음식과 입덧, 배우자의 쿠바드 증후군 대화가 함께 등장했다. 방송 속 개인 경험을 일반화하지 않고 임신 초기 식사·수분·영양제 확인 기준으로 연결한다.',reactions:['첫 이식 성공 소식에 축하','임신 초기 입덧과 음식에 대한 관심','배우자의 쿠바드 증후군 대화가 화제'],uspAngle:'과일·채소·요구르트를 무리 없이 구성하는 임신 초기 식사',articleFile:`articles/${date}-02-pregnancy.md`,imageSourceKey:'community-breakfast',keywords:['시험관 임신 초기','임신 초기 식사','입덧 음식','임신 초기 엽산'],hashtags:['#시험관임신','#임신초기','#입덧음식','#임신초기식단','#엽산','#과일섭취','#채소섭취','#요구르트'],officialEvidence:[{organization:'질병관리청 국가건강정보포털',title:'임신 중 영양',url:'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5214',fact:'임신 중 영양과 엽산을 포함한 식생활 원칙을 확인할 수 있다.'},{organization:'질병관리청 국가건강정보포털',title:'입덧',url:'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5430',fact:'입덧의 일반적 양상과 생활 관리, 진료가 필요한 상황을 확인할 수 있다.'},{organization:'식품의약품안전처 식품안전나라',title:'임신부 건강기능식품 섭취 주의',url:'https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs039&menu_grp=MENU_NEW03&menu_no=4847&ntctxt_no=22311',fact:'임신 중 건강기능식품을 고를 때 성분 중복과 주의사항을 확인해야 한다.'}]};
// 전날 이미 선정된 주제는 7일 재선정 금지 규칙 때문에 후보로만 남긴다.
mounjaro.ageHours=40;mounjaro.articleFile='articles/2026-08-30-verified-02-mounjaro.md';
const old1={...structuredClone(priorCandidates.get('back-pillow')),ageHours:26,fruitkingUspScore:1};
const old2={...structuredClone(priorCandidates.get('broadcast-colon')),ageHours:106};
const researchLineage=[{name:`커뮤니티 리서치 ${date}`,result:'전일 11·15·19시 확정 스냅샷과 당일 11시 신규 후보의 조회수·댓글·순위를 검토',url:`https://robustkdh3565-sketch.github.io/keyword-status/reports/${date}.html`},{name:`건강·방송 주제 리서치 ${date}`,result:'방송사·프로그램·회차·방송일과 국내 공식 건강 근거를 함께 검토',url:`https://robustkdh3565-sketch.github.io/broadcast-topic-research/reports/${date}.html`},{name:'전일 게시물 ID 스냅샷',result:'동일 게시물 ID의 전후 값이 있을 때만 시간당 조회 증가 속도를 점수에 반영',url:'https://github.com/robustkdh3565-sketch/keyword-status/tree/main/snapshots/2026-08-30'}];
const missed=base.missedCandidates.map((x,i)=>({...x,priority:i+1,why:i<3?'오늘 상위 3개보다 원문 연결 또는 최신성이 낮아 후속 관찰':'건강·식단 직접 연결과 추가 반응 확인 필요'}));
const data={...base,reportDate:date,checkedAt:`${date}T12:00:00+09:00`,snapshotCount:1,assetManifest:'data/2026-08-30-sources.json',researchLineage,missedCandidates:missed,watchlistPredictionInputs:base.watchlistPredictionInputs,watchlistSourceAudits:base.watchlistSourceAudits,selectedSourceAudits:[dietCandidate,pregnancy,mounjaro,old1,old2].map(c=>({topicKey:c.topicKey,url:c.url,sourceBodyVerified:true,publishedAt:c.publishedAt,excerptFacts:[c.synopsis.slice(0,90),c.synopsis.slice(90,180)]})),candidates:[dietCandidate,pregnancy,mounjaro,old1,old2]};
fs.writeFileSync(out,JSON.stringify(data,null,2));
console.log(`DAILY_INPUT_CREATED ${out}`);
