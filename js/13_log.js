'use strict';
// ───────── 시험 기록 ─────────
// 남에게 설명 없이 해 보게 할 때, 어디서 오래 머물렀는지 보려고 남김.
// 화면을 보고 있던 시간만 세고(다른 앱으로 가 있던 시간은 빼고), 처음 겪은 일만 한 줄씩 적음.
S.tlog = S.tlog || { sec:0, ev:[] };
function tlog(txt){
  const L = S.tlog.ev;
  if (L.length >= 400 || L.some(e => e[1] === txt)) return;
  L.push([Math.round(S.tlog.sec), txt]);
}
setInterval(() => { if (document.visibilityState === 'visible') S.tlog.sec += 1; }, 1000);
function tlogOv(html){
  const m = /<h3>(.*?)<\/h3>/.exec(html); if (!m) return;
  const title = m[1].replace(/<[^>]+>/g, '').trim();
  if (/^(설정|시험용|시험 기록)/.test(title)) return;
  tlog('창: ' + title);
}
const mmss = s => `${Math.floor(s/60)}:${String(s%60).padStart(2, '0')}`;
function tlogText(){
  const L = S.tlog.ev, out = [`여백 체험판 시험 기록 — ${new Date().toLocaleString('ko-KR')}`, `화면 ${innerWidth}×${innerHeight} · 본 시간 ${mmss(S.tlog.sec)} · 넘긴 것 ${fmtP(S.earned)}`, ''];
  L.forEach((e, i) => { const gap = i ? e[0] - L[i-1][0] : e[0]; out.push(`${mmss(e[0])}  ${e[1]}${gap >= 120 ? `   ← ${Math.round(gap/60)}분 머묾` : ''}`); });
  return out.join('\n');
}
function showTlog(){
  const txt = tlogText();
  openOv(`<h3>시험 기록</h3><div style="font-size:12px;opacity:.65;margin-bottom:8px">처음 겪은 일과 그때까지 본 시간. 2분 넘게 머문 곳에 표시가 붙는다.</div>`
    + `<pre class="rec" style="white-space:pre-wrap;font-size:12px;line-height:1.6;max-height:46vh;overflow:auto;margin:0">${esc(txt)}</pre>`
    + '<div style="text-align:center;margin-top:12px"><button class="btn rec" id="bCopyLog" style="color:var(--ink);border-color:#00000066">복사한다</button></div>');
  document.getElementById('bCopyLog').addEventListener('click', ev => {
    ev.stopPropagation(); const b = ev.currentTarget;
    const done = () => { b.textContent = '복사했다'; };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => { selectPre(); });
    else selectPre();
  });
  function selectPre(){ const r = document.createRange(); r.selectNodeContents(ovBody.querySelector('pre')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
}
