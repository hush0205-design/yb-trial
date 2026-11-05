'use strict';
// ───────── 별호(別號) — 도전과제가 게임에 보이는 모습 (환생 명세 7-1, 10/31 선생님 "별호로, 우스운 죽음도") ─────────
// 대가 끝날 때(19_rebirth endGame) 조건을 보고, 처음 얻은 별호 하나를 족보 줄 곁에 붓이 이어 씀(다음 대가 앞 대를 그렇게 부른다는 결). "달성" 알림 없음.
// 얻은 것은 LINE.feats[id] = 그 대(세)에 남고, 문서함 「별호첩」에서 모아 봄 — 못 얻은 칸은 낯선 글자.
// 차례 = 고르는 차례(앞의 것부터 — 기묘한 끝이 먼저). 명세 7절의 '첫 대에'·'잊지 않고'는 조건이 아직 모호해 뺌.
const livedDays = () => S.genDay == null ? 1 : dayKey() - S.genDay + 1;
const FEATS = [   // [id, 별호, 조건(끝 id)]
  ['noclose', '끝내 책을 덮지 않은 이', id => id === 'fire' && !S.darkClose],
  ['oneday',  '하루를 넘기지 못한 이',  () => livedDays() <= 1],
  ['shut',    '문을 걸어 잠근 이',      id => id === 'shut'],
  ['nightb',  '밤을 부린 이',           id => id === 'night'],
  ['coins',   '엽전을 세다 간 이',      id => id === 'rice' && (S.money || 0) > 0],
  ['nohand',  '한 장도 넘기지 않은 이', () => !S.handN],
  ['kickall', '다 내보낸 이',           () => genKeys().filter(k => S.st[k] && S.st[k].fired).length > K.featKick],
  ['teaman',  '찻잎만 씹은 이',         () => (S.brewN || 0) >= K.featTea],
  ['guests',  '손님만 맞은 이',         () => (S.askN || 0) > K.featAsk],
  ['named',   '이름을 받아 쓴 이',      () => !!S.nameKept],
  ['eyes',    '눈 밝은 이',             () => typeof oddCount === 'function' && oddCount() >= ODD_N],
  ['solo',    '홀로 읽은 이',           () => livedDays() >= K.featDays && !S.rArrived && !allKeys().some(k => S.st[k] && S.st[k].arr)],
  ['kind',    '아무도 내보내지 않은 이', () => livedDays() >= K.featDays && genKeys().some(k => S.st[k] && S.st[k].arr) && !genKeys().some(k => S.st[k] && S.st[k].quit)],
  ['sober',   '차를 마시지 않은 이',    () => livedDays() >= K.featDays && !S.brewN],
  ['flame',   '불을 지킨 이',           () => livedDays() >= K.featDays && !!S.owned.lamp && !S.darkEver],
  ['poor',    '사본을 팔지 않은 이',    () => livedDays() >= K.featDays && !S.soldN],
  ['nodebt',  '손 벌리지 않은 이',      () => livedDays() >= K.featDays && !S.loanSent],
];
// 별호의 몫(환생 명세 7절 표): 처음 얻을 때 한 번 — 가훈이 풀리거나 유품이 다음 대에 남음. '눈 밝은 이'는 여백 글씨 + 가훈 「본 것은 적어 두라」(11/1 ✳), '사본을 팔지 않은 이'는 세책 기한이 닷새로(19_books borrowDays)
const FEAT_GIFT = { eyes:{ margin:true, gahun:6 }, solo:{ gahun:4 }, nodebt:{ gahun:5 }, flame:{ relic:'lamp_brass' }, sober:{ relic:'pot_dry' }, kind:{ relic:'roster' }, poor:{ late:true } };
RELIC.roster = { name:'명부', desc:'앞 대가 아무도 내보내지 않은 별채 명부. 이 명부를 펴 두면 사람을 하나 더 잃어도 서고가 버틴다.' };
let featGot = [];   // 이번 끝에 받은 몫(19_rebirth 끝 장면에 한 줄)
function featsAt(endId){   // 이번 대에 얻은 것을 모두 적고, 족보에 쓸 별호 하나(처음 얻은 것 먼저, 없으면 얻은 것 중 첫째)를 돌려줌
  const got = FEATS.filter(f => { try { return f[2](endId); } catch (_){ return false; } });
  const fresh = got.filter(f => !LINE.feats[f[0]]);
  featGot = [];
  for (const f of fresh){ LINE.feats[f[0]] = LINE.gen; const g = FEAT_GIFT[f[0]]; if (!g) continue;
    if (g.gahun != null && !gahunOpen().includes(g.gahun)){ LINE.gahun.unlocked.push(g.gahun); featGot.push(`가훈 「${GAHUN[g.gahun].t}」`); }
    if (g.relic && !hasRelic(g.relic)){ LINE.relics.push(g.relic); featGot.push(RELIC[g.relic].name); }
    if (g.late) featGot.push('세책 기한 닷새');
    if (g.margin && (S.margins || []).length < MARGIN.length){ S.margins = MARGIN.slice(); featGot.push('여백 글씨 모두'); } }   // 눈 밝은 이: 남은 여백 글씨가 한꺼번에(판을 넘어 남음, 19_rebirth)
  return (fresh[0] || got[0] || [])[1] || null;
}
const featsHtml = () => '<h3>별호첩(別號帖)</h3><div style="font-size:12px;opacity:.6;margin-bottom:8px">앞 대들이 얻은 별호를 옮겨 적은 첩. 빈 칸이 남아 있다.</div>'
  + FEATS.map(([id, nm], i) => LINE.feats[id] ? `<div style="margin:7px 0"><b>${nm}</b> <span style="font-size:12px;opacity:.55">— ${genHj(LINE.feats[id])}世</span></div>`
    : `<div style="margin:7px 0;opacity:.4">${alienHtml(glyphs(nm, 900 + i))}</div>`).join('');
