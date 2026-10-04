'use strict';
// ───────── 떠는 까닭 (10/4 선생님) ─────────
// 연구원이 겁에 질리기 시작하는 순간, 읽던 책에서 무엇을 보았는지 한 줄이 남음.
// (설정의 정답 = 진실이 눈으로 들어오면 간이 먼저 겁을 냄. 여기선 '본 것'만 보여 줌 — 광기 설계.md)
// 상태 창에 "떠는 까닭"으로 보이고, 문갑 셋째 서랍 '떨던 까닭 — 일지 뒷장'에 모임.
const WHY = {
  first: [
    '방금 읽은 장에 어제 없던 줄이 하나 있었다고 한다.',
    '족보의 끊긴 대 아래 빈칸에 먹이 번져 있었다고 한다. 이름을 쓰다 만 것 같았다고.',
    '장부의 셈이 읽을 때마다 하나씩 늘어 있었다고 한다.',
    '"물가에서"라는 말이 넘기는 장마다 나왔다고 한다.',
    '글자가 읽는 쪽을 보고 있는 것 같았다고 한다. 눈을 들 수가 없었다고.',
    '읽던 줄을 손가락으로 짚었더니, 다음 줄이 먼저 젖어 있었다고 한다.',
  ],
  dongui: [
    '간을 다룬 장의 붉은 덧글이 자기 손 글씨와 닮았다고 한다.',
    '"눈으로 구멍이 열린다"는 줄을 읽은 뒤로 눈이 시리다고 한다.',
    '약재 이름 사이에 바다 것들의 이름이 섞여 있었다고 한다.',
  ],
  map: [
    '지도의 바닷가 굴 자리가 볼 때마다 조금씩 가까워진다고 한다.',
    '지도 가장자리에 이 서고의 대문이 그려져 있었다고 한다. 그런 그림은 없었는데.',
    '접힌 자리를 펴니 물 냄새가 났다고 한다.',
  ],
};
const WHY_ON = 0.35, WHY_OFF = 0.2;            // 땀이 맺히기 시작할 때 생기고, 가라앉으면 지워짐
function pickWhy(item){
  const pool = WHY[item] || WHY.first, seen = S.whySeen = S.whySeen || {};
  const used = seen[item] = seen[item] || [];
  let i = pool.findIndex((_, j) => !used.includes(j));
  if (i < 0){ used.length = 0; i = 0; }          // 다 나오면 처음부터 다시
  used.push(i); return pool[i];
}
function noteWhy(name, line){
  S.whyLog = (S.whyLog || []).concat([[name, line]]).slice(-30);
}
function whyTick(){
  let changed = false;
  // 한서진
  const rf = S.rFear || 0;
  if (S.rArrived && rf > WHY_ON && !S.rWhy){ S.rWhy = pickWhy(itemAt('rdesk') || 'first'); noteWhy('한서진', S.rWhy); changed = true; }
  else if (S.rWhy && rf < WHY_OFF){ S.rWhy = null; changed = true; }
  // 별채 사람들
  for (const k of allKeys()){ const s = S.st[k]; if (!s || !s.arr) continue;
    const f = s.fear || 0;
    if (f > WHY_ON && !s.why && working(k)){ s.why = pickWhy(s.item || 'first'); noteWhy(DEF(k).name, s.why); changed = true; }
    else if (s.why && f < WHY_OFF){ s.why = null; changed = true; }
  }
  if (changed) save();
}
// 상태 창에 붙는 한 줄
function whyHtml(k){
  const w = k === 'sj' ? S.rWhy : (S.st[k] && S.st[k].why);
  return w ? `<div style="font-size:13px;opacity:.8;margin:2px 0 4px">떠는 까닭: ${w}</div>` : '<br>';
}
// 문갑 셋째 서랍: 누가 적었는지 모르는 일지 뒷장(쓰는 자의 손 — 정본 설정집)
function whyRecs(recs){
  const L = S.whyLog || []; if (!L.length) return;
  recs.push(['떨던 까닭 — 일지 뒷장', () => '<h3>떨던 까닭</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">일지 뒷장에 적혀 있다. 사람들이 떨기 시작할 때 무엇을 보았다고 했는지.<br>누가 적었는지는 모른다. 한서진의 글씨는 아니다.</div>'
    + L.map(([n, l]) => `<div style="margin:6px 0"><b>${n}</b> — ${l}</div>`).join('')]);
}
