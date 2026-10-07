'use strict';
// ───────── 끝 — 환생 뼈대 (환생 명세 1~6절 · 코드 정리 설계 2절, 10/7) ─────────
// 10/8 나눔: 이 파일은 끝(END 표·징조·끝 장면·새 대의 첫걸음·가훈 족자·빗장)만. 안전장치 → 19_safe, 책장 → 19_books, 제목 → 19_title, 족보 한 장·문서함 → 19_jokbo.
// 끝(강제 환생)은 END 표 한 곳에 모음 — 끝을 더할 땐 여기에만. 매 틱 n()을 보고 한도의 70%면 징조(기록 한 줄, 한 번), 다 차면 endGame.
// 이름 규칙(10/7 선생님): 문서와 게임이 같은 이름을 씀 — 끝마다 적히는 책 = 「가환록(家患錄)」(옛 이름 '멸망 도감')
// endGame: 가문(LINE)에 족보 줄·가환록·유품·흔적·열린 것을 적고 → 판(S)을 새로 → 끝 장면(기록 → 족보에 붓이 저절로 씀) → 새 대(이름만 묻고 가훈 → 서고).
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
    lim: () => LINE.limits.leave + (hasRelic('ledger') ? 2 : 0) + (GAHUN[S.gahun] && GAHUN[S.gahun].leave || 0),
    omen(){ S.lateApp = true;
      pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '장터에 이 댁 이야기가 돈다 합니다.', '들어오는 사람마다 얼마 못 가 나간다고.', '방을 보고도 발길을 돌리는 이가 있답니다.'], '한서진 올림.', 'min(44vh,320px)')); },
    scene: () => ['방(榜)이 비에 젖어 대문에서 떨어졌다. 다시 붙여도 아무도 오지 않았다.',
      '별채의 책상마다 먼지가 앉았다. 덮어 둔 사본 위에도.',
      '한서진만 남아 혼자 장부를 넘겼다. 넘기는 소리만 서고에 있었다.',
      '어느 아침 서안 위에 쪽지 한 장. 「혼자서는 이 책을 다 읽을 수 없습니다.」',
      '그해 겨울, 가주는 서고 문을 닫았다.'],
    codex: '사람을 거듭 잃으니 서고에 아무도 오지 않았다.',
    only: () => '<b>장터 소문</b> — 「그 집 서고는 사람을 들이고 내보내기를 밥 먹듯 한다더라. 들어간 사람이 나올 땐 얼굴이 달라져 있다더라. 방이 붙어 있어도 가지 마라. 밥은 준다더라만.」',
    relics: ['ledger'], gahun: 2 },
  rice: { name:'쌀독이 비다', kind:'일반',
    n: () => S.riceN || 0,                                                     // 궤짝이 바닥이고 별채에 일하는 사람이 없는 날(달력) — 닷새(10/7 선생님). 날수 셈은 19_safe riceTick
    lim: () => LINE.limits.rice,
    omen(){ pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '쌀독 바닥이 보입니다.', '오늘 아침은 제 집에서 쌀을 덜어 왔습니다.', '세책점 거간이 외상을 놓겠다 하는데,', '그 사람 웃는 얼굴이 마음에 걸립니다.'], '한서진 올림.', 'min(48vh,340px)')); },
    scene: () => ['아침마다 쌀독 바닥을 긁는 소리가 났다.',
      '세책점 거간이 외상 장부를 내밀었다. 쌀 두 섬에 책장의 책 세 권.',
      '거간이 써 준 영수증의 글자는 첫 책의 글자와 닮아 있었다.',
      '별채는 비었고, 한서진은 끼니를 거르며 넘겼다.',
      '그해 겨울, 가주는 남은 책을 궤짝에 넣고 서고 문을 닫았다.'],
    codex: '쌀독이 비어, 책을 쌀과 바꾸었다.',
    only: () => `<b>거간의 영수증</b> — 쌀 두 섬. 받은 것: ${alienHtml(glyphs('책 세 권과 이름 하나', 61))}<br><span style="font-size:12px;opacity:.6">마지막 몇 글자는 아무리 보아도 풀리지 않는다.</span>`,
    relics: ['ledger', 'copies'], gahun: 3 },
};
const gahunOpen = () => (LINE.gahun.unlocked = LINE.gahun.unlocked || [0]);

// ── 새 대의 첫걸음: 유품을 풀고 흔적을 남김(서고에 처음 들어올 때 한 번) ──
function genInit(){
  if (S.genInit) return; S.genInit = true; S.gen = LINE.gen; S.genDay = dayKey();
  if (LINE.gen > 17 && LINE.trace) S.trace = LINE.trace.from;
  if (hasRelic('ledger')) S.steward = true;
  for (const b of LINE.books || []) gainBook(b, 'own');              // 앞 대들이 모아 둔 책은 처음부터 책장에(19_books)
  if (hasRelic('copies') && LINE.gen > 17){ S.money = (S.money == null ? 500 : S.money) + 100; ledger('앞 대의 사본 묶음을 세책점에 넘김 + 1냥'); }
  if (typeof tlog === 'function') tlog(LINE.gen + '세 시작' + (S.trace ? ' (앞 대: ' + END[S.trace].name + ')' : ''));
  save();
}
function traceTick(){
  if (S.trace === 'nobody' && S.bangAt && !S.traceDone){           // 소문: 첫 지원자가 하루 늦게
    S.traceDone = true; S.genNext = Math.max(S.genNext || 0, S.bangAt + 120000 + DAY_MS()); S.gnSeen = S.genNext; save(); }
  if (S.trace === 'rice' && S.rArrived && !S.traceDone){           // 밀린 것을 안고 시작: 한서진의 녹봉이 이틀 밀린 채
    S.traceDone = true; S.owe = S.owe || {}; S.owe.sj = { amt: WAGE('sj') * 2, days: 2 }; if (S.payDay == null) S.payDay = dayKey(); save(); }
  const late = GAHUN[S.gahun] && GAHUN[S.gahun].appLate;
  if ((S.lateApp || late) && S.genNext && S.genNext !== S.gnSeen){   // 징조 뒤로는 지원자가 하루씩 늦게 / 가훈 「사람을 아끼지 마라」는 기다림이 두 배
    if (S.genNext > Date.now() - 1000){ if (late) S.genNext = Date.now() + (S.genNext - Date.now()) * late; if (S.lateApp) S.genNext += DAY_MS(); }
    S.gnSeen = S.genNext; save(); }
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
function endTick(){
  if (S.ended || window.BOOTING) return;
  S.omen = S.omen || {};
  for (const id of Object.keys(END)){
    const E = END[id], v = E.n(), L = E.lim();
    if (!S.omen[id] && v >= Math.ceil(L * 0.7) && v < L){ S.omen[id] = true; E.omen(); if (typeof tlog === 'function') tlog('징조: ' + E.name); save(); }
    if (v >= L){ endGame(id); return; }
  }
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; genInit(); traceTick(); againTick(); againNote(); endTick(); });

// ── 끝 ──
function endGame(id){
  const E = END[id]; if (S.ended) return;
  S.ended = id; if (typeof tlog === 'function') tlog('환생: ' + E.name); save();
  const was = { gen: LINE.gen, sur: S.sur || LINE.sur, bon: S.bon || LINE.bon, name: S.name, gahun: S.gahun };
  const firstCodex = !Object.keys(LINE.codex).length;
  LINE.jokbo.push({ gen: LINE.gen, name: S.name, end: E.name, endId: id, days: Math.max(1, dayKey() - (S.genDay == null ? dayKey() : S.genDay) + 1), gahun: S.gahun, mode: S.mode || 'basic' });
  const c = LINE.codex[id] || { n:0, first: Date.now() }; c.n++; c.line = E.codex; LINE.codex[id] = c;
  if (S.gahun >= 0) LINE.gahun.used[S.gahun] = (LINE.gahun.used[S.gahun] || 0) + 1;
  const newGahun = E.gahun != null && !gahunOpen().includes(E.gahun) ? E.gahun : null; if (newGahun != null) LINE.gahun.unlocked.push(newGahun);
  const pool = E.relics.filter(r => !hasRelic(r)), relic = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  const gotKey = !hasRelic('key');
  if (gotKey) LINE.relics.push('key'); if (relic) LINE.relics.push(relic);
  for (const r of reachedNow()) LINE.reached[r] = (LINE.reached[r] || 0) + 1;
  LINE.books = [...new Set([...(LINE.books || []), ...(S.shelfOrder || []).filter(b => hasBook(b) && !(S.books && S.books[b] === 'borrow'))])];   // 책장은 대를 넘어 남음(빌린 책은 빼고)
  LINE.trace = { from: id }; LINE.gloss = S.gl; LINE.margins = S.margins || [];
  LINE.gen++; saveLine();
  // 판은 새로 — 낱말 장부·여백 글씨·시험 기록·설정만 들고 감
  localStorage.setItem(SAVE, JSON.stringify({ stage:'jokbo', opt: S.opt, gl: S.gl, margins: S.margins, tlog: S.tlog }));
  resetting = true;
  endScene(E, was, { relic, gotKey, firstCodex, newGahun });
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
  // 2) 족보가 펼쳐지며 이번 대의 줄에 끝이 적힘(붓이 저절로) — 족보 줄 그리기는 19_jokbo
  function jokboStep(){
    const cur = LINE.jokbo[LINE.jokbo.length - 1];
    fadeIn(`<div class="hanji"><h2>族譜</h2>
      ${jokboOldRows(false)}
      ${jokboLineRows(cur)}
      <div class="after">
        <p class="el">${got.firstCodex ? '가환록(家患錄)을 새로 매어 서안 곁 문서함에 둔다. 첫 줄이 적혔다.' : '가환록에 한 줄이 더 적혔다.'}</p>
        ${got.newGahun != null ? `<p class="el">가훈 하나가 풀렸다 — 「${GAHUN[got.newGahun].t}」</p>` : ''}
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

// 가훈 족자(둘째 대부터): 물려받은 것 + 끝으로 풀린 것. 살아 본 가훈에만 족보 말투의 설명이 곁에 붙음
document.getElementById('gahunWrap').innerHTML = gahunOpen().map(i => { const g = GAHUN[i], u = LINE.gahun.used[i] || 0;
  return `<div class="scroll" data-g="${i}">${esc(g.t)}${u ? `<span class="gnote">${esc(g.note[Math.min(1, u - 1)])}</span>` : ''}</div>`; }).join('');

// ── 대문의 빗장 = 기본/하드 모드 (환생 명세 10-12): 1대엔 녹슬어 안 움직임, 첫 강제 환생 뒤 새 대 시작 때 대문 앞에서 처음 고름(한 대에 한 번) ──
// 지금은 물건과 고르기만 — 하드의 보상(가환록 두 번째 장·칭호·'집을 비우다')은 뒤 묶음.
M.barShut = model(12, 1, 2, (x, y, z) => (x === 0 || x === 11) ? '#a8873e' : (z ? '#5e3c22' : '#4a2e18'));
M.barRust = model(12, 1, 2, (x, y, z) => (x === 0 || x === 11) ? '#6e5236' : ((x * 3 + z) % 4 ? '#5a3e2a' : '#8a4a26'));
M.barOpen = model(2, 1, 12, (x, y, z) => (z === 0 || z === 11) ? '#a8873e' : (x ? '#5e3c22' : '#4a2e18'));   // 빼서 문짝 옆에 세워 둠
GATE_OBJ.push({ id:'gBar', y:-19.6, rot:0, on:()=>'gate', get x(){ return S.mode === 'hard' ? -8 : 0; }, get z(){ return S.mode === 'hard' ? 2 : 5; },
  m:()=> LINE.gen <= 17 ? 'barRust' : S.mode === 'hard' ? 'barOpen' : 'barShut', show:()=> Math.cos(viewA) > 0.05, click:()=>showBar(), glow:()=> LINE.gen > 17 && !S.mode });
const MODE_TXT = {
  basic: ['문을 잠그고 떠난다', '당신이 없는 동안 서고는 버팁니다. 다만 아무 일도 일어나지 않는 것은 아닙니다.'],
  hard:  ['문을 열어 두고 떠난다', '당신이 없는 동안에도 서고는 살아 있습니다. 돌아왔을 때 당신이 아닌 당신의 자식이 이 글을 읽고 있을 수도 있습니다. 그렇게만 얻을 수 있는 것들이 있습니다.'],
};
function showBar(){
  if (LINE.gen <= 17) return openOv('<h3>빗장</h3>대문의 빗장. 녹슬어 움직이지 않는다.');
  if (S.mode) return openOv(`<h3>빗장</h3>${S.mode === 'hard' ? '빗장을 빼서 문짝 옆에 세워 두었다. 대문은 열려 있다.' : '빗장이 걸려 있다.'}<br><span style="font-size:13px;opacity:.7">이 대 동안은 이대로다.</span>`);
  openOv('<h3>빗장</h3>녹이 벗겨져 있다. 누군가 기름을 먹여 둔 것 같다.<br>이번 대에는 어떻게 하고 떠날 것인가. <span style="font-size:12px;opacity:.6">(한 대에 한 번 — 이 대 동안 못 바꾼다)</span>'
    + Object.keys(MODE_TXT).map(k => `<div class="rec" data-mode="${k}" style="margin:12px 0;padding:10px 12px;border:1px solid #00000033"><b>${MODE_TXT[k][0]}</b><br><span style="font-size:13px">${MODE_TXT[k][1]}</span></div>`).join(''),
    () => { if (!S.mode) setTimeout(showBar, 300); });              // 처음엔 고르지 않고 닫을 수 없음
  ovBody.querySelectorAll('[data-mode]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation();
    S.mode = el.dataset.mode; LINE.mode = S.mode; saveLine(); save(); ov._onClose = null; ov.classList.add('hidden');
    sLatch();   // 빗장 소리
    if (typeof tlog === 'function') tlog('빗장: ' + MODE_TXT[S.mode][0]);
    if (!S.opened) setTimeout(() => { goScene('seogo'); enterRoom(); }, 900);   // 새 대의 첫 서고로
  }));
}
// 새 대 시작(이름 → 가훈) 다음: 아직 안 골랐으면 대문 앞으로
let barAsked = false;
HOOK.tick.push(() => {
  if (barAsked || LINE.gen <= 17 || S.mode || S.stage !== 'room' || S.ended || !ov.classList.contains('hidden')) return;
  barAsked = true; if (bookOpen) closeBook(); if (S.scene !== 'gate') goScene('gate'); setTimeout(showBar, 900);
});
