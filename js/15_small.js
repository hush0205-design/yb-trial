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
// 파도 겹쳐 쓰기(10/7 선생님 "여러 파도 소리를 섞어 자연스럽게"): 먼 바다는 amb_sea를 바닥으로 작게 깔고, 그 위에 낱파도(snd/wave1~5 — 한 파도가 밀려왔다 빠지는 5초)를
// 5~12초 간격으로 무작위 하나씩 — 크기·높낮이·좌우 자리를 조금씩 다르게. 49초짜리 녹음이 되풀이되는 느낌이 없어짐. 대문 밖에선 낱파도가 가깝게(크게).
const WAVE_N = 5, WAVE_BUF = {}, WAVE_EL = {};
let waveNext = 0;
function waveLoad(){
  for (let i = 1; i <= WAVE_N; i++){ const n = 'wave' + i; if (WAVE_BUF[n] || WAVE_EL[n]) continue;
    if (SND_WEB){ const a = ac(); if (!a) return; fetch('snd/' + n + '.mp3').then(r => r.arrayBuffer()).then(b => a.decodeAudioData(b)).then(buf => { WAVE_BUF[n] = buf; }).catch(() => {}); }
    else { const el = new Audio('snd/' + n + '.mp3'); el.preload = 'auto'; WAVE_EL[n] = el; } }
}
function waveOne(vol){
  const n = 'wave' + (1 + Math.floor(Math.random() * WAVE_N)), rate = 0.9 + Math.random() * 0.2;
  if (SND_WEB){ const a = ac(), buf = WAVE_BUF[n]; if (!a || !buf) return;
    const src = a.createBufferSource(), g = a.createGain(); src.buffer = buf; src.playbackRate.value = rate; g.gain.value = vol; src.connect(g);
    let last = g; if (a.createStereoPanner){ const p = a.createStereoPanner(); p.pan.value = (Math.random() - 0.5) * 0.7; g.connect(p); last = p; }
    last.connect(a.destination); src.start(); return; }
  const base = WAVE_EL[n]; if (!base || base.error) return;
  const el = base.cloneNode(); el.volume = Math.max(0, Math.min(1, vol)); el.playbackRate = rate; el.preservesPitch = false; el.play().catch(() => {});
}
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { startAmb(); ambLoopsStart(); waveLoad(); }, { once:true }));
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
  if (AMBL.sea) AMBL.sea.set(on * (seaNear() ? (out ? 0.08 : 0.035) : 0));                                 // 바닥: 먼 바다(낱파도 밑에 깔림)
  if (on && seaNear() && Date.now() >= waveNext){ waveNext = Date.now() + 5000 + Math.random() * 7000; waveOne((out ? 0.24 : 0.11) * (0.7 + Math.random() * 0.6) * (typeof seaBoxK === 'function' ? seaBoxK() : 1)); }   // 바다 궤가 차면 밤 파도가 커짐(19_sea)   // 낱파도 하나
  if (!on) return;
  // 풀벌레·개 짖는 소리는 합성음이 '삐비빅'처럼 들려 끔(10/7 선생님) — 진짜 녹음을 구하면 다시
}, 1000);

// 첫 넘김 힌트(10/28 시험자 "처음에 뭘 해야 할지 몰랐다"): 처음 몇 쪽 동안 책을 펴 두고 가만있으면 아래 귀퉁이가 바람에 들린 듯 들썩 — 귀퉁이엔 늘 앞사람들의 손때(style.css #ear)
let earLiftAt = 0;
HOOK.tick.push((dt, now) => { if (!bookOpen || (S.earned || 0) >= K.earHintPages) return;
  if (now - lastFlip < K.earHintIdle || now - bookOpenedAt < K.earHintIdle || now - earLiftAt < K.earHintEvery) return;
  const e = document.getElementById('ear'); if (!e) return;
  earLiftAt = now; e.classList.remove('lift'); void e.offsetWidth; e.classList.add('lift'); rustle(0.5, 0.05);
  const r = e.getBoundingClientRect(); bookView.style.setProperty('--ex', (r.left + 15) + 'px'); bookView.style.setProperty('--ey', (r.bottom - 15) + 'px');
  bookView.classList.add('earLit'); setTimeout(() => bookView.classList.remove('earLit'), 1300); });

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
  const want = bookOpen && !!S.rArrived && dayKey() > dayKeyAt(S.rArrived) && S.foldDay !== dayKey() && (S.margins || []).length < MARGIN.length;
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
// 밤의 빈 책상 그림자(기획서 14절 숨은 장치): 어떤 밤엔 빈 책상에 아주 희미한 사람 그림자가 앉아 있음 — 누르면 사라지고 기록이 남지 않음
M.ghostSit = model(6, 5, 12, (x, y, z) => { if (z >= 10) return x >= 2 && x <= 3 && y >= 1 && y <= 3 ? '#14110e' : null; if (z >= 5) return x >= 1 && x <= 4 && y >= 1 && y <= 3 ? '#1a1612' : null; return x >= 1 && x <= 4 && y <= 3 ? '#1a1612' : null; });
const ghostNight = () => isNight() && !!ghostDesk() && hash(dayKey(), 13) < 0.5 && S.ghostGone !== dayKey();
LAB_OBJ.push({ id:'ghostSit', get x(){ const d = ghostDesk(); return d ? LAB_DESKS[d][0] : 0; }, get y(){ const d = ghostDesk(); return d ? LAB_DESKS[d][1] - 6 : 0; }, rot:0, m:()=>'ghostSit',
  show:()=> ghostNight(), alpha:()=> 0.16 + 0.04*Math.sin(performance.now()/900), click:()=>{ S.ghostGone = dayKey(); save(); } });
STAFF.ojr.diary.push([900, '오늘 찻잔을 거두니 사람 수보다 하나 많았다. 누가 마셨는지 모르겠다. 잔을 하나 더 씻었다.']);

// 덮은 뒤 잔상: 책을 덮으면 마지막에 읽던 줄이 서고 화면에 잠깐 비쳤다 사라짐(나중엔 광기가 오를수록 오래 남음)
const afterEl = document.createElement('div'); afterEl.id = 'afterimg'; document.body.appendChild(afterEl);
{ const cb0 = closeBook; closeBook = function(){
    const lines = [...facesEl.querySelectorAll('.ln')].map(el => el.innerText.trim()).filter(t => /[가-힣]{2}/.test(t));   // 풀린 글이 있는 줄만
    const t = lines[lines.length - 1];
    cb0();
    if (t){ afterEl.textContent = t.slice(0, 24); afterEl.classList.remove('go'); void afterEl.offsetWidth; setTimeout(() => afterEl.classList.add('go'), 1150); }
  }; }
// 종이 더미(10/31 선생님 "숫자가 커지는 걸 눈으로"): 다 넘긴 장을 버리지 못해 궤짝 곁에 쌓아 둠 — 넘긴 총량(S.earned)이 K.pileAt에 닿을 때마다 한 층씩 높아짐
const pileLv = () => K.pileAt.filter(n => (S.earned || 0) >= n).length;
for (let lv = 1; lv <= K.pileAt.length; lv++){ const w = 7 + lv * 2, d = 6 + lv, h = 2 + lv;   // 높이보다 옆으로 퍼짐(서안 앞을 가리지 않게)
  M['pile' + lv] = model(w, d, h, (x, y, z) => {
    const r = Math.hypot((x - w / 2) / (w / 2), (y - d / 2) / (d / 2)) + (hash(x * 31 + y, z) - 0.5) * 0.25;   // 가운데가 높은 더미, 가장자리는 들쭉날쭉
    if (r > 1 - z / (h + 1)) return null;
    if (z === h - 1 || r > 0.98 - (z + 1) / (h + 1)) return (x * 7 + y * 3 + z) % 13 === 0 ? '#2a2018' : (x + y + z) % 4 ? '#cfc2a0' : '#bdb08c';   // 겉 장엔 먹 자국
    return '#a89a78';
  }); }
OBJ.push({ id:'pile', x:-16, y:25, rot:0.15, m:()=>'pile' + pileLv(), show:()=> !!S.owned.desk && pileLv() > 0,
  click:()=>openOv(`<h3>종이 더미</h3>다 넘긴 장들. 버리지 못하고 궤짝 곁에 쌓아 두었다.<br>어림잡아 ${fmtP(S.earned || 0)}.${pileLv() >= 4 ? '<br>맨 위 장의 먹이 아직 마르지 않았다.' : ''}`) });
// 처음 펴는 책(PC 두 면): 표지가 왼쪽 면 자리라 오른쪽 빈자리를 눌러도 펴지게(10/31 시험자)
stage.addEventListener('click', e => { if (!bookOpen && cover.onclick && !cover.contains(e.target)) cover.onclick(e); });
// 창이 화면보다 길면 아래 흐림+▾(style.css .hanji.more) — 끝까지 내리면 사라짐
const ovMore = () => ovBody.classList.toggle('more', ovBody.scrollHeight - ovBody.scrollTop - ovBody.clientHeight > 12);
HOOK.ov.push(() => setTimeout(ovMore, 50)); ovBody.addEventListener('scroll', ovMore);
// 첫 책(10/31 시험자 "책을 한 번도 안 덮으면 등잔이 끝내 안 생긴다 · 셈만 오르는 5분"):
// ① 등잔이 나타날 만큼 읽으면 바람도 없이 책이 한 번 저절로 덮임 → 방에 흐린 등잔이 보임(한 대에 한 번)
// ② 첫 책의 한 줄이 다 풀리는 순간 그 줄이 쪽 위로 또렷하게 떠올랐다 스러짐(폰에서도 읽히게)
const lineFloat = document.createElement('div');
lineFloat.style.cssText = 'position:absolute;left:8%;right:8%;top:38%;text-align:center;font-size:21px;line-height:1.6;color:#2a1a0e;text-shadow:0 0 10px #f3e6c4,0 0 18px #f3e6c4;pointer-events:none;z-index:5;opacity:0';
book.appendChild(lineFloat);
HOOK.tick.push(() => {
  if (S.stage !== 'room' || S.ended || !bookOpen) return;
  const lamp = OBJ.find(o => o.id === 'lamp');
  if (!S.autoShut && !S.owned.lamp && readTotal() >= lamp.buy.cost){ S.autoShut = true; save();
    setTimeout(() => { if (!bookOpen) return; noise(0.5, 600, 0.1, 'lowpass'); closeBook(); if (typeof tlog === 'function') tlog('첫 책이 저절로 덮임'); }, 900); }
  if ((S.curBook || 'first') !== 'first') return;
  const n = LINES.filter((_, i) => S.D >= lineDone(i)).length;
  if (S.lineSeen == null || n < S.lineSeen){ S.lineSeen = n; return; }   // 처음 켤 때·새 대는 조용히 맞춤
  if (n === S.lineSeen) return;
  S.lineSeen = n; save();
  lineFloat.textContent = showText(n - 1);
  lineFloat.animate([{ opacity:0, filter:'blur(3px)' }, { opacity:1, filter:'blur(0)', offset:0.18 }, { opacity:1, offset:0.75 }, { opacity:0, filter:'blur(2px)' }], { duration: 4200, easing:'ease-out' });
});
