'use strict';
// ───────── 설정 ─────────
// 시험용: 구간으로 바로 가기(이름·가훈·설정은 그대로)
const JUMPS = [
  ['1. 처음 — 족보부터', null],
  ['2. 덮인 첫 책 앞', { opened:false }],
  ['3. 등잔을 들일 즈음', { opened:true, pages:20, earned:20, D:20 }],
  ['4. 장부 반쯤 해독 (등잔·붓걸이)', { opened:true, pages:60, earned:220, D:330, owned:{ lamp:true, brush:true } }],
  ['5. 장부 다 풀림 · 도서관 문', { opened:true, pages:140, earned:420, D:680, owned:{ lamp:true, brush:true } }],
  ['6. 공포 문장 · 손이 떨리기 직전', { opened:true, pages:160, earned:560, D:1035, fear:0.3, owned:{ lamp:true, brush:true } }],
  ['7. 서안·수정 문진까지 들인 뒤', { opened:true, pages:40, earned:800, D:1100, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true }],
  ['8. 편지가 오기 직전', { opened:true, pages:60, earned:900, D:1290, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true }],
  ['9. 편지를 읽은 뒤 (답장 전)', { opened:true, pages:60, earned:950, D:1320, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, revealed:['letter'] }],
  ['10. 연구원이 온 뒤 (일지 1편)', { opened:true, pages:60, earned:980, D:1330, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, replied:true, chair:true, rArrived:-1, rWork:70, rPages:8 }],
  ['11. 족보 장을 펼친 무렵 (연구원과 함께)', { opened:true, pages:60, earned:1100, D:1420, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, replied:true, chair:true, rArrived:-1, rWork:300, rPages:40 }],
  ['12. 족보를 다 푼 뒤 (궤짝 바닥에 지도)', { opened:true, pages:60, earned:1500, D:2770, jokboDone:true, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, replied:true, chair:true, rArrived:-1, rWork:300, rPages:90 }],
  ['13. 지도 바다가 다 찬 뒤 (쪽지)', { opened:true, pages:60, earned:1600, D:2770, jokboDone:true, mapFound:true, mapViews:7, mapStudy:999, caveAt:-2, caveWork:0, helpNote:true, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, replied:true, chair:true, rArrived:-1, rWork:400, rPages:120 }],
];
JUMPS.push(['14. 방을 붙인 뒤 (서명우 편지가 오기 직전)', Object.assign(JSON.parse(JSON.stringify(JUMPS[12][1])), { helpNote:true, helpRead:true, bangAt:-1, pages:700, earned:2400 })]);
JUMPS.push(['15. 별채에 다 모인 뒤 (마지막 쪽지)', Object.assign(JSON.parse(JSON.stringify(JUMPS[12][1])), { helpNote:true, helpRead:true, bangAt:-1, labSeen:true, pages:300, earned:2800, genN:3, genNext:-1,
  owned:{ lamp:true, brush:true, desk:true, glass:true, ld1:true, ld2:true, ld3:true, ld4:true },
  st:{ g1:{ at:-1, read:true, replied:true, arr:-1, desk:'ld1', item:'first' }, g2:{ at:-1, read:true, replied:true, arr:-1, desk:'ld2', item:'first' }, g3:{ at:-1, read:true, replied:true, arr:-1, desk:'ld3', item:'dongui' },
       smw:{ at:-1, read:true }, ojr:{ at:-1, read:true, replied:true, arr:-2, desk:'ld4', item:'dongui', work:100 } } })]);
JUMPS.push(['16. 일반 연구원 둘이 자리 잡은 뒤 (서명우의 편지 직전, 한 명은 겁에 질림)', Object.assign(JSON.parse(JSON.stringify(JUMPS[12][1])), { helpNote:true, helpRead:true, bangAt:-1, labSeen:true, pages:500, earned:2600, genN:2, genNext:-1,
  owned:{ lamp:true, brush:true, desk:true, glass:true, ld1:true, ld2:true }, teaArrived:true,
  st:{ g1:{ at:-1, read:true, replied:true, arr:-2, desk:'ld1', item:'first', fear:0.8, pages:120 }, g2:{ at:-1, read:true, replied:true, arr:-2, desk:'ld2', item:'first', fear:0.45, pages:100 } } })]);
function jumpTo(i){
  const keep = { sur:S.sur || '윤', bon:S.bon, name:S.name || '서하', gahun:S.gahun >= 0 ? S.gahun : 0, opt:S.opt };
  resetting = true;
  if (!JUMPS[i][1]) { localStorage.setItem(SAVE, JSON.stringify({ stage:'start', opt:S.opt })); location.reload(); return; }   // 처음부터: 설정만 남김
  const fresh = Object.assign({ stage:'room', pages:0, earned:0, D:0, owned:{}, fear:0, opened:false, letterRead:false, chair:false, glitchDone:false, sideRead:{}, ack:[], teaArrived:false, letterShadow:false }, keep, JSON.parse(JSON.stringify(JUMPS[i][1])));
  if (fresh.rArrived === -1) fresh.rArrived = Date.now() - WALK_MS - 1000;
  if (fresh.caveAt === -2) fresh.caveAt = Date.now() - 600000;
  if (!fresh.loc) fresh.loc = { first:'desk', dongui: fresh.rArrived ? 'rdesk' : 'shelf', map: fresh.mapFound ? (fresh.rArrived ? 'shelf' : 'shelf') : null };
  if (fresh.mapFound && fresh.rArrived) fresh.loc = { first:'desk', dongui:'shelf', map:'rdesk' };
  fresh.revealed = (fresh.revealed || []).concat(['letter']);
  fresh.revealed = ['door', 'teapot', 'sj'].concat(fresh.revealed || []);
  if (fresh.replied && !fresh.rArrived) fresh.rDue = Date.now() + 6000;
  if (fresh.bangAt === -1) fresh.bangAt = Date.now() - 40000;
  if (fresh.genNext === -1) fresh.genNext = Date.now() + 600000;
  for (const s of Object.values(fresh.st || {})){ if (s.at === -1) s.at = Date.now() - 100000; if (s.arr === -1) s.arr = Date.now() - T_PUSH - 1000; if (s.arr === -2) s.arr = Date.now() - 181000; }
  fresh.lastSeen = Date.now();
  localStorage.setItem(SAVE, JSON.stringify(fresh)); location.reload();
}
function showJumps(){
  openOv('<h3>시험용: 구간으로 바로 가기</h3>' + JUMPS.map((j,i) => `<div class="rec jmp" data-i="${i}">${j[0]}</div>`).join(''));
  ovBody.querySelectorAll('.jmp').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); jumpTo(+el.dataset.i); }));
}
function showSettings(){
  const o = S.opt;
  openOv(`<h3>설정</h3>
    <div class="opt rec"><span>글 방향</span><span class="ch"><span data-k="horiz" data-v="0" class="${!o.horiz?'on':''}">세로</span><span data-k="horiz" data-v="1" class="${o.horiz?'on':''}">가로</span></span></div>
    <div class="opt rec"><span>밤낮</span><span class="ch"><span data-k="gameTime" data-v="0" class="${!o.gameTime?'on':''}">실제 시각</span><span data-k="gameTime" data-v="1" class="${o.gameTime?'on':''}">게임 시간</span></span></div>
    <div style="font-size:12px;opacity:.6;margin:-4px 0 6px">게임 시간: 실제 5분이 게임 속 1시간. 두 시간에 하루가 지난다.</div>
    <div class="opt rec"><span>소리</span><span class="ch"><span data-k="mute" data-v="0" class="${!o.mute?'on':''}">켬</span><span data-k="mute" data-v="1" class="${o.mute?'on':''}">끔</span></span></div>
    <div class="opt rec"><span>시험용: 누르고 있으면 빨리 넘기기</span><span class="ch"><span data-k="fast" data-v="0" class="${!o.fast?'on':''}">끔</span><span data-k="fast" data-v="1" class="${o.fast?'on':''}">켬</span></span></div>
    <div class="opt rec"><span>시험용: 낮밤 고정</span><span class="ch">${[['', '끔'], ['13', '낮'], ['19.5', '해 질 녘'], ['23', '밤'], ['5.5', '새벽']].map(([v, l]) => `<span data-fh="${v}" class="${(o.forceHour == null ? '' : String(o.forceHour)) === v ? 'on' : ''}">${l}</span>`).join('')}</span></div>
    <div class="opt rec"><span>시험 기록 (해 본 사람이 보내 주는 용)</span><span class="ch"><span id="bLog">보기</span></span></div>
    <div class="opt rec"><span>시험용: 구간으로 바로 가기</span><span class="ch"><span id="bJump">고르기</span></span></div>
    <div class="opt rec"><span>처음부터</span><span class="ch"><span id="bReset">기록을 지운다</span></span></div>`);
  ovBody.querySelectorAll('.ch span[data-k]').forEach(el => el.addEventListener('click', ev => {
    ev.stopPropagation(); S.opt[el.dataset.k] = el.dataset.v === '1'; save();
    if (!bookView.classList.contains('hidden')) layoutBook(); showSettings();
  }));
  document.getElementById('bJump').addEventListener('click', ev => { ev.stopPropagation(); showJumps(); });
  ovBody.querySelectorAll('[data-fh]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); S.opt.forceHour = el.dataset.fh === '' ? null : +el.dataset.fh; save(); showSettings(); }));
  document.getElementById('bLog').addEventListener('click', ev => { ev.stopPropagation(); showTlog(); });
  document.getElementById('bReset').addEventListener('click', ev => {
    ev.stopPropagation();
    openOv('<h3>처음부터</h3>지금까지의 기록이 모두 지워집니다.<div style="text-align:center;margin-top:18px"><button class="btn rec" id="bReset2" style="color:var(--ink);border-color:#00000066">지우고 처음부터</button></div>');
    document.getElementById('bReset2').addEventListener('click', e2 => { e2.stopPropagation(); resetting = true; localStorage.removeItem(SAVE); location.reload(); });
  });
}
document.getElementById('setBtn').addEventListener('click', showSettings);

// ───────── 서고 입력 ─────────
let down = null;
cv.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY, a:drag, moved:false, th: e.pointerType === 'mouse' ? 6 : 16 }; try { cv.setPointerCapture(e.pointerId); } catch(_){} });
cv.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > down.th) down.moved = true; if (down.moved) drag = down.a + dx*0.008; });
cv.addEventListener('pointercancel', () => { down = null; });
cv.addEventListener('pointerup', e => {
  const d = down; down = null; if (!d || d.moved || S.stage !== 'room') return;
  const r = cv.getBoundingClientRect(), px = (e.clientX - r.left)*DPR, py = (e.clientY - r.top)*DPR;
  let best = null, bd = 1e9;
  for (const o of [...curObjs(), ...curDolls()]){ if (!o.hit) continue; const h = o.hit, cy = Math.max(h.y1, Math.min(h.y0, py)), dd = Math.hypot(px-h.x, py-cy); if (dd < h.r && dd < bd){ bd = dd; best = o; } }
  if (!best) return;
  if (best.hit.ghost) buy(best); else if (best.click) best.click(); else if (ITEM[best.id]) showItem(best.id);
});

// ───────── 화면 전환 ─────────
const scr = id => ['sStart','sJokbo','sGahun'].forEach(k => document.getElementById(k).classList.toggle('hidden', k !== id));
function enterRoom(){ S.stage = 'room'; tlog('서고에 들어옴'); save(); scr(null); LINES = buildLines(); resize(); if (!S.opened) openBook(); }
document.getElementById('bOpen').onclick = () => { ac(); sFlip(); S.stage = 'jokbo'; scr('sJokbo'); };
// 비워 두고 '적는다'를 누르면 흐리게 적힌 예시(또는 지난번에 쓴 이름) 그대로 시작
const LAST = 'yeobaek_last_name';
(() => { try { const l = JSON.parse(localStorage.getItem(LAST) || 'null'); if (l) { iSur.placeholder = l.sur; iBon.placeholder = l.bon || iBon.placeholder; iName.placeholder = l.name; } } catch(_){} })();
document.getElementById('bWrite').onclick = () => {
  const val = el => el.value.trim() || el.placeholder;
  const sur = val(iSur), nm = val(iName);
  try { localStorage.setItem(LAST, JSON.stringify({ sur, bon: val(iBon), name: nm })); } catch(_){}
  if (!/^[가-힣]{1,2}$/.test(sur) || !/^[가-힣]{1,3}$/.test(nm)) { document.getElementById(!/^[가-힣]{1,2}$/.test(sur)?'iSur':'iName').focus(); return; }
  S.sur = sur; S.name = nm; S.bon = val(iBon); sFlip(); S.stage = 'gahun'; save(); scr('sGahun');
};
document.querySelectorAll('.scroll').forEach(el => el.onclick = () => { S.gahun = +el.dataset.g; sPlace(); enterRoom(); });

window.__yb = { openBook, closeBook, toggleLoupe, setMapMark: () => { S.mapLastMark = 0; }, hits: () => [...curObjs(), ...curDolls()].filter(o => o.hit).map(o => ({ id:o.id, x:o.hit.x/DPR, y:(o.hit.y0*0.4 + o.hit.y1*0.6)/DPR })) };
resize();
ensureLoc();
const away = S.stage === 'room' ? offlineWork() : { r:0, night:0 };
const labAway = S.stage === 'room' ? labOffline() : [];
if (labAway.length){ S.pendingNotes = (S.pendingNotes || []).concat(labAway); save(); }
if (away.r || away.night) setTimeout(() => {
  if (S.rArrived) { S.pendingNote = `<h3>쪽지</h3><div class="vletter rec" style="height:min(50vh,360px)">가주께.<br>${away.r ? `안 계신 동안 ${fmtP(away.r)}을 넘겼습니다.<br>` : ''}밤에는 일하지 않았습니다.${away.night ? `<br><br>아침에 와 보니 서안의 책이<br>${fmtP(away.night)} 넘어가 있었습니다.<br>저는 밤에 오지 않았습니다.` : ''}<div class="sign">한서진 올림.</div></div>`; save(); }
  else openOv(`<h3>서안</h3>자리를 비운 사이, 서안에 펼쳐 둔 책이 ${fmtP(away.night)} 넘어가 있다.<br>아무도 손대지 않았다.<br><br>창은 닫혀 있었다.`);
}, 900);
S.lastSeen = Date.now();
if (S.stage === 'room') enterRoom(); else if (S.stage === 'gahun') scr('sGahun'); else if (S.stage === 'jokbo') scr('sJokbo'); else scr('sStart');
setInterval(() => { if (S.stage === 'room') { S.lastSeen = Date.now(); save(); } }, 2000);
requestAnimationFrame(frame);
