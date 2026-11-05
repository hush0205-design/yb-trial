'use strict';
// ───────── 어둠 속에서 버티면 (10/7 선생님) ─────────
// 읽는 중 불이 꺼졌는데(08 updateThread) 책을 안 덮고 버티면 점점 압박. 나가는 트리거(실)를 더 세게 강조.
//  0초  훅, 책 어두워짐, 실이 푸르게 빛나며 떨림(기존). 어둠 속 넘김은 해독 0 + 겁 조금(06 flip)
//  8초  실이 크게 흔들리고 빛이 세짐
// 20초  여백에 붉은 글씨 '덮어라'가 번져 나옴(가훈 "모르는 것은 덮어라"와 같은 손) + 문 앞 그림자
// 35초  세 번 두드림, 풀렸던 글자가 한 줄씩 낯선 글자로 되돌아가 보임(화면만)
// 60초  손이 떨려 책을 놓침 — 저절로 덮이고 겁이 오름(안전망이자 절정). 스스로 덮으면 이 벌은 없음
const DARK_AT = [8000, 20000, 35000, 60000];
let darkT0 = 0, darkLv = 0, darkN = 0, darkNext = 0;
const darkWord = document.createElement('div');
darkWord.id = 'darkWord'; darkWord.textContent = '덮어라';
darkWord.style.cssText = 'position:absolute;left:50%;top:26%;transform:translateX(-50%);writing-mode:vertical-rl;font-size:36px;letter-spacing:8px;color:#7a1a10;opacity:0;filter:blur(1.6px);transition:opacity 4s;text-shadow:0 0 8px #7a1a10aa;z-index:4;pointer-events:none;font-family:"Nanum Myeongjo",serif';
book.appendChild(darkWord);
// 10/31 시험자 "등잔이 꺼진 걸 몰랐다" → 꺼지는 순간 심지 연기가 쪽 위로 지나가고 책이 한 번 확 어두워짐(글 없이) · 손이 떨려 놓칠 때마다 책 귀퉁이 그을음이 짙어짐(다음은 불)
const scorchOp = () => S.dropN ? 0.45 + 0.55 * (S.dropN - 1) / (K.fireDrops - 1) : 0;   // 한 번 놓치면 바로 보이고, 불 직전엔 짙게
function lampSmoke(){
  book.animate([{ filter:'brightness(1)' }, { filter:'brightness(0.2)' }, { filter:'brightness(1)' }], { duration: 1100, easing: 'ease-out' });
  for (let k = 0; k < 3; k++){ const w = document.createElement('div');
    w.style.cssText = `position:absolute;left:${30 + k * 14}%;bottom:8%;width:22%;height:70px;border-radius:50%;pointer-events:none;z-index:4;background:radial-gradient(ellipse, #8a847acc 0%, #8a847a00 70%);filter:blur(6px)`;
    book.appendChild(w);
    w.animate([{ transform:'translateY(0) scaleX(1)', opacity:0 }, { opacity:0.8, offset:0.2 }, { transform:`translateY(-${260 + k * 60}px) translateX(${(k - 1) * 30}px) scaleX(2.2)`, opacity:0 }], { duration: 2600 + k * 400, delay: k * 250, easing:'ease-out' }).onfinish = () => w.remove(); }
}
const darkOn = () => bookOpen && !!S.owned.lamp && !!S.lampOut && !coverBusy;
function darkReset(){
  darkT0 = 0; darkLv = 0; darkNext = 0;
  const th = document.getElementById('thread'); if (th) th.style.filter = '';
  darkWord.style.opacity = 0;
  if (darkN && bookOpen) renderFaces();                   // 되돌아갔던 글자를 제자리로(덮였으면 다음에 펼 때 새로 그림)
  darkN = 0;
}
function darkTick(){
  if (bookOpen){ const a = scorchOp(); faces.forEach(f => { f.style.boxShadow = a ? `inset -34px -40px 26px -14px rgba(14,6,2,${a.toFixed(2)}), inset -90px -110px 90px -30px rgba(110,46,12,${(a * 0.75).toFixed(2)}), inset 50px -60px 70px -34px rgba(90,36,10,${(a * 0.6).toFixed(2)})` : ''; }); }   // 쪽 귀퉁이 그을음(3D 쪽 위에 따로 얹으면 가려져서 쪽에 직접)
  if (!darkOn()){ if (darkT0){ if (!bookOpen) S.darkClose = (S.darkClose || 0) + 1; darkReset(); } return; }   // 어둠 속에서 스스로 덮음(19_feats 별호)
  const now = Date.now(); if (!darkT0){ darkT0 = now; S.darkEver = true; lampSmoke(); }
  const e = now - darkT0, th = document.getElementById('thread');
  if (e > 1500 && S.D >= T.fearOn) S.fear = Math.min(0.8, S.fear + 0.0004);   // 어둠 속에 있는 것만으로 겁이 조금씩
  if (darkLv < 1 && e >= DARK_AT[0]){ darkLv = 1; rustle(0.6, 0.14); }
  if (darkLv >= 1 && th) th.style.filter = `drop-shadow(0 0 ${Math.min(14, 5 + e/4000)}px #dfe6ffdd)`;
  if (darkLv < 2 && e >= DARK_AT[1]){ darkLv = 2; darkWord.style.opacity = 0.85;
    const ps = document.getElementById('passShadow'); if (ps){ ps.classList.remove('go'); void ps.offsetWidth; ps.classList.add('go'); }
    setTimeout(() => noise(0.12, 110, 0.35, 'lowpass'), 1500);
    if (typeof tlog === 'function') tlog('어둠 속 20초: 덮어라'); }
  if (darkLv < 3 && e >= DARK_AT[2]){ darkLv = 3; darkNext = now;
    [0, 260, 520].forEach(ms => setTimeout(() => noise(0.12, 110, 0.4, 'lowpass'), ms)); }
  if (darkLv >= 3 && now >= darkNext){ darkNext = now + 4000; darkN++;   // 4초마다 한 줄씩 낯선 글자로
    const Dv = Math.max(0, curB().D() - darkN * curB().per * 1.6);
    faces.forEach((f, i) => { f.innerHTML = faceInner(f.dataset.kind, Dv, false) + (i === 0 ? EAR : ''); });
    rustle(0.3, 0.08); }
  if (e >= DARK_AT[3]){
    darkReset(); S.fear = Math.min(0.8, S.fear + 0.2); S.dropN = (S.dropN || 0) + 1; save(); closeBook();   // dropN: 불이 번지다(19_ends)
    noise(0.5, 400, 0.14, 'lowpass');
    setTimeout(() => { if (!S.ended) queueOv('<h3>서고</h3>손이 떨려 책을 놓쳤다.<br>바람도 없이 불이 꺼져 있었다.<br><br>심지에 불씨가 남아 있다.<br>' + (S.dropN >= 2 ? '책 귀퉁이의 그을음이 더 번졌다.' : '책 귀퉁이가 그을렸다.')); }, 1400);   // 이 일로 대가 끝났으면 끝 장면 위에 겹치지 않게
    if (typeof tlog === 'function') tlog('어둠 속 60초: 책을 놓침');
  }
}
{ const ut = updateThread; updateThread = function(now){ ut(now); darkTick(); }; }
{ const dt0 = drawThread; drawThread = function(amp){ if (darkLv >= 1 && darkT0){ const e = Date.now() - darkT0; amp = Math.max(amp, Math.min(16, 7 + e/5000)); threadPh += 0.08; } dt0(amp); }; }   // 실이 크게, 빠르게 흔들림
