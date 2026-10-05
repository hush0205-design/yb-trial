'use strict';
// ───────── 별채 연구실·사람 늘리기 (기획서 14·14-1절) ─────────
// 한서진의 부탁 쪽지 → 방(榜) 종이 → 대문에 붙이면 서고 왼쪽 벽에 별채 문
// → 일반 연구원들이 먼저 찾아와 자리를 채움(지원서 두세 줄, 받아들이거나 돌려보냄)
// → 둘쯤 자리를 잡으면 서명우(관측사), 사람들이 겁에 질리기 시작하면 오정림(다원지기) → 한서진의 마지막 쪽지
// 별채에 빈 책상이 있어야 사람을 받을 수 있음(책상은 권 단위).
let sceneAt = -1e9;
S.st = S.st || {};
const LAB_DOOR = [-27, -22];
const LAB_DESKS = { ld1:[-30, 6], ld2:[-15, 6], ld3:[0, 6], ld4:[15, 6], ld5:[30, 6] };
const DESK_COST = { ld1:100, ld2:150, ld3:250, ld4:400, ld5:600 };
const TEA_T = [32, -20];   // 별채 다탁 자리
const GEN_MAX = 3;   // 체험판에서 받는 일반 연구원 수(남은 두 자리는 메인 몫)
const KNUM = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟'];

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
M.ldesk = model(12,8,12,(x,y,z)=>{                       // 별채 책상: 의자에 앉아 쓰는 높이, 벼루 하나
  if (z===11){ if (x>=8 && x<=9 && y>=2 && y<=3) return y===2 ? '#2a2a2e' : '#141416'; return null; }
  if (z===10) return '#55361f';
  if (z===9 && (y===0 || y===7)) return '#3a2414';
  if ((x<=1||x>=10) && (y<=1||y>=6)) return '#3a2414';
  return null; });

// 메인 연구원(반장): 견본이 있는 사람들
const STAFF = {
  smw: { name:'서명우', hj:'徐明雨', job:'관측사', sec:4, fearK:1.5, shadow:true,
    note:'밤에만 일한다. 해가 높으면 눈을 감고 쉰다.',
    letter:['저는 하늘을 보는 일을 해 온 사람입니다.', '별의 자리를 적고, 달라진 것이 있으면 아룁니다.', '대문에 붙은 방을 보았습니다.', '다만 지금은 별을 볼 때가 아닙니다.', '하늘이 달라지면 찾아뵙겠습니다.'],
    later:true,   // 1대엔 편지만 — 관측 단계에 옴(기획서 14절, 10/4)
    reply:['오시오.', '별채에 자리를 마련해 두었소.', '밤에만 일해도 좋소.'],
    diary:[[60, '이경(밤 열 시쯤). 동쪽 하늘 맑음. 늘 보던 별들. 이상 없음. ✶'],
           [240, '오시(한낮). 해를 오래 보지 말라고 배웠다. 눈이 시려 감았다. 감으니 편하다. ✶'],
           [600, '삼경. 지도에 없는 자리가 하나 비어 있는 것 같다. 기분 탓이다. ✶']] },
  ojr: { name:'오정림', hj:'吳貞林', job:'다원지기', sec:8, fearK:0.5,
    note:'차를 끓여 사람들을 챙긴다. 글은 천천히 읽는다. 밤에는 집에 간다.',
    letter:['방을 보고 왔습니다.', '글은 더디게 읽지만 차는 잘 끓입니다.', '서고에 계신 분들이 잠을 못 이룬다는 말을 들었습니다.', '우리 집은 불씨를 꺼뜨린 적이 없습니다.'],
    reply:['오시오.', '별채에 자리를 마련해 두었소.', '차를 부탁하오.'],
    diary:[[60, '찻잎이 연하게 올라왔다. 우리 서고 사람들 요즘 잠을 못 잔다. 오늘은 넉넉히 끓였다.'],
           [240, '서진 씨가 두 잔 마셨다. 손이 떨려서 잔을 잡아 주었다. 별채 사람들 몫으로 한 주전자를 더 끓였다.'],
           [600, '아궁이 불이 좋다. 불씨는 내가 지킨다. 우리 집은 불씨를 꺼뜨린 적이 없다.']] },
};
// 일반 연구원: 이름·성격·차림을 조합해 만듦(일지는 쓰지 않음)
// 이름·성격: 일반 연구원 글 모음.md (페이블 v1, 10/5 체험판에 넣음 — 성격 15번 '두 장'은 아직)
const G_SUR = [['박','朴'],['최','崔'],['정','鄭'],['강','姜'],['윤','尹'],['장','張'],['신','申'],['권','權'],['황','黃'],['송','宋'],['홍','洪'],['임','任'],
  ['조','趙'],['유','柳'],['안','安'],['전','全'],['고','高'],['문','文'],['백','白'],['허','許']];
const G_NAME_M = [['덕수','德洙'],['만복','萬福'],['기남','基男'],['영길','永吉'],['춘보','春甫'],['치문','致文'],['학규','學奎'],['상렬','相烈'],
  ['인수','仁壽'],['복동','福童'],['천석','千石'],['명보','明甫'],['수길','壽吉'],['재형','載亨'],['광록','光祿'],['칠성','七星'],['도명','道明'],['원기','元基'],
  ['창오','昌五'],['봉학','鳳學'],['태완','泰完'],['응삼','應三'],['석주','錫周'],['치영','致永'],['윤보','允甫'],['득룡','得龍'],['사문','士文'],['억만','億萬']];
const G_NAME_F = [['문옥','文玉'],['봉이','鳳伊'],['순덕','順德'],['막례','莫禮'],['금례','金禮'],['분이','分伊'],['옥단','玉丹'],['연화','蓮花'],['복례','福禮'],
  ['춘심','春心'],['월매','月梅'],['명심','明心'],['간난','艱難'],['유월','六月']];
// w = 그냥 방에 오는 잦기(3·5·8·12가 잦고, 조금 이상한 13·14는 드묾)
const G_TRAIT = [
  { w:1, lines:['남의 글을 베껴 먹고살았습니다. 손은 빠릅니다.', '다만 어두운 데서 글자가 움직이는 것처럼 보일 때가 있어, 등잔은 밝게 켜 주시면 좋겠습니다.'], sec:3.5, fearK:1.6, note:'손이 빠르다. 겁이 많다. 등잔을 밝게 켠다.' },
  { w:1, lines:['장터에서 셈을 보던 사람입니다. 글은 더딥니다.', '사람 많은 데서 밤낮으로 장부를 봤으니, 책 몇 권에 놀랄 일은 없겠습니다.'], sec:6, fearK:0.5, note:'글이 느리다. 겁이 없다.' },
  { w:3, lines:['서당에서 아이들을 가르쳤습니다. 글은 또박또박 읽습니다.', '집에 어린것들이 있어 해 지기 전에는 돌아가야 합니다. 그 점만 헤아려 주십시오.'], sec:4, fearK:1, early:true, note:'해 지기 전에 집에 간다. 글씨가 단정하다.' },
  { w:1, lines:['어릴 때부터 잠이 없는 사람입니다. 누우면 천장만 보다 날이 밉니다.', '그 시간에 글을 읽는 게 낫겠습니다. 밤에도 일하겠습니다.'], sec:5, fearK:1.2, night:true, note:'밤낮없이 일한다.' },
  { w:3, lines:['방을 보고 왔습니다. 글도 읽고, 물도 긷고, 심부름도 합니다.', '시키시는 일은 무엇이든 하겠습니다.'], sec:4.5, fearK:1, note:'시키는 일은 무엇이든 한다.' },
  { w:1, lines:['잠이 얕아 밤에 몇 번씩 깹니다. 깬 김에 글을 보겠습니다.', '등잔 기름은 제가 보겠습니다. 꺼진 불을 두고 보지 못하는 성미입니다.'], sec:5, fearK:1.1, night:true, note:'밤에 자주 깬다. 등잔을 지킨다.' },
  { w:1, lines:['눈이 어두워 돋보기를 끼고 글자를 하나씩 봅니다. 그래서 느립니다.', '대신 멀리 있는 것은 보이지 않으니 놀랄 일도 적습니다.'], sec:5.5, fearK:0.8, note:'눈이 어둡다. 돋보기를 쓴다.' },
  { w:3, lines:['차는 마시지 않습니다. 속이 받지 않아 물만 먹습니다.', '찻잔은 돌려보내도 섭섭히 여기지 말아 주십시오. 일은 남만큼 합니다.'], sec:4.5, fearK:1, tea:false, note:'차를 마시지 않는다. 물만 먹는다.' },
  { w:1, lines:['사람 곁에 있으면 글이 눈에 안 들어옵니다. 구석 자리를 주시면 좋겠습니다.', '혼자 두시면 빨리 읽습니다. 말은 없는 편입니다.'], sec:3.8, fearK:1.4, note:'혼자 있기를 좋아한다. 구석 자리.' },
  { w:1, lines:['손이 빠르다는 말은 들었습니다. 입도 빠르다는 말을 더 듣습니다.', '옆 사람이 떨고 있으면 말을 걸어 주는 편입니다. 시끄럽다 하시면 줄이겠습니다.'], sec:3.8, fearK:1.2, note:'말이 많다. 옆 사람이 덜 떤다.' },
  { w:1, lines:['갈두포 쪽에서 자랐습니다. 어릴 때부터 물에 들어 숨을 오래 참습니다.', '글은 보통입니다. 바닷가 심부름이 있으면 그것도 하겠습니다.'], sec:5, fearK:0.4, note:'물가 사람. 숨을 오래 참는다.' },
  { w:3, lines:['글자 하나 틀린 것을 못 넘기는 성미라, 한 장을 두 번씩 읽습니다. 그래서 느립니다.', '대신 베낀 책과 원본이 다른 데가 있으면 반드시 찾아냅니다.'], sec:6.5, fearK:1, note:'꼼꼼하다. 느리다. 어긋난 글자를 찾는다.' },
  { w:0.5, lines:['저희 할아버지가 이 댁 서고에서 글을 베끼셨다 합니다. 밤에 쓰셨다 들었습니다.', '서고 문이 닫힌 뒤로 집안이 조용했는데, 다시 열렸다니 가 보라 하셔서 왔습니다.'], sec:4, fearK:0.9, night:true, note:'집안이 이 서고와 인연이 있다 한다. 밤에 쓴다.' },
  { w:0.5, lines:['방을 보았는지는 잘 모르겟습니다. 그런데 이 집까지 오는 길을 알고 있었습니다.', '무서운 것은 없습니다. 아무것도 무섭지 않습니다. 글을 읽게 해 주십시오.'], sec:4, fearK:0.3, note:'겁이 없다. 길을 알고 있었다 한다.' },
];
const G_W = G_TRAIT.reduce((a, t) => a + t.w, 0);
const G_ROBE = [['#ece6d6','#ddd5c0','#bfb59e'], ['#e0dccf','#cfc9b8','#aea896'], ['#d8dccd','#c7ccbb','#a6ab99'], ['#e6dccb','#d6c9b2','#b5a68c'], ['#d6dde2','#c4ccd2','#a3adb5']];
const G_BELT = [['#5a5a5a','#3a3a3a'], ['#7a5a3a','#5a3e24'], ['#3e5a52','#2a403a'], ['#6a4a5a','#4a3040'], ['#4a4a6a','#30304a']];
const G_SKIRT = [['#7a5a4a','#6a4a3c','#523a2e'], ['#6a7a5a','#5a6a4c','#46543a'], ['#6d5f7d','#5c4f6b','#463c54']];
const GDEF = {};
function mulberry(a){ let t = a >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let x = Math.imul(t ^ t >>> 15, 1 | t); x ^= x + Math.imul(x ^ x >>> 7, 61 | x); return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
function genDef(k){
  if (GDEF[k]) return GDEF[k];
  const n = +k.slice(1), r = mulberry(n*2654435761 + 977), f = r() < 0.3;   // 고르게 섞이는 난수(전의 rng는 일곱 사람마다 같은 무늬가 돌았음)
  const su = G_SUR[(n*7 + Math.floor(r()*G_SUR.length)) % G_SUR.length], NM = f ? G_NAME_F : G_NAME_M, nm = NM[(n*3 + Math.floor(r()*NM.length)) % NM.length];
  let x = r()*G_W, tr = G_TRAIT[0]; for (const t of G_TRAIT){ if ((x -= t.w) < 0){ tr = t; break; } }
  const look = f ? { skirt: G_SKIRT[Math.floor(r()*3)], jeo: ['#e6d7b4','#e8e0cc','#dcd6c0'][Math.floor(r()*3)] }
                 : { robe: G_ROBE[Math.floor(r()*5)], belt: G_BELT[n%5][0], belt2: G_BELT[n%5][1], hat: ['gat','tang','sangtu'][Math.floor(r()*3)] };
  return (GDEF[k] = { gen:true, f, name: su[0] + nm[0], hj: su[1] + nm[1], job:'해독가', sec: tr.sec, fearK: tr.fearK, night: !!tr.night, early: !!tr.early, tea: tr.tea !== false, note: tr.note, lines: tr.lines, look });
}
const DEF = k => STAFF[k] || genDef(k);
const isGen = k => k[0] === 'g';
const allKeys = () => ['smw', 'ojr', ...Object.keys(S.st).filter(isGen)];
const genKeys = () => Object.keys(S.st).filter(isGen);
const stOf = k => (S.st[k] = S.st[k] || {});
const arrived = k => !!(S.st[k] && S.st[k].arr);
const dusk = () => { const h = gameHour(); return h >= 18 && h < 22; };
const present = k => arrived(k) && !S.st[k].gone && (k === 'smw' || DEF(k).night || (!isNight() && !(DEF(k).early && dusk())));   // 해 지기 전에 가는 사람은 노을이 들면 먼저 감    // 서명우는 늘 있음(낮엔 눈을 감고 쉼), 밤일 하는 이도 늘 있음
const working = k => arrived(k) && Date.now() - S.st[k].arr > T_PUSH && (k === 'smw' ? isNight() : present(k));
const deskOwner = d => allKeys().find(k => S.st[k] && S.st[k].desk === d && !S.st[k].gone) || null;
const freeDesk = () => Object.keys(LAB_DESKS).find(d => S.owned[d] && !deskOwner(d)) || null;
const curApplicant = () => allKeys().filter(k => S.st[k] && S.st[k].at && !S.st[k].replied && !S.st[k].gone && !(STAFF[k] && STAFF[k].later && S.st[k].read)).sort((a, b) => S.st[a].at - S.st[b].at)[0] || null;

// 별채의 길: 문 → 책상 옆 → 의자를 빼고 앉음 (한서진과 같은 몸짓, 책상 자리만 다름)
function labPath(e, d){
  const [dx, dy] = LAB_DESKS[d], SIDE = [dx + 6.5, dy - 10.5], CIN = dy - 7, COUT = dy - 10.4;
  const dir = (ax, ay, bx, by) => { const l = Math.hypot(bx-ax, by-ay) || 1; return [(bx-ax)/l, (by-ay)/l]; };
  if (e < WALK_MS){ const t = e / WALK_MS; return { x: lerp(LAB_DOOR[0], SIDE[0], t), y: lerp(LAB_DOOR[1], SIDE[1], t), pose:'walk', chair: CIN, f: dir(...LAB_DOOR, ...SIDE) }; }
  if (e < T_PULL)  return { x: SIDE[0], y: SIDE[1], pose:'stand', f:[-1, 0], chair: lerp(CIN, COUT, (e - WALK_MS) / (T_PULL - WALK_MS)) };
  if (e < T_STEP){ const t = (e - T_PULL) / (T_STEP - T_PULL); return { x: lerp(SIDE[0], dx, t), y: lerp(SIDE[1], COUT + 1.6, t), pose:'walk', f: dir(SIDE[0], SIDE[1], dx, COUT + 1.6), chair: COUT }; }
  if (e < T_SIT)   return { x: dx, y: COUT + 1.6, pose:'stand', f:[0, 1], chair: COUT };
  const t = (e - T_SIT) / (T_PUSH - T_SIT);
  return { x: dx, y: lerp(COUT + 1.2, CIN + 1.2, t), pose:'sit', f:[0, 1], chair: lerp(COUT, CIN, t) };
}
function staffState(k){
  const s = S.st[k], p = (typeof errPos === 'function' && errPos(k)) || labPath(Date.now() - s.arr, s.desk);
  if (k === 'smw' && p.pose === 'sit' && !isNight()) p.closed = true;
  if (p.pose === 'sit' && !S.errs[k] && typeof fearStage === 'function' && fearStage(s.fear) === 5){ p.y -= SIT_BACK; p.chair -= SIT_BACK; }   // 5단계: 의자를 뒤로 빼고 앉음     // 해가 높으면 눈을 감음
  return p;
}

// 다원지기 종이 인형: 쪽진 머리에 비녀, 소매 걷은 저고리, 쪽빛 치마, 흰 앞치마
function drawWoman(pose, back, o = {}){
  const W = 48, H = pose === 'sit' ? 78 : 98, sit = pose === 'sit', sway = pose === 'a' ? -1.2 : pose === 'b' ? 1.2 : 0;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const path = (pts, fill, stroke) => { g.beginPath(); pts(g); g.closePath(); if (fill){ g.fillStyle = fill; g.fill(); } if (stroke){ g.strokeStyle = stroke; g.lineWidth = 0.8; g.stroke(); } };
  const skirt = g.createLinearGradient(6, 0, 44, 0); const SK = o.skirt || ['#5d6b88', '#4d5a76', '#3a4560']; skirt.addColorStop(0, SK[0]); skirt.addColorStop(0.6, SK[1]); skirt.addColorStop(1, SK[2]);
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
  const jeo = o.jeo || '#e6d7b4', FR = o.fear || 0;
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
    g.strokeStyle = '#3a2a20'; g.lineWidth = 0.7; g.beginPath();
    if (FR){ const u = FR === 2 ? 1.2 : 0.7; g.moveTo(19.4, 25.5); g.quadraticCurveTo(20.9, 25.3 - u*0.4, 22.4, 25.2 - u); g.moveTo(25.6, 25.2 - u); g.quadraticCurveTo(27.1, 25.3 - u*0.4, 28.6, 25.5); }
    else { g.moveTo(19.4, 25.4); g.quadraticCurveTo(20.9, 24.8, 22.4, 25.3); g.moveTo(25.6, 25.3); g.quadraticCurveTo(27.1, 24.8, 28.6, 25.4); }
    g.stroke();   // 눈썹
    if (FR === 2) fearEyes(g, 20.9, 27.1, 27.4);
    else { g.fillStyle = '#1a1410'; g.beginPath(); g.ellipse(20.9, 27.4, 1.15, 0.6, 0, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(27.1, 27.4, 1.15, 0.6, 0, 0, Math.PI*2); g.fill(); }
    g.strokeStyle = '#b48a66'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(24, 27.8); g.quadraticCurveTo(23.4, 30.2, 24.5, 30.6); g.stroke();
    if (FR) fearMouth(g, FR, 24, 32.6); else { g.strokeStyle = '#a05a4a'; g.lineWidth = 1; g.beginPath(); g.moveTo(22.8, 32.6); g.quadraticCurveTo(24, 33.2, 25.2, 32.6); g.stroke(); }
    if (FR) fearSweat(g, FR, 17.6, 30.4, 23);
  }
  return c;
}
const SMW_O = { robe:['#e4e9e7', '#d1dad7', '#a9b8b4'], belt:'#6a3a4a', belt2:'#4a2434', closable:true };   // 옥색 도포, 자줏빛 세조대
const DOLLS = {};
function dollFor(k){
  if (DOLLS[k]) return DOLLS[k];
  const P = DEF(k);
  const sets = k === 'smw' ? dollSet(drawSeonbi, SMW_O) : k === 'ojr' ? dollSet(drawWoman) : dollSet(P.f ? drawWoman : drawSeonbi, P.look);
  return (DOLLS[k] = { id:'d_' + k, doll:true, shadow: k === 'smw', img: sets[0], imgL: sets,
    st:()=>staffState(k), fear:()=>stOf(k).fear || 0, steam:()=>stOf(k).steam || 0, arrT:()=>stOf(k).arr || 0,
    show:()=>present(k), click:()=>showStaff(k) });
}
const labDolls = () => allKeys().filter(arrived).map(dollFor);
const ALL_DOLLS = () => [SJ, ...labDolls(), ...(typeof gateDolls === 'function' ? gateDolls() : [])];
// 심부름 중인 사람은 지금 가 있는 방에 보임(16_errand)
const dollScene = D => (typeof errScene === 'function' && errScene(D.id === 'sj' ? 'sj' : D.id.slice(2))) || (D.id === 'sj' ? 'seogo' : 'lab');
const curDolls = () => S.scene === 'gate' ? gateDolls() : [SJ, ...labDolls()].filter(D => dollScene(D) === S.scene);

// 별채의 물건
const LAB_OBJ = [
  { id:'labBack', x:LAB_DOOR[0], y:-25.5, m:()=>'door', click:()=>goScene('seogo') },
  { id:'labWin', x:15, y:-26, z:8, rot:0, m:()=>'__win', click:()=>openOv(`<h3>창</h3>${daylight() >= 0.8 ? '창호지가 환하다. 낮이다.' : daylight() > 0 ? '창호지가 누렇게 물들었다. 해가 걸려 있다.' : '창호지가 어둡다. 밤이다.'}<br><br>별채의 창은 서고의 창보다 조금 크다.`) },
  { id:'roster', x:-8, y:-24, z:6, rot:0, m:()=>'roster', click:()=>showRoster() },
];
const DESK_IDS = Object.keys(LAB_DESKS);
for (const [d, [dx, dy]] of Object.entries(LAB_DESKS)){
  const prev = DESK_IDS[DESK_IDS.indexOf(d) - 1];
  const who = () => { const k = deskOwner(d); return k && arrived(k) ? k : null; };
  LAB_OBJ.push({ id:d, x:dx, y:dy, rot:0, m:()=>'ldesk', buy:{ cost:DESK_COST[d], name:'별채 책상' }, show:()=> !prev || !!S.owned[prev],
    click:()=>{ const k = who(); if (k) showStaff(k); else showItem(d); } });
  LAB_OBJ.push({ id:'c_' + d, x:dx, get y(){ const k = who(); return k ? staffState(k).chair : dy - 7; }, rot:0, m:()=>'chair', show:()=>!!S.owned[d] });
  LAB_OBJ.push({ id:'i_' + d, x:dx - 2, y:dy, z:11, rot:0, on:()=>d, m:()=> itemModel(S.st[who()].item), show:()=>{ const k = who(); return !!k && !!S.st[k].item; }, click:()=>showStaff(who()) });
  LAB_OBJ.push({ id:'t_' + d, x:dx + 3.5, y:dy + 1.5, z:11, rot:0, on:()=>d, onOrder:0.02, m:()=>'cup', show:()=>{ const k = who(); return !!k && present(k) && Date.now() < (S.st[k].calm||0); }, alpha:()=> cupAlpha(S.st[who()].calm), click:()=>showStaff(who()) });
}
const curObjs = () => S.scene === 'lab' ? LAB_OBJ : S.scene === 'gate' ? GATE_OBJ : OBJ;
const DESK_TXT = { ld1:'의자 다리 하나가 조금 짧다.', ld2:'들인 지 하루도 안 됐는데 먹 자국이 있다.', ld3:'책상 밑에 붓 한 자루가 떨어져 있다. 우리 서고의 붓이 아니다.', ld4:'앉으면 창이 정면으로 보인다. 밤에는 창에 비친 얼굴이 하나 더 있다.', ld5:'아무도 앉지 않았는데 의자가 조금 빠져 있다.' };
for (const d of DESK_IDS) ITEM[d] = ['별채 책상', '별채에 들인 책상과 의자. 연구원 한 사람이 앉을 자리다.<br>서고의 책을 베껴 둔 사본을 놓고 읽는다.<br><br>' + DESK_TXT[d]];

// 서고에 생기는 것: 방 종이, 별채 문, 지원서·편지
OBJ.push(
  { id:'bang', x:21, y:-18, m:()=>'bangRoll', show:()=> !!S.helpRead && !S.bangAt, click:()=>showBang(), glow:()=>true },
  { id:'labDoor', x:-37.5, y:2, rot:Math.PI/2, m:()=>'door', show:()=>reveal('labDoor', !!S.bangAt), click:()=>goScene('lab'), glow:()=>!S.labSeen },
  { id:'aletter', x:24, y:-11, m:()=>'letter', show:()=>{ const k = curApplicant(); return !!k && reveal('al_' + k, true); }, click:()=>readApplicant(curApplicant()), glow:()=>{ const k = curApplicant(); return !!k && !S.st[k].read; } },
);
function goScene(sc){
  if (sc === 'lab') S.labSeen = true;
  S.scene = sc; save(); sceneAt = performance.now();
  noise(0.35, 240, 0.12, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.3, 'lowpass'), 300);   // 문 여닫는 소리
  if (typeof tlog === 'function') tlog(sc === 'lab' ? '별채로 감' : sc === 'gate' ? '대문으로 나감' : '서고로 돌아옴');
  if (sc === 'seogo' && S.bangAt && !S.labDoorNoted && !S.labSeen){ S.labDoorNoted = true; save();
    setTimeout(() => queueOv('<h3>서고</h3>방을 붙이고 돌아오니, 서고 왼쪽 벽에 문이 하나 있다.<br>별채로 이어지는 문이다.<br><br>전에도 있었던 것 같다.'), 900); }
}
const knock = (v = 1) => { noise(0.12, 110, 0.4*v, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.35*v, 'lowpass'), 260); };

// 기록들
const vlet = (lines, sign, h = 'min(52vh,380px)') => `<div class="vletter rec" style="height:${h}">${lines.join('<br>')}<div class="sign">${sign}</div></div>`;
const bangHtml = () => `<h3>방(榜)</h3>` + vlet(['서고에서 글 읽을 사람을 구함.', '밤낮을 가리지 않음.', '자리와 끼니를 내어 줌.'], `${esc(S.sur)}씨 서고`, 'min(40vh,280px)');
function showBang(){
  openOv('<h3>방 종이</h3>방(榜)을 써 붙일 종이와 붓. 한서진이 문 곁에 두고 간 것이다.<br>한 장에는 벌써 글이 적혀 있다. 한서진의 글씨다.' + bangHtml().replace('<h3>방(榜)</h3>', '')
    + '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bBang" style="color:var(--ink);border-color:#00000066">대문에 붙인다</button></div>');
  document.getElementById('bBang').addEventListener('click', ev => {
    ev.stopPropagation(); S.bangAt = Date.now(); save(); ov.classList.add('hidden');
    goScene('gate');                                                                                   // 대문으로 나가 직접 붙임
    setTimeout(() => { noise(0.25, 900, 0.06); setTimeout(() => sPlace(), 250); }, 700);               // 풀칠하고 탁 붙이는 소리
    setTimeout(() => noise(0.4, 180, 0.12, 'lowpass'), 2200);                                          // 벽 너머에서 무언가 끄는 소리
    if (typeof tlog === 'function') tlog('방을 붙임');
  });
}
const letterOf = k => `<h3>편지 — ${STAFF[k].name}</h3>` + vlet([`${esc(S.sur)}씨 가문 서고에 올립니다.`, '', ...STAFF[k].letter], `${STAFF[k].name}(${STAFF[k].hj}) 올림.`);
const replyOf = k => `<h3>답장</h3>` + vlet([`${STAFF[k].name} 님께.`, '', ...STAFF[k].reply], `${esc(S.sur + S.name)}`, 'min(40vh,280px)');
const genLetter = k => { const P = DEF(k); return `<h3>지원서 — ${P.name}</h3>` + vlet([`${esc(S.sur)}씨 가문 서고에 올립니다.`, ...P.lines], `${P.name}(${P.hj}) 올림.`, 'min(50vh,370px)'); };
function hire(k){
  const s = stOf(k); s.replied = true; s.desk = freeDesk(); s.item = 'first'; s.due = Date.now() + (isGen(k) ? 5000 : 6000);
  if (isGen(k)) S.genNext = Date.now() + 210000;
  save(); ov.classList.add('hidden'); sPlace();
  if (typeof tlog === 'function') tlog('받아들임: ' + DEF(k).name);
}
function readApplicant(k){
  if (!k) return;
  stOf(k).read = true; save();
  const fd = freeDesk(), full = '<div style="font-size:13px;opacity:.7;margin-top:12px;text-align:center">사람을 들이려면 앉을 자리가 있어야 한다.<br>별채에 빈 책상이 없다.</div>';
  const btn = (id, label) => `<button class="btn rec" id="${id}" style="color:var(--ink);border-color:#00000066;margin:4px">${label}</button>`;
  if (isGen(k)){
    openOv(genLetter(k) + '<div style="text-align:center;margin-top:12px">' + (fd ? btn('bHire', '받아들인다') : '') + btn('bSendAway', '돌려보낸다') + '</div>' + (fd ? '' : full));
    const h = document.getElementById('bHire'); if (h) h.addEventListener('click', ev => { ev.stopPropagation(); hire(k); });
    document.getElementById('bSendAway').addEventListener('click', ev => { ev.stopPropagation(); stOf(k).gone = true; S.genNext = Date.now() + 210000; save(); ov.classList.add('hidden'); });
    return;
  }
  if (STAFF[k].later){ openOv(letterOf(k)); return; }                                     // 지금은 오지 않는 사람: 편지만
  openOv(letterOf(k) + (fd ? '<div style="text-align:center;margin-top:14px">' + btn('bReplyA', '답장을 쓴다') + '</div>' : full));
  const b = document.getElementById('bReplyA'); if (b) b.addEventListener('click', ev => { ev.stopPropagation();
    openOv(replyOf(k) + '<div style="text-align:center;margin-top:14px">' + btn('bSendA', '보낸다') + '</div>');
    document.getElementById('bSendA').addEventListener('click', e2 => { e2.stopPropagation(); hire(k); });
  });
}
function showRoster(){
  const names = [];
  if (S.rArrived) names.push(['한서진', '韓瑞眞', '해독가']);
  for (const k of allKeys().filter(arrived).sort((a, b) => S.st[a].arr - S.st[b].arr)) names.push([DEF(k).name, DEF(k).hj, DEF(k).job, !!S.st[k].quit]);   // 그만둔 사람은 이름에 줄
  const n = names.length + 1;
  openOv(`<h3>명부 — ${KNUM[n] || n}</h3><div style="font-size:13px;opacity:.7;margin-bottom:8px">별채에 드나드는 사람을 적는 명부. 첫 장은 한서진의 글씨다.</div>`
    + names.map((x, i) => x[3] ? `${i+1}. <s style="opacity:.55">${x[0]}(${x[1]}) — ${x[2]}</s>` : `${i+1}. ${x[0]}(${x[1]}) — ${x[2]}`).join('<br>')   // 그만둔 사람은 이름에 줄
    + `<br>${n}. <span style="opacity:.55">${alienHtml(glyphs('누구인가', 77 + n))}</span> — <span style="opacity:.55">${alienHtml(glyphs('필경사', 91))}</span>`);
}
function staffDiary(k){ const s = S.st[k] || {}; return (STAFF[k] ? STAFF[k].diary : []).filter(d => (s.work||0) >= d[0]).map(d => d[1]); }
function showStaff(k){
  if (!k) return;
  const P = DEF(k), s = stOf(k);
  if (!arrived(k)){ openOv(`<h3>별채 책상</h3>${P.name}의 자리를 마련해 두었다. 아직 오지 않았다.`); return; }
  if (!present(k)){ openOv(`<h3>${P.name}의 자리</h3>밤이다. ${josa(P.name, '은', '는')} 집에 갔다.<br>해가 뜨면 온다.`); return; }
  const rf = s.fear || 0;
  const speed = !working(k) ? (k === 'smw' ? '눈을 감고 쉬고 있다 — 해가 높다' : '쉬고 있다') : fearSpeedTxt(rf, S.owned.sundial, 60 / P.sec);
  const st = fearState(rf);
  const o = (id, label) => `<span data-cp="${id}" class="${s.item === id ? 'on' : ''}">${label}</span>`;
  const dl = staffDiary(k), tea = Date.now() < (s.calm||0) ? '<div style="font-size:12px;opacity:.6">책상에 찻잔이 놓여 있다. 아직 따뜻하다.</div>' : '';
  openOv(`<h3>${isGen(k) ? '연구원' : '반장'} — ${P.name}(${P.hj})</h3>직업: ${P.job}<br>상태: ${st}${typeof whyHtml === 'function' ? whyHtml(k) : '<br>'}읽는 빠르기: ${speed}<br>넘긴 것: ${fmtP(s.pages||0)}<br><div style="font-size:12px;opacity:.6">${P.note}</div>${tea}`
    + (S.teaArrived && P.tea === false ? '<div style="font-size:12px;opacity:.6;margin:6px 0">차는 마시지 않는다. 오정림이 놓고 간 잔도 돌려보낸다.</div>' : '') + (S.teaArrived && P.tea !== false ? `<div style="text-align:center;margin:8px 0"><button class="btn rec" id="bSTea" style="color:var(--ink);border-color:#00000066">차를 한 잔 내준다</button></div>` : '')
    + `<div class="opt rec"><span>읽을 사본</span><span class="ch">${o('first', '제목 없는 책')}${o('dongui', '동의보감 三')}${S.mapFound ? o('map', '지도') : ''}</span></div>`
    + copyOpts(s, o) + `<div style="font-size:12px;opacity:.6">서고의 책을 베껴 둔 사본이라, 같은 책을 여럿이 읽을 수 있다.${s.auto && !s.manual ? ' 지금 것은 한서진이 나누어 준 것이다.' : ''}</div>`
    + (isGen(k) ? '' : `<br><b>일지</b>` + (dl.length ? dl.map((d, i) => `<div class="rec dlist" data-d="${i}"><span>일지 ${i+1} — ${esc(d.split('.')[0])}</span><span style="opacity:.45;font-size:12px">읽기</span></div>`).join('') : '<br>아직 쓴 것이 없다.')));
  const bt = document.getElementById('bSTea'); if (bt) bt.addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); s.steam = Date.now() + 3000; s.calm = Date.now() + 243000; save(); sBoil(); });
  ovBody.querySelectorAll('[data-cp]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); if (!setStaffItem(k, el.dataset.cp)) return; s.manual = true; s.auto = false; s.manDay = dayKey(); save(); sPlace(); showStaff(k); }));
  ovBody.querySelectorAll('.dlist').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const i = +el.dataset.d;
    openOv(`<h3>${P.name}의 일지 ${i+1}</h3>${staffDiary(k)[i]}<div class="rec" id="bBackS" style="margin-top:14px;text-align:center">← 목록으로</div>`);
    document.getElementById('bBackS').addEventListener('click', e2 => { e2.stopPropagation(); showStaff(k); }); }));
}
function readGo(){
  S.goRead = true; save();
  openOv('<h3>쪽지</h3>' + vlet(['가주께.', '사람이 늘었습니다.', '새로 온 이들도 손이 제법입니다.', '정림 씨가 차를 맡아 주니', '이제 바닷가에 가 볼 수 있겠습니다.', '날을 잡아 주십시오.'], '한서진 올림.'),
    () => { setTimeout(() => { const en = document.getElementById('endnote'); en.innerHTML = '— 체험판은 여기까지입니다 —<br><span style="font-size:12px">해 보신 분은 설정 → 시험 기록 → 복사해서 보내 주시면 큰 도움이 됩니다.</span>'; en.style.opacity = 1; }, 1500); });
  if (typeof tlog === 'function') tlog('체험판 끝 쪽지');
}
function labRecs(recs){
  if (typeof whyRecs === 'function') whyRecs(recs);
  if (typeof sideRecs === 'function') sideRecs(recs);
  if ((S.ledger || []).length && typeof ledgerHtml === 'function') recs.push(['치부책 — 궤짝의 엽전', ledgerHtml]);
  if (S.bangAt) recs.push(['방(榜)', bangHtml]);
  for (const k of ['smw', 'ojr']){ const s = S.st[k]; if (!s) continue;
    if (s.read) recs.push([`편지 — ${STAFF[k].name}`, () => letterOf(k)]);
    if (s.replied && !STAFF[k].later) recs.push([`답장 — ${STAFF[k].name}`, () => replyOf(k)]);
    if (staffDiary(k).length) recs.push([`${STAFF[k].name}의 일지`, () => `<h3>${STAFF[k].name}의 일지</h3>` + staffDiary(k).map(d => `<div style="margin:8px 0">${d}</div>`).join('')]);
  }
  const g = genKeys().filter(k => S.st[k].read);
  if (g.length) recs.push(['지원서 묶음', () => '<h3>지원서 묶음</h3>' + g.map(k => `<div style="margin:8px 0"><b>${DEF(k).name}(${DEF(k).hj})</b>${S.st[k].gone ? ` <span style="opacity:.5;font-size:12px">— ${S.st[k].fired ? '내보냄' : S.st[k].quit ? '그만둠' : '돌려보냄'}</span>` : ''}<br>${DEF(k).lines.join(' ')}</div>`).join('')]);
  if (S.goRead) recs.push(['쪽지 — 한서진 (사람이 늘었습니다)', () => '<h3>쪽지</h3>가주께. 사람이 늘었습니다. 새로 온 이들도 손이 제법입니다. 정림 씨가 차를 맡아 주니 이제 바닷가에 가 볼 수 있겠습니다. 날을 잡아 주십시오. — 한서진']);
}
function labNews(){
  const n = [];
  if (S.helpRead && !S.bangAt) n.push('bang');
  if (S.bangAt) n.push('labdoor');
  for (const k of allKeys()){ const s = S.st[k]; if (!s) continue; if (s.at && !s.gone) n.push('al:' + k); if (s.arr) n.push('arr:' + k); }
  for (const d of DESK_IDS) if (!S.owned[d] && S.bangAt && canBuy(LAB_OBJ.find(o => o.id === d))) n.push('buy:' + d);
  if (S.goNote) n.push('go');
  return n;
}
const anyShrunk = () => (S.rFear||0) >= 0.6 || allKeys().some(k => working(k) && (S.st[k].fear||0) >= 0.6);
const anyScared = () => (S.rFear||0) > 0.5 || allKeys().some(k => working(k) && (S.st[k].fear||0) > 0.5);

// 매 순간: 지원서·편지 도착 → 연구원 도착 → 일 → 다원지기의 차 → 마지막 쪽지
let lastTeaRound = 0;
function labTick(dt){
  if (typeof errTick === 'function') errTick();
  if (typeof whyTick === 'function') whyTick();
  if (typeof payTick === 'function'){ payTick(); dealerTick(); }
  if (typeof homeTick === 'function') homeTick();
  if (typeof morningTick === 'function') morningTick();
  if (typeof flipTick === 'function') flipTick();
  if (!S.bangAt) return;
  if (typeof sideTick === 'function') sideTick(dt);
  const now = Date.now(), smw = stOf('smw'), ojr = stOf('ojr');
  if (!curApplicant()){
    const gArr = genKeys().filter(arrived), gHired = genKeys().filter(k => S.st[k].replied && !S.st[k].quit).length;   // 그만둔 사람 자리는 다시 채움
    const gPages = gArr.reduce((a, k) => a + (S.st[k].pages||0), 0);
    if (!smw.at && gArr.length >= 2 && gPages >= 200){ smw.at = now; save(); knock(); }                                   // 별채가 함께 2권을 넘긴 뒤
    else if (!ojr.at && smw.read && now >= smw.at + 60000 && ((S.sweatSec||0) >= 600 || now >= smw.at + 1800000)){ ojr.at = now; save(); knock(); }   // 땀 흘린 시간이 모두 합쳐 10분을 넘으면(아니면 30분 뒤)
    else if (gHired < GEN_MAX && !S.bangOff && now >= (S.genNext || S.bangAt + 120000)){ S.genN = (S.genN || 0) + 1; stOf('g' + S.genN).at = now; save(); knock(0.7); }
  }
  for (const k of allKeys()){
    const s = S.st[k];
    if (s && s.replied && !s.arr && !s.gone && now >= s.due){
      s.arr = now; s.work = 0; s.pages = 0; s.fear = 0; save();
      const v = S.scene === 'lab' ? 1 : 0.35;                                                          // 서고에 있으면 벽 너머로 희미하게
      knock(v);
      for (let t = 300; t < WALK_MS; t += 560) setTimeout(() => noise(0.08, 220, 0.16*v, 'lowpass'), t);
      setTimeout(() => noise(0.5, 320, 0.12*v, 'lowpass'), WALK_MS + 50);
      setTimeout(() => noise(0.45, 300, 0.1*v, 'lowpass'), T_SIT + 50);
      if (typeof tlog === 'function') tlog('도착: ' + DEF(k).name);
    }
    if (s && s.arr && !working(k)) s.rest = true;                                           // 쉬고(집에 가고) 돌아오면 겁이 절반으로
    else if (s && s.rest){ s.rest = false; s.fear = (s.fear||0) * 0.5; }
    if (!s || !working(k) || S.errs[k]) continue;                                          // 심부름 가 있는 동안은 읽지 않음
    if (now < (s.steam||0)) s.fear = Math.max(0, (s.fear||0) - dt*0.25);
    else s.fear = Math.min(1, (s.fear||0) + dt*readFear(s.item || 'first')*DEF(k).fearK*(now < (s.calm||0) ? 0.3 : 1)*owePenalty(k));   // 녹봉이 밀리면 더 빨리
    if (s.fear >= 0.3) S.sweatSec = (S.sweatSec||0) + dt;                                   // 별채에서 누군가 땀 흘린 시간(오정림이 듣게 되는 소문)
    const fac = fearFac(s.fear) * visitBoost() * manBoost(s);   // 가주 순회·가주가 직접 맡김
    s.work = (s.work||0) + dt;
    if (isCopy(s.item)){ copyWork(k, s, dt*fac); continue; }   // 필사 중: 쪽 대신 사본
    s.acc = (s.acc||0) + dt*fac;
    while (s.acc >= DEF(k).sec){ s.acc -= DEF(k).sec; S.pages += 1; S.earned += 1; addBook(s.item || 'first', mult()); s.pages = (s.pages||0) + 1; }
  }
  // 다원지기: 자리를 잡으면 서고의 찻주전자를 가지러 가고, 그 뒤로는 1분 30초마다 떨고 있는 사람·빈 가주 서안에 차를 날라 줌(16_errand)
  if (working('ojr') && !S.errs.ojr){
    if (!S.potTaken && !S.teaArrived){ S.potTaken = S.potPut = now; save(); }               // 서고에 찻주전자가 없던 때 온 경우: 자기 것을 들고 옴
    else if (!S.potTaken){ if (now - ojr.arr > T_PUSH + 6000) potErrand(); }
    else if (S.potPut && now - lastTeaRound > 90000){ lastTeaRound = now; teaRound(); }
  }
  if (S.rArrived && !isNight() && (S.rFear||0) >= 0.3) S.sweatSec = (S.sweatSec||0) + dt;
  if (now - lastAssign > 10000){ lastAssign = now; autoAssign(); }
  if (!S.goNote && ojr.arr && now - ojr.arr > 180000){ S.goNote = true; save(); }
}
// 자리를 비운 동안: 서명우는 밤 시간, 밤일 하는 이는 낮밤 모두, 나머지는 낮 시간만 (한서진과 같이 30%)
function labOffline(){
  const out = [];
  if (!S.lastSeen || Date.now() - S.lastSeen < 180e3) return out;
  const now = Date.now(), from = Math.max(S.lastSeen, now - 8*3600e3);
  let daySec = 0, nightSec = 0;
  for (let t = from; t < now; t += 60e3){ const d = Math.min(60, (now - t)/1000); if (isNight(new Date(t))) nightSec += d; else daySec += d; }
  let gen = 0;
  for (const k of allKeys()){
    const s = S.st[k]; if (!s || !s.arr || s.gone) continue;
    const sec = k === 'smw' ? nightSec : DEF(k).night ? daySec + nightSec : daySec; if (sec <= 0) continue;
    const n = Math.floor(sec / DEF(k).sec * 0.3); if (!n) continue;
    const rested = k === 'smw' ? daySec > 0 : (!DEF(k).night && nightSec > 0);
    s.work = (s.work||0) + sec; s.fear = Math.max((s.fear||0) * (rested ? 0.5 : 1), 0.3); if (isCopy(s.item)){ copyWork(k, s, sec*0.3); continue; }   // 자리 비운 동안의 필사
    S.pages += n; S.earned += n; addBook(s.item || 'first', n*mult()); s.pages = (s.pages||0) + n;
    if (isGen(k)) { gen += n; continue; }
    out.push(k === 'smw'
      ? '<h3>쪽지</h3>' + vlet(['가주께.', `밤사이 ${fmtP(n)}을 넘겼습니다.`, '하늘은 맑았습니다.', isNight() ? '이상 없음. ✶' : '해가 뜨기에 눈을 감았습니다. ✶'], '서명우 올림.', 'min(44vh,320px)')
      : '<h3>쪽지</h3>' + vlet(['가주께.', `안 계신 동안 ${fmtP(n)}을 읽었습니다.`, '차는 넉넉히 끓여 두었습니다.', '서진 씨가 두 잔, 별채 사람들이 한 잔씩 마셨습니다.'], '오정림 올림.', 'min(44vh,320px)'));
  }
  if (gen) out.push('<h3>쪽지</h3>' + vlet(['가주께.', `별채 사람들이 ${fmtP(gen)}을 넘겼습니다.`, '모두 무사합니다.'], '한서진 적음.', 'min(36vh,240px)'));
  return out;
}

// ───────── 반장이 맡는 일 (기획서 14-3) ─────────
// 오정림이 오면 찻주전자는 별채로 옮겨지고(서고엔 물 자국만), 낮마다 서안에 가주 몫 한 잔.
// 한서진이 자리를 잡으면 별채 사람들이 읽을 사본을 나눠 둠(가주가 직접 고른 사람은 그대로).
const dayKey = () => S.opt.gameTime ? Math.floor(Date.now()/1000/300/24) : Math.floor((Date.now() + 9*3600e3) / 86400e3);
M.teaRing = model(7,6,1,(x,y)=>{ const r = Math.hypot(x-3, y-2.5); return r <= 2.9 && r >= 1.9 ? '#2a1c12' : null; });   // 찻주전자가 있던 둥근 물 자국
// 서고의 찻주전자는 소반 위에 — 오정림이 들고 가면 소반엔 물 자국만
M.soban = model(8,7,5,(x,y,z)=>{ if (z === 4) return (x === 0 || x === 7 || y === 0 || y === 6) ? '#4a2e18' : '#6a4628'; if (z === 3) return (x >= 1 && x <= 6 && y >= 1 && y <= 5) ? '#3c2414' : null; return ((x === 1 || x === 6) && (y === 1 || y === 5)) ? '#3c2414' : null; });
M.dtak = model(11,8,7,(x,y,z)=>{ if (z === 6) return (x === 0 || x === 10 || y === 0 || y === 7) ? '#3c2414' : '#5e3a22'; if (z === 5) return (y === 0 || y === 7) && x >= 1 && x <= 9 ? '#3c2414' : null; return ((x <= 1 || x >= 9) && (y <= 1 || y >= 6)) ? '#3c2414' : null; });   // 별채 다탁
M.tray = model(8,5,3,(x,y,z)=>{ if (z === 0) return (x === 0 || x === 7 || y === 0 || y === 4) ? '#4a2e18' : '#6a4628';            // 찻잔 둘 얹은 쟁반
  const r1 = Math.hypot(x - 2.3, y - 2), r2 = Math.hypot(x - 5.3, y - 2); if (r1 <= 1.4 || r2 <= 1.4) return z === 2 && (r1 <= 0.7 || r2 <= 0.7) ? '#9a7a3a' : '#ece8dc'; return null; });
{ const tp = OBJ.find(o => o.id === 'teapot'), tpShow = tp.show; tp.show = () => tpShow() && !S.potTaken;
  OBJ.push({ id:'soban', x:-31, y:-5, m:()=>'soban', show:()=> tp.show() || !!S.potTaken, click:()=> S.potTaken ? OBJ.find(o => o.id === 'teaRing').click() : showTea() }); }
OBJ.push(
  { id:'teaRing', x:-31, y:-5, z:5, m:()=>'teaRing', on:()=>'soban', show:()=> !!S.potTaken,
    click:()=>openOv('<h3>물 자국</h3>찻주전자가 있던 자리에 둥근 물 자국만 남았다.<br>오정림이 별채로 가져갔다. 별채에서 차 끓는 냄새가 난다.') },
  { id:'myCup', x:-6, y:5, z:8, rot:0, m:()=>'cup', on:()=>'desk', onOrder:0.02,
    show:()=> !!S.owned.desk && !!S.myCup,
    click:()=>{ S.myCup = false; S.myCupAt = Date.now(); save(); brew();
      openOv('<h3>찻잔</h3>오정림이 가주 몫이라며 서안에 놓고 간 것이다. 잔이 비면 또 가져다 놓는다.<br>아직 따뜻하다. 마시니 떨림이 가라앉는다.'); } },
);
LAB_OBJ.push(
  { id:'dtak', x:TEA_T[0], y:TEA_T[1], m:()=>'dtak', click:()=> S.potPut ? showTea() : openOv('<h3>다탁</h3>찻그릇을 올려 두는 낮은 상. 비어 있다.') },
  { id:'labTeapot', x:TEA_T[0] + 1, y:TEA_T[1], z:7, m:()=>'teapot', on:()=>'dtak', show:()=> !!S.potPut, click:()=>showTea() });
let lastAssign = 0;
function autoAssign(){
  if (!S.rArrived || diaryCount() < 1) return;                 // 한서진이 자리를 잡은 뒤부터
  if (S.errs.sj || isNight() || nightVisiting() || Date.now() - S.rArrived < T_PUSH) return;   // 직접 가져다 놓으므로, 자리에 있을 때만
  const ks = allKeys().filter(k => arrived(k) && !S.st[k].manual && !S.st[k].gone && LAB_DESKS[S.st[k].desk]);
  ks.sort((a, b) => (isGen(b) - isGen(a)) || ((DEF(a).sec||4) - (DEF(b).sec||4)));   // 일반 연구원·손 빠른 사람부터
  if (!ks.length) return;
  const want = [];
  if (!S.sideRead.dongui) want.push('dongui');                 // 아직 못 푼 곁책에 한 사람
  if (S.mapFound && (S.mapStudy||0) < MAP_NEED + 60) want.push('map');   // 지도의 글자에 한 사람
  const changes = [];
  ks.forEach((k, i) => { const it = want[i] || 'first'; if (S.st[k].item !== it) changes.push([k, it]); });
  if (changes.length) bookRound(changes);                      // 한서진이 사본을 들고 별채로 감(16_errand)
}
