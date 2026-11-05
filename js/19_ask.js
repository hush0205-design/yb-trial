'use strict';
// ───────── 해독 의뢰 (기획서 21절 '정한 것' 1·4·5, 자원과 돈 '버는 길' 2번, 인수인계 9절 묶음 ⑦) ─────────
// 첫 사본을 거간에게 판 다음 날 낮부터, 하루 한 번 마을 사람이 대문 앞에 옴 → '받는다' → 서안 곁에 접힌 종이(S.loc.ask = 'side').
//   종이를 누르면 '서안에 펼친다'(가주가 손으로 풂 — 덮으면 도로 접혀 곁에 놓이고 서안엔 먼저 있던 책) · '맡긴다'(한서진 또는 별채 사람).
//   맡긴 동안 그 사람은 제 읽기·필사를 멈춤(필사는 하던 데서 이어짐). 가주 손과 연구원 손은 빠르기·값이 같음(선생님 "방치형이니까").
// 다 풀면 다음 날 같은 사람이 다시 와 종이를 가져가고 엽전을 둠(치부책 한 줄). 안 받으면 해 지면 감.
// 공포(설명 없이): 셋째 의뢰부터 가끔 이 집에 온 통지와 같은 종이·같은 손글씨, 글 안에 바다 낱말 하나. 오는 사람 차림이 차츰 물가 사람을 닮음.

// ── 글감(초안 — 선생님 확인 대기): t 이름 · p 값(푼) · L [국한문, 지금 말] · sea 바다 낱말이 든 줄 [몇째 줄, 국한문, 지금 말] ──
const ASK_SRC = [
  { t:'편지', p:30, L:[
    ['母主前 上書', '어머님께 올립니다.'],
    ['이 곳은 無故ᄒᆞ오니 념녀 마ᄋᆞᆸ소셔.', '이곳은 별일 없으니 걱정 마십시오.'],
    ['보리 거두면 ᄒᆞᆫ 번 가 뵈오리이다.', '보리를 거두면 한 번 찾아뵙겠습니다.'],
    ['女息 上白.', '딸 올림.'] ],
    sea:[2, '潮水 ᄲᆞ지거든 ᄒᆞᆫ 번 가 뵈오리이다.', '물이 빠지거든 한 번 찾아뵙겠습니다.'] },
  { t:'비석 탁본', p:30, L:[
    ['孺人 晉州 姜氏之墓', '유인 진주 강씨의 무덤.'],
    ['夫 몬져 가고 홀로 三十年', '남편이 먼저 가고 홀로 삼십 년.'],
    ['子孫이 이 돌ᄒᆞᆯ 셰우다', '자손이 이 돌을 세운다.'] ],
    sea:[1, '夫 海에 가고 홀로 三十年', '남편이 바다로 가고 홀로 삼십 년.'] },
  { t:'땅문서', p:50, L:[
    ['某年 三月 日 明文', '아무 해 삼월 아무 날, 땅을 판 문서.'],
    ['右 明文事段 要用所致로', '이 문서를 쓰는 까닭은 쓸 데가 있어서다.'],
    ['東村 앏 논 다ᄉᆞᆺ 마지기ᄅᆞᆯ', '동쪽 마을 앞 논 다섯 마지기를'],
    ['錢 열 兩에 永永 放賣ᄒᆞᆷ', '돈 열 냥에 영영 판다.'],
    ['日後 다ᄅᆞᆫ 말 잇거든 이 글로 憑考ᄒᆞᆯ 것', '뒷날 딴말이 있거든 이 글로 따질 것.'],
    ['田主 金▒▒ 手決', '논 임자 김아무개, 수결.'] ],
    sea:[2, '津 건너 논 다ᄉᆞᆺ 마지기ᄅᆞᆯ', '나루 건너 논 다섯 마지기를'] },
  { t:'혼서', p:30, L:[
    ['謹拜 上狀', '삼가 절하고 글을 올립니다.'],
    ['令愛ᄅᆞᆯ 우리 집 며ᄂᆞ리로 마자', '따님을 우리 집 며느리로 맞아'],
    ['날을 ᄀᆞᆯᄒᆡ여 禮ᄅᆞᆯ 行ᄒᆞ고져 ᄒᆞᄂᆞ니', '날을 가려 예를 올리고자 하니'],
    ['허ᄒᆞ쇼셔.', '허락해 주십시오.'] ],
    sea:[2, '潮水 됴ᄒᆞᆫ 날을 ᄀᆞᆯᄒᆡ여 禮ᄅᆞᆯ 行ᄒᆞ고져 ᄒᆞᄂᆞ니', '물때 좋은 날을 가려 예를 올리고자 하니'] },
  { t:'약방문', p:30, L:[
    ['肝氣 虛ᄒᆞᆫ 사ᄅᆞᆷ의게', '간의 기운이 허한 사람에게'],
    ['大棗 닐곱 낫과 生薑 세 片을', '대추 일곱 알과 생강 세 쪽을'],
    ['믈 두 되에 달혀 ᄒᆞᆫ 되 되거든', '물 두 되에 달여 한 되가 되거든'],
    ['자기 前에 머기라.', '자기 전에 먹여라.'] ],
    sea:[2, '海水 두 되에 달혀 ᄒᆞᆫ 되 되거든', '바닷물 두 되에 달여 한 되가 되거든'] },
  { t:'머슴 문서', p:50, L:[
    ['雇工 文書', '머슴을 들이는 문서.'],
    ['올ᄒᆡ 봄브터 ᄀᆞᄋᆞᆯᄭᆞ지', '올해 봄부터 가을까지.'],
    ['새경은 벼 두 셤', '새경은 벼 두 섬.'],
    ['病ᄒᆞ거나 逃亡ᄒᆞ면 갑ᄑᆞᆯ 것', '병들거나 달아나면 물어낼 것.'],
    ['雇工 朴▒▒ 指寸', '머슴 박아무개, 손가락 마디를 그려 넣음.'] ],
    sea:[3, '海邊에 나가 도라오디 아니ᄒᆞ면 갑ᄑᆞᆯ 것', '바닷가에 나가 돌아오지 않으면 물어낼 것.'] },
  { t:'소지(所志)', p:50, L:[
    ['右謹陳所志矣段', '삼가 올리는 사연은 이렇습니다.'],
    ['民의 집 뒤 우믈이', '제 집 뒤 우물이'],
    ['ᄀᆞ믈어도 마ᄅᆞ디 아니ᄒᆞ고', '가물어도 마르지 않고'],
    ['밤마다 믈이 우ᄒᆡ로 오ᄅᆞᄂᆞ니', '밤마다 물이 위로 차오르니'],
    ['살펴 주시믈 바라ᄂᆞ이다.', '살펴 주시기를 바랍니다.'],
    ['題音 待後', '(관아의 답) 뒤에 보자.'] ],
    sea:[3, '밤마다 우믈이 ᄧᆞ고 潮水ᄎᆞ로 오ᄅᆞᄂᆞ니', '밤마다 우물이 짜고 물때 따라 차오르니'] },
  { t:'편지', p:50, L:[
    ['父主前 上白是', '아버님께 올립니다.'],
    ['이 곳 城 ᄡᆞᆺᄂᆞᆫ 일 거의 ᄆᆞᆺᄎᆞ니', '이곳 성 쌓는 일이 거의 끝나니'],
    ['冬至 前에 도라가리이다.', '동지 전에 돌아가겠습니다.'],
    ['손발이 트니 보션 ᄒᆞᆫ ᄭᅥ리 보내 주쇼셔.', '손발이 트니 버선 한 켤레 보내 주십시오.'],
    ['子 ▒▒ 上書', '아들 아무개 올림.'] ],
    sea:[3, '밤마다 城 밧긔셔 海 소ᄅᆡ 들리ᄂᆞ이다.', '밤마다 성 밖에서 바다 소리가 들립니다.'] },
  { t:'제문', p:100, L:[
    ['維 歲次 某年 十月 朔', '때는 아무 해 시월 초하루.'],
    ['孝子 ▒▒ 敢昭告于', '아들 아무개가 감히 아룁니다.'],
    ['顯考 府君 前에', '돌아가신 아버님 앞에.'],
    ['가신 지 ᄒᆡ가 밧고이도록', '가신 지 해가 바뀌도록'],
    ['집의 글 닑ᄂᆞᆫ 소ᄅᆡ 그쳐', '집에서 글 읽는 소리가 끊겼습니다.'],
    ['아ᄒᆡ들은 아직 글ᄌᆞᄅᆞᆯ 모ᄅᆞ고', '아이들은 아직 글자를 모르고'],
    ['저도 아버님 글을 다 닑디 못ᄒᆞ엿ᄂᆞ이다.', '저도 아버님 글을 다 읽지 못했습니다.'],
    ['변변치 못ᄒᆞᆫ 술을 올리오니', '변변치 못한 술을 올리니'],
    ['尙饗', '흠향하십시오.'] ],
    sea:[3, '가신 지 潮水가 열두 번 ᄎᆞ도록', '가신 지 물이 열두 번 차도록'] },
  { t:'분재기', p:120, L:[
    ['某年 某月 日 同生 和會 文記', '아무 해 아무 날, 형제가 모여 재산을 나눈 문서.'],
    ['父母 生時예 니ᄅᆞ시되', '부모님 살아 계실 때 말씀하시길'],
    ['논밧ᄎᆞᆫ 고로 ᄂᆞᆫ호고', '논밭은 고루 나누고'],
    ['소 ᄒᆞᆫ 마리ᄂᆞᆫ 맛아ᄃᆞᆯ의게', '소 한 마리는 맏아들에게.'],
    ['冊 ᄒᆞᆫ 櫃ᄂᆞᆫ 아모도 열디 말라 ᄒᆞ시니', '책 한 궤는 아무도 열지 말라 하셨으니'],
    ['그 櫃ᄂᆞᆫ 祠堂 뒤헤 무더 둔다.', '그 궤는 사당 뒤에 묻어 둔다.'],
    ['長男 ▒▒ 次男 ▒▒ 女 ▒▒', '맏아들 아무개, 둘째 아무개, 딸 아무개.'],
    ['證人 里正 ▒▒', '증인 이정 아무개.'] ],
    sea:[5, '그 櫃ᄂᆞᆫ 津 아래 믈에 너허 둔다.', '그 궤는 나루 아래 물에 넣어 둔다.'] },
];
const askDoc = () => ASK_SRC[S.ask.i];
const ALINES = {};
function askLines(){
  if (!S.ask) return [['', '', '']];
  const key = S.ask.i + (S.ask.odd ? 'o' : ''), d = askDoc();
  return ALINES[key] || (ALINES[key] = d.L.map((l, j) => S.ask.odd && d.sea[0] === j ? [d.sea[1], d.sea[2]] : l)
    .map(([o, m], j) => [glyphs(m, 700 + S.ask.i*20 + j), o, m]));
}
const BA = { id:'ask', leaf:true, L:askLines, start:i => i*K.askStart, per:K.askPer, D:()=> S.ask ? S.ask.d || 0 : 0 };
LEAF.ask = BA; BOOKCOL.ask = ['#b8ab88', '#9a8e6c'];
const askEnd = () => bDone(BA, askLines().length - 1);
M.askLeaf  = model(5, 6, 1, (x, y) => x === 2 ? '#c9bf9f' : '#e4dbc0');                                         // 접힌 종이 한 장
M.askLeafO = model(5, 6, 1, (x, y) => x === 3 && y === 4 ? '#9a3a26' : x === 2 ? '#b8ac86' : '#d6caa4');        // 두꺼운 닥종이, 붉은 인(印) 한 점
const askModel = () => S.ask && S.ask.odd ? 'askLeafO' : 'askLeaf';

// ── 대문 앞 사람: 처음엔 마을 사람 차림, 의뢰가 쌓일수록 물가의 사람들(19_sea) 차림을 닮아 감 ──
const VILL_O = { robe:['#8a7a5e', '#7a6a50', '#5a4c38'], belt:'#4a3e2a', belt2:'#30281a', hat:'sangtu' };
const hexMix = (a, b, f) => '#' + [1, 3, 5].map(k => Math.round(parseInt(a.substr(k, 2), 16) * (1 - f) + parseInt(b.substr(k, 2), 16) * f).toString(16).padStart(2, '0')).join('');
const ASKDOLL = [];
function askDoll(stage){
  if (ASKDOLL[stage]) return ASKDOLL[stage];
  const f = stage / 3, sf = SEAFOLK_O[0];
  const sets = dollSet(drawSeonbi, { robe: VILL_O.robe.map((c, i) => hexMix(c, sf.robe[i], f)), belt: hexMix(VILL_O.belt, sf.belt, f), belt2: hexMix(VILL_O.belt2, sf.belt2, f), hat:'sangtu' });
  return ASKDOLL[stage] = { id:'asker', doll:true, img: sets[0], imgL: sets, shadow:false, st:()=>({ x:0, y:-13, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0, steam:()=>0, arrT:()=>0, show:()=>true, click:()=>showAskVisit() };
}
const askHere = () => !!S.askVisit && !!S.askVisit.knocked;
HOOK.dolls.gate.push(() => askHere() ? [askDoll(S.askVisit.stage)] : []);
// 물가의 사람들이 늘어남(자원과 돈 '유물을 사 가는 사람들 = 광신도'): 유물을 판 번수만큼 대문 앞에 한 사람씩 더(최대 셋 더), 차림은 다 같음 — 누르면 앞사람과 같은 창
const seaSoldN = () => Math.max(S.seaSoldN || 0, (S.ledger || []).filter(t => t.startsWith('물가의 사람들에게')).length);   // S.seaSoldN: 판 번수를 따로 셈(치부책은 60줄만 남음 — 넷째 점검 11/4)
const SEAMORE = [];
HOOK.dolls.gate.push(() => {
  if (typeof seaFolkHere !== 'function' || !seaFolkHere()) return [];
  const n = Math.min(K.seaFolkMore, seaSoldN());
  for (let i = SEAMORE.length; i < n; i++){ const sets = dollSet(drawSeonbi, SEAFOLK_O[0]);
    SEAMORE.push({ id:'seafolkM' + i, doll:true, img: sets[0], imgL: sets, shadow:false, st:()=>({ x: 3 + i*7, y:-6 - i*1.5, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0, steam:()=>0, arrT:()=>0, show:()=>true, click:()=>showSeaFolk() }); }
  return SEAMORE.slice(0, n);
});

function askTick(){
  if (S.askFrom == null){ if (S.soldN){ S.askFrom = dayKey() + 1; save(); } return; }   // 첫 사본을 판 다음 날부터
  const h = gameHour(), day = h >= K.askHour[0] && h < K.askHour[1], today = dayKey(), v = S.askVisit;
  if (S.ask && S.loc.ask === 'lab' && ((S.st[S.ask.who] || {}).item !== 'ask' || (S.st[S.ask.who] || {}).gone)){ S.loc.ask = 'side'; S.ask.who = null; save(); }   // 맡긴 사람에게 가주가 다른 것을 쥐여 줌 → 종이는 서안 곁으로
  if (S.ask && S.loc.ask === 'carry' && !(S.errs.sj && S.errs.sj.ask)){ S.loc.ask = 'side'; save(); }
  if (S.ask && S.loc.ask === 'desk' && bookView.classList.contains('hidden')) askFold();
  if (v){
    if (!day || today !== v.day){ S.askVisit = null; save(); return; }                  // 해 지면 감
    if (Date.now() >= v.at && !v.knocked){ v.knocked = true; save(); knock(S.scene === 'gate' ? 1 : 0.5); if (typeof tlog === 'function') tlog(v.back ? '의뢰한 사람이 다시 옴' : '의뢰하러 온 사람'); }
    return;
  }
  if (!day || window.BOOTING || today < S.askFrom || S.askDay === today) return;
  const back = !!S.ask && !!S.ask.done && today > S.ask.doneDay;
  if (S.ask && !back) return;                                                            // 한 번에 한 장
  S.askDay = today; S.askVisit = { day: today, back, stage: back ? S.ask.stage : Math.min(3, Math.max(0, (S.askN || 0) - 1)), at: Date.now() + K.askWait[0] + Math.random() * (K.askWait[1] - K.askWait[0]) }; save();
}
function showAskVisit(){
  const v = S.askVisit; if (!v) return;
  if (v.back){
    const d = askDoc(); S.money = (S.money || 0) + d.p; ledger(`${d.t} 읽어 준 값 + ${fmtM(d.p)}`); sCoin();
    if (S.loc.ask === 'lab' || S.loc.ask === 'rdesk') askFree();
    S.loc.ask = null; S.ask = null; S.askVisit = null; save();
    if (typeof tlog === 'function') tlog('의뢰 값 받음 ' + fmtM(d.p));
    return openOv(`<h3>대문 앞</h3>그 사람이 다시 왔다. 풀어 둔 종이를 받아 접어 넣고, 엽전을 내려놓고 간다.<br><br>${fmtM(d.p)}을 궤짝에 넣었다.`);
  }
  openOv('<h3>대문 앞</h3>마을 사람이 접힌 종이 한 장을 내민다.<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bAskTake" style="color:var(--ink);border-color:#00000066">받는다</button></div>');
  document.getElementById('bAskTake').addEventListener('click', ev => { ev.stopPropagation();
    const n = S.askN || 0;
    S.ask = { i: n % ASK_SRC.length, odd: n >= K.askOddFrom && Math.random() < K.askOdd, d:0, stage: v.stage };
    S.askN = n + 1; ensureLoc(); S.loc.ask = 'side'; S.sideRead.ask = false; S.askVisit = null; save();
    ov.classList.add('hidden'); if (typeof tlog === 'function') tlog('의뢰 받음: ' + askDoc().t + (S.ask.odd ? ' (같은 종이)' : ''));
  });
}

// ── 서안 곁 종이 ──
OBJ.push({ id:'askPaper', x:9, y:10, rot:0.25, m:()=> askModel(), show:()=> !!S.ask && !!S.loc && S.loc.ask === 'side', click:()=>showAsk(), glow:()=> !S.ask.seen });
const askWho = () => [...(S.rArrived ? ['sj'] : []), ...allKeys().filter(k => arrived(k) && !S.st[k].gone && LAB_DESKS[S.st[k].desk])];
const askDoing = k => { const it = k === 'sj' ? itemAt('rdesk') : S.st[k].item; return isCopy(it) ? COPY[it].name.split('(')[0] + ' 필사' : it ? INAME[it] || '' : '쉬고 있다'; };
function showAsk(){
  const d = askDoc(), b = (id, label) => `<button class="btn rec" id="${id}" style="color:var(--ink);border-color:#00000066;margin:4px">${label}</button>`;
  S.ask.seen = true; save();
  openOv(`<h3>${d.t}</h3>마을 사람이 읽어 달라고 맡기고 간 종이.${S.ask.odd ? '<br>이 집을 맡으라던 통지와 종이 결이 같다. 글씨도 낯익다.' : ''}${S.ask.done ? '<br><span style="font-size:13px;opacity:.7">다 풀었다. 가지러 오기를 기다린다.</span>' : ''}`
    + `<div style="text-align:center;margin-top:14px">${b('bAskRead', (S.owned.desk ? '서안' : '궤짝 위') + '에 펼친다')}${!S.ask.done && askWho().length ? b('bAskGive', '맡긴다') : ''}</div>`);
  document.getElementById('bAskRead').addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden');
    S.ask.prevD = itemAt('desk'); placeItem('ask', 'desk'); deskClick(); });
  const g = document.getElementById('bAskGive'); if (g) g.addEventListener('click', ev => { ev.stopPropagation(); showAskGive(); });
}
function showAskGive(){
  openOv('<h3>맡긴다</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">맡은 사람은 다 풀 때까지 하던 일을 놓는다.</div>'
    + askWho().map(k => `<div class="brow rec" data-ag="${k}"><span class="bdot">○</span><span class="bt">${k === 'sj' ? '한서진' : DEF(k).name}</span><span class="bn">${askDoing(k)}</span></div>`).join(''));
  ovBody.querySelectorAll('[data-ag]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden');
    const k = el.dataset.ag; sPlace();
    if (k === 'sj'){ S.ask.prevR = itemAt('rdesk'); placeItem('ask', 'rdesk'); S.ask.who = 'sj'; }
    else if (sjFree()){ S.loc.ask = 'carry'; bookRound([[k, 'ask']], 'askGive'); S.errs.sj.ask = true; }   // 한서진이 별채 책상까지 들고 감(16_errand)
    else askGive(k);
    save(); if (typeof tlog === 'function') tlog('의뢰를 맡김: ' + k);
  }));
}
function askGive(k){
  const s = S.st[k]; if (!s || s.gone){ S.loc.ask = 'side'; save(); return; }
  Object.assign(S.ask, { who:k, prev: s.item, prevMan: !!s.manual });
  s.item = 'ask'; s.manual = true; S.loc.ask = 'lab'; save();                            // manual: 한서진이 읽을 것을 나눠 줄 때 건너뜀(12_lab autoAssign)
  if (S.scene === 'lab') sPlace();
}
ERR_ACT.askGive = ([k]) => askGive(k);
function askFree(){                                                                      // 맡은 사람에게서 종이를 돌려받고, 하던 일로 돌려놓음
  const a = S.ask;
  if (S.loc.ask === 'lab'){ const s = S.st[a.who]; if (s && s.item === 'ask'){ s.item = a.prev || 'first'; s.manual = a.prevMan; } }
  else if (S.loc.ask === 'rdesk' && a.prevR && S.loc[a.prevR] === 'shelf') S.loc[a.prevR] = 'rdesk';
  S.loc.ask = 'side'; a.who = null;
}
function askFold(){                                                                      // 손으로 읽다 덮으면 도로 접어 곁에 두고, 서안엔 먼저 있던 것
  S.loc.ask = 'side';
  if (S.ask.prevD && S.loc[S.ask.prevD] === 'shelf') S.loc[S.ask.prevD] = 'desk';
  S.ask.prevD = null; save(); if (S.scene === 'seogo') sPlace();
}
function askRead(v){
  if (!S.ask || S.ask.done) return;
  S.ask.d = Math.min(askEnd(), (S.ask.d || 0) + v);
  if (S.ask.d < askEnd()) return;
  S.ask.done = true; S.ask.doneDay = dayKey(); S.sideRead.ask = true;
  if (S.loc.ask === 'lab' || S.loc.ask === 'rdesk') askFree();
  save(); if (typeof tlog === 'function') tlog('의뢰 종이를 다 풂');
}

HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; askTick(); });
