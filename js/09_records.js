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
function showGahun(){ openOv(`<h3>家訓</h3><div style="font-size:20px;letter-spacing:6px;text-align:center;padding:20px 0">${GAHUN[S.gahun].t}</div>${LINE.gen <= 17 ? '<div style="font-size:13px;opacity:.7">앞 대가 걸어 둔 족자. 언제부터 걸려 있었는지 아무도 모른다.</div>' : ''}`); }
function recJokbo(){ if (typeof jokboSheetHtml === 'function') return jokboSheetHtml(); if (S.D >= J0){ let h = `<h3>족보 — ${esc((S.bon||'') + ' ' + S.sur)}씨 ${LINE.gen}세손 ${esc(S.sur + S.name)}</h3>`; for (let i=11;i<22;i++) h += alienHtml(showText(i)) + '<br>'; return h; }
  return `<h3>族譜 — 첫 장</h3>一世. <span style="letter-spacing:-2px;opacity:.6">▒▒▒</span> — ${alienHtml(glyphs('이 서고를 세우다',40))}<br>…<br>十三世. ${alienHtml(glyphs('서고 문을 닫고 떠나다', 43))}<br>十四世 ━━━ 十五世 ━━━ 十六世 ━━━<br>十七世. ${esc(S.sur+genName(17))} — 궤짝을 열다.<br>十八世. ${genName(18) ? esc(S.sur+genName(18)) : '　　'} — ${alienHtml(glyphs('물가에서', 41))}<br>十九世. ${genName(19) ? esc(S.sur+genName(19)) : '　　'} — ${alienHtml(glyphs('문을 잠그고 나오지 않다', 42))}`; }
function recLedger(){ let h = '<h3>서고 장부</h3>'; for (let i=0;i<8;i++) h += alienHtml(showText(i)) + '<br>'; return h; }
function recNotes(){ const done = []; for (let i=0;i<11;i++) if (S.D >= lineDone(i)) done.push(esc(LINES[i][LINES[i].length-1]));
  return `<h3>해독 노트</h3><div style="font-style:italic">${done.length ? done.join('<br>') : '아직 받아 적은 줄이 없다.'}</div><div style="margin-top:10px;font-size:12px;opacity:.6">받아 적은 줄 ${done.length} / ${LINES.length}</div>`; }
const DONGUI = DONGUI_SRC;   // 읽기용 원문(02_text)과 같은 것을 씀(이중 정의 없앰, 10/6)
function showShelf(){
  if (!S.owned.lamp) { openOv('<h3>책장</h3>어두워서 책등이 보이지 않는다.'); return; }
  const books = [
    ['소학', 0], [alienHtml(glyphs('이름모를책', 51)), 0], ['농가집성 一', 0], ['동의보감 一', 0], [alienHtml(glyphs('이름모를', 52)), 0], ['동의보감 二', 0],
    ['농가집성 二', 0], ['동의보감 三', 1], [alienHtml(glyphs('모를책', 53)), 0], ['시조 묶음', 0], [alienHtml(glyphs('이름모를책', 54)), 0], [alienHtml(glyphs('모를', 55)), 0],
  ];
  ensureLoc();
  const W = { shelf:'꽂혀 있음', desk: S.owned.desk ? '서안 위' : '궤짝 위', rdesk:'연구원 책상 위' };
  if (S.owned.desk || S.loc.first !== 'desk') books.unshift(['제목 없는 책', 'first']);
  if (S.mapFound) books.unshift(['지도', 'map']);
  books.forEach(b => { if (b[1] === 1) b[1] = 'dongui'; });
  const tag = b => b[1] === 'dongui' && S.sideRead.dongui && S.loc.dongui === 'shelf' ? '다 풀었음' : (typeof b[1] === 'string' ? (b[1] === 'map' && S.loc.map === 'shelf' ? '책장 위' : W[S.loc[b[1]]]) : '');
  const n = 11 + (S.loc.dongui === 'shelf' ? 1 : 0) + (S.loc.first === 'shelf' ? 1 : 0);   // 다른 책 열한 권 + 동의보감 + 제목 없는 책
  openOv(`<h3>책장 — ${['열한','열두','열세'][Math.max(0, Math.min(2, n - 11))]} 권</h3>` + books.map((b,i) => `<div class="rec spine" data-i="${i}"><span>${b[0]}</span><span style="opacity:.45;font-size:12px">${tag(b)}</span></div>`).join(''));
  ovBody.querySelectorAll('.spine').forEach(el => el.addEventListener('click', ev => {
    ev.stopPropagation();
    const k = books[+el.dataset.i][1];
    if (typeof k === 'string') showPlace(k);
    else openOv('<h3>책장</h3>꺼내지지 않는다.<br>옆 책과 붙어 있다.');
  }));
}
const recDongui = () => '<h3>동의보감 三 — 간 장</h3>' + DONGUI.map(p => p.h ? `${p.h}<br>${p.k}` : `<span style="color:#6a2a16;font-style:italic">${p.note}</span>`).join('<br><br>');
function letterHtml(){ return `<h3>편지</h3><div class="vletter rec">${esc(S.sur)}씨 가문 서고에 올립니다.<br><br>저는 글자를 읽는 일을 해 온 사람입니다.<br>댁의 서고에 읽히지 않는 책이 있다는 말을 들었습니다.<br>누구에게 들었는지는 기억나지 않습니다.<br><br>서고에서 일하게 해 주십시오.<br>밤에는 일하지 않겠습니다.<div class="sign">한서진(韓瑞眞) 올림.</div></div>`; }
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

