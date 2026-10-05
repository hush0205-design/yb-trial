'use strict';
// ───────── 발굴 첫 판 — 여울 (10/6 선생님 "1번으로") ─────────
// 범위: 여울 한 곳만. 반장 하나(한서진·오정림) + 일반 연구원 둘. 실제 1시간. 돌아올 땐 대문 앞에 한 명씩 서 있다가 들어옴.
// 유물 셋(젖은 책 조각·13세의 붓·해초 책갈피). 실종은 없음 — 겁 없던 사람만 '조금 늦게' 돌아옴(발굴 설계.md "겁 없는 사람이 깊이 간다"의 첫 모습).
// 알림은 물건으로: 한서진의 마지막 쪽지를 읽으면 서고 문 곁에 보퉁이가 놓임 → 누르면 조사단을 꾸림. 돌아오면 궤짝 곁에 젖은 보퉁이.
const DIG_MS = 60*60e3, DIG_LATE_MS = 10*60e3, DIG_GAP_MS = 150e3, DIG_GATE_MS = 120e3;   // 한 시간 · 겁 없던 사람은 10분 늦게 · 한 명씩 2분 30초 간격 · 대문 앞에 2분
S.dig = S.dig || { n:0 };
// 보퉁이: 무명천에 싼 짐, 위에 매듭
M.bundle = model(7,7,5,(x,y,z)=>{ const r = Math.hypot(x-3, y-3); if (z === 4) return r <= 1.2 ? '#8a7a5a' : null; if (z === 3) return r <= 2.3 ? '#d8cdb0' : null; return r <= 3.2 - z*0.3 ? ((x + y + z) % 3 ? '#cfc2a3' : '#bfb08c') : null; });
M.seaBundle = model(8,8,4,(x,y,z)=>{ const r = Math.hypot(x-3.5, y-3.5); if (z === 3) return r <= 1.3 ? '#3a4a3a' : null; return r <= 3.6 - z*0.4 ? ((x*3 + y*5 + z) % 4 ? '#4e5a48' : '#3a4232') : null; });   // 젖은 보퉁이: 해초빛

const digLeader = () => ['sj', 'ojr'].filter(k => k === 'sj' ? (!!S.rArrived && !isNight() && !nightVisiting() && Date.now() - S.rArrived > T_PUSH && !S.errs.sj) : (working(k) && !S.errs[k]));
const digHands = () => genKeys().filter(k => working(k) && !S.errs[k]);
const digOn = () => Object.keys(S.errs).some(k => S.errs[k] && S.errs[k].dig);
const digName = k => k === 'sj' ? '한서진' : DEF(k).name;
const fearOf = k => k === 'sj' ? (S.rFear||0) : ((S.st[k] && S.st[k].fear)||0);

// 서고 문 곁의 보퉁이(채비) · 궤짝 곁의 젖은 보퉁이(바다에서 온 것들)
OBJ.push(
  { id:'digPack', x:34, y:-14, rot:0.2, m:()=>'bundle', show:()=> !!S.goRead && !digOn() && reveal('digPack', true), click:()=>showDigPack(), glow:()=> !S.dig.n },
  { id:'seaPack', get x(){ return S.owned.desk ? -18 : 8; }, get y(){ return S.owned.desk ? 22 : 10; }, rot:-0.3, m:()=>'seaBundle', show:()=> !!S.dig.found && reveal('seaPack', true), click:()=>showSeaPack(), glow:()=> !S.dig.seen },
);

function showDigPack(){
  if (digOn()){ openOv('<h3>보퉁이</h3>조사단이 여울에 가 있다. 돌아올 때까지 기다린다.'); return; }
  if (isNight()){ openOv('<h3>보퉁이</h3>짚신과 마른 찬, 등롱 하나. 한서진이 꾸려 둔 것이다.<br><br>밤에는 바닷가에 가지 않는다. 해가 뜨면 보낸다.'); return; }
  const L = digLeader(), H = digHands();
  const pick = { lead: L[0] || null, hands: H.slice(0, 2) };
  const render = () => {
    const row = (k, on, kind) => `<div class="rec dpick" data-k="${k}" data-kind="${kind}" style="display:flex;justify-content:space-between"><span>${digName(k)}${k === 'sj' ? '(韓瑞眞)' : `(${DEF(k).hj})`}</span><span style="opacity:.6;font-size:12px">${fearState(fearOf(k)).split(' — ')[0]}${on ? ' · 간다' : ''}</span></div>`;
    openOv(`<h3>바닷가에 갈 채비</h3>짚신과 마른 찬, 등롱 하나. 한서진이 꾸려 둔 것이다.<br>지도의 여울까지는 반나절 길. <b>반장 하나와 사람 둘</b>이 간다. ${S.dig.n ? `지금까지 ${S.dig.n}번 다녀왔다.` : ''}`
      + `<div style="font-size:12px;opacity:.55;margin-top:10px">반장</div>` + (L.length ? L.map(k => row(k, pick.lead === k, 'lead')).join('') : '<div style="opacity:.6">자리에 있는 반장이 없다.</div>')
      + `<div style="font-size:12px;opacity:.55;margin-top:10px">함께 갈 사람 (별채에서 둘)</div>` + (H.length ? H.map(k => row(k, pick.hands.includes(k), 'hand')).join('') : '<div style="opacity:.6">별채에 일하는 사람이 없다.</div>')
      + (pick.lead && pick.hands.length === 2 ? `<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bDig" style="color:var(--ink);border-color:#00000066">여울로 보낸다 — 한 시간쯤 걸린다</button></div>` : '<div style="font-size:12px;opacity:.6;margin-top:10px">반장 하나와 사람 둘을 골라야 한다.</div>')
      + '<div style="font-size:12px;opacity:.55;margin-top:8px">겁 많은 사람은 물가에서 멀리 가지 않는다. 겁 없는 사람은 깊이 들어간다.</div>');
    ovBody.querySelectorAll('.dpick').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const k = el.dataset.k;
      if (el.dataset.kind === 'lead') pick.lead = pick.lead === k ? null : k;
      else if (pick.hands.includes(k)) pick.hands = pick.hands.filter(x => x !== k); else if (pick.hands.length < 2) pick.hands = pick.hands.concat([k]);
      render(); }));
    const b = document.getElementById('bDig'); if (b) b.addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); startDig(pick.lead, pick.hands); });
  };
  render();
}

// 길: 자기 자리 → (별채면 서고로) → 서고 뒷문 → 바깥 → 대문 앞에 섬 → 서고 뒷문으로 들어와 자기 자리
function digSteps(k, awayMs, order){
  const lab = k !== 'sj', sc = lab ? 'lab' : 'seogo', side = homeSide(k);
  const out = lab ? [side, [side[0], LC], [LAB_DOOR[0], LC], LAB_DOOR] : [side, [side[0], SGC], [DOOR_POS[0], SGC], DOOR_POS];
  const steps = [{ k:'up', sc }, ...walkPts(sc, out)];
  if (lab) steps.push(...walkPts('seogo', [SG_DOOR, SG_IN, SG_HUB, [SG_HUB[0], SGC], [DOOR_POS[0], SGC], DOOR_POS]));
  steps.push(waitAt('seogo', DOOR_POS, [0, -1], 400, 'digLeave', k));
  steps.push(waitAt('away', DOOR_POS, [0, 1], awayMs));
  steps.push(waitAt('gate', [-10 + order*10, -12], [0, 1], DIG_GATE_MS, 'digGate', k));              // 대문 앞에 한 명씩
  steps.push(waitAt('seogo', DOOR_POS, [0, 1], 300, 'digIn', k));
  if (lab) steps.push(...walkPts('seogo', [DOOR_POS, [DOOR_POS[0], SGC], [SG_HUB[0], SGC], SG_HUB, SG_IN, SG_DOOR]), ...walkPts('lab', out.slice().reverse()));
  else steps.push(...walkPts('seogo', out.slice().reverse()));
  steps.push(waitAt(sc, side, [-1, 0], 10, 'digBack', k), { k:'down', sc });
  return steps;
}
function startDig(lead, hands){
  const team = [lead, ...hands], now = Date.now();
  const brave = {}; team.forEach(k => { brave[k] = fearOf(k) < FEAR_AT[2]; });                   // 떠날 때 겁이 2단계 밑이면 깊이 들어감 → 늦게 돌아옴
  const order = team.slice().sort((a, b) => fearOf(b) - fearOf(a));                               // 겁 많은 사람이 먼저 돌아옴
  team.forEach(k => { const i = order.indexOf(k);
    S.errs[k] = { t0: now, dig: true, home: true, lead: k === lead, steps: digSteps(k, DIG_MS + i*DIG_GAP_MS + (brave[k] ? DIG_LATE_MS : 0), i) }; });
  S.dig.cur = { lead, hands, t0: now, brave, back: [] }; save();
  noise(0.3, 240, 0.12, 'lowpass');
  if (typeof tlog === 'function') tlog('발굴 떠남: ' + team.map(digName).join('·'));
}
const digNote = (lines, sign) => pushNote('<h3>쪽지</h3>' + vlet(['가주께.', ...lines], sign, 'min(44vh,320px)'));
Object.assign(ERR_ACT, {
  digLeave(k){ if (S.errs[k] && S.errs[k].lead) digNote(['여울로 갑니다.', '물이 빠지는 때를 보고 들어가', '해 지기 전에 돌아오겠습니다.', `${josa(S.dig.cur.hands.map(digName).join('·'), '이', '가')} 함께 갑니다.`], k === 'sj' ? '한서진 올림.' : '오정림 올림.'); },
  digGate(k){ if (S.scene === 'gate') knock(0.8); else knock(0.4); if (typeof tlog === 'function') tlog('대문 앞: ' + digName(k)); },
  digIn(k){},
  digBack(k){
    const cur = S.dig.cur; if (!cur) return;
    const brave = cur.brave[k];
    if (k === 'sj'){ S.rFear = brave ? 0 : Math.min(1, (S.rFear||0) + 0.15); S.rN5 = false; }
    else if (S.st[k]){ S.st[k].fear = brave ? 0 : Math.min(1, (S.st[k].fear||0) + 0.15); S.st[k].n5 = false; }
    if (cur.lead === 'ojr' && !brave){ if (k === 'sj') S.rFear = Math.max(0, S.rFear - 0.1); else if (S.st[k]) S.st[k].fear = Math.max(0, S.st[k].fear - 0.1); }   // 오정림이 반장이면 덜 무서워함
    cur.back.push(k);
    S.sideLog = (S.sideLog || []).concat([['sj', brave ? `${josa(digName(k), '이', '가')} 여울에서 돌아왔다. 남들보다 늦었다. 바다가 좋았다고 한다. 손이 떨리지 않는다.` : `${josa(digName(k), '이', '가')} 여울에서 돌아왔다. 바닷바람 소리에 멀리 가지 않았다고 한다.`]]).slice(-40);
    if (k === cur.lead) digResult();
    save();
  },
});
// 반장이 돌아오면: 유물·쪽지·기록
const DIG_FINDS = [
  ['wetleaf', '젖은 책 조각', '한 장. 물에 불어 글자가 번졌다. 우리 책과 같은 종이다.'],
  ['brush13', '붓 한 자루', '바다에서 나온 붓인데 썩지 않았다. 붓걸이의 쓴 적 없는 붓과 같은 먹이 묻어 있다.'],
  ['kelp', '해초 책갈피', '마른 해초를 책갈피처럼 접은 것. 펴면 안쪽에 아주 작은 글씨가 있다.'],
];
function digResult(){
  const cur = S.dig.cur, first = !S.dig.n; S.dig.n++;
  if (first){ S.dig.found = DIG_FINDS.map(f => f[0]); S.dig.foundAt = Date.now(); if (cur.lead === 'sj') S.D += 50; }   // 한서진이 반장이면 젖은 조각의 글을 조금 읽어 냄
  const lead = cur.lead, L = ['여울에 다녀왔습니다.'];
  if (first) L.push('물이 빠진 자리에서', '세 가지를 주워 궤짝 곁에 두었습니다.', lead === 'sj' ? '젖은 장의 글은 제가 조금 읽었습니다.' : '젖은 장은 서진 씨가 보셔야겠습니다.');
  else L.push('이번엔 조개껍질뿐이었습니다.', '물이 더 빠지는 날을 기다려야겠습니다.');
  const late = Object.keys(cur.brave).filter(k => cur.brave[k]).map(digName);
  if (late.length) L.push(`${josa(late.join('·'), '은', '는')} 물속 깊이 들어가`, '늦게 나왔습니다.');
  digNote(L, lead === 'sj' ? '한서진 올림.' : '오정림 올림.');
  S.dig.log = (S.dig.log || []).concat([{ t: Date.now(), lead, hands: cur.hands, late, first }]).slice(-10);
  if (first) setTimeout(() => { const en = document.getElementById('endnote'); if (en){ en.innerHTML = '— 체험판은 여기까지입니다 —<br><span style="font-size:12px">해 보신 분은 설정 → 시험 기록 → 복사해서 보내 주시면 큰 도움이 됩니다.</span>'; en.style.opacity = 1; } }, 1500);
  if (typeof tlog === 'function') tlog('발굴 돌아옴' + (first ? '(유물 셋)' : ''));
}
function showSeaPack(){
  S.dig.seen = true; save();
  openOv('<h3>바다에서 온 것들</h3>젖은 보퉁이. 소금 냄새가 난다.<br><br>' + DIG_FINDS.filter(f => (S.dig.found || []).includes(f[0])).map(f => `<div style="margin:8px 0"><b>${f[1]}</b><br><span style="font-size:13px">${f[2]}</span></div>`).join('')
    + '<div style="font-size:12px;opacity:.6;margin-top:10px">젖은 장은 서안에 올려 읽을 수 있을 것 같다. 아직은 마르지 않았다.</div>');
}
// 붓걸이: 붓이 다섯이 됨
if ((S.dig.found || []).includes('brush13')) ITEM.brush[1] = ITEM.brush[1].replace('붓이 넷. 하나는 쓴 적이 없는데 먹이 묻어 있다.', '붓이 다섯. 하나는 쓴 적이 없는데 먹이 묻어 있고, 하나는 바다에서 왔다. 둘의 먹이 같다.');
{ const oldBack = ERR_ACT.digBack; ERR_ACT.digBack = function(k){ oldBack(k); if ((S.dig.found || []).includes('brush13') && !ITEM.brush[1].includes('다섯')) ITEM.brush[1] = ITEM.brush[1].replace('붓이 넷. 하나는 쓴 적이 없는데 먹이 묻어 있다.', '붓이 다섯. 하나는 쓴 적이 없는데 먹이 묻어 있고, 하나는 바다에서 왔다. 둘의 먹이 같다.'); }; }

// 대문 앞에 서 있는 사람(돌아오는 길): 대문 화면에서만 보이는 인형 — 거간 목록에 얹음(14_gate gateDolls가 dealerDolls를 부름)
const DIG_GATE_DOLLS = {};
function digGateDoll(k){
  if (DIG_GATE_DOLLS[k]) return DIG_GATE_DOLLS[k];
  const d = k === 'sj' ? SJ : dollFor(k);
  return (DIG_GATE_DOLLS[k] = { id:'dg_' + k, doll:true, img: d.img, imgL: d.imgL, shadow: false,
    st:()=> errPos(k) || { x:0, y:-12, pose:'stand', f:[0, 1], chair:0 }, fear:()=>fearOf(k), steam:()=>0, arrT:()=>0,
    show:()=> errScene(k) === 'gate', click:()=>openOv(`<h3>${digName(k)}</h3>대문 앞에 서 있다. 옷이 젖어 있고 소금 냄새가 난다.<br>${S.dig.cur && S.dig.cur.brave[k] ? '남들보다 늦었다. 얼굴이 환하다.' : '숨을 고르고 있다.'}<br><br>곧 들어온다.`) });
}
{ const dd = dealerDolls; dealerDolls = function(){ return [...dd(), ...Object.keys(S.errs).filter(k => S.errs[k] && S.errs[k].dig && errScene(k) === 'gate').map(digGateDoll)]; }; }

// 빈자리(또는 떠나는 사람)를 누르면
{ const ss = showStaff; showStaff = function(k){ const er = k && S.errs[k]; if (er && er.dig){ const sc = errScene(k); return openOv(`<h3>${digName(k)}</h3>${sc === 'away' ? '여울에 갔다. 자리가 비어 있다.' : sc === 'gate' ? '대문 앞에 서 있다. 바닷가에서 돌아온 것이다.' : S.dig.cur && S.dig.cur.back.includes(k) ? '여울에서 돌아와 자리로 가는 중이다.' : '보퉁이를 메고 여울로 떠나는 중이다.'}<br>${digLeft(k)}`); } return ss(k); }; }
{ const sa = showAway; showAway = function(k){ const er = S.errs[k]; if (er && er.dig) return openOv(`<h3>${digName(k)}의 자리</h3>비어 있다. 여울에 갔다.<br>${digLeft(k)}`); return sa(k); }; }
{ const sr = showResearcher; showResearcher = function(){ const er = S.errs.sj; if (er && er.dig && errScene('sj') !== 'seogo') return openOv(`<h3>연구원의 자리</h3>비어 있다. 한서진은 여울에 갔다.<br>${digLeft('sj')}`); return sr(); }; }
function digLeft(k){
  const er = S.errs[k]; let back = er.t0; for (const st of er.steps){ back += stepDur(st); if (st.k === 'wait' && st.sc === 'away') break; }
  const m = Math.max(0, Math.round((back - Date.now())/60000));
  return m > 0 ? `${m}분쯤 뒤에 대문으로 돌아온다.` : '곧 대문으로 돌아온다.';
}
// 비운 동안: 여울에 가 있는 사람은 읽지 않음
{ const lo = labOffline; labOffline = function(){ const skip = Object.keys(S.errs).filter(k => S.errs[k] && S.errs[k].dig && errNow(k)); const keep = {}; for (const k of skip){ if (S.st[k]){ keep[k] = S.st[k].arr; S.st[k].arr = 0; } } const out = lo(); for (const k of skip) if (S.st[k]) S.st[k].arr = keep[k]; return out; }; }
{ const ow = offlineWork; offlineWork = function(){ if (S.errs.sj && S.errs.sj.dig && errNow('sj')){ const a = S.rArrived; S.rArrived = 0; const r = ow(); S.rArrived = a; return r; } return ow(); }; }
// 문갑: 발굴 기록
{ const lr = labRecs; labRecs = function(recs){ lr(recs);
    if (S.dig.n) recs.push(['발굴 — 여울', () => '<h3>발굴 — 여울</h3>' + (S.dig.log || []).slice().reverse().map(e => `<div style="margin:8px 0">${new Date(e.t).getMonth()+1}월 ${new Date(e.t).getDate()}일 — 반장 ${digName(e.lead)}, ${e.hands.map(digName).join('·')}.${e.first ? ' 젖은 책 조각·붓·해초 책갈피를 주움.' : ' 조개껍질뿐.'}${e.late.length ? ` ${josa(e.late.join('·'), '은', '는')} 늦게 나옴.` : ''}</div>`).join('')]); }; }
DRAWERS.push(['다섯째 서랍 — 바다에서 온 것', /발굴/]);
// 시험용: 구간 18 — 돌아오기 직전부터
if (S.digJump){ delete S.digJump; const L = digLeader(), H = digHands(); if (L.length && H.length >= 2){ startDig(L[0], H.slice(0, 2)); const back = DIG_MS - 20000; for (const k of [L[0], ...H.slice(0, 2)]) S.errs[k].t0 = Date.now() - back; S.dig.cur.t0 = Date.now() - back; save(); } }
// 한서진의 마지막 쪽지: 끝 표시는 이제 발굴에서 돌아온 뒤에
readGo = function(){
  S.goRead = true; save();
  openOv('<h3>쪽지</h3>' + vlet(['가주께.', '사람이 늘었습니다.', '새로 온 이들도 손이 제법입니다.', '정림 씨가 차를 맡아 주니', '이제 바닷가에 가 볼 수 있겠습니다.', '날을 잡아 주십시오.', '', '채비는 문 곁에 두었습니다.'], '한서진 올림.'));
  if (typeof tlog === 'function') tlog('바닷가 쪽지');
};
