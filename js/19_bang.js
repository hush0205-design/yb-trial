'use strict';
// ───────── 방의 종류 (기획서 14-2 '받을 사람 고르기', 10/31) ─────────
// 붙어 있는 방을 누르면 「새로 써 붙인다」 — 해독으로 글자를 풀어 낱말 장부에 오른 문구만 쓸 수 있음(恐 → 겁 없는 이, 夜 → 밤일 할 이, 手 → 글씨 빠른 이).
// 조건을 붙이면 그 방에 맞는 사람만 오고(12_lab genDef), 다음 지원자가 더디 옴(K.bangWait). 그냥 방으로 되돌릴 수도 있음.
const BANG = {
  plain:    { name:'그냥 방',          line:'밤낮을 가리지 않음.', ok: () => true },
  fearless: { name:'겁 없는 이를 구함',   line:'겁 없는 이를 구함.',   ch:'恐', ok: t => t.fearK <= 0.8 },
  night:    { name:'밤일 할 이를 구함',   line:'밤일 할 이를 구함.',   ch:'夜', ok: t => !!t.night },
  fast:     { name:'글씨 빠른 이를 구함', line:'글씨 빠른 이를 구함.', ch:'手', ok: t => t.sec <= 4 },
};
const glKnows = ch => [...S.gl.org, ...S.gl.look].some(k => k.includes(ch));
const bangOpen = () => Object.keys(BANG).filter(id => !BANG[id].ch || glKnows(BANG[id].ch));
const bangLine = () => (BANG[S.bangKind] || BANG.plain).line;
const bangWait = () => (S.bangKind && S.bangKind !== 'plain' ? K.bangWait : 1) * (S.rumor === 'good' ? K.rumorGood : S.rumor === 'bad' ? K.rumorBad : 1);   // 조건 붙은 방 · 장터 소문(아래)
// 겁 없는 이 방을 보고 온 사람 가운데 몇은 간땡이가 부은 사람(기획서 3-1절): 겁이 아예 안 참 → 손은 가장 빠르나 광기에 브레이크가 없음(19_mad brakeK). 「아무것도 무섭지 않습니다」 지원서
const bangLiver = k => !!(S.st[k] && S.st[k].kind === 'fearless' && hash(+k.slice(1), 41) < K.bangLiver);
const bangPool = k => { const kind = S.st[k] && S.st[k].kind; if (!kind) return G_TRAIT; if (bangLiver(k)) return G_TRAIT.slice(-1); return G_TRAIT.filter(t => (BANG[kind] || BANG.plain).ok(t)); };
HOOK.ov.push(() => {
  if (!document.getElementById('bUnpost')) return;
  if (bangWorn()){ const v = ovBody.querySelector('.vletter'); if (v) v.style.filter = 'blur(0.6px)'; }   // 낡은 방: 글씨가 번짐
  if (bangOpen().length < 2 && !bangWorn()) return;
  const d = document.createElement('div'); d.style.cssText = 'margin-top:12px;font-size:13px';
  d.innerHTML = '<div style="opacity:.7;text-align:center;margin-bottom:4px">새로 써 붙인다</div>' + bangOpen().map(id => `<div class="rec brow${(S.bangKind || 'plain') === id ? ' on' : ''}" data-bk="${id}"><span class="bdot">${(S.bangKind || 'plain') === id ? '●' : '○'}</span><span class="bt">${BANG[id].name}</span></div>`).join('');
  document.getElementById('bUnpost').parentNode.after(d);
  d.querySelectorAll('[data-bk]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); if ((S.bangKind || 'plain') === el.dataset.bk && !bangWorn()) return;
    S.bangKind = el.dataset.bk; S.bangNewAt = Date.now(); save(); ov.classList.add('hidden'); noise(0.25, 900, 0.06);
    if (typeof tlog === 'function') tlog('방을 새로 씀: ' + BANG[S.bangKind].name); }));
});

// 오염(기획서 14-2): 가주 광기가 K.bangRotMad 단계에 닿은 다음 날 아침부터 방 첫 줄이 "글 읽을 것을 구함". 그 뒤에 온 지원서는 사람이 쓴 것 같지 않음(글자 사이사이가 낯선 글자).
const bangRot = () => S.bangRotDay != null && dayKey() > S.bangRotDay;
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended || !S.bangAt) return;
  if (S.bangRotDay == null && myMad() >= K.bangRotMad){ S.bangRotDay = dayKey(); save(); }
  if (bangRot() && !S.bangRotAt){ S.bangRotAt = Date.now(); save(); } });   // 이때부터 온 지원서가 오염
HOOK.ov.push(() => {
  const h = ovBody.querySelector('h3'), k = curApplicant(); if (!h || !h.textContent.startsWith('지원서 —') || !k || !bangRot() || !(S.st[k].at >= S.bangRotAt)) return;
  const v = ovBody.querySelector('.vletter'); if (!v) return;
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT), nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach((n, j) => { const span = document.createElement('span'); span.innerHTML = Array.from(n.nodeValue).map((ch, i) => /[가-힣]/.test(ch) && hash(i + j * 31, +k.slice(1)) < 0.25 ? agSpan(glyphs(ch, i + j)[0], i) : esc(ch)).join(''); n.replaceWith(span); });
});

// 낡은 방(기획서 14-2): 붙이거나 새로 쓴 지 K.bangOld일이 지나면 글씨가 번짐 → 그동안 온 지원자는 지원서의 이름 한 글자가 낯선 글자. 새로 써 붙이면 다시 깨끗함.
const bangWorn = () => !!S.bangAt && !S.bangOff && Date.now() - (S.bangNewAt || S.bangAt) > K.bangOld * DAY_MS();
HOOK.tick.push(() => { const k = S.stage === 'room' && curApplicant(); if (!k || !isGen(k) || S.st[k].wornChk) return; S.st[k].wornChk = true; S.st[k].worn = bangWorn(); save(); });
HOOK.ov.push(() => {
  const h = ovBody.querySelector('h3'), k = curApplicant(); if (!h || !h.textContent.startsWith('지원서 —') || !k || !S.st[k].worn) return;
  const nm = DEF(k).name, odd = esc(nm[0]) + agSpan(glyphs(nm[1], +k.slice(1))[0], 1) + esc(nm.slice(2));
  for (const root of [h, ovBody.querySelector('.vletter')]){ if (!root) continue;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = []; while (w.nextNode()) if (w.currentNode.nodeValue.includes(nm)) nodes.push(w.currentNode);
    for (const n of nodes){ const span = document.createElement('span'); span.innerHTML = n.nodeValue.split(nm).map(esc).join(odd); n.replaceWith(span); } }
});

// 장터 소문(기획서 14-4 ⑤): 방이 붙어 있으면 하루에 한 번 소문이 돎 — 지난 하루 사이 떠난 사람이 있으면 나쁜 소문, 녹봉이 하나도 안 밀리고 별채에 사람이 있으면 좋은 소문.
// 숫자는 안 보이고 문갑(둘째 서랍)에 들은 말로만. 좋은 소문이면 다음 지원자가 빨리, 나쁜 소문이면 더디(bangWait). 떠난 사람 넷의 「아무도 오지 않다」 징조(19_rebirth)와는 따로.
const RUMOR = { good:['그 집은 밥은 준다더라.', '그 집은 녹봉이 하루도 안 밀린다더라.', '그 집 서고 일은 고되도 셈은 바르다더라.'],
  bad:['그 집은 녹봉을 안 준다더라.', '그 집 서고에 들어갔던 사람이 짐을 싸서 나오더라.', '그 집 별채는 사람이 자꾸 바뀐다더라.'] };
function rumorTick(){
  if (!S.bangAt || S.bangOff || S.rumorDay === dayKey()) return;
  if (S.rumorDay == null){ S.rumorDay = dayKey(); save(); return; }                          // 방을 붙인 날은 소문이 아직
  S.rumorDay = dayKey();
  const left = genKeys().some(k => S.st[k] && S.st[k].quit && Date.now() - S.st[k].quit < DAY_MS());
  const paid = payees().every(k => !oweDays(k)) && genKeys().some(k => S.st[k] && S.st[k].arr && !S.st[k].gone);
  S.rumor = left ? 'bad' : paid ? 'good' : null;
  if (S.rumor){ const L = RUMOR[S.rumor]; S.rumors = (S.rumors || []).concat([L[hash(dayKey(), 17) * L.length | 0]]).slice(-12); }
  save();
}
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return; rumorTick(); });
function rumorRecs(recs){ if ((S.rumors || []).length) recs.push(['방(榜) 앞에서 들은 말', () => '<h3>방 앞에서 들은 말</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">대문 앞을 지나던 사람들이 방을 보며 하던 말.</div>' + S.rumors.slice().reverse().map(t => `<div style="margin:6px 0">「${esc(t)}」</div>`).join('')]); }
