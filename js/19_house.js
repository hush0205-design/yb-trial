'use strict';
// ───────── 집 지도(家屋圖) 얇은 첫 판 (기획서 17절 · 1대 일정표 '만들 순서' C · 신 1호 일정표 막 4) ─────────
// 바다 궤가 놓인 다음 날 문갑 곁에 두루마리(막 4의 신호) → 펴면 한지에 먹선으로 그린 집 배치도.
//   지은 곳(서고·별채·대문)을 누르면 그리로 감. 빈 필지는 땅을 사고(5냥부터 한 필지마다 ×1.5) → 정해진 건물을 올림(실제 시간이 걸리는 공사).
//   지을 것이 아직 없는 땅은 소작을 줌(하루 2전, 쌀로 들어와 돈으로 셈).
// 건물: 부엌(녹봉 쌀값이 덜 듦) · 행랑채(일꾼 하나, 새경 하루 1전) · 차밭(일꾼이 있으면 찻잎) · 제다소(찻잎을 덖어 정직한 차가 곱절).
//   정직한 차(S.tea, 근): 가주가 차를 끓이면 찻주전자 대신 이것을 씀(광기 없음 — 19_mad) · 제다소에서 장에 내다 팖.
// 상황판: 사람이 읽는 방엔 불빛, 부엌엔 연기, 해와 달이 가장자리를 돎(게임 시각).
const PLOTS = [   // [id, 이름, 칸(열·행), 올릴 것]
  ['shrine', '사당 터',     [0, 0], 'yeon'],   // 10/31: 연구소(19_yeon)
  ['field',  '뒷산 비탈',   [1, 0], 'teaf'],
  ['sarang', '사랑채',      [2, 0], 'have'],   // 10/31: 우물 터 → 사랑채(19_sarang)
  ['lab',    '별채',        [0, 1], 'have'],
  ['seogo',  '서고',        [1, 1], 'have'],
  ['kitchen','부엌 터',     [2, 1], 'kitchen'],
  ['row',    '행랑 터',     [0, 2], 'haeng'],
  ['gate',   '마당·대문',   [1, 2], 'have'],
  ['mill',   '아랫마을 쪽', [2, 2], 'mill'],
];
const BUILD = {   // 값(푼) · 공사 시간(시간) · 다 지은 이름
  kitchen:{ name:'부엌',   cost:600,  h:3, done:'부엌과 아궁이' },
  haeng:  { name:'행랑채', cost:1000, h:5, done:'행랑채' },
  teaf:   { name:'차밭',   cost:300,  h:2, done:'차밭' },
  mill:   { name:'제다소', cost:1500, h:6, done:'제다소', need:'teaf' },
  yeon:   { name:'연구소', cost:2000, h:6, done:'연구소(硏究所)' },   // 연구 전용 책상(19_yeon, 연구 테크트리 '연구소')
};
const hourMs = () => DAY_MS() / 24;
const landCost = () => Math.round(K.landBase * Math.pow(K.landMul, Object.keys(S.land || {}).length));
const built = b => !!(S.land && Object.values(S.land).some(p => p.b === b && p.done));
const houseOn = () => !!S.labSeen;   // 별채에 처음 들어선 뒤(10/31 선생님 "지도가 좀 일찍" — 전엔 바다 궤 다음 날)
const wageK = () => built('kitchen') ? 0.8 : 1;                                           // 19_money WAGE에 곱함

// ── 두루마리 ──
M.houseScroll = model(8, 3, 2, (x, y, z) => (y === 1 || z === 1) ? (x === 0 || x === 7 ? '#5a3a20' : '#d9ccaa') : null);
OBJ.push({ id:'houseScroll', x:23, y:-17, rot:0.2, m:()=>'houseScroll', show:()=> S.D >= T.door && houseOn(), glow:()=> !S.houseSeen, click:()=>showHouse() });

function plotState(id){
  const p = (S.land || {})[id];
  if (!p) return { own:false };
  if (p.b && !p.done){ const left = p.end - Date.now(); return { own:true, b:p.b, building:true, left }; }
  return { own:true, b:p.b, done:p.done, rent:p.rent };
}
function houseTick(){
  if (!S.land) return;
  for (const id of Object.keys(S.land)){ const p = S.land[id];
    if (p.b && !p.done && Date.now() >= p.end){ p.done = true; save(); knock(0.3); if (typeof tlog === 'function') tlog('공사 끝: ' + BUILD[p.b].name);
      if (p.b === 'haeng') S.worker = { at: Date.now() }; } }
  const today = dayKey();
  if (S.houseDay == null){ S.houseDay = today; save(); return; }
  while (S.houseDay < today){ S.houseDay++;
    const rent = Object.values(S.land).filter(p => p.rent).length;
    if (rent){ S.money = (S.money || 0) + rent * K.rentDay; ledger(`소작료(쌀) ${rent}필지 + ${fmtM(rent * K.rentDay)}`); }
    if (S.worker){
      if ((S.money || 0) >= K.workerWage){ S.money -= K.workerWage; ledger(`일꾼 새경 - ${fmtM(K.workerWage)}`);
        if (built('teaf')){ const n = built('mill') ? K.teaMill : K.teaField; S.tea = (S.tea || 0) + n; ledger(`정직한 차 ${n}근을 거둠 (치부만, 돈 아님)`); } }
      else ledger('일꾼 새경을 주지 못함 — 차밭 일을 쉼');
    }
    save();
  }
}

// ── 가옥도 창 ──
function hmCell([id, nm, [c, r], b]){
  const ps = plotState(id), lit = id === 'lab' ? allKeys().some(k => S.st[k] && working(k)) : id === 'seogo' ? !!(S.rArrived && !isNight()) || bookOpen : false;
  let label = nm, sub = '', cls = '';
  if ((!b || id === 'shrine') && !ps.own && madRoom()) return `<div class="hmCell ghostRoom${myMad() >= 12 ? ' door' : ''}" data-hm="${id}" style="grid-column:${c + 1};grid-row:${r + 1}"><b>이름 없는 방</b><span></span></div>`;   // 광기 9단계: 지은 적 없는 방
  if (b === 'have'){ cls = 'have' + (lit ? ' lit' : ''); sub = id === 'gate' && typeof HOOK !== 'undefined' && HOOK.dolls.gate.some(f => f().length) ? '누가 서 있다' : ''; }
  else if (!ps.own){ cls = 'empty'; sub = '빈 땅'; }
  else if (ps.building){ cls = 'work'; label = BUILD[ps.b].name; sub = `공사 중 — ${Math.max(1, Math.ceil(ps.left / 60e3))}분 남음`; }
  else if (ps.done){ cls = 'have' + (ps.b === 'kitchen' && !isNight() ? ' smoke' : '') + (ps.b === 'yeon' && S.techWork ? ' lit' : ''); label = BUILD[ps.b].done; sub = ps.b === 'teaf' ? (S.worker ? '일꾼이 있다' : '손이 없다') : ps.b === 'mill' ? `정직한 차 ${S.tea || 0}근` : ''; }
  else { cls = 'own'; sub = ps.rent ? '소작을 줌' : '우리 땅'; }
  return `<div class="hmCell ${cls}" data-hm="${id}" style="grid-column:${c + 1};grid-row:${r + 1}"><b>${label}</b><span>${sub}</span></div>`;
}
function showHouse(){
  S.houseSeen = true; save();
  const h = gameHour(), night = isNight(), a = (h / 24) * Math.PI * 2;
  const orb = `<div class="hmOrb ${night ? 'moon' : 'sun'}" style="left:${50 - 46 * Math.sin(a)}%;top:${50 + 46 * Math.cos(a)}%"></div>`;
  openOv(`<h3>가옥도(家屋圖)</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">한지에 먹으로 그린 집 배치도. 누가 그렸는지 모른다. 눌러서 간다.</div>`
    + `<div class="hmap${night ? ' night' : ''}">${orb}${PLOTS.filter(p => !p[4] || p[4]()).map(hmCell).join('')}</div>`
    + `<div style="font-size:12px;opacity:.6;margin-top:6px">궤짝의 엽전: ${fmtM(S.money)}${S.tea ? ` · 정직한 차 ${S.tea}근` : ''}</div>`);
  ovBody.querySelectorAll('[data-hm]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); hmClick(el.dataset.hm); }));
}
const hb = (id, label) => `<button class="btn rec" id="${id}" style="color:var(--ink);border-color:#00000066;margin:4px">${label}</button>`;
function hmBack(html){ return html + '<div class="rec" id="bHmBack" style="margin-top:12px;text-align:center;font-size:13px;opacity:.7">← 가옥도로</div>'; }
function hmBind(map){ for (const [id, fn] of Object.entries(map)){ const el = document.getElementById(id); if (el) el.addEventListener('click', ev => { ev.stopPropagation(); fn(); }); }
  const bk = document.getElementById('bHmBack'); if (bk) bk.addEventListener('click', ev => { ev.stopPropagation(); showHouse(); }); }
const madRoom = () => typeof myMad === 'function' && myMad() >= 9;   // 집이 스스로 자람(기획서 17절 공포 장치 · 광기 9 '집이 보임' · 12 '문이 보임') — 10/31부터 사지 않은 사당 터에(빈 터가 사랑채·연구소가 됨)
function hmClick(id, force){   // force: 이름 없는 방을 지나 땅 사기로(점검 11/4 — 광기 9단계부터 사당 터를 못 사 연구소를 영영 못 짓던 것)
  const P = PLOTS.find(p => p[0] === id), ps = plotState(id), b = P[3];
  if (!force && (!b || id === 'shrine') && !ps.own && madRoom()) return openOv(hmBack('<h3>이름 없는 방</h3>먹선으로 그린 방. 지은 적이 없다.<br>' + (myMad() >= 12 ? '문 윤곽이 그려져 있다. 그 안쪽만 먹으로 칠해져 있다.' : '문이 없다.') + `<div style="text-align:center;margin-top:12px">${hb('bGhostLand', '그래도 터를 산다')}</div>`)), hmBind({ bGhostLand: () => hmClick(id, true) });
  if (b === 'have'){
    if (id === 'lab' && !S.bangAt) return openOv(hmBack('<h3>별채</h3>먹선만 그어져 있다. 아직 드나드는 사람이 없다.')), hmBind({});
    if (id === 'sarang' && !sarangOn()) return openOv(hmBack('<h3>사랑채</h3>먹선만 그어져 있다. 손님 맞을 일이 없어 닫아 두었다.')), hmBind({});
    ov.classList.add('hidden'); if (S.scene !== id) goScene(id); return;
  }
  if (!ps.own){
    const c = landCost(), ok = (S.money || 0) >= c;
    openOv(hmBack(`<h3>${P[1]}</h3>먹 경계만 그어진 빈 필지.<br>값: ${fmtM(c)}<br>궤짝의 엽전: ${fmtM(S.money)}` + (ok ? `<div style="text-align:center;margin-top:12px">${hb('bLand', '땅을 산다')}</div>` : `<div style="margin-top:10px;opacity:.75">${fmtM(c - (S.money || 0))} 모자란다.</div>`)));
    return hmBind({ bLand: () => { S.money -= c; S.land = S.land || {}; S.land[id] = { at: Date.now() }; ledger(`${P[1]} 땅을 삼 - ${fmtM(c)}`); sCoin(); save(); if (typeof tlog === 'function') tlog('땅 삼: ' + id); hmClick(id); } });
  }
  if (ps.building) return openOv(hmBack(`<h3>${BUILD[ps.b].name}</h3>기둥이 반쯤 섰다. 일꾼들이 서까래를 올리고 있다.<br>${Math.max(1, Math.ceil(ps.left / 60e3))}분쯤 더 걸리겠다.`)), hmBind({});
  if (ps.done){
    ov.classList.add('hidden'); if (S.scene !== ps.b) goScene(ps.b); return;   // 지은 것은 모두 들어가는 방(연구소 19_yeon · 부엌·행랑채·차밭·제다소 19_kitchen)
  }
  // 우리 땅: 올리기 · 소작
  const B = b && BUILD[b], can = B && (!B.need || built(B.need)), enough = B && (S.money || 0) >= B.cost;
  openOv(hmBack(`<h3>${P[1]}</h3>우리 땅이다.${ps.rent ? ' 지금은 소작을 주었다(하루 ' + fmtM(K.rentDay) + ').' : ''}`
    + (B ? `<br><br>${B.name}을 올릴 수 있다 — ${fmtM(B.cost)}, ${B.h}시간쯤.` + (!can ? `<br><span style="opacity:.7">${BUILD[B.need].name}이 먼저 있어야 한다.</span>` : '') : '<br><br>아직 무엇을 올릴지 모르겠다.')
    + '<div style="text-align:center;margin-top:12px">' + (B && can && enough ? hb('bBuild', `${B.name}을 올린다`) : '') + hb('bRent', ps.rent ? '소작을 거둔다' : '소작을 준다') + '</div>'
    + (B && can && !enough ? `<div style="font-size:12px;opacity:.7">${fmtM(B.cost - (S.money || 0))} 모자란다.</div>` : '')));
  hmBind({
    bBuild: () => { S.money -= B.cost; Object.assign(S.land[id], { b, end: Date.now() + B.h * hourMs(), rent:false }); ledger(`${B.name} 공사 - ${fmtM(B.cost)}`); sCoin(); save(); if (typeof tlog === 'function') tlog('공사 시작: ' + B.name); hmClick(id); },
    bRent: () => { S.land[id].rent = !ps.rent; save(); hmClick(id); },
  });
}
// 찻주전자 창: 정직한 차가 있으면 그것으로 끓임
HOOK.ov.push(() => { const h3 = (ovBody.querySelector('h3') || {}).textContent; if (h3 !== '찻주전자' || !(S.tea > 0)) return;
  const d = document.createElement('div'); d.style.cssText = 'font-size:13px;margin-top:8px'; d.textContent = `정직한 차가 ${Math.ceil(S.tea * 4) / 4}근 남았다. 끓이면 그것부터 쓴다.`; ovBody.querySelector('h3').after(d); });

HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; houseTick(); });
