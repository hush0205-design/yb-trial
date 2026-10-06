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
const darkOn = () => bookOpen && !!S.owned.lamp && !!S.lampOut && !coverBusy;
function darkReset(){
  darkT0 = 0; darkLv = 0; darkNext = 0;
  const th = document.getElementById('thread'); if (th) th.style.filter = '';
  darkWord.style.opacity = 0;
  if (darkN && bookOpen) renderFaces();                   // 되돌아갔던 글자를 제자리로(덮였으면 다음에 펼 때 새로 그림)
  darkN = 0;
}
function darkTick(){
  if (!darkOn()){ if (darkT0) darkReset(); return; }
  const now = Date.now(); if (!darkT0) darkT0 = now;
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
    darkReset(); S.fear = Math.min(0.8, S.fear + 0.2); save(); closeBook();
    noise(0.5, 400, 0.14, 'lowpass');
    setTimeout(() => queueOv('<h3>서고</h3>손이 떨려 책을 놓쳤다.<br>바람도 없이 불이 꺼져 있었다.<br><br>심지에 불씨가 남아 있다.'), 1400);
    if (typeof tlog === 'function') tlog('어둠 속 60초: 책을 놓침');
  }
}
{ const ut = updateThread; updateThread = function(now){ ut(now); darkTick(); }; }
{ const dt0 = drawThread; drawThread = function(amp){ if (darkLv >= 1 && darkT0){ const e = Date.now() - darkT0; amp = Math.max(amp, Math.min(16, 7 + e/5000)); threadPh += 0.08; } dt0(amp); }; }   // 실이 크게, 빠르게 흔들림
