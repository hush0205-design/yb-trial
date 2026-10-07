'use strict';
// ───────── 바다 궤(海櫃)·젖은 책 조각 읽기·물가의 사람들 (발굴 설계 '만들 순서' ①, 인수인계 9절 묶음 ①) ─────────
// 바다 궤: 첫 발굴에서 돌아온 다음 날, 한서진이 뒷문으로 나가 작은 궤를 들고 들어와 궤짝 곁(젖은 보퉁이 자리)에 놓음 + 쪽지. 젖은 보퉁이는 사라짐.
//   누르면 유물 목록. 글이 있는 것(젖은 조각)은 '서안에 올린다', 물가의 사람들이 대문 앞에 와 있으면 '판다'(13세 물건은 안 삼).
//   궤에 든 것이 많을수록 밤에 낱파도가 조금 커짐(15_small waveOne 음량 — 광기 묶음 '두면 광기' 자리).
// 젖은 책 조각: 서안에 올리면 한 장짜리 책(WLINES, S.wD)으로 펼쳐짐 = 13세의 반쯤 쓴 일지 첫 장. 돌아온 뒤 2시간은 마르지 않아 못 올림.
//   다 풀면 해독도(S.D) + T.jEnd의 1/10, 낱말 장부에 새 한자(11_gloss), 문갑 첫째 서랍에 기록. 읽는 동안 한서진 겁이 조금씩. 한서진이 반장이었으면 반쯤 풀려 있음(19_gather).
// 물가의 사람들: 바다 궤가 놓인 다음 날부터, 팔 것이 있으면 하루 한 번 낮에 대문 앞에 옴(두 번 두드림). 창을 닫으면 돌아감.
const WET_DRY = () => S.opt.gameTime ? 10*60e3 : 2*3600e3;        // 마르는 데 두 시간(시험용 빠른 시간이면 10분)
const SEA_PRICE = { kelp:50, shell:10 };                           // 해초 책갈피 5전 · 조개껍질 1전(발굴 설계 ④)
const SEA_STAY = 30*60e3;                                          // 물가의 사람들이 대문 앞에 머무는 시간
const BOX_AWAY_MS = 40e3;                                          // 한서진이 궤를 가지러 나가 있는 시간
const BOX_POS = () => S.owned.desk ? [-18, 22] : [8, 10], BOX_STAND = [-18, 14];
const dayKeyAt = t => S.opt.gameTime ? Math.floor(t/1000/300/24) : Math.floor((t + 9*3600e3) / 86400e3);

// ── 젖은 장의 글: 13세의 반쯤 쓴 일지 첫 장 (낯선 글자 → 국한문 → 지금 말). 끝 줄은 물에 번져 끝내 안 읽힘 ──
const WET_SRC = [
  { o:'丙申 八月 晦日. 潮水 크게 빠지다.',          m:'병신년 팔월 그믐. 물이 크게 빠졌다.' },
  { o:'葛頭浦 앏 여헤 다시 나가다.',                m:'갈두포 앞 여에 다시 나갔다.' },
  { o:'믈 밋헤셔 누가 글을 讀ᄒᆞ더라.',             m:'물 밑에서 누가 글을 읽고 있었다.' },
  { o:'海女들은 그 여흘 피ᄒᆞᄂᆞ니라.',             m:'해녀들은 그 여를 피한다.' },
  { o:'그 소ᄅᆡ 우리 書庫 冊과 ᄒᆞᆫ 곳에셔 그치더라.', m:'그 소리는 우리 서고의 책과 같은 곳에서 그쳤다.' },
  { o:'나도 그 곳ᄭᆞ지 닑엇노라.',                  m:'나도 거기까지 읽었다.' },
  { o:'도라오ᄂᆞᆫ 길헤 손이 ᄯᅥᆯ리디 아니ᄒᆞ더라.',   m:'돌아오는 길에 손이 떨리지 않았다.' },
  { o:'다ᄋᆞᆷ 潮水에 窟ᄭᆞ지 가 보리라.',            m:'다음 물때에 굴까지 가 보겠다.' },
  { o:'兎ᄂᆞᆫ 肝을 바회 아래 두고 왓노라 ᄒᆞ엿다.',   m:'토끼는 간을 바위 아래 두고 왔다고 했다.' },
  { o:'나ᄂᆞᆫ ▒▒▒ ▒▒',                              m:'나는 ▒▒▒ ▒▒' },
];
const WLINES = WET_SRC.map((l, i) => [glyphs(l.m, 500 + i), l.o, l.m]);
const BW = { id:'wet', L:()=>WLINES, start:i => i*20, per:30, D:()=>S.wD||0 };
const wetEnd = () => bDone(BW, WLINES.length - 1);
BOOKCOL.wet = ['#55625a', '#3f4a43'];                              // 젖은 장을 싼 종이(싸개)
M.wetLeaf = model(7, 9, 1, (x, y) => (x + y*3) % 7 === 0 ? '#a9b0a0' : (x === 0 || y === 8) ? '#b8baa8' : '#cfd0bf');   // 서안 위 젖은 종이 한 장(물 얼룩)
M.seaBox = model(9, 7, 6, (x, y, z) => {                           // 바다 궤: 거친 나무, 소금기 밴 쇠 장식
  if (z === 5) return (x === 0 || x === 8 || y === 0 || y === 6) ? '#3a3a30' : (x === 4 && y === 3 ? '#8a9a8a' : '#5a5040');
  if ((x === 0 || x === 8) && (y === 0 || y === 6)) return '#7a8a80';
  return (x === 0 || x === 8 || y === 0 || y === 6) ? ((z + x + y) % 3 ? '#5e5442' : '#4e4636') : null;
});

// ── 저장: 팔 것(S.sea)과 젖은 장의 자리(S.loc.wet = 'box' 궤/보퉁이 · 'desk' 서안) ──
function seaGot(finds){
  S.sea = S.sea || { kelp:0, shell:0 };
  if (finds.includes('kelp')) S.sea.kelp = 1;
  if (finds.includes('wetleaf')){ ensureLoc(); if (!S.loc.wet) S.loc.wet = 'box'; }
  if (S.dig.foundDay == null) S.dig.foundDay = dayKeyAt(S.dig.foundAt || Date.now());
}
if (S.dig && S.dig.found && !S.sea) seaGot(S.dig.found);           // 예전 판(이 묶음 전에 돌아온 판)
const wetAt = () => S.dig.wetAt || S.dig.foundAt || 0;
const wetDry = () => Date.now() - wetAt() >= WET_DRY();
const seaCount = () => (S.sea ? (S.sea.kelp||0) + (S.sea.shell||0) : 0) + (S.loc && S.loc.wet === 'box' ? 1 : 0);
const seaSellable = () => S.sea ? (S.sea.kelp||0) + (S.sea.shell||0) : 0;
// 궤에 든 것이 많을수록 밤에 낱파도가 커짐(15_small이 부름)
const seaBoxK = () => S.relicBox && isNight() ? 1 + 0.12 * Math.min(6, seaCount()) : 1;

// ── 바다 궤를 들여옴: 다음 날, 한서진이 뒷문으로 나가 들고 들어와 놓음 ──
OBJ.push({ id:'seaBox', get x(){ return BOX_POS()[0]; }, get y(){ return BOX_POS()[1]; }, rot:-0.3, m:()=>'seaBox', show:()=> !!S.relicBox && reveal('seaBox', true), click:()=>showRelics(), glow:()=> !S.relicBox.seen });
{ const sp = OBJ.find(o => o.id === 'seaPack'); const s0 = sp.show; sp.show = () => !S.relicBox && s0(); sp.click = () => showRelics(); }
function boxTick(){
  if (S.relicBox || !S.dig.found || !S.owned.desk) return;
  if (S.dig.foundDay == null) seaGot(S.dig.found);
  const today = dayKey(); if (today <= S.dig.foundDay) return;
  if (S.errs.sj && S.errs.sj.box) return;
  if (window.BOOTING || today > S.dig.foundDay + 1 || !S.rArrived){ boxPlace(); return; }   // 비운 동안 지나간 날이면 이미 놓여 있음
  if (!sjFree() || digOn()) return;
  const side = homeSide('sj');
  S.errs.sj = { t0: Date.now(), box: true, steps: [ { k:'up', sc:'seogo' },
    ...walkPts('seogo', [side, [side[0], SGC], [DOOR_POS[0], SGC], DOOR_POS]),
    waitAt('seogo', DOOR_POS, [0, -1], 400),
    waitAt('away', DOOR_POS, [0, 1], BOX_AWAY_MS),
    ...walkPts('seogo', [DOOR_POS, [DOOR_POS[0], SGC], [BOX_STAND[0], SGC], BOX_STAND], 'seaBox'),
    waitAt('seogo', BOX_STAND, [0, 1], 1400, 'boxPut', null, 'seaBox'),
    ...walkPts('seogo', [BOX_STAND, [BOX_STAND[0], SGC], [side[0], SGC], side]),
    { k:'down', sc:'seogo' } ] };
  if (typeof tlog === 'function') tlog('한서진이 바다 궤를 가지러 나감'); save();
}
function boxPlace(){
  if (S.relicBox) return;
  S.relicBox = { at: Date.now(), day: dayKey() }; save();
  if (S.scene === 'seogo') sPlace();
  pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '바다에서 온 것들을', '젖은 보퉁이에 둘 수 없어', '궤를 하나 짰습니다.', '궤짝 곁에 두었습니다.', '', wetDry() ? '젖은 장은 다 말랐습니다.' : '젖은 장은 아직 덜 말랐습니다.', '서안에 올려 보십시오.'], '한서진 올림.', 'min(44vh,320px)'));
  if (typeof tlog === 'function') tlog('바다 궤 놓임');
}
ERR_ACT.boxPut = () => boxPlace();
{ const sr = showResearcher; showResearcher = function(){ const er = S.errs.sj; if (er && er.box && errScene('sj') === 'away') return openOv('<h3>연구원의 자리</h3>비어 있다. 한서진은 뒷문으로 나갔다. 무엇을 가지러 간 것 같다.'); return sr(); }; }

// ── 궤(또는 젖은 보퉁이)를 누르면: 유물 목록 ──
const rbtn = (k, label) => `<button class="btn rec" data-rl="${k}" style="color:var(--ink);border-color:#00000066;margin:4px 0 0;font-size:13px;padding:4px 10px">${label}</button>`;
function relicRows(sell){
  const R = [], found = S.dig.found || [], f = id => DIG_FINDS.find(x => x[0] === id) || [id, id, ''];
  if (found.includes('wetleaf')){
    const w = S.loc && S.loc.wet, [, nm, ds] = f('wetleaf');
    let tail = '';
    if (S.sideRead && S.sideRead.wet) tail = '<br><span style="font-size:12px;opacity:.6">다 풀었다. 끝 줄은 물에 번져 읽을 수 없다.</span>';
    if (w === 'desk') tail += '<br><span style="font-size:12px;opacity:.6">지금 서안 위에 있다.</span><br>' + rbtn('wetBack', '궤에 도로 넣는다');
    else if (sell) tail += '<br>' + rbtn('sell:wet', '판다');
    else if (!wetDry()) tail += '<br><span style="font-size:12px;opacity:.6">아직 마르지 않았다. 펴면 찢어질 것 같다.</span>';
    else tail += '<br>' + rbtn('wetUp', '서안에 올린다');
    R.push(`<div style="margin:10px 0" data-row="wet"><b>${nm}</b><br><span style="font-size:13px">${ds}</span>${tail}</div>`);
  }
  if (S.sea && S.sea.kelp){ const [, nm, ds] = f('kelp'); R.push(`<div style="margin:10px 0"><b>${nm}</b><br><span style="font-size:13px">${ds}</span>${sell ? '<br>' + rbtn('sell:kelp', '판다 — ' + fmtM(SEA_PRICE.kelp)) : ''}</div>`); }
  if (S.sea && S.sea.shell) R.push(`<div style="margin:10px 0"><b>조개껍질 ${S.sea.shell}</b><br><span style="font-size:13px">여울에서 주워 온 것. 안쪽이 먹물처럼 검다.</span>${sell ? '<br>' + rbtn('sell:shell', '판다 — 하나에 ' + fmtM(SEA_PRICE.shell)) : ''}</div>`);
  return R;
}
function showRelics(){
  const box = !!S.relicBox, sell = seaFolkHere();
  if (box) S.relicBox.seen = true; else S.dig.seen = true; save();
  const rows = relicRows(sell);
  const head = box ? '<h3>바다 궤(海櫃)</h3>한서진이 짠 작은 궤. 뚜껑 틈으로 소금 냄새가 난다.' + (isNight() && seaCount() >= 2 ? '<br>귀를 대면 안에서 물소리가 나는 것도 같다.' : '')
                   : '<h3>바다에서 온 것들</h3>젖은 보퉁이. 소금 냄새가 난다.';
  openOv(head + '<br>' + (rows.length ? rows.join('') : '<br>비어 있다.')
    + ((S.dig.found || []).includes('brush13') ? '<div style="font-size:12px;opacity:.6;margin-top:8px">바다에서 나온 붓은 붓걸이에 걸었다.</div>' : '')
    + (sell ? '<div style="font-size:12px;opacity:.6;margin-top:8px">물가의 사람들이 대문 앞에 와 있다.</div>' : ''));
  relicBind(showRelics);
}
function relicBind(again){
  ovBody.querySelectorAll('[data-rl]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation();
    const k = el.dataset.rl;
    if (k === 'wetUp'){ sPlace(); placeItem('wet', 'desk'); ov.classList.add('hidden'); if (typeof tlog === 'function') tlog('젖은 장을 서안에 올림'); return; }
    if (k === 'wetBack'){ sPlace(); S.loc.wet = 'box'; save(); again(); return; }
    if (k === 'sell:wet'){ el.outerHTML = '<div style="font-size:13px;margin-top:4px">젖은 장을 들여다보더니 손을 거둔다. 그건 그 댁 것입니다, 하고 물러선다.</div>'; return; }
    if (k.startsWith('sell:')) seaSell(k.slice(5), again);
  }));
}

// ── 물가의 사람들: 팔 것이 있으면 하루 한 번 낮에 대문 앞에 옴 ──
const seaFolkHere = () => !!S.seaFolkAt && Date.now() >= S.seaFolkAt && Date.now() < S.seaFolkAt + SEA_STAY;
function seaFolkTick(){
  if (S.seaFolkAt && Date.now() >= S.seaFolkAt + SEA_STAY){ S.seaFolkAt = 0; S.seaFolkKnock = false; save(); return; }   // 오래 기다리다 돌아감
  if (S.seaFolkAt){ if (Date.now() >= S.seaFolkAt && !S.seaFolkKnock){ S.seaFolkKnock = true; save(); knock(S.scene === 'gate' ? 1 : 0.5); if (typeof tlog === 'function') tlog('물가의 사람들이 대문 앞에'); } return; }
  if (!S.relicBox || !seaSellable() || window.BOOTING || isNight()) return;
  const h = gameHour(); if (h < 9 || h >= 18) return;
  const today = dayKey(); if (today <= S.relicBox.day || S.seaFolkDay === today) return;
  S.seaFolkDay = today; S.seaFolkAt = Date.now() + 90e3 + Math.random() * 120e3; save();   // 들어와 있는 동안, 몇 분 뒤에
}
const SEAFOLK_O = [{ robe:['#5a6466', '#4a5456', '#363e40'], belt:'#2a3a3a', belt2:'#1a2626', hat:'sangtu' }, { robe:['#6a6a5e', '#5a5a4e', '#40403a'], belt:'#3a3a2a', belt2:'#26261a', hat:'tang' }];
let SEAFOLK = null;
HOOK.dolls.gate.push(() => {
  if (!seaFolkHere()) return [];
  if (!SEAFOLK) SEAFOLK = SEAFOLK_O.map((o, i) => { const sets = dollSet(drawSeonbi, o);
    return { id:'seafolk' + i, doll:true, img: sets[0], imgL: sets, shadow:false, st:()=>({ x: 6 + i*9, y:-12 + i*1.5, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0, steam:()=>0, arrT:()=>0, show:()=>true, click:()=>showSeaFolk() }; });
  return SEAFOLK;
});
function showSeaFolk(){
  const rows = relicRows(true);
  openOv('<h3>물가의 사람들</h3>갈두포에서 왔다고 한다. 옷자락이 젖어 있고, 짚신에 마른 모래가 묻어 있다.<br>바다에서 건진 것이 있으면 값을 쳐 주겠다고 한다. 궤 쪽을 자꾸 본다.<br>'
    + (rows.length ? rows.join('') : '<br>더 살 것이 없다고 한다.'),
    () => { if (!seaSellable()){ S.seaFolkAt = 0; S.seaFolkKnock = false; save(); } });   // 팔 것이 없으면 돌아감
  relicBind(showSeaFolk);
}
function seaSell(id, again){
  if (!S.sea || !S.sea[id]) return;
  const n = id === 'shell' ? S.sea.shell : 1, sum = SEA_PRICE[id] * n, nm = id === 'kelp' ? '해초 책갈피' : `조개껍질 ${n}개`;
  S.sea[id] = 0; S.money = (S.money || 0) + sum; ledger(`물가의 사람들에게 ${josa(nm, '을', '를')} 넘김 + ${fmtM(sum)}`); sCoin(); save();
  if (typeof tlog === 'function') tlog('유물 팜: ' + nm + ' ' + fmtM(sum));
  again();
}

// ── 젖은 장 읽기: 다 풀면 ──
function wetRead(v){
  if (S.sideRead.wet) return;
  S.wD = Math.min(wetEnd(), (S.wD || 0) + v);
  if (S.rArrived && !isNight() && !S.errs.sj) S.rFear = Math.min(1, (S.rFear || 0) + 0.004);   // 바다 글: 곁의 한서진이 조금씩 떪
  if (S.wD < wetEnd()) return;
  S.sideRead.wet = true; S.D += Math.round(T.jEnd / 10); save();
  if (typeof tlog === 'function') tlog('젖은 장을 다 풂');
  setTimeout(() => queueOv('<h3>젖은 책 조각</h3>다 풀었다.<br>끝 줄은 물에 번져 읽을 수 없다. 번지기 전에 붓이 한 번 멈췄다가 다시 내려간 자국이 있다.'), 1100);
}
const recWet = () => '<h3>젖은 장 — 받아 적은 것</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">여울에서 나온 젖은 책 조각. 우리 책과 같은 종이다. 누군가의 일지 첫 장인 듯하다.</div>'
  + WET_SRC.map(l => `<div style="margin:6px 0">${esc(l.o)}<br><span style="font-size:13px;opacity:.75">${esc(l.m)}</span></div>`).join('');
{ const lr = labRecs; labRecs = function(recs){ lr(recs); if (S.sideRead && S.sideRead.wet) recs.push(['젖은 장 — 받아 적은 것', recWet]); }; }
DRAWERS[0][1] = /장부|족보|노트|동의보감|젖은 장/;

HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; boxTick(); seaFolkTick(); });
