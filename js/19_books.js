'use strict';
// ───────── 책이 돌아오는 서고 (10/7 선생님 — 책 목록과 보관 11절, 10/8 19_rebirth에서 나눔) ─────────
// 책장은 처음부터 있되 비어 있음: 먼지에 책 자국 여덟(장부의 제목 일곱 + 하나, 궤짝엔 제목 없는 책 한 권뿐). 책이 생길 때마다 자국 하나에 들어맞게 꽂힘.
// 자국 하나(다섯째)는 끝까지 어떤 책도 안 맞음. 사는 물건 아님. 책장은 대를 넘어 남음(LINE.books — 빌린 책은 빼고).
// 동의보감 三 = 한서진이 들어올 때 끼고 와 제 책상에 놓음(간 장의 손때는 그의 것). 둘째 대엔 一, 셋째 대엔 二를 가져옴.
// 소학·농가집성 = 방을 붙이면 세책점 거간이 대문에 와서 빌려주거나 팖(필사 재료). 빌린 책을 안 돌려주는 끝은 발굴 묶음에서.
// 10/7 선생님: 책 수(13)는 뺌 — 자국은 장부의 제목 수(일곱)보다 하나 더. 책이 다 돌아와도 하나가 빔(남는 하나) — 제목 없는 책을 꽂아 보면 그 자리에 맞음, 그게 전부.
const LEDGER_BOOKS = ['sohak', 'nong1', 'nong2', 'dong1', 'dong2', 'dongui', 'sijo'];
const SHELF_MARKS = LEDGER_BOOKS.length + 1, ODD_MARK = 4;       // 다섯째 자국 = 남는 하나
const BOOK_NAME = { dongui:'동의보감 三', dong1:'동의보감 一', dong2:'동의보감 二', sohak:'소학', nong1:'농가집성 一', nong2:'농가집성 二', sijo:'시조 묶음', cheonja:'천자문', myeong:'명심보감', samgang:'삼강행실도', yeoji:'동국여지승람' };
const hasBook = id => id === 'dongui' ? !!(S.loc && S.loc.dongui) : !!(S.books && S.books[id]);
function gainBook(id, how){
  if (id === 'dongui'){ ensureLoc(); if (!S.loc.dongui) S.loc.dongui = how === 'rdesk' && !itemAt('rdesk') ? 'rdesk' : 'shelf'; }
  else { S.books = S.books || {}; S.books[id] = how || 'own'; }
  S.shelfOrder = S.shelfOrder || []; if (!S.shelfOrder.includes(id)) S.shelfOrder.push(id);
  save();
}
const shelfOrderNow = () => { const so = S.shelfOrder || []; return [...(hasBook('dongui') && !so.includes('dongui') ? ['dongui'] : []), ...so].filter(hasBook); };   // 예전 판(순서 기록 전)의 동의보감 三도 첫 칸에
function shelfMarks(){ ensureLoc(); const order = shelfOrderNow(), marks = [];
  for (let m = 0, b = 0; m < SHELF_MARKS; m++) marks.push(m === ODD_MARK ? (S.loc.first === 'shelf' ? 'first' : null) : (order[b++] || null));
  return marks; }
// 책장 그림: 자국 여덟 칸(윗단 여섯 + 아랫단 둘)에 실제로 있는 책만, 빈 칸엔 먼지 위의 책 자국(밝은 먼지 바닥에 어두운 네모)
const SHELF_SLOT = m => m < 6 ? [1, m] : [0, m - 6];               // [단(1=위), 칸]
// 책마다 제 색(서안·책상에 놓였을 때와 같게 — 10/7 시험자 "책장에선 빨간 책이 서안에선 노란 책")
const SHELF_COL = { first: BOOKCOL.first[0], dongui: BOOKCOL.dongui[0], dong1:'#36425f', dong2:'#3a4668', sohak:'#6b2d22', nong1:'#2f4a3a', nong2:'#34503f', sijo:'#3b3550' };
function shelfModel(key){
  const name = 'shelf_' + key; if (M[name]) return name;
  const ids = key.split(','), filled = ids.map(id => !!id);
  M[name] = model(20, 6, 26, (x, y, z) => {
    if (x === 0 || x === 19 || z === 0 || z === 25 || z === 12) return WOOD;
    if (y === 0) return DARK;
    const row = z < 12 ? 0 : 1, zz = row ? z - 13 : z - 1, bi = Math.floor((x - 1) / 3);
    if (bi > 5) return null;
    const m = filled.findIndex((f, i) => { const [r, c] = SHELF_SLOT(i); return r === row && c === bi; });
    if (m < 0) return zz === 0 && y <= 4 ? '#4a3a2a' : null;            // 자국 없는 칸: 먼지만
    if (filled[m]){ const hgt = 8 + ((bi*7 + row*3) % 4); return y <= 4 && zz < hgt && (x - 1) % 3 !== 2 ? (SHELF_COL[ids[m]] || BOOKC[(bi + row*2) % 6]) : null; }
    if (zz === 0 && y <= 4) return (x - 1) % 3 === 2 ? '#5e4c38' : '#2c2016';   // 책 자국: 먼지 사이에 어두운 네모
    return null;
  });
  return name;
}
{ const sh = OBJ.find(o => o.id === 'shelf'); sh.m = () => shelfModel(shelfMarks().map(id => id && (!ITEMS.includes(id) || S.loc[id] === 'shelf') ? id : '').join(',')); }   // 서안·책상에 가 있는 책은 자국만
function showShelf(){
  ensureLoc();
  if (!S.owned.lamp) { openOv('<h3>책장</h3>어두워서 잘 보이지 않는다. 손으로 더듬으니 먼지뿐이다.'); return; }
  const order = shelfOrderNow(), marks = shelfMarks();
  const W = { shelf:'', desk: S.owned.desk ? '서안 위' : '궤짝 위', rdesk:'연구원 책상 위', hand:'한서진이 들고 있다' };
  const tag = id => id === 'first' ? '' : id === 'dongui' ? (S.sideRead.dongui && S.loc.dongui === 'shelf' ? '다 풀었음' : W[S.loc.dongui] || '') : S.books[id] === 'borrow' ? '빌린 책' : '';
  const top = S.mapFound ? [['지도', 'map']] : [];
  openOv(`<h3>책장</h3><div style="font-size:13px;opacity:.75;margin-bottom:6px">먼지에 책 자국이 ${KNUM[SHELF_MARKS]} 개 남아 있다.${order.length || S.loc.first === 'shelf' ? '' : ' 책은 없다.'}</div>`
    + top.map(([n, id]) => `<div class="rec spine" data-k="${id}"><span>${n}</span><span style="opacity:.45;font-size:12px">책장 위</span></div>`).join('')
    + marks.map(id => id ? `<div class="rec spine" data-k="${id}"><span>${id === 'first' ? '제목 없는 책' : BOOK_NAME[id]}</span><span style="opacity:.45;font-size:12px">${tag(id)}</span></div>`
                         : '<div class="spine" style="opacity:.35;font-size:13px">— 먼지 위의 책 자국 —</div>').join(''));
  ovBody.querySelectorAll('.spine[data-k]').forEach(el => el.addEventListener('click', ev => {
    ev.stopPropagation(); const k = el.dataset.k;
    if (PLAIN[k]){ const P = PLAIN[k]; openOv(`<h3>${P[0]}</h3>${P[1]()}<div class="rec" id="bShelfBack" style="margin-top:14px;text-align:center;font-size:13px;opacity:.7">← 책장으로</div>`);
      document.getElementById('bShelfBack').addEventListener('click', e2 => { e2.stopPropagation(); showShelf(); }); return; }
    showPlace(k);
  }));
}
// 한서진이 책을 끼고 들어옴: 1대 동의보감 三 → 그 책이 집안에 있으면 一 → 二
// 10/8 선생님 "들고 오는 게 티가 안 난다 · 책장에서 가져다가 읽었으면": 문에서 책을 든 채 책장으로 가 자국에 꽂고(심부름 엔진) 제 자리에 앉음.
// 자리를 잡고 20초쯤 뒤, 책상이 비어 있으면 일어나 책장에서 동의보감을 꺼내 들고 와 책상에 놓고 읽음(한 대에 한 번). 그새 가주가 다른 책을 올려 두었으면 그것을 읽음.
const SHELF_STAND = [-22, -9.5];                                   // 책장 앞에 서는 자리
function sjBookTick(){
  if (!S.rArrived || S.sjBook) return;
  if (S.rNightVisit && (nightVisiting() || isNight())) return;      // 밤에 자리만 보고 간 날은 아직 — 이튿날 낮에 자리를 잡으면
  S.sjBook = true;
  const id = !hasBook('dongui') ? 'dongui' : LINE.gen >= 18 && !hasBook('dong1') ? 'dong1' : LINE.gen >= 19 && !hasBook('dong2') ? 'dong2' : null;
  if (!id) { save(); return; }
  if (Date.now() - S.rArrived > WALK_MS + 2000 || window.BOOTING || S.rNightVisit){ gainBook(id, 'shelf'); sjBookNote(id); save(); return; }   // 걸어 들어오는 때가 지났으면(옛 판·비운 동안·밤에 먼저 다녀간 뒤) 그냥 책장에
  const bk = 'bookDongui';
  S.errs.sj = { t0: S.rArrived, steps: [
    ...walkPts('seogo', [DOOR_POS, [DOOR_POS[0], SGC], [SHELF_STAND[0], SGC], SHELF_STAND], bk),
    waitAt('seogo', SHELF_STAND, [0, -1], 1300, 'shelfPut', id, bk),
    ...walkPts('seogo', [SHELF_STAND, [SHELF_STAND[0], SGC], [SIDE_POS[0], SGC], SIDE_POS]),
    { k:'down', sc:'seogo' } ] };
  if (typeof tlog === 'function') tlog('한서진이 책을 가져옴: ' + BOOK_NAME[id]); save();
}
function sjBookNote(id){
  if (S.sjBookNote === id) return; S.sjBookNote = id;
  pushNote('<h3>쪽지</h3>' + vlet(['가주께.', `읽다 만 ${BOOK_NAME[id]}을 가지고 왔습니다.`, '책장의 빈 자국에 꽂아 두었습니다.', id === 'dongui' ? '장부를 보는 틈틈이 읽겠습니다.' : '꼭 맞았습니다.'], '한서진 올림.', 'min(40vh,300px)')); save();
}
function sjFetchTick(){
  if (S.sjFetched || !S.rArrived || !S.loc || S.loc.dongui !== 'shelf' || S.sideRead.dongui) return;
  if (isNight() || nightVisiting() || S.errs.sj || Date.now() - S.rArrived < T_PUSH + 20000 || itemAt('rdesk')) return;
  S.sjFetched = true;
  const side = homeSide('sj'), bk = 'bookDongui';
  S.errs.sj = { t0: Date.now(), steps: [ { k:'up', sc:'seogo' },
    ...walkPts('seogo', [side, [side[0], SGC], [SHELF_STAND[0], SGC], SHELF_STAND]),
    waitAt('seogo', SHELF_STAND, [0, -1], 1300, 'shelfTake'),
    ...walkPts('seogo', [SHELF_STAND, [SHELF_STAND[0], SGC], [side[0], SGC], side], bk),
    waitAt('seogo', side, [-1, 0], 600, 'deskPut', null, bk),
    { k:'down', sc:'seogo' } ] };
  if (typeof tlog === 'function') tlog('한서진이 책장에서 동의보감을 꺼냄'); save();
}
// 세책점 거간이 처음 오는 때: 방을 붙인 뒤(사람을 받기 시작하면 베낄 책이 필요해짐)
const BOOK_SALE = [['sohak', 30], ['nong1', 40], ['nong2', 40]];
function bookSaleTick(){
  if (S.bookSaleDone || S.bookSale || !S.bangAt || Date.now() - S.bangAt < 60000) return;
  S.bookSale = true; if (!S.dealerAt || S.dealerAt > Date.now() + 1000) S.dealerAt = Date.now(); S.dealerKnock = false; save();
}
function bookSaleHtml(){
  const left = BOOK_SALE.filter(([id]) => !hasBook(id)); if (!left.length) return '';
  const btn = (id, l) => `<span class="rec" data-bk="${id}" style="font-size:13px;margin:0 6px;opacity:.85">${l}</span>`;
  return '<div class="bsec">세책점의 책 — 빌려 가면 사흘 안에 돌려줘야 한다고 한다</div>'
    + left.map(([id, p]) => `<div class="brow" style="cursor:default"><span class="bt">${BOOK_NAME[id]}</span><span class="bn">${btn('b:' + id, '빌린다')}${btn('s:' + id, '산다 ' + fmtM(p))}</span></div>`).join('');
}
function bookSaleBind(){
  ovBody.querySelectorAll('[data-bk]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation();
    const [how, id] = el.dataset.bk.split(':'), price = (BOOK_SALE.find(b => b[0] === id) || [0, 0])[1];
    if (how === 's'){ if ((S.money || 0) < price){ el.textContent = '엽전이 모자란다'; return; } S.money -= price; ledger(`세책점에서 ${BOOK_NAME[id]}을 삼 − ${fmtM(price)}`); sCoin(); }
    else { S.borrowDue = S.borrowDue || {}; S.borrowDue[id] = Date.now() + 3 * DAY_MS(); ledger(`세책점에서 ${BOOK_NAME[id]}을 빌림 — 사흘 안에 돌려줌`); }
    gainBook(id, how === 's' ? 'own' : 'borrow'); if (typeof tlog === 'function') tlog((how === 's' ? '책을 삼: ' : '책을 빌림: ') + BOOK_NAME[id]);
    sellCopies(); }));
}
function showBookSale(){
  openOv('<h3>세책점 거간</h3>장터 세책점에서 왔다고 한다. 보퉁이를 풀어 책 몇 권을 보여 준다.<br>사람을 들인다는 말을 듣고 왔다고 한다. 베껴 쓸 책이 있어야 할 것이라고.' + (bookSaleHtml() || '<br><br>더 보여 줄 책은 없다고 한다.'),
    () => { if (!(S.copies || []).length){ S.bookSale = false; S.bookSaleDone = true; S.dealerAt = 0; S.dealerKnock = false; save(); } });   // 창을 닫으면 돌아감
  bookSaleBind();
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; sjBookTick(); sjFetchTick(); bookSaleTick(); });
