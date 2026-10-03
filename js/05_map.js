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
function drawMap(){
  const c = document.createElement('canvas'); c.width = MAPW; c.height = MAPH; const g = c.getContext('2d'), r = rng(77);
  g.fillStyle = '#e6dabd'; g.fillRect(0, 0, MAPW, MAPH);
  for (let k = 0; k < 900; k++){ g.strokeStyle = `rgba(110,90,60,${0.04 + r()*0.05})`; g.lineWidth = 1; const x = r()*MAPW, y = r()*MAPH; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + r()*20, y + (r()-0.5)*4); g.stroke(); }   // 한지 결
  const INK = '#2a2118', m = mapMarks();
  // 해안선: 왼쪽은 육지, 오른쪽은 바다
  const coast = y => 790 + Math.sin(y/70)*38 + Math.sin(y/23)*12;
  g.strokeStyle = INK; g.lineWidth = 3.2; g.beginPath(); for (let y = 0; y <= MAPH; y += 6) (y ? g.lineTo : g.moveTo).call(g, coast(y), y); g.stroke();
  // 산(겹친 산줄기)
  const mount = (x, y, w, h) => { for (let k = 0; k < 3; k++){ g.strokeStyle = INK; g.lineWidth = 2.2 - k*0.5; g.beginPath(); g.moveTo(x - w + k*12, y + k*6); g.quadraticCurveTo(x, y - h + k*18, x + w - k*12, y + k*6); g.stroke(); }
    g.fillStyle = 'rgba(60,80,50,.12)'; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x, y - h, x + w, y); g.fill(); };
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
  return c;
}
const mapView = document.getElementById('mapView'), mapStage = document.getElementById('mapStage'), mapLoupe = document.getElementById('mapLoupe');
let mapURL = '', mapW = 0, mapH = 0, mapLoupeOn = false;
function openMap(){
  const now = Date.now();
  if (now - (S.mapLastMark || 0) > 20000){ S.mapViews = (S.mapViews || 0) + 1; S.mapLastMark = now; S.mapStudy = (S.mapStudy||0) + MAP_PEEK; }   // 다시 펼 때마다 바다에 하나씩, 글자도 조금씩
  if (mapMarks() >= 3 && !S.caveAt){ S.caveAt = now; S.caveWork = S.rWork || 0; }
  save();
  mapURL = drawMap().toDataURL();
  mapW = Math.floor(Math.min(innerWidth*0.94, innerHeight*0.7*1.6)); mapH = Math.floor(mapW/1.6);
  mapStage.style.width = mapW + 'px'; mapStage.style.height = mapH + 'px';
  mapStage.querySelectorAll('.mtile').forEach(t => t.remove());
  const NCOL = 6, tw = mapW/NCOL, tiles = [];
  for (let c = 0; c < NCOL; c++){
    const t = document.createElement('div'); t.className = 'mtile mcol' + (c % 2 ? ' valley' : '');
    Object.assign(t.style, { left: (c*tw - (c ? 0.5 : 0)) + 'px', top: '0px', width: (tw + 1) + 'px', height: mapH + 'px', backgroundImage: `url(${mapURL})`, backgroundSize: `${mapW}px ${mapH}px`, backgroundPosition: `${-c*tw}px 0px` });
    t.style.transition = 'none'; t.style.transform = c ? 'rotateY(179deg)' : 'none';   // 세로로 접힌 채로
    mapStage.appendChild(t); tiles.push(t);
  }
  mapView.classList.remove('hidden');
  { const mg = document.getElementById('mapGlass');
  if (!mg.innerHTML.trim()) mg.innerHTML = document.getElementById('deskGlass').innerHTML;   // 책 화면의 문진과 같은 모양
  mg.classList.toggle('hidden', !S.owned.glass);
  const sr = mapStage.getBoundingClientRect();
  mg.style.left = Math.max(4, sr.left - 120) + 'px'; mg.style.top = (sr.top + mapH*0.55) + 'px';
  if (sr.left < 140){ mg.style.left = (sr.left + 10) + 'px'; mg.style.top = (sr.bottom + 30) + 'px'; } }
  void mapStage.offsetWidth;
  tiles.forEach(t => t.style.transition = '');
  for (let c = 1; c < NCOL; c++) setTimeout(() => { tiles[c].style.transform = 'none'; rustle(0.32, 0.15); }, 300 + (c-1)*380);
}
function closeMap(){
  if (S.loc && S.loc.map !== 'desk' && S.loc.map !== 'rdesk') setTimeout(() => openOv('<h3>지도</h3>지도를 접어 책장 위에 올려 두었다.<br>다시 보려면 책장에서 가져다 서안에 펼친다.'), 1200);
  if (mapLoupeOn) toggleMapLoupe();
  const tiles = [...mapStage.querySelectorAll('.mtile')];
  for (let c = tiles.length - 1, k = 0; c >= 1; c--, k++) setTimeout(() => tiles[c].style.transform = 'rotateY(179deg)', k*160);
  rustle(0.5, 0.16);
  setTimeout(() => mapView.classList.add('hidden'), 1100);
}
function toggleMapLoupe(){
  mapLoupeOn = !mapLoupeOn; mapStage.classList.toggle('loupe', mapLoupeOn); mapLoupe.style.display = mapLoupeOn ? 'block' : 'none'; sPlace();
  document.getElementById('mapGlass').classList.toggle('held', mapLoupeOn);
  if (mapLoupeOn){ mapLoupe.style.backgroundImage = `url(${mapURL})`; mapLoupe.style.backgroundSize = `${mapW*4}px ${mapH*4}px`; placeMapLoupe(mapW*0.6, mapH*0.6); }
}
function placeMapLoupe(x, y){ mapLoupe.style.left = (x - 75) + 'px'; mapLoupe.style.top = (y - 75) + 'px'; mapLoupe.style.backgroundPosition = `${75 - x*4}px ${75 - y*4}px`; }
const mvL = e => { if (!mapLoupeOn) return; const r = mapStage.getBoundingClientRect(); placeMapLoupe(e.clientX - r.left, e.clientY - r.top); };
mapStage.addEventListener('pointermove', mvL); mapStage.addEventListener('pointerdown', mvL);
document.getElementById('bMapGlass').addEventListener('click', e => { e.stopPropagation(); toggleMapLoupe(); });
document.getElementById('mapGlass').addEventListener('click', e => { e.stopPropagation(); toggleMapLoupe(); });
document.getElementById('bMapClose').addEventListener('click', e => { e.stopPropagation(); closeMap(); });

