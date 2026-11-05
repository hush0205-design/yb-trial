'use strict';
// ───────── 이름 넷이 적힌 장 (기획서 6절 💡 첫 책 3층 '신들의 목록' · 7절 4 '다 푼 책의 다음 층', ✳ 11/4) ─────────
// 첫 책을 다 풀면 표지 안쪽에 붙은 장이 들뜸 → 기록 「마지막 장 뒤」. 낯선 글자로 이름 넷. 흔적을 볼 때마다 그 이름 글자가 하나씩 읽힘(가문에 남음 — LINE.godSeen).
// 맨 윗줄(이 대의 주된 것)은 처음부터 두 자, 일지를 다 풀면 다 읽힘. 정체는 그 신을 주된 신으로 연구할 때 — 지금은 이름 몇 자뿐.
const GODS_ROWS = [['sea', '물 아래 임금', '아래물임금'], ['sun', '둘째 해', '해둘째'], ['imugi', '이무기', '기무이'], ['jowang', '조왕', '왕조']];   // 셋째: 읽히는 차례
const godsNow = () => ({ sea: S.sideRead.jour ? 9 : 2, sun: S.deep && S.deep.sun ? 1 : 0, imugi: (S.crawlN || 0) >= K.shedAfter ? 2 : (S.crawlN || 0) ? 1 : 0,
  jowang: typeof kitchenDays === 'function' && kitchenDays() >= K.traceDays ? 1 : 0 });
function godsRow(id, name, order, n){ const on = Array.from(order).slice(0, n);
  return alienHtml(Array.from(name).map((c, k) => c === ' ' || on.includes(c) ? c : glyphs(c, 700 + k * 13 + id.length)).join('')); }
function godsHtml(){ const now = godsNow(); LINE.godSeen = LINE.godSeen || {}; let ch = false;
  for (const k in now) if (now[k] > (LINE.godSeen[k] || 0)){ LINE.godSeen[k] = now[k]; ch = true; }
  if (ch) saveLine();
  return '<h3>마지막 장 뒤</h3><div style="font-size:13px;opacity:.75">첫 책 표지 안쪽에 붙어 있던 장. 이름 넷이 한 줄씩 적혀 있다. 맨 윗줄 곁에만 붉은 점이 찍혀 있다.</div>'
    + GODS_ROWS.map(([id, nm, od], i) => `<div style="font-size:20px;letter-spacing:6px;margin:14px 0 0 ${i ? 18 : 0}px">${i ? '' : '<span style="color:#8a2a1a">·</span> '}${godsRow(id, nm, od, LINE.godSeen[id] || 0)}</div>`).join(''); }
function godsRecs(recs){ if (bookDone('first')) recs.push(['마지막 장 뒤', godsHtml]); }
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended || S.godsNote || !bookDone('first')) return;
  S.godsNote = true; save(); pushNote('<h3>첫 책</h3>다 푼 책을 덮으려는데, 표지 안쪽에 붙은 장 하나가 들떠 있다.<br>이름이 넷 적혀 있다. 읽히는 글자는 몇 자 되지 않는다.'); });
