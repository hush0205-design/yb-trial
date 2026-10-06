'use strict';
// ───────── 첫 책 문장 ─────────
function buildLines(){
  const s = S.sur || '윤', h = hanjaOf(s), bon = S.bon || '파평', nm = genName(17) || S.name || '서하';
  const n18 = genName(18), n19 = genName(19), n20 = genName(20), sp = n => n ? ' ' + n : ' 　　';   // 둘째 대부터: 빈 이름 칸에 그 대 가주의 이름이 들어가 있음(끝 문구는 그대로 — 어떻게 끝나든 그렇게 읽힘)
  const L = [
    { idu:`${h}氏 家門 書庫良中 藏置爲乎 冊 數爻乙 後錄爲白齊`, old:`${s}시 가문 셔고애 갈ᄆᆞ 둔 ᄎᆡᆨ 수ᄅᆞᆯ 뒤헤 젹ᄂᆞ니라`, mod:`${s}씨 가문 서고에 갈무리해 둔 책의 수를 뒤에 적는다.` },
    { idu:'小學 一卷 前張是 落去爲齊', old:'쇼ᄒᆞᆨ ᄒᆞᆫ 권. 앏 쟝이 ᄠᅥ러뎌 나감.', mod:'소학 한 권. 앞 장이 떨어져 나감.' },
    { idu:'農家集成 二卷', old:'농가집셩 두 권.', mod:'농가집성 두 권.' },
    { idu:'東醫寶鑑 雜病篇 三卷 肝乙 論爲在 張良中 手垢多齊', old:'동의보감 잡병편 세 권. 간ᄋᆞᆯ 다론 쟝애 손ᄣᅢ 만ᄒᆞᆷ.', mod:'동의보감 잡병편 세 권. 간(肝)을 다룬 장에 손때가 많음.' },
    { idu:'時調 一束 誰矣 編爲乎喩 不知齊', old:'시됴 무금 ᄒᆞᆫ 권. 뉘 엮건디 모ᄅᆞᆷ.', mod:'시조 묶음 한 권. 누가 엮었는지 모름.' },
    { idu:'地圖 一張 海邊 半是 空爲齊', old:'디도 ᄒᆞᆫ 쟝. 바ᄅᆞᆯ 녁 반이 뷔여 이숌.', mod:'지도 한 장. 바다 쪽 절반이 비어 있음.' },
    { idu:'無題冊 一卷 櫃中', old:'뎨목 업슨 ᄎᆡᆨ ᄒᆞᆫ 권. 궤ᄶᆞᆨ 안.', mod:'제목 없는 책 한 권. 궤짝 안.' },
    { idu:'都合 十三卷', old:'모도 열세 권.', mod:'모두 열세 권.' },
    { idu:'夜良中 此冊乙 越爲在 者隱', old:'밤의 이 ᄎᆡᆨ을 넘기ᄂᆞᆫ 이ᄂᆞᆫ', mod:'밤에 이 책을 넘기는 이는' },
    { idu:'先只 茶乙 煎爲乎事', old:'몬져 차ᄅᆞᆯ 글힐 것.', mod:'먼저 차를 끓일 것.' },
    { idu:'手是 戰慄爲去等 冊乙 覆爲乎事', old:'손이 ᄯᅥᆯ리거든 ᄎᆡᆨ을 더플 것.', mod:'손이 떨리거든 책을 덮을 것.' },
    // ── 족보 ──
    { idu:`${h}氏 世系`, old:`${bon} ${s}시 셰계`, mod:`${bon} ${s}씨 세계(世系)` },
    { idu:'一世 ▒▒▒ 此書庫乙 創建爲齊', old:'一世 ▒▒▒ 이 셔고ᄅᆞᆯ 셰오다', mod:'1세. ▒▒▒ — 이 서고를 세우다.' },
    { idu:`二世 ${h}文學 讀書爲齊`, old:`二世 ${s}문학 글을 닑다`, mod:`2세. ${s}문학 — 글을 읽다.` },
    { idu:`三世 ${h}瑞道 讀書爲齊`, old:`三世 ${s}셔도 글을 닑다`, mod:`3세. ${s}서도 — 글을 읽다.` },
    { idu:'自四世 至十二世 皆 讀書爲齊', old:'四世브터 十二世ᄭᆞ지 다 글을 닑다', mod:'4세부터 12세까지, 모두 글을 읽다.' },
    { idu:`十三世 ${h}守津 書庫門乙 閉爲遣 去爲齊`, old:`十三世 ${s}슈진 셔고 門을 닫고 가다`, mod:`13세. ${s}수진 — 서고 문을 닫고 떠나다.` },   // 정본: 마지막 장 앞에서 멈추고 바다로 사라짐
    { idu:'十四世 ━━━ 十五世 ━━━ 十六世 ━━━', old:'十四世 ━━━ 十五世 ━━━ 十六世 ━━━', mod:'14세 ━━━ 15세 ━━━ 16세 ━━━' },   // 먹줄이 그어진 세 대(서고가 버려진 동안)
    { idu:`十七世 ${h}${nm} 櫃乙 開爲齊`, old:`十七世 ${s}${nm} 궤ᄶᆞᆨ을 열다`, mod:`17세. ${s}${nm} — 궤짝을 열다.` },
    { idu:`十八世${n18 ? ' ' + h + n18 : ' 　　'} 水邊良中`, old:`十八世${n18 ? ' ' + s + n18 : ' 　　'} 믈ᄀᆞ애셔`, mod:`18세.${n18 ? ' ' + s + n18 : ' 　　'} — 물가에서.` },
    { idu:`十九世${n19 ? ' ' + h + n19 : ' 　　'} 門乙 鎖爲遣 不出爲齊`, old:`十九世${n19 ? ' ' + s + n19 : ' 　　'} 門을 ᄌᆞᆷ고고 나디 아니ᄒᆞ다`, mod:`19세.${n19 ? ' ' + s + n19 : ' 　　'} — 문을 잠그고 나오지 않다.` },
    { idu:`二十世${n20 ? ' ' + h + n20 : ''}`, old:`二十世${n20 ? ' ' + s + n20 : ''}`, mod:`20세.${sp(n20 && s + n20)} —` },
  ];
  return L.map((l,i) => {
    const g = glyphs(l.mod, i+7), v = [g];
    if (i === 0) v.push(h + Array.from(g).slice(Array.from(h).length).join(''));   // 처음 풀리는 글자 = 성씨
    v.push(l.idu, l.old, l.mod);
    return v;
  });
}
let LINES = buildLines();
// 동의보감 三: 한문 줄은 처음부터 보이지만 풀이와 덧쓴 붉은 글씨는 넘기며 풀어야 함
const DONGUI_SRC = [
  { h:'肝者 將軍之官 謀慮出焉', k:'간은 장군의 벼슬이니, 꾀가 여기서 나온다.' },
  { h:'肝藏魂', k:'간은 혼(魂)을 갈무리한다.' },
  { h:'肝開竅於目', k:'간은 눈으로 구멍이 열린다.' },
  { h:'肝氣虛則恐', k:'간의 기운이 허하면 두려워하고,' },
  { h:'實則怒', k:'차면 성낸다.' },
  { note:'두려움이 없는 자는 간이 없는 자다.' },
  { note:'보지 않으면 두렵지 않다.<br>그러나 보지 않으면 읽을 수 없다.' },
  { note:'바다에서 돌아온 이는 겁이 없었다.<br>간을 어디 두고 왔느냐 물으니 웃기만 하였다.' },
];
const DLINES = (() => { const L = []; DONGUI_SRC.forEach((p,i) => {
  if (p.h){ L.push([p.h, p.h]); L.push([glyphs(p.k, 300+i), p.k]); }
  else { const t = p.note.replace(/<br>/g, ' '); L.push(['', glyphs(t, 320+i), t]); }
}); return L; })();
const PER = 60;
const BF = { id:'first',  L:()=>LINES,  start:i => lineStart(i), per:60, D:()=>S.D };
const BD = { id:'dongui', L:()=>DLINES, start:i => i*15, per:25, D:()=>S.dD||0 };
const curB = () => S.curBook === 'dongui' ? BD : BF;
const ITEMS = ['first', 'dongui', 'map'];
const INAME = { first:'제목 없는 책', dongui:'동의보감 三', map:'지도' };
function ensureLoc(){
  if (S.loc) return;
  S.loc = { first: S.owned.desk ? 'desk' : 'desk', dongui: 'shelf', map: S.mapFound ? 'shelf' : null };
  if (S.curBook === 'dongui') { S.loc.dongui = 'desk'; S.loc.first = 'shelf'; }
}
const itemAt = where => ITEMS.find(k => S.loc && S.loc[k] === where) || null;
const itemModel = id => id === 'map' ? 'mapFold' : (id === 'dongui' || id === 'c_dongui') ? 'bookDongui' : 'bookFirst';
const dropAt = {};
function dropZ(where){ const e = (performance.now() - (dropAt[where] || -1e9)) / 420; return e >= 1 ? 0 : Math.pow(1 - e, 2) * 16; }   // 위에서 내려앉는 높이
function placeItem(id, where){                        // 놓던 자리에 다른 것이 있으면 책장으로 돌려놓음
  if (where === 'desk' || where === 'rdesk'){ dropAt[where] = performance.now(); setTimeout(() => noise(0.18, 150, 0.35, 'lowpass'), 400); }
  const prev = itemAt(where); if (prev && prev !== id) S.loc[prev] = 'shelf';
  S.loc[id] = where; save();
}
const bDone = (b, i) => b.start(i) + (b.L()[i].length-1)*b.per;
const J0 = 1400;
const lineStart = i => i < 8 ? i*70 : i < 11 ? 780 + (i-8)*70 : J0 + (i-11)*140;
const lineDone  = i => lineStart(i) + (LINES[i].length-1)*PER;
const T = { door: lineDone(7), fearOn: lineDone(8), tea: lineDone(9), glitch: 1150, letter: 1300, fearPage: 700, jEnd: lineDone(21) };
function mix(a, b, f, seed){ const A = Array.from(a), B = Array.from(b), n = Math.max(A.length, B.length); let o = ''; for (let k=0;k<n;k++) o += hash(seed,k) < f ? (B[k]||'') : (A[k]||''); return o; }
function lineText(i, Dv, b = BF){
  const D = Dv === undefined ? b.D() : Dv, v = b.L()[i], p = Math.max(0, Math.min(v.length-1, (D - b.start(i))/b.per));
  const s = Math.floor(p); if (s >= v.length-1) return v[v.length-1];
  return mix(v[s], v[s+1], p - s, i*131 + (b === BD ? 7 : 0));
}
// 띄어쓰기는 해독이 끝난 줄에만 생김(옛 글은 붙여 씀)
function showText(i, Dv, b = BF){ const D = Dv === undefined ? b.D() : Dv; const t = lineText(i, D, b); return D >= bDone(b, i) ? t : t.replace(/\s+/g, ''); }

