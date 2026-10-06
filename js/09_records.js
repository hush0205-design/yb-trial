'use strict';
// ───────── 기록 ─────────
function showEmptyChest(){
  if (S.jokboDone && !S.mapFound){
    openOv('<h3>궤짝</h3>족보를 다 풀고 나서 다시 들여다보니, 바닥 안감 한쪽이 들떠 있다.<br>무언가를 오래 눌러 둔 자국이 그 밑으로 이어진다.<div style="text-align:center;margin-top:16px"><button class="btn rec" id="bLining" style="color:var(--ink);border-color:#00000066">안감을 들춘다</button></div>');
    document.getElementById('bLining').addEventListener('click', ev => { ev.stopPropagation(); S.mapFound = true; ensureLoc(); S.loc.map = 'shelf'; save(); ov.classList.add('hidden'); sPlace(); openMap(); });
    return;
  }
  if (S.mapFound){ openOv('<h3>궤짝</h3>바닥 안감을 들춘 자리가 그대로 있다. 접힌 종이가 오래 눌려 있던 자국.'); return; }
  showEmptyChest0();
}
function showEmptyChest0(){ openOv('<h3>궤짝</h3>책을 꺼내고 구석으로 치웠다. 뚜껑을 열어 보면 비어 있다.<br><br>바닥에 무언가를 오래 눌러 둔 자국이 있다. 책보다 조금 크다.'); }
function showGahun(){ if (!S.owned.lamp || S.lampOut) return openOv('<h3>족자</h3>벽에 족자가 하나 걸려 있다.<br>어두워서 글씨가 보이지 않는다.');   // 10/7 선생님: 불을 밝혀야 읽힘
  openOv(`<h3>家訓</h3><div style="font-size:20px;letter-spacing:6px;text-align:center;padding:20px 0">${GAHUN[S.gahun].t}</div>${LINE.gen <= 17 ? '<div style="font-size:13px;opacity:.7">앞 대가 걸어 둔 족자. 언제부터 걸려 있었는지 아무도 모른다.</div>' : ''}`); }
function recJokbo(){ if (typeof jokboSheetHtml === 'function') return jokboSheetHtml(); if (S.D >= J0){ let h = `<h3>족보 — ${esc((S.bon||'') + ' ' + S.sur)}씨 ${LINE.gen}세손 ${esc(S.sur + S.name)}</h3>`; for (let i=11;i<22;i++) h += alienHtml(showText(i)) + '<br>'; return h; }
  return `<h3>族譜 — 첫 장</h3>一世. <span style="letter-spacing:-2px;opacity:.6">▒▒▒</span> — ${alienHtml(glyphs('이 서고를 세우다',40))}<br>…<br>十三世. ${alienHtml(glyphs('서고 문을 닫고 떠나다', 43))}<br>十四世 ━━━ 十五世 ━━━ 十六世 ━━━<br>十七世. ${esc(S.sur+genName(17))} — 궤짝을 열다.<br>十八世. ${genName(18) ? esc(S.sur+genName(18)) : '　　'} — ${alienHtml(glyphs('물가에서', 41))}<br>十九世. ${genName(19) ? esc(S.sur+genName(19)) : '　　'} — ${alienHtml(glyphs('문을 잠그고 나오지 않다', 42))}`; }
function recLedger(){ let h = '<h3>서고 장부</h3>'; for (let i=0;i<8;i++) h += alienHtml(showText(i)) + '<br>'; return h; }
function recNotes(){ const done = []; for (let i=0;i<11;i++) if (S.D >= lineDone(i)) done.push(esc(LINES[i][LINES[i].length-1]));
  return `<h3>해독 노트</h3><div style="font-style:italic">${done.length ? done.join('<br>') : '아직 받아 적은 줄이 없다.'}</div><div style="margin-top:10px;font-size:12px;opacity:.6">받아 적은 줄 ${done.length} / ${LINES.length}</div>`; }
const DONGUI = DONGUI_SRC;   // 읽기용 원문(02_text)과 같은 것을 씀(이중 정의 없앰, 10/6)
// 책장 (10/7 선생님): 이름 모를 책 다섯은 뺌(신들의 책은 그 신의 차례에 밖에서 옴) → 평범한 책으로 채움.
// 장부엔 "모두 열세 권"(시조 묶음·천자문·잡서 네 권), 책장엔 잡서가 세 권뿐 — 하나 모자람, 까닭은 안 알려 줌.
// 평범한 책은 꺼내 펴면 해독 없이 그냥 읽힘. 소름은 원문 안에(책 목록과 보관 7절 — 진짜 원문 + 누군가의 흔적).
const SOEKKI = ['입춘','우수','경칩','춘분','청명','곡우','입하','소만','망종','하지','소서','대서','입추','처서','백로','추분','한로','상강','입동','소설','대설','동지','소한','대한'];
const PLAIN = {
  sohak:   ['소학(小學)', () => '아이에게 몸가짐을 가르치는 책.<br><br>「身體髮膚 受之父母 ▇▇毁傷 孝之始也」<br>몸과 머리털과 살갗은 부모께 받은 것이니, ▇▇ 헐고 다치지 않는 것이 효의 시작이다.<br><br><span style="font-size:13px;opacity:.75">이 구절에만 손때가 짙다. 두 글자가 먹으로 지워져 있다.</span>'],
  nong1:   ['농가집성(農家集成) 一', () => '절기를 적은 장.<br><br>' + SOEKKI.slice(0, 11).join(' · ') + ' · ' + alienHtml(glyphs('절기', 77)) + ' · ' + SOEKKI.slice(11).join(' · ') + '<br><br><span style="font-size:13px;opacity:.75">세어 보면 스물다섯이다.</span>'],
  nong2:   ['농가집성(農家集成) 二', () => '논에 물 대는 법을 적은 장.<br><br>물꼬를 트는 날을 셈하는 대목에, 밀물과 썰물의 때를 셈하는 법이 섞여 있다.<br><br><span style="font-size:13px;opacity:.75">논에 바닷물을 대는 법이다.</span>'],
  dong1:   ['동의보감(東醫寶鑑) 一', () => '내경편. 꿈을 다룬 장.<br><br>「腎氣虛 則使人夢見舟船溺人」<br>콩팥의 기운이 허하면, 배가 뒤집혀 사람이 물에 빠지는 꿈을 꾸게 된다.<br><br><span style="font-size:13px;opacity:.75">장 끝 여백에 날짜가 여럿 적혀 있다. 날짜마다 같은 손이다.</span>'],
  dong2:   ['동의보감(東醫寶鑑) 二', () => '외형편. 눈을 다룬 장. 이 장의 귀가 접혀 있다.<br><br>눈병 처방들이 이어진다. 그 사이에 붉은 먹으로 누가 한 줄을 끼워 적었다.<br><span style="color:#6a2a16">' + alienHtml(glyphs('눈을 덜어내는 법', 78)) + '</span>'],
  sijo:    ['시조 묶음', () => '누가 엮었는지 모르는 시조 묶음.<br><br>청산리 벽계수야 수이 감을 자랑 마라<br>일도창해하면 다시 오기 어려우니<br>명월이 만공산하니 쉬어 간들 어떠리<br><br><span style="font-size:13px;opacity:.75">맨 끝에 지은이 없는 한 수가 있다. 끝 줄이 번져 읽히지 않는다.</span>'],
  cheonja: ['천자문(千字文)', () => '아이가 쓰던 천자문. 「天地玄黃」 옆에 서툰 한글 토가 달려 있다.<br><br>「海鹹河淡」 — 바다는 짜고, 강물은 싱겁다.<br>네 글자에 동그라미가 쳐 있다. 셋은 아이 손이고, 하나는 붉은 먹이다.<br><br>「閏餘成歲」 — 윤달의 남는 날이 모여 해를 이룬다.<br>여기에도 붉은 동그라미가 하나.'],
  myeong:  ['명심보감(明心寶鑑)', () => '첫 장.<br><br>「子曰 爲善者 天報之以福 爲不善者 天報之以禍」<br>착한 일을 하는 이에게는 하늘이 복으로 갚고, 착하지 않은 일을 하는 이에게는 하늘이 화로 갚는다.<br><br><span style="font-size:13px;opacity:.75">‘天’ 자 옆마다 작은 점이 찍혀 있다. 세어 보면 점이 하나 더 많다.</span>'],
  samgang: ['삼강행실도(三綱行實圖)', () => '효자·충신·열녀의 행실을 그림과 함께 적은 책.<br><br>물가에 선 사람을 그린 장들만 종이가 물결처럼 울어 있다.'],
  yeoji:   ['동국여지승람(東國輿地勝覽) 한 권', () => '나라의 고을과 산천을 적은 책 가운데 한 권. 우리 고을의 장이 들어 있다.<br><br>갈두포의 바위와 물길을 적은 대목 아래, 한 줄이 칼로 도려내져 있다.'],
};
const recDongui = () => '<h3>동의보감 三 — 간 장</h3>' + DONGUI.map(p => p.h ? `${p.h}<br>${p.k}` : `<span style="color:#6a2a16;font-style:italic">${p.note}</span>`).join('<br><br>');
function letterHtml(){ return `<h3>편지</h3><div class="vletter rec">${esc(S.sur)}씨 가문 서고에 올립니다.<br><br>저는 글자를 읽는 일을 해 온 사람입니다.<br>댁의 서고에 읽히지 않는 책이 있다는 말을 들었습니다.<br>누구에게 들었는지는 기억나지 않습니다.<br><br>서고에서 일하게 해 주십시오.<br>읽다 만 책 한 권을 가지고 가겠습니다.<br>밤에는 일하지 않겠습니다.<div class="sign">한서진(韓瑞眞) 올림.</div></div>`; }
function buildRecs(){
  const recs = [['족보', recJokbo], ['서고 장부', recLedger]];
  if (S.owned.brush) recs.push(['해독 노트', recNotes]);
  if (S.sideRead.dongui) recs.push(['동의보감 三 — 간 장', recDongui]);
  if (S.letterRead) recs.push(['편지 — 한서진', letterHtml]);
  if (S.replied) recs.push(['답장', replyHtml]);
  if (S.rArrived && diaryCount()) recs.push(['한서진의 일지', recDiary]);
  if (S.helpRead) recs.push(['쪽지 — 한서진', () => '<h3>쪽지</h3>가주께. 지도의 그 굴에 가 봐야겠습니다. 다만 혼자서는 바닷가에 못 가겠습니다. 바람 소리만 들어도 발이 떨어지지 않습니다. 사람을 더 구해 주실 수 없겠습니까. — 한서진 올림.']);
  labRecs(recs);
  if (glHas()) recs.push([S.gl.fresh ? `낱말 장부 — 새로 정리된 것 ${S.gl.fresh}` : '낱말 장부', recGloss]);
  if (S.awayLog && S.awayLog.length) recs.push(['안 계신 동안의 쪽지', () => '<h3>안 계신 동안</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">자리를 비운 사이 서안에 놓여 있던 쪽지들. 새것이 위에.</div>' + S.awayLog.slice().reverse().join('<hr style="border:none;border-top:1px solid #00000022">')]);
  return recs;
}
// 문갑: 서랍마다 나눠 둔 기록(도서관 대신, 기획서 14-2)
const DRAWERS = [['첫째 서랍 — 책에서 받아 적은 것', /장부|족보|노트|동의보감/], ['둘째 서랍 — 편지와 방', /편지|답장|방\(|지원서/], ['셋째 서랍 — 일지', /일지/], ['넷째 서랍 — 쪽지', /쪽지|안 계신/]];
function showLibrary(){
  const recs = buildRecs(); S.libSig = libSig(); save();
  const used = new Set(); let h = '<h3>문갑</h3>';
  for (const [title, re] of DRAWERS){
    const items = recs.map((r, i) => [r, i]).filter(([r, i]) => !used.has(i) && re.test(r[0]));
    if (!items.length) continue;
    h += `<div style="font-size:12px;opacity:.55;margin-top:10px">${title}</div>` + items.map(([r, i]) => { used.add(i); return `<div class="rec" data-i="${i}">${r[0]}</div>`; }).join('');
  }
  const rest = recs.map((r, i) => [r, i]).filter(([r, i]) => !used.has(i));
  if (rest.length) h += '<div style="font-size:12px;opacity:.55;margin-top:10px">맨 아래 서랍</div>' + rest.map(([r, i]) => `<div class="rec" data-i="${i}">${r[0]}</div>`).join('');
  openOv(h);
  ovBody.querySelectorAll('.rec').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); openOv(recs[+el.dataset.i][1]()); }));
}
function readLetter(){
  S.letterRead = true; save();
  openOv(letterHtml() + (S.replied ? '' : '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bReply" style="color:var(--ink);border-color:#00000066">답장을 쓴다</button></div>'));
  const b = document.getElementById('bReply'); if (b) b.addEventListener('click', ev => { ev.stopPropagation(); showReply(); });
}
const replyHtml = () => `<h3>답장</h3><div class="vletter rec" style="height:min(46vh,320px)">한서진 님께.<br><br>오시오.<br>서고 한구석에 자리를 마련해 두겠소.<br>밤에는 일하지 않아도 좋소.<div class="sign">${esc(S.sur + S.name)}</div></div>`;
function showReply(){
  openOv(replyHtml() + '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bSend" style="color:var(--ink);border-color:#00000066">보낸다</button></div>');
  document.getElementById('bSend').addEventListener('click', ev => {
    ev.stopPropagation(); S.replied = true; S.chair = true; S.rDue = Date.now() + 6000; save(); ov.classList.add('hidden'); sPlace();
  });
}

