'use strict';
// ───────── 대문과 문갑 (기획서 14-2) ─────────
// 서고 뒷벽 문 = 뒷마당을 돌아 대문 밖으로 나가는 문. 대문 화면은 바깥(골목)에서 본 모습 — 들어갈 땐 대문으로. 기록은 서고 안 문갑(서류 넣는 서랍장)에.
// 방(榜)은 대문에 붙이고 뗄 수 있음. 지원서가 오면 그 사람이 대문 앞에 서 있음.

// 흙 마당
M.yard = model(76,54,1,(x,y)=>{ const h = (x*7 + y*13) % 23; return h === 0 ? '#6a5a44' : ((x + y*3) % 11 === 0 ? '#4e4030' : (y % 9 < 5 ? '#57472f' : '#53432c')); });
// 솟을대문: 기둥 둘, 문짝 두 짝(놋쇠 못), 가운데가 솟은 기와지붕
M.gate = model(26,4,32,(x,y,z)=>{
  if (z >= 24){ const half = 13.5 - (z - 24)*1.3; return Math.abs(x - 12.5) <= half ? (z % 2 ? '#2b2b2e' : '#3a3a3f') : null; }
  if (z >= 21) return y <= 1 ? '#4a2e18' : null;                                  // 처마 밑 도리
  if (x <= 1 || x >= 24) return '#5b3c25';                                         // 기둥
  if (y === 2){
    if (x === 12 || x === 13) return z >= 3 && z <= 18 ? '#7a5a30' : '#2c1c11';     // 두 문짝 틈으로 안쪽 불빛이 샘
    if (z % 5 === 2 && x % 4 === 2) return '#9a7a3a';                              // 놋쇠 못
    return '#4a2f1b';
  }
  return null; });
// 담장: 아래는 돌, 가운데는 흙벽, 위는 기와
M.wall = model(24,2,13,(x,y,z)=>{ if (z >= 11) return z === 12 ? '#2b2b2e' : '#3a3a3e'; if (z <= 5) return (x + z) % 3 ? '#6b6457' : '#575046'; return '#b9ad92'; });
// 대문에 붙인 방 한 장
M.bangPaper = model(5,1,6,(x,y,z)=> (x === 0 || x === 4 || z === 0 || z === 5) ? '#cfc3a3' : (x % 2 === 1 && z > 1 && z < 5 ? '#3a2a1a' : '#e8dfc8'));
// 방을 떼어 낸 자리: 네 귀퉁이에 찢긴 종이와 풀 자국
M.bangTorn = model(5,1,6,(x,y,z)=>{
  if ((z === 5 && x !== 2) || (z === 4 && (x === 0 || x === 4)) || (z === 0 && x <= 1) || (z === 0 && x === 4) || (z === 1 && x === 0)) return (x + z) % 2 ? '#cfc3a3' : '#bfb08c';
  if ((x === 2 && z === 3) || (x === 1 && z === 2) || (x === 3 && z === 1) || (x === 3 && z === 4)) return '#62482c';
  return null; });
// 문갑: 낮은 서랍장, 서랍 여섯에 놋쇠 고리 / 새 기록이 있으면 서랍 하나가 열려 있음
function mungapModel(open){
  return model(12, open ? 8 : 6, 9, (x,y,z)=>{
    if (open && y >= 6) return (x >= 1 && x <= 5 && z >= 4 && z <= 6) ? (z === 6 ? '#d8cdb0' : '#5e3a22') : null;   // 빠져나온 서랍(위에 종이)
    if (z === 0) return ((x <= 1 || x >= 10) && (y <= 1 || y >= 4)) ? '#2c1c11' : null;                      // 발
    if (z === 8) return '#5e3a22';                                                                           // 천판
    if (y === 5){
      if (x === 0 || x === 11 || x === 6 || z === 1 || z === 4 || z === 7) return '#2c1c11';                // 서랍 테두리
      if ((x === 3 || x === 9) && (z === 2 || z === 5)) return '#a8873e';                                    // 놋쇠 고리
      return '#4a2f1b';
    }
    return '#3f2717';
  });
}
M.mungap = mungapModel(false); M.mungapOpen = mungapModel(true);

// 문갑에 새 기록이 있나: 기록 목록·일지 수·낱말 정리 수로 '본 적 있는 상태'를 비교
const libSig = () => buildRecs().map(r => r[0].replace(/ — 새로.*$/, '')).join('|') + '#' + diaryCount() + '#' + ['smw', 'ojr'].map(k => staffDiary(k).length).join(',') + '#' + (S.gl.fresh||0);
const libNew = () => S.D >= T.door && libSig() !== S.libSig;
OBJ.push({ id:'mungap', x:17, y:-22, rot:0, m:()=> libNew() ? 'mungapOpen' : 'mungap', show:()=> S.D >= T.door, click:()=>showLibrary() });
{ const d = OBJ.find(o => o.id === 'door'); d.click = () => goScene('gate'); }

// 대문 화면
const GATE_OBJ = [
  { id:'gate', x:0, y:-22, rot:0, m:()=>'gate', click:()=>{
    openOv(`<h3>대문</h3>우리 서고의 대문. 문짝 틈으로 안쪽 불빛이 샌다.<br>${S.bangAt && !S.bangOff ? '방이 붙어 있다.' : S.bangAt ? '방을 떼어 낸 자리가 남아 있다.' : ''}${curApplicant() ? '<br>대문 앞에 누가 서 있다.' : ''}<br><br>골목 끝에서 갈두포 쪽 바람이 분다.`
      + '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bGateIn" style="color:var(--ink);border-color:#00000066">대문을 열고 들어간다</button></div>');
    document.getElementById('bGateIn').addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); goScene('seogo'); }); } },
  { id:'wallL', x:-25, y:-22, rot:0, m:()=>'wall', click:()=>openOv('<h3>담</h3>오래된 담. 기와 몇 장이 바다 쪽으로 쓸려 있다.') },
  { id:'wallR', x:25, y:-22, rot:0, m:()=>'wall', click:()=>openOv('<h3>담</h3>오래된 담. 기와 몇 장이 바다 쪽으로 쓸려 있다.') },
  // 방은 대문 바로 다음에 그림(앞에 선 사람 위로 뜨지 않게), 대문 뒤쪽에서 볼 땐 안 보임
  { id:'gBang', x:4, y:-19.5, z:9, rot:0, on:()=>'gate', m:()=>'bangPaper', show:()=> !!S.bangAt && !S.bangOff && Math.cos(viewA) > 0.05, click:()=>showGateBang() },
  { id:'gBangSpot', x:4, y:-19.5, z:9, rot:0, on:()=>'gate', m:()=>'bangTorn', show:()=> !!S.bangAt && !!S.bangOff && Math.cos(viewA) > 0.05, click:()=>showGateBang() },
];
const GATE_DOLLS = {};
function gateDollFor(k){
  if (GATE_DOLLS[k]) return GATE_DOLLS[k];
  const d = dollFor(k);
  return (GATE_DOLLS[k] = { id:'gd_' + k, doll:true, img: d.img, imgL: d.imgL, shadow: d.shadow,
    st:()=>({ x:2, y:-12, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0, steam:()=>0, arrT:()=>0,
    show:()=> curApplicant() === k, click:()=>readApplicant(k) });
}
// 대문 앞에 서는 사람: 지원서를 들고 온 사람(편지만 보내는 사람은 오지 않음)
const gateDolls = () => { const k = curApplicant(); return k && !(STAFF[k] && STAFF[k].later) ? [gateDollFor(k)] : []; };

function showGateBang(){
  const btn = (id, label) => `<button class="btn rec" id="${id}" style="color:var(--ink);border-color:#00000066;margin:4px">${label}</button>`;
  if (S.bangOff){
    openOv('<h3>방을 떼어 낸 자리</h3>귀퉁이마다 찢긴 종이가 붙어 있고, 가운데엔 풀 자국이 얼룩져 있다.<div style="text-align:center;margin-top:14px">' + btn('bRepost', '다시 붙인다') + '</div>');
    document.getElementById('bRepost').addEventListener('click', ev => { ev.stopPropagation(); S.bangOff = false; S.genNext = Math.max(S.genNext || 0, Date.now() + 120000); save(); ov.classList.add('hidden'); noise(0.25, 900, 0.06); });
    return;
  }
  openOv(bangHtml() + '<div style="font-size:13px;opacity:.7;text-align:center">대문에 붙어 있다. 떼면 더는 사람을 구하지 않는다.</div><div style="text-align:center;margin-top:12px">' + btn('bUnpost', '떼어 낸다') + '</div>');
  document.getElementById('bUnpost').addEventListener('click', ev => { ev.stopPropagation(); S.bangOff = true; save(); ov.classList.add('hidden'); noise(0.3, 1400, 0.05); if (typeof tlog === 'function') tlog('방을 뗌'); });
}
