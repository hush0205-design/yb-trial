'use strict';
// ───────── 환생 뼈대 (환생 명세 1~6절 · 코드 정리 설계 2절, 10/7) ─────────
// 끝(강제 환생)은 END 표 한 곳에 모음 — 끝을 더할 땐 여기에만. 매 틱 n()을 보고 한도의 70%면 징조(기록 한 줄, 한 번), 다 차면 endGame.
// endGame: 가문(LINE)에 족보 줄·멸망 도감·유품·흔적·열린 것을 적고 → 판(S)을 새로 → 끝 장면(기록 → 족보에 붓이 저절로 씀) → 새 대(이름만 묻고 가훈 → 서고).
const DAY_MS = () => S.opt.gameTime ? 2*3600e3 : 24*3600e3;
const hasRelic = id => LINE.relics.includes(id);

// ── 빨리 다시 열림: 앞 대에서 닿았던 문턱은 절반, 두 번이면 1/4 (바닥 1/5) ──
const thr = (id, base) => Math.round(base * Math.max(0.2, Math.pow(0.5, LINE.reached[id] || 0)));
for (const o of [...OBJ, ...LAB_OBJ]) if (o.buy) o.buy.cost = thr(o.id, o.buy.cost);
T.letter = Math.max(T.door, thr('letter', T.letter));
const REACH_IDS = ['lamp', 'brush', 'desk', 'glass', 'sundial', 'ld1', 'ld2', 'ld3', 'ld4', 'ld5'];
function reachedNow(){                                     // 이번 대에 닿은 문턱(한 대에 한 번씩 셈)
  const r = REACH_IDS.filter(id => S.owned[id]);
  if (S.replied) r.push('letter'); if (S.mapFound) r.push('map'); if (S.bangAt) r.push('lab'); if (S.dig && S.dig.n) r.push('dig');
  return r;
}

// ── 유품: 다음 대의 서고(문서함)에 놓임 ──
const RELIC = {
  key:    { name:'열쇠', desc:'앞 대가 허리에 차고 다니던 대문 열쇠. 대문의 자물쇠에 꼭 맞을 것 같다.<br>아직은 걸어 잠글 일이 없다.' },
  ledger: { name:'청지기의 장부', desc:'앞 대의 치부책. 녹봉을 내준 날짜가 빼곡하다.<br>이 장부를 펴 둔 뒤로 녹봉은 궤짝에서 저절로 나가고, 사람을 조금 더 잃어도 서고가 버틴다.' },
  copies: { name:'사본 묶음', desc:'앞 대가 베껴 두고 팔지 못한 사본 두 권. 세책점에 넘긴 값 1냥이 궤짝에 들어 있다.' },
};
// ── 끝 표 ──
const END = {
  nobody: { name:'아무도 오지 않다', kind:'일반',
    n: () => genKeys().filter(k => S.st[k] && S.st[k].quit).length,            // 내보냄 + 녹봉 떠남 + 겁에 질려 그만둠(10/7 선생님)
    lim: () => LINE.limits.leave + (hasRelic('ledger') ? 2 : 0),
    omen(){ S.lateApp = true;
      pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '장터에 이 댁 이야기가 돈다 합니다.', '들어오는 사람마다 얼마 못 가 나간다고.', '방을 보고도 발길을 돌리는 이가 있답니다.'], '한서진 올림.', 'min(44vh,320px)')); },
    scene: () => ['방(榜)이 비에 젖어 대문에서 떨어졌다. 다시 붙여도 아무도 오지 않았다.',
      '별채의 책상마다 먼지가 앉았다. 덮어 둔 사본 위에도.',
      '한서진만 남아 혼자 장부를 넘겼다. 넘기는 소리만 서고에 있었다.',
      '어느 아침 서안 위에 쪽지 한 장. 「혼자서는 이 책을 다 읽을 수 없습니다.」',
      '그해 겨울, 가주는 서고 문을 닫았다.'],
    codex: '사람을 거듭 잃으니 서고에 아무도 오지 않았다.',
    only: () => '<b>장터 소문</b> — 「그 집 서고는 사람을 들이고 내보내기를 밥 먹듯 한다더라. 들어간 사람이 나올 땐 얼굴이 달라져 있다더라. 방이 붙어 있어도 가지 마라. 밥은 준다더라만.」',
    relics: ['ledger'] },
  rice: { name:'쌀독이 비다', kind:'일반',
    n: () => S.riceN || 0,                                                     // 궤짝이 바닥이고 별채에 일하는 사람이 없는 날(달력) — 닷새(10/7 선생님)
    lim: () => LINE.limits.rice,
    omen(){ pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '쌀독 바닥이 보입니다.', '오늘 아침은 제 집에서 쌀을 덜어 왔습니다.', '세책점 거간이 외상을 놓겠다 하는데,', '그 사람 웃는 얼굴이 마음에 걸립니다.'], '한서진 올림.', 'min(48vh,340px)')); },
    scene: () => ['아침마다 쌀독 바닥을 긁는 소리가 났다.',
      '세책점 거간이 외상 장부를 내밀었다. 쌀 두 섬에 책장의 책 세 권.',
      '거간이 써 준 영수증의 글자는 첫 책의 글자와 닮아 있었다.',
      '별채는 비었고, 한서진은 끼니를 거르며 넘겼다.',
      '그해 겨울, 가주는 남은 책을 궤짝에 넣고 서고 문을 닫았다.'],
    codex: '쌀독이 비어, 책을 쌀과 바꾸었다.',
    only: () => `<b>거간의 영수증</b> — 쌀 두 섬. 받은 것: ${alienHtml(glyphs('책 세 권과 이름 하나', 61))}<br><span style="font-size:12px;opacity:.6">마지막 몇 글자는 아무리 보아도 풀리지 않는다.</span>`,
    relics: ['ledger', 'copies'] },
};

// ── 새 대의 첫걸음: 유품을 풀고 흔적을 남김(서고에 처음 들어올 때 한 번) ──
function genInit(){
  if (S.genInit) return; S.genInit = true; S.gen = LINE.gen; S.genDay = dayKey();
  if (LINE.gen > 17 && LINE.trace) S.trace = LINE.trace.from;
  if (hasRelic('ledger')) S.steward = true;
  if (hasRelic('copies') && LINE.gen > 17){ S.money = (S.money == null ? 500 : S.money) + 100; ledger('앞 대의 사본 묶음을 세책점에 넘김 + 1냥'); }
  if (typeof tlog === 'function') tlog(LINE.gen + '세 시작' + (S.trace ? ' (앞 대: ' + END[S.trace].name + ')' : ''));
  save();
}
function traceTick(){
  if (S.trace === 'nobody' && S.bangAt && !S.traceDone){           // 소문: 첫 지원자가 하루 늦게
    S.traceDone = true; S.genNext = Math.max(S.genNext || 0, S.bangAt + 120000 + DAY_MS()); S.gnSeen = S.genNext; save(); }
  if (S.trace === 'rice' && S.rArrived && !S.traceDone){           // 밀린 것을 안고 시작: 한서진의 녹봉이 이틀 밀린 채
    S.traceDone = true; S.owe = S.owe || {}; S.owe.sj = { amt: WAGE('sj') * 2, days: 2 }; if (S.payDay == null) S.payDay = dayKey(); save(); }
  if (S.lateApp && S.genNext && S.genNext !== S.gnSeen){            // 징조 뒤로는 지원자가 하루씩 늦게 옴
    if (S.genNext > Date.now() - 1000) S.genNext += DAY_MS(); S.gnSeen = S.genNext; save(); }
}
// 한서진은 앞 대에 왔었으면 편지 없이 둘째 날 아침에 옴
function againTick(){
  if (!LINE.reached.letter || S.replied || S.genDay == null || dayKey() <= S.genDay || isNight() || gameHour() < 7) return;
  S.letterRead = true; S.replied = true; S.chair = true; S.rDue = Date.now() + 3000; S.sjAgain = true; save(); sPlace();
}
function againNote(){
  if (!S.sjAgain || S.sjAgainNote || !S.rArrived || Date.now() - S.rArrived < T_PUSH) return;
  S.sjAgainNote = true; pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '다시 왔습니다.', '어디서 들었는지는 기억나지 않습니다.', '자리는 전과 같은 곳이면 됩니다.'], '한서진 올림.', 'min(44vh,320px)')); save();
}
// 쌀독: 날이 바뀔 때 궤짝이 바닥(가장 싼 녹봉보다 적음)이고 별채에 일하는 사람이 없으면 하루씩
function riceTick(){
  const today = dayKey();
  if (S.riceDay == null){ S.riceDay = today; return; }
  if (S.riceDay >= today) return;
  const days = today - S.riceDay; S.riceDay = today;
  const broke = !!S.bangAt && (S.money || 0) < 30 && !genKeys().some(k => S.st[k] && S.st[k].arr && !S.st[k].gone);
  S.riceN = broke ? (S.riceN || 0) + days : 0; save();
}
function endTick(){
  if (S.ended || window.BOOTING) return;
  S.omen = S.omen || {};
  for (const id of Object.keys(END)){
    const E = END[id], v = E.n(), L = E.lim();
    if (!S.omen[id] && v >= Math.ceil(L * 0.7) && v < L){ S.omen[id] = true; E.omen(); if (typeof tlog === 'function') tlog('징조: ' + E.name); save(); }
    if (v >= L){ endGame(id); return; }
  }
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; genInit(); traceTick(); againTick(); againNote(); riceTick(); endTick(); });

// ── 끝 ──
function endGame(id){
  const E = END[id]; if (S.ended) return;
  S.ended = id; if (typeof tlog === 'function') tlog('환생: ' + E.name); save();
  const was = { gen: LINE.gen, sur: S.sur || LINE.sur, bon: S.bon || LINE.bon, name: S.name, gahun: S.gahun };
  const firstCodex = !Object.keys(LINE.codex).length;
  LINE.jokbo.push({ gen: LINE.gen, name: S.name, end: E.name, endId: id, days: Math.max(1, dayKey() - (S.genDay == null ? dayKey() : S.genDay) + 1), gahun: S.gahun });
  const c = LINE.codex[id] || { n:0, first: Date.now() }; c.n++; c.line = E.codex; LINE.codex[id] = c;
  if (S.gahun >= 0) LINE.gahun.used[S.gahun] = (LINE.gahun.used[S.gahun] || 0) + 1;
  const pool = E.relics.filter(r => !hasRelic(r)), relic = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  const gotKey = !hasRelic('key');
  if (gotKey) LINE.relics.push('key'); if (relic) LINE.relics.push(relic);
  for (const r of reachedNow()) LINE.reached[r] = (LINE.reached[r] || 0) + 1;
  LINE.trace = { from: id }; LINE.gloss = S.gl; LINE.margins = S.margins || [];
  LINE.gen++; saveLine();
  // 판은 새로 — 낱말 장부·여백 글씨·시험 기록·설정만 들고 감
  localStorage.setItem(SAVE, JSON.stringify({ stage:'jokbo', opt: S.opt, gl: S.gl, margins: S.margins, tlog: S.tlog }));
  resetting = true;
  endScene(E, was, { relic, gotKey, firstCodex });
}
function endScene(E, was, got){
  if (typeof bookOpen !== 'undefined' && bookOpen) try { closeBook(); } catch(_){}
  ov.classList.add('hidden');
  const el = document.createElement('div'); el.id = 'endScene'; document.body.appendChild(el);
  let at = performance.now(), step = 0;
  const fadeIn = (html, gap) => { el.innerHTML = html; at = performance.now();
    el.querySelectorAll('.el').forEach((p, i) => setTimeout(() => p.classList.add('on'), 600 + i * gap)); };
  // 1) 끝의 기록
  fadeIn(`<div class="hanji endRec"><h3>${esc(was.sur + was.name)}의 마지막 해</h3>${E.scene().map(t => `<p class="el">${esc(t)}</p>`).join('')}<div class="el endTap">— 눌러서 넘긴다 —</div></div>`, 1500);
  noise(1.2, 140, 0.18, 'lowpass');
  const total1 = 600 + E.scene().length * 1500;
  el.addEventListener('click', () => {                    // 기록을 다 보이기 전엔 넘어가지 않음(2.5초 넘으면 눌러서 넘길 수 있음). 족보는 단추로만
    if (step !== 0 || performance.now() - at < Math.min(total1, 2500)) return;
    step = 1; jokboStep();
  });
  // 2) 족보가 펼쳐지며 이번 대의 줄에 끝이 적힘(붓이 저절로)
  function jokboStep(){
    const rows = LINE.jokbo.slice(-5), cur = rows[rows.length - 1];
    const older = LINE.jokbo.length > 5 ? '<div class="row faint"><span class="gen">…</span></div>' : '';
    const rowH = j => `<div class="row"><span class="gen">${genHj(j.gen)}世</span><span>${esc(was.sur + j.name)} — <span class="${j === cur ? 'writing' : ''}">${j === cur ? '' : esc(j.end)}</span></span></div>`;
    fadeIn(`<div class="hanji"><h2>族譜</h2>
      <div class="row faint"><span class="gen">十三世</span>…</div>
      <div class="row faint"><span class="gen">十四世</span><span class="inkline"></span></div>
      <div class="row faint"><span class="gen">十五世</span><span class="inkline"></span></div>
      <div class="row faint"><span class="gen">十六世</span><span class="inkline"></span></div>${older}
      ${rows.map(rowH).join('')}
      <div class="after">
        <p class="el">${got.firstCodex ? '멸망 도감이 생겼다. 서안 곁 문서함에 둔다.' : '멸망 도감에 한 줄이 더 적혔다.'}</p>
        <p class="el">다음 대에 남길 것: ${got.relic ? esc(RELIC[got.relic].name) : '없음'}${got.gotKey ? ' · 그리고 대문 열쇠 하나' : ''}</p>
        <div class="el" style="text-align:center;margin-top:16px"><button class="btn" id="bNextGen" style="color:var(--ink);border-color:#00000066">${genHj(LINE.gen)}世를 적는다</button></div>
      </div></div>`, 99999);
    const w = el.querySelector('.writing'), txt = Array.from(cur.end); let i = 0;
    const pen = setInterval(() => { if (i >= txt.length){ clearInterval(pen);
        el.querySelectorAll('.after .el').forEach((p, k) => setTimeout(() => p.classList.add('on'), 700 + k * 1100)); return; }
      w.textContent += txt[i++]; noise(0.12, 900, 0.05, 'bandpass'); }, 380);
    setTimeout(() => sFlip(), 300);
    el.querySelector('#bNextGen').addEventListener('click', ev => { ev.stopPropagation(); location.reload(); });
  }
}

// ── 서안 곁 문서함: 집안 족보 · 멸망 도감 · 가훈첩 · 유품 (책장엔 안 꽂음 — 환생 명세 9절 4번) ──
M.docbox = model(9, 6, 5, (x, y, z) => {
  if (z === 4) return (x === 0 || x === 8 || y === 0 || y === 5) ? '#24160d' : '#3a2416';
  if ((x === 0 || x === 8) && (y === 0 || y === 5)) return '#a8873e';
  if (y === 5 && x === 4 && z === 2) return '#c8a85e';
  return z === 3 ? '#2a1a10' : '#3a2416';
});
OBJ.push({ id:'docbox', x:-12, y:12, rot:0.15, show:()=> LINE.jokbo.length > 0, click:()=>showDocbox() });
function showDocbox(){
  openOv('<h3>문서함</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">앞 대들이 남긴 것. 책장에 꽂지 않고 서안 곁에 둔다.</div>'
    + [['dJ', '집안 족보 — 대마다 한 줄'], ['dC', '멸망 도감(滅亡圖鑑)'], ['dG', '가훈첩(家訓帖)'], ['dR', '유품 — ' + LINE.relics.map(r => RELIC[r] ? RELIC[r].name : r).join(' · ')]]
      .map(([id, t]) => `<div class="rec" id="${id}" style="margin:8px 0">${t}</div>`).join(''));
  const on = (id, f) => document.getElementById(id).addEventListener('click', ev => { ev.stopPropagation(); f(); });
  on('dJ', () => openOv('<h3>집안 족보</h3>' + LINE.jokbo.map(j => `<div style="margin:6px 0">${genHj(j.gen)}世. ${esc(LINE.sur + j.name)} — ${esc(j.end)}<span style="font-size:12px;opacity:.55"> (${j.days}일, 가훈 「${GAHUN[j.gahun] ? GAHUN[j.gahun].t : '—'}」)</span></div>`).join('')
    + `<div style="margin:6px 0">${genHj(LINE.gen)}世. ${esc(LINE.sur + S.name)} — </div>`));
  on('dC', () => openOv('<h3>멸망 도감</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">서고가 끝난 방식. 겪은 것만 적힌다.</div>'
    + Object.keys(LINE.codex).map(id => `<div style="margin:12px 0"><b>${END[id] ? END[id].name : id}</b>${LINE.codex[id].n > 1 ? ` <span style="font-size:12px;opacity:.55">— ${LINE.codex[id].n}번</span>` : ''}<br>${esc(LINE.codex[id].line)}${END[id] && END[id].only ? `<div style="font-size:13px;margin-top:6px">${END[id].only()}</div>` : ''}</div>`).join('')));
  on('dG', () => openOv('<h3>가훈첩</h3>' + GAHUN.map((g, i) => { const u = LINE.gahun.used[i] || 0;
    return `<div style="margin:10px 0"><b>${g.t}</b>${S.gahun === i ? ' <span style="font-size:12px;opacity:.55">— 지금</span>' : ''}<br><span style="font-size:13px;opacity:.8">${u ? g.note[Math.min(1, u - 1)] + ` (${u}대)` : '아직 이 가훈으로 산 가주가 없다.'}</span></div>`; }).join('')));
  on('dR', () => openOv('<h3>유품</h3>' + LINE.relics.map(r => RELIC[r] ? `<div style="margin:10px 0"><b>${RELIC[r].name}</b><br><span style="font-size:13px">${RELIC[r].desc}</span></div>` : '').join('')));
}

// ── 둘째 대부터의 족보 첫 장: 성·본관은 그대로, 이름만(무작위로 하나 적혀 있고 바로 시작할 수 있음) ──
const NEW_NAMES = ['서윤', '하진', '도현', '은재', '지안', '태경', '수아', '민서', '선우', '재희', '윤슬', '해담', '시온', '가람', '도윤', '서진', '나린', '정우', '여름', '이현', '단우', '소율', '규원', '채운'];
const pickName = () => { const used = LINE.jokbo.map(j => j.name).concat([S.name]); const p = NEW_NAMES.filter(n => !used.includes(n)); return p[Math.floor(Math.random() * p.length)] || '서하'; };
function rebirthJokbo(){
  if (LINE.gen <= 17) return;
  const box = document.querySelector('#sJokbo .hanji'), rows = [...box.querySelectorAll('.row')];
  const r17 = rows.find(r => r.querySelector('.gen') && r.querySelector('.gen').textContent === '十七世');
  const past = LINE.jokbo.slice(-4).map(j => `<div class="row"><span class="gen">${genHj(j.gen)}世</span><span>${esc(LINE.sur + j.name)} — ${esc(j.end)}</span></div>`).join('');
  r17.outerHTML = (LINE.jokbo.length > 4 ? '<div class="row faint"><span class="gen">…</span></div>' : '') + past + `<div class="row"><span class="gen">${genHj(LINE.gen)}世</span></div>`;
  iSur.value = LINE.sur; iBon.value = LINE.bon;
  const sr = iSur.closest('.row'); sr.style.display = 'none';
  sr.insertAdjacentHTML('afterend', `<div class="row"><label>성(姓)</label><span>${esc(LINE.sur)}</span><label>본관</label><span>${esc(LINE.bon)}</span></div>`);
  iName.value = ''; iName.placeholder = pickName();
  iName.insertAdjacentHTML('afterend', '<span class="rec" id="bReName" style="font-size:12px;opacity:.55;white-space:nowrap;cursor:pointer">다른 이름</span>');
  document.getElementById('bReName').addEventListener('click', () => { iName.value = ''; iName.placeholder = pickName(); });
}
rebirthJokbo();
// 가훈 족자: 써 본 가훈엔 족보 말투의 설명이 곁에 붙음
document.querySelectorAll('#sGahun .scroll').forEach(el => { const g = GAHUN[+el.dataset.g], u = LINE.gahun.used[+el.dataset.g] || 0;
  el.innerHTML = esc(g.t) + (u ? `<span class="gnote">${esc(g.note[Math.min(1, u - 1)])}</span>` : ''); });
