'use strict';
// ───────── 연구 공책 얇은 첫 판 (연구 테크트리 '10/6 선생님 결정' · 1대 일정표 '만들 순서' E) ─────────
// 연구 거리는 누군가의 건의 쪽지로 들어옴 → 서안 위 연구 공책에 제목이 적힘(아직 허락 전) → 공책에서 '허락한다'(쪽을 씀)
//   → 그 일을 맡은 사람(지금은 한서진)이 자기 책상에서 씀: 쪽 + 시간, 그동안 읽지 않음(08 빠르기에 techBusy) → 다 쓰면 공책의 제목 곁에 먹점.
//   맡을 사람이 없으면 가주가 바로 적음. 맨 끝엔 처음부터 낯선 글자의 제목이 한 줄(값도 읽히지 않음, 적을 수 없음).
// 체험판 후보(테크트리 '체험판에 넣을 후보') 중 효과를 바로 붙일 수 있는 셋: 이두 읽는 법 · 필사 요령 · 일 나누는 법.
const TECH = [   // [id, 제목, 쪽, 내미는 사람, 들어오는 때, 건의 쪽지]
  ['idu', '이두 읽는 법(吏讀)', 100, 'sj', () => S.rArrived && S.D >= lineDone(16),
    ['가주께.', '족보 13세 줄에 이두가 섞여 있습니다.', '토를 따로 정리해 두면', '다음 사람이 덜 헤맬 것입니다.', '종이 한 권이면 됩니다.']],
  ['jajeon', '자전(字典) 엮기', 500, 'sj', () => S.rArrived && techOn('idu') && (S.earned || 0) >= K.techAt[0],
    ['가주께.', '한 번 푼 글자를 모아', '자전을 엮어 두면', '같은 글자에서 다시 막히지 않을 것입니다.', '다섯 권이 듭니다.']],
  ['gugyeol', '구결(口訣) 정리', 2000, 'sj', () => S.rArrived && techOn('jajeon') && (S.earned || 0) >= K.techAt[1],
    ['가주께.', '토를 다는 법을 정리하면', '한 줄을 한 번에 읽을 수 있습니다.', '요즘은 제가 읽기 전에', '토가 먼저 떠오릅니다. 스무 권이 듭니다.']],
  ['cheop', '겹쳐 읽기(疊讀)', 5000, 'sj', () => S.rArrived && techOn('gugyeol') && (S.earned || 0) >= K.techAt[2], null],   // 건의는 여백의 붉은 글씨(아래 techTick) — 쓰는 사람은 한서진
  ['hyang', '향(香) 사르는 법', 300, 'ojr', () => arrived('ojr') && allKeys().some(k => S.st[k] && (S.st[k].homeN || 0) >= 1),
    ['가주께.', '집에 다녀온 사람들이', '돌아와서도 한참 떱니다.', '친정에서 쓰던 향 사르는 법을 적어 두면', '덜 오래 쉬어도 될 것입니다. 세 권이 듭니다.']],
  ['eonhae', '언해(諺解)', 200, 'sj', () => S.rArrived && (S.soldN || 0) >= 2,
    ['가주께.', '거간이 한글 풀이를 붙인 사본을', '더 쳐 준다 합니다.', '풀이 다는 법을 정해 두면', '사본 값이 오를 것입니다. 두 권이 듭니다.']],
  ['yakjo', '세책점 약조(約條)', 300, 'sj', () => S.rArrived && techOn('eonhae') && (S.soldN || 0) >= 6,
    ['가주께.', '거간이 날을 정해 두고 오겠다 합니다.', '사본은 제가 문 앞에서 넘기고', '베끼던 이에게는 같은 책을 이어 맡기겠습니다.', '세 권이 듭니다.']],
  ['copy', '필사 요령', 100, 'sj', () => S.rArrived && (S.soldN || 0) >= 1,
    ['가주께.', '사본을 베끼는 손이 더딥니다.', '줄을 미리 긋고 먹을 갈아 두는 법을', '적어 별채에 걸어 두면 어떨지요.', '종이 한 권이면 됩니다.']],
  ['assign', '일 나누는 법', 200, 'sj', () => S.rArrived && (S.reportN || 0) >= 3,
    ['가주께.', '아침마다 누구에게 무엇을 읽힐지', '제가 먼저 나누어 두면', '가주께서 덜 번거로우실 것입니다.', '나누는 법을 적어 두겠습니다. 두 권이 듭니다.']],
  ['ledger', '치부(置簿)하는 법', 200, 'sj', () => S.rArrived && typeof oweTotal === 'function' && oweTotal() > 0,
    ['가주께.', '궤짝의 드나듦을 날마다 적어 두면', '녹봉을 제가 날짜 맞춰', '내드릴 수 있습니다.', '두 권이 듭니다.']],
  ['tea', '다경(茶經)', 200, 'ojr', () => arrived('ojr') && staffDiary('ojr').length >= 2,
    ['가주께.', '찻잎만으로는 안 되는 사람들이 있습니다.', '친정에 다경 한 권이 있었습니다.', '베껴 와도 되겠습니까.', '두 권이면 됩니다.']],
  // 소름 돋는 건의(테크트리 '누가 내미나'): 내밀면 안 되는 사람이 내밂 — 그만두고 떠난 사람, 없으면 여백의 붉은 글씨. 맡을 사람이 없어 허락하면 가주가 바로 적음
  ['margin', '여백 보는 눈', 500, 'none', () => !!marginFrom(), null],
  // 갔다 와야만 생기는 연구(발굴 설계 '보내는 이유와 돈', 선생님 10/7)
  ['tide', '물길 읽기', 300, 'sj', () => S.rArrived && !!(S.dig && S.dig.went && S.dig.went.yeoul),
    ['가주께.', '여울에서 물길이 갈라지는 데를 보았습니다.', '물때와 갈래를 적어 두면', '지도가 없어도 덜 헤맬 것입니다.', '세 권이 듭니다.']],
  ['liver', '간(肝)의 자리', 400, 'sj', () => S.rArrived && !!S.sideRead.dongui && !!(S.dig && S.dig.went && S.dig.went.cave),
    ['가주께.', '굴에 다녀온 이들은 떨지 않습니다.', '동의보감 간 장과 맞추어 보면', '겁을 셀 수 있을 것 같습니다.', '네 권이 듭니다.']],
];
const TECH_LAST = glyphs('서고 문을 닫는 법', 1313);                                    // 맨 끝의 낯선 제목(가주의 글씨, 적은 기억이 없음)
function marginFrom(){                                                                   // 여백 보는 눈을 내미는 이: 그만둔 지 이틀 지난 사람 → 없으면 여백 글씨를 셋 모은 뒤 붉은 글씨
  const q = genKeys().filter(k => S.st[k] && S.st[k].quit && S.st[k].quit > 1 && Date.now() - S.st[k].quit >= 2 * DAY_MS())[0];
  return q ? q : (S.margins || []).length >= 3 ? 'red' : null;
}
const techState = id => (S.techQ || {})[id];                                             // 'asked' 건의만 · 'work' 쓰는 중 · 'done'
const techBusy = k => !!S.techWork && S.techWork.who === k && !(typeof yeonOn === 'function' && yeonOn());   // 연구소가 있으면 연구 전용 책상에서 써서 읽기를 멈추지 않음(19_yeon)
const techSpeed = () => Object.entries(K.techSpd).reduce((m, [id, v]) => techOn(id) ? m * v : m, 1);   // 읽기 줄기: 넘기는 빠르기 배수(08 speedK)
const lostK = () => techOn('tide') ? K.techTide : 1;                                       // 19_gather·19_deep — 물길 읽기: 지도 없이 갔을 때 허탕이 덜함
const marginSeen = () => techOn('margin');                                               // 여백 보는 눈: 문진 없이도 여백 글씨가 흐리게 보임(아래 tick), 손 넘김마다 광기 조금(19_mad madTick)
const techMult = () => techOn('idu') ? K.techIdu : 1;                                    // 06 mult — 이두 읽는 법: 해독이 빨라짐

M.notebook = model(6, 7, 1, (x, y) => y === 0 ? '#3a2a1c' : x === 0 ? '#5a4030' : (y % 2 ? '#d9cdab' : '#cfc2a0'));
OBJ.push({ id:'notebook', x:-6, y:8, z:8, rot:-0.2, on:()=>'desk', onOrder:0.02, m:()=>'notebook', show:()=> !!S.owned.desk && !!S.owned.brush && !(typeof sarangOn === 'function' && sarangOn()), glow:()=> TECH.some(t => techState(t[0]) === 'asked' && !S.techSeen), click:()=>showTech() });

function techTick(dt){
  if (techOn('ledger') && !S.steward){ S.steward = true; save(); }                       // 치부하는 법: 녹봉이 날마다 저절로 나가고 윗줄에 돈(19_money의 청지기 자리)
  if (S.morningDay != null && S.morningDay !== S.reportSeen){ S.reportSeen = S.morningDay; S.reportN = (S.reportN || 0) + 1; }   // 아침 보고를 받은 날 수(19_manage)
  S.techQ = S.techQ || {};
  for (const [id, , , who, when, note] of TECH){
    if (!techState(id) && LINE.tech && LINE.tech[id]){ S.techQ[id] = 'done'; continue; }   // 앞 대가 이미 적은 것
    if (techState(id) || window.BOOTING || !when()) continue;
    S.techQ[id] = 'asked'; S.techSeen = false; save();
    if (id === 'margin'){ const m = marginFrom();
      pushNote('<h3>쪽지</h3>' + (m === 'red' ? `<div style="color:#6a2a16;font-style:italic">${vlet(['네가 읽는 동안 나도 보았다.', '문진이 없어도 보인다.', '눈을 조금만 빌려 주면.'], alienHtml(glyphs('시조', 1777)), 'min(40vh,280px)')}</div>`
        : '<div style="font-size:12px;opacity:.6;margin-bottom:6px">대문 틈에 끼어 있었다.</div>' + vlet(['가주께.', '집에 와서도 글자가 보입니다.', '눈을 감아도 보입니다.', '그 눈을 서고에 두고 왔으니', '찾아 쓰십시오.'], DEF(m).name + ' 올림.', 'min(44vh,320px)')));
    } else if (id === 'cheop') pushNote('<h3>쪽지</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">연구 공책 사이에 끼어 있었다.</div>' + `<div style="color:#6a2a16;font-style:italic">${vlet(['두 장을 한 번에 보아라.', '한 장은 네가, 한 장은 내가.', '쉰 권이면 된다.'], alienHtml(glyphs('시조', 1778)), 'min(40vh,280px)')}</div>`);
    else pushNote('<h3>쪽지</h3>' + vlet(note, (who === 'sj' ? '한서진' : DEF(who).name) + ' 올림.', 'min(48vh,340px)'));
    if (typeof tlog === 'function') tlog('건의: ' + id);
  }
  const w = S.techWork; if (!w) return;
  const k = w.who, on = k === 'sj' ? S.rArrived && !isNight() && !S.errs.sj : working(k) && !S.errs[k];
  if (on) w.acc = (w.acc || 0) + dt;
  if (w.acc >= w.need) techDone(w.id);
}
function techDone(id){
  S.techQ[id] = 'done'; S.tech = S.tech || {}; S.tech[id] = true; S.techWork = null; save();
  LINE.tech = LINE.tech || {}; LINE.tech[id] = true; saveLine();                       // 연구로 쓴 것은 대를 넘어 남음(신 1호 일정표 3절 '남는 것')
  if (typeof tlog === 'function') tlog('연구 끝: ' + id);
}
// 공책 그림(10/31 선생님 "연구를 그림으로"): 한서진이 공책 첫 장에 갈래를 그려 둠 — 줄기마다 제목이 먹선으로 이어짐. 다 쓴 것 ●, 건의가 온 것은 「허락한다」, 아직 모르는 칸은 낯선 글자
const TECH_LINE = [['읽기', ['idu', 'jajeon', 'gugyeol', 'cheop', 'margin']], ['사람', ['copy', 'assign', 'tea', 'hyang']], ['살림', ['ledger', 'eonhae', 'yakjo']], ['바다', ['tide', 'liver']]];
function techNode(id, i){
  const t = TECH.find(x => x[0] === id), st = techState(id), w = S.techWork, dot = c => `<span style="position:absolute;left:-17px;top:7px;width:9px;height:9px;border-radius:50%;${c}"></span>`;
  if (!st) return `<div style="position:relative;margin:9px 0;opacity:.35">${dot('border:1px solid #2a1a0e88')}${alienHtml(glyphs(t[1], 1400 + i))}</div>`;
  const tail = st === 'done' ? `<span style="font-size:12px;opacity:.6">${S.tech && S.tech[id] ? '' : '앞 대가 적은 것'}</span>`
    : st === 'work' ? `<span style="font-size:12px;opacity:.7">${w.who === 'sj' ? '한서진' : DEF(w.who).name}이 쓰는 중 — ${Math.floor(100 * (w.acc || 0) / w.need)}%</span>`
    : S.techWork ? '<span style="font-size:12px;opacity:.5">다른 것을 쓰는 중</span>' : `<span class="rec" data-tk="${id}" style="font-size:13px">허락한다 — ${fmtP(t[2])}</span>`;
  return `<div style="position:relative;margin:9px 0">${dot(st === 'done' ? 'background:#2a1a0e' : st === 'work' ? 'background:#2a1a0e66' : 'border:1px solid #2a1a0e')}<span>${t[1]}</span> ${tail}</div>`;
}
function showTech(){
  S.techSeen = true; save();
  const sp = techSpeed(), spT = sp > 1 ? `<div style="font-size:13px;margin-bottom:6px">이 공책대로 하면 넘기는 손이 처음보다 <b>${Math.round(sp * 100) / 100}배</b>.</div>` : '';
  openOv('<h3>연구 공책</h3><div style="font-size:12px;opacity:.6;margin-bottom:6px">가주가 적어 두는 공책. 첫 장에 한서진이 갈래를 그려 두었다.</div>' + spT
    + TECH_LINE.map(([nm, ids], g) => `<div style="margin-top:10px"><div style="font-size:12px;opacity:.55">${nm}</div><div style="margin-left:14px;padding-left:12px;border-left:2px solid #2a1a0e55">${ids.map((id, i) => techNode(id, g * 10 + i)).join('')}</div></div>`).join('')
    + `<div style="margin-top:14px;opacity:.55">${alienHtml(TECH_LAST)} <span style="font-size:12px">${alienHtml(glyphs('셀 수 없음', 1314))}</span></div>`
    + '<div style="font-size:12px;opacity:.55;margin-top:8px">맨 끝 줄은 내 글씨다. 적은 기억이 없다.</div>');
  ovBody.querySelectorAll('[data-tk]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); techStart(el.dataset.tk); }));
}
function techStart(id){
  const t = TECH.find(x => x[0] === id), cost = t[2], who = t[3];
  if (S.pages < cost) return openOv(`<h3>연구 공책</h3>쓸 수 있는 쪽이 모자란다. ${fmtP(cost)}은 있어야 한다.`);
  S.pages -= cost; S.techQ[id] = 'work';
  if (who === 'none' || (who === 'sj' && !S.rArrived)){ techDone(id); return showTech(); }   // 맡을 사람이 없으면 가주가 바로 적음
  S.techWork = { id, who, acc: 0, need: Math.sqrt(cost / 100) * K.techSecPer * (typeof yeonOn === 'function' && yeonOn() ? K.techYeon : 1) }; save();
  if (typeof tlog === 'function') tlog('연구 시작: ' + id);
  showTech();
}
// 간의 자리: 상태 창에 겁이 숫자로(앙부일구가 빠르기를 숫자로 만든 것처럼)
HOOK.ov.push(() => { if (!techOn('liver')) return; const h = ovBody.querySelector('h3'); const m = h && h.textContent.match(/^(?:연구원|반장) — (\S+)\(/); if (!m) return;
  const k = m[1] === '한서진' ? 'sj' : allKeys().find(j => S.st[j] && DEF(j).name === m[1]); if (!k) return;
  const f = k === 'sj' ? S.rFear || 0 : S.st[k].fear || 0, d = document.createElement('div'); d.style.cssText = 'font-size:12px;opacity:.7'; d.textContent = `간을 짚어 보니 겁이 ${Math.round(f * 100)}푼이다.`; h.after(d); });
// 맡은 사람의 창: 지금 쓰는 것
HOOK.ov.push(() => { const w = S.techWork; if (!w) return; const h = ovBody.querySelector('h3'); if (!h || !(w.who === 'sj' ? /^연구원 — 한서진/ : new RegExp('— ' + DEF(w.who).name + '\\(')).test(h.textContent)) return;
  const d = document.createElement('div'); d.style.cssText = 'font-size:12px;opacity:.7'; d.textContent = `연구 공책의 「${TECH.find(t => t[0] === w.id)[1]}」을 쓰고 있다. 그동안은 읽지 않는다.`; h.after(d); });

HOOK.tick.push(dt => { if (S.stage !== 'room' || S.ended) return; techTick(dt); if (marginSeen() && bookOpen) facesEl.querySelectorAll('.mg:not(.seen)').forEach(el => el.classList.add('seen')); });
