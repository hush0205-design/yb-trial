'use strict';
// ───────── 잊기 = 대문에 자물쇠 (환생 명세 3절 · 코드 정리 설계 2절) ─────────
// 열쇠(첫 강제 환생 뒤 늘 있는 유품)가 있고 한서진이 온 뒤면 대문에 자물쇠가 걸려 있음 → 누르면
//   밀린 녹봉이 있으면 "사람들을 보내고 가야 한다" / 없으면 '문을 잠그고 산으로 들어간다' → 남길 것을 하나 고름 → 족보 "서고 문을 잠그고 산으로 들어가다" → 새 대.
// 잊기로 남길 수 있는 것(환생 명세 4절 '잊기 고름' 중 지금 효과가 있는 것): 수정 문진(들였을 때 — 다음 대 처음부터) · 사본 묶음(돈 1냥으로 시작).
RELIC.glass = { name:'수정 문진', desc:'앞 대가 서안 위에 두고 간 수정 문진. 처음부터 서안 곁에 있다.' };
const FORGET_KEEP = () => [...(S.owned.glass && !hasRelic('glass') ? ['glass'] : []), ...(!hasRelic('copies') ? ['copies'] : [])];
END.forget = { name:'서고 문을 잠그고 산으로 들어가다', kind:'잊기', n: () => 0, lim: () => Infinity, omen(){},
  scene: () => ['가주는 밀린 것을 다 치르고 사람들을 돌려보냈다.',
    '책장의 책은 그대로 두고, 첫 책만 궤짝에 넣었다.',
    '대문에 자물쇠를 채웠다. 열쇠는 허리에 찼다.',
    '산으로 난 길은 서고에서 보이지 않았다.',
    '언젠가 누가 이 열쇠로 문을 열 것이다.'],
  codex: '스스로 서고 문을 잠그고 산으로 들어갔다.',
  only: () => '<b>열쇠</b> — 허리춤에서 닳아 반들반들하다.',
  relics: [], gahun: null };
M.padlock = model(3, 2, 4, (x, y, z) => z === 3 ? (x === 1 ? null : '#6a5a3a') : '#8a7448');
GATE_OBJ.push({ id:'gLock', x:3, y:-19.4, z:4, rot:0, on:()=>'gate', m:()=>'padlock', show:()=> hasRelic('key') && !!S.rArrived && Math.cos(viewA) > 0.05, click:()=>showForget() });
function showForget(){
  if (typeof oweTotal === 'function' && oweTotal() > 0) return openOv(`<h3>자물쇠</h3>열쇠가 꼭 맞는다.<br>그러나 밀린 녹봉이 ${fmtM(oweTotal())} 있다. 사람들을 보내고 가야 한다.`);
  openOv('<h3>자물쇠</h3>대문 고리에 걸린 낡은 자물쇠. 허리춤의 열쇠가 꼭 맞는다.<br>문을 잠그고 산으로 들어가면, 이 대에 읽던 것은 여기서 멈춘다.'
    + '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bForget" style="color:var(--ink);border-color:#00000066">문을 잠그고 산으로 들어간다</button></div>');
  document.getElementById('bForget').addEventListener('click', ev => { ev.stopPropagation(); forgetPick(); });
}
function forgetPick(){
  const keep = FORGET_KEEP();
  openOv('<h3>남길 것</h3>다음에 이 문을 열 사람에게 하나를 남긴다.<div style="margin-top:10px">'
    + keep.map(r => `<div class="brow rec" data-fk="${r}"><span class="bdot">○</span><span class="bt">${RELIC[r].name}</span><span class="bn">${RELIC[r].desc.split('.')[0]}</span></div>`).join('')
    + '<div class="brow rec" data-fk=""><span class="bdot">○</span><span class="bt">아무것도 남기지 않는다</span></div></div>');
  ovBody.querySelectorAll('[data-fk]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation();
    END.forget.relics = el.dataset.fk ? [el.dataset.fk] : [];
    if (typeof tlog === 'function') tlog('잊기: ' + (el.dataset.fk || '남긴 것 없음'));
    samsinPick(); }));
}
// 삼신(기획서 신 후보 · 추천 7개 중 7번, ✳ 11/3): 떠나기 전 삼신상에 빌면 다음 대의 첫 조건 하나 — 대신 족보의 다음 칸에 읽을 수 없는 글이 먼저 적혀 있음
const SAMSIN = { coin:['곳간이 비지 않기를', '처음부터 엽전 꾸러미'], calm:['겁이 적기를', '덜 떤다'], eye:['글눈이 밝기를', '글을 빨리 푼다'] };
function samsinPick(){
  openOv('<h3>삼신상</h3>떠나기 전, 안방 윗목에 정화수 한 사발과 쌀 한 줌을 올린다.<br>다음에 이 문을 열 사람을 빈다.<div style="margin-top:10px">'
    + Object.keys(SAMSIN).map(id => `<div class="brow rec" data-ss="${id}"><span class="bdot">○</span><span class="bt">${SAMSIN[id][0]}</span></div>`).join('')
    + '<div class="brow rec" data-ss=""><span class="bdot">○</span><span class="bt">빌지 않는다</span></div></div>');
  ovBody.querySelectorAll('[data-ss]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation();
    if (el.dataset.ss) LINE.samsin = el.dataset.ss; else delete LINE.samsin;
    if (typeof tlog === 'function') tlog('삼신: ' + (el.dataset.ss || '빌지 않음'));
    endGame('forget'); }));
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended || !S.genInit || !LINE.samsin || S.samsin) return;                                // 새 대가 시작되면 한 번 받음
  S.samsin = LINE.samsin; delete LINE.samsin; saveLine();
  if (S.samsin === 'coin'){ S.money = (S.money || 0) + K.samsinCoin; ledger('윗목에 엽전 꾸러미가 놓여 있었다 + ' + fmtM(K.samsinCoin)); }
  save(); });
// 남긴 수정 문진: 다음 대 처음부터 서안 곁에
function forgetTick(){ if (S.genInit && hasRelic('glass') && !S.glassRelic){ S.glassRelic = true; S.owned.glass = true; save(); } }

HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; forgetTick(); });
