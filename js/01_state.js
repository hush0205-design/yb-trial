'use strict';
// ───────── 상태 ─────────
const SAVE = 'yeobaek_trial_v1', LINE_KEY = 'yeobaek_line_v1';   // 판(S) — 대마다 새로 / 가문(LINE) — 대를 넘어 남음(환생 명세 1절)
if (/[?&]new\b/.test(location.search)) { localStorage.removeItem(SAVE); localStorage.removeItem(LINE_KEY); history.replaceState(null, '', location.pathname); }
const S = Object.assign({
  stage:'start', sur:'', bon:'', name:'', gahun:-1,
  pages:0, earned:0, D:0, owned:{}, fear:0, opened:false,
  letterRead:false, chair:false, glitchDone:false, sideRead:{}, opt:{ horiz:false, mute:false }
}, JSON.parse(localStorage.getItem(SAVE) || '{}'));
S.opt = Object.assign({ horiz:false, mute:false, fast:false, gameTime:false }, S.opt); S.sideRead = S.sideRead || {}; S.owned = S.owned || {};
let resetting = false;
const save = () => { if (!resetting) localStorage.setItem(SAVE, JSON.stringify(S)); };
// ───────── 가문(LINE): 족보·가환록·유품·가훈첩·열린 것 — 환생해도 안 지움(설정의 '처음부터'만 지움) ─────────
const LINE = Object.assign({ v:1, sur:'', bon:'', gen:17, jokbo:[], gahun:{ used:{} }, relics:[], codex:{}, odd:{}, books:[], feats:{}, reached:{}, trace:null, mode:'basic', ending:{}, limits:{} },
  JSON.parse(localStorage.getItem(LINE_KEY) || '{}'));
LINE.limits = Object.assign({ leave:4, rice:5, tea:3, borrow:3, away:10, night:3 }, LINE.limits);           // 일반 엔딩 한도(아무도 오지 않다: 떠난 사람 넷 / 쌀독이 비다: 닷새) — 유품·가훈·연구로 늘어남
if (!LINE.sur && S.sur){ LINE.sur = S.sur; LINE.bon = S.bon; }           // 환생이 생기기 전에 시작한 판
const saveLine = () => { if (!resetting) localStorage.setItem(LINE_KEY, JSON.stringify(LINE)); };
const genName = g => g === LINE.gen ? (S.name || '') : ((LINE.jokbo.find(j => j.gen === g) || {}).name || '');
const NUMHJ = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const genHj = n => (n >= 20 ? NUMHJ[Math.floor(n/10)] + '十' : n >= 10 ? '十' : '') + NUMHJ[n % 10];   // 17 → 十七
// 가훈(환생 명세 10-10): 1대엔 고르지 않음 — 서고 벽에 앞 대가 걸어 둔 족자(0번)가 이미 걸려 있고 효과는 숨긴 채 작동.
// 첫 환생 때 처음 고름(물려받은 것 + 방금 맞은 끝으로 풀린 것). 효과 설명은 그 가훈으로 살아 본 뒤에만 족보 말투로(써 볼수록 정확해짐).
const GAHUN = [
  { t:'읽되 믿지 마라',     read:1.2, fear:1.2, note:['이 가훈 아래 가주는 책장을 빨리 넘겼다.', '이 가훈 아래 가주들은 글을 빨리 풀었으나 손이 일찍 떨렸다.'] },
  { t:'모르는 것은 덮어라',   read:0.9, fear:0.8, note:['이 가훈 아래 가주는 덜 떨었다.', '이 가훈 아래 가주들은 덜 떨었으나 글을 더디 풀었다.'] },   // 아직 풀리는 끝이 없음
  { t:'사람을 아끼지 마라',   leave:2, appLate:2, note:['이 가훈 아래 서고엔 사람이 드나들었다.', '이 가훈 아래 가주들은 사람을 잃고도 버텼으나, 새 사람은 더디 왔다.'] },   // 아무도 오지 않다로 풀림
  { t:'곡간을 먼저 채워라',   copy:1.5, read:0.9, note:['이 가훈 아래 궤짝은 비지 않았다.', '이 가훈 아래 가주들은 궤짝이 비지 않았으나 글을 더디 풀었다.'] },   // 쌀독이 비다로 풀림
  { t:'남의 눈을 빌리지 마라', hand:2, appLate:2, note:['이 가훈 아래 가주는 제 손으로 넘겼다.', '이 가훈 아래 가주들은 제 손이 빨랐으나, 사람은 더디 왔다.'] },   // 별호 '홀로 읽은 이'로 풀림(19_feats)
  { t:'남에게 손 벌리지 마라', oweHold:1, note:['이 가훈 아래 사람들은 녹봉이 밀려도 하루 더 버텼다.', '이 가훈 아래 서고 사람들은 밀린 녹봉에도 하루씩 더 남았다.'] },   // 별호 '손 벌리지 않은 이'로 풀림(19_feats)
  { t:'본 것은 적어 두라',   fear:0.7, copy:0.8, note:['이 가훈 아래 가주는 이상한 것을 보고도 덜 떨었다.', '이 가훈 아래 가주들은 본 것을 적느라 덜 떨었으나, 사본은 더디 나왔다.'] },   // 별호 '눈 밝은 이'로 풀림(19_feats, 11/1 ✳)
];
const gahunK = k => ((GAHUN[S.gahun] || {})[k] || 1) * (k === 'fear' && S.trace === 'hasty' ? K.hastyFear : 1) * (k === 'fear' && S.samsin === 'calm' ? K.samsinCalm : k === 'read' && S.samsin === 'eye' ? K.samsinEye : 1);   // 삼신(19_forget)
// 훅: 뒤 파일이 앞 파일의 함수를 감싸는 대신 여기에 넣음(코드 정리 설계 3절 — 건드리는 것부터 하나씩)
const HOOK = { tick:[], desk:[], ov:[], dolls:{ gate:[] } };   // desk: 서안을 누를 때 먼저 묻는 함수들(true면 책을 펴지 않음, 19_deep 일지 마지막 장) · dolls.gate: 대문 앞 인형 목록을 주는 함수들(19_money 거간·19_dig 돌아오는 사람·19_safe 짐 싼 사람) · ov: 기록 창이 열린 뒤 부르는 함수들(19_mad 화면 오염)
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xAC00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); };   // 받침에 따라 은/는·이/가
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

// ───────── 성씨 한자 ─────────
const HJ = {김:'金',이:'李',박:'朴',최:'崔',정:'鄭',강:'姜',조:'趙',윤:'尹',장:'張',임:'林',한:'韓',오:'吳',서:'徐',신:'申',권:'權',황:'黃',안:'安',송:'宋',류:'柳',유:'柳',전:'全',홍:'洪',고:'高',문:'文',양:'梁',손:'孫',배:'裵',백:'白',허:'許',남:'南',심:'沈',노:'盧',하:'河',곽:'郭',성:'成',차:'車',주:'朱',우:'禹',구:'具',민:'閔',진:'陳',나:'羅',지:'池',엄:'嚴',채:'蔡',원:'元',천:'千',방:'方',공:'孔',현:'玄',함:'咸',변:'卞',염:'廉',여:'呂',추:'秋',도:'都',소:'蘇',석:'石',선:'宣',설:'薛',마:'馬',길:'吉',연:'延',위:'魏',표:'表',명:'明',기:'奇',반:'潘',왕:'王',금:'琴',옥:'玉',육:'陸',인:'印',맹:'孟',제:'諸',탁:'卓',국:'鞠',어:'魚',은:'殷',편:'片',용:'龍',예:'芮',경:'景',봉:'奉',사:'史',부:'夫',모:'牟',태:'太',호:'胡',피:'皮',빈:'賓',라:'羅',갈:'葛',궁:'宮',보:'甫',독:'獨'};
const TWO = {남궁:'南宮',제갈:'諸葛',선우:'鮮于',독고:'獨孤',황보:'皇甫',사공:'司空',서문:'西門'};
const hanjaOf = s => TWO[s] || Array.from(s).map(c => HJ[c] || c).join('');

// ───────── 낯선 문자 ─────────
function fmtP(n){
  n = Math.max(0, Math.floor(n)); const k = Math.floor(n/100), j = Math.floor((n%100)/2), q = n%2, out = [];
  if (k >= 10) out.push(Math.floor(k/10) + '질'); if (k % 10) out.push(k % 10 + '권'); if (j) out.push(j + '장'); if (q || !out.length) out.push(q + '쪽');
  return out.join(' ');
}
function rng(seed){ let x = seed*9301+49297; return () => (x = (x*9301+49297)%233280)/233280; }
function glyphs(model, seed){ const r = rng(seed); return Array.from(model).map(c => /\s/.test(c) ? c : String.fromCharCode(0x2F00 + Math.floor(r()*214))).join(''); }
const hash = (a,b) => { let h = (a*374761393 + b*668265263) >>> 0; h = (h^(h>>>13))*1274126177 >>> 0; return (h % 1000)/1000; };
const isAlien = ch => { const c = ch.codePointAt(0); return c >= 0x2F00 && c <= 0x2FD5; };
const agSpan = (ch,k) => `<span class="ag r${(ch.codePointAt(0)+k)%5}">${ch}</span>`;
const alienHtml = str => Array.from(str).map((ch,k) => isAlien(ch) ? agSpan(ch,k) : esc(ch)).join('');
// 가훈 오염(기획서 5절 💡, ✳ 11/4): 같은 가훈 아래 여러 대를 살면 글귀가 한 자씩 낯선 글자로 바뀌어 있음(효과는 그대로)
function gahunHtml(i){ const t = Array.from(GAHUN[i].t), ks = t.map((c, k) => k).filter(k => t[k] !== ' '), r = rng(i * 31 + 7);
  const at = ks.sort(() => r() - 0.5).slice(0, Math.min(ks.length - 2, Math.max(0, (LINE.gahun.used[i] || 0) - K.gahunRotFrom + 1)));
  return alienHtml(t.map((c, k) => at.includes(k) ? glyphs(c, i * 97 + k) : c).join('')); }

const K = { earHintPages: 6, earHintIdle: 5000, earHintEvery: 7000,   // 첫 넘김 힌트(15_small): 이 쪽 수 전까지, 이만큼 가만있으면, 이 간격으로 귀퉁이가 들썩
  askHour: [7, 19], askWait: [60e3, 150e3], askOddFrom: 2, askOdd: 0.4, askStart: 30, askPer: 40,   // 해독 의뢰(19_ask): 오는 때(시), 들어온 뒤 몇 분에, 셋째(0부터 2)부터 이 확률로 같은 종이, 한 줄이 풀리는 쪽 수
  madAt: [100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000], madRAt: [60, 150, 300, 500, 800, 1200, 1800],   // 광기(19_mad): 가주 13단계·연구원 7단계 문턱
  madFlip: 0.1, madTea: 3, madMargin: 15, madSea: 0.002, madR: 0.05, madTeaR: 4, madSijoMs: 10*60e3, docFee: 50,   // 손 한 장·찻잔·여백 한 줄·궤 하나(초당)·연구원(초당)·연구원 찻잔·시조 읽은 뒤 더딘 시간·의원 맥값(푼)
  docEvery: 3, eyeFee: 100, eyeOk: 0.7, eyeGreat: 0.05, eyeSlow: [1, 0.85, 0.6],   // 의원(19_mad): 며칠마다 다시 옴 · 눈 하나 덜어 내는 값(푼) · 한 단계 내려갈 확률 · 그중 드물게 '무엇을 봄' · 남은 눈(2·1·0)에 따른 읽는 빠르기
  madLockFear: 0.02,   // 광기 13단계에 닿는 순간 겁이 이만큼도 없으면 붕괴(문을 잠그고 나오지 않다, 19_mad)
  landBase: 500, landMul: 1.5, rentDay: 20, workerWage: 10, teaField: 2, teaMill: 4, teaPrice: 30, teaCup: 0.25,   // 집 지도(19_house): 첫 땅값·필지마다 곱·소작료(하루)·일꾼 새경(하루)·찻잎(근/하루, 차밭만·제다소)·차 한 근 값·한 번 끓일 때 드는 근
  digHands: 2, caveHands: 3,   // 발굴에 데려갈 일반 연구원 수(19_gather): 여울·바위 / 굴
  fleeSec: 7200, fleeFear: 0.79, fireDrops: 5,   // 끝(19_ends): 도주 — 겁이 이만큼 넘은 채 책을 펴 둔 초 · 불이 번지다 — 책을 놓친 횟수
  liverTea: 20, liverDays: 3, seaLost: 3,   // 끝(19_ends): 간을 두고 오다 — 바다의 차 잔 수·겁 0으로 지난 날 · 물가에서 — 굴에서 돌아오지 않은 사람 수
  eyeRelicD: 120, eyeRelicMad: 30,   // 유품 떼어낸 눈(19_ends): 처음에 풀려 있는 해독도 · 쌓여 있는 광기
  fearRest: 0.003,   // 책을 덮어 두면 가주 겁이 초당 이만큼 가라앉음(08 tick — 한계 0.8에서 4분 반쯤)
  techIdu: 1.1, techCopy: 2/3, techSecPer: 1200, techTide: 0.5, techTideTime: 0.75, techMarginMad: 1.3,   // 연구(19_tech): 이두 해독 배수 · 필사 요령 시간 배수 · 한 권짜리 연구를 쓰는 초 · 물길 읽기 허탕 배수·머무는 시간 배수 · 여백 보는 눈 손 넘김 광기 배수
  seaFolkMore: 3,   // 물가의 사람들이 유물을 산 번수만큼 대문 앞에 더 서는 사람 수의 끝(19_ask)
  nightChange: 7200, nightSnd: [40e3, 90e3], rosterDays: 3, madFxAt: { eye: 5, crawl: 6, tent: 8, doc: 6, swarm: 8, morph: 7 }, madFxGap: [150, 420],   // madFx(19_madfx): 환각이 시작되는 광기 단계 · 다음 환각까지 초(5단계 기준, 깊을수록 짧아짐)
    // rosterDays: 명부의 한 명(19_ends) — 떠난 사람의 책상을 이 날수만큼 비워 두면 끝(11/5 ✳)
    // 밤에 일 시키다(19_ends): 낮 사람을 밤에 남겨 둔 시간(초)이 이만큼 쌓이면 변함 · 그 흔적으로 밤에 책장 넘기는 소리가 나는 간격(ms)
  backDays: 1, backFear: 0.8,   // 되부르기(19_empty): 밀린 것을 보낸 뒤 며칠 만에 다시 지원서 · 돌아온 사람의 겁 차는 빠르기 배수
  bangWait: 1.5, bangLiver: 0.2, bangRotMad: 9, bangOld: 3, rumorGood: 0.7, rumorBad: 1.4,   // 방의 종류(19_bang): 조건 붙은 방일 때 다음 지원자까지 걸리는 시간 배수 · 겁 없는 이 방에 간땡이가 부은 사람이 섞이는 몫 · 가주 광기가 이 단계에 닿은 다음 날부터 방이 오염 · 붙인 지 며칠이면 방이 낡아 번짐 · 좋은·나쁜 소문일 때 기다림 배수
  oweMad: 1.5,   // 녹봉이 이틀 넘게 밀린 메인(한서진·오정림)의 광기 배수(19_mad)
  handPrice: 1.5, handMad: 150,   // 가주가 손으로 베낀 사본(19_empty): 값 배수 · 한 권에 붙는 광기
  handMax: 1, handHalf: 3000, handWord: [1.25, 1.6], growDays: 14,
  pileAt: [300, 1500, 5000, 15000, 40000, 100000, 250000],   // 종이 더미(15_small): 넘긴 총량(쪽)이 여기 닿을 때마다 한 층씩 높아짐
  featDays: 3, featTea: 50, featKick: 3, featAsk: 5,   // 별호(19_feats): '없이' 별호는 이 날수는 버텨야 · 찻잎만 씹은 이(끓인 번) · 다 내보낸 이(넘게) · 손님만 맞은 이(넘게)
  techSpd: { idu:1.25, jajeon:1.5, gugyeol:2, cheop:3 }, techCheopMad: 1.5, techYeon: 0.5, techAt: [3000, 10000, 30000],   // 연구 읽기 줄기(19_tech, 10/31 '빨라짐의 엔진'): 넘기는 빠르기 배수 · 겹쳐 읽기 손 넘김 광기 배수 · 연구소가 있으면 쓰는 시간 배수 · 자전·구결·겹쳐 읽기가 건의되는 넘긴 총량
  techHyang: 0.5, techEonhae: 1.5,
  carryRead: 5, carryChg: 0.3,   // 앞 대가 푼 첫 책 줄(02_text·06_turn, 기획서 23절): 이어받은 줄을 푸는 빠르기 배수 · 대마다 한 줄이 바뀐 글일 몫
  zoomMax: 2.2, eraTypeCopy: 0.75, borrowDays: 3, featPoorDays: 5,
  traceDays: 3, tallyOddDays: 7, tallyMax: 16,
  pageSellPer: 10, pageSellMin: 2000, pageVisitGap: 1800e3,
  museumPer: 30, museumShellEvery: 4, museumClimbEvery: 3,
  screenOdd: 0.3, screenSea: 0.5, screenTheftEvery: 2,
  replySoftFear: 0.8, replySoftSec: 1.2,
  screenSjAfter: 3, screenSjWait: 60000, screenBoltDays: 2, crawlAwayMs: 21600000, shedAfter: 3, sunShadowRate: 0.05, seaWhisper: 0.6, screenLureDays: 5, tideLow: 6, tideWait: 0.75, samsinCoin: 200, jowangP: 0.5, gahunRotFrom: 3, libGhostSec: 600, hastyFear: 1.3, hastyShell: 2, hastyTideW: 11, hastyShoreHour: 6, samsinCalm: 0.85, samsinEye: 1.15, charmCost: 100, charmDays: 3, kyeolAfter: 3, kyeolCost: 500, kyeolLeaveDays: 4, swallowLim: 4, trmShow: 7000, trmAlpha: 0.32, lureHour: 23,
  kinWork: 1800 };   // 형제 지원자(19_screen): 일반 연구원이 이만큼(초) 일한 뒤 동생을 부름   // 한서진이 대신 면접(19_screen): 가주가 이만큼 살펴본 뒤 · 지원자가 온 지 이만큼 뒤에   // 답장 마지막 줄(12_lab): 사람을 아끼는 줄 — 겁 0.8배 · 한 장에 1.2배 더 걸림   // 가려받기(19_screen): 바다 궤 뒤 지원자가 수상할 몫 · 그중 보낸 사람 몫 · 보낸 사람이 안에 있으면 며칠에 한 번 조개가 줄어듦   // 박물관(19_museum): 진열한 유물 하나에 하루 3전 · 이만큼 날에 한 번은 엽전 대신 젖은 조개   // 풀어 적은 종이(19_money): 100쪽에 1전 · 쪽이 이만큼 쌓이면 거간이 옴 · 다녀간 뒤 다시 오기까지(한 시간)   // 부엌·행랑채·차밭·제다소 장면(19_kitchen): 숯·사발 밑 종이·글자 잎맥·서고 쪽으로 말리는 잎이 보이는 날 · 벽의 금이 한 줄 많아지는 날 · 금 최대   // 타자기: 필사 시간 배수(19_money) · 세책 기한(19_books) · 별호 '사본을 팔지 않은 이'를 얻은 뒤 기한   // 폰 두 손가락으로 방을 가까이(20_main): 최대 배율   // 향 사르는 법: 겁에 질려 집에 다녀오는 시간 배수 · 언해: 사본 값 배수(19_tech)
