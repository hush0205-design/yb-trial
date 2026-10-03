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
function rustle(dur, gain){
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
const sFlip = () => rustle(0.42, 0.22);
const sBoil = () => noise(2.6, 380, 0.09, 'lowpass');
const sPlace = () => noise(0.14, 140, 0.35, 'lowpass');

