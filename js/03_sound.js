'use strict';
// ───────── 소리 ─────────
let AC = null;
function ac(){ if (!AC) { try { AC = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){} } return AC; }
function noise(dur, freq, gain, type='bandpass'){
  if (S.opt.mute) return; const a = ac(); if (!a) return;
  const len = Math.floor(a.sampleRate*dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let k=0;k<len;k++) d[k] = (Math.random()*2-1) * Math.pow(1-k/len, 2);
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = a.createGain(); g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination); src.start();
}
function rustleSynth(dur, gain){
  if (S.opt.mute) return; const a = ac(); if (!a) return;
  const len = Math.floor(a.sampleRate*dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  let grain = 0;
  for (let k=0;k<len;k++){
    const t = k/len, env = Math.min(1, t/0.18) * Math.pow(1 - t, 1.6);          // 천천히 올라 길게 사그라듦
    if (k % 180 === 0) grain = 0.35 + Math.random()*0.65;                         // 종이가 사각거리는 결
    d[k] = (Math.random()*2 - 1) * env * grain;
  }
  const src = a.createBufferSource(); src.buffer = buf;
  const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200 + Math.random()*900; bp.Q.value = 0.6;
  const g = a.createGain(); g.gain.value = gain;
  src.connect(hp).connect(bp).connect(g).connect(a.destination); src.start();
}
// ── 녹음한 소리(snd/ — Kenney 'RPG Audio', CC0. 10/7 선생님 "소리가 부자연스럽다") ──
// <audio>로 틀어서 컴퓨터에서 파일을 바로 열어도 남. 파일을 못 틀면 예전 합성 소리로.
const SND = {
  flip:['bookFlip1', 'bookFlip2', 'bookFlip3'], open:['bookOpen'], close:['bookClose'], place:['bookPlace1', 'bookPlace2', 'bookPlace3'],
  doorO:['doorOpen_1', 'doorOpen_2'], doorC:['doorClose_1', 'doorClose_2'], step:['footstep00', 'footstep01', 'footstep02', 'footstep03'],
  coin:['handleCoins', 'handleCoins2'], creak:['creak1', 'creak2', 'creak3'], latch:['metalLatch'], pot:['metalPot1'], cloth:['cloth1', 'cloth2'],
};
// 웹(공개 주소)에선 Web Audio로 풀어 두고 틈(음량)을 맞춤 — 아이폰은 <audio>의 음량 조절을 무시함. 파일을 바로 연 컴퓨터(file://)에선 <audio>로.
const SND_WEB = /^https?:/.test(location.protocol), SND_EL = {}, SND_BUF = {};
for (const L of Object.values(SND)) for (const n of L){
  if (SND_WEB) fetch('snd/' + n + '.mp3').then(r => r.arrayBuffer()).then(b => { SND_BUF[n] = b; }).catch(() => {});
  else { const a = new Audio('snd/' + n + '.mp3'); a.preload = 'auto'; SND_EL[n] = a; }
}
function play(kind, vol = 0.4, rate = 1){
  if (S.opt.mute) return true; const L = SND[kind]; if (!L) return false;
  const n = L[Math.floor(Math.random() * L.length)];
  if (SND_WEB){
    const a = ac(), raw = SND_BUF[n]; if (!a || !raw) return false;
    const go = buf => { const src = a.createBufferSource(), g = a.createGain(); src.buffer = buf; src.playbackRate.value = rate; g.gain.value = vol; src.connect(g).connect(a.destination); src.start(); };
    if (raw instanceof AudioBuffer) go(raw);
    else a.decodeAudioData(raw.slice(0), buf => { SND_BUF[n] = buf; go(buf); }, () => {});
    return true;
  }
  const base = SND_EL[n]; if (!base || base.error) return false;
  const el = base.cloneNode(); el.volume = Math.max(0, Math.min(1, vol)); el.playbackRate = rate; el.preservesPitch = false;
  el.play().catch(() => {}); return true;
}
const vary = () => 0.92 + Math.random() * 0.16;
function rustle(dur, gain){ if (!play('flip', Math.min(0.35, gain * 1.8), vary())) rustleSynth(dur, gain); }   // 저절로 넘어가는 장·지도 펼침
const sFlip = () => { if (!play('flip', 0.32, vary())) rustleSynth(0.42, 0.22); };
const sBoil = () => noise(2.6, 380, 0.09, 'lowpass');
const sPlace = () => { if (!play('place', 0.28, vary())) noise(0.14, 140, 0.35, 'lowpass'); };
const sCoin = () => { if (!play('coin', 0.3)) { noise(0.08, 3000, 0.04); setTimeout(() => noise(0.06, 2600, 0.03), 90); } };
const sStep = g => { if (!play('step', Math.min(0.25, g * 0.9), vary())) noise(0.08, 220, g, 'lowpass'); };
const sChair = g => { if (!play('creak', Math.min(0.2, g * 1.4), 0.9 + Math.random() * 0.2)) noise(0.5, 320, g, 'lowpass'); };
const sBookOpen = () => { if (!play('open', 0.35)) noise(0.35, 700, 0.12, 'lowpass'); };
const sBookClose = () => { if (!play('close', 0.35)) noise(0.3, 500, 0.12, 'lowpass'); };
const sDoor = () => { if (!play('doorO', 0.25)) { noise(0.35, 240, 0.12, 'lowpass'); setTimeout(() => noise(0.12, 110, 0.3, 'lowpass'), 300); } else setTimeout(() => play('doorC', 0.22), 450); };
const sLatch = () => { if (!play('latch', 0.4)) { noise(0.4, 300, 0.12, 'lowpass'); setTimeout(() => noise(0.15, 160, 0.2, 'lowpass'), 350); } };

