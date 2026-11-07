'use strict';
// ───────── 집 지도(家屋圖) 얇은 첫 판 (기획서 17절 · 1대 일정표 '만들 순서' C · 신 1호 일정표 막 4) ─────────
// 바다 궤가 놓인 다음 날 문갑 곁에 두루마리(막 4의 신호) → 펴면 한지에 먹선으로 그린 집 배치도.
//   지은 곳(서고·별채·대문)을 누르면 그리로 감. 빈 필지는 땅을 사고(5냥부터 한 필지마다 ×1.5) → 정해진 건물을 올림(실제 시간이 걸리는 공사).
//   지을 것이 아직 없는 땅은 소작을 줌(하루 2전, 쌀로 들어와 돈으로 셈).
// 건물: 부엌(녹봉 쌀값이 덜 듦) · 행랑채(일꾼 하나, 새경 하루 1전) · 차밭(일꾼이 있으면 찻잎) · 제다소(찻잎을 덖어 정직한 차가 곱절).
//   정직한 차(S.tea, 근): 가주가 차를 끓이면 찻주전자 대신 이것을 씀(광기 없음 — 19_mad) · 제다소에서 장에 내다 팖.
// 상황판: 사람이 읽는 방엔 불빛, 부엌엔 연기, 해와 달이 가장자리를 돎(게임 시각).
const PLOTS = [   // [id, 이름, 칸(열·행), 올릴 것]
  ['shrine', '사당 터',     [0, 0], 'yeon'],   // 10/31: 연구소(19_yeon)
  ['field',  '뒷산 비탈',   [1, 0], 'teaf'],
  ['sarang', '사랑채',      [2, 0], 'have'],   // 10/31: 우물 터 → 사랑채(19_sarang)
  ['lab',    '별채',        [0, 1], 'have'],
  ['seogo',  '서고',        [1, 1], 'have'],
  ['kitchen','부엌 터',     [2, 1], 'kitchen'],
  ['row',    '행랑 터',     [0, 2], 'haeng'],
  ['gate',   '마당·대문',   [1, 2], 'have'],
  ['mill',   '아랫마을 쪽', [2, 2], 'mill'],
];
const BUILD = {   // 값(푼) · 공사 시간(시간) · 다 지은 이름
  kitchen:{ name:'부엌',   cost:600,  h:3, done:'부엌과 아궁이' },
  haeng:  { name:'행랑채', cost:1000, h:5, done:'행랑채' },
  teaf:   { name:'차밭',   cost:300,  h:2, done:'차밭' },
  mill:   { name:'제다소', cost:1500, h:6, done:'제다소', need:'teaf' },
  yeon:   { name:'연구소', cost:2000, h:6, done:'연구소(硏究所)' },   // 연구 전용 책상(19_yeon, 연구 테크트리 '연구소')
};
const hourMs = () => DAY_MS() / 24;
const landCost = () => Math.round(K.landBase * Math.pow(K.landMul, Object.keys(S.land || {}).length));
const built = b => !!(S.land && Object.values(S.land).some(p => p.b === b && p.done));
const houseOn = () => !!S.labSeen;   // 별채에 처음 들어선 뒤(10/31 선생님 "지도가 좀 일찍" — 전엔 바다 궤 다음 날)
const wageK = () => built('kitchen') ? 0.8 : 1;                                           // 19_money WAGE에 곱함

// ── 두루마리 ──
M.houseScroll = model(8, 3, 2, (x, y, z) => (y === 1 || z === 1) ? (x === 0 || x === 7 ? '#5a3a20' : '#d9ccaa') : null);
OBJ.push({ id:'houseScroll', x:23, y:-17, rot:0.2, m:()=>'houseScroll', show:()=> S.D >= T.door && houseOn(), glow:()=> !S.houseSeen, click:()=>showHouse() });

function plotState(id){
  const p = (S.land || {})[id];
  if (!p) return { own:false };
  if (p.b && !p.done){ const left = p.end - Date.now(); return { own:true, b:p.b, building:true, left }; }
  return { own:true, b:p.b, done:p.done, rent:p.rent };
}
function houseTick(){
  if (!S.land) return;
  for (const id of Object.keys(S.land)){ const p = S.land[id];
    if (p.b && !p.done && Date.now() >= p.end){ p.done = true; save(); knock(0.3); if (typeof tlog === 'function') tlog('공사 끝: ' + BUILD[p.b].name);
      if (p.b === 'haeng') S.worker = { at: Date.now() }; } }
  const today = dayKey();
  if (S.houseDay == null){ S.houseDay = today; save(); return; }
  while (S.houseDay < today){ S.houseDay++;
    const rent = Object.values(S.land).filter(p => p.rent).length;
    if (rent){ S.money = (S.money || 0) + rent * K.rentDay; ledger(`소작료(쌀) ${rent}필지 + ${fmtM(rent * K.rentDay)}`); }
    if (S.worker){
      if ((S.money || 0) >= K.workerWage){ S.money -= K.workerWage; ledger(`일꾼 새경 - ${fmtM(K.workerWage)}`);
        if (built('teaf')){ const n = built('mill') ? K.teaMill : K.teaField; S.tea = (S.tea || 0) + n; ledger(`정직한 차 ${n}근을 거둠 (치부만, 돈 아님)`); } }
      else ledger('일꾼 새경을 주지 못함 — 차밭 일을 쉼');
    }
    save();
  }
}

// ── 가옥도 창 ──
// ── 가옥도 그림(11/7 선생님: 도성도처럼 — 산이 둘러싼 땅의 집을 멀리서 내려다본 그림, 해·달은 산 위로 뜨고 짐) ──
const HM_W = 640, HM_H = 540;
// 한옥 배치: 뒤(위)가 높은 곳 — 사당은 맨 뒤 · 서고는 안채 자리(가운데 안쪽) · 부엌은 서고 옆 ㄱ자 날개 · 별채는 옆으로 떨어짐 · 사랑채는 대문 안 사랑마당 · 행랑채는 대문 양옆 바깥 담 · 솟을대문 · 담 밖 개울가에 제다소·길가
const HM_POS = { shrine:[520, 176, 1.05], field:[132, 172, 1.1], seogo:[312, 236, 1.35], kitchen:[424, 256, 1.2], lab:[148, 272, 1.2], sarang:[474, 346, 1.35], row:[186, 410, 1.3], gate:[320, 412, 1.35], mill:[528, 474, 1.25], museum:[118, 474, 1.2] };
function hmAt(id, [c, r]){ return HM_POS[id] || [140 + c * 180, 190 + r * 92, 1.2 + r * 0.08]; }
function hmInfo([id, nm, at, b]){
  const ps = plotState(id), lit = id === 'lab' ? allKeys().some(k => S.st[k] && working(k)) : id === 'seogo' ? !!(S.rArrived && !isNight()) || bookOpen : false;
  let label = nm, sub = '', cls = '', kind = '';
  if ((!b || id === 'shrine') && !ps.own && madRoom()) return { label:'이름 없는 방', sub:'', cls:'ghostRoom' + (myMad() >= 12 ? ' door' : ''), kind:'ghost', lit:false };   // 광기 9단계: 지은 적 없는 방
  if (b === 'have'){ cls = 'have' + (lit ? ' lit' : ''); kind = id; sub = id === 'gate' && typeof HOOK !== 'undefined' && HOOK.dolls.gate.some(f => f().length) ? '누가 서 있다' : ''; }
  else if (!ps.own){ cls = 'empty'; kind = 'empty'; sub = '빈 땅'; }
  else if (ps.building){ cls = 'work'; kind = 'work'; label = BUILD[ps.b].name; sub = `공사 중 — ${Math.max(1, Math.ceil(ps.left / 60e3))}분 남음`; }
  else if (ps.done){ cls = 'have' + (ps.b === 'kitchen' && !isNight() ? ' smoke' : '') + (ps.b === 'yeon' && S.techWork ? ' lit' : ''); kind = ps.b; label = BUILD[ps.b].done; sub = ps.b === 'teaf' ? (S.worker ? '일꾼이 있다' : '손이 없다') : ps.b === 'mill' ? `정직한 차 ${S.tea || 0}근` : ''; }
  else { cls = 'own'; kind = 'own'; sub = ps.rent ? '소작을 줌' : '우리 땅'; }
  return { label, sub, cls, kind, lit: /lit/.test(cls) };
}
function hmCell(P){
  const [id, , at] = P, I = hmInfo(P), [x, y, s] = hmAt(id, at);
  return `<div class="hmCell hmSpot ${I.cls}" data-hm="${id}" style="left:${(x / HM_W * 100).toFixed(2)}%;top:${((y - 58 * s) / HM_H * 100).toFixed(2)}%;height:${(80 * s / HM_H * 100).toFixed(2)}%"><b>${I.label}</b><span>${I.sub}</span></div>`;
}
// 기와집 한 채: (x, y) = 앞 기단 가운데 · w = 폭 · o.lit 불빛 · o.red 붉은 기둥(사당) · o.ghost 먹으로만
function hmHouse(g, x, y, s, w, o = {}){
  if (o.side) return hmSide(g, x, y, s, w, o);
  const W = w * s, Hh = o.roofOnly ? 0 : (o.low ? 11 : 16) * s, D = 9 * s, ink = o.ghost ? 'rgba(14,10,8,.92)' : null;
  if (!o.roofOnly){ g.fillStyle = ink || 'rgba(160,150,130,.6)'; g.beginPath(); g.moveTo(x - W/2 - 5*s, y); g.lineTo(x + W/2 + 5*s, y); g.lineTo(x + W/2 + 5*s + D*0.5, y - D*0.45); g.lineTo(x - W/2 - 5*s + D*0.5, y - D*0.45); g.closePath(); g.fill(); }   // 기단
  const wy = y - 2.5*s;
  if (!o.roofOnly){ g.fillStyle = ink || '#efe6cf'; g.fillRect(x - W/2, wy - Hh, W, Hh); }
  if (o.roofOnly){}
  else if (!o.ghost){
    const n = Math.max(2, Math.round(W / (13 * s)));
    for (let i = 0; i < n; i++){ const x0 = x - W/2 + i * W / n, ww = W / n;   // 칸마다 창
      g.fillStyle = o.lit ? 'rgba(236,176,80,.95)' : 'rgba(96,74,52,.55)'; g.fillRect(x0 + ww * 0.22, wy - Hh * 0.78, ww * 0.56, Hh * 0.56); }
    g.strokeStyle = o.red ? 'rgba(150,50,36,.95)' : 'rgba(92,58,32,.9)'; g.lineWidth = 1.3 * s;   // 기둥·도리
    for (let i = 0; i <= n; i++){ const px = x - W/2 + i * W / n; g.beginPath(); g.moveTo(px, wy); g.lineTo(px, wy - Hh); g.stroke(); }
    g.beginPath(); g.moveTo(x - W/2, wy - Hh); g.lineTo(x + W/2, wy - Hh); g.stroke();
  } else if (o.door){ g.fillStyle = '#000'; g.fillRect(x - 4*s, wy - Hh*0.8, 8*s, Hh*0.8); g.strokeStyle = 'rgba(200,190,170,.5)'; g.lineWidth = 0.8; g.strokeRect(x - 4*s, wy - Hh*0.8, 8*s, Hh*0.8); }
  if (o.numaru && !o.ghost){ const nx = x - W/2, nw = Math.min(22 * s, W * 0.3);   // 누마루: 왼쪽 끝 한 칸이 기둥 위로 들리고 난간
    g.fillStyle = '#efe6cf'; g.fillRect(nx - 0.5, wy - Hh, nw, Hh); g.fillStyle = 'rgba(40,30,20,.55)'; g.fillRect(nx, wy - Hh * 0.42, nw, Hh * 0.42);
    g.strokeStyle = 'rgba(92,58,32,.95)'; g.lineWidth = 1.4 * s; for (const px of [nx, nx + nw * 0.5, nx + nw]){ g.beginPath(); g.moveTo(px, y); g.lineTo(px, wy - Hh); g.stroke(); }
    g.beginPath(); g.moveTo(nx, wy - Hh * 0.42); g.lineTo(nx + nw, wy - Hh * 0.42); g.moveTo(nx, wy - Hh * 0.62); g.lineTo(nx + nw, wy - Hh * 0.62); g.stroke();
    for (let k = 1; k < 5; k++){ g.beginPath(); g.moveTo(nx + nw * k / 5, wy - Hh * 0.62); g.lineTo(nx + nw * k / 5, wy - Hh * 0.42); g.stroke(); } }
  const ry = wy - Hh, ov = 10 * s, rh = 15 * s;                                    // 기와지붕: 처마 끝이 들림
  const gr = g.createLinearGradient(0, ry - rh, 0, ry + 3*s); gr.addColorStop(0, ink || '#2c3136'); gr.addColorStop(1, ink || '#59616a');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - W/2 - ov, ry - 4*s); g.quadraticCurveTo(x, ry + 7*s, x + W/2 + ov, ry - 4*s);
  g.lineTo(x + W/2 - 3*s, ry - rh); g.quadraticCurveTo(x, ry - rh + 2.5*s, x - W/2 + 3*s, ry - rh); g.closePath(); g.fill();
  if (!o.ghost){ g.strokeStyle = 'rgba(210,214,216,.22)'; g.lineWidth = 0.8;     // 기왓골
    for (let t = 0.06; t < 0.97; t += 0.07){ const bx = x - W/2 - ov + (W + 2*ov) * t, tx = x - W/2 + 3*s + (W - 6*s) * t; g.beginPath(); g.moveTo(tx, ry - rh + 1.5*s); g.lineTo(bx, ry - 1.5*s + 5*s * Math.sin(Math.PI * t) * 0.9); g.stroke(); } }
  g.strokeStyle = ink || '#1d2125'; g.lineWidth = 2.6 * s; g.lineCap = 'round';   // 용마루(양끝이 들림)
  g.beginPath(); g.moveTo(x - W/2 + 1*s, ry - rh - 2.5*s); g.quadraticCurveTo(x, ry - rh + 1.5*s, x + W/2 - 1*s, ry - rh - 2.5*s); g.stroke(); g.lineCap = 'butt';
}
function hmSide(g, x, y, s, w, o = {}){
  const W = 26 * s, L = w * s * 0.55, Hh = 16 * s, wy = y - 2.5 * s, dx = L * 0.55, dy = -L * 0.42;   // 앞면 폭 · 뒤로 뻗는 길이(비스듬히)
  g.fillStyle = 'rgba(160,150,130,.6)'; g.beginPath(); g.moveTo(x - W/2 - 3*s, y); g.lineTo(x + W/2 + 3*s, y); g.lineTo(x + W/2 + 3*s + dx, y + dy); g.lineTo(x - W/2 - 3*s + dx, y + dy); g.closePath(); g.fill();
  g.fillStyle = '#e4dac0'; g.beginPath(); g.moveTo(x + W/2, wy); g.lineTo(x + W/2 + dx, wy + dy); g.lineTo(x + W/2 + dx, wy + dy - Hh); g.lineTo(x + W/2, wy - Hh); g.closePath(); g.fill();   // 옆벽(길게)
  g.strokeStyle = 'rgba(92,58,32,.9)'; g.lineWidth = 1.2 * s; for (let k = 0; k <= 3; k++){ const px = x + W/2 + dx * k / 3, py = wy + dy * k / 3; g.beginPath(); g.moveTo(px, py); g.lineTo(px, py - Hh); g.stroke();
    if (k < 3){ g.fillStyle = o.lit ? 'rgba(236,176,80,.95)' : 'rgba(96,74,52,.5)'; g.beginPath(); const qx = px + dx / 3 * 0.25, qy = py + dy / 3 * 0.25; g.moveTo(qx, qy - Hh * 0.75); g.lineTo(qx + dx / 3 * 0.5, qy + dy / 3 * 0.5 - Hh * 0.75); g.lineTo(qx + dx / 3 * 0.5, qy + dy / 3 * 0.5 - Hh * 0.3); g.lineTo(qx, qy - Hh * 0.3); g.closePath(); g.fill(); } }
  g.fillStyle = '#efe6cf'; g.fillRect(x - W/2, wy - Hh, W, Hh); g.strokeRect(x - W/2, wy - Hh, W, Hh);   // 박공 쪽 앞면
  g.fillStyle = 'rgba(70,50,34,.75)'; g.fillRect(x - W * 0.18, wy - Hh * 0.8, W * 0.36, Hh * 0.8);   // 부엌문
  const ry = wy - Hh, rh = 16 * s, ov = 6 * s;
  g.fillStyle = '#d8ccb0'; g.beginPath(); g.moveTo(x - W/2, ry); g.lineTo(x, ry - rh); g.lineTo(x + W/2, ry); g.closePath(); g.fill(); g.strokeStyle = 'rgba(92,58,32,.8)'; g.stroke();   // 박공(합각)
  const gr = g.createLinearGradient(0, ry - rh, 0, ry); gr.addColorStop(0, '#2c3136'); gr.addColorStop(1, '#59616a'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(x, ry - rh - 1.5*s); g.lineTo(x + dx, ry - rh - 1.5*s + dy); g.lineTo(x + W/2 + ov + dx, ry + 2*s + dy); g.lineTo(x + W/2 + ov, ry + 2*s); g.closePath(); g.fill();   // 오른쪽 지붕면
  g.strokeStyle = 'rgba(210,214,216,.22)'; g.lineWidth = 0.8; for (let t = 0.1; t < 1; t += 0.12){ g.beginPath(); g.moveTo(x + dx * t, ry - rh - 1.5*s + dy * t); g.lineTo(x + W/2 + ov + dx * t, ry + 2*s + dy * t); g.stroke(); }
  g.strokeStyle = '#1d2125'; g.lineWidth = 2.6 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 1*s, ry - rh - 3*s); g.lineTo(x + dx, ry - rh - 1.5*s + dy); g.stroke();   // 용마루
  g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(x - W/2 - ov, ry + 2*s); g.lineTo(x, ry - rh - 1.5*s); g.lineTo(x + W/2 + ov, ry + 2*s); g.stroke(); g.lineCap = 'butt';   // 박공 처마
  if (o.smoke) for (let k = 0; k < 3; k++) inkBlot(g, x + dx * 0.6 + k * 3, ry - rh + dy * 0.6 - 8 - k * 9, 6 + k * 2, 'rgba(120,112,100,A)', 0.3 - k * 0.07);   // 아궁이 연기
}
function hmPlot(g, r, x, y, s, own){                                               // 빈 터: 풀 난 땅(우리 땅이면 옅은 황토빛)
  const w = 48 * s, d = 20 * s;
  g.fillStyle = own ? 'rgba(170,130,70,.18)' : 'rgba(120,130,80,.08)'; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y); g.lineTo(x + w + d*0.6, y - d); g.lineTo(x - w + d*0.6, y - d); g.closePath(); g.fill();
  g.setLineDash([5, 4]); g.strokeStyle = own ? 'rgba(60,40,20,.6)' : 'rgba(60,50,30,.35)'; g.lineWidth = 1; g.stroke(); g.setLineDash([]);
  g.strokeStyle = 'rgba(60,80,40,.55)'; g.lineWidth = 1;
  for (let k = 0; k < 14; k++){ const gx = x - w + d*0.3 + r() * (w*2), gy = y - 3 - r() * (d - 6); g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx - 1.5, gy - 4); g.moveTo(gx, gy); g.lineTo(gx + 1.5, gy - 4); g.stroke(); }
}
function hmFrame(g, x, y, s){                                                      // 짓는 중: 기둥과 도리만, 곁에 목재 더미
  const W = 54 * s, Hh = 18 * s; g.strokeStyle = 'rgba(110,70,36,.95)'; g.lineWidth = 2 * s;
  for (const px of [x - W/2, x - W/6, x + W/6, x + W/2]){ g.beginPath(); g.moveTo(px, y); g.lineTo(px, y - Hh); g.stroke(); }
  g.beginPath(); g.moveTo(x - W/2 - 4*s, y - Hh); g.lineTo(x + W/2 + 4*s, y - Hh); g.moveTo(x - W/2, y - Hh); g.lineTo(x, y - Hh - 12*s); g.lineTo(x + W/2, y - Hh); g.stroke();
  g.fillStyle = 'rgba(140,96,52,.85)'; for (let k = 0; k < 3; k++) g.fillRect(x + W/2 + 6*s, y - 3*s - k * 3*s, 18*s, 2.4*s);
}
function hmTree(g, r, x, y, k){                                                    // 소나무 한 그루(먹점 잎)
  g.strokeStyle = 'rgba(70,50,30,.8)'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 12 * k); g.stroke();
  for (let i = 0; i < 4; i++) inkBlot(g, x + (r() - 0.5) * 10 * k, y - 10 * k - i * 3 * k, (5 + r() * 3) * k, 'rgba(40,70,52,A)', 0.55);
}
function hmDraw(){
  const c = document.createElement('canvas'); c.width = HM_W; c.height = HM_H; const g = c.getContext('2d'), r = rng(91), night = isNight(), h = gameHour();
  oldPaper(g, HM_W, HM_H, r);
  // 하늘의 해·달 — 산보다 먼저 그려서 산 뒤에서 떠오르고 산 뒤로 짐
  const t = night ? ((h - 18 + 24) % 24) / 12 : (h - 6) / 12, ox = 40 + 560 * t, oy = 150 - 128 * Math.sin(Math.PI * Math.max(0, Math.min(1, t)));
  if (!night && (t < 0.16 || t > 0.84)) inkBlot(g, ox, oy, 170, 'rgba(214,120,60,A)', 0.28);   // 해 뜰 녘·질 녘 노을
  if (night){ inkBlot(g, ox, oy, 40, 'rgba(240,236,214,A)', 0.35); g.fillStyle = '#f2ecd8'; g.beginPath(); g.arc(ox, oy, 12, 0, Math.PI*2); g.fill(); g.fillStyle = 'rgba(200,190,160,.9)'; g.beginPath(); g.arc(ox + 5, oy - 2, 10, 0, Math.PI*2); g.fill(); }
  else { inkBlot(g, ox, oy, 34, 'rgba(200,80,40,A)', 0.35); g.fillStyle = '#c0482a'; g.beginPath(); g.arc(ox, oy, 13, 0, Math.PI*2); g.fill(); }
  // 산: 뒤 산줄기(청록 담채 + 수묵) · 양옆 산등성이
  const peak = (x, y, w, hh, a) => { const gr = g.createLinearGradient(0, y - hh, 0, y + 10); gr.addColorStop(0, `rgba(58,104,96,${a})`); gr.addColorStop(1, 'rgba(90,130,100,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w * 1.4, y + 10); g.quadraticCurveTo(x - w * 0.5, y - hh * 0.9, x, y - hh); g.quadraticCurveTo(x + w * 0.5, y - hh * 0.9, x + w * 1.4, y + 10); g.fill(); inkMount(g, r, x, y, w, hh, 1); };
  [[70, 150, 70, 70, .55], [200, 140, 80, 105, .6], [330, 135, 90, 120, .65], [460, 142, 80, 100, .6], [585, 150, 70, 75, .55]].forEach(p => peak(...p));
  [[34, 250, 40, 48, .45], [30, 345, 42, 44, .4], [606, 255, 40, 50, .45], [612, 350, 40, 44, .4], [70, 470, 50, 38, .35], [575, 468, 50, 36, .35]].forEach(p => peak(...p));
  { const gr = g.createLinearGradient(0, 150, 0, 470); gr.addColorStop(0, 'rgba(120,140,90,.16)'); gr.addColorStop(1, 'rgba(150,150,100,.06)'); g.fillStyle = gr; g.fillRect(40, 140, HM_W - 80, 330); }   // 들판 담채
  // 길과 개울
  g.strokeStyle = 'rgba(150,120,80,.5)'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(320, 418); g.quadraticCurveTo(300, 470, 330, 540); g.stroke(); g.lineCap = 'butt';
  { g.fillStyle = 'rgba(110,150,170,.38)'; g.beginPath(); g.moveTo(0, 488); for (let x = 0; x <= HM_W; x += 10) g.lineTo(x, 488 + Math.sin(x / 70) * 9); for (let x = HM_W; x >= 0; x -= 10) g.lineTo(x, 512 + Math.sin(x / 60 + 1) * 8); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(40,60,70,.55)'; g.lineWidth = 1.4; g.beginPath(); for (let x = 0; x <= HM_W; x += 10) (x ? g.lineTo : g.moveTo).call(g, x, 488 + Math.sin(x / 70) * 9); g.stroke();
    g.strokeStyle = 'rgba(70,90,100,.35)'; g.lineWidth = 0.9; for (let k = 0; k < 16; k++){ const wx = 20 + k * 40 + r() * 10, wy = 500 + Math.sin(wx / 65) * 6; g.beginPath(); g.arc(wx, wy, 7, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    g.strokeStyle = 'rgba(92,58,32,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(306, 496); g.quadraticCurveTo(326, 488, 346, 498); g.stroke();   // 다리
    g.lineWidth = 1.2; for (const bx of [312, 326, 340]){ g.beginPath(); g.moveTo(bx, 494); g.lineTo(bx, 506); g.stroke(); } }
  // 담장: 바깥 담(대문 자리만 비움) · 사랑마당과 안마당을 가르는 내담(중문 자리 비움) · 사당 둘레 담
  const wallLine = (pts) => { for (const [lw, col] of [[7, 'rgba(196,178,140,.9)'], [2.4, 'rgba(48,52,56,.85)']]){ g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, x, y - (lw < 3 ? 3 : 0))); g.stroke(); } };
  wallLine([[296, 414], [40, 410], [52, 150], [588, 150], [600, 410], [344, 414]]);
  wallLine([[50, 304], [298, 304]]); wallLine([[336, 304], [420, 304], [420, 280]]);   // 내담 · 중문(가운데 빈자리)
  g.strokeStyle = 'rgba(92,58,32,.9)'; g.lineWidth = 2; for (const px of [300, 334]){ g.beginPath(); g.moveTo(px, 304); g.lineTo(px, 288); g.stroke(); } g.beginPath(); g.moveTo(296, 288); g.lineTo(338, 288); g.stroke();   // 중문
  wallLine([[462, 196], [462, 156], [578, 156], [578, 196], [462, 196]]);   // 사당 담
  for (let k = 0; k < 26; k++){ const left = k % 2 === 0, x = left ? 14 + r() * 26 : HM_W - 40 + r() * 26, y = 170 + r() * 300; hmTree(g, r, x, y, 0.8 + r() * 0.4); }   // 담 밖 솔숲
  for (const [x, y] of [[100, 470], [150, 462], [480, 466], [540, 474], [250, 448]]) hmTree(g, r, x, y, 1);
  // 집과 터 — 뒤에서 앞으로
  const plots = PLOTS.filter(p => !p[4] || p[4]()).map(P => ({ P, I: hmInfo(P), at: hmAt(P[0], P[2]) })).sort((a, b) => a.at[1] - b.at[1]);
  for (const { P, I, at: [x, y, s] } of plots){ const id = P[0], pr = rng(id.length * 97 + id.charCodeAt(0));
    if (I.kind === 'ghost'){ hmHouse(g, x, y, s, 60, { ghost: true, door: /door/.test(I.cls) }); continue; }
    if (I.kind === 'empty' || I.kind === 'own'){ hmPlot(g, pr, x, y, s, I.kind === 'own'); continue; }
    if (I.kind === 'work'){ hmPlot(g, pr, x, y, s, true); hmFrame(g, x, y - 4 * s, s); continue; }
    if (I.kind === 'gate'){ g.fillStyle = 'rgba(92,58,32,.95)'; g.fillRect(x - 15*s, y - 26*s, 4*s, 26*s); g.fillRect(x + 11*s, y - 26*s, 4*s, 26*s);   // 솟을대문: 행랑채 지붕보다 높이 솟음
 g.fillStyle = 'rgba(120,80,44,.9)'; g.fillRect(x - 11*s, y - 22*s, 22*s, 22*s);
      g.strokeStyle = 'rgba(40,24,12,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 22*s); g.lineTo(x, y); g.stroke(); hmHouse(g, x, y - 26*s + 2.5*s + 0.1, s, 34, { low: true, roofOnly: true }); continue; }
    if (I.kind === 'teaf'){ g.fillStyle = 'rgba(70,112,66,.75)'; for (let row = 0; row < 4; row++) for (let k = 0; k < 7; k++){ g.beginPath(); g.ellipse(x - 48*s + k * 16*s + row * 4*s, y - row * 6*s, 7*s, 3.4*s, 0, 0, Math.PI*2); g.fill(); } continue; }
    if (I.kind === 'shrine' || I.kind === 'yeon'){ hmHouse(g, x, y, s, I.kind === 'shrine' ? 40 : 62, { red: I.kind === 'shrine', lit: I.lit }); continue; }
    if (I.kind === 'mill'){ hmHouse(g, x - 10*s, y, s, 52, {}); g.fillStyle = 'rgba(100,66,40,.9)'; for (let k = 0; k < 3; k++){ g.beginPath(); g.ellipse(x + 34*s + k * 9*s, y - 4*s, 4*s, 5.5*s, 0, 0, Math.PI*2); g.fill(); } continue; }
    if (I.kind === 'kitchen'){ hmSide(g, x - 26 * s, y, s, 70, { smoke: !night }); continue; }   // 부엌: 서고 옆에 ㄱ자로 꺾여 붙은 날개채
    const W = { seogo: 84, sarang: 66, lab: 56, haeng: 92, museum: 58 }[I.kind] || 60;
    hmHouse(g, x, y, s, W, { lit: I.lit, low: I.kind === 'haeng', numaru: I.kind === 'sarang' });
  }
  if (night){ g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(18,22,40,.42)'; g.fillRect(0, 0, HM_W, HM_H); g.restore();   // 밤: 어둡게, 불 켠 방만 남음
    for (const { I, at: [x, y, s] } of plots) if (I.lit) inkBlot(g, x, y - 12 * s, 30 * s, 'rgba(240,180,90,A)', 0.45); }
  tornEdge(g, HM_W, HM_H, r, 10, [[0, 420, 40, 12], [2, 140, 40, 14]], [[HM_W, HM_H, 26]]);
  return c.toDataURL();
}
function showHouse(){
  S.houseSeen = true; save();
  const night = isNight();
  openOv(`<h3>가옥도(家屋圖)</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">한지에 먹으로 그린 집 그림. 누가 그렸는지 모른다. 눌러서 간다.</div>`
    + `<div class="hmap hmPic${night ? ' night' : ''}" style="background-image:url(${hmDraw()})">${PLOTS.filter(p => !p[4] || p[4]()).map(hmCell).join('')}</div>`
    + `<div style="font-size:12px;opacity:.6;margin-top:6px">궤짝의 엽전: ${fmtM(S.money)}${S.tea ? ` · 정직한 차 ${S.tea}근` : ''}</div>`);
  ovBody.querySelectorAll('[data-hm]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); hmClick(el.dataset.hm); }));
}
const hb = (id, label) => `<button class="btn rec" id="${id}" style="color:var(--ink);border-color:#00000066;margin:4px">${label}</button>`;
function hmBack(html){ return html + '<div class="rec" id="bHmBack" style="margin-top:12px;text-align:center;font-size:13px;opacity:.7">← 가옥도로</div>'; }
function hmBind(map){ for (const [id, fn] of Object.entries(map)){ const el = document.getElementById(id); if (el) el.addEventListener('click', ev => { ev.stopPropagation(); fn(); }); }
  const bk = document.getElementById('bHmBack'); if (bk) bk.addEventListener('click', ev => { ev.stopPropagation(); showHouse(); }); }
const madRoom = () => typeof myMad === 'function' && myMad() >= 9;   // 집이 스스로 자람(기획서 17절 공포 장치 · 광기 9 '집이 보임' · 12 '문이 보임') — 10/31부터 사지 않은 사당 터에(빈 터가 사랑채·연구소가 됨)
function hmClick(id, force){   // force: 이름 없는 방을 지나 땅 사기로(점검 11/4 — 광기 9단계부터 사당 터를 못 사 연구소를 영영 못 짓던 것)
  const P = PLOTS.find(p => p[0] === id), ps = plotState(id), b = P[3];
  if (!force && (!b || id === 'shrine') && !ps.own && madRoom()) return openOv(hmBack('<h3>이름 없는 방</h3>먹선으로 그린 방. 지은 적이 없다.<br>' + (myMad() >= 12 ? '문 윤곽이 그려져 있다. 그 안쪽만 먹으로 칠해져 있다.' : '문이 없다.') + `<div style="text-align:center;margin-top:12px">${hb('bGhostLand', '그래도 터를 산다')}</div>`)), hmBind({ bGhostLand: () => hmClick(id, true) });
  if (b === 'have'){
    if (id === 'lab' && !S.bangAt) return openOv(hmBack('<h3>별채</h3>먹선만 그어져 있다. 아직 드나드는 사람이 없다.')), hmBind({});
    if (id === 'sarang' && !sarangOn()) return openOv(hmBack('<h3>사랑채</h3>먹선만 그어져 있다. 손님 맞을 일이 없어 닫아 두었다.')), hmBind({});
    ov.classList.add('hidden'); if (S.scene !== id) goScene(id); return;
  }
  if (!ps.own){
    const c = landCost(), ok = (S.money || 0) >= c;
    openOv(hmBack(`<h3>${P[1]}</h3>먹 경계만 그어진 빈 필지.<br>값: ${fmtM(c)}<br>궤짝의 엽전: ${fmtM(S.money)}` + (ok ? `<div style="text-align:center;margin-top:12px">${hb('bLand', '땅을 산다')}</div>` : `<div style="margin-top:10px;opacity:.75">${fmtM(c - (S.money || 0))} 모자란다.</div>`)));
    return hmBind({ bLand: () => { S.money -= c; S.land = S.land || {}; S.land[id] = { at: Date.now() }; ledger(`${P[1]} 땅을 삼 - ${fmtM(c)}`); sCoin(); save(); if (typeof tlog === 'function') tlog('땅 삼: ' + id); hmClick(id); } });
  }
  if (ps.building) return openOv(hmBack(`<h3>${BUILD[ps.b].name}</h3>기둥이 반쯤 섰다. 일꾼들이 서까래를 올리고 있다.<br>${Math.max(1, Math.ceil(ps.left / 60e3))}분쯤 더 걸리겠다.`)), hmBind({});
  if (ps.done){
    ov.classList.add('hidden'); if (S.scene !== ps.b) goScene(ps.b); return;   // 지은 것은 모두 들어가는 방(연구소 19_yeon · 부엌·행랑채·차밭·제다소 19_kitchen)
  }
  // 우리 땅: 올리기 · 소작
  const B = b && BUILD[b], can = B && (!B.need || built(B.need)), enough = B && (S.money || 0) >= B.cost;
  openOv(hmBack(`<h3>${P[1]}</h3>우리 땅이다.${ps.rent ? ' 지금은 소작을 주었다(하루 ' + fmtM(K.rentDay) + ').' : ''}`
    + (B ? `<br><br>${B.name}을 올릴 수 있다 — ${fmtM(B.cost)}, ${B.h}시간쯤.` + (!can ? `<br><span style="opacity:.7">${BUILD[B.need].name}이 먼저 있어야 한다.</span>` : '') : '<br><br>아직 무엇을 올릴지 모르겠다.')
    + '<div style="text-align:center;margin-top:12px">' + (B && can && enough ? hb('bBuild', `${B.name}을 올린다`) : '') + hb('bRent', ps.rent ? '소작을 거둔다' : '소작을 준다') + '</div>'
    + (B && can && !enough ? `<div style="font-size:12px;opacity:.7">${fmtM(B.cost - (S.money || 0))} 모자란다.</div>` : '')));
  hmBind({
    bBuild: () => { S.money -= B.cost; Object.assign(S.land[id], { b, end: Date.now() + B.h * hourMs(), rent:false }); ledger(`${B.name} 공사 - ${fmtM(B.cost)}`); sCoin(); save(); if (typeof tlog === 'function') tlog('공사 시작: ' + B.name); hmClick(id); },
    bRent: () => { S.land[id].rent = !ps.rent; save(); hmClick(id); },
  });
}
// 찻주전자 창: 정직한 차가 있으면 그것으로 끓임
HOOK.ov.push(() => { const h3 = (ovBody.querySelector('h3') || {}).textContent; if (h3 !== '찻주전자' || !(S.tea > 0)) return;
  const d = document.createElement('div'); d.style.cssText = 'font-size:13px;margin-top:8px'; d.textContent = `정직한 차가 ${Math.ceil(S.tea * 4) / 4}근 남았다. 끓이면 그것부터 쓴다.`; ovBody.querySelector('h3').after(d); });

HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; houseTick(); });
