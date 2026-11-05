'use strict';
// ───────── 시대 스며듦 첫 판 (기획서 7절 '조선 뼈대 + 스며듦' · 22-1, 10/31) ─────────
// 사랑채 = 바깥이 들어오는 방. 대가 넘어갈 때마다 바깥 시대의 물건이 하나씩 사랑채에 놓여 있음(눈치만 — 회중시계는 앙부일구처럼 빠르기를 숫자로(17_why), 신문엔 어제 넘긴 양, 남포등은 놋등잔처럼 하루 한 번 안 꺼짐(08), 타자기는 필사가 빨라짐(19_money), 사진엔 이 대에 거쳐 간 사람 수). 처음 놓인 대엔 한서진 쪽지 한 줄.
const ERA = [   // [id, 놓이는 대, 이름, 모형, x, y, z, 받침]
  ['news',  18, '신문 한 장', 'eraNews',  6, 6, 8, 'sDesk'],
  ['nampo', 19, '남포등',     'eraNampo', 12, 2, 0, null],
  ['watch', 20, '회중시계',   'eraWatch', -3, 1, 8, 'sDesk'],
  ['type',  21, '타자기',     'eraType',  20, 14, 0, null],
  ['photo', 22, '사진 한 장', 'eraPhoto', -8, -24, 10, null],
];
M.eraNews = model(8, 6, 1, (x, y) => y === 0 || x === 0 || x === 7 || y === 5 ? '#b8b2a4' : y === 1 ? '#3a3632' : (x + y * 3) % 4 ? '#8a847a' : '#d8d2c4');
M.eraNampo = model(5, 5, 11, (x, y, z) => { const r = Math.hypot(x - 2, y - 2); if (z <= 2) return r <= 2.2 ? '#5a4a30' : null; if (z <= 4) return r <= 1.6 ? '#8a7448' : null; return r <= 1.3 && r >= 0.6 ? '#c8d4d0' : null; });
M.eraWatch = model(4, 4, 1, (x, y) => { const r = Math.hypot(x - 1.5, y - 1.5); return r <= 1.9 ? (r <= 0.9 ? '#e8e0c8' : '#a88a48') : null; });
M.eraType = model(9, 7, 5, (x, y, z) => { if (z === 4) return y >= 5 && x >= 1 && x <= 7 ? '#e8e2d2' : null; if (z === 3) return y <= 4 && (x + y) % 2 === 0 ? '#c8c0a8' : '#1a1816'; return '#1a1816'; });
M.eraPhoto = model(6, 1, 7, (x, y, z) => x === 0 || x === 5 || z === 0 || z === 6 ? '#2a1c12' : z >= 3 && z <= 4 && x >= 2 && x <= 3 ? '#9a948a' : '#5a5650');
const eraOn = id => sarangOn() && LINE.gen >= ERA.find(e => e[0] === id)[1];
const ERA_TXT = {
  news:  () => `활자로 찍은 신문 한 장. 날짜의 해가 읽히지 않는다.<br>광고란 맨 아래 —<br>「서고에서 글 읽을 ${typeof bangRot === 'function' && bangRot() ? '것' : '사람'}을 구함. ${esc(typeof bangLine === 'function' ? bangLine() : '밤낮을 가리지 않음.')} ${esc(S.sur)}씨 서고.」<br>우리 집 방(榜)의 글과 한 자도 다르지 않다.${(S.dayPages || []).length ? `<br><br>잡보(雜報)란 —<br>「${esc(S.sur)}씨 서고에서 어제 하루 ${fmtP(S.dayPages[S.dayPages.length - 1])}을 넘겼다 한다.」<br>어제 일이 벌써 찍혀 있다.` : ''}`,   // 넘김 일지(19_manage)의 어제 몫
  nampo: () => '유리 갓을 씌운 등. 석유 냄새가 난다.<br>불을 붙인 적이 없는데 갓 안쪽이 그을려 있다.<br>이것이 들어온 뒤로 서고 등잔이 바람에 한 번씩 버틴다.',
  watch: () => `뚜껑을 여니 초침이 간다. 지금 시각과 맞다.${hash(dayKey(), 31) < 0.3 ? '<br>오늘은 초침이 한 번 거꾸로 갔다.' : ''}`,
  type:  () => { const prev = LINE.jokbo.slice().reverse().find(j => j.last); return `쇠 글쇠가 촘촘한 기계. 아무도 칠 줄 모른다.<br>끼워 둔 종이에 한 줄이 쳐져 있다.<br><br>「${esc(prev ? prev.last : S.sur + S.name)}」<br><br>필사하던 이들이 밤새 빌려 썼는지, 별채 사본의 글자가 고르다.`; },
  photo: () => { const ks = allKeys().filter(k => arrived(k)), gone = ks.filter(k => S.st[k].gone).length; return `사진 한 장. 서고 앞에 ${KCNT(1 + (S.rArrived ? 1 : 0) + ks.length)} 사람이 서 있다. 가운데 사람의 얼굴만 흐리다.${gone ? `<br>${KCNT(gone)} 사람은 얼굴 자리가 긁혀 있다.` : ''}<br>뒤에 먹으로 「${genHj(LINE.gen)}世」라고 적혀 있다.`; },   // 사람 수 = 이 대에 서고를 거쳐 간 사람(가주·한서진·별채), 떠난 이는 긁힘
};
for (const [id, , nm, m, x, y, z, on] of ERA)
  SARANG_OBJ.push({ id:'era_' + id, x, y, z, rot: id === 'photo' ? 0 : 0.2, m:()=>m, ...(on ? { on:()=>on, onOrder:0.03 } : {}), show:()=> eraOn(id), click:()=>openOv(`<h3>${nm}</h3>${ERA_TXT[id]()}`) });
HOOK.tick.push(() => {
  if (S.stage !== 'room' || S.ended || !S.rArrived || isNight() || S.errs.sj) return;
  const e = ERA.find(e => eraOn(e[0]) && e[1] === LINE.gen && !(S.eraNote || []).includes(e[0])); if (!e) return;   // 처음 놓인 대에만(점검 11/4 — 다음 대마다 '못 보던' 물건으로 다시 오던 것)
  S.eraNote = (S.eraNote || []).concat([e[0]]); save();
  pushNote('<h3>쪽지</h3>' + vlet(['가주께.', `사랑채에 못 보던 ${josa(e[2], '이', '가')} 있습니다.`, '누가 두고 간 것인지 모르겠습니다.'], '한서진 올림.', 'min(36vh,240px)'));
});
// 지원서 말투(22-1): 19세부터 바깥 말이 섞임 — 한자어 → 외래어, 21세부터 국한문 맺음말. 앞의 것부터 바꿈(등잔 기름 → 석유가 등잔 → 남포등보다 먼저)
const ERA_WORDS = [[19, '장터', '시장(市場)'], [19, '셈을', '계산(計算)을'], [19, '밤낮으로', '주야(晝夜)로'], [19, '심부름', '잡무(雜務)'], [19, '등잔 기름', '석유(石油)'], [19, '등잔', '남포등'],
  [20, '돋보기', '안경(眼鏡)'], [20, '서당', '학교(學校)'], [20, '천장', '천정(天井)'], [21, '아이들', '학동(學童)들'], [21, '남포등', '램프'], [22, '글자', '문자(文字)']];
const ERA_JOSA = { 은:['은', '는'], 는:['은', '는'], 이:['이', '가'], 가:['이', '가'], 을:['을', '를'], 를:['을', '를'], 과:['과', '와'], 와:['과', '와'] };
const eraSwap = (t, a, b) => t.replace(new RegExp(a + '(은|는|이|가|을|를|과|와)?', 'g'), (m, j) => j ? b + josa(b.replace(/\(.*\)$/, ''), ...ERA_JOSA[j]).slice(-1) : b);   // 바뀐 낱말의 받침에 맞게 조사도(석유는·램프는)
const eraWords = lines => LINE.gen < 19 ? lines : ERA_WORDS.filter(w => LINE.gen >= w[0]).reduce((L, [, a, b]) => L.map(t => eraSwap(t, a, b)), lines)
  .concat(LINE.gen >= 21 ? ['이만 줄이오며 회신(回信) 바랍니다.'] : []);
