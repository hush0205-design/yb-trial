'use strict';
// ───────── 지원자 가려받기 (기획서 19절 '지원자 가려받기 — 안을 노리는 사람들', 10/4 선생님 · 세부 ✳ 11/3) ─────────
// 바다 궤가 놓인 뒤 오는 일반 지원자 중 몇은 수상함(징후 하나) — 그중 반은 물가의 사람들이 보낸 사람(징후 둘).
// 지원서에서 「살펴본다」 → 차 한 잔 · 글 한 줄 · 대문 앞 모습 중 두 가지까지. 그냥 수상한 사람은 멀쩡히, 보낸 사람은 어긋나게 반응.
// 받으면: 겁이 없어 집에 가지 않음(일 잘함) — 박물관이 있으면 이틀에 한 번 진열대의 조개가 줄어듦.
// 돌려보내면: 그 사람이 물가의 사람들 사이에 이름 한 글자가 바뀌어 서 있음(추천 7개 중 4번).
// 한서진이 대신 면접(14-3, ✳ 11/3): 가주가 셋을 살펴본 뒤 한서진 쪽지 → 그 뒤 온 지원자는 잠시 뒤 한서진이 들이거나 대문에서 돌려보냄. 韓瑞津(S.jin)이 된 뒤엔 보낸 사람을 오히려 들임.
const SCR_SIGN = ['종이 귀퉁이가 젖어 있다. 마른 날인데.', '끝에 한 줄이 덧붙어 있다. 「방을 본 기억은 없는데 길은 알았습니다.」', '획 하나가 어긋난 글자가 섞여 있다. 쓴 사람이 그 글자를 모르는 것 같다.'];
const SCR_LOOK = {
  tea:  ['차 한 잔을 낸다', '단숨에 마시고 땀을 닦는다. 먼 길을 왔다고 한다.', '잔을 받아 들고 고맙다고 한다. 내려놓은 잔은 그대로 차 있다. 식지도 않았다.'],
  read: ['글 한 줄을 읽혀 본다', '한참 들여다보다 고개를 젓는다. 처음 보는 글자라고 한다.', '막힘없이 읽어 내려간다. 한서진도 아직 못 푼 줄이다. 다 읽고 나서, 그런 줄은 없었다고 한다.'],
  feet: ['대문 앞 모습을 본다', '짚신에 마른 흙. 오래 걸은 발이다.', '짚신이 젖어 있다. 귀 밑에 옅은 선이 두 줄 있다.'],
};
const scrSigns = k => { const s = S.st[k], n = +k.slice(1); return !s || !s.odd ? [] : s.sea ? [SCR_SIGN[n % 3], SCR_SIGN[(n + 1) % 3]] : [SCR_SIGN[n % 3]]; };

HOOK.tick.push((dt) => { if (S.stage !== 'room' || S.ended) return;
  for (const k of genKeys()){ const s = S.st[k];
    if (s.odd === undefined && s.at && !s.replied){ const r = mulberry(+k.slice(1) * 7919 + (LINE.gen || 0))();
      s.odd = !!S.relicBox && r < K.screenOdd; s.sea = s.odd && r < K.screenOdd * K.screenSea; save(); }
    if (s.sea && s.replied && !s.quit) s.fear = 0;                                                    // 겁이 없음
    if (s.sea && s.replied && !s.quit){ if (s.inDay == null){ s.inDay = dayKey(); save(); }          // 며칠 지나면 오정림 보고 한 줄(✳ 11/3)
      if (!s.bolt && dayKey() - s.inDay >= K.screenBoltDays && working('ojr')){ s.bolt = true; save();
        pushNote('<h3>쪽지</h3>' + vlet(['가주께.', `一. ${DEF(k).name},`, '이경에 대문 빗장을 만짐.', '열지는 않았습니다.'], '오정림 올림.', 'min(40vh,280px)')); }
      if (s.bolt && dayKey() - s.inDay >= K.screenLureDays && END.nobody.n() + 2 < END.nobody.lim()){   // 둘이 함께 비므로 '아무도 오지 않다' 바로 앞에선 기다림                                         // 그래도 두면 연구원 하나를 데리고 사라짐
        const o = genKeys().find(j => j !== k && S.st[j].replied && !S.st[j].quit && !S.st[j].sea);
        s.gone = true; s.quit = Date.now(); S.seaExpel = DEF(k).name; S.genNext = Date.now() + 180000;
        if (o){ S.st[o].gone = true; S.st[o].quit = Date.now(); S.seaLured = DEF(o).name; delete S.errs[o]; }   delete S.errs[k];
        ledger(`${DEF(k).name}${o ? '·' + DEF(o).name : ''}의 자리가 비었다. 아침에 대문 빗장이 열려 있었다`); save(); } }
    if (s.sea && s.replied && !s.quit && s.desk && working(k)){ const ds = Object.keys(LAB_DESKS), di = ds.indexOf(s.desk);   // 곁자리 사람이 더 빨리 겁먹음(✳ 11/3 밤)
      for (const j of genKeys()){ const t = S.st[j]; if (j === k || t.sea || !t.desk || !working(j) || Math.abs(ds.indexOf(t.desk) - di) !== 1) continue;
        t.fear = Math.min(1, (t.fear || 0) + dt * readFear(t.item || 'first') * DEF(j).fearK * K.seaWhisper);
        if (!s.whisper && working('ojr')){ s.whisper = true; save(); pushNote('<h3>쪽지</h3>' + vlet(['가주께.', `一. ${DEF(k).name},`, `곁자리 ${DEF(j).name}에게`, '밤새 무어라 속삭임.'], '오정림 올림.', 'min(40vh,280px)')); } } }
    if (s.sea && s.fired && !S.seaExpel){ S.seaExpel = DEF(k).name; save(); }                         // 내보낸 사람은 물가의 사람들 쪽에
    if (s.sea && s.gone && !s.replied && !S.seaReject){ S.seaReject = DEF(k).name.slice(0, -1) + (DEF(k).name.slice(-1) === '수' ? '순' : '수'); save(); }   // 돌려보낸 사람
  }
  if (!built('museum')) return;
  const today = dayKey(); if (S.scrDay == null){ S.scrDay = today; return; }
  while (S.scrDay < today){ S.scrDay++;
    const inside = scrInside();
    if (inside && S.scrDay % K.screenTheftEvery === 0 && S.sea && S.sea.shell){ S.sea.shell--; ledger('진열대의 조개껍질이 하나 줄었다'); }
    save();
  }
});
HOOK.ov.push(() => {
  const h = ovBody.querySelector('h3'); if (!h) return;
  if (h.textContent === '물가의 사람들' && S.seaReject){ const d = document.createElement('div'); d.style.cssText = 'font-size:13px;opacity:.8;margin-top:6px';
    d.textContent = `뒤에 선 사람 하나가 낯이 익다. 이름을 물으니 「${S.seaReject}」라 한다.`; ovBody.querySelector('.close').before(d); }
  if (h.textContent === '물가의 사람들' && scrInside() && !(S.dig && S.dig.went && S.dig.went.cave)){ const d = document.createElement('div'); d.style.cssText = 'font-size:13px;opacity:.8;margin-top:6px';
    d.textContent = '아직 건지지 않은 것도 사겠다고 한다. 굴 안쪽, 바위 밑에 눌려 있는 것 말이다. 우리 조사단은 굴에 들어간 적이 없다.'; ovBody.querySelector('.close').before(d); }   // 보낸 사람이 안에 있으면: 다음 유물을 미리 앎
  if (h.textContent === '물가의 사람들' && S.seaExpel){ const d = document.createElement('div'); d.style.cssText = 'font-size:13px;opacity:.8;margin-top:6px';
    d.textContent = `맨 앞에 선 사람은 별채에 있던 ${S.seaExpel}. 이쪽을 보지 않는다.` + (S.seaLured ? ` 그 뒤에 ${S.seaLured}도 있다. 옷자락이 젖어 있다.` : ''); ovBody.querySelector('.close').before(d); }
  if (h.textContent === '물가의 사람들') return;
  if (!h.textContent.startsWith('지원서 — ')) return;
  const k = curApplicant(); if (!k || !isGen(k) || !S.st[k].odd) return;
  const v = ovBody.querySelector('.vletter'); if (!v) return;
  const d = document.createElement('div'); d.style.cssText = 'font-size:13px;opacity:.75;margin-top:8px';
  d.innerHTML = scrSigns(k).join('<br>') + (scrLeft(k) ? '<div class="rec" id="bScr" style="margin-top:6px;text-align:center;opacity:.9">살펴본다</div>' : '');
  v.after(d);
  const b = document.getElementById('bScr'); if (b) b.addEventListener('click', ev => { ev.stopPropagation(); scrOpen(k); });
});
const scrInside = () => genKeys().some(k => S.st[k].sea && S.st[k].replied && !S.st[k].quit);
const scrLeft = k => 2 - (S.st[k].looked || []).length;
function scrOpen(k){
  const s = S.st[k], seen = s.looked || [];
  if (s.sea && seen.includes('tea')) notice('cupfull');
  openOv(`<h3>살펴보기 — ${DEF(k).name}</h3>` + seen.map(id => `<div style="margin:6px 0"><b>${SCR_LOOK[id][0]}</b><br><span style="font-size:13px">${SCR_LOOK[id][s.sea ? 2 : 1]}</span></div>`).join('')
    + (scrLeft(k) ? `<div style="font-size:12px;opacity:.6;margin:8px 0 4px">${KCNT(scrLeft(k))} 가지 더 볼 수 있다.</div>` + Object.keys(SCR_LOOK).filter(id => !seen.includes(id)).map(id => `<div class="rec" data-scr="${id}" style="margin:4px 0;text-align:center">${SCR_LOOK[id][0]}</div>`).join('') : '')
    + '<div class="rec" id="bScrBack" style="margin-top:10px;text-align:center;font-size:13px;opacity:.7">← 지원서로</div>');
  ovBody.querySelectorAll('[data-scr]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); if (!seen.length) S.scrLooked = (S.scrLooked || 0) + 1; s.looked = seen.concat([el.dataset.scr]); save(); scrOpen(k); }));
  document.getElementById('bScrBack').addEventListener('click', ev => { ev.stopPropagation(); readApplicant(k); });
}

// ── 한서진이 대신 면접 ──
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return;
  if (!S.sjInterview && (S.scrLooked || 0) >= K.screenSjAfter && sjFree()){ S.sjInterview = Date.now(); save();
    pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '지원서는 이제 제가 먼저 읽겠습니다.', '대문 앞에서 한 번 보고', '이상한 이는 거기서 돌려보내겠습니다.', '들인 이는 별채 명부에 적어 두겠습니다.'], '한서진 올림.', 'min(44vh,320px)')); }
  if (!S.sjInterview || !ov.classList.contains('hidden') || !sjFree()) return;
  const k = curApplicant(); if (!k || !isGen(k) || Date.now() - S.st[k].at < K.screenSjWait || S.st[k].at < S.sjInterview) return;
  const s = S.st[k], nm = DEF(k).name, letIn = s.sea ? !!S.jin : true;
  if (letIn && freeDesk()){ hire(k); ledger(`한서진이 ${josa(nm, '을', '를')} 들임`); }
  else if (!letIn){ s.gone = true; S.genNext = Date.now() + 210000; save(); ledger(`한서진이 ${josa(nm, '을', '를')} 대문에서 돌려보냄`); if (typeof tlog === 'function') tlog('한서진이 돌려보냄: ' + nm); }
});

// ── 형제 지원자(기획서 19절 '아는 사람 추천', ✳ 11/3): 오래 일한 일반 연구원이 동생을 부름(한 대에 한 번) — 수상할 리 없고 같은 성. 한 사람이 그만두면 남은 사람도 크게 흔들림 ──
HOOK.tick.push(() => { if (S.stage !== 'room' || S.ended) return;
  if (!S.kinAsked && freeDesk() && !curApplicant() && genKeys().filter(k => S.st[k].replied && !S.st[k].quit).length < GEN_MAX){
    const k = genKeys().find(k => { const s = S.st[k]; return s.replied && !s.quit && !s.sea && !s.kin && working(k) && (s.work || 0) >= K.kinWork; });
    if (k){ S.kinAsked = k; S.genN = (S.genN || 0) + 1; const g = stOf('g' + S.genN); g.at = Date.now() + 120000; g.kin = k; g.odd = false; g.sea = false; save();
      pushNote('<h3>쪽지</h3>' + vlet(['가주께.', '제 동생이 글을 압니다.', '방을 보고 오라 했습니다.', '모자라면 제가 가르치겠습니다.'], DEF(k).name + ' 올림.', 'min(40vh,280px)'));
      if (typeof tlog === 'function') tlog('동생을 부름: ' + DEF(k).name); } }
  for (const k of genKeys()){ const s = S.st[k], o = s.kin && S.st[s.kin]; if (!o || !s.replied) continue;
    for (const [a, b] of [[s, o], [o, s]]) if (a.quit && !b.quit && !b.kinShook){ b.kinShook = true; b.fear = Math.max(b.fear || 0, FEAR_AT[5]); save();
      pushNote('<h3>쪽지</h3>' + vlet(['가주께.', (a === s ? '동생이' : josa(DEF(s.kin).name.slice(1), '이', '가')) + (a.sosil || S.seaLured === DEF(a === s ? k : s.kin).name ? ' 밤사이 나가 돌아오지 않습니다.' : ' 그만두었습니다.'), '저도 마음이 편치 않습니다.', '며칠만 더 있어 보겠습니다.'], DEF(a === s ? s.kin : k).name + ' 올림.', 'min(40vh,280px)')); } }
});
HOOK.ov.push(() => { const h = ovBody.querySelector('h3'); if (!h || !h.textContent.startsWith('지원서 — ')) return;
  const k = curApplicant(), s = k && S.st[k]; if (!s || !s.kin) return; const v = ovBody.querySelector('.vletter'); if (!v) return;
  const d = document.createElement('div'); d.style.cssText = 'font-size:13px;opacity:.75;margin-top:8px'; d.textContent = `끝에 한 줄. 「${DEF(s.kin).name}의 동생입니다. ${josa(DEF(s.kin).name.slice(1), '이', '가')} 오라 했습니다.」`; v.after(d); });
