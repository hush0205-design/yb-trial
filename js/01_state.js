'use strict';
// ───────── 상태 ─────────
const SAVE = 'yeobaek_trial_v1';
if (/[?&]new\b/.test(location.search)) { localStorage.removeItem(SAVE); history.replaceState(null, '', location.pathname); }
const S = Object.assign({
  stage:'start', sur:'', bon:'', name:'', gahun:-1,
  pages:0, earned:0, D:0, owned:{}, fear:0, opened:false,
  letterRead:false, chair:false, glitchDone:false, sideRead:{}, opt:{ horiz:false, mute:false }
}, JSON.parse(localStorage.getItem(SAVE) || '{}'));
S.opt = Object.assign({ horiz:false, mute:false, fast:false, gameTime:false }, S.opt); S.sideRead = S.sideRead || {}; S.owned = S.owned || {};
let resetting = false;
const save = () => { if (!resetting) localStorage.setItem(SAVE, JSON.stringify(S)); };
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xAC00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); };   // 받침에 따라 은/는·이/가
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

// ───────── 성씨 한자 ─────────
const HJ = {김:'金',이:'李',박:'朴',최:'崔',정:'鄭',강:'姜',조:'趙',윤:'尹',장:'張',임:'林',한:'韓',오:'吳',서:'徐',신:'申',권:'權',황:'黃',안:'安',송:'宋',류:'柳',유:'柳',전:'全',홍:'洪',고:'高',문:'文',양:'梁',손:'孫',배:'裵',백:'白',허:'許',남:'南',심:'沈',노:'盧',하:'河',곽:'郭',성:'成',차:'車',주:'朱',우:'禹',구:'具',민:'閔',진:'陳',나:'羅',지:'池',엄:'嚴',채:'蔡',원:'元',천:'千',방:'方',공:'孔',현:'玄',함:'咸',변:'卞',염:'廉',여:'呂',추:'秋',도:'都',소:'蘇',석:'石',선:'宣',설:'薛',마:'馬',길:'吉',연:'延',위:'魏',표:'表',명:'明',기:'奇',반:'潘',왕:'王',금:'琴',옥:'玉',육:'陸',인:'印',맹:'孟',제:'諸',탁:'卓',국:'鞠',어:'魚',은:'殷',편:'片',용:'龍',예:'芮',경:'景',봉:'奉',사:'史',부:'夫',모:'牟',태:'太',호:'胡',피:'皮',빈:'賓',라:'羅',갈:'葛',궁:'宮',보:'甫',독:'獨'};
const TWO = {남궁:'南宮',제갈:'諸葛',선우:'鮮于',독고:'獨孤',황보:'皇甫',사공:'司空',서문:'西門'};
const hanjaOf = s => TWO[s] || Array.from(s).map(c => HJ[c] || c).join('');

// ───────── 낯선 문자 ─────────
function fmtP(n){
  n = Math.max(0, Math.floor(n)); const k = Math.floor(n/100), j = Math.floor((n%100)/2), q = n%2, out = [];
  if (k) out.push(k + '권'); if (j) out.push(j + '장'); if (q || !out.length) out.push(q + '쪽');
  return out.join(' ');
}
function rng(seed){ let x = seed*9301+49297; return () => (x = (x*9301+49297)%233280)/233280; }
function glyphs(model, seed){ const r = rng(seed); return Array.from(model).map(c => /\s/.test(c) ? c : String.fromCharCode(0x2F00 + Math.floor(r()*214))).join(''); }
const hash = (a,b) => { let h = (a*374761393 + b*668265263) >>> 0; h = (h^(h>>>13))*1274126177 >>> 0; return (h % 1000)/1000; };
const isAlien = ch => { const c = ch.codePointAt(0); return c >= 0x2F00 && c <= 0x2FD5; };
const agSpan = (ch,k) => `<span class="ag r${(ch.codePointAt(0)+k)%5}">${ch}</span>`;
const alienHtml = str => Array.from(str).map((ch,k) => isAlien(ch) ? agSpan(ch,k) : esc(ch)).join('');

