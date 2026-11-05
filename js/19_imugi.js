'use strict';
// ───────── 신 3호 '이무기'의 흔적 첫 조각 (기획서 11-3 '흔적일 때: 서고 구석의 아주 긴 허물 한 조각 / 오래 비웠다 돌아오면 바닥에 무언가 기어간 자국', ✳ 11/4) ─────────
// 흔적끼리 작은 조합(기획서 6절 '중반 — 흔적끼리 작은 조합', ✳ 11/4): 돌+자국 → 바다 궤 앞에서 맴돎 · 돌+숯 → 숯 눈이 바다 궤 쪽(19_kitchen) · 허물+숯 → 허물에 재 · 셋 다 → 바다 궤 바닥에 비늘(19_deep)
// 보는 눈이 없을 때만 움직이는 것. 오래(K.crawlAwayMs) 비웠다 들어오면 그날 하루 서고 바닥에 기어간 자국 · 세 번째부터는 구석에 허물 한 조각이 남음. 이름은 아직 밝히지 않음.
if (S.stage === 'room' && S.lastSeen && Date.now() - S.lastSeen > K.crawlAwayMs){ S.crawlDay = dayKey(); S.crawlN = (S.crawlN || 0) + 1; }
M.crawl = model(22, 7, 1, (x, y) => Math.abs(y - (3 + 2.4 * Math.sin(x / 3.2))) < 0.8 && hash(x, y + 11) < 0.8 ? '#8a7a60' : null);
M.shed = model(12, 3, 1, (x, y) => y === 1 || (y !== 1 && (x + y) % 2) ? (hash(x, y) < 0.5 ? '#cfc6a8' : '#b8ae90') : null);
OBJ.push({ id:'crawl', x:-6, y:16, rot:0.2, m:() => 'crawl', show:() => S.crawlDay === dayKey(), alpha:() => 0.7,
  click:() => notice('crawl') || openOv('<h3>바닥</h3>무언가 기어간 자국. 먼지 위로 길게, 몸통 하나 너비다.<br>구석에서 시작해 책장 밑으로 들어갔다. 나간 자국은 없다.' + (S.deep && S.deep.sun ? '<br>가는 길에 바다 궤 앞에서 한 번 둥글게 맴돌았다.' : '')) });
OBJ.push({ id:'shed', x:-28, y:27, rot:-0.3, m:() => 'shed', show:() => (S.crawlN || 0) >= K.shedAfter,
  click:() => notice('shed') || openOv('<h3>허물</h3>구석에 말라붙은 허물 한 조각. 비늘 하나가 손톱만 하다.<br>한쪽 끝은 책장 밑으로 들어가 있다. 당겨도 끝이 나오지 않는다.' + (typeof kitchenDays === 'function' && kitchenDays() >= K.traceDays ? '<br>한쪽에 아궁이 재가 묻어 있다.' : '')) });
