'use strict';
// ───────── 서랍·기이록·명부의 한 명 (기획서 18-1 · 코드 정리 설계 5절, 10/7) ─────────
// ① 서랍(기능): 새 '종류'의 기록이 처음 생길 때만 열림, 하루 한 번까지, 열어 보면 그날은 닫힘(시험자 "너무 잦아 낚인다").
//    섬뜩한 서랍(따로): 한 대에 두 번까지, 밤에 새 기록이 없는데 열려 있음 — 첫째는 빈 서랍, 둘째는 '안 계신 동안'에 낯선 한 장.
// ② 기이록: 숨은 것을 처음 알아챈(눌러 본) 순간 가주 글씨로 한 줄. 서안 곁 문서함에. 대를 넘어 남음(LINE.odd).
//    빛남·소식(실) 없음 — 찾는 건 플레이어의 눈. 다섯 줄마다 접힌 귀의 여백 글씨가 한 줄 더 읽힘(작은 보상, 쪽·돈 없음).
// ③ 명부의 한 명: 맨 끝 줄이 종이 결에 묻힐 만큼 흐림 → 누르면 하루 한 단계씩 진해짐(여섯 단계), 다 진해지면 낯선 글자가 풀림.
const ODD = [   // [id, 기이록 한 줄(가주의 글씨), 어려움]
  ['knock3', '밤에 문을 세 번 두드리는 소리. 나가 보니 아무도 없었다. 편지는 늘 두 번 두드린다.', '쉬움'],
  ['dust',   '오래 비운 서안의 먼지에 손가락 자국. 책 쪽으로 나 있었다.', '쉬움'],
  ['after',  '책을 덮었는데 읽던 줄이 눈앞에 남아 있었다. 손을 뻗으니 사라졌다.', '쉬움'],
  ['ear',    '접은 적 없는 장의 귀가 접혀 있었다. 여백에 다른 손의 글씨.', '보통'],
  ['cup13',  '아무도 앉지 않은 책상에 찻잔. 아직 따뜻했다.', '보통'],
  ['brush4', '붓걸이의 붓 하나는 쓴 적이 없는데 먹이 묻어 있다.', '보통'],
  ['drawer', '닫아 둔 문갑 서랍이 밤새 빠져나와 있었다.', '보통'],
  ['margin', '문진으로 비추니 여백에 아주 작은 글씨. 내 이름이 적혀 있었다.', '어려움'],
  ['rabbit', '지도 바다 끝, 문진으로만 보이는 두 글자 — 토끼.', '어려움'],
  ['roster13', '명부에 한 사람이 더 있다. 읽을 수 없는 이름.', '어려움'],
];
const ODD_N = ODD.length;
const oddCount = () => Object.keys(LINE.odd || {}).filter(id => ODD.some(o => o[0] === id)).length;
function notice(id){
  LINE.odd = LINE.odd || {}; if (LINE.odd[id] || !ODD.some(o => o[0] === id)) return;
  LINE.odd[id] = Date.now(); saveLine();
  const n = oddCount();
  if (typeof tlog === 'function') tlog('알아챔: ' + id);
  if (n === 1) setTimeout(() => queueOv('<h3>서안 곁</h3>못 보던 얇은 책이 하나 놓여 있다.<br>첫 장에 방금 본 것이 적혀 있다. 내 글씨다.<br><br><span style="font-size:13px;opacity:.7">문서함에 넣어 두었다.</span>'), 600);
  if (n % 5 === 0 && typeof MARGIN !== 'undefined' && (S.margins || []).length < MARGIN.length){   // 다섯 줄마다: 여백 글씨 한 줄
    S.margins = (S.margins || []).concat([MARGIN[(S.margins || []).length]]); save();
    setTimeout(() => queueOv(`<h3>기이록</h3>${n}째 줄을 적고 나니, 책장 사이에 접힌 종잇조각이 끼어 있다.<br><br><span style="color:#6a2a16;font-style:italic">${S.margins[S.margins.length - 1]}</span>`), 900);
  }
}
const oddHtml = () => `<h3>기이록(奇異錄)</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">서고에서 본 이상한 것을 적어 두는 얇은 책. ${KNUM[ODD_N] || ODD_N} 줄 가운데 ${KNUM[oddCount()] || oddCount()} 줄이 적혀 있다.</div>`
  + ODD.map(([id, line]) => LINE.odd && LINE.odd[id] ? `<div class="oddL">${line}</div>` : '<div class="oddL empty">　</div>').join('');

// ── 숨은 것들에 '알아챔'을 붙임 ──
{ const wd0 = wipeDust; wipeDust = function(){ wd0(); notice('dust'); }; }
foldEl.addEventListener('click', () => notice('ear'));
{ const gc = LAB_OBJ.find(o => o.id === 'ghostCup'), c0 = gc.click; gc.click = () => { c0(); notice('cup13'); }; }
afterEl.addEventListener('click', () => { if (afterEl.classList.contains('go')){ afterEl.classList.remove('go'); notice('after'); } });
{ const br = OBJ.find(o => o.id === 'brush'); br.click = () => { showItem('brush'); notice('brush4'); }; }   // 들일 때 저절로 뜨는 창은 빼고, 다시 눌러 볼 때만
{ const tl0 = toggleLoupe; toggleLoupe = function(){ tl0(); if (loupeOn && S.owned.glass && book.querySelector('.mg.seen')) notice('margin'); }; }
{ const pm0 = placeMapLoupe; placeMapLoupe = function(x, y){ pm0(x, y);                                        // 지도 원본 (1180,800) 둘레를 문진으로 비추면
    if (mapLoupeOn && Math.hypot(x * MAPW / mapW - 1195, y * MAPH / mapH - 796) < 40) notice('rabbit'); }; }
// 세 번 두드림: 두드린 뒤 1분 반 안에 대문으로 나가 보면
{ const g0 = goScene; goScene = function(sc){ g0(sc);
    if (sc === 'gate' && S.knock3At && Date.now() - S.knock3At < 90000){ S.knock3At = 0; save(); notice('knock3');
      setTimeout(() => queueOv('<h3>대문 밖</h3>아무도 없다. 골목 끝까지 비어 있다.<br>대문 문고리가 아직 흔들리고 있다.'), 800); } }; }

// ── 서랍: 새 '종류'의 기록에만, 하루 한 번 ──
const recKinds = () => [...new Set(buildRecs().map(r => r[0].split(' — ')[0].replace(/ \(.*\)$/, '')))];
{ const sl0 = showLibrary; showLibrary = function(){
    const ghost = !!S.libGhost;
    S.libKinds = recKinds(); S.libDay = dayKey(); S.libGhost = false; save();
    if (!ghost) return sl0();
    S.libGhostN = (S.libGhostN || 0) + 1; notice('drawer');
    if (S.libGhostN >= 2) S.awayLog = (S.awayLog || []).concat(['<h3>쪽지</h3>' + vlet([alienHtml(glyphs('가주께', 131)), alienHtml(glyphs('서랍을 닫지 마십시오', 132)), alienHtml(glyphs('아직 다 넣지 못했습니다', 133))], alienHtml(glyphs('올림', 134)), 'min(40vh,280px)')]).slice(-20);
    openOv(S.libGhostN >= 2 ? '<h3>문갑</h3>맨 아래 서랍이 빠져나와 있다. 새로 들어온 것은 없다.<br>그런데 \'안 계신 동안\' 쪽지 더미 맨 위에 못 보던 한 장이 얹혀 있다.<div class="rec" id="bLibGo" style="margin-top:12px;text-align:center;font-size:13px;opacity:.75">문갑을 살펴본다</div>'
                            : '<h3>문갑</h3>맨 아래 서랍이 빠져나와 있다.<br>비어 있다. 아무것도 넣은 적이 없는 서랍이다.<div class="rec" id="bLibGo" style="margin-top:12px;text-align:center;font-size:13px;opacity:.75">문갑을 살펴본다</div>');
    document.getElementById('bLibGo').addEventListener('click', ev => { ev.stopPropagation(); sl0(); });
  }; }
HOOK.tick.push(() => {                                        // 섬뜩한 서랍: 한 대에 두 번까지, 밤에
  if (S.stage !== 'room' || S.libGhost || (S.libGhostN || 0) >= 2 || !S.rArrived || !isNight() || S.D < T.door) return;
  if (S.libGhostDay === dayKey()) return;
  if (Math.random() < 1 / 2400){ S.libGhost = true; S.libGhostDay = dayKey(); save(); }    // 한밤에 몇 분에 한 번 꼴로 기회
});

// ── 명부의 한 명: 하루 한 단계씩 진해짐, 여섯 단계면 이름이 풀림 ──
const ROSTER_MAX = 6;
function rosterGhostHtml(n){
  const g = Math.min(ROSTER_MAX, LINE.rosterGhost || 0), op = (0.06 + 0.15 * g).toFixed(2);
  const name = g >= ROSTER_MAX ? '守津(수진)' : alienHtml(glyphs('누구인가', 77 + n));
  return `<br><span class="rec" id="rosterGhost" style="opacity:${op};cursor:pointer">${n}. ${name} — ${g >= ROSTER_MAX ? '필경사' : alienHtml(glyphs('필경사', 91))}</span>`;
}
{ const sr0 = showRoster; showRoster = function(){
    sr0();
    const html = ovBody.innerHTML, i = html.lastIndexOf('<br>'); if (i < 0) return;
    const n = (S.rArrived ? 1 : 0) + allKeys().filter(arrived).length + 1;
    ovBody.innerHTML = html.slice(0, i) + rosterGhostHtml(n) + html.slice(html.indexOf('<div class="close">'));
    ovBody.querySelector('.close').addEventListener('click', ev => { ev.stopPropagation(); closeOv(); });
    document.getElementById('rosterGhost').addEventListener('click', ev => { ev.stopPropagation();
      if (S.rosterDay !== dayKey() && (LINE.rosterGhost || 0) < ROSTER_MAX){ S.rosterDay = dayKey(); LINE.rosterGhost = (LINE.rosterGhost || 0) + 1; saveLine(); save(); }
      notice('roster13'); showRoster(); });
  }; }
