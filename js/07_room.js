'use strict';
// ───────── 서고(스프라이트 스태킹) ─────────
const cv = document.getElementById('cv'), cxMain = cv.getContext('2d');
let cx = cxMain;
// 방을 돌리는 동안에는 절반 해상도로 그려 크게 늘려 붙임(손을 떼면 바로 원래 선명도)
const loCv = document.createElement('canvas'), loCx = loCv.getContext('2d');
let loSaved = null;
function beginLow(){
  loSaved = { W, H, SC, DPR };
  const w = Math.ceil(W/2), h = Math.ceil(H/2);
  if (loCv.width !== w || loCv.height !== h){ loCv.width = w; loCv.height = h; }
  W = w; H = h; SC = loSaved.SC/2; DPR = loSaved.DPR/2; cx = loCx; cx.imageSmoothingEnabled = false;
}
function endLow(){
  ({ W, H, SC, DPR } = loSaved); loSaved = null; cx = cxMain;
  cx.imageSmoothingEnabled = false; cx.drawImage(loCv, 0, 0, loCv.width*2, loCv.height*2);
}
function hex(c){ return [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)]; }
function model(w,d,h,fn){
  const layers = [];
  for (let z=0; z<h; z++){
    const c = document.createElement('canvas'); c.width=w; c.height=d;
    const g = c.getContext('2d'), im = g.createImageData(w,d); let any = false;
    for (let y=0;y<d;y++) for (let x=0;x<w;x++){
      const col = fn(x,y,z); if (!col) continue; any = true;
      const [r,gg,b] = hex(col), sh = 0.72 + 0.28*(z/Math.max(1,h-1)), o=(y*w+x)*4;
      im.data[o]=r*sh; im.data[o+1]=gg*sh; im.data[o+2]=b*sh; im.data[o+3]=255;
    }
    g.putImageData(im,0,0); layers.push(any ? c : null);
  }
  return { w, d, h, layers };
}
const WOOD='#5b3c25', DARK='#2c1c11', PAPER='#cfc2a3', BOOKC=['#6b2d22','#2f4a3a','#5d4a1e','#3b3550','#7a5a2e','#40302a'];
// 덮인 옛 책: 누런 표지, 왼쪽 위 흰 제첨, 오른쪽 끝 실 매기
function closedBook(x, y, x0, y0, col = '#8a6a34', edge = '#6e5228'){
  const dx = x - x0, dy = y - y0;
  if (dx < 0 || dx > 6 || dy < 0 || dy > 8) return null;
  if (dx === 6) return dy % 2 === 0 ? '#e8e0cc' : edge;
  if (dx === 1 && dy >= 1 && dy <= 4) return '#e2d6b8';
  return (dx === 0 || dy === 0 || dy === 8) ? edge : col;
}
const BOOKCOL = { first:['#8a6a34', '#6e5228'], dongui:['#3e4a6e', '#2a3352'] };
// 서안(書案): 상판 양 끝이 두루마리처럼 말려 오름, 상판 아래 서랍 두 칸(놋쇠 고리), 다리 대신 옆판(판족)에 구름 모양 구멍(풍혈)
function seoanModel(withBook){
  const TOP = '#5e3a22', EDGE = '#3c2414', SIDE = '#43281a', BR = '#a8873e';
  return model(28,12,10,(x,y,z)=>{
    if (withBook === 'map' && z===8){ if (x>=10 && x<=17 && y>=3 && y<=8) return (x===13 || y===5) ? '#a89a78' : '#ddd1b4'; }
    else if (withBook && z===8){ const c = closedBook(x, y, 11, 2); if (c) return c; }
    if (z===7 && x>=1 && x<=26 && y>=2 && y<=9) return (y===2||y===9) ? EDGE : TOP;                       // 상판
    if ((x<=1 || x>=26) && y>=2 && y<=9 && (z===8 || (z===9 && (x===0 || x===27)))) return EDGE;            // 말려 오른 끝
    if ((x===0 || x===27) && y>=2 && y<=9 && z===8) return EDGE;
    if ((z===5 || z===6) && x>=4 && x<=23 && (y===9 || y===2)){                                              // 앞뒤 턱·서랍
      if (y===9 && (x===13 || x===14)) return EDGE;
      if (y===9 && z===5 && (x===8 || x===19)) return BR;
      return y===9 ? '#4a2d19' : EDGE;
    }
    if ((x===3 || x===24) && y>=2 && y<=9 && z<=6){                                                          // 옆판(판족)
      if (z>=1 && z<=4 && y>=4 && y<=7 && !(z===4 && (y===4 || y===7))) return null;                          // 풍혈
      return SIDE;
    }
    if (z===0 && (x===3 || x===24) && (y===1 || y===10)) return EDGE;                                        // 발
    return null;
  });
}
const M = {
  floor: model(76,54,1,(x,y)=> ((x+Math.floor(y/6)*7)%19===0 || y%6===0) ? '#2a1d13' : (y%12<6 ? '#3a281a' : '#36251a')),
  shelf: model(20,6,26,(x,y,z)=>{
    if (x===0||x===19||z===0||z===25||z===12) return WOOD;
    if (y===0) return DARK;
    const row = z<12 ? 0 : 1, zz = row ? z-13 : z-1, bi = Math.floor((x-1)/3);
    if (bi>5) return null;
    const hgt = 8 + ((bi*7+row*3)%4);
    if (y<=4 && zz < hgt && (x-1)%3 !== 2) return BOOKC[(bi+row*2)%6];
    return null;
  }),
  chest: model(16,11,15,(x,y,z)=>{
    const BR = '#9a7a3a';
    if (z < 7){
      const wall = x===0||x===15||y===1||y===10||z===0;
      if (wall){
        if ((x<=1||x>=14) && (y<=2||y>=9)) return BR;                         // 모서리 장식
        if (y===10 && x>=6 && x<=9 && z>=3 && z<=5) return z===4 && (x===7||x===8) ? '#3a2a10' : BR;   // 앞 자물쇠 판
        return z===6 ? DARK : WOOD;
      }
      if (z===5){ const c = closedBook(x, y, 4, 1); if (c) return c; }   // 안에 덮인 책
      return null;
    }
    if (y===0 && x>=0 && x<=15 && z<=14) return (x<=1||x>=14) && z>=12 ? BR : (z===14 || x===0 || x===15 ? DARK : WOOD);   // 뒤로 젖혀진 뚜껑
    return null;
  }),
  lamp: model(7,7,25,(x,y,z)=>{ const r=Math.hypot(x-3,y-3);          // 등잔대: 넓은 받침, 긴 대, 위에 기름 접시
    if (z<=1) return r<=3.2 ? (z===0 ? '#2e1d12' : '#4a3020') : null;
    if (z<=21) return r<0.8 ? (z%7===0 ? '#6a4a2a' : '#4a3020') : null;
    if (z===22) return r<=2.2 ? '#6a5236' : null;
    if (z===23) return r<=2.2 && r>1.3 ? '#7a6040' : null;
    return null; }),
  brush: model(9,3,7,(x,y,z)=>{ if (z===0||z===6) return y===1 ? WOOD : null; if ((x===0||x===8)&&y===1) return WOOD; if (x%2===0 && x>0 && x<8 && y===1 && z>1 && z<6) return z<3 ? '#111' : '#b8a27a'; return null; }),
  chestEmpty: model(16,11,15,(x,y,z)=>{
    const BR = '#9a7a3a';
    if (z < 7){
      const wall = x===0||x===15||y===1||y===10||z===0;
      if (wall){
        if ((x<=1||x>=14) && (y<=2||y>=9)) return BR;
        if (y===10 && x>=6 && x<=9 && z>=3 && z<=5) return z===4 && (x===7||x===8) ? '#3a2a10' : BR;
        return z===6 ? DARK : WOOD;
      }
      if (z===1 && x>=2 && x<=13 && y>=2 && y<=9) return (x+y)%5===0 ? '#1a0f08' : '#24170d';   // 비어 있는 바닥
      return null;
    }
    if (y===0 && x>=0 && x<=15 && z<=14) return (x<=1||x>=14) && z>=12 ? BR : (z===14 || x===0 || x===15 ? DARK : WOOD);
    return null;
  }),
  seoan: seoanModel(false),
  seoanBook: seoanModel(true),
  seoanMap: seoanModel('map'),
  bookFirst: model(7,9,2,(x,y,z)=>{ const c = closedBook(x, y, 0, 0, ...BOOKCOL.first); return z === 1 ? c : (c ? '#e2d6b8' : null); }),
  bookDongui: model(7,9,2,(x,y,z)=>{ const c = closedBook(x, y, 0, 0, ...BOOKCOL.dongui); return z === 1 ? c : (c ? '#e2d6b8' : null); }),
  chestClosed: model(16,11,9,(x,y,z)=>{
    const BR = '#9a7a3a';
    const edge = x===0||x===15||y===1||y===10;
    if (z===8) return (x<=1||x>=14) && (y<=2||y>=9) ? BR : (y===0 ? null : (x===0||x===15||y===1||y===10 ? DARK : '#563823'));   // 닫은 뚜껑
    if (y===0) return null;
    if (z<8 && (edge || z===0)){
      if ((x<=1||x>=14) && (y<=2||y>=9)) return BR;
      if (y===10 && x>=6 && x<=9 && z>=4 && z<=6) return z===5 && (x===7||x===8) ? '#3a2a10' : BR;
      return z===7 ? DARK : WOOD;
    }
    return null;
  }),
  deskBook: model(16,8,7,(x,y,z)=>{
    if (z===6) return (x>=3 && x<=12 && y>=2 && y<=5) ? (x===7||x===8 ? '#8a7d62' : (y===2||y===5 ? '#bfb393' : PAPER)) : null;   // 서안 위에 펼친 책
    if (z===5) return '#4e3220'; if ((x<2||x>13)&&(y<2||y>5)) return DARK; if (z===4 && (x<2||x>13)) return DARK; return null; }),
  desk: model(16,8,6,(x,y,z)=>{ if (z===5) return '#4e3220'; if ((x<2||x>13)&&(y<2||y>5)) return DARK; if (z===4 && (x<2||x>13)) return DARK; return null; }),
  glass: model(2,8,3,(x,y,z)=>{ const c = Math.hypot(x-0.5, y-3.5); if (z===0) return y===0||y===7 ? '#a8873e' : '#2e1b10'; if (z===1) return c<=1.2 ? '#a8873e' : (y===0||y===7 ? '#a8873e' : null); if (z===2) return c<=0.8 ? '#bcd0d2' : null; return null; }),
  teapot: model(7,6,6,(x,y,z)=>{ const r=Math.hypot(x-3,y-2.5); if (z<4) return r<=2.6 ? '#2f3a34' : (x===6&&y===2&&z===2 ? '#2f3a34':null); if (z===4) return r<=1.6 ? '#3c4a42' : null; if (z===5) return r<0.7 ? '#3c4a42':null; return null; }),
  door: model(12,2,24,(x,y,z)=>{ if (x<2||x>9||z>21) return WOOD; return y===0 ? '#050403' : null; }),
  scroll: model(9,1,17,(x,y,z)=>{ if (z===0||z===16) return DARK; if (x===0||x===8) return null; if (z>2&&z<14&&(x===3||x===5)&&(z%3!==0)) return '#2a2118'; return PAPER; }),
  letter: model(6,12,2,(x,y,z)=>{
    if (z===1){
      if (x===2 && y>=3 && y<=8 && y%2===1) return '#3a2a1a';            // 세로 글씨
      if (x>=2 && x<=3 && (y===10)) return '#9a2a1a';                    // 붉은 봉함 인장
      if (y===1) return '#cbbf9f';                                          // 접힌 윗단
      return null;
    }
    return (x===0||x===5||y===0||y===11) ? '#bfb393' : '#e6dcc2';
  }),
  rdesk: model(16,9,12,(x,y,z)=>{                                         // 연구원 책상(의자에 앉아 쓰는 높이): 벼루만
    if (z===11){ if (x>=12 && x<=13 && y>=2 && y<=4) return y===2 ? '#2a2a2e' : '#141416'; return null; }
    if (z===10) return '#55361f';
    if (z===9 && (y===0 || y===8)) return '#3a2414';
    if ((x<=1||x>=14) && (y<=1||y>=7)) return '#3a2414';
    return null;
  }),
  sundial: model(9,9,7,(x,y,z)=>{ const r = Math.hypot(x-4, y-4);            // 앙부일구: 솥 모양 해시계, 네 발, 가운데 바늘(영침)
    if (z <= 2) return ((x===1||x===7) && (y===1||y===7)) ? '#5a4a30' : null;
    if (z === 3) return r <= 3.6 ? '#7a6a44' : null;
    if (z === 4 || z === 5) return r <= 4.2 && r > 3 ? '#9a8a5a' : (r <= 3 && z === 4 ? '#c8b98e' : null);
    if (z === 6) return (x === 4 && y >= 2 && y <= 4) ? '#2a2018' : null;
    return null; }),
  mapFold: model(6,4,2,(x,y,z)=> z===0 ? '#cfc2a3' : (x===2 || y===1) ? '#a89a78' : '#ddd1b4'),
  cup: model(4,4,3,(x,y,z)=>{ const r = Math.hypot(x-1.5, y-1.5);          // 찻잔: 흰 사발에 누런 찻물
    if (z===0) return r <= 1.2 ? '#cfcabd' : null;
    if (z===1) return r <= 2.1 ? '#e8e4d8' : null;
    return r <= 2.1 ? (r <= 1.3 ? '#9a7a3a' : '#f2eee4') : null; }),
  chair: model(9,8,13,(x,y,z)=>{ const L='#6a4628', Dk='#4a2e18'; if (z===5) return (x===0||x===8||y===7) ? Dk : L; if (z<5) return ((x<=1||x>=7)&&(y<=1||y>=6)) ? Dk : null; if (y<=1) return (x<=1||x>=7||z===12||z===9) ? (z===12 ? L : Dk) : null; return null; }),
};
// 불이 꺼져 있을 때 처음 생긴 것은 등잔을 다시 켜야 비로소 보임(켜는 순간 '아까 없던 것'이 거기 있음)
function reveal(id, cond){
  if (!cond) return false;
  S.revealed = S.revealed || [];
  if (S.revealed.includes(id)) return true;
  if (S.owned.lamp && S.lampOut) return false;
  S.revealed.push(id); return true;
}
function gameHour(d = new Date()){ if (S.opt.forceHour != null) return S.opt.forceHour;   // 시험용: 낮밤 고정
  return S.opt.gameTime ? (d.getTime()/1000/300) % 24 : d.getHours() + d.getMinutes()/60; }
function daylight(d = new Date()){         // 0 = 밤, 1 = 한낮
  const h = gameHour(d);
  if (h < 5 || h >= 21) return 0;
  if (h < 7) return (h - 5)/2;
  if (h >= 18) return (21 - h)/3;
  return 1;
}
const mixC = (a, b, t) => '#' + [0,1,2].map(i => Math.round(parseInt(a.slice(1+i*2,3+i*2),16)*(1-t) + parseInt(b.slice(1+i*2,3+i*2),16)*t).toString(16).padStart(2,'0')).join('');
function paperColor(){ const L = daylight(); return L >= 0.5 ? mixC('#c9a66a', '#f2ead2', (L-0.5)*2) : mixC('#1e2433', '#c9a66a', L*2); }
const WIN = {};
function windowModel(col){ return model(12,1,12,(x,y,z)=> (x===0||x===11||z===0||z===11) ? '#4a2e18' : (x%3===0 || z%4===0) ? '#5a3a20' : col); }
function winModel(){ const c = paperColor(); return WIN[c] || (WIN[c] = windowModel(c)); }
const OBJ = [
  { id:'shelf', x:-24, y:-17, rot:0, click:()=>showShelf() },
  { id:'window', x:7, y:-26, z:8, rot:0, m:()=>'__win', click:()=>openOv(`<h3>창</h3>${daylight() >= 0.8 ? '창호지가 환하다. 낮이다.' : daylight() > 0 ? '창호지가 누렇게 물들었다. 해가 걸려 있다.' : '창호지가 어둡다. 밤이다.<br><br>연구원은 밤에는 일하지 않는다.'}`) },
  { id:'scroll', x:-6, y:-24, rot:0, z:6, show:()=>S.gahun>=0, click:()=>showGahun() },
  { id:'chest', glow2:()=> S.jokboDone && !S.mapFound, get x(){ return S.owned.desk ? -30 : 0; }, get y(){ return S.owned.desk ? 19 : 2; }, get rot(){ return S.owned.desk ? 0.35 : 0.05; }, m:()=> S.owned.desk ? 'chestClosed' : 'chest', click:()=> S.owned.desk ? showEmptyChest() : deskClick(), glow:()=>!S.opened && !S.owned.desk },
  { id:'lamp', get x(){ return S.owned.lamp && S.owned.desk ? -18 : -12; }, get y(){ return S.owned.lamp && S.owned.desk ? 0 : -3; }, click:()=>lampClick(), buy:{ cost:15, name:'등잔' } },
  { id:'brush', x:9, y:-20, buy:{ cost:50, name:'붓걸이' } },
  { id:'desk', get x(){ return S.owned.desk ? 0 : 0; }, get y(){ return S.owned.desk ? 3 : 15; }, m:()=> 'seoan', buy:{ cost:120, name:'서안' }, click:()=>deskClick() },
  { id:'glass', get x(){ return S.owned.glass && S.owned.desk ? -10 : 8; }, get y(){ return S.owned.glass && S.owned.desk ? 3 : 22; }, get z(){ return S.owned.glass && S.owned.desk ? 8 : 0; }, buy:{ cost:260, name:'수정 문진' } },
  { id:'sundial', x:4, y:-15, buy:{ cost:300, name:'앙부일구' }, show:()=>!!S.obsOpen || !!S.owned.sundial },   // 관측소가 열리면 생김(관측소는 아직 없음 — 기획서 14-1). 이미 들인 사람은 그대로
  { id:'teapot', x:-31, y:-5, show:()=>reveal('teapot', S.teaArrived), click:()=>showTea() },
  { id:'door', x:27, y:-25.5, show:()=>reveal('door', S.D>=T.door), click:()=>showLibrary() },
  { id:'letter', x:24, y:-11, show:()=>reveal('letter', S.D>=T.letter && !S.replied), click:()=>readLetter(), glow:()=>!S.letterRead },
  { id:'rdesk', x:27, y:19, rot:0, show:()=>S.chair, click:()=> S.rArrived ? showResearcher() : openOv('<h3>연구원의 자리</h3>작은 책상과 의자. 종이 묶음과 벼루가 놓여 있다.<br><br>아직 아무도 앉지 않았다.') },
  { id:'shelfMap', x:-26, y:-17, z:26, m:()=>'mapFold', show:()=>S.mapFound && S.loc && S.loc.map === 'shelf', click:()=>showPlace('map'), glow:()=>!S.helpRead && mapMarks() < 6 },
  { id:'ditem', x:0, y:3, get z(){ return 8 + dropZ('desk'); }, m:()=> itemModel(itemAt('desk')), show:()=> !!S.owned.desk && !!itemAt('desk'), click:()=>deskClick() },
  { id:'ritem', x:25, y:19, get z(){ return 11 + dropZ('rdesk'); }, m:()=> itemModel(itemAt('rdesk')), show:()=>S.chair && !!itemAt('rdesk'), click:()=>showResearcher() },
  { id:'note', get x(){ return S.owned.desk ? 8 : 4; }, get y(){ return S.owned.desk ? 3 : 2; }, get z(){ return 8; }, m:()=>'letter', show:()=> !!S.pendingNote || !!(S.pendingNotes && S.pendingNotes.length) || (S.helpNote && !S.helpRead) || (S.goNote && !S.goRead), click:()=>readNote(), glow:()=>true },
  { id:'chair', x:27, get y(){ return S.rArrived ? sjState().chair : CHAIR_IN; }, rot:0, show:()=>S.chair },
  // 차를 내주면 놓이는 찻잔: 효과가 이어지는 동안 그대로 있다가, 끝날 무렵 흐려져 사라짐
  { id:'cupR', x:32, y:20, z:12, rot:0, m:()=>'cup', on:()=>'rdesk', onOrder:0.02, show:()=> !!S.rArrived && Date.now() < (S.rCalm||0) && SJ.show(), alpha:()=> cupAlpha(S.rCalm), click:()=>showResearcher() },
  { id:'cupMe', x:7, y:5, z:8, rot:0, m:()=>'cup', on:()=>'desk', onOrder:0.02, show:()=> !!S.owned.desk && performance.now() < calmUntil, alpha:()=> Math.min(1, (calmUntil - performance.now())/4000), click:()=>openOv('<h3>찻잔</h3>방금 마신 찻잔. 아직 따뜻하다.<br>온기가 남아 있는 동안은 두려움이 더디게 찾아온다.') },
];
let W=0, H=0, DPR=1, SC=4, ang=-0.35, drag=0, t0=performance.now(), steamUntil=0, glitchUntil=0;
function resize(){ const r = cv.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio||1);
  W = cv.width = Math.floor(r.width*DPR); H = cv.height = Math.floor(r.height*DPR);
  SC = Math.max(2, Math.floor(Math.min(W/96, H/78))); }
window.addEventListener('resize', resize);
const cupAlpha = until => Math.min(1, (until - Date.now())/4000);
function drawModel(m, sx, sy, a, alpha, z0=0){
  // 층마다 save/restore로 변환을 쌓던 것을 변환 행렬 한 번 계산 + setTransform으로 바꿈(돌릴 때 끊김 줄이기)
  const step = SC*0.85, n = Math.ceil(step), ca = Math.cos(a), sa = Math.sin(a);
  const A = SC*ca, B = SC*0.6*sa, C = -SC*sa, D = SC*0.6*ca, ox = -m.w/2, oy = -m.d/2;
  const ex = sx + A*ox + C*oy, ey0 = sy + B*ox + D*oy;
  cx.globalAlpha = alpha;
  for (let z=0; z<m.h; z++){ const L = m.layers[z]; if (!L) continue;
    const ey = ey0 - (z+z0)*step;
    for (let k=0; k<n; k++){ cx.setTransform(A, B, C, D, ex, ey - k); cx.drawImage(L, 0, 0); }
  }
  cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1;
}
function frame(now){
  const lowQ = typeof down !== 'undefined' && !!down && down.moved && bookView.classList.contains('hidden');
  if (lowQ) beginLow();
  const t = (now - t0)/1000, a = ang + Math.sin(t*0.12)*0.1 + drag, c = Math.cos(a), s = Math.sin(a), ox = W/2, oy = H*0.58;
  if (bookView.classList.contains('hidden') && mapView.classList.contains('hidden')){   // 지도·책이 덮고 있으면 방은 그리지 않음
    cx.fillStyle = '#0b0907'; cx.fillRect(0,0,W,H); cx.imageSmoothingEnabled = false;
    const lab = S.scene === 'lab';
    const gate = S.scene === 'gate';
    drawModel(lab ? M.labFloor : gate ? M.yard : M.floor, ox, oy, a, 1, -1);
    const list = [];
    for (const o of curObjs()){
      const owned = !o.buy || S.owned[o.id];
      if (o.show && !o.show()) { o.hit=null; continue; }
      const ghost = o.buy && !owned;
      if (ghost && S.earned < o.buy.cost*0.5) { o.hit=null; continue; }
      if (ghost && !reveal('g_' + o.id, true)) { o.hit=null; continue; }   // 불이 꺼진 동안 나타난 살 물건은 다시 켜야 보임
      const rx = o.x*c - o.y*s, ry = o.x*s + o.y*c;
      list.push({ o, ghost, sx: ox + rx*SC, sy: oy + ry*SC*0.6, ry: ry + (o.z||0)*0.8 });
    }
    for (const dl of ALL_DOLLS()){ if (!curDolls().includes(dl) || !dl.show()){ dl.hit = null; continue; } const st = dl.st(), rx = st.x*c - st.y*s, ry = st.x*s + st.y*c; list.push({ o:dl, ghost:false, sx: ox + rx*SC, sy: oy + ry*SC*0.6, ry }); }
    const deskIt = list.find(it => it.o.id === 'desk' && !it.ghost);
    if (deskIt) for (const it of list) if ((it.o.id === 'glass' || it.o.id === 'ditem' || it.o.id === 'note') && !it.ghost && S.owned.desk) it.ry = deskIt.ry + 0.01;   // 서안 위 물건
    const rdIt = list.find(it => it.o.id === 'rdesk'); if (rdIt) for (const it of list) if (it.o.id === 'ritem') it.ry = rdIt.ry + 0.01;
    const shIt = list.find(it => it.o.id === 'shelf'); if (shIt) for (const it of list) if (it.o.id === 'shelfMap') it.ry = shIt.ry + 0.01;
    for (const it of list) if (it.o.on){ const base = list.find(b => b.o.id === it.o.on()); if (base) it.ry = base.ry + (it.o.onOrder || 0.01); }   // 책상 위 물건은 그 책상 바로 다음에(돌려도 사람 위로 뜨지 않게)
    list.sort((p,q)=>p.ry-q.ry);
    const labels = [];
    for (const it of list){
      if (it.o.doll){
        const D = it.o, st = D.st(), walking = st.pose === 'walk', e = Date.now() - D.arrT(), fr0 = D.fear(), I = (D.imgL && D.imgL[fr0 > 0.7 ? 2 : fr0 > 0.35 ? 1 : 0]) || D.img;   // 겁먹으면 표정이 바뀌고 땀
        const face = st.f[0]*s + st.f[1]*c;                        // 바라보는 쪽이 화면(앞)으로 향한 정도
        const f = Math.max(0.05, Math.abs(face)), bk = face < 0;   // 옆으로 돌면 얇아지고, 등을 보이면 뒷모습
        const img = st.pose === 'sit' ? (bk ? I.SIT_BK : (st.closed && I.SIT_CL) || I.SIT) : walking ? (Math.floor(e/280) % 2 ? (bk ? I.A_BK : I.A) : (bk ? I.B_BK : I.B)) : (bk ? I.A_BK : I.A);
        const breath = walking ? 1 : 1 + 0.012*Math.sin(t*1.7 + D.id.length*1.3);   // 숨: 앉거나 서 있을 때 아주 조금 오르내림
        const u = SC*0.85*0.27, dh = img.height*u*breath, dw = img.width*u*f;
        const lift = walking ? Math.abs(Math.sin(e/280*Math.PI))*SC*0.5 : st.pose === 'sit' ? 4*SC*0.85 : 0;   // 걸음의 들썩임 / 의자 높이
        const fr = D.fear(), tr = fr > 0.35 && !walking ? (Math.random() - 0.5) * SC * 0.7 * fr : 0;   // 겁에 질려 떪
        if (D.shadow){ cx.fillStyle = 'rgba(0,0,0,0.38)'; cx.beginPath(); cx.ellipse(it.sx + 6*DPR, it.sy + 2*DPR, img.width*u*0.55, img.width*u*0.16, 0, 0, Math.PI*2); cx.fill(); }   // 그림자 하나
        cx.drawImage(img, it.sx - dw/2 + tr, it.sy - lift - dh, dw, dh);
        if (Date.now() < D.steam()){ cx.fillStyle = 'rgba(220,215,200,0.5)'; for (let k=0;k<5;k++){ const ph = (t*1.5 + k/5) % 1; cx.fillRect(it.sx + 10*DPR + Math.sin(t*3+k)*3*DPR, it.sy - 14*SC*0.85 - ph*30*DPR, SC*0.7, SC*0.7); } }   // 내준 찻잔의 김
        if (f < 0.2){ cx.fillStyle = '#1a1410'; cx.fillRect(it.sx - SC*0.2, it.sy - lift - dh, SC*0.4, dh); }
        it.o.hit = { x: it.sx, y0: it.sy - lift, y1: it.sy - lift - dh, r: 22*DPR, ghost:false };
        continue;
      }
      const mk = it.o.m ? it.o.m() : it.o.id, m = mk === '__win' ? winModel() : M[mk];
      let alpha = it.ghost ? (S.pages >= it.o.buy.cost ? 0.42 : 0.18) : 1;
      if ((it.o.glow && it.o.glow()) || (it.o.glow2 && it.o.glow2())) alpha = 0.72 + 0.28*Math.sin(t*3);
      if (it.o.alpha) alpha = it.o.alpha();
      drawModel(m, it.sx, it.sy, a + (it.o.rot||0), alpha, it.o.z||0);
      it.o.hit = { x: it.sx, y0: it.sy - (it.o.z||0)*SC*0.85, y1: it.sy - (m.h + (it.o.z||0) + (it.ghost ? 8 : 0))*SC*0.85, r: Math.max(Math.max(m.w, m.d)*SC*0.5, 28*DPR), ghost: it.ghost };
      if (it.ghost) labels.push({ t:`${it.o.buy.name} ${fmtP(it.o.buy.cost)}`, x: it.sx, y: it.sy - (m.h+4)*SC*0.85, c: S.pages >= it.o.buy.cost ? '#cfc3a8' : '#6d6350' });
      if (it.o.id==='lamp' && !it.ghost && S.lampOut){ cx.fillStyle = 'rgba(120,110,100,.35)'; for (let k=0;k<3;k++){ const ph=(t*0.6+k/3)%1; cx.fillRect(it.sx + Math.sin(t*2+k)*3*DPR, it.sy - 24*SC*0.85 - ph*30*DPR, SC*0.6, SC*0.6); } }   // 꺼진 심지의 연기
      if (it.o.id==='lamp' && !it.ghost && !S.lampOut){ const fy = it.sy - 24*SC*0.85, fl = 0.6+0.4*Math.sin(t*11)*Math.sin(t*7.3);
        cx.fillStyle = '#ffd27a'; cx.fillRect(it.sx - SC*0.5, fy - SC*1.6, SC, SC*1.6); cx.fillStyle = '#e8a040'; cx.fillRect(it.sx - SC*0.5, fy - SC*0.6, SC, SC*0.6);
        const g = cx.createRadialGradient(it.sx, fy, 0, it.sx, fy, 30*DPR); g.addColorStop(0,`rgba(255,190,90,${0.35*fl})`); g.addColorStop(1,'rgba(255,190,90,0)');
        cx.fillStyle=g; cx.fillRect(it.sx-30*DPR, fy-30*DPR, 60*DPR, 60*DPR); }
      if (it.o.id==='teapot' && now < steamUntil){ cx.fillStyle='rgba(220,215,200,0.5)';
        for (let k=0;k<6;k++){ const ph=(t*1.5+k/6)%1; cx.fillRect(it.sx + Math.sin(t*3+k)*4*DPR, it.sy - 6*SC*0.85 - ph*40*DPR, SC*0.8, SC*0.8); } }
    }
    // 흐린 물건 이름표: 서로 겹치면 위로 비켜 쓰고, 화면 밖으로 나가지 않게
    cx.font = `${12*DPR}px serif`; cx.textAlign = 'center';
    const placed = [];
    for (const L of labels.sort((a, b) => b.y - a.y)){
      const w = cx.measureText(L.t).width + 8*DPR, h = 15*DPR;
      L.x = Math.max(w/2 + 4, Math.min(W - w/2 - 4, L.x));
      for (let k = 0; k < 8 && placed.some(q => Math.abs(q.x - L.x) < (q.w + w)/2 && Math.abs(q.y - L.y) < h); k++) L.y -= h;
      placed.push({ x:L.x, y:L.y, w });
      cx.fillStyle = 'rgba(11,9,7,.55)'; cx.fillRect(L.x - w/2, L.y - h + 3*DPR, w, h);
      cx.fillStyle = L.c; cx.fillText(L.t, L.x, L.y);
    }
    const dl = daylight();
    if (dl > 0 && !gate){ const WX = lab ? 15 : 7, wx = WX*c - (-26)*s, wy = WX*s + (-26)*c, gx = ox + wx*SC, gy = oy + wy*SC*0.6 + 30*DPR;
      const wg = cx.createRadialGradient(gx, gy, 0, gx, gy, 140*DPR); wg.addColorStop(0, `rgba(240,225,190,${0.10*dl})`); wg.addColorStop(1, 'rgba(240,225,190,0)'); cx.fillStyle = wg; cx.fillRect(gx-140*DPR, gy-140*DPR, 280*DPR, 280*DPR); }
    const lit = lab || gate || (S.owned.lamp && !S.lampOut) ? 1 : 0, out = !lab && !gate && S.owned.lamp && S.lampOut;
    const g = cx.createRadialGradient(ox, oy-20*DPR, Math.min(W,H)*(out ? 0.04 : 0.18+0.12*lit), ox, oy, Math.max(W,H)*(out ? 0.38 : 0.62));
    g.addColorStop(0, out ? 'rgba(8,6,4,0.55)' : 'rgba(8,6,4,0)'); g.addColorStop(1,'rgba(8,6,4,' + (out ? 0.97 : 0.92) + ')'); cx.fillStyle = g; cx.fillRect(0,0,W,H);
    const since = now - relitAt;
    const sc = now - sceneAt; if (sc < 700){ cx.fillStyle = `rgba(0,0,0,${1 - sc/700})`; cx.fillRect(0,0,W,H); }   // 문을 지나 다른 방으로
    if (since < 900){ const k = since < 120 || (since > 260 && since < 380) || (since > 520 && since < 600) ? 0.85 : 0; if (k){ cx.fillStyle = `rgba(8,6,4,${k})`; cx.fillRect(0,0,W,H); } }   // 다시 붙인 불의 깜빡임
  }
  if (lowQ) endLow();
  tick(now); requestAnimationFrame(frame);
}

