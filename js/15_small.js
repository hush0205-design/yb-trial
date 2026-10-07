'use strict';
// ───────── 작은 장면들과 배경 소리 (기획서 19절 — 페이블 제안에서 고른 것) ─────────

// 배경 소리: 낮게 부는 바람(늘), 밤엔 풀벌레, 낮엔 아주 가끔 먼 개 짖는 소리. 소리 끔 설정을 따름
let amb = null;
function startAmb(){
  const a = ac(); if (!a || amb) return;
  if (a.state === 'suspended') a.resume();
  const len = a.sampleRate * 3, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  let last = 0; for (let k = 0; k < len; k++){ last = last*0.985 + (Math.random()*2 - 1)*0.015; d[k] = last*6; }   // 낮게 웅웅대는 바람결
  const src = a.createBufferSource(); src.buffer = buf; src.loop = true;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
  const g = a.createGain(); g.gain.value = 0;
  const master = a.createGain(); master.gain.value = 0;
  src.connect(lp).connect(g).connect(master).connect(a.destination); src.start();
  amb = { a, g, master };
}
// 녹음한 배경 소리(snd/amb_*.mp3 — Pixabay, 이어 돌게 다듬음, 10/7 선생님): 바람은 늘, 풀벌레는 저녁~새벽, 파도는 바다 일이 시작된 뒤 멀리서
const AMB_FILES = { wind:'amb_wind', night:'amb_crickets', sea:'amb_sea' }, AMBL = {};
function ambLoopsStart(){
  for (const [k, n] of Object.entries(AMB_FILES)){
    if (AMBL[k]) continue;
    if (SND_WEB){ const a = ac(); if (!a) return;
      fetch('snd/' + n + '.mp3').then(r => r.arrayBuffer()).then(b => a.decodeAudioData(b)).then(buf => {
        const src = a.createBufferSource(), g = a.createGain(); src.buffer = buf; src.loop = true; g.gain.value = 0; src.connect(g).connect(a.destination); src.start();
        AMBL[k] = { set: v => g.gain.setTargetAtTime(v, a.currentTime, 1.5) }; }).catch(() => {}); }
    else { const el = new Audio('snd/' + n + '.mp3'); el.loop = true; el.volume = 0; el.play().catch(() => {}); AMBL[k] = { set: v => { el.volume = Math.max(0, Math.min(1, v)); } }; }
  }
}
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { startAmb(); ambLoopsStart(); }, { once:true }));
const seaNear = () => !!(S.goRead || (S.dig && S.dig.n) || (S.mapFound && (S.mapStudy || 0) >= 999));   // 바닷가 일이 시작된 뒤
function cricket(){
  const a = amb.a, t = a.currentTime, o = a.createOscillator(), g = a.createGain();
  o.frequency.value = 4300 + Math.random()*400; g.gain.value = 0; o.connect(g).connect(amb.master);
  for (let i = 0; i < 3; i++){ g.gain.setValueAtTime(0.012, t + i*0.09); g.gain.setValueAtTime(0, t + i*0.09 + 0.05); }
  o.start(t); o.stop(t + 0.32);
}
const dogBark = () => { noise(0.12, 650, 0.04); setTimeout(() => noise(0.12, 600, 0.03), 330); };
setInterval(() => {
  if (!amb) return;
  const t = amb.a.currentTime, on = !S.opt.mute && S.stage === 'room' ? 1 : 0;
  amb.master.gain.setTargetAtTime(on, t, 0.5);
  amb.g.gain.setTargetAtTime(AMBL.wind ? 0 : Math.max(0.01, 0.035 + 0.025*Math.sin(t*0.21)*Math.sin(t*0.13)), t, 1.5);   // 녹음 바람이 들어오면 합성 바람은 끔
  const h = gameHour(), out = S.scene === 'gate', dusk = h >= 19 || h < 5;
  if (AMBL.wind) AMBL.wind.set(on * (out ? 0.16 : 0.07) * (0.8 + 0.2*Math.sin(t*0.13)));          // 대문 밖에선 바람이 더 큼
  if (AMBL.night) AMBL.night.set(on * (dusk ? (out ? 0.16 : 0.09) : 0));
  if (AMBL.sea) AMBL.sea.set(on * (seaNear() ? (out ? 0.10 : 0.035) : 0));
  if (!on) return;
  // 풀벌레·개 짖는 소리는 합성음이 '삐비빅'처럼 들려 끔(10/7 선생님) — 진짜 녹음을 구하면 다시
}, 1000);

// 세 번 두드림: 편지는 늘 두 번 두드리는데, 한서진이 온 뒤 어느 밤 세 번 — 문 앞엔 아무것도 없고 기록도 남지 않음(1대에 두 번까지)
setInterval(() => {
  if (S.stage !== 'room' || !S.rArrived || !isNight() || (S.knock3 || 0) >= 2 || Math.random() > 0.06) return;
  S.knock3 = (S.knock3 || 0) + 1; S.knock3At = Date.now(); save();   // 1분 반 안에 대문에 나가 보면 기이록(19_odd)
  [0, 260, 520].forEach(ms => setTimeout(() => noise(0.12, 110, 0.4, 'lowpass'), ms));
}, 60000);

// 먼지: 사흘 넘게 비우면 서안에 먼지 — 닦으려 하면 먼지 위에 이미 손가락 자국(손해는 없음)
if (S.stage === 'room' && S.lastSeen && Date.now() - S.lastSeen > 3*86400e3) S.dust = Math.min(3, 1 + Math.floor((Date.now() - S.lastSeen) / (7*86400e3)));
M.dust = model(24,8,1,(x,y)=> (x === 9 + Math.floor(y/3) || x === 12 + Math.floor(y/3)) && y > 1 && y < 7 ? null : ((x*3 + y*5) % 4 ? '#8c8478' : '#9a9286'));   // 먼지 층, 책 쪽으로 난 손가락 자국 둘
OBJ.push({ id:'dust', x:0, y:3, z:8, rot:0, m:()=>'dust', on:()=>'desk', onOrder:0.03, alpha:()=> 0.25 + 0.15*(S.dust||0),
  show:()=> !!S.dust && !!S.owned.desk,
  click:()=>wipeDust() });
function wipeDust(){ S.dust = 0; save(); noise(0.5, 2400, 0.03);
  openOv('<h3>먼지</h3>오래 비운 사이 서안에 먼지가 앉았다.<br>닦으려다 손이 멈췄다. 먼지 위에 이미 손가락 자국이 나 있다.<br>책 쪽으로.<br><br>닦아 냈다.'); }
{ const dc0 = deskClick; deskClick = () => { if (S.dust && S.owned.desk) return wipeDust(); dc0(); }; }   // 서안을 눌러도 먼저 먼지부터

// 저절로 접힌 귀: 한서진이 온 뒤 하루에 한 번, 책을 펴면 장 귀퉁이가 접혀 있음 → 펴면 여백의 다른 손 글씨(시조의 흔적)
const MARGIN = ['네가 읽는 동안 나도 쓴다.', '두려움을 다 마시지 마라.', '끝은 읽는 이가 쓴다.', '바다는 서두르지 않는다.', '빈 칸은 네 것이다.', '마지막 장 앞에서 붓을 놓았다.'];
const foldEl = document.createElement('div'); foldEl.id = 'foldEar'; book.appendChild(foldEl);
setInterval(() => {
  const want = bookOpen && !!S.rArrived && S.foldDay !== dayKey() && (S.margins || []).length < MARGIN.length;
  foldEl.classList.toggle('on', want);
}, 700);
foldEl.addEventListener('click', e => {
  e.stopPropagation(); if (!foldEl.classList.contains('on')) return;
  S.margins = S.margins || []; const line = MARGIN[S.margins.length];
  S.margins.push(line); S.foldDay = dayKey(); save(); foldEl.classList.remove('on'); sFlip();
  openOv(`<h3>접힌 귀</h3>누군가 이 장의 귀를 접어 두었다. 내가 접은 적은 없다.<br>펴 보니 여백에 아주 작은 글씨가 있다.<br><br><span style="color:#6a2a16;font-style:italic">${line}</span>`);
});
{ const br0 = buildRecs; buildRecs = () => { const r = br0(); if (S.margins && S.margins.length) r.push(['여백에서 찾은 글씨', () => '<h3>여백에서 찾은 글씨</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">접혀 있던 장의 여백. 같은 손이다.</div>' + S.margins.map(l => `<div style="color:#6a2a16;font-style:italic;margin:6px 0">${l}</div>`).join('')]); return r; }; }

// 남는 찻잔(전 이름 '열세 번째 찻잔' — 10/6 숫자로 세지 않기로): 오정림이 온 뒤, 아무도 안 앉은 별채 책상에 반쯤 빈 찻잔 + 오정림 일지 한 편
LAB_OBJ.push({ id:'ghostCup', get x(){ const d = ghostDesk(); return d ? LAB_DESKS[d][0] + 3.5 : 0; }, get y(){ const d = ghostDesk(); return d ? LAB_DESKS[d][1] + 1.5 : 0; }, z:11, rot:0, m:()=>'cup',
  on:()=> ghostDesk(), onOrder:0.02, show:()=> arrived('ojr') && !!ghostDesk(),
  click:()=>openOv('<h3>찻잔</h3>아무도 앉지 않은 책상에 찻잔이 놓여 있다.<br>반쯤 비었다. 아직 따뜻하다.') });
function ghostDesk(){ return DESK_IDS.find(d => S.owned[d] && !deskOwner(d)) || null; }
STAFF.ojr.diary.push([900, '오늘 찻잔을 거두니 사람 수보다 하나 많았다. 누가 마셨는지 모르겠다. 잔을 하나 더 씻었다.']);

// 덮은 뒤 잔상: 책을 덮으면 마지막에 읽던 줄이 서고 화면에 잠깐 비쳤다 사라짐(나중엔 광기가 오를수록 오래 남음)
const afterEl = document.createElement('div'); afterEl.id = 'afterimg'; document.body.appendChild(afterEl);
{ const cb0 = closeBook; closeBook = function(){
    const lines = [...facesEl.querySelectorAll('.ln')].map(el => el.innerText.trim()).filter(t => /[가-힣]{2}/.test(t));   // 풀린 글이 있는 줄만
    const t = lines[lines.length - 1];
    cb0();
    if (t){ afterEl.textContent = t.slice(0, 24); afterEl.classList.remove('go'); void afterEl.offsetWidth; setTimeout(() => afterEl.classList.add('go'), 1150); }
  }; }
