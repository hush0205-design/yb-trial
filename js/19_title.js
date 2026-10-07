'use strict';
// ───────── 제목 (기획서 12·12-2, 10/7 선생님 — 10/8 19_rebirth에서 나눔) ─────────
// 게임 제목 「여백 — 읽는 자」(첫 화면 □□ — □□□). 첫 책 표지 제목표(06_turn)는 해독도에 따라 한 글자씩 풀리고, 마지막 한 글자는 심해의 왕 엔딩 전엔 안 풀림.
// 다음 신부터는 부제만 다시 □로 가려졌다가 그 신의 엔딩에서 풀림(그때 만듦). 「쓰는 자」는 큰 엔딩에서만.
const TITLE = ['여', '백', '읽', '는', '자'];
const TITLE_AT = () => [lineDone(7), J0, lineDone(16), T.jEnd];      // 장부를 다 풂 → 족보에 들어섬 → 13세 줄 → 족보 끝
function titleSlip(){
  const n = TITLE_AT().filter(t => S.D >= t).length + (LINE.ending && LINE.ending.deep ? 1 : 0);
  const c = TITLE.map((ch, i) => i < n ? ch : '□');
  return c[0] + c[1] + '　' + c[2] + c[3] + c[4];
}
if (LINE.ending && LINE.ending.deep){ document.title = '여백 — 읽는 자'; document.getElementById('title').textContent = '여백 — 읽는 자'; }
