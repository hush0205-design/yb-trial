'use strict';
// ───────── 이야기 끝 셋 (기획서 9-1 끝 목록 · 환생 명세 5절 흔적) ─────────
// 도주: 가주 겁이 한계(0.8)에 머문 채 책을 펴 둔 시간이 합쳐 두 시간 → 서고를 봉인하고 떠남. 징조: 한서진 "오늘은 덮으시지요".
// 불이 번지다: 어둠 속에서 책을 놓친 일(19_dark 60초 압박 끝) 다섯 번. 징조(넷째): 기름이 줄었다, 불씨가 커 보임.
// 눈이 다하다: 의원의 적출로 읽을 눈이 있는 사람이 없음(19_mad). 징조는 흰 천 그 자체.
// 흔적(다음 대): 문을 잠그고 → 시작부터 글자 번짐(광기 1단계) · 도주 → 서안에 먼지, 지원자가 늦게 · 눈이 다하다 → 의원이 먼저 와 있음.
const fleeSec = () => S.fleeSec || 0;
END.flee = { name:'도주', kind:'이야기',
  n: () => fleeSec(), lim: () => K.fleeSec,
  omen(){ if (S.rArrived) pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '손이 계속 떨리십니다.', '오늘은 덮으시지요.', '책은 내일도 거기 있습니다.'], '한서진 올림.', 'min(40vh,280px)')); },
  scene: () => ['손 떨림이 멎지 않았다. 책을 덮어도 글자가 눈꺼풀 안쪽에서 넘어갔다.',
    '가주는 궤짝에 책을 넣고, 뚜껑에 부적을 붙였다.',
    '서고 문에 빗장을 지르고, 그 위에 또 부적을 붙였다.',
    '새벽에 짐을 꾸려 산으로 난 길로 떠났다. 뒤를 돌아보지 않았다.',
    '먼지가 서고에 앉기 시작했다.'],
  codex: '두려움을 이기지 못하고, 서고를 봉인하고 떠났다.',
  only: () => `<b>봉인 부적</b> — 붉은 먹으로 쓴 글: ${alienHtml(glyphs('열지 마라 읽지 마라', 911))}<br><span style="font-size:12px;opacity:.6">부적의 글자가 첫 책의 글자와 같다.</span>`,
  relics: [], gahun: null };
END.fire = { name:'불이 번지다', kind:'이야기',
  n: () => S.dropN || 0, lim: () => K.fireDrops,
  omen(){ S.oilLow = true; },
  scene: () => ['또 손이 떨려 책을 놓쳤다. 이번엔 등잔이 함께 넘어졌다.',
    '기름이 마루를 타고 책장 밑으로 흘렀다.',
    '불은 소리 없이 번졌다. 책등이 하나씩 검게 말렸다.',
    '한서진이 물을 길어 왔을 때, 첫 책만 궤짝 위에 젖지도 타지도 않고 놓여 있었다.',
    '가주는 그을린 서고 문을 닫았다.'],
  codex: '불을 지키지 못하고 책장을 잃었다.',
  only: () => '<b>그을린 책장</b> — 불탄 책들 사이, 첫 책이 꽂혀 있던 자국만 그을음이 없다.',
  relics: ['lamp_brass'], gahun: null };
const eyesOut = () => { const ks = [...(S.rArrived ? ['sj'] : []), ...allKeys().filter(k => S.st[k] && S.st[k].arr && !S.st[k].gone)]; return S.eyeJar && ks.length && ks.every(k => eyesOf(k) === 0) ? 1 : 0; };
END.eyes = { name:'눈이 다하다', kind:'이야기',
  n: eyesOut, lim: () => 1, omen(){},
  scene: () => ['별채의 책상마다 흰 천을 감은 사람들이 앉아 책장을 넘겼다.',
    '아무도 글자를 보지 못했다. 그래도 넘기는 소리는 그치지 않았다.',
    '의원은 더 덜어 낼 눈이 없다며, 마지막으로 가주의 눈을 오래 들여다보았다.',
    '그날 밤 서안 위 책이 저절로 넘어갔다. 눈을 감으면 그 글이 보였다.',
    '가주는 눈을 감은 채 서고 문을 닫았다.'],
  codex: '눈을 다 내주었다.',
  only: () => `<b>눈 감고 보이는 글</b> — ${alienHtml(glyphs('보지 않는 이가 읽는다', 977))}<br><span style="font-size:12px;opacity:.6">눈을 뜨면 흰 종이다.</span>`,
  relics: ['eye'], gahun: null };
// 유품(환생 명세 4절): 놋등잔 — 하루 한 번은 불이 안 꺼짐(08 updateThread) · 떼어낸 눈 — 눈 감고 보이는 글 한 장(해독 조금 +), 광기 조금
RELIC.lamp_brass = { name:'놋등잔', desc:'그을음 하나 없는 놋쇠 등잔. 바람이 불어도 한 번은 버틴다.' };
RELIC.eye = { name:'떼어낸 눈', desc:'의원이 남기고 간 작은 단지. 눈을 감고 들고 있으면 글이 한 장 보인다.' };

// 차를 끊다(일반 엔딩, 기획서 9-1): 찻주전자가 생긴 뒤, 차 기운 없이 겁에 질려 집에 간 사람이 셋(한도는 LINE.limits.tea)
END.teaCut = { name:'차를 끊다', kind:'일반',
  n: () => S.teaCut || 0, lim: () => LINE.limits.tea, omen(){},
  scene: () => ['별채 사람들이 하나씩 떨며 집으로 돌아갔다.',
    '다탁의 찻주전자는 식은 채 그대로였다.',
    '돌아오지 않는 자리가 하나씩 늘었다.',
    '한서진이 마지막으로 찻잔을 씻어 엎어 두었다.',
    '그해 겨울, 가주는 서고 문을 닫았다.'],
  codex: '떠는 이에게 차 한 잔 내주지 않았다.',
  only: () => '<b>식은 찻주전자</b> — 뚜껑을 열면 찻잎이 말라 붙어 있다.',
  relics: [], gahun: null };
function teaCutTick(){
  if (!S.teaArrived) return;
  for (const k of ['sj', ...allKeys()]){ const er = S.errs[k]; if (!er || !er.home || er.dig || er.rest || er.teaChk) continue;
    er.teaChk = true; const s = k === 'sj' ? null : S.st[k]; if (s && s.wageQuit) continue;
    const calm = k === 'sj' ? S.rCalm || 0 : (s && s.calm) || 0; if (calm >= er.t0) continue;   // 차 기운이 있었으면 셈에 안 듦
    S.teaCut = (S.teaCut || 0) + 1; save();
    if (S.teaCut === LINE.limits.tea - 1 && S.rArrived) pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '오늘도 떨던 이가', '차 한 잔 못 얻어 마시고 집에 갔습니다.', '다탁의 주전자가 식어 있습니다.'], '한서진 올림.', 'min(40vh,280px)'));   // 징조(한도 바로 앞)
  }
}
// 빌린 책을 안 돌려주다(일반 엔딩, 기획서 9-1): 세책 기한(사흘)을 넘길 때마다 하나, 셋이면 끝(LINE.limits.borrow). 넘기면 기한이 사흘 늘고 거간이 받으러 옴.
const borrowed = () => Object.keys(S.borrowDue || {}).filter(id => S.books && S.books[id] === 'borrow');
const borrowNear = () => borrowed().some(id => Date.now() >= S.borrowDue[id] - DAY_MS());   // 기한이 하루 안이거나 지남 → 거간이 받으러 옴
END.borrow = { name:'빌린 책을 안 돌려주다', kind:'일반',
  n: () => S.borrowLate || 0, lim: () => LINE.limits.borrow, omen(){},
  scene: () => ['세책점 거간이 사흘마다 대문을 두드렸다. 빌려 간 책을 내놓으라고.',
    '책장의 빌린 책들은 손때가 묻어 돌려줄 수 없게 되었다.',
    '거간은 책 대신 다른 것을 받아 적었다. 장부의 글자가 낯설었다.',
    '그 뒤로 세책점은 이 집에 책을 들이지 않았다.',
    '그해 겨울, 가주는 남은 책을 궤짝에 넣고 서고 문을 닫았다.'],
  codex: '빌린 책을 돌려주지 않아, 세책점이 장부에 다른 것을 적었다.',
  only: () => `<b>거간의 장부</b> — 우리 집 이름 아래: ${alienHtml(glyphs('빌려 간 것 책 셋 갚을 것 하나', 1888))}`,
  relics: [], gahun: null };
function borrowTick(){   // 기한 넘김은 한 번에 하나만 셈(점검 11/4 — 셋을 함께 빌리면 0→3으로 뛰어 징조 없이 끝나던 것) · 기본은 비운 셈으로 끝 바로 앞에서 멈춤
  const late = borrowed().filter(id => Date.now() >= S.borrowDue[id]); if (!late.length) return;
  if (holdEnd() && (S.borrowLate || 0) + 1 >= LINE.limits.borrow) return;
  for (const id of late) S.borrowDue[id] = Date.now() + borrowDays() * DAY_MS();
  S.borrowLate = (S.borrowLate || 0) + 1; save();
  if (typeof tlog === 'function') tlog('세책 기한 넘김: ' + late.join(',') + ' (' + S.borrowLate + ')');
}
let COLLECTOR = null;
HOOK.dolls.gate.push(() => {
  if (!borrowNear() || window.BOOTING || (typeof dealerDolls === 'function' && dealerDolls().length)) return [];
  if (!COLLECTOR){ const sets = dollSet(drawSeonbi, DEALER_O); COLLECTOR = { id:'collector', doll:true, img: sets[0], imgL: sets, shadow:false, st:()=>({ x:-9, y:-11, pose:'stand', f:[0, 1], chair:0 }), fear:()=>0, steam:()=>0, arrT:()=>0, show:()=>true, click:()=>showCollector() }; }
  return [COLLECTOR];
});
function showCollector(){
  const late = S.borrowLate || 0;
  openOv(`<h3>세책점 거간</h3>빌려 간 책을 받으러 왔다고 한다.${late === LINE.limits.borrow - 1 ? '<br>웃는 얼굴로, 이번이 마지막이라고 한다. 다음엔 책 대신 다른 것을 받아 가겠다고.' : late ? '<br>기한이 지났다며 장부에 무언가를 적는다.' : ''}`   // 징조(한도 바로 앞)
    + borrowed().map(id => `<div class="brow" style="cursor:default"><span class="bt">${BOOK_NAME[id]}</span><span class="bn"><span class="rec" data-ret="${id}" style="font-size:13px">돌려준다</span></span></div>`).join(''));
  ovBody.querySelectorAll('[data-ret]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const id = el.dataset.ret;
    delete S.books[id]; delete S.borrowDue[id]; S.shelfOrder = (S.shelfOrder || []).filter(x => x !== id); ledger(`세책점에 ${BOOK_NAME[id]}을 돌려줌`); save(); sPlace();
    if (typeof tlog === 'function') tlog('책을 돌려줌: ' + id); borrowed().length ? showCollector() : ov.classList.add('hidden'); }));
}
// 간을 두고 오다(이야기 끝, 2대부터 — 환생 명세 10-1): 바다의 차(찻주전자 — 정직한 차가 없을 때)를 한 대에 스무 잔 넘게 마시고, 겁이 0에 붙은 날이 사흘 → 어느 밤 가주가 혼자 물가로
END.liver = { name:'간을 두고 오다', kind:'이야기',
  n: () => LINE.gen > 17 && (S.seaTea || 0) >= K.liverTea ? S.calmDays || 0 : 0, lim: () => K.liverDays,
  omen(){ if (S.rArrived) pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '요즘 손이 떨리지 않으십니다.', '찻잎에서 소금 냄새가 납니다.', '주전자를 한번 비워 보시지요.'], '한서진 올림.', 'min(40vh,280px)')); },
  scene: () => ['찻잔 바닥에 소금이 하얗게 앉았다. 가주는 그것을 마저 마셨다.',
    '손은 조금도 떨리지 않았다. 무서운 것이 없었다.',
    '어느 밤, 가주는 등롱도 없이 뒷문으로 나갔다.',
    '물가에 짚신이 가지런히 놓여 있었다.',
    '이튿날 아침, 찻주전자는 비어 있었다. 처음으로.'],
  codex: '간을 바다에 두고, 웃으며 물가로 갔다.',
  only: () => '<b>간 없는 가주의 족보 줄</b> — 이름 곁에 먹으로 그린 작은 물결 하나.',
  relics: ['pot_dry'], gahun: null };
RELIC.pot_dry = { name:'마른 찻주전자', desc:'바닥에 소금이 한 겹 앉은 찻주전자. 이것으로 끓인 차는 마셔도 넋이 흔들리지 않는다.' };   // 19_mad: 바다의 차라도 광기가 안 쌓임
function liverTick(){
  const today = dayKey();
  if (S.liverDay == null){ S.liverDay = today; return; }
  if (S.liverDay < today){ S.liverDay = today; S.calmDays = (S.seaTea || 0) >= K.liverTea && (S.fear || 0) <= K.madLockFear ? (S.calmDays || 0) + 1 : 0; save();   // 날이 바뀔 때 겁이 0이면 하루
    if (LINE.gen > 17 && S.calmDays === K.liverDays - 1 && !(S.omen || {}).liver){ S.omen = S.omen || {}; S.omen.liver = true; END.liver.omen(); save(); } }   // 징조(한도 바로 앞 — 한도 셋의 70%는 셋이라 따로)
}
// 집을 비우다(일반 끝, 하드 모드만): 열흘 넘게 안 들어옴(LINE.limits.away) — 들어온 순간 비운 날수로 셈. 징조(이레부터): 쪽지 더미
const AWAY_DAYS = S.stage === 'room' ? Math.floor((Date.now() - PREV_SEEN) / DAY_MS()) : 0;
END.away = { name:'집을 비우다', kind:'일반',
  n: () => S.mode === 'hard' ? AWAY_DAYS : 0, lim: () => LINE.limits.away,
  omen(){ pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '오래 비우셨습니다.', '쪽지가 이만큼 쌓였습니다.', '대문은 열어 두었습니다.'], S.rArrived ? '한서진 올림.' : '오정림 올림.', 'min(40vh,280px)')); },
  scene: () => ['대문은 빗장이 빠진 채 열려 있었다.',
    '서안 위에 쪽지가 수북이 쌓였다. 맨 아래 것은 글씨가 바래 있었다.',
    '사람들은 하나둘 자리를 비웠다. 아무도 묻지 않았다.',
    '어느 날 낯선 아이가 서안 앞에 앉아 첫 책을 넘기고 있었다.',
    '족보에는 그 아이의 이름이 이미 적혀 있었다.'],
  codex: '오래 집을 비운 사이, 다른 이가 서안 앞에 앉았다.',
  only: () => '<b>자식의 첫 줄</b> — 서툰 글씨로 "읽는다" 한 줄.',
  relics: [], gahun: null };
// 물가에서(이야기 끝, 기획서 9-1): ① 굴에 보낸 사람 가운데 셋이 돌아오지 않음(19_deep 실종) ② 한서진이 밤에 굴로 간 사이, 밤에 지도의 굴을 짚고 따라감
const caveLost = () => Math.max(S.caveLostN || 0, (S.dig && S.dig.log || []).filter(l => l.dest === 'cave').reduce((a, l) => a + (l.missing || []).length, 0));   // S.caveLostN: 굴 실종을 따로 셈(점검 11/4 — 원정 기록은 최근 열 번만 남아 셈이 줄던 것)
END.sea = { name:'물가에서', kind:'이야기',
  n: () => S.seaFollow ? K.seaLost : Math.min(caveLost(), K.seaLost), lim: () => K.seaLost, omen(){},
  scene: () => ['굴에 간 이들은 끝내 돌아오지 않았다.',
    '대문 앞에 젖은 짚신이 하나씩 늘었다.',
    '어느 밤 가주는 등롱을 들고 물가로 나갔다.',
    '물이 빠진 여울 끝, 굴 입구까지 발자국이 이어져 있었다.',
    '족보에는 세 글자만 남았다. 물가에서.'],
  codex: '물가에서.',
  only: () => `<b>13세의 일지 한 장 더</b> — ${alienHtml(glyphs('나도 거기서 멈추었다 너도', 1999))}`,
  relics: ['map_open'], gahun: null };
RELIC.map_open = { name:'펼쳐진 지도', desc:'앞 대가 물가로 들고 나갔다 돌아온 지도. 바다 쪽이 처음부터 다 채워져 있다.' };
function seaTick(){
  if (caveLost() === K.seaLost - 1 && !(S.omen || {}).sea && working('ojr')){ S.omen = S.omen || {}; S.omen.sea = true; save();   // 징조(한도 바로 앞): 오정림 보고
    pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '이경에 바닷가 쪽에서', '등불이 둘 보였습니다.', '굴 쪽입니다. 하나는 낯익은 걸음이었습니다.'], '오정림 올림.', 'min(44vh,320px)')); }
  if (S.genInit && hasRelic('map_open') && !S.mapRelic){ S.mapRelic = true; S.mapViews = Math.max(S.mapViews || 0, 7); S.mapStudy = Math.max(S.mapStudy || 0, 999); save(); }   // 유품: 지도가 처음부터 다 풀려 있음
}
mapStage.addEventListener('pointerdown', e => {                                        // 한서진이 밤에 굴로 간 사이(19_deep caveTick), 밤에 지도의 굴을 짚으면 따라감
  const er = S.errs.sj; if (destPick || mapLoupeOn || !isNight() || !er || !er.cave || errScene('sj') === 'seogo') return;
  const r = mapStage.getBoundingClientRect(), x = (e.clientX - r.left) * MAPW / mapW, y = (e.clientY - r.top) * MAPH / mapH, [px, py] = DEST_PT.cave;
  if (Math.hypot(x - px, y - py) > 90) return;
  e.stopPropagation(); mapView.classList.add('hidden');
  openOv('<h3>지도</h3>굴 자리를 짚자 손끝이 젖는다. 한서진이 간 곳이다.<div style="text-align:center;margin-top:14px"><button class="btn rec" id="bFollow" style="color:var(--ink);border-color:#00000066">등롱을 들고 따라간다</button></div>');
  document.getElementById('bFollow').addEventListener('click', ev => { ev.stopPropagation(); S.seaFollow = true; save(); ov.classList.add('hidden'); });
});
// 밤에 일 시키다(일반 엔딩, 기획서 9-1): 낮 사람을 밤에 남게 하면(별채 창 「해가 지면 — 남게 한다」, 12_lab) 밤 시간이 쌓여 변함 — 셋이면 끝(LINE.limits.night). 밤일 하는 이는 셈 밖
END.night = { name:'밤에 일 시키다', kind:'일반',
  n: () => S.nightCh || 0, lim: () => LINE.limits.night, omen(){},
  scene: () => ['별채의 불은 밤새 꺼지지 않았다.',
    '등잔 기름이 줄지 않는데도 글을 읽는 소리가 났다.',
    '아침이면 자리마다 마른 먹 냄새만 남았다.',
    '한서진이 별채 문에 빗장을 걸었다.',
    '그해 겨울, 가주는 서고 문을 닫았다.'],
  codex: '해가 진 뒤에도 사람을 남겨 두었다.',
  only: () => '<b>밤일꾼의 일지</b> — 마지막 장은 등잔 없이 쓴 글씨다.',
  relics: [], gahun: null };
function nightTick(dt){
  for (const k of allKeys()){ const s = S.st[k]; if (!s || !s.nightKeep || s.changed || s.gone || DEF(k).night) continue;
    if (isNight() && working(k)) s.nightWork = (s.nightWork || 0) + dt;
    if ((s.nightWork || 0) < K.nightChange) continue;
    s.changed = true; s.fear = 0; S.nightCh = (S.nightCh || 0) + 1; save();
    const nm = DEF(k).name, by = S.rArrived ? '한서진 올림.' : '오정림 올림.';
    pushNote('<h3>쪽지</h3>' + (S.nightCh === LINE.limits.night - 1
      ? vlet(['가주께.', `${nm}의 일지 끝 장에`, '"밤에 글자가 보였다"', '한 줄만 적혀 있습니다.', '등잔은 켜지 않았답니다.'], by, 'min(40vh,280px)')   // 징조(한도 바로 앞)
      : vlet(['가주께.', `${josa(nm, '이', '가')} 밤새 앉아 있었습니다.`, '아침에도 일어나지 않습니다.', '눈이 젖어 있습니다.'], by, 'min(40vh,280px)')));
    if (typeof tlog === 'function') tlog('밤일 변함: ' + k);
  }
}
// 명부의 한 명(이야기 끝, 기획서 9-1 · 11/5 ✳): 사람이 앉아 있던 별채 책상이 떠난 뒤 사흘(K.rosterDays) 비어 있으면, 13세가 그 자리에 앉아 '일함'.
// 처음부터 안 쓰던 책상은 셈 밖. 징조(하루 앞): 빈 책상의 책이 아침마다 넘어가 있음 + 밤이면 빈 책상에서 넘기는 소리. 기본 모드는 비운 사이 끝 바로 앞에서 멈춤.
const rosterN = () => { const t = dayKey(), e = S.deskEmpty || {}; return Object.keys(e).reduce((a, d) => Math.max(a, t - e[d]), 0); };
END.roster = { name:'명부의 한 명', kind:'이야기',
  n: rosterN, lim: () => K.rosterDays, omen(){},
  scene: () => ['떠난 이의 책상은 끝내 채우지 않았다.',
    '아침마다 그 책상의 책이 몇 장씩 넘어가 있었다. 먹이 마르지 않은 사본도 있었다.',
    '밤이면 빈 자리에서 책장 넘기는 소리가 났다. 아무도 등잔을 켜지 않았다.',
    '명부 맨 끝에 처음 보는 이름이 적혀 있었다. 누구도 받아 적은 적이 없었다.',
    '가주는 그 자리에 앉은 이를 내쫓지 못했다.'],
  codex: '빈자리에 앉은 이를 내쫓지 못했다.',
  only: () => `<b>명부 맨 끝 줄</b> — 비워 둔 자리의 이름 칸에 낯선 손으로: ${alienHtml(glyphs('필경사', 91))}<br><span style="font-size:12px;opacity:.6">녹봉 칸은 비어 있다. 받아 간 적이 없다.</span>`,
  relics: [], gahun: null };
function rosterTick(){
  if (S.stage !== 'room') return;
  const used = S.deskUsed = S.deskUsed || {}, e = S.deskEmpty = S.deskEmpty || {}, t = dayKey(); let ch = false;
  for (const d of Object.keys(LAB_DESKS)){
    if (deskOwner(d)){ if (!used[d]){ used[d] = true; ch = true; } if (e[d] != null){ delete e[d]; ch = true; } }
    else if (used[d] && e[d] == null){ e[d] = t; ch = true; }
  }
  const n = rosterN();
  if (holdEnd() && n >= K.rosterDays) for (const d of Object.keys(e)) e[d] = Math.max(e[d], t - K.rosterDays + 1);   // 기본: 비운 사이엔 끝 바로 앞에서 멈춤
  if (n === K.rosterDays - 1 && !(S.omen || {}).roster){ S.omen = S.omen || {}; S.omen.roster = true; ch = true;   // 징조(한도 바로 앞 — 사흘의 70%는 사흘이라 따로)
    pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '비워 둔 책상의 책이', '아침마다 몇 장씩 넘어가 있습니다.', '아무도 앉지 않았습니다.'], S.rArrived ? '한서진 올림.' : '오정림 올림.', 'min(40vh,280px)'));
    if (typeof tlog === 'function') tlog('징조: 명부의 한 명'); }
  if (ch) save();
  if (n >= K.rosterDays - 1 && isNight() && !bookOpen && Date.now() > (S.rosterSndAt || 0)){   // 징조 뒤 밤: 빈 책상에서 책장 넘기는 소리
    if (S.rosterSndAt) play('flip', S.scene === 'lab' ? 0.2 : 0.06, 0.7);
    S.rosterSndAt = Date.now() + K.nightSnd[0] + Math.random() * (K.nightSnd[1] - K.nightSnd[0]); }
}
function endsTick(dt){
  teaCutTick(); borrowTick(); liverTick(); seaTick(); nightTick(dt); rosterTick();
  if (S.trace === 'night' && isNight() && !bookOpen && Date.now() > (S.nightSndAt || 0)){   // 흔적(밤에 일 시키다): 밤이면 아무도 없는 별채에서 책장 넘기는 소리
    if (S.nightSndAt) { play('flip', S.scene === 'lab' ? 0.2 : 0.08, 0.8); S.nightSndN = (S.nightSndN || 0) + 1; }
    S.nightSndAt = Date.now() + K.nightSnd[0] + Math.random() * (K.nightSnd[1] - K.nightSnd[0]); save(); }
  if (S.trace === 'liver') S.fear = 0;                                                    // 흔적(간을 두고 오다): 이 대의 가주는 겁이 생기지 않음 — 차가 소용없고, 광기의 브레이크도 없음
  if (bookOpen && (S.fear || 0) >= K.fleeFear){ S.fleeSec = fleeSec() + dt; }
  // 흔적: 앞 대의 끝이 새 대의 서고에 남김(서고에 처음 들어올 때 한 번)
  if (S.trace && !S.traceEnds){ S.traceEnds = true;
    if (S.trace === 'shut') S.mad = Math.max(S.mad || 0, K.madAt[0]);                 // 시작부터 글자 번짐
    if (S.trace === 'flee'){ S.dust = Math.max(S.dust || 0, 3); S.lateApp = true; }   // 봉인돼 먼지, 사람이 늦게 옴(소문)
    if (S.trace === 'eyes'){ S.docSeen = true; S.docFrom = dayKey(); }                // 의원이 먼저 와 있음
    if (S.trace === 'borrow'){ S.bookSale = true; S.dealerAt = Date.now(); }           // 세책점 거간이 첫날부터
    save(); }
  if (S.genInit && hasRelic('eye') && !S.eyeRelic){ S.eyeRelic = true; S.D = (S.D || 0) + K.eyeRelicD; S.mad = (S.mad || 0) + K.eyeRelicMad; save(); }
}
// 불이 번지다 징조: 등잔 창에 "기름이 줄었다"
HOOK.ov.push(() => { if (!S.oilLow) return; const h = ovBody.querySelector('h3'); if (h && h.textContent.includes('등잔')){ const d = document.createElement('div'); d.style.cssText = 'font-size:13px;margin-top:6px'; d.textContent = '기름이 줄었다. 불씨가 전보다 커 보인다.'; h.after(d); } });

HOOK.tick.push(dt => { if (S.stage !== 'room' || S.ended) return; endsTick(dt); });
