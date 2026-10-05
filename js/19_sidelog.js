'use strict';
// ───────── 별채 이야기: 한서진·오정림의 일지에 일반 연구원이 이름으로만 등장 (일반 연구원 글 모음 3절) ─────────
// 별채에 일반 연구원이 일하는 동안 4분쯤마다 한 줄. 서늘한 줄(바다의 차)은 차를 세 번 넘게 마신 사람에게만.
const nI = n => josa(n, "이", "가"), nUi = n => n + "의";
const SIDE_LINES = [
  ['ojr', n => `오늘 ${nI(n)} 차를 남겼다. 입맛이 없다 했다.`],
  ['sj',  n => `${nI(n)} 붓을 하나 더 청했다. 끝이 갈라졌다고 했다.`],
  ['sj',  n => `${nI(n)} 해 지기 전에 먼저 갔다. 아이가 아프다 했다.`],
  ['ojr', n => `${nUi(n)} 잔에 찻잎이 서서 떠 있었다. 손님 올 징조라 했다.`],
  ['sj',  n => `${nI(n)} 벼루에 물을 너무 많이 부어 먹이 연했다. 다시 갈았다.`],
  ['ojr', n => `별채 사람들 중 ${nI(n)} 제일 늦게까지 남아 있었다. 등잔 기름을 더 내주었다.`],
  ['sj',  n => `${nI(n)} 셋째 권의 글자 하나를 물어 왔다. 나도 모르는 글자였다. 둘이서 한참 보았다.`],
  ['ojr', n => `${nI(n)} 아궁이 곁에 앉아 손을 녹였다. 올해 겨울은 이르다.`],
  ['sj',  n => `${nI(n)} 책장을 넘기는 소리가 유난히 크다. 아무도 뭐라 하지 않는다.`],
  ['ojr', n => `${nI(n)} 떡을 가져와 별채 사람들에게 돌렸다. 집에서 제사가 있었다 했다.`],
  ['ojr', n => `${nI(n)} 의자가 삐걱거린다고 했다. 서진 씨가 종이를 접어 다리 밑에 끼워 주었다.`],
  ['sj',  n => `${nI(n)} 돋보기를 책상에 두고 갔다. 내일 줄 것이다.`],
  ['sj',  n => `${nI(n)} 자기 이름 한자를 벼루 옆에 써 두었다. 연습인 듯하다.`],
];
const SIDE_COLD = ['ojr', n => `오늘 ${nI(n)} 차를 남겼다. 짜다고 했다. 나는 소금을 넣지 않는다.`];
const SIDE_WHO = { sj:'한서진', ojr:'오정림' };
let sideAcc = 0;
function sideTick(dt){
  const gens = genKeys().filter(k => working(k));
  if (!gens.length) return;
  sideAcc += dt; if (sideAcc < 240) return; sideAcc = 0;
  const can = w => w === 'sj' ? (!!S.rArrived && !isNight()) : working('ojr');
  const used = S.sideUsed = S.sideUsed || [];
  const k = gens[Math.floor(Math.random()*gens.length)], name = DEF(k).name, s = S.st[k];
  let line = null;
  if ((s.teaN||0) >= 3 && !s.coldDone && can('ojr') && DEF(k).tea !== false){ s.coldDone = true; line = [SIDE_COLD[0], SIDE_COLD[1](name)]; }
  else {
    const pool = SIDE_LINES.map((l, i) => [l, i]).filter(([l, i]) => !used.includes(i) && can(l[0]));
    if (!pool.length){ if (used.length >= SIDE_LINES.length) used.length = 0; return; }
    const [l, i] = pool[Math.floor(Math.random()*pool.length)]; used.push(i); line = [l[0], l[1](name)];
  }
  S.sideLog = (S.sideLog || []).concat([line]).slice(-40); save();
}
function sideRecs(recs){
  const L = S.sideLog || []; if (!L.length) return;
  recs.push(['별채 이야기 — 한서진·오정림의 일지에서', () => '<h3>별채 이야기</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">한서진과 오정림의 일지 사이사이에 적힌, 별채 사람들 이야기.</div>'
    + L.map(([w, t]) => `<div style="margin:6px 0">${t} <span style="opacity:.5;font-size:12px">— ${SIDE_WHO[w]}</span></div>`).join('')]);
}
