'use strict';
// ───────── 가주가 하루에 한 번쯤 들어와 살피는 일 (10/5 선생님: 1·2·4) ─────────
// ① 오정림의 차는 3단계(간을 졸임)까지만 달램 — 4단계부터는 가주가 직접(차를 내주거나 쉬라고 일러 보냄)
// ② 가주의 하루 순회: 하루 첫 별채 걸음에 모두 겁이 한 단계 내려가고, 그날은 손이 조금 빠름
// ④ 한서진의 아침 보고: 새 날 첫 쪽지 — 어제 넘긴 양·집에 간 사람·오늘 맡길 만한 것. 가주가 직접 맡긴 사람은 그날 손이 빠름
const OJR_MAX = FEAR_AT[4];                            // 이보다 겁이 크면 오정림의 차로는 안 됨(4단계)
const visitBoost = () => S.visitDay === dayKey() ? 1.1 : 1;
const manBoost = s => s && s.manDay === dayKey() ? 1.1 : 1;

// ① 쉬라고 일러 보냄: 30분 쉬고 겁 없이 돌아옴(집에 간 횟수에 들지 않음)
Object.assign(ERR_ACT, {
  restLeave(){},
  restBack(k){ if (k === 'sj') S.rFear = 0; else if (S.st[k]) { S.st[k].fear = 0; S.st[k].n5 = false; } },
});
function sendRest(k){
  const lab = k !== 'sj', sc = lab ? 'lab' : 'seogo', door = lab ? LAB_DOOR : DOOR_POS, side = homeSide(k);
  const out = lab ? [side, [side[0], LC], [door[0], LC], door] : [side, [side[0], SGC], [door[0], SGC], door];
  S.errs[k] = { t0: Date.now(), home: true, rest: true, steps: [{ k:'up', sc }, ...walkPts(sc, out), waitAt(sc, door, [0, -1], 300, 'restLeave', k),
    waitAt('away', door, [0, 1], HOME_MS), ...walkPts(sc, out.slice().reverse()), waitAt(sc, side, [-1, 0], 10, 'restBack', k), { k:'down', sc }] };
  save(); if (S.scene === sc) sChair(0.1);
  if (typeof tlog === 'function') tlog('쉬라고 보냄: ' + (k === 'sj' ? '한서진' : DEF(k).name));
}
const restBox = (k, f) => {
  const st = fearStage(f); if (st < 2) return '';
  return (st >= 4 ? '<div style="font-size:12px;opacity:.75;margin-top:8px">간이 너무 오그라들어 오정림의 차로는 달래지지 않는다. 가주가 직접 살펴야 한다.</div>' : '')
    + `<div style="text-align:center;margin-top:8px"><button class="btn rec" id="bRest" style="color:var(--ink);border-color:#00000066">오늘은 들어가 쉬라고 한다</button></div><div style="font-size:11px;opacity:.55;text-align:center">30분쯤 쉬고 겁을 털고 돌아온다.</div>`;
};
function addRest(k, f){
  const h = restBox(k, f); if (!h) return;
  const d = document.createElement('div'); d.innerHTML = h; const dm = document.getElementById('bDismiss'); ovBody.insertBefore(d, dm ? dm.parentNode : ovBody.querySelector('.close'));   // '내보낸다'보다 위에
  document.getElementById('bRest').addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); sendRest(k); });
}
{ const ss3 = showStaff; showStaff = function(k){ ss3(k); if (k && S.st[k] && !S.st[k].gone && !S.errs[k] && working(k)) addRest(k, S.st[k].fear); }; }
{ const sr3 = showResearcher; showResearcher = function(){ sr3(); if (S.rArrived && !S.errs.sj && !isNight()) addRest('sj', S.rFear); }; }
// 쉬러 간 사람 자리
{ const sa = showAway; showAway = function(k){ if (S.errs[k] && S.errs[k].rest) return openOv(`<h3>${DEF(k).name}의 자리</h3>비어 있다. 가주가 쉬라고 일러 보냈다.<br>30분쯤 뒤에 돌아온다.`); return sa(k); }; }

// ② 하루 순회
{ const gs = goScene; goScene = function(sc){
    gs(sc);
    if (sc !== 'lab' || S.visitDay === dayKey()) return;
    const here = allKeys().filter(k => working(k) && !S.errs[k]);
    if (!here.length) return;
    S.visitDay = dayKey();
    for (const k of here) S.st[k].fear = Math.max(0, (S.st[k].fear||0) - 0.15);
    if (S.rArrived && !isNight()) S.rFear = Math.max(0, (S.rFear||0) - 0.15);
    if (arrived('ojr')) S.sideLog = (S.sideLog || []).concat([['ojr', '가주께서 별채에 다녀가셨다. 다들 조금 편해 보인다. 오늘은 손이 가볍다.']]).slice(-40);
    save(); if (typeof tlog === 'function') tlog('가주 순회');
  }; }

// ④ 한서진의 아침 보고
const dayStat = () => (S.dayStat = S.dayStat || { day: dayKey(), earned0: S.earned || 0, home: [], quit: [] });
function statNote(kind, name){ const d = dayStat(); if (d.day !== dayKey()) return; d[kind].push(name); }
Object.assign(ERR_ACT, (() => { const lv = ERR_ACT.leave; return { leave(k){ const quitting = k !== 'sj' && isGen(k) && homeN(k) >= 3; lv(k); statNote(quitting ? 'quit' : 'home', k === 'sj' ? '한서진' : DEF(k).name); } }; })());
function morningTick(){
  const d = dayStat();
  if (d.day === dayKey() || S.morningDay === dayKey()) return;            // 하루에 한 장만(새로고침이 겹쳐도)
  if (!S.rArrived || isNight() || S.errs.sj) return;                       // 한서진이 자리에 있을 때 씀
  S.morningDay = dayKey();
  const pages = Math.max(0, (S.earned||0) - d.earned0);
  const ks = allKeys().filter(k => arrived(k) && S.st[k] && !S.st[k].gone);
  const scared = ks.filter(k => isGen(k)).sort((a, b) => (S.st[b].fear||0) - (S.st[a].fear||0))[0];
  const fast = ks.filter(k => isGen(k)).sort((a, b) => DEF(a).sec - DEF(b).sec)[0];
  const L = ['가주께. 아침 보고 올립니다.'];
  if (S.awayNoted !== dayKey()) L.push(`어제 서고와 별채에서 넘긴 것이 ${fmtP(pages)}입니다.`);   // 오늘 아침 '안 계신 동안' 쪽지가 이미 숫자를 말했으면 되풀이하지 않음(10/6 선생님)
  if (d.home.length) L.push(`${josa([...new Set(d.home)].join('·'), '이', '가')} 겁에 질려 집에 다녀왔습니다.`);
  if (d.quit.length) L.push(`${josa([...new Set(d.quit)].join('·'), '은', '는')} 그만두고 떠났습니다.`);
  if (scared && fearStage(S.st[scared].fear) >= 2) L.push(`${josa(DEF(scared).name, '이', '가')} 아직 떨고 있습니다. 쉬게 하시거나 덜 무서운 것을 맡기심이 어떨지요.`);
  if (fast && fast !== scared && !S.sideRead.dongui) L.push(`손이 빠른 ${DEF(fast).name}에게 동의보감을 맡기면 좋겠습니다.`);
  if (typeof oweTotal === 'function' && oweTotal()) L.push(`밀린 녹봉이 ${fmtM(oweTotal())}입니다. 궤짝에서 내주셔야 합니다.`);
  L.push('누구에게 무엇을 읽힐지 직접 정해 주시면', '다들 그날은 힘이 나서 손이 빨라집니다.');
  pushNote('<h3>쪽지</h3>' + vlet(L, '한서진 올림.', 'min(56vh,420px)'));
  S.dayStat = { day: dayKey(), earned0: S.earned || 0, home: [], quit: [] }; save();
  if (typeof tlog === 'function') tlog('아침 보고');
}
