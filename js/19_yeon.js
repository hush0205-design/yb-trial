'use strict';
// ───────── 연구소(硏究所) (연구 테크트리 '연구소' · 10/31 선생님 "연구하는 방을 따로") ─────────
// 가옥도의 사당 터에 지음(19_house BUILD.yeon). 지으면: 연구 전용 책상이라 맡은 사람이 연구하는 동안에도 읽기를 멈추지 않음(19_tech techBusy) · 쓰는 시간 절반(K.techYeon) ·
// 연구 공책이 사랑채에서 이리로 옮겨짐. 방 안: 책상 둘, 공책, 다 쓴 연구 종이 더미(적은 만큼), 쓰는 중이면 등잔이 깜빡임.
const yeonOn = () => typeof built === 'function' && built('yeon');
const techDoneN = () => TECH.filter(t => techState(t[0]) === 'done').length;
const YEON_OBJ = [
  { id:'yBack', x:27, y:-25.5, m:()=>'door', click:()=>goScene('seogo') },
  { id:'yWin', x:7, y:-26, z:8, rot:0, m:()=>'__win', click:()=>openOv(`<h3>창</h3>${daylight() >= 0.8 ? '창호지가 환하다. 낮이다.' : '창밖이 어둡다.'}<br>사당이 있던 자리라 창 밖에 오래된 향로가 그대로 있다.`) },
  { id:'yMap', x:-22, y:-20, rot:0.2, m:()=>'houseScroll', click:()=>showHouse() },
  { id:'yDesk', x:-6, y:0, m:()=>'ldesk', click:()=>{ const w = S.techWork, t = w && TECH.find(x => x[0] === w.id);
    openOv('<h3>연구 책상</h3>' + (t ? `${w.who === 'sj' ? '한서진' : DEF(w.who).name}이 「${t[1]}」을 쓰고 있다 — ${Math.floor(100 * (w.acc || 0) / w.need)}%.<br>제 책상의 읽을 것은 그대로 두고 왔다.` : '비어 있다. 공책에서 허락한 것이 있으면 맡은 사람이 여기 와서 쓴다.')); } },
  { id:'yNote', x:-12, y:5, z:10, rot:-0.2, on:()=>'yDesk', onOrder:0.02, m:()=>'notebook', glow:()=> TECH.some(t => techState(t[0]) === 'asked' && !S.techSeen), click:()=>showTech() },
  { id:'yLamp', x:4, y:-4, on:()=>'yDesk', onOrder:0.03, z:10, m:()=>'lamp', glow:()=> !!S.techWork, click:()=>openOv('<h3>등잔</h3>' + (S.techWork ? '쓰는 동안은 꺼지지 않는다. 바람이 불어도 불꽃이 눕지 않는다.' : '심지가 짧게 잘려 있다.')) },
  { id:'yPile', x:18, y:16, rot:0.3, m:()=>'pile' + Math.min(K.pileAt.length, techDoneN()), show:()=> techDoneN() > 0, click:()=>openOv(`<h3>다 쓴 연구</h3>공책대로 다 쓴 것들을 묶어 쌓아 두었다. ${KCNT(techDoneN())} 묶음.`) },
];
