'use strict';
// ───────── 조왕의 흔적: 남의 일이 적힌 일지 (기획서 11-4 신 4호 조왕, '흔적일 때 … 어떤 연구원 일지에 다른 연구원이 한 일이 적혀 있음') ─────────
// 부엌 재 속 숯이 눈 모양이 된 뒤(19_kitchen kitchenDays ≥ K.traceDays), 일반 연구원 창(12 showStaff → HOOK.ov)의 일지 끝에 가끔 한 줄.
// 다른 책상에 앉은 사람이 오늘 한 일 — 쓴 사람은 볼 수 없던 것. 하루·사람마다 정해져 있어 다시 열어도 같은 줄.
const JOWANG_HOUR = ['진시(辰時)', '사시(巳時)', '오시(午時)', '미시(未時)', '신시(申時)'];
const JOWANG_ORD = ['둘째', '셋째', '넷째', '다섯째', '일곱째'];
const JOWANG_BOOK = { first:'제목 없는 책', dongui:'동의보감', map:'지도' };
function jowangLine(k){
  const n = +k.slice(1), d = dayKey();
  if (hash(d, n) >= K.jowangP) return '';
  const others = allKeys().filter(j => j !== k && arrived(j) && !S.st[j].gone); if (!others.length) return '';
  const j = others[Math.floor(hash(d + 1, n) * others.length)], nm = josa(DEF(j).name, '이', '가'), r = hash(d + 2, n), pick = L => L[Math.floor(hash(d + 3, n) * L.length)];
  const bk = JOWANG_BOOK[S.st[j].item];
  if (r < 0.34 && DEF(j).tea !== false) return `${nm} ${pick(JOWANG_HOUR)}에 찻잔을 두 번 비웠다.`;
  if (r < 0.67) return `${nm} ${bk ? bk + '의 ' : ''}${pick(JOWANG_ORD)} 장에서 오래 멈췄다.`;
  return `${nm} 창밖을 보았다. ${pick(['두', '세', '네'])} 번.`;
}
HOOK.ov.push(() => {
  const h = ovBody.querySelector('h3'); if (!h || !h.textContent.startsWith('연구원 — ') || kitchenDays() < K.traceDays) return;
  const k = genKeys().find(g => h.textContent.startsWith(`연구원 — ${DEF(g).name}(`)); if (!k) return;
  const t = jowangLine(k), at = ovBody.querySelector('.bsec'); if (!t || !at) return;
  const div = document.createElement('div'); div.style.cssText = 'font-size:12px;opacity:.6;margin-top:6px'; div.textContent = `펼쳐 둔 일지 끝에 한 줄. 「${t}」`; at.before(div);
});
