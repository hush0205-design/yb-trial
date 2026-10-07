'use strict';
// ───────── 족보 한 장과 문서함 (10/7 선생님 "1세 뒤로 쭉 있는 게 뭔지 모르겠다, 지워진 건지 없는 건지" — 10/8 19_rebirth에서 나눔) ─────────
// 첫 화면·끝 장면·문서함·문갑이 같은 족보 한 장을 씀. 지운 줄은 원래 글자가 흐리게 비치고 그 위에 긁힘(1세)·먹줄(14~16세) — '없는 것'(⋮)과 구분.
// 다시 펼쳐 볼 때(view)는 첫 책에서 받아 적은 만큼 이름·한 일이 풀림. 첫 화면에선 설명하지 않음(읽으며 알게).
const JK_OLD = [   // [세, 이름(풀리면), 첫 책 줄, 모양, 한 일]
  [1, null, 12, 'erased', '이 서고를 세우다'], [2, '문학', 13, 'plain', '글을 읽다'], [3, '서도', 14, 'plain', '글을 읽다'], [0, null, 15, 'dots', '4세부터 12세까지, 모두 글을 읽다'],
  [13, '수진', 16, 'plain', '서고 문을 닫고 떠나다'], [14, null, 17, 'struck', ''], [15, null, 17, 'struck', ''], [16, null, 17, 'struck', ''],
];
function jokboOldRows(view){
  const sur = LINE.sur || S.sur || '';
  return JK_OLD.map(([g, nm, li, kind, deed]) => {
    const read = view && S.D >= lineDone(li);
    if (kind === 'dots') return `<div class="row faint"><span class="gen">⋮</span><span class="jd">${read ? deed : ''}</span></div>`;
    const name = read && nm ? esc(sur + nm) : alienHtml(glyphs('이름자', 200 + g));
    return `<div class="row"><span class="gen">${genHj(g)}世</span><span class="jn ${kind}">${name}</span>${read && deed ? `<span class="jd">— ${deed}</span>` : ''}</div>`;
  }).join('');
}
const jokboLast = j => j.last ? `<div class="row jlast"><span class="gen"></span><span class="jd" style="font-style:italic;opacity:.85;margin:0">「${esc(j.last)}」</span></div>` : '';   // 앞 대가 족보 여백에 남긴 한 줄(기획서 20절 1)
const jokboLineRows = (cur, view) => LINE.jokbo.map(j => `<div class="row"><span class="gen">${genHj(j.gen)}世</span><span>${esc(LINE.sur + j.name)} — <span class="${j === cur ? 'writing' : ''}">${j === cur ? '' : esc(j.end)}</span>${view ? `<span class="jd">(${j.days}일, 가훈 「${GAHUN[j.gahun] ? GAHUN[j.gahun].t : '—'}」${j.mode === 'hard' ? ', 빗장을 열어 둔 채' : ''})</span>` : ''}</span></div>` + (j === cur ? '' : jokboLast(j))).join('');
function jokboSheetHtml(){
  const book = S.D >= J0 ? '<div class="bsec">첫 책의 족보 장 — 받아 적은 만큼</div><div style="font-size:14px">' + Array.from({ length: 11 }, (_, k) => alienHtml(showText(11 + k))).join('<br>') + '</div>' : '';
  return (`<h3>族譜 — ${esc((LINE.bon || S.bon || '') + ' ' + (LINE.sur || S.sur))}씨</h3><div class="jsheet">${jokboOldRows(true)}${jokboLineRows(null, true)}<div class="row"><span class="gen">${genHj(LINE.gen)}世</span><span>${esc((LINE.sur || S.sur) + S.name)} —</span></div></div>` + book);
}
const showJokboSheet = () => openOv(jokboSheetHtml());
// 첫 화면 족보(1대·둘째 대 모두): 옛 줄을 같은 모양으로 다시 그림, 한자는 눌러서 풀이
(() => {
  const box = document.querySelector('#sJokbo .hanji'), rows = [...box.querySelectorAll('.row')];
  const olds = rows.filter(r => r.querySelector('.gen') && /^(一|二|十三|十四|十五|十六)世$/.test(r.querySelector('.gen').textContent));
  olds[0].insertAdjacentHTML('beforebegin', jokboOldRows(false)); olds.forEach(r => r.remove());
  if (typeof glossify === 'function') glossify(box);
})();

// ── 둘째 대부터의 족보 첫 장: 성·본관은 그대로, 이름만(무작위로 하나 적혀 있고 바로 시작할 수 있음) ──
const NEW_NAMES = ['서윤', '하진', '도현', '은재', '지안', '태경', '수아', '민서', '선우', '재희', '윤슬', '해담', '시온', '가람', '도윤', '서진', '나린', '정우', '여름', '이현', '단우', '소율', '규원', '채운'];
const pickName = () => { const used = LINE.jokbo.map(j => j.name).concat([S.name]); const p = NEW_NAMES.filter(n => !used.includes(n)); return p[Math.floor(Math.random() * p.length)] || '서하'; };
function rebirthJokbo(){
  if (LINE.gen <= 17) return;
  const box = document.querySelector('#sJokbo .hanji'), rows = [...box.querySelectorAll('.row')];
  const r17 = rows.find(r => r.querySelector('.gen') && r.querySelector('.gen').textContent === '十七世');
  const past = LINE.jokbo.slice(-4).map(j => `<div class="row"><span class="gen">${genHj(j.gen)}世</span><span>${esc(LINE.sur + j.name)} — ${esc(j.end)}</span></div>` + jokboLast(j)).join('');
  r17.outerHTML = (LINE.jokbo.length > 4 ? '<div class="row faint"><span class="gen">…</span></div>' : '') + past + `<div class="row"><span class="gen">${genHj(LINE.gen)}世</span></div>`;
  iSur.value = LINE.sur; iBon.value = LINE.bon;
  const sr = iSur.closest('.row'); sr.style.display = 'none';
  sr.insertAdjacentHTML('afterend', `<div class="row"><label>성(姓)</label><span>${esc(LINE.sur)}</span><label>본관</label><span>${esc(LINE.bon)}</span></div>`);
  iName.value = ''; iName.placeholder = pickName();
  iName.insertAdjacentHTML('afterend', '<span class="rec" id="bReName" style="font-size:12px;opacity:.55;white-space:nowrap;cursor:pointer">다른 이름</span>');
  document.getElementById('bReName').addEventListener('click', () => { iName.value = ''; iName.placeholder = pickName(); });
}
rebirthJokbo();

// ── 서안 곁 문서함: 집안 족보 · 가환록 · 기이록 · 낱말 장부 · 가훈첩 · 유품 (책장엔 안 꽂음 — 환생 명세 9절 4번) ──
M.docbox = model(9, 6, 5, (x, y, z) => {
  if (z === 4) return (x === 0 || x === 8 || y === 0 || y === 5) ? '#24160d' : '#3a2416';
  if ((x === 0 || x === 8) && (y === 0 || y === 5)) return '#a8873e';
  if (y === 5 && x === 4 && z === 2) return '#c8a85e';
  return z === 3 ? '#2a1a10' : '#3a2416';
});
OBJ.push({ id:'docbox', x:-12, y:12, rot:0.15, show:()=> LINE.jokbo.length > 0 || (!!S.owned.desk && (Object.keys(LINE.odd || {}).length > 0 || (typeof glHas === 'function' && glHas()))), click:()=>showDocbox() });   // 1대엔 기이록·낱말 장부가 생기면
function showDocbox(){
  openOv('<h3>문서함</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">' + (LINE.jokbo.length ? '앞 대들이 남긴 것.' : '집안의 기록을 모아 두는 함.') + ' 책장에 꽂지 않고 서안 곁에 둔다.</div>'
    + [['dJ', '집안 족보'], ...(Object.keys(LINE.codex).length ? [['dC', '가환록(家患錄)']] : []), ...(typeof oddCount === 'function' && oddCount() ? [['dO', '기이록(奇異錄)']] : []), ...(typeof glHas === 'function' && glHas() ? [['dW', '낱말 장부']] : []), ['dG', '가훈첩(家訓帖)'], ...(LINE.relics.length ? [['dR', '유품 — ' + LINE.relics.map(r => RELIC[r] ? RELIC[r].name : r).join(' · ')]] : [])]
      .map(([id, t]) => `<div class="rec" id="${id}" style="margin:8px 0">${t}</div>`).join(''));
  const on = (id, f) => { const el = document.getElementById(id); if (el) el.addEventListener('click', ev => { ev.stopPropagation(); f(); }); };
  on('dO', () => openOv(oddHtml())); on('dW', () => openOv(recGloss()));
  on('dJ', () => showJokboSheet());
  on('dC', () => openOv('<h3>가환록(家患錄)</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">집안에 든 우환을 대마다 적어 둔 책. 겪은 일만 적혀 있다.</div>'
    + Object.keys(LINE.codex).map(id => `<div style="margin:12px 0"><b>${END[id] ? END[id].name : id}</b>${LINE.codex[id].n > 1 ? ` <span style="font-size:12px;opacity:.55">— ${LINE.codex[id].n}번</span>` : ''}<br>${esc(LINE.codex[id].line)}${END[id] && END[id].only ? `<div style="font-size:13px;margin-top:6px">${END[id].only()}</div>` : ''}</div>`).join('')));
  on('dG', () => openOv('<h3>가훈첩</h3>' + GAHUN.map((g, i) => { const u = LINE.gahun.used[i] || 0; if (!gahunOpen().includes(i)) return '';
    return `<div style="margin:10px 0"><b>${g.t}</b>${S.gahun === i ? ' <span style="font-size:12px;opacity:.55">— 지금</span>' : ''}<br><span style="font-size:13px;opacity:.8">${u ? g.note[Math.min(1, u - 1)] + ` (${u}대)` : '아직 이 가훈으로 산 가주가 없다.'}</span></div>`; }).join('')));
  on('dR', () => openOv('<h3>유품</h3>' + LINE.relics.map(r => RELIC[r] ? `<div style="margin:10px 0"><b>${RELIC[r].name}</b><br><span style="font-size:13px">${RELIC[r].desc}</span></div>` : '').join('')));
}
