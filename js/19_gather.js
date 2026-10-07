'use strict';
// ───────── 조사단 꾸리기 — '딸깍'에서 과정으로 (발굴 설계 '조사단 꾸리기' ①②④, 10/7 선생님 · 10/8 만듦) ─────────
// ① 채비는 물건이 있는 자리에서 보퉁이에 넣음: 등잔 → 등롱(기름 2전) / 붓걸이 → 종이와 붓(2전) / 책장 위 지도 / 별채 다탁 → 마른 찬(오정림이 있으면 공짜, 전엔 보퉁이에서 장에서 사 옴 3전).
//    한서진이 자리에 있으면 일어나 가져다 담음(심부름 엔진, 손에 든 것이 보임). 없으면 가주가 바로 넣음. 보퉁이는 채운 만큼 불룩해짐(0 / 1~2 / 3~4).
// ② 보퉁이에 처음 무엇이 들어가면 반장(한서진, 없으면 오정림)이 의논 쪽지 — 쪽지 문장 속 이름을 눌러 고름(먹점 ●, 둘). 겁이 4단계 넘는 사람은 "오늘은 두는 게 좋겠습니다". 다른 반장 자리에서 "네가 가라".
// ④ 둘이 정해지면 셋이 대문 앞에 모여 섬(반장이 보퉁이를 멤). 가주가 대문을 눌러 '열어 준다' → 떠남. 밤이면 "해 뜨면 열어 주겠다"(7시에 저절로). '보낸다' 단추 없음.
// 채비가 하는 일(여울): 마른 찬 없음 → 반나절 만에 돌아옴(시간 절반) / 종이와 붓 없음 → 젖은 장을 못 가져옴 / 지도 없음 → 반은 여울을 못 찾고 허탕 (등롱은 바위·굴부터) / 지도는 보낸 동안 서고에서 못 봄.
// 떠난 뒤(1시간·대문 앞 한 명씩·유물)는 19_dig 그대로. 시험용 digQuickSend()는 이 과정을 건너뜀.
S.pack = S.pack || {};                                              // { lamp:'in'|'carry', food, paper, map }
const PACK = {
  lamp:  { name:'등롱(기름)', cost:20, from:'등잔', model:'lantern' },
  food:  { name:'마른 찬',   cost:30, from:'별채 다탁', model:'foodWrap' },
  paper: { name:'종이와 붓', cost:20, from:'붓걸이', model:'paperRoll' },
  map:   { name:'지도',      cost:0,  from:'책장', model:'mapFold' },
};
const PACK_STAND = [30, -9];                                        // 서고 뒷문 곁 보퉁이 앞에 서는 자리
M.lantern  = model(5,5,8,(x,y,z)=> z === 0 || z === 7 ? '#4a3020' : (x === 2 && y === 2) ? '#e8a040' : ((x === 0 || x === 4 || y === 0 || y === 4) && (x + y) % 2 ? '#e8dcc0' : null));
M.foodWrap = model(6,5,3,(x,y,z)=> z === 2 ? ((x === 2 || x === 3) && y === 2 ? '#8a7a5a' : null) : ((x + y + z) % 3 ? '#bfb08c' : '#cfc2a3'));
M.paperRoll = model(7,3,3,(x,y,z)=> (x === 0 || x === 6) ? '#cfc2a3' : (z === 1 && y === 1) ? null : '#e2d6b8');
M.bundleFlat = model(8,8,1,(x,y)=> Math.hypot(x-3.5, y-3.5) <= 3.8 ? ((x + y) % 3 ? '#cfc2a3' : '#bfb08c') : null);
M.bundleFull = model(9,9,7,(x,y,z)=>{ const r = Math.hypot(x-4, y-4); if (z === 6) return r <= 1.3 ? '#8a7a5a' : null; if (z === 5) return r <= 2.6 ? '#d8cdb0' : null; return r <= 4.3 - z*0.35 ? ((x + y + z) % 3 ? '#cfc2a3' : '#bfb08c') : null; });
const packCount = () => Object.keys(PACK).filter(id => S.pack[id] === 'in').length;
const packAll = () => Object.keys(PACK).filter(id => S.pack[id]).length;
const canPack = () => !!S.goRead && !digOn();
const sjFree = () => !!S.rArrived && !isNight() && !nightVisiting() && Date.now() - S.rArrived > T_PUSH && !S.errs.sj;
const ojrHere = () => working('ojr') && !!S.potPut;
{ const dp = OBJ.find(o => o.id === 'digPack'); dp.m = () => { const n = packAll(); return n === 0 ? 'bundleFlat' : n <= 2 ? 'bundle' : 'bundleFull'; }; dp.glow = () => !S.dig.n && !packAll(); }

// ── ① 채비 넣기 ──
function packPut(id){
  if (S.pack[id] || !canPack()) return;
  const P = PACK[id], free = id === 'food' && ojrHere(), cost = free ? 0 : P.cost;
  if (cost && (S.money || 0) < cost){ openOv(`<h3>${P.name}</h3>엽전이 모자란다. ${fmtM(cost)}이 든다.`); return; }
  if (cost){ S.money -= cost; ledger(`채비 — ${P.name} −${fmtM(cost)}`); sCoin(); }
  if (id === 'map') S.mapWasAt = S.loc.map;
  if (sjFree() && (id !== 'food' || free)){ S.pack[id] = 'carry'; packErrand(id); }
  else { S.pack[id] = 'in'; if (id === 'map') S.loc.map = 'pack'; packFirstNote(); }
  if (typeof tlog === 'function') tlog('채비: ' + P.name); save(); ov.classList.add('hidden'); sPlace();
}
function packErrand(id){
  const side = homeSide('sj'), m = PACK[id].model, steps = [{ k:'up', sc:'seogo' }];
  let cur = side;
  const go = (sc, pts, carry) => { steps.push(...walkPts(sc, [cur, ...pts], carry)); cur = pts[pts.length - 1]; };
  if (id === 'food'){
    go('seogo', [[side[0], SGC], [SG_HUB[0], SGC], SG_HUB, SG_IN, SG_DOOR]); cur = LAB_DOOR;
    go('lab', [[LAB_DOOR[0], LC], TEA_STAND]); steps.push(waitAt('lab', TEA_STAND, [0.8, -0.6], 900, 'packTake', id));
    go('lab', [[LAB_DOOR[0], LC], LAB_DOOR], m); cur = SG_DOOR;
    go('seogo', [SG_IN, SG_HUB, [SG_HUB[0], SGC], [PACK_STAND[0], SGC], PACK_STAND], m);
  } else {
    const L = OBJ.find(o => o.id === 'lamp'), src = id === 'lamp' ? [L.x + 4, L.y + 6] : id === 'paper' ? [2.5, -13] : (S.loc.map === 'shelf' ? [-22, -9.5] : S.loc.map === 'desk' ? [-6, -6] : side);
    go('seogo', [[side[0], SGC], [src[0], SGC], src]); steps.push(waitAt('seogo', src, [0, -1], 900, 'packTake', id));
    go('seogo', [[src[0], SGC], [PACK_STAND[0], SGC], PACK_STAND], m);
  }
  steps.push(waitAt('seogo', PACK_STAND, [0.3, -0.95], 700, 'packIn', id, m));
  go('seogo', [[PACK_STAND[0], SGC], [side[0], SGC], side]);
  steps.push({ k:'down', sc:'seogo' });
  S.errs.sj = { t0: Date.now(), steps };
}
Object.assign(ERR_ACT, {
  packTake(id){ if (id === 'map') S.loc.map = 'pack'; if (S.scene === (id === 'food' ? 'lab' : 'seogo')) noise(0.12, 700, 0.04); },
  packIn(id){ S.pack[id] = 'in'; if (S.scene === 'seogo') sPlace(); packFirstNote(); },
});
// 물건 자리의 창에 '보퉁이에 넣는다' 단추를 덧붙임
function packBtn(id){
  if (!canPack() || S.pack[id]) return;
  const P = PACK[id], free = id === 'food' && ojrHere(), cost = free ? 0 : P.cost;
  const c = ovBody.querySelector('.close'); if (!c) return;
  c.insertAdjacentHTML('beforebegin', `<div style="text-align:center;margin-top:12px"><button class="btn rec" id="bPack" style="color:var(--ink);border-color:#00000066">${{ lamp:'등롱에 기름을 담아 보퉁이에 넣는다', food:'마른 찬을 싸서 보퉁이에 넣는다', paper:'종이와 붓을 보퉁이에 넣는다', map:'지도를 보퉁이에 넣는다' }[id]}${cost ? ' — ' + fmtM(cost) : ''}</button></div>`
    + (id === 'map' ? '<div style="font-size:12px;opacity:.55;text-align:center;margin-top:4px">보낸 동안은 서고에서 지도를 볼 수 없다.</div>' : ''));
  document.getElementById('bPack').addEventListener('click', ev => { ev.stopPropagation(); packPut(id); });
}
{ const si0 = showItem; showItem = function(id){ si0(id); if (id === 'lamp') packBtn('lamp'); if (id === 'brush') packBtn('paper'); }; }
{ const sp0 = showPlace; showPlace = function(id){ sp0(id); if (id === 'map') packBtn('map'); }; }
{ const dt = LAB_OBJ.find(o => o.id === 'dtak'), c0 = dt.click; dt.click = () => { c0(); if (ojrHere()) packBtn('food'); }; }
{ const tp = LAB_OBJ.find(o => o.id === 'labTeapot'), c0 = tp.click; tp.click = () => { c0(); if (ojrHere()) packBtn('food'); }; }

// ── 보퉁이 창 ──
function showDigPack(){
  if (S.dig.gather){ openOv('<h3>보퉁이</h3>' + digName(S.dig.gather.lead) + '이 메고 대문 앞에 나가 있다.'); return; }
  if (digOn()){ openOv('<h3>보퉁이</h3>조사단이 여울에 가 있다. 돌아올 때까지 기다린다.'); return; }
  const n = packCount(), rows = Object.keys(PACK).map(id => { const st = S.pack[id];
    return `<div class="brow" style="cursor:default"><span class="bt">${PACK[id].name}</span><span class="bn" style="font-size:12px;opacity:.7">${st === 'in' ? '들어 있다' : st === 'carry' ? '한서진이 가져오는 중' : (id === 'food' && !ojrHere() ? '<span class="rec" id="bFoodBuy" style="opacity:.9">장에서 사 온다 — ' + fmtM(PACK.food.cost) + '</span>' : PACK[id].from + '에서 넣는다')}</span></div>`; }).join('');
  const pk = S.dig.pick || {}, lead = pk.lead || digLeadDefault(), hands = (pk.hands || []).filter(k => working(k));
  const who = n || packAll() ? `<div class="bsec">함께 갈 사람</div><div style="font-size:14px">반장: ${lead ? digName(lead) : '자리에 있는 반장이 없다'}${hands.length ? ' · ' + hands.map(digName).join(' · ') : ''}</div>`
    + (hands.length < 2 ? '<div style="font-size:12px;opacity:.6;margin-top:4px">반장의 쪽지에서 이름을 짚어야 한다.</div>' : '<div style="font-size:12px;opacity:.6;margin-top:4px">둘이 정해졌다. 곧 대문 앞에 모인다.</div>')
    + (lead ? '<div class="rec" id="bTalk" style="text-align:center;font-size:13px;opacity:.75;margin-top:8px">반장의 쪽지를 본다</div>' : '') : '';
  openOv(`<h3>바닷가에 갈 채비</h3>${n || packAll() ? `보퉁이에 ${KNUM[n] || n} 가지가 들어 있다.` : '빈 보퉁이. 한서진이 무명천을 펴 두었다.<br>넣을 것은 그 물건이 있는 자리에서 넣는다.'}${S.dig.n ? ` 지금까지 ${S.dig.n}번 다녀왔다.` : ''}<div class="bsec">채비</div>${rows}${who}`
    + '<div style="font-size:12px;opacity:.55;margin-top:10px">마른 찬이 없으면 반나절 만에 돌아온다. 종이와 붓이 없으면 글이 있는 것을 못 가져온다. 지도가 없으면 여울을 못 찾을 수 있다.</div>');
  const fb = document.getElementById('bFoodBuy'); if (fb) fb.addEventListener('click', ev => { ev.stopPropagation(); packPut('food'); });
  const bt = document.getElementById('bTalk'); if (bt) bt.addEventListener('click', ev => { ev.stopPropagation(); openOv(digTalkHtml()); });
}

// ── ② 반장의 의논 쪽지 ──
const digLeadDefault = () => (!!S.rArrived && !isNight() && !nightVisiting() && Date.now() - S.rArrived > T_PUSH) ? 'sj' : (working('ojr') ? 'ojr' : null);   // 쪽지를 쓸 반장(심부름 중이어도)
const gname = k => k === 'sj' ? '서진' : k === 'ojr' ? '정림' : DEF(k).name.slice(1);
function digClause(k){
  const f = fearOf(k), P = DEF(k), nm = gname(k);
  if (f >= FEAR_AT[4]) return josa(nm, '은', '는') + ' 오늘은 두는 게 좋겠습니다.';
  if (P.lines && P.lines[0].includes('갈두포')) return josa(nm, '은', '는') + ' 물가 사람이라 물을 압니다.';
  if (f < FEAR_AT[2]) return josa(nm, '은', '는') + ' 겁이 없습니다. 깊이 들어갈 것입니다.';
  if (P.sec && P.sec >= 6) return josa(nm, '은', '는') + ' 꼼꼼하나 겁이 조금 있습니다.';
  return josa(nm, '은', '는') + ' 손이 빠릅니다. 물가는 처음입니다.';
}
function packFirstNote(){
  if (S.dig.talked || packCount() < 1) return;
  const lead = digLeadDefault(); if (!lead) return;
  S.dig.talked = true; S.dig.pick = S.dig.pick || { lead, hands: [] };
  S.dig.pick.hands = [];                                              // 먹점은 가주가 직접 — 반장은 말로만 추천
  pushNote(digTalkHtml()); save();
}
function digTalkHtml(){
  const pk = S.dig.pick || { hands: [] }, lead = pk.lead || digLeadDefault(), H = digHands();
  const cand = H.map(k => { const f = fearOf(k), on = pk.hands.includes(k), no = f >= FEAR_AT[4];
    return `<span class="dpk${no ? ' no' : ''}" data-k="${k}" style="${no ? 'opacity:.6' : 'border-bottom:1px dotted #00000066;cursor:pointer'}">${on ? '●' : ''}${digClause(k)}</span>`; });
  const rec = H.filter(k => fearOf(k) < FEAR_AT[4]).sort((a, b) => fearOf(a) - fearOf(b)).slice(0, 2), picked = pk.hands.filter(k => H.includes(k)).length;
  const lines = ['가주께.', '보퉁이를 꾸리시는 걸 보았습니다.', H.length ? '누구를 데려갈까요.' : '별채에 데려갈 사람이 없습니다.', ...cand,
    rec.length === 2 && picked < 2 ? `제 생각엔 ${gname(rec[0])}${/[가-힣]/.test(gname(rec[0]).slice(-1)) && (gname(rec[0]).charCodeAt(gname(rec[0]).length - 1) - 0xAC00) % 28 ? '과' : '와'} ${gname(rec[1])}입니다.` : '',
    H.length ? '이름을 짚어 주십시오. 둘이면 됩니다.' : '', picked >= 2 ? '그럼 대문 앞에 모이겠습니다.' : ''].filter(Boolean);
  return '<h3>쪽지</h3>' + vlet(lines, (lead === 'ojr' ? '오정림' : '한서진') + ' 올림.', 'min(56vh,400px)');
}
ovBody.addEventListener('click', e => {                               // 쪽지 속 이름을 누르면 먹점
  const el = e.target.closest('.dpk'); if (!el || el.classList.contains('no')) return;
  e.stopPropagation(); if (digOn()) return;
  const k = el.dataset.k; S.dig.pick = S.dig.pick || { lead: digLeadDefault(), hands: [] };
  if (S.dig.pick.hands.includes(k)) S.dig.pick.hands = S.dig.pick.hands.filter(x => x !== k);
  else if (S.dig.pick.hands.length < 2) S.dig.pick.hands.push(k);
  else S.dig.pick.hands = [S.dig.pick.hands[1], k];
  save(); openOv(digTalkHtml()); noise(0.08, 900, 0.04);
});
// 다른 반장 자리에서 "네가 가라"
function leadBtn(k){
  if (!canPack() || !packAll() || !S.dig.pick || S.dig.pick.lead === k || !digLeader().includes(k)) return;
  const c = ovBody.querySelector('.close'); if (!c) return;
  c.insertAdjacentHTML('beforebegin', `<div style="text-align:center;margin-top:12px"><button class="btn rec" id="bLead" style="color:var(--ink);border-color:#00000066">여울에는 네가 가라</button></div>`);
  document.getElementById('bLead').addEventListener('click', ev => { ev.stopPropagation(); S.dig.pick.lead = k; save(); ov.classList.add('hidden'); sPlace(); });
}
{ const ss = showStaff; showStaff = function(k){ const er = k && S.errs[k]; if (er && er.gather) return openOv(`<h3>${digName(k)}</h3>대문 앞에 모여 있다. 떠나기를 기다린다.`); ss(k); if (k === 'ojr') leadBtn('ojr'); }; }
{ const sr = showResearcher; showResearcher = function(){ const er = S.errs.sj; if (er && er.gather) return openOv('<h3>연구원의 자리</h3>비어 있다. 한서진은 보퉁이를 메고 대문 앞에 나가 있다.'); sr(); leadBtn('sj'); }; }
{ const sa = showAway; showAway = function(k){ const er = S.errs[k]; if (er && er.gather) return openOv(`<h3>${digName(k)}의 자리</h3>비어 있다. 대문 앞에 모여 있다.`); return sa(k); }; }

// ── ④ 대문 앞에 모임 → 가주가 열어 줌 ──
function gatherTick(){
  if (S.dig.gather || digOn() || !S.dig.pick || !packCount() || isNight()) return;
  const pk = S.dig.pick, lead = pk.lead && digLeader().includes(pk.lead) ? pk.lead : null, hands = pk.hands.filter(k => digHands().includes(k));
  if (!lead || hands.length < 2) return;
  if (!pk.at){ pk.at = Date.now(); save(); return; } if (Date.now() - pk.at < 2500) return;   // 쪽지를 닫고 잠깐 뒤
  startGather(lead, hands);
}
function startGather(lead, hands){
  const team = [lead, ...hands], now = Date.now();
  team.forEach((k, i) => {
    const labk = k !== 'sj', sc = labk ? 'lab' : 'seogo', side = homeSide(k);
    const out = labk ? [side, [side[0], LC], [LAB_DOOR[0], LC], LAB_DOOR] : [side, [side[0], SGC], [DOOR_POS[0], SGC], DOOR_POS];
    const steps = [{ k:'up', sc }, ...walkPts(sc, out, k === lead ? 'bundle' : null)];
    if (labk) steps.push(...walkPts('seogo', [SG_DOOR, SG_IN, SG_HUB, [SG_HUB[0], SGC], [DOOR_POS[0], SGC], DOOR_POS]));
    steps.push(waitAt('gate', [-10 + i*10, -12], [0, 1], 1e12, null, null, k === lead ? 'bundle' : null));
    S.errs[k] = { t0: now, dig: true, gather: true, home: true, lead: k === lead, steps };
  });
  S.dig.gather = { lead, hands, t0: now }; S.dig.pick = null; save();
  if (typeof tlog === 'function') tlog('대문 앞에 모임: ' + team.map(digName).join('·'));
}
function digDepart(){
  const g = S.dig.gather; if (!g) return;
  const team = [g.lead, ...g.hands], now = Date.now(), pack = Object.assign({}, S.pack), food = pack.food === 'in';
  const brave = {}; team.forEach(k => { brave[k] = fearOf(k) < FEAR_AT[2]; });
  const order = team.slice().sort((a, b) => fearOf(b) - fearOf(a));
  team.forEach(k => { const i = order.indexOf(k), steps = digSteps(k, (DIG_MS + i*DIG_GAP_MS + (brave[k] ? DIG_LATE_MS : 0)) * (food ? 1 : 0.5), i);
    const ai = steps.findIndex(st => st.k === 'wait' && st.sc === 'away'); let pre = 0; for (let j = 0; j < ai; j++) pre += stepDur(steps[j]);
    S.errs[k] = { t0: now - pre, dig: true, home: true, lead: k === g.lead, steps, done: ai }; });
  S.dig.cur = { lead: g.lead, hands: g.hands, t0: now, brave, back: [], pack }; S.dig.gather = null; S.dig.talked = false;
  S.pack = {}; save();
  sDoor(); ERR_ACT.digLeave(g.lead);
  if (typeof tlog === 'function') tlog('발굴 떠남: ' + team.map(digName).join('·') + ' / 채비 ' + Object.keys(pack).filter(id => pack[id] === 'in').map(id => PACK[id].name).join('·'));
}
{ const gate = GATE_OBJ.find(o => o.id === 'gate'), c0 = gate.click; gate.click = () => {
    if (!S.dig.gather) return c0();
    const g = S.dig.gather, night = isNight();
    openOv(`<h3>대문</h3>대문 앞에 셋이 서 있다. 보퉁이를 멘 ${digName(g.lead)}이 이쪽을 본다.<br>${night ? (g.dawn ? '밤이다. 해 뜨면 열어 주기로 했다.' : '밤이다. 밤에는 바닷가에 가지 않는다.') : '바람이 바다 쪽에서 분다.'}`
      + `<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bOpenGate" style="color:var(--ink);border-color:#00000066">${night ? (g.dawn ? '들어간다' : '해 뜨면 열어 주겠다') : '대문을 열어 준다'}</button></div>`);
    document.getElementById('bOpenGate').addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden');
      if (!night) digDepart(); else if (!g.dawn){ g.dawn = true; save(); } });
  }; }
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return;
  for (const id of Object.keys(PACK)) if (S.pack[id] === 'carry' && !S.errs.sj){ S.pack[id] = 'in'; if (id === 'map') S.loc.map = 'pack'; packFirstNote(); save(); }   // 심부름이 끊겼어도 넣은 것으로
  gatherTick();
  if (S.dig.gather && S.dig.gather.dawn && !isNight() && gameHour() >= 7) digDepart(); });        // 해 뜨면 저절로
// 모여 선 사람의 인형 글(19_dig digGateDoll의 글을 모임 때만 바꿈)
{ const dd0 = digGateDoll; digGateDoll = function(k){ const d = dd0(k); if (!d._g){ d._g = true; const c0 = d.click;
    d.click = () => { const er = S.errs[k]; if (er && er.gather) return openOv(`<h3>${digName(k)}</h3>${er.lead ? '보퉁이를 메고 ' : ''}대문 앞에 서 있다. 가주가 문을 열어 주기를 기다린다.${isNight() ? '<br>밤이라 바닷가에는 가지 않는다.' : ''}`); c0(); }; } return d; }; }

// ── 돌아온 뒤: 채비에 따라 결과가 다름 (19_dig digResult를 이것으로) ──
digResult = function(){
  const cur = S.dig.cur, pack = cur.pack || { lamp:'in', food:'in', paper:'in', map:'in' }, first = !S.dig.n, lead = cur.lead;
  const lost = pack.map !== 'in' && (cur.lost != null ? cur.lost : (cur.lost = Math.random() < 0.5));
  if (S.loc && S.loc.map === 'pack') S.loc.map = S.mapWasAt || 'shelf';
  const L = [], late = Object.keys(cur.brave).filter(k => cur.brave[k]).map(digName);
  if (lost){ L.push('여울을 찾지 못했습니다.', '물길이 갈라지는 데서 한나절을 헤맸습니다.', '지도가 있어야겠습니다.'); }
  else {
    S.dig.n++; L.push('여울에 다녀왔습니다.');
    if (first){
      const finds = DIG_FINDS.map(f => f[0]).filter(id => pack.paper === 'in' || id !== 'wetleaf');
      S.dig.found = finds; S.dig.foundAt = Date.now();
      if (typeof seaGot === 'function') seaGot(finds);
      if (finds.includes('wetleaf') && lead === 'sj' && typeof wetEnd === 'function') S.wD = Math.max(S.wD || 0, Math.round(wetEnd() / 2));   // 한서진이 반장이면 젖은 장이 반쯤 풀려 옴(19_sea)
      L.push('물이 빠진 자리에서', `${['', '한', '두', '세'][finds.length] || finds.length} 가지를 주워 궤짝 곁에 두었습니다.`);
      if (pack.paper === 'in') L.push(lead === 'sj' ? '젖은 장의 글은 제가 조금 읽었습니다.' : '젖은 장은 서진 씨가 보셔야겠습니다.');
      else L.push('글이 적힌 젖은 장도 있었으나', '종이가 없어 그대로 두고 왔습니다.');
    } else if (pack.paper === 'in' && !(S.dig.found || []).includes('wetleaf')){         // 처음에 종이가 없어 두고 온 젖은 장을 이번엔 싸 옴
      S.dig.found = (S.dig.found || []).concat(['wetleaf']); S.dig.wetAt = Date.now(); if (typeof seaGot === 'function') seaGot(['wetleaf']); if (lead === 'sj' && typeof wetEnd === 'function') S.wD = Math.max(S.wD || 0, Math.round(wetEnd() / 2));
      L.push('지난번 두고 온 젖은 장을', '이번엔 종이에 싸 왔습니다.', S.relicBox ? '바다 궤에 넣어 두었습니다.' : '궤짝 곁에 두었습니다.');
    } else { S.sea = S.sea || { kelp:0, shell:0 }; S.sea.shell = (S.sea.shell || 0) + 2 + Math.floor(Math.random() * 3);
      L.push('이번엔 조개껍질뿐이었습니다.', ...(S.relicBox ? ['바다 궤에 넣어 두었습니다.'] : []), '물이 더 빠지는 날을 기다려야겠습니다.'); }
    if (pack.food !== 'in') L.push('찬이 없어 일찍 돌아왔습니다.');
    if (late.length) L.push(`${josa(late.join('·'), '은', '는')} 물속 깊이 들어가`, '늦게 나왔습니다.');
  }
  digNote(L, lead === 'sj' ? '한서진 올림.' : '오정림 올림.');
  S.dig.log = (S.dig.log || []).concat([{ t: Date.now(), lead, hands: cur.hands, late, first: first && !lost, lost, pack }]).slice(-10);
  if (first && !lost) setTimeout(() => { const en = document.getElementById('endnote'); if (en){ en.innerHTML = '— 체험판은 여기까지입니다 —<br><span style="font-size:12px">해 보신 분은 설정 → 시험 기록 → 복사해서 보내 주시면 큰 도움이 됩니다.</span>'; en.style.opacity = 1; } }, 1500);
  if (typeof tlog === 'function') tlog('발굴 돌아옴' + (lost ? '(허탕)' : first ? '(유물)' : ''));
};
// 시험용·구간 18: 과정을 건너뛰고 바로 보냄(채비 넷 다)
function digQuickSend(){
  const L = digLeader().length ? digLeader() : (S.rArrived ? ['sj'] : ['ojr']), H0 = digHands(), H = H0.length >= 2 ? H0 : genKeys().filter(k => S.st[k] && S.st[k].arr && !S.st[k].gone).slice(0, 2);
  if (!L.length || H.length < 2) return false;
  S.pack = { lamp:'in', food:'in', paper:'in', map:'in' }; S.dig.pick = null; S.dig.talked = false;
  startDig(L[0], H.slice(0, 2)); return true;
}

// 시험용 구간 18(20_main JUMPS) — 19_dig에서 옮겨 옴
if (S.digJump){ delete S.digJump;                                  // 시험용 구간 18: 꾸리기를 건너뛰고(digQuickSend, 19_gather) 첫 사람이 20초 뒤 대문 앞에(그다음 15초씩)
  if (digQuickSend()){ const cur = S.dig.cur;
    [cur.lead, ...cur.hands].forEach((k, i) => { const er = S.errs[k]; let pre = 0; for (const st of er.steps){ if (st.k === 'wait' && st.sc === 'gate') break; pre += stepDur(st); } er.t0 = Date.now() + 20000 + i*15000 - pre; });
    cur.t0 = Date.now() - DIG_MS + 20000; save(); } }
// 한서진의 마지막 쪽지: 끝 표시는 이제 발굴에서 돌아온 뒤에
readGo = function(){
  S.goRead = true; save();
  openOv('<h3>쪽지</h3>' + vlet(['가주께.', '사람이 늘었습니다.', '새로 온 이들도 손이 제법입니다.', '정림 씨가 차를 맡아 주니', '이제 바닷가에 가 볼 수 있겠습니다.', '날을 잡아 주십시오.', '', '채비는 문 곁에 두었습니다.'], '한서진 올림.'));
  if (typeof tlog === 'function') tlog('바닷가 쪽지');
};
