'use strict';
// ───────── 연구원 책상의 책: 펼쳐 두고 한 장씩 넘김 (10/4 선생님) ─────────
// 앉아 읽는 동안엔 책이 펼쳐져 있고, 한 쪽을 넘길 때마다 종이가 넘어감 → 읽는 빠르기가 눈에 보임(떨면 느려짐).
// 사람이 없는 밤엔 책이 덮여 있는데, 가끔 덮인 책이 저절로 펼쳐져 한 장 넘어가고 다시 덮임.
const OPEN_C = { first:['#8a6a34', '#6e5228'], dongui:['#3e4a6e', '#2a3352'] };
function openBookModel(col, edge){
  return model(9,7,2,(x,y,z)=>{
    if (z === 0) return (x === 0 || x === 8 || y === 0 || y === 6) ? edge : col;               // 겉장
    if (x === 4) return edge;                                                                   // 가운데 묶은 자리
    if (x === 0 || x === 8 || y === 0 || y === 6) return null;
    return (y % 2 === 1 && (x + y) % 3 !== 0) ? '#8a8070' : '#e8e0cc';                          // 글줄
  });
}
for (const [k, [c, e]] of Object.entries(OPEN_C)) M['open_' + k] = openBookModel(c, e);
// 넘어가는 종이: 묶은 자리를 축으로 오른쪽(0)에서 왼쪽(π)으로 둥글게 넘어감
const FLIP_N = 9;
for (let i = 0; i < FLIP_N; i++){
  const th = Math.PI * (i + 0.5) / FLIP_N, cells = new Set();
  for (let r = 0; r <= 3.6; r += 0.3) cells.add(Math.round(4 + r*Math.cos(th)) + ',' + Math.round(1 + r*Math.sin(th)));
  M['flip' + i] = model(9,7,5,(x,y,z)=> (y >= 1 && y <= 5 && cells.has(x + ',' + z)) ? (y === 1 || y === 5 ? '#cfc6b0' : '#f0e9d6') : null);
}
const FLIP_MS = 650;
const flipM = t => { const f = flipFrame(t); return 'flip' + (f < 0 ? FLIP_N - 1 : f); };   // 그리는 사이 끝나도 마지막 장으로
const flipFrame = t => { const e = (Date.now() - (t||0)) / FLIP_MS; return e >= 0 && e < 1 ? Math.min(FLIP_N - 1, Math.floor(e * FLIP_N)) : -1; };

// 누가 앉아 읽고 있나 / 언제 넘겼나
const seatedStaff = k => !!k && present(k) && working(k) && !S.errs[k] && staffState(k).pose === 'sit';
const seatedSJ = () => !!S.rArrived && !isNight() && !nightVisiting() && !S.errs.sj && sjState().pose === 'sit';
const FLIPT = {}, GHOST = {};               // 마지막으로 넘긴 때 / 저절로 펼쳐진 때(밤)
let lastPg = {}, ghostNext = {};
function flipTick(){
  const now = Date.now();
  const watch = [['sj', S.rPages || 0], ...allKeys().filter(k => S.st[k] && S.st[k].arr).map(k => [k, S.st[k].pages || 0])];
  for (const [k, p] of watch){ if (lastPg[k] != null && p > lastPg[k] && (Date.now() - (FLIPT[k]||0)) > FLIP_MS) FLIPT[k] = now; lastPg[k] = p; }
  // 밤: 아무도 없는 책상의 덮인 책이 가끔 저절로 넘어감(한 쪽 보탬)
  const away = [];
  if (S.rArrived && isNight() && !nightVisiting() && ['first', 'dongui'].includes(itemAt('rdesk'))) away.push(['sj', itemAt('rdesk'), 'seogo']);
  for (const k of allKeys()){ const s = S.st[k]; if (s && s.arr && !s.gone && !present(k) && ['first', 'dongui'].includes(s.item)) away.push([k, s.item, 'lab']); }
  for (const [k, item, sc] of away){
    if (!ghostNext[k]){ ghostNext[k] = now + 40000 + Math.random()*80000; continue; }
    if (now < ghostNext[k]) continue;
    ghostNext[k] = now + 40000 + Math.random()*80000; GHOST[k] = now; FLIPT[k] = now + 800;
    S.pages += 1; S.earned += 1; addBook(item, 1);
    if (S.scene === sc && typeof sFlip === 'function') setTimeout(() => sFlip(), 800);
  }
}
const ghostOpen = k => Date.now() - (GHOST[k]||0) < 2400;

// 별채 책상: 앉아 있으면 펼친 책, 넘길 땐 종이 한 장
for (const o of LAB_OBJ.filter(o => o.id.startsWith('i_'))){
  const d = o.id.slice(2), owner = () => deskOwner(d), m0 = o.m;
  o.x = LAB_DESKS[d][0] - 2; o.y = LAB_DESKS[d][1] + 1;
  o.m = () => { const k = owner(), it0 = k && S.st[k].item, it = it0 && it0.startsWith('c_') ? (it0 === 'c_dongui' ? 'dongui' : 'first') : it0; return (it === 'first' || it === 'dongui') && ((seatedStaff(k) && !bookShut(k, S.st[k].fear)) || ghostOpen(k)) ? 'open_' + it : m0(); };
  LAB_OBJ.push({ id:'pg_' + d, x:o.x, y:o.y, z:11, rot:0, on:()=>d, onOrder:0.015, m:()=> flipM(FLIPT[owner()]),
    show:()=>{ const k = owner(); return !!k && o.m().startsWith('open_') && flipFrame(FLIPT[k]) >= 0; }, click:()=>showStaff(owner()) });
}
{ const t = LAB_OBJ.filter(o => o.id.startsWith('t_')); for (const o of t) o.x += 1; }   // 찻잔은 펼친 책 옆으로 조금 비켜
// 한서진 책상
{ const o = OBJ.find(o => o.id === 'ritem'), m0 = o.m;
  o.m = () => { const it = itemAt('rdesk'); return (it === 'first' || it === 'dongui') && ((seatedSJ() && !bookShut('sj', S.rFear)) || ghostOpen('sj')) && !dropZ('rdesk') ? 'open_' + it : m0(); };
  OBJ.push({ id:'pgR', x:o.x, y:o.y, z:11, rot:0, on:()=>'rdesk', onOrder:0.015, m:()=> flipM(FLIPT.sj),
    show:()=> !!S.chair && o.m().startsWith('open_') && flipFrame(FLIPT.sj) >= 0, click:()=>showResearcher() }); }
// 서안: 펴 둔 책이 저절로 넘어갈 때 덮인 책이 펼쳐져 한 장 넘어가고 다시 덮임(10/7 선생님) — 가주가 책을 펴 읽는 중엔 서고가 안 보이니 그대로
{ const o = OBJ.find(o => o.id === 'ditem'), m0 = o.m;
  o.m = () => { const it = itemAt('desk'); return (it === 'first' || it === 'dongui') && ghostOpen('desk') && !dropZ('desk') ? 'open_' + it : m0(); };
  OBJ.push({ id:'pgD', x:o.x, y:o.y, z:8, rot:0, on:()=>'desk', onOrder:0.015, m:()=> flipM(FLIPT.desk),
    show:()=> !!S.owned.desk && o.m().startsWith('open_') && flipFrame(FLIPT.desk) >= 0, click:()=>deskClick() }); }

