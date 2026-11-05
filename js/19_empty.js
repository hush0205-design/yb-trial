'use strict';
// ───────── 빈 별채 (기획서 14-4 '사람이 없을 때' — 체험판 몫 ①④, 10/31) ─────────
// ① 한서진 필사: 별채의 일반 연구원이 다 떠나면 한서진 쪽지 "제가 사본을 베낄까요" → 한서진 창에서 맡김. 맡기면 읽기를 멈추고 사본을 씀(별채 필사와 같은 쪽·시간). 별채에 사람이 다시 앉으면 그만둠.
// ④ 되부르기: 녹봉 때문에 떠난 사람은 문갑 '떠난 사람' 서랍에 — 밀린 것과 사례(하루 녹봉)를 보내면 이튿날 다시 지원서. 돌아온 사람은 겁이 덜 참(12_lab genDef). 겁에 질려 떠난 이·내보낸 이는 안 옴. 한 사람에 한 번.
const labEmpty = () => !!S.rArrived && genKeys().some(k => S.st[k] && S.st[k].arr) && !genKeys().some(k => S.st[k] && S.st[k].arr && !S.st[k].gone);
const sjCopyBook = () => S.sideRead.dongui ? 'c_dongui' : hasBook('nong1') || hasBook('nong2') ? 'c_nong' : hasBook('sohak') ? 'c_sohak' : null;   // 값이 높은 것부터
const sjCopying = () => !!S.sjCopy && !!S.sjCopyOn;                                  // 베끼는 동안 한서진은 읽지 않음(08 tick)
const sideLine = t => { S.sideLog = (S.sideLog || []).concat([['sj', t]]).slice(-40); };
function sjCopyStop(){
  if (S.sjCopyOn) S.pages += Math.round(COPY_PAGES * (1 - Math.min(1, (S.sjCopyAcc || 0) / copySec())));   // 베끼다 만 만큼 돌려받음(19_money setStaffItem과 같게)
  S.sjCopy = false; S.sjCopyOn = null; S.sjCopyAcc = 0; save();
}
function sjCopyTick(dt){
  const sjHere = S.rArrived && !isNight() && !S.errs.sj;
  if (!labEmpty()){ S.sjAskNote = false; if (S.sjCopy){ sjCopyStop(); sideLine('별채에 사람이 들어, 한서진이 다시 제 책을 폈다.'); save(); } return; }
  if (!S.sjAskNote && !S.sjCopy && sjHere){ S.sjAskNote = true; save();
    pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '별채가 비었습니다.', '제가 사본을 베낄까요.', '허락하시면 제 책상에 종이를 펴 두겠습니다.'], '한서진 올림.', 'min(40vh,280px)')); }
  if (!S.sjCopy || !sjHere) return;
  if (!S.sjCopyOn){ const c = sjCopyBook(); if (!c || S.pages < COPY_PAGES) return; S.pages -= COPY_PAGES; S.sjCopyOn = c; S.sjCopyAcc = 0; save(); }
  S.sjCopyAcc = (S.sjCopyAcc || 0) + dt;
  if (S.sjCopyAcc < copySec()) return;
  S.copies = (S.copies || []).concat([S.sjCopyOn]);
  sideLine(`한서진이 ${COPY[S.sjCopyOn].name.split('(')[0]} 한 권을 다 베꼈다. 문갑 위에 올려 두었다.`);
  if (!S.dealerAt) S.dealerAt = Date.now() + 60000;
  if (typeof tlog === 'function') tlog('필사 끝: 한서진 ' + COPY[S.sjCopyOn].name);
  S.sjCopyOn = null; S.sjCopyAcc = 0; save();
}
// 한서진 창에 맡기기 단추(창은 08 showResearcher — 덮어쓰지 않고 HOOK.ov로 붙임)
HOOK.ov.push(() => {
  const h = ovBody.querySelector('h3'); if (!h || !h.textContent.startsWith('연구원 — 한서진') || !(labEmpty() || S.sjCopy)) return;
  const d = document.createElement('div'); d.style.cssText = 'text-align:center;margin:8px 0';
  d.innerHTML = !S.sjCopy && !sjCopyBook() ? '<div style="font-size:12px;opacity:.6">별채가 비었다. 베낄 책이 책장에 없다.</div>'
    : `<button class="btn rec" id="bSjCopy" style="color:var(--ink);border-color:#00000066">${S.sjCopy ? '베끼기를 그만두게 한다' : '사본을 베껴 달라 한다'}</button>`
      + (S.sjCopyOn ? `<div style="font-size:12px;opacity:.6;margin-top:4px">${COPY[S.sjCopyOn].name.split('(')[0]}을 베끼는 중 — ${Math.floor(100 * (S.sjCopyAcc || 0) / copySec())}%</div>`
        : S.sjCopy && S.pages < COPY_PAGES ? `<div style="font-size:12px;opacity:.6;margin-top:4px">종이와 먹이 모자라 기다리고 있다.</div>` : '');
  h.after(d);
  const b = document.getElementById('bSjCopy'); if (b) b.addEventListener('click', ev => { ev.stopPropagation(); if (S.sjCopy) sjCopyStop(); else { S.sjCopy = true; save(); } showResearcher(); });
});

// ④ 떠난 사람
const leftWage = () => genKeys().filter(k => S.st[k] && S.st[k].gone && S.st[k].wageQuit && !S.st[k].backAt);
const backCost = k => ((S.owe && S.owe[k] && S.owe[k].amt) || 0) + WAGE(k);
function leftRecs(recs){
  if (leftWage().length) recs.push(['떠난 사람', () => '<h3>떠난 사람</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">녹봉을 못 받고 떠난 이들. 사는 곳이 적혀 있다.</div>'
    + leftWage().map(k => `<div style="margin:8px 0">${DEF(k).name}(${DEF(k).hj}) — ${(S.owe && S.owe[k] && S.owe[k].amt) ? '밀린 녹봉 ' + fmtM(S.owe[k].amt) : '밀린 것은 갚았다'}<div style="text-align:right"><button class="btn rec" data-back="${k}" style="color:var(--ink);border-color:#00000066;font-size:13px">사례를 얹어 보낸다 (${fmtM(backCost(k))})</button></div></div>`).join('')]);
}
HOOK.ov.push(() => {
  ovBody.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const k = el.dataset.back, amt = backCost(k);
    if ((S.money || 0) < amt){ openOv('<h3>떠난 사람</h3>궤짝에 엽전이 모자란다.'); return; }
    S.money -= amt; ledger(`밀린 녹봉과 사례 ${fmtM(amt)} — ${DEF(k).name}에게 보냄`); S.owe = S.owe || {}; S.owe[k] = { amt:0, days:0 };
    S.st[k].backAt = Date.now() + DAY_MS() * K.backDays; save();
    openOv(`<h3>떠난 사람</h3>밀린 것을 보냈다.<br>${DEF(k).name}의 집으로 가는 인편에 엽전 꾸러미를 들려 보냈다.`); }));
});
function backTick(){
  for (const k of genKeys()){ const s = S.st[k]; if (!s || !s.backAt || !s.gone || Date.now() < s.backAt) continue;
    Object.assign(s, { gone:false, quit:0, replied:false, read:false, arr:0, at:Date.now(), back:true, wageQuit:false, homeN:0, inDay:null, bolt:false });   // inDay·bolt: 잠입자(19_screen)의 옛 빗장 날짜를 지움
    delete GDEF[k];                                                                    // 겁 배수를 새로 셈(12_lab genDef)
    save(); knock(S.scene === 'gate' ? 0.7 : 0.35);
    if (typeof tlog === 'function') tlog('돌아옴(지원서): ' + DEF(k).name);
  }
}
// ② 가주가 손으로 베낌(사람이 하나도 없어도 되는 마지막 길): 별채가 비면 서안을 누를 때 「책을 편다 / 손수 베낀다」. 베끼면 쪽 1권이 들고 가주 광기가 조금 붙음.
// 가주가 베낀 사본은 거간이 값을 더 쳐 줌(COPY의 g_ 짝 — 이름은 같아서 왜 더 쳐 주는지는 안 보임). 「책을 편다」를 고르면 그날은 다시 안 물음.
for (const id of Object.keys(COPY)) COPY['g' + id.slice(1)] = { name: COPY[id].name, price: Math.round(COPY[id].price * K.handPrice) };
HOOK.desk.push(() => {
  if (!labEmpty() || !sjCopyBook() || S.handDay === dayKey()) return false;
  const c = sjCopyBook(), can = S.pages >= COPY_PAGES;
  openOv(`<h3>서안</h3>별채가 비어 있다.<br>책장의 ${COPY[c].name.split('(')[0]}을 손수 베낄 수도 있다.<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bHandRead" style="color:var(--ink);border-color:#00000066;margin:4px">책을 편다</button><button class="btn rec" id="bHandCopy" style="color:var(--ink);border-color:#00000066;margin:4px"${can ? '' : ' disabled'}>손수 베낀다</button></div>`
    + (can ? '' : `<div style="font-size:12px;opacity:.6;text-align:center">쓸 수 있는 쪽이 ${fmtP(COPY_PAGES)}은 있어야 한다.</div>`));
  document.getElementById('bHandRead').addEventListener('click', ev => { ev.stopPropagation(); S.handDay = dayKey(); save(); ov.classList.add('hidden'); deskClick(); });
  document.getElementById('bHandCopy').addEventListener('click', ev => { ev.stopPropagation(); if (S.pages < COPY_PAGES) return;
    S.pages -= COPY_PAGES; madAdd(K.handMad); S.copies = (S.copies || []).concat(['g' + c.slice(1)]); if (!S.dealerAt) S.dealerAt = Date.now() + 60000; save(); sFlip();
    if (typeof tlog === 'function') tlog('가주 필사: ' + COPY[c].name);
    openOv(`<h3>서안</h3>${COPY[c].name.split('(')[0]} 한 권을 손수 베꼈다. 문갑 위에 올려 두었다.<br>붓을 놓았는데도 손끝이 한동안 글자를 따라 움직였다.`); });
  return true;
});
// ⑦ 빈 별채의 밤(공포만): 별채가 빈 채 밤을 넘기면 이튿날 아침 한서진이 알림 — 빈 책상의 책이 넘어가 있고, 덮어 둔 사본이 더 써져 있음. 첫 번은 쪽지, 그 뒤는 별채 이야기 한 줄
function emptyNightTick(){
  if (labEmpty() && isNight()){ if (S.emptyNight !== dayKey()){ S.emptyNight = dayKey(); save(); } return; }
  if (S.emptyNight == null || S.emptyNight === S.emptyNightSaid || isNight() || !S.rArrived || S.errs.sj) return;
  S.emptyNightSaid = S.emptyNight; save();
  if (!S.emptyNightNote){ S.emptyNightNote = true; pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '별채 빈 책상들의 책이', '밤새 몇 장씩 넘어가 있었습니다.', '덮어 둔 사본 한 권은', '어제보다 반 장쯤 더 써져 있습니다.', '제 글씨는 아닙니다.'], '한서진 올림.', 'min(44vh,320px)')); }
  else { sideLine('아침에 보니 별채 빈 책상의 책이 또 넘어가 있었다. 한서진이 말없이 덮어 두었다.'); save(); }
}
HOOK.tick.push(dt => { if (S.stage !== 'room' || S.ended) return; sjCopyTick(dt); backTick(); emptyNightTick(); });
