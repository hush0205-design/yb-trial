'use strict';
// ───────── 안전장치 — 기본 모드가 끝 바로 앞에서 멈추는 장치들 (10/7 선생님, 10/8 19_rebirth에서 나눔) ─────────
// ① 비운 동안 쌓인 셈으로는 끝 바로 앞에서 멈춤(기본) — 끝은 들어와 있을 때만. 하드는 비운 동안에도 끝까지(기획서 9절).
// ② 넷째로 떠날 사람은 짐을 싸 들고 대문 앞에서 3분 기다림 — 녹봉을 내주거나 쉬라고 보내면 남음. 한 대에 한 번. 하드도 같은 장면(시간은 비운 동안에도 흐름).
// ③ 쌀독이 닷새째가 되는 순간 서안에 빈 편지지(돈을 꾸는 편지) — 안 쓰고 두면 3분 뒤 끝. 돈을 꾸는 편지는 궤짝 창에서 언제든 미리(기본·하드 모두).
// 쌀독 날수(riceTick)도 여기. 끝 표(END)는 19_rebirth.
const AWAY = S.stage === 'room' && Date.now() - (S.lastSeen || Date.now()) > 180000;   // 20_main이 lastSeen을 새로 쓰기 전에 봄
const LOAD_T = performance.now(), PREV_SEEN = S.lastSeen || Date.now();
const catchingUp = () => AWAY && performance.now() - LOAD_T < 8000;                    // 돌아온 직후 몇 초 = 비운 동안의 셈을 따라잡는 때
const holdEnd = () => S.mode !== 'hard' && catchingUp();
const quittingNow = () => genKeys().filter(k => S.st[k] && !S.st[k].quit && S.errs[k] && S.errs[k].home && homeN(k) >= 3).length;

// ── 넷째로 떠날 사람이 대문 앞에서 기다림 (17_why·19_money가 holdQuit을 부름) ──
function holdQuit(k, kind){
  if (END.nobody.n() + quittingNow() + 1 < END.nobody.lim()) return false;
  if (!S.standUsed && k){ startStand(k, kind); return true; }
  return S.mode !== 'hard' && catchingUp();                         // 장치를 이미 썼으면: 기본은 비운 셈으로는 안 떠나고 들어와 계실 때 떠남
}
const STAND_MS = 180000;
function startStand(k, kind){
  const P = DEF(k), s = S.st[k];
  // 하드에서 비운 동안 생긴 일이면 그날이 바뀐 때(또는 자리를 비운 때)부터 이미 기다리고 있었던 것으로
  const dayStart = S.opt.gameTime ? dayKey() * 7200e3 : dayKey() * 86400e3 - 9*3600e3;
  const t0 = S.mode === 'hard' && catchingUp() ? Math.max(PREV_SEEN, dayStart) : Date.now();
  S.standUsed = true; S.stand = { k, kind, ms:0, t0 }; s.stand = true;
  pushNote('<h3>쪽지</h3>' + vlet(kind === 'wage'
    ? ['가주께.', '녹봉이 사흘째 밀렸습니다.', '짐을 싸서 대문 앞에 나와 있습니다.', '밀린 것만 받으면 남겠습니다.', '해가 기울기 전에 말씀 주십시오.']
    : ['가주께.', '이 서고 일은 더 못 하겠습니다.', '짐을 싸서 대문 앞에 나와 있습니다.', '다만 하루만 쉬게 해 주시면', '다시 해 볼 수도 있겠습니다.'], `${P.name}(${P.hj}) 올림.`, 'min(48vh,340px)'));
  if (typeof tlog === 'function') tlog('대문 앞에서 기다림: ' + P.name); save();
}
function standTick(dt){
  if (!S.stand) return;
  const s = S.st[S.stand.k]; if (!s || s.gone || !s.stand){ S.stand = null; save(); return; }
  S.stand.ms += dt * 1000;
  if (S.stand.ms >= STAND_MS || (S.mode === 'hard' && Date.now() - (S.stand.t0 || Date.now()) >= STAND_MS)) standLeave();   // 기본: 들어와 계신 시간만 / 하드: 실제 시간
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
      sCoin();
    }
    s.stand = false; S.stand = null;
    if (kind === 'fear'){ s.homeN = 2; s.fear = Math.min(s.fear || 0, 0.6); goHome(k); }
    if (typeof tlog === 'function') tlog('붙잡음: ' + P.name); save(); ov.classList.add('hidden'); sPlace(); });
  document.getElementById('bStGo').addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); standLeave(); });
}
// 대문 앞에 짐을 싸 들고 선 인형 — 대문 인형 목록 훅(14_gate gateDolls가 HOOK.dolls.gate를 돎)
const STAND_DOLLS = {};
function standDolls(){
  if (!S.stand || !S.st[S.stand.k] || !S.st[S.stand.k].stand) return [];
  const k = S.stand.k;
  if (!STAND_DOLLS[k]){ const d = dollFor(k);
    STAND_DOLLS[k] = { id:'gs_' + k, doll:true, img: d.img, imgL: d.imgL, shadow: d.shadow, st:()=>({ x:-7, y:-12, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0.5, steam:()=>0, arrT:()=>0, show:()=>true, click:()=>showStand() }; }
  return [STAND_DOLLS[k]];
}
HOOK.dolls.gate.push(standDolls);

// ── 돈을 꾸는 편지 (10/7 선생님): 받는 이는 가문에서 처음엔 먼 일가(빚 없음, 대신 경고 한 줄, 다시는 안 도움) → 그다음부터 세책점(빚 — 사본 값에서 절반씩, 기획서 14-4 ③).
// ① 언제든 미리: 궤짝 창의 '돈을 꾸는 편지를 쓴다'(기본·하드 모두 — 하드도 같은 편지·답장을 다 볼 수 있게). 세책점 빚이 남아 있으면 더 못 꿈.
// ② 기본 모드의 안전장치: 쌀독이 닷새째가 되는 순간 끝내지 않고 서안에 빈 편지지 — 안 쓰고 두면 들어와 계신 동안 3분 뒤 끝. 한 대에 한 번. 하드엔 이 장치만 없음(미리 꿔 둬야 함).
// 보내면 1분 뒤 답장과 엽전 1냥, 쌀독 날수는 처음으로.
const CREDIT = 100, LOAN_REPLY_MS = 60000;
const loanTo = () => LINE.loanKin ? 'dealer' : 'kin';
const loanAvail = () => !S.credit && !(LINE.loanKin && (S.debt || 0) > 0);
function loanChestHtml(){
  if (S.credit) return `<div style="font-size:12px;opacity:.65;text-align:center;margin-top:10px">${S.credit.sent ? '돈을 꾸는 편지를 보냈다. 답장을 기다린다.' : '서안에 돈을 꾸는 편지지를 펴 두었다.'}</div>`;
  const debt = (S.debt || 0) > 0 ? `<div style="font-size:13px;opacity:.8;margin-top:8px">세책점 외상: ${fmtM(S.debt)} — 사본을 팔 때마다 절반씩 갚는다.</div>` : '';
  if (!loanAvail()) return debt;
  return debt + `<div style="text-align:center;margin-top:10px"><span class="rec" id="bLoanW" style="font-size:13px;opacity:.75">돈을 꾸는 편지를 쓴다 — ${loanTo() === 'kin' ? '먼 일가 어른께' : '세책점에'}</span></div>`;
}
function loanChestBind(){
  const b = document.getElementById('bLoanW'); if (!b) return;
  b.addEventListener('click', ev => { ev.stopPropagation(); S.credit = { ms:0, to: loanTo(), early:true }; save(); sPlace(); showLoan(); });
}
function riceReach(L){
  if (S.mode === 'hard' || S.creditUsed) return L;
  if (S.credit){ S.creditUsed = true; if (!S.credit.sent) S.credit.early = false; save(); return L - 1; }   // 이미 편지지를 펴 뒀거나 보낸 중이면 그걸로 버팀(안 보냈으면 이제부터 3분)
  if (!loanAvail()) return L;                                        // 세책점 빚이 남아 더 꿀 데가 없음
  S.creditUsed = true; S.credit = { ms:0, to: loanTo() };
  pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '오늘 아침 쌀독이 비었습니다.', '서안에 편지지를 펴 두었습니다.', S.credit.to === 'kin' ? '먼 일가 어른께라도 한 줄 넣어 보심이 어떨지요.' : '부끄러운 일이나, 세책점에라도 넣어 보셔야겠습니다.'], '한서진 올림.', 'min(46vh,330px)'));
  if (typeof tlog === 'function') tlog('쌀독이 빔 — 서안에 편지지'); save(); sPlace();
  return L - 1;
}
function creditTick(dt){
  if (!S.credit) return;
  if (S.credit.sent){ if (Date.now() - S.credit.sent >= LOAN_REPLY_MS) loanReply(); return; }
  if (S.credit.early) return;                                         // 미리 펴 둔 편지지는 재촉하지 않음
  S.credit.ms += dt * 1000;
  if (S.credit.ms >= STAND_MS) creditEnd();
}
function creditEnd(){ S.credit = null; S.creditUsed = true; S.riceN = END.rice.lim(); if (typeof tlog === 'function') tlog('돈을 꾸는 편지를 쓰지 않음'); save(); }
function showLoan(){
  const kin = S.credit.to === 'kin';
  const body = kin ? ['일가 어른께.', '오래 소식 드리지 못했습니다.', '집안 서고를 다시 열었으나', '쌀독이 비어 사람들을 먹일 길이 없습니다.', '엽전 한 냥만 꾸어 주시면', '서고가 일어서는 대로 갚겠습니다.']
                   : ['세책점 주인께.', '사본을 넘기던 집입니다.', '쌀독이 비어 염치없이 청합니다.', '엽전 한 냥을 꾸어 주시면', '다음 사본들로 갚겠습니다.'];
  openOv('<h3>편지</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">서안에 펴 둔 편지지. 쓸 말은 정해져 있다.</div>' + vlet(body, esc(S.sur + S.name), 'min(50vh,360px)')
    + '<div style="text-align:center;margin-top:12px"><button class="btn rec" id="bLoan" style="color:var(--ink);border-color:#00000066">보낸다</button></div>');
  document.getElementById('bLoan').addEventListener('click', ev => { ev.stopPropagation();
    S.credit.sent = Date.now(); S.loanSent = (S.loanSent || 0) + 1; save();   // 도전 '손 벌리지 않다' 판정용(엔딩 때)
    ov.classList.add('hidden'); sPlace(); sFlip();
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
  sCoin();
  if (typeof tlog === 'function') tlog('돈을 꾼 답장이 옴 — ' + (kin ? '먼 일가' : '세책점')); save(); sPlace();
}
// 서안 위 빈 편지지(서안이 없으면 바닥에)
OBJ.push({ id:'loanPaper', x:3, y:7, z:8, rot:0.15, m:()=>'letter', on:()=>'desk', onOrder:0.02, show:()=> !!S.owned.desk && !!S.credit && !S.credit.sent, click:()=>showLoan(), glow:()=>true },
         { id:'loanPaper2', x:6, y:10, rot:0.15, m:()=>'letter', show:()=> !S.owned.desk && !!S.credit && !S.credit.sent, click:()=>showLoan(), glow:()=>true });

// ── 쌀독: 날이 바뀔 때 궤짝이 바닥(가장 싼 녹봉보다 적음)이고 별채에 일하는 사람이 없으면 하루씩 ──
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
HOOK.tick.push(dt => { if (S.stage !== 'room' || S.ended) return; standTick(dt); creditTick(dt); riceTick(); riceOwedTick(); });
