'use strict';
// ───────── 박물관 (기획서 19절 '박물관이 생기는 까닭' · 1대 일정표 8~11일 · 자원과 돈 '유물 팔기') ─────────
// ① 바다 궤가 놓인 다음 날부터 소문이 돌아 마을 사람들이 낮에 마당 안까지 들어와 기웃거림(대문 앞 종이 인형) · 궤 뚜껑이 조금 열려 있음.
// ② 그 뒤 가옥도에 '대문 밖 길가' 필지가 생김 → 땅을 사서 박물관을 올림(19_house BUILD).
// ③ 다 지으면 구경꾼은 그리로만 다님(마당이 조용해짐). 날마다 진열한 유물 수만큼 상 위에 엽전 — "받지 않았는데 두고 갔다".
//    몇 날에 한 번은 엽전 대신 젖은 조개껍데기(물가의 사람들이 섞여 다녀감). 진열한 것을 물가의 사람들에게 팔면 그만큼 덜 옴.
// ④ 박물관 문을 닫아 걸면(✳ 11/3): 엽전은 없고, 사흘에 한 번 밤에 누가 담을 넘어와 조개 하나를 가져감 — 그날 마당 담 밑에 젖은 발자국.
const museumN = () => S.sea ? (S.sea.kelp || 0) + (S.sea.shell || 0) + (S.sea.rub || 0) : 0;
const gawkHere = () => !!S.gawkAt && !built('museum') && !isNight() && gameHour() >= 9 && gameHour() < 18 && museumN() > 0;
PLOTS.push(['museum', '대문 밖 길가', [1, 3], 'museum', () => !!S.gawkAt]);
BUILD.museum = { name:'박물관', cost:800, h:4, done:'박물관(博物館)' };

function museumTick(){
  if (!S.gawkAt && S.relicBox && dayKey() > S.relicBox.day){ S.gawkAt = Date.now(); save(); if (typeof tlog === 'function') tlog('구경꾼이 마당에'); }
  if (!built('museum')) return;
  const today = dayKey();
  if (S.museumDay == null){ S.museumDay = today; save(); return; }
  while (S.museumDay < today){ S.museumDay++;
    const n = museumN(); if (!n) continue;
    if (S.museumShut){ if (S.museumDay % K.museumClimbEvery === 0 && S.sea.shell){ S.sea.shell--; S.museumClimb = S.museumDay; ledger('진열대에서 조개껍질 하나가 없어짐'); } }   // 닫아 두면: 담을 넘어온 사람
    else if (S.museumDay % K.museumShellEvery === 0) S.museumShell = (S.museumShell || 0) + 1;
    else S.museumCoins = (S.museumCoins || 0) + n * K.museumPer;
    save();
  }
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; museumTick(); });

// ── ① 마당의 구경꾼 ──
let GAWK = null;
HOOK.dolls.gate.push(() => {
  if (!gawkHere()) return [];
  if (!GAWK) GAWK = [0, 1].map(i => { const sets = dollSet(drawSeonbi, VILL_O);
    return { id:'gawk' + i, doll:true, img: sets[0], imgL: sets, shadow:false, st:()=>({ x: -14 + i*8, y: 4 + i*3, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0, steam:()=>0, arrT:()=>0, show:()=>true,
      click:()=>openOv('<h3>마을 사람들</h3>바다 궤 이야기를 듣고 왔다고 한다. 대문은 닫혀 있었는데 마당 안에 서 있다.<br>서고 쪽을 기웃거린다. 무엇이 들었느냐고 묻는다.') }; });
  return GAWK;
});
HOOK.ov.push(() => { const h = ovBody.querySelector('h3'); if (!h || h.textContent !== '바다 궤(海櫃)' || !S.gawkAt || built('museum')) return;
  const d = document.createElement('div'); d.style.cssText = 'font-size:13px;opacity:.75'; d.textContent = '뚜껑이 조금 열려 있었다. 누가 만지고 간 것 같다.'; h.after(d); });

// ── ③ 박물관 안 ──
M.showStand = model(18, 6, 5, (x, y, z) => z === 4 ? '#6a4a30' : (x === 0 || x === 17) && (y === 0 || y === 5) ? '#4a3220' : null);
M.relicShell = model(2, 2, 1, () => '#1e1e22');
M.relicKelp = model(4, 2, 1, (x) => x % 2 ? '#3a5a3a' : '#2e4a30');
M.relicRub = model(5, 1, 7, (x, y, z) => (x === 0 || x === 4 || z === 0 || z === 6) ? '#3a2a1a' : (x + z) % 3 ? '#e8e2d0' : '#2a2a2a');
M.offerTable = model(10, 6, 4, (x, y, z) => z === 3 ? '#7a5a3c' : (x === 0 || x === 9) && (y === 0 || y === 5) ? '#5a3c22' : null);
M.coinPile = model(3, 3, 1, (x, y) => (x + y) % 2 ? '#a08a3a' : '#7a6a2a');
const MU_SHELF = [-14, 6];
const MUSEUM_OBJ = [
  { id:'muBack', x:27, y:-25.5, m:()=>'door', click:()=>goScene('seogo') },
  { id:'muWin', x:7, y:-26, z:8, rot:0, m:()=>'__win', click:()=>sceneWin('박물관 창은 길 쪽으로 나 있다. ' + (S.museumShut ? '문을 닫아 건 뒤로 길가에 서 있는 사람이 없다. 낮에는.' : isNight() ? '이 시각에도 길가에 누가 서 있다.' : '구경 온 사람들이 줄을 서 있다.')) },
  { id:'muMap', x:-22, y:-20, rot:0.2, m:()=>'houseScroll', click:()=>showHouse() },
  { id:'muStand', x:MU_SHELF[0], y:MU_SHELF[1], rot:0, m:()=>'showStand', click:museumShelf },
  { id:'muKelp', x:MU_SHELF[0] - 5, y:MU_SHELF[1], z:5, on:()=>'muStand', onOrder:0.02, rot:0.2, m:()=>'relicKelp', show:()=> !!(S.sea && S.sea.kelp), click:museumShelf },
  { id:'muRub', x:MU_SHELF[0] + 5, y:MU_SHELF[1] - 2, z:5, on:()=>'muStand', onOrder:0.02, rot:0, m:()=>'relicRub', show:()=> !!(S.sea && S.sea.rub), click:museumShelf },
  ...[0, 1, 2, 3, 4].map(i => ({ id:'muShell' + i, x:MU_SHELF[0] + i*2 - 2, y:MU_SHELF[1] + 1.5, z:5, on:()=>'muStand', onOrder:0.02, rot:i*0.7, m:()=>'relicShell', show:()=> (S.sea && S.sea.shell || 0) > i, click:museumShelf })),
  { id:'muDoor', x:-37.5, y:2, rot:Math.PI/2, m:()=>'door', click:museumDoor },
  { id:'muTable', x:10, y:12, rot:0, m:()=>'offerTable', click:offerTake, glow:()=> !!(S.museumCoins || S.museumShell) },
  { id:'muCoins', x:10, y:12, z:4, on:()=>'muTable', onOrder:0.02, m:()=>'coinPile', show:()=> !!S.museumCoins, click:offerTake },
  { id:'muWet', x:12, y:11, z:4, on:()=>'muTable', onOrder:0.02, m:()=>'relicShell', show:()=> !!S.museumShell, click:offerTake },
];
function museumShelf(){
  const s = S.sea || {}, L = [];
  if (s.kelp) L.push('해초 책갈피 — 펴 둔 안쪽의 작은 글씨를 사람들이 오래 들여다본다.');
  if (s.rub) L.push('비석 탁본 — 글자를 아는 사람은 없는데, 다들 같은 줄에서 손가락을 멈춘다.');
  if (s.shell) L.push(`조개껍질 ${KCNT(s.shell)} 개 — 안쪽이 먹물처럼 검다.`);
  openOv('<h3>진열대</h3>' + (L.length ? L.join('<br>') + '<br><br><span style="font-size:12px;opacity:.6">물가의 사람들에게 팔면 진열대에서 빠진다.</span>' : '비어 있다. 구경 오는 사람이 없다.'));
}
function offerTake(){
  const c = S.museumCoins || 0, w = S.museumShell || 0;
  if (!c && !w) return openOv('<h3>상</h3>구경하고 간 사람들이 무언가를 두고 가는 자리. 지금은 비어 있다.');
  if (c){ S.money = (S.money || 0) + c; ledger(`박물관 상 위의 엽전 + ${fmtM(c)} (받지 않았는데 두고 갔다)`); sCoin(); }
  if (w){ S.sea = S.sea || { kelp:0, shell:0 }; S.sea.shell = (S.sea.shell || 0) + w; ledger(`박물관 상 위에 젖은 조개껍데기 ${w}개`); notice('wetcoin'); }
  S.museumCoins = 0; S.museumShell = 0; save();
  if (typeof tlog === 'function') tlog('박물관 상: ' + fmtM(c) + (w ? ' · 젖은 조개 ' + w : ''));
  openOv('<h3>상</h3>' + (c ? `엽전 ${fmtM(c)}. 받지 않았는데 두고 갔다.` : '') + (w ? `${c ? '<br>' : ''}엽전 대신 젖은 조개껍데기 ${KCNT(w)} 개. 아직 바닷물이 마르지 않았다.` : ''));
}
function museumDoor(){
  openOv('<h3>박물관 문</h3>길 쪽으로 난 문. ' + (S.museumShut ? '빗장을 걸어 두었다.' : '열어 두었다. 구경 온 사람들이 드나든다.')
    + `<div style="text-align:center;margin-top:12px"><button class="btn rec" id="bMuDoor" style="color:var(--ink);border-color:#00000066">${S.museumShut ? '문을 열어 둔다' : '빗장을 건다'}</button></div>`);
  document.getElementById('bMuDoor').addEventListener('click', ev => { ev.stopPropagation(); S.museumShut = !S.museumShut; save(); sDoor(); if (typeof tlog === 'function') tlog(S.museumShut ? '박물관 문을 닫음' : '박물관 문을 엶'); museumDoor(); });
}
M.wetPrints = model(12, 6, 1, (x, y) => (x % 4 < 2 && (y === (x >> 2) * 2 || y === (x >> 2) * 2 + 1)) ? '#2a3436' : null);
GATE_OBJ.push({ id:'gPrints', x:-24, y:-14, rot:0.3, m:()=>'wetPrints', show:()=> !!S.museumClimb && S.museumClimb === dayKey(),
  click:()=>notice('prints') || openOv('<h3>담 밑</h3>담 안쪽 흙에 젖은 발자국. 담을 넘어 들어와 박물관 쪽으로 갔다가 같은 길로 나갔다.<br>발가락 사이가 넓다.') });
