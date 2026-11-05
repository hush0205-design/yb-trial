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
    n: () => genKeys().filter(k => S.st[k] && S.st[k].quit && !S.st[k].sosil && !S.st[k].missing).length,   // 소실·실종은 다른 끝 쪽 셈(점검 11/4)            // 내보냄 + 녹봉 떠남 + 겁에 질려 그만둠(10/7 선생님)
    lim: () => LINE.limits.leave + (hasRelic('ledger') ? 2 : 0) + (hasRelic('roster') ? 1 : 0) + (GAHUN[S.gahun] && GAHUN[S.gahun].leave || 0),
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

// ── 끝이 다가오는 것이 방 안 물건으로 보임(10/25 선생님 "더 가시적이었으면") — 설명 없이 물건만, 누르는 물건이 아님(터치 범위 없음) ──
// 아무도 오지 않다: 떠난 사람 수만큼 별채 앞쪽 마루에 빈 방석, 먼저 떠난 사람 방석일수록 먼지 / 빈 별채 책상에도 먼지(한도에 가까울수록)
// 쌀독이 비다: 방을 붙인 뒤 서고 앞쪽 마루에 쌀독 — 쌀이 날마다 줄고, 마지막 날엔 바닥에 긁힌 자국
const DUST = '#8a8478', JAR_IN = 5;                                   // 먼지 빛 / 쌀독 안 깊이(층) — 얕고 아가리가 넓어야 위에서 쌀 높이가 보임
const dusty = (x, y, lv) => lv > 0 && hash(x + 11, y + 7) < lv * 0.2;
for (let lv = 0; lv <= 3; lv++){
  M['cushion' + lv] = model(7, 7, 2, (x, y, z) => { const rim = x === 0 || x === 6 || y === 0 || y === 6;
    if (z === 0) return '#3e2420';
    if (dusty(x, y, lv)) return DUST;
    return rim ? '#4a2a26' : (x === 3 && y === 3 ? '#3e2420' : '#6a3a32'); });
  M['deskDust' + lv] = model(12, 8, 1, (x, y) => !(x >= 8 && x <= 9 && y >= 2 && y <= 3) && dusty(x * 3, y * 5, lv) ? DUST : null);
}
const jarR = z => [4.6, 5.6, 6.3, 6.4, 6.4, 6.1, 6.0][z];                  // 옹기 배가 부른 모양(아래가 좁음)
for (let f = 0; f <= JAR_IN; f++) M['riceJar' + f] = model(13, 13, 7, (x, y, z) => {
  const d = Math.hypot(x - 6, y - 6), r = jarR(z), inner = d <= r - 1.7;
  if (d > r) return null;
  if (z === 6) return inner ? null : '#6a4a30';                                           // 아가리 전
  if (z === 0) return inner && !f ? '#1c120a' : '#3e2a1c';                                // 바닥
  if (!inner){ if (!f && y < 4 && z >= 2 && (x + z * 2) % 3 === 0) return '#8a7a5c';       // 다 비면 안쪽 벽에 긁힌 자국
    return (x + z) % 5 ? '#3e2a1c' : '#4a3424'; }                                       // 잿물 옹기
  if (z <= f) return (x * 7 + y * 3 + z) % 9 ? '#e6dfcc' : '#cfc6ae';                    // 쌀
  return null; });
const riceFill = () => { const n = S.riceN || 0, L = END.rice.lim(); return n >= L - 1 ? 0 : Math.round(JAR_IN * (1 - n / Math.max(1, L - 1))); };
const quitN = () => Math.min(END.nobody.n(), END.nobody.lim() - 1);
const SIGN_OBJ = [
  { id:'riceJar', x:11, y:21, rot:0, m:()=> 'riceJar' + riceFill(), show:()=> !!S.bangAt },
];
OBJ.push(SIGN_OBJ[0]);
for (let i = 0; i < 8; i++){                                          // 빈 방석(한도는 유품·가훈으로 늘어도 여덟을 넘지 않음)
  const o = { id:'cushion' + i, x:-27 + i * 9, y:20, rot:0, m:()=> 'cushion' + Math.min(3, quitN() - 1 - i), show:()=> i < quitN() };
  SIGN_OBJ.push(o); LAB_OBJ.push(o);
}
for (const d of DESK_IDS){                                            // 빈 별채 책상 위 먼지
  const o = { id:'dust_' + d, x:LAB_DESKS[d][0], y:LAB_DESKS[d][1], z:11, rot:0, on:()=>d, onOrder:0.015, m:()=> 'deskDust' + Math.min(3, Math.ceil(3 * END.nobody.n() / END.nobody.lim())),
    show:()=> !!S.owned[d] && END.nobody.n() > 0 && !(deskOwner(d) && arrived(deskOwner(d))) };
  SIGN_OBJ.push(o); LAB_OBJ.push(o);
}
HOOK.tick.push(() => { for (const o of SIGN_OBJ) o.hit = null; });   // 그리기 바로 뒤에 돌므로 누르기는 뒤 물건으로 감
// 징조가 오는 순간: 등잔 불이 한 번 낮게 숙고(다시 붙인 불의 깜빡임을 빌림), 끝마다 소리 하나
function omenSign(id){
  if (S.owned.lamp && !S.lampOut) relitAt = performance.now();
  if (id === 'nobody'){ noise(2.2, 160, 0.14, 'lowpass'); setTimeout(() => sChair(0.12), 900); }      // 대문 쪽에서 바람, 빈 의자 삐걱
  else if (id === 'rice') [0, 420, 900].forEach(t => setTimeout(() => noise(0.22, 1300, 0.05), t));   // 독 바닥을 긁는 소리(쌀독 끝만, 점검 11/4)
}

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
    if (!S.omen[id] && v >= Math.ceil(L * 0.7) && v < L){ S.omen[id] = true; E.omen(); omenSign(id); if (typeof tlog === 'function') tlog('징조: ' + E.name); save(); }
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
  { const f = typeof featsAt === 'function' ? featsAt(id) : null; if (f) LINE.jokbo[LINE.jokbo.length - 1].feat = f; }   // 별호(19_feats): 족보 줄 곁에 이어 씀
  const c = LINE.codex[id] || { n:0, first: Date.now() }; c.n++; c.line = E.codex; LINE.codex[id] = c;
  if (S.gahun >= 0) LINE.gahun.used[S.gahun] = (LINE.gahun.used[S.gahun] || 0) + 1;
  const newGahun = E.gahun != null && !gahunOpen().includes(E.gahun) ? E.gahun : null; if (newGahun != null) LINE.gahun.unlocked.push(newGahun);
  const pool = E.relics.filter(r => !hasRelic(r)), relic = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  const gotKey = !hasRelic('key');
  if (gotKey) LINE.relics.push('key'); if (relic) LINE.relics.push(relic);
  for (const r of reachedNow()) LINE.reached[r] = (LINE.reached[r] || 0) + 1;
  LINE.books = [...new Set([...(LINE.books || []), ...(S.shelfOrder || []).filter(b => hasBook(b) && !(S.books && S.books[b] === 'borrow'))])];   // 책장은 대를 넘어 남음(빌린 책은 빼고)
  if (id === 'fire') LINE.books.splice(-2, 2);   // 흔적(불이 번지다, 환생 명세 5절): 책장이 타서 곁책 둘이 줄어 있음
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
  fadeIn(`<div class="hanji endRec"><h3>${esc(was.sur + was.name)}의 마지막 해</h3><canvas class="endPic" width="160" height="80" style="display:block;width:min(320px,78vw);height:auto;aspect-ratio:2/1;margin:0 auto 6px;opacity:0;transition:opacity 2.4s"></canvas>${E.scene().map(t => `<p class="el">${esc(t)}</p>`).join('')}<div class="el endTap">— 눌러서 넘긴다 —</div></div>`, 1500);
  noise(1.2, 140, 0.18, 'lowpass');
  endPic(el.querySelector('.endPic'), Object.keys(END).find(k => END[k] === E));
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
        ${typeof featGot !== 'undefined' && featGot.length ? `<p class="el">별호의 몫 — ${featGot.join(' · ')}</p>` : ''}
        <p class="el">다음 대에 남길 것: ${got.relic ? esc(RELIC[got.relic].name) : '없음'}${got.gotKey ? ' · 그리고 대문 열쇠 하나' : ''}</p>
        <div class="el" style="margin-top:14px;font-size:13px"><span style="opacity:.75">족보 여백에 한 줄 —</span> <span style="font-size:11px;opacity:.5">(다음 대가 읽는다. 비워 두어도 된다)</span><br><input id="iLast" maxlength="14" autocomplete="off" placeholder="　" style="font:inherit;font-size:15px;background:transparent;border:none;border-bottom:1px solid #00000055;color:var(--ink);padding:2px 4px;width:15em;outline:none;margin-top:4px"></div>
        <div class="el" style="text-align:center;margin-top:16px"><button class="btn" id="bNextGen" style="color:var(--ink);border-color:#00000066">${genHj(LINE.gen)}世를 적는다</button></div>
      </div></div>`, 99999);
    const w = el.querySelector('.writing'), txt = Array.from(cur.end + (cur.feat ? ' · ' + cur.feat : '')); let i = 0;
    const pen = setInterval(() => { if (i >= txt.length){ clearInterval(pen);
        el.querySelectorAll('.after .el').forEach((p, k) => setTimeout(() => p.classList.add('on'), 700 + k * 1100)); return; }
      w.textContent += txt[i++]; noise(0.12, 900, 0.05, 'bandpass'); }, 380);
    setTimeout(() => sFlip(), 300);
    const inp = el.querySelector('#iLast'); inp.addEventListener('keydown', e => e.stopPropagation());
    el.querySelector('#bNextGen').addEventListener('click', ev => { ev.stopPropagation();
      const v = (inp.value || '').trim().slice(0, 14);                                   // 앞 대의 한 줄(기획서 20절 1) — 가문 기록은 이미 저장됐으므로 바로 다시 씀
      if (v){ cur.last = v; localStorage.setItem(LINE_KEY, JSON.stringify(LINE)); }
      location.reload(); });
  }
}

// 끝 장면의 그림 한 장(160×80 낱칸을 크게 늘림): 빈 방석들 위로 먼지가 내려앉음 / 빈 쌀독 안. 그림이 화면에 있는 동안만 움직임
function endPic(cvs, id){
  const g = cvs.getContext('2d'), t0 = performance.now();
  setTimeout(() => { cvs.style.opacity = 1; }, 200);
  const motes = Array.from({ length: 26 }, (_, k) => [hash(k, 3) * 160, hash(k, 9) * 80, 2 + hash(k, 5) * 4]);   // 먼지 알갱이: x, 처음 높이, 빠르기(낱칸/초)
  const vox = (list, a, sc) => { const keep = [cx, SC]; cx = g; SC = sc;                      // 방 그리기(drawModel)를 이 그림판에 빌려 씀 — 같은 틀 안에서 바로 되돌림
    try { const c = Math.cos(a), s = Math.sin(a);
      for (const [m, x, y, z] of list.map(o => [o[0], o[1], o[2], o[3] || 0, o[1] * s + o[2] * c]).sort((p, q) => p[4] - q[4]))
        drawModel(M[m], 80 + (x * c - y * s) * sc, 50 + (x * s + y * c) * sc * 0.6, a, 1, z);
    } finally { [cx, SC] = keep; } };
  const draw = now => {
    if (!cvs.isConnected) return;
    const t = (now - t0) / 1000;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.imageSmoothingEnabled = false; g.fillStyle = '#0b0907'; g.fillRect(0, 0, 160, 80);
    if (id === 'nobody'){
      const lv = Math.max(0, Math.min(3, Math.floor(t / 2.2)));                                            // 방석에 먼지가 쌓여 감
      vox([['labFloor', 0, 0, -1]], 0.12, 2);
      vox([['ldesk', -22, -8], ['chair', -22, -15], ['ldesk', 0, -8], ['chair', 0, -15], ['ldesk', 22, -8], ['chair', 22, -15],
           ['deskDust3', -22, -8, 11], ['deskDust3', 0, -8, 11], ['deskDust3', 22, -8, 11],
           ...[-24, -12, 0, 12, 24].map((x, k) => ['cushion' + Math.min(3, lv + (k % 2)), x, 10])], 0.12, 2);
      g.fillStyle = 'rgba(240,225,190,0.07)'; g.beginPath(); g.moveTo(38, 0); g.lineTo(70, 0); g.lineTo(122, 80); g.lineTo(66, 80); g.fill();   // 창으로 드는 빛줄기
      for (const [x, y0, v] of motes){ const y = (y0 + t * v) % 80, inBeam = x > 38 + y * 0.35 && x < 70 + y * 0.65;
        g.fillStyle = `rgba(207,198,174,${inBeam ? 0.7 : 0.18})`; g.fillRect(Math.floor(x + Math.sin(t + y0) * 2), Math.floor(y), 1, 1); }
    } else if (id === 'shut'){                                                                       // 문을 잠그고 나오지 않다(19_mad): 안에서 잠긴 서고 문, 문틈 불빛이 꺼져 감
      g.fillStyle = '#2a1c12'; g.fillRect(52, 6, 56, 70); g.fillStyle = '#3e2a1c'; g.fillRect(56, 10, 22, 62); g.fillRect(82, 10, 22, 62);
      g.fillStyle = '#6a4a30'; g.fillRect(50, 40, 60, 4);                                                // 빗장
      const lit = Math.max(0, 1 - t / 8); g.fillStyle = `rgba(232,176,74,${0.55 * lit + 0.05 * Math.sin(t * 6)})`; g.fillRect(56, 74, 48, 2);   // 문틈 불빛
      for (let k = 0; k < 4; k++){ g.fillStyle = '#8a7a5c'; g.fillRect(60 + k * 3, 46 + k, 1, 6); }        // 안쪽 손톱자국
    } else if (id === 'forget'){                                                                     // 잊기(19_forget): 대문 고리에 채운 자물쇠, 길은 산 쪽으로
      g.fillStyle = '#2a1c12'; g.fillRect(40, 10, 80, 64); g.fillStyle = '#3e2a1c'; g.fillRect(44, 14, 34, 60); g.fillRect(82, 14, 34, 60);
      g.fillStyle = '#8a7448'; g.fillRect(74, 40, 12, 10); g.strokeStyle = '#8a7448'; g.lineWidth = 2; g.beginPath(); g.arc(80, 40, 4, Math.PI, 0); g.stroke();
      g.fillStyle = `rgba(240,225,190,${0.05 + 0.04 * Math.sin(t)})`; g.fillRect(0, 0, 160, 80);
    } else if (id === 'teaCut'){                                                                     // 차를 끊다(19_ends): 식은 찻주전자, 김이 오르지 않음
      g.fillStyle = '#3a3a30'; g.beginPath(); g.ellipse(80, 48, 22, 16, 0, 0, Math.PI * 2); g.fill(); g.fillRect(100, 40, 16, 4); g.fillRect(72, 28, 16, 6);
      g.strokeStyle = '#4a4a3e'; g.lineWidth = 3; g.beginPath(); g.arc(60, 46, 8, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
      g.fillStyle = '#c9c0ab'; [[40, 64], [120, 64]].forEach(([x, y]) => { g.fillRect(x - 6, y, 12, 6); });   // 엎어 둔 찻잔
    } else if (id === 'borrow'){                                                                     // 빌린 책을 안 돌려주다(19_ends): 거간의 장부, 마지막 줄이 낯선 글자로 번져 감
      g.fillStyle = '#d9cdab'; g.fillRect(44, 12, 72, 58); g.fillStyle = '#b8ab88'; g.fillRect(79, 12, 2, 58);
      g.fillStyle = '#3a2a20'; for (let k = 0; k < 6; k++){ g.fillRect(50, 18 + k * 8, 24, 1); g.fillRect(86, 18 + k * 8, k === 5 ? 24 * Math.min(1, t / 4) : 24, k === 5 ? 2 : 1); }
    } else if (id === 'liver'){                                                                      // 간을 두고 오다(19_ends): 물가에 가지런한 짚신, 물결이 들고 남
      const w = 46 + Math.sin(t * 1.2) * 4; g.fillStyle = '#1e2a30'; g.fillRect(0, w, 160, 80 - w); g.fillStyle = 'rgba(200,210,215,0.25)'; for (let k = 0; k < 6; k++) g.fillRect(10 + k * 26, w + 3 + (k % 2) * 4, 14, 1);
      g.fillStyle = '#b8a070'; g.fillRect(70, 34, 7, 12); g.fillRect(81, 35, 7, 12);
    } else if (id === 'night'){                                                                      // 밤에 일 시키다(19_ends): 캄캄한 별채, 등잔 없는 책상 위로 글자가 하나씩 떠오름
      g.fillStyle = '#14100c'; for (let k = 0; k < 3; k++) g.fillRect(34 + k * 34, 48, 26, 10);
      for (let k = 0; k < Math.min(9, Math.floor(t * 1.5)); k++){ g.fillStyle = `rgba(200,210,190,${0.25 + 0.2 * Math.sin(t * 2 + k)})`; g.fillRect(40 + (k % 3) * 34 + hash(k, 4) * 10, 40 - Math.floor(k / 3) * 7, 3, 3); }
    } else if (id === 'away'){                                                                       // 집을 비우다: 서안 위 쪽지 더미
      for (let k = 0; k < 9; k++){ g.fillStyle = k % 2 ? '#d9cdab' : '#cfc2a0'; g.save(); g.translate(80, 58 - k * 4); g.rotate((hash(k, 7) - 0.5) * 0.5); g.fillRect(-18, -6, 36, 12); g.restore(); }
    } else if (id === 'sea'){                                                                        // 물가에서(19_ends): 굴 입구로 이어지는 발자국, 물이 들어옴
      g.fillStyle = '#1a140f'; g.beginPath(); g.arc(118, 46, 18, Math.PI, 0); g.fill(); g.fillStyle = '#2a2a24'; g.fillRect(0, 46, 160, 34);
      g.fillStyle = '#8a8070'; for (let k = 0; k < 7; k++) g.fillRect(20 + k * 13, 60 - k * 2 + (k % 2) * 3, 4, 2);   // 발자국
      g.fillStyle = `rgba(40,60,70,${0.4 + 0.3 * Math.min(1, t / 5)})`; g.fillRect(0, 66 - Math.min(14, t * 2), 160, 20);
    } else if (id === 'flee'){                                                                       // 도주(19_ends): 부적을 붙인 궤짝, 먼지가 내려앉음
      g.fillStyle = '#3e2a1c'; g.fillRect(48, 34, 64, 34); g.fillStyle = '#5a3e28'; g.fillRect(46, 28, 68, 8);
      g.fillStyle = '#d9cdab'; g.fillRect(72, 26, 16, 26); g.fillStyle = '#9a3a26'; for (let k = 0; k < 5; k++) g.fillRect(76 + (k % 2) * 4, 30 + k * 4, 5, 1);
      for (const [x, y0, v] of motes){ const y = (y0 + t * v * 0.6) % 80; g.fillStyle = 'rgba(207,198,174,0.35)'; g.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
    } else if (id === 'fire'){                                                                       // 불이 번지다: 그을린 책장, 아래에서 일렁이는 불빛
      for (let k = 0; k < 9; k++){ g.fillStyle = k === 4 ? '#8a6a34' : '#1e1510'; g.fillRect(36 + k * 10, 14, 8, 44); }
      const f = 0.5 + 0.5 * Math.sin(t * 7) * Math.sin(t * 3.1); const fg = g.createLinearGradient(0, 80, 0, 40); fg.addColorStop(0, `rgba(255,120,40,${0.55 + 0.25 * f})`); fg.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = fg; g.fillRect(20, 40, 120, 40);
    } else if (id === 'swallow'){                                                                    // 모두 물가로 가다: 대문 앞 모래, 바다 쪽으로만 난 발자국
      g.fillStyle = '#3a3226'; g.fillRect(0, 0, 160, 80); g.fillStyle = '#1c2a30'; g.fillRect(0, 0, 160, 12);
      g.fillStyle = '#1a140e'; for (let k = 0; k < 15; k++){ const on = Math.min(1, Math.max(0, t - 0.8 - k * 0.3)); if (!on) continue;
        g.globalAlpha = on * 0.85; g.fillRect(52 + (k % 4) * 16 + (k % 2) * 3, 74 - k * 4.2, 3, 2); }
      g.globalAlpha = 1;
    } else if (id === 'hasty'){                                                                      // 서둘러 깨우다: 펼친 책, 아래에서 차오르는 검은 물
      g.fillStyle = '#d8d0b8'; g.fillRect(34, 18, 44, 50); g.fillRect(82, 18, 44, 50); g.fillStyle = '#4a4030'; g.fillRect(79, 16, 2, 54);
      g.fillStyle = '#6a6050'; for (let y = 24; y < 62; y += 6) g.fillRect(38, y, 36, 1);
      const w = Math.min(1, t / 6), lv = 80 - w * 46; g.fillStyle = 'rgba(16,34,40,0.85)';
      g.beginPath(); g.moveTo(0, 80); for (let x = 0; x <= 160; x += 8) g.lineTo(x, lv + Math.sin(x / 13 + t * 1.6) * 2); g.lineTo(160, 80); g.fill();
    } else if (id === 'sea'){                                                                        // 물가에서: 밤바다, 멀어지는 등롱 하나
      g.fillStyle = '#0c1418'; g.fillRect(0, 0, 160, 80); g.fillStyle = '#16262c'; for (let y = 44; y < 80; y += 5) g.fillRect(0, y + Math.sin(t * 1.3 + y) * 1.5, 160, 2);
      const lx = 80 + Math.min(40, t * 4), ly = 40 - Math.min(10, t); g.fillStyle = `rgba(232,176,74,${Math.max(0.15, 0.9 - t / 14)})`; g.fillRect(lx, ly + Math.sin(t * 2) * 1, 3, 3);
    } else if (id === 'away'){                                                                       // 집을 비우다: 빈 서안 위 종이 한 장, 서툰 한 줄
      g.fillStyle = '#1a120b'; for (let y = 0; y < 80; y += 6) g.fillRect(0, y, 160, 1);
      g.fillStyle = '#3e2a1c'; g.fillRect(40, 34, 80, 26); g.fillStyle = '#d8d0b8'; g.fillRect(62, 38, 36, 16);
      g.fillStyle = '#3a3026'; const w = Math.min(26, t * 4); g.fillRect(67, 45, w, 1); g.fillRect(67 + w * 0.3, 46, w * 0.4, 1);
    } else if (id === 'eyes'){                                                                       // 눈이 다하다: 흰 천을 감은 얼굴
      g.fillStyle = '#d9c8a8'; g.beginPath(); g.ellipse(80, 42, 20, 26, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f2ecd8'; g.fillRect(58, 34, 44, 9); g.fillStyle = '#c9c0ab'; g.fillRect(58, 42, 44, 1);
      g.fillStyle = '#5a3a2a'; g.fillRect(74, 54, 12, 1);
    } else {
      g.fillStyle = '#1a120b'; for (let y = 0; y < 80; y += 6) g.fillRect(0, y, 160, 1);    // 마루 널
      const e = (rx, ry, col, dy = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(80, 40 + dy, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
      e(46, 30, '#2a1c12', 6); e(44, 28, '#3e2a1c'); e(40, 24, '#6a4a30'); e(36, 21, '#24170d');   // 독 몸통·전·안
      const ig = g.createRadialGradient(80, 44, 2, 80, 40, 36); ig.addColorStop(0, 'rgba(60,40,24,0.6)'); ig.addColorStop(1, 'rgba(0,0,0,0.5)'); e(36, 21, ig);
      g.strokeStyle = '#8a7a5c'; g.lineWidth = 1;                                              // 긁힌 자국: 세 줄씩, 하나씩 드러남
      [[62, 36], [86, 48], [96, 32], [70, 50]].forEach(([x, y], k) => { const on = Math.min(1, Math.max(0, t - 1.5 - k * 1.3)); if (!on) return;
        g.globalAlpha = on * 0.8; for (let j = 0; j < 3; j++){ g.beginPath(); g.moveTo(x + j * 2, y); g.lineTo(x + j * 2 + 7, y + 4 - j); g.stroke(); } });
      g.globalAlpha = 1; g.fillStyle = '#e6dfcc'; g.fillRect(57, 42, 1, 1); g.fillRect(101, 39, 1, 1); g.fillRect(83, 56, 1, 1);   // 남은 쌀알 셋
    }
    const vg = g.createRadialGradient(80, 40, 20, 80, 40, 92); vg.addColorStop(0, 'rgba(11,9,7,0)'); vg.addColorStop(1, 'rgba(11,9,7,0.95)'); g.fillStyle = vg; g.fillRect(0, 0, 160, 80);
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

// 가훈 족자(둘째 대부터): 물려받은 것 + 끝으로 풀린 것. 살아 본 가훈에만 족보 말투의 설명이 곁에 붙음
document.getElementById('gahunWrap').innerHTML = gahunOpen().map(i => { const g = GAHUN[i], u = LINE.gahun.used[i] || 0;
  return `<div class="scroll" data-g="${i}">${gahunHtml(i)}${u ? `<span class="gnote">${esc(g.note[Math.min(1, u - 1)])}</span>` : ''}</div>`; }).join('');

// ── 대문의 빗장 = 기본/하드 모드 (환생 명세 10-12): 1대엔 녹슬어 안 움직임, 첫 강제 환생 뒤 새 대 시작 때 대문 앞에서 처음 고름(한 대에 한 번) ──
// 지금은 물건과 고르기만 — 하드의 보상(가환록 두 번째 장·칭호·'집을 비우다')은 뒤 묶음.
M.barShut = model(12, 1, 2, (x, y, z) => (x === 0 || x === 11) ? '#a8873e' : (z ? '#5e3c22' : '#4a2e18'));
M.barRust = model(12, 1, 2, (x, y, z) => (x === 0 || x === 11) ? '#6e5236' : ((x * 3 + z) % 4 ? '#5a3e2a' : '#8a4a26'));
M.barOpen = model(2, 1, 12, (x, y, z) => (z === 0 || z === 11) ? '#a8873e' : (x ? '#5e3c22' : '#4a2e18'));   // 빼서 문짝 옆에 세워 둠
GATE_OBJ.push({ id:'gBar', y:-19.6, rot:0, on:()=>'gate', get x(){ return S.mode === 'hard' ? -8 : 0; }, get z(){ return S.mode === 'hard' ? 2 : 5; },
  m:()=> LINE.gen <= 17 ? 'barRust' : S.mode === 'hard' ? 'barOpen' : 'barShut', show:()=> Math.cos(viewA) > 0.05, click:()=>showBar(), glow:()=> LINE.gen > 17 && !S.mode });
const MODE_TXT = {
  basic: ['빗장을 건다', '당신이 없는 동안 서고는 버팁니다. 다만 아무 일도 일어나지 않는 것은 아닙니다.'],
  hard:  ['빗장을 빼 둔다', '당신이 없는 동안에도 서고는 살아 있습니다. 돌아왔을 때 당신이 아닌 당신의 자식이 이 글을 읽고 있을 수도 있습니다. 그렇게만 얻을 수 있는 것들이 있습니다.'],
};
function showBar(){
  if (LINE.gen <= 17) return openOv('<h3>빗장</h3>대문의 빗장. 녹슬어 움직이지 않는다.');
  if (S.mode) return openOv(`<h3>빗장</h3>${S.mode === 'hard' ? '빗장을 빼서 문짝 옆에 세워 두었다. 대문은 열려 있다.' : '빗장이 걸려 있다.'}<br><span style="font-size:13px;opacity:.7">이 대 동안은 이대로다.</span>`);
  openOv('<h3>빗장</h3>녹이 벗겨져 있다. 누군가 기름을 먹여 둔 것 같다.<br>이번 대에는 빗장을 어떻게 둘 것인가. <span style="font-size:12px;opacity:.6">(한 대에 한 번 — 이 대 동안 못 바꾼다)</span>'
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
