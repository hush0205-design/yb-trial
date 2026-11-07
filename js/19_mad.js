'use strict';
// ───────── 광기 얇은 첫 판 (광기 설계 · 1대 일정표 '만들 순서' B) ─────────
// 가주 S.mad: 공포 문장이 열린 뒤부터. 가주가 손으로 넘길 때 쌓이고, 겁이 적을수록 더(공포는 광기의 브레이크).
//   시조의 흔적(젖은 장·일지)은 세 배, 접힌 귀의 여백 글씨 한 번에 한 움큼. 찻주전자(바다가 채운 차)를 마시면 쌓임. 바다 궤 곁에 있으면 조금씩.
//   시조 묶음을 펴 읽으면 한동안 더디 쌓임(단계는 내려가지 않음). 숫자는 없음 — 화면 오염으로만(1 글자 번짐 · 2 획 어긋남 · 3 낱말 풀이가 바뀜, 시조 가사가 바뀜).
//   동경(구리 거울): 2단계에 닿은 다음 문갑 위에 놓여 있음 — 비친 얼굴이 번진 정도, 첫 책을 다 풀면 뒷면 눈금이 읽혀 숫자가 됨.
// 연구원 s.mad / 한서진 S.rMad: 읽는 동안 쌓임(겁이 적을수록, 바다 글일수록, 간을 두고 온 사람 곁일수록, 오정림이 나르는 찻주전자 차를 마시면).
//   1 일지 글씨가 번짐 · 2 일지에 같은 문장이 두 번 · 3 가끔 일을 멈춤 · 4 눈이 붉음. 단계마다 조금씩 빨리 읽음(madBoost).
//   의원: 누군가 3단계에 닿은 다음 날 낮에 대문 앞에 옴 → 맥을 짚게 하면(5전) 그 뒤로 상태 창에 '넋이 몇 푼 흩어졌다'.
const madStage = (v, at) => { let i = 0; while (i < at.length && v >= at[i]) i++; return i; };
const myMad = () => madStage(S.mad || 0, K.madAt);
const oweMad = k => oweDays(k) >= 2 ? K.oweMad : 1;   // 녹봉이 밀린 메인은 떠나는 대신 책에 더 기댐(기획서 14-4): 한서진은 제 광기, 오정림이 내는 차는 짜짐(마신 사람 광기)
const rMadOf = k => k === 'sj' ? S.rMad || 0 : (S.st[k] && S.st[k].mad) || 0;
const rMadSt = k => madStage(rMadOf(k), K.madRAt);
const brakeK = f => Math.max(0.3, Math.min(1.5, 1.5 - 2 * (f || 0)));                // 겁이 없을수록 1.5배, 떨수록 0.3배
const madOn = () => S.D >= T.fearOn;
const eyesOf = k => { const v = k === 'sj' ? S.rEyes : (S.st[k] || {}).eyes; return v == null ? 2 : v; };
function madBoost(k){                                                                     // 08·12가 읽는 빠르기에 곱함
  const st = rMadSt(k), eye = K.eyeSlow[2 - eyesOf(k)];                                  // 눈을 덜어 낸 만큼 느려짐
  if (st >= 3 && Math.floor(Date.now() / 1000) % 180 < 20) return 0;                       // 얼이 빠짐: 세 분에 스무 초쯤 손을 놓음
  return (1 + 0.08 * st) * eye;
}
function madAdd(n){
  if (!madOn()) return;
  const was = myMad();
  S.mad = (S.mad || 0) + n * (Date.now() < (S.sijoUntil || 0) ? 0.5 : 1);
  if (myMad() !== was && typeof tlog === 'function') tlog('가주 광기 단계 ' + myMad());
  if (was < 13 && myMad() >= 13 && (S.fear || 0) <= K.madLockFear) S.madBroke = true;   // 13단계에 닿는 그 순간에 간(겁)이 없으면 붕괴 — 남아 있으면 그 대는 머묾
  if (myMad() >= 2 && !S.mirrorDay) S.mirrorDay = dayKey() + 1;
}

// ── 쌓임: 손 넘김·차·바다 궤·여백 (tick에서 지켜봄 — 06의 lastFlip, 08의 calmUntil이 바뀌면) ──
let madFlipSeen = lastFlip, madCalmSeen = calmUntil, madMarg = (S.margins || []).length;
function madTick(dt){
  if (lastFlip !== madFlipSeen){ madFlipSeen = lastFlip;
    const b = S.curBook || 'first', trace = b === 'wet' || b === 'jour' ? 3 : 1;          // 시조의 흔적은 가주만, 세 배
    if (!(S.owned.lamp && S.lampOut)) madAdd(K.madFlip * trace * brakeK(S.fear) * (typeof marginSeen === 'function' && marginSeen() ? K.techMarginMad : 1) * (typeof techOn === 'function' && techOn('cheop') ? K.techCheopMad : 1)); }   // 겹쳐 읽기: 빠른 대신 손 넘김마다 광기가 더
  if (calmUntil !== madCalmSeen){ if (calmUntil > madCalmSeen){ if (S.tea > 0) S.tea = Math.max(0, S.tea - K.teaCup); else { S.seaTea = (S.seaTea || 0) + 1; if (!hasRelic('pot_dry')) madAdd(K.madTea); } } madCalmSeen = calmUntil; }   // 정직한 차(19_house)가 있으면 그것으로 — 광기 없음
  const mg = (S.margins || []).length; if (mg > madMarg){ madAdd(K.madMargin * (mg - madMarg)); madMarg = mg; }
  if (S.relicBox && S.scene === 'seogo' && typeof seaCount === 'function') madAdd(dt * K.madSea * seaCount());
  if (!madOn()) return;
  // 연구원
  const near = d => allKeys().some(j => S.st[j] && (S.st[j].changed || rMadSt(j) >= 5) && !S.st[j].gone && LAB_DESKS[S.st[j].desk] && Math.abs(LAB_DESKS[S.st[j].desk][0] - LAB_DESKS[d][0]) === 15);   // 간을 두고 온 사람·넋이 나간 사람(5단계) 곁
  const gain = (item, f, k) => dt * K.madR * brakeK(f) * (item === 'map' || item === 'wet' || item === 'jour' ? 1.5 : 1) * (eyesOf(k) ? 1 : 0.3);   // 두 눈을 잃으면 보이는 것에서 오는 광기는 안 받음
  if (S.rArrived && !isNight() && !S.errs.sj && itemAt('rdesk')){ S.rMad = (S.rMad || 0) + gain(itemAt('rdesk'), S.jin ? 0 : S.rFear, 'sj') * oweMad('sj'); }
  const potDry = hasRelic('pot_dry');   // 유품 마른 찻주전자: 이것으로 끓인 차는 연구원이 마셔도 광기가 안 쌓임(11/5 ✳)
  if ((S.rSteam || 0) > (S.rMadTea || 0)){ S.rMadTea = S.rSteam; if (!potDry) S.rMad = (S.rMad || 0) + K.madTeaR * oweMad('ojr'); }
  for (const k of allKeys()){
    const s = S.st[k]; if (!s || !s.arr || s.gone) continue;
    if ((s.steam || 0) > (s.madTea || 0)){ s.madTea = s.steam; if (!potDry) s.mad = (s.mad || 0) + K.madTeaR * oweMad('ojr'); }
    if (!working(k) || S.errs[k] || isCopy(s.item) || !s.item) continue;
    s.mad = (s.mad || 0) + gain(s.item, s.changed ? 0 : s.fear, k) * (LAB_DESKS[s.desk] && near(s.desk) ? 1.5 : 1);
  }
  if (S.docFrom == null && (rMadSt('sj') >= 3 || allKeys().some(k => S.st[k] && rMadSt(k) >= 3))){ S.docFrom = dayKey() + 1; save(); }
  if ((S.rMad || 0) >= K.madRAt[6]) S.rMad = K.madRAt[6] - 1;                             // 한서진은 6단계에서 멈춤(변형은 굴 이야기 — 韓瑞津, 19_deep)
  for (const k of allKeys()){ const s = S.st[k]; if (!s || s.gone || s.changed || s.mad7 || rMadSt(k) < 7 || S.errs[k] || !working(k)) continue;
    s.mad7 = true; madLimit(k, !!STAFF[k] || Math.random() < 2/3); }   // 7단계 한계: 변형 2 : 소실 1(발굴 설계와 같은 규칙) — 메인(서명우·오정림)은 책이 놓아주지 않아 늘 변형(11/5 ✳)
  // 가주 4~5단계: 숫자가 흐려짐(윗줄 쪽 수) · 없는 소리
  const ctr = document.getElementById('counter'); if (ctr) ctr.classList.toggle('madblur', myMad() >= 4);
  if (myMad() >= 5){ const now = Date.now(); if (!madSndAt) madSndAt = now + 120e3 + Math.random() * 240e3;
    else if (now >= madSndAt){ madSndAt = 0; if (Math.random() < 0.5) knock(0.18); else noise(0.6, 300, 0.05, 'bandpass'); } }
}
let madSndAt = 0;
// 가주 광기가 오를 때마다 사람들이 알아챔(11/7 선생님 "명시적으로 알려 줘야 — 한서진 쪽지, 오정림이 차를 가져다주며 찻잔 밑 쪽지로 진정하라고")
const MAD_NOTES = {
  2:  ['sj',  ['가주께.', '요즘 글을 오래 들여다보십니다.', '눈을 좀 쉬게 하십시오.', '차를 한 잔 드시지요.']],
  3:  ['ojr', ['가주께.', '차를 진하게 우렸습니다.', '천천히 드십시오.']],
  4:  ['sj',  ['가주께.', '어젯밤 서고에서 혼잣말을 하셨습니다.', '무엇을 읽으셨는지 묻지 않겠습니다.', '다만 오늘은 덮으시지요.']],
  6:  ['ojr', ['가주께.', '한 주전자 더 올려 두었습니다.', '식기 전에 드십시오.', '손이 떨리시면 저를 부르십시오.']],
  8:  ['sj',  ['가주께.', '일지의 글씨가 가주의 글씨와 닮아 갑니다.', '같은 손이 쓴 것처럼.', '의원을 부르는 것이 좋겠습니다.']],
  10: ['ojr', ['가주께.', '찻잔에 손을 대지 않으셨습니다.', '사흘째입니다.', '진정하십시오. 제발.']],
  12: ['sj',  ['가주께.', '서고 문을 잠그지 마십시오.', '안에서 들리는 소리는', '가주의 목소리가 아닙니다.']],
};
function madNoteTick(){   // 여러 단계를 한꺼번에 넘으면 지금 단계에 맞는 쪽지 하나만
  const st = myMad(); S.madNoted = S.madNoted || [];
  const due = Object.keys(MAD_NOTES).map(Number).filter(k => k <= st && !S.madNoted.includes(k)); if (!due.length) return;
  const k = Math.max(...due), [who, lines] = MAD_NOTES[k], ojr = who === 'ojr' && working('ojr'), by = who === 'ojr' ? (ojr ? '오정림 올림.' : null) : (S.rArrived ? '한서진 올림.' : null);
  S.madNoted.push(...due); save(); if (!by) return;   // 쓸 사람이 아직 없으면 그 쪽지는 건너뜀
  pushNote((ojr ? '<h3>찻잔 밑에 접힌 쪽지</h3>' : '<h3>쪽지</h3>') + vlet(lines, by, 'min(40vh,280px)'));
  if (ojr) S.myCup = true;
  if (typeof tlog === 'function') tlog('광기 쪽지: ' + k + '단계');
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended || window.BOOTING) return; madNoteTick(); });
function madLimit(k, change){
  const nm = DEF(k).name, by = S.rArrived ? '한서진 올림.' : '오정림 올림.';
  if (change){ const s = S.st[k]; s.changed = true; s.fear = 0;
    pushNote('<h3>쪽지</h3>' + vlet(['가주께.', `오늘 ${josa(nm, '이', '가')} 떨지 않습니다.`, '눈이 젖어 있습니다.', '무엇을 읽었느냐 물으니 웃기만 합니다.'], by, 'min(40vh,280px)')); }
  else { const s = S.st[k]; s.gone = true; s.quit = Date.now();
    pushNote('<h3>쪽지</h3>' + vlet(['가주께.', `${nm}의 자리에`, '짚신 한 켤레와 붓 한 자루만 남아 있었습니다.', '쓰던 종이는 다 젖어 있었습니다.'], by, 'min(40vh,280px)')); }
  if (typeof tlog === 'function') tlog('연구원 광기 한계: ' + k + (change ? ' 변형' : ' 소실')); save();
}
// 눈을 덜어 낸 사람의 종이 인형: 한쪽 눈을 흰 천으로 가림 → 두 눈을 다 잃으면 흰 천으로 두 눈을 감음(광기 설계 '되돌리기 = 눈 적출')
function blindCv(c, n, back){
  const d = document.createElement('canvas'); d.width = c.width; d.height = c.height; const g = d.getContext('2d'); g.drawImage(c, 0, 0);
  g.fillStyle = '#efe9da'; g.strokeStyle = '#c9c0ab'; g.lineWidth = 0.5;
  if (back || n === 0){ g.fillRect(16.5, 26, 15, 2.8); g.strokeRect(16.5, 26, 15, 2.8); }                 // 머리를 둘러 감은 띠
  else { g.fillRect(18.6, 26.1, 4.6, 2.7); g.strokeRect(18.6, 26.1, 4.6, 2.7); g.fillRect(16.5, 26.9, 15, 0.8); }   // 한쪽 눈 + 머리를 두른 끈
  return d;
}
function blindDolls(){
  const one = (D, eyes) => { if (!D || D._blind === eyes) return; D._orig = D._orig || D.imgL; D._blind = eyes;
    D.imgL = eyes === 2 ? D._orig : D._orig.map(set => Object.fromEntries(Object.entries(set).map(([k2, c]) => [k2, blindCv(c, eyes, k2.endsWith('_BK'))])));
    if (D.img && D.img.A) D.img = D.imgL[0]; };
  if (S.rArrived) one(SJ, eyesOf('sj'));
  for (const k of allKeys()) if (S.st[k] && S.st[k].arr && DOLLS[k]) one(DOLLS[k], eyesOf(k));
}
// 6 쓰는 자: 밤이면 그 사람 책상의 빈 종이에 저절로 글씨가 참
M.nightPaper = model(6, 8, 1, (x, y) => (y % 2 && x > 0 && x < 5) ? '#3a2a20' : '#e4dbc0');
for (const d of Object.keys(LAB_DESKS)) LAB_OBJ.push({ id:'nw_' + d, x: LAB_DESKS[d][0] + 2, y: LAB_DESKS[d][1], z:11, rot:0.1, on:()=>d, onOrder:0.025, m:()=>'nightPaper',
  show:()=> { const k = isNight() && deskOwner(d); return !!k && !S.st[k].gone && rMadSt(k) >= 6; },
  click:()=> openOv(`<h3>빈 종이</h3>저녁에 비워 두고 간 종이에 글씨가 빼곡하다. ${DEF(deskOwner(d)).name}의 손이다.<br><br><span style="color:#3a2a20">${alienHtml(glyphs('읽은 이는 쓴다 쓴 이는 읽힌다', 1600))}</span>`) });

// ── 화면 오염: 기록 창이 열릴 때(04 openOv → HOOK.ov) ──
const madTexts = () => { const w = document.createTreeWalker(ovBody, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('.close,.mch') || !/[가-힣]/.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT }); const a = []; while (w.nextNode()) a.push(w.currentNode); return a; };
function madSmear(nodes, n){                                                              // 글자 몇 개가 먹처럼 옆으로 끌려 번짐 — 깊을수록 길고 짙게
  const st = myMad(), L = 3 + Math.floor(st / 3), k = (0.7 + st * 0.12).toFixed(2);
  for (let t = 0; t < n && nodes.length; t++){
    const nd = nodes[Math.floor(Math.random() * nodes.length)], s = nd.nodeValue, i = Math.floor(Math.random() * Math.max(1, s.length - L));
    const sp = document.createElement('span'); sp.className = 'smear'; sp.style.setProperty('--k', k); sp.textContent = s.slice(i, i + L);
    const rest = nd.splitText(i); rest.nodeValue = rest.nodeValue.slice(L); nd.parentNode.insertBefore(sp, rest);
  }
}
function madShake(n, mirror){
  for (let t = 0; t < n; t++){
    const nodes = madTexts(); if (!nodes.length) return;
    const nd = nodes[Math.floor(Math.random() * nodes.length)], a = Array.from(nd.nodeValue), idx = a.map((c, i) => /[가-힣]/.test(c) ? i : -1).filter(i => i >= 0);
    if (!idx.length) continue;
    const ci = idx[Math.floor(Math.random() * idx.length)], off = a.slice(0, ci).join('').length;
    const mid = nd.splitText(off); mid.splitText(a[ci].length);
    const sp = document.createElement('span'); sp.className = 'mch tremble' + (mirror && Math.random() < Math.min(0.75, 0.2 + myMad() * 0.05) ? ' mirror' : ''); sp.style.animationDelay = (-Math.random()).toFixed(2) + 's'; sp.style.animationDuration = (0.12 + Math.random() * 0.14).toFixed(2) + 's';
    mid.parentNode.insertBefore(sp, mid); sp.appendChild(mid);
  }
}
function madStroke(nodes, n){                                                             // 받침이 한 획 어긋남(겁 → 겂, 서고 → 서곡)
  for (let t = 0; t < n && nodes.length; t++){
    const nd = nodes[Math.floor(Math.random() * nodes.length)], a = Array.from(nd.nodeValue), idx = a.map((c, i) => /[가-힣]/.test(c) ? i : -1).filter(i => i >= 0);
    if (!idx.length) continue;
    const i = idx[Math.floor(Math.random() * idx.length)], c = a[i].charCodeAt(0) - 0xAC00, j = c % 28;
    a[i] = String.fromCharCode(0xAC00 + c - j + (j ? (j % 27) + 1 : 1)); nd.nodeValue = a.join('');
  }
}
const GLOSS_ODD = ['물이 차오르는 곳. 읽는 이가 서는 자리.', '눈. 간이 열어 두는 구멍.', '넋. 간이 놓으면 흩어지는 것.', '바다. 서두르지 않는 것.'];
HOOK.ov.push(() => {
  const h3 = (ovBody.querySelector('h3') || {}).textContent || '';
  if (h3 === '시조 묶음'){
    S.sijoUntil = Date.now() + K.madSijoMs; save();
    if (myMad() >= 3) ovBody.innerHTML = ovBody.innerHTML.replace('쉬어 간들 어떠리', '始祖를 불러 본들 어떠리');   // 時調가 始祖를 부르는 노래가 됨
  }
  const st = myMad(), nodes = madTexts();
  if (st >= 3 && h3 === '낱말 장부'){ const e = ovBody.querySelectorAll('.glE'); if (e.length){ const el = e[Math.floor(Math.random() * e.length)], br = el.querySelector('br'); if (br && br.nextSibling) br.nextSibling.nodeValue = GLOSS_ODD[Math.floor(Math.random() * GLOSS_ODD.length)]; } }
  if (st >= 2 && Math.random() < 0.6) madStroke(nodes, st >= 3 ? 2 : 1);
  if (st >= 1 && Math.random() < 0.6 + st * 0.04) madSmear(madTexts(), Math.ceil(st / 2));   // 단계마다 번지는 곳이 늘고 길어짐
  if (st >= 2) madShake(Math.min(26, st * 2), st >= 3);   // 떨림 — 3단계부터 몇 자는 좌우로 뒤집힘(뒤집히는 몫도 단계마다 늚)
  if (st >= 4) madTexts().forEach(nd => { if (!/\d/.test(nd.nodeValue)) return; const sp = document.createElement('span'); sp.className = 'smear'; sp.textContent = nd.nodeValue; nd.replaceWith(sp); });   // 얼이 빠짐: 숫자가 든 글이 흐려짐
  if (st >= 6 && Math.random() < 0.4) ovBody.querySelectorAll('.vletter').forEach(e => { e.style.writingMode = 'horizontal-tb'; e.style.height = 'auto'; });   // 넋이 나감: 세로쓰기가 가로로
  // 연구원의 창·일지: 그 사람의 광기
  const m = h3.match(/^(?:연구원|반장) — (\S+)\(|^(\S+)의 일지 \d/), nm = m && (m[1] || m[2]);
  const k = nm === '한서진' ? 'sj' : nm && allKeys().find(j => S.st[j] && DEF(j).name === nm);
  if (!k) return;
  const rs = rMadSt(k);
  if (m[2] && rs >= 2){ const txt = madTexts().pop(); if (txt){ const sent = (txt.nodeValue.match(/[^.]+\.\s*$/) || [''])[0]; if (sent) txt.nodeValue += ' ' + sent.trim(); } }
  if (m[2] && rs >= 1) madSmear(madTexts(), 2);
  if (m[1]){
    let add = '';
    const ey = eyesOf(k);
    if (ey === 1) add += '<div style="font-size:12px;opacity:.7">한쪽 눈을 흰 천으로 가렸다.</div>';
    if (ey === 0) add += '<div style="font-size:12px;opacity:.7">두 눈을 흰 천으로 감았다. 그래도 책장을 넘긴다.</div>';
    else if (rs >= 4) add += '<div style="font-size:12px;opacity:.7">눈이 붉게 충혈되어 있다.</div>';
    if (rs >= 5) add += '<div style="font-size:12px;opacity:.7">옆에서 보면 그림자가 하나 더 있는 것 같다.</div>';
    if (rs >= 6) add += '<div style="font-size:12px;opacity:.7">밤이면 빈 종이에 저절로 쓴다고 한다. 필경사(筆耕士)의 손이다.</div>';
    if (S.docSeen) add += `<div style="font-size:12px;opacity:.7">의원이 짚어 보니 넋이 ${Math.min(100, Math.round(rMadOf(k) / K.madRAt[6] * 100))}푼 흩어졌다고 한다.</div>`;
    if (add){ const d = document.createElement('div'); d.innerHTML = add; const h = ovBody.querySelector('h3'); h.parentNode.insertBefore(d, h.nextSibling); }
  }
});

// ── 동경(구리 거울): 문갑 위 ──
M.mirror = model(5, 5, 1, (x, y) => { const d = (x - 2) ** 2 + (y - 2) ** 2; return d > 5 ? null : d > 2 ? '#7a5a2a' : (x + y) % 3 ? '#a88a52' : '#c4a870'; });
const MIRROR_FACE = ['얼굴이 또렷이 비친다.', '눈가가 조금 흐리게 비친다. 닦아도 그대로다.', '얼굴 가장자리가 번져 있다. 닦아도 그대로다.', '두 눈이 번져 보이지 않는다. 입은 또렷하다.'];
const mirrorShow = () => S.D >= T.door && (hasRelic('mirror') || (!!S.mirrorDay && dayKey() >= S.mirrorDay));
OBJ.push({ id:'mirror', x:19.5, y:-22, z:9, rot:0, on:()=>'mungap', onOrder:0.03, m:()=>'mirror', show:()=> mirrorShow() && !sarangOn(), glow:()=> !S.mirrorSeen,
  click:()=>{ S.mirrorSeen = true; save();
    const back = bookDone('first') || hasRelic('mirror') ? `뒷면 눈금이 읽힌다. 넋이 ${Math.min(100, Math.round((S.mad || 0) / K.madAt[12] * 100))}푼 흩어졌다.` : '뒷면에 눈금처럼 새긴 낯선 글자가 둘러 있다: ' + alienHtml(glyphs('넋이 몇 푼 흩어졌나', 131));
    openOv(`<h3>동경(銅鏡)</h3>구리 거울. 문갑 위에 엎어져 있었다. 누가 꺼내 두었는지 모른다.<br><br>${MIRROR_FACE[Math.min(3, myMad())]}<br><br><span style="font-size:13px">${back}</span>`); } });

// ── 의원: 누군가 넋이 크게 흔들린 다음 날 낮에 옴 ──
const DOC_O = { robe:['#d8d2c0', '#c8c0aa', '#a29a84'], belt:'#5a4a3a', belt2:'#3a2e22', hat:'gat' };
let DOCDOLL = null;
const docHere = () => S.docFrom != null && dayKey() >= S.docFrom && !isNight() && gameHour() >= 9;   // 처음 맥을 짚은 뒤로는 사흘마다 다시 옴
HOOK.dolls.gate.push(() => {
  if (!docHere()) return [];
  if (!DOCDOLL){ const sets = dollSet(drawSeonbi, DOC_O); DOCDOLL = { id:'doctor', doll:true, img: sets[0], imgL: sets, shadow:false, st:()=>({ x:10, y:-12, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0, steam:()=>0, arrT:()=>0, show:()=>true, click:()=>showDoctor() }; }
  if (!S.docKnock){ S.docKnock = true; save(); knock(S.scene === 'gate' ? 1 : 0.5); }
  return [DOCDOLL];
});
const docWho = () => [...(S.rArrived ? ['sj'] : []), ...allKeys().filter(k => S.st[k] && S.st[k].arr && !S.st[k].gone)];
const docNm = k => k === 'sj' ? '한서진' : DEF(k).name;
const soulPun = k => Math.min(100, Math.round(rMadOf(k) / K.madRAt[6] * 100));
function docLeave(){ S.docFrom = dayKey() + K.docEvery; S.docKnock = false; save(); }
function showDoctor(){
  if (!S.docSeen){
    openOv(`<h3>의원</h3>읍내에서 왔다는 의원. 별채에서 누가 헛것을 본다는 말을 들었다고 한다.<br>맥을 짚어 보겠다고 한다.<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bDoc" style="color:var(--ink);border-color:#00000066">맥을 짚게 한다 — ${fmtM(K.docFee)}</button></div>`);
    document.getElementById('bDoc').addEventListener('click', ev => { ev.stopPropagation();
      if ((S.money || 0) < K.docFee) return openOv('<h3>의원</h3>궤짝에 엽전이 모자란다. 의원은 다음에 오겠다며 돌아간다.', () => { S.docFrom = dayKey() + 1; S.docKnock = false; save(); });
      S.money -= K.docFee; ledger(`의원 맥값 - ${fmtM(K.docFee)}`); S.docSeen = true; docLeave(); sCoin();
      openOv('<h3>의원</h3>한 사람씩 맥을 짚고 눈꺼풀을 뒤집어 본다.<br><br>' + docWho().map(k => `${docNm(k)} — 넋이 ${soulPun(k)}푼 흩어졌다.`).join('<br>') + (S.trace === 'liver' ? '<br><br>가주의 맥도 짚더니, 한참 말이 없다가 간이 없다고 한다.' : '')
        + '<br><br><span style="font-size:13px;opacity:.75">눈을 오래 들여다보더니, 다시 오겠다고 한다.</span>');
      if (typeof tlog === 'function') tlog('의원이 맥을 짚음'); });
    return;
  }
  // 다시 온 의원: 맥은 그냥 짚어 주고, 눈이 뒤집힌 사람(4단계부터)은 눈 하나를 덜어 낼 수 있음(광기 설계 '되돌리기 = 눈 적출')
  const can = docWho().filter(k => rMadSt(k) >= 4 && eyesOf(k) > 0);
  openOv('<h3>의원</h3>다시 왔다. 맥을 짚고 눈꺼풀을 뒤집어 본다.<br><br>' + docWho().map(k => `${docNm(k)} — 넋이 ${soulPun(k)}푼 흩어졌다.`).join('<br>')
    + (can.length ? '<br><br>눈이 뒤집힌 사람이 있다. 눈 하나를 덜어 내면 넋이 덜 흔들린다고 한다. 잘 안 보이게 된다고도 한다.<div style="text-align:center;margin-top:10px">'
      + can.map(k => `<button class="btn rec" data-eye="${k}" style="color:var(--ink);border-color:#00000066;margin:4px">${docNm(k)}의 눈 하나 — ${fmtM(K.eyeFee)}</button>`).join('') + '</div>' : '')
    + '<div style="font-size:12px;opacity:.6;margin-top:8px">창을 닫으면 돌아간다.</div>', () => docLeave());
  ovBody.querySelectorAll('[data-eye]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); eyeTake(el.dataset.eye); }));
}
function eyeTake(k){
  if ((S.money || 0) < K.eyeFee) return openOv('<h3>의원</h3>궤짝에 엽전이 모자란다.', () => docLeave());
  S.money -= K.eyeFee; ledger(`의원 — ${docNm(k)}의 눈 - ${fmtM(K.eyeFee)}`); sCoin();
  const r = Math.random(), st = rMadSt(k), ok = r < K.eyeOk || r >= 1 - K.eyeGreat;
  if (k === 'sj') S.rEyes = eyesOf('sj') - 1; else S.st[k].eyes = eyesOf(k) - 1;
  if (ok){ const v = K.madRAt[st - 2]; if (k === 'sj') S.rMad = v; else S.st[k].mad = v; }   // 한 단계 내려감
  S.eyeJar = (S.eyeJar || 0) + 1; docLeave();
  if (typeof tlog === 'function') tlog('눈을 덜어 냄: ' + k + (ok ? '' : ' (그대로)'));
  openOv(`<h3>의원</h3>${docNm(k)}의 한쪽 눈을 덜어 내고 흰 천을 감아 준다.<br><br>`
    + (r >= 1 - K.eyeGreat ? '덜어 낸 눈이 감기지 않는다. 의원이 그 눈을 한참 들여다보더니, 무엇을 본 것 같다고 한다.' : ok ? '숨이 고르게 돌아온다. 넋이 조금 가라앉았다고 한다.' : '맥은 그대로다. 의원이 고개를 젓는다.')
    + '<br><br><span style="font-size:13px;opacity:.75">덜어 낸 눈은 의원이 싸 가지고 갔다.</span>');
}

// ── 가주 7~13단계 (광기 설계 표) ──
// 7 여백이 읽힘: 책 여백의 다른 손 글씨가 본문처럼 풀려 보임 · 10 손이 씀: 책을 펴 두면 가끔 여백에 가주 손으로 낯선 글자가 한 줄 써짐(넘기면 사라짐)
let madHandAt = 0;
function madBook(){
  const st = myMad(); if (st < 7 || !bookOpen) return;
  facesEl.querySelectorAll('.mg:not(.madRead)').forEach(el => { el.classList.add('madRead', 'seen'); el.innerHTML = '토끼 아래 두고 왔다' + `<span class="tiny">${esc((hanjaOf(S.sur || '') + '氏 ' + genHj(LINE.gen) + '世 ' + (S.name || '')))}</span>`; });
  if (st >= 10 && performance.now() > madHandAt){ madHandAt = performance.now() + 40e3 + Math.random() * 30e3;
    const tx = facesEl.querySelector('.txt'); if (tx){ const d = document.createElement('div'); d.className = 'ln madHand'; d.innerHTML = alienHtml(glyphs('읽은 이는 읽힌다', 1300 + Math.floor(Math.random() * 50))); tx.appendChild(d); } }
}
// 8 씌임: 기록 창의 연구원 이름이 한 글자씩 바뀌어 보임 · 11 이름이 흐려짐: 가주 이름이 낯선 글자로 — 번짐(위)이 이름을 쪼개기 전에 돌도록 맨 앞에
HOOK.ov.unshift(() => {
  const st = myMad(); if (st < 8) return;
  const names = [['한서진'], ...allKeys().filter(k => S.st[k] && S.st[k].arr).map(k => [DEF(k).name])].map(x => x[0]);
  const shift = nm => { const a = Array.from(nm), i = a.length - 1, c = a[i].charCodeAt(0) - 0xAC00, j = c % 28; a[i] = String.fromCharCode(0xAC00 + c - j + (j ? 0 : 4)); return a.join(''); };
  const me = (S.sur || '') + (S.name || ''), meG = glyphs(me || '가주', 1717);
  madTexts().forEach(nd => { let v = nd.nodeValue;
    for (const nm of names) if (v.includes(nm) && Math.random() < 0.5) v = v.split(nm).join(shift(nm));
    if (st >= 11 && me && v.includes(me)) v = v.split(me).join(meG);
    if (v !== nd.nodeValue) nd.nodeValue = v; });
});
// 13 마지막 장: 닿는 순간 간이 남아 있으면(겁이 조금이라도 있으면) 13단계에 머묾, 겁이 다 빠진 채 닿으면 붕괴 = 문을 잠그고 나오지 않다(기획서 9-1, madAdd)
END.shut = { name:'문을 잠그고 나오지 않다', kind:'이야기',
  n: () => S.madBroke ? 13 : Math.min(12, myMad()), lim: () => 13,
  omen(){ pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '간밤에 서고 문을 안에서 잠그시는 소리를 들었습니다.', '두드려도 대답이 없으셨습니다.', '붓 소리만 났습니다.'], '한서진 올림.', 'min(44vh,320px)')); },
  scene: () => ['가주는 서고 문을 안에서 잠갔다. 빗장 소리가 한 번 났다.',
    '밥상은 문 앞에 놓였다가 식은 채 물려졌다.',
    '문틈으로 붓 소리가 밤낮없이 났다. 한서진은 그것이 읽는 소리가 아니라 쓰는 소리라고 했다.',
    '이레째 되던 날, 소리가 그쳤다.',
    '문을 열었을 때, 서안 위 책에는 가주의 이름이 낯선 글자로 적혀 있었다.'],
  codex: '문을 안에서 잠그고, 다시 나오지 않았다.',
  only: () => '<b>안에서 잠긴 빗장</b> — 문 안쪽 빗장에 손톱자국이 나 있다. 바깥쪽이 아니라 안쪽에.',
  relics: ['mirror'], gahun: null };
RELIC.mirror = { name:'동경', desc:'앞 대가 문을 안에서 잠그기 전까지 들여다보던 구리 거울. 뒷면 눈금이 처음부터 읽힌다.' };   // 환생 명세 4절: 광기를 처음부터 숫자로 봄

HOOK.tick.push(dt => { if (S.stage !== 'room' || S.ended) return; madTick(dt); madBook(); blindDolls(); });
