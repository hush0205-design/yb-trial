'use strict';
// ───────── 심부름: 갑자기 바뀌지 않고, 사람이 직접 걸어가 옮기고 나눠 줌 (10/4 선생님) ─────────
// 오정림 — 서고의 찻주전자를 별채 다탁으로 가져감 / 떨고 있는 사람과 가주 서안에 차를 날라 줌
// 한서진 — 별채 사람들 책상에 읽을 사본을 직접 가져다 놓음
// 심부름은 S.errs[누구] = { t0, steps }로 저장 — 다시 열면 지나간 일은 차례대로 한꺼번에 일어남.
S.errs = S.errs || {};
const E_SPD = 0.0065;                                   // 걸음 빠르기(칸/ms) — 처음 들어올 때와 같게
const LC = -14;                                         // 별채: 뒷벽과 의자 사이 통로
const TEA_STAND = [26, -16];                            // 별채 다탁(TEA_T, 12_lab) 앞에 서는 자리
const SG_DOOR = [-37.5, 2], SG_IN = [-33, 2], SG_HUB = [-24, 2], SGC = -8;   // 서고: 별채 문, 문 안쪽, 통로
const MY_STAND = [-6, -6], SJ_STAND = [35, 14];         // 가주 서안 앞, 한서진 책상 옆
const dKey = D => D.id === 'sj' ? 'sj' : D.id.slice(2);
const deskPathOf = w => w === 'sj' ? sjPath : (e => labPath(e, S.st[w].desk));
const homeSide = w => { const p = deskPathOf(w)(WALK_MS); return [p.x, p.y]; };
const stepDur = st => st.k === 'walk' ? Math.hypot(st.b[0] - st.a[0], st.b[1] - st.a[1]) / E_SPD : st.k === 'wait' ? st.ms : T_PUSH - WALK_MS;

// 길 만들기
function walkPts(sc, pts, carry){ const out = []; for (let i = 1; i < pts.length; i++) out.push({ k:'walk', sc, a:pts[i-1], b:pts[i], carry }); return out; }
const waitAt = (sc, p, f, ms, act, arg, carry) => ({ k:'wait', sc, a:p, f, ms, act, arg, carry });

function errNow(w){
  const er = S.errs[w]; if (!er) return null;
  let e = Date.now() - er.t0;
  for (let i = 0; i < er.steps.length; i++){ const st = er.steps[i], d = stepDur(st); if (e < d) return { st, e, d, i }; e -= d; }
  return null;
}
const errScene = w => { const n = errNow(w); return n ? n.st.sc : null; };
function errPos(w){
  const n = errNow(w); if (!n) return null;
  const { st, e, d } = n, out = deskPathOf(w)(T_STEP).chair;
  if (st.k === 'up'){ const p = deskPathOf(w)(T_PUSH - e); if (p.pose === 'walk') p.f = [-p.f[0], -p.f[1]]; return p; }
  if (st.k === 'down') return deskPathOf(w)(WALK_MS + e);
  if (st.k === 'wait') return { x: st.a[0], y: st.a[1], pose:'stand', f: st.f || [0, 1], chair: out };
  const t = e / d, l = Math.hypot(st.b[0] - st.a[0], st.b[1] - st.a[1]) || 1;
  return { x: lerp(st.a[0], st.b[0], t), y: lerp(st.a[1], st.b[1], t), pose:'walk', f: [(st.b[0] - st.a[0]) / l, (st.b[1] - st.a[1]) / l], chair: out };
}
function errCarry(D){ const w = dKey(D), n = errNow(w); if (!n || !n.st.carry || n.st.k === 'up' || n.st.k === 'down') return null; if (n.st.act === 'potPut' && S.errs[w].acted === n.i) return null; return n.st.carry; }
{ const sj0 = sjState; sjState = function(){ return errPos('sj') || sj0(); }; }

// 심부름 끝에 일어나는 일
const ERR_ACT = {
  potTake(){ S.potTaken = Date.now(); if (S.scene === 'seogo') noise(0.15, 700, 0.04); },
  potPut(){ S.potPut = Date.now(); if (S.scene === 'lab') sPlace(); },
  pour(){ if (S.scene === 'lab') sBoil(); const s = S.st.ojr; if (s && (s.fear||0) > 0.3){ s.steam = Date.now() + 3000; s.calm = Date.now() + 243000; } },   // 따르면서 자기 잔도 한 모금
  tea(k){ const s = S.st[k]; if (!s || !working(k) || DEF(k).tea === false) return; s.teaN = (s.teaN||0) + 1; s.steam = Date.now() + 3000; s.calm = Date.now() + 243000; if (S.scene === 'lab') sPlace(); },
  teaSJ(){ if (!S.rArrived || isNight()) return; S.rSteam = Date.now() + 3000; S.rCalm = Date.now() + 243000; if (S.scene === 'seogo') sPlace(); },
  myCup(){ S.myCup = true; if (S.scene === 'seogo') sPlace(); },
  give([k, it]){ const s = S.st[k]; if (!s || s.manual || s.gone) return; s.item = it; s.auto = true; if (S.scene === 'lab') sPlace();
    if (!S.autoNoteDone){ S.autoNoteDone = true;
      S.pendingNotes = (S.pendingNotes || []).concat(['<h3>쪽지</h3>' + vlet(['가주께.', '별채 사람들이 읽을 것은', '제가 나누어 두겠습니다.', '바꾸시려면 언제든', '그 사람 책상에서 고르십시오.'], '한서진 올림.', 'min(40vh,280px)')]); } },
};
function errTick(){
  for (const w of Object.keys(S.errs)){
    const er = S.errs[w]; let e = Date.now() - er.t0, i = 0, changed = false;
    for (; i < er.steps.length; i++){ const d = stepDur(er.steps[i]); if (e < d) break; e -= d;
      if (i >= (er.done || 0)){ const st = er.steps[i]; er.done = i + 1; changed = true;
        if (st.act && er.acted !== i) ERR_ACT[st.act](st.arg);
        const nx = er.steps[i + 1];
        if (nx && nx.sc !== st.sc && (S.scene === st.sc || S.scene === nx.sc)) noise(0.3, 240, 0.07, 'lowpass');   // 문 여닫는 소리
      } }
    const cs = er.steps[i];                                      // 내려놓는 일은 멈춰 선 직후에(서 있다가 한참 뒤에 생기지 않게)
    if (cs && cs.k === 'wait' && cs.act && er.acted !== i && e >= Math.min(350, stepDur(cs)*0.3)){ er.acted = i; ERR_ACT[cs.act](cs.arg); changed = true; }
    if (i >= er.steps.length){ delete S.errs[w]; changed = true; }
    if (changed) save();
  }
}

// 오정림: 처음 자리를 잡으면 서고의 찻주전자를 가지러 감 → 다탁에 놓고 그 자리에서 바로 차를 따라 돌림(앉았다 다시 일어나지 않게)
function potErrand(){
  const sd = homeSide('ojr');
  const steps = [
    { k:'up', sc:'lab' },
    ...walkPts('lab', [sd, [sd[0], LC], [LAB_DOOR[0], LC], LAB_DOOR]),
    ...walkPts('seogo', [SG_DOOR, SG_IN]),
    waitAt('seogo', SG_IN, [0.27, -0.96], 1200, 'potTake'),
    ...walkPts('seogo', [SG_IN, SG_DOOR], 'teapot'),
    ...walkPts('lab', [LAB_DOOR, [LAB_DOOR[0], LC], TEA_STAND], 'teapot'),
    waitAt('lab', TEA_STAND, [0.8, -0.6], 1200, 'potPut', null, 'teapot'),
    ...serveSteps(true) ];
  S.errs.ojr = { t0: Date.now(), steps }; lastTeaRound = Date.now(); save();
  if (typeof tlog === 'function') tlog('오정림이 찻주전자를 가지러 감');
}
// 다탁 앞에서 시작: 차를 따르고 → 떨고 있는 사람·빈 가주 서안에 날라 주고 → 제자리에 앉음
function serveSteps(first){
  const now = Date.now(), sd = homeSide('ojr'), steps = [];
  const labT = allKeys().filter(k => k !== 'ojr' && working(k) && DEF(k).tea !== false && (S.st[k].fear||0) >= 0.3 && LAB_DESKS[S.st[k].desk]).sort((a, b) => LAB_DESKS[S.st[a].desk][0] - LAB_DESKS[S.st[b].desk][0]);
  const sjSeated = !!S.rArrived && !isNight() && !nightVisiting() && now - S.rArrived > T_PUSH && !S.errs.sj;
  const sjT = sjSeated && (S.rFear||0) >= 0.3, myT = !!S.owned.desk && !S.myCup && (first || now - (S.myCupAt||0) > 300000);
  let cur = TEA_STAND;
  const go = (sc, pts, carry) => { steps.push(...walkPts(sc, [cur, ...pts], carry)); cur = pts[pts.length - 1]; };
  const selfT = (S.st.ojr.fear||0) >= 0.3;                         // 자기가 떨려도 다탁에 가서 한 잔
  if (labT.length || sjT || myT || selfT){
    steps.push(waitAt('lab', TEA_STAND, [0.8, -0.6], 1800, 'pour'));
    for (const k of labT){ const [dx, dy] = LAB_DESKS[S.st[k].desk], px = dx + 7.5;
      go('lab', [[cur[0], LC], [px, LC], [px, dy - 1]], 'tray');
      steps.push(waitAt('lab', cur, [-1, 0], 900, 'tea', k, 'tray')); }
    if (sjT || myT){
      go('lab', [[cur[0], LC], [LAB_DOOR[0], LC], LAB_DOOR], 'tray'); cur = SG_DOOR;
      go('seogo', [SG_IN, SG_HUB, [SG_HUB[0], SGC]], 'tray');
      if (myT){ go('seogo', [[MY_STAND[0], SGC], MY_STAND], 'tray'); steps.push(waitAt('seogo', MY_STAND, [0, 1], 900, 'myCup', null, 'tray')); go('seogo', [[MY_STAND[0], SGC]], 'tray'); }
      if (sjT){ go('seogo', [[SJ_STAND[0] - 1, SGC], SJ_STAND], 'tray'); steps.push(waitAt('seogo', SJ_STAND, [-0.9, 0.4], 900, 'teaSJ', null, 'tray')); go('seogo', [[SJ_STAND[0] - 1, SGC]]); }
      go('seogo', [[SG_HUB[0], SGC], SG_HUB, SG_IN, SG_DOOR]); cur = LAB_DOOR;
      go('lab', [[LAB_DOOR[0], LC]]);
    }
  }
  go('lab', [[cur[0], LC], [sd[0], LC], sd]);
  steps.push({ k:'down', sc:'lab' });
  return steps;
}
function teaRound(){
  const steps = serveSteps(false);
  if (steps.length <= 3) return;                                 // 날라 줄 사람이 없으면 앉아 있음
  const sd = homeSide('ojr');
  S.errs.ojr = { t0: Date.now(), steps: [{ k:'up', sc:'lab' }, ...walkPts('lab', [sd, [sd[0], LC], [TEA_STAND[0], LC], TEA_STAND]), ...steps] }; save();
}
// 한서진: 별채 사람들 책상에 읽을 사본을 가져다 놓음
function bookRound(changes){
  const now = Date.now(), side = homeSide('sj');
  changes.sort((a, b) => LAB_DESKS[S.st[a[0]].desk][0] - LAB_DESKS[S.st[b[0]].desk][0]);
  const steps = [{ k:'up', sc:'seogo' }];
  let cur = side;
  const go = (sc, pts, carry) => { steps.push(...walkPts(sc, [cur, ...pts], carry)); cur = pts[pts.length - 1]; };
  const bookOf = i => changes[i] ? itemModel(changes[i][1]) : null;
  go('seogo', [[side[0], SGC], [SG_HUB[0], SGC], SG_HUB, SG_IN, SG_DOOR], bookOf(0)); cur = LAB_DOOR;
  go('lab', [[LAB_DOOR[0], LC]], bookOf(0));
  changes.forEach(([k, it], i) => { const [dx, dy] = LAB_DESKS[S.st[k].desk], px = dx + 7.5;
    go('lab', [[px, LC], [px, dy - 1]], bookOf(i));
    steps.push(waitAt('lab', cur, [-1, 0], 1200, 'give', [k, it], bookOf(i)));
    go('lab', [[px, LC]], bookOf(i + 1)); });
  go('lab', [[LAB_DOOR[0], LC], LAB_DOOR]); cur = SG_DOOR;
  go('seogo', [SG_IN, SG_HUB, [SG_HUB[0], SGC], [side[0], SGC], side]);
  steps.push({ k:'down', sc:'seogo' });
  S.errs.sj = { t0: now, steps }; save();
  if (typeof tlog === 'function') tlog('한서진이 사본을 나누러 감');
}
