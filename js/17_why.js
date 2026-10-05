'use strict';
// ───────── 떠는 까닭 (10/4 선생님) ─────────
// 연구원이 겁에 질리기 시작하는 순간, 읽던 책에서 무엇을 보았는지 한 줄이 남음.
// (설정의 정답 = 진실이 눈으로 들어오면 간이 먼저 겁을 냄. 여기선 '본 것'만 보여 줌 — 광기 설계.md)
// 상태 창에 "떠는 까닭"으로 보이고, 문갑 셋째 서랍 '떨던 까닭 — 일지 뒷장'에 모임.
// ───────── 공포 7단계 (10/5 선생님 확정) — 이름은 간 관용구 ─────────
// 0 평온함 · 1 간이 서늘함(가끔 돌아봄) · 2 간이 콩알만 해짐(땀, 떠는 까닭) · 3 간을 졸임(손 떨림) · 4 간이 오그라듦(책을 덮었다 폈다)
// · 5 간이 떨어질 뻔함(의자를 빼고 앉음) · 6 간 떨어짐(집에 감)
const FEAR_AT  = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.95];
const FEAR_NM  = ['평온함', '간이 서늘함', '간이 콩알만 해짐', '간을 졸임', '간이 오그라듦', '간이 떨어질 뻔함', '간 떨어짐'];
const FEAR_DO  = ['', '가끔 고개를 들어 문 쪽을 돌아본다', '이마에 땀이 맺힌다', '손이 떨려 책장을 느릿느릿 넘긴다', '식은땀을 흘리며 책을 덮었다 폈다 한다', '의자를 뒤로 빼고 앉아 책을 거의 보지 못한다', '책을 덮고 일어났다'];
const FEAR_FAC = [1, 1, 0.75, 0.5, 0.25, 0.1, 0];
const FEAR_FACN = ['평소대로', '평소대로', '평소의 4분의 3', '평소의 절반', '평소의 4분의 1', '평소의 10분의 1', '멈춤'];
const fearStage = f => { let i = 0; while (i < 6 && (f||0) >= FEAR_AT[i + 1]) i++; return i; };
const fearFac = f => FEAR_FAC[fearStage(f)];
const fearState = f => { const i = fearStage(f); return FEAR_NM[i] + (FEAR_DO[i] ? ' — ' + FEAR_DO[i] : ''); };
const fearSpeedTxt = (f, sundial, perMinFull) => { const i = fearStage(f); return sundial ? `1분에 ${fmtP(Math.round(perMinFull * FEAR_FAC[i]))} — ${FEAR_FACN[i]}` : ['또박또박 넘긴다', '또박또박 넘기다 가끔 멈춘다', '조금 느려졌다', '손이 떨려 느릿느릿 넘긴다', '한참에 한 장씩 넘긴다', '책장을 붙잡고 거의 넘기지 못한다', '넘기지 않는다'][i]; };
// 앉아 있을 때의 몸짓: 1~3단계는 가끔 돌아봄, 4단계는 책을 덮었다 폈다, 5단계는 의자를 뒤로 뺌
const lookBack = (D, t) => { const s = fearStage(D.fear()); return s >= 1 && s <= 3 && ((t + D.id.length*3.7) % 13) < 1.1; };
const bookShut = (k, f) => fearStage(f) === 4 && ((Date.now()/1000 + k.length*2.3) % 9) < 2.6;
const SIT_BACK = 2.5;
{ const sj1 = sjState; sjState = function(){ const p = sj1(); if (p.pose === 'sit' && fearStage(S.rFear) === 5 && !(S.errs && S.errs.sj)){ p.y -= SIT_BACK; p.chair -= SIT_BACK; } return p; }; }

const WHY = {
  first: [
    '방금 읽은 장에 어제 없던 줄이 하나 있었다고 한다.',
    '족보의 끊긴 대 아래 빈칸에 먹이 번져 있었다고 한다. 이름을 쓰다 만 것 같았다고.',
    '장부의 셈이 읽을 때마다 하나씩 늘어 있었다고 한다.',
    '"물가에서"라는 말이 넘기는 장마다 나왔다고 한다.',
    '글자가 읽는 쪽을 보고 있는 것 같았다고 한다. 눈을 들 수가 없었다고.',
    '읽던 줄을 손가락으로 짚었더니, 다음 줄이 먼저 젖어 있었다고 한다.',
  ],
  dongui: [
    '간을 다룬 장의 붉은 덧글이 자기 손 글씨와 닮았다고 한다.',
    '"눈으로 구멍이 열린다"는 줄을 읽은 뒤로 눈이 시리다고 한다.',
    '약재 이름 사이에 바다 것들의 이름이 섞여 있었다고 한다.',
  ],
  map: [
    '지도의 바닷가 굴 자리가 볼 때마다 조금씩 가까워진다고 한다.',
    '지도 가장자리에 이 서고의 대문이 그려져 있었다고 한다. 그런 그림은 없었는데.',
    '접힌 자리를 펴니 물 냄새가 났다고 한다.',
  ],
};
const WHY_ON = 0.3, WHY_OFF = 0.15;            // 2단계(땀)에 생기고, 0단계로 가라앉으면 지워짐
function pickWhy(item){
  const pool = WHY[item] || WHY.first, seen = S.whySeen = S.whySeen || {};
  const used = seen[item] = seen[item] || [];
  let i = pool.findIndex((_, j) => !used.includes(j));
  if (i < 0){ used.length = 0; i = 0; }          // 다 나오면 처음부터 다시
  used.push(i); return pool[i];
}
function noteWhy(name, line){
  S.whyLog = (S.whyLog || []).concat([[name, line]]).slice(-30);
}
function whyTick(){
  let changed = false;
  // 한서진
  const rf = S.rFear || 0;
  if (S.rArrived && rf > WHY_ON && !S.rWhy){ S.rWhy = pickWhy(itemAt('rdesk') || 'first'); noteWhy('한서진', S.rWhy); changed = true; }
  else if (S.rWhy && rf < WHY_OFF){ S.rWhy = null; changed = true; }
  // 별채 사람들
  for (const k of allKeys()){ const s = S.st[k]; if (!s || !s.arr) continue;
    const f = s.fear || 0;
    if (f > WHY_ON && !s.why && working(k)){ s.why = pickWhy(s.item || 'first'); noteWhy(DEF(k).name, s.why); changed = true; }
    else if (s.why && f < WHY_OFF){ s.why = null; changed = true; }
  }
  if (changed) save();
}
// 상태 창에 붙는 한 줄
function whyHtml(k){
  const w = k === 'sj' ? S.rWhy : (S.st[k] && S.st[k].why);
  return w ? `<div style="font-size:13px;opacity:.8;margin:2px 0 4px">떠는 까닭: ${w}</div>` : '<br>';
}
// 문갑 셋째 서랍: 누가 적었는지 모르는 일지 뒷장(쓰는 자의 손 — 정본 설정집)
function whyRecs(recs){
  const L = S.whyLog || []; if (!L.length) return;
  recs.push(['떨던 까닭 — 일지 뒷장', () => '<h3>떨던 까닭</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">일지 뒷장에 적혀 있다. 사람들이 떨기 시작할 때 무엇을 보았다고 했는지.<br>누가 적었는지는 모른다. 한서진의 글씨는 아니다.</div>'
    + L.map(([n, l]) => `<div style="margin:6px 0"><b>${n}</b> — ${l}</div>`).join('')]);
}

// ───────── 겁이 끝까지 오르면 집에 감 (10/5 선생님) ─────────
// 6단계(간 떨어짐)면 책을 덮고 일어나 문으로 나감. 첫째는 30분 뒤, 둘째부터는 다음 날 아침(밤일 하는 이는 다음 날 저녁) 같은 문으로 돌아와 앉음(겁은 절반).
// 일반 연구원은 세 번째에 그만둠. 둘째로 비운 동안엔 그 사람 책상을 눌러 내보낼 수 있음.
// 반장(한서진·오정림)은 그만두지 않음. 집에 가 있는 동안은 심부름 칸 'away'(어느 방에도 안 보임).
const FEAR_TOP = 0.95, HOME_MS = 30*60e3;
const homeNote = (lines, sign) => '<h3>쪽지</h3>' + vlet(['가주께.', ...lines], sign, 'min(40vh,280px)');
const pushNote = h => { S.pendingNotes = (S.pendingNotes || []).concat([h]); };
const homeN = k => k === 'sj' ? (S.rHomeN||0) : ((S.st[k] && S.st[k].homeN)||0);
const nightWorker = k => k !== 'sj' && !!DEF(k).night;
function nextAt(h){                                     // 다음 날 h시(게임 시간이면 게임 속 시각)
  const now = Date.now(), gap = S.opt.gameTime ? 30*60e3 : 6*3600e3, step = S.opt.gameTime ? 20e3 : 60e3;
  let prev = gameHour(new Date(now + gap - step));
  for (let t = now + gap; t < now + 48*3600e3; t += step){ const g = gameHour(new Date(t)); if (prev < h && g >= h) return t; prev = g; }
  return now + 24*3600e3;
}
const awayMs = k => homeN(k) <= 1 ? HOME_MS : Math.max(HOME_MS, nextAt(nightWorker(k) ? 19 : 7) - Date.now());
Object.assign(ERR_ACT, {
  leave(k){
    const n = homeN(k), when = nightWorker(k) ? '내일 저녁에' : '내일 아침에';
    if (k === 'sj'){ pushNote(homeNote(n <= 1 ? ['잠깐 바람을 쐬고 오겠습니다.', '글자가 눈에 들어오지 않습니다.'] : ['오늘은 먼저 들어가 보겠습니다.', '내일 아침에는 괜찮을 것입니다.'], '한서진 올림.')); return; }
    const s = S.st[k], P = DEF(k);
    if (isGen(k) && n >= 3){
      s.gone = true; s.quit = Date.now(); S.genNext = Date.now() + 180000;   // 3분 뒤부터 새 지원자
      pushNote(homeNote(s.wageQuit ? ['녹봉이 사흘째 밀렸습니다.', '식구들 끼니가 걱정되어 더는 못 있겠습니다.', '책상 위의 사본은 덮어 두었습니다.'] : ['이 서고 일은 더 못 하겠습니다.', '받은 끼니 값은 갚을 길이 없습니다.', '책상 위의 사본은 덮어 두었습니다.'], `${P.name}(${P.hj}) 올림.`));
      if (typeof tlog === 'function') tlog('그만둠: ' + P.name);
      return;
    }
    pushNote(homeNote(n <= 1 ? ['잠깐 바람을 쐬고 오겠습니다.', '글자가 눈에 들어오지 않습니다.']
      : isGen(k) ? ['오늘은 들어가 쉬겠습니다. 송구합니다.', `${when} 오겠습니다.`, '자꾸 이러면 이 일을 계속할 수 있을지 모르겠습니다.'] : ['오늘은 들어가 쉬겠습니다.', `${when} 오겠습니다.`], `${P.name}(${P.hj}) 올림.`));
  },
  back(k){ if (k === 'sj'){ S.rFear = (S.rFear||0) * 0.5; S.rN5 = false; } else if (S.st[k]){ S.st[k].fear = (S.st[k].fear||0) * 0.5; S.st[k].n5 = false; } },
});
function goHome(k){
  const lab = k !== 'sj', sc = lab ? 'lab' : 'seogo', door = lab ? LAB_DOOR : DOOR_POS, side = homeSide(k);
  const out = lab ? [side, [side[0], LC], [door[0], LC], door] : [side, [side[0], SGC], [door[0], SGC], door];
  const quitting = lab && isGen(k) && homeN(k) >= 3;
  const steps = [{ k:'up', sc }, ...walkPts(sc, out), waitAt(sc, door, [0, -1], 300, 'leave', k)];
  if (!quitting) steps.push(waitAt('away', door, [0, 1], awayMs(k)), ...walkPts(sc, out.slice().reverse()), waitAt(sc, side, [-1, 0], 10, 'back', k), { k:'down', sc });
  S.errs[k] = { t0: Date.now(), steps, home: true }; save();
  if (S.scene === sc) noise(0.5, 320, 0.1, 'lowpass');            // 의자를 빼는 소리
  if (typeof tlog === 'function') tlog('겁에 질려 집에 감(' + homeN(k) + '번째): ' + (k === 'sj' ? '한서진' : DEF(k).name));
}
const awayNow = k => !!(S.errs[k] && S.errs[k].home && errScene(k) === 'away');
function homeTick(){
  // 5단계: 한 번 쪽지(오늘은 글자가 눈에 들어오지 않는다)
  if (S.rArrived && !S.rN5 && fearStage(S.rFear) === 5 && !S.errs.sj && !isNight()){ S.rN5 = true; pushNote(homeNote(['오늘은 글자가 눈에 잘 들어오지 않습니다.', '조금만 쉬었다 하겠습니다.'], '한서진 올림.')); save(); }
  if (S.rArrived && !S.errs.sj && (S.rFear||0) >= FEAR_TOP && !isNight() && !nightVisiting() && Date.now() - S.rArrived > T_PUSH){ S.rHomeN = (S.rHomeN||0) + 1; goHome('sj'); }
  for (const k of allKeys()){ const s = S.st[k];
    if (!s || !s.arr || s.gone || S.errs[k] || !working(k)) continue;
    if (!s.n5 && fearStage(s.fear) === 5){ s.n5 = true; pushNote(homeNote(['오늘은 글자가 눈에 잘 들어오지 않습니다.', '조금만 쉬었다 하겠습니다.'], `${DEF(k).name}(${DEF(k).hj}) 올림.`)); save(); }
    if ((s.fear||0) >= FEAR_TOP){ s.homeN = (s.homeN||0) + 1; goHome(k); }
  }
}
// 집에 가 있는 사람의 자리를 누르면: 언제 오는지 / 둘째로 비운 일반 연구원은 내보낼 수 있음
function showAway(k){
  const P = DEF(k), s = S.st[k], er = S.errs[k], n = homeN(k);
  let back = er.t0; for (const st of er.steps){ back += stepDur(st); if (st.k === 'wait' && st.sc === 'away') break; }
  const when = n <= 1 ? '곧 돌아온다고 했다' : (nightWorker(k) ? '내일 저녁에' : '내일 아침에') + ' 온다고 했다';
  const can = isGen(k) && n >= 2;
  openOv(`<h3>${P.name}의 자리</h3>비어 있다. 겁에 질려 집에 갔다. ${when}.<br><span style="font-size:12px;opacity:.6">책상 위의 사본은 덮여 있다. 집에 간 것이 ${n}번째다.</span>`
    + (can ? '<div style="font-size:13px;opacity:.75;margin-top:10px">이 사람을 계속 둘지 정할 수 있다. 한 번 더 이러면 스스로 그만둘 것이다.</div><div style="text-align:center;margin-top:12px"><button class="btn rec" id="bFire" style="color:var(--ink);border-color:#00000066">내보낸다</button></div>' : ''));
  const b = document.getElementById('bFire'); if (b) b.addEventListener('click', ev => { ev.stopPropagation();
    openOv(`<h3>내보낸다</h3>${josa(P.name, '을', '를')} 내보내면 다시 오지 않는다. 빈 책상에는 새 사람을 받을 수 있다.<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bFire2" style="color:var(--ink);border-color:#00000066">내보낸다</button></div>`);
    document.getElementById('bFire2').addEventListener('click', e2 => { e2.stopPropagation();
      delete S.errs[k]; s.gone = true; s.quit = Date.now(); s.fired = true; S.genNext = Date.now() + 180000; save(); ov.classList.add('hidden'); sPlace();
      if (typeof tlog === 'function') tlog('내보냄: ' + P.name); }); });
}
{ const ss = showStaff; showStaff = function(k){ if (k && awayNow(k)) return showAway(k); return ss(k); }; }
{ const sr = showResearcher; showResearcher = function(){ if (awayNow('sj')) return openOv('<h3>연구원의 자리</h3>비어 있다. 한서진은 겁에 질려 집에 갔다.<br>' + (homeN('sj') <= 1 ? '곧 돌아온다고 했다.' : '내일 아침에 온다고 했다.')); return sr(); }; }
// 평소에도 일반 연구원을 내보낼 수 있음(10/5 선생님): 상태 창 맨 아래 '내보낸다' → 책을 덮고 일어나 문으로 나감
ERR_ACT.dismiss = k => { const s = S.st[k]; if (!s) return; s.gone = true; s.quit = Date.now(); s.fired = true; S.genNext = Date.now() + 180000;
  if (typeof tlog === 'function') tlog('내보냄: ' + DEF(k).name); };
function dismiss(k){
  const side = homeSide(k);
  S.errs[k] = { t0: Date.now(), steps: [{ k:'up', sc:'lab' }, ...walkPts('lab', [side, [side[0], LC], [LAB_DOOR[0], LC], LAB_DOOR]), waitAt('lab', LAB_DOOR, [0, -1], 300, 'dismiss', k)] };
  save(); if (S.scene === 'lab') noise(0.5, 320, 0.1, 'lowpass');
}
{ const ss2 = showStaff; showStaff = function(k){
    ss2(k);
    if (!k || !isGen(k) || !S.st[k] || S.st[k].gone || S.errs[k] || !present(k) || awayNow(k)) return;
    const d = document.createElement('div'); d.style.cssText = 'text-align:right;margin-top:12px';
    d.innerHTML = '<span class="rec" id="bDismiss" style="font-size:12px;opacity:.55">내보낸다</span>'; ovBody.insertBefore(d, ovBody.querySelector('.close'));
    document.getElementById('bDismiss').addEventListener('click', ev => { ev.stopPropagation(); const P = DEF(k);
      openOv(`<h3>내보낸다</h3>${josa(P.name, '을', '를')} 내보내면 책을 덮고 나가 다시 오지 않는다.<br>빈 책상에는 새 사람을 받을 수 있다.<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bDis2" style="color:var(--ink);border-color:#00000066">내보낸다</button></div>`);
      document.getElementById('bDis2').addEventListener('click', e2 => { e2.stopPropagation(); ov.classList.add('hidden'); dismiss(k); }); });
  }; }
