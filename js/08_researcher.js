'use strict';
// ───────── 진행 ─────────
const cnt = document.getElementById('cnt');
// ───────── 연구원 한서진 ─────────
const isNight = (d = new Date()) => { const h = gameHour(d); return h >= 22 || h < 6; };   // 밤에는 일하지 않겠습니다
const R_SEC = 4;   // 4초에 한 장
const DIARY = [
  [60,  '맑음. 가주께서 푸신 장부를 다시 읽었다. 첫 글자가 이 댁의 성(姓)이었다. 책이 이 댁을 알고 있는 것 같다. 우연이겠지.'],
  [240, '흐림. 밤에 넘기지 말라는 구절을 보았다. 우스운 말이지만 오늘은 해 지기 전에 덮었다.'],
  [600, '비. 차가 따뜻해 좋았다. 손이 덜 떨린다.'],
];
const MAP_DIARY = '맑음. 가주께서 지도를 보여 주셨다. 바다 쪽에 굴이 하나 그려져 있었다. 그곳에 가 봐야 한다는 것을 안다. 다만 혼자서는…';
function diaryList(){
  const L = DIARY.filter(d => (S.rWork||0) >= d[0]).map(d => d[1]);
  if (S.caveAt && (S.rWork||0) >= (S.caveWork||0) + 90) L.push(MAP_DIARY);
  return L;
}
const diaryCount = () => diaryList().length;
function readNote(){                                    // 서안 위 쪽지: 자리 비운 동안의 쪽지 먼저, 그다음 부탁 쪽지
  if (S.pendingNote){ const h = S.pendingNote; S.pendingNote = null; save(); openOv(h); return; }
  if (S.pendingNotes && S.pendingNotes.length){ const h = S.pendingNotes.shift(); save(); openOv(h); return; }
  if (S.helpNote && !S.helpRead){ readHelp(); return; }
  if (S.goNote && !S.goRead) readGo();
}
function readHelp(){
  S.helpRead = true; save();
  openOv('<h3>쪽지</h3><div class="vletter rec" style="height:min(50vh,360px)">가주께.<br>지도의 그 굴에 가 봐야겠습니다.<br>다만 혼자서는 바닷가에 못 가겠습니다.<br>바람 소리만 들어도 발이 떨어지지 않습니다.<br>사람을 더 구해 주실 수 없겠습니까.<br><br>방을 붙일 종이를 문 곁에 두었습니다.<div class="sign">한서진 올림.</div></div>');
}
// 연구원 공포가 차는 빠르기(1초에): 오정림이 오기 전엔 4~5분이면 땀, 온 뒤엔 8분쯤. 읽는 것에 따라 다름(장부 0.5·족보 1·동의보감 0.8·지도 1.3)
function readFear(item){
  const base = S.st && S.st.ojr && S.st.ojr.arr ? 0.00075 : 0.0013;
  const k = item === 'map' ? 1.3 : item === 'dongui' ? 0.8 : (S.D >= J0 ? 1 : 0.5);
  return base * k;
}
function researcherTick(dt){
  if (S.replied && !S.rArrived && S.rDue && Date.now() >= S.rDue){
    S.rArrived = Date.now(); S.rWork = 0; S.rPages = 0; save();
    noise(0.12, 110, 0.4, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.35, 'lowpass'), 260);          // 문 두드리는 소리
    for (let t = 300; t < WALK_MS; t += 560) setTimeout(() => noise(0.08, 220, 0.16, 'lowpass'), t);       // 발소리
    setTimeout(() => noise(0.5, 320, 0.12, 'lowpass'), WALK_MS + 50);                                       // 의자를 빼는 소리
    setTimeout(() => noise(0.2, 160, 0.25, 'lowpass'), T_STEP + 150);                                       // 앉는 소리
    setTimeout(() => noise(0.45, 300, 0.1, 'lowpass'), T_SIT + 50);                                         // 의자를 당기는 소리
    if (isNight()){                                     // 밤에 처음 왔으면: 자리만 보고 돌아감
      S.rNightVisit = S.rArrived; save();
      const L0 = T_PUSH + NV_STAY;
      setTimeout(() => noise(0.45, 300, 0.1, 'lowpass'), L0 + 50);                                          // 의자를 빼는 소리
      for (let t = L0 + T_PUSH - WALK_MS + 300; t < L0 + T_PUSH; t += 560) setTimeout(() => noise(0.08, 220, 0.16, 'lowpass'), t);   // 나가는 발소리
    }
  }
  if (S.rNightVisit && !S.rNightNote && Date.now() - S.rNightVisit >= T_PUSH*2 + NV_STAY){
    S.rNightNote = true;
    S.pendingNote = '<h3>쪽지</h3><div class="vletter rec" style="height:min(50vh,360px)">가주께.<br>와 보니 이미 밤이었습니다.<br>밤에는 일하지 않겠다고 말씀드렸으니<br>오늘은 자리만 보고 갑니다.<br>의자가 꼭 맞았습니다.<br>해가 뜨면 오겠습니다.<div class="sign">한서진 올림.</div></div>';
    save();
  }
  if (S.rArrived && isNight()) S.rRest = true;                                                    // 밤에 집에 갔다 오면 겁이 절반으로
  else if (S.rRest){ S.rRest = false; S.rFear = (S.rFear||0) * 0.5; }
  if (!S.rArrived || isNight()) return;
  if (Date.now() < (S.rSteam||0)) S.rFear = Math.max(0, (S.rFear||0) - dt*0.25);                  // 차를 마시는 동안 가라앉음
  else if (itemAt('rdesk')) S.rFear = Math.min(1, (S.rFear||0) + dt*readFear(itemAt('rdesk'))*(Date.now() < (S.rCalm||0) ? 0.3 : 1));   // 읽을수록 무서워짐
  const rf = S.rFear || 0, fac = rf > 0.7 ? 0.25 : rf > 0.35 ? 0.5 : 1;                         // 떨면 손이 느려짐
  if (itemAt('rdesk')) S.rWork = (S.rWork||0) + dt;
  S.rAcc = (S.rAcc||0) + dt*fac;
  const rItem = itemAt('rdesk');
  if (!rItem){ S.rAcc = 0; return; }                    // 책상이 비어 있으면 일하지 않음
  while (S.rAcc >= R_SEC){ S.rAcc -= R_SEC; S.pages += 1; S.earned += 1; addBook(rItem, mult()); S.rPages = (S.rPages||0) + 1; }
}
// 자리를 비운 동안: 낮 시간만 세어(최대 8시간) 넘김
const NIGHT_SEC = 60;   // 밤에 서안의 책이 혼자 한 장 넘어가는 간격
function offlineWork(){
  const res = { r:0, night:0 };
  if (!S.lastSeen) return res;
  const now = Date.now(), from = Math.max(S.lastSeen, now - 8*3600e3);
  let daySec = 0, nightSec = 0;
  for (let t = from; t < now; t += 60e3){ const d = Math.min(60, (now - t)/1000); if (isNight(new Date(t))) nightSec += d; else daySec += d; }
  const rItem = itemAt('rdesk');
  if (S.rArrived && rItem && daySec > 0){
    const n = Math.floor(daySec / R_SEC * 0.3);
    S.rFear = Math.max((S.rFear||0) * (nightSec > 0 ? 0.5 : 1), 0.3);   // 자리를 비운 동안 혼자 읽으며 겁이 쌓임(밤에 집에 다녀왔으면 먼저 절반)
    S.rWork = (S.rWork||0) + daySec; S.pages += n; S.earned += n; addBook(rItem, n*mult()); S.rPages = (S.rPages||0) + n; res.r = n;
  }
  const di = itemAt('desk');
  if (S.owned.desk && (di === 'first' || di === 'dongui') && nightSec > 0){          // 아무도 없는 밤, 서안의 책이 혼자 넘어감
    const m = Math.floor(nightSec / NIGHT_SEC);
    S.pages += m; S.earned += m; addBook(di, m); res.night = m;
  }
  if (now - S.lastSeen < 180e3) { res.r = 0; res.night = 0; }
  return res;
}
function showResearcher(){
  if (isNight() && !nightVisiting()) { openOv('<h3>연구원의 자리</h3>밤이다. 한서진은 돌아갔다.<br>해가 뜨면 온다.'); return; }
  const rfac = (S.rFear||0) > 0.7 ? 0.25 : (S.rFear||0) > 0.35 ? 0.5 : 1, rItemNow = itemAt('rdesk');
  const speed = !rItemNow ? '쉬고 있다' : S.owned.sundial
    ? `1분에 ${fmtP(Math.round(60/R_SEC*rfac))} — ${rfac === 1 ? '평소대로' : rfac === 0.5 ? '평소의 절반' : '평소의 4분의 1'}`
    : rfac === 1 ? '또박또박 넘긴다' : rfac === 0.5 ? '손이 떨려 느릿느릿 넘긴다' : '책장을 붙잡고 거의 넘기지 못한다';
  const n = diaryCount(), rf = S.rFear || 0, st = rf > 0.7 ? '간이 콩알만 해짐 — 손이 떨려 책장을 거의 넘기지 못한다' : rf > 0.35 ? '간이 콩알만 해짐 — 손이 떨린다' : '평온함';
  const rb = itemAt('rdesk'), o = (id, label) => `<span data-rb="${id}" class="${rb === id ? 'on' : ''}">${label}</span>`;
  openOv(`<h3>연구원 — 한서진(韓瑞眞)</h3>직업: 해독가<br>상태: ${st}<br>읽는 빠르기: ${speed}<br>넘긴 것: ${fmtP(S.rPages||0)}<br><div style="font-size:12px;opacity:.6">밤에는 일하지 않는다.</div>`
    + (S.teaArrived ? `<div style="text-align:center;margin:8px 0"><button class="btn rec" id="bRTea" style="color:var(--ink);border-color:#00000066">차를 한 잔 내준다</button></div>` : '')
    + `<div style="margin-top:8px">책상 위: ${rb ? INAME[rb] : '<i>비어 있다 — 아무것도 하지 않고 앉아 있다</i>'}</div>`
    + `<div class="opt rec"><span>책장에서 가져다 놓기</span><span class="ch">${o('first', '제목 없는 책')}${o('dongui', '동의보감 三')}${S.mapFound ? o('map', '지도') : ''}${rb ? o('', '치운다') : ''}</span></div>`
    + (rb === 'dongui' && S.sideRead.dongui ? '<div style="font-size:12px;opacity:.6">동의보감 三은 다 풀었다. 남은 손은 제목 없는 책에 보탠다.</div>' : '')
    + `<br><b>일지</b>` + (n ? diaryList().map((d, i) => `<div class="rec dlist" data-d="${i}"><span>일지 ${i+1} — ${esc(d.split('.')[0])}</span><span style="opacity:.45;font-size:12px">읽기</span></div>`).join('') : '<br>아직 쓴 것이 없다.'));
  const bt = document.getElementById('bRTea'); if (bt) bt.addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); giveTea(); });
  ovBody.querySelectorAll('.dlist').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const i = +el.dataset.d;
    openOv(`<h3>한서진의 일지 ${i+1}</h3>${diaryList()[i]}<div class="rec" id="bBackR" style="margin-top:14px;text-align:center">← 목록으로</div>`);
    document.getElementById('bBackR').addEventListener('click', e2 => { e2.stopPropagation(); showResearcher(); }); }));
  ovBody.querySelectorAll('[data-rb]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const id = el.dataset.rb;
    if (id) { placeItem(id, 'rdesk'); ov.classList.add('hidden'); return; } else { const cur = itemAt('rdesk'); if (cur) { S.loc[cur] = 'shelf'; save(); } } showResearcher(); }));
}
const recDiary = () => '<h3>한서진의 일지</h3>' + diaryList().map(d => `<div style="margin:8px 0">${d}</div>`).join('');
// 종이 인형(연구원): 갓 쓰고 흰 도포에 청색 세조대를 맨 선비. 늘 화면을 향하지만 방을 돌리면 옆으로 돌아 얇은 선이 됨
// 선비 종이 인형: 네모난 픽셀 대신 곡선으로 그림(둥근 갓 챙, 갸름한 얼굴, 처진 어깨, 넓게 늘어진 소매, 퍼지는 도포 자락, 버선코)
// 겁먹은 얼굴: 휘둥그레진 눈, 떨리는 입, 땀방울(종이 인형 공용)
function fearEyes(g, xl, xr, y){
  for (const x of [xl, xr]){ g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(x, y, 1.5, 0.95, 0, 0, Math.PI*2); g.fill(); g.fillStyle = '#1a1410'; g.beginPath(); g.arc(x, y + 0.1, 0.55, 0, Math.PI*2); g.fill(); }
}
function fearMouth(g, fr, x, y){
  g.strokeStyle = '#8f5446'; g.lineWidth = 0.9; g.beginPath();
  if (fr === 2){ g.fillStyle = '#5a2e26'; g.ellipse(x, y + 0.2, 1.1, 0.85, 0, 0, Math.PI*2); g.fill(); return; }
  g.moveTo(x - 1.6, y); g.quadraticCurveTo(x - 0.8, y - 0.6, x, y); g.quadraticCurveTo(x + 0.8, y + 0.6, x + 1.6, y); g.stroke();   // 떨리는 입
}
function fearSweat(g, fr, xl, xr, y){
  const drop = (x, yy, s) => { g.fillStyle = '#d4ecf6'; g.strokeStyle = '#7fa6ba'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(x, yy - 1.8*s); g.quadraticCurveTo(x + 1.2*s, yy, x, yy + 1*s); g.quadraticCurveTo(x - 1.2*s, yy, x, yy - 1.8*s); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#ffffff'; g.fillRect(x - 0.35*s, yy - 0.4*s, 0.45*s, 0.45*s); };
  drop(xr - 0.4, y + 1, 1.1);
  if (fr === 2){ drop(xl + 0.6, y + 2, 1); drop(xr - 1.6, y + 7.5, 0.9);
    g.fillStyle = 'rgba(225,235,240,0.16)'; g.beginPath(); g.ellipse((xl + xr)/2, y + 6, 6.5, 6.5, 0, 0, Math.PI*2); g.fill(); }   // 핏기가 가심
}
// 한 사람의 그림 묶음: 겁 0·1·2단계마다 앞모습, 뒷모습은 공용
function dollSet(draw, o = {}){
  const L = fr => ({ A:draw('a', false, Object.assign({}, o, { fear:fr })), B:draw('b', false, Object.assign({}, o, { fear:fr })), SIT:draw('sit', false, Object.assign({}, o, { fear:fr })) });
  const back = { A_BK:draw('a', true, o), B_BK:draw('b', true, o), SIT_BK:draw('sit', true, o) };
  const sets = [0, 1, 2].map(fr => Object.assign(L(fr), back));
  if (o.closable) sets[0].SIT_CL = draw('sit', false, Object.assign({}, o, { closed:true }));
  return sets;
}
function drawSeonbi(pose, back, o = {}){
  const RB = o.robe || ['#f3eee2', '#e7e0cf', '#c9c0ab'], BL = o.belt || '#3e5288', BL2 = o.belt2 || '#2c3c6a';
  const W = 48, H = pose === 'sit' ? 78 : 98;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const sit = pose === 'sit', sway = pose === 'a' ? -1.2 : pose === 'b' ? 1.2 : 0;
  const robe = g.createLinearGradient(6, 0, 44, 0); robe.addColorStop(0, RB[0]); robe.addColorStop(0.55, RB[1]); robe.addColorStop(1, RB[2]);
  const line = '#8f8775';
  const path = (pts, fill, stroke) => { g.beginPath(); pts(g); g.closePath(); if (fill){ g.fillStyle = fill; g.fill(); } if (stroke){ g.strokeStyle = stroke; g.lineWidth = 0.8; g.stroke(); } };
  // 넓은 소매(뒤쪽에 먼저)
  path(p => { p.moveTo(14, 44); p.quadraticCurveTo(2, 50, 3, 66); p.quadraticCurveTo(4, 74, 13, 72); p.quadraticCurveTo(17, 60, 18, 50); }, robe, line);
  path(p => { p.moveTo(34, 44); p.quadraticCurveTo(46, 50, 45, 66); p.quadraticCurveTo(44, 74, 35, 72); p.quadraticCurveTo(31, 60, 30, 50); }, robe, line);
  // 도포 몸판: 처진 어깨에서 아래로 퍼지는 자락
  const hem = sit ? 66 : 90;
  path(p => { p.moveTo(20, 38); p.quadraticCurveTo(12, 41, 13, 50); p.quadraticCurveTo(9 + sway, hem - 12, 8 + sway, hem); p.quadraticCurveTo(24 + sway, hem + 3, 40 + sway, hem);
    p.quadraticCurveTo(39 + sway, hem - 12, 35, 50); p.quadraticCurveTo(36, 41, 28, 38); }, robe, line);
  // 자락 주름
  g.strokeStyle = '#d2c9b4'; g.lineWidth = 0.9;
  [[19, 56, 17 + sway, hem - 2], [24, 58, 24 + sway, hem], [29, 56, 31 + sway, hem - 2]].forEach(([x1,y1,x2,y2]) => { g.beginPath(); g.moveTo(x1,y1); g.quadraticCurveTo((x1+x2)/2 + 1, (y1+y2)/2, x2, y2); g.stroke(); });
  // 앉으면 무릎 위로 덮인 자락
  if (sit){ path(p => { p.moveTo(7, 64); p.quadraticCurveTo(24, 58, 41, 64); p.quadraticCurveTo(43, 72, 40, 76); p.quadraticCurveTo(24, 78, 8, 76); p.quadraticCurveTo(5, 72, 7, 64); }, robe, line); }
  if (!back){
  // 깃과 동정: 왼쪽 자락이 오른쪽 위로 여며짐
  path(p => { p.moveTo(20, 38); p.lineTo(23, 38); p.quadraticCurveTo(26, 46, 31, 52); p.lineTo(28.5, 53); p.quadraticCurveTo(23, 47, 20, 38); }, '#fbf8f1', '#b8af9a');
  path(p => { p.moveTo(28, 38); p.lineTo(25.5, 38); p.quadraticCurveTo(22, 44, 19, 48); p.lineTo(20.5, 49.5); p.quadraticCurveTo(24, 45, 28, 38); }, '#f6f2e8', '#b8af9a');
  // 세조대: 가슴께를 두른 청색 띠와 늘어진 술
  g.strokeStyle = BL; g.lineWidth = 2.2; g.beginPath(); g.moveTo(14.5, 53); g.quadraticCurveTo(24, 56.5, 34, 53); g.stroke();
  g.strokeStyle = BL2; g.lineWidth = 0.7; g.beginPath(); g.moveTo(15, 54.5); g.quadraticCurveTo(24, 58, 33.5, 54.5); g.stroke();
  g.fillStyle = BL; g.beginPath(); g.arc(27, 56, 1.6, 0, Math.PI*2); g.fill();
  g.strokeStyle = BL; g.lineWidth = 1.1; [[26.3, 70 + (sit ? -4 : 0)], [28, 67 + (sit ? -4 : 0)]].forEach(([x,y]) => { g.beginPath(); g.moveTo(27, 57); g.quadraticCurveTo(x + 0.6, (57+y)/2, x, y); g.stroke(); });
  g.fillStyle = BL2; g.fillRect(25.5, sit ? 65 : 69, 2, 3); g.fillRect(27.2, sit ? 62 : 66, 2, 3);
  // 맞잡은 손(공수)이 소매 끝에 살짝
  g.fillStyle = '#e2c19a'; g.beginPath(); g.ellipse(14, 70.5, 2.6, 1.6, 0.3, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(34, 70.5, 2.6, 1.6, -0.3, 0, Math.PI*2); g.fill();
  } else {
    // 뒷모습: 등솔기, 등 뒤로 돌아간 세조대, 뒤트임
    g.strokeStyle = '#cfc6b0'; g.lineWidth = 1; g.beginPath(); g.moveTo(24, 39); g.lineTo(24 + sway*0.5, hem - 1); g.stroke();
    g.strokeStyle = BL; g.lineWidth = 2.2; g.beginPath(); g.moveTo(14.5, 53); g.quadraticCurveTo(24, 50.5, 34, 53); g.stroke();
    if (!sit){ g.strokeStyle = '#b9b09a'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(24 + sway*0.5, hem - 18); g.lineTo(24 + sway*0.5, hem); g.stroke(); }
  }
  // 버선과 신(버선코가 들림)
  if (!sit){
    const f1 = pose === 'a' ? 0 : 1.5, f2 = pose === 'a' ? 1.5 : 0;
    [[15 + f1, 91 - f1*0.6, -1], [27 - f2, 91 - f2*0.6, 1]].forEach(([x,y]) => {
      path(p => { p.moveTo(x, y); p.quadraticCurveTo(x + 4, y - 1, x + 7.5, y + 1.8); p.quadraticCurveTo(x + 6, y + 4.2, x + 0.5, y + 4); }, '#f6f2ea', '#b8af9a');
      path(p => { p.moveTo(x - 0.5, y + 3); p.quadraticCurveTo(x + 4, y + 2, x + 8.2, y + 2.6); p.quadraticCurveTo(x + 7, y + 6, x - 0.5, y + 5.8); }, '#241a12');
    });
  }
  // 목과 얼굴(갸름한 달걀꼴), 귀
  g.fillStyle = '#d4ad85'; g.fillRect(21.5, 33, 5, 6);
  if (back){
    g.fillStyle = '#d9b48c'; g.beginPath(); g.ellipse(16.4, 28, 1.6, 2.6, 0, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(31.6, 28, 1.6, 2.6, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = '#1a1410'; g.beginPath(); g.moveTo(17, 22); g.quadraticCurveTo(16.4, 32, 24, 35); g.quadraticCurveTo(31.6, 32, 31, 22); g.closePath(); g.fill();   // 뒷머리
    g.strokeStyle = '#3a2e26'; g.lineWidth = 0.6; for (let k = 0; k < 5; k++){ g.beginPath(); g.moveTo(19 + k*2.5, 23); g.quadraticCurveTo(19.5 + k*2.3, 29, 21 + k*1.5, 33.5); g.stroke(); }   // 빗어 올린 결
  } else {
  const skin = g.createLinearGradient(16, 0, 32, 0); skin.addColorStop(0, '#ebcca6'); skin.addColorStop(0.7, '#dfbd95'); skin.addColorStop(1, '#c9a27c');
  g.fillStyle = '#d9b48c'; g.beginPath(); g.ellipse(16.4, 28, 1.6, 2.6, 0, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(31.6, 28, 1.6, 2.6, 0, 0, Math.PI*2); g.fill();
  g.fillStyle = skin; g.beginPath(); g.moveTo(17, 23); g.quadraticCurveTo(16.5, 33, 24, 36.5); g.quadraticCurveTo(31.5, 33, 31, 23); g.closePath(); g.fill();
  const FR = o.fear || 0;
  g.strokeStyle = '#3a2a20'; g.lineWidth = 0.9; g.beginPath();
  if (FR){ const u = FR === 2 ? 1.3 : 0.8; g.moveTo(18.8, 25.4); g.quadraticCurveTo(20.6, 25.2 - u*0.4, 22.4, 25 - u); g.moveTo(25.6, 25 - u); g.quadraticCurveTo(27.4, 25.2 - u*0.4, 29.2, 25.4); }   // 겁먹으면 눈썹 안쪽이 올라감
  else { g.moveTo(18.8, 25.2); g.quadraticCurveTo(20.6, 24.4, 22.4, 25); g.moveTo(25.6, 25); g.quadraticCurveTo(27.4, 24.4, 29.2, 25.2); }
  g.stroke();   // 눈썹
  if (o.closed){ g.strokeStyle = '#2a1e16'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(19.4, 27.6); g.quadraticCurveTo(20.7, 28.3, 22, 27.6); g.moveTo(26, 27.6); g.quadraticCurveTo(27.3, 28.3, 28.6, 27.6); g.stroke(); }   // 감은 눈
  else if (FR === 2) fearEyes(g, 20.7, 27.3, 27.4);   // 휘둥그레진 눈
  else { g.fillStyle = '#1a1410'; g.beginPath(); g.ellipse(20.7, 27.4, 1.3, 0.65, 0, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(27.3, 27.4, 1.3, 0.65, 0, 0, Math.PI*2); g.fill(); }   // 눈
  g.strokeStyle = '#b48a66'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(24, 27.6); g.quadraticCurveTo(23.2, 30.5, 24.6, 31); g.stroke();   // 코
  if (FR) fearMouth(g, FR, 24, 33); else { g.strokeStyle = '#8f5446'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(22.3, 33); g.quadraticCurveTo(24, 33.7, 25.7, 33); g.stroke(); }   // 입
  g.strokeStyle = '#2a201a'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(21.8, 32.2); g.quadraticCurveTo(24, 31.5, 26.2, 32.2); g.stroke();   // 옅은 콧수염
  if (FR) fearSweat(g, FR, 17, 31, 23);
  }
  // 망건(이마를 두른 검은 띠)과 상투 아래 머리
  g.fillStyle = '#1a1410'; g.beginPath(); g.moveTo(16.6, 23.6); g.quadraticCurveTo(24, 20.8, 31.4, 23.6); g.lineTo(31.2, 21.4); g.quadraticCurveTo(24, 18.6, 16.8, 21.4); g.closePath(); g.fill();
  const HAT = o.hat || 'gat';
  if (HAT === 'tang'){   // 탕건: 갓 없이 쓰는 검은 말총 관
    g.fillStyle = '#17130f'; g.beginPath(); g.moveTo(17.2, 22); g.lineTo(18.2, 13.5); g.quadraticCurveTo(24, 10.5, 29.8, 13.5); g.lineTo(30.8, 22); g.quadraticCurveTo(24, 19.6, 17.2, 22); g.closePath(); g.fill();
    g.strokeStyle = '#3a332b'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(18.6, 16.5); g.quadraticCurveTo(24, 14.6, 29.4, 16.5); g.stroke();
    return c;
  }
  if (HAT === 'sangtu'){   // 상투: 정수리에 틀어 올린 머리와 동곳
    g.fillStyle = '#1a1410'; g.beginPath(); g.moveTo(17, 21.6); g.quadraticCurveTo(17.6, 15.5, 24, 15); g.quadraticCurveTo(30.4, 15.5, 31, 21.6); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(24, 13, 2.6, 3, 0, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#c8b27a'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(21, 12.2); g.lineTo(27, 12.6); g.stroke();
    return c;
  }
  // 갓: 대우(위로 둥글게 솟은 통)와 넓은 양태(챙). 말총 갓이라 살짝 비침
  g.globalAlpha = 0.93;
  g.fillStyle = '#16130f'; g.beginPath(); g.moveTo(18, 20); g.quadraticCurveTo(17.4, 9, 19.5, 6); g.quadraticCurveTo(24, 3.6, 28.5, 6); g.quadraticCurveTo(30.6, 9, 30, 20); g.closePath(); g.fill();
  g.fillStyle = '#1c1814'; g.beginPath(); g.ellipse(24, 20.2, 22.5, 4.4, 0, 0, Math.PI*2); g.fill();
  g.globalAlpha = 1;
  g.strokeStyle = '#4a4238'; g.lineWidth = 0.7; g.beginPath(); g.ellipse(24, 19.8, 22, 3.9, 0, Math.PI*1.05, Math.PI*1.95); g.stroke();   // 챙 윗면의 빛
  g.strokeStyle = '#3a332b'; g.beginPath(); g.moveTo(20.4, 8); g.quadraticCurveTo(24, 6, 27.6, 8); g.stroke();
  // 갓끈 구슬: 챙 아래에서 턱 밑으로
  g.fillStyle = '#6a5038';
  for (let k = 0; k <= 7; k++){ const t = k/7; g.beginPath(); g.arc(16.2 + t*4.6, 22 + t*15.5, 0.75, 0, Math.PI*2); g.fill(); g.beginPath(); g.arc(31.8 - t*4.6, 22 + t*15.5, 0.75, 0, Math.PI*2); g.fill(); }
  return c;
}
const DOLL_A = drawSeonbi('a'), DOLL_B = drawSeonbi('b'), DOLL_SIT = drawSeonbi('sit');
const DOLL_A_BK = drawSeonbi('a', true), DOLL_B_BK = drawSeonbi('b', true), DOLL_SIT_BK = drawSeonbi('sit', true);
const WALK_MS = 4800;   // 문에서 의자 옆까지 걸어오는 시간
const T_PULL = WALK_MS + 800, T_STEP = T_PULL + 600, T_SIT = T_STEP + 350, T_PUSH = T_SIT + 800;   // 의자 빼기·들어서기·앉기·당기기
const DOOR_POS = [27, -22], SIDE_POS = [34, 8.5], CHAIR_IN = 12, CHAIR_OUT = 8.6;
const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
const NV_STAY = 9000;   // 밤에 처음 왔을 때 앉아 있는 시간
const nightVisiting = () => !!S.rNightVisit && Date.now() - S.rNightVisit < T_PUSH*2 + NV_STAY;
function sjState(){
  let e = Date.now() - (S.rArrived || 0), back = false;
  if (S.rNightVisit && e > T_PUSH + NV_STAY){ e = Math.max(0, T_PUSH*2 + NV_STAY - e); back = true; }   // 들어온 길을 거꾸로 되짚어 나감
  const s = sjPath(e);
  if (back && s.pose === 'walk') s.f = [-s.f[0], -s.f[1]];
  return s;
}
function sjPath(e){
  const dir = (ax, ay, bx, by) => { const l = Math.hypot(bx-ax, by-ay) || 1; return [(bx-ax)/l, (by-ay)/l]; };
  if (e < WALK_MS){ const t = e / WALK_MS; return { x: lerp(DOOR_POS[0], SIDE_POS[0], t), y: lerp(DOOR_POS[1], SIDE_POS[1], t), pose:'walk', chair: CHAIR_IN, f: dir(...DOOR_POS, ...SIDE_POS) }; }
  if (e < T_PULL)  return { x: SIDE_POS[0], y: SIDE_POS[1], pose:'stand', f:[-1, 0], chair: lerp(CHAIR_IN, CHAIR_OUT, (e - WALK_MS) / (T_PULL - WALK_MS)) };
  if (e < T_STEP){ const t = (e - T_PULL) / (T_STEP - T_PULL); return { x: lerp(SIDE_POS[0], 27, t), y: lerp(SIDE_POS[1], CHAIR_OUT + 1.6, t), pose:'walk', f: dir(SIDE_POS[0], SIDE_POS[1], 27, CHAIR_OUT + 1.6), chair: CHAIR_OUT }; }
  if (e < T_SIT)   return { x: 27, y: CHAIR_OUT + 1.6, pose:'stand', f:[0, 1], chair: CHAIR_OUT };
  const t = (e - T_SIT) / (T_PUSH - T_SIT);
  return { x: 27, y: lerp(CHAIR_OUT + 1.2, CHAIR_IN + 1.2, t), pose:'sit', f:[0, 1], chair: lerp(CHAIR_OUT, CHAIR_IN, t) };
}
const SJ = { id:'sj', get x(){ return sjState().x; }, get y(){ return sjState().y; }, doll:true, st:()=>sjState(), fear:()=>S.rFear||0, steam:()=>S.rSteam||0, arrT:()=>S.rArrived||0,
  img:{ A:DOLL_A, B:DOLL_B, SIT:DOLL_SIT, A_BK:DOLL_A_BK, B_BK:DOLL_B_BK, SIT_BK:DOLL_SIT_BK }, imgL: dollSet(drawSeonbi), show:()=>reveal('sj', S.rArrived) && (!isNight() || nightVisiting()), click:()=>showResearcher() };
let lastTick = performance.now(), lastAuto = performance.now();
function tick(now){
  const dt = Math.min(0.5, (now - lastTick)/1000); lastTick = now;
  if (S.stage !== 'room') return;
  if (now < steamUntil) S.fear = Math.max(0, S.fear - dt*0.2);                 // 차를 마시는 동안 서서히 가라앉음
  else if (S.D >= T.fearOn) S.fear = Math.min(0.8, S.fear + dt*0.025*(S.sideRead.dongui ? 0.6 : 1)*(now < calmUntil ? 0.35 : 1));
  document.getElementById('fear').style.opacity = S.fear.toFixed(2);
  const shaking = S.fear >= 0.35;
  bookView.classList.toggle('tremble', S.fear >= 0.22);
  bookView.style.setProperty('--tr', Math.min(1.6, Math.max(0.15, (S.fear - 0.22) * 4)).toFixed(2) + 'px');   // 공포만큼 세게
  if (shaking && !S.teaArrived && S.D >= T.tea){ S.teaArrived = true; save(); }
  let txt = fmtP(S.pages);
  if (!S.glitchDone && S.D >= T.glitch){ S.glitchDone = true; glitchUntil = now + 200; save(); }
  if (now < glitchUntil){ const m = txt.match(/\d(?=\D*$)/); if (m){ const k = m.index; txt = txt.slice(0,k) + ((+txt[k]+3)%10) + txt.slice(k+1); } }   // 숫자 한 자리가 잠깐 틀림
  cnt.textContent = txt;
  updateThread(now);
  researcherTick(dt);
  labTick(dt);
  if (!S.helpNote && S.caveAt && (S.rWork||0) >= (S.caveWork||0) + 90){ S.helpNote = true; save(); }
  if (!S.jokboDone && S.D >= T.jEnd){ S.jokboDone = true; save();
    setTimeout(() => queueOv(`<h3>족보</h3>다 풀었다.<br><br>${esc((S.bon||'') + ' ' + S.sur)}씨 17세손 ${esc(S.sur + S.name)}.<br>18세와 19세는 이름 칸이 비어 있다. 끝난 자리만 적혀 있다.<br>20세 아래로는 아무것도 없다.<br><br>그때 구석의 궤짝에서 무언가 들썩이는 소리가 났다.`), 1200);
    setTimeout(() => { noise(0.25, 90, 0.45, 'lowpass'); setTimeout(() => noise(0.18, 120, 0.3, 'lowpass'), 380); }, 700); }
  if (bookOpen && !bookView.classList.contains('hidden')) { threadPh += threadStir ? dt*5.5 : 0; drawThread(threadStir ? 5 : 0); }
  if (S.owned.desk && (itemAt('desk') === 'first' || itemAt('desk') === 'dongui') && now - lastAuto > 9000 && now - lastFlip > 4000 && ov.classList.contains('hidden')){ lastAuto = now; flip(true); }
}
function roomNews(){
  const n = [];
  for (const o of OBJ) if (o.buy && !S.owned[o.id] && S.pages >= o.buy.cost) n.push('buy:' + o.id);
  if (S.D >= T.door) n.push('door');
  if (S.teaArrived) n.push('teapot');
  if (S.D >= T.letter && !S.letterRead) n.push('letter');
  if (S.rArrived) n.push('researcher', 'diary:' + diaryCount());
  if (S.helpNote) n.push('help');
  if (S.pendingNote) n.push('note:' + S.pendingNote.length);
  if ((S.rFear||0) > 0.6) n.push('rfear');
  if (S.jokboDone && !S.mapFound) n.push('chest');
  n.push(...labNews());
  return n;
}
let lastNewsCheck = 0, threadStir = false, threadPh = 0, bookOpenedAt = 0, lastTwitch = -1e9, twitchUntil = 0;
function drawThread(amp){
  const th = document.getElementById('thread'); if (!th) return;
  const w = Math.sin(threadPh), w2 = Math.sin(threadPh*1.7 + 1);
  // 묶은 자리(책 아래 끝)에서 나와 책상 위에 옆으로 비스듬히 누움. 꿈틀거릴 땐 가운데가 들썩임
  const x0 = 20, y0 = 2, x1 = 46, y1 = 22 + amp*w*0.6, x2 = 88, y2 = 30 + amp*w2, x3 = 128 + amp*w*0.4, y3 = 40;
  const d = `M${x0},${y0} C${x0+4},${y0+12} ${x1-14},${y1-2} ${x1},${y1} S${x2-16},${y2-6} ${x2},${y2} S${x3-14},${y3-8} ${x3},${y3}`;
  th.querySelectorAll('.tsh,.tln,.ttw,.hit').forEach(p => p.setAttribute('d', d));
  th.querySelector('.tas').setAttribute('transform', `translate(${x3},${y3}) rotate(${18 + amp*w*4})`);
}
function updateThread(now){
  if (now - lastNewsCheck < 500) return; lastNewsCheck = now;
  const ack = S.ack || [];
  const fresh = roomNews().filter(k => !ack.includes(k));
  const urgent = S.teaArrived && S.fear > 0.4;            // 손이 떨릴 만큼 무서우면 실도 떨림
  if (!bookOpen) bookOpenedAt = now;
  if (bookOpen && now - bookOpenedAt > 90000 && now - lastTwitch > 25000){ lastTwitch = now; twitchUntil = now + 1400; }   // 오래 읽고 있으면 실이 가끔 살짝 움직임
  threadStir = bookOpen && (fresh.length > 0 || urgent || now < twitchUntil);
  const thEl = document.getElementById('thread'); if (thEl) thEl.classList.toggle('stir', threadStir);
  const blown = S.blown || [];
  const newly = fresh.filter(k => !blown.includes(k));
  if (bookOpen && S.owned.lamp && !S.lampOut && newly.length){   // 책을 읽는 동안 생긴 일에만
    S.lampOut = true; S.blown = blown.concat(newly); save(); applyLight();
    noise(0.6, 600, 0.12, 'lowpass');                                  // 훅 — 불이 꺼지는 바람 소리
  }
  if (bookOpen && S.D >= T.letter && !S.letterShadow){   // 편지가 놓일 때: 문 앞을 지나가는 그림자 하나
    S.letterShadow = true; save();
    const ps = document.getElementById('passShadow'); ps.classList.remove('go'); void ps.offsetWidth; ps.classList.add('go');
    setTimeout(() => { noise(0.12, 110, 0.4, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.35, 'lowpass'), 260); }, 1500);
  }
}
function deskClick(){
  ensureLoc();
  const it = itemAt('desk'), where = S.owned.desk ? '서안' : '궤짝 위';
  if (!it){ openOv(`<h3>${S.owned.desk ? '서안' : '궤짝'}</h3>${where}${S.owned.desk ? '이' : '가'} 비어 있다.<br>책장에서 읽을 것을 가져와 올려야 한다.`); return; }
  if (it === 'map') openMap(); else openBook();
}
// 책장의 책·지도를 어디에 둘지
function showPlace(id){
  ensureLoc();
  const where = S.loc[id], here = { shelf: id === 'map' ? '책장 위' : '책장', desk: S.owned.desk ? '서안 위' : '궤짝 위', rdesk:'연구원 책상 위' }[where] || '';
  const desc = { first:'궤짝에서 나온 제목 없는 책. 장부와 족보가 적혀 있다.', dongui:'간을 다룬 장에 손때가 많다. 한문으로 적혀 있고, 누군가 붉은 먹으로 덧쓴 곳이 있다.' + (S.sideRead.dongui ? '<br>다 풀었다.' : ''), map:'궤짝 바닥 안감 밑에서 나온, 여러 번 접힌 지도.' }[id];
  const btn = (k, label) => `<button class="btn rec" data-to="${k}" style="color:var(--ink);border-color:#00000066;margin:4px">${label}</button>`;
  let b = '';
  if (where !== 'desk') b += btn('desk', (S.owned.desk ? '서안' : '궤짝 위') + '에 올린다');
  else b += btn('open', '펼친다');
  if (S.rArrived && where !== 'rdesk') b += btn('rdesk', '연구원 책상에 올린다');
  if (where !== 'shelf') b += btn('shelf', id === 'map' ? '책장 위에 둔다' : '책장에 꽂는다');
  openOv(`<h3>${INAME[id]}</h3>${desc}<div style="font-size:12px;opacity:.6;margin-top:6px">지금: ${here}</div><div style="text-align:center;margin-top:14px">${b}</div>`);
  ovBody.querySelectorAll('[data-to]').forEach(el => el.addEventListener('click', ev => {
    ev.stopPropagation(); const to = el.dataset.to; sPlace();
    if (to === 'open'){ ov.classList.add('hidden'); deskClick(); return; }
    placeItem(id, to); ov.classList.add('hidden');   // 서고에서 올라가는 모습을 보게, 바로 펼치지 않음
  }));
}
function giveTea(){ S.rSteam = Date.now() + 3000; S.rCalm = Date.now() + 3000 + 240000; save(); sBoil(); }   // 차 효과 4분
function showTea(){
  openOv('<h3>찻주전자</h3>손이 떨리기 시작하자 서고 한쪽에 놓여 있었다. 누가 가져왔는지는 모른다.<br>차를 끓여 마시면 떨림이 가라앉고, 한동안은 두려움이 더디게 찾아온다.<br><br>찻잎은 줄지 않는다.'
    + '<div style="text-align:center;margin-top:16px"><button class="btn rec" id="bBrew" style="color:var(--ink);border-color:#00000066">차를 끓인다</button>' + (S.rArrived ? '<button class="btn rec" id="bBrew2" style="color:var(--ink);border-color:#00000066;margin-left:6px">한서진에게 한 잔 내준다</button>' : '') + '</div>');
  const b2 = document.getElementById('bBrew2'); if (b2) b2.addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); giveTea(); });
  document.getElementById('bBrew').addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); brew(); });
}
let calmUntil = 0;
let relitAt = -1e9;
function lampClick(){
  if (S.lampOut){ S.lampOut = false; relitAt = performance.now(); save(); applyLight(); noise(0.25, 2600, 0.08); setTimeout(() => noise(0.4, 500, 0.05, 'lowpass'), 120); }   // 치익 — 다시 붙인 불
  else showItem('lamp');
}
function brew(){ const now = performance.now(); if (now < steamUntil) return; steamUntil = now + 2600; calmUntil = now + 2600 + 25000; sBoil(); setTimeout(()=>save(), 2700); }
const ITEM = {
  lamp:  ['등잔', '불을 켜면 글자가 보인다.<br>한 번에 두 장씩 넘길 수 있다.<br>서고에 무슨 일이 생기면 바람도 없이 불이 꺼진다. 등잔을 누르면 다시 붙인다.<br><br>기름은 줄지 않는다.'],
  brush: ['붓걸이', '푼 글자를 받아 적는다. 해독이 빨라진다.<br>받아 적은 것은 도서관에 남는다.<br><br>붓이 넷. 하나는 쓴 적이 없는데 먹이 묻어 있다.'],
  desk:  ['서안', '궤짝에서 책을 꺼내 책장에 꽂았다. 이제 책장에는 열세 권이 있다. 궤짝은 구석으로 치웠다.<br>{LAMP}서안은 비워 두었다. 책장에서 읽을 것을 가져와 올려야 한다.<br><br>책을 펼쳐 두면 손대지 않아도 넘어간다.<br>책을 덮어 두어도 넘어간다.<br>한 번에 넘기는 장수도 늘어난다.<br>밤에 펼쳐 두고 자리를 비우면, 아침에 몇 장 넘어가 있다.<br><br>창은 닫혀 있다.'],
  sundial: ['앙부일구(仰釜日晷)', '해 그림자로 때를 재는 솥 모양 해시계.<br>이제 연구원이 얼마나 빨리 넘기는지 정확히 셀 수 있다.<br><br>그림자가 가끔 두 갈래로 갈라진다.'],
  glass: ['수정 문진(水晶文鎭)', '종이를 눌러 두는 문진. 가운데 박힌 수정으로 글자를 크게 볼 수 있다. 해독이 훨씬 빨라진다.<br>책을 펼치면 책 곁에 놓여 있다. 집어 들어 대면 글자가 크게 보인다.<br>크게 보면 아직 풀리지 않은 글자도 조금 읽힌다.<br>내려놓으려면 놓였던 자리를 누른다.<br><br>여백에 다른 손으로 쓴 글씨가 있다. 아주 작다.'],
};
function showItem(id){ const body = ITEM[id][1].replace('{LAMP}', S.owned.lamp ? '등잔대는 서안 곁으로 옮겼다. ' : ''); openOv(`<h3>${ITEM[id][0]}</h3>${body}`); }
function askBuy(o){                                     // 사기 전 한 번 확인(시험 플레이: 설명 보려다 13권이 빠짐)
  const c = o.buy.cost, have = S.pages, ok = have >= c;
  openOv(`<h3>${o.buy.name}</h3>값: ${fmtP(c)}<br>가진 것: ${fmtP(have)}`
    + (ok ? '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bBuy" style="color:var(--ink);border-color:#00000066">들인다</button></div>'
          : `<div style="margin-top:10px;opacity:.75">${fmtP(c - have)} 모자란다. 더 읽어야 한다.</div>`));
  const b = document.getElementById('bBuy'); if (b) b.addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); buy(o); });
}
function buy(o){ if (S.pages < o.buy.cost) return; S.pages -= o.buy.cost; S.owned[o.id] = true; tlog('들임: ' + o.buy.name);
  if (o.id === 'desk'){ ensureLoc(); ITEMS.forEach(k => { if (S.loc[k] === 'desk') S.loc[k] = 'shelf'; }); }
  sPlace(); save(); showItem(o.id); }

