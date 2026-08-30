import fs from 'node:fs';
import path from 'node:path';

const clusters = [
  {keyword:'체중 감량과 유지',terms:['체중','감량','다이어트','비만','마운자로','위고비']},
  {keyword:'근육과 노년 건강',terms:['근육','골절','골다공증','낙상']},
  {keyword:'당류와 저당 식습관',terms:['당류','설탕','저당','첨가당']},
  {keyword:'장 건강과 검사',terms:['대장','혈변','대장내시경','장 건강','식이섬유']},
  {keyword:'뇌 건강과 가족 간병',terms:['치매','뇌경색','간병','뇌 건강']},
  {keyword:'통증과 위험 신호',terms:['통증','저림','목디스크','경추척수증','허리']},
  {keyword:'아침식사와 간편 식단',terms:['아침식사','아침 식사','간편 식단','식단']},
  {keyword:'생활 루틴과 자기관리',terms:['생활 루틴','생활 패턴','자기관리','수면','좌식']},
  {keyword:'과일·채소 섭취',terms:['과일','채소','건강 간식']},
  {keyword:'요구르트와 유산균',terms:['요구르트','요거트','유산균','프로바이오틱스']}
];
const themes = [
  {core:'체중 감량과 유지',adjacent:['근육 유지','단백질 식사','식사 기록'],title:'감량 숫자보다 오래 유지되는 식사 루틴',bridge:'감량 이슈를 중단 후 유지 행동으로 확장'},
  {core:'당류와 저당 식습관',adjacent:['첨가당','과일의 당','영양표시'],title:'당을 무조건 끊기 전에 첨가당부터 확인하는 법',bridge:'당류 불안을 실제 식품 선택 질문으로 전환'},
  {core:'장 건강과 검사',adjacent:['식이섬유','수분 섭취','검사 시점'],title:'장 건강 식단과 병원 검사를 구분해야 하는 순간',bridge:'생활 식단과 의료적 위험 신호를 분리'},
  {core:'아침식사와 간편 식단',adjacent:['포만감','요구르트','과일'],title:'바쁜 아침에도 오래 든든한 5분 식사 조합',bridge:'가격·편의 이슈를 현실적인 영양 구성으로 확장'},
  {core:'생활 루틴과 자기관리',adjacent:['식사 시간','수면','오래 앉기'],title:'하루를 무너뜨리는 생활 패턴부터 바꾸는 작은 습관',bridge:'공감형 생활 이슈를 실행 가능한 루틴으로 전환'},
  {core:'근육과 노년 건강',adjacent:['낙상 예방','단백질','체중 감량'],title:'중년 이후 살만 빼면 안 되는 이유',bridge:'감량과 노년 근육·뼈 관리를 연결'},
  {core:'뇌 건강과 가족 간병',adjacent:['초기 행동 변화','식사 루틴','검사 시점'],title:'치매보다 먼저 가족이 확인해야 할 생활 변화',bridge:'인물 방송을 가족의 관찰·진료 질문으로 확장'},
  {core:'통증과 위험 신호',adjacent:['저림','일상 동작 변화','진료 시점'],title:'온라인 통증 팁을 따라 하기 전에 볼 위험 신호',bridge:'즉시 실천 팁을 안전 확인 콘텐츠로 확장'}
];
const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&middot;|&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const dateRange = (end, days=7) => Array.from({length:days},(_,i)=>{const d=new Date(`${end}T00:00:00Z`);d.setUTCDate(d.getUTCDate()-i);return d.toISOString().slice(0,10)}).reverse();
const esc = (s) => String(s??'').replace(/[&<>"']/g,(x)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));

export function buildWeeklyInsights(reportDate, root) {
  const dates=dateRange(reportDate),docs=[];
  for(const date of dates){
    const communityFile=path.resolve(root,'..','keyword-status','data',`${date}.json`);
    if(fs.existsSync(communityFile)){const data=JSON.parse(fs.readFileSync(communityFile,'utf8'));for(const item of data.items||[])docs.push({date,sourceType:'커뮤니티',source:item.community||item.source||'커뮤니티',text:`${item.topic||''} ${item.normalizedTitle||''} ${item.title||''}`,url:item.url});}
    const healthFile=path.resolve(root,'..','broadcast-topic-research','reports',`${date}.html`);
    if(fs.existsSync(healthFile)){const html=fs.readFileSync(healthFile,'utf8'),topicBlock=(html.match(/이번 주 핵심 건강 주제 4<\/h2>([\s\S]*?)<\/section>/)||[])[1]||html;docs.push({date,sourceType:'건강주제',source:'방송 기반 건강 주제 리서치',text:strip(topicBlock),url:`https://robustkdh3565-sketch.github.io/broadcast-topic-research/reports/${date}.html`});}
  }
  const availableDays=[...new Set(docs.map(d=>d.date))],keywords=clusters.map(cluster=>{const hits=docs.filter(doc=>cluster.terms.some(term=>doc.text.toLowerCase().includes(term.toLowerCase()))),days=[...new Set(hits.map(x=>x.date))],sources=[...new Set(hits.map(x=>`${x.sourceType}:${x.source}`))],urls=[...new Set(hits.map(x=>x.url).filter(Boolean))].slice(0,3),score=Math.round(25*days.length/Math.max(1,availableDays.length)+20*Math.min(1,sources.length/3)+20*Math.min(1,hits.length/5)+20*Math.min(1,hits.filter(x=>x.date>=dates.at(-2)).length/3)+15*Math.min(1,cluster.terms.length/5));return{...cluster,hits:hits.length,days:days.length,sources:sources.length,urls,score}}).filter(x=>x.hits).sort((a,b)=>b.score-a.score||b.hits-a.hits).slice(0,10);
  const phase=availableDays.length>=7?'정식 최근 7일':availableDays.length>=3?'임시 누적':'관찰 중';
  const selectedThemes=themes.filter(theme=>keywords.some(k=>k.keyword===theme.core)).slice(0,5);
  return{reportDate,availableDays:availableDays.length,phase,keywords,themes:selectedThemes};
}

export function renderWeeklyInsights(insights){
  const notice=insights.availableDays<7?`최근 7일 누적 준비 중 · 현재 ${insights.availableDays}/7일 · ${insights.availableDays<3?'순위를 확정하지 않고 관찰 키워드만 제공합니다.':'임시 주요 키워드이며 7일차부터 정식 순위가 됩니다.'}`:'최근 7일 이동 구간을 기준으로 매일 갱신합니다.';
  const keywordCards=insights.keywords.map((k,i)=>`<article><i>${insights.availableDays>=3?String(i+1).padStart(2,'0'):'관찰'}</i><div><h3>${esc(k.keyword)}</h3><p>${k.days}일 등장 · ${k.sources}개 출처 · 근거 ${k.hits}건${insights.availableDays>=3?` · 누적 ${k.score}점`:''}</p><div>${k.urls.map((u,j)=>`<a href="${esc(u)}">근거 ${j+1} ↗</a>`).join(' ')||'<span>원문 URL 미수집</span>'}</div></div></article>`).join('');
  const themeCards=insights.themes.map(t=>`<article><span>${esc(t.core)}</span><h3>${esc(t.title)}</h3><p>${esc(t.bridge)}</p><div>${t.adjacent.map(x=>`<b>${esc(x)}</b>`).join('')}</div><small>현재 단계: ${insights.availableDays>=7?'확정 추천':'관찰 후보'}</small></article>`).join('');
  return`<section class="box weekly"><div class="section-head"><div><small>최근 7일 누적 분석</small><h2>주요 키워드와 확장 테마</h2></div><p>커뮤니티 리서치와 건강주제 리서치의 완성된 리포트만 다시 분석합니다. 별도 재수집이나 미수집값 추정은 하지 않습니다.</p></div><p class="weekly-notice">${esc(notice)}</p><h3 class="weekly-title">${insights.availableDays>=7?'주요 키워드 TOP 10':insights.availableDays>=3?'임시 주요 키워드':'관찰 키워드'}</h3><div class="weekly-keywords">${keywordCards||'<p>현재 확인된 키워드가 없습니다.</p>'}</div><h3 class="weekly-title">인접 주제 기반 키워드 확장</h3><div class="weekly-themes">${themeCards||'<p>현재 확장 가능한 테마가 없습니다.</p>'}</div></section>`;
}
