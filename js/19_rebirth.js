'use strict';
// ───────── 환생 뼈대 (환생 명세 1~6절 · 코드 정리 설계 2절, 10/7) ─────────
// 끝(강제 환생)은 END 표 한 곳에 모음 — 끝을 더할 땐 여기에만. 매 틱 n()을 보고 한도의 70%면 징조(기록 한 줄, 한 번), 다 차면 endGame.
// 이름 규칙: 우리 문서의 '멸망 도감' = 게임 속 「가환록(家患錄)」(10/7 선생님 — 우리끼리 쓰는 말은 화면에 안 냄)
// endGame: 가문(LINE)에 족보 줄·멸망 도감(가환록)·유품·흔적·열린 것을 적고 → 판(S)을 새로 → 끝 장면(기록 → 족보에 붓이 저절로 씀) → 새 대(이름만 묻고 가훈 → 서고).
const DAY_MS = () => S.opt.gameTime ? 2*3600e3 : 24*3600e3;
const hasRelic = id => LINE.relics.includes(id);

// ── 빨리 다시 열림: 앞 대에서 닿았던 문턱은 절반, 두 번이면 1/4 (바닥 1/5) ──
const thr = (id, base) => Math.round(base * Math.max(0.2, Math.pow(0.5, LINE.reached[id] || 0)));
for (const o of [...OBJ, ...LAB_OBJ]) if (o.buy) o.buy.cost = thr(o.id, o.buy.cost);
T.letter = Math.max(T.door, thr('letter', T.letter));
const REACH_IDS = ['lamp', 'brush', 'desk', 'glass', 'sundial', 'ld1', 'ld2', 'ld3', 'ld4', 'ld5'];
function reachedNow(){                                     // 이번 대에 닿은 문턱(한 대에 한 번씩 셈)
  const r = REACH_IDS.filter(id => S.owned[id]);
  if (S.replied) r.push('letter'); if (S.mapFound) r.push('map'); if (S.bangAt) r.push('lab'); if (S.dig && S.dig.n) r.push('dig');
  return r;
}

// ── 유품: 다음 대의 서고(문서함)에 놓임 ──
const RELIC = {
  key:    { name:'열쇠', desc:'앞 대가 허리에 차고 다니던 대문 열쇠. 대문의 자물쇠에 꼭 맞을 것 같다.<br>아직은 걸어 잠글 일이 없다.' },
  ledger: { name:'청지기의 장부', desc:'앞 대의 치부책. 녹봉을 내준 날짜가 빼곡하다.<br>이 장부를 펴 둔 뒤로 녹봉은 궤짝에서 저절로 나가고, 사람을 조금 더 잃어도 서고가 버틴다.' },
  copies: { name:'사본 묶음', desc:'앞 대가 베껴 두고 팔지 못한 사본 두 권. 세책점에 넘긴 값 1냥이 궤짝에 들어 있다.' },
};
// ── 끝 표 ──
const END = {
  nobody: { name:'아무도 오지 않다', kind:'일반',
    n: () => genKeys().filter(k => S.st[k] && S.st[k].quit).length,            // 내보냄 + 녹봉 떠남 + 겁에 질려 그만둠(10/7 선생님)
    lim: () => LINE.limits.leave + (hasRelic('ledger') ? 2 : 0) + (GAHUN[S.gahun] && GAHUN[S.gahun].leave || 0),
    omen(){ S.lateApp = true;
      pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '장터에 이 댁 이야기가 돈다 합니다.', '들어오는 사람마다 얼마 못 가 나간다고.', '방을 보고도 발길을 돌리는 이가 있답니다.'], '한서진 올림.', 'min(44vh,320px)')); },
    scene: () => ['방(榜)이 비에 젖어 대문에서 떨어졌다. 다시 붙여도 아무도 오지 않았다.',
      '별채의 책상마다 먼지가 앉았다. 덮어 둔 사본 위에도.',
      '한서진만 남아 혼자 장부를 넘겼다. 넘기는 소리만 서고에 있었다.',
      '어느 아침 서안 위에 쪽지 한 장. 「혼자서는 이 책을 다 읽을 수 없습니다.」',
      '그해 겨울, 가주는 서고 문을 닫았다.'],
    codex: '사람을 거듭 잃으니 서고에 아무도 오지 않았다.',
    only: () => '<b>장터 소문</b> — 「그 집 서고는 사람을 들이고 내보내기를 밥 먹듯 한다더라. 들어간 사람이 나올 땐 얼굴이 달라져 있다더라. 방이 붙어 있어도 가지 마라. 밥은 준다더라만.」',
    relics: ['ledger'], gahun: 2 },
  rice: { name:'쌀독이 비다', kind:'일반',
    n: () => S.riceN || 0,                                                     // 궤짝이 바닥이고 별채에 일하는 사람이 없는 날(달력) — 닷새(10/7 선생님)
    lim: () => LINE.limits.rice,
    omen(){ pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '쌀독 바닥이 보입니다.', '오늘 아침은 제 집에서 쌀을 덜어 왔습니다.', '세책점 거간이 외상을 놓겠다 하는데,', '그 사람 웃는 얼굴이 마음에 걸립니다.'], '한서진 올림.', 'min(48vh,340px)')); },
    scene: () => ['아침마다 쌀독 바닥을 긁는 소리가 났다.',
      '세책점 거간이 외상 장부를 내밀었다. 쌀 두 섬에 책장의 책 세 권.',
      '거간이 써 준 영수증의 글자는 첫 책의 글자와 닮아 있었다.',
      '별채는 비었고, 한서진은 끼니를 거르며 넘겼다.',
      '그해 겨울, 가주는 남은 책을 궤짝에 넣고 서고 문을 닫았다.'],
    codex: '쌀독이 비어, 책을 쌀과 바꾸었다.',
    only: () => `<b>거간의 영수증</b> — 쌀 두 섬. 받은 것: ${alienHtml(glyphs('책 세 권과 이름 하나', 61))}<br><span style="font-size:12px;opacity:.6">마지막 몇 글자는 아무리 보아도 풀리지 않는다.</span>`,
    relics: ['ledger', 'copies'], gahun: 3 },
};
const gahunOpen = () => (LINE.gahun.unlocked = LINE.gahun.unlocked || [0]);

// ── 새 대의 첫걸음: 유품을 풀고 흔적을 남김(서고에 처음 들어올 때 한 번) ──
function genInit(){
  if (S.genInit) return; S.genInit = true; S.gen = LINE.gen; S.genDay = dayKey();
  if (LINE.gen > 17 && LINE.trace) S.trace = LINE.trace.from;
  if (hasRelic('ledger')) S.steward = true;
  if (hasRelic('copies') && LINE.gen > 17){ S.money = (S.money == null ? 500 : S.money) + 100; ledger('앞 대의 사본 묶음을 세책점에 넘김 + 1냥'); }
  if (typeof tlog === 'function') tlog(LINE.gen + '세 시작' + (S.trace ? ' (앞 대: ' + END[S.trace].name + ')' : ''));
  save();
}
function traceTick(){
  if (S.trace === 'nobody' && S.bangAt && !S.traceDone){           // 소문: 첫 지원자가 하루 늦게
    S.traceDone = true; S.genNext = Math.max(S.genNext || 0, S.bangAt + 120000 + DAY_MS()); S.gnSeen = S.genNext; save(); }
  if (S.trace === 'rice' && S.rArrived && !S.traceDone){           // 밀린 것을 안고 시작: 한서진의 녹봉이 이틀 밀린 채
    S.traceDone = true; S.owe = S.owe || {}; S.owe.sj = { amt: WAGE('sj') * 2, days: 2 }; if (S.payDay == null) S.payDay = dayKey(); save(); }
  const late = GAHUN[S.gahun] && GAHUN[S.gahun].appLate;
  if ((S.lateApp || late) && S.genNext && S.genNext !== S.gnSeen){   // 징조 뒤로는 지원자가 하루씩 늦게 / 가훈 「사람을 아끼지 마라」는 기다림이 두 배
    if (S.genNext > Date.now() - 1000){ if (late) S.genNext = Date.now() + (S.genNext - Date.now()) * late; if (S.lateApp) S.genNext += DAY_MS(); }
    S.gnSeen = S.genNext; save(); }
}
// 한서진은 앞 대에 왔었으면 편지 없이 둘째 날 아침에 옴
function againTick(){
  if (!LINE.reached.letter || S.replied || S.genDay == null || dayKey() <= S.genDay || isNight() || gameHour() < 7) return;
  S.letterRead = true; S.replied = true; S.chair = true; S.rDue = Date.now() + 3000; S.sjAgain = true; save(); sPlace();
}
function againNote(){
  if (!S.sjAgain || S.sjAgainNote || !S.rArrived || Date.now() - S.rArrived < T_PUSH) return;
  S.sjAgainNote = true; pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '다시 왔습니다.', '어디서 들었는지는 기억나지 않습니다.', '자리는 전과 같은 곳이면 됩니다.'], '한서진 올림.', 'min(44vh,320px)')); save();
}
// ── 기본 모드(1대 포함): 비운 동안 쌓인 셈으로는 끝 바로 앞에서 멈춤 — 끝은 들어와 있을 때만. 하드는 비운 동안에도 끝까지(기획서 9절, 10/7 선생님) ──
const AWAY = S.stage === 'room' && Date.now() - (S.lastSeen || Date.now()) > 180000;   // 20_main이 lastSeen을 새로 쓰기 전에 봄
const LOAD_T = performance.now();
const catchingUp = () => AWAY && performance.now() - LOAD_T < 8000;                    // 돌아온 직후 몇 초 = 비운 동안의 셈을 따라잡는 때
const holdEnd = () => S.mode !== 'hard' && catchingUp();
const quittingNow = () => genKeys().filter(k => S.st[k] && !S.st[k].quit && S.errs[k] && S.errs[k].home && homeN(k) >= 3).length;
// 기본 모드의 안전장치(10/7 선생님): 넷째로 떠날 사람은 짐을 싸 들고 대문 앞에서 기다림 — 들어와 계신 동안 3분 안에
// 녹봉을 내주거나(녹봉 떠남) 쉬라고 보내면(겁 그만둠) 남음. 그대로 두면 떠나고 끝. 한 대에 한 번.
function holdQuit(k, kind){
  if (S.mode === 'hard' || END.nobody.n() + quittingNow() + 1 < END.nobody.lim()) return false;
  if (!S.standUsed && k){ startStand(k, kind); return true; }
  return catchingUp();                                              // 장치를 이미 썼으면: 비운 셈으로는 안 떠나고 들어와 계실 때 떠남
}
const STAND_MS = 180000;
function startStand(k, kind){
  const P = DEF(k), s = S.st[k];
  S.standUsed = true; S.stand = { k, kind, ms:0 }; s.stand = true;
  pushNote('<h3>쪽지</h3>' + vlet(kind === 'wage'
    ? ['가주께.', '녹봉이 사흘째 밀렸습니다.', '짐을 싸서 대문 앞에 나와 있습니다.', '밀린 것만 받으면 남겠습니다.', '해가 기울기 전에 말씀 주십시오.']
    : ['가주께.', '이 서고 일은 더 못 하겠습니다.', '짐을 싸서 대문 앞에 나와 있습니다.', '다만 하루만 쉬게 해 주시면', '다시 해 볼 수도 있겠습니다.'], `${P.name}(${P.hj}) 올림.`, 'min(48vh,340px)'));
  if (typeof tlog === 'function') tlog('대문 앞에서 기다림: ' + P.name); save();
}
function standTick(dt){
  if (!S.stand) return;
  const s = S.st[S.stand.k]; if (!s || s.gone || !s.stand){ S.stand = null; save(); return; }
  S.stand.ms += dt * 1000;
  if (S.stand.ms >= STAND_MS) standLeave();
}
function standLeave(){
  const k = S.stand.k, s = S.st[k], P = DEF(k), kind = S.stand.kind;
  s.stand = false; s.gone = true; s.quit = Date.now(); if (kind === 'wage') s.wageQuit = true; S.genNext = Date.now() + 180000; S.stand = null;
  if (S.scene === 'gate'){ noise(0.3, 260, 0.1, 'lowpass'); }
  if (typeof tlog === 'function') tlog('그만둠(대문 앞에서 떠남): ' + P.name); save();
}
function showStand(){
  const k = S.stand.k, s = S.st[k], P = DEF(k), kind = S.stand.kind, owe = (S.owe && S.owe[k] && S.owe[k].amt) || 0;
  const btn = (id, l) => `<button class="btn rec" id="${id}" style="color:var(--ink);border-color:#00000066;margin:4px">${l}</button>`;
  openOv(`<h3>${P.name}</h3>짐을 싸 들고 대문 앞에 서 있다. ${kind === 'wage' ? `밀린 녹봉 ${fmtM(owe)}을 기다린다.` : '얼굴이 하얗다. 손을 떨고 있다.'}<br><span style="font-size:13px;opacity:.7">해가 기울면 떠날 것이다.</span>`
    + `<div style="text-align:center;margin-top:14px">${kind === 'wage' ? btn('bStKeep', `밀린 녹봉을 내준다 — ${fmtM(owe)}`) : btn('bStKeep', '하루 쉬고 오라 한다')}${btn('bStGo', '보낸다')}</div><div id="stMsg" style="text-align:center;font-size:13px;opacity:.75"></div>`);
  document.getElementById('bStKeep').addEventListener('click', ev => { ev.stopPropagation();
    if (kind === 'wage'){
      if ((S.money || 0) < owe){ document.getElementById('stMsg').textContent = '궤짝의 엽전이 모자란다.'; return; }
      S.money -= owe; ledger(`녹봉(쌀) ${fmtM(owe)} — ${P.name} (대문 앞에서)`); S.owe[k] = { amt:0, days:0 };
      noise(0.08, 3000, 0.04); setTimeout(() => noise(0.06, 2600, 0.03), 90);
    }
    s.stand = false; S.stand = null;
    if (kind === 'fear'){ s.homeN = 2; s.fear = Math.min(s.fear || 0, 0.6); goHome(k); }
    if (typeof tlog === 'function') tlog('붙잡음: ' + P.name); save(); ov.classList.add('hidden'); sPlace(); });
  document.getElementById('bStGo').addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); standLeave(); });
}
const STAND_DOLLS = {};
// ── 쌀독의 안전장치(기본 모드, 10/7 선생님): 닷새째가 되는 순간 끝내지 않고 서안에 빈 편지지 — 가주가 돈을 꾸어 달라는 편지를 보냄 ──
// 받는 이: 가문에서 처음엔 먼 일가(빚 없음, 대신 경고 한 줄, 다시는 안 도움) → 그다음 대부터는 세책점(빚 — 사본 값에서 절반씩, 기획서 14-4 ③).
// 안 쓰고 두면 들어와 계신 동안 3분 뒤 끝. 보내면 1분 뒤 답장과 엽전 1냥, 쌀독 날수는 처음으로. 한 대에 한 번, 하드엔 없음.
const CREDIT = 100, LOAN_REPLY_MS = 60000;
const loanTo = () => LINE.loanKin ? 'dealer' : 'kin';
function riceReach(L){
  if (S.mode === 'hard' || S.creditUsed) return L;
  S.creditUsed = true; S.credit = { ms:0, to: loanTo() };
  pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '오늘 아침 쌀독이 비었습니다.', '서안에 편지지를 펴 두었습니다.', S.credit.to === 'kin' ? '먼 일가 어른께라도 한 줄 넣어 보심이 어떨지요.' : '부끄러운 일이나, 세책점에라도 넣어 보셔야겠습니다.'], '한서진 올림.', 'min(46vh,330px)'));
  if (typeof tlog === 'function') tlog('쌀독이 빔 — 서안에 편지지'); save(); sPlace();
  return L - 1;
}
function creditTick(dt){
  if (!S.credit) return;
  if (S.credit.sent){ if (Date.now() - S.credit.sent >= LOAN_REPLY_MS) loanReply(); return; }
  S.credit.ms += dt * 1000;
  if (S.credit.ms >= STAND_MS) creditEnd();
}
function creditEnd(){ S.credit = null; S.riceN = END.rice.lim(); if (typeof tlog === 'function') tlog('돈을 꾸는 편지를 쓰지 않음'); save(); }
function showLoan(){
  const kin = S.credit.to === 'kin';
  const body = kin ? ['일가 어른께.', '오래 소식 드리지 못했습니다.', '집안 서고를 다시 열었으나', '쌀독이 비어 사람들을 먹일 길이 없습니다.', '엽전 한 냥만 꾸어 주시면', '서고가 일어서는 대로 갚겠습니다.']
                   : ['세책점 주인께.', '사본을 넘기던 집입니다.', '쌀독이 비어 염치없이 청합니다.', '엽전 한 냥을 꾸어 주시면', '다음 사본들로 갚겠습니다.'];
  openOv('<h3>편지</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">서안에 펴 둔 편지지. 쓸 말은 정해져 있다.</div>' + vlet(body, esc(S.sur + S.name), 'min(50vh,360px)')
    + '<div style="text-align:center;margin-top:12px"><button class="btn rec" id="bLoan" style="color:var(--ink);border-color:#00000066">보낸다</button></div>');
  document.getElementById('bLoan').addEventListener('click', ev => { ev.stopPropagation();
    S.credit.sent = Date.now(); save(); ov.classList.add('hidden'); sPlace(); sFlip();
    if (typeof tlog === 'function') tlog('돈을 꾸는 편지를 보냄 — ' + (kin ? '먼 일가' : '세책점')); });
}
function loanReply(){
  const kin = S.credit.to === 'kin';
  S.money = (S.money || 0) + CREDIT; S.riceN = 0; S.credit = null;
  if (kin){
    LINE.loanKin = true; saveLine(); ledger(`먼 일가에서 엽전 ${fmtM(CREDIT)}을 부쳐 옴 — 갚지 말라 함`);
    pushNote('<h3>답장</h3>' + vlet(['보낸 글 받았다.', '엽전 한 냥을 부친다. 갚을 생각은 마라.', '다만 서고를 다시 열었다는 말은 듣기 좋지 않다.', '궤짝 속 그 책은 덮어 두어라.', '네 윗대 어른 하나도 그 책 때문에 집을 비웠다.', '다시는 이 일로 편지하지 마라.'], esc(`${LINE.bon || ''} ${LINE.sur}씨 일가`) + ' 적음.', 'min(52vh,380px)'));
  } else {
    S.debt = (S.debt || 0) + CREDIT; ledger(`세책점에서 외상 ${fmtM(CREDIT)} — 사본 값에서 절반씩 갚음`);
    pushNote('<h3>답장</h3>' + vlet(['보내신 글 받았소.', '엽전 한 냥을 놓소.', '갚는 건 사본으로 하시오.', '다음 사본부터 값의 절반을 떼겠소.'], '세책점 ' + alienHtml(glyphs('주인', 63)) + ' 적음.', 'min(44vh,320px)'));
  }
  noise(0.08, 3000, 0.04); setTimeout(() => noise(0.06, 2600, 0.03), 90);
  if (typeof tlog === 'function') tlog('돈을 꾼 답장이 옴 — ' + (kin ? '먼 일가' : '세책점')); save(); sPlace();
}
// 서안 위 빈 편지지(서안이 없으면 바닥에)
OBJ.push({ id:'loanPaper', x:3, y:7, z:8, rot:0.15, m:()=>'letter', on:()=>'desk', onOrder:0.02, show:()=> !!S.owned.desk && !!S.credit && !S.credit.sent, click:()=>showLoan(), glow:()=>true },
         { id:'loanPaper2', x:6, y:10, rot:0.15, m:()=>'letter', show:()=> !S.owned.desk && !!S.credit && !S.credit.sent, click:()=>showLoan(), glow:()=>true });
function standDolls(){ return standDolls0(); }
function standDolls0(){
  if (!S.stand || !S.st[S.stand.k] || !S.st[S.stand.k].stand) return [];
  const k = S.stand.k;
  if (!STAND_DOLLS[k]){ const d = dollFor(k);
    STAND_DOLLS[k] = { id:'gs_' + k, doll:true, img: d.img, imgL: d.imgL, shadow: d.shadow, st:()=>({ x:-7, y:-12, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0.5, steam:()=>0, arrT:()=>0, show:()=>true, click:()=>showStand() }; }
  return [STAND_DOLLS[k]];
}
// 쌀독: 날이 바뀔 때 궤짝이 바닥(가장 싼 녹봉보다 적음)이고 별채에 일하는 사람이 없으면 하루씩
function riceTick(){
  const today = dayKey();
  if (S.riceDay == null){ S.riceDay = today; return; }
  if (S.riceDay >= today) return;
  const days = today - S.riceDay; S.riceDay = today;
  const broke = !!S.bangAt && (S.money || 0) < 30 && !genKeys().some(k => S.st[k] && S.st[k].arr && !S.st[k].gone);
  let n = broke ? (S.riceN || 0) + days : 0; const L = END.rice.lim();
  if (n >= L && holdEnd()){ n = L - 1; S.riceOwed = true; }        // 기본: 마지막 하루는 들어와 있을 때 셈
  else if (n >= L) n = riceReach(L);
  S.riceN = n; save();
}
function riceOwedTick(){                                            // 돌아와 1분 넘게 머물렀는데도 여전히 궤짝이 바닥·별채가 비었으면 그 하루를 셈
  if (!S.riceOwed || holdEnd() || performance.now() - LOAD_T < 68000) return;
  S.riceOwed = false;
  if (!!S.bangAt && (S.money || 0) < 30 && !genKeys().some(k => S.st[k] && S.st[k].arr && !S.st[k].gone)) S.riceN = riceReach(END.rice.lim());
  save();
}
function endTick(){
  if (S.ended || window.BOOTING) return;
  S.omen = S.omen || {};
  for (const id of Object.keys(END)){
    const E = END[id], v = E.n(), L = E.lim();
    if (!S.omen[id] && v >= Math.ceil(L * 0.7) && v < L){ S.omen[id] = true; E.omen(); if (typeof tlog === 'function') tlog('징조: ' + E.name); save(); }
    if (v >= L){ endGame(id); return; }
  }
}
HOOK.tick.push(dt => { if (S.stage !== 'room' || S.ended) return; standTick(dt); creditTick(dt); genInit(); traceTick(); againTick(); againNote(); riceTick(); riceOwedTick(); endTick(); });

// ── 끝 ──
function endGame(id){
  const E = END[id]; if (S.ended) return;
  S.ended = id; if (typeof tlog === 'function') tlog('환생: ' + E.name); save();
  const was = { gen: LINE.gen, sur: S.sur || LINE.sur, bon: S.bon || LINE.bon, name: S.name, gahun: S.gahun };
  const firstCodex = !Object.keys(LINE.codex).length;
  LINE.jokbo.push({ gen: LINE.gen, name: S.name, end: E.name, endId: id, days: Math.max(1, dayKey() - (S.genDay == null ? dayKey() : S.genDay) + 1), gahun: S.gahun, mode: S.mode || 'basic' });
  const c = LINE.codex[id] || { n:0, first: Date.now() }; c.n++; c.line = E.codex; LINE.codex[id] = c;
  if (S.gahun >= 0) LINE.gahun.used[S.gahun] = (LINE.gahun.used[S.gahun] || 0) + 1;
  const newGahun = E.gahun != null && !gahunOpen().includes(E.gahun) ? E.gahun : null; if (newGahun != null) LINE.gahun.unlocked.push(newGahun);
  const pool = E.relics.filter(r => !hasRelic(r)), relic = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  const gotKey = !hasRelic('key');
  if (gotKey) LINE.relics.push('key'); if (relic) LINE.relics.push(relic);
  for (const r of reachedNow()) LINE.reached[r] = (LINE.reached[r] || 0) + 1;
  LINE.trace = { from: id }; LINE.gloss = S.gl; LINE.margins = S.margins || [];
  LINE.gen++; saveLine();
  // 판은 새로 — 낱말 장부·여백 글씨·시험 기록·설정만 들고 감
  localStorage.setItem(SAVE, JSON.stringify({ stage:'jokbo', opt: S.opt, gl: S.gl, margins: S.margins, tlog: S.tlog }));
  resetting = true;
  endScene(E, was, { relic, gotKey, firstCodex, newGahun });
}
function endScene(E, was, got){
  if (typeof bookOpen !== 'undefined' && bookOpen) try { closeBook(); } catch(_){}
  ov.classList.add('hidden');
  const el = document.createElement('div'); el.id = 'endScene'; document.body.appendChild(el);
  let at = performance.now(), step = 0;
  const fadeIn = (html, gap) => { el.innerHTML = html; at = performance.now();
    el.querySelectorAll('.el').forEach((p, i) => setTimeout(() => p.classList.add('on'), 600 + i * gap)); };
  // 1) 끝의 기록
  fadeIn(`<div class="hanji endRec"><h3>${esc(was.sur + was.name)}의 마지막 해</h3>${E.scene().map(t => `<p class="el">${esc(t)}</p>`).join('')}<div class="el endTap">— 눌러서 넘긴다 —</div></div>`, 1500);
  noise(1.2, 140, 0.18, 'lowpass');
  const total1 = 600 + E.scene().length * 1500;
  el.addEventListener('click', () => {                    // 기록을 다 보이기 전엔 넘어가지 않음(2.5초 넘으면 눌러서 넘길 수 있음). 족보는 단추로만
    if (step !== 0 || performance.now() - at < Math.min(total1, 2500)) return;
    step = 1; jokboStep();
  });
  // 2) 족보가 펼쳐지며 이번 대의 줄에 끝이 적힘(붓이 저절로)
  function jokboStep(){
    const rows = LINE.jokbo.slice(-5), cur = rows[rows.length - 1];
    const older = LINE.jokbo.length > 5 ? '<div class="row faint"><span class="gen">…</span></div>' : '';
    const rowH = j => `<div class="row"><span class="gen">${genHj(j.gen)}世</span><span>${esc(was.sur + j.name)} — <span class="${j === cur ? 'writing' : ''}">${j === cur ? '' : esc(j.end)}</span></span></div>`;
    fadeIn(`<div class="hanji"><h2>族譜</h2>
      <div class="row faint"><span class="gen">十三世</span>…</div>
      <div class="row faint"><span class="gen">十四世</span><span class="inkline"></span></div>
      <div class="row faint"><span class="gen">十五世</span><span class="inkline"></span></div>
      <div class="row faint"><span class="gen">十六世</span><span class="inkline"></span></div>${older}
      ${rows.map(rowH).join('')}
      <div class="after">
        <p class="el">${got.firstCodex ? '가환록(家患錄)을 새로 매어 서안 곁 문서함에 둔다. 첫 줄이 적혔다.' : '가환록에 한 줄이 더 적혔다.'}</p>
        ${got.newGahun != null ? `<p class="el">가훈 하나가 풀렸다 — 「${GAHUN[got.newGahun].t}」</p>` : ''}
        <p class="el">다음 대에 남길 것: ${got.relic ? esc(RELIC[got.relic].name) : '없음'}${got.gotKey ? ' · 그리고 대문 열쇠 하나' : ''}</p>
        <div class="el" style="text-align:center;margin-top:16px"><button class="btn" id="bNextGen" style="color:var(--ink);border-color:#00000066">${genHj(LINE.gen)}世를 적는다</button></div>
      </div></div>`, 99999);
    const w = el.querySelector('.writing'), txt = Array.from(cur.end); let i = 0;
    const pen = setInterval(() => { if (i >= txt.length){ clearInterval(pen);
        el.querySelectorAll('.after .el').forEach((p, k) => setTimeout(() => p.classList.add('on'), 700 + k * 1100)); return; }
      w.textContent += txt[i++]; noise(0.12, 900, 0.05, 'bandpass'); }, 380);
    setTimeout(() => sFlip(), 300);
    el.querySelector('#bNextGen').addEventListener('click', ev => { ev.stopPropagation(); location.reload(); });
  }
}

// ── 서안 곁 문서함: 집안 족보 · 멸망 도감 · 가훈첩 · 유품 (책장엔 안 꽂음 — 환생 명세 9절 4번) ──
M.docbox = model(9, 6, 5, (x, y, z) => {
  if (z === 4) return (x === 0 || x === 8 || y === 0 || y === 5) ? '#24160d' : '#3a2416';
  if ((x === 0 || x === 8) && (y === 0 || y === 5)) return '#a8873e';
  if (y === 5 && x === 4 && z === 2) return '#c8a85e';
  return z === 3 ? '#2a1a10' : '#3a2416';
});
OBJ.push({ id:'docbox', x:-12, y:12, rot:0.15, show:()=> LINE.jokbo.length > 0, click:()=>showDocbox() });
function showDocbox(){
  openOv('<h3>문서함</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">앞 대들이 남긴 것. 책장에 꽂지 않고 서안 곁에 둔다.</div>'
    + [['dJ', '집안 족보 — 대마다 한 줄'], ['dC', '가환록(家患錄)'], ['dG', '가훈첩(家訓帖)'], ['dR', '유품 — ' + LINE.relics.map(r => RELIC[r] ? RELIC[r].name : r).join(' · ')]]
      .map(([id, t]) => `<div class="rec" id="${id}" style="margin:8px 0">${t}</div>`).join(''));
  const on = (id, f) => document.getElementById(id).addEventListener('click', ev => { ev.stopPropagation(); f(); });
  on('dJ', () => openOv('<h3>집안 족보</h3>' + LINE.jokbo.map(j => `<div style="margin:6px 0">${genHj(j.gen)}世. ${esc(LINE.sur + j.name)} — ${esc(j.end)}<span style="font-size:12px;opacity:.55"> (${j.days}일, 가훈 「${GAHUN[j.gahun] ? GAHUN[j.gahun].t : '—'}」${j.mode === 'hard' ? ', 빗장을 열어 둔 채' : ''})</span></div>`).join('')
    + `<div style="margin:6px 0">${genHj(LINE.gen)}世. ${esc(LINE.sur + S.name)} — </div>`));
  on('dC', () => openOv('<h3>가환록(家患錄)</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">집안에 든 우환을 대마다 적어 둔 책. 겪은 일만 적혀 있다.</div>'
    + Object.keys(LINE.codex).map(id => `<div style="margin:12px 0"><b>${END[id] ? END[id].name : id}</b>${LINE.codex[id].n > 1 ? ` <span style="font-size:12px;opacity:.55">— ${LINE.codex[id].n}번</span>` : ''}<br>${esc(LINE.codex[id].line)}${END[id] && END[id].only ? `<div style="font-size:13px;margin-top:6px">${END[id].only()}</div>` : ''}</div>`).join('')));
  on('dG', () => openOv('<h3>가훈첩</h3>' + GAHUN.map((g, i) => { const u = LINE.gahun.used[i] || 0; if (!gahunOpen().includes(i)) return '';
    return `<div style="margin:10px 0"><b>${g.t}</b>${S.gahun === i ? ' <span style="font-size:12px;opacity:.55">— 지금</span>' : ''}<br><span style="font-size:13px;opacity:.8">${u ? g.note[Math.min(1, u - 1)] + ` (${u}대)` : '아직 이 가훈으로 산 가주가 없다.'}</span></div>`; }).join('')));
  on('dR', () => openOv('<h3>유품</h3>' + LINE.relics.map(r => RELIC[r] ? `<div style="margin:10px 0"><b>${RELIC[r].name}</b><br><span style="font-size:13px">${RELIC[r].desc}</span></div>` : '').join('')));
}

// ── 둘째 대부터의 족보 첫 장: 성·본관은 그대로, 이름만(무작위로 하나 적혀 있고 바로 시작할 수 있음) ──
const NEW_NAMES = ['서윤', '하진', '도현', '은재', '지안', '태경', '수아', '민서', '선우', '재희', '윤슬', '해담', '시온', '가람', '도윤', '서진', '나린', '정우', '여름', '이현', '단우', '소율', '규원', '채운'];
const pickName = () => { const used = LINE.jokbo.map(j => j.name).concat([S.name]); const p = NEW_NAMES.filter(n => !used.includes(n)); return p[Math.floor(Math.random() * p.length)] || '서하'; };
function rebirthJokbo(){
  if (LINE.gen <= 17) return;
  const box = document.querySelector('#sJokbo .hanji'), rows = [...box.querySelectorAll('.row')];
  const r17 = rows.find(r => r.querySelector('.gen') && r.querySelector('.gen').textContent === '十七世');
  const past = LINE.jokbo.slice(-4).map(j => `<div class="row"><span class="gen">${genHj(j.gen)}世</span><span>${esc(LINE.sur + j.name)} — ${esc(j.end)}</span></div>`).join('');
  r17.outerHTML = (LINE.jokbo.length > 4 ? '<div class="row faint"><span class="gen">…</span></div>' : '') + past + `<div class="row"><span class="gen">${genHj(LINE.gen)}世</span></div>`;
  iSur.value = LINE.sur; iBon.value = LINE.bon;
  const sr = iSur.closest('.row'); sr.style.display = 'none';
  sr.insertAdjacentHTML('afterend', `<div class="row"><label>성(姓)</label><span>${esc(LINE.sur)}</span><label>본관</label><span>${esc(LINE.bon)}</span></div>`);
  iName.value = ''; iName.placeholder = pickName();
  iName.insertAdjacentHTML('afterend', '<span class="rec" id="bReName" style="font-size:12px;opacity:.55;white-space:nowrap;cursor:pointer">다른 이름</span>');
  document.getElementById('bReName').addEventListener('click', () => { iName.value = ''; iName.placeholder = pickName(); });
}
rebirthJokbo();
// 가훈 족자(둘째 대부터): 물려받은 것 + 끝으로 풀린 것. 살아 본 가훈에만 족보 말투의 설명이 곁에 붙음
document.getElementById('gahunWrap').innerHTML = gahunOpen().map(i => { const g = GAHUN[i], u = LINE.gahun.used[i] || 0;
  return `<div class="scroll" data-g="${i}">${esc(g.t)}${u ? `<span class="gnote">${esc(g.note[Math.min(1, u - 1)])}</span>` : ''}</div>`; }).join('');

// ── 대문의 빗장 = 기본/하드 모드 (환생 명세 10-12): 1대엔 녹슬어 안 움직임, 첫 강제 환생 뒤 새 대 시작 때 대문 앞에서 처음 고름(한 대에 한 번) ──
// 지금은 물건과 고르기만 — 하드의 보상(도감 두 번째 장·칭호·'집을 비우다')은 뒤 묶음.
M.barShut = model(12, 1, 2, (x, y, z) => (x === 0 || x === 11) ? '#a8873e' : (z ? '#5e3c22' : '#4a2e18'));
M.barRust = model(12, 1, 2, (x, y, z) => (x === 0 || x === 11) ? '#6e5236' : ((x * 3 + z) % 4 ? '#5a3e2a' : '#8a4a26'));
M.barOpen = model(2, 1, 12, (x, y, z) => (z === 0 || z === 11) ? '#a8873e' : (x ? '#5e3c22' : '#4a2e18'));   // 빼서 문짝 옆에 세워 둠
GATE_OBJ.push({ id:'gBar', y:-19.6, rot:0, on:()=>'gate', get x(){ return S.mode === 'hard' ? -8 : 0; }, get z(){ return S.mode === 'hard' ? 2 : 5; },
  m:()=> LINE.gen <= 17 ? 'barRust' : S.mode === 'hard' ? 'barOpen' : 'barShut', show:()=> Math.cos(viewA) > 0.05, click:()=>showBar(), glow:()=> LINE.gen > 17 && !S.mode });
const MODE_TXT = {
  basic: ['문을 잠그고 떠난다', '당신이 없는 동안 서고는 버팁니다. 다만 아무 일도 일어나지 않는 것은 아닙니다.'],
  hard:  ['문을 열어 두고 떠난다', '당신이 없는 동안에도 서고는 살아 있습니다. 돌아왔을 때 당신이 아닌 당신의 자식이 이 글을 읽고 있을 수도 있습니다. 그렇게만 얻을 수 있는 것들이 있습니다.'],
};
function showBar(){
  if (LINE.gen <= 17) return openOv('<h3>빗장</h3>대문의 빗장. 녹슬어 움직이지 않는다.');
  if (S.mode) return openOv(`<h3>빗장</h3>${S.mode === 'hard' ? '빗장을 빼서 문짝 옆에 세워 두었다. 대문은 열려 있다.' : '빗장이 걸려 있다.'}<br><span style="font-size:13px;opacity:.7">이 대 동안은 이대로다.</span>`);
  openOv('<h3>빗장</h3>녹이 벗겨져 있다. 누군가 기름을 먹여 둔 것 같다.<br>이번 대에는 어떻게 하고 떠날 것인가. <span style="font-size:12px;opacity:.6">(한 대에 한 번 — 이 대 동안 못 바꾼다)</span>'
    + Object.keys(MODE_TXT).map(k => `<div class="rec" data-mode="${k}" style="margin:12px 0;padding:10px 12px;border:1px solid #00000033"><b>${MODE_TXT[k][0]}</b><br><span style="font-size:13px">${MODE_TXT[k][1]}</span></div>`).join(''),
    () => { if (!S.mode) setTimeout(showBar, 300); });              // 처음엔 고르지 않고 닫을 수 없음
  ovBody.querySelectorAll('[data-mode]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation();
    S.mode = el.dataset.mode; LINE.mode = S.mode; saveLine(); save(); ov._onClose = null; ov.classList.add('hidden');
    noise(0.4, 300, 0.12, 'lowpass'); setTimeout(() => noise(0.15, 160, 0.2, 'lowpass'), 350);   // 빗장 소리
    if (typeof tlog === 'function') tlog('빗장: ' + MODE_TXT[S.mode][0]);
    if (!S.opened) setTimeout(() => { goScene('seogo'); enterRoom(); }, 900);   // 새 대의 첫 서고로
  }));
}
// 새 대 시작(이름 → 가훈) 다음: 아직 안 골랐으면 대문 앞으로
let barAsked = false;
HOOK.tick.push(() => {
  if (barAsked || LINE.gen <= 17 || S.mode || S.stage !== 'room' || S.ended || !ov.classList.contains('hidden')) return;
  barAsked = true; if (bookOpen) closeBook(); if (S.scene !== 'gate') goScene('gate'); setTimeout(showBar, 900);
});
