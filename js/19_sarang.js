'use strict';
// ───────── 사랑채 (10/31 선생님 "지도가 생기면 역할을 다른 방으로 — 작은 방에 다 쑤셔 넣는 것 같다") ─────────
// 가옥도가 열리고(별채에 처음 든 뒤, 19_house houseOn) 첫 사람을 들인 뒤(11/1 통째 점검 ③ — 방을 붙인 순간 몰리던 것을 나눔) 한서진이 서고의 기록 물건 — 문갑·문서함·연구 노트 — 을 사랑채로 옮겨 둠. 그 뒤 오는 지원서도 사랑채 서안 위로(11/1). 서고는 읽는 방으로만 남음.
// 사랑채로는 서고 뒷벽 문(문갑이 있던 자리)이나 가옥도로 감.
const sarangOn = () => houseOn() && (S.sarangOpen || (allKeys().some(k => S.st[k] && S.st[k].replied) && (S.sarangOpen = true)));   // 한 번 열리면 닫히지 않음(점검 11/4 — 되부른 사람의 replied가 지워지면 닫히던 것)
const SARANG_OBJ = [
  { id:'sBack', x:27, y:-25.5, m:()=>'door', click:()=>goScene('seogo') },
  { id:'sWin', x:7, y:-26, z:8, rot:0, m:()=>'__win', click:()=>openOv(`<h3>창</h3>${daylight() >= 0.8 ? '창호지가 환하다. 낮이다.' : '창밖이 어둡다.'}<br>사랑채 창은 마당 쪽으로 나 있다.`) },
  { id:'sMungap', x:16, y:-22, rot:0, m:()=> libNew() ? 'mungapOpen' : 'mungap', click:()=>showLibrary() },
  { id:'sMap', x:-22, y:-20, rot:0.2, m:()=>'houseScroll', glow:()=> !S.houseSeen, click:()=>showHouse() },
  { id:'sDesk', x:0, y:3, m:()=>'seoan', click:()=>openOv('<h3>사랑채 서안</h3>손님을 맞고 편지를 쓰던 자리.<br>한서진이 서고에서 옮겨 온 연구 노트가 놓여 있다.') },
  { id:'sNote', x:-6, y:8, z:8, rot:-0.2, on:()=>'sDesk', onOrder:0.02, m:()=>'notebook', show:()=> !!S.owned.brush && !yeonOn(), glow:()=> TECH.some(t => techState(t[0]) === 'asked' && !S.techSeen), click:()=>showTech() },
  { id:'sDoc', x:-12, y:14, rot:0.15, m:()=>'docbox', show:()=> docboxShow(), click:()=>showDocbox() },
];
SARANG_OBJ.push({ ...OBJ.find(o => o.id === 'aletter'), x:7, y:9, z:8, rot:0.15, on:()=>'sDesk', onOrder:0.03, show: aletterShow });   // 지원서는 손님 맞는 방으로(11/1, 기획서 22절 ✳)
for (const [id, show] of [['copies', copiesShow], ['mirror', mirrorShow]]) SARANG_OBJ.push({ ...OBJ.find(o => o.id === id), on:()=>'sMungap', show });   // 문갑 위 사본 묶음·거울도 문갑과 함께 옮김(서고에 떠 있던 일, 10/31)
OBJ.push({ id:'sarangDoor', x:16, y:-25.5, m:()=>'door', show:()=> sarangOn(), glow:()=> !S.sarangSeen || (aletterShow() && !S.st[curApplicant()].read), click:()=>{ S.sarangSeen = true; goScene('sarang'); } });   // 읽지 않은 지원서가 사랑채에 있으면 빛남
HOOK.tick.push(() => {
  if (S.stage !== 'room' || S.ended || S.sarangNote || !sarangOn() || !S.rArrived || isNight() || S.errs.sj) return;
  S.sarangNote = true; save();
  pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '서고가 비좁아', '문갑과 문서함, 연구 노트를', '사랑채로 옮겨 두었습니다.', '서고에는 읽을 것만 두겠습니다.'], '한서진 올림.', 'min(40vh,280px)'));
});
