'use strict';
// ───────── 지도 ─────────
const MAPW = 1600, MAPH = 1000, MAP_NEED = 60, MAP_PEEK = 5;   // MAP_PEEK: 펼쳐 볼 때마다 조금씩 풀림   // MAP_NEED: 연구원이 바다에 생긴 글을 푸는 데 드는 양
function mapLabel(text, seed, start, span){
  const pr = Math.max(0, Math.min(1, ((S.mapStudy||0) - start)/span)), gl = [...glyphs(text, seed)];
  return [...text].map((ch, k) => hash(seed, k) < pr ? ch : gl[k]).join('');
}
const mapMarks = () => Math.max(0, Math.min(6, (S.mapViews || 0) - 1));
function vtext(g, str, x, y, size, col, alpha = 1){ g.save(); g.globalAlpha = alpha; g.fillStyle = col; g.font = `${size}px 'Nanum Myeongjo', serif`; g.textAlign = 'center';
  [...str].forEach((ch, k) => g.fillText(ch, x, y + k*size*1.05)); g.restore(); }
// ── 옛 한지(11/7 선생님 "옛날 지도 느낌, 네모로 자르지 말고 수묵화처럼") — 지도·가옥도가 같이 씀 ──
function inkBlot(g, x, y, rr, col, a){ const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, Math.PI*2); g.fill(); }
function oldPaper(g, W, H, r, base){
  g.fillStyle = base || '#e8dcbc'; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 14; k++) inkBlot(g, r()*W, r()*H, (80 + r()*220) * W / 1600, 'rgba(150,115,60,A)', 0.05 + r()*0.08);   // 오래 묵은 얼룩
  for (let k = 0; k < 900 * W / 1600; k++){ g.strokeStyle = `rgba(110,90,60,${0.04 + r()*0.05})`; g.lineWidth = 1; const x = r()*W, y = r()*H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + r()*20, y + (r()-0.5)*4); g.stroke(); }   // 한지 결
  for (let k = 0; k < 70 * W / 1600; k++) inkBlot(g, r()*W, r()*H, 2 + r()*6, 'rgba(120,80,40,A)', 0.15 + r()*0.2);   // 검버섯 같은 점
  const gr = g.createRadialGradient(W/2, H/2, Math.min(W, H)*0.35, W/2, H/2, Math.max(W, H)*0.62); gr.addColorStop(0, 'rgba(120,85,40,0)'); gr.addColorStop(1, 'rgba(110,70,30,.38)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);   // 가장자리가 누렇게
}
// 해지고 찢긴 가장자리로 잘라 냄(투명) + 그을린 테두리. tears: [[변(0위 1오른 2아래 3왼), 자리, 폭, 깊이]] · corners: [[x, y, 반지름]]
function tornEdge(g, W, H, r, M, tears, corners){
  const edge = [], jag = t => Math.sin(t * 61) * 5 + Math.sin(t * 173) * 3 + (r() - 0.5) * 5;
  const tear = (side, v) => tears.reduce((a, [sd, c0, w, d]) => a + (sd === side ? Math.max(0, 1 - Math.abs(v - c0) / w) * d : 0), 0);
  const st = 8;
  for (let x = M; x <= W - M; x += st) edge.push([x, M + jag(x / W) + tear(0, x)]);   // 변마다 귀퉁이에서 멈춤(넘치면 귀퉁이에 실 같은 자국이 남음)
  for (let y = M; y <= H - M; y += st) edge.push([W - M - jag(y / H + 3) - tear(1, y), y]);
  for (let x = W - M; x >= M; x -= st) edge.push([x, H - M - jag(x / W + 7) - tear(2, x)]);
  for (let y = H - M; y >= M; y -= st) edge.push([M + jag(y / H + 11) + tear(3, y), y]);
  for (const [cx, cy, rr] of corners || []) edge.forEach(p => { const d = Math.hypot(p[0] - cx, p[1] - cy); if (d < rr){ const k = rr / Math.max(d, 1); p[0] = cx + (p[0] - cx) * k; p[1] = cy + (p[1] - cy) * k; } });   // 귀퉁이가 떨어져 나감
  const path = () => { g.beginPath(); edge.forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, x, y)); g.closePath(); };
  g.save(); path(); g.strokeStyle = 'rgba(90,55,25,.55)'; g.lineWidth = 16; g.filter = 'blur(6px)'; g.stroke(); g.restore();   // 그을린 테두리
  g.save(); path(); g.strokeStyle = 'rgba(70,45,20,.6)'; g.lineWidth = 2; g.stroke(); g.restore();
  g.save(); g.globalCompositeOperation = 'destination-in'; path(); g.fillStyle = '#000'; g.fill(); g.restore();
}
// 수묵 산: 봉우리는 진하고 밑으로 옅게 번짐, 능선에 마른 붓 결과 점(미점)
function inkMount(g, r, x, y, w, h, lay){
  for (let layer = (lay == null ? 2 : lay); layer >= 0; layer--){                 // 뒤 산일수록 옅고 큼
    const lw = w * (1 + layer * 0.35), lh = h * (1 - layer * 0.18), ox = (layer - 1) * w * 0.35, oy = -layer * 10, a = 0.75 - layer * 0.22;
    const pk = [], n = 7; for (let i = 0; i <= n; i++){ const t = i / n, bump = Math.sin(t * Math.PI) * (0.75 + 0.25 * Math.sin(i * 2.7 + x)); pk.push([x + ox - lw + t * lw * 2, y + oy - lh * bump * (0.85 + r() * 0.3)]); }
    const gr = g.createLinearGradient(0, y + oy - lh, 0, y + oy + 6); gr.addColorStop(0, `rgba(28,24,20,${a})`); gr.addColorStop(0.55, `rgba(40,38,32,${a * 0.35})`); gr.addColorStop(1, 'rgba(40,38,32,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(pk[0][0], y + oy + 6); pk.forEach(([px, py]) => g.lineTo(px, py)); g.lineTo(pk[n][0], y + oy + 6); g.fill();
    g.strokeStyle = `rgba(20,16,12,${a})`; g.lineCap = 'round';
    for (let b = 0; b < 3; b++){ g.lineWidth = b ? 0.8 : Math.max(0.8, (2.2 - layer * 0.5) * Math.min(1, w / 60)); g.beginPath(); pk.forEach(([px, py], i) => (i ? g.lineTo : g.moveTo).call(g, px + (b ? (r() - 0.5) * 3 : 0), py + b * 2)); g.stroke(); }
    if (layer === 0){ g.fillStyle = 'rgba(20,16,12,.7)'; const ds = Math.min(1, w / 60); for (let i = 1; i < n; i++) for (let d = 0; d < 3; d++){ const [px, py] = pk[i]; g.beginPath(); g.ellipse(px + (r() - 0.5) * 14 * ds, py + (4 + r() * 8) * ds, 2.2 * ds, 1.2 * ds, -0.3, 0, Math.PI*2); g.fill(); } }   // 미점
  }
  g.lineCap = 'butt';
}
function drawMap(){
  const c = document.createElement('canvas'); c.width = MAPW; c.height = MAPH; const g = c.getContext('2d'), r = rng(77);
  oldPaper(g, MAPW, MAPH, r);
  const INK = '#2a2118', m = mapMarks();
  // 해안선: 왼쪽은 육지, 오른쪽은 바다
  const coast = y => 790 + Math.sin(y/70)*38 + Math.sin(y/23)*12;
  { const gr = g.createLinearGradient(760, 0, 1500, 0); gr.addColorStop(0, 'rgba(60,72,78,.30)'); gr.addColorStop(0.25, 'rgba(60,72,78,.12)'); gr.addColorStop(1, 'rgba(60,72,78,0)');   // 바다: 해안에서 멀어질수록 옅어지는 먹물 번짐
    g.fillStyle = gr; g.beginPath(); g.moveTo(coast(0), 0); for (let y = 0; y <= MAPH; y += 6) g.lineTo(coast(y), y); g.lineTo(MAPW, MAPH); g.lineTo(MAPW, 0); g.fill(); }
  g.strokeStyle = 'rgba(42,33,24,.35)'; g.lineWidth = 1.1;                         // 옛 지도의 물결 무늬(비늘처럼 겹친 반달)
  for (let row = 0, y = 30; y < MAPH; row++, y += 26) for (let x = 0; x < MAPW; x += 34){ const xx = x + (row % 2) * 17 + (r() - 0.5) * 4; if (xx < coast(y) + 40 || r() < 0.18) continue;
    g.globalAlpha = Math.max(0.15, 1 - (xx - coast(y)) / 700); g.beginPath(); g.arc(xx, y, 13, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  g.globalAlpha = 1;
  { const gr = g.createLinearGradient(560, 0, 820, 0); gr.addColorStop(0, 'rgba(150,120,60,0)'); gr.addColorStop(1, 'rgba(150,120,60,.14)'); g.fillStyle = gr; g.beginPath(); g.moveTo(560, 0); for (let y = 0; y <= MAPH; y += 6) g.lineTo(coast(y), y); g.lineTo(560, MAPH); g.fill(); }   // 바닷가 모래 빛
  g.fillStyle = 'rgba(30,22,16,.92)'; g.beginPath();                                // 해안선: 굵기가 들쭉날쭉한 붓 자국
  for (let y = 0; y <= MAPH; y += 5) (y ? g.lineTo : g.moveTo).call(g, coast(y) - 1.2 - 2.4 * (0.5 + 0.5 * Math.sin(y / 41)), y);
  for (let y = MAPH; y >= 0; y -= 5) g.lineTo(coast(y) + 1.2 + 2.4 * (0.5 + 0.5 * Math.sin(y / 53 + 1)), y); g.fill();
  g.strokeStyle = 'rgba(30,22,16,.28)'; g.lineWidth = 1.2;                          // 마른 붓 결
  for (let p = 1; p < 4; p++){ g.beginPath(); for (let y = 0; y <= MAPH; y += 6) (y ? g.lineTo : g.moveTo).call(g, coast(y) + (p - 2) * 4 + (r() - 0.5) * 2, y); g.stroke(); }
  // 산(겹친 산줄기)
  const mount = (x, y, w, h) => inkMount(g, r, x, y, w, h);
  [[160,220,70,90],[260,190,60,70],[120,520,80,110],[330,640,70,80],[560,300,65,85],[610,820,80,95],[450,880,60,70]].forEach(a => mount(...a));
  // 길(10리마다 눈금)
  g.strokeStyle = '#5a3a24'; g.lineWidth = 2; const road = [[200,340],[360,420],[520,470],[700,520]];
  g.beginPath(); road.forEach(([x,y],i) => i ? g.lineTo(x,y) : g.moveTo(x,y)); g.stroke();
  for (let i = 0; i < road.length - 1; i++){ const [x1,y1] = road[i], [x2,y2] = road[i+1]; for (let t = 0.2; t < 1; t += 0.3){ const x = x1 + (x2-x1)*t, y = y1 + (y2-y1)*t; g.beginPath(); g.moveTo(x, y-7); g.lineTo(x, y+7); g.stroke(); } }
  // 마을
  [[520,470,'葛頭浦',611,14],[360,420,'鹽峴',612,22],[700,520,'巖項',613,30]].forEach(([x,y,n,sd,st]) => { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 10, 0, Math.PI*2); g.stroke(); vtext(g, mapLabel(n, sd, st, 14), x + 28, y - 10, 26, INK); });
  // 우리 서고
  g.fillStyle = '#7a2a1a'; g.fillRect(186, 324, 28, 22); g.beginPath(); g.moveTo(180, 326); g.lineTo(200, 308); g.lineTo(220, 326); g.fill();
  vtext(g, mapLabel(hanjaOf(S.sur || '윤') + '氏書庫', 610, 0, 12), 236, 300, 26, '#7a2a1a');
  // ── 바다: 볼 때마다 하나씩 늘어 있음 ──
  if (m >= 1){ g.fillStyle = INK; for (let k = 0; k < 40; k++){ const y = 80 + k*22, x = coast(y) + 20 + r()*30; g.fillRect(x, y, 2, 2); }   // 여울
    [[880,180,14],[905,760,10],[860,420,8]].forEach(([x,y,rr]) => { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, y, rr, 0, Math.PI*2); g.stroke(); }); }   // 작은 섬
  if (m >= 2){                                                                     // 바위(암초): 옛 지도처럼 뾰족한 봉우리 윤곽에 먹선 몇 줄, 둘레에 물결
    g.strokeStyle = INK; g.lineCap = 'round';
    [[930,522,1.1],[962,548,0.8],[918,566,0.7],[985,505,0.9],[1004,596,0.75]].forEach(([x,y,k]) => {
      const w = 22*k, h = 20*k; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w*0.45, y - h*0.7); g.lineTo(x - w*0.1, y - h*0.35); g.lineTo(x + w*0.2, y - h); g.lineTo(x + w*0.6, y - h*0.4); g.lineTo(x + w, y); g.stroke();
      g.lineWidth = 1.1; for (let j = 0; j < 3; j++){ const hx = x - w*0.3 + j*w*0.3; g.beginPath(); g.moveTo(hx, y - h*0.15); g.lineTo(hx + w*0.12, y - h*0.55 + j*h*0.1); g.stroke(); }   // 바위 결
      g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - w*1.3, y + 5); g.quadraticCurveTo(x - w*0.65, y + 1, x, y + 5); g.quadraticCurveTo(x + w*0.65, y + 9, x + w*1.3, y + 5); g.stroke();   // 물결
    });
    g.lineCap = 'butt';
  }
  if (m >= 3){ g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(965, 590, 26, Math.PI, 0); g.stroke(); g.fillStyle = '#1a140f'; g.beginPath(); g.arc(965, 590, 18, Math.PI, 0); g.fill(); vtext(g, mapLabel('窟', 614, 40, 8), 965, 640, 30, INK); }   // 해안 동굴
  if (m >= 4) vtext(g, mapLabel('물이빠지면열린다', 501, 50, MAP_NEED - 50 + 40), 1030, 470, 24, INK, 0.85);   // 생긴 글: 풀어야 읽힘
  if (m >= 5){ g.strokeStyle = '#3a2e22'; g.lineWidth = 1.6; const hx = (cx, cy, rr) => { g.beginPath(); for (let k = 0; k < 6; k++){ const a = Math.PI/3*k + Math.PI/6; (k ? g.lineTo : g.moveTo).call(g, cx + Math.cos(a)*rr, cy + Math.sin(a)*rr); } g.closePath(); g.stroke(); };
    [[905,650],[925,650],[915,667],[895,667],[935,667],[915,633]].forEach(([x,y]) => hx(x, y, 10)); }   // 자라 등딱지 무늬
  if (m >= 6){ g.save(); g.globalAlpha = 0.2; g.fillStyle = INK; g.font = "280px 'Nanum Myeongjo', serif"; g.textAlign = 'center'; g.fillText(hanjaOf(S.sur || '윤').slice(0,1), 1240, 620); g.restore(); }   // 바다 한가운데 우리 성씨
  g.save(); g.fillStyle = INK; g.globalAlpha = 0.85; g.font = "10px 'Nanum Myeongjo', serif"; g.fillText('토끼', 1180, 800); g.restore();   // 수정 문진으로만 보이는 아주 작은 글씨
  { const sx = 70, sy = 905, sz = 58, nm = hanjaOf(S.sur || '윤').slice(0, 1);   // 소장인(붉은 도장) 「○氏藏書」
    g.save(); g.globalAlpha = 0.78; g.fillStyle = '#9a2a1c'; g.fillRect(sx, sy - sz, sz, sz); g.globalCompositeOperation = 'destination-out'; g.font = "bold 24px 'Nanum Myeongjo', serif"; g.textAlign = 'center';
    [[nm, 1, 0], ['氏', 1, 1], ['藏', 0, 0], ['書', 0, 1]].forEach(([ch, cx2, cy2]) => g.fillText(ch, sx + 15 + cx2 * 28, sy - sz + 25 + cy2 * 27));
    for (let k = 0; k < 40; k++) g.fillRect(sx + r() * sz, sy - sz + r() * sz, 1 + r() * 3, 1 + r() * 2);   // 인주가 덜 묻은 자리
    g.restore(); }
  tornEdge(g, MAPW, MAPH, r, 22, [[0, 520, 60, 26], [1, 300, 50, 22], [2, 1180, 70, 30], [3, 700, 55, 20]], [[MAPW, 0, 70], [0, MAPH, 46]]);
  return c;
}
const mapView = document.getElementById('mapView'), mapStage = document.getElementById('mapStage'), mapLoupe = document.getElementById('mapLoupe');
let mapURL = '', mapW = 0, mapH = 0, mapLoupeOn = false, mapSrc = null, foldAnim = 0;
function openMap(){
  const now = Date.now();
  if (now - (S.mapLastMark || 0) > 20000){ S.mapViews = (S.mapViews || 0) + 1; S.mapLastMark = now; S.mapStudy = (S.mapStudy||0) + MAP_PEEK; }   // 다시 펼 때마다 바다에 하나씩, 글자도 조금씩
  if (mapMarks() >= 3 && !S.caveAt){ S.caveAt = now; S.caveWork = S.rWork || 0; }
  save();
  mapSrc = drawMap(); mapURL = mapSrc.toDataURL();
  mapW = Math.floor(Math.min(innerWidth*0.94, innerHeight*0.7*1.6)); mapH = Math.floor(mapW/1.6);
  mapStage.style.width = mapW + 'px'; mapStage.style.height = mapH + 'px';
  mapStage.querySelectorAll('.mtile').forEach(t => t.remove());
  const NCOL = 6, tw = mapW/NCOL, tiles = [];
  for (let c = 0; c < NCOL; c++){
    const t = document.createElement('div'); t.className = 'mtile mcol' + (c % 2 ? ' valley' : '');
    Object.assign(t.style, { left: (c*tw - (c ? 0.5 : 0)) + 'px', top: '0px', width: (tw + 1) + 'px', height: mapH + 'px', backgroundImage: `url(${mapURL})`, backgroundSize: `${mapW}px ${mapH}px`, backgroundPosition: `${-c*tw}px 0px`, webkitMaskImage: `url(${mapURL})`, maskImage: `url(${mapURL})`, webkitMaskSize: `${mapW}px ${mapH}px`, maskSize: `${mapW}px ${mapH}px`, webkitMaskPosition: `${-c*tw}px 0px`, maskPosition: `${-c*tw}px 0px`, webkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' });   // 해진 가장자리(11/7)
    mapStage.appendChild(t); tiles.push(t);
  }
  mapView.classList.remove('hidden');
  { const mg = document.getElementById('mapGlass');
  if (!mg.innerHTML.trim()) mg.innerHTML = document.getElementById('deskGlass').innerHTML;   // 책 화면의 문진과 같은 모양
  mg.classList.toggle('hidden', !S.owned.glass);
  const sr = mapStage.getBoundingClientRect();
  mg.style.left = Math.max(4, sr.left - 120) + 'px'; mg.style.top = (sr.top + mapH*0.55) + 'px';
  if (sr.left < 140){ mg.style.left = (sr.left + 10) + 'px'; mg.style.top = (sr.bottom + 30) + 'px'; } }
  setFold(tiles, tw, 1);                                   // 병풍처럼 접힌 채로 시작
  rustle(0.5, 0.15); setTimeout(() => rustle(0.3, 0.12), 650);
  animFold(tiles, tw, 1, 0, 1000);                         // 한 번에 쭉 펼쳐짐
}
// 병풍 접기: 칸마다 산접기·골접기로 번갈아 꺾이고, 접힌 만큼 폭이 줄어 가운데로 모임. f = 1(다 접힘) ~ 0(다 펼침)
function setFold(tiles, tw, f){
  const th = f * 86 * Math.PI/180, w = tw*Math.cos(th), dz = tw*Math.sin(th), total = w*tiles.length, x0 = (mapW - total)/2;
  tiles.forEach((t, c) => {
    const odd = c % 2 === 1;
    t.style.transition = 'none';
    t.style.transform = `translateX(${x0 + c*w - c*tw}px) translateZ(${odd ? -dz : 0}px) rotateY(${odd ? -th : th}rad)`;
    t.style.filter = `brightness(${(1 - (odd ? 0.32 : 0.12)*Math.sin(th)).toFixed(3)})`;   // 꺾인 면의 그늘
  });
}
function animFold(tiles, tw, a, b, ms, done){
  const id = ++foldAnim, t0 = performance.now(), ease = x => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2)/2;
  const step = now => { if (id !== foldAnim) return; const k = Math.min(1, (now - t0)/ms); setFold(tiles, tw, a + (b - a)*ease(k)); if (k < 1) requestAnimationFrame(step); else if (done) done(); };
  requestAnimationFrame(step);
}
function closeMap(){
  if (S.loc && S.loc.map !== 'desk' && S.loc.map !== 'rdesk') setTimeout(() => openOv('<h3>지도</h3>지도를 접어 책장 위에 올려 두었다.<br>다시 보려면 책장에서 가져다 서안에 펼친다.'), 1200);
  if (mapLoupeOn) toggleMapLoupe();
  const tiles = [...mapStage.querySelectorAll('.mtile')];
  rustle(0.5, 0.16);
  animFold(tiles, mapW/tiles.length, 0, 1, 800, () => setTimeout(() => mapView.classList.add('hidden'), 150));
}
function toggleMapLoupe(){
  mapLoupeOn = !mapLoupeOn; mapStage.classList.toggle('loupe', mapLoupeOn); mapLoupe.style.display = mapLoupeOn ? 'block' : 'none'; sPlace();
  document.getElementById('mapGlass').classList.toggle('held', mapLoupeOn);
  if (mapLoupeOn) placeMapLoupe(mapW*0.6, mapH*0.6);
}
// 수정 문진: 지도 원본에서 문진 밑 한 조각만 작은 그림에 4배로 옮겨 그림(움직일 때 가볍게)
const loupeCv = document.createElement('canvas'), loupeG = loupeCv.getContext('2d');
loupeCv.style.cssText = 'width:100%;height:100%;border-radius:50%;display:block';
mapLoupe.appendChild(loupeCv);
let loupeXY = null, loupeRaf = 0;
function placeMapLoupe(x, y){
  loupeXY = [x, y];
  if (loupeRaf) return;
  loupeRaf = requestAnimationFrame(() => {
    loupeRaf = 0; const [px, py] = loupeXY, d = Math.min(2, devicePixelRatio || 1), S0 = 150*d;
    if (loupeCv.width !== S0){ loupeCv.width = S0; loupeCv.height = S0; }
    mapLoupe.style.transform = `translate(${px - 75}px, ${py - 75}px)`;
    const k = MAPW / mapW, sw = 150/4*k;                       // 화면 150px = 지도 원본의 37.5px어치 ×4
    loupeG.fillStyle = '#e6dabd'; loupeG.fillRect(0, 0, S0, S0);
    if (mapSrc) loupeG.drawImage(mapSrc, px*k - sw/2, py*(MAPH/mapH) - sw/2, sw, sw, 0, 0, S0, S0);
  });
}
const mvL = e => { if (!mapLoupeOn) return; const r = mapStage.getBoundingClientRect(); placeMapLoupe(e.clientX - r.left, e.clientY - r.top); };
mapStage.addEventListener('pointermove', mvL); mapStage.addEventListener('pointerdown', mvL);
document.getElementById('bMapGlass').addEventListener('click', e => { e.stopPropagation(); toggleMapLoupe(); });
document.getElementById('mapGlass').addEventListener('click', e => { e.stopPropagation(); toggleMapLoupe(); });
document.getElementById('bMapClose').addEventListener('click', e => { e.stopPropagation(); closeMap(); });

// 접힌 지도의 바깥면(기획서 19절 추천 7개 중 3번, ✳ 11/3): 지도 창에 겉면의 낯선 넉 자 — 바다의 글을 다 풀 무렵 「펴지 마라」로 풀림
HOOK.ov.push(() => { const h = ovBody.querySelector('h3'); if (!h || h.textContent !== '지도' || !S.mapFound) return;
  const t = mapLabel('펴지마라', 903, MAP_NEED, 60), done = t === '펴지마라', d = document.createElement('div'); d.style.cssText = 'font-size:13px;margin-top:6px';
  d.innerHTML = '접으면 겉면에 넉 자가 보인다. ' + (done ? '「펴지 마라」.' : alienHtml(t)); h.after(d); if (done) notice('mapback'); });
