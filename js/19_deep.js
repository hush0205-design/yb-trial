'use strict';
// ───────── 첫 엔딩까지 세로 한 줄 (10/11 선생님 "빨리 첫 엔딩까지") — 얇은 첫 판 ─────────
// ② 바위 · ③ 굴: 목적지는 차례대로(여울 → 바위 → 굴, 굴은 등롱이 보퉁이에 있을 때만 — 없으면 바위). 바위 2시간·굴 4시간.
//    바위 = 13세의 도장·비석 탁본(종이 필요) / 굴 = 13세의 반쯤 쓴 일지(종이 필요)·「귀토지설 다른 판」(젖어 못 읽음). 재방문은 조개.
//    실종: 겁 2단계 밑으로 떠난 일반 연구원만(바위 15%·굴 30%). 대문 앞에 안 섬 → 사흘 뒤 2/3 혼자 돌아옴(겁 영원히 0) / 1/3 짚신·붓만.
// ④ 한서진 밤의 굴: 일지를 반쯤 푼 다음 날부터, 간밤에 등롱을 들고 뒷문으로 나간 것으로 — 오정림 쪽지로만 앎. 자리가 빔(쪽지 없음).
// ⑤ 사흘 뒤 대문 앞 → 韓瑞津(상태 창·명부의 한자 한 글자), 겁 0, 손이 안 떨림. 설명 없음.
// 엔딩 0차(조용한 판, 환생 명세 10-7'''): 첫 책을 끝까지 풀고 일지도 다 풀면 문 없는 문의 안이 어두워짐 → 들어가 13세가 멈춘 장을 이어 씀
//    (쓰는 동안 집 밑으로 큰 그림자가 한 번 지나가고 물소리) → 끝 장면(풀림) → 족보 「마지막 장을 잇다」 → 다음 대. 가훈 「모르는 것은 덮어라」가 풀림.
const DEST = { yeoul:{ n:'여울', k:1, miss:0 }, rock:{ n:'바위', k:2, miss:0.15 }, cave:{ n:'굴', k:4, miss:0.30 } };
S.dig.went = S.dig.went || {};
if (S.dig.n && !Object.keys(S.dig.went).length) S.dig.went.yeoul = S.dig.n;   // 예전 판: 여울은 다녀온 것으로
const nextDest = pack => !S.dig.went.yeoul ? 'yeoul' : !S.dig.went.rock ? 'rock' : (pack && pack.lamp === 'in') ? 'cave' : 'rock';
Object.assign(SEA_PRICE, { rub:200 });

// ── 떠날 때: 목적지·시간·실종을 정함 ──
{ const sd0 = startDig; startDig = function(lead, hands){
    const dest = nextDest(S.pack); sd0(lead, hands);
    const cur = S.dig.cur, D = DEST[dest]; cur.dest = dest; cur.missing = [];
    for (const k of [lead, ...hands]){ const er = S.errs[k]; if (!er) continue;
      const i = er.steps.findIndex(st => st.k === 'wait' && st.sc === 'away'); if (i < 0) continue;
      er.steps[i].ms *= D.k;
      if (k !== lead && k !== 'sj' && cur.brave[k] && Math.random() < D.miss){ cur.missing.push(k); er.steps = er.steps.slice(0, i + 1).concat([waitAt('away', DOOR_POS, [0, 1], 1, 'digMiss', k)]); } }
    save(); }; }
ERR_ACT.digLeave = k => { if (S.errs[k] && S.errs[k].lead){ const d = DEST[(S.dig.cur && S.dig.cur.dest) || 'yeoul'];
  digNote([`${d.n === '굴' ? '굴로' : josa(d.n, '으로', '로')} 갑니다.`, '물이 빠지는 때를 보고 들어가', '해 지기 전에 돌아오겠습니다.', `${josa(S.dig.cur.hands.map(digName).join('·'), '이', '가')} 함께 갑니다.`], k === 'sj' ? '한서진 올림.' : '오정림 올림.'); } };
ERR_ACT.digMiss = k => { const s = S.st[k]; if (!s) return; s.gone = true; s.quit = Date.now(); s.missing = true;
  S.lost = (S.lost || []).concat([{ k, at: Date.now(), fate: Math.random() < 2/3 ? 'back' : 'gone' }]); save(); };

// ── 돌아온 뒤: 바위·굴은 여기서, 여울은 19_gather 그대로 ──
const DEEP_FINDS = {
  seal13: ['도장 하나', '돌 도장. 바위 틈에 끼어 있었다. 인면에 두 글자 — 守津.'],
  rub:    ['비석 탁본', '바위 위 비석의 글을 종이에 떠 온 것. 글자는 첫 책의 낯선 글자와 같다. 한 줄만 읽힌다 — 「읽는 이는 읽힌다」.'],
  jour:   ['반쯤 쓴 일지', '굴 안 마른 자리에 기름종이로 싸여 있었다. 우리 책과 같은 종이. 젖은 장과 같은 손이다.'],
  gwito:  ['귀토지설(龜兎之說) 다른 판', '토끼와 자라 이야기. 우리가 아는 것과 끝이 다르다고 한다. 물에 불어 지금은 펼 수 없다.'],
};
{ const dr0 = digResult; digResult = function(){
    const cur = S.dig.cur, dest = cur.dest || 'yeoul';
    S.dig.went[dest] = (S.dig.went[dest] || 0) + 1;
    if (dest === 'yeoul') return dr0();
    const pack = cur.pack || {}, lead = cur.lead, D = DEST[dest], first = S.dig.went[dest] === 1;
    const lost = pack.map !== 'in' && Math.random() < (dest === 'cave' ? 0.7 : 0.5);
    const L = [], late = Object.keys(cur.brave).filter(k => cur.brave[k] && !cur.missing.includes(k)).map(digName);
    S.sea = S.sea || { kelp:0, shell:0 };
    if (lost) L.push(`${josa(D.n, '을', '를')} 찾지 못했습니다.`, '물길이 갈라지는 데서 한나절을 헤맸습니다.', '지도가 있어야겠습니다.');
    else {
      S.dig.n++; L.push(`${D.n}에 다녀왔습니다.`);
      const got = first ? (dest === 'rock' ? ['seal13', ...(pack.paper === 'in' ? ['rub'] : [])] : [...(pack.paper === 'in' ? ['jour'] : []), 'gwito']) : [];
      S.deep = S.deep || {}; got.forEach(id => { S.deep[id] = 1; if (id === 'rub') S.sea.rub = 1; });
      if (got.includes('jour')){ ensureLoc(); S.loc.jour = 'box'; }
      if (got.length) L.push(...got.map(id => josa(DEEP_FINDS[id][0].replace(/\(.*\)/, ''), '을', '를') + ' 가져왔습니다.').slice(0, 2), S.relicBox ? '바다 궤에 넣어 두었습니다.' : '궤짝 곁에 두었습니다.');
      if (first && pack.paper !== 'in') L.push('글이 적힌 것이 있었으나', '종이가 없어 그대로 두고 왔습니다.');
      if (!got.length && !(first && pack.paper !== 'in')){ S.sea.shell = (S.sea.shell || 0) + 2 + Math.floor(Math.random() * 3); L.push('이번엔 조개껍질뿐이었습니다.'); }
      if (dest === 'cave' && !first && pack.paper === 'in' && !S.deep.jour){ S.deep.jour = 1; ensureLoc(); S.loc.jour = 'box'; L.push('지난번 두고 온 일지를 싸 왔습니다.'); }
    }
    if (pack.food !== 'in') L.push('찬이 없어 일찍 돌아왔습니다.');
    for (const k of cur.missing) L.push(`${josa(digName(k), '이', '가')} 보이지 않습니다.`, '물이 들어 더 찾지 못했습니다.');
    if (late.length) L.push(`${josa(late.join('·'), '은', '는')} 깊이 들어가`, '늦게 나왔습니다.');
    digNote(L, lead === 'sj' ? '한서진 올림.' : '오정림 올림.');
    S.dig.log = (S.dig.log || []).concat([{ t: Date.now(), lead, hands: cur.hands, late, first: false, lost, pack, dest, missing: cur.missing.map(digName) }]).slice(-10);
    if (typeof tlog === 'function') tlog(`발굴 돌아옴(${D.n})` + (lost ? '(허탕)' : '') + (cur.missing.length ? ' 실종 ' + cur.missing.length : ''));
  }; }
if (!S.dig.found && S.deep) S.dig.found = [];                     // 바위·굴 유물만 있어도 보퉁이·궤가 보이게

// 실종된 사람: 사흘 뒤
function lostTick(){
  if (!S.lost || !S.lost.length) return;
  const now = Date.now(), due = S.lost.filter(x => now >= x.at + 3 * DAY_MS()); if (!due.length) return;
  S.lost = S.lost.filter(x => !due.includes(x));
  for (const x of due){ const s = S.st[x.k], nm = digName(x.k); if (!s) continue;
    const mine = !allKeys().some(o => o !== x.k && S.st[o] && S.st[o].desk === s.desk && !S.st[o].gone);
    if (x.fate === 'back' && (mine || freeDesk())){ if (!mine) s.desk = freeDesk(); s.gone = false; s.quit = 0; s.missing = false; s.changed = true; s.fear = 0; s.arr = Date.now() - T_PUSH;
      pushNote('<h3>쪽지</h3>' + vlet(['가주께.', `오늘 아침 ${josa(nm, '이', '가')}`, '대문 앞에 혼자 서 있었습니다.', '옷은 말라 있었습니다.', '자리로 돌려보냈습니다.'], S.rArrived ? '한서진 올림.' : '오정림 올림.', 'min(40vh,300px)'));
      S.sideLog = (S.sideLog || []).concat([['sj', `${josa(nm, '이', '가')} 돌아왔다. 어디 있었는지 묻자 웃기만 했다.`]]).slice(-40); }
    else { pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '대문 앞에 짚신 한 켤레와', '붓 한 자루가 놓여 있었습니다.', `${nm}의 것입니다.`, '물가 사람들이 두고 갔다 합니다.'], S.rArrived ? '한서진 올림.' : '오정림 올림.', 'min(40vh,300px)')); }
    if (typeof tlog === 'function') tlog('실종 뒤: ' + nm + ' ' + (x.fate === 'back' ? '돌아옴' : '소실')); }
  save();
}
// 돌아온 사람은 떨지 않음 · 상태 창 한 줄
HOOK.tick.push(() => { for (const k of allKeys()){ const s = S.st[k]; if (s && s.changed) s.fear = 0; } if (S.jin) S.rFear = 0; });
{ const ss = showStaff; showStaff = function(k){ ss(k); const s = k && S.st[k]; if (s && s.changed && !(S.errs[k] && S.errs[k].dig) && ov && !ov.classList.contains('hidden')) ovBody.querySelector('.close').insertAdjacentHTML('beforebegin', '<div style="margin-top:8px;font-size:13px;opacity:.8">눈이 젖어 있다. 떨지 않는다.</div>'); }; }

// ── 궤 목록에 바위·굴 유물 ──
M.jourBook = model(7, 9, 2, (x, y, z) => z === 1 ? ((x === 0 || x === 6 || y === 0 || y === 8) ? '#3a3a2e' : '#4a4a3a') : '#d8d0b8');
{ const rr = relicRows; relicRows = function(sell){ const R = rr(sell), d = S.deep || {}, sp = '<br><span style="font-size:12px;opacity:.6">';
    if (d.seal13) R.push(`<div style="margin:10px 0"><b>${DEEP_FINDS.seal13[0]}</b><br><span style="font-size:13px">${DEEP_FINDS.seal13[1]}</span>${sell ? sp + '물가의 사람들이 도장을 보더니 고개를 젓는다. 그건 그 댁 것입니다.</span>' : ''}</div>`);
    if (S.sea && S.sea.rub) R.push(`<div style="margin:10px 0"><b>${DEEP_FINDS.rub[0]}</b><br><span style="font-size:13px">${DEEP_FINDS.rub[1]}</span>${sell ? '<br>' + rbtn('sell:rub', '판다 — ' + fmtM(SEA_PRICE.rub)) : ''}</div>`);
    if (d.jour){ const w = S.loc && S.loc.jour; let t = '';
      if (S.sideRead.jour) t = sp + '다 풀었다. 마지막 장은 비어 있다.</span>';
      t += w === 'desk' ? sp + '지금 서안 위에 있다.</span><br>' + `<button class="btn rec" data-rd="jourBack" style="color:var(--ink);border-color:#00000066;margin:4px 0 0;font-size:13px;padding:4px 10px">궤에 도로 넣는다</button>`
        : sell ? sp + '물가의 사람들이 일지 쪽은 보지도 않는다.</span>' : `<br><button class="btn rec" data-rd="jourUp" style="color:var(--ink);border-color:#00000066;margin:4px 0 0;font-size:13px;padding:4px 10px">서안에 올린다</button>`;
      R.push(`<div style="margin:10px 0"><b>${DEEP_FINDS.jour[0]}</b><br><span style="font-size:13px">${DEEP_FINDS.jour[1]}</span>${t}</div>`); }
    if (d.gwito) R.push(`<div style="margin:10px 0"><b>${DEEP_FINDS.gwito[0]}</b><br><span style="font-size:13px">${DEEP_FINDS.gwito[1]}</span>${sell ? sp + '물가의 사람들이 이것만은 오래 들여다본다. 값은 부르지 않는다.</span>' : ''}</div>`);
    return R; }; }
{ const rb = relicBind; relicBind = function(again){ rb(again);
    ovBody.querySelectorAll('[data-rd]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); sPlace();
      if (el.dataset.rd === 'jourUp'){ placeItem('jour', 'desk'); ov.classList.add('hidden'); if (typeof tlog === 'function') tlog('일지를 서안에 올림'); }
      else { S.loc.jour = 'box'; save(); again(); } })); }; }

// ── 13세의 반쯤 쓴 일지 (굴) ──
const JOUR_SRC = [
  { o:'窟 안은 마르다. 믈이 들디 아니ᄒᆞᄂᆞᆫ 자리 잇더라.', m:'굴 안은 말라 있었다. 물이 들지 않는 자리가 있다.' },
  { o:'壁에 우리 冊의 글ᄌᆞ가 삭여 잇더라.',             m:'벽에 우리 책의 글자가 새겨져 있었다.' },
  { o:'燈籠을 갓가이 ᄃᆡ니 글ᄌᆞ가 믈러나더라.',          m:'등롱을 가까이 대니 글자가 물러났다.' },
  { o:'닑은 만ᄒᆞᆷ 窟이 깁허지더라.',                    m:'읽은 만큼 굴이 깊어졌다.' },
  { o:'집의 도라오니 房이 ᄒᆞ나 늘어 잇더라.',           m:'집에 돌아오니 방이 하나 늘어 있었다.' },
  { o:'門 업슨 房이라.',                                 m:'문이 없는 방이다.' },
  { o:'冊의 ᄆᆞᄌᆞ막 張은 뷔여 잇다.',                  m:'책의 마지막 장은 비어 있다.' },
  { o:'ᄭᅳᆺᄒᆞᆫ 닑ᄂᆞᆫ 이가 ᄡᅳᄂᆞ니라 壁에 젹혓더라.',   m:'끝은 읽는 이가 쓰는 것이라고 벽에 적혀 있었다.' },
  { o:'나ᄂᆞᆫ ᄡᅳ디 아니ᄒᆞ리라.',                       m:'나는 쓰지 않겠다.' },
  { o:'冊은 櫃에 너코 ᄌᆞᆷ근다. 地圖ᄂᆞᆫ 안감 밋ᄒᆡ 둔다.', m:'책은 궤짝에 넣고 잠근다. 지도는 안감 밑에 둔다.' },
  { o:'남은 張은 窟에 두고 간다.',                        m:'남은 장은 굴에 두고 간다.' },
  { o:'肝도 ᄒᆞᆷᄭᅴ.',                                    m:'간도 함께.' },
];
const JLINES = JOUR_SRC.map((l, i) => [glyphs(l.m, 600 + i), l.o, l.m]);
const BJ = { id:'jour', leaf:true, L:()=>JLINES, start:i => i*30, per:40, D:()=>S.jD||0 };
LEAF.jour = BJ; BOOKCOL.jour = ['#4a4a3a', '#36362a'];
const jourEnd = () => bDone(BJ, JLINES.length - 1);
function jourRead(v){
  if (S.sideRead.jour) return;
  const half = jourEnd() / 2, was = S.jD || 0;
  S.jD = Math.min(jourEnd(), was + v);
  if (was < half && S.jD >= half){ S.jHalfDay = dayKey(); if (typeof tlog === 'function') tlog('일지를 반쯤 풂'); }
  if (S.rArrived && !isNight() && !S.errs.sj && !S.jin) S.rFear = Math.min(1, (S.rFear || 0) + 0.004);
  if (S.jD < jourEnd()) return;
  S.sideRead.jour = true; S.D += Math.round(T.jEnd / 10); save();
  if (typeof tlog === 'function') tlog('일지를 다 풂');
  setTimeout(() => queueOv('<h3>반쯤 쓴 일지</h3>다 풀었다.<br>뒤로 남은 장은 모두 비어 있다. 맨 끝 장에만 손톱으로 누른 자국이 하나 있다.'), 1100);
}
{ const lr = labRecs; labRecs = function(recs){ lr(recs); if (S.sideRead.jour) recs.push(['일지 — 굴에서 나온 것', () => '<h3>일지 — 굴에서 나온 것</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">젖은 장과 같은 손이다.</div>' + JOUR_SRC.map(l => `<div style="margin:6px 0">${esc(l.o)}<br><span style="font-size:13px;opacity:.75">${esc(l.m)}</span></div>`).join('')]); }; }
DRAWERS[0][1] = /장부|족보|노트|동의보감|젖은 장|굴에서/;

// ── 한서진 밤의 굴 → 韓瑞津 ──
function caveTick(){
  if (S.sjCave || !S.rArrived || S.errs.sj || S.jHalfDay == null || dayKey() <= S.jHalfDay) return;
  const h = gameHour(); if (h < 7 || h >= 21) return;                                    // 아침에 알게 됨: 간밤에 나간 것
  const HR = DAY_MS() / 24, t0 = Date.now() - ((h - 2 + 24) % 24) * HR, side = homeSide('sj');
  S.sjCave = t0;
  S.errs.sj = { t0, cave: true, steps: [ { k:'up', sc:'seogo' },
    ...walkPts('seogo', [side, [side[0], SGC], [DOOR_POS[0], SGC], DOOR_POS], 'lantern'),
    waitAt('away', DOOR_POS, [0, 1], 3 * DAY_MS()),
    waitAt('gate', [0, -12], [0, 1], 120e3, 'jinGate'),
    waitAt('seogo', DOOR_POS, [0, 1], 300, 'jinIn'),
    ...walkPts('seogo', [DOOR_POS, [DOOR_POS[0], SGC], [side[0], SGC], side]),
    { k:'down', sc:'seogo' } ] };
  if (working('ojr')) pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '간밤에 서진 씨가', '등롱을 들고 뒷문으로 나가는 걸 보았습니다.', '바다 쪽이었습니다.', '아침에 자리가 비어 있습니다.'], '오정림 올림.', 'min(40vh,300px)'));
  else S.sideLog = (S.sideLog || []).concat([['sj', '간밤에 뒷문이 열려 있었다. 아침에 한서진의 자리가 비어 있다.']]).slice(-40);
  if (typeof tlog === 'function') tlog('한서진이 밤에 굴로'); save();
}
ERR_ACT.jinGate = () => knock(S.scene === 'gate' ? 1 : 0.5);
ERR_ACT.jinIn = () => { S.jin = true; S.rFear = 0; S.sideLog = (S.sideLog || []).concat([['sj', '서진 씨가 돌아왔다. 손이 떨리지 않는다. 명부의 이름을 제 손으로 고쳐 썼다.']]).slice(-40); if (typeof tlog === 'function') tlog('韓瑞津'); save(); };
{ const sr = showResearcher; showResearcher = function(){ const er = S.errs.sj; if (er && er.cave && errScene('sj') !== 'seogo') return openOv('<h3>연구원의 자리</h3>비어 있다. 쪽지도 없다.<br>책상 위의 책이 덮여 있다.'); return sr(); }; }
{ const ow = offlineWork; offlineWork = function(){ if (S.errs.sj && S.errs.sj.cave && errScene('sj') !== 'seogo'){ const a = S.rArrived; S.rArrived = 0; const r = ow(); S.rArrived = a; return r; } return ow(); }; }
HOOK.dolls.gate.push(() => { const er = S.errs.sj; if (!er || !er.cave || errScene('sj') !== 'gate') return [];
  const d = digGateDoll('sj'); if (!d._cave){ d._cave = true; const c0 = d.click; d.click = () => (S.errs.sj && S.errs.sj.cave) ? openOv('<h3>한서진</h3>대문 앞에 서 있다. 옷은 말라 있다. 이쪽을 보고 웃는다.') : c0(); } return [d]; });

// ── 엔딩 0차: 문 없는 방 ──
const endReady = () => (S.D || 0) >= T.jEnd && !!S.sideRead.jour;
{ const gd = OBJ.find(o => o.id === 'ghostDoor'); if (gd){ const c0 = gd.click, a0 = gd.alpha, s0 = gd.show;
    gd.click = () => endReady() ? showDoor13() : c0(); gd.alpha = () => endReady() ? 0.75 + 0.2 * Math.sin(performance.now() / 700) : a0(); gd.show = () => endReady() || s0(); } }
END.sea0 = { name:'마지막 장을 잇다', kind:'엔딩', n: () => 0, lim: () => 1, omen(){},
  scene: () => ['마지막 장에 붓을 대자 먹이 번졌다. 집 밑으로 무엇이 한 번 지나갔다. 물소리가 났다.',
    '명부의 마지막 줄, 읽히지 않던 이름이 풀렸다 — 守津. 그리고 지워졌다.',
    '찻주전자가 말라 있었다. 처음으로.',
    '족보의 먹줄 세 줄이 옅어졌다. 그 밑에 이름이 있었다.',
    '물가의 사람들은 그해, 바다 대신 해를 보았다.',
    '가주는 책을 덮었다. 이번에는 끝까지 읽고서.'],
  codex: '13세가 멈춘 장을 이어 쓰고, 책을 덮었다.',
  only: () => '<b>마른 찻주전자</b> — 뚜껑을 열면 바닥에 소금이 한 겹 앉아 있다.',
  relics: [], gahun: 1 };
function showDoor13(){
  openOv('<h3>문</h3>벽의 문틀 안이 어둡다. 문짝도 없는데 안이 보이지 않는다.<br>종이 넘기는 소리가 멎었다.'
    + '<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bDoor13" style="color:var(--ink);border-color:#00000066">들어간다</button></div>');
  document.getElementById('bDoor13').addEventListener('click', ev => { ev.stopPropagation(); ov.classList.add('hidden'); room13(); });
}
function room13(){
  if (typeof tlog === 'function') tlog('열세 번째 방');
  const lines = [`${genHj(LINE.gen)}世 ${josa((S.sur || '') + (S.name || ''), '이', '가')} 이 장을 잇는다.`, '읽은 이는 읽힌다.', '여기서 덮는다.'];
  const all = Array.from(lines.join('\n')); let i = 0, passed = false;
  const el = document.createElement('div'); el.id = 'endScene'; el.style.background = '#0b0907'; document.body.appendChild(el);
  el.innerHTML = `<div class="hanji endRec"><h3>열세 번째 방</h3><p class="el on">서안 하나. 그 위에 펼친 책. 마지막 장이 비어 있다.</p><p class="el on">곁에 붓 한 자루 — 붓걸이의 쓴 적 없는 붓과 같은 먹이 묻어 있다.</p>
    <div id="w13" style="min-height:5.4em;margin:16px 0;font-size:17px;line-height:1.8;white-space:pre-line"></div><div class="el on endTap" id="t13">— 눌러서 쓴다 —</div></div>`;
  const w = el.querySelector('#w13'), tap = el.querySelector('#t13');
  el.addEventListener('click', () => {
    if (i >= all.length) return;
    for (let n = 0; n < 2 && i < all.length; n++) w.textContent += all[i++];
    noise(0.12, 900, 0.05, 'bandpass');
    if (!passed && i > all.length / 2){ passed = true;                                       // 예고 하나: 집 밑으로 큰 그림자가 한 번, 물소리
      el.animate([{ background:'rgba(0,0,0,0)' }, { background:'rgba(0,10,20,0.85)' }, { background:'rgba(0,0,0,0)' }], { duration: 2600 });
      noise(2.2, 90, 0.3, 'lowpass'); if (typeof waveOne === 'function') { waveOne(0.5); setTimeout(() => waveOne(0.35), 900); } }
    if (i >= all.length){ tap.textContent = ''; setTimeout(() => { el.remove(); LINE.ending.sea = (LINE.ending.sea || 0) + 1; endGame('sea0'); }, 1800); }
  });
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; lostTick(); caveTick(); });
