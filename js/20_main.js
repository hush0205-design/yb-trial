'use strict';
// ───────── 설정 ─────────
// 시험용: 구간으로 바로 가기(이름·가훈·설정은 그대로)
const JUMPS = [
  ['1. 처음 — 족보부터', null],
  ['2. 덮인 첫 책 앞', { opened:false }],
  ['3. 등잔을 들일 즈음', { opened:true, pages:20, earned:20, D:20 }],
  ['4. 장부 반쯤 해독 (등잔·붓걸이)', { opened:true, pages:60, earned:220, D:330, owned:{ lamp:true, brush:true } }],
  ['5. 장부 다 풀림 · 문갑과 문', { opened:true, pages:140, earned:420, D:680, owned:{ lamp:true, brush:true } }],
  ['6. 공포 문장 · 손이 떨리기 직전', { opened:true, pages:160, earned:560, D:1035, fear:0.3, owned:{ lamp:true, brush:true } }],
  ['7. 서안·수정 문진까지 들인 뒤', { opened:true, pages:40, earned:800, D:1100, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true }],
  ['8. 편지가 오기 직전', { opened:true, pages:60, earned:900, D:1290, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true }],
  ['9. 편지를 읽은 뒤 (답장 전)', { opened:true, pages:60, earned:950, D:1320, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, revealed:['letter'] }],
  ['10. 연구원이 온 뒤 (일지 1편)', { opened:true, pages:60, earned:980, D:1330, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, replied:true, chair:true, rArrived:-1, rWork:70, rPages:8 }],
  ['11. 족보 장을 펼친 무렵 (연구원과 함께)', { opened:true, pages:60, earned:1100, D:1420, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, replied:true, chair:true, rArrived:-1, rWork:300, rPages:40 }],
  ['12. 족보를 다 푼 뒤 (궤짝 바닥에 지도)', { opened:true, pages:60, earned:1500, D:3100, jokboDone:true, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, replied:true, chair:true, rArrived:-1, rWork:300, rPages:90 }],
  ['13. 지도 바다가 다 찬 뒤 (쪽지)', { opened:true, pages:60, earned:1600, D:3100, jokboDone:true, mapFound:true, mapViews:7, mapStudy:999, caveAt:-2, caveWork:0, helpNote:true, owned:{ lamp:true, brush:true, desk:true, glass:true }, teaArrived:true, glitchDone:true, letterShadow:true, letterRead:true, replied:true, chair:true, rArrived:-1, rWork:400, rPages:120 }],
];
JUMPS.push(['14. 방을 붙인 뒤 (서명우 편지가 오기 직전)', Object.assign(JSON.parse(JSON.stringify(JUMPS[12][1])), { helpNote:true, helpRead:true, bangAt:-1, pages:700, earned:2400 })]);
JUMPS.push(['15. 별채에 다 모인 뒤 (마지막 쪽지)', Object.assign(JSON.parse(JSON.stringify(JUMPS[12][1])), { helpNote:true, helpRead:true, bangAt:-1, labSeen:true, pages:300, earned:2800, genN:3, genNext:-1,
  owned:{ lamp:true, brush:true, desk:true, glass:true, ld1:true, ld2:true, ld3:true, ld4:true },
  st:{ g1:{ at:-1, read:true, replied:true, arr:-1, desk:'ld1', item:'first' }, g2:{ at:-1, read:true, replied:true, arr:-1, desk:'ld2', item:'first' }, g3:{ at:-1, read:true, replied:true, arr:-1, desk:'ld3', item:'dongui' },
       smw:{ at:-1, read:true }, ojr:{ at:-1, read:true, replied:true, arr:-2, desk:'ld4', item:'dongui', work:100 } } })]);
JUMPS.push(['16. 일반 연구원 둘이 자리 잡은 뒤 (서명우의 편지 직전, 한 명은 겁에 질림)', Object.assign(JSON.parse(JSON.stringify(JUMPS[12][1])), { helpNote:true, helpRead:true, bangAt:-1, labSeen:true, pages:500, earned:2600, genN:2, genNext:-1,
  owned:{ lamp:true, brush:true, desk:true, glass:true, ld1:true, ld2:true }, teaArrived:true,
  st:{ g1:{ at:-1, read:true, replied:true, arr:-2, desk:'ld1', item:'first', fear:0.8, pages:120 }, g2:{ at:-1, read:true, replied:true, arr:-2, desk:'ld2', item:'first', fear:0.45, pages:100 } } })]);
JUMPS.push(['17. 바닷가 쪽지를 읽은 뒤 (문 곁에 보퉁이)', Object.assign(JSON.parse(JSON.stringify(JUMPS[14][1])), { goNote:true, goRead:true })]);
JUMPS.push(['18. 조사단이 돌아오기 20초 전 (대문 앞으로)', Object.assign(JSON.parse(JSON.stringify(JUMPS[14][1])), { goNote:true, goRead:true, digJump:true })]);
// 환생 시험용(10/7): 19 둘째 대 이름 짓기부터 / 20 떠난 사람 셋(한 명 더 내보내면 끝) / 21 쌀독 나흘째(들어가면 곧 끝)
JUMPS.push(['19. 둘째 대 — 이름 짓기부터 (앞 대: 아무도 오지 않다)', { gen2:true }]);
JUMPS.push(['20. 일반 연구원 셋이 떠난 뒤 (한 명 더 내보내면 끝남)', Object.assign(JSON.parse(JSON.stringify(JUMPS[14][1])), { genN:6, genNext:-1,
  st: Object.assign(JSON.parse(JSON.stringify(JUMPS[14][1].st)), { g4:{ at:-1, read:true, replied:true, arr:-2, gone:true, quit:-1, fired:true }, g5:{ at:-1, read:true, replied:true, arr:-2, gone:true, quit:-1 }, g6:{ at:-1, read:true, replied:true, arr:-2, gone:true, quit:-1, fired:true } }), omen:{ nobody:true } })]);
JUMPS.push(['21. 쌀독이 비기 직전 (들어가면 서안에 빈 편지지 — 돈을 꾸는 편지, 하드면 곧 끝남)', Object.assign(JSON.parse(JSON.stringify(JUMPS[14][1])), { genN:3, money:0, riceN:4, riceDay:-1, omen:{ rice:true },
  st: { g1:{ at:-1, read:true, replied:true, arr:-2, gone:true, quit:-1 }, g2:{ at:-1, read:true, replied:true, arr:-2, gone:true, quit:-1 }, g3:{ at:-1, read:true, replied:true, arr:-2, gone:true, quit:-1 } } })]);
function jumpGen2(){
  const nm = S.name || '서하';
  Object.assign(LINE, { sur: S.sur || LINE.sur || '윤', bon: S.bon || LINE.bon || '파평', gen:18, jokbo:[{ gen:17, name:nm, end:'아무도 오지 않다', endId:'nobody', days:4, gahun:0 }],
    codex:{ nobody:{ n:1, first:Date.now(), line:END.nobody.codex } }, relics:['key', 'ledger'], trace:{ from:'nobody' }, gahun:{ used:{ 0: 1 }, unlocked:[0, 2] },
    reached:{ lamp:1, brush:1, desk:1, glass:1, letter:1, lab:1, ld1:1, ld2:1 } });
  saveLine(); resetting = true; localStorage.setItem(SAVE, JSON.stringify({ stage:'jokbo', opt:S.opt })); location.reload();
}
function jumpTo(i){
  if (JUMPS[i][1] && JUMPS[i][1].gen2) return jumpGen2();
  const keep = { sur:S.sur || '윤', bon:S.bon, name:S.name || '서하', gahun:S.gahun >= 0 ? S.gahun : 0, opt:S.opt, mode:S.mode };   // 빗장(모드)도 그대로 — 둘째 대에서 구간을 옮길 때 다시 묻지 않게
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
  if (fresh.riceDay === -1) fresh.riceDay = dayKey() - 1;
  for (const s of Object.values(fresh.st || {})){ if (s.quit === -1) s.quit = Date.now() - 200000; if (s.at === -1) s.at = Date.now() - 100000; if (s.arr === -1) s.arr = Date.now() - T_PUSH - 1000; if (s.arr === -2) s.arr = Date.now() - 181000; }
  fresh.lastSeen = Date.now();
  localStorage.setItem(SAVE, JSON.stringify(fresh)); location.reload();
}
function showJumps(){
  openOv('<h3>시험용: 구간으로 바로 가기</h3>' + JUMPS.map((j,i) => `<div class="rec jmp" data-i="${i}">${j[0]}</div>`).join(''));
  ovBody.querySelectorAll('.jmp').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); jumpTo(+el.dataset.i); }));
}
// 개발자 메뉴: 시험해 줄 사람에게는 감추고, 비밀번호를 넣어야 열림(이 기기에서 한 번 열면 계속 열림)
const DEV_KEY = 'yb_dev', DEV_H = 7974987;                        // 비밀번호는 그대로 적지 않고 셈한 값만 둠
const devHash = t => Array.from(t).reduce((h, c) => (h*31 + c.charCodeAt(0)) % 9999991, 7);
const devOn = () => localStorage.getItem(DEV_KEY) === '1';
function askDev(){
  openOv('<h3>개발자 메뉴</h3>비밀번호를 넣어 주세요.<div style="text-align:center;margin-top:12px"><input id="devPw" type="password" inputmode="numeric" autocomplete="off" style="font-size:18px;padding:6px 10px;width:10em;text-align:center"></div>'
    + '<div id="devMsg" style="text-align:center;font-size:13px;opacity:.7;min-height:1.2em;margin-top:6px"></div><div style="text-align:center;margin-top:8px"><button class="btn rec" id="bDevOk" style="color:var(--ink);border-color:#00000066">연다</button></div>');
  const inp = document.getElementById('devPw'), go = ev => { if (ev) ev.stopPropagation();
    if (devHash(inp.value.trim()) === DEV_H){ localStorage.setItem(DEV_KEY, '1'); showSettings(); }
    else { document.getElementById('devMsg').textContent = '맞지 않습니다.'; inp.value = ''; } };
  inp.addEventListener('click', ev => ev.stopPropagation());
  inp.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter') go(ev); });
  document.getElementById('bDevOk').addEventListener('click', go);
  setTimeout(() => inp.focus(), 50);
}
function showSettings(){
  const o = S.opt, dev = devOn();
  openOv(`<h3>설정</h3>
    <div class="opt rec"><span>글 방향</span><span class="ch"><span data-k="horiz" data-v="0" class="${!o.horiz?'on':''}">세로</span><span data-k="horiz" data-v="1" class="${o.horiz?'on':''}">가로</span></span></div>
    <div class="opt rec"><span>밤낮</span><span class="ch"><span data-k="gameTime" data-v="0" class="${!o.gameTime?'on':''}">실제 시각</span><span data-k="gameTime" data-v="1" class="${o.gameTime?'on':''}">게임 시간</span></span></div>
    <div style="font-size:12px;opacity:.6;margin:-4px 0 6px">게임 시간: 실제 5분이 게임 속 1시간. 두 시간에 하루가 지난다.</div>
    <div class="opt rec"><span>소리</span><span class="ch"><span data-k="mute" data-v="0" class="${!o.mute?'on':''}">켬</span><span data-k="mute" data-v="1" class="${o.mute?'on':''}">끔</span></span></div>
    <div class="opt rec"><span>시험 기록 (보내 주시는 용)</span><span class="ch"><span id="bLog">보기</span></span></div>
    <div class="opt rec"><span>처음부터</span><span class="ch"><span id="bReset">기록을 지운다</span></span></div>`
    + (dev ? `<div style="font-size:12px;opacity:.55;margin-top:14px">개발자 메뉴</div>
    <div class="opt rec"><span>누르고 있으면 빨리 넘기기</span><span class="ch"><span data-k="fast" data-v="0" class="${!o.fast?'on':''}">끔</span><span data-k="fast" data-v="1" class="${o.fast?'on':''}">켬</span></span></div>
    <div class="opt rec"><span>낮밤 고정</span><span class="ch">${[['', '끔'], ['13', '낮'], ['19.5', '해 질 녘'], ['23', '밤'], ['5.5', '새벽']].map(([v, l]) => `<span data-fh="${v}" class="${(o.forceHour == null ? '' : String(o.forceHour)) === v ? 'on' : ''}">${l}</span>`).join('')}</span></div>
    <div class="opt rec"><span>구간으로 바로 가기</span><span class="ch"><span id="bJump">고르기</span></span></div>
    <div class="opt rec"><span>개발자 메뉴 잠그기</span><span class="ch"><span id="bDevLock">잠근다</span></span></div>`
          : `<div style="text-align:right;margin-top:14px"><span class="rec" id="bDev" style="font-size:12px;opacity:.45">개발자 메뉴</span></div>`));
  ovBody.querySelectorAll('.ch span[data-k]').forEach(el => el.addEventListener('click', ev => {
    ev.stopPropagation(); S.opt[el.dataset.k] = el.dataset.v === '1'; save();
    if (!bookView.classList.contains('hidden')) layoutBook(); showSettings();
  }));
  document.getElementById('bLog').addEventListener('click', ev => { ev.stopPropagation(); showTlog(); });
  document.getElementById('bReset').addEventListener('click', ev => {
    ev.stopPropagation();
    openOv('<h3>처음부터</h3>지금까지의 기록이 모두 지워집니다.<br><span style="font-size:13px;opacity:.7">앞 대들의 족보·가환록·유품도 함께 지워집니다.</span><div style="text-align:center;margin-top:18px"><button class="btn rec" id="bReset2" style="color:var(--ink);border-color:#00000066">지우고 처음부터</button></div>');
    document.getElementById('bReset2').addEventListener('click', e2 => { e2.stopPropagation(); resetting = true; localStorage.removeItem(SAVE); localStorage.removeItem(LINE_KEY); location.reload(); });
  });
  if (!dev){ document.getElementById('bDev').addEventListener('click', ev => { ev.stopPropagation(); askDev(); }); return; }
  document.getElementById('bJump').addEventListener('click', ev => { ev.stopPropagation(); showJumps(); });
  ovBody.querySelectorAll('[data-fh]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); S.opt.forceHour = el.dataset.fh === '' ? null : +el.dataset.fh; save(); showSettings(); }));
  document.getElementById('bDevLock').addEventListener('click', ev => { ev.stopPropagation(); localStorage.removeItem(DEV_KEY); S.opt.fast = false; S.opt.forceHour = null; save(); showSettings(); });
}
document.getElementById('setBtn').addEventListener('click', showSettings);
// 컴퓨터: Esc로 창 닫기 → 지도 접기 → 책 덮기
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!ov.classList.contains('hidden')) { closeOv(); return; }
  if (!mapView.classList.contains('hidden')) { closeMap(); return; }
  if (bookOpen) closeBook();
});
// 쪽·장·권 숫자를 누르면 셈 풀이
document.getElementById('counter').addEventListener('click', () => {
  if (S.stage !== 'room') return;
  openOv(`<h3>장부의 셈</h3>책장 두 쪽이 한 장, 쉰 장이 한 권이다.<br>지금 쓸 수 있는 것: ${fmtP(S.pages)}<br>지금까지 넘긴 것: ${fmtP(S.earned)}<br><br>서고에 물건을 들일 때 이 셈으로 값을 친다.`);
});
// 가훈: 족자 사이 빈틈을 눌러도 가까운 족자를 고름
document.getElementById('sGahun').addEventListener('click', e => {
  if (e.target.closest('.scroll')) return;
  const sc = [...document.querySelectorAll('.scroll')], cxp = el => { const r = el.getBoundingClientRect(); return r.left + r.width/2; };
  sc.reduce((a, b) => Math.abs(cxp(b) - e.clientX) < Math.abs(cxp(a) - e.clientX) ? b : a).click();
});

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
  if (best.hit.ghost) askBuy(best); else if (best.click) best.click(); else if (ITEM[best.id]) showItem(best.id);
});

// ───────── 화면 전환 ─────────
const scr = id => ['sStart','sJokbo','sGahun'].forEach(k => document.getElementById(k).classList.toggle('hidden', k !== id));
function enterRoom(){ S.stage = 'room'; tlog('서고에 들어옴'); save(); scr(null); LINES = buildLines(); resize(); if (!S.opened) openBook(); }
document.getElementById('bOpen').onclick = () => { ac(); sFlip(); S.stage = 'jokbo'; scr('sJokbo'); };
// 비워 두고 '적는다'를 누르면 흐리게 적힌 예시(또는 지난번에 쓴 이름) 그대로 시작
const LAST = 'yeobaek_last_name';   // 둘째 대부터는 지난 이름 대신 19_rebirth가 무작위 이름을 적어 둠
(() => { try { const l = JSON.parse(localStorage.getItem(LAST) || 'null'); if (l && LINE.gen <= 17) { iSur.placeholder = l.sur; iBon.placeholder = l.bon || iBon.placeholder; iName.placeholder = l.name; } } catch(_){} })();
document.getElementById('bWrite').onclick = () => {
  const val = el => el.value.trim() || el.placeholder;
  const sur = val(iSur), nm = val(iName);
  try { localStorage.setItem(LAST, JSON.stringify({ sur, bon: val(iBon), name: nm })); } catch(_){}
  if (!/^[가-힣]{1,2}$/.test(sur) || !/^[가-힣]{1,3}$/.test(nm)) { document.getElementById(!/^[가-힣]{1,2}$/.test(sur)?'iSur':'iName').focus(); return; }
  S.sur = sur; S.name = nm; S.bon = val(iBon); sFlip();
  if (LINE.gen <= 17){ S.gahun = 0; save(); enterRoom(); }          // 1대: 가훈을 고르지 않음 — 벽에 이미 걸려 있음(환생 명세 10-10)
  else { S.stage = 'gahun'; save(); scr('sGahun'); }
  if (LINE.gen <= 17 && !LINE.jokbo.length){ LINE.sur = S.sur; LINE.bon = S.bon; saveLine(); }
};
document.querySelectorAll('.scroll').forEach(el => el.onclick = () => { S.gahun = +el.dataset.g; sPlace();
  if (LINE.gen > 17 && !S.mode){ S.stage = 'room'; S.scene = 'gate'; save(); scr(null); LINES = buildLines(); resize(); return; }   // 빗장을 먼저 고르러 대문 앞으로(19_rebirth)
  enterRoom(); });

window.__yb = { openBook, closeBook, toggleLoupe, setMapMark: () => { S.mapLastMark = 0; }, hits: () => [...curObjs(), ...curDolls()].filter(o => o.hit).map(o => ({ id:o.id, x:o.hit.x/DPR, y:(o.hit.y0*0.4 + o.hit.y1*0.6)/DPR })) };
resize();
ensureLoc();
window.BOOTING = true;                                    // 비운 동안의 셈을 하는 중(이때 생기는 알림은 창을 띄우지 않고 쪽지로)
const away = S.stage === 'room' ? offlineWork() : { r:0, night:0 };
const labAway = S.stage === 'room' ? labOffline() : [];
window.BOOTING = false;
if (away.r || labAway.length){ S.awayNoted = dayKey(); save(); }      // 오늘 아침 비움 쪽지가 숫자를 말함 → 아침 보고는 총량을 되풀이하지 않음
if (labAway.length){ S.pendingNotes = (S.pendingNotes || []).concat(labAway); save(); }
if (away.r || away.night) setTimeout(() => {
  if (S.rArrived) { S.pendingNote = `<h3>쪽지</h3><div class="vletter rec" style="height:min(50vh,360px)">가주께.<br>${away.r ? `안 계신 동안 ${fmtP(away.r)}을 넘겼습니다.<br>` : ''}밤에는 일하지 않았습니다.${away.night ? `<br><br>아침에 와 보니 서안의 책이<br>${fmtP(away.night)} 넘어가 있었습니다.<br>저는 밤에 오지 않았습니다.` : ''}<div class="sign">한서진 올림.</div></div>`; save(); }
  else openOv(`<h3>서안</h3>자리를 비운 사이, 서안에 펼쳐 둔 책이 ${fmtP(away.night)} 넘어가 있다.<br>아무도 손대지 않았다.<br><br>창은 닫혀 있었다.`);
}, 900);
S.lastSeen = Date.now();
if (S.stage === 'room') enterRoom(); else if (S.stage === 'gahun') scr('sGahun'); else if (S.stage === 'jokbo') scr('sJokbo'); else scr('sStart');
setInterval(() => { if (S.stage === 'room') {
  S.lastSeen = Date.now();
  const dk = dayKey(); if (S.onDay !== dk){ S.onDay = dk; S.onSec = 0; }           // 오늘 서고에 있은 시간(초)
  S.onSec = (S.onSec||0) + 2;
  if (!(S.seenDays || []).includes(dk)) S.seenDays = ((S.seenDays || []).concat([dk])).slice(-10);   // 들어왔던 날들(지금은 기록만 — 녹봉 밀림은 달력 날짜로 셈, 10/6)
  save(); } }, 2000);
requestAnimationFrame(frame);
