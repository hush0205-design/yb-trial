'use strict';
// ───────── 광기의 환각 (11/7 선생님 "심해지면 촉수도 보이고 뭐가 기어다니고 — 계속 그러는 건 아니고 가끔씩, 갑자기 눈이 생겨서 쳐다보고 간다던가") ─────────
// 가주 광기 5단계부터 몇 분에 한 번, 잠깐: 눈(5~) · 기어가는 것(6~) · 촉수(8~). 깊어질수록 자주·크게. 화면 맨 위 투명 그림판에 그림(누르기는 막지 않음).
const MADFX = { cv: null, g: null, list: [], next: 0, raf: 0, mx: innerWidth / 2, my: innerHeight / 2 };
addEventListener('pointermove', e => { MADFX.mx = e.clientX; MADFX.my = e.clientY; }, { passive: true });
function madfxCanvas(){
  if (MADFX.cv) return MADFX.cv;
  const c = document.createElement('canvas'); c.id = 'madFx';
  c.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60';
  document.body.appendChild(c); MADFX.cv = c; MADFX.g = c.getContext('2d'); return c;
}
const madfxGap = st => (K.madFxGap[0] + Math.random() * (K.madFxGap[1] - K.madFxGap[0])) * 1000 * Math.max(0.35, (14 - st) / 9);   // 5단계 4~9분 · 12단계 1~3분쯤
function madfxSpawn(kind, at){
  const W = innerWidth, H = innerHeight, st = typeof myMad === 'function' ? myMad() : 5, big = Math.min(1.6, 0.8 + st * 0.07);
  if (kind === 'eye') MADFX.list.push(Object.assign({ kind, t0: performance.now(), dur: 3400, x: W * (0.15 + Math.random() * 0.7), y: H * (0.15 + Math.random() * 0.6), r: (22 + Math.random() * 22) * big }, at || {}));
  else if (kind === 'crawl'){ const left = Math.random() < 0.5, y0 = H * (0.2 + Math.random() * 0.6);
    MADFX.list.push({ kind, t0: performance.now(), dur: 2600 + Math.random() * 1600, p0: [left ? -60 : W + 60, y0], p1: [W * (0.3 + Math.random() * 0.4), H * (0.2 + Math.random() * 0.6)], p2: [left ? W + 60 : -60, H * (0.2 + Math.random() * 0.6)], n: 12 + Math.floor(Math.random() * 6), s: 5 * big }); }
  else { const side = Math.floor(Math.random() * 4), n = 1 + Math.floor(Math.random() * Math.min(3, st - 6)), arms = [];
    for (let i = 0; i < n; i++){ const u = 0.2 + Math.random() * 0.6, base = side === 0 ? [W * u, -8] : side === 1 ? [W + 8, H * u] : side === 2 ? [W * u, H + 8] : [-8, H * u];
      const ang = [Math.PI / 2, Math.PI, -Math.PI / 2, 0][side] + (Math.random() - 0.5) * 0.7; arms.push({ base, ang, L: (H * 0.25 + Math.random() * H * 0.2) * big, w: (14 + Math.random() * 8) * big, ph: Math.random() * 6 }); }
    MADFX.list.push({ kind: 'tent', t0: performance.now(), dur: 4200, arms }); }
  if (typeof noise === 'function') noise(0.5, kind === 'eye' ? 180 : 420, 0.035, 'bandpass');
  if (typeof tlog === 'function') tlog('환각: ' + kind);
  madfxCanvas(); if (!MADFX.raf) MADFX.raf = requestAnimationFrame(madfxDraw);
}
function madfxEye(g, e, k){
  const open = k < 0.15 ? k / 0.15 : k > 0.85 ? (1 - k) / 0.15 : (Math.abs(k - 0.55) < 0.03 ? 0.1 : 1);   // 뜨고 · 한 번 깜박 · 감음
  const { x, y, r } = e, h = r * 0.55 * open;
  g.save(); g.globalAlpha = 0.92;
  const sh = g.createRadialGradient(x, y, r * 0.3, x, y, r * 1.6); sh.addColorStop(0, 'rgba(20,12,8,.55)'); sh.addColorStop(1, 'rgba(20,12,8,0)');   // 눈두덩 먹 그늘
  g.fillStyle = sh; g.beginPath(); g.ellipse(x, y, r * 1.6, r * 0.9, 0, 0, Math.PI * 2); g.fill();
  if (h > 0.5){
    g.beginPath(); g.moveTo(x - r, y); g.quadraticCurveTo(x, y - h * 2, x + r, y); g.quadraticCurveTo(x, y + h * 2, x - r, y); g.closePath();
    g.save(); g.clip();
    g.fillStyle = '#e9e1cc'; g.fillRect(x - r, y - r, r * 2, r * 2);
    g.strokeStyle = 'rgba(150,30,24,.55)'; g.lineWidth = 1; for (let i = 0; i < 6; i++){ const a = i * 1.1 + e.r; g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.5); g.quadraticCurveTo(x + Math.cos(a + 0.3) * r * 0.6, y + Math.sin(a) * r * 0.2, x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.15); g.stroke(); }   // 핏줄
    const dx = MADFX.mx - x, dy = MADFX.my - y, dd = Math.hypot(dx, dy) || 1, look = Math.min(r * 0.38, dd * 0.1), ix = x + dx / dd * look, iy = y + dy / dd * look * 0.6;   // 누르는 쪽(가주)을 봄
    const ir = g.createRadialGradient(ix, iy, 0, ix, iy, r * 0.42); ir.addColorStop(0, '#d8a040'); ir.addColorStop(0.7, '#7a4a18'); ir.addColorStop(1, '#2a160a');
    g.fillStyle = ir; g.beginPath(); g.arc(ix, iy, r * 0.42, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#050302'; g.beginPath(); g.ellipse(ix, iy, r * 0.07, r * 0.32, 0, 0, Math.PI * 2); g.fill();   // 세로로 찢어진 동공
    g.restore();
    g.strokeStyle = 'rgba(16,10,6,.95)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - r, y); g.quadraticCurveTo(x, y - h * 2, x + r, y); g.quadraticCurveTo(x, y + h * 2, x - r, y); g.stroke();
  } else { g.strokeStyle = 'rgba(16,10,6,.9)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - r, y); g.quadraticCurveTo(x, y + r * 0.12, x + r, y); g.stroke(); }   // 감긴 금
  g.restore();
}
function madfxCrawl(g, c, k, now){
  const P = t => { const u = 1 - t; return [u * u * c.p0[0] + 2 * u * t * c.p1[0] + t * t * c.p2[0], u * u * c.p0[1] + 2 * u * t * c.p1[1] + t * t * c.p2[1]]; };
  const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   // 멈칫했다 빨라짐
  g.save(); g.fillStyle = 'rgba(14,10,8,.94)'; g.strokeStyle = 'rgba(14,10,8,.9)'; g.lineCap = 'round';
  for (let i = c.n - 1; i >= 0; i--){
    const t = Math.max(0, ease - i * 0.012), [x, y] = P(t), [x2, y2] = P(Math.max(0, t - 0.004)), a = Math.atan2(y - y2, x - x2), s = c.s * (i === 0 ? 1.4 : 1 - i / (c.n * 1.6));
    g.beginPath(); g.ellipse(x, y, s * 1.3, s, a, 0, Math.PI * 2); g.fill();
    g.lineWidth = Math.max(0.8, s * 0.28); const wig = Math.sin(now / 45 + i * 1.7) * 0.6;   // 다리
    for (const sd of [-1, 1]){ const la = a + sd * (Math.PI / 2 + wig * sd); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(la) * s * 3, y + Math.sin(la) * s * 3); g.lineTo(x + Math.cos(la + sd * 0.6) * s * 4.2, y + Math.sin(la + sd * 0.6) * s * 4.2); g.stroke(); }
    if (i === 0){ g.lineWidth = 1; for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + sd * 0.4) * s * 4, y + Math.sin(a + sd * 0.4) * s * 4, x + Math.cos(a + sd * 0.2 + wig * 0.3) * s * 6, y + Math.sin(a + sd * 0.2 + wig * 0.3) * s * 6); g.stroke(); } }   // 더듬이
  }
  g.restore();
}
function madfxTent(g, T, k, now){
  const ext = k < 0.3 ? k / 0.3 : k > 0.75 ? Math.max(0, (1 - k) / 0.25) : 1;   // 뻗고 · 꿈틀 · 거둠
  for (const a of T.arms){
    const N = 34, pts = [];
    for (let i = 0; i <= N; i++){ const u = i / N, d = u * a.L * ext, curl = Math.sin(u * 5 + now / 380 + a.ph) * 0.55 * u + (u > 0.75 ? (u - 0.75) * 3.2 * Math.sin(now / 600 + a.ph) : 0);
      const ang = a.ang + curl, prev = pts[i - 1] || a.base; pts.push(i ? [prev[0] + Math.cos(ang) * a.L * ext / N, prev[1] + Math.sin(ang) * a.L * ext / N] : a.base); void d; }
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [col, add] of [['rgba(96,62,52,.55)', 3], ['rgba(20,13,11,.95)', 0]])   // 살결 테두리 · 속
      for (let i = 0; i < N; i++){ const [x, y] = pts[i], [x2, y2] = pts[i + 1], w = a.w * (1 - i / N) + 1.5 + add; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); }
    g.fillStyle = 'rgba(200,170,150,.45)';   // 빨판
    for (let i = 3; i < N - 3; i += 3){ const [x, y] = pts[i], [x2, y2] = pts[i + 1], an = Math.atan2(y2 - y, x2 - x) + Math.PI / 2, w = a.w * (1 - i / N); g.beginPath(); g.arc(x + Math.cos(an) * w * 0.25, y + Math.sin(an) * w * 0.25, Math.max(1, w * 0.14), 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
}
function madfxDraw(now){
  const c = MADFX.cv, g = MADFX.g, d = Math.min(2, devicePixelRatio || 1);
  if (c.width !== Math.round(innerWidth * d)){ c.width = Math.round(innerWidth * d); c.height = Math.round(innerHeight * d); }
  g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
  MADFX.list = MADFX.list.filter(e => now - e.t0 < e.dur);
  for (const e of MADFX.list){ const k = (now - e.t0) / e.dur;
    if (e.kind === 'eye') madfxEye(g, e, k); else if (e.kind === 'crawl') madfxCrawl(g, e, k, now); else madfxTent(g, e, k, now); }
  MADFX.raf = MADFX.list.length ? requestAnimationFrame(madfxDraw) : 0;
  if (!MADFX.raf) g.clearRect(0, 0, innerWidth, innerHeight);
}
HOOK.tick.push(() => {
  if (S.stage !== 'room' || S.ended || window.BOOTING || document.hidden || typeof myMad !== 'function') return;
  const st = myMad(), now = performance.now(); if (st < K.madFxAt.eye){ MADFX.next = 0; return; }
  if (!MADFX.next){ MADFX.next = now + 40e3 + Math.random() * 80e3; return; }   // 들어오고 조금 뒤부터
  if (now < MADFX.next || MADFX.list.length) return;
  const kinds = ['eye', ...(st >= K.madFxAt.crawl ? ['crawl'] : []), ...(st >= K.madFxAt.tent ? ['tent', 'eye'] : [])];
  madfxSpawn(kinds[Math.floor(Math.random() * kinds.length)]); MADFX.next = now + madfxGap(st);
});
// 문서 속 환각(11/7 선생님 "문서에서도 눈이 생기고 글자가 기어다니게"): 광기 6단계부터 기록 창을 열면 가끔 — 종이 위에 눈이 뜨이거나, 글자 몇 자가 떨어져 나와 종이 밖으로 기어 나감(빈자리는 창을 닫을 때까지 비어 있음)
function madDocEye(){ const r = ovBody.getBoundingClientRect(); madfxSpawn('eye', { x: r.left + r.width * (0.2 + Math.random() * 0.6), y: r.top + Math.min(r.height, innerHeight) * (0.25 + Math.random() * 0.5), r: 20 + Math.random() * 10 }); }
function madDocCrawl(n){
  for (let t = 0; t < n; t++){
    const nodes = madTexts(); if (!nodes.length) return;
    const nd = nodes[Math.floor(Math.random() * nodes.length)], a = Array.from(nd.nodeValue), idx = a.map((c, i) => /[가-힣]/.test(c) ? i : -1).filter(i => i >= 0); if (!idx.length) continue;
    const ci = idx[Math.floor(Math.random() * idx.length)], mid = nd.splitText(a.slice(0, ci).join('').length); mid.splitText(a[ci].length);
    const sp = document.createElement('span'); sp.className = 'mch'; mid.parentNode.insertBefore(sp, mid); sp.appendChild(mid);
    const r = sp.getBoundingClientRect(), cs = getComputedStyle(sp), bug = document.createElement('span'); bug.textContent = a[ci];
    bug.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;font:${cs.font};color:${cs.color};z-index:61;pointer-events:none`;
    document.body.appendChild(bug); sp.style.visibility = 'hidden';
    const ang = Math.random() * Math.PI * 2, kf = []; let x = 0, y = 0;
    for (let i = 0; i <= 14; i++){ x += Math.cos(ang + Math.sin(i) * 0.8) * (10 + Math.random() * 14); y += Math.sin(ang + Math.sin(i) * 0.8) * (10 + Math.random() * 14) + 4;
      kf.push({ transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${((Math.random() - 0.5) * 40).toFixed(0)}deg) scaleY(${(0.8 + Math.random() * 0.4).toFixed(2)})`, opacity: i > 11 ? (14 - i) / 3 : 1 }); }
    kf[0].transform = 'none';
    bug.animate(kf, { duration: 2600 + Math.random() * 2400, delay: t * 260, easing: 'steps(28)', fill: 'forwards' }).onfinish = () => bug.remove();
  }
  if (typeof noise === 'function') noise(0.4, 900, 0.02, 'highpass');
}
// 글자들이 한데 모여 한 마리처럼 이어 붙고(지네) 다리를 꿈틀대며 종이 밖으로 기어 나감(11/7 선생님 "글자 자체가 생명체처럼 합쳐져서 기어 나가고")
function madDocSwarm(n){
  const segs = [];
  for (let t = 0; t < n; t++){
    const nodes = madTexts(); if (!nodes.length) break;
    const nd = nodes[Math.floor(Math.random() * nodes.length)], a = Array.from(nd.nodeValue), idx = a.map((c, i) => /[가-힣]/.test(c) ? i : -1).filter(i => i >= 0); if (!idx.length) continue;
    const ci = idx[Math.floor(Math.random() * idx.length)], mid = nd.splitText(a.slice(0, ci).join('').length); mid.splitText(a[ci].length);
    const sp = document.createElement('span'); sp.className = 'mch'; mid.parentNode.insertBefore(sp, mid); sp.appendChild(mid);
    const r = sp.getBoundingClientRect(), cs = getComputedStyle(sp), seg = document.createElement('span'); seg.textContent = a[ci]; seg.className = 'lseg' + (t ? '' : ' head');
    seg.style.cssText = `position:fixed;left:0;top:0;font:${cs.font};color:${cs.color};z-index:61;pointer-events:none;transform:translate(${r.left}px,${r.top}px)`;
    document.body.appendChild(seg); sp.style.visibility = 'hidden'; segs.push([seg, r.left, r.top]);
  }
  if (!segs.length) return;
  const box = ovBody.getBoundingClientRect(), gx = box.left + box.width * (0.3 + Math.random() * 0.4), gy = box.top + Math.min(box.height, innerHeight) * (0.35 + Math.random() * 0.3);
  const path = [[gx, gy]]; let ang = Math.random() * Math.PI * 2;
  for (let i = 0; i < 22; i++){ ang += (Math.random() - 0.5) * 0.9; const [px, py] = path[path.length - 1]; path.push([px + Math.cos(ang) * 34, py + Math.sin(ang) * 34]); }   // 구불구불 종이 밖으로
  const dur = 5200, gather = 0.28, gap = 75;
  segs.forEach(([seg, x0, y0], i) => {
    const kf = [{ transform: `translate(${x0}px,${y0}px)`, offset: 0 }, { transform: `translate(${gx}px,${gy}px) rotate(${(Math.random() - 0.5) * 60}deg)`, offset: gather }];   // 먼저 한데 모임
    for (let k = 1; k < path.length; k++){ const [x, y] = path[k], [px, py] = path[k - 1], an = Math.atan2(y - py, x - px) * 180 / Math.PI;
      kf.push({ transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(an + 90).toFixed(0)}deg)`, offset: gather + (1 - gather) * k / (path.length - 1) }); }
    kf[kf.length - 1].opacity = 0; kf[kf.length - 2].opacity = 1;
    seg.animate(kf, { duration: dur, delay: i * gap, easing: 'linear', fill: 'both' }).onfinish = () => seg.remove();   // 뒤 글자가 앞 글자 자취를 그대로 따라감 → 한 줄로 이어 붙은 몸
  });
  if (typeof noise === 'function'){ noise(0.6, 700, 0.025, 'highpass'); setTimeout(() => noise(1.2, 300, 0.02, 'bandpass'), 1500); }
}
// 한 글자가 자모로 풀려 벌레가 됨(11/7 선생님 "자음 모음 자음이 획이 펴지고 구부러지면서 벌레가") — 초성은 머리, 중성은 몸통, 종성은 꼬리
const JAMO_CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JAMO_JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', JAMO_JONG = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
function madDocMorph(n){
  for (let t = 0; t < n; t++){
    const nodes = madTexts(); if (!nodes.length) return;
    const nd = nodes[Math.floor(Math.random() * nodes.length)], a = Array.from(nd.nodeValue), idx = a.map((c, i) => /[가-힣]/.test(c) ? i : -1).filter(i => i >= 0); if (!idx.length) continue;
    const ci = idx[Math.floor(Math.random() * idx.length)], mid = nd.splitText(a.slice(0, ci).join('').length); mid.splitText(a[ci].length);
    const sp = document.createElement('span'); sp.className = 'mch'; mid.parentNode.insertBefore(sp, mid); sp.appendChild(mid);
    const r = sp.getBoundingClientRect(), cs = getComputedStyle(sp), em = parseFloat(cs.fontSize) || 15, c = a[ci].charCodeAt(0) - 0xAC00;
    const parts = [JAMO_CHO[Math.floor(c / 588)], JAMO_JUNG[Math.floor(c % 588 / 28)], JAMO_JONG[c % 28]].filter(j => j && j !== ' ');
    const home = [[0, 0], [em * 0.42, 0], [em * 0.15, em * 0.42]];   // 글자 안에서 자모가 있던 자리(대충)
    sp.style.visibility = 'hidden';
    const ang = Math.random() * Math.PI * 2, path = []; let px = r.left + em * 0.3, py = r.top + em * 0.3, a2 = ang;
    for (let i = 0; i < 18; i++){ a2 += (Math.random() - 0.5) * 1.1; px += Math.cos(a2) * em * 1.3; py += Math.sin(a2) * em * 1.3; path.push([px, py, a2]); }
    const dur = 4600 + Math.random() * 1200, unfold = 0.34;
    parts.forEach((ch, i) => {
      const seg = document.createElement('span'); seg.textContent = ch; seg.className = 'lseg' + (i ? '' : ' head');
      const hx = r.left + home[i][0], hy = r.top + home[i][1];
      seg.style.cssText = `position:fixed;left:0;top:0;font:${cs.font};font-size:${(em * 0.62).toFixed(1)}px;color:${cs.color};z-index:61;pointer-events:none`;
      const kf = [
        { transform: `translate(${hx}px,${hy}px)`, offset: 0 },
        { transform: `translate(${hx + (Math.random() - 0.5) * 3}px,${hy + (Math.random() - 0.5) * 3}px) scale(1.05)`, offset: 0.08 },   // 떨기 시작
        { transform: `translate(${hx - em * 0.2}px,${hy}px) scale(2.1,.35) rotate(${(i - 1) * 25}deg)`, offset: 0.18 },   // 획이 쭉 펴짐
        { transform: `translate(${hx}px,${hy - em * 0.2}px) scale(.7,1.6) skewX(35deg) rotate(${90 + i * 40}deg)`, offset: 0.27 },   // 구부러지고 비틀림
        { transform: `translate(${r.left + em * 0.3 - i * em * 0.55}px,${r.top + em * 0.3}px) scale(1.2,.8) rotate(90deg)`, offset: unfold },   // 머리·몸통·꼬리로 이어 붙음
      ];
      path.forEach(([x, y, an], k) => kf.push({ transform: `translate(${(x - Math.cos(an) * i * em * 0.55).toFixed(1)}px,${(y - Math.sin(an) * i * em * 0.55).toFixed(1)}px) rotate(${(an * 180 / Math.PI + 90).toFixed(0)}deg) scale(1.2,${(0.75 + 0.2 * Math.sin(k * 2 + i)).toFixed(2)})`, offset: unfold + (1 - unfold) * (k + 1) / path.length }));
      kf[kf.length - 1].opacity = 0; kf[kf.length - 3].opacity = 1;
      document.body.appendChild(seg);
      seg.animate(kf, { duration: dur, delay: t * 500, easing: 'linear', fill: 'both' }).onfinish = () => seg.remove();
    });
  }
  if (typeof noise === 'function') noise(0.5, 1100, 0.02, 'highpass');
}
HOOK.ov.push(() => {
  if (typeof myMad !== 'function') return; const st = myMad(); if (st < K.madFxAt.doc) return;
  if (Math.random() > Math.min(0.5, 0.15 + (st - K.madFxAt.doc) * 0.05)) return;
  const body = ovBody.innerHTML.length; setTimeout(() => { if (ov.classList.contains('hidden') || ovBody.innerHTML.length !== body) return;   // 같은 창이 아직 열려 있을 때만
    const r = Math.random(); if (st >= K.madFxAt.swarm && r < 0.3) madDocSwarm(8 + st); else if (st >= K.madFxAt.morph && r < 0.55) madDocMorph(1 + Math.floor(st / 4)); else if (r < 0.78) madDocEye(); else madDocCrawl(2 + Math.floor(st / 3)); if (typeof tlog === 'function') tlog('문서 속 환각'); }, 1200 + Math.random() * 2500);
});
window.madfxTest = kind => kind === 'docEye' ? madDocEye() : kind === 'docCrawl' ? madDocCrawl(4) : kind === 'docSwarm' ? madDocSwarm(16) : kind === 'docMorph' ? madDocMorph(3) : madfxSpawn(kind || 'eye');   // 시험용
