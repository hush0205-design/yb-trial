'use strict';
// ───────── 별채 연구실·사람 늘리기 (기획서 14절) ─────────
// 한서진의 부탁 쪽지 → 방(榜) 종이 → 대문에 붙이면 서고 왼쪽 벽에 별채 문 → 지원 편지가 차례로 옴
// → 별채에 빈 책상이 있어야 답장할 수 있음(책상은 권 단위) → 연구원이 별채 문으로 들어와 앉음
let sceneAt = -1e9;
S.st = S.st || {};
const LAB_DOOR = [-27, -22];
const LAB_DESKS = { ld1:[-22, 6], ld2:[0, 6], ld3:[22, 6] };
const DESK_COST = { ld1:200, ld2:400, ld3:800 };
const KNUM = ['', '하나', '둘', '셋', '넷', '다섯', '여섯'];

// 마루: 길게 깐 널, 서고 바닥보다 밝음
M.labFloor = model(76,54,1,(x,y)=> (y%5===0 || (x + Math.floor(y/5)*23)%31===0) ? '#2e2015' : ((Math.floor(y/5))%2 ? '#4a3421' : '#45301f'));
M.bangRoll = model(11,4,3,(x,y,z)=>{                    // 둘둘 만 방 종이와 붓 한 자루
  if (y>=1 && y<=3 && z<=2 && x>=1 && x<=8) return (x===1||x===8) ? '#b8ab88' : (z===2 && y===2 ? '#e8dfc8' : PAPER);
  if (y===0 && z===0 && x>=2 && x<=10) return x>=9 ? '#111' : '#6a4a2a';
  return null; });
M.roster = model(11,1,16,(x,y,z)=>{                      // 벽에 건 명부: 세로줄 이름 몇 개
  if (z===0||z===15) return DARK; if (x===0||x===10) return null;
  if (z>2 && z<13 && (x===2||x===4||x===6||x===8) && z%2) return x===8 ? '#5a3a3a' : '#2a2118';
  return '#d8cdb0'; });

const STAFF = {
  smw: { name:'서명우', hj:'徐明雨', job:'관측사', sec:4, fearK:1.5, shadow:true,
    note:'밤에만 일한다. 해가 높으면 눈을 감고 쉰다.',
    letter:['저는 하늘을 보는 일을 해 온 사람입니다.', '별의 자리를 적고, 달라진 것이 있으면 아룁니다.', '대문에 붙은 방을 보았습니다.', '밤에만 일하겠습니다.', '해가 높을 때는 눈이 시려 오래 뜨지 못합니다.'],
    reply:['오시오.', '별채에 자리를 마련해 두었소.', '밤에만 일해도 좋소.'],
    diary:[[60, '이경(밤 열 시쯤). 동쪽 하늘 맑음. 늘 보던 별들. 이상 없음. ✶'],
           [240, '오시(한낮). 해를 오래 보지 말라고 배웠다. 눈이 시려 감았다. 감으니 편하다. ✶'],
           [600, '삼경. 지도에 없는 자리가 하나 비어 있는 것 같다. 기분 탓이다. ✶']] },
  ojr: { name:'오정림', hj:'吳貞林', job:'다원지기', sec:8, fearK:0.5,
    note:'차를 끓여 사람들을 챙긴다. 글은 천천히 읽는다. 밤에는 집에 간다.',
    letter:['방을 보고 왔습니다.', '글은 더디게 읽지만 차는 잘 끓입니다.', '서고에 계신 분들이 잠을 못 이룬다는 말을 들었습니다.', '우리 집은 불씨를 꺼뜨린 적이 없습니다.'],
    reply:['오시오.', '별채에 자리를 마련해 두었소.', '차를 부탁하오.'],
    diary:[[60, '찻잎이 연하게 올라왔다. 우리 서고 사람들 요즘 잠을 못 잔다. 오늘은 넉넉히 끓였다.'],
           [240, '서진 씨가 두 잔 마셨다. 손이 떨려서 잔을 잡아 주었다. 명우 씨는 밤새 별채에 있다고 해서 한 잔 들고 갔다.'],
           [600, '아궁이 불이 좋다. 불씨는 내가 지킨다. 우리 집은 불씨를 꺼뜨린 적이 없다.']] },
};
const SKEYS = Object.keys(STAFF);
const stOf = k => (S.st[k] = S.st[k] || {});
const arrived = k => !!(S.st[k] && S.st[k].arr);
const present = k => arrived(k) && (k === 'smw' || !isNight());           // 오정림은 밤에 집에 감, 서명우는 늘 있음(낮엔 눈을 감고 쉼)
const working = k => arrived(k) && Date.now() - S.st[k].arr > T_PUSH && (k === 'smw' ? isNight() : !isNight());
const deskOwner = d => SKEYS.find(k => S.st[k] && S.st[k].desk === d) || null;
const freeDesk = () => Object.keys(LAB_DESKS).find(d => S.owned[d] && !deskOwner(d)) || null;
const curApplicant = () => SKEYS.find(k => S.st[k] && S.st[k].at && !S.st[k].replied) || null;

// 별채의 길: 문 → 책상 옆 → 의자를 빼고 앉음 (한서진과 같은 몸짓, 책상 자리만 다름)
function labPath(e, d){
  const [dx, dy] = LAB_DESKS[d], SIDE = [dx + 7, dy - 10.5], CIN = dy - 7, COUT = dy - 10.4;
  const dir = (ax, ay, bx, by) => { const l = Math.hypot(bx-ax, by-ay) || 1; return [(bx-ax)/l, (by-ay)/l]; };
  if (e < WALK_MS){ const t = e / WALK_MS; return { x: lerp(LAB_DOOR[0], SIDE[0], t), y: lerp(LAB_DOOR[1], SIDE[1], t), pose:'walk', chair: CIN, f: dir(...LAB_DOOR, ...SIDE) }; }
  if (e < T_PULL)  return { x: SIDE[0], y: SIDE[1], pose:'stand', f:[-1, 0], chair: lerp(CIN, COUT, (e - WALK_MS) / (T_PULL - WALK_MS)) };
  if (e < T_STEP){ const t = (e - T_PULL) / (T_STEP - T_PULL); return { x: lerp(SIDE[0], dx, t), y: lerp(SIDE[1], COUT + 1.6, t), pose:'walk', f: dir(SIDE[0], SIDE[1], dx, COUT + 1.6), chair: COUT }; }
  if (e < T_SIT)   return { x: dx, y: COUT + 1.6, pose:'stand', f:[0, 1], chair: COUT };
  const t = (e - T_SIT) / (T_PUSH - T_SIT);
  return { x: dx, y: lerp(COUT + 1.2, CIN + 1.2, t), pose:'sit', f:[0, 1], chair: lerp(COUT, CIN, t) };
}
function staffState(k){
  const s = S.st[k], p = labPath(Date.now() - s.arr, s.desk);
  if (k === 'smw' && p.pose === 'sit' && !isNight()) p.closed = true;     // 해가 높으면 눈을 감음
  return p;
}

// 다원지기 종이 인형: 쪽진 머리에 비녀, 소매 걷은 저고리, 쪽빛 치마, 흰 앞치마
function drawWoman(pose, back){
  const W = 48, H = pose === 'sit' ? 78 : 98, sit = pose === 'sit', sway = pose === 'a' ? -1.2 : pose === 'b' ? 1.2 : 0;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const path = (pts, fill, stroke) => { g.beginPath(); pts(g); g.closePath(); if (fill){ g.fillStyle = fill; g.fill(); } if (stroke){ g.strokeStyle = stroke; g.lineWidth = 0.8; g.stroke(); } };
  const skirt = g.createLinearGradient(6, 0, 44, 0); skirt.addColorStop(0, '#5d6b88'); skirt.addColorStop(0.6, '#4d5a76'); skirt.addColorStop(1, '#3a4560');
  const hem = sit ? 68 : 91;
  // 치마: 가슴께에서 아래로 넓게 퍼짐
  path(p => { p.moveTo(17, 44); p.quadraticCurveTo(11, 52, 8 + sway, hem); p.quadraticCurveTo(24 + sway, hem + 3, 40 + sway, hem); p.quadraticCurveTo(37, 52, 31, 44); }, skirt, '#2e3850');
  g.strokeStyle = '#3a4560'; g.lineWidth = 0.8;
  [[20, 50, 15 + sway, hem - 1], [24, 50, 24 + sway, hem + 1], [28, 50, 33 + sway, hem - 1]].forEach(([x1,y1,x2,y2]) => { g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke(); });   // 치마 주름
  if (sit) path(p => { p.moveTo(5, 64); p.quadraticCurveTo(24, 57, 43, 64); p.quadraticCurveTo(45, 72, 42, 76); p.quadraticCurveTo(24, 78, 6, 76); p.quadraticCurveTo(3, 72, 5, 64); }, skirt, '#2e3850');
  // 신코
  if (!sit){ g.fillStyle = '#3a2a20'; g.beginPath(); g.ellipse(19 + sway, hem + 1.5, 3, 1.4, 0, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(29 + sway, hem + 1.5, 3, 1.4, 0, 0, Math.PI*2); g.fill(); }
  if (!back){
    // 앞치마
    path(p => { p.moveTo(17.5, 50); p.lineTo(30.5, 50); p.lineTo(32 + sway*0.6, sit ? 74 : 84); p.lineTo(16 + sway*0.6, sit ? 74 : 84); }, '#efe9da', '#b8af9a');
    g.strokeStyle = '#d8d0bc'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(16, 50); g.lineTo(32, 50); g.stroke();
  } else {
    g.strokeStyle = '#efe9da'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(15.5, 50); g.lineTo(32.5, 50); g.stroke();   // 등 뒤로 맨 앞치마 끈
    path(p => { p.moveTo(24, 50); p.quadraticCurveTo(19, 46, 19.5, 52); p.closePath(); }, '#efe9da', '#b8af9a');
    path(p => { p.moveTo(24, 50); p.quadraticCurveTo(29, 46, 28.5, 52); p.closePath(); }, '#efe9da', '#b8af9a');
    g.strokeStyle = '#d8d0bc'; g.beginPath(); g.moveTo(23.5, 50.5); g.lineTo(22, 58); g.moveTo(24.5, 50.5); g.lineTo(26, 58); g.stroke();
  }
  // 걷어 올린 소매와 팔뚝, 손
  const jeo = '#e6d7b4';
  path(p => { p.moveTo(15, 39); p.quadraticCurveTo(10, 43, 10.5, 50); p.lineTo(15.5, 50.5); p.quadraticCurveTo(16, 45, 18, 42); }, jeo, '#b0a07c');
  path(p => { p.moveTo(33, 39); p.quadraticCurveTo(38, 43, 37.5, 50); p.lineTo(32.5, 50.5); p.quadraticCurveTo(32, 45, 30, 42); }, jeo, '#b0a07c');
  g.fillStyle = '#d6c69e'; g.fillRect(10.4, 48.6, 5.2, 2.2); g.fillRect(32.4, 48.6, 5.2, 2.2);   // 걷은 소매 단
  g.fillStyle = '#e0bd96';
  path(p => { p.moveTo(11, 50.8); p.lineTo(15, 50.8); p.lineTo(16.5, back ? 60 : 57); p.lineTo(13, back ? 60 : 57.5); }, '#e0bd96');
  path(p => { p.moveTo(37, 50.8); p.lineTo(33, 50.8); p.lineTo(31.5, back ? 60 : 57); p.lineTo(35, back ? 60 : 57.5); }, '#e0bd96');
  if (!back){ g.beginPath(); g.ellipse(15.5, 58, 2.2, 1.6, 0.4, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(32.5, 58, 2.2, 1.6, -0.4, 0, Math.PI*2); g.fill(); }
  // 저고리: 짧고 몸에 붙음
  path(p => { p.moveTo(20, 37); p.quadraticCurveTo(14, 38.5, 14.5, 44); p.lineTo(15, 47.5); p.quadraticCurveTo(24, 49, 33, 47.5); p.lineTo(33.5, 44); p.quadraticCurveTo(34, 38.5, 28, 37); }, jeo, '#b0a07c');
  if (!back){
    path(p => { p.moveTo(20.5, 37); p.lineTo(22.6, 37); p.quadraticCurveTo(25.5, 41.5, 29.5, 44.5); p.lineTo(27.5, 45.6); p.quadraticCurveTo(23.5, 42, 20.5, 37); }, '#fbf8f1', '#b8af9a');   // 깃·동정
    // 고름: 검붉은 띠가 매듭에서 늘어짐
    g.fillStyle = '#7e2e22'; g.beginPath(); g.ellipse(26.5, 45.4, 1.6, 1.1, 0, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#7e2e22'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(26.5, 46); g.quadraticCurveTo(26, 50, 25.2, 54); g.moveTo(27, 46); g.quadraticCurveTo(28, 49.5, 28.4, 52.5); g.stroke();
  } else { g.strokeStyle = '#cdbd98'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(24, 37.5); g.lineTo(24, 47.5); g.stroke(); }
  // 목
  g.fillStyle = '#d4ad85'; g.fillRect(21.8, 33, 4.4, 5);
  // 쪽: 목덜미의 쪽진 머리와 가로지른 비녀(앞에서는 양 끝만 보임)
  g.fillStyle = '#16110d'; g.beginPath(); g.ellipse(24, 31.5, 5.2, 3.4, 0, 0, Math.PI*2); g.fill();
  g.strokeStyle = '#c8b27a'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(15.5, 31.2); g.lineTo(32.5, 31.2); g.stroke();
  g.fillStyle = '#c8b27a'; g.beginPath(); g.arc(32.8, 31.2, 0.9, 0, Math.PI*2); g.fill();
  if (back){
    g.fillStyle = '#1a1410'; g.beginPath(); g.ellipse(24, 25.5, 7.3, 7.6, 0, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#3a2e26'; g.lineWidth = 0.6; for (let k = 0; k < 5; k++){ g.beginPath(); g.moveTo(18.5 + k*2.7, 19.5); g.quadraticCurveTo(19.5 + k*2.3, 26, 21.5 + k*1.3, 30); g.stroke(); }   // 빗어 내린 결
    g.fillStyle = '#16110d'; g.beginPath(); g.ellipse(24, 31.5, 5.2, 3.4, 0, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#c8b27a'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(15.5, 31.2); g.lineTo(32.5, 31.2); g.stroke();
  } else {
    const skin = g.createLinearGradient(16, 0, 32, 0); skin.addColorStop(0, '#efd2ae'); skin.addColorStop(0.7, '#e3c39d'); skin.addColorStop(1, '#cfa983');
    g.fillStyle = skin; g.beginPath(); g.moveTo(17.6, 23); g.quadraticCurveTo(17.2, 32.5, 24, 35.6); g.quadraticCurveTo(30.8, 32.5, 30.4, 23); g.closePath(); g.fill();
    // 가르마 탄 머리: 이마를 덮고 귀 뒤로 넘김
    g.fillStyle = '#1a1410'; g.beginPath(); g.moveTo(16.6, 27.5); g.quadraticCurveTo(15.5, 17.5, 24, 17); g.quadraticCurveTo(32.5, 17.5, 31.4, 27.5); g.quadraticCurveTo(30, 22.5, 24.6, 21.6); g.lineTo(23.4, 21.6); g.quadraticCurveTo(18, 22.5, 16.6, 27.5); g.closePath(); g.fill();
    g.strokeStyle = '#5a4a3a'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(24, 17.4); g.lineTo(24, 21.4); g.stroke();   // 가르마
    g.strokeStyle = '#3a2a20'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(19.4, 25.4); g.quadraticCurveTo(20.9, 24.8, 22.4, 25.3); g.moveTo(25.6, 25.3); g.quadraticCurveTo(27.1, 24.8, 28.6, 25.4); g.stroke();   // 눈썹
    g.fillStyle = '#1a1410'; g.beginPath(); g.ellipse(20.9, 27.4, 1.15, 0.6, 0, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(27.1, 27.4, 1.15, 0.6, 0, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#b48a66'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(24, 27.8); g.quadraticCurveTo(23.4, 30.2, 24.5, 30.6); g.stroke();
    g.strokeStyle = '#a05a4a'; g.lineWidth = 1; g.beginPath(); g.moveTo(22.8, 32.6); g.quadraticCurveTo(24, 33.2, 25.2, 32.6); g.stroke();
  }
  return c;
}
const SMW_O = { robe:['#e4e9e7', '#d1dad7', '#a9b8b4'], belt:'#6a3a4a', belt2:'#4a2434' };   // 옥색 도포, 자줏빛 세조대
const STAFF_IMG = {
  smw: { A:drawSeonbi('a', false, SMW_O), B:drawSeonbi('b', false, SMW_O), SIT:drawSeonbi('sit', false, SMW_O), SIT_CL:drawSeonbi('sit', false, Object.assign({ closed:true }, SMW_O)),
         A_BK:drawSeonbi('a', true, SMW_O), B_BK:drawSeonbi('b', true, SMW_O), SIT_BK:drawSeonbi('sit', true, SMW_O) },
  ojr: { A:drawWoman('a'), B:drawWoman('b'), SIT:drawWoman('sit'), A_BK:drawWoman('a', true), B_BK:drawWoman('b', true), SIT_BK:drawWoman('sit', true) },
};
const LAB_DOLLS = SKEYS.map(k => ({ id:'d_' + k, doll:true, shadow: !!STAFF[k].shadow, img: STAFF_IMG[k],
  st:()=>staffState(k), fear:()=>stOf(k).fear || 0, steam:()=>stOf(k).steam || 0, arrT:()=>stOf(k).arr || 0,
  show:()=>present(k), click:()=>showStaff(k) }));
const ALL_DOLLS = () => [SJ, ...LAB_DOLLS];
const curDolls = () => S.scene === 'lab' ? LAB_DOLLS : [SJ];

// 별채의 물건
const LAB_OBJ = [
  { id:'labBack', x:LAB_DOOR[0], y:-25.5, m:()=>'door', click:()=>goScene('seogo') },
  { id:'labWin', x:15, y:-26, z:8, rot:0, m:()=>'__win', click:()=>openOv(`<h3>창</h3>${daylight() >= 0.8 ? '창호지가 환하다. 낮이다.' : daylight() > 0 ? '창호지가 누렇게 물들었다. 해가 걸려 있다.' : '창호지가 어둡다. 밤이다.'}<br><br>별채의 창은 서고의 창보다 조금 크다.`) },
  { id:'roster', x:-8, y:-24, z:6, rot:0, m:()=>'roster', click:()=>showRoster() },
];
for (const [d, [dx, dy]] of Object.entries(LAB_DESKS)){
  const prev = { ld1:null, ld2:'ld1', ld3:'ld2' }[d];
  LAB_OBJ.push({ id:d, x:dx, y:dy, rot:0, m:()=>'rdesk', buy:{ cost:DESK_COST[d], name:'별채 책상' }, show:()=> !prev || !!S.owned[prev],
    click:()=>{ const k = deskOwner(d); if (k && arrived(k)) showStaff(k); else showItem(d); } });
  LAB_OBJ.push({ id:'c_' + d, x:dx, get y(){ const k = deskOwner(d); return k && arrived(k) ? labPath(Date.now() - S.st[k].arr, d).chair : dy - 7; }, rot:0, m:()=>'chair', show:()=>!!S.owned[d] });
  LAB_OBJ.push({ id:'i_' + d, x:dx - 2, y:dy, z:11, rot:0, m:()=> itemModel(S.st[deskOwner(d)].item), show:()=>{ const k = deskOwner(d); return !!k && arrived(k) && !!S.st[k].item; }, click:()=>showStaff(deskOwner(d)) });
}
const curObjs = () => S.scene === 'lab' ? LAB_OBJ : OBJ;
Object.assign(ITEM, {
  ld1: ['별채 책상', '별채에 들인 책상과 의자. 연구원 한 사람이 앉을 자리다.<br>서고의 책을 베껴 둔 사본을 놓고 읽는다.<br><br>의자 다리 하나가 조금 짧다.'],
  ld2: ['별채 책상', '별채에 들인 두 번째 책상과 의자.<br>서고의 책을 베껴 둔 사본을 놓고 읽는다.<br><br>들인 지 하루도 안 됐는데 먹 자국이 있다.'],
  ld3: ['별채 책상', '별채에 들인 세 번째 책상과 의자.<br>아직 앉을 사람이 없다.<br><br>아무도 앉지 않았는데 의자가 조금 빠져 있다.'],
});

// 서고에 생기는 것: 방 종이, 별채 문, 지원 편지
OBJ.push(
  { id:'bang', x:21, y:-18, m:()=>'bangRoll', show:()=> !!S.helpRead && !S.bangAt, click:()=>showBang(), glow:()=>true },
  { id:'labDoor', x:-37.5, y:2, rot:Math.PI/2, m:()=>'door', show:()=>reveal('labDoor', !!S.bangAt), click:()=>goScene('lab'), glow:()=>!S.labSeen },
  { id:'aletter', x:24, y:-11, m:()=>'letter', show:()=>{ const k = curApplicant(); return !!k && reveal('al_' + k, true); }, click:()=>readApplicant(curApplicant()), glow:()=>{ const k = curApplicant(); return !!k && !S.st[k].read; } },
);
function goScene(sc){
  if (sc === 'lab') S.labSeen = true;
  S.scene = sc; save(); sceneAt = performance.now();
  noise(0.35, 240, 0.12, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.3, 'lowpass'), 300);   // 문 여닫는 소리
  if (typeof tlog === 'function') tlog(sc === 'lab' ? '별채로 감' : '서고로 돌아옴');
}

// 기록들
const vlet = (lines, sign, h = 'min(52vh,380px)') => `<div class="vletter rec" style="height:${h}">${lines.join('<br>')}<div class="sign">${sign}</div></div>`;
const bangHtml = () => `<h3>방(榜)</h3>` + vlet(['서고에서 글 읽을 사람을 구함.', '밤낮을 가리지 않음.', '자리와 끼니를 내어 줌.'], `${esc(S.sur)}씨 서고`, 'min(40vh,280px)');
function showBang(){
  openOv('<h3>방 종이</h3>방(榜)을 써 붙일 종이와 붓. 한서진이 문 곁에 두고 간 것이다.<br>한 장에는 벌써 글이 적혀 있다. 한서진의 글씨다.' + bangHtml().replace('<h3>방(榜)</h3>', '')
    + '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bBang" style="color:var(--ink);border-color:#00000066">대문에 붙인다</button></div>');
  document.getElementById('bBang').addEventListener('click', ev => {
    ev.stopPropagation(); S.bangAt = Date.now(); save(); ov.classList.add('hidden'); sPlace();
    setTimeout(() => { noise(0.4, 180, 0.12, 'lowpass'); }, 600);                                     // 벽 너머에서 무언가 끄는 소리
    setTimeout(() => queueOv('<h3>서고</h3>방을 붙이고 돌아오니, 서고 왼쪽 벽에 문이 하나 있다.<br>별채로 이어지는 문이다.<br><br>전에도 있었던 것 같다.'), 1400);
  });
}
const letterOf = k => `<h3>편지 — ${STAFF[k].name}</h3>` + vlet([`${esc(S.sur)}씨 가문 서고에 올립니다.`, '', ...STAFF[k].letter], `${STAFF[k].name}(${STAFF[k].hj}) 올림.`);
const replyOf = k => `<h3>답장</h3>` + vlet([`${STAFF[k].name} 님께.`, '', ...STAFF[k].reply], `${esc(S.sur + S.name)}`, 'min(40vh,280px)');
function readApplicant(k){
  if (!k) return;
  stOf(k).read = true; save();
  const fd = freeDesk();
  openOv(letterOf(k) + (fd ? '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bReplyA" style="color:var(--ink);border-color:#00000066">답장을 쓴다</button></div>'
    : '<div style="font-size:13px;opacity:.7;margin-top:12px;text-align:center">답장을 쓰려면 앉을 자리가 있어야 한다.<br>별채에 빈 책상이 없다.</div>'));
  const b = document.getElementById('bReplyA'); if (b) b.addEventListener('click', ev => { ev.stopPropagation();
    openOv(replyOf(k) + '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bSendA" style="color:var(--ink);border-color:#00000066">보낸다</button></div>');
    document.getElementById('bSendA').addEventListener('click', e2 => { e2.stopPropagation();
      const s = stOf(k); s.replied = true; s.desk = freeDesk(); s.item = 'first'; s.due = Date.now() + 6000; save(); ov.classList.add('hidden'); sPlace();
      if (typeof tlog === 'function') tlog('답장 보냄: ' + STAFF[k].name);
    });
  });
}
function showRoster(){
  const names = [];
  if (S.rArrived) names.push(['한서진', '韓瑞眞', '해독가']);
  for (const k of SKEYS) if (arrived(k)) names.push([STAFF[k].name, STAFF[k].hj, STAFF[k].job]);
  const n = names.length + 1;
  openOv(`<h3>명부 — ${KNUM[n] || n}</h3><div style="font-size:13px;opacity:.7;margin-bottom:8px">별채에 드나드는 사람을 적는 명부. 첫 장은 한서진의 글씨다.</div>`
    + names.map((x, i) => `${i+1}. ${x[0]}(${x[1]}) — ${x[2]}`).join('<br>')
    + `<br>${n}. <span style="opacity:.55">${alienHtml(glyphs('누구인가', 77 + n))}</span> — <span style="opacity:.55">${alienHtml(glyphs('필경사', 91))}</span>`);
}
function staffDiary(k){ const s = S.st[k] || {}; return STAFF[k].diary.filter(d => (s.work||0) >= d[0]).map(d => d[1]); }
function showStaff(k){
  if (!k) return;
  const P = STAFF[k], s = stOf(k);
  if (!arrived(k)){ openOv(`<h3>별채 책상</h3>${P.name}의 자리를 마련해 두었다. 아직 오지 않았다.`); return; }
  if (!present(k)){ openOv(`<h3>${P.name}의 자리</h3>밤이다. ${P.name}은 집에 갔다.<br>해가 뜨면 온다.`); return; }
  const rf = s.fear || 0, fac = rf > 0.7 ? 0.25 : rf > 0.35 ? 0.5 : 1, perMin = 60 / P.sec * fac;
  const speed = !working(k) ? (k === 'smw' ? '눈을 감고 쉬고 있다 — 해가 높다' : '쉬고 있다') : S.owned.sundial
    ? `1분에 ${fmtP(Math.round(perMin))} — ${fac === 1 ? '평소대로' : fac === 0.5 ? '평소의 절반' : '평소의 4분의 1'}`
    : fac === 1 ? '또박또박 넘긴다' : fac === 0.5 ? '손이 떨려 느릿느릿 넘긴다' : '책장을 붙잡고 거의 넘기지 못한다';
  const st = rf > 0.7 ? '간이 콩알만 해짐 — 손이 떨려 책장을 거의 넘기지 못한다' : rf > 0.35 ? '간이 콩알만 해짐 — 손이 떨린다' : '평온함';
  const o = (id, label) => `<span data-cp="${id}" class="${s.item === id ? 'on' : ''}">${label}</span>`;
  const dl = staffDiary(k);
  openOv(`<h3>연구원 — ${P.name}(${P.hj})</h3>직업: ${P.job}<br>상태: ${st}<br>읽는 빠르기: ${speed}<br>넘긴 것: ${fmtP(s.pages||0)}<br><div style="font-size:12px;opacity:.6">${P.note}</div>`
    + (S.teaArrived ? `<div style="text-align:center;margin:8px 0"><button class="btn rec" id="bSTea" style="color:var(--ink);border-color:#00000066">차를 한 잔 내준다</button></div>` : '')
    + `<div class="opt rec"><span>읽을 사본</span><span class="ch">${o('first', '제목 없는 책')}${o('dongui', '동의보감 三')}${S.mapFound ? o('map', '지도') : ''}</span></div>`
    + '<div style="font-size:12px;opacity:.6">서고의 책을 베껴 둔 사본이라, 같은 책을 여럿이 읽을 수 있다.</div>'
    + `<br><b>일지</b>` + (dl.length ? dl.map((d, i) => `<div class="rec dlist" data-d="${i}"><span>일지 ${i+1} — ${esc(d.split('.')[0])}</span><span style="opacity:.45;font-size:12px">읽기</span></div>`).join('') : '<br>아직 쓴 것이 없다.'));
  const bt = document.getElementById('bSTea'); if (bt) bt.addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); s.steam = Date.now() + 3000; s.calm = Date.now() + 48000; save(); sBoil(); });
  ovBody.querySelectorAll('[data-cp]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); s.item = el.dataset.cp; save(); sPlace(); showStaff(k); }));
  ovBody.querySelectorAll('.dlist').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const i = +el.dataset.d;
    openOv(`<h3>${P.name}의 일지 ${i+1}</h3>${staffDiary(k)[i]}<div class="rec" id="bBackS" style="margin-top:14px;text-align:center">← 목록으로</div>`);
    document.getElementById('bBackS').addEventListener('click', e2 => { e2.stopPropagation(); showStaff(k); }); }));
}
function readGo(){
  S.goRead = true; save();
  openOv('<h3>쪽지</h3>' + vlet(['가주께.', '사람이 늘었습니다.', '명우 씨는 밤을 맡고', '정림 씨는 차를 맡아 주니', '이제 바닷가에 가 볼 수 있겠습니다.', '날을 잡아 주십시오.'], '한서진 올림.'),
    () => { setTimeout(() => document.getElementById('endnote').style.opacity = 1, 1500); });
  if (typeof tlog === 'function') tlog('체험판 끝 쪽지');
}
function labRecs(recs){
  if (S.bangAt) recs.push(['방(榜)', bangHtml]);
  for (const k of SKEYS){ const s = S.st[k]; if (!s) continue;
    if (s.read) recs.push([`편지 — ${STAFF[k].name}`, () => letterOf(k)]);
    if (s.replied) recs.push([`답장 — ${STAFF[k].name}`, () => replyOf(k)]);
    if (staffDiary(k).length) recs.push([`${STAFF[k].name}의 일지`, () => `<h3>${STAFF[k].name}의 일지</h3>` + staffDiary(k).map(d => `<div style="margin:8px 0">${d}</div>`).join('')]);
  }
  if (S.goRead) recs.push(['쪽지 — 한서진 (사람이 늘었습니다)', () => '<h3>쪽지</h3>가주께. 사람이 늘었습니다. 명우 씨는 밤을 맡고 정림 씨는 차를 맡아 주니 이제 바닷가에 가 볼 수 있겠습니다. 날을 잡아 주십시오. — 한서진']);
}
function labNews(){
  const n = [];
  if (S.helpRead && !S.bangAt) n.push('bang');
  if (S.bangAt) n.push('labdoor');
  for (const k of SKEYS){ const s = S.st[k]; if (!s) continue; if (s.at) n.push('al:' + k); if (s.arr) n.push('arr:' + k); }
  for (const d of Object.keys(LAB_DESKS)) if (!S.owned[d] && S.pages >= DESK_COST[d] && S.bangAt) n.push('buy:' + d);
  if (S.goNote) n.push('go');
  return n;
}

// 매 순간: 편지 도착 → 연구원 도착 → 일 → 다원지기의 차 → 마지막 쪽지
let lastTeaRound = 0;
function labTick(dt){
  if (!S.bangAt) return;
  const now = Date.now(), smw = stOf('smw'), ojr = stOf('ojr');
  if (!smw.at && now >= S.bangAt + 45000){ smw.at = now; save(); noise(0.12, 110, 0.4, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.35, 'lowpass'), 260); }
  if (!ojr.at && smw.arr && now >= Math.max(S.bangAt + 120000, smw.arr + 60000)){ ojr.at = now; save(); noise(0.12, 110, 0.4, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.35, 'lowpass'), 260); }
  for (const k of SKEYS){
    const s = S.st[k];
    if (s && s.replied && !s.arr && now >= s.due){
      s.arr = now; s.work = 0; s.pages = 0; s.fear = 0; save();
      const v = S.scene === 'lab' ? 1 : 0.35;                                                          // 서고에 있으면 벽 너머로 희미하게
      noise(0.12, 110, 0.4*v, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.35*v, 'lowpass'), 260);
      for (let t = 300; t < WALK_MS; t += 560) setTimeout(() => noise(0.08, 220, 0.16*v, 'lowpass'), t);
      setTimeout(() => noise(0.5, 320, 0.12*v, 'lowpass'), WALK_MS + 50);
      setTimeout(() => noise(0.45, 300, 0.1*v, 'lowpass'), T_SIT + 50);
      if (typeof tlog === 'function') tlog('도착: ' + STAFF[k].name);
    }
    if (!s || !working(k)) continue;
    if (now < (s.steam||0)) s.fear = Math.max(0, (s.fear||0) - dt*0.25);
    else s.fear = Math.min(1, (s.fear||0) + dt*0.006*STAFF[k].fearK*(now < (s.calm||0) ? 0.3 : 1));
    const fac = s.fear > 0.7 ? 0.25 : s.fear > 0.35 ? 0.5 : 1;
    s.work = (s.work||0) + dt; s.acc = (s.acc||0) + dt*fac;
    while (s.acc >= STAFF[k].sec){ s.acc -= STAFF[k].sec; S.pages += 1; S.earned += 1; addBook(s.item || 'first', mult()); s.pages = (s.pages||0) + 1; }
  }
  // 다원지기: 낮 동안 1분 30초마다 떨고 있는 사람에게 차를 내줌
  if (working('ojr') && now - lastTeaRound > 90000){
    lastTeaRound = now; let gave = false;
    if (S.rArrived && !isNight() && (S.rFear||0) > 0.4){ S.rSteam = now + 3000; S.rCalm = now + 48000; gave = true; }
    for (const k of SKEYS) if (k !== 'ojr' && working(k) && (S.st[k].fear||0) > 0.4){ S.st[k].steam = now + 3000; S.st[k].calm = now + 48000; gave = true; }
    if (gave){ save(); if (S.scene === 'lab') sBoil(); }
  }
  if (!S.goNote && ojr.arr && now - ojr.arr > 60000){ S.goNote = true; save(); }
}
// 자리를 비운 동안: 서명우는 밤 시간, 오정림은 낮 시간만 (한서진과 같이 30%)
function labOffline(){
  const out = [];
  if (!S.lastSeen || Date.now() - S.lastSeen < 180e3) return out;
  const now = Date.now(), from = Math.max(S.lastSeen, now - 8*3600e3);
  let daySec = 0, nightSec = 0;
  for (let t = from; t < now; t += 60e3){ const d = Math.min(60, (now - t)/1000); if (isNight(new Date(t))) nightSec += d; else daySec += d; }
  for (const k of SKEYS){
    const s = S.st[k]; if (!s || !s.arr) continue;
    const sec = k === 'smw' ? nightSec : daySec; if (sec <= 0) continue;
    const n = Math.floor(sec / STAFF[k].sec * 0.3); if (!n) continue;
    s.work = (s.work||0) + sec; s.fear = Math.max(s.fear||0, 0.4); S.pages += n; S.earned += n; addBook(s.item || 'first', n*mult()); s.pages = (s.pages||0) + n;
    out.push(k === 'smw'
      ? '<h3>쪽지</h3>' + vlet(['가주께.', `밤사이 ${fmtP(n)}을 넘겼습니다.`, '하늘은 맑았습니다.', isNight() ? '이상 없음. ✶' : '해가 뜨기에 눈을 감았습니다. ✶'], '서명우 올림.', 'min(44vh,320px)')
      : '<h3>쪽지</h3>' + vlet(['가주께.', `안 계신 동안 ${fmtP(n)}을 읽었습니다.`, '차는 넉넉히 끓여 두었습니다.', '서진 씨가 두 잔, 명우 씨가 한 잔 마셨습니다.'], '오정림 올림.', 'min(44vh,320px)'));
  }
  return out;
}
