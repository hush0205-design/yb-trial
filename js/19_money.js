'use strict';
// ───────── 돈 (10/5 선생님, 자원과 돈.md) ─────────
// 단위 냥·전·푼(1냥 = 10전 = 100푼, 속은 푼으로 셈). 유산 = 궤짝 바닥의 엽전 꾸러미.
// 쪽 = 물건이 나타나는 문턱, 돈 = 실제 값(쪽은 쓰지 않음). 쪽을 돈으로 바꾸는 길 = 사본 팔기(필사 → 세책점 거간).
// 돈은 궤짝에 쌓임 — 궤짝을 눌러야 얼마인지 보임. 돈 관리를 맡을 사람(S.steward)이 생기면 윗줄 쪽 옆에 뜸.
// 녹봉(쌀 — 모자라면 돈으로 사서 내줌)은 돈 관리하는 사람이 오기 전까지 가주가 궤짝에서 직접 내줌.
if (S.money == null) S.money = 500;                    // 유산 5냥
function fmtM(n){
  n = Math.max(0, Math.round(n || 0));
  const y = Math.floor(n / 100), j = Math.floor(n % 100 / 10), p = n % 10, out = [];
  if (y) out.push(y + '냥'); if (j) out.push(j + '전'); if (p) out.push(p + '푼');
  return out.length ? out.join(' ') : '0푼';
}
// 값(푼) — 숫자는 만들면서 맞춤
const PRICE = { lamp:30, brush:50, desk:80, glass:100, sundial:200, ld1:100, ld2:150, ld3:200, ld4:300, ld5:500 };
const priceOf = o => PRICE[o.id] != null ? PRICE[o.id] : 0;
const readTotal = () => Math.max(S.earned || 0, S.pages || 0);   // 문턱 = 지금까지 읽은 총량(쓴 쪽과 상관없이, 10/6 선생님)
const canBuy = o => readTotal() >= o.buy.cost && (S.money||0) >= priceOf(o);
askBuy = function(o){
  const c = priceOf(o), ok = canBuy(o);
  openOv(`<h3>${o.buy.name}</h3>값: ${fmtM(c)}<br>궤짝의 엽전: ${fmtM(S.money)}`
    + (ok ? '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bBuy" style="color:var(--ink);border-color:#00000066">들인다</button></div>'
          : `<div style="margin-top:10px;opacity:.75">${fmtM(c - (S.money||0))} 모자란다.${S.rArrived ? '<br>사본을 베껴 팔면 돈이 된다.' : ''}</div>`));
  const b = document.getElementById('bBuy'); if (b) b.addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); buy(o); });
};
buy = function(o){
  if (!canBuy(o)) return; S.money -= priceOf(o); S.owned[o.id] = true; tlog('들임: ' + o.buy.name + ' ' + fmtM(priceOf(o)));
  if (o.id === 'desk'){ ensureLoc(); ITEMS.forEach(k => { if (S.loc[k] === 'desk') S.loc[k] = 'shelf'; }); }
  noise(0.08, 3000, 0.04); setTimeout(() => noise(0.06, 2600, 0.03), 90);                     // 엽전 소리
  sPlace(); save(); if (ITEM[o.id]) showItem(o.id);
};
const ledger = (t) => { S.ledger = (S.ledger || []).concat([t]).slice(-60); };

// ── 녹봉: 날이 바뀔 때마다 밀린 녹봉이 쌓임. 가주가 궤짝에서 내줌(돈 관리하는 사람이 오면 저절로) ──
const WAGE = k => k === 'sj' || k === 'ojr' ? 50 : 30;      // 반장 5전, 일반 3전(쌀 값으로)
const payees = () => [...(S.rArrived ? ['sj'] : []), ...allKeys().filter(k => S.st[k] && S.st[k].arr && !S.st[k].gone)];
const wName = k => k === 'sj' ? '한서진' : DEF(k).name;
function payTick(){
  const today = dayKey();
  if (S.payDay == null){ S.payDay = today; return; }
  let changed = false;
  // 밀린 날(days)은 달력 날짜로 셈 — 비운 동안에도 사흘이면 떠남(10/6 선생님: '들어온 날만 세기' 안을 물어보고 되돌림. 돌아올 이유 = 누가 빠졌는지)
  while (S.payDay < today){
    S.payDay++; changed = true;
    S.owe = S.owe || {};
    for (const k of payees()){ const o = S.owe[k] = S.owe[k] || { amt:0, days:0 }; o.amt += WAGE(k); o.days++; }
  }
  if (S.steward) payAll(true);
  // 밀린 녹봉의 대가: 사흘 밀린 일반 연구원은 떠남(돌아와 보면 짐을 싸서 나가는 중 → 쪽지)
  for (const k of Object.keys(S.owe || {})){
    const o = S.owe[k]; if (!o.days) continue;
    if (k !== 'sj' && isGen(k) && o.days >= 3 && S.st[k] && !S.st[k].gone && !S.errs[k] && working(k) && !(typeof holdQuit === 'function' && holdQuit(k, 'wage'))){   // 기본 모드: 넷째는 대문 앞에서 기다림 / 비운 셈으로는 끝 바로 앞에서 멈춤(19_rebirth)
      S.st[k].wageQuit = true; S.st[k].homeN = 3; goHome(k); changed = true;
    }
    if (k === 'sj' && o.days >= 2 && !S.oweNoteSJ){ S.oweNoteSJ = true; pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '녹봉이 이틀째 밀렸습니다.', '쌀독이 비어 갑니다.', '궤짝을 한번 살펴 주십시오.'], '한서진 올림.', 'min(40vh,280px)')); changed = true; }
  }
  if (changed) save();
}
const oweTotal = () => Object.values(S.owe || {}).reduce((a, o) => a + o.amt, 0);
const oweDays = k => (S.owe && S.owe[k] && S.owe[k].days) || 0;
function payAll(auto){
  let paid = 0; const who = [];
  for (const k of Object.keys(S.owe || {})){
    const o = S.owe[k]; if (!o.amt) continue;
    if ((S.money||0) < o.amt) continue;
    S.money -= o.amt; paid += o.amt; who.push(`${wName(k)} ${fmtM(o.amt)}`); o.amt = 0; o.days = 0;
    if (k === 'sj') S.oweNoteSJ = false;
  }
  if (paid){ ledger(`녹봉(쌀) ${fmtM(paid)} — ${who.join(', ')}${auto ? ' (청지기가 내줌)' : ''}`); save(); }
  return paid;
}
// 밀린 녹봉: 겁이 더 빨리 참(×1.2)
const owePenalty = k => oweDays(k) > 0 ? 1.2 : 1;

// ── 궤짝: 엽전 꾸러미와 녹봉 ──
{ const ec = showEmptyChest; showEmptyChest = function(){
    if (S.jokboDone && !S.mapFound) return ec();
    const top = S.mapFound ? '바닥 안감을 들춘 자리 옆에' : '책을 꺼낸 궤짝 바닥에';
    const owe = oweTotal(), list = Object.keys(S.owe || {}).filter(k => S.owe[k].amt).map(k => `${wName(k)} ${S.owe[k].days}일치 ${fmtM(S.owe[k].amt)}`);
    openOv(`<h3>궤짝</h3>${top} 엽전 꾸러미가 있다. 집안에 남은 돈이다.<div style="font-size:20px;text-align:center;margin:12px 0;letter-spacing:2px">${fmtM(S.money)}</div>`
      + (owe ? `<div style="font-size:13px;opacity:.85">밀린 녹봉(쌀 값): ${list.join(' · ')}</div><div style="text-align:center;margin-top:10px"><button class="btn rec" id="bPay" style="color:var(--ink);border-color:#00000066">녹봉을 내준다 — ${fmtM(owe)}</button></div>`
             : (payees().length ? '<div style="font-size:12px;opacity:.6">녹봉은 다 내주었다. 날이 바뀌면 또 내줘야 한다.</div>' : ''))
      + ((S.ledger || []).length ? '<div class="rec" id="bLedger" style="text-align:center;font-size:12px;opacity:.6;margin-top:10px">치부책 보기</div>' : ''));
    const b = document.getElementById('bPay'); if (b) b.addEventListener('click', ev => { ev.stopPropagation();
      const p = payAll(false); if (!p){ openOv('<h3>궤짝</h3>엽전이 모자라 아무에게도 내주지 못했다.<br>사본을 베껴 팔아야 한다.'); return; }
      noise(0.08, 3000, 0.04); setTimeout(() => noise(0.06, 2600, 0.03), 90); showEmptyChest(); });
    const l = document.getElementById('bLedger'); if (l) l.addEventListener('click', ev => { ev.stopPropagation(); openOv(ledgerHtml()); });
  }; }
const ledgerHtml = () => '<h3>치부책(置簿冊)</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">궤짝 속 엽전이 드나든 것을 적어 두는 책.</div>' + (S.ledger || []).slice().reverse().map(t => `<div style="margin:5px 0">${t}</div>`).join('');

// ── 필사: 다 읽을 수 있는 책을 베껴 세책점에 팖(1권 = 100쪽을 쓰고, 일한 시간 30분) ──
const COPY = { c_sohak:{ name:'소학(小學)', price:50 }, c_nong:{ name:'농가집성(農家集成)', price:80 }, c_dongui:{ name:'동의보감(東醫寶鑑)', price:120 } };
const COPY_SEC = 1800, COPY_PAGES = 100;
const isCopy = it => !!it && it.startsWith('c_');
function setStaffItem(k, it){
  const s = S.st[k], was = s.item;
  if (isCopy(it) && !isCopy(was)){
    if (S.pages < COPY_PAGES){ openOv(`<h3>필사</h3>베낄 종이와 먹이 모자란다.<br>쓸 수 있는 쪽이 ${fmtP(COPY_PAGES)}은 있어야 한다.`); return false; }
    S.pages -= COPY_PAGES; s.copyAcc = 0;
  } else if (isCopy(was) && !isCopy(it)){
    S.pages += Math.round(COPY_PAGES * (1 - Math.min(1, (s.copyAcc||0) / COPY_SEC)));   // 베끼다 만 만큼 돌려받음
    s.copyAcc = 0;
  } else if (isCopy(was) && isCopy(it)) s.copyAcc = 0;
  s.item = it; return true;
}
function copyWork(k, s, dt){
  s.copyAcc = (s.copyAcc||0) + dt;
  if (s.copyAcc < COPY_SEC) return;
  const c = COPY[s.item]; S.copies = (S.copies || []).concat([s.item]);
  S.sideLog = (S.sideLog || []).concat([['sj', `${josa(DEF(k).name, '이', '가')} ${c.name.split('(')[0]} 한 권을 다 베꼈다. 문갑 위에 올려 두었다.`]]).slice(-40);
  if (!S.copyNoteDone){ S.copyNoteDone = true; pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '베낀 사본은 문갑 위에 올려 두었습니다.', '세책점 거간이 대문 앞에 오면', '넘겨주시면 값을 쳐 줄 것입니다.'], '한서진 올림.', 'min(44vh,320px)')); }
  if (!S.dealerAt) S.dealerAt = Date.now() + 60000;
  s.item = 'first'; s.manual = false; s.copyAcc = 0;
  if (typeof tlog === 'function') tlog('필사 끝: ' + DEF(k).name + ' ' + c.name);
  save();
}
const copyOpts = (s, o) => `<div class="opt rec"><span>필사(베껴 팔 것)</span><span class="ch">${o('c_sohak', '소학')}${o('c_nong', '농가집성')}${S.sideRead.dongui ? o('c_dongui', '동의보감') : ''}</span></div>`
  + (isCopy(s.item) ? `<div style="font-size:12px;opacity:.6">${COPY[s.item].name}을 베끼는 중 — ${Math.floor(100 * (s.copyAcc||0) / COPY_SEC)}%. 베끼는 동안은 쪽이 늘지 않는다.</div>` : `<div style="font-size:12px;opacity:.6">필사를 맡기면 쓸 수 있는 쪽 ${fmtP(COPY_PAGES)}을 쓴다. 다 베끼면 세책점에 팔 수 있다.</div>`);
// 문갑 위의 사본 묶음
M.copyPile = model(7,9,4,(x,y,z)=> (x === 6 ? (y % 2 ? '#e8e0cc' : '#c9bfa6') : (x === 0 || y === 0 || y === 8) ? '#8a7a5a' : '#d8cdb0'));
OBJ.push({ id:'copies', x:12, y:-22, z:9, rot:0, on:()=>'mungap', onOrder:0.02, m:()=>'copyPile', show:()=> (S.copies || []).length > 0 && S.D >= T.door,
  click:()=>openOv(`<h3>사본 묶음</h3>베껴 둔 사본 ${(S.copies || []).length}권: ${S.copies.map(c => COPY[c].name.split('(')[0]).join(', ')}.<br><br>세책점 거간이 대문 앞에 오면 넘긴다.`) });

// ── 세책점 거간: 사본이 있으면 대문 앞에 옴 ──
const DEALER_O = { robe:['#4a4e52', '#3e4246', '#2e3236'], belt:'#2a2a2a', belt2:'#1a1a1a', hat:'gat' };
let DEALER = null;
function dealerDolls(){
  if (!(S.copies || []).length || !S.dealerAt || Date.now() < S.dealerAt) return [];
  if (!DEALER){ const sets = dollSet(drawSeonbi, DEALER_O);
    DEALER = { id:'dealer', doll:true, img: sets[0], imgL: sets, shadow:false, st:()=>({ x:-9, y:-11, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0, steam:()=>0, arrT:()=>0, show:()=>true, click:()=>sellCopies() }; }
  return [DEALER];
}
let dealerKnocked = false;
function dealerTick(){ if ((S.copies || []).length && S.dealerAt && Date.now() >= S.dealerAt && !S.dealerKnock){ S.dealerKnock = true; save(); knock(S.scene === 'gate' ? 1 : 0.5); } }
function sellCopies(){
  const cs = S.copies || [], sum = Math.round(cs.reduce((a, c) => a + COPY[c].price, 0) * gahunK('copy'));   // 가훈 「곡간을 먼저 채워라」
  openOv(`<h3>세책점 거간</h3>장터 세책점에서 왔다며 사본을 들여다본다.<br><br>${cs.map(c => `${COPY[c].name} — ${fmtM(COPY[c].price * gahunK('copy'))}`).join('<br>')}<br><br>모두 ${fmtM(sum)}을 쳐 주겠다고 한다.${S.debt ? `<br>그중 ${fmtM(Math.min(S.debt, Math.floor(sum / 2)))}은 외상 갚음으로 뗀다.` : ''}`
    + '<div style="text-align:center;margin-top:12px"><button class="btn rec" id="bSell" style="color:var(--ink);border-color:#00000066">넘긴다</button></div>');
  document.getElementById('bSell').addEventListener('click', ev => { ev.stopPropagation();
    const debtPay = Math.min(S.debt || 0, Math.floor(sum / 2)); S.debt = (S.debt || 0) - debtPay;   // 외상(19_rebirth): 갚을 때까지 사본 값의 절반을 뗌
    S.money = (S.money||0) + sum - debtPay; ledger(`사본 ${cs.length}권을 세책점에 넘김 + ${fmtM(sum - debtPay)}${debtPay ? ` (외상 갚음 ${fmtM(debtPay)} 뗌${S.debt ? `, 남은 외상 ${fmtM(S.debt)}` : ', 외상을 다 갚음'})` : ''}`); S.copies = []; S.dealerAt = 0; S.dealerKnock = false; S.soldN = (S.soldN||0) + cs.length; save();
    ov.classList.add('hidden'); noise(0.08, 3000, 0.04); setTimeout(() => noise(0.06, 2600, 0.03), 90); setTimeout(() => noise(0.08, 2800, 0.03), 200);
    if (typeof tlog === 'function') tlog('사본 팜 ' + fmtM(sum));
    if (S.steward) return;
    setTimeout(() => queueOv(`<h3>엽전</h3>${fmtM(sum)}을 받아 궤짝에 넣었다.`), 400); });
}
// 녹봉이 밀려 있으면 궤짝이 은은히 빛남(구석으로 치운 뒤)
{ const ch = OBJ.find(o => o.id === 'chest'), g0 = ch.glow2; ch.glow2 = () => g0() || (!!S.owned.desk && oweTotal() > 0); }
