'use strict';
// ───────── 글자 풀이·낱말 장부 ─────────
// 기록 창의 한자와 어려운 낱말을 누르면 작은 풀이 쪽지가 뜸. 눌러 본 것과 마주친 낱말은 문갑 '낱말 장부'에 모임.
// 한서진이 온 뒤로는 일지가 한 편 늘 때마다 그동안 마주친 낱말을 정리해 둠.

// 글자 하나: '훈 음' (음은 마지막 낱말)
const HANJA = {
  一:'한 일', 二:'두 이', 三:'석 삼', 四:'넉 사', 六:'여섯 륙', 七:'일곱 칠', 八:'여덟 팔', 九:'아홉 구', 十:'열 십',
  不:'아닐 불', 世:'인간 세 · 대 세', 中:'가운데 중', 之:'갈 지', 乎:'어조사 호', 乙:'새 을', 事:'일 사', 仰:'우러를 앙', 先:'먼저 선',
  冊:'책 책', 出:'날 출', 則:'곧 즉', 前:'앞 전', 創:'비롯할 창', 半:'반 반', 卷:'책 권', 去:'갈 거', 只:'다만 지', 合:'합할 합',
  喩:'깨우칠 유', 圖:'그림 도', 在:'있을 재', 地:'땅 지', 垢:'때 구', 多:'많을 다', 夜:'밤 야', 姓:'성 성', 學:'배울 학', 官:'벼슬 관',
  家:'집 가', 實:'열매 실', 寶:'보배 보', 將:'장수 장', 小:'작을 소', 峴:'고개 현', 巖:'바위 암', 庫:'곳집 고', 建:'세울 건', 張:'베풀 장',
  後:'뒤 후', 怒:'성낼 노', 恐:'두려울 공', 慄:'떨릴 률', 慮:'생각할 려', 成:'이룰 성', 戰:'싸울 전', 手:'손 수', 數:'셈 수', 文:'글월 문',
  族:'겨레 족', 日:'날 일', 是:'이 시 · 옳을 시', 時:'때 시', 晶:'맑을 정', 晷:'해그림자 구', 書:'글 서', 束:'묶을 속', 東:'동녘 동', 櫃:'함 궤',
  此:'이 차', 氏:'성씨 씨', 氣:'기운 기', 水:'물 수', 浦:'개 포', 海:'바다 해', 焉:'어찌 언', 無:'없을 무', 煎:'달일 전', 爲:'할 위',
  爻:'사귈 효', 瑞:'상서 서', 病:'병 병', 白:'흰 백', 皆:'다 개', 眞:'참 진', 矣:'어조사 의', 知:'알 지', 空:'빌 공', 窟:'굴 굴',
  等:'무리 등', 篇:'책 편', 系:'맬 계', 編:'엮을 편', 置:'둘 치', 者:'놈 자', 肝:'간 간', 自:'스스로 자', 至:'이를 지', 良:'어질 량',
  茶:'차 다', 落:'떨어질 락', 葛:'칡 갈', 藏:'감출 장', 虛:'빌 허', 覆:'덮을 부 · 다시 복', 訓:'가르칠 훈', 誰:'누구 수', 調:'고를 조', 論:'논할 론',
  謀:'꾀 모', 譜:'족보 보', 讀:'읽을 독', 越:'넘을 월', 軍:'군사 군', 農:'농사 농', 道:'길 도', 遣:'보낼 견', 邊:'가 변', 都:'도읍 도',
  醫:'의원 의', 釜:'가마 부', 錄:'기록할 록', 鎖:'쇠사슬 쇄', 鎭:'누를 진', 鑑:'거울 감', 門:'문 문', 開:'열 개', 隱:'숨을 은', 集:'모을 집',
  雜:'섞일 잡', 韓:'나라 한', 項:'목 항', 頭:'머리 두', 題:'제목 제', 魂:'넋 혼', 鹽:'소금 염', 齊:'가지런할 제',
  德:'큰 덕', 洙:'물가 수', 萬:'일만 만', 福:'복 복', 基:'터 기', 男:'사내 남', 永:'길 영', 吉:'길할 길', 春:'봄 춘', 甫:'클 보', 致:'이를 치', 奎:'별 규', 相:'서로 상', 烈:'매울 렬', 玉:'구슬 옥', 鳳:'봉새 봉', 伊:'저 이', 順:'순할 순', 莫:'없을 막', 禮:'예도 례', 任:'맡길 임',
  守:'지킬 수', 津:'나루 진', 閉:'닫을 폐', 竅:'구멍 규', 於:'어조사 어', 目:'눈 목',
  榜:'방 붙일 방', 徐:'천천할 서', 明:'밝을 명', 雨:'비 우', 吳:'나라 오', 貞:'곧을 정', 林:'수풀 림',
};
// 한자 덩어리: m = 뜻, n = 덧붙임(이두 토 등), idu = 이두가 섞여 음을 읽지 않음
const HRUN = {
  家門:{ m:'한 집안' }, 書庫:{ m:'책을 모아 두는 곳' },
  書庫良中:{ m:'서고에', n:'良中 — 이두(吏讀)로 ‘-에’', idu:1 }, 藏置爲乎:{ m:'간직해 둔', n:'爲乎 — 이두로 ‘하온’', idu:1 },
  數爻乙:{ m:'수효를', n:'乙 — 이두로 ‘-을/-를’', idu:1 }, 後錄爲白齊:{ m:'뒤에 적사옵니다', n:'爲白齊 — 이두로 ‘하옵니다’', idu:1 },
  小學:{ m:'아이들에게 예절과 몸가짐을 가르치던 책' }, 前張是:{ m:'앞 장이', n:'是 — 이두로 ‘-이’', idu:1 }, 落去爲齊:{ m:'떨어져 나갔다', n:'爲齊 — 이두로 ‘하다’', idu:1 },
  農家集成:{ m:'조선 때 엮은 농사 책' }, 東醫寶鑑:{ m:'허준이 엮은 의학 책' }, 雜病篇:{ m:'여러 가지 병을 다룬 편' },
  肝乙:{ m:'간을', idu:1 }, 論爲在:{ m:'논한', n:'爲在 — 이두로 ‘한’', idu:1 }, 張良中:{ m:'장에', idu:1 }, 手垢多齊:{ m:'손때가 많다', idu:1 },
  時調:{ m:'우리 옛 노래로 부르던 짧은 시' }, 一束:{ m:'한 묶음' }, 誰矣:{ m:'누구의', n:'矣 — 이두로 ‘-의’', idu:1 },
  編爲乎喩:{ m:'엮은 것인지', n:'爲乎喩 — 이두로 ‘하온지’', idu:1 }, 不知齊:{ m:'알지 못한다', idu:1 }, 地圖:{ m:'땅의 모양을 그린 그림' },
  一張:{ m:'한 장' }, 海邊:{ m:'바닷가' }, 半是:{ m:'반이', idu:1 }, 空爲齊:{ m:'비어 있다', idu:1 }, 無題冊:{ m:'제목 없는 책' },
  櫃中:{ m:'궤짝 안' }, 都合:{ m:'모두 합하여' }, 夜良中:{ m:'밤에', idu:1 }, 此冊乙:{ m:'이 책을', idu:1 }, 越爲在:{ m:'넘긴', idu:1 },
  者隱:{ m:'사람은', n:'隱 — 이두로 ‘-은/-는’', idu:1 }, 先只:{ m:'먼저', n:'只 — 이두로 받침 ‘ㄱ’', idu:1 }, 茶乙:{ m:'차를', idu:1 },
  煎爲乎事:{ m:'달일 것', n:'爲乎事 — 이두로 ‘할 일’', idu:1 }, 手是:{ m:'손이', idu:1 }, 戰慄爲去等:{ m:'떨리거든', n:'爲去等 — 이두로 ‘하거든’', idu:1 },
  冊乙:{ m:'책을', idu:1 }, 覆爲乎事:{ m:'덮을 것', idu:1 }, 世系:{ m:'집안의 대를 이어 온 차례' }, 此書庫乙:{ m:'이 서고를', idu:1 },
  創建爲齊:{ m:'처음 세웠다', idu:1 }, 文學:{ m:'글과 학문' }, 讀書爲齊:{ m:'책을 읽었다', idu:1 }, 瑞道:{ m:'사람 이름' }, 皆:{ m:'모두' },
  櫃乙:{ m:'궤짝을', idu:1 }, 開爲齊:{ m:'열었다', idu:1 }, 水邊良中:{ m:'물가에서', idu:1 }, 門乙:{ m:'문을', idu:1 },
  鎖爲遣:{ m:'잠그고', n:'爲遣 — 이두로 ‘하고’', idu:1 }, 不出爲齊:{ m:'나오지 않았다', idu:1 },
  肝者:{ m:'간이라는 것은' }, 將軍之官:{ m:'장군의 벼슬' }, 謀慮出焉:{ m:'꾀와 생각이 여기서 나온다' }, 肝藏魂:{ m:'간은 혼을 갈무리한다' },
  肝氣虛則恐:{ m:'간의 기운이 허하면 두려워한다' }, 肝開竅於目:{ m:'간은 눈으로 구멍이 열린다' },
  書庫門乙:{ m:'서고 문을', idu:1 }, 閉爲遣:{ m:'닫고', n:'爲遣 — 이두로 ‘하고’', idu:1 }, 去爲齊:{ m:'떠났다', idu:1 }, 實則怒:{ m:'(기운이) 차면 성낸다' },
  葛頭浦:{ m:'바닷가 마을 이름' }, 鹽峴:{ m:'소금 고개 — 마을 이름' }, 巖項:{ m:'바위 목 — 마을 이름' }, 韓瑞眞:{ m:'연구원 한서진의 이름' },
  仰釜日晷:{ m:'솥을 엎어 놓은 모양의 해시계' }, 水晶文鎭:{ m:'종이를 눌러 두는 문진. 가운데 수정이 돋보기 구실을 한다' },
  榜:{ m:'여러 사람에게 알리려고 써 붙이는 글' }, 徐明雨:{ m:'연구원 서명우의 이름' }, 吳貞林:{ m:'연구원 오정림의 이름' },
  家訓:{ m:'집안의 가르침' }, 族譜:{ m:'한 집안의 대를 적은 책' }, 姓:{ m:'성' }, 窟:{ m:'바닷가 바위에 뚫린 굴' },
};
const NUM = { 一:1, 二:2, 三:3, 四:4, 五:5, 六:6, 七:7, 八:8, 九:9 };
const hanNum = s => { let n = 0, cur = 0; for (const c of s){ if (c === '十'){ n += (cur || 1)*10; cur = 0; } else cur = NUM[c]; } return n + cur; };
// 한글 낱말: 처음 나온 자리에만 밑줄
const WORDS = {
  가주:'家主. 한 집안을 이끄는 주인. 여기서는 당신.', 가문:'家門. 한 조상에서 이어진 집안.', 가훈:'家訓. 집안 사람들이 지키도록 내려온 가르침.',
  서고:'書庫. 책을 모아 두는 곳.', 장부:'帳簿. 물건이나 돈이 드나든 것을 적어 두는 책.', 족보:'族譜. 한 집안의 대를 차례로 적은 책.',
  세손:'世孫. 시조로부터 몇 대째 자손인지를 이르는 말. 17세손 = 열일곱째 대 자손.', 해독:'解讀. 읽기 어려운 글이나 암호를 풀어 읽음.',
  서안:'書案. 책을 올려 놓고 읽거나 글을 쓰는 낮은 책상.', 궤짝:'櫃. 물건을 넣어 두는 네모난 나무 상자.', 등잔:'燈盞. 기름을 담아 심지에 불을 붙이는 그릇.',
  벼루:'먹을 가는 데 쓰는 돌.', 붓걸이:'붓을 걸어 두는 틀.', 문진:'文鎭. 종이가 움직이지 않게 눌러 두는 물건.',
  앙부일구:'仰釜日晷. 솥을 엎어 놓은 모양의 해시계. 세종 때 만들었다.', 창호지:'窓戶紙. 문이나 창에 바르는 얇은 한지.',
  동의보감:'東醫寶鑑. 허준이 엮은 조선의 의학 책.', 잡병편:'雜病篇. 동의보감에서 여러 가지 병을 다룬 편.', 농가집성:'農家集成. 조선 때 엮은 농사 책.',
  소학:'小學. 아이들에게 예절과 몸가짐을 가르치던 책.', 시조:'時調. 우리 옛 노래로 부르던 짧은 시.',
  갈무리:'물건을 잘 정리해 간수함.', 허하:'虛하다. 기운이 모자라 텅 빈 듯하다.', 손때:'손으로 오래 만져서 묻은 때.',
  안감:'상자나 옷의 안쪽에 대는 천.', 여울:'바다나 강에서 바닥이 얕아 물살이 세게 흐르는 곳.', 봉함:'封緘. 편지 봉투를 붙여 봉함. 또는 그 자리에 찍은 표.',
  덧쓴:'덧쓰다. 이미 쓴 글자 위나 옆에 겹쳐 쓰다.', 도포:'道袍. 선비가 입던 넓은 소매의 겉옷.', 세조대:'細條帶. 도포 위에 매던 가는 띠.',
  관측사:'觀測士. 해·달·별을 살펴 그 자리를 적는 사람.', 다원지기:'茶園지기. 차밭을 가꾸고 차를 끓이는 사람.', 별채:'別채. 몸채와 따로 떨어져 있는 집채.',
  명부:'名簿. 사람의 이름을 적어 둔 장부.', 이경:'二更. 밤을 다섯으로 나눈 둘째 때. 밤 9시~11시쯤.', 삼경:'三更. 밤 11시~새벽 1시쯤. 한밤중.', 사본:'寫本. 원래 책을 베껴 쓴 책.',
  망건:'網巾. 상투를 틀 때 머리카락을 걷어 올려 이마에 두르던 띠.',
};
const HAN_RE = /[一-鿿]+/g;
const WORD_RE = new RegExp(Object.keys(WORDS).sort((a, b) => b.length - a.length).join('|'), 'g');
const SUR_REV = {}; for (const [k, v] of Object.entries(HJ)) SUR_REV[v] = SUR_REV[v] || k;

S.gl = Object.assign({ seen:[], look:[], org:[], dc:0, fresh:0 }, S.gl);
const hanSay = c => HANJA[c] || (SUR_REV[c] ? '성씨 ' + SUR_REV[c] : '');
const hanEum = c => { const h = hanSay(c); return h ? h.split(' · ')[0].split(' ').pop() : c; };
function runInfo(run){
  const r = HRUN[run];
  if (r) return r;
  const m = run.match(/^(自|至)?([一二三四五六七八九十]+)世$/);
  if (m){ const n = hanNum(m[2]); return { m: n === 1 ? '1세 — 집안을 연 첫 조상' : `${n}세 — ${n}대째 자손` + (m[1] === '自' ? '부터' : m[1] === '至' ? '까지' : '') }; }
  return null;
}
const keyOf = el => el.dataset.gw ? 'w:' + el.dataset.gw : 'h:' + el.dataset.gh;
function tipHtml(key){
  const [t, v] = [key.slice(0, 1), key.slice(2)];
  if (t === 'w') return `<b>${esc(v)}</b> — ${esc(WORDS[v])}`;
  const r = runInfo(v), chars = Array.from(v);
  let h = `<b>${v}</b>` + (r && !r.idu && chars.length > 1 ? ` (${chars.map(hanEum).join('')})` : '') + (r ? ` — ${esc(r.m)}` : '');
  if (r && r.n) h += `<div class="glN">${esc(r.n)}</div>`;
  h += '<div class="glC">' + chars.map(c => `${c} <span>${esc(hanSay(c) || '…')}</span>`).join('<br>') + '</div>';
  return h;
}
const glSeen = key => { if (!S.gl.seen.includes(key)) S.gl.seen.push(key); };
// 기록 창 내용에 풀이 표시를 입힘
function glossify(root){
  const used = new Set(), walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement.closest('button, .close, .ag, #sideP, .glw, .spine, [data-i], .jmp, .opt, #glTip, pre') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes){
    const s = n.nodeValue, hits = [];
    for (const m of s.matchAll(HAN_RE)) hits.push({ i:m.index, l:m[0].length, h:m[0] });
    for (const m of s.matchAll(WORD_RE)) if (!used.has(m[0])){ used.add(m[0]); hits.push({ i:m.index, l:m[0].length, w:m[0] }); }
    if (!hits.length) continue;
    hits.sort((a, b) => a.i - b.i);
    const f = document.createDocumentFragment(); let p = 0;
    for (const x of hits){
      if (x.i < p) continue;
      f.append(s.slice(p, x.i));
      const sp = document.createElement('span'); sp.className = 'glw'; sp.textContent = s.substr(x.i, x.l);
      if (x.w) sp.dataset.gw = x.w; else sp.dataset.gh = x.h;
      f.append(sp); p = x.i + x.l;
      if (x.w || runInfo(x.h)) glSeen(keyOf(sp));
    }
    f.append(s.slice(p)); n.replaceWith(f);
  }
  save();
}
const glTip = document.createElement('div'); glTip.id = 'glTip'; glTip.className = 'hidden'; ov.appendChild(glTip);
// 풀이 쪽지가 떠 있으면 다른 곳을 눌러도 쪽지만 접힘(기록 창은 그대로)
ov.addEventListener('click', e => {
  const g = e.target.closest('.glw');
  if (g){
    e.stopPropagation(); e.preventDefault();
    const key = keyOf(g); if (!S.gl.look.includes(key)) S.gl.look.push(key); save();
    glTip.innerHTML = tipHtml(key); glTip.classList.remove('hidden');
    const r = g.getBoundingClientRect(), w = glTip.offsetWidth, h = glTip.offsetHeight;
    let x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width/2 - w/2)), y = r.bottom + 8;
    if (y + h > innerHeight - 8) y = Math.max(8, r.top - h - 8);
    glTip.style.left = x + 'px'; glTip.style.top = y + 'px';
    noise(0.05, 2600, 0.04);
    return;
  }
  if (!glTip.classList.contains('hidden')){ glTip.classList.add('hidden'); e.stopPropagation(); e.preventDefault(); }
}, true);
// 한서진이 일지를 한 편 쓸 때마다, 그동안 마주친 낱말을 정리해 둠
setInterval(() => {
  if (!S.rArrived) return;
  const dc = diaryCount();
  if (dc > (S.gl.dc || 0)){
    S.gl.dc = dc;
    const add = S.gl.seen.filter(k => !S.gl.org.includes(k));
    if (add.length){ S.gl.org.push(...add); S.gl.fresh = (S.gl.fresh || 0) + add.length; }
    save();
  }
}, 2000);
const glHas = () => S.gl.look.length || S.gl.org.length;
function recGloss(){
  S.gl.fresh = 0; save();
  const keys = [...new Set([...S.gl.seen, ...S.gl.look])].filter(k => S.gl.org.includes(k) || S.gl.look.includes(k));
  const line = k => {
    const v = k.slice(2), mark = S.gl.org.includes(k) ? '' : ' <span class="glMe">— 가주가 찾아봄</span>';
    if (k[0] === 'w') return `<div class="glE"><b>${esc(v)}</b>${mark}<br>${esc(WORDS[v])}</div>`;
    const r = runInfo(v);
    return `<div class="glE"><b>${v}</b>${r && !r.idu && v.length > 1 ? ` (${Array.from(v).map(hanEum).join('')})` : ''}${mark}<br>${r ? esc(r.m) : esc(hanSay(v))}${r && r.n ? ` <span class="glMe">${esc(r.n)}</span>` : ''}</div>`;
  };
  return '<h3>낱말 장부</h3>'
    + (S.gl.org.length ? '<div class="glMe" style="margin-bottom:8px">한서진이 일지를 쓰는 틈틈이 정리해 둔 것.</div>' : '')
    + keys.map(line).join('');
}
