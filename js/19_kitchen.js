'use strict';
// ───────── 부엌 · 행랑채 · 차밭 · 제다소 장면 (기획서 22절 ✳ "부엌·행랑채를 지으면 그 방도 장면으로", 11/2) ─────────
// 가옥도에서 다 지은 부엌·행랑채를 누르면 들어가는 방(19_house hmClick). 효과는 그대로(부엌 = 녹봉 쌀값 0.8배, 행랑채 = 일꾼) — 방은 그 이유를 물건으로 보여 줌.
// 부엌: 아궁이(낮엔 불, 밤엔 묻은 불씨) · 조왕중발 · 쌀독(들인 날부터 하루 한 줄). 며칠 지나면 재 속에 눈 모양 숯, 사발 밑에 어제 넘긴 양을 적은 종이(기획서 11-4 조왕의 흔적 — 지켜본다).
// 행랑채: 이부자리 · 지게 · 벽의 금(글 모르는 일꾼이 하루 한 줄) — 며칠 지나면 묵은 날보다 한 줄이 많음.
// 차밭(바깥, 07_room이 대문처럼 그림): 차나무 셋 · 광주리 · 선돌 · 사립문 — 며칠 지나면 새순 잎맥이 첫 책의 낯선 글자처럼.
// 제다소: 덖음 솥 · 멍석 · 차 단지(장에 파는 단추, 전엔 가옥도 창) — 며칠 지나면 덖은 잎이 늘 서고 쪽으로 말림.
const builtAt = b => { const p = S.land && Object.values(S.land).find(q => q.b === b && q.done); return p ? p.end : 0; };
const daysSince = t => t ? Math.max(0, Math.floor((Date.now() - t) / DAY_MS())) : 0;
const kitchenDays = () => daysSince(builtAt('kitchen'));
const tallyN = () => Math.min(K.tallyMax, daysSince(S.worker && S.worker.at) + (daysSince(S.worker && S.worker.at) >= K.tallyOddDays ? 1 : 0));
M.stove = model(14, 8, 7, (x, y, z) => { const hole = y === 7 && z <= 2 && ((x >= 2 && x <= 4) || (x >= 9 && x <= 11)), pot = z === 6 && (Math.hypot(x - 3.5, y - 3.5) <= 2.2 || Math.hypot(x - 10.5, y - 3.5) <= 2.2);
  return hole ? '#140d08' : pot ? '#2a2826' : (z === 6 ? '#8a6a4c' : '#74563c'); });
M.stoveLit = model(14, 8, 7, (x, y, z) => { const hole = y === 7 && z <= 2 && ((x >= 2 && x <= 4) || (x >= 9 && x <= 11)), pot = z === 6 && (Math.hypot(x - 3.5, y - 3.5) <= 2.2 || Math.hypot(x - 10.5, y - 3.5) <= 2.2);
  return hole ? (z === 0 ? '#e0782c' : '#a8401c') : pot ? '#2a2826' : (z === 6 ? '#8a6a4c' : '#74563c'); });
M.jowang = model(3, 3, 2, (x, y, z) => z === 1 && x === 1 && y === 1 ? '#a8bcc4' : '#e8e2d2');
M.riceJar = model(7, 7, 9, (x, y, z) => { const r = Math.hypot(x - 3, y - 3), R = z === 8 ? 2.2 : z >= 6 ? 3.2 - (z - 6) * 0.4 : z === 0 ? 2.2 : 3.2; return r <= R ? (z === 8 ? '#3e2a18' : '#5a3c22') : null; });
M.bedding = model(10, 6, 3, (x, y, z) => z === 2 ? '#c8bca0' : z === 1 ? '#7a3428' : '#3c4a5a');
M.jige = model(6, 4, 12, (x, y, z) => (x === 0 || x === 5) && y === 1 ? '#6a4a2c' : (z === 3 || z === 7 || z === 11) && y === 1 ? '#5a3c22' : (y >= 2 && z <= 1 && x >= 1 && x <= 4) ? '#4a3220' : null);
const TALLY_M = {};
const tallyModel = n => TALLY_M[n] || (TALLY_M[n] = model(18, 1, 7, (x, y, z) => {   // 판자에 두 줄, 줄마다 금 여덟
  if (z === 0 || z === 6 || x === 0 || x === 17) return '#4a3020';
  const row = z >= 4 ? 0 : 1, mark = (x - 1) % 2 === 0 && x <= 15 && (z === 4 || z === 5 || z === 1 || z === 2);
  return mark && row * 8 + (x - 1) / 2 < n ? '#1e140c' : '#6a4a30'; }));
const sceneWin = txt => openOv(`<h3>창</h3>${daylight() >= 0.8 ? '창호지가 환하다. 낮이다.' : '창밖이 어둡다.'}<br>${txt}`);
const KITCHEN_OBJ = [
  { id:'kBack', x:27, y:-25.5, m:()=>'door', click:()=>goScene('seogo') },
  { id:'kWin', x:7, y:-26, z:8, rot:0, m:()=>'__win', click:()=>sceneWin('부엌 창은 뒤꼍으로 나 있다. 연기가 빠져나간 자리마다 그을음이 앉았다.') },
  { id:'kMap', x:-22, y:-20, rot:0.2, m:()=>'houseScroll', click:()=>showHouse() },
  { id:'kStove', x:-4, y:-14, rot:0, m:()=> isNight() ? 'stove' : 'stoveLit', click:()=>openOv('<h3>아궁이</h3>' + (isNight() ? '불씨를 재에 묻어 두었다. 꺼뜨린 적이 없다.' : '불이 들어 있다. 끼니를 집에서 지으니 쌀을 사 오는 값이 덜 든다.')
      + (kitchenDays() >= K.traceDays ? '<br><br>재를 헤치면 숯 하나가 눈 모양으로 타 있다. ' + (S.deep && S.deep.sun ? '오늘은 불 쪽이 아니라 바다 궤 쪽을 보고 있다.' : '늘 불 쪽을 보고 있다.') : '')) },
  { id:'kBowl', x:-4, y:-15, z:7, on:()=>'kStove', onOrder:0.02, m:()=>'jowang', click:()=>{ const n = (S.dayPages || []).slice(-1)[0];
    openOv('<h3>사발</h3>부뚜막 위 흰 사발에 맑은 물. 새벽마다 갈려 있다.<br>누가 가는지 본 사람이 없다.' + (kitchenDays() >= K.traceDays && n ? `<br><br>사발 밑에 접힌 종이 한 장. 「${fmtP(n)}」<br>한서진이 아침에 올린 숫자와 같다. 한서진은 부엌에 들어간 적이 없다고 한다.` : '')); } },
  { id:'kJar', x:16, y:4, rot:0, m:()=>'riceJar', click:()=>openOv(`<h3>쌀독</h3>뚜껑 안쪽에 부엌을 들인 날부터 하루 한 줄씩 금을 그어 두었다 — ${KCNT(kitchenDays())} 줄.<br>별채 사람들의 끼니 쌀을 사 오는 값이 열에 둘 덜 든다.`) },
];
const HAENG_OBJ = [
  { id:'hBack', x:27, y:-25.5, m:()=>'door', click:()=>goScene('seogo') },
  { id:'hWin', x:7, y:-26, z:8, rot:0, m:()=>'__win', click:()=>sceneWin('행랑채 창은 대문 쪽으로 나 있다. 드나드는 사람이 다 보인다.') },
  { id:'hMap', x:-22, y:-20, rot:0.2, m:()=>'houseScroll', click:()=>showHouse() },
  { id:'hBed', x:-6, y:6, rot:0.1, m:()=>'bedding', click:()=>openOv('<h3>이부자리</h3>일꾼의 이부자리. 반듯하게 개어 두었다.<br>새경을 받지 못한 날은 차밭에 나가지 않는다.') },
  { id:'hJige', x:16, y:-12, rot:0, m:()=>'jige', click:()=>openOv('<h3>지게</h3>' + (built('teaf') ? '호미가 걸려 있다. 흙이 뒷산 비탈의 흙이다.' : '아직 질 짐이 없다.')) },
  { id:'hTally', x:-6, y:-25.5, z:6, rot:0, m:()=>{ const n = tallyN(); M['tally' + n] = tallyModel(n); return 'tally' + n; }, click:()=>openOv(`<h3>벽의 금</h3>글을 모르는 일꾼이 하루에 한 줄씩 벽에 금을 긋는다. ${KCNT(tallyN())} 줄.`
      + (daysSince(S.worker && S.worker.at) >= K.tallyOddDays ? '<br>세어 보면 일꾼이 묵은 날보다 한 줄이 많다. 일꾼은 그 줄을 그은 적이 없다고 한다.' : '')) },
];
M.teaBush = model(10, 7, 6, (x, y, z) => { const r = ((x - 4.5) / 5) ** 2 + ((y - 3) / 3.5) ** 2 + ((z - 1) / 5) ** 2; return z === 0 ? (x === 4 && y === 3 ? '#4a3420' : null) : r <= 1 ? ((x * 3 + y + z * 5) % 7 === 0 ? '#6a8a44' : '#34502a') : null; });
M.basket = model(6, 6, 4, (x, y, z) => Math.hypot(x - 2.5, y - 2.5) <= 2.8 ? (z === 3 && Math.hypot(x - 2.5, y - 2.5) < 2 ? null : (x + z) % 2 ? '#a08a5a' : '#8a7448') : null);
M.basketFull = model(6, 6, 4, (x, y, z) => Math.hypot(x - 2.5, y - 2.5) <= 2.8 ? (z === 3 && Math.hypot(x - 2.5, y - 2.5) < 2 ? '#4e6a34' : (x + z) % 2 ? '#a08a5a' : '#8a7448') : null);
M.standStone = model(4, 3, 12, (x, y, z) => z >= 10 && (x === 0 || x === 3) ? null : (x + z) % 5 ? '#6a6a64' : '#58585a');
M.sarip = model(14, 2, 10, (x, y, z) => y === 0 && (x % 2 === 0 || z === 3 || z === 7) ? (z === 9 && x % 2 ? null : '#6a5a3a') : null);
M.roastPot = model(12, 10, 6, (x, y, z) => z === 5 ? (Math.hypot(x - 5.5, y - 4.5) <= 4 ? '#2a2826' : '#8a6a4c') : (y === 9 && z <= 2 && x >= 4 && x <= 7 ? '#140d08' : '#74563c'));
M.mat = model(16, 10, 1, () => '#b89a5a');
M.matTea = model(16, 10, 1, (x, y) => x >= 2 && x <= 13 && y >= 2 && y <= 7 && (x * 5 + y * 3) % 4 ? '#4e6a34' : '#b89a5a');
M.teaJar = model(5, 5, 7, (x, y, z) => { const r = Math.hypot(x - 2, y - 2); return r <= (z === 6 ? 1.2 : z >= 5 ? 1.8 : 2.4) ? (z === 6 ? '#1e140c' : '#3a2a1a') : null; });
const teaN = () => Math.floor(S.tea || 0);
const teafDays = () => daysSince(builtAt('teaf')), millDays = () => daysSince(builtAt('mill'));
const bushClick = () => openOv('<h3>차나무</h3>뒷산 비탈에 줄지어 심은 차나무. ' + (S.worker ? '일꾼이 돌본다.' : '돌볼 손이 없어 잎이 거칠다.')
  + (teafDays() >= K.traceDays ? '<br><br>새순 하나의 잎맥이 첫 책의 낯선 글자처럼 갈라져 있다. 따 내도 이튿날 같은 가지에 같은 잎이 난다.' : ''));
const TEAF_OBJ = [
  { id:'tGate', x:0, y:-22, rot:0, m:()=>'sarip', click:()=>goScene('seogo') },
  { id:'tMap', x:-22, y:-20, rot:0.2, m:()=>'houseScroll', click:()=>showHouse() },
  ...[[-14, 2], [-2, 4], [10, 2]].map(([x, y], i) => ({ id:'tBush' + i, x, y, rot:0.1 * i, m:()=>'teaBush', click:bushClick })),
  { id:'tBasket', x:18, y:14, rot:0, m:()=> teaN() ? 'basketFull' : 'basket', click:()=>openOv(`<h3>광주리</h3>${S.worker ? '일꾼이 딴 잎을 담아 온다.' : '비어 있다. 딸 사람이 없다.'}<br>거둔 정직한 차: ${teaN()}근.`) },
  { id:'tStone', x:-22, y:-8, rot:0, m:()=>'standStone', click:()=>openOv('<h3>선돌</h3>비탈 끝에 선 돌. 여기서는 서고 지붕과 바다가 한눈에 보인다.'
      + (isNight() ? '<br>서고 창의 불빛이 깜빡일 때마다 바다 쪽 어디선가 불빛 하나가 같이 깜빡인다.' : '')) },
];
function teaSell(){
  openOv(`<h3>차 단지</h3>덖어 말린 차를 담아 둔다.<br>정직한 차: ${teaN()}근` + (teaN() >= 1 ? `<div style="text-align:center;margin-top:12px"><button class="btn rec" id="bTeaSell" style="color:var(--ink);border-color:#00000066">장에 내다 판다 — 한 근에 ${fmtM(K.teaPrice)}</button></div><div style="font-size:12px;opacity:.6">팔면 마실 차가 준다.</div>` : ''));
  const b = document.getElementById('bTeaSell'); if (b) b.addEventListener('click', ev => { ev.stopPropagation(); const n = teaN(); S.tea -= n; S.money = (S.money || 0) + n * K.teaPrice; ledger(`정직한 차 ${n}근을 장에 냄 + ${fmtM(n * K.teaPrice)}`); sCoin(); save(); teaSell(); });
}
const MILL_OBJ = [
  { id:'mBack', x:27, y:-25.5, m:()=>'door', click:()=>goScene('seogo') },
  { id:'mWin', x:7, y:-26, z:8, rot:0, m:()=>'__win', click:()=>sceneWin('제다소 창은 아랫마을 쪽으로 나 있다. 장에 가는 길이 보인다.') },
  { id:'mMap', x:-22, y:-20, rot:0.2, m:()=>'houseScroll', click:()=>showHouse() },
  { id:'mPot', x:-4, y:-14, rot:0, m:()=>'roastPot', click:()=>openOv('<h3>덖음 솥</h3>' + (isNight() ? '솥이 식어 있다. 덖던 잎 냄새만 남았다.' : '찻잎을 덖는다. 손으로 비비고 다시 덖기를 아홉 번.')
      + (millDays() >= K.traceDays ? '<br><br>덖은 잎이 솥 안에서 늘 한쪽으로만 말린다. 서고 쪽이다.' : '')) },
  { id:'mMat', x:8, y:8, rot:0.1, m:()=> teaN() ? 'matTea' : 'mat', click:()=>openOv(`<h3>멍석</h3>${teaN() ? '덖은 잎을 펴 말린다.' : '비어 있다.'}<br>일꾼이 거둔 잎이 여기서 곱절의 차가 된다.`) },
  { id:'mJar', x:-18, y:8, rot:0, m:()=>'teaJar', click:teaSell },
];
