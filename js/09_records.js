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
function showGahun(){ openOv(`<h3>家訓</h3><div style="font-size:20px;letter-spacing:6px;text-align:center;padding:20px 0">${['읽되 믿지 마라','모르는 것은 덮어라'][S.gahun]}</div>`); }
function recJokbo(){ if (S.D >= J0){ let h = `<h3>족보 — ${esc((S.bon||'') + ' ' + S.sur)}씨 17세손 ${esc(S.sur + S.name)}</h3>`; for (let i=11;i<20;i++) h += alienHtml(showText(i)) + '<br>'; return h; }
  return `<h3>族譜 — 첫 장</h3>一世. <span style="letter-spacing:-2px;opacity:.6">▒▒▒</span> — ${alienHtml(glyphs('이 서고를 세우다',40))}<br>…<br>十七世. ${esc(S.sur+S.name)} — 궤짝을 열다.<br>十八世. 　　 — ${alienHtml(glyphs('물가에서', 41))}<br>十九世. 　　 — ${alienHtml(glyphs('문을 잠그고 나오지 않다', 42))}`; }
function recLedger(){ let h = '<h3>서고 장부</h3>'; for (let i=0;i<8;i++) h += alienHtml(showText(i)) + '<br>'; return h; }
function recNotes(){ const done = []; for (let i=0;i<11;i++) if (S.D >= lineDone(i)) done.push(esc(LINES[i][LINES[i].length-1]));
  return `<h3>해독 노트</h3><div style="font-style:italic">${done.length ? done.join('<br>') : '아직 받아 적은 줄이 없다.'}</div><div style="margin-top:10px;font-size:12px;opacity:.6">받아 적은 줄 ${done.length} / ${LINES.length}</div>`; }
const DONGUI = [
  { h:'肝者 將軍之官 謀慮出焉', k:'간은 장군의 벼슬이니, 꾀가 여기서 나온다.' },
  { h:'肝藏魂', k:'간은 혼(魂)을 갈무리한다.' },
  { h:'肝氣虛則恐', k:'간의 기운이 허하면 두려워하고,' },
  { h:'實則怒', k:'차면 성낸다.' },
  { note:'두려움이 없는 자는 간이 없는 자다.' },
  { note:'바다에서 돌아온 이는 겁이 없었다.<br>간을 어디 두고 왔느냐 물으니 웃기만 하였다.' },
];
function showShelf(){
  if (!S.owned.lamp) { openOv('<h3>책장</h3>어두워서 책등이 보이지 않는다.'); return; }
  const books = [
    ['소학', 0], [alienHtml(glyphs('이름모를책', 51)), 0], ['농가집성 一', 0], ['동의보감 一', 0], [alienHtml(glyphs('이름모를', 52)), 0], ['동의보감 二', 0],
    ['농가집성 二', 0], ['동의보감 三', 1], [alienHtml(glyphs('모를책', 53)), 0], ['시조 묶음', 0], [alienHtml(glyphs('이름모를책', 54)), 0], [alienHtml(glyphs('모를', 55)), 0],
  ];
  ensureLoc();
  const W = { shelf:'책장', desk: S.owned.desk ? '서안 위' : '궤짝 위', rdesk:'연구원 책상 위' };
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
function showDongui(){
  const cur = S.curBook === 'dongui', where = S.owned.desk ? '서안' : '궤짝';
  openOv(`<h3>동의보감 三 — 잡병편</h3>간을 다룬 장에 손때가 많다. 한문으로 적혀 있고, 누군가 붉은 먹으로 덧쓴 곳이 있다.<br>읽으려면 꺼내서 펼쳐 놓고 넘겨 가며 풀어야 한다.${S.sideRead.dongui ? '<br><br>다 풀었다.' : ''}`
    + `<div style="text-align:center;margin-top:16px"><button class="btn rec" id="bTake" style="color:var(--ink);border-color:#00000066">${cur ? where + '에 펼쳐 두었다 — 읽는다' : '꺼내서 ' + where + '에 올린다'}</button></div>`);
  document.getElementById('bTake').addEventListener('click', ev => { ev.stopPropagation(); S.curBook = 'dongui'; save(); ov.classList.add('hidden'); openBook(); });
}
function readDongui(){
  let idx = 0, shown = false;
  const draw = () => {
    const p = DONGUI[idx];
    openOv(`<h3>동의보감 三 — 잡병편</h3><div class="rec side" id="sideP">` + (p.h ? `<div class="hj">${p.h}</div><div class="kr">${shown ? p.k : ''}</div>` : `<div class="note">${p.note}</div>`) + `<div class="pg">${idx+1} / ${DONGUI.length}</div></div>`);
    document.getElementById('sideP').addEventListener('click', ev => {
      ev.stopPropagation();
      if (p.h && !shown) { shown = true; noise(0.08, 3000, 0.05); draw(); return; }
      idx++; shown = false; sFlip();
      if (idx < DONGUI.length) { draw(); return; }
      const first = !S.sideRead.dongui; S.sideRead.dongui = true; save();
      openOv('<h3>동의보감 三</h3>다 읽었다.<br>간을 다룬 장에만 손때가 많다. 누군가 이 장만 여러 번 펼쳤다.' + (first ? '<br><br>두려움이 조금 더디게 찾아온다.' : ''));
    });
  };
  draw();
}
const recDongui = () => '<h3>동의보감 三 — 간 장</h3>' + DONGUI.map(p => p.h ? `${p.h}<br>${p.k}` : `<span style="color:#6a2a16;font-style:italic">${p.note}</span>`).join('<br><br>');
function letterHtml(){ return `<h3>편지</h3><div class="vletter rec">${esc(S.sur)}씨 가문 서고에 올립니다.<br><br>저는 글자를 읽는 일을 해 온 사람입니다.<br>댁의 서고에 읽히지 않는 책이 있다는 말을 들었습니다.<br>누구에게 들었는지는 기억나지 않습니다.<br><br>서고에서 일하게 해 주십시오.<br>밤에는 일하지 않겠습니다.<div class="sign">한서진(韓瑞眞) 올림.</div></div>`; }
function showLibrary(){
  const recs = [['족보 첫 장', recJokbo], ['서고 장부', recLedger]];
  if (S.owned.brush) recs.push(['해독 노트', recNotes]);
  if (S.sideRead.dongui) recs.push(['동의보감 三 — 간 장', recDongui]);
  if (S.letterRead) recs.push(['편지 — 한서진', letterHtml]);
  if (S.replied) recs.push(['답장', replyHtml]);
  if (S.rArrived && diaryCount()) recs.push(['한서진의 일지', recDiary]);
  if (S.helpRead) recs.push(['쪽지 — 한서진', () => '<h3>쪽지</h3>가주께. 지도의 그 굴에 가 봐야겠습니다. 다만 혼자서는 바닷가에 못 가겠습니다. 바람 소리만 들어도 발이 떨어지지 않습니다. 사람을 더 구해 주실 수 없겠습니까. — 한서진 올림.']);
  if (glHas()) recs.push([S.gl.fresh ? `낱말 장부 — 새로 정리된 것 ${S.gl.fresh}` : '낱말 장부', recGloss]);
  openOv('<h3>도서관</h3>' + recs.map((r,i)=>`<div class="rec" data-i="${i}">${r[0]}</div>`).join(''));
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

