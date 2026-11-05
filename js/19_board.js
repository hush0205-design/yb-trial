'use strict';
// ───────── 정리해 보는 것 둘 (기획서 22-2, 10/31) ─────────
// ① 한서진의 정리 장부: 연구 「치부하는 법」 뒤, 별채 사람마다 한 줄(읽는 것·빠르기·겁·넘긴 양·밀린 녹봉) — 문갑 셋째 서랍(이름에 '일지')
// ② 서명우의 하루 시간표: 서명우가 온 뒤 별채 벽(명부 곁)에 종이 한 장 — 24칸에 사람마다 먹줄, 지금 시각에 붉은 점
const boardPeople = () => [...(S.rArrived ? ['sj'] : []), ...allKeys().filter(k => arrived(k))];
const boardName = k => k === 'sj' ? '한서진' : DEF(k).name;
function boardRow(k){
  const sj = k === 'sj', s = sj ? null : S.st[k], gone = !sj && s.gone;
  const item = sj ? itemAt('rdesk') : s.item, pages = sj ? S.rPages || 0 : s.pages || 0, f = sj ? S.rFear || 0 : s.fear || 0;
  const per = sj ? 60 / R_SEC : 60 / DEF(k).sec, owe = S.owe && S.owe[k] && S.owe[k].amt;
  const fearTxt = typeof techOn === 'function' && techOn('liver') ? `겁 ${Math.round(f * 100)}푼` : FEAR_NM[fearStage(f)];
  return `<div style="margin:9px 0;${gone ? 'opacity:.45;text-decoration:line-through' : ''}"><b>${boardName(k)}</b> <span style="font-size:12px;opacity:.65">— ${item ? (INAME[item] || (COPY[item] ? COPY[item].name.split('(')[0] : item)) : '책상이 비어 있음'}</span>`
    + `<div style="font-size:13px">${!sj && !working(k) ? '쉬는 때' : handTxt(fearSpeedTxt(f, S.owned.sundial, per * speedK(pages)), pages)} · ${fearTxt} · 넘긴 것 ${fmtP(pages)}${owe ? ` · 밀린 녹봉 ${fmtM(owe)}` : ''}</div></div>`;
}
function boardRecs(recs){
  if (!(typeof techOn === 'function' && techOn('ledger')) || !boardPeople().length) return;
  recs.push(['별채 사람들(한서진의 일지)', () => '<h3>별채 사람들</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">녹봉을 내줄 때마다 한서진이 한 사람씩 적어 둔 것.</div>' + boardPeople().map(boardRow).join('')]);
}
// ② 하루 시간표
const boardHours = k => k === 'smw' ? h => h >= 22 || h < 6 : DEF(k).night || S.st[k].nightKeep ? () => true : DEF(k).early ? h => h >= 6 && h < 18 : h => h >= 6 && h < 22;
const HOURS_NM = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];   // 두 시간씩 열두 때(자시 = 23~1시)
function showTimetable(){
  const now = Math.floor((gameHour() + 1) % 24 / 2), cell = (on, i) => `<span style="flex:1;height:7px;margin:0 1px;background:${on ? '#2a1a0e' : '#2a1a0e18'};${now === i ? 'outline:1px solid #8a1a10' : ''}"></span>`;
  const row = (nm, test, note) => `<div style="display:flex;align-items:center;margin:6px 0;font-size:13px"><span style="width:4.2em;flex:none">${nm}</span>${HOURS_NM.map((_, i) => cell(test(i * 2), i)).join('')}</div>${note ? `<div style="font-size:11px;opacity:.6;margin:-3px 0 4px 4.2em">${note}</div>` : ''}`;
  const ks = allKeys().filter(k => arrived(k) && !S.st[k].gone);
  openOv('<h3>하루 시간표</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">서명우가 해와 별을 보고 그려 둔 표. 누가 언제 자리에 있는지.</div>'
    + `<div style="display:flex;margin-left:4.2em;font-size:11px;opacity:.6">${HOURS_NM.map((h, i) => `<span style="flex:1;text-align:center;${now === i ? 'color:#8a1a10;opacity:1' : ''}">${h}</span>`).join('')}</div>`
    + (S.rArrived ? row('한서진', h => h >= 6 && h < 22) : '')
    + ks.map(k => row(DEF(k).name, boardHours(k), S.errs[k] && S.errs[k].home ? '집에 다녀오는 중' : S.st[k].nightKeep ? '밤에도 남게 했다' : '')).join('')
    + '<div style="font-size:12px;opacity:.55;margin-top:8px">붉게 두른 칸이 지금이다.</div>');
}
M.timetable = model(8, 1, 10, (x, y, z) => x === 0 || x === 7 || z === 0 || z === 9 ? '#b8ad90' : z % 3 === 1 && x > 1 && x < 7 ? '#3a2e22' : '#d8cdb0');
LAB_OBJ.push({ id:'timetable', x:2, y:-24, z:7, rot:0, m:()=>'timetable', show:()=> arrived('smw'), click:()=>showTimetable() });
