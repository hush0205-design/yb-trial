'use strict';
// ───────── 기록 창 ─────────
const ov = document.getElementById('overlay'), ovBody = document.getElementById('ovBody');
const ovQueue = [];
function queueOv(html){ if (ov.classList.contains('hidden')) openOv(html); else ovQueue.push(html); }
function openOv(html, onClose){ ovBody.innerHTML = html + '<div class="close">닫기</div>'; ov.classList.remove('hidden'); if (typeof glossify === 'function') glossify(ovBody); ov._onClose = onClose; ov._t = performance.now(); }
// 터치 직후 따라오는 클릭이 방금 연 창(과 그 안의 항목)을 누르지 않게: 잡기 단계에서 먼저 막음
ov.addEventListener('click', e => { if (performance.now() - (ov._t||0) < 450) { e.stopPropagation(); e.preventDefault(); } }, true);
ov.addEventListener('click', e => {
  if (e.target.closest('.rec')) return;
  ov.classList.add('hidden'); const f = ov._onClose; ov._onClose = null; if (f) f();
  if (ovQueue.length && ov.classList.contains('hidden')) setTimeout(() => { if (ov.classList.contains('hidden')) openOv(ovQueue.shift()); }, 350);
});

// ───────── 책: 크기·면 구성 ─────────
const bookView = document.getElementById('bookView'), book = document.getElementById('book'), facesEl = document.getElementById('faces');
const cover = document.getElementById('cover'), leaf = document.getElementById('leaf'), stage = document.getElementById('stage');
(() => {   // 표지 오른쪽 끝: 다섯 구멍 실 매기
  const b = cover.querySelector('.bind'); let h = '<div class="thrv"></div>';
  for (const y of [7, 27, 50, 73, 93]) h += `<div class="thr" style="top:${y}%"></div><div class="hole" style="top:${y}%"></div>`;
  b.innerHTML = h;
})();
let single = true, FW = 300, FH = 440, bookOpen = false;
let faces = [];                 // 한 면이면 [all], 두 면이면 [왼쪽=fear, 오른쪽=ledger]
function layoutBook(){
  single = innerWidth < 700 || innerWidth < innerHeight*1.1;
  FH = Math.floor(Math.min(innerHeight*0.78, single ? innerWidth*0.92/0.66 : innerWidth*0.46/0.66)); FW = Math.floor(FH*0.66);
  const BW = single ? FW : FW*2;
  stage.style.width = BW + 'px'; stage.style.height = FH + 'px';
  book.style.width = BW + 'px'; book.style.height = FH + 'px';
  const pt = Math.round(FH*0.15), colH = FH - pt - 20 - 10;
  const longest = Math.max(...curB().L().map(v => [...v[v.length-1]].length));
  const fs = S.opt.horiz ? Math.max(13, Math.min(19, FH/40)) : Math.max(10, Math.min(19, FH/40, Math.floor(colH / (longest*1.04))));
  book.style.setProperty('--fs', fs + 'px'); book.style.setProperty('--lh', Math.round(fs*1.8) + 'px'); book.style.setProperty('--pt', Math.round(FH*0.15) + 'px');
  cover.style.width = FW + 'px'; cover.style.height = FH + 'px'; cover.style.left = '0px'; cover.style.top = '0px';
  const th = document.getElementById('thread'); const dg = document.getElementById('deskGlass');
  if (single){ dg.style.left = '-48px'; dg.style.top = (FH + 50) + 'px'; } else { dg.style.left = '-150px'; dg.style.top = Math.round(FH*0.55) + 'px'; }
  const spineX = FW - Math.round(FW*0.035);   // 한 면이면 묶은 쪽이 화면 오른쪽 끝이라 실이 왼쪽으로 눕고, 두 면이면 오른쪽으로 누움
  th.style.left = (single ? spineX - 130 : spineX - 20) + 'px'; th.style.top = (FH - 6) + 'px'; th.style.transform = single ? 'scaleX(-1)' : ''; drawThread(0);   // 실은 묶은 선(한 면이면 오른쪽 끝, 두 면이면 가운데)에서 늘어짐
  facesEl.innerHTML = ''; faces = [];
  for (const k of (single ? ['all'] : ['fear', 'ledger'])){ const f = document.createElement('div'); f.className = 'face'; f.dataset.kind = k; f.style.width = FW + 'px'; f.style.height = FH + 'px'; facesEl.appendChild(f); faces.push(f); }
  facesEl.classList.toggle('horiz', !!S.opt.horiz);
  renderFaces();
}
const turnFace = () => faces[0];          // 넘어가는 면: 한 면이면 그 면, 두 면이면 왼쪽 면(오른쪽을 묶은 옛 책)
let prevTxt = [];
function linesHtml(from, to, Dv, mark, b = curB()){
  let h = '';
  for (let i=from;i<to;i++){
    const now = Array.from(showText(i, Dv, b)), old = Array.from(prevTxt[b.id + ':' + i] || '');
    let out = '';
    for (let k = 0; k < now.length; k++){
      const ch = now[k];
      if (isAlien(ch)) { out += agSpan(ch, k); continue; }
      if (/\d/.test(ch)){                                                     // 숫자는 두 자리까지 묶어 똑바로
        let run = ch; while (run.length < 2 && k + 1 < now.length && /\d/.test(now[k+1])) run += now[++k];
        const changed = mark && [...run].some((c, j) => old[k - run.length + 1 + j] !== c);
        out += `<span class="tcy${changed ? ' nw' : ''}">${run}</span>`; continue;
      }
      out += (mark && old[k] !== ch && ch.trim()) ? `<span class="nw">${esc(ch)}</span>` : esc(ch);
    }
    h += `<div class="ln${b === BD && i >= 8 ? ' red' : ''}">` + out + '</div>';
  }
  return h;
}
function marginHtml(){ const nm = (hanjaOf(S.sur||'') + '氏 十七世 ' + (S.name||'')).replace(/[&<>]/g,''); return alienHtml(glyphs('토끼 아래 두고왔다', 99)) + `<span class="tiny">${nm}</span>`; }
function faceInner(kind, Dv, mark){
  const b = curB(), D = Dv === undefined ? b.D() : Dv;
  if (b === BD){
    const n = DLINES.length;
    const lines = kind === 'all' ? linesHtml(0, n, D, mark, b) : kind === 'ledger' ? linesHtml(0, 8, D, mark, b) : linesHtml(8, n, D, mark, b);
    return `<div class="rule"></div><div class="txt">${lines}</div>`;
  }
  let lines = '';
  if (D >= J0){                                                     // 족보 장
    const lines = kind === 'all' ? linesHtml(11, 20, D, mark) : kind === 'ledger' ? linesHtml(11, 16, D, mark) : linesHtml(16, 20, D, mark);
    const mg = kind !== 'fear' ? `<div class="mg${S.owned.glass ? ' seen' : ''}">${marginHtml()}</div>` : '';
    return `<div class="rule"></div>${mg}<div class="txt">${lines}</div>`;
  }
  if (kind === 'all')    lines = linesHtml(0, D >= T.fearPage ? 11 : 8, D, mark);
  if (kind === 'ledger') lines = linesHtml(0, 8, D, mark);
  if (kind === 'fear')   lines = D >= T.fearPage ? linesHtml(8, 11, D, mark) : '';
  const mg = kind !== 'fear' ? `<div class="mg${S.owned.glass ? ' seen' : ''}">${marginHtml()}</div>` : '';
  return `<div class="rule"></div>${mg}<div class="txt">${lines}</div>`;
}
const EAR = '<div id="ear" class="ready"></div>';
function stain(n){ const a = hash(n,1), b = hash(n,2), c = hash(n,3);
  return `radial-gradient(circle at ${10+a*80}% ${10+b*80}%, #8a6a3a${c>.5?'22':'14'} 0, #0000 ${8+c*14}%), radial-gradient(circle at ${90-b*70}% ${85-a*60}%, #5a3a1a12 0, #0000 ${5+a*9}%)`; }
function snapshot(){ const b = curB(); prevTxt = {}; b.L().forEach((_,i) => prevTxt[b.id + ':' + i] = showText(i, undefined, b)); }
function applyLight(){ const on = !!S.owned.lamp && !S.lampOut; book.classList.toggle('lit', on); bookView.classList.toggle('lit', on); }
function renderFaces(){
  faces.forEach((f,i) => { f.innerHTML = faceInner(f.dataset.kind, undefined, false) + (i === 0 ? EAR : ''); f.style.backgroundImage = stain(S.earned*2 + i); });
  snapshot();
  applyLight(); bookView.classList.toggle('chest', !S.owned.desk);
  document.getElementById('deskGlass').classList.toggle('hidden', !S.owned.glass);
  if (loupeOn) buildLoupe();
}

// ───────── 넘기는 낱장: 왼쪽 끝이 먼저 들려 오른쪽(묶인 쪽)으로 휘어 넘어감 ─────────
const NS = 14;
let strips = [], shades = [], anim = null, pending = null;
function buildLeaf(face, frontHtml, frontBg, backHtml, backBg){
  leaf.innerHTML = ''; strips = []; shades = [];
  const W = face.offsetWidth, H = face.offsetHeight, w = W / NS, hz = S.opt.horiz ? ' horiz' : '';
  leaf.style.left = face.offsetLeft + 'px'; leaf.style.width = W + 'px'; leaf.style.height = H + 'px';
  let parent = leaf;
  for (let i=0; i<NS; i++){
    const st = document.createElement('div'); st.className = 'strip';
    st.style.left = (i ? -w : W - w) + 'px'; st.style.width = w + 'px';
    const fx = -(W - (i+1)*w), bx = -(i*w);
    st.innerHTML = `<div class="sface"><div class="pc${hz}" style="left:${fx}px;width:${W}px;background-image:${frontBg}">${frontHtml}</div><div class="sh"></div></div>`
      + `<div class="sface back"><div class="pc${hz}" style="left:${bx}px;width:${W}px;background-image:${backBg}">${backHtml}</div><div class="sh"></div></div>`;
    parent.appendChild(st); parent = st; strips.push(st); shades.push(st.querySelectorAll(':scope > .sface > .sh'));
  }
}
function animateLeaf(dur, done, o = {}){
  const from = o.from ?? 0, to = o.to ?? 180, bendMax = o.bend ?? 85, sign = to >= from ? 1 : -1;
  const t0 = performance.now(); leaf.style.display = 'block';
  const step = now => {
    const t = Math.max(0, Math.min(1, (now - t0) / dur));
    const e = t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
    const base = from + (to - from) * Math.pow(e, 1.12);
    const bend = sign * bendMax * Math.sin(Math.PI * Math.min(1, t*1.15)) * (1 - t*0.85);
    let cum = 0;
    for (let i=0; i<NS; i++){
      const d = i === 0 ? base : bend * (2*i) / (NS*(NS-1));
      cum += d; strips[i].style.transform = `rotateY(${d}deg)`;
      const op = (0.03 + 0.2 * Math.abs(Math.sin(cum * Math.PI / 180))).toFixed(3);
      shades[i].forEach(x => x.style.opacity = op);
    }
    if (t < 1) anim = requestAnimationFrame(step); else { anim = null; done(); }
  };
  anim = requestAnimationFrame(step);
}
function finishTurn(){
  if (anim) { cancelAnimationFrame(anim); anim = null; }
  leaf.style.display = 'none'; leaf.innerHTML = '';
  if (pending) { pending.el.innerHTML = pending.html; pending.el.style.backgroundImage = pending.bg; pending = null; }
  if (loupeOn) buildLoupe();
}
function turnPage(slow, fast){
  finishTurn();
  if (!bookOpen) { renderFaces(); return; }
  const n = S.earned*2, f = turnFace(), earWasReady = performance.now() - lastFlip >= CD;
  const oldHtml = f.innerHTML.replace(/<div id="ear"[^>]*><\/div>/, ''), oldBg = f.style.backgroundImage;
  const fresh = faces.map(x => faceInner(x.dataset.kind, undefined, true));
  if (single){
    buildLeaf(f, oldHtml, oldBg, '', stain(n+7));                 // 뒷면은 빈 한지, 아래에서 조금 더 풀린 새 장이 드러남
  } else {
    buildLeaf(f, oldHtml, oldBg, fresh[1], stain(n+1));           // 왼쪽 낱장이 넘어가 새 오른쪽 면이 됨
    pending = { el: faces[1], html: fresh[1], bg: stain(n+1) };
  }
  f.innerHTML = fresh[0] + EAR; f.style.backgroundImage = stain(n);
  document.getElementById('ear').classList.toggle('ready', earWasReady);
  snapshot();
  animateLeaf(slow ? 2000 : fast ? 230 : 950, finishTurn);
}

