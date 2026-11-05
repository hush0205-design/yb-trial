'use strict';
// 흔적의 낱말(기획서 11-2·11-3·11-4): 신의 흔적이 있으면 책을 펴 둔 사이 여백에 그 낱말 하나가 누가 적은 듯 희미하게 비쳤다 스러짐 — 흔적마다 하루 한 번
const TRM_WORDS = { sun:['해', '둘', '떨어지다'], crawl:['천 년', '기다려라', '보지 마라'], kitchen:['보고', '입', '불씨'] };
const TRM_HAS = { sun:() => !!(S.deep && S.deep.sun), crawl:() => (S.crawlN || 0) > 0, kitchen:() => typeof kitchenDays === 'function' && kitchenDays() >= K.traceDays };
const trmEl = document.createElement('div'); trmEl.id = 'trmWord';
trmEl.style.cssText = 'position:absolute;left:30%;top:6%;font-size:12px;font-style:italic;color:#6a2a16;transform:rotate(-4deg);pointer-events:none;z-index:5;opacity:0;transition:opacity 2.5s';
book.appendChild(trmEl);
let trmAt = 0;
HOOK.tick.push((dt, now) => {
  if (trmAt && now - trmAt > K.trmShow){ trmEl.style.opacity = 0; trmAt = 0; }
  if (!bookOpen || trmAt) return;
  const d = dayKey(); S.trmDay = S.trmDay || {};
  const k = Object.keys(TRM_WORDS).find(t => S.trmDay[t] !== d && TRM_HAS[t]());
  if (!k) return;
  S.trmDay[k] = d; save();
  const w = TRM_WORDS[k]; trmEl.textContent = w[Math.floor(Math.random() * w.length)]; trmEl.style.opacity = K.trmAlpha; trmAt = now;
});
